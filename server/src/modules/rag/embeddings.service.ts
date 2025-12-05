import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Document } from '../documents/entities/document.entity';
import { QdrantService } from '../../vector/qdrant.service';
import { ChunkingService } from './chunking.service';

export interface EmbeddingResponse {
  embedding: number[];
}

export interface BatchEmbeddingResult {
  documentId: string;
  chunksEmbedded: number;
  success: boolean;
  error?: string;
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly ollamaHost: string;
  private readonly ollamaPort: number;
  private readonly embeddingModel: string;
  private readonly batchSize = 10;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly qdrantService: QdrantService,
    private readonly chunkingService: ChunkingService,
    private readonly configService: ConfigService,
    @InjectQueue('embeddings')
    private readonly embeddingQueue: Queue,
  ) {
    this.ollamaHost = this.configService.get<string>('OLLAMA_HOST', 'localhost');
    this.ollamaPort = this.configService.get<number>('OLLAMA_PORT', 11434);
    this.embeddingModel = this.configService.get<string>(
      'OLLAMA_EMBEDDING_MODEL',
      'nomic-embed-text',
    );
  }

  /**
   * Generates embeddings for a text using Ollama
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const url = `http://${this.ollamaHost}:${this.ollamaPort}/api/embeddings`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          prompt: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as EmbeddingResponse;

      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid embedding response from Ollama');
      }

      return data.embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Generates embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    this.logger.log(`Generating embeddings for ${texts.length} texts`);

    const embeddings: number[][] = [];

    // Process in batches to avoid overwhelming Ollama
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);

      const batchEmbeddings = await Promise.all(
        batch.map((text) => this.generateEmbedding(text)),
      );

      embeddings.push(...batchEmbeddings);

      this.logger.log(
        `Generated embeddings for batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(texts.length / this.batchSize)}`,
      );
    }

    return embeddings;
  }

  /**
   * Enqueues a document for embedding processing
   */
  async enqueueDocumentEmbedding(documentId: string): Promise<void> {
    this.logger.log(`Enqueuing document ${documentId} for embedding`);

    await this.embeddingQueue.add(
      'embed-document',
      { documentId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  /**
   * Processes document embedding (called by queue worker)
   */
  async processDocumentEmbedding(documentId: string): Promise<BatchEmbeddingResult> {
    this.logger.log(`Processing embedding for document: ${documentId}`);

    try {
      // Update status to processing
      await this.documentRepository.update(documentId, {
        embeddingStatus: 'processing',
        embeddingError: undefined,
      });

      // Fetch document
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['documentType'],
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      if (!document.extractedText) {
        throw new Error(`Document ${documentId} has no extracted text`);
      }

      // Chunk the document text
      const chunks = this.chunkingService.chunkText(document.extractedText, {
        chunkSize: 512,
        chunkOverlap: 50,
        respectParagraphs: true,
      });

      if (chunks.length === 0) {
        throw new Error(`No valid chunks created from document ${documentId}`);
      }

      this.logger.log(`Created ${chunks.length} chunks for document ${documentId}`);

      // Generate embeddings for all chunks
      const chunkTexts = chunks.map((chunk) => chunk.text);
      const embeddings = await this.generateBatchEmbeddings(chunkTexts);

      // Prepare vector points for Qdrant
      const vectorPoints = chunks.map((chunk, index) => ({
        id: `${documentId}-chunk-${chunk.chunkIndex}`,
        vector: embeddings[index],
        payload: {
          document_id: documentId,
          document_type_id: document.documentTypeId,
          document_type_name: document.documentType?.name || '',
          chunk_index: chunk.chunkIndex,
          chunk_text: chunk.text,
          start_offset: chunk.startOffset,
          end_offset: chunk.endOffset,
          token_count: chunk.tokenCount,
          original_filename: document.originalFilename,
          created_at: document.createdAt.toISOString(),
        },
      }));

      // Upsert vectors to Qdrant
      await this.qdrantService.upsertVectors(vectorPoints);

      // Update document status
      await this.documentRepository.update(documentId, {
        embeddingStatus: 'completed',
        embeddedAt: new Date(),
        embeddingError: undefined,
      });

      this.logger.log(
        `Successfully embedded ${chunks.length} chunks for document ${documentId}`,
      );

      return {
        documentId,
        chunksEmbedded: chunks.length,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to process embedding for document ${documentId}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.documentRepository.update(documentId, {
        embeddingStatus: 'failed',
        embeddingError: errorMessage,
      });

      return {
        documentId,
        chunksEmbedded: 0,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Re-embeds a document (useful after updates)
   */
  async reEmbedDocument(documentId: string): Promise<void> {
    this.logger.log(`Re-embedding document: ${documentId}`);

    // Delete existing vectors
    await this.qdrantService.deleteVectorsByDocumentId(documentId);

    // Reset embedding status
    await this.documentRepository.update(documentId, {
      embeddingStatus: 'pending',
      embeddedAt: undefined,
      embeddingError: undefined,
    });

    // Enqueue for processing
    await this.enqueueDocumentEmbedding(documentId);
  }

  /**
   * Checks if Ollama is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `http://${this.ollamaHost}:${this.ollamaPort}/api/tags`;
      const response = await fetch(url, { method: 'GET' });
      return response.ok;
    } catch (error) {
      this.logger.error('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * Gets embedding statistics for a document
   */
  async getDocumentEmbeddingStats(documentId: string): Promise<{
    document_id: string;
    embedding_status: string;
    embedded_at?: Date;
    chunks_count?: number;
    error?: string;
  }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      select: ['id', 'embeddingStatus', 'embeddedAt', 'embeddingError'],
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Count vectors in Qdrant (if embedded)
    let chunksCount: number | undefined;
    if (document.embeddingStatus === 'completed') {
      try {
        const results = await this.qdrantService.searchVectors({
          vector: new Array(768).fill(0),
          limit: 1,
          scoreThreshold: 0,
          filter: { documentTypeId: documentId },
        });
        // This is an approximation - would need a count query
        chunksCount = results.length > 0 ? results.length : 0;
      } catch (error) {
        this.logger.error('Failed to count chunks:', error);
      }
    }

    return {
      document_id: document.id,
      embedding_status: document.embeddingStatus,
      embedded_at: document.embeddedAt,
      chunks_count: chunksCount,
      error: document.embeddingError,
    };
  }
}

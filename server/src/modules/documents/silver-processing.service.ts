import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Document } from './entities/document.entity';
import { SilverChunk, SilverProcessingStatus, ExtractedEntity, SectionHierarchy } from './entities/silver-chunk.entity';
import { GoldDistribution, GoldDistributionStatus } from './entities/gold-distribution.entity';
import { DocumentCategory, GoldLayer } from './entities/document-category.entity';
import { ChunkingService, TextChunk, ChunkingOptions } from '../rag/chunking.service';

export interface SilverProcessingResult {
  documentId: string;
  chunksCreated: number;
  totalTokens: number;
  processingTimeMs: number;
}

export interface EntityExtractionResult {
  type: string;
  value: string;
  confidence: number;
  startOffset?: number;
  endOffset?: number;
}

@Injectable()
export class SilverProcessingService {
  private readonly logger = new Logger(SilverProcessingService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(SilverChunk)
    private readonly silverChunkRepository: Repository<SilverChunk>,
    @InjectRepository(GoldDistribution)
    private readonly goldDistributionRepository: Repository<GoldDistribution>,
    @InjectRepository(DocumentCategory)
    private readonly documentCategoryRepository: Repository<DocumentCategory>,
    @InjectQueue('silver-processing')
    private readonly silverQueue: Queue,
    @InjectQueue('gold-distribution')
    private readonly goldQueue: Queue,
    private readonly chunkingService: ChunkingService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Enqueue document for silver layer processing
   */
  async enqueueForSilverProcessing(documentId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    if (!document.bronzeProcessedAt) {
      throw new Error(`Document ${documentId} has not been processed through bronze layer`);
    }

    if (!document.extractedText) {
      throw new Error(`Document ${documentId} has no extracted text`);
    }

    this.logger.log(`Enqueueing document ${documentId} for silver processing`);

    await this.silverQueue.add(
      'process-silver',
      { documentId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );
  }

  /**
   * Process document through silver layer
   */
  async processDocument(documentId: string): Promise<SilverProcessingResult> {
    const startTime = Date.now();

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['documentType'],
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    if (!document.extractedText) {
      throw new Error(`Document ${documentId} has no extracted text for chunking`);
    }

    // Get document category for RAG config
    let chunkingOptions: ChunkingOptions = {};
    let targetGoldLayers: GoldLayer[] = [GoldLayer.C]; // Default to Gold C (Qdrant)

    if (document.documentCategoryId) {
      const category = await this.documentCategoryRepository.findOne({
        where: { id: document.documentCategoryId },
      });

      if (category) {
        chunkingOptions = {
          chunkSize: category.ragConfig?.chunkSize || 512,
          chunkOverlap: category.ragConfig?.chunkOverlap || 50,
          respectParagraphs: category.ragConfig?.chunkingStrategy === 'paragraph' ||
                            category.ragConfig?.chunkingStrategy === 'semantic',
        };
        targetGoldLayers = category.targetGoldLayers || [GoldLayer.C];
      }
    }

    this.logger.log(`Processing document ${documentId} through silver layer`);

    // Delete existing chunks for this document (in case of reprocessing)
    await this.silverChunkRepository.delete({ documentId });

    // Chunk the document text
    const chunks = this.chunkingService.chunkText(document.extractedText, chunkingOptions);

    this.logger.log(`Created ${chunks.length} chunks for document ${documentId}`);

    // Use transaction for creating chunks and distributions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let totalTokens = 0;
    const createdChunks: SilverChunk[] = [];

    try {
      for (const chunk of chunks) {
        // Extract entities from chunk content
        const extractedEntities = await this.extractEntities(chunk.text);

        // Detect section hierarchy
        const sectionHierarchy = this.detectSectionHierarchy(chunk.text, chunk.chunkIndex);

        // Check for tables and images
        const hasTable = this.detectTable(chunk.text);
        const hasImage = this.detectImage(chunk.text);

        // Create silver chunk
        const silverChunk = this.silverChunkRepository.create({
          documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.text,
          tokenCount: chunk.tokenCount,
          sectionHierarchy,
          hasTable,
          hasImage,
          extractedEntities,
          processingStatus: SilverProcessingStatus.COMPLETED,
        });

        const savedChunk = await queryRunner.manager.save(silverChunk);
        createdChunks.push(savedChunk);
        totalTokens += chunk.tokenCount;

        // Create gold distribution record for each chunk
        const goldDistribution = this.goldDistributionRepository.create({
          silverChunkId: savedChunk.id,
          documentId,
          goldAStatus: targetGoldLayers.includes(GoldLayer.A)
            ? GoldDistributionStatus.PENDING
            : GoldDistributionStatus.SKIPPED,
          goldBStatus: targetGoldLayers.includes(GoldLayer.B)
            ? GoldDistributionStatus.PENDING
            : GoldDistributionStatus.SKIPPED,
          goldCStatus: targetGoldLayers.includes(GoldLayer.C)
            ? GoldDistributionStatus.PENDING
            : GoldDistributionStatus.SKIPPED,
          distributionMetadata: {
            targetLayers: targetGoldLayers,
          },
        });

        await queryRunner.manager.save(goldDistribution);
      }

      // Update document with silver processing info
      await queryRunner.manager
        .createQueryBuilder()
        .update(Document)
        .set({
          silverProcessedAt: new Date(),
          silverChunkCount: chunks.length,
          silverMetadata: {
            totalTokens: totalTokens,
            chunkingOptions: chunkingOptions,
            processedAt: new Date().toISOString(),
          } as Record<string, any>,
          goldDistributionStatus: 'pending' as const,
        })
        .where('id = :id', { id: documentId })
        .execute();

      await queryRunner.commitTransaction();

      const processingTimeMs = Date.now() - startTime;

      this.logger.log(
        `Silver processing completed for document ${documentId}: ${chunks.length} chunks, ${totalTokens} tokens, ${processingTimeMs}ms`,
      );

      // Enqueue for gold distribution
      await this.enqueueForGoldDistribution(documentId);

      return {
        documentId,
        chunksCreated: chunks.length,
        totalTokens,
        processingTimeMs,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Silver processing failed for document ${documentId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Enqueue document for gold layer distribution
   */
  private async enqueueForGoldDistribution(documentId: string): Promise<void> {
    this.logger.log(`Enqueueing document ${documentId} for gold distribution`);

    await this.goldQueue.add(
      'distribute-gold',
      { documentId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );
  }

  /**
   * Extract entities from chunk text (CPF, CNPJ, dates, amounts, etc.)
   */
  private async extractEntities(text: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // CPF pattern: XXX.XXX.XXX-XX
    const cpfPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    let match;
    while ((match = cpfPattern.exec(text)) !== null) {
      entities.push({
        type: 'CPF',
        value: match[0],
        confidence: 0.95,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    // CNPJ pattern: XX.XXX.XXX/XXXX-XX
    const cnpjPattern = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
    while ((match = cnpjPattern.exec(text)) !== null) {
      entities.push({
        type: 'CNPJ',
        value: match[0],
        confidence: 0.95,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    // Date patterns: DD/MM/YYYY or YYYY-MM-DD
    const datePattern1 = /\d{2}\/\d{2}\/\d{4}/g;
    while ((match = datePattern1.exec(text)) !== null) {
      entities.push({
        type: 'DATE',
        value: match[0],
        confidence: 0.9,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    const datePattern2 = /\d{4}-\d{2}-\d{2}/g;
    while ((match = datePattern2.exec(text)) !== null) {
      entities.push({
        type: 'DATE',
        value: match[0],
        confidence: 0.9,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    // Money amounts: R$ X.XXX,XX or R$X.XXX,XX
    const moneyPattern = /R\$\s*[\d.,]+/g;
    while ((match = moneyPattern.exec(text)) !== null) {
      entities.push({
        type: 'MONETARY_VALUE',
        value: match[0],
        confidence: 0.85,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    // PIX key patterns (simplified detection)
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    while ((match = emailPattern.exec(text)) !== null) {
      entities.push({
        type: 'EMAIL',
        value: match[0],
        confidence: 0.9,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    // Phone numbers: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    const phonePattern = /\(\d{2}\)\s*\d{4,5}-\d{4}/g;
    while ((match = phonePattern.exec(text)) !== null) {
      entities.push({
        type: 'PHONE',
        value: match[0],
        confidence: 0.85,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }

    return entities;
  }

  /**
   * Detect section hierarchy from chunk content
   */
  private detectSectionHierarchy(text: string, chunkIndex: number): SectionHierarchy[] {
    const hierarchy: SectionHierarchy[] = [];

    // Look for markdown-style headers
    const headerPattern = /^(#{1,6})\s+(.+)$/gm;
    let match;
    let index = 0;

    while ((match = headerPattern.exec(text)) !== null) {
      hierarchy.push({
        level: match[1].length,
        title: match[2].trim(),
        index: index++,
      });
    }

    // Look for numbered sections (e.g., "1.", "1.1.", "1.1.1.")
    const numberedPattern = /^(\d+(?:\.\d+)*\.?)\s+(.+)$/gm;
    while ((match = numberedPattern.exec(text)) !== null) {
      const level = match[1].split('.').filter(Boolean).length;
      hierarchy.push({
        level,
        title: match[2].trim(),
        index: index++,
      });
    }

    return hierarchy;
  }

  /**
   * Detect if chunk contains a table
   */
  private detectTable(text: string): boolean {
    // Look for markdown table patterns
    const tablePattern = /\|.*\|.*\|/;
    if (tablePattern.test(text)) return true;

    // Look for tab-separated data (potential table)
    const tsvPattern = /\t.*\t/;
    if (tsvPattern.test(text)) return true;

    // Look for ASCII art table borders
    const asciiTablePattern = /[+\-|]{3,}/;
    if (asciiTablePattern.test(text)) return true;

    return false;
  }

  /**
   * Detect if chunk references an image
   */
  private detectImage(text: string): boolean {
    // Markdown image pattern
    const mdImagePattern = /!\[.*?\]\(.*?\)/;
    if (mdImagePattern.test(text)) return true;

    // References to figures or images
    const figurePattern = /(?:figura|figure|imagem|image)\s*\d+/i;
    if (figurePattern.test(text)) return true;

    return false;
  }

  /**
   * Get chunks for a document
   */
  async getDocumentChunks(documentId: string): Promise<SilverChunk[]> {
    return this.silverChunkRepository.find({
      where: { documentId },
      order: { chunkIndex: 'ASC' },
    });
  }

  /**
   * Get gold distribution status for a document
   */
  async getGoldDistributionStatus(documentId: string): Promise<GoldDistribution[]> {
    return this.goldDistributionRepository.find({
      where: { documentId },
      relations: ['silverChunk'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get processing statistics for a document
   */
  async getProcessingStats(documentId: string): Promise<{
    silverChunks: number;
    goldACompleted: number;
    goldBCompleted: number;
    goldCCompleted: number;
    goldAPending: number;
    goldBPending: number;
    goldCPending: number;
  }> {
    const chunks = await this.silverChunkRepository.count({
      where: { documentId },
    });

    const distributions = await this.goldDistributionRepository.find({
      where: { documentId },
    });

    return {
      silverChunks: chunks,
      goldACompleted: distributions.filter(d => d.goldAStatus === GoldDistributionStatus.COMPLETED).length,
      goldBCompleted: distributions.filter(d => d.goldBStatus === GoldDistributionStatus.COMPLETED).length,
      goldCCompleted: distributions.filter(d => d.goldCStatus === GoldDistributionStatus.COMPLETED).length,
      goldAPending: distributions.filter(d => d.goldAStatus === GoldDistributionStatus.PENDING).length,
      goldBPending: distributions.filter(d => d.goldBStatus === GoldDistributionStatus.PENDING).length,
      goldCPending: distributions.filter(d => d.goldCStatus === GoldDistributionStatus.PENDING).length,
    };
  }
}

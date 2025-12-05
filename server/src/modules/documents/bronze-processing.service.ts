import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Document } from './entities/document.entity';
import { S3Service } from '../../storage/s3.service';

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface BronzeMetadata {
  title?: string;
  author?: string;
  date?: string;
  version?: string;
  fileExtension?: string;
  wordCount?: number;
  charCount?: number;
  extractedAt: string;
}

@Injectable()
export class BronzeProcessingService {
  private readonly logger = new Logger(BronzeProcessingService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
    @InjectQueue('bronze-processing')
    private readonly bronzeQueue: Queue,
  ) {}

  /**
   * Enqueues a document for bronze layer processing
   */
  async enqueueDocumentProcessing(documentId: string): Promise<void> {
    this.logger.log(`Enqueuing document ${documentId} for bronze processing`);

    await this.bronzeQueue.add(
      'process-document',
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
   * Main entry point for processing a document
   */
  async processDocument(documentId: string): Promise<Document> {
    this.logger.log(`Starting bronze processing for document: ${documentId}`);

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

      // Download file from MinIO
      const buffer = await this.s3Service.downloadFile(document.fileKey);

      // Extract text based on MIME type
      let extractedText = '';
      if (document.mimeType === 'application/pdf') {
        extractedText = await this.extractTextFromPdf(buffer);
      } else if (document.mimeType === 'text/markdown' || document.originalFilename.endsWith('.md')) {
        extractedText = await this.extractTextFromMarkdown(buffer.toString('utf-8'));
      } else if (document.mimeType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else if (
        document.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        extractedText = await this.extractTextFromDocx(buffer);
      }

      if (!extractedText) {
        throw new Error(`No text could be extracted from document ${documentId}`);
      }

      // Extract metadata
      const metadata = await this.extractMetadata(
        extractedText,
        document.originalFilename,
      );

      // Update document with extracted text and metadata
      await this.documentRepository.update(documentId, {
        extractedText,
        isProcessed: true,
        embeddingStatus: 'completed',
        bronzeProcessedAt: new Date(),
        bronzeMetadata: metadata as any,
      });

      this.logger.log(`Bronze processing completed for document: ${documentId}`);

      // Return updated document
      const updatedDocument = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['documentType'],
      });

      if (!updatedDocument) {
        throw new Error(`Document ${documentId} not found after update`);
      }

      return updatedDocument;
    } catch (error) {
      this.logger.error(`Bronze processing failed for document ${documentId}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.documentRepository.update(documentId, {
        embeddingStatus: 'failed',
        embeddingError: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Extracts text from PDF buffer using pdf-parse
   */
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Extracting text from PDF');
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();

      this.logger.log(`PDF text extraction completed. Length: ${result.text.length} chars`);
      return result.text;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extracts text from Markdown content
   * Removes markdown syntax but preserves structure
   */
  async extractTextFromMarkdown(content: string): Promise<string> {
    try {
      this.logger.log('Extracting text from Markdown');

      // Remove markdown syntax while preserving content
      let text = content
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]+`/g, '')
        // Remove links but keep text: [text](url) -> text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Remove images: ![alt](url) -> alt
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
        // Remove headers: ## Header -> Header
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic: **text** or *text* -> text
        .replace(/\*\*([^\*]+)\*\*/g, '$1')
        .replace(/\*([^\*]+)\*/g, '$1')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      this.logger.log(`Markdown text extraction completed. Length: ${text.length} chars`);
      return text;
    } catch (error) {
      this.logger.error('Failed to extract text from Markdown:', error);
      throw new Error(`Markdown extraction failed: ${error.message}`);
    }
  }

  /**
   * Extracts text from DOCX buffer using mammoth
   */
  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Extracting text from DOCX');
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });

      this.logger.log(`DOCX text extraction completed. Length: ${result.value.length} chars`);
      return result.value;
    } catch (error) {
      this.logger.error('Failed to extract text from DOCX:', error);
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  /**
   * Extracts metadata from text and filename
   */
  async extractMetadata(text: string, filename: string): Promise<BronzeMetadata> {
    this.logger.log('Extracting metadata');

    const metadata: BronzeMetadata = {
      fileExtension: filename.substring(filename.lastIndexOf('.')),
      wordCount: this.countWords(text),
      charCount: text.length,
      extractedAt: new Date().toISOString(),
    };

    // Extract title (first line or heading)
    const titleMatch = text.match(/^#?\s*(.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim().substring(0, 200);
    }

    // Extract author (look for common patterns)
    const authorPatterns = [
      /author[:\s]+([^\n]+)/i,
      /by[:\s]+([^\n]+)/i,
      /written by[:\s]+([^\n]+)/i,
    ];

    for (const pattern of authorPatterns) {
      const match = text.match(pattern);
      if (match) {
        metadata.author = match[1].trim().substring(0, 100);
        break;
      }
    }

    // Extract date (look for common date patterns)
    const datePatterns = [
      /date[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\w+ \d{1,2},? \d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        metadata.date = match[1].trim();
        break;
      }
    }

    // Extract version (look for version patterns)
    const versionPatterns = [
      /version[:\s]+([0-9.]+)/i,
      /v([0-9.]+)/i,
      /ver[:\s]+([0-9.]+)/i,
    ];

    for (const pattern of versionPatterns) {
      const match = text.match(pattern);
      if (match) {
        metadata.version = match[1].trim();
        break;
      }
    }

    this.logger.log(`Metadata extraction completed: ${JSON.stringify(metadata)}`);
    return metadata;
  }

  /**
   * Counts words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Gets processing status for a document
   */
  async getProcessingStatus(documentId: string): Promise<{
    documentId: string;
    status: string;
    processedAt?: Date;
    metadata?: BronzeMetadata;
    error?: string;
  }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      select: [
        'id',
        'embeddingStatus',
        'bronzeProcessedAt',
        'bronzeMetadata',
        'embeddingError',
      ],
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    return {
      documentId: document.id,
      status: document.embeddingStatus,
      processedAt: document.bronzeProcessedAt,
      metadata: document.bronzeMetadata as BronzeMetadata,
      error: document.embeddingError,
    };
  }
}

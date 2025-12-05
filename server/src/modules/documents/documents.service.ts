import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as mammoth from 'mammoth';
import { Document } from './entities/document.entity';
import { DocumentTypesService } from './document-types.service';
import { S3Service } from '../../storage/s3.service';
import {
  GetUploadPresignedUrlInput,
  ConfirmDocumentUploadInput,
} from './dto/upload-document.input';
import { UploadPresignedUrlResponse } from './dto/document.response';
import { DocumentsFilterInput } from './dto/documents-filter.input';
import { EmbeddingsService } from '../rag/embeddings.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly bucket: string;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly documentTypesService: DocumentTypesService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => EmbeddingsService))
    private readonly embeddingsService: EmbeddingsService,
  ) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET_DOCUMENTS', 'documents');
  }

  /**
   * Generates a presigned URL for uploading a document
   */
  async getUploadPresignedUrl(
    input: GetUploadPresignedUrlInput,
    userId: string,
  ): Promise<UploadPresignedUrlResponse> {
    this.logger.log(`Generating upload presigned URL for user: ${userId}`);

    // Validate file against document type rules
    await this.documentTypesService.validateFile(
      input.documentTypeId,
      input.filename,
      input.fileSize,
    );

    // Generate unique file key
    const fileKey = this.s3Service.generateFileKey(input.filename, 'documents');

    // Generate presigned URL (15 minutes expiration)
    const result = await this.s3Service.generateUploadPresignedUrl(
      fileKey,
      input.contentType,
      900,
    );

    this.logger.log(`Presigned URL generated for file key: ${fileKey}`);

    return {
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
      expiresIn: result.expiresIn,
    };
  }

  /**
   * Confirms document upload and stores metadata in database
   */
  async confirmDocumentUpload(
    input: ConfirmDocumentUploadInput,
    userId: string,
  ): Promise<Document> {
    this.logger.log(`Confirming document upload for user: ${userId}, file key: ${input.fileKey}`);

    // Validate document type exists and file is valid
    await this.documentTypesService.validateFile(
      input.documentTypeId,
      input.originalFilename,
      input.fileSize,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create document record
      const document = this.documentRepository.create({
        documentTypeId: input.documentTypeId,
        originalFilename: input.originalFilename,
        storedFilename: input.fileKey.split('/').pop() || input.fileKey,
        fileKey: input.fileKey,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        s3Bucket: this.bucket,
        uploadedBy: userId,
        isProcessed: false,
      });

      const saved = await queryRunner.manager.save(document);

      // Extract text asynchronously (don't wait for it)
      this.extractTextAsync(saved.id, input.fileKey, input.mimeType).catch((error) => {
        this.logger.error(`Failed to extract text from document ${saved.id}:`, error);
      });

      await queryRunner.commitTransaction();

      this.logger.log(`Document confirmed and saved with id: ${saved.id}`);

      // Reload with relations
      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to confirm document upload:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Extracts text from document asynchronously
   */
  private async extractTextAsync(
    documentId: string,
    fileKey: string,
    mimeType: string,
  ): Promise<void> {
    this.logger.log(`Starting text extraction for document: ${documentId}`);

    try {
      let extractedText = '';

      // Download file from S3
      const buffer = await this.s3Service.downloadFile(fileKey);

      // Extract text based on MIME type
      if (mimeType === 'application/pdf') {
        extractedText = await this.extractTextFromPdf(buffer);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        extractedText = await this.extractTextFromDocx(buffer);
      } else if (mimeType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      }

      // Update document with extracted text
      if (extractedText) {
        await this.documentRepository.update(documentId, {
          extractedText,
          isProcessed: true,
        });
        this.logger.log(`Text extraction completed for document: ${documentId}`);

        // Enqueue document for embedding generation
        try {
          await this.embeddingsService.enqueueDocumentEmbedding(documentId);
          this.logger.log(`Document ${documentId} enqueued for embedding`);
        } catch (error) {
          this.logger.error(`Failed to enqueue document ${documentId} for embedding:`, error);
        }
      } else {
        await this.documentRepository.update(documentId, {
          isProcessed: true,
        });
        this.logger.log(`No text extracted from document: ${documentId}`);
      }
    } catch (error) {
      this.logger.error(`Text extraction failed for document ${documentId}:`, error);
      await this.documentRepository.update(documentId, {
        isProcessed: true,
      });
    }
  }

  /**
   * Extracts text from PDF buffer
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF:', error);
      throw error;
    }
  }

  /**
   * Extracts text from DOCX buffer
   */
  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      this.logger.error('Failed to extract text from DOCX:', error);
      throw error;
    }
  }

  /**
   * Finds documents with optional filtering
   */
  async findAll(filter: DocumentsFilterInput): Promise<Document[]> {
    this.logger.log('Finding documents with filter:', filter);

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .orderBy('document.createdAt', 'DESC')
      .take(filter.limit || 20)
      .skip(filter.offset || 0);

    if (filter.documentTypeId) {
      queryBuilder.andWhere('document.documentTypeId = :documentTypeId', {
        documentTypeId: filter.documentTypeId,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Finds a single document by ID
   */
  async findOne(id: string): Promise<Document> {
    this.logger.log(`Finding document with id: ${id}`);

    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['documentType'],
    });

    if (!document) {
      throw new NotFoundException(`Document with id '${id}' not found`);
    }

    return document;
  }

  /**
   * Generates a presigned download URL for a document
   */
  async getDownloadUrl(id: string): Promise<string> {
    this.logger.log(`Generating download URL for document: ${id}`);

    const document = await this.findOne(id);

    const result = await this.s3Service.generateDownloadPresignedUrl(document.fileKey, 3600);

    return result.downloadUrl;
  }

  /**
   * Soft deletes a document
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting document: ${id}`);

    const document = await this.findOne(id);

    await this.documentRepository.softDelete(id);

    // Optionally delete from S3 (can be done asynchronously)
    this.s3Service.deleteFile(document.fileKey).catch((error) => {
      this.logger.error(`Failed to delete file from S3: ${document.fileKey}`, error);
    });

    this.logger.log(`Document soft deleted: ${id}`);
  }

  /**
   * Counts total documents
   */
  async count(filter?: DocumentsFilterInput): Promise<number> {
    const queryBuilder = this.documentRepository.createQueryBuilder('document');

    if (filter?.documentTypeId) {
      queryBuilder.andWhere('document.documentTypeId = :documentTypeId', {
        documentTypeId: filter.documentTypeId,
      });
    }

    return queryBuilder.getCount();
  }
}

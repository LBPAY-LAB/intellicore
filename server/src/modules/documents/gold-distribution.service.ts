import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { SilverChunk } from './entities/silver-chunk.entity';
import { GoldDistribution, GoldDistributionStatus } from './entities/gold-distribution.entity';
import { DocumentCategory, GoldLayer } from './entities/document-category.entity';
import { QdrantService, VectorPoint } from '../../vector/qdrant.service';
import { NebulaService } from '../graph-query/nebula.service';
import { EmbeddingsService } from '../rag/embeddings.service';
import { TrinoService, DocumentChunkRecord } from './trino.service';

export interface GoldDistributionResult {
  documentId: string;
  goldAProcessed: number;
  goldBProcessed: number;
  goldCProcessed: number;
  goldAFailed: number;
  goldBFailed: number;
  goldCFailed: number;
  processingTimeMs: number;
}

export interface TrinoRecord {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  hasTable: boolean;
  hasImage: boolean;
  extractedEntities: string; // JSON string
  categoryName?: string;
  documentFilename?: string;
  createdAt: string;
}

@Injectable()
export class GoldDistributionService {
  private readonly logger = new Logger(GoldDistributionService.name);
  private readonly trinoEnabled: boolean;
  private readonly trinoHost: string;
  private readonly trinoPort: number;
  private readonly trinoCatalog: string;
  private readonly trinoSchema: string;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(SilverChunk)
    private readonly silverChunkRepository: Repository<SilverChunk>,
    @InjectRepository(GoldDistribution)
    private readonly goldDistributionRepository: Repository<GoldDistribution>,
    @InjectRepository(DocumentCategory)
    private readonly documentCategoryRepository: Repository<DocumentCategory>,
    private readonly qdrantService: QdrantService,
    private readonly nebulaService: NebulaService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly trinoService: TrinoService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.trinoEnabled = this.configService.get<boolean>('TRINO_ENABLED', false);
    this.trinoHost = this.configService.get<string>('TRINO_HOST', 'localhost');
    this.trinoPort = this.configService.get<number>('TRINO_PORT', 8080);
    this.trinoCatalog = this.configService.get<string>('TRINO_CATALOG', 'hive');
    this.trinoSchema = this.configService.get<string>('TRINO_SCHEMA', 'intellicore');
  }

  /**
   * Distributes all pending chunks for a document to the appropriate gold layers
   */
  async distributeDocument(documentId: string): Promise<GoldDistributionResult> {
    const startTime = Date.now();

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    // Get document category for target gold layers
    let targetGoldLayers: GoldLayer[] = [GoldLayer.C];
    let categoryName: string | undefined;

    if (document.documentCategoryId) {
      const category = await this.documentCategoryRepository.findOne({
        where: { id: document.documentCategoryId },
      });
      if (category) {
        targetGoldLayers = category.targetGoldLayers || [GoldLayer.C];
        categoryName = category.name;
      }
    }

    // Get pending gold distributions for this document
    const distributions = await this.goldDistributionRepository.find({
      where: { documentId },
      relations: ['silverChunk'],
    });

    if (distributions.length === 0) {
      this.logger.warn(`No gold distributions found for document ${documentId}`);
      return {
        documentId,
        goldAProcessed: 0,
        goldBProcessed: 0,
        goldCProcessed: 0,
        goldAFailed: 0,
        goldBFailed: 0,
        goldCFailed: 0,
        processingTimeMs: Date.now() - startTime,
      };
    }

    const result: GoldDistributionResult = {
      documentId,
      goldAProcessed: 0,
      goldBProcessed: 0,
      goldCProcessed: 0,
      goldAFailed: 0,
      goldBFailed: 0,
      goldCFailed: 0,
      processingTimeMs: 0,
    };

    // Process each distribution
    for (const distribution of distributions) {
      const chunk = distribution.silverChunk;

      // Gold A: Trino Analytics
      if (
        targetGoldLayers.includes(GoldLayer.A) &&
        distribution.goldAStatus === GoldDistributionStatus.PENDING
      ) {
        try {
          await this.distributeToGoldA(distribution, chunk, document, categoryName);
          result.goldAProcessed++;
        } catch (error) {
          this.logger.error(`Gold A distribution failed for chunk ${chunk.id}:`, error);
          result.goldAFailed++;
          await this.updateGoldAStatus(distribution.id, GoldDistributionStatus.FAILED, error);
        }
      }

      // Gold B: NebulaGraph Knowledge Graph
      if (
        targetGoldLayers.includes(GoldLayer.B) &&
        distribution.goldBStatus === GoldDistributionStatus.PENDING
      ) {
        try {
          await this.distributeToGoldB(distribution, chunk, document, categoryName);
          result.goldBProcessed++;
        } catch (error) {
          this.logger.error(`Gold B distribution failed for chunk ${chunk.id}:`, error);
          result.goldBFailed++;
          await this.updateGoldBStatus(distribution.id, GoldDistributionStatus.FAILED, error);
        }
      }

      // Gold C: Qdrant Vector Embeddings
      if (
        targetGoldLayers.includes(GoldLayer.C) &&
        distribution.goldCStatus === GoldDistributionStatus.PENDING
      ) {
        try {
          await this.distributeToGoldC(distribution, chunk, document, categoryName);
          result.goldCProcessed++;
        } catch (error) {
          this.logger.error(`Gold C distribution failed for chunk ${chunk.id}:`, error);
          result.goldCFailed++;
          await this.updateGoldCStatus(distribution.id, GoldDistributionStatus.FAILED, error);
        }
      }
    }

    // Update document gold distribution status
    const allCompleted = await this.checkAllDistributionsComplete(documentId);
    await this.documentRepository.update(documentId, {
      goldDistributionStatus: allCompleted ? 'completed' : 'partial',
      goldADistributedAt: result.goldAProcessed > 0 ? new Date() : undefined,
      goldBDistributedAt: result.goldBProcessed > 0 ? new Date() : undefined,
      goldCDistributedAt: result.goldCProcessed > 0 ? new Date() : undefined,
    });

    result.processingTimeMs = Date.now() - startTime;

    this.logger.log(
      `Gold distribution completed for document ${documentId}: ` +
        `A=${result.goldAProcessed}/${result.goldAFailed}, ` +
        `B=${result.goldBProcessed}/${result.goldBFailed}, ` +
        `C=${result.goldCProcessed}/${result.goldCFailed}`,
    );

    return result;
  }

  /**
   * Distribute chunk to Gold A (Trino Analytics)
   */
  private async distributeToGoldA(
    distribution: GoldDistribution,
    chunk: SilverChunk,
    document: Document,
    categoryName?: string,
  ): Promise<void> {
    // Check if Trino service is ready
    if (!this.trinoService.isReady()) {
      this.logger.log('Trino is not available, skipping Gold A distribution');
      await this.updateGoldAStatus(distribution.id, GoldDistributionStatus.SKIPPED);
      return;
    }

    this.logger.log(`Distributing chunk ${chunk.id} to Gold A (Trino)`);

    const startTime = Date.now();

    // Build the record to insert into Trino
    const record: DocumentChunkRecord = {
      chunk_id: chunk.id,
      document_id: document.id,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      token_count: chunk.tokenCount,
      has_table: chunk.hasTable,
      has_image: chunk.hasImage,
      extracted_entities: JSON.stringify(chunk.extractedEntities),
      category_name: categoryName || '',
      document_filename: document.originalFilename,
      created_at: chunk.createdAt.toISOString(),
    };

    // Insert into Trino using the TrinoService
    await this.trinoService.insertChunk(record);

    const processingDuration = Date.now() - startTime;

    // Update distribution status
    await this.goldDistributionRepository.update(distribution.id, {
      goldARecordId: chunk.id,
      goldAStatus: GoldDistributionStatus.COMPLETED,
      goldADistributedAt: new Date(),
      distributionMetadata: {
        ...distribution.distributionMetadata,
        trinoTable: `memory.intellicore.document_chunks`,
        processingDurationMs: processingDuration,
      },
    });

    this.logger.debug(`Gold A distribution completed for chunk ${chunk.id} in ${processingDuration}ms`);
  }

  /**
   * Distribute chunk to Gold B (NebulaGraph Knowledge Graph)
   */
  private async distributeToGoldB(
    distribution: GoldDistribution,
    chunk: SilverChunk,
    document: Document,
    categoryName?: string,
  ): Promise<void> {
    this.logger.log(`Distributing chunk ${chunk.id} to Gold B (NebulaGraph)`);

    // Create document chunk vertex
    const vertexId = `doc_chunk_${chunk.id.replace(/-/g, '_')}`;

    // Insert vertex for document chunk
    const vertexInserted = await this.nebulaService.insertVertex(vertexId, 'DocumentChunk', {
      document_id: document.id,
      chunk_index: chunk.chunkIndex,
      content_preview: chunk.content.substring(0, 200),
      token_count: chunk.tokenCount,
      has_table: chunk.hasTable,
      has_image: chunk.hasImage,
      category_name: categoryName || '',
      created_at: chunk.createdAt,
    });

    if (!vertexInserted) {
      // NebulaGraph may not be available, mark as skipped
      this.logger.warn(`NebulaGraph not available for chunk ${chunk.id}`);
      await this.updateGoldBStatus(distribution.id, GoldDistributionStatus.SKIPPED);
      return;
    }

    // Create edges for extracted entities
    for (const entity of chunk.extractedEntities) {
      const entityVertexId = `entity_${entity.type}_${entity.value.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Upsert entity vertex
      await this.nebulaService.upsertVertex(entityVertexId, 'Entity', {
        type: entity.type,
        value: entity.value,
        created_at: new Date(),
      });

      // Create edge from chunk to entity
      await this.nebulaService.insertEdge(vertexId, entityVertexId, 'MENTIONS', {
        confidence: entity.confidence,
        created_at: new Date(),
      });
    }

    // Update distribution status
    await this.goldDistributionRepository.update(distribution.id, {
      goldBNodeId: vertexId,
      goldBStatus: GoldDistributionStatus.COMPLETED,
      goldBDistributedAt: new Date(),
      distributionMetadata: {
        ...distribution.distributionMetadata,
        nebulaSpace: 'intellicore',
        nebulaTag: 'DocumentChunk',
      },
    });
  }

  /**
   * Distribute chunk to Gold C (Qdrant Vector Embeddings)
   */
  private async distributeToGoldC(
    distribution: GoldDistribution,
    chunk: SilverChunk,
    document: Document,
    categoryName?: string,
  ): Promise<void> {
    this.logger.log(`Distributing chunk ${chunk.id} to Gold C (Qdrant)`);

    // Generate embedding for chunk content
    const embedding = await this.embeddingsService.generateEmbedding(chunk.content);

    // Create vector point
    const vectorId = `silver_${chunk.id}`;
    const vectorPoint: VectorPoint = {
      id: vectorId,
      vector: embedding,
      payload: {
        document_id: document.id,
        silver_chunk_id: chunk.id,
        chunk_index: chunk.chunkIndex,
        chunk_text: chunk.content,
        token_count: chunk.tokenCount,
        has_table: chunk.hasTable,
        has_image: chunk.hasImage,
        category_name: categoryName || '',
        document_filename: document.originalFilename,
        section_hierarchy: chunk.sectionHierarchy,
        extracted_entities: chunk.extractedEntities,
        created_at: chunk.createdAt.toISOString(),
        source: 'silver_layer',
      },
    };

    // Upsert to Qdrant
    await this.qdrantService.upsertVectors([vectorPoint]);

    // Update distribution status
    await this.goldDistributionRepository.update(distribution.id, {
      goldCVectorId: vectorId,
      goldCStatus: GoldDistributionStatus.COMPLETED,
      goldCDistributedAt: new Date(),
      distributionMetadata: {
        ...distribution.distributionMetadata,
        qdrantCollection: 'document_embeddings',
        embeddingModel: 'nomic-embed-text',
        embeddingDimension: embedding.length,
      },
    });
  }

  /**
   * Update Gold A status
   */
  private async updateGoldAStatus(
    distributionId: string,
    status: GoldDistributionStatus,
    error?: Error,
  ): Promise<void> {
    const update: Partial<GoldDistribution> = {
      goldAStatus: status,
    };

    if (status === GoldDistributionStatus.COMPLETED) {
      update.goldADistributedAt = new Date();
    }

    if (error) {
      const currentDistribution = await this.goldDistributionRepository.findOne({
        where: { id: distributionId },
      });
      update.distributionMetadata = {
        ...currentDistribution?.distributionMetadata,
        lastError: error.message,
        retryCount: (currentDistribution?.distributionMetadata?.retryCount || 0) + 1,
      };
    }

    await this.goldDistributionRepository.update(distributionId, update);
  }

  /**
   * Update Gold B status
   */
  private async updateGoldBStatus(
    distributionId: string,
    status: GoldDistributionStatus,
    error?: Error,
  ): Promise<void> {
    const update: Partial<GoldDistribution> = {
      goldBStatus: status,
    };

    if (status === GoldDistributionStatus.COMPLETED) {
      update.goldBDistributedAt = new Date();
    }

    if (error) {
      const currentDistribution = await this.goldDistributionRepository.findOne({
        where: { id: distributionId },
      });
      update.distributionMetadata = {
        ...currentDistribution?.distributionMetadata,
        lastError: error.message,
        retryCount: (currentDistribution?.distributionMetadata?.retryCount || 0) + 1,
      };
    }

    await this.goldDistributionRepository.update(distributionId, update);
  }

  /**
   * Update Gold C status
   */
  private async updateGoldCStatus(
    distributionId: string,
    status: GoldDistributionStatus,
    error?: Error,
  ): Promise<void> {
    const update: Partial<GoldDistribution> = {
      goldCStatus: status,
    };

    if (status === GoldDistributionStatus.COMPLETED) {
      update.goldCDistributedAt = new Date();
    }

    if (error) {
      const currentDistribution = await this.goldDistributionRepository.findOne({
        where: { id: distributionId },
      });
      update.distributionMetadata = {
        ...currentDistribution?.distributionMetadata,
        lastError: error.message,
        retryCount: (currentDistribution?.distributionMetadata?.retryCount || 0) + 1,
      };
    }

    await this.goldDistributionRepository.update(distributionId, update);
  }

  /**
   * Check if all distributions for a document are complete
   */
  private async checkAllDistributionsComplete(documentId: string): Promise<boolean> {
    const distributions = await this.goldDistributionRepository.find({
      where: { documentId },
    });

    return distributions.every(
      (d) =>
        (d.goldAStatus === GoldDistributionStatus.COMPLETED ||
          d.goldAStatus === GoldDistributionStatus.SKIPPED) &&
        (d.goldBStatus === GoldDistributionStatus.COMPLETED ||
          d.goldBStatus === GoldDistributionStatus.SKIPPED) &&
        (d.goldCStatus === GoldDistributionStatus.COMPLETED ||
          d.goldCStatus === GoldDistributionStatus.SKIPPED),
    );
  }

  /**
   * Retry failed distributions for a document
   */
  async retryFailedDistributions(documentId: string): Promise<GoldDistributionResult> {
    // Reset failed status to pending
    await this.goldDistributionRepository.update(
      { documentId, goldAStatus: GoldDistributionStatus.FAILED },
      { goldAStatus: GoldDistributionStatus.PENDING },
    );
    await this.goldDistributionRepository.update(
      { documentId, goldBStatus: GoldDistributionStatus.FAILED },
      { goldBStatus: GoldDistributionStatus.PENDING },
    );
    await this.goldDistributionRepository.update(
      { documentId, goldCStatus: GoldDistributionStatus.FAILED },
      { goldCStatus: GoldDistributionStatus.PENDING },
    );

    // Re-run distribution
    return this.distributeDocument(documentId);
  }

  /**
   * Get distribution summary for a document
   */
  async getDistributionSummary(documentId: string): Promise<{
    total: number;
    goldA: { completed: number; pending: number; failed: number; skipped: number };
    goldB: { completed: number; pending: number; failed: number; skipped: number };
    goldC: { completed: number; pending: number; failed: number; skipped: number };
  }> {
    const distributions = await this.goldDistributionRepository.find({
      where: { documentId },
    });

    const summary = {
      total: distributions.length,
      goldA: { completed: 0, pending: 0, failed: 0, skipped: 0 },
      goldB: { completed: 0, pending: 0, failed: 0, skipped: 0 },
      goldC: { completed: 0, pending: 0, failed: 0, skipped: 0 },
    };

    for (const d of distributions) {
      // Gold A
      switch (d.goldAStatus) {
        case GoldDistributionStatus.COMPLETED:
          summary.goldA.completed++;
          break;
        case GoldDistributionStatus.PENDING:
          summary.goldA.pending++;
          break;
        case GoldDistributionStatus.FAILED:
          summary.goldA.failed++;
          break;
        case GoldDistributionStatus.SKIPPED:
          summary.goldA.skipped++;
          break;
      }

      // Gold B
      switch (d.goldBStatus) {
        case GoldDistributionStatus.COMPLETED:
          summary.goldB.completed++;
          break;
        case GoldDistributionStatus.PENDING:
          summary.goldB.pending++;
          break;
        case GoldDistributionStatus.FAILED:
          summary.goldB.failed++;
          break;
        case GoldDistributionStatus.SKIPPED:
          summary.goldB.skipped++;
          break;
      }

      // Gold C
      switch (d.goldCStatus) {
        case GoldDistributionStatus.COMPLETED:
          summary.goldC.completed++;
          break;
        case GoldDistributionStatus.PENDING:
          summary.goldC.pending++;
          break;
        case GoldDistributionStatus.FAILED:
          summary.goldC.failed++;
          break;
        case GoldDistributionStatus.SKIPPED:
          summary.goldC.skipped++;
          break;
      }
    }

    return summary;
  }
}

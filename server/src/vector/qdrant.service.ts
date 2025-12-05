import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  payload: Record<string, any>;
}

export interface VectorSearchParams {
  vector: number[];
  limit?: number;
  scoreThreshold?: number;
  filter?: Record<string, any>;
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient;
  private readonly collectionName: string;
  private readonly vectorSize: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('QDRANT_HOST', 'localhost');
    const port = this.configService.get<number>('QDRANT_PORT', 6333);

    this.client = new QdrantClient({
      url: `http://${host}:${port}`,
    });

    this.collectionName = this.configService.get<string>(
      'QDRANT_COLLECTION_NAME',
      'document_embeddings',
    );
    this.vectorSize = this.configService.get<number>('EMBEDDING_DIMENSIONS', 768);
  }

  private isAvailable = false;
  private initialized = false;

  async onModuleInit() {
    // Don't try to connect during startup - let it be lazy
    this.logger.log('QdrantService registered (connection will be established on first use)');
  }

  /**
   * Lazy initialization - only connect when first used
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) {
      return this.isAvailable;
    }
    this.initialized = true;

    try {
      await this.ensureCollectionExists();
      this.isAvailable = true;
      this.logger.log('Qdrant service connected successfully');
      return true;
    } catch (error) {
      this.logger.warn('Qdrant service unavailable - vector search will be disabled');
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Checks if Qdrant service is available
   */
  get available(): boolean {
    return this.isAvailable;
  }

  /**
   * Ensures the collection exists, creates it if not
   * Non-fatal: logs warning but doesn't crash if Qdrant is unavailable
   */
  async ensureCollectionExists(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === this.collectionName,
      );

      if (!exists) {
        this.logger.log(`Creating collection: ${this.collectionName}`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
          optimizers_config: {
            indexing_threshold: 10000,
          },
          hnsw_config: {
            m: 16,
            ef_construct: 100,
          },
        });
        this.logger.log(`Collection created: ${this.collectionName}`);
      } else {
        this.logger.log(`Collection already exists: ${this.collectionName}`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure collection exists:', error);
      throw error;
    }
  }

  /**
   * Checks if Qdrant service is healthy
   */
  async healthCheck(): Promise<boolean> {
    if (!(await this.ensureInitialized())) {
      return false;
    }
    try {
      const collections = await this.client.getCollections();
      return collections.collections !== undefined;
    } catch (error) {
      this.logger.error('Qdrant health check failed:', error);
      return false;
    }
  }

  /**
   * Upserts vector points into the collection
   */
  async upsertVectors(points: VectorPoint[]): Promise<void> {
    if (!(await this.ensureInitialized())) {
      this.logger.warn('Qdrant unavailable - skipping vector upsert');
      return;
    }
    try {
      this.logger.log(`Upserting ${points.length} vectors to collection`);

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: points.map((point) => ({
          id: point.id,
          vector: point.vector,
          payload: point.payload,
        })),
      });

      this.logger.log(`Successfully upserted ${points.length} vectors`);
    } catch (error) {
      this.logger.error('Failed to upsert vectors:', error);
      throw error;
    }
  }

  /**
   * Searches for similar vectors
   */
  async searchVectors(params: VectorSearchParams): Promise<SearchResult[]> {
    if (!(await this.ensureInitialized())) {
      this.logger.warn('Qdrant unavailable - returning empty search results');
      return [];
    }
    try {
      const {
        vector,
        limit = 10,
        scoreThreshold = 0.7,
        filter,
      } = params;

      this.logger.log(`Searching vectors with limit: ${limit}, threshold: ${scoreThreshold}`);

      const searchResult = await this.client.search(this.collectionName, {
        vector,
        limit,
        score_threshold: scoreThreshold,
        filter: filter ? { must: [{ key: 'document_type_id', match: { value: filter.documentTypeId } }] } : undefined,
        with_payload: true,
      });

      const results: SearchResult[] = searchResult.map((result) => ({
        id: result.id.toString(),
        score: result.score,
        payload: result.payload as Record<string, any>,
      }));

      this.logger.log(`Found ${results.length} similar vectors`);

      return results;
    } catch (error) {
      this.logger.error('Failed to search vectors:', error);
      throw error;
    }
  }

  /**
   * Deletes vectors by IDs
   */
  async deleteVectors(ids: string[]): Promise<void> {
    if (!(await this.ensureInitialized())) {
      this.logger.warn('Qdrant unavailable - skipping vector deletion');
      return;
    }
    try {
      this.logger.log(`Deleting ${ids.length} vectors`);

      await this.client.delete(this.collectionName, {
        wait: true,
        points: ids,
      });

      this.logger.log(`Successfully deleted ${ids.length} vectors`);
    } catch (error) {
      this.logger.error('Failed to delete vectors:', error);
      throw error;
    }
  }

  /**
   * Deletes vectors by document ID
   */
  async deleteVectorsByDocumentId(documentId: string): Promise<void> {
    if (!(await this.ensureInitialized())) {
      this.logger.warn('Qdrant unavailable - skipping vector deletion by document ID');
      return;
    }
    try {
      this.logger.log(`Deleting vectors for document: ${documentId}`);

      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'document_id',
              match: { value: documentId },
            },
          ],
        },
      });

      this.logger.log(`Successfully deleted vectors for document: ${documentId}`);
    } catch (error) {
      this.logger.error('Failed to delete vectors by document ID:', error);
      throw error;
    }
  }

  /**
   * Gets collection info
   */
  async getCollectionInfo(): Promise<any> {
    if (!(await this.ensureInitialized())) {
      return null;
    }
    try {
      return await this.client.getCollection(this.collectionName);
    } catch (error) {
      this.logger.error('Failed to get collection info:', error);
      throw error;
    }
  }

  /**
   * Counts vectors in collection
   */
  async countVectors(): Promise<number> {
    if (!(await this.ensureInitialized())) {
      return 0;
    }
    try {
      const info = await this.getCollectionInfo();
      return info?.points_count || 0;
    } catch (error) {
      this.logger.error('Failed to count vectors:', error);
      throw error;
    }
  }
}

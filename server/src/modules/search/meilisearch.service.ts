/**
 * MeilisearchService
 * Sprint 12 - US-057: Meilisearch Integration
 *
 * Service for interacting with Meilisearch for full-text search
 * on instances and other entities.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index, SearchResponse, SearchParams } from 'meilisearch';

export interface InstanceDocument {
  id: string;
  objectTypeId: string;
  objectTypeName: string;
  displayName: string;
  status: string;
  data: Record<string, unknown>;
  dataFlattened: string; // Flattened JSON for full-text search
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult<T> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

const INSTANCES_INDEX = 'instances';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private instancesIndex: Index<InstanceDocument>;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MEILI_HOST', 'http://localhost:7700');
    const apiKey = this.configService.get<string>('MEILI_MASTER_KEY', 'lbpay_dev_master_key');

    this.client = new MeiliSearch({
      host,
      apiKey,
    });

    this.logger.log(`Meilisearch client initialized for ${host}`);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.setupIndices();
      this.logger.log('Meilisearch indices initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch indices', error);
    }
  }

  /**
   * Setup and configure Meilisearch indices
   */
  private async setupIndices(): Promise<void> {
    // Create instances index if not exists
    try {
      await this.client.createIndex(INSTANCES_INDEX, { primaryKey: 'id' });
      this.logger.log(`Created index: ${INSTANCES_INDEX}`);
    } catch (error: unknown) {
      // Index might already exist, which is fine
      const err = error as { code?: string };
      if (err.code !== 'index_already_exists') {
        throw error;
      }
    }

    this.instancesIndex = this.client.index<InstanceDocument>(INSTANCES_INDEX);

    // Configure searchable attributes
    await this.instancesIndex.updateSearchableAttributes([
      'displayName',
      'objectTypeName',
      'dataFlattened',
      'status',
    ]);

    // Configure filterable attributes
    await this.instancesIndex.updateFilterableAttributes([
      'objectTypeId',
      'objectTypeName',
      'status',
      'createdBy',
      'createdAt',
      'updatedAt',
    ]);

    // Configure sortable attributes
    await this.instancesIndex.updateSortableAttributes([
      'displayName',
      'createdAt',
      'updatedAt',
    ]);

    // Configure ranking rules
    await this.instancesIndex.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ]);

    // Configure faceting
    await this.instancesIndex.updateFaceting({
      maxValuesPerFacet: 100,
    });

    this.logger.log('Meilisearch index configuration complete');
  }

  /**
   * Index a single instance document
   */
  async indexInstance(document: InstanceDocument): Promise<void> {
    try {
      await this.instancesIndex.addDocuments([document]);
      this.logger.debug(`Indexed instance: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to index instance ${document.id}`, error);
      throw error;
    }
  }

  /**
   * Index multiple instance documents
   */
  async indexInstances(documents: InstanceDocument[]): Promise<void> {
    if (documents.length === 0) return;

    try {
      await this.instancesIndex.addDocuments(documents);
      this.logger.log(`Indexed ${documents.length} instances`);
    } catch (error) {
      this.logger.error(`Failed to index ${documents.length} instances`, error);
      throw error;
    }
  }

  /**
   * Update an indexed instance document
   */
  async updateInstance(document: Partial<InstanceDocument> & { id: string }): Promise<void> {
    try {
      await this.instancesIndex.updateDocuments([document]);
      this.logger.debug(`Updated indexed instance: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to update indexed instance ${document.id}`, error);
      throw error;
    }
  }

  /**
   * Delete an instance from the index
   */
  async deleteInstance(id: string): Promise<void> {
    try {
      await this.instancesIndex.deleteDocument(id);
      this.logger.debug(`Deleted indexed instance: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete indexed instance ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete multiple instances from the index
   */
  async deleteInstances(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    try {
      await this.instancesIndex.deleteDocuments(ids);
      this.logger.log(`Deleted ${ids.length} indexed instances`);
    } catch (error) {
      this.logger.error(`Failed to delete ${ids.length} indexed instances`, error);
      throw error;
    }
  }

  /**
   * Search instances with full-text query and filters
   */
  async searchInstances(
    query: string,
    options?: {
      filter?: string | string[];
      sort?: string[];
      limit?: number;
      offset?: number;
      facets?: string[];
    }
  ): Promise<SearchResult<InstanceDocument>> {
    const searchParams: SearchParams = {
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
      ...(options?.filter && { filter: options.filter }),
      ...(options?.sort && { sort: options.sort }),
      ...(options?.facets && { facets: options.facets }),
    };

    try {
      const response: SearchResponse<InstanceDocument> = await this.instancesIndex.search(
        query,
        searchParams
      );

      return {
        hits: response.hits,
        query: response.query,
        processingTimeMs: response.processingTimeMs,
        limit: response.limit ?? 20,
        offset: response.offset ?? 0,
        estimatedTotalHits: response.estimatedTotalHits ?? 0,
        facetDistribution: response.facetDistribution,
      };
    } catch (error) {
      this.logger.error(`Search failed for query: ${query}`, error);
      throw error;
    }
  }

  /**
   * Search instances by ObjectType
   */
  async searchByObjectType(
    objectTypeId: string,
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SearchResult<InstanceDocument>> {
    return this.searchInstances(query, {
      filter: `objectTypeId = "${objectTypeId}"`,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Search instances by status
   */
  async searchByStatus(
    status: string,
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SearchResult<InstanceDocument>> {
    return this.searchInstances(query, {
      filter: `status = "${status}"`,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Get facets for filtering UI
   */
  async getFacets(query = ''): Promise<Record<string, Record<string, number>>> {
    const result = await this.searchInstances(query, {
      limit: 0,
      facets: ['objectTypeName', 'status', 'createdBy'],
    });

    return result.facetDistribution ?? {};
  }

  /**
   * Clear all documents from the instances index
   */
  async clearInstancesIndex(): Promise<void> {
    try {
      await this.instancesIndex.deleteAllDocuments();
      this.logger.log('Cleared all documents from instances index');
    } catch (error) {
      this.logger.error('Failed to clear instances index', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<{
    numberOfDocuments: number;
    isIndexing: boolean;
    fieldDistribution: Record<string, number>;
  }> {
    const stats = await this.instancesIndex.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
      fieldDistribution: stats.fieldDistribution,
    };
  }

  /**
   * Health check for Meilisearch connection
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    version?: string;
    error?: string;
  }> {
    try {
      const health = await this.client.health();
      const version = await this.client.getVersion();

      return {
        healthy: health.status === 'available',
        version: version.pkgVersion,
      };
    } catch (error) {
      const err = error as Error;
      return {
        healthy: false,
        error: err.message,
      };
    }
  }

  /**
   * Get the raw Meilisearch client for advanced operations
   */
  getClient(): MeiliSearch {
    return this.client;
  }
}

/**
 * InstanceSearchService
 * Sprint 12 - US-057: Meilisearch Integration
 *
 * Service for indexing and searching instances using Meilisearch.
 * Handles the mapping between Instance entities and search documents.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MeilisearchService, InstanceDocument, SearchResult } from './meilisearch.service';
import { InstanceEntity, InstanceStatus } from '../instances/entities/instance.entity';

export interface InstanceSearchFilters {
  objectTypeId?: string;
  objectTypeName?: string;
  status?: InstanceStatus | InstanceStatus[];
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface InstanceSearchOptions {
  query?: string;
  filters?: InstanceSearchFilters;
  sort?: 'relevance' | 'createdAt:asc' | 'createdAt:desc' | 'displayName:asc' | 'displayName:desc';
  limit?: number;
  offset?: number;
  includeFacets?: boolean;
}

export interface InstanceSearchResponse {
  instances: InstanceEntity[];
  query: string;
  processingTimeMs: number;
  total: number;
  limit: number;
  offset: number;
  facets?: {
    objectTypes: Record<string, number>;
    statuses: Record<string, number>;
    creators: Record<string, number>;
  };
}

@Injectable()
export class InstanceSearchService {
  private readonly logger = new Logger(InstanceSearchService.name);

  constructor(
    private readonly meilisearchService: MeilisearchService,
    @InjectRepository(InstanceEntity)
    private readonly instanceRepository: Repository<InstanceEntity>,
  ) {}

  /**
   * Convert Instance entity to search document
   */
  private instanceToDocument(instance: InstanceEntity): InstanceDocument {
    return {
      id: instance.id,
      objectTypeId: instance.objectTypeId,
      objectTypeName: instance.objectType?.name ?? '',
      displayName: instance.displayName ?? '',
      status: instance.status,
      data: instance.data,
      dataFlattened: this.flattenData(instance.data),
      createdBy: instance.createdBy,
      createdAt: instance.createdAt.getTime(),
      updatedAt: instance.updatedAt.getTime(),
    };
  }

  /**
   * Flatten JSON data for full-text search
   */
  private flattenData(data: Record<string, unknown>): string {
    const values: string[] = [];

    const extract = (obj: unknown, prefix = ''): void => {
      if (obj === null || obj === undefined) return;

      if (typeof obj === 'string') {
        values.push(obj);
      } else if (typeof obj === 'number' || typeof obj === 'boolean') {
        values.push(String(obj));
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => extract(item, `${prefix}[${index}]`));
      } else if (typeof obj === 'object') {
        Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
          extract(value, prefix ? `${prefix}.${key}` : key);
        });
      }
    };

    extract(data);
    return values.join(' ');
  }

  /**
   * Index a single instance
   */
  async indexInstance(instance: InstanceEntity): Promise<void> {
    const document = this.instanceToDocument(instance);
    await this.meilisearchService.indexInstance(document);
    this.logger.debug(`Indexed instance ${instance.id}`);
  }

  /**
   * Index multiple instances
   */
  async indexInstances(instances: InstanceEntity[]): Promise<void> {
    const documents = instances.map((i) => this.instanceToDocument(i));
    await this.meilisearchService.indexInstances(documents);
    this.logger.log(`Indexed ${instances.length} instances`);
  }

  /**
   * Update an instance in the search index
   */
  async updateInstanceIndex(instance: InstanceEntity): Promise<void> {
    const document = this.instanceToDocument(instance);
    await this.meilisearchService.updateInstance(document);
    this.logger.debug(`Updated index for instance ${instance.id}`);
  }

  /**
   * Remove an instance from the search index
   */
  async removeFromIndex(instanceId: string): Promise<void> {
    await this.meilisearchService.deleteInstance(instanceId);
    this.logger.debug(`Removed instance ${instanceId} from index`);
  }

  /**
   * Build Meilisearch filter string from filters object
   */
  private buildFilterString(filters: InstanceSearchFilters): string[] {
    const filterParts: string[] = [];

    if (filters.objectTypeId) {
      filterParts.push(`objectTypeId = "${filters.objectTypeId}"`);
    }

    if (filters.objectTypeName) {
      filterParts.push(`objectTypeName = "${filters.objectTypeName}"`);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        const statusFilters = filters.status.map((s) => `status = "${s}"`);
        filterParts.push(`(${statusFilters.join(' OR ')})`);
      } else {
        filterParts.push(`status = "${filters.status}"`);
      }
    }

    if (filters.createdBy) {
      filterParts.push(`createdBy = "${filters.createdBy}"`);
    }

    if (filters.createdAfter) {
      filterParts.push(`createdAt >= ${filters.createdAfter.getTime()}`);
    }

    if (filters.createdBefore) {
      filterParts.push(`createdAt <= ${filters.createdBefore.getTime()}`);
    }

    return filterParts;
  }

  /**
   * Search instances with full-text query and filters
   */
  async search(options: InstanceSearchOptions = {}): Promise<InstanceSearchResponse> {
    const {
      query = '',
      filters = {},
      sort = 'relevance',
      limit = 20,
      offset = 0,
      includeFacets = false,
    } = options;

    // Build filter string
    const filterParts = this.buildFilterString(filters);

    // Build sort array
    const sortArray: string[] = [];
    if (sort !== 'relevance') {
      sortArray.push(sort);
    }

    // Perform search
    const searchResult: SearchResult<InstanceDocument> = await this.meilisearchService.searchInstances(
      query,
      {
        filter: filterParts.length > 0 ? filterParts : undefined,
        sort: sortArray.length > 0 ? sortArray : undefined,
        limit,
        offset,
        facets: includeFacets ? ['objectTypeName', 'status', 'createdBy'] : undefined,
      }
    );

    // Fetch full instance entities from database
    const instanceIds = searchResult.hits.map((h) => h.id);
    let instances: InstanceEntity[] = [];

    if (instanceIds.length > 0) {
      instances = await this.instanceRepository.find({
        where: { id: In(instanceIds) },
        relations: ['objectType'],
      });

      // Maintain search result order
      const instanceMap = new Map(instances.map((i) => [i.id, i]));
      instances = instanceIds
        .map((id) => instanceMap.get(id))
        .filter((i): i is InstanceEntity => i !== undefined);
    }

    // Build response
    const response: InstanceSearchResponse = {
      instances,
      query: searchResult.query,
      processingTimeMs: searchResult.processingTimeMs,
      total: searchResult.estimatedTotalHits,
      limit: searchResult.limit,
      offset: searchResult.offset,
    };

    // Add facets if requested
    if (includeFacets && searchResult.facetDistribution) {
      response.facets = {
        objectTypes: searchResult.facetDistribution['objectTypeName'] ?? {},
        statuses: searchResult.facetDistribution['status'] ?? {},
        creators: searchResult.facetDistribution['createdBy'] ?? {},
      };
    }

    return response;
  }

  /**
   * Reindex all instances from database
   */
  async reindexAll(): Promise<{ indexed: number; failed: number }> {
    this.logger.log('Starting full reindex of all instances');

    // Clear existing index
    await this.meilisearchService.clearInstancesIndex();

    // Fetch all active instances
    const instances = await this.instanceRepository.find({
      where: { isActive: true },
      relations: ['objectType'],
    });

    if (instances.length === 0) {
      this.logger.log('No instances to index');
      return { indexed: 0, failed: 0 };
    }

    // Index in batches
    const batchSize = 100;
    let indexed = 0;
    let failed = 0;

    for (let i = 0; i < instances.length; i += batchSize) {
      const batch = instances.slice(i, i + batchSize);
      try {
        await this.indexInstances(batch);
        indexed += batch.length;
      } catch (error) {
        this.logger.error(`Failed to index batch starting at ${i}`, error);
        failed += batch.length;
      }
    }

    this.logger.log(`Reindex complete: ${indexed} indexed, ${failed} failed`);
    return { indexed, failed };
  }

  /**
   * Sync a specific instance with the search index
   */
  async syncInstance(instanceId: string): Promise<void> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
      relations: ['objectType'],
    });

    if (!instance) {
      // Instance was deleted, remove from index
      await this.removeFromIndex(instanceId);
      return;
    }

    if (!instance.isActive) {
      // Instance is soft-deleted, remove from index
      await this.removeFromIndex(instanceId);
      return;
    }

    // Update in index
    await this.updateInstanceIndex(instance);
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(
    partialQuery: string,
    filters?: InstanceSearchFilters,
  ): Promise<string[]> {
    const result = await this.search({
      query: partialQuery,
      filters,
      limit: 5,
    });

    // Extract unique display names for suggestions
    const suggestions = result.instances
      .map((i) => i.displayName)
      .filter((name): name is string => !!name);

    return [...new Set(suggestions)];
  }

  /**
   * Get search statistics
   */
  async getStats(): Promise<{
    totalIndexed: number;
    isIndexing: boolean;
    fieldDistribution: Record<string, number>;
  }> {
    const stats = await this.meilisearchService.getIndexStats();
    return {
      totalIndexed: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
      fieldDistribution: stats.fieldDistribution,
    };
  }
}

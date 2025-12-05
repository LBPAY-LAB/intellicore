/**
 * SearchResolver
 * Sprint 12 - US-057: Meilisearch Integration
 *
 * GraphQL resolver for instance search operations.
 */

import { Resolver, Query, Mutation, Args, Int, ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Public } from '../../auth/decorators/public.decorator';
import { Auth } from '../../auth/decorators/auth.decorator';
import { InstanceSearchService, InstanceSearchOptions, InstanceSearchFilters } from './instance-search.service';
import { MeilisearchService } from './meilisearch.service';
import { InstanceEntity, InstanceStatus } from '../instances/entities/instance.entity';

// Register InstanceStatus enum for GraphQL
registerEnumType(InstanceStatus, {
  name: 'InstanceStatus',
  description: 'Status of an instance in its lifecycle',
});

// GraphQL Input Types
@InputType()
class SearchFiltersInput {
  @Field(() => String, { nullable: true })
  objectTypeId?: string;

  @Field(() => String, { nullable: true })
  objectTypeName?: string;

  @Field(() => [InstanceStatus], { nullable: true })
  status?: InstanceStatus[];

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => Date, { nullable: true })
  createdAfter?: Date;

  @Field(() => Date, { nullable: true })
  createdBefore?: Date;
}

@InputType()
class SearchInstancesInput {
  @Field(() => String, { defaultValue: '' })
  query: string = '';

  @Field(() => SearchFiltersInput, { nullable: true })
  filters?: SearchFiltersInput;

  @Field(() => String, { defaultValue: 'relevance' })
  sort: string = 'relevance';

  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;

  @Field(() => Int, { defaultValue: 0 })
  offset: number = 0;

  @Field(() => Boolean, { defaultValue: false })
  includeFacets: boolean = false;
}

// GraphQL Output Types
@ObjectType()
class SearchFacets {
  @Field(() => String)
  objectTypes: string; // JSON string of Record<string, number>

  @Field(() => String)
  statuses: string; // JSON string of Record<string, number>

  @Field(() => String)
  creators: string; // JSON string of Record<string, number>
}

@ObjectType()
class SearchInstancesResponse {
  @Field(() => [InstanceEntity])
  instances: InstanceEntity[];

  @Field(() => String)
  query: string;

  @Field(() => Int)
  processingTimeMs: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;

  @Field(() => SearchFacets, { nullable: true })
  facets?: SearchFacets;
}

@ObjectType()
class SearchStatsResponse {
  @Field(() => Int)
  totalIndexed: number;

  @Field(() => Boolean)
  isIndexing: boolean;

  @Field(() => String)
  fieldDistribution: string; // JSON string
}

@ObjectType()
class SearchHealthResponse {
  @Field(() => Boolean)
  healthy: boolean;

  @Field(() => String, { nullable: true })
  version?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}

@ObjectType()
class ReindexResponse {
  @Field(() => Int)
  indexed: number;

  @Field(() => Int)
  failed: number;
}

@Resolver()
export class SearchResolver {
  constructor(
    private readonly instanceSearchService: InstanceSearchService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  /**
   * Search instances with full-text query and filters
   */
  @Public()
  @Query(() => SearchInstancesResponse, { name: 'searchInstances' })
  async searchInstances(
    @Args('input') input: SearchInstancesInput,
  ): Promise<SearchInstancesResponse> {
    // Convert input to service options
    const filters: InstanceSearchFilters = {};
    if (input.filters) {
      if (input.filters.objectTypeId) filters.objectTypeId = input.filters.objectTypeId;
      if (input.filters.objectTypeName) filters.objectTypeName = input.filters.objectTypeName;
      if (input.filters.status) filters.status = input.filters.status;
      if (input.filters.createdBy) filters.createdBy = input.filters.createdBy;
      if (input.filters.createdAfter) filters.createdAfter = input.filters.createdAfter;
      if (input.filters.createdBefore) filters.createdBefore = input.filters.createdBefore;
    }

    const options: InstanceSearchOptions = {
      query: input.query,
      filters,
      sort: input.sort as InstanceSearchOptions['sort'],
      limit: input.limit,
      offset: input.offset,
      includeFacets: input.includeFacets,
    };

    const result = await this.instanceSearchService.search(options);

    // Convert facets to JSON strings for GraphQL
    const response: SearchInstancesResponse = {
      instances: result.instances,
      query: result.query,
      processingTimeMs: result.processingTimeMs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };

    if (result.facets) {
      response.facets = {
        objectTypes: JSON.stringify(result.facets.objectTypes),
        statuses: JSON.stringify(result.facets.statuses),
        creators: JSON.stringify(result.facets.creators),
      };
    }

    return response;
  }

  /**
   * Get search suggestions for autocomplete
   */
  @Public()
  @Query(() => [String], { name: 'searchSuggestions' })
  async searchSuggestions(
    @Args('query') query: string,
    @Args('objectTypeId', { nullable: true }) objectTypeId?: string,
  ): Promise<string[]> {
    return this.instanceSearchService.getSuggestions(
      query,
      objectTypeId ? { objectTypeId } : undefined,
    );
  }

  /**
   * Get search index statistics
   */
  @Public()
  @Query(() => SearchStatsResponse, { name: 'searchStats' })
  async searchStats(): Promise<SearchStatsResponse> {
    const stats = await this.instanceSearchService.getStats();
    return {
      totalIndexed: stats.totalIndexed,
      isIndexing: stats.isIndexing,
      fieldDistribution: JSON.stringify(stats.fieldDistribution),
    };
  }

  /**
   * Health check for search service
   */
  @Public()
  @Query(() => SearchHealthResponse, { name: 'searchHealth' })
  async searchHealth(): Promise<SearchHealthResponse> {
    return this.meilisearchService.healthCheck();
  }

  /**
   * Reindex all instances (admin only)
   */
  @Auth('admin')
  @Mutation(() => ReindexResponse, { name: 'reindexInstances' })
  async reindexInstances(): Promise<ReindexResponse> {
    return this.instanceSearchService.reindexAll();
  }

  /**
   * Sync a specific instance with search index (admin only)
   */
  @Auth('admin')
  @Mutation(() => Boolean, { name: 'syncInstanceIndex' })
  async syncInstanceIndex(
    @Args('instanceId') instanceId: string,
  ): Promise<boolean> {
    await this.instanceSearchService.syncInstance(instanceId);
    return true;
  }
}

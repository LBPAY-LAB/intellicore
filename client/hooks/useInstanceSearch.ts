/**
 * useInstanceSearch Hook
 * Sprint 12 - US-058: Advanced Search UI
 *
 * Hook for searching instances using Meilisearch via GraphQL.
 */

'use client';

import { useState, useCallback } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  SEARCH_INSTANCES,
  SEARCH_SUGGESTIONS,
  SEARCH_STATS,
  SEARCH_HEALTH,
  REINDEX_INSTANCES,
  SearchInstancesInput,
  SearchInstancesResponse,
  SearchSuggestionsResponse,
  SearchStatsResponse,
  SearchHealthResponse,
  ReindexInstancesResponse,
  SearchInstancesResult,
  SearchStatsResult,
  SearchHealthResult,
  ReindexResult,
  ParsedFacets,
  parseFacets,
  InstanceStatus,
} from '@/lib/graphql/search';

export interface InstanceSearchOptions {
  query: string;
  filters?: {
    objectTypeId?: string;
    objectTypeName?: string;
    status?: InstanceStatus[];
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  };
  sort?: 'relevance' | 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  limit?: number;
  offset?: number;
  includeFacets?: boolean;
}

export interface InstanceSearchResult extends Omit<SearchInstancesResult, 'facets'> {
  facets?: ParsedFacets;
}

export interface UseInstanceSearchReturn {
  // Search
  search: (options: InstanceSearchOptions) => Promise<InstanceSearchResult | null>;
  searchResult: InstanceSearchResult | null;
  loading: boolean;
  error: Error | null;

  // Suggestions
  getSuggestions: (query: string, objectTypeId?: string) => Promise<string[]>;
  suggestionsLoading: boolean;

  // Stats & Health
  getStats: () => Promise<SearchStatsResult | null>;
  stats: SearchStatsResult | null;
  statsLoading: boolean;

  getHealth: () => Promise<SearchHealthResult | null>;
  health: SearchHealthResult | null;
  healthLoading: boolean;

  // Admin
  reindex: () => Promise<ReindexResult | null>;
  reindexing: boolean;

  // Clear
  clearResults: () => void;
}

export function useInstanceSearch(): UseInstanceSearchReturn {
  const [searchResult, setSearchResult] = useState<InstanceSearchResult | null>(null);
  const [stats, setStats] = useState<SearchStatsResult | null>(null);
  const [health, setHealth] = useState<SearchHealthResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Search query
  const [executeSearch, { loading }] = useLazyQuery<SearchInstancesResponse>(
    SEARCH_INSTANCES,
    { fetchPolicy: 'network-only' }
  );

  // Suggestions query
  const [executeSuggestions, { loading: suggestionsLoading }] = useLazyQuery<SearchSuggestionsResponse>(
    SEARCH_SUGGESTIONS,
    { fetchPolicy: 'network-only' }
  );

  // Stats query
  const [executeStats, { loading: statsLoading }] = useLazyQuery<SearchStatsResponse>(
    SEARCH_STATS,
    { fetchPolicy: 'network-only' }
  );

  // Health query
  const [executeHealth, { loading: healthLoading }] = useLazyQuery<SearchHealthResponse>(
    SEARCH_HEALTH,
    { fetchPolicy: 'network-only' }
  );

  // Reindex mutation
  const [executeReindex, { loading: reindexing }] = useMutation<ReindexInstancesResponse>(
    REINDEX_INSTANCES
  );

  const search = useCallback(
    async (options: InstanceSearchOptions): Promise<InstanceSearchResult | null> => {
      try {
        setError(null);

        const input: SearchInstancesInput = {
          query: options.query,
          sort: options.sort || 'relevance',
          limit: options.limit || 20,
          offset: options.offset || 0,
          includeFacets: options.includeFacets ?? true,
        };

        // Build filters
        if (options.filters) {
          input.filters = {};
          if (options.filters.objectTypeId) {
            input.filters.objectTypeId = options.filters.objectTypeId;
          }
          if (options.filters.objectTypeName) {
            input.filters.objectTypeName = options.filters.objectTypeName;
          }
          if (options.filters.status && options.filters.status.length > 0) {
            input.filters.status = options.filters.status;
          }
          if (options.filters.createdBy) {
            input.filters.createdBy = options.filters.createdBy;
          }
          if (options.filters.createdAfter) {
            input.filters.createdAfter = options.filters.createdAfter.toISOString();
          }
          if (options.filters.createdBefore) {
            input.filters.createdBefore = options.filters.createdBefore.toISOString();
          }
        }

        const { data, error: queryError } = await executeSearch({
          variables: { input },
        });

        if (queryError) {
          console.error('Instance search error:', queryError);
          setError(queryError);
          return null;
        }

        if (data?.searchInstances) {
          const result: InstanceSearchResult = {
            ...data.searchInstances,
            facets: parseFacets(data.searchInstances.facets),
          };
          setSearchResult(result);
          return result;
        }

        return null;
      } catch (err) {
        console.error('Search failed:', err);
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      }
    },
    [executeSearch]
  );

  const getSuggestions = useCallback(
    async (query: string, objectTypeId?: string): Promise<string[]> => {
      if (query.length < 2) {
        return [];
      }

      try {
        const { data } = await executeSuggestions({
          variables: {
            query,
            objectTypeId,
          },
        });

        return data?.searchSuggestions || [];
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        return [];
      }
    },
    [executeSuggestions]
  );

  const getStats = useCallback(async (): Promise<SearchStatsResult | null> => {
    try {
      const { data, error: queryError } = await executeStats();

      if (queryError) {
        console.error('Failed to get stats:', queryError);
        return null;
      }

      if (data?.searchStats) {
        setStats(data.searchStats);
        return data.searchStats;
      }

      return null;
    } catch (err) {
      console.error('Failed to get stats:', err);
      return null;
    }
  }, [executeStats]);

  const getHealth = useCallback(async (): Promise<SearchHealthResult | null> => {
    try {
      const { data, error: queryError } = await executeHealth();

      if (queryError) {
        console.error('Failed to get health:', queryError);
        return null;
      }

      if (data?.searchHealth) {
        setHealth(data.searchHealth);
        return data.searchHealth;
      }

      return null;
    } catch (err) {
      console.error('Failed to get health:', err);
      return null;
    }
  }, [executeHealth]);

  const reindex = useCallback(async (): Promise<ReindexResult | null> => {
    try {
      const { data } = await executeReindex();
      return data?.reindexInstances || null;
    } catch (err) {
      console.error('Reindex failed:', err);
      return null;
    }
  }, [executeReindex]);

  const clearResults = useCallback(() => {
    setSearchResult(null);
    setError(null);
  }, []);

  return {
    search,
    searchResult,
    loading,
    error,
    getSuggestions,
    suggestionsLoading,
    getStats,
    stats,
    statsLoading,
    getHealth,
    health,
    healthLoading,
    reindex,
    reindexing,
    clearResults,
  };
}

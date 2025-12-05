/**
 * Search GraphQL Operations
 * Sprint 12 - US-058: Advanced Search UI
 */

import { gql } from '@apollo/client';

// =====================
// QUERIES
// =====================

export const SEARCH_INSTANCES = gql`
  query SearchInstances($input: SearchInstancesInput!) {
    searchInstances(input: $input) {
      instances {
        id
        displayName
        status
        data
        isActive
        createdAt
        updatedAt
        objectType {
          id
          name
          description
        }
      }
      query
      processingTimeMs
      total
      limit
      offset
      facets {
        objectTypes
        statuses
        creators
      }
    }
  }
`;

export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!, $objectTypeId: String) {
    searchSuggestions(query: $query, objectTypeId: $objectTypeId)
  }
`;

export const SEARCH_STATS = gql`
  query SearchStats {
    searchStats {
      totalIndexed
      isIndexing
      fieldDistribution
    }
  }
`;

export const SEARCH_HEALTH = gql`
  query SearchHealth {
    searchHealth {
      healthy
      version
      error
    }
  }
`;

// =====================
// MUTATIONS
// =====================

export const REINDEX_INSTANCES = gql`
  mutation ReindexInstances {
    reindexInstances {
      indexed
      failed
    }
  }
`;

export const SYNC_INSTANCE_INDEX = gql`
  mutation SyncInstanceIndex($instanceId: String!) {
    syncInstanceIndex(instanceId: $instanceId)
  }
`;

// =====================
// TYPES
// =====================

export enum InstanceStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface SearchFiltersInput {
  objectTypeId?: string;
  objectTypeName?: string;
  status?: InstanceStatus[];
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface SearchInstancesInput {
  query: string;
  filters?: SearchFiltersInput;
  sort?: string;
  limit?: number;
  offset?: number;
  includeFacets?: boolean;
}

export interface SearchFacets {
  objectTypes: string; // JSON string of Record<string, number>
  statuses: string;    // JSON string of Record<string, number>
  creators: string;    // JSON string of Record<string, number>
}

export interface ParsedFacets {
  objectTypes: Record<string, number>;
  statuses: Record<string, number>;
  creators: Record<string, number>;
}

export interface SearchInstance {
  id: string;
  displayName?: string;
  status: InstanceStatus;
  data: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  objectType: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface SearchInstancesResult {
  instances: SearchInstance[];
  query: string;
  processingTimeMs: number;
  total: number;
  limit: number;
  offset: number;
  facets?: SearchFacets;
}

export interface SearchStatsResult {
  totalIndexed: number;
  isIndexing: boolean;
  fieldDistribution: string;
}

export interface SearchHealthResult {
  healthy: boolean;
  version?: string;
  error?: string;
}

export interface ReindexResult {
  indexed: number;
  failed: number;
}

// Response types
export interface SearchInstancesResponse {
  searchInstances: SearchInstancesResult;
}

export interface SearchSuggestionsResponse {
  searchSuggestions: string[];
}

export interface SearchStatsResponse {
  searchStats: SearchStatsResult;
}

export interface SearchHealthResponse {
  searchHealth: SearchHealthResult;
}

export interface ReindexInstancesResponse {
  reindexInstances: ReindexResult;
}

export interface SyncInstanceIndexResponse {
  syncInstanceIndex: boolean;
}

// Helper to parse facets from JSON strings
export function parseFacets(facets?: SearchFacets): ParsedFacets | undefined {
  if (!facets) return undefined;

  try {
    return {
      objectTypes: JSON.parse(facets.objectTypes) as Record<string, number>,
      statuses: JSON.parse(facets.statuses) as Record<string, number>,
      creators: JSON.parse(facets.creators) as Record<string, number>,
    };
  } catch {
    return undefined;
  }
}

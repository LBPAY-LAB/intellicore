/**
 * External Sources GraphQL Operations
 * Sprint 18 - US-DB-015: External Source Config UI
 */

import { gql } from '@apollo/client';

// Fragments
export const EXTERNAL_SOURCE_FRAGMENT = gql`
  fragment ExternalSourceFields on ExternalSource {
    id
    name
    description
    sourceType
    status
    connectionConfig
    syncConfig
    lastSyncAt
    lastSyncError
    syncSuccessCount
    syncFailureCount
    lastTestedAt
    lastTestSuccess
    lastTestMessage
    isEnabled
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_EXTERNAL_SOURCES = gql`
  query GetExternalSources {
    externalSources {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

export const GET_ACTIVE_EXTERNAL_SOURCES = gql`
  query GetActiveExternalSources {
    activeExternalSources {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

export const GET_EXTERNAL_SOURCE = gql`
  query GetExternalSource($id: ID!) {
    externalSource(id: $id) {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

// Mutations
export const CREATE_EXTERNAL_SOURCE = gql`
  mutation CreateExternalSource($input: CreateExternalSourceInput!) {
    createExternalSource(input: $input) {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

export const UPDATE_EXTERNAL_SOURCE = gql`
  mutation UpdateExternalSource($input: UpdateExternalSourceInput!) {
    updateExternalSource(input: $input) {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

export const DELETE_EXTERNAL_SOURCE = gql`
  mutation DeleteExternalSource($id: ID!) {
    deleteExternalSource(id: $id)
  }
`;

export const TOGGLE_EXTERNAL_SOURCE_ENABLED = gql`
  mutation ToggleExternalSourceEnabled($id: ID!) {
    toggleExternalSourceEnabled(id: $id) {
      ...ExternalSourceFields
    }
  }
  ${EXTERNAL_SOURCE_FRAGMENT}
`;

export const TEST_EXTERNAL_SOURCE_CONNECTION = gql`
  mutation TestExternalSourceConnection($id: ID!) {
    testExternalSourceConnection(id: $id) {
      success
      message
      latencyMs
    }
  }
`;

export const SYNC_EXTERNAL_SOURCE = gql`
  mutation SyncExternalSource($id: ID!, $fullSync: Boolean) {
    syncExternalSource(id: $id, fullSync: $fullSync) {
      success
      recordsProcessed
    }
  }
`;

// TypeScript Types
export enum ExternalSourceType {
  TIGERBEETLE = 'tigerbeetle',
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  REST_API = 'rest_api',
  GRAPHQL_API = 'graphql_api',
}

export enum ExternalSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  TESTING = 'testing',
}

export interface ExternalSource {
  id: string;
  name: string;
  description?: string;
  sourceType: ExternalSourceType;
  status: ExternalSourceStatus;
  connectionConfig: Record<string, any>;
  syncConfig?: Record<string, any>;
  lastSyncAt?: string;
  lastSyncError?: string;
  syncSuccessCount: number;
  syncFailureCount: number;
  lastTestedAt?: string;
  lastTestSuccess: boolean;
  lastTestMessage?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExternalSourceInput {
  name: string;
  description?: string;
  sourceType: ExternalSourceType;
  connectionConfig: Record<string, any>;
  syncConfig?: Record<string, any>;
  isEnabled?: boolean;
}

export interface UpdateExternalSourceInput {
  id: string;
  name?: string;
  description?: string;
  sourceType?: ExternalSourceType;
  status?: ExternalSourceStatus;
  connectionConfig?: Record<string, any>;
  syncConfig?: Record<string, any>;
  isEnabled?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
}

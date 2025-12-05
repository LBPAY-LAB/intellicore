'use client';

import { useState, useCallback } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  EXECUTE_NGQL,
  GRAPH_TRAVERSE,
  GRAPH_NEIGHBORS,
  GRAPH_SHORTEST_PATH,
  GRAPH_ALL_PATHS,
  GRAPH_SUBGRAPH,
  GRAPH_ANCESTORS,
  GRAPH_DESCENDANTS,
  GRAPH_IS_CONNECTED,
  GRAPH_ANALYTICS,
  GRAPH_SCHEMA,
  GRAPH_STATS,
  GRAPH_HEALTH,
  GRAPH_FULL_SYNC,
  GRAPH_CLEAR,
  GRAPH_ENABLE_SYNC,
  GRAPH_DISABLE_SYNC,
  TraversalDirection,
  AnalyticsType,
  type TraversalResult,
  type NGQLResult,
  type AnalyticsResult,
  type GraphPath,
  type GraphSchema,
  type GraphStats,
  type GraphHealthStatus,
  type GraphSyncResult,
} from '@/lib/graphql/graph-query';

export interface TraversalInput {
  startVertexId: string;
  edgeTypes?: string[];
  direction?: TraversalDirection;
  minDepth?: number;
  maxDepth?: number;
  limit?: number;
}

export interface NeighborsInput {
  vertexId: string;
  edgeTypes?: string[];
  direction?: TraversalDirection;
  limit?: number;
}

export interface ShortestPathInput {
  sourceVertexId: string;
  targetVertexId: string;
  edgeTypes?: string[];
  direction?: TraversalDirection;
  maxDepth?: number;
}

export interface AnalyticsInput {
  type: AnalyticsType;
  vertexIds?: string[];
  edgeTypes?: string[];
  limit?: number;
  options?: Record<string, unknown>;
}

export function useGraphQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy queries with explicit types
  const [executeNGQL] = useLazyQuery<{ executeNGQL: NGQLResult }>(EXECUTE_NGQL);
  const [graphTraverse] = useLazyQuery<{ graphTraverse: TraversalResult }>(GRAPH_TRAVERSE);
  const [graphNeighbors] = useLazyQuery<{ graphNeighbors: TraversalResult }>(GRAPH_NEIGHBORS);
  const [graphShortestPath] = useLazyQuery<{ graphShortestPath: GraphPath }>(GRAPH_SHORTEST_PATH);
  const [graphAllPaths] = useLazyQuery<{ graphAllPaths: GraphPath[] }>(GRAPH_ALL_PATHS);
  const [graphSubgraph] = useLazyQuery<{ graphSubgraph: TraversalResult }>(GRAPH_SUBGRAPH);
  const [graphAncestors] = useLazyQuery<{ graphAncestors: TraversalResult }>(GRAPH_ANCESTORS);
  const [graphDescendants] = useLazyQuery<{ graphDescendants: TraversalResult }>(GRAPH_DESCENDANTS);
  const [graphIsConnected] = useLazyQuery<{ graphIsConnected: boolean }>(GRAPH_IS_CONNECTED);
  const [graphAnalytics] = useLazyQuery<{ graphAnalytics: AnalyticsResult }>(GRAPH_ANALYTICS);
  const [graphSchema] = useLazyQuery<{ graphSchema: GraphSchema }>(GRAPH_SCHEMA);
  const [graphStats] = useLazyQuery<{ graphStats: GraphStats }>(GRAPH_STATS);
  const [graphHealth] = useLazyQuery<{ graphHealth: GraphHealthStatus }>(GRAPH_HEALTH);

  // Mutations with explicit types
  const [fullSyncMutation] = useMutation<{ graphFullSync: GraphSyncResult }>(GRAPH_FULL_SYNC);
  const [clearMutation] = useMutation<{ graphClear: boolean }>(GRAPH_CLEAR);
  const [enableSyncMutation] = useMutation<{ graphEnableSync: boolean }>(GRAPH_ENABLE_SYNC);
  const [disableSyncMutation] = useMutation<{ graphDisableSync: boolean }>(GRAPH_DISABLE_SYNC);

  const runNGQL = useCallback(
    async (query: string, parameters?: Record<string, unknown>): Promise<NGQLResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await executeNGQL({
          variables: { input: { query, parameters } },
        });
        if (error) throw error;
        return data?.executeNGQL || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [executeNGQL],
  );

  const traverse = useCallback(
    async (input: TraversalInput): Promise<TraversalResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphTraverse({
          variables: {
            input: {
              startVertexId: input.startVertexId,
              edgeTypes: input.edgeTypes,
              direction: input.direction || TraversalDirection.OUTBOUND,
              minDepth: input.minDepth || 1,
              maxDepth: input.maxDepth || 3,
              limit: input.limit,
            },
          },
        });
        if (error) throw error;
        return data?.graphTraverse || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphTraverse],
  );

  const findNeighbors = useCallback(
    async (input: NeighborsInput): Promise<TraversalResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphNeighbors({
          variables: {
            input: {
              vertexId: input.vertexId,
              edgeTypes: input.edgeTypes,
              direction: input.direction || TraversalDirection.BOTH,
              limit: input.limit || 100,
            },
          },
        });
        if (error) throw error;
        return data?.graphNeighbors || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphNeighbors],
  );

  const findShortestPath = useCallback(
    async (input: ShortestPathInput): Promise<GraphPath | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphShortestPath({
          variables: {
            input: {
              sourceVertexId: input.sourceVertexId,
              targetVertexId: input.targetVertexId,
              edgeTypes: input.edgeTypes,
              direction: input.direction || TraversalDirection.BOTH,
              maxDepth: input.maxDepth || 5,
            },
          },
        });
        if (error) throw error;
        return data?.graphShortestPath || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphShortestPath],
  );

  const findAllPaths = useCallback(
    async (
      sourceId: string,
      targetId: string,
      maxDepth = 5,
      edgeTypes?: string[],
    ): Promise<GraphPath[]> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphAllPaths({
          variables: { sourceId, targetId, maxDepth, edgeTypes },
        });
        if (error) throw error;
        return data?.graphAllPaths || [];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [graphAllPaths],
  );

  const getSubgraph = useCallback(
    async (
      vertexIds: string[],
      depth = 1,
      edgeTypes?: string[],
    ): Promise<TraversalResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphSubgraph({
          variables: { vertexIds, depth, edgeTypes },
        });
        if (error) throw error;
        return data?.graphSubgraph || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphSubgraph],
  );

  const findAncestors = useCallback(
    async (
      vertexId: string,
      maxDepth = 5,
      edgeTypes?: string[],
    ): Promise<TraversalResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphAncestors({
          variables: { vertexId, maxDepth, edgeTypes },
        });
        if (error) throw error;
        return data?.graphAncestors || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphAncestors],
  );

  const findDescendants = useCallback(
    async (
      vertexId: string,
      maxDepth = 5,
      edgeTypes?: string[],
    ): Promise<TraversalResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphDescendants({
          variables: { vertexId, maxDepth, edgeTypes },
        });
        if (error) throw error;
        return data?.graphDescendants || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphDescendants],
  );

  const checkConnection = useCallback(
    async (vertexId1: string, vertexId2: string, maxDepth = 10): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphIsConnected({
          variables: { vertexId1, vertexId2, maxDepth },
        });
        if (error) throw error;
        return data?.graphIsConnected || false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [graphIsConnected],
  );

  const runAnalytics = useCallback(
    async (input: AnalyticsInput): Promise<AnalyticsResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await graphAnalytics({
          variables: { input },
        });
        if (error) throw error;
        return data?.graphAnalytics || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graphAnalytics],
  );

  const getSchema = useCallback(async (): Promise<GraphSchema | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await graphSchema();
      if (error) throw error;
      return data?.graphSchema || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [graphSchema]);

  const getStats = useCallback(async (): Promise<GraphStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await graphStats();
      if (error) throw error;
      return data?.graphStats || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [graphStats]);

  const getHealth = useCallback(async (): Promise<GraphHealthStatus | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await graphHealth();
      if (error) throw error;
      return data?.graphHealth || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [graphHealth]);

  const fullSync = useCallback(async (): Promise<GraphSyncResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fullSyncMutation();
      return data?.graphFullSync || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fullSyncMutation]);

  const clearGraph = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await clearMutation();
      return data?.graphClear || false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearMutation]);

  const enableSync = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await enableSyncMutation();
      return data?.graphEnableSync || false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [enableSyncMutation]);

  const disableSync = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await disableSyncMutation();
      return data?.graphDisableSync || false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [disableSyncMutation]);

  return {
    loading,
    error,
    // Query methods
    runNGQL,
    traverse,
    findNeighbors,
    findShortestPath,
    findAllPaths,
    getSubgraph,
    findAncestors,
    findDescendants,
    checkConnection,
    runAnalytics,
    getSchema,
    getStats,
    getHealth,
    // Mutation methods
    fullSync,
    clearGraph,
    enableSync,
    disableSync,
  };
}

export { TraversalDirection, AnalyticsType };

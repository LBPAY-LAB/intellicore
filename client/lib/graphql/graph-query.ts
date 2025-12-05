import { gql } from '@apollo/client';

// ==================== Fragments ====================

export const GRAPH_VERTEX_FRAGMENT = gql`
  fragment GraphVertexFields on GraphVertex {
    id
    tag
    properties
  }
`;

export const GRAPH_EDGE_FRAGMENT = gql`
  fragment GraphEdgeFields on GraphEdge {
    id
    type
    sourceId
    targetId
    rank
    properties
  }
`;

export const GRAPH_PATH_FRAGMENT = gql`
  fragment GraphPathFields on GraphPath {
    vertices {
      ...GraphVertexFields
    }
    edges {
      ...GraphEdgeFields
    }
    length
  }
  ${GRAPH_VERTEX_FRAGMENT}
  ${GRAPH_EDGE_FRAGMENT}
`;

export const TRAVERSAL_RESULT_FRAGMENT = gql`
  fragment TraversalResultFields on TraversalResult {
    vertices {
      ...GraphVertexFields
    }
    edges {
      ...GraphEdgeFields
    }
    paths {
      ...GraphPathFields
    }
    totalVertices
    totalEdges
  }
  ${GRAPH_VERTEX_FRAGMENT}
  ${GRAPH_EDGE_FRAGMENT}
  ${GRAPH_PATH_FRAGMENT}
`;

export const ANALYTICS_RESULT_FRAGMENT = gql`
  fragment AnalyticsResultFields on AnalyticsResult {
    type
    items {
      vertexId
      score
      rank
      metadata
    }
    executionTimeMs
    summary
  }
`;

// ==================== Queries ====================

export const EXECUTE_NGQL = gql`
  query ExecuteNGQL($input: ExecuteNGQLInput!) {
    executeNGQL(input: $input) {
      success
      columns
      rows
      rowCount
      executionTimeMs
      errorMessage
    }
  }
`;

export const GRAPH_TRAVERSE = gql`
  query GraphTraverse($input: TraversalInput!) {
    graphTraverse(input: $input) {
      ...TraversalResultFields
    }
  }
  ${TRAVERSAL_RESULT_FRAGMENT}
`;

export const GRAPH_NEIGHBORS = gql`
  query GraphNeighbors($input: NeighborsInput!) {
    graphNeighbors(input: $input) {
      ...TraversalResultFields
    }
  }
  ${TRAVERSAL_RESULT_FRAGMENT}
`;

export const GRAPH_SHORTEST_PATH = gql`
  query GraphShortestPath($input: ShortestPathInput!) {
    graphShortestPath(input: $input) {
      ...GraphPathFields
    }
  }
  ${GRAPH_PATH_FRAGMENT}
`;

export const GRAPH_ALL_PATHS = gql`
  query GraphAllPaths(
    $sourceId: String!
    $targetId: String!
    $maxDepth: Int
    $edgeTypes: [String!]
  ) {
    graphAllPaths(
      sourceId: $sourceId
      targetId: $targetId
      maxDepth: $maxDepth
      edgeTypes: $edgeTypes
    ) {
      ...GraphPathFields
    }
  }
  ${GRAPH_PATH_FRAGMENT}
`;

export const GRAPH_SUBGRAPH = gql`
  query GraphSubgraph(
    $vertexIds: [String!]!
    $depth: Int
    $edgeTypes: [String!]
  ) {
    graphSubgraph(
      vertexIds: $vertexIds
      depth: $depth
      edgeTypes: $edgeTypes
    ) {
      ...TraversalResultFields
    }
  }
  ${TRAVERSAL_RESULT_FRAGMENT}
`;

export const GRAPH_ANCESTORS = gql`
  query GraphAncestors(
    $vertexId: String!
    $maxDepth: Int
    $edgeTypes: [String!]
  ) {
    graphAncestors(
      vertexId: $vertexId
      maxDepth: $maxDepth
      edgeTypes: $edgeTypes
    ) {
      ...TraversalResultFields
    }
  }
  ${TRAVERSAL_RESULT_FRAGMENT}
`;

export const GRAPH_DESCENDANTS = gql`
  query GraphDescendants(
    $vertexId: String!
    $maxDepth: Int
    $edgeTypes: [String!]
  ) {
    graphDescendants(
      vertexId: $vertexId
      maxDepth: $maxDepth
      edgeTypes: $edgeTypes
    ) {
      ...TraversalResultFields
    }
  }
  ${TRAVERSAL_RESULT_FRAGMENT}
`;

export const GRAPH_IS_CONNECTED = gql`
  query GraphIsConnected(
    $vertexId1: String!
    $vertexId2: String!
    $maxDepth: Int
  ) {
    graphIsConnected(
      vertexId1: $vertexId1
      vertexId2: $vertexId2
      maxDepth: $maxDepth
    )
  }
`;

export const GRAPH_ANALYTICS = gql`
  query GraphAnalytics($input: AnalyticsInput!) {
    graphAnalytics(input: $input) {
      ...AnalyticsResultFields
    }
  }
  ${ANALYTICS_RESULT_FRAGMENT}
`;

export const GRAPH_SCHEMA = gql`
  query GraphSchema {
    graphSchema {
      space
      tags {
        name
        properties
      }
      edges {
        name
        properties
      }
    }
  }
`;

export const GRAPH_STATS = gql`
  query GraphStats {
    graphStats {
      totalVertices
      totalEdges
      verticesByTag
      edgesByType
    }
  }
`;

export const GRAPH_HEALTH = gql`
  query GraphHealth {
    graphHealth {
      healthy
      syncEnabled
      message
    }
  }
`;

export const GRAPH_DENSITY = gql`
  query GraphDensity {
    graphDensity
  }
`;

export const GRAPH_AVERAGE_DEGREE = gql`
  query GraphAverageDegree {
    graphAverageDegree
  }
`;

// ==================== Mutations ====================

export const GRAPH_FULL_SYNC = gql`
  mutation GraphFullSync {
    graphFullSync {
      instancesSync
      relationshipsSync
      errors
      success
    }
  }
`;

export const GRAPH_CLEAR = gql`
  mutation GraphClear {
    graphClear
  }
`;

export const GRAPH_ENABLE_SYNC = gql`
  mutation GraphEnableSync {
    graphEnableSync
  }
`;

export const GRAPH_DISABLE_SYNC = gql`
  mutation GraphDisableSync {
    graphDisableSync
  }
`;

// ==================== Types ====================

export enum TraversalDirection {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
  BOTH = 'BOTH',
}

export enum AnalyticsType {
  DEGREE_CENTRALITY = 'DEGREE_CENTRALITY',
  BETWEENNESS_CENTRALITY = 'BETWEENNESS_CENTRALITY',
  CLOSENESS_CENTRALITY = 'CLOSENESS_CENTRALITY',
  PAGERANK = 'PAGERANK',
  CLUSTERING_COEFFICIENT = 'CLUSTERING_COEFFICIENT',
  CONNECTED_COMPONENTS = 'CONNECTED_COMPONENTS',
  SHORTEST_PATH = 'SHORTEST_PATH',
}

export interface GraphVertex {
  id: string;
  tag: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  rank: number;
  properties: Record<string, unknown>;
}

export interface GraphPath {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  length: number;
}

export interface TraversalResult {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  paths?: GraphPath[];
  totalVertices: number;
  totalEdges: number;
}

export interface NGQLResult {
  success: boolean;
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  executionTimeMs: number;
  errorMessage?: string;
}

export interface AnalyticsResultItem {
  vertexId: string;
  score: number;
  rank?: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsResult {
  type: AnalyticsType;
  items: AnalyticsResultItem[];
  executionTimeMs: number;
  summary?: Record<string, unknown>;
}

export interface GraphSchema {
  space: string;
  tags: { name: string; properties: string[] }[];
  edges: { name: string; properties: string[] }[];
}

export interface GraphStats {
  totalVertices: number;
  totalEdges: number;
  verticesByTag: Record<string, number>;
  edgesByType: Record<string, number>;
}

export interface GraphHealthStatus {
  healthy: boolean;
  syncEnabled: boolean;
  message?: string;
}

export interface GraphSyncResult {
  instancesSync: number;
  relationshipsSync: number;
  errors: string[];
  success: boolean;
}

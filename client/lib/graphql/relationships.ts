import { gql } from '@apollo/client';
import { ObjectType } from './object-types';

/**
 * Enums matching backend definitions
 */
export enum RelationshipType {
  PARENT_OF = 'PARENT_OF',
  CHILD_OF = 'CHILD_OF',
  HAS_ONE = 'HAS_ONE',
  HAS_MANY = 'HAS_MANY',
  BELONGS_TO = 'BELONGS_TO',
}

export enum Cardinality {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

/**
 * TypeScript interfaces
 */
export interface ObjectRelationship {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  cardinality: Cardinality;
  is_bidirectional: boolean;
  description?: string;
  relationship_rules?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  source?: ObjectType;
  target?: ObjectType;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface RelationshipsResponse {
  relationships: {
    nodes: ObjectRelationship[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

export interface RelationshipResponse {
  relationship: ObjectRelationship;
}

export interface RelationshipsByObjectTypeResponse {
  relationshipsByObjectType: ObjectRelationship[];
}

export interface CreateRelationshipInput {
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  cardinality: Cardinality;
  is_bidirectional?: boolean;
  description?: string;
  relationship_rules?: any;
}

export interface UpdateRelationshipInput {
  id: string;
  relationship_type?: RelationshipType;
  cardinality?: Cardinality;
  is_bidirectional?: boolean;
  description?: string;
  relationship_rules?: any;
}

export interface CreateRelationshipResponse {
  createRelationship: ObjectRelationship;
}

export interface UpdateRelationshipResponse {
  updateRelationship: ObjectRelationship;
}

export interface DeleteRelationshipResponse {
  deleteRelationship: boolean;
}

/**
 * Graph traversal types
 */
export interface GraphPathInfo {
  objectTypeId: string;
  objectType: ObjectType;
  depth: number;
  path: string[];
}

export interface GraphCircularReferenceInfo {
  hasCircularReference: boolean;
  cycle?: string[];
  cycleLength?: number;
}

export interface GraphNode {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  cardinality: Cardinality;
  is_bidirectional: boolean;
  description?: string;
}

export interface GraphStructure {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStructureResponse {
  graphStructure: GraphStructure;
}

export interface GraphShortestPathResponse {
  graphShortestPath: GraphPathInfo | null;
}

export interface GraphBFSResponse {
  graphBFS: GraphPathInfo[];
}

export interface GraphDFSResponse {
  graphDFS: GraphPathInfo[];
}

export interface GraphAncestorsResponse {
  graphAncestors: GraphPathInfo[];
}

export interface GraphDescendantsResponse {
  graphDescendants: GraphPathInfo[];
}

export interface GraphDetectCircularReferencesResponse {
  graphDetectCircularReferences: GraphCircularReferenceInfo;
}

/**
 * GraphQL Queries
 */
export const GET_RELATIONSHIPS = gql`
  query GetRelationships($first: Int, $after: String) {
    relationships(first: $first, after: $after) {
      nodes {
        id
        source_id
        target_id
        relationship_type
        cardinality
        is_bidirectional
        description
        is_active
        created_at
        updated_at
        source {
          id
          name
          description
          is_active
        }
        target {
          id
          name
          description
          is_active
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_RELATIONSHIP = gql`
  query GetRelationship($id: ID!) {
    relationship(id: $id) {
      id
      source_id
      target_id
      relationship_type
      cardinality
      is_bidirectional
      description
      relationship_rules
      is_active
      created_at
      updated_at
      source {
        id
        name
        description
        is_active
      }
      target {
        id
        name
        description
        is_active
      }
    }
  }
`;

export const GET_RELATIONSHIPS_BY_OBJECT_TYPE = gql`
  query GetRelationshipsByObjectType($objectTypeId: ID!) {
    relationshipsByObjectType(objectTypeId: $objectTypeId) {
      id
      source_id
      target_id
      relationship_type
      cardinality
      is_bidirectional
      description
      is_active
      source {
        id
        name
        description
      }
      target {
        id
        name
        description
      }
    }
  }
`;

export const GET_GRAPH_STRUCTURE = gql`
  query GetGraphStructure($maxNodes: Int) {
    graphStructure(maxNodes: $maxNodes) {
      nodes {
        id
        name
        description
        is_active
      }
      edges {
        id
        source_id
        target_id
        relationship_type
        cardinality
        is_bidirectional
        description
      }
    }
  }
`;

export const FIND_SHORTEST_PATH = gql`
  query FindShortestPath($sourceId: ID!, $targetId: ID!, $maxDepth: Int) {
    graphShortestPath(sourceId: $sourceId, targetId: $targetId, maxDepth: $maxDepth) {
      objectTypeId
      objectType {
        id
        name
        description
      }
      depth
      path
    }
  }
`;

export const GRAPH_BFS = gql`
  query GraphBFS($startId: ID!, $maxDepth: Int) {
    graphBFS(startId: $startId, maxDepth: $maxDepth) {
      objectTypeId
      objectType {
        id
        name
        description
      }
      depth
      path
    }
  }
`;

export const GRAPH_DFS = gql`
  query GraphDFS($startId: ID!, $maxDepth: Int) {
    graphDFS(startId: $startId, maxDepth: $maxDepth) {
      objectTypeId
      objectType {
        id
        name
        description
      }
      depth
      path
    }
  }
`;

export const GRAPH_ANCESTORS = gql`
  query GraphAncestors($objectTypeId: ID!, $maxDepth: Int) {
    graphAncestors(objectTypeId: $objectTypeId, maxDepth: $maxDepth) {
      objectTypeId
      objectType {
        id
        name
        description
      }
      depth
      path
    }
  }
`;

export const GRAPH_DESCENDANTS = gql`
  query GraphDescendants($objectTypeId: ID!, $maxDepth: Int) {
    graphDescendants(objectTypeId: $objectTypeId, maxDepth: $maxDepth) {
      objectTypeId
      objectType {
        id
        name
        description
      }
      depth
      path
    }
  }
`;

export const DETECT_CIRCULAR_REFERENCES = gql`
  query DetectCircularReferences($startId: ID!, $maxDepth: Int) {
    graphDetectCircularReferences(startId: $startId, maxDepth: $maxDepth) {
      hasCircularReference
      cycle
      cycleLength
    }
  }
`;

/**
 * GraphQL Mutations
 */
export const CREATE_RELATIONSHIP = gql`
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      id
      source_id
      target_id
      relationship_type
      cardinality
      is_bidirectional
      description
      is_active
      created_at
      source {
        id
        name
      }
      target {
        id
        name
      }
    }
  }
`;

export const UPDATE_RELATIONSHIP = gql`
  mutation UpdateRelationship($input: UpdateRelationshipInput!) {
    updateRelationship(input: $input) {
      id
      source_id
      target_id
      relationship_type
      cardinality
      is_bidirectional
      description
      is_active
      updated_at
      source {
        id
        name
      }
      target {
        id
        name
      }
    }
  }
`;

export const DELETE_RELATIONSHIP = gql`
  mutation DeleteRelationship($id: ID!) {
    deleteRelationship(id: $id)
  }
`;

import { gql } from '@apollo/client';

export const GET_OBJECT_TYPES = gql`
  query GetObjectTypes($first: Int, $after: String) {
    objectTypes(first: $first, after: $after) {
      nodes {
        id
        name
        description
        is_active
        created_at
        updated_at
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_OBJECT_TYPE = gql`
  query GetObjectType($id: ID!) {
    objectType(id: $id) {
      id
      name
      description
      is_active
      created_at
      updated_at
    }
  }
`;

export const CREATE_OBJECT_TYPE = gql`
  mutation CreateObjectType($input: CreateObjectTypeInput!) {
    createObjectType(input: $input) {
      id
      name
      description
      is_active
      created_at
    }
  }
`;

export const UPDATE_OBJECT_TYPE = gql`
  mutation UpdateObjectType($input: UpdateObjectTypeInput!) {
    updateObjectType(input: $input) {
      id
      name
      description
      is_active
      updated_at
    }
  }
`;

export const DELETE_OBJECT_TYPE = gql`
  mutation DeleteObjectType($id: ID!) {
    deleteObjectType(id: $id)
  }
`;

export const RESTORE_OBJECT_TYPE = gql`
  mutation RestoreObjectType($id: ID!) {
    restoreObjectType(id: $id) {
      id
      name
      deleted_at
    }
  }
`;

// TypeScript types for the GraphQL operations
export interface ObjectType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface ObjectTypesResponse {
  objectTypes: {
    nodes: ObjectType[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

export interface ObjectTypeResponse {
  objectType: ObjectType;
}

export interface CreateObjectTypeInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateObjectTypeInput {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateObjectTypeResponse {
  createObjectType: ObjectType;
}

export interface UpdateObjectTypeResponse {
  updateObjectType: ObjectType;
}

export interface DeleteObjectTypeResponse {
  deleteObjectType: boolean;
}

export interface RestoreObjectTypeResponse {
  restoreObjectType: ObjectType;
}

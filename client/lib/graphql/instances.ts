/**
 * Instance GraphQL Operations
 * Sprint 11 - Free-text Instance Creation
 */

import { gql } from '@apollo/client';

// =====================
// QUERIES
// =====================

export const GET_INSTANCES = gql`
  query GetInstances($first: Int, $after: String, $objectTypeId: ID, $status: InstanceStatus) {
    instances(first: $first, after: $after, objectTypeId: $objectTypeId, status: $status) {
      nodes {
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
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_INSTANCES_BY_OBJECT_TYPE = gql`
  query GetInstancesByObjectType($objectTypeId: ID!, $first: Int, $after: String, $status: InstanceStatus) {
    instancesByObjectType(objectTypeId: $objectTypeId, first: $first, after: $after, status: $status) {
      nodes {
        id
        displayName
        status
        data
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    instance(id: $id) {
      id
      displayName
      status
      data
      isActive
      createdBy
      createdAt
      updatedAt
      objectType {
        id
        name
        description
        fields {
          id
          name
          field_type
          is_required
          description
          validation_rules
        }
      }
    }
  }
`;

export const VALIDATE_INSTANCE_DATA = gql`
  query ValidateInstanceData($objectTypeId: ID!, $data: JSON!) {
    validateInstanceData(objectTypeId: $objectTypeId, data: $data) {
      isValid
      errors {
        field
        message
        code
        value
      }
      warnings {
        field
        message
        code
        value
      }
    }
  }
`;

// =====================
// MUTATIONS
// =====================

export const CREATE_INSTANCE = gql`
  mutation CreateInstance($input: CreateInstanceInput!) {
    createInstance(input: $input) {
      id
      displayName
      status
      data
      isActive
      createdAt
      objectType {
        id
        name
      }
    }
  }
`;

export const UPDATE_INSTANCE = gql`
  mutation UpdateInstance($input: UpdateInstanceInput!) {
    updateInstance(input: $input) {
      id
      displayName
      status
      data
      isActive
      updatedAt
    }
  }
`;

export const CHANGE_INSTANCE_STATUS = gql`
  mutation ChangeInstanceStatus($id: ID!, $status: InstanceStatus!) {
    changeInstanceStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id)
  }
`;

export const RESTORE_INSTANCE = gql`
  mutation RestoreInstance($id: ID!) {
    restoreInstance(id: $id) {
      id
      status
      deletedAt
    }
  }
`;

// =====================
// RELATIONSHIPS
// =====================

export const GET_INSTANCE_RELATIONSHIPS = gql`
  query GetInstanceRelationships($instanceId: ID!, $direction: RelationshipDirection) {
    instanceRelationships(instanceId: $instanceId, direction: $direction) {
      id
      sourceInstanceId
      targetInstanceId
      objectRelationshipId
      metadata
      isActive
      createdAt
      sourceInstance {
        id
        displayName
        objectType {
          id
          name
        }
      }
      targetInstance {
        id
        displayName
        objectType {
          id
          name
        }
      }
      objectRelationship {
        id
        name
        description
        cardinality
      }
    }
  }
`;

export const GET_RELATED_INSTANCES = gql`
  query GetRelatedInstances($instanceId: ID!, $objectRelationshipId: ID) {
    relatedInstances(instanceId: $instanceId, objectRelationshipId: $objectRelationshipId) {
      id
      displayName
      status
      data
      objectType {
        id
        name
      }
    }
  }
`;

export const CREATE_INSTANCE_RELATIONSHIP = gql`
  mutation CreateInstanceRelationship($input: CreateInstanceRelationshipInput!) {
    createInstanceRelationship(input: $input) {
      id
      sourceInstanceId
      targetInstanceId
      objectRelationshipId
      isActive
      createdAt
    }
  }
`;

export const DELETE_INSTANCE_RELATIONSHIP = gql`
  mutation DeleteInstanceRelationship($id: ID!) {
    deleteInstanceRelationship(id: $id)
  }
`;

// =====================
// OBJECT TYPE WITH FIELDS (for instance creation)
// =====================

export const GET_OBJECT_TYPE_WITH_FIELDS = gql`
  query GetObjectTypeWithFields($id: ID!) {
    objectType(id: $id) {
      id
      name
      description
      is_active
      fields {
        id
        name
        field_type
        is_required
        description
        default_value
        validation_rules
        display_order
      }
    }
  }
`;

export const GET_ALL_OBJECT_TYPES_WITH_FIELDS = gql`
  query GetAllObjectTypesWithFields($first: Int) {
    objectTypes(first: $first) {
      nodes {
        id
        name
        description
        is_active
        fields {
          id
          name
          field_type
          is_required
          description
          validation_rules
        }
      }
    }
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

export enum RelationshipDirection {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
  ALL = 'all',
}

export interface Field {
  id: string;
  name: string;
  field_type: string;
  is_required: boolean;
  description?: string;
  default_value?: unknown;
  validation_rules?: Record<string, unknown>;
  display_order?: number;
}

export interface ObjectTypeWithFields {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  fields: Field[];
}

export interface Instance {
  id: string;
  displayName?: string;
  status: InstanceStatus;
  data: Record<string, unknown>;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  objectType: ObjectTypeWithFields;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface PaginatedInstancesResponse {
  nodes: Instance[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface InstanceRelationship {
  id: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  objectRelationshipId: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  sourceInstance: Instance;
  targetInstance: Instance;
  objectRelationship: {
    id: string;
    name: string;
    description?: string;
    cardinality: string;
  };
}

// Input types
export interface CreateInstanceInput {
  objectTypeId: string;
  data: Record<string, unknown>;
  displayName?: string;
  status?: InstanceStatus;
}

export interface UpdateInstanceInput {
  id: string;
  data?: Record<string, unknown>;
  displayName?: string;
  status?: InstanceStatus;
  isActive?: boolean;
}

export interface CreateInstanceRelationshipInput {
  sourceInstanceId: string;
  targetInstanceId: string;
  objectRelationshipId: string;
  metadata?: Record<string, unknown>;
}

// Response types
export interface GetInstancesResponse {
  instances: PaginatedInstancesResponse;
}

export interface GetInstancesByObjectTypeResponse {
  instancesByObjectType: PaginatedInstancesResponse;
}

export interface GetInstanceResponse {
  instance: Instance;
}

export interface ValidateInstanceDataResponse {
  validateInstanceData: ValidationResult;
}

export interface CreateInstanceResponse {
  createInstance: Instance;
}

export interface UpdateInstanceResponse {
  updateInstance: Instance;
}

export interface ChangeInstanceStatusResponse {
  changeInstanceStatus: Instance;
}

export interface DeleteInstanceResponse {
  deleteInstance: boolean;
}

export interface RestoreInstanceResponse {
  restoreInstance: Instance;
}

export interface GetInstanceRelationshipsResponse {
  instanceRelationships: InstanceRelationship[];
}

export interface GetRelatedInstancesResponse {
  relatedInstances: Instance[];
}

export interface CreateInstanceRelationshipResponse {
  createInstanceRelationship: InstanceRelationship;
}

export interface DeleteInstanceRelationshipResponse {
  deleteInstanceRelationship: boolean;
}

export interface GetObjectTypeWithFieldsResponse {
  objectType: ObjectTypeWithFields;
}

export interface GetAllObjectTypesWithFieldsResponse {
  objectTypes: {
    nodes: ObjectTypeWithFields[];
  };
}

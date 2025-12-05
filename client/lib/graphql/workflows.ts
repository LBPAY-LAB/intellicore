/**
 * Workflow GraphQL Operations
 * Sprint 12 - US-061: Workflow Visualization
 */

import { gql } from '@apollo/client';

// =====================
// QUERIES
// =====================

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
      id
      name
      description
      workflowType
      objectTypeId
      initialState
      finalStates
      isActive
      version
      createdAt
      objectType {
        id
        name
      }
    }
  }
`;

export const GET_WORKFLOWS = gql`
  query GetWorkflows($objectTypeId: ID) {
    workflows(objectTypeId: $objectTypeId) {
      id
      name
      description
      workflowType
      objectTypeId
      initialState
      finalStates
      isActive
      version
      createdAt
    }
  }
`;

export const GET_WORKFLOW_BY_OBJECT_TYPE = gql`
  query GetWorkflowByObjectType($objectTypeId: ID!) {
    workflowByObjectType(objectTypeId: $objectTypeId) {
      id
      name
      description
      workflowType
      initialState
      finalStates
      isActive
      version
    }
  }
`;

export const GET_WORKFLOW_STATES = gql`
  query GetWorkflowStates($workflowId: ID!) {
    workflowStates(workflowId: $workflowId) {
      id
      name
      displayName
      description
      type
      color
      icon
      displayOrder
      metadata
    }
  }
`;

export const GET_WORKFLOW_TRANSITIONS = gql`
  query GetWorkflowTransitions($workflowId: ID!) {
    workflowTransitions(workflowId: $workflowId) {
      id
      fromState
      toState
      name
      description
      requiredRoles
      requiresComment
      isAutomatic
      displayOrder
    }
  }
`;

export const GET_WORKFLOW_INSTANCE = gql`
  query GetWorkflowInstance($instanceId: ID!) {
    workflowInstance(instanceId: $instanceId) {
      id
      instanceId
      workflowId
      currentState
      previousState
      workflowVersion
      contextData
      isCompleted
      completedAt
      createdAt
      updatedAt
      workflow {
        id
        name
        initialState
        finalStates
      }
    }
  }
`;

export const GET_CURRENT_WORKFLOW_STATE = gql`
  query GetCurrentWorkflowState($instanceId: ID!) {
    currentWorkflowState(instanceId: $instanceId) {
      id
      name
      displayName
      description
      color
      icon
    }
  }
`;

export const GET_AVAILABLE_TRANSITIONS = gql`
  query GetAvailableTransitions($instanceId: ID!) {
    availableTransitions(instanceId: $instanceId) {
      id
      name
      toState
      description
      requiresComment
      requiredRoles
    }
  }
`;

export const GET_WORKFLOW_HISTORY = gql`
  query GetWorkflowHistory($instanceId: ID!) {
    workflowHistory(instanceId: $instanceId) {
      id
      fromState
      toState
      transitionName
      comment
      transitionData
      performedBy
      durationMs
      createdAt
    }
  }
`;

// =====================
// MUTATIONS
// =====================

export const START_WORKFLOW = gql`
  mutation StartWorkflow($input: StartWorkflowInput!) {
    startWorkflow(input: $input) {
      id
      instanceId
      workflowId
      currentState
      isCompleted
      createdAt
    }
  }
`;

export const EXECUTE_TRANSITION = gql`
  mutation ExecuteTransition($input: ExecuteTransitionInput!) {
    executeTransition(input: $input) {
      success
      fromState
      toState
      historyEntryId
    }
  }
`;

export const CANCEL_WORKFLOW = gql`
  mutation CancelWorkflow($instanceId: ID!, $reason: String) {
    cancelWorkflow(instanceId: $instanceId, reason: $reason)
  }
`;

export const CREATE_DEFAULT_WORKFLOW = gql`
  mutation CreateDefaultInstanceWorkflow {
    createDefaultInstanceWorkflow {
      id
      name
      initialState
      finalStates
    }
  }
`;

// =====================
// TYPES
// =====================

export enum WorkflowType {
  LINEAR = 'LINEAR',
  STATE_MACHINE = 'STATE_MACHINE',
  APPROVAL = 'APPROVAL',
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  workflowType: WorkflowType;
  objectTypeId?: string;
  initialState: string;
  finalStates: string[];
  isActive: boolean;
  version: number;
  createdAt: string;
  objectType?: {
    id: string;
    name: string;
  };
}

export type StateType = 'initial' | 'intermediate' | 'final' | 'error';

export interface WorkflowState {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  type?: StateType;
  color?: string;
  icon?: string;
  displayOrder: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowTransition {
  id: string;
  fromState: string;
  toState: string;
  name: string;
  description?: string;
  requiredRoles?: string[];
  requiresComment: boolean;
  isAutomatic: boolean;
  displayOrder: number;
}

export interface WorkflowInstance {
  id: string;
  instanceId: string;
  workflowId: string;
  currentState: string;
  previousState?: string;
  workflowVersion: number;
  contextData: Record<string, unknown>;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  workflow?: WorkflowDefinition;
}

export interface AvailableTransition {
  id: string;
  name: string;
  toState: string;
  description?: string;
  requiresComment: boolean;
  requiredRoles?: string[];
}

export interface WorkflowHistoryEntry {
  id: string;
  fromState: string;
  toState: string;
  transitionName: string;
  comment?: string;
  transitionData?: Record<string, unknown>;
  performedBy?: string;
  durationMs: number;
  createdAt: string;
}

export interface TransitionResult {
  success: boolean;
  fromState: string;
  toState: string;
  historyEntryId: string;
}

// Input types
export interface StartWorkflowInput {
  instanceId: string;
  workflowId: string;
  contextData?: Record<string, unknown>;
}

export interface ExecuteTransitionInput {
  instanceId: string;
  transitionId: string;
  comment?: string;
  transitionData?: Record<string, unknown>;
}

// Response types
export interface GetWorkflowResponse {
  workflow: WorkflowDefinition | null;
}

export interface GetWorkflowsResponse {
  workflows: WorkflowDefinition[];
}

export interface GetWorkflowStatesResponse {
  workflowStates: WorkflowState[];
}

export interface GetWorkflowTransitionsResponse {
  workflowTransitions: WorkflowTransition[];
}

export interface GetWorkflowInstanceResponse {
  workflowInstance: WorkflowInstance | null;
}

export interface GetCurrentWorkflowStateResponse {
  currentWorkflowState: WorkflowState | null;
}

export interface GetAvailableTransitionsResponse {
  availableTransitions: AvailableTransition[];
}

export interface GetWorkflowHistoryResponse {
  workflowHistory: WorkflowHistoryEntry[];
}

export interface StartWorkflowResponse {
  startWorkflow: WorkflowInstance;
}

export interface ExecuteTransitionResponse {
  executeTransition: TransitionResult;
}

export interface CancelWorkflowResponse {
  cancelWorkflow: boolean;
}

export interface CreateDefaultWorkflowResponse {
  createDefaultInstanceWorkflow: WorkflowDefinition;
}

/**
 * useWorkflow Hook
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Hook for managing workflow state and transitions for instances.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import {
  GET_WORKFLOW_INSTANCE,
  GET_CURRENT_WORKFLOW_STATE,
  GET_AVAILABLE_TRANSITIONS,
  GET_WORKFLOW_HISTORY,
  GET_WORKFLOW_STATES,
  GET_WORKFLOW_TRANSITIONS,
  START_WORKFLOW,
  EXECUTE_TRANSITION,
  CANCEL_WORKFLOW,
  GetWorkflowInstanceResponse,
  GetCurrentWorkflowStateResponse,
  GetAvailableTransitionsResponse,
  GetWorkflowHistoryResponse,
  GetWorkflowStatesResponse,
  GetWorkflowTransitionsResponse,
  StartWorkflowResponse,
  ExecuteTransitionResponse,
  CancelWorkflowResponse,
  WorkflowInstance,
  WorkflowState,
  WorkflowTransition,
  AvailableTransition,
  WorkflowHistoryEntry,
  ExecuteTransitionInput,
  StartWorkflowInput,
} from '@/lib/graphql/workflows';

export interface UseWorkflowOptions {
  instanceId: string;
  autoRefresh?: boolean;
}

export interface UseWorkflowReturn {
  // Instance workflow state
  workflowInstance: WorkflowInstance | null;
  currentState: WorkflowState | null;
  availableTransitions: AvailableTransition[];
  history: WorkflowHistoryEntry[];

  // Workflow definition (loaded when instance has workflow)
  states: WorkflowState[];
  transitions: WorkflowTransition[];

  // Loading states
  loading: boolean;
  transitionsLoading: boolean;
  historyLoading: boolean;

  // Actions
  startWorkflow: (workflowId: string, contextData?: Record<string, unknown>) => Promise<WorkflowInstance | null>;
  executeTransition: (transitionId: string, comment?: string, data?: Record<string, unknown>) => Promise<boolean>;
  cancelWorkflow: (reason?: string) => Promise<boolean>;
  refresh: () => void;

  // State
  error: Error | null;
  hasWorkflow: boolean;
  isCompleted: boolean;
}

export function useWorkflow({ instanceId, autoRefresh = false }: UseWorkflowOptions): UseWorkflowReturn {
  const [error, setError] = useState<Error | null>(null);

  // Query workflow instance
  const {
    data: instanceData,
    loading: instanceLoading,
    refetch: refetchInstance,
  } = useQuery<GetWorkflowInstanceResponse>(GET_WORKFLOW_INSTANCE, {
    variables: { instanceId },
    skip: !instanceId,
    fetchPolicy: 'cache-and-network',
  });

  // Query current state
  const {
    data: stateData,
    loading: stateLoading,
    refetch: refetchState,
  } = useQuery<GetCurrentWorkflowStateResponse>(GET_CURRENT_WORKFLOW_STATE, {
    variables: { instanceId },
    skip: !instanceId || !instanceData?.workflowInstance,
    fetchPolicy: 'cache-and-network',
  });

  // Query available transitions
  const {
    data: transitionsData,
    loading: transitionsLoading,
    refetch: refetchTransitions,
  } = useQuery<GetAvailableTransitionsResponse>(GET_AVAILABLE_TRANSITIONS, {
    variables: { instanceId },
    skip: !instanceId || !instanceData?.workflowInstance,
    fetchPolicy: 'cache-and-network',
  });

  // Lazy query for history
  const [
    fetchHistory,
    { data: historyData, loading: historyLoading },
  ] = useLazyQuery<GetWorkflowHistoryResponse>(GET_WORKFLOW_HISTORY, {
    fetchPolicy: 'network-only',
  });

  // Lazy queries for workflow definition
  const [
    fetchStates,
    { data: statesData },
  ] = useLazyQuery<GetWorkflowStatesResponse>(GET_WORKFLOW_STATES);

  const [
    fetchAllTransitions,
    { data: allTransitionsData },
  ] = useLazyQuery<GetWorkflowTransitionsResponse>(GET_WORKFLOW_TRANSITIONS);

  // Load workflow definition when instance has workflow
  useEffect(() => {
    if (instanceData?.workflowInstance?.workflowId) {
      fetchStates({ variables: { workflowId: instanceData.workflowInstance.workflowId } });
      fetchAllTransitions({ variables: { workflowId: instanceData.workflowInstance.workflowId } });
    }
  }, [instanceData?.workflowInstance?.workflowId, fetchStates, fetchAllTransitions]);

  // Mutations
  const [startWorkflowMutation] = useMutation<StartWorkflowResponse>(START_WORKFLOW);
  const [executeTransitionMutation] = useMutation<ExecuteTransitionResponse>(EXECUTE_TRANSITION);
  const [cancelWorkflowMutation] = useMutation<CancelWorkflowResponse>(CANCEL_WORKFLOW);

  // Start workflow
  const startWorkflow = useCallback(
    async (workflowId: string, contextData?: Record<string, unknown>): Promise<WorkflowInstance | null> => {
      try {
        setError(null);
        const input: StartWorkflowInput = {
          instanceId,
          workflowId,
          contextData,
        };

        const { data } = await startWorkflowMutation({
          variables: { input },
        });

        if (data?.startWorkflow) {
          // Refresh all data
          await Promise.all([
            refetchInstance(),
            refetchState(),
            refetchTransitions(),
          ]);
          return data.startWorkflow;
        }
        return null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start workflow');
        setError(error);
        console.error('Start workflow error:', err);
        return null;
      }
    },
    [instanceId, startWorkflowMutation, refetchInstance, refetchState, refetchTransitions]
  );

  // Execute transition
  const executeTransition = useCallback(
    async (
      transitionId: string,
      comment?: string,
      transitionData?: Record<string, unknown>
    ): Promise<boolean> => {
      try {
        setError(null);
        const input: ExecuteTransitionInput = {
          instanceId,
          transitionId,
          comment,
          transitionData,
        };

        const { data } = await executeTransitionMutation({
          variables: { input },
        });

        if (data?.executeTransition?.success) {
          // Refresh all data
          await Promise.all([
            refetchInstance(),
            refetchState(),
            refetchTransitions(),
          ]);
          return true;
        }
        return false;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to execute transition');
        setError(error);
        console.error('Execute transition error:', err);
        return false;
      }
    },
    [instanceId, executeTransitionMutation, refetchInstance, refetchState, refetchTransitions]
  );

  // Cancel workflow
  const cancelWorkflow = useCallback(
    async (reason?: string): Promise<boolean> => {
      try {
        setError(null);
        const { data } = await cancelWorkflowMutation({
          variables: { instanceId, reason },
        });

        if (data?.cancelWorkflow) {
          await refetchInstance();
          return true;
        }
        return false;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to cancel workflow');
        setError(error);
        console.error('Cancel workflow error:', err);
        return false;
      }
    },
    [instanceId, cancelWorkflowMutation, refetchInstance]
  );

  // Refresh all data
  const refresh = useCallback(() => {
    refetchInstance();
    if (instanceData?.workflowInstance) {
      refetchState();
      refetchTransitions();
    }
  }, [refetchInstance, refetchState, refetchTransitions, instanceData?.workflowInstance]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !instanceData?.workflowInstance) return;

    const interval = setInterval(refresh, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, instanceData?.workflowInstance, refresh]);

  // Load history on demand
  useEffect(() => {
    if (instanceId && instanceData?.workflowInstance) {
      fetchHistory({ variables: { instanceId } });
    }
  }, [instanceId, instanceData?.workflowInstance, fetchHistory]);

  const workflowInstance = instanceData?.workflowInstance || null;
  const hasWorkflow = !!workflowInstance;
  const isCompleted = workflowInstance?.isCompleted || false;

  return {
    workflowInstance,
    currentState: stateData?.currentWorkflowState || null,
    availableTransitions: transitionsData?.availableTransitions || [],
    history: historyData?.workflowHistory || [],
    states: statesData?.workflowStates || [],
    transitions: allTransitionsData?.workflowTransitions || [],
    loading: instanceLoading || stateLoading,
    transitionsLoading,
    historyLoading,
    startWorkflow,
    executeTransition,
    cancelWorkflow,
    refresh,
    error,
    hasWorkflow,
    isCompleted,
  };
}

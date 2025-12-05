/**
 * useExternalSources Hook
 * Sprint 18 - US-DB-015: External Source Config UI
 */

import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_EXTERNAL_SOURCES,
  GET_ACTIVE_EXTERNAL_SOURCES,
  GET_EXTERNAL_SOURCE,
  CREATE_EXTERNAL_SOURCE,
  UPDATE_EXTERNAL_SOURCE,
  DELETE_EXTERNAL_SOURCE,
  TOGGLE_EXTERNAL_SOURCE_ENABLED,
  TEST_EXTERNAL_SOURCE_CONNECTION,
  SYNC_EXTERNAL_SOURCE,
  type ExternalSource,
  type CreateExternalSourceInput,
  type UpdateExternalSourceInput,
  type TestConnectionResult,
  type SyncResult,
} from '@/lib/graphql/external-sources';

export function useExternalSources() {
  const { data, loading, error, refetch } = useQuery<{
    externalSources: ExternalSource[];
  }>(GET_EXTERNAL_SOURCES);

  return {
    sources: data?.externalSources || [],
    loading,
    error,
    refetch,
  };
}

export function useActiveExternalSources() {
  const { data, loading, error, refetch } = useQuery<{
    activeExternalSources: ExternalSource[];
  }>(GET_ACTIVE_EXTERNAL_SOURCES);

  return {
    sources: data?.activeExternalSources || [],
    loading,
    error,
    refetch,
  };
}

export function useExternalSource(id: string) {
  const { data, loading, error, refetch } = useQuery<{
    externalSource: ExternalSource;
  }>(GET_EXTERNAL_SOURCE, {
    variables: { id },
    skip: !id,
  });

  return {
    source: data?.externalSource,
    loading,
    error,
    refetch,
  };
}

export function useCreateExternalSource() {
  const [createMutation, { loading, error }] = useMutation<
    { createExternalSource: ExternalSource },
    { input: CreateExternalSourceInput }
  >(CREATE_EXTERNAL_SOURCE, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const create = async (input: CreateExternalSourceInput) => {
    const result = await createMutation({ variables: { input } });
    return result.data?.createExternalSource;
  };

  return { create, loading, error };
}

export function useUpdateExternalSource() {
  const [updateMutation, { loading, error }] = useMutation<
    { updateExternalSource: ExternalSource },
    { input: UpdateExternalSourceInput }
  >(UPDATE_EXTERNAL_SOURCE, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const update = async (input: UpdateExternalSourceInput) => {
    const result = await updateMutation({ variables: { input } });
    return result.data?.updateExternalSource;
  };

  return { update, loading, error };
}

export function useDeleteExternalSource() {
  const [deleteMutation, { loading, error }] = useMutation<
    { deleteExternalSource: boolean },
    { id: string }
  >(DELETE_EXTERNAL_SOURCE, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const deleteSource = async (id: string) => {
    const result = await deleteMutation({ variables: { id } });
    return result.data?.deleteExternalSource;
  };

  return { deleteSource, loading, error };
}

export function useToggleExternalSourceEnabled() {
  const [toggleMutation, { loading, error }] = useMutation<
    { toggleExternalSourceEnabled: ExternalSource },
    { id: string }
  >(TOGGLE_EXTERNAL_SOURCE_ENABLED, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const toggle = async (id: string) => {
    const result = await toggleMutation({ variables: { id } });
    return result.data?.toggleExternalSourceEnabled;
  };

  return { toggle, loading, error };
}

export function useTestExternalSourceConnection() {
  const [testMutation, { loading, error }] = useMutation<
    { testExternalSourceConnection: TestConnectionResult },
    { id: string }
  >(TEST_EXTERNAL_SOURCE_CONNECTION, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const testConnection = async (id: string) => {
    const result = await testMutation({ variables: { id } });
    return result.data?.testExternalSourceConnection;
  };

  return { testConnection, loading, error };
}

export function useSyncExternalSource() {
  const [syncMutation, { loading, error }] = useMutation<
    { syncExternalSource: SyncResult },
    { id: string; fullSync?: boolean }
  >(SYNC_EXTERNAL_SOURCE, {
    refetchQueries: [{ query: GET_EXTERNAL_SOURCES }],
  });

  const sync = async (id: string, fullSync = false) => {
    const result = await syncMutation({ variables: { id, fullSync } });
    return result.data?.syncExternalSource;
  };

  return { sync, loading, error };
}

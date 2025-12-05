'use client';

import { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
  GET_DOCUMENT_TYPES,
  GET_ACTIVE_DOCUMENT_TYPES,
  CREATE_DOCUMENT_TYPE,
  UPDATE_DOCUMENT_TYPE,
  DELETE_DOCUMENT_TYPE,
  type DocumentType,
  type CreateDocumentTypeInput,
  type UpdateDocumentTypeInput,
} from '@/lib/graphql/documents';

export function useDocumentTypes() {
  const { data, loading, error, refetch } = useQuery<{
    documentTypes: DocumentType[];
  }>(GET_DOCUMENT_TYPES);

  return {
    documentTypes: data?.documentTypes || [],
    loading,
    error,
    refetch,
  };
}

export function useActiveDocumentTypes() {
  const { data, loading, error } = useQuery<{
    activeDocumentTypes: DocumentType[];
  }>(GET_ACTIVE_DOCUMENT_TYPES);

  return {
    documentTypes: data?.activeDocumentTypes || [],
    loading,
    error,
  };
}

export function useCreateDocumentType() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    createDocumentType: async (input: CreateDocumentTypeInput) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await client.mutate<
          { createDocumentType: DocumentType },
          { input: CreateDocumentTypeInput }
        >({
          mutation: CREATE_DOCUMENT_TYPE,
          variables: { input },
          refetchQueries: [GET_DOCUMENT_TYPES, GET_ACTIVE_DOCUMENT_TYPES],
        });
        return result.data?.createDocumentType;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    loading,
    error,
  };
}

export function useUpdateDocumentType() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    updateDocumentType: async (input: UpdateDocumentTypeInput) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await client.mutate<
          { updateDocumentType: DocumentType },
          { input: UpdateDocumentTypeInput }
        >({
          mutation: UPDATE_DOCUMENT_TYPE,
          variables: { input },
          refetchQueries: [GET_DOCUMENT_TYPES, GET_ACTIVE_DOCUMENT_TYPES],
        });
        return result.data?.updateDocumentType;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    loading,
    error,
  };
}

export function useDeleteDocumentType() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    deleteDocumentType: async (id: string) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await client.mutate<
          { deleteDocumentType: boolean },
          { id: string }
        >({
          mutation: DELETE_DOCUMENT_TYPE,
          variables: { id },
          refetchQueries: [GET_DOCUMENT_TYPES, GET_ACTIVE_DOCUMENT_TYPES],
        });
        return result.data?.deleteDocumentType;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    loading,
    error,
  };
}

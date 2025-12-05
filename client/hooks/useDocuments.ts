'use client';

import { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client/react';
import {
  GET_DOCUMENTS,
  GET_DOCUMENT,
  GET_UPLOAD_PRESIGNED_URL,
  CONFIRM_DOCUMENT_UPLOAD,
  DELETE_DOCUMENT,
  PROCESS_DOCUMENT_FOR_RAG,
  type Document,
  type DocumentsFilterInput,
  type GetUploadPresignedUrlInput,
  type UploadPresignedUrlResponse,
  type ConfirmDocumentUploadInput,
} from '@/lib/graphql/documents';

export function useDocuments(filter?: DocumentsFilterInput) {
  const { data, loading, error, refetch } = useQuery<{
    documents: Document[];
  }>(GET_DOCUMENTS, {
    variables: { filter },
  });

  return {
    documents: data?.documents || [],
    loading,
    error,
    refetch,
  };
}

export function useDocument(id: string) {
  const { data, loading, error } = useQuery<{ document: Document }>(
    GET_DOCUMENT,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    document: data?.document,
    loading,
    error,
  };
}

export function useUploadDocument() {
  const client = useApolloClient();

  const uploadDocument = async (
    file: File,
    documentTypeId: string,
    documentCategoryId?: string
  ): Promise<Document> => {
    // Step 1: Get presigned URL
    const presignedResult = await client.mutate<
      { getUploadPresignedUrl: UploadPresignedUrlResponse },
      { input: GetUploadPresignedUrlInput }
    >({
      mutation: GET_UPLOAD_PRESIGNED_URL,
      variables: {
        input: {
          documentTypeId,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        },
      },
    });

    if (!presignedResult.data) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileKey } = presignedResult.data.getUploadPresignedUrl;

    // Step 2: Upload file to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }

    // Step 3: Confirm upload with backend
    const confirmResult = await client.mutate<
      { confirmDocumentUpload: Document },
      { input: ConfirmDocumentUploadInput }
    >({
      mutation: CONFIRM_DOCUMENT_UPLOAD,
      variables: {
        input: {
          documentTypeId,
          documentCategoryId,
          fileKey,
          originalFilename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      },
      refetchQueries: [GET_DOCUMENTS],
    });

    if (!confirmResult.data) {
      throw new Error('Failed to confirm upload');
    }

    return confirmResult.data.confirmDocumentUpload;
  };

  return { uploadDocument };
}

export function useDeleteDocument() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    deleteDocument: async (id: string) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await client.mutate<
          { deleteDocument: boolean },
          { id: string }
        >({
          mutation: DELETE_DOCUMENT,
          variables: { id },
          refetchQueries: [GET_DOCUMENTS],
        });
        return result.data?.deleteDocument;
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

export function useProcessDocumentForRag() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    processDocument: async (documentId: string) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await client.mutate<
          { processDocumentForRag: Document },
          { documentId: string }
        >({
          mutation: PROCESS_DOCUMENT_FOR_RAG,
          variables: { documentId },
          refetchQueries: [GET_DOCUMENTS],
        });
        return result.data?.processDocumentForRag;
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

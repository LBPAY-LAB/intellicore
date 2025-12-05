'use client';

import { useQuery } from '@apollo/client/react';
import {
  GET_ACTIVE_DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from '@/lib/graphql/documents';

export function useActiveDocumentCategories() {
  const { data, loading, error } = useQuery<{
    activeDocumentCategories: DocumentCategory[];
  }>(GET_ACTIVE_DOCUMENT_CATEGORIES);

  return {
    categories: data?.activeDocumentCategories || [],
    loading,
    error,
  };
}

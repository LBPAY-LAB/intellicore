'use client';

import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import {
  SEMANTIC_SEARCH,
  SEARCH_SUGGESTIONS,
  SemanticSearchInput,
  SemanticSearchResponse,
} from '@/lib/graphql/rag';

export interface UseSemanticSearchResult {
  search: (input: SemanticSearchInput) => Promise<void>;
  searchResults: SemanticSearchResponse | null;
  loading: boolean;
  error: Error | null;
  getSuggestions: (partialQuery: string) => Promise<string[]>;
  suggestionsLoading: boolean;
}

export function useSemanticSearch(): UseSemanticSearchResult {
  const [searchResults, setSearchResults] = useState<SemanticSearchResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [executeSearch, { loading }] = useLazyQuery<{
    semanticSearch: SemanticSearchResponse;
  }>(SEMANTIC_SEARCH, {
    fetchPolicy: 'network-only',
  });

  const [executeSuggestions, { loading: suggestionsLoading }] = useLazyQuery<{
    searchSuggestions: string[];
  }>(SEARCH_SUGGESTIONS, {
    fetchPolicy: 'network-only',
  });

  const search = useCallback(
    async (input: SemanticSearchInput) => {
      try {
        setError(null);

        const { data, error: queryError } = await executeSearch({
          variables: {
            query: input.query,
            limit: input.limit || 10,
            scoreThreshold: input.scoreThreshold || 0.7,
            documentTypeId: input.documentTypeId,
          },
        });

        if (queryError) {
          console.error('Semantic search error:', queryError);
          setError(queryError);
          return;
        }

        if (data?.semanticSearch) {
          setSearchResults(data.semanticSearch);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [executeSearch]
  );

  const getSuggestions = useCallback(
    async (partialQuery: string): Promise<string[]> => {
      if (partialQuery.length < 3) {
        return [];
      }

      try {
        const { data } = await executeSuggestions({
          variables: {
            partialQuery,
            limit: 5,
          },
        });

        return data?.searchSuggestions || [];
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        return [];
      }
    },
    [executeSuggestions]
  );

  return {
    search,
    searchResults,
    loading,
    error,
    getSuggestions,
    suggestionsLoading,
  };
}

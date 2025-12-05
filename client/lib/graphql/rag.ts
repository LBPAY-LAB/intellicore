import { gql } from '@apollo/client';

export const SEMANTIC_SEARCH = gql`
  query SemanticSearch(
    $query: String!
    $limit: Int
    $scoreThreshold: Float
    $documentTypeId: String
  ) {
    semanticSearch(
      input: {
        query: $query
        limit: $limit
        scoreThreshold: $scoreThreshold
        documentTypeId: $documentTypeId
      }
    ) {
      results {
        chunkId
        documentId
        documentTypeId
        documentTypeName
        originalFilename
        chunkIndex
        chunkText
        startOffset
        endOffset
        tokenCount
        score
        createdAt
      }
      total
      query
      processingTimeMs
    }
  }
`;

export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($partialQuery: String!, $limit: Float) {
    searchSuggestions(partialQuery: $partialQuery, limit: $limit)
  }
`;

export interface SearchResultChunk {
  chunkId: string;
  documentId: string;
  documentTypeId: string;
  documentTypeName: string;
  originalFilename: string;
  chunkIndex: number;
  chunkText: string;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
  score: number;
  createdAt: string;
}

export interface SemanticSearchResponse {
  results: SearchResultChunk[];
  total: number;
  query: string;
  processingTimeMs: number;
}

export interface SemanticSearchInput {
  query: string;
  limit?: number;
  scoreThreshold?: number;
  documentTypeId?: string;
}

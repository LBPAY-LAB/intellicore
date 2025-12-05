import { Injectable, Logger } from '@nestjs/common';
import { QdrantService, SearchResult } from '../../vector/qdrant.service';
import { EmbeddingsService } from './embeddings.service';
import { SemanticSearchInput } from './dto/semantic-search.input';
import { SearchResultChunk, SemanticSearchResponse } from './dto/semantic-search.response';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * Performs semantic search across document embeddings
   */
  async semanticSearch(input: SemanticSearchInput): Promise<SemanticSearchResponse> {
    const startTime = Date.now();

    this.logger.log(
      `Semantic search: "${input.query}" (limit: ${input.limit}, threshold: ${input.scoreThreshold})`,
    );

    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.embeddingsService.generateEmbedding(input.query);

      // Search for similar vectors in Qdrant
      const searchParams = {
        vector: queryEmbedding,
        limit: input.limit || 10,
        scoreThreshold: input.scoreThreshold || 0.7,
        filter: input.documentTypeId
          ? { documentTypeId: input.documentTypeId }
          : undefined,
      };

      const results = await this.qdrantService.searchVectors(searchParams);

      // Transform results to GraphQL response format
      const searchResults = results.map((result) => this.transformSearchResult(result));

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Found ${searchResults.length} results in ${processingTime}ms for query: "${input.query}"`,
      );

      return {
        results: searchResults,
        total: searchResults.length,
        query: input.query,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      this.logger.error('Semantic search failed:', error);
      throw error;
    }
  }

  /**
   * Transforms Qdrant search result to GraphQL response format
   */
  private transformSearchResult(result: SearchResult): SearchResultChunk {
    const payload = result.payload;

    return {
      chunkId: result.id,
      documentId: payload.document_id as string,
      documentTypeId: payload.document_type_id as string,
      documentTypeName: payload.document_type_name as string,
      originalFilename: payload.original_filename as string,
      chunkIndex: payload.chunk_index as number,
      chunkText: payload.chunk_text as string,
      startOffset: payload.start_offset as number,
      endOffset: payload.end_offset as number,
      tokenCount: payload.token_count as number,
      score: result.score,
      createdAt: payload.created_at as string,
    };
  }

  /**
   * Gets similar documents based on a document ID
   */
  async findSimilarDocuments(
    documentId: string,
    limit: number = 5,
  ): Promise<SemanticSearchResponse> {
    this.logger.log(`Finding similar documents to: ${documentId}`);

    try {
      // Get first chunk of the document as the query vector
      const documentChunks = await this.qdrantService.searchVectors({
        vector: new Array(768).fill(0), // Dummy vector for filtering
        limit: 1,
        scoreThreshold: 0,
        filter: { documentTypeId: documentId },
      });

      if (documentChunks.length === 0) {
        this.logger.warn(`No embeddings found for document: ${documentId}`);
        return {
          results: [],
          total: 0,
          query: `Similar to document ${documentId}`,
          processingTimeMs: 0,
        };
      }

      // This would need the actual vector from Qdrant - simplified for now
      // In production, you'd retrieve the actual vector and use it for similarity search
      this.logger.log(`Found similar documents query not fully implemented yet`);

      return {
        results: [],
        total: 0,
        query: `Similar to document ${documentId}`,
        processingTimeMs: 0,
      };
    } catch (error) {
      this.logger.error('Find similar documents failed:', error);
      throw error;
    }
  }

  /**
   * Gets search suggestions based on partial query
   */
  async getSearchSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    if (partialQuery.length < 3) {
      return [];
    }

    this.logger.log(`Getting search suggestions for: "${partialQuery}"`);

    try {
      // Generate embedding for partial query
      const queryEmbedding = await this.embeddingsService.generateEmbedding(partialQuery);

      // Search with lower threshold
      const results = await this.qdrantService.searchVectors({
        vector: queryEmbedding,
        limit,
        scoreThreshold: 0.5,
      });

      // Extract unique document filenames as suggestions
      const suggestions = Array.from(
        new Set(
          results.map((r) => r.payload.original_filename as string).filter(Boolean),
        ),
      ).slice(0, limit);

      return suggestions;
    } catch (error) {
      this.logger.error('Get search suggestions failed:', error);
      return [];
    }
  }

  /**
   * Health check for RAG system
   */
  async healthCheck(): Promise<{
    qdrant: boolean;
    ollama: boolean;
    vectorCount: number;
  }> {
    const qdrantHealth = await this.qdrantService.healthCheck();
    const ollamaHealth = await this.embeddingsService.healthCheck();
    const vectorCount = await this.qdrantService.countVectors();

    return {
      qdrant: qdrantHealth,
      ollama: ollamaHealth,
      vectorCount,
    };
  }
}

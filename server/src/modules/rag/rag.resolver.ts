import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { RagService } from './rag.service';
import { SemanticSearchInput } from './dto/semantic-search.input';
import { SemanticSearchResponse } from './dto/semantic-search.response';

@Resolver()
export class RagResolver {
  private readonly logger = new Logger(RagResolver.name);

  constructor(private readonly ragService: RagService) {}

  @Query(() => SemanticSearchResponse, {
    description: 'Performs semantic search across document embeddings',
  })
  async semanticSearch(
    @Args('input') input: SemanticSearchInput,
  ): Promise<SemanticSearchResponse> {
    this.logger.log(`GraphQL semanticSearch query: "${input.query}"`);
    return this.ragService.semanticSearch(input);
  }

  @Query(() => [String], {
    description: 'Gets search suggestions based on partial query',
  })
  async searchSuggestions(
    @Args('partialQuery') partialQuery: string,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 5 })
    limit: number,
  ): Promise<string[]> {
    this.logger.log(`GraphQL searchSuggestions query: "${partialQuery}"`);
    return this.ragService.getSearchSuggestions(partialQuery, limit);
  }
}

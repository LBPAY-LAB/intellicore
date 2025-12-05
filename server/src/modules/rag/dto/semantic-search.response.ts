import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SearchResultChunk {
  @Field()
  chunkId: string;

  @Field()
  documentId: string;

  @Field()
  documentTypeId: string;

  @Field()
  documentTypeName: string;

  @Field()
  originalFilename: string;

  @Field(() => Int)
  chunkIndex: number;

  @Field()
  chunkText: string;

  @Field(() => Int)
  startOffset: number;

  @Field(() => Int)
  endOffset: number;

  @Field(() => Int)
  tokenCount: number;

  @Field(() => Float)
  score: number;

  @Field()
  createdAt: string;
}

@ObjectType()
export class SemanticSearchResponse {
  @Field(() => [SearchResultChunk])
  results: SearchResultChunk[];

  @Field(() => Int)
  total: number;

  @Field()
  query: string;

  @Field(() => Float)
  processingTimeMs: number;
}

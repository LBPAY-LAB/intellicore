import { ObjectType, Field } from '@nestjs/graphql';

/**
 * Page info for cursor-based pagination
 * Shared across all paginated responses
 */
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ObjectRelationshipEntity } from '../entities/object-relationship.entity';
import { PageInfo } from '../../../common/dto/page-info.dto';

/**
 * Paginated response for relationships
 */
@ObjectType()
export class PaginatedRelationshipsResponse {
  @Field(() => [ObjectRelationshipEntity])
  nodes: ObjectRelationshipEntity[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

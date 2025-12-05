import { ObjectType, Field } from '@nestjs/graphql';
import { ObjectTypeEntity } from '../entities/object-type.entity';
import { PageInfo } from '../../../common/dto/page-info.dto';

@ObjectType()
export class PaginatedObjectTypesResponse {
  @Field(() => [ObjectTypeEntity])
  nodes: ObjectTypeEntity[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

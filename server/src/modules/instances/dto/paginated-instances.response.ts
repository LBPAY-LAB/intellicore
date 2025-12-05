import { ObjectType, Field } from '@nestjs/graphql';
import { InstanceEntity } from '../entities/instance.entity';

@ObjectType()
export class InstancePageInfo {
  @Field()
  hasNextPage: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class PaginatedInstancesResponse {
  @Field(() => [InstanceEntity])
  nodes: InstanceEntity[];

  @Field(() => InstancePageInfo)
  pageInfo: InstancePageInfo;

  @Field()
  totalCount: number;
}

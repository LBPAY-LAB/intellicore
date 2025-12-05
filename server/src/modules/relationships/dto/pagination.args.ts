import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, Max } from 'class-validator';

/**
 * Pagination arguments for relationship queries
 */
@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsPositive()
  @Max(100)
  first?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  after?: string;
}

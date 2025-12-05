import { ArgsType, Field, Int, ID } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsUUID, IsEnum } from 'class-validator';
import { InstanceStatus } from '../entities/instance.entity';

@ArgsType()
export class InstancePaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  after?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  objectTypeId?: string;

  @Field(() => InstanceStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InstanceStatus)
  status?: InstanceStatus;
}

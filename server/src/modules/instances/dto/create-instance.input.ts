import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { InstanceStatus } from '../entities/instance.entity';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateInstanceInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  objectTypeId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  data?: Record<string, any>;

  @Field(() => InstanceStatus, { nullable: true, defaultValue: InstanceStatus.DRAFT })
  @IsEnum(InstanceStatus)
  @IsOptional()
  status?: InstanceStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  displayName?: string;
}

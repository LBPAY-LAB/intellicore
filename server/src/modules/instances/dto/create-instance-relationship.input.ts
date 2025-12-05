import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateInstanceRelationshipInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  sourceInstanceId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  targetInstanceId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  objectRelationshipId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

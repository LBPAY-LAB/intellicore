import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { RelationshipType, Cardinality } from '../entities/object-relationship.entity';
import GraphQLJSON from 'graphql-type-json';

/**
 * Input type for updating an existing relationship
 */
@InputType()
export class UpdateRelationshipInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => RelationshipType, { nullable: true })
  @IsEnum(RelationshipType)
  @IsOptional()
  relationship_type?: RelationshipType;

  @Field(() => Cardinality, { nullable: true })
  @IsEnum(Cardinality)
  @IsOptional()
  cardinality?: Cardinality;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_bidirectional?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  relationship_rules?: Record<string, any>;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

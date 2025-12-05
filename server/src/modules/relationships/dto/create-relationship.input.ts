import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { RelationshipType, Cardinality } from '../entities/object-relationship.entity';
import GraphQLJSON from 'graphql-type-json';

/**
 * Input type for creating a new relationship between ObjectTypes
 */
@InputType()
export class CreateRelationshipInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  source_id: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  target_id: string;

  @Field(() => RelationshipType)
  @IsEnum(RelationshipType)
  @IsNotEmpty()
  relationship_type: RelationshipType;

  @Field(() => Cardinality)
  @IsEnum(Cardinality)
  @IsNotEmpty()
  cardinality: Cardinality;

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
}

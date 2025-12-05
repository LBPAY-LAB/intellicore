import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { FieldType } from '../entities/field.entity';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateFieldInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  object_type_id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => FieldType)
  @IsEnum(FieldType)
  field_type: FieldType;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  validation_rules?: Record<string, any>;
}

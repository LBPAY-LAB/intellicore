import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { FieldType } from '../entities/field.entity';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateFieldInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => FieldType, { nullable: true })
  @IsEnum(FieldType)
  @IsOptional()
  field_type?: FieldType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  validation_rules?: Record<string, any>;
}

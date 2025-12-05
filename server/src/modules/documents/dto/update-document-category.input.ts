import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsArray, MaxLength, IsOptional, IsObject, ValidateNested, IsUUID, IsBoolean, IsEnum, IsIn, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { GoldLayer } from '../entities/document-category.entity';

class RagConfigInput {
  @IsIn(['fixed', 'semantic', 'paragraph'])
  chunkingStrategy: 'fixed' | 'semantic' | 'paragraph';

  @IsInt()
  @Min(100)
  @Max(10000)
  chunkSize: number;

  @IsInt()
  @Min(0)
  @Max(5000)
  chunkOverlap: number;

  @IsString()
  @IsNotEmpty()
  embeddingModel: string;
}

@InputType()
export class UpdateDocumentCategoryInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @ValidateNested()
  @Type(() => RagConfigInput)
  @IsOptional()
  ragConfig?: {
    chunkingStrategy: 'fixed' | 'semantic' | 'paragraph';
    chunkSize: number;
    chunkOverlap: number;
    embeddingModel: string;
  };

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  metadataSchema?: Record<string, any>;

  @Field(() => [GoldLayer], { nullable: true })
  @IsArray()
  @IsEnum(GoldLayer, { each: true })
  @IsOptional()
  targetGoldLayers?: GoldLayer[];

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

import { Field, InputType, Float, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, Min, Max } from 'class-validator';

@InputType()
export class AIChatInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  context?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  useRag?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentCategoryIds?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(2)
  temperature?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(4096)
  maxTokens?: number;

  @Field({ nullable: true, description: 'LLM model to use for this request (e.g., llama3.1:8b)' })
  @IsOptional()
  @IsString()
  model?: string;
}

@InputType()
export class CreateChatSessionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  context?: string;
}

@InputType()
export class DictValidationInput {
  @Field()
  @IsString()
  requestType: string; // REGISTRO_CHAVE, EXCLUSAO_CHAVE, PORTABILIDADE, REIVINDICACAO

  @Field()
  @IsString()
  keyType: string; // CPF, CNPJ, EMAIL, TELEFONE, EVP

  @Field()
  @IsString()
  keyValue: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  participantIspb?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ownerDocument?: string;
}

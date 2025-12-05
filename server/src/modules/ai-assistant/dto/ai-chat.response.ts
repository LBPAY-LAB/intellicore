import { Field, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class LLMModelDetails {
  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  family?: string;

  @Field({ nullable: true })
  parameterSize?: string;

  @Field({ nullable: true })
  quantizationLevel?: string;
}

@ObjectType()
export class LLMModel {
  @Field()
  name: string;

  @Field({ nullable: true })
  modifiedAt?: string;

  @Field(() => Float, { nullable: true })
  size?: number;

  @Field({ nullable: true })
  digest?: string;

  @Field(() => LLMModelDetails, { nullable: true })
  details?: LLMModelDetails;
}

@ObjectType()
export class LLMModelsResponse {
  @Field(() => [LLMModel])
  models: LLMModel[];

  @Field()
  defaultModel: string;

  @Field({ nullable: true })
  selectedModel?: string;
}

@ObjectType()
export class ChatSource {
  @Field()
  documentId: string;

  @Field()
  documentName: string;

  @Field()
  chunkText: string;

  @Field(() => Float)
  score: number;

  @Field(() => Int, { nullable: true })
  pageNumber?: number;
}

@ObjectType()
export class AIChatResponse {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field()
  role: string;

  @Field(() => [ChatSource], { nullable: true })
  sources?: ChatSource[];

  @Field(() => Int)
  processingTimeMs: number;

  @Field()
  model: string;

  @Field()
  createdAt: string;
}

@ObjectType()
export class ChatMessage {
  @Field()
  id: string;

  @Field()
  role: string;

  @Field()
  content: string;

  @Field(() => [ChatSource], { nullable: true })
  sources?: ChatSource[];

  @Field()
  createdAt: string;
}

@ObjectType()
export class ChatSession {
  @Field()
  id: string;

  @Field()
  sessionId: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  context?: string;

  @Field(() => [ChatMessage])
  messages: ChatMessage[];

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class DictValidationError {
  @Field()
  field: string;

  @Field()
  message: string;

  @Field()
  severity: string;

  @Field({ nullable: true })
  suggestion?: string;
}

@ObjectType()
export class DictValidationWarning {
  @Field()
  field: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  suggestion?: string;
}

@ObjectType()
export class DictValidationSuggestion {
  @Field()
  field: string;

  @Field()
  currentValue: string;

  @Field()
  suggestedValue: string;

  @Field()
  reason: string;
}

@ObjectType()
export class DictValidationResult {
  @Field()
  isValid: boolean;

  @Field(() => Float)
  validationScore: number;

  @Field(() => [DictValidationError])
  errors: DictValidationError[];

  @Field(() => [DictValidationWarning])
  warnings: DictValidationWarning[];

  @Field(() => [DictValidationSuggestion])
  suggestions: DictValidationSuggestion[];

  @Field(() => [ChatSource])
  sources: ChatSource[];

  @Field(() => Int)
  processingTimeMs: number;
}

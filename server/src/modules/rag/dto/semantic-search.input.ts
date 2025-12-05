import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max, IsNumber, IsUUID } from 'class-validator';

@InputType()
export class SemanticSearchInput {
  @Field()
  @IsString()
  query: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Float, { nullable: true, defaultValue: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  scoreThreshold?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  documentTypeId?: string;
}

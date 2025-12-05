import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, IsInt, Min, Max, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateDocumentTypeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  allowedExtensions: string[];

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(500)
  maxFileSizeMb: number;
}

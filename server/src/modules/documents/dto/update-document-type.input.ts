import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, IsInt, Min, Max, MaxLength, IsOptional, IsUUID, IsBoolean } from 'class-validator';

@InputType()
export class UpdateDocumentTypeInput {
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

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  allowedExtensions?: string[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  maxFileSizeMb?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

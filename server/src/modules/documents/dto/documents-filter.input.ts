import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class DocumentsFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  documentTypeId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

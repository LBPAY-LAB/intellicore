import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';

@InputType()
export class UpdateObjectTypeInput {
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
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

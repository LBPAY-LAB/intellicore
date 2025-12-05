import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { InstanceStatus } from '../entities/instance.entity';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateInstanceInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  data?: Record<string, any>;

  @Field(() => InstanceStatus, { nullable: true })
  @IsEnum(InstanceStatus)
  @IsOptional()
  status?: InstanceStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  displayName?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

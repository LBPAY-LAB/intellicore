/**
 * External Source Input DTOs
 * Sprint 18 - US-DB-013/014: External Data Source Configuration
 */

import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { ExternalSourceType, ExternalSourceStatus } from '../entities/external-source.entity';

@InputType()
export class CreateExternalSourceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ExternalSourceType)
  @IsEnum(ExternalSourceType)
  sourceType: ExternalSourceType;

  @Field(() => GraphQLJSON)
  connectionConfig: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  syncConfig?: Record<string, any>;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

@InputType()
export class UpdateExternalSourceInput extends PartialType(CreateExternalSourceInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => ExternalSourceStatus, { nullable: true })
  @IsEnum(ExternalSourceStatus)
  @IsOptional()
  status?: ExternalSourceStatus;
}

@InputType()
export class TestExternalSourceInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class SyncExternalSourceInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  fullSync?: boolean;
}

// Connection config types for each source type
@InputType()
export class TigerBeetleConnectionConfig {
  @Field()
  @IsString()
  @IsNotEmpty()
  clusterAddress: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  clusterId: string;
}

@InputType()
export class PostgresConnectionConfig {
  @Field()
  @IsString()
  @IsNotEmpty()
  host: string;

  @Field()
  port: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  database: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  schema?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  ssl?: boolean;
}

@InputType()
export class RestApiConnectionConfig {
  @Field()
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  headers?: Record<string, string>;

  @Field({ nullable: true })
  timeout?: number;
}

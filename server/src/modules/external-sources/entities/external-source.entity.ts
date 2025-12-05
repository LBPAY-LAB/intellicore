/**
 * ExternalSource Entity
 * Sprint 18 - US-DB-013/014: External Data Source Configuration
 *
 * Stores configuration for external data sources (TigerBeetle, CoreBanking DB, etc.)
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

export enum ExternalSourceType {
  TIGERBEETLE = 'tigerbeetle',
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  REST_API = 'rest_api',
  GRAPHQL_API = 'graphql_api',
  WEB_CRAWLER = 'web_crawler',
}

export enum ExternalSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  TESTING = 'testing',
}

registerEnumType(ExternalSourceType, {
  name: 'ExternalSourceType',
  description: 'Type of external data source',
});

registerEnumType(ExternalSourceStatus, {
  name: 'ExternalSourceStatus',
  description: 'Status of external data source connection',
});

@ObjectType()
@Entity('external_sources')
export class ExternalSource {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => ExternalSourceType)
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ExternalSourceType,
    enumName: 'external_source_type_enum',
    default: ExternalSourceType.POSTGRES,
  })
  sourceType: ExternalSourceType;

  @Field(() => ExternalSourceStatus)
  @Column({
    name: 'status',
    type: 'enum',
    enum: ExternalSourceStatus,
    enumName: 'external_source_status_enum',
    default: ExternalSourceStatus.INACTIVE,
  })
  status: ExternalSourceStatus;

  @Field(() => GraphQLJSON)
  @Column({ name: 'connection_config', type: 'jsonb', default: {} })
  connectionConfig: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ name: 'sync_config', type: 'jsonb', nullable: true })
  syncConfig: Record<string, any>;

  @Field({ nullable: true })
  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'last_sync_error', type: 'text', nullable: true })
  lastSyncError: string;

  @Field()
  @Column({ name: 'sync_success_count', default: 0 })
  syncSuccessCount: number;

  @Field()
  @Column({ name: 'sync_failure_count', default: 0 })
  syncFailureCount: number;

  @Field({ nullable: true })
  @Column({ name: 'last_tested_at', nullable: true })
  lastTestedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'last_test_success', default: false })
  lastTestSuccess: boolean;

  @Field({ nullable: true })
  @Column({ name: 'last_test_message', type: 'text', nullable: true })
  lastTestMessage: string;

  @Field()
  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}

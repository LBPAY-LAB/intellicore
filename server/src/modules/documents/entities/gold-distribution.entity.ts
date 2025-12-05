import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Document } from './document.entity';
import { SilverChunk } from './silver-chunk.entity';

export enum GoldDistributionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

registerEnumType(GoldDistributionStatus, {
  name: 'GoldDistributionStatus',
  description: 'Distribution status for each gold layer',
});

export interface DistributionMetadata {
  // Target gold layers
  targetLayers?: string[];

  // Gold A (Trino) metadata
  trinoTable?: string;
  trinoPartition?: string;

  // Gold B (NebulaGraph) metadata
  nebulaSpace?: string;
  nebulaTag?: string;

  // Gold C (Qdrant) metadata
  qdrantCollection?: string;
  embeddingModel?: string;
  embeddingDimension?: number;

  // General metadata
  processingDurationMs?: number;
  retryCount?: number;
  lastError?: string;
}

@ObjectType()
@Entity('gold_distributions')
@Index('idx_gold_distributions_silver_chunk_id', ['silverChunkId'])
@Index('idx_gold_distributions_document_id', ['documentId'])
@Index('idx_gold_distributions_chunk_unique', ['silverChunkId'], { unique: true })
export class GoldDistribution {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ name: 'silver_chunk_id', type: 'uuid' })
  silverChunkId: string;

  @Field(() => SilverChunk)
  @OneToOne(() => SilverChunk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'silver_chunk_id' })
  silverChunk: SilverChunk;

  @Field(() => ID)
  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Field(() => Document)
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  // Gold A - Trino Analytics
  @Field({ nullable: true })
  @Column({ name: 'gold_a_record_id', type: 'varchar', length: 100, nullable: true })
  goldARecordId?: string;

  @Field(() => GoldDistributionStatus)
  @Column({
    name: 'gold_a_status',
    type: 'varchar',
    length: 20,
    default: GoldDistributionStatus.PENDING,
  })
  goldAStatus: GoldDistributionStatus;

  @Field({ nullable: true })
  @Column({ name: 'gold_a_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldADistributedAt?: Date;

  // Gold B - NebulaGraph Knowledge Graph
  @Field({ nullable: true })
  @Column({ name: 'gold_b_node_id', type: 'varchar', length: 100, nullable: true })
  goldBNodeId?: string;

  @Field(() => GoldDistributionStatus)
  @Column({
    name: 'gold_b_status',
    type: 'varchar',
    length: 20,
    default: GoldDistributionStatus.PENDING,
  })
  goldBStatus: GoldDistributionStatus;

  @Field({ nullable: true })
  @Column({ name: 'gold_b_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldBDistributedAt?: Date;

  // Gold C - Qdrant Vector Embeddings
  @Field({ nullable: true })
  @Column({ name: 'gold_c_vector_id', type: 'varchar', length: 255, nullable: true })
  goldCVectorId?: string;

  @Field(() => GoldDistributionStatus)
  @Column({
    name: 'gold_c_status',
    type: 'varchar',
    length: 20,
    default: GoldDistributionStatus.PENDING,
  })
  goldCStatus: GoldDistributionStatus;

  @Field({ nullable: true })
  @Column({ name: 'gold_c_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldCDistributedAt?: Date;

  @Field(() => GraphQLJSON)
  @Column({
    name: 'distribution_metadata',
    type: 'jsonb',
    default: {},
  })
  distributionMetadata: DistributionMetadata;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

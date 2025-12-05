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
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Document } from './document.entity';

export enum SilverProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(SilverProcessingStatus, {
  name: 'SilverProcessingStatus',
  description: 'Processing status for silver layer chunks',
});

export interface SectionHierarchy {
  level: number;
  title: string;
  index: number;
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  startOffset?: number;
  endOffset?: number;
}

@ObjectType()
@Entity('silver_chunks')
@Index('idx_silver_chunks_document_id', ['documentId'])
@Index('idx_silver_chunks_processing_status', ['processingStatus'])
@Index('idx_silver_chunks_document_chunk', ['documentId', 'chunkIndex'], { unique: true })
export class SilverChunk {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Field(() => Document)
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Field(() => Int)
  @Column({ name: 'chunk_index', type: 'integer' })
  chunkIndex: number;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field(() => Int)
  @Column({ name: 'token_count', type: 'integer' })
  tokenCount: number;

  @Field(() => GraphQLJSON)
  @Column({
    name: 'section_hierarchy',
    type: 'jsonb',
    default: [],
  })
  sectionHierarchy: SectionHierarchy[];

  @Field(() => Int, { nullable: true })
  @Column({ name: 'page_number', type: 'integer', nullable: true })
  pageNumber?: number;

  @Field()
  @Column({ name: 'has_table', type: 'boolean', default: false })
  hasTable: boolean;

  @Field()
  @Column({ name: 'has_image', type: 'boolean', default: false })
  hasImage: boolean;

  @Field(() => GraphQLJSON)
  @Column({
    name: 'extracted_entities',
    type: 'jsonb',
    default: [],
  })
  extractedEntities: ExtractedEntity[];

  @Field(() => SilverProcessingStatus)
  @Column({
    name: 'processing_status',
    type: 'varchar',
    length: 20,
    default: SilverProcessingStatus.PENDING,
  })
  processingStatus: SilverProcessingStatus;

  @Field({ nullable: true })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { DocumentType } from './document-type.entity';

@ObjectType()
@Entity('documents')
@Index('idx_documents_file_key', ['fileKey'], { unique: true })
@Index('idx_documents_document_type_id', ['documentTypeId'])
@Index('idx_documents_uploaded_by', ['uploadedBy'])
@Index('idx_documents_created_at', ['createdAt'])
export class Document {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @Field(() => DocumentType)
  @ManyToOne(() => DocumentType, (documentType) => documentType.documents, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;

  @Field()
  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename: string;

  @Field()
  @Column({ name: 'stored_filename', type: 'varchar', length: 255 })
  storedFilename: string;

  @Field()
  @Column({ name: 'file_key', type: 'varchar', length: 500, unique: true })
  fileKey: string;

  @Field(() => Int)
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Field()
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Field()
  @Column({ name: 's3_bucket', type: 'varchar', length: 100 })
  s3Bucket: string;

  @Field({ nullable: true })
  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText?: string;

  @Field()
  @Column({ name: 'is_processed', type: 'boolean', default: false })
  isProcessed: boolean;

  @Field()
  @Column({
    name: 'embedding_status',
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';

  @Field({ nullable: true })
  @Column({ name: 'embedding_error', type: 'text', nullable: true })
  embeddingError?: string;

  @Field({ nullable: true })
  @Column({ name: 'embedded_at', type: 'timestamp with time zone', nullable: true })
  embeddedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'document_category_id', type: 'uuid', nullable: true })
  documentCategoryId?: string;

  @Field({ nullable: true })
  @Column({ name: 'bronze_processed_at', type: 'timestamp with time zone', nullable: true })
  bronzeProcessedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ name: 'bronze_metadata', type: 'jsonb', nullable: true })
  bronzeMetadata?: Record<string, any>;

  // Silver Layer fields
  @Field({ nullable: true })
  @Column({ name: 'silver_processed_at', type: 'timestamp with time zone', nullable: true })
  silverProcessedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ name: 'silver_metadata', type: 'jsonb', nullable: true })
  silverMetadata?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'silver_chunk_count', type: 'integer', nullable: true, default: 0 })
  silverChunkCount?: number;

  // Gold Layer distribution fields
  @Field({ nullable: true })
  @Column({ name: 'gold_a_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldADistributedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'gold_b_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldBDistributedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'gold_c_distributed_at', type: 'timestamp with time zone', nullable: true })
  goldCDistributedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'gold_distribution_status', type: 'varchar', length: 20, nullable: true, default: 'pending' })
  goldDistributionStatus?: 'pending' | 'processing' | 'partial' | 'completed' | 'failed';

  @Field()
  @Column({ name: 'uploaded_by', type: 'varchar', length: 255 })
  uploadedBy: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}

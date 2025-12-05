import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

export enum GoldLayer {
  A = 'A',
  B = 'B',
  C = 'C',
}

registerEnumType(GoldLayer, {
  name: 'GoldLayer',
  description: 'Gold layer classification for document distribution',
});

export interface RagConfig {
  chunkingStrategy: 'fixed' | 'semantic' | 'paragraph';
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
}

export interface MetadataSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required?: boolean;
    description?: string;
    enum?: any[];
    validation?: any;
  };
}

@ObjectType()
@Entity('document_categories')
@Index('idx_document_categories_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
@Index('idx_document_categories_is_active', ['isActive'])
export class DocumentCategory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => GraphQLJSON)
  @Column({
    name: 'rag_config',
    type: 'jsonb',
    default: {
      chunkingStrategy: 'semantic',
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-small',
    },
  })
  ragConfig: RagConfig;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    name: 'metadata_schema',
    type: 'jsonb',
    nullable: true,
  })
  metadataSchema?: MetadataSchema;

  @Field(() => [GoldLayer])
  @Column({
    name: 'target_gold_layers',
    type: 'text',
    transformer: {
      to: (value: GoldLayer[]) => value?.join(',') || '',
      from: (value: string) => value?.split(',').filter(v => v) as GoldLayer[] || [],
    },
  })
  targetGoldLayers: GoldLayer[];

  @Field()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Document } from './document.entity';

@ObjectType()
@Entity('document_types')
@Index('idx_document_types_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class DocumentType {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => [String])
  @Column({ name: 'allowed_extensions', type: 'text', transformer: {
    to: (value: string[]) => value?.join(',') || '',
    from: (value: string) => value?.split(',').filter(v => v) || []
  }})
  allowedExtensions: string[];

  @Field(() => Int)
  @Column({ name: 'max_file_size_mb', type: 'int', default: 50 })
  maxFileSizeMb: number;

  @Field()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => [Document], { nullable: true })
  @OneToMany(() => Document, (document) => document.documentType)
  documents?: Document[];

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

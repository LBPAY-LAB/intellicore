import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
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
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';

/**
 * Relationship types between ObjectTypes
 */
export enum RelationshipType {
  PARENT_OF = 'PARENT_OF',
  CHILD_OF = 'CHILD_OF',
  HAS_ONE = 'HAS_ONE',
  HAS_MANY = 'HAS_MANY',
  BELONGS_TO = 'BELONGS_TO',
}

registerEnumType(RelationshipType, {
  name: 'RelationshipType',
  description: 'Types of relationships between ObjectTypes',
});

/**
 * Cardinality constraints for relationships
 */
export enum Cardinality {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

registerEnumType(Cardinality, {
  name: 'Cardinality',
  description: 'Cardinality constraints for relationships',
});

/**
 * ObjectRelationship entity representing relationships between ObjectTypes
 * Supports graph-based data modeling with validation and traversal capabilities
 */
@ObjectType()
@Entity('object_relationships')
@Index(['source_id', 'target_id', 'relationship_type'], { unique: true })
@Index(['source_id'])
@Index(['target_id'])
export class ObjectRelationshipEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  source_id: string;

  @Field(() => ObjectTypeEntity)
  @ManyToOne(() => ObjectTypeEntity, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'source_id' })
  source: ObjectTypeEntity;

  @Field()
  @Column('uuid')
  target_id: string;

  @Field(() => ObjectTypeEntity)
  @ManyToOne(() => ObjectTypeEntity, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'target_id' })
  target: ObjectTypeEntity;

  @Field(() => RelationshipType)
  @Column({
    type: 'enum',
    enum: RelationshipType,
  })
  relationship_type: RelationshipType;

  @Field(() => Cardinality)
  @Column({
    type: 'enum',
    enum: Cardinality,
  })
  cardinality: Cardinality;

  @Field()
  @Column({ default: false })
  is_bidirectional: boolean;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  @Column('jsonb', { nullable: true })
  relationship_rules?: any;

  @Field()
  @Column({ default: true })
  is_active: boolean;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deleted_at?: Date;
}

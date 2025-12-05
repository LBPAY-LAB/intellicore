import { ObjectType, Field, ID } from '@nestjs/graphql';
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
import { InstanceEntity } from './instance.entity';
import { ObjectRelationshipEntity } from '../../relationships/entities/object-relationship.entity';
import GraphQLJSON from 'graphql-type-json';

/**
 * InstanceRelationship entity representing links between instances
 * Based on ObjectRelationship definitions (meta-layer)
 */
@ObjectType()
@Entity('instance_relationships')
@Index(['sourceInstanceId', 'targetInstanceId', 'objectRelationshipId'], { unique: true })
@Index(['sourceInstanceId'])
@Index(['targetInstanceId'])
@Index(['objectRelationshipId'])
export class InstanceRelationshipEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'source_instance_id' })
  sourceInstanceId: string;

  @Field(() => InstanceEntity)
  @ManyToOne(() => InstanceEntity, (instance) => instance.outgoingRelationships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_instance_id' })
  sourceInstance: InstanceEntity;

  @Field()
  @Column({ name: 'target_instance_id' })
  targetInstanceId: string;

  @Field(() => InstanceEntity)
  @ManyToOne(() => InstanceEntity, (instance) => instance.incomingRelationships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_instance_id' })
  targetInstance: InstanceEntity;

  @Field()
  @Column({ name: 'object_relationship_id' })
  objectRelationshipId: string;

  @Field(() => ObjectRelationshipEntity)
  @ManyToOne(() => ObjectRelationshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'object_relationship_id' })
  objectRelationship: ObjectRelationshipEntity;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

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

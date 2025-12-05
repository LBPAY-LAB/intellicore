/**
 * WorkflowDefinition Entity
 * Sprint 12 - US-059: Workflow State Machine
 *
 * Defines a workflow with states and transitions for an ObjectType.
 */

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';
import GraphQLJSON from 'graphql-type-json';

export enum WorkflowType {
  LINEAR = 'LINEAR',         // Simple linear progression
  STATE_MACHINE = 'STATE_MACHINE', // Complex state machine with multiple paths
  APPROVAL = 'APPROVAL',     // Approval workflow with approve/reject
}

registerEnumType(WorkflowType, {
  name: 'WorkflowType',
  description: 'Type of workflow',
});

@ObjectType()
@Entity('workflow_definitions')
@Index(['objectTypeId'])
@Index(['name'])
export class WorkflowDefinitionEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => WorkflowType)
  @Column({
    type: 'enum',
    enum: WorkflowType,
    default: WorkflowType.STATE_MACHINE,
  })
  workflowType: WorkflowType;

  @Field({ nullable: true })
  @Column({ name: 'object_type_id', nullable: true })
  objectTypeId?: string;

  @Field(() => ObjectTypeEntity, { nullable: true })
  @ManyToOne(() => ObjectTypeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'object_type_id' })
  objectType?: ObjectTypeEntity;

  @Field(() => String)
  @Column({ name: 'initial_state', length: 50 })
  initialState: string;

  @Field(() => [String])
  @Column('simple-array', { name: 'final_states' })
  finalStates: string[];

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field()
  @Column({ default: 1 })
  version: number;

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

  // Relations to states - loaded separately
  states?: WorkflowStateEntity[];

  // Relations to transitions - loaded separately
  transitions?: WorkflowTransitionEntity[];
}

@ObjectType()
@Entity('workflow_states')
@Index(['workflowId', 'name'], { unique: true })
export class WorkflowStateEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => WorkflowDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowDefinitionEntity;

  @Field()
  @Column({ length: 50 })
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'display_name', length: 100, nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  color?: string;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  icon?: string;

  @Field()
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { name: 'entry_actions', default: [] })
  entryActions: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { name: 'exit_actions', default: [] })
  exitActions: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@ObjectType()
@Entity('workflow_transitions')
@Index(['workflowId'])
@Index(['fromState', 'toState'])
export class WorkflowTransitionEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => WorkflowDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowDefinitionEntity;

  @Field()
  @Column({ name: 'from_state', length: 50 })
  fromState: string;

  @Field()
  @Column({ name: 'to_state', length: 50 })
  toState: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { default: [] })
  conditions: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { default: [] })
  actions: any[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { name: 'required_roles', nullable: true })
  requiredRoles?: string[];

  @Field()
  @Column({ name: 'requires_comment', default: false })
  requiresComment: boolean;

  @Field()
  @Column({ name: 'is_automatic', default: false })
  isAutomatic: boolean;

  @Field()
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

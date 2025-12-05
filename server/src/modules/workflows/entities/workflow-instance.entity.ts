/**
 * WorkflowInstance Entity
 * Sprint 12 - US-059: Workflow State Machine
 *
 * Tracks the workflow state for a specific instance.
 */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkflowDefinitionEntity } from './workflow-definition.entity';
import { InstanceEntity } from '../../instances/entities/instance.entity';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('workflow_instances')
@Index(['instanceId'], { unique: true })
@Index(['workflowId'])
@Index(['currentState'])
export class WorkflowInstanceEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'instance_id' })
  instanceId: string;

  @ManyToOne(() => InstanceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instance_id' })
  instance: InstanceEntity;

  @Field()
  @Column({ name: 'workflow_id' })
  workflowId: string;

  @Field(() => WorkflowDefinitionEntity)
  @ManyToOne(() => WorkflowDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowDefinitionEntity;

  @Field()
  @Column({ name: 'current_state', length: 50 })
  currentState: string;

  @Field({ nullable: true })
  @Column({ name: 'previous_state', length: 50, nullable: true })
  previousState?: string;

  @Field()
  @Column({ name: 'workflow_version', default: 1 })
  workflowVersion: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { name: 'context_data', default: {} })
  contextData: Record<string, any>;

  @Field()
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Field({ nullable: true })
  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  @Column({ name: 'started_by', nullable: true })
  startedBy?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // History loaded separately
  history?: WorkflowHistoryEntity[];
}

@ObjectType()
@Entity('workflow_history')
@Index(['workflowInstanceId'])
@Index(['createdAt'])
export class WorkflowHistoryEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'workflow_instance_id' })
  workflowInstanceId: string;

  @ManyToOne(() => WorkflowInstanceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_instance_id' })
  workflowInstance: WorkflowInstanceEntity;

  @Field()
  @Column({ name: 'from_state', length: 50 })
  fromState: string;

  @Field()
  @Column({ name: 'to_state', length: 50 })
  toState: string;

  @Field()
  @Column({ name: 'transition_name', length: 100 })
  transitionName: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { name: 'transition_data', default: {} })
  transitionData: Record<string, any>;

  @Field({ nullable: true })
  @Column({ name: 'performed_by', nullable: true })
  performedBy?: string;

  @Field()
  @Column({ name: 'duration_ms', default: 0 })
  durationMs: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

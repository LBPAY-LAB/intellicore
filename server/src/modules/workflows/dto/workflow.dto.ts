/**
 * Workflow DTOs
 * Sprint 12 - US-059: Workflow State Machine
 */

import { InputType, Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { WorkflowType } from '../entities/workflow-definition.entity';

// ==================
// INPUT TYPES
// ==================

@InputType()
export class CreateWorkflowInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => WorkflowType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkflowType)
  workflowType?: WorkflowType;

  @Field({ nullable: true })
  @IsOptional()
  objectTypeId?: string;

  @Field()
  @IsNotEmpty()
  initialState: string;

  @Field(() => [String])
  @IsArray()
  finalStates: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateWorkflowInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => WorkflowType, { nullable: true })
  @IsOptional()
  workflowType?: WorkflowType;

  @Field({ nullable: true })
  @IsOptional()
  objectTypeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  initialState?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  finalStates?: string[];

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class CreateStateInput {
  @Field(() => ID)
  @IsNotEmpty()
  workflowId: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  displayOrder?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  entryActions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  exitActions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateStateInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  displayOrder?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  entryActions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  exitActions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class CreateTransitionInput {
  @Field(() => ID)
  @IsNotEmpty()
  workflowId: string;

  @Field()
  @IsNotEmpty()
  fromState: string;

  @Field()
  @IsNotEmpty()
  toState: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  actions?: any[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredRoles?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  displayOrder?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateTransitionInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  actions?: any[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  requiredRoles?: string[];

  @Field({ nullable: true })
  @IsOptional()
  requiresComment?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  isAutomatic?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  displayOrder?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class ExecuteTransitionInput {
  @Field(() => ID)
  @IsNotEmpty()
  instanceId: string;

  @Field(() => ID)
  @IsNotEmpty()
  transitionId: string;

  @Field({ nullable: true })
  @IsOptional()
  comment?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  transitionData?: Record<string, any>;
}

@InputType()
export class StartWorkflowInput {
  @Field(() => ID)
  @IsNotEmpty()
  instanceId: string;

  @Field(() => ID)
  @IsNotEmpty()
  workflowId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  contextData?: Record<string, any>;
}

// ==================
// OUTPUT TYPES
// ==================

@ObjectType()
export class AvailableTransitionOutput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  toState: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  requiresComment: boolean;

  @Field(() => [String], { nullable: true })
  requiredRoles?: string[];
}

@ObjectType()
export class TransitionResultOutput {
  @Field()
  success: boolean;

  @Field()
  fromState: string;

  @Field()
  toState: string;

  @Field(() => ID)
  historyEntryId: string;
}

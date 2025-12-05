/**
 * WorkflowsResolver
 * Sprint 12 - US-059: Workflow State Machine
 *
 * GraphQL resolver for workflow operations.
 */

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Public } from '../../auth/decorators/public.decorator';
import { Auth } from '../../auth/decorators/auth.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { WorkflowDefinitionService } from './services/workflow-definition.service';
import { WorkflowEngineService } from './services/workflow-engine.service';
import {
  WorkflowDefinitionEntity,
  WorkflowStateEntity,
  WorkflowTransitionEntity,
} from './entities/workflow-definition.entity';
import {
  WorkflowInstanceEntity,
  WorkflowHistoryEntity,
} from './entities/workflow-instance.entity';
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  CreateStateInput,
  UpdateStateInput,
  CreateTransitionInput,
  UpdateTransitionInput,
  ExecuteTransitionInput,
  StartWorkflowInput,
  AvailableTransitionOutput,
  TransitionResultOutput,
} from './dto/workflow.dto';

interface User {
  id: string;
  roles?: string[];
}

@Resolver()
export class WorkflowsResolver {
  constructor(
    private readonly definitionService: WorkflowDefinitionService,
    private readonly engineService: WorkflowEngineService,
  ) {}

  // ==================
  // WORKFLOW DEFINITION QUERIES
  // ==================

  @Public()
  @Query(() => WorkflowDefinitionEntity, { name: 'workflow', nullable: true })
  async getWorkflow(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<WorkflowDefinitionEntity | null> {
    try {
      return await this.definitionService.getWorkflow(id);
    } catch {
      return null;
    }
  }

  @Public()
  @Query(() => [WorkflowDefinitionEntity], { name: 'workflows' })
  async getWorkflows(
    @Args('objectTypeId', { type: () => ID, nullable: true }) objectTypeId?: string,
  ): Promise<WorkflowDefinitionEntity[]> {
    return this.definitionService.getAllWorkflows(objectTypeId);
  }

  @Public()
  @Query(() => WorkflowDefinitionEntity, { name: 'workflowByObjectType', nullable: true })
  async getWorkflowByObjectType(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
  ): Promise<WorkflowDefinitionEntity | null> {
    return this.definitionService.getWorkflowByObjectType(objectTypeId);
  }

  @Public()
  @Query(() => [WorkflowStateEntity], { name: 'workflowStates' })
  async getWorkflowStates(
    @Args('workflowId', { type: () => ID }) workflowId: string,
  ): Promise<WorkflowStateEntity[]> {
    return this.definitionService.getStates(workflowId);
  }

  @Public()
  @Query(() => [WorkflowTransitionEntity], { name: 'workflowTransitions' })
  async getWorkflowTransitions(
    @Args('workflowId', { type: () => ID }) workflowId: string,
  ): Promise<WorkflowTransitionEntity[]> {
    return this.definitionService.getTransitions(workflowId);
  }

  // ==================
  // WORKFLOW INSTANCE QUERIES
  // ==================

  @Public()
  @Query(() => WorkflowInstanceEntity, { name: 'workflowInstance', nullable: true })
  async getWorkflowInstance(
    @Args('instanceId', { type: () => ID }) instanceId: string,
  ): Promise<WorkflowInstanceEntity | null> {
    return this.engineService.getWorkflowInstance(instanceId);
  }

  @Public()
  @Query(() => WorkflowStateEntity, { name: 'currentWorkflowState', nullable: true })
  async getCurrentWorkflowState(
    @Args('instanceId', { type: () => ID }) instanceId: string,
  ): Promise<WorkflowStateEntity | null> {
    return this.engineService.getCurrentState(instanceId);
  }

  @Public()
  @Query(() => [AvailableTransitionOutput], { name: 'availableTransitions' })
  async getAvailableTransitions(
    @Args('instanceId', { type: () => ID }) instanceId: string,
    @CurrentUser() user?: User,
  ): Promise<AvailableTransitionOutput[]> {
    return this.engineService.getAvailableTransitions(instanceId, user?.roles);
  }

  @Public()
  @Query(() => [WorkflowHistoryEntity], { name: 'workflowHistory' })
  async getWorkflowHistory(
    @Args('instanceId', { type: () => ID }) instanceId: string,
  ): Promise<WorkflowHistoryEntity[]> {
    return this.engineService.getWorkflowHistory(instanceId);
  }

  // ==================
  // WORKFLOW DEFINITION MUTATIONS
  // ==================

  @Auth('admin')
  @Mutation(() => WorkflowDefinitionEntity, { name: 'createWorkflow' })
  async createWorkflow(
    @Args('input') input: CreateWorkflowInput,
    @CurrentUser() user?: User,
  ): Promise<WorkflowDefinitionEntity> {
    return this.definitionService.createWorkflow(input, user?.id);
  }

  @Auth('admin')
  @Mutation(() => WorkflowDefinitionEntity, { name: 'updateWorkflow' })
  async updateWorkflow(
    @Args('input') input: UpdateWorkflowInput,
  ): Promise<WorkflowDefinitionEntity> {
    const { id, ...data } = input;
    return this.definitionService.updateWorkflow(id, data);
  }

  @Auth('admin')
  @Mutation(() => Boolean, { name: 'deleteWorkflow' })
  async deleteWorkflow(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.definitionService.deleteWorkflow(id);
  }

  @Auth('admin')
  @Mutation(() => WorkflowStateEntity, { name: 'createWorkflowState' })
  async createState(
    @Args('input') input: CreateStateInput,
  ): Promise<WorkflowStateEntity> {
    return this.definitionService.createState(input);
  }

  @Auth('admin')
  @Mutation(() => WorkflowStateEntity, { name: 'updateWorkflowState' })
  async updateState(
    @Args('input') input: UpdateStateInput,
  ): Promise<WorkflowStateEntity> {
    const { id, ...data } = input;
    return this.definitionService.updateState(id, data);
  }

  @Auth('admin')
  @Mutation(() => Boolean, { name: 'deleteWorkflowState' })
  async deleteState(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.definitionService.deleteState(id);
  }

  @Auth('admin')
  @Mutation(() => WorkflowTransitionEntity, { name: 'createWorkflowTransition' })
  async createTransition(
    @Args('input') input: CreateTransitionInput,
  ): Promise<WorkflowTransitionEntity> {
    return this.definitionService.createTransition(input);
  }

  @Auth('admin')
  @Mutation(() => WorkflowTransitionEntity, { name: 'updateWorkflowTransition' })
  async updateTransition(
    @Args('input') input: UpdateTransitionInput,
  ): Promise<WorkflowTransitionEntity> {
    const { id, ...data } = input;
    return this.definitionService.updateTransition(id, data);
  }

  @Auth('admin')
  @Mutation(() => Boolean, { name: 'deleteWorkflowTransition' })
  async deleteTransition(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.definitionService.deleteTransition(id);
  }

  @Auth('admin')
  @Mutation(() => WorkflowDefinitionEntity, { name: 'createDefaultInstanceWorkflow' })
  async createDefaultWorkflow(): Promise<WorkflowDefinitionEntity> {
    return this.definitionService.createDefaultInstanceWorkflow();
  }

  // ==================
  // WORKFLOW ENGINE MUTATIONS
  // ==================

  @Auth()
  @Mutation(() => WorkflowInstanceEntity, { name: 'startWorkflow' })
  async startWorkflow(
    @Args('input') input: StartWorkflowInput,
    @CurrentUser() user?: User,
  ): Promise<WorkflowInstanceEntity> {
    return this.engineService.startWorkflow(
      input.instanceId,
      input.workflowId,
      user?.id,
      input.contextData,
    );
  }

  @Auth()
  @Mutation(() => TransitionResultOutput, { name: 'executeTransition' })
  async executeTransition(
    @Args('input') input: ExecuteTransitionInput,
    @CurrentUser() user?: User,
  ): Promise<TransitionResultOutput> {
    const result = await this.engineService.executeTransition(
      input.instanceId,
      input.transitionId,
      user?.id,
      input.comment,
      input.transitionData,
    );

    return {
      success: result.success,
      fromState: result.fromState,
      toState: result.toState,
      historyEntryId: result.historyEntry.id,
    };
  }

  @Auth()
  @Mutation(() => Boolean, { name: 'cancelWorkflow' })
  async cancelWorkflow(
    @Args('instanceId', { type: () => ID }) instanceId: string,
    @Args('reason', { nullable: true }) reason?: string,
    @CurrentUser() user?: User,
  ): Promise<boolean> {
    return this.engineService.cancelWorkflow(instanceId, user?.id, reason);
  }
}

/**
 * WorkflowEngineService
 * Sprint 12 - US-059: Workflow State Machine
 *
 * Core state machine engine for managing workflow transitions.
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  WorkflowDefinitionEntity,
  WorkflowStateEntity,
  WorkflowTransitionEntity,
} from '../entities/workflow-definition.entity';
import {
  WorkflowInstanceEntity,
  WorkflowHistoryEntity,
} from '../entities/workflow-instance.entity';
import { InstanceEntity } from '../../instances/entities/instance.entity';

// Events
export const WORKFLOW_STARTED = 'workflow.started';
export const WORKFLOW_TRANSITIONED = 'workflow.transitioned';
export const WORKFLOW_COMPLETED = 'workflow.completed';

export interface WorkflowEvent {
  workflowInstance: WorkflowInstanceEntity;
  instance: InstanceEntity;
  userId?: string;
}

export interface TransitionEvent extends WorkflowEvent {
  fromState: string;
  toState: string;
  transitionName: string;
  comment?: string;
}

export interface AvailableTransition {
  id: string;
  name: string;
  toState: string;
  description?: string;
  requiresComment: boolean;
  requiredRoles?: string[];
}

export interface TransitionResult {
  success: boolean;
  workflowInstance: WorkflowInstanceEntity;
  fromState: string;
  toState: string;
  historyEntry: WorkflowHistoryEntity;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(WorkflowDefinitionEntity)
    private readonly workflowDefRepo: Repository<WorkflowDefinitionEntity>,
    @InjectRepository(WorkflowStateEntity)
    private readonly stateRepo: Repository<WorkflowStateEntity>,
    @InjectRepository(WorkflowTransitionEntity)
    private readonly transitionRepo: Repository<WorkflowTransitionEntity>,
    @InjectRepository(WorkflowInstanceEntity)
    private readonly workflowInstanceRepo: Repository<WorkflowInstanceEntity>,
    @InjectRepository(WorkflowHistoryEntity)
    private readonly historyRepo: Repository<WorkflowHistoryEntity>,
    @InjectRepository(InstanceEntity)
    private readonly instanceRepo: Repository<InstanceEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Start a workflow for an instance
   */
  async startWorkflow(
    instanceId: string,
    workflowId: string,
    userId?: string,
    contextData?: Record<string, any>,
  ): Promise<WorkflowInstanceEntity> {
    // Check if instance exists
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
    });
    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found`);
    }

    // Check if workflow exists and is active
    const workflow = await this.workflowDefRepo.findOne({
      where: { id: workflowId, isActive: true },
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found or inactive`);
    }

    // Check if instance already has a workflow
    const existing = await this.workflowInstanceRepo.findOne({
      where: { instanceId },
    });
    if (existing) {
      throw new BadRequestException(
        `Instance ${instanceId} already has a workflow. Complete or cancel it first.`
      );
    }

    // Create workflow instance
    const workflowInstance = this.workflowInstanceRepo.create({
      instanceId,
      workflowId,
      currentState: workflow.initialState,
      workflowVersion: workflow.version,
      contextData: contextData || {},
      startedBy: userId,
    });

    const saved = await this.workflowInstanceRepo.save(workflowInstance);

    // Create initial history entry
    await this.historyRepo.save(
      this.historyRepo.create({
        workflowInstanceId: saved.id,
        fromState: '',
        toState: workflow.initialState,
        transitionName: 'START',
        performedBy: userId,
        durationMs: 0,
      })
    );

    // Emit event
    this.eventEmitter.emit(WORKFLOW_STARTED, {
      workflowInstance: saved,
      instance,
      userId,
    } as WorkflowEvent);

    this.logger.log(`Started workflow ${workflowId} for instance ${instanceId}`);
    return saved;
  }

  /**
   * Get available transitions for a workflow instance
   */
  async getAvailableTransitions(
    instanceId: string,
    userRoles?: string[],
  ): Promise<AvailableTransition[]> {
    const workflowInstance = await this.workflowInstanceRepo.findOne({
      where: { instanceId },
    });

    if (!workflowInstance) {
      return [];
    }

    if (workflowInstance.isCompleted) {
      return [];
    }

    // Get transitions from current state
    const transitions = await this.transitionRepo.find({
      where: {
        workflowId: workflowInstance.workflowId,
        fromState: workflowInstance.currentState,
      },
      order: { displayOrder: 'ASC' },
    });

    // Filter by roles if specified
    const available: AvailableTransition[] = [];
    for (const t of transitions) {
      // Check role requirements
      if (t.requiredRoles && t.requiredRoles.length > 0 && userRoles) {
        const hasRole = t.requiredRoles.some((r) => userRoles.includes(r));
        if (!hasRole) continue;
      }

      // Skip automatic transitions (they're handled internally)
      if (t.isAutomatic) continue;

      available.push({
        id: t.id,
        name: t.name,
        toState: t.toState,
        description: t.description,
        requiresComment: t.requiresComment,
        requiredRoles: t.requiredRoles,
      });
    }

    return available;
  }

  /**
   * Execute a transition
   */
  async executeTransition(
    instanceId: string,
    transitionId: string,
    userId?: string,
    comment?: string,
    transitionData?: Record<string, any>,
  ): Promise<TransitionResult> {
    const startTime = Date.now();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get workflow instance
      const workflowInstance = await queryRunner.manager.findOne(WorkflowInstanceEntity, {
        where: { instanceId },
      });

      if (!workflowInstance) {
        throw new NotFoundException(`No workflow found for instance ${instanceId}`);
      }

      if (workflowInstance.isCompleted) {
        throw new BadRequestException('Workflow is already completed');
      }

      // Get transition
      const transition = await queryRunner.manager.findOne(WorkflowTransitionEntity, {
        where: { id: transitionId },
      });

      if (!transition) {
        throw new NotFoundException(`Transition ${transitionId} not found`);
      }

      // Validate transition is valid from current state
      if (transition.fromState !== workflowInstance.currentState) {
        throw new BadRequestException(
          `Transition ${transition.name} is not valid from state ${workflowInstance.currentState}`
        );
      }

      // Check comment requirement
      if (transition.requiresComment && !comment) {
        throw new BadRequestException(`Transition ${transition.name} requires a comment`);
      }

      // Execute transition
      const previousState = workflowInstance.currentState;
      workflowInstance.previousState = previousState;
      workflowInstance.currentState = transition.toState;

      // Update context data if provided
      if (transitionData) {
        workflowInstance.contextData = {
          ...workflowInstance.contextData,
          ...transitionData,
        };
      }

      // Check if this is a final state
      const workflow = await queryRunner.manager.findOne(WorkflowDefinitionEntity, {
        where: { id: workflowInstance.workflowId },
      });

      if (workflow && workflow.finalStates.includes(transition.toState)) {
        workflowInstance.isCompleted = true;
        workflowInstance.completedAt = new Date();
      }

      await queryRunner.manager.save(workflowInstance);

      // Create history entry
      const durationMs = Date.now() - startTime;
      const historyEntry = await queryRunner.manager.save(
        queryRunner.manager.create(WorkflowHistoryEntity, {
          workflowInstanceId: workflowInstance.id,
          fromState: previousState,
          toState: transition.toState,
          transitionName: transition.name,
          comment,
          transitionData: transitionData || {},
          performedBy: userId,
          durationMs,
        })
      );

      await queryRunner.commitTransaction();

      // Get instance for event
      const instance = await this.instanceRepo.findOne({
        where: { id: instanceId },
      });

      // Emit events
      this.eventEmitter.emit(WORKFLOW_TRANSITIONED, {
        workflowInstance,
        instance,
        fromState: previousState,
        toState: transition.toState,
        transitionName: transition.name,
        comment,
        userId,
      } as TransitionEvent);

      if (workflowInstance.isCompleted) {
        this.eventEmitter.emit(WORKFLOW_COMPLETED, {
          workflowInstance,
          instance,
          userId,
        } as WorkflowEvent);
      }

      this.logger.log(
        `Executed transition ${transition.name}: ${previousState} -> ${transition.toState} for instance ${instanceId}`
      );

      return {
        success: true,
        workflowInstance,
        fromState: previousState,
        toState: transition.toState,
        historyEntry,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get workflow instance for an entity instance
   */
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstanceEntity | null> {
    return this.workflowInstanceRepo.findOne({
      where: { instanceId },
      relations: ['workflow'],
    });
  }

  /**
   * Get workflow history
   */
  async getWorkflowHistory(instanceId: string): Promise<WorkflowHistoryEntity[]> {
    const workflowInstance = await this.workflowInstanceRepo.findOne({
      where: { instanceId },
    });

    if (!workflowInstance) {
      return [];
    }

    return this.historyRepo.find({
      where: { workflowInstanceId: workflowInstance.id },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get current state details
   */
  async getCurrentState(instanceId: string): Promise<WorkflowStateEntity | null> {
    const workflowInstance = await this.workflowInstanceRepo.findOne({
      where: { instanceId },
    });

    if (!workflowInstance) {
      return null;
    }

    return this.stateRepo.findOne({
      where: {
        workflowId: workflowInstance.workflowId,
        name: workflowInstance.currentState,
      },
    });
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(
    instanceId: string,
    userId?: string,
    reason?: string,
  ): Promise<boolean> {
    const workflowInstance = await this.workflowInstanceRepo.findOne({
      where: { instanceId },
    });

    if (!workflowInstance) {
      throw new NotFoundException(`No workflow found for instance ${instanceId}`);
    }

    if (workflowInstance.isCompleted) {
      throw new BadRequestException('Workflow is already completed');
    }

    // Add cancellation history
    await this.historyRepo.save(
      this.historyRepo.create({
        workflowInstanceId: workflowInstance.id,
        fromState: workflowInstance.currentState,
        toState: 'CANCELLED',
        transitionName: 'CANCEL',
        comment: reason,
        performedBy: userId,
        durationMs: 0,
      })
    );

    // Remove workflow instance
    await this.workflowInstanceRepo.remove(workflowInstance);

    this.logger.log(`Cancelled workflow for instance ${instanceId}`);
    return true;
  }
}

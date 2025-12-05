/**
 * WorkflowDefinitionService
 * Sprint 12 - US-059: Workflow State Machine
 *
 * Service for managing workflow definitions, states, and transitions.
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  WorkflowDefinitionEntity,
  WorkflowStateEntity,
  WorkflowTransitionEntity,
  WorkflowType,
} from '../entities/workflow-definition.entity';

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  workflowType?: WorkflowType;
  objectTypeId?: string;
  initialState: string;
  finalStates: string[];
  metadata?: Record<string, any>;
}

export interface CreateStateInput {
  workflowId: string;
  name: string;
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  entryActions?: any[];
  exitActions?: any[];
  metadata?: Record<string, any>;
}

export interface CreateTransitionInput {
  workflowId: string;
  fromState: string;
  toState: string;
  name: string;
  description?: string;
  conditions?: any[];
  actions?: any[];
  requiredRoles?: string[];
  requiresComment?: boolean;
  isAutomatic?: boolean;
  displayOrder?: number;
  metadata?: Record<string, any>;
}

export interface WorkflowWithDetails extends WorkflowDefinitionEntity {
  states: WorkflowStateEntity[];
  transitions: WorkflowTransitionEntity[];
}

@Injectable()
export class WorkflowDefinitionService {
  private readonly logger = new Logger(WorkflowDefinitionService.name);

  constructor(
    @InjectRepository(WorkflowDefinitionEntity)
    private readonly workflowRepo: Repository<WorkflowDefinitionEntity>,
    @InjectRepository(WorkflowStateEntity)
    private readonly stateRepo: Repository<WorkflowStateEntity>,
    @InjectRepository(WorkflowTransitionEntity)
    private readonly transitionRepo: Repository<WorkflowTransitionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new workflow definition
   */
  async createWorkflow(
    input: CreateWorkflowInput,
    userId?: string,
  ): Promise<WorkflowDefinitionEntity> {
    // Validate initial state is not empty
    if (!input.initialState) {
      throw new BadRequestException('Initial state is required');
    }

    // Validate final states
    if (!input.finalStates || input.finalStates.length === 0) {
      throw new BadRequestException('At least one final state is required');
    }

    const workflow = this.workflowRepo.create({
      ...input,
      createdBy: userId,
    });

    const saved = await this.workflowRepo.save(workflow);

    // Auto-create initial state
    await this.createState({
      workflowId: saved.id,
      name: input.initialState,
      displayName: this.formatStateName(input.initialState),
      displayOrder: 0,
    });

    // Auto-create final states
    for (let i = 0; i < input.finalStates.length; i++) {
      await this.createState({
        workflowId: saved.id,
        name: input.finalStates[i],
        displayName: this.formatStateName(input.finalStates[i]),
        displayOrder: 100 + i,
      });
    }

    this.logger.log(`Created workflow: ${saved.id} - ${saved.name}`);
    return saved;
  }

  /**
   * Get workflow by ID with states and transitions
   */
  async getWorkflow(id: string): Promise<WorkflowWithDetails> {
    const workflow = await this.workflowRepo.findOne({
      where: { id },
      relations: ['objectType'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    const states = await this.stateRepo.find({
      where: { workflowId: id },
      order: { displayOrder: 'ASC' },
    });

    const transitions = await this.transitionRepo.find({
      where: { workflowId: id },
      order: { displayOrder: 'ASC' },
    });

    return {
      ...workflow,
      states,
      transitions,
    };
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(objectTypeId?: string): Promise<WorkflowDefinitionEntity[]> {
    const where: any = {};
    if (objectTypeId) {
      where.objectTypeId = objectTypeId;
    }

    return this.workflowRepo.find({
      where,
      relations: ['objectType'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get workflow by ObjectType
   */
  async getWorkflowByObjectType(objectTypeId: string): Promise<WorkflowWithDetails | null> {
    const workflow = await this.workflowRepo.findOne({
      where: { objectTypeId, isActive: true },
    });

    if (!workflow) {
      return null;
    }

    return this.getWorkflow(workflow.id);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    id: string,
    input: Partial<CreateWorkflowInput>,
  ): Promise<WorkflowDefinitionEntity> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    Object.assign(workflow, input);
    workflow.version += 1;

    return this.workflowRepo.save(workflow);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    const workflow = await this.workflowRepo.findOne({ where: { id } });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    await this.workflowRepo.softDelete(id);
    this.logger.log(`Deleted workflow: ${id}`);
    return true;
  }

  /**
   * Create a state
   */
  async createState(input: CreateStateInput): Promise<WorkflowStateEntity> {
    // Check workflow exists
    const workflow = await this.workflowRepo.findOne({
      where: { id: input.workflowId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${input.workflowId} not found`);
    }

    // Check state name uniqueness within workflow
    const existing = await this.stateRepo.findOne({
      where: { workflowId: input.workflowId, name: input.name },
    });

    if (existing) {
      throw new BadRequestException(
        `State ${input.name} already exists in workflow ${input.workflowId}`
      );
    }

    const state = this.stateRepo.create(input);
    return this.stateRepo.save(state);
  }

  /**
   * Update state
   */
  async updateState(
    id: string,
    input: Partial<CreateStateInput>,
  ): Promise<WorkflowStateEntity> {
    const state = await this.stateRepo.findOne({ where: { id } });

    if (!state) {
      throw new NotFoundException(`State ${id} not found`);
    }

    Object.assign(state, input);
    return this.stateRepo.save(state);
  }

  /**
   * Delete state
   */
  async deleteState(id: string): Promise<boolean> {
    const state = await this.stateRepo.findOne({ where: { id } });

    if (!state) {
      throw new NotFoundException(`State ${id} not found`);
    }

    await this.stateRepo.delete(id);
    return true;
  }

  /**
   * Create a transition
   */
  async createTransition(input: CreateTransitionInput): Promise<WorkflowTransitionEntity> {
    // Check workflow exists
    const workflow = await this.workflowRepo.findOne({
      where: { id: input.workflowId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${input.workflowId} not found`);
    }

    // Validate states exist
    const fromState = await this.stateRepo.findOne({
      where: { workflowId: input.workflowId, name: input.fromState },
    });

    if (!fromState) {
      throw new BadRequestException(`From state ${input.fromState} not found in workflow`);
    }

    const toState = await this.stateRepo.findOne({
      where: { workflowId: input.workflowId, name: input.toState },
    });

    if (!toState) {
      throw new BadRequestException(`To state ${input.toState} not found in workflow`);
    }

    const transition = this.transitionRepo.create(input);
    return this.transitionRepo.save(transition);
  }

  /**
   * Update transition
   */
  async updateTransition(
    id: string,
    input: Partial<CreateTransitionInput>,
  ): Promise<WorkflowTransitionEntity> {
    const transition = await this.transitionRepo.findOne({ where: { id } });

    if (!transition) {
      throw new NotFoundException(`Transition ${id} not found`);
    }

    Object.assign(transition, input);
    return this.transitionRepo.save(transition);
  }

  /**
   * Delete transition
   */
  async deleteTransition(id: string): Promise<boolean> {
    const transition = await this.transitionRepo.findOne({ where: { id } });

    if (!transition) {
      throw new NotFoundException(`Transition ${id} not found`);
    }

    await this.transitionRepo.delete(id);
    return true;
  }

  /**
   * Get states for workflow
   */
  async getStates(workflowId: string): Promise<WorkflowStateEntity[]> {
    return this.stateRepo.find({
      where: { workflowId },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Get transitions for workflow
   */
  async getTransitions(workflowId: string): Promise<WorkflowTransitionEntity[]> {
    return this.transitionRepo.find({
      where: { workflowId },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Create default instance workflow
   */
  async createDefaultInstanceWorkflow(): Promise<WorkflowDefinitionEntity> {
    // Check if already exists
    const existing = await this.workflowRepo.findOne({
      where: { name: 'Default Instance Workflow' },
    });

    if (existing) {
      return existing;
    }

    const workflow = await this.createWorkflow({
      name: 'Default Instance Workflow',
      description: 'Default workflow for instance lifecycle management',
      workflowType: WorkflowType.STATE_MACHINE,
      initialState: 'DRAFT',
      finalStates: ['ARCHIVED', 'DELETED'],
      metadata: { isDefault: true },
    });

    // Add intermediate states
    await this.createState({
      workflowId: workflow.id,
      name: 'ACTIVE',
      displayName: 'Ativo',
      color: '#22c55e',
      displayOrder: 1,
    });

    await this.createState({
      workflowId: workflow.id,
      name: 'INACTIVE',
      displayName: 'Inativo',
      color: '#64748b',
      displayOrder: 2,
    });

    // Add transitions
    const transitions = [
      { from: 'DRAFT', to: 'ACTIVE', name: 'Ativar' },
      { from: 'DRAFT', to: 'DELETED', name: 'Excluir' },
      { from: 'ACTIVE', to: 'INACTIVE', name: 'Desativar' },
      { from: 'ACTIVE', to: 'ARCHIVED', name: 'Arquivar' },
      { from: 'ACTIVE', to: 'DELETED', name: 'Excluir' },
      { from: 'INACTIVE', to: 'ACTIVE', name: 'Reativar' },
      { from: 'INACTIVE', to: 'ARCHIVED', name: 'Arquivar' },
      { from: 'INACTIVE', to: 'DELETED', name: 'Excluir' },
      { from: 'ARCHIVED', to: 'ACTIVE', name: 'Restaurar' },
      { from: 'ARCHIVED', to: 'DELETED', name: 'Excluir Permanentemente' },
    ];

    for (const t of transitions) {
      await this.createTransition({
        workflowId: workflow.id,
        fromState: t.from,
        toState: t.to,
        name: t.name,
      });
    }

    this.logger.log('Created default instance workflow');
    return workflow;
  }

  /**
   * Format state name for display
   */
  private formatStateName(name: string): string {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

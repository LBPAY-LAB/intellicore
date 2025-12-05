/**
 * WorkflowsModule
 * Sprint 12 - US-059: Workflow State Machine
 *
 * Module for workflow state machine functionality.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinitionService } from './services/workflow-definition.service';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { WorkflowsResolver } from './workflows.resolver';
import {
  WorkflowDefinitionEntity,
  WorkflowStateEntity,
  WorkflowTransitionEntity,
} from './entities/workflow-definition.entity';
import {
  WorkflowInstanceEntity,
  WorkflowHistoryEntity,
} from './entities/workflow-instance.entity';
import { InstanceEntity } from '../instances/entities/instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowDefinitionEntity,
      WorkflowStateEntity,
      WorkflowTransitionEntity,
      WorkflowInstanceEntity,
      WorkflowHistoryEntity,
      InstanceEntity,
    ]),
  ],
  providers: [
    WorkflowDefinitionService,
    WorkflowEngineService,
    WorkflowsResolver,
  ],
  exports: [
    WorkflowDefinitionService,
    WorkflowEngineService,
  ],
})
export class WorkflowsModule {}

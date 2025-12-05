/**
 * Workflows Module Exports
 * Sprint 12 - US-059: Workflow State Machine
 */

export * from './workflows.module';
export * from './entities/workflow-definition.entity';
export * from './entities/workflow-instance.entity';
export { WorkflowDefinitionService } from './services/workflow-definition.service';
export type { WorkflowWithDetails } from './services/workflow-definition.service';
export * from './services/workflow-engine.service';
// DTOs exported from dto file - these are the GraphQL input/output types
export {
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

/**
 * Types for Natural Language Assistant
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptSuggestion {
  id: string;
  text: string;
  category: 'general' | 'object-creation' | 'query' | 'help';
  icon?: string;
}

export interface OracleIdentity {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
}

// Wizard Types
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WizardState {
  currentStep: WizardStep;
  answers: {
    objectName?: string;
    fields?: FieldDefinition[];
    validations?: ValidationRule[];
    states?: StateDefinition[];
    transitions?: TransitionDefinition[];
    uiConfig?: UIConfiguration;
  };
  isComplete: boolean;
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message?: string;
}

export interface StateDefinition {
  name: string;
  description?: string;
  color?: string;
}

export interface TransitionDefinition {
  from: string;
  to: string;
  action?: string;
  conditions?: string[];
}

export interface UIConfiguration {
  icon?: string;
  color?: string;
  displayName?: string;
  listFields?: string[];
  detailFields?: string[];
}

export interface GeneratedObjectDefinition {
  name: string;
  description: string;
  schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  validations?: ValidationRule[];
  states?: StateDefinition[];
  state_machine?: {
    initial_state: string;
    states: string[];
    transitions: TransitionDefinition[];
  };
  ui_schema?: UIConfiguration;
}

// API Types
export interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  suggested_actions?: string[];
  metadata?: Record<string, any>;
}

export interface GenerateObjectDefinitionRequest {
  wizard_answers: WizardState['answers'];
}

export interface GenerateObjectDefinitionResponse {
  object_definition: GeneratedObjectDefinition;
  preview_json: string;
}

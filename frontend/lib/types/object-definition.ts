/**
 * Object Definition Types
 * Based on backend models
 */

export interface ObjectDefinitionSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface FSMState {
  initial: string;
  states: string[];
  transitions: FSMTransition[];
}

export interface FSMTransition {
  from: string;
  to: string;
  event: string;
  conditions?: string[];
}

export interface ValidationRule {
  name: string;
  type: 'regex' | 'function' | 'api_call';
  config: Record<string, any>;
}

export interface UIHints {
  widgets?: Record<string, string>;
  help_text?: Record<string, string>;
  labels?: Record<string, string>;
  [key: string]: any;
}

export interface ObjectDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  version: number;
  schema: ObjectDefinitionSchema;
  rules?: ValidationRule[];
  states?: FSMState;
  ui_hints?: UIHints;
  relationships?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectDefinitionRequest {
  name: string;
  display_name: string;
  description?: string;
  schema: ObjectDefinitionSchema;
  rules?: ValidationRule[];
  states?: FSMState;
  ui_hints?: UIHints;
  relationships?: string[];
}

export interface UpdateObjectDefinitionRequest {
  display_name?: string;
  description?: string;
  schema?: ObjectDefinitionSchema;
  rules?: ValidationRule[];
  states?: FSMState;
  ui_hints?: UIHints;
  relationships?: string[];
  is_active?: boolean;
}

export interface ObjectDefinitionFilters {
  name?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface ObjectDefinitionListResponse {
  data: ObjectDefinition[];
  total: number;
  page: number;
  page_size: number;
}

// Object Definition Types
export type ObjectCategory =
  | 'BUSINESS_ENTITY'
  | 'ORACLE'
  | 'TRANSACTION'
  | 'RELATIONSHIP'
  | 'WORKFLOW'
  | 'CONFIGURATION';

export interface FSMTransition {
  from: string;
  to: string;
  event: string;
  conditions?: Record<string, any>;
}

export interface FSMDefinition {
  initial: string;
  states: string[];
  transitions: FSMTransition[];
}

export interface UIHints {
  icon?: string;
  color?: string;
  description?: string;
}

export interface ObjectDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: ObjectCategory;
  schema: Record<string, any>; // JSON Schema
  fsm?: FSMDefinition;
  ui_hints?: UIHints;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectDefinitionRequest {
  name: string;
  display_name: string;
  description?: string;
  category: ObjectCategory;
  schema: Record<string, any>;
  fsm?: FSMDefinition;
  ui_hints?: UIHints;
}

export interface UpdateObjectDefinitionRequest {
  display_name?: string;
  description?: string;
  category?: ObjectCategory;
  schema?: Record<string, any>;
  fsm?: FSMDefinition;
  ui_hints?: UIHints;
  is_active?: boolean;
}

export interface ListObjectDefinitionsParams {
  category?: ObjectCategory;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

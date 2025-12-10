import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cacheKeys } from '../react-query-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types
export interface ObjectDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  version: number;
  schema: Record<string, any>;
  rules: any[];
  states: Record<string, any>;
  ui_hints: Record<string, any>;
  relationships: any[];
  category?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

export interface ObjectDefinitionFilters {
  category?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateObjectDefinitionRequest {
  name: string;
  display_name: string;
  description: string;
  schema: Record<string, any>;
  rules?: any[];
  states?: Record<string, any>;
  ui_hints?: Record<string, any>;
  relationships?: any[];
  category?: string;
}

export interface UpdateObjectDefinitionRequest {
  display_name?: string;
  description?: string;
  schema?: Record<string, any>;
  rules?: any[];
  states?: Record<string, any>;
  ui_hints?: Record<string, any>;
  relationships?: any[];
  category?: string;
  is_active?: boolean;
}

// API functions
const api = {
  async getObjectDefinitions(filters?: ObjectDefinitionFilters): Promise<ObjectDefinition[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await fetch(`${API_URL}/api/v1/object-definitions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch object definitions');

    return response.json();
  },

  async getObjectDefinitionById(id: string): Promise<ObjectDefinition> {
    const response = await fetch(`${API_URL}/api/v1/object-definitions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch object definition');

    return response.json();
  },

  async getObjectDefinitionSchema(id: string): Promise<Record<string, any>> {
    const response = await fetch(`${API_URL}/api/v1/object-definitions/${id}/schema`);
    if (!response.ok) throw new Error('Failed to fetch schema');

    return response.json();
  },

  async createObjectDefinition(data: CreateObjectDefinitionRequest): Promise<ObjectDefinition> {
    const response = await fetch(`${API_URL}/api/v1/object-definitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create object definition');
    }

    return response.json();
  },

  async updateObjectDefinition(
    id: string,
    data: UpdateObjectDefinitionRequest
  ): Promise<ObjectDefinition> {
    const response = await fetch(`${API_URL}/api/v1/object-definitions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update object definition');
    }

    return response.json();
  },

  async deleteObjectDefinition(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/v1/object-definitions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete object definition');
  },
};

// React Query Hooks

/**
 * Hook para buscar lista de object definitions com cache
 */
export function useObjectDefinitions(filters?: ObjectDefinitionFilters) {
  return useQuery({
    queryKey: cacheKeys.objectDefinitions.list(filters),
    queryFn: () => api.getObjectDefinitions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar uma object definition específica com cache
 */
export function useObjectDefinition(id: string, enabled = true) {
  return useQuery({
    queryKey: cacheKeys.objectDefinitions.detail(id),
    queryFn: () => api.getObjectDefinitionById(id),
    staleTime: 10 * 60 * 1000, // 10 minutos (object definitions mudam raramente)
    enabled: enabled && !!id,
  });
}

/**
 * Hook para buscar apenas o schema de uma object definition
 */
export function useObjectDefinitionSchema(id: string, enabled = true) {
  return useQuery({
    queryKey: cacheKeys.objectDefinitions.schema(id),
    queryFn: () => api.getObjectDefinitionSchema(id),
    staleTime: 15 * 60 * 1000, // 15 minutos (schemas mudam muito raramente)
    enabled: enabled && !!id,
  });
}

/**
 * Hook para criar object definition com invalidação de cache
 */
export function useCreateObjectDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createObjectDefinition,
    onSuccess: () => {
      // Invalida todas as listas de object definitions
      queryClient.invalidateQueries({ queryKey: cacheKeys.objectDefinitions.lists() });
    },
  });
}

/**
 * Hook para atualizar object definition com invalidação de cache
 */
export function useUpdateObjectDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObjectDefinitionRequest }) =>
      api.updateObjectDefinition(id, data),
    onSuccess: (updatedObjectDef) => {
      // Invalida cache específico
      queryClient.invalidateQueries({
        queryKey: cacheKeys.objectDefinitions.detail(updatedObjectDef.id),
      });

      // Invalida cache do schema
      queryClient.invalidateQueries({
        queryKey: cacheKeys.objectDefinitions.schema(updatedObjectDef.id),
      });

      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: cacheKeys.objectDefinitions.lists() });
    },
  });
}

/**
 * Hook para deletar object definition com invalidação de cache
 */
export function useDeleteObjectDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteObjectDefinition,
    onSuccess: (_, deletedId) => {
      // Remove do cache específico
      queryClient.removeQueries({
        queryKey: cacheKeys.objectDefinitions.detail(deletedId),
      });

      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: cacheKeys.objectDefinitions.lists() });
    },
  });
}

/**
 * Hook para prefetch de object definition (útil para otimização)
 */
export function usePrefetchObjectDefinition() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: cacheKeys.objectDefinitions.detail(id),
      queryFn: () => api.getObjectDefinitionById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

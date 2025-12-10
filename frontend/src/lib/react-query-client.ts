import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,

      // Dados permanecem em cache por 10 minutos
      gcTime: 10 * 60 * 1000,

      // Retry automático com backoff exponencial
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch ao focar janela (útil para dados que mudam frequentemente)
      refetchOnWindowFocus: true,

      // Refetch ao reconectar (importante para PWA/mobile)
      refetchOnReconnect: true,

      // Não refetch automaticamente ao montar (deixa o staleTime controlar)
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations que falharam (1 tentativa)
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Cache keys centralizados para facilitar invalidação
export const cacheKeys = {
  objectDefinitions: {
    all: ['object-definitions'] as const,
    lists: () => [...cacheKeys.objectDefinitions.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...cacheKeys.objectDefinitions.lists(), { filters }] as const,
    details: () => [...cacheKeys.objectDefinitions.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.objectDefinitions.details(), id] as const,
    schema: (id: string) => [...cacheKeys.objectDefinitions.detail(id), 'schema'] as const,
  },

  instances: {
    all: ['instances'] as const,
    lists: () => [...cacheKeys.instances.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...cacheKeys.instances.lists(), { filters }] as const,
    details: () => [...cacheKeys.instances.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.instances.details(), id] as const,
  },

  relationships: {
    all: ['relationships'] as const,
    lists: () => [...cacheKeys.relationships.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...cacheKeys.relationships.lists(), { filters }] as const,
    forInstance: (instanceId: string) =>
      [...cacheKeys.relationships.all, 'instance', instanceId] as const,
  },

  validationRules: {
    all: ['validation-rules'] as const,
    lists: () => [...cacheKeys.validationRules.all, 'list'] as const,
    detail: (id: string) => [...cacheKeys.validationRules.all, 'detail', id] as const,
  },

  oracle: {
    all: ['oracle'] as const,
    config: () => [...cacheKeys.oracle.all, 'config'] as const,
  },
};

/**
 * Performance Configuration
 * Sprint 20 - US-DB-023: Performance Optimization
 *
 * Centralized performance settings for the CoreBanking Brain system.
 */

export interface PerformanceConfig {
  // Cache settings
  cache: {
    defaultTtl: number; // seconds
    ragSearchTtl: number;
    documentCategoriesTtl: number;
    objectTypesTtl: number;
    analyticsQueryTtl: number;
    dictValidationTtl: number;
  };

  // RAG settings
  rag: {
    maxConcurrentEmbeddings: number;
    chunkBatchSize: number;
    searchResultLimit: number;
    embeddingTimeoutMs: number;
    searchTimeoutMs: number;
  };

  // Processing pipeline settings
  pipeline: {
    bronzeConcurrency: number;
    silverConcurrency: number;
    goldConcurrency: number;
    maxRetries: number;
    retryDelayMs: number;
    processingTimeoutMs: number;
  };

  // LLM Gateway settings
  llm: {
    maxConcurrentRequests: number;
    requestTimeoutMs: number;
    chatCacheTtl: number;
    validationCacheTtl: number;
    maxTokensDefault: number;
    temperatureDefault: number;
  };

  // Database settings
  database: {
    queryTimeoutMs: number;
    maxQueryComplexity: number;
    connectionPoolSize: number;
    statementTimeoutMs: number;
  };

  // Graph settings
  graph: {
    maxTraversalDepth: number;
    maxResultNodes: number;
    queryTimeoutMs: number;
    batchSyncSize: number;
  };

  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    aiAssistantMaxPerMinute: number;
    dictValidationMaxPerMinute: number;
  };
}

/**
 * Development configuration - more lenient for local testing
 */
export const developmentConfig: PerformanceConfig = {
  cache: {
    defaultTtl: 300, // 5 minutes
    ragSearchTtl: 600, // 10 minutes
    documentCategoriesTtl: 3600, // 1 hour (rarely changes)
    objectTypesTtl: 1800, // 30 minutes
    analyticsQueryTtl: 300, // 5 minutes
    dictValidationTtl: 60, // 1 minute
  },
  rag: {
    maxConcurrentEmbeddings: 5,
    chunkBatchSize: 10,
    searchResultLimit: 10,
    embeddingTimeoutMs: 30000, // 30 seconds
    searchTimeoutMs: 10000, // 10 seconds
  },
  pipeline: {
    bronzeConcurrency: 3,
    silverConcurrency: 2,
    goldConcurrency: 3,
    maxRetries: 3,
    retryDelayMs: 1000,
    processingTimeoutMs: 300000, // 5 minutes
  },
  llm: {
    maxConcurrentRequests: 5,
    requestTimeoutMs: 60000, // 60 seconds
    chatCacheTtl: 0, // No cache for chat in dev
    validationCacheTtl: 60, // 1 minute
    maxTokensDefault: 2000,
    temperatureDefault: 0.7,
  },
  database: {
    queryTimeoutMs: 30000, // 30 seconds
    maxQueryComplexity: 200,
    connectionPoolSize: 10,
    statementTimeoutMs: 30000,
  },
  graph: {
    maxTraversalDepth: 10,
    maxResultNodes: 1000,
    queryTimeoutMs: 30000,
    batchSyncSize: 100,
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 1000, // High limit for dev
    aiAssistantMaxPerMinute: 100,
    dictValidationMaxPerMinute: 100,
  },
};

/**
 * Production configuration - optimized for performance and resource usage
 */
export const productionConfig: PerformanceConfig = {
  cache: {
    defaultTtl: 600, // 10 minutes
    ragSearchTtl: 1800, // 30 minutes
    documentCategoriesTtl: 86400, // 24 hours
    objectTypesTtl: 3600, // 1 hour
    analyticsQueryTtl: 600, // 10 minutes
    dictValidationTtl: 300, // 5 minutes
  },
  rag: {
    maxConcurrentEmbeddings: 10,
    chunkBatchSize: 50,
    searchResultLimit: 5,
    embeddingTimeoutMs: 60000, // 60 seconds
    searchTimeoutMs: 5000, // 5 seconds
  },
  pipeline: {
    bronzeConcurrency: 5,
    silverConcurrency: 3,
    goldConcurrency: 5,
    maxRetries: 5,
    retryDelayMs: 2000,
    processingTimeoutMs: 600000, // 10 minutes
  },
  llm: {
    maxConcurrentRequests: 20,
    requestTimeoutMs: 120000, // 120 seconds
    chatCacheTtl: 300, // 5 minutes
    validationCacheTtl: 600, // 10 minutes
    maxTokensDefault: 1000,
    temperatureDefault: 0.5,
  },
  database: {
    queryTimeoutMs: 15000, // 15 seconds
    maxQueryComplexity: 100,
    connectionPoolSize: 20,
    statementTimeoutMs: 15000,
  },
  graph: {
    maxTraversalDepth: 5,
    maxResultNodes: 500,
    queryTimeoutMs: 10000,
    batchSyncSize: 500,
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    aiAssistantMaxPerMinute: 20,
    dictValidationMaxPerMinute: 30,
  },
};

/**
 * Get configuration based on environment
 */
export function getPerformanceConfig(): PerformanceConfig {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? productionConfig : developmentConfig;
}

/**
 * Cache key prefixes for consistent naming
 */
export const CacheKeys = {
  RAG_SEARCH: 'rag:search',
  DOCUMENT_CATEGORIES: 'doc:categories',
  OBJECT_TYPES: 'ot:list',
  OBJECT_TYPE: 'ot:single',
  ANALYTICS_DASHBOARD: 'analytics:dashboard',
  ANALYTICS_QUERY: 'analytics:query',
  DICT_VALIDATION: 'dict:validation',
  GRAPH_SCHEMA: 'graph:schema',
  GRAPH_STATS: 'graph:stats',
  EXTERNAL_SOURCES: 'ext:sources',
  BRONZE_DOCUMENTS: 'bronze:docs',
  PROCESSING_STATUS: 'proc:status',
};

/**
 * Performance monitoring thresholds
 */
export const PerformanceThresholds = {
  // Response time thresholds (ms) for alerting
  SLOW_QUERY: 1000,
  VERY_SLOW_QUERY: 5000,
  SLOW_EMBEDDING: 5000,
  SLOW_LLM_RESPONSE: 10000,

  // Memory thresholds
  HIGH_MEMORY_USAGE_MB: 512,
  CRITICAL_MEMORY_USAGE_MB: 1024,

  // Queue thresholds
  HIGH_QUEUE_DEPTH: 100,
  CRITICAL_QUEUE_DEPTH: 500,
};

export default getPerformanceConfig;

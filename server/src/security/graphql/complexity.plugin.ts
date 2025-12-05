/**
 * GraphQL Complexity Plugin
 * Sprint 15 - US-072: Security Hardening
 *
 * Prevents DoS attacks via complex/deep GraphQL queries.
 */

import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
  BaseContext,
} from '@apollo/server';
import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from 'graphql-query-complexity';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { Logger } from '@nestjs/common';

export interface ComplexityPluginOptions {
  maxComplexity: number;
  maxDepth: number;
}

const DEFAULT_OPTIONS: ComplexityPluginOptions = {
  maxComplexity: 100,
  maxDepth: 10,
};

@Plugin()
export class GraphQLComplexityPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(GraphQLComplexityPlugin.name);
  private schema: GraphQLSchema | null = null;
  private readonly options: ComplexityPluginOptions;

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    options?: Partial<ComplexityPluginOptions>,
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger.log(
      `Complexity plugin initialized: maxComplexity=${this.options.maxComplexity}, maxDepth=${this.options.maxDepth}`,
    );
  }

  async requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>,
  ): Promise<GraphQLRequestListener<BaseContext>> {
    // Lazy load schema
    if (!this.schema) {
      this.schema = this.gqlSchemaHost.schema;
    }

    const schema = this.schema;
    const options = this.options;
    const logger = this.logger;

    return {
      async didResolveOperation(context) {
        const { request, document } = context;

        // Skip introspection queries
        if (request.operationName === 'IntrospectionQuery') {
          return;
        }

        // Calculate query complexity
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables || {},
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        // Check complexity limit
        if (complexity > options.maxComplexity) {
          logger.warn(
            `Query complexity ${complexity} exceeds maximum ${options.maxComplexity}`,
            { operationName: request.operationName },
          );
          throw new GraphQLError(
            `Query complexity ${complexity} exceeds maximum allowed ${options.maxComplexity}`,
            {
              extensions: {
                code: 'QUERY_COMPLEXITY_EXCEEDED',
                complexity,
                maxComplexity: options.maxComplexity,
              },
            },
          );
        }

        // Calculate query depth
        const depth = calculateQueryDepth(document);
        if (depth > options.maxDepth) {
          logger.warn(
            `Query depth ${depth} exceeds maximum ${options.maxDepth}`,
            { operationName: request.operationName },
          );
          throw new GraphQLError(
            `Query depth ${depth} exceeds maximum allowed ${options.maxDepth}`,
            {
              extensions: {
                code: 'QUERY_DEPTH_EXCEEDED',
                depth,
                maxDepth: options.maxDepth,
              },
            },
          );
        }

        // Log complexity for monitoring
        if (complexity > options.maxComplexity / 2) {
          logger.debug(
            `High complexity query: ${complexity}`,
            { operationName: request.operationName },
          );
        }
      },
    };
  }
}

/**
 * Calculate the maximum depth of a GraphQL document
 */
function calculateQueryDepth(document: any): number {
  let maxDepth = 0;

  function traverse(node: any, depth: number) {
    if (!node) return;

    if (node.kind === 'Field') {
      maxDepth = Math.max(maxDepth, depth);
    }

    if (node.selectionSet) {
      for (const selection of node.selectionSet.selections) {
        traverse(selection, depth + 1);
      }
    }

    if (node.definitions) {
      for (const def of node.definitions) {
        traverse(def, depth);
      }
    }
  }

  traverse(document, 0);
  return maxDepth;
}

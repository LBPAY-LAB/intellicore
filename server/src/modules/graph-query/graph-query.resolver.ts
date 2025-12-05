import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NebulaService } from './nebula.service';
import { GraphTraversalService } from './graph-traversal.service';
import { GraphAnalyticsService } from './graph-analytics.service';
import { GraphSyncService } from './graph-sync.service';
import {
  ExecuteNGQLInput,
  TraversalInput,
  ShortestPathInput,
  NeighborsInput,
  AnalyticsInput,
  NGQLResult,
  TraversalResult,
  GraphPath,
  GraphAnalyticsResult,
  GraphSchema,
  GraphStats,
} from './dto/graph-query.dto';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class GraphSyncResult {
  @Field(() => Int)
  instancesSync: number;

  @Field(() => Int)
  relationshipsSync: number;

  @Field(() => [String])
  errors: string[];

  @Field()
  success: boolean;
}

@ObjectType()
class GraphHealthStatus {
  @Field()
  healthy: boolean;

  @Field()
  syncEnabled: boolean;

  @Field({ nullable: true })
  message?: string;
}

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class GraphQueryResolver {
  constructor(
    private readonly nebulaService: NebulaService,
    private readonly traversalService: GraphTraversalService,
    private readonly analyticsService: GraphAnalyticsService,
    private readonly syncService: GraphSyncService,
  ) {}

  // ==================== Query Operations ====================

  @Query(() => NGQLResult, { description: 'Execute a raw nGQL query' })
  @Roles('admin', 'developer')
  async executeNGQL(
    @Args('input') input: ExecuteNGQLInput,
  ): Promise<NGQLResult> {
    return this.nebulaService.execute(input.query, input.parameters);
  }

  @Query(() => TraversalResult, { description: 'Traverse graph from a starting vertex' })
  async graphTraverse(
    @Args('input') input: TraversalInput,
  ): Promise<TraversalResult> {
    return this.traversalService.traverse(input);
  }

  @Query(() => TraversalResult, { description: 'Find neighbors of a vertex' })
  async graphNeighbors(
    @Args('input') input: NeighborsInput,
  ): Promise<TraversalResult> {
    return this.traversalService.findNeighbors(input);
  }

  @Query(() => GraphPath, { nullable: true, description: 'Find shortest path between two vertices' })
  async graphShortestPath(
    @Args('input') input: ShortestPathInput,
  ): Promise<GraphPath | null> {
    return this.traversalService.findShortestPath(input);
  }

  @Query(() => [GraphPath], { description: 'Find all paths between two vertices' })
  async graphAllPaths(
    @Args('sourceId') sourceId: string,
    @Args('targetId') targetId: string,
    @Args('maxDepth', { type: () => Int, defaultValue: 5 }) maxDepth: number,
    @Args('edgeTypes', { type: () => [String], nullable: true }) edgeTypes?: string[],
  ): Promise<GraphPath[]> {
    return this.traversalService.findAllPaths(sourceId, targetId, maxDepth, edgeTypes);
  }

  @Query(() => TraversalResult, { description: 'Get subgraph around specified vertices' })
  async graphSubgraph(
    @Args('vertexIds', { type: () => [String] }) vertexIds: string[],
    @Args('depth', { type: () => Int, defaultValue: 1 }) depth: number,
    @Args('edgeTypes', { type: () => [String], nullable: true }) edgeTypes?: string[],
  ): Promise<TraversalResult> {
    return this.traversalService.getSubgraph(vertexIds, depth, edgeTypes);
  }

  @Query(() => TraversalResult, { description: 'Find ancestors of a vertex' })
  async graphAncestors(
    @Args('vertexId') vertexId: string,
    @Args('maxDepth', { type: () => Int, defaultValue: 5 }) maxDepth: number,
    @Args('edgeTypes', { type: () => [String], nullable: true }) edgeTypes?: string[],
  ): Promise<TraversalResult> {
    return this.traversalService.findAncestors(vertexId, maxDepth, edgeTypes);
  }

  @Query(() => TraversalResult, { description: 'Find descendants of a vertex' })
  async graphDescendants(
    @Args('vertexId') vertexId: string,
    @Args('maxDepth', { type: () => Int, defaultValue: 5 }) maxDepth: number,
    @Args('edgeTypes', { type: () => [String], nullable: true }) edgeTypes?: string[],
  ): Promise<TraversalResult> {
    return this.traversalService.findDescendants(vertexId, maxDepth, edgeTypes);
  }

  @Query(() => Boolean, { description: 'Check if two vertices are connected' })
  async graphIsConnected(
    @Args('vertexId1') vertexId1: string,
    @Args('vertexId2') vertexId2: string,
    @Args('maxDepth', { type: () => Int, defaultValue: 10 }) maxDepth: number,
  ): Promise<boolean> {
    return this.traversalService.isConnected(vertexId1, vertexId2, maxDepth);
  }

  // ==================== Analytics Operations ====================

  @Query(() => GraphAnalyticsResult, { description: 'Run graph analytics' })
  async graphAnalytics(
    @Args('input') input: AnalyticsInput,
  ): Promise<GraphAnalyticsResult> {
    return this.analyticsService.runAnalytics(input);
  }

  @Query(() => Number, { description: 'Get graph density' })
  async graphDensity(): Promise<number> {
    return this.analyticsService.getGraphDensity();
  }

  @Query(() => Number, { description: 'Get average node degree' })
  async graphAverageDegree(): Promise<number> {
    return this.analyticsService.getAverageDegree();
  }

  // ==================== Schema & Stats Operations ====================

  @Query(() => GraphSchema, { description: 'Get graph schema (tags and edges)' })
  async graphSchema(): Promise<GraphSchema> {
    return this.nebulaService.getSchema();
  }

  @Query(() => GraphStats, { description: 'Get graph statistics' })
  async graphStats(): Promise<GraphStats> {
    return this.nebulaService.getStats();
  }

  @Query(() => GraphHealthStatus, { description: 'Get graph service health status' })
  async graphHealth(): Promise<GraphHealthStatus> {
    const healthy = this.nebulaService.isHealthy();
    const syncEnabled = this.syncService.isSyncEnabled();

    return {
      healthy,
      syncEnabled,
      message: healthy
        ? 'NebulaGraph is operational'
        : 'NebulaGraph is not available',
    };
  }

  // ==================== Sync Operations ====================

  @Mutation(() => GraphSyncResult, { description: 'Perform full sync from PostgreSQL to NebulaGraph' })
  @Roles('admin')
  async graphFullSync(): Promise<GraphSyncResult> {
    const result = await this.syncService.fullSync();
    return {
      ...result,
      success: result.errors.length === 0,
    };
  }

  @Mutation(() => Boolean, { description: 'Clear all data from graph database' })
  @Roles('admin')
  async graphClear(): Promise<boolean> {
    return this.syncService.clearGraph();
  }

  @Mutation(() => Boolean, { description: 'Enable graph sync' })
  @Roles('admin')
  async graphEnableSync(): Promise<boolean> {
    this.syncService.enableSync();
    return true;
  }

  @Mutation(() => Boolean, { description: 'Disable graph sync' })
  @Roles('admin')
  async graphDisableSync(): Promise<boolean> {
    this.syncService.disableSync();
    return true;
  }
}

import { Resolver, Query, Args, ID, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphTraversalService, PathInfo, CircularReferenceInfo } from './graph-traversal.service';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { ObjectRelationshipEntity } from './entities/object-relationship.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * GraphQL type for path information
 */
@ObjectType()
class GraphPathInfo {
  @Field(() => ID)
  objectTypeId: string;

  @Field(() => ObjectTypeEntity)
  objectType: ObjectTypeEntity;

  @Field(() => Int)
  depth: number;

  @Field(() => [String])
  path: string[];
}

/**
 * GraphQL type for circular reference detection
 */
@ObjectType()
class GraphCircularReferenceInfo {
  @Field()
  hasCircularReference: boolean;

  @Field(() => [String], { nullable: true })
  cycle?: string[];

  @Field(() => Int, { nullable: true })
  cycleLength?: number;
}

/**
 * GraphQL type for graph structure
 */
@ObjectType()
class GraphStructure {
  @Field(() => [ObjectTypeEntity])
  nodes: ObjectTypeEntity[];

  @Field(() => [ObjectRelationshipEntity])
  edges: ObjectRelationshipEntity[];
}

/**
 * Resolver for graph traversal queries
 * Provides BFS, DFS, path finding, and cycle detection
 */
@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class GraphTraversalResolver {
  constructor(private readonly graphTraversalService: GraphTraversalService) {}

  /**
   * Query: Breadth-First Search traversal
   * Requires: admin or viewer role
   */
  @Query(() => [GraphPathInfo], { name: 'graphBFS' })
  @Roles('admin', 'viewer')
  async breadthFirstSearch(
    @Args('startId', { type: () => ID }) startId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<PathInfo[]> {
    return this.graphTraversalService.breadthFirstSearch(startId, maxDepth);
  }

  /**
   * Query: Depth-First Search traversal
   * Requires: admin or viewer role
   */
  @Query(() => [GraphPathInfo], { name: 'graphDFS' })
  @Roles('admin', 'viewer')
  async depthFirstSearch(
    @Args('startId', { type: () => ID }) startId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<PathInfo[]> {
    return this.graphTraversalService.depthFirstSearch(startId, maxDepth);
  }

  /**
   * Query: Find all ancestors of an ObjectType
   * Requires: admin or viewer role
   */
  @Query(() => [GraphPathInfo], { name: 'graphAncestors' })
  @Roles('admin', 'viewer')
  async findAncestors(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<PathInfo[]> {
    return this.graphTraversalService.findAncestors(objectTypeId, maxDepth);
  }

  /**
   * Query: Find all descendants of an ObjectType
   * Requires: admin or viewer role
   */
  @Query(() => [GraphPathInfo], { name: 'graphDescendants' })
  @Roles('admin', 'viewer')
  async findDescendants(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<PathInfo[]> {
    return this.graphTraversalService.findDescendants(objectTypeId, maxDepth);
  }

  /**
   * Query: Find shortest path between two ObjectTypes
   * Requires: admin or viewer role
   */
  @Query(() => GraphPathInfo, { name: 'graphShortestPath', nullable: true })
  @Roles('admin', 'viewer')
  async findShortestPath(
    @Args('sourceId', { type: () => ID }) sourceId: string,
    @Args('targetId', { type: () => ID }) targetId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<PathInfo | null> {
    return this.graphTraversalService.findShortestPath(sourceId, targetId, maxDepth);
  }

  /**
   * Query: Detect circular references
   * Requires: admin or viewer role
   */
  @Query(() => GraphCircularReferenceInfo, { name: 'graphDetectCircularReferences' })
  @Roles('admin', 'viewer')
  async detectCircularReferences(
    @Args('startId', { type: () => ID }) startId: string,
    @Args('maxDepth', { type: () => Int, nullable: true, defaultValue: 100 }) maxDepth: number,
    @CurrentUser() user: any,
  ): Promise<CircularReferenceInfo> {
    return this.graphTraversalService.detectCircularReferences(startId, maxDepth);
  }

  /**
   * Query: Get complete graph structure
   * Public access for read operations (no authentication required)
   */
  @Public()
  @Query(() => GraphStructure, { name: 'graphStructure' })
  async getGraphStructure(
    @Args('maxNodes', { type: () => Int, nullable: true, defaultValue: 1000 }) maxNodes: number,
  ): Promise<{ nodes: ObjectTypeEntity[]; edges: ObjectRelationshipEntity[] }> {
    return this.graphTraversalService.getGraphStructure(maxNodes);
  }
}

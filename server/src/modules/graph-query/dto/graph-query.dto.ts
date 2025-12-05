import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

export enum TraversalDirection {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
  BOTH = 'BOTH',
}

export enum AnalyticsType {
  DEGREE_CENTRALITY = 'DEGREE_CENTRALITY',
  BETWEENNESS_CENTRALITY = 'BETWEENNESS_CENTRALITY',
  CLOSENESS_CENTRALITY = 'CLOSENESS_CENTRALITY',
  PAGERANK = 'PAGERANK',
  CLUSTERING_COEFFICIENT = 'CLUSTERING_COEFFICIENT',
  CONNECTED_COMPONENTS = 'CONNECTED_COMPONENTS',
  SHORTEST_PATH = 'SHORTEST_PATH',
}

registerEnumType(TraversalDirection, {
  name: 'TraversalDirection',
  description: 'Direction for graph traversal',
});

registerEnumType(AnalyticsType, {
  name: 'AnalyticsType',
  description: 'Type of graph analytics operation',
});

@InputType()
export class ExecuteNGQLInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  query: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  parameters?: Record<string, unknown>;
}

@InputType()
export class TraversalInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  startVertexId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  edgeTypes?: string[];

  @Field(() => TraversalDirection, { defaultValue: TraversalDirection.OUTBOUND })
  @IsEnum(TraversalDirection)
  direction: TraversalDirection = TraversalDirection.OUTBOUND;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  minDepth: number = 1;

  @Field(() => Int, { defaultValue: 3 })
  @IsInt()
  @Min(1)
  @Max(10)
  maxDepth: number = 3;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}

@InputType()
export class ShortestPathInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  sourceVertexId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  targetVertexId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  edgeTypes?: string[];

  @Field(() => TraversalDirection, { defaultValue: TraversalDirection.BOTH })
  @IsEnum(TraversalDirection)
  direction: TraversalDirection = TraversalDirection.BOTH;

  @Field(() => Int, { defaultValue: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  maxDepth: number = 5;
}

@InputType()
export class NeighborsInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  vertexId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  edgeTypes?: string[];

  @Field(() => TraversalDirection, { defaultValue: TraversalDirection.BOTH })
  @IsEnum(TraversalDirection)
  direction: TraversalDirection = TraversalDirection.BOTH;

  @Field(() => Int, { defaultValue: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}

@InputType()
export class AnalyticsInput {
  @Field(() => AnalyticsType)
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  vertexIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  edgeTypes?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  options?: Record<string, unknown>;
}

@ObjectType()
export class GraphVertex {
  @Field()
  id: string;

  @Field()
  tag: string;

  @Field(() => GraphQLJSON)
  properties: Record<string, unknown>;
}

@ObjectType()
export class GraphEdge {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  sourceId: string;

  @Field()
  targetId: string;

  @Field(() => Int)
  rank: number;

  @Field(() => GraphQLJSON)
  properties: Record<string, unknown>;
}

@ObjectType()
export class GraphPath {
  @Field(() => [GraphVertex])
  vertices: GraphVertex[];

  @Field(() => [GraphEdge])
  edges: GraphEdge[];

  @Field(() => Int)
  length: number;
}

@ObjectType()
export class NGQLResult {
  @Field()
  success: boolean;

  @Field(() => [String])
  columns: string[];

  @Field(() => [[GraphQLJSON]])
  rows: unknown[][];

  @Field(() => Int)
  rowCount: number;

  @Field(() => Float)
  executionTimeMs: number;

  @Field({ nullable: true })
  errorMessage?: string;
}

@ObjectType()
export class TraversalResult {
  @Field(() => [GraphVertex])
  vertices: GraphVertex[];

  @Field(() => [GraphEdge])
  edges: GraphEdge[];

  @Field(() => [GraphPath], { nullable: true })
  paths?: GraphPath[];

  @Field(() => Int)
  totalVertices: number;

  @Field(() => Int)
  totalEdges: number;
}

@ObjectType()
export class AnalyticsResultItem {
  @Field()
  vertexId: string;

  @Field(() => Float)
  score: number;

  @Field(() => Int, { nullable: true })
  rank?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;
}

@ObjectType()
export class GraphAnalyticsResult {
  @Field(() => AnalyticsType)
  type: AnalyticsType;

  @Field(() => [AnalyticsResultItem])
  items: AnalyticsResultItem[];

  @Field(() => Float)
  executionTimeMs: number;

  @Field(() => GraphQLJSON, { nullable: true })
  summary?: Record<string, unknown>;
}

@ObjectType()
export class GraphSchemaTag {
  @Field()
  name: string;

  @Field(() => [String])
  properties: string[];
}

@ObjectType()
export class GraphSchemaEdge {
  @Field()
  name: string;

  @Field(() => [String])
  properties: string[];
}

@ObjectType()
export class GraphSchema {
  @Field(() => [GraphSchemaTag])
  tags: GraphSchemaTag[];

  @Field(() => [GraphSchemaEdge])
  edges: GraphSchemaEdge[];

  @Field()
  space: string;
}

@ObjectType()
export class GraphStats {
  @Field(() => Int)
  totalVertices: number;

  @Field(() => Int)
  totalEdges: number;

  @Field(() => GraphQLJSON)
  verticesByTag: Record<string, number>;

  @Field(() => GraphQLJSON)
  edgesByType: Record<string, number>;
}

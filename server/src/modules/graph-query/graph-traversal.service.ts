import { Injectable, Logger } from '@nestjs/common';
import { NebulaService } from './nebula.service';
import {
  TraversalInput,
  TraversalResult,
  ShortestPathInput,
  NeighborsInput,
  GraphVertex,
  GraphEdge,
  GraphPath,
  TraversalDirection,
} from './dto/graph-query.dto';

@Injectable()
export class GraphTraversalService {
  private readonly logger = new Logger(GraphTraversalService.name);

  constructor(private readonly nebulaService: NebulaService) {}

  async traverse(input: TraversalInput): Promise<TraversalResult> {
    const { startVertexId, edgeTypes, direction, minDepth, maxDepth, limit } = input;

    const edgeFilter = edgeTypes?.length
      ? edgeTypes.join('|')
      : '*';

    const directionClause = this.getDirectionClause(direction);
    const limitClause = limit ? `| LIMIT ${limit}` : '';

    // Build GO query for traversal
    const query = `
      GO ${minDepth} TO ${maxDepth} STEPS FROM "${startVertexId}"
      OVER ${edgeFilter} ${directionClause}
      YIELD
        src(edge) AS src,
        dst(edge) AS dst,
        type(edge) AS edge_type,
        rank(edge) AS edge_rank,
        properties(edge) AS edge_props,
        properties($^) AS src_props,
        properties($$) AS dst_props
      ${limitClause};
    `;

    const result = await this.nebulaService.execute(query);

    if (!result.success) {
      this.logger.warn(`Traversal failed: ${result.errorMessage}`);
      return {
        vertices: [],
        edges: [],
        totalVertices: 0,
        totalEdges: 0,
      };
    }

    return this.parseTraversalResult(result.rows, result.columns);
  }

  async findNeighbors(input: NeighborsInput): Promise<TraversalResult> {
    const { vertexId, edgeTypes, direction, limit } = input;

    const edgeFilter = edgeTypes?.length
      ? edgeTypes.join('|')
      : '*';

    const directionClause = this.getDirectionClause(direction);
    const limitClause = limit ? `| LIMIT ${limit}` : '';

    // 1-step traversal for neighbors
    const query = `
      GO 1 STEPS FROM "${vertexId}"
      OVER ${edgeFilter} ${directionClause}
      YIELD
        src(edge) AS src,
        dst(edge) AS dst,
        type(edge) AS edge_type,
        rank(edge) AS edge_rank,
        properties(edge) AS edge_props,
        properties($$) AS neighbor_props
      ${limitClause};
    `;

    const result = await this.nebulaService.execute(query);

    if (!result.success) {
      this.logger.warn(`Find neighbors failed: ${result.errorMessage}`);
      return {
        vertices: [],
        edges: [],
        totalVertices: 0,
        totalEdges: 0,
      };
    }

    return this.parseTraversalResult(result.rows, result.columns);
  }

  async findShortestPath(input: ShortestPathInput): Promise<GraphPath | null> {
    const { sourceVertexId, targetVertexId, edgeTypes, direction, maxDepth } = input;

    const edgeFilter = edgeTypes?.length
      ? edgeTypes.join('|')
      : '*';

    const directionClause = this.getDirectionClause(direction);

    // Use FIND SHORTEST PATH for optimal path finding
    const query = `
      FIND SHORTEST PATH FROM "${sourceVertexId}" TO "${targetVertexId}"
      OVER ${edgeFilter} ${directionClause}
      UPTO ${maxDepth} STEPS
      YIELD path AS p;
    `;

    const result = await this.nebulaService.execute(query);

    if (!result.success || !result.rows?.length) {
      this.logger.debug(
        `No path found between ${sourceVertexId} and ${targetVertexId}`,
      );
      return null;
    }

    return this.parsePathResult(result.rows[0], result.columns);
  }

  async findAllPaths(
    sourceVertexId: string,
    targetVertexId: string,
    maxDepth = 5,
    edgeTypes?: string[],
  ): Promise<GraphPath[]> {
    const edgeFilter = edgeTypes?.length
      ? edgeTypes.join('|')
      : '*';

    const query = `
      FIND ALL PATH FROM "${sourceVertexId}" TO "${targetVertexId}"
      OVER ${edgeFilter} BIDIRECT
      UPTO ${maxDepth} STEPS
      YIELD path AS p
      | LIMIT 100;
    `;

    const result = await this.nebulaService.execute(query);

    if (!result.success || !result.rows?.length) {
      return [];
    }

    return result.rows
      .map((row, _) => this.parsePathResult(row, result.columns))
      .filter((path): path is GraphPath => path !== null);
  }

  async getSubgraph(
    vertexIds: string[],
    depth = 1,
    edgeTypes?: string[],
  ): Promise<TraversalResult> {
    const edgeFilter = edgeTypes?.length
      ? edgeTypes.join('|')
      : '*';

    const vertexList = vertexIds.map(id => `"${id}"`).join(', ');

    const query = `
      GET SUBGRAPH ${depth} STEPS FROM ${vertexList}
      OVER ${edgeFilter}
      YIELD VERTICES AS nodes, EDGES AS edges;
    `;

    const result = await this.nebulaService.execute(query);

    if (!result.success) {
      return {
        vertices: [],
        edges: [],
        totalVertices: 0,
        totalEdges: 0,
      };
    }

    return this.parseSubgraphResult(result.rows, result.columns);
  }

  async findAncestors(
    vertexId: string,
    maxDepth = 5,
    edgeTypes?: string[],
  ): Promise<TraversalResult> {
    // For ancestors, we traverse inbound edges
    return this.traverse({
      startVertexId: vertexId,
      edgeTypes,
      direction: TraversalDirection.INBOUND,
      minDepth: 1,
      maxDepth,
    });
  }

  async findDescendants(
    vertexId: string,
    maxDepth = 5,
    edgeTypes?: string[],
  ): Promise<TraversalResult> {
    // For descendants, we traverse outbound edges
    return this.traverse({
      startVertexId: vertexId,
      edgeTypes,
      direction: TraversalDirection.OUTBOUND,
      minDepth: 1,
      maxDepth,
    });
  }

  async findCommonAncestors(
    vertexId1: string,
    vertexId2: string,
    maxDepth = 5,
  ): Promise<GraphVertex[]> {
    const [ancestors1, ancestors2] = await Promise.all([
      this.findAncestors(vertexId1, maxDepth),
      this.findAncestors(vertexId2, maxDepth),
    ]);

    const ancestorIds1 = new Set(ancestors1.vertices.map(v => v.id));
    return ancestors2.vertices.filter(v => ancestorIds1.has(v.id));
  }

  async isConnected(
    vertexId1: string,
    vertexId2: string,
    maxDepth = 10,
  ): Promise<boolean> {
    const path = await this.findShortestPath({
      sourceVertexId: vertexId1,
      targetVertexId: vertexId2,
      maxDepth,
      direction: TraversalDirection.BOTH,
    });
    return path !== null;
  }

  private getDirectionClause(direction: TraversalDirection): string {
    switch (direction) {
      case TraversalDirection.INBOUND:
        return 'REVERSELY';
      case TraversalDirection.BOTH:
        return 'BIDIRECT';
      case TraversalDirection.OUTBOUND:
      default:
        return '';
    }
  }

  private parseTraversalResult(
    rows: unknown[][],
    columns: string[],
  ): TraversalResult {
    const vertexMap = new Map<string, GraphVertex>();
    const edgeMap = new Map<string, GraphEdge>();

    for (const row of rows) {
      // Parse vertices
      const srcId = row[columns.indexOf('src')] as string;
      const dstId = row[columns.indexOf('dst')] as string;
      const srcProps = row[columns.indexOf('src_props')] as Record<string, unknown> || {};
      const dstProps = row[columns.indexOf('dst_props') || columns.indexOf('neighbor_props')] as Record<string, unknown> || {};

      if (srcId && !vertexMap.has(srcId)) {
        vertexMap.set(srcId, {
          id: srcId,
          tag: 'Instance', // Would need to determine from actual result
          properties: srcProps,
        });
      }

      if (dstId && !vertexMap.has(dstId)) {
        vertexMap.set(dstId, {
          id: dstId,
          tag: 'Instance',
          properties: dstProps,
        });
      }

      // Parse edge
      const edgeType = row[columns.indexOf('edge_type')] as string;
      const edgeRank = row[columns.indexOf('edge_rank')] as number || 0;
      const edgeProps = row[columns.indexOf('edge_props')] as Record<string, unknown> || {};
      const edgeKey = `${srcId}-${edgeType}-${dstId}-${edgeRank}`;

      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          id: edgeKey,
          type: edgeType,
          sourceId: srcId,
          targetId: dstId,
          rank: edgeRank,
          properties: edgeProps,
        });
      }
    }

    return {
      vertices: Array.from(vertexMap.values()),
      edges: Array.from(edgeMap.values()),
      totalVertices: vertexMap.size,
      totalEdges: edgeMap.size,
    };
  }

  private parsePathResult(row: unknown[], columns: string[]): GraphPath | null {
    // Path parsing depends on the nGQL result format
    // Placeholder implementation
    const pathData = row[0];

    if (!pathData) {
      return null;
    }

    // Would parse actual path structure from nGQL
    return {
      vertices: [],
      edges: [],
      length: 0,
    };
  }

  private parseSubgraphResult(
    rows: unknown[][],
    columns: string[],
  ): TraversalResult {
    const vertices: GraphVertex[] = [];
    const edges: GraphEdge[] = [];

    for (const row of rows) {
      const nodes = row[columns.indexOf('nodes')] as unknown[];
      const edgeData = row[columns.indexOf('edges')] as unknown[];

      // Parse nodes
      if (nodes) {
        for (const node of nodes) {
          // Would parse actual vertex structure
          vertices.push(node as GraphVertex);
        }
      }

      // Parse edges
      if (edgeData) {
        for (const edge of edgeData) {
          edges.push(edge as GraphEdge);
        }
      }
    }

    return {
      vertices,
      edges,
      totalVertices: vertices.length,
      totalEdges: edges.length,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { NebulaService } from './nebula.service';
import { GraphTraversalService } from './graph-traversal.service';
import {
  AnalyticsInput,
  GraphAnalyticsResult,
  AnalyticsResultItem,
  AnalyticsType,
  TraversalDirection,
} from './dto/graph-query.dto';

@Injectable()
export class GraphAnalyticsService {
  private readonly logger = new Logger(GraphAnalyticsService.name);

  constructor(
    private readonly nebulaService: NebulaService,
    private readonly traversalService: GraphTraversalService,
  ) {}

  async runAnalytics(input: AnalyticsInput): Promise<GraphAnalyticsResult> {
    const startTime = Date.now();

    try {
      let items: AnalyticsResultItem[] = [];
      let summary: Record<string, unknown> = {};

      switch (input.type) {
        case AnalyticsType.DEGREE_CENTRALITY:
          items = await this.calculateDegreeCentrality(input);
          break;

        case AnalyticsType.BETWEENNESS_CENTRALITY:
          items = await this.calculateBetweennessCentrality(input);
          break;

        case AnalyticsType.CLOSENESS_CENTRALITY:
          items = await this.calculateClosenessCentrality(input);
          break;

        case AnalyticsType.PAGERANK:
          items = await this.calculatePageRank(input);
          break;

        case AnalyticsType.CLUSTERING_COEFFICIENT:
          items = await this.calculateClusteringCoefficient(input);
          break;

        case AnalyticsType.CONNECTED_COMPONENTS:
          const components = await this.findConnectedComponents(input);
          items = components.items;
          summary = components.summary;
          break;

        case AnalyticsType.SHORTEST_PATH:
          // Shortest path requires source and target in options
          items = await this.calculateShortestPathMetrics(input);
          break;

        default:
          throw new Error(`Unknown analytics type: ${input.type}`);
      }

      // Sort by score descending
      items.sort((a, b) => b.score - a.score);

      // Apply limit
      if (input.limit && items.length > input.limit) {
        items = items.slice(0, input.limit);
      }

      // Add ranks
      items = items.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      return {
        type: input.type,
        items,
        executionTimeMs: Date.now() - startTime,
        summary,
      };
    } catch (error) {
      this.logger.error(`Analytics failed: ${error.message}`);
      return {
        type: input.type,
        items: [],
        executionTimeMs: Date.now() - startTime,
        summary: { error: error.message },
      };
    }
  }

  private async calculateDegreeCentrality(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    const edgeFilter = input.edgeTypes?.length
      ? input.edgeTypes.join('|')
      : '*';

    // Get all vertices if not specified
    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 1000};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const items: AnalyticsResultItem[] = [];

    for (const vertexId of vertexIds) {
      // Count outbound edges
      const outResult = await this.nebulaService.execute(`
        GO 1 STEPS FROM "${vertexId}" OVER ${edgeFilter}
        YIELD dst(edge) AS dst
        | RETURN count(*) AS out_degree;
      `);

      // Count inbound edges
      const inResult = await this.nebulaService.execute(`
        GO 1 STEPS FROM "${vertexId}" OVER ${edgeFilter} REVERSELY
        YIELD src(edge) AS src
        | RETURN count(*) AS in_degree;
      `);

      const outDegree = outResult.rows?.[0]?.[0] as number || 0;
      const inDegree = inResult.rows?.[0]?.[0] as number || 0;
      const totalDegree = outDegree + inDegree;

      items.push({
        vertexId,
        score: totalDegree,
        metadata: {
          inDegree,
          outDegree,
        },
      });
    }

    return items;
  }

  private async calculateBetweennessCentrality(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    // Betweenness centrality measures how often a node lies on shortest paths
    // This is computationally expensive - using approximation

    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 100};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const betweennessScores = new Map<string, number>();

    // Sample pairs for betweenness calculation
    const sampleSize = Math.min(50, vertexIds.length);
    const sampledPairs: [string, string][] = [];

    for (let i = 0; i < sampleSize; i++) {
      for (let j = i + 1; j < sampleSize; j++) {
        sampledPairs.push([vertexIds[i], vertexIds[j]]);
      }
    }

    // Initialize scores
    for (const vertexId of vertexIds) {
      betweennessScores.set(vertexId, 0);
    }

    // Count paths through each node
    for (const [source, target] of sampledPairs.slice(0, 100)) {
      const path = await this.traversalService.findShortestPath({
        sourceVertexId: source,
        targetVertexId: target,
        maxDepth: 5,
        direction: TraversalDirection.BOTH,
      });

      if (path) {
        // Increment score for intermediate vertices
        for (const vertex of path.vertices.slice(1, -1)) {
          const current = betweennessScores.get(vertex.id) || 0;
          betweennessScores.set(vertex.id, current + 1);
        }
      }
    }

    return Array.from(betweennessScores.entries()).map(([vertexId, score]) => ({
      vertexId,
      score,
    }));
  }

  private async calculateClosenessCentrality(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    // Closeness centrality = 1 / average shortest path length to all other nodes

    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 100};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const items: AnalyticsResultItem[] = [];

    for (const sourceId of vertexIds) {
      let totalDistance = 0;
      let reachableCount = 0;

      for (const targetId of vertexIds) {
        if (sourceId === targetId) continue;

        const path = await this.traversalService.findShortestPath({
          sourceVertexId: sourceId,
          targetVertexId: targetId,
          maxDepth: 10,
          direction: TraversalDirection.BOTH,
        });

        if (path && path.length > 0) {
          totalDistance += path.length;
          reachableCount++;
        }
      }

      const closeness = reachableCount > 0
        ? reachableCount / totalDistance
        : 0;

      items.push({
        vertexId: sourceId,
        score: closeness,
        metadata: {
          reachableNodes: reachableCount,
          totalDistance,
        },
      });
    }

    return items;
  }

  private async calculatePageRank(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    // PageRank implementation using power iteration
    const dampingFactor = (input.options?.dampingFactor as number) || 0.85;
    const iterations = (input.options?.iterations as number) || 20;

    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 500};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const n = vertexIds.length;
    if (n === 0) return [];

    // Initialize PageRank scores
    let pageRanks = new Map<string, number>();
    for (const vertexId of vertexIds) {
      pageRanks.set(vertexId, 1.0 / n);
    }

    // Build adjacency info
    const outlinks = new Map<string, string[]>();

    for (const vertexId of vertexIds) {
      const neighbors = await this.traversalService.findNeighbors({
        vertexId,
        direction: TraversalDirection.OUTBOUND,
        limit: 1000,
      });
      outlinks.set(
        vertexId,
        neighbors.edges.map(e => e.targetId),
      );
    }

    // Power iteration
    for (let iter = 0; iter < iterations; iter++) {
      const newRanks = new Map<string, number>();

      for (const vertexId of vertexIds) {
        let incomingRank = 0;

        // Find nodes pointing to this vertex
        for (const [sourceId, targets] of outlinks.entries()) {
          if (targets.includes(vertexId)) {
            const sourceRank = pageRanks.get(sourceId) || 0;
            incomingRank += sourceRank / targets.length;
          }
        }

        const newRank = (1 - dampingFactor) / n + dampingFactor * incomingRank;
        newRanks.set(vertexId, newRank);
      }

      pageRanks = newRanks;
    }

    return Array.from(pageRanks.entries()).map(([vertexId, score]) => ({
      vertexId,
      score,
    }));
  }

  private async calculateClusteringCoefficient(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    // Local clustering coefficient = triangles / possible triangles

    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 200};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const items: AnalyticsResultItem[] = [];

    for (const vertexId of vertexIds) {
      // Get neighbors
      const neighbors = await this.traversalService.findNeighbors({
        vertexId,
        direction: TraversalDirection.BOTH,
        limit: 100,
      });

      const neighborIds = neighbors.vertices.map(v => v.id);
      const k = neighborIds.length;

      if (k < 2) {
        items.push({ vertexId, score: 0 });
        continue;
      }

      // Count edges between neighbors (triangles)
      let triangles = 0;

      for (let i = 0; i < neighborIds.length; i++) {
        for (let j = i + 1; j < neighborIds.length; j++) {
          const connected = await this.traversalService.isConnected(
            neighborIds[i],
            neighborIds[j],
            1,
          );
          if (connected) {
            triangles++;
          }
        }
      }

      // Clustering coefficient formula
      const possibleTriangles = (k * (k - 1)) / 2;
      const coefficient = possibleTriangles > 0 ? triangles / possibleTriangles : 0;

      items.push({
        vertexId,
        score: coefficient,
        metadata: {
          neighborCount: k,
          triangles,
          possibleTriangles,
        },
      });
    }

    return items;
  }

  private async findConnectedComponents(
    input: AnalyticsInput,
  ): Promise<{ items: AnalyticsResultItem[]; summary: Record<string, unknown> }> {
    let vertexIds = input.vertexIds;
    if (!vertexIds?.length) {
      const result = await this.nebulaService.execute(
        `MATCH (v:Instance) RETURN id(v) as vid LIMIT ${input.limit || 1000};`,
      );
      vertexIds = result.rows?.map(row => row[0] as string) || [];
    }

    const visited = new Set<string>();
    const components: string[][] = [];

    // BFS to find connected components
    for (const startVertex of vertexIds) {
      if (visited.has(startVertex)) continue;

      const component: string[] = [];
      const queue = [startVertex];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;

        visited.add(current);
        component.push(current);

        const neighbors = await this.traversalService.findNeighbors({
          vertexId: current,
          direction: TraversalDirection.BOTH,
          limit: 1000,
        });

        for (const vertex of neighbors.vertices) {
          if (!visited.has(vertex.id) && vertexIds.includes(vertex.id)) {
            queue.push(vertex.id);
          }
        }
      }

      if (component.length > 0) {
        components.push(component);
      }
    }

    // Create items - each vertex gets its component ID as score
    const items: AnalyticsResultItem[] = [];
    for (let componentId = 0; componentId < components.length; componentId++) {
      for (const vertexId of components[componentId]) {
        items.push({
          vertexId,
          score: componentId,
          metadata: {
            componentSize: components[componentId].length,
          },
        });
      }
    }

    const componentSizes = components.map(c => c.length);

    return {
      items,
      summary: {
        totalComponents: components.length,
        largestComponentSize: Math.max(...componentSizes, 0),
        smallestComponentSize: Math.min(...componentSizes, 0),
        averageComponentSize: componentSizes.length > 0
          ? componentSizes.reduce((a, b) => a + b, 0) / componentSizes.length
          : 0,
        isolatedNodes: components.filter(c => c.length === 1).length,
      },
    };
  }

  private async calculateShortestPathMetrics(
    input: AnalyticsInput,
  ): Promise<AnalyticsResultItem[]> {
    const sourceId = input.options?.sourceId as string;
    const targetId = input.options?.targetId as string;

    if (!sourceId || !targetId) {
      throw new Error('sourceId and targetId are required in options for SHORTEST_PATH');
    }

    const path = await this.traversalService.findShortestPath({
      sourceVertexId: sourceId,
      targetVertexId: targetId,
      maxDepth: (input.options?.maxDepth as number) || 10,
      direction: TraversalDirection.BOTH,
    });

    if (!path) {
      return [];
    }

    // Return path vertices with their position as score
    return path.vertices.map((vertex, index) => ({
      vertexId: vertex.id,
      score: index,
      metadata: {
        position: index,
        isSource: index === 0,
        isTarget: index === path.vertices.length - 1,
        pathLength: path.length,
      },
    }));
  }

  async getGraphDensity(): Promise<number> {
    const stats = await this.nebulaService.getStats();
    const n = stats.totalVertices;
    const e = stats.totalEdges;

    if (n <= 1) return 0;

    // For directed graph: density = e / (n * (n - 1))
    return e / (n * (n - 1));
  }

  async getAverageDegree(): Promise<number> {
    const stats = await this.nebulaService.getStats();
    const n = stats.totalVertices;
    const e = stats.totalEdges;

    if (n === 0) return 0;

    // Average degree = 2 * edges / vertices (for undirected interpretation)
    return (2 * e) / n;
  }
}

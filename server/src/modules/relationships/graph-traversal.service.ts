import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectRelationshipEntity } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';

/**
 * Path information for graph traversal results
 */
export interface PathInfo {
  objectTypeId: string;
  objectType: ObjectTypeEntity;
  depth: number;
  path: string[];
}

/**
 * Circular reference detection result
 */
export interface CircularReferenceInfo {
  hasCircularReference: boolean;
  cycle?: string[];
  cycleLength?: number;
}

/**
 * Service for graph traversal algorithms on ObjectType relationships
 * Implements BFS, DFS, path finding, and cycle detection
 */
@Injectable()
export class GraphTraversalService {
  private readonly logger = new Logger(GraphTraversalService.name);
  private readonly DEFAULT_MAX_DEPTH = 100;

  constructor(
    @InjectRepository(ObjectRelationshipEntity)
    private readonly relationshipRepository: Repository<ObjectRelationshipEntity>,
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
  ) {}

  /**
   * Breadth-First Search (BFS) traversal from a starting ObjectType
   * @param startId Starting ObjectType ID
   * @param maxDepth Maximum depth to traverse (default: 100)
   * @returns Array of ObjectTypes in BFS order with depth info
   */
  async breadthFirstSearch(startId: string, maxDepth: number = this.DEFAULT_MAX_DEPTH): Promise<PathInfo[]> {
    this.validateMaxDepth(maxDepth);

    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [];
    const result: PathInfo[] = [];

    // Initialize BFS
    queue.push({ id: startId, depth: 0, path: [startId] });
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Check max depth
      if (current.depth >= maxDepth) {
        continue;
      }

      // Get ObjectType entity
      const objectType = await this.objectTypeRepository.findOne({
        where: { id: current.id },
      });

      if (objectType) {
        result.push({
          objectTypeId: current.id,
          objectType,
          depth: current.depth,
          path: current.path,
        });
      }

      // Get all outgoing relationships
      const relationships = await this.relationshipRepository.find({
        where: { source_id: current.id, is_active: true },
      });

      // Add unvisited neighbors to queue
      for (const rel of relationships) {
        if (!visited.has(rel.target_id)) {
          visited.add(rel.target_id);
          queue.push({
            id: rel.target_id,
            depth: current.depth + 1,
            path: [...current.path, rel.target_id],
          });
        }
      }
    }

    this.logger.log(`BFS traversal from ${startId}: visited ${result.length} nodes`);
    return result;
  }

  /**
   * Depth-First Search (DFS) traversal from a starting ObjectType
   * @param startId Starting ObjectType ID
   * @param maxDepth Maximum depth to traverse (default: 100)
   * @returns Array of ObjectTypes in DFS order with depth info
   */
  async depthFirstSearch(startId: string, maxDepth: number = this.DEFAULT_MAX_DEPTH): Promise<PathInfo[]> {
    this.validateMaxDepth(maxDepth);

    const visited = new Set<string>();
    const result: PathInfo[] = [];

    await this.dfsRecursive(startId, 0, [startId], visited, result, maxDepth);

    this.logger.log(`DFS traversal from ${startId}: visited ${result.length} nodes`);
    return result;
  }

  /**
   * Recursive helper for DFS
   * @private
   */
  private async dfsRecursive(
    currentId: string,
    depth: number,
    path: string[],
    visited: Set<string>,
    result: PathInfo[],
    maxDepth: number,
  ): Promise<void> {
    if (visited.has(currentId) || depth >= maxDepth) {
      return;
    }

    visited.add(currentId);

    // Get ObjectType entity
    const objectType = await this.objectTypeRepository.findOne({
      where: { id: currentId },
    });

    if (objectType) {
      result.push({
        objectTypeId: currentId,
        objectType,
        depth,
        path: [...path],
      });
    }

    // Get all outgoing relationships
    const relationships = await this.relationshipRepository.find({
      where: { source_id: currentId, is_active: true },
    });

    // Recursively visit each neighbor
    for (const rel of relationships) {
      await this.dfsRecursive(
        rel.target_id,
        depth + 1,
        [...path, rel.target_id],
        visited,
        result,
        maxDepth,
      );
    }
  }

  /**
   * Find all ancestors of an ObjectType (objects that point to it)
   * @param objectTypeId ObjectType ID
   * @param maxDepth Maximum depth to traverse (default: 100)
   * @returns Array of ancestor ObjectTypes with depth info
   */
  async findAncestors(objectTypeId: string, maxDepth: number = this.DEFAULT_MAX_DEPTH): Promise<PathInfo[]> {
    this.validateMaxDepth(maxDepth);

    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [];
    const result: PathInfo[] = [];

    // Initialize with the target ObjectType
    queue.push({ id: objectTypeId, depth: 0, path: [objectTypeId] });
    visited.add(objectTypeId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) {
        continue;
      }

      // Only add non-root nodes to results (ancestors)
      if (current.depth > 0) {
        const objectType = await this.objectTypeRepository.findOne({
          where: { id: current.id },
        });

        if (objectType) {
          result.push({
            objectTypeId: current.id,
            objectType,
            depth: current.depth,
            path: current.path,
          });
        }
      }

      // Find all relationships where current is the TARGET (incoming edges)
      const relationships = await this.relationshipRepository.find({
        where: { target_id: current.id, is_active: true },
      });

      // Add unvisited ancestors to queue
      for (const rel of relationships) {
        if (!visited.has(rel.source_id)) {
          visited.add(rel.source_id);
          queue.push({
            id: rel.source_id,
            depth: current.depth + 1,
            path: [rel.source_id, ...current.path],
          });
        }
      }
    }

    this.logger.log(`Found ${result.length} ancestors for ${objectTypeId}`);
    return result;
  }

  /**
   * Find all descendants of an ObjectType (objects it points to)
   * @param objectTypeId ObjectType ID
   * @param maxDepth Maximum depth to traverse (default: 100)
   * @returns Array of descendant ObjectTypes with depth info
   */
  async findDescendants(objectTypeId: string, maxDepth: number = this.DEFAULT_MAX_DEPTH): Promise<PathInfo[]> {
    this.validateMaxDepth(maxDepth);

    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [];
    const result: PathInfo[] = [];

    // Initialize with the source ObjectType
    queue.push({ id: objectTypeId, depth: 0, path: [objectTypeId] });
    visited.add(objectTypeId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) {
        continue;
      }

      // Only add non-root nodes to results (descendants)
      if (current.depth > 0) {
        const objectType = await this.objectTypeRepository.findOne({
          where: { id: current.id },
        });

        if (objectType) {
          result.push({
            objectTypeId: current.id,
            objectType,
            depth: current.depth,
            path: current.path,
          });
        }
      }

      // Find all relationships where current is the SOURCE (outgoing edges)
      const relationships = await this.relationshipRepository.find({
        where: { source_id: current.id, is_active: true },
      });

      // Add unvisited descendants to queue
      for (const rel of relationships) {
        if (!visited.has(rel.target_id)) {
          visited.add(rel.target_id);
          queue.push({
            id: rel.target_id,
            depth: current.depth + 1,
            path: [...current.path, rel.target_id],
          });
        }
      }
    }

    this.logger.log(`Found ${result.length} descendants for ${objectTypeId}`);
    return result;
  }

  /**
   * Find the shortest path between two ObjectTypes
   * @param sourceId Source ObjectType ID
   * @param targetId Target ObjectType ID
   * @param maxDepth Maximum depth to search (default: 100)
   * @returns PathInfo if path found, null otherwise
   */
  async findShortestPath(
    sourceId: string,
    targetId: string,
    maxDepth: number = this.DEFAULT_MAX_DEPTH,
  ): Promise<PathInfo | null> {
    this.validateMaxDepth(maxDepth);

    if (sourceId === targetId) {
      const objectType = await this.objectTypeRepository.findOne({
        where: { id: sourceId },
      });

      if (!objectType) {
        return null;
      }

      return {
        objectTypeId: sourceId,
        objectType,
        depth: 0,
        path: [sourceId],
      };
    }

    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number; path: string[] }> = [];

    queue.push({ id: sourceId, depth: 0, path: [sourceId] });
    visited.add(sourceId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) {
        continue;
      }

      // Get all outgoing relationships
      const relationships = await this.relationshipRepository.find({
        where: { source_id: current.id, is_active: true },
      });

      for (const rel of relationships) {
        const nextPath = [...current.path, rel.target_id];

        // Found the target!
        if (rel.target_id === targetId) {
          const objectType = await this.objectTypeRepository.findOne({
            where: { id: targetId },
          });

          if (objectType) {
            this.logger.log(
              `Found shortest path from ${sourceId} to ${targetId}: ${nextPath.length - 1} hops`,
            );

            return {
              objectTypeId: targetId,
              objectType,
              depth: current.depth + 1,
              path: nextPath,
            };
          }
        }

        // Continue BFS
        if (!visited.has(rel.target_id)) {
          visited.add(rel.target_id);
          queue.push({
            id: rel.target_id,
            depth: current.depth + 1,
            path: nextPath,
          });
        }
      }
    }

    this.logger.log(`No path found from ${sourceId} to ${targetId}`);
    return null;
  }

  /**
   * Detect circular references in the relationship graph
   * @param startId Starting ObjectType ID
   * @param maxDepth Maximum depth to search (default: 100)
   * @returns CircularReferenceInfo with cycle details if found
   */
  async detectCircularReferences(
    startId: string,
    maxDepth: number = this.DEFAULT_MAX_DEPTH,
  ): Promise<CircularReferenceInfo> {
    this.validateMaxDepth(maxDepth);

    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const hasCycle = await this.detectCycleDFS(
      startId,
      visited,
      recursionStack,
      path,
      0,
      maxDepth,
    );

    if (hasCycle && path.length > 0) {
      // Find the cycle in the path
      const cycleStart = path[path.length - 1];
      const cycleStartIndex = path.indexOf(cycleStart);
      const cycle = path.slice(cycleStartIndex);

      this.logger.warn(
        `Circular reference detected starting from ${startId}: ${cycle.join(' -> ')}`,
      );

      return {
        hasCircularReference: true,
        cycle,
        cycleLength: cycle.length,
      };
    }

    return {
      hasCircularReference: false,
    };
  }

  /**
   * Recursive DFS helper for cycle detection
   * @private
   */
  private async detectCycleDFS(
    currentId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    depth: number,
    maxDepth: number,
  ): Promise<boolean> {
    if (depth >= maxDepth) {
      return false;
    }

    visited.add(currentId);
    recursionStack.add(currentId);
    path.push(currentId);

    // Get all outgoing relationships
    const relationships = await this.relationshipRepository.find({
      where: { source_id: currentId, is_active: true },
    });

    for (const rel of relationships) {
      const targetId = rel.target_id;

      // If target is not visited, recurse
      if (!visited.has(targetId)) {
        if (await this.detectCycleDFS(targetId, visited, recursionStack, path, depth + 1, maxDepth)) {
          return true;
        }
      }
      // If target is in recursion stack, we found a cycle
      else if (recursionStack.has(targetId)) {
        path.push(targetId); // Add the cycle-closing node
        return true;
      }
    }

    // Remove from recursion stack when backtracking
    recursionStack.delete(currentId);
    path.pop();

    return false;
  }

  /**
   * Get the complete graph structure for visualization
   * @param maxNodes Maximum number of nodes to return (default: 1000)
   * @returns Object with nodes and edges for graph visualization
   */
  async getGraphStructure(maxNodes: number = 1000): Promise<{
    nodes: ObjectTypeEntity[];
    edges: ObjectRelationshipEntity[];
  }> {
    if (maxNodes < 1 || maxNodes > 10000) {
      throw new BadRequestException('maxNodes must be between 1 and 10000');
    }

    const [nodes, edges] = await Promise.all([
      this.objectTypeRepository.find({
        take: maxNodes,
        order: { created_at: 'ASC' },
      }),
      this.relationshipRepository.find({
        where: { is_active: true },
        relations: ['source', 'target'],
        order: { created_at: 'ASC' },
      }),
    ]);

    this.logger.log(`Retrieved graph structure: ${nodes.length} nodes, ${edges.length} edges`);

    return { nodes, edges };
  }

  /**
   * Validate max depth parameter
   * @private
   */
  private validateMaxDepth(maxDepth: number): void {
    if (maxDepth < 1 || maxDepth > 1000) {
      throw new BadRequestException('maxDepth must be between 1 and 1000');
    }
  }
}

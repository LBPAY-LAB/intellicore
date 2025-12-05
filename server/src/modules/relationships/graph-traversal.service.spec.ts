import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraphTraversalService } from './graph-traversal.service';
import { ObjectRelationshipEntity, RelationshipType, Cardinality } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { BadRequestException } from '@nestjs/common';

describe('GraphTraversalService', () => {
  let service: GraphTraversalService;
  let relationshipRepository: Repository<ObjectRelationshipEntity>;
  let objectTypeRepository: Repository<ObjectTypeEntity>;

  const createMockObjectType = (id: string, name: string): ObjectTypeEntity => ({
    id,
    name,
    description: `${name} entity`,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    fields: [],
  });

  const createMockRelationship = (
    id: string,
    sourceId: string,
    targetId: string,
  ): ObjectRelationshipEntity => ({
    id,
    source_id: sourceId,
    target_id: targetId,
    relationship_type: RelationshipType.HAS_MANY,
    cardinality: Cardinality.ONE_TO_MANY,
    is_bidirectional: false,
    description: 'Test relationship',
    relationship_rules: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    source: createMockObjectType(sourceId, `Type-${sourceId}`),
    target: createMockObjectType(targetId, `Type-${targetId}`),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphTraversalService,
        {
          provide: getRepositoryToken(ObjectRelationshipEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectTypeEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GraphTraversalService>(GraphTraversalService);
    relationshipRepository = module.get<Repository<ObjectRelationshipEntity>>(
      getRepositoryToken(ObjectRelationshipEntity),
    );
    objectTypeRepository = module.get<Repository<ObjectTypeEntity>>(
      getRepositoryToken(ObjectTypeEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('breadthFirstSearch', () => {
    it('should perform BFS traversal successfully', async () => {
      // Setup: A -> B -> C (linear graph)
      const objA = createMockObjectType('A', 'TypeA');
      const objB = createMockObjectType('B', 'TypeB');
      const objC = createMockObjectType('C', 'TypeC');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objA)
        .mockResolvedValueOnce(objB)
        .mockResolvedValueOnce(objC);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')]) // A -> B
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')]) // B -> C
        .mockResolvedValueOnce([]); // C has no outgoing edges

      const result = await service.breadthFirstSearch('A', 10);

      expect(result).toHaveLength(3);
      expect(result[0].objectTypeId).toBe('A');
      expect(result[0].depth).toBe(0);
      expect(result[1].objectTypeId).toBe('B');
      expect(result[1].depth).toBe(1);
      expect(result[2].objectTypeId).toBe('C');
      expect(result[2].depth).toBe(2);
    });

    it('should respect max depth limit', async () => {
      const objA = createMockObjectType('A', 'TypeA');
      const objB = createMockObjectType('B', 'TypeB');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objA)
        .mockResolvedValueOnce(objB);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')]);

      const result = await service.breadthFirstSearch('A', 1);

      expect(result).toHaveLength(1);
      expect(result[0].objectTypeId).toBe('A');
    });

    it('should throw BadRequestException for invalid maxDepth', async () => {
      await expect(service.breadthFirstSearch('A', 0)).rejects.toThrow(BadRequestException);
      await expect(service.breadthFirstSearch('A', 1001)).rejects.toThrow(BadRequestException);
    });
  });

  describe('depthFirstSearch', () => {
    it('should perform DFS traversal successfully', async () => {
      // Setup: A -> B, A -> C (branching graph)
      const objA = createMockObjectType('A', 'TypeA');
      const objB = createMockObjectType('B', 'TypeB');
      const objC = createMockObjectType('C', 'TypeC');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objA)
        .mockResolvedValueOnce(objB)
        .mockResolvedValueOnce(objC);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([
          createMockRelationship('rel1', 'A', 'B'),
          createMockRelationship('rel2', 'A', 'C'),
        ])
        .mockResolvedValueOnce([]) // B has no outgoing
        .mockResolvedValueOnce([]); // C has no outgoing

      const result = await service.depthFirstSearch('A', 10);

      expect(result).toHaveLength(3);
      expect(result[0].objectTypeId).toBe('A');
      expect(result[0].depth).toBe(0);
    });

    it('should throw BadRequestException for invalid maxDepth', async () => {
      await expect(service.depthFirstSearch('A', 0)).rejects.toThrow(BadRequestException);
      await expect(service.depthFirstSearch('A', 1001)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAncestors', () => {
    it('should find all ancestors successfully', async () => {
      // Setup: A -> B -> C (we query for C's ancestors)
      const objA = createMockObjectType('A', 'TypeA');
      const objB = createMockObjectType('B', 'TypeB');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objB)
        .mockResolvedValueOnce(objA);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')]) // B -> C
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')]) // A -> B
        .mockResolvedValueOnce([]); // A has no incoming

      const result = await service.findAncestors('C', 10);

      expect(result.length).toBeGreaterThanOrEqual(1);
      // Should find B and A as ancestors
    });

    it('should return empty array when no ancestors exist', async () => {
      jest.spyOn(relationshipRepository, 'find').mockResolvedValue([]);

      const result = await service.findAncestors('A', 10);

      expect(result).toHaveLength(0);
    });
  });

  describe('findDescendants', () => {
    it('should find all descendants successfully', async () => {
      // Setup: A -> B -> C (we query for A's descendants)
      const objB = createMockObjectType('B', 'TypeB');
      const objC = createMockObjectType('C', 'TypeC');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objB)
        .mockResolvedValueOnce(objC);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')]) // A -> B
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')]) // B -> C
        .mockResolvedValueOnce([]); // C has no outgoing

      const result = await service.findDescendants('A', 10);

      expect(result.length).toBeGreaterThanOrEqual(1);
      // Should find B and C as descendants
    });

    it('should return empty array when no descendants exist', async () => {
      jest.spyOn(relationshipRepository, 'find').mockResolvedValue([]);

      const result = await service.findDescendants('A', 10);

      expect(result).toHaveLength(0);
    });
  });

  describe('findShortestPath', () => {
    it('should find shortest path between two nodes', async () => {
      // Setup: A -> B -> C
      const objA = createMockObjectType('A', 'TypeA');
      const objB = createMockObjectType('B', 'TypeB');
      const objC = createMockObjectType('C', 'TypeC');

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(objC);

      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')])
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')]);

      const result = await service.findShortestPath('A', 'C', 10);

      expect(result).toBeDefined();
      expect(result?.objectTypeId).toBe('C');
      expect(result?.path).toContain('A');
      expect(result?.path).toContain('C');
    });

    it('should return same node if source equals target', async () => {
      const objA = createMockObjectType('A', 'TypeA');

      jest.spyOn(objectTypeRepository, 'findOne').mockResolvedValue(objA);

      const result = await service.findShortestPath('A', 'A', 10);

      expect(result).toBeDefined();
      expect(result?.objectTypeId).toBe('A');
      expect(result?.depth).toBe(0);
    });

    it('should return null when no path exists', async () => {
      jest.spyOn(relationshipRepository, 'find').mockResolvedValue([]);

      const result = await service.findShortestPath('A', 'Z', 10);

      expect(result).toBeNull();
    });
  });

  describe('detectCircularReferences', () => {
    it('should detect circular reference in graph', async () => {
      // Setup: A -> B -> C -> A (cycle)
      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')])
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')])
        .mockResolvedValueOnce([createMockRelationship('rel3', 'C', 'A')]);

      const result = await service.detectCircularReferences('A', 10);

      expect(result.hasCircularReference).toBe(true);
      expect(result.cycle).toBeDefined();
      expect(result.cycleLength).toBeGreaterThan(0);
    });

    it('should return false when no circular reference exists', async () => {
      // Setup: A -> B -> C (linear, no cycle)
      jest.spyOn(relationshipRepository, 'find')
        .mockResolvedValueOnce([createMockRelationship('rel1', 'A', 'B')])
        .mockResolvedValueOnce([createMockRelationship('rel2', 'B', 'C')])
        .mockResolvedValueOnce([]);

      const result = await service.detectCircularReferences('A', 10);

      expect(result.hasCircularReference).toBe(false);
      expect(result.cycle).toBeUndefined();
    });
  });

  describe('getGraphStructure', () => {
    it('should return complete graph structure', async () => {
      const mockNodes = [
        createMockObjectType('A', 'TypeA'),
        createMockObjectType('B', 'TypeB'),
      ];

      const mockEdges = [createMockRelationship('rel1', 'A', 'B')];

      jest.spyOn(objectTypeRepository, 'find').mockResolvedValue(mockNodes);
      jest.spyOn(relationshipRepository, 'find').mockResolvedValue(mockEdges);

      const result = await service.getGraphStructure(1000);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid maxNodes', async () => {
      await expect(service.getGraphStructure(0)).rejects.toThrow(BadRequestException);
      await expect(service.getGraphStructure(10001)).rejects.toThrow(BadRequestException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RelationshipsService } from './relationships.service';
import { ObjectRelationshipEntity, RelationshipType, Cardinality } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('RelationshipsService', () => {
  let service: RelationshipsService;
  let relationshipRepository: Repository<ObjectRelationshipEntity>;
  let objectTypeRepository: Repository<ObjectTypeEntity>;
  let dataSource: DataSource;

  const mockObjectType1: ObjectTypeEntity = {
    id: 'obj-type-1',
    name: 'Customer',
    description: 'Customer entity',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    fields: [],
  };

  const mockObjectType2: ObjectTypeEntity = {
    id: 'obj-type-2',
    name: 'Order',
    description: 'Order entity',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    fields: [],
  };

  const mockRelationship: ObjectRelationshipEntity = {
    id: 'rel-1',
    source_id: 'obj-type-1',
    target_id: 'obj-type-2',
    relationship_type: RelationshipType.HAS_MANY,
    cardinality: Cardinality.ONE_TO_MANY,
    is_bidirectional: false,
    description: 'Customer has many orders',
    relationship_rules: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
    source: mockObjectType1,
    target: mockObjectType2,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelationshipsService,
        {
          provide: getRepositoryToken(ObjectRelationshipEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(ObjectTypeEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<RelationshipsService>(RelationshipsService);
    relationshipRepository = module.get<Repository<ObjectRelationshipEntity>>(
      getRepositoryToken(ObjectRelationshipEntity),
    );
    objectTypeRepository = module.get<Repository<ObjectTypeEntity>>(
      getRepositoryToken(ObjectTypeEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new relationship successfully', async () => {
      const input = {
        source_id: 'obj-type-1',
        target_id: 'obj-type-2',
        relationship_type: RelationshipType.HAS_MANY,
        cardinality: Cardinality.ONE_TO_MANY,
        is_bidirectional: false,
        description: 'Test relationship',
      };

      // Mock validateRelationshipInput calls
      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(mockObjectType1) // Source validation
        .mockResolvedValueOnce(mockObjectType2); // Target validation

      // Mock relationship repository calls in order
      const findOneSpy = jest.spyOn(relationshipRepository, 'findOne')
        .mockImplementation((options: any) => {
          // Duplicate check call (with specific where clause)
          if (options.where && options.where.source_id) {
            return Promise.resolve(null);
          }
          // Cardinality constraint checks
          if (options.where && options.where.cardinality) {
            return Promise.resolve(null);
          }
          // findOne after save call (with id and relations)
          if (options.where && options.where.id && options.relations) {
            return Promise.resolve(mockRelationship);
          }
          return Promise.resolve(null);
        });

      jest.spyOn(relationshipRepository, 'find').mockResolvedValue([]);
      jest.spyOn(relationshipRepository, 'create').mockReturnValue(mockRelationship as any);
      jest.spyOn(relationshipRepository, 'save').mockResolvedValue(mockRelationship);

      const result = await service.create(input);

      expect(result).toBeDefined();
      expect(result.source_id).toBe(input.source_id);
      expect(result.target_id).toBe(input.target_id);
      expect(relationshipRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for self-referencing relationship', async () => {
      const input = {
        source_id: 'obj-type-1',
        target_id: 'obj-type-1', // Same as source
        relationship_type: RelationshipType.HAS_MANY,
        cardinality: Cardinality.ONE_TO_MANY,
      };

      await expect(service.create(input)).rejects.toThrow(BadRequestException);
      await expect(service.create(input)).rejects.toThrow('self-referencing not allowed');
    });

    it('should throw NotFoundException when source ObjectType does not exist', async () => {
      const input = {
        source_id: 'non-existent',
        target_id: 'obj-type-2',
        relationship_type: RelationshipType.HAS_MANY,
        cardinality: Cardinality.ONE_TO_MANY,
      };

      jest.spyOn(objectTypeRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.create(input)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when target ObjectType does not exist', async () => {
      const input = {
        source_id: 'obj-type-1',
        target_id: 'non-existent',
        relationship_type: RelationshipType.HAS_MANY,
        cardinality: Cardinality.ONE_TO_MANY,
      };

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(mockObjectType1)
        .mockResolvedValueOnce(null);

      await expect(service.create(input)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate relationship', async () => {
      const input = {
        source_id: 'obj-type-1',
        target_id: 'obj-type-2',
        relationship_type: RelationshipType.HAS_MANY,
        cardinality: Cardinality.ONE_TO_MANY,
      };

      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(mockObjectType1)
        .mockResolvedValueOnce(mockObjectType2);

      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(mockRelationship);

      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid relationship type and cardinality combination', async () => {
      const input = {
        source_id: 'obj-type-1',
        target_id: 'obj-type-2',
        relationship_type: RelationshipType.HAS_ONE,
        cardinality: Cardinality.MANY_TO_MANY, // Invalid combination
      };

      // Mock for validateRelationshipInput
      jest.spyOn(objectTypeRepository, 'findOne')
        .mockResolvedValueOnce(mockObjectType1)
        .mockResolvedValueOnce(mockObjectType2)
        .mockResolvedValueOnce(mockObjectType1)
        .mockResolvedValueOnce(mockObjectType2);

      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(input)).rejects.toThrow(BadRequestException);
      await expect(service.create(input)).rejects.toThrow('Invalid combination');
    });
  });

  describe('findAll', () => {
    it('should return paginated relationships', async () => {
      const mockRelationships = [mockRelationship];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRelationships),
      };

      jest.spyOn(relationshipRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);
      jest.spyOn(relationshipRepository, 'count').mockResolvedValue(1);

      const result = await service.findAll({ first: 10 });

      expect(result.nodes).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('should throw BadRequestException for invalid pagination parameters', async () => {
      await expect(service.findAll({ first: 0 })).rejects.toThrow(BadRequestException);
      await expect(service.findAll({ first: 101 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a single relationship by ID', async () => {
      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(mockRelationship);

      const result = await service.findOne('rel-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('rel-1');
    });

    it('should throw NotFoundException when relationship does not exist', async () => {
      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByObjectType', () => {
    it('should return all relationships for an ObjectType', async () => {
      jest.spyOn(objectTypeRepository, 'findOne').mockResolvedValue(mockObjectType1);
      jest.spyOn(relationshipRepository, 'find').mockResolvedValue([mockRelationship]);

      const result = await service.findByObjectType('obj-type-1');

      expect(result).toHaveLength(1);
      expect(result[0].source_id).toBe('obj-type-1');
    });

    it('should throw NotFoundException when ObjectType does not exist', async () => {
      jest.spyOn(objectTypeRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findByObjectType('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a relationship successfully', async () => {
      const input = {
        id: 'rel-1',
        description: 'Updated description',
        is_active: false,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockRelationship);
      mockQueryRunner.manager.save.mockResolvedValue({ ...mockRelationship, ...input });

      const result = await service.update(input);

      expect(result.description).toBe('Updated description');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when relationship does not exist', async () => {
      const input = {
        id: 'non-existent',
        description: 'Updated',
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.update(input)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete a relationship', async () => {
      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(mockRelationship);
      jest.spyOn(relationshipRepository, 'softDelete').mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      const result = await service.delete('rel-1');

      expect(result).toBe(true);
      expect(relationshipRepository.softDelete).toHaveBeenCalledWith('rel-1');
    });

    it('should throw NotFoundException when relationship does not exist', async () => {
      jest.spyOn(relationshipRepository, 'findOne').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ObjectRelationshipEntity, RelationshipType, Cardinality } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { CreateRelationshipInput } from './dto/create-relationship.input';
import { UpdateRelationshipInput } from './dto/update-relationship.input';
import { PaginationArgs } from './dto/pagination.args';
import { PaginatedRelationshipsResponse } from './dto/paginated-relationships.response';

@Injectable()
export class RelationshipsService {
  private readonly logger = new Logger(RelationshipsService.name);

  constructor(
    @InjectRepository(ObjectRelationshipEntity)
    private readonly relationshipRepository: Repository<ObjectRelationshipEntity>,
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new relationship with comprehensive validation
   * @param input CreateRelationshipInput
   * @returns Created relationship entity
   */
  async create(input: CreateRelationshipInput): Promise<ObjectRelationshipEntity> {
    // Validate inputs
    await this.validateRelationshipInput(input);

    // Check for duplicate relationship
    const existing = await this.relationshipRepository.findOne({
      where: {
        source_id: input.source_id,
        target_id: input.target_id,
        relationship_type: input.relationship_type,
      },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deleted_at) {
        throw new ConflictException(
          'A relationship with these parameters exists but is deleted. Please restore or use different parameters.',
        );
      }
      throw new ConflictException('This relationship already exists');
    }

    // Validate cardinality rules
    await this.validateCardinalityConstraints(input);

    try {
      const relationship = this.relationshipRepository.create(input);
      const saved = await this.relationshipRepository.save(relationship);

      this.logger.log(
        `Created relationship: ${saved.id} (${input.relationship_type}: ${input.source_id} -> ${input.target_id})`,
      );

      // Load relations before returning
      return await this.findOne(saved.id);
    } catch (error) {
      this.logger.error(`Failed to create relationship: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create relationship');
    }
  }

  /**
   * Find all relationships with cursor-based pagination
   * @param paginationArgs PaginationArgs
   * @returns Paginated relationships response
   */
  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedRelationshipsResponse> {
    const { first = 10, after } = paginationArgs;

    if (first < 1 || first > 100) {
      throw new BadRequestException('First parameter must be between 1 and 100');
    }

    try {
      const queryBuilder = this.relationshipRepository
        .createQueryBuilder('relationship')
        .leftJoinAndSelect('relationship.source', 'source')
        .leftJoinAndSelect('relationship.target', 'target')
        .orderBy('relationship.created_at', 'ASC')
        .take(first + 1);

      if (after) {
        queryBuilder.where('relationship.id > :cursor', { cursor: after });
      }

      const nodes = await queryBuilder.getMany();
      const hasNextPage = nodes.length > first;

      if (hasNextPage) {
        nodes.pop();
      }

      const totalCount = await this.relationshipRepository.count();

      return {
        nodes,
        pageInfo: {
          hasNextPage,
          endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : undefined,
        },
        totalCount,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch relationships: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch relationships');
    }
  }

  /**
   * Find a single relationship by ID
   * @param id Relationship UUID
   * @returns Relationship entity with relations
   */
  async findOne(id: string): Promise<ObjectRelationshipEntity> {
    try {
      const relationship = await this.relationshipRepository.findOne({
        where: { id },
        relations: ['source', 'target'],
      });

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID "${id}" not found`);
      }

      return relationship;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find relationship ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve relationship');
    }
  }

  /**
   * Find all relationships for a specific ObjectType
   * @param objectTypeId ObjectType UUID
   * @returns Array of relationships
   */
  async findByObjectType(objectTypeId: string): Promise<ObjectRelationshipEntity[]> {
    try {
      // Verify ObjectType exists
      const objectType = await this.objectTypeRepository.findOne({
        where: { id: objectTypeId },
      });

      if (!objectType) {
        throw new NotFoundException(`ObjectType with ID "${objectTypeId}" not found`);
      }

      // Find all relationships where this ObjectType is either source or target
      return await this.relationshipRepository.find({
        where: [
          { source_id: objectTypeId },
          { target_id: objectTypeId },
        ],
        relations: ['source', 'target'],
        order: { created_at: 'ASC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find relationships for ObjectType ${objectTypeId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve relationships');
    }
  }

  /**
   * Update an existing relationship
   * @param input UpdateRelationshipInput
   * @returns Updated relationship entity
   */
  async update(input: UpdateRelationshipInput): Promise<ObjectRelationshipEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const relationship = await queryRunner.manager.findOne(ObjectRelationshipEntity, {
        where: { id: input.id },
        relations: ['source', 'target'],
      });

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID "${input.id}" not found`);
      }

      // Validate relationship type combinations if being updated
      if (input.relationship_type) {
        this.validateRelationshipTypeCombination(
          input.relationship_type,
          input.cardinality || relationship.cardinality,
        );
      }

      // Apply updates
      Object.assign(relationship, {
        ...(input.relationship_type && { relationship_type: input.relationship_type }),
        ...(input.cardinality && { cardinality: input.cardinality }),
        ...(input.is_bidirectional !== undefined && { is_bidirectional: input.is_bidirectional }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.relationship_rules !== undefined && { relationship_rules: input.relationship_rules }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
      });

      const updated = await queryRunner.manager.save(relationship);
      await queryRunner.commitTransaction();

      this.logger.log(`Updated relationship: ${updated.id}`);
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update relationship ${input.id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update relationship');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Soft delete a relationship
   * @param id Relationship UUID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    try {
      const relationship = await this.findOne(id);

      await this.relationshipRepository.softDelete(id);

      this.logger.log(`Soft deleted relationship: ${id}`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete relationship ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete relationship');
    }
  }

  /**
   * Validate relationship input
   * @private
   */
  private async validateRelationshipInput(input: CreateRelationshipInput): Promise<void> {
    // Prevent self-referencing
    if (input.source_id === input.target_id) {
      throw new BadRequestException('Source and target ObjectTypes cannot be the same (self-referencing not allowed)');
    }

    // Verify source ObjectType exists
    const source = await this.objectTypeRepository.findOne({
      where: { id: input.source_id },
    });

    if (!source) {
      throw new NotFoundException(`Source ObjectType with ID "${input.source_id}" not found`);
    }

    // Verify target ObjectType exists
    const target = await this.objectTypeRepository.findOne({
      where: { id: input.target_id },
    });

    if (!target) {
      throw new NotFoundException(`Target ObjectType with ID "${input.target_id}" not found`);
    }

    // Validate relationship type and cardinality combination
    this.validateRelationshipTypeCombination(input.relationship_type, input.cardinality);
  }

  /**
   * Validate relationship type and cardinality combination
   * @private
   */
  private validateRelationshipTypeCombination(
    relationshipType: RelationshipType,
    cardinality: Cardinality,
  ): void {
    const validCombinations: Record<RelationshipType, Cardinality[]> = {
      [RelationshipType.PARENT_OF]: [Cardinality.ONE_TO_MANY, Cardinality.MANY_TO_MANY],
      [RelationshipType.CHILD_OF]: [Cardinality.ONE_TO_ONE, Cardinality.ONE_TO_MANY],
      [RelationshipType.HAS_ONE]: [Cardinality.ONE_TO_ONE],
      [RelationshipType.HAS_MANY]: [Cardinality.ONE_TO_MANY, Cardinality.MANY_TO_MANY],
      [RelationshipType.BELONGS_TO]: [Cardinality.ONE_TO_ONE, Cardinality.ONE_TO_MANY],
    };

    const allowedCardinalities = validCombinations[relationshipType];
    if (!allowedCardinalities.includes(cardinality)) {
      throw new BadRequestException(
        `Invalid combination: ${relationshipType} cannot have ${cardinality} cardinality. ` +
        `Allowed: ${allowedCardinalities.join(', ')}`,
      );
    }
  }

  /**
   * Validate cardinality constraints
   * @private
   */
  private async validateCardinalityConstraints(input: CreateRelationshipInput): Promise<void> {
    // For ONE_TO_ONE relationships, check if source already has a relationship to any target
    if (input.cardinality === Cardinality.ONE_TO_ONE) {
      const existingFromSource = await this.relationshipRepository.findOne({
        where: {
          source_id: input.source_id,
          relationship_type: input.relationship_type,
          cardinality: Cardinality.ONE_TO_ONE,
        },
      });

      if (existingFromSource) {
        throw new ConflictException(
          `Source ObjectType already has a ONE_TO_ONE relationship of type ${input.relationship_type}`,
        );
      }

      const existingToTarget = await this.relationshipRepository.findOne({
        where: {
          target_id: input.target_id,
          relationship_type: input.relationship_type,
          cardinality: Cardinality.ONE_TO_ONE,
        },
      });

      if (existingToTarget) {
        throw new ConflictException(
          `Target ObjectType already has a ONE_TO_ONE relationship of type ${input.relationship_type}`,
        );
      }
    }

    // For HAS_ONE relationships, ensure only one target exists
    if (input.relationship_type === RelationshipType.HAS_ONE) {
      const existing = await this.relationshipRepository.findOne({
        where: {
          source_id: input.source_id,
          relationship_type: RelationshipType.HAS_ONE,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Source ObjectType already has a HAS_ONE relationship. Only one target is allowed.',
        );
      }
    }
  }
}

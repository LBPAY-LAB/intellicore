import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ObjectTypeEntity } from './entities/object-type.entity';
import { CreateObjectTypeInput } from './dto/create-object-type.input';
import { UpdateObjectTypeInput } from './dto/update-object-type.input';
import { PaginationArgs } from './dto/pagination.args';
import { PaginatedObjectTypesResponse } from './dto/paginated-object-types.response';

@Injectable()
export class ObjectTypesService {
  private readonly logger = new Logger(ObjectTypesService.name);

  constructor(
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new ObjectType with unique name validation
   * @param input CreateObjectTypeInput
   * @returns Created ObjectType entity
   * @throws ConflictException if name already exists
   */
  async create(input: CreateObjectTypeInput): Promise<ObjectTypeEntity> {
    // Check if name already exists
    const existing = await this.objectTypeRepository.findOne({
      where: { name: input.name },
      withDeleted: true, // Check soft-deleted records too
    });

    if (existing) {
      if (existing.deleted_at) {
        throw new ConflictException(
          `ObjectType with name "${input.name}" exists but is deleted. Please restore or use a different name.`,
        );
      }
      throw new ConflictException(
        `ObjectType with name "${input.name}" already exists`,
      );
    }

    try {
      const objectType = this.objectTypeRepository.create(input);
      const saved = await this.objectTypeRepository.save(objectType);
      this.logger.log(`Created ObjectType: ${saved.id} - ${saved.name}`);
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create ObjectType: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create ObjectType');
    }
  }

  /**
   * Find all ObjectTypes with cursor-based pagination
   * @param paginationArgs PaginationArgs
   * @returns Paginated response with ObjectTypes
   */
  async findAll(
    paginationArgs: PaginationArgs,
  ): Promise<PaginatedObjectTypesResponse> {
    const { first = 10, after } = paginationArgs;

    // Validate pagination parameters
    if (first < 1 || first > 100) {
      throw new BadRequestException('First parameter must be between 1 and 100');
    }

    try {
      // Build query
      const queryBuilder = this.objectTypeRepository
        .createQueryBuilder('objectType')
        .orderBy('objectType.created_at', 'ASC')
        .take(first + 1); // Fetch one extra to determine hasNextPage

      // Apply cursor pagination
      if (after) {
        queryBuilder.where('objectType.id > :cursor', { cursor: after });
      }

      const nodes = await queryBuilder.getMany();
      const hasNextPage = nodes.length > first;

      // Remove the extra item if present
      if (hasNextPage) {
        nodes.pop();
      }

      const totalCount = await this.objectTypeRepository.count();

      return {
        nodes,
        pageInfo: {
          hasNextPage,
          endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : undefined,
        },
        totalCount,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch ObjectTypes: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch ObjectTypes');
    }
  }

  /**
   * Find a single ObjectType by ID
   * @param id ObjectType UUID
   * @returns ObjectType entity with relations
   * @throws NotFoundException if not found
   */
  async findOne(id: string): Promise<ObjectTypeEntity> {
    try {
      const objectType = await this.objectTypeRepository.findOne({
        where: { id },
        relations: ['fields'],
      });

      if (!objectType) {
        throw new NotFoundException(`ObjectType with ID "${id}" not found`);
      }

      return objectType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find ObjectType ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve ObjectType');
    }
  }

  /**
   * Update an existing ObjectType with validation
   * @param input UpdateObjectTypeInput
   * @returns Updated ObjectType entity
   * @throws NotFoundException if not found
   * @throws ConflictException if name conflicts
   */
  async update(input: UpdateObjectTypeInput): Promise<ObjectTypeEntity> {
    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const objectType = await queryRunner.manager.findOne(ObjectTypeEntity, {
        where: { id: input.id },
      });

      if (!objectType) {
        throw new NotFoundException(`ObjectType with ID "${input.id}" not found`);
      }

      // Check name uniqueness if name is being updated
      if (input.name && input.name !== objectType.name) {
        const existing = await queryRunner.manager.findOne(ObjectTypeEntity, {
          where: { name: input.name },
          withDeleted: true,
        });

        if (existing && existing.id !== objectType.id) {
          throw new ConflictException(
            `ObjectType with name "${input.name}" already exists`,
          );
        }
      }

      // Apply updates
      Object.assign(objectType, {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
      });

      const updated = await queryRunner.manager.save(objectType);
      await queryRunner.commitTransaction();

      this.logger.log(`Updated ObjectType: ${updated.id} - ${updated.name}`);
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update ObjectType ${input.id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update ObjectType');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Soft delete an ObjectType
   * @param id ObjectType UUID
   * @returns True if deleted successfully
   * @throws NotFoundException if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      const objectType = await this.findOne(id);

      // Use soft delete instead of hard delete
      await this.objectTypeRepository.softDelete(id);

      this.logger.log(`Soft deleted ObjectType: ${id} - ${objectType.name}`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete ObjectType ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete ObjectType');
    }
  }

  /**
   * Restore a soft-deleted ObjectType
   * @param id ObjectType UUID
   * @returns Restored ObjectType entity
   * @throws NotFoundException if not found
   */
  async restore(id: string): Promise<ObjectTypeEntity> {
    try {
      const objectType = await this.objectTypeRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!objectType) {
        throw new NotFoundException(`ObjectType with ID "${id}" not found`);
      }

      if (!objectType.deleted_at) {
        throw new BadRequestException(`ObjectType with ID "${id}" is not deleted`);
      }

      await this.objectTypeRepository.restore(id);
      const restored = await this.findOne(id);

      this.logger.log(`Restored ObjectType: ${id} - ${restored.name}`);
      return restored;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to restore ObjectType ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to restore ObjectType');
    }
  }
}

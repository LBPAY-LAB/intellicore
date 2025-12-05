import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InstanceEntity, InstanceStatus } from './entities/instance.entity';
import { CreateInstanceInput } from './dto/create-instance.input';
import { UpdateInstanceInput } from './dto/update-instance.input';
import { InstancePaginationArgs } from './dto/instance-pagination.args';
import { PaginatedInstancesResponse } from './dto/paginated-instances.response';
import { InstanceValidationService, ValidationResult } from './services/instance-validation.service';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';

// Event constants for search indexing
export const INSTANCE_CREATED = 'instance.created';
export const INSTANCE_UPDATED = 'instance.updated';
export const INSTANCE_DELETED = 'instance.deleted';
export const INSTANCE_STATUS_CHANGED = 'instance.status.changed';

@Injectable()
export class InstancesService {
  private readonly logger = new Logger(InstancesService.name);

  constructor(
    @InjectRepository(InstanceEntity)
    private readonly instanceRepository: Repository<InstanceEntity>,
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
    private readonly validationService: InstanceValidationService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new Instance with validation against ObjectType schema
   */
  async create(input: CreateInstanceInput, userId?: string): Promise<InstanceEntity> {
    // Validate that ObjectType exists
    const objectType = await this.objectTypeRepository.findOne({
      where: { id: input.objectTypeId },
    });

    if (!objectType) {
      throw new NotFoundException(`ObjectType with ID "${input.objectTypeId}" not found`);
    }

    if (!objectType.is_active) {
      throw new BadRequestException(`ObjectType "${objectType.name}" is not active`);
    }

    // Validate instance data against ObjectType schema
    const data = input.data || {};
    const validationResult = await this.validationService.validateInstanceData(
      input.objectTypeId,
      data,
    );

    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Instance data validation failed',
        errors: validationResult.errors,
      });
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      this.logger.warn(`Instance creation warnings: ${JSON.stringify(validationResult.warnings)}`);
    }

    try {
      const instance = this.instanceRepository.create({
        objectTypeId: input.objectTypeId,
        data,
        status: input.status || InstanceStatus.DRAFT,
        displayName: input.displayName,
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await this.instanceRepository.save(instance);

      // Load relations for event payload
      const savedWithRelations = await this.instanceRepository.findOne({
        where: { id: saved.id },
        relations: ['objectType'],
      });

      // Emit event for search indexing
      this.eventEmitter.emit(INSTANCE_CREATED, { instance: savedWithRelations, userId });

      this.logger.log(`Created Instance: ${saved.id} for ObjectType: ${objectType.name}`);
      return savedWithRelations || saved;
    } catch (error) {
      this.logger.error(`Failed to create Instance: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create Instance');
    }
  }

  /**
   * Find all Instances with cursor-based pagination and filtering
   */
  async findAll(
    paginationArgs: InstancePaginationArgs,
  ): Promise<PaginatedInstancesResponse> {
    const { first = 10, after, objectTypeId, status } = paginationArgs;

    if (first < 1 || first > 100) {
      throw new BadRequestException('First parameter must be between 1 and 100');
    }

    try {
      const queryBuilder = this.instanceRepository
        .createQueryBuilder('instance')
        .leftJoinAndSelect('instance.objectType', 'objectType')
        .orderBy('instance.createdAt', 'DESC')
        .take(first + 1);

      // Apply cursor pagination
      if (after) {
        // Decode cursor (assuming it's the instance ID or a base64 encoded value)
        queryBuilder.andWhere('instance.id > :cursor', { cursor: after });
      }

      // Filter by ObjectType
      if (objectTypeId) {
        queryBuilder.andWhere('instance.objectTypeId = :objectTypeId', { objectTypeId });
      }

      // Filter by status
      if (status) {
        queryBuilder.andWhere('instance.status = :status', { status });
      }

      const nodes = await queryBuilder.getMany();
      const hasNextPage = nodes.length > first;

      if (hasNextPage) {
        nodes.pop();
      }

      // Count total for the filtered query
      const countQuery = this.instanceRepository
        .createQueryBuilder('instance');

      if (objectTypeId) {
        countQuery.andWhere('instance.objectTypeId = :objectTypeId', { objectTypeId });
      }
      if (status) {
        countQuery.andWhere('instance.status = :status', { status });
      }

      const totalCount = await countQuery.getCount();

      return {
        nodes,
        pageInfo: {
          hasNextPage,
          endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : undefined,
        },
        totalCount,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch Instances: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch Instances');
    }
  }

  /**
   * Find a single Instance by ID
   */
  async findOne(id: string): Promise<InstanceEntity> {
    try {
      const instance = await this.instanceRepository.findOne({
        where: { id },
        relations: ['objectType', 'objectType.fields', 'outgoingRelationships', 'incomingRelationships'],
      });

      if (!instance) {
        throw new NotFoundException(`Instance with ID "${id}" not found`);
      }

      return instance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find Instance ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve Instance');
    }
  }

  /**
   * Find instances by ObjectType ID
   */
  async findByObjectType(
    objectTypeId: string,
    paginationArgs: InstancePaginationArgs,
  ): Promise<PaginatedInstancesResponse> {
    return this.findAll({
      ...paginationArgs,
      objectTypeId,
    });
  }

  /**
   * Update an existing Instance with validation
   */
  async update(input: UpdateInstanceInput, userId?: string): Promise<InstanceEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instance = await queryRunner.manager.findOne(InstanceEntity, {
        where: { id: input.id },
        relations: ['objectType'],
      });

      if (!instance) {
        throw new NotFoundException(`Instance with ID "${input.id}" not found`);
      }

      // Merge existing data with new data if data is being updated
      let newData = instance.data;
      if (input.data !== undefined) {
        newData = { ...instance.data, ...input.data };

        // Validate merged data against ObjectType schema
        const validationResult = await this.validationService.validateInstanceData(
          instance.objectTypeId,
          newData,
        );

        if (!validationResult.isValid) {
          throw new BadRequestException({
            message: 'Instance data validation failed',
            errors: validationResult.errors,
          });
        }

        if (validationResult.warnings.length > 0) {
          this.logger.warn(`Instance update warnings: ${JSON.stringify(validationResult.warnings)}`);
        }
      }

      // Apply updates
      Object.assign(instance, {
        ...(input.data !== undefined && { data: newData }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedBy: userId,
      });

      const updated = await queryRunner.manager.save(instance);
      await queryRunner.commitTransaction();

      // Load relations for event payload
      const updatedWithRelations = await this.instanceRepository.findOne({
        where: { id: updated.id },
        relations: ['objectType'],
      });

      // Emit event for search indexing
      this.eventEmitter.emit(INSTANCE_UPDATED, { instance: updatedWithRelations, userId });

      this.logger.log(`Updated Instance: ${updated.id}`);
      return updatedWithRelations || updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update Instance ${input.id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update Instance');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Soft delete an Instance
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.findOne(id);

      await this.instanceRepository.softDelete(id);

      // Emit event for search index removal
      this.eventEmitter.emit(INSTANCE_DELETED, { instanceId: id });

      this.logger.log(`Soft deleted Instance: ${id}`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete Instance ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete Instance');
    }
  }

  /**
   * Restore a soft-deleted Instance
   */
  async restore(id: string): Promise<InstanceEntity> {
    try {
      const instance = await this.instanceRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!instance) {
        throw new NotFoundException(`Instance with ID "${id}" not found`);
      }

      if (!instance.deletedAt) {
        throw new BadRequestException(`Instance with ID "${id}" is not deleted`);
      }

      await this.instanceRepository.restore(id);
      const restored = await this.findOne(id);

      this.logger.log(`Restored Instance: ${id}`);
      return restored;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to restore Instance ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to restore Instance');
    }
  }

  /**
   * Validate instance data without creating
   */
  async validateData(objectTypeId: string, data: Record<string, any>): Promise<ValidationResult> {
    return this.validationService.validateInstanceData(objectTypeId, data);
  }

  /**
   * Change instance status
   */
  async changeStatus(id: string, status: InstanceStatus, userId?: string): Promise<InstanceEntity> {
    const instance = await this.findOne(id);

    // Validate status transitions
    this.validateStatusTransition(instance.status, status);

    const previousStatus = instance.status;
    instance.status = status;
    instance.updatedBy = userId;

    const updated = await this.instanceRepository.save(instance);

    // Emit event for search indexing
    this.eventEmitter.emit(INSTANCE_STATUS_CHANGED, { instance: updated, userId });

    this.logger.log(`Changed Instance ${id} status from ${previousStatus} to ${status}`);
    return updated;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(from: InstanceStatus, to: InstanceStatus): void {
    const validTransitions: Record<InstanceStatus, InstanceStatus[]> = {
      [InstanceStatus.DRAFT]: [InstanceStatus.ACTIVE, InstanceStatus.DELETED],
      [InstanceStatus.ACTIVE]: [InstanceStatus.INACTIVE, InstanceStatus.ARCHIVED, InstanceStatus.DELETED],
      [InstanceStatus.INACTIVE]: [InstanceStatus.ACTIVE, InstanceStatus.ARCHIVED, InstanceStatus.DELETED],
      [InstanceStatus.ARCHIVED]: [InstanceStatus.ACTIVE, InstanceStatus.DELETED],
      [InstanceStatus.DELETED]: [], // No transitions from DELETED
    };

    if (!validTransitions[from].includes(to)) {
      throw new BadRequestException(
        `Invalid status transition from ${from} to ${to}. Valid transitions: ${validTransitions[from].join(', ') || 'none'}`,
      );
    }
  }
}

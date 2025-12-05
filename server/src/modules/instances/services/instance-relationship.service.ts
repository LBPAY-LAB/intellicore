import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstanceRelationshipEntity } from '../entities/instance-relationship.entity';
import { InstanceEntity } from '../entities/instance.entity';
import { ObjectRelationshipEntity, Cardinality } from '../../relationships/entities/object-relationship.entity';
import { CreateInstanceRelationshipInput } from '../dto/create-instance-relationship.input';

@Injectable()
export class InstanceRelationshipService {
  private readonly logger = new Logger(InstanceRelationshipService.name);

  constructor(
    @InjectRepository(InstanceRelationshipEntity)
    private readonly instanceRelationshipRepository: Repository<InstanceRelationshipEntity>,
    @InjectRepository(InstanceEntity)
    private readonly instanceRepository: Repository<InstanceEntity>,
    @InjectRepository(ObjectRelationshipEntity)
    private readonly objectRelationshipRepository: Repository<ObjectRelationshipEntity>,
  ) {}

  /**
   * Create a relationship between two instances
   */
  async create(
    input: CreateInstanceRelationshipInput,
    userId?: string,
  ): Promise<InstanceRelationshipEntity> {
    // Validate source instance exists
    const sourceInstance = await this.instanceRepository.findOne({
      where: { id: input.sourceInstanceId },
    });

    if (!sourceInstance) {
      throw new NotFoundException(`Source instance with ID "${input.sourceInstanceId}" not found`);
    }

    // Validate target instance exists
    const targetInstance = await this.instanceRepository.findOne({
      where: { id: input.targetInstanceId },
    });

    if (!targetInstance) {
      throw new NotFoundException(`Target instance with ID "${input.targetInstanceId}" not found`);
    }

    // Validate object relationship exists
    const objectRelationship = await this.objectRelationshipRepository.findOne({
      where: { id: input.objectRelationshipId },
    });

    if (!objectRelationship) {
      throw new NotFoundException(
        `Object relationship with ID "${input.objectRelationshipId}" not found`,
      );
    }

    // Validate that instances match the ObjectTypes defined in the object relationship
    if (sourceInstance.objectTypeId !== objectRelationship.source_id) {
      throw new BadRequestException(
        `Source instance's ObjectType does not match the relationship's source ObjectType`,
      );
    }

    if (targetInstance.objectTypeId !== objectRelationship.target_id) {
      throw new BadRequestException(
        `Target instance's ObjectType does not match the relationship's target ObjectType`,
      );
    }

    // Check for duplicate relationships
    const existing = await this.instanceRelationshipRepository.findOne({
      where: {
        sourceInstanceId: input.sourceInstanceId,
        targetInstanceId: input.targetInstanceId,
        objectRelationshipId: input.objectRelationshipId,
      },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('This instance relationship already exists');
    }

    // Validate cardinality constraints
    await this.validateCardinality(
      input.sourceInstanceId,
      input.targetInstanceId,
      input.objectRelationshipId,
      objectRelationship.cardinality,
    );

    try {
      const instanceRelationship = this.instanceRelationshipRepository.create({
        sourceInstanceId: input.sourceInstanceId,
        targetInstanceId: input.targetInstanceId,
        objectRelationshipId: input.objectRelationshipId,
        metadata: input.metadata,
        createdBy: userId,
      });

      const saved = await this.instanceRelationshipRepository.save(instanceRelationship);
      this.logger.log(
        `Created instance relationship: ${saved.id} (${input.sourceInstanceId} -> ${input.targetInstanceId})`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create instance relationship: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create instance relationship');
    }
  }

  /**
   * Find all relationships for an instance
   */
  async findByInstance(
    instanceId: string,
    direction: 'outgoing' | 'incoming' | 'all' = 'all',
  ): Promise<InstanceRelationshipEntity[]> {
    const queryBuilder = this.instanceRelationshipRepository
      .createQueryBuilder('rel')
      .leftJoinAndSelect('rel.sourceInstance', 'sourceInstance')
      .leftJoinAndSelect('rel.targetInstance', 'targetInstance')
      .leftJoinAndSelect('rel.objectRelationship', 'objectRelationship');

    if (direction === 'outgoing') {
      queryBuilder.where('rel.sourceInstanceId = :instanceId', { instanceId });
    } else if (direction === 'incoming') {
      queryBuilder.where('rel.targetInstanceId = :instanceId', { instanceId });
    } else {
      queryBuilder.where(
        '(rel.sourceInstanceId = :instanceId OR rel.targetInstanceId = :instanceId)',
        { instanceId },
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find a single instance relationship by ID
   */
  async findOne(id: string): Promise<InstanceRelationshipEntity> {
    const relationship = await this.instanceRelationshipRepository.findOne({
      where: { id },
      relations: ['sourceInstance', 'targetInstance', 'objectRelationship'],
    });

    if (!relationship) {
      throw new NotFoundException(`Instance relationship with ID "${id}" not found`);
    }

    return relationship;
  }

  /**
   * Delete an instance relationship
   */
  async delete(id: string): Promise<boolean> {
    const relationship = await this.findOne(id);

    await this.instanceRelationshipRepository.softDelete(id);
    this.logger.log(`Soft deleted instance relationship: ${id}`);
    return true;
  }

  /**
   * Get related instances for a given instance
   */
  async getRelatedInstances(
    instanceId: string,
    objectRelationshipId?: string,
  ): Promise<InstanceEntity[]> {
    const queryBuilder = this.instanceRelationshipRepository
      .createQueryBuilder('rel')
      .leftJoinAndSelect('rel.targetInstance', 'targetInstance')
      .where('rel.sourceInstanceId = :instanceId', { instanceId });

    if (objectRelationshipId) {
      queryBuilder.andWhere('rel.objectRelationshipId = :objectRelationshipId', {
        objectRelationshipId,
      });
    }

    const relationships = await queryBuilder.getMany();
    return relationships.map((rel) => rel.targetInstance);
  }

  /**
   * Validate cardinality constraints
   */
  private async validateCardinality(
    sourceInstanceId: string,
    targetInstanceId: string,
    objectRelationshipId: string,
    cardinality: Cardinality,
  ): Promise<void> {
    switch (cardinality) {
      case Cardinality.ONE_TO_ONE:
        // Check if source already has a relationship
        const sourceRelCount = await this.instanceRelationshipRepository.count({
          where: {
            sourceInstanceId,
            objectRelationshipId,
          },
        });
        if (sourceRelCount > 0) {
          throw new BadRequestException(
            'Source instance already has a relationship of this type (ONE_TO_ONE constraint)',
          );
        }

        // Check if target is already referenced
        const targetRelCount = await this.instanceRelationshipRepository.count({
          where: {
            targetInstanceId,
            objectRelationshipId,
          },
        });
        if (targetRelCount > 0) {
          throw new BadRequestException(
            'Target instance is already referenced (ONE_TO_ONE constraint)',
          );
        }
        break;

      case Cardinality.ONE_TO_MANY:
        // Check if target is already referenced (in ONE_TO_MANY, target can only have one incoming)
        const oneToManyCount = await this.instanceRelationshipRepository.count({
          where: {
            targetInstanceId,
            objectRelationshipId,
          },
        });
        if (oneToManyCount > 0) {
          throw new BadRequestException(
            'Target instance is already referenced (ONE_TO_MANY constraint)',
          );
        }
        break;

      case Cardinality.MANY_TO_MANY:
        // No additional constraints for MANY_TO_MANY
        break;
    }
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldEntity, FieldType } from './entities/field.entity';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';

@Injectable()
export class FieldsService {
  private readonly logger = new Logger(FieldsService.name);

  constructor(
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
  ) {}

  /**
   * Create a new Field with validation
   * @param input CreateFieldInput
   * @returns Created Field entity
   * @throws ConflictException if field name already exists for the ObjectType
   * @throws BadRequestException if validation rules are invalid
   */
  async create(input: CreateFieldInput): Promise<FieldEntity> {
    // Check if field name already exists for this ObjectType
    const existing = await this.fieldRepository.findOne({
      where: {
        object_type_id: input.object_type_id,
        name: input.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Field with name "${input.name}" already exists for this ObjectType`,
      );
    }

    // Validate validation_rules if provided
    if (input.validation_rules) {
      this.validateValidationRules(input.field_type, input.validation_rules);
    }

    try {
      const field = this.fieldRepository.create(input);
      const saved = await this.fieldRepository.save(field);
      this.logger.log(
        `Created Field: ${saved.id} - ${saved.name} (${saved.field_type})`,
      );
      return saved;
    } catch (error) {
      this.logger.error(
        `Failed to create Field: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to create Field');
    }
  }

  async findAll(): Promise<FieldEntity[]> {
    return await this.fieldRepository.find({
      relations: ['objectType'],
    });
  }

  async findByObjectType(objectTypeId: string): Promise<FieldEntity[]> {
    return await this.fieldRepository.find({
      where: { object_type_id: objectTypeId },
      relations: ['objectType'],
    });
  }

  async findOne(id: string): Promise<FieldEntity> {
    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: ['objectType'],
    });

    if (!field) {
      throw new NotFoundException(`Field with ID "${id}" not found`);
    }

    return field;
  }

  /**
   * Update an existing Field with validation
   * @param input UpdateFieldInput
   * @returns Updated Field entity
   * @throws NotFoundException if field not found
   * @throws ConflictException if name conflicts with another field
   */
  async update(input: UpdateFieldInput): Promise<FieldEntity> {
    const field = await this.findOne(input.id);

    // Check name uniqueness if name is being updated
    if (input.name && input.name !== field.name) {
      const existing = await this.fieldRepository.findOne({
        where: {
          object_type_id: field.object_type_id,
          name: input.name,
        },
      });

      if (existing && existing.id !== field.id) {
        throw new ConflictException(
          `Field with name "${input.name}" already exists for this ObjectType`,
        );
      }
    }

    // Validate validation_rules if being updated
    if (input.validation_rules) {
      const fieldType = input.field_type || field.field_type;
      this.validateValidationRules(fieldType, input.validation_rules);
    }

    try {
      Object.assign(field, input);
      const updated = await this.fieldRepository.save(field);
      this.logger.log(`Updated Field: ${updated.id} - ${updated.name}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update Field ${input.id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update Field');
    }
  }

  /**
   * Delete a Field
   * @param id Field UUID
   * @returns True if deleted successfully
   * @throws NotFoundException if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      const field = await this.findOne(id);
      await this.fieldRepository.remove(field);
      this.logger.log(`Deleted Field: ${id} - ${field.name}`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete Field ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete Field');
    }
  }

  /**
   * Validate validation_rules structure based on field type
   * @param fieldType FieldType
   * @param rules Validation rules object
   * @throws BadRequestException if rules are invalid
   */
  private validateValidationRules(
    fieldType: FieldType,
    rules: Record<string, any>,
  ): void {
    if (!rules || typeof rules !== 'object') {
      throw new BadRequestException('validation_rules must be an object');
    }

    switch (fieldType) {
      case FieldType.STRING:
        this.validateStringRules(rules);
        break;
      case FieldType.NUMBER:
        this.validateNumberRules(rules);
        break;
      case FieldType.ENUM:
        this.validateEnumRules(rules);
        break;
      case FieldType.RELATION:
        this.validateRelationRules(rules);
        break;
      // BOOLEAN and DATE types have minimal validation rules
    }
  }

  private validateStringRules(rules: Record<string, any>): void {
    if (rules.minLength !== undefined && typeof rules.minLength !== 'number') {
      throw new BadRequestException('minLength must be a number');
    }
    if (rules.maxLength !== undefined && typeof rules.maxLength !== 'number') {
      throw new BadRequestException('maxLength must be a number');
    }
    if (rules.pattern !== undefined) {
      try {
        new RegExp(rules.pattern);
      } catch (e) {
        throw new BadRequestException('pattern must be a valid regular expression');
      }
    }
  }

  private validateNumberRules(rules: Record<string, any>): void {
    if (rules.min !== undefined && typeof rules.min !== 'number') {
      throw new BadRequestException('min must be a number');
    }
    if (rules.max !== undefined && typeof rules.max !== 'number') {
      throw new BadRequestException('max must be a number');
    }
    if (rules.min !== undefined && rules.max !== undefined && rules.min > rules.max) {
      throw new BadRequestException('min cannot be greater than max');
    }
  }

  private validateEnumRules(rules: Record<string, any>): void {
    if (!rules.allowedValues || !Array.isArray(rules.allowedValues)) {
      throw new BadRequestException(
        'ENUM fields must have allowedValues array in validation_rules',
      );
    }
    if (rules.allowedValues.length === 0) {
      throw new BadRequestException('allowedValues cannot be empty');
    }
  }

  private validateRelationRules(rules: Record<string, any>): void {
    if (!rules.targetObjectTypeId || typeof rules.targetObjectTypeId !== 'string') {
      throw new BadRequestException(
        'RELATION fields must have targetObjectTypeId in validation_rules',
      );
    }
  }
}

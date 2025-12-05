import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';
import { FieldEntity, FieldType } from '../../fields/entities/field.entity';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

@Injectable()
export class InstanceValidationService {
  private readonly logger = new Logger(InstanceValidationService.name);

  constructor(
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
  ) {}

  /**
   * Validates instance data against the ObjectType's field definitions
   */
  async validateInstanceData(
    objectTypeId: string,
    data: Record<string, any>,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Load the ObjectType with its fields
    const objectType = await this.objectTypeRepository.findOne({
      where: { id: objectTypeId },
      relations: ['fields'],
    });

    if (!objectType) {
      errors.push({
        field: 'objectTypeId',
        message: `ObjectType with ID ${objectTypeId} not found`,
        code: 'OBJECT_TYPE_NOT_FOUND',
      });
      return { isValid: false, errors, warnings };
    }

    if (!objectType.is_active) {
      errors.push({
        field: 'objectTypeId',
        message: `ObjectType "${objectType.name}" is not active`,
        code: 'OBJECT_TYPE_INACTIVE',
      });
      return { isValid: false, errors, warnings };
    }

    const fields = objectType.fields || [];
    const fieldMap = new Map<string, FieldEntity>();
    fields.forEach((field) => fieldMap.set(field.name, field));

    // Check for required fields
    for (const field of fields) {
      if (field.is_required && (data[field.name] === undefined || data[field.name] === null)) {
        errors.push({
          field: field.name,
          message: `Field "${field.name}" is required`,
          code: 'REQUIRED_FIELD_MISSING',
        });
      }
    }

    // Validate each field in data
    for (const [fieldName, value] of Object.entries(data)) {
      const fieldDef = fieldMap.get(fieldName);

      if (!fieldDef) {
        warnings.push({
          field: fieldName,
          message: `Field "${fieldName}" is not defined in ObjectType "${objectType.name}"`,
          code: 'UNKNOWN_FIELD',
          value,
        });
        continue;
      }

      // Skip null/undefined values for optional fields
      if (value === null || value === undefined) {
        continue;
      }

      // Validate field type
      const typeValidation = this.validateFieldType(fieldName, value, fieldDef.field_type);
      if (!typeValidation.isValid) {
        errors.push(...typeValidation.errors);
      }

      // Validate against custom validation rules
      if (fieldDef.validation_rules) {
        const ruleValidation = this.validateFieldRules(fieldName, value, fieldDef.validation_rules);
        if (!ruleValidation.isValid) {
          errors.push(...ruleValidation.errors);
        }
        warnings.push(...ruleValidation.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a value against the expected field type
   */
  private validateFieldType(
    fieldName: string,
    value: any,
    fieldType: FieldType,
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    switch (fieldType) {
      case FieldType.STRING:
        if (typeof value !== 'string') {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" must be a string`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;

      case FieldType.NUMBER:
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" must be a number`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;

      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" must be a boolean`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;

      case FieldType.DATE:
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" must be a valid date`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;

      case FieldType.ENUM:
        // ENUM validation requires allowed values from validation_rules
        if (typeof value !== 'string') {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" (ENUM) must be a string`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;

      case FieldType.RELATION:
        // RELATION fields should contain UUIDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (typeof value !== 'string' || !uuidRegex.test(value)) {
          errors.push({
            field: fieldName,
            message: `Field "${fieldName}" must be a valid UUID reference`,
            code: 'INVALID_TYPE',
            value,
          });
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates a value against custom validation rules
   */
  private validateFieldRules(
    fieldName: string,
    value: any,
    rules: any,
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!rules || typeof rules !== 'object') {
      return { isValid: true, errors, warnings };
    }

    // Min length validation
    if (rules.minLength !== undefined && typeof value === 'string') {
      if (value.length < rules.minLength) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be at least ${rules.minLength} characters`,
          code: 'MIN_LENGTH',
          value,
        });
      }
    }

    // Max length validation
    if (rules.maxLength !== undefined && typeof value === 'string') {
      if (value.length > rules.maxLength) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be at most ${rules.maxLength} characters`,
          code: 'MAX_LENGTH',
          value,
        });
      }
    }

    // Min value validation (for numbers)
    if (rules.min !== undefined && typeof value === 'number') {
      if (value < rules.min) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be at least ${rules.min}`,
          code: 'MIN_VALUE',
          value,
        });
      }
    }

    // Max value validation (for numbers)
    if (rules.max !== undefined && typeof value === 'number') {
      if (value > rules.max) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be at most ${rules.max}`,
          code: 'MAX_VALUE',
          value,
        });
      }
    }

    // Regex pattern validation
    if (rules.pattern !== undefined && typeof value === 'string') {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: fieldName,
            message: rules.patternMessage || `Field "${fieldName}" does not match the required pattern`,
            code: 'PATTERN_MISMATCH',
            value,
          });
        }
      } catch (e) {
        warnings.push({
          field: fieldName,
          message: `Invalid regex pattern in validation rules for "${fieldName}"`,
          code: 'INVALID_PATTERN',
        });
      }
    }

    // Enum values validation
    if (rules.allowedValues !== undefined && Array.isArray(rules.allowedValues)) {
      if (!rules.allowedValues.includes(value)) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be one of: ${rules.allowedValues.join(', ')}`,
          code: 'INVALID_ENUM_VALUE',
          value,
        });
      }
    }

    // Email validation
    if (rules.isEmail === true && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be a valid email address`,
          code: 'INVALID_EMAIL',
          value,
        });
      }
    }

    // CPF validation (Brazilian Tax ID)
    if (rules.isCpf === true && typeof value === 'string') {
      if (!this.validateCpf(value)) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be a valid CPF`,
          code: 'INVALID_CPF',
          value,
        });
      }
    }

    // CNPJ validation (Brazilian Company ID)
    if (rules.isCnpj === true && typeof value === 'string') {
      if (!this.validateCnpj(value)) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" must be a valid CNPJ`,
          code: 'INVALID_CNPJ',
          value,
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates a Brazilian CPF
   */
  private validateCpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(9)) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(10)) !== digit) return false;

    return true;
  }

  /**
   * Validates a Brazilian CNPJ
   */
  private validateCnpj(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(12)) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(13)) !== digit) return false;

    return true;
  }
}

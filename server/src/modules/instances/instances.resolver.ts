import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { InstancesService } from './instances.service';
import { InstanceEntity, InstanceStatus } from './entities/instance.entity';
import { CreateInstanceInput } from './dto/create-instance.input';
import { UpdateInstanceInput } from './dto/update-instance.input';
import { InstancePaginationArgs } from './dto/instance-pagination.args';
import { PaginatedInstancesResponse } from './dto/paginated-instances.response';
import { Auth } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { ValidationResult, ValidationError } from './services/instance-validation.service';
import GraphQLJSON from 'graphql-type-json';

/**
 * GraphQL type for validation errors
 */
@ObjectType()
class ValidationErrorType {
  @Field()
  field: string;

  @Field()
  message: string;

  @Field()
  code: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value?: any;
}

/**
 * GraphQL type for validation result
 */
@ObjectType()
class ValidationResultType {
  @Field()
  isValid: boolean;

  @Field(() => [ValidationErrorType])
  errors: ValidationErrorType[];

  @Field(() => [ValidationErrorType])
  warnings: ValidationErrorType[];
}

/**
 * GraphQL Resolver for Instance CRUD operations
 */
@Resolver(() => InstanceEntity)
export class InstancesResolver {
  constructor(private readonly instancesService: InstancesService) {}

  /**
   * Query all Instances with cursor-based pagination and filtering
   */
  @Public()
  @Query(() => PaginatedInstancesResponse, {
    name: 'instances',
    description: 'Retrieve paginated list of Instances',
  })
  async findAll(
    @Args() paginationArgs: InstancePaginationArgs,
  ): Promise<PaginatedInstancesResponse> {
    return await this.instancesService.findAll(paginationArgs);
  }

  /**
   * Query Instances by ObjectType ID
   */
  @Public()
  @Query(() => PaginatedInstancesResponse, {
    name: 'instancesByObjectType',
    description: 'Retrieve Instances for a specific ObjectType',
  })
  async findByObjectType(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
    @Args() paginationArgs: InstancePaginationArgs,
  ): Promise<PaginatedInstancesResponse> {
    return await this.instancesService.findByObjectType(objectTypeId, paginationArgs);
  }

  /**
   * Query a single Instance by ID
   */
  @Public()
  @Query(() => InstanceEntity, {
    name: 'instance',
    description: 'Retrieve a single Instance by ID',
  })
  async findOne(
    @Args('id', { type: () => ID, description: 'Instance UUID' }) id: string,
  ): Promise<InstanceEntity> {
    return await this.instancesService.findOne(id);
  }

  /**
   * Validate instance data without creating
   */
  @Public()
  @Query(() => ValidationResultType, {
    name: 'validateInstanceData',
    description: 'Validate instance data against ObjectType schema without creating',
  })
  async validateData(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
    @Args('data', { type: () => GraphQLJSON }) data: Record<string, any>,
  ): Promise<ValidationResult> {
    return await this.instancesService.validateData(objectTypeId, data);
  }

  /**
   * Create a new Instance
   */
  @Auth('admin', 'backoffice')
  @Mutation(() => InstanceEntity, {
    description: 'Create a new Instance (requires admin or backoffice role)',
  })
  async createInstance(
    @Args('input', { description: 'Instance creation input' }) input: CreateInstanceInput,
    @CurrentUser() user?: { sub: string },
  ): Promise<InstanceEntity> {
    return await this.instancesService.create(input, user?.sub);
  }

  /**
   * Update an existing Instance
   */
  @Auth('admin', 'backoffice')
  @Mutation(() => InstanceEntity, {
    description: 'Update an existing Instance (requires admin or backoffice role)',
  })
  async updateInstance(
    @Args('input', { description: 'Instance update input' }) input: UpdateInstanceInput,
    @CurrentUser() user?: { sub: string },
  ): Promise<InstanceEntity> {
    return await this.instancesService.update(input, user?.sub);
  }

  /**
   * Change Instance status
   */
  @Auth('admin', 'backoffice')
  @Mutation(() => InstanceEntity, {
    description: 'Change Instance status (requires admin or backoffice role)',
  })
  async changeInstanceStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => InstanceStatus }) status: InstanceStatus,
    @CurrentUser() user?: { sub: string },
  ): Promise<InstanceEntity> {
    return await this.instancesService.changeStatus(id, status, user?.sub);
  }

  /**
   * Soft delete an Instance
   */
  @Auth('admin')
  @Mutation(() => Boolean, {
    description: 'Soft delete an Instance (requires admin role)',
  })
  async deleteInstance(
    @Args('id', { type: () => ID, description: 'Instance UUID to delete' }) id: string,
  ): Promise<boolean> {
    return await this.instancesService.delete(id);
  }

  /**
   * Restore a soft-deleted Instance
   */
  @Auth('admin')
  @Mutation(() => InstanceEntity, {
    description: 'Restore a soft-deleted Instance (requires admin role)',
  })
  async restoreInstance(
    @Args('id', { type: () => ID, description: 'Instance UUID to restore' }) id: string,
  ): Promise<InstanceEntity> {
    return await this.instancesService.restore(id);
  }

  /**
   * Field resolver for ObjectType
   */
  @ResolveField('objectType', () => ObjectTypeEntity)
  async resolveObjectType(@Parent() instance: InstanceEntity): Promise<ObjectTypeEntity> {
    if (instance.objectType) {
      return instance.objectType;
    }
    // Lazy load if not already loaded
    const fullInstance = await this.instancesService.findOne(instance.id);
    return fullInstance.objectType;
  }
}

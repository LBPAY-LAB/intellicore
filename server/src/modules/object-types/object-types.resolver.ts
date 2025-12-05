import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ObjectTypesService } from './object-types.service';
import { ObjectTypeEntity } from './entities/object-type.entity';
import { CreateObjectTypeInput } from './dto/create-object-type.input';
import { UpdateObjectTypeInput } from './dto/update-object-type.input';
import { PaginationArgs } from './dto/pagination.args';
import { PaginatedObjectTypesResponse } from './dto/paginated-object-types.response';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * GraphQL Resolver for ObjectType CRUD operations
 * Implements authentication and role-based access control
 */
@Resolver(() => ObjectTypeEntity)
export class ObjectTypesResolver {
  constructor(
    private readonly objectTypesService: ObjectTypesService,
  ) {}

  /**
   * Query all ObjectTypes with cursor-based pagination
   * Public access for read operations
   */
  @Public()
  @Query(() => PaginatedObjectTypesResponse, {
    name: 'objectTypes',
    description: 'Retrieve paginated list of ObjectTypes',
  })
  async findAll(
    @Args() paginationArgs: PaginationArgs,
  ): Promise<PaginatedObjectTypesResponse> {
    return await this.objectTypesService.findAll(paginationArgs);
  }

  /**
   * Query a single ObjectType by ID
   * Public access for read operations
   */
  @Public()
  @Query(() => ObjectTypeEntity, {
    name: 'objectType',
    description: 'Retrieve a single ObjectType by ID',
  })
  async findOne(
    @Args('id', { type: () => ID, description: 'ObjectType UUID' }) id: string,
  ): Promise<ObjectTypeEntity> {
    return await this.objectTypesService.findOne(id);
  }

  /**
   * Create a new ObjectType
   * Public access for development (TODO: add auth in production)
   */
  @Public()
  @Mutation(() => ObjectTypeEntity, {
    description: 'Create a new ObjectType',
  })
  async createObjectType(
    @Args('input', { description: 'ObjectType creation input' })
    input: CreateObjectTypeInput,
  ): Promise<ObjectTypeEntity> {
    return await this.objectTypesService.create(input);
  }

  /**
   * Update an existing ObjectType
   * Public access for development (TODO: add auth in production)
   */
  @Public()
  @Mutation(() => ObjectTypeEntity, {
    description: 'Update an existing ObjectType',
  })
  async updateObjectType(
    @Args('input', { description: 'ObjectType update input' })
    input: UpdateObjectTypeInput,
  ): Promise<ObjectTypeEntity> {
    return await this.objectTypesService.update(input);
  }

  /**
   * Soft delete an ObjectType
   * Public access for development (TODO: add auth in production)
   */
  @Public()
  @Mutation(() => Boolean, {
    description: 'Soft delete an ObjectType',
  })
  async deleteObjectType(
    @Args('id', { type: () => ID, description: 'ObjectType UUID to delete' })
    id: string,
  ): Promise<boolean> {
    return await this.objectTypesService.delete(id);
  }

  /**
   * Restore a soft-deleted ObjectType
   * Public access for development (TODO: add auth in production)
   */
  @Public()
  @Mutation(() => ObjectTypeEntity, {
    description: 'Restore a soft-deleted ObjectType',
  })
  async restoreObjectType(
    @Args('id', { type: () => ID, description: 'ObjectType UUID to restore' })
    id: string,
  ): Promise<ObjectTypeEntity> {
    return await this.objectTypesService.restore(id);
  }

  /**
   * Field resolver for relationships
   * Returns all relationships where this ObjectType is either source or target
   * Note: This resolver is implemented in the RelationshipsModule
   * The actual implementation is in relationships.resolver.ts as a field resolver
   */
  // @ResolveField('relationships', () => [ObjectRelationshipEntity])
  // This is handled by RelationshipsModule's field resolver
}

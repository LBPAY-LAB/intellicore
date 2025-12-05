import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectRelationshipEntity } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { RelationshipsService } from './relationships.service';
import { GraphTraversalService, PathInfo, CircularReferenceInfo } from './graph-traversal.service';
import { CreateRelationshipInput } from './dto/create-relationship.input';
import { UpdateRelationshipInput } from './dto/update-relationship.input';
import { PaginationArgs } from './dto/pagination.args';
import { PaginatedRelationshipsResponse } from './dto/paginated-relationships.response';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * GraphQL resolver for ObjectRelationship operations
 * All operations require authentication and appropriate roles
 */
@Resolver(() => ObjectRelationshipEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class RelationshipsResolver {
  constructor(
    private readonly relationshipsService: RelationshipsService,
    private readonly graphTraversalService: GraphTraversalService,
  ) {}

  /**
   * Query: Get paginated list of relationships
   * Requires: authenticated user with admin or viewer role
   */
  @Query(() => PaginatedRelationshipsResponse, { name: 'relationships' })
  @Roles('admin', 'viewer')
  async getRelationships(
    @Args() paginationArgs: PaginationArgs,
    @CurrentUser() user: any,
  ): Promise<PaginatedRelationshipsResponse> {
    return this.relationshipsService.findAll(paginationArgs);
  }

  /**
   * Query: Get a single relationship by ID
   * Requires: authenticated user with admin or viewer role
   */
  @Query(() => ObjectRelationshipEntity, { name: 'relationship' })
  @Roles('admin', 'viewer')
  async getRelationship(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<ObjectRelationshipEntity> {
    return this.relationshipsService.findOne(id);
  }

  /**
   * Query: Get all relationships for a specific ObjectType
   * Requires: authenticated user with admin or viewer role
   */
  @Query(() => [ObjectRelationshipEntity], { name: 'relationshipsByObjectType' })
  @Roles('admin', 'viewer')
  async getRelationshipsByObjectType(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
    @CurrentUser() user: any,
  ): Promise<ObjectRelationshipEntity[]> {
    return this.relationshipsService.findByObjectType(objectTypeId);
  }

  /**
   * Mutation: Create a new relationship
   * Requires: admin role
   */
  @Mutation(() => ObjectRelationshipEntity)
  @Roles('admin')
  async createRelationship(
    @Args('input') input: CreateRelationshipInput,
    @CurrentUser() user: any,
  ): Promise<ObjectRelationshipEntity> {
    return this.relationshipsService.create(input);
  }

  /**
   * Mutation: Update an existing relationship
   * Requires: admin role
   */
  @Mutation(() => ObjectRelationshipEntity)
  @Roles('admin')
  async updateRelationship(
    @Args('input') input: UpdateRelationshipInput,
    @CurrentUser() user: any,
  ): Promise<ObjectRelationshipEntity> {
    return this.relationshipsService.update(input);
  }

  /**
   * Mutation: Delete a relationship (soft delete)
   * Requires: admin role
   */
  @Mutation(() => Boolean)
  @Roles('admin')
  async deleteRelationship(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.relationshipsService.delete(id);
  }

  /**
   * Field resolver: Resolve source ObjectType
   */
  @ResolveField('source', () => ObjectTypeEntity)
  async resolveSource(@Parent() relationship: ObjectRelationshipEntity): Promise<ObjectTypeEntity> {
    // If already loaded, return it
    if (relationship.source) {
      return relationship.source;
    }
    // This shouldn't happen due to eager loading in service, but as a fallback
    return relationship.source;
  }

  /**
   * Field resolver: Resolve target ObjectType
   */
  @ResolveField('target', () => ObjectTypeEntity)
  async resolveTarget(@Parent() relationship: ObjectRelationshipEntity): Promise<ObjectTypeEntity> {
    // If already loaded, return it
    if (relationship.target) {
      return relationship.target;
    }
    // This shouldn't happen due to eager loading in service, but as a fallback
    return relationship.target;
  }
}

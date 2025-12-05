import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  registerEnumType,
} from '@nestjs/graphql';
import { InstanceRelationshipService } from './services/instance-relationship.service';
import { InstanceRelationshipEntity } from './entities/instance-relationship.entity';
import { InstanceEntity } from './entities/instance.entity';
import { CreateInstanceRelationshipInput } from './dto/create-instance-relationship.input';
import { Auth } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

enum RelationshipDirection {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
  ALL = 'all',
}

registerEnumType(RelationshipDirection, {
  name: 'RelationshipDirection',
  description: 'Direction of relationship to query',
});

/**
 * GraphQL Resolver for Instance Relationship operations
 */
@Resolver(() => InstanceRelationshipEntity)
export class InstanceRelationshipsResolver {
  constructor(
    private readonly instanceRelationshipService: InstanceRelationshipService,
  ) {}

  /**
   * Query relationships for a specific instance
   */
  @Public()
  @Query(() => [InstanceRelationshipEntity], {
    name: 'instanceRelationships',
    description: 'Get relationships for an instance',
  })
  async findByInstance(
    @Args('instanceId', { type: () => ID }) instanceId: string,
    @Args('direction', { type: () => RelationshipDirection, nullable: true, defaultValue: 'all' })
    direction: RelationshipDirection,
  ): Promise<InstanceRelationshipEntity[]> {
    return await this.instanceRelationshipService.findByInstance(
      instanceId,
      direction as 'outgoing' | 'incoming' | 'all',
    );
  }

  /**
   * Query a single instance relationship by ID
   */
  @Public()
  @Query(() => InstanceRelationshipEntity, {
    name: 'instanceRelationship',
    description: 'Get a single instance relationship by ID',
  })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InstanceRelationshipEntity> {
    return await this.instanceRelationshipService.findOne(id);
  }

  /**
   * Get related instances for a given instance
   */
  @Public()
  @Query(() => [InstanceEntity], {
    name: 'relatedInstances',
    description: 'Get instances related to a given instance',
  })
  async getRelatedInstances(
    @Args('instanceId', { type: () => ID }) instanceId: string,
    @Args('objectRelationshipId', { type: () => ID, nullable: true })
    objectRelationshipId?: string,
  ): Promise<InstanceEntity[]> {
    return await this.instanceRelationshipService.getRelatedInstances(
      instanceId,
      objectRelationshipId,
    );
  }

  /**
   * Create a relationship between two instances
   */
  @Auth('admin', 'backoffice')
  @Mutation(() => InstanceRelationshipEntity, {
    description: 'Create a relationship between two instances',
  })
  async createInstanceRelationship(
    @Args('input') input: CreateInstanceRelationshipInput,
    @CurrentUser() user?: { sub: string },
  ): Promise<InstanceRelationshipEntity> {
    return await this.instanceRelationshipService.create(input, user?.sub);
  }

  /**
   * Delete an instance relationship
   */
  @Auth('admin')
  @Mutation(() => Boolean, {
    description: 'Delete an instance relationship',
  })
  async deleteInstanceRelationship(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return await this.instanceRelationshipService.delete(id);
  }
}

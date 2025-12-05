import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { ObjectRelationshipEntity } from './entities/object-relationship.entity';
import { RelationshipsService } from './relationships.service';

/**
 * Field resolver for ObjectType.relationships
 * This resolver is separate to avoid circular dependencies
 */
@Resolver(() => ObjectTypeEntity)
export class ObjectTypeRelationshipsResolver {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  /**
   * Field resolver: Get all relationships for an ObjectType
   * Returns relationships where ObjectType is either source or target
   */
  @ResolveField('relationships', () => [ObjectRelationshipEntity], { nullable: true })
  async relationships(@Parent() objectType: ObjectTypeEntity): Promise<ObjectRelationshipEntity[]> {
    try {
      return await this.relationshipsService.findByObjectType(objectType.id);
    } catch (error) {
      // Return empty array if there's an error (e.g., during initial load)
      return [];
    }
  }
}

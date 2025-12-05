import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectRelationshipEntity } from './entities/object-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { RelationshipsService } from './relationships.service';
import { GraphTraversalService } from './graph-traversal.service';
import { RelationshipsResolver } from './relationships.resolver';
import { GraphTraversalResolver } from './graph-traversal.resolver';
import { ObjectTypeRelationshipsResolver } from './object-type-relationships.resolver';

/**
 * RelationshipsModule
 * Provides relationship management and graph traversal capabilities
 *
 * Features:
 * - CRUD operations for ObjectType relationships
 * - Graph traversal algorithms (BFS, DFS)
 * - Ancestor and descendant queries
 * - Shortest path finding
 * - Circular reference detection
 * - Comprehensive validation and cardinality constraints
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectRelationshipEntity, ObjectTypeEntity]),
  ],
  providers: [
    RelationshipsService,
    GraphTraversalService,
    RelationshipsResolver,
    GraphTraversalResolver,
    ObjectTypeRelationshipsResolver,
  ],
  exports: [
    RelationshipsService,
    GraphTraversalService,
  ],
})
export class RelationshipsModule {}

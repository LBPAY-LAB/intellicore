import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceEntity } from './entities/instance.entity';
import { InstanceRelationshipEntity } from './entities/instance-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { ObjectRelationshipEntity } from '../relationships/entities/object-relationship.entity';
import { FieldEntity } from '../fields/entities/field.entity';
import { InstancesService } from './instances.service';
import { InstanceValidationService } from './services/instance-validation.service';
import { InstanceRelationshipService } from './services/instance-relationship.service';
import { InstancesResolver } from './instances.resolver';
import { InstanceRelationshipsResolver } from './instance-relationships.resolver';

/**
 * InstancesModule
 * Provides instance management capabilities for the meta-modeling platform
 *
 * Features:
 * - CRUD operations for Instances (data records based on ObjectTypes)
 * - Dynamic schema validation against ObjectType field definitions
 * - Instance relationship management
 * - Status lifecycle (DRAFT → ACTIVE → INACTIVE → ARCHIVED)
 * - Cursor-based pagination with filtering
 * - Soft delete with restore capability
 * - Transaction support for atomic operations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstanceEntity,
      InstanceRelationshipEntity,
      ObjectTypeEntity,
      ObjectRelationshipEntity,
      FieldEntity,
    ]),
  ],
  providers: [
    InstancesService,
    InstanceValidationService,
    InstanceRelationshipService,
    InstancesResolver,
    InstanceRelationshipsResolver,
  ],
  exports: [
    InstancesService,
    InstanceValidationService,
    InstanceRelationshipService,
  ],
})
export class InstancesModule {}

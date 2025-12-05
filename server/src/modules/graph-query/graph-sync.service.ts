import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { NebulaService } from './nebula.service';
import { InstanceEntity } from '../instances/entities/instance.entity';
import { InstanceRelationshipEntity } from '../instances/entities/instance-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';

interface InstanceEvent {
  instanceId: string;
  action: 'created' | 'updated' | 'deleted';
}

interface RelationshipEvent {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  action: 'created' | 'deleted';
}

@Injectable()
export class GraphSyncService implements OnModuleInit {
  private readonly logger = new Logger(GraphSyncService.name);
  private syncEnabled = false;

  constructor(
    private readonly nebulaService: NebulaService,
    @InjectRepository(InstanceEntity)
    private readonly instanceRepo: Repository<InstanceEntity>,
    @InjectRepository(InstanceRelationshipEntity)
    private readonly relationshipRepo: Repository<InstanceRelationshipEntity>,
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepo: Repository<ObjectTypeEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    // Check if sync should be enabled
    const isHealthy = this.nebulaService.isHealthy();
    if (isHealthy) {
      this.syncEnabled = true;
      this.logger.log('Graph sync enabled - NebulaGraph is available');
    } else {
      this.logger.warn('Graph sync disabled - NebulaGraph not available');
    }
  }

  @OnEvent('instance.created')
  async handleInstanceCreated(event: InstanceEvent): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      const instance = await this.instanceRepo.findOne({
        where: { id: event.instanceId },
        relations: ['objectType'],
      });

      if (!instance) {
        this.logger.warn(`Instance ${event.instanceId} not found for sync`);
        return;
      }

      await this.syncInstanceToGraph(instance);
      this.logger.debug(`Instance ${event.instanceId} synced to graph`);
    } catch (error) {
      this.logger.error(`Failed to sync instance ${event.instanceId}: ${error.message}`);
    }
  }

  @OnEvent('instance.updated')
  async handleInstanceUpdated(event: InstanceEvent): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      const instance = await this.instanceRepo.findOne({
        where: { id: event.instanceId },
        relations: ['objectType'],
      });

      if (!instance) {
        this.logger.warn(`Instance ${event.instanceId} not found for sync`);
        return;
      }

      await this.syncInstanceToGraph(instance);
      this.logger.debug(`Instance ${event.instanceId} updated in graph`);
    } catch (error) {
      this.logger.error(`Failed to update instance ${event.instanceId} in graph: ${error.message}`);
    }
  }

  @OnEvent('instance.deleted')
  async handleInstanceDeleted(event: InstanceEvent): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      await this.nebulaService.deleteVertex(event.instanceId);
      this.logger.debug(`Instance ${event.instanceId} deleted from graph`);
    } catch (error) {
      this.logger.error(`Failed to delete instance ${event.instanceId} from graph: ${error.message}`);
    }
  }

  @OnEvent('instance.relationship.created')
  async handleRelationshipCreated(event: RelationshipEvent): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      const relationship = await this.relationshipRepo.findOne({
        where: { id: event.relationshipId },
      });

      if (!relationship) {
        this.logger.warn(`Relationship ${event.relationshipId} not found for sync`);
        return;
      }

      await this.syncRelationshipToGraph(relationship);
      this.logger.debug(`Relationship ${event.relationshipId} synced to graph`);
    } catch (error) {
      this.logger.error(`Failed to sync relationship ${event.relationshipId}: ${error.message}`);
    }
  }

  @OnEvent('instance.relationship.deleted')
  async handleRelationshipDeleted(event: RelationshipEvent): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      await this.nebulaService.deleteEdge(
        event.sourceId,
        event.targetId,
        'RELATES_TO',
      );
      this.logger.debug(`Relationship deleted from graph: ${event.sourceId} -> ${event.targetId}`);
    } catch (error) {
      this.logger.error(`Failed to delete relationship from graph: ${error.message}`);
    }
  }

  async syncInstanceToGraph(instance: InstanceEntity): Promise<boolean> {
    const properties = {
      object_type_id: instance.objectTypeId,
      object_type_name: instance.objectType?.name || '',
      display_name: instance.displayName || '',
      status: instance.status,
      created_at: instance.createdAt,
      updated_at: instance.updatedAt,
      data: JSON.stringify(instance.data),
    };

    return this.nebulaService.upsertVertex(
      instance.id,
      'Instance',
      properties,
    );
  }

  async syncRelationshipToGraph(
    relationship: InstanceRelationshipEntity,
  ): Promise<boolean> {
    const properties = {
      object_relationship_id: relationship.objectRelationshipId,
      created_at: relationship.createdAt,
      metadata: JSON.stringify(relationship.metadata || {}),
    };

    return this.nebulaService.insertEdge(
      relationship.sourceInstanceId,
      relationship.targetInstanceId,
      'RELATES_TO',
      properties,
    );
  }

  async fullSync(): Promise<{
    instancesSync: number;
    relationshipsSync: number;
    errors: string[];
  }> {
    this.logger.log('Starting full graph sync...');
    const errors: string[] = [];
    let instancesSync = 0;
    let relationshipsSync = 0;

    try {
      // Sync all instances
      const instances = await this.instanceRepo.find({
        relations: ['objectType'],
        where: { deletedAt: IsNull() },
      });

      for (const instance of instances) {
        try {
          await this.syncInstanceToGraph(instance);
          instancesSync++;
        } catch (error) {
          errors.push(`Instance ${instance.id}: ${error.message}`);
        }
      }

      // Sync all relationships
      const relationships = await this.relationshipRepo.find({
        where: { deletedAt: IsNull() },
      });

      for (const relationship of relationships) {
        try {
          await this.syncRelationshipToGraph(relationship);
          relationshipsSync++;
        } catch (error) {
          errors.push(`Relationship ${relationship.id}: ${error.message}`);
        }
      }

      // Also sync ObjectTypes
      const objectTypes = await this.objectTypeRepo.find({
        where: { deleted_at: IsNull() },
      });

      for (const objectType of objectTypes) {
        try {
          await this.nebulaService.upsertVertex(
            objectType.id,
            'ObjectType',
            {
              name: objectType.name,
              description: objectType.description || '',
              created_at: objectType.created_at,
            },
          );
        } catch (error) {
          errors.push(`ObjectType ${objectType.id}: ${error.message}`);
        }
      }

      // Create INSTANCE_OF edges between instances and their ObjectTypes
      for (const instance of instances) {
        try {
          await this.nebulaService.insertEdge(
            instance.id,
            instance.objectTypeId,
            'INSTANCE_OF',
            { created_at: instance.createdAt },
          );
        } catch (error) {
          // Ignore duplicates
        }
      }

      this.logger.log(
        `Full sync complete: ${instancesSync} instances, ${relationshipsSync} relationships`,
      );
    } catch (error) {
      this.logger.error(`Full sync failed: ${error.message}`);
      errors.push(`Full sync error: ${error.message}`);
    }

    return { instancesSync, relationshipsSync, errors };
  }

  async clearGraph(): Promise<boolean> {
    try {
      // Delete all vertices (will also delete edges)
      await this.nebulaService.execute('DELETE VERTEX * WITH EDGE;');
      this.logger.log('Graph cleared successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to clear graph: ${error.message}`);
      return false;
    }
  }

  enableSync(): void {
    this.syncEnabled = true;
    this.logger.log('Graph sync enabled');
  }

  disableSync(): void {
    this.syncEnabled = false;
    this.logger.log('Graph sync disabled');
  }

  isSyncEnabled(): boolean {
    return this.syncEnabled;
  }
}

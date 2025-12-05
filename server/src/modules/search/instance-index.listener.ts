/**
 * InstanceIndexListener
 * Sprint 12 - US-057: Meilisearch Integration
 *
 * Listener that automatically indexes instances when they are created,
 * updated, or deleted. Uses NestJS event emitter for decoupling.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InstanceSearchService } from './instance-search.service';
import { InstanceEntity } from '../instances/entities/instance.entity';

// Event types
export const INSTANCE_CREATED = 'instance.created';
export const INSTANCE_UPDATED = 'instance.updated';
export const INSTANCE_DELETED = 'instance.deleted';
export const INSTANCE_STATUS_CHANGED = 'instance.status.changed';

export interface InstanceEvent {
  instance: InstanceEntity;
  userId?: string;
}

export interface InstanceDeletedEvent {
  instanceId: string;
  userId?: string;
}

@Injectable()
export class InstanceIndexListener implements OnModuleInit {
  private readonly logger = new Logger(InstanceIndexListener.name);
  private isReady = false;

  constructor(
    private readonly instanceSearchService: InstanceSearchService,
  ) {}

  onModuleInit(): void {
    // Give Meilisearch time to initialize
    setTimeout(() => {
      this.isReady = true;
      this.logger.log('Instance index listener is ready');
    }, 2000);
  }

  @OnEvent(INSTANCE_CREATED)
  async handleInstanceCreated(event: InstanceEvent): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Index listener not ready, skipping indexing');
      return;
    }

    try {
      await this.instanceSearchService.indexInstance(event.instance);
      this.logger.debug(`Indexed new instance: ${event.instance.id}`);
    } catch (error) {
      this.logger.error(`Failed to index new instance: ${event.instance.id}`, error);
    }
  }

  @OnEvent(INSTANCE_UPDATED)
  async handleInstanceUpdated(event: InstanceEvent): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Index listener not ready, skipping index update');
      return;
    }

    try {
      await this.instanceSearchService.updateInstanceIndex(event.instance);
      this.logger.debug(`Updated index for instance: ${event.instance.id}`);
    } catch (error) {
      this.logger.error(`Failed to update index for instance: ${event.instance.id}`, error);
    }
  }

  @OnEvent(INSTANCE_DELETED)
  async handleInstanceDeleted(event: InstanceDeletedEvent): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Index listener not ready, skipping index deletion');
      return;
    }

    try {
      await this.instanceSearchService.removeFromIndex(event.instanceId);
      this.logger.debug(`Removed instance from index: ${event.instanceId}`);
    } catch (error) {
      this.logger.error(`Failed to remove instance from index: ${event.instanceId}`, error);
    }
  }

  @OnEvent(INSTANCE_STATUS_CHANGED)
  async handleStatusChanged(event: InstanceEvent): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Index listener not ready, skipping status update');
      return;
    }

    try {
      await this.instanceSearchService.updateInstanceIndex(event.instance);
      this.logger.debug(`Updated index for status change: ${event.instance.id}`);
    } catch (error) {
      this.logger.error(`Failed to update index for status change: ${event.instance.id}`, error);
    }
  }
}

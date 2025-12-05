/**
 * ExternalSourcesResolver
 * Sprint 18 - US-DB-013/014/015: External Data Source GraphQL API
 */

import { Resolver, Query, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ExternalSourcesService, ConnectionTestResult } from './external-sources.service';
import { ExternalSource, ExternalSourceType } from './entities/external-source.entity';
import {
  CreateExternalSourceInput,
  UpdateExternalSourceInput,
} from './dto/external-source.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ObjectType()
class TestConnectionResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  latencyMs?: number;
}

@ObjectType()
class SyncResult {
  @Field()
  success: boolean;

  @Field()
  recordsProcessed: number;
}

@Resolver(() => ExternalSource)
// TODO: Re-enable auth in production
// @UseGuards(JwtAuthGuard)
export class ExternalSourcesResolver {
  constructor(private readonly externalSourcesService: ExternalSourcesService) {}

  @Query(() => [ExternalSource], { name: 'externalSources' })
  async findAll(): Promise<ExternalSource[]> {
    return this.externalSourcesService.findAll();
  }

  @Query(() => [ExternalSource], { name: 'activeExternalSources' })
  async findAllActive(): Promise<ExternalSource[]> {
    return this.externalSourcesService.findAllActive();
  }

  @Query(() => ExternalSource, { name: 'externalSource' })
  async findOne(@Args('id') id: string): Promise<ExternalSource> {
    return this.externalSourcesService.findOne(id);
  }

  @Query(() => [ExternalSource], { name: 'externalSourcesByType' })
  async findByType(
    @Args('type', { type: () => ExternalSourceType }) type: ExternalSourceType,
  ): Promise<ExternalSource[]> {
    return this.externalSourcesService.findByType(type);
  }

  @Mutation(() => ExternalSource)
  async createExternalSource(
    @Args('input') input: CreateExternalSourceInput,
  ): Promise<ExternalSource> {
    return this.externalSourcesService.create(input);
  }

  @Mutation(() => ExternalSource)
  async updateExternalSource(
    @Args('input') input: UpdateExternalSourceInput,
  ): Promise<ExternalSource> {
    return this.externalSourcesService.update(input);
  }

  @Mutation(() => Boolean)
  async deleteExternalSource(@Args('id') id: string): Promise<boolean> {
    return this.externalSourcesService.delete(id);
  }

  @Mutation(() => ExternalSource)
  async toggleExternalSourceEnabled(@Args('id') id: string): Promise<ExternalSource> {
    return this.externalSourcesService.toggleEnabled(id);
  }

  @Mutation(() => TestConnectionResult)
  async testExternalSourceConnection(@Args('id') id: string): Promise<TestConnectionResult> {
    const result = await this.externalSourcesService.testConnection(id);
    return {
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    };
  }

  @Mutation(() => SyncResult)
  async syncExternalSource(
    @Args('id') id: string,
    @Args('fullSync', { nullable: true }) fullSync?: boolean,
  ): Promise<SyncResult> {
    return this.externalSourcesService.syncData(id, fullSync);
  }
}

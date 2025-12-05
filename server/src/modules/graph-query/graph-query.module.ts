import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NebulaService } from './nebula.service';
import { GraphTraversalService } from './graph-traversal.service';
import { GraphAnalyticsService } from './graph-analytics.service';
import { GraphSyncService } from './graph-sync.service';
import { GraphQueryResolver } from './graph-query.resolver';
import nebulaConfig from './nebula.config';
import { InstanceEntity } from '../instances/entities/instance.entity';
import { InstanceRelationshipEntity } from '../instances/entities/instance-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';

@Module({
  imports: [
    ConfigModule.forFeature(nebulaConfig),
    TypeOrmModule.forFeature([
      InstanceEntity,
      InstanceRelationshipEntity,
      ObjectTypeEntity,
    ]),
  ],
  providers: [
    NebulaService,
    GraphTraversalService,
    GraphAnalyticsService,
    GraphSyncService,
    GraphQueryResolver,
  ],
  exports: [
    NebulaService,
    GraphTraversalService,
    GraphAnalyticsService,
    GraphSyncService,
  ],
})
export class GraphQueryModule {}

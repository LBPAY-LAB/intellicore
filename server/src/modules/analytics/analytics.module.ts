/**
 * Analytics Module
 * Sprint 14 - Analytics & Reporting
 *
 * Module for analytics dashboard, reporting, and data export.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import analyticsConfig from './analytics.config';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { ExportService } from './services/export.service';
import { ReportService } from './services/report.service';
import { AnalyticsResolver } from './analytics.resolver';
import {
  ReportDefinitionEntity,
  ReportExecutionEntity,
  ExportFileEntity,
} from './entities/report.entity';
import { InstanceEntity } from '../instances/entities/instance.entity';
import { InstanceRelationshipEntity } from '../instances/entities/instance-relationship.entity';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';
import { Document as DocumentEntity } from '../documents/entities/document.entity';

@Module({
  imports: [
    ConfigModule.forFeature(analyticsConfig),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      ReportDefinitionEntity,
      ReportExecutionEntity,
      ExportFileEntity,
      InstanceEntity,
      InstanceRelationshipEntity,
      ObjectTypeEntity,
      DocumentEntity,
    ]),
  ],
  providers: [
    AnalyticsQueryService,
    ExportService,
    ReportService,
    AnalyticsResolver,
  ],
  exports: [
    AnalyticsQueryService,
    ExportService,
    ReportService,
  ],
})
export class AnalyticsModule {}

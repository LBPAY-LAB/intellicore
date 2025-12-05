import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';
import { ObjectTypesModule } from './modules/object-types/object-types.module';
import { FieldsModule } from './modules/fields/fields.module';
import { RelationshipsModule } from './modules/relationships/relationships.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { VectorModule } from './vector/vector.module';
import { RagModule } from './modules/rag/rag.module';
import { InstancesModule } from './modules/instances/instances.module';
import { SearchModule } from './modules/search/search.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { GraphQueryModule } from './modules/graph-query/graph-query.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ExternalSourcesModule } from './modules/external-sources/external-sources.module';
import { AIAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { CacheModule } from './cache/cache.module';
import { DataLoaderModule } from './common/dataloader';
import { MonitoringModule } from './monitoring';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM module with PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // BullMQ for job queues (using Valkey/Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // Event emitter for decoupled events
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // GraphQL module with Apollo Server v4
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, res }: any) => ({ req, res }),
      buildSchemaOptions: {
        scalarsMap: [{ type: () => Object, scalar: GraphQLJSON }],
      },
      resolvers: { JSON: GraphQLJSON },
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          status: error.extensions?.status || 500,
          path: error.path,
          timestamp: new Date().toISOString(),
        };
      },
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Security module (rate limiting, audit logging)
    SecurityModule,

    // Cache module (Redis-backed caching)
    CacheModule,

    // DataLoader module (N+1 query prevention)
    DataLoaderModule,

    // Monitoring module (Prometheus metrics)
    MonitoringModule,

    // Feature modules
    AuthModule,
    StorageModule,
    ObjectTypesModule,
    FieldsModule,
    RelationshipsModule,
    DocumentsModule,
    VectorModule,
    RagModule,
    InstancesModule,
    SearchModule,
    WorkflowsModule,
    GraphQueryModule,
    AnalyticsModule,
    ExternalSourcesModule,
    AIAssistantModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, GraphQLExceptionFilter],
})
export class AppModule {}

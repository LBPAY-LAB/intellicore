/**
 * Migration: CreateExternalSources
 * Sprint 18 - US-DB-013/014/015: External Data Sources
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalSources1764822000000 implements MigrationInterface {
  name = 'CreateExternalSources1764822000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "external_source_type_enum" AS ENUM (
        'tigerbeetle',
        'postgres',
        'mysql',
        'rest_api',
        'graphql_api'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "external_source_status_enum" AS ENUM (
        'active',
        'inactive',
        'error',
        'testing'
      )
    `);

    // Create external_sources table
    await queryRunner.query(`
      CREATE TABLE "external_sources" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "source_type" "external_source_type_enum" NOT NULL DEFAULT 'postgres',
        "status" "external_source_status_enum" NOT NULL DEFAULT 'inactive',
        "connection_config" jsonb NOT NULL DEFAULT '{}',
        "sync_config" jsonb,
        "last_sync_at" TIMESTAMP WITH TIME ZONE,
        "last_sync_error" text,
        "sync_success_count" integer NOT NULL DEFAULT 0,
        "sync_failure_count" integer NOT NULL DEFAULT 0,
        "last_tested_at" TIMESTAMP WITH TIME ZONE,
        "last_test_success" boolean DEFAULT false,
        "last_test_message" text,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_external_sources" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_external_sources_type" ON "external_sources" ("source_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_external_sources_status" ON "external_sources" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_external_sources_enabled" ON "external_sources" ("is_enabled")
    `);

    // Seed default external sources (placeholders for configuration)
    await queryRunner.query(`
      INSERT INTO "external_sources" (
        "name",
        "description",
        "source_type",
        "status",
        "connection_config",
        "sync_config",
        "is_enabled"
      ) VALUES
      (
        'TigerBeetle Ledger',
        'TigerBeetle accounting database for transaction data',
        'tigerbeetle',
        'inactive',
        '{"clusterAddress": "localhost:3000", "clusterId": "0"}',
        '{"syncInterval": "5m", "batchSize": 1000}',
        false
      ),
      (
        'CoreBanking PostgreSQL',
        'Main CoreBanking PostgreSQL database',
        'postgres',
        'inactive',
        '{"host": "localhost", "port": 5432, "database": "corebanking", "username": "", "password": "", "schema": "public", "ssl": false}',
        '{"syncInterval": "15m", "tables": ["accounts", "transactions", "customers"]}',
        false
      ),
      (
        'BACEN API',
        'Banco Central do Brasil API for regulatory data',
        'rest_api',
        'inactive',
        '{"baseUrl": "https://api.bcb.gov.br", "timeout": 30000}',
        '{"syncInterval": "1h", "endpoints": ["/dados/serie/bcdata.sgs.11/dados"]}',
        false
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "external_sources"`);
    await queryRunner.query(`DROP TYPE "external_source_status_enum"`);
    await queryRunner.query(`DROP TYPE "external_source_type_enum"`);
  }
}

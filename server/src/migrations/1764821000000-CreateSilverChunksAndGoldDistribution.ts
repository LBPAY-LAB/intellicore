import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSilverChunksAndGoldDistribution1764821000000 implements MigrationInterface {
  name = 'CreateSilverChunksAndGoldDistribution1764821000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create processing_status enum if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "silver_processing_status" AS ENUM ('pending', 'processing', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create silver_chunks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "silver_chunks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "document_id" uuid NOT NULL REFERENCES "documents"("id") ON DELETE CASCADE,
        "chunk_index" integer NOT NULL,
        "content" text NOT NULL,
        "token_count" integer NOT NULL,
        "section_hierarchy" jsonb DEFAULT '[]',
        "page_number" integer,
        "has_table" boolean DEFAULT false,
        "has_image" boolean DEFAULT false,
        "extracted_entities" jsonb DEFAULT '[]',
        "processing_status" varchar(20) DEFAULT 'pending',
        "error_message" text,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    // Create indexes for silver_chunks
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_silver_chunks_document_id" ON "silver_chunks"("document_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_silver_chunks_processing_status" ON "silver_chunks"("processing_status")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_silver_chunks_document_chunk" ON "silver_chunks"("document_id", "chunk_index")
    `);

    // Create gold_distributions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gold_distributions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "silver_chunk_id" uuid NOT NULL REFERENCES "silver_chunks"("id") ON DELETE CASCADE,
        "document_id" uuid NOT NULL REFERENCES "documents"("id") ON DELETE CASCADE,
        "gold_a_record_id" varchar(100),
        "gold_a_status" varchar(20) DEFAULT 'pending',
        "gold_a_distributed_at" timestamp with time zone,
        "gold_b_node_id" varchar(100),
        "gold_b_status" varchar(20) DEFAULT 'pending',
        "gold_b_distributed_at" timestamp with time zone,
        "gold_c_vector_id" varchar(255),
        "gold_c_status" varchar(20) DEFAULT 'pending',
        "gold_c_distributed_at" timestamp with time zone,
        "distribution_metadata" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    // Create indexes for gold_distributions
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_gold_distributions_silver_chunk_id" ON "gold_distributions"("silver_chunk_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_gold_distributions_document_id" ON "gold_distributions"("document_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_gold_distributions_chunk_unique" ON "gold_distributions"("silver_chunk_id")
    `);

    // Add silver processing fields to documents table
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN IF NOT EXISTS "silver_processed_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "silver_metadata" jsonb,
      ADD COLUMN IF NOT EXISTS "silver_chunk_count" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "gold_a_distributed_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "gold_b_distributed_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "gold_c_distributed_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "gold_distribution_status" varchar(20) DEFAULT 'pending'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from documents
    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN IF EXISTS "silver_processed_at",
      DROP COLUMN IF EXISTS "silver_metadata",
      DROP COLUMN IF EXISTS "silver_chunk_count",
      DROP COLUMN IF EXISTS "gold_a_distributed_at",
      DROP COLUMN IF EXISTS "gold_b_distributed_at",
      DROP COLUMN IF EXISTS "gold_c_distributed_at",
      DROP COLUMN IF EXISTS "gold_distribution_status"
    `);

    // Drop gold_distributions table
    await queryRunner.query(`DROP TABLE IF EXISTS "gold_distributions"`);

    // Drop silver_chunks table
    await queryRunner.query(`DROP TABLE IF EXISTS "silver_chunks"`);

    // Drop enum (if safe)
    await queryRunner.query(`DROP TYPE IF EXISTS "silver_processing_status"`);
  }
}

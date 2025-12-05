import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmbeddingStatusToDocuments1733428000000 implements MigrationInterface {
  name = 'AddEmbeddingStatusToDocuments1733428000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for embedding status
    await queryRunner.query(`
      CREATE TYPE "embedding_status_enum" AS ENUM (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    `);

    // Add embedding_status column to documents table
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN "embedding_status" "embedding_status_enum" NOT NULL DEFAULT 'pending'
    `);

    // Add embedding_error column for storing error messages
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN "embedding_error" TEXT
    `);

    // Add embedded_at timestamp
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN "embedded_at" TIMESTAMP WITH TIME ZONE
    `);

    // Create index for faster filtering by embedding status
    await queryRunner.query(`
      CREATE INDEX "idx_documents_embedding_status"
      ON "documents" ("embedding_status")
    `);

    // Set existing processed documents with extracted text to pending for embedding
    await queryRunner.query(`
      UPDATE "documents"
      SET "embedding_status" = 'pending'
      WHERE "is_processed" = true AND "extracted_text" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX "idx_documents_embedding_status"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN "embedded_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN "embedding_error"
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN "embedding_status"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "embedding_status_enum"
    `);
  }
}

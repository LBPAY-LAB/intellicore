import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBronzeLayerFields1764820800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add document_category_id column
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD COLUMN "document_category_id" uuid NULL
        `);

        // Add bronze_processed_at column
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD COLUMN "bronze_processed_at" timestamp with time zone NULL
        `);

        // Add bronze_metadata column
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD COLUMN "bronze_metadata" jsonb NULL
        `);

        // Add index on document_category_id for better query performance
        await queryRunner.query(`
            CREATE INDEX "idx_documents_document_category_id"
            ON "documents" ("document_category_id")
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "documents"
            ADD CONSTRAINT "fk_documents_document_category"
            FOREIGN KEY ("document_category_id")
            REFERENCES "document_categories" ("id")
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "documents"
            DROP CONSTRAINT IF EXISTS "fk_documents_document_category"
        `);

        // Drop index
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_documents_document_category_id"
        `);

        // Drop bronze_metadata column
        await queryRunner.query(`
            ALTER TABLE "documents"
            DROP COLUMN "bronze_metadata"
        `);

        // Drop bronze_processed_at column
        await queryRunner.query(`
            ALTER TABLE "documents"
            DROP COLUMN "bronze_processed_at"
        `);

        // Drop document_category_id column
        await queryRunner.query(`
            ALTER TABLE "documents"
            DROP COLUMN "document_category_id"
        `);
    }

}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1733184000000 implements MigrationInterface {
  name = 'InitialSchema1733184000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create object_types table
    await queryRunner.query(`
      CREATE TABLE "object_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_object_types_name" UNIQUE ("name"),
        CONSTRAINT "PK_object_types" PRIMARY KEY ("id")
      )
    `);

    // Create field_type enum
    await queryRunner.query(`
      CREATE TYPE "fields_field_type_enum" AS ENUM(
        'STRING',
        'NUMBER',
        'BOOLEAN',
        'DATE',
        'ENUM',
        'RELATION'
      )
    `);

    // Create fields table
    await queryRunner.query(`
      CREATE TABLE "fields" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "object_type_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "field_type" "fields_field_type_enum" NOT NULL,
        "is_required" boolean NOT NULL DEFAULT false,
        "validation_rules" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fields" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "fields"
      ADD CONSTRAINT "FK_fields_object_type_id"
      FOREIGN KEY ("object_type_id")
      REFERENCES "object_types"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_fields_object_type_id" ON "fields" ("object_type_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_fields_name" ON "fields" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_object_types_name" ON "object_types" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_object_types_name"`);
    await queryRunner.query(`DROP INDEX "IDX_fields_name"`);
    await queryRunner.query(`DROP INDEX "IDX_fields_object_type_id"`);

    // Drop foreign key
    await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_fields_object_type_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "fields"`);
    await queryRunner.query(`DROP TYPE "fields_field_type_enum"`);
    await queryRunner.query(`DROP TABLE "object_types"`);
  }
}

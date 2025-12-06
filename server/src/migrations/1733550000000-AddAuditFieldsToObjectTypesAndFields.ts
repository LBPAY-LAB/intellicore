import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add audit fields (created_by, updated_by) to object_types and fields tables
 * Also adds unique constraint on (object_type_id, name) for fields table
 *
 * Sprint: OBJ-S1 (Object Management Sub-Project)
 * User Story: OBJ-US-001
 */
export class AddAuditFieldsToObjectTypesAndFields1733550000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add audit fields to object_types table
    await queryRunner.query(`
      ALTER TABLE object_types
      ADD COLUMN created_by VARCHAR(100),
      ADD COLUMN updated_by VARCHAR(100);
    `);

    // Add audit fields to fields table
    await queryRunner.query(`
      ALTER TABLE fields
      ADD COLUMN created_by VARCHAR(100),
      ADD COLUMN updated_by VARCHAR(100);
    `);

    // Add unique constraint on (object_type_id, name) for fields
    // First check if there are any duplicates
    const duplicates = await queryRunner.query(`
      SELECT object_type_id, name, COUNT(*)
      FROM fields
      GROUP BY object_type_id, name
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      console.warn(
        'Warning: Duplicate field names found. These will need to be resolved manually:',
        duplicates,
      );
      console.warn(
        'Skipping unique constraint creation. Please resolve duplicates and re-run migration.',
      );
    } else {
      await queryRunner.query(`
        ALTER TABLE fields
        ADD CONSTRAINT UQ_fields_object_type_name UNIQUE (object_type_id, name);
      `);
    }

    // Create indexes for audit fields for faster queries
    await queryRunner.query(`
      CREATE INDEX IDX_object_types_created_by ON object_types(created_by);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_object_types_updated_by ON object_types(updated_by);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_fields_created_by ON fields(created_by);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_fields_updated_by ON fields(updated_by);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_fields_updated_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_fields_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_object_types_updated_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_object_types_created_by;`);

    // Drop unique constraint if it exists
    await queryRunner.query(`
      ALTER TABLE fields
      DROP CONSTRAINT IF EXISTS UQ_fields_object_type_name;
    `);

    // Drop audit fields from fields table
    await queryRunner.query(`
      ALTER TABLE fields
      DROP COLUMN IF EXISTS updated_by,
      DROP COLUMN IF EXISTS created_by;
    `);

    // Drop audit fields from object_types table
    await queryRunner.query(`
      ALTER TABLE object_types
      DROP COLUMN IF EXISTS updated_by,
      DROP COLUMN IF EXISTS created_by;
    `);
  }
}

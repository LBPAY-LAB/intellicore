import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInstancesTables1733489000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for instance status
    await queryRunner.query(`
      CREATE TYPE "instance_status" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED')
    `);

    // Create the instances table (objects table for storing ObjectType instances)
    await queryRunner.createTable(
      new Table({
        name: 'instances',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'object_type_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: false,
            default: "'{}'",
          },
          {
            name: 'status',
            type: 'instance_status',
            default: "'DRAFT'",
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create index on object_type_id for faster lookups
    await queryRunner.createIndex(
      'instances',
      new TableIndex({
        name: 'IDX_instance_object_type',
        columnNames: ['object_type_id'],
      }),
    );

    // Create index on status for filtering
    await queryRunner.createIndex(
      'instances',
      new TableIndex({
        name: 'IDX_instance_status',
        columnNames: ['status'],
      }),
    );

    // Create index on created_at for sorting
    await queryRunner.createIndex(
      'instances',
      new TableIndex({
        name: 'IDX_instance_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Create GIN index on data for JSONB queries
    await queryRunner.query(`
      CREATE INDEX "IDX_instance_data_gin" ON "instances" USING GIN ("data")
    `);

    // Create index for soft delete queries
    await queryRunner.createIndex(
      'instances',
      new TableIndex({
        name: 'IDX_instance_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Add foreign key constraint for object_type_id
    await queryRunner.createForeignKey(
      'instances',
      new TableForeignKey({
        name: 'FK_instance_object_type',
        columnNames: ['object_type_id'],
        referencedTableName: 'object_types',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create instance_relationships table for linking instances
    await queryRunner.createTable(
      new Table({
        name: 'instance_relationships',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'source_instance_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'target_instance_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'object_relationship_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create unique index to prevent duplicate instance relationships
    await queryRunner.createIndex(
      'instance_relationships',
      new TableIndex({
        name: 'IDX_unique_instance_relationship',
        columnNames: ['source_instance_id', 'target_instance_id', 'object_relationship_id'],
        isUnique: true,
        where: 'deleted_at IS NULL',
      }),
    );

    // Create index on source_instance_id
    await queryRunner.createIndex(
      'instance_relationships',
      new TableIndex({
        name: 'IDX_instance_rel_source',
        columnNames: ['source_instance_id'],
      }),
    );

    // Create index on target_instance_id
    await queryRunner.createIndex(
      'instance_relationships',
      new TableIndex({
        name: 'IDX_instance_rel_target',
        columnNames: ['target_instance_id'],
      }),
    );

    // Create index on object_relationship_id
    await queryRunner.createIndex(
      'instance_relationships',
      new TableIndex({
        name: 'IDX_instance_rel_object_rel',
        columnNames: ['object_relationship_id'],
      }),
    );

    // Add foreign key constraints for instance_relationships
    await queryRunner.createForeignKey(
      'instance_relationships',
      new TableForeignKey({
        name: 'FK_instance_rel_source',
        columnNames: ['source_instance_id'],
        referencedTableName: 'instances',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'instance_relationships',
      new TableForeignKey({
        name: 'FK_instance_rel_target',
        columnNames: ['target_instance_id'],
        referencedTableName: 'instances',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'instance_relationships',
      new TableForeignKey({
        name: 'FK_instance_rel_object_rel',
        columnNames: ['object_relationship_id'],
        referencedTableName: 'object_relationships',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys for instance_relationships
    await queryRunner.dropForeignKey('instance_relationships', 'FK_instance_rel_object_rel');
    await queryRunner.dropForeignKey('instance_relationships', 'FK_instance_rel_target');
    await queryRunner.dropForeignKey('instance_relationships', 'FK_instance_rel_source');

    // Drop indexes for instance_relationships
    await queryRunner.dropIndex('instance_relationships', 'IDX_instance_rel_object_rel');
    await queryRunner.dropIndex('instance_relationships', 'IDX_instance_rel_target');
    await queryRunner.dropIndex('instance_relationships', 'IDX_instance_rel_source');
    await queryRunner.dropIndex('instance_relationships', 'IDX_unique_instance_relationship');

    // Drop instance_relationships table
    await queryRunner.dropTable('instance_relationships');

    // Drop foreign key for instances
    await queryRunner.dropForeignKey('instances', 'FK_instance_object_type');

    // Drop indexes for instances
    await queryRunner.dropIndex('instances', 'IDX_instance_deleted_at');
    await queryRunner.query('DROP INDEX "IDX_instance_data_gin"');
    await queryRunner.dropIndex('instances', 'IDX_instance_created_at');
    await queryRunner.dropIndex('instances', 'IDX_instance_status');
    await queryRunner.dropIndex('instances', 'IDX_instance_object_type');

    // Drop instances table
    await queryRunner.dropTable('instances');

    // Drop enum
    await queryRunner.query('DROP TYPE "instance_status"');
  }
}

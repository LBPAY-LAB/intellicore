import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateObjectRelationships1733306000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the object_relationships table
    await queryRunner.createTable(
      new Table({
        name: 'object_relationships',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'source_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'target_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'relationship_type',
            type: 'enum',
            enum: ['PARENT_OF', 'CHILD_OF', 'HAS_ONE', 'HAS_MANY', 'BELONGS_TO'],
            isNullable: false,
          },
          {
            name: 'cardinality',
            type: 'enum',
            enum: ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY'],
            isNullable: false,
          },
          {
            name: 'is_bidirectional',
            type: 'boolean',
            default: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'relationship_rules',
            type: 'jsonb',
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

    // Create unique index to prevent duplicate relationships (source + target + type)
    await queryRunner.createIndex(
      'object_relationships',
      new TableIndex({
        name: 'IDX_unique_relationship',
        columnNames: ['source_id', 'target_id', 'relationship_type'],
        isUnique: true,
        where: 'deleted_at IS NULL',
      }),
    );

    // Create index on source_id for faster lookups
    await queryRunner.createIndex(
      'object_relationships',
      new TableIndex({
        name: 'IDX_relationship_source',
        columnNames: ['source_id'],
      }),
    );

    // Create index on target_id for faster lookups
    await queryRunner.createIndex(
      'object_relationships',
      new TableIndex({
        name: 'IDX_relationship_target',
        columnNames: ['target_id'],
      }),
    );

    // Add foreign key constraint for source_id
    await queryRunner.createForeignKey(
      'object_relationships',
      new TableForeignKey({
        name: 'FK_relationship_source',
        columnNames: ['source_id'],
        referencedTableName: 'object_types',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key constraint for target_id
    await queryRunner.createForeignKey(
      'object_relationships',
      new TableForeignKey({
        name: 'FK_relationship_target',
        columnNames: ['target_id'],
        referencedTableName: 'object_types',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('object_relationships', 'FK_relationship_target');
    await queryRunner.dropForeignKey('object_relationships', 'FK_relationship_source');

    // Drop indexes
    await queryRunner.dropIndex('object_relationships', 'IDX_relationship_target');
    await queryRunner.dropIndex('object_relationships', 'IDX_relationship_source');
    await queryRunner.dropIndex('object_relationships', 'IDX_unique_relationship');

    // Drop table
    await queryRunner.dropTable('object_relationships');
  }
}

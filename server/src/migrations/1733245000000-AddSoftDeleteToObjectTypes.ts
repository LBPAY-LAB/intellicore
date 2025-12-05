import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteToObjectTypes1733245000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deleted_at column for soft delete support
    await queryRunner.addColumn(
      'object_types',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    // Create index on deleted_at for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_object_types_deleted_at" ON "object_types" ("deleted_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.query(`DROP INDEX "IDX_object_types_deleted_at"`);

    // Remove deleted_at column
    await queryRunner.dropColumn('object_types', 'deleted_at');
  }
}

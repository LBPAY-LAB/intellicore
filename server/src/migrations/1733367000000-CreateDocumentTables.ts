import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDocumentTables1733367000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_types table
    await queryRunner.createTable(
      new Table({
        name: 'document_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'allowed_extensions',
            type: 'text',
            comment: 'Comma-separated list of allowed file extensions',
          },
          {
            name: 'max_file_size_mb',
            type: 'int',
            default: 50,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
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

    // Create unique index on name (excluding soft-deleted)
    await queryRunner.createIndex(
      'document_types',
      new TableIndex({
        name: 'idx_document_types_name',
        columnNames: ['name'],
        isUnique: true,
        where: '"deleted_at" IS NULL',
      }),
    );

    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'document_type_id',
            type: 'uuid',
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'stored_filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_key',
            type: 'varchar',
            length: '500',
            isUnique: true,
          },
          {
            name: 'file_size',
            type: 'bigint',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 's3_bucket',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'extracted_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_processed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'uploaded_by',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
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

    // Create indexes for documents table
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'idx_documents_file_key',
        columnNames: ['file_key'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'idx_documents_document_type_id',
        columnNames: ['document_type_id'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'idx_documents_uploaded_by',
        columnNames: ['uploaded_by'],
      }),
    );

    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'idx_documents_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Create foreign key for document_type_id
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'fk_documents_document_type',
        columnNames: ['document_type_id'],
        referencedTableName: 'document_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Insert default document types
    await queryRunner.query(`
      INSERT INTO document_types (name, description, allowed_extensions, max_file_size_mb, is_active)
      VALUES
        ('BACEN Normative', 'Central Bank of Brazil regulatory documents', '.pdf,.docx,.txt', 50, true),
        ('Internal Policy', 'Company internal policies and procedures', '.pdf,.docx,.txt', 50, true),
        ('Contract', 'Legal contracts and agreements', '.pdf,.docx', 50, true),
        ('Report', 'Business and analytical reports', '.pdf,.docx,.xlsx,.txt', 50, true),
        ('Other', 'Miscellaneous documents', '.pdf,.docx,.txt,.png,.jpg,.jpeg', 50, true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('documents', 'fk_documents_document_type');

    // Drop indexes on documents table
    await queryRunner.dropIndex('documents', 'idx_documents_created_at');
    await queryRunner.dropIndex('documents', 'idx_documents_uploaded_by');
    await queryRunner.dropIndex('documents', 'idx_documents_document_type_id');
    await queryRunner.dropIndex('documents', 'idx_documents_file_key');

    // Drop documents table
    await queryRunner.dropTable('documents', true);

    // Drop index on document_types table
    await queryRunner.dropIndex('document_types', 'idx_document_types_name');

    // Drop document_types table
    await queryRunner.dropTable('document_types', true);
  }
}

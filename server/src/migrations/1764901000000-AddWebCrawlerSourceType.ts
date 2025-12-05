import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWebCrawlerSourceType1764901000000 implements MigrationInterface {
  name = 'AddWebCrawlerSourceType1764901000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add web_crawler value to the external_source_type_enum
    await queryRunner.query(`
      ALTER TYPE external_source_type_enum ADD VALUE IF NOT EXISTS 'web_crawler';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing values from enums easily
    // Would need to recreate the enum type without the value
    console.log('Cannot remove enum value - manual intervention required');
  }
}

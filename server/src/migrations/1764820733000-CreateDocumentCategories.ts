import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDocumentCategories1764820733000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_categories table
    await queryRunner.createTable(
      new Table({
        name: 'document_categories',
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
            name: 'rag_config',
            type: 'jsonb',
            default: `'{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}'`,
          },
          {
            name: 'metadata_schema',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'target_gold_layers',
            type: 'text',
            comment: 'Comma-separated list of target Gold layers (A, B, C)',
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
      'document_categories',
      new TableIndex({
        name: 'idx_document_categories_name',
        columnNames: ['name'],
        isUnique: true,
        where: '"deleted_at" IS NULL',
      }),
    );

    // Create index on is_active
    await queryRunner.createIndex(
      'document_categories',
      new TableIndex({
        name: 'idx_document_categories_is_active',
        columnNames: ['is_active'],
      }),
    );

    // Insert predefined document categories
    await queryRunner.query(`
      INSERT INTO document_categories (name, description, rag_config, metadata_schema, target_gold_layers, is_active)
      VALUES
        -- BACEN Manuals
        (
          'BACEN_MANUAL_PIX',
          'Manual do PIX - Central Bank of Brazil PIX system documentation',
          '{"chunkingStrategy":"semantic","chunkSize":1200,"chunkOverlap":250,"embeddingModel":"text-embedding-3-small"}',
          '{"version":{"type":"string","required":true},"effectiveDate":{"type":"date","required":true},"section":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),
        (
          'BACEN_MANUAL_DICT',
          'Manual do DICT - Directory of Transaction Account Identifiers',
          '{"chunkingStrategy":"semantic","chunkSize":1200,"chunkOverlap":250,"embeddingModel":"text-embedding-3-small"}',
          '{"version":{"type":"string","required":true},"effectiveDate":{"type":"date","required":true},"section":{"type":"string","required":false}}',
          'A,B',
          true
        ),
        (
          'BACEN_MANUAL_DISPUTAS',
          'Manual de Disputas - Dispute resolution procedures for payment systems',
          '{"chunkingStrategy":"semantic","chunkSize":1200,"chunkOverlap":250,"embeddingModel":"text-embedding-3-small"}',
          '{"version":{"type":"string","required":true},"effectiveDate":{"type":"date","required":true},"disputeType":{"type":"string","required":false}}',
          'A,B',
          true
        ),
        (
          'BACEN_MANUAL_PENALIDADES',
          'Manual de Penalidades - Penalty framework for payment system violations',
          '{"chunkingStrategy":"semantic","chunkSize":1200,"chunkOverlap":250,"embeddingModel":"text-embedding-3-small"}',
          '{"version":{"type":"string","required":true},"effectiveDate":{"type":"date","required":true},"penaltyType":{"type":"string","required":false}}',
          'A,B',
          true
        ),
        (
          'BACEN_CIRCULAR',
          'BACEN Circulars - Regulatory circulars and updates from Central Bank',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"circularNumber":{"type":"string","required":true},"publicationDate":{"type":"date","required":true},"subject":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),

        -- KYC and Compliance
        (
          'KYC_PF',
          'KYC Pessoa Física - Individual customer due diligence procedures',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"customerType":{"type":"string","required":true},"riskLevel":{"type":"string","required":false},"validFrom":{"type":"date","required":false}}',
          'A,B',
          true
        ),
        (
          'KYC_PJ',
          'KYC Pessoa Jurídica - Corporate customer due diligence procedures',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"customerType":{"type":"string","required":true},"riskLevel":{"type":"string","required":false},"validFrom":{"type":"date","required":false}}',
          'A,B',
          true
        ),
        (
          'COMPLIANCE_AML',
          'Anti-Money Laundering - AML policies and procedures',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"regulatoryFramework":{"type":"string","required":false},"lastReview":{"type":"date","required":false}}',
          'A,B',
          true
        ),
        (
          'COMPLIANCE_PEP',
          'Politically Exposed Persons - PEP identification and monitoring',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"pepCategory":{"type":"string","required":false},"jurisdiction":{"type":"string","required":false}}',
          'A,B',
          true
        ),
        (
          'COMPLIANCE_SANCTIONS',
          'Sanctions Screening - International sanctions lists and procedures',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"sanctionList":{"type":"string","required":false},"lastUpdate":{"type":"date","required":false}}',
          'A,B',
          true
        ),

        -- Product Documentation
        (
          'PRODUCT_CONTA_PAGAMENTO',
          'Conta de Pagamento - Payment account product specifications',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"productVersion":{"type":"string","required":false},"accountType":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),
        (
          'PRODUCT_EMPRESTIMOS',
          'Empréstimos - Loan product specifications and policies',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"productVersion":{"type":"string","required":false},"loanType":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),
        (
          'PRODUCT_INVESTIMENTOS',
          'Investimentos - Investment product specifications',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"productVersion":{"type":"string","required":false},"investmentType":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),
        (
          'OPS_PROCEDURES',
          'Operational Procedures - Internal operational procedures and workflows',
          '{"chunkingStrategy":"paragraph","chunkSize":800,"chunkOverlap":150,"embeddingModel":"text-embedding-3-small"}',
          '{"department":{"type":"string","required":false},"processType":{"type":"string","required":false}}',
          'B,C',
          true
        ),

        -- LBPay Internal Documentation
        (
          'LBPAY_POLITICAS',
          'LBPay Policies - Internal policies and governance documents',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"policyType":{"type":"string","required":false},"approvedBy":{"type":"string","required":false},"effectiveDate":{"type":"date","required":false}}',
          'B,C',
          true
        ),
        (
          'LBPAY_TIGERBEETLE',
          'LBPay TigerBeetle - TigerBeetle ledger integration documentation',
          '{"chunkingStrategy":"fixed","chunkSize":800,"chunkOverlap":150,"embeddingModel":"text-embedding-3-small"}',
          '{"component":{"type":"string","required":false},"version":{"type":"string","required":false}}',
          'B,C',
          true
        ),
        (
          'LBPAY_DATABASE',
          'LBPay Database - Database schema and data model documentation',
          '{"chunkingStrategy":"fixed","chunkSize":800,"chunkOverlap":150,"embeddingModel":"text-embedding-3-small"}',
          '{"schemaVersion":{"type":"string","required":false},"component":{"type":"string","required":false}}',
          'B,C',
          true
        ),
        (
          'LBPAY_INTEGRACAO',
          'LBPay Integration - External system integration documentation',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"integrationPartner":{"type":"string","required":false},"apiVersion":{"type":"string","required":false}}',
          'B,C',
          true
        ),

        -- General Categories
        (
          'GENERAL_BANKING',
          'General Banking - General banking knowledge and best practices',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          '{"topic":{"type":"string","required":false},"source":{"type":"string","required":false}}',
          'A,B,C',
          true
        ),
        (
          'CUSTOM',
          'Custom - User-defined custom document category',
          '{"chunkingStrategy":"semantic","chunkSize":1000,"chunkOverlap":200,"embeddingModel":"text-embedding-3-small"}',
          null,
          'C',
          true
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('document_categories', 'idx_document_categories_is_active');
    await queryRunner.dropIndex('document_categories', 'idx_document_categories_name');

    // Drop document_categories table
    await queryRunner.dropTable('document_categories', true);
  }
}

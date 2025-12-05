import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Sprint 20 - US-DB-021: DictRegistroChave ObjectType
 *
 * Seeds the complete DictRegistroChave ObjectType with all fields
 * based on BACEN DICT (Diretório de Identificadores de Contas Transacionais)
 * specification from Manual Operacional do DICT v3.2
 */
export class SeedDictRegistroChaveObjectType1764900000000
  implements MigrationInterface
{
  name = 'SeedDictRegistroChaveObjectType1764900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the DictRegistroChave ObjectType
    const objectTypeResult = await queryRunner.query(`
      INSERT INTO object_types (name, description, is_active)
      VALUES (
        'DictRegistroChave',
        'Registro de chave Pix no DICT conforme Manual Operacional do BACEN. Este ObjectType representa todas as informações necessárias para registrar, consultar e gerenciar uma chave Pix no Diretório de Identificadores de Contas Transacionais.',
        true
      )
      ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        is_active = true,
        updated_at = NOW()
      RETURNING id
    `);

    const objectTypeId = objectTypeResult[0].id;

    // 2. Insert all fields for the DictRegistroChave ObjectType
    // Following BACEN DICT specification

    const fields = [
      // === Key Identification ===
      {
        name: 'tipo_chave',
        field_type: 'ENUM',
        is_required: true,
        validation_rules: JSON.stringify({
          enum: ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'EVP'],
          description:
            'Tipo da chave Pix conforme especificação BACEN: CPF (11 dígitos), CNPJ (14 dígitos), EMAIL (até 77 caracteres), TELEFONE (+5511999999999), EVP (chave aleatória UUID)',
        }),
      },
      {
        name: 'valor_chave',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          maxLength: 77,
          description:
            'Valor da chave Pix. Tamanho máximo 77 caracteres. Formato varia conforme tipo_chave.',
          patterns: {
            CPF: '^[0-9]{11}$',
            CNPJ: '^[0-9]{14}$',
            EMAIL: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            TELEFONE: '^\\+55[1-9][0-9]{10}$',
            EVP: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        }),
      },

      // === Owner Information ===
      {
        name: 'titular_tipo',
        field_type: 'ENUM',
        is_required: true,
        validation_rules: JSON.stringify({
          enum: ['PESSOA_NATURAL', 'PESSOA_JURIDICA'],
          description: 'Tipo do titular da chave PIX',
        }),
      },
      {
        name: 'titular_cpf_cnpj',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          pattern: '^([0-9]{11}|[0-9]{14})$',
          description: 'CPF (11 dígitos) ou CNPJ (14 dígitos) do titular da chave',
        }),
      },
      {
        name: 'titular_nome',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          maxLength: 140,
          minLength: 1,
          description: 'Nome completo do titular pessoa física ou razão social da pessoa jurídica',
        }),
      },
      {
        name: 'titular_nome_fantasia',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          maxLength: 140,
          description: 'Nome fantasia para pessoa jurídica (opcional)',
        }),
      },

      // === Account Information ===
      {
        name: 'conta_participante',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          pattern: '^[0-9]{8}$',
          description: 'Código ISPB do participante (8 dígitos)',
        }),
      },
      {
        name: 'conta_agencia',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          maxLength: 4,
          pattern: '^[0-9]{1,4}$',
          description: 'Número da agência sem dígito verificador (até 4 dígitos)',
        }),
      },
      {
        name: 'conta_numero',
        field_type: 'STRING',
        is_required: true,
        validation_rules: JSON.stringify({
          maxLength: 20,
          pattern: '^[0-9a-zA-Z]{1,20}$',
          description: 'Número da conta com dígito verificador (até 20 caracteres)',
        }),
      },
      {
        name: 'conta_tipo',
        field_type: 'ENUM',
        is_required: true,
        validation_rules: JSON.stringify({
          enum: ['CACC', 'SVGS', 'TRAN', 'SLRY'],
          enumDescriptions: {
            CACC: 'Conta Corrente',
            SVGS: 'Conta Poupança',
            TRAN: 'Conta de Pagamento',
            SLRY: 'Conta Salário',
          },
          description: 'Tipo da conta conforme ISO 20022',
        }),
      },

      // === Registration Status ===
      {
        name: 'status_vinculo',
        field_type: 'ENUM',
        is_required: true,
        validation_rules: JSON.stringify({
          enum: [
            'OPEN_CLAIM_WAITING',
            'OPEN_CLAIM_CONFIRMED',
            'PORTABILITY_REQUESTED',
            'PORTABILITY_PENDING',
            'OWNERSHIP_CLAIM_PENDING',
            'REGISTERED',
            'PENDING_DELETION',
            'DELETED',
          ],
          description: 'Status do vínculo da chave no DICT conforme ciclo de vida',
        }),
      },
      {
        name: 'data_criacao',
        field_type: 'DATE',
        is_required: true,
        validation_rules: JSON.stringify({
          description: 'Data/hora de criação do vínculo no DICT (UTC)',
          format: 'ISO8601',
        }),
      },
      {
        name: 'data_inicio_vigencia',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data/hora de início da vigência do vínculo (UTC)',
          format: 'ISO8601',
        }),
      },
      {
        name: 'data_fim_vigencia',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data/hora de fim da vigência do vínculo (UTC)',
          format: 'ISO8601',
        }),
      },

      // === Claim/Portability Information ===
      {
        name: 'reivindicacao_tipo',
        field_type: 'ENUM',
        is_required: false,
        validation_rules: JSON.stringify({
          enum: ['PORTABILITY', 'OWNERSHIP'],
          description: 'Tipo de reivindicação: PORTABILITY (portabilidade) ou OWNERSHIP (posse)',
        }),
      },
      {
        name: 'reivindicacao_status',
        field_type: 'ENUM',
        is_required: false,
        validation_rules: JSON.stringify({
          enum: ['OPEN', 'WAITING_RESOLUTION', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
          description: 'Status da reivindicação em andamento',
        }),
      },
      {
        name: 'reivindicacao_participante_doador',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          pattern: '^[0-9]{8}$',
          description: 'ISPB do participante que está cedendo a chave (doador)',
        }),
      },
      {
        name: 'reivindicacao_participante_recebedor',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          pattern: '^[0-9]{8}$',
          description: 'ISPB do participante que está recebendo a chave (recebedor)',
        }),
      },
      {
        name: 'reivindicacao_data_limite',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data limite para resolução da reivindicação conforme prazos BACEN',
          format: 'ISO8601',
        }),
      },

      // === Anti-Fraud & Compliance ===
      {
        name: 'marcador_fraude',
        field_type: 'BOOLEAN',
        is_required: true,
        validation_rules: JSON.stringify({
          default: false,
          description: 'Indica se a chave possui marcação de fraude no DICT',
        }),
      },
      {
        name: 'motivo_fraude',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          maxLength: 500,
          description: 'Motivo da marcação de fraude quando aplicável',
        }),
      },
      {
        name: 'qtd_reportes_fraude',
        field_type: 'NUMBER',
        is_required: false,
        validation_rules: JSON.stringify({
          minimum: 0,
          description: 'Quantidade de reportes de fraude recebidos para esta chave',
        }),
      },
      {
        name: 'data_ultimo_reporte_fraude',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data do último reporte de fraude',
          format: 'ISO8601',
        }),
      },

      // === Statistics & Metadata ===
      {
        name: 'contador_consultas',
        field_type: 'NUMBER',
        is_required: false,
        validation_rules: JSON.stringify({
          minimum: 0,
          default: 0,
          description: 'Contador de consultas realizadas para esta chave',
        }),
      },
      {
        name: 'data_ultima_consulta',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data/hora da última consulta à chave',
          format: 'ISO8601',
        }),
      },
      {
        name: 'contador_transacoes',
        field_type: 'NUMBER',
        is_required: false,
        validation_rules: JSON.stringify({
          minimum: 0,
          default: 0,
          description: 'Contador de transações PIX recebidas nesta chave',
        }),
      },

      // === Audit Trail ===
      {
        name: 'end_to_end_id_registro',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          maxLength: 35,
          pattern: '^E[0-9]{8}[0-9]{4}[0-1][0-9][0-3][0-9][0-2][0-9][0-5][0-9][0-5][0-9].{11}$',
          description: 'EndToEndId da mensagem de registro da chave no DICT',
        }),
      },
      {
        name: 'id_correlacao',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          maxLength: 36,
          description: 'ID de correlação para rastreamento de operações',
        }),
      },

      // === Sync Control ===
      {
        name: 'sync_status',
        field_type: 'ENUM',
        is_required: true,
        validation_rules: JSON.stringify({
          enum: ['PENDING_SYNC', 'SYNCED', 'SYNC_ERROR', 'LOCAL_ONLY'],
          default: 'LOCAL_ONLY',
          description: 'Status de sincronização com o DICT central do BACEN',
        }),
      },
      {
        name: 'ultima_sincronizacao',
        field_type: 'DATE',
        is_required: false,
        validation_rules: JSON.stringify({
          description: 'Data/hora da última sincronização com DICT BACEN',
          format: 'ISO8601',
        }),
      },
      {
        name: 'erro_sincronizacao',
        field_type: 'STRING',
        is_required: false,
        validation_rules: JSON.stringify({
          maxLength: 1000,
          description: 'Mensagem de erro da última tentativa de sincronização',
        }),
      },
    ];

    // Insert each field
    for (const field of fields) {
      await queryRunner.query(
        `
        INSERT INTO fields (object_type_id, name, field_type, is_required, validation_rules)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `,
        [
          objectTypeId,
          field.name,
          field.field_type,
          field.is_required,
          field.validation_rules,
        ],
      );
    }

    console.log(
      `✅ Created DictRegistroChave ObjectType with ${fields.length} fields`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First delete all fields associated with DictRegistroChave
    await queryRunner.query(`
      DELETE FROM fields
      WHERE object_type_id IN (
        SELECT id FROM object_types WHERE name = 'DictRegistroChave'
      )
    `);

    // Then delete the ObjectType
    await queryRunner.query(`
      DELETE FROM object_types WHERE name = 'DictRegistroChave'
    `);

    console.log('✅ Removed DictRegistroChave ObjectType and all fields');
  }
}

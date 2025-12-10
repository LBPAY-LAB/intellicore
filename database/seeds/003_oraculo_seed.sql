-- ============================================================================
-- SEED DATA: ORÁCULO - A Consciência da Plataforma
-- ============================================================================
-- Este script inicializa o Oráculo com os object_definitions fundamentais
-- e cria a instance inicial da LBPAY como exemplo.
-- ============================================================================

-- ============================================================================
-- PARTE 1: Object Definitions do Oráculo
-- ============================================================================

-- 1. Identidade Corporativa
INSERT INTO object_definitions (name, display_name, description, category, schema, states, ui_hints, is_active) VALUES
('identidade_corporativa', 'Identidade Corporativa - Oráculo',
 'A identidade fundamental da instituição - quem somos, onde estamos, como nos apresentamos',
 'BUSINESS_ENTITY',
 '{
   "$schema": "http://json-schema.org/draft-07/schema#",
   "type": "object",
   "required": ["cnpj", "razao_social", "nome_fantasia", "data_fundacao"],
   "properties": {
     "cnpj": {
       "type": "string",
       "pattern": "^\\d{14}$",
       "description": "CNPJ da instituição"
     },
     "razao_social": {
       "type": "string",
       "minLength": 3,
       "maxLength": 200,
       "description": "Razão social registrada na Receita Federal"
     },
     "nome_fantasia": {
       "type": "string",
       "description": "Nome fantasia (marca)"
     },
     "inscricao_estadual": {
       "type": "string",
       "description": "Inscrição estadual (se aplicável)"
     },
     "data_fundacao": {
       "type": "string",
       "format": "date",
       "description": "Data de fundação da empresa"
     },
     "endereco_sede": {
       "type": "object",
       "required": ["logradouro", "numero", "cidade", "uf", "cep"],
       "properties": {
         "logradouro": {"type": "string"},
         "numero": {"type": "string"},
         "complemento": {"type": "string"},
         "bairro": {"type": "string"},
         "cidade": {"type": "string"},
         "uf": {"type": "string", "pattern": "^[A-Z]{2}$"},
         "cep": {"type": "string", "pattern": "^\\d{8}$"}
       }
     },
     "contatos": {
       "type": "object",
       "properties": {
         "telefone_principal": {"type": "string"},
         "email_institucional": {"type": "string", "format": "email"},
         "website": {"type": "string", "format": "uri"}
       }
     },
     "capital_social": {
       "type": "number",
       "minimum": 0,
       "description": "Capital social integralizado (BRL)"
     },
     "logo_url": {
       "type": "string",
       "format": "uri",
       "description": "URL do logotipo corporativo"
     },
     "cores_institucionais": {
       "type": "object",
       "properties": {
         "primaria": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
         "secundaria": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"}
       }
     }
   }
 }'::jsonb,
 '{
   "initial": "ACTIVE",
   "states": ["ACTIVE", "UPDATING"],
   "transitions": [
     {"from": "ACTIVE", "to": "UPDATING"},
     {"from": "UPDATING", "to": "ACTIVE"}
   ]
 }'::jsonb,
 '{
   "singleton": true,
   "icon": "building",
   "color": "blue",
   "form_layout": "vertical"
 }'::jsonb,
 true);

-- 2. Licença BACEN
INSERT INTO object_definitions (name, display_name, description, category, schema, states, ui_hints, is_active) VALUES
('licenca_bacen', 'Licença/Autorização BACEN - Oráculo',
 'Licenças e autorizações concedidas pelo Banco Central do Brasil',
 'BUSINESS_ENTITY',
 '{
   "$schema": "http://json-schema.org/draft-07/schema#",
   "type": "object",
   "required": ["tipo_autorizacao", "numero_autorizacao", "data_concessao", "status"],
   "properties": {
     "tipo_autorizacao": {
       "type": "string",
       "enum": [
         "INSTITUICAO_PAGAMENTO",
         "PARTICIPANTE_PIX_DIRETO",
         "PARTICIPANTE_PIX_INDIRETO",
         "SCD_TIPO_I",
         "SCD_TIPO_II",
         "CORRESPONDENTE_BANCARIO"
       ]
     },
     "numero_autorizacao": {
       "type": "string",
       "description": "Número do processo/autorização BACEN"
     },
     "data_concessao": {
       "type": "string",
       "format": "date"
     },
     "data_validade": {
       "type": "string",
       "format": "date"
     },
     "status": {
       "type": "string",
       "enum": ["ATIVA", "SUSPENSA", "CANCELADA", "EM_RENOVACAO"]
     },
     "condicoes_operacionais": {
       "type": "object",
       "properties": {
         "limite_saldo_contas": {"type": "number"},
         "limite_transacao_individual": {"type": "number"},
         "tipos_transacao_permitidos": {
           "type": "array",
           "items": {
             "type": "string",
             "enum": ["PIX", "TED", "DOC", "BOLETO", "CARTAO"]
           }
         }
       }
     },
     "url_documento_autorizacao": {
       "type": "string",
       "format": "uri"
     }
   }
 }'::jsonb,
 '{
   "initial": "ATIVA",
   "states": ["ATIVA", "SUSPENSA", "CANCELADA", "EM_RENOVACAO"],
   "transitions": [
     {"from": "ATIVA", "to": "SUSPENSA"},
     {"from": "SUSPENSA", "to": "ATIVA"},
     {"from": "ATIVA", "to": "CANCELADA"},
     {"from": "ATIVA", "to": "EM_RENOVACAO"},
     {"from": "EM_RENOVACAO", "to": "ATIVA"}
   ]
 }'::jsonb,
 '{
   "icon": "shield-check",
   "color": "green"
 }'::jsonb,
 true);

-- 3. Integração BACEN SPI (PIX)
INSERT INTO object_definitions (name, display_name, description, category, schema, states, ui_hints, is_active) VALUES
('integracao_bacen_spi', 'Integração BACEN SPI (PIX) - Oráculo',
 'Configuração da integração com o SPI (Sistema de Pagamentos Instantâneos) do BACEN',
 'INTEGRATION',
 '{
   "$schema": "http://json-schema.org/draft-07/schema#",
   "type": "object",
   "required": ["ispb", "participant_type", "api_endpoint"],
   "properties": {
     "ispb": {
       "type": "string",
       "pattern": "^\\d{8}$",
       "description": "ISPB (Identificador do Sistema de Pagamentos Brasileiro)"
     },
     "participant_type": {
       "type": "string",
       "enum": ["DIRETO", "INDIRETO"]
     },
     "api_endpoint": {
       "type": "string",
       "format": "uri",
       "description": "URL base da API SPI"
     },
     "ambiente": {
       "type": "string",
       "enum": ["PRODUCAO", "HOMOLOGACAO"],
       "default": "HOMOLOGACAO"
     },
     "limites_operacionais": {
       "type": "object",
       "properties": {
         "limite_diurno": {"type": "number", "default": 50000},
         "limite_noturno": {"type": "number", "default": 1000},
         "limite_por_transacao": {"type": "number", "default": 50000}
       }
     },
     "tipos_chave_suportados": {
       "type": "array",
       "items": {
         "type": "string",
         "enum": ["CPF", "CNPJ", "EMAIL", "TELEFONE", "EVP"]
       },
       "default": ["CPF", "CNPJ", "EMAIL", "TELEFONE", "EVP"]
     }
   }
 }'::jsonb,
 '{
   "initial": "CONFIGURADO",
   "states": ["CONFIGURADO", "ATIVO", "SUSPENSO", "DESATIVADO"],
   "transitions": [
     {"from": "CONFIGURADO", "to": "ATIVO"},
     {"from": "ATIVO", "to": "SUSPENSO"},
     {"from": "SUSPENSO", "to": "ATIVO"},
     {"from": "ATIVO", "to": "DESATIVADO"}
   ]
 }'::jsonb,
 '{
   "singleton": true,
   "icon": "arrow-right-arrow-left",
   "color": "purple"
 }'::jsonb,
 true);

-- 4. Integração TigerBeetle
INSERT INTO object_definitions (name, display_name, description, category, schema, states, ui_hints, is_active) VALUES
('integracao_tigerbeetle', 'Integração TigerBeetle Ledger - Oráculo',
 'Configuração da integração com o ledger contábil TigerBeetle',
 'INTEGRATION',
 '{
   "$schema": "http://json-schema.org/draft-07/schema#",
   "type": "object",
   "required": ["cluster_id", "ledger_id", "replica_addresses"],
   "properties": {
     "cluster_id": {
       "type": "integer",
       "description": "ID do cluster TigerBeetle"
     },
     "ledger_id": {
       "type": "integer",
       "description": "ID do ledger (1 = BRL, 2 = USD, etc.)",
       "default": 1
     },
     "replica_addresses": {
       "type": "array",
       "items": {"type": "string"},
       "minItems": 1,
       "description": "Endereços das réplicas (formato: tcp://host:port)"
     },
     "connection_pool": {
       "type": "object",
       "properties": {
         "max_connections": {"type": "integer", "default": 10},
         "timeout_ms": {"type": "integer", "default": 3000}
       }
     }
   }
 }'::jsonb,
 '{
   "initial": "CONFIGURADO",
   "states": ["CONFIGURADO", "CONECTADO", "DESCONECTADO", "ERRO"],
   "transitions": [
     {"from": "CONFIGURADO", "to": "CONECTADO"},
     {"from": "CONECTADO", "to": "DESCONECTADO"},
     {"from": "DESCONECTADO", "to": "CONECTADO"},
     {"from": "CONECTADO", "to": "ERRO"}
   ]
 }'::jsonb,
 '{
   "singleton": true,
   "icon": "database",
   "color": "orange"
 }'::jsonb,
 true);

-- 5. Política PLD/FT
INSERT INTO object_definitions (name, display_name, description, category, schema, states, ui_hints, is_active) VALUES
('politica_pld_ft', 'Política PLD/FT - Oráculo',
 'Política de Prevenção à Lavagem de Dinheiro e Financiamento ao Terrorismo',
 'POLICY',
 '{
   "$schema": "http://json-schema.org/draft-07/schema#",
   "type": "object",
   "properties": {
     "versao": {"type": "string"},
     "data_vigencia": {"type": "string", "format": "date"},
     "limites_transacionais": {
       "type": "object",
       "properties": {
         "deposito_dinheiro_dia": {"type": "number", "default": 50000},
         "saque_dinheiro_dia": {"type": "number", "default": 50000}
       }
     },
     "monitoramento_continuo": {
       "type": "object",
       "properties": {
         "analise_tempo_real": {"type": "boolean", "default": true},
         "score_minimo_aprovacao_automatica": {"type": "integer", "default": 70}
       }
     },
     "listas_restritivas": {
       "type": "object",
       "properties": {
         "verificar_pep": {"type": "boolean", "default": true},
         "verificar_ofac": {"type": "boolean", "default": true},
         "verificar_un": {"type": "boolean", "default": true}
       }
     }
   }
 }'::jsonb,
 '{
   "initial": "VIGENTE",
   "states": ["VIGENTE", "EM_REVISAO", "OBSOLETA"],
   "transitions": [
     {"from": "VIGENTE", "to": "EM_REVISAO"},
     {"from": "EM_REVISAO", "to": "VIGENTE"},
     {"from": "VIGENTE", "to": "OBSOLETA"}
   ]
 }'::jsonb,
 '{
   "singleton": true,
   "icon": "shield",
   "color": "red"
 }'::jsonb,
 true);

-- ============================================================================
-- PARTE 2: Instance Inicial - LBPAY (EXEMPLO)
-- ============================================================================
-- IMPORTANTE: Substituir estes dados pelos dados reais da sua instituição!
-- ============================================================================

-- Criar a identidade corporativa da LBPAY
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'identidade_corporativa'),
  '{
    "cnpj": "12345678000190",
    "razao_social": "LBPAY INSTITUICAO DE PAGAMENTO S.A.",
    "nome_fantasia": "LBPAY",
    "inscricao_estadual": "ISENTO",
    "data_fundacao": "2024-01-15",
    "endereco_sede": {
      "logradouro": "Avenida Paulista",
      "numero": "1000",
      "complemento": "Conjunto 1001",
      "bairro": "Bela Vista",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01310100"
    },
    "contatos": {
      "telefone_principal": "11987654321",
      "email_institucional": "contato@lbpay.com.br",
      "website": "https://www.lbpay.com.br"
    },
    "capital_social": 10000000,
    "logo_url": "https://www.lbpay.com.br/assets/logo.png",
    "cores_institucionais": {
      "primaria": "#0066CC",
      "secundaria": "#FF6600"
    }
  }'::jsonb,
  'ACTIVE',
  '[
    {
      "state": "ACTIVE",
      "timestamp": "2024-12-09T23:00:00Z",
      "user": "system",
      "reason": "Inicialização do Oráculo"
    }
  ]'::jsonb
);

-- Criar licença de Instituição de Pagamento
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'licenca_bacen'),
  '{
    "tipo_autorizacao": "INSTITUICAO_PAGAMENTO",
    "numero_autorizacao": "IP-2024-001-LBPAY",
    "data_concessao": "2024-03-15",
    "data_validade": "2034-03-15",
    "status": "ATIVA",
    "condicoes_operacionais": {
      "limite_saldo_contas": 50000,
      "limite_transacao_individual": 50000,
      "tipos_transacao_permitidos": ["PIX", "TED", "BOLETO"]
    },
    "url_documento_autorizacao": "https://www.bcb.gov.br/autorizacoes/lbpay-ip-001"
  }'::jsonb,
  'ATIVA',
  '[
    {
      "state": "ATIVA",
      "timestamp": "2024-03-15T10:00:00Z",
      "user": "BACEN",
      "reason": "Licença concedida após análise documental"
    }
  ]'::jsonb
);

-- Criar licença de Participante PIX Direto
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'licenca_bacen'),
  '{
    "tipo_autorizacao": "PARTICIPANTE_PIX_DIRETO",
    "numero_autorizacao": "PIX-DIR-2024-LBPAY",
    "data_concessao": "2024-04-01",
    "status": "ATIVA",
    "condicoes_operacionais": {
      "limite_saldo_contas": 50000,
      "limite_transacao_individual": 50000,
      "tipos_transacao_permitidos": ["PIX"]
    },
    "url_documento_autorizacao": "https://www.bcb.gov.br/pix/participantes/lbpay"
  }'::jsonb,
  'ATIVA',
  '[
    {
      "state": "ATIVA",
      "timestamp": "2024-04-01T14:00:00Z",
      "user": "BACEN-SPI",
      "reason": "Homologação técnica concluída com sucesso"
    }
  ]'::jsonb
);

-- Criar configuração da integração BACEN SPI
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'integracao_bacen_spi'),
  '{
    "ispb": "12345678",
    "participant_type": "DIRETO",
    "api_endpoint": "https://api.spi.bacen.gov.br/v1",
    "ambiente": "PRODUCAO",
    "limites_operacionais": {
      "limite_diurno": 50000,
      "limite_noturno": 1000,
      "limite_por_transacao": 50000
    },
    "tipos_chave_suportados": ["CPF", "CNPJ", "EMAIL", "TELEFONE", "EVP"]
  }'::jsonb,
  'ATIVO',
  '[
    {
      "state": "CONFIGURADO",
      "timestamp": "2024-04-01T15:00:00Z",
      "user": "system",
      "reason": "Configuração inicial"
    },
    {
      "state": "ATIVO",
      "timestamp": "2024-04-01T16:00:00Z",
      "user": "system",
      "reason": "Conexão estabelecida com sucesso"
    }
  ]'::jsonb
);

-- Criar configuração da integração TigerBeetle
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'integracao_tigerbeetle'),
  '{
    "cluster_id": 1,
    "ledger_id": 1,
    "replica_addresses": [
      "tcp://tigerbeetle-replica-1:3000",
      "tcp://tigerbeetle-replica-2:3000",
      "tcp://tigerbeetle-replica-3:3000"
    ],
    "connection_pool": {
      "max_connections": 10,
      "timeout_ms": 3000
    }
  }'::jsonb,
  'CONECTADO',
  '[
    {
      "state": "CONFIGURADO",
      "timestamp": "2024-04-05T10:00:00Z",
      "user": "system",
      "reason": "Configuração inicial do ledger"
    },
    {
      "state": "CONECTADO",
      "timestamp": "2024-04-05T10:05:00Z",
      "user": "system",
      "reason": "Pool de conexões estabelecido"
    }
  ]'::jsonb
);

-- Criar política PLD/FT
INSERT INTO instances (object_definition_id, data, current_state, state_history) VALUES
(
  (SELECT id FROM object_definitions WHERE name = 'politica_pld_ft'),
  '{
    "versao": "2024.1",
    "data_vigencia": "2024-01-01",
    "limites_transacionais": {
      "deposito_dinheiro_dia": 50000,
      "saque_dinheiro_dia": 50000
    },
    "monitoramento_continuo": {
      "analise_tempo_real": true,
      "score_minimo_aprovacao_automatica": 70
    },
    "listas_restritivas": {
      "verificar_pep": true,
      "verificar_ofac": true,
      "verificar_un": true
    }
  }'::jsonb,
  'VIGENTE',
  '[
    {
      "state": "VIGENTE",
      "timestamp": "2024-01-01T00:00:00Z",
      "user": "compliance",
      "reason": "Política aprovada pelo comitê de compliance"
    }
  ]'::jsonb
);

-- ============================================================================
-- PARTE 3: Comentários nas Instances do Oráculo
-- ============================================================================

COMMENT ON TABLE object_definitions IS 'Tabela de definições de objetos - inclui definições do Oráculo (categoria ORACLE)';

-- Tag especial para identificar instances do Oráculo
DO $$
DECLARE
  oracle_instance_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(i.id) INTO oracle_instance_ids
  FROM instances i
  JOIN object_definitions od ON i.object_definition_id = od.id
  WHERE od.name IN (
    'identidade_corporativa',
    'licenca_bacen',
    'integracao_bacen_spi',
    'integracao_tigerbeetle',
    'politica_pld_ft'
  );

  RAISE NOTICE '✅ Oráculo inicializado com % instances fundamentais', array_length(oracle_instance_ids, 1);
  RAISE NOTICE '   IDs: %', oracle_instance_ids;
END $$;

-- ============================================================================
-- SUMÁRIO
-- ============================================================================
-- Object Definitions criados: 5
--   1. identidade_corporativa
--   2. licenca_bacen
--   3. integracao_bacen_spi
--   4. integracao_tigerbeetle
--   5. politica_pld_ft
--
-- Instances criados (LBPAY exemplo): 6
--   1. Identidade LBPAY
--   2. Licença IP
--   3. Licença PIX Direto
--   4. Config BACEN SPI
--   5. Config TigerBeetle
--   6. Política PLD/FT
-- ============================================================================

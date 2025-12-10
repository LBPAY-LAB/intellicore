# CLAUDE.md - Guia Definitivo de Implementação da Plataforma SuperCore

> **"Eu sou a LBPAY. Eu sei quem sou, o que faço, e como opero."** - O Oráculo

## 📚 Estrutura de Documentação

Este documento é o **guia central de implementação**. Documentos relacionados:

### Fase 1 - Fundação
- **[docs/fase1/FASE_1_ESCOPO_TECNICO_COMPLETO.md](docs/fase1/FASE_1_ESCOPO_TECNICO_COMPLETO.md)** - Escopo técnico completo da Fase 1
- **[docs/fase1/SQUAD_E_SPRINTS_FASE_1.md](docs/fase1/SQUAD_E_SPRINTS_FASE_1.md)** - Composição da squad e planejamento de sprints (12 semanas)
- **[docs/fase1/IMPLEMENTATION_STATUS.md](docs/fase1/IMPLEMENTATION_STATUS.md)** - Status atual da implementação
- **[docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md](docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md)** - O conceito revolucionário do Oráculo
- **[docs/fase1/ORACLE_IMPLEMENTATION_COMPLETE.md](docs/fase1/ORACLE_IMPLEMENTATION_COMPLETE.md)** - Documentação da implementação do Oracle
- **[docs/fase1/ROADMAP_IMPLEMENTACAO_4_FASES.md](docs/fase1/ROADMAP_IMPLEMENTACAO_4_FASES.md)** - Roadmap completo de 4 fases (11 meses)

### Exemplos e Guias
- **[README.md](README.md)** - Guia do usuário, quick start, arquitetura
- **[docs/api/examples/README.md](docs/api/examples/README.md)** - Exemplos práticos de uso da API

---

## 🎯 MISSÃO CRÍTICA

**Implementar uma PLATAFORMA CRIADORA que permita ao time de Produto e Compliance criar um Core Banking completo em DIAS através de linguagem natural, sem necessidade de desenvolvedores.**

---

## 🧠 O ORÁCULO - A Consciência da Plataforma

### Conceito Revolucionário

Antes de tudo, a plataforma precisa **saber quem ela é**. O **Oráculo** é a consciência autoconsciente que contém:

```
Eu sou a LBPAY
├── CNPJ: 12.345.678/0001-90
├── Licenciada pelo Banco Central como Instituição de Pagamento
├── Participante Direto do PIX (ISPB: 12345678)
├── Operando sob as regulamentações:
│   ├── Circular BACEN 3.978 (PLD/FT)
│   ├── Resolução BACEN 80 (Instituições de Pagamento)
│   └── Regulamento PIX
├── Integrado com:
│   ├── BACEN SPI (Sistema de Pagamentos Instantâneos)
│   ├── TigerBeetle Ledger (Contabilidade)
│   └── Sistemas Anti-Fraude
└── Governado por políticas:
    ├── PLD/FT (limites, análises, COAF)
    ├── Risco de Crédito
    └── Compliance Regulatório
```

**Ver documentação completa**: [docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md](docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md)

### Por Que o Oráculo é Fundamental?

1. **Identidade**: Todo sistema precisa saber quem é
2. **Governança**: Todos os objetos são governados pelo Oráculo
3. **Validação**: Limites e regras vêm do Oráculo
4. **Integração**: Configurações de integrações externas
5. **Compliance**: Políticas regulatórias centralizadas
6. **Consciência**: O RAG consulta o Oráculo para responder "quem somos"

---

## 🧬 A VERDADE FUNDAMENTAL

### Não Estamos Construindo um Core Banking

Estamos construindo uma **Máquina Universal de Gestão de Entidades** que:

1. **Recebe**: Descrições em linguagem natural de objetos de negócio
2. **Gera**: Definições abstratas (`object_definitions`) com schemas, validações e FSMs
3. **Cria**: Instâncias vivas que respeitam suas definições
4. **Relaciona**: Conecta entidades através de um grafo semântico
5. **Raciocina**: RAG trimodal (SQL + Graph + Vector) que entende objetos, instâncias e correlações

### A Analogia do Corpo (ESSENCIAL)

```
object_definitions = DNA/Genoma
    ↓
instances = Células Vivas
    ↓
relationships = Sinapses/Conexões
    ↓
RAG = Sistema Nervoso que entende tudo
```

**Exemplo Concreto**:

```
"Cliente" não é uma tabela.
"Cliente" é um CONCEITO (object_definition) que define:
  - Estrutura: schema JSON
  - Comportamento: FSM (estados + transições)
  - Validações: rules (CPF válido, não blacklist)
  - UI: hints (como renderizar)

Maria Silva CPF 123.456.789-01 = INSTÂNCIA de "Cliente"
João Pedro CPF 987.654.321-09 = OUTRA INSTÂNCIA de "Cliente"

Relacionamento: Maria TITULAR_DE Conta-12345
                      ↓
            Aresta no Grafo que o RAG entende
```

---

## 🚫 REGRAS INVIOLÁVEIS

### NUNCA

1. ❌ **Criar tabelas hardcoded** (`CREATE TABLE clientes` é ERRADO)
2. ❌ **Implementar lógica de negócio em código** (validação de CPF não pode estar em função Go)
3. ❌ **Fazer mock ou POC** (tudo que construímos é produção)
4. ❌ **Assumir número fixo de agentes** (são descobertos dinamicamente)
5. ❌ **Construir UI específica para "Cliente"** (UI é 100% genérica, gerada do schema)

### SEMPRE

1. ✅ **Usar `object_definitions` + `instances` + `relationships`**
2. ✅ **Validações em `validation_rules`** (tabela genérica, interpretadas em runtime)
3. ✅ **Código de produção desde a primeira linha** (zero throwaway code)
4. ✅ **UI gerada dinamicamente** a partir de JSON Schema + UI Hints
5. ✅ **RAG que navega por objetos e instâncias** como um sistema nervoso

---

## 🏗️ ARQUITETURA DA PLATAFORMA

### Camada 0: Meta-Objetos (Regras, Políticas, Integrações)

**REVELAÇÃO CRÍTICA**: Objetos não são apenas DADOS. São também REGRAS, POLÍTICAS e INTEGRAÇÕES.

```
┌──────────────────────────────────────────────────────────┐
│         CAMADA META: Objetos que Governam                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  object_definition: "regra_bacen"                        │
│  ├─ instance: "Circular 3.978 - Limites PIX Noturno"    │
│  ├─ instance: "Resolução 4.753 - KYC"                   │
│  └─ instance: "Circular 4.015 - Tarifas"                │
│                                                          │
│  object_definition: "politica_risco_interna"            │
│  ├─ instance: "Aprovação Automática Premium"            │
│  ├─ instance: "Score Anti-Fraude V3"                    │
│  └─ instance: "Limites Transacionais por Segmento"      │
│                                                          │
│  object_definition: "integracao_externa"                │
│  ├─ instance: "TigerBeetle Ledger"                      │
│  ├─ instance: "BACEN - SPI (PIX)"                       │
│  ├─ instance: "Data Rudder (Anti-Fraude)"               │
│  ├─ instance: "Fácil Tech (Contabilidade)"              │
│  └─ instance: "ViaCEP"                                   │
│                                                          │
│  object_definition: "logica_negocio_customizada"        │
│  ├─ instance: "Algoritmo Score Crédito Interno"         │
│  └─ instance: "Cálculo Tarifas Dinâmico"                │
│                                                          │
└──────────────────────────────────────────────────────────┘
                        ↓ GOVERNAM
┌──────────────────────────────────────────────────────────┐
│      CAMADA DE DADOS: Objetos de Entidades               │
├──────────────────────────────────────────────────────────┤
│  object_definition: "cliente_pf"                         │
│  object_definition: "conta_corrente"                     │
│  object_definition: "transacao_pix"                      │
│                                                          │
│  Instances OBEDECEM as regras/políticas acima            │
└──────────────────────────────────────────────────────────┘
```

#### Tipo 1: Regras BACEN (Normativas como Objetos)

```json
// object_definition
{
  "name": "regra_bacen",
  "display_name": "Regra Normativa BACEN",
  "description": "Regras extraídas de manuais, circulares e resoluções do Banco Central",
  "schema": {
    "type": "object",
    "properties": {
      "codigo_normativo": {
        "type": "string",
        "description": "Ex: Circular 3.978, Resolução 4.753"
      },
      "titulo": {"type": "string"},
      "dominio": {
        "type": "string",
        "enum": ["PIX", "TED", "KYC", "AML", "LIMITES", "TARIFAS", "CAPITAL"]
      },
      "texto_normativo": {
        "type": "string",
        "description": "Texto original da norma BACEN"
      },
      "regras_executaveis": {
        "type": "array",
        "description": "Regras interpretáveis pelo sistema",
        "items": {
          "type": "object",
          "properties": {
            "tipo": {"type": "string", "enum": ["validacao", "limite", "tarifa", "workflow", "alerta"]},
            "condicao": {"type": "string", "description": "Expressão: valor > 1000 AND horario BETWEEN '20:00' AND '06:00'"},
            "acao": {"type": "string", "enum": ["BLOQUEAR", "ALERTAR", "EXIGIR_TOKEN", "APLICAR_TARIFA", "REGISTRAR_LOG"]},
            "parametros": {"type": "object"}
          }
        }
      },
      "vigencia_inicio": {"type": "string", "format": "date"},
      "vigencia_fim": {"type": "string", "format": "date"},
      "link_oficial": {"type": "string", "format": "uri"}
    }
  }
}
```

**Uso Real**: Quando uma transação PIX é criada, o sistema busca TODAS as instances de `regra_bacen` com `dominio = "PIX"` e `current_state = "VIGENTE"`, e executa as `regras_executaveis`.

#### Tipo 2: Políticas Internas (Governança)

```json
// object_definition
{
  "name": "politica_risco_interna",
  "display_name": "Política de Risco Interna",
  "description": "Políticas criadas pelo time de Risco/Compliance/Produto",
  "schema": {
    "type": "object",
    "properties": {
      "nome_politica": {"type": "string"},
      "area_responsavel": {"type": "string", "enum": ["RISCO", "COMPLIANCE", "FRAUDE", "CREDITO", "PRODUTO"]},
      "criterios": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "nome_criterio": {"type": "string"},
            "condicao": {"type": "string"},
            "score_impacto": {"type": "number", "minimum": 0, "maximum": 100},
            "acao_recomendada": {"type": "string", "enum": ["APROVAR", "REVISAR_MANUAL", "REJEITAR", "SOLICITAR_DOCS"]}
          }
        }
      },
      "versao": {"type": "string"},
      "aprovada_por": {"type": "string"},
      "data_aprovacao": {"type": "string", "format": "date"}
    }
  }
}
```

#### Tipo 3: Integrações Externas (Serviços como Objetos)

**CRÍTICO**: Integrações com TigerBeetle, BACEN, Anti-Fraude, Contabilidade são OBJETOS!

```json
// object_definition
{
  "name": "integracao_externa",
  "display_name": "Integração com Serviço Externo",
  "description": "Configuração de integração com sistemas externos (APIs, ledgers, serviços)",
  "schema": {
    "type": "object",
    "properties": {
      "nome_servico": {"type": "string"},
      "categoria": {
        "type": "string",
        "enum": ["LEDGER", "BANCO_CENTRAL", "ANTI_FRAUDE", "CONTABILIDADE", "API_PUBLICA", "WEBHOOK"]
      },
      "tipo_integracao": {
        "type": "string",
        "enum": ["REST_API", "GRPC", "GRAPHQL", "WEBHOOK", "TCP_SOCKET", "MESSAGE_QUEUE"]
      },
      "config_conexao": {
        "type": "object",
        "properties": {
          "base_url": {"type": "string", "format": "uri"},
          "auth_type": {"type": "string", "enum": ["API_KEY", "OAUTH2", "JWT", "MTLS", "BASIC_AUTH"]},
          "credentials": {"type": "object", "description": "Armazenado criptografado"},
          "timeout_ms": {"type": "integer", "default": 5000},
          "retry_policy": {
            "type": "object",
            "properties": {
              "max_retries": {"type": "integer", "default": 3},
              "backoff_strategy": {"type": "string", "enum": ["LINEAR", "EXPONENTIAL"]}
            }
          }
        }
      },
      "endpoints": {
        "type": "array",
        "description": "Mapeamento de operações",
        "items": {
          "type": "object",
          "properties": {
            "operacao": {"type": "string", "description": "Ex: criar_transacao, consultar_saldo"},
            "metodo": {"type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
            "path": {"type": "string"},
            "headers": {"type": "object"},
            "body_template": {"type": "string", "description": "Template com variáveis: {{valor}}, {{cpf}}"},
            "response_mapping": {"type": "object", "description": "Como mapear response para nosso schema"}
          }
        }
      },
      "healthcheck": {
        "type": "object",
        "properties": {
          "endpoint": {"type": "string"},
          "intervalo_segundos": {"type": "integer", "default": 60},
          "timeout_ms": {"type": "integer", "default": 2000}
        }
      },
      "circuit_breaker": {
        "type": "object",
        "properties": {
          "enabled": {"type": "boolean", "default": true},
          "failure_threshold": {"type": "integer", "default": 5},
          "reset_timeout_segundos": {"type": "integer", "default": 60}
        }
      }
    }
  }
}
```

**Exemplo de Instance - TigerBeetle:**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "TigerBeetle Ledger",
    "categoria": "LEDGER",
    "tipo_integracao": "TCP_SOCKET",
    "config_conexao": {
      "base_url": "tcp://tigerbeetle:3000",
      "auth_type": "MTLS",
      "credentials": {
        "cert_path": "/secrets/tigerbeetle-client.crt",
        "key_path": "/secrets/tigerbeetle-client.key"
      },
      "timeout_ms": 3000,
      "retry_policy": {
        "max_retries": 3,
        "backoff_strategy": "EXPONENTIAL"
      }
    },
    "endpoints": [
      {
        "operacao": "criar_transferencia",
        "metodo": "POST",
        "path": "/transfers",
        "body_template": "{\"id\": \"{{transfer_id}}\", \"debit_account_id\": \"{{origem_id}}\", \"credit_account_id\": \"{{destino_id}}\", \"amount\": {{valor}}, \"ledger\": 1, \"code\": 1}",
        "response_mapping": {
          "success_field": "status",
          "success_value": "committed",
          "error_field": "error"
        }
      },
      {
        "operacao": "consultar_saldo",
        "metodo": "GET",
        "path": "/accounts/{{account_id}}/balance",
        "response_mapping": {
          "balance_field": "debits_posted - credits_posted"
        }
      }
    ],
    "healthcheck": {
      "endpoint": "/health",
      "intervalo_segundos": 30,
      "timeout_ms": 1000
    },
    "circuit_breaker": {
      "enabled": true,
      "failure_threshold": 5,
      "reset_timeout_segundos": 60
    }
  },
  "current_state": "ATIVO"
}
```

**Exemplo de Instance - BACEN SPI (PIX):**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "BACEN - SPI (Sistema de Pagamentos Instantâneos)",
    "categoria": "BANCO_CENTRAL",
    "tipo_integracao": "REST_API",
    "config_conexao": {
      "base_url": "https://api.spi.bcb.gov.br/v1",
      "auth_type": "MTLS",
      "credentials": {
        "cert_path": "/secrets/bacen-pix.crt",
        "key_path": "/secrets/bacen-pix.key",
        "ispb": "12345678"
      },
      "timeout_ms": 10000,
      "retry_policy": {
        "max_retries": 2,
        "backoff_strategy": "LINEAR"
      }
    },
    "endpoints": [
      {
        "operacao": "enviar_pix",
        "metodo": "POST",
        "path": "/pix",
        "headers": {
          "x-correlationID": "{{correlation_id}}",
          "x-idempotencyKey": "{{idempotency_key}}"
        },
        "body_template": "{\"valor\": \"{{valor}}\", \"chave\": \"{{chave_destino}}\", \"infoPagador\": \"{{info}}\"}"
      },
      {
        "operacao": "consultar_chave",
        "metodo": "GET",
        "path": "/dict/key/{{chave}}",
        "response_mapping": {
          "owner_field": "owner.taxIdNumber",
          "account_field": "account.number"
        }
      },
      {
        "operacao": "webhook_pix_recebido",
        "metodo": "POST",
        "path": "/webhooks/pix/received",
        "body_template": "{{raw_bacen_payload}}"
      }
    ],
    "healthcheck": {
      "endpoint": "/health",
      "intervalo_segundos": 120,
      "timeout_ms": 5000
    }
  },
  "current_state": "ATIVO"
}
```

**Exemplo de Instance - Data Rudder (Anti-Fraude):**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "Data Rudder - Detecção de Fraude",
    "categoria": "ANTI_FRAUDE",
    "tipo_integracao": "REST_API",
    "config_conexao": {
      "base_url": "https://api.datarudder.com/v2",
      "auth_type": "API_KEY",
      "credentials": {
        "api_key": "{{ENCRYPTED:datarudder_api_key}}",
        "api_secret": "{{ENCRYPTED:datarudder_secret}}"
      },
      "timeout_ms": 3000
    },
    "endpoints": [
      {
        "operacao": "avaliar_risco_transacao",
        "metodo": "POST",
        "path": "/risk-score",
        "body_template": "{\"transaction\": {\"amount\": {{valor}}, \"timestamp\": \"{{timestamp}}\", \"device_id\": \"{{device_id}}\"}, \"user\": {\"cpf\": \"{{cpf}}\", \"account_age_days\": {{account_age}}}}",
        "response_mapping": {
          "score_field": "risk_score",
          "recommendation_field": "action",
          "factors_field": "risk_factors"
        }
      },
      {
        "operacao": "reportar_fraude_confirmada",
        "metodo": "POST",
        "path": "/feedback/fraud",
        "body_template": "{\"transaction_id\": \"{{transaction_id}}\", \"fraud_type\": \"{{tipo}}\", \"confirmed_at\": \"{{timestamp}}\"}"
      }
    ]
  },
  "current_state": "ATIVO"
}
```

**Como o Sistema Usa Integrações:**

```go
// IntegrationManager.go
// Sistema genérico que executa QUALQUER integração

func (m *IntegrationManager) ExecuteOperation(ctx context.Context, serviceName, operation string, params map[string]interface{}) (interface{}, error) {
    // 1. BUSCA A INSTANCE DA INTEGRAÇÃO
    integration, err := m.getIntegration(serviceName)
    if err != nil {
        return nil, err
    }

    // 2. ENCONTRA O ENDPOINT DA OPERAÇÃO
    var endpoint *Endpoint
    for _, ep := range integration.Data["endpoints"].([]interface{}) {
        e := ep.(map[string]interface{})
        if e["operacao"].(string) == operation {
            endpoint = &e
            break
        }
    }

    // 3. RENDERIZA BODY TEMPLATE COM PARÂMETROS
    bodyTemplate := endpoint["body_template"].(string)
    body := m.renderTemplate(bodyTemplate, params)

    // 4. EXECUTA REQUEST (com retry, timeout, circuit breaker)
    response, err := m.httpClient.Do(ctx, HTTPRequest{
        Method:  endpoint["metodo"].(string),
        URL:     integration.Data["config_conexao"]["base_url"].(string) + endpoint["path"].(string),
        Headers: endpoint["headers"],
        Body:    body,
        Timeout: integration.Data["config_conexao"]["timeout_ms"].(int),
    })

    // 5. MAPEIA RESPONSE USANDO response_mapping
    result := m.mapResponse(response, endpoint["response_mapping"])

    return result, nil
}

// Exemplo de uso:
// Criar transferência no TigerBeetle
result, err := integrationMgr.ExecuteOperation(ctx, "TigerBeetle Ledger", "criar_transferencia", map[string]interface{}{
    "transfer_id": uuid.New(),
    "origem_id": contaOrigem.TigerBeetleAccountID,
    "destino_id": contaDestino.TigerBeetleAccountID,
    "valor": 10000, // R$ 100.00 em centavos
})

// Avaliar risco de transação no Data Rudder
riskResult, err := integrationMgr.ExecuteOperation(ctx, "Data Rudder - Detecção de Fraude", "avaliar_risco_transacao", map[string]interface{}{
    "valor": 5000,
    "timestamp": time.Now().Format(time.RFC3339),
    "device_id": req.DeviceID,
    "cpf": cliente.CPF,
    "account_age": cliente.AccountAgeDays(),
})

riskScore := riskResult["score_field"].(float64)
if riskScore > 75 {
    return errors.New("Transação bloqueada por alto risco de fraude")
}
```

#### Tipo 4: Lógicas de Negócio Customizadas (Algoritmos como Objetos)

```json
// object_definition
{
  "name": "logica_negocio_customizada",
  "display_name": "Lógica de Negócio Customizada",
  "description": "Algoritmos proprietários e lógicas específicas da empresa",
  "schema": {
    "type": "object",
    "properties": {
      "nome_algoritmo": {"type": "string"},
      "descricao": {"type": "string"},
      "linguagem": {"type": "string", "enum": ["javascript", "python", "lua", "cel", "expr"]},
      "codigo_fonte": {
        "type": "string",
        "description": "Código executável (sandboxed)"
      },
      "inputs": {
        "type": "object",
        "description": "JSON Schema dos inputs esperados"
      },
      "output": {
        "type": "object",
        "description": "JSON Schema do output"
      },
      "testes": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "nome_teste": {"type": "string"},
            "input": {"type": "object"},
            "output_esperado": {"type": "object"}
          }
        }
      }
    }
  }
}
```

**Exemplo de Instance - Cálculo de Tarifas Dinâmico:**

```json
{
  "object_definition_id": "uuid-logica-customizada",
  "data": {
    "nome_algoritmo": "Cálculo Tarifas Dinâmico por Segmento",
    "descricao": "Calcula tarifas baseado no segmento do cliente, volume mensal e tipo de transação",
    "linguagem": "javascript",
    "codigo_fonte": `
      function calcularTarifa(transacao, cliente, historico_mensal) {
        const segmento = cliente.segmento;
        const volumeMensal = historico_mensal.reduce((sum, t) => sum + t.valor, 0);
        const tipoTransacao = transacao.tipo;

        // Tabela de tarifas base
        const tarifasBase = {
          'PIX': { 'VAREJO': 0.99, 'PREMIUM': 0, 'PRIVATE': 0 },
          'TED': { 'VAREJO': 10.90, 'PREMIUM': 5.00, 'PRIVATE': 0 },
          'BOLETO': { 'VAREJO': 3.50, 'PREMIUM': 2.00, 'PRIVATE': 0 }
        };

        let tarifa = tarifasBase[tipoTransacao][segmento];

        // Desconto progressivo por volume
        if (volumeMensal > 50000) {
          tarifa *= 0.7; // 30% desconto
        } else if (volumeMensal > 20000) {
          tarifa *= 0.85; // 15% desconto
        }

        // Isenção para valores pequenos (PIX)
        if (tipoTransacao === 'PIX' && transacao.valor < 10) {
          tarifa = 0;
        }

        return {
          tarifa_calculada: Math.round(tarifa * 100) / 100,
          tarifa_base: tarifasBase[tipoTransacao][segmento],
          desconto_aplicado: volumeMensal > 20000,
          isento: tarifa === 0,
          detalhamento: {
            segmento: segmento,
            volume_mensal: volumeMensal,
            tipo_transacao: tipoTransacao
          }
        };
      }
    `,
    "inputs": {
      "type": "object",
      "properties": {
        "transacao": {"type": "object"},
        "cliente": {"type": "object"},
        "historico_mensal": {"type": "array"}
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "tarifa_calculada": {"type": "number"},
        "isento": {"type": "boolean"},
        "detalhamento": {"type": "object"}
      }
    }
  },
  "current_state": "ATIVO"
}
```

### Por Que Isso é Revolucionário?

1. **Time de Compliance cria regras BACEN sem devs**: Lê a Circular 3.978 e cria uma instance de `regra_bacen` via assistente.

2. **Time de Risco atualiza políticas em minutos**: Mudou o critério de aprovação? Edita a instance de `politica_risco_interna`.

3. **Novas integrações sem deploy**: Precisa conectar com um novo serviço? Cria uma instance de `integracao_externa`.

4. **Algoritmos versionados como dados**: Score de crédito V3? Nova instance de `logica_negocio_customizada`. V2 continua disponível.

5. **Auditoria completa**: Toda mudança de regra/política fica em `state_history`. Rastreabilidade total.

---

### Camada 1: Foundation (PostgreSQL)

```sql
-- A BASE DE TUDO (3 tabelas principais + 1 auxiliar)

-- TABELA 1: object_definitions (O Genoma)
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- "cliente_pf", "conta_corrente"
    display_name VARCHAR(200),                   -- "Cliente Pessoa Física"
    description TEXT,                            -- Linguagem natural
    version INT DEFAULT 1,

    -- O SCHEMA (estrutura)
    schema JSONB NOT NULL,                       -- JSON Schema Draft 7

    -- AS REGRAS (comportamento)
    rules JSONB DEFAULT '[]'::jsonb,             -- Validações + Enrichments

    -- O CICLO DE VIDA (FSM)
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE"],
        "transitions": []
    }'::jsonb,

    -- DICAS DE UI (como renderizar)
    ui_hints JSONB DEFAULT '{}'::jsonb,          -- Widgets, labels, help text

    -- RELACIONAMENTOS PERMITIDOS
    relationships JSONB DEFAULT '[]'::jsonb,     -- ["TITULAR_DE", "DEPENDENTE_DE"]

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- TABELA 2: instances (As Células Vivas)
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    object_definition_id UUID REFERENCES object_definitions(id),

    -- OS DADOS (flexível, validado contra schema)
    data JSONB NOT NULL,

    -- ESTADO ATUAL (do FSM)
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,

    -- METADADOS
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INT DEFAULT 1,

    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP
);

-- TABELA 3: relationships (As Sinapses)
CREATE TABLE relationships (
    id UUID PRIMARY KEY,
    relationship_type VARCHAR(100) NOT NULL,     -- "TITULAR_DE", "PAI_DE"

    source_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,

    -- PROPRIEDADES DA RELAÇÃO
    properties JSONB DEFAULT '{}'::jsonb,        -- {"porcentagem": 100, "desde": "2024-01-01"}

    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(relationship_type, source_instance_id, target_instance_id)
);

-- TABELA 4: validation_rules (Biblioteca de Validações)
CREATE TABLE validation_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- "cpf_validation"
    description TEXT,
    rule_type VARCHAR(50),                       -- "regex", "function", "api_call"

    -- CONFIGURAÇÃO DA REGRA
    config JSONB NOT NULL,                       -- {"pattern": "^\d{11}$"} ou {"endpoint": "/api/validate-cpf"}

    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES CRÍTICOS (Performance)
CREATE INDEX idx_instances_object_def ON instances(object_definition_id) WHERE is_deleted = false;
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);
CREATE INDEX idx_instances_state ON instances(current_state) WHERE is_deleted = false;
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

### Camada 2: Natural Language Interface (Assistente de Criação)

**NÃO é um chatbot genérico. É um ASSISTENTE ESTRUTURADO.**

#### Fluxo de Criação de Objeto (Linguagem Natural → object_definition)

```typescript
// Componente: ObjectCreationAssistant.tsx
// Usuário: Time de Produto/Compliance (SEM conhecimento técnico)

interface ConversationStep {
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  validator?: (answer: string) => boolean;
}

const objectCreationFlow: ConversationStep[] = [
  {
    question: "Qual o nome do objeto que você quer criar? (Ex: Cliente Pessoa Física, Conta Investimento)",
    type: 'text',
    hint: "Use um nome descritivo que o time de negócio entenda"
  },
  {
    question: "Descreva em suas palavras o que é esse objeto e para que serve.",
    type: 'text',
    hint: "Ex: 'Um cliente pessoa física é uma pessoa que tem conta no banco e precisa passar por KYC'"
  },
  {
    question: "Quais informações precisam ser coletadas? Liste os campos necessários.",
    type: 'text',
    hint: "Ex: CPF, Nome Completo, Data de Nascimento, Endereço, Telefone, Email"
  },
  {
    question: "Algum desses campos tem validação especial do BACEN ou compliance?",
    type: 'multiselect',
    options: ['CPF (validação completa)', 'CNPJ', 'Email', 'Telefone BR', 'CEP', 'Outro']
  },
  {
    question: "Quais são os estados possíveis deste objeto durante seu ciclo de vida?",
    type: 'text',
    hint: "Ex: Cadastro Pendente, Ativo, Bloqueado, Inativo"
  },
  {
    question: "Este objeto se relaciona com quais outros objetos?",
    type: 'text',
    hint: "Ex: Cliente pode ser TITULAR de Conta, PAI de outro Cliente (dependente)"
  },
  {
    question: "Vou mostrar um preview do que será criado. Confirma?",
    type: 'confirm'
  }
];

// BACKEND: Assistant Service (Go)
type AssistantService struct {
    llm          *LLMClient           // Claude/GPT para processar NL
    schemaGen    *SchemaGenerator     // Gera JSON Schema
    validatorLib *ValidatorLibrary    // Biblioteca de validações BACEN
    db           *sql.DB
}

func (s *AssistantService) ProcessConversation(ctx context.Context, answers []string) (*ObjectDefinition, error) {
    // 1. EXTRAÇÃO DE ENTIDADES (NLP)
    prompt := fmt.Sprintf(`
Você é um especialista em modelagem de dados para Core Banking.

O usuário descreveu o seguinte objeto:
Nome: %s
Descrição: %s
Campos mencionados: %s
Validações especiais: %s
Estados: %s
Relacionamentos: %s

Gere um JSON Schema Draft 7 completo, incluindo:
1. Propriedades com tipos corretos (string, number, boolean, object, array)
2. Required fields
3. Patterns para validações (CPF: ^\d{11}$)
4. Enums para campos de seleção
5. Descrições claras em português

Retorne APENAS o JSON válido, sem explicações.
`, answers[0], answers[1], answers[2], answers[3], answers[4], answers[5])

    schema, err := s.llm.Generate(ctx, prompt)
    if err != nil {
        return nil, err
    }

    // 2. GERAÇÃO DE FSM (Finite State Machine)
    states := parseStatesFromNL(answers[4]) // "Pendente, Ativo, Bloqueado" → FSM
    fsm := s.generateFSM(states)

    // 3. MAPEAMENTO DE VALIDAÇÕES
    rules := s.mapValidationRules(answers[3]) // "CPF" → validation_rules.cpf_validation

    // 4. UI HINTS (como renderizar cada campo)
    uiHints := s.generateUIHints(schema)

    // 5. CRIAÇÃO DO object_definition
    objDef := &ObjectDefinition{
        Name:          slugify(answers[0]),
        DisplayName:   answers[0],
        Description:   answers[1],
        Schema:        schema,
        Rules:         rules,
        States:        fsm,
        UIHints:       uiHints,
        Relationships: parseRelationships(answers[5]),
    }

    // 6. VALIDAÇÃO (JSON Schema válido? FSM sem estados órfãos?)
    if err := s.validate(objDef); err != nil {
        return nil, fmt.Errorf("validação falhou: %w", err)
    }

    // 7. PERSISTÊNCIA
    if err := s.db.InsertObjectDefinition(ctx, objDef); err != nil {
        return nil, err
    }

    return objDef, nil
}
```

#### Exemplo de Conversa Real

```
ASSISTENTE: Qual o nome do objeto que você quer criar?

USUÁRIO: Cliente Pessoa Física

ASSISTENTE: Descreva o que é esse objeto.

USUÁRIO: É uma pessoa que vai abrir conta no banco.
         Precisa passar por KYC e validação do BACEN.

ASSISTENTE: Quais informações precisam ser coletadas?

USUÁRIO: CPF, Nome Completo, Data de Nascimento, RG,
         Endereço completo, Telefone, Email, Renda Mensal,
         Profissão

ASSISTENTE: Algum campo tem validação especial?

USUÁRIO: [✓] CPF (validação completa)
         [✓] Email
         [✓] Telefone BR
         [✓] CEP

ASSISTENTE: Quais são os estados do ciclo de vida?

USUÁRIO: Cadastro Iniciado → Documentos Pendentes →
         Em Análise → Aprovado → Ativo → Bloqueado → Inativo

ASSISTENTE: Se relaciona com outros objetos?

USUÁRIO: Sim, Cliente pode ser TITULAR de Conta Corrente,
         e pode ser PAI/MÃE de outros Clientes (dependentes menores)

ASSISTENTE: Perfeito! Vou gerar o objeto. Aqui está o preview:

┌─────────────────────────────────────────────────────────┐
│ 📋 Cliente Pessoa Física                                │
├─────────────────────────────────────────────────────────┤
│ Campos (9):                                             │
│  • CPF (obrigatório, validado)                          │
│  • Nome Completo (obrigatório)                          │
│  • Data Nascimento (obrigatório)                        │
│  • RG (opcional)                                        │
│  • Endereço (objeto: CEP, Rua, Número, Cidade, UF)     │
│  • Telefone (validado BR)                               │
│  • Email (validado)                                     │
│  • Renda Mensal (número, moeda BRL)                     │
│  • Profissão (texto livre)                              │
│                                                         │
│ Estados (7):                                            │
│  CADASTRO_INICIADO → DOCUMENTOS_PENDENTES →             │
│  EM_ANALISE → APROVADO → ATIVO → BLOQUEADO → INATIVO   │
│                                                         │
│ Relacionamentos:                                        │
│  • TITULAR_DE → Conta Corrente (1:N)                    │
│  • PAI_DE → Cliente PF (1:N, dependentes)               │
│                                                         │
│ Validações Automáticas:                                 │
│  ✓ CPF: 11 dígitos + validação algorítmica              │
│  ✓ Email: formato RFC 5322                              │
│  ✓ Telefone: formato BR (DDD + número)                  │
│  ✓ CEP: 8 dígitos + consulta ViaCEP                     │
│  ✓ Idade: >= 18 anos (calculado de data_nascimento)    │
└─────────────────────────────────────────────────────────┘

Confirma a criação? [Sim] [Editar] [Cancelar]

USUÁRIO: [Sim]

ASSISTENTE: ✅ Objeto "Cliente Pessoa Física" criado com sucesso!

            Já pode começar a cadastrar clientes em:
            Front Section → Clientes PF → Novo Cadastro

            O formulário foi gerado automaticamente com
            todos os campos e validações.
```

### Camada 3: Dynamic UI Generation (100% Genérica)

**CRÍTICO**: A UI **NUNCA** sabe o que é "Cliente" ou "Conta". Ela apenas lê `object_definition` e renderiza.

```typescript
// DynamicInstanceForm.tsx
// Este componente renderiza QUALQUER objeto

interface DynamicInstanceFormProps {
  objectDefinitionId: string;  // UUID do objeto a ser instanciado
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function DynamicInstanceForm({ objectDefinitionId, initialData, onSubmit }: DynamicInstanceFormProps) {
  // 1. BUSCA A DEFINIÇÃO DO OBJETO
  const { data: objDef } = useQuery(['object-definition', objectDefinitionId], () =>
    api.get(`/api/object-definitions/${objectDefinitionId}`)
  );

  // 2. ESTADO DO FORMULÁRIO (100% dinâmico)
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 3. VALIDAÇÃO CLIENT-SIDE (usando JSON Schema)
  const validator = useMemo(() => {
    if (!objDef?.schema) return null;
    return new JSONSchemaValidator(objDef.schema);
  }, [objDef]);

  // 4. RENDERIZA CAMPOS DINAMICAMENTE
  if (!objDef) return <Spinner />;

  const fields = Object.entries(objDef.schema.properties || {});
  const required = objDef.schema.required || [];

  return (
    <form onSubmit={(e) => {
      e.preventDefault();

      // Valida antes de enviar
      const validationErrors = validator.validate(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit(formData);
    }}>
      <h2>{objDef.display_name}</h2>
      <p className="text-gray-600">{objDef.description}</p>

      <div className="space-y-6 mt-6">
        {fields.map(([fieldName, fieldSchema]) => {
          const isRequired = required.includes(fieldName);
          const widget = objDef.ui_hints?.widgets?.[fieldName] || inferWidget(fieldSchema);
          const helpText = fieldSchema.description || objDef.ui_hints?.help_text?.[fieldName];

          return (
            <FormField
              key={fieldName}
              label={fieldSchema.title || startCase(fieldName)}
              required={isRequired}
              error={errors[fieldName]}
              helpText={helpText}
            >
              <WidgetRenderer
                widget={widget}
                schema={fieldSchema}
                value={formData[fieldName]}
                onChange={(value) => {
                  setFormData({ ...formData, [fieldName]: value });
                  // Limpa erro quando usuário corrige
                  if (errors[fieldName]) {
                    setErrors({ ...errors, [fieldName]: undefined });
                  }
                }}
              />
            </FormField>
          );
        })}
      </div>

      <div className="flex gap-4 mt-8">
        <Button type="submit" variant="primary">
          Salvar {objDef.display_name}
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// WidgetRenderer.tsx
// Renderiza o widget correto baseado no tipo de campo

function WidgetRenderer({ widget, schema, value, onChange }: WidgetRendererProps) {
  switch (widget) {
    case 'cpf':
      return (
        <InputMask
          mask="999.999.999-99"
          value={value}
          onChange={onChange}
          placeholder="000.000.000-00"
          validator={async (cpf) => {
            // Valida dígitos
            if (!validateCPFDigits(cpf)) return "CPF inválido";

            // Consulta blacklist (validation_rules)
            const isBlacklisted = await api.post('/api/validate', {
              rule: 'cpf_blacklist',
              value: cpf
            });

            if (isBlacklisted) return "CPF não permitido";
            return null;
          }}
        />
      );

    case 'currency':
      return (
        <CurrencyInput
          value={value}
          onChange={onChange}
          currency="BRL"
          locale="pt-BR"
          placeholder="R$ 0,00"
          min={schema.minimum}
          max={schema.maximum}
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          format="dd/MM/yyyy"
          maxDate={schema.maximum ? new Date(schema.maximum) : undefined}
          minDate={schema.minimum ? new Date(schema.minimum) : undefined}
        />
      );

    case 'select':
      return (
        <Select
          value={value}
          onChange={onChange}
          options={(schema.enum || []).map(v => ({ value: v, label: v }))}
          placeholder="Selecione..."
        />
      );

    case 'relationship':
      // Widget CRÍTICO: permite selecionar instância de outro objeto
      return (
        <RelationshipPicker
          targetObjectType={schema.relationshipConfig.targetType}
          relationshipType={schema.relationshipConfig.type}
          value={value}
          onChange={onChange}
          allowMultiple={schema.relationshipConfig.cardinality === 'MANY_TO_MANY'}
        />
      );

    case 'address':
      // Widget composto para endereço BR
      return (
        <AddressInput
          value={value}
          onChange={onChange}
          autoFillFromCEP={true}  // Consulta ViaCEP automaticamente
        />
      );

    case 'phone_br':
      return (
        <InputMask
          mask="(99) 99999-9999"
          value={value}
          onChange={onChange}
          placeholder="(11) 98765-4321"
        />
      );

    case 'text':
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          pattern={schema.pattern}
        />
      );
  }
}
```

### Camada 4: RAG Trimodal (O Sistema Nervoso)

**CRÍTICO**: O RAG precisa entender objetos, instâncias E correlações para responder perguntas.

```python
# rag_brain.py
# O Cérebro que navega pela plataforma

from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class RAGContext:
    """Contexto extraído do sistema para responder uma pergunta"""
    sql_data: List[Dict[str, Any]]      # Dados tabulares (PostgreSQL)
    graph_data: Dict[str, Any]          # Relacionamentos (NebulaGraph)
    vector_data: List[str]              # Documentos similares (PgVector)
    object_definitions: List[Dict]      # Schemas dos objetos envolvidos

class TrimodalRAG:
    def __init__(self, pg_conn, nebula_conn, llm_client):
        self.pg = pg_conn
        self.nebula = nebula_conn
        self.llm = llm_client

    async def answer_question(self, question: str) -> str:
        """
        Pipeline completo de RAG:
        1. Identifica entidades na pergunta
        2. Busca contexto em 3 fontes
        3. Sintetiza resposta com LLM
        """

        # PASSO 1: IDENTIFICAÇÃO DE ENTIDADES
        entities = await self.extract_entities(question)
        # Ex: "Quantos clientes ativos temos?"
        #     → entities = {"object_type": "cliente_pf", "state": "ATIVO"}

        # PASSO 2: BUSCA DE CONTEXTO
        context = RAGContext(
            sql_data=[],
            graph_data={},
            vector_data=[],
            object_definitions=[]
        )

        # 2A. SQL (dados tabulares)
        if entities.get("object_type"):
            obj_def = await self.get_object_definition(entities["object_type"])
            context.object_definitions.append(obj_def)

            # Query dinâmica baseada na pergunta
            query = self.build_sql_query(entities, obj_def)
            # Ex: SELECT COUNT(*) FROM instances
            #     WHERE object_definition_id = 'uuid-cliente-pf'
            #     AND current_state = 'ATIVO'

            context.sql_data = await self.pg.execute(query)

        # 2B. GRAPH (relacionamentos)
        if entities.get("relationship_type"):
            # Ex: "Quais contas Maria Silva possui?"
            #     → Busca no grafo: Maria --TITULAR_DE--> Contas

            graph_query = f"""
                MATCH (source)-[rel:{entities['relationship_type']}]->(target)
                WHERE source.name CONTAINS '{entities.get('source_name', '')}'
                RETURN source, rel, target
                LIMIT 100
            """
            context.graph_data = await self.nebula.execute(graph_query)

        # 2C. VECTOR (documentação e contexto semântico)
        # Busca documentos relevantes (ex: regras BACEN, compliance)
        embedding = await self.llm.embed(question)
        context.vector_data = await self.pg.execute(f"""
            SELECT content, metadata
            FROM document_embeddings
            ORDER BY embedding <=> '{embedding}'
            LIMIT 5
        """)

        # PASSO 3: SÍNTESE COM LLM
        prompt = self.build_prompt(question, context)
        answer = await self.llm.generate(prompt)

        return answer

    def build_prompt(self, question: str, context: RAGContext) -> str:
        """Monta prompt com contexto completo"""

        prompt = f"""Você é um assistente especializado em Core Banking.

PERGUNTA DO USUÁRIO:
{question}

CONTEXTO DISPONÍVEL:

1. OBJETOS DEFINIDOS NO SISTEMA:
{json.dumps(context.object_definitions, indent=2, ensure_ascii=False)}

2. DADOS (SQL):
{json.dumps(context.sql_data, indent=2, ensure_ascii=False)}

3. RELACIONAMENTOS (Grafo):
{json.dumps(context.graph_data, indent=2, ensure_ascii=False)}

4. DOCUMENTAÇÃO RELEVANTE:
{chr(10).join(context.vector_data)}

INSTRUÇÕES:
- Use os dados acima para responder com precisão
- Cite números quando disponíveis
- Se não houver dados suficientes, seja honesto
- Explique de forma clara, sem jargões técnicos
- Se a pergunta envolver relacionamentos, use os dados do grafo

RESPOSTA:"""

        return prompt

    async def get_object_definition(self, name: str) -> Dict:
        """Busca object_definition por nome"""
        result = await self.pg.fetchone(
            "SELECT * FROM object_definitions WHERE name = $1",
            name
        )
        return dict(result)

    async def extract_entities(self, question: str) -> Dict[str, Any]:
        """Usa LLM para extrair entidades da pergunta"""

        # Primeiro, busca todos os object_definitions existentes
        all_objects = await self.pg.fetch(
            "SELECT name, display_name FROM object_definitions WHERE is_active = true"
        )

        object_names = [obj['name'] for obj in all_objects]
        display_names = [obj['display_name'] for obj in all_objects]

        prompt = f"""Você é um extrator de entidades para um sistema de Core Banking.

PERGUNTA: {question}

OBJETOS DISPONÍVEIS NO SISTEMA:
{json.dumps(dict(zip(object_names, display_names)), indent=2, ensure_ascii=False)}

Extraia as seguintes entidades da pergunta (retorne JSON):
- object_type: qual tipo de objeto está sendo perguntado? (use o 'name', não o display_name)
- state: algum estado específico? (ex: ATIVO, BLOQUEADO)
- relationship_type: algum tipo de relacionamento? (ex: TITULAR_DE)
- filters: quaisquer filtros mencionados (ex: saldo > 1000, data >= 2024-01-01)
- aggregation: tipo de agregação (count, sum, avg, min, max)
- time_range: período de tempo mencionado

Retorne APENAS o JSON, sem explicações.
"""

        response = await self.llm.generate(prompt, temperature=0.1)
        return json.loads(response)

    def build_sql_query(self, entities: Dict, obj_def: Dict) -> str:
        """Constrói query SQL dinamicamente baseada nas entidades extraídas"""

        base_query = f"""
            SELECT
                id,
                data,
                current_state,
                created_at,
                updated_at
            FROM instances
            WHERE object_definition_id = '{obj_def['id']}'
              AND is_deleted = false
        """

        # Adiciona filtros de estado
        if entities.get('state'):
            base_query += f"\n  AND current_state = '{entities['state']}'"

        # Adiciona filtros em campos JSONB
        if entities.get('filters'):
            for field, condition in entities['filters'].items():
                # Ex: {"saldo": {"$gt": 1000}}
                if '$gt' in condition:
                    base_query += f"\n  AND (data->>{field})::numeric > {condition['$gt']}"
                elif '$lt' in condition:
                    base_query += f"\n  AND (data->>{field})::numeric < {condition['$lt']}"
                elif '$eq' in condition:
                    base_query += f"\n  AND data->>'{field}' = '{condition['$eq']}'"

        # Adiciona agregação
        if entities.get('aggregation'):
            agg = entities['aggregation']
            if agg == 'count':
                base_query = f"SELECT COUNT(*) as total FROM ({base_query}) subq"
            elif agg == 'sum':
                field = entities.get('aggregation_field', 'valor')
                base_query = f"SELECT SUM((data->>'{field}')::numeric) as total FROM ({base_query}) subq"

        return base_query
```

#### Exemplo de Uso do RAG

```
USUÁRIO: Quantos clientes ativos temos?

RAG PIPELINE:
1. extract_entities() →
   {
     "object_type": "cliente_pf",
     "state": "ATIVO",
     "aggregation": "count"
   }

2. get_object_definition("cliente_pf") →
   {
     "id": "uuid-123",
     "name": "cliente_pf",
     "display_name": "Cliente Pessoa Física",
     "schema": {...}
   }

3. build_sql_query() →
   SELECT COUNT(*) as total
   FROM instances
   WHERE object_definition_id = 'uuid-123'
     AND current_state = 'ATIVO'
     AND is_deleted = false

4. execute() → [{"total": 1247}]

5. llm.generate() →
   "Atualmente temos 1.247 clientes ativos no sistema."

---

USUÁRIO: Quais contas a Maria Silva possui?

RAG PIPELINE:
1. extract_entities() →
   {
     "object_type": "conta_corrente",
     "relationship_type": "TITULAR_DE",
     "source_name": "Maria Silva"
   }

2. nebula.execute() →
   MATCH (cli:Instance)-[rel:TITULAR_DE]->(conta:Instance)
   WHERE cli.data.nome_completo CONTAINS 'Maria Silva'
   RETURN cli, rel, conta

3. graph_data →
   {
     "cliente": {"nome": "Maria Silva", "cpf": "123.456.789-01"},
     "contas": [
       {"numero": "12345-6", "tipo": "Corrente", "saldo": 5000.00},
       {"numero": "98765-4", "tipo": "Poupança", "saldo": 15000.00}
     ]
   }

4. llm.generate() →
   "Maria Silva (CPF 123.456.789-01) possui 2 contas:
    1. Conta Corrente 12345-6 - Saldo: R$ 5.000,00
    2. Conta Poupança 98765-4 - Saldo: R$ 15.000,00"
```

---

## 🎯 IMPLEMENTAÇÃO FASE 1 (Foundation)

### Objetivos Concretos (12 semanas)

#### Semana 1-2: Database + API Básica

**Entregas**:
- [ ] PostgreSQL com 4 tabelas (object_definitions, instances, relationships, validation_rules)
- [ ] Seed com validation_rules BACEN (CPF, CNPJ, email, telefone, CEP)
- [ ] API Go com endpoints:
  - `GET/POST /api/object-definitions`
  - `GET /api/object-definitions/:id`
  - `GET/POST /api/instances`
  - `GET /api/instances/:id`
  - `PUT /api/instances/:id`
  - `POST /api/relationships`
  - `GET /api/relationships?source_id=X`

**Testes**:
```bash
# Criar object_definition via API
curl -X POST http://localhost:8080/api/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {"type": "string", "pattern": "^\\d{11}$"},
        "nome_completo": {"type": "string"}
      },
      "required": ["cpf", "nome_completo"]
    },
    "states": {
      "initial": "ATIVO",
      "states": ["ATIVO", "BLOQUEADO"]
    }
  }'

# Criar instância
curl -X POST http://localhost:8080/api/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "12345678901",
      "nome_completo": "Maria Silva"
    }
  }'

# Verificar validação (CPF inválido deve falhar)
curl -X POST http://localhost:8080/api/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "123",  # ❌ Inválido
      "nome_completo": "Maria Silva"
    }
  }'
# Esperado: HTTP 400 {"error": "validation failed: cpf does not match pattern"}
```

#### Semana 3-4: Assistente de Criação (NL → object_definition)

**Entregas**:
- [ ] Interface de conversa estruturada (7 perguntas)
- [ ] Integração com LLM (Claude/GPT) para gerar JSON Schema
- [ ] Preview do objeto antes de criar
- [ ] Persistência em `object_definitions`

**Teste Real**:
```
Input: Usuário descreve "Cliente PF" em linguagem natural
Output: object_definition criada com:
  - Schema válido (JSON Schema Draft 7)
  - FSM com estados mencionados
  - Validações mapeadas (CPF → validation_rules.cpf_validation)
  - UI hints gerados
```

#### Semana 5-6: Dynamic UI Generation

**Entregas**:
- [ ] Componente `DynamicInstanceForm`
- [ ] Widget library (10 widgets: text, cpf, currency, date, select, relationship, address, phone, email, number)
- [ ] Validação client-side (JSON Schema)
- [ ] Validação server-side (Go)

**Teste Real**:
```
Input: object_definition "cliente_pf"
Output: Formulário renderizado com:
  - Campo CPF com máscara 999.999.999-99
  - Validação em tempo real (dígitos verificadores)
  - Campo Endereço que consulta ViaCEP ao preencher CEP
  - Botão "Salvar" que valida tudo antes de enviar
```

#### Semana 7-8: Relacionamentos + Grafo

**Entregas**:
- [ ] Tabela `relationships`
- [ ] API de relacionamentos
- [ ] Widget `RelationshipPicker`
- [ ] Validação de cardinalidade
- [ ] Visualização React Flow (básica)

**Teste Real**:
```
Cenário: Criar Conta Corrente e vincular a Cliente
1. Usuário cria Cliente (Maria Silva)
2. Usuário cria Conta (12345-6)
3. No campo "Titular", seleciona Maria Silva via RelationshipPicker
4. Backend cria relationship (TITULAR_DE)
5. Grafo mostra: (Maria) --TITULAR_DE--> (Conta 12345-6)
```

#### Semana 9-10: State Machine + Transições

**Entregas**:
- [ ] Editor visual de FSM (React Flow)
- [ ] Validação de FSM (estados órfãos, transições inválidas)
- [ ] Engine de transição de estados
- [ ] Histórico de estados (`state_history` em instances)

**Teste Real**:
```
Cenário: Cliente passa por KYC
1. Cliente criado em estado CADASTRO_PENDENTE
2. Usuário clica "Enviar Documentos" → transição para DOCUMENTOS_ENVIADOS
3. Compliance clica "Aprovar" → transição para ATIVO
4. Sistema registra em state_history: [
     {"state": "CADASTRO_PENDENTE", "timestamp": "2024-01-01T10:00:00Z"},
     {"state": "DOCUMENTOS_ENVIADOS", "timestamp": "2024-01-02T14:30:00Z"},
     {"state": "ATIVO", "timestamp": "2024-01-03T09:15:00Z"}
   ]
```

#### Semana 11-12: RAG Básico + Polish

**Entregas**:
- [ ] Pipeline RAG trimodal (SQL + Graph + Vector)
- [ ] Extração de entidades via LLM
- [ ] Query builder dinâmico
- [ ] Interface de chat para perguntas

**Teste Real**:
```
PERGUNTA: "Quantos clientes cadastrados ontem?"

RAG:
1. Extrai: {"object_type": "cliente_pf", "time_range": "yesterday", "aggregation": "count"}
2. Query: SELECT COUNT(*) FROM instances
          WHERE object_definition_id = 'uuid-cliente-pf'
          AND DATE(created_at) = CURRENT_DATE - 1
3. Resposta: "Foram cadastrados 47 clientes ontem."
```

---

## 📐 PRINCÍPIOS DE CÓDIGO

### 1. Zero Business Logic Hardcoded

```go
// ❌ ERRADO
func ValidateCliente(cliente Cliente) error {
    if len(cliente.CPF) != 11 {
        return errors.New("CPF inválido")
    }
    // ... mais validações hardcoded
}

// ✅ CORRETO
func ValidateInstance(instance Instance, objDef ObjectDefinition) error {
    // Valida contra JSON Schema (genérico)
    schemaLoader := gojsonschema.NewGoLoader(objDef.Schema)
    dataLoader := gojsonschema.NewGoLoader(instance.Data)

    result, err := gojsonschema.Validate(schemaLoader, dataLoader)
    if err != nil {
        return err
    }

    if !result.Valid() {
        return fmt.Errorf("validation failed: %v", result.Errors())
    }

    // Aplica validation_rules (interpretadas)
    for _, ruleRef := range objDef.Rules {
        rule, err := getValidationRule(ruleRef.Name)
        if err != nil {
            return err
        }

        if err := executeRule(rule, instance.Data); err != nil {
            return err
        }
    }

    return nil
}
```

### 2. UI 100% Genérica

```tsx
// ❌ ERRADO (componente específico)
function ClienteForm() {
  return (
    <form>
      <Input name="cpf" mask="999.999.999-99" />
      <Input name="nome_completo" />
      {/* ... campos hardcoded */}
    </form>
  );
}

// ✅ CORRETO (componente genérico)
function DynamicInstanceForm({ objectDefinitionId }: Props) {
  const { data: objDef } = useObjectDefinition(objectDefinitionId);

  return (
    <form>
      {Object.entries(objDef.schema.properties).map(([name, schema]) => (
        <FieldRenderer
          key={name}
          name={name}
          schema={schema}
          uiHint={objDef.ui_hints.widgets[name]}
        />
      ))}
    </form>
  );
}
```

### 3. Validações Interpretadas

```sql
-- validation_rules (pre-seeded)
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_validation', 'regex', '{"pattern": "^\\d{11}$", "error": "CPF deve ter 11 dígitos"}'),
('cpf_blacklist', 'api_call', '{"endpoint": "/api/validate/cpf-blacklist", "method": "POST"}'),
('cpf_receita', 'api_call', '{"endpoint": "https://api.receitafederal.gov.br/cpf", "method": "GET"}'),
('email_format', 'regex', '{"pattern": "^[^@]+@[^@]+\\.[^@]+$"}'),
('phone_br', 'regex', '{"pattern": "^\\d{10,11}$"}'),
('cep_format', 'regex', '{"pattern": "^\\d{8}$"}'),
('idade_minima', 'function', '{"code": "const birthDate = new Date(data.data_nascimento); const age = (new Date() - birthDate) / 31557600000; return age >= 18;", "error": "Idade mínima: 18 anos"}');
```

```go
// Executor de regras (genérico)
func (e *RuleExecutor) Execute(rule ValidationRule, data map[string]interface{}) error {
    switch rule.RuleType {
    case "regex":
        pattern := rule.Config["pattern"].(string)
        fieldValue := extractFieldValue(data, rule.Config["field"].(string))

        matched, _ := regexp.MatchString(pattern, fieldValue)
        if !matched {
            return errors.New(rule.Config["error"].(string))
        }

    case "api_call":
        endpoint := rule.Config["endpoint"].(string)
        resp, err := http.Post(endpoint, "application/json", toJSON(data))
        if err != nil || resp.StatusCode != 200 {
            return errors.New("validation API call failed")
        }

    case "function":
        // Executa JavaScript (V8 engine) ou Lua
        code := rule.Config["code"].(string)
        result := e.jsEngine.Eval(code, data)
        if !result.(bool) {
            return errors.New(rule.Config["error"].(string))
        }
    }

    return nil
}
```

---

## 🚀 CRITÉRIOS DE SUCESSO DA FASE 1

### Teste Final (Semana 12)

**Cenário**: Time de Produto cria "Conta Investimento" e cadastra 100 instâncias.

```
1. CRIAÇÃO DO OBJETO (via Assistente)
   ├─ Usuário responde 7 perguntas em linguagem natural
   ├─ Sistema gera object_definition automaticamente
   ├─ Preview mostra: 15 campos, 5 estados, 2 relacionamentos
   └─ ✅ Objeto criado sem código

2. CADASTRO DE INSTÂNCIAS (via UI Dinâmica)
   ├─ Front Section → Contas Investimento → Novo
   ├─ Formulário renderizado automaticamente
   ├─ Validações funcionam (CPF, valor mínimo, etc)
   ├─ Relacionamento com Cliente via picker
   └─ ✅ 100 instâncias criadas em 30 minutos

3. CONSULTA VIA RAG
   ├─ "Quantas contas de investimento ativas?"
   ├─ RAG consulta instances + object_definitions
   ├─ Resposta: "Existem 87 contas ativas (13 pendentes)"
   └─ ✅ RAG funciona sem hardcoding

4. VISUALIZAÇÃO DO GRAFO
   ├─ Usuário clica em Cliente "João Silva"
   ├─ Grafo mostra: João → TITULAR_DE → 3 Contas Investimento
   ├─ Clica em uma conta → mostra detalhes + histórico de estados
   └─ ✅ Navegação visual funciona
```

**Métricas de Sucesso**:
- ✅ Time de Produto cria objeto completo em < 15 minutos (sem devs)
- ✅ Formulário renderiza todos os tipos de campo corretamente
- ✅ Validações BACEN (CPF, CNPJ) funcionam
- ✅ 100 instâncias criadas sem erros
- ✅ RAG responde 10 perguntas diferentes com precisão > 90%
- ✅ Grafo renderiza até 500 nós sem lag

---

## 🔮 VISÃO DE LONGO PRAZO

### Após Fase 1 (Foundation)

**Fase 2**: Brain (Architect Agent lê docs BACEN e gera object_definitions)
**Fase 3**: Autonomy (Discovery de agentes + Auto-deploy)
**Fase 4**: Production (PIX real + BACEN + 100 clientes beta)

### O Core Banking Emerge

```
Semana 1 da Fase 2:
  → Architect Agent lê "Manual de Normas PIX - BACEN"
  → Gera object_definitions: TransacaoPix, ChavePix, DevolucaoPix
  → Gera FSM: INICIADA → LIQUIDADA → DEVOLVIDA
  → Gera validation_rules: chave_pix_format, valor_limite_noturno
  → ✅ Módulo PIX implementado em 3 dias (zero código manual)

Semana 4 da Fase 2:
  → Architect Agent lê "Resolução 4.753 - KYC"
  → Gera object_definition: ProcessoKYC
  → Gera FSM complexo: 12 estados, 20 transições
  → Gera validation_rules: documento_vigente, foto_biometria
  → ✅ Compliance KYC implementado em 5 dias

Mês 6 (início Fase 3):
  → Sistema descobre necessidade de "Security Agent" (fraude)
  → Auto-gera código do agente (Python template)
  → Deploy automático via Kubernetes
  → ✅ 47 agentes rodando (descobertos dinamicamente)

Mês 9 (Fase 4):
  → Primeiro PIX real processado
  → 100 clientes beta usando o banco
  → 10.000 transações/dia
  → ✅ Core Banking completo, criado em 9 meses
```

---

## 📖 GLOSSÁRIO (Para o Time de Produto)

- **object_definition**: O "molde" ou "DNA" de um tipo de coisa (Cliente, Conta, etc)
- **instance**: Uma coisa real criada a partir do molde (Maria Silva, Conta 12345)
- **relationship**: Conexão entre duas coisas (Maria é TITULAR da Conta 12345)
- **schema**: Descrição da estrutura (quais campos, tipos, obrigatórios)
- **FSM (Finite State Machine)**: Ciclo de vida (PENDENTE → ATIVO → BLOQUEADO)
- **validation_rule**: Regra que valida dados (CPF tem 11 dígitos)
- **RAG (Retrieval Augmented Generation)**: Sistema que busca informações e responde perguntas
- **Widget**: Componente visual para um tipo de campo (máscara de CPF, seletor de data)

---

## 🎬 PRÓXIMOS PASSOS IMEDIATOS

1. **Aprovar este documento** (CLAUDE.md)
2. **Setup do ambiente**:
   - PostgreSQL 15+
   - Go 1.21+
   - Node.js 20+
   - Next.js 14+
3. **Criar repositório Git**
4. **Iniciar Semana 1**: Database schema + API básica
5. **Daily standups** (15 min):
   - O que fiz ontem?
   - O que vou fazer hoje?
   - Algum bloqueio?

---

**Este documento é o contrato entre a visão e a implementação.**

Tudo que está aqui será construído. Zero POCs. Zero mocks. Apenas produção.

**Let's build the future of Core Banking. 🚀**

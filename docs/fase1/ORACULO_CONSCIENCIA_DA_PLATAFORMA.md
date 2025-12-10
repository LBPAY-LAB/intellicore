# O Oráculo - A Consciência da Plataforma

> **"Eu sou a LBPAY. Eu sei quem sou, o que faço, e como opero."**

---

## 🧠 Conceito Fundamental

O **Oráculo** é a **consciência autoconsciente** da plataforma SuperCore. Não é apenas configuração - é a **identidade**, o **conhecimento de si mesmo**, e a **memória institucional** da organização que opera a plataforma.

### O Que É o Oráculo?

O Oráculo é um **objeto especial** do tipo `meta-objeto` que contém:

1. **Identidade Corporativa** - Quem somos (CNPJ, razão social, nome fantasia)
2. **Licenças e Autorizações** - O que podemos fazer (Banco Central, PIX, CIP)
3. **Regras de Negócio Fundamentais** - Como operamos (políticas, limites, processos)
4. **Conhecimento Regulatório** - O que nos governa (BACEN, CVM, LGPD)
5. **Integrações Externas** - Com quem nos conectamos (SPI, CIP, TigerBeetle)
6. **Políticas Internas** - Nossas regras (PLD/FT, risco, crédito)

### Por Que "Oráculo"?

Na mitologia grega, o Oráculo era a fonte de sabedoria e verdade absoluta. Aqui, o Oráculo é:

- **Fonte única da verdade** sobre a identidade e capacidades da plataforma
- **Memória institucional** que nunca esquece quem somos
- **Guia de decisões** para todos os outros objetos e processos
- **Consciência regulatória** que garante conformidade

---

## 🏗️ Arquitetura do Oráculo

### Estrutura de Dados

O Oráculo é composto por **múltiplas instâncias** de diferentes `object_definitions`:

```
oraculo/
├── identidade_corporativa (instance única)
├── licencas_autorizacoes (N instances)
├── integracao_bacen_spi (instance única)
├── integracao_cip (instance única)
├── integracao_tigerbeetle (instance única)
├── politica_pld_ft (instance única)
├── politica_risco_credito (instance única)
├── limites_operacionais (N instances)
└── manuais_regulatorios (N instances - um por circular BACEN)
```

### Relacionamentos

Todos os objetos fundamentais têm relacionamento `GOVERNED_BY` com o Oráculo:

```
conta_corrente --[GOVERNED_BY]--> oraculo/identidade_corporativa
conta_corrente --[GOVERNED_BY]--> oraculo/licencas_autorizacoes
transacao_pix  --[GOVERNED_BY]--> oraculo/integracao_bacen_spi
transacao_pix  --[GOVERNED_BY]--> oraculo/politica_pld_ft
```

---

## 📋 Implementação Técnica

### 1. Object Definition: `identidade_corporativa`

```json
{
  "name": "identidade_corporativa",
  "display_name": "Identidade Corporativa - Oráculo",
  "category": "ORACLE",
  "schema": {
    "type": "object",
    "required": [
      "cnpj",
      "razao_social",
      "nome_fantasia",
      "inscricao_estadual",
      "data_fundacao",
      "endereco_sede"
    ],
    "properties": {
      "cnpj": {
        "type": "string",
        "pattern": "^\\d{14}$",
        "description": "CNPJ da instituição"
      },
      "razao_social": {
        "type": "string",
        "description": "Razão social registrada"
      },
      "nome_fantasia": {
        "type": "string",
        "description": "Nome fantasia (ex: LBPAY)"
      },
      "inscricao_estadual": {
        "type": "string",
        "description": "Inscrição estadual"
      },
      "data_fundacao": {
        "type": "string",
        "format": "date",
        "description": "Data de fundação"
      },
      "endereco_sede": {
        "type": "object",
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
          "secundaria": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"},
          "terciaria": {"type": "string", "pattern": "^#[0-9A-Fa-f]{6}$"}
        }
      }
    }
  },
  "states": {
    "initial": "ACTIVE",
    "states": ["ACTIVE"],
    "transitions": []
  },
  "ui_hints": {
    "singleton": true,
    "read_only": false,
    "icon": "building",
    "color": "blue"
  }
}
```

### 2. Object Definition: `licenca_bacen`

```json
{
  "name": "licenca_bacen",
  "display_name": "Licença/Autorização BACEN - Oráculo",
  "category": "ORACLE",
  "schema": {
    "type": "object",
    "required": [
      "tipo_autorizacao",
      "numero_autorizacao",
      "data_concessao",
      "status"
    ],
    "properties": {
      "tipo_autorizacao": {
        "type": "string",
        "enum": [
          "INSTITUICAO_PAGAMENTO",
          "PARTICIPANTE_PIX_DIRETO",
          "PARTICIPANTE_PIX_INDIRETO",
          "SCD_TIPO_I",
          "SCD_TIPO_II",
          "CORRESPONDENTE_BANCARIO",
          "AGENTE_FINANCEIRO"
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
        "format": "date",
        "description": "Data de validade (se aplicável)"
      },
      "status": {
        "type": "string",
        "enum": ["ATIVA", "SUSPENSA", "CANCELADA", "EM_RENOVACAO"]
      },
      "condicoes_operacionais": {
        "type": "object",
        "properties": {
          "limite_saldo_contas": {
            "type": "number",
            "description": "Limite de saldo por conta (BRL)"
          },
          "limite_transacao_individual": {
            "type": "number",
            "description": "Limite por transação (BRL)"
          },
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
      },
      "responsavel_tecnico": {
        "type": "object",
        "properties": {
          "nome": {"type": "string"},
          "cpf": {"type": "string", "pattern": "^\\d{11}$"},
          "cargo": {"type": "string"},
          "email": {"type": "string", "format": "email"}
        }
      }
    }
  },
  "states": {
    "initial": "ATIVA",
    "states": ["ATIVA", "SUSPENSA", "CANCELADA", "EM_RENOVACAO"],
    "transitions": [
      {"from": "ATIVA", "to": "SUSPENSA"},
      {"from": "SUSPENSA", "to": "ATIVA"},
      {"from": "ATIVA", "to": "CANCELADA"},
      {"from": "ATIVA", "to": "EM_RENOVACAO"},
      {"from": "EM_RENOVACAO", "to": "ATIVA"}
    ]
  },
  "ui_hints": {
    "icon": "shield-check",
    "color": "green"
  }
}
```

### 3. Object Definition: `integracao_bacen_spi`

```json
{
  "name": "integracao_bacen_spi",
  "display_name": "Integração BACEN SPI (PIX) - Oráculo",
  "category": "ORACLE",
  "schema": {
    "type": "object",
    "required": [
      "ispb",
      "participant_type",
      "api_endpoint",
      "certificate_path"
    ],
    "properties": {
      "ispb": {
        "type": "string",
        "pattern": "^\\d{8}$",
        "description": "ISPB da instituição"
      },
      "participant_type": {
        "type": "string",
        "enum": ["DIRETO", "INDIRETO"]
      },
      "api_endpoint": {
        "type": "string",
        "format": "uri",
        "description": "URL do SPI (produção ou homologação)"
      },
      "certificate_path": {
        "type": "string",
        "description": "Caminho do certificado ICP-Brasil"
      },
      "key_path": {
        "type": "string",
        "description": "Caminho da chave privada"
      },
      "ambiente": {
        "type": "string",
        "enum": ["PRODUCAO", "HOMOLOGACAO"]
      },
      "limites_operacionais": {
        "type": "object",
        "properties": {
          "limite_diurno": {
            "type": "number",
            "description": "Limite diário (06h-20h) em BRL"
          },
          "limite_noturno": {
            "type": "number",
            "description": "Limite noturno (20h-06h) em BRL - máx 1.000"
          },
          "limite_por_transacao": {
            "type": "number",
            "description": "Limite por transação em BRL"
          }
        }
      },
      "tipos_chave_suportados": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["CPF", "CNPJ", "EMAIL", "TELEFONE", "EVP"]
        }
      },
      "servicos_ativos": {
        "type": "object",
        "properties": {
          "dict": {"type": "boolean", "description": "DICT ativo"},
          "pix_send": {"type": "boolean", "description": "Envio PIX ativo"},
          "pix_receive": {"type": "boolean", "description": "Recebimento PIX ativo"},
          "pix_devolucao": {"type": "boolean", "description": "Devolução ativa"},
          "qr_code_estatico": {"type": "boolean"},
          "qr_code_dinamico": {"type": "boolean"}
        }
      },
      "webhook_url": {
        "type": "string",
        "format": "uri",
        "description": "URL para notificações do SPI"
      }
    }
  },
  "states": {
    "initial": "CONFIGURADO",
    "states": ["CONFIGURADO", "ATIVO", "SUSPENSO", "DESATIVADO"],
    "transitions": [
      {"from": "CONFIGURADO", "to": "ATIVO"},
      {"from": "ATIVO", "to": "SUSPENSO"},
      {"from": "SUSPENSO", "to": "ATIVO"},
      {"from": "ATIVO", "to": "DESATIVADO"}
    ]
  },
  "ui_hints": {
    "singleton": true,
    "icon": "arrow-right-arrow-left",
    "color": "purple"
  }
}
```

### 4. Object Definition: `integracao_tigerbeetle`

```json
{
  "name": "integracao_tigerbeetle",
  "display_name": "Integração TigerBeetle Ledger - Oráculo",
  "category": "ORACLE",
  "schema": {
    "type": "object",
    "required": ["cluster_id", "replica_addresses", "ledger_id"],
    "properties": {
      "cluster_id": {
        "type": "integer",
        "description": "ID do cluster TigerBeetle"
      },
      "ledger_id": {
        "type": "integer",
        "description": "ID do ledger (1 = BRL)"
      },
      "replica_addresses": {
        "type": "array",
        "items": {
          "type": "string",
          "description": "Endereço replica (tcp://host:port)"
        },
        "minItems": 1
      },
      "connection_pool": {
        "type": "object",
        "properties": {
          "max_connections": {"type": "integer", "default": 10},
          "timeout_ms": {"type": "integer", "default": 3000}
        }
      },
      "account_codes": {
        "type": "object",
        "description": "Mapeamento de códigos de contas",
        "properties": {
          "cliente_conta_corrente": {"type": "integer"},
          "cliente_conta_poupanca": {"type": "integer"},
          "banco_caixa": {"type": "integer"},
          "banco_compensacao": {"type": "integer"},
          "receita_tarifa": {"type": "integer"},
          "despesa_pix": {"type": "integer"}
        }
      },
      "flags_padrao": {
        "type": "object",
        "properties": {
          "linked": {"type": "boolean", "default": false},
          "pending": {"type": "boolean", "default": false},
          "posted": {"type": "boolean", "default": true}
        }
      }
    }
  },
  "states": {
    "initial": "CONFIGURADO",
    "states": ["CONFIGURADO", "CONECTADO", "DESCONECTADO", "ERRO"],
    "transitions": [
      {"from": "CONFIGURADO", "to": "CONECTADO"},
      {"from": "CONECTADO", "to": "DESCONECTADO"},
      {"from": "DESCONECTADO", "to": "CONECTADO"},
      {"from": "CONECTADO", "to": "ERRO"},
      {"from": "ERRO", "to": "CONFIGURADO"}
    ]
  },
  "ui_hints": {
    "singleton": true,
    "icon": "database",
    "color": "orange"
  }
}
```

### 5. Object Definition: `politica_pld_ft`

```json
{
  "name": "politica_pld_ft",
  "display_name": "Política PLD/FT - Oráculo",
  "category": "ORACLE",
  "schema": {
    "type": "object",
    "properties": {
      "versao": {
        "type": "string",
        "description": "Versão da política (ex: 2024.1)"
      },
      "data_vigencia": {
        "type": "string",
        "format": "date"
      },
      "responsavel_compliance": {
        "type": "object",
        "properties": {
          "nome": {"type": "string"},
          "cpf": {"type": "string"},
          "email": {"type": "string", "format": "email"},
          "telefone": {"type": "string"}
        }
      },
      "limites_transacionais": {
        "type": "object",
        "properties": {
          "deposito_dinheiro_dia": {
            "type": "number",
            "description": "Limite de depósito em dinheiro por dia (BRL)",
            "default": 50000
          },
          "saque_dinheiro_dia": {
            "type": "number",
            "default": 50000
          },
          "transferencia_internacional_mensal": {
            "type": "number",
            "default": 100000
          }
        }
      },
      "due_diligence": {
        "type": "object",
        "properties": {
          "kyc_basico_obrigatorio": {"type": "boolean", "default": true},
          "kyc_aprimorado_valor_minimo": {
            "type": "number",
            "description": "Valor mínimo para KYC aprimorado (BRL)",
            "default": 10000
          },
          "documento_renda_obrigatorio_acima": {
            "type": "number",
            "default": 50000
          }
        }
      },
      "monitoramento_continuo": {
        "type": "object",
        "properties": {
          "analise_tempo_real": {"type": "boolean", "default": true},
          "score_minimo_aprovacao_automatica": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "default": 70
          },
          "score_maximo_bloqueio_automatico": {
            "type": "integer",
            "default": 30
          }
        }
      },
      "listas_restritivas": {
        "type": "object",
        "properties": {
          "verificar_pep": {"type": "boolean", "default": true},
          "verificar_ofac": {"type": "boolean", "default": true},
          "verificar_un": {"type": "boolean", "default": true},
          "verificar_ue": {"type": "boolean", "default": true}
        }
      },
      "comunicacao_coaf": {
        "type": "object",
        "properties": {
          "envio_automatico_suspeitas": {"type": "boolean", "default": true},
          "valor_minimo_comunicacao": {
            "type": "number",
            "default": 10000
          },
          "prazo_maximo_comunicacao_dias": {
            "type": "integer",
            "default": 24
          }
        }
      },
      "conservacao_documentos": {
        "type": "object",
        "properties": {
          "periodo_minimo_anos": {
            "type": "integer",
            "default": 5
          },
          "formato_armazenamento": {
            "type": "string",
            "enum": ["DIGITAL", "FISICO", "AMBOS"],
            "default": "DIGITAL"
          }
        }
      },
      "treinamento_obrigatorio": {
        "type": "object",
        "properties": {
          "periodicidade_meses": {"type": "integer", "default": 12},
          "carga_horaria_minima": {"type": "integer", "default": 8}
        }
      }
    }
  },
  "states": {
    "initial": "VIGENTE",
    "states": ["VIGENTE", "EM_REVISAO", "OBSOLETA"],
    "transitions": [
      {"from": "VIGENTE", "to": "EM_REVISAO"},
      {"from": "EM_REVISAO", "to": "VIGENTE"},
      {"from": "VIGENTE", "to": "OBSOLETA"}
    ]
  },
  "ui_hints": {
    "singleton": true,
    "icon": "shield",
    "color": "red"
  }
}
```

---

## 🎯 Como o Oráculo é Usado

### 1. Na Inicialização da Plataforma

```javascript
// Ao iniciar, o sistema "acorda" e lê o Oráculo
async function initializePlatform() {
  const identidade = await oracle.get('identidade_corporativa');
  const licencas = await oracle.getAll('licenca_bacen');
  const integracoes = await oracle.getIntegrations();

  console.log(`🧠 Eu sou ${identidade.nome_fantasia}`);
  console.log(`📋 CNPJ: ${identidade.cnpj}`);
  console.log(`✅ Licenças ativas: ${licencas.filter(l => l.status === 'ATIVA').length}`);

  // Configura integrações baseado no Oráculo
  await configureTigerBeetle(integracoes.tigerbeetle);
  await configureBACENSPI(integracoes.bacen_spi);

  console.log('✅ Plataforma consciente e operacional');
}
```

### 2. Na Validação de Transações

```javascript
async function validarTransacaoPIX(transacao) {
  // Consulta o Oráculo para saber os limites
  const integracao_spi = await oracle.get('integracao_bacen_spi');
  const politica_pld = await oracle.get('politica_pld_ft');
  const licenca_pix = await oracle.getLicenca('PARTICIPANTE_PIX_DIRETO');

  // Verifica se temos licença ativa
  if (licenca_pix.status !== 'ATIVA') {
    throw new Error('Licença PIX não está ativa');
  }

  // Valida contra limites do Oráculo
  const hora = new Date().getHours();
  const limite = (hora >= 20 || hora < 6)
    ? integracao_spi.limites_operacionais.limite_noturno
    : integracao_spi.limites_operacionais.limite_diurno;

  if (transacao.valor > limite) {
    throw new Error(`Limite excedido: máximo ${limite}`);
  }

  // Valida PLD/FT
  if (transacao.valor > politica_pld.monitoramento_continuo.valor_minimo_analise) {
    await executarAnalisePLD(transacao);
  }

  return true;
}
```

### 3. Na Interface do Usuário

```jsx
// O header sempre mostra a identidade do Oráculo
function AppHeader() {
  const identidade = useOracle('identidade_corporativa');

  return (
    <header style={{ backgroundColor: identidade.cores_institucionais.primaria }}>
      <img src={identidade.logo_url} alt={identidade.nome_fantasia} />
      <h1>{identidade.nome_fantasia}</h1>
      <p>CNPJ: {formatCNPJ(identidade.cnpj)}</p>
    </header>
  );
}
```

### 4. No Assistente de IA

```
User: Posso fazer um PIX de R$ 5.000 às 22h?
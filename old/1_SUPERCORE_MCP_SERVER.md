# SuperCore MCP Server - Especificação Completa

**Status**: 🟡 Em Revisão
**Versão**: 1.0.0
**Data**: 2025-12-11
**Fase de Implementação**: Fase 1 (com MCP desde o início)

---

## 📚 Referências Obrigatórias

> **⚠️ DOCUMENTOS PRIMÁRIOS**:
>
> 1. **[CLAUDE.md](CLAUDE.md)** - Guia definitivo de implementação
> 2. **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](docs/architecture/VISAO_FINAL_CONSOLIDADA.md)** - Arquitetura consolidada
> 3. **[docs/fases/fase1/01_especificacoes.md](docs/fases/fase1/01_especificacoes.md)** - Especificações Fase 1
> 4. **[Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)** - Protocolo MCP oficial

---

## 1. O Que é o MCP Server do SuperCore?

### 1.1 Visão Geral

O **SuperCore MCP Server** é um servidor que implementa o **Model Context Protocol (MCP)** da Anthropic, expondo recursos e ferramentas do SuperCore para que LLMs (como Claude) possam:

1. **Consultar dados estruturados**: object_definitions, instances, relationships, oracle_config
2. **Executar operações**: criar contextos, processar PDFs, analisar diagramas, criar object_definitions
3. **Acessar conhecimento**: RAG trimodal (SQL + Graph + Vector), manuais BACEN, regras regulatórias

### 1.2 Por Que MCP é Fundamental para o SuperCore?

| Problema Sem MCP | Solução Com MCP |
|------------------|-----------------|
| LLM precisa de API docs atualizadas | MCP expõe recursos automaticamente com schemas |
| Chamadas HTTP manuais (verbose, error-prone) | MCP Tools abstraem complexidade |
| Context window limitado (resumos genéricos) | MCP Resources fornecem contexto estruturado sob demanda |
| Múltiplas integrações (APIs diferentes) | MCP unifica acesso via protocolo padrão |
| Difícil orquestração (múltiplas APIs) | MCP Prompts reutilizáveis |

### 1.3 Arquitetura Híbrida: MCP + REST API

```
┌──────────────────────────────────────────────────────────────┐
│  SUPERCORE PLATFORM                                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  REST API (Go 1.21+)                                 │    │
│  │  - Endpoints para aplicações (LBPAY, frontends)     │    │
│  │  - CRUD de instances, relationships                 │    │
│  │  - Upload de arquivos, processamento                │    │
│  │  - Porta: 8080                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MCP SERVER (Go 1.21+ ou Python 3.11+)              │    │
│  │  - Expõe Resources (oracle_config, instances, etc)  │    │
│  │  - Expõe Tools (process_context, create_object_def) │    │
│  │  - Expõe Prompts (reutilizáveis)                    │    │
│  │  - Protocolo: stdio ou HTTP (SSE)                   │    │
│  │  - Porta: 8090 (se HTTP)                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  CORE SERVICES                                       │    │
│  │  - PostgreSQL (instances, object_definitions)       │    │
│  │  - NebulaGraph (relationships)                      │    │
│  │  - pgvector (embeddings RAG)                        │    │
│  │  - Redis (task queue)                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                          ↑ MCP Protocol
                          │
┌──────────────────────────────────────────────────────────────┐
│  MCP CLIENTS                                                  │
├──────────────────────────────────────────────────────────────┤
│  1. Claude Desktop App                                        │
│  2. Claude.ai Web Interface                                   │
│  3. Anthropic API (via SDK)                                   │
│  4. Custom AI Agents (Architect Agent, Compliance Agent)      │
└──────────────────────────────────────────────────────────────┘
```

**Separação de Responsabilidades**:
- **REST API**: Aplicações (LBPAY, frontends) usam REST para operações CRUD
- **MCP Server**: LLMs (Claude, agents) usam MCP para acesso inteligente e orquestração

---

## 2. MCP Resources (Read-Only Data)

Resources são **dados estruturados** que o LLM pode consultar sob demanda (não vão no context inicial).

### 2.1 Resource: `oracle://config`

**Descrição**: Configuração completa do Oráculo (identidade, licenças, integrações, políticas).

**URI**: `oracle://config`

**Tipo MIME**: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "identity": {
      "type": "object",
      "properties": {
        "cnpj": {"type": "string"},
        "razao_social": {"type": "string"},
        "nome_fantasia": {"type": "string"},
        "ispb": {"type": "string"},
        "tipo_instituicao": {"type": "string"}
      }
    },
    "licenses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "orgao_regulador": {"type": "string"},
          "tipo": {"type": "string"},
          "numero_autorizacao": {"type": "string"},
          "data_vigencia": {"type": "string", "format": "date"}
        }
      }
    },
    "integrations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nome": {"type": "string"},
          "tipo": {"type": "string"},
          "endpoint": {"type": "string"},
          "status": {"type": "string"}
        }
      }
    },
    "policies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tipo": {"type": "string"},
          "descricao": {"type": "string"}
        }
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude consulta o Oráculo via MCP
const oracleConfig = await mcpClient.readResource("oracle://config");
console.log(`Eu sou ${oracleConfig.identity.nome_fantasia}`);
console.log(`CNPJ: ${oracleConfig.identity.cnpj}`);
console.log(`Licenças: ${oracleConfig.licenses.length}`);
```

---

### 2.2 Resource: `instances://{object_type}`

**Descrição**: Lista de instances de um object_definition específico.

**URI**: `instances://cliente_pf`, `instances://conta_corrente`, `instances://transacao_pix`

**Tipo MIME**: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "object_type": {"type": "string"},
    "total_count": {"type": "integer"},
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "data": {"type": "object"},
          "current_state": {"type": "string"},
          "created_at": {"type": "string"},
          "updated_at": {"type": "string"}
        }
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude consulta todos os clientes ativos
const clientesAtivos = await mcpClient.readResource(
  "instances://cliente_pf",
  { filters: { current_state: "ATIVO" } }
);

console.log(`Total de clientes ativos: ${clientesAtivos.total_count}`);
```

---

### 2.3 Resource: `object-definitions://all`

**Descrição**: Lista de todos os object_definitions criados no sistema.

**URI**: `object-definitions://all`

**Tipo MIME**: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "total_count": {"type": "integer"},
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "display_name": {"type": "string"},
          "description": {"type": "string"},
          "schema": {"type": "object"},
          "states": {"type": "object"},
          "relationships": {"type": "array"}
        }
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude descobre quais objetos existem no sistema
const objectDefs = await mcpClient.readResource("object-definitions://all");

objectDefs.items.forEach(def => {
  console.log(`- ${def.display_name} (${def.name}): ${def.description}`);
});
```

---

### 2.4 Resource: `uploaded-files://{context_id}`

**Descrição**: Lista de arquivos uploaded em um contexto específico (Fase 1).

**URI**: `uploaded-files://uuid-123`

**Tipo MIME**: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "context_id": {"type": "string"},
    "files": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "filename": {"type": "string"},
          "file_type": {"type": "string"},
          "file_size": {"type": "integer"},
          "storage_path": {"type": "string"},
          "processing_status": {"type": "string"}
        }
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude consulta quais arquivos foram uploaded
const files = await mcpClient.readResource("uploaded-files://uuid-123");

files.files.forEach(f => {
  console.log(`- ${f.filename} (${f.file_type}): ${f.processing_status}`);
});
```

---

### 2.5 Resource: `context-results://{context_id}`

**Descrição**: Resultado processado de um contexto (processed_data).

**URI**: `context-results://uuid-123`

**Tipo MIME**: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "context_id": {"type": "string"},
    "status": {"type": "string"},
    "processed_data": {
      "type": "object",
      "properties": {
        "pdfs": {"type": "array"},
        "diagrams": {"type": "array"},
        "prompt": {"type": "string"}
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude consulta resultado de processamento
const result = await mcpClient.readResource("context-results://uuid-123");

console.log(`Status: ${result.status}`);
console.log(`PDFs processados: ${result.processed_data.pdfs.length}`);
console.log(`Diagramas analisados: ${result.processed_data.diagrams.length}`);
```

---

## 3. MCP Tools (Actions)

Tools são **operações executáveis** que o LLM pode invocar para modificar estado ou acionar processamento.

### 3.1 Tool: `create_context`

**Descrição**: Cria um novo contexto de upload (equivalente a POST /api/v1/context/upload).

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome descritivo do contexto"
    },
    "description": {
      "type": "string",
      "description": "Descrição detalhada"
    },
    "super_prompt": {
      "type": "string",
      "description": "Super prompt descrevendo a solução desejada (min 100 caracteres)"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Tags para categorização (ex: ['pix', 'bacen', 'compliance'])"
    }
  },
  "required": ["super_prompt"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "status": {"type": "string"},
    "created_at": {"type": "string"}
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude cria contexto para processar Circular 3.978
const context = await mcpClient.callTool("create_context", {
  name: "Circular 3.978 - PLD/FT",
  super_prompt: `
    Criar object_definitions para implementar compliance com Circular 3.978 do BACEN.
    Incluir validações de PLD/FT, limites transacionais, e análise de risco.
  `,
  tags: ["bacen", "pld", "compliance"]
});

console.log(`Contexto criado: ${context.id}`);
```

---

### 3.2 Tool: `upload_file`

**Descrição**: Faz upload de um arquivo para um contexto existente.

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "description": "ID do contexto onde o arquivo será uploaded"
    },
    "file_content": {
      "type": "string",
      "description": "Conteúdo do arquivo em base64"
    },
    "filename": {
      "type": "string",
      "description": "Nome original do arquivo"
    },
    "file_type": {
      "type": "string",
      "enum": ["pdf", "png", "jpg", "svg", "txt", "md"],
      "description": "Tipo do arquivo"
    }
  },
  "required": ["context_id", "file_content", "filename", "file_type"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "file_id": {"type": "string"},
    "filename": {"type": "string"},
    "file_size": {"type": "integer"},
    "storage_path": {"type": "string"}
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude faz upload de Circular 3.978 PDF
const file = await mcpClient.callTool("upload_file", {
  context_id: "uuid-123",
  file_content: base64PDFContent,
  filename: "circular_3978.pdf",
  file_type: "pdf"
});

console.log(`Arquivo uploaded: ${file.filename} (${file.file_size} bytes)`);
```

---

### 3.3 Tool: `process_context`

**Descrição**: Aciona processamento de um contexto (extração de PDFs, análise de diagramas).

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "description": "ID do contexto a ser processado"
    }
  },
  "required": ["context_id"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "job_id": {"type": "string"},
    "status": {"type": "string"},
    "estimated_duration_seconds": {"type": "integer"}
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude aciona processamento
const job = await mcpClient.callTool("process_context", {
  context_id: "uuid-123"
});

console.log(`Processamento iniciado: ${job.job_id}`);
console.log(`Duração estimada: ${job.estimated_duration_seconds}s`);
```

---

### 3.4 Tool: `wait_for_processing`

**Descrição**: Aguarda conclusão do processamento (polling interno).

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "description": "ID do contexto sendo processado"
    },
    "timeout_seconds": {
      "type": "integer",
      "default": 300,
      "description": "Timeout máximo de espera (padrão: 5 minutos)"
    }
  },
  "required": ["context_id"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "status": {"type": "string"},
    "processing_duration_seconds": {"type": "number"},
    "result_summary": {
      "type": "object",
      "properties": {
        "pdfs_processed": {"type": "integer"},
        "diagrams_analyzed": {"type": "integer"}
      }
    }
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude aguarda processamento concluir
const result = await mcpClient.callTool("wait_for_processing", {
  context_id: "uuid-123",
  timeout_seconds: 180
});

console.log(`Status: ${result.status}`);
console.log(`PDFs processados: ${result.result_summary.pdfs_processed}`);
```

---

### 3.5 Tool: `create_object_definition` (Fase 2+)

**Descrição**: Cria um novo object_definition baseado em contexto processado.

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome técnico (slug, ex: cliente_pf)"
    },
    "display_name": {
      "type": "string",
      "description": "Nome amigável (ex: Cliente Pessoa Física)"
    },
    "description": {
      "type": "string",
      "description": "Descrição do objeto"
    },
    "schema": {
      "type": "object",
      "description": "JSON Schema Draft 7"
    },
    "states": {
      "type": "object",
      "description": "FSM (initial, states, transitions)"
    },
    "relationships": {
      "type": "array",
      "description": "Relacionamentos permitidos"
    },
    "ui_hints": {
      "type": "object",
      "description": "Hints para renderização de UI"
    }
  },
  "required": ["name", "display_name", "schema"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "display_name": {"type": "string"}
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude cria object_definition "cliente_pf" a partir de contexto processado
const objDef = await mcpClient.callTool("create_object_definition", {
  name: "cliente_pf",
  display_name: "Cliente Pessoa Física",
  description: "Cliente pessoa física com KYC BACEN",
  schema: {
    type: "object",
    properties: {
      cpf: {type: "string", pattern: "^\\d{11}$"},
      nome_completo: {type: "string"}
    },
    required: ["cpf", "nome_completo"]
  },
  states: {
    initial: "CADASTRO_PENDENTE",
    states: ["CADASTRO_PENDENTE", "ATIVO", "BLOQUEADO"],
    transitions: [
      {from: "CADASTRO_PENDENTE", to: "ATIVO", trigger: "aprovar_kyc"}
    ]
  }
});

console.log(`Object definition criado: ${objDef.id}`);
```

---

### 3.6 Tool: `rag_query`

**Descrição**: Consulta RAG trimodal (SQL + Graph + Vector) para responder perguntas.

**Parâmetros**:
```json
{
  "type": "object",
  "properties": {
    "question": {
      "type": "string",
      "description": "Pergunta em linguagem natural"
    },
    "context_filters": {
      "type": "object",
      "description": "Filtros para contexto (ex: apenas manuais BACEN vigentes)",
      "properties": {
        "object_types": {"type": "array", "items": {"type": "string"}},
        "states": {"type": "array", "items": {"type": "string"}},
        "date_range": {"type": "object"}
      }
    }
  },
  "required": ["question"]
}
```

**Retorno**:
```json
{
  "type": "object",
  "properties": {
    "answer": {"type": "string"},
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {"type": "string"},
          "id": {"type": "string"},
          "title": {"type": "string"},
          "relevance_score": {"type": "number"}
        }
      }
    },
    "context_used": {"type": "string"}
  }
}
```

**Exemplo de Uso**:
```typescript
// Claude consulta RAG sobre limites PIX
const ragResult = await mcpClient.callTool("rag_query", {
  question: "Qual o limite de PIX no horário noturno segundo o BACEN?",
  context_filters: {
    object_types: ["manual_bacen", "regra_bacen"],
    states: ["VIGENTE"]
  }
});

console.log(`Resposta: ${ragResult.answer}`);
console.log(`Fontes consultadas: ${ragResult.sources.length}`);
```

---

## 4. MCP Prompts (Reutilizáveis)

Prompts são **templates reutilizáveis** que o LLM pode invocar para tarefas comuns.

### 4.1 Prompt: `process-bacen-circular`

**Descrição**: Processa uma Circular BACEN e gera object_definitions/regras.

**Argumentos**:
```json
{
  "type": "object",
  "properties": {
    "circular_number": {
      "type": "string",
      "description": "Número da Circular (ex: 3.978)"
    },
    "pdf_url": {
      "type": "string",
      "description": "URL do PDF da Circular"
    }
  },
  "required": ["circular_number"]
}
```

**Template**:
```
Você é um especialista em regulamentação BACEN.

Tarefa: Processar Circular BACEN {{circular_number}} e extrair:

1. **Metadados**:
   - Data de publicação
   - Título completo
   - Assunto principal

2. **Regras Executáveis**:
   - Identificar todas as regras que podem ser expressas como condições
   - Formato: "SE <condição> ENTÃO <ação>"
   - Incluir referência à seção do manual (rastreabilidade)

3. **Object Definitions Sugeridos**:
   - Quais objetos de negócio são mencionados?
   - Quais campos cada objeto deve ter?
   - Quais validações BACEN se aplicam?

4. **Relacionamentos**:
   - Quais objetos se relacionam entre si?
   - Tipo de relacionamento (1:1, 1:N, N:M)

5. **FSMs (Ciclos de Vida)**:
   - Quais estados cada objeto pode ter?
   - Quais transições são permitidas?

Contexto:
{{#if pdf_url}}
PDF disponível em: {{pdf_url}}
{{else}}
Use RAG para consultar conteúdo da Circular {{circular_number}}
{{/if}}

Formato de Saída: JSON estruturado conforme schemas do SuperCore.
```

---

### 4.2 Prompt: `generate-object-from-diagram`

**Descrição**: Gera object_definition a partir de um diagrama.

**Argumentos**:
```json
{
  "type": "object",
  "properties": {
    "diagram_image_url": {
      "type": "string",
      "description": "URL da imagem do diagrama"
    },
    "diagram_description": {
      "type": "string",
      "description": "Descrição opcional do diagrama"
    }
  },
  "required": ["diagram_image_url"]
}
```

**Template**:
```
Você é um arquiteto de dados especializado em modelagem.

Tarefa: Analisar o diagrama fornecido e gerar object_definitions completos.

Diagrama: {{diagram_image_url}}
{{#if diagram_description}}
Descrição: {{diagram_description}}
{{/if}}

Passos:
1. Identifique todas as entidades no diagrama
2. Para cada entidade, extraia:
   - Atributos (campos)
   - Tipos de dados
   - Campos obrigatórios vs opcionais
3. Identifique relacionamentos:
   - De qual entidade para qual
   - Tipo (1:1, 1:N, N:M)
   - Nome do relacionamento
4. Identifique fluxos (se aplicável):
   - Estados possíveis
   - Transições permitidas

Formato de Saída: JSON Schema Draft 7 + FSM para cada entidade.
```

---

### 4.3 Prompt: `compliance-validation`

**Descrição**: Valida se uma instance está em compliance com regras BACEN.

**Argumentos**:
```json
{
  "type": "object",
  "properties": {
    "instance_id": {
      "type": "string",
      "description": "ID da instance a validar"
    },
    "object_type": {
      "type": "string",
      "description": "Tipo do objeto (ex: transacao_pix)"
    }
  },
  "required": ["instance_id", "object_type"]
}
```

**Template**:
```
Você é um auditor de compliance BACEN.

Tarefa: Validar se a instance {{instance_id}} (tipo: {{object_type}}) está em compliance com todas as regras BACEN vigentes.

Passos:
1. Consultar instance via MCP Resource: instances://{{object_type}}/{{instance_id}}
2. Buscar regras BACEN aplicáveis via RAG (domínio: {{object_type}}, estado: VIGENTE)
3. Para cada regra:
   - Avaliar se a instance respeita a condição
   - Se violar, buscar fundamentação legal (manual fonte)
4. Gerar relatório de compliance:
   - ✅ Regras respeitadas
   - ❌ Regras violadas (com fundamentação legal)

Formato de Saída: JSON com lista de validações e recomendações.
```

---

## 5. Implementação do MCP Server

### 5.1 Escolha de Stack: Go vs Python

| Aspecto | Go 1.21+ | Python 3.11+ |
|---------|----------|--------------|
| **Performance** | ✅ Excelente (compiled, concorrente) | ⚠️ Boa (interpretado) |
| **Integração SuperCore** | ✅ Mesma stack do backend | ⚠️ Requer HTTP bridge |
| **Bibliotecas MCP** | ⚠️ Implementação manual (spec recente) | ✅ SDK oficial Anthropic |
| **Manutenção** | ✅ Tipo-safe, menos bugs | ⚠️ Dinâmico |
| **Time to Market** | ⚠️ Mais código boilerplate | ✅ SDK pronto, menos código |
| **Recomendação** | ⭐⭐ Bom para produção | ⭐⭐⭐ Melhor para Fase 1 |

**Decisão**: **Python 3.11+** para Fase 1 (usar SDK oficial), migração para Go em Fase 3 (produção).

---

### 5.2 Arquitetura do MCP Server (Python)

```python
# mcp_server/main.py
# MCP Server para SuperCore

from mcp import MCPServer, Resource, Tool, Prompt
from mcp.types import TextContent, ImageContent
import httpx
import os

# Cliente HTTP para backend SuperCore
SUPERCORE_API_BASE = os.getenv("SUPERCORE_API_BASE", "http://localhost:8080/api/v1")
supercore_client = httpx.AsyncClient(base_url=SUPERCORE_API_BASE)

# Instancia MCP Server
mcp_server = MCPServer(
    name="supercore-mcp",
    version="1.0.0",
    description="SuperCore MCP Server - Expõe recursos e ferramentas do SuperCore para LLMs"
)

# ========== RESOURCES ==========

@mcp_server.resource("oracle://config")
async def get_oracle_config() -> Resource:
    """Retorna configuração completa do Oráculo"""
    response = await supercore_client.get("/oracle/whoami")
    return Resource(
        uri="oracle://config",
        name="Oracle Configuration",
        description="Configuração completa do Oráculo (identidade, licenças, integrações, políticas)",
        mimeType="application/json",
        content=TextContent(
            type="text",
            text=response.text
        )
    )

@mcp_server.resource("instances://{object_type}")
async def get_instances(object_type: str, filters: dict = None) -> Resource:
    """Retorna instances de um object_definition"""
    params = {"object_definition_name": object_type}
    if filters:
        params.update(filters)

    response = await supercore_client.get("/instances", params=params)

    return Resource(
        uri=f"instances://{object_type}",
        name=f"Instances of {object_type}",
        description=f"Lista de instances do tipo {object_type}",
        mimeType="application/json",
        content=TextContent(
            type="text",
            text=response.text
        )
    )

@mcp_server.resource("object-definitions://all")
async def get_object_definitions() -> Resource:
    """Retorna todos os object_definitions"""
    response = await supercore_client.get("/object-definitions")

    return Resource(
        uri="object-definitions://all",
        name="All Object Definitions",
        description="Lista de todos os object_definitions criados no sistema",
        mimeType="application/json",
        content=TextContent(
            type="text",
            text=response.text
        )
    )

# ========== TOOLS ==========

@mcp_server.tool()
async def create_context(
    super_prompt: str,
    name: str = None,
    description: str = None,
    tags: list[str] = None
) -> dict:
    """
    Cria um novo contexto de upload.

    Args:
        super_prompt: Super prompt descrevendo a solução desejada (min 100 chars)
        name: Nome descritivo do contexto (opcional)
        description: Descrição detalhada (opcional)
        tags: Tags para categorização (opcional)

    Returns:
        {id, name, status, created_at}
    """
    if len(super_prompt) < 100:
        raise ValueError("Super prompt deve ter no mínimo 100 caracteres")

    payload = {
        "super_prompt": super_prompt,
        "name": name,
        "description": description,
        "tags": tags or []
    }

    response = await supercore_client.post("/context/upload", json=payload)
    return response.json()

@mcp_server.tool()
async def process_context(context_id: str) -> dict:
    """
    Aciona processamento de um contexto.

    Args:
        context_id: ID do contexto a ser processado

    Returns:
        {job_id, status, estimated_duration_seconds}
    """
    response = await supercore_client.post(f"/context/{context_id}/process")
    return response.json()

@mcp_server.tool()
async def wait_for_processing(
    context_id: str,
    timeout_seconds: int = 300
) -> dict:
    """
    Aguarda conclusão do processamento (polling interno).

    Args:
        context_id: ID do contexto sendo processado
        timeout_seconds: Timeout máximo de espera (padrão: 5 minutos)

    Returns:
        {status, processing_duration_seconds, result_summary}
    """
    import asyncio
    import time

    start_time = time.time()

    while True:
        response = await supercore_client.get(f"/context/{context_id}/status")
        status_data = response.json()

        if status_data["status"] in ["SUCESSO", "ERRO"]:
            return {
                "status": status_data["status"],
                "processing_duration_seconds": time.time() - start_time,
                "result_summary": status_data.get("result_summary", {})
            }

        if time.time() - start_time > timeout_seconds:
            raise TimeoutError(f"Processamento excedeu timeout de {timeout_seconds}s")

        await asyncio.sleep(2)  # Poll a cada 2 segundos

@mcp_server.tool()
async def rag_query(
    question: str,
    context_filters: dict = None
) -> dict:
    """
    Consulta RAG trimodal (SQL + Graph + Vector).

    Args:
        question: Pergunta em linguagem natural
        context_filters: Filtros para contexto (object_types, states, date_range)

    Returns:
        {answer, sources, context_used}
    """
    payload = {
        "question": question,
        "filters": context_filters or {}
    }

    response = await supercore_client.post("/rag/query", json=payload)
    return response.json()

# ========== PROMPTS ==========

@mcp_server.prompt()
def process_bacen_circular(
    circular_number: str,
    pdf_url: str = None
) -> Prompt:
    """
    Template para processar Circular BACEN.

    Args:
        circular_number: Número da Circular (ex: 3.978)
        pdf_url: URL do PDF da Circular (opcional)
    """
    template = f"""
Você é um especialista em regulamentação BACEN.

Tarefa: Processar Circular BACEN {circular_number} e extrair:

1. **Metadados**:
   - Data de publicação
   - Título completo
   - Assunto principal

2. **Regras Executáveis**:
   - Identificar todas as regras que podem ser expressas como condições
   - Formato: "SE <condição> ENTÃO <ação>"
   - Incluir referência à seção do manual (rastreabilidade)

3. **Object Definitions Sugeridos**:
   - Quais objetos de negócio são mencionados?
   - Quais campos cada objeto deve ter?
   - Quais validações BACEN se aplicam?

4. **Relacionamentos**:
   - Quais objetos se relacionam entre si?
   - Tipo de relacionamento (1:1, 1:N, N:M)

5. **FSMs (Ciclos de Vida)**:
   - Quais estados cada objeto pode ter?
   - Quais transições são permitidas?

{"PDF disponível em: " + pdf_url if pdf_url else f"Use RAG para consultar conteúdo da Circular {circular_number}"}

Formato de Saída: JSON estruturado conforme schemas do SuperCore.
"""

    return Prompt(
        name="process-bacen-circular",
        description=f"Processa Circular BACEN {circular_number}",
        arguments={
            "circular_number": circular_number,
            "pdf_url": pdf_url
        },
        messages=[
            {"role": "user", "content": template}
        ]
    )

# ========== MAIN ==========

if __name__ == "__main__":
    # Inicia MCP Server via stdio (protocolo padrão)
    mcp_server.run()
```

---

### 5.3 Configuração do MCP Server

**Arquivo**: `mcp_server/config.json`

```json
{
  "mcpServers": {
    "supercore": {
      "command": "python",
      "args": ["-m", "mcp_server.main"],
      "env": {
        "SUPERCORE_API_BASE": "http://localhost:8080/api/v1"
      }
    }
  }
}
```

**Claude Desktop App** usa este arquivo para descobrir e conectar ao MCP Server.

---

### 5.4 Estrutura de Pastas

```
mcp_server/
├── __init__.py
├── main.py                  # MCP Server principal
├── resources/
│   ├── __init__.py
│   ├── oracle.py           # Resource oracle://config
│   ├── instances.py        # Resource instances://{type}
│   └── object_defs.py      # Resource object-definitions://all
├── tools/
│   ├── __init__.py
│   ├── context.py          # Tools: create_context, process_context
│   ├── rag.py              # Tool: rag_query
│   └── object_def.py       # Tool: create_object_definition (Fase 2)
├── prompts/
│   ├── __init__.py
│   ├── bacen.py            # Prompts para processamento BACEN
│   └── diagrams.py         # Prompts para análise de diagramas
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## 6. Integração com Fase 1

### 6.1 Como MCP Se Integra ao Fluxo Fase 1

**ANTES (Sem MCP)**:
```
1. Frontend upload de PDF
2. Backend armazena arquivo
3. Usuário clica "Processar"
4. Backend chama AI Services (PDF Parser, Vision API)
5. Resultado salvo em processed_data
6. Usuário visualiza JSON no frontend
```

**DEPOIS (Com MCP)**:
```
1. Frontend upload de PDF
2. Backend armazena arquivo
3. Usuário clica "Processar"
4. Backend chama AI Services (PDF Parser, Vision API)
5. Resultado salvo em processed_data
6. Usuário visualiza JSON no frontend
7. ⭐ MCP Server expõe contexto como Resource
8. ⭐ Claude pode consultar via MCP: context-results://uuid-123
9. ⭐ Claude pode processar via Tool: process_context(uuid-123)
10. ⭐ Claude pode gerar object_definitions automaticamente (Fase 2)
```

**MCP adiciona camada de acesso inteligente SEM modificar fluxo existente.**

---

### 6.2 Novos Cards Kanban para Fase 1 (MCP Integration)

#### Sprint 1: Adicionar 2 cards

| Card | Responsável | Estimativa | Prioridade |
|------|-------------|------------|------------|
| **MCP: Setup estrutura básica (mcp_server/)** | Backend Architect Agent | 2h | P1 |
| **MCP: Implementar Resource oracle://config** | Backend Developer Agent | 2h | P1 |

**Total Sprint 1**: +4 horas (40h → 44h)

---

#### Sprint 2: Adicionar 3 cards

| Card | Responsável | Estimativa | Prioridade |
|------|-------------|------------|------------|
| **MCP: Implementar Tool create_context** | Backend Developer Agent | 3h | P1 |
| **MCP: Implementar Tool process_context** | Backend Developer Agent | 2h | P1 |
| **MCP: Implementar Resource uploaded-files://{context_id}** | Backend Developer Agent | 2h | P2 |

**Total Sprint 2**: +7 horas (40h → 47h)

---

#### Sprint 3: Adicionar 3 cards

| Card | Responsável | Estimativa | Prioridade |
|------|-------------|------------|------------|
| **MCP: Implementar Tool wait_for_processing** | Backend Developer Agent | 3h | P1 |
| **MCP: Implementar Resource context-results://{id}** | Backend Developer Agent | 2h | P1 |
| **MCP: Implementar Prompt process-bacen-circular** | AI Engineer Agent | 3h | P2 |

**Total Sprint 3**: +8 horas (40h → 48h)

---

#### Sprint 4: Adicionar 2 cards

| Card | Responsável | Estimativa | Prioridade |
|------|-------------|------------|------------|
| **MCP: Testes de integração (Claude Desktop App)** | TDD Orchestrator Agent | 4h | P0 |
| **MCP: Documentação completa (README MCP Server)** | Technical Writer Agent | 2h | P1 |

**Total Sprint 4**: +6 horas (50h → 56h)

---

**TOTAL FASE 1 COM MCP**: 43 cards originais + 10 cards MCP = **53 cards**, ~195 horas

---

## 7. Testes do MCP Server

### 7.1 Testes Unitários (Python)

```python
# tests/test_mcp_resources.py

import pytest
from mcp_server.main import mcp_server

@pytest.mark.asyncio
async def test_oracle_config_resource():
    """Testa resource oracle://config"""
    resource = await mcp_server.read_resource("oracle://config")

    assert resource.uri == "oracle://config"
    assert resource.mimeType == "application/json"

    data = json.loads(resource.content.text)
    assert "identity" in data
    assert "licenses" in data
    assert "integrations" in data
    assert "policies" in data

@pytest.mark.asyncio
async def test_instances_resource():
    """Testa resource instances://{type}"""
    resource = await mcp_server.read_resource(
        "instances://cliente_pf",
        filters={"current_state": "ATIVO"}
    )

    data = json.loads(resource.content.text)
    assert data["object_type"] == "cliente_pf"
    assert "items" in data
    assert "total_count" in data
```

---

### 7.2 Testes de Integração (Claude Desktop App)

**Cenário 1**: Claude cria contexto e faz upload de PDF

```typescript
// Usuário via Claude Desktop App
> "Claude, cria um contexto para processar a Circular 3.978 do BACEN"

// Claude usa MCP Tool
const context = await mcpClient.callTool("create_context", {
  name: "Circular 3.978 - PLD/FT",
  super_prompt: "Criar object_definitions para compliance com Circular 3.978..."
});

// Claude faz upload do PDF
const file = await mcpClient.callTool("upload_file", {
  context_id: context.id,
  file_content: base64PDFContent,
  filename: "circular_3978.pdf",
  file_type: "pdf"
});

// Claude aciona processamento
const job = await mcpClient.callTool("process_context", {
  context_id: context.id
});

// Claude aguarda conclusão
const result = await mcpClient.callTool("wait_for_processing", {
  context_id: context.id,
  timeout_seconds: 180
});

// Claude consulta resultado via Resource
const contextResult = await mcpClient.readResource(
  `context-results://${context.id}`
);

// ✅ Sucesso: Claude retorna resumo estruturado ao usuário
> "Processamento concluído! Extraí 42 seções da Circular 3.978. Encontrei 18 regras executáveis e 5 object_definitions sugeridos."
```

---

**Cenário 2**: Claude consulta RAG sobre limites PIX

```typescript
// Usuário via Claude Desktop App
> "Claude, qual o limite de PIX no horário noturno?"

// Claude usa MCP Tool rag_query
const ragResult = await mcpClient.callTool("rag_query", {
  question: "Qual o limite de PIX no horário noturno segundo o BACEN?",
  context_filters: {
    object_types: ["manual_bacen", "regra_bacen"],
    states: ["VIGENTE"]
  }
});

// ✅ Sucesso: Claude sintetiza resposta com fundamentação legal
> "De acordo com o Manual PIX v8.3 (Seção 4.2), o limite para transferências PIX no período noturno (20h-6h) é de R$ 1.000,00 por transação para clientes pessoa física."
```

---

## 8. Roadmap de Implementação MCP

### Fase 1 (4 semanas) - Foundation

**Sprint 1**:
- Setup estrutura MCP Server (Python)
- Resource: `oracle://config`

**Sprint 2**:
- Tools: `create_context`, `process_context`
- Resource: `uploaded-files://{context_id}`

**Sprint 3**:
- Tool: `wait_for_processing`
- Resource: `context-results://{id}`
- Prompt: `process-bacen-circular`

**Sprint 4**:
- Testes de integração (Claude Desktop App)
- Documentação completa

---

### Fase 2 (3 semanas) - Specification Generation

- Tool: `create_object_definition`
- Resource: `specifications://{context_id}`
- Prompt: `generate-object-from-diagram`
- Prompt: `iterate-specification`

---

### Fase 3 (6 semanas) - Object Graph Generation

- Tool: `create_instance`
- Tool: `create_relationship`
- Resource: `relationships://{instance_id}`
- Prompt: `generate-instances-from-spec`

---

### Fase 4 (2 semanas) - Model Preview & Approval

- Tool: `approve_model`
- Resource: `model-preview://{model_id}`
- Prompt: `explain-model`

---

### Fase 5 (8 semanas) - Dynamic UI

- Tool: `generate_ui_component`
- Resource: `ui-schemas://{object_type}`
- Prompt: `design-form-layout`

---

## 9. Benefícios Concretos do MCP

### 9.1 Para o Time de Produto

| Antes (Sem MCP) | Depois (Com MCP) |
|-----------------|------------------|
| Upload manual de PDFs, clicar "Processar", esperar, copiar JSON | "Claude, processa a Circular 3.978 e cria os objetos" |
| Interpretar JSON manualmente | Claude explica em linguagem natural |
| Criar object_definitions via formulário | Claude cria automaticamente a partir de contexto |

---

### 9.2 Para o Time de Desenvolvimento

| Antes (Sem MCP) | Depois (Com MCP) |
|-----------------|------------------|
| Escrever código para cada nova integração | MCP Tools reutilizáveis |
| Manter API docs atualizadas | MCP expõe schemas automaticamente |
| Orquestração manual (múltiplas chamadas API) | MCP Prompts orquestram fluxos |

---

### 9.3 Para o Sistema (Arquitetura)

- **Menor Context Window**: Resources são consultados sob demanda, não enviados no prompt inicial
- **Rastreabilidade**: Todos os tool calls logados
- **Versionamento**: MCP Server versiona recursos e tools
- **Testabilidade**: MCP Tools podem ser testados isoladamente

---

## 10. Próximos Passos

### 10.1 Aprovação Necessária

- [ ] Revisão desta especificação (Time de Produto + Time Técnico)
- [ ] Decisão sobre Go vs Python (recomendação: Python para Fase 1)
- [ ] Aprovação formal para adicionar 10 cards MCP à Fase 1
- [ ] Criação de API Key Anthropic (para Vision API + MCP integration)

---

### 10.2 Após Aprovação

1. Criar branch `feat/mcp-integration`
2. Atualizar planejamento de sprints (adicionar 10 cards MCP)
3. Atualizar squad (adicionar responsabilidades MCP)
4. Implementar MCP Server (Python) em paralelo com Fase 1
5. Testes de integração com Claude Desktop App
6. Documentação final (README MCP Server)

---

## Referências

- **[Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)** - ⭐⭐⭐ Spec oficial
- **[MCP Python SDK](https://github.com/anthropics/mcp-python-sdk)** - SDK oficial Anthropic
- **[CLAUDE.md](CLAUDE.md)** - Guia definitivo SuperCore
- **[docs/fases/fase1/01_especificacoes.md](docs/fases/fase1/01_especificacoes.md)** - Especificações Fase 1

---

**Status**: 🟡 Aguardando Aprovação
**Próxima Ação**: Revisão e aprovação formal
**Versão**: 1.0.0
**Data de Última Atualização**: 2025-12-11

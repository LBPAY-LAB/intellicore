# 🏗️ Decisões Arquiteturais - Fase 1: Fundação

**Projeto**: SuperCore v2.0
**Fase**: Fase 1 - Fundação (Q1 2025)
**Data**: 2025-12-28
**Versão**: 1.0.0

---

## 📋 Índice de ADRs

1. [ADR-001: Escolha de PostgreSQL com pgvector para Vector Search](#adr-001-escolha-de-postgresql-com-pgvector-para-vector-search)
2. [ADR-002: Go para CRUD e Python para IA/RAG](#adr-002-go-para-crud-e-python-para-iarag)
3. [ADR-003: SSE (Server-Sent Events) para Chat Streaming](#adr-003-sse-server-sent-events-para-chat-streaming)
4. [ADR-004: JSON Schema para Object Definitions](#adr-004-json-schema-para-object-definitions)
5. [ADR-005: IVFFlat Index Strategy para pgvector](#adr-005-ivfflat-index-strategy-para-pgvector)
6. [ADR-006: Soft Delete para Oráculos e Documentos](#adr-006-soft-delete-para-oráculos-e-documentos)
7. [ADR-007: WebSocket para Document Processing Updates](#adr-007-websocket-para-document-processing-updates)

---

## ADR-001: Escolha de PostgreSQL com pgvector para Vector Search

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Tech Lead, Architecture Owner

### Contexto
A Fase 1 requer capacidade de **vector search** para o pipeline RAG (buscar documentos similares usando embeddings). As opções consideradas foram:
- **Opção A**: Database dedicado de vetores (Qdrant, Weaviate, Pinecone)
- **Opção B**: PostgreSQL com extensão pgvector
- **Opção C**: Elasticsearch com dense_vector

### Decisão
**Escolhemos PostgreSQL com pgvector (Opção B)**

### Justificativa

#### Vantagens da Opção B (pgvector):
1. **Simplicidade Operacional** (🔥 Mais importante):
   - 1 database em vez de 2 (PostgreSQL já usado para dados estruturados)
   - Menos complexidade de deployment
   - Menos custos de infraestrutura (1 instância em vez de 2)

2. **Transações ACID**:
   - Vetores e metadados na mesma transação
   - Consistência garantida entre chunks e embeddings
   - Rollback atômico em caso de erro

3. **Queries Híbridas**:
   - Combinar vector search + SQL filters em 1 query
   - Exemplo: "Buscar documentos similares AND criados nos últimos 30 dias"
   - Performance melhor que JOIN entre 2 databases

4. **Custo**:
   - Sem licenças adicionais (pgvector é open source)
   - AWS RDS PostgreSQL já suporta pgvector nativamente

5. **Maturidade**:
   - PostgreSQL: 25+ anos de maturidade
   - pgvector: 50k+ stars no GitHub, 1M+ downloads/mês
   - Usado por OpenAI, Supabase, Notion

#### Desvantagens Conhecidas:
- Performance inferior a databases dedicados (Qdrant, Weaviate) em escala >10M vetores
- Falta de features avançadas (filtered vector search, multi-vector queries)

**Mitigação**:
- Fase 1 terá <100k vetores (escala pequena, performance não crítica)
- Se precisar escalar na Fase 3/4, migrar para Qdrant (dados já estruturados em PostgreSQL)

#### Alternativas Rejeitadas:

**Opção A (Qdrant)**: Melhor performance, mas:
- Adiciona complexidade operacional (2 databases)
- Falta de transações ACID entre PostgreSQL e Qdrant
- Custo adicional de infraestrutura
- Overkill para Fase 1 (<100k vetores)

**Opção C (Elasticsearch)**: Boa opção, mas:
- Complexidade de deployment (JVM, heap tuning)
- Custo elevado (memória intensiva)
- Menos maduro para vector search (feature recente)

### Consequências

#### Positivas:
- ✅ Setup mais simples (1 comando: `CREATE EXTENSION vector`)
- ✅ Queries híbridas SQL + Vector em 1 linha
- ✅ Backup unificado (PostgreSQL + vetores)
- ✅ Menos custos de infra

#### Negativas:
- ❌ Performance limitada em >10M vetores (p95 search latency >500ms)
- ❌ Falta de features avançadas (filtered vector search)

#### Neutras:
- ⚠️ Possível migração futura para Qdrant (Fase 3/4)

### Implementação

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES documents(id),
    content TEXT,
    embedding vector(1536), -- OpenAI ada-002 dimensions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create IVFFlat index (see ADR-005)
CREATE INDEX idx_chunks_embedding
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Vector similarity search query
SELECT
    id,
    content,
    1 - (embedding <=> :query_embedding::vector) AS similarity
FROM document_chunks
WHERE 1 - (embedding <=> :query_embedding::vector) > 0.7 -- threshold
ORDER BY embedding <=> :query_embedding::vector
LIMIT 5;
```

### Referências
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [stack_supercore_v2.0.md - Seção PostgreSQL](../../../documentation-base/stack_supercore_v2.0.md#postgresql-16)
- [RAG_PIPELINE_ARCHITECTURE.md](../../../documentation-base/RAG_PIPELINE_ARCHITECTURE.md)

---

## ADR-002: Go para CRUD e Python para IA/RAG

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Tech Lead, Backend Lead

### Contexto
O SuperCore v2.0 requer 2 tipos de workloads:
1. **CRUD operations**: APIs para Oráculos, Object Definitions, Documentos (estruturadas, síncronas)
2. **IA/RAG processing**: Embeddings, LLM calls, chunking, vector search (computação intensiva, assíncrona)

Opções consideradas:
- **Opção A**: Tudo em Go (monolítico)
- **Opção B**: Tudo em Python (monolítico)
- **Opção C**: Go para CRUD + Python para IA/RAG (híbrido)

### Decisão
**Escolhemos Go para CRUD + Python para IA/RAG (Opção C)**

### Justificativa

#### Vantagens de Go (para CRUD):
1. **Performance**:
   - 10-20× mais rápido que Python em APIs síncronas
   - Baixa latência (<50ms p95 para CRUD)
   - Baixo consumo de memória (10-50 MB por serviço)

2. **Concorrência**:
   - Goroutines nativas (lightweight threads)
   - Excelente para APIs com muitas conexões simultâneas

3. **Deployment**:
   - Binary único (sem dependências externas)
   - Startup rápido (<1s)
   - Fácil de containerizar (Docker image <20MB)

4. **Type Safety**:
   - Compilado, detecta erros em build time
   - Refactoring mais seguro

#### Vantagens de Python (para IA/RAG):
1. **Ecossistema IA/ML** (🔥 Mais importante):
   - LangChain, OpenAI SDK, Hugging Face
   - 90% das bibliotecas de ML são Python-first
   - Exemplos e documentação abundantes

2. **Prototipagem Rápida**:
   - Iteração rápida em pipelines RAG
   - Notebooks (Jupyter) para experimentação

3. **Assíncrono**:
   - AsyncIO para I/O-bound tasks (API calls, embeddings)
   - Celery para background jobs

#### Por que NÃO monolítico (Opções A e B)?

**Opção A (Tudo em Go)**: Ruim porque:
- Falta de bibliotecas de IA/ML (Go ML ecosystem é imaturo)
- Difícil integrar OpenAI, LangChain, Hugging Face
- Menos exemplos e documentação

**Opção B (Tudo em Python)**: Ruim porque:
- Performance inferior em CRUD (10-20× mais lento que Go)
- Alto consumo de memória (100-300 MB por worker)
- Startup lento (>5s)
- Deployment mais complexo (dependências, virtualenv)

### Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│ API Gateway (Nginx / Traefik)                               │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
         ┌────────▼────────┐    ┌────────▼─────────┐
         │  Go Service     │    │ Python Service   │
         │  (Port 8080)    │    │ (Port 8000)      │
         │                 │    │                  │
         │ - CRUD Oráculos │    │ - Document       │
         │ - CRUD Obj Defs │    │   Processing     │
         │ - User Auth     │    │ - Embeddings     │
         │ - Metrics       │    │ - Vector Search  │
         │                 │    │ - LLM Calls      │
         │ Framework: Gin  │    │ Framework:       │
         │                 │    │   FastAPI        │
         └────────┬────────┘    └────────┬─────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼──────────┐
                  │ PostgreSQL 16       │
                  │ + pgvector 0.5.1    │
                  └─────────────────────┘
```

**Comunicação entre serviços**:
- Go → Python: HTTP REST (síncronas) ou Redis Pub/Sub (assíncronas)
- Python → Go: Não necessário (Python não chama Go)

### Consequências

#### Positivas:
- ✅ Melhor performance para CRUD (Go)
- ✅ Melhor DX para IA/RAG (Python)
- ✅ Cada serviço otimizado para seu workload
- ✅ Escalabilidade independente (Go e Python podem escalar separadamente)

#### Negativas:
- ❌ 2 linguagens para manter (Go + Python)
- ❌ 2 stacks para gerenciar (Gin + FastAPI)
- ❌ Complexidade de deployment (2 serviços)

#### Neutras:
- ⚠️ Necessário padronizar APIs (OpenAPI spec compartilhada)
- ⚠️ Necessário monitoramento unificado (métricas de ambos serviços)

### Implementação

**Go Service** (CRUD):
```go
// main.go
package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // Oracles CRUD
    r.GET("/api/v1/oracles", ListOracles)
    r.POST("/api/v1/oracles", CreateOracle)
    r.GET("/api/v1/oracles/:id", GetOracle)
    r.PUT("/api/v1/oracles/:id", UpdateOracle)
    r.DELETE("/api/v1/oracles/:id", DeleteOracle)

    r.Run(":8080")
}
```

**Python Service** (IA/RAG):
```python
# main.py
from fastapi import FastAPI
from services.document_processor import process_document
from services.rag_pipeline import chat_stream

app = FastAPI()

@app.post("/api/v1/documents/process")
async def process_document_endpoint(document_id: str):
    await process_document(document_id)
    return {"status": "processing"}

@app.post("/api/v1/chat/stream")
async def chat_endpoint(oracle_id: str, message: str):
    return EventSourceResponse(chat_stream(oracle_id, message))
```

### Referências
- [stack_supercore_v2.0.md - Seção Backend](../../../documentation-base/stack_supercore_v2.0.md#backend)
- [arquitetura_supercore_v2.0.md - ADR-002](../../../documentation-base/arquitetura_supercore_v2.0.md#adr-002)

---

## ADR-003: SSE (Server-Sent Events) para Chat Streaming

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Frontend Lead, Backend Lead

### Contexto
O Chat IA Assistant (RF004) deve streamer respostas token-by-token para melhor UX (usuário vê resposta progressivamente, não espera 10-30s para resposta completa).

Opções consideradas:
- **Opção A**: SSE (Server-Sent Events)
- **Opção B**: WebSocket
- **Opção C**: Long Polling

### Decisão
**Escolhemos SSE (Opção A)**

### Justificativa

#### Vantagens de SSE:
1. **Simplicidade** (🔥 Mais importante):
   - HTTP/1.1 puro (não requer upgrade de protocolo)
   - Built-in no browser (EventSource API)
   - Menos código do que WebSocket

2. **Unidirecional** (Server → Client):
   - Chat streaming é unidirecional (servidor envia tokens, cliente só escuta)
   - Não precisa de comunicação bidirecional

3. **Reconexão Automática**:
   - EventSource API reconecta automaticamente se conexão cair
   - WebSocket requer implementação manual

4. **Compatibilidade**:
   - Funciona em todos browsers modernos (>95% coverage)
   - Fallback para long polling em IE (polyfill disponível)

5. **Debugging**:
   - Visível no DevTools Network tab (como HTTP requests)
   - WebSocket requer ferramentas especializadas

#### Desvantagens de WebSocket (Opção B):
- Bidirecional (overkill para chat streaming unidirecional)
- Requer upgrade de protocolo (HTTP → WS)
- Reconexão manual
- Debugging mais difícil

#### Desvantagens de Long Polling (Opção C):
- Latência alta (múltiplos round-trips)
- Overhead de HTTP headers em cada request
- Ineficiente para streaming contínuo

### Arquitetura

```
┌─────────────────┐
│ Frontend        │
│ (Next.js)       │
│                 │
│ EventSource API │
└────────┬────────┘
         │ HTTP/1.1 (SSE)
         │ GET /api/v1/chat/stream?message=...
         │
┌────────▼─────────┐
│ Backend          │
│ (FastAPI)        │
│                  │
│ async def        │
│ event_generator()│
│   yield token    │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ OpenAI API       │
│ (stream=True)    │
└──────────────────┘
```

### Implementação

**Backend (Python + FastAPI)**:
```python
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import openai

@router.get("/chat/stream")
async def chat_stream(oracle_id: str, message: str):
    async def event_generator():
        try:
            # Call OpenAI with streaming
            response = await openai.ChatCompletion.acreate(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": message}],
                stream=True
            )

            # Stream tokens
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    yield {
                        "event": "token",
                        "data": token
                    }

            # Send done event
            yield {"event": "done", "data": ""}

        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())
```

**Frontend (Next.js + TypeScript)**:
```typescript
// hooks/useChat.ts
import { useEffect, useState } from 'react'

export function useChat(oracleId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async (content: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content }])

    // Start SSE streaming
    setIsStreaming(true)
    const aiMessage = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, aiMessage])

    const eventSource = new EventSource(
      `/api/v1/chat/stream?oracle_id=${oracleId}&message=${encodeURIComponent(content)}`
    )

    eventSource.addEventListener('token', (e) => {
      const token = e.data
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].content += token
        return updated
      })
    })

    eventSource.addEventListener('done', () => {
      setIsStreaming(false)
      eventSource.close()
    })

    eventSource.addEventListener('error', (e) => {
      console.error('SSE error:', e)
      setIsStreaming(false)
      eventSource.close()
    })
  }

  return { messages, sendMessage, isStreaming }
}
```

### Consequências

#### Positivas:
- ✅ Implementação simples (menos código)
- ✅ Reconexão automática
- ✅ Debugging fácil (DevTools Network tab)
- ✅ Performance boa (latency <100ms por token)

#### Negativas:
- ❌ Apenas unidirecional (Server → Client)
- ❌ HTTP/1.1 limite de 6 conexões simultâneas por domínio (mitigado por HTTP/2)

#### Neutras:
- ⚠️ Se precisar bidirecional no futuro (ex: typing indicator), migrar para WebSocket

### Métricas de Sucesso
- **Time to First Token (TTFT)**: <500ms
- **Streaming Rate**: 30-50 tokens/segundo
- **Error Rate**: <1% (reconexão automática reduz falhas)

### Referências
- [MDN - Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [sse-starlette](https://github.com/sysid/sse-starlette)
- [mockup 07_oracles_chat_ia_assistant.md](../ux-ui/mockups/07_oracles_chat_ia_assistant.md)

---

## ADR-004: JSON Schema para Object Definitions

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Tech Lead, Data Modeling Specialist

### Contexto
O SuperCore v2.0 permite que cada Oráculo defina seus próprios **Object Definitions** (schemas dinâmicos). Precisamos de um formato padrão para:
1. Definir estrutura de objetos (campos, tipos, validações)
2. Validar dados em runtime
3. Gerar formulários dinâmicos no frontend

Opções consideradas:
- **Opção A**: JSON Schema (Draft 2020-12)
- **Opção B**: Formato customizado (próprio)
- **Opção C**: Protocol Buffers (protobuf)

### Decisão
**Escolhemos JSON Schema (Opção A)**

### Justificativa

#### Vantagens de JSON Schema:
1. **Padrão da Indústria** (🔥 Mais importante):
   - Especificação aberta (IETF)
   - Usado por OpenAPI, AWS, Google Cloud
   - 50+ bibliotecas de validação (todas linguagens)

2. **Validação Built-in**:
   - Tipos: string, number, integer, boolean, array, object
   - Validações: required, min, max, pattern (regex), enum
   - Nested objects e arrays

3. **Tooling**:
   - Geradores de formulários (react-jsonschema-form)
   - Geradores de TypeScript types (json-schema-to-typescript)
   - Editores visuais (JSON Schema Editor)

4. **Versionamento**:
   - JSON Schema suporta `$schema` e `$id` (versionamento nativo)

5. **Human-Readable**:
   - JSON puro (fácil de ler e editar)
   - Documentação auto-descritiva (description, examples)

#### Desvantagens de Opções B e C:

**Opção B (Formato customizado)**: Ruim porque:
- Reinventar a roda (JSON Schema já resolve)
- Falta de tooling (precisaríamos construir tudo)
- Falta de validadores prontos

**Opção C (Protocol Buffers)**: Ruim porque:
- Binário (não human-readable)
- Curva de aprendizado (sintaxe complexa)
- Overkill (protobuf é para serialização de alta performance, não para schemas dinâmicos)

### Exemplo de JSON Schema

**Input** (Form Builder no frontend):
```json
{
  "name": "Transação Suspeita",
  "fields": [
    {
      "name": "valor",
      "type": "number",
      "description": "Valor da transação em reais",
      "required": true,
      "validation": {
        "minimum": 0,
        "maximum": 1000000
      }
    },
    {
      "name": "data",
      "type": "string",
      "format": "date-time",
      "description": "Data e hora da transação",
      "required": true
    },
    {
      "name": "motivo",
      "type": "string",
      "description": "Motivo da suspeita",
      "enum": ["valor_alto", "multiplas_transacoes", "destino_suspeito"]
    }
  ]
}
```

**Output** (JSON Schema gerado automaticamente):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://supercore.com/schemas/transacao-suspeita/v1",
  "type": "object",
  "title": "Transação Suspeita",
  "description": "Schema para transações suspeitas no Oráculo de Compliance",
  "properties": {
    "valor": {
      "type": "number",
      "description": "Valor da transação em reais",
      "minimum": 0,
      "maximum": 1000000
    },
    "data": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora da transação"
    },
    "motivo": {
      "type": "string",
      "description": "Motivo da suspeita",
      "enum": ["valor_alto", "multiplas_transacoes", "destino_suspeito"]
    }
  },
  "required": ["valor", "data"],
  "additionalProperties": false
}
```

### Implementação

**Backend (Go) - Validação**:
```go
import "github.com/xeipuuv/gojsonschema"

func ValidateObject(schemaJSON string, dataJSON string) (bool, []string) {
    schemaLoader := gojsonschema.NewStringLoader(schemaJSON)
    dataLoader := gojsonschema.NewStringLoader(dataJSON)

    result, err := gojsonschema.Validate(schemaLoader, dataLoader)
    if err != nil {
        return false, []string{err.Error()}
    }

    if result.Valid() {
        return true, nil
    }

    errors := []string{}
    for _, err := range result.Errors() {
        errors = append(errors, err.String())
    }

    return false, errors
}
```

**Frontend (React) - Form Generation**:
```typescript
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

function DynamicForm({ schema, onSubmit }) {
  return (
    <Form
      schema={schema}
      validator={validator}
      onSubmit={(data) => onSubmit(data.formData)}
    />
  )
}
```

### Consequências

#### Positivas:
- ✅ Padrão da indústria (interoperabilidade)
- ✅ Tooling rico (validadores, geradores)
- ✅ Validação automática (backend + frontend)
- ✅ Versionamento nativo

#### Negativas:
- ❌ Curva de aprendizado (JSON Schema tem 100+ keywords)
- ❌ Validações complexas requerem custom keywords

#### Neutras:
- ⚠️ Se precisar validações muito complexas, criar custom validators

### Referências
- [JSON Schema Specification](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [xeipuuv/gojsonschema](https://github.com/xeipuuv/gojsonschema)
- [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form)

---

## ADR-005: IVFFlat Index Strategy para pgvector

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Backend Lead, Database Architect

### Contexto
O pgvector suporta 2 tipos de índices para vector similarity search:
1. **IVFFlat** (Inverted File with Flat storage): Approximate Nearest Neighbor (ANN)
2. **HNSW** (Hierarchical Navigable Small World): Mais preciso, mas mais lento

Precisamos escolher qual índice usar para a Fase 1.

### Decisão
**Escolhemos IVFFlat**

### Justificativa

#### Vantagens de IVFFlat:
1. **Build Time Rápido**:
   - IVFFlat: ~10s para 100k vetores
   - HNSW: ~5 min para 100k vetores
   - Fase 1 terá <100k vetores (build rápido importante para iterações)

2. **Menor Consumo de Memória**:
   - IVFFlat: ~200 MB para 100k vetores (1536 dims)
   - HNSW: ~500 MB para 100k vetores

3. **Recall Suficiente**:
   - IVFFlat: 99% recall (com `lists = 100`)
   - HNSW: 99.9% recall
   - Diferença de 0.9% não é crítica para Fase 1

4. **Simplicidade**:
   - IVFFlat tem 1 parâmetro: `lists` (número de clusters)
   - HNSW tem 2 parâmetros: `m` e `ef_construction` (mais complexo)

#### Quando usar HNSW (Fase 3/4)?
- Datasets grandes (>1M vetores)
- Recall crítico (>99.5%)
- Latência de search <10ms (HNSW é 2-3× mais rápido)

### Configuração

**Criação do índice**:
```sql
-- IVFFlat index
CREATE INDEX idx_chunks_embedding
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- lists = sqrt(total_rows) é uma boa regra geral
-- Para 10k vetores: lists = 100
-- Para 100k vetores: lists = 316
-- Para 1M vetores: lists = 1000
```

**Query otimizada**:
```sql
-- Set probes (quantos clusters buscar)
SET ivfflat.probes = 10; -- default = 1, aumentar para melhor recall

-- Similarity search
SELECT
    id,
    content,
    1 - (embedding <=> :query_embedding::vector) AS similarity
FROM document_chunks
ORDER BY embedding <=> :query_embedding::vector
LIMIT 5;
```

**Trade-off probes vs latency**:
| Probes | Recall | Latency (p95) |
|--------|--------|---------------|
| 1      | 85%    | 50ms          |
| 5      | 95%    | 80ms          |
| 10     | 99%    | 120ms         |
| 20     | 99.9%  | 200ms         |

**Para Fase 1**: `probes = 10` (99% recall, 120ms latency)

### Consequências

#### Positivas:
- ✅ Build rápido (<10s para 100k vetores)
- ✅ Menor consumo de memória (200 MB vs 500 MB)
- ✅ Recall suficiente (99%)
- ✅ Configuração simples (1 parâmetro)

#### Negativas:
- ❌ Recall inferior a HNSW (99% vs 99.9%)
- ❌ Latency superior a HNSW (120ms vs 50ms)

#### Neutras:
- ⚠️ Se escalar >1M vetores na Fase 3/4, migrar para HNSW

### Métricas de Sucesso
- **Recall**: ≥99%
- **Latency (p95)**: <200ms
- **Build Time**: <30s (100k vetores)

### Referências
- [pgvector README - Indexing](https://github.com/pgvector/pgvector#indexing)
- [stack_supercore_v2.0.md - pgvector](../../../documentation-base/stack_supercore_v2.0.md#pgvector)

---

## ADR-006: Soft Delete para Oráculos e Documentos

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Tech Lead, Product Owner

### Contexto
Quando administradores deletam Oráculos ou Documentos, precisamos decidir:
- **Hard delete**: Deletar fisicamente do banco (DELETE FROM)
- **Soft delete**: Marcar como deletado (UPDATE SET deleted_at = NOW())

### Decisão
**Escolhemos Soft Delete**

### Justificativa

#### Vantagens de Soft Delete:
1. **Auditoria e Compliance** (🔥 Mais importante):
   - Histórico completo mantido (quem deletou, quando)
   - Rastreabilidade para auditorias (SOC2, LGPD)
   - Possível restaurar dados deletados acidentalmente

2. **Integridade Referencial**:
   - Objetos relacionados não quebram (ex: Document chunks ainda referenciam documento)
   - Evita CASCADE deletes acidentais

3. **Analytics**:
   - Possível analisar dados deletados (ex: "quantos Oráculos foram deletados no último mês?")

4. **Undo/Restore**:
   - Restaurar Oráculos/Documentos deletados acidentalmente
   - Importante para UX (usuários cometem erros)

#### Desvantagens de Hard Delete:
- Dados perdidos permanentemente (sem undo)
- Falta de auditoria (quem deletou? quando?)
- CASCADE deletes podem quebrar integridade

### Implementação

**Schema (PostgreSQL)**:
```sql
CREATE TABLE oracles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    -- ... outros campos ...
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP -- NULL = ativo, NOT NULL = deletado
);

-- Index para queries que excluem deletados
CREATE INDEX idx_oracles_not_deleted
ON oracles(id)
WHERE deleted_at IS NULL;

-- Constraint para evitar duplicatas (mesmo para deletados)
CREATE UNIQUE INDEX idx_oracles_name_unique
ON oracles(name)
WHERE deleted_at IS NULL;
```

**Backend (Go)**:
```go
// Soft delete
func DeleteOracle(id uuid.UUID) error {
    query := `
        UPDATE oracles
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
    `
    result, err := db.Exec(query, id)
    if err != nil {
        return err
    }

    if result.RowsAffected() == 0 {
        return ErrNotFound
    }

    return nil
}

// List (excluir deletados por padrão)
func ListOracles() ([]Oracle, error) {
    query := `
        SELECT * FROM oracles
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `
    // ...
}

// Restore
func RestoreOracle(id uuid.UUID) error {
    query := `
        UPDATE oracles
        SET deleted_at = NULL
        WHERE id = $1 AND deleted_at IS NOT NULL
    `
    // ...
}
```

**Auditoria**:
```go
// Registrar quem deletou
type AuditLog struct {
    ID        uuid.UUID `json:"id"`
    Action    string    `json:"action"` // "oracle_deleted"
    EntityID  uuid.UUID `json:"entity_id"`
    UserID    uuid.UUID `json:"user_id"`
    Timestamp time.Time `json:"timestamp"`
    Details   string    `json:"details"`
}

func DeleteOracle(id uuid.UUID, userID uuid.UUID) error {
    // Soft delete
    // ...

    // Audit log
    auditLog := AuditLog{
        Action:    "oracle_deleted",
        EntityID:  id,
        UserID:    userID,
        Timestamp: time.Now(),
        Details:   fmt.Sprintf("Oracle %s deleted by user %s", id, userID),
    }
    db.Create(&auditLog)

    return nil
}
```

### Consequências

#### Positivas:
- ✅ Auditoria completa (quem, quando, o quê)
- ✅ Restauração possível (undo)
- ✅ Compliance (SOC2, LGPD)
- ✅ Analytics de deletions

#### Negativas:
- ❌ Queries precisam filtrar `deleted_at IS NULL` (complexidade adicional)
- ❌ Crescimento de database (dados deletados ocupam espaço)
- ❌ Constraints precisam considerar deleted_at (ex: unique constraints)

#### Mitigações:
- **Queries**: Usar views que filtram automaticamente `deleted_at IS NULL`
- **Storage**: Purge periódico de dados deletados >365 dias (GDPR compliance)
- **Constraints**: Usar partial indexes (`WHERE deleted_at IS NULL`)

### Política de Purge

**GDPR Compliance**: Deletar fisicamente dados após 365 dias de soft delete

```sql
-- Job mensal (cron)
DELETE FROM oracles
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '365 days';
```

### Referências
- [GDPR Right to Erasure](https://gdpr-info.eu/art-17-gdpr/)
- [SOC2 Audit Logging](https://www.vanta.com/resources/soc-2-audit-logging)

---

## ADR-007: WebSocket para Document Processing Updates

**Status**: ✅ Aceito
**Data**: 2025-12-28
**Decisores**: Frontend Lead, Backend Lead

### Contexto
O pipeline de processamento de documentos (RF003) tem 5 estágios que podem levar 1-5 minutos. Precisamos notificar o usuário do progresso em tempo real.

Opções consideradas:
- **Opção A**: WebSocket (bidirecional, tempo real)
- **Opção B**: SSE (unidirecional, tempo real)
- **Opção C**: Polling (requisições periódicas a cada 2s)

### Decisão
**Escolhemos WebSocket (Opção A)**

### Justificativa

#### Por que WebSocket?

**Caso de Uso: Batch Upload**
- Usuário faz upload de 10-50 arquivos simultâneos
- Backend processa todos em paralelo
- Frontend precisa mostrar progresso de CADA arquivo
- Updates frequentes (100+ updates/minuto em batch upload)

**Vantagens do WebSocket para este caso**:
1. **Bidirecional**:
   - Server → Client: Progress updates
   - Client → Server: Cancelar processamento, pausar, retry
   - SSE não suporta Client → Server

2. **Baixa Latência**:
   - WebSocket: <50ms por update
   - Polling: 2000ms (intervalo de polling)

3. **Eficiência**:
   - WebSocket: 1 conexão persistente
   - Polling: 100 requests/minuto (overhead de HTTP headers)

4. **Broadcast**:
   - Fácil enviar updates para múltiplos clientes (ex: admin vendo uploads de outros users)

#### Por que NÃO SSE ou Polling?

**SSE (Opção B)**: Ruim porque:
- Unidirecional (não pode cancelar processamento)
- Múltiplas conexões SSE (1 por arquivo) = overhead

**Polling (Opção C)**: Ruim porque:
- Latência alta (2s de delay)
- Overhead (100+ requests/minuto)
- Ineficiente para batch upload

### Arquitetura

```
┌──────────────────┐
│ Frontend         │
│ (React)          │
│                  │
│ WebSocket Client │
└────────┬─────────┘
         │ ws://localhost:3000/ws/documents/:oracle_id
         │
┌────────▼─────────┐
│ Backend          │
│ (FastAPI)        │
│                  │
│ WebSocket Server │
│ ConnectionManager│
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Document         │
│ Processor        │
│ (Async Pipeline) │
└──────────────────┘
```

### Implementação

**Backend (Python + FastAPI)**:
```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set

# Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, oracle_id: str, websocket: WebSocket):
        await websocket.accept()
        if oracle_id not in self.active_connections:
            self.active_connections[oracle_id] = set()
        self.active_connections[oracle_id].add(websocket)

    def disconnect(self, oracle_id: str, websocket: WebSocket):
        self.active_connections[oracle_id].remove(websocket)

    async def broadcast(self, oracle_id: str, message: dict):
        """Send message to all clients connected to this oracle"""
        if oracle_id in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[oracle_id]:
                try:
                    await connection.send_json(message)
                except:
                    dead_connections.add(connection)

            # Remove dead connections
            for conn in dead_connections:
                self.disconnect(oracle_id, conn)

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws/documents/{oracle_id}")
async def websocket_endpoint(websocket: WebSocket, oracle_id: str):
    await manager.connect(oracle_id, websocket)

    try:
        while True:
            # Receive messages from client (ex: cancel, pause, retry)
            data = await websocket.receive_json()

            if data["action"] == "cancel":
                document_id = data["document_id"]
                await cancel_processing(document_id)
                await websocket.send_json({
                    "document_id": document_id,
                    "status": "cancelled"
                })

    except WebSocketDisconnect:
        manager.disconnect(oracle_id, websocket)

# Document processor sends updates
async def process_document(document_id: str, oracle_id: str):
    # Stage 1: Upload
    await manager.broadcast(oracle_id, {
        "document_id": document_id,
        "progress": 20,
        "status": "uploaded",
        "current_step": "Upload",
        "total_steps": 5
    })

    # Stage 2: Extract
    text = await extract_text(document)
    await manager.broadcast(oracle_id, {
        "document_id": document_id,
        "progress": 40,
        "status": "extracted",
        "current_step": "Text Extraction",
        "total_steps": 5
    })

    # ... stages 3-5 ...
```

**Frontend (React + TypeScript)**:
```typescript
import { useEffect, useState } from 'react'

export function useDocumentProcessing(oracleId: string) {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect WebSocket
    ws.current = new WebSocket(`ws://localhost:3000/ws/documents/${oracleId}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // Update upload queue with progress
      setUploadQueue(prev =>
        prev.map(item =>
          item.id === data.document_id
            ? {
                ...item,
                progress: data.progress,
                status: data.status,
                currentStep: data.current_step,
              }
            : item
        )
      )
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      console.log('WebSocket closed')
    }

    // Cleanup on unmount
    return () => {
      ws.current?.close()
    }
  }, [oracleId])

  const cancelProcessing = (documentId: string) => {
    ws.current?.send(JSON.stringify({
      action: 'cancel',
      document_id: documentId
    }))
  }

  return { uploadQueue, cancelProcessing }
}
```

### Consequências

#### Positivas:
- ✅ Bidirecional (cancelar, pausar, retry)
- ✅ Baixa latência (<50ms por update)
- ✅ Eficiente (1 conexão persistente)
- ✅ Broadcast (múltiplos clientes recebem updates)

#### Negativas:
- ❌ Mais complexo que SSE (gerenciar conexões)
- ❌ Debugging mais difícil (requer ferramentas especializadas)
- ❌ Reconnect manual (SSE tem reconnect automático)

#### Mitigações:
- **Complexity**: Usar biblioteca (FastAPI WebSocket Manager)
- **Debugging**: Usar Postman/Insomnia para testar WebSocket
- **Reconnect**: Implementar reconnect logic no frontend (exponential backoff)

### Métricas de Sucesso
- **Latência**: <100ms (server → client update)
- **Connection Uptime**: >99% (reconnect automático)
- **Broadcast Latency**: <200ms (100 clientes simultâneos)

### Referências
- [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [mockup 05_oracles_knowledge.md](../ux-ui/mockups/05_oracles_knowledge.md)

---

## 📊 Resumo de ADRs

| ADR | Decisão | Justificativa Principal | Trade-off |
|-----|---------|-------------------------|-----------|
| ADR-001 | pgvector (não Qdrant) | Simplicidade operacional | Performance em >10M vetores |
| ADR-002 | Go + Python (híbrido) | Best tool for the job | 2 stacks para manter |
| ADR-003 | SSE (não WebSocket) | Simplicidade, unidirecional | Apenas Server → Client |
| ADR-004 | JSON Schema | Padrão da indústria | Curva de aprendizado |
| ADR-005 | IVFFlat (não HNSW) | Build rápido, recall suficiente | Latency superior |
| ADR-006 | Soft Delete | Auditoria, compliance | Queries mais complexas |
| ADR-007 | WebSocket | Bidirecional, batch upload | Complexidade de código |

---

## 📅 Próximos ADRs (Fases Futuras)

**Fase 2**:
- ADR-008: CrewAI vs LangChain Agents (Agentes autônomos)
- ADR-009: Celery vs Bull (Background jobs)
- ADR-010: Redis Pub/Sub vs RabbitMQ (Message broker)

**Fase 3**:
- ADR-011: NebulaGraph vs Neo4j (Graph database)
- ADR-012: Migração pgvector → Qdrant (Vector DB escalável)
- ADR-013: OpenTelemetry setup (Observability)

**Fase 4**:
- ADR-014: Kubernetes deployment strategy
- ADR-015: Multi-tenancy architecture
- ADR-016: Disaster recovery strategy

---

**Versão**: 1.0.0
**Data**: 2025-12-28
**Autor**: Squad Arquitetura (Tech Lead + Architecture Owner)
**Aprovado por**: Product Owner (pendente)

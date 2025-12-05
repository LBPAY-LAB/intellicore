# LBPay Universal Meta-Modeling Platform
## Stack Tecnológica Definitiva v3.0
### 100% Open-Source | Enterprise-Grade | Self-Hosted

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Completa](#arquitetura-completa)
3. [Stack Frontend](#stack-frontend)
4. [Stack Backend](#stack-backend)
5. [Databases](#databases)
6. [LLM & AI](#llm--ai)
7. [Orquestração](#orquestração)
8. [Infrastructure](#infrastructure)
9. [Security](#security)
10. [Observability](#observability)
11. [Roadmap de Implementação](#roadmap-de-implementação)
12. [Análise de Custos](#análise-de-custos)

---

## 🎯 Visão Geral

### **O que estamos construindo?**

Uma **plataforma universal de meta-modelagem orientada por IA** que permite:

- ✅ **Criar qualquer tipo de objeto** (Cliente PF, PJ, Conta, Produto, etc.) sem programar
- ✅ **Definir hierarquias e relacionamentos** dinamicamente
- ✅ **Validar com IA** baseado em normas BACEN e políticas internas
- ✅ **Gerenciar permissões** de forma contextual e inteligente
- ✅ **Buscar semanticamente** em linguagem natural
- ✅ **Analisar grafos** de relacionamentos para detecção de fraude
- ✅ **Processar transações PIX/DICT** em tempo real

### **Princípios Fundamentais**

1. **100% Open-Source**: Sem vendor lock-in, sem custos de licença
2. **Self-Hosted**: Controle total dos dados e infraestrutura
3. **Enterprise-Grade**: Escalável, resiliente, seguro
4. **Polyglot**: Melhor linguagem para cada trabalho
5. **Type-Safe**: TypeScript + Go + Python com tipos fortes
6. **AI-Native**: LLM no centro da arquitetura

---

## 🏗️ Arquitetura Completa

### **Diagrama de Alto Nível**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  ─────────────────────────────────────────────────────────────  │
│  Next.js 15 (App Router)                                        │
│  • Backoffice (gestão de objetos, agentes, workflows)           │
│  • Front-office (operações, criação de entidades)               │
│  • i18n (pt-BR, en-US, es-ES)                                   │
│  • Auth via Keycloak (OIDC)                                     │
│  • Tailwind CSS 4 + shadcn/ui                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ GraphQL/REST
┌─────────────────────────────────────────────────────────────────┐
│                    BFF LAYER (Backend for Frontend)             │
│  ─────────────────────────────────────────────────────────────  │
│  NestJS (TypeScript)                                            │
│  • GraphQL API (Apollo Server)                                  │
│  • Auth/Permissions (Keycloak + LLM)                            │
│  • WebSockets (real-time updates)                               │
│  • Data aggregation                                             │
│  • Rate limiting & caching                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ gRPC
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & ORCHESTRATION                  │
│  ─────────────────────────────────────────────────────────────  │
│  Go (Fiber/Gin)                                                 │
│  • Service routing & load balancing                             │
│  • Circuit breaker & retry logic                                │
│  • Request/response transformation                              │
│  • Microservices orchestration                                  │
└─────────────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  GO SERVICES     │ │  PYTHON SERVICES │ │  WORKFLOW ENGINE │
│  ──────────────  │ │  ──────────────  │ │  ──────────────  │
│  • PIX           │ │  • LLM Service   │ │  • Temporal (Go) │
│  • DICT          │ │  • Embeddings    │ │  • Dagster (Py)  │
│  • Validation    │ │  • Analytics     │ │                  │
│  • Graph Queries │ │  • Doc Process   │ │                  │
│  • Search        │ │  • Fraud Detect  │ │                  │
│  • Permissions   │ │  • Agent Orch    │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LLM & AI LAYER                               │
│  ─────────────────────────────────────────────────────────────  │
│  Dev: Ollama (Llama 3.3 70B quantized 4-bit)                    │
│  Prod: vLLM (Llama 3.3 70B)                                     │
│  Agent Orchestration: LangGraph + CrewAI + LlamaIndex           │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE                                │
│  ─────────────────────────────────────────────────────────────  │
│  Apache Pulsar                                                  │
│  • Event streaming (PIX, DICT)                                  │
│  • Pub/Sub messaging                                            │
│  • Multi-tenancy                                                │
│  • Geo-replication                                              │
└─────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Triple Gold)                     │
│  ─────────────────────────────────────────────────────────────  │
│  Gold SQL: PostgreSQL 16 (transacional, JSONB, full-text)       │
│  Gold Graph: NebulaGraph (relacionamentos, fraud detection)     │
│  Gold Vector: Qdrant (embeddings, busca semântica)              │
│  Cache: Valkey (Redis fork, sessions, rate limiting)            │
│  Search: Meilisearch (full-text search avançado)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Stack Frontend

### **Framework Principal**
```
Next.js 15 (App Router)
```

**Justificativa:**
- ✅ **SSR/SSG nativo**: SEO e performance
- ✅ **File-based routing**: Organização clara
- ✅ **Server Components**: Reduz bundle size
- ✅ **API Routes**: Endpoints simples integrados
- ✅ **Middleware**: Auth e permissions
- ✅ **Image Optimization**: Automática
- ✅ **i18n**: Suporte nativo

**Alternativas consideradas:**
- React + Vite (sem SSR)
- Remix (menos maduro)
- SvelteKit (menor ecosystem)

---

### **Internacionalização**
```
next-intl
```

**Justificativa:**
- ✅ **Next.js native**: Integração perfeita com App Router
- ✅ **Server Components**: Funciona em RSC
- ✅ **Type-safe**: Traduções tipadas
- ✅ **ICU MessageFormat**: Plurals, dates, numbers

**Idiomas suportados:**
- 🇧🇷 Português (pt-BR) - Principal
- 🇺🇸 Inglês (en-US)
- 🇪🇸 Espanhol (es-ES)

**Estrutura:**
```
locales/
  pt-BR/
    common.json
    backoffice.json
    frontoffice.json
    errors.json
    validation.json
  en-US/
    ...
  es-ES/
    ...
```

---

### **UI Framework**
```
Tailwind CSS 4 + shadcn/ui
```

**Justificativa:**
- ✅ **Zero runtime**: Apenas CSS
- ✅ **Customização total**: Design system próprio
- ✅ **Componentes acessíveis**: shadcn/ui (Radix UI)
- ✅ **Dark mode**: Nativo
- ✅ **Responsive**: Mobile-first

**Componentes principais:**
- TanStack Table (tabelas avançadas)
- Apache ECharts (gráficos)
- Cytoscape.js (visualização de grafo)
- React Hook Form + Zod (formulários)

---

### **State Management**
```
Zustand + TanStack Query
```

**Justificativa:**
- ✅ **Zustand**: UI state (modals, sidebar, theme)
- ✅ **TanStack Query**: Server state (cache, sync)
- ✅ **Leve**: Zustand = 1kb
- ✅ **Type-safe**: TypeScript nativo

---

## 🔧 Stack Backend

### **BFF (Backend for Frontend)**
```
NestJS (TypeScript)
```

**Justificativa:**
- ✅ **Arquitetura enterprise**: Modular, DI
- ✅ **GraphQL**: Apollo Server integrado
- ✅ **Microservices**: gRPC, TCP, Redis
- ✅ **TypeScript-first**: Type-safety
- ✅ **Testing**: Jest integrado
- ✅ **OpenAPI**: Auto-geração de docs

**Responsabilidades:**
- GraphQL API para Next.js
- Agregação de dados de múltiplos microservices
- Auth/Permissions (Keycloak + LLM)
- WebSockets (real-time)
- Rate limiting & caching

**Módulos principais:**
```
src/
  auth/          # Keycloak integration
  graphql/       # GraphQL resolvers
  permissions/   # LLM-based permissions
  websocket/     # Real-time updates
  aggregation/   # Data aggregation
```

---

### **API Gateway & Orchestration**
```
Go 1.22+ (Fiber)
```

**Justificativa:**
- ✅ **Performance**: 10-50x mais rápido que Node.js
- ✅ **Concorrência**: Goroutines nativas
- ✅ **Baixo consumo**: Memória e CPU
- ✅ **gRPC**: Comunicação type-safe
- ✅ **Resiliência**: Circuit breaker, retry

**Responsabilidades:**
- Service routing & load balancing
- Circuit breaker & retry logic
- Request/response transformation
- Microservices orchestration
- Health checks & service discovery

**Framework:**
```
Fiber v2
```

**Por quê Fiber:**
- ✅ Express-like API (familiar)
- ✅ Performance extrema (Fasthttp)
- ✅ Middleware rico
- ✅ WebSocket support
- ✅ MIT License

**Alternativa:** Gin (mais maduro, comunidade maior)

---

### **Microservices de Alta Performance (Go)**

#### **PIX Service**
```go
// Processamento de transações PIX em tempo real
package pix

type PixService struct {
    pulsar    *pulsar.Client
    postgres  *pgx.Pool
    validator *Validator
}

func (s *PixService) ProcessTransaction(ctx context.Context, tx *Transaction) error {
    // 1. Validar transação
    if err := s.validator.Validate(tx); err != nil {
        return err
    }
    
    // 2. Publicar no Pulsar
    if err := s.pulsar.Publish(ctx, "pix.transactions", tx); err != nil {
        return err
    }
    
    // 3. Persistir no PostgreSQL
    return s.postgres.SaveTransaction(ctx, tx)
}
```

**Responsabilidades:**
- Validação de transações PIX
- Integração com BACEN
- Processamento em tempo real
- Compensações (sagas)

---

#### **DICT Service**
```go
// Gerenciamento de chaves PIX (DICT)
package dict

type DictService struct {
    nebulaGraph *nebula.Client
    postgres    *pgx.Pool
}

func (s *DictService) RegisterKey(ctx context.Context, key *PixKey) error {
    // 1. Validar chave
    // 2. Verificar duplicatas (NebulaGraph)
    // 3. Registrar no DICT (BACEN)
    // 4. Persistir (PostgreSQL + NebulaGraph)
}
```

---

#### **Validation Service**
```go
// Validação de regras de negócio
package validation

type ValidationService struct {
    llmClient *llm.Client
    rulesDB   *RulesDatabase
}

func (s *ValidationService) ValidateEntity(ctx context.Context, entity *Entity) (*ValidationResult, error) {
    // 1. Buscar regras aplicáveis
    rules := s.rulesDB.GetRules(entity.Type)
    
    // 2. LLM valida
    return s.llmClient.Validate(ctx, entity, rules)
}
```

---

#### **Graph Service**
```go
// Queries no NebulaGraph
package graph

type GraphService struct {
    nebula *nebula.Client
}

func (s *GraphService) FindRelationships(ctx context.Context, entityID string, depth int) (*Graph, error) {
    // nGQL query
    query := fmt.Sprintf(`
        MATCH (v:Entity {id: "%s"})-[e*1..%d]->(v2)
        RETURN v, e, v2
    `, entityID, depth)
    
    return s.nebula.Execute(ctx, query)
}
```

---

#### **Search Service**
```go
// Wrapper para Meilisearch
package search

type SearchService struct {
    meilisearch *meilisearch.Client
}

func (s *SearchService) Search(ctx context.Context, query string, filters map[string]interface{}) (*SearchResult, error) {
    return s.meilisearch.Search(ctx, "entities", &meilisearch.SearchRequest{
        Query:  query,
        Filter: filters,
        Limit:  20,
    })
}
```

---

### **AI & Data Processing (Python)**

#### **LLM Service**
```python
# FastAPI service para processamento LLM
from fastapi import FastAPI
from vllm import LLM, SamplingParams

app = FastAPI()
llm = LLM(model="meta-llama/Llama-3.3-70B")

@app.post("/validate")
async def validate_entity(request: ValidationRequest):
    prompt = build_validation_prompt(request)
    
    output = llm.generate(
        prompts=[prompt],
        sampling_params=SamplingParams(
            temperature=0.1,
            max_tokens=2048
        )
    )
    
    return parse_validation_result(output[0].outputs[0].text)
```

---

#### **Embedding Service**
```python
# Geração de embeddings para busca semântica
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

model = SentenceTransformer('intfloat/multilingual-e5-large')
qdrant = QdrantClient(host="localhost", port=6333)

@app.post("/embed")
async def generate_embeddings(texts: List[str]):
    embeddings = model.encode(texts)
    
    # Upload para Qdrant
    qdrant.upsert(
        collection_name="entities",
        points=[
            PointStruct(
                id=idx,
                vector=embedding.tolist(),
                payload={"text": text}
            )
            for idx, (text, embedding) in enumerate(zip(texts, embeddings))
        ]
    )
    
    return {"count": len(embeddings)}
```

---

#### **Agent Orchestration Service**
```python
# Orquestração de agentes com CrewAI + LangGraph
from crewai import Agent, Task, Crew
from langgraph.graph import StateGraph

# Agentes especializados
pf_agent = Agent(
    role='Especialista em Pessoa Física',
    goal='Extrair e validar dados de PF',
    backstory='Conhece todas as regras BACEN para PF',
    llm=llm
)

compliance_agent = Agent(
    role='Compliance Officer',
    goal='Validar conformidade com normas',
    backstory='Especialista em regulamentação BACEN',
    llm=llm
)

# Workflow com LangGraph
workflow = StateGraph(EntityState)
workflow.add_node("extract", extract_node)
workflow.add_node("validate", validate_node)
workflow.add_node("save", save_node)

@app.post("/process-entity")
async def process_entity(raw_input: str):
    # 1. CrewAI extrai e valida
    crew = Crew(agents=[pf_agent, compliance_agent], tasks=[...])
    result = crew.kickoff()
    
    # 2. LangGraph gerencia workflow
    final_state = workflow.invoke({"raw_input": raw_input})
    
    return final_state
```

---

## 💾 Databases

### **Gold SQL (Transacional)**
```
PostgreSQL 16
```

**Justificativa:**
- ✅ **ACID**: Transações confiáveis
- ✅ **JSONB**: Metadados flexíveis
- ✅ **Full-text search**: pg_trgm
- ✅ **Extensões**: pgvector, timescaledb
- ✅ **Performance**: Excelente para OLTP
- ✅ **Maturidade**: 30+ anos

**Extensões instaladas:**
```sql
CREATE EXTENSION pg_trgm;        -- Fuzzy search
CREATE EXTENSION pgvector;       -- Vector embeddings
CREATE EXTENSION timescaledb;    -- Time-series (auditoria)
CREATE EXTENSION pg_cron;        -- Scheduled jobs
```

**Schema principal:**
```sql
-- Tabela universal de objetos
CREATE TABLE objects (
  id BIGSERIAL PRIMARY KEY,
  object_type_id INT NOT NULL REFERENCES object_types(id),
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  current_state VARCHAR(50) NOT NULL,
  metadata JSONB NOT NULL,
  search_vector TSVECTOR,
  CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX idx_objects_type ON objects(object_type_id);
CREATE INDEX idx_objects_state ON objects(current_state);
CREATE INDEX idx_objects_metadata ON objects USING GIN(metadata);
CREATE INDEX idx_objects_search ON objects USING GIN(search_vector);

-- Tabela de relacionamentos
CREATE TABLE relationships (
  id BIGSERIAL PRIMARY KEY,
  relationship_type_id INT NOT NULL REFERENCES relationship_types(id),
  source_object_id BIGINT NOT NULL REFERENCES objects(id),
  target_object_id BIGINT NOT NULL REFERENCES objects(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INT NOT NULL REFERENCES users(id)
);
```

---

### **Gold Graph (Relacionamentos)**
```
NebulaGraph
```

**Justificativa:**
- ✅ **Performance**: 10x mais rápido que Neo4j
- ✅ **Escalabilidade**: Distributed nativo
- ✅ **Apache 2.0**: Licença permissiva
- ✅ **nGQL**: Query language similar a Cypher
- ✅ **Separação compute/storage**: Escalável

**Schema:**
```nGQL
-- Criar space
CREATE SPACE lbpay(partition_num=10, replica_factor=3, vid_type=FIXED_STRING(64));

-- Definir tags (tipos de nós)
CREATE TAG Entity(
  object_type string,
  name string,
  created_at timestamp,
  metadata string
);

CREATE TAG ClientePF(
  cpf string,
  nome_completo string,
  data_nascimento date,
  renda_mensal double
);

CREATE TAG ClientePJ(
  cnpj string,
  razao_social string,
  faturamento_anual double
);

-- Definir edges (tipos de relacionamentos)
CREATE EDGE possui_conta(
  tipo_conta string,
  data_abertura timestamp
);

CREATE EDGE socio_de(
  percentual double,
  tipo_socio string,
  data_inicio timestamp
);

-- Query exemplo: Encontrar sócios de empresas inadimplentes
MATCH (pf:ClientePF)-[:socio_de]->(pj:ClientePJ)
WHERE pj.metadata CONTAINS "inadimplente"
RETURN pf, pj;
```

---

### **Gold Vector (Busca Semântica)**
```
Qdrant
```

**Justificativa:**
- ✅ **Performance**: Rust-based
- ✅ **Filtros**: Combina vector + metadata
- ✅ **Payload**: Armazena dados junto com vectors
- ✅ **Sharding**: Escalável horizontalmente
- ✅ **Apache 2.0**: Open-source

**Schema:**
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(host="localhost", port=6333)

# Criar collection
client.create_collection(
    collection_name="entities",
    vectors_config=VectorParams(
        size=1024,  # multilingual-e5-large
        distance=Distance.COSINE
    )
)

# Inserir vectors
client.upsert(
    collection_name="entities",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, ...],  # 1024 dimensões
            payload={
                "object_type": "cliente_pf",
                "name": "João Silva",
                "cpf": "123.456.789-00",
                "metadata": {...}
            }
        )
    ]
)

# Busca semântica com filtros
results = client.search(
    collection_name="entities",
    query_vector=[0.1, 0.2, ...],
    query_filter={
        "must": [
            {"key": "object_type", "match": {"value": "cliente_pf"}}
        ]
    },
    limit=10
)
```

---

### **Cache & Session**
```
Valkey (Redis fork)
```

**Justificativa:**
- ✅ **Open-source**: BSD-3 (Redis mudou licença)
- ✅ **Linux Foundation**: Mantido pela comunidade
- ✅ **100% compatível**: Drop-in replacement do Redis
- ✅ **Performance**: In-memory

**Casos de uso:**
```redis
# Session storage (Keycloak)
SET session:abc123 "{user_id: 1, roles: [...]}" EX 3600

# Cache de queries
SET cache:entities:list "{...}" EX 300

# Rate limiting
INCR ratelimit:user:1:minute
EXPIRE ratelimit:user:1:minute 60

# Pub/Sub (real-time)
PUBLISH notifications:user:1 "{type: 'entity_updated', ...}"
```

---

### **Message Queue**
```
Apache Pulsar
```

**Justificativa:**
- ✅ **Performance**: Milhões de mensagens/segundo
- ✅ **Durabilidade**: BookKeeper (storage separado)
- ✅ **Multi-tenancy**: Nativo
- ✅ **Geo-replication**: Múltiplos data centers
- ✅ **Stream + Queue**: Ambos os modelos
- ✅ **Apache 2.0**: Open-source

**Comparação com RabbitMQ:**

| Feature | Apache Pulsar | RabbitMQ |
|---------|---------------|----------|
| Throughput | Milhões/seg | Centenas de milhares/seg |
| Latência | < 5ms | ~10ms |
| Durabilidade | ✅ Nativa | ⚠️ Limitada |
| Multi-tenancy | ✅ | ❌ |
| Geo-replication | ✅ | ⚠️ Plugins |
| Stream + Queue | ✅ | ❌ |

**Arquitetura:**
```
┌─────────────────────────────────────────┐
│  Pulsar Brokers (stateless)             │
│  • Message routing                       │
│  • Load balancing                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  BookKeeper (storage)                   │
│  • Persistent storage                    │
│  • Replication                           │
└─────────────────────────────────────────┘
```

**Topics:**
```
persistent://lbpay/pix/transactions
persistent://lbpay/dict/keys
persistent://lbpay/entities/created
persistent://lbpay/entities/updated
persistent://lbpay/workflows/state-changes
```

---

### **Search Engine**
```
Meilisearch
```

**Justificativa:**
- ✅ **Performance**: Rust-based
- ✅ **Facilidade**: Setup em minutos
- ✅ **Typo-tolerance**: Busca fuzzy
- ✅ **Facets**: Filtros dinâmicos
- ✅ **MIT License**: Open-source

**Índices:**
```json
{
  "uid": "entities",
  "primaryKey": "id",
  "searchableAttributes": [
    "name",
    "cpf",
    "cnpj",
    "email",
    "metadata"
  ],
  "filterableAttributes": [
    "object_type",
    "current_state",
    "created_at"
  ],
  "sortableAttributes": [
    "created_at",
    "updated_at"
  ]
}
```

---

## 🤖 LLM & AI

### **LLM Self-Hosted**

#### **Desenvolvimento**
```
Ollama + Llama 3.3 70B (quantized 4-bit)
```

**Justificativa:**
- ✅ **Facilidade**: `ollama run llama3.3:70b-q4`
- ✅ **CPU/GPU**: Funciona em ambos
- ✅ **API**: OpenAI-compatible
- ✅ **Quantização**: Automática

**Requisitos:**
- GPU: NVIDIA RTX 4090 (24GB VRAM)
- RAM: 64GB
- Storage: 100GB

---

#### **Produção**
```
vLLM + Llama 3.3 70B
```

**Justificativa:**
- ✅ **Performance**: 24x mais rápido que HuggingFace
- ✅ **Throughput**: PagedAttention
- ✅ **Batching**: Continuous batching
- ✅ **Multi-GPU**: Tensor parallelism

**Requisitos:**
- GPU: 2x NVIDIA A100 40GB
- RAM: 256GB
- Storage: 500GB NVMe

**Deployment:**
```bash
# Docker
docker run --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.3-70B \
  --tensor-parallel-size 2
```

---

### **Embeddings**
```
multilingual-e5-large
```

**Justificativa:**
- ✅ **Multilingual**: Excelente para pt-BR
- ✅ **Performance**: 560M parâmetros
- ✅ **Dimensões**: 1024
- ✅ **Open-source**: MIT

**Deployment:**
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('intfloat/multilingual-e5-large')

# Gerar embeddings
texts = ["Cliente João Silva, CPF 123.456.789-00"]
embeddings = model.encode(texts)  # (1, 1024)
```

---

## 🎭 Orquestração

### **Agent Orchestration**

#### **LangGraph**
```
Workflows de validação com estados
```

**Casos de uso:**
- Estado: rascunho → em_análise → aprovado
- Checkpoints em cada etapa
- Human-in-the-loop para aprovações

**Exemplo:**
```python
from langgraph.graph import StateGraph

class EntityState(TypedDict):
    raw_input: str
    extracted_data: dict
    validation_result: dict
    current_state: str

workflow = StateGraph(EntityState)
workflow.add_node("extract", extract_node)
workflow.add_node("validate", validate_node)
workflow.add_node("save", save_node)

workflow.add_edge("extract", "validate")
workflow.add_conditional_edges(
    "validate",
    lambda state: "save" if state["validation_result"]["valid"] else "extract"
)
```

---

#### **CrewAI**
```
Agentes especializados colaborando
```

**Casos de uso:**
- Agente PF (especialista em pessoa física)
- Agente PJ (especialista em pessoa jurídica)
- Agente Compliance (valida normas BACEN)
- Agente Fraud (detecção de fraude)

**Exemplo:**
```python
from crewai import Agent, Task, Crew

pf_agent = Agent(
    role='Especialista em Pessoa Física',
    goal='Extrair e validar dados de PF',
    backstory='Conhece todas as regras BACEN para PF',
    llm=llm
)

compliance_agent = Agent(
    role='Compliance Officer',
    goal='Validar conformidade com normas',
    backstory='Especialista em regulamentação BACEN',
    llm=llm
)

crew = Crew(
    agents=[pf_agent, compliance_agent],
    tasks=[extract_task, validate_task]
)

result = crew.kickoff()
```

---

#### **LlamaIndex**
```
RAG para documentos
```

**Casos de uso:**
- Indexar documentos BACEN
- Indexar políticas internas
- Retrieval contextual

**Exemplo:**
```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

# Carregar documentos
documents = SimpleDirectoryReader('docs/bacen').load_data()

# Criar índice
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("Qual a idade mínima para abertura de conta?")
```

---

### **Workflow Orchestration**

#### **Temporal**
```
Processos de negócio longos
```

**Casos de uso:**
- KYC workflow (pode levar dias)
- Aprovações em múltiplas etapas
- Transações PIX (compensações)
- Workflows com SLA

**Exemplo:**
```python
from temporalio import workflow

@workflow.defn
class KYCWorkflow:
    @workflow.run
    async def run(self, entity_id: int) -> str:
        # Etapa 1: Validação automática
        validation = await workflow.execute_activity(
            validate_entity,
            entity_id,
            start_to_close_timeout=timedelta(minutes=5)
        )
        
        if not validation.auto_approved:
            # Etapa 2: Aprovação humana (pode levar dias)
            approval = await workflow.wait_condition(
                lambda: self.approval_received,
                timeout=timedelta(days=7)
            )
            
            if not approval:
                return "REJECTED_TIMEOUT"
        
        # Etapa 3: Ativação
        await workflow.execute_activity(
            activate_entity,
            entity_id,
            start_to_close_timeout=timedelta(minutes=1)
        )
        
        return "APPROVED"
```

---

#### **Dagster**
```
Pipelines de dados
```

**Casos de uso:**
- ETL de documentos → PostgreSQL
- Sincronização SQL → Graph → Vector
- Geração de embeddings em batch
- Relatórios agendados

**Exemplo:**
```python
from dagster import asset

@asset
def entities_in_postgres():
    return fetch_entities_from_postgres()

@asset(deps=[entities_in_postgres])
def entities_in_graph(entities_in_postgres):
    sync_to_nebula_graph(entities_in_postgres)
    return entities_in_postgres

@asset(deps=[entities_in_postgres])
def entity_embeddings(entities_in_postgres):
    embeddings = generate_embeddings(entities_in_postgres)
    upload_to_qdrant(embeddings)
    return embeddings
```

---

## 🔐 Security

### **Authentication**
```
Keycloak
```

**Justificativa:**
- ✅ **Enterprise-grade**: Red Hat (IBM)
- ✅ **Protocols**: OAuth 2.0, OIDC, SAML
- ✅ **SSO**: Single Sign-On
- ✅ **MFA**: Multi-factor authentication
- ✅ **Federation**: LDAP, Active Directory
- ✅ **Social Login**: Google, Facebook, etc.

**Configuração:**
```yaml
# Realm: lbpay
realms:
  - realm: lbpay
    enabled: true
    clients:
      - clientId: nextjs-frontend
        protocol: openid-connect
        redirectUris:
          - https://app.lbpay.com/*
      - clientId: nestjs-bff
        protocol: openid-connect
        serviceAccountsEnabled: true
    roles:
      - name: admin
      - name: backoffice_operator
      - name: compliance_officer
      - name: auditor
```

---

### **Authorization**
```
Sistema Híbrido: Keycloak RBAC + LLM Contextual
```

**Fluxo:**
1. Keycloak valida JWT e extrai roles
2. NestJS verifica role básico
3. Go Service chama LLM para validação contextual
4. LLM analisa: role + estado do objeto + políticas
5. Retorna: permitido/negado + explicação

**Exemplo:**
```go
// Go
func CheckPermission(ctx context.Context, req *PermissionRequest) (*PermissionResponse, error) {
    // 1. Validar JWT (Keycloak)
    claims, err := keycloak.ValidateToken(req.Token)
    if err != nil {
        return &PermissionResponse{Allowed: false, Reason: "Token inválido"}, nil
    }
    
    // 2. Verificar role básico
    if !hasRole(claims.Roles, req.RequiredRole) {
        return &PermissionResponse{Allowed: false, Reason: "Role insuficiente"}, nil
    }
    
    // 3. LLM valida contexto
    llmResponse, err := llmClient.ValidatePermission(ctx, &LLMPermissionRequest{
        User:       claims,
        Action:     req.Action,
        ObjectType: req.ObjectType,
        Instance:   req.Instance,
        Policies:   getPolicies(req.ObjectType),
    })
    
    return &PermissionResponse{
        Allowed: llmResponse.Allowed,
        Reason:  llmResponse.Reason,
    }, nil
}
```

---

### **Secrets Management**
```
HashiCorp Vault
```

**Justificativa:**
- ✅ **Encryption**: Dados em repouso e trânsito
- ✅ **Dynamic secrets**: Geração automática
- ✅ **Audit logs**: Rastreamento completo
- ✅ **MPL 2.0**: Open-source

**Secrets armazenados:**
- Database credentials
- API keys (Keycloak, LLM, etc.)
- Certificates (TLS)
- Encryption keys

---

## 📊 Observability

### **Metrics**
```
Prometheus + Grafana
```

**Métricas coletadas:**
- Request rate, latency, errors (RED)
- CPU, memory, disk (USE)
- Custom business metrics

**Dashboards:**
- System overview
- Service health
- Database performance
- LLM usage & cost

---

### **Logs**
```
Loki (Grafana)
```

**Logs estruturados:**
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "level": "info",
  "service": "pix-service",
  "trace_id": "abc123",
  "message": "Transaction processed",
  "metadata": {
    "transaction_id": "tx_123",
    "amount": 100.00,
    "duration_ms": 45
  }
}
```

---

### **Tracing**
```
Jaeger + OpenTelemetry
```

**Instrumentação:**
- Go: `go.opentelemetry.io/otel`
- Python: `opentelemetry-api`
- Node.js: `@opentelemetry/sdk-node`

**Trace exemplo:**
```
Frontend (Next.js)
  ↓ 150ms
BFF (NestJS) - GraphQL resolver
  ↓ 50ms
API Gateway (Go) - Route to PIX service
  ↓ 30ms
PIX Service (Go) - Process transaction
  ↓ 20ms
PostgreSQL - Save transaction
```

---

## 🚀 Roadmap de Implementação

### **Fase 1: Foundation (4 semanas)**

**Semana 1-2: Frontend Migration**
- [ ] Criar projeto Next.js 15
- [ ] Migrar páginas React → Next.js App Router
- [ ] Configurar next-intl (pt-BR, en-US, es-ES)
- [ ] Configurar Tailwind 4 + shadcn/ui
- [ ] Implementar layout base (Backoffice + Front-office)

**Semana 3-4: BFF Setup**
- [ ] Criar projeto NestJS
- [ ] Configurar GraphQL (Apollo Server)
- [ ] Integrar Keycloak (OIDC)
- [ ] Implementar auth middleware
- [ ] Criar primeiros resolvers

---

### **Fase 2: Core Services (6 semanas)**

**Semana 5-6: Database Setup**
- [ ] Deploy PostgreSQL 16
- [ ] Migrar dados de TiDB → PostgreSQL
- [ ] Deploy Valkey (Redis)
- [ ] Deploy Meilisearch
- [ ] Configurar backups

**Semana 7-8: Go Services**
- [ ] Criar API Gateway (Fiber)
- [ ] Implementar service routing
- [ ] Criar Validation Service
- [ ] Criar Search Service
- [ ] Configurar gRPC communication

**Semana 9-10: Python Services**
- [ ] Deploy Ollama (dev)
- [ ] Criar LLM Service (FastAPI)
- [ ] Criar Embedding Service
- [ ] Implementar Agent Orchestration (CrewAI + LangGraph)
- [ ] Configurar LlamaIndex (RAG)

---

### **Fase 3: Advanced Features (6 semanas)**

**Semana 11-12: Graph & Vector**
- [ ] Deploy NebulaGraph
- [ ] Deploy Qdrant
- [ ] Migrar dados para graph
- [ ] Implementar busca semântica
- [ ] Criar Graph Service (Go)

**Semana 13-14: Messaging & Workflows**
- [ ] Deploy Apache Pulsar
- [ ] Configurar topics
- [ ] Deploy Temporal
- [ ] Deploy Dagster
- [ ] Implementar workflows de exemplo

**Semana 15-16: PIX/DICT Services**
- [ ] Criar PIX Service (Go)
- [ ] Criar DICT Service (Go)
- [ ] Integrar com Pulsar
- [ ] Implementar sagas/compensações
- [ ] Testes de carga

---

### **Fase 4: Production (4 semanas)**

**Semana 17-18: Infrastructure**
- [ ] Configurar Kubernetes
- [ ] Deploy Kong Gateway
- [ ] Configurar Helm Charts
- [ ] Setup CI/CD (GitLab + ArgoCD)
- [ ] Configurar auto-scaling

**Semana 19-20: Observability & Security**
- [ ] Deploy Prometheus + Grafana
- [ ] Deploy Loki + Jaeger
- [ ] Configurar OpenTelemetry
- [ ] Deploy Vault
- [ ] Configurar TLS/SSL
- [ ] Penetration testing

---

### **Fase 5: Production LLM (2 semanas)**

**Semana 21-22: vLLM Production**
- [ ] Deploy vLLM (2x A100)
- [ ] Migrar de Ollama → vLLM
- [ ] Load testing
- [ ] Fine-tuning (opcional)
- [ ] Monitoramento de custos

---

## 💰 Análise de Custos

### **Desenvolvimento (Self-Hosted)**

| Componente | Specs | Custo/mês |
|------------|-------|-----------|
| Frontend Dev | 1x VM (4GB RAM, 2 vCPU) | $20 |
| Backend Dev | 2x VM (8GB RAM, 4 vCPU) | $80 |
| Databases Dev | 2x VM (16GB RAM, 8 vCPU) | $160 |
| LLM Dev (Ollama) | 1x GPU VM (RTX 4090 24GB) | $1.080 |
| Storage | 500GB SSD | $50 |
| **Total Dev** | | **$1.390/mês** |

---

### **Produção (Self-Hosted)**

| Componente | Specs | Custo/mês |
|------------|-------|-----------|
| Frontend (Next.js) | 3x VM (8GB RAM, 4 vCPU) | $180 |
| BFF (NestJS) | 3x VM (16GB RAM, 8 vCPU) | $480 |
| API Gateway (Go) | 3x VM (8GB RAM, 4 vCPU) | $180 |
| Go Services | 6x VM (16GB RAM, 8 vCPU) | $960 |
| Python Services | 3x VM (32GB RAM, 16 vCPU) | $900 |
| PostgreSQL | 3x VM (64GB RAM, 32 vCPU) | $1.800 |
| NebulaGraph | 3x VM (32GB RAM, 16 vCPU) | $900 |
| Qdrant | 2x VM (32GB RAM, 16 vCPU) | $600 |
| Valkey | 2x VM (16GB RAM, 8 vCPU) | $320 |
| Pulsar | 3x VM (32GB RAM, 16 vCPU) | $900 |
| Meilisearch | 2x VM (16GB RAM, 8 vCPU) | $320 |
| Temporal | 3x VM (16GB RAM, 8 vCPU) | $480 |
| Dagster | 2x VM (16GB RAM, 8 vCPU) | $320 |
| Keycloak | 2x VM (8GB RAM, 4 vCPU) | $120 |
| LLM (vLLM) | 2x GPU VM (A100 40GB) | $4.320 |
| Monitoring | 2x VM (16GB RAM, 8 vCPU) | $320 |
| Load Balancer | Kong | $100 |
| Storage | 5TB SSD | $500 |
| **Total Prod** | | **$13.700/mês** |

---

### **Comparação com SaaS**

| Serviço | SaaS | Self-Hosted | Economia |
|---------|------|-------------|----------|
| Auth (Auth0) | $2.000 | $120 | 94% |
| Graph DB (Neo4j Aura) | $5.000 | $900 | 82% |
| Vector DB (Pinecone) | $2.000 | $600 | 70% |
| Search (Elastic Cloud) | $3.000 | $320 | 89% |
| LLM (OpenAI GPT-4) | $15.000 | $4.320 | 71% |
| Message Queue (Confluent) | $3.000 | $900 | 70% |
| **Total** | **$30.000** | **$13.700** | **54%** |

**Economia total: $16.300/mês ou $195.600/ano**

---

## 📋 Stack Resumida Final

### **Frontend**
- ✅ Next.js 15 (App Router)
- ✅ next-intl (i18n)
- ✅ Tailwind CSS 4 + shadcn/ui
- ✅ Zustand + TanStack Query
- ✅ TanStack Table + Apache ECharts + Cytoscape.js

### **Backend**
- ✅ NestJS (BFF - TypeScript)
- ✅ Go 1.22+ (API Gateway + Microservices)
- ✅ Python 3.11+ (AI/ML + Agent Orchestration)

### **Databases**
- ✅ PostgreSQL 16 (Gold SQL)
- ✅ NebulaGraph (Gold Graph)
- ✅ Qdrant (Gold Vector)
- ✅ Valkey (Cache)
- ✅ Meilisearch (Search)
- ✅ Apache Pulsar (Message Queue)

### **LLM & AI**
- ✅ Ollama (dev) + vLLM (prod)
- ✅ Llama 3.3 70B
- ✅ multilingual-e5-large (embeddings)
- ✅ LangGraph + CrewAI + LlamaIndex

### **Orchestration**
- ✅ Temporal (workflows)
- ✅ Dagster (data pipelines)

### **Auth & Security**
- ✅ Keycloak (SSO, OIDC)
- ✅ Sistema Híbrido (RBAC + LLM)
- ✅ HashiCorp Vault (secrets)

### **Infrastructure**
- ✅ Docker + Kubernetes
- ✅ Kong Gateway
- ✅ ArgoCD (GitOps)
- ✅ Prometheus + Grafana + Loki + Jaeger
- ✅ OpenTelemetry

---

## ✅ Conclusão

Esta stack tecnológica foi meticulosamente escolhida para:

- ✅ **100% Open-Source**: Zero custo de licença
- ✅ **Self-Hosted**: Controle total
- ✅ **Enterprise-Grade**: Escalável, resiliente, seguro
- ✅ **Polyglot**: Melhor linguagem para cada trabalho
- ✅ **Type-Safe**: TypeScript + Go + Python
- ✅ **AI-Native**: LLM no centro da arquitetura
- ✅ **Economia**: 54% vs SaaS ($195k/ano)

**Próximo passo:** Iniciar Fase 1 (Foundation)

# Stack Tecnológica SuperCore v2.0
## Consolidação Completa: Fundação Multilíngue, IA-Driven e Crescimento Exponencial

**Versão**: 2.0.0
**Data**: 2025-12-21
**Status**: Documento Definitivo - Revisão Crítica Completa
**Aprovação**: Pendente

> **Princípio Fundamental**: SuperCore é uma PLATAFORMA UNIVERSAL e AGNÓSTICA DE DOMÍNIO. Esta stack serve para GERAR soluções empresariais para QUALQUER domínio (Banking, CRM, ERP, Healthcare, Logística, etc.), não para uma solução específica.

---

## ÍNDICE

1. [Visão Geral da Stack](#1-visão-geral-da-stack)
2. [Stack por Camada (8 Camadas)](#2-stack-por-camada-8-camadas)
3. [Multilingua Nativo](#3-multilingua-nativo)
4. [LangFlow](#4-langflow)
5. [CrewAI](#5-crewai)
6. [Stack Completa (Tabelas)](#6-stack-completa-tabelas)
7. [Decisões Tecnológicas (ADRs)](#7-decisões-tecnológicas-adrs)
8. [Integrações e Protocolos](#8-integrações-e-protocolos)
9. [Segurança e Compliance](#9-segurança-e-compliance)
10. [Ferramentas de Desenvolvimento](#10-ferramentas-de-desenvolvimento)
11. [Roadmap da Stack](#11-roadmap-da-stack)
12. [Apêndices](#12-apêndices)
13. [Harmonia e Compatibilidade da Stack Frontend](#13-harmonia-e-compatibilidade-da-stack-frontend)

---

## 1. VISÃO GERAL DA STACK

### 1.1 Filosofia Tecnológica

O SuperCore v2.0 adota uma filosofia de **"Polyglot Architecture with AI-First Approach"**, onde:

#### Princípios de Seleção Tecnológica

1. **Melhor Ferramenta para Cada Trabalho**
   - Go: Performance crítica, concorrência massiva, serviços core
   - Python: IA/ML, processamento de dados, pipelines RAG
   - TypeScript: Type-safety no frontend, Node.js para BFF
   - Rust: Componentes ultra-performáticos (futuro)

2. **IA como Cidadão de Primeira Classe**
   - LLMs integrados nativamente (vLLM, Ollama, Claude API, OpenAI GPT-4)
   - Frameworks de orquestração de agentes (CrewAI, LangGraph)
   - Visual workflow builders (LangFlow)
   - Embeddings e RAG como primitivas

3. **Metadata-Driven, Configuration Over Code**
   - JSON Schema como fonte da verdade
   - Pydantic models com constrained decoding
   - OPA Rego para políticas complexas
   - Dynamic loading sem recompilação

4. **Cloud-Native e Event-Driven**
   - Containerização (Docker)
   - Orquestração (Kubernetes)
   - Message broker (Apache Pulsar)
   - Observabilidade (OpenTelemetry)

5. **Open Source First, Vendor Agnostic**
   - PostgreSQL (não AWS RDS proprietário)
   - NebulaGraph (não Neptune/CosmosDB)
   - Apache Pulsar (não Kafka/Kinesis lock-in)
   - MinIO (não S3 exclusivo)

6. **Meta-Plataforma: Geração, Não Implementação**
   - Stack contém ferramentas para GERAR soluções
   - LLMs, templates, AST manipulation para code generation
   - RAG 3D para consulta de conhecimento multimodal
   - Abstração total de domínio no core

### 1.2 Evolução v1 → v2.0

#### Stack v1.0 (Fundação)

**Foco**: Meta-objects, dynamic UI, RAG básico

**Tecnologias Core**:
- PostgreSQL 15 + pgvector
- NebulaGraph 3.7
- Go + Python + TypeScript
- Next.js 13 (Pages Router)
- Redis 7
- Elasticsearch (full-text search)
- Flink 1.17 (processamento streaming)
- Celery (background jobs)

**Limitações v1**:
- Criação manual de object_definitions
- Sem orquestração de agentes
- RAG básico (sem trimodal híbrido)
- Frontend estático (geração limitada)
- Sem MCP completo
- Sem Super Portal de gerenciamento
- Sem deployment orchestrator

#### Stack v2.0 (IA-Driven + Crescimento Exponencial)

**Foco**: Geração automática por IA, multi-agente, crescimento exponencial, Super Portal

**Inovações Tecnológicas**:

1. **Apache Pulsar v3.4.0** (NOVO)
   - Substitui Kafka para messaging
   - Multi-tenancy nativo
   - Schema Registry com Pydantic
   - Geo-replication

2. **CrewAI + LangGraph** (NOVO)
   - Orquestração multi-agente
   - State management para workflows complexos
   - Collaboration patterns

3. **LangFlow** (NOVO)
   - Visual workflow builder
   - Drag-and-drop para RAG pipelines
   - Integration com LangChain

4. **vLLM** (NOVO - Produção)
   - Inference engine otimizado
   - Suporte a Llama 3.1, Mistral, Qwen
   - GPU-accelerated

5. **OPA (Open Policy Agent)** (NOVO)
   - Policy engine para validações complexas
   - Rego language para regras
   - Compliance automático

6. **Template System com Pydantic** (NOVO)
   - Constrained decoding
   - Type-safe LLM outputs
   - Dynamic template generation

7. **Interaction Broker (Go)** (NOVO)
   - Valida mensagens MCP
   - Enriquece contexto
   - Publica via WebSocket/SSE

8. **Next.js 14 + App Router** (UPGRADE)
   - Server Components
   - Turbopack
   - React Server Actions

9. **shadcn/ui** (NOVO - Super Portal)
   - Componentes modernos e acessíveis
   - Customizáveis via TailwindCSS
   - Compatibilidade com i18n

10. **Lucide Icons** (NOVO - Super Portal)
    - Ícones modernos e leves
    - Árvore de shake automático
    - Compatível com React/Next.js

11. **i18next Ecosystem** (NOVO - Multi-idioma)
    - i18next (core)
    - react-i18next (React integration)
    - next-i18next (Next.js integration)

12. **Kubernetes + Helm + ArgoCD** (NOVO - Deployment)
    - Container orchestration
    - Package management
    - GitOps deployment

13. **NebulaGraph 3.8** (UPGRADE)
    - Melhorias de performance
    - NGSQL otimizado

14. **Code Generation Stack** (NOVO)
    - LangChain (prompts, chains)
    - Template engines (Jinja2, Handlebars)
    - AST manipulation (Python ast, Go parser)

**Stack v2.0 Visual (Diagrama em 8 Camadas)**:

```
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 7: SUPER PORTAL DE BACKOFFICE                            │
│ Next.js 14 (App Router) + React 18 + TypeScript 5.x             │
│ shadcn/ui + TailwindCSS + Lucide Icons + i18next                │
│ Oracle Manager UI + Dynamic UI Generator                        │
└──────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 6: DEPLOYMENT ORCHESTRATOR                               │
│ Kubernetes (Container Orchestration)                            │
│ Helm (Package Management) + ArgoCD (GitOps)                     │
│ Docker (Container Runtime) + Service Mesh (Istio/Linkerd)      │
└──────────────────────────────────────────────────────────────────┘
                              ↕ Deploy/Manage
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 5: APRESENTAÇÃO (Solução Gerada)                        │
│ Next.js 14 (App Router) + React 18 + TypeScript 5.x             │
│ shadcn/ui + TailwindCSS + React Flow + i18next                  │
│ Dynamic UI Generator + Formulários Auto-gerados                 │
└──────────────────────────────────────────────────────────────────┘
                              ↕ MCP
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 4: INTERFACE (MCPs)                                      │
│ Apache Pulsar 3.4 + Interaction Broker (Go)                     │
│ Template System (Pydantic) + Query Router                       │
│ WebSocket/SSE + MCP Protocol                                    │
└──────────────────────────────────────────────────────────────────┘
                              ↕ Events
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 3: ORQUESTRAÇÃO (Agentes)                                │
│ CrewAI + LangGraph + LangFlow                                   │
│ Autonomous Agents (Python/TypeScript)                           │
│ Multi-Agent Collaboration                                       │
└──────────────────────────────────────────────────────────────────┘
                              ↕ Utiliza
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 2: ABSTRAÇÃO (Objetos)                                   │
│ Data Entities (Pydantic + TypeScript)                           │
│ Integrations + Workflows + UI Components                        │
│ Metadata-Driven Engine + Code Generation                        │
└──────────────────────────────────────────────────────────────────┘
                              ↕ Consome
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 1: FUNDAÇÃO (Oráculo)                                    │
│ RAG 3D: PostgreSQL + NebulaGraph + pgvector                     │
│ LLMs: vLLM (prod) / Ollama (dev) / Claude / GPT-4              │
│ Knowledge Graph + Embeddings + Code Generation                  │
└──────────────────────────────────────────────────────────────────┘
                              ↕ Persiste
┌──────────────────────────────────────────────────────────────────┐
│ CAMADA 0: DADOS                                                 │
│ PostgreSQL 16 (JSONB + Row-Level Security)                      │
│ NebulaGraph 3.8 (Graph DB)                                      │
│ Redis 7 (Cache) + MinIO (Object Storage)                       │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 Princípios de Seleção Tecnológica

#### Como Selecionamos Tecnologias

**1. Performance e Escalabilidade**
- Go: Serviços core (Interaction Broker, API Gateway)
- PostgreSQL: Dados estruturados com JSONB
- NebulaGraph: Grafos com milhões de nós
- Apache Pulsar: Mensageria distribuída

**2. Ecossistema de IA/ML**
- Python: LangChain, CrewAI, LangFlow, vLLM
- Hugging Face: Embeddings models
- OpenAI/Anthropic APIs: LLMs externos
- Code generation: Templates + AST manipulation

**3. Developer Experience**
- TypeScript: Type-safety em todo frontend
- Pydantic: Type-safety em Python
- Hot reload: Next.js, Go air, Python uvicorn

**4. Manutenibilidade**
- Open source preferencial
- Comunidade ativa
- Documentação robusta
- Longevidade do projeto

**5. Compliance e Segurança**
- OPA: Policy enforcement (agnóstico de domínio)
- PostgreSQL RLS: Multi-tenancy seguro
- TLS 1.3: Comunicação criptografada
- Audit trails: Rastreabilidade completa

**6. Geração Automática de Código**
- LLMs para compreensão de requisitos
- Template engines para geração de boilerplate
- AST manipulation para code refinement
- Type-safe outputs (Pydantic, TypeScript interfaces)

---

## 2. STACK POR CAMADA (8 CAMADAS)

### 2.0 Camada 0: Dados (Persistência)

#### Bancos de Dados

##### PostgreSQL 16+

**Papel**: Database primário para dados estruturados

**Versão Mínima**: 16.0

**Extensões Utilizadas**:
- `pgvector 0.5.1+`: Armazenamento de embeddings (até 2000 dimensões)
- `uuid-ossp`: Geração de UUIDs
- `pg_stat_statements`: Performance monitoring
- `pg_trgm`: Busca fuzzy em texto

**Tabelas Core** (todas com `oracle_id NOT NULL` para multi-tenancy):
```sql
-- Meta-Objects (agnóstico de domínio)
object_definitions (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    name VARCHAR(255),
    version VARCHAR(20),
    schema JSONB,
    states JSONB,
    ui_hints JSONB,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

instances (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    object_definition_id UUID,
    data JSONB,
    current_state VARCHAR(50),
    embedding vector(1536),
    FOREIGN KEY (oracle_id) REFERENCES oracles(id),
    FOREIGN KEY (object_definition_id) REFERENCES object_definitions(id)
);

relationships (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    source_instance_id UUID,
    target_instance_id UUID,
    relationship_type VARCHAR(100),
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

validation_rules (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    object_definition_id UUID,
    rule_type VARCHAR(50),
    condition JSONB,
    error_message TEXT,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

-- Oracle Configuration
oracles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(100), -- Banking, CRM, Healthcare, etc
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

oracle_config (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    key VARCHAR(255),
    value JSONB,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

contexts (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    nome_modelo VARCHAR(255),
    status VARCHAR(50),
    inputs JSONB,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

specifications (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    context_id UUID,
    markdown_content TEXT,
    approved_at TIMESTAMP,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id),
    FOREIGN KEY (context_id) REFERENCES contexts(id)
);

-- Integration & Processing
integracao_externa (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    nome VARCHAR(255),
    tipo VARCHAR(100),
    config JSONB,
    credentials JSONB ENCRYPTED,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

process_definitions (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    name VARCHAR(255),
    workflow JSONB,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);

agents (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    name VARCHAR(255),
    role TEXT,
    responsibilities TEXT[],
    tools TEXT[],
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);
```

**Features Utilizadas**:
- **JSONB**: Armazenamento schemaless flexível (agnóstico de domínio)
- **Row-Level Security (RLS)**: Multi-tenancy seguro por `oracle_id`
- **Partial Indexes**: Otimização de queries filtradas por `oracle_id`
- **LISTEN/NOTIFY**: Real-time updates
- **Full-Text Search**: Busca em campos texto

**Bibliotecas de Acesso**:
- **Go**: `pgx` (driver nativo) + `sqlc` (type-safe queries)
- **Python**: `asyncpg` (async) + `SQLAlchemy 2.0` (ORM)
- **TypeScript**: `pg` + `Prisma` (ORM opcional)

**Configuração de Performance**:
```conf
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 500
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 16MB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

##### NebulaGraph 3.8+

**Papel**: Graph database para conhecimento semântico e relacionamentos (agnóstico)

**Versão Mínima**: 3.8.0

**Componentes**:
- **Graph Service**: Processamento de queries NGSQL
- **Meta Service**: Metadados do cluster
- **Storage Service**: Persistência distribuída

**Schema** (Spaces por Oracle - agnóstico de domínio):
```ngql
-- Space: oracle_{oracle_id}
CREATE SPACE oracle_{oracle_id} (
    vid_type=FIXED_STRING(36),
    partition_num=10,
    replica_factor=1
);

-- Tags (Nós) - Genéricos
CREATE TAG ObjectDefinition(name string, version string, schema string);
CREATE TAG Instance(object_type string, data string, state string);
CREATE TAG Document(title string, version string, doc_type string);
CREATE TAG Rule(name string, condition string, source string);
CREATE TAG Policy(name string, category string, domain string);
CREATE TAG Integration(name string, type string, config string);

-- Edge Types (Relacionamentos) - Genéricos
CREATE EDGE POSSUI(cardinality string);
CREATE EDGE BASEADA_EM(fonte string);
CREATE EDGE DERIVADA_DE(transformacao string);
CREATE EDGE GOVERNA(tipo_governanca string);
CREATE EDGE INTEGRA_COM(protocol string);
```

**Query Patterns** (genéricos):
```ngql
-- Busca: Quais regras derivam de um documento específico?
MATCH (doc:Document {id: "doc-123"})<-[:BASEADA_EM]-(regra:Rule)-[:GOVERNA]->(entidade:ObjectDefinition)
RETURN regra.name, regra.condition, entidade.name;

-- Busca: Impacto de mudança em regra
MATCH (regra:Rule {id: "rule-uuid"})-[:GOVERNA]->(obj:ObjectDefinition)<-[:INSTANCE_OF]-(inst:Instance)
RETURN obj.name, count(inst) as total_instances;

-- Busca: Cadeia de relacionamentos de um objeto
MATCH (obj:ObjectDefinition {name: "Entity"})-[r*1..3]-(related)
RETURN obj, r, related;
```

**Client Libraries**:
- **Python**: `nebula3-python`
- **Go**: `nebula-go`
- **TypeScript**: `nebula-node` (wrapper community)

**Performance**:
- Suporta grafos com 10M+ nós
- Queries NGSQL < 100ms (p99)
- Cluster com 3+ nós para HA

##### Redis 7.x

**Papel**: Cache distribuído, session storage, rate limiting

**Versão Mínima**: 7.0

**Estruturas de Dados Utilizadas**:
- **Strings**: Configurações, tokens JWT
- **Hashes**: User sessions, cached instances
- **Sets**: Tags, permissions
- **Sorted Sets**: Rate limiting (sliding window)
- **Streams**: Event sourcing (opcional)

**Padrões de Uso**:

1. **Cache de Instances**:
```python
# Python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Cache instance
r.setex(f"instance:{instance_id}", 3600, json.dumps(instance_data))

# Get cached instance
cached = r.get(f"instance:{instance_id}")
if cached:
    return json.loads(cached)
```

2. **Rate Limiting (Token Bucket)**:
```typescript
// TypeScript
class RateLimiter {
  async checkRateLimit(userId: string, limit: number, windowSeconds: number): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    return current <= limit;
  }
}
```

3. **Session Storage**:
```go
// Go
func StoreSession(sessionID string, userID string, ttl time.Duration) error {
    ctx := context.Background()
    return redisClient.Set(ctx, "session:"+sessionID, userID, ttl).Err()
}
```

**Client Libraries**:
- **Go**: `go-redis/redis`
- **Python**: `redis-py` (async support)
- **TypeScript**: `ioredis`

##### MinIO

**Papel**: Object storage para documentos, imagens, arquivos grandes (multimodal)

**Versão Mínima**: RELEASE.2024-01-01T00-00-00Z

**Buckets** (por Oracle):
```
oracle-{oracle_id}-documents      # PDFs, docs, regulações, manuais
oracle-{oracle_id}-diagrams       # Whimsical, Mermaid exports
oracle-{oracle_id}-uploads        # User uploads (imagens, vídeos)
oracle-{oracle_id}-backups        # Database backups
oracle-{oracle_id}-generated-code # Código gerado por IA
```

**Features Utilizadas**:
- **S3-compatible API**: Drop-in replacement para AWS S3
- **Versioning**: Histórico de documentos
- **Lifecycle Policies**: Auto-delete de arquivos antigos
- **Server-Side Encryption**: AES-256

**Client Libraries**:
- **Go**: `minio-go`
- **Python**: `minio`
- **TypeScript**: `minio` (Node.js)

**Integração com Processing**:
```python
# Pipeline de ingestão multimodal
from minio import Minio

minio_client = Minio(
    "minio.supercore.internal:9000",
    access_key="ACCESS_KEY",
    secret_key="SECRET_KEY",
    secure=True
)

# Upload de documento regulatório
minio_client.fput_object(
    bucket_name=f"oracle-{oracle_id}-documents",
    object_name=f"regulations/{doc_id}.pdf",
    file_path="/tmp/regulation_document.pdf",
    content_type="application/pdf"
)

# Download para processamento
minio_client.fget_object(
    bucket_name=f"oracle-{oracle_id}-documents",
    object_name=f"regulations/{doc_id}.pdf",
    file_path="/tmp/processing/document.pdf"
)
```

---

### 2.1 Camada 1: Fundação (Oráculo)

#### Backend Core

##### Go 1.22+

**Papel**: Serviços de performance crítica, concorrência massiva

**Componentes em Go**:

1. **Interaction Broker**:
   - Consome mensagens do Pulsar
   - Valida contra templates Pydantic (via gRPC para Python service)
   - Enriquece com contexto (oracle_id, user_id)
   - Publica via WebSocket/SSE para frontends
   - Performance: < 10ms latência p99

2. **API Gateway**:
   - Reverse proxy para serviços backend
   - Rate limiting (token bucket com Redis)
   - Authentication (JWT validation)
   - Request/Response logging

3. **Instance Manager**:
   - CRUD operations em `instances` table
   - FSM engine (transições de estado)
   - Validação de schema (JSON Schema validation)

**Frameworks e Bibliotecas**:
```go
// go.mod
module github.com/lbpay/supercore

go 1.22

require (
    github.com/gin-gonic/gin v1.10.0           // HTTP framework
    github.com/apache/pulsar-client-go v0.13.0 // Pulsar client
    github.com/jackc/pgx/v5 v5.5.0             // PostgreSQL driver
    github.com/redis/go-redis/v9 v9.4.0        // Redis client
    github.com/gorilla/websocket v1.5.1        // WebSocket
    github.com/golang-jwt/jwt/v5 v5.2.0        // JWT
    github.com/santhosh-tekuri/jsonschema/v5   // JSON Schema validator
    go.uber.org/zap v1.26.0                    // Structured logging
    github.com/prometheus/client_golang v1.18.0 // Metrics
)
```

**Exemplo: Interaction Broker** (genérico):
```go
package broker

import (
    "context"
    "github.com/apache/pulsar-client-go/pulsar"
)

type InteractionBroker struct {
    pulsarClient pulsar.Client
    consumer     pulsar.Consumer
}

func (b *InteractionBroker) Start(ctx context.Context) error {
    // Consome mensagens genéricas de processamento
    consumer, err := b.pulsarClient.Subscribe(pulsar.ConsumerOptions{
        Topic:            "persistent://tenant-*/namespace/agent_requests",
        SubscriptionName: "interaction-broker",
        Type:             pulsar.Shared,
    })
    if err != nil {
        return err
    }
    b.consumer = consumer

    for {
        msg, err := consumer.Receive(ctx)
        if err != nil {
            return err
        }

        // Processa mensagem
        enriched := b.enrichContext(msg.Payload())
        b.publishToFrontend(enriched)

        consumer.Ack(msg)
    }
}
```

##### Python 3.12+

**Papel**: IA/ML, RAG pipelines, code generation, processamento de documentos

**Frameworks e Bibliotecas**:
```python
# requirements.txt

# LLMs e IA
langchain>=0.1.0
langgraph>=0.1.0
langflow>=1.0.0
crewai>=0.11.0
openai>=1.0.0
anthropic>=0.18.0
vllm>=0.2.0  # Produção
ollama>=0.1.0  # Dev

# RAG e Embeddings
sentence-transformers>=2.2.0
faiss-cpu>=1.7.4
chromadb>=0.4.0

# Code Generation
jinja2>=3.1.0
black>=24.0.0  # Code formatting
isort>=5.13.0  # Import sorting
autopep8>=2.0.0  # Auto-formatting

# Template engines
cookiecutter>=2.5.0  # Project templates
copier>=9.0.0  # Template copying

# AST manipulation
ast>=3.12  # Built-in
astroid>=3.0.0  # Advanced AST
rope>=1.11.0  # Refactoring

# Backend
fastapi>=0.109.0
pydantic>=2.5.0
uvicorn[standard]>=0.27.0
asyncpg>=0.29.0
sqlalchemy>=2.0.0

# Data Processing
pandas>=2.1.0
numpy>=1.26.0
polars>=0.20.0  # Alternativa rápida ao pandas

# Validações e Políticas
opa-python-client>=1.4.0

# Processamento Multimodal
pypdf>=3.17.0
python-docx>=1.1.0
openpyxl>=3.1.0
pillow>=10.2.0
opencv-python>=4.9.0
whisper>=1.0.0  # Transcrição de áudio

# Utilities
redis>=5.0.0
minio>=7.2.0
celery>=5.3.0
```

**Exemplo: Code Generator com Templates**:
```python
# code_generator.py
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel
import ast
import black

class ObjectDefinition(BaseModel):
    name: str
    fields: list[dict]
    relationships: list[dict]

class CodeGenerator:
    """Gera código production-grade a partir de object_definitions"""

    def __init__(self, templates_dir: str):
        self.env = Environment(loader=FileSystemLoader(templates_dir))

    def generate_pydantic_model(self, obj_def: ObjectDefinition) -> str:
        """Gera Pydantic model a partir de object_definition"""
        template = self.env.get_template('pydantic_model.py.j2')
        code = template.render(obj_def=obj_def)

        # Format with black
        formatted = black.format_str(code, mode=black.Mode())
        return formatted

    def generate_fastapi_crud(self, obj_def: ObjectDefinition) -> str:
        """Gera endpoints CRUD completos"""
        template = self.env.get_template('fastapi_crud.py.j2')
        code = template.render(obj_def=obj_def)

        # Validate AST
        tree = ast.parse(code)
        # Check for errors, optimize, etc

        formatted = black.format_str(code, mode=black.Mode())
        return formatted

    def generate_typescript_interface(self, obj_def: ObjectDefinition) -> str:
        """Gera TypeScript interface"""
        template = self.env.get_template('typescript_interface.ts.j2')
        code = template.render(obj_def=obj_def)
        return code
```

**Exemplo: RAG Query com Multi-Modal**:
```python
# rag_engine.py
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader
import asyncpg

class RAGEngine:
    """RAG 3D: SQL + Graph + Vector (agnóstico de domínio)"""

    def __init__(self, oracle_id: str):
        self.oracle_id = oracle_id
        self.llm = ChatOpenAI(model="gpt-4-turbo")
        self.embeddings = SentenceTransformerEmbeddings(
            model_name="paraphrase-multilingual-mpnet-base-v2"
        )

    async def query(self, question: str) -> dict:
        """Consulta híbrida em 3 modalidades"""

        # 1. Vector Search (semântico)
        vector_results = await self._vector_search(question)

        # 2. Graph Search (relacionamentos)
        graph_results = await self._graph_search(question)

        # 3. SQL Search (estruturado)
        sql_results = await self._sql_search(question)

        # 4. LLM sintetiza resposta
        context = {
            "vector": vector_results,
            "graph": graph_results,
            "sql": sql_results
        }

        answer = await self.llm.ainvoke(
            f"""
            Baseado no contexto abaixo, responda a pergunta.

            Contexto:
            {context}

            Pergunta: {question}
            """
        )

        return {
            "answer": answer.content,
            "sources": context
        }
```

**Exemplo: Architect Agent com LLM**:
```python
# architect_agent.py
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
import json

class ArchitectAgent:
    """Agente que gera object_definitions automaticamente (agnóstico)"""

    def __init__(self, oracle_id: str):
        self.oracle_id = oracle_id
        self.llm = ChatOpenAI(model="gpt-4-turbo")

    async def generate_object_definition(
        self,
        description: str,
        domain_knowledge: dict
    ) -> dict:
        """
        Gera object_definition a partir de descrição em linguagem natural
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert software architect.
            Given a description of an entity and domain knowledge, generate a complete object_definition in JSON Schema format.

            Domain Knowledge:
            {domain_knowledge}

            The object_definition should include:
            - Fields (name, type, required, validations)
            - Labels (multilingual labels for UI)
            - Field lists (enums)
            - Special types (email, phone, date, etc)
            - FSM (states and transitions)
            - Relationships with other objects
            """),
            ("user", "{description}")
        ])

        response = await self.llm.ainvoke(
            prompt.format_messages(
                description=description,
                domain_knowledge=json.dumps(domain_knowledge, indent=2)
            )
        )

        # Parse JSON from LLM response
        object_definition = json.loads(response.content)

        return object_definition
```

##### TypeScript 5.x / Node.js 20+

**Papel**: Type-safety no frontend, BFF (Backend for Frontend)

**Frameworks e Bibliotecas**:
```json
// package.json
{
  "dependencies": {
    // Frontend
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.3.0",

    // State Management
    "zustand": "^4.5.0",
    "react-query": "^5.17.0",

    // UI Components
    "shadcn-ui": "^0.8.0",
    "lucide-react": "^0.312.0",
    "react-hook-form": "^7.49.0",
    "recharts": "^2.10.0",

    // i18n
    "i18next": "^23.7.0",
    "react-i18next": "^14.0.0",
    "next-i18next": "^15.2.0",

    // Styling
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",

    // Workflow Visualization
    "reactflow": "^11.10.0",

    // Utilities
    "clsx": "^2.1.0",
    "zod": "^3.22.0",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "vitest": "^1.2.0"
  }
}
```

**Exemplo: Dynamic Form Generator**:
```typescript
// components/DynamicForm.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ObjectDefinition {
  name: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
  required: boolean;
  validations?: any;
}

function DynamicForm({ objectDefinition }: { objectDefinition: ObjectDefinition }) {
  // Gera Zod schema automaticamente
  const schema = generateZodSchema(objectDefinition.fields);

  const form = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {objectDefinition.fields.map(field => (
        <FieldRenderer key={field.name} field={field} form={form} />
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

function generateZodSchema(fields: Field[]): z.ZodSchema {
  const shape: any = {};

  fields.forEach(field => {
    let fieldSchema = z.string();

    if (field.type === 'number') fieldSchema = z.number();
    if (field.type === 'email') fieldSchema = z.string().email();
    if (field.type === 'date') fieldSchema = z.date();

    if (field.required) {
      shape[field.name] = fieldSchema;
    } else {
      shape[field.name] = fieldSchema.optional();
    }
  });

  return z.object(shape);
}
```

---

#### IA/ML Stack

##### LangChain

**Papel**: Framework universal para LLM orchestration

**Versão Mínima**: 0.1.0

**Componentes Utilizados**:

1. **Document Loaders** (multimodal):
   - PyPDFLoader: PDFs
   - Docx2txtLoader: Word docs
   - UnstructuredHTMLLoader: HTML
   - WebBaseLoader: Web scraping
   - YouTubeLoader: Vídeos (transcrição)

2. **Text Splitters**:
   - RecursiveCharacterTextSplitter: Chunking semântico
   - CharacterTextSplitter: Chunking simples
   - MarkdownTextSplitter: Markdown-aware

3. **Embeddings**:
   - SentenceTransformerEmbeddings: Multilíngue
   - OpenAIEmbeddings: Alta qualidade
   - HuggingFaceEmbeddings: Flexível

4. **Vector Stores**:
   - FAISS: Em memória (dev)
   - Chroma: Persistente (dev/staging)
   - pgvector: Produção (integrado com PostgreSQL)

5. **Retrievers**:
   - VectorStoreRetriever: Busca semântica
   - ContextualCompressionRetriever: Compressão de contexto
   - EnsembleRetriever: Híbrido (vector + keyword)

6. **Chains**:
   - RetrievalQA: Question answering
   - ConversationalRetrievalChain: Chat com memória
   - LLMChain: Prompt + LLM genérico

**Exemplo: Document Processing Pipeline** (genérico):
```python
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import FAISS

# 1. Load document (agnóstico de domínio)
loader = PyPDFLoader("documents/regulation_document.pdf")
documents = loader.load()

# 2. Split semanticamente
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)
chunks = text_splitter.split_documents(documents)

# 3. Embed (multilíngue)
embeddings = SentenceTransformerEmbeddings(
    model_name="paraphrase-multilingual-mpnet-base-v2"
)

# 4. Store in vector DB
vectorstore = FAISS.from_documents(chunks, embeddings)

# 5. Query
query = "What are the validation requirements?"
results = vectorstore.similarity_search(query, k=5)
```

**Exemplo: RAG com Chat History**:
```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory

llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    memory=memory,
    verbose=True
)

# Query com contexto de conversa
response = qa_chain({
    "question": "What are the key validation rules?",
})
```

##### LangGraph

**Papel**: State management para workflows complexos multi-step

**Versão Mínima**: 0.1.0

**Conceitos Core**:

1. **StateGraph**: Grafo de estados com transições
2. **Nodes**: Funções que transformam estado
3. **Edges**: Conexões entre nós (condicionais ou diretas)
4. **Checkpoints**: Persistência de estado para retry/resume

**Exemplo: Generic Workflow State Machine**:
```python
from langgraph.graph import StateGraph
from typing import TypedDict

class WorkflowState(TypedDict):
    """Estado genérico de workflow"""
    input_data: dict
    current_step: str
    validation_result: dict
    processing_result: dict
    final_output: dict

def validate_input(state: WorkflowState):
    # Valida input genérico
    validation_result = perform_validation(state["input_data"])
    return {"validation_result": validation_result}

def process_data(state: WorkflowState):
    # Processa dados genéricos
    result = process(state["input_data"])
    return {"processing_result": result}

def finalize_output(state: WorkflowState):
    # Finaliza output
    output = generate_output(state["processing_result"])
    return {"final_output": output}

def should_process(state: WorkflowState):
    # Condicional: processar ou não?
    return state["validation_result"]["is_valid"]

# Construir workflow
workflow = StateGraph(WorkflowState)

# Adicionar nós
workflow.add_node("validate", validate_input)
workflow.add_node("process", process_data)
workflow.add_node("finalize", finalize_output)

# Adicionar edges
workflow.set_entry_point("validate")
workflow.add_conditional_edges(
    "validate",
    should_process,
    {
        True: "process",
        False: "finalize"  # Skip processing se inválido
    }
)
workflow.add_edge("process", "finalize")
workflow.set_finish_point("finalize")

# Compilar e executar
app = workflow.compile()
result = app.invoke({
    "input_data": {"field1": "value1", "field2": "value2"},
    "current_step": "start"
})
```

##### OpenAI API

**Papel**: LLMs de alta qualidade para geração de código, análise, RAG

**Versão Mínima**: SDK 1.0.0

**Modelos Utilizados**:
- **GPT-4 Turbo**: Geração de código, análise complexa, RAG
- **GPT-4**: Tasks críticas que exigem máxima qualidade
- **GPT-3.5 Turbo**: Tasks simples, alta velocidade

**Features Utilizadas**:
- **Function Calling**: LLM chama ferramentas
- **Structured Outputs**: JSON Schema enforcement
- **Streaming**: Respostas incrementais
- **Vision**: Análise de imagens/diagramas

**Exemplo: Structured Code Generation**:
```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI(api_key="...")

class GeneratedCode(BaseModel):
    """Schema para código gerado"""
    filename: str
    language: str
    code: str
    imports: list[str]
    exports: list[str]

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {
            "role": "system",
            "content": "You are an expert code generator. Generate production-grade code."
        },
        {
            "role": "user",
            "content": "Generate a FastAPI CRUD endpoint for a generic entity with validation"
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": GeneratedCode.model_json_schema()
    }
)

generated = GeneratedCode.model_validate_json(response.choices[0].message.content)
print(generated.code)
```

##### Claude API (Anthropic)

**Papel**: LLMs com janela de contexto massiva, excelente para code generation

**Versão Mínima**: SDK 0.18.0

**Modelos Utilizados**:
- **Claude Opus 4.5**: Tarefas mais complexas, geração de arquitetura
- **Claude Sonnet 4.5**: Equilíbrio qualidade/velocidade, code generation
- **Claude Haiku 3.5**: Tasks rápidas, validações simples

**Features Utilizadas**:
- **200K tokens context**: Análise de grandes documentos
- **Tool Use**: Integração com ferramentas externas
- **Structured Outputs**: JSON enforcing
- **Vision**: Análise de diagramas

**Exemplo: Architecture Generation**:
```python
from anthropic import Anthropic

client = Anthropic(api_key="...")

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=4096,
    messages=[
        {
            "role": "user",
            "content": """
            Generate a complete microservices architecture for a domain-agnostic SaaS platform.

            Requirements:
            - Multi-tenant
            - Event-driven
            - Scalable to 1M+ users
            - Observability built-in

            Provide:
            1. Service boundaries
            2. API contracts (OpenAPI)
            3. Database schemas
            4. Event schemas
            5. Deployment strategy
            """
        }
    ]
)

architecture = response.content[0].text
```

##### vLLM (Produção) / Ollama (Dev)

**Papel**: Inference engine local para LLMs open-source (custo zero)

**vLLM** (Produção):

**Versão Mínima**: 0.2.0

**Modelos Suportados**:
- Llama 3.1 70B
- Mistral 7B / Mixtral 8x7B
- Qwen 2.5 72B
- Codestral 22B (code generation)

**Features**:
- **PagedAttention**: Memória eficiente
- **Continuous Batching**: Throughput alto
- **Streaming**: Respostas incrementais
- **GPU Acceleration**: NVIDIA A100/H100

**Configuração**:
```bash
# Produção: vLLM server
vllm serve meta-llama/Llama-3.1-70B-Instruct \
    --host 0.0.0.0 \
    --port 8000 \
    --gpu-memory-utilization 0.9 \
    --max-model-len 8192
```

**Ollama** (Dev/Local):

**Versão Mínima**: 0.1.0

**Modelos Utilizados**:
- Llama 3.1 8B (dev rápido)
- Mistral 7B (tasks gerais)
- Codestral 7B (code generation)

**Configuração**:
```bash
# Dev: Ollama local
ollama run llama3.1:8b
```

**Client Integration**:
```python
# Unified client para vLLM/Ollama
from openai import OpenAI

# vLLM (produção)
client_prod = OpenAI(
    api_key="EMPTY",
    base_url="http://vllm.internal:8000/v1"
)

# Ollama (dev)
client_dev = OpenAI(
    api_key="EMPTY",
    base_url="http://localhost:11434/v1"
)

# Uso idêntico
response = client_prod.chat.completions.create(
    model="meta-llama/Llama-3.1-70B-Instruct",
    messages=[{"role": "user", "content": "Generate CRUD endpoints"}]
)
```

---

#### Busca/RAG

##### Elasticsearch 8.x

**Papel**: Full-text search, keyword search (complementa vector search)

**Versão Mínima**: 8.0

**Features Utilizadas**:
- **BM25**: Relevância keyword-based
- **Multi-language analyzers**: Português, inglês, espanhol
- **Fuzzy search**: Tolerância a erros
- **Aggregations**: Faceted search

**Configuração de Index**:
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "multilingual": {
          "type": "standard",
          "stopwords": ["_brazilian_", "_english_", "_spanish_"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "oracle_id": { "type": "keyword" },
      "object_type": { "type": "keyword" },
      "content": {
        "type": "text",
        "analyzer": "multilingual"
      },
      "metadata": { "type": "object" }
    }
  }
}
```

##### pgvector (Semantic Search)

**Papel**: Vector embeddings para semantic search (integrado com PostgreSQL)

**Versão Mínima**: 0.5.1

**Dimensões Suportadas**:
- 384 (small models)
- 768 (medium models)
- 1536 (OpenAI ada-002)
- 2000 (custom large models)

**Operadores**:
- `<->`: L2 distance
- `<#>`: Inner product
- `<=>`: Cosine distance

**Exemplo: Similarity Search**:
```sql
-- Buscar documentos similares
SELECT
    id,
    object_type,
    data,
    embedding <=> '[0.1, 0.2, ..., 0.9]'::vector AS distance
FROM instances
WHERE oracle_id = 'oracle-uuid'
ORDER BY embedding <=> '[0.1, 0.2, ..., 0.9]'::vector
LIMIT 5;

-- Index para performance
CREATE INDEX ON instances USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

##### RAG Frameworks

**LangChain Retrievers**:
- VectorStoreRetriever
- EnsembleRetriever (hybrid: vector + keyword)
- ContextualCompressionRetriever

**Custom RAG 3D** (SQL + Graph + Vector):
```python
class RAG3D:
    """Busca híbrida em 3 modalidades"""

    async def retrieve(self, query: str, oracle_id: str) -> dict:
        # 1. Vector search (semântico)
        vector_results = await self.pgvector_search(query, oracle_id)

        # 2. Graph search (relacionamentos)
        graph_results = await self.nebula_search(query, oracle_id)

        # 3. SQL search (estruturado)
        sql_results = await self.postgres_search(query, oracle_id)

        # 4. Merge e rank
        merged = self.merge_and_rank([
            vector_results,
            graph_results,
            sql_results
        ])

        return merged
```

---

### 2.2 Camada 2: Abstração (Biblioteca de Objetos)

#### Backend (Metadata Management)

##### JSON Schema Validation

**Papel**: Validação de schemas dinâmicos (agnóstico de domínio)

**Bibliotecas**:
- **Go**: `santhosh-tekuri/jsonschema/v5`
- **Python**: `jsonschema` (official)
- **TypeScript**: `ajv`

**Exemplo: Dynamic Validation**:
```python
from jsonschema import validate, ValidationError

# Object definition schema (genérico)
object_definition_schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string", "format": "uuid"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 0}
    },
    "required": ["id", "name", "email"]
}

# Validar instance
instance_data = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
}

try:
    validate(instance=instance_data, schema=object_definition_schema)
except ValidationError as e:
    print(f"Validation failed: {e.message}")
```

##### Dynamic Schema Generation

**Papel**: Gerar schemas automaticamente a partir de descrições (code generation)

**Template Engine**: Jinja2

**Exemplo: Generate Pydantic Model**:
```python
# templates/pydantic_model.py.j2
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class {{ obj_def.name }}(BaseModel):
    """{{ obj_def.description }}"""

    {% for field in obj_def.fields %}
    {{ field.name }}: {% if field.required %}{{ field.type }}{% else %}Optional[{{ field.type }}]{% endif %} = Field(
        {% if field.description %}description="{{ field.description }}",{% endif %}
        {% if field.min_value %}ge={{ field.min_value }},{% endif %}
        {% if field.max_value %}le={{ field.max_value }},{% endif %}
    )
    {% endfor %}

# Generator
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('templates'))
template = env.get_template('pydantic_model.py.j2')

code = template.render(obj_def={
    "name": "GenericEntity",
    "description": "A generic business entity",
    "fields": [
        {"name": "id", "type": "UUID", "required": True},
        {"name": "name", "type": "str", "required": True},
        {"name": "value", "type": "float", "required": False, "min_value": 0}
    ]
})

print(code)
```

##### OPA Rego (Policies)

**Papel**: Policy engine para validações complexas e compliance (agnóstico)

**Versão Mínima**: OPA 0.60.0

**Linguagem**: Rego

**Casos de Uso**:
- Validações de negócio complexas
- Autorização granular (ABAC)
- Compliance automático (qualquer domínio)

**Exemplo: Generic Business Rules**:
```rego
# policies/generic_validation.rego
package supercore.validation

import future.keywords.if
import future.keywords.in

# Regra 1: Campos obrigatórios
deny_creation[msg] if {
    required_fields := ["id", "name", "created_at"]
    field := required_fields[_]
    not input.data[field]
    msg := sprintf("Required field '%s' is missing", [field])
}

# Regra 2: Validação de formato
deny_creation[msg] if {
    not regex.match(`^[a-zA-Z0-9-]+$`, input.data.id)
    msg := "Field 'id' must be alphanumeric with hyphens only"
}

# Regra 3: Lógica de negócio customizada
deny_creation[msg] if {
    input.data.value < 0
    msg := "Field 'value' cannot be negative"
}

# Regra 4: Dependências entre campos
deny_creation[msg] if {
    input.data.type == "premium"
    not input.data.premium_features
    msg := "Premium type requires 'premium_features' field"
}
```

**Integração com Python**:
```python
from opa_client import OPAClient

opa = OPAClient(host="http://opa.internal:8181")

# Avaliar política
result = opa.check_policy_rule(
    input_data={
        "data": {
            "id": "entity-123",
            "name": "Generic Entity",
            "value": 100.50,
            "type": "standard"
        }
    },
    package_path="supercore.validation",
    rule_name="deny_creation"
)

if result:
    print(f"Validation failed: {result}")
else:
    print("Validation passed")
```

---

#### Ferramentas

##### Code Generators

**1. Backend Code Generation (FastAPI)**:

**Template**: `fastapi_crud.py.j2`
```python
# templates/fastapi_crud.py.j2
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from uuid import UUID

router = APIRouter(prefix="/{{ obj_def.name.lower() }}", tags=["{{ obj_def.name }}"])

# Auto-generated CRUD endpoints

@router.post("/", response_model={{ obj_def.name }})
async def create_{{ obj_def.name.lower() }}(
    item: {{ obj_def.name }},
    oracle_id: UUID = Depends(get_current_oracle)
):
    """Create new {{ obj_def.name }}"""
    # Validate
    # Save to DB
    # Return
    pass

@router.get("/{item_id}", response_model={{ obj_def.name }})
async def get_{{ obj_def.name.lower() }}(
    item_id: UUID,
    oracle_id: UUID = Depends(get_current_oracle)
):
    """Get {{ obj_def.name }} by ID"""
    pass

@router.get("/", response_model=List[{{ obj_def.name }}])
async def list_{{ obj_def.name.lower() }}(
    oracle_id: UUID = Depends(get_current_oracle),
    skip: int = 0,
    limit: int = 100
):
    """List all {{ obj_def.name }}"""
    pass

@router.put("/{item_id}", response_model={{ obj_def.name }})
async def update_{{ obj_def.name.lower() }}(
    item_id: UUID,
    item: {{ obj_def.name }},
    oracle_id: UUID = Depends(get_current_oracle)
):
    """Update {{ obj_def.name }}"""
    pass

@router.delete("/{item_id}")
async def delete_{{ obj_def.name.lower() }}(
    item_id: UUID,
    oracle_id: UUID = Depends(get_current_oracle)
):
    """Delete {{ obj_def.name }}"""
    pass
```

**2. Frontend Code Generation (React Components)**:

**Template**: `react_form.tsx.j2`
```typescript
// templates/react_form.tsx.j2
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const {{ obj_def.name }}Schema = z.object({
  {% for field in obj_def.fields %}
  {{ field.name }}: z.{{ field.zod_type }}(){% if field.required %}.min(1, '{{ field.name }} is required'){% endif %},
  {% endfor %}
});

export function {{ obj_def.name }}Form() {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver({{ obj_def.name }}Schema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {% for field in obj_def.fields %}
      <div>
        <label>{t('{{ obj_def.name.lower() }}.fields.{{ field.name }}')}</label>
        <Input {...form.register('{{ field.name }}')} />
        {form.formState.errors.{{ field.name }} && (
          <span className="text-red-500">{form.formState.errors.{{ field.name }}.message}</span>
        )}
      </div>
      {% endfor %}
      <Button type="submit">{t('common.submit')}</Button>
    </form>
  );
}
```

**3. Database Migration Generation**:

**Template**: `postgres_migration.sql.j2`
```sql
-- templates/postgres_migration.sql.j2
-- Migration: Create {{ obj_def.name }} table
-- Generated: {{ timestamp }}

CREATE TABLE IF NOT EXISTS {{ obj_def.name.lower() }} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL,
    {% for field in obj_def.fields %}
    {{ field.name }} {{ field.sql_type }}{% if field.required %} NOT NULL{% endif %},
    {% endfor %}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_{{ obj_def.name.lower() }}_oracle_id ON {{ obj_def.name.lower() }}(oracle_id);
{% for field in obj_def.fields if field.indexed %}
CREATE INDEX idx_{{ obj_def.name.lower() }}_{{ field.name }} ON {{ obj_def.name.lower() }}({{ field.name }});
{% endfor %}

-- Row-Level Security
ALTER TABLE {{ obj_def.name.lower() }} ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ obj_def.name.lower() }}_isolation ON {{ obj_def.name.lower() }}
    USING (oracle_id = current_setting('app.current_oracle_id')::UUID);
```

---

### 2.3 Camada 3: Orquestração (Biblioteca de Agentes)

#### IA Orchestration

##### CrewAI

**Papel**: Framework para multi-agent collaboration (agnóstico de domínio)

**Versão Mínima**: 0.11.0

**Conceitos Core**:

1. **Agent**: Entidade autônoma com role, goal, backstory
2. **Task**: Trabalho a ser executado por agente
3. **Crew**: Grupo de agentes colaborando
4. **Process**: Sequential, Hierarchical, ou Consensual

**Arquitetura CrewAI**:
```
Crew (orquestra agentes)
  ↓
Agents (especialistas)
  ↓
Tasks (trabalhos)
  ↓
Tools (LLMs, APIs, databases)
```

**Exemplo: Generic Problem-Solving Crew**:
```python
from crewai import Agent, Task, Crew, Process

# Agent 1: Analysis Specialist
analysis_agent = Agent(
    role="Data Analysis Specialist",
    goal="Analyze input data and extract key insights",
    backstory="Expert in data analysis with deep understanding of business patterns",
    tools=[DataAnalysisTool, StatisticsTool],
    verbose=True
)

# Agent 2: Validation Specialist
validation_agent = Agent(
    role="Validation Specialist",
    goal="Ensure all data meets quality and compliance standards",
    backstory="Expert in data validation and compliance with extensive experience in regulatory frameworks",
    tools=[ValidationEngine, ComplianceChecker],
    verbose=True
)

# Agent 3: Resolution Specialist
resolution_agent = Agent(
    role="Resolution Specialist",
    goal="Synthesize analysis and validation to propose optimal solution",
    backstory="Expert in problem-solving and decision-making with holistic view",
    tools=[DecisionEngine, RecommendationTool],
    verbose=True
)

# Tasks
task_analyze = Task(
    description="""
    Analyze the input data:
    {input_data}

    Extract:
    1. Key patterns
    2. Anomalies
    3. Business insights
    """,
    agent=analysis_agent,
    expected_output="Detailed analysis report with patterns and insights"
)

task_validate = Task(
    description="""
    Validate the analyzed data against:
    1. Business rules
    2. Data quality standards
    3. Compliance requirements

    Analysis report: {analysis_report}
    """,
    agent=validation_agent,
    expected_output="Validation report with compliance status"
)

task_resolve = Task(
    description="""
    Based on analysis and validation, propose optimal solution.

    Analysis: {analysis_report}
    Validation: {validation_report}

    Provide:
    1. Recommended action
    2. Justification
    3. Implementation steps
    """,
    agent=resolution_agent,
    expected_output="Complete resolution proposal with justification"
)

# Crew
problem_solving_crew = Crew(
    agents=[analysis_agent, validation_agent, resolution_agent],
    tasks=[task_analyze, task_validate, task_resolve],
    process=Process.sequential,  # ou hierarchical
    verbose=2
)

# Execute
result = problem_solving_crew.kickoff(inputs={
    "input_data": {
        "entity_id": "entity-123",
        "data": {...},
        "context": {...}
    }
})

print(result)
```

**Exemplo: Hierarchical Crew (Complex Problem)**:
```python
# Manager agent (orchestrates)
manager_agent = Agent(
    role="Problem Resolution Manager",
    goal="Orchestrate team to solve complex problem efficiently",
    backstory="Experienced manager with expertise in complex problem decomposition",
    allow_delegation=True,  # Pode delegar para outros agentes
    verbose=True
)

# Specialized agents
data_specialist = Agent(
    role="Data Specialist",
    goal="Extract and prepare data for analysis",
    tools=[DatabaseTool, APITool]
)

business_analyst = Agent(
    role="Business Analyst",
    goal="Analyze business implications",
    tools=[AnalyticsTool, BusinessRulesTool]
)

compliance_specialist = Agent(
    role="Compliance Specialist",
    goal="Ensure regulatory compliance",
    tools=[ComplianceTool, PolicyEngine]
)

# Tasks with dependencies
task_complex = Task(
    description="""
    Solve this complex problem:
    {problem_description}

    Steps:
    1. Extract relevant data (delegate to data_specialist)
    2. Analyze business impact (delegate to business_analyst)
    3. Verify compliance (delegate to compliance_specialist)
    4. Synthesize solution
    """,
    agent=manager_agent,
    expected_output="Complete solution with justification and compliance approval"
)

# Hierarchical crew
hierarchical_crew = Crew(
    agents=[manager_agent, data_specialist, business_analyst, compliance_specialist],
    tasks=[task_complex],
    process=Process.hierarchical,  # Manager delega
    manager_llm="gpt-4-turbo"
)

result = hierarchical_crew.kickoff(inputs={
    "problem_description": "..."
})
```

##### LangGraph (State Management)

**Papel**: State management para workflows complexos com loops e condicionais

**Versão Mínima**: 0.1.0

**Conceitos Core**:

1. **StateGraph**: Grafo de estados
2. **Nodes**: Funções que transformam estado
3. **Edges**: Conexões (diretas ou condicionais)
4. **Checkpoints**: Persistência para retry/resume

**Exemplo: Complex Workflow with Loops**:
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AgentState(TypedDict):
    """Estado compartilhado entre nós"""
    input: str
    analysis: dict
    validation_attempts: Annotated[int, operator.add]
    validation_passed: bool
    final_output: dict
    errors: Sequence[str]

def analyze_input(state: AgentState):
    """Analisa input"""
    analysis = perform_analysis(state["input"])
    return {
        "analysis": analysis,
        "validation_attempts": 1
    }

def validate_analysis(state: AgentState):
    """Valida análise"""
    is_valid = validate(state["analysis"])
    return {
        "validation_passed": is_valid,
        "errors": [] if is_valid else ["Validation failed"]
    }

def refine_analysis(state: AgentState):
    """Refina análise se validação falhou"""
    refined = refine(state["analysis"], state["errors"])
    return {
        "analysis": refined,
        "validation_attempts": 1
    }

def finalize_output(state: AgentState):
    """Finaliza output"""
    output = generate_output(state["analysis"])
    return {"final_output": output}

def should_retry(state: AgentState):
    """Condicional: retry ou fail?"""
    if state["validation_passed"]:
        return "finalize"
    elif state["validation_attempts"] < 3:
        return "refine"
    else:
        return "fail"

# Construir workflow com loop
workflow = StateGraph(AgentState)

# Nós
workflow.add_node("analyze", analyze_input)
workflow.add_node("validate", validate_analysis)
workflow.add_node("refine", refine_analysis)
workflow.add_node("finalize", finalize_output)
workflow.add_node("fail", lambda s: {"final_output": {"status": "failed"}})

# Edges
workflow.set_entry_point("analyze")
workflow.add_edge("analyze", "validate")
workflow.add_conditional_edges(
    "validate",
    should_retry,
    {
        "finalize": "finalize",
        "refine": "refine",
        "fail": "fail"
    }
)
workflow.add_edge("refine", "validate")  # Loop back
workflow.add_edge("finalize", END)
workflow.add_edge("fail", END)

# Compilar
app = workflow.compile()

# Executar com checkpoints (pode retomar)
result = app.invoke(
    {"input": "some complex data"},
    config={"configurable": {"thread_id": "workflow-123"}}
)
```

---

#### Agent Frameworks

##### Autonomous Agents

**Pattern**: Agente autônomo que executa tasks sem supervisão humana

**Características**:
- Self-contained: Tem todas as ferramentas necessárias
- Goal-oriented: Foca em objetivo específico
- Reactive: Responde a eventos
- Proactive: Pode iniciar ações

**Exemplo: Generic Monitoring Agent**:
```python
from crewai import Agent, Task

class MonitoringAgent:
    """Agente que monitora sistema e toma ações automáticas"""

    def __init__(self):
        self.agent = Agent(
            role="System Monitoring Agent",
            goal="Monitor system health and take corrective actions automatically",
            backstory="Expert in system monitoring and incident response",
            tools=[
                SystemMetricsTool,
                AlertingTool,
                AutoRemediationTool
            ],
            allow_delegation=False,  # Autônomo
            verbose=True
        )

    def run_continuous(self):
        """Executa continuamente"""
        while True:
            task = Task(
                description="Check system health and take action if needed",
                agent=self.agent,
                expected_output="Health status and actions taken"
            )

            result = task.execute()

            if result["actions_taken"]:
                log_actions(result["actions_taken"])

            time.sleep(60)  # Check every minute
```

##### Multi-Agent Systems

**Pattern**: Múltiplos agentes colaborando para resolver problema

**Collaboration Patterns**:

1. **Sequential**: Agentes executam em sequência (pipeline)
2. **Parallel**: Agentes executam em paralelo (fan-out)
3. **Hierarchical**: Manager delega para especialistas
4. **Consensual**: Agentes votam em decisão

**Exemplo: Parallel Multi-Agent**:
```python
import asyncio
from crewai import Agent, Task

# 3 agentes especializados
agent_a = Agent(role="Specialist A", goal="Analyze aspect A", tools=[ToolA])
agent_b = Agent(role="Specialist B", goal="Analyze aspect B", tools=[ToolB])
agent_c = Agent(role="Specialist C", goal="Analyze aspect C", tools=[ToolC])

# Tasks paralelas
task_a = Task(description="Analyze A", agent=agent_a)
task_b = Task(description="Analyze B", agent=agent_b)
task_c = Task(description="Analyze C", agent=agent_c)

# Execute em paralelo
async def run_parallel():
    results = await asyncio.gather(
        task_a.async_execute(),
        task_b.async_execute(),
        task_c.async_execute()
    )
    return results

results = asyncio.run(run_parallel())

# Merge results
final_result = merge_results(results)
```

##### Task Delegation

**Pattern**: Manager agent delega tasks para agentes especializados

**Quando Usar**:
- Problema complexo que requer múltiplas especialidades
- Necessidade de coordenação central
- Dependências entre sub-tasks

**Exemplo: Manager + Specialists**:
```python
from crewai import Agent, Crew, Process

manager = Agent(
    role="Project Manager",
    goal="Coordinate team to deliver solution",
    allow_delegation=True,
    verbose=True
)

specialist_1 = Agent(
    role="Data Specialist",
    goal="Extract and prepare data",
    tools=[DataTool]
)

specialist_2 = Agent(
    role="Analysis Specialist",
    goal="Analyze prepared data",
    tools=[AnalysisTool]
)

specialist_3 = Agent(
    role="Reporting Specialist",
    goal="Generate reports",
    tools=[ReportingTool]
)

crew = Crew(
    agents=[manager, specialist_1, specialist_2, specialist_3],
    process=Process.hierarchical,
    manager_llm="gpt-4-turbo"
)

# Manager automaticamente delega tasks
result = crew.kickoff(inputs={
    "problem": "Generate comprehensive analysis report"
})
```

---

### 2.4 Camada 4: Interface (MCPs)

#### Messaging

##### Apache Pulsar 3.4.0

**Papel**: Message broker distribuído com multi-tenancy nativo

**Versão Mínima**: 3.4.0

**Arquitetura Pulsar**:
```
Tenant (Oracle)
  ↓
Namespace (Environment: prod/staging/dev)
  ↓
Topic (Event type: agent_requests, status_updates)
  ↓
Subscription (Consumer groups)
```

**Conceitos Core**:

1. **Tenant**: Isolamento multi-tenant (1 tenant = 1 Oracle)
2. **Namespace**: Agrupamento lógico de topics
3. **Topic**: Canal de mensagens
4. **Subscription**: Grupo de consumers
5. **Schema Registry**: Type-safe messages com Pydantic

**Vantagens sobre Kafka**:
- Multi-tenancy nativo (não precisa de workarounds)
- Schema Registry built-in
- Geo-replication nativa
- Storage separado de compute (escalabilidade)

**Topic Naming Convention**:
```
persistent://tenant-{oracle_id}/{namespace}/{topic_name}

Exemplos (genéricos):
persistent://tenant-oracle-123/production/agent_requests
persistent://tenant-oracle-123/production/status_updates
persistent://tenant-oracle-123/production/validation_results
```

**Configuração de Tópicos**:
```python
from pulsar import Client, ProducerConfiguration
from pydantic import BaseModel
import pulsar.schema as schema

# Schema Pydantic (type-safe)
class GenericRequest(BaseModel):
    request_id: str
    oracle_id: str
    action: str
    payload: dict

# Producer com schema
client = Client('pulsar://pulsar.internal:6650')

avro_schema = schema.AvroSchema(GenericRequest)

producer = client.create_producer(
    topic="persistent://tenant-oracle-123/production/agent_requests",
    schema=avro_schema
)

# Send message (type-safe)
producer.send(GenericRequest(
    request_id="req-123",
    oracle_id="oracle-123",
    action="process_data",
    payload={"data": "..."}
))

# Consumer com schema
consumer = client.subscribe(
    topic="persistent://tenant-oracle-123/production/agent_requests",
    subscription_name="agent-processor",
    schema=avro_schema,
    consumer_type=pulsar.ConsumerType.Shared,
    negative_ack_redelivery_delay_ms=60000,  # Retry após 1min
    dead_letter_policy=pulsar.ConsumerDeadLetterPolicy(
        max_redeliver_count=3,
        dead_letter_topic="persistent://tenant-oracle-123/production/dlq"
    )
)

while True:
    msg = consumer.receive()
    try:
        # Type-safe deserialization
        request: GenericRequest = msg.value()
        process(request)
        consumer.acknowledge(msg)
    except Exception as e:
        consumer.negative_acknowledge(msg)  # Retry
```

**Common Topics** (genéricos):
```python
# Agent execution
persistent://tenant-{oracle_id}/production/agent_requests
persistent://tenant-{oracle_id}/production/agent_status_updates
persistent://tenant-{oracle_id}/production/agent_results

# Workflow execution
persistent://tenant-{oracle_id}/production/workflow_triggers
persistent://tenant-{oracle_id}/production/workflow_status

# Data processing
persistent://tenant-{oracle_id}/production/data_ingestion
persistent://tenant-{oracle_id}/production/validation_results
persistent://tenant-{oracle_id}/production/processing_complete

# Security and Compliance (conforme DECISOES_CONSOLIDADAS)
persistent://tenant-{oracle_id}/security/security_alerts
persistent://tenant-{oracle_id}/security/compliance_approvals
persistent://tenant-{oracle_id}/security/workflow_events
```

**Multi-Tenancy Configuration** (conforme DECISOES_CONSOLIDADAS):

Cada Oráculo utiliza **namespace dedicado** para isolamento:

```yaml
# pulsar-config.yaml
tenant: oracle-{uuid}
namespaces:
  - default
  - workflows
  - security
topics:
  - persistent://oracle-{uuid}/default/agent_requests
  - persistent://oracle-{uuid}/security/alerts
schema_registry:
  type: avro
  compatibility: BACKWARD
```

**Geo-Replication** (Multi-Region):

```python
# Configure geo-replication para DR
from pulsar import Client

# Setup replication
admin = PulsarAdmin('http://pulsar-admin:8080')

# Configure cluster replication
admin.tenants().update_tenant(
    'oracle-123',
    {
        'allowed_clusters': ['us-east-1', 'us-west-2', 'eu-west-1']
    }
)

# Enable namespace replication
admin.namespaces().set_replication_clusters(
    'oracle-123/production',
    ['us-east-1', 'us-west-2', 'eu-west-1']
)
```

**Pulsar Functions** (Event Processing):

```python
from pulsar import Function

# Pulsar Function para processamento de eventos
def process_agent_request(input):
    """
    Processa requisições de agentes com enriquecimento
    """
    request = json.loads(input)

    # Enrich context
    enriched = {
        **request,
        'timestamp': datetime.utcnow().isoformat(),
        'processing_stage': 'enriched'
    }

    return json.dumps(enriched)

# Deploy Pulsar Function
config = {
    'tenant': 'oracle-123',
    'namespace': 'production',
    'name': 'agent-request-processor',
    'inputs': ['persistent://oracle-123/production/agent_requests'],
    'output': 'persistent://oracle-123/production/agent_requests_enriched',
    'processingGuarantees': 'EFFECTIVELY_ONCE',
    'runtime': 'PYTHON',
    'py': process_agent_request
}
```

**Schema Registry com Pydantic → Avro** (Auto-conversion):

```python
from pydantic import BaseModel
from pulsar.schema import AvroSchema

# Pydantic model (development)
class AgentRequest(BaseModel):
    request_id: str
    oracle_id: str
    agent_name: str
    action: str
    payload: dict
    priority: int = 5

# Auto-conversão para Avro (runtime)
avro_schema = AvroSchema(AgentRequest)

# Producer usa Pydantic diretamente
producer = client.create_producer(
    topic='persistent://oracle-123/production/agent_requests',
    schema=avro_schema
)

# Type-safe message (Pydantic → Avro automaticamente)
producer.send(AgentRequest(
    request_id='req-456',
    oracle_id='oracle-123',
    agent_name='DataValidator',
    action='validate',
    payload={'data': {...}},
    priority=8
))
```

---

##### Apache Flink 1.18.0

**Papel**: Stream processing engine para processamento de dados em tempo real

**Versão Mínima**: 1.18.0

**Casos de Uso no SuperCore**:

1. **Real-time ETL PostgreSQL → NebulaGraph**
   - Change Data Capture (CDC) de PostgreSQL
   - Transformação de dados relacionais para grafos
   - Sincronização contínua bi-direcional

2. **Stream Processing de Eventos Pulsar**
   - Agregações em tempo real
   - Complex Event Processing (CEP)
   - Windowing queries (tumbling, sliding, session)

3. **Real-time Metrics Aggregation**
   - Métricas de uso de agentes
   - Performance de workflows
   - Dashboards em tempo real

4. **Data Quality Monitoring**
   - Validação de streams de dados
   - Detecção de anomalias
   - Alertas em tempo real

**Arquitetura Flink no SuperCore**:

```
PostgreSQL (CDC)
    ↓
Flink CDC Connector
    ↓
Flink Stream Processing
    ├─ Transformations
    ├─ Aggregations
    ├─ Windowing
    └─ CEP
    ↓
Multiple Sinks:
    ├─ NebulaGraph (graph sync)
    ├─ PostgreSQL (aggregated data)
    ├─ Pulsar (event notifications)
    └─ Redis (cache updates)
```

**Exemplo 1: Real-time ETL PostgreSQL → NebulaGraph**:

```python
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.table import StreamTableEnvironment
from pyflink.table.descriptors import Schema, Kafka, Json

# Setup environment
env = StreamExecutionEnvironment.get_execution_environment()
env.set_parallelism(4)
t_env = StreamTableEnvironment.create(env)

# CDC Source: PostgreSQL instances table
t_env.execute_sql("""
    CREATE TABLE instances_source (
        id STRING,
        oracle_id STRING,
        object_definition_id STRING,
        data STRING,
        current_state STRING,
        created_at TIMESTAMP(3),
        updated_at TIMESTAMP(3),
        WATERMARK FOR updated_at AS updated_at - INTERVAL '5' SECOND
    ) WITH (
        'connector' = 'postgres-cdc',
        'hostname' = 'postgres.internal',
        'port' = '5432',
        'username' = 'flink_user',
        'password' = 'secret',
        'database-name' = 'supercore',
        'schema-name' = 'public',
        'table-name' = 'instances',
        'slot.name' = 'flink_slot'
    )
""")

# Sink: NebulaGraph (via custom connector)
t_env.execute_sql("""
    CREATE TABLE nebula_vertices (
        vid STRING,
        oracle_id STRING,
        object_type STRING,
        data STRING,
        state STRING
    ) WITH (
        'connector' = 'nebula',
        'graph-address' = 'nebula-graph.internal:9669',
        'graph-space' = 'oracle_{oracle_id}',
        'tag' = 'Instance'
    )
""")

# ETL: Transform and sync
t_env.execute_sql("""
    INSERT INTO nebula_vertices
    SELECT
        id AS vid,
        oracle_id,
        CAST(JSON_VALUE(data, '$.type') AS STRING) AS object_type,
        data,
        current_state AS state
    FROM instances_source
""")
```

**Exemplo 2: Event Processing com Windowing**:

```python
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.common import Types, WatermarkStrategy, Time
from pyflink.datastream.window import TumblingEventTimeWindows

env = StreamExecutionEnvironment.get_execution_environment()

# Pulsar source
from pyflink.datastream.connectors import FlinkPulsarSource

pulsar_source = FlinkPulsarSource.builder() \
    .set_service_url('pulsar://pulsar.internal:6650') \
    .set_admin_url('http://pulsar.internal:8080') \
    .set_topics(['persistent://oracle-123/production/agent_requests']) \
    .build()

# Stream processing
agent_requests = env.from_source(
    pulsar_source,
    WatermarkStrategy.for_monotonous_timestamps(),
    "pulsar-source"
)

# Windowing: Count requests per agent (5-minute windows)
windowed_counts = agent_requests \
    .map(lambda x: (x['agent_name'], 1)) \
    .key_by(lambda x: x[0]) \
    .window(TumblingEventTimeWindows.of(Time.minutes(5))) \
    .reduce(lambda a, b: (a[0], a[1] + b[1]))

# Sink: Back to Pulsar for monitoring
windowed_counts.sink_to(pulsar_sink)

env.execute("Agent Request Monitoring")
```

**Exemplo 3: Complex Event Processing (CEP)**:

```python
from pyflink.cep import CEP, Pattern

# Pattern: Detect 3 failed agent executions in 10 minutes
pattern = Pattern.begin("first_failure") \
    .where(lambda event: event['status'] == 'failed') \
    .next("second_failure") \
    .where(lambda event: event['status'] == 'failed') \
    .next("third_failure") \
    .where(lambda event: event['status'] == 'failed') \
    .within(Time.minutes(10))

# Apply pattern
pattern_stream = CEP.pattern(agent_events, pattern)

# Alert on pattern match
def create_alert(pattern_events):
    return {
        'alert_type': 'agent_failure_spike',
        'agent_name': pattern_events['first_failure']['agent_name'],
        'failure_count': 3,
        'timestamp': datetime.utcnow().isoformat(),
        'severity': 'high'
    }

alerts = pattern_stream.select(create_alert)

# Send to Pulsar security_alerts topic
alerts.sink_to(security_alerts_sink)
```

**Windowing Types**:

```python
from pyflink.datastream.window import (
    TumblingEventTimeWindows,
    SlidingEventTimeWindows,
    SessionWindows
)

# Tumbling: Non-overlapping, fixed-size windows
TumblingEventTimeWindows.of(Time.minutes(5))

# Sliding: Overlapping windows
SlidingEventTimeWindows.of(
    size=Time.minutes(10),
    slide=Time.minutes(5)
)

# Session: Dynamic windows based on inactivity gap
SessionWindows.with_gap(Time.minutes(15))
```

**Deployment Configuration**:

```yaml
# flink-config.yaml
jobmanager:
  memory:
    process.size: 2g
  rpc.address: flink-jobmanager
  rpc.port: 6123

taskmanager:
  memory:
    process.size: 4g
  numberOfTaskSlots: 4

parallelism:
  default: 4

state.backend: rocksdb
state.checkpoints.dir: s3://supercore-checkpoints/flink
state.savepoints.dir: s3://supercore-checkpoints/savepoints

execution.checkpointing:
  interval: 60000  # 1 minute
  mode: EXACTLY_ONCE
  timeout: 600000  # 10 minutes
```

**Client Libraries**:
- **Python**: `apache-flink` (PyFlink)
- **Java**: `org.apache.flink:flink-streaming-java`
- **Scala**: `org.apache.flink:flink-streaming-scala`

**Performance**:
- Throughput: 1M+ events/sec (single job)
- Latency: < 100ms (p99)
- Exactly-once processing semantics
- State management com RocksDB

---

##### WebSockets

**Papel**: Comunicação bidirecional real-time (Portal ↔ Backend)

**Bibliotecas**:
- **Go**: `gorilla/websocket`
- **Python**: `websockets`, `fastapi.WebSocket`
- **TypeScript**: `ws` (Node.js), native `WebSocket` (browser)

**Uso no SuperCore**:
- Portal UI recebe updates em tempo real
- Agent execution status
- Workflow progress
- Validation results

**Exemplo: WebSocket Server (Go)**:
```go
package websocket

import (
    "github.com/gorilla/websocket"
    "net/http"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Configure CORS properly
    },
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }
    defer conn.Close()

    // Subscribe to Pulsar topic
    oracleID := r.URL.Query().Get("oracle_id")
    messages := subscribeToUpdates(oracleID)

    // Forward messages to client
    for msg := range messages {
        conn.WriteJSON(msg)
    }
}
```

**Exemplo: WebSocket Client (TypeScript)**:
```typescript
// client.ts
class SuperCoreWebSocket {
  private ws: WebSocket;

  connect(oracleId: string) {
    this.ws = new WebSocket(`wss://api.supercore.internal/ws?oracle_id=${oracleId}`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleUpdate(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      // Reconnect logic
      setTimeout(() => this.connect(oracleId), 5000);
    };
  }

  handleUpdate(data: any) {
    // Update UI with real-time data
    console.log('Received update:', data);
  }
}
```

##### Server-Sent Events (SSE)

**Papel**: Streaming unidirecional (Backend → Frontend) para updates

**Vantagens sobre WebSocket**:
- Mais simples (HTTP only)
- Auto-reconnect nativo
- Melhor para updates unidirecionais

**Exemplo: SSE Server (FastAPI)**:
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

@app.get("/events/{oracle_id}")
async def stream_events(oracle_id: str):
    """Stream events via SSE"""

    async def event_generator():
        # Subscribe to Pulsar
        consumer = pulsar_client.subscribe(
            topic=f"persistent://tenant-{oracle_id}/production/status_updates",
            subscription_name=f"sse-{oracle_id}"
        )

        while True:
            msg = await consumer.receive_async()
            data = msg.value()

            # SSE format
            yield f"data: {json.dumps(data)}\n\n"

            consumer.acknowledge(msg)
            await asyncio.sleep(0.1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

**Exemplo: SSE Client (TypeScript)**:
```typescript
// sse-client.ts
class SuperCoreSSE {
  private eventSource: EventSource;

  connect(oracleId: string) {
    this.eventSource = new EventSource(`https://api.supercore.internal/events/${oracleId}`);

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleUpdate(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource.close();
      // Auto-reconnect after 5s
      setTimeout(() => this.connect(oracleId), 5000);
    };
  }

  handleUpdate(data: any) {
    console.log('Received SSE update:', data);
  }
}
```

---

#### MCP Protocol

##### MCP Server SDK

**Papel**: Implementação do Model Context Protocol para exposição de recursos e ferramentas

**Versão**: MCP Spec 2024-11-05

**Protocolos Suportados**:
1. **stdio**: Para Claude Desktop (local)
2. **HTTP+SSE**: Para Claude.ai e browsers
3. **WebSocket**: Para comunicação bidirecional

**Recursos MCP** (read-only data):
```typescript
// mcp-resources.ts
interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  description?: string;
}

// Recursos genéricos
const resources: MCPResource[] = [
  {
    uri: "oracle://config",
    name: "Oracle Configuration",
    mimeType: "application/json",
    description: "Complete oracle configuration"
  },
  {
    uri: "instances://{object_type}",
    name: "Object Instances",
    mimeType: "application/json",
    description: "Instances of a specific object type"
  },
  {
    uri: "object-definitions://all",
    name: "All Object Definitions",
    mimeType: "application/json"
  },
  {
    uri: "rules://{type}",
    name: "Validation Rules",
    mimeType: "application/json"
  },
  {
    uri: "workflows://all",
    name: "All Workflows",
    mimeType: "application/json"
  },
  {
    uri: "agents://all",
    name: "All Agents",
    mimeType: "application/json"
  }
];
```

##### Tool Interfaces

**Ferramentas MCP** (executable operations):
```typescript
// mcp-tools.ts
interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
}

const tools: MCPTool[] = [
  {
    name: "create_oracle",
    description: "Create a new oracle instance",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        domain: { type: "string" },
        description: { type: "string" }
      },
      required: ["name", "domain"]
    }
  },
  {
    name: "generate_object_definition",
    description: "Generate object definition from description using AI",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string" },
        oracle_id: { type: "string" }
      },
      required: ["description", "oracle_id"]
    }
  },
  {
    name: "execute_agent",
    description: "Execute an agent with input data",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string" },
        input_data: { type: "object" }
      },
      required: ["agent_id", "input_data"]
    }
  },
  {
    name: "rag_query",
    description: "Query oracle knowledge using RAG 3D",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        oracle_id: { type: "string" }
      },
      required: ["query", "oracle_id"]
    }
  }
];
```

##### Resource Interfaces

**Exemplo: Resource Handler**:
```python
# mcp_server.py
from mcp import MCPServer, Resource

class SuperCoreMCPServer:
    """MCP Server expondo recursos do SuperCore"""

    def __init__(self):
        self.server = MCPServer(name="supercore", version="2.0.0")
        self._register_resources()
        self._register_tools()

    def _register_resources(self):
        @self.server.resource("oracle://config/{oracle_id}")
        async def get_oracle_config(oracle_id: str) -> Resource:
            config = await db.get_oracle_config(oracle_id)
            return Resource(
                uri=f"oracle://config/{oracle_id}",
                name="Oracle Configuration",
                mimeType="application/json",
                text=json.dumps(config)
            )

        @self.server.resource("object-definitions://all/{oracle_id}")
        async def get_object_definitions(oracle_id: str) -> Resource:
            definitions = await db.get_object_definitions(oracle_id)
            return Resource(
                uri=f"object-definitions://all/{oracle_id}",
                name="Object Definitions",
                mimeType="application/json",
                text=json.dumps(definitions)
            )

    def _register_tools(self):
        @self.server.tool("generate_object_definition")
        async def generate_object_definition(description: str, oracle_id: str):
            # Call Architect Agent
            agent = ArchitectAgent(oracle_id)
            obj_def = await agent.generate_object_definition(description)
            return obj_def
```

---

### 2.5 Camada 5: Apresentação (Solução Gerada)

#### Frontend

##### Next.js 14 (App Router)

**Papel**: Framework React para SSR, SSG e geração dinâmica de UI

**Versão Mínima**: 14.1.0

**Features Utilizadas**:

1. **App Router**: File-based routing com layouts aninhados
2. **Server Components**: Rendering no servidor (performance)
3. **Server Actions**: Mutations sem API routes
4. **Turbopack**: Build tool ultra-rápido
5. **Image Optimization**: Next/Image automático
6. **Internationalization**: i18n nativo

**Estrutura de Projeto**:
```
app/
├── [lang]/                    # i18n dinâmico
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home
│   ├── oracles/               # Oracle management
│   │   ├── page.tsx           # List oracles
│   │   ├── [oracleId]/        # Oracle detail
│   │   │   ├── page.tsx       # Oracle dashboard
│   │   │   ├── objects/       # Object management
│   │   │   │   ├── page.tsx   # List objects
│   │   │   │   ├── [objectId]/
│   │   │   │   │   ├── page.tsx  # Object detail
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx  # Edit object
│   │   │   ├── agents/        # Agent management
│   │   │   ├── workflows/     # Workflow management
│   │   │   └── settings/      # Oracle settings
components/
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   └── ...
├── dynamic/                   # Dynamic generators
│   ├── DynamicForm.tsx        # Auto-generated forms
│   ├── DynamicList.tsx        # Auto-generated lists
│   └── DynamicWorkflow.tsx    # Workflow visualizer
lib/
├── api.ts                     # API client
├── i18n.ts                    # i18n config
└── utils.ts
```

**Exemplo: Dynamic Page Generation**:
```typescript
// app/[lang]/oracles/[oracleId]/objects/[objectId]/page.tsx
import { DynamicForm } from '@/components/dynamic/DynamicForm';
import { getObjectDefinition } from '@/lib/api';

export default async function ObjectDetailPage({
  params
}: {
  params: { lang: string; oracleId: string; objectId: string }
}) {
  // Fetch object definition (Server Component)
  const objectDef = await getObjectDefinition(params.oracleId, params.objectId);

  // Render dynamic form
  return (
    <div>
      <h1>{objectDef.name}</h1>
      <DynamicForm objectDefinition={objectDef} lang={params.lang} />
    </div>
  );
}
```

##### React 18

**Papel**: UI library com Concurrent Features

**Versão Mínima**: 18.2.0

**Features Utilizadas**:
- **Server Components**: Rendering no servidor
- **Suspense**: Loading states declarativos
- **Transitions**: Atualizações assíncronas
- **Hooks**: useState, useEffect, useContext, custom hooks

##### TypeScript 5.x

**Papel**: Type-safety em todo frontend

**Versão Mínima**: 5.3.0

**Features Utilizadas**:
- **Strict mode**: Máxima type-safety
- **Type inference**: Menos anotações manuais
- **Generics**: Componentes reutilizáveis type-safe

**Exemplo: Type-safe Component**:
```typescript
// components/GenericTable.tsx
import { ColumnDef } from '@tanstack/react-table';

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}

export function GenericTable<T>({
  data,
  columns,
  onRowClick
}: GenericTableProps<T>) {
  // Type-safe table rendering
  return (
    <table>
      {/* ... */}
    </table>
  );
}

// Uso type-safe
interface Entity {
  id: string;
  name: string;
  value: number;
}

<GenericTable<Entity>
  data={entities}
  columns={entityColumns}
  onRowClick={(row) => console.log(row.id)}  // Type-safe
/>
```

##### TailwindCSS 3.x

**Papel**: Utility-first CSS framework

**Versão Mínima**: 3.4.0

**Features Utilizadas**:
- **JIT mode**: Compile on-demand
- **Dark mode**: Suporte nativo
- **Arbitrary values**: `w-[137px]`
- **Plugins**: Typography, forms, aspect-ratio

**Configuração**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... shadcn/ui colors
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

##### shadcn/ui

**Papel**: Componentes modernos e acessíveis (CRÍTICO para Super Portal)

**Versão Mínima**: 0.8.0

**Características**:
- **Copy-paste components**: Não é pacote npm, copia código para projeto
- **Customizável**: Via TailwindCSS
- **Acessível**: WCAG 2.1 AA
- **Radix UI**: Primitives headless
- **Type-safe**: TypeScript nativo

**Componentes Utilizados**:
```
Button, Input, Label, Textarea
Form (react-hook-form integration)
Select, Combobox, Command
Dialog, Sheet, Popover
Table, DataTable
Card, Tabs, Accordion
Toast, Alert, Badge
Calendar, DatePicker
Dropdown Menu, Context Menu
Progress, Skeleton
Avatar, Tooltip
Separator, ScrollArea
```

**Exemplo: Form com shadcn/ui**:
```typescript
// components/EntityForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from 'react-i18next';

const entitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be positive"),
});

export function EntityForm() {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof entitySchema>>({
    resolver: zodResolver(entitySchema),
  });

  function onSubmit(values: z.infer<typeof entitySchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('entity.fields.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('entity.placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('entity.fields.value')}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t('common.submit')}</Button>
      </form>
    </Form>
  );
}
```

**Compatibilidade com i18n**: TOTAL (shadcn/ui é headless, não impõe strings hardcoded)

---

#### Build Tools

##### Turbopack

**Papel**: Build tool ultra-rápido (replacement do Webpack)

**Versão**: Incluído no Next.js 14+

**Vantagens**:
- 10x mais rápido que Webpack
- HMR instantâneo
- Incremental bundling

**Uso**:
```bash
# Dev com Turbopack
next dev --turbo

# Build com Turbopack
next build --turbo
```

##### SWC

**Papel**: Compilador Rust-based para JavaScript/TypeScript (replacement do Babel)

**Versão**: Incluído no Next.js 13+

**Vantagens**:
- 20x mais rápido que Babel
- Suporte nativo no Next.js

---

#### Frontend-Specific Object Definitions

**Descrição**: Para Oráculos Frontend (`type: "frontend"`), além dos object_definitions de domínio (Conta, Cliente, etc.), o SuperCore fornece object_definitions específicos de frontend para gerenciar IAM, Menu, Layout e Theme.

##### IAM Objects

**Papel**: Configurar autenticação (Keycloak) e autorização (Cerbos) para o portal gerado

**Arquitetura IAM**:
- **Keycloak**: Autenticação (OIDC/OAuth2), gestão de usuários, realms
- **Cerbos**: Autorização fine-grained (RBAC/ABAC), políticas como código

**object_definition: `keycloak_realm`**:
```typescript
{
  "type_name": "keycloak_realm",
  "description": "Configuração do Realm Keycloak para o portal",
  "fields": [
    {
      "name": "realm_name",
      "type": "string",
      "required": true,
      "description": "Nome do realm Keycloak (ex: banking, crm, healthcare)"
    },
    {
      "name": "keycloak_url",
      "type": "string",
      "required": true,
      "description": "URL do servidor Keycloak (ex: https://keycloak.mycompany.com)"
    },
    {
      "name": "client_id",
      "type": "string",
      "required": true,
      "description": "ID do client OIDC no Keycloak"
    },
    {
      "name": "client_secret",
      "type": "string",
      "required": true,
      "encrypted": true,
      "description": "Secret do client (armazenado em Vault)"
    },
    {
      "name": "redirect_uris",
      "type": "array",
      "items": "string",
      "description": "URIs de redirect permitidas"
    },
    {
      "name": "session_config",
      "type": "object",
      "schema": {
        "max_age": "number",  // segundos (default: 86400 = 24h)
        "idle_timeout": "number",  // segundos (default: 1800 = 30min)
        "rolling": "boolean",  // renova sessão a cada request
        "secure": "boolean",  // cookies secure (HTTPS only)
        "same_site": "string"  // "strict" | "lax" | "none"
      }
    },
    {
      "name": "cerbos_config",
      "type": "object",
      "description": "Configuração de integração com Cerbos",
      "schema": {
        "cerbos_url": "string",  // URL do Cerbos PDP
        "policy_version": "string",  // Versão das políticas
        "tls_enabled": "boolean"
      }
    }
  ],
  "ui_hints": {
    "form_layout": "wizard",
    "sections": ["realm", "client", "session", "cerbos"]
  }
}
```

**Exemplo de Instância**:
```json
{
  "object_definition_id": "keycloak_realm",
  "data": {
    "realm_name": "banking",
    "keycloak_url": "https://keycloak.mybank.com",
    "client_id": "portal-banking-prod",
    "client_secret": "vault://secrets/keycloak/banking/client-secret",
    "redirect_uris": [
      "https://portal.mybank.com/callback",
      "https://portal.mybank.com/silent-check-sso.html",
      "http://localhost:3000/callback"
    ],
    "session_config": {
      "max_age": 86400,
      "idle_timeout": 1800,
      "rolling": true,
      "secure": true,
      "same_site": "lax"
    },
    "cerbos_config": {
      "cerbos_url": "https://cerbos.mybank.com:3592",
      "policy_version": "default",
      "tls_enabled": true
    }
  }
}
```

**Código Gerado Automaticamente**:

**1. Keycloak Client (autenticação)**:
```typescript
// Auto-generated lib/auth/keycloak.ts
import Keycloak from 'keycloak-js'

export const keycloakConfig = {
  url: 'https://keycloak.mybank.com',
  realm: 'banking',
  clientId: 'portal-banking-prod',
}

export const keycloak = new Keycloak(keycloakConfig)

export async function initKeycloak() {
  const authenticated = await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',  // PKCE para segurança
  })

  if (authenticated) {
    // Refresh token automaticamente antes de expirar
    setInterval(() => {
      keycloak.updateToken(70).catch(() => {
        console.error('Failed to refresh token')
        keycloak.logout()
      })
    }, 60000)  // Check a cada 60s
  }

  return authenticated
}

export function getKeycloakToken() {
  return keycloak.token
}

export function getKeycloakUser() {
  return keycloak.tokenParsed
}

export function logout() {
  keycloak.logout({ redirectUri: window.location.origin })
}
```

**2. Middleware com Cerbos (autorização)**:
```typescript
// Auto-generated middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GRPC as Cerbos } from '@cerbos/grpc'
import { jwtDecode } from 'jwt-decode'

const cerbos = new Cerbos('cerbos.mybank.com:3593', {
  tls: true,
})

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('keycloak-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Decode JWT to get user info
  const user = jwtDecode(token)
  const userId = user.sub
  const userRoles = user.realm_access?.roles || []

  // Extract resource and action from request
  const resource = extractResource(request.nextUrl.pathname)
  const action = mapMethodToAction(request.method)

  // Check authorization with Cerbos
  const decision = await cerbos.checkResource({
    principal: {
      id: userId,
      roles: userRoles,
      attr: {
        department: user.department,
        level: user.level,
      }
    },
    resource: {
      kind: resource.kind,  // "conta", "transacao", etc.
      id: resource.id,
      attr: resource.attributes,
    },
    actions: [action],  // "read", "create", "update", "delete"
  })

  if (!decision.isAllowed(action)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'You do not have permission to access this resource' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

function extractResource(pathname: string) {
  // /contas/123 -> { kind: "conta", id: "123" }
  const parts = pathname.split('/').filter(Boolean)
  return {
    kind: parts[0]?.slice(0, -1) || 'unknown',  // remove 's' plural
    id: parts[1] || '*',
    attributes: {}
  }
}

function mapMethodToAction(method: string): string {
  const map = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete',
  }
  return map[method] || 'read'
}

export const config = {
  matcher: [
    '/contas/:path*',
    '/transacoes/:path*',
    '/clientes/:path*',
    '/api/:path*',
  ],
}
```

**3. Políticas Cerbos (YAML - geradas automaticamente)**:
```yaml
# Auto-generated cerbos-policies/conta.yaml
---
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: "default"
  resource: "conta"
  rules:
    - actions: ['*']
      effect: EFFECT_ALLOW
      roles:
        - ADMIN
      name: admin-full-access

    - actions: ['read', 'create']
      effect: EFFECT_ALLOW
      roles:
        - OPERATOR
      name: operator-read-create

    - actions: ['read']
      effect: EFFECT_ALLOW
      roles:
        - VIEWER
      name: viewer-read-only

    - actions: ['update', 'delete']
      effect: EFFECT_ALLOW
      roles:
        - OPERATOR
      condition:
        match:
          expr: >
            request.resource.attr.status == "PENDING" &&
            request.principal.attr.department == "OPERATIONS"
      name: operator-update-pending-only
```

**Benefícios da Stack Keycloak + Cerbos**:

1. **Separação de Concerns**:
   - Keycloak: Autenticação (quem você é?)
   - Cerbos: Autorização (o que você pode fazer?)

2. **Políticas como Código**:
   - Políticas Cerbos versionadas em Git
   - Review process para mudanças de permissão
   - Rollback fácil se necessário

3. **Fine-Grained Authorization**:
   - ABAC (Attribute-Based): decisões baseadas em atributos do usuário e recurso
   - Condições complexas: "pode atualizar se status=PENDING e dept=OPERATIONS"

4. **Escalabilidade**:
   - Cerbos PDP (Policy Decision Point) separado
   - Cache de decisões para performance
   - Decisões em <5ms

5. **Auditoria**:
   - Todos os checks de autorização logados
   - Compliance (LGPD, SOX, PCI-DSS)

**Configuração Simplificada**:

Para criar um Oráculo Frontend, o usuário só precisa:

1. **Criar instância de `keycloak_realm`** no Portal SuperCore
2. **SuperCore automaticamente**:
   - Gera código Keycloak client
   - Gera middleware com Cerbos
   - Gera políticas Cerbos base (ADMIN, OPERATOR, VIEWER)
   - Configura session management
   - Deploy tudo em Kubernetes

##### Menu Objects

**Papel**: Definir estrutura de navegação do portal

**object_definition: `menu_config`**:
```typescript
{
  "type_name": "menu_config",
  "description": "Estrutura de navegação do portal",
  "fields": [
    {
      "name": "menu_items",
      "type": "array",
      "items": {
        "id": "string",
        "label": "string",
        "icon": "string",  // lucide-react icon name
        "route": "string",
        "children": "array",  // nested menu items
        "roles": "string[]",  // required roles to see this item
        "badge": "object"  // optional badge (count, color)
      }
    },
    {
      "name": "menu_position",
      "type": "string",
      "enum": ["sidebar-left", "sidebar-right", "top-nav", "both"],
      "default": "sidebar-left"
    },
    {
      "name": "collapsible",
      "type": "boolean",
      "default": true
    }
  ]
}
```

**Exemplo de Instância**:
```json
{
  "object_definition_id": "menu_config",
  "data": {
    "menu_position": "sidebar-left",
    "collapsible": true,
    "menu_items": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "LayoutDashboard",
        "route": "/dashboard",
        "roles": ["*"]
      },
      {
        "id": "contas",
        "label": "Contas",
        "icon": "CreditCard",
        "route": "/contas",
        "roles": ["ADMIN", "OPERATOR"],
        "children": [
          {
            "id": "contas-list",
            "label": "Listar Contas",
            "route": "/contas",
            "roles": ["ADMIN", "OPERATOR", "VIEWER"]
          },
          {
            "id": "contas-create",
            "label": "Nova Conta",
            "route": "/contas/new",
            "roles": ["ADMIN", "OPERATOR"]
          }
        ]
      },
      {
        "id": "transacoes",
        "label": "Transações",
        "icon": "ArrowLeftRight",
        "route": "/transacoes",
        "roles": ["ADMIN", "OPERATOR"],
        "badge": {
          "count_query": "SELECT COUNT(*) FROM transacoes WHERE status='PENDING'",
          "color": "yellow"
        }
      },
      {
        "id": "relatorios",
        "label": "Relatórios",
        "icon": "FileBarChart",
        "route": "/relatorios",
        "roles": ["ADMIN"]
      }
    ]
  }
}
```

**Código Gerado Automaticamente**:
```typescript
// Auto-generated sidebar navigation component
import { LayoutDashboard, CreditCard, ArrowLeftRight, FileBarChart } from 'lucide-react'

const iconMap = {
  'LayoutDashboard': LayoutDashboard,
  'CreditCard': CreditCard,
  'ArrowLeftRight': ArrowLeftRight,
  'FileBarChart': FileBarChart,
}

export function Sidebar({ menuConfig, userRole }: SidebarProps) {
  const filteredItems = menuConfig.menu_items.filter(item =>
    item.roles.includes('*') || item.roles.includes(userRole)
  )

  return (
    <div className="w-64 h-screen bg-sidebar border-r">
      {filteredItems.map(item => {
        const Icon = iconMap[item.icon]
        return (
          <div key={item.id} className="p-2">
            <Link href={item.route} className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && <Badge>{item.badge.count}</Badge>}
            </Link>
            {item.children && <SubMenu items={item.children} />}
          </div>
        )
      })}
    </div>
  )
}
```

##### Layout Objects

**Papel**: Definir estrutura de layout das páginas

**object_definition: `layout_config`**:
```typescript
{
  "type_name": "layout_config",
  "description": "Configuração de layout do portal",
  "fields": [
    {
      "name": "layout_type",
      "type": "string",
      "enum": ["dashboard", "sidebar-left", "sidebar-right", "top-nav", "full-width", "custom"],
      "required": true
    },
    {
      "name": "header_config",
      "type": "object",
      "schema": {
        "show_logo": "boolean",
        "logo_url": "string",
        "show_company_name": "boolean",
        "show_user_menu": "boolean",
        "show_notifications": "boolean",
        "show_search": "boolean"
      }
    },
    {
      "name": "footer_config",
      "type": "object",
      "schema": {
        "show_footer": "boolean",
        "copyright_text": "string",
        "links": "array"
      }
    },
    {
      "name": "sidebar_config",
      "type": "object",
      "schema": {
        "width": "number",  // pixels
        "collapsible": "boolean",
        "default_collapsed": "boolean"
      }
    }
  ]
}
```

**Exemplo de Instância**:
```json
{
  "object_definition_id": "layout_config",
  "data": {
    "layout_type": "sidebar-left",
    "header_config": {
      "show_logo": true,
      "logo_url": "/logo-mybank.svg",
      "show_company_name": true,
      "show_user_menu": true,
      "show_notifications": true,
      "show_search": true
    },
    "sidebar_config": {
      "width": 256,
      "collapsible": true,
      "default_collapsed": false
    },
    "footer_config": {
      "show_footer": true,
      "copyright_text": "© 2025 MyBank. Todos os direitos reservados.",
      "links": [
        {"label": "Termos de Uso", "url": "/terms"},
        {"label": "Privacidade", "url": "/privacy"}
      ]
    }
  }
}
```

##### Theme Objects

**Papel**: Definir temas visuais (cores, tipografia, spacing)

**object_definition: `theme_config`**:
```typescript
{
  "type_name": "theme_config",
  "description": "Configuração de tema visual do portal",
  "fields": [
    {
      "name": "colors",
      "type": "object",
      "schema": {
        "primary": "string",  // hex color
        "secondary": "string",
        "accent": "string",
        "background": "string",
        "foreground": "string",
        "muted": "string",
        "border": "string",
        "error": "string",
        "success": "string",
        "warning": "string"
      }
    },
    {
      "name": "dark_mode",
      "type": "object",
      "schema": {
        "enabled": "boolean",
        "default": "string",  // "light" | "dark" | "system"
        "colors": "object"  // override colors for dark mode
      }
    },
    {
      "name": "typography",
      "type": "object",
      "schema": {
        "font_family": "string",
        "font_sizes": {
          "xs": "string",
          "sm": "string",
          "base": "string",
          "lg": "string",
          "xl": "string",
          "2xl": "string"
        }
      }
    },
    {
      "name": "border_radius",
      "type": "string",
      "enum": ["none", "sm", "md", "lg", "full"],
      "default": "md"
    }
  ]
}
```

**Exemplo de Instância**:
```json
{
  "object_definition_id": "theme_config",
  "data": {
    "colors": {
      "primary": "#0070f3",
      "secondary": "#7928ca",
      "accent": "#ff4081",
      "background": "#ffffff",
      "foreground": "#000000",
      "muted": "#f3f4f6",
      "border": "#e5e7eb",
      "error": "#ef4444",
      "success": "#10b981",
      "warning": "#f59e0b"
    },
    "dark_mode": {
      "enabled": true,
      "default": "system",
      "colors": {
        "background": "#0a0a0a",
        "foreground": "#ffffff",
        "muted": "#1f1f1f"
      }
    },
    "typography": {
      "font_family": "Inter, sans-serif",
      "font_sizes": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem"
      }
    },
    "border_radius": "md"
  }
}
```

**Código Gerado Automaticamente** (Tailwind CSS Config):
```javascript
// Auto-generated tailwind.config.js based on theme_config
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#7928ca',
        accent: '#ff4081',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f3f4f6',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      borderRadius: {
        DEFAULT: '0.375rem',  // md
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**Auto-geração de BFF com Frontend Objects**:

Quando um Oráculo Frontend é criado, o SuperCore:

1. **Lê os `object_definitions` de frontend** (IAM, Menu, Layout, Theme)
2. **Gera código Next.js automaticamente**:
   - `middleware.ts` (autenticação/autorização)
   - `app/layout.tsx` (layout root com sidebar/header/footer)
   - `components/Sidebar.tsx` (menu dinâmico)
   - `tailwind.config.js` (tema customizado)
3. **Gera BFF** (Backend-for-Frontend) que agrega múltiplos backends via MCP
4. **Deploy tudo** em Kubernetes com 1-click

**Benefícios**:
- Zero código manual para configurar IAM, Menu, Layout, Theme
- Mudanças em `iam_config` atualizam portal em tempo real
- Multi-tenancy: cada tenant pode ter theme diferente
- Consistência: todos portais seguem mesmas convenções

---

### 2.6 Camada 6: Deployment Orchestrator

**NOVA CAMADA** - Responsável por deployment e orchestration da solução gerada

#### Container Orchestration

##### Kubernetes 1.28+

**Papel**: Orchestração de containers para soluções geradas

**Versão Mínima**: 1.28.0

**Componentes Utilizados**:

1. **Deployments**: Gerenciamento de pods
2. **Services**: Exposição de aplicações
3. **Ingress**: Roteamento HTTP/HTTPS
4. **ConfigMaps**: Configuração
5. **Secrets**: Credenciais seguras
6. **PersistentVolumes**: Storage persistente
7. **HorizontalPodAutoscaler**: Auto-scaling

**Exemplo: Deployment da Solução Gerada**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oracle-{{ oracle_id }}-backend
  namespace: oracles
  labels:
    app: oracle-backend
    oracle-id: {{ oracle_id }}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: oracle-backend
      oracle-id: {{ oracle_id }}
  template:
    metadata:
      labels:
        app: oracle-backend
        oracle-id: {{ oracle_id }}
    spec:
      containers:
      - name: backend
        image: supercore/oracle-backend:{{ version }}
        env:
        - name: ORACLE_ID
          value: "{{ oracle_id }}"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: oracle-{{ oracle_id }}-secrets
              key: database-url
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: oracle-{{ oracle_id }}-backend
  namespace: oracles
spec:
  selector:
    app: oracle-backend
    oracle-id: {{ oracle_id }}
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: oracle-{{ oracle_id }}-backend-hpa
  namespace: oracles
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: oracle-{{ oracle_id }}-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

##### Helm 3.x

**Papel**: Package manager para Kubernetes (templates parametrizados)

**Versão Mínima**: 3.12.0

**Estrutura de Chart**:
```
helm/oracle-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── hpa.yaml
```

**Exemplo: values.yaml**:
```yaml
# values.yaml
oracleId: oracle-123
domain: banking  # ou crm, healthcare, etc

backend:
  image:
    repository: supercore/oracle-backend
    tag: "2.0.0"
  replicas: 3
  resources:
    requests:
      memory: 512Mi
      cpu: 250m
    limits:
      memory: 1Gi
      cpu: 500m

frontend:
  image:
    repository: supercore/oracle-frontend
    tag: "2.0.0"
  replicas: 2

database:
  host: postgres.internal
  name: oracle_123

ingress:
  enabled: true
  hostname: oracle-123.supercore.com
  tls:
    enabled: true
```

**Deploy com Helm**:
```bash
# Install oracle instance
helm install oracle-123 ./helm/oracle-chart \
  --namespace oracles \
  --create-namespace \
  --values values.yaml

# Upgrade
helm upgrade oracle-123 ./helm/oracle-chart \
  --namespace oracles \
  --values values.yaml

# Rollback
helm rollback oracle-123 1 --namespace oracles
```

##### ArgoCD 2.x

**Papel**: GitOps continuous deployment (declarative, automated)

**Versão Mínima**: 2.9.0

**Conceitos**:
- **Application**: Deployment de uma solução (1 Oracle = 1 Application)
- **Git Repository**: Source of truth
- **Sync**: Reconciliação automática Git → Cluster
- **Rollback**: Volta para versão anterior

**Exemplo: ArgoCD Application**:
```yaml
# argocd/oracle-123-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: oracle-123
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/lbpay/supercore-oracles.git
    targetRevision: main
    path: oracles/oracle-123
    helm:
      valueFiles:
      - values.yaml
      parameters:
      - name: oracleId
        value: oracle-123
  destination:
    server: https://kubernetes.default.svc
    namespace: oracles
  syncPolicy:
    automated:
      prune: true      # Remove recursos deletados
      selfHeal: true   # Auto-corrige drift
    syncOptions:
    - CreateNamespace=true
  revisionHistoryLimit: 10
```

**Deploy via GitOps**:
```bash
# Commit changes to Git
git add oracles/oracle-123/values.yaml
git commit -m "Update oracle-123 configuration"
git push

# ArgoCD automatically syncs (zero manual intervention)
```

##### Docker

**Papel**: Container runtime

**Versão Mínima**: 24.0.0

**Dockerfile Template** (Backend):
```dockerfile
# Dockerfile.backend
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy generated code
COPY generated/ ./generated/
COPY config/ ./config/

# Run
CMD ["uvicorn", "generated.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Dockerfile Template** (Frontend):
```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy generated code
COPY generated/ ./generated/
COPY public/ ./public/

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm ci --production

CMD ["npm", "start"]
```

##### Service Mesh (Opcional)

**Istio** ou **Linkerd**:

**Papel**: Traffic management, observability, security (service-to-service)

**Versão Mínima**: Istio 1.20.0 ou Linkerd 2.14.0

**Features Utilizadas**:
- **Traffic splitting**: Canary deployments
- **mTLS**: Criptografia automática entre serviços
- **Observability**: Distributed tracing automático
- **Circuit breaking**: Resiliência automática

**Quando Usar**: Produção com múltiplos Oracles (10+)

---

### 2.7 Camada 7: Super Portal de Backoffice

**NOVA CAMADA** - Interface de gerenciamento de Oráculos e geração de soluções

#### Frontend do Portal

**Stack Completa**:

##### Next.js 14 App Router

**Mesma stack da Camada 5**, mas com foco em gerenciamento

**Páginas Principais**:
```
app/
├── [lang]/
│   ├── dashboard/             # Dashboard principal
│   │   └── page.tsx
│   ├── oracles/               # Gerenciamento de Oráculos
│   │   ├── page.tsx           # Lista de Oráculos
│   │   ├── new/
│   │   │   └── page.tsx       # Criar novo Oráculo
│   │   ├── [oracleId]/
│   │   │   ├── page.tsx       # Dashboard do Oráculo
│   │   │   ├── knowledge/     # Upload de conhecimento
│   │   │   ├── objects/       # Gerenciar objetos
│   │   │   ├── agents/        # Gerenciar agentes
│   │   │   ├── workflows/     # Gerenciar workflows
│   │   │   ├── deploy/        # Deployment status
│   │   │   └── settings/      # Configurações
```

##### shadcn/ui (CRÍTICO)

**Componentes Específicos do Portal**:
- **DataTable**: Lista de Oráculos com filtros
- **Form**: Criação/edição de Oráculos
- **Dialog**: Confirmações, wizards
- **Card**: Cards de status, métricas
- **Tabs**: Navegação entre seções
- **Command**: Busca global (Cmd+K)
- **Dropdown Menu**: Ações contextuais
- **Badge**: Status de Oráculos
- **Progress**: Upload de documentos
- **Calendar**: Agendamento de deploys

##### Lucide Icons (CRÍTICO)

**Papel**: Ícones modernos para UX do Portal

**Versão Mínima**: 0.312.0

**Características**:
- **Tree-shakeable**: Importa apenas ícones usados
- **Customizável**: Size, color, stroke
- **Consistente**: Design system uniforme
- **React-native**: Componentes React

**Exemplo**:
```typescript
import {
  Database,
  Workflow,
  Bot,
  FileText,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';

<Button>
  <Plus className="mr-2 h-4 w-4" />
  New Oracle
</Button>
```

##### Recharts

**Papel**: Gráficos para dashboards

**Versão Mínima**: 2.10.0

**Gráficos Utilizados**:
- **LineChart**: Crescimento de objetos ao longo do tempo
- **BarChart**: Oráculos por domínio
- **PieChart**: Distribuição de agentes
- **AreaChart**: Uso de recursos

**Exemplo**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="objects" stroke="#8884d8" />
</LineChart>
```

##### React Hook Form

**Papel**: Gerenciamento de formulários (criação de Oráculos, objetos, etc)

**Versão Mínima**: 7.49.0

**Integração com shadcn/ui**: Nativa (Form component)

##### i18next Ecosystem (CRÍTICO)

**Papel**: Multi-idioma nativo no Portal

**Bibliotecas**:
- **i18next**: Core
- **react-i18next**: React integration
- **next-i18next**: Next.js integration

**Versões Mínimas**:
- i18next: 23.7.0
- react-i18next: 14.0.0
- next-i18next: 15.2.0

**Configuração**:
```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es', 'fr', 'de'],
    ns: ['common', 'oracles', 'objects', 'agents', 'workflows'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**Uso em Componentes**:
```typescript
import { useTranslation } from 'react-i18next';

export function OracleList() {
  const { t } = useTranslation('oracles');

  return (
    <div>
      <h1>{t('title')}</h1>
      <Button>{t('actions.create_new')}</Button>
    </div>
  );
}
```

**Arquivos de Tradução**:
```json
// public/locales/en/oracles.json
{
  "title": "Oracles",
  "actions": {
    "create_new": "Create New Oracle",
    "edit": "Edit",
    "delete": "Delete",
    "deploy": "Deploy"
  },
  "fields": {
    "name": "Name",
    "domain": "Domain",
    "description": "Description"
  },
  "status": {
    "active": "Active",
    "draft": "Draft",
    "deploying": "Deploying",
    "failed": "Failed"
  }
}

// public/locales/pt/oracles.json
{
  "title": "Oráculos",
  "actions": {
    "create_new": "Criar Novo Oráculo",
    "edit": "Editar",
    "delete": "Excluir",
    "deploy": "Implantar"
  },
  "fields": {
    "name": "Nome",
    "domain": "Domínio",
    "description": "Descrição"
  },
  "status": {
    "active": "Ativo",
    "draft": "Rascunho",
    "deploying": "Implantando",
    "failed": "Falhou"
  }
}
```

---

#### Backend do Portal

##### FastAPI (Python) ou Gin (Go)

**Escolha**:
- **FastAPI**: Se equipe é Python-first
- **Gin**: Se performance é crítica

**Versões Mínimas**:
- FastAPI: 0.109.0
- Gin: 1.10.0

**Endpoints Principais**:
```python
# FastAPI backend
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List
from uuid import UUID

app = FastAPI(title="SuperCore Portal API", version="2.0.0")

# Oracles
@app.post("/api/v1/oracles", response_model=Oracle)
async def create_oracle(oracle: OracleCreate, user=Depends(get_current_user)):
    """Create new oracle"""
    pass

@app.get("/api/v1/oracles", response_model=List[Oracle])
async def list_oracles(user=Depends(get_current_user)):
    """List all oracles for user"""
    pass

@app.get("/api/v1/oracles/{oracle_id}", response_model=Oracle)
async def get_oracle(oracle_id: UUID, user=Depends(get_current_user)):
    """Get oracle by ID"""
    pass

@app.put("/api/v1/oracles/{oracle_id}", response_model=Oracle)
async def update_oracle(oracle_id: UUID, oracle: OracleUpdate, user=Depends(get_current_user)):
    """Update oracle"""
    pass

@app.delete("/api/v1/oracles/{oracle_id}")
async def delete_oracle(oracle_id: UUID, user=Depends(get_current_user)):
    """Delete oracle"""
    pass

# Oracle Manager Service
@app.post("/api/v1/oracles/{oracle_id}/deploy")
async def deploy_oracle(oracle_id: UUID, user=Depends(get_current_user)):
    """Deploy oracle (trigger Kubernetes deployment)"""
    # 1. Generate code
    # 2. Build Docker images
    # 3. Deploy to Kubernetes via ArgoCD
    pass

@app.get("/api/v1/oracles/{oracle_id}/deployment-status")
async def get_deployment_status(oracle_id: UUID, user=Depends(get_current_user)):
    """Get deployment status from Kubernetes"""
    pass
```

##### Oracle Manager Service

**Papel**: Gerencia lifecycle de Oráculos (create, update, delete, deploy)

**Responsabilidades**:
1. **CRUD de Oráculos**: Criar, ler, atualizar, deletar
2. **Code Generation**: Gera código da solução (middleware, agents, frontend)
3. **Docker Build**: Constrói imagens Docker
4. **Kubernetes Deploy**: Deploya via ArgoCD/Helm
5. **Monitoring**: Status de deployment

**Tecnologia**: FastAPI (Python) ou Gin (Go)

##### Deployment Orchestrator Service

**Papel**: Orquestra deployment de soluções geradas

**Responsabilidades**:
1. **Template Rendering**: Helm charts, K8s manifests
2. **ArgoCD Integration**: Cria Applications, sincroniza
3. **Health Checks**: Verifica saúde do deployment
4. **Rollback**: Reverte deployment em caso de falha

**Tecnologia**: Go (performance) ou Python (integração com LLMs)

**Exemplo: Deployment Flow**:
```python
# deployment_orchestrator.py
class DeploymentOrchestrator:
    """Orquestra deployment de Oráculo"""

    async def deploy_oracle(self, oracle_id: str):
        """Deploy oracle completo"""

        # 1. Generate code
        code = await self.code_generator.generate_all(oracle_id)

        # 2. Build Docker images
        backend_image = await self.docker_builder.build_backend(code["backend"])
        frontend_image = await self.docker_builder.build_frontend(code["frontend"])

        # 3. Render Helm chart
        helm_values = self.helm_renderer.render(
            oracle_id=oracle_id,
            backend_image=backend_image,
            frontend_image=frontend_image
        )

        # 4. Deploy via ArgoCD
        await self.argocd_client.create_application(
            name=f"oracle-{oracle_id}",
            repo_url="https://github.com/lbpay/supercore-oracles.git",
            path=f"oracles/{oracle_id}",
            helm_values=helm_values
        )

        # 5. Wait for healthy
        await self.wait_for_healthy(oracle_id, timeout=300)

        return {"status": "deployed", "oracle_id": oracle_id}
```

##### Authentication

**OAuth 2.0 / OpenID Connect**:

**Provider**: Auth0, Keycloak, ou custom

**Fluxo**:
1. Login via OAuth provider
2. Recebe JWT token
3. Token em header de requisições
4. Backend valida token

**Bibliotecas**:
- **Python**: `authlib`, `python-jose`
- **Go**: `go-oidc`
- **TypeScript**: `next-auth`

---

## 3. MULTILINGUA NATIVO

### 3.1 Linguagens Suportadas

**Idiomas**:
- Português (pt, pt-BR)
- Inglês (en, en-US)
- Espanhol (es, es-ES, es-MX)
- Francês (fr)
- Alemão (de)
- Italiano (it)
- Japonês (ja)
- Chinês (zh, zh-CN)
- Russo (ru)
- Árabe (ar)

### 3.2 Stack de i18n

#### Frontend

**i18next Ecosystem** (CRÍTICO):

**Versões**:
- i18next: 23.7.0+
- react-i18next: 14.0.0+
- next-i18next: 15.2.0+

**Features**:
- **Namespaces**: Separação por módulo
- **Interpolation**: Variáveis em strings
- **Pluralization**: Plural rules por idioma
- **Formatting**: Datas, números, moedas
- **Lazy loading**: Carrega traduções on-demand

**Estrutura de Traduções**:
```
public/locales/
├── en/
│   ├── common.json
│   ├── oracles.json
│   ├── objects.json
│   ├── agents.json
│   └── workflows.json
├── pt/
│   ├── common.json
│   ├── oracles.json
│   ├── objects.json
│   ├── agents.json
│   └── workflows.json
└── es/
    ├── common.json
    ├── oracles.json
    ├── objects.json
    ├── agents.json
    └── workflows.json
```

#### Backend

**Python**: Babel, gettext

```python
from babel.support import Translations

translations = Translations.load('locales', ['pt_BR'])
_ = translations.gettext

message = _("Object created successfully")
```

**Go**: go-i18n

```go
import "github.com/nicksnyder/go-i18n/v2/i18n"

bundle := i18n.NewBundle(language.English)
bundle.RegisterUnmessageFile("active.en.toml", "toml")
bundle.RegisterUnmessageFile("active.pt.toml", "toml")

localizer := i18n.NewLocalizer(bundle, "pt")
message := localizer.MustLocalize(&i18n.LocalizeConfig{
    MessageID: "ObjectCreated",
})
```

### 3.3 Embeddings Multilíngues

**Models**:
- **paraphrase-multilingual-mpnet-base-v2**: 50+ idiomas
- **distiluse-base-multilingual-cased-v2**: Rápido, 15+ idiomas
- **LaBSE**: 109 idiomas

**Uso**:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

# Embeddings em múltiplos idiomas (mesmo espaço vetorial)
embeddings_pt = model.encode(["Olá mundo", "Como vai?"])
embeddings_en = model.encode(["Hello world", "How are you?"])
embeddings_es = model.encode(["Hola mundo", "¿Cómo estás?"])

# Busca cross-lingual funciona
similarity(embeddings_pt[0], embeddings_en[0])  # Alta similaridade
```

### 3.4 LLMs Multilíngues

**Modelos**:
- **GPT-4 Turbo**: Excelente em 50+ idiomas
- **Claude Opus**: Ótimo em português, inglês, espanhol, francês
- **Llama 3.1 70B**: Bom em idiomas principais
- **Qwen 2.5 72B**: Excelente em chinês + idiomas principais

---

## 4. LANGFLOW

### 4.1 O que é LangFlow

**Papel**: Visual workflow builder para pipelines RAG e LLM

**Versão Mínima**: 1.0.0

**Características**:
- **Drag-and-drop**: Cria workflows visualmente
- **LangChain integration**: Usa componentes LangChain
- **Export to code**: Gera código Python executável
- **Templates**: Workflows pré-construídos
- **Real-time testing**: Testa workflows na UI

**Conceitos**:
- **Nodes**: Componentes (LLM, Retriever, Prompt, etc)
- **Edges**: Conexões entre nós (fluxo de dados)
- **Input/Output**: Entrada e saída do workflow

### 4.2 Integração com SuperCore

#### Como se Integra

**MODO 1: Geração Automática pela IA (RECOMENDADO - RF019)**

1. **Usuário Descreve Workflow** (texto natural):
   ```
   "Preciso de um workflow para aprovação de despesas:
   - Funcionário envia despesa
   - Sistema valida (valor < R$1000 = aprovação automática)
   - Se > R$1000, gestor aprova manualmente
   - Sistema processa pagamento
   - Notifica funcionário"
   ```

2. **IA Gera Workflow LangFlow Automaticamente** (<60s):
   - Consulta Oráculo (RAG) para buscar objetos, agentes, regras
   - Gera JSON LangFlow completo:
     - Nós (nodes): Start, Validation, Conditional, Approval, Payment, Notification, End
     - Conexões (edges): Fluxo condicional (if/else, parallel)
     - Variáveis: Dados entre nós
     - Integrações: Agentes, APIs externas
   - Salva na tabela `workflows` (oracle_id, workflow_json, version)

3. **Usuário Abre LangFlow UI** (opcional):
   - Vê diagrama visual completo gerado pela IA
   - Pode fazer ajustes drag-and-drop:
     - Mover nós
     - Adicionar/remover conexões
     - Alterar condicionais
     - Adicionar novos nós (custom)
   - Testa workflow com dados mock
   - Salva versão ajustada (cria nova versão)

4. **Deploy Automático**:
   - IA converte LangFlow JSON → LangGraph executable
   - Workflow fica disponível via API
   - Agentes podem chamar workflow

**Tecnologia por Trás da Geração Automática**:

```python
# Workflow Generator Agent (CrewAI)
from crewai import Agent, Task
from langchain.chat_models import ChatAnthropic

workflow_generator = Agent(
    role="LangFlow Workflow Architect",
    goal="Generate complete LangFlow workflows from natural language descriptions",
    backstory="""Expert in workflow design with deep knowledge of LangFlow,
    LangChain components, and business process modeling. Specializes in
    translating business requirements into executable visual workflows.""",
    tools=[
        OracleRAGTool,  # Consulta objetos, agentes, regras
        LangFlowNodeCatalogTool,  # Catálogo de nós disponíveis
        WorkflowValidatorTool  # Valida workflow gerado
    ],
    verbose=True,
    llm=ChatAnthropic(model="claude-3-5-sonnet-20241022")
)

# Task: Generate Workflow
async def generate_workflow(description: str, oracle_id: str):
    task = Task(
        description=f"""
        Generate a complete LangFlow workflow JSON from this description:

        {description}

        Steps:
        1. Analyze requirements and identify:
           - Input data
           - Processing steps
           - Conditional logic (if/else, loops)
           - External integrations
           - Output format

        2. Query Oracle RAG to find:
           - Relevant objects (object_definitions)
           - Available agents
           - Business rules
           - API integrations

        3. Design workflow:
           - Start node
           - Processing nodes (validation, transformation, enrichment)
           - Conditional nodes (if/else, switch)
           - Integration nodes (API calls, agent calls)
           - End node

        4. Generate LangFlow JSON with:
           - nodes: [{id, type, data, position}]
           - edges: [{source, target, sourceHandle, targetHandle}]
           - variables: {} (shared state)

        5. Validate workflow:
           - All nodes connected
           - No orphan nodes
           - Conditional logic complete
           - Variables properly passed

        Return: Complete LangFlow JSON
        """,
        agent=workflow_generator
    )

    result = await task.execute_async()

    # Parse and validate
    workflow_json = json.loads(result.output)

    # Save to database
    await db.workflows.insert({
        "oracle_id": oracle_id,
        "name": extract_name(description),
        "description": description,
        "workflow_json": workflow_json,
        "version": 1,
        "created_by": "ai",
        "created_at": datetime.now()
    })

    return workflow_json
```

**Exemplo Completo de Workflow Gerado pela IA**:

Descrição do usuário:
```
"Preciso de um workflow para onboarding de novos usuários:
1. Validar dados cadastrais (email, CPF, telefone)
2. Verificar se usuário já existe
3. Se existir, retornar erro
4. Se não existir:
   - Criar usuário no banco
   - Enviar email de boas-vindas
   - Criar tarefa para aprovação manual (se valor > R$10.000)
   - Notificar gestor
5. Retornar ID do usuário criado"
```

Workflow JSON gerado pela IA (<60s):
```json
{
  "workflow_id": "onboarding-flow-v1",
  "nodes": [
    {
      "id": "start",
      "type": "StartNode",
      "data": {
        "label": "Início",
        "inputs": ["user_data"]
      },
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "validate",
      "type": "ValidationNode",
      "data": {
        "label": "Validar Dados",
        "validations": [
          {"field": "email", "type": "email"},
          {"field": "cpf", "type": "cpf"},
          {"field": "telefone", "type": "phone"}
        ]
      },
      "position": {"x": 300, "y": 100}
    },
    {
      "id": "check-exists",
      "type": "DatabaseQueryNode",
      "data": {
        "label": "Verificar Existência",
        "query": "SELECT id FROM users WHERE email = {{user_data.email}} OR cpf = {{user_data.cpf}}",
        "oracle_id": "{{oracle_id}}"
      },
      "position": {"x": 500, "y": 100}
    },
    {
      "id": "conditional-exists",
      "type": "ConditionalNode",
      "data": {
        "label": "Usuário Existe?",
        "condition": "{{check-exists.result.length > 0}}"
      },
      "position": {"x": 700, "y": 100}
    },
    {
      "id": "error-exists",
      "type": "ErrorNode",
      "data": {
        "label": "Retornar Erro",
        "error": {
          "code": "USER_ALREADY_EXISTS",
          "message": "Usuário já cadastrado com este email/CPF"
        }
      },
      "position": {"x": 700, "y": 250}
    },
    {
      "id": "create-user",
      "type": "DatabaseInsertNode",
      "data": {
        "label": "Criar Usuário",
        "table": "users",
        "data": "{{user_data}}",
        "oracle_id": "{{oracle_id}}"
      },
      "position": {"x": 900, "y": 100}
    },
    {
      "id": "send-welcome-email",
      "type": "EmailNode",
      "data": {
        "label": "Email Boas-Vindas",
        "to": "{{user_data.email}}",
        "template": "welcome-email",
        "variables": {
          "user_name": "{{user_data.name}}"
        }
      },
      "position": {"x": 1100, "y": 50}
    },
    {
      "id": "conditional-high-value",
      "type": "ConditionalNode",
      "data": {
        "label": "Valor Alto?",
        "condition": "{{user_data.initial_deposit > 10000}}"
      },
      "position": {"x": 1100, "y": 150}
    },
    {
      "id": "create-approval-task",
      "type": "TaskCreationNode",
      "data": {
        "label": "Criar Tarefa Aprovação",
        "task_type": "manual_approval",
        "assignee": "manager",
        "data": {
          "user_id": "{{create-user.id}}",
          "deposit": "{{user_data.initial_deposit}}"
        }
      },
      "position": {"x": 1300, "y": 250}
    },
    {
      "id": "notify-manager",
      "type": "NotificationNode",
      "data": {
        "label": "Notificar Gestor",
        "channel": "slack",
        "message": "Novo usuário de alto valor: {{user_data.name}} - R$ {{user_data.initial_deposit}}"
      },
      "position": {"x": 1300, "y": 150}
    },
    {
      "id": "end",
      "type": "EndNode",
      "data": {
        "label": "Fim",
        "output": {
          "user_id": "{{create-user.id}}",
          "status": "created"
        }
      },
      "position": {"x": 1500, "y": 100}
    }
  ],
  "edges": [
    {"source": "start", "target": "validate"},
    {"source": "validate", "target": "check-exists"},
    {"source": "check-exists", "target": "conditional-exists"},
    {"source": "conditional-exists", "target": "error-exists", "label": "true"},
    {"source": "conditional-exists", "target": "create-user", "label": "false"},
    {"source": "create-user", "target": "send-welcome-email"},
    {"source": "create-user", "target": "conditional-high-value"},
    {"source": "conditional-high-value", "target": "create-approval-task", "label": "true"},
    {"source": "conditional-high-value", "target": "notify-manager", "label": "true"},
    {"source": "conditional-high-value", "target": "end", "label": "false"},
    {"source": "send-welcome-email", "target": "end"},
    {"source": "create-approval-task", "target": "end"},
    {"source": "notify-manager", "target": "end"}
  ],
  "variables": {
    "oracle_id": "uuid-here",
    "user_data": {}
  }
}
```

Usuário abre no LangFlow UI e vê diagrama visual completo:
- 11 nós conectados
- Fluxo condicional claro (if usuário existe → erro, if valor alto → aprovação manual)
- Pode ajustar posições, adicionar validações extras, alterar templates de email
- Testa com dados mock e verifica funcionamento

**MODO 2: Design Manual no LangFlow** (para power users):

1. **Design Visual**:
   - Product Manager/Dev desenha workflow no LangFlow UI
   - Testa com dados reais
   - Exporta para JSON

2. **Import para SuperCore**:
   - JSON importado para `workflows` table
   - IA converte para código executável
   - Workflow fica disponível para agentes

3. **Execution**:
   - Agentes chamam workflows via API
   - LangGraph executa workflow
   - Resultados retornados

**Exemplo: Generic RAG Workflow**:

**LangFlow Visual**:
```
[User Query] → [Embedding] → [Vector Search] → [Retrieved Docs]
                                                      ↓
[LLM] ← [Prompt Template] ← [Context Builder] ← [Retrieved Docs]
  ↓
[Response]
```

**Export JSON**:
```json
{
  "flow_id": "generic-rag-flow",
  "nodes": [
    {
      "id": "1",
      "type": "TextInput",
      "data": {"name": "User Query"}
    },
    {
      "id": "2",
      "type": "Embeddings",
      "data": {"model": "paraphrase-multilingual-mpnet-base-v2"}
    },
    {
      "id": "3",
      "type": "VectorStoreRetriever",
      "data": {"vectorstore": "pgvector", "k": 5}
    },
    {
      "id": "4",
      "type": "PromptTemplate",
      "data": {
        "template": "Answer based on context:\n\n{context}\n\nQuestion: {query}"
      }
    },
    {
      "id": "5",
      "type": "ChatOpenAI",
      "data": {"model": "gpt-4-turbo"}
    }
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3"},
    {"source": "3", "target": "4"},
    {"source": "4", "target": "5"}
  ]
}
```

**Converted to Code** (auto-generated):
```python
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import PGVector
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

async def execute_generic_rag_flow(query: str, oracle_id: str):
    # 1. Embed query
    embeddings = SentenceTransformerEmbeddings(
        model_name="paraphrase-multilingual-mpnet-base-v2"
    )
    query_embedding = embeddings.embed_query(query)

    # 2. Vector search
    vectorstore = PGVector(
        connection_string=f"postgresql://...",
        collection_name=f"oracle_{oracle_id}",
        embedding_function=embeddings
    )
    docs = await vectorstore.asimilarity_search(query, k=5)

    # 3. Build context
    context = "\n\n".join([doc.page_content for doc in docs])

    # 4. LLM
    prompt = ChatPromptTemplate.from_template(
        "Answer based on context:\n\n{context}\n\nQuestion: {query}"
    )
    llm = ChatOpenAI(model="gpt-4-turbo")
    chain = prompt | llm

    response = await chain.ainvoke({"context": context, "query": query})

    return response.content
```

#### Onde é Usado (Camada/Componente)

**Camada 3 (Orquestração)**: Design de workflows
**Camada 2 (Abstração)**: Armazenamento de workflow definitions
**Camada 1 (Fundação)**: Execução de workflows

#### Catálogo de Nós LangFlow (Usados pela IA)

A IA tem acesso a um catálogo completo de tipos de nós que podem ser usados na geração automática de workflows:

**1. Nós de Entrada/Saída**:
- `StartNode`: Início do workflow (recebe inputs)
- `EndNode`: Fim do workflow (retorna outputs)
- `InputNode`: Campo de entrada de dados
- `OutputNode`: Campo de saída de dados

**2. Nós de Processamento**:
- `TransformationNode`: Transformação de dados (map, filter, reduce)
- `ValidationNode`: Validação de schemas, tipos, regras
- `EnrichmentNode`: Enriquecimento com dados externos
- `AggregationNode`: Agregação de múltiplos inputs

**3. Nós de Controle de Fluxo**:
- `ConditionalNode`: If/else baseado em condição
- `SwitchNode`: Switch/case para múltiplas opções
- `LoopNode`: Iteração sobre arrays/listas
- `ParallelNode`: Execução paralela de múltiplos ramos
- `MergeNode`: Merge de múltiplos ramos paralelos

**4. Nós de Dados/Persistência**:
- `DatabaseQueryNode`: Query SQL (SELECT)
- `DatabaseInsertNode`: Insert de dados
- `DatabaseUpdateNode`: Update de dados
- `DatabaseDeleteNode`: Delete de dados
- `CacheNode`: Cache de resultados (Redis)

**5. Nós de IA/LLM**:
- `LLMNode`: Chamada a LLM (Claude, GPT, Llama)
- `PromptNode`: Template de prompt
- `EmbeddingNode`: Geração de embeddings
- `VectorSearchNode`: Busca semântica (pgvector)
- `RAGNode`: Retrieval-Augmented Generation completo

**6. Nós de Integração**:
- `APICallNode`: HTTP request (REST/GraphQL)
- `WebhookNode`: Trigger webhook
- `EmailNode`: Envio de emails
- `NotificationNode`: Notificações (Slack, Teams, Push)
- `FileUploadNode`: Upload de arquivos (MinIO)
- `FileDownloadNode`: Download de arquivos

**7. Nós de Agentes**:
- `AgentCallNode`: Chama agente CrewAI
- `CrewNode`: Executa crew completo (multi-agente)
- `ToolNode`: Executa ferramenta standalone

**8. Nós de Negócio (Genéricos)**:
- `ApprovalNode`: Aprovação manual/automática
- `TaskCreationNode`: Criação de tarefas
- `EventEmitterNode`: Emit evento para Pulsar
- `EventListenerNode`: Listen evento de Pulsar
- `StateTransitionNode`: Transição de estados (FSM)

**9. Nós de Error Handling**:
- `ErrorNode`: Retorna erro customizado
- `RetryNode`: Retry com backoff exponencial
- `FallbackNode`: Fallback para fluxo alternativo
- `TimeoutNode`: Timeout com ação customizada

**10. Nós Customizados**:
- `PythonCodeNode`: Código Python inline
- `JavaScriptCodeNode`: Código JS inline
- `CustomFunctionNode`: Função customizada importada

**Exemplo: IA Selecionando Nós para Workflow de Aprovação**:

Descrição do usuário:
```
"Workflow para aprovar despesas:
1. Validar dados (valor, categoria, anexos)
2. Se valor < R$1000, aprovar automaticamente
3. Se valor >= R$1000, criar tarefa para gestor
4. Gestor aprova ou rejeita
5. Se aprovado, processar pagamento
6. Notificar funcionário do resultado"
```

Nós selecionados pela IA:
```json
{
  "selected_nodes": [
    {
      "node_type": "StartNode",
      "rationale": "Workflow precisa de um ponto de entrada para receber dados da despesa"
    },
    {
      "node_type": "ValidationNode",
      "rationale": "Requisito: validar dados (valor, categoria, anexos)"
    },
    {
      "node_type": "ConditionalNode",
      "rationale": "Requisito: decisão baseada em valor (< R$1000 vs >= R$1000)"
    },
    {
      "node_type": "StateTransitionNode",
      "rationale": "Aprovação automática = transição de estado para 'approved'"
    },
    {
      "node_type": "TaskCreationNode",
      "rationale": "Requisito: criar tarefa para gestor quando valor >= R$1000"
    },
    {
      "node_type": "ApprovalNode",
      "rationale": "Requisito: gestor aprova ou rejeita manualmente"
    },
    {
      "node_type": "ConditionalNode",
      "rationale": "Decisão: processar pagamento se aprovado, notificar se rejeitado"
    },
    {
      "node_type": "APICallNode",
      "rationale": "Processar pagamento via API externa de pagamentos"
    },
    {
      "node_type": "NotificationNode",
      "rationale": "Requisito: notificar funcionário do resultado"
    },
    {
      "node_type": "EndNode",
      "rationale": "Fim do workflow, retorna status final"
    }
  ]
}
```

Workflow gerado conecta esses 10 nós em sequência/condicional:
- Start → Validation → Conditional (valor?)
  - Se < R$1000: StateTransition (auto-approve) → Payment API → Notification → End
  - Se >= R$1000: TaskCreation → Approval → Conditional (aprovado?)
    - Se aprovado: Payment API → Notification → End
    - Se rejeitado: Notification → End

**Extensibilidade**:

Desenvolvedores podem criar nós customizados e registrá-los no catálogo:

```python
# Custom node definition
@register_node_type("CustomRiskAnalysisNode")
class RiskAnalysisNode(BaseNode):
    """Analisa risco de transação usando ML model"""

    def __init__(self, model_path: str, threshold: float):
        self.model = load_model(model_path)
        self.threshold = threshold

    async def execute(self, transaction_data: dict) -> dict:
        # Score de risco (0-1)
        risk_score = await self.model.predict(transaction_data)

        return {
            "risk_score": risk_score,
            "is_high_risk": risk_score > self.threshold,
            "recommendation": "manual_review" if risk_score > self.threshold else "auto_approve"
        }

# IA agora pode usar este nó em workflows gerados
```

Quando IA gera workflows, ela:
1. Analisa requisitos do usuário
2. Consulta catálogo de nós disponíveis
3. Seleciona nós apropriados (built-in + custom)
4. Conecta nós em ordem lógica
5. Gera JSON LangFlow completo

### 4.3 Casos de Uso

#### Quando Usar LangFlow

1. **RAG Pipelines**: Design visual de RAG complexo
2. **Multi-step Workflows**: Processos com múltiplas etapas
3. **Prototyping**: Testar ideias rapidamente
4. **Non-technical Users**: Product Managers podem criar workflows

#### Quando Usar Código Puro

1. **Performance crítica**: Código otimizado manualmente
2. **Lógica complexa**: If/else, loops, error handling
3. **Integrações customizadas**: APIs específicas

#### Exemplos Práticos

**Exemplo 1: Testing Document Ingestion**

**Objetivo**: Testar ingestão de documento regulatório

**LangFlow**:
1. Node: PDF Loader (document.pdf)
2. Node: Text Splitter (chunk_size=1000)
3. Node: Embeddings (multilingual model)
4. Node: pgvector Store
5. Node: Test Query ("What are the key requirements?")
6. Node: Response

**Teste na UI**:
- Upload document.pdf
- Query: "What are the key requirements?"
- Verifica resposta + chunks retornados

**Result**:
- Query: "What are the key requirements?" → Resposta correta + 3 chunks relevantes
- Query: "How to handle exceptions?" → Resposta parcialmente correta + 5 chunks (2 irrelevantes)

**Ajustes**:
- Chunk size: 1000 → 800 (melhora precisão)
- k: 5 → 3 (menos ruído)

**Exemplo 2: Design de Workflow Genérico (LangFlow → Code)**

**LangFlow Visual**:
```
Workflow: DataProcessingFlow

Nodes:
1. Input: Data source
2. Validator: Validate data schema
3. Transformer: Apply transformations
4. Enricher: Enrich with external data
5. Loader: Load to database
```

**Export JSON**:
```json
{
  "flow": "data-processing",
  "nodes": [
    {"id": "1", "type": "DataSource", "data": {...}},
    {"id": "2", "type": "Validator", "data": {...}},
    {"id": "3", "type": "Transformer", "data": {...}},
    {"id": "4", "type": "Enricher", "data": {...}},
    {"id": "5", "type": "Loader", "data": {...}}
  ],
  "edges": [...]
}
```

**Auto-generated Code**:
```python
# Auto-generated from LangFlow
async def execute_data_processing_flow(input_data: dict):
    # 1. Validate
    validated = await validate_schema(input_data)

    # 2. Transform
    transformed = await apply_transformations(validated)

    # 3. Enrich
    enriched = await enrich_with_external_data(transformed)

    # 4. Load
    await load_to_database(enriched)

    return {"status": "success"}
```

**Persistência**:
```sql
INSERT INTO process_definitions (name, workflow) VALUES ('data_processing', '{...}');
```

---

## 4.4 LangGraph - Motor de Execução Stateful

### 4.4.1 O que é LangGraph

**Papel**: Framework para construir fluxos complexos e stateful com suporte a loops, condições, estado persistente e checkpoints.

**Versão Mínima**: 0.2.0

**Filosofia**: "Build stateful, multi-actor applications with LLMs, using a graph-based approach"

**Conceitos Core**:
- **StateGraph**: Grafo com estado compartilhado entre nós
- **Nodes**: Funções que processam o estado
- **Edges**: Conexões entre nós (condicionais ou diretas)
- **State**: Objeto compartilhado entre todos os nós
- **Checkpoints**: Salvamento automático do estado para recovery
- **Cycles**: Suporte nativo a loops
- **Conditional Routing**: Decisões dinâmicas de roteamento

**Diferencial**: LangGraph é o único framework que combina state management robusto com execução de LLM workflows, permitindo fluxos de longa duração com recovery automático.

### 4.4.2 Integração com SuperCore

#### Como se Integra com LangFlow e CrewAI

**Fluxo Completo**:

```
1. LangFlow (Design)
   - Usuário ou IA cria workflow visual
   - Exporta JSON com nodes + edges

2. PostgreSQL (Storage)
   - Workflow JSON salvo em tabela `workflows`
   - Versionamento mantido

3. LangGraph (Runtime)
   - Carrega workflow JSON do banco
   - Converte para StateGraph executável
   - Executa com estado persistente
   - Chama agentes CrewAI quando necessário

4. Checkpoints (Recovery)
   - Estado salvo automaticamente após cada nó
   - Recovery automático em caso de falha
   - Replay de execução para debugging
```

**Arquitetura**:

```python
# workflow_executor.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver
from typing import TypedDict, Annotated
import operator

# 1. Define State Schema
class WorkflowState(TypedDict):
    """Estado compartilhado entre todos os nós do workflow"""
    oracle_id: str
    user_input: dict
    validated_data: dict | None
    risk_score: float | None
    approval_status: str | None
    result: dict | None
    errors: Annotated[list[str], operator.add]  # Lista acumulativa de erros
    step_count: int

# 2. Load Workflow Definition from PostgreSQL
async def load_workflow(workflow_id: str) -> dict:
    """Carrega workflow JSON do banco"""
    workflow = await db.workflows.find_one({"id": workflow_id})
    return workflow["workflow_json"]

# 3. Convert LangFlow JSON to LangGraph StateGraph
async def build_state_graph(workflow_json: dict) -> StateGraph:
    """Converte LangFlow JSON em StateGraph executável"""

    # Create graph
    graph = StateGraph(WorkflowState)

    # Add nodes (from LangFlow JSON)
    for node in workflow_json["nodes"]:
        node_function = create_node_function(node)
        graph.add_node(node["id"], node_function)

    # Add edges (from LangFlow JSON)
    for edge in workflow_json["edges"]:
        if "condition" in edge:
            # Conditional edge
            graph.add_conditional_edges(
                edge["source"],
                create_condition_function(edge["condition"]),
                {
                    "true": edge["target"],
                    "false": edge.get("target_false", END)
                }
            )
        else:
            # Direct edge
            graph.add_edge(edge["source"], edge["target"])

    # Set entry point
    graph.set_entry_point(workflow_json["entry_point"])

    return graph

# 4. Create Node Function (pode chamar CrewAI agents)
def create_node_function(node_config: dict):
    """Cria função executável para um nó"""

    node_type = node_config["type"]

    if node_type == "ValidationNode":
        async def validation_node(state: WorkflowState) -> WorkflowState:
            """Valida dados de entrada"""
            # Validação usando Pydantic ou JSON Schema
            try:
                validated = validate_schema(
                    state["user_input"],
                    node_config["data"]["schema"]
                )
                state["validated_data"] = validated
                state["step_count"] += 1
            except ValidationError as e:
                state["errors"].append(f"Validation failed: {e}")

            return state

        return validation_node

    elif node_type == "AgentCallNode":
        async def agent_call_node(state: WorkflowState) -> WorkflowState:
            """Chama agente CrewAI"""
            from crewai import Agent, Task

            # Load agent definition from database
            agent_def = await db.agents.find_one({
                "id": node_config["data"]["agent_id"]
            })

            # Instantiate CrewAI Agent
            agent = Agent(
                role=agent_def["role"],
                goal=agent_def["goal"],
                backstory=agent_def["backstory"],
                tools=load_tools(agent_def["tools"]),
                verbose=True
            )

            # Create task
            task = Task(
                description=node_config["data"]["task_description"].format(**state),
                agent=agent
            )

            # Execute (bloqueante, mas async-compatible)
            result = await asyncio.to_thread(task.execute)

            # Update state
            state[node_config["data"]["output_key"]] = result.output
            state["step_count"] += 1

            return state

        return agent_call_node

    elif node_type == "ConditionalNode":
        # Conditional nodes são tratados como edges, não nodes
        async def conditional_node(state: WorkflowState) -> WorkflowState:
            state["step_count"] += 1
            return state

        return conditional_node

    elif node_type == "DatabaseQueryNode":
        async def db_query_node(state: WorkflowState) -> WorkflowState:
            """Executa query no banco"""
            query = node_config["data"]["query"].format(**state)
            result = await db.execute(query)
            state[node_config["data"]["output_key"]] = result
            state["step_count"] += 1
            return state

        return db_query_node

    # ... outros tipos de nós

# 5. Execute Workflow with Checkpoints
async def execute_workflow(
    workflow_id: str,
    oracle_id: str,
    user_input: dict
) -> dict:
    """
    Executa workflow com estado persistente e checkpoints.

    Se falhar, pode retomar de onde parou.
    """

    # Load workflow
    workflow_json = await load_workflow(workflow_id)

    # Build graph
    graph = await build_state_graph(workflow_json)

    # Compile with checkpoint saver (PostgreSQL)
    checkpointer = PostgresSaver.from_conn_string(
        "postgresql://user:pass@localhost/supercore"
    )

    app = graph.compile(checkpointer=checkpointer)

    # Initial state
    initial_state: WorkflowState = {
        "oracle_id": oracle_id,
        "user_input": user_input,
        "validated_data": None,
        "risk_score": None,
        "approval_status": None,
        "result": None,
        "errors": [],
        "step_count": 0
    }

    # Execute with thread_id for checkpointing
    config = {"configurable": {"thread_id": f"{oracle_id}_{workflow_id}"}}

    try:
        # Stream execution (permite monitoring em tempo real)
        final_state = None
        async for state in app.astream(initial_state, config):
            print(f"Step {state['step_count']}: {list(state.keys())}")
            final_state = state

        return final_state["result"]

    except Exception as e:
        # Log error e salva checkpoint
        print(f"Workflow failed at step {final_state['step_count']}: {e}")

        # Pode retomar depois com:
        # app.astream(None, config)  # Retoma de onde parou

        raise

# 6. Resume Failed Workflow
async def resume_workflow(workflow_id: str, oracle_id: str) -> dict:
    """Retoma workflow que falhou, de onde parou"""

    # Load workflow
    workflow_json = await load_workflow(workflow_id)
    graph = await build_state_graph(workflow_json)

    # Compile with same checkpointer
    checkpointer = PostgresSaver.from_conn_string(
        "postgresql://user:pass@localhost/supercore"
    )
    app = graph.compile(checkpointer=checkpointer)

    # Resume with same thread_id
    config = {"configurable": {"thread_id": f"{oracle_id}_{workflow_id}"}}

    # Stream from last checkpoint
    final_state = None
    async for state in app.astream(None, config):  # None = resume
        print(f"Resuming step {state['step_count']}")
        final_state = state

    return final_state["result"]
```

#### Onde é Usado (Camada/Componente)

**Camada 3 (Orquestração)**: Runtime de workflows
**Camada 2 (Abstração)**: Carrega workflow definitions
**Camada 1 (Fundação)**: Chama agentes e LLMs
**Camada 0 (Dados)**: Salva checkpoints

### 4.4.3 Casos de Uso

#### Quando Usar LangGraph

1. **Workflows com Estado Complexo**: Estado compartilhado entre múltiplos passos
2. **Workflows de Longa Duração**: Processos que podem levar horas/dias
3. **Workflows com Loops**: Iterações até condição ser satisfeita
4. **Workflows com Recovery**: Necessidade de retomar após falha
5. **Workflows com Debugging**: Necessidade de replay e inspeção de estado

#### Quando NÃO Usar LangGraph

1. **Workflows Simples**: 1-2 passos sem estado
2. **Workflows Síncronos Rápidos**: Execução < 1 segundo
3. **Workflows Sem LLM**: Melhor usar Temporal.io ou Airflow

#### Exemplos Práticos

**Exemplo 1: Workflow de Aprovação com Múltiplas Etapas**

```python
# Workflow: Aprovação de Alto Valor (pode levar dias)
from langgraph.graph import StateGraph, END

class ApprovalState(TypedDict):
    request_id: str
    amount: float
    requester: str
    approval_level: int  # 1, 2, 3
    approvers: list[str]
    approved_by: list[str]
    rejected: bool
    final_status: str | None

graph = StateGraph(ApprovalState)

# Nós
def check_amount(state: ApprovalState) -> ApprovalState:
    """Define nível de aprovação baseado no valor"""
    if state["amount"] < 1000:
        state["approval_level"] = 1
    elif state["amount"] < 10000:
        state["approval_level"] = 2
    else:
        state["approval_level"] = 3
    return state

def request_approval(state: ApprovalState) -> ApprovalState:
    """Solicita aprovação (pode esperar horas/dias)"""
    level = state["approval_level"]
    approvers = get_approvers_for_level(level)

    # Envia notificação e aguarda (checkpoint aqui!)
    send_approval_request(approvers, state["request_id"])

    state["approvers"] = approvers
    return state

def wait_for_approval(state: ApprovalState) -> ApprovalState:
    """Aguarda aprovação (pode ser retomado depois)"""
    # Este nó pode ser executado múltiplas vezes
    # até que alguém aprove ou rejeite

    approval = check_approval_status(state["request_id"])

    if approval["status"] == "approved":
        state["approved_by"].append(approval["approver"])
    elif approval["status"] == "rejected":
        state["rejected"] = True

    return state

def should_continue(state: ApprovalState) -> str:
    """Decide se continua aguardando ou finaliza"""
    if state["rejected"]:
        return "reject"
    elif len(state["approved_by"]) >= state["approval_level"]:
        return "approve"
    else:
        return "wait"  # Loop

# Montar grafo
graph.add_node("check_amount", check_amount)
graph.add_node("request_approval", request_approval)
graph.add_node("wait_approval", wait_for_approval)

graph.set_entry_point("check_amount")
graph.add_edge("check_amount", "request_approval")
graph.add_edge("request_approval", "wait_approval")

graph.add_conditional_edges(
    "wait_approval",
    should_continue,
    {
        "wait": "wait_approval",  # Loop!
        "approve": END,
        "reject": END
    }
)

# Executar (pode pausar e retomar)
app = graph.compile(checkpointer=checkpointer)
```

**Exemplo 2: Workflow com CrewAI Agents (Multi-Step Analysis)**

```python
# Workflow: Análise de Risco Multi-Agente com Estado Persistente
class RiskAnalysisState(TypedDict):
    loan_request: dict
    credit_history: dict | None
    income_verification: dict | None
    risk_score: float | None
    recommendation: str | None
    analyst_notes: list[str]

graph = StateGraph(RiskAnalysisState)

# Nó 1: Coleta de Dados (Agent)
async def collect_data(state: RiskAnalysisState) -> RiskAnalysisState:
    """CrewAI Agent coleta dados do cliente"""
    agent = Agent(
        role="Data Collector",
        goal="Collect comprehensive client data",
        tools=[CreditBureauTool, IncomeVerificationTool]
    )

    task = Task(
        description=f"Collect data for loan request: {state['loan_request']}",
        agent=agent
    )

    result = await asyncio.to_thread(task.execute)

    state["credit_history"] = result.output["credit"]
    state["income_verification"] = result.output["income"]
    state["analyst_notes"].append("Data collected successfully")

    return state

# Nó 2: Análise de Risco (Agent)
async def analyze_risk(state: RiskAnalysisState) -> RiskAnalysisState:
    """CrewAI Agent analisa risco"""
    agent = Agent(
        role="Risk Analyst",
        goal="Calculate accurate risk score",
        tools=[RiskModelTool, StatisticalAnalysisTool]
    )

    task = Task(
        description=f"""
        Analyze risk for:
        - Credit history: {state['credit_history']}
        - Income: {state['income_verification']}
        - Loan amount: {state['loan_request']['amount']}
        """,
        agent=agent
    )

    result = await asyncio.to_thread(task.execute)

    state["risk_score"] = result.output["score"]
    state["analyst_notes"].append(f"Risk score: {result.output['score']}")

    return state

# Nó 3: Recomendação (Agent)
async def generate_recommendation(state: RiskAnalysisState) -> RiskAnalysisState:
    """CrewAI Agent gera recomendação final"""
    agent = Agent(
        role="Senior Analyst",
        goal="Provide final recommendation",
        tools=[PolicyCheckTool, ComplianceTool]
    )

    task = Task(
        description=f"""
        Generate recommendation based on:
        - Risk score: {state['risk_score']}
        - Notes: {state['analyst_notes']}
        """,
        agent=agent
    )

    result = await asyncio.to_thread(task.execute)

    state["recommendation"] = result.output["recommendation"]
    state["analyst_notes"].append(result.output["rationale"])

    return state

# Montar grafo
graph.add_node("collect", collect_data)
graph.add_node("analyze", analyze_risk)
graph.add_node("recommend", generate_recommendation)

graph.set_entry_point("collect")
graph.add_edge("collect", "analyze")
graph.add_edge("analyze", "recommend")
graph.add_edge("recommend", END)

# Executar com checkpoints (pode falhar e retomar)
app = graph.compile(checkpointer=checkpointer)

result = await app.ainvoke({
    "loan_request": {"amount": 50000, "term": 36},
    "credit_history": None,
    "income_verification": None,
    "risk_score": None,
    "recommendation": None,
    "analyst_notes": []
})
```

### 4.4.4 Vantagens do LangGraph

**1. Estado Persistente**:
- Estado compartilhado entre todos os nós
- Checkpoints automáticos após cada nó
- Recovery automático em caso de falha

**2. Loops e Condições**:
- Suporte nativo a loops (ciclos no grafo)
- Conditional routing dinâmico
- Lógica complexa de decisão

**3. Debugging e Observabilidade**:
- Replay de execução
- Inspeção de estado em cada passo
- Visualização do grafo de execução

**4. Integração com CrewAI**:
- Chama agentes CrewAI de dentro de nós
- Mantém estado entre chamadas de agentes
- Coordena múltiplos agentes em sequência ou paralelo

**5. Portabilidade**:
- Carrega workflows de JSON (LangFlow)
- Persiste estado em PostgreSQL
- Compatível com LangChain

### 4.4.5 Persistência de Checkpoints

**Schema PostgreSQL**:

```sql
-- Tabela de checkpoints LangGraph
CREATE TABLE langgraph_checkpoints (
    thread_id VARCHAR(255) NOT NULL,
    checkpoint_ns VARCHAR(255) DEFAULT '',
    checkpoint_id VARCHAR(255) NOT NULL,
    parent_checkpoint_id VARCHAR(255),
    type VARCHAR(50),
    checkpoint JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE INDEX idx_checkpoints_thread ON langgraph_checkpoints(thread_id);
CREATE INDEX idx_checkpoints_parent ON langgraph_checkpoints(parent_checkpoint_id);

-- Exemplo de checkpoint salvo
-- {
--   "thread_id": "oracle-123_workflow-456",
--   "checkpoint_id": "1a2b3c4d",
--   "checkpoint": {
--     "oracle_id": "oracle-123",
--     "user_input": {"amount": 50000},
--     "validated_data": {"amount": 50000, "term": 36},
--     "risk_score": 0.45,
--     "approval_status": null,
--     "result": null,
--     "errors": [],
--     "step_count": 3
--   },
--   "metadata": {
--     "source": "langgraph",
--     "step": "analyze_risk",
--     "timestamp": "2025-12-21T10:30:00Z"
--   }
-- }
```

---

## 5. CREWAI

### 5.1 O que é CrewAI

**Papel**: Framework para multi-agent collaboration (agnóstico de domínio)

**Versão Mínima**: 0.11.0

**Filosofia**: "Simulate a team of specialists collaborating to solve complex problems"

**Conceitos Core**:
- **Agent**: Especialista com role, goal, backstory
- **Task**: Trabalho específico
- **Crew**: Time de agentes
- **Process**: Modo de colaboração (Sequential, Hierarchical, Consensual)
- **Tools**: Ferramentas que agentes podem usar

**Diferencial**: Permite que LLMs colaborem entre si, deleguem tasks, e tomem decisões em grupo

### 5.2 Integração com SuperCore

#### Como se Integra com Biblioteca de Agentes

**1. Agent Definition** (table `agents`):
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    name VARCHAR(255),
    role TEXT,
    goal TEXT,
    backstory TEXT,
    tools TEXT[],  -- Lista de ferramentas
    allow_delegation BOOLEAN DEFAULT FALSE,
    verbose BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (oracle_id) REFERENCES oracles(id)
);
```

**2. Agent Generation via IA**:
- Product Manager: "Preciso de um agente para validar dados"
- IA (Architect Agent):
  - Consulta Oráculo (RAG) para entender domínio
  - Gera agent definition automaticamente
  - Persiste em table `agents`

**3. Agent Instantiation** (runtime):
```python
from crewai import Agent

# Load from database
agent_def = db.get_agent(agent_id)

# Instantiate CrewAI Agent
agent = Agent(
    role=agent_def.role,
    goal=agent_def.goal,
    backstory=agent_def.backstory,
    tools=load_tools(agent_def.tools),
    allow_delegation=agent_def.allow_delegation,
    verbose=agent_def.verbose
)
```

**4. Execution**:
- User triggers agent via Portal UI
- Portal → MCP → Pulsar → Agent Executor
- Agent Executor instancia Agent
- Agent executa task
- Result → Pulsar → Portal UI (real-time)

**Architecture**:
```
Portal UI
  ↓ (MCP)
Apache Pulsar (topic: agent_requests)
  ↓
Agent Executor Service (Python)
  ↓
  1. Load agent_def from DB
  2. Instantiate CrewAI Agent
  3. Execute task
  ↓
Apache Pulsar (topic: agent_results)
  ↓
Portal UI (real-time update)
```

#### Workflows Colaborativos

**Exemplo: Generic Multi-Step Process**:

**Crew de 3 Agentes**:
1. **Data Analyst**: Analisa dados
2. **Validator**: Valida resultados
3. **Reporter**: Gera relatório

**Workflow**:
```python
from crewai import Agent, Task, Crew, Process

# Agent 1: Data Analyst
analyst = Agent(
    role="Data Analyst",
    goal="Extract insights from raw data",
    backstory="Expert in data analysis with 10+ years experience",
    tools=[DataAnalysisTool, StatisticsTool],
    verbose=True
)

# Agent 2: Validator
validator = Agent(
    role="Data Validator",
    goal="Ensure data quality and accuracy",
    backstory="Expert in data validation and quality assurance",
    tools=[ValidationTool, QualityCheckTool],
    verbose=True
)

# Agent 3: Reporter
reporter = Agent(
    role="Report Generator",
    goal="Generate comprehensive reports",
    backstory="Expert in technical writing and data visualization",
    tools=[ReportingTool, VisualizationTool],
    verbose=True
)

# Tasks
task_analyze = Task(
    description="Analyze the input data and extract key insights",
    agent=analyst,
    expected_output="Analysis report with key insights"
)

task_validate = Task(
    description="Validate the analysis results for accuracy",
    agent=validator,
    expected_output="Validation report with quality score"
)

task_report = Task(
    description="Generate final report combining analysis and validation",
    agent=reporter,
    expected_output="Comprehensive final report"
)

# Crew
crew = Crew(
    agents=[analyst, validator, reporter],
    tasks=[task_analyze, task_validate, task_report],
    process=Process.sequential,
    verbose=2
)

# Execute
result = crew.kickoff(inputs={
    "data": {...}
})
```

### 5.3 Casos de Uso

#### Autonomous Agents

**Caso 1: Monitoring Agent (Sequential)**

**Objetivo**: Monitorar sistema e tomar ações automáticas

**Agents**:
1. **Monitoring Agent**: Coleta métricas
2. **Analysis Agent**: Analisa métricas
3. **Action Agent**: Toma ações corretivas

**Flow**:
```
Monitoring Agent (coleta) → Analysis Agent (analisa) → Action Agent (age)
```

**Exemplo**:
```python
monitoring_agent = Agent(
    role="System Monitor",
    goal="Collect system metrics and detect anomalies",
    tools=[MetricsTool, LogAnalysisTool]
)

analysis_agent = Agent(
    role="Metric Analyst",
    goal="Analyze metrics and identify issues",
    tools=[AnalyticsTool, AnomalyDetectionTool]
)

action_agent = Agent(
    role="Remediation Specialist",
    goal="Take corrective actions automatically",
    tools=[RestartServiceTool, ScaleUpTool, AlertTool],
    allow_delegation=False
)

crew = Crew(
    agents=[monitoring_agent, analysis_agent, action_agent],
    process=Process.sequential
)
```

#### Multi-Agent Collaboration

**Caso 2: Complex Problem Resolution (Hierarchical)**

**Objetivo**: Resolver problema complexo com múltiplos especialistas

**Agents**:
1. **Manager Agent**: Coordena time (delega tasks)
2. **Data Specialist**: Extrai dados
3. **Business Analyst**: Analisa impacto
4. **Compliance Specialist**: Verifica conformidade

**Flow**:
```
Manager Agent
  ↓ (delega)
  ├─ Data Specialist
  ├─ Business Analyst
  └─ Compliance Specialist
  ↓ (sintetiza)
Manager Agent (decisão final)
```

**Exemplo**:
```python
manager = Agent(
    role="Problem Resolution Manager",
    goal="Coordinate team to solve complex problem",
    backstory="Experienced manager with expertise in problem-solving",
    allow_delegation=True,  # Pode delegar
    verbose=True
)

data_specialist = Agent(
    role="Data Specialist",
    goal="Extract and prepare relevant data",
    tools=[DatabaseTool, APITool]
)

business_analyst = Agent(
    role="Business Analyst",
    goal="Analyze business impact",
    tools=[AnalyticsTool, ForecastingTool]
)

compliance_specialist = Agent(
    role="Compliance Specialist",
    goal="Ensure regulatory compliance",
    tools=[ComplianceTool, PolicyEngineTool]
)

task_complex = Task(
    description="""
    Solve this complex problem:

    Problem: {problem_description}

    Steps:
    1. Extract relevant data (delegate to data_specialist)
    2. Analyze business impact (delegate to business_analyst)
    3. Verify compliance (delegate to compliance_specialist)
    4. Synthesize solution and make final decision
    """,
    agent=manager,
    expected_output="Complete solution with justification"
)

crew = Crew(
    agents=[manager, data_specialist, business_analyst, compliance_specialist],
    tasks=[task_complex],
    process=Process.hierarchical,
    manager_llm="gpt-4-turbo"
)

result = crew.kickoff(inputs={
    "problem_description": "..."
})
```

**Output Example**:
```json
{
  "solution": "...",
  "data_analysis": {...},
  "business_impact": {...},
  "compliance_status": {
    "compliant": true,
    "checks_passed": ["rule_1", "rule_2", "rule_3"]
  },
  "justification": "...",
  "confidence": 0.95
}
```

#### Task Delegation

**Pattern**: Manager delega sub-tasks para especialistas

**Quando Usar**:
- Problema requer múltiplas especialidades
- Necessidade de coordenação central
- Dependências entre sub-tasks

**Exemplo: Hierarchical Process**:
```python
manager = Agent(
    role="Project Manager",
    goal="Deliver complete solution",
    allow_delegation=True
)

specialist_a = Agent(role="Specialist A", goal="Handle aspect A", tools=[ToolA])
specialist_b = Agent(role="Specialist B", goal="Handle aspect B", tools=[ToolB])
specialist_c = Agent(role="Specialist C", goal="Handle aspect C", tools=[ToolC])

crew = Crew(
    agents=[manager, specialist_a, specialist_b, specialist_c],
    process=Process.hierarchical
)

# Manager automatically delegates tasks to specialists
result = crew.kickoff(inputs={...})
```

#### Exemplos Práticos (Genéricos)

**Fluxo Completo: Generic Problem Resolution**

```python
# Contexto: User submits a complex problem for resolution

# 1. User submits problem via Portal
problem_data = {
    "problem_id": "prob-123",
    "description": "Complex issue requiring analysis",
    "priority": "high"
}

# 2. Portal sends to Pulsar
producer.send(
    topic="persistent://tenant-oracle-123/production/problem_requests",
    message=problem_data
)

# 3. Agent Executor receives message
consumer = pulsar_client.subscribe(
    topic="persistent://tenant-oracle-123/production/problem_requests",
    subscription_name="problem-resolver"
)

msg = consumer.receive()
problem = msg.value()

# 4. Instantiate Crew
# - SupportAgent: Receives and categorizes problem
support_agent = Agent(
    role="Support Specialist",
    goal="Receive problem and collect additional information",
    tools=[DatabaseTool, UserInterviewTool],
    verbose=True
)

# - AnalysisAgent: Investigates root cause
analysis_agent = Agent(
    role="Analysis Specialist",
    goal="Analyze root cause and patterns",
    tools=[AnalyticsTool, LogAnalysisTool],
    verbose=True
)

# - ValidationAgent: Verifies proposed solution
validation_agent = Agent(
    role="Validation Specialist",
    goal="Ensure solution meets quality standards",
    tools=[ValidationTool, TestingTool],
    verbose=True
)

# - ResolutionAgent: Synthesizes and decides
resolution_agent = Agent(
    role="Resolution Specialist",
    goal="Synthesize analysis and propose optimal solution",
    tools=[DecisionEngine, ImplementationTool],
    verbose=True
)

# Tasks
task_support = Task(
    description=f"""
    User submitted problem:
    {problem['description']}

    Collect:
    1. Relevant context
    2. Historical data
    3. User preferences
    """,
    agent=support_agent,
    expected_output="Problem context report"
)

task_analysis = Task(
    description="""
    Analyze problem with context:
    {context}

    Identify:
    1. Root cause
    2. Patterns
    3. Similar past cases
    """,
    agent=analysis_agent,
    expected_output="Root cause analysis"
)

task_validation = Task(
    description="""
    Validate proposed solution:
    {proposed_solution}

    Check:
    1. Feasibility
    2. Quality
    3. Compliance
    """,
    agent=validation_agent,
    expected_output="Validation report"
)

task_resolution = Task(
    description="""
    Based on analysis and validation, propose optimal solution.

    Provide:
    1. Recommended action
    2. Justification
    3. Implementation steps
    """,
    agent=resolution_agent,
    expected_output="Complete resolution proposal"
)

# Crew
problem_crew = Crew(
    agents=[support_agent, analysis_agent, validation_agent, resolution_agent],
    tasks=[task_support, task_analysis, task_validation, task_resolution],
    process=Process.sequential,
    verbose=2
)

# Execute
result = problem_crew.kickoff(inputs=problem)

# 5. Publish result
producer.send(
    topic="persistent://tenant-oracle-123/production/problem_results",
    message={
        "problem_id": problem["problem_id"],
        "status": "resolved",
        "solution": result["solution"],
        "justification": result["justification"]
    }
)

# 6. Portal UI updates in real-time
```

**Output**:
```json
{
  "problem_id": "prob-123",
  "status": "resolved",
  "context_collected": {...},
  "root_cause_analysis": {
    "root_cause": "...",
    "patterns_identified": [...]
  },
  "validation": {
    "feasible": true,
    "quality_score": 0.92,
    "compliant": true
  },
  "solution": {
    "recommended_action": "...",
    "implementation_steps": [...]
  },
  "justification": "...",
  "confidence": 0.95
}
```

---

## 5.5 LLM SERVING STRATEGY

**Papel**: Estratégia de serving de LLMs para ambientes diferentes (Dev, Prod, Fallback)

**Filosofia**: Máxima flexibilidade com fallback automático e zero vendor lock-in

### 5.5.1 Ambientes e Providers

**Estratégia Multi-Provider**:

```
Development (MacBook M3 Max)
    ↓
Ollama (localhost:11434)
    - Llama 3.1 70B
    - Qwen 2.5 72B
    - Mistral Large
    - Zero custo
    - Latência: ~2-5s

Production (GPU Cluster)
    ↓
vLLM (vllm-cluster:8000)
    - Llama 3.1 70B
    - Tensor Parallel (4x GPUs)
    - Batching otimizado
    - Latência: ~200-500ms
    - Throughput: 1000+ req/min

Fallback (API Cloud)
    ↓
Claude Opus 4.5 API (Anthropic)
    - Modelo mais capaz
    - Pay-per-use
    - Latência: ~1-3s
    - Usado quando vLLM/Ollama falham
```

### 5.5.2 Configuração via Environment Variables

**Variáveis de Ambiente**:

```bash
# .env.development
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:70b

# .env.production
LLM_PROVIDER=vllm
VLLM_BASE_URL=http://vllm-cluster.internal:8000
VLLM_MODEL=meta-llama/Llama-3.1-70b-chat
VLLM_TENSOR_PARALLEL_SIZE=4

# Fallback (todos os ambientes)
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4-5-20251101
ENABLE_FALLBACK=true
```

**Configuração Python**:

```python
# config/llm_config.py
import os
from enum import Enum
from pydantic import BaseModel

class LLMProvider(str, Enum):
    OLLAMA = "ollama"
    VLLM = "vllm"
    CLAUDE = "claude"
    OPENAI = "openai"

class LLMConfig(BaseModel):
    provider: LLMProvider
    base_url: str | None = None
    model: str
    api_key: str | None = None
    tensor_parallel_size: int | None = None
    temperature: float = 0.7
    max_tokens: int = 4096

def get_llm_config() -> LLMConfig:
    """Get LLM configuration based on environment"""

    provider = os.getenv("LLM_PROVIDER", "ollama")

    if provider == "ollama":
        return LLMConfig(
            provider=LLMProvider.OLLAMA,
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("OLLAMA_MODEL", "llama3.1:70b")
        )

    elif provider == "vllm":
        return LLMConfig(
            provider=LLMProvider.VLLM,
            base_url=os.getenv("VLLM_BASE_URL", "http://vllm-cluster:8000"),
            model=os.getenv("VLLM_MODEL", "meta-llama/Llama-3.1-70b-chat"),
            tensor_parallel_size=int(os.getenv("VLLM_TENSOR_PARALLEL_SIZE", "4"))
        )

    elif provider == "claude":
        return LLMConfig(
            provider=LLMProvider.CLAUDE,
            model=os.getenv("CLAUDE_MODEL", "claude-opus-4-5-20251101"),
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )

    elif provider == "openai":
        return LLMConfig(
            provider=LLMProvider.OPENAI,
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            api_key=os.getenv("OPENAI_API_KEY")
        )

    else:
        raise ValueError(f"Unknown LLM provider: {provider}")
```

### 5.5.3 Fallback Strategy

**Fallback Automático com Retries**:

```python
# services/llm_service.py
import httpx
import logging
from typing import Optional
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class LLMService:
    """Unified LLM service with automatic fallback"""

    def __init__(self):
        self.primary_config = get_llm_config()
        self.fallback_enabled = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"
        self.anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def complete(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        """Complete prompt with automatic fallback"""

        # Try primary provider (Ollama or vLLM)
        try:
            return await self._call_primary(prompt, temperature, max_tokens)
        except Exception as e:
            logger.warning(f"Primary LLM provider failed: {e}")

            if not self.fallback_enabled:
                raise

            # Fallback to Claude API
            logger.info("Falling back to Claude Opus 4.5 API")
            return await self._call_claude_fallback(prompt, temperature, max_tokens)

    async def _call_primary(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Call primary LLM provider (Ollama or vLLM)"""

        config = self.primary_config

        if config.provider in [LLMProvider.OLLAMA, LLMProvider.VLLM]:
            # OpenAI-compatible API
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{config.base_url}/v1/completions",
                    json={
                        "model": config.model,
                        "prompt": prompt,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                response.raise_for_status()
                return response.json()["choices"][0]["text"]

        elif config.provider == LLMProvider.CLAUDE:
            return await self._call_claude(prompt, temperature, max_tokens, config.api_key)

        elif config.provider == LLMProvider.OPENAI:
            # Call OpenAI API directly
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=config.api_key)
            completion = await client.completions.create(
                model=config.model,
                prompt=prompt,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return completion.choices[0].text

    async def _call_claude_fallback(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        """Fallback to Claude Opus 4.5 API"""
        return await self._call_claude(
            prompt,
            temperature,
            max_tokens,
            os.getenv("ANTHROPIC_API_KEY")
        )

    async def _call_claude(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        api_key: str
    ) -> str:
        """Call Claude API"""
        message = self.anthropic_client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text
```

### 5.5.4 Setup Ollama (Development)

**Instalação macOS (Apple Silicon)**:

```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# Pull models
ollama pull llama3.1:70b
ollama pull qwen2.5:72b
ollama pull mistral-large

# Verify
curl http://localhost:11434/api/version
```

**Exemplo de uso**:

```python
import httpx

# Call Ollama
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:11434/v1/completions",
        json={
            "model": "llama3.1:70b",
            "prompt": "Generate a validation rule for CPF field",
            "temperature": 0.7,
            "max_tokens": 2048
        }
    )
    print(response.json()["choices"][0]["text"])
```

### 5.5.5 Setup vLLM (Production)

**Deploy vLLM em Kubernetes com GPU**:

```yaml
# k8s/vllm-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-llama3-70b
  namespace: supercore-ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm-llama3
  template:
    metadata:
      labels:
        app: vllm-llama3
    spec:
      nodeSelector:
        gpu: "true"
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        command:
          - python
          - -m
          - vllm.entrypoints.openai.api_server
          - --model=meta-llama/Llama-3.1-70b-chat
          - --tensor-parallel-size=4
          - --dtype=bfloat16
          - --max-model-len=8192
          - --port=8000
        ports:
        - containerPort: 8000
          name: http
        resources:
          limits:
            nvidia.com/gpu: 4  # 4x A100 GPUs
          requests:
            nvidia.com/gpu: 4
        env:
        - name: HUGGING_FACE_HUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: huggingface-token
              key: token
---
apiVersion: v1
kind: Service
metadata:
  name: vllm-cluster
  namespace: supercore-ai
spec:
  selector:
    app: vllm-llama3
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

**Performance vLLM**:

```python
# vLLM performance monitoring
from vllm import LLM, SamplingParams

# Setup vLLM engine
llm = LLM(
    model="meta-llama/Llama-3.1-70b-chat",
    tensor_parallel_size=4,
    dtype="bfloat16",
    max_model_len=8192
)

# Batching automático para maior throughput
prompts = [
    "Generate agent for data validation",
    "Create workflow for approval process",
    "Design object definition for customer"
]

sampling_params = SamplingParams(temperature=0.7, max_tokens=2048)

# Process batch (muito mais eficiente)
outputs = llm.generate(prompts, sampling_params)

# Throughput: ~1000 tokens/sec com 4x A100
```

### 5.5.6 Integração com LangChain/CrewAI

**LangChain com múltiplos providers**:

```python
from langchain_community.llms import Ollama, VLLMOpenAI
from langchain_anthropic import ChatAnthropic

def get_llm():
    """Get LLM based on environment"""

    provider = os.getenv("LLM_PROVIDER", "ollama")

    if provider == "ollama":
        return Ollama(
            base_url="http://localhost:11434",
            model="llama3.1:70b",
            temperature=0.7
        )

    elif provider == "vllm":
        return VLLMOpenAI(
            openai_api_base="http://vllm-cluster:8000/v1",
            model_name="meta-llama/Llama-3.1-70b-chat",
            temperature=0.7
        )

    elif provider == "claude":
        return ChatAnthropic(
            model="claude-opus-4-5-20251101",
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
        )

# Use in CrewAI
from crewai import Agent

agent = Agent(
    role="Code Generator",
    goal="Generate high-quality code",
    llm=get_llm()  # Automatic provider selection
)
```

### 5.5.7 Cost Comparison

**Custo estimado por 1M tokens**:

| Provider | Modelo | Input | Output | Total |
|----------|--------|-------|--------|-------|
| **Ollama** | Llama 3.1 70B | $0 (self-hosted) | $0 | $0 |
| **vLLM** | Llama 3.1 70B | ~$50 (GPU/month) | ~$50 | ~$100/month |
| **Claude API** | Opus 4.5 | $15 | $75 | $90/1M tokens |
| **OpenAI** | GPT-4 Turbo | $10 | $30 | $40/1M tokens |

**Recomendação**:
- **Development**: Ollama (zero custo)
- **Production**: vLLM (controle total, custo previsível)
- **Fallback/Peak**: Claude API (pay-per-use, qualidade máxima)

---

## 6. STACK COMPLETA (TABELAS)

### 6.1 Stack v1 vs v2.0 (Comparativo)

| Componente | v1.0 | v2.0 | Mudança |
|------------|------|------|---------|
| **Message Broker** | Kafka | Apache Pulsar 3.4 | Substituído |
| **Agent Orchestration** | N/A | CrewAI + LangGraph | Novo |
| **Workflow Builder** | N/A | LangFlow | Novo |
| **LLM Inference** | OpenAI API | vLLM + Ollama + OpenAI + Claude | Expandido |
| **Policy Engine** | N/A | OPA Rego | Novo |
| **Frontend Framework** | Next.js 13 Pages | Next.js 14 App Router | Upgrade |
| **UI Components** | Custom | shadcn/ui | Novo |
| **Icons** | Font Awesome | Lucide Icons | Novo |
| **i18n** | Basic | i18next ecosystem | Expandido |
| **Code Generation** | N/A | Templates + AST | Novo |
| **Deployment** | Manual | Kubernetes + Helm + ArgoCD | Novo |
| **Super Portal** | N/A | Full UI para gerenciamento | Novo |

### 6.2 Stack por Categoria

#### Linguagens de Programação

| Linguagem | Versão Mínima | Uso Principal |
|-----------|---------------|---------------|
| Go | 1.22+ | Performance crítica, Interaction Broker, API Gateway |
| Python | 3.12+ | IA/ML, RAG, Code Generation, Agents |
| TypeScript | 5.3+ | Frontend (Next.js, React), Type-safety |
| Rust | 1.75+ | Futuro (componentes ultra-performáticos) |

#### Frameworks Backend

| Framework | Versão | Linguagem | Uso |
|-----------|--------|-----------|-----|
| FastAPI | 0.109.0+ | Python | APIs REST, Async processing |
| Gin | 1.10.0+ | Go | APIs de alta performance |
| LangChain | 0.1.0+ | Python | LLM orchestration, RAG |
| CrewAI | 0.11.0+ | Python | Multi-agent collaboration |
| LangGraph | 0.1.0+ | Python | Workflow state management |

#### Frameworks Frontend

| Framework | Versão | Uso |
|-----------|--------|-----|
| Next.js | 14.1.0+ | SSR, SSG, App Router |
| React | 18.2.0+ | UI components |
| shadcn/ui | 0.8.0+ | Modern accessible components |
| TailwindCSS | 3.4.0+ | Utility-first CSS |
| React Flow | 11.10.0+ | Workflow visualization |
| Recharts | 2.10.0+ | Charts and graphs |

#### Bancos de Dados

| Database | Versão | Tipo | Uso |
|----------|--------|------|-----|
| PostgreSQL | 16+ | Relational | Dados estruturados, JSONB, pgvector |
| NebulaGraph | 3.8+ | Graph | Conhecimento semântico, relacionamentos |
| Redis | 7+ | Cache | Session, rate limiting, cache |
| MinIO | 2024+ | Object Store | Documentos, imagens, backups |

#### Messaging e Event Streaming

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Apache Pulsar | 3.4.0+ | Message broker, multi-tenancy |
| WebSocket | - | Real-time bidirectional |
| SSE | - | Real-time unidirectional |
| MCP | 2024-11-05 | Model Context Protocol |

#### IA/ML

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **LLMs** | | |
| OpenAI GPT-4 Turbo | API 1.0+ | Code generation, análise |
| Claude Opus 4.5 | API 0.18+ | Arquitetura, contexto massivo |
| vLLM | 0.2.0+ | Inference local (produção) |
| Ollama | 0.1.0+ | Inference local (dev) |
| **Frameworks** | | |
| LangChain | 0.1.0+ | LLM orchestration |
| LangGraph | 0.1.0+ | State management |
| LangFlow | 1.0.0+ | Visual workflow builder |
| CrewAI | 0.11.0+ | Multi-agent orchestration |
| **Embeddings** | | |
| Sentence Transformers | 2.2.0+ | Multilingual embeddings |
| OpenAI Embeddings | API 1.0+ | High-quality embeddings |
| **Vector Search** | | |
| pgvector | 0.5.1+ | PostgreSQL extension |
| FAISS | 1.7.4+ | In-memory (dev) |
| Elasticsearch | 8+ | Keyword + vector hybrid |
| **Code Generation** | | |
| Jinja2 | 3.1.0+ | Template engine |
| Black | 24.0.0+ | Python code formatting |
| AST | Python 3.12 | AST manipulation |

#### Infraestrutura

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Docker | 24.0.0+ | Containerização |
| Kubernetes | 1.28+ | Container orchestration |
| Helm | 3.12.0+ | Package management |
| ArgoCD | 2.9.0+ | GitOps deployment |
| Istio/Linkerd | 1.20+/2.14+ | Service mesh (opcional) |

#### Observabilidade

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Prometheus | 2.45.0+ | Métricas |
| Grafana | 10.0.0+ | Dashboards |
| Jaeger | 1.50.0+ | Distributed tracing |
| Loki | 2.9.0+ | Log aggregation |
| OpenTelemetry | 1.20.0+ | Observability SDK |

#### CI/CD

| Tecnologia | Uso |
|------------|-----|
| GitHub Actions | CI/CD pipelines |
| ArgoCD | GitOps deployment |
| Docker Registry | Container images |

#### Segurança e Compliance

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| OPA | 0.60.0+ | Policy engine (Rego) |
| Vault | 1.15.0+ | Secrets management (opcional) |
| OAuth 2.0 / OIDC | - | Authentication |
| JWT | - | API authentication |
| TLS 1.3 | - | Encryption in transit |
| AES-256 | - | Encryption at rest |

#### Ferramentas de Desenvolvimento

| Categoria | Tecnologia |
|-----------|------------|
| **Linters** | golangci-lint, ruff (Python), ESLint (TypeScript) |
| **Formatters** | gofmt, Black, Prettier |
| **Testing** | Go test, pytest, Vitest |
| **Mocking** | testify/mock, pytest-mock, vitest mock |
| **IDEs** | VS Code, GoLand, PyCharm |

### 6.3 Stack por Fase (Roadmap)

| Fase | Stack Adicionada |
|------|------------------|
| **Fase 0 (Atual)** | PostgreSQL, NebulaGraph, Redis, MinIO, Go, Python, TypeScript, Next.js 14, shadcn/ui, i18next |
| **Fase 1 (Q1 2026)** | Apache Pulsar, CrewAI, LangGraph, LangFlow, vLLM, OPA, Kubernetes, Helm, ArgoCD |
| **Fase 2 (Q2 2026)** | Service Mesh (Istio/Linkerd), Advanced monitoring (Prometheus, Grafana, Jaeger) |
| **Fase 3 (Q3 2026)** | Multi-region deployment, Advanced auto-scaling |
| **Fase 4 (Q4 2026)** | Edge computing, Advanced analytics |

---

## 7. DECISÕES TECNOLÓGICAS (ADRs)

### ADR-001: PostgreSQL como Database Primário

**Status**: Aceito

**Contexto**:
Precisamos de database relacional com:
- JSONB (schemaless flexível)
- Suporte a extensions (pgvector)
- Multi-tenancy (RLS)
- Performance escalável
- Open source

**Decisão**: PostgreSQL 16+

**Alternativas Consideradas**:
- MySQL: Sem JSONB robusto, sem pgvector
- MongoDB: NoSQL puro (perde SQL quando necessário)
- AWS RDS: Vendor lock-in

**Consequências**:
- Flexibilidade JSONB + SQL
- pgvector integrado (sem DB separado)
- RLS nativo (multi-tenancy seguro)
- Comunidade ativa
- Open source (sem lock-in)

---

### ADR-002: Apache Pulsar como Message Broker

**Status**: Aceito

**Contexto**:
Precisamos de message broker com:
- Multi-tenancy nativo (1 tenant = 1 Oracle)
- Schema Registry built-in
- Geo-replication
- Escalabilidade horizontal
- Open source

**Decisão**: Apache Pulsar 3.4.0+

**Alternativas Consideradas**:
- Kafka: Multi-tenancy via workarounds, sem schema registry nativo
- RabbitMQ: Não é distribuído nativamente, performance menor
- AWS Kinesis: Vendor lock-in, custo alto

**Consequências**:
- Multi-tenancy nativo (isolamento perfeito)
- Schema Registry com Pydantic (type-safe)
- Geo-replication para DR
- Storage separado de compute (escalabilidade)
- Pulsar Functions para processamento in-broker

---

### ADR-003: RAG 3D (PostgreSQL + NebulaGraph + pgvector)

**Status**: Aceito

**Contexto**:
RAG tradicional usa apenas vector search. Queremos busca híbrida:
- **SQL**: Queries estruturadas
- **Graph**: Navegação de relacionamentos
- **Vector**: Busca semântica

**Decisão**: RAG 3D (SQL + Graph + Vector)

**Alternativas Consideradas**:
- Vector-only: Perde contexto relacional
- SQL-only: Perde semântica
- Graph-only: Perde dados estruturados

**Consequências**:
- Busca mais completa (3 modalidades)
- Maior qualidade de respostas
- Rastreabilidade de fontes
- Complexidade maior (3 DBs)

---

### ADR-004: CrewAI para Orquestração Multi-Agente

**Status**: Aceito

**Contexto**:
Precisamos de framework para multi-agent collaboration:
- Agentes especializados colaboram
- Delegation de tasks
- Hierarquia de agentes

**Decisão**: CrewAI 0.11.0+

**Alternativas Consideradas**:
- AutoGPT: Muito genérico, sem collaboration patterns
- LangChain Agents: Básico, sem hierarchy
- Custom implementation: Muito complexo

**Consequências**:
- Collaboration patterns prontos
- Hierarchical e Sequential process
- Task delegation automática
- Integração com LangChain

---

### ADR-005: vLLM para Inferência em Produção

**Status**: Aceito

**Contexto**:
Custos de API OpenAI/Claude são altos em produção. Precisamos de:
- Inference local (custo zero após setup)
- Performance alta (GPU acceleration)
- Open-source models (Llama, Mistral, Qwen)

**Decisão**: vLLM para produção, Ollama para dev

**Alternativas Consideradas**:
- OpenAI API only: Custo alto em escala
- Ollama produção: Performance menor que vLLM
- HuggingFace Transformers: Mais lento que vLLM

**Consequências**:
- Custo zero após GPU setup
- Performance alta (PagedAttention)
- Controle total sobre modelos
- Necessita GPU (A100/H100)

---

### ADR-006: Go vs Node.js/Python para Serviços Backend

**Status**: Aceito

**Contexto**:
Múltiplas linguagens no backend. Quando usar qual?

**Decisão**:
- **Go**: Performance crítica (Interaction Broker, API Gateway, Instance Manager)
- **Python**: IA/ML (RAG, Agents, Code Generation)
- **TypeScript/Node.js**: BFF (Backend for Frontend)

**Alternativas Consideradas**:
- Python para tudo: Performance menor em I/O intensivo
- Go para tudo: Ecossistema IA/ML menor
- Rust: Learning curve alto, ecossistema menor

**Consequências**:
- Melhor ferramenta para cada trabalho
- Go: Performance de microsserviços
- Python: Ecossistema IA/ML completo
- Node.js: Código compartilhado com frontend

---

### ADR-007: shadcn/ui vs Material-UI

**Status**: Aceito

**Contexto**:
Precisamos de UI components para Super Portal:
- Modernos e acessíveis
- Customizáveis
- Type-safe
- Compatíveis com i18n

**Decisão**: shadcn/ui

**Alternativas Consideradas**:
- Material-UI: Mais opinado, menos customizável, bundle maior
- Chakra UI: Menos componentes, performance menor
- Ant Design: Design chinês (não universal)

**Consequências**:
- Copy-paste (controle total sobre código)
- Customização via TailwindCSS
- Acessibilidade WCAG 2.1 AA
- Bundle size menor
- Type-safe nativo
- Compatibilidade total com i18n

---

## 8. INTEGRAÇÕES E PROTOCOLOS

### 8.1 APIs Externas

#### APIs de Terceiros Integradas

**Padrão**: Conectores configuráveis por Oráculo (agnóstico de domínio)

| API Type | Provider Examples | Protocol | Auth |
|----------|------------------|----------|------|
| **Regulatory** | Government APIs, Regulatory bodies | REST, SOAP | mTLS, API Key |
| **CRM** | Salesforce, HubSpot, RD Station | REST | OAuth 2.0 |
| **ERP** | SAP, Oracle ERP, NetSuite | REST, SOAP | OAuth 2.0, API Key |
| **Healthcare** | HL7 FHIR servers, Hospital systems | REST | OAuth 2.0, mTLS |
| **Payment** | Stripe, PayPal, local gateways | REST | API Key, OAuth |
| **Identity** | Auth0, Okta, Keycloak | OIDC | OAuth 2.0 |
| **Analytics** | Google Analytics, Mixpanel | REST | API Key |
| **Communication** | Twilio, SendGrid, Slack | REST | API Key |

**Padrão de Integração**:
```python
# integration_connector.py
from pydantic import BaseModel
import httpx

class IntegrationConfig(BaseModel):
    """Configuração genérica de integração"""
    name: str
    type: str  # REST, SOAP, GraphQL, gRPC
    base_url: str
    auth_type: str  # OAuth, API_Key, mTLS, Basic
    credentials: dict
    retry_config: dict

class IntegrationConnector:
    """Conector genérico para APIs externas"""

    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.base_url,
            timeout=30.0
        )

    async def call_api(self, endpoint: str, method: str, data: dict = None):
        """Call external API with retry logic"""
        headers = self._build_auth_headers()

        for attempt in range(self.config.retry_config["max_retries"]):
            try:
                response = await self.client.request(
                    method=method,
                    url=endpoint,
                    json=data,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                if attempt == self.config.retry_config["max_retries"] - 1:
                    raise
                await asyncio.sleep(self.config.retry_config["backoff"] * (2 ** attempt))

    def _build_auth_headers(self) -> dict:
        """Build authentication headers based on auth_type"""
        if self.config.auth_type == "API_Key":
            return {"Authorization": f"Bearer {self.config.credentials['api_key']}"}
        elif self.config.auth_type == "OAuth":
            # OAuth flow
            pass
        # etc
```

#### Protocolos de Comunicação

##### REST (HTTP/1.1 e HTTP/2)

**Uso**: APIs primárias (Portal, Oráculos gerados)

**Padrão**:
- **Versionamento**: URL path (`/api/v1/`)
- **Content-Type**: `application/json`
- **Status Codes**: Semantic (200, 201, 400, 404, 500)
- **Pagination**: Cursor-based
- **Filtering**: Query params
- **Rate Limiting**: Header `X-RateLimit-*`

**Exemplo**:
```
GET /api/v1/oracles?limit=20&cursor=abc123
Authorization: Bearer <JWT>
Accept: application/json

Response:
{
  "data": [...],
  "pagination": {
    "next_cursor": "def456",
    "has_more": true
  }
}
```

##### GraphQL (Opcional)

**Uso**: Queries complexas com múltiplos relacionamentos

**Vantagens**:
- Cliente escolhe campos
- Single request para múltiplos recursos
- Type-safe schema

**Quando Usar**: Opcional, se necessário para frontend complexo

##### gRPC (Inter-Service)

**Uso**: Comunicação inter-serviços (baixa latência)

**Vantagens**:
- Protocol Buffers (binário, compacto)
- HTTP/2 (multiplexing)
- Streaming (bidirectional)

**Exemplo**:
```protobuf
// validation.proto
syntax = "proto3";

service ValidationService {
  rpc Validate(ValidationRequest) returns (ValidationResponse);
}

message ValidationRequest {
  string oracle_id = 1;
  string object_definition_id = 2;
  bytes data = 3;
}

message ValidationResponse {
  bool is_valid = 1;
  repeated string errors = 2;
}
```

#### Authentication

##### OAuth 2.0

**Flows Suportados**:
- **Authorization Code**: Web apps (Portal)
- **Client Credentials**: Service-to-service
- **PKCE**: Mobile/SPA

**Providers**: Auth0, Keycloak, Okta, custom

**Exemplo (Authorization Code)**:
```
1. User → Portal → Auth Provider (login)
2. Auth Provider → Portal (authorization code)
3. Portal → Auth Provider (code + client_secret → access token + refresh token)
4. Portal → Backend API (Authorization: Bearer <access_token>)
```

##### JWT (JSON Web Tokens)

**Uso**: API authentication (stateless)

**Estrutura**:
```
Header.Payload.Signature

Header:
{
  "alg": "RS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-123",
  "oracle_id": "oracle-456",
  "roles": ["admin"],
  "exp": 1735689600
}

Signature: RS256(header + payload, private_key)
```

**Validação**:
```go
// Go
import "github.com/golang-jwt/jwt/v5"

func ValidateJWT(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return publicKey, nil
    })

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    } else {
        return nil, err
    }
}
```

---

### 8.2 Protocolos de Comunicação Detalhados

#### HTTP/HTTPS

**Versões**: HTTP/1.1, HTTP/2, HTTP/3 (futuro)

**TLS**: 1.3 obrigatório em produção

**Headers Comuns**:
- `Authorization`: Bearer token
- `Content-Type`: application/json
- `X-Oracle-ID`: Multi-tenancy
- `X-Request-ID`: Tracing
- `X-RateLimit-*`: Rate limiting info

#### WebSockets

**Uso**: Real-time bidirectional (Portal UI ↔ Backend)

**Protocol**: ws:// (dev), wss:// (prod)

**Messages**:
```json
{
  "type": "agent_status_update",
  "oracle_id": "oracle-123",
  "agent_id": "agent-456",
  "status": "running",
  "progress": 0.65
}
```

**Client**:
```typescript
const ws = new WebSocket('wss://api.supercore.com/ws?oracle_id=oracle-123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleUpdate(data);
};
```

**Server**:
```go
// Go WebSocket server
conn, _ := upgrader.Upgrade(w, r, nil)
defer conn.Close()

for {
    var msg Message
    err := conn.ReadJSON(&msg)
    if err != nil {
        break
    }
    // Handle message
}
```

#### gRPC

**Uso**: Inter-service communication (baixa latência)

**Features**:
- **Unary RPC**: Request → Response
- **Server Streaming**: Request → Stream<Response>
- **Client Streaming**: Stream<Request> → Response
- **Bidirectional Streaming**: Stream<Request> ↔ Stream<Response>

**Exemplo**:
```protobuf
service AgentService {
  // Unary
  rpc ExecuteAgent(AgentRequest) returns (AgentResponse);

  // Server streaming
  rpc StreamAgentStatus(AgentRequest) returns (stream StatusUpdate);

  // Bidirectional streaming
  rpc InteractiveAgent(stream UserInput) returns (stream AgentOutput);
}
```

#### Server-Sent Events (SSE)

**Uso**: Server → Client streaming (one-way)

**Format**:
```
data: {"type": "update", "message": "Processing..."}\n\n
data: {"type": "complete", "result": {...}}\n\n
```

**Client**:
```typescript
const eventSource = new EventSource('/events/oracle-123');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

**Server**:
```python
@app.get("/events/{oracle_id}")
async def stream_events(oracle_id: str):
    async def event_generator():
        while True:
            data = await get_next_update(oracle_id)
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

#### MCP Protocol (Model Context Protocol)

**Versão**: 2024-11-05

**Transports**:
- **stdio**: Claude Desktop (local)
- **HTTP+SSE**: Claude.ai, browsers (remote)

**Message Types**:
- **Resources**: Read-only data
- **Tools**: Executable operations
- **Prompts**: Reusable prompt templates

**Exemplo (HTTP+SSE)**:
```
Client → Server (HTTP POST): {"method": "tools/call", "params": {...}}
Server → Client (SSE): data: {"result": {...}}\n\n
```

---

### 8.3 Formatos de Dados

#### JSON

**Uso**: Padrão para APIs REST, configuração

**Convenções**:
- snake_case para keys
- ISO 8601 para datas
- UUID para IDs

**Exemplo**:
```json
{
  "oracle_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Generic Oracle",
  "created_at": "2025-12-21T10:30:00Z",
  "config": {
    "domain": "crm",
    "languages": ["en", "pt", "es"]
  }
}
```

#### Protocol Buffers

**Uso**: gRPC, mensagens binárias eficientes

**Vantagens**:
- Binário (compacto)
- Type-safe schema
- Backward/forward compatibility

**Exemplo**:
```protobuf
message Oracle {
  string oracle_id = 1;
  string name = 2;
  string domain = 3;
  repeated string languages = 4;
  google.protobuf.Timestamp created_at = 5;
}
```

#### YAML

**Uso**: Configuração (Kubernetes, ArgoCD, Helm)

**Exemplo**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oracle-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: oracle-backend
```

#### Avro (Pulsar Schema Registry)

**Uso**: Mensagens Pulsar (type-safe)

**Vantagens**:
- Schema evolution
- Backward/forward compatibility
- Integration com Pydantic

**Exemplo**:
```python
from pydantic import BaseModel
from pulsar.schema import AvroSchema

class AgentRequest(BaseModel):
    request_id: str
    oracle_id: str
    agent_id: str
    input_data: dict

schema = AvroSchema(AgentRequest)

producer = client.create_producer(
    topic="agent_requests",
    schema=schema
)

producer.send(AgentRequest(
    request_id="req-123",
    oracle_id="oracle-456",
    agent_id="agent-789",
    input_data={...}
))
```

**Avro Schema (auto-generated)**:
```json
{
  "type": "record",
  "name": "AgentRequest",
  "fields": [
    {"name": "request_id", "type": "string"},
    {"name": "oracle_id", "type": "string"},
    {"name": "agent_id", "type": "string"},
    {"name": "input_data", "type": {"type": "map", "values": "string"}}
  ]
}
```

---

## 9. SEGURANÇA E COMPLIANCE

### 9.1 Tecnologias de Segurança

#### Autenticação

##### OAuth 2.0 / OpenID Connect

**Papel**: Autenticação de usuários (Super Portal)

**Providers**: Auth0, Keycloak, Okta, Cognito

**Flows**:
- **Authorization Code + PKCE**: Web/Mobile apps
- **Client Credentials**: Service-to-service

**Configuração**:
```yaml
# Auth0 example
auth:
  provider: auth0
  domain: supercore.auth0.com
  client_id: ${AUTH0_CLIENT_ID}
  client_secret: ${AUTH0_CLIENT_SECRET}
  audience: https://api.supercore.com
  scopes: [openid, profile, email, oracle:manage]
```

##### JWT (API Authentication)

**Papel**: Stateless API authentication

**Claims**:
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "oracle_id": "oracle-456",
  "roles": ["admin", "oracle_manager"],
  "permissions": ["oracle:create", "oracle:delete", "agent:execute"],
  "iat": 1735689600,
  "exp": 1735693200
}
```

**Validação (Go)**:
```go
import "github.com/golang-jwt/jwt/v5"

type Claims struct {
    Sub         string   `json:"sub"`
    Email       string   `json:"email"`
    OracleID    string   `json:"oracle_id"`
    Roles       []string `json:"roles"`
    Permissions []string `json:"permissions"`
    jwt.RegisteredClaims
}

func ValidateJWT(tokenString string, publicKey *rsa.PublicKey) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, fmt.Errorf("unexpected signing method")
        }
        return publicKey, nil
    })

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    return nil, err
}
```

#### Autorização

##### OPA (Open Policy Agent) - Rego

**Papel**: Policy engine para autorização granular (ABAC - Attribute-Based Access Control)

**Versão**: 0.60.0+

**Linguagem**: Rego (declarativa)

**Casos de Uso**:
1. Autorização de APIs (quem pode acessar o quê)
2. Validações de negócio complexas
3. Compliance automático (agnóstico de domínio)

**Exemplo: Generic Authorization Policy**:
```rego
# policies/authorization.rego
package supercore.authz

import future.keywords.if
import future.keywords.in

# Default deny
default allow := false

# Regra 1: Admin pode tudo
allow if {
    "admin" in input.user.roles
}

# Regra 2: Oracle Manager pode gerenciar Oráculos
allow if {
    "oracle_manager" in input.user.roles
    input.action in ["oracle:create", "oracle:update", "oracle:delete"]
}

# Regra 3: User só pode acessar seus Oráculos
allow if {
    input.user.oracle_id == input.resource.oracle_id
    input.action in ["oracle:read", "object:create", "agent:execute"]
}

# Regra 4: Validação de limites (exemplo: máximo de Oráculos por user)
deny["Maximum oracles limit reached"] if {
    input.action == "oracle:create"
    count(input.user.oracles) >= input.limits.max_oracles_per_user
}

# Regra 5: Validação de permissões granulares
allow if {
    permission := concat(":", [input.resource.type, input.action])
    permission in input.user.permissions
}
```

**Integração (Python)**:
```python
from opa_client import OPAClient

opa = OPAClient(host="http://opa.internal:8181")

def check_authorization(user: dict, action: str, resource: dict) -> bool:
    """Check if user is authorized to perform action on resource"""

    result = opa.check_policy_rule(
        input_data={
            "user": user,
            "action": action,
            "resource": resource,
            "limits": {"max_oracles_per_user": 10}
        },
        package_path="supercore.authz",
        rule_name="allow"
    )

    return result
```

**Integração (Go)**:
```go
import "github.com/open-policy-agent/opa/rego"

func CheckAuthorization(user User, action string, resource Resource) (bool, error) {
    query := rego.New(
        rego.Query("data.supercore.authz.allow"),
        rego.Load([]string{"policies/authorization.rego"}, nil),
    )

    ctx := context.Background()
    results, err := query.Eval(ctx, rego.EvalInput(map[string]interface{}{
        "user":     user,
        "action":   action,
        "resource": resource,
    }))

    if err != nil {
        return false, err
    }

    return results[0].Expressions[0].Value.(bool), nil
}
```

##### RBAC (Role-Based Access Control)

**Papel**: Controle de acesso baseado em roles

**Roles**:
- **Super Admin**: Full access (create oracles, manage users, system config)
- **Oracle Manager**: Manage oracles (create, update, delete, deploy)
- **Oracle Developer**: Develop within oracle (create objects, agents, workflows)
- **Oracle Viewer**: Read-only access
- **Auditor**: Read-only + audit logs

**Permissions**:
```yaml
# permissions.yaml
roles:
  super_admin:
    - "*"  # All permissions

  oracle_manager:
    - oracle:create
    - oracle:read
    - oracle:update
    - oracle:delete
    - oracle:deploy
    - user:invite

  oracle_developer:
    - oracle:read
    - object:create
    - object:update
    - object:delete
    - agent:create
    - agent:execute
    - workflow:create
    - workflow:execute

  oracle_viewer:
    - oracle:read
    - object:read
    - agent:read
    - workflow:read

  auditor:
    - oracle:read
    - audit:read
```

**Implementação (PostgreSQL)**:
```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    permissions TEXT[]
);

-- User Roles (many-to-many)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    oracle_id UUID REFERENCES oracles(id),  -- Role scoped to oracle
    PRIMARY KEY (user_id, role_id, oracle_id)
);

-- Check permission
CREATE FUNCTION has_permission(
    p_user_id UUID,
    p_oracle_id UUID,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND ur.oracle_id = p_oracle_id
        AND p_permission = ANY(r.permissions)
    );
END;
$$ LANGUAGE plpgsql;
```

#### Criptografia

##### TLS 1.3

**Uso**: Criptografia em trânsito (HTTPS, gRPC, WebSocket)

**Configuração (Nginx)**:
```nginx
server {
    listen 443 ssl http2;
    server_name api.supercore.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://backend:8000;
    }
}
```

##### AES-256 (Data at Rest)

**Uso**: Criptografia de dados sensíveis (PII, credentials)

**PostgreSQL**:
```sql
-- Encrypt column
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted storage
CREATE TABLE user_credentials (
    id UUID PRIMARY KEY,
    user_id UUID,
    api_key BYTEA,  -- Encrypted with AES-256
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert encrypted
INSERT INTO user_credentials (id, user_id, api_key)
VALUES (
    gen_random_uuid(),
    'user-123',
    pgp_sym_encrypt('secret-api-key', 'encryption-key')
);

-- Decrypt
SELECT pgp_sym_decrypt(api_key, 'encryption-key') AS decrypted_key
FROM user_credentials
WHERE user_id = 'user-123';
```

**Application-level (Python)**:
```python
from cryptography.fernet import Fernet

# Generate key (store securely in Vault)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt
encrypted_data = cipher.encrypt(b"sensitive data")

# Decrypt
decrypted_data = cipher.decrypt(encrypted_data)
```

##### Hashing (Senhas)

**Algoritmos**: bcrypt, argon2 (preferencial)

**Nunca usar**: MD5, SHA-1, SHA-256 sem salt

**Exemplo (Python)**:
```python
import argon2

# Hash password
ph = argon2.PasswordHasher()
hashed = ph.hash("user_password")

# Verify
try:
    ph.verify(hashed, "user_password")
    print("Password correct")
except argon2.exceptions.VerifyMismatchError:
    print("Password incorrect")
```

#### Secrets Management

##### Vault (Opcional)

**Papel**: Centralizar secrets (API keys, DB passwords, certificates)

**Versão**: 1.15.0+

**Uso**:
- Database credentials
- API keys (OpenAI, Claude, external APIs)
- TLS certificates
- Encryption keys

**Exemplo**:
```bash
# Write secret
vault kv put secret/supercore/database \
    username=postgres \
    password=super-secret

# Read secret
vault kv get secret/supercore/database
```

**Integration (Go)**:
```go
import "github.com/hashicorp/vault/api"

client, _ := api.NewClient(&api.Config{
    Address: "https://vault.internal:8200",
})

client.SetToken(os.Getenv("VAULT_TOKEN"))

secret, _ := client.Logical().Read("secret/data/supercore/database")
password := secret.Data["data"].(map[string]interface{})["password"].(string)
```

---

### 9.2 Compliance

#### LGPD (Lei Geral de Proteção de Dados)

**Princípios**:
1. **Consentimento**: User opt-in para coleta de dados
2. **Finalidade**: Uso transparente de dados
3. **Minimização**: Coletar apenas o necessário
4. **Portabilidade**: User pode exportar seus dados
5. **Direito ao Esquecimento**: User pode deletar seus dados

**Implementação**:

**Consent Management**:
```sql
CREATE TABLE user_consents (
    id UUID PRIMARY KEY,
    user_id UUID,
    purpose VARCHAR(100),  -- e.g., "analytics", "marketing"
    consented BOOLEAN,
    consented_at TIMESTAMP,
    ip_address INET
);
```

**Data Portability**:
```python
@app.get("/api/v1/users/{user_id}/export")
async def export_user_data(user_id: UUID):
    """Export all user data (LGPD compliance)"""
    data = {
        "user": await db.get_user(user_id),
        "oracles": await db.get_user_oracles(user_id),
        "activity": await db.get_user_activity(user_id),
    }
    return JSONResponse(content=data)
```

**Right to be Forgotten**:
```python
@app.delete("/api/v1/users/{user_id}")
async def delete_user(user_id: UUID):
    """Delete all user data (LGPD compliance)"""
    # 1. Anonymize historical data
    await db.anonymize_user_activity(user_id)

    # 2. Delete user data
    await db.delete_user_oracles(user_id)
    await db.delete_user(user_id)

    # 3. Audit log
    await db.log_deletion(user_id, timestamp=datetime.utcnow())

    return {"status": "deleted"}
```

#### Domain-Specific Compliance (Agnóstico)

**Padrão**: Compliance é configurável por Oráculo

**Exemplos**:
- **Banking**: Regulações do Banco Central (ex: Brasil, México, etc)
- **Healthcare**: HIPAA (US), LGPD (Brasil)
- **Finance**: SOX, PCI-DSS
- **E-commerce**: PCI-DSS, LGPD

**Implementação**:
```sql
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY,
    oracle_id UUID,
    regulation_name VARCHAR(255),  -- "BACEN Circular 3.680", "HIPAA", "SOX"
    requirement_text TEXT,
    validation_rule_id UUID REFERENCES validation_rules(id)
);
```

**OPA Policy (generic compliance check)**:
```rego
# policies/compliance.rego
package supercore.compliance

# Validação genérica de campos obrigatórios por regulação
deny_creation[msg] if {
    required_fields := data.compliance[input.oracle_id][input.regulation].required_fields
    field := required_fields[_]
    not input.data[field]
    msg := sprintf("Field '%s' is required by %s", [field, input.regulation])
}
```

#### Audit Trails

**Papel**: Rastreabilidade completa de ações (quem, quando, o quê, por quê)

**Implementação**:
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id UUID,
    oracle_id UUID,
    action VARCHAR(100),  -- "oracle:create", "object:update", etc
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,  -- Before/after
    ip_address INET,
    user_agent TEXT,
    request_id UUID  -- Correlation
);

-- Index for queries
CREATE INDEX idx_audit_log_user ON audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_log_oracle ON audit_log(oracle_id, timestamp DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
```

**Logging (Python)**:
```python
async def log_audit(
    user_id: UUID,
    oracle_id: UUID,
    action: str,
    resource_type: str,
    resource_id: UUID,
    changes: dict,
    request: Request
):
    """Log audit trail"""
    await db.execute(
        """
        INSERT INTO audit_log (
            id, user_id, oracle_id, action, resource_type, resource_id,
            changes, ip_address, user_agent, request_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
        uuid.uuid4(),
        user_id,
        oracle_id,
        action,
        resource_type,
        resource_id,
        json.dumps(changes),
        request.client.host,
        request.headers.get("user-agent"),
        request.state.request_id
    )
```

**Retenção**: Logs mantidos por 7 anos (padrão compliance banking, ajustável por domínio)

---

### 9.5 OBSERVABILITY COM OPENTELEMETRY

**Papel**: Observabilidade unificada com telemetria distribuída (traces, metrics, logs)

**Versão Mínima**: OpenTelemetry 1.21.0+

**Filosofia**: "Observability as Code" - instrumentação automática, vendor-agnostic

#### 9.5.1 OpenTelemetry Stack

**Componentes**:

```
Application (Go/Python/TypeScript)
    ↓
OpenTelemetry SDK (instrumentation)
    ↓
OpenTelemetry Collector (aggregation, processing)
    ↓
    ├─ Traces → Jaeger (distributed tracing)
    ├─ Metrics → Prometheus (time-series metrics)
    └─ Logs → Loki (structured logs)
    ↓
Grafana (unified observability dashboard)
```

**Backends**:
- **Jaeger v1.50.0+**: Distributed tracing
- **Prometheus v2.45.0+**: Métricas time-series
- **Loki v2.9.0+**: Structured logging
- **Grafana v10.0.0+**: Dashboards unificados

#### 9.5.2 Distributed Tracing (Traces)

**Papel**: Rastreamento de requisições distribuídas across services

**Exemplo 1: Instrumentação Python (FastAPI)**:

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.asyncpg import AsyncPGInstrumentor

# Setup tracer provider
trace.set_tracer_provider(TracerProvider())

# OTLP exporter (send to OpenTelemetry Collector)
otlp_exporter = OTLPSpanExporter(
    endpoint="http://otel-collector:4317",
    insecure=True
)

trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

# Auto-instrument FastAPI
app = FastAPI()
FastAPIInstrumentor.instrument_app(app)

# Auto-instrument HTTP client
HTTPXClientInstrumentor().instrument()

# Auto-instrument PostgreSQL
AsyncPGInstrumentor().instrument()

# Manual spans for custom logic
tracer = trace.get_tracer(__name__)

@app.post("/oracles")
async def create_oracle(oracle_data: OracleInput):
    with tracer.start_as_current_span("create_oracle") as span:
        # Add attributes
        span.set_attribute("oracle.domain", oracle_data.domain)
        span.set_attribute("oracle.name", oracle_data.name)

        # Business logic
        with tracer.start_as_current_span("validate_oracle"):
            await validate_oracle(oracle_data)

        with tracer.start_as_current_span("persist_oracle"):
            oracle = await db.create_oracle(oracle_data)

        with tracer.start_as_current_span("publish_event"):
            await pulsar_producer.send({
                "event": "oracle_created",
                "oracle_id": oracle.id
            })

        span.set_attribute("oracle.id", str(oracle.id))
        return oracle
```

**Exemplo 2: Instrumentação Go**:

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/attribute"
)

// Setup tracer
func initTracer() (*trace.TracerProvider, error) {
    exporter, err := otlptracegrpc.New(
        context.Background(),
        otlptracegrpc.WithEndpoint("otel-collector:4317"),
        otlptracegrpc.WithInsecure(),
    )
    if err != nil {
        return nil, err
    }

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceName("interaction-broker"),
        )),
    )

    otel.SetTracerProvider(tp)
    return tp, nil
}

// Use tracer
func HandleMCPRequest(ctx context.Context, req MCPRequest) error {
    tracer := otel.Tracer("interaction-broker")

    ctx, span := tracer.Start(ctx, "handle_mcp_request")
    defer span.End()

    span.SetAttributes(
        attribute.String("oracle.id", req.OracleID),
        attribute.String("request.type", req.Type),
    )

    // Validate
    ctx, validateSpan := tracer.Start(ctx, "validate_request")
    if err := validateRequest(ctx, req); err != nil {
        validateSpan.RecordError(err)
        validateSpan.SetStatus(codes.Error, err.Error())
        validateSpan.End()
        return err
    }
    validateSpan.End()

    // Publish to Pulsar
    ctx, publishSpan := tracer.Start(ctx, "publish_to_pulsar")
    err := publishToPulsar(ctx, req)
    publishSpan.End()

    return err
}
```

**Context Propagation** (across services):

```python
# Service A (FastAPI) → Service B (Go)
import httpx
from opentelemetry.propagate import inject

# Service A
headers = {}
inject(headers)  # Inject trace context

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://interaction-broker/mcp",
        json=request_data,
        headers=headers  # Propagate context
    )
```

```go
// Service B (Go)
import "go.opentelemetry.io/otel/propagation"

func HandleHTTP(w http.ResponseWriter, r *http.Request) {
    // Extract trace context from headers
    ctx := otel.GetTextMapPropagator().Extract(
        r.Context(),
        propagation.HeaderCarrier(r.Header),
    )

    // Use context (trace continues)
    processRequest(ctx, r)
}
```

#### 9.5.3 Metrics (Prometheus)

**Papel**: Métricas de performance, throughput, latência

**Exemplo 1: Métricas Python**:

```python
from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

# Setup metrics
metric_exporter = OTLPMetricExporter(
    endpoint="http://otel-collector:4317",
    insecure=True
)

reader = PeriodicExportingMetricReader(metric_exporter, export_interval_millis=60000)
metrics.set_meter_provider(MeterProvider(metric_readers=[reader]))

meter = metrics.get_meter(__name__)

# Counters
oracle_created_counter = meter.create_counter(
    name="oracle.created",
    description="Number of oracles created",
    unit="1"
)

# Histograms (for latency)
agent_execution_duration = meter.create_histogram(
    name="agent.execution.duration",
    description="Agent execution duration",
    unit="ms"
)

# Gauges (for current state)
active_agents = meter.create_up_down_counter(
    name="agents.active",
    description="Number of active agents"
)

# Usage
@app.post("/oracles")
async def create_oracle(oracle_data: OracleInput):
    start_time = time.time()

    oracle = await db.create_oracle(oracle_data)

    # Record metrics
    oracle_created_counter.add(1, {"domain": oracle_data.domain})

    duration = (time.time() - start_time) * 1000
    agent_execution_duration.record(duration, {"oracle_id": str(oracle.id)})

    return oracle
```

**Exemplo 2: Métricas Go**:

```go
import (
    "go.opentelemetry.io/otel/metric"
)

var (
    meter = otel.Meter("interaction-broker")

    // Counters
    mcpRequestsCounter, _ = meter.Int64Counter(
        "mcp.requests.total",
        metric.WithDescription("Total MCP requests"),
    )

    // Histograms
    mcpLatencyHistogram, _ = meter.Float64Histogram(
        "mcp.request.duration",
        metric.WithDescription("MCP request duration"),
        metric.WithUnit("ms"),
    )
)

func HandleMCPRequest(req MCPRequest) {
    start := time.Now()

    // Process request
    processRequest(req)

    // Record metrics
    duration := time.Since(start).Milliseconds()

    mcpRequestsCounter.Add(context.Background(), 1,
        metric.WithAttributes(
            attribute.String("oracle_id", req.OracleID),
            attribute.String("request_type", req.Type),
        ),
    )

    mcpLatencyHistogram.Record(context.Background(), float64(duration),
        metric.WithAttributes(
            attribute.String("oracle_id", req.OracleID),
        ),
    )
}
```

**Prometheus Queries** (PromQL):

```promql
# Request rate (QPS)
rate(mcp_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(mcp_request_duration_bucket[5m]))

# Error rate
rate(mcp_requests_total{status="error"}[5m]) /
rate(mcp_requests_total[5m])

# Agent execution success rate
sum(rate(agent_execution_total{status="success"}[5m])) /
sum(rate(agent_execution_total[5m]))
```

#### 9.5.4 Structured Logging (Logs)

**Papel**: Logs estruturados correlacionados com traces

**Exemplo 1: Logging Python (correlacionado com traces)**:

```python
import logging
from opentelemetry.instrumentation.logging import LoggingInstrumentor

# Auto-inject trace context in logs
LoggingInstrumentor().instrument(set_logging_format=True)

logger = logging.getLogger(__name__)

# Configure structured logging (JSON)
import structlog

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)

log = structlog.get_logger()

# Usage (trace context automatically injected)
@app.post("/oracles")
async def create_oracle(oracle_data: OracleInput):
    log.info(
        "oracle.create.start",
        oracle_name=oracle_data.name,
        domain=oracle_data.domain
    )

    try:
        oracle = await db.create_oracle(oracle_data)
        log.info(
            "oracle.create.success",
            oracle_id=str(oracle.id),
            oracle_name=oracle.name
        )
        return oracle
    except Exception as e:
        log.error(
            "oracle.create.failed",
            oracle_name=oracle_data.name,
            error=str(e),
            exc_info=True
        )
        raise
```

**Log Output** (JSON com trace context):

```json
{
  "event": "oracle.create.success",
  "timestamp": "2025-12-22T10:30:45.123456Z",
  "level": "info",
  "oracle_id": "123e4567-e89b-12d3-a456-426614174000",
  "oracle_name": "Banking Oracle",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "service.name": "supercore-api"
}
```

**Loki Query** (LogQL):

```logql
# Find errors in oracle creation
{service="supercore-api"} |= "oracle.create" | json | level="error"

# Correlate with trace
{service="supercore-api"} | json | trace_id="4bf92f3577b34da6a3ce929d0e0e4736"

# Aggregate error counts
sum(count_over_time({service="supercore-api", level="error"}[5m]))
```

#### 9.5.5 OpenTelemetry Collector Configuration

**Deployment**:

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024

  # Add resource attributes
  resource:
    attributes:
      - key: cluster.name
        value: supercore-prod
        action: insert

  # Tail sampling (keep only interesting traces)
  tail_sampling:
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-requests
        type: latency
        latency: {threshold_ms: 1000}
      - name: random-sampling
        type: probabilistic
        probabilistic: {sampling_percentage: 10}

exporters:
  # Jaeger (traces)
  otlp/jaeger:
    endpoint: jaeger-collector:4317
    tls:
      insecure: true

  # Prometheus (metrics)
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: supercore

  # Loki (logs)
  loki:
    endpoint: http://loki:3100/loki/api/v1/push

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, resource, tail_sampling]
      exporters: [otlp/jaeger]

    metrics:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [prometheus]

    logs:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [loki]
```

#### 9.5.6 Grafana Dashboards

**Dashboard Exemplo: SuperCore Overview**:

```json
{
  "dashboard": {
    "title": "SuperCore Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Active Agents",
        "targets": [
          {
            "expr": "agents_active",
            "legendFormat": "{{oracle_id}}"
          }
        ]
      }
    ]
  }
}
```

**Trace Visualization** (Jaeger):

```
Portal UI (200ms)
  ↓
API Gateway (10ms)
  ↓
Oracle Service (150ms)
  ├─ PostgreSQL Query (30ms)
  ├─ NebulaGraph Query (80ms)
  └─ Pulsar Publish (40ms)
```

#### 9.5.7 Alerting Rules (Prometheus)

```yaml
# prometheus-alerts.yaml
groups:
  - name: supercore
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) /
          rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_bucket[5m])
          ) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High P95 latency on {{ $labels.service }}"
          description: "P95 latency is {{ $value }}ms"

      # Agent execution failures
      - alert: AgentExecutionFailures
        expr: |
          rate(agent_execution_total{status="failed"}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Agent execution failures on {{ $labels.oracle_id }}"
```

**Performance**:
- Trace overhead: < 1% CPU, < 50MB RAM per service
- Metrics overhead: < 0.5% CPU
- Log overhead: < 5% (structured JSON)

---

## 10. FERRAMENTAS DE DESENVOLVIMENTO

### 10.1 IDEs e Editores

**Recomendados**:
- **VS Code**: Universal, extensions ricas (Go, Python, TypeScript)
- **GoLand**: Go development (JetBrains)
- **PyCharm**: Python development (JetBrains)
- **Cursor**: AI-powered IDE (fork do VS Code)

**Extensions VS Code**:
```json
{
  "recommendations": [
    "golang.go",
    "ms-python.python",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "GitHub.copilot",
    "ms-azuretools.vscode-docker",
    "hashicorp.terraform",
    "redhat.vscode-yaml"
  ]
}
```

### 10.2 Linters e Formatters

#### Go

**Linter**: golangci-lint
**Formatter**: gofmt, goimports

**Configuração**:
```yaml
# .golangci.yml
linters:
  enable:
    - gofmt
    - goimports
    - golint
    - govet
    - errcheck
    - staticcheck
    - gosec  # Security
    - revive

linters-settings:
  gofmt:
    simplify: true
  goimports:
    local-prefixes: github.com/lbpay/supercore
```

**Comando**:
```bash
golangci-lint run ./...
```

#### Python

**Linter**: ruff (moderno, rápido) ou flake8
**Formatter**: black, isort

**Configuração**:
```toml
# pyproject.toml
[tool.ruff]
line-length = 100
select = ["E", "F", "W", "I", "N", "UP", "B", "A", "C4", "T20"]
ignore = ["E501"]  # Line too long (black handles this)

[tool.black]
line-length = 100
target-version = ['py312']

[tool.isort]
profile = "black"
line_length = 100
```

**Comandos**:
```bash
# Lint
ruff check .

# Format
black .
isort .
```

#### TypeScript

**Linter**: ESLint
**Formatter**: Prettier

**Configuração**:
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Comandos**:
```bash
# Lint
npm run lint

# Format
npm run format
```

### 10.3 Testing Frameworks

#### Go

**Framework**: testing (built-in), testify (assertions)

**Exemplo**:
```go
// instance_manager_test.go
package manager_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestCreateInstance(t *testing.T) {
    manager := NewInstanceManager()

    instance, err := manager.Create(InstanceData{
        OracleID: "oracle-123",
        ObjectDefinitionID: "obj-def-456",
        Data: map[string]interface{}{"name": "Test"},
    })

    assert.NoError(t, err)
    assert.NotNil(t, instance)
    assert.Equal(t, "Test", instance.Data["name"])
}
```

**Comandos**:
```bash
# Run tests
go test ./...

# With coverage
go test -cover ./...

# With race detector
go test -race ./...
```

#### Python

**Framework**: pytest, pytest-asyncio (async tests)

**Configuração**:
```toml
# pyproject.toml
[tool.pytest.ini_options]
minversion = "7.0"
testpaths = ["tests"]
asyncio_mode = "auto"
```

**Exemplo**:
```python
# test_code_generator.py
import pytest
from code_generator import CodeGenerator

@pytest.fixture
def generator():
    return CodeGenerator(templates_dir="templates")

def test_generate_pydantic_model(generator):
    obj_def = {
        "name": "TestEntity",
        "fields": [
            {"name": "id", "type": "UUID", "required": True},
            {"name": "name", "type": "str", "required": True}
        ]
    }

    code = generator.generate_pydantic_model(obj_def)

    assert "class TestEntity(BaseModel)" in code
    assert "id: UUID" in code
    assert "name: str" in code

@pytest.mark.asyncio
async def test_rag_query():
    engine = RAGEngine(oracle_id="oracle-123")
    result = await engine.query("What are the requirements?")

    assert result["answer"] is not None
    assert len(result["sources"]) > 0
```

**Comandos**:
```bash
# Run tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test
pytest tests/test_code_generator.py::test_generate_pydantic_model
```

#### TypeScript

**Framework**: Vitest (moderno, rápido), Jest (tradicional)

**Configuração**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

**Exemplo**:
```typescript
// DynamicForm.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DynamicForm } from './DynamicForm';

describe('DynamicForm', () => {
  it('renders form with fields from object definition', () => {
    const objectDef = {
      name: 'TestEntity',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'age', type: 'number', required: false },
      ],
    };

    render(<DynamicForm objectDefinition={objectDef} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
  });
});
```

**Comandos**:
```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**E2E Testing**: Playwright

```typescript
// e2e/oracle-management.spec.ts
import { test, expect } from '@playwright/test';

test('create new oracle', async ({ page }) => {
  await page.goto('http://localhost:3000/oracles');
  await page.click('text=New Oracle');

  await page.fill('input[name="name"]', 'Test Oracle');
  await page.selectOption('select[name="domain"]', 'crm');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Test Oracle')).toBeVisible();
});
```

### 10.3.1 Playwright (E2E Testing + Web Scraping)

**Papel**: E2E testing de frontend + Web scraping de sites JavaScript-heavy

**Versão Mínima**: Playwright 1.40.0+

**Casos de Uso**:
1. **E2E Testing**: Testes de interface do Super Portal
2. **Web Scraping**: Scraping de sites com JavaScript (SPAs, React apps)

#### Use Case 1: E2E Testing (Frontend)

**Configuração**:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Testes Avançados**:

```typescript
// e2e/oracle-workflow.spec.ts
import { test, expect } from '@playwright/test';

// Full workflow test
test.describe('Oracle Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete oracle creation workflow', async ({ page }) => {
    // Navigate to oracles
    await page.click('nav >> text=Oracles');
    await expect(page).toHaveURL('/oracles');

    // Create oracle
    await page.click('button:has-text("New Oracle")');
    await page.fill('input[name="name"]', 'E2E Test Oracle');
    await page.selectOption('select[name="domain"]', 'healthcare');
    await page.fill('textarea[name="description"]', 'Created via E2E test');
    await page.click('button[type="submit"]');

    // Verify creation
    await expect(page.locator('text=E2E Test Oracle')).toBeVisible();
    await expect(page.locator('text=Oracle created successfully')).toBeVisible();

    // Create object definition
    await page.click('text=E2E Test Oracle');
    await page.click('tab:has-text("Objects")');
    await page.click('button:has-text("New Object")');

    await page.fill('input[name="object_name"]', 'Patient');
    await page.click('button:has-text("Add Field")');
    await page.fill('input[name="fields[0].name"]', 'patient_id');
    await page.selectOption('select[name="fields[0].type"]', 'string');
    await page.click('button[type="submit"]');

    // Verify object created
    await expect(page.locator('text=Patient')).toBeVisible();
  });

  test('dynamic form validation', async ({ page }) => {
    await page.goto('/oracles/new');

    // Submit without filling (should show errors)
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name is required')).toBeVisible();

    // Fill form correctly
    await page.fill('input[name="name"]', 'Valid Oracle');
    await page.selectOption('select[name="domain"]', 'banking');
    await page.click('button[type="submit"]');

    // Should succeed
    await expect(page.locator('text=Oracle created successfully')).toBeVisible();
  });
});

// Visual regression testing
test('visual regression - oracle list page', async ({ page }) => {
  await page.goto('/oracles');
  await expect(page).toHaveScreenshot('oracle-list.png');
});

// Accessibility testing
test('accessibility - oracle form', async ({ page }) => {
  await page.goto('/oracles/new');

  // Check ARIA labels
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toHaveAttribute('aria-label', 'Oracle Name');

  // Check keyboard navigation
  await nameInput.focus();
  await page.keyboard.press('Tab');
  const domainSelect = page.locator('select[name="domain"]');
  await expect(domainSelect).toBeFocused();
});
```

**API Mocking** (para testes isolados):

```typescript
// e2e/oracle-list-mocked.spec.ts
import { test, expect } from '@playwright/test';

test('oracle list with mocked API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/oracles', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        oracles: [
          { id: '1', name: 'Mocked Oracle 1', domain: 'banking' },
          { id: '2', name: 'Mocked Oracle 2', domain: 'crm' },
        ],
      }),
    });
  });

  await page.goto('/oracles');

  // Verify mocked data
  await expect(page.locator('text=Mocked Oracle 1')).toBeVisible();
  await expect(page.locator('text=Mocked Oracle 2')).toBeVisible();
});
```

#### Use Case 2: Web Scraping (JavaScript-heavy Sites)

**Quando usar Playwright para scraping**:
- Sites JavaScript-heavy (React, Vue, Angular)
- SPAs (Single Page Applications)
- Sites com autenticação complexa
- Sites com infinite scroll ou lazy loading

**Exemplo 1: Scraping documentação dinâmica**:

```python
# scraping/documentation_scraper.py
import asyncio
from playwright.async_api import async_playwright

async def scrape_dynamic_docs(url: str):
    """Scrape documentation from JavaScript-rendered site"""

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate
        await page.goto(url)

        # Wait for content to load
        await page.wait_for_selector('.documentation-content')

        # Extract content
        articles = await page.query_selector_all('article.doc-article')

        docs = []
        for article in articles:
            title = await article.query_selector('h1')
            content = await article.query_selector('.content')

            docs.append({
                'title': await title.inner_text() if title else '',
                'content': await content.inner_text() if content else '',
                'url': page.url
            })

        await browser.close()
        return docs

# Usage
docs = await scrape_dynamic_docs('https://example.com/docs')
```

**Exemplo 2: Scraping com autenticação**:

```python
async def scrape_with_auth(base_url: str, username: str, password: str):
    """Scrape protected content after login"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Login
        await page.goto(f'{base_url}/login')
        await page.fill('input[name="username"]', username)
        await page.fill('input[name="password"]', password)
        await page.click('button[type="submit"]')

        # Wait for redirect
        await page.wait_for_url(f'{base_url}/dashboard')

        # Navigate to protected page
        await page.goto(f'{base_url}/api-documentation')

        # Scrape
        content = await page.locator('.api-docs').inner_text()

        await browser.close()
        return content
```

**Exemplo 3: Scraping com scroll infinito**:

```python
async def scrape_infinite_scroll(url: str):
    """Scrape site with infinite scroll"""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(url)

        items = []
        previous_height = 0

        while True:
            # Scroll to bottom
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')

            # Wait for new content
            await page.wait_for_timeout(2000)

            # Get current items
            current_items = await page.query_selector_all('.item')
            items.extend([
                await item.inner_text() for item in current_items[len(items):]
            ])

            # Check if reached bottom
            new_height = await page.evaluate('document.body.scrollHeight')
            if new_height == previous_height:
                break
            previous_height = new_height

        await browser.close()
        return items
```

**Configuração para scraping em produção**:

```python
# config/playwright_config.py
from playwright.async_api import async_playwright

class PlaywrightScraper:
    """Production-ready Playwright scraper"""

    def __init__(self):
        self.browser = None
        self.context = None

    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        )
        self.context = await self.browser.new_context(
            user_agent='SuperCore Scraper 1.0',
            viewport={'width': 1920, 'height': 1080}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.context.close()
        await self.browser.close()
        await self.playwright.stop()

    async def scrape_page(self, url: str):
        page = await self.context.new_page()
        await page.goto(url, wait_until='networkidle')
        content = await page.content()
        await page.close()
        return content
```

### 10.3.2 Scrapy (Web Crawling em Produção)

**Papel**: Web crawling robusto para sites estáticos e produção

**Versão Mínima**: Scrapy 2.11.0+

**Casos de Uso**:
1. **Crawling de documentação pública**: BACEN, regulações, normas
2. **ETL de dados públicos**: Datasets governamentais
3. **Indexação de fontes externas**: Knowledge base building

**Quando usar Scrapy vs Playwright**:
- **Scrapy**: Sites estáticos, HTML puro, produção, escalabilidade
- **Playwright**: Sites JavaScript-heavy, autenticação complexa, SPAs

#### Exemplo 1: Spider para documentação BACEN

```python
# spiders/bacen_spider.py
import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule

class BacenDocumentationSpider(CrawlSpider):
    """Crawl BACEN documentation for regulatory content"""

    name = 'bacen_docs'
    allowed_domains = ['bcb.gov.br']
    start_urls = ['https://www.bcb.gov.br/estabilidadefinanceira/normasprudenciais']

    rules = (
        # Follow links to documentation pages
        Rule(
            LinkExtractor(allow=r'/estabilidadefinanceira/.*'),
            callback='parse_doc',
            follow=True
        ),
    )

    def parse_doc(self, response):
        """Parse documentation page"""

        # Extract title
        title = response.css('h1::text').get()

        # Extract content
        content = response.css('.content-text').get()

        # Extract publication date
        pub_date = response.css('.publication-date::text').get()

        # Extract regulation number
        regulation_num = response.css('.regulation-number::text').get()

        yield {
            'title': title,
            'content': content,
            'publication_date': pub_date,
            'regulation_number': regulation_num,
            'url': response.url,
            'scraped_at': scrapy.Field(default_factory=lambda: datetime.utcnow().isoformat())
        }

        # Extract PDF links
        pdf_links = response.css('a[href$=".pdf"]::attr(href)').getall()
        for pdf_link in pdf_links:
            yield response.follow(pdf_link, callback=self.parse_pdf)

    def parse_pdf(self, response):
        """Download and process PDF"""

        filename = response.url.split('/')[-1]
        with open(f'downloads/{filename}', 'wb') as f:
            f.write(response.body)

        yield {
            'type': 'pdf',
            'filename': filename,
            'url': response.url,
            'size': len(response.body)
        }
```

#### Exemplo 2: Spider genérico para regulações

```python
# spiders/regulation_spider.py
import scrapy

class RegulationSpider(scrapy.Spider):
    """Generic spider for regulatory documents"""

    name = 'regulation_crawler'

    def __init__(self, start_url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = [start_url] if start_url else []

    def parse(self, response):
        """Parse regulation listing page"""

        # Extract all regulation items
        for regulation in response.css('.regulation-item'):
            yield {
                'title': regulation.css('.title::text').get(),
                'description': regulation.css('.description::text').get(),
                'date': regulation.css('.date::text').get(),
                'category': regulation.css('.category::text').get(),
                'url': regulation.css('a::attr(href)').get(),
                'domain': response.url.split('/')[2]  # Extract domain
            }

        # Follow pagination
        next_page = response.css('a.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

#### Configuração Scrapy para Produção

```python
# settings.py
BOT_NAME = 'supercore_scraper'

SPIDER_MODULES = ['scraping.spiders']
NEWSPIDER_MODULE = 'scraping.spiders'

# Obey robots.txt
ROBOTSTXT_OBEY = True

# Configure delays (be respectful)
DOWNLOAD_DELAY = 2
CONCURRENT_REQUESTS_PER_DOMAIN = 4
CONCURRENT_REQUESTS_PER_IP = 4

# User agent
USER_AGENT = 'SuperCore Documentation Scraper (contact@lbpay.com)'

# Retry settings
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# Pipeline para processar items
ITEM_PIPELINES = {
    'scraping.pipelines.ValidationPipeline': 100,
    'scraping.pipelines.DatabasePipeline': 200,
    'scraping.pipelines.VectorEmbeddingPipeline': 300,
}

# Cache (evita re-scraping)
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 86400  # 24 hours
HTTPCACHE_DIR = 'httpcache'

# AutoThrottle (automatic speed adjustment)
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
```

#### Pipelines para Processamento

```python
# pipelines.py
import asyncpg
from sentence_transformers import SentenceTransformer

class DatabasePipeline:
    """Store scraped items in PostgreSQL"""

    async def open_spider(self, spider):
        self.conn = await asyncpg.connect(
            host='postgres.internal',
            database='supercore',
            user='scraper',
            password='secret'
        )

    async def close_spider(self, spider):
        await self.conn.close()

    async def process_item(self, item, spider):
        await self.conn.execute('''
            INSERT INTO scraped_documents (title, content, url, scraped_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (url) DO UPDATE SET
                content = EXCLUDED.content,
                scraped_at = EXCLUDED.scraped_at
        ''', item['title'], item['content'], item['url'], item['scraped_at'])

        return item

class VectorEmbeddingPipeline:
    """Generate embeddings for scraped content"""

    def open_spider(self, spider):
        self.model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

    def process_item(self, item, spider):
        # Generate embedding
        embedding = self.model.encode(item['content'])

        # Store embedding
        item['embedding'] = embedding.tolist()

        return item
```

**Comandos**:

```bash
# Run spider
scrapy crawl bacen_docs -o output.json

# Run with custom URL
scrapy crawl regulation_crawler -a start_url="https://example.com/regulations"

# Run in background (production)
scrapyd-deploy
curl http://localhost:6800/schedule.json -d project=supercore -d spider=bacen_docs
```

### 10.4 Mocking e Fixtures

#### Python (pytest-mock)

**Exemplo**:
```python
# test_integration.py
def test_external_api_call(mocker):
    # Mock external API
    mock_response = mocker.Mock()
    mock_response.json.return_value = {"status": "success"}
    mocker.patch('httpx.AsyncClient.get', return_value=mock_response)

    # Test
    result = await call_external_api()
    assert result["status"] == "success"
```

#### TypeScript (vitest mock)

**Exemplo**:
```typescript
// api.test.ts
import { vi } from 'vitest';
import { callExternalAPI } from './api';

vi.mock('./api', () => ({
  callExternalAPI: vi.fn(() => Promise.resolve({ status: 'success' })),
}));

test('calls external API', async () => {
  const result = await callExternalAPI();
  expect(result.status).toBe('success');
});
```

#### Go (testify/mock)

**Exemplo**:
```go
// mock_database.go
type MockDatabase struct {
    mock.Mock
}

func (m *MockDatabase) GetOracle(id string) (*Oracle, error) {
    args := m.Called(id)
    return args.Get(0).(*Oracle), args.Error(1)
}

// test
func TestOracleService(t *testing.T) {
    mockDB := new(MockDatabase)
    mockDB.On("GetOracle", "oracle-123").Return(&Oracle{
        ID: "oracle-123",
        Name: "Test Oracle",
    }, nil)

    service := NewOracleService(mockDB)
    oracle, err := service.GetOracle("oracle-123")

    assert.NoError(t, err)
    assert.Equal(t, "Test Oracle", oracle.Name)
    mockDB.AssertExpectations(t)
}
```

---

## 11. ROADMAP DA STACK

### 11.1 Stack Atual (Q4 2025)

**Implementado**:
- PostgreSQL 16 + pgvector
- NebulaGraph 3.8
- Redis 7, MinIO
- Go 1.22, Python 3.12, TypeScript 5.x
- Next.js 14, React 18, shadcn/ui
- i18next ecosystem
- Apache Pulsar 3.4
- CrewAI, LangGraph, LangFlow
- vLLM, Ollama
- OPA Rego
- Docker

### 11.2 Stack Planejada (2026-2028)

#### Q1 2026 (Fase 1)

**Foco**: Deployment completo, Super Portal production-ready

**Adicionar**:
- **Kubernetes** production cluster (3+ nodes)
- **Helm** charts para todos os componentes
- **ArgoCD** GitOps completo
- **Prometheus + Grafana** observability
- **Jaeger** distributed tracing
- **Vault** secrets management

#### Q2 2026 (Fase 2)

**Foco**: Escalabilidade, resiliência

**Adicionar**:
- **Service Mesh** (Istio ou Linkerd)
- **Multi-region** deployment (DR)
- **Advanced auto-scaling** (KEDA)
- **Chaos engineering** (Chaos Mesh)
- **Advanced caching** (Redis Cluster)

#### Q3 2026 (Fase 3)

**Foco**: Performance, analytics

**Adicionar**:
- **Edge computing** (Cloudflare Workers, Fastly Compute)
- **Advanced analytics** (ClickHouse, Druid)
- **Real-time ML inference** (NVIDIA Triton)
- **Graph ML** (DGL, PyG)

#### Q4 2026 (Fase 4)

**Foco**: AI-driven evolution

**Adicionar**:
- **AutoML** (auto-tuning de modelos)
- **Federated learning** (privacy-preserving ML)
- **Quantum-ready** cryptography
- **Web3 integration** (optional)

#### 2027+ (Fase 5)

**Experimentações**:
- **Neuromorphic computing**
- **Edge AI** (ONNX Runtime, TensorFlow Lite)
- **Multi-modal models** (vision + text + audio)
- **Agentic AI** (autonomous evolution)

### 11.3 Experimentações Futuras

**IA/ML**:
- **LLMs locais maiores**: Llama 4, Qwen 3
- **Modelos especializados**: Code generation, SQL generation, UI generation
- **RAG avançado**: Graph RAG, Multi-hop reasoning

**Infraestrutura**:
- **Serverless**: AWS Lambda, Google Cloud Functions (optional)
- **Edge**: Cloudflare Durable Objects, Fastly Compute
- **Multi-cloud**: AWS + GCP + Azure (evitar lock-in)

**Databases**:
- **Time-series**: TimescaleDB, InfluxDB (analytics)
- **Search**: Meilisearch, Typesense (alternativas ao Elasticsearch)
- **Graph**: TigerGraph, Neptune (alternatives ao NebulaGraph)

---

## 12. APÊNDICES

### 12.1 Glossário de Tecnologias

| Termo | Significado |
|-------|-------------|
| **ADR** | Architecture Decision Record (documentação de decisões) |
| **ABAC** | Attribute-Based Access Control (autorização por atributos) |
| **AST** | Abstract Syntax Tree (representação de código) |
| **BFF** | Backend for Frontend (API específica para frontend) |
| **CDN** | Content Delivery Network |
| **CQRS** | Command Query Responsibility Segregation |
| **DDL** | Data Definition Language (SQL: CREATE, ALTER, DROP) |
| **DRY** | Don't Repeat Yourself |
| **FSM** | Finite State Machine (máquina de estados) |
| **gRPC** | Google Remote Procedure Call (protocol binário) |
| **JSONB** | JSON Binary (PostgreSQL format) |
| **JWT** | JSON Web Token |
| **MCP** | Model Context Protocol (Anthropic) |
| **NGSQL** | NebulaGraph Query Language |
| **OPA** | Open Policy Agent |
| **PKCE** | Proof Key for Code Exchange (OAuth extension) |
| **RAG** | Retrieval-Augmented Generation |
| **RBAC** | Role-Based Access Control |
| **RLS** | Row-Level Security (PostgreSQL) |
| **SLA** | Service Level Agreement |
| **SLI** | Service Level Indicator |
| **SLO** | Service Level Objective |
| **SSE** | Server-Sent Events |
| **SSR** | Server-Side Rendering |
| **TLS** | Transport Layer Security |

### 12.2 Links e Documentação

**Frameworks**:
- [Next.js](https://nextjs.org/docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Gin](https://gin-gonic.com/docs/)
- [LangChain](https://python.langchain.com/)
- [CrewAI](https://docs.crewai.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [LangFlow](https://docs.langflow.org/)

**Databases**:
- [PostgreSQL](https://www.postgresql.org/docs/)
- [NebulaGraph](https://docs.nebula-graph.io/)
- [Redis](https://redis.io/docs/)
- [MinIO](https://min.io/docs/)

**IA/ML**:
- [OpenAI API](https://platform.openai.com/docs)
- [Claude API](https://docs.anthropic.com/)
- [vLLM](https://docs.vllm.ai/)
- [Ollama](https://ollama.com/docs)
- [Sentence Transformers](https://www.sbert.net/)

**Messaging**:
- [Apache Pulsar](https://pulsar.apache.org/docs/)
- [MCP Protocol](https://modelcontextprotocol.io/)

**Deployment**:
- [Kubernetes](https://kubernetes.io/docs/)
- [Helm](https://helm.sh/docs/)
- [ArgoCD](https://argo-cd.readthedocs.io/)
- [Docker](https://docs.docker.com/)

**UI**:
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Flow](https://reactflow.dev/)

**i18n**:
- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [next-i18next](https://github.com/i18next/next-i18next)

**Segurança**:
- [OPA](https://www.openpolicyagent.org/docs/)
- [Vault](https://developer.hashicorp.com/vault/docs)

### 12.3 Versões Mínimas Requeridas

| Componente | Versão Mínima | Recomendada |
|------------|---------------|-------------|
| **Linguagens** | | |
| Go | 1.22 | 1.22+ |
| Python | 3.12 | 3.12+ |
| Node.js | 20 LTS | 20 LTS |
| TypeScript | 5.3 | 5.3+ |
| **Databases** | | |
| PostgreSQL | 16.0 | 16.1+ |
| NebulaGraph | 3.8 | 3.8+ |
| Redis | 7.0 | 7.2+ |
| MinIO | 2024-01-01 | Latest |
| **Frameworks** | | |
| Next.js | 14.1.0 | 14.1+ |
| React | 18.2.0 | 18.2+ |
| FastAPI | 0.109.0 | 0.109+ |
| LangChain | 0.1.0 | Latest |
| CrewAI | 0.11.0 | Latest |
| **Messaging** | | |
| Apache Pulsar | 3.4.0 | 3.4+ |
| **Deployment** | | |
| Kubernetes | 1.28 | 1.28+ |
| Helm | 3.12.0 | 3.12+ |
| ArgoCD | 2.9.0 | 2.9+ |
| Docker | 24.0.0 | 24.0+ |

---

## 13. HARMONIA E COMPATIBILIDADE DA STACK FRONTEND

**SEÇÃO CRÍTICA** - Validação de compatibilidade para evitar problemas de implementação

### 13.1 Matriz de Compatibilidade Frontend

| Componente A | Componente B | Compatível? | Notas |
|--------------|--------------|-------------|-------|
| **Next.js 14** | **React 18** | SIM | Next.js 14 requer React 18+ |
| **Next.js 14** | **next-i18next 15.2** | SIM | Testado e compatível |
| **shadcn/ui 0.8** | **TailwindCSS 3.4** | SIM | shadcn/ui usa Tailwind nativamente |
| **shadcn/ui 0.8** | **i18next** | SIM | shadcn/ui é headless, sem strings hardcoded |
| **shadcn/ui 0.8** | **React 18** | SIM | Baseado em Radix UI (compatível React 18) |
| **React Hook Form 7.49** | **shadcn/ui Form** | SIM | Integração nativa |
| **Zod 3.22** | **React Hook Form** | SIM | Via @hookform/resolvers/zod |
| **Lucide Icons 0.312** | **React 18** | SIM | Componentes React nativos |
| **Lucide Icons 0.312** | **Next.js 14** | SIM | Tree-shakeable, otimizado |
| **React Flow 11.10** | **React 18** | SIM | Compatível |
| **Recharts 2.10** | **React 18** | SIM | Compatível |
| **TailwindCSS 3.4** | **i18next** | SIM | Independentes |
| **Turbopack** | **All above** | SIM | Build tool (não afeta runtime) |

### 13.2 Versões Testadas que Funcionam Juntas

**Stack Validada**:
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.3.3",
    "i18next": "23.7.16",
    "react-i18next": "14.0.5",
    "next-i18next": "15.2.0",
    "tailwindcss": "3.4.1",
    "lucide-react": "0.312.0",
    "react-hook-form": "7.49.3",
    "zod": "3.22.4",
    "@hookform/resolvers": "3.3.4",
    "reactflow": "11.10.4",
    "recharts": "2.10.4",
    "zustand": "4.5.0",
    "@tanstack/react-query": "5.17.19"
  },
  "devDependencies": {
    "@types/node": "20.11.5",
    "@types/react": "18.2.48",
    "@types/react-dom": "18.2.18",
    "eslint": "8.56.0",
    "eslint-config-next": "14.1.0",
    "prettier": "3.2.4",
    "autoprefixer": "10.4.17",
    "postcss": "8.4.33"
  }
}
```

**shadcn/ui Components** (copy-paste):
```bash
# Instalar CLI
npx shadcn-ui@latest init

# Adicionar componentes
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

### 13.3 Warnings sobre Incompatibilidades Conhecidas

| Situação | Problema | Solução |
|----------|----------|---------|
| **Next.js 13 + next-i18next** | App Router não era totalmente compatível | Usar Next.js 14.1+ com next-i18next 15.2+ |
| **shadcn/ui + CSS Modules** | Conflito de estilos | Usar TailwindCSS puro (não misturar CSS Modules) |
| **React 17 + shadcn/ui** | Radix UI requer React 18 | Upgrade para React 18+ |
| **i18next sem namespace** | Conflito de keys | Sempre usar namespaces separados |
| **TailwindCSS JIT + old configs** | Purge não funciona | Usar config moderna (content, não purge) |

### 13.4 Testes de Compatibilidade Recomendados

**Pre-flight Checklist**:

1. **Build test**:
```bash
npm run build
# Deve completar sem erros
```

2. **Type check**:
```bash
npm run type-check
# Zero erros TypeScript
```

3. **i18n test**:
```typescript
// app/[lang]/page.tsx
import { useTranslation } from 'react-i18next';

export default function Page({ params }: { params: { lang: string } }) {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

4. **shadcn/ui test**:
```typescript
// Renderiza componente shadcn/ui com i18n
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function TestComponent() {
  const { t } = useTranslation();
  return <Button>{t('common.submit')}</Button>;
}
```

5. **SSR test**:
```bash
# Build e start
npm run build
npm start

# Verificar HTML source (deve conter textos traduzidos no HTML)
curl http://localhost:3000/pt/oracles | grep "Oráculos"
```

### 13.5 Recomendações para Evitar Problemas

1. **Sempre use versões exatas** (não `^` ou `~` em produção)
2. **Teste build após cada upgrade** de dependência
3. **Use lockfile** (package-lock.json ou yarn.lock)
4. **Mantenha Next.js, React e TypeScript em sync**
5. **Teste i18n em todos os idiomas suportados**
6. **Valide acessibilidade** (WCAG 2.1 AA) com axe-core
7. **Teste em múltiplos browsers** (Chrome, Firefox, Safari)

---

## RESUMO EXECUTIVO

### Stack SuperCore v2.0 em Números

- **8 Camadas Arquiteturais**: Dados → Fundação → Abstração → Orquestração → Interface → Apresentação → Deployment → Super Portal
- **3 Linguagens Core**: Go, Python, TypeScript
- **4 Bancos de Dados**: PostgreSQL, NebulaGraph, Redis, MinIO
- **3 Modalidades RAG**: SQL + Graph + Vector
- **10+ Idiomas Suportados**: Português, inglês, espanhol, francês, alemão, italiano, japonês, chinês, russo, árabe
- **4 LLM Providers**: OpenAI GPT-4, Claude Opus, vLLM (local), Ollama (dev)
- **Zero Lock-in**: 100% open source, vendor agnostic

### Diferencial Tecnológico v2.0

1. **Meta-Plataforma de Geração**:
   - Stack contém ferramentas para GERAR soluções
   - Code generation via LLMs + templates + AST
   - Zero código manual após SuperCore implementado

2. **Super Portal Moderno**:
   - Next.js 14 + shadcn/ui + Lucide Icons
   - Multi-idioma nativo (i18next)
   - UX moderna e acessível

3. **Deployment Automatizado**:
   - Kubernetes + Helm + ArgoCD (GitOps)
   - Zero downtime deployments
   - Auto-scaling e observability nativa

4. **RAG 3D Híbrido**:
   - SQL (estruturado) + Graph (relacionamentos) + Vector (semântico)
   - Qualidade de respostas superior

5. **Multi-Agente Colaborativo**:
   - CrewAI + LangGraph
   - Agentes especializados colaboram
   - Problemas complexos resolvidos automaticamente

6. **Agnóstico de Domínio TOTAL**:
   - Zero exemplos Banking/PIX/BACEN no core
   - Stack serve para QUALQUER domínio
   - Configurável por Oráculo

### ROI Tecnológico

**Antes** (desenvolvimento manual):
- **Tempo**: 3-6 meses para MVP
- **Equipe**: 5-10 desenvolvedores
- **Custo**: Alto (salários + infraestrutura)
- **Manutenção**: Contínua (cada mudança = código)

**Depois** (SuperCore v2.0):
- **Tempo**: 1-2 semanas para MVP completo
- **Equipe**: 1-2 Product Managers (zero devs)
- **Custo**: Baixo (GPU para vLLM, infraestrutura cloud)
- **Manutenção**: Mínima (mudanças via UI, sem código)

**Ganho**: **10-20x mais rápido**, **5-10x mais barato**, **zero dívida técnica**

---

**Versão**: 2.0.0
**Data**: 2025-12-21
**Status**: Documento Definitivo - Revisão Crítica Completa
**Próxima Revisão**: Após implementação de Fase 1 (Q1 2026)

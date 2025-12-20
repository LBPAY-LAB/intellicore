# Stack Tecnológico Unificado - SuperCore Platform

**Versão**: 2.0.0
**Data**: 2025-12-11
**Propósito**: Referência técnica DEFINITIVA para agents de orquestração e scrum master

---

## ⚠️ DOCUMENTO MASTER - FONTE ÚNICA DE VERDADE

**CRÍTICO**: Este documento é a **ÚNICA fonte de verdade** para decisões de stack tecnológico em TODO o projeto.

### 🎯 PRINCÍPIO FUNDAMENTAL: STACK UNIFICADA

**DECISÃO ARQUITETURAL CRÍTICA**:

> **"Não pretendo ter fases com uma stack e outras fases com outras, isso obrigará a muito esforço de migração, reconfiguração... temos que nascer com um padrão e vamos evoluindo dentro desse padrão conforme as necessidades de cada fase."**

**Implicações**:
- ✅ **UMA stack para TODAS as fases** (Fase 0 até Fase 4+)
- ✅ **ZERO migrações** de tecnologia entre fases
- ✅ **Escalabilidade horizontal** (mais nós, não troca de tecnologia)
- ✅ **Aprendizado único** (time domina stack desde o início)
- ❌ **NÃO** adicionar tecnologias "temporárias" ou "experimentais"
- ❌ **NÃO** usar "Phase 1 stack" vs "Phase 2 stack"

**Evolução por fase**:
- **Fase 0-1**: Toda a stack instalada, uso básico
- **Fase 2-3**: Mesma stack, adiciona complexidade (mais workers, mais nós)
- **Fase 4**: Mesma stack, otimizações de produção (HA, scaling)

---

### Regras de Governança

1. ✅ **SEMPRE consulte este documento** antes de adicionar qualquer dependência
2. ✅ **SEMPRE referencie este documento** em specs de fase (docs/fases/faseN/01_especificacoes.md)
3. ❌ **NUNCA crie documentos de stack** nas pastas de fases que possam divergir deste
4. ❌ **NUNCA use versões diferentes** das especificadas aqui sem aprovação formal
5. ❌ **NUNCA sugira tecnologias "para usar depois"** - tudo que está aqui será usado desde a Fase 0
6. ⚠️ **Se precisar adicionar/mudar tecnologia**:
   - Abra discussão em docs/fases/faseN/02_duvidas_especificacoes.md
   - Após aprovação, atualize ESTE documento primeiro
   - Depois atualize referências nas specs da fase

### Como Usar Este Documento

**Para Agents de Implementação**:
```
1. Leia a seção "Stack Completo Unificado"
2. Use EXATAMENTE as versões especificadas
3. Copie os snippets de go.mod, package.json, requirements.txt, docker-compose.yml
4. Em caso de dúvida, consulte a justificativa na coluna "Justificativa"
5. NUNCA adicione dependências fora desta lista
```

**Para Scrum Master / Orchestration Agents**:
```
1. Valide que PRs usam versões corretas deste documento
2. Bloqueie PRs que adicionem dependências não listadas aqui
3. Referencie este documento em sprint planning
4. Garanta que TODAS as fases usam a MESMA stack
```

**Para Documentação de Fase**:
```
Em docs/fases/faseN/01_especificacoes.md, adicione:

## Stack Tecnológico

**Referência master**: [docs/architecture/stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)

Esta fase usa o stack UNIFICADO definido no documento master (mesma stack para todas as fases).
```

---

## 📐 Arquitetura Unificada: Medallion Architecture

O SuperCore segue a arquitetura **Medallion** (Bronze → Silver → Gold) com tecnologias consistentes em todas as camadas:

```
┌─────────────────────────────────────────────────────────────────┐
│  BRONZE LAYER (Ingestão Raw)                                    │
│  ─────────────────────────────────────────────────────────────  │
│  • MinIO: Armazenamento de objetos (todos os formatos)          │
│  • Apache Pulsar: Message broker (eventos, filas)               │
│  • Playwright + Scrapy: Web scraping                            │
│  • httpx + aiohttp: API connectors                              │
│  • UniversalFileProcessor: 30+ formatos de arquivo              │
│                                                                  │
│  Formatos suportados:                                           │
│  - Documentos: PDF, DOCX, DOC, ODT, RTF, MD, TXT, HTML          │
│  - Planilhas: XLSX, XLS, CSV, TSV, ODS, Google Sheets           │
│  - Imagens: PNG, JPEG, SVG, TIFF (OCR com Tesseract)            │
│  - Áudio/Vídeo: MP3, WAV, MP4 (Whisper transcription)           │
│  - Arquivos: ZIP, TAR, RAR, 7z                                  │
│  - Emails: EML, MSG, MBOX                                       │
│  - Estruturados: JSON, XML, YAML, Parquet, Avro                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SILVER LAYER (Processamento & Transformação)                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Apache Flink: Stream processing (real-time ETL)              │
│  • Celery + Redis: Task queue distribuída                       │
│  • LangGraph: Orquestração de agentes multi-step                │
│  • Self-hosted LLMs: Ollama (dev) / vLLM (prod)                 │
│  • LoRA: Fine-tuning eficiente de modelos                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  GOLD LAYER (Dados Estruturados & Busca)                        │
│  ─────────────────────────────────────────────────────────────  │
│  • PostgreSQL 15+ (pgvector): Dados estruturados + vetores      │
│  • NebulaGraph: Relacionamentos complexos (grafo)               │
│  • pgvector: Busca semântica (embeddings)                       │
│                                                                  │
│  RAG Trimodal:                                                  │
│  1. SQL (PostgreSQL): Queries estruturadas                      │
│  2. Graph (NebulaGraph): Navegação em relacionamentos           │
│  3. Vector (pgvector): Busca semântica (embeddings)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Completo Unificado (Todas as Fases)

### Backend (Go)

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Linguagem** | Go | 1.21+ | Performance, concurrency nativa, type-safe |
| **Framework Web** | Gin | v1.10.0 | Rápido, leve, middlewares robustos |
| **PostgreSQL Driver** | lib/pq | v1.10.9 | Driver oficial PostgreSQL |
| **NebulaGraph Client** | nebula-go | v3.7.0 | Cliente oficial NebulaGraph |
| **Redis Client** | go-redis | v9.5.0 | Cliente Redis high-performance |
| **MinIO Client** | minio-go | v7.0.66 | Object storage SDK |
| **JSON Schema** | gojsonschema | v1.2.0 | Validação JSON Schema Draft 7 |
| **UUID** | google/uuid | v1.6.0 | Geração segura de UUIDs |
| **Validação** | go-playground/validator | v10.x | Validação de structs |
| **Observability** | OpenTelemetry | v1.21.0 | Traces, metrics, logs |
| **Prometheus** | prometheus/client_golang | v1.18.0 | Métricas |
| **Testing** | Go testing + testify | stdlib + v1.8.4 | Testing framework |

**go.mod completo**:
```go
module github.com/lbpay/supercore

go 1.21

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/google/uuid v1.6.0
    github.com/lib/pq v1.10.9
    github.com/xeipuuv/gojsonschema v1.2.0
    github.com/go-playground/validator/v10 v10.19.0

    // NebulaGraph
    github.com/vesoft-inc/nebula-go/v3 v3.7.0

    // Redis
    github.com/redis/go-redis/v9 v9.5.0

    // MinIO
    github.com/minio/minio-go/v7 v7.0.66

    // Observability
    github.com/prometheus/client_golang v1.18.0
    go.opentelemetry.io/otel v1.21.0
    go.opentelemetry.io/otel/sdk v1.21.0
    go.opentelemetry.io/otel/exporters/prometheus v0.44.0

    // Testing
    github.com/stretchr/testify v1.8.4
)
```

---

### Frontend (TypeScript/React)

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Framework** | Next.js | 14+ (App Router) | SSR, RSC, otimizações automáticas |
| **Runtime** | Node.js | 20 LTS | Estabilidade, performance |
| **Package Manager** | npm | 10+ | Padrão do Node.js |
| **UI Library** | shadcn/ui | latest | Componentes acessíveis, customizáveis |
| **Primitives** | Radix UI | latest | Headless components, WAI-ARIA |
| **Styling** | Tailwind CSS | v3.4+ | Utility-first, performance |
| **Forms** | React Hook Form | v7.x | Performance, DX excelente |
| **Validation** | Zod | v3.x | Type-safe schema validation |
| **State Management** | Zustand | v4.x | Simples, performático |
| **Data Fetching** | TanStack Query | v5.x | Cache, optimistic updates |
| **Graph Visualization** | React Flow | v11.x | Renderização de grafos |
| **Testing** | Vitest | latest | Rápido, compatível com Jest |
| **E2E Testing** | Playwright | latest | Cross-browser, reliable |

**package.json completo**:
```json
{
  "name": "supercore-frontend",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0",
    "reactflow": "^11.10.4",
    "lucide-react": "^0.323.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0",
    "@playwright/test": "^1.42.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

---

### AI/ML/RAG Stack (Python)

#### LLMs & Embeddings (Self-hosted Primary)

| Categoria | Tecnologia | Versão | Ambiente | Justificativa |
|-----------|-----------|--------|----------|---------------|
| **LLM (Dev)** | Ollama | latest | Development | Self-hosted, baixa latência, zero custo |
| **LLM (Prod)** | vLLM | v0.3.2 | Production | Self-hosted, alta throughput, GPU otimizado |
| **LLM (Fallback)** | Claude Opus 4.5 | API | Prod (fallback) | Raciocínio superior, APENAS fallback |
| **Embeddings** | Sentence Transformers | v2.3.1 | Todas | Self-hosted, multilingual, FOSS |
| **Fine-tuning** | LoRA (PEFT) | v0.7.1 | Todas | Eficiente, baixo custo, adaptação rápida |
| **Inference** | Transformers | v4.36.0 | Todas | HuggingFace ecosystem, models hub |
| **Acceleration** | Torch + Accelerate | v2.1.2 + v0.25.0 | Todas | GPU/CPU otimizado |

**Modelos recomendados**:
- **LLM (Ollama/vLLM)**: Llama 3 70B, Mixtral 8x7B, CodeLlama 34B
- **Embeddings**: multilingual-e5-large, paraphrase-multilingual-mpnet-base-v2
- **Fine-tuning base**: Llama 3 8B (LoRA adapters)

#### Orquestração & Agents

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Orchestration** | LangGraph | v0.0.20 | Multi-agent workflows, state management |
| **Core** | LangChain Core | v0.1.23 | LLM abstractions, chains, memoria |
| **Framework** | FastAPI | v0.110.0 | API async, performance, OpenAPI |
| **Server** | Uvicorn | v0.27.0 | ASGI server, production-ready |

#### Databases & Storage

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **RDBMS** | PostgreSQL | 15+ | JSONB, robustez, extensões |
| **Vector Extension** | pgvector | v0.6.0 | Busca vetorial nativa PostgreSQL |
| **Graph DB** | NebulaGraph | 3.7+ | Relacionamentos complexos, queries rápidas |
| **Object Storage** | MinIO | v7.2.3 | S3-compatible, self-hosted |
| **Cache/Queue** | Redis | 7+ | Message broker, cache, pub/sub |

#### Streaming & Processing

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Stream Processing** | Apache Flink | v1.18.0 | Real-time ETL, stateful processing |
| **Message Broker** | Apache Pulsar | v3.4.0 | Multi-tenancy, geo-replication |
| **Task Queue** | Celery | v5.3.0 | Distributed tasks, scheduling |

#### Document Processing (Bronze Layer - TODOS OS FORMATOS)

##### Documentos Textuais

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **PDF** | PyMuPDF | v1.23.0 | Extração de texto, imagens, metadados |
| **Markdown** | markdown | v3.5.1 | Parsing de Markdown |
| **TXT** | Built-in | stdlib | Leitura direta |
| **DOCX** | python-docx | v1.1.0 | Microsoft Word moderno |
| **DOC** | textract | v1.6.5 | Microsoft Word legado |
| **ODT** | odfpy | v1.4.1 | OpenDocument Text |
| **RTF** | striprtf | v0.0.26 | Rich Text Format |
| **HTML** | BeautifulSoup4 | v4.12.0 | Parsing HTML/XML |

##### Planilhas & Dados Tabulares

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **XLSX** | openpyxl | v3.1.2 | Excel moderno |
| **XLS** | xlrd | v2.0.1 | Excel legado |
| **CSV/TSV** | pandas | v2.1.4 | Leitura/escrita eficiente |
| **ODS** | odfpy | v1.4.1 | OpenDocument Spreadsheet |
| **Google Sheets** | gspread | v5.12.0 | API Google Sheets |

##### Imagens (OCR)

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **PNG/JPEG/TIFF** | Pillow | v10.2.0 | Processamento de imagens |
| **OCR** | pytesseract | v0.3.10 | Extração de texto de imagens |
| **SVG** | cairosvg + svglib | v2.7.1 + v1.5.1 | Vetores para raster |
| **Image Processing** | opencv-python | v4.9.0 | Preprocessamento para OCR |

##### Apresentações

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **PPTX** | python-pptx | v0.6.23 | PowerPoint moderno |
| **PPT** | textract | v1.6.5 | PowerPoint legado |
| **ODP** | odfpy | v1.4.1 | OpenDocument Presentation |

##### Dados Estruturados

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **JSON** | Built-in | stdlib | Nativo Python |
| **XML** | lxml + xmltodict | v5.0.0 + v0.13.0 | Parsing XML eficiente |
| **YAML** | pyyaml | v6.0.1 | Configurações |
| **TOML** | toml | v0.10.2 | Configurações modernas |
| **Parquet** | pyarrow | v14.0.2 | Dados colunares |
| **Avro** | fastavro | v1.9.0 | Schema evolution |

##### Arquivos Compactados

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **ZIP** | Built-in | stdlib | zipfile nativo |
| **TAR/GZ/BZ2** | Built-in | stdlib | tarfile nativo |
| **RAR** | rarfile | v4.1 | Extração RAR |
| **7z** | py7zr | v0.20.8 | 7-Zip extraction |

##### Emails

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **EML** | Built-in | stdlib | email.parser |
| **MSG** | extract-msg | v0.45.0 | Outlook messages |
| **MBOX** | Built-in | stdlib | mailbox nativo |

##### Multimídia (Áudio/Vídeo)

| Formato | Biblioteca | Versão | Uso |
|---------|-----------|--------|-----|
| **Speech-to-Text** | openai-whisper | v20231117 | Transcrição de áudio (self-hosted) |
| **Audio Processing** | pydub | v0.25.1 | Manipulação de áudio |
| **FFmpeg** | ffmpeg-python | v0.2.0 | Conversão de formatos |
| **Subtitles** | pysrt + webvtt-py | v1.1.2 + v0.4.6 | Parsing de legendas |

#### Web Scraping & API Connectors (Bronze Layer)

##### Web Scraping

| Categoria | Biblioteca | Versão | Uso |
|-----------|-----------|--------|-----|
| **Browser Automation** | Playwright | v1.40.0 | Sites com JavaScript, SPAs |
| **Web Crawling** | Scrapy | v2.11.0 | Crawling em escala, pipelines |
| **HTML Parsing** | BeautifulSoup4 | v4.12.0 | Parsing HTML/XML simples |
| **Article Extraction** | Trafilatura | v1.6.0 | Extração de conteúdo de artigos |
| **HTML5 Parser** | html5lib | v1.1 | Parsing HTML5 compliant |

##### API Connectors

| Categoria | Biblioteca | Versão | Uso |
|-----------|-----------|--------|-----|
| **HTTP/2 Client** | httpx | v0.26.0 | Async HTTP/2, moderno |
| **Async HTTP** | aiohttp | v3.9.0 | Async I/O, WebSockets |
| **Sync HTTP** | requests | v2.31.0 | Fallback sync, legacy APIs |
| **gRPC** | grpcio | v1.60.0 | gRPC clients |
| **GraphQL** | gql[all] | v3.5.0 | GraphQL queries |
| **OAuth/JWT** | authlib + python-jose | v1.3.0 + v3.3.0 | Autenticação |

##### Retry & Rate Limiting

| Categoria | Biblioteca | Versão | Uso |
|-----------|-----------|--------|-----|
| **Retry Logic** | tenacity | v8.2.3 | Exponential backoff, retry |
| **Rate Limiting** | aiolimiter | v1.1.0 | Async rate limiting |

#### NLP & Embeddings

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **NLP Framework** | spaCy | v3.7.4 | Extração de entidades, POS tagging |
| **Embeddings** | sentence-transformers | v2.3.1 | Self-hosted, multilingual |

#### Observability

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Metrics** | prometheus-client | v0.19.0 | Métricas Python |
| **Tracing** | OpenTelemetry | v1.21.0 | Distributed tracing |

#### Utilities

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Validation** | pydantic | v2.6.0 | Type-safe data validation |
| **JSON Schema** | jsonschema | v4.20.0 | Validação JSON Schema |
| **Environment** | python-dotenv | v1.0.0 | .env file loading |
| **File Type Detection** | python-magic | v0.4.27 | MIME type detection |

---

### requirements.txt COMPLETO

```txt
# ============================================================================
# SUPERCORE AI/ML/RAG STACK - UNIFIED (All Phases)
# ============================================================================

# ─────────────────────────────────────────────────────────────────────────
# API Framework
# ─────────────────────────────────────────────────────────────────────────
fastapi==0.110.0
uvicorn[standard]==0.27.0

# ─────────────────────────────────────────────────────────────────────────
# LLMs (Self-hosted Primary, Claude Fallback)
# ─────────────────────────────────────────────────────────────────────────
vllm==0.3.2                    # Production LLM serving
ollama-python==0.1.5           # Development LLM (local)
anthropic==0.18.0              # Claude Opus 4.5 (FALLBACK ONLY)
openai==1.12.0                 # Compatibility layer (embeddings)

# ─────────────────────────────────────────────────────────────────────────
# Orchestration & Agents
# ─────────────────────────────────────────────────────────────────────────
langgraph==0.0.20              # Multi-agent orchestration
langchain-core==0.1.23         # LLM abstractions

# ─────────────────────────────────────────────────────────────────────────
# Databases & Graph
# ─────────────────────────────────────────────────────────────────────────
pgvector==0.2.4                # PostgreSQL vector extension
nebula3-python==3.5.0          # NebulaGraph client
psycopg2-binary==2.9.9         # PostgreSQL driver

# ─────────────────────────────────────────────────────────────────────────
# Document Processing - Textual Documents
# ─────────────────────────────────────────────────────────────────────────
pymupdf==1.23.0                # PDF extraction
markdown==3.5.1                # Markdown parsing
python-docx==1.1.0             # Word (.docx)
odfpy==1.4.1                   # OpenDocument (ODT, ODS, ODP)
striprtf==0.0.26               # RTF
textract==1.6.5                # Universal extractor (DOC, PPT, etc)

# ─────────────────────────────────────────────────────────────────────────
# Spreadsheets & Tabular Data
# ─────────────────────────────────────────────────────────────────────────
pandas==2.1.4                  # CSV, TSV, Excel
openpyxl==3.1.2                # Excel (.xlsx)
xlrd==2.0.1                    # Excel legacy (.xls)
gspread==5.12.0                # Google Sheets API
oauth2client==4.1.3            # Google OAuth

# ─────────────────────────────────────────────────────────────────────────
# Images (OCR + Processing)
# ─────────────────────────────────────────────────────────────────────────
pytesseract==0.3.10            # OCR engine
pillow==10.2.0                 # Image processing
opencv-python==4.9.0           # Image preprocessing
cairosvg==2.7.1                # SVG to raster
svglib==1.5.1                  # SVG parsing

# ─────────────────────────────────────────────────────────────────────────
# Presentations
# ─────────────────────────────────────────────────────────────────────────
python-pptx==0.6.23            # PowerPoint (.pptx)

# ─────────────────────────────────────────────────────────────────────────
# Structured Data (JSON, XML, Parquet, Avro)
# ─────────────────────────────────────────────────────────────────────────
lxml==5.0.0                    # XML parsing (fast)
xmltodict==0.13.0              # XML to dict
pyarrow==14.0.2                # Parquet, Arrow
fastavro==1.9.0                # Avro (schema evolution)
pyyaml==6.0.1                  # YAML
toml==0.10.2                   # TOML

# ─────────────────────────────────────────────────────────────────────────
# Compressed Files
# ─────────────────────────────────────────────────────────────────────────
rarfile==4.1                   # RAR extraction
py7zr==0.20.8                  # 7-Zip

# ─────────────────────────────────────────────────────────────────────────
# Emails
# ─────────────────────────────────────────────────────────────────────────
extract-msg==0.45.0            # Outlook .msg files

# ─────────────────────────────────────────────────────────────────────────
# Multimedia (Audio/Video Transcription)
# ─────────────────────────────────────────────────────────────────────────
openai-whisper==20231117       # Speech-to-text (self-hosted)
pydub==0.25.1                  # Audio manipulation
ffmpeg-python==0.2.0           # Video/audio conversion
pysrt==1.1.2                   # SRT subtitles
webvtt-py==0.4.6               # WebVTT subtitles

# ─────────────────────────────────────────────────────────────────────────
# NLP & Embeddings
# ─────────────────────────────────────────────────────────────────────────
spacy==3.7.4                   # NLP (entity extraction)
sentence-transformers==2.3.1   # Self-hosted embeddings

# ─────────────────────────────────────────────────────────────────────────
# Web Scraping
# ─────────────────────────────────────────────────────────────────────────
playwright==1.40.0             # Browser automation (JS-heavy sites)
beautifulsoup4==4.12.0         # HTML parsing
scrapy==2.11.0                 # Web crawling framework
trafilatura==1.6.0             # Article extraction
html5lib==1.1                  # HTML5 parser

# ─────────────────────────────────────────────────────────────────────────
# API Connectors
# ─────────────────────────────────────────────────────────────────────────
httpx==0.26.0                  # Async HTTP/2 client
aiohttp==3.9.0                 # Async HTTP
requests==2.31.0               # Sync HTTP (fallback)
grpcio==1.60.0                 # gRPC client
gql[all]==3.5.0                # GraphQL client
authlib==1.3.0                 # OAuth/OpenID
python-jose==3.3.0             # JWT
tenacity==8.2.3                # Retry logic
aiolimiter==1.1.0              # Rate limiting

# ─────────────────────────────────────────────────────────────────────────
# Streaming & Queue
# ─────────────────────────────────────────────────────────────────────────
apache-flink==1.18.0           # Stream processing
pulsar-client==3.4.0           # Message broker
celery==5.3.0                  # Task queue
redis==5.0.0                   # Cache/pub-sub

# ─────────────────────────────────────────────────────────────────────────
# Object Storage
# ─────────────────────────────────────────────────────────────────────────
minio==7.2.3                   # S3-compatible storage

# ─────────────────────────────────────────────────────────────────────────
# Fine-tuning (LoRA)
# ─────────────────────────────────────────────────────────────────────────
peft==0.7.1                    # Parameter-Efficient Fine-Tuning
transformers==4.36.0           # HuggingFace transformers
torch==2.1.2                   # PyTorch
accelerate==0.25.0             # Training acceleration

# ─────────────────────────────────────────────────────────────────────────
# Observability
# ─────────────────────────────────────────────────────────────────────────
prometheus-client==0.19.0      # Metrics
opentelemetry-api==1.21.0      # Tracing API
opentelemetry-sdk==1.21.0      # Tracing SDK

# ─────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────
pydantic==2.6.0                # Data validation
jsonschema==4.20.0             # JSON Schema validation
python-dotenv==1.0.0           # .env loading
python-magic==0.4.27           # MIME type detection
```

---

### Dockerfile - AI Services (System Dependencies)

```dockerfile
FROM python:3.11-slim

# System dependencies for document processing
RUN apt-get update && apt-get install -y \
    # Tesseract OCR + languages
    tesseract-ocr \
    tesseract-ocr-por \
    tesseract-ocr-eng \
    # FFmpeg (audio/video)
    ffmpeg \
    # Image processing
    libmagic1 \
    # PDF tools
    poppler-utils \
    # Graphics libraries
    libcairo2-dev \
    libpango1.0-dev \
    # ZIP/RAR
    unrar-free \
    p7zip-full \
    # Build tools
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium firefox

# Download spaCy model
RUN python -m spacy download pt_core_news_lg

WORKDIR /app
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]
```

---

### docker-compose.yml COMPLETO (Todas as Fases)

```yaml
version: '3.8'

networks:
  supercore-network:
    driver: bridge

volumes:
  postgres_data:
  nebula_metad_data:
  nebula_storaged_data:
  minio_data:
  redis_data:
  pulsar_data:
  prometheus_data:
  grafana_data:

services:
  # ─────────────────────────────────────────────────────────────────────
  # PostgreSQL (with pgvector)
  # ─────────────────────────────────────────────────────────────────────
  postgres:
    image: pgvector/pgvector:pg15
    container_name: supercore-postgres
    environment:
      POSTGRES_DB: supercore_dev
      POSTGRES_USER: supercore
      POSTGRES_PASSWORD: supercore_dev_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/migrations:/docker-entrypoint-initdb.d
    networks:
      - supercore-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U supercore"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────────────────────────────────
  # NebulaGraph (metad + storaged + graphd)
  # ─────────────────────────────────────────────────────────────────────
  nebula-metad:
    image: vesoft/nebula-metad:v3.7.0
    container_name: supercore-nebula-metad
    environment:
      USER: root
      TZ: UTC
    command:
      - --meta_server_addrs=nebula-metad:9559
      - --local_ip=nebula-metad
      - --ws_ip=nebula-metad
      - --port=9559
    volumes:
      - nebula_metad_data:/data/meta
    networks:
      - supercore-network
    restart: on-failure

  nebula-storaged:
    image: vesoft/nebula-storaged:v3.7.0
    container_name: supercore-nebula-storaged
    environment:
      USER: root
      TZ: UTC
    command:
      - --meta_server_addrs=nebula-metad:9559
      - --local_ip=nebula-storaged
      - --ws_ip=nebula-storaged
      - --port=9779
    depends_on:
      - nebula-metad
    volumes:
      - nebula_storaged_data:/data/storage
    networks:
      - supercore-network
    restart: on-failure

  nebula-graphd:
    image: vesoft/nebula-graphd:v3.7.0
    container_name: supercore-nebula-graphd
    environment:
      USER: root
      TZ: UTC
    command:
      - --meta_server_addrs=nebula-metad:9559
      - --local_ip=nebula-graphd
      - --ws_ip=nebula-graphd
      - --port=9669
    depends_on:
      - nebula-metad
      - nebula-storaged
    ports:
      - "9669:9669"
    networks:
      - supercore-network
    restart: on-failure

  # ─────────────────────────────────────────────────────────────────────
  # Redis (Cache + Queue)
  # ─────────────────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: supercore-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - supercore-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ─────────────────────────────────────────────────────────────────────
  # MinIO (Object Storage)
  # ─────────────────────────────────────────────────────────────────────
  minio:
    image: minio/minio:latest
    container_name: supercore-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - supercore-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # ─────────────────────────────────────────────────────────────────────
  # Apache Pulsar v3.4.0 (Message Broker)
  # Multi-tenancy nativo, geo-replication, schema registry
  # Usado na Fase 2 para integração bidirecional MCP Agents ↔ Frontend
  # ─────────────────────────────────────────────────────────────────────
  pulsar:
    image: apachepulsar/pulsar:3.4.0
    container_name: supercore-pulsar
    command: bin/pulsar standalone
    ports:
      - "6650:6650"  # Pulsar binary protocol
      - "8080:8080"  # Pulsar HTTP admin
    volumes:
      - pulsar_data:/pulsar/data
    networks:
      - supercore-network
    environment:
      - PULSAR_MEM="-Xms512m -Xmx2048m"
      - PULSAR_GC="-XX:+UseG1GC"
    healthcheck:
      test: ["CMD", "bin/pulsar-admin", "brokers", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ─────────────────────────────────────────────────────────────────────
  # Ollama (Development LLM)
  # ─────────────────────────────────────────────────────────────────────
  ollama:
    image: ollama/ollama:latest
    container_name: supercore-ollama
    ports:
      - "11434:11434"
    volumes:
      - ./ollama_models:/root/.ollama
    networks:
      - supercore-network
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # ─────────────────────────────────────────────────────────────────────
  # vLLM (Production LLM Serving)
  # ─────────────────────────────────────────────────────────────────────
  vllm:
    image: vllm/vllm-openai:latest
    container_name: supercore-vllm
    command: --model meta-llama/Llama-3-70b-hf --tensor-parallel-size 2
    ports:
      - "8000:8000"
    volumes:
      - ./vllm_models:/models
    networks:
      - supercore-network
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 2
              capabilities: [gpu]

  # ─────────────────────────────────────────────────────────────────────
  # Apache Flink (Stream Processing)
  # ─────────────────────────────────────────────────────────────────────
  flink-jobmanager:
    image: flink:1.18-scala_2.12
    container_name: supercore-flink-jobmanager
    command: jobmanager
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: flink-jobmanager
    ports:
      - "8081:8081"
    networks:
      - supercore-network

  flink-taskmanager:
    image: flink:1.18-scala_2.12
    container_name: supercore-flink-taskmanager
    command: taskmanager
    depends_on:
      - flink-jobmanager
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: flink-jobmanager
        taskmanager.numberOfTaskSlots: 4
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # Backend (Go)
  # ─────────────────────────────────────────────────────────────────────
  backend:
    build: ./backend
    container_name: supercore-backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: supercore_dev
      DB_USER: supercore
      DB_PASSWORD: supercore_dev_2024
      NEBULA_GRAPH_HOST: nebula-graphd
      NEBULA_GRAPH_PORT: 9669
      REDIS_HOST: redis
      REDIS_PORT: 6379
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    depends_on:
      - postgres
      - nebula-graphd
      - redis
      - minio
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # Frontend (Next.js)
  # ─────────────────────────────────────────────────────────────────────
  frontend:
    build: ./frontend
    container_name: supercore-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - backend
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # AI Services (Python/FastAPI)
  # ─────────────────────────────────────────────────────────────────────
  ai-services:
    build: ./ai-services
    container_name: supercore-ai-services
    ports:
      - "8081:8081"
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: supercore_dev
      POSTGRES_USER: supercore
      POSTGRES_PASSWORD: supercore_dev_2024
      NEBULA_GRAPH_HOST: nebula-graphd
      NEBULA_GRAPH_PORT: 9669
      REDIS_HOST: redis
      REDIS_PORT: 6379
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
      PULSAR_URL: pulsar://pulsar:6650
      OLLAMA_HOST: http://ollama:11434
      VLLM_HOST: http://vllm:8000
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      - postgres
      - nebula-graphd
      - redis
      - minio
      - pulsar
      - ollama
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # Celery Worker
  # ─────────────────────────────────────────────────────────────────────
  celery-worker:
    build: ./ai-services
    container_name: supercore-celery-worker
    command: celery -A tasks worker --loglevel=info --concurrency=4
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      MINIO_ENDPOINT: minio:9000
    depends_on:
      - redis
      - postgres
      - minio
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # Prometheus (Metrics)
  # ─────────────────────────────────────────────────────────────────────
  prometheus:
    image: prom/prometheus:latest
    container_name: supercore-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    volumes:
      - ./observability/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - supercore-network

  # ─────────────────────────────────────────────────────────────────────
  # Grafana (Dashboards)
  # ─────────────────────────────────────────────────────────────────────
  grafana:
    image: grafana/grafana:latest
    container_name: supercore-grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./observability/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus
    networks:
      - supercore-network
```

---

## 🚫 Tecnologias Explicitamente NÃO Utilizadas

### Apache Iceberg

**Decisão**: ❌ **NÃO usar**

**Justificativa**:
- **Overkill para nosso caso**: Iceberg resolve problemas de schema evolution em data lakes massivos (petabytes)
- **PostgreSQL + JSONB suficiente**: Já temos schema evolution nativo via JSONB + `object_definitions.version`
- **state_history substitui time travel**: Já temos versionamento completo de dados via FSM + state_history
- **Complexidade desnecessária**: Adiciona layer extra (metastore, snapshots) sem valor proporcional
- **Performance**: PostgreSQL com índices é mais rápido para nossos volumes (< 10TB)

**Alternativa SuperCore**:
```sql
-- Schema evolution via object_definitions.version
UPDATE object_definitions SET version = version + 1, schema = new_schema;

-- Time travel via state_history
SELECT data FROM state_history
WHERE instance_id = 'uuid-123'
  AND changed_at <= '2024-01-01'::timestamp
ORDER BY changed_at DESC LIMIT 1;
```

### Apache Spark

**Decisão**: ❌ **NÃO usar**

**Justificativa**:
- **Flink superior para streaming**: Flink tem latência menor (<100ms vs ~1s Spark Streaming), state management melhor
- **PostgreSQL suficiente para batch**: Nossos volumes batch (<1TB por dia) são perfeitamente processáveis pelo PostgreSQL
- **Memória**: Spark é memory-hungry (mínimo 8GB por executor), Flink é mais eficiente
- **Complexidade**: Spark requer cluster manager (YARN/Mesos/K8s), Flink standalone é mais simples
- **Use case errado**: Spark brilha em analytics ad-hoc (SQL queries em Parquet), não é nosso foco

**Alternativa SuperCore**:
```python
# Real-time ETL: Apache Flink
from pyflink.datastream import StreamExecutionEnvironment

env = StreamExecutionEnvironment.get_execution_environment()
ds = env.add_source(PulsarSource(...))
ds.map(lambda x: process_document(x)) \
  .add_sink(PostgreSQLSink(...))
env.execute()

# Batch processing: PostgreSQL + Celery
@celery.task
def batch_process_documents(batch_ids):
    docs = pg.query("SELECT * FROM instances WHERE id = ANY(%s)", batch_ids)
    for doc in docs:
        process(doc)
```

**Comparação (streaming)**:

| Aspecto | Flink | Spark Streaming | Vencedor |
|---------|-------|-----------------|----------|
| **Latência** | <100ms | ~1s | ✅ Flink |
| **State Management** | Nativo, checkpoints | RDD-based, limitado | ✅ Flink |
| **Backpressure** | Automático | Manual | ✅ Flink |
| **Exatamente-once** | Nativo | Necessita configuração | ✅ Flink |
| **Memória** | Eficiente | Memory-hungry | ✅ Flink |

**Conclusão**: Flink + PostgreSQL cobrem 100% dos casos de uso. Iceberg e Spark adicionariam complexidade sem benefícios.

---

## 📊 Evolução por Fase (Stack Unificado)

### Fase 0: Oracle Configuration (1 semana)

**Stack usado**: Backend (Go) + Frontend (Next.js) + PostgreSQL

**Serviços ativos**:
- ✅ PostgreSQL (pgvector habilitado, mas não usado ainda)
- ✅ Backend Go (API REST)
- ✅ Frontend Next.js
- ⏸️ NebulaGraph (instalado, aguardando dados)
- ⏸️ AI Services (instalado, aguardando uso)

**Uso**:
- Configurar identidade da plataforma (CNPJ, licenças, integrações, políticas)
- CRUD de configurações via API REST
- UI para gerenciar Oracle config

---

### Fase 1: AI-Driven Context Generator (4 semanas)

**Stack usado**: **TODA a stack** (primeira vez que TUDO é usado)

**Serviços ativos**:
- ✅ PostgreSQL + pgvector (embeddings de documentos)
- ✅ NebulaGraph (relacionamentos entre objetos)
- ✅ MinIO (storage de PDFs, imagens, vídeos)
- ✅ Apache Pulsar (eventos de upload, processamento)
- ✅ Ollama/vLLM (extração de contexto, Vision API)
- ✅ Celery + Redis (processamento assíncrono)
- ✅ UniversalFileProcessor (30+ formatos)
- ✅ Playwright + httpx (web scraping, API connectors)

**Uso**:
- Upload multi-modal (PDFs, imagens, planilhas, vídeos)
- Extração de texto (OCR com Tesseract)
- Transcrição de áudio (Whisper)
- Parsing de documentos BACEN (PyMuPDF)
- Web scraping de sites regulatórios (Playwright + Scrapy)
- Armazenamento em MinIO (Bronze layer)
- Processamento com Flink (Silver layer)
- Embeddings + PostgreSQL + NebulaGraph (Gold layer)

**Complexidade**: Média (1-2 workers Celery, 1 nó Flink)

---

### Fase 2: Specification Generation (3 semanas)

**Stack usado**: Mesma stack, **sem novas dependências**

**Serviços ativos**: Todos da Fase 1 +
- ✅ LangGraph (orquestração de iterações LLM ↔ Usuário)
- ✅ vLLM (geração de especificações)

**Uso**:
- LLM processa contexto (Gold layer) e gera specs Markdown
- Editor Markdown com preview
- Chat iterativo com LLM (LangGraph multi-turn)
- Versionamento de especificações (PostgreSQL state_history)

**Complexidade**: Média (adiciona 1-2 workers LangGraph)

---

### Fase 3: Object Graph Generation (6 semanas)

**Stack usado**: Mesma stack, **escala horizontal**

**Serviços ativos**: Todos da Fase 2 +
- ✅ NebulaGraph (agora com MUITOS relacionamentos)
- ✅ Apache Flink (ETL para gerar object_definitions)

**Uso**:
- LLM processa spec aprovada e gera:
  - object_definitions (PostgreSQL)
  - validation_rules (PostgreSQL)
  - integracoes_externas (PostgreSQL)
  - process_definitions (PostgreSQL + NebulaGraph)
  - Relationships massivos (NebulaGraph)
- Deploy de MCP Action Agents (Kubernetes)

**Complexidade**: Alta (4-6 workers Celery, 2-3 nós Flink, cluster NebulaGraph 3 nós)

---

### Fase 4: Production (9 semanas)

**Stack usado**: Mesma stack, **otimizações de produção**

**Mudanças**:
- ✅ PostgreSQL managed (RDS/CloudSQL) com 3 réplicas read
- ✅ NebulaGraph cluster 5 nós (HA)
- ✅ vLLM com 4 GPUs (tensor parallelism)
- ✅ Flink cluster 10 nós
- ✅ Kubernetes (managed EKS/GKE/AKS)
- ✅ Prometheus + Grafana (observability completa)
- ✅ Integrações reais (TigerBeetle, BACEN SPI, Anti-Fraude)

**Complexidade**: Produção (HA, auto-scaling, monitoring)

**SEM MIGRAÇÕES**: Apenas escala horizontal e otimizações de infra.

---

## 🔄 Política de Upgrades

### Quando Atualizar Versões

1. **Major versions**: Apenas se houver breaking changes críticos (raro)
2. **Minor versions**: A cada 2-3 sprints (se compatível)
3. **Patch versions**: Imediatamente (security fixes)

### Testes Obrigatórios Antes de Upgrade

- [ ] Testes unitários passando (100%)
- [ ] Testes de integração passando (100%)
- [ ] Testes E2E passando (cenário crítico)
- [ ] Performance não degradada (< 5%)
- [ ] Compatibility check com dependências

---

## 🌍 Ambientes

### Development (Local)

```yaml
# docker-compose.dev.yml
# Usa Ollama (LLM local), 1 worker Celery, 1 nó Flink
services:
  ollama: # LLM
  postgres: # Single node
  nebula-graphd: # Single node
  flink-jobmanager: # Single node
  celery-worker: # 1 worker
```

### Staging (Kubernetes)

```yaml
# k8s/staging/
# Usa vLLM (1 GPU), 2 workers Celery, 2 nós Flink
replicas:
  postgres: 1
  nebula-graphd: 1
  vllm: 1 (1 GPU)
  flink-taskmanager: 2
  celery-worker: 2
```

### Production (Kubernetes)

```yaml
# k8s/production/
# Usa vLLM (4 GPUs), 10 workers Celery, 10 nós Flink, HA completo
replicas:
  postgres: 3 (1 write, 2 read)
  nebula-metad: 3
  nebula-storaged: 5
  nebula-graphd: 3
  vllm: 2 (4 GPUs cada)
  flink-taskmanager: 10
  celery-worker: 10
  redis: 3 (cluster mode)
  pulsar: 3 (cluster mode)
```

**Escalabilidade**:
- **Horizontal**: Adicionar mais nós (mesma tecnologia)
- **Vertical**: Aumentar CPU/RAM/GPU por nó
- **ZERO migrações**: Mesma stack, apenas escala

---

## 📚 Referências

- [Visão Consolidada](VISAO_FINAL_CONSOLIDADA.md) - ⭐⭐⭐ Arquitetura completa
- [Visão de Arquitetura](visao_arquitetura.md) - Resumo estratégico
- [CLAUDE.md](../../CLAUDE.md) - Guia de implementação master
- [Backlog Geral](../backlog/backlog_geral.md) - Status do projeto
- [Especificações Fase 1](../fases/fase1/01_especificacoes.md) - Specs técnicas
- [Squad de Agents](../fases/fase1/squad/06_squad_agents.md) - Composição da squad

---

## 🎯 Uso Recomendado

### Para Scrum Master Agent

```
1. Validar que sprint planning usa tecnologias DESTA lista
2. Bloquear PRs que adicionem dependências não aprovadas
3. Garantir que TODAS as fases usam MESMA stack
4. Referenciar este documento em DoD (Definition of Done)
```

### Para Orchestration Agent

```
1. Consultar docker-compose.yml para decisões de deploy
2. Usar go.mod, requirements.txt, package.json EXATOS
3. NUNCA sugerir tecnologias alternativas sem aprovação formal
4. Escalar horizontalmente (mais nós), NÃO trocar tecnologia
```

### Para Backend/Frontend/AI Agents

```
1. Copiar go.mod, requirements.txt, package.json desta spec
2. Usar EXATAMENTE as versões listadas
3. Em dúvida, consultar "Justificativa" na tabela
4. Reportar incompatibilidades em 02_duvidas_especificacoes.md
```

### Para DevOps Agent

```
1. Usar docker-compose.yml como base para setup
2. Escalar serviços conforme fase (dev: 1 nó, prod: N nós)
3. Manter MESMA stack em todos os ambientes
4. Configurar observability (Prometheus + Grafana)
```

---

**Versão**: 2.0.0
**Última atualização**: 2025-12-11
**Status**: ✅ **APROVADO** - Stack unificado para todas as fases (0-4)

**Princípio Fundamental**: Uma stack, zero migrações, escalabilidade horizontal.

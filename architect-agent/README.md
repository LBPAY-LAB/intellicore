# Architect Agent - Fase 2 (Brain)

> **"O agente que lê documentos do BACEN e gera object_definitions automaticamente"**

## 🎯 Objetivo

O Architect Agent é o cérebro da plataforma que permite ao time de Produto/Compliance criar objetos de negócio a partir de documentos normativos (PDFs do BACEN, manuais, circulares) **sem escrever código**.

## 🧠 Como Funciona

```
PDF BACEN → Document Intelligence → Entity Extraction → Schema Generation → object_definition
    ↓              ↓                      ↓                    ↓                  ↓
Circular      Extração de          Identificação de      Geração via         Salvo no
  3.978       texto + tabelas      entidades (NLP)       Claude Opus 4       PostgreSQL
```

## 📦 Componentes

### 1. Document Intelligence Engine
- **PDF Parsing**: PyMuPDF (texto), pdfplumber (tabelas), Tesseract (OCR)
- **Estrutura**: Detecta capítulos, seções, listas, requisitos
- **Tabelas**: Camelot para extração avançada de tabelas
- **Output**: `DocumentStructure` (JSON estruturado)

### 2. Entity Extraction
- **NLP**: spaCy com modelo `pt_core_news_lg` (português)
- **Entidades**: Identifica objetos de negócio (Cliente, Conta, Transação)
- **Relacionamentos**: Detecta verbos de ligação (TITULAR_DE, PERTENCE_A)
- **Output**: Lista de entidades + relacionamentos

### 3. Schema Generation Engine
- **LLM**: Claude Opus 4 (anthropic SDK)
- **Prompt Engineering**: Templates especializados para JSON Schema
- **Context**: RAG com objetos existentes (evita duplicação)
- **Validação**: JSON Schema Draft 7 compliance
- **Output**: `object_definition` completo

### 4. Knowledge Base
- **Vector Store**: pgvector (PostgreSQL extension)
- **Embeddings**: OpenAI text-embedding-3-large (1536 dimensions)
- **Semantic Search**: Busca documentos similares (threshold: 0.7)
- **Indexing**: Celery task para indexação assíncrona

### 5. BACEN Crawler
- **Web Scraping**: BeautifulSoup + Scrapy
- **Monitoring**: Verifica atualizações diárias
- **Notificações**: Alerta quando nova circular publicada
- **Storage**: Salva PDFs em `/tmp` e referência no banco

### 6. Review Queue (UI)
- **Frontend**: Next.js 14 com lista de objetos gerados
- **Aprovação**: Product Manager revisa e aprova/rejeita
- **Edição**: Pode editar schema/FSM antes de aprovar
- **Histórico**: Auditoria de todas as gerações

## 🚀 Quick Start

### 1. Instalação

```bash
# Clone o repositório
cd supercore/architect-agent

# Instalar dependências (Poetry)
poetry install

# Ativar ambiente virtual
poetry shell

# Baixar modelo spaCy português
python -m spacy download pt_core_news_lg

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais (ANTHROPIC_API_KEY, OPENAI_API_KEY)
```

### 2. Rodar Migrations

```bash
# Criar tabelas no PostgreSQL
alembic upgrade head
```

### 3. Iniciar Serviços

```bash
# Terminal 1: API FastAPI
uvicorn src.api.main:app --reload --port 8000

# Terminal 2: Celery Worker
celery -A src.celery_app worker --loglevel=info

# Terminal 3: Celery Beat (agendamento)
celery -A src.celery_app beat --loglevel=info
```

### 4. Testar Upload de PDF

```bash
# Upload de PDF do BACEN
curl -X POST http://localhost:8000/api/v1/architect/upload \
  -F "file=@circular_3978.pdf" \
  -F "document_type=circular_bacen"

# Response:
{
  "task_id": "abc-123-def",
  "status": "processing",
  "message": "Documento enviado para análise"
}

# Verificar status
curl http://localhost:8000/api/v1/architect/tasks/abc-123-def

# Response (após processamento):
{
  "task_id": "abc-123-def",
  "status": "completed",
  "result": {
    "generated_objects": [
      {
        "name": "transacao_pix",
        "display_name": "Transação PIX",
        "confidence": 0.92,
        "schema": {...},
        "fsm": {...}
      }
    ]
  }
}
```

## 📁 Estrutura do Projeto

```
architect-agent/
├── src/
│   ├── document_intelligence/      # PDF parsing, OCR, table extraction
│   │   ├── __init__.py
│   │   ├── parser.py               # BACENDocumentParser
│   │   ├── ocr.py                  # TesseractOCR
│   │   ├── table_extractor.py      # CamelotTableExtractor
│   │   └── types.py                # DocumentStructure, Section
│   │
│   ├── entity_extraction/          # NLP with spaCy
│   │   ├── __init__.py
│   │   ├── extractor.py            # EntityExtractor
│   │   ├── relationship_detector.py
│   │   └── types.py                # Entity, Relationship
│   │
│   ├── schema_generation/          # LLM-based generation
│   │   ├── __init__.py
│   │   ├── generator.py            # SchemaGenerator
│   │   ├── prompts.py              # Prompt templates
│   │   ├── validator.py            # JSON Schema validator
│   │   └── types.py                # GeneratedObject
│   │
│   ├── knowledge_base/             # Vector store + RAG
│   │   ├── __init__.py
│   │   ├── embeddings.py           # OpenAIEmbeddings
│   │   ├── vector_store.py         # PgVectorStore
│   │   └── rag.py                  # RAGRetriever
│   │
│   ├── bacen_crawler/              # Web scraping
│   │   ├── __init__.py
│   │   ├── crawler.py              # BACENCrawler
│   │   ├── monitor.py              # UpdateMonitor
│   │   └── spiders/
│   │       └── bacen_spider.py
│   │
│   ├── api/                        # FastAPI REST API
│   │   ├── __init__.py
│   │   ├── main.py                 # App entrypoint
│   │   ├── routes/
│   │   │   ├── upload.py           # POST /upload
│   │   │   ├── tasks.py            # GET /tasks/:id
│   │   │   └── objects.py          # GET /generated-objects
│   │   └── dependencies.py
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── models.py               # SQLAlchemy models
│   │   └── session.py              # DB connection
│   │
│   ├── config.py                   # Settings (pydantic-settings)
│   ├── celery_app.py               # Celery configuration
│   └── logging_config.py           # Structured logging
│
├── tests/
│   ├── test_document_parser.py
│   ├── test_entity_extractor.py
│   ├── test_schema_generator.py
│   └── fixtures/
│       └── sample_bacen.pdf
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROMPTS.md                  # LLM prompts documentation
│   └── API.md
│
├── scripts/
│   ├── download_spacy_model.sh
│   └── seed_knowledge_base.py
│
├── alembic/                        # Database migrations
│   ├── versions/
│   └── env.py
│
├── pyproject.toml
├── .env.example
├── Dockerfile
└── README.md
```

## 🛠️ Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Language** | Python | 3.11+ |
| **Framework** | FastAPI | 0.104+ |
| **PDF Parsing** | PyMuPDF, pdfplumber | Latest |
| **OCR** | Tesseract | 5.x |
| **Table Extraction** | Camelot | 0.11+ |
| **NLP** | spaCy | 3.7+ |
| **LLM** | Claude Opus 4 (Anthropic) | Latest |
| **Embeddings** | OpenAI text-embedding-3-large | Latest |
| **Database** | PostgreSQL + pgvector | 15+ |
| **Task Queue** | Celery + Redis | 5.3+ / 7+ |
| **Web Scraping** | BeautifulSoup, Scrapy | Latest |
| **Testing** | pytest | 7.4+ |

## 📊 API Endpoints

### Upload de Documento

```http
POST /api/v1/architect/upload
Content-Type: multipart/form-data

{
  "file": <binary>,
  "document_type": "circular_bacen" | "resolucao_bacen" | "manual_bacen",
  "metadata": {
    "numero_normativo": "3978",
    "data_publicacao": "2020-01-23"
  }
}

Response 202 Accepted:
{
  "task_id": "uuid",
  "status": "processing",
  "message": "Documento enviado para análise"
}
```

### Status da Task

```http
GET /api/v1/architect/tasks/{task_id}

Response 200 OK:
{
  "task_id": "uuid",
  "status": "processing" | "completed" | "failed",
  "progress": {
    "step": "entity_extraction",
    "percentage": 60
  },
  "result": {
    "generated_objects": [...]
  },
  "error": null
}
```

### Lista de Objetos Gerados (Review Queue)

```http
GET /api/v1/architect/generated-objects?status=pending

Response 200 OK:
{
  "data": [
    {
      "id": "uuid",
      "name": "transacao_pix",
      "display_name": "Transação PIX",
      "source_document": "Circular 3978",
      "confidence": 0.92,
      "status": "pending_review",
      "schema": {...},
      "fsm": {...},
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Aprovar Objeto Gerado

```http
POST /api/v1/architect/generated-objects/{id}/approve

Response 200 OK:
{
  "object_definition_id": "uuid",
  "message": "Object definition criado com sucesso"
}
```

### Rejeitar Objeto Gerado

```http
POST /api/v1/architect/generated-objects/{id}/reject
Content-Type: application/json

{
  "reason": "Schema incorreto - falta campo 'chave_pix'"
}

Response 200 OK:
{
  "message": "Objeto rejeitado. Feedback será usado para melhorar a geração."
}
```

## 🧪 Testes

```bash
# Rodar todos os testes
pytest

# Com coverage
pytest --cov=src --cov-report=html

# Testes específicos
pytest tests/test_document_parser.py -v
```

## 📈 Métricas e Monitoring

### Prometheus Metrics

- `architect_documents_processed_total` - Total de documentos processados
- `architect_objects_generated_total` - Total de objetos gerados
- `architect_approval_rate` - Taxa de aprovação (aprovados / total)
- `architect_processing_duration_seconds` - Tempo de processamento por documento
- `architect_llm_tokens_used_total` - Tokens consumidos (Claude + OpenAI)

### Health Check

```http
GET /health

Response 200 OK:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "celery": "running",
  "spacy_model": "loaded"
}
```

## 🔒 Segurança

- **Upload Limits**: Máximo 50MB por arquivo
- **File Types**: Apenas PDF aceito
- **Virus Scan**: ClamAV scan antes de processar (opcional)
- **API Key**: Bearer token para autenticação
- **Rate Limiting**: 10 uploads por minuto por usuário

## 🚧 Roadmap - Sprint 7-14 (12 semanas)

- [x] Sprint 7-8: Document Intelligence Engine (PDF + OCR + Tabelas)
- [ ] Sprint 9-10: Schema Generation Engine (Claude Opus + Validation)
- [ ] Sprint 11: Knowledge Base (pgvector + RAG)
- [ ] Sprint 12: Review Queue UI (Next.js)
- [ ] Sprint 13: BACEN Crawler (Scrapy + Monitoring)
- [ ] Sprint 14: Integration & PIX Module (End-to-end test)

## 📞 Suporte

- **Docs**: `/docs` (Swagger UI)
- **Logs**: `logs/architect-agent.log`
- **Issues**: GitHub Issues

---

**Status**: 🚧 Em Desenvolvimento (Fase 2 - Sprint 7)
**Versão**: 0.1.0
**Última Atualização**: Janeiro 2025

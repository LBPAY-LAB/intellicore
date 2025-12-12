# Especificações Técnicas - Fase 1: AI-Driven Context Generator

**Status**: 🟢 Aprovado
**Versão**: 2.0.0
**Data**: 2025-12-11
**Aprovação**: ⏸️ Aguardando Aprovação

---

## 🔗 Referências Obrigatórias

> **⚠️ DOCUMENTO PRIMÁRIO**: Antes de qualquer implementação, leia:
>
> **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **ESSENCIAL**
>
> Este documento consolida a arquitetura completa incluindo AI-Driven Context Generator, RAG Trimodal Híbrido, 3 Pilares da Dynamic UI, e integração com Gateways.

**Documentos complementares**:
1. **[docs/architecture/visao_arquitetura.md](../../architecture/visao_arquitetura.md)** - Visão estratégica resumida
2. **[docs/architecture/stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)** - ⭐ **Stack master** (seção "Fase 1")
3. **[docs/fases/fase1/06_squad_agents.md](06_squad_agents.md)** - Squad de agents responsável
4. **[docs/fases/fase1/PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - ⭐ **Sprint planning com 43 cards**
5. **[docs/fases/fase1/07_mocks_ui_navegacao.md](07_mocks_ui_navegacao.md)** - Mocks de UI (5 telas)

---

## ⚠️ Stack Tecnológico

**Referência master**: [docs/architecture/stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)

Esta fase usa o stack definido na seção **"Fase 1: AI-Driven Context Generator (4 semanas)"** do documento master.

**CRÍTICO**: Use EXATAMENTE as versões especificadas no documento master:
- **Backend**: Go 1.21+, Gin v1.10.0, PostgreSQL 15+, Redis (task queue)
- **Frontend**: Next.js 14+, React 18+, shadcn/ui, Tailwind CSS
- **AI Services**: Python 3.11+, FastAPI v0.110+, PyMuPDF v1.23+, Anthropic Claude Vision API

❌ **NUNCA adicione dependências não listadas** no stack master sem aprovação formal.

---

## 1. Objetivo da Fase 1

Criar uma **interface de upload multi-modal** e um **orquestrador de processamento** que permita ao Time de Produto e Compliance fazer upload de documentação existente (PDFs BACEN, diagramas, prompts) para que a IA processe e extraia conhecimento estruturado.

### ✅ O Que É Esta Fase

- ✅ Interface web para upload de arquivos (PDFs, imagens, Mermaid, Whimsical)
- ✅ Campo de texto para "super prompt" descrevendo a solução desejada
- ✅ PDF Parser (PyMuPDF) que extrai seções, tabelas, listas de documentos BACEN
- ✅ Vision API (Anthropic Claude) que analisa diagramas e extrai entidades/relacionamentos
- ✅ ContextProcessorOrchestrator que coordena o processamento em background
- ✅ Background job system com retry e status em tempo real
- ✅ Armazenamento do resultado consolidado em `context_inputs.processed_data` (JSONB)

### ❌ O Que NÃO É Esta Fase

- ❌ Gerar object_definitions automaticamente (isso é **Fase 2: Specification Generation**)
- ❌ Criar instances ou relacionamentos (isso é **Fase 3: Object Graph Generation**)
- ❌ Renderizar UI dinâmica (isso é **Fase 5: Dynamic UI**)
- ❌ Integrar com BACEN/TigerBeetle/sistemas externos (isso é **Integração**)

---

## 2. Entregas Obrigatórias

### 2.1 Database Schema (PostgreSQL 15+)

#### Tabela: `context_inputs`

Armazena contextos de documentação uploaded pelo usuário.

```sql
CREATE TABLE context_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metadados
    name VARCHAR(200),
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,

    -- Arquivos uploaded (metadata)
    files_metadata JSONB NOT NULL,
    -- Exemplo: [
    --   {
    --     "file_id": "uuid-123",
    --     "filename": "circular_3978.pdf",
    --     "file_type": "pdf",
    --     "file_size": 2547890,
    --     "upload_path": "/data/uploads/uuid-123/circular_3978.pdf"
    --   },
    --   {
    --     "file_id": "uuid-456",
    --     "filename": "fluxo_pix.png",
    --     "file_type": "png",
    --     "file_size": 124567,
    --     "upload_path": "/data/uploads/uuid-123/fluxo_pix.png"
    --   }
    -- ]

    -- Super prompt (descrição da solução)
    super_prompt TEXT NOT NULL,

    -- Resultado do processamento (JSONB consolidado)
    processed_data JSONB,
    -- Exemplo: {
    --   "pdfs": [
    --     {
    --       "file": "circular_3978.pdf",
    --       "metadata": {"tipo": "Circular", "numero": "3978", "data": "2017-01-23"},
    --       "sections": [
    --         {"numero": "1", "titulo": "...", "conteudo": "..."},
    --         {"numero": "2", "titulo": "...", "conteudo": "..."}
    --       ],
    --       "tables": [...]
    --     }
    --   ],
    --   "diagrams": [
    --     {
    --       "file": "fluxo_pix.png",
    --       "diagram_type": "flowchart",
    --       "entities": ["Cliente", "Conta", "Transacao PIX"],
    --       "relationships": ["TITULAR_DE", "EXECUTA"],
    --       "flows": [...]
    --     }
    --   ],
    --   "prompt": "Criar Core Banking para IP com PIX..."
    -- }

    -- Status do processamento
    status VARCHAR(50) DEFAULT 'RASCUNHO',
    -- Estados possíveis: RASCUNHO, PROCESSANDO, SUCESSO, ERRO

    -- Logs de processamento
    processing_logs JSONB DEFAULT '[]'::jsonb,
    -- Exemplo: [
    --   {"timestamp": "2024-01-15T10:30:00Z", "step": "pdf_parsing", "status": "iniciado"},
    --   {"timestamp": "2024-01-15T10:30:15Z", "step": "pdf_parsing", "status": "concluido", "files_processed": 3},
    --   {"timestamp": "2024-01-15T10:30:20Z", "step": "vision_api", "status": "iniciado"}
    -- ]

    -- Error tracking
    error_details JSONB,
    -- Exemplo: {
    --   "error_type": "vision_api_timeout",
    --   "error_message": "Timeout ao processar fluxo_pix.png",
    --   "failed_at": "2024-01-15T10:35:00Z",
    --   "retry_count": 2
    -- }

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP
);
```

#### Tabela: `uploaded_files`

Detalhamento de cada arquivo uploaded.

```sql
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES context_inputs(id) ON DELETE CASCADE,

    -- Metadados do arquivo
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,  -- pdf, png, jpg, svg, txt, md, mermaid
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Armazenamento
    storage_path VARCHAR(500) NOT NULL,  -- Caminho no /data/uploads

    -- Hash para deduplicação
    file_hash VARCHAR(64),  -- SHA-256

    -- Status de processamento individual
    processing_status VARCHAR(50) DEFAULT 'PENDENTE',
    -- Estados: PENDENTE, PROCESSANDO, CONCLUIDO, ERRO

    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### Índices Obrigatórios

```sql
-- Busca rápida de contextos por status
CREATE INDEX idx_context_inputs_status ON context_inputs(status);

-- Busca por data de criação (ordenação padrão)
CREATE INDEX idx_context_inputs_created_at ON context_inputs(created_at DESC);

-- Busca em tags (GIN index para arrays JSONB)
CREATE INDEX idx_context_inputs_tags ON context_inputs USING GIN (tags jsonb_path_ops);

-- Relação context ← files
CREATE INDEX idx_uploaded_files_context ON uploaded_files(context_id);

-- Busca de arquivos por tipo
CREATE INDEX idx_uploaded_files_type ON uploaded_files(file_type);

-- Deduplicação por hash
CREATE INDEX idx_uploaded_files_hash ON uploaded_files(file_hash);
```

---

### 2.2 Backend API (Go 1.21+)

#### 6 Endpoints REST

**Context Upload (1 endpoint)**:
- `POST /api/v1/context/upload` - Upload de contexto (multipart/form-data)
  - Body: `files[]` (multipart files) + `super_prompt` (text) + `name` (text, opcional) + `tags[]` (array, opcional)
  - Response: `{id, name, files_count, status, created_at}`
  - Validações:
    - ✅ Tipos de arquivo aceitos: PDF, PNG, JPG, SVG, TXT, MD
    - ✅ Tamanho máximo por arquivo: 50MB
    - ✅ Super prompt obrigatório (min 100 caracteres)

**Context Retrieval (2 endpoints)**:
- `GET /api/v1/context/:id` - Buscar contexto por ID
  - Response: `{id, name, description, tags, files_metadata, super_prompt, processed_data, status, ...timestamps}`
  - Includes: Arquivos uploaded, status de processamento, resultado consolidado

- `GET /api/v1/context` - Listar contextos (paginado)
  - Query params: `?page=1&limit=20&status=SUCESSO&tags=pix,bacen`
  - Response: `{items: [...], total, page, limit}`

**Context Processing (2 endpoints)**:
- `POST /api/v1/context/:id/process` - Acionar processamento em background
  - Valida que status é RASCUNHO
  - Cria background job (Redis queue)
  - Atualiza status para PROCESSANDO
  - Response: `{job_id, status: "PROCESSANDO", estimated_duration_seconds: 120}`

- `GET /api/v1/context/:id/status` - Polling de status em tempo real
  - Response: `{status, progress_percentage, current_step, logs: [...]}`
  - Usado pelo frontend para atualização em tempo real

**Context Result (1 endpoint)**:
- `GET /api/v1/context/:id/result` - Buscar resultado processado
  - Valida que status é SUCESSO
  - Response: `{processed_data: {pdfs: [...], diagrams: [...], prompt: "..."}}`

---

### 2.3 AI Services (Python 3.11+)

#### 2.1 PDF Parser Service (FastAPI)

**Endpoint**: `POST /parse-pdf`

**Responsabilidade**: Extrair texto estruturado de PDFs BACEN (Circulares, Resoluções, Manuais).

**Input**:
```json
{
  "file_path": "/data/uploads/uuid-123/circular_3978.pdf"
}
```

**Output**:
```json
{
  "metadata": {
    "tipo_documento": "Circular",
    "numero": "3978",
    "data_publicacao": "2017-01-23",
    "titulo": "Dispõe sobre a política de prevenção à lavagem de dinheiro..."
  },
  "sections": [
    {
      "numero": "1",
      "titulo": "OBJETO",
      "conteudo": "Esta Circular dispõe sobre as políticas..."
    },
    {
      "numero": "2",
      "titulo": "APLICAÇÃO",
      "conteudo": "As instituições autorizadas pelo BACEN..."
    }
  ],
  "tables": [
    {
      "pagina": 5,
      "caption": "Tabela 1 - Limites de Transação",
      "headers": ["Tipo", "Limite Diurno", "Limite Noturno"],
      "rows": [
        ["PIX", "R$ 5.000", "R$ 1.000"],
        ["TED", "Sem limite", "Sem limite"]
      ]
    }
  ],
  "total_pages": 42,
  "total_words": 15234
}
```

**Stack**:
- PyMuPDF v1.23+ para parsing de PDF
- spaCy v3.7+ para NER (Named Entity Recognition) de metadados
- LLM (Claude 3.5 Sonnet) para identificar tipo de documento e estrutura

---

#### 2.2 Vision API Service (FastAPI)

**Endpoint**: `POST /analyze-diagram`

**Responsabilidade**: Analisar diagramas (Mermaid, Whimsical, fluxogramas, ERDs) e extrair entidades, relacionamentos, fluxos.

**Input**:
```json
{
  "image_path": "/data/uploads/uuid-123/fluxo_pix.png"
}
```

**Output**:
```json
{
  "diagram_type": "flowchart",
  "entities": [
    {"name": "Cliente", "type": "actor"},
    {"name": "Conta Corrente", "type": "data"},
    {"name": "Transação PIX", "type": "process"},
    {"name": "BACEN SPI", "type": "external_system"}
  ],
  "relationships": [
    {
      "from": "Cliente",
      "to": "Conta Corrente",
      "type": "TITULAR_DE",
      "cardinality": "1:N"
    },
    {
      "from": "Conta Corrente",
      "to": "Transação PIX",
      "type": "EXECUTA",
      "cardinality": "1:N"
    }
  ],
  "flows": [
    {
      "step": 1,
      "description": "Cliente inicia PIX via app",
      "from": "Cliente",
      "to": "App Mobile"
    },
    {
      "step": 2,
      "description": "App valida saldo e limites",
      "from": "App Mobile",
      "to": "Conta Corrente"
    }
  ],
  "annotations": [
    "Limite noturno: R$ 1.000",
    "Horário noturno: 20h-6h"
  ]
}
```

**Stack**:
- Anthropic Claude Vision API (Claude 3.5 Sonnet)
- Pillow (PIL) para pré-processamento de imagem
- Prompt engineering específico para diagramas técnicos/BACEN

---

### 2.4 Backend: ContextProcessorOrchestrator (Go)

**Responsabilidade**: Coordenar o processamento de um contexto em background.

**Fluxo de Processamento**:

```go
// internal/services/context_processor.go

type ContextProcessorOrchestrator struct {
    db                *sql.DB
    pdfParserClient   *ai.PDFParserClient
    visionAPIClient   *ai.VisionAPIClient
    redisQueue        *redis.Client
}

func (o *ContextProcessorOrchestrator) ProcessContext(ctx context.Context, contextID uuid.UUID) error {
    // 1. BUSCAR CONTEXT
    contextInput, err := o.getContext(ctx, contextID)
    if err != nil {
        return err
    }

    // 2. ATUALIZAR STATUS PARA PROCESSANDO
    err = o.updateStatus(ctx, contextID, "PROCESSANDO")
    if err != nil {
        return err
    }

    // 3. PROCESSAR CADA PDF
    var pdfsData []map[string]interface{}
    for _, fileMeta := range contextInput.FilesMetadata {
        if fileMeta["file_type"] == "pdf" {
            o.logProgress(ctx, contextID, "pdf_parsing", "iniciado", fileMeta["filename"])

            pdfResult, err := o.pdfParserClient.ParsePDF(ctx, fileMeta["upload_path"].(string))
            if err != nil {
                o.logProgress(ctx, contextID, "pdf_parsing", "erro", err.Error())
                return o.markError(ctx, contextID, "pdf_parsing_failed", err)
            }

            pdfsData = append(pdfsData, pdfResult)
            o.logProgress(ctx, contextID, "pdf_parsing", "concluido", fileMeta["filename"])
        }
    }

    // 4. PROCESSAR CADA DIAGRAMA/IMAGEM
    var diagramsData []map[string]interface{}
    for _, fileMeta := range contextInput.FilesMetadata {
        fileType := fileMeta["file_type"].(string)
        if fileType == "png" || fileType == "jpg" || fileType == "svg" {
            o.logProgress(ctx, contextID, "vision_api", "iniciado", fileMeta["filename"])

            diagramResult, err := o.visionAPIClient.AnalyzeDiagram(ctx, fileMeta["upload_path"].(string))
            if err != nil {
                o.logProgress(ctx, contextID, "vision_api", "erro", err.Error())
                // Não falha completamente - continua com outros arquivos
                o.logProgress(ctx, contextID, "vision_api", "pulado", fileMeta["filename"])
                continue
            }

            diagramsData = append(diagramsData, diagramResult)
            o.logProgress(ctx, contextID, "vision_api", "concluido", fileMeta["filename"])
        }
    }

    // 5. CONSOLIDAR RESULTADO
    processedData := map[string]interface{}{
        "pdfs":     pdfsData,
        "diagrams": diagramsData,
        "prompt":   contextInput.SuperPrompt,
    }

    // 6. SALVAR RESULTADO EM processed_data
    err = o.saveProcessedData(ctx, contextID, processedData)
    if err != nil {
        return o.markError(ctx, contextID, "save_failed", err)
    }

    // 7. ATUALIZAR STATUS PARA SUCESSO
    err = o.updateStatus(ctx, contextID, "SUCESSO")
    if err != nil {
        return err
    }

    o.logProgress(ctx, contextID, "completed", "sucesso", "")
    return nil
}
```

**Background Job System** (Redis):
- Usa Redis como task queue
- Worker pool (5 workers) que processa jobs em paralelo
- Retry automático (max 3 tentativas) em caso de falha temporária
- Timeout de 10 minutos por job

---

### 2.5 Frontend (Next.js 14+)

#### Páginas Obrigatórias

Conforme especificado em **[07_mocks_ui_navegacao.md](07_mocks_ui_navegacao.md)** (versão 2.0.0):

1. **Home / Dashboard**
   - Overview de contextos (total, processando, concluídos)
   - Últimos contextos criados
   - Botão "Novo Contexto"

2. **Novo Contexto (Upload Interface)**
   - FileUploader component (drag & drop)
   - Super prompt textarea (min 100 caracteres)
   - Preview de arquivos uploaded
   - Botão "Processar Contexto"

3. **Lista de Contextos**
   - Tabela com: Nome, Status, Data, Ações
   - StatusBadge colorido (RASCUNHO, PROCESSANDO, SUCESSO, ERRO)
   - Filtros: status, tags, data
   - Paginação

4. **Detalhes de Contexto**
   - 4 tabs:
     - **Visão Geral**: Metadados, arquivos uploaded, super prompt
     - **Status**: ProcessingTimeline com etapas em tempo real
     - **Resultado**: JSONViewer com processed_data
     - **Logs**: Lista de logs de processamento

5. **Processamento em Tempo Real** (Modal)
   - Progress bar (0-100%)
   - Lista de etapas: PDF Parsing → Vision API → Consolidação
   - Logs em tempo real via polling (`GET /api/v1/context/:id/status`)

#### Componentes Reutilizáveis

Conforme especificado em **[07_mocks_ui_navegacao.md](07_mocks_ui_navegacao.md)** (seção 3):

1. **FileUploader** - Drag & drop multi-file com preview
2. **FilePreview** - Preview visual de PDFs/imagens
3. **StatusBadge** - Badges coloridos por status
4. **ProcessingTimeline** - Timeline vertical de etapas
5. **JSONViewer** - Viewer interativo de JSON com syntax highlighting

---

## 3. Requisitos Não-Funcionais

### Performance

| Critério | Métrica Esperada |
|----------|------------------|
| Upload de arquivo | 50MB em < 10s (4G connection) |
| Latência API | p99 < 200ms (endpoints read) |
| PDF parsing | 1 PDF (50 páginas) em < 30s |
| Vision API | 1 diagrama em < 15s |
| Processamento completo | 3 PDFs + 1 diagrama em < 2 min |
| Polling de status | Response time < 100ms |

### Escalabilidade

- Suportar 100 contextos simultâneos em processamento
- Worker pool de 5 workers (background jobs)
- Storage: até 10GB de arquivos uploaded (primeira versão)

### Confiabilidade

- **Retry automático**: Max 3 tentativas para falhas temporárias (timeout, rate limit)
- **Idempotência**: Processar o mesmo contexto 2x não cria dados duplicados
- **Error handling**: Todas as falhas logadas em `processing_logs` e `error_details`
- **Transações ACID**: Upload de arquivos + criação de registro em DB são atômicos

### Segurança

- ❌ **SEM autenticação** nesta fase (será responsabilidade das aplicações)
- ✅ **File validation**:
  - Tipos permitidos: PDF, PNG, JPG, SVG, TXT, MD
  - Tamanho máximo: 50MB por arquivo
  - Virus scan: ClamAV opcional (futuro)
- ✅ **Input validation**:
  - Super prompt obrigatório (min 100, max 10.000 caracteres)
  - Sanitização de nomes de arquivo (sem caracteres especiais)
- ✅ **HTTPS obrigatório** em produção

---

## 4. Testes Obrigatórios

### Backend (Go)

- [ ] **Testes unitários** (coverage > 80%)
  - Upload handler
  - ContextProcessorOrchestrator
  - API clients (PDFParserClient, VisionAPIClient)

- [ ] **Testes de integração**
  - Upload → DB save → file storage
  - Process job → Redis queue → worker execution
  - API endpoints (todos os 6)

- [ ] **Testes de validação**
  - Rejeitar arquivo com tipo inválido
  - Rejeitar arquivo > 50MB
  - Rejeitar super_prompt vazio
  - Validar transições de status (RASCUNHO → PROCESSANDO → SUCESSO)

### AI Services (Python)

- [ ] **Testes unitários**
  - PDF Parser: extrair seções, tabelas, metadados
  - Vision API: extrair entidades, relacionamentos, fluxos

- [ ] **Testes de integração**
  - PDF Parser com PDFs BACEN reais
  - Vision API com diagramas Mermaid/Whimsical

- [ ] **Testes de performance**
  - PDF de 100 páginas em < 1 min
  - Diagrama complexo em < 30s

### Frontend (Next.js)

- [ ] **Testes de componentes** (React Testing Library)
  - FileUploader: drag & drop, preview
  - StatusBadge: cores corretas por status
  - ProcessingTimeline: atualização em tempo real

- [ ] **Testes E2E** (Playwright)
  - Upload de contexto completo (3 PDFs + 1 diagrama)
  - Processar contexto e aguardar SUCESSO
  - Visualizar resultado em JSONViewer

### Cenário Crítico (End-to-End)

**Teste completo**:

1. Usuário faz upload de:
   - 3 PDFs BACEN: Circular 3.978, Manual PIX v8.3, Resolução 80
   - 1 diagrama: fluxo_pix.png (Mermaid)
   - Super prompt: "Criar Core Banking para IP com PIX..."

2. Backend cria context_inputs (status: RASCUNHO)

3. Usuário clica "Processar Contexto"

4. Background job é criado (status: PROCESSANDO)

5. PDF Parser processa 3 PDFs (extrair seções, tabelas)

6. Vision API processa diagrama (extrair entidades: Cliente, Conta, Transação PIX)

7. Resultado consolidado salvo em `processed_data`

8. Status atualizado para SUCESSO

9. Frontend exibe resultado em JSONViewer

**Resultado esperado**:
- ✅ Todos os passos executam sem erro
- ✅ Processing time < 2 minutos
- ✅ `processed_data` contém 3 PDFs + 1 diagrama estruturados
- ✅ Logs de processamento completos

---

## 5. Critérios de Aceitação

### Deve Funcionar

- ✅ Upload de 10 arquivos (mix PDF/PNG) em uma única request
- ✅ Preview de PDF mostra primeira página
- ✅ Preview de imagem mostra thumbnail
- ✅ Super prompt aceita 10.000 caracteres
- ✅ Processamento de 3 PDFs BACEN extrai > 90% do texto
- ✅ Vision API identifica > 80% das entidades em diagrama simples
- ✅ Status em tempo real atualiza a cada 2 segundos (polling)
- ✅ JSONViewer renderiza resultado com syntax highlighting
- ✅ Retry automático funciona (simular timeout da Vision API)

### Não Deve Permitir

- ❌ Upload de arquivo .exe ou .zip
- ❌ Upload de arquivo > 50MB
- ❌ Processar contexto sem super_prompt
- ❌ Processar contexto já PROCESSANDO (evitar duplicação)
- ❌ Mostrar erro genérico (sempre mostrar detalhes em error_details)

---

## 6. Dependências

### Externas

- PostgreSQL 15+ (JSONB)
- Redis 7+ (task queue)
- Go 1.21+
- Python 3.11+
- Node.js 20+
- Docker + Docker Compose

### Integrações (Fase 1)

- **Anthropic Claude Vision API**: Análise de diagramas
  - API Key: `ANTHROPIC_API_KEY`
  - Modelo: `claude-3-5-sonnet-20241022`
  - Rate limit: 50 requests/minute

### Bloqueadores

- ⚠️ **Anthropic API Key** precisa ser fornecida antes de Sprint 2
- ⚠️ **Storage**: Decisão sobre onde armazenar arquivos (local disk vs S3)

---

## 7. Fora do Escopo (Fase 1)

**NÃO será implementado nesta fase**:

- ❌ Geração automática de `object_definitions` (Fase 2)
- ❌ Geração automática de `instances` (Fase 3)
- ❌ Dynamic UI generation (Fase 5)
- ❌ Autenticação/Autorização (responsabilidade das aplicações)
- ❌ Multi-tenancy
- ❌ Integrações externas (BACEN, TigerBeetle)
- ❌ Notificações (email, SMS, push)
- ❌ Export de resultado (PDF, DOCX) - apenas JSON viewer

---

## 8. Roadmap de Implementação

Conforme planejamento em **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)**:

### Sprint 1: Infraestrutura Base + Upload Interface (1 semana)
- Database schema (`context_inputs`, `uploaded_files`)
- Backend API (upload endpoint)
- Frontend (página de upload, FileUploader component)
- **10 cards Kanban** distribuídos entre 8 agents

### Sprint 2: PDF Parser + Vision API Integration (1 semana)
- AI Services (pdf-parser, vision-api)
- Backend clients (PDFParserClient, VisionAPIClient)
- Frontend (botão processar, status real-time)
- **9 cards Kanban**

### Sprint 3: ContextProcessorOrchestrator + Background Jobs (1 semana)
- ContextProcessorOrchestrator service (Go)
- Background job system (Redis task queue)
- Melhorias nos AI services (retry, error handling)
- **10 cards Kanban**

### Sprint 4: Polimento + Testes End-to-End + Documentação (1 semana)
- Error handling completo + otimizações
- Polimento de UI (responsividade, acessibilidade)
- Testes completos (unitários, integração, E2E > 80% coverage)
- Documentação (API docs, README, ADRs)
- CI/CD pipeline (GitHub Actions)
- **13 cards Kanban**

**Total**: 4 semanas, 43 cards Kanban, ~174 horas estimadas

---

## 9. Próximos Passos

### 9.1 Fase de Aprovação (Antes de Implementação)

**CRÍTICO**: Nenhuma linha de código será escrita antes de aprovar:

1. ✅ **Revisão destas especificações** (Time de Produto + Time Técnico)
2. ✅ **Aprovação formal das especificações**
3. ✅ **Aprovação dos Mocks de UI** (07_mocks_ui_navegacao.md)
4. ✅ **Aprovação do planejamento de sprints** (PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)
5. ⏸️ **Aprovação final do Time de Produto + Time Técnico**
6. ✅ **Início da implementação** (Sprint 1)

### 9.2 Após Aprovação

1. Criar branch `feat/fase1-ai-context-generator`
2. Sprint 1 Planning (Orchestrator Agent distribui 10 cards para squad)
3. Daily standups (15 min/dia)
4. Sprint Review ao final de cada semana
5. Após 4 semanas: Transição para **Fase 2: Specification Generation**

---

## Referências

- **[VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ Arquitetura master
- **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - ⭐⭐⭐ Sprint planning
- **[07_mocks_ui_navegacao.md](07_mocks_ui_navegacao.md)** - ⭐⭐⭐ Mocks de UI
- **[CLAUDE.md](../../../CLAUDE.md)** - Guia completo de implementação
- **[stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)** - Stack por fase

---

**Status**: 🟢 Especificações completas e prontas para aprovação
**Aguardando**: Aprovação final do Time de Produto + Time Técnico
**Próxima ação**: Sprint 1 Planning (após aprovação)

**Versão**: 2.0.0
**Data de Última Atualização**: 2025-12-11

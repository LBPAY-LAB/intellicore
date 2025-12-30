# 📋 Análise de Requisitos - Fase 1: Fundação

**Projeto**: SuperCore v2.0
**Fase**: Fase 1 - Fundação (Q1 2025)
**Data**: 2025-12-28
**Versão**: 1.0.0

---

## 🎯 Objetivo da Fase 1

Construir a **fundação técnica** do SuperCore v2.0, estabelecendo:
- ✅ Modelo de dados (PostgreSQL + pgvector)
- ✅ CRUD completo de Oráculos
- ✅ Gestão de Object Definitions
- ✅ Upload e processamento de documentos
- ✅ Pipeline RAG Trimodal (SQL + Vector + Graph)
- ✅ Chat IA Assistant com streaming (SSE)
- ✅ Interface administrativa (Back-office)

**Outcome esperado**: Plataforma funcional onde administradores podem criar Oráculos, definir objetos, fazer upload de documentos e interagir via chat IA.

---

## 📚 Requisitos Funcionais Mapeados

### RF001: Gestão de Oráculos (Domains)
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo
**Complexidade**: Alta
**Story Points**: 34 SP

#### Descrição Detalhada
Permitir que administradores criem e gerenciem **Oráculos** (domínios de conhecimento isolados). Cada Oráculo representa uma área de negócio específica (ex: Compliance, Pagamentos, Risco de Crédito) com sua própria base de conhecimento, configurações e assistente IA.

**Relação com RF001-F (Gestão de Soluções)**:
- Cada Oráculo **pertence a 1 Solução** (campo `solution_id` obrigatório)
- Soluções agrupam múltiplos oráculos relacionados (ex: "LBPAY Core Banking" contém oráculos de Pagamentos, Compliance, Risco)
- Nome e slug do Oráculo devem ser únicos **dentro da mesma solução** (podem repetir entre soluções diferentes)
- Quando uma solução é deletada, todos seus oráculos são deletados em cascata (ON DELETE CASCADE)

#### User Stories
1. **Como administrador, quero listar todos os Oráculos** para ter uma visão geral dos domínios ativos
2. **Como administrador, quero criar um novo Oráculo** para adicionar um novo domínio de conhecimento
3. **Como administrador, quero visualizar detalhes de um Oráculo** para entender suas configurações e estatísticas
4. **Como administrador, quero editar um Oráculo existente** para atualizar suas configurações
5. **Como administrador, quero ativar/desativar um Oráculo** para controlar sua disponibilidade
6. **Como administrador, quero deletar um Oráculo** quando ele não for mais necessário

#### Critérios de Aceitação

**Funcionalidade**:
- [x] CRUD completo: Create, Read, Update, Delete
- [x] **Obrigatório**: Oráculo pertence a 1 Solução (solution_id)
- [x] Validação de nome único **por solução** (pode haver "Compliance Bot" em 2 soluções diferentes)
- [x] Validação de slug único **por solução** (URL-friendly, lowercase, hyphens)
- [x] Filtro por solução na listagem (opcional)
- [x] Status: Active/Inactive
- [x] Timestamps: created_at, updated_at
- [x] Soft delete: deleted_at (não deletar fisicamente)

**Performance**:
- [x] Listagem com paginação (20 itens/página)
- [x] Busca em tempo real (<300ms)
- [x] Filtros: Status (Active/Inactive), Data de criação

**Segurança**:
- [x] Autenticação obrigatória (JWT)
- [x] Apenas administradores podem criar/editar/deletar
- [x] Auditoria: Registrar todas as operações (quem, quando, o quê)

**UX/UI**:
- [x] Listagem em tabela com ordenação e busca
- [x] Formulário de criação com preview
- [x] Formulário de edição com change tracking
- [x] Confirmação antes de deletar
- [x] Feedback visual (toasts, spinners)
- [x] WCAG 2.1 AA compliant

#### Implementação Técnica

**Backend (Go)**:
```go
// models/oracle.go
type Oracle struct {
    ID          uuid.UUID  `json:"id" db:"id"`
    SolutionID  uuid.UUID  `json:"solution_id" db:"solution_id" binding:"required"` // Nova: pertence a 1 solução
    Name        string     `json:"name" db:"name" binding:"required,min=3,max=100"`
    Slug        string     `json:"slug" db:"slug" binding:"required,slug"`
    Description string     `json:"description" db:"description" binding:"max=500"`
    Status      string     `json:"status" db:"status" binding:"oneof=active inactive"`
    ModelName   string     `json:"model_name" db:"model_name" binding:"required"`
    Temperature float64    `json:"temperature" db:"temperature" binding:"min=0,max=2"`
    MaxTokens   int        `json:"max_tokens" db:"max_tokens" binding:"min=100,max=4000"`
    CreatedAt   time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
    DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

// handlers/oracles.go
func ListOracles(c *gin.Context) {
    page := c.DefaultQuery("page", "1")
    limit := c.DefaultQuery("limit", "20")
    search := c.Query("search")
    status := c.Query("status")
    solutionID := c.Query("solution_id") // Nova: filtrar por solução

    oracles, total, err := oracleRepo.List(page, limit, search, status, solutionID)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{
        "data": oracles,
        "total": total,
        "page": page,
        "limit": limit,
    })
}

func CreateOracle(c *gin.Context) {
    var oracle Oracle
    if err := c.ShouldBindJSON(&oracle); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Nova: validar que solução existe e está ativa
    solution, err := solutionRepo.GetByID(oracle.SolutionID)
    if err != nil {
        c.JSON(404, gin.H{"error": "Solution not found"})
        return
    }
    if solution.Status != "active" && solution.Status != "testing" {
        c.JSON(400, gin.H{"error": "Solution must be active or testing"})
        return
    }

    // Check uniqueness (nome único dentro da solução)
    exists, _ := oracleRepo.ExistsByNameInSolution(oracle.Name, oracle.SolutionID)
    if exists {
        c.JSON(409, gin.H{"error": "Oracle with this name already exists in this solution"})
        return
    }

    // Generate slug
    oracle.Slug = slug.Make(oracle.Name)

    if err := oracleRepo.Create(&oracle); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Audit log
    auditLog.Log(c, "oracle_created", oracle.ID, oracle)

    c.JSON(201, oracle)
}
```

**Frontend (Next.js)**:
- Página: `/admin/oracles`
- Componentes: OracleTable, OracleForm, OracleCard
- Estado: React Query (cache, refetch, optimistic updates)
- Formulário: React Hook Form + Zod validation

**Database (PostgreSQL)**:
```sql
CREATE TABLE oracles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE, -- Nova: pertence a 1 solução
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    model_name VARCHAR(50) NOT NULL DEFAULT 'gpt-4-turbo',
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens >= 100 AND max_tokens <= 4000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(solution_id, name), -- Nova: nome único por solução
    UNIQUE(solution_id, slug)  -- Nova: slug único por solução
);

CREATE INDEX idx_oracles_solution_id ON oracles(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_status ON oracles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_created_at ON oracles(created_at DESC);
```

#### Dependências
- **Requisitos**: RF001-F (Gestão de Soluções) deve estar implementado primeiro
- **Tecnologias**: Go 1.21, Gin, PostgreSQL 16, UUID v4
- **Bibliotecas**: go-playground/validator, gosimple/slug, google/uuid
- **Fase 0 completa**: Database setup, migrations, auth

#### Testes Obrigatórios

**Unit Tests (Go)**:
- [x] `TestOracleValidation` - Validar campos obrigatórios
- [x] `TestOracleUniqueName` - Garantir nomes únicos
- [x] `TestOracleSlugGeneration` - Gerar slugs corretos
- [x] `TestOracleCRUD` - Criar, ler, atualizar, deletar

**Integration Tests**:
- [x] `TestOracleAPI_List` - GET /api/v1/oracles (200)
- [x] `TestOracleAPI_Create` - POST /api/v1/oracles (201)
- [x] `TestOracleAPI_CreateDuplicate` - POST /api/v1/oracles (409)
- [x] `TestOracleAPI_Get` - GET /api/v1/oracles/:id (200)
- [x] `TestOracleAPI_Update` - PUT /api/v1/oracles/:id (200)
- [x] `TestOracleAPI_Delete` - DELETE /api/v1/oracles/:id (204)

**E2E Tests (Playwright)**:
- [x] `oracle-crud.spec.ts` - Fluxo completo de criação, edição e deleção
- [x] `oracle-search.spec.ts` - Busca e filtros
- [x] `oracle-validation.spec.ts` - Validações de formulário

**Cobertura Mínima**: ≥85%

#### Métricas de Sucesso
- **Performance**: Listagem <200ms (p95), Criação <500ms (p95)
- **Disponibilidade**: 99.5% uptime
- **Usabilidade**: SUS Score ≥80
- **Qualidade**: 0 bugs críticos em produção

---

### RF001-B: Sistema de Tags para Oráculos
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo
**Complexidade**: Média
**Story Points**: 8 SP
**Dependência**: RF001 (base)

#### Descrição Detalhada
Implementar sistema de **tags multi-palavra** para classificação ágil de Oráculos. Tags substituem o campo "Domínio" anterior, permitindo classificação flexível com múltiplas etiquetas por Oráculo.

#### Exemplos de Tags
- `#Core Banking` (com espaço)
- `#PIX Rules`
- `#Dict Rules`
- `#Compliance`
- `#AML` (Anti-Money Laundering)
- `#KYC` (Know Your Customer)

#### User Stories
1. **Como administrador, quero adicionar múltiplas tags a um Oráculo** para classificá-lo em diferentes categorias
2. **Como administrador, quero filtrar Oráculos por tags** para encontrar rapidamente os de um domínio específico
3. **Como administrador, quero buscar Oráculos por tags** na barra de pesquisa global
4. **Como administrador, quero ver todas as tags usadas no sistema** para manter consistência na nomenclatura

#### Critérios de Aceitação

**Funcionalidade**:
- [x] Tags permitem espaços (ex: `#Core Banking`)
- [x] Relação many-to-many (um Oráculo pode ter N tags, uma tag pode estar em N Oráculos)
- [x] Auto-complete de tags existentes ao digitar
- [x] Criação de novas tags on-the-fly
- [x] Remoção de tags de um Oráculo
- [x] Filtro por múltiplas tags (AND/OR logic)
- [x] Busca full-text em tags

**Validações**:
- [x] Tag deve começar com `#`
- [x] Tag deve ter entre 2-50 caracteres
- [x] Sem caracteres especiais (exceto espaços e hífens)
- [x] Case-insensitive (`#PIX Rules` === `#pix rules`)
- [x] No máximo 10 tags por Oráculo

**Performance**:
- [x] Filtro por tags <200ms
- [x] Auto-complete <100ms
- [x] Indexação full-text (PostgreSQL GIN index)

#### Implementação Técnica

**Backend (Go)**:
```go
// models/oracle_tag.go
type OracleTag struct {
    ID        uuid.UUID  `json:"id" db:"id"`
    Name      string     `json:"name" db:"name" binding:"required,min=2,max=50"`
    Slug      string     `json:"slug" db:"slug"` // lowercase, no #
    UsageCount int       `json:"usage_count" db:"usage_count"` // quantos Oráculos usam
    CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

type OracleTagAssociation struct {
    OracleID uuid.UUID `db:"oracle_id"`
    TagID    uuid.UUID `db:"tag_id"`
}
```

**Database Migration**:
```sql
-- 003_create_oracle_tags.up.sql
CREATE TABLE oracle_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE oracle_tag_associations (
    oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES oracle_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (oracle_id, tag_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oracle_tags_slug ON oracle_tags USING GIN (to_tsvector('portuguese', slug));
CREATE INDEX idx_oracle_tag_associations_oracle ON oracle_tag_associations(oracle_id);
CREATE INDEX idx_oracle_tag_associations_tag ON oracle_tag_associations(tag_id);
```

**API Endpoints**:
- `GET /api/tags` - Listar todas as tags (com usage_count)
- `GET /api/tags/autocomplete?q=core` - Auto-complete de tags
- `POST /api/oracles/:id/tags` - Adicionar tags a Oráculo
- `DELETE /api/oracles/:id/tags/:tagId` - Remover tag de Oráculo
- `GET /api/oracles?tags=core-banking,pix-rules` - Filtrar por tags

---

### RF001-C: Configuração de Tipos de Oráculo
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo
**Complexidade**: Média
**Story Points**: 5 SP
**Dependência**: RF001 (base)

#### Descrição Detalhada
Permitir que administradores **gerenciem tipos de Oráculos** via interface administrativa. Tipos definem como o Oráculo será consumido/integrado (Middleware, Portal Web, MCP Server, etc.).

#### Tipos Padrão (Iniciais)
1. **Middleware** - Integração entre sistemas
2. **Portal Web** - Interface web dinâmica
3. **MCP Server** - Servidor de contexto MCP

#### User Stories
1. **Como administrador, quero criar novos tipos de Oráculo** para suportar novos contextos de integração
2. **Como administrador, quero editar tipos existentes** para atualizar suas descrições
3. **Como administrador, quero desativar tipos** quando não forem mais usados
4. **Como administrador, quero ver quantos Oráculos usam cada tipo** para entender distribuição

#### Critérios de Aceitação

**Funcionalidade**:
- [x] CRUD de tipos (Create, Read, Update, Delete)
- [x] Nome único por tipo
- [x] Descrição detalhada (até 500 caracteres)
- [x] Ícone emoji opcional
- [x] Status: Active/Inactive
- [x] Counter: quantos Oráculos usam o tipo
- [x] Proteção contra deleção: tipos em uso não podem ser deletados (apenas desativados)

**Validações**:
- [x] Nome único (case-insensitive)
- [x] Descrição mínima de 20 caracteres
- [x] Slug auto-gerado (lowercase, hyphens)

**Regras de Negócio**:
- [x] Se tipo tem `oraclesCount > 0` → não pode deletar (apenas editar/desativar)
- [x] Se tipo `inactive` → não aparece em dropdowns de criação/edição de Oráculos
- [x] Sistema sempre mantém 3 tipos padrão (Middleware, Portal Web, MCP Server) ativos

#### Implementação Técnica

**Backend (Go)**:
```go
// models/oracle_type.go
type OracleType struct {
    ID           uuid.UUID  `json:"id" db:"id"`
    Name         string     `json:"name" db:"name" binding:"required,min=3,max=50"`
    Slug         string     `json:"slug" db:"slug"`
    Description  string     `json:"description" db:"description" binding:"required,min=20,max=500"`
    Icon         string     `json:"icon,omitempty" db:"icon"` // emoji opcional
    Status       string     `json:"status" db:"status" binding:"oneof=active inactive"`
    OraclesCount int        `json:"oracles_count" db:"oracles_count"`
    CreatedAt    time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}
```

**Database Migration**:
```sql
-- 004_create_oracle_types.up.sql
CREATE TABLE oracle_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    oracles_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir tipos padrão
INSERT INTO oracle_types (name, slug, description, icon, status) VALUES
('Middleware', 'middleware', 'Integração entre sistemas, permitindo comunicação e troca de dados', '⚙️', 'active'),
('Portal Web', 'portal-web', 'Interface web dinâmica gerada pelo Oráculo para usuários finais', '🌐', 'active'),
('MCP Server', 'mcp-server', 'Servidor de contexto seguindo protocolo MCP (Model Context Protocol)', '🔌', 'active');

-- Adicionar FK em oracles
ALTER TABLE oracles ADD COLUMN type_id UUID REFERENCES oracle_types(id);
UPDATE oracles SET type_id = (SELECT id FROM oracle_types WHERE slug = 'middleware' LIMIT 1);
ALTER TABLE oracles ALTER COLUMN type_id SET NOT NULL;

CREATE INDEX idx_oracles_type_id ON oracles(type_id);
```

**API Endpoints**:
- `GET /api/oracle-types` - Listar todos os tipos
- `GET /api/oracle-types?status=active` - Apenas ativos (para dropdowns)
- `POST /api/oracle-types` - Criar novo tipo
- `PUT /api/oracle-types/:id` - Editar tipo
- `DELETE /api/oracle-types/:id` - Deletar tipo (apenas se `oraclesCount === 0`)

---

### RF001-D: Gestão de Provedores LLM
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo
**Complexidade**: Alta
**Story Points**: 13 SP
**Dependência**: RF001 (base)

#### Descrição Detalhada
Permitir configuração centralizada de **provedores de LLM** (online e self-hosted) via interface administrativa. Oráculos selecionam provedores pré-configurados ao invés de hardcoded models.

#### Tipos de Provedores

**Online (API-based)**:
- OpenAI (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo)
- Anthropic (Claude 3 Opus, Claude 3 Sonnet)
- Google (Gemini 1.5 Pro, Gemini 1.0 Pro)
- Cohere, Mistral

**Self-Hosted**:
- Ollama (Llama 2, Mistral, etc.)
- LocalAI
- Text Generation WebUI
- LM Studio

#### User Stories
1. **Como administrador, quero configurar provedores online** com API keys para uso em Oráculos
2. **Como administrador, quero configurar provedores self-hosted** com endpoints locais
3. **Como administrador, quero testar conectividade** antes de salvar um provedor
4. **Como administrador, quero ativar/desativar provedores** para controlar disponibilidade
5. **Como administrador, quero ver quais Oráculos usam cada provedor** para impacto de mudanças

#### Critérios de Aceitação

**Funcionalidade - Provedores Online**:
- [x] CRUD de provedores (Create, Read, Update, Delete)
- [x] Campos: Provider (OpenAI, Anthropic, Google), Model, API Key, Display Name
- [x] API Key armazenada com criptografia AES-256
- [x] API Key exibida mascarada (ex: `sk-***7A2E`)
- [x] Teste de conectividade opcional (request simples)
- [x] Status: Active/Testing/Inactive

**Funcionalidade - Provedores Self-Hosted**:
- [x] Campos: Provider (Ollama, LocalAI), Model, Endpoint URL, Auth Token (opcional)
- [x] Health check automático a cada 5 minutos
- [x] Status atualizado automaticamente se endpoint offline
- [x] Latência média nos últimos 100 requests

**Validações**:
- [x] API Key formato válido (provider-specific regex)
  - OpenAI: `^sk-(proj-)?[A-Za-z0-9]{40,}$`
  - Anthropic: `^sk-ant-[A-Za-z0-9-]+$`
  - Google: `^AIza[A-Za-z0-9_-]{35}$`
- [x] Endpoint URL válida (http/https)
- [x] Modelo existe no provedor (via API discovery se disponível)

**Regras de Negócio**:
- [x] Se provedor tem Oráculos ativos → não pode deletar (apenas desativar)
- [x] Provedores inativos não aparecem em dropdowns de criação/edição de Oráculos
- [x] Health check falha → status `inactive` automático

#### Implementação Técnica

**Backend (Go + Python)**:
```go
// models/llm_provider.go
type LLMProvider struct {
    ID            uuid.UUID  `json:"id" db:"id"`
    ProviderType  string     `json:"provider_type" db:"provider_type"` // online | self-hosted
    Provider      string     `json:"provider" db:"provider"` // openai, anthropic, ollama, etc.
    Model         string     `json:"model" db:"model"`
    APIKey        string     `json:"-" db:"api_key"` // encrypted, não retornar em JSON
    APIKeyMasked  string     `json:"api_key_masked" db:"-"` // sk-***7A2E
    Endpoint      string     `json:"endpoint,omitempty" db:"endpoint"` // para self-hosted
    DisplayName   string     `json:"display_name,omitempty" db:"display_name"`
    Status        string     `json:"status" db:"status"` // active, testing, inactive
    AvgLatency    float64    `json:"avg_latency_ms,omitempty" db:"avg_latency_ms"`
    OraclesCount  int        `json:"oracles_count" db:"oracles_count"`
    LastTested    *time.Time `json:"last_tested,omitempty" db:"last_tested"`
    CreatedAt     time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}
```

**Database Migration**:
```sql
-- 005_create_llm_providers.up.sql
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('online', 'self-hosted')),
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    api_key TEXT, -- encrypted
    endpoint TEXT,
    display_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'testing' CHECK (status IN ('active', 'testing', 'inactive')),
    avg_latency_ms FLOAT,
    oracles_count INTEGER DEFAULT 0,
    last_tested TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, model)
);

-- Inserir provedores padrão
INSERT INTO llm_providers (provider_type, provider, model, display_name, status) VALUES
('online', 'openai', 'gpt-4-turbo', 'OpenAI - GPT-4 Turbo', 'inactive'),
('online', 'anthropic', 'claude-3-opus', 'Anthropic - Claude 3 Opus', 'inactive');

-- Adicionar FK em oracles
ALTER TABLE oracles ADD COLUMN llm_provider_id UUID REFERENCES llm_providers(id);
UPDATE oracles SET llm_provider_id = (SELECT id FROM llm_providers WHERE provider = 'openai' LIMIT 1);
ALTER TABLE oracles ALTER COLUMN llm_provider_id SET NOT NULL;
-- Remover campos antigos
ALTER TABLE oracles DROP COLUMN model_name;

CREATE INDEX idx_oracles_llm_provider_id ON oracles(llm_provider_id);
```

**API Endpoints**:
- `GET /api/llm-providers` - Listar todos
- `GET /api/llm-providers?status=active` - Apenas ativos (para dropdowns)
- `POST /api/llm-providers` - Criar novo
- `PUT /api/llm-providers/:id` - Editar
- `DELETE /api/llm-providers/:id` - Deletar (apenas se `oraclesCount === 0`)
- `POST /api/llm-providers/:id/test` - Testar conectividade
- `GET /api/llm-providers/:id/health` - Health check (self-hosted)

**Encryption (API Keys)**:
```go
// utils/encryption.go
import "crypto/aes"
import "crypto/cipher"

func EncryptAPIKey(plaintext string) (string, error) {
    key := []byte(os.Getenv("ENCRYPTION_KEY")) // 32 bytes
    block, _ := aes.NewCipher(key)
    gcm, _ := cipher.NewGCM(block)
    nonce := make([]byte, gcm.NonceSize())
    ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptAPIKey(ciphertext string) (string, error) {
    key := []byte(os.Getenv("ENCRYPTION_KEY"))
    data, _ := base64.StdEncoding.DecodeString(ciphertext)
    block, _ := aes.NewCipher(key)
    gcm, _ := cipher.NewGCM(block)
    nonceSize := gcm.NonceSize()
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]
    plaintext, _ := gcm.Open(nil, nonce, ciphertext, nil)
    return string(plaintext), nil
}
```

---

### RF001-E: RAG Global (Shared Knowledge Base)
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo
**Complexidade**: Média
**Story Points**: 4 SP
**Dependência**: RF001 (base), RF004 (RAG Trimodal)

#### Descrição Detalhada
Criar um **Oráculo Global especial** que contém conhecimento compartilhado entre todos os Oráculos **da mesma solução** (regulações BACEN, políticas LGPD, normas AML/KYC, etc.). Este Oráculo funciona como **fallback** quando Oráculos específicos não encontram respostas suficientes.

**Relação com RF001-F (Gestão de Soluções)**:
- Cada **Solução tem exatamente 1 RAG Global** (auto-criado ao criar a solução)
- RAG Global é isolado por solução (multi-tenancy completo)
- Oráculos só consultam o RAG Global **da sua própria solução**
- Exemplo: "LBPAY Core Banking" tem seu próprio RAG Global, separado de "SuperCommerce"

#### Casos de Uso
1. **Regulações Financeiras**: BACEN, CVM, SUSEP (compartilhadas por todos os Oráculos)
2. **Compliance Global**: LGPD, PCI-DSS, ISO 27001
3. **Políticas Corporativas**: Códigos de conduta, políticas de segurança
4. **Glossário Financeiro**: Termos técnicos, acrônimos, conceitos

#### Exemplos Práticos

**Cenário 1**: Oráculo "PIX Compliance"
```
User: "Qual o limite de transação PIX para PF?"
Sistema:
1. Busca RAG do Oráculo PIX (específico) → Encontra: "Limite R$ 1.000 (noturno)"
2. Busca RAG Global (fallback) → Encontra: "Resolução BCB 1/2020, Art. 3º"
3. Combina: "R$ 1.000 no horário noturno (20h-6h), conforme Resolução BCB 1/2020"
```

**Cenário 2**: Oráculo "KYC Onboarding"
```
User: "Preciso validar CPF do cliente?"
Sistema:
1. Busca RAG KYC (específico) → Encontra: "Validação CPF obrigatória"
2. Busca RAG Global (fallback) → Encontra: "LGPD Art. 7º - base legal"
3. Combina: "Sim, obrigatório. Base legal: LGPD Art. 7º (execução de contrato)"
```

#### User Stories
1. **Como sistema, quero criar automaticamente 1 RAG Global** ao criar uma nova solução (RF001-F)
2. **Como administrador, quero fazer upload de documentos globais** no RAG Global da minha solução (PDFs de regulações, políticas)
3. **Como usuário, quero que o chat IA consulte automaticamente o RAG Global da solução** quando necessário (fallback)
4. **Como administrador, quero ver quais Oráculos da solução estão usando o RAG Global** (metrics)

#### Critérios de Aceitação

**Funcionalidade**:
- [x] Campo `is_global` em tabela `oracles` (boolean, default: false)
- [x] **Apenas 1 Oráculo pode ser `is_global=true` por solução** (não sistema inteiro)
- [x] **RAG Global é auto-criado** ao criar nova solução (RF001-F)
- [x] RAG Global é consultado automaticamente via `HybridRAGRetriever`
- [x] Fallback logic: Per-Oracle RAG primeiro, Global RAG **da mesma solução** segundo
- [x] Respostas indicam fonte (Global vs Per-Oracle)

**Validações**:
- [x] Apenas admin pode editar Oráculo Global (criação é automática)
- [x] Oráculo Global não pode ser deletado manualmente (deletado com a solução via CASCADE)
- [x] Se `is_global=true` → tipo deve ser "RAG Global" (novo tipo)
- [x] Oráculos só consultam RAG Global **da sua própria solução** (`solution_id` match)

**Performance**:
- [x] Fallback adiciona <100ms ao tempo total (queries paralelas)
- [x] Cache compartilhado (Redis) para queries globais frequentes

**UX/UI**:
- [x] Badge visual "🌍 Global" em listagem de Oráculos
- [x] Chat IA mostra fonte das respostas:
  - "📄 Fonte: Oráculo PIX (específico)"
  - "🌍 Fonte: RAG Global (regulação BACEN)"

#### Implementação Técnica

**Database Migration**:
```sql
-- 006_add_global_oracle_flag.up.sql
ALTER TABLE oracles ADD COLUMN is_global BOOLEAN DEFAULT FALSE;

-- Constraint: apenas 1 Oráculo global POR SOLUÇÃO (não sistema inteiro)
CREATE UNIQUE INDEX idx_oracles_global_per_solution
ON oracles(solution_id, is_global) WHERE is_global = TRUE AND deleted_at IS NULL;

-- Criar tipo "RAG Global"
INSERT INTO oracle_types (name, slug, description, icon, status) VALUES
('RAG Global', 'rag-global', 'Base de conhecimento compartilhada entre oráculos da mesma solução', '🌍', 'active');

-- NOTA: RAG Global NÃO é criado aqui manualmente
-- Será auto-criado ao executar RF001-F (CreateSolution handler)
-- Cada solução terá seu próprio RAG Global isolado
```

**Backend (Python - RAG)**:
```python
# services/hybrid_rag_retriever.py
class HybridRAGRetriever:
    def __init__(self, oracle_id: str, solution_id: str = None):
        self.oracle_id = oracle_id
        self.solution_id = solution_id or self._get_oracle_solution_id(oracle_id)
        self.global_oracle_id = self._get_global_oracle_id_for_solution(self.solution_id)

    async def retrieve(self, query: str, top_k: int = 10) -> List[Document]:
        # 1️⃣ Per-Oracle RAG (específico)
        oracle_results = await self.vector_db.search(
            oracle_id=self.oracle_id,
            query_embedding=self.embed(query),
            limit=top_k
        )

        # 2️⃣ Global RAG (fallback) - executado em paralelo
        # IMPORTANTE: Apenas consulta RAG Global DA MESMA SOLUÇÃO
        global_results = []
        if self.global_oracle_id and len(oracle_results) < top_k:
            global_results = await self.vector_db.search(
                oracle_id=self.global_oracle_id,
                query_embedding=self.embed(query),
                limit=top_k - len(oracle_results)
            )

        # 3️⃣ Merge e tag source
        merged = []
        for doc in oracle_results:
            doc.metadata["source_type"] = "per-oracle"
            doc.metadata["source_icon"] = "📄"
            merged.append(doc)

        for doc in global_results:
            doc.metadata["source_type"] = "global"
            doc.metadata["source_icon"] = "🌍"
            merged.append(doc)

        # 4️⃣ Rerank (LLM-based)
        return self.rerank(merged, query)[:top_k]

    def _get_oracle_solution_id(self, oracle_id: str) -> str:
        result = db.query("SELECT solution_id FROM oracles WHERE id = $1", oracle_id)
        return result[0]["solution_id"] if result else None

    def _get_global_oracle_id_for_solution(self, solution_id: str) -> str:
        # Query database for is_global=true NA MESMA SOLUÇÃO
        result = db.query(
            "SELECT id FROM oracles WHERE solution_id = $1 AND is_global = TRUE LIMIT 1",
            solution_id
        )
        return result[0]["id"] if result else None
```

**Frontend (Chat IA - Source Badges)**:
```tsx
// components/ChatMessage.tsx
function ChatMessage({ message }: { message: Message }) {
  return (
    <div className="message">
      <ReactMarkdown>{message.content}</ReactMarkdown>

      {/* Source badges */}
      {message.sources && (
        <div className="sources mt-2 flex gap-2">
          {message.sources.map((source, i) => (
            <Badge key={i} variant={source.type === 'global' ? 'secondary' : 'default'}>
              {source.icon} {source.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Dependências
- **Requisitos**: RF001-F (Gestão de Soluções) - RAG Global é auto-criado ao criar solução
- **Tecnologias**: PostgreSQL (unique constraints), Python (async queries)

#### Métricas de Sucesso
- **Recall**: +15% (com RAG Global vs sem)
- **Global hit rate**: 30-40% das queries consultam Global **da mesma solução**
- **Latência**: <100ms adicionais para fallback
- **Governança**: 1 fonte única de regulações **por solução** (consistência + isolamento)

#### Roadmap de Expansão (Fase 3)
- **Cross-Oracle Search**: Buscar em múltiplos Oráculos **da mesma solução** simultaneamente
- **Smart Routing**: LLM decide automaticamente quais Oráculos consultar (sempre dentro da solução)
- **Global + Multi-Oracle**: Combinar RAG Global + 2-3 Oráculos relacionados (multi-tenancy mantido)

---

### RF001-F: Gestão de Soluções (Aggregators)
**Prioridade**: P0 (Crítico)
**Camada**: Camada 0.5 - Solução (novo nível organizacional acima de Oráculos)
**Complexidade**: Média
**Story Points**: 8 SP
**Dependência**: RF001 (base)

#### Descrição Detalhada
Criar camada **Solução** como agregador organizacional de Oráculos. Cada solução representa um produto/cliente/domínio de negócio (ex: "LBPAY Core Banking") e contém:
- **1 RAG Global** (obrigatório, auto-criado)
- **N Oráculos** específicos (Compliance, PIX, KYC, etc.)

**Hierarquia**:
```
Sistema SuperCore
└── Solução (ex: "LBPAY Core Banking")
    ├── RAG Global (obrigatório, 1 por solução)
    ├── Oráculo 1 (Payment Gateway)
    ├── Oráculo 2 (Compliance Bot)
    └── Oráculo N
```

**Isolamento**: Cada solução tem dados 100% isolados (multi-tenancy).

#### User Stories
1. **Como administrador, quero listar todas as Soluções** para ter visão dos produtos/clientes ativos
2. **Como administrador, quero criar uma nova Solução** com geração automática de RAG Global
3. **Como administrador, quero visualizar dashboard de uma Solução** com métricas de oráculos
4. **Como administrador, quero editar informações de uma Solução** (nome, descrição, icon)
5. **Como administrador, quero ativar/desativar uma Solução** para controlar disponibilidade
6. **Como administrador, quero deletar uma Solução** quando não for mais necessária

#### Critérios de Aceitação

**Funcionalidade**:
- [x] CRUD completo: Create, Read, Update, Delete
- [x] Auto-criação de RAG Global ao criar Solução (transacional)
- [x] Validação de nome único
- [x] Validação de slug (URL-friendly)
- [x] Status: Active/Testing/Inactive
- [x] Emoji icon como identificador visual
- [x] Timestamps: created_at, updated_at
- [x] Soft delete: deleted_at
- [x] Proteção contra deleção: bloqueado se tem oráculos ativos

**Performance**:
- [x] Listagem com paginação (12 cards/página)
- [x] Card grid responsivo (3/2/1 colunas)
- [x] Métricas agregadas: count(oráculos), count(objetos), count(agentes)

**Segurança**:
- [x] Apenas administradores podem criar/editar/deletar
- [x] Auditoria completa de operações

**UX/UI**:
- [x] Home page = listagem de soluções (não oráculos)
- [x] Card grid com icon + nome + status + métricas
- [x] Wizard de 3 etapas para criar solução
- [x] Dashboard por solução (métricas + lista de oráculos)
- [x] Breadcrumb navegação: Soluções > {Solução} > Oráculos

#### Implementação Técnica

**Database (PostgreSQL)**:
```sql
-- Migration: 007_create_solutions_table.up.sql
CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL, -- emoji
    description TEXT,
    global_rag_oracle_id UUID REFERENCES oracles(id), -- RAG Global para esta solução
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'testing', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Foreign key: oracles pertencem a 1 solução
ALTER TABLE oracles ADD COLUMN solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE;
CREATE INDEX idx_oracles_solution_id ON oracles(solution_id) WHERE deleted_at IS NULL;

-- Unique constraint: apenas 1 RAG Global por solução
CREATE UNIQUE INDEX idx_solutions_global_rag
ON solutions(global_rag_oracle_id) WHERE global_rag_oracle_id IS NOT NULL;

-- Indexes
CREATE INDEX idx_solutions_status ON solutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_created_at ON solutions(created_at DESC);
```

**Backend (Go)**:
```go
// models/solution.go
type Solution struct {
    ID                  uuid.UUID  `json:"id" db:"id"`
    Name                string     `json:"name" db:"name" binding:"required,min=3,max=100"`
    Slug                string     `json:"slug" db:"slug" binding:"required,slug"`
    Icon                string     `json:"icon" db:"icon" binding:"required,emoji"`
    Description         string     `json:"description" db:"description" binding:"max=500"`
    GlobalRAGOracleID   *uuid.UUID `json:"global_rag_oracle_id,omitempty" db:"global_rag_oracle_id"`
    Status              string     `json:"status" db:"status" binding:"oneof=active testing inactive"`
    CreatedAt           time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt           time.Time  `json:"updated_at" db:"updated_at"`
    DeletedAt           *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`

    // Agregações (não persistidas)
    Metrics SolutionMetrics `json:"metrics,omitempty" db:"-"`
    GlobalRagOracle *Oracle `json:"global_rag_oracle,omitempty" db:"-"`
}

type SolutionMetrics struct {
    OraclesCount     int `json:"oracles_count"`
    ObjectsCount     int `json:"objects_count"`
    AgentsCount      int `json:"agents_count"`
    MCPServersCount  int `json:"mcp_servers_count,omitempty"`
}

// handlers/solutions.go
func CreateSolution(c *gin.Context) {
    var request CreateSolutionRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Start Temporal Workflow (SAGA pattern with automatic compensation)
    workflowOptions := client.StartWorkflowOptions{
        ID:        fmt.Sprintf("create-solution-%s", uuid.New().String()),
        TaskQueue: "global-crud", // Go workers handle CRUD operations
        WorkflowExecutionTimeout: 2 * time.Hour,
    }

    we, err := temporalClient.ExecuteWorkflow(
        context.Background(),
        workflowOptions,
        workflows.CreateSolutionWorkflow,
        request, // { Name, Icon, Description, Documents }
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to start workflow", "details": err.Error()})
        return
    }

    // Get workflow result (blocks until workflow completes)
    var solution Solution
    if err := we.Get(context.Background(), &solution); err != nil {
        c.JSON(500, gin.H{"error": "Workflow failed", "details": err.Error()})
        return
    }

    // Audit log
    auditLog.Log(c, "solution_created", solution.ID, solution)

    c.JSON(201, gin.H{
        "solution": solution,
        "workflow_id": we.GetID(),
        "run_id": we.GetRunID(),
    })
}

// Temporal Workflow Implementation (Go SDK)
// File: workflows/create_solution_workflow.go
package workflows

import (
    "fmt"
    "time"

    "go.temporal.io/sdk/workflow"
)

type CreateSolutionRequest struct {
    Name        string     `json:"name"`
    Icon        string     `json:"icon"`
    Description string     `json:"description"`
    Documents   []Document `json:"documents,omitempty"`
}

// CreateSolutionWorkflow - SAGA pattern with automatic compensation
func CreateSolutionWorkflow(ctx workflow.Context, req CreateSolutionRequest) (*Solution, error) {
    logger := workflow.GetLogger(ctx)
    logger.Info("Starting CreateSolution workflow", "name", req.Name)

    // Activity options with retry policy
    activityOptions := workflow.ActivityOptions{
        StartToCloseTimeout: 30 * time.Second,
        RetryPolicy: &temporal.RetryPolicy{
            MaximumAttempts: 3,
            InitialInterval: time.Second,
            MaximumInterval: 10 * time.Second,
        },
    }
    ctx = workflow.WithActivityOptions(ctx, activityOptions)

    // Activity 1: Create Solution (DB transaction)
    var solution Solution
    err := workflow.ExecuteActivity(ctx, activities.CreateSolutionDB, req).Get(ctx, &solution)
    if err != nil {
        logger.Error("Failed to create solution", "error", err)
        return nil, fmt.Errorf("create solution failed: %w", err)
    }
    logger.Info("Solution created", "solution_id", solution.ID)

    // Activity 2: Create RAG Global oracle (DB transaction)
    var ragGlobal Oracle
    err = workflow.ExecuteActivity(ctx, activities.CreateRAGGlobalOracle, solution.ID).Get(ctx, &ragGlobal)
    if err != nil {
        // Compensation: Delete solution
        logger.Warn("RAG Global creation failed, compensating...", "error", err)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteSolution, solution.ID).Get(ctx, nil)
        return nil, fmt.Errorf("create RAG Global failed: %w", err)
    }
    logger.Info("RAG Global created", "oracle_id", ragGlobal.ID)

    // Activity 3: Link RAG Global to Solution
    err = workflow.ExecuteActivity(ctx, activities.LinkRAGGlobal, solution.ID, ragGlobal.ID).Get(ctx, nil)
    if err != nil {
        // Compensation: Delete both
        logger.Warn("Failed to link RAG Global, compensating...", "error", err)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteRAGGlobal, ragGlobal.ID).Get(ctx, nil)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteSolution, solution.ID).Get(ctx, nil)
        return nil, fmt.Errorf("link RAG Global failed: %w", err)
    }

    // Activity 4: Process initial documents (long-running, optional)
    if len(req.Documents) > 0 {
        // Change activity timeout for long-running document processing
        docActivityOptions := workflow.ActivityOptions{
            StartToCloseTimeout: 30 * time.Minute,
            HeartbeatTimeout:    5 * time.Minute,
            RetryPolicy: &temporal.RetryPolicy{
                MaximumAttempts: 2, // Only 2 attempts for expensive operations
            },
        }
        docCtx := workflow.WithActivityOptions(ctx, docActivityOptions)

        // Process documents in parallel
        futures := make([]workflow.Future, len(req.Documents))
        for i, doc := range req.Documents {
            futures[i] = workflow.ExecuteActivity(docCtx, activities.ProcessDocument,
                ProcessDocRequest{
                    OracleID: ragGlobal.ID,
                    Document: doc,
                })
        }

        // Wait for all documents (partial failure is OK)
        for i, future := range futures {
            var result ProcessDocResult
            if err := future.Get(ctx, &result); err != nil {
                logger.Warn("Document processing failed", "index", i, "error", err)
                // Continue with other docs (non-critical)
            } else {
                logger.Info("Document processed", "index", i, "chunks", result.ChunksProcessed)
            }
        }
    }

    // Activity 5: Finalize solution status
    err = workflow.ExecuteActivity(ctx, activities.FinalizeSolution, solution.ID).Get(ctx, nil)
    if err != nil {
        logger.Warn("Failed to finalize solution", "error", err)
        // Non-critical, don't fail workflow
    }

    logger.Info("CreateSolution workflow completed", "solution_id", solution.ID)
    return &solution, nil
}

// Activities Implementation (Go)
// File: activities/solution_activities.go
package activities

import (
    "context"
    "fmt"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type SolutionActivities struct {
    db *gorm.DB
}

func (a *SolutionActivities) CreateSolutionDB(ctx context.Context, req CreateSolutionRequest) (*Solution, error) {
    solution := &Solution{
        ID:          uuid.New(),
        Name:        req.Name,
        Slug:        slug.Make(req.Name),
        Icon:        req.Icon,
        Description: req.Description,
        Status:      "active",
    }

    if err := a.db.Create(solution).Error; err != nil {
        return nil, fmt.Errorf("failed to create solution: %w", err)
    }

    return solution, nil
}

func (a *SolutionActivities) CreateRAGGlobalOracle(ctx context.Context, solutionID uuid.UUID) (*Oracle, error) {
    ragGlobal := &Oracle{
        SolutionID:    &solutionID,
        Name:          fmt.Sprintf("RAG Global - %s", solutionID),
        TypeID:        getOracleTypeID("rag-global"),
        IsGlobal:      true,
        LLMProviderID: getDefaultLLMProvider(),
        Status:        "active",
    }

    if err := a.db.Create(ragGlobal).Error; err != nil {
        return nil, fmt.Errorf("failed to create RAG Global: %w", err)
    }

    return ragGlobal, nil
}

func (a *SolutionActivities) LinkRAGGlobal(ctx context.Context, solutionID, ragGlobalID uuid.UUID) error {
    if err := a.db.Model(&Solution{}).Where("id = ?", solutionID).
        Update("global_rag_oracle_id", ragGlobalID).Error; err != nil {
        return fmt.Errorf("failed to link RAG Global: %w", err)
    }
    return nil
}

func (a *SolutionActivities) DeleteSolution(ctx context.Context, solutionID uuid.UUID) error {
    return a.db.Delete(&Solution{}, "id = ?", solutionID).Error
}

func (a *SolutionActivities) DeleteRAGGlobal(ctx context.Context, oracleID uuid.UUID) error {
    return a.db.Delete(&Oracle{}, "id = ?", oracleID).Error
}

func (a *SolutionActivities) FinalizeSolution(ctx context.Context, solutionID uuid.UUID) error {
    return a.db.Model(&Solution{}).Where("id = ?", solutionID).
        Update("status", "active").Error
}

func DeleteSolution(c *gin.Context) {
    solutionID := c.Param("id")

    // Verificar se tem oráculos ativos
    activeOraclesCount, _ := oracleRepo.CountActive(solutionID)
    if activeOraclesCount > 0 {
        c.JSON(409, gin.H{
            "error": "Cannot delete solution with active oracles",
            "active_oracles_count": activeOraclesCount,
        })
        return
    }

    // Soft delete
    if err := solutionRepo.SoftDelete(solutionID); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    auditLog.Log(c, "solution_deleted", solutionID, nil)
    c.JSON(204, nil)
}
```

**Frontend (Next.js)**:
- Página: `/solucoes` (home page principal)
- Página: `/solucoes/{slug}` (dashboard de solução)
- Página: `/solucoes/new` (wizard de criação)
- Página: `/solucoes/{slug}/oracles` (lista de oráculos da solução)
- Componentes: SolutionCard, SolutionForm (wizard 3 etapas), SolutionDashboard

**Rotas de API**:
```
GET    /api/v1/solutions              # Listar soluções (com métricas)
POST   /api/v1/solutions              # Criar solução + RAG Global
GET    /api/v1/solutions/:id          # Detalhes de solução
GET    /api/v1/solutions/:slug        # Detalhes por slug
PUT    /api/v1/solutions/:id          # Atualizar solução
DELETE /api/v1/solutions/:id          # Deletar solução (soft)
GET    /api/v1/solutions/:id/metrics  # Métricas agregadas
```

#### Impacto em Requisitos Existentes

**RF001 (Gestão de Oráculos)**:
- Adicionar campo `solution_id` obrigatório
- Listar oráculos agora filtra por solução
- Criar oráculo requer `solution_id` no payload

**RF001-E (RAG Global)**:
- RAG Global agora é **per-solution** (não global ao sistema)
- 1 RAG Global por solução (não 1 para todo o sistema)
- Isolamento de conhecimento entre soluções

**RF002-RF017 (todos)**:
- Todos recursos (Objects, Agents, MCPs, etc.) herdam `solution_id` de seu oráculo pai

#### Testes Obrigatórios

**Unit Tests (Go)**:
- [x] `TestSolutionValidation` - Nome, slug, icon obrigatórios
- [x] `TestSolutionUniqueName` - Nomes únicos
- [x] `TestSolutionTransactionalCreate` - Rollback se RAG Global falha
- [x] `TestSolutionDeleteProtection` - Bloqueia se tem oráculos ativos

**Integration Tests**:
- [x] `TestSolutionAPI_Create` - POST /api/v1/solutions (201, cria RAG Global)
- [x] `TestSolutionAPI_Delete` - DELETE blocked se oráculos ativos (409)
- [x] `TestSolutionAPI_Metrics` - GET /api/v1/solutions/:id/metrics (200)

**E2E Tests (Playwright)**:
- [x] `solution-crud.spec.ts` - Criar solução → ver dashboard → deletar
- [x] `solution-wizard.spec.ts` - Wizard 3 etapas completo
- [x] `solution-isolation.spec.ts` - Oráculos de solução A não aparecem em solução B

#### Métricas de Sucesso
- **Performance**: Criação transacional <1s (solução + RAG Global)
- **Usabilidade**: Wizard completion rate ≥90%
- **Isolamento**: 0 vazamentos de dados entre soluções
- **Governança**: 1 RAG Global por solução (sempre)

---

### RF002: Object Definitions (Schema Dinâmico)
**Prioridade**: P0 (Crítico)
**Camada**: Camada 2 - Objetos
**Complexidade**: Muito Alta
**Story Points**: 42 SP

#### Descrição Detalhada
Permitir que cada Oráculo defina seus próprios **Object Definitions** (schemas de objetos) de forma dinâmica. Um Object Definition é um template que define a estrutura de dados de um tipo de objeto (ex: Cliente, Produto, Transação).

**Exemplo**:
- Oráculo "Compliance" → Object Definition "Transação Suspeita" com campos: valor, data, cliente_id, motivo
- Oráculo "Pagamentos" → Object Definition "Pagamento" com campos: valor, método, status, merchant_id

#### User Stories
1. **Como administrador, quero criar um Object Definition para um Oráculo** para definir a estrutura de dados
2. **Como administrador, quero adicionar campos (fields) a um Object Definition** para especificar atributos
3. **Como administrador, quero definir tipos de campos** (string, number, date, boolean, array, object)
4. **Como administrador, quero definir validações** (required, min, max, regex, enum)
5. **Como administrador, quero versionar Object Definitions** para manter compatibilidade com dados antigos
6. **Como administrador, quero visualizar o JSON Schema gerado** para validar estrutura

#### Critérios de Aceitação

**Funcionalidade**:
- [x] CRUD de Object Definitions
- [x] Suporte a 8 tipos de campos: string, number, integer, boolean, date, array, object, enum
- [x] Validações: required, min, max, minLength, maxLength, pattern (regex), enum
- [x] Nested objects (objetos dentro de objetos)
- [x] Arrays de objetos
- [x] JSON Schema válido (Draft 2020-12)
- [x] Versionamento (v1, v2, v3...) com migração automática

**Performance**:
- [x] Listagem <300ms (p95)
- [x] Criação <500ms (p95)
- [x] Validação de JSON Schema <100ms (p95)

**Segurança**:
- [x] Isolamento por Oráculo (Object Definitions não compartilhados)
- [x] Validação de schema antes de salvar
- [x] Auditoria de mudanças

**UX/UI**:
- [x] Form Builder visual (drag-and-drop de campos)
- [x] Preview do JSON Schema gerado
- [x] Validação em tempo real
- [x] Versionamento visual (histórico de mudanças)

#### Implementação Técnica

**Backend (Go)**:
```go
// models/object_definition.go
type ObjectDefinition struct {
    ID          uuid.UUID       `json:"id" db:"id"`
    OracleID    uuid.UUID       `json:"oracle_id" db:"oracle_id"`
    Name        string          `json:"name" db:"name"`
    Slug        string          `json:"slug" db:"slug"`
    Description string          `json:"description" db:"description"`
    Version     int             `json:"version" db:"version"`
    JSONSchema  json.RawMessage `json:"json_schema" db:"json_schema"`
    IsActive    bool            `json:"is_active" db:"is_active"`
    CreatedAt   time.Time       `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

type Field struct {
    Name        string                 `json:"name"`
    Type        string                 `json:"type"` // string, number, boolean, date, array, object
    Description string                 `json:"description"`
    Required    bool                   `json:"required"`
    Validation  map[string]interface{} `json:"validation"` // min, max, pattern, enum, etc
    Fields      []Field                `json:"fields,omitempty"` // for nested objects
}

// handlers/object_definitions.go
func CreateObjectDefinition(c *gin.Context) {
    var req struct {
        OracleID    uuid.UUID `json:"oracle_id" binding:"required"`
        Name        string    `json:"name" binding:"required,min=3,max=100"`
        Description string    `json:"description"`
        Fields      []Field   `json:"fields" binding:"required,min=1"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Generate JSON Schema from fields
    schema := generateJSONSchema(req.Fields)

    // Validate JSON Schema
    if err := validateJSONSchema(schema); err != nil {
        c.JSON(400, gin.H{"error": "Invalid JSON Schema: " + err.Error()})
        return
    }

    objDef := ObjectDefinition{
        OracleID:    req.OracleID,
        Name:        req.Name,
        Slug:        slug.Make(req.Name),
        Description: req.Description,
        Version:     1,
        JSONSchema:  schema,
        IsActive:    true,
    }

    if err := objDefRepo.Create(&objDef); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, objDef)
}

// utils/json_schema.go
func generateJSONSchema(fields []Field) json.RawMessage {
    schema := map[string]interface{}{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type":    "object",
        "properties": fieldsToProperties(fields),
        "required": getRequiredFields(fields),
    }

    bytes, _ := json.Marshal(schema)
    return bytes
}

func fieldsToProperties(fields []Field) map[string]interface{} {
    props := make(map[string]interface{})

    for _, field := range fields {
        prop := map[string]interface{}{
            "type":        field.Type,
            "description": field.Description,
        }

        // Add validation rules
        if field.Validation != nil {
            for k, v := range field.Validation {
                prop[k] = v
            }
        }

        // Handle nested objects
        if field.Type == "object" && len(field.Fields) > 0 {
            prop["properties"] = fieldsToProperties(field.Fields)
            prop["required"] = getRequiredFields(field.Fields)
        }

        // Handle arrays
        if field.Type == "array" && len(field.Fields) > 0 {
            prop["items"] = map[string]interface{}{
                "type":       "object",
                "properties": fieldsToProperties(field.Fields),
                "required":   getRequiredFields(field.Fields),
            }
        }

        props[field.Name] = prop
    }

    return props
}
```

**Database (PostgreSQL)**:
```sql
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    json_schema JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (oracle_id, slug, version)
);

CREATE INDEX idx_object_definitions_oracle ON object_definitions(oracle_id);
CREATE INDEX idx_object_definitions_active ON object_definitions(is_active) WHERE is_active = true;
```

#### Dependências
- **RF001 completo**: Oráculos devem existir
- **Bibliotecas**: xeipuuv/gojsonschema (validação de JSON Schema)

#### Testes Obrigatórios
- [x] `TestObjectDefinitionCRUD` - CRUD completo
- [x] `TestJSONSchemaGeneration` - Gerar JSON Schema válido
- [x] `TestJSONSchemaValidation` - Validar schemas inválidos
- [x] `TestNestedObjects` - Suporte a objetos aninhados
- [x] `TestArrayFields` - Suporte a arrays
- [x] `TestVersioning` - Versionamento de schemas

**Cobertura Mínima**: ≥85%

---

### RF003: Upload e Processamento de Documentos
**Prioridade**: P0 (Crítico)
**Camada**: Camada 1 - Oráculo (Knowledge Base)
**Complexidade**: Muito Alta
**Story Points**: 38 SP

#### Descrição Detalhada
Permitir que administradores façam upload de documentos para a base de conhecimento de cada Oráculo. O sistema deve processar automaticamente os documentos através de um pipeline RAG:
1. Upload (local disk ou S3)
2. Text extraction (PDF, DOCX, TXT, etc)
3. Chunking (semantic, fixed-size, recursive)
4. Embedding generation (OpenAI ada-002, 1536 dimensions)
5. Vector indexing (pgvector)
6. Graph extraction (NebulaGraph - entidades e relações)

#### User Stories
1. **Como administrador, quero fazer upload de documentos** para alimentar a base de conhecimento
2. **Como administrador, quero visualizar progresso do processamento** em tempo real
3. **Como administrador, quero listar documentos de um Oráculo** para gerenciar a base
4. **Como administrador, quero reprocessar um documento** quando o pipeline for atualizado
5. **Como administrador, quero deletar um documento** e seus chunks/embeddings

#### Critérios de Aceitação

**Funcionalidade**:
- [x] Suporte a 30+ formatos: PDF, DOCX, XLSX, PPTX, TXT, MD, HTML, CSV, JSON, XML, MP3, MP4, etc
- [x] Drag-and-drop upload (multi-file)
- [x] Upload via URL (import from web)
- [x] Max file size: 100MB por arquivo
- [x] Batch upload (até 50 arquivos simultâneos)
- [x] Pipeline assíncrono (Celery ou Go channels)
- [x] Progress tracking (WebSocket real-time updates)

**Pipeline RAG**:
- [x] **Stage 1 - Upload**: Salvar arquivo em storage (0-20% progress)
- [x] **Stage 2 - Text Extraction**: Extrair texto do documento (20-40%)
  - PDF: PyPDF2 + pdfminer.six
  - DOCX: python-docx
  - Audio: Whisper API
  - Video: Whisper API (extract audio first)
- [x] **Stage 3 - Chunking**: Dividir texto em chunks (40-60%)
  - Strategy: Semantic chunking (LangChain RecursiveCharacterTextSplitter)
  - Chunk size: 1000 chars, overlap: 200 chars
- [x] **Stage 4 - Embedding**: Gerar embeddings (60-90%)
  - Model: OpenAI text-embedding-ada-002 (1536 dimensions)
  - Batch size: 100 chunks/request
- [x] **Stage 5 - Indexing**: Salvar no pgvector (90-100%)
  - Store: chunks + embeddings + metadata
  - Index: IVFFlat (faster than exact search, 99% recall)

**Performance**:
- [x] Upload <5s (10MB file)
- [x] Processing: 1 page/second (PDF)
- [x] Embedding: 100 chunks/second (OpenAI API)
- [x] Total pipeline: <2 min (100-page PDF)

**Segurança**:
- [x] Virus scan (ClamAV)
- [x] Content-Type validation (magic bytes, não apenas extensão)
- [x] Isolamento por Oráculo (documentos não compartilhados)

**UX/UI**:
- [x] Drag-and-drop zone (react-dropzone)
- [x] Upload queue com progress bars
- [x] Real-time status updates (WebSocket)
- [x] Document list table (sortable, searchable)
- [x] Preview de documentos (PDF viewer)

#### Implementação Técnica

**Backend (Python + FastAPI)**:
```python
# api/documents.py
from fastapi import UploadFile, Depends
from temporalio.client import Client as TemporalClient
import aiofiles
import uuid

@router.post("/oracles/{oracle_id}/documents/upload")
async def upload_document(
    oracle_id: UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    temporal_client: TemporalClient = Depends(get_temporal_client)
):
    # Validate file
    if file.size > 100 * 1024 * 1024:  # 100MB
        raise HTTPException(400, "File too large")

    # Save to storage
    file_path = f"/storage/{oracle_id}/{file.filename}"
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)

    # Create document record
    document = Document(
        oracle_id=oracle_id,
        filename=file.filename,
        file_path=file_path,
        file_size=file.size,
        mime_type=file.content_type,
        status="uploaded"
    )
    db.add(document)
    db.commit()

    # Start Temporal Workflow (long-running, durable document processing)
    workflow_id = f"process-document-{document.id}"

    await temporal_client.start_workflow(
        "ProcessDocumentWorkflow",
        ProcessDocumentRequest(
            document_id=document.id,
            oracle_id=oracle_id,
            file_path=file_path,
            mime_type=file.content_type
        ),
        id=workflow_id,
        task_queue="global-ai",  # Python workers (RAG processing)
        execution_timeout=timedelta(minutes=30),  # Long-running (large docs)
    )

    return {
        "id": document.id,
        "status": "processing",
        "workflow_id": workflow_id
    }

# Temporal Workflow Implementation (Python SDK)
# File: workflows/process_document_workflow.py
from temporalio import workflow
from temporalio.common import RetryPolicy
from datetime import timedelta
from dataclasses import dataclass

@dataclass
class ProcessDocumentRequest:
    document_id: str
    oracle_id: str
    file_path: str
    mime_type: str

@dataclass
class ProcessDocumentResult:
    chunk_count: int
    status: str
    error_message: str = None

@workflow.defn
class ProcessDocumentWorkflow:
    """
    Long-running workflow for document processing (RAG pipeline).
    Survives worker crashes, supports progress tracking via queries.
    """

    def __init__(self):
        self._progress = 0
        self._status = "initializing"
        self._chunk_count = 0

    @workflow.run
    async def run(self, req: ProcessDocumentRequest) -> ProcessDocumentResult:
        logger = workflow.logger
        logger.info(f"Starting ProcessDocument workflow for doc {req.document_id}")

        # Activity options with retry policy
        activity_options = workflow.ActivityOptions(
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(
                maximum_attempts=3,
                initial_interval=timedelta(seconds=1),
                maximum_interval=timedelta(seconds=10),
            ),
        )
        ctx = workflow.with_activity_options(activity_options)

        try:
            # Activity 1: Extract text from document (PDF, DOCX, etc)
            self._update_progress(20, "extracting")
            text = await workflow.execute_activity(
                "extract_text",
                args=[req.file_path, req.mime_type],
                activity_options=ctx,
            )
            logger.info(f"Text extracted: {len(text)} chars")

            # Activity 2: Chunk text (semantic chunking)
            self._update_progress(40, "chunking")
            chunks = await workflow.execute_activity(
                "chunk_text",
                args=[text],
                activity_options=ctx,
            )
            self._chunk_count = len(chunks)
            logger.info(f"Text chunked: {len(chunks)} chunks")

            # Activity 3: Generate embeddings (batch processing)
            self._update_progress(60, "embedding")

            # Long-running activity for embedding generation (30 min timeout)
            embedding_options = workflow.ActivityOptions(
                start_to_close_timeout=timedelta(minutes=30),
                heartbeat_timeout=timedelta(minutes=5),  # Progress heartbeats
                retry_policy=RetryPolicy(maximum_attempts=2),
            )

            await workflow.execute_activity(
                "generate_embeddings",
                args=[req.document_id, chunks],
                activity_options=embedding_options,
            )
            logger.info(f"Embeddings generated for {len(chunks)} chunks")

            # Activity 4: Create vector index (pgvector IVFFlat)
            self._update_progress(90, "indexing")
            await workflow.execute_activity(
                "create_vector_index",
                args=[req.document_id],
                activity_options=ctx,
            )

            # Activity 5: Finalize document status
            self._update_progress(100, "completed")
            await workflow.execute_activity(
                "finalize_document",
                args=[req.document_id, len(chunks)],
                activity_options=ctx,
            )

            logger.info(f"Document processing completed: {req.document_id}")
            return ProcessDocumentResult(
                chunk_count=len(chunks),
                status="completed"
            )

        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            self._update_progress(0, "failed")

            # Compensation: Update document status to failed
            await workflow.execute_activity(
                "mark_document_failed",
                args=[req.document_id, str(e)],
                activity_options=ctx,
            )

            return ProcessDocumentResult(
                chunk_count=0,
                status="failed",
                error_message=str(e)
            )

    def _update_progress(self, progress: int, status: str):
        """Internal method to update workflow state (queryable via Temporal)"""
        self._progress = progress
        self._status = status

    @workflow.query
    def get_progress(self) -> dict:
        """Query to check current progress (non-blocking)"""
        return {
            "progress": self._progress,
            "status": self._status,
            "chunk_count": self._chunk_count
        }

# Activities Implementation (Python)
# File: activities/document_activities.py
from temporalio import activity
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from typing import List
import PyPDF2
from docx import Document as DocxDocument

@activity.defn
async def extract_text(file_path: str, mime_type: str) -> str:
    """Extract text from PDF, DOCX, TXT, MD, etc"""

    if mime_type == "application/pdf":
        # Extract from PDF
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        # Extract from DOCX
        doc = DocxDocument(file_path)
        text = "\n".join([p.text for p in doc.paragraphs])
        return text

    elif mime_type in ["text/plain", "text/markdown"]:
        # Extract from TXT/MD
        with open(file_path, 'r') as f:
            return f.read()

    else:
        raise ValueError(f"Unsupported mime type: {mime_type}")

@activity.defn
async def chunk_text(text: str) -> List[str]:
    """Chunk text using LangChain RecursiveCharacterTextSplitter"""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = splitter.split_text(text)
    return chunks

@activity.defn
async def generate_embeddings(document_id: str, chunks: List[str]):
    """Generate embeddings for all chunks (batch processing, long-running)"""

    embeddings_model = OpenAIEmbeddings(model="text-embedding-ada-002")

    # Process in batches of 100 (OpenAI API limit)
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]

        # Generate embeddings for batch
        embeddings = embeddings_model.embed_documents(batch)

        # Save to database
        for j, (chunk, embedding) in enumerate(zip(batch, embeddings)):
            chunk_index = i + j

            db.execute("""
                INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
                VALUES (:doc_id, :idx, :content, :embedding)
            """, {
                "doc_id": document_id,
                "idx": chunk_index,
                "content": chunk,
                "embedding": embedding
            })

        # Report heartbeat to Temporal (prevent timeout)
        activity.heartbeat(f"Processed {i+len(batch)}/{len(chunks)} chunks")

@activity.defn
async def create_vector_index(document_id: str):
    """Create pgvector IVFFlat index for fast similarity search"""

    db.execute("""
        CREATE INDEX IF NOT EXISTS idx_chunks_embedding
        ON document_chunks
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    """)

@activity.defn
async def finalize_document(document_id: str, chunk_count: int):
    """Update document status to completed"""

    db.execute("""
        UPDATE documents
        SET status = 'completed', chunk_count = :chunk_count
        WHERE id = :doc_id
    """, {"doc_id": document_id, "chunk_count": chunk_count})

@activity.defn
async def mark_document_failed(document_id: str, error_message: str):
    """Update document status to failed (compensation)"""

    db.execute("""
        UPDATE documents
        SET status = 'failed', error_message = :error
        WHERE id = :doc_id
    """, {"doc_id": document_id, "error": error_message})

# Frontend can query progress via Temporal Client
# Example: client.get_workflow_handle(workflow_id).query("get_progress")
```

**Database (PostgreSQL + pgvector)**:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    chunk_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimensions
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, chunk_index)
);

-- IVFFlat index for fast similarity search (99% recall, 10× faster than exact)
CREATE INDEX idx_chunks_embedding
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### Dependências
- **RF001 completo**: Oráculos devem existir
- **Bibliotecas Python**: PyPDF2, python-docx, openai, langchain, pgvector
- **Serviços**: OpenAI API (embeddings), ClamAV (virus scan)

#### Testes Obrigatórios
- [x] `TestDocumentUpload` - Upload de arquivo
- [x] `TestDocumentProcessing` - Pipeline completo
- [x] `TestTextExtraction` - Extração de texto (PDF, DOCX)
- [x] `TestChunking` - Chunking semântico
- [x] `TestEmbeddingGeneration` - Embeddings OpenAI
- [x] `TestVectorIndexing` - pgvector IVFFlat
- [x] `TestProgressTracking` - WebSocket updates

**Cobertura Mínima**: ≥80%

---

### RF004: Chat IA Assistant (RAG Trimodal)
**Prioridade**: P0 (Crítico)
**Camada**: Camada 3 - Agentes (IA Assistant)
**Complexidade**: Muito Alta
**Story Points**: 46 SP

#### Descrição Detalhada
Implementar um **Chat IA Assistant** para cada Oráculo, capaz de responder perguntas usando **RAG Trimodal** (SQL + Vector + Graph). O assistente deve:
1. Receber pergunta do usuário
2. Gerar query SQL (consultar dados estruturados em PostgreSQL)
3. Gerar embedding da pergunta (buscar chunks similares em pgvector)
4. Gerar query Cypher (consultar grafo de conhecimento em NebulaGraph)
5. Combinar resultados das 3 fontes
6. Gerar resposta usando LLM (GPT-4 Turbo) com contexto enriquecido
7. Streamer resposta token-by-token via SSE

#### User Stories
1. **Como usuário, quero fazer perguntas ao Oráculo** para obter insights
2. **Como usuário, quero ver a resposta em tempo real** (streaming)
3. **Como usuário, quero ver as fontes usadas** (citações de documentos)
4. **Como usuário, quero refinar minha pergunta** (follow-up questions)
5. **Como usuário, quero exportar conversas** (JSON, PDF)

#### Critérios de Aceitação

**Funcionalidade**:
- [x] RAG Trimodal (SQL + Vector + Graph)
- [x] Streaming de resposta (SSE, token-by-token)
- [x] Citações de fontes (links para documentos)
- [x] Histórico de conversas (persistido)
- [x] Suporte a follow-up questions (contexto mantido)
- [x] Detecção de intenção (classificar tipo de pergunta)

**RAG Pipeline**:
- [x] **Step 1 - Intent Detection**: Classificar pergunta (factual, analytical, exploratory)
- [x] **Step 2 - SQL Query Generation**: Gerar SQL se pergunta envolve dados estruturados
- [x] **Step 3 - Vector Search**: Buscar top-5 chunks mais similares (cosine similarity)
- [x] **Step 4 - Graph Query**: Gerar Cypher se pergunta envolve relações/entidades
- [x] **Step 5 - Context Assembly**: Combinar resultados em um contexto único
- [x] **Step 6 - LLM Generation**: Gerar resposta usando GPT-4 Turbo
- [x] **Step 7 - Stream Response**: Enviar tokens via SSE

**Performance**:
- [x] Latência total (p95): <3s (sem streaming)
- [x] Time to First Token (TTFT): <500ms
- [x] Streaming: 30-50 tokens/segundo
- [x] Vector search: <100ms
- [x] SQL query: <200ms
- [x] Graph query: <300ms

**Segurança**:
- [x] Isolamento por Oráculo (usuário só acessa seu Oráculo)
- [x] Rate limiting (10 perguntas/minuto por usuário)
- [x] Input sanitization (evitar SQL injection, prompt injection)

**UX/UI**:
- [x] Chat interface (mensagens do usuário + IA)
- [x] Typing indicator (IA está pensando)
- [x] Streaming visual (tokens aparecem progressivamente)
- [x] Citações clicáveis (abrem documento fonte)
- [x] Feedback (👍 👎 para melhorar respostas)

#### Implementação Técnica

**Backend (Python + FastAPI)**:
```python
# api/chat.py
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter()

@router.post("/oracles/{oracle_id}/chat/stream")
async def chat_stream(oracle_id: UUID, message: str, conversation_id: UUID = None):
    """Stream chat response using Server-Sent Events"""

    async def event_generator():
        try:
            # Step 1: Intent detection
            intent = await detect_intent(message)
            yield {"event": "intent", "data": intent}

            # Step 2: SQL query (if needed)
            sql_results = None
            if intent in ["factual", "analytical"]:
                sql_query = await generate_sql_query(oracle_id, message)
                sql_results = await execute_sql_query(sql_query)
                yield {"event": "sql", "data": {"query": sql_query, "results": sql_results}}

            # Step 3: Vector search
            embedding = await generate_embedding(message)
            chunks = await vector_search(oracle_id, embedding, top_k=5)
            yield {"event": "chunks", "data": chunks}

            # Step 4: Graph query (if needed)
            graph_results = None
            if intent == "exploratory":
                cypher_query = await generate_cypher_query(oracle_id, message)
                graph_results = await execute_cypher_query(cypher_query)
                yield {"event": "graph", "data": {"query": cypher_query, "results": graph_results}}

            # Step 5: Assemble context
            context = assemble_context(sql_results, chunks, graph_results)

            # Step 6: Stream LLM response
            async for token in stream_llm_response(message, context):
                yield {"event": "token", "data": token}

            yield {"event": "done", "data": ""}

        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())

# services/rag_pipeline.py
import openai
from pgvector.psycopg2 import register_vector

async def vector_search(oracle_id: UUID, embedding: list[float], top_k: int = 5):
    """Search for similar chunks using pgvector cosine similarity"""

    query = """
        SELECT
            dc.id,
            dc.content,
            d.filename,
            1 - (dc.embedding <=> :embedding::vector) AS similarity
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.oracle_id = :oracle_id
        ORDER BY dc.embedding <=> :embedding::vector
        LIMIT :top_k
    """

    results = await db.execute(query, {
        "oracle_id": oracle_id,
        "embedding": embedding,
        "top_k": top_k
    })

    return [
        {
            "id": row.id,
            "content": row.content,
            "source": row.filename,
            "similarity": row.similarity
        }
        for row in results
    ]

async def stream_llm_response(message: str, context: str):
    """Stream GPT-4 Turbo response token-by-token"""

    system_prompt = f"""Você é um assistente IA especializado.
    Use o contexto abaixo para responder a pergunta do usuário.
    Se não souber a resposta, diga que não sabe.

    Contexto:
    {context}
    """

    response = await openai.ChatCompletion.acreate(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        temperature=0.7,
        max_tokens=2000,
        stream=True
    )

    async for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

**Frontend (Next.js + SSE)**:
```typescript
// hooks/useChat.ts
import { useEffect, useState } from 'react'

export function useChat(oracleId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    // Start streaming
    setIsStreaming(true)
    const aiMessage: Message = { role: 'assistant', content: '', timestamp: new Date() }
    setMessages(prev => [...prev, aiMessage])

    const eventSource = new EventSource(
      `/api/v1/oracles/${oracleId}/chat/stream?message=${encodeURIComponent(content)}`
    )

    eventSource.addEventListener('token', (e) => {
      const token = JSON.parse(e.data)
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

#### Dependências
- **RF001, RF002, RF003 completos**: Oráculos, Object Definitions, Documentos
- **Bibliotecas Python**: openai, langchain, pgvector, nebula3-python
- **Serviços**: OpenAI API (GPT-4 Turbo, embeddings), NebulaGraph

#### Testes Obrigatórios
- [x] `TestIntentDetection` - Classificar tipo de pergunta
- [x] `TestVectorSearch` - Buscar chunks similares
- [x] `TestSQLGeneration` - Gerar SQL válido
- [x] `TestCypherGeneration` - Gerar Cypher válido
- [x] `TestContextAssembly` - Combinar resultados
- [x] `TestStreamingResponse` - SSE streaming
- [x] `TestCitations` - Rastrear fontes usadas

**Cobertura Mínima**: ≥80%

---

## 📊 Matriz de Rastreabilidade

| Requisito | User Stories | Mockups | Sprints | Epics | Prioridade |
|-----------|-------------|---------|---------|-------|------------|
| RF001 | 6 stories | 01, 02, 03, 04 | 2, 3 | 1.1, 1.3 | P0 |
| RF002 | 6 stories | (future) | 4 | 1.4 | P0 |
| RF003 | 5 stories | 05 | 3 | 1.5 | P0 |
| RF004 | 5 stories | 07 | 4 | 1.6 | P0 |

---

## 🎯 Fora de Escopo (Fase 1)

❌ **Não implementar na Fase 1**:
- Agentes autônomos (CrewAI, LangChain Agents) → Fase 2
- Workflows automatizados → Fase 2
- MCP servers → Fase 2
- NebulaGraph (Graph DB) → Fase 3 (apenas vector search na Fase 1)
- Escalabilidade horizontal → Fase 4
- Multi-tenancy → Fase 4
- Observability avançada → Fase 4

---

## 📅 Cronograma

| Sprint | Duração | Requisitos | Story Points |
|--------|---------|------------|--------------|
| Sprint 1 | 1 semana | Setup & Foundation | 24 SP |
| Sprint 2 | 2 semanas | RF001 (Oráculos) | 34 SP |
| Sprint 3 | 2 semanas | RF003 (Documentos) | 38 SP |
| Sprint 4 | 2 semanas | RF002 + RF004 | 42 + 46 = 88 SP |
| Sprint 5 | 1 semana | Frontend Implementation | 46 SP |
| Sprint 6 | 1 semana | Testing & Deployment | 30 SP |

**Total**: 10 semanas (2.5 meses)

---

## ✅ Critérios de Aceitação da Fase 1

**Para considerar a Fase 1 COMPLETA**, todos os seguintes critérios devem ser atendidos:

### Funcionalidades
- [x] CRUD completo de Oráculos (RF001)
- [x] CRUD completo de Object Definitions (RF002)
- [x] Upload e processamento de documentos (RF003)
- [x] Chat IA Assistant com RAG (RF004)
- [x] 7 páginas de UI funcionais (mockups 01-07)

### Qualidade
- [x] Cobertura de testes ≥80%
- [x] 0 vulnerabilidades HIGH/CRITICAL
- [x] Performance: API p95 <500ms, Chat TTFT <500ms
- [x] Disponibilidade: 99% uptime

### Documentação
- [x] README completo
- [x] API documentation (OpenAPI/Swagger)
- [x] Deployment guide
- [x] User manual (básico)

### Deploy
- [x] Ambiente QA funcional
- [x] Ambiente Staging funcional
- [x] CI/CD pipeline funcionando

---

## 📚 Referências

- [requisitos_funcionais_v2.0.md](../../../documentation-base/requisitos_funcionais_v2.0.md)
- [arquitetura_supercore_v2.0.md](../../../documentation-base/arquitetura_supercore_v2.0.md)
- [stack_supercore_v2.0.md](../../../documentation-base/stack_supercore_v2.0.md)
- [BACKLOG_FASE_1.md](../BACKLOG_FASE_1.md)
- [SPRINTS_FASE_1.md](../SPRINTS_FASE_1.md)

---

**Versão**: 1.0.0
**Data**: 2025-12-28
**Autor**: Squad Produto (Product Owner + Business Analyst)
**Aprovado por**: Tech Lead (pendente)

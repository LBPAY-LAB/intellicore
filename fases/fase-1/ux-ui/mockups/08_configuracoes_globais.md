# 08 - Configurações Globais do Sistema

**Página**: `/configuracoes`
**Componentes**: Tabs, Form, Table, Modal
**Responsiva**: Desktop (primário), Tablet, Mobile
**Acesso**: Ícone ⚙️ no header principal (visível em todas as páginas)

---

## 📐 Layout ASCII

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ HEADER                                                            │   │
│ │ [⚙️ SuperCore v2.0]                    [🔔] [👤 Admin] [⚙️ Config] │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⚙️ Configurações do Sistema                                         │ │
│ │                                                                       │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐│ │
│ │ │ [Provedores LLM]  [Tipos de Oráculo]  [Geral]                   ││ │
│ │ └──────────────────────────────────────────────────────────────────┘│ │
│ │                                                                       │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ TAB 1: PROVEDORES LLM (Ativa)                                   │ │ │
│ │ │                                                                   │ │ │
│ │ │ ╔════════════════════════════════════════════════════════════╗  │ │ │
│ │ │ ║ Provedores Online                                          ║  │ │ │
│ │ │ ╚════════════════════════════════════════════════════════════╝  │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ [+ Adicionar Provedor Online]                               │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Provedor | Modelo              | API Key      | Status | ⋮ │ │ │ │
│ │ │ │──────────────────────────────────────────────────────────────│ │ │ │
│ │ │ │ OpenAI   │ GPT-4 Turbo         │ sk-***7A2E  │ ● Ativo │⋮ │ │ │ │
│ │ │ │ OpenAI   │ GPT-4               │ sk-***7A2E  │ ● Ativo │⋮ │ │ │ │
│ │ │ │ OpenAI   │ GPT-3.5 Turbo       │ sk-***7A2E  │ ● Ativo │⋮ │ │ │ │
│ │ │ │ Anthropic│ Claude 3 Opus       │ sk-***92F1  │ ● Ativo │⋮ │ │ │ │
│ │ │ │ Anthropic│ Claude 3 Sonnet     │ sk-***92F1  │ ● Ativo │⋮ │ │ │ │
│ │ │ │ Google   │ Gemini 1.5 Pro      │ AI-***KL9P  │ ⚪ Teste │⋮ │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ╔════════════════════════════════════════════════════════════╗  │ │ │
│ │ │ ║ Provedores Self-Hosted                                     ║  │ │ │
│ │ │ ╚════════════════════════════════════════════════════════════╝  │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ [+ Adicionar Provedor Self-Hosted]                          │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Provedor | Modelo        | Endpoint           | Status | ⋮ │ │ │ │
│ │ │ │──────────────────────────────────────────────────────────────│ │ │ │
│ │ │ │ Ollama   │ Llama 2 7B    │ localhost:11434    │ ● Ativo │⋮ │ │ │ │
│ │ │ │ Ollama   │ Mistral 7B    │ localhost:11434    │ ● Ativo │⋮ │ │ │ │
│ │ │ │ LocalAI  │ GPT-J 6B      │ 192.168.1.50:8080  │ ⚪ Teste │⋮ │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ℹ️ Provedores inativos não aparecem na seleção de Oráculos      │ │ │
│ │ │                                                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                       │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ TAB 2: TIPOS DE ORÁCULO                                         │ │ │
│ │ │                                                                   │ │ │
│ │ │ ╔════════════════════════════════════════════════════════════╗  │ │ │
│ │ │ ║ Gerenciar Tipos de Oráculo                                 ║  │ │ │
│ │ │ ╚════════════════════════════════════════════════════════════╝  │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ [+ Adicionar Tipo de Oráculo]                               │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Tipo           | Descrição                      | Em Uso  | Ações │ │ │ │
│ │ │ │────────────────────────────────────────────────────────────────────│ │ │ │
│ │ │ │ 🌍 RAG Global  │ Base conhecimento compartilhada│ 1 Orác. │ ✏️ │ │ │ │
│ │ │ │ Middleware     │ Integração entre sistemas      │ 8 Orác. │ ✏️ │ │ │ │
│ │ │ │ Portal Web     │ Interface web dinâmica          │ 3 Orác. │ ✏️ │ │ │ │
│ │ │ │ MCP Server     │ Servidor de contexto MCP        │ 5 Orác. │ ✏️ │ │ │ │
│ │ │ │ API Gateway    │ Gateway de APIs externas        │ 0 Orác. │ ✏️🗑️│ │ │ │
│ │ │ │ Data Pipeline  │ Pipeline de dados               │ 0 Orác. │ ✏️🗑️│ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ │                                                                   │ │ │
│ │ │ ⚠️ Tipos em uso não podem ser deletados (apenas editados)       │ │ │
│ │ │ ℹ️ Tipos inativos não aparecem ao criar/editar Oráculos         │ │ │
│ │ │                                                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Modal: Adicionar Provedor Online

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗   │
│ ║ Adicionar Provedor LLM Online                    [✕]  ║   │
│ ╚═══════════════════════════════════════════════════════╝   │
│                                                             │
│ Provedor *                                                  │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [OpenAI                               ▾]              │  │
│ └───────────────────────────────────────────────────────┘  │
│ Opções: OpenAI, Anthropic, Google, Cohere, Mistral         │
│                                                             │
│ Modelo *                                                    │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [GPT-4 Turbo                          ▾]              │  │
│ └───────────────────────────────────────────────────────┘  │
│ Opções (dependem do provedor):                             │
│ • OpenAI: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo               │
│ • Anthropic: Claude 3 Opus, Claude 3 Sonnet, Claude 3     │
│ • Google: Gemini 1.5 Pro, Gemini 1.0 Pro                  │
│                                                             │
│ API Key *                                                   │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ sk-proj-************************************************│  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ A chave será armazenada de forma segura (encrypted)    │
│                                                             │
│ Nome de Exibição (opcional)                                │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ GPT-4 Turbo - Produção                                │  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ Nome amigável para facilitar identificação              │
│                                                             │
│ ☑ Ativar imediatamente                                     │
│ ☑ Testar conexão antes de salvar                           │
│                                                             │
│ ┌────────────┐  ┌────────────┐                            │
│ │  Cancelar  │  │   Salvar   │                            │
│ └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Modal: Adicionar Provedor Self-Hosted

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗   │
│ ║ Adicionar Provedor LLM Self-Hosted              [✕]  ║   │
│ ╚═══════════════════════════════════════════════════════╝   │
│                                                             │
│ Provedor *                                                  │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [Ollama                               ▾]              │  │
│ └───────────────────────────────────────────────────────┘  │
│ Opções: Ollama, LocalAI, Text Generation WebUI, LM Studio │
│                                                             │
│ Modelo *                                                    │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ llama2:7b                                             │  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ Nome exato do modelo no servidor (case-sensitive)      │
│                                                             │
│ Endpoint URL *                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ http://localhost:11434                                │  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ URL base do servidor (sem /api ou /v1)                 │
│                                                             │
│ Authentication (opcional)                                   │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Bearer token ou API key (se requerido)                │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ Nome de Exibição (opcional)                                │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Llama 2 7B - Local Dev                                │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ☑ Ativar imediatamente                                     │
│ ☑ Testar conexão antes de salvar                           │
│                                                             │
│ ┌────────────┐  ┌────────────┐                            │
│ │  Cancelar  │  │   Salvar   │                            │
│ └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Modal: Adicionar Tipo de Oráculo

```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗   │
│ ║ Adicionar Tipo de Oráculo                        [✕]  ║   │
│ ╚═══════════════════════════════════════════════════════╝   │
│                                                             │
│ Nome do Tipo *                                              │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ API Gateway                                           │  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ Nome único e descritivo (ex: Middleware, Portal Web)   │
│                                                             │
│ Descrição *                                                 │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Gateway centralizado para integração com APIs         │  │
│ │ externas, permitindo proxy, rate limiting e cache...  │  │
│ │                                                        │  │
│ └───────────────────────────────────────────────────────┘  │
│ 85/500 caracteres                                          │
│                                                             │
│ Ícone (Emoji)                                               │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🌐                                                     │  │
│ └───────────────────────────────────────────────────────┘  │
│ ℹ️ Emoji representativo (opcional)                         │
│                                                             │
│ Status                                                      │
│ ☑ Ativo (visível ao criar/editar Oráculos)                │
│                                                             │
│ ┌────────────┐  ┌────────────┐                            │
│ │  Cancelar  │  │   Salvar   │                            │
│ └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes da Interface

### 1. Tabs Navigation
**Componente**: `<Tabs>` do shadcn/ui

```typescript
interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}
```

**Estilo**:
- Tabs horizontais com underline indicator
- Transição smooth ao trocar tabs
- Icons opcionais (⚡ para LLM, 🏷️ para Tipos)

### 2. Provider Table (Online)
**Componente**: `<Table>` customizado

```typescript
interface LLMProviderOnline {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'mistral';
  model: string;
  apiKey: string; // masked (sk-***7A2E)
  displayName?: string;
  status: 'active' | 'testing' | 'inactive';
  createdAt: Date;
  lastTested?: Date;
}
```

**Ações**:
- **Editar**: Modal com campos pré-preenchidos
- **Testar**: Executa teste de conectividade (API call simples)
- **Ativar/Desativar**: Toggle status
- **Deletar**: Confirmação (verificar se em uso por Oráculos)

### 3. Provider Table (Self-Hosted)
**Componente**: `<Table>` customizado

```typescript
interface LLMProviderSelfHosted {
  id: string;
  provider: 'ollama' | 'localai' | 'tgwui' | 'lmstudio';
  model: string;
  endpoint: string; // URL base
  auth?: string; // token/key opcional
  displayName?: string;
  status: 'active' | 'testing' | 'inactive';
  lastHealthCheck?: Date;
}
```

**Ações**: Similares ao provedor online

### 4. Oracle Type Table
**Componente**: `<Table>` customizado

```typescript
interface OracleType {
  id: string;
  name: string;
  slug: string; // auto-generated from name
  description: string;
  icon?: string; // emoji
  status: 'active' | 'inactive';
  oraclesCount: number; // quantos Oráculos usam este tipo
  createdAt: Date;
}

// Tipos padrão do sistema (incluindo RAG Global - RF001-E)
const DEFAULT_ORACLE_TYPES = [
  { slug: 'rag-global', name: 'RAG Global', icon: '🌍', description: 'Base de conhecimento compartilhada entre todos os Oráculos' },
  { slug: 'middleware', name: 'Middleware', icon: '🔄', description: 'Integração entre sistemas' },
  { slug: 'portal-web', name: 'Portal Web', icon: '🌐', description: 'Interface web dinâmica' },
  { slug: 'mcp-server', name: 'MCP Server', icon: '🔌', description: 'Servidor de contexto MCP' },
] as const;
```

**Regras**:
- **Editar**: Sempre permitido (atualiza nome, descrição, ícone, status)
- **Deletar**: Apenas se `oraclesCount === 0`
- **Status**: Se `inactive`, não aparece em dropdowns de criação/edição de Oráculos
- **RAG Global**: Tipo especial criado automaticamente no sistema (RF001-E), único oracle com `is_global=true`

---

## 🔐 Validações e Regras de Negócio

### Provedores LLM (Online)

**Validações**:
- ✅ API Key formato válido (provider-specific)
  - OpenAI: `sk-proj-` ou `sk-`
  - Anthropic: `sk-ant-`
  - Google: `AIza`
- ✅ Modelo existe no provedor selecionado
- ✅ Teste de conectividade opcional (recomendado)

**Regras**:
- Se provedor tem Oráculos ativos usando-o → não pode deletar (apenas desativar)
- API Keys armazenadas com criptografia AES-256
- Mascaramento em UI (mostrar apenas últimos 4 chars)

### Provedores LLM (Self-Hosted)

**Validações**:
- ✅ Endpoint URL válida (http/https)
- ✅ Endpoint acessível (health check ping)
- ✅ Modelo existe no servidor (via API discovery se disponível)

**Regras**:
- Health check automático a cada 5 minutos (background task)
- Se endpoint offline → status `inactive` automático

### Tipos de Oráculo

**Validações**:
- ✅ Nome único (case-insensitive)
- ✅ Descrição ≥20 caracteres
- ✅ Slug auto-gerado (lowercase, hífens, sem caracteres especiais)

**Regras**:
- Se `oraclesCount > 0` → não pode deletar (apenas editar/desativar)
- Se status `inactive` → não aparece em dropdowns de criação/edição
- Sistema sempre mantém pelo menos 3 tipos padrão (Middleware, Portal Web, MCP Server)

---

## 📱 Responsividade

### Desktop (≥1024px)
- Tabs lado a lado
- Tabelas com todas as colunas visíveis
- Modais width: 600px

### Tablet (768px - 1023px)
- Tabs scroll horizontal (se muitas)
- Colunas "Descrição" e "Em Uso" ocultadas (ver em modal)
- Modais width: 90vw

### Mobile (≤767px)
- Tabs como dropdown select
- Tabelas como cards verticais
- Modais fullscreen (100vw, 100vh)

---

## ⚡ Interações e Estados

### Teste de Conectividade (LLM Provider)

**Fluxo**:
1. Usuário clica "Testar" ou marca checkbox "Testar conexão antes de salvar"
2. Sistema envia request simples ao provedor:
   - Online: `POST /v1/chat/completions` com prompt "Hello"
   - Self-hosted: `GET /health` ou equivalente
3. Exibe resultado:
   - ✅ **Sucesso**: "Conexão OK - Latência: 342ms"
   - ❌ **Falha**: "Erro: Invalid API key" ou "Endpoint unreachable"

**Estados**:
- 🔄 **Testing**: Loading spinner
- ✅ **Success**: Green checkmark + latência
- ❌ **Failed**: Red X + mensagem de erro

### Deletar Tipo de Oráculo

**Fluxo**:
1. Usuário clica 🗑️ (apenas visível se `oraclesCount === 0`)
2. Modal de confirmação:
   ```
   ⚠️ Confirmar Deleção

   Tem certeza que deseja deletar o tipo "API Gateway"?

   Esta ação é irreversível.

   [Cancelar]  [Deletar]
   ```
3. Se confirmado → DELETE `/api/oracle-types/:id`

**Proteção**:
- Se `oraclesCount > 0` → Botão 🗑️ desabilitado com tooltip:
  ```
  Não é possível deletar este tipo pois existem 5 Oráculos usando-o.
  Para remover, primeiro reatribua os Oráculos ou desative o tipo.
  ```

---

## 🎯 User Flows

### 1. Adicionar Provedor OpenAI

```mermaid
graph TD
    A[Página Configurações] --> B[Tab "Provedores LLM"]
    B --> C[Click "+ Adicionar Provedor Online"]
    C --> D[Modal Aberto]
    D --> E[Selecionar Provedor: OpenAI]
    E --> F[Selecionar Modelo: GPT-4 Turbo]
    F --> G[Inserir API Key: sk-proj-***]
    G --> H[Marcar: Testar conexão]
    H --> I[Click "Salvar"]
    I --> J{Teste OK?}
    J -->|Sim| K[Provider Salvo - Status: Ativo]
    J -->|Não| L[Erro exibido - Corrigir API Key]
    L --> G
    K --> M[Provider aparece na tabela]
    M --> N[Disponível em dropdowns de Oráculos]
```

### 2. Criar Novo Tipo de Oráculo

```mermaid
graph TD
    A[Página Configurações] --> B[Tab "Tipos de Oráculo"]
    B --> C[Click "+ Adicionar Tipo de Oráculo"]
    C --> D[Modal Aberto]
    D --> E[Preencher Nome: API Gateway]
    E --> F[Preencher Descrição]
    F --> G[Escolher Ícone: 🌐]
    G --> H[Marcar: Ativo]
    H --> I[Click "Salvar"]
    I --> J[Tipo salvo - Slug gerado: api-gateway]
    J --> K[Tipo aparece na tabela]
    K --> L[Disponível ao criar/editar Oráculos]
```

---

## 🧪 Cenários de Teste

### Teste 1: Provedor Online com API Key Inválida
**Dado**: Usuário adiciona OpenAI com API key `sk-invalid123`
**Quando**: Marca "Testar conexão" e clica "Salvar"
**Então**: Erro exibido "Invalid API key - Authentication failed"
**E**: Provider não é salvo

### Teste 2: Deletar Tipo de Oráculo em Uso
**Dado**: Tipo "Middleware" tem 8 Oráculos usando-o
**Quando**: Usuário tenta clicar botão 🗑️
**Então**: Botão está desabilitado
**E**: Tooltip explica motivo

### Teste 3: Provedor Self-Hosted Offline
**Dado**: Provedor Ollama configurado em `localhost:11434`
**Quando**: Servidor Ollama está offline
**Então**: Health check falha
**E**: Status automaticamente muda para "Inactive"
**E**: Tooltip na tabela mostra "Last check failed: Connection refused"

### Teste 4: Criar Tipo com Nome Duplicado
**Dado**: Tipo "Middleware" já existe
**Quando**: Usuário cria tipo com nome "middleware" (case-insensitive)
**Então**: Erro de validação "Nome já existe"
**E**: Modal permanece aberto para correção

---

## 📊 Métricas e Monitoramento

### Provedores LLM
- **Latência média**: Calculada nos últimos 100 requests
- **Taxa de sucesso**: % de requests bem-sucedidos
- **Custo acumulado**: Tracking de tokens consumidos (online only)

### Tipos de Oráculo
- **Oráculos por tipo**: Distribuição
- **Tipos mais usados**: Ranking

**Dashboards** (futuro):
- Gráfico de uso de provedores
- Gráfico de custos por provedor
- Timeline de health checks (self-hosted)

---

## 🔗 Integração com Outros Componentes

### Impacto em Oráculos (01, 02, 04)
- Dropdown "Tipo de Oráculo" → Populado de `GET /api/oracle-types?status=active`
- Dropdown "Provedor de LLM" → Populado de `GET /api/llm-providers?status=active`

### Backend APIs Necessárias

**LLM Providers**:
- `GET /api/llm-providers` - Listar todos
- `POST /api/llm-providers` - Criar novo
- `PUT /api/llm-providers/:id` - Editar
- `DELETE /api/llm-providers/:id` - Deletar
- `POST /api/llm-providers/:id/test` - Testar conectividade

**Oracle Types**:
- `GET /api/oracle-types` - Listar todos
- `POST /api/oracle-types` - Criar novo
- `PUT /api/oracle-types/:id` - Editar
- `DELETE /api/oracle-types/:id` - Deletar (apenas se `oraclesCount === 0`)

---

## ✅ Critérios de Aceitação

### Provedor LLM Online
- [ ] Adicionar OpenAI, Anthropic, Google com API key
- [ ] Testar conectividade antes de salvar
- [ ] API keys armazenadas com criptografia
- [ ] API keys exibidas mascaradas (sk-***7A2E)
- [ ] Editar provedor existente
- [ ] Ativar/desativar provedor
- [ ] Deletar provedor (apenas se não em uso)
- [ ] Provedores inativos não aparecem em dropdowns de Oráculos

### Provedor LLM Self-Hosted
- [ ] Adicionar Ollama, LocalAI com endpoint URL
- [ ] Testar conectividade antes de salvar
- [ ] Health check automático a cada 5 minutos
- [ ] Status atualizado automaticamente se endpoint offline
- [ ] Editar endpoint ou modelo
- [ ] Deletar provedor (apenas se não em uso)

### Tipos de Oráculo
- [ ] Criar novo tipo com nome, descrição, ícone
- [ ] Slug gerado automaticamente
- [ ] Editar tipo existente (nome, descrição, ícone, status)
- [ ] Desativar tipo (tipos inativos não aparecem em dropdowns)
- [ ] Deletar tipo (apenas se `oraclesCount === 0`)
- [ ] Botão deletar desabilitado se tipo em uso
- [ ] Tooltip explicativo em botão deletar desabilitado
- [ ] Sistema mantém 3 tipos padrão sempre ativos

### Responsividade
- [ ] Desktop: Layout tabela completo
- [ ] Tablet: Colunas secundárias ocultadas
- [ ] Mobile: Tabelas como cards verticais, modais fullscreen

---

## 🎨 Design Tokens

**Cores**:
- Provider status Ativo: `bg-green-500`
- Provider status Teste: `bg-yellow-500`
- Provider status Inativo: `bg-gray-400`
- Botão Deletar desabilitado: `text-gray-400 cursor-not-allowed`

**Tipografia**:
- Tab labels: `font-medium text-sm`
- Table headers: `font-semibold text-xs uppercase tracking-wider`
- Modals: `font-normal text-sm`

**Espaçamento**:
- Tabs gap: `gap-6`
- Table row padding: `px-6 py-4`
- Modal padding: `p-6`

---

## 🚀 Prioridade

**P0 (Fase 1)**:
- ✅ Tab "Provedores LLM" - Online (OpenAI, Anthropic)
- ✅ Tab "Tipos de Oráculo" - CRUD completo
- ✅ Modal adicionar provedor online
- ✅ Modal adicionar tipo de oráculo

**P1 (Fase 2)**:
- Tab "Provedores LLM" - Self-Hosted (Ollama, LocalAI)
- Health check automático
- Métricas de latência e custo

**P2 (Fase 3)**:
- Tab "Geral" (outras configurações globais)
- Dashboard de uso de provedores
- Alertas de falha de conectividade

---

**Status**: 🎨 Design Final
**Criado**: 2025-12-29
**Atualizado**: 2025-12-29
**Aprovação**: ⏳ Aguardando validação

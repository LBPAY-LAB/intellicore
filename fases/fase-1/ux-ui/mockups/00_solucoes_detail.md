# 00 - Dashboard da Solução (Detalhes)

**Página**: `/solucoes/{slug}` (ex: `/solucoes/lbpay-core-banking`)
**Componentes**: Dashboard Layout, Stats Grid, Table, Tabs
**Responsiva**: Desktop (primário), Tablet, Mobile
**Acesso**: Click "Abrir Solução" da home page

---

## 📐 Layout ASCII

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────────┐   │
│ │ HEADER                                                            │   │
│ │ [🏢 SuperCore] > [Soluções] > [LBPAY Core Banking]                │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────────────────────┐│ │
│ │ │ 🏦 LBPAY Core Banking                       [Editar] [⋮ Ações]  ││ │
│ │ │                                                                   ││ │
│ │ │ lbpay-core-banking  •  ● Ativa  •  Criada em 15 Jan 2025        ││ │
│ │ │                                                                   ││ │
│ │ │ Plataforma completa de core banking para fintechs, incluindo... ││ │
│ │ └──────────────────────────────────────────────────────────────────┘│ │
│ │                                                                       │ │
│ │ ╔════════════════════════════════════════════════════════════════╗  │ │
│ │ ║ Métricas da Solução                                            ║  │ │
│ │ ╚════════════════════════════════════════════════════════════════╝  │ │
│ │                                                                       │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │ │
│ │ │ 8 Oráculos   │ │ 342 Objetos  │ │ 24 Agentes   │ │ 5 MCPs      │ │ │
│ │ │  7 Ativos    │ │  289 Ativos  │ │  21 Ativos   │ │  4 Ativos   │ │ │
│ │ │  +2 vs. mês  │ │  +45 vs. mês │ │  +8 vs. mês  │ │  +1 vs. mês │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │ │
│ │                                                                       │ │
│ │ ╔════════════════════════════════════════════════════════════════╗  │ │
│ │ ║ RAG Global                                                     ║  │ │
│ │ ╚════════════════════════════════════════════════════════════════╝  │ │
│ │                                                                       │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐│ │
│ │ │ 🌍 RAG Global - LBPAY Core Banking                   [Ver Chat] ││ │
│ │ │                                                                   ││ │
│ │ │ Status: ✅ Ativo  •  LLM: OpenAI GPT-4 Turbo  •  1.2k Docs      ││ │
│ │ │ Embedding: text-embedding-3-large (1536 dims)  •  89% Cobertura ││ │
│ │ │                                                                   ││ │
│ │ │ 📊 Última Sync: 2 min atrás  •  🔄 Processing: 3 docs pendentes ││ │
│ │ └──────────────────────────────────────────────────────────────────┘│ │
│ │                                                                       │ │
│ │ ╔════════════════════════════════════════════════════════════════╗  │ │
│ │ ║ Oráculos da Solução                                            ║  │ │
│ │ ╚════════════════════════════════════════════════════════════════╝  │ │
│ │                                                                       │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐│ │
│ │ │ [+ Adicionar Oráculo]         [🔍 Buscar...]      [Filtros ▾]  ││ │
│ │ └──────────────────────────────────────────────────────────────────┘│ │
│ │                                                                       │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐│ │
│ │ │ Nome            | Tipo        | LLM Provider    | Status  | ⋮   ││ │
│ │ │────────────────────────────────────────────────────────────────  ││ │
│ │ │ Payment Gateway │ Middleware  │ GPT-4 Turbo     │ ● Ativo │ ⋮   ││ │
│ │ │ Compliance Bot  │ MCP Server  │ Claude 3 Opus   │ ● Ativo │ ⋮   ││ │
│ │ │ KYC Validator   │ Portal Web  │ GPT-4           │ ● Ativo │ ⋮   ││ │
│ │ │ Fraud Detector  │ Middleware  │ GPT-3.5 Turbo   │ ⚪ Teste│ ⋮   ││ │
│ │ │ Report Builder  │ Portal Web  │ GPT-4 Turbo     │ ● Ativo │ ⋮   ││ │
│ │ │ Audit Logger    │ MCP Server  │ Ollama Llama 2  │ ● Ativo │ ⋮   ││ │
│ │ │ Data Pipeline   │ Middleware  │ GPT-4           │ ⚪ Inativ│ ⋮   ││ │
│ │ └──────────────────────────────────────────────────────────────────┘│ │
│ │                                                                       │ │
│ │ [Página 1 de 1]    [10 / 25 / 50 / 100 por página]                  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes da Interface

### 1. Solution Header Card
**Componente**: Custom card com hero layout

```typescript
interface SolutionHeaderProps {
  solution: {
    id: string;
    name: string; // "LBPAY Core Banking"
    slug: string; // "lbpay-core-banking"
    icon: string; // "🏦"
    description: string;
    status: 'active' | 'testing' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
  };
  onEdit: () => void;
  onActions: () => void; // Dropdown: Duplicar, Exportar, Desativar, Deletar
}
```

**Layout**:
```tsx
<Card className="mb-6 border-l-4 border-l-primary-500">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <span className="text-6xl">{solution.icon}</span>
        <div>
          <CardTitle className="text-3xl">{solution.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-neutral-600 mt-2">
            <code className="bg-neutral-100 px-2 py-1 rounded">{solution.slug}</code>
            <span>•</span>
            <Badge variant={solution.status === 'active' ? 'success' : 'secondary'}>
              {solution.status === 'active' ? '● Ativa' : '⚪ Teste'}
            </Badge>
            <span>•</span>
            <span>Criada em {format(solution.createdAt, 'dd MMM yyyy')}</span>
          </div>
          <p className="text-neutral-600 mt-3 max-w-2xl">
            {solution.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              📋 Duplicar Solução
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              💾 Exportar Configuração
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeactivate}>
              ⚠️ Desativar Solução
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600"
            >
              🗑️ Deletar Solução
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </CardHeader>
</Card>
```

---

### 2. Metrics Grid
**Componente**: 4 cards com métricas + trends

```typescript
interface SolutionMetrics {
  oracles: {
    total: number; // 8
    active: number; // 7
    trend: { value: number; direction: 'up' | 'down' }; // +2
  };
  objects: {
    total: number; // 342
    active: number; // 289
    trend: { value: number; direction: 'up' }; // +45
  };
  agents: {
    total: number; // 24
    active: number; // 21
    trend: { value: number; direction: 'up' }; // +8
  };
  mcpServers: {
    total: number; // 5
    active: number; // 4
    trend: { value: number; direction: 'up' }; // +1
  };
}
```

**Card Layout**:
```tsx
<div className="grid grid-cols-4 gap-4 mb-6">
  {[
    {
      icon: '🔮',
      label: 'Oráculos',
      value: metrics.oracles.total,
      activeValue: metrics.oracles.active,
      trend: metrics.oracles.trend,
      color: 'primary',
    },
    {
      icon: '📦',
      label: 'Objetos',
      value: metrics.objects.total,
      activeValue: metrics.objects.active,
      trend: metrics.objects.trend,
      color: 'blue',
    },
    {
      icon: '🤖',
      label: 'Agentes',
      value: metrics.agents.total,
      activeValue: metrics.agents.active,
      trend: metrics.agents.trend,
      color: 'green',
    },
    {
      icon: '🔌',
      label: 'MCPs',
      value: metrics.mcpServers.total,
      activeValue: metrics.mcpServers.active,
      trend: metrics.mcpServers.trend,
      color: 'purple',
    },
  ].map((metric) => (
    <Card key={metric.label}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{metric.icon}</span>
          <TrendIndicator trend={metric.trend} />
        </div>
        <div className="text-3xl font-bold">{metric.value}</div>
        <div className="text-sm text-neutral-600">{metric.label}</div>
        <div className="text-xs text-neutral-500 mt-1">
          {metric.activeValue} Ativos
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**TrendIndicator Component**:
```tsx
function TrendIndicator({ trend }: { trend: { value: number; direction: 'up' | 'down' } }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${
      trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
    }`}>
      {trend.direction === 'up' ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{Math.abs(trend.value)} vs. mês</span>
    </div>
  );
}
```

---

### 3. RAG Global Status Card
**Componente**: Highlighted card com status detalhado

```typescript
interface RAGGlobalStatus {
  oracle: {
    id: string;
    name: string; // "RAG Global - LBPAY Core Banking"
    status: 'active' | 'inactive' | 'error';
  };
  llmProvider: {
    name: string; // "OpenAI"
    model: string; // "GPT-4 Turbo"
  };
  embedding: {
    model: string; // "text-embedding-3-large"
    dimensions: number; // 1536
  };
  documents: {
    total: number; // 1200
    indexed: number; // 1070
    processing: number; // 3
    failed: number; // 127
    coverage: number; // 89% (indexed / total)
  };
  lastSync: Date;
}
```

**Layout**:
```tsx
<Card className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🌍</span>
        <div>
          <CardTitle>{ragStatus.oracle.name}</CardTitle>
          <div className="flex items-center gap-3 text-sm text-neutral-600 mt-1">
            <Badge variant={ragStatus.oracle.status === 'active' ? 'success' : 'destructive'}>
              {ragStatus.oracle.status === 'active' ? '✅ Ativo' : '❌ Inativo'}
            </Badge>
            <span>•</span>
            <span>LLM: {ragStatus.llmProvider.name} {ragStatus.llmProvider.model}</span>
            <span>•</span>
            <span>{ragStatus.documents.total.toLocaleString()} Docs</span>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={() => navigate(`/oracles/${ragStatus.oracle.id}/chat`)}>
        Ver Chat
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-neutral-600">Embedding:</span>{' '}
        <span className="font-medium">
          {ragStatus.embedding.model} ({ragStatus.embedding.dimensions} dims)
        </span>
      </div>
      <div>
        <span className="text-neutral-600">Cobertura:</span>{' '}
        <span className="font-medium">{ragStatus.documents.coverage}%</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-neutral-500" />
        <span className="text-neutral-600">Última Sync:</span>{' '}
        <span className="font-medium">{formatDistanceToNow(ragStatus.lastSync)} atrás</span>
      </div>
      {ragStatus.documents.processing > 0 && (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          <span className="text-neutral-600">Processing:</span>{' '}
          <span className="font-medium">{ragStatus.documents.processing} docs pendentes</span>
        </div>
      )}
    </div>

    {/* Progress Bar de Cobertura */}
    <div className="mt-4">
      <div className="flex justify-between text-xs text-neutral-600 mb-1">
        <span>Documentos Indexados</span>
        <span>{ragStatus.documents.indexed} / {ragStatus.documents.total}</span>
      </div>
      <Progress value={ragStatus.documents.coverage} className="h-2" />
    </div>
  </CardContent>
</Card>
```

---

### 4. Oracles Table
**Componente**: Filterable sortable table

```typescript
interface Oracle {
  id: string;
  name: string;
  type: {
    id: string;
    name: string; // "Middleware", "Portal Web", etc.
    slug: string;
  };
  llmProvider: {
    provider: string; // "openai", "anthropic"
    model: string; // "GPT-4 Turbo"
  };
  status: 'active' | 'testing' | 'inactive';
  createdAt: Date;

  // Métricas agregadas
  metrics: {
    objectsCount: number;
    agentsCount: number;
    mcpServersCount: number;
  };
}
```

**Table Layout**:
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Oráculos da Solução</CardTitle>
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate(`/solucoes/${solution.slug}/oracles/new`)}>
          + Adicionar Oráculo
        </Button>
      </div>
    </div>

    {/* Search + Filters */}
    <div className="flex items-center gap-2 mt-4">
      <Input
        placeholder="🔍 Buscar oráculos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tipo de Oráculo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          <SelectItem value="middleware">Middleware</SelectItem>
          <SelectItem value="portal-web">Portal Web</SelectItem>
          <SelectItem value="mcp-server">MCP Server</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="testing">Teste</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardHeader>

  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>LLM Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOracles.map((oracle) => (
          <TableRow
            key={oracle.id}
            className="cursor-pointer hover:bg-neutral-50"
            onClick={() => navigate(`/oracles/${oracle.id}`)}
          >
            <TableCell className="font-medium">{oracle.name}</TableCell>
            <TableCell>{oracle.type.name}</TableCell>
            <TableCell>
              {oracle.llmProvider.provider === 'openai' && '🤖 '}
              {oracle.llmProvider.provider === 'anthropic' && '🧠 '}
              {oracle.llmProvider.model}
            </TableCell>
            <TableCell>
              <Badge variant={
                oracle.status === 'active' ? 'success' :
                oracle.status === 'testing' ? 'warning' :
                'secondary'
              }>
                {oracle.status === 'active' ? '● Ativo' :
                 oracle.status === 'testing' ? '⚪ Teste' :
                 '⚪ Inativo'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/oracles/${oracle.id}`)}>
                    👁️ Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/oracles/${oracle.id}/edit`)}>
                    ✏️ Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/oracles/${oracle.id}/chat`)}>
                    💬 Conversar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    🗑️ Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Pagination */}
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-neutral-600">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="25">25 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
            <SelectItem value="100">100 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🔄 User Flows

### Flow 1: Navegar para Dashboard da Solução

```mermaid
graph TD
    A[Home Page] --> B[Click "Abrir Solução" em card]
    B --> C[GET /api/solutions/lbpay-core-banking]
    C --> D[Carregar Métricas]
    D --> E[Carregar RAG Global Status]
    E --> F[Carregar Lista de Oráculos]
    F --> G[Dashboard completo renderizado]
```

### Flow 2: Adicionar Novo Oráculo à Solução

```mermaid
graph TD
    A[Dashboard da Solução] --> B[Click + Adicionar Oráculo]
    B --> C[Navegar: /solucoes/lbpay-core-banking/oracles/new]
    C --> D[Formulário pré-preenchido com solution_id]
    D --> E[Preencher Nome, Tipo, LLM Provider]
    E --> F[POST /api/oracles]
    F --> G{Sucesso?}
    G -->|Sim| H[Oráculo criado ✓]
    H --> I[Redirect: /oracles/{id}]
    G -->|Não| J[Erro exibido + Corrigir]
    J --> E
```

### Flow 3: Ver Chat do RAG Global

```mermaid
graph TD
    A[Dashboard da Solução] --> B[Click "Ver Chat" no card RAG Global]
    B --> C[Navegar: /oracles/{rag_global_id}/chat]
    C --> D[Interface de Chat IA Assistant]
    D --> E[Usuário faz perguntas]
    E --> F[RAG busca em documentos globais]
    F --> G[LLM gera resposta]
    G --> H[Resposta exibida com fontes]
```

### Flow 4: Deletar Solução

```mermaid
graph TD
    A[Dashboard da Solução] --> B[Click ⋮ Ações > Deletar Solução]
    B --> C[Modal de Confirmação]
    C --> D{Tem Oráculos ativos?}
    D -->|Sim| E[Erro: Desative/delete oráculos primeiro]
    E --> A

    D -->|Não| F[Confirmação: Digite nome da solução]
    F --> G{Nome correto?}
    G -->|Não| H[Erro: Nome incorreto]
    H --> F

    G -->|Sim| I[DELETE /api/solutions/{id}]
    I --> J[Cascade delete: RAG Global + Oráculos]
    J --> K[Toast: Solução deletada ✓]
    K --> L[Redirect: /solucoes (Home)]
```

---

## 🔐 Validações e Regras de Negócio

### Métricas
- **Atualização**: Real-time via WebSocket ou polling (5s)
- **Cálculo**:
  - Oráculos: COUNT(*) FROM oracles WHERE solution_id = ? AND is_global = false
  - Objetos: Agregação de todas as object_instances dos oráculos da solução
  - Agentes: COUNT(*) FROM ai_agents WHERE solution_id = ?
  - MCPs: COUNT(*) FROM mcp_servers WHERE solution_id = ?

### RAG Global
- **Único por Solução**: Apenas 1 oráculo com `is_global = true`
- **Auto-criado**: Criado automaticamente ao criar solução
- **Não deletável**: Apenas desativado (status: inactive)
- **Status**:
  - ✅ **Ativo**: LLM provider ativo + embeddings configurados
  - ❌ **Inativo**: LLM provider offline ou erro de configuração

### Oráculos
- **Filtros**:
  - Tipo: Multi-select (Middleware, Portal Web, MCP Server, etc.)
  - Status: Multi-select (Ativo, Teste, Inativo)
- **Busca**: Nome (case-insensitive, debounce 300ms)
- **Ordenação**: Nome (A-Z), Data Criação (Recente/Antiga), Status

### Ações Dropdown (Solução)
- **Editar**: Navega para `/solucoes/{slug}/edit`
- **Duplicar**: Cria cópia da solução (novo slug, mesma config)
- **Exportar**: Download JSON com config completa
- **Desativar**: Muda status para `inactive` (oráculos continuam funcionando)
- **Deletar**:
  - ❌ Bloqueado se tem oráculos ativos (status: active ou testing)
  - ✅ Permitido se todos os oráculos inativos ou já deletados
  - Confirmação: Usuário deve digitar nome exato da solução

---

## 📱 Responsividade

### Desktop (≥1024px)
- Metrics Grid: 4 colunas
- Table: Todas as colunas visíveis
- RAG Global Card: Layout horizontal

### Tablet (768px - 1023px)
- Metrics Grid: 2 colunas (2 linhas)
- Table: Ocultar coluna "Tipo" (ver em modal)
- RAG Global Card: Layout vertical

### Mobile (≤767px)
- Metrics Grid: 1 coluna (scroll horizontal alternativo)
- Table: Cards verticais (estilo mobile)
- RAG Global Card: Stack vertical
- Buttons: Full width

---

## 🧪 Cenários de Teste

### Teste 1: Dashboard com RAG Global Processando
**Dado**: Solução tem RAG Global com 3 docs processando
**Quando**: Dashboard carregado
**Então**: Card RAG Global mostra "🔄 Processing: 3 docs pendentes"
**E**: Ícone de spinning (RefreshCw) visível

### Teste 2: Filtrar Oráculos por Tipo
**Dado**: Solução tem 8 oráculos (3 Middleware, 2 Portal, 3 MCP)
**Quando**: Selecionar filtro "Tipo: Middleware"
**Então**: Apenas 3 oráculos exibidos na tabela

### Teste 3: Deletar Solução com Oráculos Ativos
**Dado**: Solução tem 5 oráculos ativos
**Quando**: Tentar deletar solução
**Então**: Erro "Não é possível deletar. Desative ou delete os 5 oráculos ativos primeiro."
**E**: Modal de confirmação não abre

### Teste 4: Ver Chat do RAG Global
**Dado**: RAG Global está ativo
**Quando**: Click "Ver Chat"
**Então**: Navega para `/oracles/{rag_global_id}/chat`
**E**: Interface de chat carregada com histórico

### Teste 5: Adicionar Novo Oráculo
**Dado**: Dashboard da solução aberto
**Quando**: Click "+ Adicionar Oráculo"
**Então**: Navega para formulário de criação
**E**: Campo `solution_id` pré-preenchido (hidden)

---

## ✅ Critérios de Aceitação

### Header
- [ ] Exibir nome, ícone, slug, status, data criação
- [ ] Botão "Editar" navega para `/solucoes/{slug}/edit`
- [ ] Dropdown "⋮ Ações" com 5 opções

### Métricas
- [ ] 4 cards: Oráculos, Objetos, Agentes, MCPs
- [ ] Exibir total + ativos + trend
- [ ] Trend com ícone ↑ verde ou ↓ vermelho
- [ ] Atualização real-time (WebSocket ou polling 5s)

### RAG Global Card
- [ ] Exibir nome, status, LLM provider, modelo
- [ ] Exibir embedding model e dimensões
- [ ] Exibir total de docs, cobertura (%)
- [ ] Progress bar de indexação
- [ ] Mostrar "Processing: X docs" se houver pendentes
- [ ] Botão "Ver Chat" navega para chat do RAG Global

### Oracles Table
- [ ] Exibir todos os oráculos da solução (exceto RAG Global)
- [ ] Busca por nome (debounce 300ms)
- [ ] Filtro por tipo (multi-select)
- [ ] Filtro por status (multi-select)
- [ ] Dropdown ações: Ver, Editar, Chat, Deletar
- [ ] Paginação (10/25/50/100 por página)

### Ações
- [ ] Deletar bloqueado se oráculos ativos
- [ ] Deletar requer confirmação (digitar nome)
- [ ] Duplicar cria cópia com novo slug
- [ ] Exportar gera JSON de configuração

---

## 🚀 Prioridade

**P0 (Fase 1 - Crítico)**:
- ✅ Dashboard completo com métricas
- ✅ RAG Global status card
- ✅ Oracles table com filtros
- ✅ Botão "+ Adicionar Oráculo"
- ✅ Ações: Editar, Deletar (com validações)

**P1 (Fase 2)**:
- Gráficos de métricas (line charts, evolução temporal)
- WebSocket para updates real-time
- Exportar/Importar configuração JSON
- Duplicar solução

**P2 (Fase 3)**:
- Tabs: Overview, Oráculos, Objetos, Agentes, MCPs
- Dashboard executivo com KPIs
- Comparação entre soluções

---

**Status**: 🎨 Design Pronto
**Criado**: 2025-12-29
**Atualizado**: 2025-12-29
**Aprovação**: ⏳ Aguardando validação

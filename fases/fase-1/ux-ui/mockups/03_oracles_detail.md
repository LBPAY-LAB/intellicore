# 📄 Mockup 03: `/oracles/{id}` - Detalhes do Oráculo

**Versão**: 1.0.0
**Data**: 2025-12-28
**Sprint**: Sprint 1 - Fundação (Epic 1.2)
**Prioridade**: High
**Story Points**: 2 SP
**Estimativa**: 2h

---

## 📋 Overview

Tela de visualização detalhada de um Oráculo específico, mostrando metadados, estatísticas, configurações, e ações disponíveis. Serve como hub central para acessar todas as funcionalidades relacionadas ao Oráculo.

### Requisitos Relacionados
- **RF001**: Visualizar detalhes de Oráculo via API REST
- **RF003**: Gerenciar Ciclo de Vida de Oráculos
- **RF015**: Visualizar configurações de Oráculos

### User Story
> **Como** administrador do sistema
> **Quero** visualizar todos os detalhes de um Oráculo específico
> **Para que** eu possa entender seu estado atual e acessar funcionalidades relacionadas

---

## 🎨 Layout Visual (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ [← Voltar] Detalhes do Oráculo                 [?] [User ▾]     │   │
│ └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Breadcrumb                                                              │
│ Home > Oráculos > Oráculo de Compliance Bancário                       │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Title Bar                                                        │   │
│ │                                                                  │   │
│ │ 📊 Oráculo de Compliance Bancário                               │   │
│ │                                                                  │   │
│ │ [🔴 Ativo]  Criado há 3 dias por Admin                          │   │
│ │                                                                  │   │
│ │ [✏️ Editar]  [💬 Chat]  [📤 Upload]  [🕸️ Grafo]  [⋮ Mais ▾]    │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Stats Bar (4 Cards)                                              │   │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│ │ │ 📄 142   │ │ 💬 1,284 │ │ 📈 98.2% │ │ ⚡ 1.4s  │            │   │
│ │ │ Docs     │ │ Msgs     │ │ Accuracy │ │ Avg Time │            │   │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────┐  ┌──────────────────────────────────────┐   │
│ │ Left Column (50%)     │  │ Right Column (50%)                   │   │
│ │                       │  │                                      │   │
│ │ ╔════════════════════╗│  │ ╔═══════════════════════════════════╗│   │
│ │ ║ Informações Básicas║│  │ ║ Configurações do Modelo           ║│   │
│ │ ╚════════════════════╝│  │ ╚═══════════════════════════════════╝│   │
│ │                       │  │                                      │   │
│ │ Tipo                  │  │ Modelo de Linguagem                  │   │
│ │ 📊 Financeiro         │  │ GPT-4 Turbo                          │   │
│ │                       │  │                                      │   │
│ │ Status                │  │ Temperatura                          │   │
│ │ 🔴 Ativo              │  │ 0.7 (Balanceado)                     │   │
│ │                       │  │                                      │   │
│ │ Domínio               │  │ Max Tokens                           │   │
│ │ Regulamentações       │  │ 2000                                 │   │
│ │ bancárias...          │  │                                      │   │
│ │ [Ver mais]            │  │ Estratégias RAG                      │   │
│ │                       │  │ ✅ SQL (PostgreSQL)                  │   │
│ │ Descrição             │  │ ✅ Graph (NebulaGraph)               │   │
│ │ Este Oráculo...       │  │ ✅ Vector (pgvector)                 │   │
│ │ [Ver mais]            │  │                                      │   │
│ │                       │  │ ╔═══════════════════════════════════╗│   │
│ │ Criado em             │  │ ║ Estatísticas de Uso               ║│   │
│ │ 25/12/2025 14:32      │  │ ╚═══════════════════════════════════╝│   │
│ │                       │  │                                      │   │
│ │ Atualizado em         │  │ Total de Conversas: 87               │   │
│ │ 28/12/2025 10:15      │  │ Mensagens Totais: 1,284              │   │
│ │                       │  │ Média msg/conversa: 14.8             │   │
│ │ Criado por            │  │                                      │   │
│ │ Admin User            │  │ Taxa de Sucesso: 98.2%               │   │
│ │                       │  │ Feedbacks Positivos: 112 👍          │   │
│ │ ╔════════════════════╗│  │ Feedbacks Negativos: 8 👎            │   │
│ │ ║ Knowledge Base     ║│  │                                      │   │
│ │ ╚════════════════════╝│  │ Tempo Médio Resposta: 1.4s           │   │
│ │                       │  │ Tempo Máximo: 3.2s                   │   │
│ │ 142 documentos        │  │ Tempo Mínimo: 0.6s                   │   │
│ │                       │  │                                      │   │
│ │ ┌─────────────────┐  │  │ ╔═══════════════════════════════════╗│   │
│ │ │ 📄 PDF: 78 docs │  │  │ ║ Atividade Recente                 ║│   │
│ │ │ 📝 DOCX: 34 docs│  │  │ ╚═══════════════════════════════════╝│   │
│ │ │ 📊 XLSX: 12 docs│  │  │                                      │   │
│ │ │ 🎥 MP4: 8 docs  │  │  │ • 2 min atrás: Nova conversa         │   │
│ │ │ 🎵 MP3: 6 docs  │  │  │   "Análise de transação X"           │   │
│ │ │ 🌐 HTML: 4 docs │  │  │                                      │   │
│ │ └─────────────────┘  │  │ • 15 min atrás: Upload completo      │   │
│ │                       │  │   3 documentos PDF                   │   │
│ │ [📤 Upload Docs]      │  │                                      │   │
│ │ [🕸️ Ver Grafo]        │  │ • 1 hora atrás: Configuração         │   │
│ │                       │  │   atualizada (temperatura → 0.7)     │   │
│ │                       │  │                                      │   │
│ │                       │  │ • Ontem 14:20: Nova conversa         │   │
│ │                       │  │   "Regulamentação BACEN..."          │   │
│ │                       │  │                                      │   │
│ │                       │  │ [Ver todas as atividades →]          │   │
│ └───────────────────────┘  └──────────────────────────────────────┘   │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Timeline (Full Width)                                            │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Histórico de Conversas (Últimas 5)                          ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 💬 Análise de transação X                                  │ │   │
│ │ │ 2 min atrás • 8 mensagens • 98% confiança                  │ │   │
│ │ │ [Ver Conversa →]                                           │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 💬 Compliance check - Cliente ABC                          │ │   │
│ │ │ 1 hora atrás • 12 mensagens • 95% confiança                │ │   │
│ │ │ [Ver Conversa →]                                           │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ... (3 mais)                                                    │   │
│ │                                                                  │   │
│ │ [Ver todas as conversas →]                                      │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes da Interface

### 1. Title Bar

**Componente**: `<div>` customizado com ações

```typescript
interface TitleBarProps {
  oracle: Oracle
  onEdit: () => void
  onChat: () => void
  onUpload: () => void
  onViewGraph: () => void
}

<div className="flex items-start justify-between">
  <div className="space-y-2">
    <h1 className="text-3xl font-bold flex items-center gap-3">
      {getOracleTypeIcon(oracle.type)}
      {oracle.name}
    </h1>
    <div className="flex items-center gap-3 text-sm text-neutral-600">
      <Badge variant={oracle.status === 'active' ? 'success' : 'secondary'}>
        {oracle.status === 'active' ? (
          <>
            <Circle className="h-2 w-2 mr-1 fill-success-600" />
            Ativo
          </>
        ) : (
          <>
            <Circle className="h-2 w-2 mr-1 fill-neutral-400" />
            Inativo
          </>
        )}
      </Badge>
      <span>
        Criado há {formatDistanceToNow(new Date(oracle.createdAt), { locale: ptBR })} por{' '}
        {oracle.createdBy}
      </span>
    </div>
  </div>

  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={onEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Editar
    </Button>
    <Button variant="default" size="sm" onClick={onChat}>
      <MessageSquare className="h-4 w-4 mr-2" />
      Chat
    </Button>
    <Button variant="outline" size="sm" onClick={onUpload}>
      <Upload className="h-4 w-4 mr-2" />
      Upload
    </Button>
    <Button variant="outline" size="sm" onClick={onViewGraph}>
      <Network className="h-4 w-4 mr-2" />
      Grafo
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDuplicate(oracle.id)}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(oracle.id)}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDelete(oracle.id)}
          className="text-error-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

**Acessibilidade**:
- `<h1>` com título do Oráculo
- Botões com labels claros
- Dropdown menu navegável por teclado

---

### 2. Stats Bar (4 Cards)

**Componente**: shadcn/ui `<Card>` em grid

```typescript
interface Stat {
  label: string
  value: string | number
  icon: React.ComponentType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

const stats: Stat[] = [
  {
    label: 'Documentos',
    value: oracle.documentCount,
    icon: FileText,
    trend: 'up',
    trendValue: '+12 esta semana',
  },
  {
    label: 'Mensagens',
    value: oracle.messageCount.toLocaleString('pt-BR'),
    icon: MessageSquare,
    trend: 'up',
    trendValue: '+234 esta semana',
  },
  {
    label: 'Acurácia',
    value: `${(oracle.accuracy * 100).toFixed(1)}%`,
    icon: TrendingUp,
    trend: 'up',
    trendValue: '+2.1% vs mês passado',
  },
  {
    label: 'Tempo Médio',
    value: `${oracle.avgResponseTime.toFixed(1)}s`,
    icon: Zap,
    trend: 'down',
    trendValue: '-0.3s vs mês passado',
  },
]

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat, index) => (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.trendValue && (
              <p
                className={cn(
                  'text-xs mt-2 flex items-center gap-1',
                  stat.trend === 'up' && 'text-success-600',
                  stat.trend === 'down' && 'text-error-600',
                  stat.trend === 'neutral' && 'text-neutral-500'
                )}
              >
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {stat.trendValue}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary-50 rounded-lg">
            <stat.icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Animação**: Números contam de 0 até valor final (CountUp.js)

---

### 3. Informações Básicas (Left Column)

**Componente**: shadcn/ui `<Card>`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Informações Básicas</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label className="text-sm text-neutral-500">Tipo</Label>
      <p className="font-medium flex items-center gap-2 mt-1">
        {getOracleTypeIcon(oracle.type)}
        {getOracleTypeLabel(oracle.type)}
      </p>
    </div>

    <Separator />

    <div>
      <Label className="text-sm text-neutral-500">Status</Label>
      <p className="font-medium flex items-center gap-2 mt-1">
        <Circle
          className={cn(
            'h-2 w-2',
            oracle.status === 'active'
              ? 'fill-success-600 text-success-600'
              : 'fill-neutral-400 text-neutral-400'
          )}
        />
        {oracle.status === 'active' ? 'Ativo' : 'Inativo'}
      </p>
    </div>

    <Separator />

    <div>
      <Label className="text-sm text-neutral-500">Domínio</Label>
      <p className="text-sm mt-1 text-neutral-700">
        {oracle.domain.length > 200 ? (
          <>
            {showFullDomain ? oracle.domain : `${oracle.domain.slice(0, 200)}...`}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto ml-1"
              onClick={() => setShowFullDomain(!showFullDomain)}
            >
              {showFullDomain ? 'Ver menos' : 'Ver mais'}
            </Button>
          </>
        ) : (
          oracle.domain
        )}
      </p>
    </div>

    {oracle.description && (
      <>
        <Separator />
        <div>
          <Label className="text-sm text-neutral-500">Descrição</Label>
          <p className="text-sm mt-1 text-neutral-700">
            {oracle.description.length > 150 ? (
              <>
                {showFullDescription
                  ? oracle.description
                  : `${oracle.description.slice(0, 150)}...`}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto ml-1"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Ver menos' : 'Ver mais'}
                </Button>
              </>
            ) : (
              oracle.description
            )}
          </p>
        </div>
      </>
    )}

    <Separator />

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-sm text-neutral-500">Criado em</Label>
        <p className="text-sm mt-1 font-medium">
          {format(new Date(oracle.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </p>
      </div>
      <div>
        <Label className="text-sm text-neutral-500">Atualizado em</Label>
        <p className="text-sm mt-1 font-medium">
          {format(new Date(oracle.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>

    <Separator />

    <div>
      <Label className="text-sm text-neutral-500">Criado por</Label>
      <p className="font-medium flex items-center gap-2 mt-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={oracle.createdByAvatar} />
          <AvatarFallback>{oracle.createdBy[0]}</AvatarFallback>
        </Avatar>
        {oracle.createdBy}
      </p>
    </div>
  </CardContent>
</Card>
```

---

### 4. Knowledge Base Summary

**Componente**: shadcn/ui `<Card>`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Knowledge Base</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-sm text-neutral-600">
      {oracle.documentCount} documentos indexados
    </p>

    <div className="space-y-2">
      {oracle.documentsByType.map((type) => (
        <div
          key={type.extension}
          className="flex items-center justify-between p-2 bg-neutral-50 rounded-md"
        >
          <div className="flex items-center gap-2">
            {getFileTypeIcon(type.extension)}
            <span className="text-sm font-medium">{type.extension.toUpperCase()}</span>
          </div>
          <span className="text-sm text-neutral-600">
            {type.count} {type.count === 1 ? 'doc' : 'docs'}
          </span>
        </div>
      ))}
    </div>

    <div className="space-y-2 pt-4">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push(`/oracles/${oracle.id}/knowledge`)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Documentos
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push(`/oracles/${oracle.id}/graph`)}
      >
        <Network className="h-4 w-4 mr-2" />
        Ver Grafo de Conhecimento
      </Button>
    </div>
  </CardContent>
</Card>
```

---

### 5. Configurações do Modelo (Right Column Top)

**Componente**: shadcn/ui `<Card>`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Configurações do Modelo</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label className="text-sm text-neutral-500">Modelo de Linguagem</Label>
      <p className="font-medium mt-1">{getLLMModelLabel(oracle.config.llmModel)}</p>
    </div>

    <Separator />

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-sm text-neutral-500">Temperatura</Label>
        <p className="font-medium mt-1">
          {oracle.config.temperature.toFixed(1)}{' '}
          <span className="text-sm text-neutral-500 font-normal">
            ({getTemperatureLabel(oracle.config.temperature)})
          </span>
        </p>
      </div>
      <div>
        <Label className="text-sm text-neutral-500">Max Tokens</Label>
        <p className="font-medium mt-1">{oracle.config.maxTokens.toLocaleString('pt-BR')}</p>
      </div>
    </div>

    <Separator />

    <div>
      <Label className="text-sm text-neutral-500 mb-2 block">Estratégias RAG</Label>
      <div className="space-y-2">
        {['sql', 'graph', 'vector'].map((strategy) => (
          <div key={strategy} className="flex items-center gap-2">
            {oracle.config.ragStrategies.includes(strategy) ? (
              <CheckCircle2 className="h-4 w-4 text-success-600" />
            ) : (
              <Circle className="h-4 w-4 text-neutral-300" />
            )}
            <span className="text-sm">
              {strategy === 'sql' && 'SQL (PostgreSQL)'}
              {strategy === 'graph' && 'Graph (NebulaGraph)'}
              {strategy === 'vector' && 'Vector (pgvector)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

---

### 6. Estatísticas de Uso

**Componente**: shadcn/ui `<Card>`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Estatísticas de Uso</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-neutral-500">Total de Conversas</p>
        <p className="text-xl font-bold mt-1">{oracle.stats.totalConversations}</p>
      </div>
      <div>
        <p className="text-sm text-neutral-500">Mensagens Totais</p>
        <p className="text-xl font-bold mt-1">
          {oracle.stats.totalMessages.toLocaleString('pt-BR')}
        </p>
      </div>
    </div>

    <Separator />

    <div>
      <p className="text-sm text-neutral-500">Média msg/conversa</p>
      <p className="text-lg font-medium mt-1">
        {(oracle.stats.totalMessages / oracle.stats.totalConversations).toFixed(1)}
      </p>
    </div>

    <Separator />

    <div>
      <p className="text-sm text-neutral-500">Taxa de Sucesso</p>
      <div className="flex items-center gap-2 mt-1">
        <Progress
          value={oracle.stats.successRate * 100}
          className="flex-1"
          indicatorClassName="bg-success-600"
        />
        <span className="text-lg font-medium">
          {(oracle.stats.successRate * 100).toFixed(1)}%
        </span>
      </div>
    </div>

    <Separator />

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-neutral-500">Feedbacks Positivos</p>
        <p className="text-lg font-medium mt-1 text-success-600">
          {oracle.stats.positiveFeedback} 👍
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-500">Feedbacks Negativos</p>
        <p className="text-lg font-medium mt-1 text-error-600">
          {oracle.stats.negativeFeedback} 👎
        </p>
      </div>
    </div>

    <Separator />

    <div className="space-y-2">
      <p className="text-sm text-neutral-500">Tempo de Resposta</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Médio:</span>
          <span className="font-medium">{oracle.stats.avgResponseTime.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Máximo:</span>
          <span className="font-medium">{oracle.stats.maxResponseTime.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Mínimo:</span>
          <span className="font-medium">{oracle.stats.minResponseTime.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

### 7. Atividade Recente

**Componente**: shadcn/ui `<Card>` com timeline

```typescript
<Card>
  <CardHeader>
    <CardTitle>Atividade Recente</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {oracle.recentActivities.slice(0, 5).map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="relative">
            <div className="p-2 bg-neutral-100 rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            {index < oracle.recentActivities.length - 1 && (
              <div className="absolute left-1/2 top-10 bottom-0 w-px bg-neutral-200 -translate-x-1/2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>

    {oracle.recentActivities.length > 5 && (
      <Button
        variant="link"
        className="w-full mt-2"
        onClick={() => setShowAllActivities(true)}
      >
        Ver todas as atividades →
      </Button>
    )}
  </CardContent>
</Card>
```

---

### 8. Histórico de Conversas (Full Width Bottom)

**Componente**: shadcn/ui `<Card>` com lista

```typescript
<Card>
  <CardHeader>
    <CardTitle>Histórico de Conversas (Últimas 5)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {oracle.recentConversations.map((conversation) => (
        <div
          key={conversation.id}
          className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">{conversation.title}</p>
              <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                <span>
                  {formatDistanceToNow(new Date(conversation.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                <span>•</span>
                <span>{conversation.messageCount} mensagens</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {(conversation.confidence * 100).toFixed(0)}% confiança
                  {conversation.confidence >= 0.95 && (
                    <CheckCircle2 className="h-3 w-3 text-success-600" />
                  )}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/oracles/${oracle.id}/chat?session=${conversation.id}`)}
          >
            Ver Conversa →
          </Button>
        </div>
      ))}
    </div>

    <Button
      variant="outline"
      className="w-full mt-4"
      onClick={() => router.push(`/oracles/${oracle.id}/chat`)}
    >
      Ver todas as conversas →
    </Button>
  </CardContent>
</Card>
```

---

## 🔄 Interações e Comportamentos

### 1. Refresh Data
Auto-refresh a cada 30 segundos para estatísticas em tempo real:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const updatedOracle = await fetchOracleDetails(oracle.id)
    setOracle(updatedOracle)
  }, 30000) // 30s

  return () => clearInterval(interval)
}, [oracle.id])
```

### 2. Delete Oracle
Confirmação em duas etapas:

```typescript
const handleDelete = async () => {
  const confirmed = await showConfirmDialog({
    title: 'Excluir Oráculo',
    description: `Tem certeza que deseja excluir "${oracle.name}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    confirmVariant: 'destructive',
  })

  if (!confirmed) return

  try {
    await fetch(`/api/v1/oracles/${oracle.id}`, { method: 'DELETE' })
    toast({ title: 'Oráculo excluído com sucesso' })
    router.push('/oracles')
  } catch (error) {
    toast({
      title: 'Erro ao excluir oráculo',
      variant: 'destructive',
    })
  }
}
```

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- `<h1>` para título principal
- Labels semânticos para todos os dados
- Navegação por teclado em todos os botões
- Contrast ratio 4.5:1 em todo o texto
- `aria-label` em ícones sem texto

---

## 📱 Responsividade

### Desktop (≥1024px)
- Grid 2 colunas (50%/50%)
- Stats bar: 4 colunas

### Tablet (768px - 1023px)
- Grid 2 colunas (50%/50%)
- Stats bar: 2 colunas

### Mobile (<768px)
- Grid 1 coluna (stacked)
- Stats bar: 1 coluna

---

## 🧪 Casos de Teste

1. **Carregamento**: Skeleton durante fetch
2. **Expand/Collapse**: "Ver mais" funciona em domínio/descrição
3. **Refresh**: Dados atualizam a cada 30s
4. **Navegação**: Todos os botões redirecionam corretamente
5. **Delete**: Confirmação + toast + redirect
6. **Stats**: CountUp animation nos números

---

**Status**: ✅ Complete
**Próximo Mockup**: [04_oracles_edit.md](04_oracles_edit.md)
**Última Atualização**: 2025-12-28

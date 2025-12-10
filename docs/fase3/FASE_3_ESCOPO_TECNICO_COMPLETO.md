# Fase 3: BackOffice Portal - Escopo Técnico Completo

> **"O BackOffice é o centro de comando da operação. Toda decisão de negócio, compliance e risco acontece aqui."**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos da Fase 3](#objetivos-da-fase-3)
3. [Arquitetura do BackOffice](#arquitetura-do-backoffice)
4. [Módulos Detalhados (11 Módulos)](#módulos-detalhados)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Segurança e Compliance](#segurança-e-compliance)
7. [Performance e Escalabilidade](#performance-e-escalabilidade)
8. [Integrações](#integrações)
9. [Testes e Qualidade](#testes-e-qualidade)
10. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral

### O Que é o BackOffice Portal?

O **BackOffice Portal** é a interface completa para equipes internas (Operações, Compliance, Risco, Produto, Suporte) gerenciarem toda a operação do Core Banking.

**Diferencial**: 100% genérico e configurável. Usa a fundação da Fase 1 (`object_definitions`, `instances`, `relationships`) para criar uma interface de gestão que se adapta automaticamente a qualquer objeto criado.

### Usuários-Alvo

| Perfil | Responsabilidades | Módulos Principais |
|--------|-------------------|-------------------|
| **Operador** | Cadastros, consultas básicas | Clientes, Contas, Transações |
| **Analista de Compliance** | Análise KYC, PLD/FT | Compliance & KYC |
| **Analista de Risco** | Análise de fraude, scoring | Risco & Fraude |
| **Product Manager** | Configuração de produtos, FSMs | Produto & Configuração |
| **Suporte N1/N2** | Atendimento a clientes | Suporte & Atendimento |
| **Gerente/Diretor** | Dashboard executivo, relatórios | Dashboard, Relatórios |
| **Administrador de Sistema** | Gestão de usuários, RBAC, auditoria | Administração & Segurança |

### Princípios de Design

1. **Genérico por Design**: Nunca hardcode "Cliente" ou "Conta". Lê `object_definitions` e renderiza.
2. **Real-Time First**: WebSocket para notificações, atualizações de fila, alertas.
3. **Mobile-Responsive**: Funciona em tablets para aprovações em campo.
4. **Audit Everything**: Todo clique, toda aprovação, toda mudança é auditada.
5. **RBAC Granular**: Permissões no nível de objeto, campo, ação.
6. **Performance**: Paginação, lazy loading, cache agressivo.

---

## 🎯 Objetivos da Fase 3

### Entregas (10 semanas)

| Semana | Sprint | Entregas | Story Points |
|--------|--------|----------|--------------|
| 1-2 | Sprint 15 | Dashboard Executivo + Notificações | 34 |
| 3-4 | Sprint 16 | Gestão de Clientes 360° + Contas | 38 |
| 5-6 | Sprint 17 | Transações + Compliance/KYC | 42 |
| 7-8 | Sprint 18 | Risco/Fraude + Produto Config | 45 |
| 9-10 | Sprint 19 | Suporte + Relatórios + Admin | 48 |

**Total**: 5 sprints, 10 semanas, 207 story points

### Critérios de Sucesso

- ✅ 11 módulos funcionais
- ✅ RBAC com 15+ papéis diferentes
- ✅ Todas as ações auditadas (audit log completo)
- ✅ Real-time (<1s de latência) para notificações
- ✅ Mobile-responsive (tablets)
- ✅ Suporte a 100+ usuários simultâneos
- ✅ Tempo de carregamento de páginas <2s (P95)

---

## 🏛️ Arquitetura do BackOffice

### Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                   │
├─────────────────────────────────────────────────────────────┤
│  Layout Principal (Sidebar + Topbar + Content)              │
│  ├─ Dashboard Executivo                                     │
│  ├─ Gestão de Clientes (360°)                               │
│  ├─ Gestão de Contas                                        │
│  ├─ Gestão de Transações                                    │
│  ├─ Compliance & KYC (Fila de Análise)                      │
│  ├─ Risco & Fraude (Alertas)                                │
│  ├─ Produto & Configuração (FSM Editor)                     │
│  ├─ Suporte & Atendimento                                   │
│  ├─ Relatórios & Analytics                                  │
│  ├─ Administração & Segurança                               │
│  └─ Notificações & Alertas                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ REST + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Go 1.21+)                      │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (Kong ou interno)                              │
│  ├─ Autenticação (Keycloak OIDC)                            │
│  ├─ Autorização (RBAC + ABAC)                               │
│  ├─ Rate Limiting (100 req/s global)                        │
│  └─ Audit Middleware (log de todas as ações)                │
│                                                             │
│  Módulos de Negócio                                         │
│  ├─ Dashboard Service (KPIs agregados)                      │
│  ├─ Client Service (CRUD + 360° view)                       │
│  ├─ Account Service (saldo, extrato)                        │
│  ├─ Transaction Service (filtros avançados)                 │
│  ├─ Compliance Service (fila KYC)                           │
│  ├─ Risk Service (scoring, alertas)                         │
│  ├─ Product Service (object_definitions CRUD)               │
│  ├─ Support Service (tickets)                               │
│  ├─ Report Service (query builder)                          │
│  ├─ Admin Service (users, roles, audit)                     │
│  └─ Notification Service (WebSocket hub)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DADOS & INTEGRAÇÕES                     │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+ (object_definitions, instances, users)      │
│  Redis 7+ (cache, sessions, pub/sub para WebSocket)         │
│  NebulaGraph (relacionamentos, 360° view)                   │
│  Elasticsearch (logs, audit, search)                        │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação e Autorização

```
┌─────────┐       1. Login        ┌──────────┐
│ Usuário │ ──────────────────────> Keycloak  │
└─────────┘                        └──────────┘
     │                                   │
     │  2. ID Token + Access Token      │
     └──────────────────────────────────┘
     │
     │  3. Request + Bearer Token
     ↓
┌─────────────────────────────────────────┐
│  API Gateway                            │
│  ├─ Valida Token (JWKS de Keycloak)    │
│  ├─ Extrai Claims (sub, roles, email)  │
│  └─ Enriquece Context                  │
└─────────────────────────────────────────┘
     │
     │  4. Contexto Autenticado
     ↓
┌─────────────────────────────────────────┐
│  RBAC Middleware                        │
│  ├─ Busca Permissões do Usuário        │
│  ├─ Verifica: user.canAccess(resource) │
│  └─ Allow / Deny                        │
└─────────────────────────────────────────┘
     │
     │  5. Autorizado
     ↓
┌─────────────────────────────────────────┐
│  Handler da Rota                        │
│  ├─ Executa Lógica de Negócio          │
│  ├─ Log de Auditoria                   │
│  └─ Retorna Resposta                   │
└─────────────────────────────────────────┘
```

---

## 📦 Módulos Detalhados

### 1. Dashboard Executivo

**Objetivo**: Visão consolidada de KPIs em tempo real para tomada de decisão.

#### Features

1. **Cards de KPIs** (atualização real-time via WebSocket)
   - Total de Clientes (Ativos, Inativos, Bloqueados)
   - Total de Contas (por tipo: Corrente, Poupança, Investimento)
   - Volume Transacional (Hoje, Semana, Mês)
   - Fila de Compliance (Pendente, Em Análise, Aprovado, Rejeitado)
   - Alertas de Risco (Fraude detectada, Score alto)
   - Performance do Sistema (Latência P95, Taxa de Erro)

2. **Gráficos Interativos**
   - Evolução de Clientes (linha temporal)
   - Volume Transacional por Tipo (pizza: PIX, TED, Boleto)
   - Aprovação de KYC (funil: Iniciado → Aprovado)
   - Distribuição de Risco (histograma de scores)

3. **Customização**
   - Drag-and-drop de widgets (React Grid Layout)
   - Salvamento de layouts personalizados por usuário
   - Exportação de gráficos (PNG, PDF)

4. **Filtros Globais**
   - Período (Hoje, Últimos 7 dias, Últimos 30 dias, Custom)
   - Segmento de Cliente (Varejo, Premium, Private)
   - Produto (Conta Corrente, Poupança, etc)

#### Componentes

```typescript
// DashboardExecutivo.tsx
interface KPICard {
  title: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const KPICards: KPICard[] = [
  {
    title: 'Clientes Ativos',
    value: 1247,
    trend: { direction: 'up', percentage: 12.5, period: 'vs último mês' },
    icon: <Users />,
    color: 'blue',
    onClick: () => navigate('/backoffice/clientes?state=ATIVO')
  },
  {
    title: 'Volume Transacional (Hoje)',
    value: 'R$ 2.4M',
    trend: { direction: 'up', percentage: 8.3, period: 'vs ontem' },
    icon: <TrendingUp />,
    color: 'green'
  },
  {
    title: 'Fila de KYC',
    value: 23,
    trend: { direction: 'down', percentage: -15.2, period: 'vs ontem' },
    icon: <FileText />,
    color: 'yellow',
    onClick: () => navigate('/backoffice/compliance/kyc-queue')
  },
  {
    title: 'Alertas de Fraude',
    value: 5,
    trend: { direction: 'up', percentage: 25, period: 'últimas 24h' },
    icon: <AlertTriangle />,
    color: 'red',
    onClick: () => navigate('/backoffice/risco/alertas')
  }
];

export function DashboardExecutivo() {
  const { data: kpis, isLoading } = useQuery(['dashboard-kpis'], fetchKPIs, {
    refetchInterval: 30000 // Atualiza a cada 30s
  });

  // WebSocket para atualizações real-time
  useWebSocket('/ws/dashboard', {
    onMessage: (event) => {
      const update = JSON.parse(event.data);
      queryClient.setQueryData(['dashboard-kpis'], (old) => ({
        ...old,
        [update.kpi]: update.value
      }));
    }
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPICards.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={kpis?.clientesTimeSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Transacional por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={kpis?.volumePorTipo} />
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={kpis?.recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/dashboard/kpis
// Retorna KPIs agregados
{
  "clientes_ativos": 1247,
  "clientes_trend": {
    "direction": "up",
    "percentage": 12.5,
    "period": "vs_last_month"
  },
  "volume_transacional_hoje": 2400000.50,
  "fila_kyc": 23,
  "alertas_fraude": 5,
  "clientes_time_series": [
    {"date": "2024-01-01", "value": 1000},
    {"date": "2024-01-02", "value": 1015},
    // ...
  ],
  "volume_por_tipo": {
    "PIX": 1500000,
    "TED": 700000,
    "BOLETO": 200000
  }
}

// WebSocket: ws://api/ws/dashboard
// Envia atualizações real-time:
{
  "type": "kpi_update",
  "kpi": "alertas_fraude",
  "value": 6,
  "timestamp": "2024-01-10T14:35:00Z"
}
```

---

### 2. Gestão de Clientes (360° View)

**Objetivo**: Visão completa de cada cliente (dados, contas, transações, relacionamentos, histórico).

#### Features

1. **Lista de Clientes**
   - Busca por CPF/CNPJ, Nome, Email, Telefone
   - Filtros: Estado (Ativo, Bloqueado), Segmento, Data de Cadastro
   - Ordenação: Nome, Data, Score de Risco
   - Paginação (100 por página)
   - Ações rápidas: Ver 360°, Bloquear, Editar

2. **Cliente 360° (View Completa)**
   - **Aba Overview**: Dados cadastrais, Status, Score de Risco, Tags
   - **Aba Contas**: Lista de contas vinculadas (TITULAR_DE)
   - **Aba Transações**: Histórico transacional (últimas 100)
   - **Aba Relacionamentos**: Grafo visual (dependentes, procuradores)
   - **Aba Documentos**: KYC docs, contratos assinados
   - **Aba Histórico**: Timeline de eventos (criação, aprovação, bloqueios)
   - **Aba Interações**: Tickets de suporte, chamadas, emails

3. **Ações do Cliente**
   - Aprovar/Rejeitar KYC
   - Bloquear/Desbloquear
   - Atualizar Dados Cadastrais
   - Adicionar Tags (VIP, Inadimplente, etc)
   - Enviar Notificação

#### Componentes

```typescript
// ClienteView360.tsx
interface Cliente360Data {
  cliente: Instance;
  contas: Instance[];
  transacoes: Instance[];
  relacionamentos: Relationship[];
  documentos: Document[];
  historico: StateHistoryEntry[];
  interacoes: Interaction[];
  score_risco: number;
}

export function ClienteView360({ clienteId }: { clienteId: string }) {
  const { data, isLoading } = useQuery(['cliente-360', clienteId], () =>
    api.get(`/api/v1/backoffice/clientes/${clienteId}/360`)
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header com dados principais */}
      <ClienteHeader cliente={data.cliente} scoreRisco={data.score_risco} />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contas">
            Contas ({data.contas.length})
          </TabsTrigger>
          <TabsTrigger value="transacoes">
            Transações ({data.transacoes.length})
          </TabsTrigger>
          <TabsTrigger value="relacionamentos">
            Relacionamentos ({data.relacionamentos.length})
          </TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos ({data.documentos.length})
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="interacoes">Interações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClienteOverview cliente={data.cliente} />
        </TabsContent>

        <TabsContent value="contas">
          <ContasTable contas={data.contas} />
        </TabsContent>

        <TabsContent value="transacoes">
          <TransacoesTable transacoes={data.transacoes} />
        </TabsContent>

        <TabsContent value="relacionamentos">
          <RelacionamentosGraph relacionamentos={data.relacionamentos} />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosGallery documentos={data.documentos} />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoTimeline eventos={data.historico} />
        </TabsContent>

        <TabsContent value="interacoes">
          <InteracoesList interacoes={data.interacoes} />
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas (Floating Action Bar) */}
      <ClienteActionBar clienteId={clienteId} currentState={data.cliente.current_state} />
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/clientes
// Lista paginada de clientes
{
  "data": [
    {
      "id": "uuid-cliente-1",
      "data": {
        "cpf": "12345678901",
        "nome_completo": "Maria Silva",
        "email": "maria@example.com",
        "telefone": "(11) 98765-4321"
      },
      "current_state": "ATIVO",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 100,
    "total": 1247,
    "total_pages": 13
  }
}

// GET /api/v1/backoffice/clientes/:id/360
// Visão 360° completa
{
  "cliente": {
    "id": "uuid-cliente-1",
    "data": {...},
    "current_state": "ATIVO"
  },
  "contas": [
    {
      "id": "uuid-conta-1",
      "data": {
        "numero": "12345-6",
        "tipo": "Conta Corrente",
        "saldo": 5000.00
      }
    }
  ],
  "transacoes": [...],
  "relacionamentos": [
    {
      "type": "TITULAR_DE",
      "target": "uuid-conta-1",
      "properties": {"porcentagem": 100}
    }
  ],
  "documentos": [
    {
      "tipo": "RG",
      "url": "https://s3.amazonaws.com/docs/rg-maria.pdf",
      "status": "APROVADO"
    }
  ],
  "historico": [
    {"state": "CADASTRO_PENDENTE", "timestamp": "2024-01-01T10:00:00Z"},
    {"state": "ATIVO", "timestamp": "2024-01-02T14:30:00Z"}
  ],
  "interacoes": [
    {
      "tipo": "TICKET",
      "assunto": "Dúvida sobre tarifa",
      "data": "2024-01-05T09:00:00Z"
    }
  ],
  "score_risco": 35
}

// PATCH /api/v1/backoffice/clientes/:id/state
// Transição de estado (Bloquear, Desbloquear)
{
  "new_state": "BLOQUEADO",
  "reason": "Fraude detectada",
  "user_id": "uuid-do-usuario"
}
```

---

### 3. Gestão de Contas

**Objetivo**: Visualizar saldos, extratos, limites e configurações de contas.

#### Features

1. **Lista de Contas**
   - Busca por Número, Titular (CPF/Nome)
   - Filtros: Tipo (Corrente, Poupança), Status, Saldo (range)
   - Ordenação: Saldo, Data de Abertura

2. **Detalhes da Conta**
   - Saldo Atual (Real-time via TigerBeetle)
   - Extrato (últimas 100 transações)
   - Limites (PIX, TED, Saque)
   - Titulares e Co-Titulares (relacionamentos)
   - Histórico de Estados

3. **Ações da Conta**
   - Ajustar Limites
   - Bloquear/Desbloquear
   - Adicionar Co-Titular
   - Gerar Extrato (PDF)

#### Componentes

```typescript
// ContaDetails.tsx
export function ContaDetails({ contaId }: { contaId: string }) {
  const { data: conta } = useQuery(['conta', contaId], () =>
    api.get(`/api/v1/backoffice/contas/${contaId}`)
  );

  const { data: saldo } = useQuery(['conta-saldo', contaId], () =>
    api.get(`/api/v1/backoffice/contas/${contaId}/saldo`),
    { refetchInterval: 10000 } // Atualiza a cada 10s
  );

  return (
    <div className="space-y-6">
      {/* Card de Saldo */}
      <Card>
        <CardHeader>
          <CardTitle>Conta {conta.data.numero}</CardTitle>
          <Badge variant={conta.current_state === 'ATIVA' ? 'success' : 'warning'}>
            {conta.current_state}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {formatCurrency(saldo.saldo_disponivel)}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Saldo Bloqueado: {formatCurrency(saldo.saldo_bloqueado)}
          </div>
        </CardContent>
      </Card>

      {/* Limites */}
      <Card>
        <CardHeader>
          <CardTitle>Limites</CardTitle>
        </CardHeader>
        <CardContent>
          <LimitesTable limites={conta.data.limites} onEdit={handleEditLimit} />
        </CardContent>
      </Card>

      {/* Extrato */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato (Últimas 100 Transações)</CardTitle>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2" />
            Gerar PDF
          </Button>
        </CardHeader>
        <CardContent>
          <ExtratoTable contaId={contaId} />
        </CardContent>
      </Card>

      {/* Titulares */}
      <Card>
        <CardHeader>
          <CardTitle>Titulares</CardTitle>
        </CardHeader>
        <CardContent>
          <TitularesTable contaId={contaId} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/contas/:id/saldo
// Consulta saldo em tempo real (TigerBeetle)
{
  "conta_id": "uuid-conta-1",
  "saldo_disponivel": 5000.00,
  "saldo_bloqueado": 200.00,
  "tigerbeetle_account_id": "12345678901234567890",
  "timestamp": "2024-01-10T14:45:00Z"
}

// GET /api/v1/backoffice/contas/:id/extrato
// Extrato detalhado
{
  "conta_id": "uuid-conta-1",
  "transacoes": [
    {
      "id": "uuid-transacao-1",
      "tipo": "PIX",
      "valor": -100.00,
      "descricao": "Transferência para João",
      "timestamp": "2024-01-10T10:30:00Z",
      "saldo_apos": 4900.00
    }
  ],
  "saldo_inicial": 5000.00,
  "saldo_final": 4900.00
}

// PATCH /api/v1/backoffice/contas/:id/limites
// Ajustar limites
{
  "limite_pix_diario": 5000.00,
  "limite_ted_diario": 10000.00,
  "limite_saque_diario": 2000.00
}
```

---

### 4. Gestão de Transações

**Objetivo**: Busca avançada, filtros e análise de transações.

#### Features

1. **Lista de Transações**
   - Busca por: ID, Conta Origem/Destino, Chave PIX, CPF/CNPJ
   - Filtros Avançados:
     - Tipo (PIX, TED, Boleto, Saque, Depósito)
     - Status (CONCLUÍDA, PENDENTE, FALHOU, ESTORNADA)
     - Período (range de datas)
     - Valor (range)
     - Risco (score de fraude)
   - Ordenação: Data, Valor, Score de Risco

2. **Detalhes da Transação**
   - Dados completos (origem, destino, valor, tarifa)
   - Timeline de Estados (INICIADA → VALIDADA → LIQUIDADA)
   - Score de Fraude (se aplicável)
   - Logs de Integração (TigerBeetle, BACEN SPI)

3. **Ações da Transação**
   - Estornar (se permitido)
   - Marcar como Fraude
   - Exportar Comprovante (PDF)

#### Componentes

```typescript
// TransacoesLista.tsx
interface TransactionFilters {
  tipo?: string[];
  status?: string[];
  periodo_inicio?: Date;
  periodo_fim?: Date;
  valor_min?: number;
  valor_max?: number;
  risco_min?: number;
  risco_max?: number;
  busca?: string;
}

export function TransacoesLista() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['transacoes', filters, page],
    () => api.get('/api/v1/backoffice/transacoes', { params: { ...filters, page } })
  );

  return (
    <div className="space-y-6">
      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionFilters filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações ({data?.pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell>{transacao.id.slice(0, 8)}</TableCell>
                  <TableCell>{formatDateTime(transacao.created_at)}</TableCell>
                  <TableCell>
                    <Badge>{transacao.data.tipo}</Badge>
                  </TableCell>
                  <TableCell>{transacao.data.conta_origem}</TableCell>
                  <TableCell>{transacao.data.conta_destino}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(transacao.data.valor)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transacao.current_state} />
                  </TableCell>
                  <TableCell>
                    <RiskScore score={transacao.data.score_fraude} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate(`/backoffice/transacoes/${transacao.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEstornar(transacao.id)}>
                          Estornar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarcarFraude(transacao.id)}>
                          Marcar como Fraude
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={page}
            totalPages={data?.pagination.total_pages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/transacoes
// Lista com filtros avançados
Query Params:
  tipo: pix,ted (comma-separated)
  status: CONCLUIDA,PENDENTE
  periodo_inicio: 2024-01-01T00:00:00Z
  periodo_fim: 2024-01-31T23:59:59Z
  valor_min: 100.00
  valor_max: 10000.00
  risco_min: 70
  busca: "maria silva" (busca em origem/destino/chave)
  page: 1
  per_page: 100

Response:
{
  "data": [...],
  "pagination": {...}
}

// POST /api/v1/backoffice/transacoes/:id/estornar
// Estornar transação
{
  "motivo": "Fraude confirmada",
  "user_id": "uuid-do-usuario"
}
```

---

### 5. Compliance & KYC

**Objetivo**: Fila de análise de KYC, aprovação/rejeição de documentos, gestão de PLD/FT.

#### Features

1. **Fila de Análise KYC**
   - Lista de clientes pendentes de análise
   - Priorização (Score de Risco, Data de Cadastro)
   - Distribuição automática (round-robin) ou manual

2. **Análise de Documentos**
   - Visualizador de documentos (PDF, imagens)
   - Checklist de validação (RG, CPF, Comprovante de Residência)
   - OCR automático (extração de dados)
   - Comparação facial (biometria)

3. **Decisão**
   - Aprovar (transição para ATIVO)
   - Rejeitar (motivo obrigatório)
   - Solicitar Documentos Adicionais

4. **Dashboard PLD/FT**
   - Transações suspeitas (>R$ 10k, horário noturno)
   - Clientes em watchlist
   - Relatórios COAF (geração automática)

#### Componentes

```typescript
// KYCQueue.tsx
export function KYCQueue() {
  const { data: fila } = useQuery(['kyc-queue'], () =>
    api.get('/api/v1/backoffice/compliance/kyc-queue')
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Pendentes" value={fila.pendentes} color="yellow" />
        <StatCard title="Em Análise" value={fila.em_analise} color="blue" />
        <StatCard title="Aprovados Hoje" value={fila.aprovados_hoje} color="green" />
        <StatCard title="Rejeitados Hoje" value={fila.rejeitados_hoje} color="red" />
      </div>

      {/* Fila */}
      <Card>
        <CardHeader>
          <CardTitle>Fila de Análise ({fila.clientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prioridade</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Score Risco</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fila.clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <PriorityBadge priority={cliente.prioridade} />
                  </TableCell>
                  <TableCell>{cliente.data.nome_completo}</TableCell>
                  <TableCell className="font-mono">{formatCPF(cliente.data.cpf)}</TableCell>
                  <TableCell>{formatDate(cliente.created_at)}</TableCell>
                  <TableCell>
                    <RiskScore score={cliente.score_risco} />
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadges documentos={cliente.documentos} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/backoffice/compliance/kyc/${cliente.id}`)}
                    >
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// KYCAnalise.tsx
export function KYCAnalise({ clienteId }: { clienteId: string }) {
  const { data: cliente } = useQuery(['cliente-kyc', clienteId], () =>
    api.get(`/api/v1/backoffice/compliance/kyc/${clienteId}`)
  );

  const [decisao, setDecisao] = useState<'aprovar' | 'rejeitar' | null>(null);
  const [motivo, setMotivo] = useState('');

  const handleSubmit = async () => {
    await api.post(`/api/v1/backoffice/compliance/kyc/${clienteId}/decidir`, {
      decisao,
      motivo
    });
    navigate('/backoffice/compliance/kyc-queue');
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Lado Esquerdo: Documentos */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentViewer documentos={cliente.documentos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Extraídos (OCR)</CardTitle>
          </CardHeader>
          <CardContent>
            <OCRDataComparison
              extractedData={cliente.ocr_data}
              manualData={cliente.data}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lado Direito: Checklist e Decisão */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Checklist de Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCChecklist
              items={[
                { label: 'RG frente e verso legíveis', checked: true },
                { label: 'CPF válido', checked: true },
                { label: 'Comprovante de residência (últimos 3 meses)', checked: false },
                { label: 'Selfie com documento', checked: true },
                { label: 'Biometria aprovada (match > 90%)', checked: true }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={decisao === 'aprovar' ? 'default' : 'outline'}
                onClick={() => setDecisao('aprovar')}
                className="flex-1"
              >
                <Check className="mr-2" />
                Aprovar
              </Button>
              <Button
                variant={decisao === 'rejeitar' ? 'destructive' : 'outline'}
                onClick={() => setDecisao('rejeitar')}
                className="flex-1"
              >
                <X className="mr-2" />
                Rejeitar
              </Button>
            </div>

            {decisao && (
              <>
                <Textarea
                  placeholder="Motivo da decisão (obrigatório)"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!motivo.trim()}
                  className="w-full"
                >
                  Confirmar Decisão
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/compliance/kyc-queue
// Lista de clientes pendentes de análise
{
  "pendentes": 23,
  "em_analise": 5,
  "aprovados_hoje": 12,
  "rejeitados_hoje": 3,
  "clientes": [
    {
      "id": "uuid-cliente-1",
      "data": {...},
      "score_risco": 45,
      "prioridade": "ALTA",
      "documentos": [
        {"tipo": "RG", "status": "PENDENTE"},
        {"tipo": "SELFIE", "status": "PENDENTE"}
      ],
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}

// POST /api/v1/backoffice/compliance/kyc/:id/decidir
// Aprovar ou rejeitar KYC
{
  "decisao": "aprovar", // ou "rejeitar"
  "motivo": "Documentos válidos, biometria aprovada",
  "user_id": "uuid-do-usuario"
}
```

---

### 6. Risco & Fraude

**Objetivo**: Monitoramento de transações suspeitas, scoring de risco, alertas.

#### Features

1. **Dashboard de Risco**
   - Alertas em tempo real (WebSocket)
   - Distribuição de scores (histograma)
   - Transações de alto risco (score > 70)

2. **Análise de Transação**
   - Detalhes completos
   - Fatores de risco (horário, valor, histórico)
   - Recomendação automática (Aprovar, Revisar, Bloquear)

3. **Gestão de Regras de Risco**
   - Criar/Editar regras customizadas
   - Testar regras (sandbox)
   - Histórico de mudanças

4. **Watchlist**
   - CPFs/CNPJs em lista de observação
   - Bloqueio automático de transações

#### Componentes

```typescript
// RiscoDashboard.tsx
export function RiscoDashboard() {
  const { data: alertas } = useQuery(['alertas-risco'], fetchAlertas, {
    refetchInterval: 5000 // Atualiza a cada 5s
  });

  // WebSocket para alertas real-time
  useWebSocket('/ws/risco/alertas', {
    onMessage: (event) => {
      const novoAlerta = JSON.parse(event.data);
      queryClient.setQueryData(['alertas-risco'], (old: any) => [novoAlerta, ...old]);
      toast.error(`Novo alerta de risco: ${novoAlerta.descricao}`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Alertas Hoje"
          value={alertas.hoje}
          trend={{ direction: 'up', percentage: 15 }}
          color="red"
        />
        <StatCard
          title="Transações Bloqueadas"
          value={alertas.bloqueadas}
          color="yellow"
        />
        <StatCard
          title="Fraudes Confirmadas"
          value={alertas.fraudes_confirmadas}
          color="red"
        />
        <StatCard
          title="Falsos Positivos"
          value={alertas.falsos_positivos}
          color="green"
        />
      </div>

      {/* Alertas Real-Time */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Transação</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Fatores</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.data.map((alerta) => (
                <TableRow key={alerta.id} className="animate-pulse-once">
                  <TableCell>{formatDateTime(alerta.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{alerta.tipo}</Badge>
                  </TableCell>
                  <TableCell>{alerta.transacao_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <RiskScore score={alerta.score} />
                  </TableCell>
                  <TableCell>
                    <RiskFactorsList factors={alerta.fatores} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/backoffice/risco/alertas/${alerta.id}`)}
                    >
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribuição de Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Scores de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <HistogramChart data={alertas.distribuicao_scores} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### API Endpoints

```go
// GET /api/v1/backoffice/risco/alertas
// Lista de alertas recentes
{
  "hoje": 47,
  "bloqueadas": 12,
  "fraudes_confirmadas": 5,
  "falsos_positivos": 8,
  "data": [
    {
      "id": "uuid-alerta-1",
      "tipo": "VALOR_ALTO",
      "transacao_id": "uuid-transacao-1",
      "score": 85,
      "fatores": [
        "Valor acima de R$ 10.000",
        "Horário noturno (02:35)",
        "Primeiro PIX acima de R$ 5.000"
      ],
      "timestamp": "2024-01-10T02:35:00Z",
      "status": "PENDENTE"
    }
  ],
  "distribuicao_scores": [
    {"range": "0-20", "count": 1523},
    {"range": "21-40", "count": 845},
    {"range": "41-60", "count": 234},
    {"range": "61-80", "count": 67},
    {"range": "81-100", "count": 23}
  ]
}

// WebSocket: ws://api/ws/risco/alertas
// Envia alertas em tempo real
{
  "id": "uuid-alerta-novo",
  "tipo": "FRAUDE_SUSPEITA",
  "transacao_id": "uuid-transacao-2",
  "score": 92,
  "descricao": "Dispositivo novo + valor alto + horário atípico",
  "timestamp": "2024-01-10T14:50:00Z"
}
```

---

### 7. Produto & Configuração

**Objetivo**: Criar/editar object_definitions, configurar FSMs, validações.

**Features**:
- CRUD de object_definitions (já implementado em Sprint 4)
- Editor visual de FSM (React Flow)
- Biblioteca de validation_rules
- Simulador de objetos (criar instância de teste)

**Componentes**: Reutilização dos componentes da Sprint 4 + FSM Editor visual.

---

### 8. Suporte & Atendimento

**Objetivo**: Gestão de tickets, FAQ, chat com clientes.

#### Features

1. **Fila de Tickets**
   - Lista de tickets abertos/em andamento
   - Priorização (Urgente, Alta, Normal, Baixa)
   - Distribuição (round-robin ou manual)

2. **Atendimento de Ticket**
   - Histórico de interações
   - Dados do cliente (360° view integrado)
   - Respostas prontas (canned responses)
   - Anexos (screenshots, documentos)

3. **FAQ/Base de Conhecimento**
   - Busca semântica (pgvector)
   - Categorização (Contas, PIX, Cartões, etc)

4. **Chat em Tempo Real**
   - WebSocket para chat
   - Notificação de novas mensagens

#### Componentes

```typescript
// TicketQueue.tsx
export function TicketQueue() {
  const { data: tickets } = useQuery(['tickets'], fetchTickets);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tickets Abertos ({tickets?.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.data.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>#{ticket.id.slice(0, 6)}</TableCell>
                  <TableCell>{ticket.cliente_nome}</TableCell>
                  <TableCell>{ticket.assunto}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.prioridade} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>{formatDate(ticket.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/backoffice/suporte/tickets/${ticket.id}`)}
                    >
                      Atender
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// TicketAtendimento.tsx
export function TicketAtendimento({ ticketId }: { ticketId: string }) {
  const { data: ticket } = useQuery(['ticket', ticketId], () =>
    api.get(`/api/v1/backoffice/suporte/tickets/${ticketId}`)
  );

  const [resposta, setResposta] = useState('');

  const handleEnviarResposta = async () => {
    await api.post(`/api/v1/backoffice/suporte/tickets/${ticketId}/respostas`, {
      mensagem: resposta
    });
    setResposta('');
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Coluna Principal: Chat */}
      <div className="col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket #{ticket.id.slice(0, 6)}</CardTitle>
            <div className="flex gap-2">
              <PriorityBadge priority={ticket.prioridade} />
              <StatusBadge status={ticket.status} />
            </div>
          </CardHeader>
          <CardContent>
            {/* Histórico de Mensagens */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {ticket.mensagens.map((msg) => (
                <ChatMessage key={msg.id} mensagem={msg} />
              ))}
            </div>

            {/* Campo de Resposta */}
            <div className="space-y-4">
              <Textarea
                placeholder="Digite sua resposta..."
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleEnviarResposta}>
                  Enviar Resposta
                </Button>
                <Button variant="outline">
                  Usar Resposta Pronta
                </Button>
                <Button variant="outline">
                  Anexar Arquivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Lateral: Dados do Cliente */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClienteInfoCard clienteId={ticket.cliente_id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              Ver Perfil Completo
            </Button>
            <Button variant="outline" className="w-full">
              Ver Contas
            </Button>
            <Button variant="outline" className="w-full">
              Ver Transações
            </Button>
            <Button variant="destructive" className="w-full">
              Escalar para N2
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### 9. Relatórios & Analytics

**Objetivo**: Construtor de relatórios drag-and-drop, exports, agendamento.

#### Features

1. **Report Builder**
   - Drag-and-drop de campos
   - Filtros (período, segmento, produto)
   - Agregações (COUNT, SUM, AVG, MIN, MAX)
   - Visualizações (tabela, gráfico de barras, linha, pizza)

2. **Relatórios Salvos**
   - Biblioteca de relatórios customizados
   - Compartilhamento entre usuários
   - Agendamento (diário, semanal, mensal)

3. **Export**
   - Formatos: PDF, Excel, CSV
   - Email automático

#### Componentes

```typescript
// ReportBuilder.tsx
export function ReportBuilder() {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [aggregations, setAggregations] = useState<ReportAggregation[]>([]);

  const { data: preview } = useQuery(
    ['report-preview', selectedFields, filters, aggregations],
    () => api.post('/api/v1/backoffice/relatorios/preview', {
      fields: selectedFields,
      filters,
      aggregations
    }),
    { enabled: selectedFields.length > 0 }
  );

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Sidebar: Fields */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Campos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <DraggableFieldsList
            fields={[
              { name: 'cliente.cpf', label: 'CPF' },
              { name: 'cliente.nome_completo', label: 'Nome' },
              { name: 'conta.numero', label: 'Número da Conta' },
              { name: 'transacao.valor', label: 'Valor' },
              { name: 'transacao.tipo', label: 'Tipo' },
              { name: 'transacao.created_at', label: 'Data' }
            ]}
          />
        </CardContent>
      </Card>

      {/* Main Area: Builder */}
      <div className="col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Construtor de Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <DroppableFieldsArea
              selectedFields={selectedFields}
              onFieldsChange={setSelectedFields}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersEditor filters={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('pdf')}>
                <FileText className="mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => handleExport('xlsx')}>
                <FileSpreadsheet className="mr-2" />
                Export Excel
              </Button>
              <Button onClick={() => handleSave()}>
                <Save className="mr-2" />
                Salvar Relatório
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {preview && <ReportPreviewTable data={preview} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### 10. Administração & Segurança

**Objetivo**: Gestão de usuários, papéis (RBAC), audit logs.

#### Features

1. **Gestão de Usuários**
   - CRUD de usuários internos
   - Atribuição de papéis (roles)
   - Desativar/Reativar usuários

2. **Gestão de Papéis (Roles)**
   - Definir permissões granulares
   - Roles predefinidos: Operador, Analista Compliance, Analista Risco, Product Manager, Admin

3. **Audit Logs**
   - Log de todas as ações (WHO, WHAT, WHEN, WHERE)
   - Busca por usuário, ação, período
   - Export para compliance

4. **Configurações do Sistema**
   - Timeouts de sessão
   - Políticas de senha
   - Whitelist de IPs

#### Componentes

```typescript
// UsersManagement.tsx
export function UsersManagement() {
  const { data: users } = useQuery(['users'], fetchUsers);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({users?.total})</CardTitle>
          <Button onClick={() => navigate('/backoffice/admin/users/new')}>
            <Plus className="mr-2" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role}>{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.is_active ? 'ATIVO' : 'INATIVO'} />
                  </TableCell>
                  <TableCell>{formatDateTime(user.last_login)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Desativar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Audit Log</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// AuditLogs.tsx
export function AuditLogs() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { data: logs } = useQuery(['audit-logs', filters], () =>
    api.get('/api/v1/backoffice/admin/audit-logs', { params: filters })
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogFilters filters={filters} onChange={setFilters} />

          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>{log.user_email}</TableCell>
                  <TableCell>
                    <Badge>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.resource_type}:{log.resource_id?.slice(0, 8)}</TableCell>
                  <TableCell className="font-mono">{log.ip_address}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDetails(log)}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 11. Notificações & Alertas

**Objetivo**: Sistema de notificações real-time via WebSocket.

#### Features

1. **Bell Icon (Topbar)**
   - Badge com contagem de não lidas
   - Dropdown com últimas 10 notificações
   - Marcar como lida / Marcar todas como lidas

2. **Central de Notificações**
   - Lista completa de notificações
   - Filtros: Tipo (Alerta, Info, Sucesso), Status (Lida, Não Lida)
   - Ações: Marcar lida, Arquivar, Ir para recurso

3. **Tipos de Notificações**
   - Novo cliente pendente de KYC
   - Transação de alto risco detectada
   - Ticket novo atribuído a você
   - Relatório agendado pronto
   - Sistema: manutenção, atualização

#### Componentes

```typescript
// NotificationBell.tsx (no Topbar)
export function NotificationBell() {
  const { data: unreadCount } = useQuery(['notifications-unread-count'], fetchUnreadCount);

  const { data: notifications } = useQuery(['notifications-recent'], () =>
    api.get('/api/v1/backoffice/notificacoes/recent', { params: { limit: 10 } })
  );

  // WebSocket para notificações real-time
  useWebSocket('/ws/notificacoes', {
    onMessage: (event) => {
      const novaNotificacao = JSON.parse(event.data);
      queryClient.invalidateQueries(['notifications-unread-count']);
      queryClient.setQueryData(['notifications-recent'], (old: any) => [novaNotificacao, ...old]);

      // Toast notification
      toast.info(novaNotificacao.message, {
        action: {
          label: 'Ver',
          onClick: () => navigate(novaNotificacao.action_url)
        }
      });
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[20px] h-5">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>
          Notificações
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="ml-auto"
          >
            Marcar todas como lidas
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications?.map((notif) => (
          <DropdownMenuItem key={notif.id} onClick={() => handleNotificationClick(notif)}>
            <NotificationItem notification={notif} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/backoffice/notificacoes')}>
          Ver todas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 🔒 Segurança e Compliance

### Autenticação (Keycloak OIDC)

```typescript
// Fluxo de Login
1. Usuário clica em "Login"
2. Redirect para Keycloak: /auth/realms/lbpay/protocol/openid-connect/auth
3. Usuário autentica (username/password ou 2FA)
4. Keycloak retorna código de autorização
5. Frontend troca código por tokens (ID Token + Access Token + Refresh Token)
6. Tokens armazenados em memória (não localStorage por segurança)
7. Requests incluem Bearer Token no header Authorization
```

### RBAC (Role-Based Access Control)

```go
// Papéis predefinidos
type Role string

const (
    RoleOperador           Role = "operador"
    RoleAnalistaCompliance Role = "analista_compliance"
    RoleAnalistaRisco      Role = "analista_risco"
    RoleProductManager     Role = "product_manager"
    RoleSuporte           Role = "suporte"
    RoleGerente           Role = "gerente"
    RoleAdmin             Role = "admin"
)

// Permissões por papel
var RolePermissions = map[Role][]Permission{
    RoleOperador: {
        PermissionReadClientes,
        PermissionReadContas,
        PermissionReadTransacoes,
    },
    RoleAnalistaCompliance: {
        PermissionReadClientes,
        PermissionApproveKYC,
        PermissionRejectKYC,
        PermissionReadDocuments,
    },
    RoleAnalistaRisco: {
        PermissionReadTransacoes,
        PermissionViewRiskScore,
        PermissionBlockTransaction,
        PermissionMarkFraud,
    },
    RoleProductManager: {
        PermissionReadObjectDefinitions,
        PermissionWriteObjectDefinitions,
        PermissionEditFSM,
        PermissionEditValidationRules,
    },
    RoleAdmin: {
        PermissionAll, // Todas as permissões
    },
}

// Middleware RBAC
func RBACMiddleware(requiredPermission Permission) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := getCurrentUser(c)

        if !user.HasPermission(requiredPermission) {
            c.JSON(403, gin.H{"error": "forbidden: insufficient permissions"})
            c.Abort()
            return
        }

        c.Next()
    }
}

// Uso em rotas
router.GET("/api/v1/backoffice/clientes/:id",
    RBACMiddleware(PermissionReadClientes),
    handleGetCliente,
)

router.POST("/api/v1/backoffice/compliance/kyc/:id/aprovar",
    RBACMiddleware(PermissionApproveKYC),
    handleAprovarKYC,
)
```

### Audit Logging

```go
// Middleware de Auditoria
func AuditMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        startTime := time.Now()
        user := getCurrentUser(c)

        // Captura request body (se presente)
        var requestBody map[string]interface{}
        if c.Request.Method != "GET" {
            c.ShouldBindJSON(&requestBody)
        }

        // Processa request
        c.Next()

        // Log após response
        auditLog := AuditLog{
            ID:           uuid.New(),
            Timestamp:    startTime,
            UserID:       user.ID,
            UserEmail:    user.Email,
            Action:       fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.Path),
            ResourceType: extractResourceType(c.Request.URL.Path),
            ResourceID:   c.Param("id"),
            IPAddress:    c.ClientIP(),
            UserAgent:    c.Request.UserAgent(),
            RequestBody:  requestBody,
            StatusCode:   c.Writer.Status(),
            Duration:     time.Since(startTime),
        }

        // Persiste em PostgreSQL + Elasticsearch (async)
        go func() {
            db.Create(&auditLog)
            esClient.Index("audit-logs", auditLog)
        }()
    }
}

// Tabela audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_body JSONB,
    status_code INT,
    duration_ms INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

---

## ⚡ Performance e Escalabilidade

### Otimizações

1. **Redis Cache**
   - KPIs do dashboard (TTL: 30s)
   - Contagem de filas (TTL: 10s)
   - Dados de usuário (TTL: 5min)

2. **Paginação**
   - Todas as listagens: 100 itens por página
   - Cursor-based pagination para grandes volumes

3. **Lazy Loading**
   - Tabs carregam dados apenas quando abertas
   - Infinite scroll em listas longas

4. **WebSocket Throttling**
   - Máximo 10 atualizações/segundo por cliente
   - Debounce de notificações (agrupa múltiplas em 1s)

5. **Database Indexes**
   - Já implementados na Fase 1 (15 indexes)
   - Adicionar indexes para audit_logs

---

## 🧪 Testes e Qualidade

### Coverage Mínimo

- Backend: 70% coverage
- Frontend: 60% coverage
- E2E: 10 cenários críticos

### Testes E2E (Playwright)

```typescript
// tests/e2e/backoffice-dashboard.spec.ts
test('Dashboard carrega KPIs e atualiza real-time', async ({ page }) => {
  await page.goto('/backoffice/dashboard');

  // Verifica cards de KPI
  await expect(page.locator('text=Clientes Ativos')).toBeVisible();
  await expect(page.locator('text=1247')).toBeVisible();

  // Simula atualização via WebSocket (mock)
  await page.evaluate(() => {
    window.dispatchEvent(new MessageEvent('message', {
      data: JSON.stringify({
        type: 'kpi_update',
        kpi: 'clientes_ativos',
        value: 1248
      })
    }));
  });

  // Verifica atualização
  await expect(page.locator('text=1248')).toBeVisible();
});

test('Aprovação de KYC funciona end-to-end', async ({ page }) => {
  await page.goto('/backoffice/compliance/kyc-queue');

  // Clica no primeiro cliente
  await page.click('button:has-text("Analisar")');

  // Verifica documentos carregaram
  await expect(page.locator('text=Documentos')).toBeVisible();

  // Aprova KYC
  await page.click('button:has-text("Aprovar")');
  await page.fill('textarea[placeholder="Motivo da decisão"]', 'Documentos válidos');
  await page.click('button:has-text("Confirmar Decisão")');

  // Verifica toast de sucesso
  await expect(page.locator('text=KYC aprovado com sucesso')).toBeVisible();

  // Verifica que voltou para fila
  await expect(page).toHaveURL('/backoffice/compliance/kyc-queue');
});
```

---

## 📊 Métricas de Sucesso

### KPIs Técnicos

| Métrica | Target | Medição |
|---------|--------|---------|
| Tempo de carregamento (Dashboard) | <2s (P95) | Lighthouse, RUM |
| Latência de notificação (WebSocket) | <1s | Custom metrics |
| Uptime do BackOffice | >99.5% | Pingdom, Datadog |
| Erros de API | <0.5% | Error rate monitoring |
| Sessões simultâneas | 100+ usuários | Load testing (k6) |

### KPIs de Negócio

| Métrica | Target | Impacto |
|---------|--------|---------|
| Tempo médio de aprovação de KYC | <2 horas | Redução de 80% |
| Taxa de detecção de fraude | >95% | Prevenção de perdas |
| Tempo de resolução de tickets | <24 horas | Satisfação do cliente |
| Produtividade de operadores | +50% | Menos cliques, mais automação |

---

## 🚀 Roadmap de Implementação

Ver documento: `/Users/jose.silva.lb/LBPay/supercore/Docs/fase3/SQUAD_E_SPRINTS_FASE_3.md`

**Resumo**:
- 5 sprints (10 semanas)
- 207 story points
- Squad de 9 pessoas (6 full-time + 3 part-time)

---

## 📝 Conclusão

O BackOffice Portal é o centro de comando da operação do Core Banking. Com 11 módulos completos, RBAC granular, real-time via WebSocket e auditoria completa, capacita equipes internas a gerenciar toda a operação de forma eficiente e segura.

**Diferenciais**:
1. 100% genérico (usa `object_definitions`)
2. Real-time first (WebSocket)
3. Mobile-responsive (tablets)
4. Audit everything (compliance)
5. Performance otimizada (Redis, paginação, lazy loading)

**Próximo Passo**: Criar documento de Sprints e Squad da Fase 3.

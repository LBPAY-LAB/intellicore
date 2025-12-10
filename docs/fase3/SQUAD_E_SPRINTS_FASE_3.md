# Fase 3: BackOffice Portal - Squad e Sprints

> **"Transformar complexidade operacional em interfaces simples e eficientes."**

---

## 📋 Índice

1. [Composição da Squad](#composição-da-squad)
2. [Breakdown de Sprints](#breakdown-de-sprints)
3. [User Stories Detalhadas](#user-stories-detalhadas)
4. [Rituais e Cerimônias](#rituais-e-cerimônias)
5. [Ferramentas e Processos](#ferramentas-e-processos)
6. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 👥 Composição da Squad

### Squad Fase 3 (10 semanas, 5 sprints)

| Papel | Nome | Alocação | Responsabilidades Principais |
|-------|------|----------|------------------------------|
| **Tech Lead** | Alex Santos | 100% | Arquitetura, code review, decisões técnicas, mentoria |
| **Frontend Senior** | Juliana Lima | 100% | Componentes complexos (Dashboard, 360°), WebSocket, performance |
| **Frontend Mid-Level** | Bruno Costa | 100% | Formulários, tabelas, CRUD genérico, UI polish |
| **Frontend Junior** | Camila Souza | 100% | Componentes UI simples, testes, documentação |
| **Backend Engineer (Go)** | Pedro Costa | 100% | APIs BackOffice, RBAC, audit logs, integrações |
| **UX/UI Designer** | Fernanda Alves | 75% | Design system, layouts, user flows, usability testing |
| **QA Engineer** | Ricardo Martins | 75% | Testes E2E, testes de integração, automation |
| **DevOps Engineer** | Gabriel Nunes | 25% | Deploy, monitoring, WebSocket infra, Redis |
| **Product Owner** | Marcelo Silva | 25% | Priorização, review, feedback de stakeholders |

**Total**: 7.5 FTE (Full-Time Equivalent)

### Habilidades Necessárias

#### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript** avançado (generics, utility types)
- **React Query** (cache, mutations, optimistic updates)
- **WebSocket** (reconnection, heartbeat, message queueing)
- **shadcn/ui** + **Tailwind CSS**
- **React Flow** (FSM editor, relacionamentos graph)
- **React Grid Layout** (dashboard customizável)
- **react-chartjs-2** / **recharts** (visualizações)
- **Playwright** (E2E testing)

#### Backend
- **Go 1.21+** (Gin framework)
- **PostgreSQL 15+** (queries complexas, JSONB, GIN indexes)
- **Redis 7+** (pub/sub para WebSocket, cache)
- **Keycloak** (OIDC/OAuth2 integration)
- **RBAC** (authorization patterns)
- **Audit Logging** (Elasticsearch integration)
- **WebSocket** (Gorilla WebSocket, connection management)

#### Design
- **Figma** (prototyping, design system)
- **Accessibility** (WCAG 2.1 AA)
- **Responsive Design** (mobile-first)
- **Design Tokens** (color, spacing, typography)

#### DevOps
- **Docker Compose** (local dev environment)
- **GitHub Actions** (CI/CD)
- **Monitoring** (Prometheus, Grafana, Datadog)
- **WebSocket Load Balancing** (sticky sessions, Redis adapter)

---

## 📅 Breakdown de Sprints

### Visão Geral (10 semanas, 5 sprints)

| Sprint | Semanas | Foco Principal | Story Points | Entregas |
|--------|---------|----------------|--------------|----------|
| **Sprint 15** | 1-2 | Dashboard Executivo + Notificações | 34 | Dashboard com KPIs real-time, WebSocket hub, Bell notifications |
| **Sprint 16** | 3-4 | Clientes 360° + Contas | 38 | Cliente 360° view (7 tabs), Gestão de Contas, Limites |
| **Sprint 17** | 5-6 | Transações + Compliance/KYC | 42 | Filtros avançados, Fila KYC, Análise de documentos, OCR |
| **Sprint 18** | 7-8 | Risco/Fraude + Produto Config | 45 | Dashboard Risco real-time, Alertas, FSM Editor visual |
| **Sprint 19** | 9-10 | Suporte + Relatórios + Admin | 48 | Tickets, Report Builder, RBAC, Audit Logs, Polish |

**Total**: 207 story points, ~41 SP por sprint (média)

---

## 📖 User Stories Detalhadas

### Sprint 15: Dashboard Executivo + Notificações (Semanas 1-2)

**Objetivo**: Criar centro de comando com KPIs real-time e sistema de notificações.

#### US-15.1: Dashboard Executivo com KPIs (13 SP)

**Como** Gerente de Operações
**Quero** ver KPIs em tempo real no dashboard
**Para** tomar decisões informadas rapidamente

**Critérios de Aceitação**:
- [ ] 4 cards de KPI (Clientes Ativos, Volume Transacional, Fila KYC, Alertas)
- [ ] Cada card mostra valor atual + trend (% vs período anterior)
- [ ] Cards são clicáveis e levam para tela detalhada
- [ ] Atualização automática a cada 30s (sem WebSocket)
- [ ] Loading states e error states
- [ ] Responsive (mobile, tablet, desktop)

**Tasks**:
1. Criar componente `KPICard` (2h)
2. Implementar API `/api/v1/backoffice/dashboard/kpis` (3h)
3. Implementar queries agregadas (PostgreSQL) (4h)
4. Criar página `DashboardExecutivo.tsx` (3h)
5. Adicionar React Query com refetch interval (1h)
6. Testes unitários (2h)
7. Testes E2E (Playwright) (2h)

**Estimativa**: 13 SP

---

#### US-15.2: Gráficos Interativos no Dashboard (8 SP)

**Como** Gerente de Operações
**Quero** visualizar gráficos de evolução e distribuição
**Para** identificar tendências e anomalias

**Critérios de Aceitação**:
- [ ] Gráfico de linha: Evolução de Clientes (últimos 30 dias)
- [ ] Gráfico de pizza: Volume Transacional por Tipo (PIX, TED, Boleto)
- [ ] Gráfico de funil: Aprovação de KYC (Iniciado → Aprovado)
- [ ] Tooltips informativos ao passar mouse
- [ ] Exportação de gráficos (PNG) via botão
- [ ] Responsive e acessível (ARIA labels)

**Tasks**:
1. Setup react-chartjs-2 ou recharts (1h)
2. Criar componente `LineChart` (2h)
3. Criar componente `PieChart` (2h)
4. Criar componente `FunnelChart` (2h)
5. Implementar export (html2canvas) (2h)
6. Integrar com API de KPIs (1h)
7. Testes (2h)

**Estimativa**: 8 SP

---

#### US-15.3: WebSocket Hub para Real-Time (8 SP)

**Como** Sistema
**Quero** enviar atualizações real-time via WebSocket
**Para** reduzir latência de atualização de dados

**Critérios de Aceitação**:
- [ ] Backend: WebSocket server em `/ws/dashboard`
- [ ] Broadcast de atualizações de KPIs para todos os clientes conectados
- [ ] Heartbeat a cada 30s para manter conexão viva
- [ ] Reconexão automática se conexão cair
- [ ] Rate limiting: máximo 10 mensagens/segundo por cliente
- [ ] Redis pub/sub para múltiplas instâncias do backend

**Tasks**:
1. Setup Gorilla WebSocket no backend (2h)
2. Implementar connection manager (map de conexões) (3h)
3. Implementar broadcast (pub/sub com Redis) (4h)
4. Heartbeat e reconnection logic (2h)
5. Rate limiting (1h)
6. Testes de carga (k6) (3h)

**Estimativa**: 8 SP

---

#### US-15.4: Sistema de Notificações Real-Time (5 SP)

**Como** Usuário do BackOffice
**Quero** receber notificações em tempo real
**Para** reagir rapidamente a eventos importantes

**Critérios de Aceitação**:
- [ ] Bell icon no topbar com badge de contagem de não lidas
- [ ] Dropdown com últimas 10 notificações
- [ ] WebSocket `/ws/notificacoes` para push real-time
- [ ] Toast notification ao receber nova notificação
- [ ] Marcar como lida / Marcar todas como lidas
- [ ] Link para recurso relacionado (ex: cliente, transação)

**Tasks**:
1. Criar componente `NotificationBell` (2h)
2. Implementar API `/api/v1/backoffice/notificacoes` (2h)
3. Implementar WebSocket `/ws/notificacoes` (2h)
4. Integrar com sistema de eventos (event bus) (3h)
5. Criar tabela `notifications` no PostgreSQL (1h)
6. Testes (2h)

**Estimativa**: 5 SP

---

### Sprint 16: Clientes 360° + Contas (Semanas 3-4)

**Objetivo**: Visão completa de clientes e gestão de contas.

#### US-16.1: Lista de Clientes com Busca e Filtros (5 SP)

**Como** Operador
**Quero** buscar e filtrar clientes
**Para** encontrar rapidamente o cliente desejado

**Critérios de Aceitação**:
- [ ] Busca por CPF/CNPJ, Nome, Email, Telefone
- [ ] Filtros: Estado (Ativo, Bloqueado), Segmento, Data de Cadastro
- [ ] Ordenação: Nome, Data, Score de Risco
- [ ] Paginação (100 por página)
- [ ] Ações rápidas: Ver 360°, Bloquear, Editar
- [ ] Debounce de 300ms na busca

**Tasks**:
1. Criar componente `ClientesLista.tsx` (3h)
2. Implementar API `/api/v1/backoffice/clientes` com query params (3h)
3. Adicionar filtros de busca (2h)
4. Implementar paginação (1h)
5. Testes (2h)

**Estimativa**: 5 SP

---

#### US-16.2: Cliente 360° View (Aba Overview) (5 SP)

**Como** Operador
**Quero** ver dados completos do cliente
**Para** ter contexto ao atender

**Critérios de Aceitação**:
- [ ] Card com dados cadastrais (nome, CPF, email, telefone, endereço)
- [ ] Badge de status (Ativo, Bloqueado, Inativo)
- [ ] Score de risco (visual: gauge ou progress bar)
- [ ] Tags customizadas (VIP, Inadimplente, etc)
- [ ] Botões de ação: Bloquear/Desbloquear, Editar, Enviar Notificação

**Tasks**:
1. Criar componente `ClienteView360.tsx` (2h)
2. Criar aba `ClienteOverview` (2h)
3. Implementar API `/api/v1/backoffice/clientes/:id/360` (3h)
4. Criar componente `ClienteHeader` (2h)
5. Testes (2h)

**Estimativa**: 5 SP

---

#### US-16.3: Cliente 360° View (Abas Contas e Transações) (8 SP)

**Como** Operador
**Quero** ver contas e transações do cliente
**Para** ter visão completa do histórico

**Critérios de Aceitação**:
- [ ] Aba "Contas": tabela com contas vinculadas (número, tipo, saldo, status)
- [ ] Aba "Transações": tabela com últimas 100 transações (data, tipo, valor, status)
- [ ] Clicar em conta leva para `/backoffice/contas/:id`
- [ ] Clicar em transação leva para `/backoffice/transacoes/:id`
- [ ] Paginação e ordenação

**Tasks**:
1. Criar aba `ContasTable` (2h)
2. Criar aba `TransacoesTable` (2h)
3. Implementar queries de relacionamentos (relationships table) (3h)
4. Adicionar navegação entre recursos (1h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-16.4: Cliente 360° View (Abas Relacionamentos e Documentos) (8 SP)

**Como** Analista de Compliance
**Quero** ver relacionamentos e documentos do cliente
**Para** validar KYC e conexões

**Critérios de Aceitação**:
- [ ] Aba "Relacionamentos": grafo visual com React Flow (dependentes, procuradores)
- [ ] Aba "Documentos": galeria de documentos (RG, CPF, Comprovante)
- [ ] Visualizador de documentos (PDF inline, imagens)
- [ ] Status de cada documento (Pendente, Aprovado, Rejeitado)

**Tasks**:
1. Setup React Flow (2h)
2. Criar componente `RelacionamentosGraph` (4h)
3. Criar componente `DocumentosGallery` (3h)
4. Implementar visualizador de PDF (react-pdf) (2h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-16.5: Cliente 360° View (Abas Histórico e Interações) (5 SP)

**Como** Gerente de Suporte
**Quero** ver histórico de estados e interações do cliente
**Para** entender jornada e problemas

**Critérios de Aceitação**:
- [ ] Aba "Histórico": timeline de eventos (criação, aprovação, bloqueios) com datas
- [ ] Aba "Interações": lista de tickets, chamadas, emails
- [ ] Visual de timeline (vertical, com ícones)
- [ ] Filtros por tipo de evento

**Tasks**:
1. Criar componente `HistoricoTimeline` (3h)
2. Criar componente `InteracoesList` (2h)
3. Implementar query de state_history (1h)
4. Testes (2h)

**Estimativa**: 5 SP

---

#### US-16.6: Gestão de Contas (Lista e Detalhes) (7 SP)

**Como** Operador
**Quero** visualizar saldos e extratos de contas
**Para** responder dúvidas de clientes

**Critérios de Aceitação**:
- [ ] Lista de contas com busca e filtros (número, titular, tipo, status)
- [ ] Página de detalhes da conta: saldo real-time (TigerBeetle), extrato, limites
- [ ] Ações: Ajustar Limites, Bloquear/Desbloquear, Gerar Extrato PDF
- [ ] Consulta de saldo a cada 10s (React Query refetch)

**Tasks**:
1. Criar página `ContasLista.tsx` (2h)
2. Criar página `ContaDetails.tsx` (3h)
3. Implementar API `/api/v1/backoffice/contas/:id/saldo` (integração TigerBeetle) (4h)
4. Implementar geração de PDF (pdfkit ou similar) (3h)
5. Testes (2h)

**Estimativa**: 7 SP

---

### Sprint 17: Transações + Compliance/KYC (Semanas 5-6)

**Objetivo**: Busca avançada de transações e fila de análise de KYC.

#### US-17.1: Lista de Transações com Filtros Avançados (8 SP)

**Como** Analista de Risco
**Quero** buscar transações com múltiplos filtros
**Para** investigar fraudes

**Critérios de Aceitação**:
- [ ] Filtros: Tipo (PIX, TED, Boleto), Status, Período (range), Valor (range), Risco (range)
- [ ] Busca por ID, Conta Origem/Destino, Chave PIX, CPF/CNPJ
- [ ] Ordenação: Data, Valor, Score de Risco
- [ ] Paginação (100 por página)
- [ ] Exportar resultados (CSV)

**Tasks**:
1. Criar componente `TransactionFilters` (3h)
2. Implementar API `/api/v1/backoffice/transacoes` com query complexa (5h)
3. Criar página `TransacoesLista.tsx` (3h)
4. Implementar export CSV (2h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-17.2: Detalhes da Transação e Ações (5 SP)

**Como** Analista de Risco
**Quero** ver detalhes completos da transação
**Para** decidir se estornar ou marcar como fraude

**Critérios de Aceitação**:
- [ ] Card com dados completos (origem, destino, valor, tarifa, timestamps)
- [ ] Timeline de estados (INICIADA → VALIDADA → LIQUIDADA)
- [ ] Score de fraude com fatores de risco detalhados
- [ ] Logs de integração (TigerBeetle, BACEN SPI)
- [ ] Ações: Estornar (com confirmação), Marcar como Fraude, Exportar Comprovante PDF

**Tasks**:
1. Criar página `TransacaoDetails.tsx` (3h)
2. Implementar API `/api/v1/backoffice/transacoes/:id` (2h)
3. Implementar ação de estorno (POST `/api/v1/backoffice/transacoes/:id/estornar`) (3h)
4. Criar modal de confirmação (1h)
5. Testes (2h)

**Estimativa**: 5 SP

---

#### US-17.3: Fila de Análise KYC (8 SP)

**Como** Analista de Compliance
**Quero** ver fila de clientes pendentes de KYC
**Para** priorizar análises

**Critérios de Aceitação**:
- [ ] Stats: Pendentes, Em Análise, Aprovados Hoje, Rejeitados Hoje
- [ ] Tabela de clientes ordenada por prioridade (Alta, Normal, Baixa)
- [ ] Colunas: Prioridade, Cliente, CPF, Data Cadastro, Score Risco, Documentos, Ações
- [ ] Filtros: Prioridade, Data de Cadastro
- [ ] Botão "Analisar" leva para `/backoffice/compliance/kyc/:id`

**Tasks**:
1. Criar página `KYCQueue.tsx` (2h)
2. Implementar API `/api/v1/backoffice/compliance/kyc-queue` (3h)
3. Implementar lógica de priorização (score de risco + data) (2h)
4. Criar componente `PriorityBadge` (1h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-17.4: Análise de KYC com Visualizador de Documentos (13 SP)

**Como** Analista de Compliance
**Quero** visualizar documentos e decidir sobre KYC
**Para** aprovar ou rejeitar clientes

**Critérios de Aceitação**:
- [ ] Lado esquerdo: visualizador de documentos (PDF inline, imagens zoom)
- [ ] Navegação entre documentos (RG frente, RG verso, Selfie, Comprovante)
- [ ] Lado direito: checklist de validação (5 itens) com checkbox
- [ ] Card de decisão: botões "Aprovar" e "Rejeitar"
- [ ] Campo de motivo obrigatório
- [ ] Confirmação antes de enviar decisão

**Tasks**:
1. Criar página `KYCAnalise.tsx` (4h)
2. Criar componente `DocumentViewer` (react-pdf + react-zoom-pan-pinch) (4h)
3. Criar componente `KYCChecklist` (2h)
4. Implementar API `/api/v1/backoffice/compliance/kyc/:id/decidir` (3h)
5. Implementar transição de estado (PENDENTE → ATIVO ou REJEITADO) (2h)
6. Testes (3h)

**Estimativa**: 13 SP

---

#### US-17.5: OCR e Comparação de Dados (8 SP)

**Como** Analista de Compliance
**Quero** ver dados extraídos por OCR comparados com dados manuais
**Para** detectar inconsistências

**Critérios de Aceitação**:
- [ ] Card "Dados Extraídos (OCR)" com campos: Nome (OCR), CPF (OCR), Data Nascimento (OCR)
- [ ] Comparação lado a lado: OCR vs Dados Manuais
- [ ] Highlight de diferenças (amarelo se divergir)
- [ ] Confiança do OCR (%) por campo
- [ ] Botão "Aceitar Dados OCR" para sobrescrever dados manuais

**Tasks**:
1. Integrar Tesseract.js ou Google Vision API (4h)
2. Criar serviço de OCR no backend (3h)
3. Criar componente `OCRDataComparison` (3h)
4. Implementar lógica de diff (1h)
5. Testes (2h)

**Estimativa**: 8 SP

---

### Sprint 18: Risco/Fraude + Produto Config (Semanas 7-8)

**Objetivo**: Dashboard de risco real-time e editor visual de FSM.

#### US-18.1: Dashboard de Risco com Alertas Real-Time (13 SP)

**Como** Analista de Risco
**Quero** ver alertas de fraude em tempo real
**Para** agir rapidamente

**Critérios de Aceitação**:
- [ ] Stats: Alertas Hoje, Transações Bloqueadas, Fraudes Confirmadas, Falsos Positivos
- [ ] Tabela de alertas recentes (última hora)
- [ ] Animação de "pulse" ao receber novo alerta via WebSocket
- [ ] Colunas: Timestamp, Tipo, Transação, Score, Fatores, Ações
- [ ] Gráfico: Distribuição de Scores de Risco (histograma)
- [ ] WebSocket `/ws/risco/alertas` para push real-time

**Tasks**:
1. Criar página `RiscoDashboard.tsx` (3h)
2. Implementar API `/api/v1/backoffice/risco/alertas` (3h)
3. Implementar WebSocket `/ws/risco/alertas` (3h)
4. Criar componente `RiskScore` (visual gauge) (2h)
5. Criar componente `HistogramChart` (2h)
6. Testes (2h)

**Estimativa**: 13 SP

---

#### US-18.2: Análise de Alerta de Risco (8 SP)

**Como** Analista de Risco
**Quero** ver detalhes completos do alerta
**Para** decidir se bloquear ou liberar transação

**Critérios de Aceitação**:
- [ ] Detalhes da transação (origem, destino, valor, timestamp)
- [ ] Score de risco com breakdown de fatores (horário, valor, histórico, device)
- [ ] Recomendação automática (Aprovar, Revisar, Bloquear)
- [ ] Histórico de transações do cliente (últimas 10)
- [ ] Ações: Aprovar, Bloquear, Marcar como Fraude, Falso Positivo

**Tasks**:
1. Criar página `AlertaAnalise.tsx` (3h)
2. Implementar API `/api/v1/backoffice/risco/alertas/:id` (2h)
3. Criar componente `RiskFactorsList` (2h)
4. Implementar ações (PATCH `/api/v1/backoffice/risco/alertas/:id/decidir`) (3h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-18.3: Gestão de Regras de Risco (8 SP)

**Como** Product Manager
**Quero** criar e editar regras de risco customizadas
**Para** ajustar detecção de fraude

**Critérios de Aceitação**:
- [ ] Lista de regras de risco ativas
- [ ] CRUD de regras: Nome, Descrição, Condição (CEL), Peso (0-100)
- [ ] Sandbox para testar regra com transação fictícia
- [ ] Histórico de mudanças (versioning)
- [ ] Ativar/Desativar regra (toggle)

**Tasks**:
1. Criar página `RegrasRisco.tsx` (3h)
2. Implementar API `/api/v1/backoffice/risco/regras` (CRUD) (4h)
3. Criar componente `RuleEditor` (editor de CEL) (3h)
4. Implementar sandbox (POST `/api/v1/backoffice/risco/regras/test`) (2h)
5. Testes (2h)

**Estimativa**: 8 SP

---

#### US-18.4: Editor Visual de FSM (React Flow) (13 SP)

**Como** Product Manager
**Quero** editar FSMs visualmente
**Para** configurar ciclos de vida de objetos

**Critérios de Aceitação**:
- [ ] Canvas com React Flow
- [ ] Drag-and-drop de estados (nodes)
- [ ] Conectar estados (edges = transições)
- [ ] Editar nome de estado (double-click)
- [ ] Editar condição de transição (CEL expression)
- [ ] Validação: estados órfãos, transições inválidas
- [ ] Botão "Salvar" atualiza `object_definition.states`

**Tasks**:
1. Setup React Flow (2h)
2. Criar componente `FSMEditor.tsx` (5h)
3. Implementar drag-and-drop de nodes (2h)
4. Implementar edges (transições) (2h)
5. Implementar validação de FSM (3h)
6. Integrar com API de `object_definitions` (2h)
7. Testes (3h)

**Estimativa**: 13 SP

---

#### US-18.5: Simulador de Objetos (3 SP)

**Como** Product Manager
**Quero** criar instância de teste de um objeto
**Para** validar schema e FSM

**Critérios de Aceitação**:
- [ ] Botão "Simular" na página de `object_definition`
- [ ] Formulário dinâmico gerado do schema (reusa `DynamicInstanceForm`)
- [ ] Criar instância no banco com flag `is_test = true`
- [ ] Testar transições de estado
- [ ] Excluir instância de teste ao final

**Tasks**:
1. Criar modal `SimuladorObjeto` (2h)
2. Implementar flag `is_test` em instances (1h)
3. Adicionar botão na página de object_definition (1h)
4. Testes (1h)

**Estimativa**: 3 SP

---

### Sprint 19: Suporte + Relatórios + Admin (Semanas 9-10)

**Objetivo**: Gestão de tickets, report builder e administração (RBAC, audit).

#### US-19.1: Fila de Tickets de Suporte (5 SP)

**Como** Agente de Suporte
**Quero** ver fila de tickets abertos
**Para** atender clientes

**Critérios de Aceitação**:
- [ ] Stats: Abertos, Em Andamento, Resolvidos Hoje
- [ ] Tabela de tickets: ID, Cliente, Assunto, Prioridade, Status, Criado em
- [ ] Filtros: Prioridade, Status, Data
- [ ] Botão "Atender" leva para `/backoffice/suporte/tickets/:id`

**Tasks**:
1. Criar página `TicketQueue.tsx` (2h)
2. Implementar API `/api/v1/backoffice/suporte/tickets` (2h)
3. Criar tabela `tickets` no PostgreSQL (1h)
4. Testes (2h)

**Estimativa**: 5 SP

---

#### US-19.2: Atendimento de Ticket com Chat (8 SP)

**Como** Agente de Suporte
**Quero** conversar com cliente via chat
**Para** resolver dúvidas

**Critérios de Aceitação**:
- [ ] Histórico de mensagens (cliente + agente)
- [ ] Campo de resposta com "Enviar"
- [ ] Respostas prontas (canned responses) - dropdown
- [ ] Anexar arquivo (upload)
- [ ] Sidebar com dados do cliente (360° integrado)
- [ ] Ações: Escalar para N2, Fechar Ticket

**Tasks**:
1. Criar página `TicketAtendimento.tsx` (3h)
2. Implementar API `/api/v1/backoffice/suporte/tickets/:id/respostas` (2h)
3. Criar componente `ChatMessage` (1h)
4. Implementar upload de anexo (S3) (2h)
5. Criar tabela `ticket_messages` (1h)
6. Testes (2h)

**Estimativa**: 8 SP

---

#### US-19.3: Report Builder (Drag-and-Drop) (13 SP)

**Como** Gerente
**Quero** criar relatórios customizados
**Para** análises específicas

**Critérios de Aceitação**:
- [ ] Sidebar com campos disponíveis (drag)
- [ ] Canvas de construção (drop)
- [ ] Adicionar filtros (período, segmento, produto)
- [ ] Adicionar agregações (COUNT, SUM, AVG)
- [ ] Preview de resultados (tabela)
- [ ] Salvar relatório (nome + configuração)
- [ ] Exportar (PDF, Excel, CSV)

**Tasks**:
1. Criar página `ReportBuilder.tsx` (4h)
2. Implementar drag-and-drop (react-beautiful-dnd) (3h)
3. Criar componente `FiltersEditor` (2h)
4. Implementar API `/api/v1/backoffice/relatorios/preview` (query builder dinâmico) (5h)
5. Implementar export (PDF: pdfkit, Excel: xlsx) (4h)
6. Testes (3h)

**Estimativa**: 13 SP

---

#### US-19.4: Gestão de Usuários (CRUD) (5 SP)

**Como** Administrador
**Quero** criar e editar usuários internos
**Para** controlar acesso ao sistema

**Critérios de Aceitação**:
- [ ] Lista de usuários (nome, email, papéis, status, último login)
- [ ] CRUD: Criar, Editar, Desativar, Reativar
- [ ] Atribuir múltiplos papéis (roles) - multiselect
- [ ] Integração com Keycloak (create user via API)

**Tasks**:
1. Criar página `UsersManagement.tsx` (2h)
2. Implementar API `/api/v1/backoffice/admin/users` (CRUD) (3h)
3. Integrar com Keycloak Admin API (4h)
4. Testes (2h)

**Estimativa**: 5 SP

---

#### US-19.5: Gestão de Papéis (Roles) e Permissões (8 SP)

**Como** Administrador
**Quero** definir permissões granulares por papel
**Para** controlar acesso a recursos

**Critérios de Aceitação**:
- [ ] Lista de roles: Operador, Analista Compliance, Analista Risco, Product Manager, Admin
- [ ] CRUD de roles (criar custom role)
- [ ] Matriz de permissões (table: role x permission com checkbox)
- [ ] Permissões: ReadClientes, ApproveKYC, BlockTransaction, WriteObjectDefinitions, etc
- [ ] Aplicar permissões no middleware RBAC

**Tasks**:
1. Criar página `RolesManagement.tsx` (3h)
2. Implementar API `/api/v1/backoffice/admin/roles` (CRUD) (3h)
3. Criar tabela `roles` e `permissions` no PostgreSQL (2h)
4. Implementar middleware RBAC (4h)
5. Testes (3h)

**Estimativa**: 8 SP

---

#### US-19.6: Audit Logs (Visualização e Busca) (5 SP)

**Como** Auditor
**Quero** ver logs de todas as ações
**Para** compliance e auditoria

**Critérios de Aceitação**:
- [ ] Lista de audit logs (timestamp, usuário, ação, recurso, IP)
- [ ] Filtros: Usuário, Ação, Recurso, Período
- [ ] Busca por ID de recurso
- [ ] Export (CSV)
- [ ] Detalhes de log (modal com request/response body)

**Tasks**:
1. Criar página `AuditLogs.tsx` (2h)
2. Implementar API `/api/v1/backoffice/admin/audit-logs` (query complexa) (3h)
3. Criar componente `AuditLogFilters` (2h)
4. Implementar export CSV (1h)
5. Testes (2h)

**Estimativa**: 5 SP

---

#### US-19.7: Polish e Performance (4 SP)

**Como** Usuário
**Quero** interface fluida e rápida
**Para** produtividade

**Critérios de Aceitação**:
- [ ] Loading states em todas as páginas
- [ ] Error boundaries para erros inesperados
- [ ] Skeleton loaders (shimmer effect)
- [ ] Toast notifications consistentes
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] Responsive em todos os módulos

**Tasks**:
1. Adicionar skeleton loaders (1h)
2. Adicionar error boundaries (1h)
3. Code splitting (React.lazy) (2h)
4. Otimizar imagens (next/image) (1h)
5. Testar responsividade em todos os módulos (3h)
6. Lighthouse audit e fixes (2h)

**Estimativa**: 4 SP

---

## 🎯 Rituais e Cerimônias

### Daily Standup (15 min, 9:00 AM)

**Formato**:
- O que fiz ontem?
- O que vou fazer hoje?
- Algum bloqueio?

**Participantes**: Toda a squad (Tech Lead facilita)

---

### Sprint Planning (4h, início da sprint)

**Agenda**:
1. Review do Sprint Goal (30 min)
2. Refinement das User Stories (1h)
3. Estimativa (Planning Poker) (1h)
4. Alocação de tasks (1h)
5. Definition of Done (30 min)

**Participantes**: Toda a squad + Product Owner

---

### Sprint Review (2h, final da sprint)

**Agenda**:
1. Demo das features implementadas (1h)
2. Feedback de stakeholders (30 min)
3. Aceitação das User Stories (30 min)

**Participantes**: Squad + Stakeholders (Gerente de Ops, Compliance, Risco)

---

### Sprint Retrospective (1.5h, final da sprint)

**Formato**: Start, Stop, Continue

**Agenda**:
1. O que funcionou bem? (Start) (30 min)
2. O que não funcionou? (Stop) (30 min)
3. O que continuar fazendo? (Continue) (15 min)
4. Action items para próxima sprint (15 min)

**Participantes**: Toda a squad (sem stakeholders)

---

### Refinement (2h, mid-sprint)

**Objetivo**: Refinar User Stories da próxima sprint

**Agenda**:
1. Clarificar requisitos (1h)
2. Quebrar User Stories grandes (30 min)
3. Estimativa preliminar (30 min)

**Participantes**: Tech Lead + Frontend Lead + Backend Lead + Product Owner

---

## 🛠️ Ferramentas e Processos

### Desenvolvimento

| Ferramenta | Uso |
|------------|-----|
| **VS Code** | IDE principal |
| **GitHub** | Controle de versão |
| **GitHub Actions** | CI/CD |
| **Docker Compose** | Ambiente local |
| **Postman** | Testes manuais de API |
| **Figma** | Design e protótipos |

### Gestão de Projeto

| Ferramenta | Uso |
|------------|-----|
| **Jira** | Backlog, sprints, burn-down chart |
| **Confluence** | Documentação técnica |
| **Slack** | Comunicação assíncrona |
| **Google Meet** | Reuniões síncronas |

### Qualidade

| Ferramenta | Uso |
|------------|-----|
| **Jest** | Testes unitários (frontend) |
| **Go Testing** | Testes unitários (backend) |
| **Playwright** | Testes E2E |
| **k6** | Testes de carga |
| **SonarQube** | Code quality e coverage |

### Monitoring

| Ferramenta | Uso |
|------------|-----|
| **Datadog** | APM e logs |
| **Grafana** | Dashboards de métricas |
| **Prometheus** | Coleta de métricas |
| **Sentry** | Error tracking |

---

## ⚠️ Riscos e Mitigações

### Risco 1: WebSocket Complexity (Alta Probabilidade, Alto Impacto)

**Descrição**: Implementação de WebSocket para real-time é complexa (reconexão, heartbeat, broadcast).

**Mitigação**:
- Usar biblioteca testada (Gorilla WebSocket no backend, native WebSocket API no frontend)
- Implementar heartbeat desde o início
- Testar com múltiplos clientes (k6)
- Plano B: Usar polling (fallback) se WebSocket falhar

**Responsável**: Pedro Costa (Backend) + Juliana Lima (Frontend)

---

### Risco 2: Performance com Muitos Dados (Média Probabilidade, Alto Impacto)

**Descrição**: Queries complexas (360° view, relatórios) podem ser lentas com volume crescente.

**Mitigação**:
- Paginação obrigatória (max 100 itens)
- Redis cache para dados quentes (KPIs, saldos)
- Indexes otimizados (já implementados na Fase 1)
- Query profiling com EXPLAIN ANALYZE
- Lazy loading de tabs (só carrega quando clicado)

**Responsável**: Pedro Costa (Backend) + Alex Santos (Tech Lead)

---

### Risco 3: Escopo Creep (Média Probabilidade, Médio Impacto)

**Descrição**: Stakeholders podem pedir features adicionais mid-sprint.

**Mitigação**:
- Definition of Done clara
- Product Owner gatekeeper de mudanças
- Novas features vão para backlog (não para sprint atual)
- Sprint Review para alinhar expectativas

**Responsável**: Marcelo Silva (Product Owner)

---

### Risco 4: Integração com Keycloak (Baixa Probabilidade, Alto Impacto)

**Descrição**: Problemas com autenticação/autorização podem bloquear desenvolvimento.

**Mitigação**:
- Setup de Keycloak no início (Sprint 15)
- Documentação clara de OIDC flow
- Mock de autenticação para testes (bypass token validation)
- Suporte de DevOps (Gabriel Nunes)

**Responsável**: Gabriel Nunes (DevOps) + Pedro Costa (Backend)

---

### Risco 5: Dependência de Designer (Média Probabilidade, Médio Impacto)

**Descrição**: Designer alocado apenas 75%, pode causar gargalo.

**Mitigação**:
- Design system já pronto (shadcn/ui)
- Mockups de baixa fidelidade (wireframes) suficientes para iniciar
- Frontend pode iterar sem designer (usando componentes do design system)
- Designer foca em UX crítico (Dashboard, 360°)

**Responsável**: Fernanda Alves (Designer) + Juliana Lima (Frontend)

---

## 📊 Métricas de Sucesso da Squad

### Velocity

**Target**: 40-45 SP por sprint (média)

**Medição**: Burn-down chart no Jira

---

### Code Quality

**Targets**:
- Backend coverage: >70%
- Frontend coverage: >60%
- SonarQube Quality Gate: Pass
- Zero critical bugs em produção

**Medição**: SonarQube + GitHub Actions

---

### Performance

**Targets**:
- Tempo de carregamento (Dashboard): <2s (P95)
- Latência de WebSocket: <1s
- API response time: <200ms (P95)

**Medição**: Datadog APM + Grafana

---

### Team Health

**Targets**:
- Retrospective happiness score: >4/5
- Turnover: 0% durante a fase
- Sick days: <5% do tempo

**Medição**: Retrospective + HR metrics

---

## 🎉 Conclusão

A Squad da Fase 3 está dimensionada e estruturada para entregar 11 módulos completos do BackOffice Portal em 10 semanas (5 sprints). Com 207 story points distribuídos de forma balanceada, rituais bem definidos e mitigações de risco claras, a squad tem alta probabilidade de sucesso.

**Próximo Passo**: Iniciar Sprint 15 (Dashboard Executivo + Notificações) após aprovação do Product Owner e stakeholders.

---

**Documento criado em**: 10 de Janeiro de 2025
**Versão**: 1.0
**Autor**: Claude Code (Planning Agent)
**Status**: ✅ Pronto para início da implementação

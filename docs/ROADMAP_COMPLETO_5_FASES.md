# SuperCore Platform - Roadmap Completo (5 Fases)

> **"Da fundação técnica aos portais de negócio em produção"**

## 📋 Visão Geral

Este roadmap detalha as **5 fases** de implementação da plataforma SuperCore, desde a fundação técnica até os portais completos de BackOffice (gestão) e Cliente (self-service).

**Timeline Total**: 14 meses (58 semanas)

---

## 🎯 As 5 Fases

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: FOUNDATION (12 semanas) ✅ COMPLETA                │
│  Base técnica: Object Management + RAG + Performance        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: BRAIN (12 semanas)                                 │
│  Architect Agent: Geração automática de objetos via IA      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: BACKOFFICE PORTAL (10 semanas)                     │
│  Portal completo de gestão para time interno                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 4: CLIENT PORTAL (12 semanas)                         │
│  Portal self-service para clientes finais                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 5: PRODUCTION & SCALE (12 semanas)                    │
│  Integrações BACEN + Certificações + 1000 clientes beta     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ FASE 1: FOUNDATION (12 semanas) - **COMPLETA**

### Objetivo
Construir a base técnica da plataforma: gestão genérica de objetos, RAG trimodal, performance otimizada.

### Entregas
- ✅ Object Management System (object_definitions + instances + relationships)
- ✅ Custom Rule Executor (5 tipos de validações)
- ✅ FSM com Condition Evaluator (CEL-based)
- ✅ Relationship Validation (cardinalidade + ciclos)
- ✅ Frontend Next.js + Keycloak Auth
- ✅ Backoffice CRUD básico (Object Definitions)
- ✅ RAG Trimodal (SQL + Graph + Vector)
- ✅ LLM Integration (OpenAI + Anthropic)
- ✅ Performance Optimizations (Redis, indexes, rate limiting)
- ✅ E2E Tests + Monitoring + CI/CD

### Stack
- Backend: Go 1.21+, PostgreSQL, Redis, Nebula Graph, pgvector
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Keycloak
- Infra: Docker Compose, GitHub Actions, Prometheus, Grafana

### Status
✅ **COMPLETA** - Pronto para produção

---

## 🧠 FASE 2: BRAIN (12 semanas)

### Objetivo
Implementar o **Architect Agent** - IA que lê documentação BACEN e gera automaticamente object_definitions completos.

### Entregas
- [ ] Document Intelligence Engine (PDF → estrutura)
- [ ] Schema Generation Engine (LLM → object_definitions)
- [ ] Knowledge Base com Vector Store (20+ docs BACEN)
- [ ] Review & Deployment System (UI de aprovação)
- [ ] BACEN Crawler (monitoring diário)
- [ ] **Módulo PIX completo gerado automaticamente**

### Stack Adicional
- Python 3.11+ (PyMuPDF, spaCy, FastAPI)
- Claude Opus 4 para geração
- OpenAI embeddings (text-embedding-3-large)
- Celery + Redis para task queue

### Sprints
- Sprint 7-8: Document Intelligence Engine
- Sprint 9-10: Schema Generation Engine
- Sprint 11-12: Knowledge Base & Vector Store
- Sprint 13-14: Review & Deployment System
- Sprint 15-16: BACEN Crawler & Monitoring
- Sprint 17-18: Integration & Polish (Módulo PIX)

### Critérios de Sucesso
- ✅ Módulo PIX gerado em <30 minutos
- ✅ Document parsing accuracy ≥95%
- ✅ Schema generation success rate ≥95%
- ✅ 20+ documentos BACEN indexados

### Status
📝 **ESPECIFICADA** - Aguardando início

---

## 🏢 FASE 3: BACKOFFICE PORTAL (10 semanas)

### Objetivo
Construir um **portal completo de gestão interna** para times de Operações, Compliance, Risco, Produto e Suporte operarem a plataforma sem necessidade de desenvolvedores.

### Personas
1. **Operações** - Gestão de clientes, contas, transações
2. **Compliance** - Análise KYC, PLD/FT, aprovações
3. **Risco** - Análise de crédito, limites, alertas de fraude
4. **Produto** - Criação de objetos, configuração de regras
5. **Suporte** - Atendimento, resolução de problemas

---

### Módulos do BackOffice Portal

#### 1. **Dashboard Executivo** (Sprint 19)
**Para**: C-level, gerentes
**Funcionalidades**:
- KPIs em tempo real (clientes ativos, transações/dia, TPV)
- Gráficos de crescimento (daily, weekly, monthly)
- Alertas críticos (fraude, downtime, compliance)
- Comparativo vs mês anterior
- Drill-down em métricas

**Componentes**:
- Widgets de KPI (reutilizáveis)
- Charts (react-chartjs-2, recharts)
- Real-time updates (WebSocket ou polling)

---

#### 2. **Gestão de Clientes** (Sprint 19-20)
**Para**: Operações, Suporte
**Funcionalidades**:
- **Lista de clientes** (busca, filtros, paginação)
- **Visão 360° do cliente**:
  - Dados cadastrais
  - Contas vinculadas
  - Transações recentes
  - Histórico de estados (timeline)
  - Documentos anexados
  - Interações com suporte
- **Ações**:
  - Editar dados (com auditoria)
  - Bloquear/Desbloquear
  - Adicionar notas internas
  - Enviar notificação
- **Bulk operations**:
  - Importar clientes (CSV)
  - Atualização em massa
  - Exportar relatórios

**Componentes**:
- SearchBar com autocomplete
- DataTable com filtros avançados
- CustomerDetailModal (tabs)
- BulkActionButtons

---

#### 3. **Gestão de Contas** (Sprint 20)
**Para**: Operações
**Funcionalidades**:
- Lista de contas (todos os tipos)
- Visão detalhada de conta:
  - Saldo atual (real-time)
  - Extrato (últimos 90 dias)
  - Limites configurados
  - Titulares e beneficiários
  - Histórico de transações
- Ações:
  - Ajustar limites
  - Bloquear/Desbloquear
  - Transferir saldo (manual)
  - Gerar extrato PDF
- Auditoria completa de mudanças

---

#### 4. **Gestão de Transações** (Sprint 20-21)
**Para**: Operações, Risco
**Funcionalidades**:
- Lista de transações (todos os tipos: PIX, TED, Boleto)
- Filtros avançados:
  - Por período
  - Por status (aprovada, pendente, rejeitada)
  - Por cliente
  - Por valor (range)
  - Por tipo
- Detalhamento de transação:
  - Timeline completa (estados)
  - Dados da transação
  - Score de fraude (se houver)
  - Logs de processamento
- Ações:
  - Reverter/Cancelar (com motivo)
  - Forçar aprovação (com justificativa)
  - Adicionar à whitelist/blacklist
- Exportação para análise (CSV, Excel)

---

#### 5. **Módulo Compliance & KYC** (Sprint 21-22)
**Para**: Compliance
**Funcionalidades**:
- **Fila de análise KYC**:
  - Clientes pendentes de aprovação
  - Documentos enviados (visualizador)
  - Checklist de verificação
  - Consultas automatizadas (CPF, CNPJ)
  - Score de risco
- **Ações**:
  - Aprovar/Reprovar (com comentários)
  - Solicitar documentos adicionais
  - Marcar para revisão manual
- **PLD/FT Monitoring**:
  - Transações suspeitas (alertas)
  - Análise de padrões
  - Geração de relatórios COAF
  - Histórico de comunicações ao BACEN
- **Dashboard de compliance**:
  - Taxa de aprovação KYC
  - Tempo médio de análise
  - Alertas PLD/FT por severidade
  - Pendências regulatórias

**Componentes**:
- DocumentViewer (PDF, imagens)
- KYCChecklist (checkboxes + validações)
- ComplianceQueue (kanban ou lista)
- AlertsPanel (fraude, PLD)

---

#### 6. **Módulo Risco & Fraude** (Sprint 22-23)
**Para**: Risco
**Funcionalidades**:
- **Dashboard de risco**:
  - Alertas de fraude (real-time)
  - Score médio de clientes
  - Transações bloqueadas (últimas 24h)
  - Exposição por produto
- **Análise de transações suspeitas**:
  - Lista de alertas (high/medium/low)
  - Detalhamento do alerta (motivo, score)
  - Histórico do cliente
  - Ações:
    - Aprovar transação (whitelist temporário)
    - Bloquear cliente
    - Escalar para investigação
- **Gestão de limites**:
  - Limites por produto
  - Limites por segmento de cliente
  - Limites individuais (overrides)
  - Histórico de alterações
- **Regras de risco**:
  - Criar/Editar regras customizadas
  - Testar regras (dry-run)
  - Ativar/Desativar regras
  - Monitorar efetividade (false positives)

**Componentes**:
- RiskScoreWidget (gauge, cores)
- AlertsTable (sortable, filterable)
- RuleTester (input → output)
- LimitManager (forms + validação)

---

#### 7. **Módulo Produto & Configuração** (Sprint 23-24)
**Para**: Produto
**Funcionalidades**:
- **Gestão de Object Definitions** (já existe parcialmente):
  - Criar/Editar/Desativar objetos
  - Versionamento de schemas
  - Testar objetos (sandbox)
  - Deploy para produção
- **Gestão de Validation Rules**:
  - Biblioteca de regras
  - Criar regras customizadas
  - Testar regras isoladamente
  - Vincular regras a objetos
- **Gestão de FSMs**:
  - Editor visual de estados/transições
  - Simulação de fluxos
  - Condicional CEL testing
- **Configuração de Integrações**:
  - TigerBeetle (ledger)
  - BACEN SPI (PIX)
  - Anti-Fraude (Data Rudder)
  - Outros serviços (ViaCEP, etc)
- **Feature Flags**:
  - Habilitar/Desabilitar features
  - Rollout gradual (% de usuários)
  - A/B testing

**Componentes**:
- MonacoEditor (JSON Schema)
- FSMEditor (React Flow)
- RuleTester
- FeatureFlagToggle

---

#### 8. **Módulo Suporte & Atendimento** (Sprint 24-25)
**Para**: Suporte
**Funcionalidades**:
- **Tickets de suporte**:
  - Criar ticket manualmente
  - Receber tickets de clientes
  - Atribuir a analistas
  - Status (Aberto, Em Atendimento, Resolvido)
  - SLA tracking
- **Busca unificada**:
  - Buscar cliente por CPF, email, telefone, nome
  - Buscar transação por ID, end-to-end ID
  - Buscar conta por número
- **Histórico de interações**:
  - Ligações (se integrado com telefonia)
  - Emails
  - Chats
  - Notas internas
- **Base de conhecimento** (FAQ):
  - Artigos internos
  - Scripts de atendimento
  - Troubleshooting guides
- **Ações rápidas**:
  - Desbloquear cliente
  - Resetar senha (portal cliente)
  - Reenviar documentos
  - Estornar tarifa

**Componentes**:
- TicketList (kanban ou table)
- UnifiedSearch (multi-entity)
- InteractionTimeline
- QuickActionsBar

---

#### 9. **Módulo Relatórios & Analytics** (Sprint 25-26)
**Para**: Todos
**Funcionalidades**:
- **Relatórios pré-definidos**:
  - Transações por período
  - Clientes cadastrados
  - Taxa de aprovação KYC
  - Volume financeiro (TPV)
  - Rejeições por motivo
  - Performance de produtos
- **Report Builder** (arrasta e solta):
  - Selecionar objeto (Cliente, Conta, Transação)
  - Escolher campos
  - Filtros
  - Agregações (count, sum, avg)
  - Agendamento (daily, weekly, monthly)
  - Exportação (PDF, CSV, Excel)
- **Dashboard customizável**:
  - Widgets reutilizáveis
  - Layouts salvos por usuário
  - Compartilhar dashboards com equipe

**Componentes**:
- ReportBuilder (drag-and-drop)
- ChartLibrary (bar, line, pie, table)
- ScheduleModal
- DashboardGrid (react-grid-layout)

---

#### 10. **Administração & Segurança** (Sprint 26-27)
**Para**: Administradores
**Funcionalidades**:
- **Gestão de Usuários (internos)**:
  - Criar/Editar/Desativar usuários
  - Roles e permissões (RBAC)
  - Grupos (Operações, Compliance, etc)
  - Histórico de login
  - Sessões ativas
- **Auditoria**:
  - Logs de todas as ações críticas
  - Quem fez o quê, quando
  - Exportação de audit trail
  - Busca avançada em logs
- **Segurança**:
  - Configuração de senha (complexidade)
  - 2FA (TOTP, SMS)
  - IP whitelist
  - Rate limiting
- **Configurações globais**:
  - Timezone
  - Idioma (pt-BR, en-US)
  - Branding (logo, cores)
  - SMTP (envio de emails)

**Componentes**:
- UserManagementTable
- RolePermissionMatrix
- AuditLogViewer (filtros avançados)
- SecuritySettings (forms)

---

#### 11. **Notificações & Alertas** (Sprint 27-28)
**Para**: Todos
**Funcionalidades**:
- **Centro de notificações**:
  - Notificações em tempo real (WebSocket)
  - Badge de não lidas
  - Categorias (fraude, compliance, sistema)
  - Marcar como lida
  - Ações rápidas (aprovar, rejeitar direto da notificação)
- **Configuração de alertas**:
  - Escolher tipos de alertas
  - Canais (in-app, email, Slack)
  - Frequência (real-time, digest)
- **Webhooks** (para integrações):
  - Configurar webhooks externos
  - Testar webhooks
  - Logs de entregas

**Componentes**:
- NotificationCenter (dropdown)
- AlertConfigForm
- WebhookTester

---

### Stack Tecnológico - Fase 3

**Frontend**:
- Next.js 14 (já configurado)
- TypeScript
- TailwindCSS + shadcn/ui
- React Query (caching)
- React Hook Form (formulários)
- React Table (tabelas complexas)
- React Flow (FSM editor)
- React Grid Layout (dashboards)
- react-chartjs-2 / recharts (gráficos)
- Socket.io-client (notificações real-time)

**Backend**:
- Go (já implementado na Fase 1)
- Novos endpoints para BackOffice operations
- WebSocket server (notificações)
- Background jobs (relatórios, exports)

**Integrações**:
- SMTP (envio de emails)
- Slack API (notificações)
- S3 (storage de arquivos)
- PDF generation (wkhtmltopdf, puppeteer)

---

### Sprints da Fase 3 (10 semanas = 5 sprints)

#### **Sprint 19** (Semanas 1-2): Dashboard Executivo + Gestão de Clientes
- Dashboard com KPIs principais
- Lista de clientes com busca e filtros
- Visão 360° do cliente (modal detalhado)
- Ações básicas (editar, bloquear)

#### **Sprint 20** (Semanas 3-4): Gestão de Contas + Transações
- Lista de contas com detalhamento
- Extrato de conta
- Lista de transações (todos os tipos)
- Filtros avançados

#### **Sprint 21** (Semanas 5-6): Compliance & KYC
- Fila de análise KYC
- Visualizador de documentos
- Aprovação/Reprovação
- Dashboard de compliance

#### **Sprint 22** (Semanas 7-8): Risco & Fraude
- Dashboard de risco
- Alertas de fraude
- Gestão de limites
- Regras de risco (CRUD)

#### **Sprint 23** (Semanas 9-10): Produto & Configuração
- Gestão avançada de Object Definitions
- Editor de FSM (visual)
- Gestão de Validation Rules
- Feature flags

#### **Sprint 24** (Semanas 11-12): Suporte & Atendimento
- Sistema de tickets
- Busca unificada
- Histórico de interações
- Base de conhecimento

#### **Sprint 25** (Semanas 13-14): Relatórios & Analytics
- Relatórios pré-definidos
- Report Builder (drag-and-drop)
- Dashboard customizável
- Agendamento de relatórios

#### **Sprint 26** (Semanas 15-16): Administração & Segurança
- Gestão de usuários internos
- RBAC completo
- Auditoria (logs)
- Configurações de segurança

#### **Sprint 27** (Semanas 17-18): Notificações & Webhooks
- Centro de notificações
- WebSocket real-time
- Configuração de alertas
- Webhooks

#### **Sprint 28** (Semanas 19-20): Polish & Integration
- UX improvements
- Performance optimization
- Mobile responsive (tablets)
- Documentação completa
- Training da equipe

---

### Critérios de Sucesso - Fase 3

#### Funcional
- [ ] ✅ Todos os 11 módulos implementados
- [ ] ✅ 100% das personas atendidas
- [ ] ✅ RBAC completo (5+ roles)
- [ ] ✅ Auditoria de todas ações críticas
- [ ] ✅ Dashboard executivo com 15+ KPIs
- [ ] ✅ Report Builder funcionando (5+ relatórios customizados)

#### Técnico
- [ ] ✅ Responsive (desktop + tablet)
- [ ] ✅ Performance (P95 < 1s para carregamento de página)
- [ ] ✅ 100% TypeScript strict mode
- [ ] ✅ Test coverage ≥70% (frontend + backend)
- [ ] ✅ Acessibilidade (WCAG 2.1 AA)

#### Negócio
- [ ] ✅ Time de Operações operando 100% via portal
- [ ] ✅ Time de Compliance aprovando KYCs via portal
- [ ] ✅ 90% redução em chamados de suporte para devs
- [ ] ✅ Relatórios gerados sem auxílio de TI

---

## 👤 FASE 4: CLIENT PORTAL (12 semanas)

### Objetivo
Construir um **portal self-service para clientes finais** (pessoas físicas e jurídicas) acessarem suas contas, realizarem transações e gestionarem seus dados.

### Personas
1. **Cliente PF** - Pessoa física com conta
2. **Cliente PJ** - Pessoa jurídica (CNPJ)
3. **Dependente** - Menor de idade vinculado a titular

---

### Módulos do Client Portal

#### 1. **Onboarding & Cadastro** (Sprint 29-30)
**Para**: Novos clientes
**Funcionalidades**:
- **Jornada de cadastro simplificada** (multi-step):
  - Dados pessoais (CPF, nome, data nascimento)
  - Endereço (com autocomplete ViaCEP)
  - Contato (email, telefone com verificação)
  - Criar senha (regras de complexidade)
  - Aceitar termos de uso
- **Verificação de identidade** (KYC):
  - Selfie + documento (OCR)
  - Validação biométrica (opcional)
  - Prova de vida (liveness detection)
- **Verificação de email/telefone**:
  - Código OTP via SMS/Email
- **Status de aprovação**:
  - Pendente de análise
  - Aprovado (pode operar)
  - Reprovado (com motivo)
- **PJ**: Campos adicionais (CNPJ, razão social, sócios)

**Componentes**:
- MultiStepForm (wizard)
- DocumentUploader (drag-and-drop)
- SelfieCapture (camera)
- OTPInput (6 dígitos)
- ProgressIndicator

---

#### 2. **Login & Autenticação** (Sprint 29)
**Para**: Clientes cadastrados
**Funcionalidades**:
- **Login**:
  - Email + senha
  - CPF/CNPJ + senha
  - Biometria (mobile)
  - Token device (fingerprint)
- **2FA** (opcional ou obrigatório):
  - TOTP (Google Authenticator, Authy)
  - SMS OTP
- **Recuperação de senha**:
  - Email com link mágico
  - Código OTP
  - Perguntas de segurança
- **Sessão segura**:
  - Timeout após inatividade (10 min)
  - Logout de todas as sessões
  - Notificação de login novo dispositivo

**Componentes**:
- LoginForm
- TwoFactorSetup (QR code)
- PasswordResetFlow
- SessionTimeout (modal de aviso)

---

#### 3. **Dashboard do Cliente** (Sprint 30)
**Para**: Clientes
**Funcionalidades**:
- **Visão geral**:
  - Saldo total (todas as contas)
  - Saldo por conta (corrente, poupança, investimento)
  - Últimas transações (5-10)
  - Próximos vencimentos (boletos)
  - Limite disponível (crédito, se houver)
- **Atalhos rápidos**:
  - Transferir (PIX, TED)
  - Pagar boleto
  - Recarga de celular
  - Cartão virtual
- **Notificações recentes**:
  - Transações realizadas
  - Depósitos recebidos
  - Boletos a vencer

**Componentes**:
- BalanceCard (valor + variação)
- QuickActionsGrid
- RecentTransactionsList
- NotificationBadge

---

#### 4. **Gestão de Contas** (Sprint 31)
**Para**: Clientes
**Funcionalidades**:
- **Lista de contas**:
  - Conta corrente, poupança, investimento
  - Saldo detalhado
  - Extrato (últimos 90 dias)
  - Download de extrato (PDF)
- **Detalhamento de conta**:
  - Número da conta
  - Agência
  - Tipo
  - Limite (se crédito)
  - Data de abertura
- **Ações**:
  - Configurar apelido (nome personalizado)
  - Solicitar encerramento
  - Solicitar upgrade (ex: conta premium)

**Componentes**:
- AccountCard (resumo)
- StatementTable (extrato)
- DownloadPDFButton

---

#### 5. **Transações & Pagamentos** (Sprint 31-32)
**Para**: Clientes
**Funcionalidades**:

##### **PIX**
- **Enviar PIX**:
  - Por chave (CPF, email, telefone, aleatória)
  - Por QR Code (ler via câmera)
  - Inserir valor + mensagem (opcional)
  - Confirmar com senha/biometria
  - Comprovante (download/compartilhar)
- **Receber PIX**:
  - Minhas chaves PIX
  - Cadastrar nova chave
  - Remover chave
  - Gerar QR Code (cobrar)
- **PIX Agendado**:
  - Agendar pagamentos futuros
  - Cancelar agendamentos

##### **TED/DOC**
- Transferir para outros bancos
- Salvar favorecidos
- Agendamento

##### **Boletos**
- Pagar por código de barras (scanner)
- Pagar por linha digitável
- Agendar pagamento
- Histórico de boletos pagos

##### **Recarga de Celular**
- Selecionar operadora
- Inserir número + valor
- Pagamento instantâneo

**Componentes**:
- PixKeyInput (com validação)
- QRCodeScanner (camera)
- BarcodeScanner
- FavoritesList
- TransactionConfirmation (modal)
- Receipt (comprovante)

---

#### 6. **Cartões** (Sprint 32-33)
**Para**: Clientes com cartão
**Funcionalidades**:
- **Lista de cartões**:
  - Cartão virtual
  - Cartão físico (se houver)
  - Status (ativo, bloqueado, cancelado)
- **Detalhamento**:
  - Últimos 4 dígitos
  - Validade
  - CVV (mostrar temporariamente)
  - Limite total e disponível
  - Fatura atual
- **Ações**:
  - Bloquear/Desbloquear temporariamente
  - Solicitar 2ª via
  - Cancelar cartão
  - Alterar limite (solicitar)
  - Ativar/Desativar compras online
  - Ativar/Desativar compras internacionais
  - Ativar/Desativar contactless
- **Faturas**:
  - Fatura atual (parcial)
  - Faturas anteriores
  - Download de fatura (PDF)
  - Pagar fatura (gerar boleto ou débito)

**Componentes**:
- CardDisplay (visual do cartão)
- CVVRevealer (click to show, 30s timeout)
- InvoiceTable
- CardControls (toggles)

---

#### 7. **Perfil & Dados Cadastrais** (Sprint 33)
**Para**: Clientes
**Funcionalidades**:
- **Dados pessoais**:
  - Nome, CPF, data nascimento (não editáveis)
  - Email (editável, com verificação)
  - Telefone (editável, com verificação)
  - Endereço (editável)
- **Documentos**:
  - RG, CNH, comprovante de residência
  - Upload de novos documentos
  - Status de verificação
- **Senha e Segurança**:
  - Alterar senha
  - Configurar 2FA
  - Gerenciar dispositivos confiáveis
  - Ver sessões ativas
- **Preferências**:
  - Notificações (email, push, SMS)
  - Idioma
  - Timezone

**Componentes**:
- ProfileForm (edit mode)
- DocumentUploader
- PasswordChangeForm
- TwoFactorSettings
- NotificationPreferences

---

#### 8. **Investimentos** (Sprint 34) - **Opcional**
**Para**: Clientes com conta investimento
**Funcionalidades**:
- **Dashboard de investimentos**:
  - Saldo total investido
  - Rentabilidade (diária, mensal, anual)
  - Composição da carteira (gráfico)
- **Produtos disponíveis**:
  - CDB, LCI, LCA
  - Tesouro Direto
  - Fundos de investimento
- **Investir**:
  - Escolher produto
  - Valor a investir
  - Confirmar
- **Resgatar**:
  - Total ou parcial
  - Prazo de liquidação
- **Histórico de investimentos**

**Componentes**:
- InvestmentPortfolio (gráfico)
- ProductCatalog
- InvestmentSimulator

---

#### 9. **Suporte & Atendimento** (Sprint 34)
**Para**: Clientes
**Funcionalidades**:
- **Chat ao vivo** (se disponível):
  - Conectar com atendente
  - Histórico de conversas
- **Abrir ticket**:
  - Escolher categoria (conta, cartão, transação, etc)
  - Descrever problema
  - Anexar prints
- **Meus tickets**:
  - Status (aberto, em atendimento, resolvido)
  - Adicionar comentário
  - Avaliar atendimento (após resolução)
- **FAQ**:
  - Artigos de ajuda
  - Busca
  - Artigos relacionados
- **Telefone/Email de contato**

**Componentes**:
- ChatWidget
- TicketForm
- TicketsList
- FAQSearch

---

#### 10. **Notificações & Alertas** (Sprint 35)
**Para**: Clientes
**Funcionalidades**:
- **Centro de notificações**:
  - Transações realizadas
  - Depósitos recebidos
  - Boletos a vencer
  - Fatura do cartão fechada
  - Atualizações de conta
- **Push Notifications** (mobile):
  - Transações em tempo real
  - Alertas de segurança
- **Configurar alertas**:
  - Transações acima de X reais
  - Compras internacionais
  - Login de novo dispositivo

**Componentes**:
- NotificationCenter
- PushNotificationSetup (service worker)
- AlertSettings

---

#### 11. **Mobile App** (Sprint 35-36)
**Para**: Clientes (iOS e Android)
**Funcionalidades**:
- Todas as funcionalidades do portal web
- **Adicional mobile**:
  - Biometria (FaceID, TouchID)
  - QR Code scanner nativo
  - Push notifications
  - Widgets (saldo, últimas transações)
- **Offline-first**:
  - Cache de saldo e transações recentes
  - Sync quando online

**Stack Mobile**:
- React Native (reuso de componentes Next.js)
- Expo (build e distribuição)
- React Navigation
- AsyncStorage (cache local)

---

### Stack Tecnológico - Fase 4

**Frontend Web**:
- Next.js 14 (SSR + SSG)
- TypeScript
- TailwindCSS + shadcn/ui
- React Query
- React Hook Form
- Zod (validação)
- Socket.io-client (chat real-time)
- PWA (Service Workers)

**Mobile**:
- React Native (Expo)
- Reanimated (animações)
- React Native Biometrics
- React Native Camera (QR Code, selfie)

**Backend**:
- Go (APIs já existentes)
- Novos endpoints para client operations
- WebSocket (chat, notificações)
- Background jobs (extrato PDF, notificações)

**Segurança**:
- JWT (sessão)
- HTTPS (obrigatório)
- Rate limiting (anti-brute force)
- Device fingerprinting
- Fraud detection hooks

---

### Sprints da Fase 4 (12 semanas = 6 sprints)

#### **Sprint 29** (Semanas 1-2): Onboarding + Login
- Jornada de cadastro (multi-step)
- KYC (upload de documentos, selfie)
- Login + 2FA
- Recuperação de senha

#### **Sprint 30** (Semanas 3-4): Dashboard + Gestão de Contas
- Dashboard do cliente (saldo, transações recentes)
- Lista de contas
- Extrato detalhado
- Download de extrato (PDF)

#### **Sprint 31** (Semanas 5-6): Transações PIX
- Enviar PIX (chave, QR Code)
- Receber PIX (gerenciar chaves)
- Comprovantes
- PIX Agendado

#### **Sprint 32** (Semanas 7-8): Transações TED/Boleto + Cartões
- TED/DOC
- Pagamento de boletos (scanner)
- Recarga de celular
- Cartões (virtual, físico)
- Bloquear/Desbloquear
- Faturas

#### **Sprint 33** (Semanas 9-10): Perfil + Investimentos + Suporte
- Dados cadastrais (edição)
- Upload de novos documentos
- Senha e segurança
- Investimentos (dashboard, investir, resgatar)
- Chat ao vivo
- Sistema de tickets

#### **Sprint 34** (Semanas 11-12): Notificações + Mobile App (iOS)
- Centro de notificações
- Push notifications
- Configurar alertas
- Mobile app (iOS) - versão beta

#### **Sprint 35** (Semanas 13-14): Mobile App (Android) + Polish
- Mobile app (Android)
- Biometria
- QR Code scanner nativo
- UX improvements

#### **Sprint 36** (Semanas 15-16): Testing & Launch
- User acceptance testing (UAT)
- Performance optimization
- Security audit
- App store submission (iOS + Android)
- Marketing materials
- Launch! 🚀

---

### Critérios de Sucesso - Fase 4

#### Funcional
- [ ] ✅ Onboarding completo (cadastro + KYC)
- [ ] ✅ Todas as operações PIX funcionando
- [ ] ✅ Pagamento de boletos
- [ ] ✅ Gestão de cartões
- [ ] ✅ Mobile app (iOS + Android) na loja
- [ ] ✅ Chat ao vivo funcionando
- [ ] ✅ 95% das operações self-service (sem suporte)

#### Técnico
- [ ] ✅ PWA com offline-first
- [ ] ✅ Responsive (mobile + tablet + desktop)
- [ ] ✅ Performance (LCP < 2.5s, FID < 100ms)
- [ ] ✅ Security audit aprovado
- [ ] ✅ Test coverage ≥70%
- [ ] ✅ Acessibilidade (WCAG 2.1 AA)

#### Negócio
- [ ] ✅ 100 clientes beta usando o portal
- [ ] ✅ NPS ≥ 50
- [ ] ✅ 90% das transações via portal (vs atendimento)
- [ ] ✅ App rating ≥ 4.5/5 nas lojas

---

## 🚀 FASE 5: PRODUCTION & SCALE (12 semanas)

### Objetivo
Integrar com sistemas BACEN reais, obter certificações necessárias e escalar para **1000 clientes beta** em produção.

### Entregas
- [ ] Integração BACEN SPI (PIX real)
- [ ] Integração TigerBeetle Ledger (contabilidade real)
- [ ] Integração Anti-Fraude (Data Rudder ou similar)
- [ ] Integração Bureau de Crédito (Serasa, Boa Vista)
- [ ] Certificações BACEN (testes de conformidade)
- [ ] Documentação regulatória completa
- [ ] Relatórios COAF automatizados
- [ ] Disaster Recovery Plan
- [ ] Scaling infrastructure (Kubernetes)
- [ ] Monitoring avançado (SLIs, SLOs)
- [ ] 1000 clientes beta operando

### Sprints
- Sprint 37-38: Integração BACEN SPI (PIX real)
- Sprint 39-40: Integração TigerBeetle + Anti-Fraude
- Sprint 41-42: Certificações BACEN
- Sprint 43-44: Scaling Infrastructure (K8s)
- Sprint 45-46: Beta Launch (100 clientes)
- Sprint 47-48: Scale to 1000 clientes

### Critérios de Sucesso
- [ ] ✅ PIX real funcionando (100% uptime)
- [ ] ✅ Certificação BACEN aprovada
- [ ] ✅ 1000 clientes ativos
- [ ] ✅ 10.000+ transações/dia
- [ ] ✅ Uptime ≥99.9%
- [ ] ✅ Latência P99 < 500ms
- [ ] ✅ Zero incidentes de segurança

---

## 📊 Resumo Timeline

| Fase | Duração | Semanas Totais | Status |
|------|---------|----------------|--------|
| **Fase 1: Foundation** | 12 semanas | 1-12 | ✅ Completa |
| **Fase 2: Brain** | 12 semanas | 13-24 | 📝 Especificada |
| **Fase 3: BackOffice Portal** | 10 semanas | 25-34 | 📝 Especificada |
| **Fase 4: Client Portal** | 12 semanas | 35-46 | 📝 Especificada |
| **Fase 5: Production & Scale** | 12 semanas | 47-58 | 📋 Planejada |
| **TOTAL** | **58 semanas** | **~14 meses** | |

---

## 🎯 Marcos Principais (Milestones)

| Milestone | Data Estimada | Status |
|-----------|---------------|--------|
| ✅ Fase 1 Complete | Semana 12 | ✅ Done |
| 🧠 Architect Agent Funcional | Semana 24 | 📅 Planejado |
| 🏢 BackOffice Portal Beta | Semana 34 | 📅 Planejado |
| 👤 Client Portal Beta | Semana 46 | 📅 Planejado |
| 🚀 Production Launch (1000 clientes) | Semana 58 | 📅 Planejado |

---

## 💰 Estimativa de Investimento (Squad)

### Fase 1 (12 semanas) - ✅ Completa
- 6 pessoas full-time
- **Custo**: ~R$ 360.000 (considerando R$ 5k/pessoa/semana)

### Fase 2 (12 semanas)
- 6 pessoas full-time + 3 part-time
- **Custo**: ~R$ 420.000

### Fase 3 (10 semanas)
- 8 pessoas full-time (2 frontend adicionais)
- **Custo**: ~R$ 400.000

### Fase 4 (12 semanas)
- 10 pessoas full-time (2 mobile devs adicionais)
- **Custo**: ~R$ 600.000

### Fase 5 (12 semanas)
- 6 pessoas full-time + DevOps intensivo
- **Custo**: ~R$ 420.000

### **TOTAL**: ~R$ 2.200.000 (14 meses)

---

## 🎓 Próximos Passos

1. ✅ **Fase 1 completa** - Base técnica pronta
2. 📝 **Aprovar roadmap de 5 fases**
3. 🚀 **Iniciar Fase 2** - Architect Agent
4. 📅 **Recrutar squad adicional** para Fase 3/4 (frontend/mobile devs)

---

**Status**: 📝 **ROADMAP COMPLETO DEFINIDO**

**Aprovação necessária**: Product + Tech Lead + CFO (investimento)

---

*Documento criado por: Tech Lead*
*Data: 2024-01-15*
*Versão: 1.0*

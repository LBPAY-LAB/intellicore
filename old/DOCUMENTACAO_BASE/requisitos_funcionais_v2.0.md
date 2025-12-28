# Requisitos Funcionais SuperCore v2.0
## Especificação Consolidada Completa

**Versão**: 2.0.0
**Data**: 2025-12-21
**Status**: Consolidado - Revisão Crítica Completa
**Documento Crítico**: Rastreabilidade de todos os requisitos da v1 até v2.0

> **Princípio Fundamental**: SuperCore é uma PLATAFORMA UNIVERSAL e AGNÓSTICA DE DOMÍNIO que GERA soluções empresariais completas para QUALQUER use case através de IA. Use cases específicos (Banking, CRM, ERP) surgem DENTRO de um Oráculo, não no SuperCore em si.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Requisitos Funcionais Core](#2-requisitos-funcionais-core)
3. [Casos de Uso](#3-casos-de-uso)
4. [Requisitos Não-Funcionais](#4-requisitos-não-funcionais)
5. [Capacidades Avançadas](#5-capacidades-avançadas)
6. [Restrições e Limitações](#6-restrições-e-limitações)
7. [Matriz de Rastreabilidade](#7-matriz-de-rastreabilidade)

---

## 1. Visão Geral

### 1.1 O Que é SuperCore v2.0?

**SuperCore é uma plataforma universal de geração de soluções empresariais através de IA.**

**NÃO É**: Um Core Banking, CRM, ERP ou qualquer solução específica de domínio.

**O QUE É**: Uma máquina universal que permite criar QUALQUER tipo de aplicação (Core Banking, CRM, ERP, Healthcare, Logística, etc.) através de:

- **Oráculos**: Repositórios multimodais de conhecimento configuráveis por domínio
- **Abstrações dinâmicas**: Object definitions genéricos interpretados em runtime
- **Linguagem natural**: Conversas com IA para especificação e geração
- **Geração automatizada 100%**: IA gera middlewares, agentes, fluxos, telas, MCPs sem código manual

### 1.2 Arquitetura Fundamental

```
SuperCore (Plataforma Universal)
    ↓
Oráculo A (Banking)  |  Oráculo B (CRM)  |  Oráculo C (Healthcare)
    ↓
Solução A (Core Banking)
Solução B (CRM System)
Solução C (Health Management)
```

**Cada Oráculo é uma instância independente com**:
- Conhecimento específico do domínio (documentações, regulações, políticas)
- Objeto definitions específicas (Conta, Cliente, Transação vs Lead, Contact, Deal vs Patient, Treatment)
- Agentes especializados gerados por IA
- Fluxos customizados
- UI dinâmica generada

### 1.3 Propósito e Objetivos

**Objetivos Primários**:
1. Permitir criação de soluções empresariais **SEM código manual**
2. Garantir compliance automático com regulações do domínio
3. Acelerar desenvolvimento de **N vezes** (exponencial)
4. Suportar **múltiplos domínios** com mesma plataforma
5. Criar **sistemas vivos** que evoluem automaticamente conforme regulações/políticas mudam

**Objetivos de Negócio**:
- Equipes de Produto criam soluções em **DIAS** (não meses)
- Zero desenvolvedores necessários (após SuperCore implementado)
- Product/Compliance Officers adicionam/modificam soluções em **MINUTOS** via UI
- Mesma plataforma base serve Banking, CRM, ERP, Healthcare, Logística
- Evolução contínua sem breaking changes

### 1.4 Problemas Que SuperCore Resolve

| Problema | Solução SuperCore |
|----------|-------------------|
| **Lógica de negócio espalhada em código** | Lógica em `object_definitions` + `validation_rules` interpretadas em runtime |
| **Cada mudança exige redeployment** | Mudanças em configuration, sem recompile |
| **Compliance é manual e propenso a erros** | Oráculo garante conformidade automática |
| **Desenvolvimento é linear** | Composição de objetos cria crescimento exponencial |
| **Múltiplas stacks para múltiplos domínios** | Stack unificado, zero migrações entre dominios |
| **UI hardcoded para cada domínio** | Geração automática 100% dinâmica via object_definitions |
| **Integrações são pontos de falha** | MCP como interface universal, desacoplamento total |
| **Código manual é propenso a bugs** | 100% gerado por IA, testado, production-grade |

### 1.5 Produto Final: "Play" em um Oráculo

**O que significa "Play"**:
Quando um usuário clica "Play" em um Oráculo, ele obtém:

1. **Middleware gerado** (FastAPI/Gin)
   - Todas as APIs REST para gerenciar objetos
   - Validações automáticas
   - Integração com externa
   - Autenticação e autorização
   - Logging e observability

2. **Agentes executáveis** (CrewAI)
   - Múltiplos agentes especializados
   - Orquestração automática
   - Resolução de problemas complexos
   - Feedback loops

3. **Fluxos/Workflows** (LangGraph/LangFlow)
   - Processos de negócio visualizados
   - Execução automática ou manual
   - Integração com todos os agentes

4. **Frontend completo** (Next.js + shadcn/ui)
   - Formulários auto-gerados
   - Listagens com filtros
   - Dashboards
   - Workflow visualization
   - Multi-idioma (i18n nativo)

5. **Integrações** (via MCP)
   - BACEN, Receita Federal, APIs de 3º (para Banking)
   - Salesforce, HubSpot (para CRM)
   - Hospital systems (para Healthcare)
   - Etc (agnóstico)

6. **Data layer** (PostgreSQL + NebulaGraph + pgvector)
   - Schema auto-migrado
   - Relacionamentos semânticos
   - RAG 3D nativo

---

## 2. Requisitos Funcionais Core

### 2.1 Super Portal de Backoffice - Gerenciamento de Oráculos

**Descrição**: SuperCore UI é um super portal onde equipes gerenciam Oráculos e geram soluções completas.

#### RF001: Gerenciamento de Oráculos
**Descrição**: Criar, editar, deletar, listar, clonar Oráculos com tipagem (Frontend vs Backend)

**Tipos de Oráculos**:

1. **Oráculo Backend** (`type: "backend"`):
   - Gera APIs REST/GraphQL para gerenciar objetos
   - Gera middlewares (FastAPI/Gin) automaticamente
   - Expõe **MCP Server nativo** com tools baseados em `object_definitions`
   - Executa agentes CrewAI e workflows LangGraph
   - Serve como **building block** para outros Oráculos (frontend ou backend)
   - Exemplos: "CoreBanking-API", "KYC-Service", "Compliance-Engine"

2. **Oráculo Frontend** (`type: "frontend"`):
   - Gera portal/UI completo (Next.js + shadcn/ui)
   - Gera **BFF (Backend-for-Frontend)** que agrega múltiplos back-ends via MCP
   - Inclui objetos específicos de frontend:
     - **IAM Objects**: Configuração de autenticação/autorização (Keycloak + Cerbos)
     - **Menu Objects**: Navegação lateral, breadcrumbs, top nav
     - **Layout Objects**: Frames pré-definidos (dashboard, sidebar-left, top-nav)
     - **Theme Objects**: Configuração de temas (cores, tipografia, dark mode)
   - Conecta-se a Oráculos Backend via MCP
   - Exemplos: "Portal-Banking", "CRM-Dashboard", "Healthcare-Portal"

**Funcionalidades**:
- Listar todos os Oráculos com status e tipo (backend/frontend)
- Criar novo Oráculo (nome, descrição, domínio, **tipo**)
- Editar configuração (identidade, licenças, políticas)
- Configurar **conectividade entre Oráculos** via MCP (grafo de dependências)
- Deletar Oráculo (com confirmação e backup)
- Clonar Oráculo (como template)
- Buscar Oráculos por nome/domínio/tipo
- Visualizar estatísticas (objetos, agentes, instâncias)
- **Visualizar grafo de conectividade** (quais Oráculos se conectam a quais)

**Critérios de Aceitação**:
- UI intuitiva com Oráculo como conceito central
- Configuração persistida em `oracle_config` table com coluna `type`
- Isolamento multi-tenant via `oracle_id`
- Auditoria completa (quem criou, quando, mudanças)
- Performance: listar 1000 Oráculos em <500ms
- **Grafo de Oráculos** renderizado em React Flow (UI)
- **MCP Server gerado automaticamente** para Oráculos Backend baseado em `object_definitions`
- **BFF gerado automaticamente** para Oráculos Frontend com agregação de múltiplos back-ends

**Exemplo de Grafo**:
```
Portal Banking (Frontend)
   ↓ MCP
   ├→ CoreBanking API (Backend)
   ├→ KYC Service (Backend)
   │    ↓ MCP
   │    └→ Serasa API (Backend - Externa)
   └→ Compliance Engine (Backend)
```

**Status v1**: Não existe
**Status v2.0**: Novo - Crítico

#### RF002: Ingestão Multimodal de Conhecimento
**Descrição**: Sistema aceita múltiplos formatos de documentos para alimentar cada Oráculo

- PDFs de regulações (BACEN, legislação, políticas)
- Documentos Word/Google Docs (documentação, políticas internas)
- Planilhas (dados estruturados, tabelas)
- Imagens (diagramas, screenshots)
- Vídeos/Áudio (transcrições automáticas via Whisper)
- Diagramas (Mermaid, JSON schemas, flow diagrams)
- HTML/Web scraping (sites públicos, documentação)
- URLs (ingestão de conteúdo remoto)

**Critérios de Aceitação**:
- Suportar 30+ formatos de arquivo
- OCR automático para PDFs com imagens
- Transcrição de áudio com Whisper (múltiplos idiomas)
- Web scraping com Playwright (JavaScript-heavy sites)
- Detecção automática de tipo MIME
- Processamento em background (não bloqueia UI)
- Notificação quando completo

**Status v1**: Parcialmente implementado (PDFs básicos)
**Status v2.0**: Completo com MultiModalFileProcessor + 30+ formatos

#### RF003: Processamento e Enriquecimento de Documentos
**Descrição**: Documentos ingeridos passam por pipeline de processamento por Oráculo

- Extração de texto e imagens
- Chunking semântico (divisão lógica, não por caracteres)
- Embedding em vetores numéricos (pgvector)
- Extração de entidades e relações (NLP)
- Limpeza e normalização

**Critérios de Aceitação**:
- Pipeline sem perda de informação
- Embeddings com modelos multilíngues
- Extração de entidades com NLP (spaCy, etc)
- Identificação de relações entre conceitos
- Rastreabilidade de fonte para cada chunk

**Status v1**: Implementado
**Status v2.0**: Aprimorado com semantic chunking e multi-idioma

#### RF004: Knowledge Graph do Oráculo
**Descrição**: Conhecimento processado armazenado em grafo semântico por Oráculo

- Nós: entidades (Conta, Cliente, Transação, Resolução BACEN, Lead, Contact, Deal, Patient, etc)
- Arestas: relações dinâmicas (Cliente -possui-> Conta, Contact -pertence_a-> Deal, etc)
- Propriedades: metadados (fonte, data, versão)

**Critérios de Aceitação**:
- NebulaGraph com 3+ relações por nó em média
- Consultas NGSQL respondidas em <100ms
- Rastreabilidade completa de fonte
- Isolamento por `oracle_id`

**Status v1**: Implementado com NebulaGraph
**Status v2.0**: Mesmo (multi-tenant)

#### RF005: Consulta ao Conhecimento via RAG Trimodal
**Descrição**: LLM consulta Oráculo usando 3 modalidades de busca

- **SQL**: Queries estruturadas em PostgreSQL
- **Graph**: Navegação de relacionamentos em NebulaGraph
- **Vector**: Busca semântica em pgvector

**Critérios de Aceitação**:
- Resposta combina todas as 3 modalidades
- LLM sintetiza resposta com contexto completo
- Rastreabilidade de fonte para cada resposta
- Multi-idioma suportado

**Status v1**: Implementado
**Status v2.0**: Otimizado com RAG Trimodal Híbrido

#### RF006: Identidade e Configuração do Oráculo
**Descrição**: Oráculo conhece identidade completa e configuração do domínio

**Configuração**:
- CNPJ/CPF da Instituição (se aplicável)
- Nome, descrição, domínio (Banking, CRM, Healthcare, etc)
- Licenças/registrações (ex: "IP licenciada pelo BACEN")
- Integrações autorizadas (quais APIs externas pode usar)
- Políticas internas (PLD, AML, segurança, auditoria)
- Idiomas suportados (português, inglês, espanhol, etc)

**Critérios de Aceitação**:
- Configuração editável via UI
- Usado por Architect Agent para gerar soluções alinhadas
- Versionamento de mudanças
- Impacto analysis (quais soluções serão impactadas)

**Status v1**: Implementado como `oracle_config`
**Status v2.0**: Expandido para suportar multi-idioma e políticas

### 2.2 Biblioteca de Objetos - Blocos de Construção

**Descrição**: Conjunto de componentes reutilizáveis gerados automaticamente pela IA para cada Oráculo

#### RF010: Gerenciamento de Object Definitions
**Descrição**: Visualizar, editar, versionar, deletar object_definitions dentro de um Oráculo

**Funcionalidades**:
- Listar todas as object_definitions do Oráculo
- Visualizar definição (fields, validações, FSM, relacionamentos)
- Editar object_definition (adicionar campos, validações)
- Versionar mudanças (manter histórico)
- Deletar object_definition (com análise de impacto)
- Buscar object_definitions
- Testar object_definition (validar sample data)

**Critérios de Aceitação**:
- JSON Schema válido gerado
- DDL SQL automático para PostgreSQL
- Pydantic models para Python
- TypeScript interfaces para frontend
- Impacto analysis (quais workflows usam este objeto)

**Status v1**: Implementado
**Status v2.0**: Interface melhorada com versioning

#### RF011: Geração Automática de Object Definitions via IA
**Descrição**: IA gera object_definitions automaticamente a partir do conhecimento no Oráculo

**Fluxo**:
1. Usuário descreve entidade: "Preciso de um objeto para representar uma Conta Bancária"
2. IA consulta Oráculo (RAG) para saber requisitos regulatórios
3. IA gera object_definition automático com:
   - Fields (nome, tipo, required, validações)
   - Labels (labels de UI multilíngue)
   - Field lists (enums dinâmicos)
   - Special types (CPF, CNPJ, email, celular, data/hora)
   - FSM (estados possíveis)
   - Relacionamentos com outros objetos

**Critérios de Aceitação**:
- Zero código manual necessário
- Geração leva <30 segundos
- Usuário pode revisar e refinar via chat
- Versionamento automático

**Status v1**: Não existe
**Status v2.0**: Novo - Crítico para "Play"

#### RF012: Criação Dinâmica de Instâncias
**Descrição**: Usuários criam instâncias de objetos sem código via formulários auto-gerados

**Funcionalidades**:
- Formulários gerados 100% automaticamente
- Validação client-side sincronizada com server-side
- Suporte a relacionamentos (foreign keys com autocomplete)
- Histórico de mudanças automático (audit trail)
- Criar, ler, atualizar, deletar instâncias

**Critérios de Aceitação**:
- UI responsiva (mobile/tablet/desktop)
- Suporte a imagens, anexos
- Validações moram em `validation_rules` table
- Rastreabilidade: quem criou/modificou, quando

**Status v1**: Implementado
**Status v2.0**: Mesmo

#### RF013: Biblioteca Central de Validações
**Descrição**: Validações armazenadas centralmente e interpretadas em runtime (sem recompile)

**Tipos de Validação**:
- Estruturais (tipo, tamanho, formato)
- Negócio (CPF válido, saldo suficiente, horário comercial)
- Regulatórias (campos obrigatórios por lei, limites)
- Customizadas (código OPA Rego, Python)

**Critérios de Aceitação**:
- `validation_rules` table armazena todas as validações
- Engine interpreta regras em runtime (sem recompile)
- Suporte a OPA (Open Policy Agent) para regras complexas
- Rastreabilidade: qual validação falhou, por quê, baseline legal

**Status v1**: Parcialmente implementado
**Status v2.0**: Completo com OPA e rastreabilidade

#### RF014: Máquina de Estados (FSM) por Objeto
**Descrição**: Cada object_definition tem ciclo de vida (estados + transições)

**Exemplo**:
- Account: `PENDING` → `ACTIVE` → `SUSPENDED` → `CLOSED`
- Transições com validações (não pode ir de PENDING direto para CLOSED)

**Critérios de Aceitação**:
- Definição de FSM em `object_definition`
- Validações ao transicionar estados
- Histórico completo de mudanças (audit trail)
- Visualização em UI
- Webhooks ao mudar estado

**Status v1**: Implementado
**Status v2.0**: Mesmo

#### RF015: Relacionamentos Semânticos Entre Objetos
**Descrição**: Objetos se relacionam entre si, criando grafo de entidades

**Exemplos**:
- Customer -possui-> Account
- Account -está_sujeita_a-> RegulacaoBACEN
- Pagamento -refere_se_a-> Transacao

**Critérios de Aceitação**:
- Grafos renderizáveis em React Flow (UI)
- Consultas semânticas eficientes
- Cascata de exclusões (garbage collection)
- Validação de integridade referencial

**Status v1**: Implementado
**Status v2.0**: Otimizado para 500+ nós

#### RF016: Integrações Externas Configuráveis
**Descrição**: Conectores encapsulados para sistemas externos, agnósticos ao domínio

**Padrão**:
- Oráculo Banking: BACEN SPI, Receita Federal, CIP, TigerBeetle
- Oráculo CRM: Salesforce, HubSpot, RD Station
- Oráculo Healthcare: Hospital systems, SADT providers
- Etc (qualquer API REST com auth)

**Critérios de Aceitação**:
- Configuração via `integracao_externa` object_definition
- Retry logic automático com exponential backoff
- Rate limiting respeitado
- Logging e rastreabilidade
- Teste de conexão via UI

**Status v1**: Parcialmente implementado (APIs básicas)
**Status v2.0**: Completo com suporte a webhooks

#### RF017: Componentes de UI Reutilizáveis
**Descrição**: Peças de interface reutilizáveis geradas automaticamente

**Tipos**:
- Forms (create, edit, detail)
- Listas (com paginação, filtros, busca)
- Wizards (multi-step forms)
- Approval flows (visualização de permissões)
- Dashboards (KPIs, gráficos)
- Workflow visualizers (React Flow)

**Critérios de Aceitação**:
- 100% auto-gerados em Next.js + shadcn/ui
- Sincronização automática com object_definition
- Dark mode nativo
- Acessibilidade (WCAG 2.1 AA)
- Responsivo em mobile/tablet/desktop

**Status v1**: Parcialmente implementado (forms básicos)
**Status v2.0**: Completo com Forms, Listas, Wizards

#### RF018: Workflows/Processos de Negócio por Oráculo
**Descrição**: Orquestração de passos para completar tarefas no domínio

**Exemplos**:
- Banking: OnboardingWorkflow (receber dados → validar → criar conta)
- CRM: LeadConversionWorkflow (lead → contato → oportunidade → deal)
- Healthcare: PatientAdmissionWorkflow (registro → triagem → admissão)

**Critérios de Aceitação**:
- Definição em JSON (para LangFlow)
- Visualização em diagrama (React Flow)
- Estados transientes durante workflow
- Integração com múltiplos objetos
- Retry automático em falhas
- Webhook notifications
- Humano-in-the-loop para aprovações

**Status v1**: Implementado
**Status v2.0**: Expandido com LangFlow visual

#### RF019: Geração Automática de Workflows LangFlow pela IA
**Descrição**: IA gera workflows visuais automaticamente e exporta para LangFlow, permitindo que usuário apenas faça ajustes ou use como base de trabalho

**Fluxo**:
1. Usuário descreve processo de negócio:
   - Exemplo: "Preciso de um workflow para aprovação de despesas: funcionário envia → gestor aprova → financeiro processa → paga"
2. IA consulta Oráculo (RAG) para saber:
   - Objetos relevantes (Despesa, Funcionario, Gestor, Pagamento)
   - Agentes disponíveis (ValidationAgent, ApprovalAgent, PaymentAgent)
   - Regras de negócio (limites de aprovação, validações)
3. IA gera workflow LangFlow:
   - **Nós** (nodes): Start, Validation, Approval, Payment, Notification, End
   - **Conexões** (edges): Fluxo condicional (se aprovado → pagar, se rejeitado → notificar)
   - **Variáveis**: Dados passados entre nós
   - **Integrações**: Chamadas a APIs externas, agentes, objetos
4. IA exporta para formato LangFlow JSON
5. Usuário abre no **LangFlow UI visual**:
   - Vê diagrama completo gerado automaticamente
   - Faz ajustes visuais (arrasta nós, muda conexões, adiciona condicionais)
   - Testa workflow com dados sample
   - Salva versão ajustada
6. Workflow LangFlow vira executável (LangGraph state machine)

**Funcionalidades**:
- **Geração 100% automática**: Usuário descreve em texto, IA gera workflow completo
- **Export para LangFlow**: JSON compatível com LangFlow UI
- **Edição visual no LangFlow**: Usuário ajusta drag-and-drop
- **Versionamento**: Cada mudança salva uma versão
- **Teste no LangFlow**: Simular execução com dados mock
- **Deploy**: Workflow vira LangGraph executável

**Critérios de Aceitação**:
- Geração leva <60 segundos
- Workflow gerado é **executável sem edição** (mas editável se usuário quiser)
- LangFlow UI integrado no Super Portal (iframe ou nova aba)
- Suporte a **fluxos condicionais** (if/else, loops, parallel)
- Suporte a **human-in-the-loop** (aprovações manuais)
- Suporte a **timeout e retry** automático
- Export/Import de workflows entre Oráculos

**Benefícios**:
- ✅ **Zero código**: Usuário não escreve Python/TypeScript para workflows
- ✅ **Visual**: LangFlow UI drag-and-drop para ajustes
- ✅ **Rápido**: Geração automática em <60s
- ✅ **Flexível**: Usuário pode ajustar ou usar como está
- ✅ **Reutilizável**: Workflows são templates (podem ser clonados)

**Exemplo de Workflow Gerado**:
```json
{
  "id": "approval-workflow-001",
  "name": "Aprovação de Despesas",
  "nodes": [
    {"id": "start", "type": "start", "label": "Início"},
    {"id": "validate", "type": "agent", "agent_id": "validation-agent", "label": "Validar Despesa"},
    {"id": "approve", "type": "human", "role": "gestor", "label": "Aprovação do Gestor"},
    {"id": "pay", "type": "agent", "agent_id": "payment-agent", "label": "Processar Pagamento"},
    {"id": "notify", "type": "notification", "channel": "email", "label": "Notificar Funcionário"},
    {"id": "end", "type": "end", "label": "Fim"}
  ],
  "edges": [
    {"from": "start", "to": "validate"},
    {"from": "validate", "to": "approve", "condition": "valid == true"},
    {"from": "validate", "to": "notify", "condition": "valid == false"},
    {"from": "approve", "to": "pay", "condition": "approved == true"},
    {"from": "approve", "to": "notify", "condition": "approved == false"},
    {"from": "pay", "to": "notify"},
    {"from": "notify", "to": "end"}
  ],
  "variables": {
    "expense_id": "string",
    "amount": "number",
    "valid": "boolean",
    "approved": "boolean"
  }
}
```

**Status v1**: Não implementado
**Status v2.0**: **NOVO - Crítico para geração visual de workflows**

---

### 2.3 Biblioteca de Agentes - Força de Trabalho Autônoma

**Descrição**: Entidades de IA autônomas que executam processos usando objetos e fluxos

#### RF020: Gerenciamento de Agentes por Oráculo
**Descrição**: Visualizar, editar, criar, deletar agentes dentro de um Oráculo

**Funcionalidades**:
- Listar agentes do Oráculo
- Visualizar role, responsabilidades, ferramentas
- Editar prompt system
- Deletar agente
- Testar agente com sample input
- Ver histórico de execuções

**Critérios de Aceitação**:
- Cada agente é único por Oráculo (Banking tem seus agentes, CRM tem outros)
- Agentes executáveis via CrewAI
- Interface intuitiva para definir role/responsabilidades
- Logs detalhados de execução

**Status v1**: Não implementado
**Status v2.0**: Novo - Crítico

#### RF021: Geração Automática de Agentes via IA
**Descrição**: IA gera agentes especializados automaticamente a partir do conhecimento no Oráculo

**Fluxo**:
1. Usuário descreve: "Preciso de um agente para validar conformidade de transações"
2. IA consulta Oráculo (RAG) para saber regras de compliance
3. IA gera agente com:
   - Prompt system (role + responsabilidades)
   - Tools (lista de object_definitions e workflows que pode usar)
   - Context (conhecimento relevante do Oráculo)
   - Integrations (quais APIs externas pode chamar)

**Critérios de Aceitação**:
- Zero código manual necessário
- Geração leva <30 segundos
- Agente pronto para usar (chamável via API ou UI)
- Versionamento automático

**Status v1**: Não implementado
**Status v2.0**: Novo - Crítico para "Play"

#### RF022: Orquestração de Agentes (CrewAI)
**Descrição**: Múltiplos agentes colaboram em um time para resolver problemas complexos

**Padrão**:
- Agentes tem papéis diferentes
- Se comunicam automaticamente
- Compartilham contexto
- Resolvem problemas em paralelo/sequência (conforme necessário)

**Critérios de Aceitação**:
- Agentes executam em paralelo quando possível
- Dependências entre agentes respeitadas
- Fallback automático em falhas
- LangGraph para state management
- Pulsar para comunicação assíncrona

**Status v1**: Não implementado
**Status v2.0**: Novo requisito - CrewAI + LangGraph

#### RF023: Execução de Agentes
**Descrição**: Agentes são executáveis via múltiplos canais

**Canais**:
- API REST: `POST /api/v1/agents/{agent_id}/execute`
- MCP: Ferramenta para Claude Desktop/Claude.ai
- Workflow: Nó em um workflow LangFlow
- Schedule: Execução automática (cron)
- Webhook: Trigger por evento externo
- UI: Botão na interface

**Critérios de Aceitação**:
- Autenticação e autorização
- Rate limiting
- Async execution com status tracking
- Timeout handling
- Logs completos

**Status v1**: Não implementado
**Status v2.0**: Novo requisito

### 2.4 MCPs - Interface Universal

**Descrição**: Message Context Protocols como interface universal de comunicação com SuperCore

#### RF030: MCP Server do SuperCore
**Descrição**: Servidor MCP exposing recursos e ferramentas

**Protocolos**:
- stdio (para Claude Desktop)
- HTTP SSE (para Claude.ai, browsers)
- Websocket (para tempo real)

**Critérios de Aceitação**:
- Integração com Claude Desktop
- Integração com Claude.ai
- Integração com agents customizados
- Autenticação segura (API key ou OAuth)

**Status v1**: Parcialmente especificado
**Status v2.0**: Implementação completa

#### RF031: Recursos MCP - Dados Estruturados
**Descrição**: Recursos expondo dados estruturados do Oráculo

**Exemplos**:
- `oracle://config` - Configuração completa
- `instances://{object_type}` - Instâncias de um tipo
- `object-definitions://all` - Todas as definições
- `rules://{type}` - Regras (validação, compliance, negócio)
- `workflows://all` - Todos os workflows
- `agents://all` - Todos os agentes
- `integrations://all` - Todas as integrações externas

**Critérios de Aceitação**:
- Atualização em tempo real
- Paginação para large datasets
- Filtros eficientes
- Permissões respeitadas

**Status v1**: Especificado em RFC
**Status v2.0**: Implementação completa

#### RF032: Ferramentas MCP - Operações Executáveis
**Descrição**: Operações que podem ser invocadas via MCP

**Exemplos**:
- `create_oracle()` - Criar novo Oráculo
- `upload_context()` - Upload de documentos
- `generate_object_definition()` - Gerar objeto via IA
- `generate_agent()` - Gerar agente via IA
- `generate_workflow()` - Gerar workflow via IA
- `execute_workflow()` - Executar workflow
- `execute_agent()` - Executar agente
- `rag_query()` - Consultar Oráculo
- `test_validation_rule()` - Testar validação

**Critérios de Aceitação**:
- Autenticação e autorização
- Rate limiting
- Async execution com status tracking
- Error handling robusto
- Logs completos

**Status v1**: Especificado
**Status v2.0**: Implementação completa

#### RF033: Prompts MCP Reutilizáveis
**Descrição**: Prompts que podem ser invocados por múltiplos clientes

**Exemplos**:
- `architect` - Analisar requisitos e gerar especificação
- `compliance-check` - Validar conformidade de solução
- `object-designer` - Desenhar/revisar object_definition
- `schema-generator` - Gerar schemas a partir de spec
- `workflow-designer` - Desenhar workflow visual

**Critérios de Aceitação**:
- Versionamento de prompts
- Template variables suportadas
- Histórico de invocações
- Prompt engineering best practices

**Status v1**: Não implementado
**Status v2.0**: Novo requisito

#### RF034: Comunicação Assíncrona via MCP e Pulsar
**Descrição**: Publicação de mensagens em tópicos via Pulsar

**Padrão**:
- Portal envia `mcp.agent.execution.request` com dados
- SuperCore processa
- Publica `mcp.agent.execution.status` com progresso
- UI atualiza em tempo real via SSE

**Critérios de Aceitação**:
- Apache Pulsar como broker
- Pub/Sub pattern nativo
- Dead letter queue para falhas
- Message persistence
- Consumer groups para paralelismo

**Status v1**: Não implementado
**Status v2.0**: Novo requisito - Pulsar integration

---

#### Expansão: MCPs para Conectividade Entre Oráculos

**Descrição**: Além da integração externa (Claude Desktop, APIs 3rd-party), MCPs agora servem como **interface universal de conectividade entre Oráculos**.

**Arquitetura de Conexão**:

```
Oráculo Frontend (Portal Banking)
   ↓ MCP Client
   ├→ MCP Server (CoreBanking API)
   │    └→ Tools: create_account(), process_transaction(), get_balance()
   ├→ MCP Server (KYC Service)
   │    ├→ Tools: verify_cpf(), check_sanctions(), score_risk()
   │    └→ Conecta-se via MCP para:
   │         └→ MCP Server (Serasa API - Externa)
   └→ MCP Server (Compliance Engine)
        └→ Tools: validate_aml(), check_pld(), report_suspicious()
```

**RF030 - Expansão: Cada Oráculo Backend Expõe MCP Server**

**Funcionalidades Adicionais**:

1. **Auto-geração de MCP Tools a partir de `object_definitions`**:
   - Para cada `object_definition` no Oráculo:
     - Gera tool `create_{object_type}()`
     - Gera tool `update_{object_type}(id, data)`
     - Gera tool `delete_{object_type}(id)`
     - Gera tool `get_{object_type}(id)`
     - Gera tool `list_{object_type}(filters, pagination)`

   **Exemplo**: Se Oráculo "CoreBanking" tem `object_definition` "Conta":
   ```json
   {
     "tools": [
       {
         "name": "create_conta",
         "description": "Cria nova conta bancária",
         "inputSchema": {
           "type": "object",
           "properties": {
             "titular_cpf": {"type": "string"},
             "tipo_conta": {"type": "string", "enum": ["CORRENTE", "POUPANCA"]},
             "saldo_inicial": {"type": "number"}
           },
           "required": ["titular_cpf", "tipo_conta"]
         }
       },
       {
         "name": "get_conta",
         "description": "Busca conta por ID",
         "inputSchema": {
           "type": "object",
           "properties": {
             "conta_id": {"type": "string"}
           },
           "required": ["conta_id"]
         }
       }
     ]
   }
   ```

2. **Registro de Conectividade no Oráculo**:
   - Campo `connected_oracles` em `oracle_config`:
   ```json
   {
     "oracle_id": "portal-banking",
     "type": "frontend",
     "connected_oracles": [
       {
         "oracle_id": "corebanking-api",
         "mcp_endpoint": "http://corebanking-api:3000/mcp",
         "auth": {
           "type": "api_key",
           "key_vault_ref": "vault://keys/corebanking"
         },
         "tools_used": ["create_conta", "get_conta", "process_transacao"]
       },
       {
         "oracle_id": "kyc-service",
         "mcp_endpoint": "http://kyc-service:3001/mcp",
         "auth": {
           "type": "oauth2",
           "client_id": "portal-banking",
           "token_endpoint": "http://kyc-service:3001/oauth/token"
         },
         "tools_used": ["verify_cpf", "check_sanctions"]
       }
     ]
   }
   ```

3. **BFF Auto-gerado para Oráculos Frontend**:
   - Oráculos Frontend (`type: "frontend"`) recebem um **BFF (Backend-for-Frontend)** gerado automaticamente
   - O BFF agrega chamadas para múltiplos MCP Servers backend
   - Implementa padrões de resiliência (circuit breaker, retry, timeout)
   - Cache de respostas quando apropriado

   **Exemplo de BFF gerado**:
   ```typescript
   // auto-generated BFF for portal-banking
   import { MCPClient } from '@supercore/mcp-client'

   class PortalBankingBFF {
     private coreBanking: MCPClient
     private kycService: MCPClient
     private compliance: MCPClient

     async createAccountWithKYC(data: CreateAccountRequest) {
       // Step 1: Verify CPF via KYC Service
       const kycResult = await this.kycService.callTool('verify_cpf', {
         cpf: data.titular_cpf
       })

       if (!kycResult.approved) {
         throw new Error('KYC verification failed')
       }

       // Step 2: Check compliance
       await this.compliance.callTool('validate_aml', {
         cpf: data.titular_cpf,
         transaction_type: 'ACCOUNT_OPENING'
       })

       // Step 3: Create account in CoreBanking
       const account = await this.coreBanking.callTool('create_conta', {
         titular_cpf: data.titular_cpf,
         tipo_conta: data.tipo_conta,
         saldo_inicial: data.saldo_inicial
       })

       return account
     }
   }
   ```

**RF031 - Expansão: Recursos Incluem Graph de Oráculos**

**Novos Recursos**:
- `oracle-graph://all` - Grafo completo de conectividade entre Oráculos
- `oracle-graph://{oracle_id}` - Dependências de um Oráculo específico
- `oracle-graph://dependencies/{oracle_id}` - Oráculos que dependem deste

**Exemplo de Resposta**:
```json
{
  "resource": "oracle-graph://all",
  "data": {
    "nodes": [
      {"id": "portal-banking", "type": "frontend", "status": "healthy"},
      {"id": "corebanking-api", "type": "backend", "status": "healthy"},
      {"id": "kyc-service", "type": "backend", "status": "healthy"},
      {"id": "compliance-engine", "type": "backend", "status": "degraded"}
    ],
    "edges": [
      {"from": "portal-banking", "to": "corebanking-api", "tools_count": 5},
      {"from": "portal-banking", "to": "kyc-service", "tools_count": 3},
      {"from": "portal-banking", "to": "compliance-engine", "tools_count": 2},
      {"from": "kyc-service", "to": "serasa-api-externa", "tools_count": 1}
    ]
  }
}
```

**RF032 - Expansão: Ferramentas de Conectividade**

**Novas Ferramentas**:
- `connect_oracle(target_oracle_id, mcp_endpoint, auth_config)` - Conecta dois Oráculos
- `disconnect_oracle(target_oracle_id)` - Desconecta Oráculos
- `test_oracle_connection(target_oracle_id)` - Testa conectividade e auth
- `list_available_tools(target_oracle_id)` - Lista tools do Oráculo remoto
- `proxy_mcp_call(target_oracle_id, tool_name, args)` - Proxy de chamada MCP

**Exemplo de Uso**:
```javascript
// No Portal SuperCore, conectar Portal Banking ao CoreBanking API
await supercore.callTool('connect_oracle', {
  source_oracle_id: 'portal-banking',
  target_oracle_id: 'corebanking-api',
  mcp_endpoint: 'http://corebanking-api:3000/mcp',
  auth: {
    type: 'api_key',
    key: 'vault://keys/corebanking'
  }
})

// Testar conexão
const test = await supercore.callTool('test_oracle_connection', {
  source_oracle_id: 'portal-banking',
  target_oracle_id: 'corebanking-api'
})

// Listar tools disponíveis no CoreBanking
const tools = await supercore.callTool('list_available_tools', {
  oracle_id: 'corebanking-api'
})
// Retorna: ["create_conta", "get_conta", "process_transacao", ...]
```

**Critérios de Aceitação - Expansão**:
- ✅ Cada Oráculo Backend expõe MCP Server automaticamente na porta `{base_port} + 1000`
- ✅ MCP tools gerados automaticamente a partir de `object_definitions`
- ✅ Oráculos Frontend recebem BFF auto-gerado que agrega backends via MCP
- ✅ Conectividade configurável via Portal SuperCore (UI + API)
- ✅ Grafo de Oráculos visualizável no Portal (usando React Flow ou similar)
- ✅ Health checks propagados pelo grafo (se KYC down, Portal Banking exibe warning)
- ✅ Autenticação entre Oráculos (API key, OAuth2, mTLS)
- ✅ Resiliência: circuit breaker, retry com exponential backoff, timeout configurável
- ✅ Observabilidade: distributed tracing (OpenTelemetry) entre Oráculos

**Benefícios**:
1. **Reutilização**: Oráculo KYC pode ser usado por Portal Banking, Portal CRM, Portal Healthcare
2. **Composição**: Oráculos frontend complexos agregam múltiplos backends sem código manual
3. **Desacoplamento**: Mudanças no backend não quebram frontend (interface MCP estável)
4. **Escalabilidade**: Cada Oráculo escala independentemente
5. **Multi-tenancy**: Mesmo Oráculo backend serve múltiplos frontends (tenants diferentes)

---

### 2.5 AI-Driven Context Generator - Fluxo de 6 Fases

**Descrição**: Fluxo de 6 fases que transforma conhecimento em solução funcionando completamente

#### RF040: Fase 0 - Setup do Oráculo
**Descrição**: Configuração inicial de identidade e contexto do Oráculo

**Configuração**:
- Nome e descrição do Oráculo
- Domínio/setor (Banking, CRM, Healthcare, Logística, etc)
- CNPJ/CPF (se aplicável)
- Licenças regulatórias (se aplicável)
- Integrações autorizadas
- Políticas internas
- Idiomas suportados

**Critérios de Aceitação**:
- Wizard de configuração passo-a-passo
- Validação de campos
- Persistência em `oracle_config`
- Possibilidade de editar depois

**Status v1**: Parcialmente implementado
**Status v2.0**: Interface melhorada, suporte multi-idioma

#### RF041: Fase 1 - Upload de Contexto Multimodal
**Descrição**: Usuário faz upload de documentação em múltiplos formatos

**Aceita**:
- PDFs de regulações/documentação
- Diagramas (Mermaid, Whimsical, JSON schemas)
- Documentação de produto (descrição, casos de uso)
- Super prompt (descrição livre em linguagem natural)
- URLs (ingestão de conteúdo remoto)
- Vídeos/áudio (transcrição automática)

**Critérios de Aceitação**:
- Aceitar múltiplos formatos simultâneos
- Preview dos uploads
- Processamento em background (Celery/RQ)
- Notificação quando completo
- Progress bar durante upload

**Status v1**: Implementado
**Status v2.0**: Interface melhorada + 30+ formatos + multi-idioma

#### RF042: Fase 2 - Especificação Gerada e Refinamento Iterativo
**Descrição**: IA lê contexto e gera especificação editável, com iterações usuário ↔ IA

**Processo**:
1. IA gera especificação inicial em Markdown (requirements, objects, workflows, agents)
2. Usuário revisa especificação
3. Chat para refinar (usuário ↔ IA): "adicionar campo X", "mudar regra Y"
4. IA atualiza especificação em tempo real
5. Preview visual (grafo de objetos, workflow diagram)
6. Usuário aprova especificação

**Critérios de Aceitação**:
- LLM (Claude, vLLM) gera spec detalhada
- Editor Markdown com syntax highlighting
- Chat interativo para refinamento
- Versionamento de specs
- Approval workflow com comentários

**Status v1**: Parcialmente implementado
**Status v2.0**: Chat iterativo melhorado, refinamento 100% funcional

#### RF043: Fase 3 - Geração Automática de Modelo Executável
**Descrição**: IA transforma spec aprovada em modelo executável completo

**Gera automaticamente**:
1. **Object Definitions**: 100% dos objetos com fields, validações, FSM
2. **Validation Rules**: Todas as regras em `validation_rules` table
3. **Workflows**: Processos de negócio em JSON (LangFlow compatible)
4. **Agents**: Agentes especializados com CrewAI
5. **Integrações**: Conectores para APIs externas
6. **Database Schema**: DDL SQL para PostgreSQL
7. **Type Definitions**: Pydantic (Python), TypeScript interfaces
8. **Graph Relations**: Mapeamento em NebulaGraph

**Critérios de Aceitação**:
- JSON Schema válido gerado
- DDL SQL válido e testado
- Relacionamentos em NebulaGraph
- OPA Rego para validações complexas
- Tudo em <60 segundos
- Zero código manual necessário

**Status v1**: Não implementado
**Status v2.0**: Novo - Core da geração (RF043)

#### RF044: Fase 4 - Preview, Teste e Aprovação
**Descrição**: Usuário revisa, testa e aprova modelo gerado antes de ativar

**Funcionalidades**:
- Visualização de object graph (React Flow)
- Teste de workflows (simular fluxos)
- Teste de agentes (executar com sample data)
- Simulação de casos de uso
- Rollback se necessário (voltar para spec anterior)

**Critérios de Aceitação**:
- Graph visualization responsiva
- Test harness para workflows com dados simulados
- Executar agentes em modo debug
- Exportar logs de teste
- Rollback automático

**Status v1**: Não implementado
**Status v2.0**: Novo requisito

#### RF045: Fase 5 - "Play" - Ativação e Geração de Solução Completa
**Descrição**: Modelo aprovado fica ativo e gera solução COMPLETA executável

**O que é gerado**:
1. **Middleware** (FastAPI/Gin)
   - APIs REST para CRUD de todos os objetos
   - Validações automáticas
   - Autenticação/autorização
   - Logging e observability

2. **Agentes** (CrewAI)
   - Todos os agentes especializados
   - Prontos para execução

3. **Fluxos** (LangGraph)
   - Workflows executáveis
   - State management

4. **Frontend** (Next.js + shadcn/ui)
   - Formulários auto-gerados
   - Listagens
   - Dashboards
   - Multi-idioma nativo (i18n)

5. **Data Layer** (PostgreSQL + Neo4j)
   - Schema completo
   - Relacionamentos
   - Índices otimizados

6. **Integrações** (via MCP)
   - Conectores para APIs externas
   - Retry logic
   - Rate limiting

7. **Documentação** (auto-gerada)
   - API docs (OpenAPI)
   - Architecture decision records
   - Runbooks

**Critérios de Aceitação**:
- APIs REST completas e testadas
- GraphQL opcional
- SDKs (Python, TypeScript) gerados
- Docker-ready para deploy
- CI/CD configuration (GitHub Actions)
- Performance: latência p99 <200ms

**Status v1**: Implementado (uso)
**Status v2.0**: Totalmente automatizado via Phase 5

#### RF046: Versionamento e Evolução de Modelos
**Descrição**: Histórico e rollback de versões do modelo, zero downtime updates

**Funcionalidades**:
- Cada mudança em object_definition gera nova versão
- Instâncias antigas continuam funcionando
- Schema migration automática se possível
- Rollback para versão anterior
- Impacto analysis (quais workflows são impactados)

**Critérios de Aceitação**:
- Versionamento semântico
- Backward compatibility quando possível
- Zero downtime migrations
- Audit trail de versões

**Status v1**: Parcialmente implementado
**Status v2.0**: Completo

### 2.6 Dynamic UI Generation - 3 Pilares

**Descrição**: Interface gerada 100% automaticamente via 3 pilares complementares

#### RF050: FormGenerator Pillar
**Descrição**: Gerar formulários a partir de object_definition

**Tipos de Forms**:
- Create forms (campos obrigatórios + required fields)
- Edit forms (todos os campos editáveis)
- Detail views (read-only)
- Search forms (filtros)
- List views (tabelas com filtros, sort, paginação)
- Inline forms (edição em linha)

**Critérios de Aceitação**:
- Widgets apropriados para tipos (text, select, date, checkbox, radio, etc)
- Validação client-side sincronizada com server-side
- Erro handling com mensagens claras
- Multi-language labels (via i18n)
- Acessibilidade (WCAG 2.1 AA)

**Status v1**: Implementado (básico)
**Status v2.0**: Otimizado com mais widgets

#### RF051: ProcessFlowVisualization Pillar
**Descrição**: Renderizar workflows como diagramas interativos executáveis

**Funcionalidades**:
- React Flow com nodes (operações) e edges (fluxo)
- Histórico de execução do workflow
- Debug visual (passo-a-passo)
- Interação: play/pause/step através dos nós
- Zoom/pan para workflows grandes
- Mobile-friendly rendering

**Critérios de Aceitação**:
- Diagramas responsivos
- Rendering eficiente (500+ nodes)
- Performance em mobile
- Dark mode

**Status v1**: Não implementado
**Status v2.0**: Novo requisito

#### RF052: BacenValidationEngine Pillar (Agnóstico)
**Descrição**: Mostrar fundamentação legal/regulatória para validações (agnóstico ao domínio)

**Padrão**:
- Banking: Link para manual/resolução BACEN
- CRM: Link para melhor prática CRM/SaaS
- Healthcare: Link para protocolo/legislação de saúde
- Etc (depende do domínio do Oráculo)

**Funcionalidades**:
- Validação executada em tempo real
- Link para source (documento/resolução)
- Rastreabilidade (audit trail)
- Explicação em linguagem clara

**Critérios de Aceitação**:
- OPA Rego para lógica complexa
- Explicações legíveis ao usuário
- Links para fonte (documento)
- Performance: validação <50ms

**Status v1**: Não implementado
**Status v2.0**: Novo requisito

#### RF053: Screen Type Conductor - IA Escolhe Melhor Widget
**Descrição**: IA escolhe widget ideal para cada campo

**Lógica**:
- TextField para strings simples
- NumberInput para números
- DatePicker para datas
- Select para enums
- Autocomplete para foreign keys
- RichTextEditor para textos longos
- FileUpload para anexos
- CPFMaskedInput para CPF (Banking)
- etc

**Critérios de Aceitação**:
- Lógica customizável via object_definition
- Preview de widget
- Fallback para TextInput
- Multi-language labels

**Status v1**: Parcialmente implementado
**Status v2.0**: Melhorado com AI selection

### 2.7 Abstração Total e Agnósticismo de Domínio

#### RF060: Agnósticismo Completo de Domínio
**Descrição**: SuperCore não assume domínio específico até ser configurado

**Princípio**:
- SuperCore core é 100% agnóstico
- Não "sabe" de Banking, CRM, ERP, Healthcare até criar um Oráculo
- Lógica específica fica em object_definitions, não em código
- Múltiplos Oráculos (Banking, CRM, Hospital) na mesma plataforma

**Critérios de Aceitação**:
- Mesma plataforma base serve 3+ domínios diferentes
- Zero código específico de domínio no core
- Exemplos: Banking Oráculo, CRM Oráculo, Healthcare Oráculo
- Agentes são genéricos (Validation, Analysis, Resolution) + customizados por Oráculo

**Status v1**: Implementado
**Status v2.0**: Validado

#### RF061: Zero Código Manual Após SuperCore Implementado
**Descrição**: Depois de SuperCore estar em produção, 100% de novas soluções são geradas por IA

**Princípio**:
- object_definitions geradas por IA
- Workflows gerados por IA
- UI geradas por IA
- Validações interpretadas de rules (não coded)
- Agentes gerados por IA

**Critérios de Aceitação**:
- Case study: Oráculo completo gerado em <8h de trabalho humano
- Medida: 0% de código customizado vs 100% gerado

**Status v1**: Objetivo da arquitetura
**Status v2.0**: Validação em produção

#### RF062: Production-Grade desde o Dia 1
**Descrição**: Código gerado é production-ready imediatamente

**Requisitos**:
- Type-safe (Go, TypeScript, Python)
- Error handling completo
- Logging e observability (estruturado, rastreável)
- Performance otimizado (latência p99 <200ms)
- Security hardened (validações, sanitização, rate limiting)
- Tested (80%+ coverage automático)

**Critérios de Aceitação**:
- Code review: passa nas mesmas standards que código manual
- Testing: 80%+ coverage automático gerado
- Performance: latência <200ms p99
- Security: OWASP Top 10 mitigado
- Logging: rastreabilidade completa (quem, quando, o quê)

**Status v1**: Objetivo de arquitetura
**Status v2.0**: Implementação requisitada

---

## 3. Casos de Uso

### UC001: Criar Novo Oráculo

**Descrição**: Administrador cria novo Oráculo para um domínio diferente

**Atores**:
- Administrador SuperCore
- Product Manager
- Domain Expert (SME)

**Pré-Condições**:
- SuperCore v2.0 implementado
- Usuário tem permissão para criar Oráculos

**Fluxo Principal**:

1. **Administrador acessa Super Portal**
   - Clica em "Novo Oráculo"
   - Preenche: Nome="Banking Hub", Domínio="Banking", Descrição="Solução de Core Banking"

2. **Configuração do Oráculo**
   - CNPJ da instituição
   - Licenças (IP licenciada pelo BACEN)
   - Integrações autorizadas (BACEN SPI, Receita Federal)
   - Idiomas suportados (português, inglês)

3. **Upload de Conhecimento (Fase 1)**
   - Upload de PDFs BACEN (regulações)
   - Diagramas de processo
   - Documentação interna
   - URLs de APIs (BACEN SPI, DICT)

4. **Geração de Especificação (Fase 2)**
   - IA gera especificação inicial
   - Product Manager refina via chat
   - Aprova especificação

5. **Geração Automática (Fase 3)**
   - IA gera object_definitions (Account, Customer, Transaction, etc)
   - IA gera agents (Validation Agent, Compliance Agent)
   - IA gera workflows (Onboarding, Transfer, etc)

6. **Preview e Teste (Fase 4)**
   - Testa workflows com sample data
   - Executa agentes
   - Simula casos de uso

7. **Play (Fase 5)**
   - Oráculo entra em modo "Play"
   - Sistema gera:
     - Middleware FastAPI completo
     - Frontend Next.js com formulários
     - Agentes CrewAI prontos
     - Database PostgreSQL com schema
     - Documentação automática

8. **Resultado**
   - Oráculo Banking completamente funcional
   - Pronto para usar em produção
   - APIs disponíveis para integração

**Resultado Esperado**:
- Novo Oráculo (e solução) funcional em 1-2 dias (antes: 2-3 semanas)

---

### UC002: Gerenciar Objetos Dentro de um Oráculo

**Descrição**: Product Manager adiciona novo objeto a um Oráculo existente sem código

**Atores**:
- Product Manager
- IA Assistant
- Compliance Officer

**Pré-Condições**:
- Oráculo Banking em produção (da UC001)
- Product Manager tem acesso ao Oráculo

**Fluxo**:

1. **Product Manager entra no Oráculo**
   - Acessa seção "Objects"
   - Vê lista de objects (Account, Customer, Transaction, etc)

2. **Cria novo objeto via IA**
   - Clica "Novo Objeto"
   - Descreve: "Preciso de um objeto para Cartão de Crédito"
   - IA consulta Oráculo (RAG) para regras de cartão de crédito (limites, juros, etc)
   - IA gera `CreditCard` object_definition automaticamente

3. **Revisa e refina**
   - Vê fields gerados: `card_number`, `limit`, `interest_rate`, `due_date`, etc
   - Chat para refinar: "Adicionar campo `credit_score`"
   - IA atualiza definição

4. **Aprova mudança**
   - Clica "Aprovar"
   - Impacto analysis mostra: "Novo objeto será usado em 2 workflows"
   - Compliance Officer aprova

5. **Deploy automático**
   - Schema migrado para PostgreSQL
   - Formulário auto-gerado
   - API REST gerada
   - Workflow impactados compilados
   - Zero downtime

6. **Resultado**
   - Novo objeto pronto para usar
   - Forms já funcionam
   - APIs disponíveis

**Resultado Esperado**:
- Novo objeto funcionando em 30 minutos (antes: 2-3 dias)

---

### UC003: Executar Agente para Resolver Problema Complexo

**Descrição**: Múltiplos agentes colaboram para resolver contestação de transação

**Atores**:
- Customer Support Agent (IA)
- Transaction Analysis Agent (IA)
- Compliance Agent (IA)
- Resolution Agent (IA)
- End User (cliente contestando)

**Pré-Condições**:
- Oráculo Banking em produção
- 4 agentes criados e treinados

**Fluxo**:

1. **Cliente cria contestação**
   - Via portal MCP
   - Descreve: "Transação não reconhecida de R$ 500"
   - Sistema cria `DisputeTicket` instance

2. **CustomerSupportAgent ativado**
   - Recebe ticket
   - Extrai informações: quem, quando, quanto
   - Notifica outros agentes via Pulsar

3. **TransactionAnalysisAgent investigam**
   - Consulta Oráculo (RAG) para histórico da transação
   - Analisa padrão de comportamento do cliente
   - Recomenda: "Transação é fora do padrão, possível fraude"

4. **ComplianceAgent verifica**
   - Checa se transação passou por validações PLD
   - Verifica listas de fraude
   - Recomenda: "Aprovar reembolso, padrão atípico"

5. **ResolutionAgent decide**
   - Sintetiza análises dos outros agentes
   - Executa `RefundWorkflow`
   - Integra com BACEN SPI para devolver R$ 500
   - Notifica cliente: "Sua contestação foi aprovada"

6. **Rastreabilidade completa**
   - `DisputeTicket` tem audit trail completo
   - Cada passo documentado
   - Quem recomendou o quê, por quê

**Resultado Esperado**:
- Contestação resolvida em <4h (SLA: 48h)
- Zero intervenção manual
- Auditoria completa

---

### UC004: Ativar Novo Requisito Regulatório

**Descrição**: Nova regulação é publicada, Oráculo evolui automaticamente

**Atores**:
- Compliance Officer
- Oráculo (IA)
- SuperCore (IA)

**Pré-Condições**:
- Oráculo Banking em produção
- Nova regulação BACEN publicada

**Fluxo**:

1. **Compliance Officer vê nova regulação**
   - Upload do PDF da resolução BACEN
   - Ex: "Limite máximo de PIX agora é R$ 10k (antes R$ 5k)"

2. **Oráculo absorve conhecimento**
   - Sistema processa PDF
   - Extrai mudança: "PixLimit increased to 10000"
   - Armazena em Knowledge Graph

3. **AI Context Generator analisa impacto**
   - Identifica objects impactados: `PixPayment`, `Account`
   - Identifica validations que precisam mudar
   - Sugere: "Atualizar validation_rule para PixLimit = 10000"

4. **Compliance Officer aprova**
   - Vê impacto analysis
   - Aprova em 1 clique

5. **Auto-update e deploy**
   - Validação é atualizada
   - Schema é migrado (se necessário)
   - Transações PF podem usar novo limite imediatamente
   - Auditoria completa

6. **Resultado**
   - Compliance garantida
   - Zero risco de non-compliance
   - Zero downtime

**Resultado Esperado**:
- Compliance em horas (antes: semanas)

---

## 4. Requisitos Não-Funcionais

### RNF001: Performance

**Latência**:
- APIs REST: p99 < 200ms
- GraphQL queries: p99 < 300ms
- Validações: < 50ms
- RAG queries: < 100ms
- Agent execution: < 30s (primeira chamada), < 5s (cached)

**Throughput**:
- Backend: 10k req/sec (Fase 1), 100k req/sec (Fase 4)
- AI Processing: 100 documents/hour (Fase 1), 1000/hour (Fase 4)
- Agent execution: 100 agentes em paralelo (Fase 2+)

**Status v1**: 200ms SLA
**Status v2.0**: Mesmo SLA, maior throughput

### RNF002: Escalabilidade

**Horizontal Scaling**:
- PostgreSQL: Read replicas + connection pooling
- NebulaGraph: 3+ nós cluster
- Flink: 10+ task managers (Fase 3+)
- Celery: 20+ workers (Fase 2+)
- FastAPI: 10+ instances (Fase 2+)

**Vertical Scaling**:
- Backend: 8GB RAM minimum, 4 CPU
- AI Services: GPU optional (Ollama local, vLLM produção)

**Status v1**: Arquitetura escalável
**Status v2.0**: Implementação em progresso

### RNF003: Segurança

**Autenticação & Autorização**:
- OAuth 2.0 / OIDC para portais
- JWT para APIs
- RBAC (Role-Based Access Control) por Oráculo
- Permissões granulares por object_definition
- RLS (Row Level Security) no PostgreSQL

**Criptografia**:
- TLS 1.3 para comunicação
- AES-256 para dados em repouso
- Hashing seguro para senhas (bcrypt/argon2)
- PII encryption (CPF, cartão, etc)

**Auditoria**:
- Audit trail completo para todas as ações
- Rastreabilidade: quem/quando/o quê/por quê
- Log imutável (append-only)

**Compliance**:
- GDPR: Direito ao esquecimento, portabilidade
- LGPD: Consentimento, direito à privacidade
- Domínio-específica (BACEN para Banking, etc)

**Status v1**: Arquitetura segura definida
**Status v2.0**: Implementação completa requisitada

### RNF004: Multi-Tenancy Nativo

**Isolamento**:
- Via `oracle_id` em todos os dados
- Isolamento completo entre Oráculos
- RLS no PostgreSQL
- Segregação em NebulaGraph
- Segregação em pgvector

**Separação de Recursos**:
- Cada Oráculo pode ter quota de storage
- Cada Oráculo pode ter quota de API calls
- Rate limiting por Oráculo

**Status v1**: Parcialmente implementado
**Status v2.0**: Completo

### RNF005: Multi-Idioma Nativo

**Suportado**:
- Interface em 10+ idiomas (português, inglês, espanhol, etc)
- Object definitions traduzíveis (labels, descriptions)
- Conteúdo gerado por IA traduzível
- Validações em múltiplos idiomas

**Implementação**:
- i18next compatível
- Harmonia na stack frontend (evitar incompatibilidades)
- LLM multilíngue
- Embeddings multilíngues

**Status v1**: Suportado por arquitetura
**Status v2.0**: Validação e implementação requisitada

### RNF006: Extensibilidade

**Custom Code**:
- OPA Rego para validações complexas
- Python/Go para integrações customizadas
- JavaScript/TypeScript para UI customizações

**Plugins**:
- MCP servers customizados
- Agents customizados via CrewAI
- Storage drivers para diferentes BDs

**Status v1**: Extensível via código
**Status v2.0**: Framework de extensão melhorado

### RNF007: Manutenibilidade

**Code Quality**:
- Type-safe (Go, TypeScript, Python)
- Automated testing (unit, integration, e2e)
- Code coverage minimum 80%
- Linting & formatting (gofmt, prettier, black)

**Documentation**:
- API documentation (OpenAPI/Swagger) auto-gerada
- Architecture decision records (ADRs)
- Runbooks para operações
- Knowledge base com FAQs

**Status v1**: Padrões definidos
**Status v2.0**: Implementação requisitada

### RNF008: Confiabilidade

**Uptime**:
- Fase 1-2: 99% (29min downtime/mês)
- Fase 3-4: 99.9% (43sec downtime/mês)

**Backup & Recovery**:
- Daily backups (PostgreSQL, NebulaGraph, pgvector)
- RTO (Recovery Time Objective): 1 hora
- RPO (Recovery Point Objective): 15 minutos

**Disaster Recovery**:
- Multi-region (futuro)
- Failover automático
- Testing trimestral

**Status v1**: Arquitetura resiliente
**Status v2.0**: Implementação em progresso

---

## 2.9 Deploy Management

### RF063: Gestão de Deploy de Oráculos

**Descrição**: Portal SuperCore gerencia deploy completo de Oráculos em Kubernetes com 1-click deployment, monitoramento de status, e rollback automático.

**Funcionalidades**:

**1. Deploy Configuration**:
- **Kubernetes Cluster Management**:
  - Configuração de múltiplos clusters (prod, staging, dev)
  - Seleção de namespace por ambiente
  - Configuração de replicas (1-20 pods)
  - Resource limits (CPU, Memory, GPU se necessário)
  - Configuração de health checks (readiness, liveness)
  - Auto-scaling horizontal (HPA) com métricas configuráveis

- **Container Configuration**:
  - Build automático de imagem Docker a partir de `object_definitions`
  - Push para registry (Docker Hub, AWS ECR, GCP Artifact Registry)
  - Versionamento semântico automático (v1.0.0, v1.0.1, etc.)
  - Multi-stage builds para otimização de tamanho
  - Scan de vulnerabilidades (Trivy) antes do deploy

- **Environment Configuration**:
  - Configuração de variáveis de ambiente por Oráculo
  - Secrets management (integração com Vault, AWS Secrets Manager)
  - ConfigMaps para configurações não-sensíveis
  - Injeção automática de credenciais de DB, Redis, etc.

**2. Deploy Execution**:
- **1-Click Deploy**:
  - Deploy completo de Oráculo (Backend ou Frontend) com 1 clique
  - Geração automática de manifests Kubernetes (Deployment, Service, Ingress)
  - Apply via kubectl ou Helm charts
  - Stratégia de deploy configurável (Rolling Update, Blue-Green, Canary)

- **Backend Oráculo Deploy**:
  - Deploy de middleware (FastAPI ou Gin)
  - Deploy de MCP Server (porta separada)
  - Deploy de agents CrewAI como workers assíncronos
  - Deploy de workflows LangGraph com checkpoints
  - Configuração automática de ingress para APIs

- **Frontend Oráculo Deploy**:
  - Deploy de portal Next.js (SSR ou SSG)
  - Deploy de BFF (Backend-for-Frontend)
  - Configuração de CDN (CloudFront, Cloudflare) para assets estáticos
  - Configuração de routing (domínio customizado)
  - SSL/TLS automático (Let's Encrypt via cert-manager)

**3. Status Monitoring**:
- **Real-time Dashboard**:
  - Status de cada Oráculo: `Healthy` / `Unhealthy` / `Deploying` / `Stopped`
  - Métricas de pods (CPU%, Memory%, Request rate, Error rate)
  - Logs em tempo real (agregados de todos os pods)
  - Alertas configuráveis (Slack, Email, PagerDuty)

- **Health Checks**:
  - Readiness probe: `/health/ready` (DB connected, Redis ok, MCP up)
  - Liveness probe: `/health/live` (process alive)
  - Startup probe: `/health/startup` (initialization complete)
  - Automatic restart on failure (max 3 restarts)

**4. Rollback Management**:
- **Automatic Rollback**:
  - Se deploy falha health checks por >5min → rollback automático
  - Se error rate >10% por >2min → rollback automático
  - Preservação de 10 últimas versões

- **Manual Rollback**:
  - UI com lista de versões deployadas
  - Rollback para qualquer versão anterior com 1 clique
  - Diff visual entre versões (object_definitions, código, config)
  - Teste de versão antiga em namespace isolado antes de rollback completo

**5. Multi-Cluster Support**:
- **Clusters Configuráveis**:
  - Produção: `cluster-prod-us-east-1`, `cluster-prod-eu-west-1`
  - Staging: `cluster-staging`
  - Development: `cluster-dev`, `minikube-local`

- **Deploy Coordenado**:
  - Deploy em staging primeiro (smoke tests automáticos)
  - Se staging OK → promover para produção
  - Deploy multi-region simultâneo com traffic splitting (50% US, 50% EU)

**6. CI/CD Integration**:
- **GitHub Actions / GitLab CI**:
  - Workflow YAML gerado automaticamente
  - Build + Test + Deploy pipeline
  - Deploy automático em merge to `main` (staging)
  - Deploy produção após approval manual

- **ArgoCD / FluxCD (GitOps)**:
  - Sync automático de manifests Kubernetes de repositório Git
  - Self-healing (se manifest divergir, aplicar versão do Git)
  - Rollback via Git revert

**Critérios de Aceitação**:
- ✅ Deploy de Oráculo Backend (FastAPI + MCP Server + Agents) em <5min
- ✅ Deploy de Oráculo Frontend (Next.js + BFF) em <7min
- ✅ Health checks funcionando (readiness, liveness, startup)
- ✅ Rollback automático em caso de falha (<2min)
- ✅ Dashboard exibindo status real-time de todos Oráculos deployados
- ✅ Suporte a 3+ clusters (dev, staging, prod)
- ✅ Logs agregados de todos pods acessíveis via UI
- ✅ Scan de vulnerabilidades bloqueando deploy se Critical CVEs
- ✅ SSL/TLS automático via cert-manager
- ✅ Secrets nunca commitados em Git (via Vault/Secrets Manager)

**Status**: Novo em v2.0 (Requisito para Fase 4 - Produção HA)

**Prioridade**: Alta (blocking para produção)

**Implementação**:
- **Camada 1 (Oráculo)**: Endpoints `/deploy/config`, `/deploy/execute`, `/deploy/status`, `/deploy/rollback`
- **Camada 4 (Portal UI)**: Página "Deploy Management" com formulário de config + botão 1-click deploy
- **Backend**: Go service `deploy-manager` que gera manifests Kubernetes + executa kubectl/helm
- **Tecnologias**: Kubernetes client-go, Helm SDK, Trivy, cert-manager, ArgoCD (opcional)

**Dependências**:
- RF001 (Super Portal + Oráculos)
- RF010 (Object Definitions - para gerar Dockerfiles)
- Cluster Kubernetes disponível (EKS, GKE, AKS, ou minikube)

---

## 5. Capacidades Avançadas

### 5.1 Suporte Multilíngue Nativo

**Descrição**: SuperCore suporta múltiplos idiomas naturalmente

**Implementação**:
- Embeddings multilíngues (Sentence Transformers)
- LLM com suporte multilíngue
- UI em 10+ idiomas (i18n automático)
- Conteúdo gerado por IA traduzível

**Status v1**: Suportado por arquitetura
**Status v2.0**: Validação completa requisitada

### 5.2 Orquestração de Agentes (CrewAI)

**Descrição**: Múltiplos agentes trabalham como time especializado

**Padrão**:
- Definição de papéis especializados
- Colaboração e comunicação entre agentes
- Resolução autônoma de problemas complexos
- Pulsar para comunicação assíncrona

**Exemplo**:
- 4+ agentes resolvem contestação de PIX
- Cada um com especialidade diferente
- Resultado: decisão em <4h (antes: 2 dias)

**Status v1**: Não implementado
**Status v2.0**: Requisito crítico (RF020-024)

### 5.3 Orquestração de Fluxos (LangFlow)

**Descrição**: Workflows visuais para processos de negócio

**Padrão**:
- Drag-and-drop na UI
- Nós para operações (validar, integração, notificação)
- Conectores para fluxo lógico
- Execução automática com estado persistido

**Status v1**: Não implementado
**Status v2.0**: Requisito para Fase 2

### 5.4 Crescimento Exponencial Validado

**Descrição**: Produtividade cresce exponencialmente com tempo

**Padrão**:
- Semana 1: Lento (setup Oráculo)
- Semana 2: Moderado (primeiros objetos)
- Semana 3: Rápido (reutilização de padrões)
- Semana 4+: Exponencial (composição automática)

**Medição**:
- Semana 1: 5 objetos gerados
- Semana 2: 15 objetos gerados
- Semana 3: 35 objetos gerados
- Semana 4: 50+ objetos possíveis (composição)

**Status v1**: Objetivo arquitetural
**Status v2.0**: Validação em produção requisitada

### 5.5 Power Tool para IAs Implementarem Soluções

**Descrição**: SuperCore é ferramenta para IAs implementarem soluções via MCP

**Padrão**:
- MCP expostos para Claude (Desktop, AI)
- Agents podem chamar tools MCP
- Gera código production-grade
- Integração com stack LangChain

**Uso**:
- Architect Agent usa SuperCore MCP para gerar objects
- Compliance Agent consulta Oráculo via RAG
- Implementation Agent deploya com CI/CD

**Status v1**: Parcialmente especificado
**Status v2.0**: Implementação requisitada

---

## 6. Restrições e Limitações

### 6.1 Limitações Conhecidas

**Fase 1**:
- Máximo 100 object_definitions por Oráculo
- Máximo 1000 instâncias
- RAG latência ~100ms
- Sem suporte a transações distribuídas

**Fase 2**:
- Máximo 500 object_definitions por Oráculo
- Máximo 100k instâncias
- Graph com 5k+ nós pode ter latência >100ms
- Flink com 1-2 workers apenas

**Fase 3-4**:
- Sem limitações conhecidas
- Escalabilidade horizontal provada

### 6.2 Dependências Externas

**Obrigatórias**:
- PostgreSQL 15+
- NebulaGraph 3.7+
- Redis 7+
- Go 1.21+, Node.js 20+, Python 3.11+

**Condicionais**:
- Ollama (dev) ou vLLM (prod)
- MinIO (se armazenar documentos)
- Apache Pulsar (se usar async messaging)
- Claude API (para geração via IA)

**Opcionais**:
- TigerBeetle (para ledger contábil, se Banking)
- Anti-fraude 3rd party
- Elasticsearch (para full-text search)

### 6.3 Restrições Técnicas

**Database**:
- PostgreSQL JSONB size limit: 1GB por field
- NebulaGraph: query timeout 30 segundos
- pgvector: dimensionalidade máxima 2000

**API**:
- Request size: máximo 100MB
- Response: máximo 50MB
- Timeout: 30 segundos padrão

**Frontend**:
- React Flow: máximo 500 nós para performance aceitável
- Next.js: bundle size máximo 500KB (gzip)

**Storage**:
- MinIO: arquivo máximo 5GB
- Retenção: 90 dias padrão (configurável)

---

## 7. Matriz de Rastreabilidade

### 7.1 Requisitos v1 → v2.0

| Requisito | v1 | v2.0 | Status |
|-----------|----|----|--------|
| **RF001: Super Portal + Oráculos** | Não | Novo | Novo |
| **RF002: Ingestão Multimodal** | Parcial (PDFs) | Completo (30+ formatos) | Expandido |
| **RF003: Processamento Documentos** | Sim | Sim | Mantido |
| **RF004: Knowledge Graph** | Sim | Sim (multi-tenant) | Mantido |
| **RF005: RAG Trimodal** | Sim | Otimizado | Melhorado |
| **RF006: Oracle Config** | Parcial | Completo | Melhorado |
| **RF010: Object Definitions Management** | Parcial | Completo | Expandido |
| **RF011: Auto-geração de Objects** | Não | Novo | Novo |
| **RF012: Instâncias Dinâmicas** | Sim | Sim | Mantido |
| **RF013: Validações Centralizadas** | Parcial | Completo (OPA) | Expandido |
| **RF014: FSM** | Sim | Sim | Mantido |
| **RF015: Relacionamentos Semânticos** | Sim | Otimizado | Melhorado |
| **RF016: Integrações Externas** | Parcial | Completo | Expandido |
| **RF017: UI Components** | Parcial | Completo | Expandido |
| **RF018: Workflows por Oráculo** | Sim | Expandido | Melhorado |
| **RF020: Gerenciamento de Agentes** | Não | Novo | Novo |
| **RF021: Auto-geração de Agentes** | Não | Novo | Novo |
| **RF022: Orquestração Agentes** | Não | Novo | Novo |
| **RF023: Execução de Agentes** | Não | Novo | Novo |
| **RF030: MCP Server** | Especificado | Implementação | Novo |
| **RF031-034: MCP Recursos/Ferramentas** | Parcial | Completo | Expandido |
| **RF040-046: AI-Driven Generator (6 fases)** | Parcial | Completo | Expandido |
| **RF050-053: Dynamic UI (3 Pilares)** | Parcial | Completo | Expandido |
| **RF060-062: Abstração Total** | Sim | Validado | Mantido |
| **RF063: Deploy Management** | Não | Novo | Novo |

### 7.2 Cobertura de Funcionalidades

**Funcionalidades Preservadas de v1**: 100% ✅

**Funcionalidades Novas em v2.0**:
- Super Portal de Backoffice (RF001)
- Gerenciamento de Oráculos (RF001)
- Gerenciamento de Objects (RF010)
- Auto-geração de Objects via IA (RF011)
- Gerenciamento de Agentes (RF020)
- Auto-geração de Agentes via IA (RF021)
- Orquestração de Agentes (RF022)
- Execução de Agentes (RF023)
- MCP Server completo (RF030-034)
- LangFlow visual workflows (RF018 expandido)
- OPA Rego para validações (RF013 expandido)
- 30+ formatos de arquivo (RF002 expandido)
- Multi-idioma nativo (RNF005)
- 6 Fases AI-Driven Generator (RF040-046)
- Deploy Management com 1-click Kubernetes (RF063)

**Capacidades Avançadas Novas**:
- Crescimento exponencial validado (5.4)
- Power tool para implementação (5.5)
- Abstração total consolidada (RF060)

---

## 8. Matriz de Rastreabilidade - Casos de Uso

| Caso de Uso | RFs Utilizados | Status |
|-------------|-----------------|--------|
| **UC001: Criar Novo Oráculo** | RF001, RF002-006, RF040-046, RF050-053, RF063 | Novo em v2.0 |
| **UC002: Gerenciar Objetos** | RF010-011, RF013-014, RF050-051 | Novo em v2.0 |
| **UC003: Executar Agentes** | RF020-023, RF031-034, RF005 | Novo em v2.0 |
| **UC004: Ativar Regulação** | RF004-006, RF011, RF013, RF041-046 | Novo em v2.0 |

---

## 9. Conclusão

### 9.1 Consolidação Completa

Este documento consolida **TODOS** os requisitos funcionais do SuperCore v2.0:

- **De v1**: Zero perda (100% preservados)
- **De v2.0**: Todas as novas capacidades incluídas
- **Agnósticismo**: Nenhum requisito específico de Banking/CRM/etc (tudo genérico)
- **Super Portal**: Gerenciamento de Oráculos e geração de soluções
- **Casos de Uso**: 4 exemplos genéricos cobrindo todos os fluxos principais
- **RNFs**: Cobertura completa de performance, segurança, escalabilidade, multi-tenancy, multi-idioma

### 9.2 Diferenças Principais v1 → v2.0

| Aspecto | v1 | v2.0 |
|---------|----|----|
| **Posicionamento** | Plataforma de automação | Plataforma universal de geração de soluções |
| **Foco** | Infraestrutura agnóstica | Automação completa + Super Portal |
| **Gerenciamento** | Sem UI (via API) | Super Portal com gerenciamento de Oráculos |
| **Objetos** | Criação manual via API/DB | Geração automática por IA (RF011) |
| **Agentes** | Não existem | Biblioteca completa com CrewAI (RF020-024) |
| **MCPs** | Especificado | Implementação completa (RF030-034) |
| **UI** | Geração básica | Dynamic generation com 3 pilares (RF050-053) |
| **Workflows** | JSON simples | LangFlow visual + automação (RF018) |
| **Validações** | PostgreSQL | PostgreSQL + OPA Rego (RF013) |
| **Geração** | Parcial (alguns objetos) | Completo (6 fases: RF040-046) |
| **Multi-idioma** | Suportado (não enfatizado) | Nativo (RNF005) |
| **Crescimento** | Linear | Exponencial validado (5.4) |
| **Use Cases** | Banking-específicos | Agnósticos (UC001-004) |

### 9.3 Próximas Ações

1. **Aprovação deste documento** como baseline v2.0
2. **Implementação de RF001** (Super Portal + Gerenciamento de Oráculos)
3. **Implementação de RF011, RF021** (Auto-geração via IA)
4. **Implementação de RF040-046** (6 Fases completas)
5. **Implementação de RF020-024** (Agentes + Orquestração)
6. **Implementação de RF030-034** (MCP Server)
7. **Validação em Produção** (caso de uso real com Oráculo Banking ou outro domínio)

---

**Versão**: 2.0.0
**Data**: 2025-12-21
**Status**: Consolidado - Revisão Crítica Completa
**Próxima Revisão**: Após implementação de RF001 (Super Portal)


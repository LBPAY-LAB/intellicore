# OBJETIVO FUNCIONAL DA PLATAFORMA: Meta-Sistema Criador de Core Banking

**Versão**: 2.0 (Revisado - Essência Correta)
**Data**: 09 de Dezembro de 2025
**Natureza**: Documento Fundacional - Visão Funcional

---

## SUMÁRIO EXECUTIVO: A VISÃO EM 3 PARÁGRAFOS

**PARÁGRAFO 1 - O QUE É**:
Esta plataforma é um **Compilador de Documentação para Core Banking**. Você fornece PDFs do Bacen (regulação PIX, SPI, cadastro), PRDs de produto e especificações técnicas. A IA analisa tudo, descobre quais entidades existem (Cliente, Conta, Transação), quais processos são necessários (validação, aprovação, liquidação), e **gera automaticamente** todo o Core Banking: banco de dados, lógica de negócio (via agentes), APIs e interfaces. **Tempo: 3-4 dias**, não 6-12 meses.

**PARÁGRAFO 2 - O SEGREDO**:
A plataforma não hardcoda nada. Ela usa **2 tabelas mestras**: `object_definitions` (DNA das entidades) e `instances` (entidades vivas). Quando você quer "Cliente", não criamos `CREATE TABLE clientes`. Criamos um registro em `object_definitions` com o schema JSON. Quando você cadastra "João Silva", criamos um registro em `instances` referenciando esse schema. **Agentes não têm código de negócio** - usam templates genéricos que leem as regras dos Objetos Base. Um único código de agente processa PIX, TED, Crédito, etc. A especialização é **configuração**, não programação.

**PARÁGRAFO 3 - O RESULTADO**:
Você obtém um Core Banking **100% compliance** (gerado da própria documentação do Bacen), **infinitamente extensível** (novo produto = novo Objeto Base, zero deploy), com **UI adaptativa** (formulários gerados automaticamente), operado por **agentes autônomos** (descobertos pela IA ao analisar docs), rodando em **infraestrutura auto-gerenciada** (NoOps). É uma máquina universal: hoje Core Banking, amanhã Hospital Management, depois Logistics Platform - **zero mudança no código**.

---

## PREÂMBULO: O QUE ESTAMOS CONSTRUINDO

Este documento define o **objetivo funcional** de uma plataforma revolucionária que **NÃO É** um Core Banking tradicional, mas sim um **Meta-Sistema Criador** — uma infraestrutura inteligente capaz de **GERAR um Core Banking completo em DIAS** através da análise de documentação regulatória, de produto e de negócio.

### Distinção Crítica

| O que NÃO estamos construindo | O que ESTAMOS construindo |
|:---|:---|
| Um Core Banking pronto com funcionalidades fixas | Uma **plataforma geradora** que **cria Core Bankings sob demanda a partir de documentação** |
| Um sistema com regras de negócio hardcoded | Um **meta-sistema** que **ingere PDFs do Bacen e gera automaticamente** o sistema completo |
| Uma aplicação que requer desenvolvedores para cada mudança | Um **organismo digital** que **lê documentação e se auto-programa** |
| Software tradicional com IA acoplada | Um **ecossistema de agentes que se auto-descobrem** ao analisar requisitos |

### O Objetivo em Uma Frase

**Ingerir documentação regulatória (Bacen, CVM, etc.) + especificações de produto → Gerar automaticamente Core Banking operacional em dias, não meses.**

---

## 1. ESSÊNCIA FUNCIONAL: PLATAFORMA DE GERAÇÃO AUTOMÁTICA DE CORE BANKING

### 1.1. Propósito Central

A plataforma funciona como um **Compilador de Documentação para Sistema Operacional**, transformando documentos regulatórios e de produto em um Core Banking completo e funcional:

**INPUT** (O que a plataforma recebe):
1. 📄 **Documentação Bacen**: Resoluções, Circulares, Manuais (PIX, SPI, Cadastro)
2. 📄 **Especificações de Produto**: PRDs, User Stories, Regras de Negócio
3. 📄 **Documentação Técnica**: APIs externas (Data Rudder, Fácil Tech)
4. 📄 **Políticas Internas**: Compliance, Risk Management, KYC

**OUTPUT** (O que a plataforma gera automaticamente):
1. **Esquemas de dados** (PostgreSQL tables, NebulaGraph schema, Vector embeddings)
2. **Agentes especializados** (descobertos dinamicamente conforme a documentação)
3. **Lógica de negócio executável** (FSMs, Workflows, Validações)
4. **Interfaces de usuário** (Front Section: navegação por grafo, formulários adaptativos)
5. **APIs REST/gRPC** (endpoints gerados automaticamente)
6. **Infraestrutura operacional** (Kubernetes manifests, Pulsar topics)

**TEMPO**: Dias, não meses.

### 1.2. A Verdade Fundamental: Objetos Base vs Instâncias

A plataforma opera sobre um princípio filosófico e técnico INQUEBRANTÁVEL:

#### O Dualismo Essencial

```
┌─────────────────────────────────────────────────────────────┐
│  MUNDO DAS IDEIAS (Back Section)                            │
│  ────────────────────────────────                           │
│  OBJETO BASE = DNA, Definição Abstrata, "O que algo É"      │
│                                                              │
│  Tabela: object_definitions                                 │
│  - id: "obj_cliente_pf"                                     │
│  - schema: {"nome": "string", "cpf": "string", ...}         │
│  - rules: ["cpf_valid()", "idade >= 18"]                   │
│  - states: ["ATIVO", "BLOQUEADO", "INATIVO"]                │
│                                                              │
│  ⚠️ NENHUMA tabela "clientes" é criada!                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Materialização)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MUNDO REAL (Front Section)                                 │
│  ────────────────────────────                               │
│  INSTÂNCIA = Vida, Materialização Concreta, "Um João Silva" │
│                                                              │
│  Tabela: instances                                          │
│  - id: "inst_00123"                                         │
│  - object_id: "obj_cliente_pf"  (referência ao DNA)        │
│  - data: {"nome": "João Silva", "cpf": "123.456.789-00"}   │
│  - state: "ATIVO"                                           │
│  - created_at: "2025-12-09T10:30:00Z"                       │
└─────────────────────────────────────────────────────────────┘
```

#### Por que isso é Revolucionário?

**Sistema Tradicional**:
- Desenvolvedor cria `CREATE TABLE clientes (nome VARCHAR, cpf VARCHAR...)`
- Para adicionar campo: Altera tabela, migra dados, atualiza código
- Para novo tipo de entidade: Novo sprint de desenvolvimento

**Nossa Plataforma**:
- IA lê documentação: "Cliente PF possui nome, CPF, data nascimento"
- Sistema cria registro em `object_definitions` (metadado puro)
- UI é gerada dinamicamente lendo o schema
- Para adicionar campo: Atualiza JSON, zero código
- Para novo tipo: IA cria nova definição, instantâneo

#### A Máquina Universal

A plataforma não "sabe" o que é Cliente, Conta ou Transação.
Ela sabe apenas executar este loop:

1. **Ler Definição** (Objeto Base)
2. **Validar Dados** (contra rules)
3. **Criar/Atualizar Instância** (persistir data)
4. **Gerenciar Estados** (FSM baseado em states)

**É uma Máquina Universal de Gestão de Entidades.**

Core Banking é apenas um "caso de uso" onde os Objetos Base são:
- `obj_transacao_pix`
- `obj_chave_dict`
- `obj_conta_pagamento`

Mas a plataforma poderia gerenciar um hospital (Paciente, Consulta, Prescrição) ou uma universidade (Aluno, Curso, Matrícula) com **ZERO** mudança no código.

---

## 2. O FLUXO MESTRE: DA DOCUMENTAÇÃO AO CORE BANKING OPERACIONAL

### 2.1. Visão Geral do Pipeline de Geração

```
┌──────────────────────────────────────────────────────────────────┐
│  FASE 1: INGESTÃO (Dia 1)                                        │
├──────────────────────────────────────────────────────────────────┤
│  INPUT:                                                          │
│  📄 bacen_pix_manual_v10.pdf                                     │
│  📄 bacen_spi_specs.pdf                                          │
│  📄 prd_conta_digital.md                                         │
│  📄 data_rudder_api_docs.json                                    │
│                                                                   │
│  PROCESSO:                                                       │
│  1. Architect Agent faz OCR + parsing                            │
│  2. Converte para texto estruturado                              │
│  3. Indexa no PgVector (embeddings)                              │
│  4. Identifica "entidades" e "processos"                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  FASE 2: DESCOBERTA DE OBJETOS BASE (Dia 1-2)                   │
├──────────────────────────────────────────────────────────────────┤
│  ARCHITECT AGENT ANALISA:                                        │
│  - "O documento menciona 'Transação PIX' 47 vezes"               │
│  - "Atributos detectados: valor, chave_destino, data_hora..."    │
│  - "Estados mencionados: PENDENTE, APROVADO, REJEITADO..."       │
│                                                                   │
│  CRIA OBJECT_DEFINITIONS:                                        │
│  ┌────────────────────────────────────────────────────┐          │
│  │ object_definitions                                 │          │
│  ├────────────────────────────────────────────────────┤          │
│  │ id: obj_transacao_pix                              │          │
│  │ schema: {                                          │          │
│  │   "valor": "decimal(15,2)",                        │          │
│  │   "chave_destino": "string",                       │          │
│  │   "tipo_chave": "enum[CPF,CNPJ,EMAIL,PHONE,EVP]"  │          │
│  │ }                                                  │          │
│  │ states: ["PENDENTE","VALIDANDO","APROVADO"...]     │          │
│  │ rules: [                                           │          │
│  │   "valor > 0",                                     │          │
│  │   "validar_chave_dict()",                          │          │
│  │   "if valor > 1000 then require_mfa()"            │          │
│  │ ]                                                  │          │
│  └────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  FASE 3: DESCOBERTA DE AGENTES (Dia 2)                          │
├──────────────────────────────────────────────────────────────────┤
│  ARCHITECT AGENT IDENTIFICA "VERBOS" NA DOCUMENTAÇÃO:            │
│  - "validar chave PIX" → Precisa de agent_dict_validator        │
│  - "processar transação" → Precisa de agent_pix_processor       │
│  - "consultar saldo" → Precisa de agent_balance_checker         │
│                                                                   │
│  CRIA AGENT_DEFINITIONS:                                         │
│  ┌────────────────────────────────────────────────────┐          │
│  │ agent_definitions                                  │          │
│  ├────────────────────────────────────────────────────┤          │
│  │ id: agent_pix_processor                            │          │
│  │ domain: "Processamento de Transações PIX"          │          │
│  │ capabilities: [                                    │          │
│  │   "initiate_transaction",                          │          │
│  │   "validate_balance",                              │          │
│  │   "call_spi_api",                                  │          │
│  │   "emit_notification"                              │          │
│  │ ]                                                  │          │
│  │ dependencies: [                                    │          │
│  │   "agent_dict_validator",                          │          │
│  │   "agent_balance_checker",                         │          │
│  │   "external_api:spi.bcb.gov.br"                    │          │
│  │ ]                                                  │          │
│  │ code_template: "generic_fsm_agent"  ← !!!          │          │
│  └────────────────────────────────────────────────────┘          │
│                                                                   │
│  ⚠️ IMPORTANTE: Agente não tem código específico!                │
│     Usa template genérico de FSM que lê as rules do Objeto Base  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  FASE 4: GERAÇÃO DE INFRAESTRUTURA (Dia 2-3)                    │
├──────────────────────────────────────────────────────────────────┤
│  ARCHITECT AGENT GERA AUTOMATICAMENTE:                           │
│                                                                   │
│  1. KUBERNETES MANIFESTS                                         │
│     deployment-agent-pix-processor.yaml                          │
│     service-agent-pix-processor.yaml                             │
│                                                                   │
│  2. PULSAR TOPICS                                                │
│     topic:pix/transactions/incoming                              │
│     topic:pix/transactions/validated                             │
│     topic:pix/transactions/completed                             │
│                                                                   │
│  3. POSTGRES MIGRATIONS                                          │
│     -- NÃO cria tabela "transacoes_pix"!                         │
│     -- Já existe tabela genérica "instances"                     │
│                                                                   │
│  4. NEBULA GRAPH SCHEMAS                                         │
│     CREATE TAG transacao_pix (valor decimal, ...);               │
│     CREATE EDGE vinculada_a (tipo string);                       │
│                                                                   │
│  5. API ENDPOINTS (auto-gerados)                                 │
│     POST /api/objects/obj_transacao_pix/instances                │
│     GET  /api/objects/obj_transacao_pix/instances/:id            │
│     PUT  /api/objects/obj_transacao_pix/instances/:id/state      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  FASE 5: GERAÇÃO DE UI (Dia 3)                                  │
├──────────────────────────────────────────────────────────────────┤
│  UI AGENT LÊ OBJECT_DEFINITIONS E GERA:                          │
│                                                                   │
│  1. FRONT SECTION (Operação)                                     │
│     - Nó visual no grafo para "Transação PIX"                    │
│     - Formulário dinâmico para criar nova transação              │
│     - Painel de detalhes com todos os campos do schema           │
│                                                                   │
│  2. BACK SECTION (Criação)                                       │
│     - Editor para modificar obj_transacao_pix                    │
│     - Visualizador de dependências (quais agentes usam)          │
│                                                                   │
│  JSON GERADO (exemplo):                                          │
│  {                                                               │
│    "form_id": "create_transacao_pix",                            │
│    "fields": [                                                   │
│      {                                                           │
│        "name": "valor",                                          │
│        "type": "currency",                                       │
│        "label": "Valor da Transação",                            │
│        "validation": "min:0.01",                                 │
│        "required": true                                          │
│      },                                                          │
│      {                                                           │
│        "name": "chave_destino",                                  │
│        "type": "pix_key",                                        │
│        "label": "Chave PIX Destino",                             │
│        "async_validation": "agent_dict_validator.validate"       │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  FASE 6: DEPLOY E VALIDAÇÃO (Dia 3-4)                           │
├──────────────────────────────────────────────────────────────────┤
│  ORCHESTRATOR AGENT EXECUTA:                                     │
│                                                                   │
│  1. kubectl apply -f deployments/                                │
│     → Todos os agentes sobem no K8s                              │
│                                                                   │
│  2. Cria tópicos no Pulsar                                       │
│                                                                   │
│  3. Executa testes automatizados:                                │
│     - Simula "Criar Transação PIX"                               │
│     - Valida se agent_dict_validator é chamado                   │
│     - Valida se instância é criada corretamente                  │
│                                                                   │
│  4. Gera relatório de validação                                  │
│     ✅ 47 Objetos Base criados                                   │
│     ✅ 23 Agentes descobertos e deployados                       │
│     ✅ 89 Endpoints API gerados                                  │
│     ✅ 100% dos testes passaram                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL: CORE BANKING OPERACIONAL                       │
├──────────────────────────────────────────────────────────────────┤
│  ✨ Sistema completo em 3-4 DIAS                                 │
│  ✨ Zero código de negócio escrito manualmente                   │
│  ✨ Pronto para criar instâncias e processar transações reais    │
│  ✨ UI adaptativa funcionando                                    │
│  ✨ Compliance garantido (baseado em docs oficiais do Bacen)     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2. O Segredo: Templates Genéricos + Configuração Dinâmica

**Por que isso é rápido?**

Os agentes **não têm código específico de negócio**. Eles usam **templates genéricos** que leem configuração:

```python
# Template Genérico de Agente (usado por TODOS os agentes descobertos)
class GenericFSMAgent:
    def __init__(self, agent_definition_id):
        # Carrega definição do banco
        self.definition = db.query("SELECT * FROM agent_definitions WHERE id = ?", agent_definition_id)
        self.capabilities = self.definition['capabilities']

    def handle_event(self, event):
        # Descobre qual Objeto Base está sendo manipulado
        object_id = event['object_id']
        object_def = db.query("SELECT * FROM object_definitions WHERE id = ?", object_id)

        # Lê as RULES do Objeto Base
        rules = object_def['rules']

        # Executa validações definidas nas rules (interpretadas dinamicamente)
        for rule in rules:
            if not self.evaluate_rule(rule, event['data']):
                return {"status": "REJECTED", "reason": rule}

        # Transição de estado baseada no FSM definido no Objeto Base
        new_state = self.fsm_transition(object_def['states'], event)

        # Persiste instância
        db.update("instances", {"state": new_state, "data": event['data']})
```

**Magia**: O mesmo código de agente serve para processar PIX, TED, abertura de conta, etc.
A especialização vem da **configuração** (object_definitions + agent_definitions), não do código.

---

## 3. ARQUITETURA FUNCIONAL: OS DOIS HEMISFÉRIOS DA CRIAÇÃO

A plataforma possui uma arquitetura dual que separa **definição** de **execução**:

### 2.1. HEMISFÉRIO DE CRIAÇÃO (Back Section) - O "DNA Writer"

**Objetivo Funcional**: Permitir que arquitetos de negócio **escrevam o DNA** do sistema bancário.

#### Funcionalidades Principais

##### 2.1.1. Editor de Ontologia em Linguagem Natural
- **Input**: Texto livre descrevendo objetos, relacionamentos e regras
- **Exemplo**:
  > *"Uma 'Conta Garantida' é um tipo de Conta Corrente que possui um Imóvel vinculado como garantia. O limite de crédito é calculado como 50% do valor venal do imóvel. Transações que excedam o saldo + limite devem ser bloqueadas automaticamente."*

- **Processamento**:
  1. LLM analisa o texto e extrai:
     - **Entidades**: `Conta Garantida`, `Imóvel`, `Transação`
     - **Atributos**: `valor_venal`, `limite_credito`, `saldo`
     - **Relacionamentos**: `possui_garantia`, `vinculado_a`
     - **Regras**: `if (valor_transacao > saldo + limite) then BLOCK`

  2. Gera esquema JSON formal
  3. Cria tabelas no PostgreSQL
  4. Cria nós/vértices no NebulaGraph
  5. Vetoriza regras no PgVector para recuperação contextual

##### 2.1.2. Visualizador de Grafo de Definições
- **Função**: Mostrar a **hierarquia de classes** e **dependências** entre objetos
- **Valor**: Permite ver impacto de mudanças antes de publicar
- **Exemplo**: Alterar "Conta Base" mostra todos os tipos derivados afetados

##### 2.1.3. Simulador de Políticas
- **Função**: Testar regras contra cenários hipotéticos
- **Input**: Cenário descrito em linguagem natural
  > *"Simule: Cliente João tenta transferir R$ 100.000 para conta no exterior às 2h da manhã"*
- **Output**: Sequência de decisões dos agentes e resultado final

##### 2.1.4. Gestão de Ciclo de Vida de Definições
- **Versionamento**: Toda mudança é versionada (Git-like)
- **Rollback**: Possibilidade de reverter para versão anterior
- **A/B Testing de Regras**: Rodar duas versões de uma política simultaneamente

#### UX do Back Section
- **Estilo**: Chat-first, minimalista, focado em texto e diagramas
- **Interação**: Conversa com "Agente Arquiteto" para refinar definições
- **Público**: Arquitetos de Negócio, Product Owners, C-Level

---

### 2.2. HEMISFÉRIO DE GESTÃO (Front Section) - O "Mundo Vivo"

**Objetivo Funcional**: Permitir que operadores **interajam com as instâncias vivas** dos objetos definidos no Back Section.

#### Funcionalidades Principais

##### 2.2.1. Interface Neural Sutil (Navegação por Grafo)
- **Paradigma**: Substitui menus hierárquicos por **navegação contextual**
- **Mecânica**:
  - Busca semântica: *"Encontre João Silva e suas conexões de risco"*
  - Drill-down: Clicar em nó expande relacionamentos
  - Zoom semântico: Nível de detalhe muda com o zoom

- **Visualização**:
  - Nós: Pessoas, Contas, Transações (tipos visuais distintos)
  - Arestas: Relacionamentos com labels dinâmicas
  - Estados visuais: Idle, Hover, Selected, Dimmed, Error

##### 2.2.2. CRUD Inteligente (Geração Dinâmica de UI)
- **Função**: Ao criar uma nova instância, a interface é **gerada automaticamente**
- **Processo**:
  1. Usuário clica "Criar Nova Conta Garantida"
  2. Sistema consulta definição no Back Section
  3. Agente de UI gera formulário JSON descritivo
  4. Frontend renderiza campos necessários (CPF, Imóvel, etc.)
  5. Validações são aplicadas em tempo real pelo Cérebro

##### 2.2.3. Action Hub (Smart Edges)
- **Função**: Executar ações arrastando arestas entre nós
- **Exemplo**:
  - Arrastar de "Conta A" para "Conta B" → Abre modal "Transferir"
  - Arrastar de "Cliente" para "Produto" → "Contratar Produto"

- **Processamento**: Cada ação dispara agente especialista apropriado

##### 2.2.4. Centro de Operações
- **Dashboards em Tempo Real**: Métricas calculadas pelos agentes
- **Filas de Exceção**: Transações que requerem análise humana
- **Auditoria Visual**: Timeline de eventos de um objeto

#### UX do Front Section
- **Estilo**: "Neural Network Noir" - dark theme, elementos neon, foco em dados
- **Interação**: Graph-first - navegação por conexões, não menus
- **Público**: Operadores, Gerentes, Atendimento, Auditores

---

## 3. MOTOR COGNITIVO: DESCOBERTA DINÂMICA DE AGENTES

### 3.1. Agentes NÃO São Fixos - São Descobertos pela IA

**PRINCÍPIO FUNDAMENTAL**: A plataforma **não hardcoda** quais agentes existem.

Quando a IA analisa a documentação (ex: Manual PIX do Bacen), ela **descobre** que precisa de agentes para:
- Processar transações
- Validar chaves DICT
- Integrar com SPI

Esses agentes **não existiam antes**. São **criados dinamicamente** pela própria plataforma.

#### 3.1.1. Como Funciona a Descoberta de Agentes

**INPUT**: Documentação do Bacen sobre PIX
```markdown
Manual PIX - Requisitos:
1. Sistema deve validar chave PIX antes de transação
2. Transações acima de R$ 1.000 requerem MFA
3. Comunicação com DICT via API REST
4. Integração com SPI para liquidação
```

**PROCESSAMENTO** (IA analisa e descobre):
```python
# A IA identifica "domínios funcionais" na documentação
domains_discovered = [
    "Validação de Chaves (DICT)",
    "Processamento de Transações (PIX)",
    "Autenticação Multifator (MFA)",
    "Integração Externa (SPI)"
]

# Para cada domínio, cria uma "Definição de Agente"
agent_definitions = [
    {
        "id": "agent_dict_validator",
        "domain": "Chaves PIX",
        "capabilities": ["validate_key", "query_dict_api"],
        "dependencies": ["external_api:dict.bcb.gov.br"]
    },
    {
        "id": "agent_pix_processor",
        "domain": "Transações PIX",
        "capabilities": ["initiate_pix", "validate_balance", "call_mfa_if_needed"],
        "dependencies": ["agent_dict_validator", "external_api:spi"]
    }
]
```

**OUTPUT**: Agentes são **instanciados** como containers no Kubernetes
```bash
# Criados automaticamente pela plataforma
kubectl get pods -n agents
NAME                                READY   STATUS
agent-dict-validator-7f8d9c-xyz     1/1     Running
agent-pix-processor-5b6a2d-abc      1/1     Running
agent-mfa-handler-9c3e1f-def        1/1     Running
```

#### 3.1.2. Agentes Fundamentais (Sempre Presentes)

Existem apenas **3 agentes que sempre existem** (meta-agentes):

| Agente | Função | Por que é Fixo |
|:---|:---|:---|
| **Orchestrator Agent** | Roteamento de intenções | Precisa existir para coordenar descoberta de outros |
| **Architect Agent** | Análise de documentação e criação de Objetos Base | É o "compilador" que lê docs |
| **UI Agent** | Geração dinâmica de interfaces | Único que sabe renderizar JSON → React |

**Todos os outros agentes são descobertos e criados pela IA ao analisar documentação.**

#### 3.1.3. Exemplo Concreto: "9 ou 80 Agentes?"

**Cenário 1**: Documentação fornecida cobre apenas PIX básico
- IA descobre necessidade de: **5 agentes**
  - `agent_pix_processor`
  - `agent_dict_validator`
  - `agent_balance_checker`
  - `agent_spi_integrator`
  - `agent_notification_sender`

**Cenário 2**: Documentação cobre PIX + TED + Crédito + Investimentos + Open Banking
- IA descobre necessidade de: **47 agentes**
  - Cada domínio gera múltiplos agentes especializados
  - Agentes compartilham capabilities quando há overlap

**Cenário 3**: Core Banking completo (regulação Bacen completa)
- IA pode descobrir: **100+ agentes**
  - Mas isso não importa! A plataforma escala horizontalmente
  - Agentes são stateless, podem ser replicados infinitamente

#### 3.1.4. Registro de Agentes Descobertos

A plataforma mantém um **Catálogo de Agentes** dinâmico:

```sql
-- Tabela de infraestrutura (nunca muda)
CREATE TABLE agent_definitions (
    id VARCHAR PRIMARY KEY,
    domain VARCHAR,
    capabilities JSONB,
    dependencies JSONB,
    discovered_from VARCHAR,  -- ex: "bacen_pix_manual_v3.pdf"
    created_at TIMESTAMP,
    status VARCHAR  -- ACTIVE, DEPRECATED, SUPERSEDED
);
```

Quando nova documentação é ingerida:
- IA pode **adicionar** novos agentes (nova funcionalidade)
- IA pode **deprecar** agentes (funcionalidade removida pelo Bacen)
- IA pode **atualizar** agentes (mudança de regra)

#### 3.1.3. Comunicação Inter-Agentes: Event Bus Inteligente

- **Protocolo**: Apache Pulsar (pub/sub estruturado)
- **Tópicos por Domínio**: `topic:identity`, `topic:accounts`, etc.
- **Eventos Estruturados**: JSON com `intent`, `context`, `data`
- **Orquestração Assíncrona**: Agentes respondem via eventos, não chamadas síncronas

---

### 3.2. Sistema RAG Trimodal: A "Memória do Organismo"

O RAG não é apenas recuperação de dados; é a **biblioteca de conhecimento** que todos os agentes consultam.

#### 3.2.1. PostgreSQL (SQL - Dados Estruturados)
- **Função**: Armazenar instâncias de objetos (Pessoas, Contas, Transações)
- **Schema Dinâmico**: Tabelas criadas automaticamente pelo Back Section
- **Query**: SQL gerado por agentes para validações

#### 3.2.2. NebulaGraph (Grafo - Relacionamentos)
- **Função**: Mapear conexões entre entidades
- **Exemplos**:
  - `(Pessoa)-[:POSSUI]->(Conta)`
  - `(Empresa)-[:TEM_SOCIO]->(Pessoa)`
  - `(Conta)-[:TRANSACIONOU_COM]->(Conta)`
- **Query**: Cypher-like para análise de redes (detecção de fraude)

#### 3.2.3. PgVector (Vetor - Busca Semântica)
- **Função**: Recuperar políticas e regras por similaridade semântica
- **Exemplo**:
  - Query: *"Quais regras se aplicam a transações internacionais de alto valor?"*
  - Retorna: Vetores de políticas relevantes
- **Embedding Model**: Gerado pelo LLM (Llama 3)

---

## 4. FLUXO COMPLETO: DA DEFINIÇÃO À EXECUÇÃO AUTÔNOMA

### Caso de Uso: Criação de um Novo Produto Bancário

**Cenário**: O banco quer lançar "Conta Universitária" com regras específicas.

#### FASE 1: Definição (Back Section)

1. **Arquiteto de Negócio** acessa o Back Section
2. Descreve em linguagem natural:
   > *"Uma 'Conta Universitária' é uma Conta de Pagamento destinada a estudantes entre 18-25 anos. Possui isenção de tarifas. Limite de transferência PIX: R$ 500/dia. Requer comprovante de matrícula renovado anualmente. Se o titular completar 26 anos, a conta deve ser migrada automaticamente para 'Conta Jovem'."*

3. **Agente Arquiteto** processa:
   - Extrai atributos: `idade_minima`, `idade_maxima`, `limite_pix_dia`, `isenção_tarifas`
   - Extrai regras: Validação de idade, Upload de documento, Migração automática
   - Gera esquema JSON
   - Cria tabelas/nós
   - Vetoriza regras

4. **Publicação**: Definição entra em estado "ATIVA"

#### FASE 2: Execução (Front Section)

5. **Operador** acessa Front Section
6. Busca: *"Criar nova conta para Maria Silva, estudante de Medicina"*
7. Sistema identifica: Maria tem 20 anos (elegível)
8. **UI Agent** gera formulário dinâmico:
   - CPF (pré-preenchido)
   - Upload de comprovante de matrícula (obrigatório)
   - Campos derivados de "Conta de Pagamento" (endereço, telefone)

9. **Account Agent** valida:
   - Consulta RAG: Regras de "Conta Universitária"
   - Valida documento (OCR + verificação)
   - Consulta Identity Agent: Maria existe e tem 20 anos
   - Cria instância no PostgreSQL
   - Cria nó no NebulaGraph: `(Maria)-[:POSSUI]->(Conta_Universitaria_001)`

10. **Transaction Agent** configura:
    - Limite PIX diário: R$ 500
    - Alerta agendado: "Verificar idade de Maria em 2031-12-09" (quando fizer 26 anos)

#### FASE 3: Evolução Autônoma

11. **6 anos depois**: Data de verificação chega
12. **Compliance Agent** detecta: Maria completou 26 anos
13. **Account Agent**:
    - Consulta RAG: Regra de migração
    - Ativa sub-agente de Migração
    - Cria nova instância "Conta Jovem"
    - Transfere saldo
    - Atualiza relacionamentos no Grafo
    - Notifica Maria via push notification (via UI Agent)

14. **Nenhum desenvolvedor foi acionado** em todo o processo

---

## 5. CAPACIDADES FUNCIONAIS核心 (CORE CAPABILITIES)

### 5.1. Abstração Total de Tecnologia

**Objetivo**: Especialistas de negócio não precisam saber:
- SQL, schemas, migrations
- APIs, endpoints, payloads
- Frontend frameworks, componentes
- DevOps, Kubernetes, escalabilidade

**Precisam saber apenas**: Descrever o que querem em linguagem natural

### 5.2. Evolução Sem Downtime

**Objetivo**: Modificar o sistema enquanto ele opera
- Adicionar novo tipo de objeto → Sem deploy
- Alterar regra de política → Versionamento automático
- Criar novo produto → Disponível instantaneamente no Front Section

### 5.3. NoOps (AIOps) - Auto-Gerenciamento de Infraestrutura

**Objetivo**: Sistema monitora e corrige a si mesmo

#### NoOps Agent - Capacidades Funcionais

##### Nível 1: Monitoramento Consciente
- Consome métricas de Prometheus/Grafana
- Identifica anomalias: latência, erro rate, saturação de recursos

##### Nível 2: Diagnóstico Autônomo
- Consulta RAG: "Latência alta no Account Agent geralmente indica..."
- Correlaciona eventos: "Aumento de tráfego coincide com campanha de marketing"

##### Nível 3: Ação Corretiva
- **Conservadora**: Cria alerta para equipe de Ops
- **Progressiva**: Executa ação segura (ex: escalar réplicas)
  ```bash
  kubectl scale deployment/account-agent --replicas=5
  ```
- **Avançada**: Migra workload para nós com mais recursos

##### Nível 4: Aprendizado
- Registra: "Ação X resolveu problema Y em Z minutos"
- Atualiza RAG com novo conhecimento
- Próxima vez: Ação mais rápida

### 5.4. Integrações como "Extensões Cognitivas"

**Objetivo**: Sistemas externos são consultados como "especialistas"

#### Data Rudder (Detecção de Fraude)
- **Integração**: Security Agent consulta API
- **Fluxo**:
  1. Transação de risco médio detectada internamente
  2. Security Agent pede "segunda opinião" ao Data Rudder
  3. Combina scores (interno + externo)
  4. Decide ação (aprovar, desafiar, bloquear)

#### Fácil Tech (Contabilidade Regulatória)
- **Integração**: Accounting Agent envia dados diariamente
- **Fluxo**:
  1. D+1: Extrai balancete do TigerBeetle
  2. Formata no padrão Fácil Tech
  3. Envia via SFTP/API
  4. Se houver erro (ex: CPF inválido):
     - Aciona Identity Agent para correção
     - Reenvia automaticamente

### 5.5. Interface Adaptativa (Geração Dinâmica de UI)

**Objetivo**: Zero hardcoded UI; tudo gerado baseado em definições

#### Processo de Geração

1. **Usuário** clica "Criar Novo X"
2. **UI Agent** consulta Back Section: "Quais campos X possui?"
3. Gera JSON descritivo:
   ```json
   {
     "formId": "create_conta_universitaria",
     "fields": [
       {"name": "cpf", "type": "text", "validation": "cpf_format", "required": true},
       {"name": "comprovante", "type": "file", "accept": ".pdf,.jpg", "required": true},
       {"name": "idade", "type": "number", "readonly": true, "computed": "from_cpf"}
     ],
     "actions": [
       {"label": "Criar Conta", "handler": "account_agent.create", "primary": true}
     ]
   }
   ```
4. **Frontend** (React) renderiza formulário dinamicamente
5. **Validações** executadas pelo Cérebro em tempo real

#### Benefício
- Novo campo adicionado no Back Section → Aparece automaticamente em todos os formulários relevantes
- Mudança de regra de validação → Aplicada instantaneamente

---

## 6. DIFERENCIAL COMPETITIVO: O QUE ESTA PLATAFORMA FAZ QUE NENHUMA OUTRA FAZ

### 6.1. Core Banking Tradicional vs. Plataforma Criadora

| Aspecto | Core Banking Tradicional | Nossa Plataforma |
|:---|:---|:---|
| **Criação de Produto** | Meses de desenvolvimento | Horas (descrição natural) |
| **Mudança de Regra** | Sprint, deploy, risco de bug | Imediata, versionada, reversível |
| **Interface de Usuário** | Hardcoded, rígida | Gerada dinamicamente, adaptativa |
| **Operação** | Equipe 24/7, runbooks manuais | Auto-gerenciada (NoOps) |
| **Integração de Parceiros** | APIs customizadas, integrações pesadas | Agentes especializados plug-and-play |
| **Escalabilidade** | Planejamento de capacidade manual | Auto-scaling baseado em IA |
| **Conformidade** | Auditorias reativas | Monitoramento contínuo por agentes |

### 6.2. Low-Code Platforms vs. Nossa Plataforma

| Aspecto | Low-Code (ex: OutSystems) | Nossa Plataforma |
|:---|:---|:---|
| **Abstração** | Visual builders, drag-and-drop | Linguagem natural pura |
| **Lógica de Negócio** | Ainda requer "código visual" | Interpretada por LLM |
| **Inteligência** | Opcional (add-on) | É o motor central |
| **Autonomia** | Requer operador humano | Auto-operação (AIOps) |
| **Domínio** | Genérico | Hiper-especializado (Banking) |

---

## 7. JORNADA DO USUÁRIO: PERSONAS E INTERAÇÕES

### 7.1. Arquiteto de Negócio (Back Section)

**Nome**: Carolina, Product Owner do Banco
**Objetivo**: Lançar "Conta Kids" em 2 semanas

**Jornada**:
1. Acessa Back Section
2. Conversa com Agente Arquiteto:
   - Carolina: *"Preciso de uma conta para menores de 18 anos, controlada pelos pais, com limite de gasto semanal configurável"*
   - Agente: *"Entendi. Vou criar um objeto 'Conta Kids' que herda de 'Conta de Pagamento' e adiciona os atributos: idade_titular (< 18), responsavel_legal (referência a Pessoa Física), limite_semanal (configurável). Correto?"*
   - Carolina: *"Perfeito. Adicione também: notificar responsável a cada transação"*
   - Agente: *"Adicionado regra de notificação. Deseja simular um cenário?"*
3. Simula: *"Menor tenta gastar R$ 150 mas limite semanal é R$ 100"*
4. Valida resultado: Transação bloqueada + Notificação enviada
5. Publica definição
6. **Pronto**: Em 10 minutos, produto está ativo

### 7.2. Operador (Front Section)

**Nome**: Bruno, Atendente de Backoffice
**Objetivo**: Cadastrar cliente e abrir Conta Kids

**Jornada**:
1. Busca semântica: *"Criar conta para menor João Pedro, responsável Maria Silva"*
2. Sistema identifica:
   - Maria existe no sistema
   - João Pedro é novo cadastro (menor de idade detectado por CPF)
3. UI gerada automaticamente:
   - Dados de João Pedro (nome, CPF, data nascimento)
   - Seleção de responsável legal (Maria pré-preenchida)
   - Configuração de limite semanal (slider R$ 50 - R$ 500)
4. Bruno preenche e confirma
5. **Account Agent** executa:
   - Cria PF João Pedro
   - Cria Conta Kids
   - Vincula: `(Maria)-[:RESPONSAVEL_POR]->(Joao)-[:POSSUI]->(Conta_Kids_001)`
   - Configura limite: R$ 200/semana
6. **Pronto**: Em 2 minutos, conta operacional

### 7.3. Engenheiro de Confiabilidade (NoOps Observer)

**Nome**: Rafael, SRE
**Objetivo**: Garantir que sistema opera sem ele

**Jornada**:
1. Rafael acessa dashboard Grafana
2. Nota: NoOps Agent escalou Account Agent automaticamente (3 → 7 réplicas)
3. Verifica logs do agente:
   - Detectou latência P95 > 500ms
   - Identificou causa: Campanha de marketing aumentou criação de contas
   - Ação: Scale-up preventivo
   - Resultado: Latência voltou a < 200ms
4. Rafael aprova ação retroativamente no sistema (feedback)
5. **NoOps Agent aprende**: "Campanhas de marketing → Scale preventivo"
6. **Próxima vez**: Escala **antes** da latência subir (predição)

---

## 8. TECNOLOGIAS HABILITADORAS: A STACK CRIADORA

### 8.1. Frontend (Interface Neural Sutil)

| Tecnologia | Função |
|:---|:---|
| **Next.js 14+** | Framework SSR para performance |
| **React Flow** | Visualização de grafo interativa |
| **Zustand** | State management leve |
| **Tailwind CSS** | Design system consistente |
| **Framer Motion** | Animações fluidas |

### 8.2. Backend (Microsserviços Especializados)

| Tecnologia | Função |
|:---|:---|
| **Go (Golang)** | Alta performance, baixa latência |
| **gRPC** | Comunicação inter-serviços |
| **OpenTelemetry** | Observabilidade distribuída |

### 8.3. Motor de IA (Cérebro e Agentes)

| Tecnologia | Função |
|:---|:---|
| **CrewAI** | Orquestração de agentes multi-role |
| **LangChain** | Chains para RAG e tool calling |
| **VLLM** | Inferência de LLM otimizada |
| **Llama 3 (70B)** | Modelo principal (self-hosted) |
| **BentoML** | Deploy e scaling de modelos |

### 8.4. Dados (RAG Trimodal)

| Tecnologia | Função |
|:---|:---|
| **PostgreSQL 16** | Dados estruturados + PgVector |
| **NebulaGraph** | Grafo de relacionamentos |
| **PgVector** | Embeddings para busca semântica |

### 8.5. Infraestrutura (Cloud-Native)

| Tecnologia | Função |
|:---|:---|
| **Kubernetes (K8s)** | Orquestração de containers |
| **Apache Pulsar** | Event streaming (sistema nervoso) |
| **Prometheus** | Métricas de infraestrutura |
| **Grafana** | Dashboards e alertas |
| **Loki** | Logs centralizados |

### 8.6. Braços (Conectividade Externa)

| Tecnologia | Função |
|:---|:---|
| **LB Connect** | Gateway SPI (BACEN) |
| **LB Dict** | Gestão de Chaves PIX |
| **TigerBeetle** | Ledger contábil imutável |

---

## 9. PRINCÍPIOS ARQUITETURAIS INQUEBRÁVEIS

### 9.1. 100% AI-Based
- **Regra**: Zero lógica de negócio hardcoded em código de programação
- **Implementação**: Toda regra vive no RAG, interpretada por LLMs
- **Teste**: "Se um dev pode mudar uma regra editando .go/.py, está errado"

### 9.2. Self-Hosted e Soberano
- **Regra**: Nenhuma dependência crítica de SaaS externo
- **Implementação**: LLM próprio (VLLM), bancos próprios, infra própria
- **Exceção**: Integrações opcionais (Data Rudder, Fácil Tech) são "extensões", não "core"

### 9.3. Event-Driven e Assíncrono
- **Regra**: Agentes nunca se chamam diretamente (no RPC síncrono entre agentes)
- **Implementação**: Todo "comando" é um evento no Pulsar
- **Benefício**: Resiliência, escalabilidade, auditoria completa

### 9.4. Immutable Audit Trail
- **Regra**: Toda decisão de agente e ação humana é imutável
- **Implementação**:
  - Eventos no Pulsar (retention infinito)
  - Lançamentos no TigerBeetle (append-only)
  - Logs estruturados no Loki
- **Valor**: Conformidade, debugging, machine learning

### 9.5. Zero Trust Security
- **Regra**: Nenhum componente confia em outro por padrão
- **Implementação**:
  - mTLS entre microsserviços
  - JWT com rotação automática
  - RBAC avaliado em tempo real pelo Cérebro
  - Network policies no Kubernetes

---

## 10. ROADMAP FUNCIONAL: EVOLUÇÃO DA PLATAFORMA

### FASE 1: Gênese (Meses 1-3) - "O Despertar"

**Objetivo**: Estabelecer fundação cognitiva

**Entregas Funcionais**:
- ✅ Cérebro operacional (VLLM + Llama 3 + CrewAI)
- ✅ RAG Trimodal configurado (PostgreSQL, NebulaGraph, PgVector)
- ✅ Back Section Alpha: Editor de texto natural funcional
- ✅ Primeiro agente: Agente Arquiteto cria objetos simples (Pessoa, Conta)
- ✅ Integração LB Connect (ambiente homologação)

**Critério de Sucesso**: Arquiteto consegue criar "Pessoa Física" via linguagem natural e instância é criada no banco

---

### FASE 2: Despertar (Meses 4-6) - "A Consciência"

**Objetivo**: Sistema entende objetos complexos e relacionamentos

**Entregas Funcionais**:
- ✅ Back Section Beta: Visualizador de grafo de ontologias
- ✅ Front Section Alpha: Interface Neural Sutil básica (navegação por grafo)
- ✅ CRUD inteligente: UI gerada dinamicamente para criar instâncias
- ✅ Agentes especializados: Identity, Account, Relationship
- ✅ Integrações: Data Rudder (risk scoring), Fácil Tech (contabilidade)

**Critério de Sucesso**: Operador cria cliente e conta sem ver uma linha de código, navegando apenas por grafo

---

### FASE 3: Consciência (Meses 7-9) - "A Autonomia"

**Objetivo**: Operação autônoma de fluxos financeiros

**Entregas Funcionais**:
- ✅ Transaction Agent completo: PIX end-to-end (recebimento → risco → ledger → notificação)
- ✅ Compliance Agent: Monitoramento em tempo real, detecção de suspeitas
- ✅ Smart Edges: Arrastar aresta para iniciar transação
- ✅ Busca semântica global no Front Section
- ✅ Simulador de políticas no Back Section

**Critério de Sucesso**: Sistema processa 1.000 PIX/dia com < 1% de intervenção humana

---

### FASE 4: Transcendência (Meses 10+) - "O NoOps"

**Objetivo**: Sistema se gerencia sozinho

**Entregas Funcionais**:
- ✅ NoOps Agent completo: Auto-scaling, auto-healing, auto-tuning
- ✅ Criação de novos produtos sem deploy de código
- ✅ Expansão de domínios: Crédito, Investimentos (apenas via definição natural)
- ✅ Machine Learning contínuo: Agentes aprendem com histórico

**Critério de Sucesso**:
- Time-to-market de novo produto < 1 dia
- Eficiência operacional: 1 engenheiro para cada 1M de contas
- Uptime > 99.95% sem intervenção manual

---

## 11. MÉTRICAS DE SUCESSO DA PLATAFORMA CRIADORA

### 11.1. Eficiência de Criação

| Métrica | Target | Como Medir |
|:---|:---|:---|
| **Time-to-Market de Produto** | < 24h | Tempo entre definição no Back Section e primeira instância criada |
| **Mudanças de Regra sem Deploy** | 100% | % de alterações que não geraram commit de código |
| **Acurácia de Interpretação (LLM)** | > 95% | % de definições aceitas sem correção humana |

### 11.2. Autonomia Operacional

| Métrica | Target | Como Medir |
|:---|:---|:---|
| **Intervenção Humana em Transações** | < 1% | % de transações que entram em fila manual |
| **Incidentes Resolvidos por NoOps Agent** | > 80% | % de alertas que não chegam ao PagerDuty |
| **Deployment Humano** | 0/mês | Número de deploys manuais (exceto infra inicial) |

### 11.3. Qualidade de Experiência

| Métrica | Target | Como Medir |
|:---|:---|:---|
| **Latência de Geração de UI** | < 500ms | Tempo entre "Criar X" e formulário renderizado |
| **Tempo de Navegação no Grafo** | < 200ms | Latência de expansão de nó |
| **Satisfação de Arquitetos** | > 4.5/5 | NPS de usuários do Back Section |

---

## 12. VISÃO DE FUTURO: O QUE A PLATAFORMA SE TORNARÁ

### Ano 1: Foundation
- Plataforma cria Core Banking para **um** cliente (piloto)
- Foco: Validação de conceito, refinamento de UX

### Ano 2: Expansion
- Plataforma opera Core Banking para **múltiplos** clientes
- **Multi-tenancy**: Cada cliente tem sua ontologia isolada
- Marketplace de "Templates de Produtos": Reutilização entre clientes

### Ano 3: Ecosystem
- Plataforma se torna **PaaS** (Platform-as-a-Service)
- Fintechs podem criar seus próprios bancos em horas
- **SDK de Agentes**: Desenvolvedores criam agentes customizados

### Ano 5: Singularity
- Plataforma **ensina outras IAs** a operar domínios diferentes
- Expansão para: Seguros, Saúde, Logística (qualquer domínio transacional)
- **Meta-Agente**: IA que cria novas IAs especializadas

---

## 13. CONCLUSÃO: A REVOLUÇÃO PARADIGMÁTICA

Esta plataforma não é uma **evolução** do Core Banking; é uma **revolução** no conceito de software empresarial.

### O Que Muda Para Sempre

1. **Arquitetos de Negócio se tornam Criadores Diretos**
   - Não precisam "pedir ao TI" para construir
   - Descrevem, validam, publicam

2. **Operadores se tornam Navegadores de Contexto**
   - Não seguem manuais rígidos
   - Exploram grafos, tomam decisões assistidas por IA

3. **Engenheiros se tornam Arquitetos de Sistemas Autônomos**
   - Não escrevem regras de negócio
   - Projetam agentes que interpretam regras

4. **Sistemas se tornam Organismos Vivos**
   - Não são deployados e esquecidos
   - Evoluem, aprendem, se curam

### O Objetivo Final

**Permitir que qualquer instituição financeira crie, opere e evolua seu próprio Core Banking sem escrever uma linha de código de negócio, delegando a complexidade técnica para uma inteligência artificial que nunca dorme, nunca erra por distração e sempre aprende.**

---

**Esta é a visão. Este é o objetivo. Esta é a plataforma que estamos construindo.**

---

## ANEXO: Glossário de Conceitos-Chave

| Termo | Definição |
|:---|:---|
| **Meta-Sistema** | Sistema que cria outros sistemas |
| **Ontologia Bancária** | Estrutura formal de objetos, atributos e relacionamentos de um banco |
| **Agente Especialista** | Unidade autônoma de IA responsável por um domínio específico |
| **RAG Trimodal** | Sistema de recuperação de conhecimento em 3 modalidades (SQL, Grafo, Vetor) |
| **Interface Neural Sutil** | UX baseada em navegação por grafo e contexto, não menus |
| **NoOps (AIOps)** | Operação de infraestrutura por IA, sem humanos |
| **Smart Edge** | Aresta interativa em grafo que permite iniciar ações |
| **Back Section** | Hemisfério de criação (definição de ontologias) |
| **Front Section** | Hemisfério de gestão (operação de instâncias) |
| **Event Bus** | Apache Pulsar - sistema nervoso do organismo |
| **Cérebro** | Orquestrador central de agentes |
| **Braços** | Componentes de alta performance (Ledger, BACEN) |
| **Extensões Cognitivas** | Integrações externas (Data Rudder, Fácil Tech) |

---

**Documento gerado em**: 2025-12-09
**Próxima revisão**: Após Fase 1 (validação com stakeholders)
**Responsável**: Equipe de Arquitetura de Produto

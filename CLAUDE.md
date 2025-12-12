# CLAUDE.md - Guia Definitivo de Implementação da Plataforma SuperCore

> **"Eu sou a LBPAY. Eu sei quem sou, o que faço, e como opero."** - O Oráculo

---

## 🚀 VISÃO CONSOLIDADA (LEIA PRIMEIRO)

> **⚠️ DOCUMENTO PRIMÁRIO**: Para visão técnica completa e atualizada do **AI-Driven Context Generator** e arquitetura consolidada, consulte:
>
> **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](docs/architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **ESSENCIAL**
>
> Este documento harmoniza:
> - AI-Driven Context Generator (6 fases: Oracle → Upload → Spec → Generation → Approval → Usage)
> - RAG Trimodal Híbrido (instances + embeddings)
> - 3 Pilares da Dynamic UI (FormGenerator, ProcessFlow, BacenValidation)
> - Integração com Gateways (LB Connect, LB Dict, Orchestration-GO, Money-Moving)
> - Arquitetura completa (meta-objects, workflows BPM, screen type conductor, MCP agents)
> - Roadmap completo (33 semanas/8 meses)

---

## 📚 Estrutura de Documentação

Este documento (CLAUDE.md) é o **guia central de implementação** para agents. A estrutura completa de documentação está organizada em:

### 🏗️ Arquitetura e Fundamentos (docs/architecture/)
**IMPORTANTE**: Leia SEMPRE antes de iniciar trabalho em qualquer fase
- **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](docs/architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **ESSENCIAL**: Visão técnica consolidada (AI-Driven Context Generator, RAG Híbrido, 3 Pilares)
- **[docs/architecture/visao_arquitetura.md](docs/architecture/visao_arquitetura.md)** - ⭐ Visão estratégica resumida (referencia VISAO_FINAL_CONSOLIDADA.md)
- **[docs/architecture/stack_tecnologico_fases.md](docs/architecture/stack_tecnologico_fases.md)** - ⭐ **CRÍTICO**: Stack tecnológico por fase (versões exatas, justificativas, evolução)

### 📋 Backlog e Execução (docs/backlog/)
**IMPORTANTE**: Consulte para entender status e prioridades do projeto
- **[docs/backlog/backlog_geral.md](docs/backlog/backlog_geral.md)** - Status geral de execução, pendências, progresso de cada fase

### 📍 Fase 1 - AI-Driven Context Generator (docs/fases/fase1/)
**METODOLOGIA**: Especificações → Mocks UI → Aprovação → Planejamento → Implementação

#### 📋 Documentos Essenciais (LEIA ANTES DE IMPLEMENTAR)
- **[docs/fases/fase1/01_especificacoes.md](docs/fases/fase1/01_especificacoes.md)** - ⭐⭐⭐ **CRÍTICO**: Especificações técnicas completas v2.0.0 (AI-Driven Context Generator)
  - Database schema (context_inputs, uploaded_files)
  - 6 REST endpoints (Upload, Processing, Status, Result)
  - AI Services (PDF Parser, Vision API)
  - ContextProcessorOrchestrator
  - Performance requirements

- **[docs/fases/fase1/PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](docs/fases/fase1/PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - ⭐⭐⭐ **CRÍTICO**: Sprint planning completo
  - 4 sprints (4 semanas)
  - 43 Kanban cards distribuídos entre 8 agents
  - Breakdown detalhado por sprint
  - Critérios de sucesso

- **[docs/fases/fase1/07_mocks_ui_navegacao.md](docs/fases/fase1/07_mocks_ui_navegacao.md)** - ⭐⭐⭐ **CRÍTICO**: Mocks de UI v2.0.0
  - 5 telas (Home, Novo Contexto, Lista, Detalhes, Processamento)
  - Wireframes completos
  - Componentes reutilizáveis
  - **OBRIGATÓRIO**: Aprovar antes de qualquer código frontend

- **[docs/fases/fase1/06_squad_agents.md](docs/fases/fase1/06_squad_agents.md)** - ⭐⭐ Composição da squad (8 agents) e responsabilidades

#### 📖 Documentos de Contexto
- **[docs/fases/fase1/FASE_1_REIMPLEMENTACAO_SUMARIO.md](docs/fases/fase1/FASE_1_REIMPLEMENTACAO_SUMARIO.md)** - Sumário da reimplementação (OLD Foundation → NEW AI-Driven Context Generator)
- **[docs/fases/fase1/FASE_1_ATUALIZACAO_COMPLETA.md](docs/fases/fase1/FASE_1_ATUALIZACAO_COMPLETA.md)** - Log completo de todas as atualizações feitas

### 📍 Fase 2 - Brain (docs/fases/fase2/)
**METODOLOGIA**: Especificações → Dúvidas → Aprovação → Planejamento → Implementação
- **[SUPERCORE_MCP_SERVER.md](SUPERCORE_MCP_SERVER.md)** - ⭐ **CRÍTICO**: Especificação completa do MCP Server + Action Agents
- **[MCP_IMPLEMENTATION_GUIDE.md](MCP_IMPLEMENTATION_GUIDE.md)** - ⭐ **CRÍTICO**: Guia prático de implementação do MCP Server

### 📍 Fases 3 e 4 (docs/fases/fase3/, docs/fases/fase4/)
Serão populadas seguindo a mesma metodologia após conclusão das fases anteriores.

### 📖 Guias e Exemplos
- **[README.md](README.md)** - Guia do usuário, quick start, arquitetura
- **[docs/api/examples/README.md](docs/api/examples/README.md)** - Exemplos práticos de uso da API
- **[DYNAMIC_UI_IMPLEMENTATION_COMPLETE.md](DYNAMIC_UI_IMPLEMENTATION_COMPLETE.md)** - Implementação completa do Dynamic UI (11 widgets)

---

## ⚠️ REGRA FUNDAMENTAL PARA AGENTS

### Modo de Operação: Desenvolvimento Autônomo

**Referências de autonomia**:
- **[.claude/AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md](.claude/AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md)** - Framework completo de autonomia
- **[.claude/AUTONOMOUS_MODE_GUIDE.md](.claude/AUTONOMOUS_MODE_GUIDE.md)** - Guia prático de modo autônomo

**Permissões autônomas concedidas**:
- ✅ Criar/editar/deletar arquivos dentro do projeto
- ✅ Instalar pacotes (npm, pip, go get)
- ✅ Executar testes automatizados
- ✅ Fazer commits e push (seguindo convenções)
- ✅ Criar branches, PRs, merge
- ✅ Executar builds e deploys (dev/staging)

**Restrições**:
- ❌ Deploy em produção (requer aprovação)
- ❌ Modificar .env com secrets reais
- ❌ Deletar branches principais (main, master)
- ❌ **CRÍTICO**: Implementar UI sem mocks aprovados (docs/fases/faseN/07_mocks_ui_navegacao.md)

### ⛔ REGRA INVIOLÁVEL: UI SEM MOCKS APROVADOS

**NENHUMA linha de código de UI/frontend será escrita antes de:**

1. ✅ Documento `docs/fases/faseN/07_mocks_ui_navegacao.md` completo com wireframes
2. ✅ Time de Produto aprovar todos os layouts e navegação
3. ✅ Time Técnico validar viabilidade técnica
4. ✅ Status do documento mudar para "🟢 Aprovado"

**Razão**: Evitar retrabalho massivo. Mudanças de layout/navegação DEPOIS de implementar custam 10x mais tempo.

**Processo correto**:
```
Especificações → Mocks de UI → Aprovação → Implementação
```

**Se um agent de frontend receber tarefa SEM mocks aprovados**:
- ❌ RECUSAR implementação
- ✅ INFORMAR: "Documento 07_mocks_ui_navegacao.md não está aprovado"
- ✅ SUGERIR: "Primeiro aprovar mocks, depois implementar"

### Checklist Obrigatório Antes de Implementar

**ANTES de iniciar trabalho em QUALQUER fase:**

1. ✅ Leia `docs/architecture/visao_arquitetura.md` (entenda a arquitetura universal)
2. ✅ Leia `docs/architecture/stack_tecnologico_fases.md` (stack da fase específica)
3. ✅ Leia `docs/backlog/backlog_geral.md` (status atual do projeto)
4. ✅ Leia `docs/fases/faseN/01_especificacoes.md` (especificações APROVADAS)
5. ✅ Leia `docs/fases/faseN/06_squad_agents.md` (sua responsabilidade na squad)
6. ✅ Leia `.claude/AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md` (suas permissões e limites)
7. ❌ **NUNCA implemente código sem especificações aprovadas**

**Estrutura de pastas de cada fase:**
```
docs/fases/faseN/
├── 01_especificacoes.md        # Specs técnicas (DEVE ser aprovado)
├── 02_duvidas_especificacoes.md # Dúvidas/questões sobre specs
├── 03_aprovacao.md             # Registro de aprovação formal
├── 04_planejamento_sprints.md  # Detalhamento de sprints
├── 05_composicao_squads.md     # Detalhamento da squad
├── 06_squad_agents.md          # Agents responsáveis
└── sprints/                    # Documentação de cada sprint
    ├── sprint_01/
    ├── sprint_02/
    └── ...
```

---

## 🎯 MISSÃO CRÍTICA

**Implementar uma PLATAFORMA UNIVERSAL que permita ao time de Produto e Compliance criar soluções completas (Core Banking, CRM, ERP, etc) em DIAS através de linguagem natural, sem necessidade de desenvolvedores.**

### Arquitetura Estratégica

O SuperCore é uma **plataforma abstrata** que não conhece domínios específicos:

```
┌─────────────────────────────────────────────────────┐
│         SUPERCORE (Engine Universal)                │
│         - Gestão de object_definitions              │
│         - Engine de instances                       │
│         - Engine de relacionamentos (grafo)         │
│         - FSM engine genérico                       │
│         - RAG trimodal                              │
│         - Assistente NL para criar objetos          │
└─────────────────────────────────────────────────────┘
                      ↓ é consumido por
┌─────────────────────────────────────────────────────┐
│    APLICAÇÕES ESPECÍFICAS (Portais/Soluções)       │
│    ├── LBPAY Core Banking (object_definitions      │
│    │   bancárias + portais especializados)         │
│    ├── CRM de Seguros (futuro)                     │
│    ├── Sistema Hospitalar (futuro)                 │
│    └── Qualquer outro domínio                      │
└─────────────────────────────────────────────────────┘
```

**Separação Crítica:**
- **SuperCore**: Zero lógica bancária, 100% genérico
- **LBPAY Platform**: Cria object_definitions bancárias e portais especializados
- **Outras Aplicações**: Podem usar a mesma engine para domínios diferentes

---

## 🧠 O ORÁCULO - Funcionalidade de Consciência Configurável

### Conceito Revolucionário

**O Oráculo é uma FUNCIONALIDADE do SuperCore** - uma API/estrutura genérica que permite qualquer aplicação definir sua "consciência" (identidade, contexto, integrações, políticas).

**Como funciona:**
- **SuperCore provê**: A funcionalidade/API do Oráculo (endpoints, estrutura de dados, RAG integration)
- **Aplicação configura**: O conteúdo específico (quem é, o que faz, integrações, políticas)

**Exemplo**: Quando implementamos **LBPAY Core Banking** usando SuperCore, configuramos o Oráculo para definir a consciência da aplicação:

```
Eu sou a LBPAY
├── CNPJ: 12.345.678/0001-90
├── Licenciada pelo Banco Central como Instituição de Pagamento
├── Participante Direto do PIX (ISPB: 12345678)
├── Operando sob as regulamentações:
│   ├── Circular BACEN 3.978 (PLD/FT)
│   ├── Resolução BACEN 80 (Instituições de Pagamento)
│   └── Regulamento PIX
├── Integrado com:
│   ├── BACEN SPI (Sistema de Pagamentos Instantâneos)
│   ├── TigerBeetle Ledger (Contabilidade)
│   └── Sistemas Anti-Fraude
└── Governado por políticas:
    ├── PLD/FT (limites, análises, COAF)
    ├── Risco de Crédito
    └── Compliance Regulatório
```

**Ver documentação completa**: [docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md](docs/fase1/ORACULO_CONSCIENCIA_DA_PLATAFORMA.md)

### Outros Exemplos de Configuração do Oráculo

**Sistema Hospitalar usando SuperCore:**
```
Eu sou o Hospital São Lucas
├── CNPJ: 98.765.432/0001-10
├── Licenciado pela ANS e Vigilância Sanitária
├── CNES: 1234567
├── Operando sob regulamentações:
│   ├── RDC ANVISA 63/2011
│   ├── Lei 13.787/2018 (Prontuário Eletrônico)
│   └── LGPD (dados sensíveis de saúde)
├── Integrado com:
│   ├── Sistema de Laboratórios
│   ├── Planos de Saúde (TISS)
│   └── Farmácia Central
└── Governado por políticas:
    ├── Protocolos Clínicos
    ├── Controle de Infecção Hospitalar
    └── Gestão de Leitos
```

**CRM de Seguros usando SuperCore:**
```
Eu sou a Seguradora XYZ
├── CNPJ: 11.222.333/0001-44
├── Regulada pela SUSEP
├── Código SUSEP: 12345
├── Operando sob regulamentações:
│   ├── Lei Complementar 126/2007
│   ├── Resolução CNSP 321/2015
│   └── Circular SUSEP 517/2015
├── Integrado com:
│   ├── Corretoras parceiras
│   ├── Rede de assistências 24h
│   └── Sistema de cálculo de prêmios
└── Governado por políticas:
    ├── Subscrição e análise de risco
    ├── Gestão de sinistros
    └── Compliance SUSEP
```

**A MESMA funcionalidade Oráculo, configurações DIFERENTES para cada domínio.**

### Como o Oráculo é Implementado Tecnicamente

**No SuperCore (funcionalidade genérica):**

```go
// backend/internal/handlers/oracle.go
// API GENÉRICA do Oráculo

type OracleHandler struct {
    db *sql.DB
}

// Endpoints genéricos
// GET /api/v1/oracle/identity     - Retorna identidade configurada
// GET /api/v1/oracle/licenses      - Retorna licenças/regulamentações
// GET /api/v1/oracle/integrations  - Retorna integrações configuradas
// GET /api/v1/oracle/policies      - Retorna políticas/regras
// GET /api/v1/oracle/whoami        - Síntese completa (para RAG)

func (h *OracleHandler) GetIdentity(c *gin.Context) {
    // Busca configuração do banco (tabela oracle_config)
    var identity OracleIdentity
    h.db.QueryRow("SELECT * FROM oracle_config WHERE key = 'identity'").Scan(&identity)
    c.JSON(200, identity)
}
```

**Schema do Banco (SuperCore):**

```sql
-- Tabela genérica para configuração do Oráculo
CREATE TABLE oracle_config (
    id UUID PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,  -- 'identity', 'licenses', 'integrations', 'policies'
    config JSONB NOT NULL,              -- Configuração flexível (JSON)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para queries rápidas
CREATE INDEX idx_oracle_config_key ON oracle_config(key);
```

**Na aplicação LBPAY (configuração específica):**

```typescript
// lbpay-platform/setup/configure-oracle.ts
// Script executado no setup da aplicação LBPAY

import { SuperCoreClient } from './lib/supercore-sdk';

const supercore = new SuperCoreClient('http://supercore-api:8080');

async function configureLBPayOracle() {
    // Configura IDENTIDADE
    await supercore.oracle.configure('identity', {
        cnpj: '12.345.678/0001-90',
        razao_social: 'LBPAY INSTITUIÇÃO DE PAGAMENTO S.A.',
        nome_fantasia: 'LBPay',
        ispb: '12345678',
        tipo_instituicao: 'INSTITUICAO_PAGAMENTO'
    });

    // Configura LICENÇAS/REGULAMENTAÇÕES
    await supercore.oracle.configure('licenses', [
        {
            orgao_regulador: 'BANCO_CENTRAL',
            tipo: 'INSTITUICAO_PAGAMENTO',
            numero_autorizacao: 'IP-2024-001',
            data_vigencia: '2024-01-01',
            normativas: ['Circular 3.978', 'Resolução 80', 'Regulamento PIX']
        }
    ]);

    // Configura INTEGRAÇÕES
    await supercore.oracle.configure('integrations', [
        {
            nome: 'TigerBeetle Ledger',
            tipo: 'LEDGER',
            endpoint: 'tcp://tigerbeetle:3000',
            status: 'ATIVO'
        },
        {
            nome: 'BACEN SPI',
            tipo: 'BANCO_CENTRAL',
            endpoint: 'https://api.spi.bcb.gov.br/v1',
            status: 'ATIVO'
        }
    ]);

    // Configura POLÍTICAS
    await supercore.oracle.configure('policies', [
        { tipo: 'PLD_FT', descricao: 'Políticas de prevenção à lavagem de dinheiro' },
        { tipo: 'RISCO_CREDITO', descricao: 'Análise de risco de crédito' }
    ]);

    console.log('✅ Oráculo LBPAY configurado!');
}

configureLBPayOracle();
```

**Resultado:** SuperCore agora "sabe" que está rodando a aplicação LBPAY e responde consultas ao RAG com esse contexto.

### Por Que o Oráculo é Fundamental?

1. **Identidade**: Todo sistema precisa saber quem é
2. **Governança**: Todos os objetos são governados pelo Oráculo
3. **Validação**: Limites e regras vêm do Oráculo
4. **Integração**: Configurações de integrações externas
5. **Compliance**: Políticas regulatórias centralizadas
6. **Consciência**: O RAG consulta o Oráculo para responder "quem somos"
7. **Multi-domínio**: Mesma API, diferentes contextos (Banking, Hospital, Seguros, etc)

---

## 🧬 A VERDADE FUNDAMENTAL

### Não Estamos Construindo um Core Banking

Estamos construindo uma **Máquina Universal de Gestão de Objetos** que permite implementar qualquer tipo de solução (como Core Banking e suas integrações necessárias) através de:

1. **Recebe**: Descrições em linguagem natural de objetos de negócio
2. **Gera**: Definições abstratas (`object_definitions`) com schemas, validações e FSMs
3. **Cria**: Instâncias vivas que respeitam suas definições
4. **Relaciona**: Conecta entidades através de um grafo semântico
5. **Raciocina**: RAG trimodal (SQL + Graph + Vector) que entende objetos, instâncias e correlações

**O SuperCore é uma plataforma universal abstrata** - Core Banking é apenas uma das aplicações possíveis. Outros domínios (CRM, ERP, Hospitais, Imobiliário) podem ser implementados usando a mesma engine.

### Exemplos de Domínios Possíveis

O SuperCore pode ser usado para implementar:

**1. Core Banking (LBPAY)**
- Object_definitions: `cliente_pf`, `conta_corrente`, `transacao_pix`, `regra_bacen`
- Integrações: TigerBeetle, BACEN SPI, Anti-Fraude
- Portais: BackOffice (operações), Customer (clientes)

**2. CRM de Seguros**
- Object_definitions: `segurado`, `apolice`, `sinistro`, `corretora`
- Integrações: SUSEP, Calculadoras de Prêmio, Email Marketing
- Portais: BackOffice (corretores), Customer (segurados)

**3. Sistema Hospitalar**
- Object_definitions: `paciente`, `prontuario`, `consulta`, `prescricao`
- Integrações: Laboratórios, Planos de Saúde, ANS
- Portais: BackOffice (médicos/enfermeiros), Customer (pacientes)

**4. Gestão Imobiliária**
- Object_definitions: `imovel`, `proprietario`, `contrato_locacao`, `vistoria`
- Integrações: Cartórios, Bancos (financiamento), Prefeituras
- Portais: BackOffice (imobiliária), Customer (locatários/proprietários)

**Todos usam a MESMA engine SuperCore** - apenas criam object_definitions diferentes e integrações específicas do domínio.

### A Analogia do Corpo (ESSENCIAL)

```
object_definitions = DNA/Genoma
    ↓
instances = Células Vivas
    ↓
relationships = Sinapses/Conexões
    ↓
RAG = Sistema Nervoso que entende tudo
```

**Exemplo Concreto**:

```
"Cliente" não é uma tabela.
"Cliente" é um CONCEITO (object_definition) que define:
  - Estrutura: schema JSON
  - Comportamento: FSM (estados + transições)
  - Validações: rules (CPF válido, não blacklist)
  - UI: hints (como renderizar)

Maria Silva CPF 123.456.789-01 = INSTÂNCIA de "Cliente"
João Pedro CPF 987.654.321-09 = OUTRA INSTÂNCIA de "Cliente"

Relacionamento: Maria TITULAR_DE Conta-12345
                      ↓
            Aresta no Grafo que o RAG entende
```

---

## 🚫 REGRAS INVIOLÁVEIS

### NUNCA

1. ❌ **Criar tabelas hardcoded** (`CREATE TABLE clientes` é ERRADO)
2. ❌ **Implementar lógica de negócio em código** (validação de CPF não pode estar em função Go)
3. ❌ **Fazer mock ou POC** (tudo que construímos é produção)
4. ❌ **Assumir número fixo de agentes** (são descobertos dinamicamente)
5. ❌ **Construir UI específica para "Cliente"** (UI é 100% genérica, gerada do schema)

### SEMPRE

1. ✅ **Usar `object_definitions` + `instances` + `relationships`**
2. ✅ **Validações em `validation_rules`** (tabela genérica, interpretadas em runtime)
3. ✅ **Código de produção desde a primeira linha** (zero throwaway code)
4. ✅ **UI gerada dinamicamente** a partir de JSON Schema + UI Hints
5. ✅ **RAG que navega por objetos e instâncias** como um sistema nervoso

---

## 🌐 SUPERCORE COMO META-PLATAFORMA

### A Verdade Essencial

**SuperCore NÃO é um Core Banking. SuperCore é uma META-PLATAFORMA que GERA as abstrações necessárias para CRIAR um Core Banking.**

Esta distinção é FUNDAMENTAL para todo o projeto:

```
❌ ERRADO: "SuperCore é um Core Banking"
✅ CORRETO: "SuperCore é uma plataforma que permite criar Core Bankings"

❌ ERRADO: "Vamos implementar PIX no SuperCore"
✅ CORRETO: "Vamos criar object_definitions que permitem implementar PIX"

❌ ERRADO: "SuperCore tem validação de CPF"
✅ CORRETO: "SuperCore tem validation_rules que interpretam validações de CPF"
```

### Implicações Práticas

1. **Zero Código de Negócio Hardcoded**: Toda lógica de negócio é uma `instance` de algum `object_definition`
2. **Tudo é Dado**: Regras, integrações, algoritmos, workflows → tudo vive em `instances`
3. **UI Genérica**: Frontend nunca sabe o que é "Cliente" ou "Conta", apenas renderiza schemas
4. **Reutilização Total**: Cada abstração serve para N casos de uso
5. **Evolução Sem Deploy**: Mudanças de negócio = criar/editar instances, não código

### Módulos Externos

SuperCore é o **núcleo de gestão de objetos**, mas não implementa diretamente:

- **LB Connect**: Integração com BACEN SPI (Sistema de Pagamentos Instantâneos - PIX)
- **LB Dict**: Integração com DICT API (Diretório de Identificadores de Contas Transacionais)
- **Orchestration-GO**: Sistema de Sagas e orquestração de transações distribuídas
- **Money-Moving**: Core de movimentação financeira e processamento de pagamentos

Estes módulos CONSOMEM as abstrações criadas no SuperCore (`object_definitions`, `instances`, `relationships`) através de APIs bem definidas.

### O Padrão de Abstração

**Toda implementação segue este padrão:**

```
1. Criar object_definition (abstrato, genérico, reutilizável)
   ↓
2. Criar instances específicas (BACEN, CVM, Receita, etc.)
   ↓
3. Sistema executa instances usando engine genérico
   ↓
4. Zero código específico no core
```

**Exemplos:**

```
object_definition: "crawler_source"
  ↓ instances:
  - "BACEN Website"
  - "CVM Instruções"
  - "Receita Federal API"
  - "ViaCEP"

object_definition: "regra_bacen"
  ↓ instances:
  - "Circular 3.978 - PLD/FT"
  - "Resolução 80 - Instituições de Pagamento"
  - "Manual PIX - Limites Noturnos"

object_definition: "integracao_externa"
  ↓ instances:
  - "TigerBeetle Ledger"
  - "BACEN SPI (PIX)"
  - "Data Rudder (Anti-Fraude)"
```

---

## 🏗️ ARQUITETURA DA PLATAFORMA

### Camada 0: Meta-Objetos (Regras, Políticas, Integrações, Manuais)

**REVELAÇÃO CRÍTICA**: Objetos não são apenas DADOS. São também REGRAS, POLÍTICAS, INTEGRAÇÕES e CONHECIMENTO REGULATÓRIO.

#### Princípio Fundamental de Validação

**SuperCore valida ESTRUTURA. Aplicações validam NEGÓCIO.**

```
┌────────────────────────────────────────────────────────────┐
│  SuperCore (Validação Estrutural)                          │
├────────────────────────────────────────────────────────────┤
│  ✅ Schema JSON válido (tipos, required fields)            │
│  ✅ Formato de dados (CPF tem 11 dígitos, email válido)    │
│  ✅ Transições FSM permitidas                              │
│  ✅ Relationships válidos conforme object_definition        │
│  ❌ NÃO valida: saldo suficiente, limites BACEN, risco     │
└────────────────────────────────────────────────────────────┘
                          ↓ fornece dados para
┌────────────────────────────────────────────────────────────┐
│  Aplicação (ex: LBPAY - Validação de Negócio)             │
├────────────────────────────────────────────────────────────┤
│  ✅ Busca regras BACEN (instances de regra_bacen)          │
│  ✅ Interpreta condições e aplica lógica                   │
│  ✅ Valida saldo, limites, estado da conta                 │
│  ✅ Chama integrações externas quando necessário           │
│  ✅ Decide orquestração de operações                       │
└────────────────────────────────────────────────────────────┘
```

**SuperCore armazena conhecimento regulatório como objetos relacionáveis, mas NÃO interpreta regras de negócio. As aplicações buscam essas regras e decidem quando/como aplicá-las.**

#### Objetos de Conhecimento e Governança

```
┌──────────────────────────────────────────────────────────┐
│         CAMADA META: Objetos que Governam                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  object_definition: "manual_bacen"                       │
│  ├─ instance: "Manual PIX v8.3"                          │
│  ├─ instance: "Circular 3.978 - PLD/FT (texto completo)"│
│  ├─ instance: "Resolução 4.753 - KYC (texto completo)"  │
│  └─ instance: "Manual Tarifas BACEN v2024"              │
│  │                                                       │
│  │  Relacionamentos: regras podem referenciar manuais   │
│  │  RAG consulta: assistente responde com base nos docs│
│  │  Versionamento: manuais antigos ficam no histórico  │
│  │                                                       │
│  └─────────────────────────────────────────────────────┐│
│                                                          ││
│  object_definition: "regra_bacen"                        ││
│  ├─ instance: "Limite PIX Noturno"                      ││
│  │   ├─ relationship BASEADA_EM → "Manual PIX v8.3"     ││
│  │   └─ campo: fonte_legal_id, secao_referencia        ││
│  ├─ instance: "Validação Documento KYC"                 ││
│  │   └─ relationship BASEADA_EM → "Resolução 4.753"    ││
│  └─ instance: "Formato Chave PIX"                       ││
│      └─ relationship BASEADA_EM → "Manual PIX v8.3"     ││
│                                                          ││
│  Aplicações (LBPAY) BUSCAM e INTERPRETAM estas regras   ││
│  SuperCore apenas ARMAZENA e RELACIONA                   ││
└──────────────────────────────────────────────────────────┘│
                        ↓ podem ser usados por              │
┌──────────────────────────────────────────────────────────┐│
│  Objetos de Negócio (LBPAY ou qualquer app)             ││
│                                                          ││
│  instance: transacao_pix_123                             ││
│  ├─ LBPAY busca: regras vigentes com dominio='PIX'      ││
│  ├─ LBPAY interpreta: condicoes e parametros            ││
│  ├─ LBPAY valida: se transação respeita limites         ││
│  └─ Se violar: busca manual fonte para explicar         ││
│                                                          ││
│  SuperCore NÃO executa validação de negócio             ││
│  SuperCore fornece: regras, manuais, relacionamentos    ││
└──────────────────────────────────────────────────────────┘│
                                                            │
┌──────────────────────────────────────────────────────────┤
│  object_definition: "politica_risco_interna"            │
│  ├─ instance: "Aprovação Automática Premium"            │
│  ├─ instance: "Score Anti-Fraude V3"                    │
│  └─ instance: "Limites Transacionais por Segmento"      │
│                                                          │
│  object_definition: "integracao_externa"                │
│  ├─ instance: "TigerBeetle Ledger"                      │
│  ├─ instance: "BACEN - SPI (PIX)"                       │
│  ├─ instance: "Data Rudder (Anti-Fraude)"               │
│  ├─ instance: "Fácil Tech (Contabilidade)"              │
│  └─ instance: "ViaCEP"                                   │
│                                                          │
│  object_definition: "logica_negocio_customizada"        │
│  ├─ instance: "Algoritmo Score Crédito Interno"         │
│  └─ instance: "Cálculo Tarifas Dinâmico"                │
│                                                          │
└──────────────────────────────────────────────────────────┘
                        ↓ GOVERNAM
┌──────────────────────────────────────────────────────────┐
│      CAMADA DE DADOS: Objetos de Entidades               │
├──────────────────────────────────────────────────────────┤
│  object_definition: "cliente_pf"                         │
│  object_definition: "conta_corrente"                     │
│  object_definition: "transacao_pix"                      │
│                                                          │
│  Instances OBEDECEM as regras/políticas acima            │
└──────────────────────────────────────────────────────────┘
```

#### Tipo 0: Manuais BACEN (Conhecimento Regulatório como Objetos + RAG)

**ARQUITETURA HÍBRIDA**: SuperCore armazena manuais como instances + indexa embeddings para RAG.

**Por que híbrido é melhor:**
1. **Estruturado**: Rastreabilidade, versionamento (states), relationships
2. **RAG**: Busca semântica via embeddings, LLM pode explicar
3. **Compliance**: Auditoria sabe EXATAMENTE qual versão foi usada
4. **Flexível**: Uso direto (regras) OU busca semântica (assistente)

**Duplo propósito:**
- **Instances (PostgreSQL)**: Estrutura formal com states, versioning, relationships
- **Embeddings (pgvector)**: Busca semântica rápida para RAG

```json
// object_definition: manual_bacen
{
  "name": "manual_bacen",
  "display_name": "Manual/Circular BACEN",
  "description": "Documentação oficial do Banco Central (manuais, circulares, resoluções)",
  "schema": {
    "type": "object",
    "properties": {
      "tipo_documento": {
        "type": "string",
        "enum": ["CIRCULAR", "RESOLUCAO", "MANUAL", "COMUNICADO", "INSTRUCAO_NORMATIVA"]
      },
      "codigo": {
        "type": "string",
        "description": "Ex: Circular 3.978, Manual PIX v8.3"
      },
      "titulo": {"type": "string"},
      "data_publicacao": {"type": "string", "format": "date"},
      "data_vigencia_inicio": {"type": "string", "format": "date"},
      "data_vigencia_fim": {"type": "string", "format": "date"},
      "conteudo_completo": {
        "type": "string",
        "description": "Texto completo do documento (para RAG)"
      },
      "secoes": {
        "type": "array",
        "description": "Seções do documento indexadas",
        "items": {
          "type": "object",
          "properties": {
            "numero": {"type": "string"},
            "titulo": {"type": "string"},
            "conteudo": {"type": "string"},
            "embeddings": {"type": "array", "items": {"type": "number"}}
          }
        }
      },
      "link_oficial": {"type": "string", "format": "uri"},
      "versao": {"type": "string"}
    }
  },
  "states": {
    "initial": "RASCUNHO",
    "states": ["RASCUNHO", "VIGENTE", "REVOGADO", "SUBSTITUIDO"],
    "transitions": [
      {"from": "RASCUNHO", "to": "VIGENTE", "trigger": "publicar"},
      {"from": "VIGENTE", "to": "REVOGADO", "trigger": "revogar"},
      {"from": "VIGENTE", "to": "SUBSTITUIDO", "trigger": "substituir"}
    ]
  }
}
```

**Exemplo de Instance:**

```json
{
  "object_definition_id": "uuid-manual-bacen",
  "data": {
    "tipo_documento": "MANUAL",
    "codigo": "Manual PIX v8.3",
    "titulo": "Manual de Uso do PIX - Versão 8.3",
    "data_publicacao": "2024-01-15",
    "data_vigencia_inicio": "2024-02-01",
    "conteudo_completo": "...texto completo de 300 páginas...",
    "secoes": [
      {
        "numero": "4.2",
        "titulo": "Limites de Valor por Horário",
        "conteudo": "No período noturno (20h-6h), o limite máximo para transferências PIX é de R$ 1.000,00 por transação...",
        "embeddings": [0.123, 0.456, 0.789, ...] // Para busca semântica
      },
      {
        "numero": "4.3",
        "titulo": "Validação de Chaves PIX",
        "conteudo": "Chaves PIX devem seguir os formatos: CPF, CNPJ, email, telefone ou chave aleatória...",
        "embeddings": [0.321, 0.654, 0.987, ...]
      }
    ],
    "link_oficial": "https://www.bcb.gov.br/estabilidadefinanceira/pix",
    "versao": "v8.3"
  },
  "current_state": "VIGENTE"
}
```

**Como Usar:**

```typescript
// 1. LBPAY busca manual quando precisa de contexto
const manual = await supercore.instances.list({
  object_definition_id: 'manual_bacen',
  filters: {
    'data.codigo': 'Manual PIX v8.3',
    current_state: 'VIGENTE'
  }
});

// 2. RAG consulta manuais para responder perguntas
const resposta = await supercore.rag.query({
  question: "Qual o limite de PIX no horário noturno?",
  context: { object_types: ['manual_bacen'], filters: { current_state: 'VIGENTE' } }
});
// Resposta: "De acordo com o Manual PIX v8.3 (Seção 4.2), o limite é R$ 1.000,00"

// 3. Auditoria mostra fonte legal de uma rejeição
const fundamentacao = {
  documento: manual.data.codigo,
  secao: "4.2",
  texto: manual.data.secoes.find(s => s.numero === "4.2").conteudo,
  link: manual.data.link_oficial
};
```

#### Tipo 1: Regras BACEN (Regras Executáveis Baseadas em Manuais)

**CRÍTICO**: Regras são **interpretadas por LBPAY**, não pelo SuperCore. SuperCore apenas armazena e relaciona.

```json
// object_definition: regra_bacen
{
  "name": "regra_bacen",
  "display_name": "Regra Operacional BACEN",
  "description": "Regras interpretáveis extraídas de manuais BACEN",
  "schema": {
    "type": "object",
    "properties": {
      "nome_regra": {"type": "string"},
      "dominio": {
        "type": "string",
        "enum": ["PIX", "TED", "KYC", "AML", "LIMITES", "TARIFAS"]
      },
      "tipo_regra": {
        "type": "string",
        "enum": ["VALIDACAO", "LIMITE", "CALCULO", "CONDICAO", "ALERTA"]
      },
      "condicao": {
        "type": "string",
        "description": "Expressão executável: valor > 1000 AND horario BETWEEN '20:00' AND '06:00'"
      },
      "acao": {
        "type": "string",
        "enum": ["BLOQUEAR", "ALERTAR", "EXIGIR_APROVACAO", "APLICAR_TARIFA", "REGISTRAR_LOG"]
      },
      "parametros": {
        "type": "object",
        "description": "Valores configuráveis",
        "properties": {
          "limite_noturno": {"type": "number"},
          "limite_diurno": {"type": "number"}
        }
      },
      "mensagem_erro": {"type": "string"},

      // ⚡ RELACIONAMENTO COM MANUAL (rastreabilidade)
      "fonte_legal_id": {
        "type": "string",
        "description": "ID da instance de manual_bacen que originou esta regra"
      },
      "secao_referencia": {
        "type": "string",
        "description": "Ex: Seção 4.2.1, Artigo 5º"
      }
    }
  },
  "relationships": [
    {
      "type": "BASEADA_EM",
      "target_object": "manual_bacen",
      "cardinality": "MANY_TO_ONE",
      "description": "Regra é baseada em manual BACEN"
    }
  ]
}
```

**Exemplo de Instance + Relacionamento:**

```typescript
// 1. Criar regra executável
const regraLimitePix = await supercore.instances.create({
  object_definition_id: 'regra_bacen',
  data: {
    nome_regra: 'Limite PIX Período Noturno',
    dominio: 'PIX',
    tipo_regra: 'LIMITE',
    condicao: 'valor > parametros.limite_noturno AND (hora >= 20 OR hora < 6)',
    acao: 'BLOQUEAR',
    parametros: {
      limite_noturno: 1000, // R$ 1.000
      limite_diurno: 5000    // R$ 5.000
    },
    mensagem_erro: 'Valor excede limite BACEN para período noturno',
    fonte_legal_id: manualPix.id, // Referência ao manual
    secao_referencia: 'Seção 4.2'
  },
  current_state: 'VIGENTE'
});

// 2. Criar relacionamento (grafo)
await supercore.relationships.create({
  relationship_type: 'BASEADA_EM',
  source_instance_id: regraLimitePix.id,
  target_instance_id: manualPix.id,
  properties: {
    secao: '4.2',
    pagina: 42,
    criada_em: new Date().toISOString()
  }
});
```

**Como LBPAY Usa (Interpreta e Aplica):**

```typescript
// LBPAY valida transação PIX buscando e interpretando regras
async function validarTransacaoPix(transacao: Instance) {
  // 1. LBPAY busca regras vigentes
  const regrasPix = await supercore.instances.list({
    object_definition_id: 'regra_bacen',
    filters: {
      'data.dominio': 'PIX',
      current_state: 'VIGENTE'
    }
  });

  // 2. LBPAY interpreta cada regra
  for (const regra of regrasPix.items) {
    const contexto = {
      valor: transacao.data.valor,
      hora: new Date().getHours(),
      parametros: regra.data.parametros
    };

    // 3. LBPAY executa condição (usando biblioteca expr-eval)
    const violou = await executarCondicao(regra.data.condicao, contexto);

    if (violou) {
      // 4. LBPAY busca manual fonte para fundamentação legal
      const manual = await supercore.instances.get(regra.data.fonte_legal_id);

      throw new Error({
        tipo: 'VIOLACAO_REGRA_BACEN',
        regra: regra.data.nome_regra,
        mensagem: regra.data.mensagem_erro,
        fundamentacao: {
          documento: manual.data.codigo,
          secao: regra.data.secao_referencia,
          link: manual.data.link_oficial
        }
      });
    }
  }
}
```

**SuperCore NÃO executa validação de negócio. LBPAY busca regras, interpreta condições e decide ações.**

#### Tipo 2: Políticas Internas (Governança)

```json
// object_definition
{
  "name": "politica_risco_interna",
  "display_name": "Política de Risco Interna",
  "description": "Políticas criadas pelo time de Risco/Compliance/Produto",
  "schema": {
    "type": "object",
    "properties": {
      "nome_politica": {"type": "string"},
      "area_responsavel": {"type": "string", "enum": ["RISCO", "COMPLIANCE", "FRAUDE", "CREDITO", "PRODUTO"]},
      "criterios": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "nome_criterio": {"type": "string"},
            "condicao": {"type": "string"},
            "score_impacto": {"type": "number", "minimum": 0, "maximum": 100},
            "acao_recomendada": {"type": "string", "enum": ["APROVAR", "REVISAR_MANUAL", "REJEITAR", "SOLICITAR_DOCS"]}
          }
        }
      },
      "versao": {"type": "string"},
      "aprovada_por": {"type": "string"},
      "data_aprovacao": {"type": "string", "format": "date"}
    }
  }
}
```

#### Tipo 3: Integrações Externas (Serviços como Objetos)

**CRÍTICO**: Integrações com TigerBeetle, BACEN, Anti-Fraude, Contabilidade são OBJETOS!

```json
// object_definition
{
  "name": "integracao_externa",
  "display_name": "Integração com Serviço Externo",
  "description": "Configuração de integração com sistemas externos (APIs, ledgers, serviços)",
  "schema": {
    "type": "object",
    "properties": {
      "nome_servico": {"type": "string"},
      "categoria": {
        "type": "string",
        "enum": ["LEDGER", "BANCO_CENTRAL", "ANTI_FRAUDE", "CONTABILIDADE", "API_PUBLICA", "WEBHOOK"]
      },
      "tipo_integracao": {
        "type": "string",
        "enum": ["REST_API", "GRPC", "GRAPHQL", "WEBHOOK", "TCP_SOCKET", "MESSAGE_QUEUE"]
      },
      "config_conexao": {
        "type": "object",
        "properties": {
          "base_url": {"type": "string", "format": "uri"},
          "auth_type": {"type": "string", "enum": ["API_KEY", "OAUTH2", "JWT", "MTLS", "BASIC_AUTH"]},
          "credentials": {"type": "object", "description": "Armazenado criptografado"},
          "timeout_ms": {"type": "integer", "default": 5000},
          "retry_policy": {
            "type": "object",
            "properties": {
              "max_retries": {"type": "integer", "default": 3},
              "backoff_strategy": {"type": "string", "enum": ["LINEAR", "EXPONENTIAL"]}
            }
          }
        }
      },
      "endpoints": {
        "type": "array",
        "description": "Mapeamento de operações",
        "items": {
          "type": "object",
          "properties": {
            "operacao": {"type": "string", "description": "Ex: criar_transacao, consultar_saldo"},
            "metodo": {"type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
            "path": {"type": "string"},
            "headers": {"type": "object"},
            "body_template": {"type": "string", "description": "Template com variáveis: {{valor}}, {{cpf}}"},
            "response_mapping": {"type": "object", "description": "Como mapear response para nosso schema"}
          }
        }
      },
      "healthcheck": {
        "type": "object",
        "properties": {
          "endpoint": {"type": "string"},
          "intervalo_segundos": {"type": "integer", "default": 60},
          "timeout_ms": {"type": "integer", "default": 2000}
        }
      },
      "circuit_breaker": {
        "type": "object",
        "properties": {
          "enabled": {"type": "boolean", "default": true},
          "failure_threshold": {"type": "integer", "default": 5},
          "reset_timeout_segundos": {"type": "integer", "default": 60}
        }
      }
    }
  }
}
```

**Exemplo de Instance - TigerBeetle:**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "TigerBeetle Ledger",
    "categoria": "LEDGER",
    "tipo_integracao": "TCP_SOCKET",
    "config_conexao": {
      "base_url": "tcp://tigerbeetle:3000",
      "auth_type": "MTLS",
      "credentials": {
        "cert_path": "/secrets/tigerbeetle-client.crt",
        "key_path": "/secrets/tigerbeetle-client.key"
      },
      "timeout_ms": 3000,
      "retry_policy": {
        "max_retries": 3,
        "backoff_strategy": "EXPONENTIAL"
      }
    },
    "endpoints": [
      {
        "operacao": "criar_transferencia",
        "metodo": "POST",
        "path": "/transfers",
        "body_template": "{\"id\": \"{{transfer_id}}\", \"debit_account_id\": \"{{origem_id}}\", \"credit_account_id\": \"{{destino_id}}\", \"amount\": {{valor}}, \"ledger\": 1, \"code\": 1}",
        "response_mapping": {
          "success_field": "status",
          "success_value": "committed",
          "error_field": "error"
        }
      },
      {
        "operacao": "consultar_saldo",
        "metodo": "GET",
        "path": "/accounts/{{account_id}}/balance",
        "response_mapping": {
          "balance_field": "debits_posted - credits_posted"
        }
      }
    ],
    "healthcheck": {
      "endpoint": "/health",
      "intervalo_segundos": 30,
      "timeout_ms": 1000
    },
    "circuit_breaker": {
      "enabled": true,
      "failure_threshold": 5,
      "reset_timeout_segundos": 60
    }
  },
  "current_state": "ATIVO"
}
```

**Exemplo de Instance - BACEN SPI (PIX):**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "BACEN - SPI (Sistema de Pagamentos Instantâneos)",
    "categoria": "BANCO_CENTRAL",
    "tipo_integracao": "REST_API",
    "config_conexao": {
      "base_url": "https://api.spi.bcb.gov.br/v1",
      "auth_type": "MTLS",
      "credentials": {
        "cert_path": "/secrets/bacen-pix.crt",
        "key_path": "/secrets/bacen-pix.key",
        "ispb": "12345678"
      },
      "timeout_ms": 10000,
      "retry_policy": {
        "max_retries": 2,
        "backoff_strategy": "LINEAR"
      }
    },
    "endpoints": [
      {
        "operacao": "enviar_pix",
        "metodo": "POST",
        "path": "/pix",
        "headers": {
          "x-correlationID": "{{correlation_id}}",
          "x-idempotencyKey": "{{idempotency_key}}"
        },
        "body_template": "{\"valor\": \"{{valor}}\", \"chave\": \"{{chave_destino}}\", \"infoPagador\": \"{{info}}\"}"
      },
      {
        "operacao": "consultar_chave",
        "metodo": "GET",
        "path": "/dict/key/{{chave}}",
        "response_mapping": {
          "owner_field": "owner.taxIdNumber",
          "account_field": "account.number"
        }
      },
      {
        "operacao": "webhook_pix_recebido",
        "metodo": "POST",
        "path": "/webhooks/pix/received",
        "body_template": "{{raw_bacen_payload}}"
      }
    ],
    "healthcheck": {
      "endpoint": "/health",
      "intervalo_segundos": 120,
      "timeout_ms": 5000
    }
  },
  "current_state": "ATIVO"
}
```

**Exemplo de Instance - Data Rudder (Anti-Fraude):**

```json
{
  "object_definition_id": "uuid-integracao-externa",
  "data": {
    "nome_servico": "Data Rudder - Detecção de Fraude",
    "categoria": "ANTI_FRAUDE",
    "tipo_integracao": "REST_API",
    "config_conexao": {
      "base_url": "https://api.datarudder.com/v2",
      "auth_type": "API_KEY",
      "credentials": {
        "api_key": "{{ENCRYPTED:datarudder_api_key}}",
        "api_secret": "{{ENCRYPTED:datarudder_secret}}"
      },
      "timeout_ms": 3000
    },
    "endpoints": [
      {
        "operacao": "avaliar_risco_transacao",
        "metodo": "POST",
        "path": "/risk-score",
        "body_template": "{\"transaction\": {\"amount\": {{valor}}, \"timestamp\": \"{{timestamp}}\", \"device_id\": \"{{device_id}}\"}, \"user\": {\"cpf\": \"{{cpf}}\", \"account_age_days\": {{account_age}}}}",
        "response_mapping": {
          "score_field": "risk_score",
          "recommendation_field": "action",
          "factors_field": "risk_factors"
        }
      },
      {
        "operacao": "reportar_fraude_confirmada",
        "metodo": "POST",
        "path": "/feedback/fraud",
        "body_template": "{\"transaction_id\": \"{{transaction_id}}\", \"fraud_type\": \"{{tipo}}\", \"confirmed_at\": \"{{timestamp}}\"}"
      }
    ]
  },
  "current_state": "ATIVO"
}
```

**Como o Sistema Usa Integrações:**

```go
// IntegrationManager.go
// Sistema genérico que executa QUALQUER integração

func (m *IntegrationManager) ExecuteOperation(ctx context.Context, serviceName, operation string, params map[string]interface{}) (interface{}, error) {
    // 1. BUSCA A INSTANCE DA INTEGRAÇÃO
    integration, err := m.getIntegration(serviceName)
    if err != nil {
        return nil, err
    }

    // 2. ENCONTRA O ENDPOINT DA OPERAÇÃO
    var endpoint *Endpoint
    for _, ep := range integration.Data["endpoints"].([]interface{}) {
        e := ep.(map[string]interface{})
        if e["operacao"].(string) == operation {
            endpoint = &e
            break
        }
    }

    // 3. RENDERIZA BODY TEMPLATE COM PARÂMETROS
    bodyTemplate := endpoint["body_template"].(string)
    body := m.renderTemplate(bodyTemplate, params)

    // 4. EXECUTA REQUEST (com retry, timeout, circuit breaker)
    response, err := m.httpClient.Do(ctx, HTTPRequest{
        Method:  endpoint["metodo"].(string),
        URL:     integration.Data["config_conexao"]["base_url"].(string) + endpoint["path"].(string),
        Headers: endpoint["headers"],
        Body:    body,
        Timeout: integration.Data["config_conexao"]["timeout_ms"].(int),
    })

    // 5. MAPEIA RESPONSE USANDO response_mapping
    result := m.mapResponse(response, endpoint["response_mapping"])

    return result, nil
}

// Exemplo de uso:
// Criar transferência no TigerBeetle
result, err := integrationMgr.ExecuteOperation(ctx, "TigerBeetle Ledger", "criar_transferencia", map[string]interface{}{
    "transfer_id": uuid.New(),
    "origem_id": contaOrigem.TigerBeetleAccountID,
    "destino_id": contaDestino.TigerBeetleAccountID,
    "valor": 10000, // R$ 100.00 em centavos
})

// Avaliar risco de transação no Data Rudder
riskResult, err := integrationMgr.ExecuteOperation(ctx, "Data Rudder - Detecção de Fraude", "avaliar_risco_transacao", map[string]interface{}{
    "valor": 5000,
    "timestamp": time.Now().Format(time.RFC3339),
    "device_id": req.DeviceID,
    "cpf": cliente.CPF,
    "account_age": cliente.AccountAgeDays(),
})

riskScore := riskResult["score_field"].(float64)
if riskScore > 75 {
    return errors.New("Transação bloqueada por alto risco de fraude")
}
```

#### Tipo 4: Fontes de Dados Externas (Crawlers e Monitores como Objetos)

**CRÍTICO**: Crawlers, monitores e integrações com sites externos são OBJETOS!

Esta é a implementação do **Sprint 15-16**: criar abstrações genéricas para monitorar qualquer fonte externa.

```json
// object_definition
{
  "name": "crawler_source",
  "display_name": "Fonte de Dados Externa (Crawler/API)",
  "description": "Define uma fonte externa de dados que pode ser monitorada periodicamente",
  "category": "MONITORING",
  "schema": {
    "type": "object",
    "required": ["nome", "tipo", "url_base", "frequencia_verificacao"],
    "properties": {
      "nome": {"type": "string"},
      "tipo": {
        "type": "string",
        "enum": ["WEBSITE_HTML", "RSS_FEED", "REST_API", "GRAPHQL_API", "SOAP_API"]
      },
      "url_base": {"type": "string", "format": "uri"},
      "frequencia_verificacao": {
        "type": "object",
        "properties": {
          "tipo": {"type": "string", "enum": ["CRON", "INTERVAL"]},
          "expressao": {"type": "string", "description": "'0 8 * * *' ou intervalo em segundos"}
        }
      },
      "regras_extracao": {
        "type": "array",
        "description": "Regras para extrair dados estruturados",
        "items": {
          "type": "object",
          "properties": {
            "campo": {"type": "string"},
            "seletor": {"type": "string", "description": "CSS, XPath, JSONPath, ou Regex"},
            "tipo_seletor": {"type": "string", "enum": ["CSS", "XPATH", "JSONPATH", "REGEX"]}
          }
        }
      },
      "condicoes_mudanca": {
        "type": "array",
        "description": "Condições que indicam mudança relevante",
        "items": {
          "type": "object",
          "properties": {
            "campo": {"type": "string"},
            "tipo_comparacao": {
              "type": "string",
              "enum": ["VALOR_DIFERENTE", "NOVO_ITEM", "ITEM_REMOVIDO", "TEXTO_CONTEM"]
            }
          }
        }
      },
      "acoes_apos_mudanca": {
        "type": "array",
        "description": "Ações quando mudança detectada",
        "items": {
          "type": "object",
          "properties": {
            "tipo_acao": {
              "type": "string",
              "enum": ["NOTIFICAR_SLACK", "ENVIAR_EMAIL", "CRIAR_TASK", "CHAMAR_WEBHOOK", "DOWNLOAD_ARQUIVO"]
            },
            "config": {"type": "object"}
          }
        }
      },
      "config_avancada": {
        "type": "object",
        "properties": {
          "timeout_segundos": {"type": "integer", "default": 30},
          "max_retries": {"type": "integer", "default": 3},
          "javascript_enabled": {
            "type": "boolean",
            "default": false,
            "description": "Usa navegador headless (Playwright) se true"
          }
        }
      }
    }
  },
  "states": {
    "initial": "CONFIGURADO",
    "states": ["CONFIGURADO", "ATIVO", "PAUSADO", "ERRO", "DESATIVADO"],
    "transitions": [
      {"from": "CONFIGURADO", "to": "ATIVO", "event": "ativar"},
      {"from": "ATIVO", "to": "PAUSADO", "event": "pausar"},
      {"from": "PAUSADO", "to": "ATIVO", "event": "retomar"},
      {"from": "ATIVO", "to": "ERRO", "event": "erro_critico"},
      {"from": "ERRO", "to": "ATIVO", "event": "resolver_erro"}
    ]
  }
}
```

**Exemplo de Instance - BACEN Website Crawler:**

```json
{
  "object_definition_id": "uuid-crawler-source",
  "data": {
    "nome": "BACEN - Normas e Regulamentações Publicadas",
    "tipo": "WEBSITE_HTML",
    "url_base": "https://www.bcb.gov.br/estabilidadefinanceira/buscanormas",
    "frequencia_verificacao": {
      "tipo": "CRON",
      "expressao": "0 8 * * *"
    },
    "regras_extracao": [
      {
        "campo": "numero_normativo",
        "seletor": ".resultado-busca .numero-norma",
        "tipo_seletor": "CSS"
      },
      {
        "campo": "titulo",
        "seletor": ".resultado-busca .titulo-norma",
        "tipo_seletor": "CSS"
      },
      {
        "campo": "data_publicacao",
        "seletor": ".resultado-busca .data",
        "tipo_seletor": "CSS"
      },
      {
        "campo": "link_pdf",
        "seletor": ".resultado-busca a.download-pdf",
        "tipo_seletor": "CSS"
      }
    ],
    "condicoes_mudanca": [
      {
        "campo": "numero_normativo",
        "tipo_comparacao": "NOVO_ITEM"
      }
    ],
    "acoes_apos_mudanca": [
      {
        "tipo_acao": "NOTIFICAR_SLACK",
        "config": {
          "canal": "#compliance-alertas",
          "mensagem_template": "🚨 Nova norma BACEN: {{numero_normativo}} - {{titulo}}\n📄 Link: {{link_pdf}}"
        }
      },
      {
        "tipo_acao": "CRIAR_TASK",
        "config": {
          "tipo_task": "parse_document_task",
          "parametros": {
            "url": "{{link_pdf}}",
            "document_type": "circular"
          }
        }
      },
      {
        "tipo_acao": "DOWNLOAD_ARQUIVO",
        "config": {
          "url_campo": "link_pdf",
          "destino_pasta": "/data/bacen_docs"
        }
      }
    ],
    "config_avancada": {
      "user_agent": "SuperCore-Monitor/1.0",
      "timeout_segundos": 30,
      "max_retries": 3,
      "javascript_enabled": false
    }
  },
  "current_state": "ATIVO",
  "metadata": {
    "ultima_verificacao": "2024-01-15T08:00:00Z",
    "proxima_verificacao": "2024-01-16T08:00:00Z",
    "mudancas_detectadas": 3,
    "total_verificacoes": 487
  }
}
```

**Exemplo de Instance - CVM Instruções Monitor:**

```json
{
  "object_definition_id": "uuid-crawler-source",
  "data": {
    "nome": "CVM - Instruções e Pareceres",
    "tipo": "WEBSITE_HTML",
    "url_base": "https://www.cvm.gov.br/legislacao/instrucoes",
    "frequencia_verificacao": {
      "tipo": "CRON",
      "expressao": "0 */6 * * *"
    },
    "regras_extracao": [
      {
        "campo": "numero_instrucao",
        "seletor": "//table[@class='instrucoes']//td[1]",
        "tipo_seletor": "XPATH"
      },
      {
        "campo": "assunto",
        "seletor": "//table[@class='instrucoes']//td[2]",
        "tipo_seletor": "XPATH"
      }
    ],
    "acoes_apos_mudanca": [
      {
        "tipo_acao": "ENVIAR_EMAIL",
        "config": {
          "destinatarios": ["compliance@lbpay.com"],
          "assunto": "Nova Instrução CVM: {{numero_instrucao}}",
          "corpo_template": "Foi publicada nova instrução CVM:\n\nNúmero: {{numero_instrucao}}\nAssunto: {{assunto}}"
        }
      }
    ]
  },
  "current_state": "ATIVO"
}
```

**Exemplo de Instance - ViaCEP API Monitor:**

```json
{
  "object_definition_id": "uuid-crawler-source",
  "data": {
    "nome": "ViaCEP - API de Consulta de CEPs",
    "tipo": "REST_API",
    "url_base": "https://viacep.com.br/ws",
    "frequencia_verificacao": {
      "tipo": "INTERVAL",
      "expressao": "300"
    },
    "regras_extracao": [
      {
        "campo": "status",
        "seletor": "$.status",
        "tipo_seletor": "JSONPATH"
      },
      {
        "campo": "latency_ms",
        "seletor": "$.response_time",
        "tipo_seletor": "JSONPATH"
      }
    ],
    "condicoes_mudanca": [
      {
        "campo": "status",
        "tipo_comparacao": "VALOR_DIFERENTE",
        "valor_referencia": "online"
      }
    ],
    "acoes_apos_mudanca": [
      {
        "tipo_acao": "NOTIFICAR_SLACK",
        "config": {
          "canal": "#infraestrutura-alertas",
          "mensagem_template": "⚠️ ViaCEP API está indisponível!\nStatus: {{status}}"
        }
      }
    ]
  },
  "current_state": "ATIVO"
}
```

**Como o Sistema Usa Crawlers:**

```go
// CrawlerExecutor.go
// Sistema genérico que executa QUALQUER crawler

type CrawlerExecutor struct {
    instanceRepo  *InstanceRepository
    httpClient    *http.Client
    playwrightCtx *playwright.BrowserContext
}

func (e *CrawlerExecutor) ExecuteCrawler(ctx context.Context, instanceID uuid.UUID) (*CrawlerResult, error) {
    // 1. BUSCA A INSTANCE DO CRAWLER
    instance, err := e.instanceRepo.GetByID(ctx, instanceID)
    if err != nil {
        return nil, err
    }

    data := instance.Data

    // 2. FETCH CONTENT (baseado no tipo)
    var content string
    switch data["tipo"].(string) {
    case "WEBSITE_HTML":
        if data["config_avancada"]["javascript_enabled"].(bool) {
            // Usa Playwright para páginas com JavaScript
            content, err = e.fetchWithPlaywright(ctx, data["url_base"].(string))
        } else {
            // HTTP simples para páginas estáticas
            content, err = e.fetchWithHTTP(ctx, data["url_base"].(string))
        }
    case "REST_API":
        content, err = e.fetchAPI(ctx, data)
    case "RSS_FEED":
        content, err = e.fetchRSS(ctx, data["url_base"].(string))
    }

    if err != nil {
        return nil, err
    }

    // 3. EXTRAI DADOS USANDO REGRAS
    extractedData, err := e.extractData(content, data["regras_extracao"])

    // 4. DETECTA MUDANÇAS
    changes, err := e.detectChanges(ctx, instanceID, extractedData, data["condicoes_mudanca"])

    // 5. EXECUTA AÇÕES SE HOUVER MUDANÇAS
    if len(changes) > 0 {
        err = e.executeActions(ctx, data["acoes_apos_mudanca"], extractedData, changes)
    }

    // 6. ATUALIZA METADATA DA INSTANCE
    instance.Metadata["ultima_verificacao"] = time.Now()
    instance.Metadata["mudancas_detectadas"] = len(changes)
    e.instanceRepo.Update(ctx, instance)

    return &CrawlerResult{
        InstanceID:       instanceID,
        ChangesDetected:  len(changes),
        ExtractedData:    extractedData,
    }, nil
}

func (e *CrawlerExecutor) extractData(content string, rules []interface{}) (map[string]interface{}, error) {
    extracted := make(map[string]interface{})

    for _, rule := range rules {
        r := rule.(map[string]interface{})
        campo := r["campo"].(string)
        seletor := r["seletor"].(string)
        tipoSeletor := r["tipo_seletor"].(string)

        var value string
        switch tipoSeletor {
        case "CSS":
            value = e.extractCSS(content, seletor)
        case "XPATH":
            value = e.extractXPath(content, seletor)
        case "JSONPATH":
            value = e.extractJSONPath(content, seletor)
        case "REGEX":
            value = e.extractRegex(content, seletor)
        }

        extracted[campo] = value
    }

    return extracted, nil
}
```

#### Tipo 5: Lógicas de Negócio Customizadas (Algoritmos como Objetos)

```json
// object_definition
{
  "name": "logica_negocio_customizada",
  "display_name": "Lógica de Negócio Customizada",
  "description": "Algoritmos proprietários e lógicas específicas da empresa",
  "schema": {
    "type": "object",
    "properties": {
      "nome_algoritmo": {"type": "string"},
      "descricao": {"type": "string"},
      "linguagem": {"type": "string", "enum": ["javascript", "python", "lua", "cel", "expr"]},
      "codigo_fonte": {
        "type": "string",
        "description": "Código executável (sandboxed)"
      },
      "inputs": {
        "type": "object",
        "description": "JSON Schema dos inputs esperados"
      },
      "output": {
        "type": "object",
        "description": "JSON Schema do output"
      },
      "testes": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "nome_teste": {"type": "string"},
            "input": {"type": "object"},
            "output_esperado": {"type": "object"}
          }
        }
      }
    }
  }
}
```

**Exemplo de Instance - Cálculo de Tarifas Dinâmico:**

```json
{
  "object_definition_id": "uuid-logica-customizada",
  "data": {
    "nome_algoritmo": "Cálculo Tarifas Dinâmico por Segmento",
    "descricao": "Calcula tarifas baseado no segmento do cliente, volume mensal e tipo de transação",
    "linguagem": "javascript",
    "codigo_fonte": `
      function calcularTarifa(transacao, cliente, historico_mensal) {
        const segmento = cliente.segmento;
        const volumeMensal = historico_mensal.reduce((sum, t) => sum + t.valor, 0);
        const tipoTransacao = transacao.tipo;

        // Tabela de tarifas base
        const tarifasBase = {
          'PIX': { 'VAREJO': 0.99, 'PREMIUM': 0, 'PRIVATE': 0 },
          'TED': { 'VAREJO': 10.90, 'PREMIUM': 5.00, 'PRIVATE': 0 },
          'BOLETO': { 'VAREJO': 3.50, 'PREMIUM': 2.00, 'PRIVATE': 0 }
        };

        let tarifa = tarifasBase[tipoTransacao][segmento];

        // Desconto progressivo por volume
        if (volumeMensal > 50000) {
          tarifa *= 0.7; // 30% desconto
        } else if (volumeMensal > 20000) {
          tarifa *= 0.85; // 15% desconto
        }

        // Isenção para valores pequenos (PIX)
        if (tipoTransacao === 'PIX' && transacao.valor < 10) {
          tarifa = 0;
        }

        return {
          tarifa_calculada: Math.round(tarifa * 100) / 100,
          tarifa_base: tarifasBase[tipoTransacao][segmento],
          desconto_aplicado: volumeMensal > 20000,
          isento: tarifa === 0,
          detalhamento: {
            segmento: segmento,
            volume_mensal: volumeMensal,
            tipo_transacao: tipoTransacao
          }
        };
      }
    `,
    "inputs": {
      "type": "object",
      "properties": {
        "transacao": {"type": "object"},
        "cliente": {"type": "object"},
        "historico_mensal": {"type": "array"}
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "tarifa_calculada": {"type": "number"},
        "isento": {"type": "boolean"},
        "detalhamento": {"type": "object"}
      }
    }
  },
  "current_state": "ATIVO"
}
```

### Por Que Isso é Revolucionário?

1. **Time de Compliance cria regras BACEN sem devs**: Lê a Circular 3.978 e cria uma instance de `regra_bacen` via assistente.

2. **Time de Risco atualiza políticas em minutos**: Mudou o critério de aprovação? Edita a instance de `politica_risco_interna`.

3. **Novas integrações sem deploy**: Precisa conectar com um novo serviço? Cria uma instance de `integracao_externa`.

4. **Monitores de N fontes externas**: Precisa monitorar CVM, Receita Federal, BACEN? Cria instances de `crawler_source` para cada fonte. Um único `object_definition` serve para TODOS os casos.

5. **Algoritmos versionados como dados**: Score de crédito V3? Nova instance de `logica_negocio_customizada`. V2 continua disponível.

6. **Auditoria completa**: Toda mudança de regra/política fica em `state_history`. Rastreabilidade total.

### Sprint 15-16: Abstract Crawler & Monitor System

**Objetivo**: Criar abstrações que permitam monitorar QUALQUER fonte externa (websites, APIs, RSS feeds) e reagir a mudanças.

**Entregas**:
1. ✅ `object_definition: crawler_source` - Abstração genérica para fontes externas
2. ✅ `object_definition: monitor_target` - Alvos de monitoramento com SLAs
3. ✅ `object_definition: data_extraction_rule` - Regras de extração reutilizáveis
4. ✅ CrawlerExecutor engine (Go) - Engine genérico que executa qualquer crawler
5. ✅ CrawlerScheduler (Go) - Agendador com suporte a CRON e interval
6. ✅ Frontend Dashboard (TypeScript/React) - Interface para gerenciar crawlers
7. ✅ Suporte a múltiplos formatos: HTML (goquery), JavaScript (Playwright), REST API, RSS, GraphQL
8. ✅ Change Detection: Diff-based com múltiplos tipos de comparação
9. ✅ Action System: Slack, Email, Task creation, Webhook, File download

**Instances Exemplo**:
- BACEN Website Crawler (normas e circulares)
- CVM Monitor (instruções e pareceres)
- Receita Federal API (consulta CNPJ)
- ViaCEP API Health Monitor

**Ver documentação completa**: [SPRINT_15_16_ABSTRACT_CRAWLER_MONITOR_REVISION.md](SPRINT_15_16_ABSTRACT_CRAWLER_MONITOR_REVISION.md)

---

## 🔄 ARQUITETURA HÍBRIDA: Instances + Embeddings

### Por Que Híbrido?

A arquitetura híbrida combina o melhor de dois mundos:

**1. Structured Data (PostgreSQL Instances)**
- Rastreabilidade formal (quem criou, quando, versão)
- Versionamento via FSM (RASCUNHO → VIGENTE → REVOGADO)
- Relationships explícitos (regra → BASEADA_EM → manual)
- Auditoria completa via `state_history`

**2. Unstructured Search (pgvector Embeddings)**
- Busca semântica ("Como funciona o limite PIX noturno?")
- RAG pode explicar regras com contexto do manual original
- LLM sintetiza respostas naturais
- Funciona mesmo quando estrutura não está perfeita

### Tabela de Embeddings

```sql
-- TABELA: document_embeddings (para RAG)
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referência à instance original (manual_bacen, regra_bacen, etc)
    source_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    source_object_type VARCHAR(100),  -- "manual_bacen", "regra_bacen"

    -- Chunk de texto (seção do manual, parte da regra)
    content TEXT NOT NULL,
    chunk_index INT,  -- Ordem dentro do documento original

    -- Metadados estruturados
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Ex: {"codigo": "Circular 3.978", "secao": "4.2", "vigencia": "2024-01-01"}

    -- Vector embedding (1536 dimensões para OpenAI text-embedding-3-small)
    embedding vector(1536) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca vetorial (HNSW - mais rápido)
CREATE INDEX idx_document_embeddings_vector
ON document_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Índice para filtrar por tipo de objeto
CREATE INDEX idx_document_embeddings_object_type
ON document_embeddings(source_object_type);

-- Índice GIN para busca em metadados
CREATE INDEX idx_document_embeddings_metadata
ON document_embeddings USING GIN (metadata jsonb_path_ops);
```

### Fluxo de Ingestão de Manuais BACEN

```typescript
// DocumentIngestionService.ts
// Processa manuais BACEN e cria instances + embeddings

import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';

interface ManualSection {
  numero: string;
  titulo: string;
  conteudo: string;
}

interface ManualBACEN {
  codigo: string;
  titulo: string;
  data_publicacao: string;
  link_oficial: string;
  conteudo_completo: string;
  secoes: ManualSection[];
}

class DocumentIngestionService {
  constructor(
    private supercoreAPI: SupercoreClient,
    private openai: OpenAI,
    private db: PostgresClient
  ) {}

  /**
   * Pipeline completo: PDF → Instance + Embeddings
   */
  async ingestManualBACEN(pdfUrl: string): Promise<string> {
    // 1. EXTRAIR TEXTO DO PDF
    const pdfText = await this.extractPDFText(pdfUrl);

    // 2. PARSEAR ESTRUTURA (LLM identifica seções)
    const manual = await this.parseManualStructure(pdfText);

    // 3. CRIAR INSTANCE NO SUPERCORE
    const instanceId = await this.createManualInstance(manual);

    // 4. GERAR EMBEDDINGS PARA CADA SEÇÃO
    await this.createEmbeddings(instanceId, manual);

    // 5. TRANSIÇÃO DE ESTADO (RASCUNHO → VIGENTE)
    await this.supercoreAPI.instances.transition(instanceId, {
      to_state: 'VIGENTE',
      comment: 'Manual processado e indexado'
    });

    return instanceId;
  }

  /**
   * Cria instance de manual_bacen no SuperCore
   */
  private async createManualInstance(manual: ManualBACEN): Promise<string> {
    const response = await this.supercoreAPI.instances.create({
      object_definition_id: await this.getObjectDefId('manual_bacen'),
      data: {
        codigo: manual.codigo,
        titulo: manual.titulo,
        data_publicacao: manual.data_publicacao,
        link_oficial: manual.link_oficial,
        conteudo_completo: manual.conteudo_completo,
        secoes: manual.secoes.map(s => ({
          numero: s.numero,
          titulo: s.titulo,
          conteudo: s.conteudo,
          // NÃO armazena embeddings aqui (muito grande)
        }))
      },
      current_state: 'RASCUNHO'
    });

    return response.id;
  }

  /**
   * Gera embeddings para cada seção e salva em document_embeddings
   */
  private async createEmbeddings(
    instanceId: string,
    manual: ManualBACEN
  ): Promise<void> {
    for (let i = 0; i < manual.secoes.length; i++) {
      const secao = manual.secoes[i];

      // Chunk de texto (limitar a ~1000 tokens)
      const chunks = this.splitIntoChunks(secao.conteudo, 1000);

      for (let j = 0; j < chunks.length; j++) {
        const chunk = chunks[j];

        // Gera embedding via OpenAI
        const embeddingResponse = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: `${manual.titulo} - ${secao.titulo}\n\n${chunk}`,
          encoding_format: 'float'
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Salva no PostgreSQL
        await this.db.query(`
          INSERT INTO document_embeddings (
            source_instance_id,
            source_object_type,
            content,
            chunk_index,
            metadata,
            embedding
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          instanceId,
          'manual_bacen',
          chunk,
          i * 100 + j,  // Índice global único
          JSON.stringify({
            codigo: manual.codigo,
            titulo: manual.titulo,
            secao_numero: secao.numero,
            secao_titulo: secao.titulo,
            data_publicacao: manual.data_publicacao,
            link: manual.link_oficial
          }),
          JSON.stringify(embedding)  // pgvector aceita array JSON
        ]);
      }
    }
  }

  /**
   * Divide texto em chunks de N tokens
   */
  private splitIntoChunks(text: string, maxTokens: number): string[] {
    // Implementação simplificada (produção usaria tiktoken)
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += maxTokens) {
      chunks.push(words.slice(i, i + maxTokens).join(' '));
    }

    return chunks;
  }

  /**
   * Usa LLM para identificar estrutura do manual
   */
  private async parseManualStructure(text: string): Promise<ManualBACEN> {
    const prompt = `Você é um especialista em documentos regulatórios do BACEN.

Extraia as seguintes informações do texto abaixo:
1. Código do normativo (ex: "Circular 3.978")
2. Título completo
3. Data de publicação
4. Seções principais (título e conteúdo de cada)

Retorne JSON no formato:
{
  "codigo": "...",
  "titulo": "...",
  "data_publicacao": "YYYY-MM-DD",
  "secoes": [
    {"numero": "1", "titulo": "...", "conteudo": "..."},
    ...
  ]
}

TEXTO:
${text}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content!);
  }
}
```

### RAG com Busca Híbrida

```python
# rag_hybrid_search.py
# Busca semântica + filtros estruturados

import openai
from pgvector.psycopg import register_vector
import psycopg

class HybridRAG:
    def __init__(self, db_conn_string: str):
        self.conn = psycopg.connect(db_conn_string)
        register_vector(self.conn)
        self.openai = openai.OpenAI()

    async def search(
        self,
        question: str,
        filters: dict = None,
        limit: int = 5
    ) -> list[dict]:
        """
        Busca híbrida:
        1. Gera embedding da pergunta
        2. Busca vetorial (similaridade)
        3. Aplica filtros estruturados (metadata)
        """

        # 1. GERAR EMBEDDING DA PERGUNTA
        embedding_response = await self.openai.embeddings.create(
            model='text-embedding-3-small',
            input=question
        )
        question_embedding = embedding_response.data[0].embedding

        # 2. MONTAR QUERY COM FILTROS
        where_clauses = []
        params = [question_embedding, limit]
        param_index = 3

        if filters:
            if filters.get('codigo'):
                where_clauses.append(f"metadata->>'codigo' = ${param_index}")
                params.append(filters['codigo'])
                param_index += 1

            if filters.get('secao'):
                where_clauses.append(f"metadata->>'secao_numero' = ${param_index}")
                params.append(filters['secao'])
                param_index += 1

            if filters.get('vigente_apos'):
                where_clauses.append(f"(metadata->>'data_publicacao')::date >= ${param_index}")
                params.append(filters['vigente_apos'])
                param_index += 1

        where_clause = " AND " + " AND ".join(where_clauses) if where_clauses else ""

        # 3. EXECUTAR BUSCA VETORIAL
        query = f"""
            SELECT
                de.id,
                de.content,
                de.metadata,
                i.data as instance_data,
                1 - (de.embedding <=> $1::vector) as similarity
            FROM document_embeddings de
            JOIN instances i ON de.source_instance_id = i.id
            WHERE de.source_object_type = 'manual_bacen'
                {where_clause}
            ORDER BY de.embedding <=> $1::vector
            LIMIT $2
        """

        cursor = self.conn.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()

        return [
            {
                'content': row[1],
                'metadata': row[2],
                'instance_data': row[3],
                'similarity': row[4]
            }
            for row in results
        ]

    async def answer_question(self, question: str) -> str:
        """
        Pipeline completo: Busca → Contexto → LLM
        """

        # 1. BUSCA HÍBRIDA
        results = await self.search(question, limit=5)

        if not results:
            return "Não encontrei informações relevantes nos manuais BACEN."

        # 2. MONTAR CONTEXTO
        context_parts = []
        for i, result in enumerate(results, 1):
            meta = result['metadata']
            context_parts.append(f"""
[Fonte {i}]
Manual: {meta['titulo']} ({meta['codigo']})
Seção: {meta['secao_numero']} - {meta['secao_titulo']}
Vigência: {meta['data_publicacao']}

{result['content']}

---
""")

        context = "\n".join(context_parts)

        # 3. LLM SINTETIZA RESPOSTA
        prompt = f"""Você é um especialista em regulamentação bancária do BACEN.

PERGUNTA DO USUÁRIO:
{question}

CONTEXTO DOS MANUAIS BACEN:
{context}

INSTRUÇÕES:
- Responda com base APENAS no contexto fornecido
- Cite o código do normativo e seção quando relevante
- Se o contexto não for suficiente, seja honesto
- Use linguagem clara e objetiva

RESPOSTA:"""

        response = await self.openai.chat.completions.create(
            model='gpt-4-turbo-preview',
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.2
        )

        answer = response.choices[0].message.content

        # 4. INCLUIR FONTES
        sources = "\n\nFontes:\n" + "\n".join([
            f"- {r['metadata']['codigo']} - {r['metadata']['titulo']} (Seção {r['metadata']['secao_numero']})"
            for r in results
        ])

        return answer + sources

# Exemplo de uso
rag = HybridRAG("postgresql://user:pass@localhost/supercore")

# Busca simples
answer = await rag.answer_question(
    "Qual o limite para transferências PIX no período noturno?"
)
print(answer)
# Output: "De acordo com a Circular 3.978, Seção 4.2, o limite para
#          transferências PIX entre 20h e 6h é de R$ 1.000,00 por
#          transação para clientes pessoa física..."

# Busca com filtros estruturados
results = await rag.search(
    question="limites de transferência",
    filters={
        'codigo': 'Circular 3.978',
        'vigente_apos': '2024-01-01'
    }
)
```

### Uso Dual: Estruturado + RAG

```typescript
// Exemplo: LBPAY valida transação PIX

// CASO 1: Busca estruturada (regras executáveis)
async function validarTransacaoPix(transacao: Transacao) {
  // Busca regras vigentes para PIX
  const regras = await supercore.instances.list({
    object_definition: 'regra_bacen',
    filters: {
      'data.dominio': 'PIX',
      'current_state': 'VIGENTE'
    }
  });

  for (const regra of regras) {
    // Interpreta condição executável
    const condicao = regra.data.condicao;
    const resultado = avaliarCondicao(condicao, {
      valor: transacao.valor,
      hora: new Date().getHours(),
      parametros: regra.data.parametros
    });

    if (!resultado.valido) {
      // Busca fundamentação no manual (RAG)
      const explicacao = await rag.answer_question(
        `Por que existe ${regra.data.nome_regra}?`
      );

      throw new Error(`
        ${resultado.mensagem}

        Fundamentação Legal:
        ${explicacao}
      `);
    }
  }
}

// CASO 2: Assistente explica regra (RAG)
async function explicarRegraPix(pergunta: string) {
  // RAG busca semanticamente nos manuais
  const resposta = await rag.answer_question(pergunta);
  return resposta;
}

// Usuário pergunta: "Por que não posso transferir R$ 5.000 às 22h?"
const explicacao = await explicarRegraPix(
  "Por que existe limite de R$ 1.000 para PIX noturno?"
);
// Output: "A Circular 3.978 estabelece limites reduzidos no período
//          noturno (20h-6h) como medida de segurança para prevenir
//          fraudes. O limite de R$ 1.000 busca equilibrar conveniência
//          e proteção..."
```

### Vantagens da Arquitetura Híbrida

| Aspecto | Structured (Instances) | Unstructured (Embeddings) | Híbrido |
|---------|------------------------|---------------------------|---------|
| **Rastreabilidade** | ✅ Total | ❌ Nenhuma | ✅ Total |
| **Versionamento** | ✅ FSM + states | ❌ Nenhum | ✅ FSM + states |
| **Busca Semântica** | ❌ Fraca | ✅ Excelente | ✅ Excelente |
| **Compliance/Auditoria** | ✅ Perfeito | ❌ Ruim | ✅ Perfeito |
| **LLM Explica Regras** | ❌ Limitado | ✅ Ótimo | ✅ Ótimo |
| **Execução de Regras** | ✅ Direto (condicao) | ❌ Impossível | ✅ Direto |
| **Relationships** | ✅ Grafo | ❌ Nenhum | ✅ Grafo |
| **Custo de Sync** | Baixo | Baixo | Médio (2 writes) |

**Conclusão**: Híbrido é superior para Core Banking regulado.

---

## 🔄 SINCRONIZAÇÃO AUTOMÁTICA: Instances ↔ Embeddings

### Princípio Fundamental

**Quando uma instance de `manual_bacen` ou `regra_bacen` é criada/atualizada/deletada, os embeddings DEVEM ser sincronizados automaticamente.**

### Estratégias de Sincronização

#### Opção 1: Event-Driven (RECOMENDADO para produção)

```go
// backend/internal/events/instance_events.go
// Sistema de eventos para sincronização automática

package events

import (
    "context"
    "encoding/json"
)

type InstanceEvent struct {
    Type       string      // "CREATED", "UPDATED", "DELETED", "STATE_CHANGED"
    InstanceID string
    ObjectType string      // "manual_bacen", "regra_bacen"
    Data       interface{}
    PreviousData interface{} // Para UPDATED
    Timestamp  time.Time
}

// EventBus publica eventos para consumers
type EventBus interface {
    Publish(ctx context.Context, event InstanceEvent) error
    Subscribe(objectType string, handler func(InstanceEvent) error) error
}

// PostgreSQL LISTEN/NOTIFY (baixa latência, sem infraestrutura extra)
type PostgresEventBus struct {
    db *sql.DB
}

func (bus *PostgresEventBus) Publish(ctx context.Context, event InstanceEvent) error {
    payload, _ := json.Marshal(event)

    _, err := bus.db.ExecContext(ctx, `
        NOTIFY instance_events, $1
    `, string(payload))

    return err
}

func (bus *PostgresEventBus) Subscribe(objectType string, handler func(InstanceEvent) error) error {
    listener := pq.NewListener(bus.connString, 10*time.Second, time.Minute, nil)

    err := listener.Listen("instance_events")
    if err != nil {
        return err
    }

    go func() {
        for notification := range listener.Notify {
            var event InstanceEvent
            json.Unmarshal([]byte(notification.Extra), &event)

            // Filtra por tipo de objeto
            if event.ObjectType == objectType || objectType == "*" {
                handler(event)
            }
        }
    }()

    return nil
}
```

```go
// backend/internal/services/embedding_sync_service.go
// Serviço que escuta eventos e sincroniza embeddings

package services

type EmbeddingSyncService struct {
    eventBus          EventBus
    embeddingClient   *OpenAIClient
    db                *sql.DB
}

func NewEmbeddingSyncService(bus EventBus, openai *OpenAIClient, db *sql.DB) *EmbeddingSyncService {
    svc := &EmbeddingSyncService{
        eventBus: bus,
        embeddingClient: openai,
        db: db,
    }

    // Subscreve eventos de manual_bacen
    bus.Subscribe("manual_bacen", svc.handleManualEvent)

    // Subscreve eventos de regra_bacen
    bus.Subscribe("regra_bacen", svc.handleRegraEvent)

    return svc
}

func (svc *EmbeddingSyncService) handleManualEvent(event InstanceEvent) error {
    ctx := context.Background()

    switch event.Type {
    case "CREATED":
        return svc.createEmbeddings(ctx, event.InstanceID, event.Data)

    case "UPDATED":
        // Estratégia: Delete + Recreate (mais simples e seguro)
        if err := svc.deleteEmbeddings(ctx, event.InstanceID); err != nil {
            return err
        }
        return svc.createEmbeddings(ctx, event.InstanceID, event.Data)

    case "DELETED":
        return svc.deleteEmbeddings(ctx, event.InstanceID)

    case "STATE_CHANGED":
        // Se mudou para REVOGADO, marca embeddings como inativos
        if event.Data.(map[string]interface{})["new_state"] == "REVOGADO" {
            return svc.deactivateEmbeddings(ctx, event.InstanceID)
        }
    }

    return nil
}

func (svc *EmbeddingSyncService) createEmbeddings(ctx context.Context, instanceID string, data interface{}) error {
    manual := data.(map[string]interface{})
    secoes := manual["secoes"].([]interface{})

    for i, secao := range secoes {
        s := secao.(map[string]interface{})
        conteudo := s["conteudo"].(string)

        // Chunk do texto
        chunks := chunkText(conteudo, 1000)

        for j, chunk := range chunks {
            // Gera embedding
            embedding, err := svc.embeddingClient.CreateEmbedding(ctx, chunk)
            if err != nil {
                return fmt.Errorf("failed to create embedding: %w", err)
            }

            // Salva no banco
            _, err = svc.db.ExecContext(ctx, `
                INSERT INTO document_embeddings (
                    source_instance_id,
                    source_object_type,
                    content,
                    chunk_index,
                    metadata,
                    embedding
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, instanceID, "manual_bacen", chunk, i*100+j,
               buildMetadata(manual, s),
               pgvector.NewVector(embedding))
        }
    }

    return nil
}

func (svc *EmbeddingSyncService) deleteEmbeddings(ctx context.Context, instanceID string) error {
    _, err := svc.db.ExecContext(ctx, `
        DELETE FROM document_embeddings
        WHERE source_instance_id = $1
    `, instanceID)

    return err
}

func (svc *EmbeddingSyncService) deactivateEmbeddings(ctx context.Context, instanceID string) error {
    // Adiciona flag no metadata indicando que está revogado
    _, err := svc.db.ExecContext(ctx, `
        UPDATE document_embeddings
        SET metadata = jsonb_set(metadata, '{revogado}', 'true'::jsonb)
        WHERE source_instance_id = $1
    `, instanceID)

    return err
}
```

```go
// backend/internal/handlers/instance.go
// Handler que publica eventos ao criar/atualizar instances

func (h *InstanceHandler) CreateInstance(c *gin.Context) {
    // ... validação e criação da instance ...

    instance, err := h.service.CreateInstance(ctx, req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // PUBLICA EVENTO para sincronização
    h.eventBus.Publish(ctx, events.InstanceEvent{
        Type:       "CREATED",
        InstanceID: instance.ID,
        ObjectType: instance.ObjectDefinition.Name,
        Data:       instance.Data,
        Timestamp:  time.Now(),
    })

    c.JSON(201, instance)
}

func (h *InstanceHandler) UpdateInstance(c *gin.Context) {
    instanceID := c.Param("id")

    // Busca estado anterior
    previousInstance, _ := h.service.GetInstance(ctx, instanceID)

    // ... validação e atualização ...

    updatedInstance, err := h.service.UpdateInstance(ctx, instanceID, req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // PUBLICA EVENTO
    h.eventBus.Publish(ctx, events.InstanceEvent{
        Type:         "UPDATED",
        InstanceID:   instanceID,
        ObjectType:   updatedInstance.ObjectDefinition.Name,
        Data:         updatedInstance.Data,
        PreviousData: previousInstance.Data,
        Timestamp:    time.Now(),
    })

    c.JSON(200, updatedInstance)
}

func (h *InstanceHandler) TransitionState(c *gin.Context) {
    instanceID := c.Param("id")

    // ... transição de estado ...

    // PUBLICA EVENTO de mudança de estado
    h.eventBus.Publish(ctx, events.InstanceEvent{
        Type:       "STATE_CHANGED",
        InstanceID: instanceID,
        ObjectType: instance.ObjectDefinition.Name,
        Data: map[string]interface{}{
            "previous_state": req.FromState,
            "new_state":      req.ToState,
            "comment":        req.Comment,
        },
        Timestamp: time.Now(),
    })

    c.JSON(200, instance)
}
```

#### Opção 2: Background Job (Alternativa mais simples)

```go
// backend/internal/workers/embedding_sync_worker.go
// Worker que roda periodicamente e sincroniza embeddings desatualizados

package workers

type EmbeddingSyncWorker struct {
    db              *sql.DB
    embeddingClient *OpenAIClient
    interval        time.Duration
}

func (w *EmbeddingSyncWorker) Start(ctx context.Context) {
    ticker := time.NewTicker(w.interval) // Ex: 5 minutos
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            w.syncOutdatedEmbeddings(ctx)
        case <-ctx.Done():
            return
        }
    }
}

func (w *EmbeddingSyncWorker) syncOutdatedEmbeddings(ctx context.Context) error {
    // Busca instances de manual_bacen atualizadas recentemente
    // que NÃO têm embeddings ou estão desatualizados

    rows, err := w.db.QueryContext(ctx, `
        SELECT i.id, i.data, i.updated_at
        FROM instances i
        LEFT JOIN document_embeddings de ON de.source_instance_id = i.id
        WHERE i.object_definition_id IN (
            SELECT id FROM object_definitions
            WHERE name IN ('manual_bacen', 'regra_bacen')
        )
        AND i.is_deleted = false
        AND (
            de.id IS NULL  -- Sem embeddings
            OR de.updated_at < i.updated_at  -- Embeddings desatualizados
        )
        GROUP BY i.id
    `)

    if err != nil {
        return err
    }
    defer rows.Close()

    for rows.Next() {
        var instanceID string
        var data map[string]interface{}
        var updatedAt time.Time

        rows.Scan(&instanceID, &data, &updatedAt)

        // Delete embeddings antigos
        w.db.ExecContext(ctx, `
            DELETE FROM document_embeddings
            WHERE source_instance_id = $1
        `, instanceID)

        // Recria embeddings
        w.createEmbeddings(ctx, instanceID, data)
    }

    return nil
}
```

### Comparação de Estratégias

| Aspecto | Event-Driven (LISTEN/NOTIFY) | Background Job |
|---------|------------------------------|----------------|
| **Latência** | ~10-50ms (quase instantâneo) | 30s - 5min (depende do intervalo) |
| **Complexidade** | Média (event bus + subscribers) | Baixa (cron job simples) |
| **Confiabilidade** | Alta (at-least-once delivery) | Média (pode perder eventos se worker cair) |
| **Escalabilidade** | Boa (múltiplos workers consomem eventos) | Limitada (1 worker por vez) |
| **Infraestrutura** | PostgreSQL nativo (LISTEN/NOTIFY) | Apenas timer |
| **Debug** | Mais difícil (eventos assíncronos) | Fácil (logs diretos) |

**Recomendação**:
- **Fase 1-2**: Background Job (mais simples)
- **Fase 3-4 (Produção)**: Event-Driven (latência menor, mais robusto)

### Fluxo Completo de Ciclo de Vida

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER: Cria manual BACEN via Natural Language Assistant     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. SUPERCORE API: POST /api/instances                          │
│     {                                                            │
│       "object_definition_id": "uuid-manual-bacen",              │
│       "data": {                                                  │
│         "codigo": "Circular 3.978",                             │
│         "secoes": [...]                                          │
│       }                                                          │
│     }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. INSTANCE HANDLER: Valida JSON Schema + FSM                  │
│     ✅ Schema válido                                            │
│     ✅ State = RASCUNHO (FSM initial state)                     │
│     ✅ Insere em table `instances`                              │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. EVENT BUS: Publica evento                                   │
│     NOTIFY instance_events, '{                                  │
│       "type": "CREATED",                                        │
│       "instance_id": "uuid-123",                                │
│       "object_type": "manual_bacen",                            │
│       "data": {...}                                              │
│     }'                                                           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. EMBEDDING SYNC SERVICE: Escuta evento (subscriber)          │
│     • Detecta object_type = "manual_bacen"                      │
│     • Aciona handleManualEvent()                                │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. CREATE EMBEDDINGS:                                          │
│     Para cada seção do manual:                                  │
│       • Divide em chunks (~1000 tokens)                         │
│       • Gera embedding via OpenAI API                           │
│       • INSERT INTO document_embeddings                         │
│         - source_instance_id = uuid-123                         │
│         - content = chunk de texto                              │
│         - embedding = [1536 floats]                             │
│         - metadata = {codigo, secao, data_publicacao}           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. TRANSIÇÃO DE ESTADO: RASCUNHO → VIGENTE                    │
│     POST /api/instances/uuid-123/transition                     │
│     {"to_state": "VIGENTE"}                                     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. EVENT BUS: Publica STATE_CHANGED                            │
│     • Embedding Sync Service recebe                             │
│     • Atualiza metadata dos embeddings:                         │
│       UPDATE document_embeddings                                │
│       SET metadata = jsonb_set(metadata, '{estado}', 'VIGENTE') │
│       WHERE source_instance_id = 'uuid-123'                     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  ✅ COMPLETO: Manual está em instances + embeddings            │
│     Disponível para:                                            │
│     • Busca estruturada (regras referenciam manual)             │
│     • RAG (usuários fazem perguntas semânticas)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tratamento de Atualizações

```typescript
// Cenário: Circular 3.978 foi atualizada (nova versão)

// 1. COMPLIANCE cria NOVA instance (versão 2)
const novaVersao = await supercore.instances.create({
  object_definition_id: manualBacenDefId,
  data: {
    codigo: 'Circular 3.978 v2',
    titulo: 'Circular 3.978 - Atualizada em 2024',
    versao: 2,
    substitui_manual_id: manualAntigoId,  // Referência ao anterior
    secoes: [/* nova estrutura */]
  }
});

// 2. EVENT BUS publica CREATED
// 3. EMBEDDING SYNC cria embeddings para nova versão

// 4. TRANSIÇÃO da versão ANTIGA: VIGENTE → SUBSTITUIDO
await supercore.instances.transition(manualAntigoId, {
  to_state: 'SUBSTITUIDO',
  comment: `Substituído pela versão 2: ${novaVersao.id}`
});

// 5. EVENT BUS publica STATE_CHANGED
// 6. EMBEDDING SYNC atualiza metadata dos embeddings antigos
//    metadata.revogado = true
//    metadata.substituido_por = novaVersao.id

// 7. RAG agora retorna APENAS embeddings da nova versão
//    (filtro WHERE metadata->>'revogado' IS NULL)
```

### Limpeza de Embeddings Órfãos

```sql
-- Job de manutenção (roda 1x por dia)
-- Remove embeddings de instances deletadas

DELETE FROM document_embeddings
WHERE source_instance_id NOT IN (
    SELECT id FROM instances WHERE is_deleted = false
);

-- Arquiva embeddings de manuais revogados antigos (>2 anos)
UPDATE document_embeddings
SET archived = true
WHERE source_instance_id IN (
    SELECT i.id
    FROM instances i
    WHERE i.current_state IN ('REVOGADO', 'SUBSTITUIDO')
    AND i.updated_at < NOW() - INTERVAL '2 years'
);
```

---

### Camada 1: Foundation (PostgreSQL)

```sql
-- A BASE DE TUDO (3 tabelas principais + 1 auxiliar)

-- TABELA 1: object_definitions (O Genoma)
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- "cliente_pf", "conta_corrente"
    display_name VARCHAR(200),                   -- "Cliente Pessoa Física"
    description TEXT,                            -- Linguagem natural
    version INT DEFAULT 1,

    -- O SCHEMA (estrutura)
    schema JSONB NOT NULL,                       -- JSON Schema Draft 7

    -- AS REGRAS (comportamento)
    rules JSONB DEFAULT '[]'::jsonb,             -- Validações + Enrichments

    -- O CICLO DE VIDA (FSM)
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE"],
        "transitions": []
    }'::jsonb,

    -- DICAS DE UI (como renderizar)
    ui_hints JSONB DEFAULT '{}'::jsonb,          -- Widgets, labels, help text

    -- RELACIONAMENTOS PERMITIDOS
    relationships JSONB DEFAULT '[]'::jsonb,     -- ["TITULAR_DE", "DEPENDENTE_DE"]

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- TABELA 2: instances (As Células Vivas)
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    object_definition_id UUID REFERENCES object_definitions(id),

    -- OS DADOS (flexível, validado contra schema)
    data JSONB NOT NULL,

    -- ESTADO ATUAL (do FSM)
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,

    -- METADADOS
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INT DEFAULT 1,

    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP
);

-- TABELA 3: relationships (As Sinapses)
CREATE TABLE relationships (
    id UUID PRIMARY KEY,
    relationship_type VARCHAR(100) NOT NULL,     -- "TITULAR_DE", "PAI_DE"

    source_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,

    -- PROPRIEDADES DA RELAÇÃO
    properties JSONB DEFAULT '{}'::jsonb,        -- {"porcentagem": 100, "desde": "2024-01-01"}

    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(relationship_type, source_instance_id, target_instance_id)
);

-- TABELA 4: validation_rules (Biblioteca de Validações)
CREATE TABLE validation_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- "cpf_validation"
    description TEXT,
    rule_type VARCHAR(50),                       -- "regex", "function", "api_call"

    -- CONFIGURAÇÃO DA REGRA
    config JSONB NOT NULL,                       -- {"pattern": "^\d{11}$"} ou {"endpoint": "/api/validate-cpf"}

    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES CRÍTICOS (Performance)
CREATE INDEX idx_instances_object_def ON instances(object_definition_id) WHERE is_deleted = false;
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);
CREATE INDEX idx_instances_state ON instances(current_state) WHERE is_deleted = false;
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

### Camada 2: Natural Language Interface (Assistente de Criação)

**NÃO é um chatbot genérico. É um ASSISTENTE ESTRUTURADO.**

#### Fluxo de Criação de Objeto (Linguagem Natural → object_definition)

```typescript
// Componente: ObjectCreationAssistant.tsx
// Usuário: Time de Produto/Compliance (SEM conhecimento técnico)

interface ConversationStep {
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  validator?: (answer: string) => boolean;
}

const objectCreationFlow: ConversationStep[] = [
  {
    question: "Qual o nome do objeto que você quer criar? (Ex: Cliente Pessoa Física, Conta Investimento)",
    type: 'text',
    hint: "Use um nome descritivo que o time de negócio entenda"
  },
  {
    question: "Descreva em suas palavras o que é esse objeto e para que serve.",
    type: 'text',
    hint: "Ex: 'Um cliente pessoa física é uma pessoa que tem conta no banco e precisa passar por KYC'"
  },
  {
    question: "Quais informações precisam ser coletadas? Liste os campos necessários.",
    type: 'text',
    hint: "Ex: CPF, Nome Completo, Data de Nascimento, Endereço, Telefone, Email"
  },
  {
    question: "Algum desses campos tem validação especial do BACEN ou compliance?",
    type: 'multiselect',
    options: ['CPF (validação completa)', 'CNPJ', 'Email', 'Telefone BR', 'CEP', 'Outro']
  },
  {
    question: "Quais são os estados possíveis deste objeto durante seu ciclo de vida?",
    type: 'text',
    hint: "Ex: Cadastro Pendente, Ativo, Bloqueado, Inativo"
  },
  {
    question: "Este objeto se relaciona com quais outros objetos?",
    type: 'text',
    hint: "Ex: Cliente pode ser TITULAR de Conta, PAI de outro Cliente (dependente)"
  },
  {
    question: "Vou mostrar um preview do que será criado. Confirma?",
    type: 'confirm'
  }
];

// BACKEND: Assistant Service (Go)
type AssistantService struct {
    llm          *LLMClient           // Claude/GPT para processar NL
    schemaGen    *SchemaGenerator     // Gera JSON Schema
    validatorLib *ValidatorLibrary    // Biblioteca de validações BACEN
    db           *sql.DB
}

func (s *AssistantService) ProcessConversation(ctx context.Context, answers []string) (*ObjectDefinition, error) {
    // 1. EXTRAÇÃO DE ENTIDADES (NLP)
    prompt := fmt.Sprintf(`
Você é um especialista em modelagem de dados para Core Banking.

O usuário descreveu o seguinte objeto:
Nome: %s
Descrição: %s
Campos mencionados: %s
Validações especiais: %s
Estados: %s
Relacionamentos: %s

Gere um JSON Schema Draft 7 completo, incluindo:
1. Propriedades com tipos corretos (string, number, boolean, object, array)
2. Required fields
3. Patterns para validações (CPF: ^\d{11}$)
4. Enums para campos de seleção
5. Descrições claras em português

Retorne APENAS o JSON válido, sem explicações.
`, answers[0], answers[1], answers[2], answers[3], answers[4], answers[5])

    schema, err := s.llm.Generate(ctx, prompt)
    if err != nil {
        return nil, err
    }

    // 2. GERAÇÃO DE FSM (Finite State Machine)
    states := parseStatesFromNL(answers[4]) // "Pendente, Ativo, Bloqueado" → FSM
    fsm := s.generateFSM(states)

    // 3. MAPEAMENTO DE VALIDAÇÕES
    rules := s.mapValidationRules(answers[3]) // "CPF" → validation_rules.cpf_validation

    // 4. UI HINTS (como renderizar cada campo)
    uiHints := s.generateUIHints(schema)

    // 5. CRIAÇÃO DO object_definition
    objDef := &ObjectDefinition{
        Name:          slugify(answers[0]),
        DisplayName:   answers[0],
        Description:   answers[1],
        Schema:        schema,
        Rules:         rules,
        States:        fsm,
        UIHints:       uiHints,
        Relationships: parseRelationships(answers[5]),
    }

    // 6. VALIDAÇÃO (JSON Schema válido? FSM sem estados órfãos?)
    if err := s.validate(objDef); err != nil {
        return nil, fmt.Errorf("validação falhou: %w", err)
    }

    // 7. PERSISTÊNCIA
    if err := s.db.InsertObjectDefinition(ctx, objDef); err != nil {
        return nil, err
    }

    return objDef, nil
}
```

#### Exemplo de Conversa Real

```
ASSISTENTE: Qual o nome do objeto que você quer criar?

USUÁRIO: Cliente Pessoa Física

ASSISTENTE: Descreva o que é esse objeto.

USUÁRIO: É uma pessoa que vai abrir conta no banco.
         Precisa passar por KYC e validação do BACEN.

ASSISTENTE: Quais informações precisam ser coletadas?

USUÁRIO: CPF, Nome Completo, Data de Nascimento, RG,
         Endereço completo, Telefone, Email, Renda Mensal,
         Profissão

ASSISTENTE: Algum campo tem validação especial?

USUÁRIO: [✓] CPF (validação completa)
         [✓] Email
         [✓] Telefone BR
         [✓] CEP

ASSISTENTE: Quais são os estados do ciclo de vida?

USUÁRIO: Cadastro Iniciado → Documentos Pendentes →
         Em Análise → Aprovado → Ativo → Bloqueado → Inativo

ASSISTENTE: Se relaciona com outros objetos?

USUÁRIO: Sim, Cliente pode ser TITULAR de Conta Corrente,
         e pode ser PAI/MÃE de outros Clientes (dependentes menores)

ASSISTENTE: Perfeito! Vou gerar o objeto. Aqui está o preview:

┌─────────────────────────────────────────────────────────┐
│ 📋 Cliente Pessoa Física                                │
├─────────────────────────────────────────────────────────┤
│ Campos (9):                                             │
│  • CPF (obrigatório, validado)                          │
│  • Nome Completo (obrigatório)                          │
│  • Data Nascimento (obrigatório)                        │
│  • RG (opcional)                                        │
│  • Endereço (objeto: CEP, Rua, Número, Cidade, UF)     │
│  • Telefone (validado BR)                               │
│  • Email (validado)                                     │
│  • Renda Mensal (número, moeda BRL)                     │
│  • Profissão (texto livre)                              │
│                                                         │
│ Estados (7):                                            │
│  CADASTRO_INICIADO → DOCUMENTOS_PENDENTES →             │
│  EM_ANALISE → APROVADO → ATIVO → BLOQUEADO → INATIVO   │
│                                                         │
│ Relacionamentos:                                        │
│  • TITULAR_DE → Conta Corrente (1:N)                    │
│  • PAI_DE → Cliente PF (1:N, dependentes)               │
│                                                         │
│ Validações Automáticas:                                 │
│  ✓ CPF: 11 dígitos + validação algorítmica              │
│  ✓ Email: formato RFC 5322                              │
│  ✓ Telefone: formato BR (DDD + número)                  │
│  ✓ CEP: 8 dígitos + consulta ViaCEP                     │
│  ✓ Idade: >= 18 anos (calculado de data_nascimento)    │
└─────────────────────────────────────────────────────────┘

Confirma a criação? [Sim] [Editar] [Cancelar]

USUÁRIO: [Sim]

ASSISTENTE: ✅ Objeto "Cliente Pessoa Física" criado com sucesso!

            Já pode começar a cadastrar clientes em:
            Front Section → Clientes PF → Novo Cadastro

            O formulário foi gerado automaticamente com
            todos os campos e validações.
```

### Camada 3: Dynamic UI Generation (100% Genérica)

**CRÍTICO**: A UI **NUNCA** sabe o que é "Cliente" ou "Conta". Ela apenas lê `object_definition` e renderiza.

```typescript
// DynamicInstanceForm.tsx
// Este componente renderiza QUALQUER objeto

interface DynamicInstanceFormProps {
  objectDefinitionId: string;  // UUID do objeto a ser instanciado
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function DynamicInstanceForm({ objectDefinitionId, initialData, onSubmit }: DynamicInstanceFormProps) {
  // 1. BUSCA A DEFINIÇÃO DO OBJETO
  const { data: objDef } = useQuery(['object-definition', objectDefinitionId], () =>
    api.get(`/api/object-definitions/${objectDefinitionId}`)
  );

  // 2. ESTADO DO FORMULÁRIO (100% dinâmico)
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 3. VALIDAÇÃO CLIENT-SIDE (usando JSON Schema)
  const validator = useMemo(() => {
    if (!objDef?.schema) return null;
    return new JSONSchemaValidator(objDef.schema);
  }, [objDef]);

  // 4. RENDERIZA CAMPOS DINAMICAMENTE
  if (!objDef) return <Spinner />;

  const fields = Object.entries(objDef.schema.properties || {});
  const required = objDef.schema.required || [];

  return (
    <form onSubmit={(e) => {
      e.preventDefault();

      // Valida antes de enviar
      const validationErrors = validator.validate(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit(formData);
    }}>
      <h2>{objDef.display_name}</h2>
      <p className="text-gray-600">{objDef.description}</p>

      <div className="space-y-6 mt-6">
        {fields.map(([fieldName, fieldSchema]) => {
          const isRequired = required.includes(fieldName);
          const widget = objDef.ui_hints?.widgets?.[fieldName] || inferWidget(fieldSchema);
          const helpText = fieldSchema.description || objDef.ui_hints?.help_text?.[fieldName];

          return (
            <FormField
              key={fieldName}
              label={fieldSchema.title || startCase(fieldName)}
              required={isRequired}
              error={errors[fieldName]}
              helpText={helpText}
            >
              <WidgetRenderer
                widget={widget}
                schema={fieldSchema}
                value={formData[fieldName]}
                onChange={(value) => {
                  setFormData({ ...formData, [fieldName]: value });
                  // Limpa erro quando usuário corrige
                  if (errors[fieldName]) {
                    setErrors({ ...errors, [fieldName]: undefined });
                  }
                }}
              />
            </FormField>
          );
        })}
      </div>

      <div className="flex gap-4 mt-8">
        <Button type="submit" variant="primary">
          Salvar {objDef.display_name}
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// WidgetRenderer.tsx
// Renderiza o widget correto baseado no tipo de campo

function WidgetRenderer({ widget, schema, value, onChange }: WidgetRendererProps) {
  switch (widget) {
    case 'cpf':
      return (
        <InputMask
          mask="999.999.999-99"
          value={value}
          onChange={onChange}
          placeholder="000.000.000-00"
          validator={async (cpf) => {
            // Valida dígitos
            if (!validateCPFDigits(cpf)) return "CPF inválido";

            // Consulta blacklist (validation_rules)
            const isBlacklisted = await api.post('/api/validate', {
              rule: 'cpf_blacklist',
              value: cpf
            });

            if (isBlacklisted) return "CPF não permitido";
            return null;
          }}
        />
      );

    case 'currency':
      return (
        <CurrencyInput
          value={value}
          onChange={onChange}
          currency="BRL"
          locale="pt-BR"
          placeholder="R$ 0,00"
          min={schema.minimum}
          max={schema.maximum}
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          format="dd/MM/yyyy"
          maxDate={schema.maximum ? new Date(schema.maximum) : undefined}
          minDate={schema.minimum ? new Date(schema.minimum) : undefined}
        />
      );

    case 'select':
      return (
        <Select
          value={value}
          onChange={onChange}
          options={(schema.enum || []).map(v => ({ value: v, label: v }))}
          placeholder="Selecione..."
        />
      );

    case 'relationship':
      // Widget CRÍTICO: permite selecionar instância de outro objeto
      return (
        <RelationshipPicker
          targetObjectType={schema.relationshipConfig.targetType}
          relationshipType={schema.relationshipConfig.type}
          value={value}
          onChange={onChange}
          allowMultiple={schema.relationshipConfig.cardinality === 'MANY_TO_MANY'}
        />
      );

    case 'address':
      // Widget composto para endereço BR
      return (
        <AddressInput
          value={value}
          onChange={onChange}
          autoFillFromCEP={true}  // Consulta ViaCEP automaticamente
        />
      );

    case 'phone_br':
      return (
        <InputMask
          mask="(99) 99999-9999"
          value={value}
          onChange={onChange}
          placeholder="(11) 98765-4321"
        />
      );

    case 'text':
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          pattern={schema.pattern}
        />
      );
  }
}
```

### Camada 4: RAG Trimodal (O Sistema Nervoso)

**CRÍTICO**: O RAG precisa entender objetos, instâncias E correlações para responder perguntas.

```python
# rag_brain.py
# O Cérebro que navega pela plataforma

from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class RAGContext:
    """Contexto extraído do sistema para responder uma pergunta"""
    sql_data: List[Dict[str, Any]]      # Dados tabulares (PostgreSQL)
    graph_data: Dict[str, Any]          # Relacionamentos (NebulaGraph)
    vector_data: List[str]              # Documentos similares (PgVector)
    object_definitions: List[Dict]      # Schemas dos objetos envolvidos

class TrimodalRAG:
    def __init__(self, pg_conn, nebula_conn, llm_client):
        self.pg = pg_conn
        self.nebula = nebula_conn
        self.llm = llm_client

    async def answer_question(self, question: str) -> str:
        """
        Pipeline completo de RAG:
        1. Identifica entidades na pergunta
        2. Busca contexto em 3 fontes
        3. Sintetiza resposta com LLM
        """

        # PASSO 1: IDENTIFICAÇÃO DE ENTIDADES
        entities = await self.extract_entities(question)
        # Ex: "Quantos clientes ativos temos?"
        #     → entities = {"object_type": "cliente_pf", "state": "ATIVO"}

        # PASSO 2: BUSCA DE CONTEXTO
        context = RAGContext(
            sql_data=[],
            graph_data={},
            vector_data=[],
            object_definitions=[]
        )

        # 2A. SQL (dados tabulares)
        if entities.get("object_type"):
            obj_def = await self.get_object_definition(entities["object_type"])
            context.object_definitions.append(obj_def)

            # Query dinâmica baseada na pergunta
            query = self.build_sql_query(entities, obj_def)
            # Ex: SELECT COUNT(*) FROM instances
            #     WHERE object_definition_id = 'uuid-cliente-pf'
            #     AND current_state = 'ATIVO'

            context.sql_data = await self.pg.execute(query)

        # 2B. GRAPH (relacionamentos)
        if entities.get("relationship_type"):
            # Ex: "Quais contas Maria Silva possui?"
            #     → Busca no grafo: Maria --TITULAR_DE--> Contas

            graph_query = f"""
                MATCH (source)-[rel:{entities['relationship_type']}]->(target)
                WHERE source.name CONTAINS '{entities.get('source_name', '')}'
                RETURN source, rel, target
                LIMIT 100
            """
            context.graph_data = await self.nebula.execute(graph_query)

        # 2C. VECTOR (documentação e contexto semântico)
        # Busca documentos relevantes (ex: regras BACEN, compliance)
        embedding = await self.llm.embed(question)
        context.vector_data = await self.pg.execute(f"""
            SELECT content, metadata
            FROM document_embeddings
            ORDER BY embedding <=> '{embedding}'
            LIMIT 5
        """)

        # PASSO 3: SÍNTESE COM LLM
        prompt = self.build_prompt(question, context)
        answer = await self.llm.generate(prompt)

        return answer

    def build_prompt(self, question: str, context: RAGContext) -> str:
        """Monta prompt com contexto completo"""

        prompt = f"""Você é um assistente especializado em Core Banking.

PERGUNTA DO USUÁRIO:
{question}

CONTEXTO DISPONÍVEL:

1. OBJETOS DEFINIDOS NO SISTEMA:
{json.dumps(context.object_definitions, indent=2, ensure_ascii=False)}

2. DADOS (SQL):
{json.dumps(context.sql_data, indent=2, ensure_ascii=False)}

3. RELACIONAMENTOS (Grafo):
{json.dumps(context.graph_data, indent=2, ensure_ascii=False)}

4. DOCUMENTAÇÃO RELEVANTE:
{chr(10).join(context.vector_data)}

INSTRUÇÕES:
- Use os dados acima para responder com precisão
- Cite números quando disponíveis
- Se não houver dados suficientes, seja honesto
- Explique de forma clara, sem jargões técnicos
- Se a pergunta envolver relacionamentos, use os dados do grafo

RESPOSTA:"""

        return prompt

    async def get_object_definition(self, name: str) -> Dict:
        """Busca object_definition por nome"""
        result = await self.pg.fetchone(
            "SELECT * FROM object_definitions WHERE name = $1",
            name
        )
        return dict(result)

    async def extract_entities(self, question: str) -> Dict[str, Any]:
        """Usa LLM para extrair entidades da pergunta"""

        # Primeiro, busca todos os object_definitions existentes
        all_objects = await self.pg.fetch(
            "SELECT name, display_name FROM object_definitions WHERE is_active = true"
        )

        object_names = [obj['name'] for obj in all_objects]
        display_names = [obj['display_name'] for obj in all_objects]

        prompt = f"""Você é um extrator de entidades para um sistema de Core Banking.

PERGUNTA: {question}

OBJETOS DISPONÍVEIS NO SISTEMA:
{json.dumps(dict(zip(object_names, display_names)), indent=2, ensure_ascii=False)}

Extraia as seguintes entidades da pergunta (retorne JSON):
- object_type: qual tipo de objeto está sendo perguntado? (use o 'name', não o display_name)
- state: algum estado específico? (ex: ATIVO, BLOQUEADO)
- relationship_type: algum tipo de relacionamento? (ex: TITULAR_DE)
- filters: quaisquer filtros mencionados (ex: saldo > 1000, data >= 2024-01-01)
- aggregation: tipo de agregação (count, sum, avg, min, max)
- time_range: período de tempo mencionado

Retorne APENAS o JSON, sem explicações.
"""

        response = await self.llm.generate(prompt, temperature=0.1)
        return json.loads(response)

    def build_sql_query(self, entities: Dict, obj_def: Dict) -> str:
        """Constrói query SQL dinamicamente baseada nas entidades extraídas"""

        base_query = f"""
            SELECT
                id,
                data,
                current_state,
                created_at,
                updated_at
            FROM instances
            WHERE object_definition_id = '{obj_def['id']}'
              AND is_deleted = false
        """

        # Adiciona filtros de estado
        if entities.get('state'):
            base_query += f"\n  AND current_state = '{entities['state']}'"

        # Adiciona filtros em campos JSONB
        if entities.get('filters'):
            for field, condition in entities['filters'].items():
                # Ex: {"saldo": {"$gt": 1000}}
                if '$gt' in condition:
                    base_query += f"\n  AND (data->>{field})::numeric > {condition['$gt']}"
                elif '$lt' in condition:
                    base_query += f"\n  AND (data->>{field})::numeric < {condition['$lt']}"
                elif '$eq' in condition:
                    base_query += f"\n  AND data->>'{field}' = '{condition['$eq']}'"

        # Adiciona agregação
        if entities.get('aggregation'):
            agg = entities['aggregation']
            if agg == 'count':
                base_query = f"SELECT COUNT(*) as total FROM ({base_query}) subq"
            elif agg == 'sum':
                field = entities.get('aggregation_field', 'valor')
                base_query = f"SELECT SUM((data->>'{field}')::numeric) as total FROM ({base_query}) subq"

        return base_query
```

#### Exemplo de Uso do RAG

```
USUÁRIO: Quantos clientes ativos temos?

RAG PIPELINE:
1. extract_entities() →
   {
     "object_type": "cliente_pf",
     "state": "ATIVO",
     "aggregation": "count"
   }

2. get_object_definition("cliente_pf") →
   {
     "id": "uuid-123",
     "name": "cliente_pf",
     "display_name": "Cliente Pessoa Física",
     "schema": {...}
   }

3. build_sql_query() →
   SELECT COUNT(*) as total
   FROM instances
   WHERE object_definition_id = 'uuid-123'
     AND current_state = 'ATIVO'
     AND is_deleted = false

4. execute() → [{"total": 1247}]

5. llm.generate() →
   "Atualmente temos 1.247 clientes ativos no sistema."

---

USUÁRIO: Quais contas a Maria Silva possui?

RAG PIPELINE:
1. extract_entities() →
   {
     "object_type": "conta_corrente",
     "relationship_type": "TITULAR_DE",
     "source_name": "Maria Silva"
   }

2. nebula.execute() →
   MATCH (cli:Instance)-[rel:TITULAR_DE]->(conta:Instance)
   WHERE cli.data.nome_completo CONTAINS 'Maria Silva'
   RETURN cli, rel, conta

3. graph_data →
   {
     "cliente": {"nome": "Maria Silva", "cpf": "123.456.789-01"},
     "contas": [
       {"numero": "12345-6", "tipo": "Corrente", "saldo": 5000.00},
       {"numero": "98765-4", "tipo": "Poupança", "saldo": 15000.00}
     ]
   }

4. llm.generate() →
   "Maria Silva (CPF 123.456.789-01) possui 2 contas:
    1. Conta Corrente 12345-6 - Saldo: R$ 5.000,00
    2. Conta Poupança 98765-4 - Saldo: R$ 15.000,00"
```

---

## 🎯 IMPLEMENTAÇÃO FASE 1 (Foundation)

### Objetivos Concretos (12 semanas)

#### Semana 1-2: Database + API Básica

**Entregas**:
- [ ] PostgreSQL com 4 tabelas (object_definitions, instances, relationships, validation_rules)
- [ ] Seed com validation_rules BACEN (CPF, CNPJ, email, telefone, CEP)
- [ ] API Go com endpoints:
  - `GET/POST /api/object-definitions`
  - `GET /api/object-definitions/:id`
  - `GET/POST /api/instances`
  - `GET /api/instances/:id`
  - `PUT /api/instances/:id`
  - `POST /api/relationships`
  - `GET /api/relationships?source_id=X`

**Testes**:
```bash
# Criar object_definition via API
curl -X POST http://localhost:8080/api/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {"type": "string", "pattern": "^\\d{11}$"},
        "nome_completo": {"type": "string"}
      },
      "required": ["cpf", "nome_completo"]
    },
    "states": {
      "initial": "ATIVO",
      "states": ["ATIVO", "BLOQUEADO"]
    }
  }'

# Criar instância
curl -X POST http://localhost:8080/api/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "12345678901",
      "nome_completo": "Maria Silva"
    }
  }'

# Verificar validação (CPF inválido deve falhar)
curl -X POST http://localhost:8080/api/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "123",  # ❌ Inválido
      "nome_completo": "Maria Silva"
    }
  }'
# Esperado: HTTP 400 {"error": "validation failed: cpf does not match pattern"}
```

#### Semana 3-4: Assistente de Criação (NL → object_definition)

**Entregas**:
- [ ] Interface de conversa estruturada (7 perguntas)
- [ ] Integração com LLM (Claude/GPT) para gerar JSON Schema
- [ ] Preview do objeto antes de criar
- [ ] Persistência em `object_definitions`

**Teste Real**:
```
Input: Usuário descreve "Cliente PF" em linguagem natural
Output: object_definition criada com:
  - Schema válido (JSON Schema Draft 7)
  - FSM com estados mencionados
  - Validações mapeadas (CPF → validation_rules.cpf_validation)
  - UI hints gerados
```

#### Semana 5-6: Dynamic UI Generation

**Entregas**:
- [ ] Componente `DynamicInstanceForm`
- [ ] Widget library (10 widgets: text, cpf, currency, date, select, relationship, address, phone, email, number)
- [ ] Validação client-side (JSON Schema)
- [ ] Validação server-side (Go)

**Teste Real**:
```
Input: object_definition "cliente_pf"
Output: Formulário renderizado com:
  - Campo CPF com máscara 999.999.999-99
  - Validação em tempo real (dígitos verificadores)
  - Campo Endereço que consulta ViaCEP ao preencher CEP
  - Botão "Salvar" que valida tudo antes de enviar
```

#### Semana 7-8: Relacionamentos + Grafo

**Entregas**:
- [ ] Tabela `relationships`
- [ ] API de relacionamentos
- [ ] Widget `RelationshipPicker`
- [ ] Validação de cardinalidade
- [ ] Visualização React Flow (básica)

**Teste Real**:
```
Cenário: Criar Conta Corrente e vincular a Cliente
1. Usuário cria Cliente (Maria Silva)
2. Usuário cria Conta (12345-6)
3. No campo "Titular", seleciona Maria Silva via RelationshipPicker
4. Backend cria relationship (TITULAR_DE)
5. Grafo mostra: (Maria) --TITULAR_DE--> (Conta 12345-6)
```

#### Semana 9-10: State Machine + Transições

**Entregas**:
- [ ] Editor visual de FSM (React Flow)
- [ ] Validação de FSM (estados órfãos, transições inválidas)
- [ ] Engine de transição de estados
- [ ] Histórico de estados (`state_history` em instances)

**Teste Real**:
```
Cenário: Cliente passa por KYC
1. Cliente criado em estado CADASTRO_PENDENTE
2. Usuário clica "Enviar Documentos" → transição para DOCUMENTOS_ENVIADOS
3. Compliance clica "Aprovar" → transição para ATIVO
4. Sistema registra em state_history: [
     {"state": "CADASTRO_PENDENTE", "timestamp": "2024-01-01T10:00:00Z"},
     {"state": "DOCUMENTOS_ENVIADOS", "timestamp": "2024-01-02T14:30:00Z"},
     {"state": "ATIVO", "timestamp": "2024-01-03T09:15:00Z"}
   ]
```

#### Semana 11-12: RAG Básico + Polish

**Entregas**:
- [ ] Pipeline RAG trimodal (SQL + Graph + Vector)
- [ ] Extração de entidades via LLM
- [ ] Query builder dinâmico
- [ ] Interface de chat para perguntas

**Teste Real**:
```
PERGUNTA: "Quantos clientes cadastrados ontem?"

RAG:
1. Extrai: {"object_type": "cliente_pf", "time_range": "yesterday", "aggregation": "count"}
2. Query: SELECT COUNT(*) FROM instances
          WHERE object_definition_id = 'uuid-cliente-pf'
          AND DATE(created_at) = CURRENT_DATE - 1
3. Resposta: "Foram cadastrados 47 clientes ontem."
```

---

## 📐 PRINCÍPIOS DE CÓDIGO

### 1. Zero Business Logic Hardcoded

```go
// ❌ ERRADO
func ValidateCliente(cliente Cliente) error {
    if len(cliente.CPF) != 11 {
        return errors.New("CPF inválido")
    }
    // ... mais validações hardcoded
}

// ✅ CORRETO
func ValidateInstance(instance Instance, objDef ObjectDefinition) error {
    // Valida contra JSON Schema (genérico)
    schemaLoader := gojsonschema.NewGoLoader(objDef.Schema)
    dataLoader := gojsonschema.NewGoLoader(instance.Data)

    result, err := gojsonschema.Validate(schemaLoader, dataLoader)
    if err != nil {
        return err
    }

    if !result.Valid() {
        return fmt.Errorf("validation failed: %v", result.Errors())
    }

    // Aplica validation_rules (interpretadas)
    for _, ruleRef := range objDef.Rules {
        rule, err := getValidationRule(ruleRef.Name)
        if err != nil {
            return err
        }

        if err := executeRule(rule, instance.Data); err != nil {
            return err
        }
    }

    return nil
}
```

### 2. UI 100% Genérica

```tsx
// ❌ ERRADO (componente específico)
function ClienteForm() {
  return (
    <form>
      <Input name="cpf" mask="999.999.999-99" />
      <Input name="nome_completo" />
      {/* ... campos hardcoded */}
    </form>
  );
}

// ✅ CORRETO (componente genérico)
function DynamicInstanceForm({ objectDefinitionId }: Props) {
  const { data: objDef } = useObjectDefinition(objectDefinitionId);

  return (
    <form>
      {Object.entries(objDef.schema.properties).map(([name, schema]) => (
        <FieldRenderer
          key={name}
          name={name}
          schema={schema}
          uiHint={objDef.ui_hints.widgets[name]}
        />
      ))}
    </form>
  );
}
```

### 3. Validações Interpretadas

```sql
-- validation_rules (pre-seeded)
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_validation', 'regex', '{"pattern": "^\\d{11}$", "error": "CPF deve ter 11 dígitos"}'),
('cpf_blacklist', 'api_call', '{"endpoint": "/api/validate/cpf-blacklist", "method": "POST"}'),
('cpf_receita', 'api_call', '{"endpoint": "https://api.receitafederal.gov.br/cpf", "method": "GET"}'),
('email_format', 'regex', '{"pattern": "^[^@]+@[^@]+\\.[^@]+$"}'),
('phone_br', 'regex', '{"pattern": "^\\d{10,11}$"}'),
('cep_format', 'regex', '{"pattern": "^\\d{8}$"}'),
('idade_minima', 'function', '{"code": "const birthDate = new Date(data.data_nascimento); const age = (new Date() - birthDate) / 31557600000; return age >= 18;", "error": "Idade mínima: 18 anos"}');
```

```go
// Executor de regras (genérico)
func (e *RuleExecutor) Execute(rule ValidationRule, data map[string]interface{}) error {
    switch rule.RuleType {
    case "regex":
        pattern := rule.Config["pattern"].(string)
        fieldValue := extractFieldValue(data, rule.Config["field"].(string))

        matched, _ := regexp.MatchString(pattern, fieldValue)
        if !matched {
            return errors.New(rule.Config["error"].(string))
        }

    case "api_call":
        endpoint := rule.Config["endpoint"].(string)
        resp, err := http.Post(endpoint, "application/json", toJSON(data))
        if err != nil || resp.StatusCode != 200 {
            return errors.New("validation API call failed")
        }

    case "function":
        // Executa JavaScript (V8 engine) ou Lua
        code := rule.Config["code"].(string)
        result := e.jsEngine.Eval(code, data)
        if !result.(bool) {
            return errors.New(rule.Config["error"].(string))
        }
    }

    return nil
}
```

---

## 🚀 CRITÉRIOS DE SUCESSO DA FASE 1

### Teste Final (Semana 12)

**Cenário**: Time de Produto cria "Conta Investimento" e cadastra 100 instâncias.

```
1. CRIAÇÃO DO OBJETO (via Assistente)
   ├─ Usuário responde 7 perguntas em linguagem natural
   ├─ Sistema gera object_definition automaticamente
   ├─ Preview mostra: 15 campos, 5 estados, 2 relacionamentos
   └─ ✅ Objeto criado sem código

2. CADASTRO DE INSTÂNCIAS (via UI Dinâmica)
   ├─ Front Section → Contas Investimento → Novo
   ├─ Formulário renderizado automaticamente
   ├─ Validações funcionam (CPF, valor mínimo, etc)
   ├─ Relacionamento com Cliente via picker
   └─ ✅ 100 instâncias criadas em 30 minutos

3. CONSULTA VIA RAG
   ├─ "Quantas contas de investimento ativas?"
   ├─ RAG consulta instances + object_definitions
   ├─ Resposta: "Existem 87 contas ativas (13 pendentes)"
   └─ ✅ RAG funciona sem hardcoding

4. VISUALIZAÇÃO DO GRAFO
   ├─ Usuário clica em Cliente "João Silva"
   ├─ Grafo mostra: João → TITULAR_DE → 3 Contas Investimento
   ├─ Clica em uma conta → mostra detalhes + histórico de estados
   └─ ✅ Navegação visual funciona
```

**Métricas de Sucesso**:
- ✅ Time de Produto cria objeto completo em < 15 minutos (sem devs)
- ✅ Formulário renderiza todos os tipos de campo corretamente
- ✅ Validações BACEN (CPF, CNPJ) funcionam
- ✅ 100 instâncias criadas sem erros
- ✅ RAG responde 10 perguntas diferentes com precisão > 90%
- ✅ Grafo renderiza até 500 nós sem lag

---

## 📊 RESUMO: SEPARAÇÃO DE RESPONSABILIDADES

### O Que Cada Camada Faz

| Responsabilidade | SuperCore | Aplicação (LBPAY) |
|------------------|-----------|-------------------|
| **Armazenar manuais BACEN** | ✅ Instances de `manual_bacen` | - |
| **Armazenar regras BACEN** | ✅ Instances de `regra_bacen` | - |
| **Relacionar regras ↔ manuais** | ✅ Relationships `BASEADA_EM` | - |
| **Validar estrutura de dados** | ✅ JSON Schema, tipos, required | - |
| **Validar FSM (transições)** | ✅ Estados e transições permitidas | - |
| **Interpretar regras de negócio** | ❌ Não | ✅ Busca e executa condições |
| **Validar saldo suficiente** | ❌ Não | ✅ Lógica bancária |
| **Validar limites BACEN** | ❌ Não | ✅ Interpreta regras |
| **Validar risco de fraude** | ❌ Não | ✅ Chama anti-fraude |
| **Decidir quando aplicar regras** | ❌ Não | ✅ Orquestração |
| **Executar integrações externas** | ✅ HTTP genérico (template) | ❌ Define qual/quando chamar |
| **RAG consulta manuais** | ✅ Busca semântica (embeddings) | - |
| **Auditoria (state_history)** | ✅ Automático para transitions | - |

### Fluxo Completo: Validação de Transação PIX

```
┌─────────────────────────────────────────────────────────────┐
│  1. LBPAY Frontend (Usuário inicia PIX)                     │
│     - Coleta dados: valor, chave destino, etc               │
│     - Cria instance de transacao_pix                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. SuperCore API: POST /api/v1/instances                   │
│     - ✅ Valida JSON Schema (tipos, required)               │
│     - ✅ Valida formato (CPF 11 dígitos)                    │
│     - ✅ Cria instance com estado inicial: PENDENTE         │
│     - ❌ NÃO valida: saldo, limites, risco                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. LBPAY Backend (Orquestração de Validação)               │
│     a) Busca conta origem (SuperCore GET /instances/:id)   │
│     b) Valida saldo: conta.data.saldo >= transacao.valor   │
│     c) Busca regras BACEN vigentes:                         │
│        GET /instances?object_definition=regra_bacen&        │
│            filters[data.dominio]=PIX&                       │
│            filters[current_state]=VIGENTE                   │
│     d) Interpreta cada regra (executa condições)            │
│     e) Se violar: busca manual fonte (fundamentação legal)  │
│     f) Chama anti-fraude via SuperCore integration executor │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. SuperCore API: POST /api/v1/integrations/execute        │
│     - ✅ Busca instance "Data Rudder - Anti-Fraude"         │
│     - ✅ Renderiza body template com params                 │
│     - ✅ Faz HTTP POST                                       │
│     - ✅ Mapeia response                                     │
│     - ❌ NÃO sabe que é anti-fraude (genérico)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. LBPAY Backend (Decisão)                                 │
│     - Se risk_score > 75: rejeitar                          │
│     - Se tudo OK: processar                                 │
│       → Chama TigerBeetle (via integration executor)        │
│       → Chama BACEN SPI (via integration executor)          │
│       → Atualiza transação: POST /instances/:id/transition  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. SuperCore API: POST /api/v1/instances/:id/transition    │
│     - ✅ Valida FSM: PENDENTE → LIQUIDADA é válido?         │
│     - ✅ Atualiza current_state                             │
│     - ✅ Registra em state_history (auditoria)              │
└─────────────────────────────────────────────────────────────┘
```

### Exemplo Prático: Rejeição por Limite BACEN

**Cliente tenta PIX de R$ 2.000 às 22h (horário noturno):**

```typescript
// LBPAY busca regras
const regras = await supercore.instances.list({
  object_definition_id: 'regra_bacen',
  filters: { 'data.dominio': 'PIX', current_state: 'VIGENTE' }
});

// Regra encontrada:
regras.items[0].data = {
  nome_regra: 'Limite PIX Período Noturno',
  condicao: 'valor > parametros.limite_noturno AND (hora >= 20 OR hora < 6)',
  parametros: { limite_noturno: 1000 },
  mensagem_erro: 'Valor excede limite BACEN para período noturno',
  fonte_legal_id: 'uuid-manual-pix-v83',
  secao_referencia: 'Seção 4.2'
}

// LBPAY interpreta:
const contexto = {
  valor: 2000,
  hora: 22,
  parametros: { limite_noturno: 1000 }
};

// Executa: 2000 > 1000 AND (22 >= 20 OR 22 < 6) = true
// Resultado: VIOLOU A REGRA

// LBPAY busca manual fonte
const manual = await supercore.instances.get('uuid-manual-pix-v83');

// LBPAY rejeita transação
await supercore.instances.transition({
  instance_id: transacaoId,
  to_state: 'REJEITADA',
  metadata: {
    motivo: 'Limite BACEN excedido',
    regra_violada: regras.items[0].id,
    fundamentacao: {
      documento: manual.data.codigo, // "Manual PIX v8.3"
      secao: '4.2',
      link: manual.data.link_oficial
    }
  }
});

// Cliente vê:
{
  status: 'REJEITADA',
  motivo: 'Valor excede limite BACEN para período noturno',
  detalhes: {
    valor_solicitado: 'R$ 2.000,00',
    limite_noturno: 'R$ 1.000,00',
    horario: '22:00',
    fundamentacao_legal: {
      documento: 'Manual PIX v8.3',
      secao: '4.2 - Limites de Valor por Horário',
      link: 'https://www.bcb.gov.br/estabilidadefinanceira/pix'
    }
  }
}
```

**SuperCore apenas:**
- Armazenou o manual como instance
- Armazenou a regra como instance
- Relacionou regra → manual via relationship
- Validou estrutura da transação (JSON Schema)
- Registrou a transição PENDENTE → REJEITADA

**LBPAY fez:**
- Buscou regras vigentes
- Interpretou condição
- Decidiu rejeitar
- Buscou fundamentação legal
- Formatou mensagem para cliente

---

## 🔮 VISÃO DE LONGO PRAZO

### Após Fase 1 (Foundation)

**Fase 2**: Brain (Architect Agent lê docs BACEN e gera object_definitions)
**Fase 3**: Autonomy (Discovery de agentes + Auto-deploy)
**Fase 4**: Production (PIX real + BACEN + 100 clientes beta)

### O Core Banking Emerge

```
Semana 1 da Fase 2:
  → Architect Agent lê "Manual de Normas PIX - BACEN"
  → Gera object_definitions: TransacaoPix, ChavePix, DevolucaoPix
  → Gera FSM: INICIADA → LIQUIDADA → DEVOLVIDA
  → Gera validation_rules: chave_pix_format, valor_limite_noturno
  → ✅ Módulo PIX implementado em 3 dias (zero código manual)

Semana 4 da Fase 2:
  → Architect Agent lê "Resolução 4.753 - KYC"
  → Gera object_definition: ProcessoKYC
  → Gera FSM complexo: 12 estados, 20 transições
  → Gera validation_rules: documento_vigente, foto_biometria
  → ✅ Compliance KYC implementado em 5 dias

Mês 6 (início Fase 3):
  → Sistema descobre necessidade de "Security Agent" (fraude)
  → Auto-gera código do agente (Python template)
  → Deploy automático via Kubernetes
  → ✅ 47 agentes rodando (descobertos dinamicamente)

Mês 9 (Fase 4):
  → Primeiro PIX real processado
  → 100 clientes beta usando o banco
  → 10.000 transações/dia
  → ✅ Core Banking completo, criado em 9 meses
```

---

## 📖 GLOSSÁRIO (Para o Time de Produto)

- **object_definition**: O "molde" ou "DNA" de um tipo de coisa (Cliente, Conta, etc)
- **instance**: Uma coisa real criada a partir do molde (Maria Silva, Conta 12345)
- **relationship**: Conexão entre duas coisas (Maria é TITULAR da Conta 12345)
- **schema**: Descrição da estrutura (quais campos, tipos, obrigatórios)
- **FSM (Finite State Machine)**: Ciclo de vida (PENDENTE → ATIVO → BLOQUEADO)
- **validation_rule**: Regra que valida dados (CPF tem 11 dígitos)
- **RAG (Retrieval Augmented Generation)**: Sistema que busca informações e responde perguntas
- **Widget**: Componente visual para um tipo de campo (máscara de CPF, seletor de data)

---

## 🎬 PRÓXIMOS PASSOS IMEDIATOS

1. **Aprovar este documento** (CLAUDE.md)
2. **Setup do ambiente**:
   - PostgreSQL 15+
   - Go 1.21+
   - Node.js 20+
   - Next.js 14+
3. **Criar repositório Git**
4. **Iniciar Semana 1**: Database schema + API básica
5. **Daily standups** (15 min):
   - O que fiz ontem?
   - O que vou fazer hoje?
   - Algum bloqueio?

---

**Este documento é o contrato entre a visão e a implementação.**

Tudo que está aqui será construído. Zero POCs. Zero mocks. Apenas produção.

**Let's build the future of Core Banking. 🚀**

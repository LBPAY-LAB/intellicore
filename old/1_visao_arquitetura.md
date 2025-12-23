# Visão de Arquitetura - SuperCore Platform

**Status**: 🟢 Consolidada
**Versão**: 2.0.0
**Última Atualização**: 2025-12-11

> **📚 DOCUMENTO ESTRATÉGICO**: Para detalhes técnicos completos, consulte [VISAO_FINAL_CONSOLIDADA.md](VISAO_FINAL_CONSOLIDADA.md)

---

## 1. Visão Geral

O SuperCore é uma **plataforma universal de gestão de objetos de negócio** que permite criar qualquer tipo de aplicação (Core Banking, CRM, ERP, Hospitalar, etc.) através de abstrações dinâmicas, linguagem natural, e **geração automatizada via IA**.

### Princípio Fundamental

> **"Não estamos construindo um Core Banking. Estamos construindo uma máquina universal que permite CRIAR um Core Banking (ou qualquer outro sistema) através de documentação e linguagem natural processada por IA."**

### O Conceito Revolucionário: AI-Driven Context Generator

O SuperCore introduz um **fluxo completo de 6 fases** onde:

1. **Fase 0**: Configuração do Oráculo (identidade da solução: "Sou uma IP licenciada pelo BACEN...")
2. **Fase 1**: Upload de contexto multi-modal (PDFs BACEN, diagramas Mermaid/Whimsical, super prompt)
3. **Fase 2**: IA gera especificação editável (iteração até aprovação)
4. **Fase 3**: IA processa e gera object graph completo (object_definitions, validations, integrations, agents, processes)
5. **Fase 4**: Preview e aprovação do modelo gerado
6. **Fase 5**: Uso do modelo (criação de instances)

**Ver detalhes completos**: [VISAO_FINAL_CONSOLIDADA.md - Seção "O Conceito Revolucionário"](VISAO_FINAL_CONSOLIDADA.md#o-conceito-revolucionário-ai-driven-context-generator)

## 2. Meta-Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│         SUPERCORE (Engine Universal)                    │
│         - Gestão de object_definitions                  │
│         - Engine de instances                           │
│         - Engine de relacionamentos (grafo)             │
│         - FSM engine genérico                           │
│         - RAG trimodal                                  │
│         - Assistente NL para criar objetos              │
└─────────────────────────────────────────────────────────┘
                      ↓ é consumido por
┌─────────────────────────────────────────────────────────┐
│    APLICAÇÕES ESPECÍFICAS (Portais/Soluções)           │
│    ├── LBPAY Core Banking (object_definitions          │
│    │   bancárias + portais especializados)             │
│    ├── CRM de Seguros (futuro)                         │
│    ├── Sistema Hospitalar (futuro)                     │
│    └── Qualquer outro domínio                          │
└─────────────────────────────────────────────────────────┘
```

## 3. Camadas Arquiteturais

### Camada 0: Meta-Objetos (Conhecimento e Governança)

**CRÍTICO**: Esta camada é a base do AI-Driven Context Generator.

Objetos que governam o sistema:
- **oracle_config** - Consciência/identidade da solução (configurado na Fase 0)
- **modelo_solucao** - Conjunto de componentes gerados pela IA (resultado da Fase 4)
- **manual_bacen** / **policy_interna** - Conhecimento regulatório (instances + embeddings híbridos)
- **regra_bacen** - Regras executáveis derivadas de manuais
- **integracao_externa** - Configurações de serviços externos (TigerBeetle, BACEN SPI, etc.)
- **process_definition** - Workflows BPM orquestrados
- **mcp_action_agent** - Agentes de validação deployados via Kubernetes

**Ver arquitetura híbrida**: [VISAO_FINAL_CONSOLIDADA.md - Seção "RAG Trimodal Híbrido"](VISAO_FINAL_CONSOLIDADA.md#rag-trimodal-híbrido-instâncias--embeddings)

### Camada 1: Foundation (PostgreSQL)
- `object_definitions` - DNA dos objetos
    - campos, labels de campos;
        - lista de valores como campo;
        - campos especiais tipo data/hora; CPF ou CNPJ, ou email, ou celular...
    - validação de campos;
- `fluxo de evolução do objeto`: Exzemplo de um fluxo: criado, pendente análise,....aprovado.
- `instances` - Objetos vivos
- `relationships` - Grafo semântico
- `validation_rules` - Biblioteca de validações
- `Regras de RBAC`


### Camada 2: Natural Language Interface
- Assistente estruturado para criação de objetos
- LLM para gerar JSON Schema + FSM + validações
- Preview antes de criar
- Zero conhecimento técnico necessário
- Geração de telas de edição do objeto sempre que se aplique
- Geração de tela de criação, edição e gestão de estados para objetos do tipo de dados, como Entidades PF (apenas como um exemplo abstracto)

### Camada 3: Dynamic UI Generation (3 Pilares)

**REVOLUCIONÁRIO**: A UI é 100% gerada automaticamente pela IA com base em 3 pilares:

1. **FormGenerator Pillar**
   - Lê object_definition schema
   - Escolhe widgets apropriados (Screen Type Conductor via IA)
   - Gera formulários responsivos (create, edit, detail, list)
   - Validação client-side e server-side sincronizada

2. **ProcessFlowVisualization Pillar**
   - Renderiza process_definitions como diagramas interativos (React Flow)
   - Navegação visual entre telas/etapas
   - Histórico de execução de processos
   - Debug visual de workflows

3. **BacenValidationEngine Pillar**
   - Interpreta regra_bacen instances
   - Executa validações em tempo real
   - Mostra fundamentação legal (link para manual fonte)
   - Rastreabilidade completa (audit trail)

**Ver implementação completa**: [VISAO_FINAL_CONSOLIDADA.md - Seção "Os 3 Pilares"](VISAO_FINAL_CONSOLIDADA.md#os-3-pilares-da-dynamic-ui)

### Camada 4: RAG Trimodal (Sistema Nervoso)
- SQL: dados tabulares
- Graph: relacionamentos semânticos
- Vector: busca semântica em documentação
- LLM sintetiza respostas com contexto completo

## 4. Princípios Invioláveis

### NUNCA
1. ❌ Criar tabelas hardcoded (`CREATE TABLE clientes` é ERRADO)
2. ❌ Implementar lógica de negócio em código
3. ❌ Fazer mock ou POC
4. ❌ Construir UI específica para domínio
5. ❌ Assumir domínio específico (Banking, CRM, etc.)

### SEMPRE
1. ✅ Usar `object_definitions` + `instances` + `relationships`
2. ✅ Validações em `validation_rules` interpretadas em runtime
3. ✅ Código de produção desde a primeira linha
4. ✅ UI gerada dinamicamente
5. ✅ Zero autenticação no core (responsabilidade das aplicações)

## 5. Stack Tecnológico

### Backend
- **Linguagem**: Go 1.21+
- **Framework**: Gin
- **Database**: PostgreSQL 15+ (JSONB + pgvector)
- **JSON Schema**: gojsonschema v1.2.0
- **Graph**: NebulaGraph (futuro)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod

### AI/ML
- **LLM**: Claude 3.5 Sonnet / GPT-4 Turbo
- **Embeddings**: text-embedding-3-small (OpenAI)
- **Vector DB**: pgvector (PostgreSQL extension)
- **NLP**: spaCy (extração de entidades)

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (produção)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

## 6. Separação de Responsabilidades

| Responsabilidade | SuperCore | Aplicação (ex: LBPAY) |
|------------------|-----------|------------------------|
| Armazenar objetos genéricos | ✅ | - |
| Validar estrutura (JSON Schema) | ✅ | - |
| Validar FSM (transições) | ✅ | - |
| Interpretar regras de negócio | ❌ | ✅ |
| Validar saldo/limites | ❌ | ✅ |
| Decidir orquestração | ❌ | ✅ |
| Executar integrações (HTTP genérico) | ✅ | - |

## 7. Roadmap de Implementação

### Fase 1: Foundation (12 semanas)
- Database + API básica
- Assistente de criação (NL → object_definition)
- Dynamic UI Generation
- Relacionamentos + Grafo
- State Machine + Transições
- RAG Básico

### Fase 2: Brain (8 semanas)
- Architect Agent (lê docs BACEN → gera objects)
- Document parsing (PDFs, Word, HTML)
- Knowledge base automática
- RAG avançado (SQL + Graph + Vector)

### Fase 3: Autonomy (8 semanas)
- Discovery de agentes
- Auto-deploy via Kubernetes
- Monitoring automático
- Self-healing

### Fase 4: Production (8 semanas)
- Integrações reais (BACEN SPI, TigerBeetle)
- 100 clientes beta
- Compliance completo
- Auditoria end-to-end

## 8. Métricas de Sucesso

### Fase 1
- ✅ Time de Produto cria objeto completo em < 15min (sem devs)
- ✅ Formulário renderiza todos os tipos de campo
- ✅ 100 instâncias criadas sem erros
- ✅ RAG responde com precisão > 90%
- ✅ Grafo renderiza 500+ nós sem lag

### Fase 4 (Produção)
- ✅ 10.000 transações/dia
- ✅ Latência p99 < 200ms
- ✅ Uptime > 99.9%
- ✅ Zero intervenção manual para criar novos objetos

## 9. Integração com Gateways Externos (LBPAY Platform)

**CRÍTICO**: SuperCore é genérico. Os gateways específicos de Core Banking são "braços" que **consomem** as abstrações do SuperCore.

### Gateways LBPAY (Externos ao SuperCore)

```
┌─────────────────────────────────────────────────────────┐
│         SUPERCORE (Universal Engine)                    │
│         - Armazena object_definitions                   │
│         - Valida estrutura (JSON Schema)                │
│         - Executa FSM transitions                       │
│         - RAG consulta conhecimento                     │
│         - Fornece APIs REST/GraphQL                     │
└─────────────────────────────────────────────────────────┘
                          ↓ APIs consumidas por
┌─────────────────────────────────────────────────────────┐
│    LBPAY PLATFORM (Core Banking Específico)            │
│    ├─ LB Connect (PIX via BACEN SPI)                   │
│    ├─ LB Dict (DICT API - Chaves PIX)                  │
│    ├─ Orchestration-GO (Sagas, transações distribuídas)│
│    ├─ Money-Moving (Processamento financeiro)          │
│    └─ TigerBeetle (Ledger contábil)                    │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Integração PIX (Exemplo)

1. **SuperCore**: Cria instance `transacao_pix` (estado: PENDENTE)
2. **Money-Moving**: Busca instance, valida saldo/limites
3. **Orchestration-GO**: Executa Saga
   - TigerBeetle.debitar(origem)
   - LB Connect.enviarPix() → BACEN SPI
   - Aguarda confirmação BACEN
4. **SuperCore**: Atualiza transacao_pix (estado: LIQUIDADA)

**Ver arquitetura completa**: [VISAO_FINAL_CONSOLIDADA.md - Seção "Integração com Gateways"](VISAO_FINAL_CONSOLIDADA.md#integração-com-gateways-externos-lbpay-platform)

---

## 10. Referências

- **[VISAO_FINAL_CONSOLIDADA.md](VISAO_FINAL_CONSOLIDADA.md)** - ⭐ Visão técnica completa e detalhada
- **[CLAUDE.md](../../CLAUDE.md)** - Guia de implementação master
- **[stack_tecnologico_fases.md](stack_tecnologico_fases.md)** - Stack técnico por fase
- **[Backlog Geral](../backlog/backlog_geral.md)** - Status de execução

---

**Status**: 🟢 Consolidada
**Próxima Revisão**: Após início da implementação do AI-Driven Context Generator

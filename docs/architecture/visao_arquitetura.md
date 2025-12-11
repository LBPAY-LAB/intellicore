# Visão de Arquitetura - SuperCore Platform

**Status**: 🟡 Em Elaboração
**Versão**: 0.1.0
**Última Atualização**: 2025-12-11

---

## 1. Visão Geral

O SuperCore é uma **plataforma universal de gestão de objetos de negócio** que permite criar qualquer tipo de aplicação (Core Banking, CRM, ERP, Hospitalar, etc.) através de abstrações dinâmicas e linguagem natural.

### Princípio Fundamental

> **"Não estamos construindo um Core Banking. Estamos construindo uma máquina universal que permite CRIAR um Core Banking (ou qualquer outro sistema)."**

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
- Manuais regulatórios (BACEN, CVM, SUSEP)
- Regras de negócio interpretáveis
- Políticas internas
- Integrações externas como objetos
- Crawlers e monitores

### Camada 1: Foundation (PostgreSQL)
- `object_definitions` - DNA dos objetos
- `instances` - Objetos vivos
- `relationships` - Grafo semântico
- `validation_rules` - Biblioteca de validações

### Camada 2: Natural Language Interface
- Assistente estruturado para criação de objetos
- LLM para gerar JSON Schema + FSM + validações
- Preview antes de criar
- Zero conhecimento técnico necessário

### Camada 3: Dynamic UI Generation
- 100% genérica (nunca sabe o que é "Cliente")
- Renderiza qualquer objeto a partir do schema
- Widget library extensível
- Validação client-side e server-side

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

## 9. Referências

- [CLAUDE.md](../../CLAUDE.md) - Guia de implementação completo
- [Conceitos Fundamentais](conceitos_fundamentais.md) - Glossário e conceitos
- [Princípios de Design](principios_design.md) - Decisões arquiteturais
- [Backlog Geral](../backlog/backlog_geral.md) - Status de execução

---

**Próxima Revisão**: Após aprovação das especificações da Fase 1

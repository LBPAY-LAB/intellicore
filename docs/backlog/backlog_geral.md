# Backlog Geral do Projeto SuperCore

**Última Atualização**: 2025-12-11
**Responsável**: Product Owner / Tech Lead

---

## Status do Projeto

| Fase | Status | Início | Fim Previsto | Progresso |
|------|--------|--------|--------------|-----------|
| Fase 1 - Foundation | 🟡 Especificação | 2025-12-11 | - | 0% |
| Fase 2 - Brain | ⚪ Não Iniciada | - | - | 0% |
| Fase 3 - Autonomy | ⚪ Não Iniciada | - | - | 0% |
| Fase 4 - Production | ⚪ Não Iniciada | - | - | 0% |

**Legenda**: 🟢 Completa | 🟡 Em Andamento | 🔴 Bloqueada | ⚪ Não Iniciada

---

## Fase 1: Foundation (12 semanas)

### Documentação
- [x] Criar estrutura de documentação
- [x] Visão de arquitetura
- [ ] Especificações Fase 1 (01_especificacoes.md)
- [ ] Dúvidas e esclarecimentos (02_duvidas_especificacoes.md)
- [ ] Aprovação formal (03_aprovacao.md)
- [ ] Planejamento de sprints (04_planejamento_sprints.md)
- [ ] Composição de squads (05_composicao_squads.md)

### Semanas 1-2: Database + API Básica
- [ ] PostgreSQL schema (4 tabelas core)
- [ ] Seed validation_rules BACEN
- [ ] API Go com 15 endpoints
- [ ] JSON Schema validation
- [ ] Testes automatizados

### Semanas 3-4: Assistente de Criação
- [ ] Interface de conversa estruturada
- [ ] Integração LLM (Claude/GPT)
- [ ] Preview de objetos
- [ ] Geração automática de schemas

### Semanas 5-6: Dynamic UI
- [ ] Componente DynamicInstanceForm
- [ ] Widget library (10 widgets)
- [ ] Validação client/server-side
- [ ] Relationship picker

### Semanas 7-8: Relacionamentos + Grafo
- [ ] Tabela relationships
- [ ] API de relacionamentos
- [ ] Validação de cardinalidade
- [ ] Visualização React Flow

### Semanas 9-10: State Machine
- [ ] Editor visual de FSM
- [ ] Validação de FSM
- [ ] Engine de transições
- [ ] Histórico de estados

### Semanas 11-12: RAG Básico
- [ ] Pipeline trimodal (SQL + Graph + Vector)
- [ ] Extração de entidades
- [ ] Query builder dinâmico
- [ ] Interface de chat

---

## Fase 2: Brain (8 semanas)

**Status**: ⚪ Aguardando conclusão Fase 1

### Entregas Principais
- [ ] Architect Agent (lê BACEN → gera objects)
- [ ] Document parsing (PDF/Word/HTML)
- [ ] Knowledge base automática
- [ ] RAG avançado

---

## Fase 3: Autonomy (8 semanas)

**Status**: ⚪ Aguardando conclusão Fase 2

### Entregas Principais
- [ ] Discovery de agentes
- [ ] Auto-deploy via Kubernetes
- [ ] Monitoring automático
- [ ] Self-healing

---

## Fase 4: Production (8 semanas)

**Status**: ⚪ Aguardando conclusão Fase 3

### Entregas Principais
- [ ] Integrações reais (BACEN SPI, TigerBeetle)
- [ ] 100 clientes beta
- [ ] Compliance completo
- [ ] Auditoria end-to-end

---

## Pendências Críticas

### Bloqueadores
*Nenhum bloqueador no momento.*

### Decisões Pendentes
1. **Escolha final de LLM para produção** (Claude vs GPT-4)
   - **Status**: Em avaliação
   - **Impacto**: Fase 1 (Semana 3-4)
   - **Responsável**: Tech Lead

2. **Graph Database** (NebulaGraph vs Neo4j vs nativo PostgreSQL)
   - **Status**: Em avaliação
   - **Impacto**: Fase 1 (Semana 7-8)
   - **Responsável**: Architect

### Débitos Técnicos
*Nenhum débito técnico no momento (projeto iniciando).*

---

## Evolução do Projeto

### 2025-12-11
- ✅ Estrutura de documentação criada
- ✅ Visão de arquitetura documentada
- ✅ Backlog inicial elaborado
- 🔄 Aguardando especificações Fase 1

### Próximos Marcos
- **[Data TBD]** Aprovação das especificações Fase 1
- **[Data TBD]** Início da implementação (Sprint 1)

---

## Referências

- [Visão de Arquitetura](../architecture/visao_arquitetura.md)
- [Pendências Detalhadas](pendencias.md)
- [Evolução do Projeto](evolucao_projeto.md)
- [Decisões Técnicas](decisoes_tecnicas.md)

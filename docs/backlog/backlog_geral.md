# Backlog Geral do Projeto SuperCore

**Última Atualização**: 2025-12-11
**Responsável**: Product Owner / Tech Lead

> **📚 VISÃO CONSOLIDADA**: Para arquitetura completa e roadmap detalhado, consulte [docs/architecture/VISAO_FINAL_CONSOLIDADA.md](../architecture/VISAO_FINAL_CONSOLIDADA.md)

---

## Status do Projeto (Roadmap 33 Semanas)

| Fase | Status | Início | Fim Previsto | Progresso | Duração |
|------|--------|--------|--------------|-----------|---------|
| **Fase 0** - Oracle Configuration | ⚪ Não Iniciada | - | - | 0% | 1 semana |
| **Fase 1** - AI Context Generator | ⚪ Não Iniciada | - | - | 0% | 4 semanas |
| **Fase 2** - Specification Editor | ⚪ Não Iniciada | - | - | 0% | 3 semanas |
| **Fase 3** - Object Graph Generator | ⚪ Não Iniciada | - | - | 0% | 6 semanas |
| **Fase 4** - Model Preview & Approval | ⚪ Não Iniciada | - | - | 0% | 2 semanas |
| **Fase 5** - Dynamic UI (3 Pilares) | ⚪ Não Iniciada | - | - | 0% | 8 semanas |
| **Integração** - Gateways + Testing | ⚪ Não Iniciada | - | - | 0% | 9 semanas |

**Legenda**: 🟢 Completa | 🟡 Em Andamento | 🔴 Bloqueada | ⚪ Não Iniciada

**Duração Total Estimada**: 33 semanas (~8 meses)

---

## Fase 0: Oracle Configuration (1 semana)

**Objetivo**: Configurar identidade e consciência da solução antes de qualquer geração de modelos.

### Entregas
- [ ] Página de configuração do Oráculo (interface)
- [ ] Backend: object_definition `oracle_config`
- [ ] Formulário: CNPJ, razão social, licenças, regulamentações
- [ ] Integração: listar integrações disponíveis (TigerBeetle, BACEN SPI, etc.)
- [ ] Políticas: configurar políticas de compliance/risco
- [ ] Validação: apenas 1 oracle_config ativo por vez
- [ ] Testes: criar/editar/visualizar configuração

---

## Fase 1: AI-Driven Context Generator (4 semanas)

**Objetivo**: Interface de upload multi-modal e orquestrador de processamento.

### Entregas
- [ ] Página "Novo Contexto" (upload interface)
- [ ] Upload: PDFs BACEN, Mermaid files, Whimsical images, super prompt
- [ ] Backend: object_definition `context_inputs`
- [ ] Vision API integration (Anthropic Claude para diagramas)
- [ ] PDF parsing (PyMuPDF)
- [ ] Botão "Processar" que aciona ContextProcessorOrchestrator
- [ ] Orquestrador: coordena extração de texto, análise de fluxos, consulta RAG
- [ ] Testes: upload e processamento de contextos reais

---

## Fase 2: Specification Generation (Iterative) (3 semanas)

**Objetivo**: LLM gera especificação editável, usuário itera até aprovar.

### Entregas
- [ ] Backend: object_definition `modelo_especificacao`
- [ ] LLM pipeline: Context → Specification (Markdown)
- [ ] Editor de especificação (Markdown com preview)
- [ ] Chat iterativo com IA (melhorias, perguntas)
- [ ] Versionamento de especificações (histórico de edições)
- [ ] Botão "Aprovar Especificação"
- [ ] Transição: RASCUNHO → APROVADA
- [ ] Testes: ciclo completo de iteração e aprovação

---

## Fase 3: Object Graph Generation (6 semanas)

**Objetivo**: IA processa especificação aprovada e gera todos os componentes.

### Entregas
- [ ] ObjectGraphGenerator service (TypeScript/Go)
- [ ] Geração de object_definitions (entities parsing)
- [ ] Geração de validation_rules (BACEN rules extraction)
- [ ] Geração de integracoes_externas (service configs)
- [ ] Deploy de MCP Action Agents (Kubernetes)
- [ ] Geração de process_definitions (BPM workflows)
- [ ] Geração de telas (screen type conductor)
- [ ] Backend: object_definition `modelo_solucao`
- [ ] Relacionamentos: modelo → componentes
- [ ] Testes: geração completa de modelo a partir de spec

---

## Fase 4: Model Preview & Approval (2 semanas)

**Objetivo**: Preview visual do modelo gerado, aprovação antes de ativar.

### Entregas
- [ ] Página de preview do modelo
- [ ] Visualização: object_definitions criados
- [ ] Visualização: validation_rules associadas
- [ ] Visualização: process_definitions (diagrama React Flow)
- [ ] Visualização: integrações configuradas
- [ ] Visualização: agentes deployados
- [ ] Botão "Aprovar Modelo" / "Editar Especificação"
- [ ] Transição: GERADO → APROVADO
- [ ] Testes: preview e aprovação de modelos

---

## Fase 5: Dynamic UI (3 Pilares) (8 semanas)

**Objetivo**: Renderização 100% dinâmica baseada em object_definitions.

### Entregas

#### Pilar 1: FormGenerator (3 semanas)
- [ ] DynamicInstanceForm component (genérico)
- [ ] Widget library (15 widgets: text, cpf, currency, date, select, etc.)
- [ ] Screen Type Conductor (LLM escolhe tipo de tela: LIST, DETAIL, EDIT, CREATE)
- [ ] Validação client-side (JSON Schema + Zod)
- [ ] Validação server-side (Go)
- [ ] Relationship picker (busca instances de outros objetos)

#### Pilar 2: ProcessFlowVisualization (3 semanas)
- [ ] ProcessDefinitionRenderer (React Flow)
- [ ] Navegação entre nós (TELA, AGENTE, DECISAO, ACAO_HUMANA, INTEGRACAO)
- [ ] Histórico de execução de processos (state_history visual)
- [ ] Debug visual: pausar, inspecionar, retomar
- [ ] Edição visual de workflows (drag-and-drop)

#### Pilar 3: BacenValidationEngine (2 semanas)
- [ ] Interpretador de regra_bacen (executa condições)
- [ ] Validação em tempo real (client-side preview)
- [ ] Fundamentação legal (link para manual fonte)
- [ ] Mensagens de erro contextualizadas
- [ ] Rastreabilidade completa (audit trail)

---

## Integração com Gateways (9 semanas)

**Objetivo**: Conectar SuperCore com gateways externos LBPAY.

### LB Connect (PIX) - 3 semanas
- [ ] Interface abstrata: integracao_externa "LB Connect"
- [ ] Configuração: endpoint BACEN SPI, credenciais mTLS
- [ ] Operações: enviarPix, consultarChave, webhookPixRecebido
- [ ] Testes: envio/recebimento PIX simulado

### LB Dict (DICT API) - 2 semanas
- [ ] Interface abstrata: integracao_externa "LB Dict"
- [ ] Operações: cadastrarChave, consultarChave, removerChave
- [ ] Testes: CRUD de chaves PIX simulado

### Orchestration-GO (Sagas) - 2 semanas
- [ ] Interface: chamada de sagas via HTTP
- [ ] Orquestração: TigerBeetle.debitar → LB Connect.enviarPix
- [ ] Rollback em caso de falha
- [ ] Testes: saga completa com rollback

### Money-Moving - 2 semanas
- [ ] Validação de saldo/limites
- [ ] Cálculo de tarifas (usando logica_negocio_customizada)
- [ ] Integração com TigerBeetle
- [ ] Testes: processamento financeiro end-to-end

---

## Pendências Críticas

### Bloqueadores
*Nenhum bloqueador no momento.*

### Decisões Pendentes
1. **LLM Provider Principal** (Anthropic Claude vs OpenAI GPT-4)
   - **Status**: Claude 3.5 Sonnet recomendado (Vision API para diagramas + raciocínio superior)
   - **Impacto**: Fase 1, 2, 3 (critical)
   - **Responsável**: Tech Lead

2. **Embedding Model**
   - **Status**: OpenAI text-embedding-3-small (custo/benefício)
   - **Impacto**: RAG (Fase 2+)
   - **Responsável**: AI Engineer

3. **Graph Database** (Para visualização, não para storage)
   - **Status**: PostgreSQL relationships table + React Flow (Fase 1-3), NebulaGraph opcional (Fase 4)
   - **Impacto**: Baixo (relationships já em PostgreSQL)
   - **Responsável**: Backend Architect

### Débitos Técnicos
*Nenhum débito técnico no momento (projeto iniciando).*

---

## Evolução do Projeto

### 2025-12-11
- ✅ Estrutura de documentação criada
- ✅ Visão de arquitetura consolidada (VISAO_FINAL_CONSOLIDADA.md)
- ✅ AI-Driven Context Generator definido (6 fases)
- ✅ Backlog atualizado com novo roadmap (33 semanas)
- ✅ CLAUDE.md harmonizado com visão consolidada
- ✅ visao_arquitetura.md atualizado com referências
- 🔄 Próximo passo: Iniciar Fase 0 (Oracle Configuration)

### Próximos Marcos
- **[Data TBD]** Início da Fase 0: Oracle Configuration
- **[Data TBD]** Início da Fase 1: AI-Driven Context Generator

---

## Referências

- **[Visão Consolidada](../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐ Documento primário
- **[Visão de Arquitetura](../architecture/visao_arquitetura.md)** - Resumo estratégico
- **[Stack Tecnológico](../architecture/stack_tecnologico_fases.md)** - Tecnologias por fase
- **[CLAUDE.md](../../CLAUDE.md)** - Guia de implementação master

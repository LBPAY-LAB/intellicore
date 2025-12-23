# 🤔 DÚVIDAS E ESCLARECIMENTOS - SuperCore v2.0

**Data**: 2025-12-22
**Status**: ✅ Todas Respondidas - Ver [DECISOES_CONSOLIDADAS_V2.0.md](DECISOES_CONSOLIDADAS_V2.0.md)
**Propósito**: Consolidar questões identificadas durante análise de consistência v1 → v2.0

---

## ✅ RESPOSTAS CONSOLIDADAS

**TODAS as 30 dúvidas foram respondidas e consolidadas.**

**📄 Documento Principal**: [DECISOES_CONSOLIDADAS_V2.0.md](DECISOES_CONSOLIDADAS_V2.0.md)

Este documento consolidado contém:
- ✅ Decisões finais para todas as 30 dúvidas (Críticas, Importantes, Menores)
- ✅ Arquiteturas detalhadas com diagramas e exemplos de código
- ✅ Lista de ações necessárias organizadas por prioridade
- ✅ Análise de impacto de cada decisão
- ✅ Próximos passos para atualização dos documentos base

**Status**: 🟢 PRONTO PARA IMPLEMENTAÇÃO

**Próximos passos**:
1. ⏳ Atualizar `stack_supercore_v2.0.md` com tecnologias faltantes
2. ⏳ Atualizar `arquitetura_supercore_v2.0.md` com decisões arquiteturais
3. ⏳ Criar novos ADRs (ADR-011, ADR-012, ADR-013)

---

## 📋 HISTÓRICO (Mantido para referência)

As dúvidas originais estão mantidas abaixo para histórico.

---

## 🔴 DÚVIDAS CRÍTICAS (Bloqueiam Implementação)

### D001: Apache Pulsar vs Kafka - Decisão Final Stack v2.0
**Categoria**: Stack / Message Broker
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Define Apache Pulsar v3.4.0 como message broker oficial
- **v2.0 (stack_supercore_v2.0.md)**: Menciona Apache Pulsar v3.4, mas stack_v2.0 não detalha configuração Pulsar
- **Arquitetura v2.0**: Menciona "Apache Pulsar (topic: agent_requests)" em diagrama

**Dúvida**:
A decisão FINAL é Apache Pulsar v3.4.0 como message broker oficial em v2.0? Se sim:



1. Por que stack_supercore_v2.0.md não tem seção dedicada ao Pulsar (como tem para PostgreSQL, NebulaGraph)?

JOsé Silva: A resposta é sim!

2. Devemos incluir detalhamento de:
   - Namespaces por Oracle (multi-tenancy)
   - Schema Registry (Pydantic → Avro)
   - Tópicos padrão (security_alerts, compliance_approvals, etc)
   - Geo-replication config

**Impacto**: Sem clareza, implementação da Fase 2 (Interaction Broker + Pulsar) ficará incompleta

**Status**: ⏳ Aguardando Resposta

**Resposta**:
_[Deixar espaço para resposta]_
José Silva: O que melhor se adequar para este tipo de projeto.

---

### D002: CrewAI - Presença e Integração em v2.0
**Categoria**: Stack / AI Agents
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Lista `CrewAI v0.11.0+` como stack de Multi-agent collaboration
- **v1 (requisitos_funcionais)**: RF020-024 especificam "Orquestração de Agentes (CrewAI)"
- **v2.0 (stack_supercore_v2.0.md)**: NÃO menciona CrewAI, apenas LangGraph e LangChain

**Dúvida**:
CrewAI foi removido ou mantido em v2.0? Se mantido:

1. Por que não aparece em stack_supercore_v2.0.md?
2. Qual a relação entre CrewAI vs LangGraph para orquestração de agentes?
3. Devemos usar:
   - **Opção A**: Apenas LangGraph (remover CrewAI)
   - **Opção B**: CrewAI + LangGraph (cada um com papel específico)

**Impacto**: RF020-024 (Biblioteca de Agentes) dependem desta clarificação

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Penso que deveria aparecer conforme a solução de harmonização de orquestração de agentes: CredwAI, Langgraph, Langchain e LangFlow

---

### D003: LangFlow - Visual Workflows vs Code-First
**Categoria**: Stack / Workflow Orchestration
**Contexto**:
- **v1 (CLAUDE.md)**: Menciona "LangFlow visual workflows" na Fase 1
- **v1 (requisitos_funcionais)**: RF018 "Workflows/Processos de Negócio por Oráculo - LangFlow visual"
- **v2.0 (stack_supercore_v2.0.md)**: NÃO menciona LangFlow, apenas LangGraph

**Dúvida**:
LangFlow foi substituído por LangGraph ou são complementares?
1. Se substituído: Atualizar RF018 para mencionar apenas LangGraph?
2. Se complementares: Qual o papel de cada um?
   - **LangFlow**: UI visual drag-and-drop para Time de Produto?
   - **LangGraph**: Execução state-based programática?

**Impacto**: Decisão afeta como Time de Produto criará workflows (código vs UI visual)

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Fundamental langflow para este projeto. O supercore terá que ter a capacidade de gerar o json de langflow para que o usuário humano possa visualmente validar os eventuais fluxos criados e fazer ajustes.

---

### D004: TigerBeetle - Ledger Contábil Opcional ou Obrigatório?
**Categoria**: Stack / Ledger
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Lista TigerBeetle em "Integrações Externas Configuráveis"
- **v1 (1_VISAO_FINAL_CONSOLIDADA.md)**: Menciona TigerBeetle como integração de Banking Oráculo
- **v2.0 (stack_supercore_v2.0.md)**: NÃO menciona TigerBeetle
- **v2.0 (requisitos_funcionais_v2.0.md)**: Menciona TigerBeetle como exemplo de integração Banking

**Dúvida**:
TigerBeetle é:
1. **Opcional**: Apenas para Oráculos Banking (não faz parte do SuperCore core)?
2. **Obrigatório**: Parte do core para auditoria/ledger de TODAS as transações?

Se opcional, deve permanecer FORA de stack_supercore_v2.0.md (correto).
Se obrigatório, deve ser adicionado à stack como dependência.

**Impacto**: Decisão afeta arquitetura de auditoria e compliance

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: O tigerbeetle não faz parte da implementação do SuperCore. Apenas como exemplo foi referenciado porque em projetos de Core Banking que sejam implementados usando o SuperCore, terá que um objeto de integração que irá integrar com o TigerBeetle ou outro qq ledger conforme o contexto de projeto implementado com base no supercore.

---

### D005: Next.js 14 App Router - Server Actions vs API Routes
**Categoria**: Stack / Frontend Architecture
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Especifica "Next.js 14 (App Router)" com React Server Actions
- **v2.0 (stack_supercore_v2.0.md)**: Especifica "Next.js 14.1.0+ App Router"
- **Ambos**: Mencionam shadcn/ui + TailwindCSS

**Dúvida**:
Qual pattern de comunicação Frontend → Backend será usado?
1. **Server Actions**: Frontend chama Server Actions (Next.js 14) diretamente, sem API Routes?
2. **API Routes**: Frontend chama `/api/*` endpoints tradicionais?
3. **Híbrido**: Server Actions para mutations, API Routes para queries?

**Impacto**: Afeta estrutura de pastas, autenticação, e performance

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Temos que garantir a melhor arquitetura para que o Portal de BackOffice do supercore possa chamar os serviços de back-end o mais eficientemente possivel. Veja com um agente especialista o melhor para o nosso cenário de supercore.
---

## 🟡 DÚVIDAS IMPORTANTES (Afetam Design)

### D010: Multi-Tenancy - Namespace Pulsar vs RLS PostgreSQL
**Categoria**: Arquitetura / Multi-Tenancy
**Contexto**:
- **v2.0 (arquitetura_supercore_v2.0.md)**: Define multi-tenancy via `oracle_id` + RLS PostgreSQL
- **v1 (1_CLAUDE.md)**: Menciona "Namespaces por Oracle (isolamento LGPD/BACEN)" no Pulsar

**Dúvida**:
Como garantir isolamento multi-tenant COMPLETO?
1. **Database**: RLS PostgreSQL (`WHERE oracle_id = current_setting('app.oracle_id')`) ✅ Claro
2. **Message Broker**: Namespace Pulsar (`tenant-{oracle_id}/namespace/topic`) ✅ Claro
3. **Object Storage**: MinIO buckets por Oracle (`oracle-{uuid}/files/`) ❓ Não especificado
4. **Graph Database**: NebulaGraph spaces por Oracle? ❓ Não especificado

**Impacto**: Sem isolamento completo, pode haver vazamento de dados entre Oráculos

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Sim a ideia será poder configurar um Oracle como sendo multi-tenant ou single tenant.

---

### D011: vLLM vs Ollama - Quando usar cada um?
**Categoria**: Stack / LLM Serving
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Lista Ollama (dev) e vLLM (prod)
- **v2.0 (stack_supercore_v2.0.md)**: Menciona ambos sem clareza de uso

**Dúvida**:
Quando usar cada ferramenta?
1. **Development**: Ollama localhost (baixa latência, zero custo) ✅
2. **Production**: vLLM GPU cluster (alta throughput) ✅
3. **Staging**: Qual usar? Ollama ou vLLM?
4. **Fallback**: Claude Opus 4.5 API quando? (apenas quando vLLM falha ou sempre?)

**Impacto**: Afeta configuração de ambientes e custos

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Como estou a desenvolver este projeot num mackbok pro m3 max... durante a fase de desenvolvimento terei que o usar o Ollama... depois em produção usaremos o vLLM. Nesse sentdo, via variaveis de ambiente ou outro mecanismo teremos que garantir esta diferenciação entre configuração DEV e Prod.

---

### D012: PostgreSQL 15 vs 16 - Versão Oficial
**Categoria**: Stack / Database
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "PostgreSQL 15+ (pgvector)"
- **v2.0 (stack_supercore_v2.0.md)**: "PostgreSQL 16+"
- **v2.0 (arquitetura_supercore_v2.0.md)**: "PostgreSQL 15 + NebulaGraph 3.8 + pgvector"

**Dúvida**:
Qual é a versão OFICIAL para v2.0?
1. **PostgreSQL 15**: Mantém v1 (estabilidade)
2. **PostgreSQL 16**: Upgrade para v2.0 (novas features)

Se PostgreSQL 16, quais features justificam o upgrade?
- Parallel query improvements?
- JSONB performance gains?
- Novas features de pgvector?

**Impacto**: Testes, compatibilidade, migrações

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: "PostgreSQL 15 + NebulaGraph 3.8 + pgvector" Mas caso o agente responsavel pela arquitetura e com os skills correctos considere que poderemos usar a versão 16 sem problemas então deveremos usar a versão 16 ou a mais recente de acordo com este critério

---

### D013: NebulaGraph 3.7 vs 3.8 - Versão Oficial
**Categoria**: Stack / Graph Database
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "NebulaGraph 3.7+"
- **v2.0 (arquitetura_supercore_v2.0.md)**: "NebulaGraph 3.8"

**Dúvida**:
Versão oficial para v2.0?
1. **NebulaGraph 3.7**: Mantém v1
2. **NebulaGraph 3.8**: Upgrade

Se 3.8, quais features novas são críticas?

**Impacto**: Compatibility, testing, cluster config

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Este é um projeto altamente dependente das funcionalidades do Nebulagraph em termos de pesquisas a grafos, performance... use a versão que considere mais estável conforme o escopo deste projeto.

---

### D014: Deployment Orchestrator - Kubernetes Obrigatório?
**Categoria**: Arquitetura / Deployment
**Contexto**:
- **v2.0 (arquitetura_supercore_v2.0.md)**: Define "Deployment Orchestrator" que:
  - Gera código (Middleware, Frontend, Agents)
  - Faz build de Docker images
  - Deploya em Kubernetes namespaces
- **v1**: Não menciona Kubernetes explicitamente

**Dúvida**:
Kubernetes é OBRIGATÓRIO para SuperCore v2.0?
1. **Sim**: Deployment Orchestrator depende de k8s (namespaces, pods, services)
2. **Não**: Pode rodar em Docker Compose (dev) e k8s (prod)

Se sim, qual distribuição?
- **Managed**: AWS EKS, GCP GKE, Azure AKS
- **Self-hosted**: k3s, k8s vanilla

**Impacto**: Complexidade de setup, requisitos de infraestrutura

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: A ideia será permitir que os Oraculos possam rodar todos no mesmo cluster e/ou no limite possa rodar isolados... cada oraculo em cada cluster. Terá que ser uma configuração efectuada em cada cluster.

---

### D015: Code Generation - Templates Jinja2 vs AST Manipulation?
**Categoria**: Stack / Code Generation
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Menciona "AST manipulation (Python ast, Go parser)"
- **v2.0 (stack_supercore_v2.0.md)**: Não detalha estratégia de code generation

**Dúvida**:
Como código será gerado?
1. **Templates**: Jinja2 para gerar código (simples, menos flexível)
2. **AST**: Manipulação de AST (complexo, mais poderoso)
3. **Híbrido**: Templates para boilerplate, AST para lógica complexa

**Impacto**: Qualidade do código gerado, manutenibilidade

**Status**: ⏳ Aguardando Resposta

**Resposta**:
José Silva: Teremos um cenário em que agentes do SuperCore irão criar agentes no Oraculo. Então a geração de codigo e scripts tem que ser a necessária que esses novos agentes possam rodar sem problemas tanto ao nivel de CrewAI, Langgrph, LangChain e langFlow....

---

## 🟢 DÚVIDAS MENORES (Clarificações)

### D020: React Flow - Versão e Features Usadas
**Categoria**: Stack / Frontend
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "React Flow 11.10.0+"
- **v2.0 (stack_supercore_v2.0.md)**: "React Flow 11.10.0+"

**Dúvida**:
React Flow será usado para:
1. Workflow visualization (LangFlow/LangGraph visual editor) ✅
2. Object relationship graph (grafo de entidades) ✅
3. Outros usos?

Quais features críticas:
- Custom nodes?
- Edge markers?
- Minimap?
- Controls (zoom/pan)?

**Impacto**: Baixo - apenas clarificação

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Luis Silva: Todas são criticas.

---

### D021: i18n - next-i18next vs react-i18next
**Categoria**: Stack / Internacionalização
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Menciona "react-i18next (React) + next-i18next (Next.js)"
- **v2.0 (stack_supercore_v2.0.md)**: Lista ambos sem clareza de qual usar

**Dúvida**:
Com Next.js 14 App Router, qual biblioteca usar?
1. **next-i18next**: Funciona com App Router? (docs indicam Pages Router apenas)
2. **react-i18next**: Recomendado para App Router?
3. **next-intl**: Alternativa moderna para App Router?

**Impacto**: Médio - afeta estrutura de traduções

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Jose Luis Silva: Tem que ser a que melhor harmonizar com a stack de implementação do portal.

---

### D022: Pydantic v1 vs v2 - Versão Oficial
**Categoria**: Stack / Python Validation
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "pydantic v2.6.0"
- **v2.0**: Não especifica versão

**Dúvida**:
Confirmar Pydantic v2.6.0+?
- Pydantic v2 tem breaking changes vs v1
- LangChain/LangGraph são compatíveis com Pydantic v2?

**Impacto**: Baixo - apenas confirmação

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Jose Silva: preciso que seja você a confirmar. Obrigado.

---

### D023: Whisper - Self-hosted vs API?
**Categoria**: Stack / Speech-to-Text
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "openai-whisper v20231117 (self-hosted)"
- **v2.0**: Não menciona Whisper

**Dúvida**:
Whisper continua como self-hosted em v2.0?
1. **Self-hosted**: Whisper rodando em GPU local (privacy, zero custo API)
2. **API**: OpenAI Whisper API (simplicidade, custo por uso)

**Impacto**: Baixo - custos e privacidade

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Uma premissa nesta projeto que NUNCA pode ficar esquecida, tudo é self-hosted até palavra em contrário.

---

### D024: Apache Flink - Versão e Uso em v2.0
**Categoria**: Stack / Stream Processing
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "Apache Flink v1.18.0 - Stream processing"
- **v2.0 (stack_supercore_v2.0.md)**: Não menciona Flink

**Dúvida**:
Apache Flink continua na stack v2.0?
- Se sim: Qual o uso específico? (real-time ETL, event processing)
- Se não: O que substitui? (Celery + Pulsar suficiente?)

**Impacto**: Médio - afeta arquitetura de stream processing

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: O Apache Flink deverá ser enquadrado na v2 também conforme a utilidade que ele poderá ter no SuperCore.

---

### D025: Celery vs RQ - Task Queue Oficial
**Categoria**: Stack / Task Queue
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "Celery v5.3.0 - Distributed tasks"
- **v2.0 (stack_supercore_v2.0.md)**: Não menciona Celery

**Dúvida**:
Celery continua como task queue oficial?
- Alternativas consideradas: RQ, Dramatiq, ARQ
- Justificativa para Celery: Maturidade, ecosystem

**Impacto**: Baixo - apenas confirmação

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Sim. Mas se for redudante com o Pulsar. Deveremos usar Pulsar.

---

### D026: MinIO - Self-hosted Obrigatório ou S3 Opcional?
**Categoria**: Stack / Object Storage
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "MinIO v7.2.3 - S3-compatible, self-hosted"
- **v2.0 (stack_supercore_v2.0.md)**: Menciona MinIO

**Dúvida**:
MinIO é:
1. **Obrigatório**: Sempre self-hosted (dev + prod)
2. **Opcional**: Pode usar AWS S3 em prod, MinIO em dev?

**Impacto**: Baixo - flexibilidade de deployment

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Sempre MinIO self-hosted.

---

### D027: Redis - Versão 7+ Confirmada?
**Categoria**: Stack / Cache/Queue
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "Redis 7+"
- **v2.0**: Não especifica versão

**Dúvida**:
Confirmar Redis 7+?
- Features específicas do Redis 7 usadas: Sharded Pub/Sub, Functions?

**Impacto**: Baixíssimo - apenas confirmação

**Status**: ⏳ Aguardando Resposta

**Resposta**:

José Silva: Conforme as necessidades do projeto em cada contexto que se aplique.

---

### D028: OpenTelemetry - Tracing Completo em v2.0?
**Categoria**: Stack / Observability
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: Lista OpenTelemetry v1.21.0 (Go + Python)
- **v2.0 (stack_supercore_v2.0.md)**: Não menciona explicitamente

**Dúvida**:
OpenTelemetry continua como stack de observability?
- Traces, Metrics, Logs?
- Backend: Jaeger, Tempo, ou cloud-native (AWS X-Ray, GCP Trace)?

**Impacto**: Médio - arquitetura de observability

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Fundamental usarmos. Temos que usar. Inclua.

---

### D029: Playwright - Browser Automation Necessário?
**Categoria**: Stack / Web Scraping
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "Playwright v1.40.0 - Browser automation"
- **v2.0**: Não menciona

**Dúvida**:
Playwright continua para:
1. **Web scraping**: Sites com JavaScript pesado
2. **E2E testing**: Testes end-to-end frontend

Se ambos, manter na stack.

**Impacto**: Baixo - uso específico

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Fundamental. Usar.

---

### D030: Scrapy - Crawler em Produção?
**Categoria**: Stack / Web Scraping
**Contexto**:
- **v1 (1_stack_tecnologico_fases.md)**: "Scrapy v2.11.0 - Web crawling"
- **v2.0**: Não menciona

**Dúvida**:
Scrapy será usado para crawling em produção?
- Use cases: Documentação pública (BACEN), regulações online?
- Alternativa: Apenas httpx/aiohttp para APIs REST?

**Impacto**: Baixo - uso específico

**Status**: ⏳ Aguardando Resposta

**Resposta**:

Fundamental usar.

---

## 📊 RESUMO

**Total de Dúvidas**: 30
- 🔴 Críticas: 5
- 🟡 Importantes: 10
- 🟢 Menores: 15

**Status Geral**: ⏳ Aguardando Respostas

---

**Instruções Finais**:
1. Priorize responder dúvidas CRÍTICAS primeiro (D001-D005)
2. Dúvidas IMPORTANTES podem aguardar início da implementação
3. Dúvidas MENORES são clarificações que não bloqueiam
4. Após respostas, atualizar `stack_supercore_v2.0.md` e `arquitetura_supercore_v2.0.md` conforme necessário

---

**Versão**: 1.0.0
**Última Atualização**: 2025-12-21
**Próxima Revisão**: Após respostas das dúvidas críticas

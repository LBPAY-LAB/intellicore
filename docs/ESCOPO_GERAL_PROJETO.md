# ESCOPO GERAL DO PROJETO: Plataforma Meta-Core Banking

**Versão**: 1.0
**Data**: 09 de Dezembro de 2025
**Objetivo**: Definir escopo consolidado das 4 fases de implementação

---

## RESUMO EXECUTIVO

Este projeto visa construir uma **Plataforma Geradora de Core Banking** baseada em IA, capaz de transformar documentação regulatória (Bacen, CVM) e especificações de produto em um sistema bancário completo e operacional.

**Meta Final**: Ingerir documentação → Gerar Core Banking completo em dias, não meses.

---

## ESCOPO DAS 4 FASES

### 📋 FASE 1: FUNDAÇÃO (Meses 1-3)
**Responsável**: Equipe Core (Backend + Frontend + DevOps)

#### Objetivo
Construir a **infraestrutura universal** que permite gestão abstrata de objetos e instâncias, com portal de backoffice funcional.

#### Entregas Principais

**1. Backend - API Universal de Objetos**
- Endpoints RESTful para CRUD de `object_definitions` e `instances`
- Engine de validação JSON Schema
- Sistema de transição de estados (FSM)
- Persistência em PostgreSQL (JSONB)

**2. Frontend - Portal de Backoffice**
- **Back Section**: Editor para criar/editar `object_definitions` (manual)
- **Front Section**:
  - Renderizador dinâmico de formulários (lê schema)
  - Visualizador de instâncias
  - Navegador de relacionamentos entre objetos
- **UX/UI**: Interface intuitiva para usuários de negócio (não técnicos)

**3. Infraestrutura**
- PostgreSQL com índices GIN para JSONB
- NebulaGraph (básico) para relacionamentos
- Apache Pulsar (local) para eventos
- Kubernetes local (kind/minikube)

#### Critério de Sucesso
✅ Criar manualmente um objeto "Cliente PF"
✅ Via UI, criar 10 instâncias (João, Maria, etc.)
✅ Visualizar relacionamentos (Cliente → Conta)
✅ **Zero tabelas hardcoded** (apenas `object_definitions` + `instances`)

#### Escopo Detalhado
Ver documento: `FASE_1_FUNDACAO_DETALHADA.md`

---

### 🧠 FASE 2: CÉREBRO (Meses 4-6)
**Responsável**: Equipe IA + Backend

#### Objetivo
Implementar o **Architect Agent** que analisa documentação e cria `object_definitions` automaticamente.

#### Entregas Principais

**1. RAG Trimodal**
- PgVector: Embeddings de documentação
- NebulaGraph: Ontologia de relacionamentos
- VLLM + Llama 3 (70B): LLM local

**2. Architect Agent (CrewAI)**
- Ingestão de PDFs (OCR + parsing)
- Extração de entidades e atributos
- Geração de `object_definitions` em JSON
- Loop de validação humana

**3. Back Section (Beta)**
- Upload de documentos
- Review de propostas da IA
- Aprovação/edição de definições

#### Critério de Sucesso
✅ Upload "Manual PIX.pdf" → 5 objetos propostos
✅ Acurácia > 80% (humano aprova sem editar)
✅ Tempo < 30 min para doc de 100 páginas

---

### 🤖 FASE 3: AUTONOMIA (Meses 7-9)
**Responsável**: Equipe IA + DevOps

#### Objetivo
Descoberta automática de **agentes especializados** e geração completa do sistema (infra + código).

#### Entregas Principais

**1. Discovery Engine**
- Análise de "verbos" na documentação
- Mapeamento Entidade → Agente necessário
- Geração de `agent_definitions`

**2. Code Generator**
- Kubernetes manifests (deployments, services)
- Pulsar topics
- API endpoints auto-registrados
- NebulaGraph schemas

**3. Orchestrator Agent**
- Coordena pipeline completo (docs → sistema)
- Deploy automático (GitOps)
- Testes automatizados

#### Critério de Sucesso
✅ 3 documentos → Sistema completo em < 6h
✅ 23 agentes deployados automaticamente
✅ 89 endpoints API gerados
✅ Testes passam (> 90%)

---

### 🚀 FASE 4: PRODUÇÃO (Meses 10-11)
**Responsável**: Equipe Produção + Compliance

#### Objetivo
Core Banking **piloto real** com PIX homologado pelo BACEN.

#### Entregas Principais

**1. Integrações Reais**
- LB Connect (SPI) em produção
- LB Dict (consulta chaves PIX)
- TigerBeetle Ledger

**2. Hardening**
- mTLS, Keycloak (IAM), Auditoria
- Observabilidade (Prometheus, Grafana, Loki)
- NoOps Agent (básico)

**3. Homologação BACEN**
- Suite de testes oficial
- Certificação

**4. Piloto Restrito**
- 1 instituição parceira
- 100 clientes beta
- Produto: Conta Digital + PIX

#### Critério de Sucesso
✅ BACEN aprova homologação
✅ 1.000 transações reais processadas
✅ Uptime > 99.9%
✅ < 0.1% falhas

---

## DEPENDÊNCIAS CRÍTICAS ENTRE FASES

```
FASE 1 (Fundação)
  ├─→ object_definitions + instances funcionando
  ├─→ UI dinâmica renderizando formulários
  └─→ Relacionamentos entre objetos visíveis
          ↓
FASE 2 (Cérebro IA)
  ├─→ IA lê docs e gera object_definitions
  ├─→ Validação humana funciona
  └─→ RAG trimodal indexa conhecimento
          ↓
FASE 3 (Autonomia)
  ├─→ Descoberta de agentes
  ├─→ Geração de código/infra
  └─→ Deploy automatizado
          ↓
FASE 4 (Produção)
  ├─→ Integrações BACEN reais
  ├─→ Hardening de segurança
  └─→ Piloto com clientes reais
```

**⚠️ Bloqueio**: Não podemos pular fases. Cada uma depende da anterior estar 100% validada.

---

## MARCOS DE DECISÃO (GO/NO-GO)

### Fim da Fase 1
- [ ] Objetos criados manualmente funcionam perfeitamente?
- [ ] UI renderiza formulários dinamicamente?
- [ ] Relacionamentos são navegáveis no frontend?

**Se NÃO**: Reavaliar arquitetura JSONB vs. schema rígido.

### Fim da Fase 2
- [ ] IA extrai objetos com > 80% acurácia?
- [ ] Loop humano é eficiente (não cria gargalo)?
- [ ] RAG recupera contexto corretamente?

**Se NÃO**: Considerar modelo maior ou fine-tuning.

### Fim da Fase 3
- [ ] Sistema gerado passa testes automatizados?
- [ ] 6h doc→código é realista?
- [ ] Agentes descobertos são coerentes?

**Se NÃO**: Simplificar escopo ou aceitar intervenção manual.

### Fim da Fase 4
- [ ] BACEN aprovou homologação?
- [ ] Piloto opera sem incidentes críticos?
- [ ] Clientes beta satisfeitos (NPS > 8)?

**Se NÃO**: Estender piloto, não lançar público.

---

## RISCOS TRANSVERSAIS

| Risco | Impacto | Mitigação |
|:---|:---|:---|
| Performance de JSONB em escala | Alto | Benchmarking precoce, índices GIN otimizados |
| LLM alucina requisitos | Crítico | Loop de validação humana obrigatório |
| Complexidade de descoberta de agentes | Alto | Começar com casos simples, evoluir |
| Falha em homologação BACEN | Crítico | Consultoria especializada desde Fase 1 |

---

## INVESTIMENTO TOTAL ESTIMADO

### Infraestrutura (11 meses)
- **Fase 1-3**: ~$3.5k/mês × 9 meses = **$31.5k**
- **Fase 4**: ~$8k/mês × 2 meses = **$16k**
- **Total Infra**: **~$47.5k**

### Equipe (custo variável por região)
- **Fase 1**: 4 pessoas × 3 meses
- **Fase 2**: 4 pessoas × 3 meses
- **Fase 3**: 5 pessoas × 3 meses
- **Fase 4**: 5 pessoas × 2 meses
- **Total**: ~40 pessoas-mês

### Consultoria Externa
- Compliance BACEN: $20k (Fase 4)
- Security Audit: $10k (Fase 4)

**Total Geral**: Infra + Equipe + Consultoria (varia por localização)

---

## PRÓXIMOS PASSOS

1. ✅ **Aprovar este escopo geral**
2. 🔄 **Detalhar Fase 1** (documento separado)
3. ⏳ **Iniciar implementação Fase 1** (após aprovação)

---

**Documento aprovado por**: [Stakeholders]
**Data de aprovação**: [Pendente]
**Próxima revisão**: Fim da Fase 1

# ROADMAP DE IMPLEMENTAÇÃO: 4 Fases Estratégicas

**Versão**: 1.0
**Data**: 09 de Dezembro de 2025
**Objetivo**: Dividir a construção da plataforma em fases incrementais e validáveis

---

## VISÃO GERAL DAS 4 FASES

```
FASE 1: FUNDAÇÃO             FASE 2: CÉREBRO              FASE 3: AUTONOMIA            FASE 4: PRODUÇÃO
(2-3 meses)                  (2-3 meses)                  (2-3 meses)                  (1-2 meses)
─────────────────────────────────────────────────────────────────────────────────────────────────────

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Infraestrutura  │    →    │ Architect Agent │    →    │ Descoberta      │    →    │ Core Banking    │
│ + API Universal │         │ + Ingestão Docs │         │ de Agentes      │         │ Piloto Real     │
│ + UI Base       │         │ + RAG Trimodal  │         │ + Geração Auto  │         │ (PIX Real)      │
└─────────────────┘         └─────────────────┘         └─────────────────┘         └─────────────────┘

ENTREGA:                    ENTREGA:                    ENTREGA:                    ENTREGA:
✅ CRUD manual              ✅ PDF → Objects            ✅ Docs → Sistema           ✅ Homologação
   de Objetos/Instâncias       automático                  Completo Gerado            BACEN
✅ UI renderiza             ✅ Validação humana         ✅ Agentes dinâmicos        ✅ Primeiras
   formulários                 no loop                     deployados                 transações reais
```

---

## 🏗️ FASE 1: FUNDAÇÃO (Meses 1-3)
### **Objetivo**: Construir a infraestrutura core e provar o conceito de object_definitions/instances

### 1.1. Entregas Técnicas

#### 1.1.1. Infraestrutura Base
- **PostgreSQL**:
  ```sql
  CREATE TABLE object_definitions (
      id UUID PRIMARY KEY,
      name VARCHAR UNIQUE,
      version INT,
      schema JSONB,
      rules JSONB,
      states JSONB,
      created_at TIMESTAMP
  );

  CREATE TABLE instances (
      id UUID PRIMARY KEY,
      object_definition_id UUID REFERENCES object_definitions(id),
      data JSONB,
      state VARCHAR,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
  );
  ```

- **NebulaGraph**: Setup básico com schema inicial
- **Apache Pulsar**: Cluster local (Docker) com tópicos base
- **Kubernetes**: Cluster local (kind/minikube) para desenvolvimento

#### 1.1.2. API Universal (Go)
Implementar os endpoints críticos:

```
POST   /api/v1/definitions              (Criar Objeto Base)
GET    /api/v1/definitions/:id          (Ler definição)
POST   /api/v1/instances/:def_name      (Criar Instância)
GET    /api/v1/instances/:def_name      (Listar instâncias)
GET    /api/v1/instances/:id            (Ler instância)
POST   /api/v1/instances/:id/transition (Mudar estado)
```

**Validação**: Engine de validação JSON Schema integrada

#### 1.1.3. Frontend Base (Next.js)
- **Back Section (Alpha)**:
  - Formulário para criar `object_definitions` manualmente (JSON editor)
  - Visualizador de definições criadas (lista simples)

- **Front Section (Alpha)**:
  - Renderizador dinâmico de formulários (lê `schema` do objeto)
  - Lista de instâncias com filtros básicos
  - Painel de detalhes de instância

#### 1.1.4. Template de Agente Genérico (Python)
Implementar o `GenericFSMAgent` básico:

```python
class GenericFSMAgent:
    def __init__(self, definition_id):
        self.definition = load_definition(definition_id)

    def handle_event(self, event):
        # Lê regras do object_definition
        # Executa validações
        # Transição de estado
        # Persiste
```

Deploy manual de 1 agente de exemplo.

### 1.2. Critérios de Sucesso (Fase 1)

✅ **Teste de Aceitação**:
1. Criar manualmente (via JSON) um `object_definition` para "Cliente PF"
2. Via UI, criar 10 instâncias de "Cliente PF" (João, Maria, etc.)
3. Executar transição de estado: DRAFT → ACTIVE
4. Validar que formulário foi gerado dinamicamente
5. Validar que agente genérico processou a transição

**Métrica**:
- Tempo para criar novo tipo de objeto: **< 5 minutos** (manual)
- Instâncias criadas: **10** com sucesso
- **Zero** tabela hardcoded criada (apenas `object_definitions` + `instances`)

### 1.3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|:---|:---|:---|
| JSON Schema complexo demais para validação | Alto | Usar biblioteca robusta (ajv, jsonschema), começar com schemas simples |
| Performance de JSONB no Postgres | Médio | Criar índices GIN, benchmarking precoce |
| Renderização dinâmica de UI muito genérica | Alto | Criar "widgets" específicos (CPF, moeda) desde o início |

### 1.4. Equipe Sugerida (Fase 1)
- **1 Backend Engineer** (Go): API Universal
- **1 Frontend Engineer** (React/Next.js): UI Dinâmica
- **1 DevOps Engineer**: Infra (K8s, Pulsar, Postgres)
- **1 Python Engineer**: Template de Agente Genérico

---

## 🧠 FASE 2: CÉREBRO (Meses 4-6)
### **Objetivo**: Implementar o Architect Agent que lê documentação e cria object_definitions automaticamente

### 2.1. Entregas Técnicas

#### 2.1.1. RAG Trimodal
- **PgVector**: Extensão instalada, pipeline de embeddings
- **NebulaGraph**: Integração com API Universal (persistir relacionamentos)
- **LLM (VLLM + Llama 3)**: Deploy local com BentoML
  - Modelo: `meta-llama/Llama-3.1-70B-Instruct` (quantizado para 8-bit)
  - Endpoint: `/v1/chat/completions` (OpenAI-compatible)

#### 2.1.2. Architect Agent (CrewAI)
Primeira IA autônoma da plataforma:

**Capabilities**:
1. **Ingestão de Documentos**:
   - PDF → Texto (OCR via Tesseract + pypdf)
   - Markdown → Texto estruturado
   - Indexar no PgVector (embeddings)

2. **Extração de Entidades**:
   - Prompt: *"Analise este manual do Bacen e identifique todas as entidades mencionadas (ex: Transação PIX, Conta, Cliente)"*
   - Output: Lista de entidades candidatas

3. **Geração de `object_definitions`**:
   - Para cada entidade: gerar schema JSON
   - Prompt: *"Para a entidade 'Transação PIX', quais são os atributos obrigatórios segundo o documento?"*
   - Output: JSON válido para `object_definitions`

4. **Loop de Validação Humana**:
   - IA propõe definição
   - Humano revisa via Back Section
   - Aprova ou edita
   - IA aprende com feedback (salva exemplos corretos no RAG)

#### 2.1.3. Back Section (Beta)
- **Editor de Documentos**: Upload de PDFs
- **Pipeline de Ingestão**: Progress bar do processamento
- **Review de Propostas**: IA sugere `object_definitions`, humano aprova/edita
- **Histórico de Versões**: Git-like para rastrear mudanças

### 2.2. Critérios de Sucesso (Fase 2)

✅ **Teste de Aceitação**:
1. Upload do "Manual PIX v10.pdf" (oficial do Bacen)
2. Architect Agent processa e propõe **5 object_definitions**:
   - `obj_transacao_pix`
   - `obj_chave_pix`
   - `obj_participante_pix`
   - `obj_devolucao_pix`
   - `obj_infrator_pix`
3. Humano valida e aprova 4 de 5 (1 precisa de ajuste)
4. Sistema persiste as definições
5. Front Section agora permite criar instâncias dos 5 novos tipos

**Métricas**:
- Acurácia de extração: **> 80%** (humano aprova sem editar)
- Tempo de processamento: **< 30 min** para documento de 100 páginas
- Compliance: **100%** (schemas gerados refletem exatamente a regulação)

### 2.3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|:---|:---|:---|
| LLM alucina atributos não existentes | Alto | Loop de validação humana obrigatório, few-shot prompting com exemplos |
| Custo de inferência alto (70B modelo) | Médio | Quantização, batching, cache de respostas similares |
| OCR falha em PDFs escaneados | Médio | Preprocessamento (deskew, denoising), fallback para input manual |

### 2.4. Equipe Sugerida (Fase 2)
- **1 AI/ML Engineer**: Architect Agent + RAG
- **1 Backend Engineer**: Integração API ↔ IA
- **1 Frontend Engineer**: UI de revisão de propostas
- **1 Especialista de Produto** (Bancário): Validação de compliance

---

## 🤖 FASE 3: AUTONOMIA (Meses 7-9)
### **Objetivo**: Descoberta automática de agentes e geração completa do sistema (infra + código)

### 3.1. Entregas Técnicas

#### 3.1.1. Discovery Engine (Descoberta de Agentes)
Extensão do Architect Agent com nova capability:

**Processo**:
1. **Análise de Verbos**: Varrer documentação por ações (validar, processar, notificar)
2. **Mapeamento Entidade → Agente**:
   - "Transação PIX precisa ser validada" → Agente `pix_validator`
   - "Chave deve ser consultada no DICT" → Agente `dict_integrator`
3. **Grafo de Dependências**:
   - `pix_processor` depende de `dict_validator`
   - `dict_validator` depende de `external_api:dict.bcb.gov.br`

**Output**: Registros em `agent_definitions`

#### 3.1.2. Code Generator (Geração de Infra)
IA que gera automaticamente:

1. **Kubernetes Manifests**:
   ```yaml
   # deployment-agent-pix-processor.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: agent-pix-processor
   spec:
     replicas: 3
     template:
       spec:
         containers:
         - name: agent
           image: supercore/generic-fsm-agent:latest
           env:
           - name: AGENT_DEFINITION_ID
             value: "agent_pix_processor"
   ```

2. **Pulsar Topics**:
   - `topic:pix/transactions/incoming`
   - `topic:pix/transactions/validated`

3. **API Endpoints** (auto-registro no API Gateway):
   - `POST /api/v1/pix/transactions`

4. **NebulaGraph Schema**:
   ```sql
   CREATE TAG transacao_pix (valor decimal, estado string);
   ```

#### 3.1.3. Orchestrator Agent
Agente mestre que coordena todo o pipeline:

```
Documentação → Architect → Discovery → Code Generator → Deployer → Validator
```

**Capabilities**:
- Orquestrar sequência de agentes
- Executar `kubectl apply`
- Rodar testes automatizados
- Gerar relatório final

#### 3.1.4. Auto-Deploy e Validação
- **CI/CD para Agentes**: GitOps com ArgoCD
- **Testes Automatizados**: Suite que valida cada agente descoberto
- **Rollback Automático**: Se testes falham, reverte deploy

### 3.2. Critérios de Sucesso (Fase 3)

✅ **Teste de Aceitação (End-to-End)**:
1. Upload de 3 documentos:
   - Manual PIX (Bacen)
   - Especificação SPI
   - PRD interno "Conta Digital"
2. Clicar "Gerar Sistema"
3. Aguardar (≈ 4 horas de processamento)
4. Resultado:
   - **47 object_definitions** criados
   - **23 agent_definitions** criados
   - **23 pods** rodando no Kubernetes
   - **89 endpoints** API gerados
   - **UI Front Section** com todos os novos tipos renderizados
5. Teste funcional:
   - Via UI, criar "Transação PIX" (instância)
   - Sistema valida chave no DICT (agente descoberto)
   - Transição de estado PENDENTE → VALIDADO
   - **Sucesso**

**Métricas**:
- Taxa de sucesso de geração: **> 90%** (testes passam)
- Tempo total: **< 6 horas** (ingestão → sistema operacional)
- Cobertura de docs: **100%** (todos os requisitos viraram código/config)

### 3.3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|:---|:---|:---|
| Geração de código bugado | Crítico | Testes automatizados obrigatórios, sandbox antes de prod |
| Dependências circulares entre agentes | Alto | Detector de ciclos no grafo, alertas para humano |
| Over-engineering (muitos agentes desnecessários) | Médio | Regras de consolidação (agentes similares → merge) |

### 3.4. Equipe Sugerida (Fase 3)
- **2 AI/ML Engineers**: Discovery + Code Generator
- **1 Backend Engineer**: Orchestrator
- **1 DevOps Engineer**: Auto-deploy + GitOps
- **1 QA Engineer**: Testes automatizados

---

## 🚀 FASE 4: PRODUÇÃO (Meses 10-11)
### **Objetivo**: Colocar em produção um Core Banking piloto com PIX real homologado pelo BACEN

### 4.1. Entregas Técnicas

#### 4.1.1. Integração Real com BACEN
- **LB Connect (SPI)**: Ambiente de homologação → Produção
- **LB Dict**: Consulta de chaves PIX reais
- **TigerBeetle Ledger**: Configurado para contabilidade imutável

#### 4.1.2. Hardening de Segurança
- **mTLS**: Entre todos os microsserviços
- **Keycloak**: IAM completo (RBAC dinâmico)
- **Auditoria**: Logs imutáveis (ELK Stack)
- **Backup**: Estratégia 3-2-1 para Postgres + NebulaGraph

#### 4.1.3. Observabilidade (AIOps Alpha)
- **Prometheus + Grafana**: Métricas de sistema e agentes
- **Loki**: Logs centralizados
- **Jaeger**: Distributed tracing
- **NoOps Agent (Básico)**:
  - Detecta anomalias
  - Cria alertas (ainda não executa ações)

#### 4.1.4. Front Section (Produção)
- **Interface Neural Sutil**: React Flow com grafo navegável
- **Dashboard Operacional**: Métricas em tempo real
- **Centro de Exceções**: Fila de transações para análise humana

#### 4.1.5. Homologação BACEN
- **Testes obrigatórios**: Executar suite oficial do Bacen
- **Documentação**: Relatório de conformidade
- **Certificação**: Obter aprovação para ambiente restrito

### 4.2. Critérios de Sucesso (Fase 4)

✅ **Teste de Aceitação (Produção)**:
1. **Homologação BACEN**: Aprovado para PIX
2. **Primeira Transação Real**:
   - Cliente piloto cria conta
   - Recebe PIX de R$ 10,00
   - Sistema processa fim-a-fim
   - Saldo atualizado no Ledger
   - Confirmação enviada ao cliente
3. **Operação 24/7**:
   - 1 semana sem downtime
   - 1.000 transações processadas
   - < 0.1% de falhas

**Métricas de Produção**:
- **Uptime**: > 99.9%
- **Latência P95**: < 500ms (PIX completo)
- **Compliance**: 100% (zero rejeição BACEN)
- **Intervenção Humana**: < 2% (98% autonomia)

### 4.3. Piloto Restrito
- **1 Instituição Parceira** (fintech amigável)
- **100 clientes beta**
- **Produtos**: Apenas Conta Digital + PIX recebimento
- **Duração**: 3 meses de operação supervisionada

### 4.4. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|:---|:---|:---|
| Falha em homologação BACEN | Crítico | Contratar consultoria especializada, simulações prévias |
| Incidente de segurança (vazamento de dados) | Crítico | Pentest externo, bug bounty, seguro cyber |
| Performance em carga real | Alto | Load testing antecipado (10x carga esperada) |

### 4.5. Equipe Sugerida (Fase 4)
- **1 SRE/DevOps**: Produção + Observabilidade
- **1 Security Engineer**: Pentest + Hardening
- **2 Backend Engineers**: Integrações BACEN
- **1 Compliance Officer**: Homologação
- **1 Customer Success**: Suporte ao piloto

---

## 📊 RESUMO EXECUTIVO: CRONOGRAMA E INVESTIMENTO

### Timeline Consolidado
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   FASE 1    │   FASE 2    │   FASE 3    │   FASE 4    │
│  (3 meses)  │  (3 meses)  │  (3 meses)  │  (2 meses)  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Fundação    │ Cérebro IA  │ Autonomia   │ Produção    │
│             │             │ Total       │ Piloto      │
└─────────────┴─────────────┴─────────────┴─────────────┘
    Mês 1-3       Mês 4-6       Mês 7-9      Mês 10-11

TOTAL: 11 meses até produção piloto
```

### Entregas Incrementais

| Fase | Entrega Validável | Prova de Valor |
|:---|:---|:---|
| **Fase 1** | CRUD manual de objetos/instâncias | Provamos que object_definitions/instances funciona |
| **Fase 2** | PDF → Objetos automaticamente | Provamos que IA extrai requisitos corretamente |
| **Fase 3** | Docs → Sistema completo gerado | Provamos geração end-to-end (4h doc→código) |
| **Fase 4** | PIX real funcionando | Provamos compliance e operação real |

### Equipe Acumulada (Pico)
- **Total**: ~10-12 pessoas no pico (Fase 3-4)
- **Core Team**: 6 pessoas permanentes
- **Especialistas**: 4-6 pessoas pontuais (compliance, security, ML)

### Investimento Estimado (Infra)

| Item | Custo Mensal | Observação |
|:---|:---|:---|
| **Kubernetes** (self-hosted) | $500 | 5 nodes (16GB RAM cada) |
| **GPU para LLM** (VLLM) | $1,500 | 1x NVIDIA A10G (quantizado) |
| **Databases** (Postgres + Nebula) | $300 | Managed ou self-hosted |
| **Pulsar** | $200 | Cluster 3 nodes |
| **Observability** (Grafana Cloud) | $400 | Logs + Metrics + Traces |
| **Misc** (CI/CD, Storage) | $600 | ArgoCD, S3, backups |
| **TOTAL/Mês** | **~$3,500** | Fase 1-3 (desenvolvimento) |
| **Produção** (Fase 4) | **~$8,000** | Redundância, HA, compliance |

### Marcos de Decisão (Go/No-Go)

1. **Fim da Fase 1**:
   - ✅ Objeto criado manualmente funciona?
   - ✅ UI renderiza formulários dinamicamente?
   - ❌ Se NÃO → Reavaliar arquitetura de JSONB

2. **Fim da Fase 2**:
   - ✅ IA extrai objetos com > 80% acurácia?
   - ✅ Humano no loop acelera ou atrapalha?
   - ❌ Se NÃO → Considerar modelo maior ou fine-tuning

3. **Fim da Fase 3**:
   - ✅ Sistema gerado passa em testes automatizados?
   - ✅ 4h doc→código é realista?
   - ❌ Se NÃO → Simplificar escopo ou aceitar intervenção manual maior

4. **Fim da Fase 4**:
   - ✅ Homologação BACEN aprovada?
   - ✅ Piloto opera 1 semana sem incidentes críticos?
   - ❌ Se NÃO → Estender piloto, não lançar público

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

### Para Aprovar Esta Proposta:

1. **Revisar as 4 fases**: Alguma ordem diferente faz mais sentido?
2. **Validar entregas**: As entregas de cada fase são suficientes para provar valor?
3. **Discutir riscos**: Algum risco crítico não mapeado?
4. **Aprovar investimento**: Budget de ~$40k (infra) + equipe é viável?

### Se Aprovado, Iniciar Fase 1:

1. **Semana 1**: Setup de infra (K8s, Postgres, Pulsar)
2. **Semana 2-4**: Implementar API Universal (Go)
3. **Semana 5-8**: Frontend dinâmico (React)
4. **Semana 9-12**: Template de agente + testes de aceitação

---

**Este roadmap está pronto para revisão e aprovação. Qual fase ou detalhe deseja discutir primeiro?**

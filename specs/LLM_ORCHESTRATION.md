# LLM Self-Hosted & Agent Orchestration
## Stack Completa para IA e Automação

---

## 🤖 LLM SELF-HOSTED

### **Desenvolvimento**
```
Ollama
```

**Por quê:**
- ✅ **Open-source** (MIT)
- ✅ **Extremamente fácil**: `ollama run llama3.3`
- ✅ **CPU/GPU**: Funciona em ambos
- ✅ **Modelos**: Llama, Mistral, Gemma, etc.
- ✅ **API**: OpenAI-compatible
- ✅ **Quantização**: Automática (4-bit, 8-bit)
- ✅ **Memória**: Gerenciamento automático

**Modelos recomendados para dev:**
```bash
# Pequeno e rápido (7B)
ollama run llama3.3:7b

# Médio (13B)
ollama run llama3.3:13b

# Grande (70B) - Requer GPU
ollama run llama3.3:70b
```

**Vantagens para dev:**
- ✅ Setup em segundos
- ✅ Troca de modelos fácil
- ✅ Sem configuração complexa
- ✅ Funciona offline

---

### **Produção**
```
vLLM
```

**Por quê:**
- ✅ **Open-source** (Apache 2.0)
- ✅ **Performance**: 24x mais rápido que HuggingFace
- ✅ **Throughput**: PagedAttention (otimização de memória)
- ✅ **Batching**: Continuous batching automático
- ✅ **Quantização**: AWQ, GPTQ, SqueezeLLM
- ✅ **API**: OpenAI-compatible
- ✅ **Multi-GPU**: Tensor parallelism nativo
- ✅ **Production-ready**: Usado por Anthropic, Databricks

**Comparação:**

| Feature | vLLM | Ollama | Text Generation Inference (TGI) |
|---------|------|--------|--------------------------------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Throughput | 24x HF | 5x HF | 10x HF |
| Batching | Continuous | Basic | Continuous |
| Multi-GPU | ✅ Nativo | ❌ | ✅ Nativo |
| Quantização | AWQ, GPTQ | Auto | AWQ, GPTQ |
| Facilidade | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Produção | ✅ | ⚠️ | ✅ |

**Decisão:** 
- **Dev**: Ollama (facilidade)
- **Prod**: vLLM (performance)

---

### **Modelos Recomendados**

#### **Para Português (pt-BR)**
```
1. Llama 3.3 70B (Meta)
   - Melhor modelo open-source geral
   - Excelente em português
   - Requer GPU (A100 40GB ou 2x A10G)

2. Mistral Large 2 (Mistral AI)
   - Alternativa ao Llama
   - Bom em português
   - Menor que Llama 70B

3. Qwen 2.5 72B (Alibaba)
   - Excelente em multilingual
   - Forte em português
   - Bom para tarefas técnicas
```

#### **Para Embeddings (Vector Search)**
```
1. multilingual-e5-large
   - Melhor para português
   - 560M parâmetros
   - 1024 dimensões

2. BGE-M3 (BAAI)
   - Multilingual
   - 567M parâmetros
   - Suporta 100+ idiomas
```

**Decisão:**
- **LLM Principal**: Llama 3.3 70B
- **Embeddings**: multilingual-e5-large

---

### **Infraestrutura LLM**

**Desenvolvimento:**
```
1x VM com GPU
- GPU: NVIDIA RTX 4090 (24GB VRAM)
- RAM: 64GB
- Storage: 500GB NVMe
- Custo: ~$1.50/hora (cloud) ou ~$2.000 (hardware próprio)
```

**Produção:**
```
2x VMs com GPU (HA)
- GPU: NVIDIA A100 40GB (cada)
- RAM: 128GB (cada)
- Storage: 1TB NVMe (cada)
- Custo: ~$6/hora (cloud) ou ~$20.000 (hardware próprio)
```

**Alternativa econômica (Produção):**
```
4x VMs com GPU menor
- GPU: NVIDIA A10G 24GB (cada)
- RAM: 96GB (cada)
- Tensor Parallelism: 4-way split
- Custo: ~$4/hora (cloud)
```

---

## 🎭 ORQUESTRAÇÃO DE AGENTES

### **Frameworks Analisados**

#### **1. LangGraph (LangChain)**
```
Tipo: State machine para agentes
License: MIT
```

**Prós:**
- ✅ **Controle total**: Define grafo de estados explicitamente
- ✅ **Debugging**: Visualização do grafo
- ✅ **Persistência**: Checkpoints automáticos
- ✅ **Streaming**: Respostas em tempo real
- ✅ **Human-in-the-loop**: Aprovações manuais
- ✅ **Integração**: LangChain ecosystem

**Contras:**
- ⚠️ Curva de aprendizado média
- ⚠️ Requer definir estados manualmente

**Casos de uso:**
- ✅ Workflows complexos com múltiplos estados
- ✅ Aprovações humanas necessárias
- ✅ Debugging detalhado importante

---

#### **2. CrewAI**
```
Tipo: Multi-agent collaboration
License: MIT
```

**Prós:**
- ✅ **Simplicidade**: API declarativa
- ✅ **Roles**: Agentes com papéis específicos
- ✅ **Tasks**: Delegação automática
- ✅ **Collaboration**: Agentes trabalham juntos
- ✅ **Memory**: Compartilhamento de contexto

**Contras:**
- ⚠️ Menos controle que LangGraph
- ⚠️ Abstração pode esconder complexidade

**Casos de uso:**
- ✅ Múltiplos agentes especializados
- ✅ Colaboração entre agentes
- ✅ Delegação de tarefas

---

#### **3. AutoGen (Microsoft)**
```
Tipo: Conversational agents
License: MIT
```

**Prós:**
- ✅ **Conversação**: Agentes conversam entre si
- ✅ **Code execution**: Executa código automaticamente
- ✅ **Human-in-the-loop**: Aprovações
- ✅ **Groupchat**: Múltiplos agentes em grupo
- ✅ **Microsoft**: Suporte enterprise

**Contras:**
- ⚠️ Focado em conversação (pode ser overkill)
- ⚠️ Menos estruturado que LangGraph

**Casos de uso:**
- ✅ Agentes que precisam conversar
- ✅ Code generation/execution
- ✅ Brainstorming entre agentes

---

#### **4. LlamaIndex Workflows**
```
Tipo: Event-driven workflows
License: MIT
```

**Prós:**
- ✅ **Event-driven**: Baseado em eventos
- ✅ **RAG nativo**: Integração com retrieval
- ✅ **Streaming**: Respostas incrementais
- ✅ **Type-safe**: TypeScript/Python

**Contras:**
- ⚠️ Mais novo (menos maduro)
- ⚠️ Focado em RAG (menos genérico)

**Casos de uso:**
- ✅ RAG complexo
- ✅ Event-driven workflows
- ✅ Streaming importante

---

#### **5. Haystack**
```
Tipo: NLP pipelines
License: Apache 2.0
```

**Prós:**
- ✅ **Pipelines**: Composição de componentes
- ✅ **RAG**: Excelente para retrieval
- ✅ **Production**: Battle-tested
- ✅ **Deepset**: Empresa por trás

**Contras:**
- ⚠️ Focado em NLP/RAG (menos genérico)
- ⚠️ Menos flexível para agentes complexos

**Casos de uso:**
- ✅ RAG pipelines
- ✅ Document processing
- ✅ Q&A systems

---

### **Comparação Resumida**

| Framework | Complexidade | Controle | RAG | Multi-Agent | Produção |
|-----------|--------------|----------|-----|-------------|----------|
| LangGraph | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| CrewAI | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| AutoGen | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| LlamaIndex | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Haystack | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### **Decisão: Arquitetura Híbrida**

**Para nosso caso (LBPay), recomendo combinar:**

```
LangGraph (workflows complexos)
+
CrewAI (agentes especializados)
+
LlamaIndex (RAG para documentos)
```

**Por quê:**

1. **LangGraph** para workflows de validação:
   - Estado: rascunho → em_análise → aprovado
   - Checkpoints em cada etapa
   - Human-in-the-loop para aprovações

2. **CrewAI** para agentes especializados:
   - Agente PF (especialista em pessoa física)
   - Agente PJ (especialista em pessoa jurídica)
   - Agente Compliance (valida normas BACEN)
   - Agente Fraud (detecção de fraude)

3. **LlamaIndex** para RAG:
   - Indexar documentos BACEN
   - Indexar políticas internas
   - Retrieval contextual

---

## 🔄 ORQUESTRAÇÃO DE WORKFLOWS/DADOS

### **Frameworks Analisados**

#### **1. Temporal**
```
Tipo: Durable execution engine
License: MIT
```

**Prós:**
- ✅ **Durabilidade**: Workflows sobrevivem a crashes
- ✅ **Long-running**: Workflows de dias/meses
- ✅ **Retry**: Automático com backoff
- ✅ **Versioning**: Workflows versionados
- ✅ **Observability**: UI completa
- ✅ **Multi-language**: Go, Python, TypeScript, Java

**Contras:**
- ⚠️ Complexidade de setup
- ⚠️ Requer infraestrutura dedicada

**Casos de uso:**
- ✅ Processos de negócio longos (KYC, aprovações)
- ✅ Sagas/compensações
- ✅ Workflows críticos

---

#### **2. Dagster**
```
Tipo: Data orchestration
License: Apache 2.0
```

**Prós:**
- ✅ **Data-aware**: Entende dependências de dados
- ✅ **Testing**: Testes de pipelines nativos
- ✅ **Lineage**: Rastreamento de dados
- ✅ **Partitioning**: Dados particionados
- ✅ **UI**: Dagit (interface gráfica)
- ✅ **Type-safe**: Python com tipos

**Contras:**
- ⚠️ Focado em dados (menos genérico)
- ⚠️ Não é durable execution

**Casos de uso:**
- ✅ ETL/ELT pipelines
- ✅ Data warehousing
- ✅ ML training pipelines
- ✅ Batch processing

---

#### **3. Prefect**
```
Tipo: Workflow orchestration
License: Apache 2.0
```

**Prós:**
- ✅ **Simplicidade**: API Python limpa
- ✅ **Dynamic**: Workflows dinâmicos
- ✅ **Observability**: UI moderna
- ✅ **Retry**: Políticas flexíveis
- ✅ **Caching**: Cache de resultados

**Contras:**
- ⚠️ Menos durável que Temporal
- ⚠️ Menos features enterprise

**Casos de uso:**
- ✅ Workflows Python
- ✅ Data pipelines
- ✅ Automação geral

---

#### **4. Apache Airflow**
```
Tipo: Workflow orchestration
License: Apache 2.0
```

**Prós:**
- ✅ **Maturidade**: Padrão da indústria
- ✅ **Comunidade**: Gigantesca
- ✅ **Integrações**: 1000+ operators
- ✅ **UI**: Completa
- ✅ **Scheduling**: Cron-like

**Contras:**
- ⚠️ Complexidade alta
- ⚠️ DAGs estáticos (menos flexível)
- ⚠️ Setup pesado

**Casos de uso:**
- ✅ Batch processing
- ✅ ETL tradicional
- ✅ Scheduled jobs

---

### **Comparação Resumida**

| Framework | Durabilidade | Simplicidade | Data-Aware | Long-Running | Produção |
|-----------|--------------|--------------|------------|--------------|----------|
| Temporal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Dagster | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Prefect | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Airflow | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### **Decisão: Arquitetura Híbrida**

**Para nosso caso (LBPay), recomendo:**

```
Temporal (processos de negócio)
+
Dagster (pipelines de dados)
```

**Por quê:**

1. **Temporal** para processos críticos:
   - KYC workflow (pode levar dias)
   - Aprovações em múltiplas etapas
   - Transações PIX (compensações)
   - Workflows com SLA

2. **Dagster** para dados:
   - ETL de documentos → PostgreSQL
   - Sincronização SQL → Graph → Vector
   - Geração de embeddings em batch
   - Relatórios agendados

---

## 🏗️ Arquitetura Completa de Orquestração

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           API GATEWAY (Node.js + tRPC)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│  AGENT LAYER     │              │  WORKFLOW LAYER  │
│  (Python)        │              │  (Go/Python)     │
│  ──────────────  │              │  ──────────────  │
│  • LangGraph     │              │  • Temporal      │
│  • CrewAI        │              │  • Dagster       │
│  • LlamaIndex    │              │                  │
└──────────────────┘              └──────────────────┘
        ↓                                   ↓
┌─────────────────────────────────────────────────────────┐
│                    LLM LAYER                            │
│  ─────────────────────────────────────────────────────  │
│  Dev: Ollama (Llama 3.3 70B)                            │
│  Prod: vLLM (Llama 3.3 70B)                             │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│  ─────────────────────────────────────────────────────  │
│  PostgreSQL | NebulaGraph | Qdrant | Valkey            │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Exemplo de Uso Combinado

### **Caso: Criação de Cliente PF**

**1. Frontend → API Gateway**
```typescript
// Next.js
const result = await trpc.entity.create.mutate({
  type: 'cliente_pf',
  rawInput: 'nome: João Silva, cpf: 123.456.789-00, ...'
});
```

**2. API Gateway → CrewAI (Agentes)**
```python
# Python (FastAPI)
from crewai import Agent, Task, Crew

# Agente especializado em PF
pf_agent = Agent(
  role='Especialista em Pessoa Física',
  goal='Extrair e validar dados de PF',
  backstory='Conhece todas as regras BACEN para PF',
  llm=llm  # vLLM/Ollama
)

# Agente de compliance
compliance_agent = Agent(
  role='Compliance Officer',
  goal='Validar conformidade com normas',
  backstory='Especialista em regulamentação BACEN',
  llm=llm
)

# Task de extração
extract_task = Task(
  description=f'Extrair dados estruturados de: {raw_input}',
  agent=pf_agent
)

# Task de validação
validate_task = Task(
  description='Validar dados extraídos contra políticas',
  agent=compliance_agent,
  context=[extract_task]  # Depende da extração
)

# Executar crew
crew = Crew(agents=[pf_agent, compliance_agent], tasks=[extract_task, validate_task])
result = crew.kickoff()
```

**3. LangGraph (Workflow de Estados)**
```python
# Python
from langgraph.graph import StateGraph

# Definir estados
class EntityState(TypedDict):
    raw_input: str
    extracted_data: dict
    validation_result: dict
    current_state: str

# Criar grafo
workflow = StateGraph(EntityState)

# Adicionar nós
workflow.add_node("extract", extract_node)
workflow.add_node("validate", validate_node)
workflow.add_node("save", save_node)

# Adicionar edges
workflow.add_edge("extract", "validate")
workflow.add_conditional_edges(
    "validate",
    lambda state: "save" if state["validation_result"]["valid"] else "extract"
)

# Executar
result = workflow.invoke({"raw_input": input_text})
```

**4. Temporal (Processo de Aprovação)**
```python
# Python
from temporalio import workflow

@workflow.defn
class KYCWorkflow:
    @workflow.run
    async def run(self, entity_id: int) -> str:
        # Etapa 1: Validação automática
        validation = await workflow.execute_activity(
            validate_entity,
            entity_id,
            start_to_close_timeout=timedelta(minutes=5)
        )
        
        if not validation.auto_approved:
            # Etapa 2: Aprovação humana (pode levar dias)
            approval = await workflow.wait_condition(
                lambda: self.approval_received,
                timeout=timedelta(days=7)
            )
            
            if not approval:
                return "REJECTED_TIMEOUT"
        
        # Etapa 3: Ativação
        await workflow.execute_activity(
            activate_entity,
            entity_id,
            start_to_close_timeout=timedelta(minutes=1)
        )
        
        return "APPROVED"
```

**5. Dagster (Sincronização de Dados)**
```python
# Python
from dagster import asset, AssetExecutionContext

@asset
def entities_in_postgres(context: AssetExecutionContext):
    """Entidades no PostgreSQL"""
    return fetch_entities_from_postgres()

@asset(deps=[entities_in_postgres])
def entities_in_graph(context: AssetExecutionContext, entities_in_postgres):
    """Sincronizar entidades para NebulaGraph"""
    sync_to_nebula_graph(entities_in_postgres)
    return entities_in_postgres

@asset(deps=[entities_in_postgres])
def entity_embeddings(context: AssetExecutionContext, entities_in_postgres):
    """Gerar embeddings para busca semântica"""
    embeddings = generate_embeddings(entities_in_postgres)
    upload_to_qdrant(embeddings)
    return embeddings
```

---

## 💰 Análise de Custo

### **LLM Self-Hosted**

**Desenvolvimento:**
- 1x GPU VM (RTX 4090 24GB)
- Ollama + Llama 3.3 70B (quantizado 4-bit)
- **Custo: $1.50/hora ou $1.080/mês (24/7)**

**Produção:**
- 2x GPU VMs (A100 40GB cada)
- vLLM + Llama 3.3 70B
- Load balancing
- **Custo: $6/hora ou $4.320/mês (24/7)**

**Comparação com SaaS:**
- OpenAI GPT-4: $30-150/1M tokens
- Anthropic Claude: $15-75/1M tokens
- **Estimativa: $5.000-20.000/mês** (dependendo do volume)

**Economia: 60-80% com self-hosted**

---

### **Orquestração**

**Temporal:**
- 3x VMs (8GB RAM, 4 vCPU cada)
- PostgreSQL para state
- **Custo: $150/mês**

**Dagster:**
- 2x VMs (16GB RAM, 8 vCPU cada)
- PostgreSQL para metadata
- **Custo: $200/mês**

**Total Orquestração: $350/mês**

---

## ✅ Stack Final Recomendada

### **LLM**
- **Dev**: Ollama + Llama 3.3 70B
- **Prod**: vLLM + Llama 3.3 70B
- **Embeddings**: multilingual-e5-large

### **Agent Orchestration**
- **LangGraph**: Workflows de validação
- **CrewAI**: Agentes especializados (PF, PJ, Compliance)
- **LlamaIndex**: RAG para documentos

### **Workflow Orchestration**
- **Temporal**: Processos de negócio (KYC, aprovações)
- **Dagster**: Pipelines de dados (ETL, sync, embeddings)

### **Todas as tecnologias:**
- ✅ 100% Open-Source
- ✅ Zero custo de licença
- ✅ Self-hosted
- ✅ Production-ready

---

## ❓ Aprovação

Esta stack completa atende:
- ✅ Ollama (dev) + vLLM (prod)
- ✅ LLM self-hosted (Llama 3.3 70B)
- ✅ Orquestração de agentes (LangGraph + CrewAI + LlamaIndex)
- ✅ Orquestração de workflows (Temporal + Dagster)
- ✅ 100% Open-Source e free

**Aprovado para implementação?**

# Arquitetura SuperCore v2.0
## Consolidação Completa: Da Visão Fundacional à Implementação Exponencial

**Versão**: 2.0.0
**Status**: Documento Definitivo - Arquitetura Consolidada e Revisada
**Data**: 2025-12-22
**Aprovação**: Pendente

---

## ÍNDICE

1. [Visão Arquitetural Geral](#1-visão-arquitetural-geral)
2. [Arquitetura em Camadas](#2-arquitetura-em-camadas)
3. [Padrões Arquiteturais](#3-padrões-arquiteturais)
4. [Componentes Principais](#4-componentes-principais)
5. [Integrações e Fluxos](#5-integrações-e-fluxos)
6. [Decisões Arquiteturais (ADRs)](#6-decisões-arquiteturais-adrs)
7. [Qualidade Arquitetural](#7-qualidade-arquitetural)
8. [Crescimento Exponencial](#8-crescimento-exponencial)
9. [Diagramas](#9-diagramas)
10. [Roadmap Arquitetural](#10-roadmap-arquitetural)

---

## 1. VISÃO ARQUITETURAL GERAL

### 1.1 Princípios Arquiteturais

O SuperCore é fundamentado em princípios que representam uma mudança paradigmática no desenvolvimento de software:

#### Princípio Fundamental
> **"Não construímos soluções. Construímos a MÁQUINA que GERA soluções."**

#### Princípios Norteadores

1. **Conhecimento como Fonte da Verdade**
   - O código não é a fonte da verdade; o conhecimento do domínio é
   - Toda lógica deriva de especificações formais e conhecimento do setor/regulação
   - Mudanças no negócio não requerem mudanças no código core

2. **Abstração Universal e Agnósticismo Total**
   - Zero lógica de domínio hardcoded no SuperCore
   - Toda entidade de negócio é uma instance de object_definition
   - O sistema é 100% agnóstico ao domínio até configurar um Oráculo
   - SuperCore NÃO É uma solução - SuperCore GERA soluções

3. **Geração 100% Automática por IA**
   - O Assistente de IA consome conhecimento do Oráculo
   - Gera automaticamente objetos, agentes, workflows, UI e middlewares
   - Zero código manual necessário após SuperCore implementado
   - Garantia de compliance por design

4. **Evolução Contínua**
   - Sistema auto-evolutivo que absorve novas regulamentações
   - Capacidade de sugerir ou executar suas próprias atualizações
   - Versionamento sem breaking changes

5. **Composição sobre Construção**
   - Reutilização massiva de objetos e agentes
   - Novos recursos são compostos, não codificados
   - Crescimento exponencial da produtividade

### 1.2 Objetivos de Design

#### Objetivos de Negócio
- **Time-to-Market**: Reduzir de meses para dias a criação de novas soluções
- **Compliance Automático**: Zero violações regulatórias por design
- **Custo de Manutenção**: Reduzir 90% do esforço de manutenção evolutiva
- **Democratização**: Permitir que não-desenvolvedores criem soluções complexas

#### Objetivos Técnicos
- **Escalabilidade**: Horizontal e vertical sem limites
- **Resiliência**: Zero downtime, fault-tolerant
- **Extensibilidade**: Adicionar novos domínios sem modificar o core
- **Observabilidade**: Rastreabilidade completa de todas as operações

### 1.3 Filosofia do SuperCore

#### O Que SuperCore NÃO É
- ❌ NÃO é uma solução específica de domínio (Banking, CRM, ERP, Healthcare, etc)
- ❌ NÃO é um framework específico de domínio
- ❌ NÃO é uma ferramenta low-code tradicional
- ❌ NÃO contém lógica de negócio hardcoded

#### O Que SuperCore É
- ✅ É uma META-PLATAFORMA universal geradora de soluções
- ✅ É uma engine de gestão de objetos abstratos
- ✅ É uma máquina de interpretação de conhecimento
- ✅ É um orquestrador de agentes autônomos de IA
- ✅ É uma fundação para construir QUALQUER solução empresarial

### 1.4 Evolução v1 → v2.0

#### SuperCore v1.0 (Fundação)
**Foco**: Arquitetura base, meta-objects, dynamic UI

**Características**:
- `object_definitions` como DNA do sistema
- `instances` como células vivas
- `relationships` como sinapses
- Agentic RAG Trimodal (SQL + Graph + Vector) com CrewAI + Temporal
- Dynamic UI generation
- FSM engine genérico
- Validation rules interpretadas

**Limitações**:
- ❌ Criação manual de object_definitions (bloqueador crítico)
- ❌ Falta de multi-tenancy nativo
- ❌ Ausência de geração automática por IA
- ❌ Integração limitada com LLMs
- ❌ Sem Super Portal de gestão
- ❌ Sem fluxo "Play" → deploy completo

#### SuperCore v2.0 (Geração 100% Automática + Portal + Crescimento Exponencial)
**Foco**: Super Portal, AI-Driven Generation, Deployment Orchestrator, 4 Pilares, Crescimento Exponencial

**Inovações Principais**:

1. **Super Portal de Backoffice (Camada Superior)**
   - Interface web moderna para gerenciamento de Oráculos
   - Oracle Manager Service (CRUD de Oráculos)
   - Portal UI (Next.js 14 + shadcn/ui)
   - Multi-tenancy nativo via oracle_id
   - UX otimizada para Product Managers e Compliance Officers

2. **Oráculo como Fundação (Pilar 1)**
   - Knowledge Graph (NebulaGraph) com conhecimento do domínio configurado
   - Ingestão contínua de documentação, regulações, políticas
   - Agentic RAG Híbrido (SQL + Graph + Vector - instances + embeddings) com multi-agent orchestration
   - Fonte única da verdade para geração automática de objetos

3. **Biblioteca de Objetos (Pilar 2)**
   - 5 tipos de objetos (Data Entities, Integrations, UI Components, Workflows, Agents)
   - **Geração 100% automática pelo Assistente de IA** (elimina criação manual)
   - Catalogação e versionamento
   - Reutilização massiva

4. **Biblioteca de Agentes (Pilar 3)**
   - Agentes autônomos com roles, responsibilities, tools
   - **Geração 100% automática por IA**
   - Orquestração via CrewAI/LangGraph
   - Colaboração multi-agente
   - Especialização por domínio (configurado no Oráculo)

5. **MCPs como Interface Universal (Pilar 4)**
   - Comunicação semântica via Message Context Protocol
   - Desacoplamento total frontend/backend
   - Suporte a múltiplos portais/canais
   - Arquitetura event-driven nativa

6. **AI-Driven Context Generator (6 Fases)**
   - Upload de inputs multi-modais (PDFs, diagramas, URLs, Super Prompt)
   - Geração automática de especificações
   - Iteração conversacional com IA
   - Geração completa de modelos (objetos + agentes + workflows + UI + middlewares)
   - Preview, teste e aprovação
   - **"Play" → deploy completo automático**

7. **Deployment Orchestrator (Novo Componente Crítico)**
   - Orquestra deploy completo de solução gerada
   - Gera e deploya middlewares (FastAPI/Gin containers)
   - Gera e deploya MCPs (Pulsar topics + handlers)
   - Gera e deploya frontends (Next.js apps)
   - Gera e deploya data layer (PostgreSQL schemas + NebulaGraph)
   - Gera e deploya agentes (CrewAI crews)
   - Gera e deploya fluxos (LangGraph state machines)
   - URL dedicada por Oráculo (oracle-{id}.supercore.io)

8. **Multi-Tenancy Nativo**
   - Isolamento por `oracle_id` em todas as camadas
   - Row-level security (PostgreSQL)
   - Namespace-based isolation (Apache Pulsar)
   - Compliance LGPD/regulações do setor

9. **Template System + Apache Pulsar**
   - Templates Pydantic com constrained decoding
   - Query Router (3-layer cascading)
   - Message broker Apache Pulsar v3.4.0
   - Interaction Broker para validação e roteamento

10. **Multi-Língua Nativo**
    - i18n Service integrado
    - Tradução automática de conteúdo gerado
    - Compatibilidade frontend i18next
    - LLM multilíngue
    - Embeddings multilíngues

**Resultado da Evolução**:
- v1: Plataforma capaz de executar soluções abstratas (com criação manual)
- v2: Plataforma capaz de GERAR e EXECUTAR soluções completas 100% automaticamente a partir de linguagem natural

---

## 2. ARQUITETURA EM CAMADAS

### Visão Geral das Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 6: PORTAL (Super Portal de Backoffice)             │
│  - Oracle Manager UI (Next.js 14 + shadcn/ui)              │
│  - Gerenciamento de Oráculos (CRUD)                         │
│  - AI Context Generator Interface                           │
│  - Multi-tenant Oracle Selector                             │
│  - UX moderna para Product/Compliance                       │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST + MCP
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 5: ORCHESTRAÇÃO DE DEPLOY (Deployment Layer)       │
│  - Deployment Orchestrator (Kubernetes Controller)          │
│  - Container Orchestrator (K8s)                             │
│  - Code Generation Engine                                   │
│  - URL Router / API Gateway                                 │
│  - Multi-tenant Isolation Manager                           │
└─────────────────────────────────────────────────────────────┘
                          ↕ Deploy Commands
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 4: APRESENTAÇÃO (Frontends / Portais Gerados)     │
│  - Next.js 14 Dynamic UI (gerado por Oráculo)              │
│  - React Components Auto-Generated                          │
│  - Multi-idioma (i18n nativo)                               │
│  - shadcn/ui components                                     │
└─────────────────────────────────────────────────────────────┘
                          ↕ MCP (Message Context Protocol)
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 3: INTERFACE (MCPs + Interaction Broker)           │
│  - Apache Pulsar v3.4.0 (Message Broker)                    │
│  - Interaction Broker (Go) - Validação + Roteamento         │
│  - Template System (Pydantic) - Constrained Decoding        │
│  - Query Router (Keyword → Semantic → LLM)                  │
│  - i18n Service (Tradução automática)                       │
└─────────────────────────────────────────────────────────────┘
                          ↕ Events / Messages
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 2: ORQUESTRAÇÃO (Agentes Autônomos)                │
│  - CrewAI / LangGraph (Multi-Agent Orchestration)           │
│  - LangFlow (Visual Workflows)                              │
│  - Biblioteca de Agentes (Roles + Responsibilities)         │
│  - MCP Action Agents (Validações, Integrações)              │
│  - Collaboration Patterns                                   │
└─────────────────────────────────────────────────────────────┘
                          ↕ Utiliza
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1: ABSTRAÇÃO (Biblioteca de Objetos)               │
│  - Data Entities (Pydantic Models)                          │
│  - Integrations (External APIs)                             │
│  - UI Components (React)                                    │
│  - Workflows (BPM Definitions)                              │
│  - Metadata-Driven Architecture                             │
└─────────────────────────────────────────────────────────────┘
                          ↕ Consome
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 0: FUNDAÇÃO (Oráculo - Knowledge Base)             │
│  - PostgreSQL 15 (Structured Data + pgvector)               │
│  - NebulaGraph 3.8 (Knowledge Graph) + Qdrant (Vector DB)   │
│  - Agentic RAG Trimodal (SQL + Graph + Vector)             │
│  - CrewAI Agents + Temporal Workflows (orchestration)       │
│  - Documentação, Regulações, Políticas do Domínio           │
└─────────────────────────────────────────────────────────────┘
                          ↕ Persiste
┌─────────────────────────────────────────────────────────────┐
│  BASE: DADOS (Meta-Objects + Instances)                    │
│  - object_definitions (DNA do sistema)                      │
│  - instances (Células vivas)                                │
│  - relationships (Sinapses)                                 │
│  - oracle_config (Identidade, Licenças, Integrações)        │
└─────────────────────────────────────────────────────────────┘
```

### 2.0 Camada de Portal (Super Portal de Backoffice) - NOVA

#### Papel do Super Portal
O Super Portal é a **interface de gerenciamento de Oráculos** - onde equipes de Produto, Compliance e Administradores criam e gerenciam Oráculos e geram soluções completas.

**Responsabilidades**:
- Gerenciar Oráculos (criar, editar, listar, deletar, clonar)
- Interface para AI Context Generator (upload, especificação, aprovação)
- Gestão de Object Definitions (visualizar, editar, versionar)
- Gestão de Agentes (visualizar, editar, testar)
- Gestão de Workflows (visualizar, testar, executar)
- Dashboard de estatísticas (objetos, agentes, instâncias por Oráculo)
- Controle de "Play" (ativar deploy completo de solução)

#### Componentes do Portal

**1. Oracle Manager UI (Next.js 14 + shadcn/ui)**
```typescript
// pages/oracles/index.tsx
const OraclesListPage = () => {
  const { data: oracles } = useSWR('/api/v1/oracles');

  return (
    <DashboardLayout>
      <PageHeader title="Oráculos" description="Gerencie seus Oráculos" />

      <OraclesTable
        data={oracles}
        onEdit={(oracle) => navigate(`/oracles/${oracle.id}/edit`)}
        onClone={(oracle) => cloneOracle(oracle.id)}
        onDelete={(oracle) => deleteOracle(oracle.id)}
      />

      <Button onClick={() => navigate('/oracles/new')}>
        Novo Oráculo
      </Button>
    </DashboardLayout>
  );
};
```

**2. Oracle Manager Service (Backend Go)**
```go
// services/oracle_manager.go
type OracleManagerService struct {
    db *sql.DB
}

func (s *OracleManagerService) CreateOracle(ctx context.Context, req *CreateOracleRequest) (*Oracle, error) {
    // 1. Validar request
    if err := s.validateOracleRequest(req); err != nil {
        return nil, err
    }

    // 2. Criar oracle_config
    oracleID := uuid.New()
    config := OracleConfig{
        OracleID: oracleID,
        Name: req.Name,
        Domain: req.Domain,
        Description: req.Description,
        Languages: req.Languages,
    }

    // 3. Persistir
    if err := s.db.Insert(config); err != nil {
        return nil, err
    }

    // 4. Publicar evento
    s.eventBus.Publish(Event{
        Type: "ORACLE_CREATED",
        Payload: config,
    })

    return &Oracle{ID: oracleID, Config: config}, nil
}

func (s *OracleManagerService) ListOracles(ctx context.Context, userID string) ([]*Oracle, error) {
    // Listar oráculos acessíveis pelo usuário
    // (implementar RBAC aqui)
    return s.db.Query(`SELECT * FROM oracle_config WHERE user_id = $1`, userID)
}
```

**3. AI Context Generator Interface**
```tsx
// pages/oracles/[id]/context/new.tsx
const NewContextPage = () => {
  const { oracle } = useOracle();
  const [inputs, setInputs] = useState<ContextInputs>({
    name: "",
    description: "",
    documents: [],
    diagrams: [],
    urls: [],
    super_prompt: ""
  });

  const handleGenerate = async () => {
    // 1. Upload documentos
    const uploadedFiles = await uploadFiles(inputs.documents);

    // 2. Criar contexto
    const context = await mcpClient.call("create_context", {
      oracle_id: oracle.id,
      ...inputs,
      uploaded_files: uploadedFiles
    });

    // 3. Processar (gerar especificação)
    await mcpClient.call("process_context", {
      context_id: context.id,
      oracle_id: oracle.id
    });

    // 4. Navegar para especificação
    navigate(`/oracles/${oracle.id}/contexts/${context.id}/specification`);
  };

  return (
    <ContextGeneratorWizard
      inputs={inputs}
      onChange={setInputs}
      onGenerate={handleGenerate}
    />
  );
};
```

**4. Multi-Tenant Oracle Selector**
```tsx
// components/OracleSelector.tsx
const OracleSelector = () => {
  const { currentOracle, setCurrentOracle } = useOracleContext();
  const { data: oracles } = useSWR('/api/v1/oracles');

  return (
    <Select
      value={currentOracle?.id}
      onChange={(oracleId) => {
        const oracle = oracles.find(o => o.id === oracleId);
        setCurrentOracle(oracle);
      }}
    >
      {oracles.map(oracle => (
        <SelectItem key={oracle.id} value={oracle.id}>
          {oracle.name} ({oracle.domain})
        </SelectItem>
      ))}
    </Select>
  );
};
```

#### Padrões de Acesso

**1. RBAC (Role-Based Access Control)**
```typescript
// Roles por Oráculo
enum OracleRole {
  ADMIN = "ADMIN",           // Pode tudo
  PRODUCT_MANAGER = "PM",    // Pode criar/editar objetos e workflows
  COMPLIANCE = "COMPLIANCE", // Pode aprovar mudanças regulatórias
  VIEWER = "VIEWER"          // Pode apenas visualizar
}

// Permissões
interface OraclePermissions {
  canCreateOracle: boolean;
  canEditOracle: boolean;
  canDeleteOracle: boolean;
  canManageObjects: boolean;
  canManageAgents: boolean;
  canApproveChanges: boolean;
  canPlayOracle: boolean;
}
```

**2. Auditoria Completa**
```sql
-- Tabela de auditoria
CREATE TABLE oracle_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracle_config(id),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, PLAY
  entity_type VARCHAR(50), -- ORACLE, OBJECT, AGENT, WORKFLOW
  entity_id UUID,
  changes JSONB, -- Mudanças aplicadas
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oracle_audit_oracle_id ON oracle_audit_log(oracle_id);
CREATE INDEX idx_oracle_audit_timestamp ON oracle_audit_log(timestamp DESC);
```

### 2.0.1 Camada de Deployment Orchestrator - NOVA

#### Papel do Deployment Orchestrator
O Deployment Orchestrator é o **cérebro do "Play"** - responsável por transformar modelos aprovados em soluções completas rodando em produção.

**Responsabilidades**:
- Gerar código production-grade automaticamente
- Gerenciar deploy de middlewares, agentes, fluxos, frontends
- Configurar data layer (PostgreSQL schemas + NebulaGraph)
- Provisionar infraestrutura (containers, DNS, SSL)
- Garantir isolamento multi-tenant
- Monitorar saúde da solução deployada

#### Componentes do Deployment Orchestrator

**1. Code Generation Engine**
```python
# services/code_generator.py
from jinja2 import Environment, FileSystemLoader

class CodeGenerationEngine:
    def __init__(self, oracle_id: str):
        self.oracle_id = oracle_id
        self.templates = Environment(loader=FileSystemLoader('templates/'))

    async def generate_middleware(self, object_definitions: list) -> dict:
        """
        Gera middleware FastAPI/Gin completo
        """
        # 1. Gerar modelos Pydantic
        models = self.generate_pydantic_models(object_definitions)

        # 2. Gerar routers FastAPI
        routers = self.generate_fastapi_routers(object_definitions)

        # 3. Gerar validações
        validations = self.generate_validation_logic(object_definitions)

        # 4. Gerar Dockerfile
        dockerfile = self.templates.get_template('middleware/Dockerfile.j2').render(
            oracle_id=self.oracle_id,
            dependencies=['fastapi', 'pydantic', 'sqlalchemy', 'pulsar-client']
        )

        return {
            'models': models,
            'routers': routers,
            'validations': validations,
            'dockerfile': dockerfile,
            'requirements.txt': self.generate_requirements()
        }

    async def generate_frontend(self, object_definitions: list, workflows: list) -> dict:
        """
        Gera frontend Next.js completo
        """
        # 1. Gerar páginas Next.js
        pages = self.generate_nextjs_pages(object_definitions)

        # 2. Gerar componentes React
        components = self.generate_react_components(object_definitions)

        # 3. Gerar hooks customizados
        hooks = self.generate_custom_hooks(object_definitions)

        # 4. Gerar i18n configs
        i18n = self.generate_i18n_config(object_definitions)

        # 5. Gerar Dockerfile
        dockerfile = self.templates.get_template('frontend/Dockerfile.j2').render(
            oracle_id=self.oracle_id
        )

        return {
            'pages': pages,
            'components': components,
            'hooks': hooks,
            'i18n': i18n,
            'dockerfile': dockerfile,
            'package.json': self.generate_package_json()
        }

    async def generate_agents(self, agent_definitions: list) -> dict:
        """
        Gera agentes CrewAI prontos para execução
        """
        agents_code = []

        for agent_def in agent_definitions:
            agent_code = self.templates.get_template('agents/crewai_agent.py.j2').render(
                agent_id=agent_def['agent_id'],
                name=agent_def['name'],
                role=agent_def['role'],
                responsibilities=agent_def['responsibilities'],
                tools=agent_def['tools']
            )
            agents_code.append({
                'filename': f"{agent_def['name'].lower()}_agent.py",
                'code': agent_code
            })

        return {
            'agents': agents_code,
            'crew_orchestrator': self.generate_crew_orchestrator(agent_definitions),
            'dockerfile': self.generate_agents_dockerfile()
        }
```

**2. Deployment Orchestrator (Kubernetes Controller)**
```go
// services/deployment_orchestrator.go
package services

import (
    "context"
    "k8s.io/client-go/kubernetes"
    appsv1 "k8s.io/api/apps/v1"
    corev1 "k8s.io/api/core/v1"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type DeploymentOrchestrator struct {
    k8sClient *kubernetes.Clientset
    codeGen   *CodeGenerationEngine
}

func (o *DeploymentOrchestrator) DeployOracle(ctx context.Context, oracleID string) error {
    // 1. Buscar configuração do Oráculo
    oracle, err := o.getOracleConfig(oracleID)
    if err != nil {
        return err
    }

    // 2. Gerar código
    objectDefs := o.getObjectDefinitions(oracleID)
    agents := o.getAgentDefinitions(oracleID)
    workflows := o.getWorkflows(oracleID)

    middleware := o.codeGen.GenerateMiddleware(objectDefs)
    frontend := o.codeGen.GenerateFrontend(objectDefs, workflows)
    agentsCode := o.codeGen.GenerateAgents(agents)

    // 3. Build Docker images
    middlewareImage := o.buildDockerImage("middleware", middleware)
    frontendImage := o.buildDockerImage("frontend", frontend)
    agentsImage := o.buildDockerImage("agents", agentsCode)

    // 4. Deploy no Kubernetes
    namespace := fmt.Sprintf("oracle-%s", oracleID)

    // 4a. Criar namespace
    o.createNamespace(ctx, namespace)

    // 4b. Deploy middleware
    o.deployMiddleware(ctx, namespace, middlewareImage, oracle)

    // 4c. Deploy frontend
    o.deployFrontend(ctx, namespace, frontendImage, oracle)

    // 4d. Deploy agents
    o.deployAgents(ctx, namespace, agentsImage, oracle)

    // 5. Configurar data layer
    o.setupDatabase(ctx, oracleID, objectDefs)
    o.setupKnowledgeGraph(ctx, oracleID)

    // 6. Configurar networking (Ingress + SSL)
    o.setupIngress(ctx, namespace, oracle)

    // 7. Publicar evento
    o.eventBus.Publish(Event{
        Type: "ORACLE_DEPLOYED",
        OracleID: oracleID,
        Payload: map[string]interface{}{
            "url": fmt.Sprintf("https://oracle-%s.supercore.io", oracleID),
            "namespace": namespace,
        },
    })

    return nil
}

func (o *DeploymentOrchestrator) deployMiddleware(ctx context.Context, namespace, image string, oracle *Oracle) error {
    deployment := &appsv1.Deployment{
        ObjectMeta: metav1.ObjectMeta{
            Name: "middleware",
            Namespace: namespace,
        },
        Spec: appsv1.DeploymentSpec{
            Replicas: int32Ptr(3),
            Selector: &metav1.LabelSelector{
                MatchLabels: map[string]string{
                    "app": "middleware",
                    "oracle_id": oracle.ID,
                },
            },
            Template: corev1.PodTemplateSpec{
                ObjectMeta: metav1.ObjectMeta{
                    Labels: map[string]string{
                        "app": "middleware",
                        "oracle_id": oracle.ID,
                    },
                },
                Spec: corev1.PodSpec{
                    Containers: []corev1.Container{
                        {
                            Name: "middleware",
                            Image: image,
                            Ports: []corev1.ContainerPort{
                                {
                                    ContainerPort: 8000,
                                },
                            },
                            Env: []corev1.EnvVar{
                                {
                                    Name: "ORACLE_ID",
                                    Value: oracle.ID,
                                },
                                {
                                    Name: "DATABASE_URL",
                                    ValueFrom: &corev1.EnvVarSource{
                                        SecretKeyRef: &corev1.SecretKeySelector{
                                            LocalObjectReference: corev1.LocalObjectReference{
                                                Name: "db-credentials",
                                            },
                                            Key: "url",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }

    _, err := o.k8sClient.AppsV1().Deployments(namespace).Create(ctx, deployment, metav1.CreateOptions{})
    return err
}
```

**3. URL Router / API Gateway**
```yaml
# Ingress configuration per Oracle
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: oracle-ingress
  namespace: oracle-{oracle_id}
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - oracle-{oracle_id}.supercore.io
    secretName: oracle-{oracle_id}-tls
  rules:
  - host: oracle-{oracle_id}.supercore.io
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: middleware
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
```

**4. Multi-Tenant Isolation**
```yaml
# NetworkPolicy para isolamento entre Oráculos
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: oracle-isolation
  namespace: oracle-{oracle_id}
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  - from:
    - podSelector: {}
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: data-layer  # PostgreSQL, NebulaGraph
  - to:
    - namespaceSelector:
        matchLabels:
          name: pulsar  # Message broker
```

#### Fluxo Completo do "Play"

```
1. Usuário clica "Play" no Portal
   ↓
2. Portal chama: POST /api/v1/oracles/{id}/play
   ↓
3. Deployment Orchestrator recebe request
   ↓
4. Code Generation Engine gera:
   - Middlewares (FastAPI/Gin) com todas as APIs REST
   - Frontends (Next.js) com forms/listas/dashboards
   - Agentes (CrewAI) especializados
   - Workflows (LangGraph) executáveis
   - Schemas (PostgreSQL DDL + NebulaGraph)
   ↓
5. Docker images são buildadas e pushed para registry
   ↓
6. Kubernetes Deployments criados:
   - Namespace: oracle-{id}
   - Middleware pods (3 replicas)
   - Frontend pods (3 replicas)
   - Agents pods (2 replicas)
   ↓
7. Data layer configurado:
   - PostgreSQL schema criado com RLS
   - NebulaGraph space criado
   - pgvector habilitado
   ↓
8. Networking configurado:
   - Ingress com SSL (Let's Encrypt)
   - URL: https://oracle-{id}.supercore.io
   - NetworkPolicy para isolamento
   ↓
9. Health checks validados
   ↓
10. Status atualizado: DEPLOYED
    ↓
11. Usuário recebe link: https://oracle-{id}.supercore.io
```

### 2.1 Camada de Fundação (Oráculo - Pilar 1)

#### Papel do Oráculo
O Oráculo é a **consciência do sistema** - um estado de conhecimento consolidado que serve como fonte única da verdade para geração de soluções.

**Responsabilidades**:
- Armazenar conhecimento do domínio configurado (documentação, regulações, políticas)
- Manter identidade da organização (identificador fiscal, licenças, integrações)
- Fornecer contexto para geração automática de objetos e agentes
- Garantir compliance por design
- Suportar múltiplos idiomas

#### Knowledge Base

**Componentes**:

1. **PostgreSQL 15 (Structured Data + pgvector)**
   - Tabela `oracle_config` (key-value para configurações)
   - Instances de documentação, políticas, regulações
   - Instances de integrações externas
   - Multi-tenancy via `oracle_id NOT NULL`
   - pgvector para embeddings (RAG)

2. **NebulaGraph 3.8 (Knowledge Graph)**
   - Nós: Entidades (objetos, documentos, políticas, regulações)
   - Arestas: Relações semânticas (BASEADA_EM, DERIVADA_DE, GOVERNA)
   - Raciocínio sobre relações entre entidades do domínio

3. **Agentic RAG Trimodal (SQL + Graph + Vector)**
   - **Router Agent (CrewAI)**: Analisa query e decide quais fontes consultar (SQL/Graph/Vector)
   - **Retrieval Agents (3× CrewAI)**: Executam buscas especializadas em paralelo
     - **SQL Agent**: Queries estruturadas em PostgreSQL + pgvector (hybrid search)
     - **Graph Agent**: Navegação de relacionamentos em NebulaGraph (multi-hop reasoning)
     - **Vector Agent**: Busca semântica em Qdrant (similarity search)
   - **Fusion Agent (CrewAI)**: Combina resultados das 3 fontes, resolve conflitos
   - **Generator Agent (CrewAI)**: Sintetiza resposta final usando contexto multi-source
   - **Reflector Agent (CrewAI)**: Valida grounding, detecta hallucinations, auto-corrige
   - **Orquestração Temporal Workflow**: Pipeline durable com checkpoints e retry logic

**Padrões Agentic RAG Implementados**:
1. **Routing Pattern**: Router Agent escolhe dinamicamente SQL vs Graph vs Vector
2. **CRAG (Corrective RAG)**: Fusion Agent avalia qualidade, triggers re-query se insuficiente
3. **Self-RAG**: Reflector Agent verifica grounding, auto-corrige hallucinations
4. **Multi-Source Fusion**: Combina SQL (structured) + Graph (relations) + Vector (semantic)
5. **Iterative Refinement**: Temporal Workflow gerencia loops de retry com checkpoints

#### Integração PostgreSQL + NebulaGraph + Qdrant

**Padrão Híbrido Tri-Database**:
- **PostgreSQL**: Armazena instances com estrutura e versionamento (FSM states)
- **NebulaGraph**: Indexa relacionamentos para queries complexas (multi-hop traversals)
- **Qdrant**: Armazena embeddings para busca semântica de alta performance
- **Sincronização**: Event-driven via Apache Pulsar

**Exemplo de Fluxo**:
```
1. Criar instance de documento (PostgreSQL)
   ↓
2. Publicar evento INSTANCE_CREATED (Pulsar)
   ↓
3. GraphSyncService consome evento
   ↓
4. Cria nó no NebulaGraph + arestas relevantes
   ↓
5. EmbeddingSyncService consome evento
   ↓
6. Gera embedding e armazena em Qdrant + pgvector (redundância)
```

#### Padrões de Acesso

**1. Agentic RAG Trimodal com Temporal Workflow**

```python
# agentic_rag_workflow.py
from temporalio import workflow
from temporalio.common import RetryPolicy
from crewai import Agent, Task, Crew

@workflow.defn
class AgenticRAGWorkflow:
    @workflow.run
    async def run(self, question: str, oracle_id: str) -> dict:
        """
        Temporal Workflow orquestra pipeline Agentic RAG completo
        com checkpoints, retry logic e durable execution.
        """

        # Phase 1: Routing (decide quais fontes consultar)
        routing_decision = await workflow.execute_activity(
            route_query,
            args=[question],
            start_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )

        # Phase 2: Retrieval (paralelo 3× - SQL + Graph + Vector)
        retrieval_tasks = []
        if routing_decision.use_sql:
            retrieval_tasks.append(
                workflow.execute_activity(
                    retrieve_from_sql,
                    args=[question, oracle_id],
                    start_to_close_timeout=timedelta(seconds=30)
                )
            )
        if routing_decision.use_graph:
            retrieval_tasks.append(
                workflow.execute_activity(
                    retrieve_from_graph,
                    args=[question, oracle_id],
                    start_to_close_timeout=timedelta(seconds=30)
                )
            )
        if routing_decision.use_vector:
            retrieval_tasks.append(
                workflow.execute_activity(
                    retrieve_from_vector,
                    args=[question, oracle_id],
                    start_to_close_timeout=timedelta(seconds=30)
                )
            )

        retrieval_results = await asyncio.gather(*retrieval_tasks)

        # Phase 3: Fusion (combina resultados, resolve conflitos)
        fused_context = await workflow.execute_activity(
            fuse_results,
            args=[retrieval_results],
            start_to_close_timeout=timedelta(seconds=20),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )

        # CRAG: Avalia qualidade do contexto, re-query se insuficiente
        if fused_context.quality_score < 0.7:
            workflow.logger.info(f"CRAG: Low quality ({fused_context.quality_score}), re-querying...")
            # Re-query com prompt refinado (max 3 tentativas)
            for attempt in range(3):
                refined_question = await workflow.execute_activity(
                    refine_question,
                    args=[question, fused_context.gaps],
                    start_to_close_timeout=timedelta(seconds=10)
                )
                # Retry retrieval
                retrieval_results = await asyncio.gather(*retrieval_tasks)
                fused_context = await workflow.execute_activity(
                    fuse_results,
                    args=[retrieval_results],
                    start_to_close_timeout=timedelta(seconds=20)
                )
                if fused_context.quality_score >= 0.7:
                    break

        # Phase 4: Generation (síntese da resposta com LLM)
        generated_answer = await workflow.execute_activity(
            generate_answer,
            args=[question, fused_context],
            start_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )

        # Phase 5: Reflection (Self-RAG - valida grounding, detecta hallucinations)
        reflection_result = await workflow.execute_activity(
            reflect_on_answer,
            args=[generated_answer, fused_context],
            start_to_close_timeout=timedelta(seconds=30)
        )

        # Auto-correção se hallucination detectada
        if reflection_result.has_hallucination:
            workflow.logger.warning(f"Self-RAG: Hallucination detected, auto-correcting...")
            generated_answer = await workflow.execute_activity(
                correct_hallucination,
                args=[generated_answer, reflection_result.grounded_facts],
                start_to_close_timeout=timedelta(seconds=40)
            )

        return {
            "answer": generated_answer,
            "sources": fused_context.sources,
            "routing_decision": routing_decision,
            "quality_score": fused_context.quality_score,
            "grounding_score": reflection_result.grounding_score
        }


# CrewAI Agents Implementation
class AgenticRAGCrew:
    def __init__(self, oracle_id: str):
        self.oracle_id = oracle_id

        # Router Agent
        self.router = Agent(
            role="Query Router",
            goal="Analyze query and decide optimal data sources (SQL, Graph, Vector)",
            backstory="Expert in query analysis and data source selection for hybrid retrieval",
            tools=[analyze_query_complexity, classify_query_type],
            verbose=True
        )

        # Retrieval Agents (3×)
        self.sql_agent = Agent(
            role="SQL Retrieval Specialist",
            goal="Execute structured queries in PostgreSQL + pgvector",
            backstory="Database expert optimizing hybrid SQL + vector search",
            tools=[postgres_query, pgvector_search],
            verbose=True
        )

        self.graph_agent = Agent(
            role="Graph Traversal Specialist",
            goal="Navigate relationships in NebulaGraph with multi-hop reasoning",
            backstory="Graph database expert finding complex entity relationships",
            tools=[nebula_query, multi_hop_traversal],
            verbose=True
        )

        self.vector_agent = Agent(
            role="Semantic Search Specialist",
            goal="Perform similarity search in Qdrant vector database",
            backstory="Embedding expert finding semantically similar documents",
            tools=[qdrant_search, rerank_results],
            verbose=True
        )

        # Fusion Agent
        self.fusion_agent = Agent(
            role="Multi-Source Fusion Expert",
            goal="Combine SQL + Graph + Vector results, resolve conflicts, maintain attribution",
            backstory="Information synthesis specialist ensuring coherent multi-source context",
            tools=[merge_results, resolve_conflicts, calculate_quality_score],
            verbose=True
        )

        # Generator Agent
        self.generator = Agent(
            role="Answer Generator",
            goal="Synthesize final answer using multi-source context",
            backstory="LLM orchestration expert generating grounded, coherent responses",
            tools=[llm_generate, cite_sources],
            verbose=True
        )

        # Reflector Agent
        self.reflector = Agent(
            role="Answer Validator (Self-RAG)",
            goal="Validate grounding, detect hallucinations, auto-correct if needed",
            backstory="Quality assurance expert ensuring factual accuracy and source alignment",
            tools=[check_grounding, detect_hallucination, extract_grounded_facts],
            verbose=True
        )
```

**2. Consulta Direta de Configuração**

```typescript
// oracleService.ts
class OracleService {
  async getIdentity(oracleId: string): Promise<OracleIdentity> {
    const result = await db.query(
      `SELECT config FROM oracle_config
       WHERE key = 'identity' AND oracle_id = $1`,
      [oracleId]
    );
    return result.config;
  }

  async getIntegrations(oracleId: string): Promise<Integration[]> {
    const result = await db.query(
      `SELECT data FROM instances
       WHERE object_definition = 'integracao_externa'
       AND current_state = 'ATIVO' AND oracle_id = $1`,
      [oracleId]
    );
    return result.items;
  }
}
```

**3. Graph Reasoning**

```cypher
-- Busca no NebulaGraph: Quais regras derivam de um documento específico?
MATCH (doc:Document {type: "regulation"})
      <-[:BASED_ON]-(rule:Rule)
      -[:GOVERNS]->(entity:ObjectDefinition)
WHERE doc.oracle_id == "{oracle_id}"
RETURN rule.name, rule.condition, entity.name
```

### 2.2 Camada de Abstração (Biblioteca de Objetos - Pilar 2)

#### Object Definitions Dinâmicos

**Tipos de Objetos**:

1. **Data Entities (Entidades de Dados)**
   - Modelos Pydantic + TypeScript interfaces
   - JSON Schema para validação
   - FSM (Finite State Machine) para lifecycle
   - UI Hints para renderização dinâmica
   - **Gerados 100% automaticamente por IA**

2. **Integrations (Integrações Externas)**
   - Connectors para APIs externas
   - Encapsulamento de autenticação e retry logic
   - Tratamento de erros padronizado
   - **Gerados automaticamente conforme necessidade**

3. **UI Components (Componentes de Interface)**
   - React components auto-generated
   - Baseados em JSON Schema + UI Hints
   - Widgets especializados (máscaras, currency, date)
   - **Gerados automaticamente por IA**

4. **Workflows (Fluxos de Processo)**
   - BPM definitions em JSON (compatível com LangFlow)
   - Nodes (telas, agentes, decisões, aprovações)
   - Edges (fluxo entre nodes)
   - **Gerados automaticamente via IA**

5. **Agents (Agentes Autônomos)**
   - Roles, Responsibilities, Tools
   - Implementação em Python (CrewAI)
   - Deployados como MCP Action Agents
   - **Gerados 100% automaticamente por IA**

#### Metadata-Driven Architecture

**Princípio**: O comportamento do sistema é definido por metadados, não por código.

**Exemplo de Object Definition Genérico**:

```json
{
  "id": "uuid-entity-001",
  "name": "business_entity",
  "display_name": "Entidade de Negócio",
  "description": "Entidade principal do domínio configurado",
  "version": "1.0.0",
  "oracle_id": "uuid-oracle-001",

  "schema": {
    "type": "object",
    "properties": {
      "identifier": {
        "type": "string",
        "pattern": "^[A-Z0-9]+$",
        "description": "Identificador único da entidade"
      },
      "name": {
        "type": "string",
        "minLength": 3,
        "maxLength": 200
      },
      "created_date": {
        "type": "string",
        "format": "date"
      },
      "contact_email": {
        "type": "string",
        "format": "email"
      },
      "value": {
        "type": "number",
        "minimum": 0
      }
    },
    "required": ["identifier", "name", "created_date", "contact_email"]
  },

  "states": {
    "initial": "CREATED",
    "states": [
      "CREATED",
      "DATA_COMPLETE",
      "UNDER_VALIDATION",
      "AWAITING_APPROVAL",
      "APPROVED",
      "ACTIVE",
      "BLOCKED",
      "REJECTED_VALIDATION",
      "REJECTED_APPROVAL"
    ],
    "transitions": [
      {
        "from": "CREATED",
        "to": "DATA_COMPLETE",
        "trigger": "complete_data",
        "conditions": ["all_required_fields_filled"]
      },
      {
        "from": "DATA_COMPLETE",
        "to": "UNDER_VALIDATION",
        "trigger": "start_validation",
        "actions": ["trigger_validation_agent"]
      },
      {
        "from": "UNDER_VALIDATION",
        "to": "AWAITING_APPROVAL",
        "trigger": "validation_success",
        "conditions": ["validation_passed"]
      },
      {
        "from": "UNDER_VALIDATION",
        "to": "REJECTED_VALIDATION",
        "trigger": "validation_failed",
        "conditions": ["validation_failed"]
      }
    ]
  },

  "ui_hints": {
    "list_view": {
      "columns": ["identifier", "name", "contact_email", "current_state"],
      "filters": ["identifier", "name", "current_state"],
      "default_sort": {"field": "created_at", "order": "DESC"}
    },
    "detail_view": {
      "sections": [
        {
          "title": "Dados Principais",
          "fields": ["identifier", "name", "created_date", "contact_email"]
        },
        {
          "title": "Informações Adicionais",
          "fields": ["value"]
        }
      ]
    },
    "form_view": {
      "widgets": {
        "identifier": "text_input_uppercase",
        "created_date": "date_picker",
        "value": "currency_input"
      },
      "wizard_steps": [
        {
          "title": "Dados Básicos",
          "fields": ["identifier", "name", "created_date"]
        },
        {
          "title": "Contato",
          "fields": ["contact_email"]
        },
        {
          "title": "Revisão",
          "type": "review"
        }
      ]
    }
  },

  "relationships": [
    {
      "type": "HAS",
      "target_object": "related_entity",
      "cardinality": "ONE_TO_MANY",
      "description": "Entidade possui entidades relacionadas"
    }
  ],

  "validation_rules": [
    {
      "rule_id": "uuid-rule-001",
      "description": "Validação específica do domínio",
      "type": "BUSINESS_RULE",
      "condition": "value >= 0",
      "error_message": "Valor não pode ser negativo"
    }
  ]
}
```

#### Padrões de Extensibilidade

**1. Plugin Architecture**
- Objetos são carregados dinamicamente
- Namespace isolation (um Oracle não vê objetos de outro)
- Versioning sem breaking changes

**2. Dynamic Loading**
```typescript
// objectLoader.ts
class ObjectLoader {
  async loadObjectDefinition(name: string, oracleId: string): Promise<ObjectDefinition> {
    const def = await db.query(
      `SELECT * FROM object_definitions
       WHERE name = $1 AND oracle_id = $2 AND is_active = true`,
      [name, oracleId]
    );

    // Compile JSON Schema to validator
    const validator = ajv.compile(def.schema);

    // Generate TypeScript interface (runtime type checking)
    const tsInterface = generateInterface(def.schema);

    return {
      definition: def,
      validator,
      tsInterface
    };
  }
}
```

**3. Hot Reloading**
- Mudanças em object_definitions não requerem restart
- Cache invalidation automático
- Graceful degradation

### 2.3 Camada de Orquestração (Biblioteca de Agentes - Pilar 3)

#### Autonomous Agents

**Anatomia de um Agente (Genérico)**:

```json
{
  "agent_id": "uuid-agent-001",
  "name": "ProcessingAgent",
  "role": "Você é um Agente de Processamento especializado em validar e processar entidades do domínio, garantindo conformidade com políticas definidas.",
  "responsibilities": [
    "Receber dados da entidade via MCP",
    "Validar dados conforme regras do Oráculo",
    "Executar análise de conformidade",
    "Integrar com sistemas externos configurados",
    "Notificar sobre status do processamento"
  ],
  "tools": [
    "EntityDataObject",
    "ExternalSystemIntegration",
    "ValidationRulesEngine",
    "NotificationService",
    "ProcessingWorkflow"
  ],
  "oracle_id": "uuid-oracle-001"
}
```

#### CrewAI + LangGraph Integration

**Orquestração Multi-Agente**:

```python
# crew_orchestrator.py
from crewai import Agent, Task, Crew
from langchain.graphs import LangGraph

class GenericProcessingCrew:
    def __init__(self, oracle_id: str):
        self.oracle_id = oracle_id

        # Define agents
        self.data_collector = Agent(
            role="Data Collector",
            goal="Coletar e validar dados da entidade",
            tools=[EntityDataObject, ValidationRulesEngine],
            backstory="Especialista em validação de dados"
        )

        self.compliance_analyst = Agent(
            role="Compliance Analyst",
            goal="Analisar conformidade com políticas",
            tools=[PolicyEngine, ComplianceRulesEngine],
            backstory="Analista de conformidade com foco em políticas do domínio"
        )

        self.processor = Agent(
            role="Processor",
            goal="Processar entidade após aprovação",
            tools=[ExternalSystemIntegration, EntityDataObject],
            backstory="Responsável por processamento e integração"
        )

    def run(self, entity_data: dict):
        # Define tasks
        task1 = Task(
            description=f"Validar dados da entidade: {entity_data}",
            agent=self.data_collector
        )

        task2 = Task(
            description="Analisar conformidade da entidade validada",
            agent=self.compliance_analyst,
            depends_on=[task1]
        )

        task3 = Task(
            description="Processar entidade se conformidade aprovada",
            agent=self.processor,
            depends_on=[task2],
            condition="compliance_score > 0.8"
        )

        # Execute crew
        crew = Crew(agents=[self.data_collector, self.compliance_analyst, self.processor],
                     tasks=[task1, task2, task3])

        result = crew.kickoff()
        return result
```

**LangFlow Visual Workflows** (RF019 - Geração Automática pela IA):

SuperCore implementa dois modos de criação de workflows LangFlow:

**MODO 1: Geração Automática pela IA (RECOMENDADO)**:

```python
# workflow_generator.py
from crewai import Agent, Task

async def generate_langflow_workflow(description: str, oracle_id: str):
    """
    Gera workflow LangFlow automaticamente a partir de descrição em texto natural.

    Fluxo:
    1. Usuário descreve workflow: "Preciso de aprovação com validação e notificação"
    2. IA consulta Oráculo (RAG) para buscar objetos, agentes, regras
    3. IA gera JSON LangFlow completo (nodes + edges)
    4. Workflow salvo no banco de dados
    5. Usuário pode ajustar visualmente no LangFlow UI (opcional)
    """

    # Agent que gera workflows
    workflow_generator = Agent(
        role="LangFlow Workflow Architect",
        goal="Generate complete LangFlow workflows from natural language",
        backstory="Expert in workflow design, LangFlow, and business processes",
        tools=[OracleRAGTool, LangFlowNodeCatalogTool, WorkflowValidatorTool],
        llm=ChatAnthropic(model="claude-3-5-sonnet-20241022")
    )

    # Task: Generate workflow
    task = Task(
        description=f"""
        Generate LangFlow workflow JSON from: {description}

        Steps:
        1. Analyze requirements (inputs, processing, conditionals, outputs)
        2. Query Oracle RAG (objects, agents, rules, APIs)
        3. Design workflow (nodes, edges, variables)
        4. Validate (all nodes connected, no orphans, complete logic)

        Return: Complete LangFlow JSON with nodes, edges, variables
        """,
        agent=workflow_generator
    )

    result = await task.execute_async()
    workflow_json = json.loads(result.output)

    # Save to database
    await db.workflows.insert({
        "oracle_id": oracle_id,
        "name": extract_name(description),
        "description": description,
        "workflow_json": workflow_json,
        "version": 1,
        "created_by": "ai"
    })

    return workflow_json

# Exemplo de uso
workflow = await generate_langflow_workflow(
    description="Workflow para validar entidade, processar se válida, notificar resultado",
    oracle_id="uuid-here"
)

# Workflow JSON gerado automaticamente:
# {
#   "nodes": [
#     {"id": "start", "type": "StartNode", ...},
#     {"id": "validate", "type": "ValidationNode", ...},
#     {"id": "conditional", "type": "ConditionalNode", ...},
#     {"id": "process", "type": "AgentCallNode", "agent": "ProcessingAgent", ...},
#     {"id": "notify", "type": "NotificationNode", ...},
#     {"id": "end", "type": "EndNode", ...}
#   ],
#   "edges": [
#     {"source": "start", "target": "validate"},
#     {"source": "validate", "target": "conditional"},
#     {"source": "conditional", "target": "process", "label": "valid"},
#     {"source": "conditional", "target": "notify", "label": "invalid"},
#     {"source": "process", "target": "notify"},
#     {"source": "notify", "target": "end"}
#   ]
# }
```

**MODO 2: Design Manual no LangFlow UI** (para power users):

```python
# langflow_workflow.py (manual)
from langflow import LangFlow

workflow = LangFlow()

# Definir nós manualmente
workflow.add_node("start", type="input")
workflow.add_node("validate", type="agent", agent="ValidationAgent")
workflow.add_node("process", type="agent", agent="ProcessingAgent")
workflow.add_node("notify", type="action", action="send_notification")
workflow.add_node("end", type="output")

# Definir fluxo manualmente
workflow.add_edge("start", "validate")
workflow.add_edge("validate", "process", condition="validation_success")
workflow.add_edge("validate", "notify", condition="validation_failed")
workflow.add_edge("process", "notify")
workflow.add_edge("notify", "end")

# Executar
result = workflow.run(input_data={"entity": entity})
```

**Ajustes Visuais Pós-Geração**:

Após IA gerar workflow, usuário pode:
1. Abrir LangFlow UI
2. Ver diagrama visual completo
3. Ajustar drag-and-drop (mover nós, adicionar/remover conexões)
4. Testar com dados mock
5. Salvar versão ajustada (cria nova versão no banco)

**Vantagens da Geração Automática**:
- **Velocidade**: <60s vs horas de design manual
- **Consistência**: Segue padrões do Oráculo
- **Rastreabilidade**: Geração baseada em RAG (objetos, agentes, regras)
- **Flexibilidade**: Usuário pode ajustar visualmente se necessário

#### Collaboration Patterns

**Padrão 1: Sequential Processing**
```
Agent1 → Agent2 → Agent3
(Coleta → Validação → Processamento)
```

**Padrão 2: Parallel Processing**
```
Agent1 ─┬─→ Agent2 (Validação Tipo A)
        ├─→ Agent3 (Validação Tipo B)
        └─→ Agent4 (Validação Tipo C)
                ↓
            Agent5 (Agregador)
```

**Padrão 3: Approval Workflow**
```
Agent1 → ComplianceAgent (Human-in-the-Loop) → Agent2
```

#### Integração LangGraph + CrewAI na Execução

**Arquitetura de Execução Híbrida**:

LangGraph e CrewAI trabalham juntos de forma complementar:
- **LangGraph**: Gerencia estado, loops, condições, checkpoints
- **CrewAI**: Executa agentes colaborativos com papéis específicos

**Fluxo de Execução**:

```
1. PostgreSQL (Storage)
   ↓
   Workflow JSON + Agent Definitions

2. LangGraph (Runtime Engine)
   ↓
   - Carrega workflow do banco
   - Converte JSON → StateGraph
   - Inicia execução com estado inicial
   - Gerencia loops e condições
   ↓
3. StateGraph Nodes
   ↓
   Nó 1: ValidationNode (LangGraph puro)
   Nó 2: AgentCallNode → CrewAI Agent (híbrido)
   Nó 3: ConditionalNode (LangGraph puro)
   Nó 4: CrewNode → Multiple CrewAI Agents (híbrido)
   Nó 5: EndNode (LangGraph puro)
   ↓
4. Checkpoints (PostgreSQL)
   Estado salvo após cada nó
```

**Padrão 1: Single Agent Call**

LangGraph chama um único agente CrewAI dentro de um nó:

```python
# LangGraph StateGraph
from langgraph.graph import StateGraph, END
from crewai import Agent, Task

class ProcessState(TypedDict):
    data: dict
    validation_result: dict | None
    analysis_result: dict | None

graph = StateGraph(ProcessState)

# Nó LangGraph que chama CrewAI
async def analyze_data_node(state: ProcessState) -> ProcessState:
    """Nó LangGraph que delega para agente CrewAI"""

    # Load agent from database
    agent_def = await db.agents.find_one({"name": "DataAnalyst"})

    # Instantiate CrewAI Agent
    analyst = Agent(
        role=agent_def["role"],
        goal=agent_def["goal"],
        backstory=agent_def["backstory"],
        tools=load_tools(agent_def["tools"])
    )

    # Create task with current state
    task = Task(
        description=f"Analyze this data: {state['data']}",
        agent=analyst
    )

    # Execute (bloqueante)
    result = await asyncio.to_thread(task.execute)

    # Update state
    state["analysis_result"] = result.output

    return state

# Montar grafo
graph.add_node("validate", validation_node)  # LangGraph puro
graph.add_node("analyze", analyze_data_node)  # LangGraph + CrewAI
graph.add_node("decide", decision_node)  # LangGraph puro

graph.set_entry_point("validate")
graph.add_edge("validate", "analyze")
graph.add_conditional_edges("analyze", should_continue, {"continue": "decide", "end": END})

# Executar com checkpoints
app = graph.compile(checkpointer=checkpointer)
```

**Padrão 2: Multi-Agent Crew Call**

LangGraph chama um Crew completo (múltiplos agentes colaborando):

```python
from crewai import Agent, Task, Crew, Process

async def multi_agent_analysis_node(state: ProcessState) -> ProcessState:
    """Nó LangGraph que executa Crew completo"""

    # Agente 1: Coletor
    collector = Agent(
        role="Data Collector",
        goal="Collect comprehensive data",
        tools=[DatabaseTool, APITool]
    )

    # Agente 2: Analista
    analyst = Agent(
        role="Data Analyst",
        goal="Analyze collected data",
        tools=[StatsTool, MLModelTool]
    )

    # Agente 3: Validador
    validator = Agent(
        role="Validator",
        goal="Validate analysis results",
        tools=[ValidationTool, ComplianceTool]
    )

    # Tasks
    task1 = Task(description="Collect data", agent=collector)
    task2 = Task(description="Analyze data", agent=analyst)
    task3 = Task(description="Validate results", agent=validator)

    # Crew (Sequential Process)
    crew = Crew(
        agents=[collector, analyst, validator],
        tasks=[task1, task2, task3],
        process=Process.sequential
    )

    # Execute crew (pode levar minutos)
    result = await asyncio.to_thread(crew.kickoff)

    # Update state com resultado completo
    state["analysis_result"] = {
        "collected_data": result.tasks_output[0],
        "analysis": result.tasks_output[1],
        "validation": result.tasks_output[2]
    }

    return state

# LangGraph StateGraph
graph.add_node("crew_analysis", multi_agent_analysis_node)
```

**Padrão 3: Loop com Agent Calls**

LangGraph gerencia loop até condição ser satisfeita, chamando agente em cada iteração:

```python
class IterativeState(TypedDict):
    request: dict
    iteration: int
    quality_score: float
    result: dict | None

async def improve_result_node(state: IterativeState) -> IterativeState:
    """Chama agente para melhorar resultado iterativamente"""

    # CrewAI Agent
    improver = Agent(
        role="Quality Improver",
        goal="Improve result quality",
        tools=[QualityCheckTool, OptimizationTool]
    )

    task = Task(
        description=f"""
        Improve result (iteration {state['iteration']}):
        Current quality: {state['quality_score']}
        Current result: {state['result']}
        Target quality: 0.9
        """,
        agent=improver
    )

    result = await asyncio.to_thread(task.execute)

    # Update state
    state["result"] = result.output["result"]
    state["quality_score"] = result.output["quality_score"]
    state["iteration"] += 1

    return state

def should_improve_more(state: IterativeState) -> str:
    """Decide se continua melhorando"""
    if state["quality_score"] >= 0.9:
        return "done"
    elif state["iteration"] >= 5:
        return "max_iterations"
    else:
        return "improve"  # Loop!

# Grafo com loop
graph.add_node("improve", improve_result_node)
graph.add_conditional_edges(
    "improve",
    should_improve_more,
    {
        "improve": "improve",  # Loop até qualidade >= 0.9
        "done": END,
        "max_iterations": END
    }
)
```

**Padrão 4: Parallel Agents with State Merge**

LangGraph executa múltiplos agentes em paralelo e merge resultados:

```python
from langgraph.graph import StateGraph, END
import asyncio

class ParallelState(TypedDict):
    input_data: dict
    validation_a: dict | None
    validation_b: dict | None
    validation_c: dict | None
    merged_result: dict | None

async def validation_a_node(state: ParallelState) -> ParallelState:
    """Agente 1: Validação Tipo A"""
    agent = Agent(role="Validator A", ...)
    result = await execute_agent(agent, state["input_data"])
    state["validation_a"] = result
    return state

async def validation_b_node(state: ParallelState) -> ParallelState:
    """Agente 2: Validação Tipo B"""
    agent = Agent(role="Validator B", ...)
    result = await execute_agent(agent, state["input_data"])
    state["validation_b"] = result
    return state

async def validation_c_node(state: ParallelState) -> ParallelState:
    """Agente 3: Validação Tipo C"""
    agent = Agent(role="Validator C", ...)
    result = await execute_agent(agent, state["input_data"])
    state["validation_c"] = result
    return state

async def merge_node(state: ParallelState) -> ParallelState:
    """Merge resultados paralelos"""
    state["merged_result"] = {
        "all_passed": all([
            state["validation_a"]["passed"],
            state["validation_b"]["passed"],
            state["validation_c"]["passed"]
        ]),
        "details": {
            "a": state["validation_a"],
            "b": state["validation_b"],
            "c": state["validation_c"]
        }
    }
    return state

# Grafo com execução paralela
graph.add_node("val_a", validation_a_node)
graph.add_node("val_b", validation_b_node)
graph.add_node("val_c", validation_c_node)
graph.add_node("merge", merge_node)

graph.set_entry_point("val_a")
graph.add_edge("val_a", "merge")  # Executa em paralelo
graph.add_edge("val_b", "merge")  # (LangGraph detecta automaticamente)
graph.add_edge("val_c", "merge")
graph.add_edge("merge", END)
```

**Vantagens da Integração**:

1. **Estado Persistente + Agentes Colaborativos**:
   - LangGraph mantém estado entre chamadas de agentes
   - CrewAI executa colaboração multi-agente

2. **Recovery Robusto**:
   - Se agente CrewAI falhar, LangGraph salva checkpoint
   - Pode retomar execução de onde parou

3. **Debugging Facilitado**:
   - Inspeção de estado antes/depois de cada agente
   - Replay de execução para análise

4. **Flexibilidade**:
   - Pode misturar nós LangGraph puros (validação, transformação)
   - Com nós que chamam agentes CrewAI (análise, decisão)

5. **Escalabilidade**:
   - Execução paralela de múltiplos agentes
   - Merge de resultados gerenciado pelo estado

**Persistência**:

```sql
-- Workflows (LangFlow JSON)
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    workflow_json JSONB NOT NULL,  -- LangFlow nodes + edges
    version INTEGER
);

-- Agents (CrewAI definitions)
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    role TEXT,
    goal TEXT,
    backstory TEXT,
    tools TEXT[]
);

-- Checkpoints (LangGraph state)
CREATE TABLE langgraph_checkpoints (
    thread_id VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    checkpoint JSONB NOT NULL,  -- Estado completo incluindo resultados de agentes
    PRIMARY KEY (thread_id, checkpoint_id)
);
```

### 2.4 Camada de Interface (MCPs - Pilar 4)

#### MCP Server Architecture

**IMPORTANTE: Nomenclatura**

- **Communication Router**: Nome genérico do padrão arquitetural (validação, enriquecimento, roteamento)
- **Interaction Broker**: Implementação específica do SuperCore (Go service que implementa o Communication Router)

**Componentes**:

1. **Apache Pulsar v3.4.0**
   - Message broker central
   - Multi-tenancy via namespaces (`tenant-{oracle_id}`)
   - Schema Registry (Pydantic → Avro)
   - At-least-once delivery

2. **Interaction Broker (Go)** ≡ **Communication Router**

   **Responsabilidades**:
   - **Validação**: Valida MCPs contra templates Pydantic
   - **Enriquecimento**: Adiciona oracle_id, user_id, timestamp, correlation_id
   - **OPA Enforcement**: Aplica políticas de autorização (Rego)
   - **Roteamento**: Roteia para backend apropriado (LangGraph, CrewAI, API direto)
   - **Bidirectional**: Publica via WebSocket/SSE para frontends (real-time updates)

   **Implementação (Go)**:
   ```go
   // interaction_broker.go (Communication Router implementation)
   package main

   import (
       "context"
       "encoding/json"
       "github.com/apache/pulsar-client-go/pulsar"
       "github.com/open-policy-agent/opa/rego"
   )

   type InteractionBroker struct {
       pulsarClient  pulsar.Client
       consumer      pulsar.Consumer
       producer      pulsar.Producer
       opaClient     *rego.Rego
       wsManager     *WebSocketManager
   }

   // 1. Consome MCP do Portal
   func (ib *InteractionBroker) ConsumeFromPortal(ctx context.Context) {
       for {
           msg, err := ib.consumer.Receive(ctx)
           if err != nil {
               log.Error(err)
               continue
           }

           // Parse MCP
           var mcp MCP
           json.Unmarshal(msg.Payload(), &mcp)

           // Process (validate, enrich, route)
           go ib.ProcessMCP(ctx, mcp)

           ib.consumer.Ack(msg)
       }
   }

   // 2. Process MCP (Communication Router logic)
   func (ib *InteractionBroker) ProcessMCP(ctx context.Context, mcp MCP) error {
       // Step 1: Validate against Pydantic template
       if err := ib.ValidateMCP(mcp); err != nil {
           return ib.SendError(mcp.CorrelationID, "validation_failed", err)
       }

       // Step 2: Enrich with context
       enrichedMCP := ib.EnrichMCP(mcp)

       // Step 3: Apply OPA policies
       allowed, err := ib.CheckOPAPolicy(enrichedMCP)
       if err != nil || !allowed {
           return ib.SendError(mcp.CorrelationID, "policy_denied", err)
       }

       // Step 4: Route to backend
       return ib.RouteToBackend(enrichedMCP)
       }

   // 3. Validate MCP
   func (ib *InteractionBroker) ValidateMCP(mcp MCP) error {
       // Load Pydantic template for this intent
       template := ib.LoadTemplate(mcp.Intent)

       // Validate context against template schema
       return template.Validate(mcp.Context)
   }

   // 4. Enrich MCP
   func (ib *InteractionBroker) EnrichMCP(mcp MCP) EnrichedMCP {
       return EnrichedMCP{
           Intent:        mcp.Intent,
           Context:       mcp.Context,
           OracleID:      mcp.OracleID,
           UserID:        mcp.UserID,
           Timestamp:     time.Now().Unix(),
           CorrelationID: uuid.New().String(),
           Metadata: map[string]interface{}{
               "source":    "portal",
               "ip":        mcp.ClientIP,
               "user_agent": mcp.UserAgent,
           },
       }
   }

   // 5. Apply OPA Policy
   func (ib *InteractionBroker) CheckOPAPolicy(mcp EnrichedMCP) (bool, error) {
       // Load OPA policy for this oracle
       policyPath := fmt.Sprintf("oracles/%s/policies/mcp.rego", mcp.OracleID)

       // Evaluate
       query, err := ib.opaClient.PrepareForEval(context.Background())
       if err != nil {
           return false, err
       }

       results, err := query.Eval(context.Background(), rego.EvalInput(mcp))
       if err != nil {
           return false, err
       }

       // Check result
       return results.Allowed(), nil
   }

   // 6. Route to Backend
   func (ib *InteractionBroker) RouteToBackend(mcp EnrichedMCP) error {
       // Decide routing based on intent
       var topic string

       switch mcp.Intent {
       case "execute_workflow":
           // Route to LangGraph executor
           topic = fmt.Sprintf("persistent://tenant-%s/namespace/workflow_requests", mcp.OracleID)

       case "agent_request":
           // Route to CrewAI orchestrator
           topic = fmt.Sprintf("persistent://tenant-%s/namespace/agent_requests", mcp.OracleID)

       case "query_data":
           // Route directly to API (fast path)
           return ib.HandleQueryDataDirect(mcp)

       default:
           return fmt.Errorf("unknown intent: %s", mcp.Intent)
       }

       // Publish to appropriate Pulsar topic
       _, err := ib.producer.Send(context.Background(), &pulsar.ProducerMessage{
           Topic:   topic,
           Payload: mcp.ToJSON(),
       })

       return err
   }

   // 7. Send real-time updates to Portal (via WebSocket)
   func (ib *InteractionBroker) PublishToPortal(update StatusUpdate) {
       // Send via WebSocket to specific user
       ib.wsManager.SendToUser(update.UserID, update)
   }
   ```

---

### Exemplo End-to-End Completo: Onboarding de Cliente

Este exemplo mostra **o fluxo completo** desde o Portal até a execução de workflows LangGraph com agentes CrewAI, integrando todos os 4 componentes (LangFlow, LangGraph, CrewAI, LangChain).

#### Cenário

**Use Case**: Onboarding de novo cliente em uma fintech (criado no Oráculo "CoreBanking")

**Requisitos**:
1. Validar dados do cliente (CPF, email, telefone)
2. Verificar duplicatas no sistema
3. Análise de risco usando agente especializado
4. Aprovação manual se risco > 0.7 (workflow com checkpoint)
5. Criação de conta bancária
6. Envio de email de boas-vindas

**Workflow Gerado pela IA** (RF019 - LangFlow):
- 8 nós: ValidationNode, DuplicateCheckNode, RiskAnalysisNode (CrewAI), ConditionalApprovalNode, ApprovalWaitNode, CreateAccountNode, SendEmailNode, FinalNode
- 2 loops possíveis: Aguardar aprovação (pode levar dias) + Retry de criação de conta

---

#### Passo 1: Portal Envia MCP

**Frontend (Next.js)**:
```typescript
// portal/app/onboarding/page.tsx
async function submitOnboarding(formData: OnboardingForm) {
  const mcp: MCP = {
    type: "onboarding_request",
    oracle_id: "corebanking-001",
    payload: {
      cpf: formData.cpf,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      initial_deposit: formData.initial_deposit
    },
    user_id: session.user.id,
    correlation_id: uuidv4()
  };

  // Publish to Pulsar topic
  await pulsarClient.send({
    topic: "persistent://supercore/portal/mcp_requests",
    message: JSON.stringify(mcp)
  });

  // Listen for updates via WebSocket
  wsClient.on(mcp.correlation_id, (update: StatusUpdate) => {
    setStatus(update.status);
    setProgress(update.progress);
  });
}
```

---

#### Passo 2: Interaction Broker (Communication Router)

**Go Service** consome MCP do Pulsar, valida, enriquece, aplica OPA, roteia:

```go
// interaction_broker.go
func (ib *InteractionBroker) ProcessOnboardingMCP(ctx context.Context, mcp MCP) error {
    // 2.1 Validate against Pydantic template
    template := ib.loadTemplate("OnboardingRequestTemplate")
    if err := template.Validate(mcp.Payload); err != nil {
        return ib.SendError(mcp.CorrelationID, "validation_failed", err)
    }

    // 2.2 Enrich with context
    enrichedMCP := EnrichedMCP{
        MCP:           mcp,
        OracleID:      mcp.OracleID,
        UserID:        mcp.UserID,
        Timestamp:     time.Now(),
        CorrelationID: mcp.CorrelationID,
        Metadata: map[string]interface{}{
            "ip_address":   ib.getClientIP(),
            "user_agent":   ib.getUserAgent(),
            "oracle_config": ib.loadOracleConfig(mcp.OracleID),
        },
    }

    // 2.3 Apply OPA policy
    allowed, err := ib.CheckOPAPolicy(enrichedMCP)
    if !allowed {
        return ib.SendError(mcp.CorrelationID, "policy_denied", err)
    }

    // 2.4 Route to LangGraph Workflow Executor
    // Intent: "execute_workflow" (não é agent_request direto, é workflow!)
    workflowTopic := fmt.Sprintf(
        "persistent://tenant-%s/namespace/workflow_requests",
        mcp.OracleID,
    )

    _, err = ib.producer.Send(ctx, &pulsar.ProducerMessage{
        Topic:   workflowTopic,
        Payload: enrichedMCP.ToJSON(),
        Properties: map[string]string{
            "workflow_type": "onboarding",
            "correlation_id": mcp.CorrelationID,
        },
    })

    // Send initial status to Portal via WebSocket
    ib.PublishToPortal(StatusUpdate{
        CorrelationID: mcp.CorrelationID,
        UserID:        mcp.UserID,
        Status:        "workflow_started",
        Progress:      10,
        Message:       "Onboarding workflow iniciado",
    })

    return err
}
```

---

#### Passo 3: LangGraph Carrega e Executa Workflow

**Python Service** consome do Pulsar topic `workflow_requests`:

```python
# workflow_executor.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver
from crewai import Agent, Task, Crew
import asyncio

class OnboardingState(TypedDict):
    oracle_id: str
    user_id: str
    correlation_id: str
    cpf: str
    name: str
    email: str
    phone: str
    initial_deposit: float
    # Intermediate results
    validation_result: dict | None
    is_duplicate: bool | None
    risk_score: float | None
    requires_approval: bool | None
    approval_status: str | None  # "pending", "approved", "rejected"
    account_id: str | None
    result: dict | None
    errors: Annotated[list[str], operator.add]
    step_count: int

async def execute_onboarding_workflow(enriched_mcp: EnrichedMCP):
    # 3.1 Load workflow definition from PostgreSQL
    workflow = await db.workflows.find_one({
        "oracle_id": enriched_mcp["oracle_id"],
        "type": "onboarding"
    })
    workflow_json = workflow["workflow_json"]  # LangFlow JSON

    # 3.2 Build StateGraph from LangFlow JSON
    graph = StateGraph(OnboardingState)

    # Add nodes (some call CrewAI agents)
    graph.add_node("validate", create_validation_node())
    graph.add_node("check_duplicate", create_duplicate_check_node())
    graph.add_node("analyze_risk", create_risk_analysis_node())  # ← CrewAI Agent!
    graph.add_node("decide_approval", create_approval_decision_node())
    graph.add_node("wait_approval", create_approval_wait_node())  # ← Checkpoint + Loop!
    graph.add_node("create_account", create_account_creation_node())
    graph.add_node("send_email", create_email_node())

    # Add edges
    graph.set_entry_point("validate")
    graph.add_edge("validate", "check_duplicate")
    graph.add_edge("check_duplicate", "analyze_risk")
    graph.add_edge("analyze_risk", "decide_approval")

    # Conditional edge: approval required?
    graph.add_conditional_edges(
        "decide_approval",
        lambda state: "wait" if state["requires_approval"] else "create",
        {"wait": "wait_approval", "create": "create_account"}
    )

    # Loop: wait for manual approval (pode levar dias!)
    graph.add_conditional_edges(
        "wait_approval",
        lambda state: state["approval_status"],
        {
            "pending": "wait_approval",  # ← LOOP até aprovação
            "approved": "create_account",
            "rejected": END
        }
    )

    graph.add_edge("create_account", "send_email")
    graph.add_edge("send_email", END)

    # 3.3 Compile with PostgreSQL checkpointer
    checkpointer = PostgresSaver.from_conn_string(
        "postgresql://user:pass@localhost/supercore"
    )
    app = graph.compile(checkpointer=checkpointer)

    # 3.4 Initial state
    initial_state: OnboardingState = {
        "oracle_id": enriched_mcp["oracle_id"],
        "user_id": enriched_mcp["user_id"],
        "correlation_id": enriched_mcp["correlation_id"],
        "cpf": enriched_mcp["payload"]["cpf"],
        "name": enriched_mcp["payload"]["name"],
        "email": enriched_mcp["payload"]["email"],
        "phone": enriched_mcp["payload"]["phone"],
        "initial_deposit": enriched_mcp["payload"]["initial_deposit"],
        "validation_result": None,
        "is_duplicate": None,
        "risk_score": None,
        "requires_approval": None,
        "approval_status": None,
        "account_id": None,
        "result": None,
        "errors": [],
        "step_count": 0
    }

    # 3.5 Execute with checkpointing
    thread_id = f"{enriched_mcp['oracle_id']}_{enriched_mcp['correlation_id']}"
    config = {"configurable": {"thread_id": thread_id}}

    try:
        async for state in app.astream(initial_state, config):
            print(f"[Step {state['step_count']}] Current node: {app.get_state(config).next}")

            # Publish status to Pulsar (Interaction Broker forwards to Portal)
            await publish_status_update(
                correlation_id=enriched_mcp["correlation_id"],
                status="processing",
                progress=state["step_count"] * 12.5,  # 8 nodes → 12.5% each
                message=f"Step {state['step_count']}/8 completed"
            )

            # Special handling: if waiting for approval, pause execution
            if state.get("requires_approval") and state.get("approval_status") == "pending":
                print(f"[CHECKPOINT] Waiting for manual approval. Thread ID: {thread_id}")
                # Workflow is paused here! Can resume later with same thread_id
                return {
                    "status": "awaiting_approval",
                    "thread_id": thread_id,
                    "progress": 50
                }

        # Workflow completed!
        final_state = app.get_state(config).values
        return {
            "status": "completed",
            "account_id": final_state["account_id"],
            "result": final_state["result"]
        }

    except Exception as e:
        # Error occurred → checkpoint saved, can resume later
        await publish_status_update(
            correlation_id=enriched_mcp["correlation_id"],
            status="error",
            message=str(e)
        )
        raise
```

---

#### Passo 4: CrewAI Agent Execution (Risk Analysis Node)

**Nó LangGraph que chama CrewAI**:

```python
# nodes/risk_analysis_node.py
from crewai import Agent, Task, Crew
from tools import CPFValidatorTool, CreditBureauTool, FraudDetectionTool

def create_risk_analysis_node():
    async def risk_analysis_node(state: OnboardingState) -> OnboardingState:
        """
        Nó LangGraph que delega análise de risco para agente CrewAI.
        Este agente consulta bureaus de crédito, valida CPF, detecta fraude.
        """

        # 4.1 Load agent definition from database (criado pelo Oráculo)
        agent_def = await db.agents.find_one({
            "oracle_id": state["oracle_id"],
            "role": "Risk Analyst"
        })

        # 4.2 Instantiate CrewAI Agent
        risk_analyst = Agent(
            role=agent_def["role"],
            goal=agent_def["goal"],  # "Avaliar risco de cliente para onboarding"
            backstory=agent_def["backstory"],
            tools=[
                CPFValidatorTool(),         # Valida CPF na Receita Federal
                CreditBureauTool(),         # Consulta Serasa/SPC
                FraudDetectionTool(),       # ML model para detecção de fraude
            ],
            llm=ChatAnthropic(model="claude-sonnet-4.5")
        )

        # 4.3 Create task with current state
        task = Task(
            description=f"""
            Analyze onboarding risk for client:
            - Name: {state['name']}
            - CPF: {state['cpf']}
            - Email: {state['email']}
            - Initial Deposit: R$ {state['initial_deposit']}

            Steps:
            1. Validate CPF with Receita Federal
            2. Check credit bureau (Serasa/SPC)
            3. Run fraud detection model
            4. Calculate risk score (0.0 = low risk, 1.0 = high risk)

            Return JSON with:
            {{
                "risk_score": float,
                "risk_factors": [list of strings],
                "recommendation": "approve" | "reject" | "manual_review"
            }}
            """,
            agent=risk_analyst,
            expected_output="JSON object with risk_score, risk_factors, recommendation"
        )

        # 4.4 Execute CrewAI task (synchronous, so use asyncio.to_thread)
        crew = Crew(agents=[risk_analyst], tasks=[task])
        result = await asyncio.to_thread(crew.kickoff)

        # 4.5 Parse result and update state
        risk_result = json.loads(result.output)
        state["risk_score"] = risk_result["risk_score"]
        state["step_count"] += 1

        # Publish intermediate result to Pulsar
        await publish_status_update(
            correlation_id=state["correlation_id"],
            status="processing",
            progress=37.5,  # 3/8 nodes completed
            message=f"Risk analysis completed. Score: {risk_result['risk_score']}"
        )

        return state

    return risk_analysis_node
```

---

#### Passo 5: Checkpoint e Loop (Aguardar Aprovação Manual)

**Approval Wait Node** (pode executar por dias!):

```python
# nodes/approval_wait_node.py
import time

def create_approval_wait_node():
    async def approval_wait_node(state: OnboardingState) -> OnboardingState:
        """
        Nó que aguarda aprovação manual (polling ou event-driven).
        Este nó pode ser executado MÚLTIPLAS VEZES até aprovação.
        LangGraph persiste estado em checkpoint após cada execução.
        """

        # Check approval status in database
        approval_request = await db.approval_requests.find_one({
            "correlation_id": state["correlation_id"]
        })

        if approval_request is None:
            # First time: create approval request
            await db.approval_requests.insert_one({
                "correlation_id": state["correlation_id"],
                "oracle_id": state["oracle_id"],
                "user_id": state["user_id"],
                "cpf": state["cpf"],
                "name": state["name"],
                "risk_score": state["risk_score"],
                "status": "pending",
                "created_at": datetime.now()
            })

            # Send notification to approver (via email/Slack/Portal)
            await send_approval_notification(state)

            state["approval_status"] = "pending"
        else:
            # Subsequent times: check status
            state["approval_status"] = approval_request["status"]  # "pending", "approved", "rejected"

        state["step_count"] += 1

        # Publish status
        await publish_status_update(
            correlation_id=state["correlation_id"],
            status="awaiting_approval",
            progress=62.5,  # 5/8 nodes completed
            message=f"Approval status: {state['approval_status']}"
        )

        # Note: LangGraph will LOOP on this node until approval_status != "pending"
        # Checkpoint is saved automatically by LangGraph after each execution
        # Worker can STOP here and resume tomorrow when approval comes!

        return state

    return approval_wait_node
```

**Como o loop funciona**:
1. Workflow executa até `wait_approval` node
2. Approval status = "pending" → conditional edge retorna "pending" → loop para `wait_approval` novamente
3. **LangGraph salva checkpoint no PostgreSQL** após cada iteração
4. Worker pode **parar** (shutdown, restart, etc.)
5. Quando aprovação chega (gestor aprova no Portal), webhook atualiza `approval_requests` table
6. **Outro worker retoma o workflow** usando o mesmo `thread_id`
7. Workflow executa `wait_approval` novamente → approval_status = "approved" → sai do loop → vai para `create_account`

---

#### Passo 6: Resultado Final e Retorno ao Portal

**Final Node**:

```python
# nodes/final_node.py
def create_email_node():
    async def send_email_node(state: OnboardingState) -> OnboardingState:
        """Send welcome email to new client"""

        await email_service.send(
            to=state["email"],
            subject="Bem-vindo à FinTech!",
            body=f"Olá {state['name']}, sua conta {state['account_id']} foi criada!"
        )

        state["result"] = {
            "success": True,
            "account_id": state["account_id"],
            "message": "Onboarding completed successfully"
        }
        state["step_count"] += 1

        # Publish final result to Pulsar
        await publish_status_update(
            correlation_id=state["correlation_id"],
            status="completed",
            progress=100,
            message="Onboarding completed successfully",
            result=state["result"]
        )

        return state

    return send_email_node
```

---

#### Passo 7: Interaction Broker Consome Resultado e Publica ao Portal

**Go Service** consome do Pulsar topic `processing_status`:

```go
// interaction_broker.go
func (ib *InteractionBroker) ConsumeStatusUpdates(ctx context.Context) {
    consumer, _ := ib.pulsarClient.Subscribe(pulsar.ConsumerOptions{
        Topic:            "persistent://supercore/namespace/processing_status",
        SubscriptionName: "interaction-broker-subscription",
        Type:             pulsar.Shared,
    })

    for {
        msg, err := consumer.Receive(ctx)
        if err != nil {
            log.Error("Error receiving message:", err)
            continue
        }

        var update StatusUpdate
        json.Unmarshal(msg.Payload(), &update)

        // Forward to Portal via WebSocket
        ib.wsManager.SendToUser(update.UserID, update)

        consumer.Ack(msg)
    }
}
```

---

#### Passo 8: Portal Atualiza UI em Tempo Real

**Frontend (Next.js)**:

```typescript
// portal/components/OnboardingStatus.tsx
useEffect(() => {
  const ws = new WebSocket(`ws://localhost:8080/ws?user_id=${session.user.id}`);

  ws.onmessage = (event) => {
    const update: StatusUpdate = JSON.parse(event.data);

    if (update.correlation_id === currentCorrelationId) {
      setStatus(update.status);
      setProgress(update.progress);
      setMessage(update.message);

      if (update.status === "completed") {
        showSuccess(`Conta criada: ${update.result.account_id}`);
      } else if (update.status === "awaiting_approval") {
        showWarning("Aguardando aprovação manual do gestor");
      } else if (update.status === "error") {
        showError(update.message);
      }
    }
  };

  return () => ws.close();
}, []);
```

---

### Resumo do Fluxo End-to-End

| Passo | Componente | Ação | Tecnologia |
|-------|------------|------|------------|
| 1 | **Portal** | Envia MCP `onboarding_request` | Next.js + Pulsar |
| 2 | **Interaction Broker** | Valida, enriquece, OPA, roteia | Go + OPA + Pulsar |
| 3 | **LangGraph** | Carrega workflow JSON, converte para StateGraph | Python + LangGraph + PostgreSQL |
| 4 | **CrewAI Agent** | Executa análise de risco (nó do workflow) | Python + CrewAI + LangChain |
| 5 | **LangGraph** | Salva checkpoint, aguarda aprovação (loop) | LangGraph + PostgreSQL Checkpoints |
| 6 | **LangGraph** | Retoma workflow após aprovação, cria conta | LangGraph + PostgreSQL |
| 7 | **Interaction Broker** | Consome resultado, publica via WebSocket | Go + WebSocket |
| 8 | **Portal** | Atualiza UI em tempo real | Next.js + WebSocket |

**Vantagens desta Arquitetura**:
1. **Stateful**: Workflows podem pausar/retomar (checkpoints PostgreSQL)
2. **Resiliente**: Worker crashes não perdem progresso
3. **Multi-tenant**: Cada Oracle tem seus workflows isolados (Pulsar topics)
4. **Tempo Real**: WebSocket updates durante execução
5. **IA-Driven**: CrewAI agents executam tarefas complexas (análise de risco)
6. **Visual**: Workflow foi gerado pela IA a partir de LangFlow JSON (RF019)

---

3. **Template System (Pydantic)**
   - Constrained Decoding (força LLM a gerar JSON válido)
   - Query Router (Keyword → Semantic → LLM)
   - Dynamic template management via AI Assistant

4. **i18n Service (Multi-língua)**
   - Tradução automática de conteúdo gerado
   - Compatibilidade i18next
   - Suporte a 10+ idiomas

#### Async Messaging

**Tópicos Pulsar** (por Oracle - Genéricos):
```
persistent://tenant-{oracle_id}/namespace/security_alerts
persistent://tenant-{oracle_id}/namespace/compliance_approvals
persistent://tenant-{oracle_id}/namespace/processing_status
persistent://tenant-{oracle_id}/namespace/validation_events
persistent://tenant-{oracle_id}/namespace/entity_creation
persistent://tenant-{oracle_id}/namespace/workflow_events
persistent://tenant-{oracle_id}/namespace/system_notifications
```

**Fluxo de Mensagem**:
```
1. Frontend publica mensagem MCP (entity_creation)
   ↓
2. Interaction Broker consome
   ↓
3. Valida contra template EntityCreationTemplate
   ↓
4. Enriquece com oracle_id e user_id
   ↓
5. Publica para CrewAI Orchestrator
   ↓
6. ProcessingCrew executa tarefas
   ↓
7. Agentes publicam status updates (processing_status)
   ↓
8. Interaction Broker consome e publica via WebSocket
   ↓
9. Frontend atualiza UI em tempo real
```

#### Tool Interfaces

**MCP Tools** (expostos para Claude Desktop e outros clients):

```typescript
// mcp_server.ts
const tools = [
  {
    name: "create_oracle",
    description: "Cria novo Oráculo para um domínio",
    parameters: {
      name: { type: "string", required: true },
      domain: { type: "string", required: true },
      description: { type: "string", required: true },
      languages: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "upload_context",
    description: "Upload de documentos para conhecimento do Oráculo",
    parameters: {
      oracle_id: { type: "string", required: true },
      files: { type: "array", items: { type: "string" } },
      urls: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "generate_object_definition",
    description: "Gera object_definition automaticamente via IA",
    parameters: {
      oracle_id: { type: "string", required: true },
      description: { type: "string", required: true },
      context: { type: "object" }
    }
  },
  {
    name: "generate_agent",
    description: "Gera agente especializado automaticamente via IA",
    parameters: {
      oracle_id: { type: "string", required: true },
      role: { type: "string", required: true },
      responsibilities: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "generate_workflow",
    description: "Gera workflow automaticamente via IA",
    parameters: {
      oracle_id: { type: "string", required: true },
      description: { type: "string", required: true },
      steps: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "execute_workflow",
    description: "Executa workflow definido",
    parameters: {
      workflow_id: { type: "string", required: true },
      oracle_id: { type: "string", required: true },
      input_data: { type: "object" }
    }
  },
  {
    name: "execute_agent",
    description: "Executa agente específico",
    parameters: {
      agent_id: { type: "string", required: true },
      oracle_id: { type: "string", required: true },
      task: { type: "string", required: true }
    }
  },
  {
    name: "rag_query",
    description: "Consulta Agentic RAG do Oráculo (multi-agent trimodal)",
    parameters: {
      question: { type: "string", required: true },
      oracle_id: { type: "string", required: true },
      object_types: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "test_validation_rule",
    description: "Testa regra de validação",
    parameters: {
      rule_id: { type: "string", required: true },
      oracle_id: { type: "string", required: true },
      sample_data: { type: "object", required: true }
    }
  },
  {
    name: "play_oracle",
    description: "Ativa deploy completo do Oráculo (Play)",
    parameters: {
      oracle_id: { type: "string", required: true }
    }
  }
];
```

#### Integration Patterns

**Padrão 1: Request-Response (Síncrono)**
```typescript
// Portal envia MCP e aguarda resposta
const result = await mcpClient.call("rag_query", {
  question: "Qual a política de validação?",
  oracle_id: currentOracle.id
});
```

**Padrão 2: Fire-and-Forget (Assíncrono)**
```typescript
// Portal dispara processamento e recebe updates via WebSocket
await mcpClient.call("execute_workflow", { workflow_id, oracle_id, input_data });

wsClient.on("processing_status", (status) => {
  updateUI(status);
});
```

**Padrão 3: Pub-Sub (Multi-Canal)**
```typescript
// Agente publica evento, múltiplos subscribers consomem
await pulsar.publish("validation_events", {
  alert_id: "uuid",
  entity_id: "12345",
  validation_score: 0.95,
  severity: "CRITICAL"
});

// Subscribers:
// - Frontend (popup alert)
// - Email Service (notifica compliance)
// - Integration Service (notifica sistema externo)
```

### 2.5 Camada de Apresentação

#### Dynamic UI

**Princípio**: UI é 100% gerada a partir de metadados (JSON Schema + UI Hints).

**FormBuilder Component**:

```typescript
// components/FormBuilder.tsx
interface FormBuilderProps {
  objectDefinition: ObjectDefinition;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ objectDefinition, initialData, onSubmit }) => {
  const { schema, ui_hints } = objectDefinition;
  const { t } = useTranslation(); // i18n

  // Generate form fields from schema
  const fields = Object.entries(schema.properties).map(([fieldName, fieldSchema]) => {
    const widget = ui_hints.form_view.widgets[fieldName] || "text_input";
    const label = t(`objects.${objectDefinition.name}.fields.${fieldName}`) || fieldName;

    switch (widget) {
      case "text_input_uppercase":
        return <TextInput key={fieldName} name={fieldName} schema={fieldSchema} label={label} uppercase />;
      case "currency_input":
        return <CurrencyInput key={fieldName} name={fieldName} schema={fieldSchema} label={label} />;
      case "date_picker":
        return <DatePicker key={fieldName} name={fieldName} schema={fieldSchema} label={label} />;
      default:
        return <TextInput key={fieldName} name={fieldName} schema={fieldSchema} label={label} />;
    }
  });

  // Apply wizard layout if specified
  if (ui_hints.form_view.wizard_steps) {
    return <WizardForm steps={ui_hints.form_view.wizard_steps} fields={fields} onSubmit={onSubmit} />;
  }

  return <SimpleForm fields={fields} onSubmit={onSubmit} />;
};
```

#### AI Context Generator

**Interface de Criação de Modelos**:

```tsx
// pages/novo-contexto.tsx
const NovoContextoPage = () => {
  const { currentOracle } = useOracle();
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<ContextInputs>({
    nome_modelo: "",
    super_prompt: "",
    documentos: [],
    diagramas: [],
    urls: [],
    documentos_produto: []
  });

  const handleProcessar = async () => {
    // 1. Cria contexto
    const context = await mcpClient.call("create_context", {
      oracle_id: currentOracle.id,
      ...inputs
    });

    // 2. Processa (gera especificação)
    await mcpClient.call("process_context", {
      context_id: context.id,
      oracle_id: currentOracle.id
    });

    // 3. Aguarda conclusão e exibe especificação
    const result = await mcpClient.call("wait_for_processing", {
      context_id: context.id,
      timeout_seconds: 600
    });

    navigate(`/contextos/${context.id}/especificacao`);
  };

  return (
    <div>
      <h1>{t('context.new.title')}</h1>

      <Input label={t('context.new.name')} value={inputs.nome_modelo} onChange={...} />

      <FileUpload label={t('context.new.documents')} accept=".pdf,.docx" onChange={...} />

      <FileUpload label={t('context.new.diagrams')} accept=".png,.svg,.json" onChange={...} />

      <URLInput label={t('context.new.urls')} onChange={...} />

      <TextArea label={t('context.new.super_prompt')} rows={10} value={inputs.super_prompt} onChange={...} />

      <Button onClick={handleProcessar}>{t('context.new.generate')}</Button>
    </div>
  );
};
```

#### Frontend Patterns

**Padrão 1: Oracle-Filtered Lists**
```tsx
// components/InstanceList.tsx
const InstanceList = ({ objectDefinition }: { objectDefinition: string }) => {
  const { currentOracle } = useOracle();
  const { data } = useSWR(
    `/api/v1/instances?object_definition=${objectDefinition}&oracle_id=${currentOracle.id}`
  );

  return <Table data={data.items} columns={getColumns(objectDefinition)} />;
};
```

**Padrão 2: Real-Time Updates via WebSocket**
```tsx
// hooks/useRealtimeStatus.ts
const useRealtimeStatus = (contextId: string) => {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://interaction-broker:8080/status/${contextId}`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStatus(update);
    };

    return () => ws.close();
  }, [contextId]);

  return status;
};
```

---

## 3. PADRÕES ARQUITETURAIS

### 3.1 Metadata-Driven Architecture

#### Como Funciona

**Princípio**: Todo comportamento é definido por metadados, não por código hardcoded.

**Componentes**:
1. **Schema Definitions** (JSON Schema)
2. **State Machines** (FSM definitions)
3. **Validation Rules** (conditions + actions)
4. **UI Hints** (rendering instructions)

#### Benefícios

- **Evolução Sem Deploy**: Mudanças em object_definitions não requerem restart
- **Multi-Domain**: Mesma engine serve múltiplos domínios (cada um com seu Oráculo)
- **Testabilidade**: Metadados podem ser testados de forma isolada
- **Rastreabilidade**: Toda decisão tem fonte rastreável (documento → regra → ação)

#### Implementação

**Engine de Validação Dinâmica**:

```typescript
// validation_engine.ts
class ValidationEngine {
  async validate(instance: Instance, objectDefinition: ObjectDefinition): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // 1. Schema validation (JSON Schema)
    const schemaValidator = ajv.compile(objectDefinition.schema);
    if (!schemaValidator(instance.data)) {
      errors.push(...schemaValidator.errors);
    }

    // 2. Business rules validation (dynamic)
    const rules = await this.loadRules(objectDefinition.validation_rules);
    for (const rule of rules) {
      const violated = await this.evaluateRule(rule, instance.data);
      if (violated) {
        errors.push({
          rule_id: rule.rule_id,
          message: rule.error_message,
          source: rule.source_document
        });
      }
    }

    // 3. FSM validation (state transitions)
    const validTransition = this.validateTransition(
      instance.current_state,
      instance.target_state,
      objectDefinition.states
    );
    if (!validTransition) {
      errors.push({
        message: `Invalid transition: ${instance.current_state} -> ${instance.target_state}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

**FSM Engine Genérico**:

```go
// fsm_engine.go
type FSMEngine struct {
    db *sql.DB
}

func (e *FSMEngine) Transition(instanceID, targetState string) error {
    // 1. Buscar instance atual
    instance, err := e.getInstance(instanceID)
    if err != nil {
        return err
    }

    // 2. Buscar object_definition (FSM)
    objDef, err := e.getObjectDefinition(instance.ObjectDefinitionID)
    if err != nil {
        return err
    }

    // 3. Validar transição permitida
    transition := e.findTransition(objDef.States, instance.CurrentState, targetState)
    if transition == nil {
        return fmt.Errorf("invalid transition: %s -> %s", instance.CurrentState, targetState)
    }

    // 4. Avaliar condições
    if !e.evaluateConditions(transition.Conditions, instance.Data) {
        return fmt.Errorf("transition conditions not met")
    }

    // 5. Executar ações
    for _, action := range transition.Actions {
        if err := e.executeAction(action, instance); err != nil {
            return err
        }
    }

    // 6. Atualizar estado
    _, err = e.db.Exec(
        "UPDATE instances SET current_state = $1, updated_at = NOW() WHERE id = $2",
        targetState, instanceID,
    )

    if err != nil {
        return err
    }

    // 7. Publicar evento
    e.eventBus.Publish(Event{
        Type: "INSTANCE_STATE_CHANGED",
        OracleID: instance.OracleID,
        Payload: map[string]interface{}{
            "instance_id": instanceID,
            "old_state": instance.CurrentState,
            "new_state": targetState,
        },
    })

    return nil
}
```

### 3.2 Event-Driven Architecture

#### Pulsar Event Bus

**Eventos do Sistema**:
```go
// events/types.go
const (
    ORACLE_CREATED           = "ORACLE_CREATED"
    ORACLE_UPDATED           = "ORACLE_UPDATED"
    ORACLE_DEPLOYED          = "ORACLE_DEPLOYED"

    OBJECT_DEFINITION_CREATED = "OBJECT_DEFINITION_CREATED"
    OBJECT_DEFINITION_UPDATED = "OBJECT_DEFINITION_UPDATED"

    INSTANCE_CREATED         = "INSTANCE_CREATED"
    INSTANCE_UPDATED         = "INSTANCE_UPDATED"
    INSTANCE_STATE_CHANGED   = "INSTANCE_STATE_CHANGED"

    AGENT_EXECUTED           = "AGENT_EXECUTED"
    WORKFLOW_COMPLETED       = "WORKFLOW_COMPLETED"

    VALIDATION_FAILED        = "VALIDATION_FAILED"
    COMPLIANCE_ALERT         = "COMPLIANCE_ALERT"
)
```

**Event Publishing**:
```go
// event_bus.go
type EventBus struct {
    pulsarClient pulsar.Client
}

func (eb *EventBus) Publish(event Event) error {
    topic := fmt.Sprintf("persistent://tenant-%s/namespace/%s", event.OracleID, event.Type)

    producer, err := eb.pulsarClient.CreateProducer(pulsar.ProducerOptions{
        Topic: topic,
    })
    if err != nil {
        return err
    }
    defer producer.Close()

    payload, _ := json.Marshal(event.Payload)

    _, err = producer.Send(context.Background(), &pulsar.ProducerMessage{
        Payload: payload,
        Properties: map[string]string{
            "event_type": event.Type,
            "oracle_id": event.OracleID,
            "timestamp": time.Now().Format(time.RFC3339),
        },
    })

    return err
}
```

**Event Consumption**:
```go
// services/graph_sync_service.go
type GraphSyncService struct {
    nebulaClient *nebula.Client
}

func (s *GraphSyncService) Start() {
    consumer, _ := pulsarClient.Subscribe(pulsar.ConsumerOptions{
        Topics: []string{"persistent://*/namespace/INSTANCE_CREATED"},
        SubscriptionName: "graph-sync-service",
    })

    for {
        msg, err := consumer.Receive(context.Background())
        if err != nil {
            log.Error(err)
            continue
        }

        var event Event
        json.Unmarshal(msg.Payload(), &event)

        // Sync to NebulaGraph
        s.syncToGraph(event)

        consumer.Ack(msg)
    }
}
```

### 3.3 AI-Driven Generation Pattern

#### 6 Fases do AI Context Generator

**Fase 0: Setup do Oráculo**
```python
# phase_0_setup.py
async def setup_oracle(config: OracleConfig) -> Oracle:
    # 1. Criar oracle_config
    oracle_id = uuid4()
    await db.execute(
        "INSERT INTO oracle_config (id, name, domain, description, languages) VALUES ($1, $2, $3, $4, $5)",
        oracle_id, config.name, config.domain, config.description, config.languages
    )

    # 2. Publicar evento
    event_bus.publish(Event(
        type="ORACLE_CREATED",
        oracle_id=oracle_id,
        payload=config.dict()
    ))

    return Oracle(id=oracle_id, config=config)
```

**Fase 1: Upload de Contexto Multimodal**
```python
# phase_1_upload.py
async def upload_context(oracle_id: str, files: list, urls: list) -> ContextUpload:
    # 1. Processar arquivos (30+ formatos)
    processed_files = []
    for file in files:
        if file.type == "application/pdf":
            content = await pdf_parser.extract(file)
        elif file.type == "image/*":
            content = await vision_api.analyze(file)
        elif file.type == "audio/*":
            content = await whisper.transcribe(file)
        # ... outros formatos

        processed_files.append(content)

    # 2. Ingerir URLs
    for url in urls:
        content = await web_scraper.scrape(url)
        processed_files.append(content)

    # 3. Armazenar
    context_id = await db.insert_context(oracle_id, processed_files)

    # 4. Publicar para processamento
    event_bus.publish(Event(
        type="CONTEXT_UPLOADED",
        oracle_id=oracle_id,
        payload={"context_id": context_id}
    ))

    return ContextUpload(id=context_id, oracle_id=oracle_id)
```

**Fase 2: Geração de Especificação + Refinamento Iterativo**
```python
# phase_2_specification.py
async def generate_specification(context_id: str, oracle_id: str) -> Specification:
    # 1. Consultar Oráculo (Agentic RAG Trimodal)
    oracle_knowledge = await agentic_rag_service.query(
        question="Qual conhecimento existe neste Oráculo sobre o domínio?",
        oracle_id=oracle_id
    )

    # 2. Buscar contexto uploaded
    context = await db.get_context(context_id)

    # 3. Gerar especificação via LLM
    spec_prompt = f"""
Com base no conhecimento do Oráculo: {oracle_knowledge}

E no contexto fornecido: {context}

Gere uma especificação completa em Markdown com:
1. Objetos necessários (Data Entities)
2. Agentes especializados
3. Workflows de negócio
4. Integrações externas
5. Validações e regras de compliance
"""

    specification_md = await llm.generate(spec_prompt)

    # 4. Salvar especificação
    spec_id = await db.insert_specification(context_id, specification_md)

    return Specification(id=spec_id, content=specification_md)

async def refine_specification_iterative(spec_id: str, user_feedback: str) -> Specification:
    # Chat iterativo para refinamento
    current_spec = await db.get_specification(spec_id)

    refined_spec = await llm.generate(f"""
Especificação atual:
{current_spec}

Feedback do usuário:
{user_feedback}

Refine a especificação incorporando o feedback.
""")

    # Versionar especificação
    await db.update_specification(spec_id, refined_spec, version=current_spec.version + 1)

    return Specification(id=spec_id, content=refined_spec)
```

**Fase 3: Geração Automática de Modelo Executável**
```python
# phase_3_generation.py
async def generate_executable_model(spec_id: str, oracle_id: str) -> ExecutableModel:
    spec = await db.get_specification(spec_id)
    oracle_knowledge = await rag_service.get_oracle_context(oracle_id)

    # 1. Gerar Object Definitions
    object_defs = await generate_object_definitions(spec, oracle_knowledge)

    # 2. Gerar Validation Rules
    validation_rules = await generate_validation_rules(spec, oracle_knowledge)

    # 3. Gerar Workflows
    workflows = await generate_workflows(spec, oracle_knowledge)

    # 4. Gerar Agents
    agents = await generate_agents(spec, oracle_knowledge)

    # 5. Gerar Integrações
    integrations = await generate_integrations(spec, oracle_knowledge)

    # 6. Gerar Database Schema
    db_schema = await generate_database_schema(object_defs)

    # 7. Gerar Type Definitions
    pydantic_models = await generate_pydantic_models(object_defs)
    typescript_interfaces = await generate_typescript_interfaces(object_defs)

    # 8. Gerar Graph Relations
    graph_relations = await generate_graph_relations(object_defs)

    # Salvar modelo
    model_id = await db.insert_executable_model(
        oracle_id=oracle_id,
        spec_id=spec_id,
        object_definitions=object_defs,
        validation_rules=validation_rules,
        workflows=workflows,
        agents=agents,
        integrations=integrations,
        db_schema=db_schema,
        type_definitions={
            "pydantic": pydantic_models,
            "typescript": typescript_interfaces
        },
        graph_relations=graph_relations
    )

    return ExecutableModel(id=model_id, oracle_id=oracle_id)

async def generate_object_definitions(spec: Specification, oracle_knowledge: dict) -> list:
    prompt = f"""
Com base na especificação:
{spec.content}

E no conhecimento do Oráculo:
{oracle_knowledge}

Gere object_definitions em JSON Schema para TODOS os objetos identificados.
Cada object_definition deve incluir:
- schema (JSON Schema completo)
- states (FSM com estados e transições)
- ui_hints (instruções para renderização)
- relationships (relações com outros objetos)
- validation_rules (regras de negócio)
"""

    objects_json = await llm.generate(prompt, response_format="json")

    return json.loads(objects_json)
```

**Fase 4: Preview, Teste e Aprovação**
```python
# phase_4_preview.py
async def preview_model(model_id: str) -> ModelPreview:
    model = await db.get_executable_model(model_id)

    # 1. Gerar graph visualization
    graph = build_object_graph(model.object_definitions)

    # 2. Simular workflows
    workflow_simulations = await simulate_workflows(model.workflows, sample_data={})

    # 3. Testar agentes
    agent_test_results = await test_agents(model.agents, sample_tasks=[])

    return ModelPreview(
        graph=graph,
        workflow_simulations=workflow_simulations,
        agent_tests=agent_test_results
    )

async def approve_model(model_id: str, approved_by: str) -> ApprovalResult:
    await db.execute(
        "UPDATE executable_models SET approved = TRUE, approved_by = $1, approved_at = NOW() WHERE id = $2",
        approved_by, model_id
    )

    event_bus.publish(Event(
        type="MODEL_APPROVED",
        payload={"model_id": model_id, "approved_by": approved_by}
    ))

    return ApprovalResult(approved=True, model_id=model_id)
```

**Fase 5: "Play" - Deploy Completo Automático**
```python
# phase_5_play.py
async def play_oracle(oracle_id: str, model_id: str) -> PlayResult:
    model = await db.get_executable_model(model_id)
    oracle = await db.get_oracle(oracle_id)

    # 1. Code Generation
    code_gen = CodeGenerationEngine(oracle_id)

    middleware_code = await code_gen.generate_middleware(model.object_definitions)
    frontend_code = await code_gen.generate_frontend(model.object_definitions, model.workflows)
    agents_code = await code_gen.generate_agents(model.agents)

    # 2. Docker Build & Push
    middleware_image = await docker_build_and_push("middleware", middleware_code, oracle_id)
    frontend_image = await docker_build_and_push("frontend", frontend_code, oracle_id)
    agents_image = await docker_build_and_push("agents", agents_code, oracle_id)

    # 3. Kubernetes Deploy
    orchestrator = DeploymentOrchestrator()

    deploy_result = await orchestrator.deploy_oracle(
        oracle_id=oracle_id,
        middleware_image=middleware_image,
        frontend_image=frontend_image,
        agents_image=agents_image,
        model=model
    )

    # 4. Setup Data Layer
    await setup_postgresql_schema(oracle_id, model.db_schema)
    await setup_nebula_graph(oracle_id, model.graph_relations)

    # 5. Configure Networking
    url = f"https://oracle-{oracle_id}.supercore.io"
    await configure_ingress(oracle_id, url)

    # 6. Update Oracle Status
    await db.execute(
        "UPDATE oracle_config SET status = 'DEPLOYED', deployed_at = NOW(), url = $1 WHERE id = $2",
        url, oracle_id
    )

    # 7. Publish Event
    event_bus.publish(Event(
        type="ORACLE_DEPLOYED",
        oracle_id=oracle_id,
        payload={"url": url, "model_id": model_id}
    ))

    return PlayResult(
        success=True,
        oracle_id=oracle_id,
        url=url,
        deployed_at=datetime.now()
    )
```

---

## 4. COMPONENTES PRINCIPAIS

### 4.1 Backend Services (Go)

#### Instance Manager

**Responsabilidades**:
- CRUD de instances
- Validação de dados
- Transições de estado (FSM)
- Eventos de lifecycle

**API**:
```go
// api/instance_manager.go
type InstanceManager struct {
    db           *sql.DB
    validator    *ValidationEngine
    fsmEngine    *FSMEngine
    eventBus     *EventBus
}

// CreateInstance creates a new instance
func (im *InstanceManager) CreateInstance(ctx context.Context, req *CreateInstanceRequest) (*Instance, error) {
    // 1. Load object_definition
    objDef, err := im.getObjectDefinition(req.ObjectDefinitionID, req.OracleID)
    if err != nil {
        return nil, err
    }

    // 2. Validate data
    validationResult := im.validator.Validate(req.Data, objDef)
    if !validationResult.Valid {
        return nil, validationResult.Errors
    }

    // 3. Create instance
    instance := &Instance{
        ID:                 uuid.New(),
        ObjectDefinitionID: req.ObjectDefinitionID,
        OracleID:          req.OracleID,
        Data:              req.Data,
        CurrentState:      objDef.States.Initial,
        CreatedBy:         req.UserID,
        CreatedAt:         time.Now(),
    }

    // 4. Persist
    if err := im.db.Insert(instance); err != nil {
        return nil, err
    }

    // 5. Publish event
    im.eventBus.Publish(Event{
        Type: INSTANCE_CREATED,
        OracleID: req.OracleID,
        Payload: instance,
    })

    return instance, nil
}
```

#### Object Manager

**Responsabilidades**:
- CRUD de object_definitions
- Versionamento
- Schema compilation
- Impacto analysis

#### Oracle Manager

**Responsabilidades**:
- CRUD de Oráculos
- Configuração de identidade
- Gestão de licenças
- Auditoria

### 4.2 AI Services (Python)

#### AI Context Generator

**Responsabilidades**:
- Orquestração das 6 fases
- Upload e processamento multimodal
- Geração de especificações
- Geração de modelos executáveis

#### Agentic RAG Service

**Responsabilidades**:
- **Router Agent (CrewAI)**: Análise de query e decisão de fontes (SQL/Graph/Vector)
- **Retrieval Agents (3× CrewAI)**: Consulta paralela em PostgreSQL, NebulaGraph, Qdrant
- **Fusion Agent (CrewAI)**: Combinação de resultados multi-source com resolução de conflitos
- **Generator Agent (CrewAI)**: Síntese de resposta grounded com LLM
- **Reflector Agent (CrewAI)**: Validação de grounding, detecção de hallucinations
- **Temporal Workflow Orchestration**: Pipeline durable com checkpoints, retry logic, CRAG/Self-RAG
- Cache de embeddings e agent memory (Redis + PostgreSQL)

#### Code Generation Engine

**Responsabilidades**:
- Geração de middlewares (FastAPI/Gin)
- Geração de frontends (Next.js)
- Geração de agentes (CrewAI)
- Geração de schemas (SQL + Graph)

### 4.3 Integration Services

#### Deployment Orchestrator

**Responsabilidades**:
- Orquestração de deploy completo
- Kubernetes management
- Docker build & push
- Networking configuration
- Multi-tenant isolation

#### Interaction Broker

**Responsabilidades**:
- Bridge entre Pulsar e WebSockets
- Validação de mensagens
- Enriquecimento de contexto
- Rate limiting por Oracle

#### i18n Service

**Responsabilidades**:
- Tradução automática de conteúdo gerado
- Gestão de dicionários
- Compatibilidade i18next
- Suporte a 10+ idiomas

---

## 5. INTEGRAÇÕES E FLUXOS

### 5.1 Fluxo Completo: Criação de Oráculo até Deploy

```
┌────────────────────────────────────────────────────────────┐
│ FASE 0: Setup do Oráculo                                   │
└────────────────────────────────────────────────────────────┘
  Usuário acessa Super Portal
     ↓
  Clica "Novo Oráculo"
     ↓
  Preenche: Nome, Domínio, Descrição, Idiomas
     ↓
  Oracle Manager Service cria oracle_config
     ↓
  Evento ORACLE_CREATED publicado
     ↓
  Oráculo criado (status: CREATED)

┌────────────────────────────────────────────────────────────┐
│ FASE 1: Upload de Contexto Multimodal                      │
└────────────────────────────────────────────────────────────┘
  Usuário acessa "Novo Contexto" para o Oráculo
     ↓
  Upload de documentos (PDFs, imagens, áudio, diagramas)
     ↓
  Adiciona URLs para scraping
     ↓
  Escreve Super Prompt (descrição em linguagem natural)
     ↓
  MultiModal Processor processa TODOS os formatos
     ↓
  Documentos armazenados + eventos publicados
     ↓
  GraphSyncService sincroniza para NebulaGraph
     ↓
  EmbeddingSyncService gera embeddings (pgvector)
     ↓
  Contexto pronto (status: UPLOADED)

┌────────────────────────────────────────────────────────────┐
│ FASE 2: Geração de Especificação + Refinamento Iterativo   │
└────────────────────────────────────────────────────────────┘
  IA consulta Oráculo (Agentic RAG - 6 agents)
     ↓
  IA gera especificação inicial em Markdown
     ↓
  Usuário revisa especificação
     ↓
  Chat iterativo para refinamento:
     Usuário: "Adicionar campo X"
     IA: "Especificação atualizada com campo X"
     Usuário: "Mudar validação Y"
     IA: "Validação Y atualizada"
     ↓
  Usuário aprova especificação
     ↓
  Especificação salva (status: APPROVED)

┌────────────────────────────────────────────────────────────┐
│ FASE 3: Geração Automática de Modelo Executável            │
└────────────────────────────────────────────────────────────┘
  IA gera automaticamente:
     1. Object Definitions (JSON Schema completos)
     2. Validation Rules (todas as regras em validation_rules)
     3. Workflows (processos em JSON - LangFlow compatible)
     4. Agents (agentes CrewAI especializados)
     5. Integrations (conectores para APIs externas)
     6. Database Schema (DDL PostgreSQL)
     7. Type Definitions (Pydantic + TypeScript)
     8. Graph Relations (mapeamento NebulaGraph)
     ↓
  Modelo executável completo (status: GENERATED)
     ↓
  ZERO código manual necessário

┌────────────────────────────────────────────────────────────┐
│ FASE 4: Preview, Teste e Aprovação                         │
└────────────────────────────────────────────────────────────┘
  Usuário visualiza:
     - Object Graph (React Flow)
     - Lista de objetos gerados
     - Lista de agentes gerados
     - Lista de workflows gerados
     ↓
  Usuário testa:
     - Workflows (simulação com dados de exemplo)
     - Agentes (execução com sample tasks)
     - Validações (teste com dados válidos/inválidos)
     ↓
  Usuário aprova modelo
     ↓
  Modelo pronto para deploy (status: APPROVED)

┌────────────────────────────────────────────────────────────┐
│ FASE 5: "Play" - Deploy Completo Automático                │
└────────────────────────────────────────────────────────────┘
  Usuário clica "Play"
     ↓
  Deployment Orchestrator acionado
     ↓
  Code Generation Engine gera:
     1. Middleware (FastAPI) com todas as APIs REST
     2. Frontend (Next.js) com forms/listas/dashboards
     3. Agentes (CrewAI crews prontos)
     4. Workflows (LangGraph state machines)
     ↓
  Docker images buildadas e pushed
     ↓
  Kubernetes deploy:
     - Namespace: oracle-{id}
     - Middleware pods (3 replicas)
     - Frontend pods (3 replicas)
     - Agents pods (2 replicas)
     ↓
  Data layer configurado:
     - PostgreSQL schema com RLS
     - NebulaGraph space
     - pgvector habilitado
     ↓
  Networking configurado:
     - Ingress + SSL (Let's Encrypt)
     - URL: https://oracle-{id}.supercore.io
     - NetworkPolicy para isolamento
     ↓
  Health checks validados
     ↓
  Status: DEPLOYED
     ↓
  Usuário recebe link: https://oracle-{id}.supercore.io
     ↓
  SOLUÇÃO COMPLETA RODANDO EM PRODUÇÃO
```

### 5.2 Integrações Externas

#### Padrão de Integração Agnóstico

**Categorias de Integrações** (configuráveis por Oráculo):

1. **PAYMENT_PROCESSOR** (processamento de pagamentos)
   - Stripe, PayPal, Adyen, etc

2. **EXTERNAL_APIS** (APIs públicas/privadas)
   - APIs governamentais (validação de documentos)
   - APIs de terceiros (consulta de dados)

3. **CRM_SYSTEMS** (sistemas de CRM)
   - Salesforce, HubSpot, RD Station, etc

4. **ERP_SYSTEMS** (sistemas de ERP)
   - SAP, Oracle ERP, Microsoft Dynamics, etc

5. **MESSAGING** (mensageria)
   - SendGrid, Twilio, etc

6. **ANALYTICS** (análise de dados)
   - Google Analytics, Mixpanel, Segment, etc

#### Serviços de Terceiros

**Padrão de Integração**:

```typescript
// integrations/base_integration.ts
interface Integration {
  name: string;
  category: string;
  config: IntegrationConfig;

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;

  // Operations
  execute(operation: string, params: any): Promise<any>;
}

class GenericAPIIntegration implements Integration {
  name = "Generic API Integration";
  category = "EXTERNAL_APIS";

  async connect(): Promise<void> {
    // Setup HTTP client, auth, etc.
  }

  async execute(operation: string, params: any): Promise<any> {
    switch (operation) {
      case "fetch_data":
        return this.fetchData(params);
      case "submit_data":
        return this.submitData(params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async fetchData(params: any): Promise<any> {
    // Retry logic com exponential backoff
    const result = await retry(
      () => this.httpClient.get(params.endpoint, { params: params.query }),
      { retries: 3, backoff: "exponential" }
    );

    return result.data;
  }
}
```

**Circuit Breaker Pattern**:

```typescript
// circuit_breaker.ts
class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minute
  private lastFailureTime: number | null = null;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }
}
```

#### Protocolos

**1. REST APIs** (maioria das integrações)
- HTTP/HTTPS
- JSON payloads
- OAuth2/API Key authentication

**2. gRPC** (serviços internos)
- Protocol Buffers
- Bidirectional streaming
- mTLS

**3. WebSockets** (real-time)
- Persistent connections
- Bi-directional messaging
- Interaction Broker → Frontends

**4. Message Queues** (assíncrono)
- Apache Pulsar
- At-least-once delivery
- Schema validation

---

## 6. DECISÕES ARQUITETURAIS (ADRs)

### ADR-001: Metadata-Driven Architecture sobre Code-First

**Contexto**:
Precisávamos decidir se o sistema seria code-first (lógica hardcoded) ou metadata-driven (lógica definida em metadados).

**Decisão**:
Adotar **Metadata-Driven Architecture** com `object_definitions` como fonte da verdade.

**Alternativas Consideradas**:
1. **Code-First** (ActiveRecord, Entity Framework)
   - ❌ Requer deploy para mudanças
   - ❌ Não permite multi-domain
   - ❌ Lógica de negócio diluída em código

2. **Low-Code Platforms** (OutSystems, Mendix)
   - ❌ Vendor lock-in
   - ❌ Limitações de customização
   - ❌ Custo proibitivo

3. **Metadata-Driven** (escolhida)
   - ✅ Mudanças sem deploy
   - ✅ Multi-domain nativo
   - ✅ Geração automática de UI
   - ✅ Rastreabilidade completa

**Consequências**:
- ✅ **Positivas**:
  - Evolução contínua sem breaking changes
  - Dynamic UI gerada automaticamente
  - Validação de negócio interpretada em runtime
  - Multi-tenancy simplificado

- ⚠️ **Negativas**:
  - Curva de aprendizado inicial alta
  - Debugging mais complexo (metadados vs código)
  - Performance overhead (parsing JSON em runtime)

**Status**: Aceita

---

### ADR-002: Apache Pulsar sobre RabbitMQ/Kafka para Message Broker

**Contexto**:
Precisávamos de um message broker para comunicação assíncrona entre agentes e frontends.

**Decisão**:
Adotar **Apache Pulsar v3.4.0** como message broker principal.

**Alternativas Consideradas**:

| Critério | Apache Pulsar | RabbitMQ | Kafka |
|----------|---------------|----------|-------|
| Multi-Tenancy Nativo | ✅ Namespaces | ❌ Manual | ❌ Manual |
| Geo-Replication | ✅ Built-in | ❌ Plugins | ⚠️ Mirror Maker |
| Schema Registry | ✅ Nativo (Avro/JSON/Protobuf) | ❌ Não | ⚠️ Confluent |
| Throughput | ✅ Milhões msg/s | ⚠️ Centenas k/s | ✅ Milhões msg/s |
| At-Least-Once | ✅ | ✅ | ✅ |
| Complexidade Operacional | ⚠️ Média | ✅ Baixa | ⚠️ Alta |

**Consequências**:
- ✅ **Positivas**:
  - Multi-tenancy essencial para SuperCore (namespace por Oracle)
  - Schema Registry valida mensagens automaticamente
  - Geo-replication para disaster recovery
  - Throughput suficiente para escala (milhões de mensagens/dia)

- ⚠️ **Negativas**:
  - Complexidade operacional média (BookKeeper + Broker)
  - Requer expertise específica da equipe
  - Latência ~5-10ms (vs ~1-2ms RabbitMQ)

**Status**: Aceita

---

### ADR-003: PostgreSQL + NebulaGraph Híbrido sobre MongoDB

**Contexto**:
Precisávamos decidir o banco de dados principal para armazenamento de instances e relacionamentos.

**Decisão**:
Adotar arquitetura **híbrida PostgreSQL 15 + NebulaGraph 3.8**.

**Alternativas Consideradas**:
1. **MongoDB** (NoSQL document store)
   - ❌ Relacionamentos complexos difíceis
   - ❌ Transactions multi-document limitadas
   - ❌ Schema validation fraca

2. **Neo4j** (Graph database puro)
   - ❌ Estrutura rígida (apenas grafo)
   - ❌ Multi-tenancy complexo
   - ❌ Custo elevado (licença enterprise)

3. **PostgreSQL + pgvector** (SQL + embeddings)
   - ⚠️ Relacionamentos graph requerem JOINs complexos
   - ✅ ACID transactions
   - ✅ Multi-tenancy via RLS

4. **PostgreSQL + NebulaGraph** (híbrido - escolhida)
   - ✅ Best of both worlds
   - ✅ PostgreSQL para structured data + ACID
   - ✅ NebulaGraph para relacionamentos complexos
   - ✅ pgvector para embeddings (RAG)

**Consequências**:
- ✅ **Positivas**:
  - ACID transactions no PostgreSQL
  - Graph queries complexas no NebulaGraph
  - Agentic RAG Trimodal (SQL + Graph + Vector) com CrewAI + Temporal
  - Multi-tenancy robusto (RLS no PostgreSQL)

- ⚠️ **Negativas**:
  - Sincronização PostgreSQL ↔ NebulaGraph requerida
  - Complexidade operacional (2 bancos)
  - Eventual consistency entre bancos

**Status**: Aceita

---

### ADR-004: CrewAI + LangGraph sobre LangChain Agents

**Contexto**:
Precisávamos escolher framework para orquestração de agentes autônomos.

**Decisão**:
Adotar **CrewAI** como framework principal, com **LangGraph** para state management e **LangFlow** para workflows visuais.

**Alternativas Consideradas**:
1. **LangChain Agents**
   - ❌ Menos estruturado para multi-agent
   - ❌ Falta de role/responsibilities abstractions

2. **AutoGen (Microsoft)**
   - ⚠️ Foco em code generation
   - ⚠️ Menos maduro

3. **CrewAI** (escolhida)
   - ✅ Role-based agents
   - ✅ Task dependencies
   - ✅ Human-in-the-loop
   - ✅ Collaboration patterns

4. **LangGraph** (complementar)
   - ✅ State machines complexos
   - ✅ Cyclical workflows
   - ✅ Checkpointing

5. **LangFlow** (visual)
   - ✅ Workflows visuais
   - ✅ Drag-and-drop
   - ✅ Execução automática

**Consequências**:
- ✅ **Positivas**:
  - Abstrações claras (Role, Responsibilities, Tools)
  - Collaboration patterns prontos
  - Human-in-the-loop nativo
  - LangGraph para casos complexos
  - LangFlow para visualização

- ⚠️ **Negativas**:
  - CrewAI relativamente novo (2023)
  - Documentação limitada
  - Lock-in parcial (mas open-source)

**Status**: Aceita

---

### ADR-005: Next.js 14 App Router sobre Pages Router

**Contexto**:
Escolha entre Next.js App Router (nova arquitetura) vs Pages Router (legado).

**Decisão**:
Adotar **Next.js 14 App Router** com React Server Components.

**Alternativas Consideradas**:
1. **Next.js Pages Router**
   - ❌ Arquitetura legada
   - ❌ Sem React Server Components
   - ⚠️ Client-side rendering predominante

2. **Remix**
   - ⚠️ Menos maduro
   - ⚠️ Ecossistema menor

3. **Next.js 14 App Router** (escolhida)
   - ✅ React Server Components (performance)
   - ✅ Streaming SSR
   - ✅ Parallel Routes
   - ✅ Intercepting Routes

**Consequências**:
- ✅ **Positivas**:
  - Performance superior (RSC)
  - SEO melhorado
  - Developer experience moderna
  - Future-proof

- ⚠️ **Negativas**:
  - Curva de aprendizado (mental model diferente)
  - Alguns packages incompatíveis com RSC
  - Documentação em evolução

**Status**: Aceita

---

### ADR-006: Go para Backend Core sobre Node.js/Python

**Contexto**:
Linguagem para serviços core de backend (Instance Manager, Object Manager, etc).

**Decisão**:
Adotar **Go 1.21** para serviços core, **Python 3.11** para serviços AI, **TypeScript** para MCP Server.

**Alternativas Consideradas**:
1. **Node.js/TypeScript** (full-stack TS)
   - ❌ Performance inferior
   - ❌ Concurrency model complexo (event loop)

2. **Python** (único stack)
   - ❌ Performance crítica em alta carga
   - ❌ GIL limita concurrency

3. **Rust**
   - ⚠️ Curva de aprendizado muito alta
   - ⚠️ Ecossistema menor
   - ⚠️ Desenvolvimento mais lento

4. **Go** (escolhida para core)
   - ✅ Performance excelente
   - ✅ Concurrency nativa (goroutines)
   - ✅ Ecosistema maduro
   - ✅ Deploy simples (single binary)

**Consequências**:
- ✅ **Positivas**:
  - Performance 10-50x vs Node.js/Python
  - Concurrency simplificada
  - Low memory footprint
  - Deployment trivial

- ⚠️ **Negativas**:
  - Multi-linguagem (Go + Python + TypeScript)
  - Ecossistema AI menor em Go (daí Python para AI services)

**Status**: Aceita

---

### ADR-007: Multi-Tenancy via oracle_id Foreign Key

**Contexto**:
Como implementar isolamento entre diferentes Oracles (tenants) no SuperCore.

**Decisão**:
Adotar **oracle_id como foreign key obrigatória** em todas as tabelas + Row-Level Security (RLS) no PostgreSQL.

**Alternativas Consideradas**:
1. **Schema Separation** (um schema PostgreSQL por tenant)
   - ❌ Escalabilidade limitada (centenas de tenants)
   - ❌ Migrations complexas
   - ❌ Backup/restore difícil

2. **Database Separation** (um database por tenant)
   - ❌ Overhead operacional gigantesco
   - ❌ Custo proibitivo

3. **oracle_id Foreign Key + RLS** (escolhida)
   - ✅ Single database
   - ✅ RLS garante isolamento
   - ✅ Escalabilidade ilimitada
   - ✅ Migrations simples

**Consequências**:
- ✅ **Positivas**:
  - Isolamento garantido via RLS
  - Índices otimizados por oracle_id
  - Compliance com regulações do setor
  - Backup/restore simplificado

- ⚠️ **Negativas**:
  - oracle_id obrigatório em TODAS as queries
  - Risco de data leak se RLS mal configurado
  - Performance overhead (filtro adicional)

**Status**: Aceita

---

### ADR-008: Geração 100% Automática por IA sobre Criação Manual - NOVA

**Contexto**:
v1 requeria criação manual de object_definitions, limitando drasticamente a velocidade de geração de soluções.

**Decisão**:
Adotar **Geração 100% Automática por IA** para objetos, agentes, workflows, UI e middlewares.

**Alternativas Consideradas**:
1. **Criação Manual via API/UI** (v1)
   - ❌ Lento (dias para criar uma solução)
   - ❌ Propenso a erros
   - ❌ Requer desenvolvedores

2. **Templates + Customização Manual**
   - ❌ Ainda requer trabalho manual
   - ❌ Templates ficam desatualizados
   - ❌ Não escala

3. **Geração 100% Automática por IA** (escolhida)
   - ✅ Velocidade exponencial (horas vs dias)
   - ✅ Zero código manual
   - ✅ Compliance garantido (IA consulta Oráculo)
   - ✅ Production-grade desde o início

**Consequências**:
- ✅ **Positivas**:
  - Time-to-market reduzido 10-100x
  - Democratização (Product Managers geram soluções sem código)
  - Compliance automático
  - Evolução contínua (Oráculo evolui → soluções evoluem)

- ⚠️ **Negativas**:
  - Dependência de LLMs (Claude, vLLM)
  - Custo de inferência LLM
  - Necessidade de revisão humana (Fase 4)

**Status**: Aceita - Requisito CRÍTICO para v2.0

---

### ADR-009: Super Portal de Backoffice sobre CLI/API - NOVA

**Contexto**:
v1 não tinha interface de gerenciamento, exigindo uso de CLI ou API diretamente.

**Decisão**:
Adicionar **Super Portal de Backoffice** como camada superior da arquitetura.

**Alternativas Consideradas**:
1. **CLI + API** (v1)
   - ❌ UX terrível para não-desenvolvedores
   - ❌ Curva de aprendizado alta
   - ❌ Sem visualização

2. **Admin Dashboard Simples**
   - ⚠️ Funcionalidades limitadas
   - ⚠️ Não integra com AI Context Generator

3. **Super Portal Completo** (escolhida)
   - ✅ UX moderna (Next.js 14 + shadcn/ui)
   - ✅ Integração completa com AI Context Generator
   - ✅ Gestão de Oráculos, Objetos, Agentes, Workflows
   - ✅ Dashboard de estatísticas
   - ✅ Controle de "Play"

**Consequências**:
- ✅ **Positivas**:
  - Democratização total (Product Managers usam sem código)
  - UX superior
  - Visualização completa (graphs, dashboards)
  - Controle granular de permissões (RBAC)

- ⚠️ **Negativas**:
  - Overhead de desenvolvimento (mais componentes)
  - Necessidade de autenticação/autorização robusta

**Status**: Aceita - Requisito CRÍTICO para v2.0

---

### ADR-010: Oráculos como Grafo Interconectado via MCP - NOVA

**Contexto**:
v1 concebia Oráculos como entidades isoladas que só se integravam com sistemas externos (BACEN, Serasa, etc.). v2.0 reconhece que Oráculos podem e devem conectar-se entre si para compor soluções complexas.

**Decisão**:
Adotar **arquitetura de Grafo de Oráculos** onde:
1. Oráculos são **nós** (tipados como `frontend` ou `backend`)
2. Conexões MCP são **arestas** direcionadas
3. Cada Oráculo Backend expõe MCP Server automaticamente
4. Oráculos Frontend recebem BFF auto-gerado que agrega backends via MCP

**Problema Que Resolve**:
- **Reutilização**: Mesmo Oráculo KYC serve Banking, CRM, Healthcare
- **Composição**: Soluções complexas emergem da composição de building blocks
- **Escalabilidade**: Cada Oráculo escala independentemente
- **Evolução**: Mudar Oráculo KYC não quebra dependentes (interface MCP estável)

**Alternativas Consideradas**:

1. **Monolito por Domínio**
   - ❌ Zero reutilização (KYC implementado 3x)
   - ❌ Escalabilidade limitada
   - ❌ Mudança em KYC requer redeploy de Banking, CRM, Healthcare

2. **Microservices com APIs REST Custom**
   - ⚠️ Cada integração exige código manual
   - ⚠️ Sem padrão (cada backend usa formato diferente)
   - ⚠️ Breaking changes quebram múltiplos consumidores

3. **Grafo de Oráculos via MCP** (escolhida)
   - ✅ Interface universal (MCP)
   - ✅ Auto-geração de tools a partir de `object_definitions`
   - ✅ BFF auto-gerado para frontends
   - ✅ Resiliência nativa (circuit breaker, retry, timeout)
   - ✅ Observabilidade (distributed tracing OpenTelemetry)
   - ✅ Autenticação configurável (API key, OAuth2, mTLS)

**Arquitetura do Grafo**:

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperCore Platform                        │
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ Portal Banking  │         │ Portal CRM      │            │
│  │ (Frontend)      │         │ (Frontend)      │            │
│  │                 │         │                 │            │
│  │ + BFF auto      │         │ + BFF auto      │            │
│  │ + IAM objects   │         │ + IAM objects   │            │
│  │ + Menu objects  │         │ + Menu objects  │            │
│  │ + Layout objs   │         │ + Layout objs   │            │
│  └────────┬────────┘         └────────┬────────┘            │
│           │ MCP Client               │ MCP Client           │
│           ▼                           ▼                      │
│  ┌──────────────────────────────────────────────┐           │
│  │         MCP Routing Layer (Gateway)          │           │
│  │   (Health checks, Auth, Rate limiting)       │           │
│  └──────────────────────────────────────────────┘           │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ CoreBanking API │         │ KYC Service     │            │
│  │ (Backend)       │◄────────┤ (Backend)       │            │
│  │                 │ MCP     │                 │            │
│  │ + MCP Server    │         │ + MCP Server    │            │
│  │ + Tools auto    │         │ + Tools auto    │            │
│  │ + Agents        │         │ + Agents        │            │
│  │ + Workflows     │         │ + Workflows     │            │
│  └────────┬────────┘         └────────┬────────┘            │
│           │ MCP                        │ MCP                 │
│           ▼                            ▼                     │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ Compliance Eng. │         │ Serasa API      │            │
│  │ (Backend)       │         │ (Backend Ext.)  │            │
│  └─────────────────┘         └─────────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Conectividade**:

```json
{
  "oracle_id": "portal-banking",
  "type": "frontend",
  "connected_oracles": [
    {
      "oracle_id": "corebanking-api",
      "mcp_endpoint": "http://corebanking-api.supercore.svc.cluster.local:4000/mcp",
      "auth": {"type": "api_key", "key_vault_ref": "vault://keys/corebanking"},
      "tools_used": ["create_conta", "get_saldo", "process_transacao"],
      "health_status": "healthy",
      "circuit_breaker": {
        "failure_threshold": 5,
        "timeout_seconds": 30,
        "half_open_after_seconds": 60
      }
    },
    {
      "oracle_id": "kyc-service",
      "mcp_endpoint": "http://kyc-service.supercore.svc.cluster.local:4001/mcp",
      "auth": {"type": "oauth2", "client_id": "portal-banking"},
      "tools_used": ["verify_cpf", "check_sanctions", "score_risk"],
      "health_status": "healthy"
    }
  ]
}
```

**Auto-geração de MCP Tools**:

Para cada `object_definition` em Oráculo Backend:
```python
# Exemplo: object_definition "Conta" no CoreBanking API
object_def = {
    "type_name": "Conta",
    "fields": [
        {"name": "titular_cpf", "type": "string", "required": true},
        {"name": "tipo_conta", "type": "string", "enum": ["CORRENTE", "POUPANCA"]},
        {"name": "saldo", "type": "number"}
    ]
}

# SuperCore auto-gera MCP tools:
mcp_tools = [
    {
        "name": "create_conta",
        "description": "Cria nova conta bancária",
        "inputSchema": object_def.to_json_schema()
    },
    {
        "name": "update_conta",
        "description": "Atualiza conta existente",
        "inputSchema": {
            "conta_id": "string",
            **object_def.to_json_schema()
        }
    },
    {
        "name": "get_conta",
        "description": "Busca conta por ID",
        "inputSchema": {"conta_id": "string"}
    },
    {
        "name": "list_conta",
        "description": "Lista contas com filtros",
        "inputSchema": {
            "filters": "object",
            "pagination": {"page": "number", "limit": "number"}
        }
    },
    {
        "name": "delete_conta",
        "description": "Deleta conta",
        "inputSchema": {"conta_id": "string"}
    }
]
```

**BFF Auto-gerado para Frontend**:

```typescript
// auto-generated BFF for portal-banking
import { MCPClient } from '@supercore/mcp-client'
import { CircuitBreaker } from '@supercore/resilience'

export class PortalBankingBFF {
  private coreBanking: MCPClient
  private kyc: MCPClient
  private compliance: MCPClient

  private coreBankingBreaker: CircuitBreaker

  constructor(config: BFFConfig) {
    // Initialize MCP clients from connected_oracles config
    this.coreBanking = new MCPClient(config.coreBanking.endpoint, config.coreBanking.auth)
    this.kyc = new MCPClient(config.kyc.endpoint, config.kyc.auth)

    // Initialize circuit breakers
    this.coreBankingBreaker = new CircuitBreaker({
      failureThreshold: 5,
      timeout: 30000,
      halfOpenAfter: 60000
    })
  }

  async createAccountWithKYC(data: CreateAccountRequest): Promise<Account> {
    // Step 1: Verify CPF via KYC Service
    const kycResult = await this.kyc.callTool('verify_cpf', {
      cpf: data.titular_cpf
    })

    if (!kycResult.approved) {
      throw new KYCVerificationError('CPF verification failed', kycResult.reason)
    }

    // Step 2: Check sanctions list
    const sanctionsCheck = await this.kyc.callTool('check_sanctions', {
      cpf: data.titular_cpf
    })

    if (sanctionsCheck.blocked) {
      throw new ComplianceError('Customer in sanctions list')
    }

    // Step 3: Create account in CoreBanking (with circuit breaker)
    const account = await this.coreBankingBreaker.execute(async () => {
      return await this.coreBanking.callTool('create_conta', {
        titular_cpf: data.titular_cpf,
        tipo_conta: data.tipo_conta,
        saldo_inicial: data.saldo_inicial || 0
      })
    })

    return account
  }

  async getAccountBalance(contaId: string): Promise<number> {
    // Cached call with 30s TTL
    return await this.cache.getOrFetch(
      `balance:${contaId}`,
      async () => {
        const conta = await this.coreBanking.callTool('get_conta', {conta_id: contaId})
        return conta.saldo
      },
      {ttl: 30}
    )
  }
}
```

**Visualização do Grafo no Portal**:

```typescript
// React Flow component for Oracle Graph visualization
import ReactFlow from 'reactflow'

const OracleGraphView = ({ oraclesGraph }) => {
  const nodes = oraclesGraph.nodes.map(oracle => ({
    id: oracle.oracle_id,
    type: oracle.type === 'frontend' ? 'frontendNode' : 'backendNode',
    data: {
      label: oracle.name,
      status: oracle.health_status,
      toolsCount: oracle.exposed_tools?.length || 0
    },
    position: oracle.position
  }))

  const edges = oraclesGraph.edges.map(conn => ({
    id: `${conn.from}-${conn.to}`,
    source: conn.from,
    target: conn.to,
    label: `${conn.tools_count} tools`,
    animated: conn.health_status !== 'healthy',
    style: {
      stroke: conn.health_status === 'healthy' ? 'green' : 'red'
    }
  }))

  return <ReactFlow nodes={nodes} edges={edges} />
}
```

**Resiliência**:

1. **Circuit Breaker**:
   - Após 5 falhas consecutivas → abre circuito (fail fast)
   - Após 60s → tenta half-open (1 request de teste)
   - Se sucesso → fecha circuito (volta ao normal)

2. **Retry com Exponential Backoff**:
   - Retry 1: espera 100ms
   - Retry 2: espera 200ms
   - Retry 3: espera 400ms
   - Max retries: 3

3. **Timeout**:
   - Default: 30s por chamada MCP
   - Configurável por Oráculo

4. **Health Checks**:
   - Propagação: se KYC unhealthy → Portal Banking exibe warning
   - Graceful degradation: se KYC down → permite criar conta sem KYC (com flag `kyc_pending`)

**Observabilidade**:

```typescript
// OpenTelemetry distributed tracing
import { trace, context } from '@opentelemetry/api'

const tracer = trace.getTracer('supercore-bff')

async createAccountWithKYC(data) {
  const span = tracer.startSpan('bff.createAccountWithKYC')

  try {
    // Propagate trace context to downstream MCP calls
    const kycSpan = tracer.startSpan('mcp.kyc.verify_cpf', { parent: span })
    const kycResult = await this.kyc.callTool('verify_cpf', {...}, {
      traceparent: kycSpan.spanContext()
    })
    kycSpan.end()

    const bankingSpan = tracer.startSpan('mcp.corebanking.create_conta', { parent: span })
    const account = await this.coreBanking.callTool('create_conta', {...}, {
      traceparent: bankingSpan.spanContext()
    })
    bankingSpan.end()

    span.setStatus({ code: SpanStatusCode.OK })
    return account
  } catch (error) {
    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw error
  } finally {
    span.end()
  }
}
```

**Consequências**:

✅ **Positivas**:
- **Reutilização máxima**: KYC Service usado por Banking, CRM, Healthcare, etc.
- **Composição sem código**: Conectar Oráculos = arrastar e soltar no Portal
- **Escalabilidade independente**: Cada Oráculo escala conforme demanda
- **Evolução isolada**: Mudar CoreBanking API não quebra dependentes (interface MCP)
- **Multi-tenancy nativo**: Mesmo backend serve múltiplos frontends (tenants diferentes)
- **Testabilidade**: Cada Oráculo testável isoladamente
- **Observabilidade**: Distributed tracing mostra latência end-to-end

⚠️ **Negativas**:
- **Latência aumentada**: Cada hop MCP adiciona ~10-20ms
- **Complexidade de debug**: Falhas podem vir de qualquer nó do grafo
- **Gestão de dependências**: Need dependency graph management (evitar ciclos)
- **Versionamento**: Breaking changes em MCP tools exigem coordenação

**Mitigação de Negativas**:
- Latência: Cache agressivo no BFF (30s TTL)
- Debug: OpenTelemetry + logs agregados (ELK/Loki)
- Dependências: Validação de ciclos no Portal + visualização do grafo
- Versionamento: Semantic versioning de MCP tools + deprecation warnings

**Status**: Aceita - Requisito CRÍTICO para v2.0

**Impacto em Outros ADRs**:
- **ADR-004 (PostgreSQL)**: Adicionar tabela `oracle_connections` para persistir grafo
- **ADR-006 (API Layer)**: BFF auto-gerado usa FastAPI/Gin
- **ADR-009 (Super Portal)**: Portal visualiza e gerencia grafo de Oráculos

**Implementação**:
- **Fase 2**: MCP Server auto-gerado para Oráculos Backend
- **Fase 3**: BFF auto-gerado para Oráculos Frontend
- **Fase 3**: Visualização de grafo no Portal (React Flow)
- **Fase 4**: Resiliência completa (circuit breaker, retry, distributed tracing)

---

### ADR-011: Frontend-Backend Communication Pattern (Next.js 14)

**Contexto**:
O Portal de BackOffice do SuperCore, construído com Next.js 14 App Router, precisa comunicar-se com as APIs backend (FastAPI, Gin) de forma eficiente, mantendo boa performance, developer experience e integração com autenticação Keycloak.

**Decisão**:
**PENDENTE** - Aguardando análise de especialista frontend para decisão final entre Server Actions, API Routes ou arquitetura híbrida.

**Opções Avaliadas**:

**Opção A - Server Actions (Next.js 14 App Router nativo)**:
```typescript
// app/actions/oracles.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function createOracle(formData: FormData) {
  const session = await getServerSession()

  if (!session?.accessToken) {
    throw new Error('Não autenticado')
  }

  const response = await fetch('http://backend-api/oracles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`
    },
    body: JSON.stringify({
      name: formData.get('name'),
      domain: formData.get('domain')
    })
  })

  if (!response.ok) {
    throw new Error('Falha ao criar Oráculo')
  }

  // Revalidate cache
  revalidatePath('/oracles')

  return response.json()
}

// app/oracles/new/page.tsx
import { createOracle } from '@/actions/oracles'

export default function NewOraclePage() {
  return (
    <form action={createOracle}>
      <input name="name" required />
      <input name="domain" required />
      <button type="submit">Criar Oráculo</button>
    </form>
  )
}
```

**Prós**:
- ✅ Performance superior (sem roundtrip cliente → servidor → backend)
- ✅ Progressive Enhancement (funciona sem JavaScript)
- ✅ Caching nativo do Next.js (revalidatePath, revalidateTag)
- ✅ TypeScript end-to-end
- ✅ Integração direta com Keycloak (token no servidor)

**Contras**:
- ⚠️ Relativamente novo (maior risco de bugs)
- ⚠️ Debugging mais complexo (server-side execution)
- ⚠️ Não expõe endpoint público (apenas via formulários)

---

**Opção B - API Routes (Next.js tradicional)**:
```typescript
// app/api/oracles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token?.accessToken) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const data = await request.json()

  const response = await fetch('http://backend-api/oracles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.accessToken}`
    },
    body: JSON.stringify(data)
  })

  return NextResponse.json(await response.json())
}

// app/oracles/new/page.tsx (client component)
'use client'

export default function NewOraclePage() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/oracles', {
      method: 'POST',
      body: JSON.stringify({ name, domain })
    })
    const data = await response.json()
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Prós**:
- ✅ Padrão maduro e estável
- ✅ Debugging tradicional (HTTP requests)
- ✅ Expõe endpoints públicos (pode ser usado por mobile/CLI)
- ✅ Controle fino sobre response headers e cache

**Contras**:
- ❌ Mais boilerplate (duplo fetch: cliente → API Route → backend)
- ❌ Performance inferior (latência adicional)
- ❌ Requer JavaScript no cliente
- ❌ Caching manual (sem revalidatePath)

---

**Opção C - Híbrido (Server Actions + API Routes)**:
```typescript
// Server Actions para mutations (create, update, delete)
// app/actions/oracles.ts
'use server'
export async function createOracle(data) { /* ... */ }
export async function updateOracle(id, data) { /* ... */ }
export async function deleteOracle(id) { /* ... */ }

// API Routes para queries (list, get) e integrações externas
// app/api/oracles/route.ts
export async function GET(request) { /* ... */ }

// app/api/webhooks/[oracle]/route.ts (para receber eventos externos)
export async function POST(request) { /* ... */ }
```

**Prós**:
- ✅ Best of both worlds
- ✅ Mutations otimizadas (Server Actions)
- ✅ Queries expostas via API Routes (para mobile/CLI)
- ✅ Webhooks e integrações via API Routes

**Contras**:
- ⚠️ Complexidade aumentada (dois padrões diferentes)
- ⚠️ Necessidade de documentar quando usar cada um

---

**Critérios de Decisão**:

| Critério | Server Actions | API Routes | Híbrido |
|----------|----------------|------------|---------|
| **Performance** | ✅ Excelente | ⚠️ Média | ✅ Excelente |
| **Developer Experience** | ✅ Simples | ⚠️ Boilerplate | ⚠️ Complexo |
| **Keycloak Auth** | ✅ Nativo | ✅ Manual | ✅ Nativo |
| **Caching** | ✅ Nativo | ❌ Manual | ✅ Nativo |
| **Debugging** | ⚠️ Complexo | ✅ Simples | ⚠️ Complexo |
| **Estabilidade** | ⚠️ Novo | ✅ Maduro | ⚠️ Misto |
| **Exposição externa** | ❌ Não | ✅ Sim | ✅ Sim |
| **Mobile/CLI support** | ❌ Não | ✅ Sim | ✅ Sim |

**Recomendação Preliminar**:
- **Opção C (Híbrido)** parece ser a melhor escolha:
  - Mutations via Server Actions (performance + DX)
  - Queries públicas via API Routes (mobile, CLI, webhooks)
  - Integração Keycloak em ambos os lados

**Consequências**:

✅ **Positivas** (se escolher Híbrido):
- Performance otimizada para mutations críticas
- Flexibilidade para integrações externas
- DX moderna com Server Actions
- Suporte a múltiplos clientes (web, mobile, CLI)

⚠️ **Negativas**:
- Curva de aprendizado (team precisa entender ambos os padrões)
- Documentação clara necessária sobre quando usar cada padrão
- Estrutura de pastas mais complexa

**Ações Necessárias**:
1. Consultar especialista frontend Next.js/React
2. Validar integração Keycloak com Server Actions
3. Testar performance de ambas as abordagens
4. Documentar guidelines de quando usar cada padrão
5. Atualizar stack_supercore_v2.0.md com decisão final

**Status**: PENDENTE - Aguardando análise de especialista frontend

**Impacto em Outros ADRs**:
- **ADR-005 (Next.js 14)**: Define padrões de comunicação para App Router
- **ADR-009 (Super Portal)**: Afeta estrutura de código do Portal

---

### ADR-012: Multi-Tenancy Strategy

**Contexto**:
O SuperCore precisa suportar diferentes modelos de isolamento de dados entre clientes (tenants). Alguns Oráculos requerem isolamento total (single-tenant) por questões de compliance (PCI-DSS, HIPAA), enquanto outros podem compartilhar recursos para reduzir custos (multi-tenant).

**Decisão**:
Adotar **estratégia configurável de multi-tenancy** onde cada Oráculo pode escolher entre single-tenant ou multi-tenant via campo `tenancy_mode` em `oracle_config`.

**Isolamento por Camada**:

| Camada | Single-Tenant | Multi-Tenant |
|--------|---------------|--------------|
| **PostgreSQL** | Schema dedicado (`oracle_{id}`) | Shared schema + RLS (Row Level Security) |
| **Apache Pulsar** | Namespace dedicado (`oracle-{id}`) | Shared namespace + Topic prefixing |
| **MinIO** | Bucket dedicado (`oracle-{id}`) | Shared bucket + Path prefixing (`/{oracle_id}/...`) |
| **NebulaGraph** | Space dedicado (`oracle_{id}`) | Shared space + Tag filtering (`oracle_id`) |
| **Redis** | Database index dedicado (0-15) | Shared DB + Key prefixing (`oracle:{id}:...`) |

**Configuração**:

```json
{
  "oracle_id": "banking-acme",
  "oracle_name": "CoreBanking ACME",
  "tenancy_mode": "single-tenant",
  "isolation_config": {
    "postgres": {
      "strategy": "dedicated_schema",
      "schema_name": "oracle_banking_acme",
      "rls_enabled": false
    },
    "pulsar": {
      "strategy": "dedicated_namespace",
      "tenant": "acme",
      "namespace": "banking",
      "geo_replication": ["us-east", "us-west"]
    },
    "minio": {
      "strategy": "dedicated_bucket",
      "bucket_name": "oracle-banking-acme",
      "encryption": "AES256"
    },
    "nebula": {
      "strategy": "dedicated_space",
      "space_name": "oracle_banking_acme"
    },
    "redis": {
      "strategy": "dedicated_db",
      "db_index": 2
    }
  }
}
```

**Exemplo Multi-Tenant**:

```json
{
  "oracle_id": "crm-shared",
  "oracle_name": "CRM Shared Platform",
  "tenancy_mode": "multi-tenant",
  "isolation_config": {
    "postgres": {
      "strategy": "rls",
      "schema_name": "public",
      "rls_enabled": true,
      "rls_policy": "oracle_id = current_setting('app.current_oracle_id')"
    },
    "pulsar": {
      "strategy": "topic_prefixing",
      "tenant": "shared",
      "namespace": "crm",
      "topic_prefix": "oracle-{oracle_id}"
    },
    "minio": {
      "strategy": "path_prefixing",
      "bucket_name": "oracle-shared",
      "path_prefix": "/{oracle_id}"
    },
    "nebula": {
      "strategy": "tag_filtering",
      "space_name": "oracle_shared",
      "filter_tag": "oracle_id"
    },
    "redis": {
      "strategy": "key_prefixing",
      "db_index": 0,
      "key_prefix": "oracle:{oracle_id}"
    }
  }
}
```

**Implementação PostgreSQL RLS**:

```sql
-- Enable RLS on all tables
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;

-- Create policy for multi-tenant isolation
CREATE POLICY oracle_isolation ON instances
  USING (oracle_id = current_setting('app.current_oracle_id')::uuid);

-- Set oracle_id at connection level
SET app.current_oracle_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- All queries automatically filtered by RLS
SELECT * FROM instances; -- Only returns instances for current oracle
```

**Trade-offs**:

**Single-Tenant**:
- ✅ **Prós**:
  - Isolamento total (zero risco de data leak)
  - Performance previsível (recursos dedicados)
  - Compliance facilitado (PCI-DSS, HIPAA, SOC2)
  - Backup/restore independente
  - Migração simplificada (tenant pode virar instância dedicada)

- ❌ **Contras**:
  - Custo maior (recursos dedicados por tenant)
  - Overhead operacional (múltiplos schemas/buckets/spaces)
  - Escalabilidade limitada (PostgreSQL limita ~10K schemas)

**Multi-Tenant**:
- ✅ **Prós**:
  - Custo reduzido (compartilhamento de recursos)
  - Escalabilidade ilimitada (adicionar tenant é trivial)
  - Gestão simplificada (single schema/bucket/space)
  - Economia de escala (cache compartilhado, connection pooling)

- ❌ **Contras**:
  - Risco de data leak (se RLS mal configurado)
  - Performance variável (noisy neighbor problem)
  - Compliance complexo (segregação lógica vs física)
  - Backup/restore complexo (restore parcial difícil)

**Quando Usar Cada Estratégia**:

**Single-Tenant**:
- Banking (PCI-DSS compliance)
- Healthcare (HIPAA compliance)
- Governo (LGPD Setor Público)
- Grandes clientes enterprise (SLA customizado)

**Multi-Tenant**:
- CRM genérico (SMB)
- Ferramentas internas
- Ambientes de desenvolvimento/staging
- Proof of Concept (PoC)

**Consequências**:

✅ **Positivas**:
- Flexibilidade total (Oráculo escolhe sua estratégia)
- Compliance garantido (single-tenant para regulados)
- Custo otimizado (multi-tenant para casos simples)
- Escalabilidade adaptativa (mix de estratégias)

⚠️ **Negativas**:
- Complexidade de implementação (suportar ambos os modos)
- Risco de má configuração (escolher multi-tenant onde deveria ser single)
- Testing complexo (validar RLS policies)
- Migração single ↔ multi não trivial

**Mitigação de Riscos**:
1. **RLS Testing**: Suite automática de testes para validar isolamento
2. **Auditoria**: Log de todas as queries com `oracle_id` utilizado
3. **Wizard de Configuração**: Portal recomenda estratégia baseada em domínio
4. **Validação**: Checklist de compliance antes de escolher multi-tenant

**Status**: Aceita

**Impacto em Outros ADRs**:
- **ADR-003 (PostgreSQL + NebulaGraph)**: RLS policies e schema isolation
- **ADR-002 (Apache Pulsar)**: Namespace/topic isolation strategies
- **ADR-007 (Multi-Tenancy via oracle_id)**: Estende para estratégias configuráveis

---

### ADR-013: Code Generation Strategy (Templates vs AST vs LLM)

**Contexto**:
O SuperCore é uma meta-plataforma onde **agentes criam agentes**. O sistema precisa gerar código de alta qualidade (CrewAI, LangGraph, LangChain, LangFlow JSON) para os Oráculos, com garantias de correção, type-safety e manutenibilidade.

**Decisão**:
Adotar **estratégia híbrida de Code Generation** combinando:
1. **Templates (Jinja2)**: Para boilerplate e código estrutural
2. **AST Manipulation (Python ast module)**: Para transformações type-safe
3. **LLM (Claude Opus 4.5)**: Para geração de lógica de negócio customizada

**Pipeline de Geração**:

```
┌─────────────────────────────────────────────────────────────┐
│                  Code Generation Pipeline                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. LLM Analysis (Claude Opus 4.5)                           │
│     Input: User requirement (natural language)               │
│     Output: agent_definition (JSON)                          │
│     ↓                                                         │
│  2. Template Generation (Jinja2)                             │
│     Input: agent_definition                                  │
│     Output: Python code skeleton (CrewAI/LangGraph)          │
│     ↓                                                         │
│  3. AST Manipulation                                         │
│     Input: Python code skeleton                              │
│     Output: Enhanced code (type hints, error handling)       │
│     ↓                                                         │
│  4. Validation Pipeline                                      │
│     - Syntax check (ast.parse)                               │
│     - Type checking (mypy)                                   │
│     - Unit test generation                                   │
│     - Code review (Ruff linter)                              │
│     ↓                                                         │
│  5. Deploy to Oracle                                         │
│     - Git commit (versioning)                                │
│     - Docker build (containerization)                        │
│     - K8s deploy (orchestration)                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Exemplo de Geração**:

**1. LLM Analysis**:
```python
# User requirement
requirement = """
Crie um agente de análise de crédito que:
1. Verifica CPF no Serasa
2. Consulta histórico de transações no CoreBanking
3. Calcula score de crédito usando modelo ML
4. Retorna aprovação/rejeição com justificativa
"""

# Claude Opus 4.5 gera agent_definition
agent_definition = {
  "agent_name": "CreditAnalysisAgent",
  "role": "Analista de Crédito",
  "goal": "Avaliar risco de crédito de clientes",
  "backstory": "Especialista em análise de crédito com 15 anos de experiência",
  "tools": [
    {"name": "serasa_check_cpf", "type": "mcp_tool"},
    {"name": "corebanking_get_transactions", "type": "mcp_tool"},
    {"name": "ml_credit_score", "type": "custom_function"}
  ],
  "tasks": [
    {
      "name": "verify_cpf",
      "description": "Verificar CPF no Serasa",
      "expected_output": "Status do CPF (clean/restricted)"
    },
    {
      "name": "analyze_transactions",
      "description": "Analisar histórico de transações",
      "expected_output": "Padrão de comportamento financeiro"
    },
    {
      "name": "calculate_score",
      "description": "Calcular score de crédito",
      "expected_output": "Score numérico (0-1000)"
    },
    {
      "name": "make_decision",
      "description": "Aprovar ou rejeitar crédito",
      "expected_output": "Aprovado/Rejeitado + justificativa"
    }
  ]
}
```

**2. Template Generation (Jinja2)**:
```python
# templates/crewai_agent.py.jinja
from crewai import Agent, Task, Crew
from langchain.tools import Tool
from typing import Dict, Any

class {{ agent_name }}(Agent):
    """{{ backstory }}"""

    def __init__(self, mcp_client, ml_model):
        super().__init__(
            role="{{ role }}",
            goal="{{ goal }}",
            backstory="{{ backstory }}",
            tools=[
                {% for tool in tools %}
                Tool(
                    name="{{ tool.name }}",
                    func=self._{{ tool.name }},
                    description="{{ tool.description }}"
                ),
                {% endfor %}
            ],
            verbose=True,
            memory=True
        )
        self.mcp_client = mcp_client
        self.ml_model = ml_model

    {% for tool in tools %}
    def _{{ tool.name }}(self, **kwargs) -> Dict[str, Any]:
        """{{ tool.description }}"""
        {% if tool.type == 'mcp_tool' %}
        return self.mcp_client.call_tool("{{ tool.name }}", kwargs)
        {% elif tool.type == 'custom_function' %}
        # TODO: Implement custom logic
        pass
        {% endif %}
    {% endfor %}
```

**3. AST Manipulation**:
```python
import ast
import astunparse

# Parse template output
tree = ast.parse(template_output)

# Add type hints to methods
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        # Add return type annotation
        node.returns = ast.Name(id='Dict[str, Any]', ctx=ast.Load())

        # Add parameter type hints
        for arg in node.args.args:
            arg.annotation = ast.Name(id='Any', ctx=ast.Load())

# Add error handling
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef) and node.name.startswith('_'):
        # Wrap body in try/except
        node.body = [
            ast.Try(
                body=node.body,
                handlers=[
                    ast.ExceptHandler(
                        type=ast.Name(id='Exception', ctx=ast.Load()),
                        name='e',
                        body=[
                            ast.Raise(
                                exc=ast.Call(
                                    func=ast.Name(id='ToolExecutionError', ctx=ast.Load()),
                                    args=[ast.Name(id='e', ctx=ast.Load())],
                                    keywords=[]
                                )
                            )
                        ]
                    )
                ],
                orelse=[],
                finalbody=[]
            )
        ]

# Generate enhanced code
enhanced_code = astunparse.unparse(tree)
```

**4. LLM-Generated Business Logic**:
```python
# For custom_function tools, use Claude to generate implementation
custom_logic_prompt = f"""
Implemente a função `ml_credit_score` que:
- Recebe histórico de transações (List[Transaction])
- Usa modelo de ML para calcular score
- Retorna score (0-1000) e fatores que influenciaram

Contexto: {agent_definition}
Tipo de retorno: Dict[str, Any]
"""

ml_credit_score_impl = claude_opus.generate_code(custom_logic_prompt)

# Inject LLM-generated code into AST
# (substituir placeholder "# TODO: Implement custom logic")
```

**Validation Pipeline**:

```python
class CodeValidator:
    def validate(self, code: str) -> ValidationResult:
        # 1. Syntax check
        try:
            ast.parse(code)
        except SyntaxError as e:
            return ValidationResult(success=False, error=f"Syntax error: {e}")

        # 2. Type checking (mypy)
        mypy_result = subprocess.run(
            ['mypy', '--strict', code_file],
            capture_output=True
        )
        if mypy_result.returncode != 0:
            return ValidationResult(success=False, error=mypy_result.stderr)

        # 3. Linting (Ruff)
        ruff_result = subprocess.run(
            ['ruff', 'check', code_file],
            capture_output=True
        )
        if ruff_result.returncode != 0:
            # Auto-fix if possible
            subprocess.run(['ruff', 'check', '--fix', code_file])

        # 4. Generate unit tests
        test_code = self._generate_tests(code)

        # 5. Run tests
        pytest_result = subprocess.run(['pytest', test_file])
        if pytest_result.returncode != 0:
            return ValidationResult(success=False, error="Generated tests failed")

        return ValidationResult(success=True)

    def _generate_tests(self, code: str) -> str:
        """Use LLM to generate pytest tests"""
        prompt = f"Generate comprehensive pytest tests for:\n{code}"
        return claude_opus.generate_code(prompt)
```

**Code Generation para LangFlow JSON**:

```python
# LangFlow requires JSON, not Python code
langflow_json = {
  "nodes": [
    {
      "id": "agent-1",
      "type": "Agent",
      "data": {
        "agent_name": agent_definition["agent_name"],
        "role": agent_definition["role"],
        "goal": agent_definition["goal"],
        "backstory": agent_definition["backstory"]
      },
      "position": {"x": 100, "y": 100}
    },
    *[
      {
        "id": f"tool-{i}",
        "type": "Tool",
        "data": {
          "name": tool["name"],
          "description": tool["description"]
        },
        "position": {"x": 100 + i * 150, "y": 300}
      }
      for i, tool in enumerate(agent_definition["tools"])
    ],
    *[
      {
        "id": f"task-{i}",
        "type": "Task",
        "data": {
          "name": task["name"],
          "description": task["description"],
          "expected_output": task["expected_output"]
        },
        "position": {"x": 100, "y": 500 + i * 100}
      }
      for i, task in enumerate(agent_definition["tasks"])
    ]
  ],
  "edges": [
    # Connect agent to tools
    *[
      {
        "id": f"edge-agent-tool-{i}",
        "source": "agent-1",
        "target": f"tool-{i}"
      }
      for i in range(len(agent_definition["tools"]))
    ],
    # Connect agent to tasks (sequential)
    *[
      {
        "id": f"edge-task-{i}",
        "source": f"task-{i}" if i > 0 else "agent-1",
        "target": f"task-{i+1}" if i < len(agent_definition["tasks"]) - 1 else "output"
      }
      for i in range(len(agent_definition["tasks"]))
    ]
  ]
}
```

**Trade-offs**:

**Templates (Jinja2)**:
- ✅ **Prós**: Fast, deterministic, easy to debug
- ❌ **Contras**: Inflexível, não gera lógica complexa

**AST Manipulation**:
- ✅ **Prós**: Type-safe, transformações garantidas, refactoring automático
- ❌ **Contras**: Complexo, curva de aprendizado alta

**LLM (Claude Opus 4.5)**:
- ✅ **Prós**: Gera lógica de negócio customizada, natural language → code
- ❌ **Contras**: Não-determinístico, custo de inferência, pode gerar código incorreto

**Consequências**:

✅ **Positivas**:
- Código gerado de alta qualidade (type-safe, testado, linted)
- Meta-programming capability (agentes criam agentes)
- Flexibilidade (templates + AST + LLM cobrem todos os casos)
- Validação automática (syntax, types, tests)
- Versionamento via Git (código gerado é commitado)

⚠️ **Negativas**:
- Complexidade de implementação (3 mecanismos diferentes)
- Dependência de LLM para lógica customizada
- Custo de inferência LLM (Claude Opus 4.5)
- Debugging de código gerado pode ser difícil
- Risco de código gerado não-idiomático

**Mitigação de Riscos**:
1. **Code Review Automático**: Ruff, mypy, bandit (security)
2. **Test Generation**: LLM gera testes, garantia de correção
3. **Human Review**: Código gerado passa por aprovação (Fase 4)
4. **Fallback**: Se LLM falhar, usar template genérico
5. **Caching**: Cachear código gerado para requirements similares

**Status**: Aceita

**Impacto em Outros ADRs**:
- **ADR-008 (Geração 100% Automática)**: Implementa a estratégia de code generation
- **ADR-004 (CrewAI + LangGraph)**: Gera código para esses frameworks
- **ADR-002 (Apache Pulsar)**: Código gerado publica eventos via Pulsar

---

## 7. QUALIDADE ARQUITETURAL

### 7.1 Performance

**Latência**:
- APIs REST: p99 < 200ms
- GraphQL queries: p99 < 300ms
- Validações: < 50ms
- RAG queries: < 100ms
- Agent execution: < 30s (primeira chamada), < 5s (cached)

**Throughput**:
- Backend: 10k req/sec (Fase 1), 100k req/sec (Fase 4)
- AI Processing: 100 documents/hour (Fase 1), 1000/hour (Fase 4)
- Agent execution: 100 agentes em paralelo (Fase 2+)

### 7.2 Escalabilidade

**Horizontal Scaling**:
- PostgreSQL: Read replicas + connection pooling
- NebulaGraph: 3+ nós cluster
- Celery: 20+ workers (Fase 2+)
- FastAPI: 10+ instances (Fase 2+)
- Kubernetes HPA: Auto-scaling baseado em CPU/Memory

**Vertical Scaling**:
- Backend: 8GB RAM minimum, 4 CPU
- AI Services: GPU optional (Ollama local, vLLM produção)

### 7.3 Segurança

**Autenticação & Autorização**:
- OAuth 2.0 / OIDC para portais
- JWT para APIs
- RBAC (Role-Based Access Control) por Oráculo
- Permissões granulares por object_definition
- RLS (Row Level Security) no PostgreSQL

**Criptografia**:
- TLS 1.3 para comunicação
- AES-256 para dados em repouso
- Hashing seguro para senhas (bcrypt/argon2)
- PII encryption (dados sensíveis)

**Auditoria**:
- Audit trail completo para todas as ações
- Rastreabilidade: quem/quando/o quê/por quê
- Log imutável (append-only)

**Compliance**:
- GDPR: Direito ao esquecimento, portabilidade
- LGPD: Consentimento, direito à privacidade
- Específica do domínio (configurável por Oráculo)

### 7.4 Confiabilidade

**Uptime**:
- Fase 1-2: 99% (29min downtime/mês)
- Fase 3-4: 99.9% (43sec downtime/mês)

**Backup & Recovery**:
- Daily backups (PostgreSQL, NebulaGraph, pgvector)
- RTO (Recovery Time Objective): 1 hora
- RPO (Recovery Point Objective): 15 minutos

**Disaster Recovery**:
- Multi-region (futuro)
- Failover automático
- Testing trimestral

### 7.5 Observabilidade

**Metrics**:
```yaml
# Prometheus metrics
supercore_requests_total{oracle_id, endpoint, method}
supercore_request_duration_seconds{oracle_id, endpoint}
supercore_instance_creations_total{oracle_id, object_type}
supercore_agent_executions_total{oracle_id, agent_id, status}
supercore_validation_failures_total{oracle_id, rule_id}
```

**Logging**:
```json
{
  "timestamp": "2025-12-21T10:30:00Z",
  "level": "INFO",
  "service": "instance-manager",
  "oracle_id": "uuid-oracle-001",
  "user_id": "uuid-user-001",
  "action": "INSTANCE_CREATED",
  "entity_type": "business_entity",
  "entity_id": "uuid-instance-001",
  "duration_ms": 123,
  "trace_id": "abc123"
}
```

**Tracing**:
- Distributed tracing com Jaeger
- Trace propagation via headers
- Service dependency mapping

**Dashboards**:
- Grafana dashboards por Oracle
- Business metrics (instances created/day, active Oracles, etc)
- Technical metrics (latency, throughput, error rate)

---

## 8. CRESCIMENTO EXPONENCIAL

### 8.1 Padrão de Crescimento

**Semana 1: Lento (setup Oráculo)**
- Criação do Oráculo
- Upload de documentação
- Geração de especificação inicial
- Primeiros 5-10 objetos gerados

**Semana 2: Moderado (primeiros objetos)**
- Refinamento de objetos
- Primeiros agentes gerados
- Primeiros workflows gerados
- 15-20 objetos no total

**Semana 3: Rápido (reutilização de padrões)**
- Reutilização de objetos existentes
- Composição de workflows complexos
- Agentes colaborando
- 35-50 objetos no total

**Semana 4+: Exponencial (composição automática)**
- Novos objetos compostos a partir dos existentes
- Agentes geram novos agentes
- Workflows geram sub-workflows
- 50-100+ objetos possíveis

### 8.2 Métricas de Crescimento

**Medição**:
```python
# growth_metrics.py
def calculate_growth_rate(oracle_id: str, week: int) -> GrowthMetrics:
    objects_created = count_objects_created_in_week(oracle_id, week)
    agents_created = count_agents_created_in_week(oracle_id, week)
    workflows_created = count_workflows_created_in_week(oracle_id, week)

    reuse_rate = calculate_reuse_rate(oracle_id, week)
    composition_rate = calculate_composition_rate(oracle_id, week)

    return GrowthMetrics(
        week=week,
        objects_created=objects_created,
        agents_created=agents_created,
        workflows_created=workflows_created,
        reuse_rate=reuse_rate,
        composition_rate=composition_rate
    )
```

**Exemplo**:
```
Semana 1: 5 objetos gerados  (100% novos)
Semana 2: 15 objetos gerados (70% novos, 30% reutilizados)
Semana 3: 35 objetos gerados (50% novos, 50% compostos)
Semana 4: 50+ objetos gerados (30% novos, 70% compostos)
```

---

## 9. DIAGRAMAS

### 9.1 Diagrama de Componentes de Alto Nível - ATUALIZADO

```mermaid
C4Context
    title SuperCore v2.0 - System Context Diagram

    Person(user, "Usuário", "Product Manager / Compliance Officer / Administrador")

    System_Boundary(supercore, "SuperCore Platform") {
        System(portal, "Super Portal", "Next.js 14, Gerenciamento de Oráculos")
        System(deployment, "Deployment Orchestrator", "K8s Controller, Code Gen Engine")
        System(frontend, "Generated Frontends", "Next.js 14, React, TypeScript")
        System(mcp, "MCP Server", "TypeScript, Model Context Protocol")
        System(interaction, "Interaction Broker", "Go, WebSocket/Pulsar Bridge")
        System(orchestrator, "Agent Orchestrator", "Python, CrewAI/LangGraph/LangFlow")
        System(backend, "Backend Services", "Go, gRPC/REST APIs")
        System(oracle, "Oracle Service", "Python, Agentic RAG Trimodal (CrewAI + Temporal)")
        System(db, "Data Layer", "PostgreSQL 15 + NebulaGraph 3.8 + pgvector")
    }

    System_Ext(external_apis, "External APIs", "Domain-specific integrations")

    Rel(user, portal, "Gerencia Oráculos")
    Rel(portal, deployment, "Aciona 'Play'")
    Rel(deployment, frontend, "Deploya")
    Rel(user, frontend, "Interage via navegador")
    Rel(frontend, mcp, "MCP Messages", "Pulsar")
    Rel(mcp, backend, "REST API")
    Rel(interaction, frontend, "Push Updates", "WebSocket")
    Rel(orchestrator, backend, "gRPC")
    Rel(backend, oracle, "RAG Queries", "gRPC")
    Rel(backend, db, "CRUD Operations")
    Rel(orchestrator, external_apis, "Integra")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### 9.2 Diagrama de Camadas - ATUALIZADO

```mermaid
graph TB
    subgraph "Camada 6: Portal"
        A1[Super Portal UI]
        A2[Oracle Manager]
        A3[AI Context Generator Interface]
    end

    subgraph "Camada 5: Deployment"
        B1[Deployment Orchestrator]
        B2[Code Generation Engine]
        B3[Container Orchestrator]
        B4[URL Router]
    end

    subgraph "Camada 4: Apresentação Gerada"
        C1[Next.js Frontends]
        C2[Dynamic UI Components]
        C3[i18n Service]
    end

    subgraph "Camada 3: Interface MCP"
        D1[Apache Pulsar]
        D2[Interaction Broker]
        D3[Template System]
    end

    subgraph "Camada 2: Orquestração"
        E1[CrewAI Orchestrator]
        E2[LangGraph State Machines]
        E3[LangFlow Visual Workflows]
        E4[Biblioteca de Agentes]
    end

    subgraph "Camada 1: Abstração"
        F1[Biblioteca de Objetos]
        F2[Data Entities]
        F3[Integrations]
        F4[Workflows]
    end

    subgraph "Camada 0: Fundação - Oráculo"
        G1[PostgreSQL + pgvector]
        G2[NebulaGraph + Qdrant]
        G3[Agentic RAG Trimodal]
        G4[CrewAI Agents + Temporal Workflows]
    end

    subgraph "Base: Dados"
        H1[object_definitions]
        H2[instances]
        H3[oracle_config]
    end

    A1 --> B1
    B1 --> C1
    C1 --> D1
    D1 --> E1
    E1 --> F1
    F1 --> G1
    G1 --> H1

    style A1 fill:#E8F5E9
    style B1 fill:#FFF9C4
    style C1 fill:#D6EAF8
    style D1 fill:#D5F5E3
    style E1 fill:#FCF3CF
    style F1 fill:#FADBD8
    style G1 fill:#E8DAEF
    style H1 fill:#D5D8DC
```

### 9.3 Diagrama de Fluxo "Play" - NOVO

```mermaid
flowchart TD
    Start([Usuário clica 'Play']) --> A[Deployment Orchestrator]
    A --> B[Code Generation Engine]

    B --> C1[Gera Middleware FastAPI]
    B --> C2[Gera Frontend Next.js]
    B --> C3[Gera Agentes CrewAI]
    B --> C4[Gera Schemas PostgreSQL]

    C1 --> D1[Build Docker Image Middleware]
    C2 --> D2[Build Docker Image Frontend]
    C3 --> D3[Build Docker Image Agents]

    D1 --> E1[Push to Registry]
    D2 --> E2[Push to Registry]
    D3 --> E3[Push to Registry]

    E1 --> F[Kubernetes Deployment]
    E2 --> F
    E3 --> F

    F --> G1[Deploy Middleware Pods]
    F --> G2[Deploy Frontend Pods]
    F --> G3[Deploy Agents Pods]

    C4 --> H1[Setup PostgreSQL Schema]
    H1 --> H2[Setup NebulaGraph]
    H2 --> H3[Setup pgvector]

    G1 --> I[Configure Ingress + SSL]
    G2 --> I
    G3 --> I
    H3 --> I

    I --> J[Health Checks]
    J --> K{All Healthy?}

    K -->|Yes| L[Update Status: DEPLOYED]
    K -->|No| M[Rollback + Alert]

    L --> N([Solução disponível em oracle-id.supercore.io])

    style Start fill:#D6EAF8
    style B fill:#FCF3CF
    style F fill:#FADBD8
    style N fill:#D5F5E3
```

### 9.4 Diagrama de Sequência - Geração Completa Genérica - ATUALIZADO

```mermaid
sequenceDiagram
    actor User as Usuário Portal
    participant Portal as Super Portal
    participant Oracle as Oracle Manager
    participant AI as AI Context Generator
    participant RAG as Agentic RAG Service
    participant CodeGen as Code Generation Engine
    participant Deploy as Deployment Orchestrator
    participant K8s as Kubernetes
    participant DB as PostgreSQL

    User->>Portal: Cria novo Oráculo (domínio genérico)
    Portal->>Oracle: POST /oracles
    Oracle->>DB: INSERT oracle_config
    Oracle-->>Portal: Oracle criado

    User->>Portal: Upload contexto (docs, diagramas, URLs)
    Portal->>AI: upload_context()
    AI->>RAG: Processa documentos multimodal
    RAG->>DB: Store embeddings + graph
    RAG-->>AI: Context processado
    AI-->>Portal: Context ID

    User->>Portal: Gerar especificação
    Portal->>AI: generate_specification()
    AI->>RAG: Consulta conhecimento do Oráculo
    RAG-->>AI: Knowledge context
    AI->>AI: LLM gera especificação
    AI-->>Portal: Especificação em Markdown

    User->>Portal: Refina especificação (chat)
    Portal->>AI: refine_specification()
    AI->>AI: LLM refina com feedback
    AI-->>Portal: Especificação refinada

    User->>Portal: Aprova especificação
    Portal->>AI: generate_executable_model()
    AI->>RAG: Consulta Oráculo
    RAG-->>AI: Domain knowledge
    AI->>AI: Gera objects, agents, workflows
    AI-->>Portal: Modelo executável

    User->>Portal: Preview modelo
    Portal-->>User: Visualiza graph, testa workflows

    User->>Portal: Clica "Play"
    Portal->>Deploy: play_oracle()
    Deploy->>CodeGen: Gera código
    CodeGen-->>Deploy: Middleware, Frontend, Agents code
    Deploy->>Deploy: Build Docker images
    Deploy->>K8s: Deploy pods
    K8s-->>Deploy: Pods running
    Deploy->>DB: Setup schema
    Deploy->>Deploy: Configure Ingress
    Deploy-->>Portal: Deployed

    Portal-->>User: Solução disponível em URL
```

### 9.5 Diagrama de Deployment - ATUALIZADO

```mermaid
C4Deployment
    title SuperCore v2.0 - Deployment Diagram (Production)

    Deployment_Node(cdn, "CDN", "CloudFlare") {
        Container(static, "Static Assets", "JS, CSS, Images")
    }

    Deployment_Node(k8s, "Kubernetes Cluster", "AWS EKS") {
        Deployment_Node(portal_pods, "Portal Pods", "Next.js") {
            Container(portal1, "Super Portal Instance 1")
            Container(portal2, "Super Portal Instance 2")
        }

        Deployment_Node(oracle_namespace, "Oracle Namespace (per Oracle)", "K8s Namespace") {
            Deployment_Node(frontend_pods, "Frontend Pods", "Next.js Generated") {
                Container(fe1, "Frontend Instance 1")
                Container(fe2, "Frontend Instance 2")
            }

            Deployment_Node(middleware_pods, "Middleware Pods", "FastAPI Generated") {
                Container(mw1, "Middleware Instance 1")
                Container(mw2, "Middleware Instance 2")
            }

            Deployment_Node(agents_pods, "Agents Pods", "CrewAI Generated") {
                Container(ag1, "Agents Instance 1")
                Container(ag2, "Agents Instance 2")
            }
        }

        Deployment_Node(backend_pods, "Backend Pods", "Go Services") {
            Container(api1, "API Gateway")
            Container(inst1, "Instance Manager")
            Container(obj1, "Object Manager")
        }

        Deployment_Node(ai_pods, "AI Services Pods", "Python") {
            Container(ctx1, "Context Processor")
            Container(rag1, "RAG Service")
            Container(codegen1, "Code Generator")
        }

        Deployment_Node(deploy_pods, "Deployment Pods", "Go") {
            Container(depl1, "Deployment Orchestrator")
        }

        Deployment_Node(pulsar_cluster, "Pulsar Cluster", "Apache Pulsar v3.4") {
            Container(pulsar1, "Pulsar Broker 1")
            Container(pulsar2, "Pulsar Broker 2")
            Container(pulsar3, "Pulsar Broker 3")
        }
    }

    Deployment_Node(rds, "AWS RDS", "PostgreSQL 15") {
        ContainerDb(pg, "PostgreSQL Master")
        ContainerDb(pg_replica, "PostgreSQL Replica")
    }

    Deployment_Node(nebula_cluster, "NebulaGraph Cluster") {
        ContainerDb(nebula1, "Graph Node 1")
        ContainerDb(nebula2, "Graph Node 2")
    }

    Deployment_Node(s3, "AWS S3", "Object Storage") {
        Container(minio, "MinIO (S3-compatible)")
    }

    Deployment_Node(monitoring, "Monitoring Stack") {
        Container(prom, "Prometheus")
        Container(grafana, "Grafana")
        Container(jaeger, "Jaeger Tracing")
    }

    Rel(cdn, portal1, "Cache static")
    Rel(portal1, depl1, "Triggers deployment")
    Rel(depl1, api1, "Manages")
    Rel(fe1, mw1, "API calls")
    Rel(mw1, pg, "SQL")
    Rel(rag1, nebula1, "nGQL")
    Rel(codegen1, pulsar1, "Pub/Sub")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### 9.6 Diagrama de Multi-Tenancy - NOVO

```mermaid
graph TB
    subgraph "SuperCore Platform (Shared)"
        Portal[Super Portal]
        OracleManager[Oracle Manager Service]
        DeployOrch[Deployment Orchestrator]
        SharedDB[(PostgreSQL Shared)]
    end

    subgraph "Oracle A (Namespace oracle-a)"
        FrontendA[Frontend A]
        MiddlewareA[Middleware A]
        AgentsA[Agents A]
        DataA[(Data Layer A<br/>RLS oracle_id=A)]
    end

    subgraph "Oracle B (Namespace oracle-b)"
        FrontendB[Frontend B]
        MiddlewareB[Middleware B]
        AgentsB[Agents B]
        DataB[(Data Layer B<br/>RLS oracle_id=B)]
    end

    subgraph "Oracle C (Namespace oracle-c)"
        FrontendC[Frontend C]
        MiddlewareC[Middleware C]
        AgentsC[Agents C]
        DataC[(Data Layer C<br/>RLS oracle_id=C)]
    end

    Portal --> OracleManager
    OracleManager --> DeployOrch
    DeployOrch --> FrontendA
    DeployOrch --> FrontendB
    DeployOrch --> FrontendC

    FrontendA --> MiddlewareA --> DataA
    FrontendB --> MiddlewareB --> DataB
    FrontendC --> MiddlewareC --> DataC

    DataA -.->|RLS Isolation| SharedDB
    DataB -.->|RLS Isolation| SharedDB
    DataC -.->|RLS Isolation| SharedDB

    style Portal fill:#E8F5E9
    style OracleManager fill:#E8F5E9
    style DeployOrch fill:#FFF9C4
    style SharedDB fill:#E8DAEF
```

---

## 10. ROADMAP ARQUITETURAL

### 10.1 Arquitetura Atual (v2.0 - Q4 2025)

**Status**: Em implementação (Fase 0 completa, Fase 1 parcial)

**Componentes Implementados**:
- ✅ Oracle CRUD Multi-Tenant (Fase 0 - 100%)
- ✅ PostgreSQL 15 com Row-Level Security
- ✅ object_definitions + instances + relationships
- ✅ FSM engine genérico
- ✅ Dynamic UI (FormBuilder, TableBuilder)
- ⚠️ AI-Driven Context Generator (Fase 1 - Sprint 1 completo, pendente migração v3.0.0)
- ❌ Super Portal (planejado Q1 2026)
- ❌ Deployment Orchestrator (planejado Q1 2026)
- ❌ MCP Server completo (especificado, não implementado)
- ❌ Apache Pulsar (planejado Fase 2)
- ❌ NebulaGraph (planejado Fase 3)
- ❌ CrewAI + LangGraph + LangFlow (planejado Fase 3)

**Gaps Conhecidos**:
1. ❌ Super Portal não implementado (bloqueador crítico)
2. ❌ Deployment Orchestrator não implementado (bloqueador para "Play")
3. ⚠️ Multi-tenancy implementado na Fase 0, precisa migrar Fase 1 para v3.0.0
4. ⚠️ Agentic RAG parcial (apenas PostgreSQL, falta NebulaGraph + Qdrant + CrewAI Agents + Temporal Workflows)
5. ❌ Geração automática de objetos via IA não implementada (bloqueador crítico)
6. ❌ Geração automática de agentes via IA não implementada (bloqueador crítico)
7. ❌ Template System + Apache Pulsar não implementados
8. ❌ i18n Service não implementado

### 10.2 Evoluções Planejadas

#### Q1 2026 - Fase 1 Completa + Fase 2 Iniciada + Portal

**Objetivos**:
- ✅ Implementar Super Portal de Backoffice
- ✅ Implementar Oracle Manager Service
- ✅ Completar Fase 1 (AI-Driven Context Generator v3.0.0 Multi-Tenant)
- ✅ Implementar MCP Server completo
- ✅ Setup Apache Pulsar cluster
- ✅ Implementar Template System + Query Router
- ✅ Interaction Broker (Pulsar → WebSocket)
- ✅ Implementar i18n Service

**Entregáveis**:
- Super Portal funcional (gerenciamento de Oráculos)
- AI-Driven Context Generator funcional (6 fases)
- Upload multi-modal (30+ formatos)
- Geração automática de especificações
- MCP Tools/Resources/Prompts para Claude Desktop
- Template System com constrained decoding
- Real-time notifications via WebSocket
- Multi-idioma nativo

#### Q2 2026 - Fase 3: Oráculo + NebulaGraph + Agentes + Deployment

**Objetivos**:
- ✅ Implementar Deployment Orchestrator
- ✅ Implementar Code Generation Engine
- ✅ Setup NebulaGraph 3.8 cluster + Qdrant vector database
- ✅ Implementar GraphSyncService (PostgreSQL → NebulaGraph)
- ✅ Implementar EmbeddingSyncService (instances → Qdrant + pgvector)
- ✅ Agentic RAG Trimodal completo (6 CrewAI agents + Temporal Workflows)
  - Router Agent, Retrieval Agents (3×), Fusion Agent, Generator Agent, Reflector Agent
  - Routing Pattern, CRAG, Self-RAG, Multi-Source Fusion, Iterative Refinement
- ✅ CrewAI + LangGraph + LangFlow Orchestration
- ✅ Biblioteca de Agentes (primeiros 10 agentes gerados automaticamente)
- ✅ Geração automática de objetos via IA (RF011)
- ✅ Geração automática de agentes via IA (RF021)

**Entregáveis**:
- Deployment Orchestrator funcional
- "Play" → deploy completo automático
- Knowledge Graph operacional (NebulaGraph + Qdrant)
- Agentic RAG com multi-agent orchestration e error correction
- Crews funcionais (6+ agentic RAG agents + 3+ domain agents)
- Auto-geração de objetos consultando Oráculo
- Auto-geração de agentes especializados
- Primeiros fluxos end-to-end completos com Agentic RAG

#### Q3-Q4 2026 - Fase 4: Produção + Integração Real

**Objetivos**:
- ✅ Integrações configuráveis por domínio (payment, CRM, ERP, etc)
- ✅ Suporte a múltiplos domínios (mínimo 3 domínios diferentes)
- ✅ Validação em produção com casos reais
- ✅ Auditoria completa (logs imutáveis)
- ✅ Compliance validado para múltiplos setores

**Entregáveis**:
- Sistema funcionando end-to-end em produção
- Mínimo 3 Oráculos de domínios diferentes deployados
- Compliance completo validado
- Auditoria completa
- Primeiros clientes utilizando soluções geradas

#### 2027 - Fase 5: Escala + Otimização

**Objetivos**:
- ✅ Database sharding (PostgreSQL)
- ✅ NebulaGraph cluster distribuído (3+ nodes)
- ✅ Auto-scaling avançado (Kubernetes HPA + VPA)
- ✅ Edge caching (CloudFlare)
- ✅ Event Sourcing (opcional)
- ✅ Service Mesh (Istio)
- ✅ Multi-region deployment (DR)

**Entregáveis**:
- Capacidade de 1M+ req/s
- 10B+ instances
- 100K+ Oracles suportados
- Disaster Recovery automático
- Global replication (multi-region)

#### 2028 - Fase 6: Expansão Multi-Domínio

**Objetivos**:
- ✅ Templates de domínio (10+ domínios diferentes)
- ✅ Marketplace de objetos e agentes
- ✅ Self-service onboarding de novos Oracles
- ✅ AI Assistant para Product Managers (zero código)
- ✅ Auto-evolução completa (sistema se atualiza automaticamente)

**Entregáveis**:
- SuperCore rodando em 10+ domínios diferentes
- Marketplace com 1000+ objetos reutilizáveis
- 10K+ Oracles ativos
- Sistema 100% auto-evolutivo

### 10.3 Refatorings Necessários

#### Refactoring 1: Migrar Fase 1 para v3.0.0 Multi-Tenant

**Motivação**: Fase 1 implementada em v2.0.0 sem multi-tenancy.

**Escopo**:
- Adicionar `oracle_id NOT NULL` em `context_inputs` e `uploaded_files`
- Adicionar header `X-Oracle-ID` em todos os endpoints
- Adicionar validação de ownership no Orchestrator
- Adicionar OracleSelector no frontend
- Adicionar testes de isolamento multi-tenant

**Esforço**: 1-2 semanas
**Prioridade**: ALTA (bloqueador para Fase 2)

#### Refactoring 2: Unificar Event Publishing

**Motivação**: Atualmente, eventos são publicados de forma inconsistente.

**Escopo**:
- Criar EventBus abstrato
- Migrar TODOS os services para usar EventBus
- Garantir formato padronizado de eventos
- Adicionar retry logic e dead letter queue

**Esforço**: 1 semana
**Prioridade**: MÉDIA

#### Refactoring 3: Extrair Validation Engine

**Motivação**: Validação está espalhada entre Instance Manager e Object Manager.

**Escopo**:
- Criar ValidationEngine como serviço isolado
- Mover toda lógica de validação (schema + business rules + FSM)
- Expor via gRPC
- Cache de validators compilados

**Esforço**: 2 semanas
**Prioridade**: MÉDIA

#### Refactoring 4: Otimizar RAG Queries

**Motivação**: Traditional RAG faz queries sequenciais (lento). Agentic RAG with CrewAI + Temporal já implementa paralelização inteligente.

**Escopo** (IMPLEMENTADO em Agentic RAG):
- ✅ Paralelizar queries (SQL + Graph + Vector) via Retrieval Agents
- ✅ Implementar smart routing (Router Agent decide fontes baseado em query analysis)
- ✅ Cache de embeddings (Redis + PostgreSQL agent memory)
- ✅ CRAG pattern (quality evaluation + re-query)
- ✅ Self-RAG pattern (grounding validation + hallucination detection)
- Pre-computed indexes

**Esforço**: 2-3 semanas
**Prioridade**: ALTA (após NebulaGraph implementado)

### 10.4 Tech Debt Conhecido

#### Debt 1: Falta de Integration Tests End-to-End

**Descrição**: Testes E2E ainda são manuais.

**Impacto**: Risco de regressões em deploys.

**Plano de Remediação**:
- Setup de Testcontainers (PostgreSQL, Pulsar, NebulaGraph)
- Criação de suite E2E (Playwright + API tests)
- CI/CD pipeline com testes E2E obrigatórios
- **Prazo**: Q1 2026

#### Debt 2: Monitoring Incompleto

**Descrição**: Falta dashboards de business metrics.

**Impacto**: Dificuldade em identificar gargalos de negócio.

**Plano de Remediação**:
- Implementar business metrics (instances created/day, active Oracles, etc)
- Criar dashboards Grafana específicos
- Alertas para anomalias de negócio
- **Prazo**: Q2 2026

#### Debt 3: Documentação de APIs Desatualizada

**Descrição**: OpenAPI specs não refletem estado atual.

**Impacto**: Dificuldade para novos desenvolvedores e integrações.

**Plano de Remediação**:
- Automatizar geração de OpenAPI specs (via annotations)
- CI/CD valida specs vs código
- Publicar docs em portal (Swagger UI)
- **Prazo**: Q1 2026

#### Debt 4: Falta de Disaster Recovery Plan

**Descrição**: Ausência de plano formal de DR.

**Impacto**: Risco de downtime prolongado em caso de falha catastrófica.

**Plano de Remediação**:
- Documentar RPO (Recovery Point Objective) e RTO (Recovery Time Objective)
- Implementar backups automáticos (PostgreSQL, NebulaGraph)
- Testes de DR trimestrais
- Multi-region deployment (Fase 5)
- **Prazo**: Q3 2026

---

## CONCLUSÃO

### Resumo Executivo

O **SuperCore v2.0** representa uma mudança paradigmática no desenvolvimento de software empresarial. Não é uma ferramenta, mas uma **plataforma universal geradora de soluções** que:

1. **Inverte o modelo tradicional**: De codificação manual para geração 100% automática guiada por IA
2. **Elimina silos de domínio**: Serve QUALQUER setor (cada um com seu Oráculo configurado)
3. **Garante compliance por design**: Conhecimento do domínio no Oráculo
4. **Cresce exponencialmente**: Cada componente criado acelera todos os futuros
5. **Auto-evolui**: Absorve novas regulamentações e se atualiza automaticamente
6. **Deploy completo automático**: "Play" → solução rodando em produção

### Arquitetura em 6 Camadas + 4 Pilares

#### Camadas

1. **Camada 6 - Portal**: Super Portal de Backoffice (gestão de Oráculos)
2. **Camada 5 - Deployment**: Deployment Orchestrator (deploy completo automático)
3. **Camada 4 - Apresentação**: Frontends gerados (Next.js + shadcn/ui)
4. **Camada 3 - Interface**: MCPs + Pulsar (comunicação universal)
5. **Camada 2 - Orquestração**: Agentes autônomos (CrewAI + LangGraph + LangFlow)
6. **Camada 1 - Abstração**: Biblioteca de Objetos (Data, Integrations, UI, Workflows, Agents)
7. **Camada 0 - Fundação**: Oráculo (Agentic RAG: SQL + Graph + Vector + CrewAI + Temporal)
8. **Base - Dados**: Meta-objects + Instances

#### Pilares

1. **Pilar 1: Oráculo - A Fonte da Verdade**
   - Knowledge Graph (NebulaGraph) com conhecimento do domínio
   - Agentic RAG Trimodal (SQL + Graph + Vector + CrewAI + Temporal)
     - 6 agents: Router, Retrieval (3×), Fusion, Generator, Reflector
     - 5 patterns: Routing, CRAG, Self-RAG, Multi-Source Fusion, Iterative Refinement
   - Fonte única de contexto para geração

2. **Pilar 2: Biblioteca de Objetos - Os Blocos de Construção**
   - 5 tipos de objetos (Data, Integrations, UI, Workflows, Agents)
   - Geração 100% automática pelo Assistente de IA
   - Reutilização massiva

3. **Pilar 3: Biblioteca de Agentes - A Força de Trabalho Autônoma**
   - Agentes com roles, responsibilities, tools
   - Orquestração via CrewAI + LangGraph + LangFlow
   - Colaboração multi-agente
   - Geração 100% automática

4. **Pilar 4: MCPs - Interface Universal**
   - Comunicação semântica via Message Context Protocol
   - Apache Pulsar para messaging assíncrono
   - Desacoplamento total frontend/backend

### Tecnologias Core

- **Backend**: Go 1.21 (core services), Python 3.11 (AI services)
- **Frontend**: Next.js 14 App Router, React Server Components, shadcn/ui
- **Data**: PostgreSQL 15 + NebulaGraph 3.8 + pgvector
- **Messaging**: Apache Pulsar v3.4.0
- **AI**: Anthropic Claude (Opus 4.5 + Sonnet 3.7), CrewAI, LangGraph, LangFlow
- **Orchestration**: Kubernetes, Docker, Terraform
- **Multi-língua**: i18next, LLM multilíngue, embeddings multilíngues

### Estado Atual vs Visão Final

**Atual (Q4 2025)**:
- Fase 0 completa (Oracle CRUD Multi-Tenant)
- Fase 1 parcial (Sprint 1 implementado, pendente migração v3.0.0)
- Fundação sólida, mas gaps em:
  - ❌ Super Portal
  - ❌ Deployment Orchestrator
  - ❌ Geração automática por IA
  - ❌ Agentes e orquestração

**Visão Final (2028)**:
- Sistema 100% auto-evolutivo
- 10K+ Oracles, 10B+ instances, 1M+ req/s
- Multi-domain (10+ domínios diferentes)
- Zero código manual para criar novos produtos
- Marketplace de objetos e agentes
- Auto-evolução completa

### Próximos Passos Críticos

1. **Q1 2026**:
   - Implementar Super Portal de Backoffice (CRÍTICO)
   - Implementar Deployment Orchestrator (CRÍTICO para "Play")
   - Completar Fase 1 v3.0.0 + iniciar Fase 2 (Pulsar + Templates)
   - Implementar i18n Service

2. **Q2 2026**:
   - Implementar Fase 3 (NebulaGraph + Qdrant + Agentic RAG + Agentes)
   - Implementar 6 CrewAI Agents para Agentic RAG (Router, Retrieval×3, Fusion, Generator, Reflector)
   - Implementar 5 padrões Agentic RAG (Routing, CRAG, Self-RAG, Multi-Source Fusion, Iterative Refinement)
   - Implementar Temporal Workflows para RAG orchestration
   - Implementar Geração automática de objetos via IA (RF011) (CRÍTICO)
   - Implementar Geração automática de agentes via IA (RF021) (CRÍTICO)
   - Validar "Play" → deploy completo

3. **Q3-Q4 2026**:
   - Produção com múltiplos domínios (mínimo 3)
   - Validação de compliance por setor
   - Primeiros clientes

4. **2027+**:
   - Escala + Multi-domínio + Auto-evolução

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade operacional (2 bancos + Pulsar) | ALTA | MÉDIO | Automação via Terraform, monitoring robusto |
| Curva de aprendizado (metadata-driven) | ALTA | MÉDIO | Documentação, treinamento, tooling visual |
| Dependência de LLMs externos (Anthropic) | MÉDIA | ALTO | Fallback para modelos open-source (Llama, Mistral) |
| Multi-tenancy data leak | BAIXA | CRÍTICO | RLS obrigatório, integration tests extensivos |
| Deployment Orchestrator não implementado | ALTA | CRÍTICO | Priorizar Q1 2026, requisito bloqueador |
| Geração automática não implementada | ALTA | CRÍTICO | Priorizar Q2 2026, requisito bloqueador |

### Princípios para Manter

1. **Zero Lógica de Domínio Hardcoded**: SuperCore permanece 100% agnóstico
2. **Metadata como Fonte da Verdade**: Código deriva de metadados
3. **Compliance por Design**: Oráculo garante conformidade
4. **Composição sobre Construção**: Reutilizar, não recriar
5. **Evolução Contínua**: Mudanças sem breaking changes
6. **Geração 100% Automática**: IA gera tudo, zero código manual
7. **"Play" → Produção**: Um clique para deploy completo

### Mensagem Final

O SuperCore não é sobre construir software mais rápido. É sobre **mudar a natureza do software em si**: de estrutura rígida e frágil para organismo inteligente, resiliente e auto-evolutivo.

**SuperCore NÃO É uma solução. SuperCore É a MÁQUINA que GERA soluções.**

Permite que empresas foquem no que importa: **servir clientes e inovar em seus negócios**, enquanto o SuperCore cuida da complexidade técnica, regulatória e de compliance através de geração automática por IA.

---

**Documento gerado em**: 2025-12-22
**Versão**: 2.0.0 (Revisão Crítica Completa + 3 Novos ADRs)
**Autor**: Claude Sonnet 4.5 (Architect Agent)
**Aprovação**: Pendente

**Mudanças Principais nesta Revisão**:
1. ✅ Removidos TODOS os exemplos específicos de Banking/PIX (substituídos por genéricos)
2. ✅ Adicionada Camada 6 (Super Portal de Backoffice)
3. ✅ Adicionada Camada 5 (Deployment Orchestrator)
4. ✅ Adicionada arquitetura completa do fluxo "Play" → deploy
5. ✅ Enfatizada geração 100% automática por IA (eliminada criação manual)
6. ✅ Adicionados componentes críticos (Deployment Orchestrator, Portal UI, Oracle Manager, i18n Service)
7. ✅ Validada presença da stack core (Pulsar, LangGraph, LangFlow, CrewAI, Agentic RAG)
8. ✅ Atualizados todos os diagramas com novas camadas e componentes
9. ✅ Substituído Traditional RAG por Agentic RAG (v2.0.1 - 2026-01-01)
   - 6 CrewAI agents: Router, Retrieval (SQL/Graph/Vector), Fusion, Generator, Reflector
   - 5 padrões: Routing, CRAG, Self-RAG, Multi-Source Fusion, Iterative Refinement
   - Temporal Workflows para orchestration durable com checkpoints e retry logic
9. ✅ Adicionado ADR-008 (Geração automática), ADR-009 (Super Portal), ADR-010 (Grafo de Oráculos via MCP)
10. ✅ Adicionado ADR-011 (Frontend-Backend Communication Pattern), ADR-012 (Multi-Tenancy Strategy), ADR-013 (Code Generation Strategy)
11. ✅ Mantida qualidade e consistência do documento original

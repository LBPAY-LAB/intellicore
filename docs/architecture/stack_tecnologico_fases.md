# Stack Tecnológico por Fase - SuperCore Platform

**Versão**: 1.0.0
**Data**: 2025-12-11
**Propósito**: Referência técnica para agents de orquestração e scrum master

---

## ⚠️ DOCUMENTO MASTER - FONTE ÚNICA DE VERDADE

**CRÍTICO**: Este documento é a **ÚNICA fonte de verdade** para decisões de stack tecnológico em TODO o projeto.

### Regras de Governança

1. ✅ **SEMPRE consulte este documento** antes de adicionar qualquer dependência
2. ✅ **SEMPRE referencie este documento** em specs de fase (docs/fases/faseN/01_especificacoes.md)
3. ❌ **NUNCA crie documentos de stack** nas pastas de fases que possam divergir deste
4. ❌ **NUNCA use versões diferentes** das especificadas aqui sem aprovação formal
5. ⚠️ **Se precisar adicionar/mudar tecnologia**:
   - Abra discussão em docs/fases/faseN/02_duvidas_especificacoes.md
   - Após aprovação, atualize ESTE documento primeiro
   - Depois atualize referências nas specs da fase

### Como Usar Este Documento

**Para Agents de Implementação**:
```
1. Leia a seção da fase atual (ex: "Fase 1: Foundation")
2. Use EXATAMENTE as versões especificadas
3. Copie os snippets de go.mod, package.json, requirements.txt
4. Em caso de dúvida, consulte a justificativa na coluna "Justificativa"
```

**Para Scrum Master / Orchestration Agents**:
```
1. Valide que PRs usam versões corretas deste documento
2. Bloqueie PRs que adicionem dependências não listadas aqui
3. Referencie este documento em sprint planning
```

**Para Documentação de Fase**:
```
Em docs/fases/faseN/01_especificacoes.md, adicione:

## Stack Tecnológico

**Referência master**: [docs/architecture/stack_tecnologico_fases.md](../architecture/stack_tecnologico_fases.md)

Esta fase usa o stack definido na seção "Fase N" do documento master.
```

---

## Visão Geral

Este documento define o stack tecnológico exato para cada fase de implementação, servindo como **fonte única de verdade** para decisões de arquitetura e escolha de ferramentas.

## Princípios de Seleção

1. **Produção-First**: Sem POCs, sem tecnologias experimentais
2. **LTS/Stable**: Versões com Long-Term Support
3. **Community**: Ecossistema ativo e documentação robusta
4. **Performance**: Ferramentas otimizadas para alta carga
5. **Interoperabilidade**: Fácil integração entre camadas

---

## Fase 1: Foundation (Semanas 1-12)

### Backend

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Linguagem** | Go | 1.21+ | Performance, simplicidade, built-in concurrency |
| **Framework Web** | Gin | v1.10.0 | Rápido, leve, middlewares robustos |
| **Database Driver** | lib/pq | v1.10.9 | Driver PostgreSQL oficial |
| **JSON Schema** | gojsonschema | v1.2.0 | Suporte completo a Draft 7 |
| **UUID** | google/uuid | v1.6.0 | Geração segura de UUIDs |
| **Validação** | go-playground/validator | v10.x | Validação de structs |
| **Testing** | Go testing | stdlib | Nativo, sem dependências externas |

**Dependências go.mod**:
```go
module github.com/lbpay/supercore

go 1.21

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/google/uuid v1.6.0
    github.com/lib/pq v1.10.9
    github.com/xeipuuv/gojsonschema v1.2.0
)
```

### Frontend

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Framework** | Next.js | 14+ (App Router) | SSR, RSC, otimizações automáticas |
| **Runtime** | Node.js | 20 LTS | Estabilidade, performance |
| **Package Manager** | npm | 10+ | Padrão do Node.js |
| **UI Library** | shadcn/ui | latest | Componentes acessíveis, customizáveis |
| **Primitives** | Radix UI | latest | Headless components, WAI-ARIA |
| **Styling** | Tailwind CSS | v3.4+ | Utility-first, performance |
| **Forms** | React Hook Form | v7.x | Performance, DX excelente |
| **Validation** | Zod | v3.x | Type-safe schema validation |
| **State Management** | Zustand | v4.x | Simples, performático |
| **Data Fetching** | TanStack Query | v5.x | Cache, optimistic updates |
| **Testing** | Vitest | latest | Rápido, compatível com Jest |
| **E2E Testing** | Playwright | latest | Cross-browser, reliable |

**Dependências package.json**:
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.4.0",
    "@playwright/test": "^1.42.0"
  }
}
```

### Database

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **RDBMS** | PostgreSQL | 15+ | JSONB, performance, confiabilidade |
| **Extensions** | - | - | Nenhuma na Fase 1 |
| **Migrations** | Manual SQL | - | Simplicidade, controle total |
| **Backup** | pg_dump | built-in | Nativo, confiável |

**Schema crítico**:
- JSONB para `object_definitions.schema`
- JSONB para `instances.data`
- GIN index para queries JSONB
- BTREE index para foreign keys

### AI/ML (Assistente + RAG Básico)

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Linguagem** | Python | 3.11+ | Ecossistema ML/AI |
| **LLM Provider** | Claude 3.5 Sonnet | API | Melhor raciocínio, português |
| **Fallback LLM** | GPT-4 Turbo | API | Backup para alta carga |
| **Embeddings** | text-embedding-3-small | API | Custo/benefício |
| **NLP** | spaCy | v3.7+ | Extração de entidades |
| **Framework** | FastAPI | v0.110+ | Async, performance |

**Dependências requirements.txt**:
```txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
anthropic==0.18.0
openai==1.12.0
spacy==3.7.4
pydantic==2.6.0
```

### Infrastructure

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Containerization** | Docker | 24+ | Padrão de mercado |
| **Orchestration (dev)** | Docker Compose | v2+ | Simplicidade local |
| **Reverse Proxy** | - | - | Não necessário Fase 1 |
| **Monitoring** | Logs (stdout) | - | Simplicidade Fase 1 |

**docker-compose.yml** (Fase 1):
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: supercore_dev
      POSTGRES_USER: supercore
      POSTGRES_PASSWORD: supercore_dev_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/migrations:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - backend

  ai-services:
    build: ./ai-services
    ports:
      - "8081:8081"
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

---

## Fase 2: Brain (Semanas 13-20)

### Adições ao Stack

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Document Parsing** | PyMuPDF | v1.23+ | PDF extraction |
| **HTML Parsing** | BeautifulSoup4 | v4.12+ | Web scraping |
| **Vector DB** | pgvector | v0.6+ | PostgreSQL extension |
| **Embeddings Index** | HNSW | pgvector | Busca vetorial rápida |
| **Orchestration** | Celery | v5.3+ | Task queue distribuída |
| **Message Broker** | Redis | 7+ | Backend do Celery |

**Dependências adicionais**:
```txt
pymupdf==1.23.0
beautifulsoup4==4.12.0
celery==5.3.0
redis==5.0.0
```

**docker-compose.yml** (add):
```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery-worker:
    build: ./ai-services
    command: celery -A tasks worker --loglevel=info
    depends_on:
      - redis
```

---

## Fase 3: Autonomy (Semanas 21-28)

### Adições ao Stack

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Orchestration** | Kubernetes | 1.29+ | Auto-scaling, self-healing |
| **Service Mesh** | Istio | 1.20+ | Traffic management |
| **Monitoring** | Prometheus | latest | Métricas |
| **Logging** | Loki | latest | Logs agregados |
| **Dashboards** | Grafana | latest | Visualização |
| **Tracing** | Tempo | latest | Distributed tracing |
| **Agent Discovery** | Consul | 1.17+ | Service discovery |

**Kubernetes manifests**:
- `k8s/deployments/` - Deployments
- `k8s/services/` - Services
- `k8s/ingress/` - Ingress rules
- `k8s/configmaps/` - Configurações
- `k8s/secrets/` - Credenciais

---

## Fase 4: Production (Semanas 29-36)

### Adições ao Stack

| Categoria | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|---------------|
| **Ledger** | TigerBeetle | v0.15+ | Double-entry accounting |
| **BACEN Integration** | LB Connect | custom | PIX/SPI |
| **Anti-Fraude** | Data Rudder | API | Risk scoring |
| **Graph DB** | NebulaGraph | 3.7+ | Relacionamentos complexos |
| **CDN** | CloudFlare | - | Performance global |
| **WAF** | CloudFlare WAF | - | Proteção DDoS |
| **Backup** | Velero | latest | K8s backup |

**Integrações Externas**:
- BACEN SPI (Sistema de Pagamentos Instantâneos)
- DICT API (Diretório PIX)
- Receita Federal (validação CPF/CNPJ)
- ViaCEP (consulta endereços)

---

## Evolução do Stack

### Fase 1 → Fase 2
**Adiciona**:
- pgvector (extension PostgreSQL)
- Redis (message broker)
- Celery (task queue)
- Document parsing libraries

**Mantém**:
- Toda a stack da Fase 1

### Fase 2 → Fase 3
**Adiciona**:
- Kubernetes (orquestração)
- Istio (service mesh)
- Prometheus + Grafana (observability)
- Consul (service discovery)

**Mantém**:
- Toda a stack das Fases 1-2

### Fase 3 → Fase 4
**Adiciona**:
- TigerBeetle (ledger)
- NebulaGraph (graph DB)
- Integrações BACEN
- CloudFlare (CDN + WAF)

**Mantém**:
- Toda a stack das Fases 1-3

---

## Versionamento de Dependências

### Política de Upgrades

1. **Major versions**: Apenas entre fases
2. **Minor versions**: A cada sprint (se compatível)
3. **Patch versions**: Imediatamente (security fixes)

### Testes de Compatibilidade

Antes de qualquer upgrade:
- [ ] Testes unitários passando (100%)
- [ ] Testes de integração passando (100%)
- [ ] Testes E2E passando (cenário crítico)
- [ ] Performance não degradada (< 5%)

---

## Ambientes

### Desenvolvimento
- Docker Compose local
- PostgreSQL local
- Hot reload (backend + frontend)

### Staging
- Kubernetes (Minikube ou k3s)
- PostgreSQL containerizado
- Réplicas: 1 pod por serviço

### Produção (Fase 4)
- Kubernetes (managed: EKS/GKE/AKS)
- PostgreSQL managed (RDS/CloudSQL)
- Réplicas: 3+ pods por serviço
- Auto-scaling habilitado

---

## Referências

- [Visão de Arquitetura](visao_arquitetura.md)
- [Especificações Fase 1](../fases/fase1/01_especificacoes.md)
- [Squad de Agents](../fases/fase1/06_squad_agents.md)

---

**Uso**:
- **Scrum Master Agent**: Referência para planning de sprints
- **Orchestration Agent**: Decisões de deploy e infra
- **Backend/Frontend Agents**: Escolha de bibliotecas
- **DevOps Agent**: Setup de ambientes

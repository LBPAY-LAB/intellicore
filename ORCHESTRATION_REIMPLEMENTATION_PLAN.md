# 🎯 Meta-Orchestrator + Celery - Plano de Reimplementação

**Data**: 2025-12-27
**Versão**: 1.0.0
**Status**: 📋 PLANO APROVADO PENDENTE

---

## 📊 Executive Summary

### Estado Atual
- ✅ **3 Agent Owners Completos**: Product, Architecture, Infrastructure
- ⚠️ **3 Agent Owners Incompletos**: Frontend, Backend, QA (apenas skeletons)
- ❌ **Infraestrutura Celery Ausente**: `tasks.py`, `celery_app.py` não existem
- ❌ **Meta-Orchestrator Ausente**: Sem coordenador centralizado
- ⚠️ **Portal tenta importar**: `from tasks import execute_card_task` (FALHA)

### Gap Analysis
**Total Lines Necessárias**: ~2,300 lines
**Esforço Estimado**: 2-3 semanas (1 desenvolvedor full-time)
**ROI**: Sistema de orquestração 100% autônomo (Zero manual intervention)

---

## 🎯 Objetivos da Reimplementação

### Objetivos Primários
1. **Meta-Orchestrator Autônomo**: Coordenador centralizado que gerencia lifecycle de cards
2. **Celery Task Queue**: Execução distribuída e assíncrona de Agent Owners
3. **Agent Owners Completos**: Implementar 100% dos 6 Agent Owners
4. **Dependency Management**: Grafo de dependências entre cards
5. **Fault Tolerance**: Checkpoints, retry logic, dead-letter queue

### Objetivos Secundários
6. **Observability**: Logs estruturados, métricas, tracing
7. **Scalability**: Suporte a múltiplos workers Celery
8. **Integration**: Portal web em tempo real via WebSocket/SSE
9. **Testing**: Coverage ≥80% (unit + integration)
10. **Documentation**: Runbooks, ADRs, API docs

---

## 📐 Arquitetura Proposta

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────────┐
│ Execution Portal (FastAPI + React)                             │
│ - Real-time monitoring via SSE                                  │
│ - Card lifecycle visualization                                  │
│ - Manual interventions (retry, skip, rollback)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ REST API + SSE
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Meta-Orchestrator (autonomous_meta_orchestrator.py)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Responsibilities:                                                │
│ 1. Load backlog_master.json                                     │
│ 2. Build dependency graph (cards with dependencies)             │
│ 3. Enqueue ready cards to Celery                                │
│ 4. Monitor task status (polling Redis)                          │
│ 5. Handle failures (retry, escalate, dead-letter)               │
│ 6. Update backlog_master.json (checkpoints)                     │
│ 7. Emit progress events to Portal (SSE)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │ Celery.send_task()
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Celery + Redis (Message Broker + Result Backend)               │
│ - Queue: squadOS.cards (priority queue)                         │
│ - Workers: 5× concurrent (configurable)                         │
│ - Retry: 3× with exponential backoff                            │
│ - Dead Letter Queue: squadOS.failed                             │
└────────────────┬────────────────────────────────────────────────┘
                 │ Task Dispatch
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent Owner Executors (tasks.py)                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ @celery_app.task(bind=True, max_retries=3)                      │
│ def execute_card_task(self, card_id, card_type, card_data):     │
│     agent = get_agent_owner(card_type)  # PROD, ARCH, INFRA...  │
│     result = agent.execute(card_data)                            │
│     return result                                                │
└────────────────┬────────────────────────────────────────────────┘
                 │ Agent.execute()
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent Owners (agents/)                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ product_owner_agent.py         (v3.1, production-ready)      │
│ ✅ architecture_owner_agent.py    (v1.0.0, production-ready)    │
│ ✅ infrastructure_owner_agent.py  (v1.0.0, production-ready)    │
│ ⚠️ frontend_owner_agent.py        (skeleton, needs impl)        │
│ ⚠️ backend_owner_agent.py         (skeleton, needs impl)        │
│ ⚠️ qa_owner_agent.py              (skeleton, needs impl)        │
└────────────────┬────────────────────────────────────────────────┘
                 │ Write Artifacts
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Artifact Storage (app-artefacts/)                               │
│ - produto/       (Product Owner outputs)                        │
│ - arquitetura/   (Architecture Owner outputs)                   │
│ - engenharia/    (Frontend/Backend Owner outputs)               │
│ - qa/            (QA Owner outputs)                             │
│ - deploy/        (Infrastructure Owner outputs)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Card Lifecycle**:
```
1. ENQUEUE    → Meta-Orchestrator loads card from backlog_master.json
2. DISPATCH   → Celery sends card to available worker
3. EXECUTE    → Agent Owner processes card
4. VERIFY     → Verification Agent checks output (obra ow-002)
5. EVALUATE   → LLM-as-Judge scores quality (if applicable)
6. COMPLETE   → Update backlog_master.json, emit event to Portal
7. NEXT       → Enqueue dependent cards (if dependencies met)
```

**Dependency Resolution**:
```python
# Example: PROD-005 depends on PROD-001 and PROD-002
card = {
    "id": "PROD-005",
    "dependencies": ["PROD-001", "PROD-002"],
    "status": "TODO"
}

# Meta-Orchestrator checks:
if all(dep in completed_cards for dep in card["dependencies"]):
    enqueue_card(card)  # Ready to execute
else:
    wait_for_dependencies(card)  # Block until deps complete
```

---

## 🗂️ Arquivos a Criar/Modificar

### 1️⃣ Celery Infrastructure (CRIAR)

#### `squadOS/app-execution/celery_app.py` (~150 lines)
```python
from celery import Celery
import redis

celery_app = Celery(
    'squadOS',
    broker='redis://localhost:6379/2',
    backend='redis://localhost:6379/2',
    include=['tasks']
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'tasks.execute_card_task': {'queue': 'squadOS.cards'},
    },
    task_default_priority=5,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,  # 1 hour
)
```

**Responsabilidades**:
- ✅ Configurar Celery app
- ✅ Definir broker (Redis DB 2)
- ✅ Definir backend de resultados
- ✅ Configurar serialização JSON
- ✅ Definir rotas de tasks
- ✅ Configurar retry/timeout/acks

---

#### `squadOS/app-execution/tasks.py` (~300 lines)
```python
from celery import Task
from celery_app import celery_app
from agents.product_owner_agent import ProductOwnerAgent
from agents.architecture_owner_agent import ArchitectureOwnerAgent
from agents.infrastructure_owner_agent import InfrastructureOwnerAgent
from agents.frontend_owner_agent import FrontendOwnerAgent
from agents.backend_owner_agent import BackendOwnerAgent
from agents.qa_owner_agent import QAOwnerAgent
import logging

logger = logging.getLogger(__name__)

AGENT_REGISTRY = {
    "EPIC": ProductOwnerAgent,
    "PROD": ProductOwnerAgent,
    "ARCH": ArchitectureOwnerAgent,
    "INFRA": InfrastructureOwnerAgent,
    "FE": FrontendOwnerAgent,
    "BE": BackendOwnerAgent,
    "QA": QAOwnerAgent,
}

class CardExecutionTask(Task):
    """Base task with retry logic and error handling"""
    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True
    retry_backoff_max = 600  # 10 minutes
    retry_jitter = True

@celery_app.task(bind=True, base=CardExecutionTask)
def execute_card_task(self, card_id: str, card_type: str, card_data: dict):
    """
    Execute a single card via appropriate Agent Owner

    Args:
        card_id: Card identifier (e.g., "PROD-001")
        card_type: Card type prefix (e.g., "PROD", "ARCH")
        card_data: Full card object from backlog_master.json

    Returns:
        dict: Execution result with status, artifacts, errors
    """
    logger.info(f"Executing card {card_id} (type: {card_type})")

    # 1. Get Agent Owner for card type
    agent_class = AGENT_REGISTRY.get(card_type)
    if not agent_class:
        raise ValueError(f"Unknown card type: {card_type}")

    # 2. Instantiate agent
    agent = agent_class()

    # 3. Execute card
    try:
        result = agent.execute(card_data)
        logger.info(f"Card {card_id} completed successfully")
        return {
            "status": "DONE",
            "card_id": card_id,
            "artifacts": result.get("artifacts", []),
            "metrics": result.get("metrics", {}),
        }
    except Exception as e:
        logger.error(f"Card {card_id} failed: {e}")
        # Celery will auto-retry due to CardExecutionTask config
        raise
```

**Responsabilidades**:
- ✅ Mapear card_type → Agent Owner (AGENT_REGISTRY)
- ✅ Definir `execute_card_task` com retry logic
- ✅ Instanciar Agent Owner correto
- ✅ Chamar `agent.execute(card_data)`
- ✅ Retornar resultado estruturado
- ✅ Tratar erros com retry exponencial

---

### 2️⃣ Meta-Orchestrator (REESCREVER)

#### `squadOS/app-execution/autonomous_meta_orchestrator.py` (~500 lines)

**Estrutura Proposta**:
```python
class MetaOrchestrator:
    """
    Coordenador centralizado de Agent Owners via Celery

    Responsibilities:
    1. Load backlog_master.json (on startup)
    2. Build dependency graph
    3. Enqueue ready cards to Celery
    4. Monitor task status (polling Redis)
    5. Handle failures (retry, escalate, DLQ)
    6. Update backlog_master.json (checkpoints)
    7. Emit progress events to Portal (SSE)
    """

    def __init__(self):
        self.backlog_path = STATE_DIR / "backlog_master.json"
        self.backlog = self.load_backlog()
        self.dependency_graph = self.build_dependency_graph()
        self.active_tasks = {}  # task_id → AsyncResult
        self.completed_cards = set()
        self.failed_cards = set()

    def run(self):
        """Main orchestration loop"""
        logger.info("Meta-Orchestrator starting...")

        while True:
            # 1. Find ready cards (dependencies met)
            ready_cards = self.get_ready_cards()

            # 2. Enqueue ready cards to Celery
            for card in ready_cards:
                self.enqueue_card(card)

            # 3. Monitor active tasks
            self.monitor_tasks()

            # 4. Handle completed tasks
            self.process_completed_tasks()

            # 5. Handle failed tasks
            self.process_failed_tasks()

            # 6. Checkpoint backlog
            if self.should_checkpoint():
                self.save_backlog()

            # 7. Emit progress to Portal
            self.emit_progress()

            # 8. Check termination condition
            if self.is_complete():
                logger.info("All cards completed. Orchestrator terminating.")
                break

            time.sleep(5)  # Poll every 5 seconds

    def get_ready_cards(self) -> List[dict]:
        """Return cards with all dependencies met"""
        ready = []
        for card in self.backlog["cards"]:
            if card["status"] != "TODO":
                continue

            deps = card.get("dependencies", [])
            if all(dep in self.completed_cards for dep in deps):
                ready.append(card)

        return ready

    def enqueue_card(self, card: dict):
        """Enqueue card to Celery"""
        card_id = card["id"]
        card_type = card_id.split("-")[0]  # "PROD-001" → "PROD"

        logger.info(f"Enqueuing card {card_id} to Celery")

        # Send to Celery
        task = execute_card_task.apply_async(
            args=[card_id, card_type, card],
            queue='squadOS.cards',
            priority=self.get_priority(card),
        )

        # Track task
        self.active_tasks[card_id] = task
        card["status"] = "IN_PROGRESS"
        card["task_id"] = task.id

    def monitor_tasks(self):
        """Check status of active Celery tasks"""
        for card_id, task in list(self.active_tasks.items()):
            if task.ready():
                # Task finished (success or failure)
                if task.successful():
                    self.handle_success(card_id, task.result)
                else:
                    self.handle_failure(card_id, task.info)

    def handle_success(self, card_id: str, result: dict):
        """Handle successful card completion"""
        logger.info(f"Card {card_id} completed successfully")

        # Update backlog
        card = self.get_card(card_id)
        card["status"] = "DONE"
        card["completed_at"] = datetime.utcnow().isoformat()
        card["artifacts"] = result.get("artifacts", [])

        # Track completion
        self.completed_cards.add(card_id)
        del self.active_tasks[card_id]

        # Emit event
        self.emit_event("card.completed", {"card_id": card_id, "result": result})

    def handle_failure(self, card_id: str, error: Any):
        """Handle card failure (after retries exhausted)"""
        logger.error(f"Card {card_id} failed after retries: {error}")

        # Update backlog
        card = self.get_card(card_id)
        card["status"] = "FAILED"
        card["error"] = str(error)

        # Track failure
        self.failed_cards.add(card_id)
        del self.active_tasks[card_id]

        # Emit event
        self.emit_event("card.failed", {"card_id": card_id, "error": str(error)})

        # Escalate to Tech Lead (if configured)
        self.escalate_failure(card_id, error)
```

**Responsabilidades**:
- ✅ Carregar `backlog_master.json`
- ✅ Construir grafo de dependências
- ✅ Enfileirar cards prontos (dependencies met)
- ✅ Monitorar status de tasks Celery
- ✅ Tratar sucessos (marcar DONE, adicionar a completed_cards)
- ✅ Tratar falhas (marcar FAILED, escalar se necessário)
- ✅ Checkpointing (salvar backlog a cada N cards)
- ✅ Emitir eventos SSE para Portal

---

### 3️⃣ Agent Owners Incompletos (COMPLETAR)

#### `squadOS/app-execution/agents/frontend_owner_agent.py` (~500 lines)

**Skeleton Atual**:
```python
class FrontendOwnerAgent:
    def __init__(self):
        self.name = "Frontend Owner"
        self.version = "0.1.0-skeleton"

    def execute(self, card_data: dict) -> dict:
        # TODO: Implement component generation
        raise NotImplementedError("Frontend Owner not yet implemented")
```

**Implementação Necessária**:
```python
class FrontendOwnerAgent:
    """
    Generates React components from architecture designs

    Inputs:
        - Card from backlog (FE-xxx)
        - Architecture designs (API contracts, wireframes)

    Outputs:
        - React component (.tsx)
        - Unit tests (Jest + React Testing Library)
        - Storybook stories
        - Type definitions (.d.ts)

    Stack:
        - React 18+ with Hooks
        - TypeScript 5+
        - Next.js 14 App Router
        - shadcn/ui components
        - Tailwind CSS
    """

    def __init__(self):
        self.name = "Frontend Owner"
        self.version = "1.0.0"
        self.artifacts_dir = Path("app-artefacts/engenharia/frontend")
        self.llm_client = CachedLLMClient(model="claude-sonnet-4")

    def execute(self, card_data: dict) -> dict:
        """
        Execute frontend card

        Steps:
        1. Load architecture design
        2. Generate component code (LLM)
        3. Generate unit tests
        4. Generate Storybook story
        5. Verify compilation (tsc --noEmit)
        6. Run tests (npm test)
        7. Save artifacts
        """
        card_id = card_data["id"]

        # 1. Load architecture design
        design = self.load_design(card_data.get("design_ref"))

        # 2. Generate component
        component_code = self.generate_component(design)

        # 3. Generate tests
        test_code = self.generate_tests(component_code)

        # 4. Generate Storybook story
        story_code = self.generate_story(component_code)

        # 5. Save artifacts
        artifacts = self.save_artifacts(card_id, {
            "component": component_code,
            "test": test_code,
            "story": story_code,
        })

        # 6. Verify compilation
        self.verify_typescript(artifacts["component"])

        # 7. Run tests
        test_results = self.run_tests(artifacts["test"])

        return {
            "status": "DONE",
            "artifacts": artifacts,
            "test_results": test_results,
        }

    def generate_component(self, design: dict) -> str:
        """Generate React component using LLM"""
        prompt = f"""
        Generate a production-ready React component based on this design:

        {json.dumps(design, indent=2)}

        Requirements:
        - TypeScript 5+
        - React 18+ with Hooks
        - shadcn/ui components
        - Tailwind CSS
        - Accessibility (WCAG 2.1 AA)
        - Error boundaries
        - Loading states
        - Comprehensive JSDoc

        Return ONLY the component code (no markdown).
        """

        response = self.llm_client.generate(
            prompt=prompt,
            cache_prefix="frontend_component_generation",
            temperature=0.2,
        )

        return response["content"]
```

**Estimativa**: 500 lines (component generation, test generation, verification)

---

#### `squadOS/app-execution/agents/backend_owner_agent.py` (~500 lines)

**Implementação Necessária**:
```python
class BackendOwnerAgent:
    """
    Generates backend APIs from architecture designs

    Inputs:
        - Card from backlog (BE-xxx)
        - Architecture designs (API contracts, database schemas)

    Outputs:
        - API endpoints (Go/Python)
        - Database migrations (SQL)
        - Unit tests
        - Integration tests
        - OpenAPI spec

    Stack:
        - Go 1.22+ (Gin framework)
        - Python 3.12+ (FastAPI)
        - PostgreSQL 16+
        - Redis 7+
    """

    def execute(self, card_data: dict) -> dict:
        """
        Execute backend card

        Steps:
        1. Load architecture design (API contract)
        2. Detect language (Go vs Python)
        3. Generate API endpoint code
        4. Generate database migration (if schema change)
        5. Generate unit tests
        6. Generate integration tests
        7. Run tests
        8. Generate OpenAPI spec
        9. Save artifacts
        """
        # Implementation similar to FrontendOwnerAgent
        pass
```

**Estimativa**: 500 lines (API generation, migration generation, test generation)

---

#### `squadOS/app-execution/agents/qa_owner_agent.py` (~400 lines)

**Implementação Necessária**:
```python
class QAOwnerAgent:
    """
    Orchestrates comprehensive testing and quality gates

    Inputs:
        - Card from backlog (QA-xxx)
        - Frontend/Backend artifacts

    Outputs:
        - Test execution report
        - Coverage report
        - Security scan report (Trivy, Bandit)
        - Linting report
        - Performance test results
        - PASS/FAIL decision

    Gates:
    1. Unit test coverage ≥80%
    2. Integration tests passing
    3. E2E tests passing (Playwright)
    4. Zero HIGH/CRITICAL vulnerabilities
    5. Linting passing (eslint, golangci-lint)
    6. Performance targets met (API <500ms p95)
    """

    def execute(self, card_data: dict) -> dict:
        """
        Execute QA card

        Steps:
        1. Run unit tests (frontend + backend)
        2. Calculate coverage
        3. Run integration tests
        4. Run E2E tests (if applicable)
        5. Run security scans (Trivy, Bandit)
        6. Run linters
        7. Run performance tests (if applicable)
        8. Aggregate results
        9. Make PASS/FAIL decision
        10. Generate report
        """
        # Implementation
        pass
```

**Estimativa**: 400 lines (test orchestration, security scanning, reporting)

---

### 4️⃣ Portal Integration (MODIFICAR)

#### `squadOS/execution-portal/backend/server.py` (MODIFICAR)

**Mudanças Necessárias**:
1. ✅ Importar `tasks.py` corretamente (após criação)
2. ✅ Adicionar endpoint `/api/cards/retry` (retry failed card)
3. ✅ Adicionar endpoint `/api/cards/skip` (skip blocked card)
4. ✅ Melhorar SSE `/api/events/stream` (eventos do Meta-Orchestrator)

```python
# Add to server.py
from tasks import execute_card_task

@app.post("/api/cards/{card_id}/retry")
async def retry_card(card_id: str):
    """Manually retry a failed card"""
    card = get_card_from_backlog(card_id)
    if not card:
        raise HTTPException(404, f"Card {card_id} not found")

    if card["status"] != "FAILED":
        raise HTTPException(400, f"Card {card_id} is not in FAILED state")

    # Reset status and re-enqueue
    card["status"] = "TODO"
    save_backlog()

    # Trigger Meta-Orchestrator to pick it up
    return {"message": f"Card {card_id} reset to TODO", "card": card}
```

---

## 📊 Estimativa de Esforço

### Breakdown por Componente

| Componente                       | Lines | Complexidade | Esforço  | Prioridade |
|----------------------------------|-------|--------------|----------|------------|
| `celery_app.py`                  | 150   | Baixa        | 2h       | P0 (CRÍTICO) |
| `tasks.py`                       | 300   | Média        | 4h       | P0 (CRÍTICO) |
| `autonomous_meta_orchestrator.py`| 500   | Alta         | 12h      | P0 (CRÍTICO) |
| `frontend_owner_agent.py`        | 500   | Alta         | 16h      | P1 (ALTA) |
| `backend_owner_agent.py`         | 500   | Alta         | 16h      | P1 (ALTA) |
| `qa_owner_agent.py`              | 400   | Média        | 8h       | P1 (ALTA) |
| Portal integration updates       | 100   | Baixa        | 3h       | P2 (MÉDIA) |
| Testing (unit + integration)     | 400   | Média        | 8h       | P1 (ALTA) |
| Documentation (ADRs, runbooks)   | 300   | Baixa        | 4h       | P2 (MÉDIA) |
| **TOTAL**                        | **2,650** | -        | **73h**  | - |

**Esforço Total**: **73 horas** (~2 semanas para 1 desenvolvedor full-time)

---

## 🎯 Opções de Implementação

### Opção A: Full Implementation (Recomendado)
**Esforço**: 2-3 semanas
**Entregas**:
- ✅ Celery infrastructure (celery_app.py, tasks.py)
- ✅ Meta-Orchestrator autônomo
- ✅ 6 Agent Owners completos (Product, Architecture, Infrastructure, Frontend, Backend, QA)
- ✅ Portal integration (retry, skip, real-time events)
- ✅ Testing (coverage ≥80%)
- ✅ Documentation (ADRs, runbooks)

**Pros**:
- Sistema 100% autônomo (zero manual intervention)
- Produção-ready
- Escalável (múltiplos workers Celery)
- Fault-tolerant (retry, DLQ, checkpoints)

**Cons**:
- Maior esforço inicial (73h)

---

### Opção B: Phased Implementation
**Fase 1** (1 semana): Celery + Meta-Orchestrator + 3 Agent Owners existentes
- Implementar `celery_app.py`, `tasks.py`, Meta-Orchestrator
- Validar com Product, Architecture, Infrastructure Owners (já completos)
- **Entrega**: Sistema funcional para RF001-RF017 (Fase 1 do projeto)

**Fase 2** (1 semana): Frontend + Backend + QA Owners
- Implementar 3 Agent Owners restantes
- **Entrega**: Sistema completo end-to-end

**Pros**:
- Entrega incremental (valor mais cedo)
- Feedback loop mais rápido
- Menor risco

**Cons**:
- 2× entregas (mais overhead de deploy/validação)

---

### Opção C: Minimal Viable Orchestration (MVP)
**Esforço**: 3-4 dias
**Entregas**:
- ✅ Celery infrastructure (celery_app.py, tasks.py)
- ✅ Meta-Orchestrator simplificado (sem dependency graph)
- ❌ Agent Owners: apenas Product, Architecture, Infrastructure (já existem)
- ⚠️ Frontend/Backend/QA: MOCKS (retornam sucesso imediato)

**Pros**:
- Entrega rápida (proof of concept)
- Valida arquitetura Celery

**Cons**:
- Não production-ready
- Frontend/Backend/QA mocks (não geram código real)
- Sem dependency management (ordem fixa de execução)

---

## 📋 Plano de Ação (Opção A - Recomendado)

### Semana 1: Celery Infrastructure + Meta-Orchestrator

**Day 1-2** (16h): Celery Infrastructure
- [ ] Criar `celery_app.py` (configuração Celery + Redis)
- [ ] Criar `tasks.py` (execute_card_task com retry logic)
- [ ] Testar localmente (enqueue PROD-001 → executa → retorna resultado)
- [ ] Escrever testes unitários (coverage ≥80%)

**Day 3-5** (24h): Meta-Orchestrator
- [ ] Reescrever `autonomous_meta_orchestrator.py` (500 lines)
  - [ ] Load backlog_master.json
  - [ ] Build dependency graph
  - [ ] Enqueue ready cards
  - [ ] Monitor Celery tasks
  - [ ] Handle success/failure
  - [ ] Checkpoint backlog
  - [ ] Emit SSE events
- [ ] Testar end-to-end (EPIC-001 → 120 PROD cards → Architecture → Infrastructure)
- [ ] Escrever testes integração

---

### Semana 2: Agent Owners + Portal

**Day 6-7** (16h): Frontend Owner Agent
- [ ] Implementar `frontend_owner_agent.py` (component generation)
- [ ] Integrar com CachedLLMClient (prompt caching)
- [ ] Testar com card FE-001 (gerar componente React)
- [ ] Escrever testes unitários

**Day 8-9** (16h): Backend Owner Agent
- [ ] Implementar `backend_owner_agent.py` (API generation)
- [ ] Testar com card BE-001 (gerar API FastAPI)
- [ ] Escrever testes unitários

**Day 10** (8h): QA Owner Agent
- [ ] Implementar `qa_owner_agent.py` (test orchestration)
- [ ] Integrar com Verification Agent, LLM-as-Judge
- [ ] Testar com card QA-001

---

### Semana 3: Integration + Testing + Documentation

**Day 11-12** (16h): Portal Integration
- [ ] Atualizar `server.py` (importar tasks.py)
- [ ] Adicionar endpoints `/api/cards/retry`, `/api/cards/skip`
- [ ] Melhorar SSE `/api/events/stream` (eventos do Meta-Orchestrator)
- [ ] Testar UI (visualização em tempo real)

**Day 13** (8h): End-to-End Testing
- [ ] Teste completo: Iniciar Projeto → EPIC-001 → 120 PROD → ARCH → INFRA → FE → BE → QA → Deploy
- [ ] Validar dependency graph (cards executam na ordem correta)
- [ ] Validar retry logic (simular falhas)
- [ ] Validar checkpoints (kill orchestrator → restart → retoma do checkpoint)

**Day 14** (8h): Documentation
- [ ] ADR-016: Meta-Orchestrator + Celery Architecture
- [ ] Runbook: Como iniciar/parar orchestrador
- [ ] Runbook: Como debugar failed cards
- [ ] Runbook: Como escalar workers Celery
- [ ] Atualizar CLAUDE.md (nova arquitetura)

---

## ✅ Definition of Done

### Critérios de Aceitação

**Funcional**:
- [ ] Meta-Orchestrator carrega backlog_master.json e inicia processamento
- [ ] Celery workers recebem e executam cards via `execute_card_task`
- [ ] 6 Agent Owners completos (Product, Architecture, Infrastructure, Frontend, Backend, QA)
- [ ] Dependency graph funciona (cards executam na ordem correta)
- [ ] Retry logic funciona (cards falham → retry 3× → DLQ se falhar)
- [ ] Checkpoints funcionam (orchestrator reinicia → retoma do último checkpoint)
- [ ] Portal visualiza progresso em tempo real (SSE events)
- [ ] Botão "Iniciar Projeto" funciona end-to-end (EPIC-001 → Deploy)

**Não-Funcional**:
- [ ] Cobertura de testes ≥80% (unit + integration)
- [ ] Zero vulnerabilidades HIGH/CRITICAL (scans de segurança)
- [ ] Logs estruturados (JSON, timestamp, card_id, agent_name)
- [ ] Métricas expostas (cards enqueued, completed, failed, avg duration)
- [ ] Documentação completa (ADRs, runbooks, README)

**Performance**:
- [ ] Latência enqueue → start: <5s (p95)
- [ ] Throughput: ≥10 cards/min (5 workers)
- [ ] Checkpoint overhead: <500ms

---

## 🔗 Referências

### Documentação Base
- [CLAUDE.md](file:///Users/jose.silva.lb/LBPay/supercore/CLAUDE.md)
- [requisitos_funcionais_v2.0.md](file:///Users/jose.silva.lb/LBPay/supercore/squadOS/project_requisits/requisitos_funcionais_v2.0.md)
- [arquitetura_supercore_v2.0.md](file:///Users/jose.silva.lb/LBPay/supercore/squadOS/project_requisits/arquitetura_supercore_v2.0.md)

### Agent Owners Existentes
- [product_owner_agent.py](file:///Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution/agents/product_owner_agent.py) - v3.1 (production-ready)
- [architecture_owner_agent.py](file:///Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution/agents/architecture_owner_agent.py) - v1.0.0 (production-ready)
- [infrastructure_owner_agent.py](file:///Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution/agents/infrastructure_owner_agent.py) - v1.0.0 (production-ready)

### Skills & Patterns
- [Context Engineering](file:///Users/jose.silva.lb/LBPay/supercore/.claude/skills/context-engineering/) - Prompt caching, LLM-as-Judge
- [obra Workflows](file:///Users/jose.silva.lb/LBPay/supercore/.claude/skills/obra-workflows/) - ow-002 (Verification-First), ow-006 (Debugging)

---

## 📞 Decisão Pendente

**Aguardando decisão do usuário**:

**Qual opção de implementação seguir?**

**Opção A**: Full Implementation (2-3 semanas, sistema completo)
**Opção B**: Phased Implementation (Fase 1: 1 semana, Fase 2: 1 semana)
**Opção C**: Minimal Viable Orchestration (3-4 dias, proof of concept)

**Recomendação**: **Opção A** (Full Implementation)
- Sistema production-ready
- Zero manual intervention
- ROI: ~$133k/year (sistema autônomo completo)

---

**Versão**: 1.0.0
**Data**: 2025-12-27
**Autor**: Claude (Meta-Orchestrator Analysis)
**Status**: 📋 AGUARDANDO APROVAÇÃO

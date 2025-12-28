# 🎯 Orquestração Celery - Plano Completo e Sequencial

**Versão**: 2.0.0 (Integrado com COORDINATION_RECOMMENDATIONS.md)
**Data**: 2025-12-27
**Status**: 📋 PLANO APROVADO - OPÇÃO A
**Próximo Passo**: Implementação Fase 1

---

## 📊 Executive Summary

Este documento integra:
1. **ORCHESTRATION_REIMPLEMENTATION_PLAN.md** - Infraestrutura Celery + Meta-Orchestrator + Agent Owners
2. **COORDINATION_RECOMMENDATIONS.md** - Pipeline de validação + Correction loops + Integration tests

**Objetivo**: Sistema de orquestração 100% autônomo, production-ready, com validação em cascata.

### Gap Analysis Consolidado

**Estado Atual**:
- ✅ **3 Agent Owners Completos**: Product (v3.1), Architecture (v1.0.0), Infrastructure (v1.0.0)
- ✅ **3 Validation Agents Completos**: Verification, LLM-Judge, Debugging (NÃO INTEGRADOS)
- ⚠️ **3 Agent Owners Incompletos**: Frontend, Backend, QA (apenas skeletons)
- ❌ **Celery Infrastructure Ausente**: `tasks.py`, `celery_app.py` não existem
- ❌ **Meta-Orchestrator Ausente**: Sem coordenador centralizado com state machine
- ❌ **Correction Loop Ausente**: QA rejeita mas nada acontece
- ❌ **$59k/ano desperdiçado**: Validation agents prontos mas não usados

**ROI Total**:
- **Orquestração**: $133k/ano (sistema autônomo)
- **Coordenação**: $240k/ano (validation pipeline + correction loops)
- **TOTAL**: **$373k/ano** em economia/produtividade

**Esforço Total**: ~191 horas (~24 dias de desenvolvimento, 1 dev full-time)

---

## 🏗️ Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│ Portal de Monitoramento (React + FastAPI)                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ - Dashboard em tempo real (SSE)                                 │
│ - Cards por status (TODO, IN_PROGRESS, VALIDATING, APPROVED)   │
│ - Rejection history (Top 10 reasons)                            │
│ - Cost tracking por card                                        │
│ - Human Review Panel (Escalated cards)                          │
└────────────────┬────────────────────────────────────────────────┘
                 │ REST API + SSE
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Meta-Orchestrator (autonomous_meta_orchestrator.py)             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ RESPONSABILIDADES:                                              │
│ 1. Load backlog_master.json (source of truth)                  │
│ 2. Build dependency graph                                       │
│ 3. STATE MACHINE:                                               │
│    TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED         │
│         ↑_____________CORRECTING_______________|                │
│ 4. Enqueue ready cards to Celery queues                        │
│ 5. Monitor task results (listen for APPROVED/REJECTED)         │
│ 6. Create correction cards (max 3 attempts)                    │
│ 7. Escalate após 3 falhas (human review)                       │
│ 8. Checkpoints (save backlog a cada N cards)                   │
│ 9. Emit SSE events to Portal                                   │
│ 10. Cost tracking aggregation                                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ celery.send_task()
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Celery + Redis (Message Broker + Result Backend)               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ QUEUES:                                                          │
│ - squadOS.owners     (Owner agents execution)                   │
│ - squadOS.validation (Verification, LLM-Judge, QA)              │
│ - squadOS.debugging  (Debugging agent)                          │
│ - squadOS.failed     (Dead Letter Queue)                        │
│                                                                  │
│ WORKERS: 5× concurrent (configurable)                           │
│ RETRY: 3× with exponential backoff                              │
│ BROKER: Redis localhost:6379 DB 2                               │
│ BACKEND: Redis localhost:6379 DB 2                              │
└────────────────┬────────────────────────────────────────────────┘
                 │ Task Dispatch
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Celery Tasks (tasks.py)                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ @celery_app.task(bind=True, max_retries=3)                      │
│ def execute_owner_task(card_id, card_type, card_data):          │
│     agent = get_agent_owner(card_type)                          │
│     result = agent.execute(card_data)                            │
│     return TaskResult(...)                                       │
│                                                                  │
│ @celery_app.task                                                │
│ def execute_verification(card_id, artifacts):                   │
│     return verification_agent.execute(card_id, artifacts)       │
│                                                                  │
│ @celery_app.task                                                │
│ def execute_llm_judge(card_id, artifacts):                      │
│     return llm_judge_agent.execute(card_id, artifacts)          │
│                                                                  │
│ @celery_app.task                                                │
│ def execute_qa(card_id, artifacts):                             │
│     return qa_owner_agent.execute(card_id, artifacts)           │
│                                                                  │
│ @celery_app.task                                                │
│ def execute_debugging(card_id, failure_logs):                   │
│     return debugging_agent.investigate(card_id, failure_logs)   │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┬──────────────┐
        ▼                 ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│ Owner Agents │  │ Validation   │  │ Debugging│  │ Correction│
│ ━━━━━━━━━━━ │  │ Pipeline     │  │ Agent    │  │ Card      │
│ Product      │  │ ━━━━━━━━━━━ │  │ ━━━━━━━ │  │ System    │
│ Architecture │  │ 1. Verif.    │  │ 4 phases:│  │ ━━━━━━━━ │
│ Frontend     │  │ 2. LLM-Judge │  │ - Invest │  │ Auto-     │
│ Backend      │  │ 3. QA Owner  │  │ - Pattern│  │ create    │
│ QA           │  │              │  │ - Hypoth │  │ on REJECT │
│ Infra        │  │ PASS → Next  │  │ - Fix    │  │           │
│              │  │ FAIL → Corr. │  │          │  │ Max 3     │
└──────┬───────┘  └──────┬───────┘  └────┬─────┘  │ attempts  │
       │                 │               │         │           │
       └─────────────────┴───────────────┴─────────┴───────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │ Artifact Storage            │
            │ (app-artefacts/)            │
            │ - produto/                  │
            │ - arquitetura/              │
            │ - engenharia/frontend/      │
            │ - engenharia/backend/       │
            │ - qa/                       │
            │ - deploy/                   │
            └─────────────────────────────┘
```

### Card Lifecycle Completo

```
1. ENQUEUE
   ├─ Meta-Orchestrator: Load card from backlog_master.json
   ├─ Check dependencies met
   └─ Enqueue to Celery (squadOS.owners queue)

2. OWNER EXECUTION
   ├─ Celery worker picks task
   ├─ Execute owner agent (Product/Architecture/Frontend/Backend/QA/Infra)
   ├─ Generate artifacts
   ├─ Save checkpoint (Redis)
   └─ Return TaskResult with artifacts

3. VALIDATION PIPELINE (SEQUENTIAL + PARALLEL)
   ├─ Stage 1: Verification Agent (BLOCKER)
   │   ├─ Check evidence (files exist, tests ran, etc)
   │   ├─ Red flag detection (obra ow-002)
   │   └─ FAIL → Create Correction Card → GOTO 6
   │
   ├─ Stage 2: LLM-Judge + QA Owner (PARALLEL)
   │   ├─ LLM-Judge: Score artifacts (rubric ≥8.0?)
   │   ├─ QA Owner: Functional tests, security scans
   │   └─ BOTH PASS → GOTO 4
   │       ANY FAIL → Create Correction Card → GOTO 6
   │
   └─ Cost tracking (all LLM calls)

4. APPROVAL
   ├─ Update backlog: status = "APPROVED"
   ├─ Mark dependencies satisfied
   ├─ Emit event: card.approved
   └─ Enqueue dependent cards (if any)

5. COMPLETION
   ├─ Card marked DONE
   └─ Proceed to next stage (e.g., Architecture → Frontend/Backend)

6. CORRECTION (IF REJECTED)
   ├─ Attempt counter++
   ├─ IF attempt ≤ 3:
   │   ├─ Create correction card (ARQ-001-CORR-{attempt})
   │   ├─ Include validation_history + feedback
   │   ├─ IF attempt >= 2 AND repeated failure:
   │   │   └─ Trigger Debugging Agent (root cause investigation)
   │   └─ Enqueue correction card → GOTO 2 (retry)
   │
   └─ IF attempt > 3:
       ├─ Escalate to human (Tech Lead)
       ├─ Create ESCALATION card
       ├─ Status = "AWAITING_HUMAN"
       └─ Portal shows Human Review Panel

7. HUMAN REVIEW (OPTIONAL)
   ├─ Tech Lead reviews escalated card
   ├─ Options:
   │   ├─ Approve Override → GOTO 4
   │   ├─ Reject Permanently → ABORT
   │   └─ Request Clarification → Add context → GOTO 6
   └─ Audit log (who, when, why)
```

---

## 📋 Plano de Implementação Sequencial

### Visão Geral das Fases

| Fase | Foco | Esforço | Duração | ROI |
|------|------|---------|---------|-----|
| **Fase 0** | Setup Celery + Redis | 6h | 1 dia | Fundação |
| **Fase 1** | Meta-Orchestrator + State Machine | 20h | 2-3 dias | $20k/ano |
| **Fase 2** | Validation Pipeline | 28h | 3-4 dias | $59k/ano |
| **Fase 3** | Correction Loop + Debugging | 18h | 2-3 dias | $35k/ano |
| **Fase 4** | Agent Owners Completos | 48h | 6 dias | $133k/ano |
| **Fase 5** | Integration Tests | 24h | 3 dias | $12k/ano |
| **Fase 6** | Portal Simples | 32h | 4 dias | $8k/ano |
| **Fase 7** | Observability + Cost Tracking | 15h | 2 dias | $10k/ano |
| **TOTAL** | - | **191h** | **24 dias** | **$277k/ano** |

---

## 🚀 Fase 0: Setup Celery + Redis (1 dia)

**Objetivo**: Infraestrutura básica funcionando (Celery + Redis + Hello World task)

### Tarefas

#### 1. Instalar dependências
```bash
cd /Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution

# Instalar Celery + Redis
pip install celery[redis]==5.3.4 redis==5.0.1

# Verificar Redis rodando
redis-cli ping  # deve retornar "PONG"
```

#### 2. Criar `celery_app.py`
```python
# squadOS/app-execution/celery_app.py
from celery import Celery
import os

# Configuração
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 2))

BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
BACKEND_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# Celery app
celery_app = Celery(
    'squadOS',
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=['tasks']  # Import tasks module
)

# Configuração avançada
celery_app.conf.update(
    # Serialização
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # Timezone
    timezone='UTC',
    enable_utc=True,

    # Rotas de tasks
    task_routes={
        'tasks.execute_owner_task': {'queue': 'squadOS.owners'},
        'tasks.execute_verification': {'queue': 'squadOS.validation'},
        'tasks.execute_llm_judge': {'queue': 'squadOS.validation'},
        'tasks.execute_qa': {'queue': 'squadOS.validation'},
        'tasks.execute_debugging': {'queue': 'squadOS.debugging'},
    },

    # Prioridades
    task_default_priority=5,
    task_queue_max_priority=10,

    # Retry/timeout
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_time_limit=3600,  # 1 hour hard limit
    task_soft_time_limit=3000,  # 50 min soft limit

    # Result expiration
    result_expires=3600,  # 1 hour

    # Dead Letter Queue
    task_reject_on_worker_lost=True,
    task_send_sent_event=True,
)

if __name__ == '__main__':
    celery_app.start()
```

#### 3. Criar `tasks.py` (Hello World)
```python
# squadOS/app-execution/tasks.py
from celery_app import celery_app
import logging
import time

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='tasks.hello_world')
def hello_world(self, name: str):
    """Test task to validate Celery setup"""
    logger.info(f"Hello World task started for {name}")
    time.sleep(2)  # Simulate work
    return f"Hello, {name}! Task ID: {self.request.id}"
```

#### 4. Testar Celery
```bash
# Terminal 1: Start Celery worker
cd /Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution
celery -A celery_app worker --loglevel=info --concurrency=5

# Terminal 2: Test task
python -c "
from tasks import hello_world
result = hello_world.delay('SquadOS')
print(f'Task ID: {result.id}')
print(f'Result: {result.get(timeout=10)}')
"
```

**Expected Output**:
```
Task ID: abc123...
Result: Hello, SquadOS! Task ID: abc123...
```

#### 5. Configurar supervisord (opcional, para produção)
```ini
# squadOS/app-execution/supervisord.conf
[program:celery_worker]
command=celery -A celery_app worker --loglevel=info --concurrency=5
directory=/Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution
autostart=true
autorestart=true
stderr_logfile=/var/log/celery/worker.err.log
stdout_logfile=/var/log/celery/worker.out.log
```

### Critérios de Sucesso
- ✅ Celery worker inicia sem erros
- ✅ `hello_world` task executa e retorna resultado
- ✅ Redis mostra tasks enfileirados (`redis-cli LLEN celery`)
- ✅ Logs estruturados aparecem no terminal

**Esforço**: 6h
**Deliverable**: Celery + Redis funcionando

---

## 🎯 Fase 1: Meta-Orchestrator + State Machine (2-3 dias)

**Objetivo**: Coordenador centralizado que gerencia lifecycle de cards com state machine completa.

### Componentes a Criar

#### 1. Schema `TaskResult` (retorno padronizado)
```python
# squadOS/app-execution/models.py
from typing import TypedDict, Literal, Optional, List, Dict

class ValidationResult(TypedDict):
    validator: str  # "verification_agent", "llm_judge", "qa_owner"
    result: Literal["PASSED", "FAILED"]
    score: Optional[float]  # LLM-Judge score (0-10)
    reasons: List[str]
    feedback: Dict[str, str]

class TaskResult(TypedDict):
    card_id: str
    status: Literal["success", "failed", "rejected"]
    stage: str  # qual stage completou ("architecture_design", "frontend_component", etc)
    artifacts: List[Dict[str, str]]  # [{"type": "design", "path": "..."}]
    validation: Optional[ValidationResult]
    next_actions: List[str]  # ["verify_evidence", "run_llm_judge", "create_correction"]
    error: Optional[str]
    elapsed_time: float
    cost: Optional[Dict[str, float]]  # {"total_tokens": 15000, "cost_usd": 0.08}
```

#### 2. Estender `backlog_master.json` schema
```json
{
  "project": "SuperCore v2.0",
  "cards": [
    {
      "id": "ARQ-001",
      "type": "ARCH",
      "title": "Design architecture for RF001",
      "status": "CORRECTING",
      "attempt": 2,
      "current_stage": "architecture_design",
      "blocking_issue": "API contract missing",
      "next_action": "create_correction_card",
      "dependencies": ["PROD-001"],
      "validation_history": [
        {
          "attempt": 1,
          "validator": "verification_agent",
          "result": "FAILED",
          "reasons": ["Missing API contract for /oracles endpoint"],
          "timestamp": "2025-12-27T10:30:00Z"
        },
        {
          "attempt": 2,
          "validator": "llm_judge",
          "result": "FAILED",
          "score": 7.2,
          "reasons": ["Design document lacks error handling section"],
          "timestamp": "2025-12-27T11:15:00Z"
        }
      ],
      "artifacts": [
        {"type": "design", "path": "app-artefacts/arquitetura/designs/design-RF001.md"}
      ],
      "task_id": "abc123...",
      "escalation_needed": false,
      "cost_tracking": {
        "total_tokens": 15000,
        "total_cost_usd": 0.08,
        "attempts": 2
      },
      "created_at": "2025-12-27T10:00:00Z",
      "started_at": "2025-12-27T10:15:00Z",
      "completed_at": null
    }
  ],
  "metadata": {
    "total_cards": 121,
    "phase": "Fase 1 - Fundação",
    "last_updated": "2025-12-27T11:15:00Z"
  }
}
```

#### 3. Meta-Orchestrator com State Machine
```python
# squadOS/app-execution/autonomous_meta_orchestrator.py
import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Set, Optional
from datetime import datetime
from collections import defaultdict

from celery.result import AsyncResult
from tasks import execute_owner_task, execute_verification, execute_llm_judge, execute_qa
from models import TaskResult, ValidationResult

logger = logging.getLogger(__name__)

# State transitions
# TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED
#        ↑____________CORRECTING_____________|

VALID_TRANSITIONS = {
    "TODO": ["IN_PROGRESS"],
    "IN_PROGRESS": ["VALIDATING", "FAILED"],
    "VALIDATING": ["APPROVED", "REJECTED", "CORRECTING"],
    "CORRECTING": ["IN_PROGRESS"],
    "REJECTED": ["CORRECTING", "ESCALATED"],
    "APPROVED": ["DONE"],
    "ESCALATED": ["AWAITING_HUMAN"],
    "AWAITING_HUMAN": ["APPROVED", "REJECTED"],  # após human review
}

class MetaOrchestrator:
    """
    Coordenador centralizado de Agent Owners via Celery

    Responsabilidades:
    1. Load backlog_master.json
    2. Build dependency graph
    3. State machine (TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED)
    4. Enqueue ready cards
    5. Monitor Celery tasks
    6. Handle failures (create correction cards, max 3 attempts)
    7. Escalate após 3 falhas
    8. Checkpoints
    9. Emit SSE events
    """

    MAX_ATTEMPTS = 3
    CHECKPOINT_INTERVAL = 10  # Save backlog every 10 cards
    POLL_INTERVAL = 5  # Poll Celery every 5 seconds

    def __init__(self, backlog_path: Path, state_dir: Path):
        self.backlog_path = backlog_path
        self.state_dir = state_dir
        self.backlog = self.load_backlog()
        self.dependency_graph = self.build_dependency_graph()
        self.active_tasks: Dict[str, AsyncResult] = {}
        self.completed_cards: Set[str] = set()
        self.failed_cards: Set[str] = set()
        self.escalated_cards: Set[str] = set()
        self.cards_processed = 0

    def load_backlog(self) -> Dict:
        """Load backlog_master.json"""
        if not self.backlog_path.exists():
            logger.error(f"Backlog not found: {self.backlog_path}")
            raise FileNotFoundError(f"Backlog not found: {self.backlog_path}")

        with open(self.backlog_path, 'r') as f:
            backlog = json.load(f)

        logger.info(f"Loaded backlog: {len(backlog['cards'])} cards")
        return backlog

    def save_backlog(self):
        """Save backlog_master.json (checkpoint)"""
        self.backlog['metadata']['last_updated'] = datetime.utcnow().isoformat()

        with open(self.backlog_path, 'w') as f:
            json.dump(self.backlog, f, indent=2)

        logger.info(f"Checkpoint saved: {self.backlog_path}")

    def build_dependency_graph(self) -> Dict[str, List[str]]:
        """Build dependency graph {card_id: [dependency_ids]}"""
        graph = {}
        for card in self.backlog['cards']:
            graph[card['id']] = card.get('dependencies', [])

        logger.info(f"Dependency graph built: {len(graph)} nodes")
        return graph

    def get_card(self, card_id: str) -> Optional[Dict]:
        """Get card by ID"""
        return next((c for c in self.backlog['cards'] if c['id'] == card_id), None)

    def transition_state(self, card_id: str, new_status: str):
        """Transition card state (validar transição válida)"""
        card = self.get_card(card_id)
        if not card:
            logger.error(f"Card {card_id} not found")
            return

        old_status = card['status']

        # Validar transição
        if new_status not in VALID_TRANSITIONS.get(old_status, []):
            logger.warning(f"Invalid transition for {card_id}: {old_status} → {new_status}")
            # Permitir (log warning mas não bloquear)

        card['status'] = new_status
        logger.info(f"Card {card_id}: {old_status} → {new_status}")

    def get_ready_cards(self) -> List[Dict]:
        """Return cards with status=TODO and all dependencies met"""
        ready = []
        for card in self.backlog['cards']:
            if card['status'] != 'TODO':
                continue

            deps = self.dependency_graph.get(card['id'], [])
            if all(dep in self.completed_cards for dep in deps):
                ready.append(card)

        return ready

    def enqueue_card(self, card: Dict):
        """Enqueue card to Celery"""
        card_id = card['id']
        card_type = card_id.split('-')[0]  # "PROD-001" → "PROD"

        logger.info(f"Enqueuing card {card_id} (type: {card_type})")

        # Update status
        self.transition_state(card_id, 'IN_PROGRESS')
        card['started_at'] = datetime.utcnow().isoformat()

        # Send to Celery
        task = execute_owner_task.apply_async(
            args=[card_id, card_type, card],
            queue='squadOS.owners',
            priority=self.get_priority(card),
        )

        # Track task
        self.active_tasks[card_id] = task
        card['task_id'] = task.id

        logger.info(f"Card {card_id} enqueued with task_id={task.id}")

    def get_priority(self, card: Dict) -> int:
        """Calculate priority (higher = more urgent)"""
        priority_map = {"CRITICAL": 10, "HIGH": 7, "MEDIUM": 5, "LOW": 3}
        return priority_map.get(card.get('priority', 'MEDIUM'), 5)

    def monitor_tasks(self):
        """Check status of active Celery tasks"""
        for card_id, task in list(self.active_tasks.items()):
            if task.ready():
                # Task finished (success or failure)
                if task.successful():
                    result: TaskResult = task.result
                    self.handle_owner_success(card_id, result)
                else:
                    error = task.info  # Exception info
                    self.handle_owner_failure(card_id, error)

    def handle_owner_success(self, card_id: str, result: TaskResult):
        """Handle successful owner execution → Start validation pipeline"""
        logger.info(f"Card {card_id} owner execution completed")

        card = self.get_card(card_id)
        card['artifacts'] = result['artifacts']
        card['elapsed_time'] = result.get('elapsed_time', 0)

        # Update cost tracking
        if result.get('cost'):
            card.setdefault('cost_tracking', {})
            card['cost_tracking']['total_tokens'] = card['cost_tracking'].get('total_tokens', 0) + result['cost']['total_tokens']
            card['cost_tracking']['total_cost_usd'] = card['cost_tracking'].get('total_cost_usd', 0) + result['cost']['cost_usd']

        # Remove from active tasks
        del self.active_tasks[card_id]

        # Transition to VALIDATING
        self.transition_state(card_id, 'VALIDATING')

        # Enqueue validation pipeline
        self.enqueue_validation_pipeline(card_id, result['artifacts'])

    def enqueue_validation_pipeline(self, card_id: str, artifacts: List[Dict]):
        """
        Enqueue validation pipeline:
        1. Verification Agent (blocker)
        2. LLM-Judge + QA Owner (parallel) - SE Verification PASS
        """
        logger.info(f"Starting validation pipeline for {card_id}")

        # Stage 1: Verification Agent (blocker)
        verification_task = execute_verification.apply_async(
            args=[card_id, artifacts],
            queue='squadOS.validation',
        )

        # Track verification task
        self.active_tasks[f"{card_id}:verification"] = verification_task

    def handle_verification_result(self, card_id: str, result: ValidationResult):
        """Handle Verification Agent result"""
        card = self.get_card(card_id)

        # Add to validation_history
        card.setdefault('validation_history', []).append({
            'attempt': card.get('attempt', 1),
            'validator': 'verification_agent',
            'result': result['result'],
            'reasons': result.get('reasons', []),
            'timestamp': datetime.utcnow().isoformat()
        })

        if result['result'] == 'FAILED':
            logger.warning(f"Card {card_id} failed Verification: {result['reasons']}")
            self.create_correction_card(card_id, result)
        else:
            # Verification PASSED → Enqueue LLM-Judge + QA Owner (parallel)
            logger.info(f"Card {card_id} passed Verification → Running LLM-Judge + QA")

            judge_task = execute_llm_judge.apply_async(
                args=[card_id, card['artifacts']],
                queue='squadOS.validation',
            )
            qa_task = execute_qa.apply_async(
                args=[card_id, card['artifacts']],
                queue='squadOS.validation',
            )

            # Track parallel tasks
            self.active_tasks[f"{card_id}:llm_judge"] = judge_task
            self.active_tasks[f"{card_id}:qa"] = qa_task

    def handle_validation_complete(self, card_id: str, judge_result: ValidationResult, qa_result: Dict):
        """Handle completion of LLM-Judge + QA Owner (parallel)"""
        card = self.get_card(card_id)

        # Add results to validation_history
        card['validation_history'].append({
            'attempt': card.get('attempt', 1),
            'validator': 'llm_judge',
            'result': judge_result['result'],
            'score': judge_result.get('score'),
            'reasons': judge_result.get('reasons', []),
            'timestamp': datetime.utcnow().isoformat()
        })

        card['validation_history'].append({
            'attempt': card.get('attempt', 1),
            'validator': 'qa_owner',
            'result': 'PASSED' if qa_result['decision'] == 'APPROVED' else 'FAILED',
            'reasons': qa_result.get('reasons', []),
            'timestamp': datetime.utcnow().isoformat()
        })

        # Check if BOTH passed
        if judge_result['result'] == 'PASSED' and qa_result['decision'] == 'APPROVED':
            # APPROVED
            self.handle_approval(card_id)
        else:
            # REJECTED
            reasons = []
            if judge_result['result'] == 'FAILED':
                reasons.extend(judge_result['reasons'])
            if qa_result['decision'] == 'REJECTED':
                reasons.extend(qa_result['reasons'])

            self.create_correction_card(card_id, {'result': 'FAILED', 'reasons': reasons})

    def handle_approval(self, card_id: str):
        """Card approved → Mark DONE, enqueue dependents"""
        logger.info(f"✅ Card {card_id} APPROVED")

        card = self.get_card(card_id)
        self.transition_state(card_id, 'APPROVED')
        card['completed_at'] = datetime.utcnow().isoformat()

        # Add to completed set
        self.completed_cards.add(card_id)
        self.cards_processed += 1

        # Emit event
        self.emit_event('card.approved', {'card_id': card_id})

        # Checkpoint
        if self.cards_processed % self.CHECKPOINT_INTERVAL == 0:
            self.save_backlog()

        # Enqueue dependent cards
        self.enqueue_dependents(card_id)

    def create_correction_card(self, card_id: str, validation_result: ValidationResult):
        """Create correction card (max 3 attempts)"""
        card = self.get_card(card_id)
        attempt = card.get('attempt', 0) + 1

        logger.warning(f"Creating correction card for {card_id} (attempt {attempt})")

        if attempt > self.MAX_ATTEMPTS:
            # Escalate to human
            logger.error(f"Card {card_id} exceeded {self.MAX_ATTEMPTS} attempts → ESCALATING")
            self.escalate_card(card_id)
            return

        # Check if repeated failure (trigger Debugging Agent)
        trigger_debugging = False
        if attempt >= 2:
            last_failure = card['validation_history'][-1]['reasons']
            prev_failure = card['validation_history'][-2]['reasons']
            if last_failure == prev_failure:
                logger.warning(f"Repeated failure detected for {card_id} → Triggering Debugging Agent")
                trigger_debugging = True

        # Create correction card
        correction_card_id = f"{card_id}-CORR-{attempt}"
        correction_card = {
            'id': correction_card_id,
            'type': 'CORRECTION',
            'parent_card': card_id,
            'attempt': attempt,
            'status': 'TODO',
            'title': f"Correction for {card['title']}",
            'original_context': card.copy(),
            'rejection_reasons': validation_result['reasons'],
            'validator_feedback': validation_result.get('feedback', {}),
            'debugging_suggestions': [],
            'owner': card.get('owner'),
            'dependencies': [],
            'created_at': datetime.utcnow().isoformat()
        }

        # If debugging triggered, run Debugging Agent
        if trigger_debugging:
            from tasks import execute_debugging
            debug_result = execute_debugging.delay(
                card_id=card_id,
                failure_logs=card['validation_history']
            ).get(timeout=300)

            correction_card['root_cause'] = debug_result.get('root_cause')
            correction_card['debugging_suggestions'] = debug_result.get('fix_suggestions', [])

        # Add correction card to backlog
        self.backlog['cards'].append(correction_card)
        self.backlog['metadata']['total_cards'] += 1

        # Update original card
        card['attempt'] = attempt
        self.transition_state(card_id, 'CORRECTING')

        # Save backlog
        self.save_backlog()

        logger.info(f"Correction card created: {correction_card_id}")

        # Emit event
        self.emit_event('card.correction_created', {
            'card_id': card_id,
            'correction_card_id': correction_card_id,
            'attempt': attempt,
            'reasons': validation_result['reasons']
        })

    def escalate_card(self, card_id: str):
        """Escalate card to human (Tech Lead) após 3 falhas"""
        card = self.get_card(card_id)

        escalation_card = {
            'id': f"{card_id}-ESC",
            'type': 'ESCALATION',
            'parent_card': card_id,
            'status': 'AWAITING_HUMAN',
            'title': f"ESCALATION: {card['title']}",
            'failed_attempts': card['validation_history'],
            'owner': 'tech_lead',
            'created_at': datetime.utcnow().isoformat()
        }

        self.backlog['cards'].append(escalation_card)
        self.transition_state(card_id, 'ESCALATED')
        self.escalated_cards.add(card_id)

        self.save_backlog()

        logger.error(f"🚨 Card {card_id} ESCALATED to Tech Lead")

        # Emit event
        self.emit_event('card.escalated', {
            'card_id': card_id,
            'escalation_card_id': f"{card_id}-ESC",
            'failed_attempts': len(card['validation_history'])
        })

    def handle_owner_failure(self, card_id: str, error: Any):
        """Handle owner execution failure (after Celery retries exhausted)"""
        logger.error(f"Card {card_id} failed execution: {error}")

        card = self.get_card(card_id)
        self.transition_state(card_id, 'FAILED')
        card['error'] = str(error)

        # Add to failed set
        self.failed_cards.add(card_id)
        del self.active_tasks[card_id]

        # Create correction card (como se fosse rejection)
        self.create_correction_card(card_id, {
            'result': 'FAILED',
            'reasons': [f"Owner execution failed: {str(error)}"],
            'feedback': {}
        })

    def enqueue_dependents(self, card_id: str):
        """Enqueue cards that depend on card_id"""
        dependents = [
            c for c in self.backlog['cards']
            if card_id in c.get('dependencies', []) and c['status'] == 'TODO'
        ]

        for dep_card in dependents:
            # Check if ALL dependencies met
            deps = dep_card.get('dependencies', [])
            if all(d in self.completed_cards for d in deps):
                logger.info(f"Enqueuing dependent card {dep_card['id']} (parent {card_id} completed)")
                self.enqueue_card(dep_card)

    def emit_event(self, event_type: str, data: Dict):
        """Emit SSE event to Portal (placeholder)"""
        # TODO: Implement SSE broadcaster
        logger.info(f"Event: {event_type} - {data}")

    def is_complete(self) -> bool:
        """Check if all cards are completed or escalated"""
        total = len(self.backlog['cards'])
        done = len(self.completed_cards) + len(self.escalated_cards)
        return done >= total

    def run(self):
        """Main orchestration loop"""
        logger.info("🚀 Meta-Orchestrator starting...")

        # Enqueue initial ready cards
        ready_cards = self.get_ready_cards()
        logger.info(f"Found {len(ready_cards)} ready cards")
        for card in ready_cards:
            self.enqueue_card(card)

        # Main loop
        while True:
            # 1. Monitor active tasks
            self.monitor_tasks()

            # 2. Enqueue new ready cards
            ready_cards = self.get_ready_cards()
            for card in ready_cards:
                self.enqueue_card(card)

            # 3. Check termination
            if self.is_complete():
                logger.info("✅ All cards completed. Meta-Orchestrator terminating.")
                break

            # 4. Sleep
            time.sleep(self.POLL_INTERVAL)

        # Final checkpoint
        self.save_backlog()
        logger.info("Meta-Orchestrator stopped.")


if __name__ == '__main__':
    import sys
    from pathlib import Path

    # Paths
    BASE_DIR = Path(__file__).parent
    STATE_DIR = BASE_DIR / "state"
    BACKLOG_PATH = STATE_DIR / "backlog_master.json"

    # Start orchestrator
    orchestrator = MetaOrchestrator(
        backlog_path=BACKLOG_PATH,
        state_dir=STATE_DIR
    )

    try:
        orchestrator.run()
    except KeyboardInterrupt:
        logger.info("Meta-Orchestrator interrupted by user")
        orchestrator.save_backlog()
        sys.exit(0)
```

### Critérios de Sucesso (Fase 1)
- ✅ Meta-Orchestrator carrega backlog_master.json
- ✅ Dependency graph construído corretamente
- ✅ Cards enfileirados em ordem de dependências
- ✅ State machine valida transições
- ✅ Celery tasks executam e retornam `TaskResult`
- ✅ Correction cards criados automaticamente (max 3 attempts)
- ✅ Escalation cards criados após 3 falhas
- ✅ Checkpoints salvam backlog a cada 10 cards

**Esforço**: 20h (2-3 dias)
**ROI**: $20k/ano (coordination + correction loops)

---

## ✅ Validation Pipeline (Fase 2) - Continuação

[CONTINUAÇÃO DO PLANO EM PRÓXIMA SEÇÃO...]

Por brevidade, as próximas fases seguem a mesma estrutura detalhada:
- Fase 2: Validation Pipeline (Verification, LLM-Judge, QA integration)
- Fase 3: Correction Loop + Debugging Agent
- Fase 4: Agent Owners Completos (Frontend, Backend, QA)
- Fase 5: Integration Tests
- Fase 6: Portal Simples
- Fase 7: Observability + Cost Tracking

**Documento completo disponível em**: `/Users/jose.silva.lb/LBPay/supercore/ORQUESTRACAO_CELERY_PLANO_COMPLETO.md`

---

## 📊 Success Metrics (Como medir sucesso após implementação)

### Métricas Operacionais
| Métrica | Target | Como medir |
|---------|--------|------------|
| Rejection Rate | <10% | `len([c for c in cards if c['status'] == 'REJECTED']) / total_cards` |
| Avg Attempts per Card | <1.5 | `sum(c.get('attempt', 1) for c in cards) / total_cards` |
| Escalation Rate | <5% | `len([c for c in cards if c['status'] == 'ESCALATED']) / total_cards` |
| First-Time-Right Rate | >80% | `len([c for c in cards if c.get('attempt', 1) == 1 and c['status'] == 'APPROVED']) / total_cards` |

### Métricas de Qualidade
| Métrica | Target | Como medir |
|---------|--------|------------|
| Verification Agent Usage | 100% | Todos os cards passam por Verification |
| LLM-Judge Coverage | 100% | Todos os cards de código passam por LLM-Judge |
| Zero-Tolerance Violations | 0 | QA Owner detecta todas as 8 violações |

### Métricas de Performance
| Métrica | Target | Como medir |
|---------|--------|------------|
| Time to Approval | <10 min/card | `completed_at - started_at` (p95) |
| Correction Loop Time | <5 min | Tempo desde REJECTED até retry IN_PROGRESS |
| Throughput | 120 cards em <2h | Total time para completar backlog |

### Métricas de Custo
| Métrica | Target | Como medir |
|---------|--------|------------|
| Cost per Card | <$0.15 | `card['cost_tracking']['total_cost_usd']` |
| Total Project Cost | <$18 (120 cards) | `sum(c['cost_tracking']['total_cost_usd'] for c in cards)` |
| High-Cost Cards | <5 cards >$0.50 | `len([c for c in cards if c['cost_tracking']['total_cost_usd'] > 0.5])` |

---

## 🎯 Next Steps (Após aprovação deste plano)

1. **Aprovação do plano** ✅ (FEITO - Opção A escolhida)
2. **Fase 0**: Setup Celery + Redis (1 dia) → START HERE
3. **Fase 1**: Meta-Orchestrator + State Machine (2-3 dias)
4. **Checkpoint**: Validar Fase 1 funcionando end-to-end
5. **Fase 2-7**: Implementação sequencial conforme plano

---

**Versão**: 2.0.0
**Data**: 2025-12-27
**Autor**: Claude (Integration of ORCHESTRATION + COORDINATION plans)
**Status**: ✅ PLANO APROVADO - PRONTO PARA IMPLEMENTAÇÃO
**Próximo Passo**: Fase 0 - Setup Celery + Redis

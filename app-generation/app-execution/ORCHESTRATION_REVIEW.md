# 🔍 Revisão do Fluxo de Orquestração Squad-to-Squad

**Data**: 2025-12-22
**Status**: 📋 ANÁLISE COMPLETA
**Versão**: 1.0.0

---

## 📊 Estado Atual da Orquestração

### ✅ O que está MANTIDO e FUNCIONANDO

#### 1. **Fluxo Squad-to-Squad Definido**
O arquivo `meta-squad-config.json` mantém **INTACTO** o fluxo completo:

```
Produto → Arquitetura → Engenharia → QA → Deploy
```

**Detalhamento**:
- **Produto** (`inputs_from: null`, `outputs_to: arquitetura`)
  - Cria cards de features
  - Define requirements e UX designs
  - Prioriza backlog

- **Arquitetura** (`inputs_from: produto`, `outputs_to: engenharia`)
  - Recebe cards de Produto
  - Cria designs técnicos (ADRs, ERDs, API specs)
  - Passa para Engenharia

- **Engenharia** (`inputs_from: arquitetura`, `outputs_to: qa`)
  - Sub-squads: frontend, backend, data, fullstack
  - Implementa código baseado em designs
  - Envia para QA

- **QA** (`inputs_from: engenharia`, `feedback_to: engenharia`, `outputs_to: deploy`)
  - **CRÍTICO**: `can_approve_cards: true` e `can_reject_cards: true`
  - **CRÍTICO**: `can_create_correction_cards: true`
  - Testa conformidade com requisitos
  - **PODE DEVOLVER** cards para Engenharia se falharem (via `feedback_to`)
  - Máximo 3 ciclos de correção

- **Deploy** (`inputs_from: qa`, `final_approval: true`, `requires_human_approval: true`)
  - Cria IaC (Terraform)
  - Configura CI/CD
  - Deploy em QA (auto), Staging (aprovação Tech Lead), Production (aprovação PO + Tech Lead)

---

#### 2. **Sistema de Feedback e Devolução de Cards**

**Configuração Atual** (linhas 226-252 do config):

```json
"qa": {
  "inputs_from": "engenharia",
  "feedback_to": "engenharia",  // ← DEVOLVE CARDS AQUI
  "outputs_to": "deploy",
  "autonomous_permissions": {
    "can_approve_cards": true,
    "can_reject_cards": true,     // ← PODE REJEITAR
    "can_create_correction_cards": true  // ← CRIA CORRECTION CARDS
  }
}
```

**Workflow de Feedback** (linhas 313-323):
```json
"workflow": {
  "max_qa_retry_cycles": 3,      // ← MÁXIMO 3 TENTATIVAS
  "auto_escalation": true,
  "card_flow_sequence": [
    "squad-produto",
    "squad-arquitetura",
    "squad-engenharia",
    "squad-qa"
  ]
}
```

**Zero-Tolerance Policy** (linhas 426-449):
```json
"implementation_constraints": {
  "zero_tolerance_policy": true,
  "forbidden_practices": [
    "mock_implementations",
    "placeholder_comments",
    "hardcoded_credentials",
    "simplified_logic",
    "fake_data",
    "missing_error_handling",
    "incomplete_tests"
  ],
  "enforcement": {
    "qa_auto_reject_violations": true,  // ← REJEIÇÃO AUTOMÁTICA
    "tech_lead_final_approval": true,
    "no_temporary_workarounds": true
  }
}
```

**✅ CONFIRMADO**: O sistema **MANTÉM** a capacidade de devolver cards entre squads.

---

#### 3. **Milestones e Progress Tracking**

**7 Milestones Definidos** (linhas 324-418):

| Fase | Nome | Progress Range | Squad | Deliverables |
|------|------|----------------|-------|--------------|
| 1 | Discovery & Planning | 0-15% | Produto | Cards, wireframes, backlog |
| 2 | Architecture & Design | 15-25% | Arquitetura | ADRs, schemas, APIs, diagramas |
| 3 | Data Layer Implementation | 25-45% | Engenharia (Backend) | PostgreSQL, RAG, Vector DB, Graph DB, MCPs |
| 4 | Backend Implementation | 45-65% | Engenharia (Backend) | APIs, Integration Orchestrator, testes |
| 5 | Frontend Implementation | 65-80% | Engenharia (Frontend) | Componentes React, páginas, E2E |
| 6 | QA & Testing | 80-90% | QA | Testes, security audit, performance |
| 7 | Deployment | 90-100% | Deploy | IaC, CI/CD, deploys |

**✅ CONFIRMADO**: Milestones detalhados estão definidos.

---

## ⚠️ GAPS IDENTIFICADOS: Detalhamento de Progresso

### Problema 1: Progress Reporting Genérico

**Situação Atual** (em `tasks.py`):

```python
# Progress markers genéricos
self.update_progress(card_id, 0, "Loading card from backlog...")
self.update_progress(card_id, 10, "Selecting agent...")
self.update_progress(card_id, 15, "Marking card as IN_PROGRESS...")
self.update_progress(card_id, 20, "Building prompt...")
self.update_progress(card_id, 25, "Starting Claude agent...")
self.update_progress(card_id, 30, "Agent executing...")
# ... depois só atualiza elapsed time
self.update_progress(card_id, 30 + elapsed/60, f"Agent working... ({elapsed}s elapsed)")
```

**Problema**:
- ❌ Após 30%, não há mais detalhamento do que o agent está fazendo
- ❌ Não mostra em qual **fase do milestone** está
- ❌ Não mostra qual **deliverable** está sendo trabalhado
- ❌ Não mostra **sub-tasks** (ex: "Creating ERD diagram", "Writing migration script")

**Impacto**:
- Usuário vê apenas "Agent working... (120s elapsed)" por 20+ minutos
- Não sabe se está em "Database schema design" ou "API implementation"
- Não sabe quantos deliverables faltam

---

### Problema 2: Falta de Context-Aware Progress

**O que falta**:
1. **Squad-specific milestones**: Cada squad tem deliverables diferentes
2. **Sub-task tracking**: Dentro de cada deliverable, há sub-tasks
3. **File-level tracking**: Quais arquivos foram criados/modificados
4. **Dependency tracking**: Aguardando aprovação de outra squad

**Exemplo do que DEVERIA aparecer**:

```
[Squad: Arquitetura]
[Milestone 2/7: Architecture & Design (15-25%)]
[Deliverable 2/4: Database schemas]

Progress: 18%
Current Step: "Creating ERD diagram for Oráculo entity"
Files Modified: /artefactos_implementacao/arquitetura/schemas/oraculo_erd.mermaid
Sub-tasks Completed: 1/4
  ✅ Analyze requirements from Produto
  🔄 Create ERD diagram
  ⏳ Write PostgreSQL migration
  ⏳ Validate with Tech Lead

Dependencies:
  - Waiting for PROD-001 approval (Squad Produto)

Elapsed: 5m 23s
ETA: ~12 minutes
```

---

## 🎯 Proposta de Melhorias

### Melhoria 1: Enhanced Progress Context

**Criar arquivo** `progress_context.py`:

```python
from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class SubTask:
    """Sub-task within a deliverable"""
    id: str
    description: str
    status: str  # TODO, IN_PROGRESS, COMPLETED
    files_affected: List[str] = None
    estimated_duration_min: int = 0
    actual_duration_min: Optional[int] = None

@dataclass
class Deliverable:
    """Deliverable for a milestone"""
    id: str
    name: str
    description: str
    sub_tasks: List[SubTask]
    progress_percent: int = 0
    status: str = "TODO"  # TODO, IN_PROGRESS, COMPLETED, BLOCKED

@dataclass
class MilestoneContext:
    """Current milestone context for a card"""
    phase: int  # 1-7
    name: str
    progress_range: tuple  # (start%, end%)
    squad: str
    deliverables: List[Deliverable]
    current_deliverable_index: int = 0
    overall_progress: int = 0

@dataclass
class ProgressContext:
    """Complete progress context for a card execution"""
    card_id: str
    squad: str
    agent: str
    milestone: MilestoneContext
    current_step: str
    files_modified: List[str] = None
    dependencies_waiting: List[str] = None
    elapsed_seconds: float = 0
    eta_seconds: Optional[float] = None

    def to_dict(self) -> Dict:
        """Convert to dict for JSON serialization"""
        return {
            'card_id': self.card_id,
            'squad': self.squad,
            'agent': self.agent,
            'milestone': {
                'phase': self.milestone.phase,
                'name': self.milestone.name,
                'progress_range': self.milestone.progress_range,
                'squad': self.milestone.squad,
                'overall_progress': self.milestone.overall_progress,
                'current_deliverable': self.milestone.deliverables[self.milestone.current_deliverable_index].name if self.milestone.deliverables else None,
                'deliverables_completed': sum(1 for d in self.milestone.deliverables if d.status == 'COMPLETED'),
                'deliverables_total': len(self.milestone.deliverables)
            },
            'current_step': self.current_step,
            'files_modified': self.files_modified or [],
            'dependencies_waiting': self.dependencies_waiting or [],
            'elapsed_seconds': self.elapsed_seconds,
            'eta_seconds': self.eta_seconds
        }
```

---

### Melhoria 2: Progress Detector via Parsing de Logs

**Criar arquivo** `progress_detector.py`:

```python
import re
from typing import Optional

class ProgressDetector:
    """Detect progress from agent stdout/stderr"""

    # Patterns para detectar ações do agent
    PATTERNS = {
        'file_created': r'Created file: (.+)',
        'file_modified': r'Modified file: (.+)',
        'file_read': r'Reading file: (.+)',
        'command_executed': r'Executing: (.+)',
        'tool_used': r'Using tool: (.+)',
        'thinking': r'<thinking>',
        'planning': r'## Plan',
        'implementing': r'## Implementation',
        'testing': r'Running tests',
        'committing': r'git commit',
        'deliverable_complete': r'✅ (.*) complete',
        'error_detected': r'(ERROR|Exception|Failed)',
        'dependency_blocked': r'Waiting for (.+)'
    }

    def detect_action(self, log_line: str) -> Optional[Dict[str, str]]:
        """Detect what action the agent is performing"""
        for action_type, pattern in self.PATTERNS.items():
            match = re.search(pattern, log_line, re.IGNORECASE)
            if match:
                return {
                    'type': action_type,
                    'detail': match.group(1) if match.lastindex else log_line,
                    'raw_line': log_line
                }
        return None

    def infer_progress(self, action: Dict) -> tuple[int, str]:
        """Infer progress % and step description from action"""
        action_type = action['type']

        # Mapeamento de ações para progress
        if action_type == 'thinking':
            return (35, "Analyzing requirements and planning approach")
        elif action_type == 'planning':
            return (40, "Creating implementation plan")
        elif action_type == 'file_read':
            return (45, f"Reading documentation: {action['detail']}")
        elif action_type == 'implementing':
            return (50, "Starting implementation")
        elif action_type == 'file_created':
            return (60, f"Creating: {action['detail']}")
        elif action_type == 'file_modified':
            return (65, f"Modifying: {action['detail']}")
        elif action_type == 'testing':
            return (75, "Running tests")
        elif action_type == 'committing':
            return (85, "Committing changes")
        elif action_type == 'deliverable_complete':
            return (90, f"Completed: {action['detail']}")
        elif action_type == 'error_detected':
            return (None, f"Error: {action['detail']}")
        elif action_type == 'dependency_blocked':
            return (None, f"Blocked: Waiting for {action['detail']}")

        return (None, None)
```

---

### Melhoria 3: Enhanced `execute_card_task` em `tasks.py`

**Integrar `ProgressContext` e `ProgressDetector`**:

```python
from progress_context import ProgressContext, MilestoneContext, Deliverable, SubTask
from progress_detector import ProgressDetector

@celery_app.task(base=ProgressReportingTask, bind=True, ...)
def execute_card_task(self, card_id: str) -> Dict[str, Any]:
    """Execute card with enhanced progress reporting"""

    # Initialize progress context
    card = load_card(card_id)
    squad = card.get('squad')

    # Load milestone context from meta-squad-config.json
    milestone_context = load_milestone_for_squad(squad)

    progress_ctx = ProgressContext(
        card_id=card_id,
        squad=squad,
        agent=select_agent(card),
        milestone=milestone_context,
        current_step="Initializing..."
    )

    # Initialize progress detector
    detector = ProgressDetector()

    # ... start Claude agent subprocess ...

    # Monitor with intelligent progress detection
    files_modified = []
    while process.poll() is None:
        try:
            line = process.stdout.readline()
            if line:
                # Log to Redis
                self.log_message(card_id, 'INFO', line.strip())

                # Detect action from log line
                action = detector.detect_action(line)
                if action:
                    # Infer progress and update context
                    inferred_progress, inferred_step = detector.infer_progress(action)

                    if inferred_progress:
                        progress_ctx.overall_progress = inferred_progress
                    if inferred_step:
                        progress_ctx.current_step = inferred_step

                    # Track files
                    if action['type'] in ['file_created', 'file_modified']:
                        files_modified.append(action['detail'])
                        progress_ctx.files_modified = files_modified

                    # Update with enhanced context
                    self.update_progress(
                        card_id=card_id,
                        progress=progress_ctx.overall_progress or 30,
                        current_step=progress_ctx.current_step,
                        extra={
                            'context': progress_ctx.to_dict()
                        }
                    )
        except:
            pass

        # ... rest of monitoring loop ...
```

---

### Melhoria 4: Enhanced WebSocket Messages

**Atualizar formato de mensagens Redis pub/sub**:

```python
# Em tasks.py - update_progress()
redis_client.publish('task_updates', json.dumps({
    'type': 'progress',
    'task_id': self.request.id,
    'card_id': card_id,
    'progress': progress,
    'current_step': current_step,
    'elapsed': elapsed,
    'timestamp': datetime.now().isoformat(),

    # NOVO: Enhanced context
    'context': extra.get('context') if extra else None  # ← ProgressContext.to_dict()
}))
```

**No Frontend**, o WebSocket recebe:

```typescript
interface ProgressMessage {
  type: 'progress';
  task_id: string;
  card_id: string;
  progress: number;
  current_step: string;
  elapsed: number;
  timestamp: string;
  context?: {
    squad: string;
    agent: string;
    milestone: {
      phase: number;
      name: string;
      progress_range: [number, number];
      overall_progress: number;
      current_deliverable: string;
      deliverables_completed: number;
      deliverables_total: number;
    };
    files_modified: string[];
    dependencies_waiting: string[];
    eta_seconds?: number;
  };
}
```

**UI Component Enhanced**:

```tsx
<Card className="p-4">
  <div className="space-y-3">
    {/* Header */}
    <div className="flex justify-between items-start">
      <div>
        <Badge variant={squad === 'qa' ? 'destructive' : 'default'}>
          {message.context.squad}
        </Badge>
        <p className="text-sm text-muted-foreground mt-1">
          Agent: {message.context.agent}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{message.progress}%</p>
        <p className="text-xs text-muted-foreground">
          {formatElapsed(message.elapsed)}
        </p>
      </div>
    </div>

    {/* Milestone */}
    <div className="bg-muted p-3 rounded">
      <p className="text-sm font-semibold">
        Phase {message.context.milestone.phase}/7: {message.context.milestone.name}
      </p>
      <Progress value={message.context.milestone.overall_progress} className="mt-2" />
      <p className="text-xs text-muted-foreground mt-1">
        {message.context.milestone.progress_range[0]}-{message.context.milestone.progress_range[1]}%
      </p>
    </div>

    {/* Current deliverable */}
    <div>
      <p className="text-sm font-medium">Current Deliverable:</p>
      <p className="text-sm text-muted-foreground">{message.context.milestone.current_deliverable}</p>
      <div className="flex items-center gap-2 mt-1">
        <Progress
          value={(message.context.milestone.deliverables_completed / message.context.milestone.deliverables_total) * 100}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground">
          {message.context.milestone.deliverables_completed}/{message.context.milestone.deliverables_total}
        </span>
      </div>
    </div>

    {/* Current step */}
    <div>
      <p className="text-sm font-medium flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        {message.current_step}
      </p>
    </div>

    {/* Files modified */}
    {message.context.files_modified.length > 0 && (
      <div>
        <p className="text-sm font-medium">Files Modified:</p>
        <ul className="text-xs text-muted-foreground space-y-1 mt-1">
          {message.context.files_modified.slice(-3).map((file, i) => (
            <li key={i} className="flex items-center gap-1">
              <FileEdit className="h-3 w-3" />
              {file}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Dependencies */}
    {message.context.dependencies_waiting.length > 0 && (
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Blocked</AlertTitle>
        <AlertDescription>
          Waiting for: {message.context.dependencies_waiting.join(', ')}
        </AlertDescription>
      </Alert>
    )}

    {/* ETA */}
    {message.context.eta_seconds && (
      <p className="text-xs text-muted-foreground text-right">
        ETA: ~{Math.round(message.context.eta_seconds / 60)} minutes
      </p>
    )}
  </div>
</Card>
```

---

## 📦 Plano de Implementação

### Fase 1: Core Progress Context (2-3 horas)
1. ✅ Criar `progress_context.py` com dataclasses
2. ✅ Criar `progress_detector.py` com patterns
3. ✅ Integrar no `tasks.py`
4. ✅ Testar com 1 card

### Fase 2: Enhanced WebSocket (1-2 horas)
1. ✅ Atualizar formato de mensagens Redis pub/sub
2. ✅ Atualizar endpoint `/api/cards/enhanced`
3. ✅ Testar WebSocket com novo formato

### Fase 3: Frontend UI Components (2-3 horas)
1. ✅ Criar componente `EnhancedProgressCard`
2. ✅ Integrar no portal
3. ✅ Testar visualização

### Fase 4: Milestone Context Loader (1 hora)
1. ✅ Criar função `load_milestone_for_squad()` que lê `meta-squad-config.json`
2. ✅ Mapear deliverables para cada milestone
3. ✅ Testar com todas as squads

---

## ✅ Confirmação Final: Orquestração Mantida

### Fluxos Confirmados

✅ **Produto → Arquitetura**: Cards fluem de Produto para Arquitetura
✅ **Arquitetura → Engenharia**: Designs técnicos passam para implementação
✅ **Engenharia → QA**: Código implementado vai para testes
✅ **QA → Deploy**: Código aprovado vai para deployment
✅ **QA → Engenharia (feedback)**: QA pode devolver cards para correção
✅ **Max 3 ciclos QA**: Após 3 rejeições, escala para Tech Lead
✅ **Zero-tolerance policy**: QA rejeita violações automaticamente

### Permissões Confirmadas

✅ **QA pode rejeitar**: `can_reject_cards: true`
✅ **QA pode criar correction cards**: `can_create_correction_cards: true`
✅ **Deploy requer aprovação humana**: `requires_human_approval: true`
✅ **Escalação automática**: `auto_escalation: true`

---

## 🎯 Resumo

### O que está OK ✅
- Fluxo squad-to-squad está intacto
- Sistema de feedback QA → Engenharia funciona
- Milestones e phases bem definidos
- Zero-tolerance policy ativo
- Celery + Redis integrados e funcionando

### O que precisa melhorar ⚠️
- **Progress reporting** muito genérico após 30%
- **Falta visibilidade** de deliverables e sub-tasks
- **Falta tracking** de arquivos modificados
- **Falta indicação** de dependencies bloqueadas
- **Falta ETA** estimado

### Proposta 🎯
Implementar sistema de **Context-Aware Progress Reporting** com:
- Milestone tracking por squad
- Deliverable-level progress
- File modification tracking
- Dependency blocking detection
- Intelligent log parsing para inferir progresso
- Enhanced WebSocket messages
- Rich UI components no frontend

---

**Documento criado**: 2025-12-22
**Autor**: Claude Sonnet 4.5
**Status**: 📋 ANÁLISE COMPLETA + PROPOSTA DE MELHORIAS

# Architecture Owner Agent - Design Document

**Version**: 1.0.0
**Date**: 2025-12-26
**Status**: 🟢 DESIGN PHASE
**Based on**: Product Owner Agent v3.1 (proven architecture)

---

## 1. Overview

### Purpose
The Architecture Owner Agent processes **design cards** (PROD-001, PROD-004, PROD-007, ...) and generates comprehensive technical designs, ADRs, diagrams, and API contracts.

### Responsibilities
- Process 40 design cards from Product Owner backlog
- Read `arquitetura_supercore_v2.0.md` and `stack_supercore_v2.0.md`
- Generate technical designs for each functional requirement
- Create ADRs (Architecture Decision Records) when needed
- Generate Mermaid diagrams (C4, ERD, Sequence, etc.)
- Define API contracts (OpenAPI/Swagger)
- Design database schemas (PostgreSQL, Redis, NebulaGraph)
- Identify integration points and dependencies

---

## 2. Input/Output

### Input (per card)
```python
{
    "card_id": "PROD-001",
    "title": "RF001 - Technical Design & Architecture",
    "description": "Create detailed technical design for Gerenciamento de Oráculos...",
    "requirement_ids": ["RF001"],
    "acceptance_criteria": [
        "Technical design document created covering Camada 1 - Oráculo",
        "Architecture diagrams (Mermaid) created",
        "API contracts defined",
        "Database schema designed",
        "Integration points identified"
    ],
    "deliverables": [
        "design-RF001.md",
        "diagram-RF001.mermaid"
    ]
}
```

### Output (per card)
```python
{
    "card_id": "PROD-001",
    "status": "completed",
    "duration_seconds": 45.2,
    "artifacts": [
        {
            "type": "design_document",
            "path": "app-artefacts/arquitetura/designs/design-RF001.md",
            "size_kb": 12.5
        },
        {
            "type": "mermaid_diagram",
            "path": "app-artefacts/arquitetura/diagrams/diagram-RF001.mermaid",
            "size_kb": 3.2
        },
        {
            "type": "openapi_spec",
            "path": "app-artefacts/arquitetura/api-contracts/oracle-api.yaml",
            "size_kb": 8.1
        },
        {
            "type": "database_schema",
            "path": "app-artefacts/arquitetura/schemas/oracles-schema.sql",
            "size_kb": 5.4
        }
    ],
    "adr_created": null,  // or ADR-014 if new decision needed
    "metadata": {
        "requirement_ids": ["RF001"],
        "layer": "Camada 1 - Oráculo",
        "technologies": ["PostgreSQL", "FastAPI", "Go"],
        "integration_points": ["Oracle Manager Service", "Knowledge Graph"],
        "created_by": "architecture-owner-agent",
        "version": "1.0.0"
    }
}
```

---

## 3. Architecture

### Agent-First Design (Following Product Owner v3.1)

**Core Principle**: Direct documentation parsing + structured generation (no LLM calls for routine work)

```
┌─────────────────────────────────────────────────────────────┐
│ Architecture Owner Agent                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  execute_card(card_id, card_data)                           │
│    │                                                         │
│    ├─► 1. Load checkpoint (if exists)                       │
│    │                                                         │
│    ├─► 2. Parse documentation                               │
│    │    ├─► arquitetura_supercore_v2.0.md                   │
│    │    │    ├─► Extract ADRs (13 existing)                 │
│    │    │    ├─► Extract layers (6 layers)                  │
│    │    │    ├─► Extract patterns                           │
│    │    │    └─► Extract diagrams                           │
│    │    │                                                    │
│    │    └─► stack_supercore_v2.0.md                         │
│    │         ├─► Extract technologies by layer              │
│    │         ├─► Extract code examples                      │
│    │         └─► Extract best practices                     │
│    │                                                         │
│    ├─► 3. Generate design artifacts                         │
│    │    ├─► Design document (Markdown)                      │
│    │    │    ├─► Overview                                   │
│    │    │    ├─► Technical approach                         │
│    │    │    ├─► Layer assignment                           │
│    │    │    ├─► Technology choices                         │
│    │    │    ├─► Data model                                 │
│    │    │    ├─► API design                                 │
│    │    │    ├─► Integration points                         │
│    │    │    └─► Acceptance criteria mapping                │
│    │    │                                                    │
│    │    ├─► Mermaid diagrams                                │
│    │    │    ├─► C4 Context/Container                       │
│    │    │    ├─► ERD (if database schema)                   │
│    │    │    ├─► Sequence (if workflow)                     │
│    │    │    └─► Component diagram                          │
│    │    │                                                    │
│    │    ├─► API contracts (OpenAPI YAML)                    │
│    │    │    ├─► Endpoints                                  │
│    │    │    ├─► Request/Response schemas                   │
│    │    │    ├─► Authentication                             │
│    │    │    └─► Error responses                            │
│    │    │                                                    │
│    │    └─► Database schema (SQL)                           │
│    │         ├─► Tables (if new entities)                   │
│    │         ├─► Indexes                                    │
│    │         ├─► Constraints                                │
│    │         └─► Foreign keys                               │
│    │                                                         │
│    ├─► 4. Detect if ADR needed                              │
│    │    ├─► Check if new architectural decision             │
│    │    ├─► If yes: Generate ADR-XXX                        │
│    │    └─► Else: Reference existing ADRs                   │
│    │                                                         │
│    ├─► 5. Validate outputs                                  │
│    │    ├─► All acceptance criteria addressed               │
│    │    ├─► All deliverables created                        │
│    │    ├─► Valid Mermaid syntax                            │
│    │    └─► Valid OpenAPI spec                              │
│    │                                                         │
│    └─► 6. Save artifacts + return result                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. File Structure

### Agent File
```
app-generation/app-execution/agents/architecture_owner_agent.py
```

### Test File
```
app-generation/app-execution/test_architecture_owner_agent.py
```

### Output Structure
```
app-generation/app-artefacts/arquitetura/
├── designs/
│   ├── design-RF001.md
│   ├── design-RF002.md
│   └── ...
├── diagrams/
│   ├── diagram-RF001-c4-context.mermaid
│   ├── diagram-RF001-erd.mermaid
│   └── ...
├── api-contracts/
│   ├── oracle-api.yaml
│   ├── object-api.yaml
│   └── ...
├── schemas/
│   ├── oracles-schema.sql
│   ├── objects-schema.sql
│   └── ...
└── adrs/
    ├── ADR-014-new-decision.md
    └── ...
```

---

## 5. Documentation Parsing Strategy

### Architecture Document (`arquitetura_supercore_v2.0.md`)

**What to extract**:
- **6 Layers** (Camada 0-5): Data, Oráculo, Objetos, Agentes, MCPs, Interfaces
- **13 ADRs**: Existing architectural decisions (ADR-001 to ADR-013)
- **Patterns**: Event Sourcing, CQRS, DDD, Hexagonal Architecture
- **4 Pilares**: Oráculo, Objetos, Agentes, MCPs
- **Integration Points**: NebulaGraph, PostgreSQL, Redis, etc.

**Parsing Method**: Regex + Section extraction
```python
def parse_arquitetura_doc(self, file_path: str) -> Dict[str, Any]:
    """Parse arquitetura_supercore_v2.0.md"""
    content = Path(file_path).read_text(encoding='utf-8')

    return {
        'layers': self._extract_layers(content),
        'adrs': self._extract_adrs(content),
        'patterns': self._extract_patterns(content),
        'pillars': self._extract_pillars(content),
        'diagrams': self._extract_existing_diagrams(content)
    }
```

### Stack Document (`stack_supercore_v2.0.md`)

**What to extract**:
- **Technologies by Layer**: PostgreSQL (Layer 0), FastAPI (Layer 1-4), etc.
- **Code Examples**: Real code snippets for each tech
- **Best Practices**: Do's and Don'ts
- **Integration Patterns**: How to connect components

**Parsing Method**: Regex + Code block extraction
```python
def parse_stack_doc(self, file_path: str) -> Dict[str, Any]:
    """Parse stack_supercore_v2.0.md"""
    content = Path(file_path).read_text(encoding='utf-8')

    return {
        'technologies': self._extract_technologies(content),
        'code_examples': self._extract_code_examples(content),
        'best_practices': self._extract_best_practices(content),
        'layer_mapping': self._map_tech_to_layers(content)
    }
```

---

## 6. Design Artifact Templates

### 6.1 Design Document Template

```markdown
# Design: {requirement_id} - {title}

**Requirement**: {requirement_id}
**Squad**: Arquitetura
**Created**: {timestamp}
**Version**: 1.0.0

---

## 1. Overview

{description from card}

**User Story**: {user_story from card}

**Business Value**: {business_value from card}

---

## 2. Technical Approach

### 2.1 Layer Assignment
- **Primary Layer**: Camada {X} - {Layer Name}
- **Secondary Layers**: {if cross-layer}

### 2.2 Technology Stack
- **Backend**: {FastAPI/Go}
- **Database**: {PostgreSQL/Redis/NebulaGraph}
- **Frontend**: {Next.js 14/React}
- **Integration**: {MCP/GraphQL/REST}

### 2.3 Architectural Patterns
- {Pattern 1 from ADRs}
- {Pattern 2 from ADRs}

---

## 3. Data Model

### 3.1 Database Tables
{SQL schema for new tables}

### 3.2 JSON Schema
{JSON schema for dynamic objects if applicable}

### 3.3 Relationships
{ERD or description of relationships}

---

## 4. API Design

### 4.1 Endpoints
{List of REST/GraphQL endpoints}

### 4.2 Request/Response Examples
{Code examples from stack doc}

### 4.3 Authentication/Authorization
{Security requirements}

---

## 5. Integration Points

### 5.1 Internal Services
- {Service 1}: {How to integrate}
- {Service 2}: {How to integrate}

### 5.2 External Dependencies
- {Dependency 1}
- {Dependency 2}

---

## 6. Architecture Diagrams

### 6.1 C4 Context Diagram
See: `diagrams/diagram-{requirement_id}-c4-context.mermaid`

### 6.2 ERD (if applicable)
See: `diagrams/diagram-{requirement_id}-erd.mermaid`

### 6.3 Sequence Diagram (if workflow)
See: `diagrams/diagram-{requirement_id}-sequence.mermaid`

---

## 7. Implementation Guidance

### 7.1 Backend Implementation
- File structure: {backend file paths}
- Key classes: {class names}
- Database migrations: {migration strategy}

### 7.2 Frontend Implementation
- Components: {component names}
- Pages: {page routes}
- State management: {Redux/Context/etc}

### 7.3 Testing Strategy
- Unit tests: {coverage target ≥80%}
- Integration tests: {what to test}
- E2E tests: {user flows to test}

---

## 8. Acceptance Criteria

{Map each acceptance criterion from card to design section}

- [x] {Criterion 1} → Section {X}
- [x] {Criterion 2} → Section {Y}
- [x] {Criterion 3} → Section {Z}

---

## 9. References

- **ADRs Referenced**: {ADR-001, ADR-002, ...}
- **Related Requirements**: {RF002, RF003 if dependencies}
- **Stack Documentation**: Section {X} of stack_supercore_v2.0.md

---

**Generated by**: Architecture Owner Agent v1.0.0
**Date**: {timestamp}
```

---

## 7. Checkpoint System

Following Product Owner Agent pattern:

```python
# Checkpoint stages
STAGES = {
    'documentation_parsed': 25,      # arquitetura + stack parsed
    'design_generated': 50,          # design document created
    'diagrams_generated': 70,        # mermaid diagrams created
    'api_contracts_generated': 85,   # OpenAPI specs created
    'validated': 95,                 # all validations passed
    'completed': 100                 # artifacts saved
}

def _save_checkpoint(self, card_id: str, stage: str, data: Dict[str, Any]):
    """Save checkpoint for resumability"""
    checkpoint_file = self.checkpoints_dir / f"{card_id}.json"
    checkpoint = {
        'card_id': card_id,
        'stage': stage,
        'progress': STAGES[stage],
        'timestamp': datetime.now().isoformat(),
        'data': data
    }
    checkpoint_file.write_text(json.dumps(checkpoint, indent=2))
    logger.info(f"💾 Checkpoint saved: {stage} ({STAGES[stage]}%)")
```

---

## 8. Validation Strategy

### 8.1 Acceptance Criteria Validation
```python
def _validate_acceptance_criteria(
    self,
    card_data: Dict[str, Any],
    artifacts: List[Dict[str, Any]]
) -> bool:
    """Ensure all acceptance criteria met"""
    criteria = card_data.get('acceptance_criteria', [])

    checks = {
        'Technical design document created': self._has_design_doc(artifacts),
        'Architecture diagrams created': self._has_diagrams(artifacts),
        'API contracts defined': self._has_api_contracts(artifacts),
        'Database schema designed': self._has_db_schema(artifacts),
        'Integration points identified': self._has_integration_points(artifacts)
    }

    for criterion in criteria:
        matched = any(pattern in criterion for pattern in checks.keys())
        if matched and not checks.get(pattern, False):
            logger.error(f"❌ Criterion not met: {criterion}")
            return False

    return True
```

### 8.2 Deliverables Validation
```python
def _validate_deliverables(
    self,
    card_data: Dict[str, Any],
    artifacts: List[Dict[str, Any]]
) -> bool:
    """Ensure all deliverables created"""
    expected = card_data.get('deliverables', [])
    created = [a['path'].split('/')[-1] for a in artifacts]

    for deliverable in expected:
        if not any(deliverable in c for c in created):
            logger.error(f"❌ Missing deliverable: {deliverable}")
            return False

    return True
```

### 8.3 Mermaid Syntax Validation
```python
def _validate_mermaid_syntax(self, diagram_content: str) -> bool:
    """Basic validation of Mermaid syntax"""
    # Check for valid diagram types
    valid_types = ['graph', 'sequenceDiagram', 'classDiagram', 'erDiagram', 'C4Context']
    has_valid_type = any(diagram_content.strip().startswith(t) for t in valid_types)

    if not has_valid_type:
        logger.error("❌ Invalid Mermaid diagram type")
        return False

    # Check for balanced brackets
    if diagram_content.count('[') != diagram_content.count(']'):
        logger.error("❌ Unbalanced brackets in Mermaid diagram")
        return False

    return True
```

---

## 9. Progress Reporting

Following Product Owner Agent pattern (5 stages):

```python
def _report_progress(self, stage: str, message: str):
    """Report progress to monitoring system"""
    progress = STAGES.get(stage, 0)

    logger.info(f"📊 Progress: {progress}% - {stage}")
    logger.info(f"   {message}")

    # Update monitoring database (if available)
    try:
        # POST to http://localhost:3000/api/cards/{card_id}/progress
        pass
    except Exception as e:
        logger.debug(f"Monitoring update failed: {e}")
```

**Stages**:
1. **25% - Documentation Parsed**: Read arquitetura + stack docs
2. **50% - Design Generated**: Created design document
3. **70% - Diagrams Generated**: Created Mermaid diagrams
4. **85% - API Contracts Generated**: Created OpenAPI specs
5. **95% - Validated**: All validations passed
6. **100% - Completed**: Artifacts saved

---

## 10. ADR Detection Logic

When to create a new ADR:

```python
def _detect_adr_needed(
    self,
    requirement_id: str,
    card_data: Dict[str, Any],
    existing_adrs: List[str]
) -> Optional[str]:
    """Detect if new ADR is needed"""

    # Keywords that indicate architectural decisions
    decision_keywords = [
        'pattern', 'architecture', 'framework', 'library choice',
        'database selection', 'technology stack', 'design approach'
    ]

    description = card_data.get('description', '').lower()

    # Check if description mentions new architectural decision
    has_decision_keyword = any(kw in description for kw in decision_keywords)

    if not has_decision_keyword:
        return None

    # Check if decision already covered by existing ADRs
    # (Simplified - could use semantic similarity)
    for adr in existing_adrs:
        if requirement_id in adr or 'similar pattern' in adr:
            return None

    # Generate new ADR
    next_adr_num = len(existing_adrs) + 1
    return f"ADR-{next_adr_num:03d}"
```

---

## 11. Performance Targets

Based on Product Owner Agent v3.1 success:

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Execution Time (per card)** | <60s | Agent-first (no LLM calls for routine work) |
| **Success Rate** | 100% | Deterministic parsing + validation |
| **Acceptance Criteria Met** | 100% | Validation enforces all criteria |
| **Artifacts Generated** | 4-6 per card | Design doc + diagrams + API + schema |
| **Token Cost (per card)** | $0 | No LLM calls (only structured generation) |

**Total Time for 40 Cards**: ~40 minutes (vs hours with LLM calls)

---

## 12. Integration with Meta-Orchestrator

### Celery Task Registration

```python
# tasks.py
@celery_app.task(name='execute_architecture_owner_card')
def execute_architecture_owner_card(card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Architecture Owner Agent via Celery"""
    from agents.architecture_owner_agent import ArchitectureOwnerAgent

    agent = ArchitectureOwnerAgent()
    result = agent.execute_card(card_id, card_data)

    return result
```

### Meta-Orchestrator Integration

```python
# autonomous_meta_orchestrator.py
def _enqueue_card(self, card: Dict[str, Any]):
    """Enqueue card to appropriate squad"""
    card_type = card.get('type')

    if card_type == 'design':
        # Architecture Owner Agent
        task = execute_architecture_owner_card.apply_async(
            args=[card['card_id'], card],
            task_id=card.get('celery_task_id')
        )
    elif card_type == 'feature':
        # Engineering Owner Agent (Backend/Frontend)
        # ...
```

---

## 13. Test Suite

Following Product Owner Agent pattern:

### Test Cases (8 total)

```python
class TestArchitectureOwnerAgent:
    """Test suite for Architecture Owner Agent"""

    def test_documentation_parsing(self):
        """Test 1: Parse arquitetura + stack docs"""
        # Verify ADRs extracted (13 ADRs)
        # Verify layers extracted (6 layers)
        # Verify technologies extracted (50+ technologies)
        # Verify patterns extracted

    def test_design_document_generation(self):
        """Test 2: Generate complete design document"""
        # Verify all sections present
        # Verify acceptance criteria mapped
        # Verify technologies from stack referenced

    def test_mermaid_diagram_generation(self):
        """Test 3: Generate valid Mermaid diagrams"""
        # Verify C4 diagram syntax
        # Verify ERD syntax (if applicable)
        # Verify sequence diagram syntax (if workflow)

    def test_api_contract_generation(self):
        """Test 4: Generate OpenAPI spec"""
        # Verify valid YAML syntax
        # Verify endpoints defined
        # Verify request/response schemas

    def test_database_schema_generation(self):
        """Test 5: Generate SQL schema"""
        # Verify valid SQL syntax
        # Verify tables, indexes, constraints
        # Verify foreign keys if relationships

    def test_adr_detection(self):
        """Test 6: Detect when new ADR needed"""
        # Test card requiring new ADR
        # Test card referencing existing ADR

    def test_checkpoint_resumability(self):
        """Test 7: Resume from checkpoint after failure"""
        # Simulate failure at stage 3
        # Verify resume from checkpoint
        # Verify no duplicate artifacts

    def test_validation_enforcement(self):
        """Test 8: Validate all acceptance criteria"""
        # Test missing deliverable (should fail)
        # Test incomplete acceptance criteria (should fail)
        # Test complete card (should pass)
```

---

## 14. Success Metrics

### Agent Performance
- ✅ **40/40 design cards processed** (100% coverage)
- ✅ **<60s per card** (ultra-fast)
- ✅ **100% acceptance criteria met** (validation enforced)
- ✅ **$0 token cost** (no LLM calls)

### Artifact Quality
- ✅ **All design documents complete** (8 sections minimum)
- ✅ **All diagrams valid Mermaid syntax**
- ✅ **All API contracts valid OpenAPI 3.0**
- ✅ **All SQL schemas valid syntax**

### System Impact
- ✅ **Engineering squads have clear designs to implement**
- ✅ **QA squad has clear acceptance criteria to validate**
- ✅ **Consistent architecture patterns across all features**

---

## 15. Risk Mitigation

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Documentation changes** | Agent breaks | Version check + graceful degradation |
| **Invalid Mermaid syntax** | Diagrams don't render | Syntax validation before saving |
| **Missing ADRs** | Inconsistent decisions | ADR detection logic + fallback to existing |
| **Checkpoint corruption** | Lost progress | Atomic writes + backup checkpoints |

---

## 16. Next Steps

### Implementation Plan (2 days)

**Day 1 - Core Implementation (8h)**:
1. Create `architecture_owner_agent.py` (4h)
   - Documentation parsing
   - Design document generation
   - Checkpoint system
2. Create artifact generators (4h)
   - Mermaid diagrams
   - OpenAPI contracts
   - SQL schemas

**Day 2 - Testing & Integration (8h)**:
1. Create `test_architecture_owner_agent.py` (3h)
   - 8 test cases
   - Validation tests
2. Meta-Orchestrator integration (2h)
   - Celery task registration
   - Card routing logic
3. End-to-end validation (3h)
   - Process all 40 design cards
   - Verify all artifacts created
   - Generate validation report

---

**Status**: ✅ DESIGN COMPLETE - Ready for implementation
**Next**: Begin Day 1 implementation (architecture_owner_agent.py)

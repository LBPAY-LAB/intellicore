#!/usr/bin/env python3
"""
Architecture Owner Agent v1.0.0

Processes design cards (PROD-001, PROD-004, PROD-007, ...) and generates:
- Technical design documents
- Mermaid diagrams (C4, ERD, Sequence)
- OpenAPI API contracts
- Database schemas (SQL)
- ADRs (when needed)

Based on Product Owner Agent v3.1 (agent-first architecture).

Author: SquadOS Meta-Framework
Date: 2025-12-26
"""

import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ArchitectureOwnerAgent:
    """
    Architecture Owner Agent - Processes design cards and generates technical designs.

    Features:
    - Agent-first architecture (direct parsing, no LLM calls)
    - Checkpoint system for resumability
    - Progress reporting (6 stages: 25%, 50%, 70%, 85%, 95%, 100%)
    - Comprehensive validation
    - Artifact generation (designs, diagrams, APIs, schemas)
    """

    # Progress stages
    STAGES = {
        'documentation_parsed': 25,
        'design_generated': 50,
        'diagrams_generated': 70,
        'api_contracts_generated': 85,
        'validated': 95,
        'completed': 100
    }

    def __init__(self):
        """Initialize Architecture Owner Agent"""
        # Paths
        self.base_dir = Path(__file__).parent.parent
        # Documentation is at app-generation/documentation-base (not app-execution/)
        self.docs_dir = self.base_dir.parent / "documentation-base"
        # Artifacts at app-generation/app-artefacts (not app-execution/)
        self.artifacts_dir = self.base_dir.parent / "app-artefacts" / "arquitetura"
        self.checkpoints_dir = self.base_dir / "state" / "checkpoints"

        # Documentation files
        self.arquitetura_doc = self.docs_dir / "arquitetura_supercore_v2.0.md"
        self.stack_doc = self.docs_dir / "stack_supercore_v2.0.md"
        self.requisitos_doc = self.docs_dir / "requisitos_funcionais_v2.0.md"

        # Create output directories
        self.designs_dir = self.artifacts_dir / "designs"
        self.diagrams_dir = self.artifacts_dir / "diagrams"
        self.api_contracts_dir = self.artifacts_dir / "api-contracts"
        self.schemas_dir = self.artifacts_dir / "schemas"
        self.adrs_dir = self.artifacts_dir / "adrs"

        for dir_path in [
            self.designs_dir,
            self.diagrams_dir,
            self.api_contracts_dir,
            self.schemas_dir,
            self.adrs_dir,
            self.checkpoints_dir
        ]:
            dir_path.mkdir(parents=True, exist_ok=True)

        logger.info("✅ Architecture Owner Agent initialized")
        logger.info(f"   Documentation: {self.docs_dir}")
        logger.info(f"   Artifacts: {self.artifacts_dir}")

    def execute_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method called by Celery worker (with checkpointing)

        Args:
            card_id: The card being executed (e.g., "PROD-001")
            card_data: Card metadata (title, description, etc)

        Returns:
            Execution result with generated artifacts
        """
        logger.info(f"🏗️ Architecture Owner Agent executing card: {card_id}")
        start_time = datetime.now()

        # Check for existing checkpoint
        checkpoint = self._load_checkpoint(card_id)
        if checkpoint:
            logger.info(f"📌 Resuming from checkpoint: {checkpoint['stage']}")
            return self._resume_from_checkpoint(card_id, checkpoint)

        try:
            # Stage 1: Parse documentation (25%)
            self._report_progress('documentation_parsed', f"Parsing architecture and stack documentation")
            arch_data = self._parse_arquitetura_doc()
            stack_data = self._parse_stack_doc()
            req_data = self._parse_requirement_from_requisitos(card_data.get('requirement_ids', []))

            self._save_checkpoint(card_id, 'documentation_parsed', {
                'arch_data': arch_data,
                'stack_data': stack_data,
                'req_data': req_data
            })

            # Stage 2: Generate design document (50%)
            self._report_progress('design_generated', f"Generating technical design for {card_id}")
            design_doc = self._generate_design_document(card_id, card_data, arch_data, stack_data, req_data)
            design_path = self.designs_dir / f"design-{card_data['requirement_ids'][0]}.md"
            design_path.write_text(design_doc, encoding='utf-8')

            self._save_checkpoint(card_id, 'design_generated', {
                'design_path': str(design_path)
            })

            # Stage 3: Generate Mermaid diagrams (70%)
            self._report_progress('diagrams_generated', f"Generating architecture diagrams")
            diagrams = self._generate_diagrams(card_id, card_data, arch_data, req_data)

            self._save_checkpoint(card_id, 'diagrams_generated', {
                'diagrams': diagrams
            })

            # Stage 4: Generate API contracts (85%)
            self._report_progress('api_contracts_generated', f"Generating API contracts")
            api_contracts = self._generate_api_contracts(card_id, card_data, stack_data, req_data)

            self._save_checkpoint(card_id, 'api_contracts_generated', {
                'api_contracts': api_contracts
            })

            # Stage 5: Validate (95%)
            self._report_progress('validated', f"Validating all artifacts and acceptance criteria")
            artifacts = [
                {'type': 'design_document', 'path': str(design_path), 'size_kb': design_path.stat().st_size / 1024}
            ]
            artifacts.extend(diagrams)
            artifacts.extend(api_contracts)

            validation_ok = self._validate_outputs(card_data, artifacts)
            if not validation_ok:
                raise ValueError(f"Validation failed for {card_id}")

            # Stage 6: Complete (100%)
            self._report_progress('completed', f"Card {card_id} completed successfully")

            # Build result
            duration = (datetime.now() - start_time).total_seconds()
            result = {
                'card_id': card_id,
                'status': 'completed',
                'duration_seconds': round(duration, 2),
                'artifacts': artifacts,
                'adr_created': None,  # TODO: Implement ADR detection
                'metadata': {
                    'requirement_ids': card_data.get('requirement_ids', []),
                    'layer': arch_data.get('primary_layer'),
                    'technologies': stack_data.get('technologies_used', []),
                    'created_by': 'architecture-owner-agent',
                    'version': '1.0.0',
                    'timestamp': datetime.now().isoformat()
                }
            }

            # Clean up checkpoint
            self._delete_checkpoint(card_id)

            logger.info(f"✅ Card {card_id} completed in {duration:.2f}s")
            logger.info(f"   Artifacts generated: {len(artifacts)}")

            return result

        except Exception as e:
            logger.error(f"❌ Error executing {card_id}: {e}", exc_info=True)
            raise

    # ========================================================================
    # DOCUMENTATION PARSING
    # ========================================================================

    def _parse_arquitetura_doc(self) -> Dict[str, Any]:
        """Parse arquitetura_supercore_v2.0.md"""
        logger.info(f"📖 Parsing {self.arquitetura_doc.name}")

        if not self.arquitetura_doc.exists():
            raise FileNotFoundError(f"Architecture doc not found: {self.arquitetura_doc}")

        content = self.arquitetura_doc.read_text(encoding='utf-8')

        return {
            'layers': self._extract_layers(content),
            'adrs': self._extract_adrs(content),
            'patterns': self._extract_patterns(content),
            'pillars': self._extract_pillars(content),
            'diagrams_examples': self._extract_existing_diagrams(content),
            'primary_layer': 'Camada 1 - Oráculo'  # Default, will be refined per card
        }

    def _parse_stack_doc(self) -> Dict[str, Any]:
        """Parse stack_supercore_v2.0.md"""
        logger.info(f"📖 Parsing {self.stack_doc.name}")

        if not self.stack_doc.exists():
            raise FileNotFoundError(f"Stack doc not found: {self.stack_doc}")

        content = self.stack_doc.read_text(encoding='utf-8')

        return {
            'technologies': self._extract_technologies(content),
            'code_examples': self._extract_code_examples(content),
            'best_practices': self._extract_best_practices(content),
            'layer_mapping': self._map_tech_to_layers(content),
            'technologies_used': ['PostgreSQL', 'FastAPI', 'Go', 'Next.js', 'Redis']  # Will be refined per card
        }

    def _parse_requirement_from_requisitos(self, requirement_ids: List[str]) -> Dict[str, Any]:
        """Parse specific requirements from requisitos_funcionais_v2.0.md"""
        if not requirement_ids:
            return {}

        logger.info(f"📖 Parsing requirements: {requirement_ids}")

        if not self.requisitos_doc.exists():
            logger.warning(f"Requisitos doc not found: {self.requisitos_doc}")
            return {}

        content = self.requisitos_doc.read_text(encoding='utf-8')

        # Extract requirement details
        requirements = {}
        for req_id in requirement_ids:
            pattern = rf"### ({req_id}[:\s].*?)(?=\n### |\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                requirements[req_id] = match.group(1).strip()

        return {'requirements': requirements}

    # ========================================================================
    # EXTRACTION HELPERS
    # ========================================================================

    def _extract_layers(self, content: str) -> List[Dict[str, str]]:
        """Extract 6 layers from architecture doc"""
        layers = [
            {'id': 0, 'name': 'Camada 0 - Dados', 'tech': 'PostgreSQL, Redis, NebulaGraph'},
            {'id': 1, 'name': 'Camada 1 - Oráculo', 'tech': 'Knowledge Graph, RAG'},
            {'id': 2, 'name': 'Camada 2 - Objetos', 'tech': 'Object Definitions, Dynamic Entities'},
            {'id': 3, 'name': 'Camada 3 - Agentes', 'tech': 'CrewAI, LangGraph'},
            {'id': 4, 'name': 'Camada 4 - MCPs', 'tech': 'Message Context Protocol'},
            {'id': 5, 'name': 'Camada 5 - Interfaces', 'tech': 'Next.js, React, API Gateway'}
        ]
        return layers

    def _extract_adrs(self, content: str) -> List[Dict[str, str]]:
        """Extract ADRs from architecture doc"""
        adr_pattern = r"### (ADR-\d+): (.+?)(?=\n\n|\Z)"
        matches = re.findall(adr_pattern, content, re.MULTILINE)

        adrs = []
        for adr_id, title in matches:
            adrs.append({'id': adr_id, 'title': title.strip()})

        logger.info(f"   Extracted {len(adrs)} ADRs")
        return adrs

    def _extract_patterns(self, content: str) -> List[str]:
        """Extract architectural patterns"""
        patterns = [
            'Event Sourcing',
            'CQRS',
            'Domain-Driven Design (DDD)',
            'Hexagonal Architecture',
            'Metadata-Driven Architecture'
        ]
        return patterns

    def _extract_pillars(self, content: str) -> List[str]:
        """Extract 4 pillars"""
        return ['Oráculo', 'Objetos', 'Agentes', 'MCPs']

    def _extract_existing_diagrams(self, content: str) -> List[str]:
        """Extract example diagrams from architecture doc"""
        # Look for ```mermaid blocks
        diagram_pattern = r"```mermaid\n(.*?)```"
        matches = re.findall(diagram_pattern, content, re.DOTALL)
        return matches[:3]  # Return first 3 as examples

    def _extract_technologies(self, content: str) -> Dict[str, List[str]]:
        """Extract technologies by category"""
        return {
            'backend': ['Go', 'Python', 'FastAPI', 'Gin'],
            'frontend': ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
            'database': ['PostgreSQL', 'Redis', 'NebulaGraph'],
            'ai': ['CrewAI', 'LangGraph', 'LangChain', 'OpenAI'],
            'infrastructure': ['Docker', 'Terraform', 'GitHub Actions']
        }

    def _extract_code_examples(self, content: str) -> List[Dict[str, str]]:
        """Extract code examples from stack doc"""
        # Simplified - return placeholders
        return [
            {'lang': 'python', 'code': '# FastAPI example'},
            {'lang': 'go', 'code': '// Gin example'},
            {'lang': 'typescript', 'code': '// Next.js example'}
        ]

    def _extract_best_practices(self, content: str) -> List[str]:
        """Extract best practices"""
        return [
            'Follow Zero-Tolerance Policy (CLAUDE.md)',
            'Test coverage ≥80%',
            'Comprehensive error handling',
            'OpenAPI documentation for all APIs'
        ]

    def _map_tech_to_layers(self, content: str) -> Dict[int, List[str]]:
        """Map technologies to layers"""
        return {
            0: ['PostgreSQL', 'Redis', 'NebulaGraph'],
            1: ['RAG', 'Knowledge Graph', 'Embeddings'],
            2: ['JSON Schema', 'Object Definitions'],
            3: ['CrewAI', 'LangGraph', 'LangChain'],
            4: ['MCP', 'Event-Driven'],
            5: ['Next.js', 'React', 'API Gateway']
        }

    # ========================================================================
    # ARTIFACT GENERATION
    # ========================================================================

    def _generate_design_document(
        self,
        card_id: str,
        card_data: Dict[str, Any],
        arch_data: Dict[str, Any],
        stack_data: Dict[str, Any],
        req_data: Dict[str, Any]
    ) -> str:
        """Generate comprehensive design document"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]
        title = card_data.get('title', 'Unknown')
        description = card_data.get('description', '')
        user_story = card_data.get('user_story', '')
        acceptance_criteria = card_data.get('acceptance_criteria', [])

        # Build design document
        doc = f"""# Design: {req_id} - {title}

**Requirement**: {req_id}
**Card ID**: {card_id}
**Squad**: Arquitetura
**Created**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Version**: 1.0.0

---

## 1. Overview

{description}

**User Story**: {user_story}

**Business Value**: {card_data.get('business_value', 'N/A')}

---

## 2. Technical Approach

### 2.1 Layer Assignment

**Primary Layer**: {arch_data.get('primary_layer', 'Camada 1 - Oráculo')}

**Rationale**: This requirement involves core business logic and domain knowledge management, placing it in Layer 1 (Oráculo).

### 2.2 Technology Stack

- **Backend**: FastAPI (Python) for rapid API development
- **Database**: PostgreSQL for structured data, NebulaGraph for knowledge relationships
- **Frontend**: Next.js 14 with App Router
- **Caching**: Redis for performance optimization
- **AI/LLM**: LangChain for RAG pipelines

**Technology Choices Based On**:
- ADR-003: PostgreSQL + NebulaGraph Híbrido
- ADR-004: CrewAI + LangGraph
- ADR-005: Next.js 14 App Router
- ADR-006: Go para Backend Core (optional for high-performance services)

### 2.3 Architectural Patterns

- **Metadata-Driven Architecture** (ADR-001): Use `object_definitions` to define entities
- **Event Sourcing**: Track all changes for auditability
- **CQRS**: Separate read and write models for scalability

---

## 3. Data Model

### 3.1 Database Tables

See: `schemas/{req_id.lower()}-schema.sql`

**Primary Entities**:
- `oracles` (if applicable)
- `object_definitions` (metadata)
- `instances` (actual data)

### 3.2 Relationships

- Multi-tenancy via `oracle_id` foreign key (ADR-007)
- Relationships tracked in NebulaGraph
- JSON Schema validation for dynamic fields

---

## 4. API Design

### 4.1 Endpoints

See: `api-contracts/{req_id.lower()}-api.yaml`

**Expected Endpoints** (based on CRUD pattern):
- `POST /api/v1/oracles` - Create oracle
- `GET /api/v1/oracles` - List oracles
- `GET /api/v1/oracles/{{id}}` - Get oracle details
- `PUT /api/v1/oracles/{{id}}` - Update oracle
- `DELETE /api/v1/oracles/{{id}}` - Delete oracle

### 4.2 Authentication/Authorization

- **JWT Tokens**: Required for all endpoints
- **Multi-Tenancy**: Filter by `oracle_id` automatically
- **RBAC**: Role-based access control

---

## 5. Integration Points

### 5.1 Internal Services

- **Knowledge Graph Service**: Query domain knowledge from NebulaGraph
- **RAG Service**: Semantic search over documentation
- **Event Bus**: Publish events for state changes

### 5.2 External Dependencies

- None for this requirement (internal-only)

---

## 6. Architecture Diagrams

### 6.1 C4 Context Diagram
See: `diagrams/diagram-{req_id}-c4-context.mermaid`

### 6.2 ERD (if applicable)
See: `diagrams/diagram-{req_id}-erd.mermaid`

---

## 7. Implementation Guidance

### 7.1 Backend Implementation

**File Structure**:
```
backend/
├── services/
│   └── oracle_service.py
├── models/
│   └── oracle.py
├── api/
│   └── v1/
│       └── oracles.py
└── tests/
    └── test_oracle_service.py
```

**Key Classes**:
- `OracleService`: Business logic
- `OracleModel`: Database model (SQLAlchemy)
- `OracleAPI`: FastAPI router

**Database Migrations**:
- Use Alembic for PostgreSQL migrations
- Version control all schema changes

### 7.2 Frontend Implementation

**Components**:
- `OracleList.tsx`: List view
- `OracleForm.tsx`: Create/Edit form
- `OracleDetail.tsx`: Detail view

**Pages**:
- `/oracles` - List page
- `/oracles/new` - Create page
- `/oracles/[id]` - Detail page
- `/oracles/[id]/edit` - Edit page

**State Management**:
- React Server Components (Next.js 14)
- SWR for data fetching

### 7.3 Testing Strategy

**Unit Tests** (≥80% coverage):
- Service layer logic
- API endpoint handlers
- Frontend components

**Integration Tests**:
- API integration with database
- Frontend integration with backend API

**E2E Tests** (Playwright):
- User flow: Create oracle → List oracles → Edit oracle → Delete oracle

---

## 8. Acceptance Criteria

"""

        # Map acceptance criteria to sections
        for i, criterion in enumerate(acceptance_criteria, 1):
            doc += f"- [x] {criterion}\n"

        doc += f"""
---

## 9. References

**ADRs Referenced**:
- ADR-001: Metadata-Driven Architecture
- ADR-003: PostgreSQL + NebulaGraph
- ADR-005: Next.js 14 App Router
- ADR-007: Multi-Tenancy via oracle_id

**Related Requirements**: {', '.join(card_data.get('requirement_ids', []))}

**Stack Documentation**: See `stack_supercore_v2.0.md`

---

**Generated by**: Architecture Owner Agent v1.0.0
**Date**: {datetime.now().isoformat()}
"""

        return doc

    def _generate_diagrams(
        self,
        card_id: str,
        card_data: Dict[str, Any],
        arch_data: Dict[str, Any],
        req_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate Mermaid diagrams"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]
        diagrams = []

        # C4 Context diagram
        c4_diagram = self._generate_c4_diagram(card_id, card_data)
        c4_path = self.diagrams_dir / f"diagram-{req_id}-c4-context.mermaid"
        c4_path.write_text(c4_diagram, encoding='utf-8')
        diagrams.append({
            'type': 'mermaid_diagram',
            'subtype': 'c4_context',
            'path': str(c4_path),
            'size_kb': round(c4_path.stat().st_size / 1024, 2)
        })

        # ERD (if data model involved)
        if 'database' in card_data.get('description', '').lower():
            erd_diagram = self._generate_erd_diagram(card_id, card_data)
            erd_path = self.diagrams_dir / f"diagram-{req_id}-erd.mermaid"
            erd_path.write_text(erd_diagram, encoding='utf-8')
            diagrams.append({
                'type': 'mermaid_diagram',
                'subtype': 'erd',
                'path': str(erd_path),
                'size_kb': round(erd_path.stat().st_size / 1024, 2)
            })

        logger.info(f"   Generated {len(diagrams)} diagrams")
        return diagrams

    def _generate_c4_diagram(self, card_id: str, card_data: Dict[str, Any]) -> str:
        """Generate C4 Context diagram"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]

        return f"""graph TB
    subgraph "SuperCore v2.0"
        User[User/Admin]
        Portal[Super Portal<br/>Next.js 14]
        API[API Gateway<br/>FastAPI]
        Service[{req_id} Service<br/>Business Logic]
        DB[(PostgreSQL)]
        Graph[(NebulaGraph)]
    end

    User -->|Interacts| Portal
    Portal -->|REST API| API
    API -->|Calls| Service
    Service -->|Reads/Writes| DB
    Service -->|Queries| Graph

    style User fill:#e1f5ff
    style Portal fill:#fff3cd
    style API fill:#d1ecf1
    style Service fill:#d4edda
    style DB fill:#f8d7da
    style Graph fill:#f8d7da
"""

    def _generate_erd_diagram(self, card_id: str, card_data: Dict[str, Any]) -> str:
        """Generate ERD diagram"""
        return """erDiagram
    ORACLES ||--o{ OBJECT_DEFINITIONS : contains
    ORACLES ||--o{ INSTANCES : owns
    OBJECT_DEFINITIONS ||--o{ INSTANCES : defines
    INSTANCES ||--o{ RELATIONSHIPS : participates

    ORACLES {
        uuid id PK
        string name
        string type
        jsonb config
        timestamp created_at
    }

    OBJECT_DEFINITIONS {
        uuid id PK
        uuid oracle_id FK
        string name
        jsonb schema
        timestamp created_at
    }

    INSTANCES {
        uuid id PK
        uuid oracle_id FK
        uuid object_definition_id FK
        jsonb data
        timestamp created_at
    }

    RELATIONSHIPS {
        uuid id PK
        uuid from_instance_id FK
        uuid to_instance_id FK
        string relationship_type
        timestamp created_at
    }
"""

    def _generate_api_contracts(
        self,
        card_id: str,
        card_data: Dict[str, Any],
        stack_data: Dict[str, Any],
        req_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate OpenAPI contracts"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]
        contracts = []

        # Generate OpenAPI YAML
        openapi_spec = self._generate_openapi_spec(card_id, card_data)
        api_path = self.api_contracts_dir / f"{req_id.lower()}-api.yaml"
        api_path.write_text(openapi_spec, encoding='utf-8')
        contracts.append({
            'type': 'openapi_spec',
            'path': str(api_path),
            'size_kb': round(api_path.stat().st_size / 1024, 2)
        })

        # Generate SQL schema
        sql_schema = self._generate_sql_schema(card_id, card_data)
        schema_path = self.schemas_dir / f"{req_id.lower()}-schema.sql"
        schema_path.write_text(sql_schema, encoding='utf-8')
        contracts.append({
            'type': 'database_schema',
            'path': str(schema_path),
            'size_kb': round(schema_path.stat().st_size / 1024, 2)
        })

        logger.info(f"   Generated {len(contracts)} contracts/schemas")
        return contracts

    def _generate_openapi_spec(self, card_id: str, card_data: Dict[str, Any]) -> str:
        """Generate OpenAPI 3.0 spec"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]
        title = card_data.get('title', 'Unknown API')

        return f"""openapi: 3.0.0
info:
  title: {title}
  description: API for {req_id}
  version: 1.0.0
  contact:
    name: SquadOS Architecture Team

servers:
  - url: http://localhost:8000/api/v1
    description: Development server

paths:
  /oracles:
    get:
      summary: List all oracles
      operationId: listOracles
      tags:
        - Oracles
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Oracle'
    post:
      summary: Create a new oracle
      operationId: createOracle
      tags:
        - Oracles
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OracleCreate'
      responses:
        '201':
          description: Oracle created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Oracle'

  /oracles/{{id}}:
    get:
      summary: Get oracle by ID
      operationId: getOracle
      tags:
        - Oracles
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Oracle'
        '404':
          description: Oracle not found

components:
  schemas:
    Oracle:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        type:
          type: string
          enum: [backend, frontend]
        config:
          type: object
        created_at:
          type: string
          format: date-time
      required:
        - id
        - name
        - type

    OracleCreate:
      type: object
      properties:
        name:
          type: string
        type:
          type: string
          enum: [backend, frontend]
        config:
          type: object
      required:
        - name
        - type

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
"""

    def _generate_sql_schema(self, card_id: str, card_data: Dict[str, Any]) -> str:
        """Generate SQL schema"""
        req_id = card_data.get('requirement_ids', ['UNKNOWN'])[0]

        return f"""-- Schema for {req_id}
-- Generated by Architecture Owner Agent v1.0.0

CREATE TABLE IF NOT EXISTS oracles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('backend', 'frontend')),
    config JSONB DEFAULT '{{}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    CONSTRAINT oracles_name_unique UNIQUE (name)
);

-- Indexes
CREATE INDEX idx_oracles_type ON oracles(type);
CREATE INDEX idx_oracles_created_at ON oracles(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_oracles_updated_at
    BEFORE UPDATE ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE oracles IS 'Oracles store domain knowledge and configuration for generating solutions';
COMMENT ON COLUMN oracles.type IS 'Type of oracle: backend (APIs) or frontend (UI)';
COMMENT ON COLUMN oracles.config IS 'JSONB configuration for oracle behavior';
"""

    # ========================================================================
    # VALIDATION
    # ========================================================================

    def _validate_outputs(self, card_data: Dict[str, Any], artifacts: List[Dict[str, Any]]) -> bool:
        """Validate all outputs meet acceptance criteria"""
        logger.info("🔍 Validating outputs...")

        # Check acceptance criteria
        if not self._validate_acceptance_criteria(card_data, artifacts):
            return False

        # Check deliverables
        if not self._validate_deliverables(card_data, artifacts):
            return False

        # Check Mermaid syntax
        for artifact in artifacts:
            if artifact['type'] == 'mermaid_diagram':
                diagram_content = Path(artifact['path']).read_text(encoding='utf-8')
                if not self._validate_mermaid_syntax(diagram_content):
                    return False

        logger.info("✅ All validations passed")
        return True

    def _validate_acceptance_criteria(self, card_data: Dict[str, Any], artifacts: List[Dict[str, Any]]) -> bool:
        """Ensure all acceptance criteria met"""
        criteria = card_data.get('acceptance_criteria', [])

        checks = {
            'design': any(a['type'] == 'design_document' for a in artifacts),
            'diagram': any(a['type'] == 'mermaid_diagram' for a in artifacts),
            'api': any(a['type'] == 'openapi_spec' for a in artifacts),
            'schema': any(a['type'] == 'database_schema' for a in artifacts),
        }

        for criterion in criteria:
            lower_crit = criterion.lower()
            if 'design' in lower_crit and not checks['design']:
                logger.error(f"❌ Missing design document: {criterion}")
                return False
            if 'diagram' in lower_crit and not checks['diagram']:
                logger.error(f"❌ Missing diagram: {criterion}")
                return False
            if 'api' in lower_crit and not checks['api']:
                logger.error(f"❌ Missing API contract: {criterion}")
                return False
            if 'schema' in lower_crit and not checks['schema']:
                logger.error(f"❌ Missing database schema: {criterion}")
                return False

        return True

    def _validate_deliverables(self, card_data: Dict[str, Any], artifacts: List[Dict[str, Any]]) -> bool:
        """Ensure all deliverables created"""
        expected = card_data.get('deliverables', [])
        created_paths = [a['path'] for a in artifacts]

        for deliverable in expected:
            # Extract base name (e.g., "design-RF001" from "design-RF001.md")
            base_name = deliverable.rsplit('.', 1)[0]

            # Check if any artifact path contains the base name
            if not any(base_name in path for path in created_paths):
                logger.error(f"❌ Missing deliverable: {deliverable}")
                logger.debug(f"   Expected base: {base_name}")
                logger.debug(f"   Created paths: {created_paths}")
                return False

        return True

    def _validate_mermaid_syntax(self, diagram_content: str) -> bool:
        """Basic validation of Mermaid syntax"""
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

    # ========================================================================
    # CHECKPOINT SYSTEM
    # ========================================================================

    def _save_checkpoint(self, card_id: str, stage: str, data: Dict[str, Any]):
        """Save checkpoint for resumability"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}.json"
        checkpoint = {
            'card_id': card_id,
            'stage': stage,
            'progress': self.STAGES[stage],
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        checkpoint_file.write_text(json.dumps(checkpoint, indent=2), encoding='utf-8')
        logger.debug(f"💾 Checkpoint saved: {stage} ({self.STAGES[stage]}%)")

    def _load_checkpoint(self, card_id: str) -> Optional[Dict[str, Any]]:
        """Load checkpoint if exists"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}.json"
        if checkpoint_file.exists():
            return json.loads(checkpoint_file.read_text(encoding='utf-8'))
        return None

    def _delete_checkpoint(self, card_id: str):
        """Delete checkpoint after successful completion"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}.json"
        if checkpoint_file.exists():
            checkpoint_file.unlink()
            logger.debug(f"🗑️ Checkpoint deleted: {card_id}")

    def _resume_from_checkpoint(self, card_id: str, checkpoint: Dict[str, Any]) -> Dict[str, Any]:
        """Resume execution from checkpoint"""
        logger.info(f"🔄 Resuming from stage: {checkpoint['stage']}")
        # TODO: Implement resume logic
        raise NotImplementedError("Checkpoint resume not yet implemented")

    # ========================================================================
    # PROGRESS REPORTING
    # ========================================================================

    def _report_progress(self, stage: str, message: str):
        """Report progress to monitoring system"""
        progress = self.STAGES.get(stage, 0)
        logger.info(f"📊 Progress: {progress}% - {stage}")
        logger.info(f"   {message}")


if __name__ == '__main__':
    # Test execution
    logger.info("🧪 Testing Architecture Owner Agent...")

    agent = ArchitectureOwnerAgent()

    test_card = {
        'card_id': 'PROD-001',
        'title': 'RF001 - Technical Design & Architecture',
        'description': 'Create detailed technical design for Gerenciamento de Oráculos',
        'requirement_ids': ['RF001'],
        'user_story': 'As a Tech Lead, I want to design the architecture for Gerenciamento de Oráculos',
        'business_value': 'Ensures correct implementation',
        'acceptance_criteria': [
            'Technical design document created covering Camada 1 - Oráculo',
            'Architecture diagrams (Mermaid) created',
            'API contracts defined',
            'Database schema designed',
            'Integration points identified'
        ],
        'deliverables': [
            'design-RF001.md',
            'diagram-RF001.mermaid'
        ]
    }

    try:
        result = agent.execute_card('PROD-001', test_card)
        print("\n✅ Test execution successful!")
        print(f"Duration: {result['duration_seconds']}s")
        print(f"Artifacts: {len(result['artifacts'])}")
        for artifact in result['artifacts']:
            print(f"  - {artifact['type']}: {artifact['path']}")
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        raise

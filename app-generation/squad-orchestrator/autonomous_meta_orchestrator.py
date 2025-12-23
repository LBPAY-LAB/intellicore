#!/usr/bin/env python3
"""
Autonomous Meta-Orchestrator
=============================

Reads SuperCore v2.0 documentation and autonomously creates work cards,
spawning squads and coordinating the entire project development without
any human intervention.

This script runs in the background after clicking "Iniciar Projeto em Background"
and continues working until the project reaches 100% completion.
"""

import json
import time
import logging
import sqlite3
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio

# Celery integration (optional - falls back to subprocess if not available)
USE_CELERY = os.getenv("USE_CELERY", "true").lower() == "true"

if USE_CELERY:
    try:
        from tasks import execute_card_task
        CELERY_AVAILABLE = True
        logger_temp = logging.getLogger('meta-orchestrator')
        logger_temp.info("✅ Celery integration enabled")
    except ImportError as e:
        CELERY_AVAILABLE = False
        logger_temp = logging.getLogger('meta-orchestrator')
        logger_temp.warning(f"⚠️  Celery not available ({e}), falling back to subprocess")
else:
    CELERY_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/jose.silva.lb/LBPay/supercore/scripts/squad-orchestrator/logs/meta-orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('meta-orchestrator')

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DOCS_DIR = PROJECT_ROOT / "Supercore_v2.0" / "DOCUMENTACAO_BASE"
STATE_DIR = SCRIPT_DIR / "state"
BACKLOG_FILE = STATE_DIR / "backlog_master.json"
JOURNAL_FILE = STATE_DIR / "project_journal.json"
DB_PATH = SCRIPT_DIR / "monitoring" / "data" / "monitoring.db"


class AutonomousMetaOrchestrator:
    """
    Autonomous orchestrator that reads docs, creates cards, and coordinates all squads.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.script_dir = SCRIPT_DIR  # Path to squad-orchestrator directory
        self.backlog = self._load_backlog()
        self.journal = self._load_journal()
        self.card_counter = self._get_next_card_id()

    def _load_backlog(self) -> Dict[str, Any]:
        """Load current backlog state"""
        if BACKLOG_FILE.exists():
            with open(BACKLOG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "version": "2.0.0",
            "project": "SuperCore v2.0",
            "last_updated": datetime.now().isoformat(),
            "current_sprint": 1,
            "cards": [],
            "metadata": {
                "total_cards": 0,
                "by_status": {
                    "TODO": 0,
                    "IN_PROGRESS": 0,
                    "BLOCKED": 0,
                    "IN_REVIEW": 0,
                    "DONE": 0
                }
            }
        }

    def _load_journal(self) -> List[Dict[str, Any]]:
        """Load project journal"""
        if JOURNAL_FILE.exists():
            with open(JOURNAL_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def _get_next_card_id(self) -> int:
        """Get next card ID number"""
        if not self.backlog.get("cards"):
            return 1
        existing_ids = [
            int(card["card_id"].split("-")[1])
            for card in self.backlog["cards"]
            if "-" in card["card_id"]
        ]
        return max(existing_ids) + 1 if existing_ids else 1

    def _save_backlog(self):
        """Save backlog to disk AND portal database"""
        self.backlog["last_updated"] = datetime.now().isoformat()

        # Initialize metadata if not exists
        if "metadata" not in self.backlog:
            self.backlog["metadata"] = {}

        # Update metadata
        self.backlog["metadata"]["total_cards"] = len(self.backlog["cards"])
        status_counts = {"TODO": 0, "IN_PROGRESS": 0, "BLOCKED": 0, "IN_REVIEW": 0, "DONE": 0}
        for card in self.backlog["cards"]:
            status = card.get("status", "TODO")
            status_counts[status] = status_counts.get(status, 0) + 1
        self.backlog["metadata"]["by_status"] = status_counts

        # Save to JSON (backward compatibility)
        with open(BACKLOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.backlog, f, indent=2, ensure_ascii=False)

        # Save directly to portal SQLite database
        self._sync_to_portal_db()

        logger.info(f"✅ Backlog saved: {len(self.backlog['cards'])} cards (JSON + Portal DB)")

    def _sync_to_portal_db(self):
        """Sync backlog cards directly to portal SQLite database"""
        if not DB_PATH.exists():
            logger.warning(f"⚠️  Portal DB not found: {DB_PATH}")
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Use INSERT OR REPLACE to handle existing cards
            for card in self.backlog.get("cards", []):
                cursor.execute("""
                    INSERT OR REPLACE INTO cards (
                        card_id, title, squad, status, priority, agent,
                        started_at, completed_at, qa_cycles, test_coverage,
                        session_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    card.get("card_id"),
                    card.get("title"),
                    card.get("squad"),
                    card.get("status", "TODO"),
                    card.get("priority", "MEDIUM"),
                    card.get("assigned_to"),  # Maps to 'agent' column
                    card.get("started_at"),
                    card.get("completed_at"),
                    card.get("qa_cycles", 0),
                    card.get("test_coverage", 0.0),
                    self.session_id,
                    card.get("created_at", datetime.now().isoformat()),
                    card.get("updated_at", datetime.now().isoformat())
                ))

            conn.commit()
            conn.close()

            # Log stats
            total = len(self.backlog.get("cards", []))
            by_status = {}
            for card in self.backlog.get("cards", []):
                status = card.get("status", "TODO")
                by_status[status] = by_status.get(status, 0) + 1

            logger.debug(f"🔄 Synced {total} cards to portal DB: TODO={by_status.get('TODO', 0)}, IN_PROGRESS={by_status.get('IN_PROGRESS', 0)}, DONE={by_status.get('DONE', 0)}")

        except Exception as e:
            logger.error(f"❌ Error syncing to portal DB: {e}")

    def _save_journal(self):
        """Save journal to disk"""
        with open(JOURNAL_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.journal, f, indent=2, ensure_ascii=False)

    def _save_artifacts(self):
        """Save cards as JSON and Markdown files in artefactos_implementacao"""
        artifacts_dir = PROJECT_ROOT / "artefactos_implementacao" / "produto"

        # Save backlog JSON
        backlog_dir = artifacts_dir / "backlog"
        backlog_dir.mkdir(exist_ok=True, parents=True)
        backlog_file = backlog_dir / "backlog.json"
        with open(backlog_file, 'w', encoding='utf-8') as f:
            json.dump(self.backlog, f, indent=2, ensure_ascii=False)
        logger.debug(f"💾 Saved backlog JSON: {backlog_file}")

        # Save individual card files as markdown
        cards_dir = artifacts_dir / "cards"
        cards_dir.mkdir(exist_ok=True, parents=True)
        for card in self.backlog["cards"]:
            card_file = cards_dir / f"{card['card_id']}.md"
            with open(card_file, 'w', encoding='utf-8') as f:
                f.write(f"# {card['title']}\n\n")
                f.write(f"**Card ID**: {card['card_id']}\n")
                f.write(f"**Squad**: {card['squad']}\n")
                f.write(f"**Status**: {card['status']}\n")
                f.write(f"**Priority**: {card['priority']}\n")
                f.write(f"**Phase**: {card.get('phase', 1)}\n")
                f.write(f"**Type**: {card.get('type', 'story')}\n\n")

                f.write(f"## Description\n\n{card['description']}\n\n")

                if card.get('acceptance_criteria'):
                    f.write(f"## Acceptance Criteria\n\n")
                    for criteria in card['acceptance_criteria']:
                        f.write(f"- {criteria}\n")
                    f.write("\n")

                if card.get('depends_on'):
                    f.write(f"## Dependencies\n\n")
                    for dep in card['depends_on']:
                        f.write(f"- {dep}\n")
                    f.write("\n")

                f.write(f"---\n\n")
                f.write(f"*Created: {card.get('created_at', 'N/A')}*\n")
                f.write(f"*Updated: {card.get('updated_at', 'N/A')}*\n")

        logger.info(f"✅ Saved artifacts to {artifacts_dir}: {len(self.backlog['cards'])} cards")

    def _log_journal_entry(self, title: str, description: str = "", event_type: str = "info"):
        """Add entry to project journal"""
        entry = {
            "id": len(self.journal) + 1,
            "timestamp": datetime.now().isoformat(),
            "title": title,
            "description": description,
            "type": event_type,
            "session_id": self.session_id
        }
        self.journal.append(entry)
        self._save_journal()
        logger.info(f"📖 Journal: {title}")

    def create_card(self, card_id: str, title: str, description: str, squad: str,
                    priority: str = "MEDIUM", depends_on: List[str] = None,
                    acceptance_criteria: List[str] = None, card_type: str = "story",
                    phase: int = 1) -> Dict[str, Any]:
        """Create a new work card matching Card dataclass schema"""

        # Check if card already exists (deduplication)
        existing_card = next((c for c in self.backlog["cards"] if c["card_id"] == card_id), None)
        if existing_card:
            logger.warning(f"⚠️  Card {card_id} already exists, skipping creation")
            return existing_card

        card = {
            "card_id": card_id,
            "title": title,
            "description": description,
            "type": card_type,
            "squad": squad,
            "phase": phase,
            "status": "TODO",
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "assigned_to": None,
            "parent_card": None,
            "child_cards": [],
            "depends_on": depends_on or [],
            "blocks": [],
            "acceptance_criteria": acceptance_criteria or [],
            "deliverables": [],
            "tags": [],
            "story_points": 0,
            "created_by": "meta-orchestrator",
            "started_at": None,
            "completed_at": None,
            "state_history": [],
            "comments": [],
            "qa_cycles": 0,
            "blocked_reason": None,
            "blocked_since": None
        }

        self.backlog["cards"].append(card)
        self._save_backlog()
        self._save_artifacts()

        self._log_journal_entry(
            f"📋 Card Created: {card_id}",
            f"{title} (Squad: {squad}, Priority: {priority})",
            "card_created"
        )

        logger.info(f"✅ Created card {card_id}: {title}")
        return card

    async def read_documentation(self) -> Dict[str, str]:
        """Read all project documentation"""
        self._log_journal_entry(
            "📖 Meta-Orchestrator: Reading Documentation",
            "Analyzing all files in Supercore_v2.0/DOCUMENTACAO_BASE/",
            "orchestrator_action"
        )

        docs = {}
        doc_files = [
            "requisitos_funcionais_v2.0.md",
            "arquitetura_supercore_v2.0.md",
            "stack_supercore_v2.0.md",
            "fluxos_usuario_v2.0.md"
        ]

        for doc_file in doc_files:
            file_path = DOCS_DIR / doc_file
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    docs[doc_file] = f.read()
                logger.info(f"✅ Read documentation: {doc_file}")
            else:
                logger.warning(f"⚠️  Documentation not found: {doc_file}")

        return docs

    async def create_initial_cards(self):
        """
        Create EPIC-001 card for Product Owner Agent to execute via Celery

        The Product Owner Agent (agents/product_owner_agent.py) will:
        1. Read ALL documentation (requisitos_funcionais, arquitetura, stack)
        2. Analyze deeply using Anthropic Claude API
        3. Generate 50-80+ comprehensive product cards
        4. Create all artifacts (wireframes, user stories, backlog)

        This card will be picked up by Celery workers and executed autonomously.
        NO MOCKS. REAL PRODUCTION IMPLEMENTATION.
        """
        self._log_journal_entry(
            "🎯 Meta-Orchestrator: Creating Product Owner Epic",
            "Creating EPIC-001 for Product Owner Agent to analyze documentation and generate complete backlog",
            "orchestrator_action"
        )

        # Create EPIC-001: Product Owner - Complete Documentation Analysis & Backlog Generation
        self.create_card(
            card_id="EPIC-001",
            title="Product Owner - Complete Documentation Analysis & Backlog Generation",
            description="""
**CRITICAL TASK**: Product Owner Agent must autonomously:

1. **Read ALL Documentation**:
   - Supercore_v2.0/DOCUMENTACAO_BASE/requisitos_funcionais_v2.0.md
   - Supercore_v2.0/DOCUMENTACAO_BASE/arquitetura_supercore_v2.0.md
   - Supercore_v2.0/DOCUMENTACAO_BASE/stack_supercore_v2.0.md

2. **Deep Analysis with LLM**:
   - Analyze ALL functional requirements (RF001-RF039+)
   - Extract features, epics, user stories
   - Map dependencies between requirements
   - Prioritize using MoSCoW framework

3. **Generate Comprehensive Product Backlog**:
   - MINIMUM 50 cards (expected 50-80+)
   - Each card MUST have:
     - User story: "As a [user], I want [action], so that [benefit]"
     - 3-5 testable acceptance criteria
     - Effort estimate (S, M, L, XL)
     - Business value
     - Dependencies
   - Cover ALL 39+ functional requirements

4. **Create Artifacts**:
   - backlog_produto_completo.json (complete backlog)
   - MVP_Features.md (prioritized features)
   - User_Stories_Completo.md (all user stories)
   - Success_Metrics.md (KPIs and metrics)
   - ux-designs/wireframes/ (wireframe descriptions)
   - ux-designs/user-flows/ (user flow diagrams)

5. **Validate Outputs**:
   - Verify minimum 50 cards generated
   - Ensure all cards have required fields
   - Check all artifacts created

**Agent**: `agents/product_owner_agent.py`
**Execution**: Via Celery task `execute_product_owner_card()`
**Output**: Cards saved to `state/backlog_master.json` + artifacts in `artefactos_implementacao/produto/`

**THIS IS THE FOUNDATION OF THE ENTIRE PROJECT.**
All subsequent squads (Arquitetura, Engenharia, QA, Deploy) depend on these cards.
            """,
            squad="produto",
            priority="CRITICAL",
            card_type="epic",
            phase=1,
            acceptance_criteria=[
                "✅ Product Owner Agent successfully executed",
                "✅ Minimum 50 product cards generated",
                "✅ All 39+ functional requirements covered by cards",
                "✅ Each card has user story and acceptance criteria",
                "✅ backlog_produto_completo.json created",
                "✅ MVP_Features.md created",
                "✅ User_Stories_Completo.md created",
                "✅ Success_Metrics.md created",
                "✅ Wireframes index created",
                "✅ All cards saved to state/backlog_master.json"
            ]
        )

        self._log_journal_entry(
            "✅ EPIC-001 Created",
            "Product Owner Epic created. When executed by Celery worker, will generate 50-80+ cards autonomously.",
            "milestone_progress"
        )

        logger.info(f"✅ Created EPIC-001 for Product Owner Agent execution via Celery")

    async def create_architecture_cards(self):
        """Create cards for Phase 2: Arquitetura (triggered when Produto phase completes)"""
        self._log_journal_entry(
            "🎯 Phase 1 Complete → Creating Architecture Cards",
            "Generating Phase 2 (Arquitetura) work items",
            "phase_transition"
        )

        # EPIC-002: Architecture Design
        self.create_card(
            card_id="EPIC-002",
            title="System Architecture Design",
            description="Design complete system architecture based on product requirements",
            squad="arquitetura",
            priority="CRITICAL",
            card_type="epic",
            phase=2,
            depends_on=["EPIC-001"]
        )

        # ARCH-001: Database Schema
        self.create_card(
            card_id="ARCH-001",
            title="Design Database Schema (PostgreSQL + Qdrant + NebulaGraph)",
            description="""
Design comprehensive database architecture:
- PostgreSQL: Transactional data, user data, company data
- Qdrant: Vector embeddings for semantic search
- NebulaGraph: Company relationships and knowledge graph

Deliverable: /artefactos_implementacao/arquitetura/Database_Schema.md
            """,
            squad="arquitetura",
            priority="CRITICAL",
            phase=2,
            depends_on=["EPIC-002", "PROD-001"],
            acceptance_criteria=[
                "PostgreSQL schema designed with pgvector",
                "Qdrant collections defined",
                "NebulaGraph schema defined",
                "ERD diagrams created"
            ]
        )

        # ARCH-002: API Contracts
        self.create_card(
            card_id="ARCH-002",
            title="Define API Contracts (REST + GraphQL)",
            description="""
Design all API endpoints and contracts:
- REST APIs for CRUD operations
- GraphQL for complex queries
- WebSocket for real-time updates

Deliverable: /artefactos_implementacao/arquitetura/API_Contracts.md
            """,
            squad="arquitetura",
            priority="CRITICAL",
            phase=2,
            depends_on=["EPIC-002", "ARCH-001"],
            acceptance_criteria=[
                "All REST endpoints documented",
                "GraphQL schema defined",
                "WebSocket events specified",
                "Request/Response examples provided"
            ]
        )

        # ARCH-003: Security Design
        self.create_card(
            card_id="ARCH-003",
            title="Design Security & Authentication Flow",
            description="""
Design complete security architecture:
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-tenant data isolation
- API rate limiting

Deliverable: /artefactos_implementacao/arquitetura/Security_Design.md
            """,
            squad="arquitetura",
            priority="CRITICAL",
            phase=2,
            depends_on=["EPIC-002"],
            acceptance_criteria=[
                "Authentication flow designed",
                "Authorization model defined",
                "Security policies documented",
                "Threat model created"
            ]
        )

        # ARCH-004: RAG Pipeline Architecture
        self.create_card(
            card_id="ARCH-004",
            title="Design RAG Pipeline Architecture",
            description="""
Design end-to-end RAG pipeline:
- Document ingestion & chunking
- Embedding generation
- Vector storage & retrieval
- LLM integration for generation

Deliverable: /artefactos_implementacao/arquitetura/RAG_Pipeline.md
            """,
            squad="arquitetura",
            priority="HIGH",
            phase=2,
            depends_on=["EPIC-002", "ARCH-001"],
            acceptance_criteria=[
                "Ingestion pipeline designed",
                "Chunking strategy defined",
                "Embedding model selected",
                "Retrieval logic specified"
            ]
        )

        logger.info("✅ Created architecture cards for Phase 2")

    async def execute_ready_cards(self):
        """Execute cards that are ready (TODO status, dependencies met)"""
        # Find TODO cards with no pending dependencies
        ready_cards = []
        for card in self.backlog["cards"]:
            if card["status"] != "TODO":
                continue

            # Check dependencies
            deps_met = True
            for dep_id in card.get("depends_on", []):
                dep_card = next((c for c in self.backlog["cards"] if c["card_id"] == dep_id), None)
                if not dep_card or dep_card["status"] != "DONE":
                    deps_met = False
                    break

            if deps_met:
                ready_cards.append(card)

        if not ready_cards:
            return 0

        # Execute cards
        executed = 0

        if CELERY_AVAILABLE:
            # Use Celery for distributed execution
            for card in ready_cards[:1]:  # Execute only 1 card per iteration for now
                logger.info(f"🚀 [Celery] Enqueuing card {card['card_id']}: {card['title']}")

                try:
                    # Enqueue task to Celery
                    result = execute_card_task.delay(card["card_id"])

                    # Store task ID in database
                    self._update_card_celery_task_id(card["card_id"], result.id)

                    logger.info(f"✅ Card {card['card_id']} enqueued. Task ID: {result.id}")
                    executed += 1

                except Exception as e:
                    logger.error(f"❌ Error enqueuing card {card['card_id']}: {e}")

        else:
            # Fallback to subprocess (original behavior)
            import subprocess

            for card in ready_cards[:1]:  # Execute only 1 card per iteration for now
                logger.info(f"🚀 [Subprocess] Executing card {card['card_id']}: {card['title']}")

                try:
                    # Run agent executor for this card
                    cmd = [
                        "python3",
                        str(self.script_dir / "agent_executor.py"),
                        "--card-id", card["card_id"]
                    ]

                    result = subprocess.run(
                        cmd,
                        cwd=self.script_dir.parent,
                        capture_output=True,
                        text=True,
                        timeout=1800  # 30 min timeout
                    )

                    if result.returncode == 0:
                        logger.info(f"✅ Card {card['card_id']} executed successfully")
                        executed += 1
                    else:
                        logger.error(f"❌ Card {card['card_id']} execution failed: {result.stderr[:200]}")

                except subprocess.TimeoutExpired:
                    logger.error(f"⏱ Card {card['card_id']} execution timed out")
                except Exception as e:
                    logger.error(f"❌ Error executing card {card['card_id']}: {e}")

        return executed

    def _update_card_celery_task_id(self, card_id: str, task_id: str):
        """Update card with Celery task ID"""
        # Update in memory
        for card in self.backlog["cards"]:
            if card["card_id"] == card_id:
                card["celery_task_id"] = task_id
                break

        # Save to disk
        self._save_backlog()

        logger.debug(f"📝 Updated card {card_id} with Celery task ID: {task_id}")

    def _is_paused(self) -> bool:
        """Check if project is paused"""
        pause_file = STATE_DIR / "pause.json"
        if pause_file.exists():
            try:
                with open(pause_file, 'r', encoding='utf-8') as f:
                    pause_state = json.load(f)
                return pause_state.get("paused", False)
            except Exception as e:
                logger.warning(f"⚠️  Error reading pause state: {e}")
                return False
        return False

    async def monitor_and_coordinate(self):
        """
        Continuously monitor backlog and coordinate squad work.
        This is where the autonomous orchestration happens.
        """
        self._log_journal_entry(
            "🤖 Meta-Orchestrator: Starting Autonomous Monitoring",
            "Continuously monitoring progress and coordinating squads",
            "orchestrator_action"
        )

        iteration = 0
        while True:
            iteration += 1

            # Check pause flag
            if self._is_paused():
                logger.info("⏸️  Project paused. Waiting for resume...")
                await asyncio.sleep(60)  # Check every minute when paused
                continue

            logger.info(f"🔄 Monitoring iteration {iteration}")

            # Reload backlog to see any external changes
            self.backlog = self._load_backlog()

            # Check completion status
            total_cards = len(self.backlog["cards"])
            done_cards = len([c for c in self.backlog["cards"] if c["status"] == "DONE"])

            if total_cards > 0:
                completion_pct = (done_cards / total_cards) * 100
                logger.info(f"📊 Progress: {done_cards}/{total_cards} cards done ({completion_pct:.1f}%)")

                # Execute ready cards
                executed = await self.execute_ready_cards()
                if executed > 0:
                    logger.info(f"✅ Executed {executed} cards this iteration")

                # Check for phase transitions
                prod_cards = [c for c in self.backlog["cards"] if c["card_id"].startswith("PROD-")]
                prod_done = all(c["status"] == "DONE" for c in prod_cards) if prod_cards else False

                arch_cards = [c for c in self.backlog["cards"] if c["card_id"].startswith("ARCH-")]

                # Trigger Phase 2 when Phase 1 completes
                if prod_done and not arch_cards:
                    logger.info("🎯 Phase 1 Complete! Creating Phase 2 (Architecture) cards...")
                    await self.create_architecture_cards()

            # Sleep before next iteration
            await asyncio.sleep(30)  # Check every 30 seconds

    async def run(self):
        """Main autonomous orchestration loop"""
        logger.info("=" * 80)
        logger.info("🚀 AUTONOMOUS META-ORCHESTRATOR STARTING")
        logger.info(f"Session: {self.session_id}")
        logger.info("=" * 80)

        self._log_journal_entry(
            "🚀 Meta-Orchestrator Started",
            f"Session {self.session_id} - Beginning autonomous project orchestration",
            "orchestrator_started"
        )

        # Step 1: Read documentation
        docs = await self.read_documentation()
        logger.info(f"✅ Read {len(docs)} documentation files")

        # Step 2: Create initial cards (Phase 1: Produto)
        await self.create_initial_cards()

        # Step 3: Start autonomous monitoring and coordination
        await self.monitor_and_coordinate()


async def main():
    """Entry point for autonomous meta-orchestrator"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 autonomous_meta_orchestrator.py <session_id>")
        sys.exit(1)

    session_id = sys.argv[1]

    orchestrator = AutonomousMetaOrchestrator(session_id)
    await orchestrator.run()


if __name__ == "__main__":
    asyncio.run(main())

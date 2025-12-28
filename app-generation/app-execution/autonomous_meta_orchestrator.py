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

# Paths (configure before logging)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DOCS_DIR = SCRIPT_DIR.parent / "documentation-base"
STATE_DIR = SCRIPT_DIR / "state"
BACKLOG_FILE = STATE_DIR / "backlog_master.json"
JOURNAL_FILE = STATE_DIR / "project_journal.json"
LOGS_DIR = SCRIPT_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)  # Ensure logs directory exists
DB_PATH = SCRIPT_DIR.parent / "execution-portal" / "backend" / "data" / "monitoring.db"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / 'meta-orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('meta-orchestrator')


class HumanRejectionError(Exception):
    """Raised when human rejects a review checkpoint"""
    pass


class AutonomousMetaOrchestrator:
    """
    Autonomous orchestrator that reads docs, creates cards, and coordinates all squads.
    Includes Human-in-the-Loop reviews every 6 hours for validation and course correction.
    """

    # Human review checkpoint interval (6 hours in seconds)
    REVIEW_INTERVAL_HOURS = 6
    REVIEW_INTERVAL_SECONDS = REVIEW_INTERVAL_HOURS * 3600

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.script_dir = SCRIPT_DIR  # Path to squad-orchestrator directory
        self.backlog = self._load_backlog()
        self.journal = self._load_journal()
        self.card_counter = self._get_next_card_id()
        self.last_review_time = datetime.now()  # Track time since last review
        self._ensure_review_table_exists()

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
        """Save cards as JSON and Markdown files in app-artefacts"""
        artifacts_dir = PROJECT_ROOT / "app-artefacts" / "produto"

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
                f.write(f"**Squad**: {card.get('squad', 'unknown')}\n")
                f.write(f"**Status**: {card.get('status', 'TODO')}\n")
                f.write(f"**Priority**: {card.get('priority', 'MEDIUM')}\n")
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
            "Analyzing all files in documentation-base/",
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
   - documentation-base/requisitos_funcionais_v2.0.md
   - documentation-base/arquitetura_supercore_v2.0.md
   - documentation-base/stack_supercore_v2.0.md

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
**Output**: Cards saved to `state/backlog_master.json` + artifacts in `app-artefacts/produto/`

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

Deliverable: /app-artefacts/arquitetura/Database_Schema.md
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

Deliverable: /app-artefacts/arquitetura/API_Contracts.md
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

Deliverable: /app-artefacts/arquitetura/Security_Design.md
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

Deliverable: /app-artefacts/arquitetura/RAG_Pipeline.md
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
        """Execute cards that are ready (TODO status, dependencies met, not already enqueued)"""
        # Find TODO cards with no pending dependencies and no active Celery task
        ready_cards = []
        for card in self.backlog["cards"]:
            if card["status"] != "TODO":
                continue

            # CRITICAL: Skip if card already has a Celery task ID (already enqueued)
            if card.get("celery_task_id"):
                # Card is already being executed by a worker, skip it
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
        try:
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
            logger.info("\n📖 STEP 1: Reading Documentation...")
            docs = await self.read_documentation()
            logger.info(f"✅ STEP 1 COMPLETE: Read {len(docs)} documentation files")

            # Step 2: Create initial cards (Phase 1: Produto)
            logger.info("\n📋 STEP 2: Creating Initial Cards...")
            await self.create_initial_cards()
            logger.info(f"✅ STEP 2 COMPLETE: Created {len(self.backlog['cards'])} cards")

            # CHECKPOINT: Human review after backlog generation
            if self._should_trigger_review():
                await self._request_human_review(
                    phase="Product Backlog Generated",
                    summary=f"{len(self.backlog['cards'])} PROD cards created from requirements",
                    artifacts=["app-artefacts/produto/backlog.json", "app-artefacts/produto/User_Stories_Completo.md"]
                )

            # Step 3: Start autonomous monitoring and coordination
            logger.info("\n🔄 STEP 3: Starting Monitoring and Coordination Loop...")
            logger.info("⚠️  This will run FOREVER until project completes or is stopped")
            await self.monitor_and_coordinate()

        except Exception as e:
            logger.error(f"❌ CRITICAL ERROR in orchestrator.run(): {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Re-raise to ensure process exits with error
            raise

    def _ensure_review_table_exists(self):
        """Ensure human_reviews table exists in portal database"""
        if not DB_PATH.exists():
            logger.warning(f"⚠️  Portal DB not found, skipping review table creation")
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Create human_reviews table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS human_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    review_id TEXT NOT NULL UNIQUE,
                    phase TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    artifacts TEXT,
                    status TEXT NOT NULL DEFAULT 'AWAITING_APPROVAL',
                    approved_by TEXT,
                    approved_at TEXT,
                    rejection_reason TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            """)

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_human_reviews_session ON human_reviews(session_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_human_reviews_status ON human_reviews(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_human_reviews_review_id ON human_reviews(review_id)")

            conn.commit()
            conn.close()
            logger.debug("✅ Human reviews table ensured")

        except Exception as e:
            logger.error(f"❌ Failed to ensure review table: {e}")

    def _should_trigger_review(self) -> bool:
        """Check if enough time has elapsed since last human review"""
        elapsed = (datetime.now() - self.last_review_time).total_seconds()
        return elapsed >= self.REVIEW_INTERVAL_SECONDS

    async def _request_human_review(self, phase: str, summary: str, artifacts: List[str]) -> None:
        """
        Pause execution and request human approval

        Args:
            phase: Current phase (e.g., "Product Backlog Generated", "Technical Designs Complete")
            summary: Summary of work done since last review
            artifacts: List of artifact paths created

        Raises:
            HumanRejectionError: If human rejects the review
        """
        import uuid

        review_id = f"REVIEW-{uuid.uuid4().hex[:8]}"

        review_request = {
            "session_id": self.session_id,
            "review_id": review_id,
            "phase": phase,
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "artifacts": json.dumps(artifacts),
            "status": "AWAITING_APPROVAL"
        }

        # Save review request to database
        self._save_review_request(review_request)

        # Log to journal
        self._log_journal_entry(
            f"⏸️ Human Review Required: {phase}",
            summary,
            "human_review_requested"
        )

        logger.info("="*80)
        logger.info(f"⏸️  EXECUTION PAUSED - Awaiting human review")
        logger.info(f"   Review ID: {review_id}")
        logger.info(f"   Phase: {phase}")
        logger.info(f"   Summary: {summary}")
        logger.info(f"   Artifacts: {len(artifacts)} files")
        logger.info("="*80)

        # Block until approval received
        await self._wait_for_approval(review_id)

        # Reset review timer
        self.last_review_time = datetime.now()

        logger.info(f"✅ Human approval received. Resuming execution...")

    def _save_review_request(self, review: Dict[str, Any]) -> None:
        """Save review request to portal database"""
        if not DB_PATH.exists():
            logger.warning(f"⚠️  Portal DB not found, review request not saved")
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO human_reviews (
                    session_id, review_id, phase, timestamp, summary,
                    artifacts, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                review["session_id"],
                review["review_id"],
                review["phase"],
                review["timestamp"],
                review["summary"],
                review["artifacts"],
                review["status"]
            ))

            conn.commit()
            conn.close()

            logger.info(f"💾 Review request saved: {review['review_id']}")

        except Exception as e:
            logger.error(f"❌ Failed to save review request: {e}")

    async def _wait_for_approval(self, review_id: str) -> None:
        """
        Block execution until human approves via Portal UI

        Args:
            review_id: Review request ID

        Raises:
            HumanRejectionError: If human rejects
        """
        if not DB_PATH.exists():
            logger.warning(f"⚠️  Portal DB not found, skipping approval wait")
            return

        while True:
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()

                cursor.execute(
                    "SELECT status, approved_by, rejection_reason FROM human_reviews WHERE review_id = ?",
                    (review_id,)
                )
                row = cursor.fetchone()
                conn.close()

                if not row:
                    logger.error(f"❌ Review {review_id} not found in database")
                    break

                status, approved_by, rejection_reason = row

                if status == "APPROVED":
                    logger.info(f"✅ Review {review_id} APPROVED by {approved_by}")
                    return

                elif status == "REJECTED":
                    logger.error(f"❌ Review {review_id} REJECTED by {approved_by}")
                    logger.error(f"   Reason: {rejection_reason}")
                    raise HumanRejectionError(f"Human rejected phase: {rejection_reason}")

                # Still awaiting - sleep and retry
                await asyncio.sleep(10)  # Poll every 10 seconds

            except HumanRejectionError:
                raise
            except Exception as e:
                logger.error(f"❌ Error checking approval status: {e}")
                await asyncio.sleep(10)


async def main():
    """Entry point for autonomous meta-orchestrator"""
    import sys

    try:
        if len(sys.argv) < 2:
            print("Usage: python3 autonomous_meta_orchestrator.py <session_id>")
            sys.exit(1)

        session_id = sys.argv[1]
        logger.info(f"🎯 Starting orchestrator for session: {session_id}")

        orchestrator = AutonomousMetaOrchestrator(session_id)
        await orchestrator.run()

    except KeyboardInterrupt:
        logger.info("\n⏹️  Orchestrator stopped by user (Ctrl+C)")
        sys.exit(0)
    except Exception as e:
        logger.error(f"\n❌ FATAL ERROR in main(): {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  Orchestrator stopped")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)

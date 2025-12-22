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
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import asyncio

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

            # Clear existing cards
            cursor.execute("DELETE FROM cards")

            # Insert all cards (using only columns that exist in portal DB)
            for card in self.backlog.get("cards", []):
                cursor.execute("""
                    INSERT INTO cards (
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
        """Create initial set of cards for Phase 1: Produto"""
        self._log_journal_entry(
            "🎯 Meta-Orchestrator: Creating Initial Cards",
            "Generating Phase 1 (Produto) work items from documentation",
            "orchestrator_action"
        )

        # FASE 1: PRODUTO SQUAD (0-15%)

        # EPIC-001: Product Discovery
        self.create_card(
            card_id="EPIC-001",
            title="Product Discovery & Requirements Analysis",
            description="Analyze all requirements documentation and define the MVP scope for SuperCore v2.0",
            squad="produto",
            priority="CRITICAL",
            card_type="epic",
            phase=1,
            acceptance_criteria=[
                "All requirements documents analyzed",
                "MVP features clearly defined",
                "User flows documented",
                "Success metrics established"
            ]
        )

        # PROD-001: Define MVP Features
        self.create_card(
            card_id="PROD-001",
            title="Define MVP Features from Requirements",
            description="""
Analyze requisitos_funcionais_v2.0.md and create a comprehensive MVP feature list.

Key Areas to Cover:
- Authentication & Authorization
- Company Search (semantic + traditional)
- Document RAG pipeline
- Real-time notifications
- Multi-tenant architecture

Deliverable: Create /artefactos_implementacao/produto/MVP_Features.md
            """,
            squad="produto",
            priority="CRITICAL",
            depends_on=["EPIC-001"],
            acceptance_criteria=[
                "MVP_Features.md created with all core features listed",
                "Features prioritized (must-have vs nice-to-have)",
                "Each feature has clear description and business value",
                "Technical complexity estimated for each feature"
            ]
        )

        # PROD-002: Create User Flows
        self.create_card(
            card_id="PROD-002",
            title="Create User Flows & Journey Maps",
            description="""
Based on fluxos_usuario_v2.0.md, create detailed user flow diagrams for all main journeys:
- User registration & authentication
- Company search workflow
- Document upload & RAG ingestion
- Real-time notification reception

Deliverable: Create /artefactos_implementacao/produto/User_Flows.md with Mermaid diagrams
            """,
            squad="produto",
            priority="HIGH",
            depends_on=["PROD-001"],
            acceptance_criteria=[
                "User_Flows.md created with Mermaid diagrams",
                "All main user journeys documented",
                "Happy paths and error paths defined",
                "User touchpoints identified"
            ]
        )

        # PROD-003: Design Wireframes
        self.create_card(
            card_id="PROD-003",
            title="Design UI Wireframes & Mockups",
            description="""
Create wireframes for all main screens:
- Login / Registration
- Dashboard
- Company Search Interface
- Document Upload Interface
- Settings / Profile

Deliverable: Create wireframes in /artefactos_implementacao/produto/ux-designs/
            """,
            squad="produto",
            priority="HIGH",
            depends_on=["PROD-002"],
            acceptance_criteria=[
                "Wireframes created for all main screens",
                "Responsive design considerations documented",
                "Accessibility requirements noted",
                "UI components inventory created"
            ]
        )

        # PROD-004: Define Success Metrics
        self.create_card(
            card_id="PROD-004",
            title="Define Success Metrics & KPIs",
            description="""
Establish measurable KPIs for the MVP:
- User engagement metrics
- Search quality metrics
- System performance metrics
- Business impact metrics

Deliverable: Create /artefactos_implementacao/produto/Success_Metrics.md
            """,
            squad="produto",
            priority="MEDIUM",
            depends_on=["PROD-001"],
            acceptance_criteria=[
                "Success_Metrics.md created",
                "KPIs defined with target values",
                "Measurement methodology documented",
                "Monitoring strategy outlined"
            ]
        )

        self._log_journal_entry(
            "✅ Initial Cards Created",
            f"Created {len(self.backlog['cards'])} cards for Phase 1 (Produto Squad)",
            "milestone_progress"
        )

        logger.info(f"✅ Created {len(self.backlog['cards'])} initial cards")

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
        import subprocess

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

        # Execute one card at a time (can be parallelized later)
        executed = 0
        for card in ready_cards[:1]:  # Execute only 1 card per iteration for now
            logger.info(f"🚀 Executing card {card['card_id']}: {card['title']}")

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

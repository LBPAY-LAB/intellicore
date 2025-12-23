#!/usr/bin/env python3
"""
Agent Executor - Executes cards using Claude agents via `claude agent run`
===========================================================================

This script:
1. Loads backlog from state/backlog_master.json
2. Finds TODO cards that can be started (dependencies met)
3. Maps cards to appropriate Claude agents based on squad
4. Executes agents using subprocess `claude agent run`
5. Updates card status to IN_PROGRESS -> DONE
6. Logs all activity to journal

Architecture:
    backlog_master.json -> AgentExecutor -> claude agent run -> Update backlog

Usage:
    python3 agent_executor.py [--card-id CARD-123] [--max-concurrent 3]

Author: SuperCore Team
Version: 2.0.0
"""

import os
import sys
import json
import subprocess
import logging
import argparse
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

# Paths
SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
STATE_DIR = SCRIPT_DIR / "state"
BACKLOG_FILE = STATE_DIR / "backlog_master.json"
JOURNAL_FILE = STATE_DIR / "project_journal.json"
AGENTS_DIR = REPO_ROOT / ".claude" / "agents" / "management"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(SCRIPT_DIR / "logs" / "agent_executor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("agent-executor")

# Agent mapping: squad -> agent file
AGENT_MAP = {
    "produto": "product-owner.md",
    "arquitetura": "tech-lead.md",
    "engenharia_frontend": "frontend-lead.md",
    "engenharia_backend": "backend-lead.md",
    "qa": "qa-lead.md",
    "deploy": "deploy-lead.md",
    # Specialists
    "data_modeling": "data-modeling-specialist.md",
    "rag": "rag-specialist.md",
    "vector_db": "vector-db-specialist.md",
    "graph_db": "graph-db-specialist.md",
    "mcp": "mcp-specialist.md",
    "integration": "integration-specialist.md",
}


@dataclass
class Card:
    """Card data structure"""
    card_id: str
    title: str
    description: str
    squad: str
    status: str
    priority: str
    depends_on: List[str]
    acceptance_criteria: List[str]
    phase: int

    @classmethod
    def from_dict(cls, data: Dict) -> 'Card':
        return cls(
            card_id=data["card_id"],
            title=data["title"],
            description=data["description"],
            squad=data["squad"],
            status=data["status"],
            priority=data["priority"],
            depends_on=data.get("depends_on", []),
            acceptance_criteria=data.get("acceptance_criteria", []),
            phase=data.get("phase", 1)
        )


class AgentExecutor:
    """Executes cards using Claude agents"""

    def __init__(self, max_concurrent: int = 3):
        self.max_concurrent = max_concurrent
        self.running_agents = {}  # card_id -> subprocess

    def load_backlog(self) -> Dict:
        """Load backlog from JSON"""
        if not BACKLOG_FILE.exists():
            logger.error(f"❌ Backlog file not found: {BACKLOG_FILE}")
            return {"cards": []}

        with open(BACKLOG_FILE) as f:
            return json.load(f)

    def save_backlog(self, backlog: Dict):
        """Save backlog to JSON"""
        backlog["last_updated"] = datetime.now().isoformat()
        with open(BACKLOG_FILE, 'w') as f:
            json.dump(backlog, f, indent=2, ensure_ascii=False)

    def update_card_status(self, card_id: str, new_status: str, **kwargs):
        """Update card status in backlog"""
        backlog = self.load_backlog()

        for card in backlog["cards"]:
            if card["card_id"] == card_id:
                card["status"] = new_status
                card["updated_at"] = datetime.now().isoformat()

                if new_status == "IN_PROGRESS" and not card.get("started_at"):
                    card["started_at"] = datetime.now().isoformat()

                if new_status == "DONE":
                    card["completed_at"] = datetime.now().isoformat()

                # Update other fields
                for key, value in kwargs.items():
                    card[key] = value

                break

        self.save_backlog(backlog)
        logger.info(f"✅ Card {card_id} status updated: {new_status}")

    def log_journal(self, event_type: str, message: str, card_id: Optional[str] = None):
        """Log event to project journal"""
        if not JOURNAL_FILE.exists():
            journal = []
        else:
            with open(JOURNAL_FILE) as f:
                journal = json.load(f)

        # Ensure journal is a list
        if not isinstance(journal, list):
            journal = []

        # Get next ID
        next_id = max([e.get("id", 0) for e in journal], default=0) + 1

        event = {
            "id": next_id,
            "timestamp": datetime.now().isoformat(),
            "category": "execution",
            "event_type": event_type,
            "title": message[:100],
            "description": message,
            "metadata": {"card_id": card_id} if card_id else {},
            "tags": ["agent-executor", event_type]
        }

        journal.append(event)

        with open(JOURNAL_FILE, 'w') as f:
            json.dump(journal, f, indent=2, ensure_ascii=False)

    def can_start_card(self, card: Card, backlog: Dict) -> bool:
        """Check if card can be started (dependencies met)"""
        if card.status != "TODO":
            return False

        # Check dependencies
        for dep_id in card.depends_on:
            dep_card = next((c for c in backlog["cards"] if c["card_id"] == dep_id), None)
            if not dep_card or dep_card["status"] != "DONE":
                logger.debug(f"⏸  Card {card.card_id} waiting for {dep_id}")
                return False

        return True

    def get_agent_file(self, squad: str) -> Optional[Path]:
        """Get agent file path for squad"""
        agent_filename = AGENT_MAP.get(squad)
        if not agent_filename:
            logger.warning(f"⚠️  No agent mapped for squad: {squad}")
            return None

        agent_path = AGENTS_DIR / agent_filename
        if not agent_path.exists():
            logger.warning(f"⚠️  Agent file not found: {agent_path}")
            return None

        return agent_path

    def execute_card(self, card: Card) -> bool:
        """Execute a card using appropriate Claude agent"""
        logger.info(f"🚀 Executing card {card.card_id}: {card.title}")

        # Get agent for this squad
        agent_file = self.get_agent_file(card.squad)
        if not agent_file:
            logger.error(f"❌ Cannot execute card {card.card_id}: no agent found for squad {card.squad}")
            self.update_card_status(card.card_id, "BLOCKED", blocked_reason=f"No agent found for squad {card.squad}")
            return False

        # Mark as IN_PROGRESS
        self.update_card_status(card.card_id, "IN_PROGRESS", assigned_to=agent_file.stem)
        self.log_journal("card_started", f"Started card {card.card_id}: {card.title}", card_id=card.card_id)

        # Build prompt for agent
        prompt = f"""
🎯 **CARD: {card.card_id}**

**Title**: {card.title}

**Description**:
{card.description}

**Acceptance Criteria**:
{chr(10).join(f'- {criteria}' for criteria in card.acceptance_criteria)}

**Priority**: {card.priority}
**Phase**: {card.phase}

---

**YOUR TASK**:
Execute this card following CLAUDE.md guidelines:
1. Read required documentation from Supercore_v2.0/DOCUMENTACAO_BASE/
2. Create deliverables in artefactos_implementacao/{card.squad}/
3. Follow zero-tolerance policy (no mocks, no TODOs, full testing)
4. When done, respond with "✅ CARD COMPLETED" in your final message

**IMPORTANT**:
- Work autonomously - do not ask for confirmation unless absolutely necessary
- Create real, production-ready artifacts
- Document everything you create
- Follow the stack defined in stack_supercore_v2.0.md
"""

        # Execute agent
        process = None
        try:
            cmd = ["claude", "agent", "run", str(agent_file)]

            logger.info(f"🤖 Running: {' '.join(cmd)}")
            logger.info(f"📝 Prompt preview: {prompt[:200]}...")

            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=REPO_ROOT,
                text=True
            )

            # Log the process PID for monitoring
            logger.info(f"📍 Spawned process PID: {process.pid}")

            # Send prompt to agent with timeout
            stdout, stderr = process.communicate(input=prompt, timeout=1800)  # 30 min timeout

            # Check if completed
            if "✅ CARD COMPLETED" in stdout or process.returncode == 0:
                logger.info(f"✅ Card {card.card_id} completed successfully!")
                self.update_card_status(card.card_id, "DONE")
                self.log_journal("card_completed", f"Completed card {card.card_id}: {card.title}", card_id=card.card_id)
                return True
            else:
                logger.error(f"❌ Card {card.card_id} failed or incomplete")
                logger.error(f"stderr: {stderr[:500]}")
                self.update_card_status(card.card_id, "TODO", assigned_to=None)
                self.log_journal("card_failed", f"Failed card {card.card_id}: {stderr[:200]}", card_id=card.card_id)
                return False

        except subprocess.TimeoutExpired:
            logger.error(f"⏱ Card {card.card_id} timed out (30 min)")
            if process:
                try:
                    # Kill the process and all its children
                    process.kill()
                    process.wait(timeout=5)
                    logger.info(f"🔪 Killed process {process.pid}")
                except Exception as kill_error:
                    logger.error(f"⚠️  Error killing process: {kill_error}")
            self.update_card_status(card.card_id, "TODO", assigned_to=None)
            self.log_journal("card_timeout", f"Timeout card {card.card_id}", card_id=card.card_id)
            return False

        except Exception as e:
            logger.error(f"❌ Error executing card {card.card_id}: {e}")
            if process and process.poll() is None:
                try:
                    process.kill()
                    process.wait(timeout=5)
                    logger.info(f"🔪 Killed process {process.pid} after exception")
                except Exception as kill_error:
                    logger.error(f"⚠️  Error killing process: {kill_error}")
            self.update_card_status(card.card_id, "TODO", assigned_to=None)
            self.log_journal("card_error", f"Error card {card.card_id}: {str(e)}", card_id=card.card_id)
            return False

    def run(self, card_id: Optional[str] = None):
        """Main execution loop"""
        logger.info("================================================================================")
        logger.info("🤖 AGENT EXECUTOR STARTING")
        logger.info("================================================================================")

        backlog = self.load_backlog()

        if not backlog.get("cards"):
            logger.error("❌ No cards in backlog")
            return

        logger.info(f"📋 Loaded {len(backlog['cards'])} cards")

        # Filter cards
        if card_id:
            cards = [Card.from_dict(c) for c in backlog["cards"] if c["card_id"] == card_id]
            if not cards:
                logger.error(f"❌ Card {card_id} not found")
                return
        else:
            # Get all TODO cards that can be started
            cards = []
            for card_data in backlog["cards"]:
                card = Card.from_dict(card_data)
                if self.can_start_card(card, backlog):
                    cards.append(card)

        if not cards:
            logger.info("✅ No cards ready to execute (all waiting on dependencies or already done)")
            return

        logger.info(f"🎯 Found {len(cards)} cards ready to execute")

        # Execute cards (sequentially for now, can add concurrency later)
        for card in sorted(cards, key=lambda c: (c.priority != "CRITICAL", c.card_id)):
            logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info(f"🎯 Next card: {card.card_id} - {card.title}")
            logger.info(f"   Squad: {card.squad} | Priority: {card.priority}")
            logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            success = self.execute_card(card)

            if success:
                logger.info(f"✅ SUCCESS: {card.card_id}")
            else:
                logger.warning(f"⚠️  FAILED: {card.card_id}")

        logger.info("================================================================================")
        logger.info("🏁 AGENT EXECUTOR FINISHED")
        logger.info("================================================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Execute backlog cards using Claude agents")
    parser.add_argument("--card-id", help="Execute specific card ID")
    parser.add_argument("--max-concurrent", type=int, default=1, help="Max concurrent agents (default: 1)")

    args = parser.parse_args()

    executor = AgentExecutor(max_concurrent=args.max_concurrent)
    executor.run(card_id=args.card_id)

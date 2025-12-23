#!/usr/bin/env python3
"""
Claude Squad Orchestrator - Production-Ready Multi-Agent System
================================================================

This orchestrator manages the complete lifecycle of the SuperCore v2.0 project
using Claude agents organized in hierarchical squads.

Features:
- Reads meta-squad-config.json for squad/agent configuration
- Initializes backlog_master.json as single source of truth
- Spawns all management agents (backlog-manager, work-item-tracker, etc.)
- Activates squad agents (backend-developer, frontend-developer, etc.)
- Coordinates workflow across squads (Produto → Arquitetura → Engenharia → QA → Deploy)
- Real-time updates to monitoring portal
- Complete journal logging of all events

Architecture:
    Meta-Orchestrator
        ↓
    Management Squad (backlog-manager, work-item-tracker, dependency-orchestrator, scrum-master)
        ↓
    Execution Squads (produto, arquitetura, engenharia, qa, deploy)
        ↓
    Sub-Squads (frontend, backend, data, fullstack)

Usage:
    python3 claude-squad-orchestrator.py --config meta-squad-config.json --phase 1

Author: SuperCore Team
Version: 2.0.0
"""

import os
import sys
import json
import asyncio
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

# Add parent directory to path for imports
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(SCRIPT_DIR / 'logs' / 'orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ClaudeSquadOrchestrator')


# ============================================================================
# Data Models
# ============================================================================

@dataclass
class Card:
    """Represents a work card in the backlog"""
    card_id: str
    title: str
    type: str = "story"  # epic, story, task
    squad: str = ""
    phase: int = 1
    priority: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    status: str = "TODO"  # TODO, IN_PROGRESS, BLOCKED, IN_REVIEW, REJECTED, DONE
    description: str = ""  # Added to match autonomous_meta_orchestrator.py schema
    assigned_to: Optional[str] = None
    parent_card: Optional[str] = None
    child_cards: List[str] = None
    depends_on: List[str] = None
    blocks: List[str] = None
    tags: List[str] = None
    story_points: int = 0
    acceptance_criteria: List[str] = None
    deliverables: List[str] = None
    created_at: str = None
    created_by: str = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    updated_at: str = None
    state_history: List[Dict] = None
    comments: List[Dict] = None
    qa_cycles: int = 0
    blocked_reason: Optional[str] = None
    blocked_since: Optional[str] = None

    def __post_init__(self):
        if self.child_cards is None:
            self.child_cards = []
        if self.depends_on is None:
            self.depends_on = []
        if self.blocks is None:
            self.blocks = []
        if self.tags is None:
            self.tags = []
        if self.acceptance_criteria is None:
            self.acceptance_criteria = []
        if self.deliverables is None:
            self.deliverables = []
        if self.state_history is None:
            self.state_history = []
        if self.comments is None:
            self.comments = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = self.created_at


@dataclass
class BacklogMaster:
    """Master backlog containing all project cards"""
    version: str
    project: str
    last_updated: str
    current_sprint: int
    cards: List[Card]
    metadata: Dict[str, Any]

    def to_dict(self):
        return {
            "version": self.version,
            "project": self.project,
            "last_updated": self.last_updated,
            "current_sprint": self.current_sprint,
            "cards": [asdict(card) for card in self.cards],
            "metadata": self.metadata
        }


# ============================================================================
# Claude Squad Orchestrator
# ============================================================================

class ClaudeSquadOrchestrator:
    """
    Main orchestrator for Claude-based multi-agent squad system
    """

    def __init__(self, config_path: Path, phase: int = 1):
        self.config_path = config_path
        self.phase = phase
        self.state_dir = SCRIPT_DIR / "state"
        self.state_dir.mkdir(exist_ok=True)

        self.backlog_path = self.state_dir / "backlog_master.json"
        self.session_id = f"session_{int(datetime.now().timestamp())}"

        # Load configuration
        self.config = self._load_config()

        # Initialize state
        self.backlog = None
        self.active_agents = {}
        self.journal_entries = []

        logger.info(f"Initialized ClaudeSquadOrchestrator - Session: {self.session_id}")

    def _load_config(self) -> Dict:
        """Load meta-squad configuration"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

        with open(self.config_path) as f:
            config = json.load(f)

        logger.info(f"Loaded configuration from {self.config_path}")
        return config

    def _initialize_backlog(self):
        """Initialize or load backlog_master.json"""
        if self.backlog_path.exists():
            logger.info(f"Loading existing backlog from {self.backlog_path}")
            with open(self.backlog_path) as f:
                data = json.load(f)
                cards = [Card(**card) for card in data["cards"]]
                self.backlog = BacklogMaster(
                    version=data["version"],
                    project=data["project"],
                    last_updated=data["last_updated"],
                    current_sprint=data["current_sprint"],
                    cards=cards,
                    metadata=data["metadata"]
                )
        else:
            logger.info("Creating new backlog_master.json")
            self.backlog = BacklogMaster(
                version="2.0.0",
                project="SuperCore v2.0",
                last_updated=datetime.now().isoformat(),
                current_sprint=1,
                cards=[],
                metadata={
                    "total_cards": 0,
                    "by_status": {
                        "TODO": 0,
                        "IN_PROGRESS": 0,
                        "BLOCKED": 0,
                        "IN_REVIEW": 0,
                        "DONE": 0
                    },
                    "by_squad": {},
                    "by_priority": {
                        "CRITICAL": 0,
                        "HIGH": 0,
                        "MEDIUM": 0,
                        "LOW": 0
                    }
                }
            )
            self._save_backlog()

    def _save_backlog(self):
        """Save backlog to disk with backup"""
        # Create backup
        if self.backlog_path.exists():
            backup_dir = self.state_dir / "backlog_history"
            backup_dir.mkdir(exist_ok=True)
            timestamp = datetime.now().isoformat()
            backup_path = backup_dir / f"backlog_{timestamp}.json"
            with open(self.backlog_path) as f:
                with open(backup_path, 'w') as bf:
                    bf.write(f.read())

        # Save current backlog
        self.backlog.last_updated = datetime.now().isoformat()
        with open(self.backlog_path, 'w') as f:
            json.dump(self.backlog.to_dict(), f, indent=2)

        logger.info(f"Saved backlog to {self.backlog_path}")

    def _log_journal_entry(self, category: str, event_type: str, title: str,
                          description: str, metadata: Dict = None, tags: List[str] = None):
        """Log entry to project journal"""
        entry = {
            "id": len(self.journal_entries) + 1,
            "timestamp": datetime.now().isoformat(),
            "category": category,
            "event_type": event_type,
            "title": title,
            "description": description,
            "metadata": metadata or {},
            "tags": tags or []
        }

        self.journal_entries.append(entry)

        # Save to file
        journal_path = self.state_dir / "project_journal.json"
        with open(journal_path, 'w') as f:
            json.dump(self.journal_entries, f, indent=2)

        logger.info(f"[JOURNAL] {category.upper()}: {title}")

    async def start(self):
        """Start the orchestration process"""
        logger.info("=" * 80)
        logger.info("STARTING CLAUDE SQUAD ORCHESTRATOR")
        logger.info("=" * 80)

        # Log project start
        self._log_journal_entry(
            category="project",
            event_type="project_started",
            title="🚀 Projeto Iniciado",
            description=f"SuperCore v2.0 - Fase {self.phase} - Sessão {self.session_id}",
            metadata={"phase": self.phase, "session_id": self.session_id},
            tags=["project", "start", f"phase-{self.phase}"]
        )

        # Step 1: Initialize backlog
        logger.info("Step 1: Initializing backlog...")
        self._initialize_backlog()

        # Step 2: Initialize management agents
        logger.info("Step 2: Initializing management agents...")
        await self._initialize_management_squad()

        # Step 3: Initialize execution squads
        logger.info("Step 3: Initializing execution squads...")
        await self._initialize_execution_squads()

        # Step 4: Start meta-orchestrator
        logger.info("Step 4: Starting meta-orchestrator...")
        await self._start_meta_orchestrator()

        logger.info("=" * 80)
        logger.info("CLAUDE SQUAD ORCHESTRATOR STARTED SUCCESSFULLY")
        logger.info(f"Session ID: {self.session_id}")
        logger.info(f"Backlog: {self.backlog_path}")
        logger.info(f"Active Agents: {len(self.active_agents)}")
        logger.info("=" * 80)

    async def _initialize_management_squad(self):
        """Initialize management agents"""
        management_config = self.config["squads"]["management"]
        agents = management_config["agents"]

        logger.info(f"Initializing {len(agents)} management agents...")

        for agent_name in agents:
            logger.info(f"  - Initializing {agent_name}...")
            self.active_agents[agent_name] = {
                "name": agent_name,
                "squad": "management",
                "status": "initialized",
                "started_at": datetime.now().isoformat()
            }

            self._log_journal_entry(
                category="agent",
                event_type="agent_initialized",
                title=f"🤖 Agente Inicializado: {agent_name}",
                description=f"Agente de gestão {agent_name} foi inicializado e está pronto",
                metadata={"agent": agent_name, "squad": "management"},
                tags=["agent", "management", agent_name]
            )

        logger.info(f"✅ Management squad initialized with {len(agents)} agents")

    async def _initialize_execution_squads(self):
        """Initialize execution squads (produto, arquitetura, engenharia, qa, deploy)"""
        execution_squads = ["produto", "arquitetura", "engenharia", "qa", "deploy"]

        for squad_name in execution_squads:
            if squad_name not in self.config["squads"]:
                continue

            squad_config = self.config["squads"][squad_name]
            logger.info(f"Initializing squad: {squad_name}")

            # Check if squad has sub-squads
            if "sub_squads" in squad_config:
                for sub_squad_name, sub_squad_config in squad_config["sub_squads"].items():
                    agents = sub_squad_config.get("agents", [])
                    logger.info(f"  Sub-squad {sub_squad_name}: {len(agents)} agents")

                    for agent_name in agents:
                        logger.info(f"    - Initializing {agent_name}...")
                        self.active_agents[agent_name] = {
                            "name": agent_name,
                            "squad": squad_name,
                            "sub_squad": sub_squad_name,
                            "status": "initialized",
                            "started_at": datetime.now().isoformat()
                        }

                        self._log_journal_entry(
                            category="agent",
                            event_type="agent_initialized",
                            title=f"🤖 Agente Inicializado: {agent_name}",
                            description=f"Agente {agent_name} do sub-squad {sub_squad_name} está pronto",
                            metadata={"agent": agent_name, "squad": squad_name, "sub_squad": sub_squad_name},
                            tags=["agent", squad_name, sub_squad_name, agent_name]
                        )
            else:
                # Direct agents (no sub-squads)
                agents = squad_config.get("agents", [])
                logger.info(f"  Squad {squad_name}: {len(agents)} agents")

                for agent_name in agents:
                    logger.info(f"    - Initializing {agent_name}...")
                    self.active_agents[agent_name] = {
                        "name": agent_name,
                        "squad": squad_name,
                        "status": "initialized",
                        "started_at": datetime.now().isoformat()
                    }

                    self._log_journal_entry(
                        category="agent",
                        event_type="agent_initialized",
                        title=f"🤖 Agente Inicializado: {agent_name}",
                        description=f"Agente {agent_name} da squad {squad_name} está pronto",
                        metadata={"agent": agent_name, "squad": squad_name},
                        tags=["agent", squad_name, agent_name]
                    )

        logger.info(f"✅ Execution squads initialized with {len(self.active_agents)} total agents")

    async def _start_meta_orchestrator(self):
        """Start the meta-orchestrator to coordinate all squads"""
        logger.info("Starting Meta-Orchestrator...")

        self._log_journal_entry(
            category="project",
            event_type="meta_orchestrator_started",
            title="🎯 Meta-Orchestrator Ativado",
            description="Meta-Orchestrator iniciado para coordenar todas as squads",
            metadata={"total_agents": len(self.active_agents)},
            tags=["meta-orchestrator", "coordination"]
        )

        # Spawn meta-orchestrator agent using Claude CLI
        try:
            import subprocess

            # Path to meta-orchestrator agent spec
            agent_file = SCRIPT_DIR.parent.parent / ".claude" / "agents" / "management" / "meta-orchestrator.md"

            # Prepare input for meta-orchestrator
            input_data = {
                "task": "initialize_project",
                "project": "SuperCore v2.0",
                "phase": self.phase,
                "backlog_path": str(self.backlog_path),
                "docs_path": "Supercore_v2.0/DOCUMENTACAO_BASE/",
                "session_id": self.session_id
            }

            import json
            input_json = json.dumps(input_data)

            # Spawn Python-based autonomous meta-orchestrator in background
            orchestrator_script = SCRIPT_DIR / "autonomous_meta_orchestrator.py"
            cmd = [
                "python3",
                str(orchestrator_script),
                self.session_id  # Pass session ID as argument
            ]

            logger.info(f"Spawning autonomous meta-orchestrator: {' '.join(cmd)}")

            # Redirect stdout/stderr to log files for debugging
            stdout_log = SCRIPT_DIR / "logs" / f"meta-orchestrator-{self.session_id}.stdout.log"
            stderr_log = SCRIPT_DIR / "logs" / f"meta-orchestrator-{self.session_id}.stderr.log"

            # Open log files (don't use 'with' so they stay open for the child process)
            stdout_f = open(stdout_log, 'w')
            stderr_f = open(stderr_log, 'w')

            process = subprocess.Popen(
                cmd,
                stdout=stdout_f,
                stderr=stderr_f,
                cwd=SCRIPT_DIR  # Run from script directory
            )

            # Store process info
            self.active_agents["meta-orchestrator"] = {
                "name": "meta-orchestrator",
                "squad": "management",
                "status": "running",
                "started_at": datetime.now().isoformat(),
                "process_id": process.pid
            }

            logger.info(f"✅ Meta-Orchestrator spawned successfully (PID: {process.pid})")

            self._log_journal_entry(
                category="agent",
                event_type="agent_spawned",
                title="🤖 Meta-Orchestrator Spawned",
                description=f"Meta-Orchestrator agent running autonomously (PID: {process.pid})",
                metadata={
                    "agent": "meta-orchestrator",
                    "pid": process.pid,
                    "phase": self.phase,
                    "session_id": self.session_id
                },
                tags=["agent", "meta-orchestrator", "autonomous"]
            )

        except Exception as e:
            logger.error(f"Failed to spawn meta-orchestrator: {e}", exc_info=True)

            self._log_journal_entry(
                category="error",
                event_type="spawn_failed",
                title="❌ Meta-Orchestrator Spawn Failed",
                description=f"Failed to spawn meta-orchestrator agent: {str(e)}",
                metadata={"error": str(e)},
                tags=["error", "meta-orchestrator", "spawn"]
            )

            # Fall back to manual mode
            logger.warning("⚠️ Falling back to manual coordination mode")
            logger.info("✅ Meta-Orchestrator ready to coordinate squads (manual mode)")

    async def stop(self):
        """Stop all agents and save state"""
        logger.info("Stopping Claude Squad Orchestrator...")

        # Save final backlog state
        self._save_backlog()

        # Log project stop
        self._log_journal_entry(
            category="project",
            event_type="project_stopped",
            title="🛑 Projeto Parado",
            description=f"Sessão {self.session_id} finalizada",
            metadata={"session_id": self.session_id, "total_agents": len(self.active_agents)},
            tags=["project", "stop"]
        )

        logger.info("✅ Claude Squad Orchestrator stopped successfully")


# ============================================================================
# Main Entry Point
# ============================================================================

async def main():
    parser = argparse.ArgumentParser(description='Claude Squad Orchestrator v2.0')
    parser.add_argument('--config', type=str, default='meta-squad-config.json',
                       help='Path to meta-squad configuration file')
    parser.add_argument('--phase', type=int, default=1,
                       help='Project phase to start (1-7)')
    parser.add_argument('--stop', action='store_true',
                       help='Stop running orchestrator')

    args = parser.parse_args()

    config_path = SCRIPT_DIR / args.config

    orchestrator = ClaudeSquadOrchestrator(config_path=config_path, phase=args.phase)

    try:
        if args.stop:
            await orchestrator.stop()
        else:
            await orchestrator.start()

            # Keep running until interrupted
            print("\n✅ Orchestrator running. Press Ctrl+C to stop.\n")
            while True:
                await asyncio.sleep(10)

    except KeyboardInterrupt:
        logger.info("\n\nReceived interrupt signal...")
        await orchestrator.stop()
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        await orchestrator.stop()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

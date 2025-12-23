#!/usr/bin/env python3
"""
SuperCore v2.0 - Real-time Monitoring Server
FastAPI + WebSocket + SSE for squad monitoring
"""

import asyncio
import json
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from collections import defaultdict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import subprocess
import os
import signal
import sys
import shutil

# Add parent directory to path for celery_app import
PARENT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PARENT_DIR))

# Import Squad Planner and Solution Analyzer
from squad_planner import SquadPlanner
from solution_analyzer import SolutionAnalyzer

# Redis client for Celery integration
try:
    import redis
    REDIS_AVAILABLE = True
    redis_client = redis.Redis(host='localhost', port=6379, db=2, decode_responses=True)
except ImportError:
    REDIS_AVAILABLE = False
    redis_client = None

# Celery integration (optional)
try:
    from celery.result import AsyncResult
    from celery_app import celery_app
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    celery_app = None


# ============================================================================
# Configuration
# ============================================================================

BASE_DIR = Path(__file__).parent.parent.parent  # app-generation/
APP_EXECUTION_DIR = BASE_DIR / "app-execution"  # Orchestrator location
STATE_DIR = APP_EXECUTION_DIR / "state"
LOGS_DIR = APP_EXECUTION_DIR / "logs"
DATA_DIR = Path(__file__).parent / "data"  # execution-portal/backend/data/
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "monitoring.db"
CONFIG_PATH = Path(__file__).parent / "config" / "monitoring-config.json"
META_CONFIG_PATH = APP_EXECUTION_DIR / "meta-squad-config.json"


# ============================================================================
# Data Models
# ============================================================================

class SquadStatus(BaseModel):
    squad_id: str
    status: str  # running, waiting, blocked, completed, error
    current_card: Optional[str] = None
    cards_total: int = 0
    cards_done: int = 0
    cards_in_progress: int = 0
    cards_blocked: int = 0
    agent_current: Optional[str] = None
    last_update: str
    health: str = "healthy"  # healthy, degraded, error
    uptime_seconds: int = 0


class CardStatus(BaseModel):
    card_id: str
    title: str
    status: str  # todo, in_progress, blocked, done, rejected
    squad: str
    agent: Optional[str] = None
    priority: str = "MEDIUM"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    qa_cycles: int = 0
    test_coverage: Optional[float] = None
    events: List[Dict[str, Any]] = []


class Event(BaseModel):
    event_id: str
    type: str
    timestamp: str
    squad: str
    card: Optional[str] = None
    agent: Optional[str] = None
    message: str
    metadata: Dict[str, Any] = {}


class Metrics(BaseModel):
    velocity_per_day: float = 0.0
    qa_rejection_rate: float = 0.0
    average_coverage: float = 0.0
    cards_completed_today: int = 0
    active_squads: int = 0
    total_events: int = 0


class SessionStatus(BaseModel):
    session_id: str
    started_at: str
    uptime_seconds: int
    overall_progress: float
    squads: List[SquadStatus]
    metrics: Metrics
    recent_events: List[Event]


class BootstrapRequest(BaseModel):
    project_name: str
    config_json: Optional[str] = None  # Optional inline config
    config_file: Optional[str] = None   # Or path to config file


class Milestone(BaseModel):
    phase: int
    name: str
    description: str
    progress_range: List[int]
    squads: List[str]
    sub_squads: Optional[List[str]] = None
    deliverables: List[str]


class CurrentMilestone(BaseModel):
    phase: int
    name: str
    description: str
    progress_range: List[int]
    phase_progress: float  # Progress within current phase (0-100)


class BootstrapStatus(BaseModel):
    status: str  # idle, starting, running, completed, error, awaiting_approval
    session_id: Optional[str] = None
    pid: Optional[int] = None
    started_at: Optional[str] = None
    error_message: Optional[str] = None
    approval_stage: Optional[str] = None  # None, awaiting_deploy_approval
    overall_progress: Optional[float] = None
    current_milestone: Optional[CurrentMilestone] = None
    all_milestones: Optional[List[Milestone]] = None


class ApprovalRequest(BaseModel):
    session_id: str
    approval_type: str  # deploy_qa, deploy_staging, deploy_production
    approved: bool
    comments: Optional[str] = None


class Checkpoint(BaseModel):
    checkpoint_id: str
    session_id: str
    checkpoint_name: str
    squad_completed: Optional[str] = None
    squads_completed_list: List[str] = []
    artifacts_path: Optional[str] = None
    timestamp: str
    overall_progress: float = 0.0
    metadata: Dict[str, Any] = {}


class ResumeRequest(BaseModel):
    checkpoint_id: Optional[str] = None  # If None, resume from last checkpoint
    session_id: Optional[str] = None  # If None, use last session


class CreateCheckpointRequest(BaseModel):
    session_id: str
    checkpoint_name: str
    squad_completed: str
    squads_completed_list: List[str]
    overall_progress: float


class CeleryTaskInfo(BaseModel):
    """Celery task information for a card"""
    task_id: str
    status: str  # PENDING, STARTED, PROGRESS, SUCCESS, FAILURE, RETRY, REVOKED
    progress: Optional[int] = None  # 0-100
    current_step: Optional[str] = None
    elapsed: Optional[float] = None
    eta: Optional[float] = None
    worker: Optional[str] = None
    retries: Optional[int] = None
    max_retries: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    traceback: Optional[str] = None

    # Enhanced progress context fields
    milestone_phase: Optional[int] = None  # 1-7
    milestone_name: Optional[str] = None
    deliverable_index: Optional[int] = None
    deliverable_name: Optional[str] = None
    files_modified_count: Optional[int] = None
    dependencies_blocked: Optional[int] = None
    progress_context: Optional[Dict[str, Any]] = None  # Full ProgressContext.to_dict()


class CardStatusEnhanced(CardStatus):
    """Card status with Celery task information"""
    celery_task: Optional[CeleryTaskInfo] = None
    logs_available: bool = False


class TaskLog(BaseModel):
    """Task log entry"""
    timestamp: str
    level: str  # INFO, WARNING, ERROR, DEBUG
    message: str
    task_id: str


class RetryTaskRequest(BaseModel):
    """Request to retry a failed task"""
    force: bool = False  # Force retry even if not failed


class SquadAgent(BaseModel):
    """Individual agent within a squad"""
    name: str
    role: str
    description: Optional[str] = None


class SquadStructure(BaseModel):
    """Complete structure of a squad with agents, permissions, and scope"""
    squad_id: str
    name: str
    description: str
    agents: List[SquadAgent]
    inputs_from: Optional[str] = None
    outputs_to: Optional[str] = None
    permissions: Dict[str, Any] = {}
    responsibilities: List[str] = []
    sub_squads: Optional[Dict[str, Any]] = None
    current_phase: Optional[str] = None
    scope: Optional[List[str]] = []
    milestones: Optional[List[Dict[str, Any]]] = []
    # Dynamic allocation fields (populated by Squad Planner)
    skills: Optional[List[str]] = []
    justification: Optional[str] = None
    scope_summary: Optional[str] = None
    technologies: Optional[List[str]] = []
    allocated_by: Optional[str] = "meta-squad-config"  # or "squad-planner"


class SquadTask(BaseModel):
    """Task/Sprint item for a squad"""
    task_id: str
    squad_id: str
    title: str
    description: str
    status: str  # todo, in_progress, done, blocked
    sprint_number: Optional[int] = None
    assigned_agent: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    dependencies: List[str] = []
    deliverables: List[str] = []
    progress_percent: float = 0.0


# ============================================================================
# Database Manager
# ============================================================================

class MonitoringDB:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize SQLite database with schema"""
        conn = sqlite3.connect(self.db_path, timeout=30.0)  # 30 second timeout
        cursor = conn.cursor()

        # Squads table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS squads (
                squad_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                current_card TEXT,
                cards_total INTEGER DEFAULT 0,
                cards_done INTEGER DEFAULT 0,
                cards_in_progress INTEGER DEFAULT 0,
                cards_blocked INTEGER DEFAULT 0,
                agent_current TEXT,
                last_update TEXT NOT NULL,
                health TEXT DEFAULT 'healthy',
                uptime_seconds INTEGER DEFAULT 0,
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Cards table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cards (
                card_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                status TEXT NOT NULL,
                squad TEXT NOT NULL,
                agent TEXT,
                priority TEXT DEFAULT 'MEDIUM',
                started_at TEXT,
                completed_at TEXT,
                qa_cycles INTEGER DEFAULT 0,
                test_coverage REAL,
                celery_task_id TEXT,
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                squad TEXT NOT NULL,
                card TEXT,
                agent TEXT,
                message TEXT NOT NULL,
                metadata TEXT,
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Metrics table (time-series)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                session_id TEXT,
                metadata TEXT
            )
        """)

        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                status TEXT DEFAULT 'active',
                config TEXT
            )
        """)

        # Checkpoints table (for recovery)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS checkpoints (
                checkpoint_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                checkpoint_name TEXT NOT NULL,
                squad_completed TEXT,
                squads_completed_list TEXT,
                artifacts_path TEXT,
                timestamp TEXT NOT NULL,
                overall_progress REAL DEFAULT 0.0,
                metadata TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)

        # Squad tasks table (granular task/sprint tracking)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS squad_tasks (
                task_id TEXT PRIMARY KEY,
                squad_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'todo',
                sprint_number INTEGER,
                assigned_agent TEXT,
                started_at TEXT,
                completed_at TEXT,
                dependencies TEXT,
                deliverables TEXT,
                progress_percent REAL DEFAULT 0.0,
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (squad_id) REFERENCES squads(squad_id),
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)

        # Squad structure table (dynamic agent allocation based on project scope)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS squad_structure (
                squad_id TEXT PRIMARY KEY,
                squad_name TEXT NOT NULL,
                agents TEXT NOT NULL,
                skills TEXT,
                justification TEXT,
                scope_summary TEXT,
                technologies TEXT,
                allocated_by TEXT DEFAULT 'squad-planner',
                session_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)

        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_squad ON events(squad)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON checkpoints(session_id, timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_squad_tasks_squad ON squad_tasks(squad_id, status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_squad_tasks_sprint ON squad_tasks(sprint_number)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_squad_structure_session ON squad_structure(session_id, created_at DESC)")

        conn.commit()
        conn.close()

    def execute(self, query: str, params: tuple = ()) -> List[Dict]:
        """Execute query and return results as list of dicts"""
        conn = sqlite3.connect(self.db_path, timeout=30.0)  # 30 second timeout
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            results = [dict(row) for row in cursor.fetchall()]
            conn.commit()
            return results
        finally:
            conn.close()

    def execute_one(self, query: str, params: tuple = ()) -> Optional[Dict]:
        """Execute query and return single result"""
        results = self.execute(query, params)
        return results[0] if results else None


# ============================================================================
# Data Collector (reads from state directory)
# ============================================================================

class DataCollector:
    def __init__(self, db: MonitoringDB):
        self.db = db
        self.state_dir = STATE_DIR
        self.current_session_id = None

    def get_current_session(self) -> Optional[str]:
        """Get or create current session ID"""
        if self.current_session_id:
            return self.current_session_id

        # Try to read from state
        session_file = self.state_dir / "current_session.json"
        if session_file.exists():
            with open(session_file) as f:
                data = json.load(f)
                self.current_session_id = data.get("session_id")
                return self.current_session_id

        return None

    def collect_squad_status(self) -> List[SquadStatus]:
        """Collect squad status from state files"""
        squads = []

        if not self.state_dir.exists():
            return squads

        for state_file in self.state_dir.glob("squad_*.json"):
            try:
                with open(state_file) as f:
                    data = json.load(f)

                squad_id = data.get("squad_id", state_file.stem)

                # Count cards by status
                cards = data.get("cards", [])
                cards_total = len(cards)
                cards_done = sum(1 for c in cards if c.get("status") == "done")
                cards_in_progress = sum(1 for c in cards if c.get("status") == "in_progress")
                cards_blocked = sum(1 for c in cards if c.get("status") == "blocked")

                # Get current card
                current_card = None
                for card in cards:
                    if card.get("status") == "in_progress":
                        current_card = card.get("card_id")
                        break

                squad = SquadStatus(
                    squad_id=squad_id,
                    status=data.get("status", "unknown"),
                    current_card=current_card,
                    cards_total=cards_total,
                    cards_done=cards_done,
                    cards_in_progress=cards_in_progress,
                    cards_blocked=cards_blocked,
                    agent_current=data.get("current_agent"),
                    last_update=data.get("last_update", datetime.now().isoformat()),
                    health=data.get("health", "healthy"),
                    uptime_seconds=data.get("uptime_seconds", 0)
                )

                squads.append(squad)

                # Update DB
                self.update_squad_in_db(squad)

            except Exception as e:
                print(f"Error reading {state_file}: {e}")
                continue

        return squads

    def collect_card_status(self) -> List[CardStatus]:
        """Collect card status from SQLite database"""
        cards = []

        try:
            query = """
                SELECT card_id, title, status, squad, agent, priority,
                       started_at, completed_at, qa_cycles, test_coverage
                FROM cards
                ORDER BY created_at ASC
            """
            rows = self.db.execute(query)

            for row in rows:
                card = CardStatus(
                    card_id=row.get("card_id", ""),
                    title=row.get("title", ""),
                    status=row.get("status", "todo"),
                    squad=row.get("squad", "unknown"),
                    agent=row.get("agent"),
                    priority=row.get("priority", "MEDIUM"),
                    started_at=row.get("started_at"),
                    completed_at=row.get("completed_at"),
                    qa_cycles=row.get("qa_cycles", 0),
                    test_coverage=row.get("test_coverage"),
                    events=[]  # Events are stored separately
                )
                cards.append(card)

        except Exception as e:
            print(f"Error reading cards from database: {e}")

        return cards

    def collect_events(self, limit: int = 100) -> List[Event]:
        """Get recent events from database"""
        query = """
            SELECT * FROM events
            ORDER BY timestamp DESC
            LIMIT ?
        """
        rows = self.db.execute(query, (limit,))

        events = []
        for row in rows:
            metadata_str = row.get("metadata") or "{}"
            metadata = json.loads(metadata_str) if isinstance(metadata_str, str) else {}
            event = Event(
                event_id=row["event_id"],
                type=row["type"],
                timestamp=row["timestamp"],
                squad=row["squad"],
                card=row.get("card"),
                agent=row.get("agent"),
                message=row["message"],
                metadata=metadata
            )
            events.append(event)

        return events

    def update_squad_in_db(self, squad: SquadStatus):
        """Update or insert squad in database"""
        query = """
            INSERT OR REPLACE INTO squads
            (squad_id, status, current_card, cards_total, cards_done,
             cards_in_progress, cards_blocked, agent_current, last_update,
             health, uptime_seconds, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            squad.squad_id, squad.status, squad.current_card, squad.cards_total,
            squad.cards_done, squad.cards_in_progress, squad.cards_blocked,
            squad.agent_current, squad.last_update, squad.health,
            squad.uptime_seconds, self.get_current_session()
        ))

    def update_card_in_db(self, card: CardStatus):
        """Update or insert card in database"""
        query = """
            INSERT OR REPLACE INTO cards
            (card_id, title, status, squad, agent, priority, started_at,
             completed_at, qa_cycles, test_coverage, session_id, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            card.card_id, card.title, card.status, card.squad, card.agent,
            card.priority, card.started_at, card.completed_at, card.qa_cycles,
            card.test_coverage, self.get_current_session(), datetime.now().isoformat()
        ))

    def add_event(self, event: Event):
        """Add event to database"""
        query = """
            INSERT INTO events
            (event_id, type, timestamp, squad, card, agent, message, metadata, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            event.event_id, event.type, event.timestamp, event.squad,
            event.card, event.agent, event.message, json.dumps(event.metadata),
            self.get_current_session()
        ))

    def calculate_metrics(self) -> Metrics:
        """Calculate current metrics"""
        session_id = self.get_current_session()

        # Get session start time
        session_query = "SELECT started_at FROM sessions WHERE session_id = ?"
        session_data = self.db.execute_one(session_query, (session_id,))

        if not session_data:
            return Metrics()

        started_at = datetime.fromisoformat(session_data["started_at"])
        days_elapsed = max((datetime.now() - started_at).days, 1)

        # Cards completed
        cards_query = "SELECT COUNT(*) as count FROM cards WHERE status = 'done' AND session_id = ?"
        cards_done = self.db.execute_one(cards_query, (session_id,))["count"]

        # Cards completed today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        cards_today_query = """
            SELECT COUNT(*) as count FROM cards
            WHERE status = 'done' AND completed_at >= ? AND session_id = ?
        """
        cards_today = self.db.execute_one(cards_today_query, (today_start.isoformat(), session_id,))["count"]

        # QA rejection rate
        rejected_query = "SELECT COUNT(*) as count FROM cards WHERE qa_cycles > 0 AND session_id = ?"
        rejected_count = self.db.execute_one(rejected_query, (session_id,))["count"]
        total_cards_query = "SELECT COUNT(*) as count FROM cards WHERE session_id = ?"
        total_cards = self.db.execute_one(total_cards_query, (session_id,))["count"]

        qa_rejection_rate = (rejected_count / total_cards * 100) if total_cards > 0 else 0.0

        # Average coverage
        coverage_query = """
            SELECT AVG(test_coverage) as avg_coverage FROM cards
            WHERE test_coverage IS NOT NULL AND session_id = ?
        """
        avg_coverage = self.db.execute_one(coverage_query, (session_id,))["avg_coverage"] or 0.0

        # Active squads
        squads_query = "SELECT COUNT(*) as count FROM squads WHERE status = 'running' AND session_id = ?"
        active_squads = self.db.execute_one(squads_query, (session_id,))["count"]

        # Total events
        events_query = "SELECT COUNT(*) as count FROM events WHERE session_id = ?"
        total_events = self.db.execute_one(events_query, (session_id,))["count"]

        return Metrics(
            velocity_per_day=cards_done / days_elapsed,
            qa_rejection_rate=qa_rejection_rate,
            average_coverage=avg_coverage,
            cards_completed_today=cards_today,
            active_squads=active_squads,
            total_events=total_events
        )


# ============================================================================
# WebSocket Connection Manager
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="SuperCore v2.0 Monitoring API",
    description="Real-time monitoring for squad orchestration",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Milestone Manager
# ============================================================================

class MilestoneManager:
    """Manages milestone calculation and tracking"""

    def __init__(self, config_path: Path):
        self.config_path = config_path
        self.milestones = self._load_milestones()

    def _load_milestones(self) -> List[Milestone]:
        """Load milestones from meta-squad-config.json"""
        if not self.config_path.exists():
            return []

        try:
            with open(self.config_path) as f:
                config = json.load(f)

            milestones_data = config.get("workflow", {}).get("milestones", [])
            return [Milestone(**m) for m in milestones_data]
        except Exception as e:
            print(f"Error loading milestones: {e}")
            return []

    def get_current_milestone(self, overall_progress: float) -> Optional[CurrentMilestone]:
        """Determine current milestone based on overall progress"""
        if not self.milestones:
            return None

        # Find milestone that contains current progress
        for milestone in self.milestones:
            start, end = milestone.progress_range

            if start <= overall_progress <= end:
                # Calculate progress within this phase
                phase_range = end - start
                progress_in_phase = overall_progress - start
                phase_progress = (progress_in_phase / phase_range * 100) if phase_range > 0 else 0.0

                return CurrentMilestone(
                    phase=milestone.phase,
                    name=milestone.name,
                    description=milestone.description,
                    progress_range=milestone.progress_range,
                    phase_progress=round(phase_progress, 1)
                )

        # If progress is 100%, return last milestone
        if overall_progress >= 100:
            last = self.milestones[-1]
            return CurrentMilestone(
                phase=last.phase,
                name=last.name,
                description=last.description,
                progress_range=last.progress_range,
                phase_progress=100.0
            )

        # If progress is 0%, return first milestone
        if overall_progress == 0:
            first = self.milestones[0]
            return CurrentMilestone(
                phase=first.phase,
                name=first.name,
                description=first.description,
                progress_range=first.progress_range,
                phase_progress=0.0
            )

        return None

    def get_all_milestones(self) -> List[Milestone]:
        """Return all milestones"""
        return self.milestones


# ============================================================================
# Bootstrap Controller
# ============================================================================

class BootstrapController:
    """Controls bootstrap execution using Claude Squad Orchestrator"""
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.orchestrator_script = base_dir / "autonomous_meta_orchestrator.py"
        self.status_file = DATA_DIR / "bootstrap_status.json"
        self.process = None
        self.current_session_id = None
        self.db = None  # Will be set externally

        # Load status if exists
        if self.status_file.exists():
            with open(self.status_file) as f:
                data = json.load(f)
                self.current_session_id = data.get("session_id")

    def get_status(self) -> BootstrapStatus:
        """Get current bootstrap status"""
        if not self.status_file.exists():
            return BootstrapStatus(status="idle")

        with open(self.status_file) as f:
            data = json.load(f)

        return BootstrapStatus(**data)

    def save_status(self, status: BootstrapStatus):
        """Save bootstrap status to file"""
        with open(self.status_file, 'w') as f:
            json.dump(status.dict(), f, indent=2)

    async def start_bootstrap(self, request: BootstrapRequest) -> BootstrapStatus:
        """Start bootstrap process - SEMPRE limpa TUDO antes de iniciar"""
        # Check if already running
        current_status = self.get_status()
        if current_status.status in ["running", "starting"]:
            raise HTTPException(status_code=400, detail="Bootstrap already running")

        # CLEANUP: SEMPRE limpar TUDO antes de iniciar novo projeto (independente do status anterior)
        print("🧹 LIMPEZA COMPLETA - Removendo TUDO de execuções anteriores...")
        print(f"   Status anterior: {current_status.status}")

        # 1. Limpar arquivos de estado do orchestrator
        state_dir = self.base_dir / "state"
        for state_file in [".bootstrap_status", "pause.json"]:
            state_path = state_dir / state_file
            if state_path.exists():
                state_path.unlink()
                print(f"   ✅ Removido: state/{state_file}")

        # 2. Reset backlog_master.json (vazio)
        backlog_path = state_dir / "backlog_master.json"
        fresh_backlog = {
            "project": request.project_name or "SuperCore v2.0",
            "cards": [],
            "journal": [],
            "metadata": {"total_cards": 0, "last_updated": ""}
        }
        with open(backlog_path, 'w') as f:
            json.dump(fresh_backlog, f, indent=2)
        print(f"   ✅ Reset: state/backlog_master.json (0 cards)")

        # 3. Limpar database do portal (TODAS as tabelas para começar do zero)
        monitoring_db = DB_PATH
        if monitoring_db.exists():
            import sqlite3
            conn = sqlite3.connect(monitoring_db)
            cursor = conn.cursor()

            # Limpar TODAS as tabelas (reset completo)
            cursor.execute("DELETE FROM events")
            events_deleted = cursor.rowcount

            cursor.execute("DELETE FROM cards")
            cards_deleted = cursor.rowcount

            cursor.execute("DELETE FROM sessions")
            sessions_deleted = cursor.rowcount

            cursor.execute("DELETE FROM squads")
            squads_deleted = cursor.rowcount

            cursor.execute("DELETE FROM metrics")
            metrics_deleted = cursor.rowcount

            cursor.execute("DELETE FROM checkpoints")
            checkpoints_deleted = cursor.rowcount

            cursor.execute("DELETE FROM squad_tasks")
            tasks_deleted = cursor.rowcount

            cursor.execute("DELETE FROM squad_structure")
            structures_deleted = cursor.rowcount

            conn.commit()
            conn.close()
            print(f"   ✅ DB Limpo: {events_deleted} eventos, {cards_deleted} cards, {sessions_deleted} sessions, {squads_deleted} squads, {metrics_deleted} metrics, {checkpoints_deleted} checkpoints, {tasks_deleted} tasks, {structures_deleted} squad structures")

        # 4. Limpar bootstrap_status.json do monitoring
        monitoring_status = DATA_DIR / "bootstrap_status.json"
        if monitoring_status.exists():
            monitoring_status.unlink()
            print(f"   ✅ Removido: monitoring/bootstrap_status.json")

        # 5. Limpar artefactos gerados (documentos, código)
        artefactos_dir = self.base_dir.parent.parent / "app-artefacts"
        if artefactos_dir.exists():
            for item in artefactos_dir.iterdir():
                if item.is_dir() and item.name not in ['.gitkeep']:
                    shutil.rmtree(item)
                elif item.is_file() and item.name not in ['.gitkeep', 'README.md']:
                    item.unlink()
            print(f"   ✅ app-artefacts/ limpo")

        # 6. Limpar código gerado (app-solution/)
        app_solution_dir = self.base_dir.parent.parent / "app-solution"
        if app_solution_dir.exists():
            for item in app_solution_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item)
                    print(f"   ✅ Deletado: app-solution/{item.name}/")
                else:
                    item.unlink()
                    print(f"   ✅ Deletado: app-solution/{item.name}")

        # 6. Limpar logs antigos (manter apenas logs de hoje)
        logs_dir = self.base_dir / "logs"
        if logs_dir.exists():
            from datetime import datetime, timedelta
            hoje = datetime.now().date()
            for log_file in logs_dir.glob("*.log*"):
                # Manter apenas logs de hoje
                file_date = datetime.fromtimestamp(log_file.stat().st_mtime).date()
                if file_date < hoje:
                    log_file.unlink()
                    print(f"   ✅ Removido log antigo: {log_file.name}")

        print("✅ LIMPEZA COMPLETA! Projeto resetado para estado inicial.")

        # Generate NEW session ID (will be inserted later in the flow)
        session_id = f"session_{int(time.time())}"
        self.current_session_id = session_id
        collector.current_session_id = session_id
        print(f"   🆕 Nova sessão ID gerado: {session_id}")

        # Determine config file
        config_file = None
        if request.config_json:
            # Save inline config to temp file
            config_file = DATA_DIR / f"{session_id}_config.json"
            with open(config_file, 'w') as f:
                f.write(request.config_json)
        elif request.config_file:
            # If just a filename (not a path), use default location
            if request.config_file == "meta-squad-config.json" or not "/" in request.config_file:
                config_file = self.base_dir / request.config_file
            else:
                config_file = Path(request.config_file)

            if not config_file.exists():
                raise HTTPException(status_code=404, detail=f"Config file not found: {config_file}")
        else:
            # Use default config
            config_file = self.base_dir / "meta-squad-config.json"
            if not config_file.exists():
                raise HTTPException(status_code=404, detail="No config file provided and default not found")

        # Start Celery worker FIRST (if not already running)
        try:
            celery_start_script = self.base_dir / "start-celery-worker.sh"
            if celery_start_script.exists():
                celery_result = subprocess.run(
                    ["bash", str(celery_start_script)],
                    cwd=self.base_dir,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if celery_result.returncode != 0:
                    print(f"⚠️  Celery worker start warning: {celery_result.stderr}")
                else:
                    print(f"✅ Celery worker: {celery_result.stdout.strip()}")
            else:
                print(f"⚠️  Celery auto-start script not found: {celery_start_script}")
        except Exception as e:
            print(f"⚠️  Warning: Could not start Celery worker: {e}")
            # Continue anyway - worker might already be running

        # Start Claude Squad Orchestrator
        try:
            # Use Python orchestrator - accepts only session_id as positional arg
            cmd = [
                "python3",
                str(self.orchestrator_script),
                session_id
            ]

            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.base_dir,
                start_new_session=True  # Create new process group
            )

            self.process = process

            # Save status
            status = BootstrapStatus(
                status="running",
                session_id=session_id,
                pid=process.pid,
                started_at=datetime.now().isoformat()
            )
            self.save_status(status)

            # Create session in database
            db.execute(
                "INSERT INTO sessions (session_id, started_at, status) VALUES (?, ?, 'active')",
                (session_id, datetime.now().isoformat())
            )

            # Log to events (using direct SQL instead of non-existent log_event method)
            event_id = f"evt_{int(time.time() * 1000)}"
            db.execute(
                "INSERT INTO events (event_id, type, timestamp, squad, message, session_id) VALUES (?, ?, ?, ?, ?, ?)",
                (event_id, "bootstrap_started", datetime.now().isoformat(), "system", f"Claude Squad Orchestrator started - Session {session_id}", session_id)
            )

            return status

        except Exception as e:
            error_status = BootstrapStatus(
                status="error",
                error_message=str(e)
            )
            self.save_status(error_status)
            raise HTTPException(status_code=500, detail=str(e))

    def stop_bootstrap(self, confirmed: bool = False) -> BootstrapStatus:
        """
        Stop running bootstrap - PARA O PROJETO COMPLETAMENTE

        Esta operação:
        1. Para o orchestrator
        2. Para Celery workers
        3. Marca que a próxima "Iniciar Projeto" deve limpar TUDO

        Diferente de PAUSAR que salva estado para retomar.
        """
        if not confirmed:
            raise HTTPException(
                status_code=400,
                detail="Confirmação necessária. Use 'confirmed=true' para parar o projeto."
            )

        current_status = self.get_status()

        if current_status.status != "running":
            raise HTTPException(status_code=400, detail="Nenhum projeto em execução")

        print("🛑 PARANDO PROJETO COMPLETAMENTE...")

        # 1. Parar orchestrator
        if current_status.pid:
            try:
                os.killpg(os.getpgid(current_status.pid), signal.SIGTERM)
                print(f"   ✅ Orchestrator parado (PID: {current_status.pid})")
            except ProcessLookupError:
                print(f"   ⚠️  Orchestrator já estava parado")

        # 2. Parar Celery workers
        try:
            subprocess.run(
                ["pkill", "-f", "celery.*worker"],
                capture_output=True,
                timeout=10
            )
            print(f"   ✅ Celery workers parados")
        except Exception as e:
            print(f"   ⚠️  Erro ao parar Celery: {e}")

        # 3. Marcar que próxima inicialização deve limpar tudo
        # (A limpeza já está implementada em start_bootstrap, então não precisamos marcar nada)

        stopped_status = BootstrapStatus(
            status="stopped",
            session_id=current_status.session_id
        )
        self.save_status(stopped_status)

        print("✅ Projeto parado. Próximo 'Iniciar Projeto' limpará TUDO e começará do zero.")

        return stopped_status

    def save_checkpoint(self, session_id: str, checkpoint_name: str, squad_completed: str, squads_completed_list: List[str], overall_progress: float) -> Checkpoint:
        """Save a checkpoint for recovery"""
        checkpoint_id = f"checkpoint_{int(time.time() * 1000)}"
        timestamp = datetime.now().isoformat()

        # Get artifacts path
        artifacts_path = str(BASE_DIR / "app-artefacts")

        # Prepare metadata
        metadata = {
            "checkpoint_name": checkpoint_name,
            "squad_completed": squad_completed,
            "squads_remaining": self._get_remaining_squads(squads_completed_list)
        }

        # Save to database
        query = """
            INSERT INTO checkpoints
            (checkpoint_id, session_id, checkpoint_name, squad_completed,
             squads_completed_list, artifacts_path, timestamp, overall_progress, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            checkpoint_id,
            session_id,
            checkpoint_name,
            squad_completed,
            json.dumps(squads_completed_list),
            artifacts_path,
            timestamp,
            overall_progress,
            json.dumps(metadata)
        ))

        return Checkpoint(
            checkpoint_id=checkpoint_id,
            session_id=session_id,
            checkpoint_name=checkpoint_name,
            squad_completed=squad_completed,
            squads_completed_list=squads_completed_list,
            artifacts_path=artifacts_path,
            timestamp=timestamp,
            overall_progress=overall_progress,
            metadata=metadata
        )

    def _get_remaining_squads(self, completed_squads: List[str]) -> List[str]:
        """Get list of squads that haven't been completed yet"""
        all_squads = ["produto", "arquitetura", "engenharia_frontend", "engenharia_backend", "qa", "deploy"]
        return [s for s in all_squads if s not in completed_squads]

    def get_checkpoints(self, session_id: Optional[str] = None, limit: int = 10) -> List[Checkpoint]:
        """Get checkpoints for a session (or all sessions)"""
        if session_id:
            query = """
                SELECT * FROM checkpoints
                WHERE session_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """
            rows = self.db.execute(query, (session_id, limit))
        else:
            query = """
                SELECT * FROM checkpoints
                ORDER BY timestamp DESC
                LIMIT ?
            """
            rows = self.db.execute(query, (limit,))

        checkpoints = []
        for row in rows:
            checkpoints.append(Checkpoint(
                checkpoint_id=row["checkpoint_id"],
                session_id=row["session_id"],
                checkpoint_name=row["checkpoint_name"],
                squad_completed=row.get("squad_completed"),
                squads_completed_list=json.loads(row.get("squads_completed_list", "[]")),
                artifacts_path=row.get("artifacts_path"),
                timestamp=row["timestamp"],
                overall_progress=row.get("overall_progress", 0.0),
                metadata=json.loads(row.get("metadata", "{}"))
            ))

        return checkpoints

    def get_last_checkpoint(self, session_id: Optional[str] = None) -> Optional[Checkpoint]:
        """Get the most recent checkpoint"""
        checkpoints = self.get_checkpoints(session_id=session_id, limit=1)
        return checkpoints[0] if checkpoints else None

    async def resume_from_checkpoint(self, request: ResumeRequest) -> BootstrapStatus:
        """Resume bootstrap from a checkpoint"""
        # Check if already running
        current_status = self.get_status()
        if current_status.status in ["running", "starting"]:
            raise HTTPException(status_code=400, detail="Bootstrap already running")

        # Get checkpoint
        checkpoint = None
        if request.checkpoint_id:
            # Resume from specific checkpoint
            checkpoints = self.get_checkpoints()
            checkpoint = next((c for c in checkpoints if c.checkpoint_id == request.checkpoint_id), None)
            if not checkpoint:
                raise HTTPException(status_code=404, detail=f"Checkpoint {request.checkpoint_id} not found")
        else:
            # Resume from last checkpoint
            checkpoint = self.get_last_checkpoint(session_id=request.session_id)
            if not checkpoint:
                raise HTTPException(status_code=404, detail="No checkpoints found")

        # Create new session ID for resume
        new_session_id = f"session_{int(time.time())}"
        self.current_session_id = new_session_id

        # Get remaining squads
        remaining_squads = self._get_remaining_squads(checkpoint.squads_completed_list)

        if not remaining_squads:
            raise HTTPException(status_code=400, detail="All squads already completed in this checkpoint")

        # Start bootstrap with --resume flag and skip completed squads
        try:
            cmd = [
                "python3",
                str(self.orchestrator_script),
                "--config", str(BASE_DIR / "meta-squad-config.json"),
                "--phase", "1",
                "--resume",
                "--skip-squads", ",".join(checkpoint.squads_completed_list),
                "--session-id", new_session_id
            ]

            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.base_dir,
                start_new_session=True
            )

            self.process = process

            # Save status
            status = BootstrapStatus(
                status="running",
                session_id=new_session_id,
                pid=process.pid,
                started_at=datetime.now().isoformat(),
                overall_progress=checkpoint.overall_progress
            )
            self.save_status(status)

            # Create session in database
            self.db.execute(
                "INSERT INTO sessions (session_id, started_at, status, config) VALUES (?, ?, 'active', ?)",
                (new_session_id, datetime.now().isoformat(), json.dumps({
                    "resumed_from": checkpoint.checkpoint_id,
                    "original_session": checkpoint.session_id,
                    "skipped_squads": checkpoint.squads_completed_list
                }))
            )

            # Log event
            event_id = f"evt_{int(time.time() * 1000)}"
            self.db.execute(
                "INSERT INTO events (event_id, type, timestamp, squad, message, session_id) VALUES (?, ?, ?, ?, ?, ?)",
                (event_id, "bootstrap_resumed", datetime.now().isoformat(), "system",
                 f"Bootstrap resumed from checkpoint {checkpoint.checkpoint_name} (skipping: {', '.join(checkpoint.squads_completed_list)})",
                 new_session_id)
            )

            return status

        except Exception as e:
            error_status = BootstrapStatus(
                status="error",
                error_message=str(e)
            )
            self.save_status(error_status)
            raise HTTPException(status_code=500, detail=str(e))

    async def approve_deploy(self, request: ApprovalRequest) -> BootstrapStatus:
        """Approve or reject deployment to environment"""
        current_status = self.get_status()

        if current_status.session_id != request.session_id:
            raise HTTPException(status_code=400, detail="Session ID mismatch")

        if current_status.approval_stage != "awaiting_deploy_approval":
            raise HTTPException(status_code=400, detail="Not awaiting approval")

        # Write approval to file that bootstrap can read
        approval_file = DATA_DIR / f"approval_{request.session_id}.json"
        with open(approval_file, 'w') as f:
            json.dump({
                "approval_type": request.approval_type,
                "approved": request.approved,
                "comments": request.comments,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)

        # Update status
        if request.approved:
            updated_status = BootstrapStatus(
                status="running",
                session_id=current_status.session_id,
                pid=current_status.pid,
                started_at=current_status.started_at,
                approval_stage=None  # Clear approval stage
            )
        else:
            updated_status = BootstrapStatus(
                status="completed",
                session_id=current_status.session_id,
                started_at=current_status.started_at,
                approval_stage=None,
                error_message=f"Deploy rejected: {request.comments}"
            )

        self.save_status(updated_status)
        return updated_status


# ============================================================================
# Celery Helper Functions
# ============================================================================

def get_celery_task_info(task_id: str) -> Optional[CeleryTaskInfo]:
    """Get Celery task information"""
    if not CELERY_AVAILABLE or not celery_app:
        return None

    try:
        result = AsyncResult(task_id, app=celery_app)

        # Get task state
        state = result.state
        info = result.info if result.info else {}

        # Handle different states
        if state == 'PENDING':
            return CeleryTaskInfo(
                task_id=task_id,
                status='PENDING',
                progress=0,
                current_step='Queued...'
            )
        elif state == 'STARTED':
            return CeleryTaskInfo(
                task_id=task_id,
                status='STARTED',
                progress=5,
                current_step='Starting...'
            )
        elif state == 'PROGRESS':
            return CeleryTaskInfo(
                task_id=task_id,
                status='PROGRESS',
                progress=info.get('progress', 0),
                current_step=info.get('current_step', 'Working...'),
                elapsed=info.get('elapsed'),
                worker=info.get('worker'),
                retries=info.get('retries'),
                # Enhanced progress context fields
                milestone_phase=info.get('milestone_phase'),
                milestone_name=info.get('milestone_name'),
                deliverable_index=info.get('deliverable_index'),
                deliverable_name=info.get('deliverable_name'),
                files_modified_count=info.get('files_modified_count'),
                dependencies_blocked=info.get('dependencies_blocked'),
                eta=info.get('eta_seconds'),
                progress_context=info.get('progress_context')
            )
        elif state == 'SUCCESS':
            return CeleryTaskInfo(
                task_id=task_id,
                status='SUCCESS',
                progress=100,
                current_step='Completed',
                result=info,
                elapsed=info.get('elapsed')
            )
        elif state == 'FAILURE':
            return CeleryTaskInfo(
                task_id=task_id,
                status='FAILURE',
                progress=info.get('progress', 0),
                current_step='Failed',
                result=info,
                traceback=result.traceback
            )
        elif state == 'RETRY':
            return CeleryTaskInfo(
                task_id=task_id,
                status='RETRY',
                progress=info.get('progress', 0),
                current_step='Retrying...',
                retries=info.get('retries'),
                max_retries=info.get('max_retries')
            )
        else:
            return CeleryTaskInfo(
                task_id=task_id,
                status=state,
                progress=0
            )

    except Exception as e:
        print(f"Error getting Celery task info: {e}")
        return None


def get_task_logs_from_redis(card_id: str, limit: int = 100) -> List[TaskLog]:
    """Get task logs from Redis"""
    if not REDIS_AVAILABLE or not redis_client:
        return []

    try:
        # Get logs from Redis list
        log_key = f"task:logs:{card_id}"
        log_entries = redis_client.lrange(log_key, -limit, -1)

        logs = []
        for entry in log_entries:
            try:
                log_data = json.loads(entry)
                logs.append(TaskLog(
                    timestamp=log_data.get('timestamp', ''),
                    level=log_data.get('level', 'INFO'),
                    message=log_data.get('message', ''),
                    task_id=log_data.get('task_id', '')
                ))
            except json.JSONDecodeError:
                continue

        return logs

    except Exception as e:
        print(f"Error getting task logs from Redis: {e}")
        return []


# Global instances
db = MonitoringDB(DB_PATH)
collector = DataCollector(db)
ws_manager = ConnectionManager()
bootstrap_controller = BootstrapController(APP_EXECUTION_DIR)  # Point to app-execution/
bootstrap_controller.db = db  # Connect db to bootstrap controller
milestone_manager = MilestoneManager(META_CONFIG_PATH)
solution_analyzer = SolutionAnalyzer(Path(__file__).parent)  # Analyze app-solution/


# ============================================================================
# Background Tasks
# ============================================================================

async def collect_data_periodically():
    """Background task to collect data every 5 seconds"""
    while True:
        try:
            # Collect data
            squads = collector.collect_squad_status()
            cards = collector.collect_card_status()
            metrics = collector.calculate_metrics()

            # Broadcast to WebSocket clients
            await ws_manager.broadcast({
                "type": "update",
                "timestamp": datetime.now().isoformat(),
                "data": {
                    "squads": [s.dict() for s in squads],
                    "cards": [c.dict() for c in cards],
                    "metrics": metrics.dict()
                }
            })

        except Exception as e:
            print(f"Error in data collection: {e}")

        await asyncio.sleep(5)


@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(collect_data_periodically())

    # Create or get current session
    session_id = collector.get_current_session()
    if not session_id:
        session_id = f"session_{int(time.time())}"
        collector.current_session_id = session_id

        query = """
            INSERT INTO sessions (session_id, started_at, status)
            VALUES (?, ?, 'active')
        """
        db.execute(query, (session_id, datetime.now().isoformat()))

        print(f"Created new session: {session_id}")
    else:
        print(f"Using existing session: {session_id}")


# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/api/status")
async def get_status() -> SessionStatus:
    """Get overall system status"""
    session_id = collector.get_current_session()

    # If no session file, get most recent from database
    if not session_id:
        session_query = "SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1"
        session_data = db.execute_one(session_query)
    else:
        # Get session info
        session_query = "SELECT * FROM sessions WHERE session_id = ?"
        session_data = db.execute_one(session_query, (session_id,))

    if not session_data:
        raise HTTPException(status_code=404, detail="No active session")

    session_id = session_data["session_id"]

    started_at = datetime.fromisoformat(session_data["started_at"])
    uptime_seconds = int((datetime.now() - started_at).total_seconds())

    # Collect data
    squads = collector.collect_squad_status()
    metrics = collector.calculate_metrics()
    events = collector.collect_events(limit=20)

    # Calculate overall progress
    total_cards = sum(s.cards_total for s in squads)
    done_cards = sum(s.cards_done for s in squads)
    overall_progress = (done_cards / total_cards * 100) if total_cards > 0 else 0.0

    return SessionStatus(
        session_id=session_id,
        started_at=session_data["started_at"],
        uptime_seconds=uptime_seconds,
        overall_progress=overall_progress,
        squads=squads,
        metrics=metrics,
        recent_events=events
    )


@app.get("/api/squads")
async def get_squads() -> List[SquadStatus]:
    """Get all squads status"""
    return collector.collect_squad_status()


@app.get("/api/squads/{squad_id}")
async def get_squad(squad_id: str) -> SquadStatus:
    """Get specific squad status"""
    squads = collector.collect_squad_status()
    squad = next((s for s in squads if s.squad_id == squad_id), None)

    if not squad:
        raise HTTPException(status_code=404, detail=f"Squad {squad_id} not found")

    return squad


@app.get("/api/squads/structure/all")
async def get_squads_structure() -> List[SquadStructure]:
    """
    Get complete organizational structure of all squads
    PRIORITY: Reads from squad_structure table (dynamic allocation by Squad Planner)
    FALLBACK: Reads from meta-squad-config.json (static config)
    """
    try:
        # TRY 1: Read from squad_structure table (dynamic, created by Squad Planner)
        rows = db.execute("SELECT * FROM squad_structure ORDER BY squad_id")

        if rows and len(rows) > 0:
            # We have dynamic allocations - use them!
            squads_structure = []
            for row in rows:
                agents_list = json.loads(row["agents"])
                agents = [SquadAgent(**agent) for agent in agents_list]

                squad_structure = SquadStructure(
                    squad_id=row["squad_id"],
                    name=row["squad_name"],
                    description=row.get("scope_summary", ""),
                    agents=agents,
                    skills=json.loads(row.get("skills", "[]")),
                    justification=row.get("justification"),
                    scope_summary=row.get("scope_summary"),
                    technologies=json.loads(row.get("technologies", "[]")),
                    allocated_by=row.get("allocated_by", "squad-planner")
                )

                squads_structure.append(squad_structure)

            return squads_structure

        # FALLBACK: Read from meta-squad-config.json (static config)
        if not META_CONFIG_PATH.exists():
            raise HTTPException(status_code=404, detail="No squad structure found. Run /api/squads/structure/plan first or provide meta-squad-config.json")

        with open(META_CONFIG_PATH, 'r') as f:
            config = json.load(f)

        squads_data = config.get("squads", {})
        milestones_data = config.get("workflow", {}).get("milestones", [])

        squads_structure = []

        for squad_id, squad_config in squads_data.items():
            if squad_id == "meta":
                continue  # Skip meta orchestrator

            # Extract agents
            agents = []
            if "agents" in squad_config:
                for agent_name in squad_config["agents"]:
                    agents.append(SquadAgent(
                        name=agent_name,
                        role=agent_name,
                        description=squad_config.get("responsibilities", {}).get(agent_name)
                    ))

            # Management squad has special structure
            if squad_id == "management" and "responsibilities" in squad_config:
                agents = []
                for agent_name, description in squad_config["responsibilities"].items():
                    agents.append(SquadAgent(
                        name=agent_name,
                        role=agent_name,
                        description=description
                    ))

            # Extract permissions, responsibilities, milestones
            permissions = squad_config.get("autonomous_permissions", {})
            responsibilities = []
            if "responsibilities" in squad_config and isinstance(squad_config["responsibilities"], dict):
                responsibilities = list(squad_config["responsibilities"].values())

            relevant_milestones = []
            for milestone in milestones_data:
                if squad_id in milestone.get("squads", []):
                    relevant_milestones.append({
                        "phase": milestone.get("phase"),
                        "name": milestone.get("name"),
                        "description": milestone.get("description"),
                        "deliverables": milestone.get("deliverables", [])
                    })

            # Handle sub-squads
            sub_squads_data = None
            if "sub_squads" in squad_config:
                sub_squads_data = squad_config["sub_squads"]

            squad_structure = SquadStructure(
                squad_id=squad_id,
                name=squad_id.replace("_", " ").title(),
                description=squad_config.get("description", ""),
                agents=agents,
                inputs_from=squad_config.get("inputs_from"),
                outputs_to=squad_config.get("outputs_to"),
                permissions=permissions,
                responsibilities=responsibilities,
                sub_squads=sub_squads_data,
                milestones=relevant_milestones,
                allocated_by="meta-squad-config"  # Static config
            )

            squads_structure.append(squad_structure)

        return squads_structure

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error loading squad structure: {str(e)}"
        )


@app.get("/api/squads/{squad_id}/structure")
async def get_squad_structure(squad_id: str) -> SquadStructure:
    """Get detailed structure of a specific squad"""
    squads = await get_squads_structure()
    squad = next((s for s in squads if s.squad_id == squad_id), None)

    if not squad:
        raise HTTPException(status_code=404, detail=f"Squad structure for {squad_id} not found")

    return squad


@app.get("/api/squads/{squad_id}/tasks")
async def get_squad_tasks(squad_id: str, sprint: Optional[int] = None) -> List[SquadTask]:
    """Get tasks/sprints for a specific squad"""
    try:
        query = """
            SELECT * FROM squad_tasks
            WHERE squad_id = ?
        """
        params = [squad_id]

        if sprint is not None:
            query += " AND sprint_number = ?"
            params.append(sprint)

        query += " ORDER BY sprint_number, created_at"

        rows = db.execute(query, tuple(params))

        tasks = []
        for row in rows:
            tasks.append(SquadTask(
                task_id=row["task_id"],
                squad_id=row["squad_id"],
                title=row["title"],
                description=row.get("description", ""),
                status=row["status"],
                sprint_number=row.get("sprint_number"),
                assigned_agent=row.get("assigned_agent"),
                started_at=row.get("started_at"),
                completed_at=row.get("completed_at"),
                dependencies=json.loads(row.get("dependencies", "[]")),
                deliverables=json.loads(row.get("deliverables", "[]")),
                progress_percent=row.get("progress_percent", 0.0)
            ))

        return tasks

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting squad tasks: {str(e)}"
        )


@app.post("/api/squads/structure/plan")
async def plan_squad_structures(session_id: Optional[str] = None):
    """
    Execute Squad Planner to analyze documentation and create dynamic squad allocations
    Saves results to squad_structure table
    """
    try:
        # Initialize Squad Planner
        base_dir = Path(__file__).parent
        planner = SquadPlanner(base_dir)

        # Analyze and allocate
        structures = planner.analyze_and_allocate(session_id=session_id)

        # Save to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Clear previous structures for this session (if any)
        if session_id:
            cursor.execute("DELETE FROM squad_structure WHERE session_id = ?", (session_id,))

        # Insert new structures
        for struct in structures:
            cursor.execute("""
                INSERT OR REPLACE INTO squad_structure
                (squad_id, squad_name, agents, skills, justification, scope_summary, technologies, allocated_by, session_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                struct["squad_id"],
                struct["squad_name"],
                struct["agents"],
                struct["skills"],
                struct["justification"],
                struct["scope_summary"],
                struct["technologies"],
                struct["allocated_by"],
                struct.get("session_id"),
                struct["created_at"],
                struct["updated_at"]
            ))

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "message": f"Squad Planner executed successfully. {len(structures)} squads allocated.",
            "structures": structures
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing Squad Planner: {str(e)}"
        )


@app.get("/api/cards")
async def get_cards(status: Optional[str] = None, squad: Optional[str] = None) -> List[CardStatus]:
    """Get all cards with optional filters"""
    cards = collector.collect_card_status()

    if status:
        cards = [c for c in cards if c.status == status]

    if squad:
        cards = [c for c in cards if c.squad == squad]

    return cards


@app.get("/api/cards/enhanced")
async def get_cards_enhanced(status: Optional[str] = None, squad: Optional[str] = None) -> List[CardStatusEnhanced]:
    """
    Get all cards with Celery task information (enhanced)

    This endpoint returns cards with additional Celery task details:
    - Task ID
    - Current progress (0-100%)
    - Current step
    - Elapsed time
    - Worker assignment
    - Retry count
    - Logs availability
    """
    cards = collector.collect_card_status()

    # Apply filters
    if status:
        cards = [c for c in cards if c.status == status]
    if squad:
        cards = [c for c in cards if c.squad == squad]

    # Enhance cards with Celery information
    enhanced_cards = []
    for card in cards:
        # Get Celery task ID from database
        query = "SELECT celery_task_id FROM cards WHERE card_id = ?"
        row = db.execute_one(query, (card.card_id,))
        celery_task_id = row.get("celery_task_id") if row else None

        # Get Celery task info
        celery_task = None
        if celery_task_id:
            celery_task = get_celery_task_info(celery_task_id)

        # Check if logs are available
        logs_available = False
        if REDIS_AVAILABLE and redis_client:
            try:
                log_key = f"task:logs:{card.card_id}"
                logs_available = redis_client.exists(log_key) > 0
            except:
                pass

        # Create enhanced card
        enhanced = CardStatusEnhanced(
            **card.dict(),
            celery_task=celery_task,
            logs_available=logs_available
        )
        enhanced_cards.append(enhanced)

    return enhanced_cards


@app.get("/api/cards/{card_id}/enhanced")
async def get_card_enhanced(card_id: str) -> CardStatusEnhanced:
    """Get specific card with Celery task information (enhanced)"""
    cards = collector.collect_card_status()
    card = next((c for c in cards if c.card_id == card_id), None)

    if not card:
        raise HTTPException(status_code=404, detail=f"Card {card_id} not found")

    # Get Celery task ID
    query = "SELECT celery_task_id FROM cards WHERE card_id = ?"
    row = db.execute_one(query, (card_id,))
    celery_task_id = row.get("celery_task_id") if row else None

    # Get Celery task info
    celery_task = None
    if celery_task_id:
        celery_task = get_celery_task_info(celery_task_id)

    # Check if logs are available
    logs_available = False
    if REDIS_AVAILABLE and redis_client:
        try:
            log_key = f"task:logs:{card_id}"
            logs_available = redis_client.exists(log_key) > 0
        except:
            pass

    return CardStatusEnhanced(
        **card.dict(),
        celery_task=celery_task,
        logs_available=logs_available
    )


@app.get("/api/cards/{card_id}")
async def get_card(card_id: str) -> CardStatus:
    """Get specific card status (basic - without Celery info)"""
    cards = collector.collect_card_status()
    card = next((c for c in cards if c.card_id == card_id), None)

    if not card:
        raise HTTPException(status_code=404, detail=f"Card {card_id} not found")

    return card


@app.get("/api/tasks/{card_id}/logs")
async def get_task_logs(card_id: str, limit: int = 100) -> List[TaskLog]:
    """
    Get real-time task logs from Redis for a card

    Returns logs streamed during task execution:
    - Agent stdout/stderr
    - Progress markers
    - Error messages
    """
    logs = get_task_logs_from_redis(card_id, limit=limit)

    if not logs:
        # Return empty list if no logs (not an error - task might not have started yet)
        return []

    return logs


@app.post("/api/tasks/{card_id}/retry")
async def retry_task(card_id: str, request: RetryTaskRequest):
    """
    Retry a failed Celery task

    This endpoint allows manual retry of failed cards:
    - Checks if card exists and has a Celery task ID
    - Verifies task is in FAILURE state (unless force=True)
    - Enqueues new task with same card_id
    - Updates database with new task ID
    """
    if not CELERY_AVAILABLE or not celery_app:
        raise HTTPException(
            status_code=503,
            detail="Celery not available. System running in subprocess mode."
        )

    # Get card from database
    query = "SELECT * FROM cards WHERE card_id = ?"
    card_row = db.execute_one(query, (card_id,))

    if not card_row:
        raise HTTPException(status_code=404, detail=f"Card {card_id} not found")

    celery_task_id = card_row.get("celery_task_id")

    # Check if task can be retried
    if not celery_task_id:
        raise HTTPException(
            status_code=400,
            detail="Card has no associated Celery task. It may have been executed via subprocess."
        )

    # Check task status
    task_info = get_celery_task_info(celery_task_id)
    if task_info and task_info.status not in ['FAILURE', 'REVOKED'] and not request.force:
        raise HTTPException(
            status_code=400,
            detail=f"Task is in {task_info.status} state. Use force=True to retry anyway."
        )

    # Enqueue new task
    try:
        from tasks import execute_card_task

        # Revoke old task if still running
        if task_info and task_info.status in ['PENDING', 'STARTED', 'PROGRESS', 'RETRY']:
            old_result = AsyncResult(celery_task_id, app=celery_app)
            old_result.revoke(terminate=True)

        # Enqueue new task
        result = execute_card_task.delay(card_id)

        # Update database with new task ID
        update_query = """
            UPDATE cards
            SET celery_task_id = ?, status = 'TODO', updated_at = ?
            WHERE card_id = ?
        """
        db.execute(update_query, (result.id, datetime.now().isoformat(), card_id))

        return {
            "status": "success",
            "message": f"Task retried successfully",
            "card_id": card_id,
            "old_task_id": celery_task_id,
            "new_task_id": result.id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrying task: {str(e)}"
        )


@app.get("/api/metrics")
async def get_metrics() -> Metrics:
    """Get current metrics"""
    return collector.calculate_metrics()


@app.get("/api/progress/dual")
async def get_dual_progress():
    """
    Get two-level progress tracking: Planning vs Execution

    Returns:
    - planning: How many cards have been created (meta-orchestrator planning)
    - execution: How many cards have been executed (Celery workers execution)
    - overall: Overall project progress

    Example:
    {
      "planning": {
        "cards_created": 35,
        "cards_planned": 180,
        "progress_percentage": 19.4
      },
      "execution": {
        "cards_done": 8,
        "cards_in_progress": 3,
        "cards_todo": 24,
        "total_cards": 35,
        "progress_percentage": 22.9
      },
      "overall": {
        "cards_finalized": 8,
        "cards_total_estimated": 180,
        "progress_percentage": 4.4
      }
    }
    """
    try:
        # Load backlog to get actual card counts
        backlog_file = STATE_DIR / "backlog_master.json"

        if not backlog_file.exists():
            return {
                "planning": {
                    "cards_created": 0,
                    "cards_planned": 180,
                    "progress_percentage": 0.0
                },
                "execution": {
                    "cards_done": 0,
                    "cards_in_progress": 0,
                    "cards_todo": 0,
                    "total_cards": 0,
                    "progress_percentage": 0.0
                },
                "overall": {
                    "cards_finalized": 0,
                    "cards_total_estimated": 180,
                    "progress_percentage": 0.0
                }
            }

        with open(backlog_file) as f:
            backlog = json.load(f)

        cards = backlog.get("cards", [])

        # Count cards by status
        total_cards = len(cards)
        done_cards = len([c for c in cards if c.get("status") == "DONE"])
        in_progress_cards = len([c for c in cards if c.get("status") == "IN_PROGRESS"])
        todo_cards = len([c for c in cards if c.get("status") == "TODO"])

        # Estimated total from config (default 180)
        total_planned = 180
        try:
            config_file = BASE_DIR / "meta-squad-config.json"
            if config_file.exists():
                with open(config_file) as f:
                    config = json.load(f)
                    # Try to get estimated total from config
                    total_planned = config.get("workflow", {}).get("estimated_total_cards", 180)
        except:
            pass

        # Calculate progress percentages
        planning_progress = (total_cards / total_planned) * 100 if total_planned > 0 else 0.0
        execution_progress = (done_cards / total_cards) * 100 if total_cards > 0 else 0.0
        overall_progress = (done_cards / total_planned) * 100 if total_planned > 0 else 0.0

        return {
            "planning": {
                "cards_created": total_cards,
                "cards_planned": total_planned,
                "progress_percentage": round(planning_progress, 1)
            },
            "execution": {
                "cards_done": done_cards,
                "cards_in_progress": in_progress_cards,
                "cards_todo": todo_cards,
                "total_cards": total_cards,
                "progress_percentage": round(execution_progress, 1)
            },
            "overall": {
                "cards_finalized": done_cards,
                "cards_total_estimated": total_planned,
                "progress_percentage": round(overall_progress, 1)
            }
        }

    except Exception as e:
        print(f"Error calculating dual progress: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating progress: {str(e)}")


@app.get("/api/events")
async def get_events(limit: int = 100, squad: Optional[str] = None):
    """Get events with optional filters"""
    query = "SELECT * FROM events"
    params = []

    if squad:
        query += " WHERE squad = ?"
        params.append(squad)

    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    rows = db.execute(query, tuple(params))

    events = []
    for row in rows:
        metadata_str = row.get("metadata") or "{}"
        metadata = json.loads(metadata_str) if isinstance(metadata_str, str) else {}
        events.append({
            "event_id": row["event_id"],
            "type": row["type"],
            "timestamp": row["timestamp"],
            "squad": row["squad"],
            "card": row.get("card"),
            "agent": row.get("agent"),
            "message": row["message"],
            "metadata": metadata
        })

    return events


@app.get("/api/activities/live")
async def get_live_activities(limit: int = 50):
    """
    Get live activities from logs and events

    Parses orchestrator logs to show real-time what squads are doing:
    - Card creation/execution
    - File operations (reading docs, writing code)
    - Tool usage
    - Agent thinking/actions
    - Milestones reached

    Returns activities grouped by squad with timestamps.
    """
    try:
        activities = []

        # Parse orchestrator log file
        orchestrator_log = LOGS_DIR / "meta-orchestrator.log"
        if orchestrator_log.exists():
            with open(orchestrator_log) as f:
                lines = f.readlines()

            # Parse last 100 log lines
            for line in lines[-100:]:
                activity = parse_log_line_to_activity(line)
                if activity:
                    activities.append(activity)

        # Also get recent events from database
        db_events = db.execute(
            "SELECT * FROM events ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        )

        for event in db_events:
            activity = {
                "timestamp": event["timestamp"],
                "squad": event["squad"],
                "agent": event.get("agent"),
                "type": event["type"],
                "message": event["message"]
            }
            activities.append(activity)

        # Sort by timestamp (most recent first) and limit
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        activities = activities[:limit]

        return {"activities": activities}

    except Exception as e:
        print(f"Error getting live activities: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting activities: {str(e)}")


def parse_log_line_to_activity(line: str) -> dict:
    """
    Parse a log line into an activity object

    Example log formats:
    - "2025-12-22 13:27:32,717 - meta-orchestrator - INFO - ✅ Created card EPIC-001: Product Discovery"
    - "2025-12-22 13:27:32,719 - meta-orchestrator - INFO - ✅ Read documentation: requisitos_funcionais_v2.0.md"
    - "2025-12-22 13:27:32,734 - meta-orchestrator - INFO - 🚀 [Celery] Enqueuing card EPIC-001"
    """
    import re

    # Parse timestamp
    timestamp_match = re.match(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', line)
    if not timestamp_match:
        return None

    timestamp = timestamp_match.group(1)

    # Determine squad from context
    squad = "meta"
    if "Squad Produto" in line or "PROD-" in line:
        squad = "produto"
    elif "Squad Arquitetura" in line or "ARCH-" in line:
        squad = "arquitetura"
    elif "Squad Engenharia" in line or "ENG-" in line or "BACK-" in line or "FRONT-" in line:
        squad = "engenharia"
    elif "Squad QA" in line or "QA-" in line:
        squad = "qa"
    elif "Squad Deploy" in line or "DEPLOY-" in line:
        squad = "deploy"

    # Parse activity type and message
    activity_type = "info"
    message = line.split(" - INFO - ")[-1].strip() if " - INFO - " in line else line.strip()

    # Determine activity type from content
    if "Created card" in message or "📋" in message:
        activity_type = "card_created"
        # Extract card ID
        card_match = re.search(r'(EPIC|PROD|ARCH|ENG|BACK|FRONT|QA|DEPLOY)-\d+', message)
        if card_match:
            message = f"Criou card {card_match.group(0)}"

    elif "Enqueuing card" in message or "🚀" in message:
        activity_type = "card_started"
        card_match = re.search(r'(EPIC|PROD|ARCH|ENG|BACK|FRONT|QA|DEPLOY)-\d+', message)
        if card_match:
            message = f"Iniciando execução de {card_match.group(0)}"

    elif "Read documentation" in message or "📖" in message:
        activity_type = "file_read"
        file_match = re.search(r'([a-z_]+_v\d+\.\d+\.md)', message)
        if file_match:
            message = f"Lendo documentação: {file_match.group(1)}"

    elif "Backlog saved" in message:
        activity_type = "file_written"
        cards_match = re.search(r'(\d+) cards', message)
        if cards_match:
            message = f"Salvou backlog com {cards_match.group(1)} cards"

    elif "Journal:" in message:
        activity_type = "milestone_reached"
        message = message.split("Journal:")[-1].strip()

    elif "✅" in message:
        activity_type = "card_completed"

    elif "❌" in message or "ERROR" in line:
        activity_type = "agent_error"

    # Skip debug/verbose lines
    if not any(indicator in message for indicator in ["✅", "🚀", "📋", "📖", "📝", "🎯", "💭", "❌"]):
        return None

    return {
        "timestamp": timestamp,
        "squad": squad,
        "agent": None,
        "type": activity_type,
        "message": message
    }


@app.get("/api/logs/{squad_id}")
async def get_squad_logs(squad_id: str, lines: int = 100):
    """Get squad logs"""
    log_file = LOGS_DIR / f"{squad_id}.log"

    if not log_file.exists():
        raise HTTPException(status_code=404, detail=f"Logs for {squad_id} not found")

    with open(log_file) as f:
        all_lines = f.readlines()
        recent_lines = all_lines[-lines:]

    return {"squad_id": squad_id, "lines": recent_lines}


# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await ws_manager.connect(websocket)

    try:
        # Send initial data
        squads = collector.collect_squad_status()
        cards = collector.collect_card_status()
        metrics = collector.calculate_metrics()

        await websocket.send_json({
            "type": "initial",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "squads": [s.dict() for s in squads],
                "cards": [c.dict() for c in cards],
                "metrics": metrics.dict()
            }
        })

        # Keep connection alive
        while True:
            # Wait for messages from client (ping/pong)
            data = await websocket.receive_text()

            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.websocket("/ws/tasks")
async def websocket_tasks_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time Celery task updates

    Subscribes to Redis pub/sub channel 'task_updates' and forwards messages to client.

    Message types:
    - progress: Task progress update (progress %, current_step, elapsed time)
    - log: Task log entry (timestamp, level, message)
    - complete: Task completed successfully
    - failed: Task failed with error
    """
    if not REDIS_AVAILABLE or not redis_client:
        await websocket.close(code=1003, reason="Redis not available")
        return

    await websocket.accept()

    try:
        # Create Redis pub/sub
        pubsub = redis_client.pubsub()
        pubsub.subscribe('task_updates')

        # Send initial connection message
        await websocket.send_json({
            "type": "connected",
            "timestamp": datetime.now().isoformat(),
            "message": "Connected to task updates stream"
        })

        # Listen for Redis pub/sub messages
        while True:
            # Check for Redis messages (non-blocking)
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)

            if message and message['type'] == 'message':
                try:
                    # Parse message data
                    data = json.loads(message['data'])

                    # Forward to WebSocket client
                    await websocket.send_json(data)

                except json.JSONDecodeError:
                    # Skip invalid JSON
                    continue
                except Exception as e:
                    print(f"Error forwarding message: {e}")
                    continue

            # Check for client ping
            try:
                client_message = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=0.1
                )

                if client_message == "ping":
                    await websocket.send_text("pong")

            except asyncio.TimeoutError:
                # No message from client, continue listening to Redis
                pass
            except WebSocketDisconnect:
                # Client disconnected
                break

            # Small sleep to prevent busy loop
            await asyncio.sleep(0.05)

    except WebSocketDisconnect:
        pass
    finally:
        # Clean up pub/sub
        if 'pubsub' in locals():
            pubsub.unsubscribe()
            pubsub.close()


# ============================================================================
# Server-Sent Events (SSE) Endpoint
# ============================================================================

@app.get("/api/stream")
async def event_stream():
    """Server-Sent Events stream for real-time updates"""

    async def event_generator():
        last_event_id = None

        while True:
            try:
                # Get new events
                query = """
                    SELECT * FROM events
                    WHERE event_id > ?
                    ORDER BY timestamp ASC
                    LIMIT 10
                """

                rows = db.execute(query, (last_event_id or "",))

                for row in rows:
                    last_event_id = row["event_id"]

                    event_data = {
                        "event_id": row["event_id"],
                        "type": row["type"],
                        "timestamp": row["timestamp"],
                        "squad": row["squad"],
                        "card": row.get("card"),
                        "message": row["message"]
                    }

                    yield f"data: {json.dumps(event_data)}\n\n"

                await asyncio.sleep(2)

            except Exception as e:
                print(f"Error in SSE stream: {e}")
                await asyncio.sleep(5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


# ============================================================================
# Bootstrap Control Endpoints
# ============================================================================

@app.post("/api/bootstrap/start")
async def start_bootstrap(request: BootstrapRequest) -> BootstrapStatus:
    """Start bootstrap process"""
    try:
        return await bootstrap_controller.start_bootstrap(request)
    except Exception as e:
        import traceback
        print(f"❌ ERROR in start_bootstrap: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Bootstrap start failed: {str(e)}")


@app.post("/api/bootstrap/stop")
async def stop_bootstrap(confirmed: bool = False) -> BootstrapStatus:
    """
    Stop running bootstrap - PARA O PROJETO COMPLETAMENTE

    Requer confirmed=true para executar (frontend deve pedir confirmação do usuário).
    Próximo "Iniciar Projeto" limpará TUDO (cards, docs, código, eventos).
    """
    return bootstrap_controller.stop_bootstrap(confirmed=confirmed)


@app.get("/api/project/data")
async def get_project_data():
    """
    Read project metadata from app-data.md file
    Returns parsed project information for use in UI
    """
    try:
        app_data_path = BASE_DIR / "app-data.md"

        if not app_data_path.exists():
            return {
                "project_name": "SuperCore v2.0",
                "description": "Meta-Plataforma de Geração de Software",
                "version": "2.0.0",
                "config_file": "meta-squad-config.json"
            }

        # Read and parse markdown file
        with open(app_data_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Simple parsing (extract key-value pairs)
        data = {
            "project_name": "SuperCore v2.0",
            "description": "",
            "version": "",
            "config_file": "meta-squad-config.json"
        }

        for line in content.split('\n'):
            if '**Nome do Projeto:**' in line:
                data['project_name'] = line.split('**Nome do Projeto:**')[1].strip()
            elif '**Descrição:**' in line:
                data['description'] = line.split('**Descrição:**')[1].strip()
            elif '**Versão:**' in line:
                data['version'] = line.split('**Versão:**')[1].strip()
            elif '**Arquivo de Configuração:**' in line:
                data['config_file'] = line.split('**Arquivo de Configuração:**')[1].strip()

        return data

    except Exception as e:
        print(f"Error reading app-data.md: {e}")
        return {
            "project_name": "SuperCore v2.0",
            "description": "Meta-Plataforma de Geração de Software",
            "version": "2.0.0",
            "config_file": "meta-squad-config.json"
        }


@app.post("/api/execution/pause")
async def pause_execution():
    """
    Pause project execution (Celery workers + orchestrator)

    Calls ./project-lifecycle.sh pause which:
    - Waits for current cards to finish
    - Stops Celery workers gracefully
    - Creates pause flag for orchestrator
    """
    try:
        script_path = BASE_DIR / "project-lifecycle.sh"

        if not script_path.exists():
            raise HTTPException(
                status_code=404,
                detail="project-lifecycle.sh not found. Lifecycle management not installed."
            )

        # Execute pause script
        result = subprocess.run(
            [str(script_path), "pause"],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes max
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Pause failed: {result.stderr}"
            )

        return {
            "status": "success",
            "message": "Project execution paused",
            "output": result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail="Pause operation timed out (waited 5 minutes for cards to finish)"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error pausing execution: {str(e)}"
        )


@app.post("/api/execution/resume")
async def resume_execution():
    """
    Resume project execution (Celery workers + orchestrator)

    Calls ./project-lifecycle.sh resume which:
    - Resets orphaned cards (IN_PROGRESS -> TODO)
    - Starts Celery workers
    - Removes pause flag
    """
    try:
        script_path = BASE_DIR / "project-lifecycle.sh"

        if not script_path.exists():
            raise HTTPException(
                status_code=404,
                detail="project-lifecycle.sh not found. Lifecycle management not installed."
            )

        # Execute resume script
        result = subprocess.run(
            [str(script_path), "resume"],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=60  # 1 minute max
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Resume failed: {result.stderr}"
            )

        return {
            "status": "success",
            "message": "Project execution resumed",
            "output": result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail="Resume operation timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error resuming execution: {str(e)}"
        )


@app.get("/api/orchestrator/status")
async def get_orchestrator_status():
    """
    Get meta-orchestrator status (planning process)

    Returns:
    - status: idle, running, paused, completed, error
    - session_id: Current session ID
    - pid: Process ID if running
    - paused: Whether project is paused
    """
    try:
        # Check bootstrap status (meta-orchestrator)
        bootstrap_status = bootstrap_controller.get_status()

        # Check pause flag
        pause_file = STATE_DIR / "pause.json"
        is_paused = False
        pause_info = None

        if pause_file.exists():
            try:
                with open(pause_file) as f:
                    pause_data = json.load(f)
                    is_paused = pause_data.get("paused", False)
                    pause_info = pause_data
            except:
                pass

        return {
            "orchestrator": {
                "status": bootstrap_status.status,
                "session_id": bootstrap_status.session_id,
                "pid": bootstrap_status.pid,
                "started_at": bootstrap_status.started_at
            },
            "paused": is_paused,
            "pause_info": pause_info
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting orchestrator status: {str(e)}"
        )


@app.get("/api/workers/status")
async def get_workers_status():
    """
    Get Celery workers status (execution process)

    Returns:
    - active_workers: Number of active workers
    - worker_details: List of worker details
    - paused: Whether execution is paused
    """
    try:
        if not CELERY_AVAILABLE or not celery_app:
            return {
                "execution_mode": "subprocess",
                "active_workers": 0,
                "worker_details": [],
                "paused": False,
                "message": "Celery not available. System running in subprocess mode."
            }

        # Check Celery workers
        inspect = celery_app.control.inspect()
        active_workers = inspect.active() or {}
        stats = inspect.stats() or {}

        worker_details = []
        for worker_name, worker_stats in stats.items():
            worker_info = {
                "name": worker_name,
                "active_tasks": len(active_workers.get(worker_name, [])),
                "pool": worker_stats.get("pool", {}),
                "broker": worker_stats.get("broker", {})
            }
            worker_details.append(worker_info)

        # Check pause flag
        pause_file = STATE_DIR / "pause.json"
        is_paused = False
        if pause_file.exists():
            try:
                with open(pause_file) as f:
                    pause_data = json.load(f)
                    is_paused = pause_data.get("paused", False)
            except:
                pass

        return {
            "execution_mode": "celery",
            "active_workers": len(worker_details),
            "worker_details": worker_details,
            "paused": is_paused
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting workers status: {str(e)}"
        )


@app.get("/api/bootstrap/status")
async def get_bootstrap_status() -> BootstrapStatus:
    """Get bootstrap status with milestone information"""
    status = bootstrap_controller.get_status()

    # If bootstrap is running, calculate progress and current milestone
    if status.status == "running" and status.session_id:
        try:
            # Get overall progress from session
            session_id = status.session_id

            # Collect squads data
            squads = collector.collect_squad_status()

            # Calculate overall progress
            total_cards = sum(s.cards_total for s in squads)
            done_cards = sum(s.cards_done for s in squads)
            overall_progress = (done_cards / total_cards * 100) if total_cards > 0 else 0.0

            # Get current milestone
            current_milestone = milestone_manager.get_current_milestone(overall_progress)
            all_milestones = milestone_manager.get_all_milestones()

            # Update status with milestone info
            status.overall_progress = round(overall_progress, 1)
            status.current_milestone = current_milestone
            status.all_milestones = all_milestones

        except Exception as e:
            print(f"Error calculating milestone: {e}")
            # Continue without milestone info

    return status


@app.post("/api/bootstrap/approve")
async def approve_deployment(request: ApprovalRequest) -> BootstrapStatus:
    """Approve or reject deployment"""
    return await bootstrap_controller.approve_deploy(request)


@app.get("/api/solution/stats")
async def get_solution_stats():
    """
    Get statistics about the generated solution in app-solution/

    Returns:
    - total_files: Number of files created
    - total_lines: Total lines of code
    - languages: Breakdown by programming language
    - recent_files: Recently modified files
    - directory_tree: Simplified file tree
    - backend_build: Backend build status
    - frontend_build: Frontend build status
    - infrastructure_status: Infrastructure status
    - is_executable: Whether solution is ready to run
    """
    try:
        stats = solution_analyzer.get_stats()
        return stats
    except Exception as e:
        print(f"Error getting solution stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing solution: {str(e)}"
        )


@app.post("/api/bootstrap/resume")
async def resume_bootstrap(request: ResumeRequest) -> BootstrapStatus:
    """Resume bootstrap from a checkpoint"""
    return await bootstrap_controller.resume_from_checkpoint(request)


@app.get("/api/checkpoints")
async def list_checkpoints(session_id: Optional[str] = None, limit: int = 10) -> List[Checkpoint]:
    """List checkpoints for a session (or all sessions)"""
    return bootstrap_controller.get_checkpoints(session_id=session_id, limit=limit)


@app.get("/api/checkpoints/last")
async def get_last_checkpoint_endpoint(session_id: Optional[str] = None):
    """Get the most recent checkpoint"""
    checkpoint = bootstrap_controller.get_last_checkpoint(session_id=session_id)
    if not checkpoint:
        return JSONResponse(
            status_code=404,
            content={"detail": "No checkpoints found"}
        )
    return checkpoint


@app.post("/api/checkpoints")
async def create_checkpoint(request: CreateCheckpointRequest) -> Checkpoint:
    """Manually create a checkpoint"""
    return bootstrap_controller.save_checkpoint(
        session_id=request.session_id,
        checkpoint_name=request.checkpoint_name,
        squad_completed=request.squad_completed,
        squads_completed_list=request.squads_completed_list,
        overall_progress=request.overall_progress
    )


@app.get("/api/journal")
async def get_project_journal(limit: int = 100):
    """
    Get project journal entries (chronological log of important events)

    Events include:
    - Project start/stop
    - Milestone completions
    - Card state transitions
    - Agent activity
    - Blockers and escalations
    - QA approvals/rejections
    - Deployment events
    """
    try:
        # Get events from database
        events = db.get_recent_events(limit=limit)

        # Transform events into journal entries
        journal_entries = []

        for event in events:
            entry = transform_event_to_journal(event)
            if entry:
                journal_entries.append(entry)

        return journal_entries

    except Exception as e:
        print(f"Error fetching journal: {e}")
        return []


def transform_event_to_journal(event: dict) -> dict:
    """Transform database event into journal entry format"""
    event_type = event.get("type", "")

    # Project events
    if event_type == "bootstrap_started":
        return {
            "id": event.get("id"),
            "timestamp": event.get("timestamp"),
            "category": "project",
            "event_type": "project_started",
            "title": "🚀 Projeto Iniciado",
            "description": f"SuperCore v2.0 - Sessão {event.get('squad', 'N/A')}",
            "metadata": {},
            "tags": ["project", "start"]
        }

    # Milestone events (derived from progress)
    if event_type == "squad_status_update":
        # Check if milestone was completed
        message = event.get("message", "")
        if "milestone" in message.lower():
            return {
                "id": event.get("id"),
                "timestamp": event.get("timestamp"),
                "category": "milestone",
                "event_type": "milestone_progress",
                "title": "🎯 Progresso em Milestone",
                "description": message,
                "metadata": {"squad": event.get("squad")},
                "tags": ["milestone", event.get("squad", "")]
            }

    # Card events
    if event_type == "card_status_change":
        card_id = event.get("card", "N/A")
        status = event.get("message", "").split(" ")[-1]  # Extract status from message

        return {
            "id": event.get("id"),
            "timestamp": event.get("timestamp"),
            "category": "card",
            "event_type": f"card_{status.lower()}",
            "title": f"📋 Card {card_id}",
            "description": event.get("message", ""),
            "metadata": {
                "card_id": card_id,
                "squad": event.get("squad"),
                "status": status
            },
            "tags": ["card", event.get("squad", ""), status.lower()]
        }

    # Agent activity
    if "agent" in event_type.lower():
        return {
            "id": event.get("id"),
            "timestamp": event.get("timestamp"),
            "category": "agent",
            "event_type": event_type,
            "title": "🤖 Atividade de Agente",
            "description": event.get("message", ""),
            "metadata": {"squad": event.get("squad")},
            "tags": ["agent", event.get("squad", "")]
        }

    # Generic events
    return {
        "id": event.get("id"),
        "timestamp": event.get("timestamp"),
        "category": "project",
        "event_type": event_type,
        "title": event_type.replace("_", " ").title(),
        "description": event.get("message", ""),
        "metadata": {},
        "tags": [event.get("squad", "")]
    }


@app.post("/api/config/upload")
async def upload_config(file: UploadFile = File(...)):
    """Upload configuration file"""
    # Save uploaded file
    config_path = DATA_DIR / f"uploaded_{file.filename}"

    with open(config_path, 'wb') as f:
        content = await file.read()
        f.write(content)

    # Validate JSON
    try:
        with open(config_path) as f:
            config_data = json.load(f)

        return {
            "status": "success",
            "file_path": str(config_path),
            "project_name": config_data.get("project", {}).get("name", "Unknown")
        }
    except json.JSONDecodeError as e:
        config_path.unlink()  # Delete invalid file
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check Redis connection
    redis_status = "not_available"
    if REDIS_AVAILABLE and redis_client:
        try:
            redis_client.ping()
            redis_status = "connected"
        except:
            redis_status = "error"

    # Check Celery
    celery_status = "not_available"
    if CELERY_AVAILABLE and celery_app:
        try:
            # Check if Celery workers are running
            inspect = celery_app.control.inspect()
            active_workers = inspect.active()
            if active_workers:
                celery_status = "connected"
                worker_count = len(active_workers)
            else:
                celery_status = "no_workers"
                worker_count = 0
        except:
            celery_status = "error"
            worker_count = 0
    else:
        worker_count = 0

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "database": "connected" if DB_PATH.exists() else "not_found",
        "active_websockets": len(ws_manager.active_connections),
        "bootstrap_status": bootstrap_controller.get_status().status,
        "redis": redis_status,
        "celery": celery_status,
        "celery_workers": worker_count if celery_status == "connected" else 0,
        "execution_mode": "celery" if CELERY_AVAILABLE else "subprocess"
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import sys

    port = 3000
    if len(sys.argv) > 1 and sys.argv[1] == "--port":
        port = int(sys.argv[2])

    # Check Celery/Redis availability
    celery_mode = "✅ Celery + Redis" if CELERY_AVAILABLE and REDIS_AVAILABLE else "⚠️  Subprocess mode"

    print(f"""
╔════════════════════════════════════════════════════════════════╗
║  SuperCore v2.0 - Monitoring Server                            ║
║  FastAPI + WebSocket + SSE + Celery                            ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server starting on http://localhost:{port}
📊 API Documentation: http://localhost:{port}/docs

🔌 WebSockets:
   - General: ws://localhost:{port}/ws
   - Tasks (Celery): ws://localhost:{port}/ws/tasks

📡 SSE Stream: http://localhost:{port}/api/stream

🆕 Enhanced Endpoints (Celery):
   - GET  /api/cards/enhanced - Cards with task progress
   - GET  /api/tasks/{{card_id}}/logs - Real-time logs
   - POST /api/tasks/{{card_id}}/retry - Retry failed tasks

🔧 Execution Mode: {celery_mode}
💾 Database: {DB_PATH}
📁 State: {STATE_DIR}
📝 Logs: {LOGS_DIR}
""")

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )

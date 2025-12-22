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


# ============================================================================
# Configuration
# ============================================================================

BASE_DIR = Path(__file__).parent.parent.parent
STATE_DIR = BASE_DIR / "state"
LOGS_DIR = BASE_DIR / "logs"
DATA_DIR = BASE_DIR / "monitoring" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "monitoring.db"
CONFIG_PATH = BASE_DIR / "monitoring" / "config" / "monitoring-config.json"
META_CONFIG_PATH = BASE_DIR / "meta-squad-config.json"


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


# ============================================================================
# Database Manager
# ============================================================================

class MonitoringDB:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize SQLite database with schema"""
        conn = sqlite3.connect(self.db_path)
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

        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_squad ON events(squad)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON checkpoints(session_id, timestamp DESC)")

        conn.commit()
        conn.close()

    def execute(self, query: str, params: tuple = ()) -> List[Dict]:
        """Execute query and return results as list of dicts"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = [dict(row) for row in cursor.fetchall()]
        conn.commit()
        conn.close()
        return results

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
            metadata = json.loads(row.get("metadata", "{}"))
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
        self.orchestrator_script = base_dir / "claude-squad-orchestrator.py"
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
        """Start bootstrap process"""
        # Check if already running
        current_status = self.get_status()
        if current_status.status in ["running", "starting"]:
            raise HTTPException(status_code=400, detail="Bootstrap already running")

        # Generate session ID
        session_id = f"session_{int(time.time())}"
        self.current_session_id = session_id

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

        # Start Claude Squad Orchestrator
        try:
            # Use Python orchestrator instead of shell script
            cmd = [
                "python3",
                str(self.orchestrator_script),
                "--config", str(config_file),
                "--phase", "1"
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

    def stop_bootstrap(self) -> BootstrapStatus:
        """Stop running bootstrap"""
        current_status = self.get_status()

        if current_status.status != "running":
            raise HTTPException(status_code=400, detail="No bootstrap running")

        if current_status.pid:
            try:
                # Kill process group
                os.killpg(os.getpgid(current_status.pid), signal.SIGTERM)
            except ProcessLookupError:
                pass  # Already terminated

        stopped_status = BootstrapStatus(
            status="idle",
            session_id=current_status.session_id
        )
        self.save_status(stopped_status)

        return stopped_status

    def save_checkpoint(self, session_id: str, checkpoint_name: str, squad_completed: str, squads_completed_list: List[str], overall_progress: float) -> Checkpoint:
        """Save a checkpoint for recovery"""
        checkpoint_id = f"checkpoint_{int(time.time() * 1000)}"
        timestamp = datetime.now().isoformat()

        # Get artifacts path
        artifacts_path = str(BASE_DIR / "artefactos_implementacao")

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


# Global instances
db = MonitoringDB(DB_PATH)
collector = DataCollector(db)
ws_manager = ConnectionManager()
bootstrap_controller = BootstrapController(BASE_DIR)
bootstrap_controller.db = db  # Connect db to bootstrap controller
milestone_manager = MilestoneManager(META_CONFIG_PATH)


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

    # Get session info
    session_query = "SELECT * FROM sessions WHERE session_id = ?"
    session_data = db.execute_one(session_query, (session_id,))

    if not session_data:
        raise HTTPException(status_code=404, detail="No active session")

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


@app.get("/api/cards")
async def get_cards(status: Optional[str] = None, squad: Optional[str] = None) -> List[CardStatus]:
    """Get all cards with optional filters"""
    cards = collector.collect_card_status()

    if status:
        cards = [c for c in cards if c.status == status]

    if squad:
        cards = [c for c in cards if c.squad == squad]

    return cards


@app.get("/api/cards/{card_id}")
async def get_card(card_id: str) -> CardStatus:
    """Get specific card status"""
    cards = collector.collect_card_status()
    card = next((c for c in cards if c.card_id == card_id), None)

    if not card:
        raise HTTPException(status_code=404, detail=f"Card {card_id} not found")

    return card


@app.get("/api/metrics")
async def get_metrics() -> Metrics:
    """Get current metrics"""
    return collector.calculate_metrics()


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
        metadata = json.loads(row.get("metadata", "{}"))
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
    return await bootstrap_controller.start_bootstrap(request)


@app.post("/api/bootstrap/stop")
async def stop_bootstrap() -> BootstrapStatus:
    """Stop running bootstrap"""
    return bootstrap_controller.stop_bootstrap()


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
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "database": "connected" if DB_PATH.exists() else "not_found",
        "active_websockets": len(ws_manager.active_connections),
        "bootstrap_status": bootstrap_controller.get_status().status
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import sys

    port = 3000
    if len(sys.argv) > 1 and sys.argv[1] == "--port":
        port = int(sys.argv[2])

    print(f"""
╔════════════════════════════════════════════════════════════════╗
║  SuperCore v2.0 - Monitoring Server                            ║
║  FastAPI + WebSocket + SSE                                     ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server starting on http://localhost:{port}
📊 API Documentation: http://localhost:{port}/docs
🔌 WebSocket: ws://localhost:{port}/ws
📡 SSE Stream: http://localhost:{port}/api/stream

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

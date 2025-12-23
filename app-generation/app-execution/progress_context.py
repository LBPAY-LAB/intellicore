"""
Progress Context Tracking for Squad Orchestrator

This module provides rich context tracking for card execution progress,
enabling detailed monitoring of milestones, deliverables, sub-tasks, and files.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SubTaskStatus(str, Enum):
    """Status for individual sub-tasks"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    FAILED = "failed"


@dataclass
class SubTask:
    """Individual sub-task within a deliverable"""
    name: str
    status: SubTaskStatus = SubTaskStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None

    def start(self):
        """Mark sub-task as in progress"""
        self.status = SubTaskStatus.IN_PROGRESS
        self.started_at = datetime.now()

    def complete(self):
        """Mark sub-task as completed"""
        self.status = SubTaskStatus.COMPLETED
        self.completed_at = datetime.now()
        if self.started_at:
            self.duration_seconds = (self.completed_at - self.started_at).total_seconds()

    def block(self):
        """Mark sub-task as blocked"""
        self.status = SubTaskStatus.BLOCKED

    def fail(self):
        """Mark sub-task as failed"""
        self.status = SubTaskStatus.FAILED
        self.completed_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "name": self.name,
            "status": self.status.value,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds
        }


@dataclass
class Deliverable:
    """
    A deliverable within a milestone (e.g., "Database schemas", "API endpoints")
    """
    name: str
    description: str
    output_path: str  # Where artifact will be created
    sub_tasks: List[SubTask] = field(default_factory=list)
    status: SubTaskStatus = SubTaskStatus.PENDING
    files_modified: List[str] = field(default_factory=list)

    @property
    def progress_percentage(self) -> int:
        """Calculate progress based on completed sub-tasks"""
        if not self.sub_tasks:
            return 100 if self.status == SubTaskStatus.COMPLETED else 0

        completed = sum(1 for st in self.sub_tasks if st.status == SubTaskStatus.COMPLETED)
        return int((completed / len(self.sub_tasks)) * 100)

    @property
    def completed_sub_tasks(self) -> int:
        """Count completed sub-tasks"""
        return sum(1 for st in self.sub_tasks if st.status == SubTaskStatus.COMPLETED)

    @property
    def total_sub_tasks(self) -> int:
        """Total number of sub-tasks"""
        return len(self.sub_tasks)

    def add_file_modified(self, file_path: str):
        """Track a file modified for this deliverable"""
        if file_path not in self.files_modified:
            self.files_modified.append(file_path)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "name": self.name,
            "description": self.description,
            "output_path": self.output_path,
            "status": self.status.value,
            "progress_percentage": self.progress_percentage,
            "completed_sub_tasks": self.completed_sub_tasks,
            "total_sub_tasks": self.total_sub_tasks,
            "sub_tasks": [st.to_dict() for st in self.sub_tasks],
            "files_modified": self.files_modified
        }


@dataclass
class MilestoneContext:
    """
    Context for a milestone phase (e.g., "Architecture & Design", "Backend Implementation")
    """
    phase: int  # 1-7
    name: str
    progress_range: tuple[int, int]  # e.g., (15, 25) for 15-25%
    squads: List[str]
    deliverables: List[Deliverable] = field(default_factory=list)
    current_deliverable_index: int = 0

    @property
    def min_progress(self) -> int:
        """Minimum progress percentage for this milestone"""
        return self.progress_range[0]

    @property
    def max_progress(self) -> int:
        """Maximum progress percentage for this milestone"""
        return self.progress_range[1]

    @property
    def progress_span(self) -> int:
        """Span of progress percentage for this milestone"""
        return self.max_progress - self.min_progress

    @property
    def current_deliverable(self) -> Optional[Deliverable]:
        """Get current deliverable being worked on"""
        if 0 <= self.current_deliverable_index < len(self.deliverables):
            return self.deliverables[self.current_deliverable_index]
        return None

    @property
    def completed_deliverables(self) -> int:
        """Count completed deliverables"""
        return sum(1 for d in self.deliverables if d.status == SubTaskStatus.COMPLETED)

    @property
    def total_deliverables(self) -> int:
        """Total number of deliverables"""
        return len(self.deliverables)

    def calculate_progress_percentage(self) -> int:
        """
        Calculate current progress percentage within milestone range
        based on deliverable completion
        """
        if not self.deliverables:
            return self.min_progress

        # Calculate progress based on deliverables
        deliverable_progress = self.completed_deliverables / self.total_deliverables

        # If we have a current deliverable in progress, factor in its sub-task progress
        if self.current_deliverable and self.current_deliverable.status == SubTaskStatus.IN_PROGRESS:
            current_deliv_fraction = self.current_deliverable.progress_percentage / 100.0
            deliverable_progress = (self.completed_deliverables + current_deliv_fraction) / self.total_deliverables

        # Map to milestone's progress range
        progress_in_span = int(deliverable_progress * self.progress_span)
        return self.min_progress + progress_in_span

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "phase": self.phase,
            "name": self.name,
            "progress_range": list(self.progress_range),
            "squads": self.squads,
            "current_deliverable_index": self.current_deliverable_index,
            "completed_deliverables": self.completed_deliverables,
            "total_deliverables": self.total_deliverables,
            "current_progress_percentage": self.calculate_progress_percentage(),
            "deliverables": [d.to_dict() for d in self.deliverables],
            "current_deliverable": self.current_deliverable.to_dict() if self.current_deliverable else None
        }


@dataclass
class ProgressContext:
    """
    Complete progress context for a card execution

    This tracks everything needed to provide detailed progress monitoring:
    - Milestone phase (1-7)
    - Current deliverable and sub-tasks
    - Files modified
    - Dependencies blocked
    - Time tracking and ETA
    """
    card_id: str
    squad: str
    agent: str
    milestone: MilestoneContext
    current_step: str
    files_modified: List[str] = field(default_factory=list)
    dependencies_waiting: List[str] = field(default_factory=list)
    elapsed_seconds: float = 0.0
    eta_seconds: Optional[float] = None
    started_at: Optional[datetime] = None

    def __post_init__(self):
        """Initialize started_at if not set"""
        if self.started_at is None:
            self.started_at = datetime.now()

    @property
    def current_deliverable(self) -> Optional[Deliverable]:
        """Get current deliverable from milestone"""
        return self.milestone.current_deliverable

    @property
    def current_sub_task(self) -> Optional[SubTask]:
        """Get current sub-task from current deliverable"""
        if self.current_deliverable:
            in_progress_tasks = [st for st in self.current_deliverable.sub_tasks if st.status == SubTaskStatus.IN_PROGRESS]
            if in_progress_tasks:
                return in_progress_tasks[0]
        return None

    @property
    def overall_progress_percentage(self) -> int:
        """Overall progress percentage for the entire card"""
        return self.milestone.calculate_progress_percentage()

    def add_file_modified(self, file_path: str):
        """Track a file modified during execution"""
        if file_path not in self.files_modified:
            self.files_modified.append(file_path)

        # Also add to current deliverable if exists
        if self.current_deliverable:
            self.current_deliverable.add_file_modified(file_path)

    def add_dependency_waiting(self, dependency: str):
        """Track a dependency that's blocking progress"""
        if dependency not in self.dependencies_waiting:
            self.dependencies_waiting.append(dependency)

    def remove_dependency_waiting(self, dependency: str):
        """Remove a dependency that's no longer blocking"""
        if dependency in self.dependencies_waiting:
            self.dependencies_waiting.remove(dependency)

    def update_elapsed(self):
        """Update elapsed time from started_at"""
        if self.started_at:
            self.elapsed_seconds = (datetime.now() - self.started_at).total_seconds()

    def estimate_eta(self) -> Optional[float]:
        """
        Estimate ETA based on current progress and elapsed time

        Returns estimated seconds remaining, or None if can't estimate
        """
        progress = self.overall_progress_percentage
        if progress == 0:
            return None

        self.update_elapsed()

        # Simple linear extrapolation: if we're at P% in E seconds,
        # estimate total time as E / (P/100), remaining = total - E
        total_estimated = self.elapsed_seconds / (progress / 100.0)
        remaining = total_estimated - self.elapsed_seconds

        self.eta_seconds = max(0, remaining)
        return self.eta_seconds

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        self.update_elapsed()
        eta = self.estimate_eta()

        return {
            "card_id": self.card_id,
            "squad": self.squad,
            "agent": self.agent,
            "current_step": self.current_step,
            "milestone": self.milestone.to_dict(),
            "files_modified": self.files_modified,
            "dependencies_waiting": self.dependencies_waiting,
            "elapsed_seconds": self.elapsed_seconds,
            "eta_seconds": eta,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "overall_progress_percentage": self.overall_progress_percentage,
            "current_deliverable": self.current_deliverable.to_dict() if self.current_deliverable else None,
            "current_sub_task": self.current_sub_task.to_dict() if self.current_sub_task else None
        }

    def get_detailed_status_message(self) -> str:
        """
        Generate a detailed human-readable status message

        Returns a formatted string suitable for display in UI or logs
        """
        lines = [
            f"[Squad: {self.squad.title()}]",
            f"[Agent: {self.agent}]",
            f"[Milestone {self.milestone.phase}/7: {self.milestone.name} ({self.milestone.min_progress}-{self.milestone.max_progress}%)]",
        ]

        if self.current_deliverable:
            lines.append(f"[Deliverable {self.milestone.current_deliverable_index + 1}/{self.milestone.total_deliverables}: {self.current_deliverable.name}]")

        lines.append("")
        lines.append(f"Progress: {self.overall_progress_percentage}%")
        lines.append(f"Current Step: \"{self.current_step}\"")

        if self.current_deliverable:
            lines.append(f"Sub-tasks: {self.current_deliverable.completed_sub_tasks}/{self.current_deliverable.total_sub_tasks} completed")

            # Show sub-task list with status emojis
            for st in self.current_deliverable.sub_tasks:
                emoji = {
                    SubTaskStatus.COMPLETED: "✅",
                    SubTaskStatus.IN_PROGRESS: "🔄",
                    SubTaskStatus.PENDING: "⏳",
                    SubTaskStatus.BLOCKED: "🚫",
                    SubTaskStatus.FAILED: "❌"
                }[st.status]
                lines.append(f"  {emoji} {st.name}")

        if self.files_modified:
            lines.append(f"Files Modified: {len(self.files_modified)} file(s)")
            for f in self.files_modified[-3:]:  # Show last 3
                lines.append(f"  - {f}")

        if self.dependencies_waiting:
            lines.append(f"⚠️  Blocked by: {', '.join(self.dependencies_waiting)}")

        lines.append(f"Elapsed: {int(self.elapsed_seconds)}s")
        if self.eta_seconds:
            lines.append(f"ETA: {int(self.eta_seconds)}s remaining")

        return "\n".join(lines)


def create_progress_context_for_card(card: Dict[str, Any], milestone_config: Dict[str, Any]) -> ProgressContext:
    """
    Factory function to create a ProgressContext for a card

    Args:
        card: Card dictionary from backlog
        milestone_config: Milestone configuration from meta-squad-config.json

    Returns:
        Initialized ProgressContext with milestone and deliverables
    """
    squad = card.get("squad", "unknown")

    # Create milestone context from config
    milestone = MilestoneContext(
        phase=milestone_config["phase"],
        name=milestone_config["name"],
        progress_range=(milestone_config["progress_range"][0], milestone_config["progress_range"][1]),
        squads=milestone_config["squads"]
    )

    # Add deliverables from config if present
    if "deliverables" in milestone_config:
        for deliv_config in milestone_config["deliverables"]:
            deliverable = Deliverable(
                name=deliv_config["name"],
                description=deliv_config.get("description", ""),
                output_path=deliv_config.get("output_path", f"artefactos_implementacao/{squad}/")
            )

            # Add sub-tasks if present
            if "sub_tasks" in deliv_config:
                for sub_task_name in deliv_config["sub_tasks"]:
                    deliverable.sub_tasks.append(SubTask(name=sub_task_name))

            milestone.deliverables.append(deliverable)

    # Create progress context
    context = ProgressContext(
        card_id=card["card_id"],
        squad=squad,
        agent=card.get("agent", "unknown"),
        milestone=milestone,
        current_step="Initializing..."
    )

    return context

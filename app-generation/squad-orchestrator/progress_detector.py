"""
Progress Detector - Intelligent Log Parsing for Squad Orchestrator

This module analyzes Claude agent stdout/stderr to automatically detect:
- Which milestone phase is active
- Which deliverable is being worked on
- Which sub-tasks are in progress/completed
- Which files are being modified
- Dependencies that are blocking progress

Pattern matching is based on common Claude agent behaviors.
"""

import re
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
from progress_context import ProgressContext, SubTaskStatus


class ProgressDetector:
    """
    Intelligent log parser that detects progress from Claude agent output

    Analyzes stdout/stderr lines to infer:
    - Tool usage (Read, Write, Edit, Bash, Grep, Glob)
    - File operations
    - Task transitions
    - Blocking issues
    """

    # Tool detection patterns
    TOOL_PATTERNS = {
        "read": re.compile(r"(?:Reading|Read file|Reading file|📖|Uses the Read tool).*?([/\w\-\.]+\.(md|py|ts|tsx|go|json|yaml|yml|txt))", re.IGNORECASE),
        "write": re.compile(r"(?:Writing|Write file|Creating file|📝|Uses the Write tool).*?([/\w\-\.]+\.(md|py|ts|tsx|go|json|yaml|yml|txt))", re.IGNORECASE),
        "edit": re.compile(r"(?:Editing|Edit file|Modifying|✏️|Uses the Edit tool).*?([/\w\-\.]+\.(md|py|ts|tsx|go|json|yaml|yml|txt))", re.IGNORECASE),
        "bash": re.compile(r"(?:Running command|Executing|🔧|Uses the Bash tool).*?`?([a-z\-]+)", re.IGNORECASE),
        "grep": re.compile(r"(?:Searching|Grep|🔍|Uses the Grep tool).*?['\"](.+?)['\"]", re.IGNORECASE),
        "glob": re.compile(r"(?:Finding files|Glob|📂|Uses the Glob tool).*?['\"](.+?)['\"]", re.IGNORECASE),
    }

    # Milestone/phase indicators
    PHASE_INDICATORS = {
        1: ["discovery", "planning", "requirements", "analyzing requirements", "reading documentation"],
        2: ["architecture", "design", "adr", "technical design", "designing"],
        3: ["database", "schema", "migration", "data model", "erd", "entity"],
        4: ["backend", "api", "endpoint", "service", "fastapi", "golang"],
        5: ["frontend", "ui", "component", "react", "nextjs"],
        6: ["test", "qa", "testing", "validation", "coverage"],
        7: ["deploy", "terraform", "ci/cd", "pipeline", "infrastructure"]
    }

    # Deliverable patterns (generic - will be enhanced with specific config)
    DELIVERABLE_PATTERNS = {
        "cards": re.compile(r"(?:creating|writing|drafting).*?(?:card|user story|backlog)", re.IGNORECASE),
        "wireframes": re.compile(r"(?:creating|designing).*?(?:wireframe|mockup|design)", re.IGNORECASE),
        "design": re.compile(r"(?:creating|writing).*?(?:design|adr|architecture)", re.IGNORECASE),
        "schema": re.compile(r"(?:creating|defining).*?(?:schema|erd|data model|migration)", re.IGNORECASE),
        "api": re.compile(r"(?:implementing|creating).*?(?:api|endpoint|route|handler)", re.IGNORECASE),
        "component": re.compile(r"(?:implementing|creating).*?(?:component|page|view)", re.IGNORECASE),
        "test": re.compile(r"(?:writing|creating).*?(?:test|spec|test case)", re.IGNORECASE),
        "terraform": re.compile(r"(?:creating|writing).*?(?:terraform|module|infrastructure)", re.IGNORECASE),
    }

    # Sub-task action patterns
    ACTION_PATTERNS = {
        "reading": re.compile(r"(?:reading|analyzing|reviewing|studying|examining)", re.IGNORECASE),
        "creating": re.compile(r"(?:creating|writing|drafting|implementing|building|developing)", re.IGNORECASE),
        "modifying": re.compile(r"(?:modifying|editing|updating|changing|refactoring)", re.IGNORECASE),
        "testing": re.compile(r"(?:testing|validating|verifying|checking|running tests)", re.IGNORECASE),
        "deploying": re.compile(r"(?:deploying|provisioning|applying|launching)", re.IGNORECASE),
    }

    # Blocking/error patterns
    BLOCKING_PATTERNS = {
        "file_not_found": re.compile(r"(?:file not found|no such file|cannot find|doesn't exist)", re.IGNORECASE),
        "dependency_missing": re.compile(r"(?:module not found|cannot import|dependency.*?missing)", re.IGNORECASE),
        "permission_denied": re.compile(r"(?:permission denied|access denied|forbidden)", re.IGNORECASE),
        "connection_error": re.compile(r"(?:connection.*?error|connection refused|timeout)", re.IGNORECASE),
        "syntax_error": re.compile(r"(?:syntax error|parse error|invalid syntax)", re.IGNORECASE),
    }

    # Completion indicators
    COMPLETION_PATTERNS = {
        "task_done": re.compile(r"✅.*?(?:completed|done|finished|success)", re.IGNORECASE),
        "card_completed": re.compile(r"✅ CARD COMPLETED", re.IGNORECASE),
        "deliverable_done": re.compile(r"(?:deliverable|artifact).*?(?:completed|created|ready)", re.IGNORECASE),
    }

    def __init__(self, context: ProgressContext):
        """
        Initialize progress detector with a progress context

        Args:
            context: ProgressContext to update based on log parsing
        """
        self.context = context

    def process_log_line(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Process a single log line and update progress context

        Args:
            line: Single line from stdout/stderr

        Returns:
            Dict with detected changes, or None if no progress detected
        """
        changes = {}

        # Detect tool usage and file operations
        file_modified = self._detect_file_operation(line)
        if file_modified:
            self.context.add_file_modified(file_modified)
            changes["file_modified"] = file_modified

        # Detect milestone/phase transitions
        phase_detected = self._detect_phase(line)
        if phase_detected:
            changes["phase_detected"] = phase_detected

        # Detect deliverable being worked on
        deliverable_detected = self._detect_deliverable(line)
        if deliverable_detected:
            changes["deliverable_detected"] = deliverable_detected

        # Detect sub-task actions
        action_detected = self._detect_action(line)
        if action_detected:
            self.context.current_step = action_detected
            changes["action_detected"] = action_detected

        # Detect blocking issues
        blocking_detected = self._detect_blocking(line)
        if blocking_detected:
            self.context.add_dependency_waiting(blocking_detected)
            changes["blocking_detected"] = blocking_detected

        # Detect completions
        completion_detected = self._detect_completion(line)
        if completion_detected:
            changes["completion_detected"] = completion_detected

        return changes if changes else None

    def _detect_file_operation(self, line: str) -> Optional[str]:
        """
        Detect file read/write/edit operations

        Returns:
            File path if detected, None otherwise
        """
        for tool_name, pattern in self.TOOL_PATTERNS.items():
            match = pattern.search(line)
            if match:
                if tool_name in ["read", "write", "edit"]:
                    file_path = match.group(1)
                    # Normalize path
                    if not file_path.startswith("/"):
                        file_path = f"/{file_path}"
                    return file_path

        # Fallback: detect file paths in generic format
        file_path_pattern = re.compile(r"([/\w\-\.]+/[/\w\-\.]+\.(md|py|ts|tsx|go|json|yaml|yml|txt|sh))")
        match = file_path_pattern.search(line)
        if match:
            return match.group(1)

        return None

    def _detect_phase(self, line: str) -> Optional[int]:
        """
        Detect which milestone phase is active based on keywords

        Returns:
            Phase number (1-7) if detected, None otherwise
        """
        line_lower = line.lower()

        for phase, keywords in self.PHASE_INDICATORS.items():
            if any(keyword in line_lower for keyword in keywords):
                return phase

        return None

    def _detect_deliverable(self, line: str) -> Optional[str]:
        """
        Detect which deliverable is being worked on

        Returns:
            Deliverable name if detected, None otherwise
        """
        for deliv_name, pattern in self.DELIVERABLE_PATTERNS.items():
            if pattern.search(line):
                return deliv_name

        return None

    def _detect_action(self, line: str) -> Optional[str]:
        """
        Detect what action/sub-task is being performed

        Returns:
            Action description if detected, None otherwise
        """
        for action_name, pattern in self.ACTION_PATTERNS.items():
            match = pattern.search(line)
            if match:
                # Extract context around the action
                context_match = re.search(rf"{pattern.pattern}\s+(.{{0,80}})", line, re.IGNORECASE)
                if context_match:
                    return f"{action_name.title()}: {context_match.group(0).strip()}"
                return f"{action_name.title()} in progress"

        return None

    def _detect_blocking(self, line: str) -> Optional[str]:
        """
        Detect blocking issues or errors

        Returns:
            Blocking issue description if detected, None otherwise
        """
        for block_type, pattern in self.BLOCKING_PATTERNS.items():
            match = pattern.search(line)
            if match:
                # Extract full error message
                error_context = line.strip()[:200]  # Limit to 200 chars
                return f"{block_type.replace('_', ' ').title()}: {error_context}"

        return None

    def _detect_completion(self, line: str) -> Optional[str]:
        """
        Detect task/deliverable/card completion

        Returns:
            Completion type if detected, None otherwise
        """
        for completion_type, pattern in self.COMPLETION_PATTERNS.items():
            if pattern.search(line):
                return completion_type

        return None

    def infer_progress_from_context(self) -> int:
        """
        Infer overall progress percentage based on context state

        This is called periodically to estimate progress when no explicit
        progress updates are available.

        Returns:
            Estimated progress percentage (0-100)
        """
        # Base progress from milestone
        base_progress = self.context.milestone.calculate_progress_percentage()

        # Adjust based on files modified (indicates work is being done)
        if self.context.files_modified:
            # Each file modified adds a small boost (up to 5%)
            file_boost = min(5, len(self.context.files_modified) * 0.5)
            base_progress = min(100, base_progress + int(file_boost))

        # Penalize if blocked
        if self.context.dependencies_waiting:
            # Reduce progress by 5% if blocked (but don't go below milestone min)
            base_progress = max(self.context.milestone.min_progress, base_progress - 5)

        return base_progress

    def update_sub_task_from_action(self, action: str):
        """
        Update current sub-task status based on detected action

        Args:
            action: Detected action string
        """
        if not self.context.current_deliverable:
            return

        # Find or create sub-task matching the action
        action_lower = action.lower()

        for sub_task in self.context.current_deliverable.sub_tasks:
            sub_task_lower = sub_task.name.lower()

            # Check if action matches sub-task
            if any(keyword in sub_task_lower for keyword in action_lower.split()):
                if sub_task.status == SubTaskStatus.PENDING:
                    sub_task.start()
                elif sub_task.status == SubTaskStatus.IN_PROGRESS and "completed" in action_lower:
                    sub_task.complete()
                break

    def auto_advance_milestone(self):
        """
        Automatically advance to next milestone if current one is completed

        This is called when we detect that all deliverables in the current
        milestone are completed.
        """
        if self.context.milestone.completed_deliverables >= self.context.milestone.total_deliverables:
            # All deliverables done - would need to load next milestone from config
            # For now, just mark as 100% of current milestone
            pass


def create_progress_detector(context: ProgressContext) -> ProgressDetector:
    """
    Factory function to create a ProgressDetector for a progress context

    Args:
        context: ProgressContext to track

    Returns:
        Initialized ProgressDetector
    """
    return ProgressDetector(context)


# Example usage patterns for integration
def example_usage():
    """
    Example of how to use ProgressDetector in tasks.py
    """
    from progress_context import ProgressContext, MilestoneContext, Deliverable, SubTask

    # Create mock context
    milestone = MilestoneContext(
        phase=2,
        name="Architecture & Design",
        progress_range=(15, 25),
        squads=["arquitetura"]
    )

    deliverable = Deliverable(
        name="Database schemas",
        description="PostgreSQL schemas for Oráculo and Objects",
        output_path="artefactos_implementacao/arquitetura/schemas/"
    )
    deliverable.sub_tasks = [
        SubTask(name="Analyze requirements"),
        SubTask(name="Create ERD diagram"),
        SubTask(name="Write migration SQL"),
        SubTask(name="Validate with Tech Lead")
    ]
    milestone.deliverables = [deliverable]

    context = ProgressContext(
        card_id="ARQ-001",
        squad="arquitetura",
        agent="tech-lead",
        milestone=milestone,
        current_step="Initializing..."
    )

    # Create detector
    detector = create_progress_detector(context)

    # Simulate log lines
    log_lines = [
        "📖 Reading file: Supercore_v2.0/DOCUMENTACAO_BASE/requisitos_funcionais_v2.0.md",
        "Analyzing requirements for Oráculo entity...",
        "📝 Creating ERD diagram: artefactos_implementacao/arquitetura/schemas/oraculo_erd.mermaid",
        "✅ ERD diagram completed!",
        "Writing migration SQL...",
    ]

    for line in log_lines:
        changes = detector.process_log_line(line)
        if changes:
            print(f"Detected changes: {changes}")
            print(f"Context progress: {context.overall_progress_percentage}%")
            print(f"Current step: {context.current_step}")
            print(f"Files modified: {context.files_modified}")
            print("---")

    # Get detailed status
    print(context.get_detailed_status_message())


if __name__ == "__main__":
    example_usage()

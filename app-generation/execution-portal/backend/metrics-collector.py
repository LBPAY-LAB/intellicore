#!/usr/bin/env python3
"""
SuperCore v2.0 - Metrics Collector
Collects and stores time-series metrics for analytics
"""

import json
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))


BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "monitoring" / "data"
DB_PATH = DATA_DIR / "monitoring.db"
METRICS_FILE = DATA_DIR / "metrics_history.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)


class MetricsCollector:
    """Collects and stores metrics over time"""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row

    def collect_metrics(self, session_id: str) -> Dict[str, Any]:
        """Collect current metrics snapshot"""
        timestamp = datetime.now().isoformat()

        metrics = {
            "timestamp": timestamp,
            "session_id": session_id,
            "velocity": self._calculate_velocity(session_id),
            "qa_rejection_rate": self._calculate_qa_rejection_rate(session_id),
            "test_coverage": self._calculate_average_coverage(session_id),
            "cards_by_status": self._count_cards_by_status(session_id),
            "squad_health": self._calculate_squad_health(session_id),
            "active_squads": self._count_active_squads(session_id),
            "cards_completed_today": self._count_cards_completed_today(session_id),
            "total_events": self._count_total_events(session_id),
            "average_qa_cycles": self._calculate_average_qa_cycles(session_id),
            "cards_blocked": self._count_blocked_cards(session_id),
        }

        return metrics

    def _calculate_velocity(self, session_id: str) -> float:
        """Calculate velocity (cards per day)"""
        cursor = self.conn.cursor()

        # Get session start time
        cursor.execute(
            "SELECT started_at FROM sessions WHERE session_id = ?", (session_id,)
        )
        row = cursor.fetchone()
        if not row:
            return 0.0

        started_at = datetime.fromisoformat(row["started_at"])
        days_elapsed = max((datetime.now() - started_at).days, 1)

        # Count completed cards
        cursor.execute(
            "SELECT COUNT(*) as count FROM cards WHERE status = 'done' AND session_id = ?",
            (session_id,),
        )
        cards_done = cursor.fetchone()["count"]

        return cards_done / days_elapsed

    def _calculate_qa_rejection_rate(self, session_id: str) -> float:
        """Calculate QA rejection rate"""
        cursor = self.conn.cursor()

        # Cards with QA cycles > 0
        cursor.execute(
            "SELECT COUNT(*) as count FROM cards WHERE qa_cycles > 0 AND session_id = ?",
            (session_id,),
        )
        rejected_count = cursor.fetchone()["count"]

        # Total cards
        cursor.execute(
            "SELECT COUNT(*) as count FROM cards WHERE session_id = ?", (session_id,)
        )
        total_cards = cursor.fetchone()["count"]

        if total_cards == 0:
            return 0.0

        return (rejected_count / total_cards) * 100

    def _calculate_average_coverage(self, session_id: str) -> float:
        """Calculate average test coverage"""
        cursor = self.conn.cursor()

        cursor.execute(
            """
            SELECT AVG(test_coverage) as avg_coverage FROM cards
            WHERE test_coverage IS NOT NULL AND session_id = ?
        """,
            (session_id,),
        )

        result = cursor.fetchone()["avg_coverage"]
        return result if result else 0.0

    def _count_cards_by_status(self, session_id: str) -> Dict[str, int]:
        """Count cards grouped by status"""
        cursor = self.conn.cursor()

        cursor.execute(
            """
            SELECT status, COUNT(*) as count FROM cards
            WHERE session_id = ?
            GROUP BY status
        """,
            (session_id,),
        )

        return {row["status"]: row["count"] for row in cursor.fetchall()}

    def _calculate_squad_health(self, session_id: str) -> Dict[str, str]:
        """Get health status for each squad"""
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT squad_id, health FROM squads WHERE session_id = ?", (session_id,)
        )

        return {row["squad_id"]: row["health"] for row in cursor.fetchall()}

    def _count_active_squads(self, session_id: str) -> int:
        """Count squads with status = running"""
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) as count FROM squads WHERE status = 'running' AND session_id = ?",
            (session_id,),
        )

        return cursor.fetchone()["count"]

    def _count_cards_completed_today(self, session_id: str) -> int:
        """Count cards completed today"""
        cursor = self.conn.cursor()

        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        cursor.execute(
            """
            SELECT COUNT(*) as count FROM cards
            WHERE status = 'done' AND completed_at >= ? AND session_id = ?
        """,
            (today_start.isoformat(), session_id),
        )

        return cursor.fetchone()["count"]

    def _count_total_events(self, session_id: str) -> int:
        """Count total events"""
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) as count FROM events WHERE session_id = ?", (session_id,)
        )

        return cursor.fetchone()["count"]

    def _calculate_average_qa_cycles(self, session_id: str) -> float:
        """Calculate average QA cycles per card"""
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT AVG(qa_cycles) as avg_cycles FROM cards WHERE session_id = ?",
            (session_id,),
        )

        result = cursor.fetchone()["avg_cycles"]
        return result if result else 0.0

    def _count_blocked_cards(self, session_id: str) -> int:
        """Count currently blocked cards"""
        cursor = self.conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) as count FROM cards WHERE status = 'blocked' AND session_id = ?",
            (session_id,),
        )

        return cursor.fetchone()["count"]

    def store_metrics(self, metrics: Dict[str, Any]):
        """Store metrics in database"""
        cursor = self.conn.cursor()

        # Store individual metrics
        for metric_name, metric_value in metrics.items():
            if metric_name in ["timestamp", "session_id", "cards_by_status", "squad_health"]:
                continue

            if isinstance(metric_value, (int, float)):
                cursor.execute(
                    """
                    INSERT INTO metrics (timestamp, metric_name, metric_value, session_id, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """,
                    (
                        metrics["timestamp"],
                        metric_name,
                        float(metric_value),
                        metrics["session_id"],
                        json.dumps({}),
                    ),
                )

        # Store complex metrics as JSON
        if "cards_by_status" in metrics:
            cursor.execute(
                """
                INSERT INTO metrics (timestamp, metric_name, metric_value, session_id, metadata)
                VALUES (?, ?, ?, ?, ?)
            """,
                (
                    metrics["timestamp"],
                    "cards_by_status",
                    0.0,
                    metrics["session_id"],
                    json.dumps(metrics["cards_by_status"]),
                ),
            )

        if "squad_health" in metrics:
            cursor.execute(
                """
                INSERT INTO metrics (timestamp, metric_name, metric_value, session_id, metadata)
                VALUES (?, ?, ?, ?, ?)
            """,
                (
                    metrics["timestamp"],
                    "squad_health",
                    0.0,
                    metrics["session_id"],
                    json.dumps(metrics["squad_health"]),
                ),
            )

        self.conn.commit()

    def get_metrics_history(
        self, session_id: str, metric_name: str, hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get historical metrics"""
        cursor = self.conn.cursor()

        since = datetime.now() - timedelta(hours=hours)

        cursor.execute(
            """
            SELECT timestamp, metric_value, metadata FROM metrics
            WHERE session_id = ? AND metric_name = ? AND timestamp >= ?
            ORDER BY timestamp ASC
        """,
            (session_id, metric_name, since.isoformat()),
        )

        results = []
        for row in cursor.fetchall():
            results.append(
                {
                    "timestamp": row["timestamp"],
                    "value": row["metric_value"],
                    "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
                }
            )

        return results

    def generate_report(self, session_id: str) -> Dict[str, Any]:
        """Generate comprehensive metrics report"""
        metrics = self.collect_metrics(session_id)

        # Get trends (24h)
        velocity_trend = self.get_metrics_history(session_id, "velocity", hours=24)
        coverage_trend = self.get_metrics_history(session_id, "test_coverage", hours=24)

        report = {
            "generated_at": datetime.now().isoformat(),
            "session_id": session_id,
            "current_metrics": metrics,
            "trends": {
                "velocity_24h": velocity_trend,
                "coverage_24h": coverage_trend,
            },
            "summary": {
                "total_cards": sum(metrics.get("cards_by_status", {}).values()),
                "completion_rate": self._calculate_completion_rate(metrics),
                "quality_score": self._calculate_quality_score(metrics),
                "health_status": self._overall_health_status(metrics),
            },
        }

        return report

    def _calculate_completion_rate(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall completion rate"""
        cards_by_status = metrics.get("cards_by_status", {})
        total = sum(cards_by_status.values())
        done = cards_by_status.get("done", 0)

        if total == 0:
            return 0.0

        return (done / total) * 100

    def _calculate_quality_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate quality score (0-100)"""
        # Factors: test coverage, QA rejection rate, blocked cards
        coverage = metrics.get("test_coverage", 0)
        qa_rejection = metrics.get("qa_rejection_rate", 0)
        cards_blocked = metrics.get("cards_blocked", 0)
        total_cards = sum(metrics.get("cards_by_status", {}).values())

        # Coverage score (0-40 points)
        coverage_score = (coverage / 100) * 40

        # QA score (0-40 points, inverted)
        qa_score = max(0, 40 - (qa_rejection * 2))

        # Blocked cards score (0-20 points, inverted)
        if total_cards > 0:
            blocked_rate = (cards_blocked / total_cards) * 100
            blocked_score = max(0, 20 - blocked_rate)
        else:
            blocked_score = 20

        return coverage_score + qa_score + blocked_score

    def _overall_health_status(self, metrics: Dict[str, Any]) -> str:
        """Determine overall health status"""
        squad_health = metrics.get("squad_health", {})

        if not squad_health:
            return "unknown"

        error_count = sum(1 for h in squad_health.values() if h == "error")
        degraded_count = sum(1 for h in squad_health.values() if h == "degraded")

        if error_count > 0:
            return "error"
        elif degraded_count > 0:
            return "degraded"
        else:
            return "healthy"

    def close(self):
        """Close database connection"""
        self.conn.close()


def collect_and_store(session_id: str):
    """Collect metrics and store in database"""
    collector = MetricsCollector(DB_PATH)

    try:
        metrics = collector.collect_metrics(session_id)
        collector.store_metrics(metrics)

        print(f"[{datetime.now().isoformat()}] Metrics collected and stored")
        print(f"  Velocity: {metrics['velocity']:.2f} cards/day")
        print(f"  QA Rejection: {metrics['qa_rejection_rate']:.1f}%")
        print(f"  Coverage: {metrics['test_coverage']:.0f}%")
        print(f"  Active Squads: {metrics['active_squads']}")

        return metrics
    finally:
        collector.close()


def generate_report_cli(session_id: str, output_file: str = None):
    """Generate and optionally save report"""
    collector = MetricsCollector(DB_PATH)

    try:
        report = collector.generate_report(session_id)

        report_json = json.dumps(report, indent=2)

        if output_file:
            with open(output_file, "w") as f:
                f.write(report_json)
            print(f"Report saved to: {output_file}")
        else:
            print(report_json)

        return report
    finally:
        collector.close()


def watch_and_collect(session_id: str, interval: int = 60):
    """Continuously collect metrics at interval"""
    print(f"Starting metrics collection for session: {session_id}")
    print(f"Collection interval: {interval} seconds")
    print("Press Ctrl+C to stop\n")

    try:
        while True:
            collect_and_store(session_id)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopping metrics collection")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="SuperCore v2.0 - Metrics Collector")
    parser.add_argument(
        "command", choices=["collect", "report", "watch"], help="Command to execute"
    )
    parser.add_argument("--session", "-s", help="Session ID", required=True)
    parser.add_argument(
        "--interval", "-i", type=int, default=60, help="Collection interval (seconds)"
    )
    parser.add_argument("--output", "-o", help="Output file for report")

    args = parser.parse_args()

    if args.command == "collect":
        collect_and_store(args.session)
    elif args.command == "report":
        generate_report_cli(args.session, args.output)
    elif args.command == "watch":
        watch_and_collect(args.session, args.interval)

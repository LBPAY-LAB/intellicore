#!/usr/bin/env python3
"""
Sync backlog_master.json to portal database
Runs continuously to keep portal updated with real-time progress
"""

import json
import sqlite3
import time
from pathlib import Path
from datetime import datetime

SCRIPT_DIR = Path(__file__).parent
STATE_DIR = SCRIPT_DIR / "state"
BACKLOG_FILE = STATE_DIR / "backlog_master.json"
DB_PATH = SCRIPT_DIR / "monitoring" / "data" / "monitoring.db"

def sync_backlog_to_db():
    """Sync backlog JSON to SQLite database"""
    if not BACKLOG_FILE.exists():
        print("⚠️  No backlog file found")
        return

    # Load backlog
    with open(BACKLOG_FILE) as f:
        backlog = json.load(f)

    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing cards
    cursor.execute("DELETE FROM cards")

    # Insert all cards
    for card in backlog.get("cards", []):
        cursor.execute("""
            INSERT INTO cards (
                card_id, title, description, type, squad, status, priority,
                created_at, updated_at, assigned_to, depends_on, acceptance_criteria
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            card.get("card_id"),
            card.get("title"),
            card.get("description", ""),
            card.get("type", "story"),
            card.get("squad"),
            card.get("status", "TODO"),
            card.get("priority", "MEDIUM"),
            card.get("created_at", datetime.now().isoformat()),
            card.get("updated_at", datetime.now().isoformat()),
            card.get("assigned_to"),
            json.dumps(card.get("depends_on", [])),
            json.dumps(card.get("acceptance_criteria", []))
        ))

    conn.commit()
    conn.close()

    # Calculate stats
    total = len(backlog.get("cards", []))
    by_status = {}
    for card in backlog.get("cards", []):
        status = card.get("status", "TODO")
        by_status[status] = by_status.get(status, 0) + 1

    print(f"✅ Synced {total} cards to portal DB")
    print(f"   TODO: {by_status.get('TODO', 0)}, IN_PROGRESS: {by_status.get('IN_PROGRESS', 0)}, DONE: {by_status.get('DONE', 0)}")

if __name__ == "__main__":
    print("🔄 Starting continuous sync (every 5 seconds)...")
    print("   Press Ctrl+C to stop")

    try:
        while True:
            sync_backlog_to_db()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n✋ Sync stopped")

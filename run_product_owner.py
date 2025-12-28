#!/usr/bin/env python3
"""
Quick script to execute Product Owner Agent standalone
"""
import sys
from pathlib import Path

# Add squadOS/app-execution to path
sys.path.insert(0, str(Path(__file__).parent / "squadOS" / "app-execution"))

from agents.product_owner_agent import execute_product_owner_card

def progress_callback(pct, msg):
    """Print progress updates"""
    print(f"[{pct:3d}%] {msg}")

if __name__ == '__main__':
    print("=" * 70)
    print("SquadOS - Product Owner Agent Execution")
    print("=" * 70)
    print()

    # EPIC-001: Generate product backlog from documentation
    card_id = "EPIC-001"
    card_data = {
        'id': 'EPIC-001',
        'type': 'Epic',
        'title': 'Generate Product Backlog from Documentation',
        'description': 'Parse documentation-base and generate comprehensive product cards'
    }

    try:
        result = execute_product_owner_card(
            card_id=card_id,
            card_data=card_data,
            progress_callback=progress_callback
        )

        print()
        print("=" * 70)
        print("✅ SUCCESS")
        print("=" * 70)
        print(f"Cards Generated: {result['cards_generated']}")
        print(f"Artifacts Created: {len(result['artifacts'])}")
        print(f"Backlog Path: {result['backlog_path']}")
        print()
        print("Validation:")
        print(f"  Valid: {result['validation']['valid']}")
        if result['validation']['valid']:
            print(f"  ✅ All validations passed")
        else:
            print(f"  ❌ Errors: {result['validation']['errors']}")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERROR")
        print("=" * 70)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

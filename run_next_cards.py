#!/usr/bin/env python3
"""
Execute next cards: PROD-002 (Backend) and PROD-003 (Frontend)
"""
import sys
import json
from pathlib import Path

# Add squadOS/app-execution to path
sys.path.insert(0, str(Path(__file__).parent / "squadOS" / "app-execution"))

from agents.backend_owner_agent_v2_hybrid import BackendOwnerAgentV2
from agents.frontend_owner_agent_v2_hybrid import FrontendOwnerAgentV2

def progress_callback(pct, msg):
    """Print progress updates"""
    print(f"[{pct:3d}%] {msg}")

def load_card_from_backlog(card_id):
    """Load card data from backlog"""
    backlog_path = Path("squadOS/app-execution/state/backlog_master.json")
    with open(backlog_path) as f:
        backlog = json.load(f)

    for card in backlog['cards']:
        if card['card_id'] == card_id:
            return card

    raise ValueError(f"Card {card_id} not found in backlog")

def execute_backend_card(card_id):
    """Execute a backend card"""
    print("=" * 70)
    print(f"Backend Owner Agent - Executing {card_id}")
    print("=" * 70)
    print()

    card_data = load_card_from_backlog(card_id)

    agent = BackendOwnerAgentV2()

    try:
        result = agent.execute_card(card_id, card_data)

        print()
        print("=" * 70)
        print(f"✅ {card_id} SUCCESS")
        print("=" * 70)
        print(f"Status: {result['status']}")
        print(f"Language: {result.get('language', 'N/A')}")
        print(f"Files Generated: {len(result.get('files', []))}")
        print(f"Cost: ${result.get('cost', 0):.2f}")
        print()

        return result

    except Exception as e:
        print()
        print("=" * 70)
        print(f"❌ {card_id} ERROR")
        print("=" * 70)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

def execute_frontend_card(card_id):
    """Execute a frontend card"""
    print("=" * 70)
    print(f"Frontend Owner Agent - Executing {card_id}")
    print("=" * 70)
    print()

    card_data = load_card_from_backlog(card_id)

    agent = FrontendOwnerAgentV2()

    try:
        result = agent.execute_card(card_id, card_data)

        print()
        print("=" * 70)
        print(f"✅ {card_id} SUCCESS")
        print("=" * 70)
        print(f"Status: {result['status']}")
        print(f"Component Type: {result.get('component_type', 'N/A')}")
        print(f"Files Generated: {len(result.get('files', []))}")
        print(f"Cost: ${result.get('cost', 0):.2f}")
        print()

        return result

    except Exception as e:
        print()
        print("=" * 70)
        print(f"❌ {card_id} ERROR")
        print("=" * 70)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    print()
    print("=" * 70)
    print("SquadOS - Agent Execution (Backend + Frontend)")
    print("=" * 70)
    print()

    # Execute PROD-002 (Backend)
    backend_result = execute_backend_card("PROD-002")

    if backend_result:
        # Execute PROD-003 (Frontend)
        frontend_result = execute_frontend_card("PROD-003")

        if frontend_result:
            print("=" * 70)
            print("✅ ALL CARDS EXECUTED SUCCESSFULLY")
            print("=" * 70)
            print()
            print("Summary:")
            print(f"  Backend (PROD-002): {backend_result['status']}")
            print(f"  Frontend (PROD-003): {frontend_result['status']}")
            print(f"  Total Cost: ${backend_result.get('cost', 0) + frontend_result.get('cost', 0):.2f}")
            print()
        else:
            print("❌ Frontend execution failed")
            sys.exit(1)
    else:
        print("❌ Backend execution failed")
        sys.exit(1)

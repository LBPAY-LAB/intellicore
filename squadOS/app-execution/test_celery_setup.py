#!/usr/bin/env python3
"""
Test Celery Setup
Validates that Celery + Redis are working correctly
"""

import sys
import time
from tasks import hello_world

def test_hello_world():
    """Test hello_world task execution"""
    print("=" * 60)
    print("Testing Celery Setup with Hello World Task")
    print("=" * 60)

    # Send task to Celery
    print("\n1. Enqueuing hello_world task...")
    result = hello_world.delay('SquadOS')

    print(f"   ✅ Task enqueued with ID: {result.id}")

    # Wait for result (with timeout)
    print("\n2. Waiting for task to complete (max 30s)...")
    try:
        output = result.get(timeout=30)
        print(f"   ✅ Task completed successfully!")
        print(f"\n3. Result:")
        print(f"   - Message: {output['message']}")
        print(f"   - Task ID: {output['task_id']}")
        print(f"   - Timestamp: {output['timestamp']}")
        print(f"   - Status: {output['status']}")

        print("\n" + "=" * 60)
        print("✅ CELERY SETUP VALIDATED - ALL TESTS PASSED")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"   ❌ Task failed or timed out: {e}")
        print("\n" + "=" * 60)
        print("❌ CELERY SETUP FAILED")
        print("=" * 60)
        print("\nTroubleshooting:")
        print("1. Check if Redis is running: redis-cli ping")
        print("2. Check if Celery worker is running in another terminal:")
        print("   cd /Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution")
        print("   celery -A celery_app worker --loglevel=info")
        return False

if __name__ == '__main__':
    success = test_hello_world()
    sys.exit(0 if success else 1)

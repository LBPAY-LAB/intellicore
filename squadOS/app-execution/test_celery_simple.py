#!/usr/bin/env python3
"""
Simple Celery Test (using default queue)
"""

from tasks import hello_world

print("Sending hello_world task to DEFAULT queue...")
result = hello_world.apply_async(args=['SquadOS'], queue='celery')  # Use default queue

print(f"Task ID: {result.id}")
print("Waiting for result (30s timeout)...")

try:
    output = result.get(timeout=30)
    print(f"\n✅ SUCCESS!")
    print(f"Message: {output['message']}")
    print(f"Task ID: {output['task_id']}")
except Exception as e:
    print(f"\n❌ FAILED: {e}")

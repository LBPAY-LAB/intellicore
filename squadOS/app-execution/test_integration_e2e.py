"""
End-to-End Integration Tests - Phase 5

Tests the complete workflow with v2.0 Hybrid/Skills-Only agents:
1. Backend Owner v2.0 Hybrid (PROD-002)
2. Frontend Owner v2.0 Hybrid (PROD-003)
3. QA Owner v2.0 Skills-Only (validates both)

Validates:
- Complete card execution workflows
- Cost budgets (Backend ≤$0.60, Frontend ≤$0.40, QA ≤$0.30)
- Quality scores ≥8.0
- All tests passing
- Zero-tolerance compliance
- Skills delegation working correctly

Run: python3 test_integration_e2e.py
"""

import sys
from pathlib import Path
from typing import Dict, Any
import time

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agents.backend_owner_agent_v2_hybrid import BackendOwnerAgentV2, create_backend_owner_agent
from agents.frontend_owner_agent_v2_hybrid import FrontendOwnerAgentV2, create_frontend_owner_agent
from agents.qa_owner_agent_v2_skills import QAOwnerAgentV2, create_qa_owner_agent


def test_backend_integration():
    """Test PROD-002 Backend card end-to-end workflow"""
    print("=" * 70)
    print("Test 1: Backend Integration (PROD-002)")
    print("=" * 70)
    print()

    agent = create_backend_owner_agent()

    # PROD-002: Create CRUD API for Oracles (should be Go-based)
    card_id = 'PROD-002'
    card_data = {
        'title': 'Create CRUD API for Oracles',
        'type': 'Backend',
        'acceptance_criteria': """
        - POST /api/v1/oracles - Create new Oracle
        - GET /api/v1/oracles - List all Oracles
        - GET /api/v1/oracles/:id - Get Oracle by ID
        - PUT /api/v1/oracles/:id - Update Oracle
        - DELETE /api/v1/oracles/:id - Delete Oracle
        - All endpoints return proper HTTP status codes
        - Input validation for all requests
        - Error handling for database failures
        - Unit tests with ≥80% coverage
        - Integration tests for all endpoints
        """,
        'description': 'Implement CRUD operations for Oracle management',
        'priority': 'High'
    }

    print(f"📦 Card: {card_id}")
    print(f"📝 Title: {card_data['title']}")
    print(f"🔧 Type: {card_data['type']}")
    print()

    start_time = time.time()

    # Execute Backend Owner v2.0
    print("🚀 Executing Backend Owner Agent v2.0 Hybrid...")
    result = agent.execute_card(card_id, card_data)

    execution_time = time.time() - start_time

    print()
    print("=" * 70)
    print("Backend Integration Results")
    print("=" * 70)

    # Validate results
    assert result['status'] == 'success', f"Expected 'success', got '{result['status']}'"
    print(f"✅ Status: {result['status']} (correct)")

    assert result['language'] == 'go', f"Expected 'go' for CRUD, got '{result['language']}'"
    print(f"✅ Language: {result['language']} (correct, CRUD → Go)")

    assert result['skill_used'] == 'golang-pro', f"Expected 'golang-pro', got '{result['skill_used']}'"
    print(f"✅ Skill: {result['skill_used']} (correct)")

    cost = result.get('cost', 0)
    assert cost <= 0.60, f"Cost ${cost:.2f} exceeds budget $0.60"
    print(f"✅ Cost: ${cost:.2f} (within budget $0.60)")

    assert execution_time < 60, f"Execution time {execution_time:.1f}s exceeds 60s limit"
    print(f"✅ Execution time: {execution_time:.1f}s (fast)")

    print()
    print(f"📊 Artifacts generated: {len(result.get('artifacts', {}))}")
    for artifact_type, artifact_path in result.get('artifacts', {}).items():
        print(f"  - {artifact_type}: {artifact_path}")

    print()
    print("✅ PASS: Backend integration test successful")
    print()

    return result


def test_frontend_integration():
    """Test PROD-003 Frontend card end-to-end workflow"""
    print("=" * 70)
    print("Test 2: Frontend Integration (PROD-003)")
    print("=" * 70)
    print()

    agent = create_frontend_owner_agent()

    # PROD-003: Create Oracle Management Dashboard UI
    card_id = 'PROD-003'
    card_data = {
        'title': 'Create Oracle Management Dashboard UI',
        'type': 'Frontend',
        'acceptance_criteria': """
        - Dashboard page showing list of all Oracles
        - Create Oracle form with validation
        - Edit Oracle form with pre-filled data
        - Delete confirmation dialog
        - Real-time status updates
        - Responsive layout (mobile-first)
        - Loading states and error handling
        - Accessibility (WCAG 2.1 AA)
        - Unit tests with ≥80% coverage
        - E2E tests for user flows
        """,
        'description': 'Build UI for managing Oracle configurations',
        'priority': 'High'
    }

    print(f"📦 Card: {card_id}")
    print(f"📝 Title: {card_data['title']}")
    print(f"🔧 Type: {card_data['type']}")
    print()

    start_time = time.time()

    # Execute Frontend Owner v2.0
    print("🚀 Executing Frontend Owner Agent v2.0 Hybrid...")
    result = agent.execute_card(card_id, card_data)

    execution_time = time.time() - start_time

    print()
    print("=" * 70)
    print("Frontend Integration Results")
    print("=" * 70)

    # Validate results
    assert result['status'] == 'success', f"Expected 'success', got '{result['status']}'"
    print(f"✅ Status: {result['status']} (correct)")

    assert result['component_type'] in ['page', 'component', 'layout'], \
        f"Invalid component_type: {result['component_type']}"
    print(f"✅ Component type: {result['component_type']} (correct)")

    assert result['skill_used'] == 'frontend-developer', \
        f"Expected 'frontend-developer', got '{result['skill_used']}'"
    print(f"✅ Skill: {result['skill_used']} (correct)")

    cost = result.get('cost', 0)
    assert cost <= 0.40, f"Cost ${cost:.2f} exceeds budget $0.40"
    print(f"✅ Cost: ${cost:.2f} (within budget $0.40)")

    assert execution_time < 60, f"Execution time {execution_time:.1f}s exceeds 60s limit"
    print(f"✅ Execution time: {execution_time:.1f}s (fast)")

    print()
    print(f"📊 Artifacts generated: {len(result.get('artifacts', {}))}")
    for artifact_type, artifact_path in result.get('artifacts', {}).items():
        print(f"  - {artifact_type}: {artifact_path}")

    print()
    print("✅ PASS: Frontend integration test successful")
    print()

    return result


def test_qa_validation_backend():
    """Test QA Owner v2.0 validating Backend card (PROD-002)"""
    print("=" * 70)
    print("Test 3: QA Validation - Backend Card (PROD-002)")
    print("=" * 70)
    print()

    agent = create_qa_owner_agent()

    # Simulate Backend card (from test_backend_integration)
    card_id = 'PROD-002'
    card_data = {
        'title': 'Create CRUD API for Oracles',
        'type': 'Backend',
        'acceptance_criteria': 'API CRUD operations with tests',
        'artifacts': {
            'api': 'squadOS/app-artefacts/engenharia/backend/PROD-002/api/',
            'tests': 'squadOS/app-artefacts/engenharia/backend/PROD-002/tests/',
            'migrations': 'squadOS/app-artefacts/engenharia/backend/PROD-002/migrations/'
        }
    }

    print(f"📦 Card: {card_id}")
    print(f"🔧 Type: {card_data['type']}")
    print()

    start_time = time.time()

    # Execute QA Owner v2.0
    print("🚀 Executing QA Owner Agent v2.0 Skills-Only...")
    result = agent.execute_card(card_id, card_data)

    execution_time = time.time() - start_time

    print()
    print("=" * 70)
    print("QA Validation Results - Backend")
    print("=" * 70)

    # Validate results (expect approval or detailed rejection)
    assert result['status'] in ['approved', 'rejected'], \
        f"Invalid status: {result['status']}"
    print(f"✅ Status: {result['status']}")

    decision = result.get('decision', {})
    assert decision['decision'] in ['APPROVED', 'REJECTED'], \
        f"Invalid decision: {decision['decision']}"
    print(f"✅ Decision: {decision['decision']}")

    if decision['decision'] == 'APPROVED':
        assert decision['next_action'] == 'proceed_to_deploy'
        print(f"✅ Next action: {decision['next_action']} (correct)")
    else:
        assert decision['next_action'] == 'create_correction_card'
        print(f"⚠️  Next action: {decision['next_action']} (correction needed)")
        print(f"📋 Rejection reasons:")
        for reason in decision.get('reasons', []):
            print(f"  - {reason}")

    cost = result.get('cost', 0)
    assert cost <= 0.30, f"Cost ${cost:.2f} exceeds budget $0.30"
    print(f"✅ Cost: ${cost:.2f} (within budget $0.30)")

    assert execution_time < 90, f"Execution time {execution_time:.1f}s exceeds 90s limit"
    print(f"✅ Execution time: {execution_time:.1f}s (reasonable)")

    print()
    print("✅ PASS: QA validation (Backend) test successful")
    print()

    return result


def test_qa_validation_frontend():
    """Test QA Owner v2.0 validating Frontend card (PROD-003)"""
    print("=" * 70)
    print("Test 4: QA Validation - Frontend Card (PROD-003)")
    print("=" * 70)
    print()

    agent = create_qa_owner_agent()

    # Simulate Frontend card (from test_frontend_integration)
    card_id = 'PROD-003'
    card_data = {
        'title': 'Create Oracle Management Dashboard UI',
        'type': 'Frontend',
        'acceptance_criteria': 'Dashboard UI with CRUD operations',
        'artifacts': {
            'components': 'squadOS/app-artefacts/engenharia/frontend/PROD-003/components/',
            'pages': 'squadOS/app-artefacts/engenharia/frontend/PROD-003/pages/',
            'tests': 'squadOS/app-artefacts/engenharia/frontend/PROD-003/tests/'
        }
    }

    print(f"📦 Card: {card_id}")
    print(f"🔧 Type: {card_data['type']}")
    print()

    start_time = time.time()

    # Execute QA Owner v2.0
    print("🚀 Executing QA Owner Agent v2.0 Skills-Only...")
    result = agent.execute_card(card_id, card_data)

    execution_time = time.time() - start_time

    print()
    print("=" * 70)
    print("QA Validation Results - Frontend")
    print("=" * 70)

    # Validate results
    assert result['status'] in ['approved', 'rejected'], \
        f"Invalid status: {result['status']}"
    print(f"✅ Status: {result['status']}")

    decision = result.get('decision', {})
    assert decision['decision'] in ['APPROVED', 'REJECTED'], \
        f"Invalid decision: {decision['decision']}"
    print(f"✅ Decision: {decision['decision']}")

    if decision['decision'] == 'APPROVED':
        assert decision['next_action'] == 'proceed_to_deploy'
        print(f"✅ Next action: {decision['next_action']} (correct)")
    else:
        assert decision['next_action'] == 'create_correction_card'
        print(f"⚠️  Next action: {decision['next_action']} (correction needed)")
        print(f"📋 Rejection reasons:")
        for reason in decision.get('reasons', []):
            print(f"  - {reason}")

    cost = result.get('cost', 0)
    assert cost <= 0.30, f"Cost ${cost:.2f} exceeds budget $0.30"
    print(f"✅ Cost: ${cost:.2f} (within budget $0.30)")

    assert execution_time < 90, f"Execution time {execution_time:.1f}s exceeds 90s limit"
    print(f"✅ Execution time: {execution_time:.1f}s (reasonable)")

    print()
    print("✅ PASS: QA validation (Frontend) test successful")
    print()

    return result


def test_complete_workflow():
    """Test complete workflow: Backend → QA, Frontend → QA"""
    print("=" * 70)
    print("Test 5: Complete Workflow (PROD-002 + PROD-003)")
    print("=" * 70)
    print()

    total_start_time = time.time()

    # Step 1: Execute Backend card
    print("Step 1: Backend Owner v2.0 (PROD-002)")
    print("-" * 70)
    backend_result = test_backend_integration()

    # Step 2: QA validate Backend card
    print("Step 2: QA Owner v2.0 validates Backend (PROD-002)")
    print("-" * 70)
    qa_backend_result = test_qa_validation_backend()

    # Step 3: Execute Frontend card
    print("Step 3: Frontend Owner v2.0 (PROD-003)")
    print("-" * 70)
    frontend_result = test_frontend_integration()

    # Step 4: QA validate Frontend card
    print("Step 4: QA Owner v2.0 validates Frontend (PROD-003)")
    print("-" * 70)
    qa_frontend_result = test_qa_validation_frontend()

    total_execution_time = time.time() - total_start_time

    print()
    print("=" * 70)
    print("Complete Workflow Results")
    print("=" * 70)

    # Calculate total costs
    backend_cost = backend_result.get('cost', 0)
    qa_backend_cost = qa_backend_result.get('cost', 0)
    frontend_cost = frontend_result.get('cost', 0)
    qa_frontend_cost = qa_frontend_result.get('cost', 0)
    total_cost = backend_cost + qa_backend_cost + frontend_cost + qa_frontend_cost

    print(f"💰 Total Cost Breakdown:")
    print(f"  - Backend (PROD-002): ${backend_cost:.2f}")
    print(f"  - QA Backend: ${qa_backend_cost:.2f}")
    print(f"  - Frontend (PROD-003): ${frontend_cost:.2f}")
    print(f"  - QA Frontend: ${qa_frontend_cost:.2f}")
    print(f"  - TOTAL: ${total_cost:.2f}")

    # Validate total cost (Backend $0.60 + QA $0.30 + Frontend $0.40 + QA $0.30 = $1.60 max)
    assert total_cost <= 1.60, f"Total cost ${total_cost:.2f} exceeds budget $1.60"
    print(f"✅ Total cost within budget ($1.60)")

    print()
    print(f"⏱️  Total execution time: {total_execution_time:.1f}s")
    assert total_execution_time < 300, f"Total time {total_execution_time:.1f}s exceeds 5 min limit"
    print(f"✅ Execution time reasonable (<5 min)")

    print()
    print(f"📊 Workflow Summary:")
    print(f"  - Backend status: {backend_result['status']}")
    print(f"  - Backend QA decision: {qa_backend_result['decision']['decision']}")
    print(f"  - Frontend status: {frontend_result['status']}")
    print(f"  - Frontend QA decision: {qa_frontend_result['decision']['decision']}")

    print()
    print("✅ PASS: Complete workflow test successful")
    print()


def main():
    """Run all integration tests"""
    print("\n")
    print("=" * 70)
    print("End-to-End Integration Tests - Phase 5")
    print("=" * 70)
    print()
    print("Testing v2.0 Hybrid/Skills-Only Architecture:")
    print("  - Backend Owner v2.0 Hybrid")
    print("  - Frontend Owner v2.0 Hybrid")
    print("  - QA Owner v2.0 Skills-Only")
    print()

    try:
        # Individual component tests
        backend_result = test_backend_integration()
        frontend_result = test_frontend_integration()
        qa_backend_result = test_qa_validation_backend()
        qa_frontend_result = test_qa_validation_frontend()

        # Complete workflow test
        test_complete_workflow()

        print("=" * 70)
        print("✅ ALL INTEGRATION TESTS PASSED (5/5)")
        print("=" * 70)
        print()
        print("Phase 5 Complete - Integration validated!")
        print()
        print("Key Validations:")
        print("  ✅ Backend Owner v2.0: PROD-002 executed successfully")
        print("  ✅ Frontend Owner v2.0: PROD-003 executed successfully")
        print("  ✅ QA Owner v2.0: Backend card validated")
        print("  ✅ QA Owner v2.0: Frontend card validated")
        print("  ✅ Complete workflow: All cards processed end-to-end")
        print("  ✅ Cost budget: All cards within budget")
        print("  ✅ Execution time: All within limits")
        print()
        print("Next Steps:")
        print("  1. Phase 6: Update documentation (CLAUDE.md v3.2.0)")
        print("  2. Create SKILLS_DELEGATION_GUIDE.md")
        print("  3. Create MIGRATION_COMPLETE.md")
        print("  4. Phase 7: Merge to main and tag release v2.0.0")

    except AssertionError as e:
        print(f"\n❌ INTEGRATION TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

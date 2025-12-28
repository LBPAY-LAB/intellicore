#!/usr/bin/env python3
"""
Test Meta-Orchestrator
Validates state machine transitions, dependency graph, and validation pipeline
"""

import json
import tempfile
from pathlib import Path
from autonomous_meta_orchestrator import MetaOrchestrator
from models import CardState, BacklogMaster


def test_load_backlog():
    """Test loading backlog from JSON file"""
    print("=" * 80)
    print("TEST 1: Load Backlog")
    print("=" * 80)

    # Create test backlog
    test_backlog: BacklogMaster = {
        "project": "Test Project",
        "cards": [
            {
                "id": "TEST-001",
                "type": "PROD",
                "title": "Test Card",
                "description": "Test description",
                "acceptance_criteria": ["Criterion 1"],
                "dependencies": [],
                "priority": "P0",
                "effort": "5 story points",
                "status": "TODO",
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {
                    "total_tokens": 0,
                    "total_cost": 0.0,
                    "attempts": [],
                    "alerts": []
                },
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            }
        ],
        "metadata": {
            "total_cards": 1,
            "phase": "Test",
            "last_updated": "2025-12-27T10:00:00Z",
            "generated_by": "test_meta_orchestrator.py"
        },
        "statistics": {
            "by_status": {"TODO": 1},
            "by_type": {"PROD": 1},
            "total_cost": 0.0,
            "escalated_count": 0
        }
    }

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_backlog, f, indent=2)
        temp_path = f.name

    # Load with orchestrator
    orchestrator = MetaOrchestrator(backlog_path=temp_path)
    orchestrator.load_backlog()

    # Validate
    assert orchestrator.backlog is not None
    assert len(orchestrator.cards_by_id) == 1
    assert 'TEST-001' in orchestrator.cards_by_id

    print("✅ Backlog loaded successfully")
    print(f"   Cards loaded: {len(orchestrator.cards_by_id)}")
    print(f"   Project: {orchestrator.backlog['project']}\n")

    # Cleanup
    Path(temp_path).unlink()

    return True


def test_dependency_graph():
    """Test dependency graph building"""
    print("=" * 80)
    print("TEST 2: Dependency Graph")
    print("=" * 80)

    # Create test backlog with dependencies
    test_backlog: BacklogMaster = {
        "project": "Test Project",
        "cards": [
            {
                "id": "EPIC-001",
                "type": "EPIC",
                "title": "Epic",
                "description": "Epic description",
                "acceptance_criteria": [],
                "dependencies": [],
                "priority": "P0",
                "effort": "100 story points",
                "status": "TODO",
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            },
            {
                "id": "PROD-001",
                "type": "PROD",
                "title": "Product Card",
                "description": "Product description",
                "acceptance_criteria": [],
                "dependencies": ["EPIC-001"],
                "priority": "P0",
                "effort": "8 story points",
                "status": "TODO",
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            },
            {
                "id": "ARQ-001",
                "type": "ARQ",
                "title": "Architecture Card",
                "description": "Architecture description",
                "acceptance_criteria": [],
                "dependencies": ["PROD-001"],
                "priority": "P0",
                "effort": "5 story points",
                "status": "TODO",
                "assigned_to": "ArchitectureOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            }
        ],
        "metadata": {"total_cards": 3, "phase": "Test"},
        "statistics": {}
    }

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_backlog, f, indent=2)
        temp_path = f.name

    # Build dependency graph
    orchestrator = MetaOrchestrator(backlog_path=temp_path)
    orchestrator.load_backlog()
    orchestrator.build_dependency_graph()

    # Validate
    assert 'EPIC-001' in orchestrator.dependency_graph
    assert 'PROD-001' in orchestrator.dependency_graph['EPIC-001']
    assert 'ARQ-001' in orchestrator.dependency_graph['PROD-001']

    print("✅ Dependency graph built successfully")
    print(f"   EPIC-001 → {orchestrator.dependency_graph['EPIC-001']}")
    print(f"   PROD-001 → {orchestrator.dependency_graph.get('PROD-001', set())}\n")

    # Cleanup
    Path(temp_path).unlink()

    return True


def test_are_dependencies_satisfied():
    """Test dependency satisfaction checking"""
    print("=" * 80)
    print("TEST 3: Dependency Satisfaction")
    print("=" * 80)

    # Create test backlog
    test_backlog: BacklogMaster = {
        "project": "Test Project",
        "cards": [
            {
                "id": "EPIC-001",
                "type": "EPIC",
                "title": "Epic",
                "description": "",
                "acceptance_criteria": [],
                "dependencies": [],
                "priority": "P0",
                "effort": "100 story points",
                "status": "DONE",  # Already completed
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": "2025-12-27T10:00:00Z",
                "parent_card": None
            },
            {
                "id": "PROD-001",
                "type": "PROD",
                "title": "Product Card",
                "description": "",
                "acceptance_criteria": [],
                "dependencies": ["EPIC-001"],
                "priority": "P0",
                "effort": "8 story points",
                "status": "TODO",  # Ready (dep satisfied)
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            },
            {
                "id": "ARQ-001",
                "type": "ARQ",
                "title": "Architecture Card",
                "description": "",
                "acceptance_criteria": [],
                "dependencies": ["PROD-001"],
                "priority": "P0",
                "effort": "5 story points",
                "status": "TODO",  # Blocked (dep not satisfied)
                "assigned_to": "ArchitectureOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            }
        ],
        "metadata": {"total_cards": 3, "phase": "Test"},
        "statistics": {}
    }

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_backlog, f, indent=2)
        temp_path = f.name

    # Check dependencies
    orchestrator = MetaOrchestrator(backlog_path=temp_path)
    orchestrator.load_backlog()

    epic_card = orchestrator.cards_by_id['EPIC-001']
    prod_card = orchestrator.cards_by_id['PROD-001']
    arq_card = orchestrator.cards_by_id['ARQ-001']

    epic_satisfied = orchestrator.are_dependencies_satisfied(epic_card)
    prod_satisfied = orchestrator.are_dependencies_satisfied(prod_card)
    arq_satisfied = orchestrator.are_dependencies_satisfied(arq_card)

    # Validate
    assert epic_satisfied is True  # No dependencies
    assert prod_satisfied is True  # EPIC-001 is DONE
    assert arq_satisfied is False  # PROD-001 is TODO (not DONE)

    print("✅ Dependency satisfaction checked successfully")
    print(f"   EPIC-001 (no deps): {epic_satisfied}")
    print(f"   PROD-001 (dep EPIC-001=DONE): {prod_satisfied}")
    print(f"   ARQ-001 (dep PROD-001=TODO): {arq_satisfied}\n")

    # Cleanup
    Path(temp_path).unlink()

    return True


def test_state_transitions():
    """Test state machine transitions"""
    print("=" * 80)
    print("TEST 4: State Transitions")
    print("=" * 80)

    # Create test backlog
    test_backlog: BacklogMaster = {
        "project": "Test Project",
        "cards": [
            {
                "id": "TEST-001",
                "type": "PROD",
                "title": "Test Card",
                "description": "",
                "acceptance_criteria": [],
                "dependencies": [],
                "priority": "P0",
                "effort": "5 story points",
                "status": "TODO",
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 0,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            }
        ],
        "metadata": {"total_cards": 1, "phase": "Test"},
        "statistics": {}
    }

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_backlog, f, indent=2)
        temp_path = f.name

    # Test transitions
    orchestrator = MetaOrchestrator(backlog_path=temp_path)
    orchestrator.load_backlog()

    card = orchestrator.cards_by_id['TEST-001']

    # Valid transition: TODO → IN_PROGRESS
    orchestrator.transition_state(card, 'TODO', 'IN_PROGRESS')
    assert card['status'] == 'IN_PROGRESS'
    print("✅ TODO → IN_PROGRESS")

    # Valid transition: IN_PROGRESS → VALIDATING
    orchestrator.transition_state(card, 'IN_PROGRESS', 'VALIDATING')
    assert card['status'] == 'VALIDATING'
    print("✅ IN_PROGRESS → VALIDATING")

    # Valid transition: VALIDATING → APPROVED
    orchestrator.transition_state(card, 'VALIDATING', 'APPROVED')
    assert card['status'] == 'APPROVED'
    print("✅ VALIDATING → APPROVED")

    # Valid transition: APPROVED → DONE
    orchestrator.transition_state(card, 'APPROVED', 'DONE')
    assert card['status'] == 'DONE'
    print("✅ APPROVED → DONE")

    # Invalid transition test
    try:
        orchestrator.transition_state(card, 'DONE', 'TODO')
        assert False, "Should have raised ValueError"
    except ValueError:
        print("✅ Invalid transition rejected (DONE → TODO)\n")

    # Cleanup
    Path(temp_path).unlink()

    return True


def test_correction_card_creation():
    """Test correction card creation"""
    print("=" * 80)
    print("TEST 5: Correction Card Creation")
    print("=" * 80)

    # Create test backlog
    test_backlog: BacklogMaster = {
        "project": "Test Project",
        "cards": [
            {
                "id": "PROD-001",
                "type": "PROD",
                "title": "Original Card",
                "description": "",
                "acceptance_criteria": [],
                "dependencies": [],
                "priority": "P0",
                "effort": "8 story points",
                "status": "REJECTED",
                "assigned_to": "ProductOwnerAgent",
                "validation_history": [],
                "correction_attempts": 1,
                "cost_tracking": {"total_tokens": 0, "total_cost": 0.0, "attempts": [], "alerts": []},
                "escalated": False,
                "escalation_reason": None,
                "artifacts": [],
                "task_id": None,
                "started_at": None,
                "completed_at": None,
                "parent_card": None
            }
        ],
        "metadata": {"total_cards": 1, "phase": "Test"},
        "statistics": {}
    }

    # Save to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_backlog, f, indent=2)
        temp_path = f.name

    # Create correction card
    orchestrator = MetaOrchestrator(backlog_path=temp_path)
    orchestrator.load_backlog()

    parent_card = orchestrator.cards_by_id['PROD-001']

    # Mock validation results
    validation_results = [
        {
            'validator': 'VerificationAgent',
            'result': 'FAILED',
            'score': None,
            'reasons': ['Missing test evidence', 'Build failed'],
            'feedback': {
                'tests': 'Add pytest output',
                'build': 'Fix compilation errors'
            },
            'timestamp': '2025-12-27T10:00:00Z'
        }
    ]

    # Create correction card
    orchestrator.create_correction_card(parent_card, validation_results)

    # Validate
    assert len(orchestrator.backlog['cards']) == 2
    correction_card = orchestrator.cards_by_id['PROD-001-CORR-1']

    assert correction_card['id'] == 'PROD-001-CORR-1'
    assert correction_card['parent_card'] == 'PROD-001'
    assert correction_card['attempt'] == 1
    assert correction_card['status'] == 'TODO'
    assert 'CORRECTION 1' in correction_card['title']
    assert len(correction_card['acceptance_criteria']) > 0
    assert 'tests' in correction_card['validation_feedback']

    print("✅ Correction card created successfully")
    print(f"   Card ID: {correction_card['id']}")
    print(f"   Parent: {correction_card['parent_card']}")
    print(f"   Attempt: {correction_card['attempt']}")
    print(f"   Feedback categories: {list(correction_card['validation_feedback'].keys())}\n")

    # Cleanup
    Path(temp_path).unlink()

    return True


def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("META-ORCHESTRATOR TEST SUITE")
    print("=" * 80 + "\n")

    tests = [
        ("Load Backlog", test_load_backlog),
        ("Dependency Graph", test_dependency_graph),
        ("Dependency Satisfaction", test_are_dependencies_satisfied),
        ("State Transitions", test_state_transitions),
        ("Correction Card Creation", test_correction_card_creation),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed: {test_name}")
            print(f"   Error: {e}\n")
            failed += 1

    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {len(tests)}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    print("=" * 80 + "\n")

    if failed == 0:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print(f"⚠️  {failed} TEST(S) FAILED")
        return False


if __name__ == '__main__':
    import sys
    success = run_all_tests()
    sys.exit(0 if success else 1)

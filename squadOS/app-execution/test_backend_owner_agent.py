#!/usr/bin/env python3
"""
Test script for Backend Owner Agent v1.0.0

Validates:
- Agent initialization
- Card type detection (backend cards only)
- API generation (Go/Python)
- Service generation
- Migration generation
- Test generation
- Validation logic

Author: SquadOS Meta-Framework
Date: 2025-12-27
"""

import json
import sys
from pathlib import Path

# Add agents directory to path
sys.path.insert(0, str(Path(__file__).parent / "agents"))

from backend_owner_agent import BackendOwnerAgent


def test_initialization():
    """Test agent initialization"""
    print("🧪 Test 1: Agent Initialization")
    agent = BackendOwnerAgent()

    assert agent.base_dir.exists(), "Base dir should exist"
    assert agent.api_dir.exists(), "API dir should exist"
    assert agent.services_dir.exists(), "Services dir should exist"
    assert agent.migrations_dir.exists(), "Migrations dir should exist"
    assert agent.tests_dir.exists(), "Tests dir should exist"

    print("✅ PASS: Agent initialized correctly")
    print(f"   Base dir: {agent.base_dir}")
    print(f"   API dir: {agent.api_dir}")
    print()


def test_card_type_detection():
    """Test backend card detection"""
    print("🧪 Test 2: Card Type Detection")
    agent = BackendOwnerAgent()

    # Test backend cards (PROD-002, PROD-005, PROD-008, ...)
    test_cases = [
        ("PROD-002", {}, True),   # (2-2) % 3 == 0 → backend
        ("PROD-005", {}, True),   # (5-2) % 3 == 0 → backend
        ("PROD-008", {}, True),   # (8-2) % 3 == 0 → backend
        ("PROD-001", {}, False),  # Design card
        ("PROD-003", {}, False),  # Frontend card
        ("PROD-004", {}, False),  # Design card
        ("PROD-006", {}, False),  # Frontend card
    ]

    for card_id, card_data, expected in test_cases:
        result = agent._is_backend_card(card_id, card_data)
        assert result == expected, f"{card_id} should be {'backend' if expected else 'not backend'}"
        status = "✅" if result == expected else "❌"
        print(f"   {status} {card_id}: {'backend' if result else 'not backend'} (expected: {expected})")

    print("✅ PASS: Card type detection working correctly")
    print()


def test_language_determination():
    """Test language determination (Go vs Python)"""
    print("🧪 Test 3: Language Determination")
    agent = BackendOwnerAgent()

    test_cases = [
        ({'requirement_ids': ['RF001']}, 'go'),    # Data/CRUD → Go
        ({'requirement_ids': ['RF002']}, 'python'), # RAG → Python
        ({'requirement_ids': ['RF003']}, 'python'), # AI → Python
        ({'requirement_ids': ['RF020']}, 'python'), # Agents → Python
        ({'requirement_ids': ['RF010']}, 'go'),    # Data → Go
    ]

    for card_data, expected in test_cases:
        result = agent._determine_language(card_data)
        assert result == expected, f"{card_data['requirement_ids'][0]} should use {expected}"
        status = "✅" if result == expected else "❌"
        print(f"   {status} {card_data['requirement_ids'][0]}: {result} (expected: {expected})")

    print("✅ PASS: Language determination working correctly")
    print()


def test_go_api_generation():
    """Test Go API generation"""
    print("🧪 Test 4: Go API Generation")
    agent = BackendOwnerAgent()

    test_card = {
        'card_id': 'PROD-002',
        'title': 'Implement Oracle Management API',
        'requirement_ids': ['RF001']
    }

    api_contract = agent._generate_default_contract('RF001')
    api_file = agent._generate_go_api('PROD-002', test_card, api_contract)

    assert api_file.exists(), "API file should exist"
    assert api_file.stat().st_size > 0, "API file should have content"
    assert 'handler.go' in api_file.name, "Should be a Go handler file"

    # Check content
    content = api_file.read_text(encoding='utf-8')
    assert 'package api' in content, "Should have package declaration"
    assert 'gin.Context' in content, "Should use Gin framework"

    print(f"✅ PASS: Generated Go API")
    print(f"   File: {api_file.name} ({api_file.stat().st_size} bytes)")
    print()


def test_python_api_generation():
    """Test Python API generation"""
    print("🧪 Test 5: Python API Generation")
    agent = BackendOwnerAgent()

    test_card = {
        'card_id': 'PROD-002',
        'title': 'Implement RAG Pipeline API',
        'requirement_ids': ['RF002']
    }

    api_contract = agent._generate_default_contract('RF002')
    api_file = agent._generate_python_api('PROD-002', test_card, api_contract)

    assert api_file.exists(), "API file should exist"
    assert api_file.stat().st_size > 0, "API file should have content"
    assert 'router.py' in api_file.name, "Should be a Python router file"

    # Check content
    content = api_file.read_text(encoding='utf-8')
    assert 'from fastapi' in content, "Should use FastAPI framework"
    assert 'router = APIRouter' in content, "Should define router"

    print(f"✅ PASS: Generated Python API")
    print(f"   File: {api_file.name} ({api_file.stat().st_size} bytes)")
    print()


def test_migration_generation():
    """Test database migration generation"""
    print("🧪 Test 6: Migration Generation")
    agent = BackendOwnerAgent()

    test_card = {
        'card_id': 'PROD-002',
        'title': 'Implement Oracle Management API',
        'requirement_ids': ['RF001']
    }

    api_contract = agent._generate_default_contract('RF001')
    migrations = agent._generate_migrations('PROD-002', test_card, api_contract)

    assert len(migrations) > 0, "Should generate at least one migration"
    assert all(m.exists() for m in migrations), "All migration files should exist"
    assert all(m.stat().st_size > 0 for m in migrations), "Migration files should have content"

    # Check content
    content = migrations[0].read_text(encoding='utf-8')
    assert 'CREATE TABLE' in content, "Should have CREATE TABLE statement"

    print(f"✅ PASS: Generated {len(migrations)} migration(s)")
    for migration in migrations:
        print(f"   - {migration.name} ({migration.stat().st_size} bytes)")
    print()


def test_test_generation():
    """Test test generation"""
    print("🧪 Test 7: Test Generation")
    agent = BackendOwnerAgent()

    # Generate fake API file (Go)
    api_file_go = agent.api_dir / "go" / "rf001_handler.go"
    api_file_go.parent.mkdir(parents=True, exist_ok=True)
    api_file_go.write_text("package api", encoding='utf-8')

    # Generate fake API file (Python)
    api_file_py = agent.api_dir / "python" / "rf002_router.py"
    api_file_py.parent.mkdir(parents=True, exist_ok=True)
    api_file_py.write_text("from fastapi import APIRouter", encoding='utf-8')

    tests = agent._generate_tests('PROD-002', [api_file_go, api_file_py], [])

    assert len(tests) > 0, "Should generate at least one test"
    assert all(t.exists() for t in tests), "All test files should exist"
    assert all(t.stat().st_size > 0 for t in tests), "Test files should have content"

    # Check for both Go and Python tests
    go_tests = [t for t in tests if '_test.go' in t.name]
    py_tests = [t for t in tests if 'test_' in t.name and '.py' in t.name]

    print(f"✅ PASS: Generated {len(tests)} test(s)")
    print(f"   - Go tests: {len(go_tests)}")
    print(f"   - Python tests: {len(py_tests)}")
    for test in tests:
        print(f"   - {test.name} ({test.stat().st_size} bytes)")
    print()


def test_full_execution():
    """Test full card execution"""
    print("🧪 Test 8: Full Card Execution")
    agent = BackendOwnerAgent()

    # Clear any existing checkpoints
    checkpoint_file = agent.checkpoints_dir / "PROD-002_backend.json"
    if checkpoint_file.exists():
        checkpoint_file.unlink()

    test_card = {
        'card_id': 'PROD-002',
        'title': 'Implement Oracle Management API',
        'requirement_ids': ['RF001'],
        'user_story': 'As a system, I need API to manage oracles',
        'acceptance_criteria': [
            'API exposes CRUD endpoints',
            'Database schema created',
            'Tests have ≥80% coverage'
        ]
    }

    result = agent.execute_card('PROD-002', test_card)

    assert result['status'] == 'completed', f"Execution should complete successfully (got: {result['status']})"
    assert result['api_files_generated'] > 0, "Should generate API files"
    assert result['service_files_generated'] > 0, "Should generate service files"
    assert result['migrations_generated'] > 0, "Should generate migrations"
    assert result['tests_generated'] > 0, "Should generate tests"
    assert result['validation']['overall_valid'], "Validation should pass"

    print(f"✅ PASS: Full execution completed successfully")
    print(f"   Status: {result['status']}")
    print(f"   API files: {result['api_files_generated']}")
    print(f"   Service files: {result['service_files_generated']}")
    print(f"   Migrations: {result['migrations_generated']}")
    print(f"   Tests: {result['tests_generated']}")
    print(f"   Time: {result['elapsed_time']:.2f}s")
    print()


def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("🚀 Backend Owner Agent - Test Suite")
    print("=" * 70)
    print()

    try:
        test_initialization()
        test_card_type_detection()
        test_language_determination()
        test_go_api_generation()
        test_python_api_generation()
        test_migration_generation()
        test_test_generation()
        test_full_execution()

        print("=" * 70)
        print("✅ ALL TESTS PASSED (8/8)")
        print("=" * 70)
        return 0

    except AssertionError as e:
        print()
        print("=" * 70)
        print(f"❌ TEST FAILED: {e}")
        print("=" * 70)
        return 1

    except Exception as e:
        print()
        print("=" * 70)
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 70)
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())

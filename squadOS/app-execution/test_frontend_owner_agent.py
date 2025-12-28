#!/usr/bin/env python3
"""
Test script for Frontend Owner Agent v1.0.0

Validates:
- Agent initialization
- Card type detection (frontend cards only)
- Component generation
- Page generation
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

from frontend_owner_agent import FrontendOwnerAgent


def test_initialization():
    """Test agent initialization"""
    print("🧪 Test 1: Agent Initialization")
    agent = FrontendOwnerAgent()

    assert agent.base_dir.exists(), "Base dir should exist"
    assert agent.components_dir.exists(), "Components dir should exist"
    assert agent.pages_dir.exists(), "Pages dir should exist"
    assert agent.tests_dir.exists(), "Tests dir should exist"

    print("✅ PASS: Agent initialized correctly")
    print(f"   Base dir: {agent.base_dir}")
    print(f"   Components dir: {agent.components_dir}")
    print()


def test_card_type_detection():
    """Test frontend card detection"""
    print("🧪 Test 2: Card Type Detection")
    agent = FrontendOwnerAgent()

    # Test frontend cards (PROD-003, PROD-006, PROD-009, ...)
    test_cases = [
        ("PROD-003", {}, True),   # 3 % 3 == 0 → frontend
        ("PROD-006", {}, True),   # 6 % 3 == 0 → frontend
        ("PROD-009", {}, True),   # 9 % 3 == 0 → frontend
        ("PROD-001", {}, False),  # Design card
        ("PROD-002", {}, False),  # Backend card
        ("PROD-004", {}, False),  # Design card
        ("PROD-005", {}, False),  # Backend card
    ]

    for card_id, card_data, expected in test_cases:
        result = agent._is_frontend_card(card_id, card_data)
        assert result == expected, f"{card_id} should be {'frontend' if expected else 'not frontend'}"
        status = "✅" if result == expected else "❌"
        print(f"   {status} {card_id}: {'frontend' if result else 'not frontend'} (expected: {expected})")

    print("✅ PASS: Card type detection working correctly")
    print()


def test_component_generation():
    """Test component generation"""
    print("🧪 Test 3: Component Generation")
    agent = FrontendOwnerAgent()

    test_card = {
        'card_id': 'PROD-003',
        'title': 'Implement Oracle Management UI',
        'requirement_ids': ['RF001'],
        'user_story': 'As a user, I want to manage oracles via UI',
        'acceptance_criteria': [
            'UI displays list of oracles',
            'User can create new oracle'
        ]
    }

    # Test component generation
    wireframes = {'components': ['Button', 'Card'], 'layout': 'default', 'sections': []}
    design_system = agent._parse_design_system()
    components = agent._generate_components('PROD-003', test_card, wireframes, design_system)

    assert len(components) > 0, "Should generate at least one component"
    assert all(c.exists() for c in components), "All component files should exist"
    assert all(c.stat().st_size > 0 for c in components), "Component files should have content"

    print(f"✅ PASS: Generated {len(components)} component(s)")
    for comp in components:
        print(f"   - {comp.name} ({comp.stat().st_size} bytes)")
    print()


def test_page_generation():
    """Test page generation"""
    print("🧪 Test 4: Page Generation")
    agent = FrontendOwnerAgent()

    test_card = {
        'card_id': 'PROD-003',
        'title': 'Implement Oracle Management UI',
        'requirement_ids': ['RF001']
    }

    # Generate fake component
    component_file = agent.components_dir / "OracleManagement.tsx"
    component_file.write_text("export function OracleManagement() {}", encoding='utf-8')

    pages = agent._generate_pages('PROD-003', test_card, [component_file])

    assert len(pages) > 0, "Should generate at least one page"
    assert all(p.exists() for p in pages), "All page files should exist"
    assert all(p.stat().st_size > 0 for p in pages), "Page files should have content"

    print(f"✅ PASS: Generated {len(pages)} page(s)")
    for page in pages:
        print(f"   - {page.relative_to(agent.pages_dir)} ({page.stat().st_size} bytes)")
    print()


def test_test_generation():
    """Test test generation"""
    print("🧪 Test 5: Test Generation")
    agent = FrontendOwnerAgent()

    # Generate fake component
    component_file = agent.components_dir / "OracleManagement.tsx"
    component_file.write_text("export function OracleManagement() {}", encoding='utf-8')

    # Generate fake page
    page_file = agent.pages_dir / "oraclemanagement" / "page.tsx"
    page_file.parent.mkdir(parents=True, exist_ok=True)
    page_file.write_text("export default function Page() {}", encoding='utf-8')

    tests = agent._generate_tests('PROD-003', [component_file], [page_file])

    assert len(tests) > 0, "Should generate at least one test"
    assert all(t.exists() for t in tests), "All test files should exist"
    assert all(t.stat().st_size > 0 for t in tests), "Test files should have content"

    # Check for both unit and E2E tests
    unit_tests = [t for t in tests if 'unit' in str(t)]
    e2e_tests = [t for t in tests if 'e2e' in str(t)]

    print(f"✅ PASS: Generated {len(tests)} test(s)")
    print(f"   - Unit tests: {len(unit_tests)}")
    print(f"   - E2E tests: {len(e2e_tests)}")
    for test in tests:
        print(f"   - {test.name} ({test.stat().st_size} bytes)")
    print()


def test_validation():
    """Test validation logic"""
    print("🧪 Test 6: Validation Logic")
    agent = FrontendOwnerAgent()

    # Create fake artifacts
    component_file = agent.components_dir / "Test.tsx"
    component_file.write_text("export function Test() {}", encoding='utf-8')

    page_file = agent.pages_dir / "test" / "page.tsx"
    page_file.parent.mkdir(parents=True, exist_ok=True)
    page_file.write_text("export default function Page() {}", encoding='utf-8')

    test_file = agent.tests_dir / "unit" / "Test.test.tsx"
    test_file.parent.mkdir(parents=True, exist_ok=True)
    test_file.write_text("describe('Test', () => {})", encoding='utf-8')

    validation = agent._validate_artifacts('PROD-003', [component_file], [page_file], [test_file])

    assert validation['components_valid'], "Components should be valid"
    assert validation['pages_valid'], "Pages should be valid"
    assert validation['tests_valid'], "Tests should be valid"
    assert validation['overall_valid'], "Overall validation should pass"

    print(f"✅ PASS: Validation working correctly")
    print(f"   Components valid: {validation['components_valid']}")
    print(f"   Pages valid: {validation['pages_valid']}")
    print(f"   Tests valid: {validation['tests_valid']}")
    print(f"   Overall valid: {validation['overall_valid']}")
    print()


def test_full_execution():
    """Test full card execution"""
    print("🧪 Test 7: Full Card Execution")
    agent = FrontendOwnerAgent()

    # Clear any existing checkpoints
    checkpoint_file = agent.checkpoints_dir / "PROD-003_frontend.json"
    if checkpoint_file.exists():
        checkpoint_file.unlink()

    test_card = {
        'card_id': 'PROD-003',
        'title': 'Implement Oracle Management UI',
        'requirement_ids': ['RF001'],
        'user_story': 'As a user, I want to manage oracles via UI',
        'acceptance_criteria': [
            'UI displays list of oracles',
            'User can create new oracle'
        ]
    }

    result = agent.execute_card('PROD-003', test_card)

    assert result['status'] == 'completed', f"Execution should complete successfully (got: {result['status']})"
    assert result['components_generated'] > 0, "Should generate components"
    assert result['pages_generated'] > 0, "Should generate pages"
    assert result['tests_generated'] > 0, "Should generate tests"
    assert result['validation']['overall_valid'], "Validation should pass"

    print(f"✅ PASS: Full execution completed successfully")
    print(f"   Status: {result['status']}")
    print(f"   Components: {result['components_generated']}")
    print(f"   Pages: {result['pages_generated']}")
    print(f"   Tests: {result['tests_generated']}")
    print(f"   Time: {result['elapsed_time']:.2f}s")
    print()


def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("🚀 Frontend Owner Agent - Test Suite")
    print("=" * 70)
    print()

    try:
        test_initialization()
        test_card_type_detection()
        test_component_generation()
        test_page_generation()
        test_test_generation()
        test_validation()
        test_full_execution()

        print("=" * 70)
        print("✅ ALL TESTS PASSED (7/7)")
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

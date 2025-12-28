#!/usr/bin/env python3
"""
Test script for QA Owner Agent v1.0.0

Validates:
- Agent initialization
- Requirements parsing
- Artifact analysis
- Test execution (unit, integration, E2E)
- Security scanning
- Performance testing
- Zero-tolerance validation
- Decision making (approve/reject)
- Report generation

Author: SquadOS Meta-Framework
Date: 2025-12-27
"""

import json
import sys
from pathlib import Path

# Add agents directory to path
sys.path.insert(0, str(Path(__file__).parent / "agents"))

from qa_owner_agent import QAOwnerAgent


def test_initialization():
    """Test agent initialization"""
    print("🧪 Test 1: Agent Initialization")
    agent = QAOwnerAgent()

    assert agent.base_dir.exists(), "Base dir should exist"
    assert agent.qa_dir.exists(), "QA dir should exist"
    assert agent.reports_dir.exists(), "Reports dir should exist"
    assert agent.bugs_dir.exists(), "Bugs dir should exist"
    assert agent.approvals_dir.exists(), "Approvals dir should exist"

    # Check thresholds
    assert agent.thresholds['coverage_minimum'] == 80, "Coverage minimum should be 80%"
    assert agent.thresholds['coverage_target'] == 90, "Coverage target should be 90%"

    print("✅ PASS: Agent initialized correctly")
    print(f"   Base dir: {agent.base_dir}")
    print(f"   Coverage threshold: {agent.thresholds['coverage_minimum']}%")
    print()


def test_zero_tolerance_violations():
    """Test zero-tolerance violation detection"""
    print("🧪 Test 2: Zero-Tolerance Violations")
    agent = QAOwnerAgent()

    # Create fake artifacts with violations
    backend_dir = agent.artifacts_dir / "engenharia" / "backend"
    backend_dir.mkdir(parents=True, exist_ok=True)

    # Create file with TODO comment
    violation_file = backend_dir / "test.py"
    violation_file.write_text("# TODO: Implement this\npass", encoding='utf-8')

    artifacts = {
        'frontend': [],
        'backend': [violation_file],
        'tests': []
    }

    # Test unit test results (low coverage)
    unit_tests = {
        'total_tests': 10,
        'passed': 10,
        'failed': 0,
        'coverage': 70  # Below threshold
    }

    # Test security results (high vulnerabilities)
    security = {
        'vulnerabilities': {
            'critical': 1,
            'high': 2,
            'medium': 0,
            'low': 0
        },
        'secrets_exposed': 0
    }

    performance = {
        'api_response_time_p95': 350,
        'frontend_lcp': 1800
    }

    validation = agent._validate_zero_tolerance(
        'PROD-001',
        unit_tests,
        {'total_tests': 0, 'passed': 0, 'failed': 0},
        {'total_tests': 0, 'passed': 0, 'failed': 0},
        security,
        performance,
        artifacts
    )

    assert validation['total_violations'] > 0, "Should detect violations"
    assert not validation['zero_tolerance_compliant'], "Should not be compliant"

    # Check specific violations
    violation_types = [v['type'] for v in validation['violations']]
    assert 'low_test_coverage' in violation_types, "Should detect low coverage"
    assert 'critical_vulnerabilities' in violation_types, "Should detect critical vulnerabilities"
    assert 'todo_fixme_comments' in violation_types, "Should detect TODO comments"

    print(f"✅ PASS: Detected {validation['total_violations']} violations")
    for violation in validation['violations']:
        print(f"   - {violation['type']}: {violation['message']}")
    print()


def test_approval_decision():
    """Test approval decision (passing case)"""
    print("🧪 Test 3: Approval Decision (Passing)")
    agent = QAOwnerAgent()

    # Perfect validation (no violations)
    validation = {
        'violations': [],
        'zero_tolerance_compliant': True,
        'total_violations': 0
    }

    # All criteria met
    criteria_met = {
        'total': 3,
        'met': 3,
        'not_met': 0
    }

    decision = agent._make_decision(validation, criteria_met)

    assert decision['status'] == 'approved', "Should approve"
    assert decision['decision'] == 'APPROVED', "Decision should be APPROVED"
    assert decision['next_action'] == 'proceed_to_deploy', "Should proceed to deploy"
    assert len(decision['reasons']) > 0, "Should have approval reasons"

    print(f"✅ PASS: Approval decision correct")
    print(f"   Status: {decision['status']}")
    print(f"   Decision: {decision['decision']}")
    print(f"   Next action: {decision['next_action']}")
    print()


def test_rejection_decision():
    """Test rejection decision (failing case)"""
    print("🧪 Test 4: Rejection Decision (Failing)")
    agent = QAOwnerAgent()

    # Validation with violations
    validation = {
        'violations': [
            {'type': 'low_test_coverage', 'severity': 'high', 'message': 'Coverage 70% < 80%'},
            {'type': 'critical_vulnerabilities', 'severity': 'critical', 'message': '1 critical vulnerability'}
        ],
        'zero_tolerance_compliant': False,
        'total_violations': 2
    }

    # Some criteria not met
    criteria_met = {
        'total': 3,
        'met': 1,
        'not_met': 2
    }

    decision = agent._make_decision(validation, criteria_met)

    assert decision['status'] == 'rejected', "Should reject"
    assert decision['decision'] == 'REJECTED', "Decision should be REJECTED"
    assert decision['next_action'] == 'create_correction_card', "Should create correction card"
    assert len(decision['reasons']) > 0, "Should have rejection reasons"

    print(f"✅ PASS: Rejection decision correct")
    print(f"   Status: {decision['status']}")
    print(f"   Decision: {decision['decision']}")
    print(f"   Next action: {decision['next_action']}")
    print(f"   Reasons: {len(decision['reasons'])}")
    for reason in decision['reasons'][:3]:
        print(f"      - {reason}")
    print()


def test_report_generation():
    """Test report generation"""
    print("🧪 Test 5: Report Generation")
    agent = QAOwnerAgent()

    test_card = {
        'card_id': 'PROD-003',
        'title': 'Test Card',
        'acceptance_criteria': ['Criterion 1', 'Criterion 2']
    }

    unit_tests = {'total_tests': 10, 'passed': 10, 'failed': 0, 'coverage': 85}
    integration_tests = {'total_tests': 5, 'passed': 5, 'failed': 0}
    e2e_tests = {'total_tests': 3, 'passed': 3, 'failed': 0}
    security = {'vulnerabilities': {'critical': 0, 'high': 0, 'medium': 1, 'low': 2}}
    performance = {'api_response_time_p95': 350, 'frontend_lcp': 1800, 'frontend_fid': 80, 'frontend_cls': 0.05}
    validation = {'violations': [], 'zero_tolerance_compliant': True, 'total_violations': 0}
    criteria_met = {'total': 2, 'met': 2, 'not_met': 0}
    decision = {'status': 'approved', 'decision': 'APPROVED', 'reasons': ['All tests passed'], 'next_action': 'proceed_to_deploy'}

    report = agent._generate_report(
        'PROD-003',
        test_card,
        unit_tests,
        integration_tests,
        e2e_tests,
        security,
        performance,
        validation,
        criteria_met,
        decision
    )

    assert report.exists(), "Report file should exist"
    assert report.stat().st_size > 0, "Report should have content"

    # Check report content
    content = report.read_text(encoding='utf-8')
    assert '# QA Report - PROD-003' in content, "Should have title"
    assert 'APPROVED' in content, "Should include decision"
    assert 'Coverage: 85%' in content, "Should include coverage"
    assert 'proceed_to_deploy' in content, "Should include next action"

    print(f"✅ PASS: Report generated successfully")
    print(f"   File: {report.name} ({report.stat().st_size} bytes)")
    print()


def test_artifact_analysis():
    """Test artifact analysis"""
    print("🧪 Test 6: Artifact Analysis")
    agent = QAOwnerAgent()

    # Create fake artifacts
    frontend_dir = agent.artifacts_dir / "engenharia" / "frontend"
    backend_dir = agent.artifacts_dir / "engenharia" / "backend"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    backend_dir.mkdir(parents=True, exist_ok=True)

    # Create files
    (frontend_dir / "component.tsx").write_text("export function Component() {}", encoding='utf-8')
    (backend_dir / "handler.go").write_text("package api", encoding='utf-8')
    (frontend_dir / "component.test.tsx").write_text("describe('Component', () => {})", encoding='utf-8')

    test_card = {'card_id': 'PROD-003'}
    artifacts = agent._analyze_artifacts('PROD-003', test_card)

    assert 'frontend' in artifacts, "Should have frontend artifacts"
    assert 'backend' in artifacts, "Should have backend artifacts"
    assert 'tests' in artifacts, "Should have test artifacts"
    assert len(artifacts['frontend']) > 0, "Should find frontend files"
    assert len(artifacts['backend']) > 0, "Should find backend files"
    assert len(artifacts['tests']) > 0, "Should find test files"

    print(f"✅ PASS: Artifact analysis working correctly")
    print(f"   Frontend files: {len(artifacts['frontend'])}")
    print(f"   Backend files: {len(artifacts['backend'])}")
    print(f"   Test files: {len(artifacts['tests'])}")
    print()


def test_full_execution_approved():
    """Test full card execution (approved)"""
    print("🧪 Test 7: Full Card Execution (Approved)")
    agent = QAOwnerAgent()

    # Clear any existing checkpoints
    checkpoint_file = agent.checkpoints_dir / "PROD-003_qa.json"
    if checkpoint_file.exists():
        checkpoint_file.unlink()

    # Clean up violation file from Test 2
    violation_file = agent.artifacts_dir / "engenharia" / "backend" / "test.py"
    if violation_file.exists():
        violation_file.unlink()

    # Create minimal artifacts (clean, no violations)
    frontend_dir = agent.artifacts_dir / "engenharia" / "frontend"
    backend_dir = agent.artifacts_dir / "engenharia" / "backend"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    backend_dir.mkdir(parents=True, exist_ok=True)

    (frontend_dir / "component.tsx").write_text("export function Component() {}", encoding='utf-8')
    (backend_dir / "handler.go").write_text("package api", encoding='utf-8')
    (frontend_dir / "component.test.tsx").write_text("describe('Component', () => {})", encoding='utf-8')

    test_card = {
        'card_id': 'PROD-003',
        'title': 'Test Card',
        'requirement_ids': ['RF001'],
        'acceptance_criteria': [
            'Component renders correctly',
            'API responds successfully',
            'Tests pass with ≥80% coverage'
        ]
    }

    result = agent.execute_card('PROD-003', test_card)

    assert result['status'] == 'approved', f"Execution should be approved (got: {result['status']})"
    assert result['decision'] == 'APPROVED', "Decision should be APPROVED"
    assert result['next_action'] == 'proceed_to_deploy', "Should proceed to deploy"
    assert 'report_path' in result, "Should generate report"

    print(f"✅ PASS: Full execution completed with approval")
    print(f"   Status: {result['status']}")
    print(f"   Decision: {result['decision']}")
    print(f"   Next action: {result['next_action']}")
    print(f"   Time: {result['elapsed_time']:.2f}s")
    print()


def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("🚀 QA Owner Agent - Test Suite")
    print("=" * 70)
    print()

    try:
        test_initialization()
        test_zero_tolerance_violations()
        test_approval_decision()
        test_rejection_decision()
        test_report_generation()
        test_artifact_analysis()
        test_full_execution_approved()

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

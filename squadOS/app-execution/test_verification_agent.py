#!/usr/bin/env python3
"""
Test Suite for Verification Agent

Validates obra ow-002 enforcement:
- Red flag detection
- Evidence validation
- Test output parsing
- Lint output parsing
- Build output parsing
- Coverage validation

Author: SquadOS Testing Suite
Version: 1.0.0
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agents.verification_agent import VerificationAgent, validate_card_completion


def test_red_flag_detection_hedging():
    """Test detection of hedging language (obra ow-002 violation)"""
    print("=" * 80)
    print("TEST 1: Red Flag Detection - Hedging Language")
    print("=" * 80)

    agent = VerificationAgent()

    # Claims with hedging language
    hedging_claims = [
        "Tests should pass",
        "Linting probably works",
        "Build seems to be working",
        "Coverage looks good",
        "I think the tests pass",
        "Maybe the build succeeded",
    ]

    for claim in hedging_claims:
        result = agent.validate_completion_claim(
            card_id='TEST-001',
            claim=claim,
            evidence={'test_output': 'some output', 'lint_output': 'some output'}
        )

        assert result['approved'] is False, f"Should reject hedging claim: {claim}"
        assert len(result.get('red_flags', [])) > 0, f"Should detect red flags in: {claim}"
        print(f"✅ Correctly rejected: \"{claim}\"")

    print()
    return True


def test_red_flag_detection_premature():
    """Test detection of premature satisfaction (obra ow-002 violation)"""
    print("=" * 80)
    print("TEST 2: Red Flag Detection - Premature Satisfaction")
    print("=" * 80)

    agent = VerificationAgent()

    # Claims with premature satisfaction
    premature_claims = [
        "Great! All done!",
        "Perfect! Tests pass!",
        "Done! Everything works!",
        "Success! Build complete!",
    ]

    for claim in premature_claims:
        result = agent.validate_completion_claim(
            card_id='TEST-002',
            claim=claim,
            evidence={'test_output': 'some output'}
        )

        assert result['approved'] is False, f"Should reject premature claim: {claim}"
        assert len(result.get('red_flags', [])) > 0, f"Should detect red flags in: {claim}"
        print(f"✅ Correctly rejected: \"{claim}\"")

    print()
    return True


def test_missing_evidence_detection():
    """Test detection of missing evidence"""
    print("=" * 80)
    print("TEST 3: Missing Evidence Detection")
    print("=" * 80)

    agent = VerificationAgent()

    # Claim requires test evidence, but none provided
    result = agent.validate_completion_claim(
        card_id='TEST-003',
        claim='All tests passing',
        evidence={}
    )

    assert result['approved'] is False
    assert 'test_output' in result['missing_evidence']
    print("✅ Detected missing test_output")

    # Claim requires lint evidence, but none provided
    result = agent.validate_completion_claim(
        card_id='TEST-004',
        claim='Linting clean',
        evidence={}
    )

    assert result['approved'] is False
    assert 'lint_output' in result['missing_evidence']
    print("✅ Detected missing lint_output")

    print()
    return True


def test_valid_test_output_pytest():
    """Test validation of valid pytest output"""
    print("=" * 80)
    print("TEST 4: Valid Test Output - pytest")
    print("=" * 80)

    agent = VerificationAgent()

    pytest_output = """
============================= test session starts ==============================
platform darwin -- Python 3.11.5, pytest-7.4.0, pluggy-1.2.0
collected 42 items

tests/test_oracle.py::test_create_oracle PASSED                          [  2%]
tests/test_oracle.py::test_list_oracles PASSED                           [  4%]
tests/test_objects.py::test_create_object PASSED                         [ 98%]
tests/test_objects.py::test_validate_object PASSED                      [100%]

============================== 42 passed in 3.21s ===============================
    """

    result = agent.validate_completion_claim(
        card_id='TEST-005',
        claim='All tests passing',
        evidence={'test_output': pytest_output}
    )

    assert result['approved'] is True
    print(f"✅ Approved valid pytest output")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_failed_test_output_pytest():
    """Test detection of failed pytest tests"""
    print("=" * 80)
    print("TEST 5: Failed Test Output - pytest")
    print("=" * 80)

    agent = VerificationAgent()

    pytest_output = """
============================= test session starts ==============================
collected 42 items

tests/test_oracle.py::test_create_oracle PASSED                          [  2%]
tests/test_oracle.py::test_list_oracles FAILED                           [  4%]
tests/test_objects.py::test_create_object PASSED                         [ 98%]

============================== 5 failed, 37 passed in 3.21s =====================
    """

    result = agent.validate_completion_claim(
        card_id='TEST-006',
        claim='All tests passing',
        evidence={'test_output': pytest_output}
    )

    assert result['approved'] is False
    print(f"✅ Correctly rejected failed tests")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_valid_lint_output_eslint():
    """Test validation of valid eslint output"""
    print("=" * 80)
    print("TEST 6: Valid Lint Output - ESLint")
    print("=" * 80)

    agent = VerificationAgent()

    eslint_output = """
> eslint src/

✨  Done in 2.13s.
    """

    result = agent.validate_completion_claim(
        card_id='TEST-007',
        claim='Linting clean',
        evidence={'lint_output': {'output': eslint_output, 'exit_code': 0}}
    )

    assert result['approved'] is True
    print(f"✅ Approved clean lint output")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_failed_lint_output_eslint():
    """Test detection of eslint errors"""
    print("=" * 80)
    print("TEST 7: Failed Lint Output - ESLint")
    print("=" * 80)

    agent = VerificationAgent()

    eslint_output = """
/Users/project/src/oracle.ts
  23:15  error  'foo' is never reassigned. Use 'const' instead  prefer-const
  45:8   error  'bar' is defined but never used                 no-unused-vars

✖ 2 errors
    """

    result = agent.validate_completion_claim(
        card_id='TEST-008',
        claim='Linting clean',
        evidence={'lint_output': eslint_output}
    )

    assert result['approved'] is False
    print(f"✅ Correctly rejected lint errors")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_valid_build_output():
    """Test validation of successful build"""
    print("=" * 80)
    print("TEST 8: Valid Build Output")
    print("=" * 80)

    agent = VerificationAgent()

    build_output = """
> npm run build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  42.3 kB  build/static/js/main.a1b2c3d4.js
  1.2 kB   build/static/css/main.e5f6g7h8.css

The build folder is ready to be deployed.
    """

    result = agent.validate_completion_claim(
        card_id='TEST-009',
        claim='Build successful',
        evidence={'build_output': build_output}
    )

    assert result['approved'] is True
    print(f"✅ Approved successful build")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_failed_build_output():
    """Test detection of build failures"""
    print("=" * 80)
    print("TEST 9: Failed Build Output")
    print("=" * 80)

    agent = VerificationAgent()

    build_output = """
> npm run build

Creating an optimized production build...
Failed to compile.

./src/components/Oracle.tsx
Module not found: Can't resolve './OracleAPI' in '/Users/project/src/components'

ERROR in ./src/components/Oracle.tsx 12:0-42
    """

    result = agent.validate_completion_claim(
        card_id='TEST-010',
        claim='Build successful',
        evidence={'build_output': build_output}
    )

    assert result['approved'] is False
    print(f"✅ Correctly rejected failed build")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_valid_coverage():
    """Test validation of sufficient coverage"""
    print("=" * 80)
    print("TEST 10: Valid Coverage (≥80%)")
    print("=" * 80)

    agent = VerificationAgent()

    coverage_output = """
---------- coverage: platform darwin, python 3.11.5-final-0 ----------
Name                     Stmts   Miss  Cover
--------------------------------------------
src/oracle.py              156     12    92%
src/objects.py             203     18    91%
src/validators.py           89      8    91%
--------------------------------------------
TOTAL                      448     38    85%
    """

    result = agent.validate_completion_claim(
        card_id='TEST-011',
        claim='Coverage at 85%',
        evidence={'coverage_output': coverage_output}
    )

    assert result['approved'] is True
    print(f"✅ Approved coverage ≥80%")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_insufficient_coverage():
    """Test detection of insufficient coverage"""
    print("=" * 80)
    print("TEST 11: Insufficient Coverage (<80%)")
    print("=" * 80)

    agent = VerificationAgent()

    coverage_output = """
---------- coverage: platform darwin, python 3.11.5-final-0 ----------
Name                     Stmts   Miss  Cover
--------------------------------------------
src/oracle.py              156     52    67%
src/objects.py             203     88    57%
--------------------------------------------
TOTAL                      359    140    61%
    """

    result = agent.validate_completion_claim(
        card_id='TEST-012',
        claim='Coverage complete',
        evidence={'coverage_output': coverage_output}
    )

    assert result['approved'] is False
    print(f"✅ Correctly rejected low coverage")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_full_validation_pipeline_pass():
    """Test complete validation pipeline with all evidence passing"""
    print("=" * 80)
    print("TEST 12: Full Pipeline - All Evidence Passing")
    print("=" * 80)

    agent = VerificationAgent()

    result = agent.validate_completion_claim(
        card_id='TEST-013',
        claim='All tests passing, lint clean, build successful, coverage 85%',
        evidence={
            'test_output': """
============================= test session starts ==============================
collected 42 items
============================== 42 passed in 3.21s ===============================
            """,
            'lint_output': {'output': '✨  Done in 2.13s.', 'exit_code': 0},
            'build_output': 'Compiled successfully.',
            'coverage_output': 'TOTAL    448     38    85%'
        }
    )

    assert result['approved'] is True
    print(f"✅ Full pipeline APPROVED")
    print(f"   Validated: test_output, lint_output, build_output, coverage_output")

    print()
    return True


def test_full_validation_pipeline_fail():
    """Test complete validation pipeline with one evidence failing"""
    print("=" * 80)
    print("TEST 13: Full Pipeline - One Evidence Failing")
    print("=" * 80)

    agent = VerificationAgent()

    result = agent.validate_completion_claim(
        card_id='TEST-014',
        claim='All tests passing, lint clean, build successful',
        evidence={
            'test_output': '====== 42 passed in 3.21s =======',
            'lint_output': '✖ 2 errors',  # FAILING
            'build_output': 'Compiled successfully.'
        }
    )

    assert result['approved'] is False
    print(f"✅ Full pipeline REJECTED (lint errors)")
    print(f"   Reason: {result['reason']}")

    print()
    return True


def test_convenience_function():
    """Test convenience function for Celery task integration"""
    print("=" * 80)
    print("TEST 14: Convenience Function (validate_card_completion)")
    print("=" * 80)

    result = validate_card_completion(
        card_id='TEST-015',
        claim='Tests passing',
        evidence={'test_output': '====== 42 passed in 3.21s ======='}
    )

    assert 'approved' in result
    assert 'reason' in result
    assert 'feedback' in result
    print(f"✅ Convenience function works")
    print(f"   Result: {result['approved']}")

    print()
    return True


def run_all_tests():
    """Run all test cases"""
    print("\n" + "=" * 80)
    print("VERIFICATION AGENT TEST SUITE")
    print("=" * 80 + "\n")

    tests = [
        ("Red Flag Detection - Hedging", test_red_flag_detection_hedging),
        ("Red Flag Detection - Premature", test_red_flag_detection_premature),
        ("Missing Evidence Detection", test_missing_evidence_detection),
        ("Valid Test Output - pytest", test_valid_test_output_pytest),
        ("Failed Test Output - pytest", test_failed_test_output_pytest),
        ("Valid Lint Output - ESLint", test_valid_lint_output_eslint),
        ("Failed Lint Output - ESLint", test_failed_lint_output_eslint),
        ("Valid Build Output", test_valid_build_output),
        ("Failed Build Output", test_failed_build_output),
        ("Valid Coverage (≥80%)", test_valid_coverage),
        ("Insufficient Coverage (<80%)", test_insufficient_coverage),
        ("Full Pipeline - All Passing", test_full_validation_pipeline_pass),
        ("Full Pipeline - One Failing", test_full_validation_pipeline_fail),
        ("Convenience Function", test_convenience_function),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except AssertionError as e:
            print(f"❌ Test failed: {test_name}")
            print(f"   Error: {e}\n")
            failed += 1
        except Exception as e:
            print(f"❌ Test errored: {test_name}")
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
    success = run_all_tests()
    sys.exit(0 if success else 1)

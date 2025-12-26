#!/usr/bin/env python3
"""
Test suite for Verification Agent

Tests obra ow-002 (Verification-Before-Completion) enforcement:
- Red flag detection
- Missing evidence detection
- Evidence validation (tests, lint, build, coverage)
- Approval/rejection logic

Usage:
    python3 test_verification_agent.py

Expected Results:
    ✅ All 10 test cases pass
    ✅ Red flags detected correctly
    ✅ Missing evidence rejected
    ✅ Failed tests rejected
    ✅ Valid evidence approved
"""

import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.verification_agent import VerificationAgent

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestVerificationAgent:
    """Test suite for VerificationAgent"""

    def __init__(self):
        self.agent = VerificationAgent()
        self.tests_passed = 0
        self.tests_failed = 0

    def run_all_tests(self):
        """Run all test cases"""
        logger.info("=" * 80)
        logger.info("🧪 Testing Verification Agent (obra ow-002)")
        logger.info("=" * 80)

        # Test 1: Red flags - Hedging language
        self.test_reject_hedging_language()

        # Test 2: Red flags - Premature satisfaction
        self.test_reject_premature_satisfaction()

        # Test 3: Missing evidence - No test output
        self.test_reject_missing_test_output()

        # Test 4: Missing evidence - No lint output
        self.test_reject_missing_lint_output()

        # Test 5: Failed validation - Tests failed
        self.test_reject_failed_tests()

        # Test 6: Failed validation - Linting errors
        self.test_reject_linting_errors()

        # Test 7: Failed validation - Build failed
        self.test_reject_build_failed()

        # Test 8: Failed validation - Low coverage
        self.test_reject_low_coverage()

        # Test 9: Approval - Tests pass
        self.test_approve_valid_tests()

        # Test 10: Approval - Tests + Lint pass
        self.test_approve_valid_tests_and_lint()

        # Summary
        self.print_summary()

    def assert_true(self, condition, message):
        """Assert condition is true"""
        if condition:
            logger.info(f"  ✅ {message}")
            self.tests_passed += 1
        else:
            logger.error(f"  ❌ {message}")
            self.tests_failed += 1
            raise AssertionError(f"Test failed: {message}")

    def assert_false(self, condition, message):
        """Assert condition is false"""
        self.assert_true(not condition, message)

    # Test Cases

    def test_reject_hedging_language(self):
        """Test 1: Reject claims with hedging language"""
        logger.info("\n🔹 Test 1: Reject hedging language")

        result = self.agent.validate_completion_claim(
            card_id='TEST-001',
            claim='Tests should pass now',
            evidence={}
        )

        self.assert_false(result['approved'], "Hedging claim rejected")
        self.assert_true('should' in str(result.get('red_flags', [])).lower(), "Red flag 'should' detected")
        logger.info(f"  Feedback: {result['feedback'][:100]}...")

    def test_reject_premature_satisfaction(self):
        """Test 2: Reject premature satisfaction without evidence"""
        logger.info("\n🔹 Test 2: Reject premature satisfaction")

        result = self.agent.validate_completion_claim(
            card_id='TEST-002',
            claim='Done! Everything works great!',
            evidence={}
        )

        self.assert_false(result['approved'], "Premature satisfaction rejected")
        self.assert_true(len(result.get('red_flags', [])) > 0, "Red flags detected")
        logger.info(f"  Red flags: {result.get('red_flags')}")

    def test_reject_missing_test_output(self):
        """Test 3: Reject missing test output"""
        logger.info("\n🔹 Test 3: Reject missing test output")

        result = self.agent.validate_completion_claim(
            card_id='TEST-003',
            claim='All tests pass',
            evidence={}  # No evidence provided
        )

        self.assert_false(result['approved'], "Missing evidence rejected")
        self.assert_true('test_output' in result.get('missing_evidence', []), "Missing test_output identified")
        logger.info(f"  Missing: {result.get('missing_evidence')}")

    def test_reject_missing_lint_output(self):
        """Test 4: Reject missing lint output"""
        logger.info("\n🔹 Test 4: Reject missing lint output")

        result = self.agent.validate_completion_claim(
            card_id='TEST-004',
            claim='Code is clean and linting passes',
            evidence={}
        )

        self.assert_false(result['approved'], "Missing lint evidence rejected")
        self.assert_true('lint_output' in result.get('missing_evidence', []), "Missing lint_output identified")

    def test_reject_failed_tests(self):
        """Test 5: Reject when tests fail"""
        logger.info("\n🔹 Test 5: Reject failed tests")

        failed_test_output = """
$ pytest tests/

tests/test_auth.py::test_login PASSED
tests/test_auth.py::test_logout FAILED
tests/test_auth.py::test_refresh PASSED

==================== 1 failed, 2 passed in 1.23s ====================
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-005',
            claim='Tests pass',
            evidence={
                'test_output': {'output': failed_test_output, 'exit_code': 1}
            }
        )

        self.assert_false(result['approved'], "Failed tests rejected")
        logger.info(f"  Reason: {result['reason']}")

    def test_reject_linting_errors(self):
        """Test 6: Reject when linting has errors"""
        logger.info("\n🔹 Test 6: Reject linting errors")

        lint_output = """
$ npm run lint

src/components/Auth.tsx
  12:5  error  'user' is assigned a value but never used  @typescript-eslint/no-unused-vars
  23:1  error  Missing semicolon                           semi

✖ 2 errors found
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-006',
            claim='Linting clean',
            evidence={
                'lint_output': {'output': lint_output, 'exit_code': 1}
            }
        )

        self.assert_false(result['approved'], "Linting errors rejected")

    def test_reject_build_failed(self):
        """Test 7: Reject when build fails"""
        logger.info("\n🔹 Test 7: Reject build failure")

        build_output = """
$ npm run build

> build
> vite build

vite v5.0.0 building for production...
✓ 42 modules transformed.
x Build failed in 1.23s
error during build:
Error: Could not resolve './missing-file'
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-007',
            claim='Build successful',
            evidence={
                'build_output': {'output': build_output, 'exit_code': 1}
            }
        )

        self.assert_false(result['approved'], "Build failure rejected")

    def test_reject_low_coverage(self):
        """Test 8: Reject when coverage <80%"""
        logger.info("\n🔹 Test 8: Reject low coverage")

        coverage_output = """
$ pytest --cov=src tests/

tests/test_auth.py::test_login PASSED
tests/test_auth.py::test_logout PASSED

---------- coverage: platform darwin, python 3.11 -----------
Name                 Stmts   Miss  Cover
----------------------------------------
src/__init__.py          2      0   100%
src/auth.py            120     45    62%
src/models.py           80     20    75%
----------------------------------------
TOTAL                  202     65    68%
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-008',
            claim='Tests pass with ≥80% coverage',
            evidence={
                'test_output': {'output': coverage_output, 'exit_code': 0},
                'coverage_output': {'output': coverage_output}
            }
        )

        self.assert_false(result['approved'], "Low coverage rejected")
        logger.info(f"  Coverage detected: 68% (minimum: 80%)")

    def test_approve_valid_tests(self):
        """Test 9: Approve when tests pass"""
        logger.info("\n🔹 Test 9: Approve valid tests")

        test_output = """
$ npm test

 PASS  src/components/Auth.test.tsx
  ✓ renders login form (42ms)
  ✓ handles valid credentials (38ms)
  ✓ handles invalid credentials (51ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.456 s

Exit code: 0
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-009',
            claim='Tests pass',
            evidence={
                'test_output': {'output': test_output, 'exit_code': 0}
            }
        )

        self.assert_true(result['approved'], "Valid tests approved")
        logger.info(f"  ✅ Feedback:\n{result['feedback']}")

    def test_approve_valid_tests_and_lint(self):
        """Test 10: Approve when tests + lint pass"""
        logger.info("\n🔹 Test 10: Approve tests + lint")

        test_output = """
$ pytest tests/

tests/test_auth.py::test_login PASSED
tests/test_auth.py::test_logout PASSED
tests/test_auth.py::test_refresh PASSED

==================== 3 passed in 1.23s ====================
"""

        lint_output = """
$ npm run lint

> lint
> eslint . --ext .ts,.tsx

✓ No issues found
"""

        result = self.agent.validate_completion_claim(
            card_id='TEST-010',
            claim='Tests pass and linting clean',
            evidence={
                'test_output': {'output': test_output, 'exit_code': 0},
                'lint_output': {'output': lint_output, 'exit_code': 0}
            }
        )

        self.assert_true(result['approved'], "Valid tests + lint approved")
        logger.info(f"  Validation results:")
        for ev_type, ev_result in result.get('validation_results', {}).items():
            logger.info(f"    - {ev_type}: {ev_result.get('details')}")

    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "=" * 80)
        logger.info("📊 Test Summary")
        logger.info("=" * 80)

        total = self.tests_passed + self.tests_failed
        logger.info(f"  Total tests: {total}")
        logger.info(f"  ✅ Passed: {self.tests_passed}")
        logger.info(f"  ❌ Failed: {self.tests_failed}")

        if self.tests_failed == 0:
            logger.info("\n🎉 ALL TESTS PASSED")
            logger.info("✅ Verification Agent is working correctly")
            logger.info("✅ obra ow-002 enforcement validated")
            return True
        else:
            logger.error(f"\n❌ {self.tests_failed} TEST(S) FAILED")
            return False


if __name__ == '__main__':
    try:
        test_suite = TestVerificationAgent()
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    except AssertionError as e:
        logger.error(f"\n❌ Test assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        sys.exit(1)

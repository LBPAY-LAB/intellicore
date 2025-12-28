#!/usr/bin/env python3
"""
Test suite for DebuggingAgent (obra ow-006)

Tests 4-phase debugging methodology, red flag detection, escalation logic.

Usage:
    python3 test_debugging_agent.py

Expected Results:
    ✅ All 8 test cases pass
    ✅ Phase enforcement works
    ✅ Red flag detection accurate
    ✅ Escalation triggers at attempt #3
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.debugging_agent import DebuggingAgent

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestDebuggingAgent:
    """Test suite for DebuggingAgent"""

    def __init__(self):
        self.agent = DebuggingAgent()
        self.tests_passed = 0
        self.tests_failed = 0

    def run_all_tests(self):
        """Run all test cases"""
        logger.info("=" * 80)
        logger.info("🧪 Testing DebuggingAgent (obra ow-006)")
        logger.info("=" * 80)

        # Test 1: Phase enforcement (no investigation)
        self.test_phase_enforcement_no_investigation()

        # Test 2: Red flag detection (guessing)
        self.test_red_flag_guessing()

        # Test 3: Red flag detection (bundled changes)
        self.test_red_flag_bundled_changes()

        # Test 4: Test-first enforcement
        self.test_test_first_enforcement()

        # Test 5: Escalation after 3 attempts
        self.test_escalation_after_3_attempts()

        # Test 6: Successful 4-phase flow
        self.test_successful_4_phase_flow()

        # Test 7: Force back to Phase 1 (missing Phase 2)
        self.test_force_back_to_phase1()

        # Test 8: Graceful degradation (no LLM)
        self.test_graceful_degradation_no_llm()

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

    def assert_equals(self, actual, expected, message):
        """Assert values are equal"""
        if actual == expected:
            logger.info(f"  ✅ {message}")
            self.tests_passed += 1
        else:
            logger.error(f"  ❌ {message}")
            logger.error(f"     Expected: {expected}")
            logger.error(f"     Actual: {actual}")
            self.tests_failed += 1
            raise AssertionError(f"Test failed: {message}")

    def assert_in(self, substring, text, message):
        """Assert substring in text"""
        if substring.lower() in text.lower():
            logger.info(f"  ✅ {message}")
            self.tests_passed += 1
        else:
            logger.error(f"  ❌ {message}")
            logger.error(f"     Expected '{substring}' in text")
            logger.error(f"     Text: {text[:200]}...")
            self.tests_failed += 1
            raise AssertionError(f"Test failed: {message}")

    # Test Cases

    def test_phase_enforcement_no_investigation(self):
        """Test 1: Agent rejects fix without investigation"""
        logger.info("\n🔹 Test 1: Phase enforcement (no investigation)")

        result = self.agent.debug_issue(
            card_id='BUG-001',
            bug_description='Login fails with 401',
            # No error_logs or stack_trace
        )

        self.assert_equals(result['phase'], 1, "Phase is 1 (investigation required)")
        self.assert_true(result['investigation'] is None, "Investigation is None")
        self.assert_in('provide evidence', result['next_action'], "Asks for evidence")
        self.assert_in('error logs', result['next_action'], "Mentions error logs")
        self.assert_in('stack trace', result['next_action'], "Mentions stack trace")

        logger.info(f"  Next action: {result['next_action'][:150]}...")

    def test_red_flag_guessing(self):
        """Test 2: Detect guess-and-check patterns"""
        logger.info("\n🔹 Test 2: Red flag detection (guessing)")

        bug_description = """
        Maybe it's an encoding issue?
        We could try adding timeout.
        Probably case sensitivity problem.
        """

        result = self.agent.debug_issue(
            card_id='BUG-002',
            bug_description=bug_description,
            error_logs='Error: 401 Unauthorized',
        )

        self.assert_true(len(result['red_flags']) >= 3, f"Detected {len(result['red_flags'])} red flags")
        self.assert_true(
            any('guessing' in flag.lower() for flag in result['red_flags']),
            "Detected guessing pattern"
        )

        logger.info(f"  Red flags: {result['red_flags']}")

    def test_red_flag_bundled_changes(self):
        """Test 3: Detect bundled changes"""
        logger.info("\n🔹 Test 3: Red flag detection (bundled changes)")

        minimal_change = """
        password = password.encode('utf-8')  # Fix encoding
        username = username.lower()          # And also fix case
        return authenticate(username, password, timeout=30)  # While we're at it
        """

        red_flags = self.agent._detect_red_flags_in_text(minimal_change)

        self.assert_true(len(red_flags) >= 2, f"Detected {len(red_flags)} red flags")
        self.assert_true(
            any('bundled' in flag.lower() for flag in red_flags),
            "Detected bundled changes"
        )

        logger.info(f"  Red flags: {red_flags}")

    def test_test_first_enforcement(self):
        """Test 4: Failing test required before fix"""
        logger.info("\n🔹 Test 4: Test-first enforcement")

        # Simulate Phase 4 without test case
        investigation = {'root_cause': 'LIKE query with wildcard'}
        pattern_analysis = {'differences': [{'line': 1, 'working': 'exact match', 'broken': 'LIKE'}]}
        hypothesis = {'hypothesis': 'find_by_email uses LIKE', 'minimal_change': 'Change to =='}

        result = self.agent.debug_issue(
            card_id='BUG-003',
            bug_description='User search broken',
            phase=4,
            investigation=investigation,
            pattern_analysis=pattern_analysis,
            hypothesis=hypothesis,
            test_case=None,  # RED FLAG: No test
        )

        self.assert_equals(result['phase'], 4, "Phase is 4")
        self.assert_true(result['test_case'] is None, "Test case is None")
        self.assert_in('failing test case before', result['next_action'], "Requires test first")
        self.assert_in('write failing test', result['next_action'], "Mentions write test")

        logger.info(f"  Next action: {result['next_action'][:150]}...")

    def test_escalation_after_3_attempts(self):
        """Test 5: Escalate to Tech Lead after 3 failed fixes"""
        logger.info("\n🔹 Test 5: Escalation after 3 attempts")

        # Simulate 3 failed fix attempts
        for attempt in range(1, 4):
            result = self.agent.debug_issue(
                card_id='BUG-004',
                bug_description='Payment processing fails',
                attempt_count=attempt,
            )

            if attempt < 3:
                self.assert_false(result['escalate'], f"Attempt {attempt}: No escalation")
            else:
                self.assert_true(result['escalate'], f"Attempt {attempt}: Escalation triggered")
                self.assert_in('tech lead', result['next_action'], "Mentions Tech Lead")
                self.assert_in('architectural review', result['next_action'], "Mentions architecture")

                logger.info(f"  Attempt {attempt}: Escalated ✅")
                logger.info(f"  Next action: {result['next_action'][:150]}...")

    def test_successful_4_phase_flow(self):
        """Test 6: Complete 4-phase flow with successful fix"""
        logger.info("\n🔹 Test 6: Successful 4-phase flow")

        # Phase 1: Investigation
        result_p1 = self.agent.debug_issue(
            card_id='BUG-005',
            bug_description='Login fails with 401',
            error_logs='Error: authenticate() returns None',
            stack_trace='at User.find_by_email (user.py:45)',
            phase=1,
        )
        self.assert_equals(result_p1['phase'], 1, "Phase 1 completed")
        self.assert_true(result_p1['investigation'] is not None, "Investigation present")
        self.assert_true(result_p1['root_cause'] is not None, "Root cause present")
        logger.info(f"  Phase 1: Root cause = {result_p1['root_cause']}")

        # Phase 2: Pattern Analysis
        result_p2 = self.agent.debug_issue(
            card_id='BUG-005',
            bug_description='Login fails with 401',
            phase=2,
            investigation=result_p1['investigation'],
            working_code='db.query(User).filter(User.username == username).first()',
            broken_code='db.query(User).filter(User.email.like(f"%{email}%")).first()',
        )
        self.assert_equals(result_p2['phase'], 2, "Phase 2 completed")
        self.assert_true(result_p2['pattern_analysis'] is not None, "Pattern analysis present")
        logger.info(f"  Phase 2: {len(result_p2['pattern_analysis']['differences'])} differences found")

        # Phase 3: Hypothesis Testing
        result_p3 = self.agent.debug_issue(
            card_id='BUG-005',
            bug_description='Login fails with 401',
            phase=3,
            investigation=result_p1['investigation'],
            pattern_analysis=result_p2['pattern_analysis'],
            hypothesis='find_by_email uses LIKE instead of exact match',
            minimal_change='Change .like() to ==',
        )
        self.assert_equals(result_p3['phase'], 3, "Phase 3 completed")
        self.assert_true(result_p3['hypothesis'] is not None, "Hypothesis present")
        logger.info(f"  Phase 3: Hypothesis = {result_p3['hypothesis']['hypothesis']}")

        # Phase 4: Implementation
        result_p4 = self.agent.debug_issue(
            card_id='BUG-005',
            bug_description='Login fails with 401',
            phase=4,
            investigation=result_p1['investigation'],
            pattern_analysis=result_p2['pattern_analysis'],
            hypothesis=result_p3['hypothesis'],
            test_case='def test_find_by_email_exact_match(): ...',
            fix={'code': 'db.query(User).filter(User.email == email).first()'},
            tests_passing=True,
        )
        self.assert_equals(result_p4['phase'], 4, "Phase 4 completed")
        self.assert_true(result_p4['fix'] is not None, "Fix present")
        self.assert_in('fix ready', result_p4['next_action'], "Fix ready for verification")
        logger.info(f"  Phase 4: Fix ready ✅")

    def test_force_back_to_phase1(self):
        """Test 7: Force back to Phase 1 when skipping phases"""
        logger.info("\n🔹 Test 7: Force back to Phase 1 (missing investigation)")

        # Try Phase 2 without Phase 1
        result = self.agent.debug_issue(
            card_id='BUG-006',
            bug_description='API timeout',
            phase=2,
            # No investigation provided
        )

        self.assert_equals(result['phase'], 1, "Forced back to Phase 1")
        self.assert_in('phase 2 requires phase 1', result['next_action'], "Explains why")
        self.assert_true(result['metadata'].get('forced_phase1'), "Metadata shows forced")

        logger.info(f"  Next action: {result['next_action'][:150]}...")

    def test_graceful_degradation_no_llm(self):
        """Test 8: Agent provides guidance even without LLM"""
        logger.info("\n🔹 Test 8: Graceful degradation (no LLM)")

        # Create agent with no LLM client
        agent_no_llm = DebuggingAgent()
        agent_no_llm.llm_client = None

        result = agent_no_llm.debug_issue(
            card_id='BUG-007',
            bug_description='App crashes on startup',
        )

        # Should provide obra ow-006 checklist
        self.assert_equals(result['phase'], 1, "Phase is 1")
        self.assert_in('provide evidence', result['next_action'], "Provides checklist")
        self.assert_in('error logs', result['next_action'], "Mentions error logs")
        self.assert_in('stack trace', result['next_action'], "Mentions stack trace")
        self.assert_false(result['metadata'].get('llm_used', False), "LLM not used")

        logger.info(f"  Next action: {result['next_action'][:150]}...")

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
            logger.info("✅ DebuggingAgent is working correctly")
            logger.info("✅ 4-phase methodology enforced")
            logger.info("✅ Red flag detection working")
            logger.info("✅ Escalation logic validated")
            logger.info("✅ Test-first enforcement working")
            logger.info("✅ obra ow-006 implementation complete")
            return True
        else:
            logger.error(f"\n❌ {self.tests_failed} TEST(S) FAILED")
            return False


if __name__ == '__main__':
    try:
        test_suite = TestDebuggingAgent()
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    except AssertionError as e:
        logger.error(f"\n❌ Test assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        sys.exit(1)

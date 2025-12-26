#!/usr/bin/env python3
"""
Test suite for LLM-as-Judge Agent

Tests rubric loading, evaluation, scoring, and feedback generation.

Usage:
    python3 test_llm_judge_agent.py

Expected Results:
    ✅ All 8 test cases pass
    ✅ Rubric loading works
    ✅ Score calculation correct
    ✅ Feedback generation accurate
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.llm_judge_agent import LLMJudgeAgent

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestLLMJudgeAgent:
    """Test suite for LLMJudgeAgent"""

    def __init__(self):
        self.agent = LLMJudgeAgent()
        self.tests_passed = 0
        self.tests_failed = 0

    def run_all_tests(self):
        """Run all test cases"""
        logger.info("=" * 80)
        logger.info("🧪 Testing LLM-as-Judge Agent")
        logger.info("=" * 80)

        # Test 1: Rubric loading (backend)
        self.test_load_backend_rubric()

        # Test 2: Rubric loading (frontend)
        self.test_load_frontend_rubric()

        # Test 3: Rubric loading (architecture)
        self.test_load_architecture_rubric()

        # Test 4: Rubric markdown formatting
        self.test_rubric_markdown_formatting()

        # Test 5: Weighted score calculation
        self.test_weighted_score_calculation()

        # Test 6: Feedback generation (passing)
        self.test_feedback_generation_pass()

        # Test 7: Feedback generation (failing)
        self.test_feedback_generation_fail()

        # Test 8: Skip evaluation (no LLM)
        self.test_skip_evaluation_no_llm()

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

    # Test Cases

    def test_load_backend_rubric(self):
        """Test 1: Load backend rubric"""
        logger.info("\n🔹 Test 1: Load backend rubric")

        rubric = self.agent._load_rubric('backend')

        self.assert_true(rubric is not None, "Backend rubric loaded")
        self.assert_equals(rubric['name'], 'Backend Code Quality', "Rubric name correct")
        self.assert_equals(rubric['version'], '1.0.0', "Rubric version correct")
        self.assert_equals(len(rubric['criteria']), 4, "4 criteria present")
        self.assert_equals(rubric['passing_threshold'], 8.0, "Threshold is 8.0")

        # Check criteria weights
        weights = [c['weight'] for c in rubric['criteria']]
        total_weight = sum(weights)
        self.assert_equals(total_weight, 1.0, "Weights sum to 1.0")

        logger.info(f"  Criteria: {[c['name'] for c in rubric['criteria']]}")

    def test_load_frontend_rubric(self):
        """Test 2: Load frontend rubric"""
        logger.info("\n🔹 Test 2: Load frontend rubric")

        rubric = self.agent._load_rubric('frontend')

        self.assert_true(rubric is not None, "Frontend rubric loaded")
        self.assert_equals(rubric['name'], 'Frontend Code Quality', "Rubric name correct")
        self.assert_equals(len(rubric['criteria']), 4, "4 criteria present")

        # Check for UI/UX criterion (frontend-specific)
        criterion_names = [c['name'] for c in rubric['criteria']]
        self.assert_true('UI/UX Quality' in criterion_names, "UI/UX Quality criterion present")

        logger.info(f"  Criteria: {criterion_names}")

    def test_load_architecture_rubric(self):
        """Test 3: Load architecture rubric"""
        logger.info("\n🔹 Test 3: Load architecture rubric")

        rubric = self.agent._load_rubric('architecture')

        self.assert_true(rubric is not None, "Architecture rubric loaded")
        self.assert_equals(rubric['name'], 'Architecture Compliance', "Rubric name correct")
        self.assert_equals(len(rubric['criteria']), 4, "4 criteria present")

        # Check for architecture-specific criteria
        criterion_names = [c['name'] for c in rubric['criteria']]
        self.assert_true('Layering' in criterion_names, "Layering criterion present")
        self.assert_true('ADR Compliance' in criterion_names, "ADR Compliance criterion present")

        logger.info(f"  Criteria: {criterion_names}")

    def test_rubric_markdown_formatting(self):
        """Test 4: Rubric markdown formatting"""
        logger.info("\n🔹 Test 4: Rubric markdown formatting")

        rubric = self.agent._load_rubric('backend')
        markdown = self.agent._format_rubric_as_markdown(rubric)

        self.assert_true(len(markdown) > 0, "Markdown generated")
        self.assert_true('# Backend Code Quality' in markdown, "Title present")
        self.assert_true('## Criteria' in markdown, "Criteria section present")
        self.assert_true('Correctness' in markdown, "Correctness criterion present")
        self.assert_true('weight: 0.4' in markdown, "Weights included")

        logger.info(f"  Markdown length: {len(markdown)} chars")
        logger.info(f"  First 200 chars: {markdown[:200]}...")

    def test_weighted_score_calculation(self):
        """Test 5: Weighted score calculation"""
        logger.info("\n🔹 Test 5: Weighted score calculation")

        # Mock scores
        scores = [
            {'criterion': 'Correctness', 'score': 9.0, 'weight': 0.4},
            {'criterion': 'Style', 'score': 10.0, 'weight': 0.2},
            {'criterion': 'Performance', 'score': 8.0, 'weight': 0.2},
            {'criterion': 'Documentation', 'score': 7.0, 'weight': 0.2}
        ]

        # Mock criteria
        criteria = [
            {'name': 'Correctness', 'weight': 0.4},
            {'name': 'Style', 'weight': 0.2},
            {'name': 'Performance', 'weight': 0.2},
            {'name': 'Documentation', 'weight': 0.2}
        ]

        weighted_score = self.agent._calculate_weighted_score(scores, criteria)

        # Expected: (9*0.4 + 10*0.2 + 8*0.2 + 7*0.2) = 3.6 + 2.0 + 1.6 + 1.4 = 8.6
        expected = 8.6
        self.assert_equals(round(weighted_score, 1), expected, f"Weighted score is {expected}")

        # Test threshold
        passed = weighted_score >= self.agent.PASSING_THRESHOLD
        self.assert_true(passed, f"Score {weighted_score:.1f} passes threshold {self.agent.PASSING_THRESHOLD}")

        logger.info(f"  Scores: {[s['score'] for s in scores]}")
        logger.info(f"  Weights: {[s['weight'] for s in scores]}")
        logger.info(f"  Weighted score: {weighted_score:.2f}")

    def test_feedback_generation_pass(self):
        """Test 6: Feedback generation (passing)"""
        logger.info("\n🔹 Test 6: Feedback generation (passing)")

        evaluation = {
            'scores': [
                {
                    'criterion': 'Correctness',
                    'score': 9.0,
                    'weight': 0.4,
                    'justification': 'Excellent logic and error handling',
                    'evidence': ['Validates all inputs', 'Handles edge cases'],
                    'improvement': 'Add rate limiting'
                },
                {
                    'criterion': 'Style',
                    'score': 10.0,
                    'weight': 0.2,
                    'justification': 'Perfect PEP-8 compliance',
                    'evidence': ['Clean code', 'Good naming'],
                    'improvement': 'None needed'
                }
            ],
            'summary': {
                'assessment': 'High-quality implementation',
                'strengths': ['Excellent error handling', 'Clean code'],
                'weaknesses': ['Missing rate limiting'],
                'priorities': ['Add rate limiting']
            }
        }

        feedback = self.agent._generate_feedback(
            card_id='TEST-PASS',
            passed=True,
            weighted_score=8.6,
            evaluation=evaluation
        )

        self.assert_true(len(feedback) > 0, "Feedback generated")
        self.assert_true('✅ APPROVED' in feedback, "Approval message present")
        self.assert_true('TEST-PASS' in feedback, "Card ID present")
        self.assert_true('8.6/10' in feedback, "Score present")
        self.assert_true('Strengths' in feedback, "Strengths section present")

        logger.info(f"  Feedback length: {len(feedback)} chars")
        logger.info(f"  First 300 chars:\n{feedback[:300]}...")

    def test_feedback_generation_fail(self):
        """Test 7: Feedback generation (failing)"""
        logger.info("\n🔹 Test 7: Feedback generation (failing)")

        evaluation = {
            'scores': [
                {
                    'criterion': 'Correctness',
                    'score': 6.0,
                    'weight': 0.4,
                    'justification': 'Missing error handling',
                    'evidence': ['No validation', 'Edge cases not covered'],
                    'improvement': 'Add input validation'
                },
                {
                    'criterion': 'Style',
                    'score': 7.0,
                    'weight': 0.2,
                    'justification': 'Several style issues',
                    'evidence': ['Inconsistent naming'],
                    'improvement': 'Follow PEP-8'
                }
            ],
            'summary': {
                'assessment': 'Needs improvement',
                'strengths': ['Basic functionality works'],
                'weaknesses': ['Missing validation', 'Style issues'],
                'priorities': ['Add input validation', 'Fix style violations']
            }
        }

        feedback = self.agent._generate_feedback(
            card_id='TEST-FAIL',
            passed=False,
            weighted_score=6.4,
            evaluation=evaluation
        )

        self.assert_true(len(feedback) > 0, "Feedback generated")
        self.assert_true('❌ NEEDS IMPROVEMENT' in feedback, "Rejection message present")
        self.assert_true('TEST-FAIL' in feedback, "Card ID present")
        self.assert_true('6.4/10' in feedback, "Score present")
        self.assert_true('Weaknesses' in feedback, "Weaknesses section present")
        self.assert_true('Improvement Priorities' in feedback, "Priorities section present")
        self.assert_true('address the improvements' in feedback, "Action required message present")

        logger.info(f"  Feedback length: {len(feedback)} chars")
        logger.info(f"  Contains improvement priorities: YES")

    def test_skip_evaluation_no_llm(self):
        """Test 8: Skip evaluation when no LLM available"""
        logger.info("\n🔹 Test 8: Skip evaluation (no LLM)")

        # Create agent with no LLM client
        agent_no_llm = LLMJudgeAgent()
        agent_no_llm.llm_client = None

        result = agent_no_llm.evaluate_code_quality(
            card_id='TEST-SKIP',
            card_type='backend',
            artifacts={'code': {'test.py': 'def test(): pass'}}
        )

        self.assert_true(result['passed'], "Defaults to passed (graceful degradation)")
        self.assert_equals(result['overall_score'], 0.0, "Score is 0.0 (skipped)")
        self.assert_equals(result['weighted_score'], 0.0, "Weighted score is 0.0")
        self.assert_true(result['metadata']['skipped'], "Skipped flag set")
        self.assert_true('skipped' in result['feedback'].lower(), "Feedback mentions skip")

        logger.info(f"  Skip reason: {result['metadata'].get('skip_reason')}")
        logger.info(f"  Passed: {result['passed']} (allows progress to manual QA)")

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
            logger.info("✅ LLM-as-Judge Agent is working correctly")
            logger.info("✅ Rubric loading validated")
            logger.info("✅ Score calculation validated")
            logger.info("✅ Feedback generation validated")
            return True
        else:
            logger.error(f"\n❌ {self.tests_failed} TEST(S) FAILED")
            return False


if __name__ == '__main__':
    try:
        test_suite = TestLLMJudgeAgent()
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    except AssertionError as e:
        logger.error(f"\n❌ Test assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        sys.exit(1)

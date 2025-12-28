#!/usr/bin/env python3
"""
Test Suite for LLM-Judge Agent

Tests the architecture and functionality WITHOUT requiring actual LLM API calls.
Uses mocking for LLM responses to keep tests fast and deterministic.

Focus areas:
- Rubric loading and parsing
- Markdown formatting for caching
- Weighted score calculation
- Feedback generation
- Graceful degradation (LLM unavailable)

Author: SquadOS Testing Suite
Version: 1.0.0
"""

import sys
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agents.llm_judge_agent import LLMJudgeAgent


def test_rubric_loading_backend():
    """Test loading backend rubric file"""
    print("=" * 80)
    print("TEST 1: Rubric Loading - Backend")
    print("=" * 80)

    agent = LLMJudgeAgent()
    rubric = agent._load_rubric('backend')

    assert rubric is not None, "Rubric should be loaded"
    assert rubric['name'] == 'Backend Code Quality Rubric'
    assert rubric['version'] == '1.0.0'
    assert rubric['passing_threshold'] == 8.0
    assert len(rubric['criteria']) == 4

    print(f"✅ Loaded rubric: {rubric['name']} v{rubric['version']}")
    print(f"   Criteria count: {len(rubric['criteria'])}")
    print(f"   Passing threshold: {rubric['passing_threshold']}")

    print()
    return True


def test_rubric_loading_unknown_type():
    """Test handling of unknown card type"""
    print("=" * 80)
    print("TEST 2: Rubric Loading - Unknown Type")
    print("=" * 80)

    agent = LLMJudgeAgent()
    rubric = agent._load_rubric('unknown_type')

    assert rubric is None, "Should return None for unknown type"

    print("✅ Correctly returned None for unknown card type")

    print()
    return True


def test_markdown_formatting():
    """Test rubric markdown formatting for caching"""
    print("=" * 80)
    print("TEST 3: Rubric Markdown Formatting")
    print("=" * 80)

    agent = LLMJudgeAgent()
    rubric = agent._load_rubric('backend')

    markdown = agent._format_rubric_as_markdown(rubric)

    # Validate markdown structure
    assert '# Backend Code Quality Rubric' in markdown
    assert 'v1.0.0' in markdown
    assert 'weight: 0.4' in markdown  # Correctness weight
    assert 'weight: 0.2' in markdown  # Other weights
    assert 'Scoring Levels:' in markdown
    assert '## Criteria' in markdown

    lines = markdown.split('\n')
    print(f"✅ Markdown formatted successfully")
    print(f"   Total lines: {len(lines)}")
    print(f"   Total chars: {len(markdown)}")
    print(f"   Sample:")
    print(f"   {lines[0]}")  # Title
    print(f"   {lines[1]}")  # Empty
    print(f"   {lines[2]}")  # Description

    print()
    return True


def test_weighted_score_calculation():
    """Test weighted score calculation logic"""
    print("=" * 80)
    print("TEST 4: Weighted Score Calculation")
    print("=" * 80)

    agent = LLMJudgeAgent()

    # Mock criteria
    criteria = [
        {'name': 'Correctness', 'weight': 0.4},
        {'name': 'Style', 'weight': 0.2},
        {'name': 'Performance', 'weight': 0.2},
        {'name': 'Documentation', 'weight': 0.2}
    ]

    # Mock scores
    scores = [
        {'criterion': 'Correctness', 'score': 9.0},
        {'criterion': 'Style', 'score': 10.0},
        {'criterion': 'Performance', 'score': 8.0},
        {'criterion': 'Documentation', 'score': 7.0}
    ]

    weighted_score = agent._calculate_weighted_score(scores, criteria)

    # Expected: 9×0.4 + 10×0.2 + 8×0.2 + 7×0.2 = 3.6 + 2.0 + 1.6 + 1.4 = 8.6
    expected = 8.6

    assert abs(weighted_score - expected) < 0.01, f"Expected {expected}, got {weighted_score}"

    print(f"✅ Weighted score calculated correctly")
    print(f"   Correctness (9.0 × 0.4) = 3.6")
    print(f"   Style (10.0 × 0.2) = 2.0")
    print(f"   Performance (8.0 × 0.2) = 1.6")
    print(f"   Documentation (7.0 × 0.2) = 1.4")
    print(f"   Total: {weighted_score}")

    print()
    return True


def test_passing_evaluation():
    """Test passing evaluation (score ≥8.0)"""
    print("=" * 80)
    print("TEST 5: Passing Evaluation (≥8.0)")
    print("=" * 80)

    agent = LLMJudgeAgent()

    # Mock evaluation result
    mock_evaluation = {
        'scores': [
            {
                'criterion': 'Correctness',
                'score': 9.0,
                'weight': 0.4,
                'justification': 'All requirements met',
                'evidence': ['Input validation present', 'Error handling comprehensive'],
                'improvement': 'None'
            },
            {
                'criterion': 'Style',
                'score': 10.0,
                'weight': 0.2,
                'justification': 'Exemplary code style',
                'evidence': ['Consistent naming', 'Clear abstractions'],
                'improvement': 'None'
            },
            {
                'criterion': 'Performance',
                'score': 8.0,
                'weight': 0.2,
                'justification': 'Optimized algorithms',
                'evidence': ['O(n log n)', 'Indexed queries'],
                'improvement': 'Consider caching'
            },
            {
                'criterion': 'Documentation',
                'score': 7.0,
                'weight': 0.2,
                'justification': 'Good docs',
                'evidence': ['README present', 'API docs'],
                'improvement': 'Add architecture diagram'
            }
        ],
        'summary': {
            'assessment': 'High-quality implementation',
            'strengths': ['Correctness', 'Style'],
            'weaknesses': [],
            'priorities': []
        }
    }

    # Calculate weighted score
    criteria = [
        {'name': 'Correctness', 'weight': 0.4},
        {'name': 'Style', 'weight': 0.2},
        {'name': 'Performance', 'weight': 0.2},
        {'name': 'Documentation', 'weight': 0.2}
    ]

    weighted_score = agent._calculate_weighted_score(mock_evaluation['scores'], criteria)

    # Generate feedback
    feedback = agent._generate_feedback(
        card_id='TEST-001',
        passed=True,
        weighted_score=weighted_score,
        evaluation=mock_evaluation
    )

    assert weighted_score >= 8.0, "Should pass threshold"
    assert '✅ APPROVED' in feedback
    assert 'Weighted Score: 8.6/10' in feedback

    print(f"✅ Passing evaluation handled correctly")
    print(f"   Weighted Score: {weighted_score}/10")
    print(f"   Status: PASS")
    print(f"   Feedback generated: {len(feedback)} chars")

    print()
    return True


def test_failing_evaluation():
    """Test failing evaluation (score <8.0)"""
    print("=" * 80)
    print("TEST 6: Failing Evaluation (<8.0)")
    print("=" * 80)

    agent = LLMJudgeAgent()

    # Mock evaluation result with lower scores
    mock_evaluation = {
        'scores': [
            {
                'criterion': 'Correctness',
                'score': 6.0,
                'weight': 0.4,
                'justification': 'Some edge cases missing',
                'evidence': ['Basic validation only', 'Missing error codes'],
                'improvement': 'Add comprehensive input validation'
            },
            {
                'criterion': 'Style',
                'score': 7.0,
                'weight': 0.2,
                'justification': 'Good style',
                'evidence': ['Clear naming'],
                'improvement': 'Extract long functions'
            },
            {
                'criterion': 'Performance',
                'score': 8.0,
                'weight': 0.2,
                'justification': 'Acceptable',
                'evidence': ['No N+1 queries'],
                'improvement': 'None'
            },
            {
                'criterion': 'Documentation',
                'score': 5.0,
                'weight': 0.2,
                'justification': 'Minimal docs',
                'evidence': ['Basic README only'],
                'improvement': 'Add API documentation and examples'
            }
        ],
        'summary': {
            'assessment': 'Needs improvement',
            'strengths': ['Performance'],
            'weaknesses': ['Correctness', 'Documentation'],
            'priorities': ['Add validation', 'Improve docs']
        }
    }

    criteria = [
        {'name': 'Correctness', 'weight': 0.4},
        {'name': 'Style', 'weight': 0.2},
        {'name': 'Performance', 'weight': 0.2},
        {'name': 'Documentation', 'weight': 0.2}
    ]

    weighted_score = agent._calculate_weighted_score(mock_evaluation['scores'], criteria)
    # Expected: 6×0.4 + 7×0.2 + 8×0.2 + 5×0.2 = 2.4 + 1.4 + 1.6 + 1.0 = 6.4

    feedback = agent._generate_feedback(
        card_id='TEST-002',
        passed=False,
        weighted_score=weighted_score,
        evaluation=mock_evaluation
    )

    assert weighted_score < 8.0, "Should fail threshold"
    assert '❌ FAILED' in feedback
    assert 'Weighted Score: 6.4/10' in feedback
    assert 'Improvement Priorities' in feedback

    print(f"✅ Failing evaluation handled correctly")
    print(f"   Weighted Score: {weighted_score}/10")
    print(f"   Status: FAIL")
    print(f"   Feedback generated: {len(feedback)} chars")

    print()
    return True


def test_graceful_degradation_no_llm():
    """Test graceful degradation when LLM client unavailable"""
    print("=" * 80)
    print("TEST 7: Graceful Degradation (No LLM)")
    print("=" * 80)

    # Create agent with no LLM client
    with patch('agents.llm_judge_agent.get_cached_client', return_value=None):
        agent = LLMJudgeAgent()

        result = agent.evaluate_code_quality(
            card_id='TEST-003',
            card_type='backend',
            artifacts={
                'code': {'main.py': 'print("hello")'}
            }
        )

        assert result['passed'] is True, "Should default to pass when LLM unavailable"
        assert result['overall_score'] == 10.0, "Should default to perfect score"
        assert 'LLM client unavailable' in result['metadata']['reason']

        print(f"✅ Graceful degradation works")
        print(f"   Passed: {result['passed']}")
        print(f"   Score: {result['overall_score']}/10")
        print(f"   Reason: {result['metadata']['reason']}")

    print()
    return True


def test_rubric_criteria_weights_sum_to_one():
    """Test that rubric criteria weights sum to 1.0"""
    print("=" * 80)
    print("TEST 8: Rubric Weights Sum to 1.0")
    print("=" * 80)

    agent = LLMJudgeAgent()
    rubric = agent._load_rubric('backend')

    total_weight = sum(c['weight'] for c in rubric['criteria'])

    assert abs(total_weight - 1.0) < 0.01, f"Weights should sum to 1.0, got {total_weight}"

    print(f"✅ Rubric weights validated")
    print(f"   Total weight: {total_weight}")
    for criterion in rubric['criteria']:
        print(f"   {criterion['name']}: {criterion['weight']}")

    print()
    return True


def test_feedback_includes_all_sections():
    """Test that feedback includes all required sections"""
    print("=" * 80)
    print("TEST 9: Feedback Completeness")
    print("=" * 80)

    agent = LLMJudgeAgent()

    mock_evaluation = {
        'scores': [
            {
                'criterion': 'Correctness',
                'score': 8.5,
                'weight': 0.4,
                'justification': 'Good',
                'evidence': ['Test 1', 'Test 2'],
                'improvement': 'Improve X'
            }
        ],
        'summary': {
            'assessment': 'Good work',
            'strengths': ['Strength 1'],
            'weaknesses': ['Weakness 1'],
            'priorities': ['Priority 1']
        }
    }

    feedback = agent._generate_feedback(
        card_id='TEST-004',
        passed=True,
        weighted_score=8.5,
        evaluation=mock_evaluation
    )

    # Check all required sections
    required_sections = [
        'Card:',
        'Weighted Score:',
        'Detailed Scores:',
        'Summary:',
        'Strengths:',
        'Next Steps:'
    ]

    for section in required_sections:
        assert section in feedback, f"Missing section: {section}"

    print(f"✅ Feedback includes all required sections")
    for section in required_sections:
        print(f"   ✓ {section}")

    print()
    return True


def test_skip_evaluation_structure():
    """Test structure of skipped evaluation result"""
    print("=" * 80)
    print("TEST 10: Skip Evaluation Structure")
    print("=" * 80)

    agent = LLMJudgeAgent()

    # Test with missing rubric
    result = agent.evaluate_code_quality(
        card_id='TEST-005',
        card_type='unknown',
        artifacts={}
    )

    assert 'passed' in result
    assert 'overall_score' in result
    assert 'weighted_score' in result
    assert 'scores' in result
    assert 'summary' in result
    assert 'feedback' in result
    assert 'metadata' in result

    print(f"✅ Skip evaluation has correct structure")
    print(f"   Keys: {list(result.keys())}")
    print(f"   Passed: {result['passed']}")
    print(f"   Reason: {result['metadata']['reason']}")

    print()
    return True


def run_all_tests():
    """Run all test cases"""
    print("\n" + "=" * 80)
    print("LLM-JUDGE AGENT TEST SUITE")
    print("=" * 80 + "\n")

    tests = [
        ("Rubric Loading - Backend", test_rubric_loading_backend),
        ("Rubric Loading - Unknown Type", test_rubric_loading_unknown_type),
        ("Markdown Formatting", test_markdown_formatting),
        ("Weighted Score Calculation", test_weighted_score_calculation),
        ("Passing Evaluation (≥8.0)", test_passing_evaluation),
        ("Failing Evaluation (<8.0)", test_failing_evaluation),
        ("Graceful Degradation (No LLM)", test_graceful_degradation_no_llm),
        ("Rubric Weights Sum to 1.0", test_rubric_criteria_weights_sum_to_one),
        ("Feedback Completeness", test_feedback_includes_all_sections),
        ("Skip Evaluation Structure", test_skip_evaluation_structure),
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

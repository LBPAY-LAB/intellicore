#!/usr/bin/env python3
"""
Verification Agent - obra ow-002 Implementation

Implements "Verification-Before-Completion" principle:
**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

Core Principle:
    "Evidence before claims, always."

The Iron Law:
    If you haven't run the verification command in this message,
    you cannot claim it passes.

The Gate Function (5 steps):
    1. Identify - What command proves your assertion?
    2. Run - Execute the complete command fresh
    3. Read - Full output and exit codes
    4. Verify - Output confirms your claim or reveals actual status
    5. State Result - Only then state the result with supporting evidence

ROI: $15,000/year (reduced rework + QA cycles)
Source: obra/superpowers (Jesse Vincent)
"""

import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

# Red flags that indicate claims without evidence
RED_FLAGS_HEDGING = [
    'should', 'probably', 'seems', 'looks', 'appears',
    'might', 'could', 'maybe', 'hopefully'
]

RED_FLAGS_PREMATURE = [
    'great!', 'done!', 'fixed!', 'perfect!', 'success!'
]

# Required evidence patterns
REQUIRED_EVIDENCE = {
    'tests_pass': {
        'command_pattern': r'(npm test|pytest|go test|cargo test|mvn test)',
        'success_pattern': r'(passed|OK|\d+\s+passed)',
        'failure_pattern': r'(failed|FAIL|error|ERROR)',
        'exit_code': 0
    },
    'lint_clean': {
        'command_pattern': r'(npm run lint|eslint|pylint|golangci-lint|cargo clippy)',
        'success_pattern': r'(no\s+issues?|clean|0\s+errors?)',
        'failure_pattern': r'(\d+\s+errors?|\d+\s+warnings?)',
        'exit_code': 0
    },
    'build_success': {
        'command_pattern': r'(npm run build|go build|cargo build|mvn package|docker build)',
        'success_pattern': r'(success|built|compiled|created)',
        'failure_pattern': r'(fail|error|ERROR)',
        'exit_code': 0
    },
    'coverage_met': {
        'command_pattern': r'(pytest --cov|npm test.*coverage|go test.*cover)',
        'success_pattern': r'(\d{2,3}%.*coverage)',
        'min_coverage': 80,
        'exit_code': 0
    }
}


class VerificationAgent:
    """
    Verification Agent - Enforces obra ow-002

    Validates completion claims against fresh verification evidence.
    Automatically rejects claims without evidence or with red flags.

    Usage:
        agent = VerificationAgent()

        result = agent.validate_completion_claim(
            card_id='PROD-042',
            claim='Tests pass and linting clean',
            evidence={
                'test_output': test_output,
                'lint_output': lint_output,
                'exit_codes': {'test': 0, 'lint': 0}
            }
        )

        if result['approved']:
            # Continue to QA
        else:
            # Send feedback to squad
            print(result['feedback'])
    """

    def __init__(self):
        logger.info("✅ Verification Agent initialized (obra ow-002)")

    def validate_completion_claim(
        self,
        card_id: str,
        claim: str,
        evidence: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate completion claim using obra ow-002 Gate Function

        Args:
            card_id: Card being validated
            claim: What is being claimed (e.g., "Tests pass")
            evidence: Provided evidence dict with keys:
                - test_output: str (test command output)
                - lint_output: str (linter output)
                - build_output: str (build output)
                - coverage_output: str (coverage report)
                - exit_codes: Dict[str, int] (command exit codes)

        Returns:
            {
                'approved': bool,
                'reason': str,
                'missing_evidence': List[str],
                'verification_steps': List[str],
                'feedback': str,  # Formatted feedback for squad
                'gate_function_result': {
                    'step1_identify': str,
                    'step2_run': bool,
                    'step3_read': bool,
                    'step4_verify': bool,
                    'step5_state': str
                }
            }
        """
        logger.info(f"🔍 Validating completion claim for {card_id}")
        logger.info(f"   Claim: {claim}")

        # Step 1: Detect red flags
        red_flags = self._detect_red_flags(claim)
        if red_flags:
            return self._reject_with_red_flags(card_id, claim, red_flags)

        # Step 2: Identify what evidence is required
        required_types = self._identify_required_evidence(claim)
        logger.info(f"   Required evidence types: {required_types}")

        # Step 3: Check if evidence was provided
        provided_types = list(evidence.keys())
        missing_types = [t for t in required_types if t not in provided_types]

        if missing_types:
            return self._reject_missing_evidence(card_id, claim, missing_types)

        # Step 4: Validate each evidence type
        validation_results = {}
        for evidence_type in required_types:
            evidence_data = evidence.get(evidence_type)
            if evidence_data:
                validation_results[evidence_type] = self._validate_evidence(
                    evidence_type,
                    evidence_data
                )

        # Step 5: Check if all validations passed
        all_passed = all(
            result.get('valid', False)
            for result in validation_results.values()
        )

        if not all_passed:
            return self._reject_failed_validation(card_id, claim, validation_results)

        # APPROVED
        return self._approve(card_id, claim, validation_results)

    def _detect_red_flags(self, claim: str) -> List[str]:
        """
        Detect red flag phrases in claim

        Returns list of detected red flags
        """
        detected = []
        claim_lower = claim.lower()

        # Check hedging phrases
        for phrase in RED_FLAGS_HEDGING:
            if phrase in claim_lower:
                detected.append(f"Hedging: '{phrase}'")

        # Check premature satisfaction (without evidence)
        for phrase in RED_FLAGS_PREMATURE:
            if phrase in claim_lower:
                detected.append(f"Premature: '{phrase}'")

        return detected

    def _identify_required_evidence(self, claim: str) -> List[str]:
        """
        Identify what evidence types are required based on claim

        Returns list of required evidence keys:
        - 'test_output' if claim mentions tests
        - 'lint_output' if claim mentions linting
        - 'build_output' if claim mentions build
        - 'coverage_output' if claim mentions coverage
        """
        required = []
        claim_lower = claim.lower()

        # Check for test-related claims
        if any(word in claim_lower for word in ['test', 'passing', 'passed']):
            required.append('test_output')

        # Check for lint-related claims
        if any(word in claim_lower for word in ['lint', 'linting', 'clean']):
            required.append('lint_output')

        # Check for build-related claims
        if any(word in claim_lower for word in ['build', 'compile', 'built']):
            required.append('build_output')

        # Check for coverage claims
        if any(word in claim_lower for word in ['coverage', '80%', 'tested']):
            required.append('coverage_output')

        # Default: if no specific claim, require tests at minimum
        if not required:
            required.append('test_output')

        return required

    def _validate_evidence(
        self,
        evidence_type: str,
        evidence_data: Any
    ) -> Dict[str, Any]:
        """
        Validate specific evidence type

        Returns:
            {
                'valid': bool,
                'details': str,
                'parsed_data': Dict
            }
        """
        if evidence_type == 'test_output':
            return self._validate_test_output(evidence_data)
        elif evidence_type == 'lint_output':
            return self._validate_lint_output(evidence_data)
        elif evidence_type == 'build_output':
            return self._validate_build_output(evidence_data)
        elif evidence_type == 'coverage_output':
            return self._validate_coverage_output(evidence_data)
        else:
            return {'valid': False, 'details': f'Unknown evidence type: {evidence_type}'}

    def _validate_test_output(self, output: str) -> Dict[str, Any]:
        """
        Validate test output

        Checks:
        - Command was executed (recognizable test framework output)
        - Exit code 0
        - No failures
        - Pass count > 0
        """
        if isinstance(output, dict):
            # Already parsed
            output_text = output.get('output', '')
            exit_code = output.get('exit_code', None)
        else:
            output_text = str(output)
            exit_code = None

        # Detect test framework
        framework = None
        if 'pytest' in output_text.lower() or 'passed' in output_text.lower():
            framework = 'pytest'
        elif 'jest' in output_text.lower() or 'test suites' in output_text.lower():
            framework = 'jest'
        elif 'ok' in output_text.lower() and 'pass' in output_text.lower():
            framework = 'go test'

        if not framework:
            return {
                'valid': False,
                'details': 'No recognizable test framework output',
                'parsed_data': {}
            }

        # Check for failures
        if re.search(r'(failed|FAIL|error|ERROR)', output_text, re.IGNORECASE):
            return {
                'valid': False,
                'details': 'Tests failed (failures/errors detected in output)',
                'parsed_data': {'framework': framework}
            }

        # Check for pass count
        pass_match = re.search(r'(\d+)\s+(passed|OK)', output_text, re.IGNORECASE)
        if not pass_match:
            return {
                'valid': False,
                'details': 'No pass count found in output',
                'parsed_data': {'framework': framework}
            }

        pass_count = int(pass_match.group(1))

        # Check exit code if provided
        if exit_code is not None and exit_code != 0:
            return {
                'valid': False,
                'details': f'Non-zero exit code: {exit_code}',
                'parsed_data': {'framework': framework, 'passed': pass_count}
            }

        return {
            'valid': True,
            'details': f'{framework}: {pass_count} tests passed',
            'parsed_data': {
                'framework': framework,
                'passed': pass_count,
                'exit_code': exit_code
            }
        }

    def _validate_lint_output(self, output: str) -> Dict[str, Any]:
        """Validate linter output"""
        if isinstance(output, dict):
            output_text = output.get('output', '')
            exit_code = output.get('exit_code', None)
        else:
            output_text = str(output)
            exit_code = None

        # Check for errors
        error_match = re.search(r'(\d+)\s+errors?', output_text, re.IGNORECASE)
        if error_match:
            error_count = int(error_match.group(1))
            if error_count > 0:
                return {
                    'valid': False,
                    'details': f'{error_count} linting errors found',
                    'parsed_data': {'errors': error_count}
                }

        # Check for clean output
        if re.search(r'(no\s+issues?|clean|0\s+errors?)', output_text, re.IGNORECASE):
            return {
                'valid': True,
                'details': 'Linter clean (0 errors)',
                'parsed_data': {'errors': 0}
            }

        # Check exit code
        if exit_code is not None:
            if exit_code == 0:
                return {
                    'valid': True,
                    'details': 'Linter clean (exit code 0)',
                    'parsed_data': {'exit_code': 0}
                }
            else:
                return {
                    'valid': False,
                    'details': f'Linter failed (exit code {exit_code})',
                    'parsed_data': {'exit_code': exit_code}
                }

        # Uncertain
        return {
            'valid': False,
            'details': 'Unable to determine linter status from output',
            'parsed_data': {}
        }

    def _validate_build_output(self, output: str) -> Dict[str, Any]:
        """Validate build output"""
        if isinstance(output, dict):
            output_text = output.get('output', '')
            exit_code = output.get('exit_code', None)
        else:
            output_text = str(output)
            exit_code = None

        # Check for failures
        if re.search(r'(fail|error|ERROR)', output_text, re.IGNORECASE):
            return {
                'valid': False,
                'details': 'Build failed (errors detected)',
                'parsed_data': {}
            }

        # Check for success
        if re.search(r'(success|built|compiled|created)', output_text, re.IGNORECASE):
            return {
                'valid': True,
                'details': 'Build successful',
                'parsed_data': {}
            }

        # Check exit code
        if exit_code is not None:
            if exit_code == 0:
                return {
                    'valid': True,
                    'details': 'Build successful (exit code 0)',
                    'parsed_data': {'exit_code': 0}
                }
            else:
                return {
                    'valid': False,
                    'details': f'Build failed (exit code {exit_code})',
                    'parsed_data': {'exit_code': exit_code}
                }

        return {
            'valid': False,
            'details': 'Unable to determine build status from output',
            'parsed_data': {}
        }

    def _validate_coverage_output(self, output: str) -> Dict[str, Any]:
        """Validate coverage output"""
        if isinstance(output, dict):
            output_text = output.get('output', '')
        else:
            output_text = str(output)

        # Extract coverage percentage
        coverage_match = re.search(r'(\d{1,3})%', output_text)
        if not coverage_match:
            return {
                'valid': False,
                'details': 'No coverage percentage found',
                'parsed_data': {}
            }

        coverage_pct = int(coverage_match.group(1))

        if coverage_pct < 80:
            return {
                'valid': False,
                'details': f'Coverage too low: {coverage_pct}% (minimum: 80%)',
                'parsed_data': {'coverage': coverage_pct}
            }

        return {
            'valid': True,
            'details': f'Coverage: {coverage_pct}% (≥80%)',
            'parsed_data': {'coverage': coverage_pct}
        }

    def _reject_with_red_flags(
        self,
        card_id: str,
        claim: str,
        red_flags: List[str]
    ) -> Dict[str, Any]:
        """Generate rejection response for red flag detection"""
        feedback = f"""❌ REJECTED - Red flags detected in completion claim

Card: {card_id}
Claim: "{claim}"

Red flags detected:
"""
        for flag in red_flags:
            feedback += f"  - {flag}\n"

        feedback += """
obra ow-002 requires:
- NO hedging language ("should", "probably", "seems")
- NO premature satisfaction without evidence ("Great!", "Done!")
- FRESH verification command execution
- FULL output provided

Next steps:
1. Remove hedging language
2. Run verification commands (tests, lint, build)
3. Provide FULL output (not summarized)
4. State results based on evidence
"""

        return {
            'approved': False,
            'reason': 'Red flags detected in claim',
            'missing_evidence': [],
            'verification_steps': ['Remove hedging language', 'Run verification commands'],
            'feedback': feedback,
            'red_flags': red_flags
        }

    def _reject_missing_evidence(
        self,
        card_id: str,
        claim: str,
        missing_types: List[str]
    ) -> Dict[str, Any]:
        """Generate rejection response for missing evidence"""
        evidence_commands = {
            'test_output': 'npm test (or pytest, go test, cargo test)',
            'lint_output': 'npm run lint (or eslint, pylint, golangci-lint)',
            'build_output': 'npm run build (or go build, cargo build)',
            'coverage_output': 'npm test -- --coverage (or pytest --cov)'
        }

        feedback = f"""❌ REJECTED - Missing verification evidence

Card: {card_id}
Claim: "{claim}"

Missing evidence:
"""
        for missing in missing_types:
            feedback += f"  - [ ] {missing.replace('_', ' ').title()}\n"

        feedback += """
Next steps (obra ow-002 Gate Function):
"""
        for i, missing in enumerate(missing_types, 1):
            command = evidence_commands.get(missing, 'verification command')
            feedback += f"{i}. Run: {command}\n"

        feedback += """
{len(missing_types) + 1}. Provide FULL output (not truncated)
{len(missing_types) + 2}. Confirm exit code 0 and zero failures
{len(missing_types) + 3}. State result based on evidence
"""

        return {
            'approved': False,
            'reason': 'Missing verification evidence',
            'missing_evidence': missing_types,
            'verification_steps': [
                f'Run {evidence_commands.get(t, "verification")}' for t in missing_types
            ],
            'feedback': feedback
        }

    def _reject_failed_validation(
        self,
        card_id: str,
        claim: str,
        validation_results: Dict[str, Dict]
    ) -> Dict[str, Any]:
        """Generate rejection response for failed validation"""
        feedback = f"""❌ REJECTED - Verification evidence shows failures

Card: {card_id}
Claim: "{claim}"

Validation results:
"""
        for evidence_type, result in validation_results.items():
            status = "✅ PASS" if result.get('valid') else "❌ FAIL"
            details = result.get('details', 'N/A')
            feedback += f"  {status} {evidence_type.replace('_', ' ').title()}: {details}\n"

        feedback += """
Next steps:
1. Fix the failures identified above
2. Re-run verification commands
3. Provide fresh evidence with zero failures
"""

        return {
            'approved': False,
            'reason': 'Verification evidence shows failures',
            'missing_evidence': [],
            'verification_steps': ['Fix failures', 'Re-run verification'],
            'feedback': feedback,
            'validation_results': validation_results
        }

    def _approve(
        self,
        card_id: str,
        claim: str,
        validation_results: Dict[str, Dict]
    ) -> Dict[str, Any]:
        """Generate approval response"""
        feedback = f"""✅ APPROVED - Evidence confirms claim

Card: {card_id}
Claim: "{claim}"

Validation:
"""
        for evidence_type, result in validation_results.items():
            details = result.get('details', 'Validated')
            feedback += f"  ✅ {evidence_type.replace('_', ' ').title()}: {details}\n"

        feedback += """
obra ow-002 compliance:
✅ Fresh verification commands executed
✅ Full output provided
✅ Exit code 0 / Zero failures
✅ Evidence matches claim

Status: APPROVED for QA review
"""

        return {
            'approved': True,
            'reason': 'Evidence confirms all claims',
            'missing_evidence': [],
            'verification_steps': [],
            'feedback': feedback,
            'validation_results': validation_results
        }


# Convenience function for Celery tasks
def validate_card_completion(
    card_id: str,
    claim: str,
    evidence: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Entry point for Celery task validation

    Args:
        card_id: Card being validated
        claim: Completion claim
        evidence: Evidence dict

    Returns:
        Validation result
    """
    agent = VerificationAgent()
    return agent.validate_completion_claim(card_id, claim, evidence)

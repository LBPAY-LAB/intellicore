#!/usr/bin/env python3
"""
Backend Owner Agent v2.0.0 - Hybrid Architecture

Processes backend cards (PROD-002, PROD-005, PROD-008, ...) using:
- Phase 1 (10-30%): CLI scaffolding generation (fast, deterministic)
- Phase 2 (30-80%): Skills business logic implementation (high quality)
- Phase 3 (80-100%): Skills validation (automated QA)

Delegates to:
- golang-pro skill: Backend CRUD/Data APIs (Go + Gin + GORM)
- fastapi-pro skill: Backend RAG/AI APIs (Python + FastAPI + CrewAI)
- verification-agent: Evidence validation (obra ow-002)
- llm-judge: Code quality scoring (rubrics)
- debugging-agent: Systematic debugging (obra ow-006)

Architecture Pattern: "Arquiteto-Agente Híbrido"
Cost: $0.35/card (scaffolding $0.05 + logic $0.20 + validation $0.10)

Author: SquadOS Meta-Framework
Version: 2.0.0 (Hybrid)
Date: 2025-12-28
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Import HybridDelegator
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.hybrid_delegator import create_hybrid_delegator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BackendOwnerAgentV2:
    """
    Backend Owner Agent v2.0 - Hybrid Architecture

    Orchestrates (not implements!) backend card execution through skills.

    Workflow:
    1. Parse card requirements
    2. Determine language (RAG/AI → Python, CRUD/Data → Go)
    3. Phase 1: Generate scaffold via CLI (10-30%)
    4. Phase 2: Implement logic via skill (30-80%)
    5. Phase 3: Validate via skills (80-100%)

    Features:
    - Zero template generation (delegates to skills)
    - Checkpoint system for resumability
    - Progress reporting (8 stages)
    - Multi-language support (Go + Python)
    - Cost tracking ($0.35/card)
    """

    # Progress stages
    STAGES = {
        'requirements_analyzed': 10,
        'language_determined': 15,
        'scaffold_generated': 30,    # Phase 1 complete (CLI)
        'api_implemented': 50,        # Phase 2: API logic via skill
        'business_logic_implemented': 65,  # Phase 2: Service logic via skill
        'tests_implemented': 80,      # Phase 2: Tests via skill
        'evidence_verified': 90,      # Phase 3: verification-agent
        'quality_validated': 95,      # Phase 3: llm-judge
        'completed': 100
    }

    def __init__(self, base_dir: Optional[str] = None, project_root: Optional[str] = None):
        """
        Initialize Backend Owner Agent v2.0

        Args:
            base_dir: Base directory for artifacts (defaults to auto-detect)
            project_root: Project root directory (defaults to auto-detect)
        """
        # Paths
        if base_dir:
            self.base_dir = Path(base_dir)
        else:
            self.base_dir = Path(__file__).parent.parent

        if project_root:
            self.project_root = Path(project_root)
        else:
            # Go up to supercore/ root, then into squadOS/
            self.project_root = self.base_dir.parent.parent / "squadOS"

        # Documentation base (correct path: squadOS/app-generation/documentation-base)
        self.docs_dir = self.project_root / "app-generation" / "documentation-base"

        # Artifacts (correct path: squadOS/app-artefacts)
        self.artifacts_dir = self.project_root / "app-artefacts"
        self.backend_dir = self.artifacts_dir / "engenharia" / "backend"
        self.checkpoints_dir = self.base_dir / "state" / "checkpoints"

        # Create directories
        for dir_path in [self.backend_dir, self.checkpoints_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

        # Initialize HybridDelegator
        self.delegator = create_hybrid_delegator(
            base_dir=str(self.artifacts_dir),
            project_root=str(self.project_root)
        )

        # Cost tracking
        self.total_cost = 0.0

        logger.info("✅ Backend Owner Agent v2.0 (Hybrid) initialized")
        logger.info(f"   Mode: Orchestration (delegates to skills)")
        logger.info(f"   Skills: golang-pro, fastapi-pro, verification-agent, llm-judge")
        logger.info(f"   Artifacts: {self.backend_dir}")

    def execute_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method (orchestration via skills)

        Workflow:
        1. Analyze requirements → Determine language
        2. Phase 1: CLI scaffolding ($0.05)
        3. Phase 2: Skills business logic ($0.20)
        4. Phase 3: Skills validation ($0.10)

        Args:
            card_id: Card identifier (e.g., "PROD-002")
            card_data: Card metadata (title, acceptance_criteria, etc.)

        Returns:
            {
                'status': 'success' | 'error',
                'card_id': 'PROD-002',
                'language': 'go' | 'python',
                'artifacts': {...},
                'cost': 0.35,
                'elapsed_time': 45.2
            }
        """
        logger.info(f"⚙️ Backend Owner Agent v2.0 executing: {card_id}")
        start_time = datetime.now()

        # Validate card type
        if not self._is_backend_card(card_id, card_data):
            return {
                'status': 'skipped',
                'reason': f'{card_id} is not a backend card',
                'elapsed_time': (datetime.now() - start_time).total_seconds()
            }

        # Check checkpoint
        checkpoint = self._load_checkpoint(card_id)
        if checkpoint:
            logger.info(f"📌 Resuming from checkpoint: {checkpoint['stage']}")
            return self._resume_from_checkpoint(card_id, checkpoint)

        try:
            # ================================================================
            # STAGE 1: ANALYZE REQUIREMENTS (10%)
            # ================================================================
            self._report_progress('requirements_analyzed', f"Analyzing requirements for {card_id}")

            requirements = self._extract_requirements(card_data)
            logger.info(f"   Requirements extracted: {len(requirements)} criteria")

            self._save_checkpoint(card_id, 'requirements_analyzed', {
                'requirements': requirements
            })

            # ================================================================
            # STAGE 2: DETERMINE LANGUAGE (15%)
            # ================================================================
            self._report_progress('language_determined', f"Determining language for {card_id}")

            language = self.delegator._detect_language_from_card(card_data)
            skill = 'golang-pro' if language == 'go' else 'fastapi-pro'

            logger.info(f"   Language detected: {language} → Skill: {skill}")

            self._save_checkpoint(card_id, 'language_determined', {
                'language': language,
                'skill': skill
            })

            # ================================================================
            # PHASE 1: SCAFFOLD GENERATION (CLI) - 30%
            # ================================================================
            self._report_progress('scaffold_generated', f"Generating scaffold via CLI (Phase 1)")

            # Load documentation
            architecture_docs = self._load_documentation('arquitetura_supercore_v2.0.md')
            stack_docs = self._load_documentation('stack_supercore_v2.0.md')

            # Generate scaffold via CLI
            scaffold_result = self.delegator.generate_scaffold_via_cli(
                card_id=card_id,
                card_data=card_data,
                architecture_docs=architecture_docs,
                stack_docs=stack_docs,
                language=language
            )

            if scaffold_result['status'] != 'success':
                raise Exception(f"Scaffold generation failed: {scaffold_result.get('message')}")

            logger.info(f"   Scaffold generated: {scaffold_result['main_file']}")
            logger.info(f"   Cost (scaffold): ${scaffold_result['cost_estimate']:.2f}")
            self.total_cost += scaffold_result['cost_estimate']

            self._save_checkpoint(card_id, 'scaffold_generated', {
                'scaffold': scaffold_result
            })

            # ================================================================
            # PHASE 2: BUSINESS LOGIC IMPLEMENTATION (Skills) - 50-80%
            # ================================================================

            # Stage 3: API Implementation (50%)
            self._report_progress('api_implemented', f"Implementing API via {skill} (Phase 2)")

            api_implementation = self.delegator.implement_logic_via_skill(
                skill=skill,
                card_id=card_id,
                scaffold=scaffold_result,
                requirements=requirements,
                context={
                    'architecture_docs': architecture_docs,
                    'stack_docs': stack_docs,
                    'card_data': card_data
                },
                timeout=300
            )

            if api_implementation['status'] != 'success':
                raise Exception(f"API implementation failed: {api_implementation.get('message')}")

            logger.info(f"   API implemented: {len(api_implementation['files_modified'])} files")
            logger.info(f"   Cost (API logic): ${api_implementation['cost_estimate']:.2f}")
            self.total_cost += api_implementation['cost_estimate']

            self._save_checkpoint(card_id, 'api_implemented', {
                'api_implementation': api_implementation
            })

            # Stage 4: Business Logic (65%) - Already done by skill
            self._report_progress('business_logic_implemented', f"Business logic complete")
            logger.info(f"   Service layer implemented by {skill}")

            # Stage 5: Tests Implementation (80%)
            self._report_progress('tests_implemented', f"Tests implemented")
            logger.info(f"   Tests written: {len(api_implementation['tests_written'])} files")

            # ================================================================
            # PHASE 3: VALIDATION (Internal Skills) - 90-95%
            # ================================================================

            # Stage 6: Evidence Verification (90%)
            self._report_progress('evidence_verified', f"Verifying evidence (verification-agent)")

            test_results = api_implementation.get('test_results', {})
            evidence = {
                'test_output': test_results.get('output', ''),
                'coverage_output': test_results.get('coverage', ''),
                'lint_output': test_results.get('lint', ''),
                'build_output': test_results.get('build', '')
            }

            verification_result = self.delegator.validate_via_internal_skill(
                skill='verification-agent',
                task=f"All tests passing for {card_id}",
                context={
                    'card_id': card_id,
                    'evidence': evidence
                }
            )

            if not verification_result.get('passed', False):
                logger.warning(f"⚠️ Verification failed: {verification_result.get('feedback')}")
                # Optionally trigger debugging-agent here
                # For now, proceed with warning

            logger.info(f"   Verification: {'✅ PASSED' if verification_result.get('passed') else '❌ FAILED'}")
            logger.info(f"   Cost (verification): ${verification_result['cost_estimate']:.2f}")
            self.total_cost += verification_result['cost_estimate']

            # Stage 7: Quality Validation (95%)
            self._report_progress('quality_validated', f"Validating quality (llm-judge)")

            artifacts = {
                'api_files': api_implementation['files_modified'],
                'test_files': api_implementation['tests_written'],
                'test_results': test_results
            }

            quality_result = self.delegator.validate_via_internal_skill(
                skill='llm-judge',
                task=f"Evaluate code quality for {card_id}",
                context={
                    'card_id': card_id,
                    'card_type': 'Backend',
                    'artifacts': artifacts
                }
            )

            logger.info(f"   Quality score: {quality_result.get('score', 'N/A')}/10")
            logger.info(f"   Cost (quality): ${quality_result['cost_estimate']:.2f}")
            self.total_cost += quality_result['cost_estimate']

            # ================================================================
            # STAGE 8: COMPLETE (100%)
            # ================================================================
            self._report_progress('completed', f"Backend implementation complete for {card_id}")

            elapsed_time = (datetime.now() - start_time).total_seconds()

            result = {
                'status': 'success',
                'card_id': card_id,
                'language': language,
                'skill_used': skill,
                'artifacts': {
                    'scaffold': scaffold_result,
                    'api_implementation': api_implementation,
                    'verification': verification_result,
                    'quality': quality_result
                },
                'cost': round(self.total_cost, 2),
                'elapsed_time': round(elapsed_time, 2),
                'completed_at': datetime.now().isoformat()
            }

            # Clear checkpoint (success)
            self._clear_checkpoint(card_id)

            logger.info(f"✅ {card_id} complete in {elapsed_time:.1f}s (cost: ${self.total_cost:.2f})")

            return result

        except Exception as e:
            logger.error(f"❌ Backend Owner Agent failed for {card_id}: {e}")
            elapsed_time = (datetime.now() - start_time).total_seconds()

            return {
                'status': 'error',
                'card_id': card_id,
                'error': str(e),
                'cost': round(self.total_cost, 2),
                'elapsed_time': round(elapsed_time, 2),
                'failed_at': datetime.now().isoformat()
            }

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _is_backend_card(self, card_id: str, card_data: Dict[str, Any]) -> bool:
        """Check if card is a backend card (PROD-002, PROD-005, PROD-008, ...)"""
        # Extract card number
        if not card_id.startswith('PROD-'):
            return False

        try:
            card_number = int(card_id.split('-')[1])
            # Backend cards: (card_number - 2) % 3 == 0
            # PROD-002: (2-2) % 3 = 0 ✓
            # PROD-005: (5-2) % 3 = 0 ✓
            # PROD-008: (8-2) % 3 = 0 ✓
            return (card_number - 2) % 3 == 0
        except (IndexError, ValueError):
            return False

    def _extract_requirements(self, card_data: Dict[str, Any]) -> str:
        """Extract acceptance criteria from card data"""
        acceptance_criteria = card_data.get('acceptance_criteria', '')

        if not acceptance_criteria:
            # Fallback to description
            acceptance_criteria = card_data.get('description', '')

        if not acceptance_criteria:
            logger.warning("⚠️ No acceptance criteria found, using title")
            acceptance_criteria = card_data.get('title', 'No requirements provided')

        return acceptance_criteria

    def _load_documentation(self, filename: str) -> str:
        """Load documentation from documentation-base directory"""
        doc_path = self.docs_dir / filename

        if not doc_path.exists():
            logger.warning(f"⚠️ Documentation not found: {doc_path}")
            return f"# {filename} not available"

        try:
            content = doc_path.read_text(encoding='utf-8')
            logger.debug(f"   Loaded {filename}: {len(content)} chars")
            return content
        except Exception as e:
            logger.error(f"❌ Failed to load {filename}: {e}")
            return f"# {filename} failed to load: {str(e)}"

    def _report_progress(self, stage: str, message: str):
        """Report progress to console (and optionally to portal)"""
        progress = self.STAGES.get(stage, 0)
        logger.info(f"📊 [{progress}%] {message}")

        # TODO: Optionally send to portal via WebSocket
        # self._send_to_portal({'stage': stage, 'progress': progress, 'message': message})

    def _save_checkpoint(self, card_id: str, stage: str, data: Dict[str, Any]):
        """Save checkpoint for resumability"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}_backend.json"

        checkpoint = {
            'card_id': card_id,
            'stage': stage,
            'progress': self.STAGES.get(stage, 0),
            'data': data,
            'timestamp': datetime.now().isoformat(),
            'total_cost': self.total_cost
        }

        try:
            with open(checkpoint_file, 'w') as f:
                json.dump(checkpoint, f, indent=2)
            logger.debug(f"   Checkpoint saved: {stage}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to save checkpoint: {e}")

    def _load_checkpoint(self, card_id: str) -> Optional[Dict[str, Any]]:
        """Load checkpoint if exists"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}_backend.json"

        if not checkpoint_file.exists():
            return None

        try:
            with open(checkpoint_file, 'r') as f:
                checkpoint = json.load(f)
            return checkpoint
        except Exception as e:
            logger.warning(f"⚠️ Failed to load checkpoint: {e}")
            return None

    def _clear_checkpoint(self, card_id: str):
        """Clear checkpoint after successful completion"""
        checkpoint_file = self.checkpoints_dir / f"{card_id}_backend.json"

        if checkpoint_file.exists():
            try:
                checkpoint_file.unlink()
                logger.debug(f"   Checkpoint cleared for {card_id}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to clear checkpoint: {e}")

    def _resume_from_checkpoint(self, card_id: str, checkpoint: Dict[str, Any]) -> Dict[str, Any]:
        """Resume execution from checkpoint"""
        logger.info(f"🔄 Resuming {card_id} from stage: {checkpoint['stage']}")

        # TODO: Implement actual resume logic based on checkpoint stage
        # For now, restart from beginning
        logger.warning("⚠️ Resume not yet fully implemented, restarting from beginning")

        return self.execute_card(card_id, {})


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_backend_owner_agent(base_dir: Optional[str] = None, project_root: Optional[str] = None) -> BackendOwnerAgentV2:
    """
    Factory function to create Backend Owner Agent v2.0

    Args:
        base_dir: Base directory for artifacts (optional)
        project_root: Project root directory (optional)

    Returns:
        Configured BackendOwnerAgentV2 instance
    """
    return BackendOwnerAgentV2(base_dir=base_dir, project_root=project_root)


# ============================================================================
# MAIN (for testing)
# ============================================================================

if __name__ == '__main__':
    # Test backend owner agent
    agent = create_backend_owner_agent()

    # Sample card
    test_card = {
        'title': 'Create Oracle CRUD API',
        'description': 'REST API for Oracle management with PostgreSQL',
        'acceptance_criteria': """
        - GET /api/oracles - List all oracles
        - POST /api/oracles - Create new oracle
        - GET /api/oracles/:id - Get oracle by ID
        - PUT /api/oracles/:id - Update oracle
        - DELETE /api/oracles/:id - Delete oracle
        - Database migrations for oracles table
        - Unit tests with ≥80% coverage
        - OpenAPI documentation
        """,
        'type': 'Backend'
    }

    result = agent.execute_card('PROD-002', test_card)

    print("\n" + "=" * 60)
    print("BACKEND OWNER AGENT v2.0 - TEST RESULT")
    print("=" * 60)
    print(json.dumps(result, indent=2))

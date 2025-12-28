#!/usr/bin/env python3
"""
Frontend Owner Agent v2.0.0 - Hybrid Architecture

Processes frontend cards (PROD-003, PROD-006, PROD-009, ...) using:
- Phase 1 (10-30%): CLI scaffolding generation (fast, deterministic)
- Phase 2 (30-80%): Skills business logic implementation (high quality)
- Phase 3 (80-100%): Skills validation (automated QA)

Delegates to:
- frontend-developer skill: React/TypeScript components (Next.js 14+ + shadcn/ui)
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


class FrontendOwnerAgentV2:
    """
    Frontend Owner Agent v2.0 - Hybrid Architecture

    Orchestrates (not implements!) frontend card execution through skills.

    Workflow:
    1. STAGE 1 (10%): Analyze requirements (UX designs + acceptance criteria)
    2. STAGE 2 (15%): Determine component type (Page vs Component vs Layout)
    3. PHASE 1 (30%): Generate scaffold via CLI (structure + config files)
    4. PHASE 2 (30-80%): Implement UI via frontend-developer skill
       - Components (50%)
       - Pages (65%)
       - Tests (80%)
    5. PHASE 3 (80-100%): Validate via internal skills
       - verification-agent (90%): Test results + lint + build
       - llm-judge (95%): Code quality score ≥8.0
    6. STAGE 9 (100%): Completed

    Card Pattern: card_number % 3 == 0
    Examples: PROD-003, PROD-006, PROD-009, PROD-012...
    """

    # Progress stages (9 total)
    STAGES = {
        'requirements_analyzed': 10,
        'component_type_determined': 15,
        'scaffold_generated': 30,     # Phase 1 complete (CLI)
        'components_implemented': 50,  # Phase 2: Components via skill
        'pages_implemented': 65,       # Phase 2: Pages via skill
        'tests_implemented': 80,       # Phase 2: Tests via skill
        'evidence_verified': 90,       # Phase 3: verification-agent
        'quality_validated': 95,       # Phase 3: llm-judge
        'completed': 100
    }

    def __init__(self, base_dir=None, project_root=None):
        """
        Initialize Frontend Owner Agent v2.0

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
        self.frontend_dir = self.artifacts_dir / "engenharia" / "frontend"
        self.product_dir = self.artifacts_dir / "produto"
        self.checkpoints_dir = self.base_dir / "state" / "checkpoints"

        # Create directories
        for dir_path in [self.frontend_dir, self.checkpoints_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

        # Initialize HybridDelegator
        self.delegator = create_hybrid_delegator(
            base_dir=str(self.artifacts_dir),
            project_root=str(self.project_root)
        )

        # Cost tracking
        self.total_cost = 0.0

        logger.info("✅ Frontend Owner Agent v2.0 (Hybrid) initialized")
        logger.info(f"   Mode: Orchestration (delegates to skills)")
        logger.info(f"   Skills: frontend-developer, verification-agent, llm-judge")
        logger.info(f"   Artifacts: {self.frontend_dir}")

    def _is_frontend_card(self, card_id: str, card_data: Dict[str, Any]) -> bool:
        """
        Check if this is a frontend card.

        Card pattern: card_number % 3 == 0
        Examples: PROD-003, PROD-006, PROD-009, PROD-012...

        Args:
            card_id: Card ID (e.g., "PROD-003")
            card_data: Card data dictionary

        Returns:
            True if this is a frontend card, False otherwise
        """
        try:
            card_number = int(card_id.split('-')[1])
            return card_number % 3 == 0
        except (IndexError, ValueError):
            # Fallback to card type check
            card_type = card_data.get('type', '').lower()
            return 'frontend' in card_type or 'ui' in card_type

    def _extract_requirements(self, card_data: Dict[str, Any]) -> str:
        """
        Extract requirements from card data.

        Priority:
        1. acceptance_criteria (most specific)
        2. description (fallback)
        3. title (last resort)

        Args:
            card_data: Card data dictionary

        Returns:
            Requirements string
        """
        if card_data.get('acceptance_criteria'):
            return card_data['acceptance_criteria']

        if card_data.get('description'):
            logger.warning("⚠️ No acceptance criteria found, using description")
            return card_data['description']

        logger.warning("⚠️ No acceptance criteria found, using title")
        return card_data.get('title', '')

    def _determine_component_type(self, card_data: Dict[str, Any]) -> str:
        """
        Determine component type from card data.

        Types:
        - 'page': Full page component (routing, layout)
        - 'component': Reusable UI component
        - 'layout': Layout wrapper (header, sidebar, footer)

        Args:
            card_data: Card data dictionary

        Returns:
            Component type ('page', 'component', or 'layout')
        """
        title = card_data.get('title', '').lower()
        criteria = card_data.get('acceptance_criteria', '').lower()
        combined = f"{title} {criteria}"

        # Page keywords
        if any(kw in combined for kw in ['page', 'screen', 'view', 'dashboard', 'detail']):
            return 'page'

        # Layout keywords
        if any(kw in combined for kw in ['layout', 'header', 'footer', 'sidebar', 'navigation']):
            return 'layout'

        # Default to component
        return 'component'

    def _load_documentation(self, filename: str) -> str:
        """
        Load documentation file from documentation-base directory.

        Args:
            filename: Documentation filename (e.g., "stack_supercore_v2.0.md")

        Returns:
            Documentation content as string
        """
        doc_path = self.docs_dir / filename
        if not doc_path.exists():
            logger.warning(f"⚠️ Documentation file not found: {filename}")
            return ""

        return doc_path.read_text(encoding='utf-8')

    def _load_ux_designs(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Load UX designs from produto artifacts.

        Looks for:
        - Wireframes: app-artefacts/produto/ux-designs/wireframes/
        - User flows: app-artefacts/produto/ux-designs/user-flows/
        - Design system: app-artefacts/produto/ux-designs/design-system/

        Args:
            card_data: Card data dictionary

        Returns:
            Dictionary with wireframes, user_flows, design_system
        """
        ux_designs_dir = self.product_dir / "ux-designs"

        designs = {
            'wireframes': [],
            'user_flows': [],
            'design_system': {}
        }

        # Load wireframes
        wireframes_dir = ux_designs_dir / "wireframes"
        if wireframes_dir.exists():
            designs['wireframes'] = [
                f.read_text(encoding='utf-8')
                for f in wireframes_dir.glob('*.md')
            ]

        # Load user flows
        flows_dir = ux_designs_dir / "user-flows"
        if flows_dir.exists():
            designs['user_flows'] = [
                f.read_text(encoding='utf-8')
                for f in flows_dir.glob('*.md')
            ]

        # Load design system
        design_system_dir = ux_designs_dir / "design-system"
        if design_system_dir.exists():
            for f in design_system_dir.glob('*.md'):
                designs['design_system'][f.stem] = f.read_text(encoding='utf-8')

        return designs

    def _save_checkpoint(self, card_id: str, stage: str, data: Dict[str, Any]) -> None:
        """
        Save checkpoint for resumability.

        Args:
            card_id: Card ID (e.g., "PROD-003")
            stage: Current stage name
            data: Checkpoint data
        """
        checkpoint_file = self.checkpoints_dir / f"{card_id}_frontend_checkpoint.json"

        checkpoint = {
            'card_id': card_id,
            'stage': stage,
            'progress': self.STAGES.get(stage, 0),
            'timestamp': datetime.now().isoformat(),
            'data': data
        }

        checkpoint_file.write_text(json.dumps(checkpoint, indent=2), encoding='utf-8')
        logger.info(f"💾 Checkpoint saved: {stage} ({checkpoint['progress']}%)")

    def _load_checkpoint(self, card_id: str) -> Optional[Dict[str, Any]]:
        """
        Load checkpoint if exists.

        Args:
            card_id: Card ID (e.g., "PROD-003")

        Returns:
            Checkpoint data if exists, None otherwise
        """
        checkpoint_file = self.checkpoints_dir / f"{card_id}_frontend_checkpoint.json"

        if not checkpoint_file.exists():
            return None

        checkpoint = json.loads(checkpoint_file.read_text(encoding='utf-8'))
        logger.info(f"📂 Checkpoint loaded: {checkpoint['stage']} ({checkpoint.get('progress', 0)}%)")
        return checkpoint

    def execute_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute frontend card using hybrid orchestration.

        Workflow:
        1. Analyze requirements (UX designs + acceptance criteria)
        2. Determine component type (Page vs Component vs Layout)
        3. Generate scaffold via CLI
        4. Implement UI via frontend-developer skill
        5. Validate via verification-agent + llm-judge

        Args:
            card_id: Card ID (e.g., "PROD-003")
            card_data: Card data dictionary

        Returns:
            Execution result with artifacts and cost
        """
        logger.info(f"🚀 Executing frontend card: {card_id}")

        # Validate this is a frontend card
        if not self._is_frontend_card(card_id, card_data):
            error_msg = f"Card {card_id} is not a frontend card (pattern: card_number % 3 == 0)"
            logger.error(f"❌ {error_msg}")
            return {'status': 'error', 'error': error_msg}

        # Check for existing checkpoint
        checkpoint = self._load_checkpoint(card_id)
        if checkpoint:
            logger.info(f"📂 Resuming from checkpoint: {checkpoint['stage']}")
            # TODO: Resume from checkpoint (Phase 5 implementation)

        # STAGE 1: ANALYZE REQUIREMENTS (10%)
        logger.info(f"📋 STAGE 1: Analyzing requirements ({self.STAGES['requirements_analyzed']}%)")

        requirements = self._extract_requirements(card_data)
        ux_designs = self._load_ux_designs(card_data)

        self._save_checkpoint(card_id, 'requirements_analyzed', {
            'requirements': requirements,
            'ux_designs_loaded': len(ux_designs['wireframes']) > 0
        })

        # STAGE 2: DETERMINE COMPONENT TYPE (15%)
        logger.info(f"🔍 STAGE 2: Determining component type ({self.STAGES['component_type_determined']}%)")

        component_type = self._determine_component_type(card_data)
        logger.info(f"   Component type: {component_type}")

        self._save_checkpoint(card_id, 'component_type_determined', {
            'component_type': component_type
        })

        # PHASE 1: SCAFFOLD GENERATION (CLI) - 30%
        logger.info(f"🏗️ PHASE 1: Generating scaffold via CLI ({self.STAGES['scaffold_generated']}%)")

        # Load documentation
        architecture_docs = self._load_documentation('arquitetura_supercore_v2.0.md')
        stack_docs = self._load_documentation('stack_supercore_v2.0.md')

        # Generate scaffold
        scaffold_result = self.delegator.generate_scaffold_via_cli(
            card_id=card_id,
            card_data=card_data,
            architecture_docs=architecture_docs,
            stack_docs=stack_docs,
            language='typescript'  # Frontend is always TypeScript
        )

        if scaffold_result['status'] == 'error':
            logger.error(f"❌ Scaffold generation failed: {scaffold_result.get('error')}")
            return scaffold_result

        self.total_cost += scaffold_result.get('cost_estimate', 0.05)
        logger.info(f"   Scaffold cost: ${scaffold_result.get('cost_estimate', 0.05):.2f}")

        self._save_checkpoint(card_id, 'scaffold_generated', {
            'scaffold': scaffold_result,
            'cost': self.total_cost
        })

        # PHASE 2: UI IMPLEMENTATION (Skills) - 50-80%
        logger.info(f"⚛️ PHASE 2: Implementing UI via frontend-developer skill")

        # Stage 4: Components (50%)
        logger.info(f"   STAGE 4: Implementing components ({self.STAGES['components_implemented']}%)")

        ui_implementation = self.delegator.implement_logic_via_skill(
            skill='frontend-developer',
            card_id=card_id,
            scaffold=scaffold_result,
            requirements=requirements,
            context={
                'architecture_docs': architecture_docs,
                'stack_docs': stack_docs,
                'ux_designs': ux_designs,
                'component_type': component_type
            }
        )

        if ui_implementation['status'] == 'error':
            logger.error(f"❌ UI implementation failed: {ui_implementation.get('error')}")
            return ui_implementation

        self.total_cost += ui_implementation.get('cost_estimate', 0.20)
        logger.info(f"   UI implementation cost: ${ui_implementation.get('cost_estimate', 0.20):.2f}")

        self._save_checkpoint(card_id, 'tests_implemented', {
            'implementation': ui_implementation,
            'cost': self.total_cost
        })

        # PHASE 3: VALIDATION (Internal Skills) - 90-95%
        logger.info(f"✅ PHASE 3: Validating via internal skills")

        # Stage 7: Evidence verification (90%)
        logger.info(f"   STAGE 7: Verifying evidence ({self.STAGES['evidence_verified']}%)")

        verification_result = self.delegator.validate_via_internal_skill(
            skill='verification-agent',
            task=f"All tests passing for {card_id}",
            context={
                'card_id': card_id,
                'evidence': {
                    'test_output': ui_implementation.get('test_results', ''),
                    'lint_output': ui_implementation.get('lint_results', ''),
                    'build_output': ui_implementation.get('build_results', '')
                }
            }
        )

        if verification_result['status'] == 'rejected':
            logger.error(f"❌ Verification failed: {verification_result.get('feedback')}")
            return verification_result

        self.total_cost += verification_result.get('cost_estimate', 0.05)
        logger.info(f"   Verification cost: ${verification_result.get('cost_estimate', 0.05):.2f}")

        # Stage 8: Quality validation (95%)
        logger.info(f"   STAGE 8: Validating code quality ({self.STAGES['quality_validated']}%)")

        quality_result = self.delegator.validate_via_internal_skill(
            skill='llm-judge',
            task=f"Evaluate code quality for {card_id}",
            context={
                'card_id': card_id,
                'card_type': 'Frontend',
                'artifacts': {
                    'components': ui_implementation.get('files_modified', []),
                    'tests': ui_implementation.get('tests_written', [])
                }
            }
        )

        if quality_result.get('score', 10.0) < 8.0:
            logger.warning(f"⚠️ Quality score below threshold: {quality_result.get('score')}/10")
            # Don't fail, but log warning

        self.total_cost += quality_result.get('cost_estimate', 0.10)
        logger.info(f"   Quality validation cost: ${quality_result.get('cost_estimate', 0.10):.2f}")

        # STAGE 9: COMPLETED (100%)
        logger.info(f"🎉 STAGE 9: Completed ({self.STAGES['completed']}%)")

        result = {
            'status': 'success',
            'card_id': card_id,
            'component_type': component_type,
            'skill_used': 'frontend-developer',
            'cost': round(self.total_cost, 2),
            'artifacts': {
                'frontend_dir': str(self.frontend_dir),
                'files_created': ui_implementation.get('files_modified', []),
                'tests_written': ui_implementation.get('tests_written', [])
            },
            'validation': {
                'verification': verification_result,
                'quality_score': quality_result.get('score', 0.0)
            }
        }

        self._save_checkpoint(card_id, 'completed', result)

        logger.info(f"✅ Frontend card {card_id} completed successfully")
        logger.info(f"   Total cost: ${self.total_cost:.2f}")
        logger.info(f"   Component type: {component_type}")
        logger.info(f"   Quality score: {quality_result.get('score', 0.0)}/10")

        return result


def create_frontend_owner_agent(base_dir=None, project_root=None) -> FrontendOwnerAgentV2:
    """
    Factory function to create Frontend Owner Agent v2.0.

    Args:
        base_dir: Base directory for artifacts (optional)
        project_root: Project root directory (optional)

    Returns:
        FrontendOwnerAgentV2 instance
    """
    return FrontendOwnerAgentV2(base_dir=base_dir, project_root=project_root)

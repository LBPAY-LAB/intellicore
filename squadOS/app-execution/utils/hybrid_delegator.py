"""
HybridDelegator - Unified delegation interface for SquadOS Hybrid Architecture

Supports three delegation modes:
1. Claude CLI (programmatic) - For scaffolding generation
2. Claude Agent SDK Skills - For business logic implementation
3. Internal Skills - For validation (verification-agent, llm-judge, debugging-agent)

Architecture Pattern: "Arquiteto-Agente Híbrido"
- Phase 1: CLI for fast structure generation (no business logic)
- Phase 2: Skills for precise business logic implementation
- Phase 3: Skills for automated validation

Author: SquadOS Architecture Team
Version: 1.0.0 (Hybrid)
Date: 2025-12-28
"""

import json
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime


class HybridDelegator:
    """
    Unified delegation interface supporting:
    1. Claude CLI (programmatic) - For scaffolding
    2. Claude Agent SDK Skills - For business logic
    3. Internal Skills - For validation

    Cost Optimization:
    - CLI scaffolding: $0.05/card (fast, deterministic)
    - Skills business logic: $0.20/card (high quality)
    - Skills validation: $0.10/card (automated QA)
    - Total: $0.35/card (22% cheaper than pure skills)
    """

    def __init__(self, base_dir: Path, project_root: Path):
        """
        Initialize HybridDelegator

        Args:
            base_dir: Base directory for artifacts (squadOS/app-artefacts)
            project_root: Project root directory (for documentation access)
        """
        self.base_dir = Path(base_dir)
        self.project_root = Path(project_root)
        self.artifacts_dir = self.base_dir / "engenharia"
        self.docs_dir = self.project_root / "app-generation" / "documentation-base"

        # Ensure directories exist
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)

    # ========================================================================
    # PHASE 1: SCAFFOLDING (Claude CLI - Programmatic)
    # ========================================================================

    def generate_scaffold_via_cli(
        self,
        card_id: str,
        card_data: Dict[str, Any],
        architecture_docs: str,
        stack_docs: str,
        language: str = "auto"
    ) -> Dict[str, Any]:
        """
        Generate project scaffold using Claude CLI (programmatic invocation)

        Purpose:
        - Create file/directory structure
        - Generate empty classes and functions (signatures only)
        - Create configuration files (Dockerfile, requirements.txt, go.mod)
        - DO NOT implement business logic

        Args:
            card_id: Card identifier (e.g., PROD-002)
            card_data: Card metadata (title, acceptance_criteria, etc.)
            architecture_docs: Content of arquitetura_supercore_v2.0.md
            stack_docs: Content of stack_supercore_v2.0.md
            language: Target language ('go', 'python', 'typescript', 'auto')

        Returns:
            {
                'status': 'success' | 'error',
                'file_structure': {...},
                'main_file': 'path/to/main/file',
                'config_files': [...],
                'message': 'Scaffold generated successfully',
                'cost_estimate': 0.05  # USD
            }
        """
        try:
            # Determine language from card data if auto
            if language == "auto":
                language = self._detect_language_from_card(card_data)

            # Build CLI prompt
            prompt = self._build_scaffold_prompt(
                card_id, card_data, architecture_docs, stack_docs, language
            )

            # Create temporary context file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(prompt)
                context_file = f.name

            # Invoke Claude CLI programmatically
            result = subprocess.run(
                [
                    'claude',
                    '--prompt', f"@{context_file}",
                    '--output-format', 'json',
                    '--model', 'haiku'  # Fast, cheap for scaffolding
                ],
                capture_output=True,
                text=True,
                timeout=60
            )

            # Clean up temp file
            Path(context_file).unlink()

            if result.returncode != 0:
                return {
                    'status': 'error',
                    'message': f"CLI invocation failed: {result.stderr}",
                    'cost_estimate': 0.0
                }

            # Parse CLI output
            cli_output = json.loads(result.stdout)

            # Extract scaffold information
            scaffold = self._parse_cli_scaffold_output(cli_output, card_id, language)

            return {
                'status': 'success',
                **scaffold,
                'cost_estimate': 0.05
            }

        except subprocess.TimeoutExpired:
            return {
                'status': 'error',
                'message': 'CLI invocation timed out (60s)',
                'cost_estimate': 0.0
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Scaffold generation failed: {str(e)}",
                'cost_estimate': 0.0
            }

    def _build_scaffold_prompt(
        self,
        card_id: str,
        card_data: Dict[str, Any],
        architecture_docs: str,
        stack_docs: str,
        language: str
    ) -> str:
        """Build CLI prompt for scaffold generation"""

        # Extract relevant sections from architecture
        architecture_section = self._extract_architecture_section(architecture_docs, language)
        stack_section = self._extract_stack_section(stack_docs, language)

        prompt = f"""
Generate ONLY the file structure and empty code skeletons for this microservice.

Card ID: {card_id}
Title: {card_data.get('title', 'Untitled')}
Type: {card_data.get('type', 'Backend')}
Language: {language}

Requirements:
{card_data.get('acceptance_criteria', 'No criteria provided')}

Architecture Reference:
{architecture_section}

Stack Reference:
{stack_section}

CRITICAL INSTRUCTIONS:
1. Generate ONLY directory structure and empty files
2. Create function/method SIGNATURES (no implementation)
3. Add configuration files (Dockerfile, requirements.txt, go.mod, package.json)
4. DO NOT implement any business logic
5. Add TODO comments where logic should be implemented
6. Follow architecture patterns from documentation

Output Format (JSON):
{{
    "file_structure": {{
        "directories": ["dir1", "dir2"],
        "files": [
            {{
                "path": "relative/path/file.ext",
                "content": "empty skeleton code",
                "description": "Purpose of this file"
            }}
        ]
    }},
    "main_file": "path/to/main/entry/point",
    "config_files": ["Dockerfile", "requirements.txt"],
    "entry_points": ["function_name", "class_name"]
}}

Example for Go:
{{
    "file_structure": {{
        "directories": ["cmd/api", "internal/handlers", "internal/models"],
        "files": [
            {{
                "path": "cmd/api/main.go",
                "content": "package main\\n\\nfunc main() {{\\n\\t// TODO: Initialize server\\n}}",
                "description": "Main entry point"
            }}
        ]
    }},
    "main_file": "cmd/api/main.go",
    "config_files": ["Dockerfile", "go.mod"],
    "entry_points": ["main"]
}}
"""
        return prompt

    def _detect_language_from_card(self, card_data: Dict[str, Any]) -> str:
        """Detect language from card metadata"""
        title = card_data.get('title', '').lower()
        criteria = card_data.get('acceptance_criteria', '').lower()
        card_type = card_data.get('type', '').lower()
        combined = f"{title} {criteria}"

        # UI keywords → TypeScript (check FIRST to avoid false positives)
        if any(kw in combined for kw in ['ui', 'frontend', 'react', 'component', 'page', 'dashboard']) or 'frontend' in card_type:
            return 'typescript'

        # RAG/AI keywords → Python (use word boundaries to avoid "agent" in "component")
        rag_keywords = ['rag', ' ai ', 'llm', 'crew', ' agent', 'embedding', 'vector', 'chatbot']
        if any(kw in combined for kw in rag_keywords):
            return 'python'

        # CRUD/Data keywords → Go
        if any(kw in combined for kw in ['crud', 'api', 'rest', 'database', 'oracle', 'object']):
            return 'go'

        # Default to Go for backend
        if 'backend' in card_type:
            return 'go'

        return 'typescript'  # Default for Frontend

    def _extract_architecture_section(self, architecture_docs: str, language: str) -> str:
        """Extract relevant architecture section based on language"""
        # For now, return first 1000 chars
        # TODO: Implement intelligent section extraction based on language/layer
        return architecture_docs[:1000] + "\n\n[...truncated for brevity...]"

    def _extract_stack_section(self, stack_docs: str, language: str) -> str:
        """Extract relevant stack section based on language"""
        # For now, return first 1000 chars
        # TODO: Implement intelligent section extraction based on language
        return stack_docs[:1000] + "\n\n[...truncated for brevity...]"

    def _parse_cli_scaffold_output(
        self,
        cli_output: Dict[str, Any],
        card_id: str,
        language: str
    ) -> Dict[str, Any]:
        """Parse CLI output and extract scaffold information"""

        # Extract file structure from CLI response
        file_structure = cli_output.get('file_structure', {})

        return {
            'file_structure': file_structure,
            'main_file': cli_output.get('main_file', ''),
            'config_files': cli_output.get('config_files', []),
            'entry_points': cli_output.get('entry_points', []),
            'language': language,
            'message': f"Scaffold generated for {card_id}"
        }

    # ========================================================================
    # PHASE 2: BUSINESS LOGIC (Claude Agent SDK Skills)
    # ========================================================================

    def implement_logic_via_skill(
        self,
        skill: str,
        card_id: str,
        scaffold: Dict[str, Any],
        requirements: str,
        context: Dict[str, Any],
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        Implement business logic using specialized skill

        Skills have access to:
        - read_file(path): Read existing scaffold code
        - write_file(path, content): Implement logic in files
        - run_tests(test_file): Validate implementation

        Args:
            skill: Skill name ('golang-pro', 'fastapi-pro', 'frontend-developer')
            card_id: Card identifier
            scaffold: Scaffold from Phase 1 (file structure, entry points)
            requirements: Acceptance criteria from card
            context: Additional context (architecture docs, stack docs)
            timeout: Max execution time in seconds

        Returns:
            {
                'status': 'success' | 'error',
                'files_modified': [...],
                'tests_written': [...],
                'test_results': {...},
                'message': 'Implementation complete',
                'cost_estimate': 0.20  # USD
            }
        """
        try:
            # Build task description for skill
            task = self._build_skill_task(
                card_id, scaffold, requirements, context
            )

            # Create context file for skill
            context_file = self._create_skill_context_file(
                card_id, scaffold, context
            )

            # Invoke skill via Claude Agent SDK
            result = subprocess.run(
                [
                    'claude', 'agent', 'run', skill,
                    '--task', task,
                    '--context', context_file,
                    '--output-format', 'json'
                ],
                capture_output=True,
                text=True,
                timeout=timeout
            )

            # Clean up context file
            Path(context_file).unlink()

            if result.returncode != 0:
                return {
                    'status': 'error',
                    'message': f"Skill invocation failed: {result.stderr}",
                    'cost_estimate': 0.0
                }

            # Parse skill output
            skill_output = json.loads(result.stdout)

            return {
                'status': 'success',
                'files_modified': skill_output.get('files_modified', []),
                'tests_written': skill_output.get('tests_written', []),
                'test_results': skill_output.get('test_results', {}),
                'message': skill_output.get('message', 'Implementation complete'),
                'cost_estimate': 0.20
            }

        except subprocess.TimeoutExpired:
            return {
                'status': 'error',
                'message': f'Skill invocation timed out ({timeout}s)',
                'cost_estimate': 0.0
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Skill invocation failed: {str(e)}",
                'cost_estimate': 0.0
            }

    def _build_skill_task(
        self,
        card_id: str,
        scaffold: Dict[str, Any],
        requirements: str,
        context: Dict[str, Any]
    ) -> str:
        """Build task description for skill"""

        main_file = scaffold.get('main_file', '')
        entry_points = scaffold.get('entry_points', [])

        task = f"""
Implement business logic for {card_id}.

Requirements:
{requirements}

Existing Structure:
- Main file: {main_file}
- Entry points: {', '.join(entry_points)}

Tasks:
1. Read code from scaffold files
2. Implement empty functions with business logic
3. Add comprehensive error handling
4. Add input validation
5. Add logging
6. Write unit tests (≥80% coverage)
7. Run tests and validate

Use tools: read_file(), write_file(), run_tests()

Architecture context available in context file.
"""
        return task

    def _create_skill_context_file(
        self,
        card_id: str,
        scaffold: Dict[str, Any],
        context: Dict[str, Any]
    ) -> str:
        """Create context file for skill with architecture/stack docs"""

        context_data = {
            'card_id': card_id,
            'scaffold': scaffold,
            'architecture_docs': context.get('architecture_docs', ''),
            'stack_docs': context.get('stack_docs', ''),
            'timestamp': datetime.now().isoformat()
        }

        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(context_data, f, indent=2)
            return f.name

    # ========================================================================
    # PHASE 3: VALIDATION (Internal Skills)
    # ========================================================================

    def validate_via_internal_skill(
        self,
        skill: str,
        task: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate implementation using internal skill

        Internal skills (already implemented):
        - verification-agent: Evidence validation (obra ow-002)
        - llm-judge: Code quality scoring via rubrics
        - debugging-agent: Systematic debugging (obra ow-006)

        Args:
            skill: Skill name ('verification-agent', 'llm-judge', 'debugging-agent')
            task: Validation task description
            context: Validation context (evidence, artifacts, etc.)

        Returns:
            {
                'status': 'success' | 'error',
                'passed': True | False,
                'score': 8.5,  # For llm-judge
                'feedback': '...',
                'cost_estimate': 0.10  # USD
            }
        """
        try:
            # Import internal skill dynamically
            if skill == 'verification-agent':
                from ..agents.verification_agent import VerificationAgent
                agent = VerificationAgent(base_dir=str(self.base_dir))
                result = agent.validate_card_completion(
                    card_id=context.get('card_id', ''),
                    claim=task,
                    evidence=context.get('evidence', {})
                )

            elif skill == 'llm-judge':
                from ..agents.llm_judge_agent import LLMJudgeAgent
                agent = LLMJudgeAgent(base_dir=str(self.base_dir))
                result = agent.evaluate_code_quality(
                    card_id=context.get('card_id', ''),
                    card_type=context.get('card_type', 'Backend'),
                    artifacts=context.get('artifacts', {})
                )

            elif skill == 'debugging-agent':
                from ..agents.debugging_agent import DebuggingAgent
                agent = DebuggingAgent(base_dir=str(self.base_dir))
                result = agent.debug_issue(
                    card_id=context.get('card_id', ''),
                    issue_description=task,
                    error_logs=context.get('error_logs', ''),
                    stack_trace=context.get('stack_trace', '')
                )

            else:
                return {
                    'status': 'error',
                    'message': f"Unknown internal skill: {skill}",
                    'cost_estimate': 0.0
                }

            return {
                'status': 'success',
                **result,
                'cost_estimate': 0.10
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': f"Internal skill invocation failed: {str(e)}",
                'cost_estimate': 0.0
            }

    # ========================================================================
    # UTILITY METHODS
    # ========================================================================

    def get_total_cost_estimate(
        self,
        scaffold_result: Dict[str, Any],
        logic_result: Dict[str, Any],
        validation_results: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate total cost for hybrid execution

        Returns:
            Total cost in USD (typically $0.35/card)
        """
        total = 0.0
        total += scaffold_result.get('cost_estimate', 0.0)
        total += logic_result.get('cost_estimate', 0.0)

        for validation_result in validation_results:
            total += validation_result.get('cost_estimate', 0.0)

        return round(total, 2)


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_hybrid_delegator(base_dir: str, project_root: str) -> HybridDelegator:
    """
    Factory function to create HybridDelegator instance

    Args:
        base_dir: Base directory for artifacts
        project_root: Project root directory

    Returns:
        Configured HybridDelegator instance
    """
    return HybridDelegator(
        base_dir=Path(base_dir),
        project_root=Path(project_root)
    )

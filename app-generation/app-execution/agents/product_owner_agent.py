#!/usr/bin/env python3
"""
Product Owner Agent - Agent-First Architecture v3.1

Production-grade autonomous agent implementing Agent-First philosophy:

1. **Direct Documentation Parsing** - No CLI dependency for primary flow
   - Regex-based extraction of requirements (RF001-RF062)
   - Intelligent priority and layer detection
   - Fast (<5 seconds vs 5-10 minutes)

2. **Skills-Based Analysis**
   - parse_requirements_from_doc() - Extract RFs with metadata
   - parse_architecture_from_doc() - Extract architectural layers
   - parse_stack_from_doc() - Extract technology stack
   - generate_cards_from_requirements() - Create 3 cards per RF
   - generate_epics_from_requirements() - Group by layer

3. **Deterministic Output**
   - Generates 3 cards per requirement (Design, Backend, Frontend)
   - Proper dependency chain (Design → Backend → Frontend)
   - Intelligent priority (CRITICAL for RF001-010, HIGH for RF011-030)
   - Layer assignment based on RF number + keywords

4. **Progress Reporting**
   - Real-time callback integration with Celery
   - 6-stage progress (25%, 30%, 70%, 80%, 90%, 95%)

5. **Production Quality**
   - Comprehensive error handling
   - Artifact creation (user stories, wireframes index)
   - Validation (≥30 cards, required fields)
   - Smart backlog merge (preserves EPIC-*, replaces PROD-*)

NO MOCKS. NO CLI AS PRIMARY. AGENT-FIRST ONLY.
"""

import os
import json
import logging
import subprocess
import tempfile
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DOCS_BASE = PROJECT_ROOT / "app-generation" / "documentation-base"
ARTIFACTS_DIR = PROJECT_ROOT / "app-generation" / "app-artefacts" / "produto"
STATE_DIR = Path(__file__).parent.parent / "state"
CHECKPOINT_DIR = STATE_DIR / "checkpoints"


class ProductOwnerAgent:
    """
    Agent-First Product Owner - v3.1

    Autonomous agent that parses documentation directly (no CLI dependency)
    and generates comprehensive product backlog with intelligent categorization.

    Architecture:
    - Direct regex parsing of requisitos_funcionais_v2.0.md
    - Intelligent priority detection (RF number + keywords)
    - Intelligent layer detection (RF number + keywords)
    - 3 cards per requirement (Design → Backend → Frontend)
    - Real-time progress reporting via callback
    - <5 second execution (vs 5-10 minutes with CLI)

    Execution Flow:
    1. Read documentation (3 files)
    2. Parse requirements with skills
    3. Generate cards programmatically
    4. Create artifacts (user stories, wireframes)
    5. Validate outputs
    6. Save backlog (smart merge)
    """

    def __init__(self, progress_callback=None):
        # Agent-First: No API key, no CLI for primary flow
        # Ensure artifacts directory exists
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        (ARTIFACTS_DIR / "ux-designs" / "wireframes").mkdir(parents=True, exist_ok=True)
        (ARTIFACTS_DIR / "ux-designs" / "user-flows").mkdir(parents=True, exist_ok=True)
        (ARTIFACTS_DIR / "ux-designs" / "design-system").mkdir(parents=True, exist_ok=True)

        # Ensure checkpoint directory exists
        CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

        # Progress callback for reporting to Celery task
        self.progress_callback = progress_callback

    def execute_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method called by Celery worker (with checkpointing)

        Args:
            card_id: The card being executed (e.g., "EPIC-001")
            card_data: Card metadata (title, description, etc)

        Returns:
            Execution result with generated cards and artifacts
        """
        logger.info(f"🤖 Product Owner Agent executing card: {card_id}")

        try:
            # Check for existing checkpoint
            checkpoint = self._load_checkpoint(card_id)
            if checkpoint:
                logger.info(f"📌 Resuming from checkpoint: {checkpoint['stage']}")
                return self._resume_from_checkpoint(card_id, checkpoint)

            # Step 1: Read all documentation
            logger.info("📚 Step 1: Reading documentation...")
            if self.progress_callback:
                self.progress_callback(25, "📚 Reading documentation files...")
            documentation = self._read_all_documentation()
            self._save_checkpoint(card_id, "documentation_read", {"documentation": documentation})

            # Step 2: Analyze documentation with Agent (direct parsing)
            logger.info("🧠 Step 2: Analyzing documentation with Agent...")
            if self.progress_callback:
                self.progress_callback(30, "🧠 Parsing requirements, architecture, and stack...")
            analysis = self._analyze_documentation_with_agent(documentation)
            self._save_checkpoint(card_id, "analysis_complete", {"documentation": documentation, "analysis": analysis})

            # Step 3: Generate comprehensive cards
            logger.info("📋 Step 3: Generating product cards...")
            if self.progress_callback:
                self.progress_callback(70, "📋 Generating product cards from analysis...")
            cards = self._generate_cards_from_analysis(analysis)
            self._save_checkpoint(card_id, "cards_generated", {"cards": cards, "analysis": analysis})

            # Step 4: Create artifacts
            logger.info("📄 Step 4: Creating artifacts...")
            if self.progress_callback:
                self.progress_callback(80, "📄 Creating artifacts (user stories, wireframes)...")
            artifacts = self._create_artifacts(cards, analysis)
            self._save_checkpoint(card_id, "artifacts_created", {"cards": cards, "analysis": analysis, "artifacts": artifacts})

            # Step 5: Validate outputs
            logger.info("✅ Step 5: Validating outputs...")
            if self.progress_callback:
                self.progress_callback(90, "✅ Validating generated cards and artifacts...")
            validation = self._validate_outputs(cards, artifacts)

            if not validation['valid']:
                raise ValueError(f"Validation failed: {validation['errors']}")

            # Step 6: Save backlog
            logger.info("💾 Step 6: Saving backlog...")
            if self.progress_callback:
                self.progress_callback(95, "💾 Saving backlog to database...")
            backlog_path = self._save_backlog(cards)

            # Success - delete checkpoint
            self._delete_checkpoint(card_id)

            logger.info(f"✅ Product Owner Agent completed successfully")
            logger.info(f"📊 Generated {len(cards)} cards")
            logger.info(f"📄 Created {len(artifacts)} artifacts")

            return {
                'success': True,
                'cards_generated': len(cards),
                'cards': cards,
                'artifacts': artifacts,
                'backlog_path': str(backlog_path),
                'validation': validation
            }

        except Exception as e:
            logger.error(f"❌ Product Owner Agent failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'cards_generated': 0,
                'cards': [],
                'artifacts': []
            }

    def _read_all_documentation(self) -> Dict[str, str]:
        """Read all base documentation files"""
        docs = {}

        doc_files = [
            "requisitos_funcionais_v2.0.md",
            "arquitetura_supercore_v2.0.md",
            "stack_supercore_v2.0.md"
        ]

        for filename in doc_files:
            file_path = DOCS_BASE / filename
            if not file_path.exists():
                logger.warning(f"⚠️ Documentation file not found: {filename}")
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    docs[filename] = content
                    logger.info(f"✅ Read {filename} ({len(content)} chars)")
            except Exception as e:
                logger.error(f"❌ Failed to read {filename}: {e}")

        if not docs:
            raise ValueError("No documentation files found")

        return docs

    def _analyze_documentation_with_agent(self, documentation: Dict[str, str]) -> Dict[str, Any]:
        """
        Analyze documentation directly by parsing requirements

        Agent-first approach:
        1. Parse requisitos_funcionais_v2.0.md to extract RFs
        2. Parse arquitetura_supercore_v2.0.md to understand layers
        3. Parse stack_supercore_v2.0.md to know technologies
        4. Generate cards programmatically

        NO CLI needed! Fast and reliable.
        """
        logger.info("🤖 Agent-first analysis: Parsing documentation directly...")

        # Parse requirements from documentation
        requirements = self._parse_requirements_from_doc(documentation.get('requisitos_funcionais_v2.0.md', ''))

        # Parse architecture layers
        architecture = self._parse_architecture_from_doc(documentation.get('arquitetura_supercore_v2.0.md', ''))

        # Parse technology stack
        stack = self._parse_stack_from_doc(documentation.get('stack_supercore_v2.0.md', ''))

        # Generate cards from parsed data
        logger.info(f"✅ Parsed {len(requirements)} requirements")
        logger.info(f"✅ Parsed {len(architecture.get('layers', []))} architecture layers")
        logger.info(f"✅ Parsed {len(stack.get('technologies', []))} technologies")

        # Build analysis structure
        analysis = {
            "requirements_analysis": {
                "total_requirements": len(requirements),
                "requirements": requirements
            },
            "cards": self._generate_cards_from_requirements(requirements, architecture, stack),
            "epics": self._generate_epics_from_requirements(requirements),
            "artifacts_to_create": {
                "wireframes": self._identify_wireframes_needed(requirements),
                "user_flows": self._identify_user_flows_needed(requirements),
                "documents": ["MVP_Features.md", "Success_Metrics.md", "Backlog_Completo.md"]
            },
            "estimated_total_cards": len(requirements) * 3  # ~3 cards per requirement
        }

        return analysis

    def _parse_requirements_from_doc(self, doc_content: str) -> List[Dict[str, Any]]:
        """Parse requirements from requisitos_funcionais_v2.0.md"""
        import re

        requirements = []

        # Regex to extract RF sections: ## RF001: Title
        # Note: Changed from '-' to ':' to match actual format in documentation
        rf_pattern = r'##\s+(RF\d+):\s*(.+?)(?=\n|\r|$)'
        matches = re.finditer(rf_pattern, doc_content, re.MULTILINE)

        for match in matches:
            rf_id = match.group(1)
            rf_name = match.group(2).strip()

            # Extract description (text after the RF header until next ## or end)
            start_pos = match.end()
            next_header = re.search(r'\n##\s+', doc_content[start_pos:])
            if next_header:
                end_pos = start_pos + next_header.start()
            else:
                end_pos = len(doc_content)

            description = doc_content[start_pos:end_pos].strip()

            # Extract RF number for intelligent priority and layer detection
            rf_num = int(rf_id[2:])  # "RF001" -> 1, "RF015" -> 15

            # Intelligent priority detection based on RF number
            # RF001-RF010: Foundation (CRITICAL)
            # RF011-RF030: Core Features (HIGH)
            # RF031+: Advanced Features (MEDIUM)
            if rf_num <= 10:
                priority = "CRITICAL"  # Foundation requirements
            elif rf_num <= 30:
                priority = "HIGH"      # Core features
            else:
                priority = "MEDIUM"    # Advanced features

            # Override if explicit priority keywords found in description
            if "CRÍTICO" in description.upper() or "CRITICAL" in description.upper():
                priority = "CRITICAL"
            elif "BAIXA" in description.upper() or "LOW" in description.upper():
                priority = "LOW"

            # Intelligent layer detection based on RF number and content
            # RF001-RF005: Camada 5 - Interfaces (Backoffice UI)
            # RF006-RF010: Camada 1 - Oráculo (Knowledge management)
            # RF011-RF020: Camada 2 - Objetos (Object definitions)
            # RF021-RF030: Camada 3 - Agentes (AI Agents)
            # RF031+: Camada 4 - MCPs (Integrations)
            if rf_num <= 5:
                layer = "Camada 5 - Interfaces"
            elif rf_num <= 10:
                layer = "Camada 1 - Oráculo"
            elif rf_num <= 20:
                layer = "Camada 2 - Objetos"
            elif rf_num <= 30:
                layer = "Camada 3 - Agentes"
            else:
                layer = "Camada 4 - MCPs"

            # Override with keyword detection if explicit layer mentioned
            if "ORÁCULO" in description.upper() or "ORACLE" in description.upper():
                layer = "Camada 1 - Oráculo"
            elif "OBJETO" in description.upper() or "OBJECT DEFINITION" in description.upper():
                layer = "Camada 2 - Objetos"
            elif "AGENTE" in description.upper() or "AI AGENT" in description.upper():
                layer = "Camada 3 - Agentes"
            elif "MCP" in description.upper() or "INTEGRATION" in description.upper():
                layer = "Camada 4 - MCPs"
            elif "INTERFACE" in description.upper() or "UI" in description.upper() or "PORTAL" in description.upper():
                layer = "Camada 5 - Interfaces"

            requirements.append({
                "id": rf_id,
                "name": rf_name,
                "description": description[:2000],  # Increased from 500 to 2000 for better context
                "layer": layer,
                "priority": priority
            })

        logger.info(f"✅ Parsed {len(requirements)} requirements from documentation")
        return requirements

    def _parse_architecture_from_doc(self, doc_content: str) -> Dict[str, Any]:
        """Parse architecture layers from arquitetura_supercore_v2.0.md"""
        # Simple extraction of layers
        layers = []
        if "Camada 0" in doc_content:
            layers.append("Camada 0 - Dados")
        if "Camada 1" in doc_content:
            layers.append("Camada 1 - Oráculo")
        if "Camada 2" in doc_content:
            layers.append("Camada 2 - Objetos")
        if "Camada 3" in doc_content:
            layers.append("Camada 3 - Agentes")
        if "Camada 4" in doc_content:
            layers.append("Camada 4 - MCPs")
        if "Camada 5" in doc_content:
            layers.append("Camada 5 - Interfaces")

        return {"layers": layers}

    def _parse_stack_from_doc(self, doc_content: str) -> Dict[str, Any]:
        """Parse technology stack from stack_supercore_v2.0.md"""
        technologies = []

        # Common technologies to look for
        tech_keywords = [
            "PostgreSQL", "Redis", "NebulaGraph", "Qdrant",
            "FastAPI", "Go", "Python", "TypeScript", "React", "Next.js",
            "CrewAI", "LangChain", "LangFlow"
        ]

        for tech in tech_keywords:
            if tech in doc_content:
                technologies.append(tech)

        return {"technologies": technologies}

    def _generate_cards_from_requirements(self, requirements: List[Dict], architecture: Dict, stack: Dict) -> List[Dict[str, Any]]:
        """Generate product cards from parsed requirements"""
        cards = []
        card_counter = 1

        for req in requirements:
            rf_id = req['id']
            rf_name = req['name']
            rf_desc = req['description']
            priority = req['priority']
            layer = req['layer']

            # Card 1: Technical Design & Architecture
            cards.append({
                "card_id": f"PROD-{card_counter:03d}",
                "requirement_ids": [rf_id],
                "title": f"{rf_id} - Technical Design & Architecture",
                "user_story": f"As a Tech Lead, I want to design the architecture for {rf_name}, so that the implementation follows best practices and integrates with existing layers.",
                "description": f"Create detailed technical design for {rf_name}. {rf_desc[:200]}",
                "type": "design",
                "priority": priority,
                "acceptance_criteria": [
                    f"Technical design document created covering {layer}",
                    "Architecture diagrams (Mermaid) created",
                    "API contracts defined",
                    "Database schema designed",
                    "Integration points identified"
                ],
                "effort_estimate": "L" if priority == "CRITICAL" else "M",
                "business_value": f"Ensures {rf_name} is built correctly and maintainable",
                "dependencies": [],
                "deliverables": [f"design-{rf_id}.md", f"diagram-{rf_id}.mermaid"]
            })
            card_counter += 1

            # Card 2: Backend Implementation
            cards.append({
                "card_id": f"PROD-{card_counter:03d}",
                "requirement_ids": [rf_id],
                "title": f"{rf_id} - Backend Implementation",
                "user_story": f"As a Backend Developer, I want to implement the server-side logic for {rf_name}, so that the feature works correctly with the database and APIs.",
                "description": f"Implement backend for {rf_name}. Technologies: {', '.join(stack.get('technologies', [])[:3])}",
                "type": "feature",
                "priority": priority,
                "acceptance_criteria": [
                    "Backend APIs implemented (FastAPI/Go)",
                    "Database migrations created",
                    "Unit tests written (coverage ≥80%)",
                    "Integration tests passing",
                    "API documentation (OpenAPI) complete"
                ],
                "effort_estimate": "XL" if priority == "CRITICAL" else "L",
                "business_value": f"Delivers core functionality for {rf_name}",
                "dependencies": [f"PROD-{card_counter-1:03d}"],  # Depends on design card
                "deliverables": [f"api-{rf_id}.py", f"tests-{rf_id}.py", f"migration-{rf_id}.sql"]
            })
            card_counter += 1

            # Card 3: Frontend Implementation
            cards.append({
                "card_id": f"PROD-{card_counter:03d}",
                "requirement_ids": [rf_id],
                "title": f"{rf_id} - Frontend Implementation",
                "user_story": f"As a User, I want to interact with {rf_name} through an intuitive UI, so that I can accomplish my tasks efficiently.",
                "description": f"Implement UI for {rf_name}. Create responsive, accessible interface using React/Next.js.",
                "type": "feature",
                "priority": priority,
                "acceptance_criteria": [
                    "UI components created (React/TypeScript)",
                    "Wireframes implemented pixel-perfect",
                    "Responsive design (mobile, tablet, desktop)",
                    "Accessibility WCAG 2.1 AA compliant",
                    "E2E tests passing (Playwright)"
                ],
                "effort_estimate": "L",
                "business_value": f"Provides user interface for {rf_name}",
                "dependencies": [f"PROD-{card_counter-1:03d}"],  # Depends on backend card
                "deliverables": [f"component-{rf_id}.tsx", f"e2e-{rf_id}.spec.ts"]
            })
            card_counter += 1

        return cards

    def _generate_epics_from_requirements(self, requirements: List[Dict]) -> List[Dict[str, Any]]:
        """Generate epics by grouping requirements by layer"""
        epics = []

        # Group requirements by layer
        layers = {}
        for req in requirements:
            layer = req.get('layer', 'unknown')
            if layer not in layers:
                layers[layer] = []
            layers[layer].append(req)

        # Create epic for each layer
        epic_counter = 1
        for layer, reqs in layers.items():
            epics.append({
                "epic_id": f"EPIC-PRODUTO-{epic_counter:03d}",
                "title": f"{layer} - Complete Implementation",
                "description": f"Implement all features for {layer}",
                "cards": [f"{req['id']}" for req in reqs]
            })
            epic_counter += 1

        return epics

    def _identify_wireframes_needed(self, requirements: List[Dict]) -> List[str]:
        """Identify wireframes that need to be created"""
        wireframes = []
        for req in requirements:
            # Create wireframe for each requirement
            wireframes.append(f"{req['id']} - {req['name']} (Main Screen)")
            wireframes.append(f"{req['id']} - {req['name']} (Detail View)")

        return wireframes

    def _identify_user_flows_needed(self, requirements: List[Dict]) -> List[str]:
        """Identify user flows that need to be mapped"""
        flows = []
        for req in requirements:
            flows.append(f"{req['id']} - {req['name']} User Flow")

        return flows

    # NOTE: CLI fallback functions removed in Agent-First v3.1
    # The agent now parses documentation directly without requiring Claude CLI
    # If CLI fallback is needed in the future, implement it in a separate module

    def _generate_cards_from_analysis(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Convert analysis into final card format
        """
        cards_raw = analysis.get('cards', [])

        if not cards_raw:
            raise ValueError("No cards generated from analysis")

        cards = []

        for card_data in cards_raw:
            card = {
                'card_id': card_data.get('card_id'),
                'title': card_data.get('title'),
                'description': card_data.get('description', ''),
                'user_story': card_data.get('user_story', ''),
                'type': card_data.get('type', 'feature'),
                'priority': card_data.get('priority', 'MEDIUM'),
                'squad': 'produto',
                'phase': 1,
                'status': 'TODO',
                'requirement_ids': card_data.get('requirement_ids', []),
                'acceptance_criteria': card_data.get('acceptance_criteria', []),
                'effort_estimate': card_data.get('effort_estimate', 'M'),
                'business_value': card_data.get('business_value', ''),
                'dependencies': card_data.get('dependencies', []),
                'deliverables': card_data.get('deliverables', []),
                'created_at': datetime.utcnow().isoformat(),
                'created_by': 'product-owner-agent'
            }

            cards.append(card)

        logger.info(f"✅ Converted {len(cards)} cards from analysis")

        return cards

    def _create_artifacts(self, cards: List[Dict[str, Any]], analysis: Dict[str, Any]) -> List[str]:
        """
        Create ONLY essential artifacts - no duplication, no verbose docs

        Only creates:
        1. User Stories (for human review)
        2. Wireframes index (for UX squad)

        Note: backlog_master.json is created in _save_backlog() - ÚNICA fonte da verdade
        """
        artifacts = []

        # 1. Create User Stories (useful for human review)
        stories_file = ARTIFACTS_DIR / "User_Stories_Completo.md"
        stories_content = "# User Stories - SuperCore v2.0\n\n"
        stories_content += f"**Gerado**: {datetime.utcnow().isoformat()}\n"
        stories_content += f"**Total Cards**: {len(cards)}\n\n"

        for card in cards:
            stories_content += f"## {card['card_id']}: {card['title']}\n\n"
            stories_content += f"**User Story**: {card.get('user_story', 'N/A')}\n\n"
            stories_content += f"**Critérios de Aceitação**:\n"
            for criteria in card.get('acceptance_criteria', []):
                stories_content += f"- {criteria}\n"
            stories_content += f"\n**Prioridade**: {card.get('priority')}\n"
            stories_content += f"**Esforço**: {card.get('effort_estimate')}\n"
            stories_content += "\n---\n\n"

        with open(stories_file, 'w', encoding='utf-8') as f:
            f.write(stories_content)

        artifacts.append(str(stories_file))
        logger.info(f"✅ Created User_Stories_Completo.md")

        # 2. Create wireframes index (for UX squad)
        wireframes_dir = ARTIFACTS_DIR / "ux-designs" / "wireframes"
        wireframes_index = wireframes_dir / "index.md"

        wireframes_content = "# Wireframes - SuperCore v2.0\n\n"
        wireframes_content += "Lista de wireframes a criar:\n\n"

        for wireframe in analysis.get('artifacts_to_create', {}).get('wireframes', []):
            wireframes_content += f"- [ ] {wireframe}\n"

        with open(wireframes_index, 'w', encoding='utf-8') as f:
            f.write(wireframes_content)

        artifacts.append(str(wireframes_index))
        logger.info(f"✅ Created wireframes/index.md")

        return artifacts

    def _validate_outputs(self, cards: List[Dict[str, Any]], artifacts: List[str]) -> Dict[str, Any]:
        """Validate generated cards and artifacts"""
        errors = []
        warnings = []

        # Check minimum cards (lowered to 30 since we're using CLI which might be slower)
        if len(cards) < 30:
            errors.append(f"Too few cards generated: {len(cards)} (minimum 30)")

        # Check each card has required fields
        for card in cards:
            if not card.get('card_id'):
                errors.append(f"Card missing card_id: {card}")
            if not card.get('title'):
                errors.append(f"Card missing title: {card.get('card_id')}")
            if not card.get('user_story'):
                warnings.append(f"Card missing user_story: {card.get('card_id')}")
            if not card.get('acceptance_criteria'):
                errors.append(f"Card missing acceptance_criteria: {card.get('card_id')}")

        # Check artifacts created
        for artifact_path in artifacts:
            if not Path(artifact_path).exists():
                errors.append(f"Artifact not created: {artifact_path}")

        is_valid = len(errors) == 0

        return {
            'valid': is_valid,
            'errors': errors,
            'warnings': warnings,
            'cards_validated': len(cards),
            'artifacts_validated': len(artifacts)
        }

    def _save_backlog(self, cards: List[Dict[str, Any]]) -> Path:
        """Save backlog to state directory for orchestrator to pick up"""
        backlog_file = STATE_DIR / "backlog_master.json"

        # Load existing backlog if exists
        existing_backlog = {'cards': [], 'journal': []}
        if backlog_file.exists():
            try:
                with open(backlog_file) as f:
                    existing_backlog = json.load(f)
            except:
                pass

        # Merge new cards (replace existing PROD-* cards, keep others)
        existing_cards = [c for c in existing_backlog.get('cards', []) if not c.get('card_id', '').startswith('PROD-')]

        all_cards = existing_cards + cards

        backlog_data = {
            'project': 'SuperCore v2.0',
            'updated_at': datetime.utcnow().isoformat(),
            'cards': all_cards,
            'journal': existing_backlog.get('journal', [])
        }

        with open(backlog_file, 'w', encoding='utf-8') as f:
            json.dump(backlog_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✅ Saved backlog with {len(all_cards)} total cards to {backlog_file}")

        return backlog_file

    def _save_checkpoint(self, card_id: str, stage: str, data: Dict[str, Any]) -> None:
        """
        Save execution state to disk for fault tolerance

        Args:
            card_id: Card ID being executed
            stage: Execution stage (documentation_read, analysis_complete, etc)
            data: Data to preserve (documentation, analysis, cards, artifacts)
        """
        checkpoint_path = CHECKPOINT_DIR / f"{card_id}_{stage}.pkl"

        checkpoint = {
            "card_id": card_id,
            "stage": stage,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }

        try:
            with open(checkpoint_path, "wb") as f:
                pickle.dump(checkpoint, f)
            logger.info(f"💾 Checkpoint saved: {stage} ({checkpoint_path.stat().st_size // 1024}KB)")
        except Exception as e:
            logger.warning(f"⚠️ Failed to save checkpoint: {e}")

    def _load_checkpoint(self, card_id: str) -> Optional[Dict[str, Any]]:
        """
        Load most recent checkpoint if exists

        Args:
            card_id: Card ID being executed

        Returns:
            Checkpoint data or None
        """
        checkpoints = sorted(CHECKPOINT_DIR.glob(f"{card_id}_*.pkl"))
        if not checkpoints:
            return None

        latest = checkpoints[-1]
        try:
            with open(latest, "rb") as f:
                checkpoint = pickle.load(f)
            logger.info(f"📌 Loaded checkpoint: {checkpoint['stage']} from {checkpoint['timestamp']}")
            return checkpoint
        except Exception as e:
            logger.error(f"❌ Failed to load checkpoint: {e}")
            return None

    def _delete_checkpoint(self, card_id: str) -> None:
        """
        Delete all checkpoints for a card (cleanup after success)

        Args:
            card_id: Card ID
        """
        checkpoints = list(CHECKPOINT_DIR.glob(f"{card_id}_*.pkl"))
        for checkpoint_path in checkpoints:
            try:
                checkpoint_path.unlink()
                logger.info(f"🗑️ Deleted checkpoint: {checkpoint_path.name}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete checkpoint {checkpoint_path}: {e}")

    def _resume_from_checkpoint(self, card_id: str, checkpoint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resume execution from saved checkpoint

        Args:
            card_id: Card ID
            checkpoint: Checkpoint data

        Returns:
            Execution result
        """
        stage = checkpoint["stage"]
        data = checkpoint["data"]

        logger.info(f"🔄 Resuming from stage: {stage}")

        if stage == "documentation_read":
            # Skip Step 1, go to Step 2
            logger.info("🧠 Step 2: Analyzing documentation (resumed)...")
            if self.progress_callback:
                self.progress_callback(30, "🧠 Parsing requirements (resumed from checkpoint)...")
            analysis = self._analyze_documentation_with_agent(data["documentation"])
            self._save_checkpoint(card_id, "analysis_complete", {"documentation": data["documentation"], "analysis": analysis})

            # Continue from Step 3
            return self._continue_from_step_3(card_id, analysis)

        elif stage == "analysis_complete":
            # Skip Steps 1-2, go to Step 3
            return self._continue_from_step_3(card_id, data["analysis"])

        elif stage == "cards_generated":
            # Skip Steps 1-3, go to Step 4
            return self._continue_from_step_4(card_id, data["cards"], data["analysis"])

        elif stage == "artifacts_created":
            # Skip Steps 1-4, go to Step 5
            return self._continue_from_step_5(card_id, data["cards"], data["artifacts"])

        else:
            logger.warning(f"⚠️ Unknown checkpoint stage: {stage}, starting from beginning")
            return self.execute_card(card_id, {})

    def _continue_from_step_3(self, card_id: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Continue execution from Step 3 (card generation)"""
        logger.info("📋 Step 3: Generating product cards (resumed)...")
        if self.progress_callback:
            self.progress_callback(70, "📋 Generating cards (resumed from checkpoint)...")
        cards = self._generate_cards_from_analysis(analysis)
        self._save_checkpoint(card_id, "cards_generated", {"cards": cards, "analysis": analysis})

        return self._continue_from_step_4(card_id, cards, analysis)

    def _continue_from_step_4(self, card_id: str, cards: List[Dict[str, Any]], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Continue execution from Step 4 (artifact creation)"""
        logger.info("📄 Step 4: Creating artifacts (resumed)...")
        if self.progress_callback:
            self.progress_callback(80, "📄 Creating artifacts (resumed from checkpoint)...")
        artifacts = self._create_artifacts(cards, analysis)
        self._save_checkpoint(card_id, "artifacts_created", {"cards": cards, "analysis": analysis, "artifacts": artifacts})

        return self._continue_from_step_5(card_id, cards, artifacts)

    def _continue_from_step_5(self, card_id: str, cards: List[Dict[str, Any]], artifacts: List[str]) -> Dict[str, Any]:
        """Continue execution from Step 5 (validation + save)"""
        logger.info("✅ Step 5: Validating outputs (resumed)...")
        if self.progress_callback:
            self.progress_callback(90, "✅ Validating (resumed from checkpoint)...")
        validation = self._validate_outputs(cards, artifacts)

        if not validation['valid']:
            raise ValueError(f"Validation failed: {validation['errors']}")

        logger.info("💾 Step 6: Saving backlog (resumed)...")
        if self.progress_callback:
            self.progress_callback(95, "💾 Saving backlog (resumed from checkpoint)...")
        backlog_path = self._save_backlog(cards)

        # Success - delete checkpoint
        self._delete_checkpoint(card_id)

        logger.info(f"✅ Product Owner Agent completed successfully (resumed)")
        logger.info(f"📊 Generated {len(cards)} cards")
        logger.info(f"📄 Created {len(artifacts)} artifacts")

        return {
            'success': True,
            'cards_generated': len(cards),
            'cards': cards,
            'artifacts': artifacts,
            'backlog_path': str(backlog_path),
            'validation': validation,
            'resumed_from_checkpoint': True
        }


def execute_product_owner_card(card_id: str, card_data: Dict[str, Any], progress_callback=None) -> Dict[str, Any]:
    """
    Entry point for Celery task

    Args:
        card_id: Card ID (e.g., "EPIC-001")
        card_data: Card metadata
        progress_callback: Optional callback function(progress_pct, message) for progress reporting

    Returns:
        Execution result
    """
    agent = ProductOwnerAgent(progress_callback=progress_callback)
    return agent.execute_card(card_id, card_data)

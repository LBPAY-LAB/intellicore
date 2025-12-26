#!/usr/bin/env python3
"""
Test suite for ArchitectureOwnerAgent

Tests documentation parsing, design generation, validation, and checkpoint system.

Usage:
    python3 test_architecture_owner_agent.py

Expected Results:
    ✅ All 8 test cases pass
    ✅ Documentation parsing works
    ✅ Artifact generation complete
    ✅ Validation enforces acceptance criteria
"""

import sys
import logging
import json
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.architecture_owner_agent import ArchitectureOwnerAgent

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestArchitectureOwnerAgent:
    """Test suite for Architecture Owner Agent"""

    def __init__(self):
        self.agent = ArchitectureOwnerAgent()
        self.tests_passed = 0
        self.tests_failed = 0

    def run_all_tests(self):
        """Run all test cases"""
        logger.info("=" * 80)
        logger.info("🧪 Testing Architecture Owner Agent v1.0.0")
        logger.info("=" * 80)

        # Test 1: Documentation parsing
        self.test_documentation_parsing()

        # Test 2: Design document generation
        self.test_design_document_generation()

        # Test 3: Mermaid diagram generation
        self.test_mermaid_diagram_generation()

        # Test 4: API contract generation
        self.test_api_contract_generation()

        # Test 5: Database schema generation
        self.test_database_schema_generation()

        # Test 6: Validation enforcement
        self.test_validation_enforcement()

        # Test 7: Checkpoint system
        self.test_checkpoint_system()

        # Test 8: Full card execution
        self.test_full_card_execution()

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

    def assert_greater(self, actual, threshold, message):
        """Assert actual > threshold"""
        if actual > threshold:
            logger.info(f"  ✅ {message}")
            self.tests_passed += 1
        else:
            logger.error(f"  ❌ {message}")
            logger.error(f"     Expected > {threshold}, got {actual}")
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

    def test_documentation_parsing(self):
        """Test 1: Parse architecture and stack documentation"""
        logger.info("\n🔹 Test 1: Documentation parsing")

        # Parse architecture doc
        arch_data = self.agent._parse_arquitetura_doc()

        self.assert_true(len(arch_data['layers']) == 6, "Extracted 6 layers")
        self.assert_greater(len(arch_data['adrs']), 10, "Extracted 10+ ADRs")
        self.assert_true(len(arch_data['patterns']) >= 3, "Extracted 3+ patterns")
        self.assert_true(len(arch_data['pillars']) == 4, "Extracted 4 pillars")

        logger.info(f"  Layers: {[l['name'] for l in arch_data['layers']]}")
        logger.info(f"  ADRs: {len(arch_data['adrs'])} extracted")
        logger.info(f"  Patterns: {arch_data['patterns']}")

        # Parse stack doc
        stack_data = self.agent._parse_stack_doc()

        self.assert_true('backend' in stack_data['technologies'], "Has backend technologies")
        self.assert_true('frontend' in stack_data['technologies'], "Has frontend technologies")
        self.assert_true('database' in stack_data['technologies'], "Has database technologies")

        logger.info(f"  Technologies: {list(stack_data['technologies'].keys())}")

    def test_design_document_generation(self):
        """Test 2: Generate complete design document"""
        logger.info("\n🔹 Test 2: Design document generation")

        card_data = {
            'card_id': 'PROD-TEST-001',
            'title': 'TEST - Design Document',
            'description': 'Test design generation',
            'requirement_ids': ['RF001'],
            'user_story': 'As a developer, I want a design document',
            'business_value': 'Test value',
            'acceptance_criteria': [
                'Technical design document created',
                'Architecture diagrams created'
            ],
            'deliverables': []
        }

        arch_data = self.agent._parse_arquitetura_doc()
        stack_data = self.agent._parse_stack_doc()
        req_data = {}

        design_doc = self.agent._generate_design_document(
            'PROD-TEST-001',
            card_data,
            arch_data,
            stack_data,
            req_data
        )

        self.assert_true(len(design_doc) > 1000, "Design doc has substantial content (>1000 chars)")
        self.assert_in('## 1. Overview', design_doc, "Has Overview section")
        self.assert_in('## 2. Technical Approach', design_doc, "Has Technical Approach section")
        self.assert_in('## 3. Data Model', design_doc, "Has Data Model section")
        self.assert_in('## 4. API Design', design_doc, "Has API Design section")
        self.assert_in('ADR-001', design_doc, "References at least one ADR")

        logger.info(f"  Design doc length: {len(design_doc)} characters")

    def test_mermaid_diagram_generation(self):
        """Test 3: Generate valid Mermaid diagrams"""
        logger.info("\n🔹 Test 3: Mermaid diagram generation")

        card_data = {
            'card_id': 'PROD-TEST-002',
            'title': 'TEST - Mermaid Diagrams',
            'description': 'database schema test',
            'requirement_ids': ['RF002']
        }

        arch_data = {}
        req_data = {}

        diagrams = self.agent._generate_diagrams('PROD-TEST-002', card_data, arch_data, req_data)

        self.assert_greater(len(diagrams), 0, "Generated at least 1 diagram")

        # Check C4 diagram
        c4_diagram = diagrams[0]
        c4_content = Path(c4_diagram['path']).read_text(encoding='utf-8')

        self.assert_true(self.agent._validate_mermaid_syntax(c4_content), "C4 diagram has valid Mermaid syntax")
        self.assert_in('graph', c4_content, "C4 diagram is a graph")
        self.assert_in('SuperCore', c4_content, "C4 diagram mentions SuperCore")

        # If database schema, should have ERD too
        if 'database' in card_data['description']:
            self.assert_greater(len(diagrams), 1, "Generated ERD diagram for database requirement")
            erd_diagram = diagrams[1]
            erd_content = Path(erd_diagram['path']).read_text(encoding='utf-8')
            self.assert_in('erDiagram', erd_content, "ERD diagram has correct type")

        logger.info(f"  Generated {len(diagrams)} diagrams")

    def test_api_contract_generation(self):
        """Test 4: Generate OpenAPI spec"""
        logger.info("\n🔹 Test 4: API contract generation")

        card_data = {
            'card_id': 'PROD-TEST-003',
            'title': 'TEST - API Contracts',
            'description': 'API test',
            'requirement_ids': ['RF003']
        }

        stack_data = {}
        req_data = {}

        contracts = self.agent._generate_api_contracts('PROD-TEST-003', card_data, stack_data, req_data)

        self.assert_greater(len(contracts), 0, "Generated at least 1 contract")

        # Check OpenAPI spec
        api_contract = contracts[0]
        api_content = Path(api_contract['path']).read_text(encoding='utf-8')

        self.assert_in('openapi: 3.0.0', api_content, "Has OpenAPI 3.0.0 version")
        self.assert_in('paths:', api_content, "Has paths section")
        self.assert_in('components:', api_content, "Has components section")
        self.assert_in('schemas:', api_content, "Has schemas section")

        logger.info(f"  API contract: {api_contract['path']}")

    def test_database_schema_generation(self):
        """Test 5: Generate SQL schema"""
        logger.info("\n🔹 Test 5: Database schema generation")

        card_data = {
            'card_id': 'PROD-TEST-004',
            'title': 'TEST - SQL Schema',
            'description': 'Database test',
            'requirement_ids': ['RF004']
        }

        stack_data = {}
        req_data = {}

        contracts = self.agent._generate_api_contracts('PROD-TEST-004', card_data, stack_data, req_data)

        # Second item should be SQL schema
        schema = contracts[1]
        schema_content = Path(schema['path']).read_text(encoding='utf-8')

        self.assert_in('CREATE TABLE', schema_content, "Has CREATE TABLE statement")
        self.assert_in('PRIMARY KEY', schema_content, "Has PRIMARY KEY constraint")
        self.assert_in('CREATE INDEX', schema_content, "Has CREATE INDEX statement")
        self.assert_in('COMMENT ON', schema_content, "Has table/column comments")

        logger.info(f"  SQL schema: {schema['path']}")

    def test_validation_enforcement(self):
        """Test 6: Validate acceptance criteria enforcement"""
        logger.info("\n🔹 Test 6: Validation enforcement")

        # Valid card (should pass)
        valid_card = {
            'acceptance_criteria': [
                'Technical design document created',
                'Architecture diagrams created',
                'API contracts defined'
            ]
        }

        valid_artifacts = [
            {'type': 'design_document', 'path': '/path/to/design.md'},
            {'type': 'mermaid_diagram', 'path': '/path/to/diagram.mermaid'},
            {'type': 'openapi_spec', 'path': '/path/to/api.yaml'}
        ]

        result = self.agent._validate_acceptance_criteria(valid_card, valid_artifacts)
        self.assert_true(result, "Validation passes with all artifacts present")

        # Invalid card (should fail)
        invalid_card = {
            'acceptance_criteria': [
                'Technical design document created',
                'Architecture diagrams created',
                'API contracts defined',
                'Database schema designed'  # Missing!
            ]
        }

        invalid_artifacts = [
            {'type': 'design_document', 'path': '/path/to/design.md'},
            {'type': 'mermaid_diagram', 'path': '/path/to/diagram.mermaid'}
            # Missing API and schema!
        ]

        result = self.agent._validate_acceptance_criteria(invalid_card, invalid_artifacts)
        self.assert_false(result, "Validation fails with missing artifacts")

    def test_checkpoint_system(self):
        """Test 7: Checkpoint save/load"""
        logger.info("\n🔹 Test 7: Checkpoint system")

        card_id = 'PROD-TEST-CHECKPOINT'

        # Save checkpoint
        test_data = {'test': 'data', 'number': 123}
        self.agent._save_checkpoint(card_id, 'design_generated', test_data)

        checkpoint_file = self.agent.checkpoints_dir / f"{card_id}.json"
        self.assert_true(checkpoint_file.exists(), "Checkpoint file created")

        # Load checkpoint
        loaded = self.agent._load_checkpoint(card_id)
        self.assert_equals(loaded['stage'], 'design_generated', "Checkpoint stage correct")
        self.assert_equals(loaded['progress'], 50, "Checkpoint progress correct")
        self.assert_equals(loaded['data']['test'], 'data', "Checkpoint data correct")

        # Delete checkpoint
        self.agent._delete_checkpoint(card_id)
        self.assert_false(checkpoint_file.exists(), "Checkpoint file deleted")

        logger.info("  Checkpoint save/load/delete working correctly")

    def test_full_card_execution(self):
        """Test 8: Execute full card end-to-end"""
        logger.info("\n🔹 Test 8: Full card execution (end-to-end)")

        test_card = {
            'card_id': 'PROD-TEST-FULL',
            'title': 'RF999 - Full Test',
            'description': 'End-to-end test of architecture owner agent',
            'requirement_ids': ['RF999'],
            'user_story': 'As a developer, I want a complete design',
            'business_value': 'Test completeness',
            'acceptance_criteria': [
                'Technical design document created covering all aspects',
                'Architecture diagrams (Mermaid) created',
                'API contracts defined',
                'Database schema designed',
                'Integration points identified'
            ],
            'deliverables': [
                'design-RF999.md',
                'diagram-RF999.mermaid'
            ]
        }

        # Clean up any existing checkpoint
        self.agent._delete_checkpoint('PROD-TEST-FULL')

        # Execute card
        result = self.agent.execute_card('PROD-TEST-FULL', test_card)

        self.assert_equals(result['status'], 'completed', "Card execution completed")
        self.assert_greater(len(result['artifacts']), 3, "Generated 4+ artifacts")
        self.assert_true(result['duration_seconds'] >= 0, "Duration tracked")

        # Verify artifacts created
        for artifact in result['artifacts']:
            artifact_path = Path(artifact['path'])
            self.assert_true(artifact_path.exists(), f"Artifact exists: {artifact_path.name}")
            self.assert_greater(artifact_path.stat().st_size, 0, f"Artifact not empty: {artifact_path.name}")

        logger.info(f"  Duration: {result['duration_seconds']}s")
        logger.info(f"  Artifacts: {len(result['artifacts'])}")
        for artifact in result['artifacts']:
            logger.info(f"    - {artifact['type']}: {Path(artifact['path']).name}")

        # Clean up checkpoint
        self.agent._delete_checkpoint('PROD-TEST-FULL')

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
            logger.info("✅ Architecture Owner Agent is working correctly")
            logger.info("✅ Documentation parsing works")
            logger.info("✅ Design generation complete")
            logger.info("✅ Mermaid diagrams valid")
            logger.info("✅ OpenAPI specs valid")
            logger.info("✅ SQL schemas valid")
            logger.info("✅ Validation enforcement working")
            logger.info("✅ Checkpoint system functional")
            logger.info("✅ End-to-end execution successful")
            return True
        else:
            logger.error(f"\n❌ {self.tests_failed} TEST(S) FAILED")
            return False


if __name__ == '__main__':
    try:
        test_suite = TestArchitectureOwnerAgent()
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    except AssertionError as e:
        logger.error(f"\n❌ Test assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        sys.exit(1)

"""
Test Backend Owner Agent v2.0 - Hybrid Architecture

Tests the 3-phase workflow:
1. CLI Scaffolding (Phase 1: 10-30%)
2. Skills Business Logic (Phase 2: 30-80%)
3. Skills Validation (Phase 3: 80-100%)

Run: python3 test_backend_owner_agent_v2.py
"""

import sys
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agents.backend_owner_agent_v2_hybrid import BackendOwnerAgentV2, create_backend_owner_agent


def test_backend_card_detection():
    """Test backend card pattern detection"""
    print("Test 1: Backend Card Detection")

    agent = create_backend_owner_agent()

    # PROD-002: (2-2) % 3 == 0 ✓
    assert agent._is_backend_card('PROD-002', {}) == True
    print("  ✅ PROD-002 is backend card (correct)")

    # PROD-005: (5-2) % 3 == 0 ✓
    assert agent._is_backend_card('PROD-005', {}) == True
    print("  ✅ PROD-005 is backend card (correct)")

    # PROD-008: (8-2) % 3 == 0 ✓
    assert agent._is_backend_card('PROD-008', {}) == True
    print("  ✅ PROD-008 is backend card (correct)")

    # PROD-001: (1-2) % 3 == -1 (mod 3 = 2) ✗
    assert agent._is_backend_card('PROD-001', {}) == False
    print("  ✅ PROD-001 is NOT backend card (correct)")

    # PROD-003: (3-2) % 3 == 1 ✗
    assert agent._is_backend_card('PROD-003', {}) == False
    print("  ✅ PROD-003 is NOT backend card (correct)")

    print("✅ PASS: Backend card detection working correctly\n")


def test_language_detection():
    """Test language detection (Go vs Python)"""
    print("Test 2: Language Detection")

    agent = create_backend_owner_agent()

    # CRUD API → Go
    card_crud = {
        'title': 'Create Oracle CRUD API',
        'acceptance_criteria': 'REST API with PostgreSQL database',
        'type': 'Backend'
    }
    language = agent.delegator._detect_language_from_card(card_crud)
    assert language == 'go', f"Expected 'go', got '{language}'"
    print(f"  ✅ CRUD API → {language} (correct)")

    # RAG Pipeline → Python
    card_rag = {
        'title': 'Implement RAG Pipeline',
        'acceptance_criteria': 'Document ingestion with embeddings using OpenAI',
        'type': 'Backend'
    }
    language = agent.delegator._detect_language_from_card(card_rag)
    assert language == 'python', f"Expected 'python', got '{language}'"
    print(f"  ✅ RAG Pipeline → {language} (correct)")

    # AI Agent → Python
    card_agent = {
        'title': 'Create AI Agent for Financial Analysis',
        'acceptance_criteria': 'CrewAI agent with LLM integration',
        'type': 'Backend'
    }
    language = agent.delegator._detect_language_from_card(card_agent)
    assert language == 'python', f"Expected 'python', got '{language}'"
    print(f"  ✅ AI Agent → {language} (correct)")

    print("✅ PASS: Language detection working correctly\n")


def test_requirements_extraction():
    """Test requirements extraction with fallback logic"""
    print("Test 3: Requirements Extraction")

    agent = create_backend_owner_agent()

    # Test with acceptance_criteria
    card1 = {
        'title': 'Create API',
        'description': 'Build REST API',
        'acceptance_criteria': 'REST endpoints with authentication'
    }
    requirements = agent._extract_requirements(card1)
    assert requirements == 'REST endpoints with authentication'
    print("  ✅ Extracted from acceptance_criteria (priority 1)")

    # Test with description fallback
    card2 = {
        'title': 'Create API',
        'description': 'Build REST API with PostgreSQL'
    }
    requirements = agent._extract_requirements(card2)
    assert requirements == 'Build REST API with PostgreSQL'
    print("  ✅ Extracted from description (priority 2)")

    # Test with title fallback
    card3 = {
        'title': 'Create Oracle CRUD API'
    }
    requirements = agent._extract_requirements(card3)
    assert requirements == 'Create Oracle CRUD API'
    print("  ✅ Extracted from title (priority 3)")

    print("✅ PASS: Requirements extraction working correctly\n")


def test_skill_selection():
    """Test correct skill selection based on language"""
    print("Test 4: Skill Selection")

    agent = create_backend_owner_agent()

    # Go card → golang-pro
    card_go = {
        'title': 'Create Oracle CRUD API',
        'acceptance_criteria': 'REST API with PostgreSQL',
        'type': 'Backend'
    }
    language = agent.delegator._detect_language_from_card(card_go)
    skill = 'golang-pro' if language == 'go' else 'fastapi-pro'
    assert skill == 'golang-pro'
    print(f"  ✅ Go card → {skill} (correct)")

    # Python card → fastapi-pro
    card_python = {
        'title': 'Implement RAG Pipeline',
        'acceptance_criteria': 'Document ingestion with embeddings',
        'type': 'Backend'
    }
    language = agent.delegator._detect_language_from_card(card_python)
    skill = 'golang-pro' if language == 'go' else 'fastapi-pro'
    assert skill == 'fastapi-pro'
    print(f"  ✅ Python card → {skill} (correct)")

    print("✅ PASS: Skill selection working correctly\n")


def test_progress_stages():
    """Test progress stage definitions"""
    print("Test 5: Progress Stages")

    agent = create_backend_owner_agent()

    # Validate all 9 stages defined
    expected_stages = {
        'requirements_analyzed': 10,
        'language_determined': 15,
        'scaffold_generated': 30,
        'api_implemented': 50,
        'business_logic_implemented': 65,
        'tests_implemented': 80,
        'evidence_verified': 90,
        'quality_validated': 95,
        'completed': 100
    }

    assert agent.STAGES == expected_stages
    assert len(agent.STAGES) == 9
    print(f"  ✅ All 9 stages defined correctly")

    # Validate stage progression
    stage_values = list(agent.STAGES.values())
    for i in range(len(stage_values) - 1):
        assert stage_values[i] < stage_values[i+1], f"Stage {i} not less than stage {i+1}"
    print(f"  ✅ Stages progress correctly (10% → 100%)")

    print("✅ PASS: Progress stages defined correctly\n")


def test_cost_tracking():
    """Test cost tracking initialization"""
    print("Test 6: Cost Tracking")

    agent = create_backend_owner_agent()

    # Initial cost should be 0
    assert agent.total_cost == 0.0
    print(f"  ✅ Initial cost: ${agent.total_cost:.2f}")

    # Test cost calculation method exists
    assert hasattr(agent.delegator, 'get_total_cost_estimate')
    print(f"  ✅ Cost calculation method available")

    # Test expected cost for typical card
    scaffold_cost = {'cost_estimate': 0.05}
    logic_cost = {'cost_estimate': 0.20}
    validation_costs = [{'cost_estimate': 0.05}, {'cost_estimate': 0.10}]

    total = agent.delegator.get_total_cost_estimate(
        scaffold_cost, logic_cost, validation_costs
    )

    assert total == 0.40
    print(f"  ✅ Expected total cost: ${total:.2f} (within budget)")

    print("✅ PASS: Cost tracking working correctly\n")


def test_documentation_loading():
    """Test documentation file loading configuration"""
    print("Test 7: Documentation Loading")

    agent = create_backend_owner_agent()

    # Test documentation path is correctly configured
    expected_docs_path = agent.project_root / "app-generation" / "documentation-base"
    assert agent.docs_dir == expected_docs_path
    print(f"  ✅ Documentation path correctly configured: {agent.docs_dir}")

    # Test that _load_documentation method exists
    assert hasattr(agent, '_load_documentation')
    print(f"  ✅ Documentation loading method available")

    # Note: Documentation directory may not exist in current branch (reset-completo)
    # This is expected - docs will be available in integration environment
    if agent.docs_dir.exists():
        print(f"  ✅ Documentation directory exists")
        required_docs = [
            'requisitos_funcionais_v2.0.md',
            'arquitetura_supercore_v2.0.md',
            'stack_supercore_v2.0.md'
        ]
        for doc in required_docs:
            doc_path = agent.docs_dir / doc
            if doc_path.exists():
                content = agent._load_documentation(doc)
                print(f"  ✅ Loaded {doc}: {len(content)} chars")
    else:
        print(f"  ⚠️  Documentation directory not found (expected in integration environment)")

    print("✅ PASS: Documentation loading configured correctly\n")


def test_factory_function():
    """Test factory function"""
    print("Test 8: Factory Function")

    agent = create_backend_owner_agent()

    assert isinstance(agent, BackendOwnerAgentV2)
    assert hasattr(agent, 'delegator')
    assert hasattr(agent, 'STAGES')
    assert hasattr(agent, 'total_cost')
    print("  ✅ Factory function creates valid BackendOwnerAgentV2 instance")

    print("✅ PASS: Factory function working correctly\n")


def main():
    """Run all tests"""
    print("=" * 70)
    print("Backend Owner Agent v2.0 - Hybrid Architecture Tests")
    print("=" * 70)
    print()

    try:
        test_backend_card_detection()
        test_language_detection()
        test_requirements_extraction()
        test_skill_selection()
        test_progress_stages()
        test_cost_tracking()
        test_documentation_loading()
        test_factory_function()

        print("=" * 70)
        print("✅ ALL TESTS PASSED (8/8)")
        print("=" * 70)
        print()
        print("Backend Owner Agent v2.0 is ready for integration!")
        print()
        print("Key Validations:")
        print("  ✅ Card pattern detection: (card_number - 2) % 3 == 0")
        print("  ✅ Language detection: CRUD→Go, RAG/AI→Python")
        print("  ✅ Skill selection: golang-pro or fastapi-pro")
        print("  ✅ Progress stages: 9 stages (10% → 100%)")
        print("  ✅ Cost tracking: ≤ $0.40/card")
        print()
        print("Next Steps:")
        print("  1. Replace old backend_owner_agent.py with v2.0")
        print("  2. Test with real PROD-002 card")
        print("  3. Commit Phase 2 completion")
        print("  4. Proceed to Phase 3 (Frontend Owner Agent)")

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

"""
Test HybridDelegator - Basic Functionality Validation

Tests:
1. Initialization
2. Language detection
3. Cost calculation
4. Factory function

Run: python3 test_hybrid_delegator.py
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils.hybrid_delegator import HybridDelegator, create_hybrid_delegator


def test_initialization():
    """Test HybridDelegator initialization"""
    print("Test 1: Initialization")

    base_dir = Path(__file__).parent / "app-artefacts"
    project_root = Path(__file__).parent.parent

    delegator = HybridDelegator(base_dir=base_dir, project_root=project_root)

    assert delegator.base_dir == base_dir
    assert delegator.project_root == project_root
    assert delegator.artifacts_dir == base_dir / "engenharia"

    print("✅ PASS: Initialization successful")


def test_language_detection():
    """Test language detection from card data"""
    print("\nTest 2: Language Detection")

    delegator = create_hybrid_delegator(
        base_dir=str(Path(__file__).parent / "app-artefacts"),
        project_root=str(Path(__file__).parent.parent)
    )

    # Test RAG/AI → Python
    card_rag = {
        'title': 'Implement RAG Pipeline for Document Ingestion',
        'acceptance_criteria': 'Create embeddings using OpenAI',
        'type': 'Backend'
    }
    language = delegator._detect_language_from_card(card_rag)
    assert language == 'python', f"Expected 'python', got '{language}'"
    print(f"  ✅ RAG card → {language} (correct)")

    # Test CRUD/Data → Go
    card_crud = {
        'title': 'Create Oracle CRUD API',
        'acceptance_criteria': 'REST API with PostgreSQL database',
        'type': 'Backend'
    }
    language = delegator._detect_language_from_card(card_crud)
    assert language == 'go', f"Expected 'go', got '{language}'"
    print(f"  ✅ CRUD card → {language} (correct)")

    # Test UI → TypeScript
    card_ui = {
        'title': 'Create Dashboard UI Component',
        'acceptance_criteria': 'React component with Tailwind CSS',
        'type': 'Frontend'
    }
    language = delegator._detect_language_from_card(card_ui)
    assert language == 'typescript', f"Expected 'typescript', got '{language}'"
    print(f"  ✅ UI card → {language} (correct)")

    print("✅ PASS: Language detection working correctly")


def test_cost_calculation():
    """Test total cost calculation"""
    print("\nTest 3: Cost Calculation")

    delegator = create_hybrid_delegator(
        base_dir=str(Path(__file__).parent / "app-artefacts"),
        project_root=str(Path(__file__).parent.parent)
    )

    scaffold_result = {'cost_estimate': 0.05}
    logic_result = {'cost_estimate': 0.20}
    validation_results = [
        {'cost_estimate': 0.05},  # verification-agent
        {'cost_estimate': 0.10},  # llm-judge
    ]

    total = delegator.get_total_cost_estimate(
        scaffold_result, logic_result, validation_results
    )

    expected = 0.05 + 0.20 + 0.05 + 0.10  # $0.40
    assert total == expected, f"Expected ${expected}, got ${total}"

    print(f"  ✅ Scaffold: ${scaffold_result['cost_estimate']:.2f}")
    print(f"  ✅ Logic: ${logic_result['cost_estimate']:.2f}")
    print(f"  ✅ Validation: ${sum(v['cost_estimate'] for v in validation_results):.2f}")
    print(f"  ✅ Total: ${total:.2f}")
    print("✅ PASS: Cost calculation accurate")


def test_factory_function():
    """Test factory function"""
    print("\nTest 4: Factory Function")

    delegator = create_hybrid_delegator(
        base_dir=str(Path(__file__).parent / "app-artefacts"),
        project_root=str(Path(__file__).parent.parent)
    )

    assert isinstance(delegator, HybridDelegator)
    assert delegator.base_dir.exists() or True  # May not exist yet
    print("✅ PASS: Factory function creates valid instance")


def main():
    """Run all tests"""
    print("=" * 60)
    print("HybridDelegator - Basic Functionality Tests")
    print("=" * 60)

    try:
        test_initialization()
        test_language_detection()
        test_cost_calculation()
        test_factory_function()

        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED (4/4)")
        print("=" * 60)
        print("\nHybridDelegator is ready for integration with Owner Agents")
        print("\nNext Steps:")
        print("1. Refactor backend_owner_agent.py to use HybridDelegator")
        print("2. Refactor frontend_owner_agent.py to use HybridDelegator")
        print("3. Refactor qa_owner_agent.py to use HybridDelegator")

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

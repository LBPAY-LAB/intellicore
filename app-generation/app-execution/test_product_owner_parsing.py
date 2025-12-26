#!/usr/bin/env python3
"""
Test script for Product Owner Agent parsing skills

Validates:
1. Regex pattern correctly extracts RFs
2. Priority detection works
3. Layer detection works
4. Card generation creates proper structure
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.product_owner_agent import ProductOwnerAgent

def test_parsing():
    """Test the parsing functionality"""

    print("=" * 80)
    print("🧪 TESTING PRODUCT OWNER AGENT - PARSING SKILLS")
    print("=" * 80)

    # Create agent
    agent = ProductOwnerAgent()

    # Step 1: Read documentation
    print("\n📚 Step 1: Reading documentation...")
    try:
        documentation = agent._read_all_documentation()
        print(f"✅ Read {len(documentation)} documentation files")
        for filename, content in documentation.items():
            print(f"   - {filename}: {len(content)} chars")
    except Exception as e:
        print(f"❌ Failed to read documentation: {e}")
        return False

    # Step 2: Parse requirements
    print("\n🔍 Step 2: Parsing requirements...")
    try:
        req_doc = documentation.get('requisitos_funcionais_v2.0.md', '')
        requirements = agent._parse_requirements_from_doc(req_doc)

        print(f"✅ Parsed {len(requirements)} requirements")

        if len(requirements) == 0:
            print("❌ CRITICAL: Zero requirements extracted!")
            print("   This means regex pattern is not matching.")
            return False

        # Show first 3 requirements
        print("\n📋 First 3 requirements:")
        for req in requirements[:3]:
            print(f"\n   {req['id']}: {req['name']}")
            print(f"   Priority: {req['priority']}")
            print(f"   Layer: {req['layer']}")
            print(f"   Description: {req['description'][:100]}...")

    except Exception as e:
        print(f"❌ Failed to parse requirements: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Step 3: Parse architecture
    print("\n🏗️  Step 3: Parsing architecture...")
    try:
        arch_doc = documentation.get('arquitetura_supercore_v2.0.md', '')
        architecture = agent._parse_architecture_from_doc(arch_doc)

        print(f"✅ Parsed {len(architecture.get('layers', []))} layers")
        for layer in architecture.get('layers', []):
            print(f"   - {layer}")
    except Exception as e:
        print(f"❌ Failed to parse architecture: {e}")
        return False

    # Step 4: Parse stack
    print("\n🛠️  Step 4: Parsing technology stack...")
    try:
        stack_doc = documentation.get('stack_supercore_v2.0.md', '')
        stack = agent._parse_stack_from_doc(stack_doc)

        print(f"✅ Parsed {len(stack.get('technologies', []))} technologies")
        print(f"   Technologies: {', '.join(stack.get('technologies', [])[:10])}")
    except Exception as e:
        print(f"❌ Failed to parse stack: {e}")
        return False

    # Step 5: Generate cards from requirements
    print("\n📋 Step 5: Generating cards from requirements...")
    try:
        cards = agent._generate_cards_from_requirements(requirements, architecture, stack)

        print(f"✅ Generated {len(cards)} cards")
        print(f"   Expected: {len(requirements) * 3} (3 cards per requirement)")

        if len(cards) != len(requirements) * 3:
            print(f"⚠️  WARNING: Card count mismatch!")

        # Show first card
        print("\n📄 First card example:")
        if cards:
            card = cards[0]
            print(f"   ID: {card['card_id']}")
            print(f"   Title: {card['title']}")
            print(f"   Type: {card['type']}")
            print(f"   Priority: {card['priority']}")
            print(f"   User Story: {card['user_story'][:100]}...")
            print(f"   Acceptance Criteria ({len(card['acceptance_criteria'])} items):")
            for criteria in card['acceptance_criteria'][:2]:
                print(f"      - {criteria}")
    except Exception as e:
        print(f"❌ Failed to generate cards: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Step 6: Generate epics
    print("\n🎯 Step 6: Generating epics...")
    try:
        epics = agent._generate_epics_from_requirements(requirements)

        print(f"✅ Generated {len(epics)} epics")
        for epic in epics:
            print(f"   - {epic['epic_id']}: {epic['title']} ({len(epic['cards'])} cards)")
    except Exception as e:
        print(f"❌ Failed to generate epics: {e}")
        return False

    # Final summary
    print("\n" + "=" * 80)
    print("📊 PARSING TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Requirements extracted: {len(requirements)}")
    print(f"✅ Cards generated: {len(cards)}")
    print(f"✅ Epics created: {len(epics)}")
    print(f"✅ Layers identified: {len(architecture.get('layers', []))}")
    print(f"✅ Technologies found: {len(stack.get('technologies', []))}")

    # Validation
    print("\n🔍 VALIDATION:")

    checks = {
        "Requirements ≥ 30": len(requirements) >= 30,
        "Cards ≥ 90": len(cards) >= 90,
        "Epics ≥ 1": len(epics) >= 1,
        "All cards have IDs": all(card.get('card_id') for card in cards),
        "All cards have user stories": all(card.get('user_story') for card in cards),
        "All cards have acceptance criteria": all(card.get('acceptance_criteria') for card in cards),
    }

    all_passed = True
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"{status} {check}")
        if not passed:
            all_passed = False

    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
        print("=" * 80)
        return True
    else:
        print("❌ SOME TESTS FAILED")
        print("=" * 80)
        return False


if __name__ == "__main__":
    success = test_parsing()
    sys.exit(0 if success else 1)

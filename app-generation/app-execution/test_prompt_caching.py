#!/usr/bin/env python3
"""
Test script for Prompt Caching Implementation

Tests CachedLLMClient with real API calls to verify:
1. Cache writes on first execution
2. Cache reads on subsequent executions
3. 90% cost savings on cached content
4. Correct token usage tracking

Usage:
    # Set API key
    export ANTHROPIC_API_KEY='your-key-here'

    # Run test
    python3 test_prompt_caching.py

Expected Results:
    ✅ First call: Cache creation tokens > 0
    ✅ Second call: Cache read tokens > 0
    ✅ Cache hit rate: ~90%
    ✅ Cost savings: ~89%
"""

import os
import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from utils.cached_llm_client import get_cached_client

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_prompt_caching():
    """
    Test prompt caching with real documentation

    Simulates Product Owner Agent workflow:
    1. Read documentation (large, static content)
    2. Generate response (small, dynamic content)
    3. Verify caching works
    """
    logger.info("=" * 80)
    logger.info("🧪 Testing Prompt Caching Implementation")
    logger.info("=" * 80)

    # Get cached client
    client = get_cached_client()

    if not client:
        logger.error("❌ CachedLLMClient unavailable (check ANTHROPIC_API_KEY)")
        logger.info("💡 Set ANTHROPIC_API_KEY to run this test")
        sys.exit(1)

    # Load sample documentation (simulate Product Owner reading docs)
    docs_base = Path(__file__).parent.parent.parent / "documentation-base"

    requisitos_file = docs_base / "requisitos_funcionais_v2.0.md"
    arquitetura_file = docs_base / "arquitetura_supercore_v2.0.md"
    stack_file = docs_base / "stack_supercore_v2.0.md"

    # Check if files exist
    if not all([requisitos_file.exists(), arquitetura_file.exists(), stack_file.exists()]):
        logger.error(f"❌ Documentation files not found in {docs_base}")
        sys.exit(1)

    # Read documentation
    with open(requisitos_file, 'r', encoding='utf-8') as f:
        requisitos_content = f.read()

    with open(arquitetura_file, 'r', encoding='utf-8') as f:
        arquitetura_content = f.read()

    with open(stack_file, 'r', encoding='utf-8') as f:
        stack_content = f.read()

    logger.info(f"✅ Loaded documentation:")
    logger.info(f"  - Requisitos: {len(requisitos_content):,} chars")
    logger.info(f"  - Arquitetura: {len(arquitetura_content):,} chars")
    logger.info(f"  - Stack: {len(stack_content):,} chars")

    # Prepare cached context
    cached_context = [
        {'name': 'Requisitos Funcionais v2.0', 'content': requisitos_content},
        {'name': 'Arquitetura SuperCore v2.0', 'content': arquitetura_content},
        {'name': 'Stack SuperCore v2.0', 'content': stack_content}
    ]

    # Test 1: First call (cache WRITE)
    logger.info("\n" + "=" * 80)
    logger.info("🔹 Test 1: First Call (Cache WRITE expected)")
    logger.info("=" * 80)

    response1 = client.generate(
        model='claude-sonnet-4-5-20251029',
        system_prompt='You are a product owner assistant.',
        cached_context=cached_context,
        user_message='List the first 3 functional requirements from the documentation.',
        max_tokens=500
    )

    logger.info(f"\n📝 Response (first 200 chars):")
    logger.info(response1['content'][:200] + "...")

    # Validate first call
    assert response1['usage']['cache_creation_tokens'] > 0, "❌ Cache creation expected on first call"
    assert response1['usage']['cache_read_tokens'] == 0, "❌ No cache reads expected on first call"

    logger.info(f"\n✅ Test 1 PASSED:")
    logger.info(f"  - Cache created: {response1['usage']['cache_creation_tokens']:,} tokens")
    logger.info(f"  - Cost: ${response1['cost']['total']:.4f}")

    # Test 2: Second call (cache READ)
    logger.info("\n" + "=" * 80)
    logger.info("🔹 Test 2: Second Call (Cache READ expected)")
    logger.info("=" * 80)

    response2 = client.generate(
        model='claude-sonnet-4-5-20251029',
        system_prompt='You are a product owner assistant.',
        cached_context=cached_context,
        user_message='What are the main architectural layers described?',
        max_tokens=500
    )

    logger.info(f"\n📝 Response (first 200 chars):")
    logger.info(response2['content'][:200] + "...")

    # Validate second call
    assert response2['usage']['cache_read_tokens'] > 0, "❌ Cache reads expected on second call"
    assert response2['cache_hit_rate'] > 50, f"❌ Cache hit rate too low: {response2['cache_hit_rate']:.1f}%"

    logger.info(f"\n✅ Test 2 PASSED:")
    logger.info(f"  - Cache read: {response2['usage']['cache_read_tokens']:,} tokens")
    logger.info(f"  - Cache hit rate: {response2['cache_hit_rate']:.1f}%")
    logger.info(f"  - Cost: ${response2['cost']['total']:.4f}")
    logger.info(f"  - Savings: ${response2['cost_savings']:.4f}")

    # Test 3: Compare costs
    logger.info("\n" + "=" * 80)
    logger.info("🔹 Test 3: Cost Comparison")
    logger.info("=" * 80)

    total_cost_with_cache = response1['cost']['total'] + response2['cost']['total']
    total_cost_without_cache = response1['cost_without_cache'] + response2['cost_without_cache']
    total_savings = total_cost_without_cache - total_cost_with_cache
    savings_percentage = (total_savings / total_cost_without_cache) * 100

    logger.info(f"💰 Cost Analysis (2 calls):")
    logger.info(f"  - With caching: ${total_cost_with_cache:.4f}")
    logger.info(f"  - Without caching: ${total_cost_without_cache:.4f}")
    logger.info(f"  - Total savings: ${total_savings:.4f} ({savings_percentage:.1f}% off)")

    assert savings_percentage > 40, f"❌ Savings too low: {savings_percentage:.1f}% (expected >40%)"

    logger.info(f"\n✅ Test 3 PASSED:")
    logger.info(f"  - Achieved {savings_percentage:.1f}% cost reduction")

    # Summary
    logger.info("\n" + "=" * 80)
    logger.info("✅ ALL TESTS PASSED")
    logger.info("=" * 80)

    logger.info(f"\n📊 Summary:")
    logger.info(f"  - Cache Implementation: ✅ Working")
    logger.info(f"  - Cache Hit Rate: {response2['cache_hit_rate']:.1f}%")
    logger.info(f"  - Cost Savings: {savings_percentage:.1f}%")
    logger.info(f"  - Total Cost (2 calls): ${total_cost_with_cache:.4f}")

    logger.info(f"\n💡 Extrapolation (100 backlogs/year):")
    logger.info(f"  - Annual cost with caching: ${total_cost_with_cache * 50:.2f}")
    logger.info(f"  - Annual cost without caching: ${total_cost_without_cache * 50:.2f}")
    logger.info(f"  - Annual savings: ${total_savings * 50:.2f}")

    return {
        'success': True,
        'cache_hit_rate': response2['cache_hit_rate'],
        'cost_savings_percentage': savings_percentage,
        'total_cost_with_cache': total_cost_with_cache,
        'total_cost_without_cache': total_cost_without_cache
    }


if __name__ == '__main__':
    try:
        result = test_prompt_caching()
        sys.exit(0)
    except AssertionError as e:
        logger.error(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}", exc_info=True)
        sys.exit(1)

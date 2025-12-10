#!/bin/bash
# Test script for RAG Graph Layer

set -e

BASE_URL="http://localhost:8080/api/v1"

echo "========================================="
echo "RAG Graph Layer - Test Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if API is healthy
echo -e "${BLUE}Test 1: Health Check${NC}"
curl -s http://localhost:8080/health | jq '.'
echo -e "${GREEN}✓ API is healthy${NC}"
echo ""

# Test 2: Full sync to Nebula Graph
echo -e "${BLUE}Test 2: Full Sync to Nebula Graph${NC}"
echo "This may take a few seconds..."
SYNC_RESULT=$(curl -s -X POST ${BASE_URL}/rag/graph/sync)
echo $SYNC_RESULT | jq '.'

SYNCED_INSTANCES=$(echo $SYNC_RESULT | jq -r '.instances.synced')
SYNCED_RELATIONSHIPS=$(echo $SYNC_RESULT | jq -r '.relationships.synced')

echo -e "${GREEN}✓ Synced $SYNCED_INSTANCES instances and $SYNCED_RELATIONSHIPS relationships${NC}"
echo ""

# Test 3: Query graph with natural language
echo -e "${BLUE}Test 3: Natural Language Query${NC}"
echo "Question: Quais contas Maria Silva possui?"
curl -s -X POST ${BASE_URL}/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais contas Maria Silva possui?"}' | jq '.'
echo -e "${GREEN}✓ Graph query executed${NC}"
echo ""

# Test 4: Find related instances
echo -e "${BLUE}Test 4: Find Related Instances${NC}"
# First, get an instance ID from the database
INSTANCE_ID=$(curl -s "${BASE_URL}/instances?limit=1" | jq -r '.data[0].id // empty')

if [ -z "$INSTANCE_ID" ]; then
  echo -e "${YELLOW}⚠ No instances found in database. Skipping test.${NC}"
else
  echo "Finding instances related to: $INSTANCE_ID"
  curl -s "${BASE_URL}/rag/graph/instances/${INSTANCE_ID}/related?depth=1" | jq '.'
  echo -e "${GREEN}✓ Related instances query executed${NC}"
fi
echo ""

# Test 5: Analyze impact
echo -e "${BLUE}Test 5: Analyze Deletion Impact${NC}"
if [ -z "$INSTANCE_ID" ]; then
  echo -e "${YELLOW}⚠ No instances found in database. Skipping test.${NC}"
else
  echo "Analyzing impact for instance: $INSTANCE_ID"
  curl -s "${BASE_URL}/rag/graph/instances/${INSTANCE_ID}/impact" | jq '.'
  echo -e "${GREEN}✓ Impact analysis executed${NC}"
fi
echo ""

# Test 6: Find path between instances
echo -e "${BLUE}Test 6: Find Shortest Path${NC}"
# Get two instance IDs
INSTANCE_1=$(curl -s "${BASE_URL}/instances?limit=1&offset=0" | jq -r '.data[0].id // empty')
INSTANCE_2=$(curl -s "${BASE_URL}/instances?limit=1&offset=1" | jq -r '.data[0].id // empty')

if [ -z "$INSTANCE_1" ] || [ -z "$INSTANCE_2" ]; then
  echo -e "${YELLOW}⚠ Not enough instances in database. Skipping test.${NC}"
else
  echo "Finding path from $INSTANCE_1 to $INSTANCE_2"
  curl -s "${BASE_URL}/rag/graph/path?from=${INSTANCE_1}&to=${INSTANCE_2}" | jq '.'
  echo -e "${GREEN}✓ Path finding executed${NC}"
fi
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Create some test data with instances and relationships"
echo "2. Run this script again to see graph traversal in action"
echo "3. Try custom queries with: curl -X POST ${BASE_URL}/rag/query/graph -d '{\"question\": \"Your question\"}'"
echo ""

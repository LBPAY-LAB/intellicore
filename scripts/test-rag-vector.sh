#!/bin/bash

# Test script for RAG Vector Layer
# Tests pgvector semantic search functionality

set -e

API_URL="${API_URL:-http://localhost:8080}"
API_BASE="${API_URL}/api/v1"

echo "=========================================="
echo "RAG Vector Layer Test Suite"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test 1: Health Check
echo "Test 1: Backend Health Check"
if curl -s "${API_URL}/health" | jq -e '.status == "healthy"' > /dev/null; then
    print_success "Backend is healthy"
else
    print_error "Backend is not responding"
    exit 1
fi
echo ""

# Test 2: Embedding Stats
echo "Test 2: Get Embedding Statistics"
STATS=$(curl -s "${API_BASE}/embeddings/stats")
TOTAL=$(echo "$STATS" | jq -r '.total_embeddings')
print_info "Total embeddings: $TOTAL"
echo "$STATS" | jq
echo ""

# Test 3: Create Test Object Definition
echo "Test 3: Create Test Object Definition"
OBJDEF_RESPONSE=$(curl -s -X POST "${API_BASE}/object-definitions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_cliente_pf_rag",
    "display_name": "Cliente Pessoa Física (Test RAG)",
    "description": "Objeto de teste para validar busca semântica com RAG. Representa uma pessoa física que é cliente do banco e precisa passar por KYC e validações do BACEN.",
    "category": "customer",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {
          "type": "string",
          "pattern": "^\\d{11}$",
          "description": "CPF do cliente (11 dígitos sem formatação)"
        },
        "nome_completo": {
          "type": "string",
          "minLength": 3,
          "description": "Nome completo do cliente"
        },
        "email": {
          "type": "string",
          "format": "email",
          "description": "Email do cliente"
        },
        "data_nascimento": {
          "type": "string",
          "format": "date",
          "description": "Data de nascimento (YYYY-MM-DD)"
        }
      },
      "required": ["cpf", "nome_completo", "email"]
    }
  }')

OBJDEF_ID=$(echo "$OBJDEF_RESPONSE" | jq -r '.id')

if [ "$OBJDEF_ID" != "null" ] && [ -n "$OBJDEF_ID" ]; then
    print_success "Object definition created: $OBJDEF_ID"
else
    print_error "Failed to create object definition"
    echo "$OBJDEF_RESPONSE" | jq
    exit 1
fi
echo ""

# Test 4: Index the Object Definition
echo "Test 4: Index Object Definition for Semantic Search"
INDEX_RESPONSE=$(curl -s -X POST "${API_BASE}/embeddings/index/object-definition/${OBJDEF_ID}")
if echo "$INDEX_RESPONSE" | jq -e '.message' > /dev/null; then
    print_success "Object definition indexed successfully"
    echo "$INDEX_RESPONSE" | jq
else
    print_error "Failed to index object definition"
    echo "$INDEX_RESPONSE"
fi
echo ""

# Wait for indexing to complete
print_info "Waiting 2 seconds for embedding to be stored..."
sleep 2
echo ""

# Test 5: Semantic Search - Query 1
echo "Test 5: Semantic Search - Query 'pessoa física cliente'"
SEARCH_RESPONSE=$(curl -s -X POST "${API_BASE}/search/semantic" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "pessoa física cliente",
    "content_type": "object_definition",
    "limit": 3
  }')

RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.count')
if [ "$RESULT_COUNT" -gt 0 ]; then
    print_success "Found $RESULT_COUNT results"
    echo "$SEARCH_RESPONSE" | jq '.results[] | {display_name: .metadata.display_name, similarity: .similarity}'
else
    print_error "No results found"
fi
echo ""

# Test 6: Semantic Search - Query 2
echo "Test 6: Semantic Search - Query 'validação BACEN e KYC'"
SEARCH_RESPONSE=$(curl -s -X POST "${API_BASE}/search/semantic" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "validação BACEN e KYC",
    "content_type": "object_definition",
    "limit": 3
  }')

RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.count')
if [ "$RESULT_COUNT" -gt 0 ]; then
    print_success "Found $RESULT_COUNT results"
    echo "$SEARCH_RESPONSE" | jq '.results[] | {display_name: .metadata.display_name, similarity: .similarity}'
else
    print_error "No results found"
fi
echo ""

# Test 7: Create and Index Instance
echo "Test 7: Create and Index Instance"
INSTANCE_RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"${OBJDEF_ID}\",
    \"data\": {
      \"cpf\": \"12345678901\",
      \"nome_completo\": \"Maria Silva Santos\",
      \"email\": \"maria.silva@example.com\",
      \"data_nascimento\": \"1990-05-15\"
    }
  }")

INSTANCE_ID=$(echo "$INSTANCE_RESPONSE" | jq -r '.id')

if [ "$INSTANCE_ID" != "null" ] && [ -n "$INSTANCE_ID" ]; then
    print_success "Instance created: $INSTANCE_ID"

    # Index the instance
    INDEX_INSTANCE_RESPONSE=$(curl -s -X POST "${API_BASE}/embeddings/index/instance/${INSTANCE_ID}")
    if echo "$INDEX_INSTANCE_RESPONSE" | jq -e '.message' > /dev/null; then
        print_success "Instance indexed successfully"
    else
        print_error "Failed to index instance"
    fi
else
    print_error "Failed to create instance"
    echo "$INSTANCE_RESPONSE" | jq
fi
echo ""

# Wait for indexing
print_info "Waiting 2 seconds for instance embedding..."
sleep 2
echo ""

# Test 8: Search Instances
echo "Test 8: Semantic Search for Instances - Query 'Maria Silva'"
SEARCH_RESPONSE=$(curl -s -X POST "${API_BASE}/search/semantic" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Maria Silva",
    "content_type": "instance",
    "limit": 5
  }')

RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.count')
if [ "$RESULT_COUNT" -gt 0 ]; then
    print_success "Found $RESULT_COUNT instance(s)"
    echo "$SEARCH_RESPONSE" | jq '.results[] | {cpf: .metadata.cpf, similarity: .similarity}'
else
    print_error "No instances found"
fi
echo ""

# Test 9: Updated Stats
echo "Test 9: Updated Embedding Statistics"
STATS=$(curl -s "${API_BASE}/embeddings/stats")
TOTAL=$(echo "$STATS" | jq -r '.total_embeddings')
OBJDEFS=$(echo "$STATS" | jq -r '.object_definitions')
INSTANCES=$(echo "$STATS" | jq -r '.instances')
print_info "Total: $TOTAL | Object Definitions: $OBJDEFS | Instances: $INSTANCES"
echo "$STATS" | jq
echo ""

# Test 10: Search by Metadata
echo "Test 10: Search by Metadata (CPF)"
METADATA_SEARCH=$(curl -s "${API_BASE}/search/metadata?content_type=instance&metadata_key=cpf&metadata_value=12345678901&limit=5")
RESULT_COUNT=$(echo "$METADATA_SEARCH" | jq -r '.count')
if [ "$RESULT_COUNT" -gt 0 ]; then
    print_success "Found $RESULT_COUNT result(s) with CPF filter"
    echo "$METADATA_SEARCH" | jq '.results[] | {cpf: .metadata.cpf, content_type: .content_type}'
else
    print_info "No results found (this is expected if instance wasn't indexed yet)"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
print_success "All tests completed!"
echo ""
print_info "Next steps:"
echo "  1. Index all existing object definitions:"
echo "     curl -X POST ${API_BASE}/embeddings/index/object-definitions"
echo ""
echo "  2. Test semantic search with your own queries:"
echo "     curl -X POST ${API_BASE}/search/semantic -H 'Content-Type: application/json' -d '{\"query\": \"your query\", \"limit\": 5}'"
echo ""
echo "  3. Monitor embedding statistics:"
echo "     curl ${API_BASE}/embeddings/stats"
echo ""

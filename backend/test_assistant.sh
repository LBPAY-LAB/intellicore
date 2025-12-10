#!/bin/bash
# ============================================================================
# Natural Language Assistant - Complete Flow Test
# ============================================================================
# This script demonstrates a complete conversation flow to create an
# Object Definition using natural language
# ============================================================================

set -e

API_URL="${API_URL:-http://localhost:8080}"
BASE_URL="$API_URL/api/v1/assistant"

echo "============================================================================"
echo "Testing Natural Language Assistant API"
echo "============================================================================"
echo ""
echo "API URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start conversation
echo -e "${BLUE}Step 1: Starting conversation...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/conversations")
CONVERSATION_ID=$(echo $RESPONSE | jq -r '.conversation_id')
echo "Conversation ID: $CONVERSATION_ID"
echo "First Question: $(echo $RESPONSE | jq -r '.next_step.question')"
echo ""

# Step 2: Answer - Object Name
echo -e "${BLUE}Step 2: Providing object name...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "Cliente Pessoa Física"}' | jq '.'
echo ""

# Step 3: Answer - Description
echo -e "${BLUE}Step 3: Providing description...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "Uma pessoa física que deseja abrir conta bancária. Precisa passar por KYC e validações do BACEN."}' | jq '.'
echo ""

# Step 4: Answer - Fields
echo -e "${BLUE}Step 4: Listing fields needed...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "CPF, Nome Completo, Data de Nascimento, RG, Endereço (CEP, Rua, Número, Cidade, Estado), Telefone, Email, Renda Mensal, Profissão"}' | jq '.'
echo ""

# Step 5: Answer - Special Validations
echo -e "${BLUE}Step 5: Specifying BACEN validations...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "CPF (validação completa), Email, Telefone BR, CEP"}' | jq '.'
echo ""

# Step 6: Answer - Lifecycle States
echo -e "${BLUE}Step 6: Defining lifecycle states...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "Cadastro Iniciado, Documentos Pendentes, Em Análise, Aprovado, Ativo, Bloqueado, Inativo"}' | jq '.'
echo ""

# Step 7: Answer - Relationships
echo -e "${BLUE}Step 7: Defining relationships...${NC}"
curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "Cliente pode ser TITULAR de Conta Corrente. Cliente pode ser PAI/MÃE de outros Clientes (dependentes menores de 18 anos)."}' | jq '.'
echo ""

# Step 8: Get Preview (automatically generated at step 7)
echo -e "${YELLOW}Step 8: Generating preview with LLM...${NC}"
PREVIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{"message": "sim"}')

echo "$PREVIEW_RESPONSE" | jq '.'
echo ""

# Extract preview details
echo -e "${GREEN}Generated Object Preview:${NC}"
echo "Name: $(echo $PREVIEW_RESPONSE | jq -r '.preview.name')"
echo "Display Name: $(echo $PREVIEW_RESPONSE | jq -r '.preview.display_name')"
echo "Category: $(echo $PREVIEW_RESPONSE | jq -r '.preview.category')"
echo "Field Count: $(echo $PREVIEW_RESPONSE | jq -r '.preview.field_count')"
echo "State Count: $(echo $PREVIEW_RESPONSE | jq -r '.preview.state_count')"
echo "Confidence: $(echo $PREVIEW_RESPONSE | jq -r '.preview.confidence')"
echo ""

# Step 9: Confirm Creation
echo -e "${BLUE}Step 9: Confirming creation...${NC}"
CONFIRM_RESPONSE=$(curl -s -X POST "$BASE_URL/conversations/$CONVERSATION_ID/confirm")
echo "$CONFIRM_RESPONSE" | jq '.'

OBJECT_DEF_ID=$(echo $CONFIRM_RESPONSE | jq -r '.object_definition_id')
echo ""
echo -e "${GREEN}✓ Success!${NC}"
echo "Object Definition ID: $OBJECT_DEF_ID"
echo ""

# Verify the created object
echo -e "${BLUE}Step 10: Verifying created object...${NC}"
curl -s "$API_URL/api/v1/object-definitions/$OBJECT_DEF_ID" | jq '.'
echo ""

echo "============================================================================"
echo -e "${GREEN}Test completed successfully!${NC}"
echo "============================================================================"
echo ""
echo "Next steps:"
echo "1. View the object in the UI: http://localhost:3000/object-definitions/$OBJECT_DEF_ID"
echo "2. Create instances: POST /api/v1/instances"
echo "3. Test the generated schema and validation rules"
echo ""

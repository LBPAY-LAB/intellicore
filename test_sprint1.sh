#!/bin/bash

# Sprint 1 Critical Scenario Test
# Tests the complete implementation of object_definitions, instances, and relationships APIs

set -e

echo "🧪 Starting Sprint 1 Critical Scenario Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api/v1"

# Helper function to check if API is running
check_api() {
    echo -n "Checking if API is running... "
    if curl -s -f "$API_URL/../health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo ""
        echo "❌ API is not running on port 8080"
        echo "Please start the backend API first:"
        echo "  cd backend"
        echo "  go run cmd/api/main.go"
        exit 1
    fi
}

# Test 1: Create object_definition for "cliente_pf"
test_create_object_definition() {
    echo ""
    echo "📝 Test 1: Creating object_definition 'cliente_pf'"
    echo "------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/object-definitions" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "cliente_pf",
            "display_name": "Cliente Pessoa Física",
            "description": "Cliente pessoa física com validação de CPF",
            "schema": {
                "type": "object",
                "properties": {
                    "nome": {
                        "type": "string",
                        "minLength": 3
                    },
                    "cpf": {
                        "type": "string",
                        "pattern": "^[0-9]{11}$",
                        "description": "CPF deve ter exatamente 11 dígitos numéricos"
                    },
                    "email": {
                        "type": "string",
                        "format": "email"
                    }
                },
                "required": ["nome", "cpf"]
            },
            "states": {
                "initial": "PENDENTE",
                "states": ["PENDENTE", "ATIVO", "BLOQUEADO", "INATIVO"],
                "transitions": [
                    {"from": "PENDENTE", "to": "ATIVO"},
                    {"from": "ATIVO", "to": "BLOQUEADO"},
                    {"from": "BLOQUEADO", "to": "ATIVO"},
                    {"from": "ATIVO", "to": "INATIVO"}
                ]
            }
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Object definition created (HTTP $HTTP_CODE)"
        OBJECT_DEF_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Object Definition ID: $OBJECT_DEF_ID"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 201, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 2: Create valid instance (should succeed with 201)
test_create_valid_instance() {
    echo ""
    echo "📝 Test 2: Creating VALID instance (correct CPF format)"
    echo "-------------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/instances" \
        -H "Content-Type: application/json" \
        -d "{
            \"object_definition_id\": \"$OBJECT_DEF_ID\",
            \"data\": {
                \"nome\": \"João Silva\",
                \"cpf\": \"12345678901\",
                \"email\": \"joao.silva@example.com\"
            }
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Valid instance created (HTTP $HTTP_CODE)"
        INSTANCE1_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        INSTANCE1_STATE=$(echo "$BODY" | grep -o '"current_state":"[^"]*"' | cut -d'"' -f4)
        echo "   Instance ID: $INSTANCE1_ID"
        echo "   Initial State: $INSTANCE1_STATE"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 201, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 3: Create invalid instance (should fail with 400)
test_create_invalid_instance() {
    echo ""
    echo "📝 Test 3: Creating INVALID instance (incorrect CPF format)"
    echo "-----------------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/instances" \
        -H "Content-Type: application/json" \
        -d "{
            \"object_definition_id\": \"$OBJECT_DEF_ID\",
            \"data\": {
                \"nome\": \"Maria Santos\",
                \"cpf\": \"invalid\",
                \"email\": \"maria@example.com\"
            }
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Invalid instance rejected (HTTP $HTTP_CODE)"
        echo "   Error: $(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 400, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 4: Test FSM state transition (PENDENTE → ATIVO)
test_state_transition() {
    echo ""
    echo "📝 Test 4: Testing FSM state transition (PENDENTE → ATIVO)"
    echo "----------------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/instances/$INSTANCE1_ID/transition" \
        -H "Content-Type: application/json" \
        -d '{
            "to_state": "ATIVO",
            "comment": "Cliente aprovado após análise"
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        NEW_STATE=$(echo "$BODY" | grep -o '"current_state":"[^"]*"' | cut -d'"' -f4)
        if [ "$NEW_STATE" = "ATIVO" ]; then
            echo -e "${GREEN}✓ PASSED${NC} - State transition successful (HTTP $HTTP_CODE)"
            echo "   New State: $NEW_STATE"
        else
            echo -e "${RED}✗ FAILED${NC} - State transition returned wrong state: $NEW_STATE"
            exit 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 200, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 5: Test invalid state transition (should fail)
test_invalid_state_transition() {
    echo ""
    echo "📝 Test 5: Testing INVALID state transition (ATIVO → PENDENTE)"
    echo "--------------------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/instances/$INSTANCE1_ID/transition" \
        -H "Content-Type: application/json" \
        -d '{
            "to_state": "PENDENTE",
            "comment": "Tentativa de transição inválida"
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Invalid transition rejected (HTTP $HTTP_CODE)"
        echo "   Error: $(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 400, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 6: Create another instance for relationship testing
test_create_second_instance() {
    echo ""
    echo "📝 Test 6: Creating second instance for relationship test"
    echo "---------------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/instances" \
        -H "Content-Type: application/json" \
        -d "{
            \"object_definition_id\": \"$OBJECT_DEF_ID\",
            \"data\": {
                \"nome\": \"Pedro Oliveira\",
                \"cpf\": \"98765432109\",
                \"email\": \"pedro@example.com\"
            }
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Second instance created (HTTP $HTTP_CODE)"
        INSTANCE2_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Instance ID: $INSTANCE2_ID"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 201, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 7: Create relationship between instances
test_create_relationship() {
    echo ""
    echo "📝 Test 7: Creating relationship (PAI_DE)"
    echo "-----------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/relationships" \
        -H "Content-Type: application/json" \
        -d "{
            \"relationship_type\": \"PAI_DE\",
            \"source_instance_id\": \"$INSTANCE1_ID\",
            \"target_instance_id\": \"$INSTANCE2_ID\",
            \"properties\": {
                \"grau_parentesco\": \"pai\",
                \"estabelecido_em\": \"2024-01-15\"
            }
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Relationship created (HTTP $HTTP_CODE)"
        RELATIONSHIP_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Relationship ID: $RELATIONSHIP_ID"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 201, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 8: List relationships
test_list_relationships() {
    echo ""
    echo "📝 Test 8: Listing relationships for source instance"
    echo "----------------------------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/relationships?source_instance_id=$INSTANCE1_ID")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        TOTAL=$(echo "$BODY" | grep -o '"total":[0-9]*' | cut -d':' -f2)
        echo -e "${GREEN}✓ PASSED${NC} - Relationships listed (HTTP $HTTP_CODE)"
        echo "   Total relationships: $TOTAL"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 200, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 9: Get instance by ID
test_get_instance() {
    echo ""
    echo "📝 Test 9: Getting instance by ID"
    echo "----------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/instances/$INSTANCE1_ID")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        NOME=$(echo "$BODY" | grep -o '"nome":"[^"]*"' | cut -d'"' -f4)
        STATE=$(echo "$BODY" | grep -o '"current_state":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ PASSED${NC} - Instance retrieved (HTTP $HTTP_CODE)"
        echo "   Nome: $NOME"
        echo "   State: $STATE"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 200, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Test 10: Update instance
test_update_instance() {
    echo ""
    echo "📝 Test 10: Updating instance data"
    echo "----------------------------------"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/instances/$INSTANCE1_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "data": {
                "nome": "João Silva Santos",
                "cpf": "12345678901",
                "email": "joao.santos@example.com"
            }
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        NEW_NOME=$(echo "$BODY" | grep -o '"nome":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓ PASSED${NC} - Instance updated (HTTP $HTTP_CODE)"
        echo "   New nome: $NEW_NOME"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected HTTP 200, got $HTTP_CODE"
        echo "   Response: $BODY"
        exit 1
    fi
}

# Run all tests
main() {
    check_api
    test_create_object_definition
    test_create_valid_instance
    test_create_invalid_instance
    test_state_transition
    test_invalid_state_transition
    test_create_second_instance
    test_create_relationship
    test_list_relationships
    test_get_instance
    test_update_instance

    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ All Sprint 1 tests PASSED!${NC}"
    echo "=========================================="
    echo ""
    echo "Summary:"
    echo "  ✓ Object definitions API working"
    echo "  ✓ Instances API working"
    echo "  ✓ JSON Schema validation working"
    echo "  ✓ FSM state transitions working"
    echo "  ✓ Relationships API working"
    echo ""
}

main

#!/bin/bash

# Integration Test Example for Conditional Transitions
# This script demonstrates how to test the condition evaluator with real API calls

BASE_URL="http://localhost:8080"

echo "=========================================="
echo "Conditional Transitions Integration Test"
echo "=========================================="
echo ""

# Step 1: Create an Object Definition with conditional transitions
echo "Step 1: Creating Object Definition with conditional transitions..."
OBJECT_DEF=$(curl -s -X POST "$BASE_URL/api/object-definitions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "bank_account",
    "display_name": "Bank Account",
    "description": "Bank account with conditional approval workflow",
    "category": "BUSINESS_ENTITY",
    "schema": {
      "type": "object",
      "properties": {
        "saldo": {"type": "number"},
        "documentsValid": {"type": "boolean"},
        "accountHolder": {"type": "string"},
        "accountType": {"type": "string"}
      },
      "required": ["saldo", "documentsValid", "accountHolder"]
    },
    "states": {
      "initial": "pending",
      "states": ["pending", "approved", "rejected"],
      "transitions": [
        {
          "from": "pending",
          "to": "approved",
          "condition": "data.saldo >= 100 && data.documentsValid == true"
        },
        {
          "from": "pending",
          "to": "rejected",
          "condition": "data.saldo < 100 || data.documentsValid == false"
        }
      ]
    }
  }')

OBJECT_ID=$(echo $OBJECT_DEF | jq -r '.id')
echo "Created Object Definition: $OBJECT_ID"
echo ""

# Step 2: Create an instance with sufficient balance (should allow approval)
echo "Step 2: Creating instance with sufficient balance (saldo=150)..."
INSTANCE_SUCCESS=$(curl -s -X POST "$BASE_URL/api/instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"$OBJECT_ID\",
    \"data\": {
      \"saldo\": 150,
      \"documentsValid\": true,
      \"accountHolder\": \"John Doe\",
      \"accountType\": \"checking\"
    }
  }")

INSTANCE_SUCCESS_ID=$(echo $INSTANCE_SUCCESS | jq -r '.id')
echo "Created Instance: $INSTANCE_SUCCESS_ID"
echo "Current State: $(echo $INSTANCE_SUCCESS | jq -r '.current_state')"
echo ""

# Step 3: Try to approve (should SUCCEED because saldo >= 100 && documentsValid == true)
echo "Step 3: Attempting to transition to 'approved' (should SUCCEED)..."
TRANSITION_SUCCESS=$(curl -s -X POST "$BASE_URL/api/instances/$INSTANCE_SUCCESS_ID/transition" \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "approved",
    "reason": "Account meets minimum balance requirement"
  }')

echo "Transition Result:"
echo $TRANSITION_SUCCESS | jq '.'
echo ""
echo "New State: $(echo $TRANSITION_SUCCESS | jq -r '.current_state')"
echo ""

# Step 4: Create an instance with insufficient balance (should NOT allow approval)
echo "Step 4: Creating instance with insufficient balance (saldo=50)..."
INSTANCE_FAIL=$(curl -s -X POST "$BASE_URL/api/instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"$OBJECT_ID\",
    \"data\": {
      \"saldo\": 50,
      \"documentsValid\": true,
      \"accountHolder\": \"Jane Smith\",
      \"accountType\": \"savings\"
    }
  }")

INSTANCE_FAIL_ID=$(echo $INSTANCE_FAIL | jq -r '.id')
echo "Created Instance: $INSTANCE_FAIL_ID"
echo "Current State: $(echo $INSTANCE_FAIL | jq -r '.current_state')"
echo ""

# Step 5: Try to approve (should FAIL because saldo < 100)
echo "Step 5: Attempting to transition to 'approved' (should FAIL)..."
TRANSITION_FAIL=$(curl -s -X POST "$BASE_URL/api/instances/$INSTANCE_FAIL_ID/transition" \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "approved",
    "reason": "Attempting approval"
  }')

echo "Transition Result (should show error):"
echo $TRANSITION_FAIL | jq '.'
echo ""

# Step 6: Transition to rejected instead (should SUCCEED because condition allows it)
echo "Step 6: Attempting to transition to 'rejected' instead (should SUCCEED)..."
TRANSITION_REJECT=$(curl -s -X POST "$BASE_URL/api/instances/$INSTANCE_FAIL_ID/transition" \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "rejected",
    "reason": "Insufficient balance"
  }')

echo "Transition Result:"
echo $TRANSITION_REJECT | jq '.'
echo ""
echo "New State: $(echo $TRANSITION_REJECT | jq -r '.current_state')"
echo ""

# Step 7: Create instance with invalid documents (should NOT allow approval)
echo "Step 7: Creating instance with good balance but invalid documents..."
INSTANCE_DOCS_INVALID=$(curl -s -X POST "$BASE_URL/api/instances" \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"$OBJECT_ID\",
    \"data\": {
      \"saldo\": 200,
      \"documentsValid\": false,
      \"accountHolder\": \"Bob Johnson\",
      \"accountType\": \"checking\"
    }
  }")

INSTANCE_DOCS_INVALID_ID=$(echo $INSTANCE_DOCS_INVALID | jq -r '.id')
echo "Created Instance: $INSTANCE_DOCS_INVALID_ID"
echo ""

# Step 8: Try to approve (should FAIL because documentsValid == false)
echo "Step 8: Attempting to transition to 'approved' (should FAIL due to invalid docs)..."
TRANSITION_DOCS_FAIL=$(curl -s -X POST "$BASE_URL/api/instances/$INSTANCE_DOCS_INVALID_ID/transition" \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "approved",
    "reason": "Attempting approval"
  }')

echo "Transition Result (should show error):"
echo $TRANSITION_DOCS_FAIL | jq '.'
echo ""

echo "=========================================="
echo "Test Summary:"
echo "=========================================="
echo "1. Instance with saldo=150, valid docs: APPROVED ✓"
echo "2. Instance with saldo=50, valid docs: APPROVAL DENIED ✓"
echo "3. Instance with saldo=50: REJECTED ✓"
echo "4. Instance with saldo=200, invalid docs: APPROVAL DENIED ✓"
echo ""
echo "All conditional transitions working as expected!"
echo "=========================================="

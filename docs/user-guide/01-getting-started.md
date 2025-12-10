# Getting Started with SuperCore

Welcome to SuperCore! This guide will help you understand and start using the platform.

## What is SuperCore?

SuperCore is a revolutionary platform that lets you create Core Banking systems without writing code. Instead of spending months programming, you describe what you need in plain language, and SuperCore creates it for you.

### Think of it Like This

**Traditional Way** (6-12 months):
```
Requirement → Developer codes → Database changes → Testing → Deploy
```

**SuperCore Way** (3-7 days):
```
Describe in plain language → Platform creates everything → Start using
```

## Core Concepts (Simple Explanation)

### 1. Object Definitions (The Blueprint)

Think of these as **templates** or **forms**:

- "Customer" is an object definition
- "Bank Account" is another object definition
- "Transaction" is yet another

Each definition describes:
- What information to collect (fields)
- What rules to follow (validations)
- What states it can be in (lifecycle)

**Real-World Example:**
```
A "Customer" object definition might include:
- CPF (required, must be valid)
- Name (required)
- Email (required, must be valid format)
- Phone (optional)
- Status: Pending → Active → Blocked
```

### 2. Instances (The Real Data)

Instances are the **actual data** created from templates:

- João Silva (CPF 123.456.789-01) is an **instance** of "Customer"
- Account 12345-6 is an **instance** of "Bank Account"

### 3. Relationships (The Connections)

Relationships connect instances:

- João Silva **OWNS** Account 12345-6
- Maria Silva **IS_DEPENDENT_OF** João Silva

### 4. The Oracle (Platform Consciousness)

The Oracle is SuperCore's "brain" - it knows:
- Who the company is (LBPAY, CNPJ, licenses)
- What it's allowed to do (PIX, TED, Boleto)
- How to comply with BACEN rules

## Your First Steps

### Step 1: Access SuperCore

```bash
# If using Docker (recommended for beginners)
docker-compose up -d

# Wait 30 seconds for everything to start

# Check if it's running
curl http://localhost:8080/health

# You should see: {"status":"healthy"}
```

### Step 2: Ask the Oracle "Who Am I?"

```bash
curl http://localhost:8080/api/v1/oracle/whoami
```

This shows you the platform's identity. You should see something like:

```json
{
  "message": "Eu sou LBPAY, uma instituição de pagamento...",
  "identity": {
    "corporate_name": "LBPAY",
    "cnpj": "12.345.678/0001-90"
  },
  "licenses": [...]
}
```

### Step 3: Explore Existing Objects

```bash
# See what object types exist
curl http://localhost:8080/api/v1/object-definitions
```

You'll see pre-configured objects like:
- `conta_corrente` (Checking Account)
- `cliente_pf` (Individual Customer)
- `transacao_pix` (PIX Transaction)

### Step 4: Create Your First Instance

Let's create a customer:

```bash
# First, get the customer object definition ID
curl http://localhost:8080/api/v1/object-definitions | jq '.data[] | select(.name == "cliente_pf") | .id'

# Copy the ID (it's a UUID like 550e8400-e29b-41d4-a716-446655440000)

# Now create a customer instance
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "PUT-THE-UUID-HERE",
    "data": {
      "cpf": "12345678901",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "11987654321"
    }
  }'
```

Congratulations! You just created your first customer without writing any code!

## Understanding the Workflow

### For Product Managers

1. **Describe** what you need in plain language
2. **Review** the generated object definition
3. **Approve** and it's ready to use
4. **Start** creating real data (instances)

### Example: Creating a "Loan Application" Object

**Step 1: Use the Natural Language Assistant**

```bash
curl -X POST http://localhost:8080/api/v1/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to create a Loan Application with customer CPF, requested amount, purpose, and approval workflow"
  }'
```

The assistant will ask clarifying questions and generate a complete object definition.

**Step 2: The Platform Creates Everything**
- Database structure (automatic)
- Validation rules (CPF validation, amount limits)
- State machine (Submitted → Under Review → Approved → Disbursed)
- API endpoints (automatic)

**Step 3: Start Using It**

Your team can now:
- Create loan applications via API
- Track their status
- Approve/reject them
- Generate reports

## Common Patterns

### Pattern 1: Customer Onboarding

```
1. Create "cliente_pf" instance (Customer)
   Status: CADASTRO_PENDENTE

2. Upload documents

3. Transition to EM_ANALISE (Under Review)

4. After KYC approval, transition to ATIVO (Active)

5. Create "conta_corrente" instance (Account)

6. Create relationship: Customer OWNS Account
```

### Pattern 2: Transaction Processing

```
1. Create "transacao_pix" instance
   Status: INICIADA (Initiated)

2. Validate amount and limits

3. Call TigerBeetle to lock funds

4. Send to BACEN SPI

5. Transition to LIQUIDADA (Settled)

6. Update account balances
```

## Tips for Non-Technical Users

### What You CAN Do:
- Describe new objects in plain language
- Create instances (customers, accounts, transactions)
- View relationships in the graph
- Ask questions using natural language search
- Generate reports

### What You DON'T Need to Know:
- Programming languages
- Database design
- API development
- Server management

## Next Steps

1. **[Create Object Definitions](02-object-definitions.md)** - Learn to create your own object types
2. **[Manage Instances](03-instances.md)** - Working with real data
3. **[Understanding Relationships](04-relationships.md)** - Connect your data
4. **[State Machines](05-state-machines.md)** - Manage lifecycles
5. **[Using RAG Search](06-rag-search.md)** - Ask questions in plain language

## Need Help?

- **Documentation**: Check other guides in this folder
- **API Reference**: [/Docs/api/README.md](../api/README.md)
- **Examples**: [/Docs/api/examples/](../api/examples/)
- **Issues**: [GitHub Issues](https://github.com/lbpay/supercore/issues)

## Quick Reference Card

### Health Check
```bash
curl http://localhost:8080/health
```

### Oracle Identity
```bash
curl http://localhost:8080/api/v1/oracle/whoami
```

### List Objects
```bash
curl http://localhost:8080/api/v1/object-definitions
```

### Create Instance
```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{"object_definition_id": "uuid", "data": {...}}'
```

### Search
```bash
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "customers with high balance", "limit": 10}'
```

---

**Ready to build your Core Banking system? Let's go! →** [02-object-definitions.md](02-object-definitions.md)

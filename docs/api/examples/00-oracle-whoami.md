# Oracle API Examples - Platform Consciousness

The Oracle represents the platform's self-awareness. It knows its identity, licenses, and capabilities.

## 1. Who Am I? - Platform Consciousness Statement

**Request:**
```bash
curl http://localhost:8080/api/v1/oracle/whoami
```

**Expected Response:**
```json
{
  "consciousness": "Eu sou LBPAY (CNPJ: 12.345.678/0001-90), uma instituição financeira licenciada pelo Banco Central do Brasil",
  "nome_fantasia": "LBPAY",
  "cnpj": "12345678000190"
}
```

**Note:** If the Oracle hasn't been initialized yet, you'll see:
```json
{
  "consciousness": "Eu não sei quem sou. O Oráculo não foi inicializado.",
  "hint": "Execute database/seeds/003_oraculo_seed.sql"
}
```

---

## 2. Get Corporate Identity

**Request:**
```bash
curl http://localhost:8080/api/v1/oracle/identity
```

**Expected Response:**
```json
{
  "cnpj": "12345678000190",
  "razao_social": "LBPAY INSTITUICAO DE PAGAMENTO S.A.",
  "nome_fantasia": "LBPAY",
  "data_fundacao": "2024-01-15",
  "endereco_sede": {
    "logradouro": "Avenida Paulista",
    "numero": "1000",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01310100"
  },
  "contatos": {
    "email_institucional": "contato@lbpay.com.br",
    "telefone_sac": "08007771234",
    "site": "https://www.lbpay.com.br"
  },
  "capital_social": 10000000,
  "cores_institucionais": {
    "primaria": "#0066CC",
    "secundaria": "#FF6600"
  }
}
```

---

## 3. Get Active BACEN Licenses

**Request:**
```bash
curl http://localhost:8080/api/v1/oracle/licenses
```

**Expected Response:**
```json
{
  "licenses": [
    {
      "tipo_autorizacao": "INSTITUICAO_PAGAMENTO",
      "numero_autorizacao": "IP-2024-00123",
      "data_emissao": "2024-01-20",
      "data_validade": "2034-01-20",
      "status": "ATIVA",
      "servicos_autorizados": [
        "EMISSAO_MOEDA_ELETRONICA",
        "CREDENCIAMENTO",
        "ARRANJOS_PAGAMENTO"
      ]
    },
    {
      "tipo_autorizacao": "PARTICIPANTE_PIX_DIRETO",
      "numero_autorizacao": "PIX-2024-00456",
      "data_emissao": "2024-02-01",
      "status": "ATIVA",
      "modalidade": "DIRETO"
    }
  ]
}
```

---

## 4. Get Complete Oracle Status

**Request:**
```bash
curl http://localhost:8080/api/v1/oracle/status
```

**Expected Response:**
```json
{
  "identity": {
    "cnpj": "12345678000190",
    "razao_social": "LBPAY INSTITUICAO DE PAGAMENTO S.A.",
    "nome_fantasia": "LBPAY",
    "...": "... (full identity object)"
  },
  "licenses": [
    {
      "tipo_autorizacao": "INSTITUICAO_PAGAMENTO",
      "status": "ATIVA",
      "...": "..."
    },
    {
      "tipo_autorizacao": "PARTICIPANTE_PIX_DIRETO",
      "status": "ATIVA",
      "...": "..."
    }
  ],
  "integrations": [
    {
      "name": "BACEN SPI",
      "ispb": "12345678",
      "participant_type": "DIRETO",
      "status": "ACTIVE"
    },
    {
      "name": "TigerBeetle Ledger",
      "cluster_id": "tb-prod-001",
      "status": "ACTIVE"
    }
  ],
  "policies": [
    {
      "type": "PLD/FT",
      "status": "ACTIVE",
      "last_review": "2024-12-01"
    }
  ]
}
```

---

## 5. Initialize the Oracle (First Time Setup)

If you receive the "Eu não sei quem sou" message, you need to initialize the Oracle:

```bash
# Navigate to project root
cd /path/to/supercore

# Run the Oracle seed
psql -h localhost -U supercore -d supercore < database/seeds/003_oraculo_seed.sql

# Or using Docker
docker exec -i supercore-postgres psql -U supercore -d supercore < database/seeds/003_oraculo_seed.sql
```

After initialization, try the `/whoami` endpoint again.

---

## Use Cases for the Oracle API

### 1. Frontend Application Branding
```javascript
// Fetch platform identity for UI customization
const response = await fetch('/api/v1/oracle/identity');
const identity = await response.json();

// Use in UI
document.title = identity.nome_fantasia;
document.querySelector('.logo').style.color = identity.cores_institucionais.primaria;
```

### 2. Transaction Validation
```javascript
// Check if platform has required license before processing PIX
const licenses = await fetch('/api/v1/oracle/licenses').then(r => r.json());
const hasPixLicense = licenses.licenses.some(
  l => l.tipo_autorizacao === 'PARTICIPANTE_PIX_DIRETO' && l.status === 'ATIVA'
);

if (!hasPixLicense) {
  throw new Error('Platform não está autorizada para processar PIX');
}
```

### 3. AI Assistant Context
```javascript
// Provide Oracle context to AI assistant
const whoami = await fetch('/api/v1/oracle/whoami').then(r => r.json());

const prompt = `
${whoami.consciousness}

User question: ${userQuestion}
`;
```

---

## Philosophy: Why the Oracle?

The Oracle embodies the concept of **platform consciousness**. Instead of hardcoding company information throughout the codebase, the platform **knows who it is** through the Oracle.

This means:
- ✅ All business logic references a single source of truth
- ✅ Compliance checks are dynamic (based on actual licenses)
- ✅ Multi-tenancy becomes possible (each tenant has their own Oracle)
- ✅ AI assistants can accurately represent the platform's capabilities
- ✅ Regulatory changes are reflected immediately across the entire system

**"Eu sou a LBPAY. Eu sei quem sou, o que faço, e como opero."**

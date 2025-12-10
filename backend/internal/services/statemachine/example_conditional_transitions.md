# Exemplos de Transições Condicionais

Este documento demonstra exemplos práticos de uso do Condition Evaluator no State Machine.

## 1. Aprovação de Conta Bancária

### Object Definition (estados)
```json
{
  "initial": "pending",
  "states": ["pending", "approved", "rejected", "under_review"],
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
    },
    {
      "from": "pending",
      "to": "under_review",
      "condition": "data.saldo >= 100 && data.requiresManualReview == true"
    }
  ]
}
```

### Exemplo de Instance Data
```json
{
  "saldo": 150.50,
  "documentsValid": true,
  "requiresManualReview": false
}
```

### Resultado
- Transição para "approved" será PERMITIDA (saldo >= 100 && documentos válidos)
- Transição para "rejected" será NEGADA (condição não atendida)
- Transição para "under_review" será NEGADA (requiresManualReview = false)

---

## 2. Aprovação de Crédito

### Object Definition (estados)
```json
{
  "initial": "analysis",
  "states": ["analysis", "pre_approved", "approved", "rejected"],
  "transitions": [
    {
      "from": "analysis",
      "to": "pre_approved",
      "condition": "data.creditScore >= 600 && data.creditScore < 750"
    },
    {
      "from": "analysis",
      "to": "approved",
      "condition": "data.creditScore >= 750 && data.income >= 5000"
    },
    {
      "from": "analysis",
      "to": "rejected",
      "condition": "data.creditScore < 600"
    },
    {
      "from": "pre_approved",
      "to": "approved",
      "condition": "data.additionalDocumentsProvided == true && data.income >= 3000"
    }
  ]
}
```

### Exemplo de Instance Data
```json
{
  "creditScore": 780,
  "income": 6500.00,
  "additionalDocumentsProvided": false
}
```

### Resultado
- Transição de "analysis" para "approved" será PERMITIDA (score >= 750 && income >= 5000)

---

## 3. Processamento de Pagamento com Limites

### Object Definition (estados)
```json
{
  "initial": "pending",
  "states": ["pending", "processing", "approved", "requires_authorization", "rejected"],
  "transitions": [
    {
      "from": "pending",
      "to": "processing",
      "condition": "data.amount > 0 && data.paymentMethod != ''"
    },
    {
      "from": "processing",
      "to": "approved",
      "condition": "data.amount <= 1000 && data.fraudScore < 0.3"
    },
    {
      "from": "processing",
      "to": "requires_authorization",
      "condition": "data.amount > 1000 && data.amount <= 10000"
    },
    {
      "from": "processing",
      "to": "rejected",
      "condition": "data.fraudScore >= 0.7 || data.amount > 50000"
    },
    {
      "from": "requires_authorization",
      "to": "approved",
      "condition": "data.managerApproved == true && data.amount <= 10000"
    }
  ]
}
```

### Exemplo de Instance Data
```json
{
  "amount": 5000.00,
  "paymentMethod": "credit_card",
  "fraudScore": 0.15,
  "managerApproved": false
}
```

### Resultado
- Transição de "pending" para "processing" será PERMITIDA
- Transição de "processing" para "requires_authorization" será PERMITIDA (amount > 1000)
- Transição de "requires_authorization" para "approved" será NEGADA (managerApproved = false)

---

## 4. KYC (Know Your Customer) com VIP Fast Track

### Object Definition (estados)
```json
{
  "initial": "new",
  "states": ["new", "basic_verification", "full_verification", "verified", "rejected"],
  "transitions": [
    {
      "from": "new",
      "to": "verified",
      "condition": "data.vip == true && data.hasExistingAccount == true"
    },
    {
      "from": "new",
      "to": "basic_verification",
      "condition": "data.vip == false && data.requestedAmount <= 5000"
    },
    {
      "from": "new",
      "to": "full_verification",
      "condition": "data.vip == false && data.requestedAmount > 5000"
    },
    {
      "from": "basic_verification",
      "to": "verified",
      "condition": "data.idVerified == true && data.phoneVerified == true"
    },
    {
      "from": "full_verification",
      "to": "verified",
      "condition": "data.idVerified == true && data.phoneVerified == true && data.addressVerified == true && data.incomeProofProvided == true"
    }
  ]
}
```

### Exemplo de Instance Data (Cliente VIP)
```json
{
  "vip": true,
  "hasExistingAccount": true,
  "requestedAmount": 10000,
  "idVerified": false,
  "phoneVerified": false,
  "addressVerified": false,
  "incomeProofProvided": false
}
```

### Resultado
- Transição de "new" para "verified" será PERMITIDA (VIP com conta existente = fast track)

---

## 5. Workflow de Aprovação Multi-Nível

### Object Definition (estados)
```json
{
  "initial": "submitted",
  "states": ["submitted", "level1_approved", "level2_approved", "final_approved", "rejected"],
  "transitions": [
    {
      "from": "submitted",
      "to": "level1_approved",
      "condition": "data.amount <= 10000 || (data.urgency == 'high' && data.requestedBy.seniority >= 2)"
    },
    {
      "from": "submitted",
      "to": "rejected",
      "condition": "data.amount > 100000 && data.justification == ''"
    },
    {
      "from": "level1_approved",
      "to": "final_approved",
      "condition": "data.amount <= 5000"
    },
    {
      "from": "level1_approved",
      "to": "level2_approved",
      "condition": "data.amount > 5000 && data.amount <= 50000"
    },
    {
      "from": "level2_approved",
      "to": "final_approved",
      "condition": "data.cfoApproved == true || (data.amount <= 20000 && data.budgetAvailable == true)"
    }
  ]
}
```

### Exemplo de Instance Data
```json
{
  "amount": 15000,
  "urgency": "normal",
  "requestedBy": {
    "seniority": 3
  },
  "justification": "Equipment upgrade",
  "cfoApproved": false,
  "budgetAvailable": true
}
```

### Resultado
- Transição de "submitted" para "level1_approved" será PERMITIDA (amount <= 10000 OU seniority >= 2)
- Transição de "level1_approved" para "level2_approved" será PERMITIDA (amount > 5000 && amount <= 50000)
- Transição de "level2_approved" para "final_approved" será PERMITIDA (amount <= 20000 && budgetAvailable == true)

---

## CEL Expression Reference

### Operadores Suportados

- **Comparação**: `==`, `!=`, `<`, `<=`, `>`, `>=`
- **Lógicos**: `&&` (AND), `||` (OR), `!` (NOT)
- **Aritméticos**: `+`, `-`, `*`, `/`, `%`
- **Acesso a objetos**: `data.field`, `data.nested.field`

### Variáveis Disponíveis

- `data` - Os dados da instância (JSON object)
- `current_state` - Estado atual da instância (string)
- `version` - Versão da instância (integer)

### Exemplos de Expressões

```javascript
// Comparação simples
data.saldo >= 100

// Condição composta com AND
data.saldo >= 100 && data.score > 700

// Condição composta com OR
data.vip == true || data.saldo >= 10000

// Acesso a objetos aninhados
data.account.balance >= 100 && data.account.active == true

// Comparação de strings
data.status == 'approved' && data.type == 'premium'

// Condições complexas
(data.amount <= 1000) || (data.amount <= 10000 && data.managerApproved == true)

// Uso de variáveis de contexto
current_state == 'pending' && version > 1 && data.ready == true
```

---

## Como Testar

1. **Via API** - Faça uma requisição POST para `/instances/{id}/transition` com:
```json
{
  "to_state": "approved",
  "reason": "Balance meets minimum requirement"
}
```

2. **Resposta de Sucesso** (condição atendida):
```json
{
  "id": "uuid",
  "current_state": "approved",
  "data": {...},
  "state_history": [...]
}
```

3. **Resposta de Erro** (condição não atendida):
```json
{
  "error": "transition condition not met: data.saldo >= 100"
}
```

---

## Melhores Práticas

1. **Mantenha condições simples** - Condições muito complexas podem ser difíceis de debugar
2. **Valide tipos** - Certifique-se de que os campos no `data` existem e têm o tipo correto
3. **Use parênteses** - Para clareza em condições complexas: `(A && B) || (C && D)`
4. **Documente condições** - Mantenha documentação explicando o significado de cada condição
5. **Teste edge cases** - Teste valores limites (ex: saldo = 100 quando condição é >= 100)
6. **Evite efeitos colaterais** - Condições devem apenas avaliar, não modificar dados

---

## Debugging

Se uma transição falhar devido a uma condição:

1. Verifique o erro retornado - ele mostrará qual condição falhou
2. Inspecione os dados da instância - GET `/instances/{id}`
3. Teste a expressão CEL isoladamente usando os testes unitários
4. Verifique tipos de dados - números podem estar como strings em JSON

Exemplo de erro:
```
failed to evaluate transition condition: condition must evaluate to boolean, got: int
```

Isso indica que a expressão retornou um número em vez de um booleano. Corrija para:
```javascript
// Errado: data.saldo >= 100 ? 1 : 0
// Correto: data.saldo >= 100
```

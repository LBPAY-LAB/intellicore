# State Machine Service - Condition Evaluator

## 📚 Documentation

- **[CONDITION_EVALUATOR_GUIDE.md](CONDITION_EVALUATOR_GUIDE.md)** - Complete user guide with examples and best practices
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Implementation details and technical documentation
- **[examples_test.go](examples_test.go)** - Runnable code examples

## Quick Links

- [Basic Usage](#exemplos-de-uso)
- [Supported Operators](#expressões-cel-suportadas)
- [Real-World Examples](CONDITION_EVALUATOR_GUIDE.md#real-world-scenarios)
- [Testing Guide](#testes)

## Visão Geral

O State Machine Service foi estendido com um **Condition Evaluator** que permite avaliar expressões CEL (Common Expression Language) antes de permitir transições de estado. Isso possibilita criar workflows dinâmicos e inteligentes baseados em regras de negócio.

**Key Features:**
- ✅ Type-safe conditional logic using Google CEL
- ✅ Support for complex business rules
- ✅ Real-time validation before state transitions
- ✅ Backward compatible with existing FSM code
- ✅ Comprehensive test coverage (80%+)
- ✅ Production-ready with proper error handling

## Arquitetura

### Componentes Principais

1. **StateMachine** (`statemachine.go`)
   - `Transition()` - Executa transições de estado com validação de condições
   - `evaluateCondition()` - Avalia expressões CEL contra dados da instância
   - `GetAllowedTransitions()` - Retorna transições permitidas do estado atual

2. **FSMConfig** - Configuração da máquina de estados
   - `Initial` - Estado inicial
   - `States` - Lista de estados válidos
   - `Transitions` - Lista de transições com condições opcionais

3. **Transition** - Definição de uma transição
   - `From` - Estado de origem
   - `To` - Estado de destino
   - `Condition` - Expressão CEL opcional (nullable)

## Como Funciona

### Fluxo de Execução

```
1. Cliente solicita transição via API
2. StateMachine.Transition() é chamado
3. Busca instância e configuração FSM do banco
4. Valida se estado de destino existe
5. Procura transição válida (From -> To)
6. SE transição tem condição:
   6.1. Chama evaluateCondition()
   6.2. Parseia dados da instância para map
   6.3. Compila expressão CEL
   6.4. Avalia expressão com contexto da instância
   6.5. Verifica se resultado é booleano true
7. SE condição passou (ou não existe):
   7.1. Atualiza current_state
   7.2. Adiciona entrada no state_history
   7.3. Incrementa version
   7.4. Retorna instância atualizada
8. SENÃO:
   8.1. Retorna erro "condition not met"
```

### Método evaluateCondition()

```go
func (sm *StateMachine) evaluateCondition(condition string, instance *models.Instance) (bool, error)
```

**Entrada:**
- `condition` - String com expressão CEL (ex: "data.saldo >= 100")
- `instance` - Ponteiro para instância com dados a avaliar

**Retorno:**
- `bool` - true se condição atendida, false caso contrário
- `error` - Erro de compilação/avaliação ou nil

**Variáveis Disponíveis na Expressão:**
- `data` - Dados da instância (json.RawMessage convertido para map)
- `current_state` - Estado atual da instância (string)
- `version` - Versão da instância (int)

**Exemplo de Uso:**
```go
instance := &models.Instance{
    Data: json.RawMessage(`{"saldo": 150, "approved": true}`),
    CurrentState: "pending",
    Version: 1,
}

result, err := sm.evaluateCondition("data.saldo >= 100 && data.approved == true", instance)
// result = true, err = nil
```

## Expressões CEL Suportadas

### Operadores

| Tipo | Operadores | Exemplo |
|------|-----------|---------|
| Comparação | `==`, `!=`, `<`, `<=`, `>`, `>=` | `data.age >= 18` |
| Lógicos | `&&`, `||`, `!` | `data.active && !data.blocked` |
| Aritméticos | `+`, `-`, `*`, `/`, `%` | `data.total > data.limit * 0.8` |
| Strings | `==`, `!=`, `+` | `data.status == 'approved'` |
| Acesso | `.`, `[]` | `data.account.balance`, `data['field-name']` |

### Exemplos de Expressões

#### Comparações Simples
```javascript
data.saldo >= 100
data.age >= 18
data.status == 'active'
data.approved == true
```

#### Condições Compostas
```javascript
// AND
data.saldo >= 100 && data.documentsValid == true

// OR
data.vip == true || data.saldo >= 10000

// NOT
!data.blocked && data.verified == true

// Múltiplas condições
(data.amount <= 1000) || (data.amount <= 10000 && data.managerApproved == true)
```

#### Acesso a Objetos Aninhados
```javascript
data.account.balance >= 100
data.user.profile.verified == true
data.payment.method == 'credit_card' && data.payment.amount > 0
```

#### Usando Variáveis de Contexto
```javascript
// Estado atual
current_state == 'pending' && data.ready == true

// Versão
version > 0 && data.validated == true

// Combinação
current_state == 'pending' && version > 1 && data.retry == true
```

## Exemplos de Uso

### Exemplo 1: Aprovação de Conta Bancária

**Object Definition (campo `states`):**
```json
{
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
      "condition": null
    }
  ]
}
```

**Instance Data:**
```json
{
  "saldo": 150.50,
  "documentsValid": true,
  "accountHolder": "John Doe"
}
```

**Request:**
```bash
POST /api/instances/{id}/transition
{
  "to_state": "approved",
  "reason": "Account meets requirements"
}
```

**Resultado:** ✓ Sucesso (saldo >= 100 && documentsValid == true)

---

### Exemplo 2: Aprovação de Crédito Multi-Nível

**Object Definition:**
```json
{
  "initial": "analysis",
  "states": ["analysis", "approved", "rejected"],
  "transitions": [
    {
      "from": "analysis",
      "to": "approved",
      "condition": "data.creditScore >= 750 && data.income >= 5000 && data.debtRatio < 0.4"
    },
    {
      "from": "analysis",
      "to": "rejected",
      "condition": "data.creditScore < 600 || data.debtRatio >= 0.6"
    }
  ]
}
```

**Instance Data:**
```json
{
  "creditScore": 780,
  "income": 6500.00,
  "debtRatio": 0.25,
  "applicantName": "Jane Smith"
}
```

**Resultado:** ✓ Transição para "approved" permitida

---

### Exemplo 3: Processamento de Pagamento com Limites

**Object Definition:**
```json
{
  "initial": "pending",
  "states": ["pending", "approved", "requires_authorization"],
  "transitions": [
    {
      "from": "pending",
      "to": "approved",
      "condition": "data.amount <= 1000 && data.fraudScore < 0.3"
    },
    {
      "from": "pending",
      "to": "requires_authorization",
      "condition": "data.amount > 1000 && data.amount <= 10000"
    }
  ]
}
```

## Testes

### Testes Unitários

Os testes estão em `statemachine_test.go` e cobrem:

1. **Comparações Numéricas**
   - Maior que, menor que, igual
   - Valores limites

2. **Comparações de Strings**
   - Igualdade, diferença
   - Case-sensitive

3. **Condições Compostas**
   - AND, OR, NOT
   - Múltiplas condições

4. **Acesso a Objetos Aninhados**
   - Notação de ponto
   - Objetos profundos

5. **Variáveis de Contexto**
   - current_state
   - version

6. **Tratamento de Erros**
   - Sintaxe inválida
   - Tipo de retorno inválido
   - Campos inexistentes

**Executar testes:**
```bash
cd backend/internal/services/statemachine
go test -v
```

**Executar testes com coverage:**
```bash
go test -v -cover
```

### Teste de Integração

Use o script `integration_test_example.sh` para testar o fluxo completo:

```bash
chmod +x integration_test_example.sh
./integration_test_example.sh
```

Este script:
1. Cria um Object Definition com transições condicionais
2. Cria instâncias com diferentes dados
3. Tenta transições que devem passar
4. Tenta transições que devem falhar
5. Valida comportamento esperado

## Tratamento de Erros

### Erros Possíveis

1. **Sintaxe CEL Inválida**
   ```
   failed to compile condition: Syntax error: token recognition error at: '='
   ```

2. **Tipo de Retorno Inválido**
   ```
   condition must evaluate to boolean, got: int
   ```

3. **Condição Não Atendida**
   ```
   transition condition not met: data.saldo >= 100
   ```

4. **Erro ao Parsear Dados**
   ```
   failed to parse instance data: invalid character '}' looking for beginning of value
   ```

5. **Campo Inexistente**
   ```
   failed to evaluate condition: no such key: balance
   ```

### Como Debugar

1. **Verifique o erro retornado pela API**
   - O erro indica qual condição falhou

2. **Inspecione os dados da instância**
   ```bash
   GET /api/instances/{id}
   ```

3. **Valide tipos de dados**
   - Números podem estar como strings em JSON
   - Booleanos devem ser true/false, não "true"/"false"

4. **Teste expressão isoladamente**
   - Use os testes unitários em `statemachine_test.go`
   - Adicione casos de teste específicos

5. **Verifique logs do servidor**
   - Erros de compilação CEL são logados

## Melhores Práticas

### 1. Design de Condições

✅ **BOM:**
```javascript
data.saldo >= 100 && data.approved == true
```

❌ **RUIM:**
```javascript
((data.saldo * 1.1) >= (data.minimum * 0.9)) && (data.checks[0].status == 'OK' || data.checks[1].status == 'OK') && ...
```

**Razão:** Condições simples são mais fáceis de entender, testar e debugar.

### 2. Validação de Campos

✅ **BOM:**
```javascript
// Certifique-se de que o campo existe no schema
data.amount > 0 && data.currency != ''
```

❌ **RUIM:**
```javascript
// Campo pode não existir, causando erro
data.optionalField > 100
```

**Razão:** Campos que podem não existir devem ser validados no schema ou ter valores default.

### 3. Documentação

✅ **BOM:**
```json
{
  "from": "pending",
  "to": "approved",
  "condition": "data.saldo >= 100 && data.documentsValid == true",
  "description": "Approve account if balance >= 100 and documents are valid"
}
```

**Razão:** Documentar o significado de cada condição facilita manutenção.

### 4. Testes de Edge Cases

Sempre teste:
- Valores exatos nos limites (ex: saldo = 100 quando condição é >= 100)
- Valores nulos ou vazios
- Tipos incorretos
- Campos faltantes

### 5. Performance

- Evite condições muito complexas (podem ser lentas)
- CEL é otimizado, mas condições excessivamente aninhadas podem degradar performance
- Se necessário, considere dividir em múltiplos estados intermediários

## Limitações

1. **CEL não permite efeitos colaterais**
   - Condições apenas avaliam, não modificam dados
   - Use validators ou hooks para modificações

2. **Sem acesso ao banco de dados**
   - Condições não podem fazer queries
   - Dados devem estar em `instance.Data`

3. **Sem funções customizadas**
   - CEL suporta funções builtin apenas
   - Para lógica complexa, use validators

4. **Type safety limitado**
   - JSON é dinamicamente tipado
   - Validação de tipos em runtime

## Próximos Passos / Melhorias Futuras

1. **Cache de Programas CEL**
   - Compilar expressões uma vez e reutilizar
   - Reduz overhead em transições frequentes

2. **Funções Customizadas**
   - Adicionar funções CEL específicas do domínio
   - Ex: `isBusinessDay()`, `calculateAge()`

3. **Validação no Deployment**
   - Validar sintaxe CEL ao criar ObjectDefinition
   - Prevenir erros em runtime

4. **Métricas e Observabilidade**
   - Rastrear quais condições falham com mais frequência
   - Identificar gargalos de performance

5. **Editor Visual**
   - Interface para construir condições
   - Autocomplete de campos disponíveis

## Referências

- [CEL Specification](https://github.com/google/cel-spec)
- [CEL Go Library](https://github.com/google/cel-go)
- [CEL Language Definition](https://github.com/google/cel-spec/blob/master/doc/langdef.md)

## Suporte

Para dúvidas ou problemas:
1. Verifique exemplos em `example_conditional_transitions.md`
2. Execute testes unitários para validar comportamento
3. Use script de integração para testar end-to-end
4. Consulte logs do servidor para detalhes de erros

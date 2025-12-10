# Think Harder: Fundação para Objetos de Core Banking

## 1. O Desafio Central

Precisamos construir uma fundação que permita a **pessoas de negócio** (não desenvolvedores) criar objetos complexos como `Cliente`, `Conta`, `Transação`, `Pix`, `TED` sem escrever código, mas que seja **robusta o suficiente** para suportar regras de negócio críticas de um Core Banking (validações BACEN, anti-fraude, compliance).

### 1.1. Tensão Fundamental

```
┌─────────────────────────────────────────┐
│  SIMPLICIDADE (Usuário de Negócio)      │
│  "Quero criar um 'Cliente' em 5 min"    │
└─────────────────────────────────────────┘
              ⬇️  vs  ⬆️
┌─────────────────────────────────────────┐
│  ROBUSTEZ (Requisitos BACEN)            │
│  "CPF precisa validação + grafo AML"    │
└─────────────────────────────────────────┘
```

**Solução**: Camadas de Abstração Progressivas

---

## 2. Arquitetura em 3 Camadas de Complexidade

### Camada 1: Templates Pré-Configurados (80% dos Casos)
**Usuário**: Analista de Produto
**Interface**: Wizard visual com checkboxes

**Exemplo - Criando "Cliente PF":**
```
┌──────────────────────────────────────────────┐
│ 📋 Criar Novo Objeto                         │
│                                              │
│ Nome do Objeto: [Cliente Pessoa Física____] │
│                                              │
│ ✅ Usar template: Cliente Regulado BACEN    │
│                                              │
│ Campos obrigatórios (já inclusos):          │
│ ✓ CPF (com validação dígitos)               │
│ ✓ Nome Completo                              │
│ ✓ Data Nascimento                            │
│ ✓ Endereço Completo                          │
│                                              │
│ Adicionar campos opcionais:                  │
│ ☐ Renda Mensal (número)                     │
│ ☐ Profissão (texto)                          │
│ ☐ Estado Civil (seleção)                    │
│                                              │
│ Estados do ciclo de vida:                    │
│ ✓ CADASTRO_PENDENTE → ATIVO → BLOQUEADO     │
│   → INATIVO (padrão BACEN)                   │
│                                              │
│ [Cancelar]  [< Voltar]  [Próximo: Regras >] │
└──────────────────────────────────────────────┘
```

**Backend (object_definitions pré-cadastradas):**
```sql
-- Seed inicial do sistema
INSERT INTO object_definitions (name, schema, rules, is_system) VALUES
('template_cliente_pf', '{
  "type": "object",
  "properties": {
    "cpf": {"type": "string", "pattern": "^\\d{11}$"},
    "nome_completo": {"type": "string", "minLength": 3},
    "data_nascimento": {"type": "string", "format": "date"},
    "endereco": {
      "type": "object",
      "properties": {
        "cep": {"type": "string", "pattern": "^\\d{8}$"},
        "logradouro": {"type": "string"},
        "numero": {"type": "string"},
        "cidade": {"type": "string"},
        "uf": {"type": "string", "enum": ["SP","RJ","MG",...]}
      }
    }
  },
  "required": ["cpf", "nome_completo", "data_nascimento"]
}', '[
  {"rule_type": "validation", "validator": "cpf_digits_validation"},
  {"rule_type": "validation", "validator": "cpf_blacklist_check"},
  {"rule_type": "enrichment", "action": "fetch_receita_federal_data"}
]', true);
```

**UX Key**: O usuário **não vê JSON**. Ele vê:
- "Campo CPF (obrigatório, validado automaticamente)"
- Checkbox: "Consultar dados da Receita Federal ao criar"

---

### Camada 2: Editor Visual Avançado (15% dos Casos)
**Usuário**: Gerente de Produto com conhecimento técnico
**Interface**: Drag-and-drop com preview em tempo real

**Exemplo - Criando "Conta Investimento":**

```
┌────────────────────────────────────────────────────────┐
│ 🧩 Editor de Objeto: Conta Investimento                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Campos:                      │  Preview:             │
│  ┌──────────────────┐         │  ┌─────────────────┐  │
│  │ CPF Titular      │─────────┼──│ CPF: _________  │  │
│  │ [string] [CPF]   │         │  │ Tipo: _________ │  │
│  │ ✓ Obrigatório    │         │  │ Saldo: R$ 0,00  │  │
│  └──────────────────┘         │  └─────────────────┘  │
│  ┌──────────────────┐         │                       │
│  │ Tipo Investimento│         │  Relacionamentos:     │
│  │ [enum]           │         │  ┌─────────────────┐  │
│  │ ☐ CDB            │         │  │ Cliente ──┐     │  │
│  │ ☐ LCI            │         │  │           │     │  │
│  │ ☐ LCA            │         │  │    TITULAR│     │  │
│  └──────────────────┘         │  │           v     │  │
│  ┌──────────────────┐         │  │      Conta Inv. │  │
│  │ + Adicionar Campo│         │  └─────────────────┘  │
│  └──────────────────┘         │                       │
│                               │                       │
│  Regras de Negócio:           │  Estados:             │
│  ☑ Valor mínimo: R$ 1.000     │  ○ PENDENTE_ASSINATURA│
│  ☑ Alertar se > R$ 100k       │  ○ ATIVA              │
│  ☐ Adicionar regra...         │  ○ LIQUIDADA          │
└────────────────────────────────────────────────────────┘
```

**Componente React Crítico - Field Configurator:**
```tsx
function FieldConfigurator({ field, onChange }: FieldConfiguratorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      {/* Nome do Campo */}
      <Input
        label="Nome do Campo"
        value={field.name}
        onChange={(name) => onChange({ ...field, name })}
        placeholder="Ex: valor_aplicacao"
      />

      {/* Tipo do Campo (com ícones visuais) */}
      <RadioGroup label="Tipo de Dados">
        <Radio value="string" icon={<Type />}>Texto</Radio>
        <Radio value="number" icon={<Hash />}>Número</Radio>
        <Radio value="boolean" icon={<ToggleLeft />}>Sim/Não</Radio>
        <Radio value="date" icon={<Calendar />}>Data</Radio>
        <Radio value="object" icon={<Box />}>Objeto Aninhado</Radio>
      </RadioGroup>

      {/* Validações Rápidas */}
      <div className="mt-4">
        <Checkbox
          checked={field.required}
          onChange={(required) => onChange({ ...field, required })}
        >
          ✓ Campo Obrigatório
        </Checkbox>

        {field.type === 'string' && (
          <Select
            label="Validação Especial"
            options={[
              { value: 'cpf', label: '🇧🇷 CPF (validação completa)' },
              { value: 'cnpj', label: '🏢 CNPJ' },
              { value: 'email', label: '📧 E-mail' },
              { value: 'phone', label: '📱 Telefone BR' },
              { value: 'cep', label: '📮 CEP' },
            ]}
          />
        )}

        {field.type === 'number' && (
          <>
            <Input
              label="Valor Mínimo"
              type="number"
              value={field.minimum}
              prefix="R$"
            />
            <Input
              label="Valor Máximo"
              type="number"
              value={field.maximum}
              prefix="R$"
            />
          </>
        )}
      </div>

      {/* Configurações Avançadas (colapsável) */}
      <Collapsible
        trigger="⚙️ Configurações Avançadas"
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
      >
        <MonacoEditor
          language="json"
          value={JSON.stringify(field.schema, null, 2)}
          onChange={(schema) => onChange({ ...field, schema: JSON.parse(schema) })}
          height="200px"
        />
      </Collapsible>
    </div>
  );
}
```

---

### Camada 3: Modo JSON Expert (5% dos Casos)
**Usuário**: Desenvolvedor ou Arquiteto
**Interface**: Editor Monaco com autocomplete + validação

```typescript
// Autocomplete inteligente baseado em JSON Schema Draft 7
const schemaAutocomplete: Monaco.languages.CompletionItemProvider = {
  provideCompletionItems: (model, position) => {
    const wordInfo = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: wordInfo.startColumn,
      endColumn: wordInfo.endColumn,
    };

    return {
      suggestions: [
        {
          label: 'cpf_validation',
          kind: Monaco.languages.CompletionItemKind.Snippet,
          insertText: '"pattern": "^\\\\d{11}$", "errorMessage": "CPF deve ter 11 dígitos"',
          detail: 'Validação de CPF (11 dígitos)',
          documentation: 'Adiciona validação regex para CPF brasileiro',
          range,
        },
        {
          label: 'currency_brl',
          kind: Monaco.languages.CompletionItemKind.Snippet,
          insertText: '"type": "number", "minimum": 0, "multipleOf": 0.01',
          detail: 'Moeda BRL (centavos)',
          range,
        },
        // ... mais snippets contextuais
      ],
    };
  },
};
```

---

## 3. Gestão de Relacionamentos: O Cérebro do Sistema

### 3.1. Problema: Relacionamentos ≠ Foreign Keys

Em SQL tradicional:
```sql
-- Abordagem tradicional (ERRADA para nosso caso)
CREATE TABLE contas (
  cliente_id UUID REFERENCES clientes(id)  -- ❌ Hardcoded!
);
```

Em nosso sistema (CORRETO):
```sql
-- Relacionamento como Cidadão de Primeira Classe
INSERT INTO relationships (relationship_type, source_instance_id, target_instance_id, properties)
VALUES (
  'TITULAR_DE',
  'uuid-cliente-maria',
  'uuid-conta-corrente-123',
  '{"porcentagem_propriedade": 100, "desde": "2024-01-15"}'
);
```

### 3.2. UX do Editor de Relacionamentos

**Interface Visual - Modo Conexão:**

```
┌────────────────────────────────────────────────────────┐
│ 🔗 Definir Relacionamentos para "Conta Corrente"      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Relacionamentos Permitidos:                          │
│                                                        │
│  ┌────────────────────────────────────────┐           │
│  │ TITULAR_DE                              │           │
│  │                                        │           │
│  │ Origem: [Cliente PF ▼]                 │           │
│  │ Destino: [Conta Corrente] (este)      │           │
│  │                                        │           │
│  │ Cardinalidade:                         │           │
│  │ ● Um Cliente → Muitas Contas          │           │
│  │ ○ Muitos Clientes → Uma Conta (joint) │           │
│  │                                        │           │
│  │ Campos do Relacionamento:              │           │
│  │ ☑ Porcentagem Propriedade (%)          │           │
│  │ ☑ Data Início                          │           │
│  │ ☐ Data Fim                             │           │
│  │                                        │           │
│  │ Regras:                                │           │
│  │ ☑ Obrigatório (toda Conta tem titular)│           │
│  │ ☑ Validar: soma % = 100 (joint acc)   │           │
│  └────────────────────────────────────────┘           │
│                                                        │
│  [+ Adicionar Outro Relacionamento]                   │
│                                                        │
│  Visualização Grafo:                                  │
│  ┌────────────────────────────────────────┐           │
│  │    (Cliente PF)                        │           │
│  │         │                              │           │
│  │         │ TITULAR_DE                   │           │
│  │         ↓                              │           │
│  │   [Conta Corrente]                     │           │
│  │         │                              │           │
│  │         │ MOVIMENTA_POR                │           │
│  │         ↓                              │           │
│  │   (Transação)                          │           │
│  └────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

### 3.3. Backend - Validação de Relacionamentos

```go
// RelationshipValidator valida integridade do grafo
type RelationshipValidator struct {
    db *sql.DB
}

// ValidateRelationship verifica regras antes de criar edge
func (rv *RelationshipValidator) ValidateRelationship(ctx context.Context, rel Relationship) error {
    // 1. Verifica se os tipos de objetos são compatíveis
    sourceObj, err := rv.getObjectDefinition(rel.SourceInstanceID)
    if err != nil {
        return err
    }
    targetObj, err := rv.getObjectDefinition(rel.TargetInstanceID)
    if err != nil {
        return err
    }

    // 2. Verifica se o relationship_type está permitido na definição
    allowedRels := sourceObj.Relationships // JSONB array
    found := false
    var relConfig RelationshipConfig

    for _, allowed := range allowedRels {
        if allowed.Type == rel.RelationshipType && allowed.TargetObjectName == targetObj.Name {
            found = true
            relConfig = allowed
            break
        }
    }

    if !found {
        return fmt.Errorf("relacionamento '%s' não permitido entre %s e %s",
            rel.RelationshipType, sourceObj.Name, targetObj.Name)
    }

    // 3. Valida cardinalidade (ONE_TO_MANY, MANY_TO_MANY, etc.)
    if relConfig.Cardinality == "ONE_TO_MANY" {
        // Verifica se source já tem esse relationship
        existing, err := rv.countRelationships(rel.SourceInstanceID, rel.RelationshipType)
        if err != nil {
            return err
        }
        if existing > 0 {
            return errors.New("violação de cardinalidade: ONE_TO_MANY permite apenas 1 relacionamento")
        }
    }

    // 4. Valida regras customizadas (ex: soma de % = 100 para titularidade)
    if relConfig.ValidationRules != nil {
        for _, rule := range relConfig.ValidationRules {
            if err := rv.executeRule(rule, rel); err != nil {
                return fmt.Errorf("regra '%s' falhou: %w", rule.Name, err)
            }
        }
    }

    // 5. Detecta ciclos (se configurado como proibido)
    if relConfig.PreventCycles {
        if rv.wouldCreateCycle(rel) {
            return errors.New("relacionamento criaria ciclo no grafo, o que é proibido para este tipo")
        }
    }

    return nil
}

// wouldCreateCycle usa BFS para detectar ciclos
func (rv *RelationshipValidator) wouldCreateCycle(rel Relationship) bool {
    // Implementação de busca em grafo para detectar
    // se adicionar esta aresta criaria um ciclo
    // (usa NebulaGraph ou algoritmo in-memory para grafos pequenos)
    visited := make(map[string]bool)
    queue := []string{rel.TargetInstanceID}

    for len(queue) > 0 {
        current := queue[0]
        queue = queue[1:]

        if current == rel.SourceInstanceID {
            return true // Ciclo detectado!
        }

        if visited[current] {
            continue
        }
        visited[current] = true

        // Busca próximos nós conectados
        neighbors := rv.getNeighbors(current, rel.RelationshipType)
        queue = append(queue, neighbors...)
    }

    return false
}
```

---

## 4. Dynamic Form Rendering: O Motor de UX

### 4.1. Problema: Formulários que se Adaptam em Tempo Real

**Cenário**: Usuário está criando uma instância de "Conta Investimento".

- Se ele selecionar `tipo_investimento = "CDB"`, aparecem campos específicos: `taxa_cdi`, `prazo_meses`.
- Se selecionar `tipo_investimento = "Tesouro Direto"`, aparecem: `codigo_titulo`, `vencimento`.

**Solução**: JSON Schema com `dependencies` + UI Hints

```json
{
  "type": "object",
  "properties": {
    "tipo_investimento": {
      "type": "string",
      "enum": ["CDB", "LCI", "LCA", "Tesouro Direto"]
    },
    "valor_aplicacao": {
      "type": "number",
      "minimum": 1000
    }
  },
  "dependencies": {
    "tipo_investimento": {
      "oneOf": [
        {
          "properties": {
            "tipo_investimento": { "const": "CDB" },
            "taxa_cdi": { "type": "number", "minimum": 0, "maximum": 200 },
            "prazo_meses": { "type": "integer", "minimum": 1 }
          },
          "required": ["taxa_cdi", "prazo_meses"]
        },
        {
          "properties": {
            "tipo_investimento": { "const": "Tesouro Direto" },
            "codigo_titulo": { "type": "string", "pattern": "^[A-Z]{3}\\d{6}$" },
            "vencimento": { "type": "string", "format": "date" }
          },
          "required": ["codigo_titulo", "vencimento"]
        }
      ]
    }
  }
}
```

**React Component - Smart Form:**

```tsx
function SmartDynamicForm({ schema, uiHints, value, onChange }: SmartFormProps) {
  // Resolve schema com dependencies em tempo real
  const resolvedSchema = useMemo(() => {
    return resolveSchemaWithDependencies(schema, value);
  }, [schema, value]);

  // Detecta campos condicionais que aparecem/desaparecem
  const visibleFields = useMemo(() => {
    return Object.keys(resolvedSchema.properties || {}).filter(fieldName => {
      // Lógica de visibilidade baseada em 'ui_hints.conditionalVisibility'
      const condition = uiHints?.conditionalVisibility?.[fieldName];
      if (!condition) return true;

      // Avalia condição: "tipo_investimento == 'CDB'"
      return evaluateCondition(condition, value);
    });
  }, [resolvedSchema, uiHints, value]);

  return (
    <form className="space-y-6">
      <AnimatePresence mode="wait">
        {visibleFields.map(fieldName => {
          const fieldSchema = resolvedSchema.properties[fieldName];
          const widget = uiHints?.widgets?.[fieldName] || inferWidget(fieldSchema);

          return (
            <motion.div
              key={fieldName}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FormField
                label={fieldSchema.title || startCase(fieldName)}
                required={resolvedSchema.required?.includes(fieldName)}
                helpText={fieldSchema.description}
              >
                <WidgetRenderer
                  widget={widget}
                  schema={fieldSchema}
                  value={value[fieldName]}
                  onChange={(newValue) => {
                    onChange({ ...value, [fieldName]: newValue });
                  }}
                />
              </FormField>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </form>
  );
}

// Widget Renderer com suporte a tipos complexos
function WidgetRenderer({ widget, schema, value, onChange }: WidgetRendererProps) {
  switch (widget) {
    case 'currency':
      return (
        <CurrencyInput
          value={value}
          onChange={onChange}
          currency="BRL"
          locale="pt-BR"
          min={schema.minimum}
          max={schema.maximum}
        />
      );

    case 'cpf':
      return (
        <InputMask
          mask="999.999.999-99"
          value={value}
          onChange={onChange}
          validator={validateCPF}
          errorMessage={schema.errorMessage}
        />
      );

    case 'percentage':
      return (
        <div className="flex items-center gap-2">
          <Slider
            value={[value || 0]}
            onValueChange={([v]) => onChange(v)}
            min={0}
            max={100}
            step={1}
          />
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            suffix="%"
            className="w-20"
          />
        </div>
      );

    case 'relationship_picker':
      return (
        <RelationshipPicker
          objectType={schema.relationshipConfig.targetType}
          value={value}
          onChange={onChange}
          allowMultiple={schema.relationshipConfig.cardinality === 'MANY_TO_MANY'}
        />
      );

    default:
      return <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}
```

---

## 5. State Machine Editor: Ciclo de Vida Visual

### 5.1. Interface de Edição de Estados

**Componente React - State Machine Editor:**

```tsx
function StateMachineEditor({ definition, onChange }: StateMachineEditorProps) {
  const [states, setStates] = useState<State[]>(definition.states || []);
  const [transitions, setTransitions] = useState<Transition[]>(definition.transitions || []);

  // React Flow para visualizar FSM
  const nodes: Node[] = states.map((state, idx) => ({
    id: state.name,
    type: 'stateNode',
    position: calculatePosition(idx, states.length), // Layout circular
    data: {
      label: state.display_name || state.name,
      isInitial: state.name === definition.initial_state,
      isFinal: state.is_final || false,
      color: state.color || '#6366f1',
    },
  }));

  const edges: Edge[] = transitions.map(t => ({
    id: `${t.from}-${t.to}-${t.event}`,
    source: t.from,
    target: t.to,
    label: t.event,
    type: 'smoothstep',
    animated: true,
  }));

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Painel de Controle */}
      <div className="space-y-4">
        <h3 className="font-semibold">Estados</h3>
        {states.map(state => (
          <StateCard
            key={state.name}
            state={state}
            onEdit={(updated) => {
              setStates(states.map(s => s.name === state.name ? updated : s));
            }}
            onDelete={() => {
              setStates(states.filter(s => s.name !== state.name));
              // Remove transições relacionadas
              setTransitions(transitions.filter(t => t.from !== state.name && t.to !== state.name));
            }}
          />
        ))}
        <Button onClick={() => setStates([...states, { name: `STATE_${states.length + 1}` }])}>
          + Adicionar Estado
        </Button>

        <h3 className="font-semibold mt-6">Transições</h3>
        {transitions.map((t, idx) => (
          <TransitionCard
            key={idx}
            transition={t}
            availableStates={states}
            onEdit={(updated) => {
              setTransitions(transitions.map((tr, i) => i === idx ? updated : tr));
            }}
            onDelete={() => {
              setTransitions(transitions.filter((_, i) => i !== idx));
            }}
          />
        ))}
        <Button onClick={() => setTransitions([...transitions, { from: '', to: '', event: '' }])}>
          + Adicionar Transição
        </Button>
      </div>

      {/* Visualização React Flow */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodeTypes={{ stateNode: StateNode }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

// Componente customizado de Estado
function StateNode({ data }: { data: any }) {
  return (
    <div
      className={cn(
        'px-6 py-3 rounded-full border-2 shadow-md',
        data.isInitial && 'border-green-500 bg-green-50',
        data.isFinal && 'border-red-500 bg-red-50',
        !data.isInitial && !data.isFinal && 'border-gray-300 bg-white'
      )}
      style={{ borderColor: data.color }}
    >
      {data.isInitial && <span className="mr-2">▶️</span>}
      <span className="font-medium">{data.label}</span>
      {data.isFinal && <span className="ml-2">🏁</span>}
    </div>
  );
}
```

**Exemplo Visual do Editor:**

```
┌──────────────────────────────────────────────────────────┐
│ 🔄 Editor de Máquina de Estados: "Conta Corrente"       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Estados:                   │  Visualização:            │
│  ┌──────────────┐           │  ┌──────────────────────┐ │
│  │ PENDENTE     │           │  │                      │ │
│  │ Inicial: ✓   │           │  │   ▶️ (PENDENTE)      │ │
│  │ Cor: 🟡      │           │  │         │            │ │
│  └──────────────┘           │  │         v aprovar    │ │
│  ┌──────────────┐           │  │     (ATIVA) ◄──┐    │ │
│  │ ATIVA        │           │  │         │       │    │ │
│  │ Cor: 🟢      │           │  │         v bloquear   │ │
│  └──────────────┘           │  │   (BLOQUEADA)──┘    │ │
│  ┌──────────────┐           │  │         │            │ │
│  │ BLOQUEADA    │           │  │         v encerrar   │ │
│  │ Cor: 🔴      │           │  │   (ENCERRADA) 🏁     │ │
│  └──────────────┘           │  │                      │ │
│  ┌──────────────┐           │  └──────────────────────┘ │
│  │ ENCERRADA    │           │                          │
│  │ Final: ✓     │           │  Validações:             │
│  └──────────────┘           │  ✓ Todos estados têm     │
│                             │    pelo menos 1 entrada  │
│  Transições:                │  ✓ Estado final existe   │
│  ┌────────────────────────┐ │  ⚠️ ATIVA não tem saída  │
│  │ PENDENTE → ATIVA       │ │    para PENDENTE        │
│  │ Evento: aprovar        │ │                          │
│  │ Condição: saldo >= 0   │ │                          │
│  └────────────────────────┘ │                          │
│  ┌────────────────────────┐ │                          │
│  │ ATIVA → BLOQUEADA      │ │                          │
│  │ Evento: bloquear       │ │                          │
│  │ Ação: notificar_cliente│ │                          │
│  └────────────────────────┘ │                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Performance e Escalabilidade

### 6.1. Desafio: JSONB Queries em Escala

**Problema**: Buscar "todos os clientes com CPF começando com '123' e saldo > 10k" em uma tabela com 1M de instâncias.

**Solução Multi-Camada**:

#### A. Índices GIN Especializados
```sql
-- Índice para queries em campos específicos do JSONB
CREATE INDEX idx_instances_data_cpf ON instances
USING GIN ((data -> 'cpf') jsonb_path_ops);

CREATE INDEX idx_instances_data_saldo ON instances
USING btree (((data ->> 'saldo')::numeric))
WHERE object_definition_id = 'uuid-conta-corrente';

-- Índice composto para queries complexas
CREATE INDEX idx_instances_composite ON instances
USING GIN (object_definition_id, data jsonb_path_ops);
```

#### B. Materialized Views para Queries Comuns
```sql
-- View materializada para "Dashboard de Contas Ativas"
CREATE MATERIALIZED VIEW mv_contas_ativas AS
SELECT
    i.id,
    i.data ->> 'numero_conta' AS numero_conta,
    (i.data ->> 'saldo')::numeric AS saldo,
    i.current_state,
    i.updated_at,
    -- Join com cliente via relacionamento
    (SELECT data ->> 'nome_completo'
     FROM instances cli
     WHERE cli.id = (
         SELECT target_instance_id
         FROM relationships
         WHERE source_instance_id = i.id
           AND relationship_type = 'TITULAR_DE'
         LIMIT 1
     )) AS titular_nome
FROM instances i
WHERE i.object_definition_id = (
    SELECT id FROM object_definitions WHERE name = 'conta_corrente'
)
AND i.current_state = 'ATIVA'
AND i.is_deleted = false;

-- Refresh automático (via trigger ou cron)
CREATE INDEX ON mv_contas_ativas (saldo DESC);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_contas_ativas;
```

#### C. Particionamento por Object Type
```sql
-- Particionar tabela instances por object_definition_id
CREATE TABLE instances (
    id UUID NOT NULL,
    object_definition_id UUID NOT NULL,
    data JSONB NOT NULL,
    -- ... outros campos
) PARTITION BY LIST (object_definition_id);

-- Criar partições para objetos de alto volume
CREATE TABLE instances_clientes PARTITION OF instances
FOR VALUES IN ('uuid-cliente-pf', 'uuid-cliente-pj');

CREATE TABLE instances_transacoes PARTITION OF instances
FOR VALUES IN ('uuid-transacao-pix', 'uuid-transacao-ted');

-- Partição default
CREATE TABLE instances_others PARTITION OF instances DEFAULT;
```

### 6.2. Caching Estratégico

**Redis para Object Definitions (raramente mudam):**
```go
func (s *DefinitionService) GetDefinition(ctx context.Context, id string) (*ObjectDefinition, error) {
    // Tenta cache primeiro
    cacheKey := fmt.Sprintf("obj_def:%s", id)
    cached, err := s.redis.Get(ctx, cacheKey).Result()
    if err == nil {
        var def ObjectDefinition
        json.Unmarshal([]byte(cached), &def)
        return &def, nil
    }

    // Cache miss - busca no banco
    def, err := s.db.QueryDefinition(ctx, id)
    if err != nil {
        return nil, err
    }

    // Armazena no cache (TTL: 1 hora)
    data, _ := json.Marshal(def)
    s.redis.Set(ctx, cacheKey, data, time.Hour)

    return def, nil
}
```

**Cache de Validação (validation_rules):**
```go
// Compiled validators cache (evita re-compilar JSON Schema)
var validatorCache = &sync.Map{}

func (v *Validator) Validate(schema map[string]interface{}, data interface{}) error {
    schemaHash := hashSchema(schema)

    compiled, ok := validatorCache.Load(schemaHash)
    if !ok {
        // Compila JSON Schema (operação custosa)
        compiled = gojsonschema.NewGoLoader(schema)
        validatorCache.Store(schemaHash, compiled)
    }

    result, err := compiled.Validate(gojsonschema.NewGoLoader(data))
    // ... validação
}
```

---

## 7. Casos de Uso Reais: Core Banking

### 7.1. Criando "Cliente PF" (End-to-End)

**Passo 1: Usuário de Negócio no Backoffice**

```
Ação: Clica em "Back Section" > "Criar Objeto"
Template selecionado: "Cliente Regulado BACEN"
Customização:
  - Adiciona campo: "score_credito" (number, 0-1000)
  - Adiciona campo: "segmento" (enum: ['Varejo', 'Premium', 'Private'])
  - Adiciona regra: "Se score < 300, estado inicial = PRE_CADASTRO"
Salva → object_definition criada com UUID
```

**Passo 2: Backend Persiste**

```sql
INSERT INTO object_definitions (id, name, schema, rules, states) VALUES (
  'uuid-123',
  'cliente_pf_custom',
  '{ /* JSON Schema completo */ }',
  '[
    {
      "rule_type": "conditional_state",
      "condition": "data.score_credito < 300",
      "action": "set_initial_state",
      "value": "PRE_CADASTRO"
    }
  ]',
  '{
    "initial": "ATIVO",
    "states": ["PRE_CADASTRO", "ATIVO", "BLOQUEADO", "INATIVO"],
    "transitions": [...]
  }'
);
```

**Passo 3: Frontend Gera UI Automaticamente**

```
Usuário vai em "Front Section" > "Clientes PF" > "Novo"
Sistema renderiza formulário dinâmico:
  [CPF] ___.___.___-__  (com máscara)
  [Nome Completo] _______________
  [Data Nascimento] __/__/____
  [Score Crédito] [  slider 0-1000  ]
  [Segmento] ( ) Varejo ( ) Premium ( ) Private

Ao preencher CPF válido:
  - Consulta Receita Federal (regra de enrichment)
  - Preenche nome automaticamente
  - Valida se CPF não está na blacklist (regra de validation)
```

**Passo 4: Validação + Persistência**

```go
// API recebe POST /api/instances
{
  "object_definition_id": "uuid-123",
  "data": {
    "cpf": "12345678901",
    "nome_completo": "Maria Silva",
    "data_nascimento": "1990-05-15",
    "score_credito": 250,
    "segmento": "Varejo"
  }
}

// Validator executa:
1. Validação de schema (JSON Schema)
2. Validação customizada (CPF blacklist)
3. Enrichment (Receita Federal)
4. Determina estado inicial:
   - score_credito = 250 < 300 → initial_state = "PRE_CADASTRO"

// Persiste:
INSERT INTO instances (object_definition_id, data, current_state) VALUES (
  'uuid-123',
  '{"cpf": "12345678901", "nome_completo": "Maria Silva", ...}',
  'PRE_CADASTRO'  -- ← Aplicou a regra!
);
```

### 7.2. Criando "Conta Corrente" + Relacionamento

**Passo 1: Criar Conta**

```
Front Section > Contas Correntes > Nova
Formulário:
  [Número Conta] 12345-6
  [Agência] 0001
  [Saldo Inicial] R$ 0,00
  [Titular] [Buscar Cliente...]  ← Relationship Picker
```

**Componente Relationship Picker:**

```tsx
function RelationshipPicker({ targetType, onChange }: RelationshipPickerProps) {
  const [search, setSearch] = useState('');
  const { data: instances } = useQuery(['instances', targetType, search], () =>
    api.get(`/api/instances?object_type=${targetType}&search=${search}`)
  );

  return (
    <Combobox value={value} onChange={onChange}>
      <ComboboxInput
        placeholder="Digite CPF ou nome..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <ComboboxOptions>
        {instances?.map(inst => (
          <ComboboxOption key={inst.id} value={inst.id}>
            <div>
              <strong>{inst.data.nome_completo}</strong>
              <span className="text-sm text-gray-500">CPF: {inst.data.cpf}</span>
            </div>
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
}
```

**Passo 2: Backend Cria Instância + Relacionamento**

```go
// Transaction atômica
tx.Begin()

// 1. Cria instância da conta
contaID := createInstance(tx, ContaCorrenteDefinition, {
  "numero_conta": "12345-6",
  "agencia": "0001",
  "saldo": 0,
})

// 2. Cria relacionamento TITULAR_DE
createRelationship(tx, Relationship{
  Type: "TITULAR_DE",
  SourceInstanceID: clienteID,  // Cliente selecionado
  TargetInstanceID: contaID,
  Properties: map[string]interface{}{
    "porcentagem_propriedade": 100,
    "desde": time.Now(),
  },
})

tx.Commit()
```

**Passo 3: Visualização no Grafo**

```
Usuário clica em "Ver Grafo" na página da conta:

  ┌──────────────┐
  │ Maria Silva  │
  │ CPF: 123...  │
  └──────┬───────┘
         │ TITULAR_DE (100%)
         ↓
  ┌──────────────┐
  │ Conta 12345-6│
  │ Saldo: R$ 0  │
  └──────────────┘
```

---

## 8. Estratégia de Migração: Do Simples ao Complexo

### Implementação Incremental (3 meses)

#### Semana 1-2: CRUD Básico
- [ ] API de object_definitions (sem UI visual, apenas JSON)
- [ ] API de instances (CRUD genérico)
- [ ] Validação básica (JSON Schema)
- [ ] Interface mínima (lista + formulário simples)

#### Semana 3-4: Editor Visual Básico
- [ ] Wizard de 4 passos (template + campos + preview)
- [ ] Field Configurator (tipos básicos: string, number, boolean)
- [ ] Dynamic Form Rendering (sem conditional fields ainda)
- [ ] Validações pré-definidas (CPF, email)

#### Semana 5-6: Relacionamentos
- [ ] Tabela relationships
- [ ] API de relacionamentos
- [ ] Relationship Picker component
- [ ] Validação de cardinalidade
- [ ] Visualização de grafo (React Flow básico)

#### Semana 7-8: State Machines
- [ ] Editor visual de estados
- [ ] FSM validation engine
- [ ] Transições com eventos
- [ ] Histórico de mudanças de estado

#### Semana 9-10: Advanced Features
- [ ] Conditional fields (dependencies em JSON Schema)
- [ ] Custom validation rules
- [ ] Enrichment actions (API calls)
- [ ] Detecção de ciclos no grafo

#### Semana 11-12: Polish + Performance
- [ ] Caching (Redis)
- [ ] Índices GIN otimizados
- [ ] Materialized views
- [ ] UI refinements (animações, feedback)
- [ ] Documentação + testes

---

## 9. Decisões Críticas de Arquitetura

### Decisão 1: PostgreSQL JSONB vs NoSQL

**Escolhido**: PostgreSQL JSONB

**Justificativa**:
- ✅ ACID compliance (crítico para Core Banking)
- ✅ Queries SQL tradicionais quando necessário (relatórios)
- ✅ GIN indexes para JSONB (performance comparável a MongoDB)
- ✅ Relacionamentos transacionais (FK constraints funcionam)
- ❌ NoSQL seria mais simples, mas perde garantias transacionais

### Decisão 2: Frontend: Template Builder vs Code Generator

**Escolhido**: Template Builder (UI Visual)

**Justificativa**:
- ✅ Usuários de negócio podem criar sem devs
- ✅ Templates pré-configurados aceleram 80% dos casos
- ✅ Modo JSON expert para casos complexos
- ❌ Code Generator seria mais flexível, mas exige conhecimento técnico

### Decisão 3: Graph Storage: NebulaGraph vs PostgreSQL

**Escolhido**: Híbrido (PostgreSQL + NebulaGraph sync)

**Justificativa**:
- PostgreSQL como Source of Truth (relationships table)
- NebulaGraph para queries complexas de grafo (BFS, PageRank, detecção de fraude)
- Sync via trigger/CDC (Change Data Capture)

```sql
-- Trigger para sync com NebulaGraph
CREATE OR REPLACE FUNCTION sync_to_nebula() RETURNS TRIGGER AS $$
BEGIN
  -- Publica evento para Apache Pulsar
  PERFORM pg_notify('relationship_changed', json_build_object(
    'action', TG_OP,
    'relationship_id', NEW.id,
    'type', NEW.relationship_type,
    'source', NEW.source_instance_id,
    'target', NEW.target_instance_id
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_relationship_sync
AFTER INSERT OR UPDATE OR DELETE ON relationships
FOR EACH ROW EXECUTE FUNCTION sync_to_nebula();
```

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **UX muito complexa para usuários de negócio** | Alta | Alto | - Testes de usabilidade semanais<br>- Templates pré-configurados<br>- Onboarding interativo<br>- Documentação com vídeos |
| **Performance de JSONB em escala** | Média | Alto | - Índices GIN especializados<br>- Materialized views<br>- Particionamento<br>- Benchmark com 10M registros |
| **Validações insuficientes** | Média | Crítico | - Biblioteca de validações BACEN<br>- Testes de carga<br>- Sandbox para testar rules |
| **Relacionamentos inconsistentes** | Baixa | Alto | - Validação de cardinalidade<br>- Detecção de ciclos<br>- Foreign key constraints |
| **UI não renderiza schemas complexos** | Alta | Médio | - Fallback para JSON editor<br>- Biblioteca de widgets extensível<br>- Suporte incremental |

---

## 11. Conclusão: O Que Torna Isso Viável?

### 11.1. Não Estamos Reinventando a Roda

Componentes já existentes que usamos:
- **JSON Schema**: Padrão maduro (Draft 7)
- **React Flow**: 100k+ apps usam
- **PostgreSQL JSONB**: Usado por GitHub, Instagram
- **Validation Libraries**: ajv, gojsonschema (battle-tested)

### 11.2. Foco no "Core" do Core Banking

Objetos que REALMENTE precisamos para MVP:
1. Cliente (PF/PJ)
2. Conta (Corrente/Poupança)
3. Transação (PIX/TED/Boleto)
4. Cartão (Débito/Crédito)

**Total**: ~4-6 object_definitions bem feitas.

### 11.3. A Magia Está na Composição

```
Template "Cliente BACEN" (30 campos)
  +
Campo customizado "Score Interno" (1 campo)
  +
Relacionamento "TITULAR_DE" (configurável)
  +
State Machine "KYC Workflow" (4 estados)
  =
Sistema completo de onboarding regulatório
```

---

## 12. Próximos Passos Imediatos

### Para Aprovar Fase 1:

1. **Protótipo de UI (Figma/Código)**:
   - Wizard de criação de objeto
   - Dynamic form com 3-4 widgets
   - Relationship picker
   - State machine editor

2. **Prova de Conceito Técnica**:
   - PostgreSQL com 100k instâncias
   - Benchmark de queries JSONB
   - Validação de JSON Schema com regras complexas

3. **Definição de Templates Iniciais**:
   - Cliente PF (regulatório BACEN)
   - Conta Corrente
   - Transação PIX

**Estimativa**: 2 semanas para protótipo funcional + benchmarks.

---

**Este documento responde ao "Think Harder"?**
Cobriu:
- ✅ UX/UI detalhado (3 camadas de complexidade)
- ✅ Gestão de objetos (JSONB + validações + FSM)
- ✅ Relacionamentos (grafo + validações)
- ✅ Performance (índices + cache + particionamento)
- ✅ Casos reais (Cliente + Conta + Grafo)
- ✅ Riscos e mitigações

**Pronto para implementação da Fase 1.**

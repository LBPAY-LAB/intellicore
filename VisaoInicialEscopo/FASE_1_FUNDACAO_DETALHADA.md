# FASE 1: FUNDAÇÃO - Especificação Detalhada

**Versão**: 1.0 (Think Harder Edition)
**Data**: 09 de Dezembro de 2025
**Duração**: 3 meses (12 semanas)
**Objetivo**: Construir a fundação universal que permite gestão abstrata de objetos para Core Banking

---

## VISÃO GERAL DA FASE 1

Esta fase estabelece a **espinha dorsal** de toda a plataforma. Sem ela perfeita, as fases seguintes são inviáveis.

**Princípio Fundamental**:
> "Se alguém pode criar `CREATE TABLE clientes`, falhamos.
> Se alguém consegue criar um novo tipo de objeto (ex: Conta Garantida) em < 5 minutos via UI, vencemos."

---

## PARTE 1: BACKEND - A API UNIVERSAL

### 1.1. Arquitetura de Dados (PostgreSQL)

#### Tabelas Core (NUNCA mudam)

```sql
-- ════════════════════════════════════════════════════════════════
-- TABELA 1: object_definitions (O DNA)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,  -- ex: "cliente_pf", "transacao_pix"
    display_name VARCHAR(200),           -- ex: "Cliente Pessoa Física"
    description TEXT,
    version INT DEFAULT 1,

    -- O Schema JSON (JSON Schema Draft 7)
    schema JSONB NOT NULL,

    -- Regras de Negócio (executadas por agentes)
    rules JSONB DEFAULT '[]'::jsonb,

    -- Máquina de Estados Finitos
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE", "BLOCKED", "INACTIVE"],
        "transitions": []
    }'::jsonb,

    -- UI Hints (dicas para renderização)
    ui_hints JSONB DEFAULT '{}'::jsonb,

    -- Relacionamentos permitidos
    relationships JSONB DEFAULT '[]'::jsonb,

    -- Metadados
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_system BOOLEAN DEFAULT false,  -- true para objetos core (não deletável)
    is_active BOOLEAN DEFAULT true,

    -- Controle de versão
    parent_version_id UUID REFERENCES object_definitions(id),

    CONSTRAINT valid_schema CHECK (jsonb_typeof(schema) = 'object'),
    CONSTRAINT valid_name CHECK (name ~ '^[a-z][a-z0-9_]*$')
);

-- Índices críticos para performance
CREATE INDEX idx_object_definitions_name ON object_definitions(name);
CREATE INDEX idx_object_definitions_active ON object_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_object_definitions_schema_gin ON object_definitions USING gin(schema jsonb_path_ops);


-- ════════════════════════════════════════════════════════════════
-- TABELA 2: instances (As Entidades Vivas)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_definition_id UUID NOT NULL REFERENCES object_definitions(id),

    -- Os dados reais (JSON)
    data JSONB NOT NULL,

    -- Estado atual (segundo FSM do object_definition)
    current_state VARCHAR(50) NOT NULL,

    -- Histórico de transições de estado
    state_history JSONB DEFAULT '[]'::jsonb,

    -- Metadados
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Soft delete
    deleted_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,

    -- Versionamento de dados
    version INT DEFAULT 1,

    CONSTRAINT valid_data CHECK (jsonb_typeof(data) = 'object')
);

-- Índices críticos
CREATE INDEX idx_instances_object_def ON instances(object_definition_id);
CREATE INDEX idx_instances_state ON instances(current_state);
CREATE INDEX idx_instances_created_at ON instances(created_at DESC);
CREATE INDEX idx_instances_data_gin ON instances USING gin(data jsonb_path_ops);
CREATE INDEX idx_instances_not_deleted ON instances(is_deleted) WHERE is_deleted = false;


-- ════════════════════════════════════════════════════════════════
-- TABELA 3: relationships (Arestas entre Instâncias)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo de relacionamento (ex: "POSSUI", "VINCULADO_A", "PERTENCE_A")
    relationship_type VARCHAR(100) NOT NULL,

    -- Instância de origem
    source_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,

    -- Instância de destino
    target_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,

    -- Metadados do relacionamento (opcional)
    properties JSONB DEFAULT '{}'::jsonb,

    -- Validade temporal (para relacionamentos temporários)
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,

    -- Evitar duplicatas
    CONSTRAINT unique_relationship UNIQUE(relationship_type, source_instance_id, target_instance_id)
);

-- Índices para navegação de grafo
CREATE INDEX idx_rel_source ON relationships(source_instance_id);
CREATE INDEX idx_rel_target ON relationships(target_instance_id);
CREATE INDEX idx_rel_type ON relationships(relationship_type);
CREATE INDEX idx_rel_bidirectional ON relationships(source_instance_id, target_instance_id);


-- ════════════════════════════════════════════════════════════════
-- TABELA 4: validation_rules (Biblioteca de Regras Reutilizáveis)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,  -- ex: "cpf_valid", "email_format"
    description TEXT,

    -- Tipo de validação
    rule_type VARCHAR(50),  -- "regex", "function", "external_api", "custom"

    -- Definição da regra
    rule_definition JSONB NOT NULL,

    -- Se é uma regra do sistema (não deletável)
    is_system BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Regras pré-cadastradas (Fase 1)
INSERT INTO validation_rules (name, description, rule_type, rule_definition, is_system) VALUES
('cpf_valid', 'Valida formato de CPF brasileiro', 'regex', '{"pattern": "^\\d{11}$"}', true),
('email_valid', 'Valida formato de email', 'regex', '{"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}', true),
('cnpj_valid', 'Valida formato de CNPJ brasileiro', 'regex', '{"pattern": "^\\d{14}$"}', true),
('phone_br_valid', 'Valida telefone brasileiro', 'regex', '{"pattern": "^\\d{10,11}$"}', true),
('positive_number', 'Número maior que zero', 'function', '{"expression": "value > 0"}', true),
('not_empty', 'Campo não pode ser vazio', 'function', '{"expression": "value.length > 0"}', true);
```

### 1.2. API Endpoints (Go)

#### Definições de Objetos (Back Section)

```go
// ═══════════════════════════════════════════════════════════════
// DEFINITIONS API
// ═══════════════════════════════════════════════════════════════

// Criar nova definição de objeto
// POST /api/v1/definitions
type CreateObjectDefinitionRequest struct {
    Name          string                 `json:"name" validate:"required,lowercase,alpha_dash"`
    DisplayName   string                 `json:"display_name"`
    Description   string                 `json:"description"`
    Schema        map[string]interface{} `json:"schema" validate:"required"`
    Rules         []Rule                 `json:"rules"`
    States        StateMachine           `json:"states"`
    UIHints       map[string]interface{} `json:"ui_hints"`
    Relationships []AllowedRelationship  `json:"relationships"`
}

type CreateObjectDefinitionResponse struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Version   int       `json:"version"`
    CreatedAt time.Time `json:"created_at"`
}

// Listar definições
// GET /api/v1/definitions?active=true&search=cliente
type ListObjectDefinitionsResponse struct {
    Items      []ObjectDefinitionSummary `json:"items"`
    Total      int                       `json:"total"`
    Page       int                       `json:"page"`
    PerPage    int                       `json:"per_page"`
}

// Obter definição completa
// GET /api/v1/definitions/:id_or_name
type GetObjectDefinitionResponse struct {
    ID            string                 `json:"id"`
    Name          string                 `json:"name"`
    DisplayName   string                 `json:"display_name"`
    Schema        map[string]interface{} `json:"schema"`
    Rules         []Rule                 `json:"rules"`
    States        StateMachine           `json:"states"`
    UIHints       map[string]interface{} `json:"ui_hints"`
    Relationships []AllowedRelationship  `json:"relationships"`
    CreatedAt     time.Time              `json:"created_at"`
    UpdatedAt     time.Time              `json:"updated_at"`
}

// Atualizar definição (cria nova versão)
// PUT /api/v1/definitions/:id
// (Similar ao Create, mas incrementa version)

// Deletar definição (soft delete)
// DELETE /api/v1/definitions/:id
```

#### Instâncias (Front Section)

```go
// ═══════════════════════════════════════════════════════════════
// INSTANCES API
// ═══════════════════════════════════════════════════════════════

// Criar instância
// POST /api/v1/instances/:definition_name
type CreateInstanceRequest struct {
    Data map[string]interface{} `json:"data" validate:"required"`
}

type CreateInstanceResponse struct {
    ID               string                 `json:"id"`
    ObjectDefinitionID string               `json:"object_definition_id"`
    Data             map[string]interface{} `json:"data"`
    CurrentState     string                 `json:"current_state"`
    CreatedAt        time.Time              `json:"created_at"`
}

// Listar instâncias (com busca dinâmica)
// GET /api/v1/instances/:definition_name
// Query params:
//   - q: busca textual (full-text em JSONB)
//   - filter: JSON com filtros (ex: {"data.cpf": "12345678909"})
//   - state: filtrar por estado
//   - page, per_page: paginação
type ListInstancesResponse struct {
    Items   []InstanceSummary `json:"items"`
    Total   int               `json:"total"`
    Page    int               `json:"page"`
    PerPage int               `json:"per_page"`
}

// Obter instância específica
// GET /api/v1/instances/:id
type GetInstanceResponse struct {
    ID                 string                 `json:"id"`
    ObjectDefinitionID string                 `json:"object_definition_id"`
    ObjectName         string                 `json:"object_name"`
    Data               map[string]interface{} `json:"data"`
    CurrentState       string                 `json:"current_state"`
    StateHistory       []StateTransition      `json:"state_history"`
    Relationships      RelationshipSummary    `json:"relationships"`
    CreatedAt          time.Time              `json:"created_at"`
    UpdatedAt          time.Time              `json:"updated_at"`
}

// Atualizar dados da instância
// PUT /api/v1/instances/:id
type UpdateInstanceRequest struct {
    Data map[string]interface{} `json:"data"`
}

// Transição de estado
// POST /api/v1/instances/:id/transition
type TransitionStateRequest struct {
    Action   string                 `json:"action" validate:"required"`
    Reason   string                 `json:"reason"`
    Metadata map[string]interface{} `json:"metadata"`
}

type TransitionStateResponse struct {
    ID             string    `json:"id"`
    PreviousState  string    `json:"previous_state"`
    CurrentState   string    `json:"current_state"`
    TransitionedAt time.Time `json:"transitioned_at"`
}
```

#### Relacionamentos

```go
// ═══════════════════════════════════════════════════════════════
// RELATIONSHIPS API
// ═══════════════════════════════════════════════════════════════

// Criar relacionamento
// POST /api/v1/relationships
type CreateRelationshipRequest struct {
    Type             string                 `json:"type" validate:"required"`
    SourceInstanceID string                 `json:"source_instance_id" validate:"required,uuid"`
    TargetInstanceID string                 `json:"target_instance_id" validate:"required,uuid"`
    Properties       map[string]interface{} `json:"properties"`
}

// Obter relacionamentos de uma instância
// GET /api/v1/instances/:id/relationships
// Query params:
//   - direction: "outgoing", "incoming", "both" (default: both)
//   - type: filtrar por tipo
type GetInstanceRelationshipsResponse struct {
    Outgoing []Relationship `json:"outgoing"`  // Esta instância → Outras
    Incoming []Relationship `json:"incoming"`  // Outras → Esta instância
}

type Relationship struct {
    ID         string                 `json:"id"`
    Type       string                 `json:"type"`
    Source     InstanceSummary        `json:"source"`
    Target     InstanceSummary        `json:"target"`
    Properties map[string]interface{} `json:"properties"`
    CreatedAt  time.Time              `json:"created_at"`
}
```

### 1.3. Engine de Validação (JSON Schema)

```go
package validation

import (
    "github.com/xeipuuv/gojsonschema"
)

type ValidationEngine struct {
    schemaLoader gojsonschema.JSONLoader
}

// Valida dados contra o schema do object_definition
func (ve *ValidationEngine) ValidateInstance(
    schema map[string]interface{},
    data map[string]interface{},
) (bool, []ValidationError) {
    schemaLoader := gojsonschema.NewGoLoader(schema)
    dataLoader := gojsonschema.NewGoLoader(data)

    result, err := gojsonschema.Validate(schemaLoader, dataLoader)
    if err != nil {
        return false, []ValidationError{{Message: err.Error()}}
    }

    if !result.Valid() {
        errors := make([]ValidationError, 0)
        for _, err := range result.Errors() {
            errors = append(errors, ValidationError{
                Field:   err.Field(),
                Message: err.Description(),
                Type:    err.Type(),
            })
        }
        return false, errors
    }

    return true, nil
}

// Executa regras de negócio custom
func (ve *ValidationEngine) ExecuteRules(
    rules []Rule,
    data map[string]interface{},
) (bool, []RuleViolation) {
    violations := make([]RuleViolation, 0)

    for _, rule := range rules {
        switch rule.Type {
        case "regex":
            // Validação regex
        case "function":
            // Avalia expressão JavaScript (via goja runtime)
        case "external_api":
            // Chama API externa (ex: consulta CPF na Receita)
        }
    }

    return len(violations) == 0, violations
}
```

---

## PARTE 2: FRONTEND - PORTAL DE BACKOFFICE

### 2.1. Arquitetura Frontend (Next.js 14+)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── back-section/          # Criação de Objetos
│   │   │   ├── definitions/
│   │   │   │   ├── page.tsx       # Lista de object_definitions
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Editor de definição
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Visualizar/Editar
│   │   │   │       └── edit/
│   │   │   └── rules/             # Biblioteca de regras
│   │   │
│   │   └── front-section/         # Operação (Instâncias)
│   │       ├── instances/
│   │       │   └── [defName]/
│   │       │       ├── page.tsx   # Lista de instâncias
│   │       │       ├── new/
│   │       │       └── [id]/
│   │       │           └── page.tsx  # Detalhe + Relacionamentos
│   │       └── graph/
│   │           └── page.tsx       # Visualização em grafo (React Flow)
│   │
│   └── api/                       # API routes (proxy para backend Go)
│
├── components/
│   ├── object-definition/
│   │   ├── SchemaEditor.tsx       # Editor JSON Schema visual
│   │   ├── StateMachineEditor.tsx # Editor FSM visual
│   │   └── RulesBuilder.tsx       # Construtor de regras
│   │
│   ├── instance/
│   │   ├── DynamicForm.tsx        # Renderizador dinâmico
│   │   ├── InstanceCard.tsx       # Card de instância
│   │   └── RelationshipGraph.tsx  # Grafo de relacionamentos
│   │
│   └── ui/                        # Componentes shadcn/ui
│
├── lib/
│   ├── api-client.ts              # Cliente HTTP (Axios/Fetch)
│   ├── form-generator.ts          # Lógica de geração de formulários
│   └── validation.ts              # Validação client-side
│
└── types/
    ├── object-definition.ts
    ├── instance.ts
    └── api.ts
```

### 2.2. UX/UI - Back Section (Criação de Objetos)

#### Tela 1: Lista de Object Definitions

```tsx
// /back-section/definitions/page.tsx

export default function DefinitionsListPage() {
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Object Definitions</h1>
                    <p className="text-muted-foreground">
                        Manage the DNA of your system - define object types
                    </p>
                </div>
                <Button asChild>
                    <Link href="/back-section/definitions/new">
                        <Plus className="mr-2" /> New Definition
                    </Link>
                </Button>
            </div>

            {/* Filtros */}
            <div className="mb-4 flex gap-4">
                <Input
                    placeholder="Search definitions..."
                    onChange={handleSearch}
                />
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {definitions.map(def => (
                    <DefinitionCard key={def.id} definition={def} />
                ))}
            </div>
        </div>
    );
}
```

**Design**:
- Cards com nome, descrição, número de instâncias ativas
- Badge indicando se é objeto do sistema (não editável)
- Ações: View, Edit, Clone, Delete

#### Tela 2: Editor de Object Definition (O Coração do Back Section)

Esta é a tela MAS CRÍTICA da Fase 1. Precisa ser INTUITIVA para usuários de negócio.

```tsx
// /back-section/definitions/new/page.tsx

export default function NewDefinitionPage() {
    const [step, setStep] = useState(1); // Wizard de 4 passos

    return (
        <div className="container max-w-5xl mx-auto p-6">
            {/* Progress Steps */}
            <Steps current={step} className="mb-8">
                <Step title="Basic Info" />
                <Step title="Schema" />
                <Step title="States & Rules" />
                <Step title="UI Hints" />
            </Steps>

            {/* Conteúdo baseado no step */}
            {step === 1 && <BasicInfoStep />}
            {step === 2 && <SchemaEditorStep />}
            {step === 3 && <StatesAndRulesStep />}
            {step === 4 && <UIHintsStep />}

            {/* Navegação */}
            <div className="flex justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 1}
                >
                    Previous
                </Button>
                {step < 4 ? (
                    <Button onClick={() => setStep(s => s + 1)}>
                        Next
                    </Button>
                ) : (
                    <Button onClick={handleSubmit}>
                        Create Definition
                    </Button>
                )}
            </div>
        </div>
    );
}
```

**Step 1: Basic Info**
```tsx
function BasicInfoStep() {
    return (
        <div className="space-y-4">
            <FormField label="Name (System ID)" required>
                <Input
                    placeholder="cliente_pf"
                    pattern="^[a-z][a-z0-9_]*$"
                    hint="Lowercase, alphanumeric, underscores only"
                />
            </FormField>

            <FormField label="Display Name" required>
                <Input placeholder="Cliente Pessoa Física" />
            </FormField>

            <FormField label="Description">
                <Textarea
                    placeholder="Cadastro de clientes pessoa física com validação de CPF..."
                    rows={4}
                />
            </FormField>

            {/* Icon picker opcional */}
            <FormField label="Icon (optional)">
                <IconPicker />
            </FormField>
        </div>
    );
}
```

**Step 2: Schema Editor (A Parte Mais Complexa)**

Duas abordagens possíveis:

**Abordagem A: Visual Builder (Recomendado para Fase 1)**
```tsx
function SchemaEditorStep() {
    const [fields, setFields] = useState<Field[]>([]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Define Fields</h3>

            {/* Lista de campos */}
            <div className="space-y-3">
                {fields.map((field, idx) => (
                    <FieldEditor
                        key={idx}
                        field={field}
                        onChange={(updated) => updateField(idx, updated)}
                        onDelete={() => removeField(idx)}
                    />
                ))}
            </div>

            <Button
                variant="outline"
                onClick={() => addField({ name: '', type: 'string' })}
                className="mt-4"
            >
                <Plus /> Add Field
            </Button>

            {/* Preview do JSON Schema */}
            <Card className="mt-6 bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-sm">Generated JSON Schema</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(generateSchema(fields), null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}

function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4">
                    {/* Nome do campo */}
                    <div className="col-span-4">
                        <Label>Field Name</Label>
                        <Input
                            value={field.name}
                            onChange={(e) => onChange({ ...field, name: e.target.value })}
                            placeholder="cpf"
                        />
                    </div>

                    {/* Tipo */}
                    <div className="col-span-3">
                        <Label>Type</Label>
                        <Select
                            value={field.type}
                            onValueChange={(type) => onChange({ ...field, type })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="enum">Enum</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Required */}
                    <div className="col-span-2 flex items-end">
                        <Checkbox
                            id={`required-${field.name}`}
                            checked={field.required}
                            onCheckedChange={(checked) =>
                                onChange({ ...field, required: checked as boolean })
                            }
                        />
                        <Label htmlFor={`required-${field.name}`} className="ml-2">
                            Required
                        </Label>
                    </div>

                    {/* Validações adicionais */}
                    <div className="col-span-2">
                        <Label>Validation</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="cnpj">CNPJ</SelectItem>
                                <SelectItem value="phone">Phone (BR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Deletar */}
                    <div className="col-span-1 flex items-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                {/* Configurações avançadas (collapsible) */}
                <Collapsible className="mt-3">
                    <CollapsibleTrigger>
                        <Button variant="ghost" size="sm">
                            Advanced Options <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 p-4 bg-slate-50 rounded">
                        {/* Min/Max length para strings */}
                        {field.type === 'string' && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Min Length">
                                    <Input type="number" />
                                </FormField>
                                <FormField label="Max Length">
                                    <Input type="number" />
                                </FormField>
                            </div>
                        )}

                        {/* Pattern regex */}
                        <FormField label="Custom Regex Pattern">
                            <Input placeholder="^\d{11}$" />
                        </FormField>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
```

**Abordagem B: JSON Editor Direto (Para usuários avançados)**
```tsx
function SchemaEditorStep() {
    const [mode, setMode] = useState<'visual' | 'json'>('visual');

    return (
        <div>
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList>
                    <TabsTrigger value="visual">Visual Builder</TabsTrigger>
                    <TabsTrigger value="json">JSON Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="visual">
                    {/* Visual Builder (mostrado acima) */}
                </TabsContent>

                <TabsContent value="json">
                    <MonacoEditor
                        language="json"
                        value={schemaJSON}
                        onChange={setSchemaJSON}
                        height="500px"
                        options={{
                            minimap: { enabled: false },
                            formatOnPaste: true,
                            formatOnType: true
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

**Step 3: States & Rules (Máquina de Estados)**
```tsx
function StatesAndRulesStep() {
    return (
        <div className="space-y-6">
            {/* Definição de Estados */}
            <div>
                <h3 className="text-lg font-semibold mb-4">States</h3>
                <StatesMachineEditor />
            </div>

            {/* Regras de Negócio */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Business Rules</h3>
                <RulesBuilder />
            </div>
        </div>
    );
}

function StatesMachineEditor() {
    const [states, setStates] = useState(['DRAFT', 'ACTIVE', 'BLOCKED']);
    const [transitions, setTransitions] = useState([
        { from: 'DRAFT', to: 'ACTIVE', action: 'approve' },
        { from: 'ACTIVE', to: 'BLOCKED', action: 'block' }
    ]);

    return (
        <div>
            {/* Estados */}
            <div className="mb-4">
                <Label>Available States</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {states.map(state => (
                        <Badge key={state} variant="secondary">
                            {state}
                            <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => removeState(state)}
                            />
                        </Badge>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addState()}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Transições (Visual) */}
            <div>
                <Label>Transitions</Label>
                <div className="mt-3 space-y-3">
                    {transitions.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 border rounded">
                            <Select value={t.from} onValueChange={(v) => updateTransition(idx, 'from', v)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <ArrowRight className="h-4 w-4 text-muted-foreground" />

                            <Select value={t.to} onValueChange={(v) => updateTransition(idx, 'to', v)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Action name (approve, block...)"
                                value={t.action}
                                onChange={(e) => updateTransition(idx, 'action', e.target.value)}
                                className="flex-1"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTransition(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addTransition}>
                        <Plus /> Add Transition
                    </Button>
                </div>
            </div>

            {/* Preview Visual (Diagrama) */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-sm">State Machine Diagram</CardTitle>
                </CardHeader>
                <CardContent>
                    <StateMachineDiagram states={states} transitions={transitions} />
                </CardContent>
            </Card>
        </div>
    );
}
```

**Step 4: UI Hints (Personalização da Renderização)**
```tsx
function UIHintsStep() {
    return (
        <div>
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    UI Hints customize how this object is displayed in the Front Section.
                    These are optional - sensible defaults will be used if not specified.
                </AlertDescription>
            </Alert>

            <div className="space-y-6">
                {/* Display options */}
                <FormField label="List View - Primary Field">
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select field to display as title" />
                        </SelectTrigger>
                        <SelectContent>
                            {schema.fields.map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField label="List View - Secondary Field">
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select field for subtitle" />
                        </SelectTrigger>
                        <SelectContent>
                            {schema.fields.map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {/* Field-specific widgets */}
                <div>
                    <Label className="text-lg">Field Widgets</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                        Override the default input widget for specific fields
                    </p>

                    {schema.fields.map(field => (
                        <div key={field.name} className="flex items-center gap-4 p-3 border rounded mb-2">
                            <span className="font-mono text-sm flex-1">{field.name}</span>
                            <Select defaultValue="auto">
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="masked-input">Masked Input</SelectItem>
                                    <SelectItem value="currency">Currency</SelectItem>
                                    <SelectItem value="date-picker">Date Picker</SelectItem>
                                    <SelectItem value="rich-text">Rich Text Editor</SelectItem>
                                    <SelectItem value="file-upload">File Upload</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

### 2.3. UX/UI - Front Section (Operação - Instâncias)

#### Tela 1: Seletor de Tipo de Objeto
```tsx
// /front-section/instances/page.tsx

export default function InstancesSelectorPage() {
    const { data: definitions } = useObjectDefinitions({ active: true });

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2">Manage Instances</h1>
            <p className="text-muted-foreground mb-8">
                Select an object type to view and manage its instances
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {definitions?.map(def => (
                    <Link
                        key={def.id}
                        href={`/front-section/instances/${def.name}`}
                    >
                        <Card className="hover:shadow-lg transition cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded">
                                        {def.icon || <FileText />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {def.display_name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {def.instance_count || 0} instances
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
```

#### Tela 2: Lista de Instâncias (Dinâmica)
```tsx
// /front-section/instances/[defName]/page.tsx

export default function InstancesListPage({ params }: { params: { defName: string } }) {
    const { data: definition } = useObjectDefinition(params.defName);
    const { data: instances, isLoading } = useInstances(params.defName);

    // Determina quais campos mostrar na tabela (baseado em ui_hints)
    const displayFields = definition?.ui_hints?.list_view?.fields ||
                          Object.keys(definition?.schema?.properties || {}).slice(0, 4);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{definition?.display_name}</h1>
                    <p className="text-muted-foreground">{definition?.description}</p>
                </div>
                <Button asChild>
                    <Link href={`/front-section/instances/${params.defName}/new`}>
                        <Plus className="mr-2" /> New {definition?.display_name}
                    </Link>
                </Button>
            </div>

            {/* Filtros dinâmicos */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <DynamicFilters definition={definition} />
                </CardContent>
            </Card>

            {/* Tabela dinâmica */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {displayFields.map(field => (
                                <TableHead key={field}>
                                    {definition.schema.properties[field]?.title || field}
                                </TableHead>
                            ))}
                            <TableHead>State</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instances?.map(instance => (
                            <TableRow key={instance.id}>
                                {displayFields.map(field => (
                                    <TableCell key={field}>
                                        <CellRenderer
                                            value={instance.data[field]}
                                            field={definition.schema.properties[field]}
                                        />
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Badge variant={getStateVariant(instance.current_state)}>
                                        {instance.current_state}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/front-section/instances/${instance.id}`}>
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
```

#### Tela 3: Formulário de Criação (100% Dinâmico - A MAGIA!)

```tsx
// /front-section/instances/[defName]/new/page.tsx

export default function NewInstancePage({ params }: { params: { defName: string } }) {
    const { data: definition } = useObjectDefinition(params.defName);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação client-side (JSON Schema)
        const validationResult = validateAgainstSchema(definition.schema, formData);
        if (!validationResult.valid) {
            setErrors(validationResult.errors);
            return;
        }

        // Submit
        try {
            await createInstance(params.defName, formData);
            router.push(`/front-section/instances/${params.defName}`);
        } catch (error) {
            // Handle errors
        }
    };

    return (
        <div className="container max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                New {definition?.display_name}
            </h1>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-6">
                        <DynamicForm
                            schema={definition.schema}
                            uiHints={definition.ui_hints}
                            value={formData}
                            onChange={setFormData}
                            errors={errors}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Create {definition?.display_name}
                    </Button>
                </div>
            </form>
        </div>
    );
}
```

**Componente DynamicForm (O Motor de Renderização)**
```tsx
// components/instance/DynamicForm.tsx

interface DynamicFormProps {
    schema: JSONSchema;
    uiHints?: UIHints;
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    errors?: Record<string, string>;
}

export function DynamicForm({ schema, uiHints, value, onChange, errors }: DynamicFormProps) {
    const fields = Object.entries(schema.properties || {});
    const required = schema.required || [];

    return (
        <div className="space-y-6">
            {fields.map(([fieldName, fieldSchema]) => {
                const isRequired = required.includes(fieldName);
                const widget = uiHints?.widgets?.[fieldName] || inferWidget(fieldSchema);

                return (
                    <FormField
                        key={fieldName}
                        label={fieldSchema.title || fieldName}
                        required={isRequired}
                        error={errors?.[fieldName]}
                        description={fieldSchema.description}
                    >
                        <WidgetRenderer
                            widget={widget}
                            schema={fieldSchema}
                            value={value[fieldName]}
                            onChange={(newValue) => onChange({ ...value, [fieldName]: newValue })}
                        />
                    </FormField>
                );
            })}
        </div>
    );
}

function WidgetRenderer({ widget, schema, value, onChange }: WidgetRendererProps) {
    switch (widget) {
        case 'text':
            return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />;

        case 'masked-input':
            const mask = schema.format === 'cpf' ? '999.999.999-99' :
                         schema.format === 'phone' ? '(99) 99999-9999' : '';
            return <InputMask mask={mask} value={value} onChange={onChange} />;

        case 'currency':
            return <CurrencyInput value={value} onChange={onChange} />;

        case 'date-picker':
            return <DatePicker value={value} onChange={onChange} />;

        case 'select':
            return (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {schema.enum?.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case 'checkbox':
            return <Checkbox checked={value || false} onCheckedChange={onChange} />;

        case 'textarea':
            return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} />;

        case 'file-upload':
            return <FileUpload value={value} onChange={onChange} />;

        default:
            return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    }
}

function inferWidget(schema: JSONSchema): WidgetType {
    // Inferência automática baseada no schema
    if (schema.enum) return 'select';
    if (schema.type === 'boolean') return 'checkbox';
    if (schema.type === 'number' || schema.type === 'integer') return 'number';
    if (schema.format === 'date') return 'date-picker';
    if (schema.format === 'email') return 'text'; // com validação de email
    if (schema.format === 'uri') return 'text';
    if (schema.maxLength && schema.maxLength > 200) return 'textarea';

    return 'text'; // default
}
```

#### Tela 4: Detalhe da Instância + Relacionamentos

```tsx
// /front-section/instances/[id]/page.tsx

export default function InstanceDetailPage({ params }: { params: { id: string } }) {
    const { data: instance } = useInstance(params.id);
    const { data: relationships } = useInstanceRelationships(params.id);

    return (
        <div className="container max-w-6xl mx-auto p-6">
            {/* Header com ações */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        {instance?.data[instance.object_definition.ui_hints?.primary_field] || instance?.id}
                    </h1>
                    <p className="text-muted-foreground">
                        {instance?.object_definition.display_name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant={getStateVariant(instance?.current_state)}>
                        {instance?.current_state}
                    </Badge>
                    <InstanceActions instance={instance} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Coluna principal: Dados */}
                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                {Object.entries(instance?.data || {}).map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="text-sm font-medium text-muted-foreground mb-1">
                                            {instance.object_definition.schema.properties[key]?.title || key}
                                        </dt>
                                        <dd className="text-sm">
                                            <DataRenderer value={value} field={instance.object_definition.schema.properties[key]} />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Histórico de estados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>State History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Timeline>
                                {instance?.state_history?.map((transition, idx) => (
                                    <TimelineItem key={idx}>
                                        <TimelineIcon variant={transition.to === 'ACTIVE' ? 'success' : 'default'} />
                                        <TimelineContent>
                                            <p className="font-medium">
                                                {transition.from} → {transition.to}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {transition.reason}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transition.transitioned_at)}
                                            </p>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna lateral: Relacionamentos */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Relationships</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="outgoing">
                                <TabsList className="w-full">
                                    <TabsTrigger value="outgoing" className="flex-1">
                                        Outgoing ({relationships?.outgoing?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="incoming" className="flex-1">
                                        Incoming ({relationships?.incoming?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="outgoing" className="mt-4 space-y-3">
                                    {relationships?.outgoing?.map(rel => (
                                        <RelationshipCard key={rel.id} relationship={rel} direction="outgoing" />
                                    ))}
                                    {relationships?.outgoing?.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No outgoing relationships
                                        </p>
                                    )}
                                </TabsContent>

                                <TabsContent value="incoming" className="mt-4 space-y-3">
                                    {relationships?.incoming?.map(rel => (
                                        <RelationshipCard key={rel.id} relationship={rel} direction="incoming" />
                                    ))}
                                </TabsContent>
                            </Tabs>

                            <Button variant="outline" className="w-full mt-4" onClick={() => setShowCreateRelationship(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Relationship
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Visualização em grafo (miniatura) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Relationship Graph</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 bg-slate-50 rounded flex items-center justify-center">
                                <MiniRelationshipGraph instanceId={instance?.id} />
                            </div>
                            <Button variant="link" className="w-full mt-2" asChild>
                                <Link href={`/front-section/graph?center=${instance?.id}`}>
                                    View Full Graph →
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function RelationshipCard({ relationship, direction }: RelationshipCardProps) {
    const targetInstance = direction === 'outgoing' ? relationship.target : relationship.source;

    return (
        <Link href={`/front-section/instances/${targetInstance.id}`}>
            <Card className="hover:bg-accent cursor-pointer transition">
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                            {direction === 'outgoing' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {relationship.type}
                            </p>
                            <p className="font-medium truncate">
                                {targetInstance.display_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {targetInstance.object_type}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
```

#### Tela 5: Visualização em Grafo (React Flow)

```tsx
// /front-section/graph/page.tsx

import ReactFlow, { Node, Edge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphViewPage({ searchParams }: { searchParams: { center?: string } }) {
    const centerInstanceId = searchParams.center;
    const { data: graphData } = useGraphData(centerInstanceId);

    // Converter dados do backend para formato React Flow
    const nodes: Node[] = graphData?.instances?.map(inst => ({
        id: inst.id,
        type: 'customInstance',
        position: calculatePosition(inst), // Layout algorithm (ex: force-directed)
        data: {
            instance: inst,
            label: inst.display_name,
            type: inst.object_type
        }
    })) || [];

    const edges: Edge[] = graphData?.relationships?.map(rel => ({
        id: rel.id,
        source: rel.source_instance_id,
        target: rel.target_instance_id,
        label: rel.relationship_type,
        type: 'smoothstep',
        animated: false,
        data: { relationship: rel }
    })) || [];

    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={{
                    customInstance: InstanceNode
                }}
                fitView
                onNodeClick={(event, node) => {
                    router.push(`/front-section/instances/${node.id}`);
                }}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

function InstanceNode({ data }: { data: { instance: Instance } }) {
    const { instance } = data;

    return (
        <div className="px-4 py-3 bg-white border-2 border-primary rounded-lg shadow-lg min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-primary/10 rounded">
                    {getIconForObjectType(instance.object_type)}
                </div>
                <div className="font-semibold text-sm">{instance.display_name}</div>
            </div>
            <div className="text-xs text-muted-foreground">{instance.object_type}</div>
            <Badge variant="secondary" className="mt-2 text-xs">
                {instance.current_state}
            </Badge>
        </div>
    );
}
```

---

## PARTE 3: CRITÉRIOS DE SUCESSO DA FASE 1

### 3.1. Testes de Aceitação

#### Teste 1: Criar Objeto "Cliente PF" Manualmente
**Passos**:
1. Acessar Back Section → Definitions → New
2. Preencher:
   - Name: `cliente_pf`
   - Display Name: "Cliente Pessoa Física"
3. Adicionar campos:
   - `nome` (string, required)
   - `cpf` (string, required, validation: CPF)
   - `data_nascimento` (date, required)
   - `email` (string, validation: email)
4. Definir estados: DRAFT, ACTIVE, BLOCKED
5. Definir transições: DRAFT→ACTIVE (ação: "approve")
6. Salvar

**Resultado Esperado**:
✅ Definição criada com sucesso
✅ Aparece na lista de definições
✅ JSON Schema válido gerado automaticamente

#### Teste 2: Criar 10 Instâncias via UI
**Passos**:
1. Acessar Front Section → Instances → cliente_pf
2. Clicar "New Cliente Pessoa Física"
3. Preencher formulário (gerado dinamicamente):
   - Nome: João Silva
   - CPF: 12345678909
   - Data Nascimento: 01/01/1990
   - Email: joao@example.com
4. Submeter
5. Repetir para mais 9 clientes

**Resultado Esperado**:
✅ 10 instâncias criadas
✅ Validação de CPF funciona (rejeita CPF inválido)
✅ Todas em estado DRAFT

#### Teste 3: Criar Objeto "Conta" e Relacionamento
**Passos**:
1. Criar definição `conta_pagamento`:
   - Campos: `numero`, `saldo`, `limite`
2. Criar 3 instâncias de conta
3. No detalhe de "João Silva", criar relacionamento:
   - Tipo: POSSUI
   - Target: Conta #001
4. Visualizar no grafo

**Resultado Esperado**:
✅ Relacionamento criado
✅ Aparece em "Relationships" do João
✅ Visível no grafo (nó João → aresta POSSUI → nó Conta)

#### Teste 4: Transição de Estado
**Passos**:
1. Abrir detalhe de João Silva (estado: DRAFT)
2. Clicar "Approve"
3. Confirmar ação

**Resultado Esperado**:
✅ Estado muda para ACTIVE
✅ Histórico registra transição
✅ Badge atualiza na UI

### 3.2. Métricas de Performance

| Métrica | Target | Como Medir |
|:---|:---|:---|
| Tempo para criar novo object_definition | < 5 min | Teste manual cronometrado |
| Tempo de renderização de formulário dinâmico | < 500ms | Browser DevTools |
| Query de listagem de 1.000 instâncias | < 1s | Backend logs |
| Busca em JSONB (filtro por campo) | < 2s | PostgreSQL EXPLAIN |
| Navegação de grafo (2 níveis) | < 1s | Medição end-to-end |

### 3.3. Checklist de Conclusão da Fase 1

- [ ] **Backend**
  - [ ] API Universal implementada (todas os endpoints)
  - [ ] Validação JSON Schema funcional
  - [ ] Engine de FSM (transições de estado)
  - [ ] Índices GIN otimizados
  - [ ] Testes unitários (> 80% coverage)

- [ ] **Frontend**
  - [ ] Back Section: Editor de definições (wizard 4 steps)
  - [ ] Front Section: Renderizador dinâmico de formulários
  - [ ] Front Section: Lista de instâncias (paginada)
  - [ ] Front Section: Detalhe + Relacionamentos
  - [ ] Visualização em grafo (React Flow)

- [ ] **Infraestrutura**
  - [ ] PostgreSQL com PgVector instalado
  - [ ] NebulaGraph configurado
  - [ ] Apache Pulsar rodando (local)
  - [ ] Kubernetes local (kind/minikube)

- [ ] **Testes**
  - [ ] 4 testes de aceitação passam
  - [ ] Performance dentro dos targets
  - [ ] Zero tabelas hardcoded (validado)

---

## PRÓXIMOS PASSOS

**Se esta especificação for aprovada**:

1. **Semana 1-2**: Setup de infraestrutura
   - PostgreSQL, NebulaGraph, Pulsar, K8s local
   - Repositórios Git, CI/CD básico

2. **Semana 3-6**: Backend (API Universal)
   - Implementar endpoints de definitions
   - Implementar endpoints de instances
   - Engine de validação JSON Schema
   - Testes unitários

3. **Semana 7-10**: Frontend (Back Section)
   - Editor de definições (wizard)
   - State machine editor
   - Schema editor visual

4. **Semana 11-12**: Frontend (Front Section)
   - Renderizador dinâmico
   - Lista de instâncias
   - Detalhe + Relacionamentos
   - Visualização em grafo

**Documento pronto para "Think Harder" session!** 🧠

Quais aspectos deseja aprofundar:
1. **UX do editor de schemas** (como torná-lo intuitivo para não-técnicos?)
2. **Performance de JSONB** (índices, queries otimizadas?)
3. **Gestão de relacionamentos** (como evitar ciclos, validações?)
4. **Outro aspecto crítico?**

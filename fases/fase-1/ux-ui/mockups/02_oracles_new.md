# 🆕 Mockup 02: `/oracles/new` - Criar Novo Oráculo

**Versão**: 1.0.0
**Data**: 2025-12-28
**Sprint**: Sprint 1 - Fundação (Epic 1.2)
**Prioridade**: High
**Story Points**: 4 SP
**Estimativa**: 4h

---

## 📋 Overview

Formulário completo para criação de um novo Oráculo no SuperCore v2.0. Inclui validação em tempo real, preview de configurações, e criação com redirecionamento para próxima ação.

### Requisitos Relacionados
- **RF001-F**: Criar Solução (agregador de oráculos)
- **RF001**: Criar Oráculo via API REST (dentro de uma solução)
- **RF003**: Gerenciar Ciclo de Vida de Oráculos
- **RF015**: Configuração de Oráculos (nome, tipo, domínio)

### User Story
> **Como** administrador do sistema
> **Quero** criar um novo Oráculo através de formulário intuitivo
> **Para que** eu possa definir domínios de conhecimento especializados

---

## 🎨 Layout Visual (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ [← Voltar] Criar Novo Oráculo                      [?] [User ▾] │   │
│ └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Breadcrumb                                                              │
│ [🏢 Soluções] > [🏦 LBPAY Core Banking] > [🔮 Oráculos] > Criar Novo  │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Formulário (Left Column - 60%)                                  │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Informações Básicas                                          ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ Solução *                                                       │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [🏦 LBPAY Core Banking                                   ▾]│ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Oráculo será criado dentro desta solução                   │   │
│ │                                                                  │   │
│ │ Nome do Oráculo *                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ Oráculo de Compliance Bancário                             │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Nome único e descritivo (3-100 caracteres)                  │   │
│ │                                                                  │   │
│ │ Tipo de Oráculo *                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [⚙️ Middleware      ▾]                                      │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ Opções: Middleware, Portal Web, MCP Server                     │   │
│ │ ℹ️ Tipo define como o Oráculo será consumido/integrado        │   │
│ │                                                                  │   │
│ │ Tags *                                                          │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [#Core Banking] [#PIX Rules] [#Compliance]             + │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Adicione tags para classificação (ex: #Core Banking)       │   │
│ │ Tags permitem espaços (ex: #Dict Rules)                       │   │
│ │                                                                  │   │
│ │ Descrição                                                       │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ Oráculo especializado em processamento de transações PIX,  │ │   │
│ │ │ validação de regras BACEN, integração com DICT e análise   │ │   │
│ │ │ de conformidade regulatória para pagamentos instantâneos...│ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ 142/500 caracteres                                             │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Configurações Avançadas (Toggle - Expandido)                ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ Provedor de LLM *                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [OpenAI - GPT-4 Turbo                 ▾]                   │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Selecione de provedores pré-configurados em Configurações  │   │
│ │ Opções: OpenAI - GPT-4 Turbo, Anthropic - Claude 3 Opus,      │   │
│ │         Ollama - Llama 2, LocalAI - Mistral 7B                │   │
│ │                                                                  │   │
│ │ Temperatura (Criatividade)                                      │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 0.0 ●───────────────────────────────────────────── 1.0      │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ Valor atual: 0.7 (Balanceado)                                  │   │
│ │ ℹ️ 0.0 = Preciso e consistente | 1.0 = Criativo e variado     │   │
│ │                                                                  │   │
│ │ Max Tokens (Resposta)                                           │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [2000                                 ]                    │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Máximo de tokens por resposta (500-4000)                   │   │
│ │                                                                  │   │
│ │ Estratégia RAG                                                  │   │
│ │ ☑ SQL (PostgreSQL)     - Consultas estruturadas                │   │
│ │ ☑ Graph (NebulaGraph) - Relações e dependências                │   │
│ │ ☑ Vector (pgvector)   - Busca semântica                        │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Ações                                                        ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ [Cancelar]                      [✓ Criar Oráculo]              │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Preview (Right Column - 40%)                                           │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ 👁️ Preview do Oráculo                                           │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 📊 Oráculo de Compliance Bancário                          │ │   │
│ │ │                                                             │ │   │
│ │ │ Solução: 🏦 LBPAY Core Banking                            │ │   │
│ │ │ Tipo: Middleware                                           │ │   │
│ │ │ Status: ⚪ Rascunho                                        │ │   │
│ │ │                                                             │ │   │
│ │ │ Tags:                                                      │ │   │
│ │ │ [#Core Banking] [#PIX Rules] [#Compliance]                │ │   │
│ │ │                                                             │ │   │
│ │ │ Descrição:                                                 │ │   │
│ │ │ Oráculo especializado em processamento de transações...   │ │   │
│ │ │                                                             │ │   │
│ │ │ ────────────────────────────────────────────────────       │ │   │
│ │ │                                                             │ │   │
│ │ │ Configurações:                                             │ │   │
│ │ │ • Provedor: OpenAI - GPT-4 Turbo                           │ │   │
│ │ │ • Temperatura: 0.7                                         │ │   │
│ │ │ • Max Tokens: 2000                                         │ │   │
│ │ │ • RAG: SQL + Graph + Vector                                │ │   │
│ │ │                                                             │ │   │
│ │ │ Criado em: 28/12/2025 14:32 (Preview)                     │ │   │
│ │ │ Documentos: 0                                              │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ℹ️ Este é um preview de como seu Oráculo aparecerá após a      │   │
│ │    criação. As informações serão atualizadas em tempo real.    │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes da Interface

### 1. Header (Sticky)
**Componente**: `<Header>` customizado

```typescript
interface HeaderProps {
  showBackButton?: boolean
  title: string
  actions?: React.ReactNode
}

<Header
  showBackButton={true}
  title="Criar Novo Oráculo"
  actions={
    <>
      <Button variant="ghost" size="sm">
        <HelpCircle className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Admin
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </>
  }
/>
```

**Acessibilidade**:
- `role="banner"`
- `aria-label="Navigation header"`
- Botão "Voltar" com `aria-label="Voltar para listagem de oráculos"`

---

### 2. Breadcrumb
**Componente**: shadcn/ui `<Breadcrumb>`

```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/solucoes">🏢 Soluções</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href={`/solucoes/${solution.slug}`}>
        {solution.icon} {solution.name}
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href={`/solucoes/${solution.slug}/oracles`}>
        🔮 Oráculos
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Criar Novo</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### 3. Formulário - Informações Básicas

#### 3.1. Solução (Parent)
**Componente**: shadcn/ui `<Select>`

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Solution {
  id: string;
  name: string;
  slug: string;
  icon: string;
  status: 'active' | 'testing' | 'inactive';
}

// Fetched from GET /api/v1/solutions?status=active,testing
const activeSolutions: Solution[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'LBPAY Core Banking',
    slug: 'lbpay-core-banking',
    icon: '🏦',
    status: 'active',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'SuperCommerce Retail',
    slug: 'supercommerce-retail',
    icon: '🛒',
    status: 'testing',
  },
]

<div className="space-y-2">
  <Label htmlFor="solution">
    Solução <span className="text-error-600">*</span>
  </Label>
  <Select
    value={formData.solutionId}
    onValueChange={(value) => handleFieldChange('solutionId', value)}
    disabled={!!solutionIdFromUrl} // Pre-filled from URL, read-only
  >
    <SelectTrigger
      id="solution"
      aria-required="true"
      aria-describedby="solution-help"
    >
      <SelectValue placeholder="Selecione a solução" />
    </SelectTrigger>
    <SelectContent>
      {activeSolutions.map((solution) => (
        <SelectItem key={solution.id} value={solution.id}>
          <div className="flex items-center gap-2">
            <span>{solution.icon}</span>
            <span>{solution.name}</span>
            {solution.status === 'testing' && (
              <Badge variant="outline" className="text-xs ml-2">Teste</Badge>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p id="solution-help" className="text-sm text-neutral-500">
    ℹ️ Oráculo será criado dentro desta solução
  </p>
  {errors.solutionId && (
    <p className="text-sm text-error-600" role="alert">
      {errors.solutionId}
    </p>
  )}
</div>
```

**Validação**:
- ✅ Obrigatório (`required`)
- ✅ Deve ser UUID válido
- ✅ Deve referenciar solução existente e ativa/testing

**Mensagens de Erro**:
- "Solução é obrigatória"
- "Solução inválida"
- "Solução não encontrada ou inativa"

**Comportamento de URL**:
```typescript
// Se navegou via /solucoes/{slug}/oracles/new?solutionId=xxx
// Pre-fill solutionId e deixar read-only
const searchParams = useSearchParams()
const solutionIdFromUrl = searchParams.get('solutionId')

useEffect(() => {
  if (solutionIdFromUrl) {
    handleFieldChange('solutionId', solutionIdFromUrl)
  }
}, [solutionIdFromUrl])
```

**Rotas de Navegação**:
- De listagem global: `/oracles/new` → Dropdown habilitado, todas soluções
- De solução específica: `/solucoes/{slug}/oracles/new?solutionId={id}` → Dropdown disabled, pré-selecionado

---

#### 3.2. Nome do Oráculo
**Componente**: shadcn/ui `<Input>`

```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="oracle-name">
    Nome do Oráculo <span className="text-error-600">*</span>
  </Label>
  <Input
    id="oracle-name"
    type="text"
    placeholder="Ex: Oráculo de Compliance Bancário"
    value={formData.name}
    onChange={(e) => handleFieldChange('name', e.target.value)}
    aria-required="true"
    aria-describedby="oracle-name-help oracle-name-error"
    className={cn(
      errors.name && "border-error-600 focus-visible:ring-error-600"
    )}
  />
  {!errors.name && (
    <p id="oracle-name-help" className="text-sm text-neutral-500">
      ℹ️ Nome único e descritivo (3-100 caracteres)
    </p>
  )}
  {errors.name && (
    <p id="oracle-name-error" className="text-sm text-error-600" role="alert">
      {errors.name}
    </p>
  )}
</div>
```

**Validação**:
- ✅ Obrigatório (`required`)
- ✅ Mínimo: 3 caracteres
- ✅ Máximo: 100 caracteres
- ✅ Sem caracteres especiais (exceto: `-`, `_`, espaço)
- ✅ Unicidade verificada via API debounced (300ms)

**Mensagens de Erro**:
- "Nome é obrigatório"
- "Nome deve ter pelo menos 3 caracteres"
- "Nome deve ter no máximo 100 caracteres"
- "Nome já existe. Escolha um nome único."
- "Nome contém caracteres inválidos"

---

#### 3.3. Tipo de Oráculo
**Componente**: shadcn/ui `<Select>`

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ORACLE_TYPES = [
  { value: 'financial', label: '📊 Financeiro', icon: TrendingUp },
  { value: 'compliance', label: '⚖️ Compliance', icon: Shield },
  { value: 'risk', label: '⚠️ Risco', icon: AlertTriangle },
  { value: 'operational', label: '⚙️ Operacional', icon: Cog },
  { value: 'general', label: '🔧 Geral', icon: Settings },
]

<div className="space-y-2">
  <Label htmlFor="oracle-type">
    Tipo de Oráculo <span className="text-error-600">*</span>
  </Label>
  <Select
    value={formData.type}
    onValueChange={(value) => handleFieldChange('type', value)}
  >
    <SelectTrigger id="oracle-type" aria-required="true">
      <SelectValue placeholder="Selecione o tipo" />
    </SelectTrigger>
    <SelectContent>
      {ORACLE_TYPES.map((type) => (
        <SelectItem key={type.value} value={type.value}>
          <div className="flex items-center gap-2">
            <type.icon className="h-4 w-4" />
            {type.label}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {errors.type && (
    <p className="text-sm text-error-600" role="alert">
      {errors.type}
    </p>
  )}
</div>
```

---

#### 3.4. Domínio de Conhecimento
**Componente**: shadcn/ui `<Textarea>`

```typescript
import { Textarea } from "@/components/ui/textarea"

<div className="space-y-2">
  <Label htmlFor="oracle-domain">
    Domínio de Conhecimento <span className="text-error-600">*</span>
  </Label>
  <Textarea
    id="oracle-domain"
    placeholder="Ex: Regulamentações bancárias brasileiras, análise de risco de crédito, compliance anti-lavagem de dinheiro..."
    value={formData.domain}
    onChange={(e) => handleFieldChange('domain', e.target.value)}
    rows={4}
    maxLength={2000}
    aria-required="true"
    aria-describedby="oracle-domain-help oracle-domain-count"
    className={cn(
      errors.domain && "border-error-600 focus-visible:ring-error-600"
    )}
  />
  {!errors.domain && (
    <p id="oracle-domain-help" className="text-sm text-neutral-500">
      ℹ️ Descreva o escopo de conhecimento (min. 20 caracteres)
    </p>
  )}
  <p id="oracle-domain-count" className="text-sm text-neutral-500 text-right">
    {formData.domain.length}/2000 caracteres
  </p>
  {errors.domain && (
    <p className="text-sm text-error-600" role="alert">
      {errors.domain}
    </p>
  )}
</div>
```

**Validação**:
- ✅ Obrigatório
- ✅ Mínimo: 20 caracteres
- ✅ Máximo: 2000 caracteres

---

#### 3.5. Descrição (Opcional)
**Componente**: shadcn/ui `<Textarea>`

```typescript
<div className="space-y-2">
  <Label htmlFor="oracle-description">Descrição</Label>
  <Textarea
    id="oracle-description"
    placeholder="Descrição adicional sobre o propósito e funcionalidades deste Oráculo..."
    value={formData.description}
    onChange={(e) => handleFieldChange('description', e.target.value)}
    rows={3}
    maxLength={500}
    aria-describedby="oracle-description-count"
  />
  <p id="oracle-description-count" className="text-sm text-neutral-500 text-right">
    {formData.description.length}/500 caracteres
  </p>
</div>
```

---

### 4. Configurações Avançadas (Collapsible)

**Componente**: shadcn/ui `<Collapsible>`

```typescript
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

<Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="outline" className="w-full justify-between">
      <span className="font-medium">Configurações Avançadas</span>
      {isAdvancedOpen ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-4 pt-4">
    {/* Advanced settings content */}
  </CollapsibleContent>
</Collapsible>
```

#### 4.1. Modelo de Linguagem
**Componente**: shadcn/ui `<Select>`

```typescript
const LLM_MODELS = [
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Mais rápido e econômico' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Máxima qualidade' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Rápido e eficiente' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Alta qualidade' },
]

<Select
  value={formData.llmModel}
  onValueChange={(value) => handleFieldChange('llmModel', value)}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {LLM_MODELS.map((model) => (
      <SelectItem key={model.value} value={model.value}>
        <div className="flex flex-col">
          <span className="font-medium">{model.label}</span>
          <span className="text-xs text-neutral-500">{model.description}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Default**: `gpt-4-turbo`

---

#### 4.2. Temperatura (Slider)
**Componente**: shadcn/ui `<Slider>`

```typescript
import { Slider } from "@/components/ui/slider"

<div className="space-y-2">
  <Label htmlFor="temperature">
    Temperatura (Criatividade)
  </Label>
  <Slider
    id="temperature"
    min={0}
    max={1}
    step={0.1}
    value={[formData.temperature]}
    onValueChange={(value) => handleFieldChange('temperature', value[0])}
    aria-valuemin={0}
    aria-valuemax={1}
    aria-valuenow={formData.temperature}
    aria-label="Temperatura do modelo"
  />
  <div className="flex justify-between text-sm text-neutral-500">
    <span>Preciso (0.0)</span>
    <span className="font-medium">Valor atual: {formData.temperature.toFixed(1)}</span>
    <span>Criativo (1.0)</span>
  </div>
  <p className="text-sm text-neutral-500">
    ℹ️ 0.0 = Preciso e consistente | 1.0 = Criativo e variado
  </p>
</div>
```

**Default**: `0.7`
**Range**: `0.0` - `1.0`
**Step**: `0.1`

---

#### 4.3. Max Tokens
**Componente**: shadcn/ui `<Input>` (type="number")

```typescript
<div className="space-y-2">
  <Label htmlFor="max-tokens">Max Tokens (Resposta)</Label>
  <Input
    id="max-tokens"
    type="number"
    min={500}
    max={4000}
    step={100}
    value={formData.maxTokens}
    onChange={(e) => handleFieldChange('maxTokens', parseInt(e.target.value))}
    aria-describedby="max-tokens-help"
  />
  <p id="max-tokens-help" className="text-sm text-neutral-500">
    ℹ️ Máximo de tokens por resposta (500-4000)
  </p>
</div>
```

**Default**: `2000`
**Range**: `500` - `4000`

---

#### 4.4. Estratégia RAG (Checkboxes)
**Componente**: shadcn/ui `<Checkbox>`

```typescript
import { Checkbox } from "@/components/ui/checkbox"

const RAG_STRATEGIES = [
  {
    id: 'sql',
    label: 'SQL (PostgreSQL)',
    description: 'Consultas estruturadas',
    icon: Database
  },
  {
    id: 'graph',
    label: 'Graph (NebulaGraph)',
    description: 'Relações e dependências',
    icon: Network
  },
  {
    id: 'vector',
    label: 'Vector (pgvector)',
    description: 'Busca semântica',
    icon: Search
  },
]

<div className="space-y-3">
  <Label>Estratégia RAG</Label>
  {RAG_STRATEGIES.map((strategy) => (
    <div key={strategy.id} className="flex items-start space-x-3">
      <Checkbox
        id={`rag-${strategy.id}`}
        checked={formData.ragStrategies.includes(strategy.id)}
        onCheckedChange={(checked) => {
          const newStrategies = checked
            ? [...formData.ragStrategies, strategy.id]
            : formData.ragStrategies.filter((s) => s !== strategy.id)
          handleFieldChange('ragStrategies', newStrategies)
        }}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={`rag-${strategy.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          <strategy.icon className="inline h-4 w-4 mr-2" />
          {strategy.label}
        </label>
        <p className="text-sm text-neutral-500">
          {strategy.description}
        </p>
      </div>
    </div>
  ))}
</div>
```

**Default**: Todas selecionadas (`['sql', 'graph', 'vector']`)

---

### 5. Preview (Right Column)

**Componente**: `<Card>` customizado

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="sticky top-20">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Eye className="h-5 w-5" />
      Preview do Oráculo
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Oracle Card Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOracleTypeIcon(formData.type)}
            {formData.name || 'Novo Oráculo'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.solutionId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Solução:</span>
              <span className="text-sm font-medium">
                {getSolutionById(formData.solutionId)?.icon}{' '}
                {getSolutionById(formData.solutionId)?.name || 'Não encontrada'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Tipo:</span>
            <Badge variant="outline">
              {getOracleTypeLabel(formData.type) || 'Não definido'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Status:</span>
            <Badge variant="secondary">
              <Circle className="h-3 w-3 mr-1 fill-neutral-400" />
              Rascunho
            </Badge>
          </div>

          {formData.domain && (
            <div>
              <p className="text-sm font-medium mb-1">Domínio:</p>
              <p className="text-sm text-neutral-600">
                {formData.domain.slice(0, 150)}
                {formData.domain.length > 150 && '...'}
              </p>
            </div>
          )}

          {formData.description && (
            <div>
              <p className="text-sm font-medium mb-1">Descrição:</p>
              <p className="text-sm text-neutral-600">
                {formData.description.slice(0, 100)}
                {formData.description.length > 100 && '...'}
              </p>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Configurações:</p>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Modelo: {getLLMModelLabel(formData.llmModel)}</li>
              <li>• Temperatura: {formData.temperature.toFixed(1)}</li>
              <li>• Max Tokens: {formData.maxTokens}</li>
              <li>
                • RAG: {formData.ragStrategies.map(s => s.toUpperCase()).join(' + ') || 'Nenhuma'}
              </li>
            </ul>
          </div>

          <Separator />

          <div className="text-xs text-neutral-500 space-y-1">
            <p>Criado em: {format(new Date(), "dd/MM/yyyy HH:mm")} (Preview)</p>
            <p>Documentos: 0</p>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <p className="text-sm text-neutral-500 italic">
        ℹ️ Este é um preview de como seu Oráculo aparecerá após a criação.
        As informações serão atualizadas em tempo real.
      </p>
    </div>
  </CardContent>
</Card>
```

**Comportamento**:
- Atualização em tempo real (debounced 200ms)
- Sticky positioning (`sticky top-20`)
- Mostra valores default quando campos vazios

---

### 6. Ações (Footer)

**Componente**: shadcn/ui `<Button>`

```typescript
<div className="flex items-center justify-between pt-6 border-t">
  <Button
    type="button"
    variant="outline"
    onClick={handleCancel}
    disabled={isSubmitting}
  >
    Cancelar
  </Button>

  <Button
    type="submit"
    onClick={handleSubmit}
    disabled={!isFormValid || isSubmitting}
    className="min-w-[160px]"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Criando...
      </>
    ) : (
      <>
        <Check className="mr-2 h-4 w-4" />
        Criar Oráculo
      </>
    )}
  </Button>
</div>
```

**Estados**:
- Disabled se form inválido
- Loading state durante submissão
- Confirmação de cancelamento se houver mudanças

---

## 🔄 Interações e Comportamentos

### 1. Validação em Tempo Real

**Debounced Validation** (300ms):
```typescript
import { useDebouncedCallback } from 'use-debounce'

const validateName = useDebouncedCallback(async (name: string) => {
  if (name.length < 3) {
    setErrors(prev => ({ ...prev, name: 'Nome deve ter pelo menos 3 caracteres' }))
    return
  }

  // Check uniqueness via API
  try {
    const response = await fetch(`/api/v1/oracles/check-name?name=${encodeURIComponent(name)}`)
    const { exists } = await response.json()

    if (exists) {
      setErrors(prev => ({ ...prev, name: 'Nome já existe. Escolha um nome único.' }))
    } else {
      setErrors(prev => ({ ...prev, name: undefined }))
    }
  } catch (error) {
    console.error('Error checking name uniqueness:', error)
  }
}, 300)

const handleFieldChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }))

  if (field === 'name') {
    validateName(value)
  }
}
```

---

### 2. Preview Auto-Update

**Real-time Preview Update**:
```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const debouncedFormData = useDebouncedValue(formData, 200)

useEffect(() => {
  // Update preview based on debounced form data
  updatePreview(debouncedFormData)
}, [debouncedFormData])
```

---

### 3. Form Submission

**API Call**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Final validation
  const validationErrors = validateForm(formData)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    toast({
      title: "Erro de Validação",
      description: "Corrija os erros no formulário antes de continuar.",
      variant: "destructive",
    })
    return
  }

  setIsSubmitting(true)

  try {
    const response = await fetch('/api/v1/oracles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        solution_id: formData.solutionId,
        name: formData.name,
        type: formData.type,
        domain: formData.domain,
        description: formData.description,
        config: {
          llm_model: formData.llmModel,
          temperature: formData.temperature,
          max_tokens: formData.maxTokens,
          rag_strategies: formData.ragStrategies,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao criar oráculo')
    }

    const oracle = await response.json()

    toast({
      title: "Oráculo Criado",
      description: `${oracle.name} foi criado com sucesso!`,
    })

    // Redirect to next action
    showNextActionDialog(oracle.id)

  } catch (error) {
    console.error('Error creating oracle:', error)
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : 'Erro ao criar oráculo',
      variant: "destructive",
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### 4. Next Action Dialog (After Creation)

**Componente**: shadcn/ui `<AlertDialog>`

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

<AlertDialog open={showNextAction} onOpenChange={setShowNextAction}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success-600" />
        Oráculo Criado com Sucesso!
      </AlertDialogTitle>
      <AlertDialogDescription>
        O que você gostaria de fazer agora?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="space-y-2 py-4">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push(`/oracles/${newOracleId}/knowledge`)}
      >
        <Upload className="mr-2 h-4 w-4" />
        Fazer upload de documentos
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push(`/oracles/${newOracleId}/chat`)}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Começar a conversar com o Oráculo
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push(`/oracles/${newOracleId}`)}
      >
        <Eye className="mr-2 h-4 w-4" />
        Ver detalhes do Oráculo
      </Button>
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => router.push('/oracles')}>
        Voltar para Listagem
      </AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 5. Cancel Confirmation

**Confirmação ao Cancelar** (se houver mudanças):
```typescript
const handleCancel = () => {
  if (hasUnsavedChanges) {
    if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
      router.push('/oracles')
    }
  } else {
    router.push('/oracles')
  }
}
```

---

## 🎨 Estados da Interface

### 1. Estado Inicial (Empty)
- Todos os campos vazios
- Preview mostra placeholder
- Botão "Criar Oráculo" disabled

### 2. Estado Preenchendo (Filling)
- Validação em tempo real
- Preview atualiza conforme digitação
- Erros aparecem abaixo dos campos

### 3. Estado Validando (Validating)
- Debounced validation ativa
- Indicador de "Verificando disponibilidade do nome..."
- Preview continua atualizando

### 4. Estado Válido (Valid)
- Todos os campos validados
- Sem erros visíveis
- Botão "Criar Oráculo" enabled

### 5. Estado Submitting (Submitting)
- Botão mostra "Criando..." com spinner
- Formulário disabled
- Preview permanece visível

### 6. Estado Success (Success)
- Dialog de próxima ação aparece
- Opções: Upload docs, Chat, Ver detalhes, Voltar

### 7. Estado Error (Error)
- Toast de erro aparece
- Formulário volta ao estado editável
- Erros destacados nos campos problemáticos

---

## ♿ Acessibilidade (WCAG 2.1 AA)

### 1. Semântica HTML
```html
<form role="form" aria-labelledby="form-title">
  <h1 id="form-title">Criar Novo Oráculo</h1>
  <!-- ... -->
</form>
```

### 2. Labels e Descriptions
- Todos os inputs têm `<Label>` associado
- Campos obrigatórios marcados com `aria-required="true"`
- Help text vinculado com `aria-describedby`
- Erros anunciados com `role="alert"`

### 3. Navegação por Teclado
**Tab Order**:
1. Botão "Voltar"
2. Solução (se não disabled)
3. Nome do Oráculo
4. Tipo de Oráculo
5. Domínio de Conhecimento
6. Descrição
7. Toggle "Configurações Avançadas"
8. (Se expandido) Modelo de Linguagem
9. (Se expandido) Temperatura
10. (Se expandido) Max Tokens
11. (Se expandido) Checkboxes RAG
12. Botão "Cancelar"
13. Botão "Criar Oráculo"

**Atalhos de Teclado**:
- `Enter` no último campo → Submit form
- `Esc` → Fechar dialog (se aberto) ou confirmar cancelamento
- `Ctrl/Cmd + Enter` → Submit form (de qualquer campo)

### 4. Feedback Visual e Auditivo
- Erros têm ícone vermelho + cor vermelha (4.5:1 contrast)
- Success tem ícone verde + cor verde
- Screen reader anuncia mudanças de estado

### 5. Focus Visible
```css
.focus-visible\:ring-2 {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
}
```

---

## 📱 Responsividade

### Breakpoints

#### Desktop (≥1024px)
- Layout 2 colunas (60% form, 40% preview)
- Preview sticky no scroll

#### Tablet (768px - 1023px)
- Layout 2 colunas (55% form, 45% preview)
- Preview sticky no scroll

#### Mobile (<768px)
- Layout 1 coluna (stacked)
- Preview aparece abaixo do formulário
- Preview não sticky

**Implementação**:
```typescript
<div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
  {/* Form Column */}
  <div className="space-y-6">
    {/* ... */}
  </div>

  {/* Preview Column */}
  <div className="lg:sticky lg:top-20 lg:self-start">
    {/* ... */}
  </div>
</div>
```

---

## 🧪 Casos de Teste

### Teste 1: Pré-preenchimento de Solução via URL
**Given**: Usuário navega de `/solucoes/lbpay-core-banking/oracles/new?solutionId=550e8400-e29b-41d4-a716-446655440001`
**When**: Formulário carrega
**Then**: Campo "Solução" mostra "🏦 LBPAY Core Banking" e está disabled

### Teste 2: Seleção Manual de Solução
**Given**: Usuário navega para `/oracles/new` (sem parâmetro solutionId)
**When**: Formulário carrega
**Then**: Campo "Solução" está vazio e habilitado
**And**: Dropdown mostra apenas soluções com status 'active' ou 'testing'

### Teste 3: Validação de Solução Obrigatória
**Given**: Formulário sem solução selecionada
**When**: Usuário tenta submeter
**Then**: Erro "Solução é obrigatória" aparece

### Teste 4: Validação de Nome
**Given**: Formulário vazio
**When**: Usuário digita "AB" no campo Nome
**Then**: Erro "Nome deve ter pelo menos 3 caracteres" aparece

### Teste 5: Nome Duplicado
**Given**: Nome "Oráculo Financeiro" já existe no sistema
**When**: Usuário digita "Oráculo Financeiro"
**Then**: Erro "Nome já existe. Escolha um nome único." aparece após 300ms

### Teste 6: Validação de Domínio
**Given**: Campo Domínio com 15 caracteres
**When**: Usuário tenta submeter
**Then**: Erro "Domínio deve ter pelo menos 20 caracteres" aparece

### Teste 7: Preview em Tempo Real
**Given**: Formulário vazio
**When**: Usuário preenche Solução = "LBPAY Core Banking", Nome = "Oracle A", Tipo = "Financeiro"
**Then**: Preview atualiza em <200ms mostrando "🏦 LBPAY Core Banking" e "📊 Oracle A" e badge "Financeiro"

### Teste 8: Configurações Avançadas Collapsed
**Given**: Formulário aberto
**When**: Estado inicial
**Then**: Seção "Configurações Avançadas" está colapsada

### Teste 9: Sucesso na Criação
**Given**: Formulário válido preenchido (incluindo Solução)
**When**: Usuário clica "Criar Oráculo"
**Then**: API POST retorna 201 com solution_id no payload, toast de sucesso aparece, dialog de próxima ação abre

### Teste 10: Erro na Criação
**Given**: Formulário válido preenchido
**When**: API retorna 500 Internal Server Error
**Then**: Toast de erro aparece com mensagem "Erro ao criar oráculo"

### Teste 11: Cancelamento com Mudanças
**Given**: Formulário com campos preenchidos (unsaved changes)
**When**: Usuário clica "Cancelar"
**Then**: Dialog de confirmação aparece "Você tem alterações não salvas..."

### Teste 12: Next Action - Upload
**Given**: Oráculo criado com sucesso
**When**: Usuário clica "Fazer upload de documentos" no dialog
**Then**: Redireciona para `/oracles/{id}/knowledge`

### Teste 13: Navegação por Teclado
**Given**: Formulário aberto
**When**: Usuário pressiona Tab sequencialmente
**Then**: Focus move em ordem lógica (Nome → Tipo → Domínio → ...)

---

## 🔗 Integrações

### API Endpoint: POST `/api/v1/oracles`

**Request Body**:
```json
{
  "solution_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Oráculo de Compliance Bancário",
  "type": "financial",
  "domain": "Regulamentações bancárias brasileiras (BACEN, CMN), políticas anti-lavagem de dinheiro (AML), análise de transações suspeitas, e conformidade regulatória...",
  "description": "Este Oráculo especializa-se em compliance bancário, incluindo análise de transações, detecção de padrões suspeitos, e conformidade com regulamentações do BACEN.",
  "config": {
    "llm_model": "gpt-4-turbo",
    "temperature": 0.7,
    "max_tokens": 2000,
    "rag_strategies": ["sql", "graph", "vector"]
  }
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "solution_id": "550e8400-e29b-41d4-a716-446655440001",
  "solution": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "LBPAY Core Banking",
    "slug": "lbpay-core-banking",
    "icon": "🏦"
  },
  "name": "Oráculo de Compliance Bancário",
  "type": "financial",
  "domain": "Regulamentações bancárias brasileiras...",
  "description": "Este Oráculo especializa-se...",
  "status": "active",
  "config": {
    "llm_model": "gpt-4-turbo",
    "temperature": 0.7,
    "max_tokens": 2000,
    "rag_strategies": ["sql", "graph", "vector"]
  },
  "created_at": "2025-12-28T14:32:15Z",
  "updated_at": "2025-12-28T14:32:15Z",
  "document_count": 0
}
```

**Error Response (400 Bad Request)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nome já existe no sistema",
    "field": "name"
  }
}
```

---

### API Endpoint: GET `/api/v1/oracles/check-name`

**Query Parameters**:
- `name` (string, required): Nome a ser verificado

**Response (200 OK)**:
```json
{
  "exists": true
}
```

---

## 📦 Dependências de Componentes

### shadcn/ui Components
- `<Input>` - Campo de texto
- `<Textarea>` - Campo de texto multilinha
- `<Select>` - Dropdown
- `<Checkbox>` - Checkbox
- `<Slider>` - Slider
- `<Button>` - Botão
- `<Label>` - Label
- `<Card>` - Card container
- `<Breadcrumb>` - Navegação breadcrumb
- `<Collapsible>` - Seção colapsável
- `<AlertDialog>` - Dialog de confirmação
- `<Badge>` - Badge de status
- `<Separator>` - Divisor visual

### Lucide React Icons
- `ArrowLeft` - Voltar
- `HelpCircle` - Ajuda
- `User` - Usuário
- `ChevronDown` / `ChevronUp` - Setas
- `Database` - SQL
- `Network` - Graph
- `Search` - Vector
- `Check` - Sucesso
- `Loader2` - Loading
- `Eye` - Preview
- `Circle` - Status
- `Upload` - Upload
- `MessageSquare` - Chat
- `CheckCircle2` - Sucesso

### React Hooks Customizados
- `useDebouncedCallback` - Debounce validation
- `useDebouncedValue` - Debounce preview update
- `useToast` - Toast notifications

---

## 🎯 Critérios de Aceitação

- [x] Formulário com 5 campos obrigatórios (Solução, Nome, Tipo, Domínio) + 1 opcional (Descrição)
- [x] Campo Solução: dropdown com soluções ativas/testing apenas
- [x] Campo Solução: pré-preenchido quando navegando de `/solucoes/{slug}/oracles/new`
- [x] Campo Solução: read-only quando pré-preenchido via URL
- [x] Campo Solução: mostra emoji + nome da solução
- [x] Validação em tempo real com debounce (300ms)
- [x] Verificação de unicidade de nome via API
- [x] Seção "Configurações Avançadas" colapsável
- [x] Preview em tempo real do Oráculo (atualização <200ms)
- [x] Preview sticky no scroll (desktop)
- [x] Mensagens de erro específicas para cada validação
- [x] Dialog de próxima ação após criação bem-sucedida
- [x] 3 opções pós-criação: Upload docs, Chat, Ver detalhes
- [x] Confirmação ao cancelar se houver mudanças não salvas
- [x] Navegação por teclado completa (Tab order lógico)
- [x] Atalhos de teclado: Enter (submit), Esc (cancel), Ctrl+Enter (submit)
- [x] WCAG 2.1 AA compliant (aria-labels, roles, color contrast)
- [x] Responsivo (mobile, tablet, desktop)
- [x] Toast notifications para sucesso/erro
- [x] Loading state durante submissão
- [x] Campos disabled durante submissão

---

## 📝 Notas de Implementação

### 1. Form State Management
Usar React Hook Form para gerenciamento de estado complexo:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const oracleSchema = z.object({
  solutionId: z.string().uuid('Solução inválida'),
  name: z.string().min(3).max(100),
  type: z.enum(['financial', 'compliance', 'risk', 'operational', 'general']),
  domain: z.string().min(20).max(2000),
  description: z.string().max(500).optional(),
  llmModel: z.string(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(500).max(4000),
  ragStrategies: z.array(z.enum(['sql', 'graph', 'vector'])),
})

const form = useForm({
  resolver: zodResolver(oracleSchema),
  defaultValues: {
    solutionId: solutionIdFromUrl || '', // Pre-fill from URL param if available
    name: '',
    type: 'general',
    domain: '',
    description: '',
    llmModel: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    ragStrategies: ['sql', 'graph', 'vector'],
  },
})
```

### 2. Optimistic UI Update
Após criação bem-sucedida, adicionar oráculo ao cache local antes do redirect:

```typescript
// Atualizar cache React Query
queryClient.setQueryData(['oracles'], (old) => [...old, newOracle])
```

### 3. Error Boundary
Envolver formulário em Error Boundary para capturar erros inesperados:

```typescript
<ErrorBoundary fallback={<FormErrorFallback />}>
  <OracleCreateForm />
</ErrorBoundary>
```

---

## 🔄 Fluxo de Usuário

```mermaid
graph TD
    A[Listagem de Oráculos] --> B[Clica 'Criar Novo']
    B --> C[Formulário /oracles/new]
    C --> D{Preenche Campos}
    D --> E[Validação em Tempo Real]
    E --> F{Todos Válidos?}
    F -->|Não| D
    F -->|Sim| G[Habilita Botão 'Criar']
    G --> H[Clica 'Criar Oráculo']
    H --> I[POST /api/v1/oracles]
    I --> J{Sucesso?}
    J -->|Sim - 201| K[Toast 'Criado com Sucesso']
    K --> L[Dialog 'Próxima Ação']
    L --> M{Escolhe Ação}
    M -->|Upload| N[/oracles/\{id\}/knowledge]
    M -->|Chat| O[/oracles/\{id\}/chat]
    M -->|Detalhes| P[/oracles/\{id\}]
    M -->|Voltar| Q[/oracles]
    J -->|Não - 4xx/5xx| R[Toast de Erro]
    R --> C
```

---

**Status**: ✅ Complete
**Próximo Mockup**: [03_oracles_detail.md](03_oracles_detail.md)
**Arquivo Relacionado**: [01_oracles_listagem.md](01_oracles_listagem.md)
**Design System**: [../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)

**Última Atualização**: 2025-12-28
**Criado por**: UX Designer (Squad Fase 1)

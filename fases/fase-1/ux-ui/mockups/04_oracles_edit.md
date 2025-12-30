# ✏️ Mockup 04: `/oracles/{id}/edit` - Editar Oráculo

**Versão**: 1.0.0
**Data**: 2025-12-28
**Sprint**: Sprint 1 - Fundação (Epic 1.2)
**Prioridade**: Medium
**Story Points**: 2 SP
**Estimativa**: 2h

---

## 📋 Overview

Formulário de edição de Oráculo existente. Reaproveita estrutura do [Mockup 02 (Criar)](02_oracles_new.md) com adaptações para modo edição: campos pré-preenchidos, validação de mudanças, e confirmação ao sair com alterações não salvas.

### Requisitos Relacionados
- **RF001**: Editar Oráculo via API REST (PUT)
- **RF003**: Gerenciar Ciclo de Vida de Oráculos
- **RF015**: Atualizar configurações de Oráculos

### User Story
> **Como** administrador do sistema
> **Quero** editar configurações de um Oráculo existente
> **Para que** eu possa ajustar seu comportamento conforme necessário

---

## 🎨 Layout Visual (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ [← Voltar] Editar Oráculo                      [?] [User ▾]     │   │
│ └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Breadcrumb                                                              │
│ Home > Oráculos > Oráculo de Compliance Bancário > Editar              │
│                                                                         │
│ ⚠️ Info Bar (Yellow)                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ ℹ️ Editando: Oráculo de Compliance Bancário (Criado há 3 dias)  │   │
│ │ Alterações serão aplicadas imediatamente após salvar.            │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Formulário (Left Column - 60%)                                  │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Informações Básicas                                          ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ Nome do Oráculo *                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ Oráculo de Compliance Bancário                             │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ⚠️ Nome não pode ser alterado após criação (desabilitado)      │   │
│ │                                                                  │   │
│ │ Tipo de Oráculo *                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [⚙️ Middleware      ▾]                                      │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ Opções: Middleware, Portal Web, MCP Server                     │   │
│ │ ℹ️ Tipo define como o Oráculo será consumido/integrado        │   │
│ │                                                                  │   │
│ │ Status                                                          │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ ☑ Ativo      (Desmarque para desativar o Oráculo)          │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ Tags *                                                          │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [#Core Banking] [#PIX Rules] [#Compliance]             + │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ ℹ️ Clique em + para adicionar nova tag (ex: #Dict Rules)      │   │
│ │ Tags permitem espaços (ex: #Core Banking)                     │   │
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
│ │ ║ Configurações Avançadas (Expandido)                         ║│   │
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
│ │ │ 0.0 ──────●─────────────────────────────────────── 1.0      │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │ Valor atual: 0.7 → 0.5 (Alterado!)                             │   │
│ │                                                                  │   │
│ │ Max Tokens (Resposta)                                           │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ [2000                                 ]                    │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ Estratégia RAG                                                  │   │
│ │ ☑ SQL (PostgreSQL)                                              │   │
│ │ ☑ Graph (NebulaGraph)                                           │   │
│ │ ☑ Vector (pgvector)                                             │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║ Ações                                                        ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ [Cancelar]  [Resetar Alterações]       [✓ Salvar Alterações]  │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Change Summary (Right Column - 40%)                                    │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ 📝 Resumo de Alterações                                          │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 2 alterações detectadas                                     │ │   │
│ │ │                                                             │ │   │
│ │ │ ────────────────────────────────────────────────────       │ │   │
│ │ │                                                             │ │   │
│ │ │ ✏️ Temperatura                                              │ │   │
│ │ │ Antes: 0.7 (Balanceado)                                    │ │   │
│ │ │ Depois: 0.5 (Mais preciso)                                 │ │   │
│ │ │                                                             │ │   │
│ │ │ ────────────────────────────────────────────────────       │ │   │
│ │ │                                                             │ │   │
│ │ │ ✏️ Domínio de Conhecimento                                  │ │   │
│ │ │ Antes: "Regulamentações bancárias..."                     │ │   │
│ │ │ Depois: "Regulamentações bancárias brasileiras..."        │ │   │
│ │ │                                                             │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ⚠️ Impacto das Alterações:                                      │   │
│ │                                                                  │   │
│ │ • Temperatura reduzida → Respostas mais precisas e              │   │
│ │   consistentes (menos criatividade)                            │   │
│ │                                                                  │   │
│ │ • Domínio atualizado → RAG buscará contexto atualizado         │   │
│ │                                                                  │   │
│ │ ℹ️ Conversas existentes não serão afetadas. Apenas novas        │   │
│ │    conversas usarão as configurações atualizadas.              │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Histórico de Alterações (Full Width Bottom)                     │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 📅 25/12/2025 14:32 - Admin User                            │ │   │
│ │ │ ✅ Oráculo criado                                           │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 📅 26/12/2025 10:15 - Admin User                            │ │   │
│ │ │ ✏️ Temperatura: 0.8 → 0.7                                   │ │   │
│ │ │ ✏️ Max Tokens: 1500 → 2000                                  │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ [Ver histórico completo →]                                      │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes da Interface

### 1. Info Bar (Contexto de Edição)

**Componente**: shadcn/ui `<Alert>`

```typescript
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

<Alert variant="warning" className="mb-6">
  <Info className="h-4 w-4" />
  <AlertTitle>Editando: {oracle.name}</AlertTitle>
  <AlertDescription>
    Criado há {formatDistanceToNow(new Date(oracle.createdAt), { locale: ptBR })}.
    Alterações serão aplicadas imediatamente após salvar.
  </AlertDescription>
</Alert>
```

**Variações**:
- `variant="warning"` - Edição normal (amarelo)
- `variant="destructive"` - Se Oráculo estiver em uso ativo (vermelho)

---

### 2. Nome do Oráculo (Disabled)

**Componente**: shadcn/ui `<Input>` disabled

```typescript
<div className="space-y-2">
  <Label htmlFor="oracle-name">
    Nome do Oráculo <span className="text-error-600">*</span>
  </Label>
  <Input
    id="oracle-name"
    type="text"
    value={oracle.name}
    disabled
    className="bg-neutral-100 cursor-not-allowed"
  />
  <p className="text-sm text-warning-600 flex items-center gap-1">
    <AlertTriangle className="h-3 w-3" />
    Nome não pode ser alterado após criação
  </p>
</div>
```

**Rationale**: Nome é chave única no sistema, não pode ser alterado para manter integridade referencial.

---

### 3. Status Toggle

**Componente**: shadcn/ui `<Checkbox>`

```typescript
<div className="space-y-2">
  <div className="flex items-center space-x-2">
    <Checkbox
      id="oracle-status"
      checked={formData.status === 'active'}
      onCheckedChange={(checked) =>
        handleFieldChange('status', checked ? 'active' : 'inactive')
      }
    />
    <Label
      htmlFor="oracle-status"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      Ativo
    </Label>
  </div>
  <p className="text-sm text-neutral-500">
    {formData.status === 'active'
      ? 'Oráculo está ativo e aceitando novas conversas'
      : 'Oráculo está inativo e não aceitará novas conversas'}
  </p>
</div>
```

**Comportamento**:
- Se desativar (`inactive`), mostra confirmação:
  - "Desativar Oráculo impedirá novas conversas. Conversas existentes permanecerão acessíveis. Continuar?"

---

### 4. Change Summary (Right Column)

**Componente**: shadcn/ui `<Card>` customizado

```typescript
interface Change {
  field: string
  oldValue: any
  newValue: any
  label: string
}

const changes = useMemo(() => {
  const result: Change[] = []

  Object.keys(formData).forEach((key) => {
    if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
      result.push({
        field: key,
        oldValue: originalData[key],
        newValue: formData[key],
        label: getFieldLabel(key),
      })
    }
  })

  return result
}, [formData, originalData])

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Edit className="h-5 w-5" />
      Resumo de Alterações
    </CardTitle>
  </CardHeader>
  <CardContent>
    {changes.length === 0 ? (
      <p className="text-sm text-neutral-500 italic">
        Nenhuma alteração detectada
      </p>
    ) : (
      <>
        <p className="text-sm font-medium mb-4">
          {changes.length} {changes.length === 1 ? 'alteração detectada' : 'alterações detectadas'}
        </p>

        <div className="space-y-4">
          {changes.map((change, index) => (
            <div key={change.field}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  {change.label}
                </p>
                <div className="text-sm space-y-1">
                  <p className="text-neutral-500">
                    <span className="font-medium">Antes:</span>{' '}
                    {formatValue(change.oldValue, change.field)}
                  </p>
                  <p className="text-primary-600">
                    <span className="font-medium">Depois:</span>{' '}
                    {formatValue(change.newValue, change.field)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Alert variant="default" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Impacto das Alterações:</AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            {getImpactMessages(changes).map((message, index) => (
              <p key={index}>• {message}</p>
            ))}
            <p className="mt-2 text-xs italic">
              ℹ️ Conversas existentes não serão afetadas. Apenas novas conversas usarão as
              configurações atualizadas.
            </p>
          </AlertDescription>
        </Alert>
      </>
    )}
  </CardContent>
</Card>
```

**Impact Messages Examples**:
```typescript
const getImpactMessages = (changes: Change[]): string[] => {
  const messages: string[] = []

  changes.forEach((change) => {
    switch (change.field) {
      case 'temperature':
        if (change.newValue < change.oldValue) {
          messages.push(
            'Temperatura reduzida → Respostas mais precisas e consistentes (menos criatividade)'
          )
        } else {
          messages.push(
            'Temperatura aumentada → Respostas mais criativas e variadas (menos precisão)'
          )
        }
        break
      case 'llmModel':
        messages.push(
          `Modelo alterado para ${getLLMModelLabel(change.newValue)} → Qualidade e custo de resposta podem variar`
        )
        break
      case 'domain':
        messages.push('Domínio atualizado → RAG buscará contexto atualizado')
        break
      case 'ragStrategies':
        messages.push('Estratégias RAG modificadas → Fontes de conhecimento alteradas')
        break
      case 'status':
        if (change.newValue === 'inactive') {
          messages.push('🔴 Oráculo será desativado → Novas conversas não serão permitidas')
        } else {
          messages.push('🟢 Oráculo será ativado → Novas conversas permitidas')
        }
        break
    }
  })

  return messages
}
```

---

### 5. Action Buttons

**Componente**: shadcn/ui `<Button>` com 3 opções

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

  <div className="flex items-center gap-2">
    {hasChanges && (
      <Button
        type="button"
        variant="ghost"
        onClick={handleReset}
        disabled={isSubmitting}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Resetar Alterações
      </Button>
    )}

    <Button
      type="submit"
      onClick={handleSubmit}
      disabled={!hasChanges || isSubmitting}
      className="min-w-[180px]"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Salvar Alterações ({changes.length})
        </>
      )}
    </Button>
  </div>
</div>
```

**Comportamento**:
- **Cancelar**: Se `hasChanges`, mostra confirmação. Senão, volta direto.
- **Resetar Alterações**: Restaura `formData` para `originalData` (sem API call)
- **Salvar Alterações**: Só enabled se `hasChanges === true`

---

### 6. Histórico de Alterações (Bottom)

**Componente**: shadcn/ui `<Card>` com timeline

```typescript
<Card>
  <CardHeader>
    <CardTitle>Histórico de Alterações</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {oracle.changeHistory.slice(0, 5).map((historyItem, index) => (
        <div key={historyItem.id} className="flex gap-3">
          <div className="relative">
            <div className="p-2 bg-neutral-100 rounded-full">
              {historyItem.type === 'created' ? (
                <CheckCircle2 className="h-4 w-4 text-success-600" />
              ) : (
                <Edit className="h-4 w-4 text-primary-600" />
              )}
            </div>
            {index < oracle.changeHistory.length - 1 && (
              <div className="absolute left-1/2 top-10 bottom-0 w-px bg-neutral-200 -translate-x-1/2" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {format(new Date(historyItem.timestamp), "dd/MM/yyyy HH:mm")} -{' '}
                {historyItem.userName}
              </p>
            </div>

            <div className="mt-2 space-y-1">
              {historyItem.type === 'created' ? (
                <p className="text-sm text-success-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Oráculo criado
                </p>
              ) : (
                historyItem.changes.map((change, idx) => (
                  <p key={idx} className="text-sm text-neutral-600 flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    {change.label}: {formatValue(change.oldValue, change.field)} →{' '}
                    {formatValue(change.newValue, change.field)}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {oracle.changeHistory.length > 5 && (
      <Button variant="link" className="w-full mt-4">
        Ver histórico completo →
      </Button>
    )}
  </CardContent>
</Card>
```

---

## 🔄 Interações e Comportamentos

### 1. Pre-fill Form Data

**Ao montar componente**:
```typescript
useEffect(() => {
  const fetchOracleData = async () => {
    const response = await fetch(`/api/v1/oracles/${oracleId}`)
    const oracle = await response.json()

    const initialData = {
      name: oracle.name, // disabled, mas exibido
      type: oracle.type,
      status: oracle.status,
      domain: oracle.domain,
      description: oracle.description,
      llmModel: oracle.config.llmModel,
      temperature: oracle.config.temperature,
      maxTokens: oracle.config.maxTokens,
      ragStrategies: oracle.config.ragStrategies,
    }

    setOriginalData(initialData)
    setFormData(initialData)
  }

  fetchOracleData()
}, [oracleId])
```

---

### 2. Detect Changes

**Comparação profunda entre `formData` e `originalData`**:
```typescript
const hasChanges = useMemo(() => {
  return JSON.stringify(formData) !== JSON.stringify(originalData)
}, [formData, originalData])
```

---

### 3. Confirm Navigation with Unsaved Changes

**Prompt ao sair com alterações**:
```typescript
import { useBeforeUnload, useBlocker } from 'react-router-dom'

// Browser native prompt
useBeforeUnload(
  useCallback(
    (event) => {
      if (hasChanges) {
        event.preventDefault()
        event.returnValue = '' // Chrome requires returnValue to be set
      }
    },
    [hasChanges]
  )
)

// React Router blocker
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasChanges && currentLocation.pathname !== nextLocation.pathname
)

useEffect(() => {
  if (blocker.state === 'blocked') {
    if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }
}, [blocker])
```

---

### 4. Reset Changes

**Restaurar valores originais**:
```typescript
const handleReset = () => {
  if (confirm('Descartar todas as alterações e restaurar valores originais?')) {
    setFormData({ ...originalData })
    toast({
      title: 'Alterações descartadas',
      description: 'Valores originais restaurados',
    })
  }
}
```

---

### 5. Submit (PUT Request)

**API Call**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!hasChanges) {
    toast({
      title: 'Nenhuma alteração',
      description: 'Não há alterações para salvar',
      variant: 'default',
    })
    return
  }

  setIsSubmitting(true)

  try {
    const response = await fetch(`/api/v1/oracles/${oracleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: formData.type,
        status: formData.status,
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
      throw new Error(error.message || 'Erro ao atualizar oráculo')
    }

    const updatedOracle = await response.json()

    toast({
      title: 'Oráculo Atualizado',
      description: `${updatedOracle.name} foi atualizado com sucesso!`,
    })

    // Update original data to new state (no more changes)
    setOriginalData({ ...formData })

    // Redirect to detail page
    router.push(`/oracles/${oracleId}`)

  } catch (error) {
    console.error('Error updating oracle:', error)
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Erro ao atualizar oráculo',
      variant: 'destructive',
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 🎨 Estados da Interface

### 1. Loading Initial Data
- Skeleton para formulário
- Preview mostra loading

### 2. Ready (No Changes)
- Formulário pré-preenchido
- "Salvar Alterações" disabled
- Change Summary: "Nenhuma alteração detectada"

### 3. Editing (With Changes)
- Change Summary atualiza em tempo real
- "Salvar Alterações" enabled
- Botão mostra contagem: "Salvar Alterações (2)"

### 4. Submitting
- Formulário disabled
- Botão mostra "Salvando..." + spinner
- Change Summary mantém visível

### 5. Success
- Toast de sucesso
- Redirect para `/oracles/{id}` (detail page)

### 6. Error
- Toast de erro
- Formulário volta ao estado editável

---

## ♿ Acessibilidade (WCAG 2.1 AA)

Idêntico ao [Mockup 02](02_oracles_new.md):
- Labels, aria-required, aria-describedby
- Navegação por teclado
- Focus visible
- Contrast ratios 4.5:1

**Adicional**:
- Campo "Nome" disabled tem `aria-disabled="true"` + tooltip explicativo

---

## 📱 Responsividade

Idêntico ao [Mockup 02](02_oracles_new.md):
- Desktop: 2 colunas (60%/40%)
- Tablet: 2 colunas (55%/45%)
- Mobile: 1 coluna (stacked)

---

## 🧪 Casos de Teste

### Teste 1: Load Existing Data
**Given**: `/oracles/123/edit`
**When**: Página carrega
**Then**: Formulário pré-preenchido com dados do Oráculo 123

### Teste 2: Nome Disabled
**Given**: Formulário carregado
**When**: Usuário tenta editar campo "Nome"
**Then**: Campo está disabled, não permite edição

### Teste 3: Detect Changes
**Given**: Formulário sem alterações
**When**: Usuário altera Temperatura de 0.7 para 0.5
**Then**: Change Summary mostra "1 alteração detectada", botão "Salvar" enabled

### Teste 4: Reset Changes
**Given**: 2 alterações detectadas
**When**: Usuário clica "Resetar Alterações" e confirma
**Then**: Formulário volta aos valores originais, Change Summary mostra "Nenhuma alteração"

### Teste 5: Unsaved Changes Warning
**Given**: 1 alteração não salva
**When**: Usuário clica "Voltar" ou fecha aba
**Then**: Prompt de confirmação aparece: "Você tem alterações não salvas..."

### Teste 6: Submit Success
**Given**: 2 alterações válidas
**When**: Usuário clica "Salvar Alterações"
**Then**: PUT /api/v1/oracles/123 retorna 200, toast de sucesso, redirect para `/oracles/123`

### Teste 7: Submit Error
**Given**: API retorna 500
**When**: Usuário tenta salvar
**Then**: Toast de erro aparece, formulário permanece editável

### Teste 8: Deactivate Oracle
**Given**: Status = Ativo
**When**: Usuário desmarca checkbox "Ativo" e salva
**Then**: Oráculo marcado como `inactive`, conversas novas bloqueadas

### Teste 9: Change Summary Real-time
**Given**: Formulário sem alterações
**When**: Usuário altera 3 campos (Tipo, Temperatura, Domínio)
**Then**: Change Summary mostra "3 alterações detectadas" com diff de cada campo

### Teste 10: History Timeline
**Given**: Oráculo com 10 edições anteriores
**When**: Página carrega
**Then**: Histórico mostra últimas 5 edições + botão "Ver histórico completo"

---

## 🔗 Integrações

### API Endpoint: PUT `/api/v1/oracles/{id}`

**Request Body** (apenas campos editáveis):
```json
{
  "type": "financial",
  "status": "active",
  "domain": "Regulamentações bancárias brasileiras (BACEN, CMN)...",
  "description": "Este Oráculo especializa-se em compliance bancário...",
  "config": {
    "llm_model": "gpt-4-turbo",
    "temperature": 0.5,
    "max_tokens": 2000,
    "rag_strategies": ["sql", "graph", "vector"]
  }
}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Oráculo de Compliance Bancário",
  "type": "financial",
  "status": "active",
  "domain": "Regulamentações bancárias brasileiras...",
  "description": "Este Oráculo especializa-se...",
  "config": {
    "llm_model": "gpt-4-turbo",
    "temperature": 0.5,
    "max_tokens": 2000,
    "rag_strategies": ["sql", "graph", "vector"]
  },
  "created_at": "2025-12-25T14:32:15Z",
  "updated_at": "2025-12-28T10:15:30Z",
  "updated_by": "admin@example.com"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Domínio deve ter pelo menos 20 caracteres",
    "field": "domain"
  }
}
```

---

### API Endpoint: GET `/api/v1/oracles/{id}/history`

**Response (200 OK)**:
```json
{
  "oracle_id": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    {
      "id": "hist-001",
      "type": "created",
      "timestamp": "2025-12-25T14:32:15Z",
      "user_id": "user-123",
      "user_name": "Admin User",
      "changes": []
    },
    {
      "id": "hist-002",
      "type": "updated",
      "timestamp": "2025-12-26T10:15:00Z",
      "user_id": "user-123",
      "user_name": "Admin User",
      "changes": [
        {
          "field": "temperature",
          "label": "Temperatura",
          "old_value": 0.8,
          "new_value": 0.7
        },
        {
          "field": "max_tokens",
          "label": "Max Tokens",
          "old_value": 1500,
          "new_value": 2000
        }
      ]
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 20
}
```

---

## 📦 Dependências de Componentes

Idêntico ao [Mockup 02](02_oracles_new.md) +
- `<Alert>` - Info bar de contexto
- `useBeforeUnload` - React Router hook
- `useBlocker` - React Router hook

---

## 🎯 Critérios de Aceitação

- [x] Formulário pré-preenchido com dados do Oráculo
- [x] Campo "Nome" disabled (não editável)
- [x] Change Summary mostra alterações em tempo real
- [x] Change Summary mostra impacto das alterações
- [x] Botão "Salvar Alterações" só enabled se houver mudanças
- [x] Botão mostra contagem de alterações: "Salvar Alterações (2)"
- [x] Botão "Resetar Alterações" descarta mudanças
- [x] Confirmação ao sair com alterações não salvas
- [x] PUT /api/v1/oracles/{id} atualiza Oráculo
- [x] Toast de sucesso após salvar
- [x] Redirect para `/oracles/{id}` após sucesso
- [x] Histórico de alterações mostra últimas 5 edições
- [x] Validação idêntica ao modo criação
- [x] WCAG 2.1 AA compliant
- [x] Responsivo (mobile, tablet, desktop)

---

## 📝 Diferenças vs Mockup 02 (Criar)

| Aspecto | Criar (02) | Editar (04) |
|---------|-----------|-------------|
| **Nome** | Editável | **Disabled** |
| **Status** | Não há | **Checkbox Ativo/Inativo** |
| **Título** | "Criar Novo Oráculo" | "Editar Oráculo" |
| **Info Bar** | Não há | **Alert amarelo com contexto** |
| **Preview** | Preview do novo Oráculo | **Change Summary (diff)** |
| **Botão Submit** | "Criar Oráculo" | "Salvar Alterações (N)" |
| **Botão Extra** | Não há | **"Resetar Alterações"** |
| **Confirmação ao Sair** | Só se houver texto | **Sempre se houver mudanças** |
| **API Endpoint** | POST /api/v1/oracles | **PUT /api/v1/oracles/{id}** |
| **Redirect Pós-Success** | Dialog de próxima ação | **Volta para detail page** |
| **Histórico** | Não há | **Timeline de edições anteriores** |

---

**Status**: ✅ Complete
**Próximo Mockup**: [05_oracles_knowledge.md](05_oracles_knowledge.md)
**Última Atualização**: 2025-12-28

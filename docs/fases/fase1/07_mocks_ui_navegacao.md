# Mocks de UI e Navegação - Fase 1: Foundation

**Status**: 📋 Template (Aguardando Criação)
**Versão**: 1.0.0
**Data**: 2025-12-11
**Aprovação**: ⏸️ Pendente

---

## ⚠️ REGRA CRÍTICA

**NENHUMA linha de código de UI será escrita antes de:**

1. ✅ Mocks completos criados neste documento
2. ✅ Time de Produto aprovar todos os layouts
3. ✅ Time Técnico validar viabilidade técnica
4. ✅ Status deste documento mudar para "🟢 Aprovado"

**Violação desta regra resulta em retrabalho e desperdício de tempo.**

---

## 1. Visão Geral da Navegação

### 1.1 Estrutura de Navegação Principal

```
SuperCore Foundation
│
├── 📊 Dashboard
│   └── Visão geral de objetos e instâncias
│
├── 🧬 Object Definitions (Definições de Objetos)
│   ├── Listar Objetos
│   ├── Criar Novo Objeto (Assistente NL)
│   └── Detalhes do Objeto
│       ├── Editar Schema
│       ├── Configurar FSM
│       └── Gerenciar Validações
│
├── 📦 Instances (Instâncias)
│   ├── Listar por Objeto
│   ├── Criar Nova Instância (Formulário Dinâmico)
│   ├── Detalhes da Instância
│   │   ├── Editar Dados
│   │   ├── Ver Histórico de Estados
│   │   └── Gerenciar Relacionamentos
│   └── Transições de Estado
│
├── 🔗 Relationships (Relacionamentos)
│   ├── Visualização em Grafo
│   ├── Criar Relacionamento
│   └── Listar Relacionamentos
│
├── 🧪 Validation Rules (Regras de Validação)
│   ├── Biblioteca de Regras
│   └── Criar Nova Regra
│
└── 🤖 RAG Assistant (Assistente)
    └── Chat Interface
```

---

## 2. Mocks de Telas (Aguardando Criação)

### 2.1 Dashboard Principal

**Propósito**: Visão geral do sistema com métricas e acesso rápido

**Elementos de UI**:
- [ ] Header com logo e navegação
- [ ] Cards de métricas (total de objetos, instâncias, relacionamentos)
- [ ] Gráfico de atividade recente
- [ ] Lista de últimas instâncias criadas
- [ ] Acesso rápido para criar objeto/instância

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar em "Criar Objeto" → Tela 2.2 (Assistente NL)
- Clicar em card de objeto → Tela 2.4 (Listar Instâncias)

---

### 2.2 Assistente de Criação de Objeto (NL)

**Propósito**: Conversa estruturada para criar object_definition

**Elementos de UI**:
- [ ] Interface de chat/conversa
- [ ] Progresso das 7 perguntas (stepper)
- [ ] Inputs contextuais por pergunta
- [ ] Preview do objeto sendo criado
- [ ] Botões: "Anterior", "Próximo", "Confirmar", "Cancelar"

**Fluxo**:
```
Pergunta 1: Nome do objeto
    ↓
Pergunta 2: Descrição
    ↓
Pergunta 3: Campos necessários
    ↓
Pergunta 4: Validações especiais
    ↓
Pergunta 5: Estados do ciclo de vida
    ↓
Pergunta 6: Relacionamentos
    ↓
Pergunta 7: Preview e confirmação
    ↓
Objeto criado → Redireciona para Tela 2.3 (Detalhes do Objeto)
```

**Mock**: ⏸️ Pendente

---

### 2.3 Listar Object Definitions

**Propósito**: Visualizar todos os objetos criados

**Elementos de UI**:
- [ ] Tabela com colunas: Nome, Descrição, Total de Instâncias, Status, Ações
- [ ] Filtros: Nome, Status (ativo/inativo)
- [ ] Botão: "Criar Novo Objeto"
- [ ] Paginação

**Ações por linha**:
- Ver Detalhes
- Editar
- Desativar/Ativar
- Ver Instâncias

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Ver Detalhes" → Tela 2.3 (Detalhes do Objeto)
- Clicar "Ver Instâncias" → Tela 2.4 (Listar Instâncias)

---

### 2.4 Detalhes de Object Definition

**Propósito**: Ver e editar schema, FSM, validações de um objeto

**Elementos de UI**:
- [ ] Tabs: "Schema", "FSM", "Validações", "UI Hints", "Relacionamentos"
- [ ] Tab "Schema":
  - [ ] Editor JSON com syntax highlight
  - [ ] Validação em tempo real (JSON Schema Draft 7)
- [ ] Tab "FSM":
  - [ ] Visualização gráfica de estados e transições (React Flow)
  - [ ] Editor de estados
  - [ ] Editor de transições
- [ ] Tab "Validações":
  - [ ] Lista de regras aplicadas
  - [ ] Adicionar/remover regras da biblioteca
- [ ] Botões: "Salvar", "Cancelar"

**Mock**: ⏸️ Pendente

---

### 2.5 Listar Instances (Instâncias)

**Propósito**: Listar todas as instâncias de um object_definition

**Elementos de UI**:
- [ ] Breadcrumb: Object Definition > Instâncias
- [ ] Tabela dinâmica (colunas baseadas no schema do objeto)
- [ ] Filtros:
  - [ ] Por estado (dropdown com estados do FSM)
  - [ ] Por campos do objeto (filtros dinâmicos)
- [ ] Botão: "Criar Nova Instância"
- [ ] Paginação

**Ações por linha**:
- Ver Detalhes
- Editar
- Deletar (soft delete)
- Transição de Estado

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Criar Nova" → Tela 2.6 (Formulário Dinâmico)
- Clicar "Ver Detalhes" → Tela 2.7 (Detalhes da Instância)

---

### 2.6 Formulário Dinâmico de Instância

**Propósito**: Criar/editar instância com formulário gerado dinamicamente

**Elementos de UI**:
- [ ] Título: "Criar [Nome do Objeto]" ou "Editar [Nome do Objeto]"
- [ ] Campos renderizados dinamicamente:
  - [ ] Widget CPF (máscara 999.999.999-99)
  - [ ] Widget CNPJ (máscara 99.999.999/9999-99)
  - [ ] Widget Email (validação RFC 5322)
  - [ ] Widget Phone BR (máscara (99) 99999-9999)
  - [ ] Widget Currency (R$ 0,00)
  - [ ] Widget Date (dd/MM/yyyy)
  - [ ] Widget Select (dropdown)
  - [ ] Widget Relationship (picker de instâncias)
  - [ ] Widget Address (CEP + auto-fill ViaCEP)
  - [ ] Widget Number
  - [ ] Widget Text/Textarea
- [ ] Validações em tempo real (JSON Schema + validation_rules)
- [ ] Mensagens de erro contextuais
- [ ] Botões: "Salvar", "Salvar e Criar Outro", "Cancelar"

**Mock**: ⏸️ Pendente

**Especial - RelationshipPicker**:
- [ ] Modal com busca de instâncias do objeto relacionado
- [ ] Filtros de busca
- [ ] Seleção única ou múltipla (baseado em cardinalidade)
- [ ] Preview da instância selecionada

---

### 2.7 Detalhes de Instance

**Propósito**: Ver dados, histórico e relacionamentos de uma instância

**Elementos de UI**:
- [ ] Tabs: "Dados", "Histórico de Estados", "Relacionamentos", "Audit Log"
- [ ] Tab "Dados":
  - [ ] Visualização dos campos (read-only ou editable)
  - [ ] Botão "Editar" → Formulário Dinâmico
- [ ] Tab "Histórico de Estados":
  - [ ] Timeline visual dos estados
  - [ ] Cada transição mostra: Estado Anterior → Estado Atual, Timestamp, Usuário, Comentário
- [ ] Tab "Relacionamentos":
  - [ ] Lista de relacionamentos ativos
  - [ ] Botão "Criar Relacionamento"
  - [ ] Visualizar no Grafo (link para Tela 2.9)
- [ ] Badge com estado atual (colorido conforme estado)
- [ ] Botão "Transição de Estado" (se houver transições disponíveis)

**Mock**: ⏸️ Pendente

---

### 2.8 Transição de Estado (Modal)

**Propósito**: Executar transição FSM com confirmação

**Elementos de UI**:
- [ ] Modal overlay
- [ ] Título: "Transição de Estado"
- [ ] Info: Estado Atual → Estados Possíveis (baseado no FSM)
- [ ] Dropdown: Selecionar estado destino
- [ ] Textarea: Comentário (opcional)
- [ ] Botões: "Confirmar Transição", "Cancelar"

**Mock**: ⏸️ Pendente

---

### 2.9 Visualização de Relacionamentos (Grafo)

**Propósito**: Visualizar instâncias e relacionamentos em grafo interativo

**Elementos de UI**:
- [ ] Canvas React Flow com:
  - [ ] Nós = Instâncias (coloridos por object_definition)
  - [ ] Arestas = Relacionamentos (rotuladas com tipo)
  - [ ] Zoom, Pan, Fullscreen
- [ ] Sidebar com filtros:
  - [ ] Por tipo de objeto
  - [ ] Por tipo de relacionamento
  - [ ] Por profundidade (1, 2, 3 níveis)
- [ ] Clicar em nó → Abre detalhes da instância (Tela 2.7)
- [ ] Clicar em aresta → Mostra propriedades do relacionamento

**Mock**: ⏸️ Pendente

---

### 2.10 Biblioteca de Validation Rules

**Propósito**: Gerenciar regras de validação reutilizáveis

**Elementos de UI**:
- [ ] Tabela: Nome, Tipo (regex/function/api_call), Descrição, Sistema/Custom
- [ ] Filtros: Tipo, Sistema/Custom
- [ ] Botão: "Criar Nova Regra"
- [ ] Ações por linha: Ver Detalhes, Editar (se custom), Testar

**Mock**: ⏸️ Pendente

---

### 2.11 RAG Assistant (Chat)

**Propósito**: Interface de chat para perguntas ao RAG

**Elementos de UI**:
- [ ] Interface de chat:
  - [ ] Lista de mensagens (usuário + assistente)
  - [ ] Input de texto
  - [ ] Botão "Enviar"
- [ ] Sugestões de perguntas (chips clicáveis):
  - "Quantos clientes ativos?"
  - "Quais contas Maria Silva possui?"
  - "Qual o total de instâncias criadas hoje?"
- [ ] Loading indicator durante busca RAG
- [ ] Respostas com contexto:
  - [ ] Números formatados
  - [ ] Links para instâncias mencionadas
  - [ ] Gráficos/tabelas quando relevante

**Mock**: ⏸️ Pendente

---

## 3. Componentes UI Reutilizáveis

### 3.1 Widget Library (10 widgets)

Cada widget deve ter mock de:
- Estado normal
- Estado com erro
- Estado disabled
- Estado loading (se aplicável)

**Lista de Widgets**:

1. **CPFWidget**
   - Máscara: 999.999.999-99
   - Validação: 11 dígitos + algoritmo verificador
   - Mock: ⏸️ Pendente

2. **CNPJWidget**
   - Máscara: 99.999.999/9999-99
   - Validação: 14 dígitos + algoritmo verificador
   - Mock: ⏸️ Pendente

3. **EmailWidget**
   - Validação: RFC 5322
   - Mock: ⏸️ Pendente

4. **PhoneBRWidget**
   - Máscara: (99) 99999-9999
   - Validação: DDD + número
   - Mock: ⏸️ Pendente

5. **CurrencyWidget**
   - Formato: R$ 0,00
   - Validação: numeric
   - Mock: ⏸️ Pendente

6. **DateWidget**
   - Formato: dd/MM/yyyy
   - DatePicker com calendário
   - Mock: ⏸️ Pendente

7. **SelectWidget**
   - Dropdown com opções do enum
   - Busca se > 10 opções
   - Mock: ⏸️ Pendente

8. **RelationshipWidget**
   - Modal picker de instâncias
   - Busca + filtros
   - Mock: ⏸️ Pendente

9. **AddressWidget**
   - CEP + auto-fill ViaCEP
   - Campos: Rua, Número, Complemento, Bairro, Cidade, UF
   - Mock: ⏸️ Pendente

10. **NumberWidget**
    - Input numérico
    - Min/max support
    - Mock: ⏸️ Pendente

### 3.2 Componentes de Layout

**Header**:
- Logo
- Navegação principal
- User menu (placeholder - auth é Fase 2+)
- Mock: ⏸️ Pendente

**Sidebar** (opcional):
- Navegação lateral
- Colapsável
- Mock: ⏸️ Pendente

**Breadcrumb**:
- Navegação hierárquica
- Mock: ⏸️ Pendente

**DataTable**:
- Tabela genérica com paginação
- Sorting
- Filtros
- Mock: ⏸️ Pendente

**FormField**:
- Wrapper para widgets
- Label + Error + HelpText
- Mock: ⏸️ Pendente

---

## 4. Design System (Referências)

### 4.1 Cores

**Base** (shadcn/ui):
- Primary: [a definir]
- Secondary: [a definir]
- Accent: [a definir]
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue

### 4.2 Tipografia

- Font: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Small: 300 weight

### 4.3 Espaçamento

- Tailwind spacing scale (4px base)
- Padrão de gaps: 4, 8, 16, 24, 32px

### 4.4 Componentes shadcn/ui

Usar componentes base do shadcn/ui:
- Button
- Input
- Select
- Checkbox
- Radio
- Switch
- Textarea
- Card
- Badge
- Alert
- Dialog (Modal)
- Dropdown Menu
- Tabs
- Toast (notificações)

---

## 5. Responsividade

### 5.1 Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 5.2 Prioridade

**Fase 1**: Desktop-first (admin/backoffice)

**Fase 2+**: Mobile-responsive

---

## 6. Acessibilidade (a11y)

### 6.1 Requisitos Mínimos

- [ ] ARIA labels em todos os inputs
- [ ] Navegação por teclado (Tab, Enter, Esc)
- [ ] Contraste mínimo WCAG AA
- [ ] Focus indicators visíveis
- [ ] Screen reader friendly

---

## 7. Aprovação

### 7.1 Checklist de Aprovação

**Time de Produto**:
- [ ] Fluxo de navegação aprovado
- [ ] Mocks de todas as telas aprovados
- [ ] Widgets atendem necessidades
- [ ] UX/UI está intuitivo

**Time Técnico**:
- [ ] Todos os componentes são tecnicamente viáveis
- [ ] Stack (Next.js 14 + shadcn/ui) suporta requisitos
- [ ] Performance estimada está aceitável
- [ ] Complexidade está dentro do esperado

### 7.2 Assinaturas de Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | ⏸️ Pendente |
| Tech Lead | | | ⏸️ Pendente |
| UI/UX (se houver) | | | ⏸️ Pendente |

---

## 8. Próximos Passos Após Aprovação

Após este documento estar **🟢 Aprovado**:

1. ✅ Planejamento de sprints pode referenciar mocks
2. ✅ Frontend Developer Agent pode iniciar implementação
3. ✅ Cada tela implementada deve corresponder 1:1 com mock aprovado
4. ✅ Qualquer desvio do mock requer nova aprovação

---

## Referências

- [Especificações Fase 1](01_especificacoes.md)
- [Stack Tecnológico](../../architecture/stack_tecnologico_fases.md)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Flow](https://reactflow.dev)

---

**Status**: 📋 Template criado, aguardando criação de mocks

**Próxima Ação**: Criar wireframes/mocks de cada tela descrita acima

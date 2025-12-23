# Object Definitions Management Wireframe

**Screen**: Object Definitions List & Detail  
**Stack**: Next.js 14 + shadcn/ui + React Hook Form + Zod + i18next  
**Purpose**: Manage Object Definitions within an Oracle (RF010, RF011)

## Overview

Object Definitions are the building blocks of any solution. They define the structure, validation rules, FSM states, and UI hints for entities in the system.

---

## 1. Object Definitions List View

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ [Icon] Banking Hub → Objetos                                   │
│                                                                │
│ Object Definitions                        [+ Novo Objeto] [🤖 │
│                                            Gerar com IA]      │
│                                                                │
│ [Search objects...] [Filter: All ▼] [Sort: Name ▼]            │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Data Entities (8)                                  [▼]   │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 📦 Account                             v1.0.0  [⚙️ •••]  │  │
│ │ Bank account entity                                      │  │
│ │ 12 fields | 450 instances | Updated 2h ago              │  │
│ │ [View] [Edit] [Create Instance]                         │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 👤 Customer                            v1.2.0  [⚙️ •••]  │  │
│ │ Customer entity with KYC data                           │  │
│ │ 18 fields | 320 instances | Updated 1d ago              │  │
│ │ [View] [Edit] [Create Instance]                         │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Integrations (3)                               [▼]       │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 🔗 BACEN_SPI_Integration               v1.0.0  [⚙️ •••]  │  │
│ │ Integration with BACEN instant payment system           │  │
│ │ API | Updated 3d ago                                    │  │
│ │ [View] [Edit] [Test Connection]                         │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ UI Components (2)                              [▼]       │  │
│ │ Workflows (1)                                  [▼]       │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Features
- **Grouped by Type**: Data Entities, Integrations, UI Components, Workflows
- **Collapsible Sections**: Click to expand/collapse
- **Search**: Real-time filter by name/description
- **Filter**: By type, status (active/deprecated)
- **Sort**: By name, date, instance count
- **Actions per item**:
  - View (navigate to detail)
  - Edit (open edit form)
  - Create Instance (if Data Entity)
  - Test (if Integration)
  - Menu (••• ): Clone, Version History, Delete

---

## 2. Create Object Definition with AI (RF011)

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ Gerar Object Definition com IA                                 │
│                                                                │
│ Descreva o objeto que você precisa:                           │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Preciso de um objeto para representar uma Transação     │  │
│ │ Bancária. Deve incluir campos como valor, data/hora,    │  │
│ │ conta origem, conta destino, tipo de transação (PIX,    │  │
│ │ TED, DOC), status, e validações de acordo com BACEN.    │  │
│ │                                                          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Gerar Object Definition] ← Primary action                    │
│                                                                │
│ [Loading spinner + AI animation]                              │
│ Consultando Oráculo... Analisando regulações BACEN...        │
│                                                                │
│ ───────────────────────────────────────────────────────────── │
│                                                                │
│ ✓ Object Definition gerado!                                   │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Name: Transaction                                        │  │
│ │ Type: Data Entity                                        │  │
│ │ Version: 1.0.0                                           │  │
│ │                                                          │  │
│ │ Fields (8):                                              │  │
│ │ • amount (number, required)                              │  │
│ │ • timestamp (datetime, required)                         │  │
│ │ • source_account_id (uuid, required, fk: Account)       │  │
│ │ • target_account_id (uuid, required, fk: Account)       │  │
│ │ • transaction_type (enum: PIX,TED,DOC, required)        │  │
│ │ • status (enum: PENDING,COMPLETED,FAILED, required)     │  │
│ │ • description (string, optional)                         │  │
│ │ • metadata (jsonb, optional)                            │  │
│ │                                                          │  │
│ │ Validations (5):                                         │  │
│ │ • amount > 0                                             │  │
│ │ • amount <= 10000 (PIX limit per BACEN Resolution)      │  │
│ │ • source != target                                       │  │
│ │ • source_account must have sufficient balance           │  │
│ │ • timestamp must be within business hours (if TED/DOC)  │  │
│ │                                                          │  │
│ │ FSM States: PENDING → PROCESSING → COMPLETED/FAILED     │  │
│ │                                                          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Preview] [Editar] [Aprovar e Salvar]                         │
└────────────────────────────────────────────────────────────────┘
```

### AI Generation Flow
1. User describes object in natural language
2. Click Gerar Object Definition
3. AI queries Oracle knowledge (RAG) for domain rules
4. AI generates object_definition JSON
5. Preview shown to user
6. User can edit or approve
7. On approve: saved to database, version 1.0.0 created

---

## 3. Object Definition Detail View

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ ← Back  |  📦 Account (v1.0.0)              [Edit] [•••]       │
│                                                                │
│ Bank account entity                                            │
│ Created: 2024-12-15 | Last modified: 2h ago                   │
│                                                                │
│ ┌─ Tabs ──────────────────────────────────────────────────┐   │
│ │ Schema | Instances | Validation Rules | FSM | History   │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                │
│ [TAB: Schema]                                                  │
│                                                                │
│ Fields (12)                                   [+ Add Field]    │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Field Name      │ Type    │ Required │ Validation       │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ account_number  │ string  │ ✓        │ Unique, 10 digits│  │
│ │ holder_cpf      │ string  │ ✓        │ Valid CPF       │  │
│ │ holder_name     │ string  │ ✓        │ Min 3 chars     │  │
│ │ account_type    │ enum    │ ✓        │ CHECKING,SAVINGS│  │
│ │ balance         │ number  │ ✓        │ >= 0            │  │
│ │ status          │ enum    │ ✓        │ (FSM controlled)│  │
│ │ opened_at       │ datetime│ ✓        │ Not future      │  │
│ │ closed_at       │ datetime│          │ After opened_at │  │
│ │ ...             │ ...     │ ...      │ ...             │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Relationships (3)                                              │
│ • Customer (1:N) - Account belongs to Customer                │
│ • Transaction (1:N) - Account has many Transactions           │
│ • BACEN_Regulation (N:1) - Account governed by Regulation     │
│                                                                │
│ UI Hints                                                       │
│ • Form widget: AccountForm (auto-generated)                   │
│ • List widget: AccountTable (sortable, filterable)            │
│ • Detail widget: AccountDetailView (read-only)                │
└────────────────────────────────────────────────────────────────┘
```

### Tab: Instances
Shows all instances of this object definition
- Table with columns from fields
- Pagination (50 per page)
- Search, filter, sort
- Actions: View, Edit, Delete
- Bulk actions (select multiple, delete)
- Export (CSV, JSON)

### Tab: Validation Rules
List of all validation rules for this object
- Structural (type, required, format)
- Business (CPF valid, balance >= 0)
- Regulatory (BACEN limits, operating hours)
- Each rule shows: condition, error message, source (regulation link)
- Add new rule button

### Tab: FSM
Visual finite state machine editor
- States as nodes (PENDING, ACTIVE, SUSPENDED, CLOSED)
- Transitions as edges with conditions
- Current state highlighted
- Edit transitions (add conditions, validations)

### Tab: History
Version history of this object definition
- Timeline view
- Each version: number, date, author, changes summary
- Compare versions (diff view)
- Rollback to previous version

---

## 4. Edit Object Definition Form

Similar to create, but:
- Pre-filled fields
- Version increment (1.0.0 → 1.1.0 or 2.0.0)
- Impact analysis: Shows how many instances will be affected
- Migration strategy: Auto-migrate data or manual
- Breaking changes warning if schema incompatible

---

## Components Used (shadcn/ui)

- Accordion (for grouped sections)
- Table, DataTable (with sorting, filtering)
- Form, Input, Textarea, Select, Checkbox
- Tabs, Card, Badge
- Dialog (modals for confirmations)
- Alert (warnings for breaking changes)
- Collapsible (for field details)
- Lucide Icons: Package, Edit, Trash2, Plus, FileText, GitBranch

## Special Components
- **JSON Schema Editor**: Visual editor for schema (alternative: monaco-editor with JSON schema)
- **FSM Visualizer**: React Flow for state machine diagram

---

## Accessibility (WCAG 2.1 AA)

- Table headers properly associated
- Form labels for all inputs
- Keyboard navigation for tables (arrow keys)
- Screen reader support for FSM diagram
- Focus management in modals
- High contrast mode support

---

## i18n Keys

```json
{
  "objects.list.title": "Object Definitions",
  "objects.create.withAI": "Gerar com IA",
  "objects.create.manual": "Criar Manualmente",
  "objects.types.dataEntity": "Data Entity",
  "objects.types.integration": "Integration",
  "objects.types.uiComponent": "UI Component",
  "objects.types.workflow": "Workflow",
  "objects.fields.name": "Nome",
  "objects.fields.type": "Tipo",
  "objects.fields.required": "Obrigatório",
  "objects.fields.validation": "Validação",
  "objects.tabs.schema": "Schema",
  "objects.tabs.instances": "Instances",
  "objects.tabs.validations": "Validation Rules",
  "objects.tabs.fsm": "FSM",
  "objects.tabs.history": "History"
}
```

---

## API Endpoints

```
GET    /api/v1/oracles/:oracleId/objects             - List
POST   /api/v1/oracles/:oracleId/objects             - Create
POST   /api/v1/oracles/:oracleId/objects/generate    - Generate with AI (RF011)
GET    /api/v1/oracles/:oracleId/objects/:id         - Get details
PUT    /api/v1/oracles/:oracleId/objects/:id         - Update
DELETE /api/v1/oracles/:oracleId/objects/:id         - Delete
GET    /api/v1/oracles/:oracleId/objects/:id/history - Version history
GET    /api/v1/oracles/:oracleId/objects/:id/instances - List instances
```

---

**Status**: Ready for Implementation  
**Stack Compliance**: ✅ Next.js 14, shadcn/ui, React Hook Form, Zod  
**Accessibility**: ✅ WCAG 2.1 AA  
**AI-Driven**: ✅ RF011 (Generate with AI)  
**Responsive**: ✅ Mobile, Tablet, Desktop

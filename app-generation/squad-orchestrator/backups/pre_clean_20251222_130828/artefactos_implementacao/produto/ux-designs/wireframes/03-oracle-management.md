# Oracle Management Interface Wireframe

**Screen**: Oracle Detail & Management  
**Stack**: Next.js 14 + shadcn/ui + React Flow + i18next  
**Purpose**: CRUD operations for Oracles (RF001)

## Overview

This screen is the core of SuperCore - where users create, view, and manage Oracles. Each Oracle is a knowledge base that generates complete solutions for a specific domain.

---

## 1. Create New Oracle Screen

### Layout
```
┌────────────────────────────────────────────────────────────┐
│ ← Voltar para Dashboard                                    │
│                                                            │
│ Criar Novo Oráculo                                         │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Passo 1 de 2: Informações Básicas                    │  │
│ │                                                       │  │
│ │ Nome do Oráculo *                                    │  │
│ │ [_______________________________________________]     │  │
│ │                                                       │  │
│ │ Tipo *                                               │  │
│ │ ○ Backend  ○ Frontend                               │  │
│ │                                                       │  │
│ │ Domínio *                                            │  │
│ │ [Select: Banking, CRM, Healthcare, ERP, Custom...]  │  │
│ │                                                       │  │
│ │ Descrição                                            │  │
│ │ [____________________________]                       │  │
│ │ [____________________________]                       │  │
│ │ [____________________________]                       │  │
│ │                                                       │  │
│ │ Idiomas Suportados *                                 │  │
│ │ [x] Português (PT-BR)                               │  │
│ │ [x] Inglês (EN)                                     │  │
│ │ [ ] Espanhol (ES)                                   │  │
│ │                                                       │  │
│ │                      [Cancelar] [Próximo Passo →]    │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Step 2: Configuration (for Backend Oracles)
- CNPJ/CPF (optional)
- Licenças/Registrações
- Integrações Autorizadas (multi-select)
- Políticas Internas (file upload)

### Step 2: Configuration (for Frontend Oracles)
- Connected Oracles (select which backend Oracles to connect)
- IAM Configuration (Keycloak/Cerbos settings)
- Theme Settings (color scheme, logo upload)
- Menu Structure (configure navigation)

---

## 2. Oracle List View

Already covered in Dashboard (02-dashboard.md)

---

## 3. Oracle Detail View

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│ ← Voltar  |  [Icon] Banking Hub           [⚙️ Editar] [🗑 Del]│
│                                                              │
│ Core Banking Platform                                        │
│ Domain: Banking | Type: Backend | Status: ● Active          │
│                                                              │
│ ┌─ Tabs ────────────────────────────────────────────────┐  │
│ │ Visão Geral | Objetos | Agentes | Workflows | Config  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [TAB: Visão Geral]                                          │
│                                                              │
│ Estatísticas                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ 12       │ │ 5        │ │ 3        │ │ 450      │       │
│ │ Objects  │ │ Agents   │ │ Workflows│ │ Instances│       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ Knowledge Graph Visualization                                │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ │   [Interactive React Flow Graph showing:            │  │
│ │    - Object Definitions as nodes                      │  │
│ │    - Relationships as edges                           │  │
│ │    - Agents connected to objects                      │  │
│ │    - Workflows connecting multiple objects]           │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Connected Oracles (if Frontend type)                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ → CoreBanking API  (5 tools used)                     │  │
│ │ → KYC Service      (3 tools used)                     │  │
│ │ → Compliance Engine (2 tools used)                    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Recent Activity                                              │
│ • Object Account updated 2h ago                             │
│ • Agent ValidationAgent executed successfully 3h ago        │
│ • Workflow OnboardingWorkflow completed 5h ago              │
│                                                              │
│                                       [▶️ Deploy Oracle]     │
└──────────────────────────────────────────────────────────────┘
```

### Tab: Objetos
Shows list of Object Definitions in this Oracle
- Table view with columns: Name, Type, Fields Count, Instances Count, Last Modified
- Actions: View, Edit, Delete, Create Instance
- Filter by type (Data Entity, Integration, UI Component, Workflow)
- Search bar

### Tab: Agentes
Shows list of AI Agents in this Oracle
- Card view with: Name, Role, Responsibilities, Tools Available
- Actions: View, Edit, Test, Delete
- Create New Agent button

### Tab: Workflows
Shows list of Workflows in this Oracle
- Visual preview (mini React Flow diagram)
- Metadata: Name, Steps Count, Status, Last Execution
- Actions: View, Edit, Test Run, Delete

### Tab: Config
Oracle configuration form (editable):
- Basic info (name, description, domain)
- Type-specific settings (CNPJ, licenses, integrations, etc)
- Connected Oracles (if Frontend)
- Save Changes button

---

## 4. Edit Oracle Screen

Similar to Create Oracle but:
- Pre-filled fields
- Additional section: Danger Zone (Delete Oracle with confirmation)
- Shows last modified timestamp and user

---

## 5. Delete Oracle Confirmation Modal

```
┌────────────────────────────────────────────┐
│ ⚠️  Deletar Oráculo?                       │
│                                            │
│ Você está prestes a deletar o Oráculo     │
│ Banking Hub. Esta ação não pode ser       │
│ desfeita.                                  │
│                                            │
│ Todos os dados relacionados serão         │
│ perdidos:                                  │
│ • 12 Object Definitions                   │
│ • 5 Agents                                │
│ • 3 Workflows                             │
│ • 450 Instances                           │
│                                            │
│ Digite o nome do Oráculo para confirmar:  │
│ [_______________________]                  │
│                                            │
│           [Cancelar] [Deletar Oráculo]    │
└────────────────────────────────────────────┘
```

---

## 6. Clone Oracle Modal

```
┌────────────────────────────────────────────┐
│ Clonar Oráculo                             │
│                                            │
│ Você está clonando: Banking Hub           │
│                                            │
│ Novo Nome *                                │
│ [Banking Hub - Copy______________]         │
│                                            │
│ O que clonar?                              │
│ [x] Object Definitions                    │
│ [x] Agents                                │
│ [x] Workflows                             │
│ [ ] Instances (não recomendado)           │
│ [x] Configuration                         │
│                                            │
│           [Cancelar] [Clonar Oráculo]     │
└────────────────────────────────────────────┘
```

---

## Components Used (shadcn/ui)

- Card, Tabs, Table, Dialog (modals)
- Input, Textarea, Select, Checkbox, RadioGroup
- Button, Badge, Separator
- Alert (for warnings/errors)
- Form components with react-hook-form
- Lucide Icons: Database, Settings, Trash2, Copy, Play, Edit, ChevronLeft

## Special Libraries
- **React Flow**: For knowledge graph visualization
  - Nodes for Objects, Agents, Workflows
  - Edges for relationships
  - Zoom, pan, minimap
  - Interactive (click node → navigate to detail)

---

## Accessibility (WCAG 2.1 AA)

- Form labels associated with inputs
- Required fields marked with *
- Error messages with role=alert
- Modal focus trap
- Keyboard navigation (Tab, Enter, Esc)
- Screen reader announcements for status changes
- Color contrast for all text
- Focus indicators

---

## i18n Keys

```json
{
  "oracle.create.title": "Criar Novo Oráculo",
  "oracle.edit.title": "Editar Oráculo",
  "oracle.type.backend": "Backend",
  "oracle.type.frontend": "Frontend",
  "oracle.domain.banking": "Banking",
  "oracle.domain.crm": "CRM",
  "oracle.domain.healthcare": "Healthcare",
  "oracle.delete.confirm": "Digite o nome do Oráculo para confirmar",
  "oracle.clone.title": "Clonar Oráculo",
  "oracle.status.active": "Ativo",
  "oracle.tabs.overview": "Visão Geral",
  "oracle.tabs.objects": "Objetos",
  "oracle.tabs.agents": "Agentes",
  "oracle.tabs.workflows": "Workflows",
  "oracle.tabs.config": "Configuração"
}
```

---

## API Endpoints

```
GET    /api/v1/oracles              - List
POST   /api/v1/oracles              - Create
GET    /api/v1/oracles/:id          - Get details
PUT    /api/v1/oracles/:id          - Update
DELETE /api/v1/oracles/:id          - Delete
POST   /api/v1/oracles/:id/clone    - Clone
GET    /api/v1/oracles/:id/graph    - Get knowledge graph data
GET    /api/v1/oracles/:id/stats    - Get statistics
```

---

**Status**: Ready for Implementation  
**Stack Compliance**: ✅ Next.js 14, shadcn/ui, React Flow, i18next  
**Accessibility**: ✅ WCAG 2.1 AA  
**Responsive**: ✅ Mobile, Tablet, Desktop  
**Multi-tenancy**: ✅ Isolated by oracle_id

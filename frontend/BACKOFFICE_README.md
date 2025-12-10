# SuperCore Backoffice - Object Definitions CRUD

## Overview

This is the complete implementation of the Backoffice CRUD system for Object Definitions in the SuperCore platform. The system allows Product Managers and Admins to create, view, edit, and delete object definitions through a modern, user-friendly interface.

## Features

### 1. Object Definitions List
- **Path**: `/backoffice/object-definitions`
- View all object definitions in a sortable table
- Search/filter by name or display name
- Quick actions: View, Edit, Delete
- Badge indicators for status (Active/Inactive) and version
- State count display

### 2. Object Definition View
- **Path**: `/backoffice/object-definitions/[id]`
- Comprehensive view with tabbed interface:
  - **Overview**: Basic information (name, version, status, dates)
  - **Schema**: JSON Schema viewer with syntax highlighting
  - **State Machine**: Visual FSM viewer showing states and transitions
  - **Validation Rules**: List of validation rules with configurations
  - **UI Hints**: JSON viewer for UI rendering hints
  - **Relationships**: List of allowed relationships
- Quick edit button
- Breadcrumb navigation

### 3. Create Object Definition
- **Path**: `/backoffice/object-definitions/new`
- Wizard-style form with validation:
  - Basic info (name, display name, description)
  - JSON Schema editor with Monaco Editor
  - FSM configuration
  - UI Hints editor
- Real-time JSON validation
- Default templates provided
- Client-side validation with helpful error messages

### 4. Edit Object Definition
- **Path**: `/backoffice/object-definitions/[id]/edit`
- Same form as create, pre-populated with existing data
- Name field disabled (immutable)
- Version automatically incremented on save

## Tech Stack

### UI Components
- **shadcn/ui**: Modern, accessible component library
  - Table, Card, Button, Input, Textarea, Select
  - Tabs, Badge, Alert, Dialog, Label
- **Lucide React**: Icon library
- **Monaco Editor**: Advanced JSON editor with syntax highlighting
- **React Syntax Highlighter**: Code display with themes

### Form Management
- **React Hook Form**: Form state management (ready to integrate)
- **Zod**: Schema validation (ready to integrate)
- Custom validation logic for JSON schemas

### API Client
- Type-safe API client with TypeScript
- Error handling and loading states
- Authentication with JWT tokens
- Proper HTTP status code handling

## Directory Structure

```
frontend/
├── app/
│   └── backoffice/
│       ├── layout.tsx                    # Backoffice layout with sidebar
│       ├── page.tsx                      # Dashboard
│       └── object-definitions/
│           ├── page.tsx                  # List page
│           ├── new/
│           │   └── page.tsx              # Create page
│           └── [id]/
│               ├── page.tsx              # View page
│               └── edit/
│                   └── page.tsx          # Edit page
├── components/
│   ├── ui/                               # shadcn/ui components
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   └── toast.tsx
│   └── backoffice/
│       └── object-definitions/
│           ├── ObjectDefinitionForm.tsx  # Main form component
│           ├── SchemaEditor.tsx          # Monaco editor wrapper
│           ├── FSMViewer.tsx             # State machine visualizer
│           └── JSONViewer.tsx            # JSON display component
├── lib/
│   ├── api/
│   │   └── object-definitions.ts         # API client
│   ├── types/
│   │   └── object-definition.ts          # TypeScript types
│   ├── auth-context.tsx                  # Auth context
│   └── utils.ts                          # Utility functions
└── hooks/
    └── use-toast.ts                      # Toast notifications
```

## Usage

### Starting the Frontend

```bash
cd frontend
npm install
npm run dev
```

The backoffice will be available at `http://localhost:3000/backoffice`

### Creating an Object Definition

1. Navigate to `/backoffice/object-definitions`
2. Click "New Object"
3. Fill in the form:
   - **Name**: Unique slug (e.g., `cliente_pf`)
   - **Display Name**: Human-readable name (e.g., "Cliente Pessoa Física")
   - **Description**: Optional description
   - **Schema**: JSON Schema Draft 7 (Monaco editor with validation)
   - **State Machine**: FSM configuration with states and transitions
   - **UI Hints**: Optional rendering hints
4. Click "Create"

### Example Object Definition

```json
{
  "name": "cliente_pf",
  "display_name": "Cliente Pessoa Física",
  "description": "Cliente pessoa física do banco",
  "schema": {
    "type": "object",
    "properties": {
      "cpf": {
        "type": "string",
        "pattern": "^\\d{11}$",
        "description": "CPF do cliente"
      },
      "nome_completo": {
        "type": "string",
        "minLength": 3,
        "description": "Nome completo do cliente"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "data_nascimento": {
        "type": "string",
        "format": "date"
      }
    },
    "required": ["cpf", "nome_completo", "email"]
  },
  "states": {
    "initial": "CADASTRO_PENDENTE",
    "states": [
      "CADASTRO_PENDENTE",
      "DOCUMENTOS_ENVIADOS",
      "EM_ANALISE",
      "APROVADO",
      "ATIVO",
      "BLOQUEADO",
      "INATIVO"
    ],
    "transitions": [
      {
        "from": "CADASTRO_PENDENTE",
        "to": "DOCUMENTOS_ENVIADOS",
        "event": "enviar_documentos"
      },
      {
        "from": "DOCUMENTOS_ENVIADOS",
        "to": "EM_ANALISE",
        "event": "iniciar_analise"
      },
      {
        "from": "EM_ANALISE",
        "to": "APROVADO",
        "event": "aprovar"
      },
      {
        "from": "APROVADO",
        "to": "ATIVO",
        "event": "ativar"
      },
      {
        "from": "ATIVO",
        "to": "BLOQUEADO",
        "event": "bloquear"
      },
      {
        "from": "BLOQUEADO",
        "to": "ATIVO",
        "event": "desbloquear"
      }
    ]
  },
  "ui_hints": {
    "widgets": {
      "cpf": "cpf_mask",
      "email": "email",
      "data_nascimento": "date_picker"
    },
    "labels": {
      "cpf": "CPF",
      "nome_completo": "Nome Completo",
      "email": "E-mail",
      "data_nascimento": "Data de Nascimento"
    },
    "help_text": {
      "cpf": "Digite apenas os números do CPF",
      "data_nascimento": "Cliente deve ter mais de 18 anos"
    }
  }
}
```

## API Endpoints

The frontend connects to these backend endpoints:

- `GET /api/v1/object-definitions` - List all definitions
- `GET /api/v1/object-definitions/:id` - Get single definition
- `POST /api/v1/object-definitions` - Create new definition
- `PUT /api/v1/object-definitions/:id` - Update definition
- `DELETE /api/v1/object-definitions/:id` - Soft delete definition

## Authentication & Authorization

### Authentication
- Uses Logto for authentication
- JWT tokens passed in `Authorization: Bearer <token>` header
- Automatic token refresh

### Authorization (RBAC)
- **View**: Any authenticated user
- **Create/Edit**: `admin`, `product_manager` roles
- **Delete**: `admin` role only

## Validation

### Client-Side Validation
- Name must be lowercase slug (alphanumeric, hyphens, underscores)
- Display name is required
- JSON Schema must be valid and have type "object"
- FSM must have "initial" and "states" fields
- All JSON fields validated for syntax errors

### Server-Side Validation
- Enforced by backend
- Duplicate names rejected
- Invalid JSON schemas rejected
- State machine validation

## Error Handling

All errors are handled gracefully with:
- Toast notifications for user feedback
- Error messages in forms
- Network error recovery
- Loading states
- Empty states

## Responsive Design

The backoffice is fully responsive:
- Desktop: Full sidebar with navigation
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu with drawer

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- Focus management
- Color contrast compliance

## Testing

### Manual Testing Checklist

- [ ] List page loads with data
- [ ] Search/filter works
- [ ] Create new object definition
- [ ] View object definition (all tabs)
- [ ] Edit existing object definition
- [ ] Delete object definition (with confirmation)
- [ ] Validation errors display correctly
- [ ] Toast notifications work
- [ ] Loading states display
- [ ] Navigation works (breadcrumbs, back buttons)
- [ ] Responsive on mobile/tablet
- [ ] Authentication required (redirect if not logged in)

### Future Automated Testing
- Unit tests with Jest + React Testing Library
- E2E tests with Playwright
- Visual regression tests with Storybook + Chromatic

## Next Steps

### Phase 1 Completed
- [x] Object Definitions CRUD
- [x] JSON Schema editor
- [x] FSM viewer
- [x] Authentication integration

### Phase 2 (Future)
- [ ] Object Instances CRUD
- [ ] Dynamic form generation from schemas
- [ ] Relationships visualization
- [ ] Validation rules CRUD
- [ ] RAG integration (ask questions about objects)
- [ ] Advanced FSM editor with React Flow
- [ ] Bulk operations
- [ ] Export/Import definitions
- [ ] Version history
- [ ] Audit logs

## Troubleshooting

### Monaco Editor not loading
```bash
npm install @monaco-editor/react
```

### Syntax highlighter not working
```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### Authentication errors
Check that:
1. Backend is running on `http://localhost:8080`
2. Logto is configured correctly
3. JWT token is being sent in Authorization header

### API connection issues
Set environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Contributing

When adding new features:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states
5. Write responsive CSS
6. Test on multiple screen sizes
7. Document new components

## Support

For issues or questions:
1. Check this README
2. Review the backend API documentation
3. Check the main project CLAUDE.md file
4. Review component source code (well-commented)

---

**Built with ❤️ for SuperCore Platform**

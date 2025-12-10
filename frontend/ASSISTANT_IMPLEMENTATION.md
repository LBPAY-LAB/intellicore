# Natural Language Assistant - Implementation Guide

## Overview

The Natural Language Assistant is a conversational interface that helps users create Object Definitions without technical knowledge. Users answer 7 simple questions in natural language, and the system generates a complete Object Definition with schema, validations, state machine, and relationships.

## Architecture

### Components Structure

```
frontend/
├── app/
│   └── (authenticated)/
│       ├── assistant/
│       │   └── page.tsx          # Main assistant page
│       └── layout.tsx             # Authenticated routes layout
│
├── components/
│   ├── assistant/
│   │   ├── ChatMessage.tsx       # Individual message display
│   │   ├── InteractiveMessage.tsx # Interactive questions (select/multiselect/confirm)
│   │   ├── ObjectDefinitionPreview.tsx # Preview of created object
│   │   └── README.md             # Component documentation
│   └── ui/
│       ├── scroll-area.tsx       # Scrollable container
│       ├── separator.tsx         # Visual separator
│       ├── badge.tsx             # Badge component (already existed)
│       ├── button.tsx            # Button component (already existed)
│       ├── card.tsx              # Card component (already existed)
│       └── input.tsx             # Input component (already existed)
│
└── lib/
    ├── api/
    │   └── assistant.ts          # API client (mock implementation)
    └── store/
        └── assistant-store.ts    # Zustand store for state management
```

## Features Implemented

### 1. Conversational Interface
- ✅ Chat-style UI with message history
- ✅ User messages on the right (blue background)
- ✅ Assistant messages on the left (white background)
- ✅ Markdown support in messages
- ✅ Timestamp display
- ✅ Avatar icons (Bot/User)

### 2. Interactive Questions
- ✅ **Text Input**: Free-form text responses
- ✅ **Single Select**: Button-based selection
- ✅ **Multi-Select**: Checkbox-based multiple selection
- ✅ **Confirmation**: Yes/No buttons

### 3. Object Definition Preview
- ✅ Formatted display of object structure
- ✅ Fields with types and validations
- ✅ State machine visualization
- ✅ Relationships display
- ✅ Automatic validations list

### 4. State Management
- ✅ Zustand store for conversation state
- ✅ LocalStorage persistence
- ✅ Auto-recovery of incomplete conversations
- ✅ Loading and error states

### 5. UX Features
- ✅ Auto-scroll to latest message
- ✅ Typing indicator animation
- ✅ Focus management (auto-focus input)
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- ✅ New conversation button
- ✅ Responsive design
- ✅ Smooth transitions

## Conversation Flow

The assistant guides users through 7 steps:

### Step 0: Object Name
**Question**: "Qual o nome do objeto que você quer criar?"
**Type**: Text
**Example**: "Cliente Pessoa Física"

### Step 1: Description
**Question**: "Descreva em suas palavras o que é esse objeto e para que serve."
**Type**: Text
**Example**: "É uma pessoa que vai abrir conta no banco e precisa passar por KYC"

### Step 2: Fields
**Question**: "Quais informações precisam ser coletadas? Liste os campos necessários."
**Type**: Text
**Example**: "CPF, Nome Completo, Data de Nascimento, Endereço, Telefone, Email"

### Step 3: Validations
**Question**: "Algum desses campos tem validação especial do BACEN ou compliance?"
**Type**: Multi-select
**Options**:
- CPF (validação completa)
- CNPJ
- Email
- Telefone BR
- CEP
- Outro

### Step 4: States
**Question**: "Quais são os estados possíveis deste objeto durante seu ciclo de vida?"
**Type**: Text
**Example**: "Cadastro Iniciado → Documentos Pendentes → Em Análise → Aprovado → Ativo → Bloqueado → Inativo"

### Step 5: Relationships
**Question**: "Este objeto se relaciona com quais outros objetos?"
**Type**: Text
**Example**: "Cliente pode ser TITULAR de Conta, PAI de outro Cliente (dependente)"

### Step 6: Preview & Confirmation
**Question**: "Vou mostrar um preview do que será criado. Confirma?"
**Type**: Preview + Confirm
**Shows**: Formatted preview with all details
**Options**: Sim / Não

## Mock API Implementation

The current implementation uses a **mock API** that simulates the backend behavior. This allows frontend development to proceed independently while the backend is being built.

### Key Features of Mock:
- Generates conversation IDs
- Parses natural language responses
- Creates preview from user answers
- Saves to localStorage for persistence
- Simulates async operations

### Mock Logic:
```typescript
// Field parsing
"CPF, Nome, Email" → [
  { name: "cpf", type: "string", validation: "cpf_validation" },
  { name: "nome", type: "string", required: true },
  { name: "email", type: "string", validation: "email_format" }
]

// State parsing
"Pendente → Ativo → Bloqueado" → ["PENDENTE", "ATIVO", "BLOQUEADO"]

// Relationship parsing
"Cliente TITULAR de Conta" → {
  type: "TITULAR_DE",
  target: "Conta",
  cardinality: "1:N"
}
```

## Integration with Backend

When the backend is ready, replace the mock API with real endpoints:

### Required Endpoints:

```typescript
// POST /api/assistant/conversations
// Start a new conversation
{
  "conversation_id": "uuid"
}

// POST /api/assistant/conversations/:id/messages
// Send a message
{
  "message": "Cliente Pessoa Física"
}
// Response:
{
  "message": "Next question...",
  "step": {...},
  "preview": {...} // optional
}

// POST /api/assistant/conversations/:id/confirm
// Confirm and create object definition
{
  "object_definition_id": "uuid"
}

// GET /api/assistant/conversations/:id
// Retrieve conversation
{
  "id": "uuid",
  "messages": [...],
  "currentStep": 3,
  "answers": {...}
}
```

### Backend Responsibilities:
1. **LLM Integration**: Use Claude/GPT to process natural language
2. **Schema Generation**: Generate JSON Schema from field descriptions
3. **FSM Generation**: Create state machine from state descriptions
4. **Validation Mapping**: Map field names to validation rules
5. **Object Creation**: Actually create the Object Definition in database

## Usage

### Accessing the Assistant

1. Navigate to the main dashboard (`/`)
2. Click on "Abrir Assistente" button in the Assistant card
3. Or directly navigate to `/assistant`

### Creating an Object

1. Read the initial question from the assistant
2. Type your answer in the input field
3. Press Enter or click "Enviar"
4. Continue answering questions
5. For multi-select questions, check the options you want and click "Continuar"
6. Review the preview of the object
7. Click "Sim" to confirm creation
8. Object is created and you're redirected to view it

### Starting a New Conversation

- Click "Nova Conversa" button in the header
- Confirms before resetting to avoid accidental data loss

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line (in future multi-line support)
- **Escape**: Cancel (future enhancement)

## Styling

### Design System
- **Primary Color**: Blue (#3B82F6)
- **Secondary Color**: Purple (#8B5CF6)
- **User Messages**: Blue background (#3B82F6)
- **Assistant Messages**: White background with border
- **Gradients**: Blue to Purple for special elements

### Animations
- Smooth scroll to latest message
- Typing indicator with bouncing dots
- Fade-in for new messages
- Button hover effects

## Accessibility

- ✅ Keyboard navigation support
- ✅ Focus management (auto-focus input)
- ✅ ARIA labels on interactive elements
- ✅ High contrast colors
- ✅ Screen reader friendly text
- ✅ Semantic HTML structure

## Testing

### Manual Testing Checklist

- [ ] Start a new conversation
- [ ] Answer all 7 questions
- [ ] Test text input
- [ ] Test single select
- [ ] Test multi-select with multiple options
- [ ] Test confirm buttons
- [ ] Review preview display
- [ ] Confirm creation
- [ ] Start another conversation
- [ ] Refresh page (should persist conversation)
- [ ] Test on mobile device
- [ ] Test keyboard navigation

### Test Scenarios

**Scenario 1: Happy Path**
```
User: Cliente Pessoa Física
User: Uma pessoa que vai abrir conta
User: CPF, Nome, Email, Telefone
User: [Selects: CPF, Email, Telefone BR]
User: Pendente → Ativo → Bloqueado
User: Cliente TITULAR de Conta
User: [Confirms preview]
Result: Object created successfully
```

**Scenario 2: Error Recovery**
```
User: [Starts conversation]
User: [Closes browser]
User: [Reopens browser]
Result: Conversation should be recovered from localStorage
```

## Known Limitations

1. **Mock API**: Currently using mock, needs real backend
2. **No conversation history**: Can't view past conversations
3. **No edit functionality**: Can't edit previous answers
4. **Single conversation**: Can only have one active conversation
5. **Limited NLP**: Simple parsing, not using real LLM

## Future Enhancements

### Phase 1 (Backend Integration)
- [ ] Replace mock API with real endpoints
- [ ] Integrate with Claude/GPT for NLP
- [ ] Create Object Definitions in database
- [ ] Add error handling from backend

### Phase 2 (UX Improvements)
- [ ] Conversation history sidebar
- [ ] Edit previous answers
- [ ] Multiple active conversations
- [ ] Export/import conversations
- [ ] Voice input support

### Phase 3 (AI Enhancements)
- [ ] Smart suggestions based on similar objects
- [ ] Auto-complete for field names
- [ ] Validation recommendations
- [ ] Relationship suggestions based on existing objects

### Phase 4 (Advanced Features)
- [ ] Multi-language support
- [ ] Template library (pre-filled conversations)
- [ ] Collaboration (multiple users on same object)
- [ ] Version control for objects

## Dependencies

```json
{
  "zustand": "^4.5.0",              // State management with persistence
  "react-markdown": "^9.0.0",       // Markdown rendering (already installed)
  "lucide-react": "^0.309.0",       // Icons (already installed)
  "@radix-ui/*": "^1.0.*"           // UI primitives (already installed)
}
```

## Files Changed/Created

### New Files (10)
1. `/app/(authenticated)/assistant/page.tsx` - Main assistant page
2. `/app/(authenticated)/layout.tsx` - Authenticated routes layout
3. `/components/assistant/ChatMessage.tsx` - Message component
4. `/components/assistant/InteractiveMessage.tsx` - Interactive questions
5. `/components/assistant/ObjectDefinitionPreview.tsx` - Preview component
6. `/components/assistant/README.md` - Component documentation
7. `/components/ui/scroll-area.tsx` - Scroll container
8. `/components/ui/separator.tsx` - Separator component
9. `/lib/api/assistant.ts` - API client with mock
10. `/lib/store/assistant-store.ts` - Zustand store

### Modified Files (2)
1. `/app/page.tsx` - Added assistant quick access card
2. `/package.json` - Added zustand dependency

## Performance Considerations

- **LocalStorage**: Conversations stored locally for persistence
- **Auto-scroll**: Smooth scroll to latest message without jank
- **Debouncing**: Input debounced to avoid excessive re-renders
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo used for message components

## Security Considerations

- **Input Sanitization**: All user input sanitized before display
- **XSS Prevention**: React automatically escapes content
- **CSRF Protection**: Keycloak tokens used for API auth
- **Data Privacy**: Conversations stored in user's browser only

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Issue: Conversation not persisting
**Solution**: Check localStorage is enabled in browser

### Issue: Messages not scrolling
**Solution**: Check ScrollArea component has proper height

### Issue: Typing indicator stuck
**Solution**: Clear localStorage and restart conversation

### Issue: Preview not showing
**Solution**: Check console for parsing errors

## Support

For questions or issues:
1. Check this documentation
2. Check component README files
3. Check browser console for errors
4. Contact the development team

---

**Status**: ✅ Complete (Mock implementation)
**Next Steps**: Backend integration
**Last Updated**: 2025-12-10

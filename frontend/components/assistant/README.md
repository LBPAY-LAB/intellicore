# Natural Language Assistant

The Natural Language Assistant helps users create Object Definitions through conversational interface without technical knowledge.

## Components

### ChatMessage
Displays individual messages in the conversation.

**Props:**
- `role`: 'user' | 'assistant' - Who sent the message
- `content`: string - Message content (supports markdown)
- `timestamp`: Date - When the message was sent
- `type`: 'text' | 'select' | 'multiselect' | 'confirm' | 'preview' - Message type

**Features:**
- User messages aligned right with blue background
- Assistant messages aligned left with white background
- Markdown rendering support
- Timestamp display
- Avatar icons (Bot for assistant, User for user)

### InteractiveMessage
Handles interactive questions with options.

**Props:**
- `type`: 'select' | 'multiselect' | 'confirm' - Type of interaction
- `options`: string[] - Options for select/multiselect
- `onResponse`: (response: string | string[]) => void - Callback when user responds
- `disabled`: boolean - Disable interaction

**Types:**
- **select**: Single choice with buttons
- **multiselect**: Multiple choices with checkboxes
- **confirm**: Yes/No buttons

### ObjectDefinitionPreview
Shows a formatted preview of the Object Definition to be created.

**Props:**
- `preview`: ObjectDefinitionPreview - Preview data

**Displays:**
- Object name and description
- Fields with types and validations
- State machine flow
- Relationships
- Automatic validations

## Store

### useAssistantStore
Zustand store for managing conversation state.

**State:**
- `conversationId`: Current conversation ID
- `messages`: Array of messages
- `currentStep`: Current step in the conversation (0-6)
- `answers`: User answers by step
- `isLoading`: Loading state
- `error`: Error message if any

**Actions:**
- `startNewConversation()`: Start a new conversation
- `sendMessage(message)`: Send a message
- `confirmCreation()`: Confirm and create the object definition
- `loadConversation(id)`: Load an existing conversation
- `reset()`: Reset the store

**Persistence:**
- Conversations are saved to localStorage
- Auto-recovery of incomplete conversations

## API

### assistantAPI
Mock API implementation (to be replaced with real backend).

**Methods:**
- `startConversation()`: Initialize a new conversation
- `sendMessage(conversationId, message)`: Send a message and get response
- `confirmCreation(conversationId)`: Create the object definition
- `getConversation(conversationId)`: Retrieve conversation data

## Conversation Flow

1. **Step 0**: Object name
   - Type: text
   - Example: "Cliente Pessoa Física"

2. **Step 1**: Description
   - Type: text
   - Example: "Uma pessoa que vai abrir conta no banco"

3. **Step 2**: Fields
   - Type: text
   - Example: "CPF, Nome, Data de Nascimento, Email, Telefone"

4. **Step 3**: Validations
   - Type: multiselect
   - Options: CPF, CNPJ, Email, Telefone BR, CEP, Outro

5. **Step 4**: States
   - Type: text
   - Example: "Pendente → Ativo → Bloqueado → Inativo"

6. **Step 5**: Relationships
   - Type: text
   - Example: "Cliente pode ser TITULAR de Conta"

7. **Step 6**: Preview + Confirmation
   - Type: preview + confirm
   - Shows formatted preview
   - Yes/No buttons

## Usage Example

```tsx
import { useAssistantStore } from '@/lib/store/assistant-store';

function MyComponent() {
  const { startNewConversation, sendMessage } = useAssistantStore();

  // Start a new conversation
  await startNewConversation();

  // Send a message
  await sendMessage("Cliente Pessoa Física");
}
```

## Features

- Auto-scroll to latest message
- Typing indicator
- Message persistence (localStorage)
- Conversation recovery
- Markdown support in messages
- Mobile responsive
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Error handling with user-friendly messages

## Accessibility

- Keyboard navigation support
- Focus management (auto-focus on input)
- ARIA labels on interactive elements
- High contrast colors
- Screen reader friendly

## Future Enhancements

When backend is ready:
1. Replace mock API with real endpoints
2. Add conversation history sidebar
3. Add conversation search
4. Add export/import functionality
5. Add AI-powered suggestions
6. Add voice input support
7. Add multi-language support

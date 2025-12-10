export interface ConversationStep {
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  options?: string[];
  hint?: string;
}

export interface ObjectDefinitionPreview {
  name: string;
  display_name: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    validation?: string;
  }>;
  states: string[];
  relationships: Array<{
    type: string;
    target: string;
    cardinality: string;
  }>;
  validations: string[];
}

export interface AssistantResponse {
  message: string;
  step: ConversationStep;
  preview?: ObjectDefinitionPreview;
  completed?: boolean;
  object_definition_id?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'select' | 'multiselect' | 'confirm' | 'preview';
  options?: string[];
  preview?: ObjectDefinitionPreview;
}

export interface Conversation {
  id: string;
  messages: Message[];
  currentStep: number;
  answers: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock API implementation for development
// This will be replaced with real API calls when backend is ready

const CONVERSATION_STEPS: ConversationStep[] = [
  {
    question: "Qual o nome do objeto que você quer criar? (Ex: Cliente Pessoa Física, Conta Investimento)",
    type: 'text',
    hint: "Use um nome descritivo que o time de negócio entenda"
  },
  {
    question: "Descreva em suas palavras o que é esse objeto e para que serve.",
    type: 'text',
    hint: "Ex: 'Um cliente pessoa física é uma pessoa que tem conta no banco e precisa passar por KYC'"
  },
  {
    question: "Quais informações precisam ser coletadas? Liste os campos necessários.",
    type: 'text',
    hint: "Ex: CPF, Nome Completo, Data de Nascimento, Endereço, Telefone, Email"
  },
  {
    question: "Algum desses campos tem validação especial do BACEN ou compliance?",
    type: 'multiselect',
    options: ['CPF (validação completa)', 'CNPJ', 'Email', 'Telefone BR', 'CEP', 'Outro']
  },
  {
    question: "Quais são os estados possíveis deste objeto durante seu ciclo de vida?",
    type: 'text',
    hint: "Ex: Cadastro Pendente, Ativo, Bloqueado, Inativo"
  },
  {
    question: "Este objeto se relaciona com quais outros objetos?",
    type: 'text',
    hint: "Ex: Cliente pode ser TITULAR de Conta, PAI de outro Cliente (dependente)"
  },
  {
    question: "Vou mostrar um preview do que será criado. Confirma?",
    type: 'confirm'
  }
];

class AssistantAPI {
  private conversations: Map<string, Conversation> = new Map();

  async startConversation(): Promise<{ conversation_id: string }> {
    const conversationId = this.generateId();
    const conversation: Conversation = {
      id: conversationId,
      messages: [{
        id: this.generateId(),
        role: 'assistant',
        content: "Olá! Vou te ajudar a criar um novo objeto no SuperCore. " + CONVERSATION_STEPS[0].question,
        timestamp: new Date(),
        type: CONVERSATION_STEPS[0].type,
        options: CONVERSATION_STEPS[0].options
      }],
      currentStep: 0,
      answers: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(conversationId, conversation);

    // Save to localStorage
    this.saveToLocalStorage(conversationId, conversation);

    return { conversation_id: conversationId };
  }

  async sendMessage(conversationId: string, message: string): Promise<AssistantResponse> {
    const conversation = this.conversations.get(conversationId) || this.loadFromLocalStorage(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message
    conversation.messages.push({
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Store answer
    const currentStep = conversation.currentStep;
    conversation.answers[`step_${currentStep}`] = message;

    // Move to next step
    conversation.currentStep += 1;
    conversation.updatedAt = new Date();

    let response: AssistantResponse;

    // Check if this was the last step
    if (conversation.currentStep >= CONVERSATION_STEPS.length) {
      // Generate preview
      const preview = this.generatePreview(conversation.answers);

      const assistantMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: "Perfeito! Aqui está o preview do objeto que será criado:",
        timestamp: new Date(),
        type: 'preview',
        preview
      };

      conversation.messages.push(assistantMessage);

      response = {
        message: assistantMessage.content,
        step: {
          question: "Confirma a criação?",
          type: 'confirm'
        },
        preview,
        completed: false
      };
    } else {
      // Continue to next step
      const nextStep = CONVERSATION_STEPS[conversation.currentStep];

      const assistantMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: nextStep.question,
        timestamp: new Date(),
        type: nextStep.type,
        options: nextStep.options
      };

      conversation.messages.push(assistantMessage);

      response = {
        message: nextStep.question,
        step: nextStep,
        completed: false
      };
    }

    this.conversations.set(conversationId, conversation);
    this.saveToLocalStorage(conversationId, conversation);

    return response;
  }

  async confirmCreation(conversationId: string): Promise<{ object_definition_id: string }> {
    const conversation = this.conversations.get(conversationId) || this.loadFromLocalStorage(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // In real implementation, this would call the backend to create the object definition
    const objectDefinitionId = this.generateId();

    // Add completion message
    conversation.messages.push({
      id: this.generateId(),
      role: 'assistant',
      content: `Objeto "${conversation.answers.step_0}" criado com sucesso! Você já pode começar a cadastrar instâncias.`,
      timestamp: new Date()
    });

    this.saveToLocalStorage(conversationId, conversation);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { object_definition_id: objectDefinitionId };
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || this.loadFromLocalStorage(conversationId);
  }

  private generatePreview(answers: Record<string, any>): ObjectDefinitionPreview {
    const name = this.slugify(answers.step_0 || 'object');
    const fields = this.parseFields(answers.step_2 || '');
    const states = this.parseStates(answers.step_4 || '');
    const relationships = this.parseRelationships(answers.step_5 || '');
    const validations = Array.isArray(answers.step_3) ? answers.step_3 : [];

    return {
      name,
      display_name: answers.step_0 || 'Objeto',
      description: answers.step_1 || '',
      fields,
      states,
      relationships,
      validations
    };
  }

  private parseFields(fieldsText: string): Array<{name: string, type: string, required: boolean, validation?: string}> {
    // Simple parsing - split by comma or newline
    const fieldNames = fieldsText.split(/[,\n]/).map(f => f.trim()).filter(f => f);

    return fieldNames.map(name => ({
      name: this.slugify(name),
      type: this.inferType(name),
      required: true,
      validation: this.inferValidation(name)
    }));
  }

  private parseStates(statesText: string): string[] {
    // Parse states from text like "State1 → State2 → State3" or "State1, State2, State3"
    return statesText
      .split(/[,→\n]/)
      .map(s => s.trim())
      .filter(s => s)
      .map(s => this.toUpperSnakeCase(s));
  }

  private parseRelationships(relText: string): Array<{type: string, target: string, cardinality: string}> {
    // Simple parsing for relationships
    const relationships = [];
    const lines = relText.split(/[,\n]/).filter(l => l.trim());

    for (const line of lines) {
      if (line.toLowerCase().includes('titular')) {
        relationships.push({
          type: 'TITULAR_DE',
          target: 'Conta',
          cardinality: '1:N'
        });
      }
      if (line.toLowerCase().includes('pai') || line.toLowerCase().includes('dependente')) {
        relationships.push({
          type: 'PAI_DE',
          target: 'Cliente',
          cardinality: '1:N'
        });
      }
    }

    return relationships;
  }

  private inferType(fieldName: string): string {
    const lower = fieldName.toLowerCase();
    if (lower.includes('cpf') || lower.includes('cnpj')) return 'string';
    if (lower.includes('data') || lower.includes('nascimento')) return 'date';
    if (lower.includes('valor') || lower.includes('renda') || lower.includes('saldo')) return 'number';
    if (lower.includes('email')) return 'string';
    if (lower.includes('telefone')) return 'string';
    if (lower.includes('endereco') || lower.includes('endereço')) return 'object';
    return 'string';
  }

  private inferValidation(fieldName: string): string | undefined {
    const lower = fieldName.toLowerCase();
    if (lower.includes('cpf')) return 'cpf_validation';
    if (lower.includes('cnpj')) return 'cnpj_validation';
    if (lower.includes('email')) return 'email_format';
    if (lower.includes('telefone')) return 'phone_br';
    if (lower.includes('cep')) return 'cep_format';
    return undefined;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private toUpperSnakeCase(text: string): string {
    return this.slugify(text).toUpperCase();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private saveToLocalStorage(conversationId: string, conversation: Conversation): void {
    try {
      localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    } catch (error) {
      console.error('Failed to save conversation to localStorage:', error);
    }
  }

  private loadFromLocalStorage(conversationId: string): Conversation | null {
    try {
      const data = localStorage.getItem(`conversation_${conversationId}`);
      if (data) {
        const conversation = JSON.parse(data);
        // Convert date strings back to Date objects
        conversation.createdAt = new Date(conversation.createdAt);
        conversation.updatedAt = new Date(conversation.updatedAt);
        conversation.messages = conversation.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        return conversation;
      }
    } catch (error) {
      console.error('Failed to load conversation from localStorage:', error);
    }
    return null;
  }
}

export const assistantAPI = new AssistantAPI();

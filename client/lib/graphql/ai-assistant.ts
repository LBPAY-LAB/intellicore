import { gql } from '@apollo/client';

// ============================================
// AI Assistant GraphQL Operations
// ============================================

export const AI_CHAT_COMPLETION = gql`
  mutation AIChatCompletion($input: AIChatInput!) {
    aiChatCompletion(input: $input) {
      id
      content
      role
      sources {
        documentId
        documentName
        chunkText
        score
        pageNumber
      }
      processingTimeMs
      model
      createdAt
    }
  }
`;

export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($sessionId: String!, $limit: Int) {
    chatHistory(sessionId: $sessionId, limit: $limit) {
      id
      sessionId
      messages {
        id
        role
        content
        sources {
          documentId
          documentName
          chunkText
          score
          pageNumber
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CHAT_SESSION = gql`
  mutation CreateChatSession($input: CreateChatSessionInput!) {
    createChatSession(input: $input) {
      id
      title
      context
      createdAt
    }
  }
`;

export const DELETE_CHAT_SESSION = gql`
  mutation DeleteChatSession($sessionId: String!) {
    deleteChatSession(sessionId: $sessionId)
  }
`;

export const VALIDATE_DICT_REQUEST = gql`
  mutation ValidateDictRequest($input: DictValidationInput!) {
    validateDictRequest(input: $input) {
      isValid
      validationScore
      errors {
        field
        message
        severity
        suggestion
      }
      warnings {
        field
        message
        suggestion
      }
      suggestions {
        field
        currentValue
        suggestedValue
        reason
      }
      sources {
        documentId
        documentName
        chunkText
        score
      }
      processingTimeMs
    }
  }
`;

export const GET_AVAILABLE_LLM_MODELS = gql`
  query GetAvailableLLMModels {
    availableLLMModels {
      models {
        name
        modifiedAt
        size
        digest
        details {
          format
          family
          parameterSize
          quantizationLevel
        }
      }
      defaultModel
      selectedModel
    }
  }
`;

// ============================================
// TypeScript Types
// ============================================

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkText: string;
  score: number;
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: ChatSource[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  title?: string;
  context?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIChatInput {
  sessionId?: string;
  message: string;
  context?: string;
  useRag?: boolean;
  documentCategoryIds?: string[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIChatResponse {
  id: string;
  content: string;
  role: string;
  sources?: ChatSource[];
  processingTimeMs: number;
  model: string;
  createdAt: string;
}

export interface CreateChatSessionInput {
  title?: string;
  context?: string;
}

export interface DictValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface DictValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface DictValidationSuggestion {
  field: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

export interface DictValidationInput {
  requestType: 'REGISTRO_CHAVE' | 'EXCLUSAO_CHAVE' | 'PORTABILIDADE' | 'REIVINDICACAO';
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'EVP';
  keyValue: string;
  participantIspb?: string;
  accountType?: string;
  accountNumber?: string;
  branchNumber?: string;
  ownerName?: string;
  ownerDocument?: string;
  additionalData?: Record<string, unknown>;
}

export interface DictValidationResult {
  isValid: boolean;
  validationScore: number;
  errors: DictValidationError[];
  warnings: DictValidationWarning[];
  suggestions: DictValidationSuggestion[];
  sources: ChatSource[];
  processingTimeMs: number;
}

// ============================================
// LLM Model Types
// ============================================

export interface LLMModelDetails {
  format?: string;
  family?: string;
  parameterSize?: string;
  quantizationLevel?: string;
}

export interface LLMModel {
  name: string;
  modifiedAt?: string;
  size?: number;
  digest?: string;
  details?: LLMModelDetails;
}

export interface LLMModelsResponse {
  models: LLMModel[];
  defaultModel: string;
  selectedModel?: string;
}

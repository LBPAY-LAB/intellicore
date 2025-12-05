'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useState } from 'react';
import {
  AI_CHAT_COMPLETION,
  GET_CHAT_HISTORY,
  CREATE_CHAT_SESSION,
  DELETE_CHAT_SESSION,
  VALIDATE_DICT_REQUEST,
  GET_AVAILABLE_LLM_MODELS,
  AIChatInput,
  AIChatResponse,
  ChatSession,
  ChatMessage,
  DictValidationInput,
  DictValidationResult,
  CreateChatSessionInput,
  LLMModelsResponse,
  LLMModel,
} from '@/lib/graphql/ai-assistant';

// ============================================
// AI Chat Hook
// ============================================

export function useAIChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  const [sendMessage, { loading: sending }] = useMutation<
    { aiChatCompletion: AIChatResponse },
    { input: AIChatInput }
  >(AI_CHAT_COMPLETION);

  const handleSendMessage = useCallback(
    async (
      message: string,
      options?: {
        useRag?: boolean;
        documentCategoryIds?: string[];
        context?: string;
        model?: string;
      }
    ): Promise<AIChatResponse | null> => {
      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const { data } = await sendMessage({
          variables: {
            input: {
              sessionId,
              message,
              useRag: options?.useRag ?? true,
              documentCategoryIds: options?.documentCategoryIds,
              context: options?.context,
              model: options?.model || selectedModel,
            },
          },
        });

        if (data?.aiChatCompletion) {
          const assistantMessage: ChatMessage = {
            id: data.aiChatCompletion.id,
            role: 'assistant',
            content: data.aiChatCompletion.content,
            sources: data.aiChatCompletion.sources,
            createdAt: data.aiChatCompletion.createdAt,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return data.aiChatCompletion;
        }
        return null;
      } catch (error) {
        // Add error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        throw error;
      }
    },
    [sendMessage, sessionId, selectedModel]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    sendMessage: handleSendMessage,
    sending,
    isStreaming,
    clearMessages,
    selectedModel,
    setSelectedModel,
  };
}

// ============================================
// Chat History Hook
// ============================================

export function useChatHistory(sessionId: string, limit?: number) {
  const { data, loading, error, refetch } = useQuery<
    { chatHistory: ChatSession },
    { sessionId: string; limit?: number }
  >(GET_CHAT_HISTORY, {
    variables: { sessionId, limit },
    skip: !sessionId,
  });

  return {
    session: data?.chatHistory,
    loading,
    error,
    refetch,
  };
}

// ============================================
// Chat Session Management Hooks
// ============================================

export function useCreateChatSession() {
  const [createSession, { loading, error }] = useMutation<
    { createChatSession: { id: string; title: string; context?: string; createdAt: string } },
    { input: CreateChatSessionInput }
  >(CREATE_CHAT_SESSION);

  const handleCreate = useCallback(
    async (input: CreateChatSessionInput) => {
      const { data } = await createSession({ variables: { input } });
      return data?.createChatSession;
    },
    [createSession]
  );

  return {
    createSession: handleCreate,
    loading,
    error,
  };
}

export function useDeleteChatSession() {
  const [deleteSession, { loading, error }] = useMutation<
    { deleteChatSession: boolean },
    { sessionId: string }
  >(DELETE_CHAT_SESSION);

  const handleDelete = useCallback(
    async (sessionId: string) => {
      const { data } = await deleteSession({ variables: { sessionId } });
      return data?.deleteChatSession;
    },
    [deleteSession]
  );

  return {
    deleteSession: handleDelete,
    loading,
    error,
  };
}

// ============================================
// DICT Validation Hook
// ============================================

export function useDictValidation() {
  const [validate, { loading, error, data }] = useMutation<
    { validateDictRequest: DictValidationResult },
    { input: DictValidationInput }
  >(VALIDATE_DICT_REQUEST);

  const handleValidate = useCallback(
    async (input: DictValidationInput): Promise<DictValidationResult | null> => {
      const { data } = await validate({ variables: { input } });
      return data?.validateDictRequest || null;
    },
    [validate]
  );

  return {
    validate: handleValidate,
    loading,
    error,
    result: data?.validateDictRequest,
  };
}

// ============================================
// LLM Models Hook
// ============================================

export function useAvailableLLMModels() {
  const { data, loading, error, refetch } = useQuery<
    { availableLLMModels: LLMModelsResponse }
  >(GET_AVAILABLE_LLM_MODELS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    models: data?.availableLLMModels.models || [],
    defaultModel: data?.availableLLMModels.defaultModel || '',
    selectedModel: data?.availableLLMModels.selectedModel,
    loading,
    error,
    refetch,
  };
}

// Re-export types from graphql module for convenience
export type {
  DictValidationResult,
  DictValidationInput,
  DictValidationError,
  DictValidationWarning,
  DictValidationSuggestion,
  ChatMessage,
  ChatSession,
  AIChatInput,
  AIChatResponse,
  ChatSource,
  LLMModel,
  LLMModelsResponse,
} from '@/lib/graphql/ai-assistant';

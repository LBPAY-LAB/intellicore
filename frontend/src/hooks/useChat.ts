import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatConversation, ChatRequest, ChatResponse } from '@/types/assistant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function useChat() {
  const [conversation, setConversation] = useState<ChatConversation>({
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      updatedAt: new Date(),
    }));

    return newMessage;
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setConversation((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
      updatedAt: new Date(),
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
      });

      // Create assistant message placeholder
      const assistantMessage = addMessage({
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      try {
        abortControllerRef.current = new AbortController();

        const request: ChatRequest = {
          message: content,
          conversation_id: conversation.id,
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/assistant/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChatResponse = await response.json();

        // Update assistant message with response
        updateMessage(assistantMessage.id, {
          content: data.message,
          isStreaming: false,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';

        if (errorMessage !== 'The user aborted a request.') {
          setError(errorMessage);
          updateMessage(assistantMessage.id, {
            content: 'Sorry, I encountered an error. Please try again.',
            error: errorMessage,
            isStreaming: false,
          });
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [conversation.id, addMessage, updateMessage]
  );

  const regenerateLastMessage = useCallback(async () => {
    const messages = conversation.messages;
    if (messages.length < 2) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user');

    if (lastUserMessage) {
      // Remove the last assistant message
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
      }));

      // Resend the last user message
      await sendMessage(lastUserMessage.content);
    }
  }, [conversation.messages, sendMessage]);

  const clearConversation = useCallback(() => {
    setConversation({
      id: crypto.randomUUID(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    conversation,
    messages: conversation.messages,
    isLoading,
    error,
    sendMessage,
    regenerateLastMessage,
    clearConversation,
    stopGeneration,
  };
}

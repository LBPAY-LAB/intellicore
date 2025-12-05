'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIChat, useAvailableLLMModels } from '@/hooks/useAIAssistant';
import { ChatMessage, ChatSource, LLMModel } from '@/lib/graphql/ai-assistant';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface AIAssistantChatProps {
  sessionId?: string;
  title?: string;
  placeholder?: string;
  welcomeMessage?: string;
  context?: string;
  useRag?: boolean;
  documentCategoryIds?: string[];
  className?: string;
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: ChatMessage) => void;
}

// ============================================
// Sub-components
// ============================================

function MessageBubble({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        )}
      >
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        {message.sources && message.sources.length > 0 && (
          <SourceReferences sources={message.sources} />
        )}
        <div
          className={cn(
            'mt-1 text-xs',
            isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function SourceReferences({ sources }: { sources: ChatSource[] }) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        <svg
          className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {sources.length} fonte{sources.length > 1 ? 's' : ''} consultada{sources.length > 1 ? 's' : ''}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source, index) => (
            <div
              key={`${source.documentId}-${index}`}
              className="rounded bg-gray-50 p-2 text-xs dark:bg-gray-900"
            >
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {source.documentName}
                {source.pageNumber && ` (p. ${source.pageNumber})`}
              </div>
              <div className="mt-1 line-clamp-2 text-gray-500 dark:text-gray-400">
                {source.chunkText}
              </div>
              <div className="mt-1 text-gray-400">
                Relevancia: {Math.round(source.score * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/30">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0ms' }} />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '150ms' }} />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Processando...
        </span>
      </div>
    </div>
  );
}

function WelcomeMessage({ message }: { message: string }) {
  return (
    <div className="flex justify-center">
      <div className="max-w-md rounded-lg bg-blue-50 px-6 py-4 text-center dark:bg-blue-900/20">
        <div className="mb-2 text-2xl">🤖</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{message}</div>
      </div>
    </div>
  );
}

function ModelSelector({
  models,
  selectedModel,
  defaultModel,
  onModelChange,
  loading,
}: {
  models: LLMModel[];
  selectedModel: string | undefined;
  defaultModel: string;
  onModelChange: (model: string) => void;
  loading: boolean;
}) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="flex items-center gap-2">
      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <select
        value={selectedModel || defaultModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={loading}
        className={cn(
          'rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
          loading && 'cursor-wait opacity-50'
        )}
      >
        {models.length === 0 ? (
          <option value="">{loading ? 'Carregando...' : 'Nenhum modelo disponível'}</option>
        ) : (
          models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name} {model.details?.parameterSize && `(${model.details.parameterSize})`}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

function ChatInput({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !disabled) {
        onSend(input.trim());
        setInput('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    },
    [input, disabled, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900',
            'placeholder:text-gray-500',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white',
          'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  );
}

// ============================================
// Main Component
// ============================================

export function AIAssistantChat({
  sessionId,
  title = 'Assistente IA',
  placeholder = 'Digite sua pergunta...',
  welcomeMessage = 'Ola! Sou o assistente virtual do CoreBanking Brain. Posso ajuda-lo com duvidas sobre regulamentacoes BACEN, procedimentos PIX, DICT e muito mais. Como posso ajudar?',
  context,
  useRag = true,
  documentCategoryIds,
  className,
  onMessageSent,
  onResponseReceived,
}: AIAssistantChatProps) {
  const { messages, sendMessage, sending, clearMessages, selectedModel, setSelectedModel } = useAIChat(sessionId);
  const { models, defaultModel, loading: modelsLoading } = useAvailableLLMModels();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected model from localStorage or default
  useEffect(() => {
    const savedModel = localStorage.getItem('preferredLLMModel');
    if (savedModel && models.some(m => m.name === savedModel)) {
      setSelectedModel(savedModel);
    } else if (defaultModel && !selectedModel) {
      setSelectedModel(defaultModel);
    }
  }, [models, defaultModel, setSelectedModel, selectedModel]);

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model);
    localStorage.setItem('preferredLLMModel', model);
  }, [setSelectedModel]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      setError(null);
      onMessageSent?.(message);

      try {
        const response = await sendMessage(message, {
          useRag,
          documentCategoryIds,
          context,
        });

        if (response) {
          onResponseReceived?.({
            id: response.id,
            role: 'assistant',
            content: response.content,
            sources: response.sources,
            createdAt: response.createdAt,
          });
        }
      } catch (err) {
        setError('Erro ao enviar mensagem. Por favor, tente novamente.');
        console.error('Chat error:', err);
      }
    },
    [sendMessage, useRag, documentCategoryIds, context, onMessageSent, onResponseReceived]
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex flex-col border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {useRag ? 'RAG ativado' : 'Modo direto'}
              </p>
            </div>
          </div>
          <button
            onClick={clearMessages}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Limpar conversa"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        {/* Model Selector */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Modelo:</span>
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            defaultModel={defaultModel}
            onModelChange={handleModelChange}
            loading={modelsLoading}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && <WelcomeMessage message={welcomeMessage} />}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}
          {sending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <ChatInput
          onSend={handleSendMessage}
          disabled={sending}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

// ============================================
// Compact Chat Widget
// ============================================

export function AIAssistantWidget({
  className,
  ...props
}: Omit<AIAssistantChatProps, 'className'> & { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {isOpen ? (
        <div className="flex h-[500px] w-[380px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <AIAssistantChat {...props} />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default AIAssistantChat;

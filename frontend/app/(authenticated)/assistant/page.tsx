'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/assistant/ChatMessage';
import { InteractiveMessage } from '@/components/assistant/InteractiveMessage';
import { ObjectDefinitionPreview } from '@/components/assistant/ObjectDefinitionPreview';
import { useAssistantStore } from '@/lib/store/assistant-store';
import { Send, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function AssistantPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    conversationId,
    messages,
    currentStep,
    isLoading,
    error,
    startNewConversation,
    sendMessage,
    confirmCreation,
    reset
  } = useAssistantStore();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Start conversation if none exists
    if (!conversationId && !isLoading) {
      startNewConversation();
    }
  }, [conversationId, isLoading, startNewConversation]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      await sendMessage(message);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInteractiveResponse = async (response: string | string[]) => {
    setIsTyping(true);
    const responseText = Array.isArray(response) ? response.join(', ') : response;

    try {
      await sendMessage(responseText);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmCreation = async () => {
    setIsTyping(true);
    try {
      const objectDefinitionId = await confirmCreation();
      // Redirect to the created object definition (when that page exists)
      // For now, just show success
      setTimeout(() => {
        reset();
        router.push('/'); // Or redirect to object definitions list
      }, 2000);
    } catch (error) {
      console.error('Failed to create object:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    if (confirm('Tem certeza que deseja iniciar uma nova conversa? O progresso atual será perdido.')) {
      reset();
      startNewConversation();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showInteractiveMessage = lastMessage?.role === 'assistant' &&
    (lastMessage.type === 'select' || lastMessage.type === 'multiselect' || lastMessage.type === 'confirm') &&
    !isTyping;

  const showPreview = lastMessage?.type === 'preview' && lastMessage.preview;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Assistente de Criação</h1>
              <p className="text-sm text-slate-600">Crie objetos em linguagem natural</p>
            </div>
          </div>

          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          ref={scrollRef}
          className="h-full"
        >
          <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Welcome Message */}
            {messages.length === 0 && !isLoading && (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-2 border-dashed">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Bem-vindo ao Assistente de Criação
                </h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Vou te guiar através de algumas perguntas simples para criar um novo objeto no SuperCore.
                  Não se preocupe com termos técnicos - use linguagem natural!
                </p>
              </Card>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  type={message.type}
                />

                {/* Show preview if this is a preview message */}
                {message.type === 'preview' && message.preview && (
                  <div className="mb-4">
                    <ObjectDefinitionPreview preview={message.preview} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-white border border-slate-200 rounded-lg">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Interactive Message */}
            {showInteractiveMessage && (
              <div className="mb-4">
                <InteractiveMessage
                  type={lastMessage.type as 'select' | 'multiselect' | 'confirm'}
                  options={lastMessage.options}
                  onResponse={
                    showPreview && lastMessage.type === 'confirm'
                      ? (response) => {
                          if (response === 'Sim') {
                            handleConfirmCreation();
                          } else {
                            handleInteractiveResponse(response);
                          }
                        }
                      : handleInteractiveResponse
                  }
                  disabled={isLoading || isTyping}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Card className="p-4 bg-red-50 border-red-200 mb-4">
                <p className="text-sm text-red-900">{error}</p>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      {!showInteractiveMessage && (
        <div className="flex-shrink-0 border-t bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua resposta..."
                disabled={isLoading || isTyping}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isTyping}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-2 text-center">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <AssistantPage />
    </ProtectedRoute>
  );
}

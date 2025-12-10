import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Conversation, assistantAPI } from '@/lib/api/assistant';

interface AssistantState {
  // Current conversation
  conversationId: string | null;
  messages: Message[];
  currentStep: number;
  answers: Record<string, any>;
  isLoading: boolean;
  error: string | null;

  // Actions
  startNewConversation: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  confirmCreation: () => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  reset: () => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      conversationId: null,
      messages: [],
      currentStep: 0,
      answers: {},
      isLoading: false,
      error: null,

      startNewConversation: async () => {
        set({ isLoading: true, error: null });
        try {
          const { conversation_id } = await assistantAPI.startConversation();
          const conversation = await assistantAPI.getConversation(conversation_id);

          if (conversation) {
            set({
              conversationId: conversation_id,
              messages: conversation.messages,
              currentStep: conversation.currentStep,
              answers: conversation.answers,
              isLoading: false
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to start conversation',
            isLoading: false
          });
        }
      },

      sendMessage: async (message: string) => {
        const { conversationId } = get();
        if (!conversationId) {
          set({ error: 'No active conversation' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await assistantAPI.sendMessage(conversationId, message);
          const conversation = await assistantAPI.getConversation(conversationId);

          if (conversation) {
            set({
              messages: conversation.messages,
              currentStep: conversation.currentStep,
              answers: conversation.answers,
              isLoading: false
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false
          });
        }
      },

      confirmCreation: async (): Promise<string> => {
        const { conversationId } = get();
        if (!conversationId) {
          throw new Error('No active conversation');
        }

        set({ isLoading: true, error: null });

        try {
          const { object_definition_id } = await assistantAPI.confirmCreation(conversationId);
          const conversation = await assistantAPI.getConversation(conversationId);

          if (conversation) {
            set({
              messages: conversation.messages,
              isLoading: false
            });
          }

          return object_definition_id;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create object',
            isLoading: false
          });
          throw error;
        }
      },

      loadConversation: async (conversationId: string) => {
        set({ isLoading: true, error: null });

        try {
          const conversation = await assistantAPI.getConversation(conversationId);

          if (conversation) {
            set({
              conversationId: conversation.id,
              messages: conversation.messages,
              currentStep: conversation.currentStep,
              answers: conversation.answers,
              isLoading: false
            });
          } else {
            set({
              error: 'Conversation not found',
              isLoading: false
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load conversation',
            isLoading: false
          });
        }
      },

      reset: () => {
        set({
          conversationId: null,
          messages: [],
          currentStep: 0,
          answers: {},
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'assistant-storage',
      partialize: (state) => ({
        conversationId: state.conversationId,
        messages: state.messages,
        currentStep: state.currentStep,
        answers: state.answers
      })
    }
  )
);

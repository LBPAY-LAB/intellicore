import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AIAssistantService } from './ai-assistant.service';
import { AIChatInput, DictValidationInput, CreateChatSessionInput } from './dto/ai-chat.input';
import {
  AIChatResponse,
  ChatSession,
  DictValidationResult,
  LLMModelsResponse,
} from './dto/ai-chat.response';

@Resolver()
export class AIAssistantResolver {
  constructor(private readonly aiAssistantService: AIAssistantService) {}

  // ============================================
  // LLM Model Operations
  // ============================================

  @Query(() => LLMModelsResponse, {
    description: 'List all available LLM models from Ollama',
  })
  async availableLLMModels(): Promise<LLMModelsResponse> {
    return this.aiAssistantService.listAvailableModels();
  }

  // ============================================
  // Chat Operations
  // ============================================

  @Mutation(() => AIChatResponse, {
    description: 'Send a message to the AI Assistant and get a response',
  })
  async aiChatCompletion(
    @Args('input') input: AIChatInput,
  ): Promise<AIChatResponse> {
    return this.aiAssistantService.chat(input);
  }

  @Query(() => ChatSession, {
    nullable: true,
    description: 'Get chat history for a session',
  })
  async chatHistory(
    @Args('sessionId') sessionId: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit?: number,
  ): Promise<ChatSession | null> {
    return this.aiAssistantService.getChatHistory(sessionId, limit);
  }

  @Mutation(() => ChatSession, {
    description: 'Create a new chat session',
  })
  async createChatSession(
    @Args('input') input: CreateChatSessionInput,
  ): Promise<ChatSession> {
    return this.aiAssistantService.createChatSession(input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a chat session and its history',
  })
  async deleteChatSession(
    @Args('sessionId') sessionId: string,
  ): Promise<boolean> {
    return this.aiAssistantService.deleteChatSession(sessionId);
  }

  // ============================================
  // DICT Validation Operations
  // ============================================

  @Mutation(() => DictValidationResult, {
    description: 'Validate a DICT (PIX) request against BACEN rules',
  })
  async validateDictRequest(
    @Args('input') input: DictValidationInput,
  ): Promise<DictValidationResult> {
    return this.aiAssistantService.validateDictRequest(input);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RagService } from '../rag/rag.service';
import { AIChatInput, DictValidationInput, CreateChatSessionInput } from './dto/ai-chat.input';
import {
  AIChatResponse,
  ChatSession,
  ChatMessage,
  ChatSource,
  DictValidationResult,
  DictValidationError,
  DictValidationWarning,
  DictValidationSuggestion,
  LLMModel,
  LLMModelsResponse,
} from './dto/ai-chat.response';

interface LLMGatewayResponse {
  message: {
    content: string;
  };
  model: string;
  done: boolean;
}

@Injectable()
export class AIAssistantService {
  private readonly logger = new Logger(AIAssistantService.name);
  private readonly llmGatewayUrl: string;
  private readonly ollamaUrl: string;
  private readonly defaultModel: string;

  // In-memory chat session storage (for production, use Redis or database)
  private readonly chatSessions: Map<string, ChatSession> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly ragService: RagService,
  ) {
    this.llmGatewayUrl = this.configService.get<string>(
      'LLM_GATEWAY_URL',
      'http://localhost:8001',
    );
    this.ollamaUrl = this.configService.get<string>(
      'OLLAMA_URL',
      'http://localhost:11434',
    );
    this.defaultModel = this.configService.get<string>(
      'OLLAMA_MODEL',
      'llama3.1:8b',
    );
  }

  // ============================================
  // LLM Model Management
  // ============================================

  /**
   * List all available LLM models from Ollama directly
   */
  async listAvailableModels(): Promise<LLMModelsResponse> {
    try {
      // Call Ollama directly at /api/tags endpoint
      const url = `${this.ollamaUrl}/api/tags`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to fetch models from Ollama: ${response.status}`);
        return {
          models: [],
          defaultModel: this.defaultModel,
        };
      }

      const data = await response.json();
      const ollamaModels = data.models || [];

      const models: LLMModel[] = ollamaModels.map((m: Record<string, unknown>) => ({
        name: m.name as string,
        modifiedAt: m.modified_at as string | undefined,
        size: m.size as number | undefined,
        digest: m.digest as string | undefined,
        details: m.details ? {
          format: (m.details as Record<string, unknown>).format as string | undefined,
          family: (m.details as Record<string, unknown>).family as string | undefined,
          parameterSize: (m.details as Record<string, unknown>).parameter_size as string | undefined,
          quantizationLevel: (m.details as Record<string, unknown>).quantization_level as string | undefined,
        } : undefined,
      }));

      this.logger.log(`Found ${models.length} available LLM models`);

      return {
        models,
        defaultModel: this.defaultModel,
      };
    } catch (error) {
      this.logger.error('Failed to list LLM models from Ollama:', error);
      return {
        models: [],
        defaultModel: this.defaultModel,
      };
    }
  }

  // ============================================
  // Chat Session Management
  // ============================================

  /**
   * Create a new chat session
   */
  async createChatSession(input: CreateChatSessionInput): Promise<ChatSession> {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const session: ChatSession = {
      id: sessionId,
      sessionId,
      title: input.title || 'Nova Conversa',
      context: input.context,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    this.chatSessions.set(sessionId, session);
    this.logger.log(`Created chat session: ${sessionId}`);

    return session;
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string, limit?: number): Promise<ChatSession | null> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (limit && session.messages.length > limit) {
      return {
        ...session,
        messages: session.messages.slice(-limit),
      };
    }

    return session;
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string): Promise<boolean> {
    const deleted = this.chatSessions.delete(sessionId);
    if (deleted) {
      this.logger.log(`Deleted chat session: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Add message to session history
   */
  private addMessageToSession(sessionId: string, message: ChatMessage): void {
    let session = this.chatSessions.get(sessionId);

    if (!session) {
      // Create session if it doesn't exist
      const now = new Date().toISOString();
      session = {
        id: sessionId,
        sessionId,
        title: 'Nova Conversa',
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      this.chatSessions.set(sessionId, session);
    }

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Process a chat message with optional RAG context
   */
  async chat(input: AIChatInput): Promise<AIChatResponse> {
    const startTime = Date.now();
    const messageId = uuidv4();
    const sessionId = input.sessionId || uuidv4();

    this.logger.log(`Processing chat message: "${input.message.substring(0, 50)}..."`);

    try {
      // Store user message in session
      this.addMessageToSession(sessionId, {
        id: uuidv4(),
        role: 'user',
        content: input.message,
        createdAt: new Date().toISOString(),
      });

      let ragContext = '';
      let sources: ChatSource[] = [];

      // Retrieve RAG context if enabled
      if (input.useRag !== false) {
        const ragResult = await this.retrieveRagContext(
          input.message,
          input.documentCategoryIds,
        );
        ragContext = ragResult.context;
        sources = ragResult.sources;
      }

      // Build the prompt with context
      const systemPrompt = this.buildSystemPrompt(input.context, ragContext);
      const response = await this.callLLMGateway(
        input.message,
        systemPrompt,
        input.temperature,
        input.maxTokens,
        input.model,
      );

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Chat response generated in ${processingTime}ms with ${sources.length} sources`,
      );

      const assistantMessage: AIChatResponse = {
        id: messageId,
        content: response.message.content,
        role: 'assistant',
        sources: sources.length > 0 ? sources : undefined,
        processingTimeMs: processingTime,
        model: response.model || this.defaultModel,
        createdAt: new Date().toISOString(),
      };

      // Store assistant message in session
      this.addMessageToSession(sessionId, {
        id: messageId,
        role: 'assistant',
        content: assistantMessage.content,
        sources: assistantMessage.sources,
        createdAt: assistantMessage.createdAt,
      });

      return assistantMessage;
    } catch (error) {
      this.logger.error('Chat processing failed:', error);
      throw error;
    }
  }

  /**
   * Validate a DICT request using RAG context and LLM
   */
  async validateDictRequest(
    input: DictValidationInput,
  ): Promise<DictValidationResult> {
    const startTime = Date.now();

    this.logger.log(
      `Validating DICT request: ${input.requestType} - ${input.keyType}`,
    );

    try {
      // First, perform basic validation
      const basicValidation = this.performBasicDictValidation(input);

      // Retrieve RAG context for DICT validation
      const query = this.buildDictValidationQuery(input);
      const ragResult = await this.retrieveRagContext(query, [
        // Filter for DICT/PIX related categories
      ]);

      // Build validation prompt
      const validationPrompt = this.buildDictValidationPrompt(
        input,
        ragResult.context,
      );

      // Call LLM for enhanced validation
      const llmResponse = await this.callLLMGateway(
        validationPrompt,
        this.getDictValidationSystemPrompt(),
        0.1, // Low temperature for consistent validation
        2000,
      );

      // Parse LLM response
      const llmValidation = this.parseDictValidationResponse(
        llmResponse.message.content,
      );

      // Combine basic and LLM validations
      const errors = [...basicValidation.errors, ...llmValidation.errors];
      const warnings = [...basicValidation.warnings, ...llmValidation.warnings];
      const suggestions = llmValidation.suggestions;

      const isValid = errors.length === 0;
      const validationScore = this.calculateValidationScore(
        errors,
        warnings,
        suggestions,
      );

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `DICT validation completed in ${processingTime}ms - Valid: ${isValid}, Score: ${validationScore}`,
      );

      return {
        isValid,
        validationScore,
        errors,
        warnings,
        suggestions,
        sources: ragResult.sources,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      this.logger.error('DICT validation failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve RAG context for a query
   */
  private async retrieveRagContext(
    query: string,
    categoryIds?: string[],
  ): Promise<{ context: string; sources: ChatSource[] }> {
    try {
      const searchResult = await this.ragService.semanticSearch({
        query,
        limit: 5,
        scoreThreshold: 0.6,
        documentTypeId: categoryIds?.[0], // Use first category for now
      });

      const sources: ChatSource[] = searchResult.results.map((result) => ({
        documentId: result.documentId,
        documentName: result.originalFilename,
        chunkText: result.chunkText,
        score: result.score,
        pageNumber: undefined, // TODO: Extract from metadata
      }));

      const context = searchResult.results
        .map(
          (r, i) =>
            `[Fonte ${i + 1}: ${r.originalFilename}]\n${r.chunkText}`,
        )
        .join('\n\n---\n\n');

      return { context, sources };
    } catch (error) {
      this.logger.warn('RAG context retrieval failed, continuing without context:', error);
      return { context: '', sources: [] };
    }
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(userContext?: string, ragContext?: string): string {
    let prompt = `Voce e um assistente especializado em regulamentacoes bancarias brasileiras, especialmente do Banco Central (BACEN), sistema PIX e DICT.

Voce deve:
1. Responder em portugues brasileiro
2. Ser preciso e objetivo nas respostas
3. Citar as fontes quando disponivel
4. Admitir quando nao tiver certeza sobre algo
5. Seguir as normas e regulamentacoes do BACEN`;

    if (userContext) {
      prompt += `\n\nContexto adicional do usuario:\n${userContext}`;
    }

    if (ragContext) {
      prompt += `\n\n---\nDocumentos de referencia encontrados:\n\n${ragContext}\n---\n\nUse as informacoes acima para fundamentar sua resposta quando relevante.`;
    }

    return prompt;
  }

  /**
   * Call Ollama directly for chat completion
   */
  private async callLLMGateway(
    message: string,
    systemPrompt: string,
    temperature?: number,
    maxTokens?: number,
    model?: string,
  ): Promise<LLMGatewayResponse> {
    // Call Ollama directly at /api/chat endpoint
    const url = `${this.ollamaUrl}/api/chat`;
    const selectedModel = model || this.defaultModel;

    this.logger.log(`Calling Ollama with model: ${selectedModel}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        options: {
          temperature: temperature ?? 0.7,
          num_predict: maxTokens ?? 1000,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Transform Ollama response format to LLMGatewayResponse format
    return {
      message: {
        content: data.message?.content || '',
      },
      model: data.model || selectedModel,
      done: data.done ?? true,
    };
  }

  /**
   * Perform basic DICT validation without LLM
   */
  private performBasicDictValidation(input: DictValidationInput): {
    errors: DictValidationError[];
    warnings: DictValidationWarning[];
  } {
    const errors: DictValidationError[] = [];
    const warnings: DictValidationWarning[] = [];

    // Validate key type and value
    switch (input.keyType) {
      case 'CPF':
        if (!this.isValidCPF(input.keyValue)) {
          errors.push({
            field: 'keyValue',
            message: 'CPF invalido',
            severity: 'error',
            suggestion: 'Verifique se o CPF esta correto e formatado como XXX.XXX.XXX-XX',
          });
        }
        break;

      case 'CNPJ':
        if (!this.isValidCNPJ(input.keyValue)) {
          errors.push({
            field: 'keyValue',
            message: 'CNPJ invalido',
            severity: 'error',
            suggestion: 'Verifique se o CNPJ esta correto e formatado como XX.XXX.XXX/XXXX-XX',
          });
        }
        break;

      case 'EMAIL':
        if (!this.isValidEmail(input.keyValue)) {
          errors.push({
            field: 'keyValue',
            message: 'Email invalido',
            severity: 'error',
            suggestion: 'Verifique se o email esta no formato correto',
          });
        }
        break;

      case 'TELEFONE':
        if (!this.isValidPhone(input.keyValue)) {
          errors.push({
            field: 'keyValue',
            message: 'Telefone invalido',
            severity: 'error',
            suggestion: 'Use o formato +55DDDNNNNNNNNN',
          });
        }
        break;

      case 'EVP':
        if (!this.isValidEVP(input.keyValue)) {
          errors.push({
            field: 'keyValue',
            message: 'Chave aleatoria (EVP) invalida',
            severity: 'error',
            suggestion: 'A chave EVP deve ser um UUID valido',
          });
        }
        break;
    }

    // Validate ISPB if provided
    if (input.participantIspb && !this.isValidISPB(input.participantIspb)) {
      errors.push({
        field: 'participantIspb',
        message: 'ISPB invalido',
        severity: 'error',
        suggestion: 'O ISPB deve ter 8 digitos',
      });
    }

    // Validate account number format
    if (input.accountNumber && input.accountNumber.length > 20) {
      warnings.push({
        field: 'accountNumber',
        message: 'Numero da conta muito longo',
        suggestion: 'Verifique se o numero da conta esta correto',
      });
    }

    // Validate owner document matches key type for CPF/CNPJ
    if (input.keyType === 'CPF' && input.ownerDocument) {
      if (input.keyValue !== input.ownerDocument.replace(/\D/g, '')) {
        warnings.push({
          field: 'ownerDocument',
          message: 'CPF do titular difere da chave',
          suggestion: 'Para chaves CPF, o documento do titular deve ser igual a chave',
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Build query for DICT validation RAG
   */
  private buildDictValidationQuery(input: DictValidationInput): string {
    return `Regras e validacoes para ${input.requestType} de chave PIX tipo ${input.keyType} no DICT BACEN`;
  }

  /**
   * Build DICT validation prompt
   */
  private buildDictValidationPrompt(
    input: DictValidationInput,
    ragContext: string,
  ): string {
    return `Analise a seguinte solicitacao DICT e identifique problemas ou sugestoes:

Tipo de Requisicao: ${input.requestType}
Tipo de Chave: ${input.keyType}
Valor da Chave: ${input.keyValue}
ISPB Participante: ${input.participantIspb || 'Nao informado'}
Tipo de Conta: ${input.accountType || 'Nao informado'}
Numero da Conta: ${input.accountNumber || 'Nao informado'}
Agencia: ${input.branchNumber || 'Nao informado'}
Nome do Titular: ${input.ownerName || 'Nao informado'}
Documento do Titular: ${input.ownerDocument || 'Nao informado'}

${ragContext ? `\nContexto regulatorio:\n${ragContext}` : ''}

Responda em formato JSON com a seguinte estrutura:
{
  "errors": [{"field": "campo", "message": "descricao do erro", "severity": "error", "suggestion": "sugestao"}],
  "warnings": [{"field": "campo", "message": "aviso", "suggestion": "sugestao"}],
  "suggestions": [{"field": "campo", "currentValue": "valor atual", "suggestedValue": "valor sugerido", "reason": "motivo"}]
}`;
  }

  /**
   * Get DICT validation system prompt
   */
  private getDictValidationSystemPrompt(): string {
    return `Voce e um especialista em validacao de requisicoes DICT (Diretorio de Identificadores de Contas Transacionais) do Banco Central do Brasil.

Sua funcao e analisar requisicoes de registro, exclusao, portabilidade e reivindicacao de chaves PIX e identificar:
1. Erros de validacao que impedem o processamento
2. Avisos sobre potenciais problemas
3. Sugestoes de melhorias

Sempre responda em formato JSON valido.`;
  }

  /**
   * Parse DICT validation response from LLM
   */
  private parseDictValidationResponse(response: string): {
    errors: DictValidationError[];
    warnings: DictValidationWarning[];
    suggestions: DictValidationSuggestion[];
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          errors: parsed.errors || [],
          warnings: parsed.warnings || [],
          suggestions: parsed.suggestions || [],
        };
      }
    } catch (error) {
      this.logger.warn('Failed to parse LLM validation response:', error);
    }

    return { errors: [], warnings: [], suggestions: [] };
  }

  /**
   * Calculate validation score
   */
  private calculateValidationScore(
    errors: DictValidationError[],
    warnings: DictValidationWarning[],
    suggestions: DictValidationSuggestion[],
  ): number {
    let score = 100;
    score -= errors.length * 25; // Each error reduces 25 points
    score -= warnings.length * 10; // Each warning reduces 10 points
    score -= suggestions.length * 5; // Each suggestion reduces 5 points
    return Math.max(0, score);
  }

  // ============================================
  // Validation Helper Methods
  // ============================================

  private isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return digit === parseInt(cleaned[10]);
  }

  private isValidCNPJ(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * weights1[i];
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned[12])) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * weights2[i];
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return digit === parseInt(cleaned[13]);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Brazilian phone: +55 + DDD (2 digits) + number (8-9 digits)
    return cleaned.length >= 12 && cleaned.length <= 13 && cleaned.startsWith('55');
  }

  private isValidEVP(evp: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(evp);
  }

  private isValidISPB(ispb: string): boolean {
    const cleaned = ispb.replace(/\D/g, '');
    return cleaned.length === 8;
  }
}

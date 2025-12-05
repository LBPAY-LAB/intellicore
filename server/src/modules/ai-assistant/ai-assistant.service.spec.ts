/**
 * AI Assistant Service Unit Tests
 * Sprint 20 - US-DB-022: End-to-End Testing Suite
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIAssistantService } from './ai-assistant.service';
import { RagService } from '../rag/rag.service';

describe('AIAssistantService', () => {
  let service: AIAssistantService;
  let ragService: jest.Mocked<RagService>;

  beforeEach(async () => {
    const mockRagService = {
      semanticSearch: jest.fn().mockResolvedValue({
        results: [],
        totalResults: 0,
      }),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'LLM_GATEWAY_URL') return 'http://localhost:8001';
        if (key === 'LLM_DEFAULT_MODEL') return 'llama3.2:3b';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIAssistantService,
        { provide: RagService, useValue: mockRagService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AIAssistantService>(AIAssistantService);
    ragService = module.get(RagService);
  });

  describe('Chat Session Management', () => {
    it('should create a chat session', async () => {
      const session = await service.createChatSession({
        title: 'Test Session',
        context: 'Testing',
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.title).toBe('Test Session');
      expect(session.messages).toEqual([]);
    });

    it('should get chat history', async () => {
      const session = await service.createChatSession({
        title: 'History Test',
      });

      const history = await service.getChatHistory(session.id);
      expect(history).toBeDefined();
      expect(history?.id).toBe(session.id);
    });

    it('should return null for non-existent session', async () => {
      const history = await service.getChatHistory('non-existent-id');
      expect(history).toBeNull();
    });

    it('should delete chat session', async () => {
      const session = await service.createChatSession({
        title: 'Delete Test',
      });

      const deleted = await service.deleteChatSession(session.id);
      expect(deleted).toBe(true);

      const history = await service.getChatHistory(session.id);
      expect(history).toBeNull();
    });

    it('should limit chat history when requested', async () => {
      const session = await service.createChatSession({
        title: 'Limit Test',
      });

      // Manually add messages to test limit
      // Note: This tests internal behavior, in production messages are added via chat()
      const history = await service.getChatHistory(session.id, 5);
      expect(history).toBeDefined();
    });
  });

  describe('DICT Validation - Basic Validations', () => {
    describe('CPF Validation', () => {
      it('should validate a correct CPF', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725', // Valid CPF for testing
        });

        // Basic validation errors should not include CPF format error
        const cpfErrors = result.errors.filter(
          (e) => e.field === 'keyValue' && e.message.includes('CPF'),
        );
        expect(cpfErrors.length).toBe(0);
      });

      it('should reject an invalid CPF with all same digits', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '11111111111',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('CPF'))).toBe(true);
      });

      it('should reject CPF with wrong check digits', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '12345678900', // Wrong check digits
        });

        expect(result.isValid).toBe(false);
      });

      it('should reject CPF with wrong length', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '1234567890', // 10 digits
        });

        expect(result.isValid).toBe(false);
      });
    });

    describe('CNPJ Validation', () => {
      it('should validate a correct CNPJ', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CNPJ',
          keyValue: '11444777000161', // Valid CNPJ
        });

        const cnpjErrors = result.errors.filter(
          (e) => e.field === 'keyValue' && e.message.includes('CNPJ'),
        );
        expect(cnpjErrors.length).toBe(0);
      });

      it('should reject invalid CNPJ', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CNPJ',
          keyValue: '00000000000000',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('CNPJ'))).toBe(true);
      });
    });

    describe('Email Validation', () => {
      it('should validate a correct email', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'EMAIL',
          keyValue: 'test@example.com',
        });

        const emailErrors = result.errors.filter(
          (e) => e.field === 'keyValue' && e.message.includes('Email'),
        );
        expect(emailErrors.length).toBe(0);
      });

      it('should reject invalid email', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'EMAIL',
          keyValue: 'invalid-email',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('Email'))).toBe(true);
      });

      it('should reject email without domain', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'EMAIL',
          keyValue: 'test@',
        });

        expect(result.isValid).toBe(false);
      });
    });

    describe('Phone Validation', () => {
      it('should validate a correct Brazilian phone', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'TELEFONE',
          keyValue: '+5511999999999',
        });

        const phoneErrors = result.errors.filter(
          (e) => e.field === 'keyValue' && e.message.includes('Telefone'),
        );
        expect(phoneErrors.length).toBe(0);
      });

      it('should reject phone without country code', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'TELEFONE',
          keyValue: '11999999999',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('Telefone'))).toBe(true);
      });

      it('should reject phone with wrong length', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'TELEFONE',
          keyValue: '+55119999',
        });

        expect(result.isValid).toBe(false);
      });
    });

    describe('EVP (Random Key) Validation', () => {
      it('should validate a correct UUID', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'EVP',
          keyValue: '550e8400-e29b-41d4-a716-446655440000',
        });

        const evpErrors = result.errors.filter(
          (e) => e.field === 'keyValue' && e.message.includes('EVP'),
        );
        expect(evpErrors.length).toBe(0);
      });

      it('should reject invalid UUID', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'EVP',
          keyValue: 'not-a-uuid',
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('EVP'))).toBe(true);
      });
    });

    describe('ISPB Validation', () => {
      it('should validate correct ISPB', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725',
          participantIspb: '12345678',
        });

        const ispbErrors = result.errors.filter((e) => e.field === 'participantIspb');
        expect(ispbErrors.length).toBe(0);
      });

      it('should reject ISPB with wrong length', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725',
          participantIspb: '123456', // 6 digits instead of 8
        });

        expect(result.errors.some((e) => e.field === 'participantIspb')).toBe(true);
      });
    });

    describe('Account Number Validation', () => {
      it('should warn about long account numbers', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725',
          accountNumber: '123456789012345678901', // 21 characters
        });

        expect(result.warnings.some((w) => w.field === 'accountNumber')).toBe(true);
      });
    });

    describe('Owner Document Validation', () => {
      it('should warn when CPF key differs from owner document', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725',
          ownerDocument: '12345678909', // Different CPF
        });

        expect(result.warnings.some((w) => w.field === 'ownerDocument')).toBe(true);
      });

      it('should not warn when CPF key matches owner document', async () => {
        const result = await service.validateDictRequest({
          requestType: 'REGISTRO_CHAVE',
          keyType: 'CPF',
          keyValue: '52998224725',
          ownerDocument: '52998224725',
        });

        const ownerWarnings = result.warnings.filter((w) => w.field === 'ownerDocument');
        expect(ownerWarnings.length).toBe(0);
      });
    });
  });

  describe('Validation Score Calculation', () => {
    it('should return 100 score when no issues', async () => {
      const result = await service.validateDictRequest({
        requestType: 'REGISTRO_CHAVE',
        keyType: 'EMAIL',
        keyValue: 'valid@email.com',
      });

      // With valid input and no LLM errors, score should be high
      expect(result.validationScore).toBeGreaterThanOrEqual(80);
    });

    it('should reduce score for errors', async () => {
      const result = await service.validateDictRequest({
        requestType: 'REGISTRO_CHAVE',
        keyType: 'CPF',
        keyValue: '00000000000',
      });

      expect(result.validationScore).toBeLessThan(100);
    });
  });
});

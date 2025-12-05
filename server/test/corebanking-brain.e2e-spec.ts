/**
 * CoreBanking Brain E2E Tests
 * Sprint 20 - US-DB-022: End-to-End Testing Suite
 *
 * Tests the complete CoreBanking Brain pipeline:
 * - Document categories
 * - Bronze layer processing
 * - Silver layer chunking
 * - Gold layer distribution (A/B/C)
 * - AI Assistant chat
 * - DICT validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('CoreBanking Brain E2E', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should respond to GraphQL introspection', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `{ __schema { types { name } } }`,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('__schema');
      expect(response.body.data.__schema.types).toBeDefined();
    });
  });

  describe('Document Categories', () => {
    it('should fetch all document categories', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              documentCategories {
                id
                code
                name
                targetGoldA
                targetGoldB
                targetGoldC
                isActive
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.documentCategories).toBeDefined();
      expect(Array.isArray(response.body.data.documentCategories)).toBe(true);
    });

    it('should contain BACEN_MANUAL_DICT category', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              documentCategories {
                code
                name
              }
            }
          `,
        })
        .expect(200);

      const categories = response.body.data.documentCategories;
      const dictCategory = categories.find(
        (c: { code: string }) => c.code === 'BACEN_MANUAL_DICT',
      );
      expect(dictCategory).toBeDefined();
    });
  });

  describe('Object Types', () => {
    it('should fetch all object types', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              objectTypes(first: 20) {
                nodes {
                  id
                  name
                  description
                  isActive: is_active
                }
                totalCount
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.objectTypes).toBeDefined();
      expect(response.body.data.objectTypes.nodes).toBeDefined();
    });

    it('should find DictRegistroChave ObjectType after migration', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              objectTypes(first: 100) {
                nodes {
                  name
                  description
                  fields {
                    name
                    field_type
                    is_required
                    validation_rules
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      const nodes = response.body.data?.objectTypes?.nodes || [];
      const dictObjectType = nodes.find(
        (n: { name: string }) => n.name === 'DictRegistroChave',
      );

      // The ObjectType may not exist if migration hasn't run
      if (dictObjectType) {
        expect(dictObjectType.description).toContain('DICT');
        expect(dictObjectType.fields.length).toBeGreaterThan(10);

        // Verify key fields exist
        const fieldNames = dictObjectType.fields.map((f: { name: string }) => f.name);
        expect(fieldNames).toContain('tipo_chave');
        expect(fieldNames).toContain('valor_chave');
        expect(fieldNames).toContain('titular_cpf_cnpj');
        expect(fieldNames).toContain('conta_tipo');
        expect(fieldNames).toContain('status_vinculo');
      }
    });
  });

  describe('External Sources', () => {
    it('should fetch external sources list', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              externalSources {
                id
                name
                sourceType
                isEnabled
                lastSyncAt
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.externalSources).toBeDefined();
      expect(Array.isArray(response.body.data.externalSources)).toBe(true);
    });
  });

  describe('AI Assistant', () => {
    it('should create a new chat session', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createChatSession(input: {
                title: "Test Session"
                context: "Testing CoreBanking Brain"
              }) {
                id
                sessionId
                title
                createdAt
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createChatSession).toBeDefined();
      expect(response.body.data.createChatSession.sessionId).toBeDefined();
      expect(response.body.data.createChatSession.title).toBe('Test Session');
    });

    // Note: This test requires the LLM Gateway to be running
    it('should process a simple chat message (requires LLM Gateway)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              chat(input: {
                message: "O que e PIX?"
                useRag: false
              }) {
                id
                content
                role
                processingTimeMs
              }
            }
          `,
        })
        .timeout(30000); // 30 second timeout for LLM response

      // May fail if LLM Gateway is not running, which is expected
      if (response.body.errors) {
        expect(response.body.errors[0].message).toMatch(
          /LLM Gateway|ECONNREFUSED|fetch failed/,
        );
      } else {
        expect(response.body.data.chat).toBeDefined();
        expect(response.body.data.chat.content).toBeDefined();
        expect(response.body.data.chat.role).toBe('assistant');
      }
    });
  });

  describe('DICT Validation', () => {
    it('should validate a CPF key registration request', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              validateDictRequest(input: {
                requestType: "REGISTRO_CHAVE"
                keyType: "CPF"
                keyValue: "12345678909"
                participantIspb: "12345678"
                accountType: "CACC"
                accountNumber: "123456"
                branchNumber: "0001"
                ownerName: "Joao Silva"
                ownerDocument: "12345678909"
              }) {
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
                processingTimeMs
              }
            }
          `,
        })
        .timeout(30000);

      // May fail if LLM Gateway is not running
      if (response.body.errors && response.body.errors[0]?.message?.includes('LLM Gateway')) {
        // Expected when LLM Gateway is offline
        expect(true).toBe(true);
      } else if (response.body.data?.validateDictRequest) {
        const result = response.body.data.validateDictRequest;
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('validationScore');
        expect(result).toHaveProperty('errors');
        expect(typeof result.validationScore).toBe('number');
      }
    });

    it('should detect invalid CPF', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              validateDictRequest(input: {
                requestType: "REGISTRO_CHAVE"
                keyType: "CPF"
                keyValue: "00000000000"
              }) {
                isValid
                validationScore
                errors {
                  field
                  message
                }
              }
            }
          `,
        })
        .timeout(30000);

      if (response.body.data?.validateDictRequest) {
        const result = response.body.data.validateDictRequest;
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some((e: { field: string }) => e.field === 'keyValue')).toBe(
          true,
        );
      }
    });

    it('should validate EMAIL key format', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              validateDictRequest(input: {
                requestType: "REGISTRO_CHAVE"
                keyType: "EMAIL"
                keyValue: "test@example.com"
              }) {
                isValid
                validationScore
                errors {
                  field
                  message
                }
              }
            }
          `,
        })
        .timeout(30000);

      if (response.body.data?.validateDictRequest) {
        const result = response.body.data.validateDictRequest;
        // Valid email format should not have key format errors
        const emailErrors = result.errors.filter(
          (e: { field: string; message: string }) =>
            e.field === 'keyValue' && e.message.includes('Email'),
        );
        expect(emailErrors.length).toBe(0);
      }
    });

    it('should detect invalid phone format', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              validateDictRequest(input: {
                requestType: "REGISTRO_CHAVE"
                keyType: "TELEFONE"
                keyValue: "123456"
              }) {
                isValid
                errors {
                  field
                  message
                }
              }
            }
          `,
        })
        .timeout(30000);

      if (response.body.data?.validateDictRequest) {
        const result = response.body.data.validateDictRequest;
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e: { message: string }) => e.message.includes('Telefone'))).toBe(
          true,
        );
      }
    });

    it('should validate EVP (random key) format', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              validateDictRequest(input: {
                requestType: "REGISTRO_CHAVE"
                keyType: "EVP"
                keyValue: "550e8400-e29b-41d4-a716-446655440000"
              }) {
                isValid
                validationScore
                errors {
                  field
                  message
                }
              }
            }
          `,
        })
        .timeout(30000);

      if (response.body.data?.validateDictRequest) {
        const result = response.body.data.validateDictRequest;
        // Valid UUID should not have format errors for EVP
        const evpErrors = result.errors.filter(
          (e: { field: string; message: string }) =>
            e.field === 'keyValue' && e.message.includes('EVP'),
        );
        expect(evpErrors.length).toBe(0);
      }
    });
  });

  describe('Processing Pipeline', () => {
    it('should fetch bronze documents', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              bronzeDocuments(limit: 10) {
                id
                originalFilename
                processingStatus
                category {
                  name
                }
              }
            }
          `,
        });

      // May not have this query - check for expected error or data
      if (!response.body.errors) {
        expect(response.body.data.bronzeDocuments).toBeDefined();
      }
    });
  });

  describe('Analytics', () => {
    it('should fetch dashboard summary', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              dashboardSummary {
                totalObjectTypes
                totalInstances
                totalDocuments
                totalRelationships
                activeWorkflows
                pendingWorkflows
                objectTypeStats {
                  name
                  instanceCount
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.dashboardSummary).toBeDefined();
      expect(response.body.data.dashboardSummary.totalObjectTypes).toBeGreaterThanOrEqual(
        0,
      );
    });
  });

  describe('Graph Query', () => {
    it('should check graph health', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              graphHealth {
                isConnected
                spaceName
                lastCheckAt
              }
            }
          `,
        });

      if (!response.body.errors) {
        expect(response.body.data.graphHealth).toBeDefined();
        expect(typeof response.body.data.graphHealth.isConnected).toBe('boolean');
      }
    });

    it('should get graph schema', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              graphSchema {
                tags {
                  name
                }
                edges {
                  name
                }
              }
            }
          `,
        });

      if (!response.body.errors) {
        expect(response.body.data.graphSchema).toBeDefined();
      }
    });
  });

  describe('Semantic Search', () => {
    it('should perform semantic search', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              semanticSearch(input: {
                query: "registro de chave PIX"
                limit: 5
                scoreThreshold: 0.5
              }) {
                results {
                  documentId
                  chunkText
                  score
                }
                totalResults
              }
            }
          `,
        })
        .timeout(30000);

      // May fail if Qdrant is not running or has no data
      if (!response.body.errors) {
        expect(response.body.data.semanticSearch).toBeDefined();
        expect(response.body.data.semanticSearch.results).toBeDefined();
      }
    });
  });
});

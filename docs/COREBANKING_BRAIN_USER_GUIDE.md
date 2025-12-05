# CoreBanking Brain - Guia do Usuário

> **Versão:** 1.0
> **Data:** 2025-12-04
> **Sprint 20** - US-DB-024: Documentação e Materiais de Treinamento

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Pipeline de Processamento](#pipeline-de-processamento)
4. [Módulos do Sistema](#módulos-do-sistema)
5. [Guia de Uso](#guia-de-uso)
6. [API Reference](#api-reference)
7. [Resolução de Problemas](#resolução-de-problemas)

---

## Visão Geral

O **CoreBanking Brain** é o sistema de inteligência artificial do intelliCore que processa documentos normativos, extrai conhecimento e fornece validações automatizadas para operações de Core Banking, especialmente relacionadas ao PIX e DICT (Diretório de Identificadores de Contas Transacionais).

### Principais Funcionalidades

- **Ingestão de Documentos**: Upload e processamento automático de documentos normativos (BACEN, políticas internas)
- **Pipeline Bronze/Silver/Gold**: Processamento em camadas para extração e enriquecimento de dados
- **AI Assistant**: Chat inteligente com contexto RAG para responder perguntas sobre regulamentações
- **Validação DICT**: Validação automatizada de chaves PIX conforme especificações BACEN
- **Fontes Externas**: Integração com sistemas externos (PostgreSQL, MySQL, REST, GraphQL)

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CoreBanking Brain Architecture                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │
│  │   Upload    │────▶│   Bronze    │────▶│   Silver    │            │
│  │  Documents  │     │   Layer     │     │   Layer     │            │
│  └─────────────┘     └─────────────┘     └──────┬──────┘            │
│                                                  │                    │
│                    ┌─────────────────────────────┼───────────────┐   │
│                    │                             │               │   │
│                    ▼                             ▼               ▼   │
│             ┌───────────┐                 ┌───────────┐   ┌───────────┐
│             │  Gold A   │                 │  Gold B   │   │  Gold C   │
│             │  (Trino)  │                 │ (Nebula)  │   │ (Qdrant)  │
│             │ Analytics │                 │   Graph   │   │  Vector   │
│             └───────────┘                 └───────────┘   └───────────┘
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      AI Assistant Layer                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │ │
│  │  │ Chat + RAG   │  │    DICT      │  │   External   │           │ │
│  │  │   Context    │  │  Validation  │  │   Sources    │           │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline de Processamento

### Bronze Layer (Camada Bronze)

A camada Bronze é responsável pela ingestão inicial de documentos:

| Campo | Descrição |
|-------|-----------|
| **Entrada** | Documentos PDF, DOCX, Markdown |
| **Processo** | Extração de texto, metadados |
| **Saída** | Texto bruto + metadados |
| **Status** | `pending` → `processing` → `completed` / `failed` |

**Categorias de Documentos Suportadas:**

| Categoria | Descrição | Gold Target |
|-----------|-----------|-------------|
| `BACEN_CIRCULAR` | Circulares do BACEN | A, B, C |
| `BACEN_RESOLUCAO` | Resoluções do BACEN | A, B, C |
| `DICT_MANUAL` | Manuais DICT | A, B, C |
| `PIX_REGULAMENTO` | Regulamentos PIX | A, B, C |
| `POLITICA_INTERNA` | Políticas internas | B, C |
| `MANUAL_OPERACIONAL` | Manuais operacionais | B, C |
| `CONTRATO` | Contratos e acordos | B |
| `RELATORIO` | Relatórios e análises | A |

### Silver Layer (Camada Silver)

A camada Silver realiza o chunking e extração de entidades:

| Campo | Descrição |
|-------|-----------|
| **Entrada** | Texto bruto da Bronze |
| **Processo** | Chunking semântico, extração de entidades |
| **Saída** | Chunks com entidades extraídas |

**Entidades Extraídas:**

- CPF (Cadastro de Pessoa Física)
- CNPJ (Cadastro Nacional de Pessoa Jurídica)
- Datas (múltiplos formatos)
- Valores monetários (BRL)
- E-mails
- Telefones
- ISPB (Identificação de Participante)

### Gold Layer (Camadas Gold A/B/C)

**Gold A - Analytics (Trino)**
- Dados estruturados para análise
- Queries OLAP
- Dashboards e relatórios

**Gold B - Knowledge Graph (NebulaGraph)**
- Grafo de conhecimento
- Relações entre entidades
- Navegação semântica

**Gold C - Vector Search (Qdrant)**
- Embeddings vetoriais
- Busca semântica
- Contexto RAG para AI

---

## Módulos do Sistema

### 1. Document Categories (Categorias de Documentos)

**Endpoint GraphQL:**
```graphql
# Listar categorias
query {
  documentCategories {
    id
    name
    description
    ragEnabled
    goldTargets
  }
}

# Criar categoria
mutation {
  createDocumentCategory(input: {
    name: "Nova Categoria"
    description: "Descrição"
    ragEnabled: true
    goldTargets: ["A", "B", "C"]
  }) {
    id
  }
}
```

### 2. Bronze Documents

**Upload de Documento:**
```graphql
mutation {
  processDocumentForRAG(
    documentId: "uuid"
    categoryId: "category-uuid"
  ) {
    id
    status
    processingStage
  }
}
```

### 3. AI Assistant

**Chat com RAG:**
```graphql
mutation {
  sendChatMessage(input: {
    message: "Qual o prazo para registro de chave PIX?"
    useRagContext: true
  }) {
    response
    sources {
      documentId
      chunkText
      score
    }
  }
}
```

### 4. DICT Validation

**Validar Chave PIX:**
```graphql
mutation {
  validateDictKey(input: {
    tipoChave: "CPF"
    valorChave: "12345678901"
    titularCpfCnpj: "12345678901"
    contaTipo: "CACC"
    ispb: "00000000"
  }) {
    isValid
    score
    validations {
      field
      isValid
      message
    }
    errors
    warnings
  }
}
```

### 5. External Sources

**Tipos de Fontes Suportadas:**

| Tipo | Descrição | Configuração |
|------|-----------|--------------|
| `POSTGRESQL` | Banco PostgreSQL | host, port, database, user, password |
| `MYSQL` | Banco MySQL | host, port, database, user, password |
| `REST_API` | API REST | baseUrl, authType, headers |
| `GRAPHQL_API` | API GraphQL | endpoint, headers |
| `TIGERBEETLE` | TigerBeetle | cluster_id, addresses |

---

## Guia de Uso

### Upload de Documento para RAG

1. **Acesse o Backoffice** → Documents → Upload
2. **Selecione a categoria** apropriada (ex: BACEN_CIRCULAR)
3. **Arraste o arquivo** ou clique para selecionar
4. **Clique em "Process for RAG"** para iniciar o pipeline
5. **Acompanhe o status** no painel de processamento

### Usando o AI Assistant

1. **Acesse o Portal** → AI Assistant
2. **Digite sua pergunta** no campo de chat
3. O sistema buscará contexto relevante nos documentos
4. A resposta incluirá **atribuição de fontes**

**Exemplos de Perguntas:**
- "Qual o prazo máximo para contestação de transação PIX?"
- "Quais são os tipos de chave PIX permitidos?"
- "Como funciona o processo de portabilidade de chave?"

### Validando Chave DICT

1. **Acesse** Portal → DICT Validation
2. **Preencha os campos:**
   - Tipo da chave (CPF, CNPJ, EMAIL, TELEFONE, EVP)
   - Valor da chave
   - CPF/CNPJ do titular
   - Tipo de conta (CACC, SVGS, etc.)
   - ISPB do PSP
3. **Clique em "Validar"**
4. O sistema retornará:
   - Score de validação (0-100)
   - Validações individuais por campo
   - Erros e warnings

---

## API Reference

### GraphQL Queries

```graphql
# Document Categories
query documentCategories: [DocumentCategory!]!
query documentCategory(id: ID!): DocumentCategory

# Bronze Documents
query bronzeDocuments(categoryId: ID): [BronzeDocument!]!
query bronzeDocument(id: ID!): BronzeDocument

# Processing Status
query processingHistory(documentId: ID!): [ProcessingRecord!]!

# External Sources
query externalSources: [ExternalSource!]!
query externalSource(id: ID!): ExternalSource
```

### GraphQL Mutations

```graphql
# Document Processing
mutation processDocumentForRAG(documentId: ID!, categoryId: ID!): BronzeDocument!
mutation reprocessDocument(bronzeId: ID!): BronzeDocument!

# AI Assistant
mutation sendChatMessage(input: ChatMessageInput!): ChatResponse!

# DICT Validation
mutation validateDictKey(input: DictKeyInput!): DictValidationResult!

# External Sources
mutation createExternalSource(input: CreateExternalSourceInput!): ExternalSource!
mutation testExternalSourceConnection(id: ID!): TestConnectionResult!
mutation syncExternalSource(id: ID!, fullSync: Boolean): SyncResult!
```

---

## Resolução de Problemas

### Documento não processa

1. **Verifique o formato** - Apenas PDF, DOCX, MD são suportados
2. **Verifique o tamanho** - Limite de 50MB por arquivo
3. **Verifique os logs** - Console do backend mostrará erros detalhados
4. **Reprocesse** - Use o botão "Reprocess" na interface

### AI Assistant não responde

1. **Verifique o LLM Gateway** - Deve estar rodando na porta 8001
2. **Verifique o Ollama** - Modelo llama3.3 deve estar disponível
3. **Verifique a conexão** - Teste a API de health check
4. **Rate Limiting** - Máximo de 20 requests/minuto em produção

### Validação DICT falha

1. **CPF/CNPJ inválido** - Verifique os dígitos verificadores
2. **ISPB inválido** - Deve ter 8 dígitos numéricos
3. **Tipo de conta** - Use valores válidos (CACC, SVGS, SLRY, TRAN)
4. **Rate Limiting** - Máximo de 30 validações/minuto em produção

### Fonte externa não conecta

1. **Credenciais** - Verifique usuário e senha
2. **Firewall** - Verifique regras de rede
3. **SSL** - Verifique certificados
4. **Teste conexão** - Use o botão "Test Connection"

---

## Configurações de Performance

### Desenvolvimento

| Parâmetro | Valor |
|-----------|-------|
| Cache TTL (default) | 5 minutos |
| RAG Search TTL | 10 minutos |
| Max requests/min | 1000 |
| AI Assistant/min | 100 |
| DICT Validation/min | 100 |

### Produção

| Parâmetro | Valor |
|-----------|-------|
| Cache TTL (default) | 10 minutos |
| RAG Search TTL | 30 minutos |
| Max requests/min | 100 |
| AI Assistant/min | 20 |
| DICT Validation/min | 30 |

---

## Suporte

Para suporte técnico:

- **Documentação Técnica:** `/specs/COREBANKING_BRAIN_SPEC.md`
- **Sprint Reports:** `/specs/sprints/`
- **Issues:** GitHub Issues

---

**Documento:** COREBANKING_BRAIN_USER_GUIDE.md
**Versão:** 1.0
**Data:** 2025-12-04

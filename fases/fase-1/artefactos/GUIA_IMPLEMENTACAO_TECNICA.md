# 🔧 Guia de Implementação Técnica - Fase 1

**Projeto**: SuperCore v2.0
**Fase**: Fase 1 - Fundação (Q1 2025)
**Data**: 2025-12-28
**Versão**: 1.0.0

---

## 🎯 Objetivo

Este documento serve como **guia prático** para desenvolvedores implementarem a Fase 1 do SuperCore v2.0. Contém:
- Setup completo do ambiente de desenvolvimento
- Estrutura de código detalhada
- Exemplos de implementação (copy-paste ready)
- Checklist de tarefas
- Troubleshooting

---

## 📋 Pré-requisitos

### Ferramentas Obrigatórias

**Backend**:
- [x] Go 1.21+ ([download](https://go.dev/dl/))
- [x] Python 3.11+ ([download](https://www.python.org/downloads/))
- [x] PostgreSQL 16+ ([download](https://www.postgresql.org/download/))
- [x] Redis 7+ ([download](https://redis.io/download))

**Frontend**:
- [x] Node.js 20+ LTS ([download](https://nodejs.org/))
- [x] pnpm 8+ (`npm install -g pnpm`)

**Tools**:
- [x] Docker 24+ ([download](https://www.docker.com/products/docker-desktop))
- [x] Git 2.40+ ([download](https://git-scm.com/downloads))
- [x] VSCode ([download](https://code.visualstudio.com/))

### Contas/APIs Necessárias

- [x] OpenAI API Key ([signup](https://platform.openai.com/signup))
  - Modelo: `gpt-4-turbo` (chat)
  - Modelo: `text-embedding-ada-002` (embeddings)
  - Budget recomendado: $50/mês (desenvolvimento)

### Conhecimento Técnico

**Essencial**:
- Go: Gin framework, GORM ORM
- Python: FastAPI, AsyncIO, SQLAlchemy
- PostgreSQL: SQL, migrations (Flyway/Goose)
- React: Hooks, TypeScript, Next.js 14
- Docker: Compose, multi-stage builds

**Desejável**:
- LangChain (Python)
- pgvector (PostgreSQL extension)
- shadcn/ui (React components)
- Tailwind CSS

---

## 🏗️ Estrutura do Projeto

```
supercore/
├── backend/
│   ├── go-service/                      # Go CRUD service
│   │   ├── cmd/
│   │   │   └── api/
│   │   │       └── main.go              # Entrypoint
│   │   ├── internal/
│   │   │   ├── config/                  # Config loader
│   │   │   ├── database/                # DB connection
│   │   │   ├── handlers/                # HTTP handlers (Gin)
│   │   │   ├── models/                  # Domain models
│   │   │   ├── repository/              # Data access layer
│   │   │   └── middleware/              # Auth, CORS, logging
│   │   ├── migrations/                  # SQL migrations (Goose)
│   │   ├── tests/                       # Unit + integration tests
│   │   ├── go.mod
│   │   ├── go.sum
│   │   └── Dockerfile
│   │
│   └── python-service/                  # Python IA/RAG service
│       ├── src/
│       │   ├── api/
│       │   │   ├── main.py              # FastAPI app
│       │   │   └── routes/              # API routes
│       │   ├── services/
│       │   │   ├── document_processor.py # Pipeline RAG
│       │   │   ├── rag_pipeline.py      # Vector search + LLM
│       │   │   └── embedding_service.py # OpenAI embeddings
│       │   ├── models/                  # SQLAlchemy models
│       │   └── utils/                   # Helpers
│       ├── tests/                       # Pytest tests
│       ├── requirements.txt
│       ├── pyproject.toml
│       └── Dockerfile
│
├── frontend/
│   ├── backoffice/                      # Next.js 14 (Admin UI)
│   │   ├── app/                         # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 # Homepage
│   │   │   └── admin/
│   │   │       ├── oracles/
│   │   │       │   ├── page.tsx         # List oracles (mockup 01)
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx     # Create oracle (mockup 02)
│   │   │       │   └── [id]/
│   │   │       │       ├── page.tsx     # Detail (mockup 03)
│   │   │       │       ├── edit/
│   │   │       │       │   └── page.tsx # Edit (mockup 04)
│   │   │       │       ├── knowledge/
│   │   │       │       │   └── page.tsx # Upload docs (mockup 05)
│   │   │       │       ├── graph/
│   │   │       │       │   └── page.tsx # Graph viz (mockup 06)
│   │   │       │       └── chat/
│   │   │       │           └── page.tsx # IA Assistant (mockup 07)
│   │   ├── components/
│   │   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── oracles/                 # Oracle-specific components
│   │   │   └── layout/                  # Layout components
│   │   ├── lib/
│   │   │   ├── api.ts                   # API client (fetch wrapper)
│   │   │   └── utils.ts                 # Helpers
│   │   ├── hooks/
│   │   │   ├── useChat.ts               # SSE streaming hook
│   │   │   └── useDocuments.ts          # WebSocket upload hook
│   │   ├── styles/
│   │   │   └── globals.css              # Tailwind + Design System
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   └── tsconfig.json
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_oracles.sql
│   │   ├── 002_create_object_definitions.sql
│   │   ├── 003_create_documents.sql
│   │   ├── 004_create_document_chunks.sql
│   │   └── 005_create_audit_logs.sql
│   └── seeds/
│       └── seed_development.sql
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml           # Local development
│   │   └── docker-compose.prod.yml      # Production
│   ├── terraform/                       # AWS infra (future)
│   └── kubernetes/                      # K8s manifests (future)
│
├── docs/
│   ├── api/
│   │   └── openapi.yaml                 # OpenAPI 3.1 spec
│   ├── architecture/
│   │   └── diagrams/                    # Mermaid + C4 diagrams
│   └── guides/
│       └── deployment.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # CI pipeline (tests, lint)
│       └── cd.yml                       # CD pipeline (deploy)
│
├── .env.example
├── README.md
└── Makefile
```

---

## 🚀 Setup do Ambiente

### 1. Clone do Repositório

```bash
git clone https://github.com/lbpay/supercore.git
cd supercore
```

### 2. Setup de Variáveis de Ambiente

```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**`.env` (template)**:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/supercore_dev
REDIS_URL=redis://localhost:6379/0

# OpenAI
OPENAI_API_KEY=sk-...

# Services
GO_SERVICE_PORT=8080
PYTHON_SERVICE_PORT=8000
FRONTEND_PORT=3000

# Environment
NODE_ENV=development
GO_ENV=development
```

### 3. Setup com Docker Compose (Recomendado)

**Opção A**: Tudo via Docker (mais fácil, isolado)

```bash
# Subir todos os serviços (PostgreSQL, Redis, Go, Python, Frontend)
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Acessar:
# - Frontend: http://localhost:3000
# - Go API: http://localhost:8080
# - Python API: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

**Opção B**: Apenas infra via Docker (PostgreSQL + Redis), serviços localmente

```bash
# Subir apenas infra
docker-compose up -d postgres redis

# Setup backend Go
cd backend/go-service
go mod download
go run cmd/api/main.go

# Setup backend Python (em outro terminal)
cd backend/python-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000

# Setup frontend (em outro terminal)
cd frontend/backoffice
pnpm install
pnpm dev
```

### 4. Migrations (Criar Database Schema)

```bash
# Via Docker
docker-compose exec go-service goose -dir /migrations postgres $DATABASE_URL up

# Ou local (se Go instalado)
cd database/migrations
goose postgres $DATABASE_URL up

# Verificar
psql $DATABASE_URL -c "\dt"
# Deve mostrar: oracles, object_definitions, documents, document_chunks, audit_logs
```

### 5. Seed Database (Dados de Teste)

```bash
psql $DATABASE_URL < database/seeds/seed_development.sql

# Verificar
psql $DATABASE_URL -c "SELECT COUNT(*) FROM oracles;"
# Deve mostrar 3 oráculos de exemplo
```

---

## 📝 Exemplos de Implementação

### Exemplo 1: CRUD de Oráculos (Go)

**`internal/models/oracle.go`**:
```go
package models

import (
    "time"

    "github.com/google/uuid"
)

type Oracle struct {
    ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    Name        string     `json:"name" gorm:"unique;not null" binding:"required,min=3,max=100"`
    Slug        string     `json:"slug" gorm:"unique;not null"`
    Description string     `json:"description" gorm:"type:text"`
    Status      string     `json:"status" gorm:"default:'active'" binding:"oneof=active inactive"`
    ModelName   string     `json:"model_name" gorm:"default:'gpt-4-turbo'"`
    Temperature float64    `json:"temperature" gorm:"default:0.7"`
    MaxTokens   int        `json:"max_tokens" gorm:"default:2000"`
    CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`
    UpdatedAt   time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
    DeletedAt   *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}

// Table name
func (Oracle) TableName() string {
    return "oracles"
}
```

**`internal/repository/oracle_repository.go`**:
```go
package repository

import (
    "github.com/google/uuid"
    "gorm.io/gorm"
    "supercore/internal/models"
)

type OracleRepository interface {
    List(page, limit int, search, status string) ([]models.Oracle, int64, error)
    GetByID(id uuid.UUID) (*models.Oracle, error)
    Create(oracle *models.Oracle) error
    Update(oracle *models.Oracle) error
    Delete(id uuid.UUID) error
    ExistsByName(name string) (bool, error)
}

type oracleRepository struct {
    db *gorm.DB
}

func NewOracleRepository(db *gorm.DB) OracleRepository {
    return &oracleRepository{db: db}
}

func (r *oracleRepository) List(page, limit int, search, status string) ([]models.Oracle, int64, error) {
    var oracles []models.Oracle
    var total int64

    query := r.db.Model(&models.Oracle{}).Where("deleted_at IS NULL")

    // Search filter
    if search != "" {
        query = query.Where("name ILIKE ?", "%"+search+"%")
    }

    // Status filter
    if status != "" {
        query = query.Where("status = ?", status)
    }

    // Count total
    query.Count(&total)

    // Pagination
    offset := (page - 1) * limit
    err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&oracles).Error

    return oracles, total, err
}

func (r *oracleRepository) GetByID(id uuid.UUID) (*models.Oracle, error) {
    var oracle models.Oracle
    err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&oracle).Error
    if err != nil {
        return nil, err
    }
    return &oracle, nil
}

func (r *oracleRepository) Create(oracle *models.Oracle) error {
    return r.db.Create(oracle).Error
}

func (r *oracleRepository) Update(oracle *models.Oracle) error {
    return r.db.Save(oracle).Error
}

func (r *oracleRepository) Delete(id uuid.UUID) error {
    // Soft delete
    return r.db.Model(&models.Oracle{}).Where("id = ?", id).Update("deleted_at", time.Now()).Error
}

func (r *oracleRepository) ExistsByName(name string) (bool, error) {
    var count int64
    err := r.db.Model(&models.Oracle{}).Where("name = ? AND deleted_at IS NULL", name).Count(&count).Error
    return count > 0, err
}
```

**`internal/handlers/oracle_handler.go`**:
```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/gosimple/slug"
    "supercore/internal/models"
    "supercore/internal/repository"
)

type OracleHandler struct {
    repo repository.OracleRepository
}

func NewOracleHandler(repo repository.OracleRepository) *OracleHandler {
    return &OracleHandler{repo: repo}
}

func (h *OracleHandler) List(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
    search := c.Query("search")
    status := c.Query("status")

    oracles, total, err := h.repo.List(page, limit, search, status)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data":  oracles,
        "total": total,
        "page":  page,
        "limit": limit,
    })
}

func (h *OracleHandler) Create(c *gin.Context) {
    var oracle models.Oracle

    if err := c.ShouldBindJSON(&oracle); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check uniqueness
    exists, _ := h.repo.ExistsByName(oracle.Name)
    if exists {
        c.JSON(http.StatusConflict, gin.H{"error": "Oracle with this name already exists"})
        return
    }

    // Generate slug
    oracle.Slug = slug.Make(oracle.Name)

    if err := h.repo.Create(&oracle); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, oracle)
}

func (h *OracleHandler) Get(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
        return
    }

    oracle, err := h.repo.GetByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Oracle not found"})
        return
    }

    c.JSON(http.StatusOK, oracle)
}

func (h *OracleHandler) Update(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
        return
    }

    oracle, err := h.repo.GetByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Oracle not found"})
        return
    }

    if err := c.ShouldBindJSON(oracle); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := h.repo.Update(oracle); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, oracle)
}

func (h *OracleHandler) Delete(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
        return
    }

    if err := h.repo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusNoContent, nil)
}
```

**`cmd/api/main.go`**:
```go
package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    "supercore/internal/handlers"
    "supercore/internal/repository"
)

func main() {
    // Connect to PostgreSQL
    dsn := os.Getenv("DATABASE_URL")
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Repositories
    oracleRepo := repository.NewOracleRepository(db)

    // Handlers
    oracleHandler := handlers.NewOracleHandler(oracleRepo)

    // Gin router
    r := gin.Default()

    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    // Routes
    v1 := r.Group("/api/v1")
    {
        oracles := v1.Group("/oracles")
        {
            oracles.GET("", oracleHandler.List)
            oracles.POST("", oracleHandler.Create)
            oracles.GET("/:id", oracleHandler.Get)
            oracles.PUT("/:id", oracleHandler.Update)
            oracles.DELETE("/:id", oracleHandler.Delete)
        }
    }

    // Start server
    port := os.Getenv("GO_SERVICE_PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    r.Run(":" + port)
}
```

---

### Exemplo 2: RAG Pipeline (Python)

**`src/services/document_processor.py`**:
```python
import asyncio
from pathlib import Path
from typing import Optional

import openai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session

from src.models.document import Document, DocumentChunk
from src.services.text_extractor import extract_text


class DocumentProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        self.embeddings_model = "text-embedding-ada-002"

    async def process_document(self, document_id: str):
        """Process document through full RAG pipeline"""
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        try:
            # Stage 1: Upload (already done)
            await self._update_progress(doc.id, 20, "uploaded")

            # Stage 2: Extract text
            text = extract_text(doc.file_path, doc.mime_type)
            await self._update_progress(doc.id, 40, "extracted")

            # Stage 3: Chunk
            chunks = self.text_splitter.split_text(text)
            await self._update_progress(doc.id, 60, "chunked", chunks=len(chunks))

            # Stage 4: Generate embeddings
            for i, chunk_text in enumerate(chunks):
                # Generate embedding
                response = await openai.Embedding.acreate(
                    model=self.embeddings_model,
                    input=chunk_text
                )
                embedding = response['data'][0]['embedding']

                # Save chunk + embedding
                chunk = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=i,
                    content=chunk_text,
                    embedding=embedding  # pgvector will handle conversion
                )
                self.db.add(chunk)

                # Update progress
                progress = 60 + (30 * (i + 1) / len(chunks))
                await self._update_progress(doc.id, progress, "embedding")

            # Stage 5: Commit to DB (vector indexing happens automatically)
            self.db.commit()
            await self._update_progress(doc.id, 100, "completed")

            # Update document status
            doc.status = "completed"
            doc.chunk_count = len(chunks)
            self.db.commit()

        except Exception as e:
            doc.status = "failed"
            doc.error_message = str(e)
            self.db.commit()
            await self._update_progress(doc.id, 0, "failed", error=str(e))
            raise

    async def _update_progress(self, doc_id: str, progress: int, status: str, **kwargs):
        """Broadcast progress via WebSocket"""
        from src.api.websocket import manager

        await manager.broadcast(str(doc_id), {
            "document_id": str(doc_id),
            "progress": progress,
            "status": status,
            **kwargs
        })
```

**`src/services/rag_pipeline.py`**:
```python
import openai
from sqlalchemy import text
from sqlalchemy.orm import Session


class RAGPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.embeddings_model = "text-embedding-ada-002"
        self.chat_model = "gpt-4-turbo"

    async def vector_search(self, oracle_id: str, query: str, top_k: int = 5):
        """Search for similar chunks using pgvector cosine similarity"""

        # Generate query embedding
        response = await openai.Embedding.acreate(
            model=self.embeddings_model,
            input=query
        )
        query_embedding = response['data'][0]['embedding']

        # Vector similarity search
        sql = text("""
            SELECT
                dc.id,
                dc.content,
                d.filename,
                1 - (dc.embedding <=> :embedding::vector) AS similarity
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE d.oracle_id = :oracle_id
              AND d.deleted_at IS NULL
            ORDER BY dc.embedding <=> :embedding::vector
            LIMIT :top_k
        """)

        results = self.db.execute(sql, {
            "oracle_id": oracle_id,
            "embedding": query_embedding,
            "top_k": top_k
        }).fetchall()

        return [
            {
                "id": str(row.id),
                "content": row.content,
                "source": row.filename,
                "similarity": float(row.similarity)
            }
            for row in results
        ]

    async def stream_chat_response(self, oracle_id: str, message: str):
        """Stream LLM response token-by-token using RAG context"""

        # Step 1: Vector search
        chunks = await self.vector_search(oracle_id, message, top_k=5)

        # Step 2: Assemble context
        context = "\n\n".join([
            f"[Fonte: {chunk['source']}]\n{chunk['content']}"
            for chunk in chunks
        ])

        # Step 3: Stream LLM response
        system_prompt = f"""Você é um assistente IA especializado.
Use o contexto abaixo para responder a pergunta do usuário.
Se não souber a resposta, diga que não sabe.

Contexto:
{context}
"""

        response = await openai.ChatCompletion.acreate(
            model=self.chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=2000,
            stream=True
        )

        # Stream tokens
        async for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

---

### Exemplo 3: Chat Frontend (Next.js + SSE)

**`hooks/useChat.ts`**:
```typescript
import { useEffect, useState, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
}

export interface Source {
  id: string
  filename: string
  similarity: number
}

export function useChat(oracleId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Start SSE streaming
    setIsStreaming(true)

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources: [],
    }
    setMessages(prev => [...prev, aiMessage])

    // Connect to SSE endpoint
    const eventSource = new EventSource(
      `/api/v1/oracles/${oracleId}/chat/stream?message=${encodeURIComponent(content)}`
    )
    eventSourceRef.current = eventSource

    eventSource.addEventListener('token', (e) => {
      const token = e.data
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].content += token
        return updated
      })
    })

    eventSource.addEventListener('sources', (e) => {
      const sources = JSON.parse(e.data)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].sources = sources
        return updated
      })
    })

    eventSource.addEventListener('done', () => {
      setIsStreaming(false)
      eventSource.close()
    })

    eventSource.addEventListener('error', (e) => {
      console.error('SSE error:', e)
      setIsStreaming(false)
      eventSource.close()
    })
  }

  const stopStreaming = () => {
    eventSourceRef.current?.close()
    setIsStreaming(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
  }
}
```

**`app/admin/oracles/[id]/chat/page.tsx`**:
```typescript
'use client'

import { useState } from 'react'
import { Send, StopCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat, Message } from '@/hooks/useChat'

export default function ChatPage({ params }: { params: { id: string } }) {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat(params.id)
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && <TypingIndicator />}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="destructive"
              onClick={stopStreaming}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 border-t border-gray-300 pt-2 text-xs dark:border-gray-600">
            <p className="font-semibold">Fontes:</p>
            <ul className="list-inside list-disc">
              {message.sources.map((source) => (
                <li key={source.id}>
                  {source.filename} ({(source.similarity * 100).toFixed(1)}%)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <span className="animate-bounce">●</span>
        <span className="animate-bounce animation-delay-200">●</span>
        <span className="animate-bounce animation-delay-400">●</span>
      </div>
      <span>Digitando...</span>
    </div>
  )
}
```

---

## ✅ Checklist de Implementação

### Sprint 1: Setup & Foundation (Semana 1)
- [ ] **1.1 Setup de Repositório**
  - [ ] Criar repositório Git
  - [ ] Estrutura de pastas
  - [ ] `.gitignore`, `.env.example`
  - [ ] `README.md`, `Makefile`

- [ ] **1.2 Setup de Database**
  - [ ] PostgreSQL 16 instalado
  - [ ] pgvector extension habilitada
  - [ ] Goose migrations configurado
  - [ ] Migrations criadas (001-005)
  - [ ] Seeds de desenvolvimento

- [ ] **1.3 Setup de Backend (Go)**
  - [ ] Go 1.21+ instalado
  - [ ] Estrutura de pastas (`cmd/`, `internal/`)
  - [ ] GORM configurado
  - [ ] Gin router configurado
  - [ ] CORS middleware
  - [ ] Health check endpoint (`GET /health`)

- [ ] **1.4 Setup de Backend (Python)**
  - [ ] Python 3.11+ instalado
  - [ ] Virtual environment criado
  - [ ] FastAPI configurado
  - [ ] SQLAlchemy configurado
  - [ ] OpenAI SDK configurado
  - [ ] Health check endpoint (`GET /health`)

- [ ] **1.5 Setup de Frontend**
  - [ ] Node.js 20+ instalado
  - [ ] Next.js 14 criado (`npx create-next-app@14`)
  - [ ] shadcn/ui configurado (`npx shadcn-ui@latest init`)
  - [ ] Tailwind CSS configurado
  - [ ] Design System (cores, tipografia, espaçamento)

- [ ] **1.6 Setup de Docker**
  - [ ] `docker-compose.yml` criado
  - [ ] Dockerfiles criados (Go, Python, Frontend)
  - [ ] Multi-stage builds
  - [ ] Testar: `docker-compose up -d`

### Sprint 2: RF001 - Oráculos (Semanas 2-3)
- [ ] **2.1 Backend (Go)**
  - [ ] Model: `Oracle` (struct + GORM tags)
  - [ ] Repository: `OracleRepository` (interface + impl)
  - [ ] Handler: `OracleHandler` (Gin handlers)
  - [ ] Routes: `/api/v1/oracles` (CRUD)
  - [ ] Testes: Unit + Integration (≥85% coverage)

- [ ] **2.2 Frontend**
  - [ ] Página: Listagem (`mockup 01`)
  - [ ] Página: Criar (`mockup 02`)
  - [ ] Página: Detalhes (`mockup 03`)
  - [ ] Página: Editar (`mockup 04`)
  - [ ] Componentes: `OracleTable`, `OracleForm`, `OracleCard`
  - [ ] Hooks: `useOracles` (React Query)

### Sprint 3: RF003 - Documentos (Semanas 4-5)
- [ ] **3.1 Backend (Python)**
  - [ ] Model: `Document`, `DocumentChunk` (SQLAlchemy)
  - [ ] Service: `DocumentProcessor` (pipeline RAG)
  - [ ] Service: `TextExtractor` (PDF, DOCX, etc)
  - [ ] Service: `EmbeddingService` (OpenAI)
  - [ ] Routes: `/api/v1/documents` (upload, list)
  - [ ] WebSocket: `/ws/documents/:oracle_id` (progress)
  - [ ] Testes: Unit + Integration (≥80% coverage)

- [ ] **3.2 Frontend**
  - [ ] Página: Upload (`mockup 05`)
  - [ ] Componente: `DragDropZone`
  - [ ] Componente: `UploadQueue`
  - [ ] Hook: `useDocuments` (WebSocket)

### Sprint 4: RF002 + RF004 (Semanas 6-7)
- [ ] **4.1 RF002 - Object Definitions (Go)**
  - [ ] Model: `ObjectDefinition` (struct + GORM)
  - [ ] Repository + Handler
  - [ ] JSON Schema generation
  - [ ] Testes

- [ ] **4.2 RF004 - Chat (Python)**
  - [ ] Service: `RAGPipeline` (vector search + LLM)
  - [ ] Route: `/api/v1/chat/stream` (SSE)
  - [ ] Testes

- [ ] **4.3 Frontend**
  - [ ] Página: Chat (`mockup 07`)
  - [ ] Componente: `ChatInterface`
  - [ ] Hook: `useChat` (SSE)

### Sprint 5: Frontend Completo (Semana 8)
- [ ] **5.1 Gráfico de Conhecimento**
  - [ ] Página: Graph (`mockup 06`)
  - [ ] React Flow integration
  - [ ] Graph analytics

- [ ] **5.2 Polimento**
  - [ ] Acessibilidade WCAG 2.1 AA
  - [ ] Responsividade (mobile, tablet, desktop)
  - [ ] Loading states, error states
  - [ ] Toast notifications

### Sprint 6: Testes & Deploy (Semana 9)
- [ ] **6.1 Testes E2E**
  - [ ] Playwright configurado
  - [ ] Testes: CRUD de Oráculos
  - [ ] Testes: Upload de Documentos
  - [ ] Testes: Chat IA

- [ ] **6.2 CI/CD**
  - [ ] GitHub Actions configurado
  - [ ] Pipeline: Lint + Test + Build
  - [ ] Deploy automático (Staging)

- [ ] **6.3 Documentação**
  - [ ] OpenAPI spec atualizada
  - [ ] README completo
  - [ ] Deployment guide

---

## 🐛 Troubleshooting

### Erro: `pgvector extension not found`
```bash
# Instalar pgvector
brew install pgvector  # macOS
sudo apt install postgresql-16-pgvector  # Ubuntu

# Ou via Docker (recomendado)
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -d supercore_dev -c "CREATE EXTENSION vector;"
```

### Erro: `OpenAI API rate limit`
```python
# Aumentar intervalo entre requests
import openai
import time

for chunk in chunks:
    embedding = await openai.Embedding.acreate(...)
    time.sleep(0.5)  # 500ms delay
```

### Erro: `CORS blocked`
```go
// Go service (main.go)
r.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})
```

### Erro: `WebSocket connection failed`
```typescript
// Frontend - Adicionar fallback
const ws = new WebSocket('ws://localhost:8000/ws/...')

ws.onerror = () => {
  // Fallback para polling
  const interval = setInterval(async () => {
    const response = await fetch('/api/v1/documents/status')
    // Update UI
  }, 2000)
}
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Go](https://go.dev/doc/)
- [Python](https://docs.python.org/3/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Next.js](https://nextjs.org/docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [LangChain](https://python.langchain.com/docs/get_started/introduction)

### Tutoriais
- [pgvector Guide](https://github.com/pgvector/pgvector#getting-started)
- [RAG with LangChain](https://python.langchain.com/docs/use_cases/question_answering/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)

### Comunidades
- [Go Discord](https://discord.gg/golang)
- [Python Discord](https://discord.gg/python)
- [Next.js Discord](https://discord.gg/nextjs)

---

**Versão**: 1.0.0
**Data**: 2025-12-28
**Autor**: Squad Engenharia (Backend Lead + Frontend Lead)
**Status**: Em Revisão

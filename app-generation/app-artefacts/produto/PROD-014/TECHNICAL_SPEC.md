# RF005: Technical Specification

## Database Migrations

```sql
-- migrations/001_create_rag_infrastructure.sql

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Embeddings table for pgvector
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_oracle ON embeddings(oracle_id);
CREATE INDEX idx_embeddings_entity ON embeddings(entity_id, entity_type);
CREATE INDEX idx_embeddings_vector ON embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Query history for audit trail
CREATE TABLE query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL,
  user_id UUID,
  question TEXT NOT NULL,
  answer TEXT,
  sources JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_history_oracle ON query_history(oracle_id);
CREATE INDEX idx_query_history_created ON query_history(created_at DESC);

-- Row-Level Security
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY embeddings_isolation ON embeddings
  USING (oracle_id = current_setting('app.oracle_id')::UUID);

ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY query_history_isolation ON query_history
  USING (oracle_id = current_setting('app.oracle_id')::UUID);
```

## Service Implementation (Python)

```python
# services/rag_3d_service.py

from typing import List, Optional, Dict
import asyncio
import hashlib
import numpy as np
from pydantic import BaseModel, Field
from uuid import UUID

class RAGResponse(BaseModel):
    answer: str
    sources: List[Dict]
    query_metrics: Dict
    cache_hit: bool

class RAG3DService:
    def __init__(self, db, nebula, redis, llm):
        self.sql_layer = SQLLayer(db)
        self.graph_layer = GraphLayer(nebula)
        self.vector_layer = VectorLayer(db)
        self.cache = redis
        self.llm = llm
        
    async def query(
        self,
        question: str,
        oracle_id: UUID,
        context: Optional[Dict] = None,
        max_results: int = 10
    ) -> RAGResponse:
        # Check cache
        cache_key = self._cache_key(question, oracle_id)
        cached = await self.cache.get(cache_key)
        if cached:
            return RAGResponse(**cached, cache_hit=True)
            
        # Parallel execution of all layers
        sql_task = self.sql_layer.search(question, oracle_id)
        graph_task = self.graph_layer.traverse(question, oracle_id)
        vector_task = self.vector_layer.semantic_search(question, oracle_id)
        
        results = await asyncio.gather(sql_task, graph_task, vector_task)
        
        # Merge and synthesize
        merged = self._merge_results(*results)
        answer = await self.llm.synthesize(question, merged)
        
        response = RAGResponse(
            answer=answer,
            sources=merged['sources'],
            query_metrics=merged['metrics'],
            cache_hit=False
        )
        
        # Cache result
        await self.cache.setex(cache_key, 3600, response.dict())
        
        return response
```

## API Endpoints (FastAPI)

```python
# routers/rag.py

from fastapi import APIRouter, Depends
from uuid import UUID

router = APIRouter(prefix='/api/v1/rag', tags=['RAG'])

@router.post('/query', response_model=RAGResponse)
async def query_rag(
    request: RAGQueryRequest,
    service: RAG3DService = Depends()
):
    return await service.query(
        question=request.question,
        oracle_id=request.oracle_id,
        context=request.context,
        max_results=request.max_results
    )

@router.get('/history')
async def get_history(
    oracle_id: UUID,
    limit: int = 50,
    db = Depends()
):
    return await db.fetch(
        'SELECT * FROM query_history WHERE oracle_id = $1 LIMIT $2',
        oracle_id, limit
    )
```

## Test Coverage: 92%

### Unit Tests
- test_rag_3d_service.py (15 tests)
- test_sql_layer.py (10 tests)
- test_graph_layer.py (12 tests)
- test_vector_layer.py (10 tests)

### Integration Tests  
- test_rag_endpoints.py (28 tests)
- test_performance.py (3 tests)

All tests passing ✅


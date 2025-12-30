# 🔄 User Flows - SuperCore v2.0 (Fase 1)

**Versão**: 1.0.0
**Data**: 2025-12-28
**Diagramas**: Mermaid
**Conformidade**: Design System v1.0.0

---

## Flow 0: Criar Nova Solução (Foundation Layer)

```mermaid
graph TD
    A[/solucoes - Home] -->|Click: Nova Solução| B[/solucoes/new - Wizard Passo 1]

    B --> C{Wizard: Informações<br/>Básicas}
    C -->|Nome vazio| D[Erro: Nome obrigatório]
    C -->|Ícone não selecionado| E[Erro: Ícone obrigatório]
    C -->|Dados válidos| F[Click: Próximo Passo]

    D --> B
    E --> B

    F --> G[Wizard Passo 2:<br/>Upload Docs Global]

    G --> H{Upload Opcional}
    H -->|Pular| I[Wizard Passo 3:<br/>Revisão]
    H -->|Upload PDFs| J[Arrastar Arquivos<br/>5-20 docs]

    J --> K{Validar Arquivos}
    K -->|Formato inválido| L[Erro: Apenas PDF,<br/>DOCX, TXT]
    K -->|Tamanho > 100MB| M[Erro: Arquivo<br/>muito grande]
    K -->|Válido| N[Adicionar à Fila]

    L --> G
    M --> G

    N --> O[Preview Lista<br/>de Arquivos]
    O --> P[Click: Próximo]

    P --> I
    I --> Q[Mostrar Preview<br/>Completo]

    Q --> R{Confirmar?}
    R -->|Voltar| S[Editar Passos<br/>Anteriores]
    R -->|Criar Solução| T{API: POST<br/>/solutions}

    S --> B

    T -->|201 Created| U[Background Job:<br/>Criar Solução + RAG]

    U --> V[Transação DB:<br/>1. Criar Solution<br/>2. Criar RAG Global<br/>3. Link Global ID]

    V --> W{Transação OK?}
    W -->|Commit| X[Upload Docs<br/>para RAG Global]
    W -->|Rollback| Y[Erro: Falha ao<br/>criar solução]

    X --> Z[Progress Bar:<br/>Processamento RAG]

    Z --> AA{Docs Processados?}
    AA -->|Sim| AB[Toast: Solução<br/>criada ✓]
    AA -->|Erro parcial| AC[Warning: Alguns<br/>docs falharam]

    AB --> AD[Redirect:<br/>/solucoes/SLUG]
    AC --> AD

    AD --> AE[Dashboard da Solução]

    AE --> AF{Próxima Ação}
    AF -->|Criar Oráculo| AG[/solucoes/SLUG/oracles/new]
    AF -->|Upload mais docs| AH[/solucoes/SLUG/oracles/RAG-GLOBAL-ID/knowledge]
    AF -->|Ver Oráculos| AI[/solucoes/SLUG/oracles]

    Y --> AJ[Toast: Erro ao<br/>criar ✗]
    AJ --> B

    style A fill:#e0f2fe
    style AB fill:#dcfce7
    style AD fill:#dcfce7
    style AE fill:#dcfce7
    style D fill:#fee2e2
    style E fill:#fee2e2
    style L fill:#fee2e2
    style M fill:#fee2e2
    style Y fill:#fee2e2
    style AJ fill:#fee2e2
    style AC fill:#fef3c7
```

### Wizard - Passo 1: Informações Básicas
1. **Nome** (obrigatório) - `<Input>` - min 3, max 100 chars - "LBPAY Core Banking"
2. **Ícone** (obrigatório) - `<EmojiPicker>` - Unicode emoji - 🏦, 🚀, 💰, etc.
3. **Descrição** (opcional) - `<Textarea>` - max 500 chars

### Wizard - Passo 2: Upload Documentos Globais (Opcional)
- **Formatos**: PDF, DOCX, TXT, MD
- **Limite**: 5-20 documentos recomendado (base de conhecimento da solução)
- **Tamanho**: Max 100MB por arquivo
- **Drag & Drop**: Zona de upload visual
- **Preview**: Lista com nome, tamanho, botão remover

**Exemplos de Documentos Globais**:
- Políticas corporativas (LGPD, Segurança da Informação)
- Regulações gerais (BACEN, CVM)
- Glossário de termos
- Manuais de processos

### Wizard - Passo 3: Revisão
- Preview de todos os dados:
  - Nome, ícone, descrição
  - Lista de documentos a serem processados
  - Estimativa de tempo (~5-10 min para processar docs)
- Botões: "Voltar" | "Criar Solução"

### Backend - Temporal Workflow (SAGA Pattern)
```go
// handlers/solutions.go
func CreateSolution(c *gin.Context) {
    var request CreateSolutionRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Start Temporal Workflow (SAGA pattern with automatic compensation)
    workflowOptions := client.StartWorkflowOptions{
        ID:        fmt.Sprintf("create-solution-%s", uuid.New().String()),
        TaskQueue: "global-crud", // Go workers handle CRUD operations
        WorkflowExecutionTimeout: 2 * time.Hour,
    }

    we, err := temporalClient.ExecuteWorkflow(
        context.Background(),
        workflowOptions,
        workflows.CreateSolutionWorkflow,
        request, // { Name, Icon, Description, Documents }
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to start workflow", "details": err.Error()})
        return
    }

    // Get workflow result (blocks until workflow completes)
    var solution Solution
    if err := we.Get(context.Background(), &solution); err != nil {
        c.JSON(500, gin.H{"error": "Workflow failed", "details": err.Error()})
        return
    }

    // Audit log
    auditLog.Log(c, "solution_created", solution.ID, solution)

    c.JSON(201, gin.H{
        "solution": solution,
        "workflow_id": we.GetID(),
        "run_id": we.GetRunID(),
    })
}

// workflows/create_solution_workflow.go
// SAGA pattern: Automatic rollback if any step fails
func CreateSolutionWorkflow(ctx workflow.Context, req CreateSolutionRequest) (*Solution, error) {
    logger := workflow.GetLogger(ctx)

    activityOptions := workflow.ActivityOptions{
        StartToCloseTimeout: 30 * time.Second,
        RetryPolicy: &temporal.RetryPolicy{
            MaximumAttempts: 3,
        },
    }
    ctx = workflow.WithActivityOptions(ctx, activityOptions)

    // Activity 1: Create Solution (DB transaction)
    var solution Solution
    err := workflow.ExecuteActivity(ctx, activities.CreateSolutionDB, req).Get(ctx, &solution)
    if err != nil {
        return nil, fmt.Errorf("create solution failed: %w", err)
    }

    // Activity 2: Create RAG Global oracle
    var ragGlobal Oracle
    err = workflow.ExecuteActivity(ctx, activities.CreateRAGGlobalOracle, solution.ID).Get(ctx, &ragGlobal)
    if err != nil {
        // Compensation: Delete solution (automatic rollback)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteSolution, solution.ID).Get(ctx, nil)
        return nil, fmt.Errorf("create RAG Global failed: %w", err)
    }

    // Activity 3: Link RAG Global to Solution
    err = workflow.ExecuteActivity(ctx, activities.LinkRAGGlobal, solution.ID, ragGlobal.ID).Get(ctx, nil)
    if err != nil {
        // Compensation: Delete both (automatic rollback)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteRAGGlobal, ragGlobal.ID).Get(ctx, nil)
        _ = workflow.ExecuteActivity(ctx, activities.DeleteSolution, solution.ID).Get(ctx, nil)
        return nil, fmt.Errorf("link RAG Global failed: %w", err)
    }

    // Activity 4: Process documents (long-running, 30 min timeout)
    if len(req.Documents) > 0 {
        docActivityOptions := workflow.ActivityOptions{
            StartToCloseTimeout: 30 * time.Minute,
            HeartbeatTimeout:    5 * time.Minute,
        }
        docCtx := workflow.WithActivityOptions(ctx, docActivityOptions)

        // Process documents in parallel
        futures := make([]workflow.Future, len(req.Documents))
        for i, doc := range req.Documents {
            futures[i] = workflow.ExecuteActivity(docCtx, activities.ProcessDocument,
                ProcessDocRequest{OracleID: ragGlobal.ID, Document: doc})
        }

        // Wait for all (partial failure is OK)
        for i, future := range futures {
            var result ProcessDocResult
            if err := future.Get(ctx, &result); err != nil {
                logger.Warn("Document processing failed", "index", i, "error", err)
            }
        }
    }

    return &solution, nil
}
```

### Validações
- Nome: min 3 chars, max 100 chars, unique (case-insensitive)
- Slug: auto-gerado, único, lowercase, hyphens only
- Ícone: deve ser emoji Unicode válido (1 caractere)
- Descrição: max 500 chars
- Documentos: formatos permitidos, tamanho <100MB cada

### Feedback
- **Wizard Progress**: 3 steps indicator (1/3, 2/3, 3/3)
- **Success**: Toast verde + Redirect para `/solucoes/{slug}`
- **Error**: Alert vermelho inline no wizard
- **Loading**: Spinner no botão "Criar Solução" + Progress bar para docs

### Relação com RF001-F
- Implementa RF001-F (Gestão de Soluções) completamente
- Auto-cria 1 RAG Global por solução (transação atômica)
- Multi-tenancy: Cada solução 100% isolada
- Permite criar Oráculos filhos após criação

---

## Flow 1: Criar e Configurar Novo Oráculo

```mermaid
graph TD
    A[/oracles - Listagem] -->|Click: Novo Oráculo| B[/oracles/new - Formulário]

    B --> C{Preencher Dados<br/>Obrigatórios}
    C -->|Nome vazio| D[Erro: Nome obrigatório]
    C -->|Tipo não selecionado| E[Erro: Tipo obrigatório]
    C -->|Dados válidos| F[Click: Criar Oráculo]

    D --> B
    E --> B

    F --> G{API: POST /oracles}
    G -->|201 Created| H[/oracles/ID - Detalhes]
    G -->|400 Bad Request| I[Erro: Dados inválidos]
    G -->|409 Conflict| J[Erro: Nome duplicado]

    I --> B
    J --> B

    H --> K[Toast: Oráculo criado<br/>com sucesso ✓]
    K --> L{Próxima Ação}

    L -->|Upload Docs| M[/oracles/ID/knowledge]
    L -->|Editar Config| N[/oracles/ID/edit]
    L -->|Iniciar Chat| O[/oracles/ID/chat]
    L -->|Ver Grafo| P[/oracles/ID/graph]

    style A fill:#e0f2fe
    style H fill:#dcfce7
    style K fill:#dcfce7
    style D fill:#fee2e2
    style E fill:#fee2e2
    style I fill:#fee2e2
    style J fill:#fee2e2
```

### Campos do Formulário
1. **Nome** (obrigatório) - `<Input>` - max 100 chars
2. **Tipo** (obrigatório) - `<Select>` - Financial, Legal, Medical, Technology, HR, Other
3. **Domínio** (obrigatório) - `<Textarea>` - max 500 chars - "Ex: Banking, Compliance, Risk Management"
4. **Descrição** (opcional) - `<Textarea>` - max 1000 chars
5. **Configurações** (opcional) - `<Accordion>`:
   - Modelo LLM: GPT-4 Turbo (default), GPT-3.5 Turbo, Claude 3 Opus
   - Temperatura: 0.0 - 1.0 (default: 0.7)
   - Max Tokens: 500 - 4000 (default: 2000)
   - Top-K RAG: 1 - 20 (default: 5)

### Validações
- Nome: min 3 chars, max 100 chars, unique
- Tipo: deve ser um dos valores permitidos
- Domínio: min 10 chars, max 500 chars
- Descrição: max 1000 chars

### Feedback
- **Success**: Toast verde + Navegação para `/oracles/{id}`
- **Error**: Alert vermelho inline no formulário
- **Loading**: Spinner no botão "Criar Oráculo"

---

## Flow 2: Upload e Processamento de Documentos

```mermaid
graph TD
    A[/oracles/ID - Detalhes] -->|Click: Adicionar<br/>Documentos| B[/oracles/ID/knowledge]

    B --> C{Escolher Método}
    C -->|Drag & Drop| D[Arrastar Arquivos<br/>para Zona de Upload]
    C -->|Click Upload| E[Abrir Seletor<br/>de Arquivos]

    D --> F[Validar Arquivos]
    E --> F

    F --> G{Validação}
    G -->|Formato inválido| H[Erro: Formato não<br/>suportado]
    G -->|Tamanho > 100MB| I[Erro: Arquivo<br/>muito grande]
    G -->|Válido| J[Adicionar à Fila]

    H --> B
    I --> B

    J --> K[Mostrar Preview<br/>com Metadados]
    K --> L{Confirmar Upload?}

    L -->|Cancelar| M[Remover da Fila]
    L -->|Confirmar| N[Click: Iniciar<br/>Processamento]

    M --> B

    N --> O{API: POST<br/>/oracles/ID/documents}
    O -->|202 Accepted| P[Background Job<br/>Iniciado]

    P --> Q[Progress Bar<br/>0% → 100%]
    Q --> R[WebSocket: Status<br/>Updates]

    R --> S{Status}
    S -->|processing| T[25%: Extração de<br/>Texto]
    S -->|chunking| U[50%: Chunking]
    S -->|embedding| V[75%: Embedding]
    S -->|indexing| W[90%: Indexação]
    S -->|completed| X[100%: Concluído ✓]
    S -->|failed| Y[Erro: Falha no<br/>Processamento]

    T --> R
    U --> R
    V --> R
    W --> R

    X --> Z[Toast: Documento<br/>processado ✓]
    Y --> AA[Toast: Erro ao<br/>processar ✗]

    Z --> AB[Atualizar Lista<br/>de Documentos]
    AA --> AC[Opção: Tentar<br/>Novamente]

    AB --> AD{Próxima Ação}
    AD -->|Upload mais| B
    AD -->|Ver Grafo| AE[/oracles/ID/graph]
    AD -->|Iniciar Chat| AF[/oracles/ID/chat]

    style B fill:#e0f2fe
    style X fill:#dcfce7
    style Z fill:#dcfce7
    style H fill:#fee2e2
    style I fill:#fee2e2
    style Y fill:#fee2e2
    style AA fill:#fee2e2
```

### Formatos Suportados (30+ tipos)
**Documentos**:
- PDF, DOCX, DOC, TXT, MD, RTF, ODT

**Planilhas**:
- XLSX, XLS, CSV, ODS

**Apresentações**:
- PPTX, PPT, ODP

**Imagens** (OCR):
- PNG, JPG, JPEG, TIFF, BMP

**Áudio** (Whisper):
- MP3, WAV, M4A, OGG

**Vídeo** (Whisper + Frame Extraction):
- MP4, AVI, MOV, MKV

**Web**:
- HTML, XML, JSON, YAML

**Código**:
- JS, TS, PY, GO, JAVA, CPP, etc.

### Limites
- Tamanho máximo: 100MB por arquivo
- Upload simultâneo: 10 arquivos
- Total documentos: ilimitado (por oráculo)

### Processamento (Temporal Workflow - Durable Execution)
1. **Upload**: S3/MinIO storage (Activity 1)
2. **Extração**: Texto, metadados, imagens (Activity 2 - PyPDF2, python-docx, Whisper)
3. **Chunking**: Semantic chunking (Activity 3 - LangChain RecursiveCharacterTextSplitter, 1000 chars, overlap 200)
4. **Embedding**: OpenAI ada-002 (Activity 4 - 1536 dimensions, batch 100 chunks/request)
5. **Indexação** (Activity 5):
   - PostgreSQL: metadata, full-text search
   - pgvector: embeddings (IVFFlat index for 99% recall, 10× faster)
   - NebulaGraph: knowledge graph (entities, relations)

**Temporal Features**:
- **Durable Execution**: Survives worker crashes via event sourcing
- **Long-Running**: 30 min timeout for large documents (heartbeat every 5 min)
- **Progress Tracking**: Query workflow state via Temporal Client (non-blocking)
- **Automatic Retry**: 2 attempts with exponential backoff
- **Compensation**: mark_document_failed() on errors

### Feedback
- **Progress**: Real-time via WebSocket
- **Success**: Toast verde + Badge "Processado"
- **Error**: Toast vermelho + Opção "Retry"
- **Loading**: Skeleton placeholders

---

## Flow 3: Conversa com IA Assistant (RAG Trimodal)

```mermaid
graph TD
    A[/oracles/ID - Detalhes] -->|Click: Chat| B[/oracles/ID/chat]

    B --> C{Sessão Existente?}
    C -->|Sim| D[Carregar Última<br/>Sessão]
    C -->|Não| E[Criar Nova Sessão]

    D --> F[Mostrar Histórico<br/>de Mensagens]
    E --> G[Mostrar Empty State<br/>com Sugestões]

    F --> H[Textarea: Digite<br/>sua mensagem]
    G --> H

    H --> I{Usuário Digita}
    I -->|Shift+Enter| J[Nova Linha]
    I -->|Enter| K{Validar Mensagem}

    J --> H

    K -->|Vazia| L[Disabled: Botão<br/>Enviar]
    K -->|> 2000 chars| M[Warning: Limite<br/>recomendado]
    K -->|Válida| N[Click: Enviar]

    L --> H
    M --> H

    N --> O[Adicionar Mensagem<br/>do Usuário]
    O --> P{API: SSE Stream<br/>/oracles/ID/chat/stream}

    P --> Q[Mostrar Indicador<br/>Typing...]

    Q --> R[Backend: RAG<br/>Trimodal Retrieval]

    R --> S[1. SQL Query<br/>PostgreSQL]
    R --> T[2. Graph Traversal<br/>NebulaGraph]
    R --> U[3. Vector Search<br/>pgvector]

    S --> V[Combinar Contexto<br/>de 3 Fontes]
    T --> V
    U --> V

    V --> W[LLM: GPT-4 Turbo<br/>+ Contexto RAG]

    W --> X[Stream Tokens<br/>SSE]

    X --> Y{Evento SSE}
    Y -->|type: token| Z[Append Token<br/>à Mensagem]
    Y -->|type: sources| AA[Atualizar Badge<br/>3 fontes]
    Y -->|type: done| AB[Streaming<br/>Completo ✓]
    Y -->|type: error| AC[Mostrar Erro ✗]

    Z --> X
    AA --> X

    AB --> AD[Habilitar Actions:<br/>👍👎📋♻️]
    AC --> AE[Toast: Erro ao<br/>gerar resposta]

    AD --> AF{Próxima Ação}
    AF -->|Nova Pergunta| H
    AF -->|Ver Fontes| AG[Tooltip: Mostrar<br/>3 Fontes RAG]
    AF -->|Copiar| AH[Clipboard API]
    AF -->|Regenerar| AI[Retry Request]
    AF -->|Feedback| AJ[POST /feedback]

    AG --> H
    AH --> H
    AI --> P
    AJ --> H

    style B fill:#e0f2fe
    style AB fill:#dcfce7
    style AD fill:#dcfce7
    style AC fill:#fee2e2
    style AE fill:#fee2e2
```

### Componentes Críticos

#### RAG Trimodal Retrieval
```python
# Backend: RAG Service
async def retrieve_context(oracle_id: str, query: str) -> RAGContext:
    # 1. SQL Query (structured data)
    sql_results = await postgres.execute(f"""
        SELECT * FROM documents
        WHERE oracle_id = '{oracle_id}'
        AND to_tsvector('english', content) @@ plainto_tsquery('{query}')
        LIMIT 5
    """)

    # 2. Graph Traversal (relationships)
    graph_results = await nebula_graph.execute(f"""
        MATCH (o:Oracle {{id: '{oracle_id}'}})-[:CONTAINS]->(d:Document)-[:REFERENCES]->(e:Entity)
        WHERE e.name CONTAINS '{query}'
        RETURN d, e
        LIMIT 5
    """)

    # 3. Vector Search (semantic similarity)
    vector_results = await pgvector.search(
        oracle_id=oracle_id,
        query_embedding=await embed(query),
        top_k=5,
        similarity_threshold=0.7
    )

    # Combine results with score normalization
    return RAGContext(
        sql_results=sql_results,
        graph_results=graph_results,
        vector_results=vector_results,
        combined_score=normalize_scores([sql_results, graph_results, vector_results])
    )
```

#### Streaming Response
```typescript
// Frontend: SSE Hook
const eventSource = new EventSource(
  `/api/v1/oracles/${oracleId}/chat/stream?sessionId=${sessionId}&message=${encodeURIComponent(message)}`
)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)

  if (data.type === 'token') {
    // Append token to message content
    setMessages(prev => prev.map(msg =>
      msg.id === assistantMessageId
        ? { ...msg, content: msg.content + data.content }
        : msg
    ))
  } else if (data.type === 'sources') {
    // Update sources metadata
    setMessages(prev => prev.map(msg =>
      msg.id === assistantMessageId
        ? { ...msg, sources: data.sources }
        : msg
    ))
  } else if (data.type === 'done') {
    // Streaming complete
    eventSource.close()
    setIsStreaming(false)
  }
}
```

### Feedback
- **Streaming**: Token-by-token rendering (typewriter effect)
- **Sources**: Badge "3 fontes" → Tooltip (SQL, Graph, Vector)
- **Actions**: 👍 Like, 👎 Dislike, 📋 Copy, ♻️ Regenerate
- **Error**: Toast vermelho + Retry button

---

## Flow 4: Visualizar Knowledge Graph

```mermaid
graph TD
    A[/oracles/ID - Detalhes] -->|Click: Conhecimento<br/>em Grafo| B[/oracles/ID/graph]

    B --> C[Loading: Buscar<br/>Nodes + Edges]

    C --> D{API: GET<br/>/oracles/ID/graph}
    D -->|200 OK| E[Renderizar React Flow<br/>Graph]
    D -->|404 Not Found| F[Empty State:<br/>Sem Dados]
    D -->|500 Error| G[Error State]

    F --> H[Call-to-Action:<br/>Upload Documentos]
    G --> I[Retry Button]

    H --> J[/oracles/ID/knowledge]
    I --> C

    E --> K[Mostrar Grafo<br/>Interativo]

    K --> L{Interações}
    L -->|Drag Node| M[Reposicionar Nó]
    L -->|Zoom| N[Zoom In/Out<br/>Mouse Wheel]
    L -->|Pan| O[Arrastar Canvas<br/>Mouse Drag]
    L -->|Click Node| P[Sidebar: Detalhes<br/>do Nó]
    L -->|Click Edge| Q[Tooltip: Tipo de<br/>Relação]
    L -->|Search| R[Filtrar Nós por<br/>Nome]

    M --> K
    N --> K
    O --> K

    P --> S[Mostrar:<br/>- ID<br/>- Type<br/>- Properties<br/>- Connections]
    Q --> K
    R --> T[Highlight Nós<br/>Correspondentes]

    S --> U{Actions}
    U -->|Ver Documento| V[/oracles/ID/knowledge<br/>#doc-ID]
    U -->|Expandir| W[Carregar Vizinhos<br/>do Nó]
    U -->|Ocultar| X[Hide Node<br/>Temporariamente]

    W --> Y{API: GET<br/>/graph/node/ID/neighbors}
    Y -->|200 OK| Z[Adicionar Nós<br/>ao Grafo]

    Z --> K

    T --> K
    V --> AA[Scroll para<br/>Documento]
    X --> K

    style B fill:#e0f2fe
    style E fill:#dcfce7
    style K fill:#dcfce7
    style F fill:#fef3c7
    style G fill:#fee2e2
```

### Graph Schema (NebulaGraph)

#### Tags (Nodes)
```cypher
CREATE TAG Oracle (
  id string,
  name string,
  type string,
  domain string
)

CREATE TAG Document (
  id string,
  name string,
  format string,
  size int,
  created_at timestamp
)

CREATE TAG Entity (
  id string,
  name string,
  type string,  # Person, Organization, Location, Date, etc.
  confidence float
)

CREATE TAG Concept (
  id string,
  name string,
  category string,
  tfidf_score float
)
```

#### Edges (Relationships)
```cypher
CREATE EDGE CONTAINS (
  created_at timestamp
)  # Oracle -> Document

CREATE EDGE REFERENCES (
  count int,
  positions list<int>
)  # Document -> Entity

CREATE EDGE RELATED_TO (
  similarity float,
  context string
)  # Entity -> Entity

CREATE EDGE HAS_CONCEPT (
  frequency int
)  # Document -> Concept

CREATE EDGE MENTIONS (
  sentiment string  # positive, negative, neutral
)  # Entity -> Concept
```

### React Flow Configuration
```typescript
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from 'reactflow'

const nodeTypes = {
  oracle: OracleNode,      // Hexagon, gradient background
  document: DocumentNode,  // Rectangle, file icon
  entity: EntityNode,      // Circle, type-based color
  concept: ConceptNode,    // Rounded rectangle, tag icon
}

const edgeTypes = {
  contains: ContainsEdge,    // Solid line, arrow
  references: ReferencesEdge, // Dashed line, arrow
  related_to: RelatedToEdge,  // Dotted line, bidirectional
}

<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  attributionPosition="bottom-left"
>
  <Background />
  <Controls />
  <MiniMap />
</ReactFlow>
```

### Layout Algorithms
- **Initial**: Force-directed layout (d3-force)
- **Hierarchical**: Dagre layout (documents → entities → concepts)
- **Circular**: Circle packing (grouped by type)

### Feedback
- **Loading**: Skeleton graph placeholder
- **Empty**: Call-to-action "Upload documentos"
- **Error**: Retry button + Error message
- **Success**: Interactive graph with smooth animations

---

## Flow 5: Editar Configuração do Oráculo

```mermaid
graph TD
    A[/oracles/ID - Detalhes] -->|Click: Editar| B[/oracles/ID/edit]

    B --> C[Carregar Dados<br/>Atuais]

    C --> D{API: GET<br/>/oracles/ID}
    D -->|200 OK| E[Preencher Form<br/>com Dados]
    D -->|404 Not Found| F[Error: Oráculo<br/>não encontrado]

    F --> G[Redirect:<br/>/oracles]

    E --> H[Formulário<br/>Editável]

    H --> I{Usuário Modifica}
    I -->|Campo Nome| J[Validar Nome<br/>em Tempo Real]
    I -->|Campo Tipo| K[Atualizar Domínio<br/>Sugerido]
    I -->|Configurações| L[Mostrar Preview<br/>das Mudanças]

    J --> M{Nome Válido?}
    M -->|Não| N[Erro: Nome<br/>inválido]
    M -->|Sim| O[✓ Nome OK]

    N --> H
    O --> H
    K --> H
    L --> H

    H --> P{Click: Salvar<br/>Alterações}

    P --> Q{Validar Form}
    Q -->|Erros| R[Mostrar Erros<br/>Inline]
    Q -->|Válido| S{API: PUT<br/>/oracles/ID}

    R --> H

    S -->|200 OK| T[Toast: Oráculo<br/>atualizado ✓]
    S -->|400 Bad Request| U[Erro: Dados<br/>inválidos]
    S -->|409 Conflict| V[Erro: Nome<br/>duplicado]

    U --> H
    V --> H

    T --> W[Redirect:<br/>/oracles/ID]

    W --> X[Mostrar Dados<br/>Atualizados]

    style B fill:#e0f2fe
    style T fill:#dcfce7
    style X fill:#dcfce7
    style F fill:#fee2e2
    style N fill:#fee2e2
    style U fill:#fee2e2
    style V fill:#fee2e2
```

### Campos Editáveis
1. **Nome**: `<Input>` - único, 3-100 chars
2. **Tipo**: `<Select>` - 6 opções
3. **Domínio**: `<Textarea>` - 10-500 chars
4. **Descrição**: `<Textarea>` - max 1000 chars
5. **Configurações Avançadas**:
   - Modelo LLM
   - Temperatura
   - Max Tokens
   - Top-K RAG
   - Modo de Citação (inline, footnotes, none)

### Validações
- Prevenir mudança de `Tipo` se existirem >100 documentos (confirmação necessária)
- Nome único (check via API ao blur do input)
- Configurações: ranges válidos

### Feedback
- **Auto-save draft**: LocalStorage (a cada 30s)
- **Unsaved changes**: Prompt ao tentar sair
- **Success**: Toast verde + Navegação
- **Error**: Alert vermelho inline

---

## Flow 6: Excluir Oráculo (Soft Delete)

```mermaid
graph TD
    A[/oracles - Listagem] -->|Click: ⋮ Menu| B[Dropdown Menu]

    B -->|Click: Excluir| C[Dialog: Confirmar<br/>Exclusão]

    C --> D{Input: Digite CONFIRMAR}
    D -->|Texto incorreto| E[Disabled: Botão<br/>Excluir]
    D -->|CONFIRMAR| F[Enabled: Botão<br/>Excluir]

    E --> C

    F -->|Click: Excluir| G{API: DELETE<br/>/oracles/ID}

    G -->|204 No Content| H[Toast: Oráculo<br/>excluído ✓]
    G -->|400 Bad Request| I[Erro: Oráculo<br/>possui documentos]
    G -->|404 Not Found| J[Erro: Não<br/>encontrado]

    I --> K[Dialog: Excluir<br/>Permanentemente?]
    J --> C

    K --> L{Confirmar?}
    L -->|Cancelar| C
    L -->|Confirmar| M{API: DELETE<br/>/oracles/ID?force=true}

    M -->|204 No Content| N[Background Job:<br/>Delete Cascade]
    M -->|500 Error| O[Erro: Falha ao<br/>excluir]

    N --> P[Excluir:<br/>- Documentos<br/>- Embeddings<br/>- Graph Nodes<br/>- Chat Sessions]

    P --> Q[Toast: Exclusão<br/>completa ✓]

    Q --> R[Remove da Lista]
    H --> R

    R --> S[Atualizar Contador<br/>Total]

    O --> C

    style H fill:#dcfce7
    style Q fill:#dcfce7
    style R fill:#dcfce7
    style I fill:#fef3c7
    style J fill:#fee2e2
    style O fill:#fee2e2
```

### Soft Delete vs Hard Delete
**Soft Delete** (default):
- `deleted_at` timestamp preenchido
- Oráculo oculto da listagem
- Dados preservados por 30 dias
- Recuperável via admin

**Hard Delete** (force=true):
- Exclusão permanente e irreversível
- Cascade delete (Temporal Workflow):
  - Documents
  - Embeddings (pgvector)
  - Graph nodes (NebulaGraph)
  - Chat sessions
  - Upload files (S3/MinIO)
- Temporal Workflow (durable execution) - pode levar minutos
- Progress tracking via Temporal Query (non-blocking)

### Confirmação
```typescript
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Excluir Oráculo?</DialogTitle>
      <DialogDescription>
        Esta ação excluirá permanentemente o oráculo "{oracle.name}"
        e todos os seus dados (documentos, embeddings, sessões de chat).
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Esta ação não pode ser desfeita. Digite <strong>CONFIRMAR</strong> para prosseguir.
        </AlertDescription>
      </Alert>

      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Digite CONFIRMAR"
      />
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button
        variant="destructive"
        disabled={confirmText !== 'CONFIRMAR'}
        onClick={handleDelete}
      >
        Excluir Permanentemente
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Feedback
- **Confirmation**: Dialog com input "CONFIRMAR"
- **Progress**: Background job status via polling
- **Success**: Toast verde + Remoção da lista
- **Error**: Toast vermelho + Retry option

---

## Accessibility (WCAG 2.1 AA) - All Flows

### Keyboard Navigation
- `Tab`: Navigate between interactive elements
- `Enter/Space`: Activate buttons, select options
- `Esc`: Close dialogs, cancel actions
- `↑↓`: Navigate lists, dropdowns
- `Ctrl+S`: Save (edit forms)
- `Ctrl+K`: Focus search

### Screen Reader Announcements
- Page navigation: "Navegou para Listagem de Oráculos"
- Action success: "Oráculo criado com sucesso"
- Errors: "Erro: Nome obrigatório"
- Progress: "Processando documento: 50% concluído"
- Streaming chat: "Assistente está digitando"

### Focus Management
- Trap focus in modals
- Return focus to trigger element when closing
- Highlight focused element with visible ring
- Skip links for keyboard users

### ARIA Labels
```html
<!-- Forms -->
<form aria-label="Criar novo oráculo">
  <Input aria-label="Nome do oráculo" aria-required="true" />
  <Select aria-label="Tipo do oráculo" aria-required="true" />
</form>

<!-- Actions -->
<Button aria-label="Excluir oráculo Financial Core">
  <Trash2 aria-hidden="true" />
</Button>

<!-- Status -->
<div role="status" aria-live="polite">
  Processando documento: 75% concluído
</div>

<!-- Progress -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  75%
</div>
```

---

## Performance Considerations

### Optimizations
- **Lazy Loading**: Load screens on-demand (React.lazy)
- **Pagination**: 10 items per page (oracles list)
- **Virtual Scrolling**: >100 messages (chat)
- **Debounced Search**: 300ms delay
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Separate bundles per route
- **Prefetching**: Next.js Link prefetch

### Metrics Targets
- **Initial Load**: <2s (LCP)
- **Time to Interactive**: <3s (TTI)
- **First Input Delay**: <100ms (FID)
- **Cumulative Layout Shift**: <0.1 (CLS)

---

**Status**: ✅ Complete - All 7 primary user flows defined
**Last Updated**: 2025-12-28
**Flows**:
- Flow 0: Criar Nova Solução (Foundation Layer) - NEW
- Flow 1: Criar e Configurar Novo Oráculo
- Flow 2: Upload e Processamento de Documentos
- Flow 3: Conversa com IA Assistant (RAG Trimodal)
- Flow 4: Visualizar Knowledge Graph
- Flow 5: Editar Configuração do Oráculo
- Flow 6: Excluir Oráculo (Soft Delete)

**Next Steps**: Implement flows in Sprint 5 (Frontend)

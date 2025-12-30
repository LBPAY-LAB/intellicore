# 🕸️ Mockup 06: `/oracles/{id}/graph` - Knowledge Graph

**Versão**: 1.0.0
**Data**: 2025-12-28
**Sprint**: Sprint 1 - Fundação (Epic 1.2)
**Prioridade**: High
**Story Points**: 3 SP
**Estimativa**: 3h

---

## 📋 Overview

Visualização interativa do Knowledge Graph do Oráculo usando NebulaGraph + React Flow. Mostra relações entre entidades extraídas dos documentos, permite exploração visual, e oferece análise de centralidade e clusters.

### Requisitos Relacionados
- **RF011**: NebulaGraph para Knowledge Graph
- **RF012**: Visualização de Relações entre Entidades
- **RF013**: Análise de Centralidade e Clustering
- **RF016**: Graph Analytics (PageRank, Louvain, Betweenness)

### User Story
> **Como** administrador do sistema
> **Quero** visualizar o Knowledge Graph de um Oráculo
> **Para que** eu possa entender as relações entre entidades e identificar clusters de conhecimento

---

## 🎨 Layout Visual (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ [← Voltar] Knowledge Graph                     [?] [User ▾]     │   │
│ └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Breadcrumb                                                              │
│ Home > Oráculos > Oráculo de Compliance > Knowledge Graph              │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Title & Controls Bar                                             │   │
│ │                                                                  │   │
│ │ 📊 Oráculo de Compliance - Knowledge Graph                      │   │
│ │                                                                  │   │
│ │ 1,284 nós • 3,521 arestas                                       │   │
│ │                                                                  │   │
│ │ [🔍 Buscar nó]  [Layout: Force ▾]  [Filtros ▾]  [Exportar ▾]   │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────┐  ┌──────────────────────────────────────┐   │
│ │ Left Sidebar (20%)    │  │ Graph Canvas (60%)                   │   │
│ │                       │  │                                      │   │
│ │ ╔════════════════════╗│  │ ╔═══════════════════════════════════╗│   │
│ │ ║ Legenda de Nós     ║│  │ ║                                   ║│   │
│ │ ╚════════════════════╝│  │ ║    ●─────●       ●────●           ║│   │
│ │                       │  │ ║    │     │      /│\   │           ║│   │
│ │ 🟢 Regulação (342)    │  │ ║    ●     │     ● │ ● ●           ║│   │
│ │ 🔵 Instituição (128)  │  │ ║    │\    │    /  │/  │           ║│   │
│ │ 🟡 Transação (456)    │  │ ║    │ ●───●───●   ●───●           ║│   │
│ │ 🟣 Pessoa (234)       │  │ ║    │/    │    \  │\  │           ║│   │
│ │ 🔴 Risco (87)         │  │ ║    ●     │     ● │ ● ●           ║│   │
│ │ ⚪ Documento (37)     │  │ ║         /       \│/               ║│   │
│ │                       │  │ ║        ●─────────●                ║│   │
│ │ ╔════════════════════╗│  │ ║                                   ║│   │
│ │ ║ Legenda de Arestas ║│  │ ╚═══════════════════════════════════╝│   │
│ │ ╚════════════════════╝│  │                                      │   │
│ │                       │  │ Controls:                            │   │
│ │ ──── Regula (1,234)   │  │ [−] [Reset] [+]  [📸 Screenshot]    │   │
│ │ ---- Envolve (987)    │  │                                      │   │
│ │ ···· Relaciona (876)  │  │ Minimap:                             │   │
│ │ ━━━━ Pertence (424)   │  │ ┌──────────────────┐                 │   │
│ │                       │  │ │ ●   ● ●    ●     │                 │   │
│ │ ╔════════════════════╗│  │ │   ● ● ● ●   ●   │                 │   │
│ │ ║ Métricas           ║│  │ │ ●   ● ●    ●     │                 │   │
│ │ ╚════════════════════╝│  │ └──────────────────┘                 │   │
│ │                       │  │ [x] Mostrar Labels                   │   │
│ │ Densidade: 0.67       │  │ [x] Agrupar Clusters                 │   │
│ │ Avg. Degree: 2.74     │  │                                      │   │
│ │ Clusters: 12          │  └──────────────────────────────────────┘   │
│ │ Maior Cluster: 342    │                                             │
│ │ Diâmetro: 8           │  Right Sidebar (20%)                        │
│ │                       │  ┌──────────────────────────────────────┐   │
│ │ ╔════════════════════╗│  │ ╔═══════════════════════════════════╗│   │
│ │ ║ Análises           ║│  │ ║ Nó Selecionado                    ║│   │
│ │ ╚════════════════════╝│  │ ╚═══════════════════════════════════╝│   │
│ │                       │  │                                      │   │
│ │ [▶ PageRank]          │  │ 🟢 Resolução CMN 4.557/2017          │   │
│ │ [▶ Louvain]           │  │                                      │   │
│ │ [▶ Betweenness]       │  │ Tipo: Regulação                      │   │
│ │ [▶ Centrality]        │  │ ID: reg-001                          │   │
│ │                       │  │                                      │   │
│ │ ╔════════════════════╗│  │ ────────────────────────────────     │   │
│ │ ║ Filtros Ativos     ║│  │                                      │   │
│ │ ╚════════════════════╝│  │ Grau: 47 conexões                    │   │
│ │                       │  │ • 32 saintes                         │   │
│ │ ☑ Tipo: Regulação     │  │ • 15 entrantes                       │   │
│ │ ☐ Tipo: Instituição   │  │                                      │   │
│ │ ☐ Tipo: Transação     │  │ PageRank: 0.0234 (Top 5%)            │   │
│ │                       │  │ Betweenness: 0.156 (Top 10%)         │   │
│ │ ☑ Mín. Conexões: 10   │  │ Cluster: 3                           │   │
│ │                       │  │                                      │   │
│ │ [Limpar Filtros]      │  │ ────────────────────────────────     │   │
│ │                       │  │                                      │   │
│ └───────────────────────┘  │ Conexões (47):                       │   │
│                             │                                      │   │
│                             │ • 🔵 Banco Central (regula)          │   │
│                             │ • 🔵 Itaú (aplica)                   │   │
│                             │ • 🔵 Bradesco (aplica)               │   │
│                             │ • 🟡 Transação X (menciona)          │   │
│                             │ • 🟡 Transação Y (menciona)          │   │
│                             │ ... (42 mais)                        │   │
│                             │                                      │   │
│                             │ [Ver Todas]                          │   │
│                             │                                      │   │
│                             │ ────────────────────────────────     │   │
│                             │                                      │   │
│                             │ Origem:                              │   │
│                             │ 📄 relatorio-bacen-2024.pdf (p. 12)  │   │
│                             │ 📄 normativa-cmn.docx (p. 3)         │   │
│                             │                                      │   │
│                             │ [Ver Documentos Fonte]               │   │
│                             │                                      │   │
│                             └──────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes da Interface

### 1. Graph Canvas (React Flow)

**Componente**: `reactflow`

```typescript
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface GraphNode extends Node {
  data: {
    label: string
    type: 'regulation' | 'institution' | 'transaction' | 'person' | 'risk' | 'document'
    pageRank?: number
    betweenness?: number
    cluster?: number
    connections: number
    sourceDocuments: string[]
  }
}

const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([])
const [edges, setEdges, onEdgesChange] = useEdgesState([])
const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

useEffect(() => {
  // Fetch graph data from API
  const fetchGraphData = async () => {
    const response = await fetch(`/api/v1/oracles/${oracleId}/graph`)
    const data = await response.json()

    const formattedNodes = data.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        label: node.name,
        type: node.type,
        pageRank: node.metrics.pageRank,
        betweenness: node.metrics.betweenness,
        cluster: node.metrics.cluster,
        connections: node.degree,
        sourceDocuments: node.sourceDocuments,
      },
      style: {
        background: getNodeColor(node.type),
        border: `2px solid ${getNodeBorderColor(node.type)}`,
        borderRadius: '50%',
        width: getNodeSize(node.degree),
        height: getNodeSize(node.degree),
      },
    }))

    const formattedEdges = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relationshipType,
      type: getEdgeType(edge.relationshipType),
      animated: edge.strength > 0.8,
      style: {
        stroke: getEdgeColor(edge.relationshipType),
        strokeWidth: getEdgeWidth(edge.strength),
      },
    }))

    setNodes(formattedNodes)
    setEdges(formattedEdges)
  }

  fetchGraphData()
}, [oracleId])

<div className="h-[calc(100vh-200px)]">
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onNodeClick={(event, node) => setSelectedNode(node as GraphNode)}
    fitView
    attributionPosition="bottom-left"
  >
    <Background />

    <Controls
      position="bottom-right"
      showInteractive={false}
    />

    <MiniMap
      nodeColor={(node) => getNodeColor(node.data.type)}
      position="bottom-right"
      style={{
        marginBottom: 80,
      }}
    />

    <Panel position="top-right" className="space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => setShowLabels(e.target.checked)}
        />
        Mostrar Labels
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={clusterNodes}
          onChange={(e) => setClusterNodes(e.target.checked)}
        />
        Agrupar Clusters
      </label>
      <Button
        variant="outline"
        size="sm"
        onClick={handleScreenshot}
      >
        <Camera className="h-4 w-4 mr-2" />
        Screenshot
      </Button>
    </Panel>
  </ReactFlow>
</div>
```

**Node Colors** (based on type):
```typescript
const getNodeColor = (type: string) => {
  switch (type) {
    case 'regulation': return '#22c55e' // Green
    case 'institution': return '#3b82f6' // Blue
    case 'transaction': return '#eab308' // Yellow
    case 'person': return '#a855f7' // Purple
    case 'risk': return '#ef4444' // Red
    case 'document': return '#6b7280' // Gray
    default: return '#9ca3af'
  }
}
```

**Node Size** (based on degree centrality):
```typescript
const getNodeSize = (degree: number) => {
  // Min 20px, Max 60px
  return Math.min(20 + degree * 2, 60)
}
```

**Edge Styles** (based on relationship type):
```typescript
const getEdgeType = (relationshipType: string) => {
  switch (relationshipType) {
    case 'regulates': return 'straight' // Solid line
    case 'involves': return 'smoothstep' // Dashed line
    case 'relates': return 'step' // Dotted line
    case 'belongs_to': return 'default' // Bold line
    default: return 'default'
  }
}
```

---

### 2. Left Sidebar - Legenda e Métricas

**Componente**: shadcn/ui `<Card>`

```typescript
<Card>
  <CardHeader>
    <CardTitle>Legenda de Nós</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    {NODE_TYPES.map((nodeType) => (
      <div key={nodeType.type} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: getNodeColor(nodeType.type) }}
          />
          <span className="text-sm">{nodeType.label}</span>
        </div>
        <span className="text-sm text-neutral-500">
          ({nodeType.count.toLocaleString('pt-BR')})
        </span>
      </div>
    ))}
  </CardContent>
</Card>

<Card className="mt-4">
  <CardHeader>
    <CardTitle>Legenda de Arestas</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    {EDGE_TYPES.map((edgeType) => (
      <div key={edgeType.type} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-px w-8"
            style={{
              borderTop: getEdgeBorder(edgeType.type),
              borderColor: getEdgeColor(edgeType.type),
            }}
          />
          <span className="text-sm">{edgeType.label}</span>
        </div>
        <span className="text-sm text-neutral-500">
          ({edgeType.count.toLocaleString('pt-BR')})
        </span>
      </div>
    ))}
  </CardContent>
</Card>

<Card className="mt-4">
  <CardHeader>
    <CardTitle>Métricas do Grafo</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3 text-sm">
    <div className="flex justify-between">
      <span className="text-neutral-600">Densidade:</span>
      <span className="font-medium">{metrics.density.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">Grau Médio:</span>
      <span className="font-medium">{metrics.avgDegree.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">Clusters:</span>
      <span className="font-medium">{metrics.clusterCount}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">Maior Cluster:</span>
      <span className="font-medium">{metrics.largestCluster}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">Diâmetro:</span>
      <span className="font-medium">{metrics.diameter}</span>
    </div>
  </CardContent>
</Card>
```

---

### 3. Left Sidebar - Análises e Filtros

**Componente**: shadcn/ui `<Button>` + `<Checkbox>`

```typescript
<Card className="mt-4">
  <CardHeader>
    <CardTitle>Análises</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => runAnalysis('pagerank')}
      disabled={isRunningAnalysis}
    >
      {isRunningAnalysis && analysisType === 'pagerank' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      PageRank
    </Button>
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => runAnalysis('louvain')}
      disabled={isRunningAnalysis}
    >
      {isRunningAnalysis && analysisType === 'louvain' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      Louvain (Clustering)
    </Button>
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => runAnalysis('betweenness')}
      disabled={isRunningAnalysis}
    >
      {isRunningAnalysis && analysisType === 'betweenness' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      Betweenness Centrality
    </Button>
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => runAnalysis('centrality')}
      disabled={isRunningAnalysis}
    >
      {isRunningAnalysis && analysisType === 'centrality' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      Degree Centrality
    </Button>
  </CardContent>
</Card>

<Card className="mt-4">
  <CardHeader>
    <CardTitle>Filtros Ativos</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {NODE_TYPES.map((nodeType) => (
      <label key={nodeType.type} className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={activeFilters.types.includes(nodeType.type)}
          onCheckedChange={(checked) => toggleTypeFilter(nodeType.type, checked)}
        />
        Tipo: {nodeType.label}
      </label>
    ))}

    <Separator className="my-3" />

    <div className="space-y-2">
      <Label htmlFor="min-connections">Mínimo de Conexões</Label>
      <Slider
        id="min-connections"
        min={0}
        max={100}
        step={5}
        value={[activeFilters.minConnections]}
        onValueChange={(value) => setMinConnectionsFilter(value[0])}
      />
      <p className="text-xs text-neutral-500">
        Mínimo: {activeFilters.minConnections} conexões
      </p>
    </div>

    <Button
      variant="ghost"
      className="w-full mt-4"
      onClick={clearFilters}
      disabled={!hasActiveFilters}
    >
      Limpar Filtros
    </Button>
  </CardContent>
</Card>
```

---

### 4. Right Sidebar - Detalhes do Nó

**Componente**: shadcn/ui `<Card>` com detalhes dinâmicos

```typescript
{selectedNode ? (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ background: getNodeColor(selectedNode.data.type) }}
        />
        {selectedNode.data.label}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label className="text-sm text-neutral-500">Tipo</Label>
        <p className="font-medium capitalize">{selectedNode.data.type}</p>
      </div>

      <div>
        <Label className="text-sm text-neutral-500">ID</Label>
        <p className="font-mono text-sm">{selectedNode.id}</p>
      </div>

      <Separator />

      <div>
        <Label className="text-sm text-neutral-500 mb-2 block">Grau</Label>
        <p className="text-lg font-bold">
          {selectedNode.data.connections} conexões
        </p>
        <div className="text-sm text-neutral-600 mt-1 space-y-1">
          <p>• {getOutDegree(selectedNode.id)} saintes</p>
          <p>• {getInDegree(selectedNode.id)} entrantes</p>
        </div>
      </div>

      {selectedNode.data.pageRank && (
        <div>
          <Label className="text-sm text-neutral-500">PageRank</Label>
          <p className="font-medium">
            {selectedNode.data.pageRank.toFixed(4)}{' '}
            <span className="text-xs text-neutral-500">
              (Top {getPercentile(selectedNode.data.pageRank, 'pageRank')}%)
            </span>
          </p>
        </div>
      )}

      {selectedNode.data.betweenness && (
        <div>
          <Label className="text-sm text-neutral-500">Betweenness Centrality</Label>
          <p className="font-medium">
            {selectedNode.data.betweenness.toFixed(3)}{' '}
            <span className="text-xs text-neutral-500">
              (Top {getPercentile(selectedNode.data.betweenness, 'betweenness')}%)
            </span>
          </p>
        </div>
      )}

      {selectedNode.data.cluster !== undefined && (
        <div>
          <Label className="text-sm text-neutral-500">Cluster</Label>
          <Badge variant="outline">{selectedNode.data.cluster}</Badge>
        </div>
      )}

      <Separator />

      <div>
        <Label className="text-sm text-neutral-500 mb-2 block">
          Conexões ({selectedNode.data.connections})
        </Label>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {getNodeConnections(selectedNode.id)
            .slice(0, 5)
            .map((connection) => (
              <div
                key={connection.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-neutral-50 cursor-pointer text-sm"
                onClick={() => focusNode(connection.id)}
              >
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: getNodeColor(connection.type) }}
                />
                <span className="flex-1 truncate">{connection.label}</span>
                <span className="text-xs text-neutral-500">
                  ({connection.relationshipType})
                </span>
              </div>
            ))}
        </div>
        {selectedNode.data.connections > 5 && (
          <Button
            variant="link"
            size="sm"
            className="w-full mt-2"
            onClick={() => showAllConnections(selectedNode.id)}
          >
            Ver Todas ({selectedNode.data.connections})
          </Button>
        )}
      </div>

      <Separator />

      <div>
        <Label className="text-sm text-neutral-500 mb-2 block">Origem</Label>
        <div className="space-y-1">
          {selectedNode.data.sourceDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 text-sm p-2 rounded hover:bg-neutral-50 cursor-pointer"
              onClick={() => viewDocument(doc.id)}
            >
              <FileText className="h-3 w-3 text-neutral-400" />
              <span className="flex-1 truncate">{doc.name}</span>
              {doc.page && (
                <span className="text-xs text-neutral-500">(p. {doc.page})</span>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => viewAllSourceDocuments(selectedNode.id)}
        >
          Ver Documentos Fonte
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
  <Card>
    <CardContent className="p-12 text-center text-neutral-500">
      <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="text-sm">Selecione um nó para ver detalhes</p>
    </CardContent>
  </Card>
)}
```

---

## 🔄 Interações e Comportamentos

### 1. Layout Algorithms

**Componente**: shadcn/ui `<Select>`

```typescript
const LAYOUTS = [
  { value: 'force', label: 'Force-Directed (d3-force)' },
  { value: 'hierarchical', label: 'Hierarchical (dagre)' },
  { value: 'circular', label: 'Circular' },
  { value: 'grid', label: 'Grid' },
  { value: 'concentric', label: 'Concentric' },
]

const applyLayout = (layoutType: string) => {
  switch (layoutType) {
    case 'force':
      // d3-force simulation
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))

      simulation.on('tick', () => {
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            position: { x: node.fx, y: node.fy },
          }))
        )
      })
      break

    case 'hierarchical':
      // dagre layout
      const g = new dagre.graphlib.Graph()
      g.setGraph({ rankdir: 'TB' })
      g.setDefaultEdgeLabel(() => ({}))

      nodes.forEach((node) => {
        g.setNode(node.id, { width: 60, height: 60 })
      })

      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target)
      })

      dagre.layout(g)

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          position: g.node(node.id),
        }))
      )
      break

    // ... other layouts
  }
}
```

---

### 2. Run Graph Analysis

```typescript
const runAnalysis = async (analysisType: string) => {
  setIsRunningAnalysis(true)
  setAnalysisType(analysisType)

  try {
    const response = await fetch(`/api/v1/oracles/${oracleId}/graph/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_type: analysisType }),
    })

    if (!response.ok) throw new Error('Analysis failed')

    const results = await response.json()

    // Update nodes with analysis results
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          [analysisType]: results.nodes[node.id],
        },
      }))
    )

    toast({
      title: `Análise ${ANALYSIS_LABELS[analysisType]} concluída`,
      description: `${results.computation_time}ms`,
    })

  } catch (error) {
    toast({
      title: 'Erro na análise',
      variant: 'destructive',
    })
  } finally {
    setIsRunningAnalysis(false)
  }
}
```

**Backend** (NebulaGraph):
```python
# PageRank
MATCH (v)
RETURN id(v) AS node_id, pagerank(v) AS score
ORDER BY score DESC
LIMIT 100

# Louvain Clustering
MATCH (v)
RETURN id(v) AS node_id, louvain(v) AS cluster

# Betweenness Centrality
MATCH (v)
RETURN id(v) AS node_id, betweenness(v) AS score
```

---

### 3. Filter Nodes

```typescript
const applyFilters = () => {
  let filtered = originalNodes

  // Filter by type
  if (activeFilters.types.length > 0) {
    filtered = filtered.filter((node) =>
      activeFilters.types.includes(node.data.type)
    )
  }

  // Filter by minimum connections
  if (activeFilters.minConnections > 0) {
    filtered = filtered.filter(
      (node) => node.data.connections >= activeFilters.minConnections
    )
  }

  setNodes(filtered)
}

useEffect(() => {
  applyFilters()
}, [activeFilters])
```

---

### 4. Search Node

```typescript
const [searchQuery, setSearchQuery] = useState('')

const handleSearch = (query: string) => {
  setSearchQuery(query)

  if (!query) {
    setNodes(originalNodes)
    return
  }

  const matchingNodes = originalNodes.filter((node) =>
    node.data.label.toLowerCase().includes(query.toLowerCase())
  )

  if (matchingNodes.length > 0) {
    // Focus on first matching node
    focusNode(matchingNodes[0].id)
  }

  // Highlight matching nodes
  setNodes((nds) =>
    nds.map((node) => ({
      ...node,
      style: {
        ...node.style,
        opacity: matchingNodes.includes(node) ? 1 : 0.3,
      },
    }))
  )
}
```

---

### 5. Export Graph

```typescript
const handleExport = async (format: 'png' | 'svg' | 'json') => {
  switch (format) {
    case 'png':
      const element = document.querySelector('.react-flow')
      const canvas = await html2canvas(element)
      const dataUrl = canvas.toDataURL('image/png')
      downloadFile(dataUrl, `knowledge-graph-${oracleId}.png`)
      break

    case 'svg':
      const svgElement = document.querySelector('.react-flow svg')
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
      downloadFile(URL.createObjectURL(svgBlob), `knowledge-graph-${oracleId}.svg`)
      break

    case 'json':
      const graphData = { nodes, edges }
      const jsonBlob = new Blob([JSON.stringify(graphData, null, 2)], {
        type: 'application/json',
      })
      downloadFile(URL.createObjectURL(jsonBlob), `knowledge-graph-${oracleId}.json`)
      break
  }
}
```

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- Navegação por teclado: Tab, Enter, Esc
- Zoom in/out: Ctrl/Cmd + Mouse Wheel
- Focus visible em nós selecionados
- Contrast ratio 4.5:1 em todos os textos
- `aria-label` em controles do grafo
- Screen reader: Anuncia nós e relações ao selecionar

---

## 📱 Responsividade

### Desktop (≥1024px)
- 3 colunas (20% sidebar + 60% canvas + 20% sidebar)
- Graph canvas: Full height

### Tablet (768px - 1023px)
- 2 colunas (30% sidebar + 70% canvas)
- Right sidebar colapsado (toggle)

### Mobile (<768px)
- 1 coluna (stacked)
- Sidebars colapsados (tabs)
- Graph canvas: Touch gestures

---

## 🧪 Casos de Teste

1. **Load Graph**: 1,284 nós + 3,521 arestas carregam em <3s
2. **Node Click**: Selecionar nó, sidebar direita mostra detalhes
3. **Layout Change**: Trocar de Force para Hierarchical, nós reorganizam
4. **Run PageRank**: Análise completa em <2s, nós atualizam com scores
5. **Filter by Type**: Filtrar "Regulação", apenas nós verdes visíveis
6. **Search Node**: Buscar "BACEN", nó focado e destacado
7. **Export PNG**: Screenshot gerado e download iniciado
8. **Zoom**: Zoom in/out funciona com mouse wheel e controles
9. **Cluster View**: Ativar "Agrupar Clusters", nós agrupam visualmente
10. **Connection Navigation**: Clicar em conexão no sidebar, foca nó relacionado

---

**Status**: ✅ Complete
**Última Atualização**: 2025-12-28
**Total de Mockups**: 7/7 (100%)

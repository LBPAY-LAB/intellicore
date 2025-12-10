# Plano de Implementação Técnica: Interface Neural Sutil

## 1. Visão Geral e Objetivos

Este documento detalha o roteiro técnico para construir a **Interface Neural Sutil**, uma UX orientada a grafos que substitui menus hierárquicos por navegação contextual. O objetivo é criar uma aplicação frontend performática, responsiva e esteticamente minimalista.

---

## 2. Stack Tecnológica Frontend

A escolha das tecnologias prioriza performance de renderização (Canvas/SVG) e fluidez de animações.

| Componente | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | SSR para carregamento inicial rápido e estrutura robusta. |
| **Visualização de Grafo** | **React Flow** (ou **TanStack Query** + **D3.js**) | React Flow é a escolha primária pela facilidade de customização de nós e arestas interativas. |
| **Gerenciamento de Estado** | **Zustand** | Leve, sem boilerplate, ideal para gerenciar o estado complexo do grafo (posições, seleção). |
| **Estilização** | **Tailwind CSS** | Utilitários para design system consistente e tema escuro/claro. |
| **Animações** | **Framer Motion** | Transições fluidas de UI (ex: painéis laterais, modais de ação). |
| **Ícones** | **Lucide React** | Ícones vetoriais leves e consistentes. |

---

## 3. Arquitetura de Componentes

A interface será composta por camadas sobrepostas (Z-Index layers).

### 3.1. Camada 0: O Canvas Infinito (`<NeuralCanvas />`)
*   **Responsabilidade**: Renderizar o grafo, gerenciar pan/zoom e eventos de fundo.
*   **Implementação**: Wrapper em torno do componente `ReactFlow`.
*   **Configuração**:
    *   `minZoom`: 0.1 (Visão Macro).
    *   `maxZoom`: 2.0 (Visão Micro).
    *   `nodesDraggable`: `false` (Layout automático) ou `true` (com física).

### 3.2. Camada 1: Nós Semânticos (`<SemanticNode />`)
*   **Tipos de Nós**:
    *   `EntityNode`: Pessoas, Empresas (Círculo com Avatar/Ícone).
    *   `AccountNode`: Contas, Carteiras (Retângulo arredondado com saldo).
    *   `TransactionNode`: Eventos financeiros (Pequenos pontos ou losangos).
*   **Estados Visuais**:
    *   *Idle*: Opacidade normal.
    *   *Hover*: Brilho sutil (Halo).
    *   *Selected*: Destaque total, centralizado.
    *   *Dimmed*: Quando outro nó está em foco.

### 3.3. Camada 2: Arestas Inteligentes (`<SmartEdge />`)
*   **Visual**: Linhas finas, curvas de Bezier suaves.
*   **Interatividade**:
    *   *Hover*: Mostra o tipo de relação (ex: "Titular de").
    *   *Click*: Abre detalhes da relação.
    *   *Drag-and-Connect*: Permite criar novas relações (ex: Transferência).

### 3.4. Camada 3: Interface Flutuante (`<HUD />`)
*   **Barra de Busca Global**: "Spotlight" style (Cmd+K) para encontrar qualquer nó e centralizá-lo.
*   **Context Panel**: Painel lateral que desliza suavemente para mostrar detalhes do nó selecionado (JSON, tabelas).
*   **Action Island**: Menu contextual flutuante próximo ao nó selecionado.

---

## 4. Estratégia de Dados e Estado

### 4.1. Fetching de Dados (Graph-First)
O frontend não carrega todo o banco de dados. Ele usa uma estratégia de **Carregamento Progressivo (Lazy Loading)** baseada no nó central.

1.  **Estado Inicial**: Usuário busca "Maria Silva".
2.  **API Call**: `GET /api/graph/context?center=MariaUUID&depth=1`
3.  **Resposta**: Dados de Maria + Nós diretamente conectados (Contas, Família).
4.  **Expansão**: Usuário clica em "Conta Corrente".
5.  **API Call**: `GET /api/graph/context?center=ContaUUID&depth=1`
6.  **Merge**: Novos nós são adicionados ao grafo existente no Zustand.

### 4.2. Store (Zustand)
```typescript
interface GraphState {
  nodes: Node[];
  edges: Edge[];
  centerNodeId: string | null;
  setCenterNode: (id: string) => void;
  addNodes: (newNodes: Node[]) => void;
  // ...
}
```

---

## 5. Fases de Implementação

### Fase 1: O Esqueleto (Semana 1-2)
*   Setup do projeto Next.js + Tailwind.
*   Configuração básica do React Flow.
*   Criação de nós estáticos (Mock Data).
*   Implementação de Pan e Zoom.

### Fase 2: Conexão com a Realidade (Semana 3-4)
*   Integração com API (Go/NebulaGraph).
*   Implementação do algoritmo de layout automático (Dagre ou Force-Directed) para organizar os nós ao carregar.
*   Navegação: Clicar em um nó o centraliza e carrega vizinhos.

### Fase 3: Interatividade Avançada (Semana 5-6)
*   **Smart Edges**: Implementar a lógica de arrastar linha entre nós para iniciar ação.
*   **Action Island**: Menu contextual ao clicar na aresta ou nó.
*   **Zoom Semântico**: Alterar o nível de detalhe dos nós baseado no nível de zoom (LOD - Level of Detail).

### Fase 4: Polimento e "Juice" (Semana 7-8)
*   Animações de entrada (Motion).
*   Efeitos de brilho (Glow) e partículas para transações.
*   Modo Escuro/Claro perfeito.
*   Otimização de performance (Web Workers para layout se necessário).

---

## 6. Desafios Técnicos e Soluções

*   **Desafio**: Grafo muito denso (muitas conexões).
    *   *Solução*: "Clustering". Agrupar nós distantes em um único nó "Mais..." e expandir apenas sob demanda.
*   **Desafio**: Performance de renderização.
    *   *Solução*: Usar `React.memo` nos componentes de nó e aresta; virtualização se o grafo crescer muito (embora a ideia seja manter o contexto local).

Este plano garante que a "Interface Neural Sutil" não seja apenas um conceito bonito, mas uma ferramenta funcional e escalável.

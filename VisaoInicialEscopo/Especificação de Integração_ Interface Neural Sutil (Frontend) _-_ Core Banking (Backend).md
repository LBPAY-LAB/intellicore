# Especificação de Integração: Interface Neural Sutil (Frontend) <-> Core Banking (Backend)

## 1. Visão Geral da Comunicação

A comunicação entre a Interface Neural Sutil (Next.js) e o Core Banking (Go) é projetada para ser **orientada a grafos** e **assíncrona**.

*   **Protocolo Primário**: REST/JSON para queries de grafo e comandos simples.
*   **Protocolo Secundário**: Server-Sent Events (SSE) ou WebSocket para atualizações de estado em tempo real (ex: transação completada, novo nó detectado).
*   **Autenticação**: JWT (JSON Web Token) via Keycloak, passado no header `Authorization: Bearer <token>`.

---

## 2. Endpoints da API de Grafo (Graph API)

O backend expõe uma API especializada em servir fragmentos do grafo de conhecimento (NebulaGraph + Postgres).

### 2.1. Contexto do Grafo (`GET /api/graph/context`)
Recupera o nó central e seus vizinhos imediatos.

*   **Request**:
    ```http
    GET /api/graph/context?centerId=uuid-1234&depth=1&filter=active
    ```
*   **Response**:
    ```json
    {
      "center": {
        "id": "uuid-1234",
        "type": "Person",
        "label": "Maria Silva",
        "data": { "cpf": "...", "status": "active" },
        "metadata": { "risk_score": 0.1 }
      },
      "nodes": [
        { "id": "uuid-5678", "type": "Account", "label": "Conta Corrente", "data": { "balance": 5000 } }
      ],
      "edges": [
        { "source": "uuid-1234", "target": "uuid-5678", "label": "OWNER_OF", "type": "ownership" }
      ]
    }
    ```

### 2.2. Busca Semântica (`POST /api/graph/search`)
Usa PgVector para encontrar nós baseados em intenção ou similaridade.

*   **Request**:
    ```json
    { "query": "Clientes de alto risco em São Paulo" }
    ```
*   **Response**: Lista de nós que correspondem à busca semântica.

---

## 3. Fluxos de Dados Críticos

### 3.1. Fluxo de Navegação (Drill-Down)
1.  **Frontend**: Usuário clica no nó "Conta Corrente".
2.  **Frontend**: Dispara `GET /api/graph/context?centerId=ContaUUID`.
3.  **Backend**:
    *   Consulta NebulaGraph para vizinhos (Transações, Cartões).
    *   Consulta TigerBeetle para saldo atualizado.
    *   Agrega dados e retorna JSON.
4.  **Frontend**: React Flow recebe novos nós, calcula layout incremental e anima a transição.

### 3.2. Fluxo de Ação (Smart Edge Transaction)
1.  **Frontend**: Usuário arrasta aresta de "Conta Maria" para "Conta João".
2.  **Frontend**: Abre modal contextual "Transferir Valor".
3.  **Frontend**: `POST /api/transactions/initiate`
    ```json
    { "from": "ContaMariaUUID", "to": "ContaJoãoUUID", "amount": 100 }
    ```
4.  **Backend (Transaction Agent)**:
    *   Valida saldo e limites.
    *   Consulta Data Rudder (Risco).
    *   Retorna `transaction_id` e status `PENDING`.
5.  **Frontend**: Exibe aresta pulsante "Processando...".
6.  **Backend (SSE)**: Envia evento `transaction_completed`.
7.  **Frontend**: Aresta se solidifica e cor muda para verde.

---

## 4. Tratamento de Erros e Latência

*   **Optimistic UI**: O frontend desenha a aresta imediatamente ao arrastar, revertendo se o backend rejeitar.
*   **Skeleton Nodes**: Enquanto carrega vizinhos, exibe nós "fantasmas" pulsantes para indicar carregamento.
*   **Error Boundaries**: Se um nó falhar ao carregar, ele exibe um estado de erro visual (vermelho) sem quebrar o resto do grafo.

Esta especificação garante que a experiência fluida da Interface Neural seja suportada por uma arquitetura de dados robusta e eficiente.

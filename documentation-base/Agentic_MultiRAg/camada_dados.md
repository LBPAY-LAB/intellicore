# Documento 2: A Camada de Dados (A Memória de Longo Prazo)
**Versão:** 4.0
**Foco:** Explorar a "Memória de Longo Prazo" do sistema, aprofundando o papel do Postgres, PGVector e NebulaGraph como os três pilares do conhecimento da organização.

## 1. Visão Geral e Analogia

A Camada de Dados é a fundação sobre a qual todo o conhecimento do sistema é construído. É a "biblioteca" da nossa agência de consultoria. No entanto, não é uma biblioteca com um único tipo de livro, mas sim uma biblioteca moderna com três secções distintas e especializadas:

1.  **O Arquivo Factual (Postgres):** A secção de referência, com factos precisos, números e registos imutáveis.
2.  **O Índice de Conceitos (PGVector):** A secção de pesquisa semântica, que permite encontrar livros não pelo título, mas pelo seu tema ou por ideias similares.
3.  **O Mapa de Conexões (NebulaGraph):** A secção de genealogia e redes, que mostra como cada autor, livro e conceito está relacionado com todos os outros.

Um sistema de IA de ponta precisa de todos os três para responder a perguntas complexas, pois as perguntas raramente se encaixam num único tipo de armazenamento de dados.

## 2. Componente 1: O Arquivo Factual (PostgreSQL)

### 2.1. Função

O PostgreSQL serve como a **fonte única da verdade** para todos os dados estruturados e transacionais do Core Banking. É o sistema de registo (System of Record - SoR) que garante a integridade, consistência e durabilidade dos dados financeiros.

### 2.2. Dados Armazenados

*   **Dados de Clientes:** Perfis, informações de contacto, segmentos, etc.
*   **Contas Bancárias:** Saldos, tipos de conta, limites.
*   **Transações:** O registo imutável de todas as transações financeiras, com carimbos de data/hora, valores, partes envolvidas.
*   **Produtos Financeiros:** Definições, taxas de juros, condições.
*   **Logs de Auditoria:** Registos de acesso e modificação de dados.

### 2.3. Papel na Arquitetura

*   **Fonte para Pipelines de Ingestão:** É a principal fonte de dados para os pipelines da Camada 7, que leem do Postgres para alimentar o PGVector e o NebulaGraph.
*   **Fonte para Consultas Diretas:** É a base de dados consultada pela Camada 5 (Roteamento Inteligente) para as "rotas de bypass", respondendo a perguntas factuais como "Qual o saldo da conta X?".
*   **Fonte de Enriquecimento:** Usado em pipelines de streaming para enriquecer eventos com dados contextuais (ex: buscar o nome de um cliente a partir do seu ID).

## 3. Componente 2: O Índice de Conceitos (PGVector)

### 3.1. Função

O PGVector é uma extensão do PostgreSQL que lhe dá a capacidade de armazenar e consultar **vetores de embedding**. A sua função é permitir a **busca por similaridade semântica**, que é o coração da técnica de Retrieval-Augmented Generation (RAG).

### 3.2. Dados Armazenados

O PGVector não armazena o texto original em si (que pode permanecer no Postgres ou noutro local), mas sim:
*   **Embeddings Vetoriais:** Representações numéricas de alta dimensão de pedaços de texto (`chunks`).
*   **Metadados:** Informações contextuais associadas a cada vetor, como o ID do documento de origem, o número da página, o ID do cliente, a data da transação, etc. Estes metadados são cruciais para filtrar os resultados da busca antes de realizar a comparação vetorial, tornando a pesquisa muito mais eficiente.

### 3.3. Implementação Prática (RAGs Especializados)

Você não terá um único "grande RAG", mas sim múltiplos RAGs especializados, implementados como tabelas separadas com PGVector:

*   **Tabela `transactions_embeddings`:**
    *   `id`: Chave primária.
    *   `transaction_id`: Chave estrangeira para a tabela de transações no Postgres.
    *   `chunk_text`: O texto descritivo da transação que foi vetorizado.
    *   `embedding`: O vetor gerado (tipo `vector`).
    *   Índice: Um índice IVFFlat ou HNSW é criado na coluna `embedding` para acelerar as buscas por similaridade.

*   **Tabela `regulations_embeddings`:**
    *   `id`: Chave primária.
    *   `document_id`: ID da norma ou circular do Bacen.
    *   `page_number`: Página de onde o texto foi extraído.
    *   `chunk_text`: O parágrafo ou secção da norma.
    *   `embedding`: O vetor gerado.

### 3.4. Papel na Arquitetura

*   **Alvo dos Pipelines de Ingestão:** Os pipelines da Camada 7 terminam por escrever nestas tabelas.
*   **Ferramenta dos Agentes Especialistas:** O `regulatory_agent` consulta a tabela `regulations_embeddings`, enquanto o `transaction_agent` consulta a `transactions_embeddings`. A busca envolve:
    1.  Converter a pergunta do usuário num vetor (usando o mesmo modelo de embedding).
    2.  Executar uma query no PGVector para encontrar os `N` vetores mais próximos (usando operadores como `<=>` para distância de cosseno).
    3.  Recuperar os `chunk_text` associados a esses vetores e passá-los ao LLM como contexto.

## 4. Componente 3: O Mapa de Conexões (NebulaGraph)

### 4.1. Função

O NebulaGraph é uma base de dados de grafos de alta performance. A sua função não é armazenar os dados em si, mas sim **modelar e consultar os relacionamentos entre os dados**. É otimizado para responder a perguntas que envolvem múltiplos "saltos" (hops) ou a descoberta de padrões complexos.

### 4.2. Estrutura de Dados (Nós e Arestas)

*   **Nós (Vertices):** Representam as entidades de negócio. Cada nó tem um tipo (`tag`) e propriedades.
    *   `tag(customer)`: Propriedades: `name`, `customer_id`, `risk_score`.
    *   `tag(company)`: Propriedades: `name`, `nif`.
    *   `tag(transaction)`: Propriedades: `amount`, `date`.
    *   `tag(address)`: Propriedades: `street`, `city`.

*   **Arestas (Edges):** Representam os relacionamentos entre os nós. As arestas são direcionadas, têm um tipo e também podem ter propriedades.
    *   `edge(HAS_ACCOUNT)`: `customer` -> `account`.
    *   `edge(PERFORMED_TRANSACTION)`: `account` -> `transaction`.
    *   `edge(IS_DIRECTOR_OF)`: `customer` -> `company`.
    *   `edge(SHARES_ADDRESS_WITH)`: `customer` -> `customer`. Propriedade: `type: 'family' | 'business'`.

### 4.3. Papel na Arquitetura

*   **Ferramenta Principal do `graph_agent`:** Este agente especializa-se em traduzir perguntas em linguagem natural para queries em nGQL (a linguagem de consulta do NebulaGraph).
*   **Casos de Uso:**
    *   **Análise de Fraude:** "Encontre todos os clientes que estão a 2 ou 3 'saltos' de distância de um cliente conhecido por fraude."
        ```ngql
        GO 1 TO 3 STEPS FROM "fraudster_customer_id" OVER * YIELD DISTINCT dst(edge)
        ```
    *   **Análise de Risco (KYC/AML):** "Mostre-me todas as empresas onde o cliente 'CUST-123' é diretor, e os outros diretores dessas empresas."
        ```ngql
        GO FROM "CUST-123" OVER IS_DIRECTOR_OF YIELD dst(edge) AS company | \
        GO FROM $-.company OVER IS_DIRECTOR_OF REVERSELY YIELD dst(edge)
        ```
    *   **Descoberta de Padrões:** "Existe algum padrão circular de transações entre um grupo de clientes?"

## 5. Sinergia entre os Três Pilares

A verdadeira magia acontece quando os três componentes são usados em conjunto por um plano do Agente Orquestrador:

1.  **Pergunta:** "Encontre transações suspeitas similares à fraude 'F-XYZ' envolvendo empresas ligadas ao cliente 'CUST-123'."
2.  **Passo 1 (PGVector):** O `transaction_agent` busca no RAG de fraudes para encontrar o vetor que representa a fraude 'F-XYZ'.
3.  **Passo 2 (NebulaGraph):** O `graph_agent` busca todas as empresas e contas ligadas ao 'CUST-123'.
4.  **Passo 3 (PGVector):** O `transaction_agent` faz uma busca por similaridade vetorial na tabela `transactions_embeddings`, usando o vetor da fraude 'F-XYZ', mas **filtrando** a busca para incluir apenas as transações das contas encontradas no Passo 2.

Esta abordagem em múltiplos passos, usando a ferramenta certa para cada tarefa, é o que permite ao sistema responder a perguntas que seriam impossíveis para uma arquitetura de dados monolítica.

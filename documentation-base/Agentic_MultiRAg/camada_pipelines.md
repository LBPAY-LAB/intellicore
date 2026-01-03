# Documento 7: A Camada de Gestão de Pipelines (O Motor de Operações)
**Versão:** 4.0
**Foco:** Um guia extensivo sobre o "Motor de Operações", detalhando todos os tipos de pipelines necessários para manter o sistema vivo, inteligente e atualizado. Foco especial nos pipelines de ingestão de dados, que são o passo fundamental para a criação e manutenção dos RAGs.

## 1. Visão Geral e Analogia

A Camada de Pipelines é a "equipa de logística e operações" da nossa agência de consultoria. Se as outras camadas são os "cérebros" e as "memórias", esta camada é o sistema circulatório e o departamento de treino. Ela garante que:

1.  **A informação flui:** Novos dados (livros, notícias, relatórios) são constantemente recolhidos, processados e entregues à "biblioteca" (Camada de Dados) para que o conhecimento esteja sempre atualizado.
2.  **A qualidade é mantida:** Os "analistas" (modelos) são regularmente avaliados e reciclados para garantir que a sua performance não se degrada.
3.  **As operações são eficientes:** Todo o processo é automatizado, agendado e monitorizado para funcionar sem intervenção manual.

Esta camada é o que torna o sistema dinâmico e adaptável, em vez de uma base de conhecimento estática.

## 2. O Orquestrador de Pipelines

Antes de detalhar os pipelines, é crucial definir a ferramenta que os gere. Um orquestrador de pipelines é responsável por agendar, executar, monitorizar e gerir as dependências entre as tarefas de todos os pipelines.

*   **Tecnologia Principal:** **Dagster**.
*   **Porquê Dagster?**
    *   **Asset-Centric:** O Dagster pensa em "ativos" (um modelo, um RAG, um relatório) e não apenas em "tarefas". Isto é perfeito para IA, pois permite visualizar a linhagem de como um RAG foi construído, a partir de quais fontes e com qual versão de um modelo de embedding.
    *   **Desenvolvimento e Teste Locais:** Facilita enormemente o desenvolvimento e o teste de pipelines antes de os colocar em produção.
    *   **Observabilidade Integrada:** Oferece uma interface de usuário rica para visualizar execuções, logs e a saúde dos ativos.
*   **Alternativas:** Apache Airflow (mais tradicional, baseado em Python), Prefect.

## 3. Pipelines de Ingestão de Dados (O Coração do RAG)

A função destes pipelines é popular e atualizar os RAGs especializados na Camada de Dados. O processo geral, independentemente da fonte, segue um padrão comum de **ETLV (Extract, Transform, Load, Vectorize)**.

### O Processo Genérico de Ingestão para RAG

1.  **Extract (Extrair):** Obter os dados brutos da sua fonte original.
2.  **Transform (Transformar):**
    *   **Limpeza:** Remover ruído (tags HTML, cabeçalhos/rodapés irrelevantes, etc.).
    *   **Extração de Metadados:** Extrair informações contextuais importantes (data de criação, autor, URL de origem, ID do cliente, etc.).
    *   **Chunking (Divisão):** Dividir documentos longos em pedaços (`chunks`) mais pequenos e semanticamente coesos. Este passo é **crítico**. Chunks demasiado grandes diluem o significado; chunks demasiado pequenos perdem o contexto. Estratégias incluem divisão por parágrafos, por secções ou usando algoritmos de chunking semântico.
3.  **Vectorize (Vetorizar):** Para cada `chunk` de texto, chamar a API do modelo de embedding (da Camada 4) para gerar o seu vetor.
4.  **Load (Carregar):** Carregar os dados processados nas bases de dados da Camada 2:
    *   **Para PGVector:** Inserir (ou atualizar - `UPSERT`) o chunk de texto, os seus metadados e o seu vetor de embedding na tabela do RAG apropriado.
    *   **Para NebulaGraph:** Criar ou atualizar os nós e arestas correspondentes às entidades mencionadas nos dados.

A seguir, detalhamos como este processo se aplica a cada tipo de fonte de dados.

### 3.1. Pipeline de Ingestão em Streaming (Apache Pulsar)

*   **Objetivo:** Atualizar os RAGs em tempo real à medida que os eventos de negócio acontecem.
*   **Tecnologia:** **Apache Flink** (para alta performance) ou **Faust** (para simplicidade em Python).
*   **Fluxo (ETLV em Streaming):**
    1.  **Extract:** Um *consumer* Flink/Faust subscreve-se aos tópicos do Pulsar (ex: `transacoes-realizadas`).
    2.  **Transform:**
        *   A mensagem do evento (muitas vezes mínima) é **enriquecida** com chamadas de baixa latência a outras fontes (ex: buscar o nome do cliente no Postgres a partir do `customer_id`).
        *   Um texto descritivo é gerado a partir dos dados enriquecidos. O chunking aqui é geralmente trivial, pois o evento já é um "chunk" atómico.
    3.  **Vectorize:** A aplicação de streaming faz uma chamada HTTP a uma API que serve o modelo de embedding para vetorizar o texto descritivo.
    4.  **Load:** A aplicação de streaming executa operações de `UPSERT` no PGVector e no NebulaGraph.

### 3.2. Pipeline de Ingestão de Documentos

*   **Objetivo:** Ingerir conhecimento de ficheiros não estruturados como PDFs (normas do Bacen, relatórios anuais), DOCX, etc.
*   **Tecnologia:** **Unstructured.io** é a ferramenta líder para esta tarefa.
*   **Fluxo (ETLV em Batch, agendado pelo Dagster):**
    1.  **Extract:** O pipeline monitoriza uma pasta, um bucket S3 ou outra fonte para novos documentos.
    2.  **Transform:**
        *   **Limpeza/Extração:** Usa a biblioteca `unstructured` para extrair o conteúdo de texto limpo do ficheiro, removendo imagens e formatando tabelas de forma legível. A `unstructured` é excelente a identificar elementos como títulos, parágrafos e listas.
        *   **Metadados:** Extrai metadados do ficheiro (nome, data de criação) e pode usar um LLM para extrair metadados do conteúdo (ex: "Qual o ID desta circular? Qual a data de vigência?").
        *   **Chunking:** Usa as próprias estruturas identificadas pela `unstructured` (parágrafos, secções) para uma divisão inteligente.
    3.  **Vectorize:** Itera sobre cada chunk, gerando o seu embedding.
    4.  **Load:** Carrega os chunks, metadados e vetores para a tabela `regulations_embeddings` no PGVector.

### 3.3. Pipeline de Ingestão de Sites Web (Web Scraping)

*   **Objetivo:** Ingerir conhecimento de fontes públicas ou internas (sites de notícias financeiras, blogues, documentação interna em Confluence).
*   **Tecnologia:** **Beautiful Soup** / **Scrapy** (para extração), **LangChain `RecursiveUrlLoader`** (para uma solução rápida).
*   **Fluxo (ETLV em Batch, agendado pelo Dagster):**
    1.  **Extract:** O pipeline recebe uma URL inicial. Ele faz o download do HTML da página. Pode ser configurado para seguir links recursivamente até uma certa profundidade para "raspar" um site inteiro.
    2.  **Transform:**
        *   **Limpeza:** Usa o Beautiful Soup para fazer o parse do HTML e extrair apenas o conteúdo textual relevante (ex: o conteúdo dentro das tags `<article>` ou `<main>`), descartando menus, anúncios e scripts.
        *   **Metadados:** Extrai a URL de origem, o título da página, a data de publicação.
        *   **Chunking:** Divide o texto extraído em parágrafos.
    3.  **Vectorize:** Vetoriza cada chunk.
    4.  **Load:** Carrega para uma tabela de RAG apropriada (ex: `news_embeddings`).

### 3.4. Pipeline de Ingestão via APIs

*   **Objetivo:** Ingerir dados de sistemas de terceiros que expõem uma API (ex: um provedor de dados de mercado, um sistema de CRM).
*   **Tecnologia:** Scripts Python usando a biblioteca **Requests**.
*   **Fluxo (ETLV em Batch, agendado pelo Dagster):**
    1.  **Extract:** O script faz uma chamada HTTP à API de terceiro (ex: `GET /api/v1/market-news`). Lida com a autenticação (chaves de API) e a paginação dos resultados.
    2.  **Transform:**
        *   **Limpeza:** Faz o parse da resposta JSON.
        *   **Metadados:** Extrai os metadados relevantes do JSON.
        *   **Chunking:** Se o conteúdo de um campo JSON for muito longo, ele é dividido.
    3.  **Vectorize:** Vetoriza os campos textuais relevantes.
    4.  **Load:** Carrega os dados para o PGVector.

### 3.5. Pipeline de Ingestão Direta (Texto ou JSON)

*   **Objetivo:** Permitir que usuários ou sistemas alimentem o RAG com conhecimento pontual através de uma API.
*   **Tecnologia:** Um endpoint de API no **FastAPI**.
*   **Fluxo (ETLV em tempo real, acionado por API):**
    1.  **Extract:** Um usuário envia um `POST` para `/api/v1/ingest` com um payload JSON contendo o texto a ser ingerido e os metadados associados.
        ```json
        {
          "text": "Lembrete importante: a partir de amanhã, todas as transações internacionais acima de 10k USD exigem uma verificação de conformidade adicional.",
          "source": "Manual Internal Memo",
          "author": "John Doe",
          "target_rag": "internal_procedures_embeddings"
        }
        ```
    2.  **Transform:** O endpoint recebe o texto. O chunking pode ser simples (tratar o texto inteiro como um chunk se for curto).
    3.  **Vectorize:** Chama a API de embedding.
    4.  **Load:** Insere diretamente na tabela de RAG especificada no `target_rag`.

## 4. Outros Pipelines Críticos

### 4.1. Pipelines de Avaliação (Eval Pipelines)

*   **Objetivo:** Garantir que a qualidade do sistema não se degrada.
*   **Fluxo (Agendado pelo Dagster, ex: todas as noites):**
    1.  **Carregar "Golden Set":** Carrega um conjunto de dados de teste com pares de (pergunta, resposta esperada).
    2.  **Executar Perguntas:** Itera sobre as perguntas e as envia para o Agente Orquestrador.
    3.  **Avaliar Respostas:** Compara a resposta gerada com a resposta esperada usando métricas como RAGAs (avaliação da qualidade do RAG) ou usando um LLM como juiz.
    4.  **Gerar Relatório:** Cria um relatório de performance e envia alertas se as métricas caírem abaixo de um limiar.

### 4.2. Pipelines de CI/CD

*   **Objetivo:** Automatizar o teste e o deploy de novas versões dos agentes e dos próprios pipelines.
*   **Tecnologia:** **GitLab CI/CD**, **GitHub Actions**, **Jenkins**.
*   **Fluxo:** Quando um desenvolvedor faz um `git push`, o pipeline é acionado para:
    1.  Executar testes unitários.
    2.  Construir as imagens Docker para os agentes e pipelines.
    3.  Fazer o deploy para um ambiente de staging.
    4.  Executar o pipeline de avaliação no staging.
    5.  Se tudo passar, permitir o deploy para produção.

# Documento 9: Otimização e Enriquecimento Semântico (A Camada de Inteligência de Dados)
**Versão:** 1.0
**Foco:** Detalhar as estratégias e técnicas para enriquecer os dados antes e durante a ingestão, garantindo que os RAGs (vetores) e o Grafo de Conhecimento sejam o mais potentes, precisos e otimizados possível.

## 1. Visão Geral e Analogia

Se a Camada de Dados é a "biblioteca" e os Pipelines são a "logística", esta camada é o trabalho do **"curador-chefe e arquivista"**. Um arquivista não se limita a colocar um livro novo na prateleira. Ele lê a capa, o índice e talvez um resumo. Em seguida, ele:

*   **Cataloga (Metadados e Tags):** Adiciona etiquetas como "Ficção Científica", "Século XX", "Autor Premiado".
*   **Cria Fichas de Referência (Tabelas de Valores):** Mantém listas de referência para termos importantes.
*   **Faz Referências Cruzadas (Relações de Grafo):** Adiciona uma nota que diz "Este livro é uma resposta ao livro Y" ou "O autor foi influenciado pelo autor Z".
*   **Gere o Ciclo de Vida:** Sabe quando um livro é uma nova edição que substitui uma antiga.

Este trabalho de "curadoria" prévia é o que permite que um pesquisador (o nosso Agente) encontre a informação mais relevante de forma rápida e precisa. Ingerir dados sem este enriquecimento é como ter uma biblioteca com os livros empilhados aleatoriamente no chão.

## 2. A Estratégia Central: Metadados Ricos

A otimização da busca em RAGs e Grafos depende de uma única coisa: **metadados ricos e estruturados**. Cada `chunk` de vetor e cada nó de grafo deve ser acompanhado por um conjunto rico de metadados. A busca é então um processo de duas etapas:

1.  **Filtragem por Metadados:** Reduzir drasticamente o espaço de busca, selecionando apenas os itens cujos metadados correspondem à consulta.
2.  **Busca Semântica/de Grafo:** Executar a busca vetorial ou a travessia do grafo apenas no subconjunto filtrado.

### Exemplo: Ingestão de uma Circular do Banco Central sobre o DICT

Vamos usar o seu excelente exemplo para ilustrar as técnicas.

**Documento Bruto:** "Circular Nº 4.027, de 2 de junho de 2020 - Dispõe sobre o Diretório de Identificadores de Contas Transacionais (DICT)..."

### 2.1. Técnica 1: Extração e Normalização de Metadados Fundamentais

Durante a etapa de **Transform** do pipeline de ingestão de documentos, antes do chunking, usamos um LLM (ou regras) para extrair um cabeçalho de metadados estruturados do documento.

*   **Objetivo:** Capturar a identidade e o contexto do documento como um todo.
*   **Implementação:**
    *   Um prompt para um LLM: `"Dado o seguinte texto inicial de um documento regulatório, extrai os seguintes campos em formato JSON: document_type, document_number, publication_date, effective_date, subject, status, revokes, is_revoked_by."`
*   **Resultado para a Circular 4.027:**
    ```json
    {
      "document_type": "Circular",
      "document_number": "4027",
      "publication_date": "2020-06-02",
      "effective_date": "2020-11-03",
      "subject": "DICT",
      "status": "ACTIVE",
      "revokes": null, // Esta circular não revoga nenhuma outra
      "is_revoked_by": "Circular_4282" // Supondo que uma circular futura a revogue
    }
    ```
*   **Impacto:** Estes metadados são **associados a cada chunk de vetor** gerado a partir deste documento. Agora, podemos fazer perguntas como:
    *   "Quais são as regras do DICT que estavam ativas em outubro de 2020?"
        *   **Filtragem:** `WHERE subject = 'DICT' AND status = 'ACTIVE' AND effective_date <= '2020-10-31'`
        *   Só depois é que a busca vetorial é feita nos chunks restantes.

### 2.2. Técnica 2: Tagging Semântico e Entidades Nomeadas

*   **Objetivo:** Identificar e etiquetar os conceitos e entidades chave *dentro* de cada chunk de texto.
*   **Implementação:** Após o chunking, para cada chunk, usamos um LLM ou um modelo de Reconhecimento de Entidades Nomeadas (NER).
    *   **Prompt para LLM:** `"Para o seguinte chunk de texto, identifica e extrai todas as entidades dos tipos: API_ENDPOINT, DATA_FIELD, BUSINESS_RULE, PENALTY."`
*   **Exemplo de Chunk:** "Art. 15. A consulta a um identificador de conta transacional no DICT deve ser feita através do endpoint `/dict/entries/{key}`. O campo `creationDate` deve seguir o formato ISO 8601."
*   **Metadados Adicionais para este Chunk:**
    ```json
    {
      "tags": ["Regra de Consulta", "Formato de Dados"],
      "entities": {
        "API_ENDPOINT": ["/dict/entries/{key}"],
        "DATA_FIELD": ["creationDate"]
      }
    }
    ```
*   **Impacto:** Permite buscas extremamente específicas.
    *   "Quais são as regras sobre o formato do campo `creationDate` no DICT?"
        *   **Filtragem:** `WHERE subject = 'DICT' AND entities.DATA_FIELD CONTAINS 'creationDate'`
        *   A busca vetorial é feita num conjunto muito pequeno e relevante de chunks.

### 2.3. Técnica 3: Criação de Regras em Linguagem Natural e Tabelas de Valores

*   **Objetivo:** Converter parágrafos complexos e legais em regras de negócio simples e acionáveis, e normalizar termos.
*   **Implementação:**
    1.  **Tabelas de Valores (Knowledge Base Auxiliar):** Manter tabelas no Postgres que mapeiam sinónimos e conceitos.
        *   **Tabela `glossary`:**
            | Term | Definition | Synonyms |
            |:---|:---|:---|
            | DICT | Diretório de Identificadores de Contas Transacionais | "diretório de chaves pix", "base de chaves" |
    2.  **Geração de Regra em Linguagem Natural:** Para chunks que contêm regras de negócio, usar um LLM para as "traduzir".
        *   **Chunk Original:** "Art. 22. O participante indireto que deixar de cumprir, de forma reiterada, os horários estabelecidos para a liquidação de ordens de pagamento... estará sujeito a uma multa de R$ 5.000,00 por ocorrência."
        *   **Metadado Adicional (Regra NL):**
            ```json
            {
              "natural_language_rule": "SE um participante indireto falhar repetidamente em cumprir os horários de liquidação, ENTÃO aplicar uma multa de 5000 BRL por evento."
            }
            ```
*   **Impacto:**
    *   A busca por "multa por atraso na liquidação" irá corresponder semanticamente à "natural_language_rule", mesmo que as palavras exatas não estejam no texto original.
    *   A busca por "diretório de chaves pix" será expandida (usando a tabela `glossary`) para também procurar por "DICT".

### 2.4. Técnica 4: Enriquecimento do Grafo de Conhecimento

*   **Objetivo:** Modelar explicitamente as relações entre os documentos e os conceitos.
*   **Implementação:** Durante a ingestão, além de carregar no PGVector, o pipeline também atualiza o NebulaGraph.
*   **Ações no Grafo para a Circular 4.027:**
    1.  **Criar Nó do Documento:** `INSERT VERTEX document(doc_id, type, ...) VALUES "Circular_4027":("Circular_4027", "Circular", ...)`
    2.  **Criar Nó do Conceito:** `INSERT VERTEX concept(name) VALUES "DICT":("DICT")`
    3.  **Criar Aresta de Relação:** `INSERT EDGE DEFINES "Circular_4027" -> "DICT"`
    4.  **Gerir Ciclo de Vida:** Quando a "Circular 4.282" for ingerida e o seu metadado `revokes` contiver "Circular_4027":
        *   `INSERT EDGE REVOKES "Circular_4282" -> "Circular_4027"`
        *   Atualizar o nó da circular antiga: `UPDATE VERTEX "Circular_4027" SET properties.status = "REVOKED"`

*   **Impacto:** O Agente de Grafos pode agora responder a perguntas impossíveis para um RAG vetorial.
    *   "Qual documento substituiu a Circular 4.027?"
        *   `GO FROM "Circular_4027" OVER REVOKES REVERSELY YIELD dst(edge)`
    *   "Mostre-me todo o histórico de regulação sobre o DICT."
        *   `GO FROM "DICT" OVER DEFINES REVERSELY YIELD dst(edge)`

## 3. O Design dos Tópicos do Pulsar

Para permitir este enriquecimento em tempo real, os eventos publicados no Pulsar devem ser desenhados para conter o máximo de contexto possível, em vez de serem apenas IDs.

*   **Design Ruim (Mínimo):**
    ```json
    {"transaction_id": "TXN-ABC-123", "customer_id": 987}
    ```
    *   *Problema:* A pipeline de streaming precisa de fazer múltiplas chamadas à base de dados para obter o resto da informação, aumentando a latência.

*   **Design Bom (Enriquecido na Fonte):**
    ```json
    {
      "event_id": "uuid-...",
      "event_type": "TRANSACTION_COMPLETED",
      "source_system": "CoreBanking_API",
      "timestamp": "...",
      "payload": {
        "transaction": { "id": "TXN-ABC-123", "amount": 500.00, "type": "PIX" },
        "customer": { "id": 987, "name": "Empresa X", "segment": "PJ", "risk_score": "B" },
        "product": { "id": 55, "name": "Seguro de Equipamentos" }
      }
    }
    ```
    *   **Vantagem:** A pipeline de streaming recebe quase toda a informação de que precisa. A etapa de "Enriquecimento" torna-se muito mais leve ou até desnecessária, e a geração do texto descritivo para vetorização é imediata.

## Conclusão

A otimização não é um passo final, mas sim um processo contínuo integrado em cada etapa da ingestão de dados. Ao tratar os metadados, as tags, as regras de negócio e as relações de grafo como cidadãos de primeira classe, você transforma a sua "biblioteca" de dados num cérebro auxiliar, permitindo que o Agente Orquestrador encontre a informação exata com uma precisão e velocidade cirúrgicas.

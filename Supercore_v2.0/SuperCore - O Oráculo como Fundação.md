# SuperCore - O Oráculo como Fundação

## 1. Conceito: O Oráculo como Fonte da Verdade

O **Oráculo** é o coração e a alma do SuperCore. Não é um componente, mas sim um **estado de conhecimento consolidado** que serve como a única fonte da verdade para todo o sistema. A sua função é compreender profundamente o domínio de negócio (ex: Core Banking para uma IP brasileira) antes que qualquer linha de código seja gerada.

O paradigma muda de "código como fonte da verdade" para **"intenção e conhecimento como fonte da verdade"**. O Oráculo é a materialização dessa intenção.

## 2. Arquitetura do Oráculo: Ingestão e Consolidação

O Oráculo é construído através de um processo contínuo de ingestão e consolidação de conhecimento, utilizando os **Pipelines RAG (Retrieval-Augmented Generation)**.

### Pipeline 1: Ingestão de Conhecimento

O Oráculo é alimentado com uma vasta gama de documentos não estruturados e semi-estruturados:

| Tipo de Documento | Exemplos |
| :--- | :--- |
| **Regulamentações** | Manuais do BACEN, Resoluções do CMN, Circulares, Cartas Circulares |
| **Políticas Internas** | Política de Segurança da Informação, Política de Prevenção à Lavagem de Dinheiro (PLD) |
| **Fluxos Funcionais** | Diagramas de processo, especificações de produtos, manuais de usuário |
| **Especificações Técnicas** | Documentação de APIs de parceiros, manuais de integração |
| **Dados Históricos** | Logs de transações, comportamento do usuário, dados de risco |

### Pipeline 2: Processamento e Enriquecimento

Uma vez ingeridos, os documentos passam por um processo de enriquecimento:

1.  **Extração de Texto e Imagens:** OCR para PDFs, extração de tabelas, etc.
2.  **Chunking Semântico:** Documentos são divididos em pedaços lógicos.
3.  **Embedding:** Cada pedaço é transformado em um vetor numérico.
4.  **Extração de Entidades e Relações:** Claude Code identifica conceitos-chave (ex: "Conta Pré-Paga", "PIX", "SPI") e como eles se relacionam.

### Pipeline 3: Armazenamento no Knowledge Graph

O conhecimento processado é armazenado em um **Knowledge Graph (NebulaGraph)**, onde:

-   **Nós** representam entidades (ex: `Conta`, `Cliente`, `Transação`).
-   **Arestas** representam relações (ex: `Cliente` -possui-> `Conta`).
-   **Propriedades** armazenam metadados (ex: fonte do documento, data da resolução).

Este grafo permite que o Oráculo não apenas recupere informação, mas **raciocine sobre ela**.

## 3. Como o Oráculo Funciona na Prática

Quando você interage com o Assistente de IA para criar um objeto, o Oráculo entra em ação:

**Você:** "Preciso de um objeto `Person` para cadastro de PF."

**Assistente (usando o Oráculo):**
1.  **Consulta o Knowledge Graph:** "O que as regulações do BACEN dizem sobre os dados necessários para cadastro de Pessoa Física?"
2.  **Recupera Conhecimento:** O grafo retorna os campos obrigatórios (CPF, nome, data de nascimento, endereço), as validações necessárias (CPF válido, maioridade) e os documentos exigidos.
3.  **Gera o Objeto:** Com base nesse conhecimento, o Assistente gera o código completo do objeto `Person` (Pydantic, Go, SQL, OPA Rego) já em conformidade com as regulações.

## 4. Benefícios do Oráculo

-   **Compliance Automático:** Todo o código gerado é inerentemente compliant porque deriva diretamente das regulações.
-   **Fonte Única da Verdade:** Elimina ambiguidades e garante consistência em todo o sistema.
-   **Evolução Contínua:** Quando uma nova resolução do BACEN é publicada, o Oráculo é atualizado, e o sistema pode se auto-regenerar para refletir a nova regra.
-   **Contexto Profundo:** Permite que o Assistente responda perguntas complexas e tome decisões informadas.

O Oráculo é a fundação que torna possível a visão do SuperCore: um sistema que se constrói e evolui a partir de conhecimento, não de código hardcoded.

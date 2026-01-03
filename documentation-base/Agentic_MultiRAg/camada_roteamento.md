# Documento 5: A Camada de Roteamento Inteligente (O Otimizador de Rotas)
**Versão:** 4.0
**Foco:** Detalhar o "Otimizador de Rotas", explicando as técnicas para o bypass de LLM, como classificar a intenção do usuário e o impacto desta camada na performance, custo e confiabilidade do sistema.

## 1. Visão Geral e Analogia

A Camada de Roteamento Inteligente é o "princípio da eficiência" da nossa agência de consultoria. Imagine que um cliente entra na agência. Um gestor de projetos júnior (o Roteador) faz uma triagem inicial da pergunta.

*   Se o cliente pergunta "Que horas são?", o gestor júnior simplesmente olha para o relógio e responde. Seria um desperdício absurdo de tempo e dinheiro reunir o conselho de diretores (o LLM potente) para debater e formular uma resposta a essa pergunta.
*   Se o cliente pergunta "Qual a nossa estratégia de expansão para o mercado asiático nos próximos 5 anos?", o gestor júnior imediatamente reconhece a complexidade e encaminha o cliente para o sócio-sénior (o Agente Orquestrador com o seu LLM potente).

Esta camada é uma função lógica, tipicamente a primeira etapa executada pelo Agente Orquestrador, que decide qual "caminho" ou "rota" uma requisição deve seguir dentro do sistema. O seu objetivo é maximizar a eficiência, evitando o uso do recurso mais caro e lento (o raciocínio de um LLM generativo) para tarefas que não o exigem.

## 2. A Necessidade do Roteamento Inteligente

Invocar um LLM generativo para cada requisição é problemático por três razões:

1.  **Latência:** Uma chamada a um LLM, especialmente um modelo potente, pode demorar de 2 a 10 segundos ou mais. Para perguntas simples, esta latência é inaceitável para uma boa experiência de usuário.
2.  **Custo:** Cada chamada a um LLM (seja na nuvem ou self-hosted) tem um custo computacional (e financeiro) associado. Responder a milhões de perguntas simples por dia através de um LLM seria financeiramente proibitivo.
3.  **Confiabilidade e Determinismo:** LLMs generativos são probabilísticos. Para uma pergunta factual como "Qual o saldo da conta X?", existe um risco (pequeno, mas real) de o LLM "alucinar" ou formatar a resposta de forma incorreta. Uma consulta direta a uma base de dados é 100% determinística e confiável.

## 3. O Mecanismo de Roteamento

O processo consiste em duas etapas principais: a classificação da intenção e a execução da rota correspondente.

### 3.1. Etapa 1: Classificação da Intenção

Esta é a etapa de triagem. O objetivo é categorizar a requisição do usuário numa de várias intenções pré-definidas.

#### **Técnicas de Classificação:**

*   **Baseada em Regras (Simples e Rápida):**
    *   **Palavras-chave:** Usar listas de palavras-chave e expressões regulares para identificar intenções óbvias.
        *   Se a pergunta contém "saldo", "extrato", "balanço" -> Intenção: `QUERY_ACCOUNT_BALANCE`.
        *   Se a pergunta começa com "transfere", "envia", "paga" -> Intenção: `EXECUTE_TRANSACTION`.
    *   **Vantagens:** Extremamente rápida, custo zero, fácil de implementar e entender.
    *   **Desvantagens:** Frágil. Não consegue lidar com a variabilidade da linguagem natural ("Queria ver quanto dinheiro tenho na minha conta").

*   **Baseada em LLM (Poderosa e Flexível):**
    *   **Abordagem:** Usar um LLM para classificar a intenção.
    *   **Implementação:**
        1.  **Definir as Intenções:** Criar uma lista de possíveis intenções com descrições claras.
            ```python
            from enum import Enum

            class Intent(Enum):
                QUERY_DATA = "O usuário está a pedir um dado factual e específico que pode ser encontrado numa base de dados."
                EXECUTE_COMMAND = "O usuário está a pedir para realizar uma ação ou transação."
                COMPLEX_QUERY = "O usuário está a fazer uma pergunta aberta, que requer raciocínio, análise, comparação ou síntese de múltiplas fontes."
            ```
        2.  **Prompt de Classificação:** Construir um prompt que pede ao LLM para escolher uma das intenções da lista.
            ```prompt
            Dada a seguinte pergunta do usuário, classifica-a numa das seguintes categorias:
            {intent_definitions}

            Pergunta do usuário: "{user_query}"
            Categoria:
            ```
        3.  **Escolha do Modelo:** Para esta tarefa, não é necessário um LLM gigante. Um modelo **pequeno e rápido** (self-hosted ou um modelo de nuvem como o Claude 3 Haiku) é ideal. A tarefa de classificação é muito mais simples do que a de geração.

### 3.2. Etapa 2: Execução da Rota

Uma vez classificada a intenção, o sistema executa a rota correspondente.

#### **Rota 1: Rota Direta (Bypass de LLM)**

Se a intenção for `QUERY_DATA` ou `EXECUTE_COMMAND`.

*   **Mecanismo:** O sistema **não** invoca o Agente Orquestrador. Em vez disso, ele mapeia a intenção diretamente para uma **função de software pré-definida e segura**.
*   **Exemplo (`QUERY_ACCOUNT_BALANCE`):**
    1.  A intenção é identificada.
    2.  O sistema extrai as entidades necessárias da pergunta (ex: o `account_id`).
    3.  Ele chama uma função interna: `balance = get_account_balance(account_id='123-45')`.
    4.  A função `get_account_balance` contém uma query SQL parametrizada e segura que consulta o Postgres.
    5.  O resultado (`balance`) é formatado numa string simples e retornado ao usuário.
*   **Resultado:** A resposta é retornada em milissegundos, com 100% de precisão e a um custo computacional quase nulo.

#### **Rota 2: Rota Cognitiva**

Se a intenção for `COMPLEX_QUERY`.

*   **Mecanismo:** A requisição é passada para o **ciclo de Raciocínio-Ação completo do Agente Orquestrador**, como descrito no Documento 1.
*   **Resultado:** O sistema utiliza todo o seu poder cognitivo para decompor o problema, consultar múltiplas fontes de dados (RAGs, Grafo) e sintetizar uma resposta abrangente. O processo é mais lento e caro, mas é apropriado para a complexidade da tarefa.

## 4. Implementação Técnica (Stack Sugerida)

*   **Framework:** **LangChain** oferece um componente chamado **`RouterChain`** que é desenhado exatamente para este propósito. Ele permite definir diferentes "sub-chains" (rotas) e usa um LLM para decidir qual chain executar com base na pergunta do usuário.

*   **Exemplo com LangChain:**
    ```python
    # Definir as rotas
    direct_query_chain = ... # Uma chain que chama uma função Python
    cognitive_agent_chain = ... # A chain que invoca o Agente Orquestrador

    # Definir as descrições das rotas para o LLM escolher
    route_definitions = [
        {"name": "direct_query", "description": "Bom para perguntas factuais e diretas.", "chain": direct_query_chain},
        {"name": "cognitive_agent", "description": "Bom para perguntas complexas e abertas.", "chain": cognitive_agent_chain}
    ]

    # Criar a RouterChain
    router_chain = MultiPromptChain.from_prompts(llm, route_definitions, default_chain=cognitive_agent_chain)

    # Executar
    router_chain.run("Qual o saldo da conta 123-45?") # O LLM escolherá a rota "direct_query"
    ```

## 5. Impacto Estratégico

A implementação de uma Camada de Roteamento Inteligente é uma das otimizações mais importantes que se pode fazer numa arquitetura baseada em LLMs. Ela transforma o sistema de um "brinquedo" de IA impressionante, mas impraticável, para uma ferramenta de produção robusta, escalável e economicamente viável, capaz de servir milhões de requisições de forma eficiente.

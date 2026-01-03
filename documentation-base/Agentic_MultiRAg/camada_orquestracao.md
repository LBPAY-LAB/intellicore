# Documento 1: A Camada de Orquestração (O Cérebro)
**Versão:** 4.0
**Foco:** Detalhar o centro de tomada de decisão do sistema, o Agente Orquestrador, os Agentes Especialistas e a lógica de planeamento e delegação.

## 1. Visão Geral e Analogia

A Camada de Orquestração é o componente ativo e pensante do sistema. Se a Camada de Dados é a "biblioteca", a Camada de Orquestração é o "pesquisador-chefe" que recebe um problema, entende-o, cria uma estratégia para o resolver, delega a recolha de informação a assistentes especializados e, finalmente, sintetiza os resultados numa resposta coerente.

A sua principal responsabilidade não é *conhecer* a resposta, mas sim *saber como encontrar* a resposta da forma mais eficiente possível. Esta camada implementa a lógica de "agente", transformando o sistema de uma ferramenta passiva para um colaborador proativo.

## 2. Componentes Principais

Esta camada é composta por dois tipos de agentes, idealmente implementados usando um framework como o LangChain, que fornece as abstrações necessárias para o ciclo de Raciocínio-Ação (ReAct).

### 2.1. O Agente Orquestrador

Este é o componente mais sofisticado, o "Gestor de Projetos". Ele é *stateful* no contexto de uma única requisição complexa, mantendo um plano de execução e os resultados parciais.

#### **Ciclo de Vida de uma Requisição no Orquestrador (Padrão ReAct):**

1.  **Receção e Análise da Intenção:**
    *   A requisição chega da Camada de Protocolos (seja de um humano ou de outro agente).
    *   **Primeira Ação:** O Orquestrador utiliza a Camada 5 (Roteamento Inteligente) para classificar a intenção. Se for uma consulta direta, a execução é delegada a uma função de bypass e o ciclo termina aqui. Se for uma tarefa complexa, o ciclo cognitivo começa.

2.  **Planeamento e Decomposição (Reasoning Step):**
    *   O Orquestrador usa um LLM potente (da Camada 4) para decompor a pergunta complexa num plano de ação. Este plano não é gerado de uma só vez, mas sim passo a passo, seguindo o padrão ReAct (Reasoning and Acting).
    *   **Exemplo:** Pergunta: "Quais clientes PJ do setor de varejo tiveram transações acima de 100k BRL que podem estar em conflito com a nova regra de compliance 'XYZ'?"
    *   **Passo 1: Raciocínio (Thought)**
        *   `Thought`: "A pergunta é complexa e envolve múltiplos domínios: clientes, transações e regulação. Preciso de decompor o problema. O primeiro passo é entender o que é a 'regra de compliance XYZ'. A melhor ferramenta para isso é o `regulatory_agent`, que está descrito como 'Útil para interpretar documentos legais e de compliance'."
    *   **Passo 2: Ação (Action)**
        *   `Action`: `call_agent('regulatory_agent', query='Descreva os critérios exatos da regra de compliance XYZ.')`

3.  **Delegação e Observação (Observation Step):**
    *   O Orquestrador executa a `Action`, invocando o Agente Especialista Regulatório.
    *   Ele aguarda a resposta, que é a "Observação".
    *   `Observation`: `{"rule_name": "XYZ", "criteria": "Proíbe transações únicas acima de 150,000.00 BRL para clientes com score de risco 'C' ou superior."}`

4.  **Ciclo de Raciocínio Contínuo:**
    *   O Orquestrador inicia um novo ciclo de raciocínio, agora com a nova informação.
    *   `Thought`: "Ok, agora sei a regra. Preciso de encontrar os clientes relevantes. A pergunta especifica 'clientes PJ do setor de varejo'. O `graph_agent` é descrito como 'Ideal para encontrar entidades e suas relações'. Vou usá-lo para obter a lista de clientes."
    *   `Action`: `call_agent('graph_agent', query='Liste todos os customer_id de clientes com o atributo type="PJ" e sector="varejo".')`
    *   `Observation`: `{"customer_ids": [123, 456, 789, ... ]}`
    *   `Thought`: "Excelente. Agora tenho a lista de clientes. Preciso das suas transações e do seu score de risco. A pergunta menciona transações acima de 100k, mas a regra é sobre 150k. Vou buscar todas acima de 100k para ter o contexto completo. O `transaction_agent` pode buscar transações e o `customer_agent` pode buscar o score de risco."
    *   `Action`: `parallel_calls([ call_agent('transaction_agent', query='Para os clientes [123, 456, ...], encontre todas as transações acima de 100k BRL.'), call_agent('customer_agent', query='Para os clientes [123, 456, ...], retorne o seu score de risco.') ])`
    *   `Observation`: `[ {"transactions": [...]}, {"customer_scores": [...]} ]`

5.  **Síntese e Resposta Final:**
    *   `Thought`: "Tenho todos os dados necessários: a regra, os clientes, as transações e os scores. Agora posso filtrar os resultados localmente para encontrar as violações exatas (transações > 150k de clientes com score >= 'C'). Depois de filtrar, tenho a resposta final. Vou usar o LLM uma última vez para formatar esta informação numa resposta clara e concisa para o usuário."
    *   `Action`: `synthesize_final_answer(final_data)`
    *   A resposta final é então retornada através da Camada de Protocolos.

### 2.2. Os Agentes Especialistas

São agentes mais simples e focados, os "Analistas de pesquisa". Cada um é uma combinação de um LLM (pode ser um modelo mais pequeno e rápido) e um conjunto de ferramentas muito específicas.

#### **Características:**

*   **Domínio Limitado:** Um agente especialista só sabe fazer uma coisa, mas fá-la muito bem. A sua simplicidade torna-o rápido, fiável e mais barato de operar.
*   **Anúncio de Skills (Descrição da Ferramenta):** A forma como o Orquestrador descobre os agentes é através da descrição das suas ferramentas. Esta descrição é crucial e deve ser muito clara.
    *   Exemplo de descrição para o LangChain:
        ```python
        from langchain.tools import tool

        @tool
        def transaction_search_tool(customer_ids: list[str], min_amount: float) -> str:
          """Útil para buscar, filtrar e analisar dados de transações financeiras. Recebe uma lista de IDs de clientes e um valor mínimo para a transação."""
          # Lógica para construir uma query SQL+vetorial no PGVector
          results = db.query(...)
          return format_results_as_json(results)
        ```
*   **Ferramentas (Tools):** A "skill" é implementada através de ferramentas. Uma ferramenta é simplesmente uma função de software bem definida que o agente pode chamar. O LLM do agente não executa o código, ele apenas gera a chamada à função com os parâmetros corretos.

#### **Exemplos de Agentes Especialistas e as suas Ferramentas:**

*   **Agente de Transações:**
    *   **Skills:** Buscar transações, encontrar transações similares, resumir atividade transacional.
    *   **Ferramentas:** `search_transactions`, `find_similar_transactions(vector)`, `summarize_activity(customer_id)`.
*   **Agente Regulatório:**
    *   **Skills:** Interpretar documentos legais, comparar uma situação com uma norma, verificar conformidade.
    *   **Ferramentas:** `get_regulation_summary(rule_name)`, `check_compliance(transaction_data, rule_data)`.
*   **Agente de Grafos:**
    *   **Skills:** Descobrir relações entre entidades, encontrar beneficiários finais, detetar anéis de fraude.
    *   **Ferramentas:** `find_shortest_path(entity1, entity2)`, `get_neighbors(entity_id, depth)`, `detect_circular_dependencies(entity_id)`.
*   **Agente de Dados Estruturados:**
    *   **Skills:** Obter dados brutos e factuais de tabelas específicas.
    *   **Ferramentas:** Um executor de SQL seguro (SQL Agent) que tem uma lista de permissões de apenas `SELECT` em tabelas e colunas pré-aprovadas para evitar qualquer risco de injeção de SQL ou fuga de dados.

## 3. Implementação Técnica (Stack Sugerida)

*   **Framework:** **LangChain (Python)** é a escolha mais madura, oferecendo componentes pré-construídos para:
    *   **Agents e AgentExecutor:** O motor que executa o ciclo de Raciocínio-Ação.
    *   **Chains (LCEL - LangChain Expression Language):** Para encadear chamadas a LLMs e ferramentas de forma declarativa e robusta.
    *   **Tool/Function Calling:** A capacidade dos LLMs de decidir qual função de software chamar, que é a base do padrão ReAct.
*   **Linguagem:** Python, devido ao seu ecossistema de IA e ciência de dados inigualável.

## 4. Desafios e Considerações

*   **Complexidade do Prompt do Orquestrador:** O prompt que instrui o Agente Orquestrador é a peça de código mais crítica de todo o sistema. Ele precisa de ser cuidadosamente engenheirado, com exemplos de "few-shot" (pequenos exemplos de planos de ação), para que o LLM consiga criar planos de ação robustos e eficientes.
*   **Gestão de Erros e Recuperação:** O que acontece se um agente especialista falha ou retorna dados inválidos? O Orquestrador precisa de ter uma lógica para tentar novamente, reformular a pergunta, escolher outro agente ou reportar a falha de forma graciosa ao usuário. O ciclo ReAct permite esta recuperação, pois o `Observation` pode ser um erro, e o `Thought` seguinte pode ser "A minha última ação falhou, vou tentar uma abordagem diferente".
*   **Latência vs. Qualidade:** Um plano com muitos passos e múltiplas chamadas a LLMs pode ser lento. É um equilíbrio constante. O uso da Camada 5 para bypass, a paralelização de chamadas a agentes e a utilização de LLMs mais rápidos para os agentes especialistas são estratégias cruciais para mitigar este problema.
*   **Prevenção de Loops:** Um Orquestrador mal instruído pode entrar em loops de raciocínio. É essencial ter mecanismos de salvaguarda, como um número máximo de passos, para interromper a execução e evitar o consumo excessivo de recursos.

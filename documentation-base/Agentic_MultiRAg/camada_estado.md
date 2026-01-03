# Documento 3: A Camada de Estado e Tarefas (A Memória de Curto Prazo)
**Versão:** 4.0
**Foco:** Detalhar a "Memória de Curto Prazo" do sistema, explicando a implementação da gestão de sessões de conversação e, crucialmente, das tarefas persistentes e colaborativas que transformam o sistema num verdadeiro assistente.

## 1. Visão Geral e Analogia

Se a Camada de Dados é a "biblioteca" com conhecimento de longo prazo, a Camada de Estado é a "secretária de trabalho e o sistema de gestão de casos" da nossa agência de consultoria. Ela lida com dois tipos de memória essenciais para uma interação fluida e produtiva:

1.  **Memória de Conversa (A Secretária):** Mantém o registo do diálogo atual, as notas rápidas e o contexto imediato. Permite que a conversa flua naturalmente sem que o usuário precise de se repetir.
2.  **Memória de Tarefas (O Sistema de Gestão de Casos):** Mantém o registo de processos de longa duração, o seu estado atual, os passos já concluídos e os próximos passos. Permite que o trabalho seja pausado, retomado e até mesmo transferido para outro colaborador.

Sem esta camada, o sistema seria um génio com amnésia, capaz de responder a qualquer pergunta, mas incapaz de se lembrar da pergunta anterior ou de ajudar num processo que demora mais do que uma única interação.

## 2. Componente 1: Gestão de Sessão de Conversação

### 2.1. Função

A função principal é manter o contexto de um diálogo em andamento. Os LLMs, por natureza, são *stateless* (não têm memória entre chamadas de API). Para que o agente pareça "lembrar-se" do que foi dito antes, o histórico da conversa precisa de ser explicitamente gerido e reenviado a cada nova interação.

### 2.2. Implementação Técnica

*   **Armazenamento:** **Redis**. A escolha ideal devido à sua altíssima velocidade de leitura e escrita, perfeita para o acesso de baixa latência necessário a cada turno da conversa. O Redis também possui funcionalidades úteis como a definição de um TTL (Time-To-Live) para que as memórias de sessão expirem automaticamente após um período de inatividade (ex: 24 horas).

*   **Estrutura de Dados:** Um `hash` ou uma `list` no Redis, indexada por um `session_id`.
    *   O `session_id` é gerado quando um usuário inicia uma nova conversa.
    *   A cada turno, a interação (pergunta do usuário e resposta do agente) é adicionada à estrutura.

*   **Tipos de Memória (Abstrações do LangChain):**
    *   **`ConversationBufferMemory`:** A mais simples. Armazena todas as mensagens e as anexa ao prompt a cada chamada. Pode tornar-se muito longa e cara.
    *   **`ConversationBufferWindowMemory`:** Mais prática. Armazena apenas as últimas `k` interações. É um bom equilíbrio entre contexto e controlo de custos.
    *   **`ConversationSummaryBufferMemory`:** A mais avançada. Mantém uma janela das últimas `k` interações, mas também usa um LLM em segundo plano para criar um resumo progressivo da conversa. Para diálogos longos, isto é muito mais eficiente, pois o resumo (em vez do histórico completo) é enviado como contexto.

### 2.3. Fluxo de Execução

1.  O usuário envia uma mensagem. A aplicação anexa o `session_id`.
2.  O sistema recupera o histórico da conversa do Redis usando o `session_id`.
3.  O histórico é formatado e adicionado ao prompt enviado ao Agente Orquestrador.
4.  O agente gera a resposta.
5.  A nova interação (pergunta + resposta) é guardada de volta no Redis sob o mesmo `session_id`.

## 3. Componente 2: Gestão de Tarefas Persistentes

### 3.1. Função

Esta é a funcionalidade que eleva o sistema de um "chatbot" para um "agente de trabalho". A sua função é gerir processos de negócio que são, por natureza, de longa duração e envolvem múltiplos passos e, potencialmente, múltiplos atores (humanos ou agentes).

### 3.2. Implementação Técnica

*   **Armazenamento:** **PostgreSQL**. Ao contrário da memória de sessão, o estado de uma tarefa de negócio é um dado crítico que precisa de ser armazenado de forma durável, transacional e segura. O Postgres é a escolha perfeita para isso.

*   **Estrutura de Dados (Tabela `tasks`):**
    ```sql
    CREATE TABLE tasks (
        task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_type VARCHAR(255) NOT NULL, -- ex: 'CUSTOMER_ONBOARDING', 'FRAUD_INVESTIGATION'
        current_state VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, AWAITING_INPUT, IN_PROGRESS, COMPLETED, FAILED
        state_payload JSONB, -- Um objeto JSON que armazena todos os dados recolhidos para a tarefa
        created_by VARCHAR(255),
        assigned_to VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
    *   `task_id`: O identificador único que será usado em todas as interações.
    *   `state_payload`: O coração da funcionalidade. É um campo JSON flexível que atua como o "formulário" da tarefa.
    *   `current_state`: Permite que o sistema e os usuários saibam rapidamente em que fase a tarefa se encontra.

### 3.3. Fluxo de Execução (Exemplo: Onboarding de Cliente)

1.  **Início da Tarefa:**
    *   Um usuário (ou sistema) inicia o processo. O Agente Orquestrador, reconhecendo a intenção "iniciar onboarding", cria uma nova entrada na tabela `tasks`.
    *   `task_type`: 'CUSTOMER_ONBOARDING'
    *   `state_payload`: `{"nif": null, "company_name": null, "address": null, "documents_uploaded": []}`
    *   O sistema retorna o `task_id` ao usuário: "Iniciámos o processo de onboarding com o ID `TASK-123`. Por favor, forneça o NIF da empresa."

2.  **Interação e Atualização de Estado:**
    *   **Usuário:** "O NIF é 987654321 para a tarefa `TASK-123`."
    *   **Agente:**
        1.  Lê a tarefa `TASK-123` do Postgres.
        2.  Valida o NIF.
        3.  Atualiza o `state_payload`: `UPDATE tasks SET state_payload = jsonb_set(state_payload, '{nif}', '"987654321"') WHERE task_id = 'TASK-123';`
        4.  Atualiza o estado: `UPDATE tasks SET current_state = 'AWAITING_INPUT' ...`
        5.  Responde: "NIF registado. Agora, por favor, forneça o nome da empresa."

3.  **Pausa e Retoma (Colaboração):**
    *   O primeiro usuário vai almoçar.
    *   Um segundo usuário (um colega) quer continuar. Ele pergunta: "Qual o estado da tarefa `TASK-123`?"
    *   **Agente:**
        1.  Lê a tarefa `TASK-123` do Postgres.
        2.  Analisa o `state_payload`.
        3.  Responde: "A tarefa de onboarding para o NIF 987654321 está pendente. Já temos o NIF, mas ainda falta o nome da empresa e o endereço. Por favor, forneça o nome da empresa para continuar."

4.  **Conclusão:**
    *   Quando todos os campos do `state_payload` estiverem preenchidos e validados, o agente pode mudar o `current_state` para `COMPLETED` e acionar a próxima ação de negócio (ex: chamar a API de criação de cliente no Core Banking).

## 4. Sinergia e Impacto na Arquitetura

A Camada de Estado está profundamente interligada com as outras:
*   **Orquestração (Camada 1):** O Agente Orquestrador precisa de ser instruído a reconhecer quando uma pergunta faz parte de uma tarefa existente (pela presença de um `task_id`) e a carregar o estado antes de planear a sua ação.
*   **Protocolos (Camada 6):** A especificação do MCP deve incluir campos para `session_id` e `task_id` para permitir que agentes externos também participem em conversas e tarefas de longa duração.
*   **Governança (Camada 8):** Todas as atualizações na tabela `tasks` devem gerar logs de auditoria detalhados, criando um registo imutável de todo o processo de negócio, o que é vital para a conformidade.

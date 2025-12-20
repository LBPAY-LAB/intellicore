# SuperCore - A Biblioteca de Objetos

## 1. Conceito: A Caixa de Ferramentas do SuperCore

A **Biblioteca de Objetos** é o arsenal de componentes reutilizáveis do SuperCore. Se o Oráculo é o cérebro, a Biblioteca de Objetos é o corpo — um conjunto de "blocos de construção" (como Legos) que podem ser combinados de infinitas maneiras para criar soluções de negócio completas.

Cada objeto na biblioteca é um componente de software totalmente funcional, gerado pelo Assistente de IA com base no conhecimento do Oráculo. A biblioteca não contém apenas código, mas **soluções encapsuladas** para problemas específicos.

## 2. O Processo de Geração: Do Pedido à Realidade

Um objeto nasce de uma simples conversa com o Assistente de IA:

1.  **Pedido em Linguagem Natural:** O usuário descreve a necessidade. Ex: "Preciso de um fluxo de trabalho para pagamentos PIX com QR Code."
2.  **Consulta ao Oráculo:** O Assistente pergunta ao Oráculo: "Quais são os passos, validações e integrações necessárias para um pagamento PIX via QR Code, de acordo com as normas do BACEN?"
3.  **Geração Multi-Facetada:** Com a resposta do Oráculo, o Assistente gera **todos os objetos necessários** para a solução:
    *   **Entidade de Dados:** O objeto `PixPayment` com todos os campos requeridos.
    *   **Integração:** O objeto `TigerBeetleIntegration` para registrar a transação no ledger.
    *   **Workflow:** O objeto `PixPaymentFlow` em formato JSON para o LangFlow, orquestrando os passos.
    *   **Agente:** O `PixPaymentAgent` que executa o workflow.
4.  **Catalogação:** Os novos objetos são adicionados à Biblioteca, prontos para serem reutilizados.

## 3. Os Cinco Tipos de Objetos Fundamentais

A biblioteca é organizada em cinco categorias principais:

| Tipo de Objeto | Descrição | Exemplo Prático (Core Banking) |
| :--- | :--- | :--- |
| **Entidades de Dados** | Estruturas de dados que representam os conceitos do negócio. São a base do sistema. | Um objeto `Account` gerado com os campos `account_id`, `user_id`, `balance`, `status`, etc., como um modelo Pydantic e uma tabela SQL. |
| **Integrações** | Conectores que encapsulam a lógica de comunicação com sistemas externos (APIs, bancos de dados, etc.). | Um objeto `BacenApiIntegration` que sabe como consultar o DICT para validar uma chave PIX, tratando autenticação e erros. |
| **Componentes de UI** | Peças de interface de usuário (frontend) que podem ser montadas para criar telas e portais. | Um objeto `RegistrationForm` em Next.js que já contém os campos e validações para cadastro de um cliente PF, conforme o Oráculo. |
| **Workflows** | A lógica de negócio orquestrada. Define a sequência de passos para completar uma tarefa. | Um objeto `OnboardingWorkflow` (JSON para LangFlow) que define o fluxo: receber dados -> validar no DICT -> criar conta no TigerBeetle -> notificar cliente. |
| **Agentes** | Trabalhadores de IA autônomos que utilizam outros objetos para executar tarefas complexas. | Um `OnboardingAgent` que recebe os dados de um novo cliente e utiliza os objetos `RegistrationForm`, `BacenApiIntegration` e `OnboardingWorkflow` para executar o cadastro de ponta a ponta. |

## 4. A Biblioteca em Ação: Flexibilidade e Reutilização

A verdadeira potência da Biblioteca de Objetos está na sua flexibilidade. Diferentes casos de uso exigem diferentes combinações de objetos:

-   **Caso de Uso 1: Processamento de Pagamentos em Lote (Backend-only)**
    *   **Objetos Utilizados:** `Data Entity (PaymentInstruction)`, `Integration (TigerBeetle)`, `Workflow (BatchPaymentFlow)`, `Agent (PaymentProcessorAgent)`.
    *   **Resultado:** Um processo 100% backend, sem interface de usuário, que processa um arquivo de pagamentos de forma assíncrona.

-   **Caso de Uso 2: Abertura de Conta Digital (Portal do Cliente)**
    *   **Objetos Utilizados:** `UI Component (OnboardingForm)`, `Data Entity (Customer)`, `Integration (BacenAPI)`, `Workflow (OnboardingFlow)`, `Agent (OnboardingAgent)`.
    *   **Resultado:** Um portal web completo onde o cliente pode se cadastrar, com toda a lógica de validação e criação de conta sendo executada no backend.

## 5. O Crescimento da Biblioteca

A Biblioteca de Objetos é um organismo vivo. A cada novo projeto, a cada nova funcionalidade, mais objetos são criados e catalogados. Isso cria um ciclo virtuoso que alimenta o **Crescimento Exponencial**: quanto mais objetos a biblioteca possui, mais rápido e fácil se torna criar novas soluções, pois a maior parte do trabalho já está pronta, testada e validada pelo Oráculo.

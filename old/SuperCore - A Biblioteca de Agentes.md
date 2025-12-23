# SuperCore - A Biblioteca de Agentes

## 1. Conceito: A Força de Trabalho Autônoma do SuperCore

Se os Objetos são as ferramentas, os **Agentes** são os artesãos. Um Agente no SuperCore é uma **entidade de IA autônoma** com um propósito claro, equipada com as ferramentas (Objetos) necessárias para cumprir sua missão. Eles são a força de trabalho que executa os processos de negócio, orquestrando a utilização dos objetos da biblioteca para alcançar resultados complexos.

Enquanto um Objeto é uma capacidade encapsulada (ex: "conectar ao TigerBeetle"), um Agente é um papel definido (ex: "o responsável por garantir a conformidade de todas as transações").

## 2. A Anatomia de um Agente

Cada Agente na biblioteca é definido por três pilares, gerados através de uma conversa com o Assistente de IA, que consulta o Oráculo para garantir que o papel e as responsabilidades do Agente estejam alinhados com as necessidades do negócio e as regulações.

| Pilar | Descrição | Exemplo: `ComplianceAgent` |
| :--- | :--- | :--- |
| **Papel (Role)** | A identidade e o objetivo principal do Agente. É a sua "profissão". | "Você é um Agente de Compliance especialista em regulações do BACEN para Instituições de Pagamento." |
| **Responsabilidades (Responsibilities)** | As tarefas e deveres específicos que o Agente deve executar. É a sua "descrição de cargo". | "Sua responsabilidade é monitorar todas as transações, identificar atividades suspeitas de lavagem de dinheiro (PLD), e gerar relatórios para o COAF." |
| **Ferramentas (Tools)** | O conjunto de **Objetos** da biblioteca que o Agente tem permissão para usar. É a sua "caixa de ferramentas". | `TransactionDataEntity`, `CustomerDataEntity`, `PldRiskAnalysisWorkflow`, `CoafReportIntegration`. |

## 3. O Processo de Criação e Orquestração

1.  **Definição via Assistente:** O usuário descreve a necessidade de um novo papel. Ex: "Preciso de um agente para gerenciar o onboarding de novos clientes PJ."
2.  **Consulta ao Oráculo:** O Assistente pergunta ao Oráculo: "Quais são as responsabilidades e ferramentas necessárias para um processo de onboarding de cliente PJ, incluindo validação de sócios, documentos da empresa e análise de risco?"
3.  **Geração do Agente:** O Assistente define o `OnboardingAgentPJ` com seu papel, responsabilidades e a lista de Objetos que ele pode usar (ex: `CompanyDataEntity`, `PartnerValidationIntegration`, `OnboardingPJWorkflow`).
4.  **Execução pela Orquestração:** Uma vez definido, o Agente é entregue à camada de orquestração (como **CrewAI** ou **LangGraph**). Quando uma nova solicitação de onboarding PJ chega (via MCP, por exemplo), a camada de orquestração ativa o `OnboardingAgentPJ`, que começa a trabalhar, utilizando suas ferramentas (Objetos) para executar o workflow passo a passo.

## 4. A Biblioteca de Agentes em Ação: Colaboração e Especialização

A verdadeira magia acontece quando múltiplos Agentes colaboram, cada um na sua especialidade, formando um "time" de IA.

**Exemplo de Fluxo: Pagamento PIX Contestato**

1.  **`CustomerSupportAgent`:** Recebe a contestação do cliente via portal (através de um MCP). Ele usa o `TicketObject` para registrar o caso.
2.  **`TransactionAnalysisAgent`:** É notificado pelo `CustomerSupportAgent`. Ele usa suas ferramentas (`TransactionDataEntity`, `TigerBeetleIntegration`) para investigar a transação original.
3.  **`ComplianceAgent`:** É consultado pelo `TransactionAnalysisAgent` para verificar se a transação tem algum indicador de fraude, usando seu `FraudDetectionWorkflow`.
4.  **`ResolutionAgent`:** Com base na análise dos outros agentes, ele toma uma decisão. Se for fraude, ele usa o `RefundObject` para iniciar o estorno e o `NotificationObject` para comunicar o cliente.

Este time de agentes, orquestrado pelo CrewAI, resolve um problema complexo de forma autônoma, cada um contribuindo com sua especialidade.

## 5. Evolução da Biblioteca de Agentes

Assim como a Biblioteca de Objetos, a Biblioteca de Agentes cresce a cada novo desafio. No início, você pode ter apenas alguns agentes genéricos. Com o tempo, você terá um exército de especialistas:

-   `ForeignExchangeAgent`
-   `CreditAnalysisAgent`
-   `InvestmentPortfolioAgent`
-   `DataPrivacyAgent (LGPD)`

Este crescimento é um pilar fundamental do **Crescimento Exponencial**. A criação de um novo produto ou fluxo de negócio se torna uma questão de montar um novo time de agentes a partir da biblioteca existente, em vez de começar do zero. A complexidade é gerenciada pela especialização e colaboração dos agentes, tornando o sistema cada vez mais inteligente e capaz.

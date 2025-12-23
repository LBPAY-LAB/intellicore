# SuperCore - MCPs como Interface Universal

## 1. O Problema: A Rigidez das APIs Tradicionais

Na arquitetura de software tradicional, a comunicação entre o frontend (portais web, aplicativos móveis) e o backend é feita através de APIs REST ou GraphQL. Essa abordagem, embora funcional, cria um **acoplamento rígido** entre a interface do usuário e a lógica de negócio.

-   **Mudar uma tela exige mudar o backend:** Se um novo campo é adicionado a um formulário no portal, o endpoint da API no backend precisa ser modificado, testado e implantado.
-   **BFFs (Backend for Frontend) como paliativo:** A criação de BFFs tenta resolver isso, mas acaba gerando mais uma camada de código para manter, e o acoplamento apenas muda de lugar.
-   **Comunicação síncrona e frágil:** A natureza requisição-resposta do HTTP/REST não é ideal para processos de negócio complexos e assíncronos.

O SuperCore adota uma abordagem fundamentalmente diferente, utilizando os **Message Context Protocols (MCPs)** como a espinha dorsal da comunicação.

## 2. A Solução: MCP como Contrato Semântico

O MCP não é apenas um protocolo de transporte; é um **contrato semântico** que desacopla completamente o "o quê" (a intenção do usuário) do "como" (a execução no backend). Em vez de chamar um endpoint específico como `POST /api/v1/users`, o portal simplesmente emite uma mensagem MCP que descreve a intenção.

**A comunicação deixa de ser imperativa ("execute esta função") e passa a ser declarativa ("esta é a intenção do usuário").**

### Arquitetura de Comunicação

```mermaid
graph TD
    subgraph Portal (Next.js)
        A[Tela de Cadastro PF] -->|1. Usuário preenche formulário| B(Botão "Cadastrar")
    end

    subgraph Camada de Comunicação
        B -->|2. Dispara Mensagem MCP| C{Broker de Mensagens (Pulsar)}
    end

    subgraph Solução SuperCore (Backend)
        C -->|3. Consome a Mensagem| D[Orquestrador (CrewAI)]
        D -->|4. Ativa o Agente correto| E(OnboardingAgent)
        E -->|5. Executa o workflow| F[Bibliotecas de Objetos]
        F -->|6. Responde via MCP| C
    end

    subgraph Portal (Next.js)
        C -->|7. Recebe atualização de status| G[Atualiza a UI da Tela]
    end

    style A fill:#D6EAF8
    style G fill:#D5F5E3
```

## 3. Como Funciona na Prática

**Cenário:** Um usuário preenche o formulário de cadastro de Pessoa Física em um portal web construído em Next.js.

1.  **Portal (Frontend):** Ao clicar em "Cadastrar", o frontend **não faz uma chamada `fetch` para uma API REST**. Em vez disso, ele monta uma mensagem MCP e a publica em um tópico no broker de mensagens (ex: `mcp.onboarding.pf.request`).

    > **Exemplo de Mensagem MCP (simplificado):**
    > ```json
    > {
    >   "context": "OnboardingPF",
    >   "intent": "CreateCustomer",
    >   "payload": {
    >     "name": "João da Silva",
    >     "cpf": "123.456.789-00",
    >     ...
    >   },
    >   "metadata": {
    >     "source_portal": "customer_portal_v1",
    >     "timestamp": "2025-12-18T14:00:00Z"
    >   }
    > }
    > ```

2.  **SuperCore (Backend):** A solução gerada pelo SuperCore está "escutando" este tópico. O orquestrador (CrewAI/LangGraph) recebe a mensagem. Ele não se importa de onde a mensagem veio (web, mobile, outro sistema). Ele apenas entende o **contexto** (`OnboardingPF`) e a **intenção** (`CreateCustomer`).

3.  **Ativação do Agente:** O orquestrador identifica que o `OnboardingAgent` é o responsável por este contexto e ativa-o, entregando o `payload` da mensagem.

4.  **Execução:** O `OnboardingAgent` executa seu workflow, utilizando os objetos da biblioteca para validar os dados, criar a conta, etc.

5.  **Resposta Assíncrona:** Durante o processo, o agente publica mensagens de volta em tópicos de resposta (ex: `mcp.onboarding.pf.status`), informando o progresso: `{"status": "VALIDATING_CPF"}`, `{"status": "CREATING_ACCOUNT"}`, `{"status": "SUCCESS", "customer_id": "xyz"}`.

6.  **Atualização da UI:** O portal está inscrito nesses tópicos de status e atualiza a interface do usuário em tempo real, sem a necessidade de polling ou requisições adicionais.

## 4. Benefícios da Arquitetura MCP-first

-   **Desacoplamento Total:** O portal e a solução SuperCore evoluem de forma independente. Você pode redesenhar completamente o portal sem tocar no backend, desde que as mensagens MCP continuem sendo enviadas corretamente.

-   **Múltiplos Portais, Uma Única Solução:** Um portal de cliente, um portal de backoffice e um aplicativo móvel podem **todos interagir com a mesma solução SuperCore**, simplesmente enviando as mesmas mensagens MCP. Não há necessidade de criar um BFF para cada um.

-   **Resiliência e Escalabilidade:** O uso de um broker de mensagens garante que nenhuma requisição seja perdida. Se o backend estiver momentaneamente sobrecarregado, as mensagens simplesmente esperam na fila.

-   **Flexibilidade de Casos de Uso:** Esta arquitetura suporta nativamente tanto os fluxos que exigem um portal (Onboarding) quanto os que são puramente backend (Processamento em Lote). Para o SuperCore, ambos são apenas fontes de mensagens MCP.

Ao adotar o MCP como a interface primária, o SuperCore transcende o paradigma cliente-servidor tradicional, criando um ecossistema de serviços distribuídos, resilientes e semanticamente ricos, onde a intenção do negócio, e não a limitação técnica, dita o fluxo da informação.

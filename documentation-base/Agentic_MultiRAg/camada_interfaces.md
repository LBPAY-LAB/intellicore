# Documento 6: A Camada de Protocolos e APIs (A Interface Federada)
**Versão:** 6.0
**Foco:** Explorar a "Interface Federada", detalhando a API para interação humana e, com a correta e definitiva profundidade, a especificação e implementação do **Model-Context Protocol (MCP) da Anthropic** como o padrão para comunicação entre o orquestrador e as ferramentas.

## 1. Visão Geral e Analogia

A Camada de Protocolos define as "portas de entrada e saída" da nossa arquitetura, com duas interfaces distintas para dois públicos distintos:

1.  **A Receção Principal (API RESTful):** Uma interface web padrão, desenhada para ser consumida por aplicações de frontend e utilizada por usuários humanos.
2.  **A Interface de Ferramentas Padrão (Model-Context Protocol - MCP da Anthropic):** O protocolo de comunicação máquina-a-máquina, padronizado pela Anthropic, que permite que um modelo de linguagem (o orquestrador) invoque ferramentas externas (os nossos agentes especialistas) de forma estruturada e fiável.

## 2. Componente 1: A API para Humanos

*   **Função:** Interface primária para interação com usuários finais via GUI.
*   **Padrão:** API RESTful.
*   **Formato de Dados:** JSON.
*   **Implementação:** **FastAPI (Python)**.

## 3. Componente 2: O Model-Context Protocol (MCP) da Anthropic

### 3.1. O que é o MCP da Anthropic?

O MCP é um **protocolo de comunicação especificado pela Anthropic para permitir que os seus modelos de linguagem (como o Claude) interajam com ferramentas e fontes de dados externas de forma segura e estruturada.** Ele define o "contrato" exato de como uma ferramenta deve ser descrita e como o modelo irá invocar essa ferramenta.

Na nossa arquitetura, o **Agente Orquestrador** (alimentado por um modelo da Anthropic) atuará como o **cliente MCP**. Cada um dos nossos **Agentes Especialistas** (`transaction_agent`, `regulatory_agent`, etc.) atuará como um **servidor MCP**, expondo as suas capacidades como "ferramentas" compatíveis com o protocolo.

### 3.2. Conceitos Principais do MCP da Anthropic

O protocolo é centrado no conceito de **Tools (Ferramentas)**. Para que o Claude (ou qualquer modelo compatível) possa usar uma ferramenta, essa ferramenta precisa de ser definida de uma forma muito específica.

1.  **Definição da Ferramenta (Tool Definition):** É um esquema JSON (JSON Schema) que descreve a ferramenta. Este esquema é enviado ao modelo como parte do prompt inicial.
    *   `name`: O nome da ferramenta (ex: `search_transactions`).
    *   `description`: Uma descrição em linguagem natural de alta qualidade sobre o que a ferramenta faz, quando deve ser usada e o que retorna. Esta descrição é **crítica** para que o modelo saiba quando invocar a ferramenta.
    *   `input_schema`: Um JSON Schema que define os parâmetros que a ferramenta aceita, os seus tipos de dados e se são obrigatórios.

2.  **Invocação da Ferramenta (Tool Invocation):**
    *   Quando o modelo decide usar uma ferramenta, ele não a executa. Em vez disso, ele gera uma estrutura de dados específica (um bloco `<tool_code>` ou similar na sua resposta) que indica o nome da ferramenta a ser chamada e os parâmetros preenchidos.
    *   Exemplo de output do modelo: `{"tool_name": "search_transactions", "parameters": {"customer_ids": ["123", "456"], "min_amount": 100000.0}}`

3.  **Execução e Resposta:**
    *   O nosso código (o `AgentExecutor` do LangChain) recebe este output, interpreta-o e executa a função de software correspondente (a implementação real da ferramenta).
    *   O resultado da execução da ferramenta é então formatado e enviado de volta ao modelo numa nova chamada, para que ele possa continuar o seu raciocínio com a nova informação.

### 3.3. Implementação de um Servidor/Ferramenta MCP

Na nossa arquitetura, cada Agente Especialista não é um "servidor" no sentido tradicional de rede, mas sim um **conjunto de funções Python que são "embrulhadas" para se tornarem compatíveis com o MCP**.

*   **Framework:** **LangChain**. O LangChain tem suporte nativo para o formato de "function calling" / "tool use" da Anthropic.
*   **Implementação:**
    1.  As capacidades de cada Agente Especialista são definidas como funções Python normais.
    2.  Estas funções são decoradas ou convertidas em ferramentas compatíveis com o LangChain, que por sua vez gera a definição JSON Schema correta para o MCP da Anthropic.

*   **Estrutura de uma Ferramenta para o `regulatory_agent`:**

    ```python
    # Ficheiro: regulatory_agent_tools.py

    from langchain_core.tools import tool
    from pydantic import BaseModel, Field

    class ComplianceCheckInput(BaseModel):
        transaction_data: dict = Field(description="Dicionário com os dados da transação a ser verificada.")
        rule_id: str = Field(description="O ID da regra de compliance a ser aplicada.")

    @tool("compliance-checker", args_schema=ComplianceCheckInput)
    def check_compliance(transaction_data: dict, rule_id: str) -> dict:
        """
        Verifica se uma determinada transação está em conformidade com uma regra específica.
        Use esta ferramenta quando precisar de validar uma transação contra uma norma regulatória.
        Retorna um dicionário com o status da conformidade e detalhes.
        """
        # ... Lógica para consultar o RAG regulatório ...
        # ... Lógica de verificação ...
        result = {"compliance_status": "OK", "details": "Nenhuma violação encontrada."}
        return result
    ```

### 3.4. O Papel do Cliente MCP (Agente Orquestrador)

O **Agente Orquestrador** é o cliente. A sua implementação com LangChain fará o seguinte:

1.  **Agregação de Ferramentas:** No início da execução, ele recolhe as definições de todas as ferramentas disponíveis de todos os Agentes Especialistas.
2.  **Chamada ao Modelo:** Ele envia a pergunta do usuário e a lista de definições de ferramentas para o modelo da Anthropic.
3.  **Interpretação da Resposta:** Ele analisa a resposta do modelo. Se a resposta contiver um pedido de invocação de ferramenta, o LangChain `AgentExecutor` irá:
    a. Identificar qual ferramenta foi solicitada.
    b. Chamar a função Python correspondente com os parâmetros fornecidos pelo modelo.
4.  **Loop de Execução:** O resultado da ferramenta é enviado de volta ao modelo para o próximo passo de raciocínio, continuando o ciclo até que uma resposta final seja gerada.

Esta abordagem, utilizando o padrão MCP real da Anthropic, garante que a nossa arquitetura é totalmente compatível com as melhores práticas da indústria para o uso de ferramentas por modelos de linguagem avançados.

---

### **`doc_10_software_architecture_document.md` (Versão 4.0 - Final e Corrigida)**

*Nesta versão, apenas a secção da Camada 6 e a sua justificativa serão alteradas para refletir a nova e correta informação.*

```markdown
# Documento 10: Documento de Arquitetura de Software (SAD)
**Versão:** 4.0 (Final e Corrigida)
...
## 2. Detalhe da Stack por Camada
...
| Camada | Componente | Tecnologia Principal | Especificação / Versão |
|:---|:---|:---|:---|
...
| **6. Protocolos (Interface)** | **Protocolo de Ferramentas** | **Model-Context Protocol (MCP) da Anthropic** | Conforme especificação da Anthropic |
| | Implementação das Ferramentas | **LangChain (Python)** com Pydantic | LangChain >= 0.1.0 |
| | API para Humanos | **FastAPI (Python)** | >= 0.100.0 |
...

## 3. Detalhes de Implementação por Componente
...
### 3.2. Camada 6: Protocolos (Interface)

*   **Protocolo de Ferramentas:** A comunicação entre o Agente Orquestrador (cliente) e os Agentes Especialistas (ferramentas) seguirá estritamente o **Model-Context Protocol (MCP) da Anthropic**. Este é o padrão que o modelo Claude usa para "function calling" ou "tool use".
*   **Implementação das Ferramentas:** As capacidades de cada agente especialista serão implementadas como funções Python. O framework **LangChain** será utilizado para "embrulhar" estas funções, adicionando descrições e esquemas de input (usando Pydantic) para gerar as definições de ferramentas (JSON Schema) que são compatíveis com o MCP da Anthropic. O `AgentExecutor` do LangChain será responsável por gerir o ciclo de invocação da ferramenta e resposta ao modelo.
*   **API para Humanos:** A interface para usuários finais continuará a ser uma API RESTful padrão, construída com **FastAPI**, pela sua performance e facilidade de uso.
...

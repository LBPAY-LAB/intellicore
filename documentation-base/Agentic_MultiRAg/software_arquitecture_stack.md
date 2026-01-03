# Documento 10: Documento de Arquitetura de Software (SAD)
**Versão:** 5.0 (Final e Consolidada)
**Foco:** Apresentar uma visão holística e detalhada da arquitetura de software e da stack tecnológica para a implementação do Sistema de IA Cognitivo. Este documento consolida as decisões dos 9 documentos conceituais anteriores num blueprint de engenharia prescritivo.

## 1. Tabela Resumo da Stack Tecnológica

| Camada | Componente Principal | Tecnologia Chave | Foco / Propósito |
|:---|:---|:---|:---|
| **1. Orquestração** | Agente Orquestrador | **LangChain (Python)** | Lógica de Raciocínio-Ação (ReAct), planeamento e delegação. |
| **2. Dados** | Armazenamento de Conhecimento | **PostgreSQL + PGVector, NebulaGraph** | Persistência poliglota: Relacional, Vetorial e de Grafo. |
| **3. Estado** | Memória de Curto Prazo | **Redis, PostgreSQL** | Gestão de sessões de conversação e tarefas de negócio persistentes. |
| **4. Inteligência** | Inferência de LLMs | **vLLM (Prod), Ollama (Dev), LiteLLM** | Execução de modelos de IA com estratégia híbrida (local + nuvem). |
| **5. Roteamento** | Otimização de Consultas | **LangChain RouterChains** | Classificação de intenção para bypass de LLM em tarefas simples. |
| **6. Protocolos** | Comunicação de Agentes | **MCP da Anthropic, FastAPI** | Padrão para uso de ferramentas (MCP) e API REST para humanos. |
| **7. Pipelines** | Operações de Dados e IA | **Dagster, Apache Flink, Unstructured.io** | Orquestração de ingestão (batch/stream), avaliação e CI/CD. |
| **8. Governança** | Observabilidade | **OpenTelemetry, Prometheus, Grafana, Loki, Jaeger** | Monitorização, logging e tracing de ponta a ponta. |
| **9. Otimização** | Inteligência de Dados | **spaCy, LLM (via API), PostgreSQL** | Enriquecimento de dados com metadados, tags e regras de negócio. |

---

## 2. Detalhe da Stack por Camada

### 2.1. Camada 1: Orquestração (O Cérebro)

*   **Componente:** Serviço do Agente Orquestrador.
*   **Tecnologia Principal:** **LangChain (Python)**.
*   **Justificativa:** O LangChain é o framework de facto para a construção de aplicações de IA complexas. O seu `AgentExecutor` implementa nativamente o ciclo de Raciocínio-Ação (ReAct), que é essencial para o Orquestrador. A LangChain Expression Language (LCEL) será usada para construir as cadeias de processamento de forma declarativa e robusta, facilitando a composição e a depuração.

### 2.2. Camada 2: Dados (A Memória de Longo Prazo)

*   **Componentes:** Cluster de Base de Dados Primária e Cluster de Base de Dados de Grafo.
*   **Tecnologias:**
    1.  **PostgreSQL (>= 16.0)** com a extensão **PGVector (>= 0.5.0)**.
    2.  **NebulaGraph (>= 3.0.0)**.
*   **Justificativa:** A arquitetura adota uma abordagem de "persistência poliglota". O **PostgreSQL** com **PGVector** oferece uma solução otimizada e unificada para dados relacionais e vetoriais, simplificando a infraestrutura. Um índice **HNSW** será utilizado na coluna de vetores para buscas de alta performance. O **NebulaGraph** é escolhido pela sua arquitetura distribuída "shared-nothing", que garante a escalabilidade horizontal necessária para modelar os complexos relacionamentos do domínio financeiro.

### 2.3. Camada 3: Estado (A Memória de Curto Prazo)

*   **Componentes:** Cache de Sessão e Armazenamento de Tarefas.
*   **Tecnologias:**
    1.  **Redis (>= 7.0)**.
    2.  **PostgreSQL (>= 16.0)**.
*   **Justificativa:** A separação das responsabilidades de memória é crucial. O **Redis** garante a latência de sub-milissegundos necessária para a gestão de sessões de conversação. O **PostgreSQL** fornece a durabilidade e as garantias transacionais (ACID) indispensáveis para armazenar o estado de tarefas de negócio críticas e de longa duração, utilizando o tipo de dados `JSONB` para flexibilidade.

### 2.4. Camada 4: Inteligência (A Capacidade de Raciocínio)

*   **Componentes:** Servidores de Inferência, Gateway de LLMs, Serviço de Embedding.
*   **Tecnologias:**
    1.  **Ollama** (para desenvolvimento).
    2.  **vLLM** (para produção).
    3.  **LiteLLM (>= 1.15.0)**.
    4.  **Sentence-Transformers** servido via **FastAPI**.
*   **Justificativa:** Esta stack implementa a nossa estratégia híbrida. A distinção **Ollama (Dev) vs. vLLM (Prod)** otimiza para um ciclo de desenvolvimento rápido e uma produção de alta performance. O **LiteLLM** atua como uma camada de abstração indispensável, desacoplando a lógica da aplicação da implementação dos modelos e gerindo centralmente o roteamento e o fallback. Um **serviço de embedding dedicado** garante a consistência da vetorização em todo o sistema.

### 2.5. Camada 5: Roteamento (O Otimizador)

*   **Componente:** Lógica de Roteamento dentro do Serviço do Agente Orquestrador.
*   **Tecnologia Principal:** **LangChain RouterChains**.
*   **Justificativa:** Utilizar os componentes padrão do **LangChain** para roteamento simplifica o desenvolvimento. A `RouterChain` permite definir as rotas (ex: "Rota Direta" para bypass de LLM vs. "Rota Cognitiva") e usar um LLM classificador rápido para tomar a decisão, mantendo a lógica dentro do mesmo framework.

### 2.6. Camada 6: Protocolos (A Interface Federada)

*   **Componentes:** Protocolo de Ferramentas, Implementação das Ferramentas, API para Humanos.
*   **Tecnologias:**
    1.  **Model-Context Protocol (MCP) da Anthropic**.
    2.  **LangChain (Python)** com **Pydantic**.
    3.  **FastAPI (Python) (>= 0.100.0)**.
*   **Justificativa:** A comunicação entre o Agente Orquestrador e as ferramentas seguirá estritamente o **MCP da Anthropic**, garantindo compatibilidade com modelos de ponta. O **LangChain** será usado para "embrulhar" as funções Python dos nossos agentes especialistas, gerando as definições de ferramentas (JSON Schema via Pydantic) compatíveis com o MCP. A interface para usuários humanos será uma API RESTful padrão construída com **FastAPI**.

### 2.7. Camada 7: Pipelines (O Motor de Operações)

*   **Componentes:** Orquestrador de Pipelines, Processadores de Stream/Batch.
*   **Tecnologias:**
    1.  **Dagster (>= 1.5.0)**.
    2.  **Apache Flink (>= 1.17)**.
    3.  **Unstructured.io** e **Polars (>= 0.19.0)**.
*   **Justificativa:** O **Dagster** é escolhido pela sua filosofia "asset-centric", ideal para gerir ativos de IA. O **Apache Flink** é a escolha para o processamento de streaming do Pulsar devido à sua performance e garantias "exactly-once". O **Unstructured.io** e o **Polars** são as ferramentas de ponta para extração e manipulação de dados em batch, respetivamente.

### 2.8. Camada 8: Governança (O Supervisor)

*   **Componentes:** Padrão de Instrumentação e Backend de Observabilidade.
*   **Tecnologias:**
    1.  **OpenTelemetry**.
    2.  **Prometheus** (Métricas), **Loki** (Logs), **Jaeger** (Traços), **Grafana** (Dashboards).
*   **Justificativa:** A adoção do **OpenTelemetry** como padrão de instrumentação garante uma cobertura completa e agnóstica ao fornecedor. A stack **Prometheus/Loki/Jaeger/Grafana (PLG Stack)** é a escolha open-source padrão da indústria para uma observabilidade de nível empresarial, oferecendo uma profundidade de diagnóstico inigualável.

### 2.9. Camada 9: Otimização (A Inteligência de Dados)

*   **Componentes:** Serviços e Tarefas de Enriquecimento integrados nos Pipelines.
*   **Tecnologias:**
    1.  **spaCy** e **LLM (via LiteLLM Gateway)**.
    2.  **PostgreSQL**.
*   **Justificativa:** O enriquecimento é implementado como passos dentro dos pipelines do **Dagster**. A abordagem dupla para extração de entidades, usando **spaCy** para entidades comuns e um **LLM** para conceitos de negócio abstratos, otimiza para velocidade e precisão. O **PostgreSQL** é reutilizado para armazenar as tabelas de conhecimento auxiliar (glossário, etc.), consolidando a infraestrutura de dados de suporte.

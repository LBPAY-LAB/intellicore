# Documento 8: A Camada de Governança e Observabilidade (O Supervisor)
**Versão:** 4.0
**Foco:** Cobre o "Supervisor", detalhando a implementação de uma stack de observabilidade completa para monitorização, logging, tracing e a importância da governança de prompts e da auditoria.

## 1. Visão Geral e Analogia

A Camada de Governança é o "departamento de controlo de qualidade, segurança e conformidade" da nossa agência de consultoria. Nenhuma agência de elite pode operar sem uma supervisão rigorosa. Esta camada não participa na execução das tarefas, mas sim **observa tudo**, garantindo que:

*   **Tudo está a funcionar corretamente:** Monitoriza a saúde e a performance de todos os componentes.
*   **Os erros são detetados e diagnosticados rapidamente:** Fornece as ferramentas para "rebobinar a fita" e entender o que correu mal.
*   **Os processos são auditáveis:** Mantém um registo imutável de todas as ações para conformidade regulatória.
*   **A qualidade é consistente:** Gere e versiona os "manuais de procedimento" (prompts) para garantir que todos os analistas seguem as melhores práticas.

Num sistema de IA complexo e distribuído, a observabilidade não é um luxo; é uma necessidade absoluta para a operação, depuração e otimização.

## 2. O Pilar: Instrumentação com OpenTelemetry

Em vez de usar ferramentas de monitorização proprietárias e diferentes para cada componente, a abordagem moderna é usar um **padrão de instrumentação aberto**.

*   **Tecnologia Principal:** **OpenTelemetry (OTel)**.
*   **O que é?** É um conjunto de APIs, SDKs e ferramentas para gerar, coletar e exportar dados de telemetria (métricas, logs e traços) de uma aplicação. É um padrão da indústria, mantido pela Cloud Native Computing Foundation (CNCF).
*   **Como funciona?** Você instrumenta o seu código Python (em cada agente, pipeline e API) usando as bibliotecas do OpenTelemetry. Por exemplo, bibliotecas populares como FastAPI, LangChain e Requests têm integrações automáticas com o OTel.
*   **Vantagem Principal:** Uma vez que o seu código está instrumentado com OTel, você pode configurar um "exportador" para enviar estes dados de telemetria para **qualquer backend de observabilidade** da sua escolha, seja uma stack open-source ou uma solução comercial, sem alterar uma única linha do seu código de aplicação. Isto evita o "vendor lock-in".

## 3. Os Três Pilares da Observabilidade (A Stack de Backend)

Os dados de telemetria gerados pelo OpenTelemetry são enviados para uma stack de ferramentas especializadas, cada uma focada num tipo de dado. A recomendação é uma stack open-source poderosa e amplamente adotada.

### 3.1. Métricas (Prometheus)

*   **Função:** Monitorizar a saúde e a performance do sistema através de dados numéricos agregados ao longo do tempo.
*   **Métricas a Coletar:**
    *   **Métricas de API:** Latência das requisições, número de requisições por segundo (QPS), contagem de erros (HTTP 5xx).
    *   **Métricas de LLM (do LiteLLM):** Custo por chamada, tokens por segundo, latência da inferência por modelo.
    *   **Métricas de Pipeline (do Dagster):** Duração da execução do pipeline, número de ativos materializados, taxas de sucesso/falha.
    *   **Métricas de Hardware:** Uso de CPU, uso de memória, e crucialmente, **uso de GPU e memória de GPU** nos servidores de inferência.
*   **Alertas:** O Prometheus integra-se com o **Alertmanager** para enviar notificações (via Slack, PagerDuty, etc.) quando uma métrica cruza um limiar crítico (ex: "A latência da API p99 excedeu 5 segundos" ou "A GPU está a 95% de utilização há mais de 10 minutos").

### 3.2. Logs (Loki)

*   **Função:** Fornecer um registo detalhado e contextual de eventos que ocorreram. Logs são essenciais para a depuração.
*   **Boas Práticas de Logging:**
    *   **Logging Estruturado:** Os logs devem ser emitidos em formato JSON, não como strings de texto simples. Isto permite que sejam facilmente pesquisados e filtrados.
        ```json
        {"timestamp": "...", "level": "INFO", "service": "regulatory_agent", "task_id": "TASK-123", "message": "Verificação de conformidade iniciada."}
        ```
    *   **Níveis de Log:** Usar os níveis de log apropriados (DEBUG, INFO, WARNING, ERROR, CRITICAL).
    *   **Regra do MCP:** Como mencionado no Documento 6, em servidores MCP que usam STDIO, o logging **DEVE** ser direcionado para `stderr` ou para um ficheiro, nunca para `stdout`.
*   **Loki:** É um sistema de agregação de logs inspirado no Prometheus. É altamente eficiente e otimizado para pesquisar logs com base nos seus metadados (labels), como `service`, `level`, etc.

### 3.3. Traços (Jaeger)

*   **Função:** O pilar mais importante para depurar sistemas distribuídos. Um "traço" (trace) visualiza o ciclo de vida completo de uma única requisição à medida que ela passa por múltiplos serviços (camadas).
*   **Como funciona?**
    1.  Quando uma requisição entra no sistema (na API FastAPI), o OpenTelemetry gera um `trace_id` único.
    2.  Este `trace_id` é propagado automaticamente em cada chamada subsequente para outros serviços (Agente Orquestrador -> LiteLLM -> Agente Especialista -> Base de Dados).
    3.  Cada serviço cria os seus próprios "spans" (intervalos de tempo) que representam o trabalho que realizou, todos associados ao mesmo `trace_id`.
*   **Visualização (Jaeger):** A interface do Jaeger mostra um diagrama de Gantt de toda a requisição. Você pode ver instantaneamente:
    *   Quanto tempo a requisição passou em cada camada.
    *   Qual chamada de agente foi a mais lenta.
    *   Se as chamadas foram feitas em série ou em paralelo.
    *   Onde ocorreu um erro na cadeia de chamadas.
*   **Impacto:** Para uma pergunta complexa que demora 15 segundos a ser respondida, o tracing é a única maneira de diagnosticar rapidamente se o gargalo está na busca vetorial, na inferência do LLM ou na consulta ao grafo.

### 3.4. Dashboards (Grafana)

*   **Função:** A "sala de controlo" que unifica a visualização de todos os dados de observabilidade.
*   **Capacidades:** O Grafana pode conectar-se simultaneamente ao Prometheus (para gráficos de métricas), ao Loki (para explorar logs) e ao Jaeger (para visualizar traços).
*   **Dashboards a Criar:**
    *   **Dashboard de Saúde Geral:** Visão de alto nível com as métricas mais importantes de todos os serviços.
    *   **Dashboard de Performance de LLMs:** Detalhes sobre o custo, latência e uso de cada modelo.
    *   **Dashboard de Ingestão de Dados:** Monitorização da saúde e do volume de dados processados pelos pipelines.

## 4. Governança de Prompts e Auditoria

Além da observabilidade técnica, esta camada também lida com a governança do comportamento da IA.

*   **Gestão de Prompts:**
    *   **Problema:** Os prompts, especialmente o do Agente Orquestrador, são peças de código tão críticas como o software. Alterá-los pode mudar drasticamente o comportamento do sistema.
    *   **Solução:** Os prompts não devem estar "hardcoded" no código. Eles devem ser geridos num sistema de controlo de versões (como o Git) e carregados dinamicamente pela aplicação. Ferramentas como o **LangSmith** (da LangChain) ou outras plataformas de "LLMOps" oferecem funcionalidades para versionar, testar e fazer o deploy de prompts de forma controlada.

*   **Auditoria:**
    *   **Função:** Manter um registo imutável de interações e decisões para conformidade regulatória.
    *   **Implementação:**
        1.  A tabela `tasks` (Documento 3) já serve como uma trilha de auditoria para processos de negócio.
        2.  Os logs estruturados enviados para o Loki devem conter identificadores de correlação (`trace_id`, `user_id`, `task_id`) que permitem reconstruir todo o contexto de uma decisão.
        3.  Estes logs podem ser arquivados a longo prazo em sistemas de armazenamento mais baratos (como o S3) para cumprir os requisitos de retenção de dados.

Ao implementar esta camada de forma robusta, você ganha a confiança necessária para operar um sistema de IA complexo num ambiente de produção crítico, com a capacidade de monitorizar, depurar, otimizar e provar a sua conformidade.

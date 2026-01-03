# Documento 4: A Camada de Inteligência (A Capacidade de Raciocínio Híbrida)
**Versão:** 4.0
**Foco:** Descrever a "Capacidade de Raciocínio" do sistema, aprofundando a estratégia de LLM híbrido, o papel do Gateway de LLMs, as considerações para a escolha de modelos e a importância dos modelos de embedding.

## 1. Visão Geral e Analogia

A Camada de Inteligência é o "motor cognitivo" da nossa agência de consultoria. Ela fornece a capacidade bruta de entender a linguagem, raciocinar, fazer inferências e gerar texto. No entanto, uma agência de elite não depende de um único tipo de "pensador". Ela possui uma equipa diversificada:

1.  **A Equipa Interna (Modelos Self-Hosted):** Um grupo de analistas internos, confiáveis e sempre disponíveis, que lidam com a maioria do trabalho do dia-a-dia, garantindo que a informação sensível nunca saia do escritório.
2.  **Consultores Externos de Elite (Modelos de Nuvem):** Especialistas de renome mundial, contratados para problemas excecionalmente difíceis ou quando a equipa interna está sobrecarregada. São caros, mas oferecem capacidades de ponta.
3.  **O Gestor de Recursos (Gateway de LLMs):** A pessoa que decide qual tarefa vai para qual analista, otimizando para custo, velocidade e segurança.

Esta abordagem híbrida é o pilar para construir um sistema que é, ao mesmo tempo, seguro, escalável, resiliente e economicamente viável.

## 2. Componente 1: A Equipa Interna (Modelos Self-Hosted)

### 2.1. Função

A função dos modelos self-hosted é processar a grande maioria das requisições de inferência dentro do seu próprio perímetro de segurança (on-premise ou nuvem privada).

### 2.2. Vantagens

*   **Soberania e Privacidade dos Dados:** A vantagem mais crítica para o setor bancário. Nenhuma informação de cliente ou consulta sensível precisa de sair da sua infraestrutura para ser processada por um LLM.
*   **Controlo de Custos:** Após o investimento inicial em hardware (GPUs), o custo por inferência é marginal (apenas eletricidade e manutenção), em oposição ao custo por token dos modelos de nuvem. Isto torna o sistema economicamente viável em grande escala.
*   **Performance Previsível:** A latência é mais consistente, pois não depende da internet pública ou da carga nos servidores de um fornecedor externo.
*   **Customização:** Modelos open-source podem ser alvo de fine-tuning com os seus próprios dados para se tornarem especialistas no seu domínio específico (linguagem financeira, produtos do seu banco, etc.), algo que não é possível com a maioria das APIs de modelos comerciais.

### 2.3. Implementação Técnica

*   **Modelos:** Modelos de linguagem open-source de alta performance, como os da família **Llama (Meta)**, **Mixtral (Mistral AI)** ou outros disponíveis no Hugging Face.
*   **Servidor de Inferência:** É impraticável carregar um modelo para cada requisição. Um servidor de inferência otimizado é essencial.
    *   **vLLM:** A recomendação principal para produção. Utiliza técnicas como PagedAttention para aumentar drasticamente o *throughput* (requisições por segundo) e permitir o processamento de batches de forma eficiente.
    *   **Ollama:** Excelente para desenvolvimento e prototipagem devido à sua extrema facilidade de uso. Pode também servir para produção em menor escala.
    *   Ambos expõem uma API compatível com a da OpenAI, o que é crucial para a integração com o Gateway.

## 3. Componente 2: Consultores Externos (Modelos de Nuvem)

### 3.1. Função

Os modelos de nuvem servem como um recurso estratégico, não como a opção padrão.

### 3.2. Casos de Uso

1.  **Fallback de Alta Disponibilidade:** Se a sua infraestrutura de servidores self-hosted falhar ou ficar sobrecarregada, o sistema automaticamente (via Gateway) encaminha as requisições para um modelo de nuvem, garantindo 100% de tempo de atividade para a aplicação.
2.  **Raciocínio de Ponta (State-of-the-Art):** Para o Agente Orquestrador, que lida com o planeamento e a decomposição de problemas muito complexos, pode ser benéfico usar o modelo comercial mais potente do mercado (ex: GPT-4, Claude 3 Opus). A qualidade superior do seu raciocínio pode justificar o custo e o risco de enviar a consulta (anonimizada) para a nuvem.
3.  **Benchmarking:** Permite comparar constantemente a performance dos seus modelos internos com os melhores do mercado, ajudando a decidir quando é hora de atualizar ou fazer fine-tuning.

### 3.3. Provedores

*   **OpenAI (GPT-4, GPT-3.5-Turbo)**
*   **Anthropic (Claude 3 Opus, Sonnet, Haiku)**
*   **Google (Gemini 1.5 Pro, Flash)**

## 4. Componente 3: O Gestor de Recursos (Gateway de LLMs)

### 4.1. Função

O Gateway de LLMs é um proxy inteligente que fica entre a sua aplicação (a Camada de Orquestração) e os diferentes provedores de LLMs. Ele abstrai a complexidade da arquitetura híbrida.

### 4.2. Implementação Técnica

*   **Tecnologia Principal:** **LiteLLM**. É uma ferramenta open-source desenhada exatamente para este propósito.

### 4.3. Funcionalidades Chave do LiteLLM

*   **API Unificada:** A sua aplicação faz sempre uma chamada no formato padrão da OpenAI. O LiteLLM traduz essa chamada para o formato específico do modelo de destino (seja o seu vLLM, Anthropic, Google, etc.).
*   **Roteamento e Fallback:** A funcionalidade mais importante. Você pode definir uma configuração que diz:
    ```yaml
    # Exemplo de configuração do LiteLLM
    router_settings:
      routing_strategy: order
    
    deployment_list:
      - deployment_name: primary-agent-logic
        models: ["vllm/llama3", "openai/gpt-4"] # Tenta o vLLM primeiro, se falhar, usa o GPT-4.
    ```
*   **Balanceamento de Carga:** Se você tiver múltiplos servidores vLLM, o LiteLLM pode distribuir a carga entre eles.
*   **Controlo de Custos e Logging Centralizado:** Regista cada chamada, o número de tokens, o custo (para modelos de nuvem) e a latência, fornecendo um ponto único de observabilidade para toda a inferência de LLMs.

## 5. Componente 4: Os Modelos de Embedding

### 5.1. Função

Muitas vezes esquecidos, mas absolutamente críticos, os modelos de embedding são um tipo especial de modelo nesta camada. A sua única função é converter texto em vetores numéricos para alimentar a Camada de Dados (PGVector).

### 5.2. Considerações

*   **Consistência:** O mesmo modelo de embedding que é usado para gerar os vetores armazenados no PGVector **deve** ser usado para vetorizar as perguntas do usuário no momento da busca. Usar modelos diferentes resultará em buscas semânticas ineficazes.
*   **Escolha do Modelo:**
    *   **Modelos Open-Source (Sentence-Transformers):** A recomendação principal. Modelos como os da série `all-mpnet-base-v2` ou modelos mais recentes são excelentes e podem ser hospedados na sua própria infraestrutura (numa API simples com FastAPI), garantindo a mesma privacidade que os LLMs self-hosted. Existem também modelos especializados para o setor financeiro (ex: `finbert`).
    *   **APIs de Embedding (OpenAI, etc.):** Provedores como a OpenAI (`text-embedding-3-small`) oferecem APIs de embedding de alta performance. A sua utilização implica que o texto a ser vetorizado precisa de ser enviado para a nuvem, o que pode ser uma consideração de segurança.

*   **Fine-Tuning:** Para máxima performance, o modelo de embedding pode ser alvo de fine-tuning com os seus próprios dados para que ele aprenda a "entender" melhor a semântica específica do seu negócio e dos seus produtos.

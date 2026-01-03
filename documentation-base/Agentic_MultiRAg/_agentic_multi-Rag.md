Arquitetura Proposta: Agentic Multi-RAG para Core Banking

Postgres, Nebulagraph e PGVector


Em vez de um grande RAG, você criaria múltiplos RAGs menores e especializados, cada um focado num domínio específico do negócio. No centro de tudo, um "Agente Orquestrador" (o cérebro do sistema) direciona as consultas do usuário para o RAG (ou RAGs) correto.
Veja como os componentes se encaixariam:
Componente
Descrição
Exemplo de Dados
Agente Orquestrador
Um LLM "mestre" que recebe a pergunta do usuário em linguagem natural. A sua única função é analisar a pergunta, entender a intenção e decidir qual "agente especialista" deve ser acionado. Ele não responde diretamente à pergunta.
Recebe: "Qual foi o volume total de transações PIX para a empresa X em dezembro e quais foram as contestações de fraude associadas?"
Agente de Transações
Um agente especialista com um RAG focado exclusivamente em dados transacionais. O seu knowledge base contém o histórico de transações, logs, etc. Ele é otimizado para buscas rápidas em dados estruturados e não estruturados de transações.
RAG 1: Contém dados de milhões de transações (PIX, TED, etc.). Responde a: "volume total de transações PIX para a empresa X em dezembro".
Agente de Clientes (KYC)
Outro agente especialista cujo RAG contém toda a informação de cadastro de clientes (Pessoa Física e Jurídica), documentos, histórico de relacionamento, etc. (KYC - Know Your Customer).
RAG 2: Contém dados cadastrais. Responde a perguntas como: "O cliente Y tem o seu cadastro atualizado?".
Agente Regulatório
Um agente crucial para a sua necessidade. O seu RAG é alimentado com todas as circulares, normas e documentação do Banco Central, além de leis de compliance e anti-lavagem de dinheiro (AML).
RAG 3: Contém a documentação do Bacen. Responde a: "quais foram as contestações de fraude associadas?" (cruzando com as regras de fraude).
Agente de Produtos
Um RAG que contém informações sobre os produtos do banco: CDBs, empréstimos, taxas de juros, condições, etc.
RAG 4: Contém o portfólio de produtos. Responde a: "Quais as condições do produto de crédito Z?".
Como Funciona na Prática (Fluxo da Consulta):
Consulta do Usuário: O usuário faz uma pergunta complexa: "Mostre-me o extrato consolidado do cliente 'Empresa ABC' na última semana, destaque as transações internacionais e verifique se alguma delas viola a nova norma do Bacen sobre câmbio."
Análise do Agente Orquestrador: O agente orquestrador "lê" a pergunta e a decompõe em sub-tarefas:
"extrato consolidado do cliente 'Empresa ABC' na última semana" -> Tarefa para o Agente de Transações.
"destaque as transações internacionais" -> Sub-tarefa para o Agente de Transações.
"verifique se alguma delas viola a nova norma do Bacen sobre câmbio" -> Tarefa para o Agente Regulatório.
Execução Paralela: O orquestrador aciona os agentes especialistas necessários.
O Agente de Transações busca no seu RAG todas as transações da "Empresa ABC" na última semana.
O Agente Regulatório busca no seu RAG a "nova norma sobre câmbio".
Reflexão e Síntese: O Agente Orquestrador recebe as respostas parciais:
Resposta 1 (Transações): "Aqui está a lista de 50 transações, das quais 3 foram internacionais (USD 10k, EUR 5k, JPY 30k)."
Resposta 2 (Regulatório): "A norma XYZ do Bacen estabelece um limite de USD 8k para este tipo de operação sem documentação adicional."
Geração da Resposta Final: O orquestrador agora tem todo o contexto necessário. Ele sintetiza as informações numa resposta única e coerente para o usuário:
"Aqui está o extrato consolidado da Empresa ABC. Na última semana, foram realizadas 3 transações internacionais. A transação de USD 10.000 excede o limite de USD 8.000 da norma XYZ do Bacen e pode necessitar de documentação adicional."
Vantagens Desta Abordagem:
Performance e Escalabilidade: Cada RAG é menor e otimizado para o seu domínio. As buscas são muito mais rápidas. Você pode escalar os servidores para cada agente de forma independente (o Agente de Transações pode precisar de mais recursos que o Agente de Produtos, por exemplo).
Precisão: Um RAG especialista em regulação do Bacen dará respostas muito mais precisas sobre esse tema do que um RAG genérico que mistura dados de transações, clientes e normas.
Manutenção Simplificada: Atualizar uma norma do Bacen? Você só precisa atualizar o knowledge base do Agente Regulatório, sem tocar nos outros. Isso reduz drasticamente o risco e a complexidade.
Segurança e Controle de Acesso: Você pode implementar permissões a nível de agente. Um analista de marketing pode ter acesso ao Agente de Produtos, mas não ao Agente de Transações, por exemplo.
Flexibilidade para o Usuário: Para o usuário final, a experiência é a de um sistema único e omnisciente. Ele não precisa saber qual "RAG" está a ser consultado; ele simplesmente faz a pergunta e o sistema resolve a complexidade nos bastidores.
Esta arquitetura não afeta a funcionalidade de um "Core RAG"; ela, na verdade, a substitui por um sistema muito mais robusto, escalável e inteligente.

Excelente pergunta. Essa é a questão fundamental que eleva o sistema de um simples "roteador de perguntas" para uma verdadeira rede de conhecimento coesa e inteligente.
A resposta está em não pensar nos RAGs como silos completamente isolados, mas como nós especializados numa rede de conhecimento maior. As relações não são criadas fisicamente entre os bancos de dados vetoriais de cada RAG, mas sim de forma lógica e em tempo de execução, orquestradas pelo agente central.
Existem três níveis principais para estabelecer essas relações:
Nível 1: Relação por Chave Comum (Identificadores Globais)
Esta é a abordagem mais simples e fundamental, similar a uma chave estrangeira (foreign key) em bancos de dados relacionais.
Como funciona:
Você define identificadores únicos e globais para as entidades de negócio mais importantes. Por exemplo:
customer_id para clientes.
transaction_id para transações.
regulation_id para uma norma específica do Bacen.
Quando o Agente Orquestrador decompõe uma pergunta, ele passa esses IDs entre os agentes especialistas.
Exemplo Prático:
Pergunta: "A transação TXN-987654321 do cliente CUST-12345 está em conformidade com as regras de prevenção à lavagem de dinheiro?"
Fluxo:
O Agente Orquestrador identifica as entidades: transaction_id: TXN-987654321 e customer_id: CUST-12345.
Ele envia o transaction_id para o Agente de Transações. Este agente busca os detalhes da transação (valor, data, tipo, etc.) no seu RAG.
Paralelamente, ele envia o customer_id para o Agente de Clientes (KYC). Este agente busca o perfil de risco do cliente, seu histórico, etc.
O orquestrador recebe os dados brutos: {valor: 55.000 BRL, tipo: TED} e {perfil_risco: 'Alto', histórico: 'Nenhuma atividade suspeita'}.
Agora, o orquestrador combina essa informação e a envia para o Agente Regulatório, perguntando: "Uma transação de 55.000 BRL em TED, de um cliente com perfil de risco 'Alto', levanta algum alerta segundo as normas de AML?"
O Agente Regulatório usa essa informação contextualizada para buscar em seu RAG e dar a resposta final.
Vantagem: Simples, robusto e muito eficaz para a maioria das consultas que cruzam domínios.
Nível 2: Relação por Enriquecimento Semântico (Graph Knowledge)
Esta é a abordagem mais avançada e poderosa, que utiliza grafos de conhecimento (Knowledge Graphs). Aqui, as relações não são apenas chaves, mas sim entidades e os seus relacionamentos explícitos.
Como funciona:
Você mantém um Grafo de Conhecimento Centralizado (ou federado) que serve como um "mapa" das entidades de negócio e como elas se conectam. Este grafo não armazena os dados massivos (como o conteúdo das transações), mas sim os metadados e as conexões.
Nós do Grafo: Cliente, Transação, Conta Bancária, Produto, Norma Regulatória.
Arestas do Grafo (Relações): Cliente -[POSSUI]-> Conta Bancária, Conta Bancária -[REALIZOU]-> Transação, Transação -[AFETADA_POR]-> Norma Regulatória.
Exemplo Prático:
Pergunta: "Quais clientes foram impactados pela mudança na norma do PIX sobre limites noturnos?"
Fluxo:
O Agente Orquestrador consulta primeiro o Grafo de Conhecimento.
Ele pede ao grafo: "Encontre a Norma Regulatória cujo nome é 'limite noturno do PIX'". O grafo retorna o nó REG-PIX-007.
Em seguida, ele pergunta ao grafo: "Quais Transações são do tipo 'PIX noturno' e foram AFETADAS_POR a norma REG-PIX-007?". O grafo percorre as arestas e retorna uma lista de transaction_id.
Finalmente, ele pergunta: "Quais Clientes REALIZARAM essas transações?". O grafo retorna uma lista de customer_id.
Agora, com a lista de customer_id, o orquestrador pode ir ao Agente de Clientes (KYC) para buscar os nomes e contatos e gerar a resposta final.
Vantagem: Permite consultas complexas e a descoberta de relações que não seriam óbvias. Em vez de buscar em todos os RAGs, você primeiro consulta o "mapa" (o grafo) para saber exatamente onde e o que procurar. Isso é extremamente performático.
Nível 3: Relação Vetorial Híbrida (Busca Federada)
Esta abordagem é um meio-termo, onde o agente usa o resultado vetorial de uma busca num RAG para iniciar uma busca em outro.
Como funciona:
O vetor que representa uma consulta ou um resultado num RAG pode ser usado como contexto para uma nova consulta em outro RAG.
Exemplo Prático:
Pergunta: "Encontre transações suspeitas similares à contestação de fraude feita pelo cliente 'Empresa XYZ' na semana passada."
Fluxo:
O Agente de Clientes primeiro busca no seu RAG pela "contestação de fraude da Empresa XYZ". Ele não encontra apenas o texto, mas também o vetor de embedding que representa semanticamente aquela contestação (vetor_fraude_exemplo).
O Agente Orquestrador recebe esse vetor_fraude_exemplo.
Ele passa esse vetor para o Agente de Transações e comanda: "Busque no seu RAG por transações cujo conteúdo (descrição, padrão, etc.) seja semanticamente similar a este vetor: vetor_fraude_exemplo".
O RAG de Transações faz uma busca por similaridade de cosseno (ou outra métrica) usando o vetor fornecido e retorna as transações mais parecidas em toda a base de dados, mesmo que não contenham as mesmas palavras-chave.
Vantagem: Permite encontrar relações baseadas em "semelhança de conceito" ou "padrão", em vez de chaves exatas. É ideal para investigações de fraude, análise de comportamento e descoberta de padrões.
Resumo da Estratégia:
Nível
Método
Ideal Para
1. Chave Comum
Usar IDs globais para conectar dados entre RAGs.
A maioria das consultas operacionais do dia a dia.
2. Grafo de Conhecimento
Usar um grafo central para mapear entidades e relações.
Consultas complexas de "muitos para muitos" e descoberta de relações.
3. Vetorial Híbrida
Usar o resultado vetorial de uma busca como input para outra.
Análise investigativa, busca por similaridade e detecção de padrões.
Na prática, um sistema robusto usará uma combinação dos três. O Agente Orquestrador será inteligente o suficiente para decidir qual método usar com base na natureza da pergunta do usuário.


---------------------------------------------------------------------------------------


# Manual da Arquitetura Conceitual: O Sistema de IA Cognitivo para Core Banking
**Versão:** 4.0 (Detalhada e Corrigida)
**Data:** 03/01/2026
**Autor:** Manus

## Introdução: Para Além do RAG, Rumo à Cognição Federada

Este documento descreve a arquitetura de um sistema de Inteligência Artificial que transcende o padrão de Retrieval-Augmented Generation (RAG). O objetivo não é apenas responder a perguntas, mas criar um sistema cognitivo capaz de raciocinar, planear, lembrar, colaborar e otimizar as suas próprias operações. Fundamentalmente, ele é projetado para ser um **cidadão num ecossistema de automação maior**, comunicando-se com outros sistemas e agentes através de um protocolo de comunicação padronizado e agnóstico à tecnologia de transporte.

A analogia central é a de uma **agência de consultoria de elite**, com especialistas, gestores de projeto, uma biblioteca vasta, um sistema de gestão de casos e um **departamento de diplomacia e comunicação inter-agências** que define as regras de noivado (o protocolo) antes de escolher o meio de comunicação (o transporte).

---

## As 8 Camadas da Arquitetura Cognitiva

A arquitetura é composta por 8 camadas lógicas interdependentes, cada uma com uma função e profundidade específicas.

### Camada 1: O Cérebro (A Camada de Orquestração)

**Função:** O centro de tomada de decisão. É o componente ativo que recebe estímulos (requisições), interpreta a intenção, formula um plano de ação e coordena a sua execução, delegando tarefas a especialistas.

**Detalhes:** Esta camada é a implementação da lógica de "agente".
*   **Agente Orquestrador:** Este é o componente principal, o "Gestor de Projetos". Ele não executa tarefas diretamente. A sua responsabilidade é puramente estratégica. Ao receber uma requisição, ele inicia uma cadeia de raciocínio (usando a Camada 4) para:
    1.  **Classificar a Intenção:** Determinar a natureza fundamental da requisição (ver Camada 5).
    2.  **Decompor o Problema:** Se a tarefa for complexa, ele a divide em sub-tarefas lógicas e independentes. Ex: "Analisar o risco do cliente X" é decomposto em "1. Obter histórico transacional", "2. Obter perfil de risco KYC", "3. Cruzar com normas de compliance", "4. Sintetizar relatório de risco".
    3.  **Selecionar Ferramentas/Agentes:** Para cada sub-tarefa, ele seleciona o Agente Especialista mais adequado. Esta seleção é baseada na descrição das "skills" que cada agente especialista publica.
    4.  **Sintetizar Resultados:** À medida que os agentes especialistas retornam os resultados das suas sub-tarefas, o Orquestrador agrega, correlaciona e sintetiza a informação para formular a resposta final e coerente.

*   **Agentes Especialistas:** São "Analistas de pesquisa" focados. Cada um é uma unidade de software que combina um LLM com uma ou mais ferramentas. Eles anunciam as suas capacidades ao Orquestrador. Exemplos:
    *   **Agente de Transações:** Skill: "Buscar e analisar transações por período, valor ou descrição semântica". Ferramenta: Conector para o RAG de transações (PGVector).
    *   **Agente Regulatório:** Skill: "Interpretar e comparar situações com normas e regulamentos". Ferramenta: Conector para o RAG de documentos regulatórios.
    *   **Agente de Grafos:** Skill: "Navegar e descobrir relações entre entidades (clientes, empresas, contas)". Ferramenta: Conector para o NebulaGraph.

### Camada 2: A Memória de Longo Prazo (A Camada de Dados)

**Função:** A "biblioteca" da agência. A fundação passiva onde reside todo o conhecimento factual da organização, otimizada para diferentes tipos de consulta.

**Detalhes:**
*   **Dados Estruturados (Postgres):** A fonte da verdade para dados atómicos e relacionais. É o seu Core Banking. A sua rigidez e consistência (ACID) são insubstituíveis para dados financeiros.
*   **Dados Vetoriais (PGVector):** O índice semântico. Converte dados não estruturados (texto) em representações matemáticas (vetores). Isto permite a "busca por significado". Em vez de procurar a palavra "fraude", pode-se procurar por conceitos semanticamente similares a um exemplo de transação fraudulenta. Cada domínio de negócio (transações, regulação, produtos) terá o seu próprio RAG, que é, na prática, uma tabela ou conjunto de tabelas com embeddings vetoriais.
*   **Dados de Grafo (NebulaGraph):** O mapa de relacionamentos. Enquanto o Postgres diz *o que* são as entidades e o PGVector encontra entidades *similares*, o NebulaGraph explica *como* as entidades se conectam. É otimizado para responder a perguntas de múltiplos "saltos" (hops), como "Mostre-me todos os clientes que partilham um endereço com um diretor de uma empresa que fez uma transação suspeita nos últimos 3 meses". Tentar responder a isto com SQL seria proibitivamente lento.

### Camada 3: A Memória de Curto Prazo (A Camada de Estado e Tarefas)

**Função:** O "sistema de gestão de casos" da agência. Permite a continuidade e a colaboração, transformando o sistema de um respondente apátrida para um assistente com memória.

**Detalhes:**
*   **Gestão de Sessão/Conversa:** Armazena o histórico de diálogo recente (ex: as últimas 5 trocas de mensagens) associado a uma sessão de usuário. Isto permite que o agente entenda pronomes e contexto ("E *ele*? Qual o saldo *dele*?"). Geralmente implementado numa base de dados chave-valor de alta velocidade como o Redis.
*   **Gestão de Tarefas Persistentes:** O núcleo da colaboração. Uma tarefa de múltiplos passos (ex: "onboarding de um cliente PJ") é tratada como um objeto de primeira classe.
    1.  **Criação:** A tarefa recebe um `task_id` único e o seu estado inicial é guardado numa base de dados persistente (Postgres).
    2.  **Evolução:** Cada interação subsequente atualiza o estado da tarefa. Ex: um usuário fornece o NIF, o estado é atualizado.
    3.  **Colaboração:** Outro usuário (ou agente) com as devidas permissões pode "assumir" a tarefa. Ao carregar o `task_id`, o agente retoma o processo exatamente de onde parou, perguntando pela próxima informação em falta. Isto é fundamental para fluxos de trabalho que não são concluídos numa única sessão.

### Camada 4: A Capacidade de Raciocínio (A Camada de Inteligência Híbrida)

**Função:** O "poder de fogo cognitivo" usado pelo Cérebro para raciocinar.

**Detalhes:** A estratégia híbrida é crucial para equilibrar custo, performance, privacidade e capacidade.
*   **Modelos Self-Hosted:** A primeira linha de defesa. Modelos open-source (ex: Llama 3, Mixtral) executados na sua infraestrutura. Garantem que dados sensíveis nunca saiam do seu perímetro de segurança.
*   **Modelos de Nuvem:** O recurso estratégico. Usados para fallback (garantindo 100% de disponibilidade) ou para tarefas que exigem o raciocínio mais avançado do mercado (state-of-the-art).
*   **Gateway de LLMs:** Um proxy inteligente que gere esta complexidade. A aplicação faz uma chamada para o gateway; o gateway decide para qual modelo (local ou nuvem) encaminhar, com base em regras de custo, latência e disponibilidade.

### Camada 5: O Otimizador de Rotas (A Camada de Roteamento Inteligente)

**Função:** O "princípio da eficiência". Garante que o recurso mais caro e lento (o raciocínio de um LLM) só seja usado quando estritamente necessário.

**Detalhes:** Esta é uma função lógica do Agente Orquestrador.
*   **Classificação de Intenção:** A primeira etapa do Orquestrador. Usa um modelo de classificação de texto pequeno e rápido (ou até mesmo regras e palavras-chave) para categorizar a requisição.
*   **Rota Direta (Bypass de LLM):** Para intenções como "consulta de dados diretos" ("Qual o saldo?"), "execução de comando simples" ("Transferir X para Y"). O sistema aciona uma função pré-definida e segura que interage diretamente com as APIs do Core Banking. A resposta é formatada e retornada sem que um LLM generativo seja invocado.
*   **Rota Cognitiva:** Para intenções como "pergunta aberta", "análise comparativa", "geração de resumo". O sistema engaja o fluxo completo de raciocínio do LLM para planear, delegar e sintetizar.

### Camada 6: A Interface Federada (A Camada de Protocolos e APIs)

**Função:** As "portas de entrada e saída" da agência, definindo *o que* e *como* comunicar com o mundo exterior.

**Detalhes:** Esta camada distingue claramente entre a especificação da interface e a sua implementação técnica.
*   **API para Humanos:** Uma API RESTful tradicional, otimizada para servir interfaces de usuário (web, mobile).
*   **Multi-Context Protocol (MCP) - A Especificação da Interface do Agente:**
    *   **Conceito:** O MCP **NÃO é uma tecnologia**, mas sim uma **especificação formal** de uma interface para comunicação entre agentes. É um "contrato" que define como os agentes devem interagir, independentemente da tecnologia de transporte subjacente.
    *   **O Contrato MCP Define:**
        1.  **Assinatura dos Métodos:** A estrutura das funções que um agente deve expor (ex: `execute_task`, `get_status`, `list_skills`).
        2.  **Estrutura dos Dados:** A definição exata dos pacotes de dados trocados, como o `ContextPackage` (com os dados da tarefa) e o `ResultPackage` (com os resultados).
        3.  **Semântica dos Estados:** Os possíveis estados de uma tarefa (`PENDING`, `SUCCESS`, `FAILURE`, `AWAITING_INPUT`).
    *   **Implementação:** Uma vez definido o protocolo, cada agente ou RAG especializado implementa um **MCP Server**. Este servidor é simplesmente um endpoint de rede que expõe a interface definida pelo MCP. A tecnologia usada para construir este servidor (gRPC, REST, etc.) é uma decisão de implementação local, que não afeta a conformidade com o protocolo.

### Camada 7: O Motor de Operações (A Camada de Gestão de Pipelines)

**Função:** A "equipa de logística e operações" que automatiza todos os processos de suporte para manter o sistema vivo, saudável e a evoluir.

**Detalhes:**
*   **Pipelines de Dados (ETL/ELT para IA):** O fluxo que mantém a Camada de Dados atualizada.
*   **Pipelines de Avaliação (Eval Pipelines):** Essenciais para prevenir a "deriva" ou regressão do modelo. Executam testes automatizados para garantir que a qualidade das respostas não se degrada com o tempo ou com novas atualizações.
*   **Pipelines de Fine-Tuning:** Processos que usam dados recentes para re-treinar e especializar modelos (ex: o modelo de embedding ou o classificador de intenção).
*   **Pipelines de CI/CD:** Automação para o ciclo de vida do software dos próprios agentes.
*   **Orquestrador de Pipelines:** A ferramenta central (ex: Dagster, Airflow) que gere a execução, dependências e agendamento de todos estes pipelines.

### Camada 8: O Supervisor (A Camada de Governança e Observabilidade)

**Função:** O "departamento de controlo de qualidade e conformidade".

**Detalhes:**
*   **Padrão Aberto:** A arquitetura adota um padrão aberto como o **OpenTelemetry** para instrumentar o código.
*   **Backend de Observabilidade:** Os dados do OpenTelemetry são enviados para uma stack de ferramentas que permite a visualização e o alerta:
    *   **Métricas (Prometheus):** Para monitorizar a saúde do sistema (latência, QPS, uso de GPU).
    *   **Logs (Loki):** Para registo detalhado de eventos.
    *   **Traços (Jaeger):** Para visualizar o ciclo de vida completo de uma requisição através de todas as camadas, identificando gargalos.
    *   **Dashboards (Grafana):** Para unificar a visualização de todas estas fontes de dados.

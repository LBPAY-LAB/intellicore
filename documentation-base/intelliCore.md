Este documento tem como objetivo descrever o escopo do projeto intellicore.

<Introdução>
O LBPAY é uma IP licenciada pelo Banco Central do Brasil como participante directa do PIX. 

<AS-IS>
Temos atualmente dois projetos de implementação do LBPAY:

1. LB Connect: #LBCONN#
    a. #LBCONN_1# .Implementação da integração directa via RSFN com o SPI/Bacen (icom) para PIX In e PIX Out
    b. #LBCONN_2# pendente. Implementação da integração usando a solução SaaS da JD, via RSFN com o STR/(Bacen) 
    c. #LBCONN_3# pendente. Implementação da solução de ITP (Open Finance Brasil) usando a solução SaaS da Lina que implementa a integração com o Bacen (OpenFiance)
    d. #LBCONN_4# pendente. Implementação da solução de CCS/Jud baseda na integração com a solução da Presenta (SaaS), para bloqueio/desbloqueio de contas
    e. #LBCONN_5# Implementação da solução de Reporting e Contábil, baseado na integração com a FácilTech
    f. #LBCONN_6# Implementação da solução de anti-fraude, baseado na integração com a DataRudder;
    g. #LBCONN_7# pendente. Integração da validação de CNPJ via o serviço online Serpro;
2. LB Core: #LBCore#
    a. #LBCore_1#Implementação de todos os processos e funcionalidades de Core Banking:
        #LBCore_1_1# . Cadastro de clientes;
        #LBCore_1_2# .KYC de clientes;
        #LBCore_1_3# .Abertura de Conta Pessoa Juridica (conta proprietária)
            #LBCore_1_3_1#.Abertura de Conta Transacional. Conta Pré-paga adicional, para os casos de empresas de Betting, permitindo gerenciais os payins e payouts dos seus clientes apartadamente da sua conta pré-paga (conta proprietária)
        #LBCore_1_4# Bloqueio/desbloquio de conta PJ;
    b. #LBCore_1_2# Implementação das sagas PIX IN e PIX Out, gestão de cobranças PIX
        Porcessamento de transações PIX. Recebe do LB Connect pedido de registro de transações e integra com LBConenct pedidos de PIX-OUT.
    d. #LBCore_1_3# Implementação das Rest APIS:
        . Seamless Payments para PAYINS via PIX, que permite os portais dos clientes PJ integrarem pagamentos;
        . PIXOUT API, permitindo a integração BCB com os clientes PJ;
    c. #LBCore_1_4# Implementação da Ledger (baseado no TigerBeetle):
        #LBCore_1_4_1#.Uma api interna que permite:
            #LBCore_1_4_1_1#.Registro de transações: pay in e pay out;
            #LBCore_1_4_1_2#.Consulta de saldo;
            #LBCore_1_4_1_3#.Consulta de extrato;
        #LBCore_1_4_2#.Geração de eventos contábeis;
    d. #LBCore_1_5# Integração com o LB Connect
        #LBCore_1_5_1# .Pix-In e Pix-out;
        #LBCore_1_5_2# .Dict. Gestão completa das Chaves PIX;
        #LBCore_1_5_3# .Crud de Chaves PIX integrado com o Dict;
        #LBCore_1_5_4# .Dict. Med e Med 2.0. Soluções de pedidos de devolução e comunicação de fraude do dict.
        #LBCore_1_5_5# .Integração com a fáciltech via LB Connect - upload de eventos contábeis após cada transação com sucesso
      disponibilização dos Portais do cliente e de BackOffice (gestão das Operações LBPAY).
        #LBCore_1_5_6# .Integração com a dataRudder via LB Connect;
    e. #LBCore_1_6#Portal do cliente PJ;
        #LBCore_1_6_1# .Consulta de Saldo de PJ
        #LBCore_1_6_2# .Consulta de Extratos PJ
    f. #LBCore_1_7#Portal de BackOffice:
        #LBCore_1_7_1# .Disponibilização das funcionalidades de gestão de clientes, kyc, gestão das contas....
        #LBCore_1_7_2# .Consulta de Saldos por Conta
        #LBCore_1_7_3# .Consulta de Extratos por Conta
        ...
    g. #LBCore_1_8# Solução de Billing
        #LBCore_1_8_1#. Cobrança de tarefas por serviços;
            . PIX
            . Gestão da Conta
            . qq tipo de serviço que se pretenda prestar ao cliente..
        #LBCore_1_8_2#. Gestão de Tarifários por cliente (implementar todo o tipo de tarifários)
            . Tarifário pré-pago, pós-pago e on-time
                . por flat fees e patamares de transações. 1 a 1000 x, de 1001 a 9999 y...
                . por % e patamares de transações. 1 a 1000 0,5%, de 1001 a 9999 0,6%...
                . lotes de transações: 1000000 500 Reais/Mês
 </AS-IS>
<TO-BE>

Na arquitetura de software tradicional que o <AI-IS> contempla, a comunicação entre o frontend (portais web, aplicativos móveis) e o backend é feita através de APIs REST ou GraphQL. Essa abordagem, embora funcional, cria um **acoplamento rígido** entre a interface do usuário e a lógica de negócio.

-   **Mudar uma tela exige mudar o backend:** Se um novo campo é adicionado a um formulário no portal, o endpoint da API no backend precisa ser modificado, testado e implantado.
-   **BFFs (Backend for Frontend) como paliativo:** A criação de BFFs tenta resolver isso, mas acaba gerando mais uma camada de código para manter, e o acoplamento apenas muda de lugar.
-   **Comunicação síncrona e frágil:** A natureza requisição-resposta do HTTP/REST não é ideal para processos de negócio complexos e assíncronos.

Pretendemos uma mundança total de paradigma baseado em IA, tendo como centro de toda a implementação um Agentic RAG trimodal (PostGres, NebulaGraph e PGVector), baseado em vários tipos de pipelines de ingestão: 
    . documentos de todos os tipos (normas bace, politicas internas do LBPAY): Pdfs, arquivos .MD, TXT, Json, XML...
    . integração com vários bancos de dados: Tigerbeetle via MCP e usando o TigerBeetle SDK nativo;
    . que o banco de dados Postgres do RAG seja processado automaticamente como integrando o RAG:
        . Por exemplo que  Tabelas de Clientes e Contas nos Postgres no banco de grafos fiquem conectados Cliente X->Conta Y.... Um dos muitos exemplos para se entender o que se pretende.
    . todas as regras de negócio introduzidas por portal de backOffice pelos usuários
    . Gestão de toda a ingestão. Se um documento novo revogar outro tem que ficar gerenciado essa evolução dentro do RAG. 

O SuperCore adota uma abordagem fundamentalmente diferente, utilizando os **Message Context Protocols (MCPs)** como a espinha dorsal da comunicação e Topicos Pulsar como sistema nervoso. Importante que todos os eventos e todo o tipo de eventos sejam também ingeridos pela RAG para que se possa depois conseguir extrair, por exemplo de forma automatica trilhas de auditoria relacionadas com uma conta, ou uma transação,... ou acessos de usuário.
    . Permitir gerenciar a partir de linguagem natural gerenciar todo o tipo de logica e regras de negócio, não sendo mais preciso programar, quando alguma regra de negócio mudar.

Por isso, pretendemos implementar o intelliCore baseado num nova abstração e paradigmas 100% baseed on AI. 

O novo paradigma é baseado no conceito asbstracto de Oraculo e Agentic Multi-RAg, como base de toda a implementação, dos portais, dos serviços, das configurações, implemenação das regras de negócio, dos ABACs e RBACS... tudo orientado a definições baseadas em linguangem natural dispensando programação.

Implementação dos Oráculos:

Tipo de Oráculo:
    Oráculo Pai um por solução; Nativo sempre que se cria uma solução;
    Oráculo Filho. Tem que ter sempre um Oráculo Pai.
        Oráculo Master. É um Oráculo filho com um ou mais Sub Oráculos.
        Oráculo SubMaster. É um Oráculo filho que só pode ser chamado pelo seu Oráculo Master.

Como implementar soluções Multi-Tenant
    Identificar quais os Oráculos Filhos que serão Master e quais os Oráculos Filhos que serão Sub de um Master.
    Um oráculo filho como Master terá um ou mais Sub Oraculos conforme a key que define as regras de direcionamento para o Sub Oraculo.
        Exemplo, para se perceber melhor: No Caso do LBPAY, em que cada cliente é um PJ, os Oráculos do tipo Processamento e Transaction Ledger serão os sub Oráculos do Oracle CoreBanking. Ao criar um novo cliente, um agente irá criar dois novos Oraculos filhos subMaster.

Exemplos de Oráculos:    
    . Oráculo Pai. É um Oráculo que agrupa todos os restantes conforme documentado mais abaixo.
    . Oraculo de Core Banking;
    . (Multi_Tenant) Oraculo de Transações (baseado no TigerBeetle e todos os eventos em torno das transações);
    . (Multi-Tenant) Oraculo de Processamento de Transacoes;
        . PIX (Sagas de PIX), Trilha de Auditoria, integração com o Oraculo de Transações e Oraculo Interfaces;
        . TED (SAGA Ted), Trilha de Auditoria, integração com o Oraculo de Transações e Oraculo Interfaces;    
        . Card Payments, Trilha de Auditoria, integração com o Oraculo de Transações e Oraculo Interfaces;
    . Oraculo de Interfaces:
        . que terá que corresponder ao atual #LBCONN#
   
    Considerar que cada Oráculo de tenha um Agentic Multi-RAG associado de raiz. Conforme as regras de multi-RAg que estão definidas na implementação do intelliCore.

Cada Oráculo tem um modelo de dados próprio, permissões e a definição se é um Oraculo Pai ou Filho. Cada solução só pode ter um Oráculo Pai.

Implementação Oraculo_Pai
    O Oráculo Pai é o Oraculo que representa a solução. Exemplo LBPAY. 
        O RAG do Oraculo_PAi tem que ingerir todas a missão, caracteristicas e missão do LBPAY.
        Agentes
        Objetos
        Integração com os Oráculos filhos.
Implementação de Agentes
    Cada Oraculo para ter vida própria precisará de implementar vários agentes com os skills necessários 
Implementação de Objetos
    Cada Oraculo para ter vida própria precisará de implementar vários objetos de vários tipos
        Por exemplo um Oráculo de Cadastro de Clientes irá atuar sobre as tabelas de Clientes no Postgres e precisará de usar MCP do Postres para o Crud. Mas será um agente que irá atuar sobre os agentes

Implementação de um Portal Super Assitente de IA de BackOffice, que transforme o atual Portal baseado em BFF numa solução baseada não precisará mais de programação porque toda a logica está baseada em ingestão para os RAGs.

Implementação de um Portal Super Assitente de IA de Clientes, que transforme o atual Portal baseado em BFF numa solução baseada não precisará mais de programação porque toda a logica está baseada em ingestão para os RAGs.

Implementação de um Portal Super Assitente de IA de Tesouraria, que transforme o atual Portal baseado em BFF numa solução baseada não precisará mais de programação porque toda a logica está baseada em ingestão para os RAGs.

Fundamental e mandatório: analisar todos os restantes documentos da pasta documentation-base/Agentic_MultiRag. Além deste documento teremos mais 10 documentos com o detalhamento

</TO-BE>
</Introdução>

<Metodologia>

    Considerações necessárias como orientações a implementação do intellCore.

    A solução intellicore será implementada em várias fases:

    Versão intelliCore "CoreBAse"

        Pretende-se nesta versão implementar todas as funcionalidades, processos e tudo o que permita garantir a substituição e migração do LBCORE #LBCore# para o intelliCore. 

        O LBCORE consistirá todas as tags que contêm as tags que começam por #LBCore

        A implementação será sequencial garantindo uma dependência natural de implementações entre cada fase. A fase 1 não faz sentido sem a fase 0, a fase 2 não faz sentido sem a fase 1 e assim consequentente:

        Antes de cada fase, deverá ser criado pelo agente Orquestrador de implementação um documento de duvidas que permita evitar que os agentes e/ou o Claude Code alucinem criando ou implementando partes da solução não previamente documentadas e/ou usar tecnologias que não estavam na stack inicial.

        - Fase 0: Implementação da solução de Agentic Multi-Rag conforme a documentação do Folder Agentic_MultiRAg. 
            Nesta folder considerar em primeiro lugar o documento _agentic_multi-rag.md e em seguida todos os outros.
            Somente após a implementação desta solução será viável iniciar a implementação do resto do IntelliCore, já que tudo depedente da solução de Agentic Multi-Rag.
            A medida que as outras fases forem sendo implementadas, será natural a necessidade de ir ajustando o escopo desta ou de outras fases;
        - Fase 1: Implementação de um portal de solução e gestão de Oráculos e do Agentic Multi-RAG.    
                Esta implementação irá permitir
        - Fase 2: Implementação do Portal de BackOffice baseado em Assistente de IA;
        - Fase 3: Implementação do Portal de Clientes baseado em Assistente de IA;

        Poderão existir outras fases e evoluções as fases já levantadas, obrigando a constante atualização de documentos de especificação em cada pasta do documentation-base.

        O escopo do projeto bem como de todas as fases que o constituem estão abaixo da folder documentation_base e do claude.md que estará na raiz do projeto. Nenhum documento fora desta folder poderá ser considerado pelos agentes como escopo do projeto. Com esta disciplina rigida evitaremos dispersão e complexidade de orquestração para os agentes.

        As folders de implementação do projeto, terão que ficar abaixo da raiz da folder SUPERCORE.
        
        Em termos de deployment, iremos implementar um monorepo de gestão de todos os Oraculos e Portais, com exceção dos Oraculos_Cliente.

        Extremamente importante:
            na versão "Essencial" a solução intellicore terá que interfacear via RestAPI ou grPC, ou pulsar com os seguintes módulos já em produção:
                - LB Connect #LBCONN#
            
            depois na versão "

</Metodologia>
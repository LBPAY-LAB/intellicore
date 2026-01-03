

Antes da criação de cada um dos oraculos é necessário caracterizar o Oraculo_Pai que é nativo quando criamos uma solução.
Ou seja, atrelado ao Portal de Gestão de Oráculos teremos logo que ter um Oráculo Pai para configurar.
        - Teremos que ter várias seções de texto em linguagem natural que irão constituir o Oraculo Pai:
            Tags: Criação de TAgs que permitam depois fazer pesquisas mais otimizadas.
                Cada Tag quem corresponder um json que será ingerido na RAg do Oráculo Pai.
            - Seção 0: Dados deterministicos da LPBAY:
                - Designação Social;
                - Tipo de Sociedade;
                - Marca,
                - Endereço da Sede;
                - e tudo o que quisermos acrescentar que aumente os dados sobre o LBPAY... Por exemplo que a missão do LBPAY é atender clientes PJ B2B..
            - Seção 1: Auto Consciência. Permitir que os portais assistentes AI de backOffice ou de Portal de Tesouraria, possam responder se o cliente perguntar "Que sistema és tu?" "Quem me está a responder?" Tipo isso
            - Seção 2:
                Colocar nesta seção a cópia da definição do BAcen que determina o que é uma IP e um participante direto do PIX.
            - Seção 3: 
                Pipelines de ingestão conforme os tipos de ingestão que a solução de RAG permitir
                    - No pipeline Sites, poder gerenciar quais as URLS que estão sendo processadas
                    - No piplene Documentos, poder gerenciar quais os documentos que serão submetidos para serem ingeridos;
            - Seção 4:
                Gestão de Oráculos (crud)
                    Criar Oráculos, e já preencher os dados básicos de card Oráculo: Nome, descrição, data de criação (timeStamp), usuário criador e log de Oráculo (versões)
       
        Importante que se registre toda as as versões do Oraculo Pai para se entender as evoluções que vai tendo e quem as fez (usuário);
        
   
    Implementação de um Oráculo:
        Um Oráculo terá todos os elementos do Oráculo Pai com exceção de ser Oráculo Pai e de poder ter Sub Oráculos.
        Cada Oráculo terá a funcionalidade de gestão de Pipelines de RAG;
        Cada Oráculo terá a funcionalidade de gestão de agentes
        Cada Oráculo terá a funcionalidade de gestão de Objetos
        Cada Oráculo terá a funcionalidade de gestão de MCP (anthropic mcps interface pattern)


Notas: Todos os RAGs considerados nesta implementação serão Agentic RAG conforme a documentação que está contida na folder Agentic_MultiRag
       
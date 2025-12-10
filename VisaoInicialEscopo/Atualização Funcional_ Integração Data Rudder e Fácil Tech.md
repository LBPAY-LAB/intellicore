# Atualização Funcional: Integração Data Rudder e Fácil Tech

## 1. Introdução

Esta atualização define como o Core Banking Inteligente integra dois parceiros estratégicos para funções críticas: **Data Rudder** (Detecção de Fraude) e **Fácil Tech** (Contabilidade Regulatória).

A filosofia é tratar esses sistemas externos como "Extensões Cognitivas" do Cérebro, acessadas via Agentes Especializados.

---

## 2. Data Rudder: O Córtex de Segurança

O Data Rudder atua como o motor de decisão de risco em tempo real, complementando a análise interna do Grafo.

### 2.1. Integração via Security Agent
O **Security Agent** não toma decisões isoladas; ele consulta o Data Rudder para obter um score de risco externo.

**Fluxo de Decisão de Transação:**
1.  **Evento**: Cliente inicia Pix de R$ 5.000.
2.  **Security Agent**:
    *   Consulta Grafo Interno (NebulaGraph): "Há conexões suspeitas?"
    *   Consulta Data Rudder (API): "Qual o score de risco deste CPF/Device?"
3.  **Síntese**: O Agente combina os sinais.
    *   *Grafo*: OK.
    *   *Data Rudder*: Risco Médio (Device novo).
4.  **Ação**: "Aprovar com desafio (Biometria)".

### 2.2. Feedback Loop (Aprendizado)
Quando uma fraude é confirmada (internamente ou por chargeback), o Security Agent envia o feedback para o Data Rudder, melhorando o modelo do parceiro e o próprio RAG interno.

---

## 3. Fácil Tech: O Córtex Regulatório

A Fácil Tech assume a responsabilidade pesada de gerar os arquivos regulatórios (CADOCs, e-Financeira) para o Banco Central, liberando o Core para focar na operação.

### 3.1. Integração via Accounting Agent
O **Accounting Agent** é responsável por garantir que a Fácil Tech tenha todos os dados necessários.

**Fluxo de Report Regulatório:**
1.  **Coleta Diária (D+1)**:
    *   O Accounting Agent extrai o balancete diário do **TigerBeetle** (Ledger).
    *   Extrai metadados de clientes do **PostgreSQL**.
2.  **Envio**:
    *   O Agente formata os dados no padrão de ingestão da Fácil Tech (JSON/XML).
    *   Envia via Secure File Transfer (SFTP/API).
3.  **Validação**:
    *   A Fácil Tech processa e retorna status ("Processado com Sucesso" ou "Erros de Validação").
4.  **Correção Autônoma**:
    *   Se houver erro (ex: "CPF inválido"), o Agente aciona o **Identity Agent** para corrigir o cadastro e reenvia o registro.

---

## 4. Benefícios da Arquitetura Híbrida

| Componente | Responsabilidade | Benefício |
| :--- | :--- | :--- |
| **Core Interno** | Orquestração, UX, Ledger, Pix | Agilidade e Controle |
| **Data Rudder** | Modelos de Fraude de Mercado | Inteligência Coletiva |
| **Fácil Tech** | Conformidade BACEN | Redução de Risco Regulatório |

Esta abordagem permite que o Core Banking seja leve e focado na experiência do cliente, enquanto delega a complexidade regulatória e de risco massivo para especialistas de mercado.

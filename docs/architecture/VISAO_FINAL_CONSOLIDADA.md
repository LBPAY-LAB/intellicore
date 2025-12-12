# VISÃO FINAL CONSOLIDADA - SuperCore Platform

> **"A plataforma universal que permite criar Core Banking e qualquer solução empresarial através de IA, sem código."**

**Status**: 🟢 Documento Definitivo - Arquitetura Final
**Versão**: 2.0.0
**Data**: 2025-12-11
**Aprovação**: Pendente

---

## 📋 Índice

1. [Conceito Revolucionário](#conceito-revolucionário)
2. [Fluxo Completo: Da Ideia à Solução Funcionando](#fluxo-completo)
3. [Fase 0: Configuração do Oráculo](#fase-0-oráculo)
4. [Fase 1: AI-Driven Context Generator](#fase-1-context-generator)
5. [Fase 2: Geração Automática de Especificação](#fase-2-especificação)
6. [Fase 3: Geração do Grafo de Objetos](#fase-3-grafo-objetos)
7. [Fase 4: Criação do Modelo](#fase-4-modelo)
8. [Fase 5: Uso do Modelo](#fase-5-uso)
9. [Arquitetura Técnica Completa](#arquitetura-técnica)
10. [Integração com Gateways Externos](#integração-gateways)
11. [RAG Trimodal Híbrido](#rag-híbrido)
12. [Roadmap de Implementação](#roadmap)

---

## 🎯 Conceito Revolucionário

### O Que é SuperCore?

**SuperCore NÃO é um Core Banking.**
**SuperCore é uma MÁQUINA UNIVERSAL geradora de soluções empresariais.**

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT: Linguagem Natural + Documentos + Diagramas         │
│  ├─ PDFs do BACEN                                           │
│  ├─ Diagramas Whimsical                                     │
│  ├─ Fluxos Mermaid                                          │
│  ├─ Documentos de Produto                                   │
│  └─ Super Prompt (descrição livre)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  AI-DRIVEN PROCESSING                                       │
│  ├─ LLM Vision API (lê diagramas)                           │
│  ├─ Document Parser (extrai texto de PDFs)                  │
│  ├─ RAG Trimodal (busca contexto no Oráculo + BACEN)       │
│  ├─ Architect Agent (gera especificação)                    │
│  └─ Object Graph Generator (cria objetos)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT: MODELO DE SOLUÇÃO COMPLETO                         │
│  ├─ Object Definitions (entidades de dados)                 │
│  ├─ FSM (máquinas de estado)                                │
│  ├─ Validation Rules (BACEN + customizadas)                 │
│  ├─ Process Definitions (workflows BPM)                     │
│  ├─ MCP Action Agents (validações automáticas)              │
│  ├─ Integrações Externas (APIs, ledgers, etc)               │
│  └─ Telas Auto-Geradas (forms, listas, wizards, approvals)  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  SOLUÇÃO FUNCIONANDO (Zero Código Manual)                   │
│  • Usuários criam instâncias (ex: Clientes PF)              │
│  • Processos executam automaticamente (onboarding, KYC)     │
│  • Agentes validam (CPF Receita, anti-fraude, BACEN)        │
│  • Integrações funcionam (TigerBeetle, BACEN SPI, ViaCEP)   │
│  • Telas renderizam dinamicamente (100% auto-geradas)       │
└─────────────────────────────────────────────────────────────┘
```

### Princípio Fundamental

> **"Não construímos soluções. Construímos a MÁQUINA que GERA soluções."**

**SuperCore permite:**
- ✅ Time de Produto criar Core Banking completo em **DIAS**
- ✅ Zero desenvolvedores necessários (após SuperCore implementado)
- ✅ Compliance adiciona/modifica regras BACEN em **MINUTOS**
- ✅ Mesma plataforma serve N domínios (Banking, CRM, ERP, Hospital, etc)
- ✅ Evolução contínua sem breaking changes

---

## 🔄 Fluxo Completo: Da Ideia à Solução Funcionando

### Visão Geral (6 Fases)

```
FASE 0: Configurar Oráculo (Consciência da Solução)
   ↓
FASE 1: Página "Novo Contexto" (Upload de Inputs)
   ↓
FASE 2: AI Gera Especificação (Iteração com Usuário)
   ↓
FASE 3: AI Gera Grafo de Objetos (Object Definitions + Processes + Agents)
   ↓
FASE 4: Criação do Modelo (Deploy + Persistência)
   ↓
FASE 5: Uso do Modelo (Usuários Criam Instâncias)
   ↓
FASE 6: Evolução do Modelo (Versionamento sem Breaking Changes)
```

---

## 🧠 Fase 0: Configuração do Oráculo (Consciência)

### O Que é o Oráculo?

**O Oráculo é a IDENTIDADE da solução** - define quem somos, o que fazemos, sob quais regulamentações operamos, com quem integramos.

**CRÍTICO**: O Oráculo DEVE ser configurado ANTES de criar qualquer modelo. É o contexto fundamental que a AI usa para gerar soluções corretas.

### Interface: Configuração do Oráculo

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 CONFIGURAÇÃO DO ORÁCULO                                 │
│  (OBRIGATÓRIO antes de criar modelos)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ IDENTIDADE                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Nome/Razão Social: LBPAY INSTITUIÇÃO DE PAGAMENTO S.A││ │
│  │ CNPJ: 12.345.678/0001-90                             ││ │
│  │ Tipo: Instituição de Pagamento                       ││ │
│  │ ISPB: 12345678                                        ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  2️⃣ REGULAMENTAÇÕES E LICENÇAS                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☑ BACEN - Instituição de Pagamento (Reso 80)        ││ │
│  │ ☑ BACEN - Participante PIX (ISPB 12345678)          ││ │
│  │ ☑ Circular BACEN 3.978 - PLD/FT                     ││ │
│  │ ☑ Resolução BACEN 4.753 - KYC                       ││ │
│  │                                                       ││ │
│  │ [+ Adicionar Regulamentação]                         ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  3️⃣ MANUAIS E POLÍTICAS (Upload)                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📄 Manual PIX v8.3.pdf                  [✓] Processado││ │
│  │ 📄 Circular 3978 - PLD.pdf              [✓] Processado││ │
│  │ 📄 Política Interna Anti-Fraude.docx    [✓] Processado││ │
│  │                                                       ││ │
│  │ [+ Upload Documento]                                 ││ │
│  │                                                       ││ │
│  │ Nota: Documentos são indexados para RAG + criadas    ││ │
│  │ instances de manual_bacen/policy_interna             ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  4️⃣ INTEGRAÇÕES EXTERNAS (Gateways e APIs)                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Categoria: LEDGER                                    ││ │
│  │ ├─ TigerBeetle Ledger                                ││ │
│  │ │  └─ tcp://tigerbeetle:3000 [✓ Conectado]          ││ │
│  │                                                       ││ │
│  │ Categoria: BANCO_CENTRAL                             ││ │
│  │ ├─ BACEN SPI (PIX)                                   ││ │
│  │ │  └─ https://api.spi.bcb.gov.br [✓ Conectado]      ││ │
│  │ ├─ LB Connect (Gateway PIX)                          ││ │
│  │ │  └─ http://lb-connect:8080 [✓ Conectado]          ││ │
│  │ ├─ LB Dict (DICT API)                                ││ │
│  │ │  └─ http://lb-dict:8081 [✓ Conectado]             ││ │
│  │                                                       ││ │
│  │ Categoria: ANTI_FRAUDE                               ││ │
│  │ ├─ Data Rudder                                       ││ │
│  │ │  └─ https://api.datarudder.com [✓ Conectado]      ││ │
│  │                                                       ││ │
│  │ Categoria: API_PUBLICA                               ││ │
│  │ ├─ Receita Federal (CPF)                             ││ │
│  │ │  └─ https://servicos.receita.gov.br [✓ Conectado] ││ │
│  │ ├─ ViaCEP                                            ││ │
│  │ │  └─ https://viacep.com.br [✓ Conectado]           ││ │
│  │                                                       ││ │
│  │ [+ Adicionar Integração]                             ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  5️⃣ ORCHESTRATION E MONEY-MOVING                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Orchestration-GO (Sagas)                             ││ │
│  │ └─ http://orchestration-go:8082 [✓ Conectado]       ││ │
│  │                                                       ││ │
│  │ Money-Moving (Processamento Pagamentos)              ││ │
│  │ └─ http://money-moving:8083 [✓ Conectado]           ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Salvar Configuração] [Testar Conexões] [Aprovar]         │
└─────────────────────────────────────────────────────────────┘
```

### O Que Acontece ao Salvar Oráculo?

```typescript
// 1. CRIA INSTANCE oracle_config
const oracleConfig = await supercoreClient.instances.create({
  object_definition: 'oracle_config',
  data: {
    identidade: {
      razao_social: 'LBPAY INSTITUIÇÃO DE PAGAMENTO S.A.',
      cnpj: '12.345.678/0001-90',
      tipo_instituicao: 'INSTITUICAO_PAGAMENTO',
      ispb: '12345678'
    },
    regulamentacoes: [
      { orgao: 'BANCO_CENTRAL', tipo: 'INSTITUICAO_PAGAMENTO', normativa: 'Resolução 80' },
      { orgao: 'BANCO_CENTRAL', tipo: 'PIX', normativa: 'Regulamento PIX' },
      { orgao: 'BANCO_CENTRAL', tipo: 'PLD_FT', normativa: 'Circular 3.978' }
    ],
    integracoes: [
      { nome: 'TigerBeetle', categoria: 'LEDGER', endpoint: 'tcp://tigerbeetle:3000' },
      { nome: 'BACEN SPI', categoria: 'BANCO_CENTRAL', endpoint: 'https://api.spi.bcb.gov.br' },
      { nome: 'LB Connect', categoria: 'GATEWAY_PIX', endpoint: 'http://lb-connect:8080' },
      { nome: 'LB Dict', categoria: 'DICT_API', endpoint: 'http://lb-dict:8081' },
      // ... outras
    ]
  },
  current_state: 'VIGENTE'
});

// 2. PROCESSA MANUAIS E POLÍTICAS (Architect Agent)
for (const documento of documentosUpload) {
  // a) Document Parser extrai texto
  const textoExtraido = await documentParser.parse(documento);

  // b) LLM identifica estrutura
  const estrutura = await llm.parseManualStructure(textoExtraido);

  // c) Cria instance de manual_bacen ou policy_interna
  const manualInstance = await supercoreClient.instances.create({
    object_definition: 'manual_bacen',
    data: estrutura,
    current_state: 'VIGENTE'
  });

  // d) Gera embeddings para RAG (event-driven)
  // EmbeddingSyncService escuta evento CREATED e indexa automaticamente
}

// 3. TESTA INTEGRAÇÕES
for (const integracao of integracoes) {
  await integrationManager.testConnection(integracao.endpoint);
}

// 4. PUBLICA EVENTO
eventBus.publish({
  type: 'ORACLE_CONFIGURED',
  data: oracleConfig
});
```

### Por Que o Oráculo é Fundamental?

1. **Contexto para AI**: Quando AI gera modelos, consulta o Oráculo via RAG para entender regulamentações, integrações disponíveis, políticas vigentes
2. **Validação Automática**: Regras BACEN derivadas dos manuais são aplicadas automaticamente
3. **Rastreabilidade**: Toda decisão tem fonte legal rastreável (manual → regra → validação)
4. **Integrações Prontas**: Modelos gerados já incluem integrações configuradas no Oráculo
5. **Compliance Automático**: Políticas internas são consultadas via RAG durante criação de modelos

---

## 📤 Fase 1: AI-Driven Context Generator (Página "Novo Contexto")

### Interface Completa

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 NOVO CONTEXTO - Criar Modelo de Solução                │
│  (AI-Driven Model Generation)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 NOME DO MODELO                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Cadastro de Pessoa Física                             ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  📤 INPUTS (Multi-Modal)                                    │
│                                                             │
│  1️⃣ Documentos BACEN (PDFs)                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📄 Resolucao_4753_KYC.pdf          [Upload Concluído] ││ │
│  │ 📄 Manual_PLD_FT.pdf                [Upload Concluído] ││ │
│  │                                                       ││ │
│  │ [+ Upload Documento BACEN]                           ││ │
│  │                                                       ││ │
│  │ Nota: Documentos são analisados pela AI para extrair││ │
│  │ regras, validações e requisitos regulatórios         ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  2️⃣ Diagramas Whimsical (PNG/SVG)                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🖼️  fluxo_onboarding_pf.png       [Upload Concluído] ││ │
│  │                                                       ││ │
│  │ [+ Upload Diagrama]                                  ││ │
│  │                                                       ││ │
│  │ Nota: AI Vision API lê diagramas e extrai:          ││ │
│  │ - Etapas do processo                                 ││ │
│  │ - Decisões (if/else)                                 ││ │
│  │ - Aprovações humanas                                 ││ │
│  │ - Integrações externas                               ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  3️⃣ Fluxos Mermaid (Código ou .md)                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ graph TD                                              ││ │
│  │   A[Início Cadastro] --> B{Validar CPF}              ││ │
│  │   B -->|Válido| C[Coletar Documentos]                ││ │
│  │   B -->|Inválido| D[Rejeitar]                        ││ │
│  │   C --> E{Compliance Aprova?}                        ││ │
│  │   E -->|Sim| F[Ativar Cliente]                       ││ │
│  │   E -->|Não| G[Solicitar Correções]                  ││ │
│  │                                                       ││ │
│  │ [+ Upload Arquivo .md] ou [Colar Código]            ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  4️⃣ Documentos de Produto (Word, Markdown, Notion)          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📋 Especificacao_Cadastro_PF_v2.docx [Concluído]     ││ │
│  │ 📋 Criterios_KYC_Interno.md          [Concluído]     ││ │
│  │                                                       ││ │
│  │ [+ Upload Documento]                                 ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  5️⃣ Super Prompt (Contexto Geral)                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Preciso criar um sistema completo de Cadastro de     ││ │
│  │ Pessoa Física que:                                    ││ │
│  │                                                       ││ │
│  │ - Valide CPF na Receita Federal (integração real)   ││ │
│  │ - Colete documentos com foto (RG ou CNH)            ││ │
│  │ - Faça validação de idade mínima (18 anos)          ││ │
│  │ - Execute análise de risco anti-fraude              ││ │
│  │ - Passe por aprovação manual do Compliance          ││ │
│  │ - Integre com ViaCEP para auto-completar endereço   ││ │
│  │ - Permita cadastro de múltiplos endereços           ││ │
│  │ - Gere relatórios de clientes ativos/bloqueados     ││ │
│  │ - Tenha tela de lista com filtros (CPF, nome, UF)   ││ │
│  │ - Wizard de cadastro em 3 etapas (Dados/Docs/Review)││ │
│  │                                                       ││ │
│  │ Seguir regulamentações BACEN:                        ││ │
│  │ - Resolução 4.753 (KYC)                              ││ │
│  │ - Circular 3.978 (PLD/FT)                            ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  6️⃣ Objetivo Final                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ⚪ Gestão de Entidades (PF/PJ)                        ││ │
│  │ ⚪ Processo Transacional (PIX/TED)                    ││ │
│  │ ⚪ Fluxo de Aprovação (KYC/AML)                       ││ │
│  │ ⚪ Integração Externa                                 ││ │
│  │ ⚪ Dashboard/Relatório                                ││ │
│  │ ⚪ Outro (AI vai detectar)                            ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Cancelar]                        [🚀 Processar Contexto] │
└─────────────────────────────────────────────────────────────┘
```

### O Que Acontece ao Clicar "Processar Contexto"?

```typescript
// orchestrator-agent/src/context_processor.ts

class ContextProcessorOrchestrator {
  async processContext(inputs: ContextInputs): Promise<Specification> {

    // FASE 1A: ANÁLISE MULTI-MODAL

    // 1. PDFs BACEN → Extrai texto + Analisa regulamentações
    const bacenRules = [];
    for (const pdf of inputs.documentos_bacen) {
      const texto = await this.documentParser.parsePDF(pdf);
      const analise = await this.llm.analyzeRegulation(texto, {
        prompt: `Analise este documento BACEN e extraia:
        1. Requisitos obrigatórios (MUST)
        2. Validações de dados
        3. Limites e restrições
        4. Procedimentos de compliance
        Retorne JSON estruturado.`
      });
      bacenRules.push(analise);
    }

    // 2. Diagramas Whimsical → Vision API lê fluxo
    const processFlows = [];
    for (const diagrama of inputs.diagramas_whimsical) {
      const imageData = fs.readFileSync(diagrama);
      const analise = await this.anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageData.toString('base64')
              }
            },
            {
              type: 'text',
              text: `Analise este diagrama de processo e extraia:
              1. Etapas sequenciais (nodes)
              2. Decisões (if/else branches)
              3. Aprovações humanas
              4. Integrações com sistemas externos
              5. Validações automáticas
              Retorne JSON no formato process_definition.`
            }
          ]
        }]
      });

      const jsonMatch = analise.content[0].text.match(/\{[\s\S]*\}/);
      processFlows.push(JSON.parse(jsonMatch[0]));
    }

    // 3. Mermaid Flows → Parser direto
    for (const mermaid of inputs.fluxos_mermaid) {
      const parsed = await this.mermaidParser.parse(mermaid);
      processFlows.push(parsed);
    }

    // 4. Docs Produto → Extrai requisitos
    const produtoReqs = [];
    for (const doc of inputs.documentos_produto) {
      const texto = await this.documentParser.parse(doc);
      const requisitos = await this.llm.extractRequirements(texto);
      produtoReqs.push(requisitos);
    }

    // FASE 1B: CONSULTA RAG (Contexto do Oráculo)

    // Busca manuais BACEN relevantes já indexados
    const contextoBACEN = await this.ragService.query({
      question: inputs.super_prompt,
      context: {
        object_types: ['manual_bacen', 'policy_interna'],
        filters: { current_state: 'VIGENTE' }
      }
    });

    // Busca integrações disponíveis no Oráculo
    const integracoesDisponiveis = await this.supercoreClient.instances.list({
      object_definition: 'integracao_externa',
      filters: { current_state: 'ATIVO' }
    });

    // FASE 1C: SÍNTESE COM LLM (Geração de Especificação)

    const prompt = `Você é um Architect Agent especializado em modelar soluções empresariais.

CONTEXTO DO ORÁCULO (Quem Somos):
${JSON.stringify(await this.getOracleConfig(), null, 2)}

MANUAIS BACEN VIGENTES:
${contextoBACEN.sources.map(s => `- ${s.codigo}: ${s.titulo}`).join('\n')}

INTEGRAÇÕES DISPONÍVEIS:
${integracoesDisponiveis.items.map(i => `- ${i.data.nome_servico} (${i.data.categoria})`).join('\n')}

INPUTS DO USUÁRIO:
1. Regras BACEN Extraídas dos PDFs:
${JSON.stringify(bacenRules, null, 2)}

2. Process Flows (Whimsical + Mermaid):
${JSON.stringify(processFlows, null, 2)}

3. Requisitos de Produto:
${JSON.stringify(produtoReqs, null, 2)}

4. Super Prompt:
${inputs.super_prompt}

5. Objetivo Final: ${inputs.objetivo_final}

TAREFA:
Gere uma ESPECIFICAÇÃO COMPLETA em Markdown com:

# Especificação: [Nome do Modelo]

## 1. Visão Geral
[Descrição do que será criado]

## 2. Entidades Necessárias (Object Definitions)
Para cada entidade:
- Nome técnico (snake_case)
- Display name (português)
- Campos (nome, tipo, obrigatório, validações)
- Estados FSM (inicial → intermediários → finais)
- Relacionamentos com outras entidades

## 3. Validações BACEN Detectadas
Lista de regras BACEN que devem ser implementadas:
- Código da norma (ex: Resolução 4.753)
- Descrição da regra
- Campos afetados
- Condição de validação

## 4. Integrações Externas Necessárias
Para cada integração:
- Nome do serviço (usar das disponíveis quando possível)
- Categoria (LEDGER, BANCO_CENTRAL, API_PUBLICA, etc)
- Operações necessárias (ex: validar_cpf, consultar_cep)
- Timing (BEFORE_RENDER, AFTER_SUBMIT, ON_DEMAND)

## 5. Agentes de Validação (MCP Action Agents)
Para cada agente:
- Nome descritivo
- Tipo (MCP_ACTION_AGENT, BACKGROUND_JOB)
- Objetivo (o que valida/processa)
- Tools necessários
- Quando executa

## 6. Process Definitions (Workflows BPM)
Para cada processo:
- Nome do processo
- Entidade principal que gerencia
- Nodes (telas, agentes, decisões, aprovações, integrações)
- Edges (fluxo entre nodes)
- Diagramas Mermaid atualizados/refinados

## 7. Telas Necessárias
Para cada tela:
- Tipo (LIST, DETAIL, EDIT, CREATE, WIZARD, APPROVAL, DASHBOARD)
- Campos/colunas exibidos
- Filtros (para LIST views)
- Layout sugerido
- Ações disponíveis

## 8. Relatórios e Dashboards
Métricas/KPIs importantes para monitorar

Retorne APENAS o Markdown, sem explicações adicionais.`;

    const response = await this.llm.generate(prompt, {
      model: 'claude-opus-4-5-20251101', // Opus para máxima qualidade
      temperature: 0.3
    });

    // Extrai especificação
    const especificacao = response.trim();

    // Persiste rascunho
    const specInstance = await this.supercoreClient.instances.create({
      object_definition: 'modelo_especificacao',
      data: {
        nome_modelo: inputs.nome_modelo,
        inputs_originais: inputs,
        especificacao_markdown: especificacao,
        versao: '1.0.0-draft'
      },
      current_state: 'RASCUNHO'
    });

    return {
      id: specInstance.id,
      especificacao: especificacao
    };
  }
}
```

---

## 📝 Fase 2: Geração Automática de Especificação (Iteração)

### Interface: Editor de Especificação

```
┌─────────────────────────────────────────────────────────────┐
│  📝 ESPECIFICAÇÃO GERADA PELA AI                            │
│  (Editável - Itere até aprovar)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Editor de Markdown com Preview]                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ # Especificação: Cadastro de Pessoa Física           ││ │
│  │                                                       ││ │
│  │ ## 1. Visão Geral                                    ││ │
│  │ Sistema completo para cadastro, validação e gestão   ││ │
│  │ de clientes Pessoa Física, incluindo:                ││ │
│  │ - Validação KYC conforme Resolução BACEN 4.753      ││ │
│  │ - Análise PLD/FT conforme Circular 3.978            ││ │
│  │ - Integração com Receita Federal (validação CPF)    ││ │
│  │ - Workflow de aprovação Compliance                   ││ │
│  │ - Análise anti-fraude automatizada                  ││ │
│  │                                                       ││ │
│  │ ## 2. Entidades Necessárias                          ││ │
│  │                                                       ││ │
│  │ ### 2.1 cliente_pf (Cliente Pessoa Física)          ││ │
│  │ **Display Name**: Cliente Pessoa Física              ││ │
│  │ **Descrição**: Pessoa física cadastrada no sistema   ││ │
│  │                                                       ││ │
│  │ **Campos**:                                           ││ │
│  │ - cpf (string, obrigatório)                          ││ │
│  │   └─ Validação: 11 dígitos + algoritmo verificador  ││ │
│  │   └─ Widget: cpf_input (máscara 999.999.999-99)     ││ │
│  │ - nome_completo (string, obrigatório)                ││ │
│  │ - data_nascimento (date, obrigatório)                ││ │
│  │   └─ Validação: idade >= 18 anos                    ││ │
│  │ - email (string, obrigatório)                        ││ │
│  │ - telefone (string, obrigatório)                     ││ │
│  │ - renda_mensal (currency, opcional)                  ││ │
│  │ - profissao (string, opcional)                       ││ │
│  │                                                       ││ │
│  │ **Estados FSM**:                                      ││ │
│  │ CADASTRO_INICIADO → DADOS_COMPLETOS →                ││ │
│  │ EM_VALIDACAO_CPF → EM_ANALISE_RISCO →               ││ │
│  │ AGUARDANDO_COMPLIANCE → APROVADO → ATIVO            ││ │
│  │                                                       ││ │
│  │ Estados de Rejeição:                                 ││ │
│  │ - REJEITADO_CPF_INVALIDO                            ││ │
│  │ - REJEITADO_RISCO_ALTO                              ││ │
│  │ - REJEITADO_COMPLIANCE                               ││ │
│  │ - BLOQUEADO (pode transicionar de ATIVO)            ││ │
│  │                                                       ││ │
│  │ **Relacionamentos**:                                  ││ │
│  │ - POSSUI → endereco_pf (1:N)                         ││ │
│  │ - POSSUI → documento_pf (1:N)                        ││ │
│  │ - VINCULADO_A → processo_kyc (1:1)                  ││ │
│  │                                                       ││ │
│  │ [... continua com mais 3 entidades ...]             ││ │
│  │                                                       ││ │
│  │ ## 3. Validações BACEN Detectadas                   ││ │
│  │ [... lista detalhada ...]                            ││ │
│  │                                                       ││ │
│  │ ## 4. Integrações Externas Necessárias              ││ │
│  │ [... lista detalhada ...]                            ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  💬 CONVERSAR COM AI (Iterar Especificação)                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Usuário: "Adicione campo RG ao cadastro"            ││ │
│  │                                                       ││ │
│  │ AI: ✅ Adicionado campo 'rg' em cliente_pf com:     ││ │
│  │ - Tipo: string                                       ││ │
│  │ - Obrigatório: sim                                   ││ │
│  │ - Validação: formato RG (XX.XXX.XXX-X)              ││ │
│  │ - Widget: rg_input                                   ││ │
│  │                                                       ││ │
│  │ Especificação atualizada! Revise seção 2.1.         ││ │
│  │                                                       ││ │
│  │ [Digite sua solicitação...]                          ││ │
│  │ [Enviar]                                              ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Regenerar Seção]  [Exportar MD]  [❌ Cancelar]  [✅ Aprovar]│
└─────────────────────────────────────────────────────────────┘
```

### Iteração com AI

```typescript
// Usuário conversa com AI para refinar especificação

async function iterarEspecificacao(
  specId: string,
  userFeedback: string
): Promise<string> {

  const currentSpec = await supercoreClient.instances.get(specId);

  const prompt = `Você está refinando uma especificação de modelo.

ESPECIFICAÇÃO ATUAL:
${currentSpec.data.especificacao_markdown}

FEEDBACK DO USUÁRIO:
${userFeedback}

TAREFA:
Atualize APENAS a parte relevante da especificação baseado no feedback.
Retorne a especificação COMPLETA atualizada em Markdown.

Mantenha toda a estrutura existente e apenas modifique/adicione o solicitado.`;

  const response = await llm.generate(prompt);

  // Atualiza instance
  await supercoreClient.instances.update(specId, {
    data: {
      ...currentSpec.data,
      especificacao_markdown: response,
      historico_iteracoes: [
        ...(currentSpec.data.historico_iteracoes || []),
        {
          timestamp: new Date().toISOString(),
          feedback: userFeedback,
          mudancas: await diffMarkdown(currentSpec.data.especificacao_markdown, response)
        }
      ]
    }
  });

  return response;
}
```

---

## 🏗️ Fase 3: Geração do Grafo de Objetos (Auto-Implementação)

### O Que Acontece ao Aprovar Especificação?

**O Architect Agent processa a especificação aprovada e gera TUDO:**

```typescript
// architect-agent/src/graph_generator.ts

class ObjectGraphGenerator {
  async generateFromSpec(specId: string): Promise<ModeloSolucao> {

    const spec = await this.supercoreClient.instances.get(specId);
    const especMd = spec.data.especificacao_markdown;

    // PASSO 1: PARSEAR ESPECIFICAÇÃO
    const parsed = this.markdownParser.parse(especMd);

    // PASSO 2: GERAR OBJECT DEFINITIONS
    const objectDefsCreated = [];

    for (const entidade of parsed.entidades) {
      // LLM gera JSON Schema completo
      const schema = await this.llm.generateJSONSchema({
        nome: entidade.nome,
        campos: entidade.campos,
        validacoes: entidade.validacoes
      });

      // LLM gera FSM
      const fsm = await this.llm.generateFSM(entidade.estados);

      // LLM gera UI Hints
      const uiHints = await this.llm.generateUIHints(entidade.campos);

      // Cria object_definition
      const objDef = await this.supercoreClient.objectDefinitions.create({
        name: entidade.nome,
        display_name: entidade.display_name,
        description: entidade.descricao,
        schema: schema,
        states: fsm,
        ui_hints: uiHints,
        relationships: entidade.relacionamentos
      });

      objectDefsCreated.push(objDef);
    }

    // PASSO 3: GERAR VALIDATION RULES (BACEN)
    const rulesCreated = [];

    for (const regraSpec of parsed.validacoes_bacen) {
      // Busca manual BACEN fonte
      const manualFonte = await this.findManualBACEN(regraSpec.codigo_norma);

      // Cria instance de regra_bacen
      const regra = await this.supercoreClient.instances.create({
        object_definition: 'regra_bacen',
        data: {
          nome_regra: regraSpec.descricao,
          dominio: regraSpec.dominio,
          tipo_regra: 'VALIDACAO',
          condicao: regraSpec.condicao,
          acao: regraSpec.acao,
          parametros: regraSpec.parametros,
          mensagem_erro: regraSpec.mensagem,
          fonte_legal_id: manualFonte?.id,
          secao_referencia: regraSpec.secao
        },
        current_state: 'VIGENTE'
      });

      // Cria relationship: regra → BASEADA_EM → manual
      if (manualFonte) {
        await this.supercoreClient.relationships.create({
          relationship_type: 'BASEADA_EM',
          source_instance_id: regra.id,
          target_instance_id: manualFonte.id
        });
      }

      rulesCreated.push(regra);
    }

    // PASSO 4: CONFIGURAR INTEGRAÇÕES
    const integracoesCreated = [];

    for (const integSpec of parsed.integracoes) {
      // Verifica se integração já existe no Oráculo
      const existing = await this.findExistingIntegration(integSpec.nome_servico);

      if (!existing) {
        // Cria nova integração
        const integ = await this.supercoreClient.instances.create({
          object_definition: 'integracao_externa',
          data: {
            nome_servico: integSpec.nome,
            categoria: integSpec.categoria,
            tipo_integracao: integSpec.tipo,
            config_conexao: integSpec.config,
            endpoints: integSpec.operacoes.map(op => ({
              operacao: op.nome,
              metodo: op.metodo,
              path: op.path,
              body_template: op.body_template
            }))
          },
          current_state: 'ATIVO'
        });

        integracoesCreated.push(integ);
      } else {
        integracoesCreated.push(existing);
      }
    }

    // PASSO 5: GERAR E DEPLOYAR MCP ACTION AGENTS
    const agentesCreated = [];

    for (const agenteSpec of parsed.agentes) {
      // LLM gera código TypeScript do agent
      const agentCode = await this.llm.generateMCPAgentCode({
        nome: agenteSpec.nome,
        objetivo: agenteSpec.objetivo,
        tools: agenteSpec.tools_necessarios,
        instrucoes: agenteSpec.instrucoes
      });

      // Salva arquivo TypeScript
      const agentPath = `mcp-agents/${agenteSpec.nome}/index.ts`;
      fs.writeFileSync(agentPath, agentCode);

      // Deploy via Kubernetes
      await this.k8s.deployAgent({
        name: agenteSpec.nome,
        image: 'supercore/mcp-agent:latest',
        code_path: agentPath
      });

      // Registra no MCP Server
      await this.mcpServer.registerAgent({
        id: agenteSpec.nome,
        name: agenteSpec.nome,
        tools: agenteSpec.tools_necessarios
      });

      agentesCreated.push({ nome: agenteSpec.nome, deployed: true });
    }

    // PASSO 6: GERAR PROCESS DEFINITIONS (BPM)
    const processesCreated = [];

    for (const processSpec of parsed.process_definitions) {
      // Cria instance de process_definition
      const processDef = await this.supercoreClient.instances.create({
        object_definition: 'process_definition',
        data: {
          nome_processo: processSpec.nome,
          entidade_principal: {
            object_definition_name: processSpec.entidade_principal,
            acao: 'CRIAR_E_EVOLUIR'
          },
          nodes: processSpec.nodes,
          edges: processSpec.edges
        },
        current_state: 'ATIVO'
      });

      // Roda ScreenTypeAnalyzer
      const screenAnalysis = await this.screenAnalyzer.analyze(processDef.id);

      // Persiste análise em metadata
      await this.supercoreClient.instances.update(processDef.id, {
        metadata: {
          screen_type_analysis: screenAnalysis
        }
      });

      processesCreated.push(processDef);
    }

    // PASSO 7: CRIAR META-OBJETO "MODELO"
    const modelo = await this.supercoreClient.instances.create({
      object_definition: 'modelo_solucao',
      data: {
        nome_modelo: spec.data.nome_modelo,
        descricao: parsed.visao_geral,
        versao: '1.0.0',
        inputs_originais: spec.data.inputs_originais,
        especificacao_aprovada: especMd,
        componentes: {
          object_definitions: objectDefsCreated.map(o => ({
            id: o.id,
            name: o.name,
            display_name: o.display_name
          })),
          validation_rules: rulesCreated.map(r => r.id),
          integracoes: integracoesCreated.map(i => ({
            id: i.id,
            nome_servico: i.data.nome_servico
          })),
          agentes: agentesCreated,
          process_definitions: processesCreated.map(p => ({
            id: p.id,
            nome_processo: p.data.nome_processo
          }))
        },
        telas_geradas: screenAnalysis.flatMap(sa => ({
          rota: `/app/${spec.data.nome_modelo}/${sa.node_id}`,
          tipo: sa.screen_type,
          descricao: sa.screen_config.descricao
        }))
      },
      current_state: 'PREVIEW'
    });

    // PASSO 8: CRIAR RELATIONSHIPS (Modelo → Componentes)
    for (const objDef of objectDefsCreated) {
      await this.supercoreClient.relationships.create({
        relationship_type: 'CONTEM',
        source_instance_id: modelo.id,
        target_instance_id: objDef.id
      });
    }

    return modelo;
  }
}
```

---

## ✅ Fase 4: Criação do Modelo (Preview + Aprovação)

### Interface: Preview do Modelo Gerado

```
┌─────────────────────────────────────────────────────────────┐
│  👁️  PREVIEW DO MODELO GERADO                               │
│  (Revise antes de aprovar criação final)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 MODELO: Cadastro de Pessoa Física v1.0.0               │
│                                                             │
│  ✅ OBJECT DEFINITIONS CRIADOS (4)                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. cliente_pf (Cliente Pessoa Física)                ││ │
│  │    ├─ 9 campos (cpf, nome, email, ...)              ││ │
│  │    ├─ FSM: 7 estados, 12 transições                 ││ │
│  │    └─ Relationships: POSSUI endereco_pf, documento  ││ │
│  │                                                       ││ │
│  │ 2. endereco_pf (Endereço)                            ││ │
│  │    ├─ 8 campos (cep, logradouro, ...)               ││ │
│  │    └─ Integração ViaCEP auto-configurada            ││ │
│  │                                                       ││ │
│  │ 3. documento_pf (Documentos)                         ││ │
│  │    ├─ 5 campos (tipo, numero, arquivo, ...)         ││ │
│  │    └─ States: PENDENTE_UPLOAD → VALIDADO → APROVADO ││ │
│  │                                                       ││ │
│  │ 4. processo_kyc (Processo KYC)                       ││ │
│  │    └─ Vinculado a cliente_pf (1:1)                   ││ │
│  │                                                       ││ │
│  │ [Ver Schemas JSON Completos]                         ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✅ VALIDATION RULES (12)                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • CPF: validação algorítmica + Receita Federal       ││ │
│  │   └─ Fonte: Circular 3.978, Seção 4.2               ││ │
│  │ • Idade mínima 18 anos                                ││ │
│  │   └─ Fonte: Resolução 4.753, Artigo 5º              ││ │
│  │ • Documento com foto obrigatório                     ││ │
│  │   └─ Fonte: Resolução 4.753, Artigo 7º              ││ │
│  │ • ... (mais 9 regras)                                ││ │
│  │                                                       ││ │
│  │ [Ver Regras Completas]                               ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✅ INTEGRAÇÕES CONFIGURADAS (4)                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. Receita Federal API [✓ Testado]                  ││ │
│  │    └─ Operação: validar_cpf                         ││ │
│  │                                                       ││ │
│  │ 2. ViaCEP [✓ Testado]                                ││ │
│  │    └─ Operação: consultar_cep                       ││ │
│  │                                                       ││ │
│  │ 3. Data Rudder (Anti-Fraude) [✓ Testado]            ││ │
│  │    └─ Operação: avaliar_risco_cliente               ││ │
│  │                                                       ││ │
│  │ 4. TigerBeetle Ledger [✓ Testado]                   ││ │
│  │    └─ (Já configurado no Oráculo)                   ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✅ AGENTES DEPLOYADOS (3)                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. agente_validar_cpf_receita [🟢 Running]          ││ │
│  │    └─ MCP Action Agent (Kubernetes Pod)             ││ │
│  │    └─ Tools: http_request, json_parse               ││ │
│  │                                                       ││ │
│  │ 2. agente_validar_documentos [🟢 Running]            ││ │
│  │    └─ Vision OCR + Validation                       ││ │
│  │                                                       ││ │
│  │ 3. agente_score_risco [🟢 Running]                   ││ │
│  │    └─ Integração com Data Rudder                    ││ │
│  │                                                       ││ │
│  │ [Ver Logs dos Agents]                                ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✅ PROCESS DEFINITIONS (1)                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ processo_onboarding_pf                                ││ │
│  │ ├─ 15 nodes (5 telas, 3 agentes, 2 decisões, ...)   ││ │
│  │ ├─ 18 edges (fluxo completo)                         ││ │
│  │ └─ Screen analysis: 4 telas geradas                  ││ │
│  │                                                       ││ │
│  │ [Visualizar Fluxo BPM]                               ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✅ TELAS AUTO-GERADAS (4)                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. Wizard Cadastro (3 etapas)                        ││ │
│  │    └─ /app/cadastro-pf/wizard                       ││ │
│  │    └─ Etapas: Dados Pessoais / Endereços / Docs     ││ │
│  │                                                       ││ │
│  │ 2. Lista Clientes PF                                 ││ │
│  │    └─ /app/cadastro-pf/lista                        ││ │
│  │    └─ Filtros: CPF, Nome, UF, Estado                ││ │
│  │    └─ Colunas: CPF, Nome, Data Cadastro, Estado     ││ │
│  │                                                       ││ │
│  │ 3. Detalhe Cliente PF                                ││ │
│  │    └─ /app/cadastro-pf/:id                          ││ │
│  │    └─ Layout: Tabs (Dados / Endereços / Docs)       ││ │
│  │                                                       ││ │
│  │ 4. Aprovação Compliance                              ││ │
│  │    └─ /app/cadastro-pf/aprovacoes                   ││ │
│  │    └─ Opções: Aprovar / Rejeitar / Solicitar Docs   ││ │
│  │                                                       ││ │
│  │ [Preview das Telas]                                  ││ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  📊 ESTATÍSTICAS                                            │
│  • Total Object Definitions: 4                              │
│  • Total Validation Rules: 12 (8 BACEN + 4 custom)         │
│  • Total Integrações: 4                                     │
│  • Total Agentes: 3 (todos deployados)                      │
│  • Total Process Definitions: 1                             │
│  • Total Telas: 4 (100% auto-geradas)                       │
│                                                             │
│  [Exportar Documentação]  [❌ Rejeitar]  [✅ Aprovar Modelo]│
└─────────────────────────────────────────────────────────────┘
```

### Ao Aprovar Modelo

```typescript
// Transiciona modelo para ATIVO
await supercoreClient.instances.transition({
  instance_id: modeloId,
  to_state: 'ATIVO',
  comment: 'Modelo aprovado e pronto para uso'
});

// Publica evento
eventBus.publish({
  type: 'MODELO_ATIVADO',
  modelo_id: modeloId,
  nome: 'Cadastro de Pessoa Física',
  componentes_created: [/* ... */]
});

// Redireciona para página de uso
router.push(`/app/modelos/${modeloId}/usar`);
```

---

## 🎯 Fase 5: Uso do Modelo (Criar Instâncias)

### Interface: Menu Auto-Gerado

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 LBPAY - SuperCore Platform                              │
├─────────────────────────────────────────────────────────────┤
│  📂 MODELOS ATIVOS                                          │
│                                                             │
│  📋 Cadastro de Pessoa Física v1.0.0                        │
│  ├─ 👤 Clientes PF                                          │
│  │  ├─ Novo Cliente (Wizard 3 etapas)                      │
│  │  ├─ Lista de Clientes (47 ativos, 12 pendentes)         │
│  │  └─ Aprovações Pendentes (5)                            │
│  ├─ 📍 Endereços                                            │
│  ├─ 📄 Documentos                                           │
│  └─ 📊 Dashboard KYC                                        │
│                                                             │
│  💰 Processamento PIX v1.0.0 (outro modelo)                 │
│  └─ ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo: Usuário Cria Nova Instância

```
1. USUÁRIO: Clica "Novo Cliente"
   ↓
2. FRONTEND: Renderiza WizardViewScreen (3 etapas)
   • Busca screen_type_analysis do process_definition
   • Identifica: screen_type = WIZARD, 3 etapas
   • Renderiza FormGenerator para cada etapa
   ↓
3. ETAPA 1: Dados Pessoais
   • Usuário preenche: CPF, Nome, Data Nascimento, Email, Telefone
   • BacenValidationEngine valida em real-time
   • Próxima etapa habilitada
   ↓
4. ETAPA 2: Endereços
   • Usuário digita CEP
   • ViaCEP integração auto-completa Logradouro, Cidade, UF
   • Pode adicionar múltiplos endereços
   ↓
5. ETAPA 3: Documentos
   • Upload RG (frente/verso)
   • Upload Selfie
   • Preview antes de submeter
   ↓
6. SUBMIT WIZARD
   • SuperCore valida JSON Schema (estrutural)
   • Cria instance de cliente_pf (estado: CADASTRO_INICIADO)
   • Process Executor inicia processo_onboarding_pf
   ↓
7. PROCESS EXECUTOR: Executa Nodes Automaticamente

   Node 1: agente_validar_cpf_receita (AGENTE)
   • MCP Agent executa via SuperCore Integration Manager
   • Chama Receita Federal API
   • Se CPF inválido: transiciona para REJEITADO_CPF_INVALIDO
   • Se válido: avança

   Node 2: agente_validar_documentos (AGENTE)
   • Vision OCR analisa RG + Selfie
   • Compara foto RG vs Selfie
   • Valida vigência documento
   • Marca documentos como VALIDADO

   Node 3: agente_score_risco (AGENTE)
   • Chama Data Rudder (anti-fraude)
   • Calcula risk_score
   • Se score > 75: vai para aprovação manual
   • Se score < 75: auto-aprova

   Node 4: acao_compliance_aprovar (ACAO_HUMANA)
   • Cria tarefa para Compliance Analyst
   • SLA: 24h
   • Notifica via Slack/Email
   • Aguarda decisão humana

   Node 5: Decisão (DECISAO)
   • Se aprovado: transiciona cliente_pf para APROVADO → ATIVO
   • Se rejeitado: transiciona para REJEITADO_COMPLIANCE
   ↓
8. CLIENTE ATIVO
   • Instância de cliente_pf está em estado ATIVO
   • Pode ser usado em outros modelos (ex: Abertura Conta, PIX)
   • Aparece na Lista de Clientes
   • Métricas do Dashboard atualizadas
```

---

## 🏗️ Arquitetura Técnica Completa

### Camadas da Plataforma

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 0: META-OBJETOS (Conhecimento e Governança)        │
│  ========================================================== │
│                                                             │
│  oracle_config (Consciência da Solução)                    │
│  ├─ Identidade (CNPJ, ISPB, Licenças)                      │
│  ├─ Regulamentações (BACEN, CVM, SUSEP)                    │
│  └─ Integrações disponíveis (TigerBeetle, LB Connect, ...) │
│                                                             │
│  manual_bacen (Híbrido: Instance + Embeddings)             │
│  ├─ Instance (PostgreSQL): Rastreabilidade, FSM, Relationships│
│  └─ Embeddings (pgvector): RAG Semântico                   │
│                                                             │
│  policy_interna (Híbrido: Instance + Embeddings)           │
│  ├─ Políticas criadas pela empresa                         │
│  └─ Indexadas para RAG                                      │
│                                                             │
│  regra_bacen (Regras Executáveis)                          │
│  ├─ Derivadas de manuais BACEN                             │
│  ├─ Relationship: BASEADA_EM → manual_bacen                │
│  └─ Interpretadas por aplicações (LBPAY)                   │
│                                                             │
│  integracao_externa (Serviços como Objetos)                │
│  ├─ TigerBeetle, BACEN SPI, LB Connect, LB Dict            │
│  ├─ Orchestration-GO, Money-Moving                         │
│  └─ APIs públicas (ViaCEP, Receita Federal)                │
│                                                             │
│  crawler_source (Monitores de Fontes Externas)             │
│  └─ Websites BACEN, CVM, Receita Federal                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ GOVERNAM
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1: MODELOS DE SOLUÇÃO (Gerados pela AI)            │
│  ========================================================== │
│                                                             │
│  modelo_solucao (Meta-Objeto que agrupa tudo)              │
│  ├─ nome: "Cadastro Pessoa Física v1.0.0"                  │
│  ├─ Componentes:                                            │
│  │  ├─ object_definitions (cliente_pf, endereco_pf, ...)   │
│  │  ├─ validation_rules (12 regras BACEN + custom)         │
│  │  ├─ integracoes (Receita, ViaCEP, Data Rudder)          │
│  │  ├─ agentes (3 MCP Action Agents deployados)            │
│  │  └─ process_definitions (1 workflow BPM)                │
│  └─ Telas auto-geradas (4 screens)                          │
│                                                             │
│  Relationships:                                             │
│  └─ modelo_solucao --CONTEM--> object_definition            │
│  └─ modelo_solucao --USA--> integracao_externa              │
│  └─ modelo_solucao --EXECUTA--> mcp_action_agent            │
└─────────────────────────────────────────────────────────────┘
                          ↓ CRIAM
┌────────────���────────────────────────────────────────────────┐
│  CAMADA 2: INSTANCES (Dados Vivos)                         │
│  ========================================================== │
│                                                             │
│  instances de cliente_pf                                    │
│  ├─ Maria Silva CPF 123.456.789-01 (ATIVO)                 │
│  ├─ João Pedro CPF 987.654.321-09 (APROVADO)               │
│  └─ ... (47 instâncias ativas)                              │
│                                                             │
│  instances de processo_kyc                                  │
│  └─ Vinculadas 1:1 com clientes_pf                          │
│                                                             │
│  Relationships:                                             │
│  └─ Maria Silva --POSSUI--> Endereço Rua A, 123            │
│  └─ Maria Silva --POSSUI--> Documento RG 12.345.678-9      │
└─────────────────────────────────────────────────────────────┘
                          ↓ PROCESSADOS POR
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 3: EXECUTION ENGINES (Motores de Runtime)          │
│  ========================================================== │
│                                                             │
│  Process Executor (Executa Workflows BPM)                   │
│  ├─ Renderiza telas (ScreenRenderer)                        │
│  ├─ Executa agentes (MCP Client)                            │
│  ├─ Chama integrações (IntegrationManager)                  │
│  └─ Gerencia transições FSM                                 │
│                                                             │
│  RAG Trimodal Híbrido (Sistema Nervoso)                    │
│  ├─ SQL Layer: Busca instances estruturadas                 │
│  ├─ Graph Layer: Navega relationships                       │
│  ├─ Vector Layer: Busca semântica em embeddings            │
│  └─ LLM: Sintetiza respostas com contexto completo          │
│                                                             │
│  Dynamic UI Generator (3 Pilares)                           │
│  ├─ FormGenerator (single formula para todos forms)        │
│  ├─ ProcessFlowVisualization (React Flow)                   │
│  └─ BacenValidationEngine (policy validation)               │
└─────────────────────────────────────────────────────────────┘
                          ↓ APRESENTADO VIA
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 4: UI AUTO-GERADA (Zero Código Manual)             │
│  ========================================================== │
│                                                             │
│  ScreenRenderer (Detecta tipo e renderiza)                 │
│  ├─ ListViewScreen (tabelas com filtros)                    │
│  ├─ DetailViewScreen (tabs, accordion)                      │
│  ├─ FormViewScreen (edit mode)                              │
│  ├─ WizardViewScreen (multi-step forms)                     │
│  ├─ ApprovalViewScreen (ação humana)                        │
│  └─ DashboardViewScreen (KPIs, métricas)                    │
│                                                             │
│  Widget Library (Extensível)                                │
│  └─ cpf, currency, date, address_br, relationship, ...     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Integração com Gateways Externos

### Módulos Externos (Fora do SuperCore)

**SuperCore é o núcleo de gestão de objetos**, mas não implementa diretamente lógica bancária. Módulos externos consomem abstrações do SuperCore:

```
┌─────────────────────────────────────────────────────────────┐
│  SUPERCORE (Engine Universal)                               │
│  ├─ object_definitions (transacao_pix, chave_pix, ...)     │
│  ├─ instances (transações concretas)                        │
│  ├─ regra_bacen (limites, validações PIX)                   │
│  └─ integracao_externa (BACEN SPI, LB Connect, etc)        │
└─────────────────────────────────────────────────────────────┘
                          ↓ APIs REST/GraphQL
┌─────────────────────────────────────────────────────────────┐
│  LB CONNECT (Gateway PIX - Integração BACEN SPI)            │
│  ├─ Consome: instances de transacao_pix                     │
│  ├─ Consome: regras_bacen para limites                      │
│  ├─ Executa: Protocolo BACEN SPI (HTTP/TLS)                │
│  ├─ Gerencia: Autenticação mTLS com BACEN                   │
│  ├─ Retorna: Status da transação PIX                        │
│  └─ Webhooks: Notifica SuperCore de PIX recebido            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LB DICT (Gateway DICT API - Gerenciamento de Chaves PIX)  │
│  ├─ Consome: instances de chave_pix                         │
│  ├─ Executa: Protocolo DICT (Cadastro, Consulta, Exclusão) │
│  ├─ Valida: Ownership de chaves                             │
│  └─ Sincroniza: Chaves com BACEN DICT                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATION-GO (Sagas e Orquestração Distribuída)       │
│  ├─ Consome: process_definitions do SuperCore               │
│  ├─ Executa: Sagas multi-serviço (TigerBeetle + BACEN)     │
│  ├─ Gerencia: Compensação de falhas (rollback)             │
│  ├─ Exemplo Saga PIX:                                       │
│  │  1. Debita origem (TigerBeetle)                         │
│  │  2. Envia PIX (LB Connect → BACEN SPI)                  │
│  │  3. Se falha BACEN: rollback TigerBeetle                │
│  └─ Notifica: SuperCore de sucesso/falha                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MONEY-MOVING (Core de Movimentação Financeira)            │
│  ├─ Consome: instances de transacao_* (PIX, TED, Boleto)   │
│  ├─ Executa: Lógica bancária (saldo, limites, tarifas)     │
│  ├─ Integra: TigerBeetle para ledger dupla-entrada         │
│  ├─ Aplica: Tarifas conforme regras BACEN                   │
│  └─ Retorna: Confirmação de movimentação                    │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo Completo: PIX via Gateways

```
1. USUÁRIO: Inicia PIX de R$ 100 via UI do SuperCore
   ↓
2. SUPERCORE: Cria instance de transacao_pix (estado: PENDENTE)
   └─ Valida JSON Schema
   └─ Valida regras_bacen (limites, horário)
   ↓
3. MONEY-MOVING: Recebe webhook do SuperCore
   └─ Valida saldo da conta origem
   └─ Calcula tarifas
   └─ Inicia Saga via ORCHESTRATION-GO
   ↓
4. ORCHESTRATION-GO: Executa Saga PIX
   ├─ Step 1: TigerBeetle.debitar(conta_origem, 100)
   │  └─ Sucesso: balance atualizado
   ├─ Step 2: LB Connect.enviarPix({valor: 100, chave: "cpf123"})
   │  └─ LB Connect → BACEN SPI (protocolo mTLS)
   │  └─ BACEN retorna: E2E_ID = "abc123xyz"
   ├─ Step 3: Aguarda confirmação BACEN (webhook)
   │  └─ BACEN confirma: PIX liquidado
   ├─ Step 4: TigerBeetle.creditar(conta_destino, 100)
   └─ Saga completa com sucesso
   ↓
5. ORCHESTRATION-GO: Notifica SuperCore
   └─ PUT /api/instances/{transacao_id}/transition
   └─ {to_state: "LIQUIDADA", bacen_e2e_id: "abc123xyz"}
   ↓
6. SUPERCORE: Atualiza transacao_pix
   └─ current_state: LIQUIDADA
   └─ metadata: {bacen_e2e_id, liquidado_em, gateway_usado: "LB Connect"}
   └─ Publica evento: TRANSACAO_PIX_LIQUIDADA
   ↓
7. UI: Atualiza em tempo real (WebSocket)
   └─ Usuário vê: "✅ PIX enviado com sucesso!"
```

---

## 🧠 RAG Trimodal Híbrido

### Arquitetura Completa

```sql
-- TABELA: instances (PostgreSQL)
-- Dados estruturados com rastreabilidade total
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    object_definition_id UUID,
    data JSONB NOT NULL,
    current_state VARCHAR(50),
    state_history JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- TABELA: relationships (Grafo em PostgreSQL)
-- Relacionamentos semânticos navegáveis
CREATE TABLE relationships (
    id UUID PRIMARY KEY,
    relationship_type VARCHAR(100),
    source_instance_id UUID REFERENCES instances(id),
    target_instance_id UUID REFERENCES instances(id),
    properties JSONB,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP
);

-- TABELA: document_embeddings (pgvector)
-- Busca semântica em manuais/políticas
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY,
    source_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    source_object_type VARCHAR(100),
    content TEXT NOT NULL,
    chunk_index INT,
    metadata JSONB,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índice vetorial HNSW (mais rápido que IVFFlat)
CREATE INDEX idx_document_embeddings_vector
ON document_embeddings
USING hnsw (embedding vector_cosine_ops);
```

### RAG Query Pipeline

```python
# rag_trimodal.py

class TrimodalRAG:
    """
    RAG que combina 3 fontes de dados:
    1. SQL: instances estruturadas (PostgreSQL)
    2. Graph: relationships navegáveis (PostgreSQL)
    3. Vector: embeddings semânticos (pgvector)
    """

    async def query(self, question: str, context: dict = None) -> RAGResponse:

        # PASSO 1: EXTRAÇÃO DE ENTIDADES (LLM)
        entities = await self.extract_entities(question)
        # Ex: "Quantos clientes aprovados temos?"
        # → {object_type: "cliente_pf", state: "APROVADO", aggregation: "count"}

        # PASSO 2: BUSCA SQL (Dados Estruturados)
        sql_data = []
        if entities.get('object_type'):
            query = self.build_sql_query(entities)
            # Ex: SELECT COUNT(*) FROM instances
            #     WHERE object_definition_id = 'cliente_pf'
            #     AND current_state = 'APROVADO'
            sql_data = await self.db.execute(query)

        # PASSO 3: BUSCA GRAPH (Relacionamentos)
        graph_data = []
        if entities.get('relationship_type'):
            query = f"""
                SELECT r.*,
                       src.data as source_data,
                       tgt.data as target_data
                FROM relationships r
                JOIN instances src ON r.source_instance_id = src.id
                JOIN instances tgt ON r.target_instance_id = tgt.id
                WHERE r.relationship_type = '{entities['relationship_type']}'
                LIMIT 100
            """
            graph_data = await self.db.execute(query)

        # PASSO 4: BUSCA VECTOR (Semântica)
        vector_data = []
        question_embedding = await self.openai.embed(question)

        query = f"""
            SELECT de.content, de.metadata,
                   i.data as instance_data,
                   1 - (de.embedding <=> $1::vector) as similarity
            FROM document_embeddings de
            JOIN instances i ON de.source_instance_id = i.id
            WHERE de.source_object_type IN ('manual_bacen', 'policy_interna')
              AND i.current_state = 'VIGENTE'
            ORDER BY de.embedding <=> $1::vector
            LIMIT 5
        """
        vector_data = await self.db.execute(query, question_embedding)

        # PASSO 5: SÍNTESE COM LLM
        prompt = f"""Você é um assistente especializado em Core Banking.

PERGUNTA DO USUÁRIO:
{question}

DADOS SQL (Instances Estruturadas):
{json.dumps(sql_data, indent=2)}

DADOS GRAPH (Relationships):
{json.dumps(graph_data, indent=2)}

DADOS VECTOR (Manuais BACEN):
{chr(10).join([f"- {v['metadata']['codigo']}: {v['content'][:200]}..." for v in vector_data])}

INSTRUÇÕES:
- Responda com base nos dados acima
- Cite números quando disponíveis
- Cite fontes legais quando relevante (código BACEN + seção)
- Use linguagem clara e objetiva

RESPOSTA:"""

        answer = await self.llm.generate(prompt, temperature=0.2)

        return RAGResponse(
            answer=answer,
            sources_sql=sql_data,
            sources_graph=graph_data,
            sources_vector=vector_data,
            confidence=vector_data[0]['similarity'] if vector_data else 0.0
        )
```

### Sincronização Automática: Instances ↔ Embeddings

```go
// backend/internal/events/embedding_sync_service.go

type EmbeddingSyncService struct {
    eventBus        EventBus
    openaiClient    *OpenAIClient
    db              *sql.DB
}

func (s *EmbeddingSyncService) Start() {
    // Subscreve eventos de manuais e políticas
    s.eventBus.Subscribe("manual_bacen", s.handleManualEvent)
    s.eventBus.Subscribe("policy_interna", s.handlePolicyEvent)
}

func (s *EmbeddingSyncService) handleManualEvent(event InstanceEvent) error {
    switch event.Type {
    case "CREATED":
        return s.createEmbeddings(event.InstanceID, event.Data)

    case "UPDATED":
        // Delete + Recreate (mais simples e seguro)
        s.deleteEmbeddings(event.InstanceID)
        return s.createEmbeddings(event.InstanceID, event.Data)

    case "DELETED":
        return s.deleteEmbeddings(event.InstanceID)

    case "STATE_CHANGED":
        // Se mudou para REVOGADO, marca embeddings como inativos
        if event.Data.NewState == "REVOGADO" {
            return s.deactivateEmbeddings(event.InstanceID)
        }
    }
    return nil
}

func (s *EmbeddingSyncService) createEmbeddings(instanceID string, data map[string]interface{}) error {
    manual := data.(map[string]interface{})
    secoes := manual["secoes"].([]interface{})

    for i, secao := range secoes {
        conteudo := secao["conteudo"].(string)

        // Chunk do texto (~1000 tokens)
        chunks := chunkText(conteudo, 1000)

        for j, chunk := range chunks {
            // Gera embedding via OpenAI
            embedding, _ := s.openaiClient.CreateEmbedding(chunk)

            // Salva no banco
            s.db.Exec(`
                INSERT INTO document_embeddings (
                    source_instance_id, source_object_type, content,
                    chunk_index, metadata, embedding
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, instanceID, "manual_bacen", chunk, i*100+j,
               buildMetadata(manual, secao),
               pgvector.NewVector(embedding))
        }
    }
    return nil
}
```

---

## 🗓️ Roadmap de Implementação

### Fases Revisadas

#### Fase 0: Setup Inicial (2 semanas)
- [ ] Configuração do Oráculo (interface + backend)
- [ ] Upload e processamento de manuais BACEN
- [ ] Configuração de integrações externas
- [ ] Testes de conectividade

#### Fase 1: AI Context Generator (4 semanas)
- [ ] Página "Novo Contexto" (frontend)
- [ ] Document Parser (PDFs, Word, Markdown)
- [ ] Vision API integration (Whimsical diagrams)
- [ ] Mermaid Parser
- [ ] Context Processor Orchestrator
- [ ] Geração de especificação via LLM

#### Fase 2: Especification Editor (2 semanas)
- [ ] Markdown editor com preview
- [ ] Chat iterativo com AI
- [ ] Diff viewer (mudanças entre versões)
- [ ] Aprovação de especificação

#### Fase 3: Object Graph Generator (6 semanas)
- [ ] LLM JSON Schema generator
- [ ] LLM FSM generator
- [ ] LLM UI Hints generator
- [ ] Validation rules mapper
- [ ] Integration configurator
- [ ] MCP Agent code generator
- [ ] Kubernetes deployment automation
- [ ] Process definition generator
- [ ] Screen type analyzer

#### Fase 4: Modelo Solução (2 semanas)
- [ ] object_definition: modelo_solucao
- [ ] Preview interface
- [ ] Deployment orchestrator
- [ ] Relationship creator (modelo → componentes)

#### Fase 5: Dynamic UI (4 semanas)
- [ ] ScreenRenderer (detecta tipo e renderiza)
- [ ] ListViewScreen (tabelas com filtros)
- [ ] FormViewScreen (edit mode)
- [ ] WizardViewScreen (multi-step)
- [ ] ApprovalViewScreen (ação humana)
- [ ] DashboardViewScreen (KPIs)
- [ ] Widget library (11 widgets)

#### Fase 6: Process Executor (3 semanas)
- [ ] Process executor engine (Go)
- [ ] Node executors (TELA, AGENTE, DECISAO, ACAO_HUMANA, INTEGRACAO)
- [ ] process_instance tracking
- [ ] Human task management (SLA, notifications)

#### Fase 7: RAG Trimodal (3 semanas)
- [ ] Embedding sync service (event-driven)
- [ ] Entity extractor (LLM)
- [ ] SQL query builder
- [ ] Graph navigator
- [ ] Vector searcher
- [ ] LLM synthesizer
- [ ] RAG API endpoints

#### Fase 8: Gateways Integration (4 semanas)
- [ ] LB Connect integration
- [ ] LB Dict integration
- [ ] Orchestration-GO integration
- [ ] Money-Moving integration
- [ ] TigerBeetle integration
- [ ] Webhook receivers

#### Fase 9: Production Readiness (3 semanas)
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Alerting (PagerDuty)
- [ ] Logging (ELK Stack)
- [ ] Distributed tracing (Jaeger)
- [ ] Load testing (k6)
- [ ] Security audit
- [ ] Compliance validation

**TOTAL: ~33 semanas (~8 meses)**

---

## ✅ Métricas de Sucesso

### Fase Final (Produção)

**Quando consideramos o SuperCore pronto?**

1. ✅ Time de Produto cria modelo completo (Cadastro PF) em < 2 horas
2. ✅ Zero linhas de código manual necessárias
3. ✅ 100 instâncias criadas sem erros (via UI auto-gerada)
4. ✅ RAG responde 50 perguntas com precisão > 90%
5. ✅ Process Executor executa workflow completo (onboarding) sem falhas
6. ✅ Agentes MCP validam dados em < 3 segundos
7. ✅ Integrações com gateways (LB Connect, LB Dict) funcionam
8. ✅ PIX end-to-end (SuperCore → Money-Moving → LB Connect → BACEN) em < 5 segundos
9. ✅ Uptime > 99.9% (1 mês de produção)
10. ✅ 10.000 transações/dia processadas

---

## 📖 Conclusão

**SuperCore não é apenas uma plataforma. É uma REVOLUÇÃO na forma de criar software empresarial.**

### O Que Entregamos?

```
INPUT: Linguagem Natural + Documentos + Diagramas
  ↓
PROCESSAMENTO: AI Agents (Vision, NLP, Code Gen, Deploy)
  ↓
OUTPUT: Solução Completa Funcionando
  • Object Definitions
  • Validation Rules (BACEN + Custom)
  • Process Workflows (BPM)
  • MCP Action Agents (deployed)
  • Integrações (configuradas e testadas)
  • Telas (100% auto-geradas)
  • Zero Código Manual
```

### Por Que Isso é Revolucionário?

1. **Zero Desenvolvedores Necessários** (após SuperCore implementado)
2. **Time de Produto é Autônomo** (cria soluções em horas/dias)
3. **Compliance Sempre Atualizado** (manuais BACEN → regras automáticas)
4. **Rastreabilidade Total** (toda decisão tem fonte legal)
5. **Evolução Sem Breaking Changes** (versionamento de modelos)
6. **Multi-Domínio** (mesma plataforma para Banking, CRM, ERP, Hospital, etc)

### Próximos Passos

1. ✅ Aprovar esta visão arquitetural
2. ✅ Configurar Oráculo (LBPAY consciência)
3. ✅ Implementar Fase 0-1 (Context Generator)
4. ✅ Criar primeiro modelo de teste (Cadastro PF simplificado)
5. ✅ Validar fluxo end-to-end
6. ✅ Iterar até perfeição

---

**Let's build the future. 🚀**

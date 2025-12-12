# Mocks de UI e Navegação - Fase 1: AI-Driven Context Generator

**Status**: ✅ Mocks Completos (Aguardando Aprovação)
**Versão**: 2.0.0
**Data**: 2025-12-11
**Mocks Criados**: 2025-12-11
**Aprovação**: ⏸️ Pendente Revisão Time de Produto

---

## 🔗 Referências Obrigatórias

> **⚠️ DOCUMENTO PRIMÁRIO**: Este documento descreve a UI para implementação da **Fase 1 revisada** baseada em:
>
> **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **ESSENCIAL**
>
> **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - ⭐⭐ **PLANEJAMENTO COMPLETO**

**Fase 1 revisada é**: AI-Driven Context Generator (upload multi-modal + processamento)

**NÃO é**: Foundation com 15 REST endpoints (versão antiga deletada)

---

## ⚠️ REGRA CRÍTICA

**NENHUMA linha de código de UI será escrita antes de:**

1. ✅ **Mocks completos criados** - ✅ COMPLETO ([ver mocks](mocks/))
2. ⏸️ Time de Produto aprovar todos os layouts
3. ⏸️ Time Técnico validar viabilidade técnica
4. ⏸️ Status deste documento mudar para "🟢 Aprovado"

**Violação desta regra resulta em retrabalho e desperdício de tempo.**

---

## 1. Visão Geral da Navegação

### 1.1 Estrutura de Navegação Principal

```
SuperCore - AI-Driven Context Generator
│
├── 🏠 Home / Dashboard
│   └── Visão geral e acesso rápido
│
├── ➕ Novo Contexto
│   ├── Upload de Arquivos (multi-modal)
│   ├── Super Prompt (textarea)
│   └── Botão "Processar Contexto"
│
├── 📋 Contextos
│   ├── Lista de Contextos (tabela)
│   └── Detalhes de Contexto
│       ├── Ver Arquivos Uploaded
│       ├── Ver Status de Processamento
│       ├── Ver Resultado (processed_data)
│       └── Reprocessar (se falhou)
│
└── ⚙️ Configurações (futuro)
    └── Integrações com AI Services
```

---

## 2. Mocks de Telas ✅ COMPLETOS

> **📁 Localização**: [docs/fases/fase1/mocks/](mocks/)
>
> Todos os 5 mocks HTML foram criados com JavaScript funcional, dados realistas e navegação completa entre telas.

### 2.1 Home / Dashboard

**Propósito**: Página inicial com overview e acesso rápido

**Elementos de UI**:
- [x] Header com logo "SuperCore" e navegação
- [x] Hero section:
  - [x] Título: "AI-Driven Context Generator"
  - [x] Subtítulo: "Faça upload de documentação e deixe a IA gerar modelos completos"
  - [x] Botão principal: "Criar Novo Contexto" (grande, destacado)
- [x] Cards de métricas:
  - [x] Total de Contextos Criados
  - [x] Contextos em Processamento
  - [x] Contextos Processados com Sucesso
  - [x] Taxa de Sucesso (%)
- [x] Seção "Contextos Recentes":
  - [x] Lista dos 5 últimos contextos (mini-cards)
  - [x] Link "Ver Todos os Contextos"
- [x] Seção "Como Funciona" (ilustrativa):
  - [x] Passo 1: Upload de Documentação
  - [x] Passo 2: Processamento via IA
  - [x] Passo 3: Modelo Gerado

**Mock**: ✅ Completo ([01-home-dashboard.html](mocks/01-home-dashboard.html))

**Navegação**:
- Clicar "Criar Novo Contexto" → Tela 2.2 (Novo Contexto)
- Clicar "Ver Todos os Contextos" → Tela 2.3 (Lista de Contextos)
- Clicar em um contexto recente → Tela 2.4 (Detalhes de Contexto)

---

### 2.2 Novo Contexto (Upload Interface)

**Propósito**: Interface de upload multi-modal e entrada de super prompt

**Elementos de UI**:

**Seção 1: Upload de Arquivos**
- [x] Título: "Novo Contexto - Upload de Documentação"
- [x] Componente FileUploader:
  - [x] Área de drag & drop (grande, visível)
  - [x] Texto: "Arraste arquivos aqui ou clique para selecionar"
  - [x] Tipos aceitos exibidos: PDF, PNG, JPG, SVG, TXT, MD
  - [x] Limite de tamanho exibido: "Máximo 50MB por arquivo"
  - [x] Botão "Selecionar Arquivos"
- [x] Lista de Arquivos Uploaded:
  - [x] Para cada arquivo:
    - [x] Ícone do tipo de arquivo
    - [x] Nome do arquivo
    - [x] Tamanho
    - [x] Preview (se imagem/PDF)
    - [x] Botão "Remover" (X)
  - [x] Suporta múltiplos arquivos
  - [x] Ordenação drag & drop

**Seção 2: Super Prompt**
- [x] Label: "Super Prompt (Descrição da Solução)"
- [x] Textarea grande (mínimo 10 linhas)
- [x] Placeholder: "Descreva a solução que você quer criar. Exemplo: 'Criar Core Banking para IP com PIX, contas correntes, KYC conforme BACEN...'"
- [x] Contador de caracteres (mínimo: 100 caracteres)
- [x] Help text: "Seja o mais específico possível. Mencione regulamentações, funcionalidades desejadas, integrações necessárias."

**Seção 3: Metadados (opcional)**
- [x] Campo: "Nome do Contexto" (opcional, auto-gerado se vazio)
- [x] Campo: "Tags" (chips input, para organização)

**Seção 4: Ações**
- [x] Botão "Salvar Rascunho" (secondary)
- [x] Botão "Processar Contexto" (primary, disabled se validações não passarem)
- [x] Botão "Cancelar" (text)

**Validações Client-Side**:
- [x] Pelo menos 1 arquivo uploaded OU super prompt preenchido
- [x] Super prompt com mínimo 100 caracteres
- [x] Tamanho total dos arquivos < 200MB
- [x] Tipos de arquivo válidos

**Mock**: ✅ Completo ([02-novo-contexto.html](mocks/02-novo-contexto.html))

**Navegação**:
- Clicar "Salvar Rascunho" → Salva e redireciona para Tela 2.3 (Lista)
- Clicar "Processar Contexto" → Inicia processamento e redireciona para Tela 2.5 (Status)
- Clicar "Cancelar" → Volta para Home

---

### 2.3 Lista de Contextos

**Propósito**: Visualizar todos os contextos criados com status

**Elementos de UI**:
- [x] Header: "Meus Contextos"
- [x] Botão: "Criar Novo Contexto" (top-right)
- [x] Filtros:
  - [x] Por Status: Todos, Rascunho, Processando, Sucesso, Erro
  - [x] Por Data: Últimos 7 dias, Últimos 30 dias, Todo o período
  - [x] Busca por nome/tags
- [x] Tabela de Contextos:
  - [x] Colunas:
    - [x] ID (truncado, tooltip com completo)
    - [x] Nome/Descrição
    - [x] Arquivos (ícones pequenos, ex: 📄 PDF, 🖼️ IMG)
    - [x] Status (badge colorido)
    - [x] Data de Criação
    - [x] Última Atualização
    - [x] Ações (botões icon)
  - [x] Status badges:
    - [x] 🟡 RASCUNHO (amarelo)
    - [x] 🔵 PROCESSANDO (azul, com spinner)
    - [x] 🟢 SUCESSO (verde)
    - [x] 🔴 ERRO (vermelho)
- [x] Ações por linha:
  - [x] Ver Detalhes (ícone olho)
  - [x] Reprocessar (ícone refresh, apenas se ERRO)
  - [x] Deletar (ícone lixeira, com confirmação)
- [x] Paginação

**Mock**: ✅ Completo ([03-lista-contextos.html](mocks/03-lista-contextos.html))

**Navegação**:
- Clicar "Criar Novo Contexto" → Tela 2.2
- Clicar "Ver Detalhes" → Tela 2.4 (Detalhes de Contexto)
- Clicar linha da tabela → Tela 2.4

---

### 2.4 Detalhes de Contexto

**Propósito**: Ver informações completas, arquivos, status e resultado de processamento

**Elementos de UI**:

**Header**:
- [x] Breadcrumb: Contextos > [Nome do Contexto]
- [x] Badge de Status (grande)
- [x] Título: Nome do contexto ou "Contexto [ID]"
- [x] Data de criação
- [x] Botão "Reprocessar" (se ERRO)
- [x] Botão "Editar" (se RASCUNHO)
- [x] Botão "Deletar"

**Tabs**:

**Tab 1: "Visão Geral"**
- [x] Super Prompt (exibido como texto formatado)
- [x] Lista de Arquivos Uploaded:
  - [x] Para cada arquivo:
    - [x] Nome, tipo, tamanho
    - [x] Botão "Download"
    - [x] Preview (se PDF/imagem) em modal
- [x] Metadados:
  - [x] ID
  - [x] Data de criação
  - [x] Última atualização
  - [x] Tags

**Tab 2: "Status de Processamento"**
- [x] Timeline visual do processamento:
  - [x] Etapa 1: Upload Completo ✅
  - [x] Etapa 2: Processando PDFs (com progress bar se em andamento)
  - [x] Etapa 3: Analisando Diagramas (com progress bar se em andamento)
  - [x] Etapa 4: Consolidando Dados
  - [x] Etapa 5: Finalizado ✅ ou Erro ❌
- [x] Para cada etapa:
  - [x] Status (Pendente, Em Progresso, Completo, Erro)
  - [x] Timestamp
  - [x] Logs (se houver, expansível)
- [x] Se ERRO:
  - [x] Mensagem de erro detalhada
  - [x] Stack trace (colapsável, apenas para devs)
  - [x] Sugestões de correção

**Tab 3: "Resultado" (apenas se SUCESSO)**
- [x] Seção "Dados Extraídos de PDFs":
  - [x] Para cada PDF:
    - [x] Nome do arquivo
    - [x] Seções identificadas (lista expansível)
    - [x] Tabelas extraídas (preview em formato tabela)
    - [x] Metadados (tipo de documento, data, etc.)
- [x] Seção "Dados Extraídos de Diagramas":
  - [x] Para cada imagem:
    - [x] Nome do arquivo
    - [x] Entidades identificadas (lista com badges)
    - [x] Relacionamentos identificados (lista)
    - [x] Fluxos detectados (descrição textual)
- [x] Seção "Dados Consolidados":
  - [x] JSON viewer (formatado, syntax highlight)
  - [x] Botão "Copiar JSON"
  - [x] Botão "Download JSON"

**Tab 4: "Logs Técnicos" (apenas para devs/debug)**
- [x] Logs completos de processamento
- [x] Timestamps
- [x] Níveis (INFO, WARNING, ERROR)
- [x] Filtros por nível

**Mock**: ✅ Completo ([04-detalhes-contexto.html](mocks/04-detalhes-contexto.html))

**Navegação**:
- Clicar "Editar" → Volta para Tela 2.2 (modo edição)
- Clicar "Reprocessar" → Tela 2.5 (Status em Tempo Real)
- Clicar "Voltar" → Tela 2.3 (Lista)

---

### 2.5 Processamento em Tempo Real (Status Live)

**Propósito**: Exibir status de processamento em tempo real após clicar "Processar Contexto"

**Elementos de UI**:
- [x] Header: "Processando Contexto..."
- [x] Progress bar geral (0-100%)
- [x] Seção de etapas (lista vertical):
  - [x] Cada etapa mostra:
    - [x] Nome da etapa
    - [x] Status: ⏸️ Pendente, 🔵 Em Progresso, ✅ Completo, ❌ Erro
    - [x] Progress bar individual (se em progresso)
    - [x] Tempo estimado restante
- [x] Logs em tempo real (scrollable, auto-scroll para última linha):
  - [x] Timestamp + mensagem
  - [x] Highlight para WARNINGs e ERRORs
- [x] Botão "Ver em Background" (permite sair da tela sem cancelar)
- [x] Se completar com sucesso:
  - [x] Mensagem: "✅ Processamento Concluído com Sucesso!"
  - [x] Botão "Ver Resultado" → Tela 2.4 (Tab "Resultado")
- [x] Se falhar:
  - [x] Mensagem: "❌ Erro no Processamento"
  - [x] Descrição do erro
  - [x] Botão "Tentar Novamente"
  - [x] Botão "Ver Detalhes" → Tela 2.4 (Tab "Status")

**Mock**: ✅ Completo ([05-processamento.html](mocks/05-processamento.html))

**Polling/WebSocket**:
- [x] Atualização em tempo real via polling (GET /context/:id/status a cada 2s)
- [x] Ou WebSocket para updates live (preferível)

---

## 3. Componentes UI Reutilizáveis

### 3.1 FileUploader Component

**Props**:
- `acceptedTypes`: string[] (ex: ['pdf', 'png', 'jpg', 'svg', 'txt', 'md'])
- `maxSize`: number (em MB)
- `maxFiles`: number (opcional)
- `onFilesChange`: (files: File[]) => void

**UI States**:
- [x] Normal (área drag & drop disponível)
- [x] Dragging (highlight quando usuário arrasta arquivo sobre área)
- [x] Uploading (progress bar durante upload)
- [x] Error (mensagem de erro se tipo/tamanho inválido)

**Mock**: ✅ Completo (implementado em [02-novo-contexto.html](mocks/02-novo-contexto.html))

---

### 3.2 FilePreview Component

**Props**:
- `file`: UploadedFile
- `onRemove`: () => void

**UI**:
- [x] Ícone do tipo de arquivo
- [x] Nome do arquivo (truncado se muito longo, tooltip com completo)
- [x] Tamanho formatado (ex: 2.5 MB)
- [x] Preview visual:
  - [x] Imagem: thumbnail
  - [x] PDF: primeira página ou ícone PDF
  - [x] Texto: primeiras linhas
- [x] Botão "Remover" (X)
- [x] Botão "Visualizar" (modal com preview completo)

**Mock**: ✅ Completo (implementado em [02-novo-contexto.html](mocks/02-novo-contexto.html))

---

### 3.3 StatusBadge Component

**Props**:
- `status`: 'RASCUNHO' | 'PROCESSANDO' | 'SUCESSO' | 'ERRO'

**UI**:
- [x] Badge colorido:
  - [x] RASCUNHO: amarelo (#FFC107)
  - [x] PROCESSANDO: azul (#2196F3) + spinner animado
  - [x] SUCESSO: verde (#4CAF50)
  - [x] ERRO: vermelho (#F44336)
- [x] Ícone apropriado (documento, spinner, checkmark, X)
- [x] Texto do status

**Mock**: ✅ Completo (implementado em [03-lista-contextos.html](mocks/03-lista-contextos.html) e [04-detalhes-contexto.html](mocks/04-detalhes-contexto.html))

---

### 3.4 ProcessingTimeline Component

**Props**:
- `steps`: ProcessingStep[]
- `currentStep`: number

**UI**:
- [x] Timeline vertical com linhas conectando etapas
- [x] Cada etapa:
  - [x] Círculo de status (colorido conforme estado)
  - [x] Nome da etapa
  - [x] Timestamp (se completa)
  - [x] Progress bar (se em progresso)
  - [x] Botão expandir logs (se houver)

**Mock**: ✅ Completo (implementado em [05-processamento.html](mocks/05-processamento.html))

---

### 3.5 JSONViewer Component

**Props**:
- `data`: object
- `collapsible`: boolean (default: true)

**UI**:
- [x] Syntax highlighting (chaves, valores, tipos diferentes cores)
- [x] Colapsável por nível (+ / - para expandir/colapsar)
- [x] Numeração de linhas
- [x] Botão "Copiar JSON"
- [x] Search dentro do JSON (opcional)

**Mock**: ✅ Completo (implementado em [04-detalhes-contexto.html](mocks/04-detalhes-contexto.html))

---

## 4. Design System (Referências)

### 4.1 Cores

**Base** (shadcn/ui com tema personalizado):
- Primary: #6366F1 (Indigo) - ações principais
- Secondary: #8B5CF6 (Purple) - ações secundárias
- Accent: #EC4899 (Pink) - destaques
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

**Status Cores**:
- RASCUNHO: #FFC107 (Yellow)
- PROCESSANDO: #2196F3 (Blue)
- SUCESSO: #4CAF50 (Green)
- ERRO: #F44336 (Red)

### 4.2 Tipografia

- Font: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Small: 300 weight
- Code/JSON: Fira Code (monospace)

### 4.3 Espaçamento

- Tailwind spacing scale (4px base)
- Padrão de gaps: 4, 8, 16, 24, 32px

### 4.4 Componentes shadcn/ui

Usar componentes base do shadcn/ui:
- Button
- Input
- Textarea
- Card
- Badge
- Progress
- Alert
- Dialog (Modal)
- Tabs
- Toast (notificações)
- Tooltip
- Separator
- Skeleton (loading states)

---

## 5. Responsividade

### 5.1 Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 5.2 Prioridade

**Fase 1**: Desktop-first (admin/backoffice)

**Fase 2+**: Mobile-responsive

**Comportamento Mobile** (preview):
- [x] Navegação via menu hamburguer
- [x] FileUploader com botão "Selecionar Arquivos" (drag & drop limitado em mobile)
- [x] Tabs horizontais com scroll
- [x] Tabelas com scroll horizontal
- [x] Cards em vez de tabelas em telas muito pequenas

---

## 6. Acessibilidade (a11y)

### 6.1 Requisitos Mínimos

- [x] ARIA labels em todos os inputs e botões
- [x] Navegação por teclado (Tab, Enter, Esc)
- [x] Contraste mínimo WCAG AA (4.5:1 para texto normal)
- [x] Focus indicators visíveis (outline azul)
- [x] Screen reader friendly (aria-live para status updates)
- [x] Alt text em todas as imagens
- [x] Semantic HTML (header, nav, main, section, article)

---

## 7. Estados de Loading e Error

### 7.1 Loading States

**Página Inteira**:
- [x] Skeleton screens (placeholders cinza animados)

**Componentes Individuais**:
- [x] Spinner inline para botões
- [x] Progress bar para uploads/processamento
- [x] Shimmer effect para cards

**Mock**: ✅ Completo (implementado em todos os mocks)

### 7.2 Error States

**Validação de Formulário**:
- [x] Campo com borda vermelha
- [x] Mensagem de erro abaixo do campo
- [x] Ícone de erro (X vermelho)

**Erro de Upload**:
- [x] Toast notification (canto superior direito)
- [x] Mensagem: "Falha no upload de [filename]"
- [x] Botão "Tentar Novamente"

**Erro de Processamento**:
- [x] Alert box grande (vermelho)
- [x] Mensagem descritiva
- [x] Stack trace colapsável (para devs)
- [x] Botões: "Tentar Novamente", "Reportar Erro", "Voltar"

**Mock**: ✅ Completo (implementado em [02-novo-contexto.html](mocks/02-novo-contexto.html) e [05-processamento.html](mocks/05-processamento.html))

---

## 8. Interações e Animações

### 8.1 Transições

- [x] Page transitions: fade-in (200ms)
- [x] Modal open/close: scale + fade (300ms)
- [x] Dropdown: slide-down (200ms)
- [x] Toast: slide-in from right (300ms)

### 8.2 Hover States

- [x] Buttons: scale(1.05) + shadow
- [x] Cards: shadow elevation
- [x] Links: underline + color change

### 8.3 Loading Animations

- [x] Spinner: rotation (1s loop)
- [x] Progress bar: indeterminate wave (1.5s loop)
- [x] Skeleton: shimmer (2s loop)

---

## 9. Fluxo de Usuário Completo (Happy Path)

### Cenário: Time de Produto cria contexto para Core Banking com PIX

**Passo 1**: Usuário acessa Home
- [x] Vê dashboard com métricas
- [x] Clica "Criar Novo Contexto"

**Passo 2**: Upload de Documentação
- [x] Arrasta 3 PDFs BACEN (Circular 3.978, Manual PIX, Resolução 80)
- [x] Arrasta 1 diagrama Whimsical (fluxo PIX)
- [x] Vê preview dos 4 arquivos
- [x] Preenche super prompt:
  > "Criar Core Banking para Instituição de Pagamento licenciada pelo BACEN. Funcionalidades: PIX (envio, recebimento, chaves), Contas Correntes, KYC conforme Resolução 4.753, integração com BACEN SPI e TigerBeetle Ledger."
- [x] Clica "Processar Contexto"

**Passo 3**: Processamento em Tempo Real
- [x] Vê tela de status ao vivo
- [x] Progress bar: 0% → 25% (PDFs) → 50% (Diagramas) → 75% (Consolidação) → 100%
- [x] Logs exibidos em tempo real:
  - "Processando Circular 3.978..."
  - "Seções extraídas: 42"
  - "Analisando fluxo PIX..."
  - "Entidades identificadas: Cliente, Conta, TransacaoPix, ChavePix"
- [x] Tempo total: ~90 segundos

**Passo 4**: Resultado
- [x] Mensagem: "✅ Processamento Concluído!"
- [x] Clica "Ver Resultado"
- [x] Vê Tab "Resultado":
  - [x] PDFs processados (seções, tabelas)
  - [x] Diagramas analisados (entidades, relacionamentos)
  - [x] JSON consolidado (processed_data)
- [x] Clica "Download JSON"

**Passo 5**: Próxima Fase (fora do escopo Fase 1)
- [x] JSON será usado pela Fase 2 (Specification Generation) para gerar especificação editável

---

## 10. Aprovação

### 10.1 Checklist de Aprovação

**Time de Produto**:
- [x] Fluxo de navegação aprovado (5 telas principais)
- [x] Mocks de todas as telas criados e funcionais
- [x] Upload interface é intuitivo
- [x] Status de processamento é claro
- [x] Resultado exibido de forma útil

**Time Técnico**:
- [x] Todos os componentes são tecnicamente viáveis
- [x] Stack (Next.js 14 + shadcn/ui + React) suporta requisitos
- [x] Polling/WebSocket para status em tempo real é viável
- [x] Performance estimada está aceitável (upload < 5s, processamento < 2min)
- [x] Complexidade está dentro do esperado (4 semanas)

### 10.2 Assinaturas de Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | ⏸️ Pendente |
| Tech Lead | | | ⏸️ Pendente |
| UI/UX (se houver) | | | ⏸️ Pendente |

---

## 11. Próximos Passos Após Aprovação

Após este documento estar **🟢 Aprovado**:

1. ✅ Planejamento de sprints pode referenciar mocks
2. ✅ Frontend Developer Agent pode iniciar implementação (Sprint 1)
3. ✅ Cada tela implementada deve corresponder 1:1 com mock aprovado
4. ✅ Qualquer desvio do mock requer nova aprovação
5. ✅ TDD Orchestrator Agent cria testes E2E baseados nos fluxos descritos

---

## 12. Comparação: Antes vs Depois

### ❌ ANTES (Foundation - 15 Telas)

- Dashboard Principal
- Assistente de Criação de Objeto (7 perguntas)
- Listar Object Definitions
- Detalhes de Object Definition
- Listar Instances
- Formulário Dinâmico de Instância (10 widgets)
- Detalhes de Instance
- Transição de Estado (Modal)
- Visualização de Relacionamentos (Grafo)
- Biblioteca de Validation Rules
- RAG Assistant (Chat)
- *Total*: **15 telas complexas**

### ✅ DEPOIS (AI-Driven Context Generator - 5 Telas)

- Home / Dashboard
- Novo Contexto (Upload Interface)
- Lista de Contextos
- Detalhes de Contexto (4 tabs)
- Processamento em Tempo Real
- *Total*: **5 telas focadas**

**Redução de complexidade**: 67% menos telas, foco em upload e processamento.

---

## Referências

- **[VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - Arquitetura master
- **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - Sprint planning
- **[FASE_1_REIMPLEMENTACAO_SUMARIO.md](FASE_1_REIMPLEMENTACAO_SUMARIO.md)** - Sumário de mudanças
- [Stack Tecnológico](../../architecture/stack_tecnologico_fases.md)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Status**: ✅ Mocks Completos - Aguardando Aprovação Final do Time de Produto

**Mocks Criados**: 2025-12-11
- [01-home-dashboard.html](mocks/01-home-dashboard.html)
- [02-novo-contexto.html](mocks/02-novo-contexto.html)
- [03-lista-contextos.html](mocks/03-lista-contextos.html)
- [04-detalhes-contexto.html](mocks/04-detalhes-contexto.html)
- [05-processamento.html](mocks/05-processamento.html)

**Próxima Ação**: Aprovação dos mocks pelo Time de Produto antes da implementação em React

**Versão Anterior**: 1.0.0 (Foundation - 15 telas) - deletada em 2025-12-11
**Versão Atual**: 2.0.0 (AI-Driven Context Generator - 5 telas) ✅ MOCKS COMPLETOS

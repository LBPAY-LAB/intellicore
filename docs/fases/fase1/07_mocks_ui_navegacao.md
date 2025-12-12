# Mocks de UI e Navegação - Fase 1: AI-Driven Context Generator

**Status**: 📋 Template Atualizado (Aguardando Criação de Mocks)
**Versão**: 2.0.0
**Data**: 2025-12-11
**Aprovação**: ⏸️ Pendente

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

1. ✅ Mocks completos criados neste documento
2. ✅ Time de Produto aprovar todos os layouts
3. ✅ Time Técnico validar viabilidade técnica
4. ✅ Status deste documento mudar para "🟢 Aprovado"

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

## 2. Mocks de Telas (Aguardando Criação)

### 2.1 Home / Dashboard

**Propósito**: Página inicial com overview e acesso rápido

**Elementos de UI**:
- [ ] Header com logo "SuperCore" e navegação
- [ ] Hero section:
  - [ ] Título: "AI-Driven Context Generator"
  - [ ] Subtítulo: "Faça upload de documentação e deixe a IA gerar modelos completos"
  - [ ] Botão principal: "Criar Novo Contexto" (grande, destacado)
- [ ] Cards de métricas:
  - [ ] Total de Contextos Criados
  - [ ] Contextos em Processamento
  - [ ] Contextos Processados com Sucesso
  - [ ] Taxa de Sucesso (%)
- [ ] Seção "Contextos Recentes":
  - [ ] Lista dos 5 últimos contextos (mini-cards)
  - [ ] Link "Ver Todos os Contextos"
- [ ] Seção "Como Funciona" (ilustrativa):
  - [ ] Passo 1: Upload de Documentação
  - [ ] Passo 2: Processamento via IA
  - [ ] Passo 3: Modelo Gerado

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Criar Novo Contexto" → Tela 2.2 (Novo Contexto)
- Clicar "Ver Todos os Contextos" → Tela 2.3 (Lista de Contextos)
- Clicar em um contexto recente → Tela 2.4 (Detalhes de Contexto)

---

### 2.2 Novo Contexto (Upload Interface)

**Propósito**: Interface de upload multi-modal e entrada de super prompt

**Elementos de UI**:

**Seção 1: Upload de Arquivos**
- [ ] Título: "Novo Contexto - Upload de Documentação"
- [ ] Componente FileUploader:
  - [ ] Área de drag & drop (grande, visível)
  - [ ] Texto: "Arraste arquivos aqui ou clique para selecionar"
  - [ ] Tipos aceitos exibidos: PDF, PNG, JPG, SVG, TXT, MD
  - [ ] Limite de tamanho exibido: "Máximo 50MB por arquivo"
  - [ ] Botão "Selecionar Arquivos"
- [ ] Lista de Arquivos Uploaded:
  - [ ] Para cada arquivo:
    - [ ] Ícone do tipo de arquivo
    - [ ] Nome do arquivo
    - [ ] Tamanho
    - [ ] Preview (se imagem/PDF)
    - [ ] Botão "Remover" (X)
  - [ ] Suporta múltiplos arquivos
  - [ ] Ordenação drag & drop

**Seção 2: Super Prompt**
- [ ] Label: "Super Prompt (Descrição da Solução)"
- [ ] Textarea grande (mínimo 10 linhas)
- [ ] Placeholder: "Descreva a solução que você quer criar. Exemplo: 'Criar Core Banking para IP com PIX, contas correntes, KYC conforme BACEN...'"
- [ ] Contador de caracteres (mínimo: 100 caracteres)
- [ ] Help text: "Seja o mais específico possível. Mencione regulamentações, funcionalidades desejadas, integrações necessárias."

**Seção 3: Metadados (opcional)**
- [ ] Campo: "Nome do Contexto" (opcional, auto-gerado se vazio)
- [ ] Campo: "Tags" (chips input, para organização)

**Seção 4: Ações**
- [ ] Botão "Salvar Rascunho" (secondary)
- [ ] Botão "Processar Contexto" (primary, disabled se validações não passarem)
- [ ] Botão "Cancelar" (text)

**Validações Client-Side**:
- [ ] Pelo menos 1 arquivo uploaded OU super prompt preenchido
- [ ] Super prompt com mínimo 100 caracteres
- [ ] Tamanho total dos arquivos < 200MB
- [ ] Tipos de arquivo válidos

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Salvar Rascunho" → Salva e redireciona para Tela 2.3 (Lista)
- Clicar "Processar Contexto" → Inicia processamento e redireciona para Tela 2.5 (Status)
- Clicar "Cancelar" → Volta para Home

---

### 2.3 Lista de Contextos

**Propósito**: Visualizar todos os contextos criados com status

**Elementos de UI**:
- [ ] Header: "Meus Contextos"
- [ ] Botão: "Criar Novo Contexto" (top-right)
- [ ] Filtros:
  - [ ] Por Status: Todos, Rascunho, Processando, Sucesso, Erro
  - [ ] Por Data: Últimos 7 dias, Últimos 30 dias, Todo o período
  - [ ] Busca por nome/tags
- [ ] Tabela de Contextos:
  - [ ] Colunas:
    - [ ] ID (truncado, tooltip com completo)
    - [ ] Nome/Descrição
    - [ ] Arquivos (ícones pequenos, ex: 📄 PDF, 🖼️ IMG)
    - [ ] Status (badge colorido)
    - [ ] Data de Criação
    - [ ] Última Atualização
    - [ ] Ações (botões icon)
  - [ ] Status badges:
    - [ ] 🟡 RASCUNHO (amarelo)
    - [ ] 🔵 PROCESSANDO (azul, com spinner)
    - [ ] 🟢 SUCESSO (verde)
    - [ ] 🔴 ERRO (vermelho)
- [ ] Ações por linha:
  - [ ] Ver Detalhes (ícone olho)
  - [ ] Reprocessar (ícone refresh, apenas se ERRO)
  - [ ] Deletar (ícone lixeira, com confirmação)
- [ ] Paginação

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Criar Novo Contexto" → Tela 2.2
- Clicar "Ver Detalhes" → Tela 2.4 (Detalhes de Contexto)
- Clicar linha da tabela → Tela 2.4

---

### 2.4 Detalhes de Contexto

**Propósito**: Ver informações completas, arquivos, status e resultado de processamento

**Elementos de UI**:

**Header**:
- [ ] Breadcrumb: Contextos > [Nome do Contexto]
- [ ] Badge de Status (grande)
- [ ] Título: Nome do contexto ou "Contexto [ID]"
- [ ] Data de criação
- [ ] Botão "Reprocessar" (se ERRO)
- [ ] Botão "Editar" (se RASCUNHO)
- [ ] Botão "Deletar"

**Tabs**:

**Tab 1: "Visão Geral"**
- [ ] Super Prompt (exibido como texto formatado)
- [ ] Lista de Arquivos Uploaded:
  - [ ] Para cada arquivo:
    - [ ] Nome, tipo, tamanho
    - [ ] Botão "Download"
    - [ ] Preview (se PDF/imagem) em modal
- [ ] Metadados:
  - [ ] ID
  - [ ] Data de criação
  - [ ] Última atualização
  - [ ] Tags

**Tab 2: "Status de Processamento"**
- [ ] Timeline visual do processamento:
  - [ ] Etapa 1: Upload Completo ✅
  - [ ] Etapa 2: Processando PDFs (com progress bar se em andamento)
  - [ ] Etapa 3: Analisando Diagramas (com progress bar se em andamento)
  - [ ] Etapa 4: Consolidando Dados
  - [ ] Etapa 5: Finalizado ✅ ou Erro ❌
- [ ] Para cada etapa:
  - [ ] Status (Pendente, Em Progresso, Completo, Erro)
  - [ ] Timestamp
  - [ ] Logs (se houver, expansível)
- [ ] Se ERRO:
  - [ ] Mensagem de erro detalhada
  - [ ] Stack trace (colapsável, apenas para devs)
  - [ ] Sugestões de correção

**Tab 3: "Resultado" (apenas se SUCESSO)**
- [ ] Seção "Dados Extraídos de PDFs":
  - [ ] Para cada PDF:
    - [ ] Nome do arquivo
    - [ ] Seções identificadas (lista expansível)
    - [ ] Tabelas extraídas (preview em formato tabela)
    - [ ] Metadados (tipo de documento, data, etc.)
- [ ] Seção "Dados Extraídos de Diagramas":
  - [ ] Para cada imagem:
    - [ ] Nome do arquivo
    - [ ] Entidades identificadas (lista com badges)
    - [ ] Relacionamentos identificados (lista)
    - [ ] Fluxos detectados (descrição textual)
- [ ] Seção "Dados Consolidados":
  - [ ] JSON viewer (formatado, syntax highlight)
  - [ ] Botão "Copiar JSON"
  - [ ] Botão "Download JSON"

**Tab 4: "Logs Técnicos" (apenas para devs/debug)**
- [ ] Logs completos de processamento
- [ ] Timestamps
- [ ] Níveis (INFO, WARNING, ERROR)
- [ ] Filtros por nível

**Mock**: ⏸️ Pendente

**Navegação**:
- Clicar "Editar" → Volta para Tela 2.2 (modo edição)
- Clicar "Reprocessar" → Tela 2.5 (Status em Tempo Real)
- Clicar "Voltar" → Tela 2.3 (Lista)

---

### 2.5 Processamento em Tempo Real (Status Live)

**Propósito**: Exibir status de processamento em tempo real após clicar "Processar Contexto"

**Elementos de UI**:
- [ ] Header: "Processando Contexto..."
- [ ] Progress bar geral (0-100%)
- [ ] Seção de etapas (lista vertical):
  - [ ] Cada etapa mostra:
    - [ ] Nome da etapa
    - [ ] Status: ⏸️ Pendente, 🔵 Em Progresso, ✅ Completo, ❌ Erro
    - [ ] Progress bar individual (se em progresso)
    - [ ] Tempo estimado restante
- [ ] Logs em tempo real (scrollable, auto-scroll para última linha):
  - [ ] Timestamp + mensagem
  - [ ] Highlight para WARNINGs e ERRORs
- [ ] Botão "Ver em Background" (permite sair da tela sem cancelar)
- [ ] Se completar com sucesso:
  - [ ] Mensagem: "✅ Processamento Concluído com Sucesso!"
  - [ ] Botão "Ver Resultado" → Tela 2.4 (Tab "Resultado")
- [ ] Se falhar:
  - [ ] Mensagem: "❌ Erro no Processamento"
  - [ ] Descrição do erro
  - [ ] Botão "Tentar Novamente"
  - [ ] Botão "Ver Detalhes" → Tela 2.4 (Tab "Status")

**Mock**: ⏸️ Pendente

**Polling/WebSocket**:
- [ ] Atualização em tempo real via polling (GET /context/:id/status a cada 2s)
- [ ] Ou WebSocket para updates live (preferível)

---

## 3. Componentes UI Reutilizáveis

### 3.1 FileUploader Component

**Props**:
- `acceptedTypes`: string[] (ex: ['pdf', 'png', 'jpg', 'svg', 'txt', 'md'])
- `maxSize`: number (em MB)
- `maxFiles`: number (opcional)
- `onFilesChange`: (files: File[]) => void

**UI States**:
- [ ] Normal (área drag & drop disponível)
- [ ] Dragging (highlight quando usuário arrasta arquivo sobre área)
- [ ] Uploading (progress bar durante upload)
- [ ] Error (mensagem de erro se tipo/tamanho inválido)

**Mock**: ⏸️ Pendente

---

### 3.2 FilePreview Component

**Props**:
- `file`: UploadedFile
- `onRemove`: () => void

**UI**:
- [ ] Ícone do tipo de arquivo
- [ ] Nome do arquivo (truncado se muito longo, tooltip com completo)
- [ ] Tamanho formatado (ex: 2.5 MB)
- [ ] Preview visual:
  - [ ] Imagem: thumbnail
  - [ ] PDF: primeira página ou ícone PDF
  - [ ] Texto: primeiras linhas
- [ ] Botão "Remover" (X)
- [ ] Botão "Visualizar" (modal com preview completo)

**Mock**: ⏸️ Pendente

---

### 3.3 StatusBadge Component

**Props**:
- `status`: 'RASCUNHO' | 'PROCESSANDO' | 'SUCESSO' | 'ERRO'

**UI**:
- [ ] Badge colorido:
  - [ ] RASCUNHO: amarelo (#FFC107)
  - [ ] PROCESSANDO: azul (#2196F3) + spinner animado
  - [ ] SUCESSO: verde (#4CAF50)
  - [ ] ERRO: vermelho (#F44336)
- [ ] Ícone apropriado (documento, spinner, checkmark, X)
- [ ] Texto do status

**Mock**: ⏸️ Pendente

---

### 3.4 ProcessingTimeline Component

**Props**:
- `steps`: ProcessingStep[]
- `currentStep`: number

**UI**:
- [ ] Timeline vertical com linhas conectando etapas
- [ ] Cada etapa:
  - [ ] Círculo de status (colorido conforme estado)
  - [ ] Nome da etapa
  - [ ] Timestamp (se completa)
  - [ ] Progress bar (se em progresso)
  - [ ] Botão expandir logs (se houver)

**Mock**: ⏸️ Pendente

---

### 3.5 JSONViewer Component

**Props**:
- `data`: object
- `collapsible`: boolean (default: true)

**UI**:
- [ ] Syntax highlighting (chaves, valores, tipos diferentes cores)
- [ ] Colapsável por nível (+ / - para expandir/colapsar)
- [ ] Numeração de linhas
- [ ] Botão "Copiar JSON"
- [ ] Search dentro do JSON (opcional)

**Mock**: ⏸️ Pendente

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
- [ ] Navegação via menu hamburguer
- [ ] FileUploader com botão "Selecionar Arquivos" (drag & drop limitado em mobile)
- [ ] Tabs horizontais com scroll
- [ ] Tabelas com scroll horizontal
- [ ] Cards em vez de tabelas em telas muito pequenas

---

## 6. Acessibilidade (a11y)

### 6.1 Requisitos Mínimos

- [ ] ARIA labels em todos os inputs e botões
- [ ] Navegação por teclado (Tab, Enter, Esc)
- [ ] Contraste mínimo WCAG AA (4.5:1 para texto normal)
- [ ] Focus indicators visíveis (outline azul)
- [ ] Screen reader friendly (aria-live para status updates)
- [ ] Alt text em todas as imagens
- [ ] Semantic HTML (header, nav, main, section, article)

---

## 7. Estados de Loading e Error

### 7.1 Loading States

**Página Inteira**:
- [ ] Skeleton screens (placeholders cinza animados)

**Componentes Individuais**:
- [ ] Spinner inline para botões
- [ ] Progress bar para uploads/processamento
- [ ] Shimmer effect para cards

**Mock**: ⏸️ Pendente

### 7.2 Error States

**Validação de Formulário**:
- [ ] Campo com borda vermelha
- [ ] Mensagem de erro abaixo do campo
- [ ] Ícone de erro (X vermelho)

**Erro de Upload**:
- [ ] Toast notification (canto superior direito)
- [ ] Mensagem: "Falha no upload de [filename]"
- [ ] Botão "Tentar Novamente"

**Erro de Processamento**:
- [ ] Alert box grande (vermelho)
- [ ] Mensagem descritiva
- [ ] Stack trace colapsável (para devs)
- [ ] Botões: "Tentar Novamente", "Reportar Erro", "Voltar"

**Mock**: ⏸️ Pendente

---

## 8. Interações e Animações

### 8.1 Transições

- [ ] Page transitions: fade-in (200ms)
- [ ] Modal open/close: scale + fade (300ms)
- [ ] Dropdown: slide-down (200ms)
- [ ] Toast: slide-in from right (300ms)

### 8.2 Hover States

- [ ] Buttons: scale(1.05) + shadow
- [ ] Cards: shadow elevation
- [ ] Links: underline + color change

### 8.3 Loading Animations

- [ ] Spinner: rotation (1s loop)
- [ ] Progress bar: indeterminate wave (1.5s loop)
- [ ] Skeleton: shimmer (2s loop)

---

## 9. Fluxo de Usuário Completo (Happy Path)

### Cenário: Time de Produto cria contexto para Core Banking com PIX

**Passo 1**: Usuário acessa Home
- [ ] Vê dashboard com métricas
- [ ] Clica "Criar Novo Contexto"

**Passo 2**: Upload de Documentação
- [ ] Arrasta 3 PDFs BACEN (Circular 3.978, Manual PIX, Resolução 80)
- [ ] Arrasta 1 diagrama Whimsical (fluxo PIX)
- [ ] Vê preview dos 4 arquivos
- [ ] Preenche super prompt:
  > "Criar Core Banking para Instituição de Pagamento licenciada pelo BACEN. Funcionalidades: PIX (envio, recebimento, chaves), Contas Correntes, KYC conforme Resolução 4.753, integração com BACEN SPI e TigerBeetle Ledger."
- [ ] Clica "Processar Contexto"

**Passo 3**: Processamento em Tempo Real
- [ ] Vê tela de status ao vivo
- [ ] Progress bar: 0% → 25% (PDFs) → 50% (Diagramas) → 75% (Consolidação) → 100%
- [ ] Logs exibidos em tempo real:
  - "Processando Circular 3.978..."
  - "Seções extraídas: 42"
  - "Analisando fluxo PIX..."
  - "Entidades identificadas: Cliente, Conta, TransacaoPix, ChavePix"
- [ ] Tempo total: ~90 segundos

**Passo 4**: Resultado
- [ ] Mensagem: "✅ Processamento Concluído!"
- [ ] Clica "Ver Resultado"
- [ ] Vê Tab "Resultado":
  - [ ] PDFs processados (seções, tabelas)
  - [ ] Diagramas analisados (entidades, relacionamentos)
  - [ ] JSON consolidado (processed_data)
- [ ] Clica "Download JSON"

**Passo 5**: Próxima Fase (fora do escopo Fase 1)
- [ ] JSON será usado pela Fase 2 (Specification Generation) para gerar especificação editável

---

## 10. Aprovação

### 10.1 Checklist de Aprovação

**Time de Produto**:
- [ ] Fluxo de navegação aprovado (3 telas principais + dashboard)
- [ ] Mocks de todas as telas aprovados
- [ ] Upload interface é intuitivo
- [ ] Status de processamento é claro
- [ ] Resultado exibido de forma útil

**Time Técnico**:
- [ ] Todos os componentes são tecnicamente viáveis
- [ ] Stack (Next.js 14 + shadcn/ui + React) suporta requisitos
- [ ] Polling/WebSocket para status em tempo real é viável
- [ ] Performance estimada está aceitável (upload < 5s, processamento < 2min)
- [ ] Complexidade está dentro do esperado (4 semanas)

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

**Status**: 📋 Template atualizado, aguardando criação de mocks visuais (wireframes)

**Próxima Ação**: Criar wireframes/mocks de cada tela descrita acima

**Versão Anterior**: 1.0.0 (Foundation - 15 telas) - deletada em 2025-12-11
**Versão Atual**: 2.0.0 (AI-Driven Context Generator - 5 telas)

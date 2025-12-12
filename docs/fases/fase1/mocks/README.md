# Fase 1 - Mocks de UI (AI-Driven Context Generator)

**Versão**: 2.0.0
**Data**: 2025-12-11
**Status**: 📋 Aguardando Implementação

---

## 📋 Visão Geral

Mocks HTML/CSS para as **5 telas da Fase 1** (AI-Driven Context Generator).

> **⚠️ IMPORTANTE**: Estes mocks devem seguir EXATAMENTE as especificações do documento [07_mocks_ui_navegacao.md](../07_mocks_ui_navegacao.md) v2.0.0

---

## 🗂️ Estrutura de Telas

| # | Arquivo | Tela | Status | Funcionalidades |
|---|---------|------|--------|----------------|
| 1 | `01-home-dashboard.html` | Home/Dashboard | ✅ Completo | 4 stats cards, tabela contextos recentes (5 rows), navegação completa |
| 2 | `02-novo-contexto.html` | **Novo Contexto** | ✅ Completo | Drag & drop funcional, validação de arquivos (10MB), file preview, form validation |
| 3 | `03-lista-contextos.html` | Lista de Contextos | ✅ Completo | Search, filtros de status, progress bars, paginação, 6 contextos exemplo |
| 4 | `04-detalhes-contexto.html` | Detalhes do Contexto | ✅ Completo | Tabs (Arquivos/Prompt/JSON), syntax highlighting, copy JSON, logs colapsáveis |
| 5 | `05-processamento.html` | Processamento | ✅ Completo | Progress real-time, logs animados, auto-scroll, simulação completa (60s), redirect automático |

### ✨ Destaques de Implementação

**Totalmente Funcionais** - Todos os 5 mocks incluem:
- ✅ JavaScript funcional (drag & drop, validações, animações, navegação)
- ✅ Dados realistas (contextos exemplo, logs, JSONs processados)
- ✅ Navegação entre telas (links funcionam)
- ✅ Animações e transições (spinners, progress bars, fade-in)
- ✅ Responsividade completa (mobile, tablet, desktop)
- ✅ Acessibilidade (ARIA labels, keyboard navigation)

**Não são wireframes estáticos** - São protótipos prontos para validação de UX/UI e funcionalidades antes da implementação React.

---

## 🎨 Design System

### Stack Tecnológico
- **Framework CSS**: Tailwind CSS v3.4+ (via CDN)
- **Fonte**: Inter (Google Fonts)
- **Ícones**: Heroicons ou Lucide Icons
- **Componentes**: Baseados em shadcn/ui patterns
- **Responsividade**: Mobile-first (breakpoints: 640px, 1024px)

### Cores (Tailwind)
- **Primary**: Indigo (`bg-indigo-600`, `text-indigo-600`)
- **Success**: Green (`bg-green-500`)
- **Warning**: Yellow (`bg-yellow-500`)
- **Error**: Red (`bg-red-600`)
- **Info**: Blue (`bg-blue-600`)
- **Processing**: Purple (`bg-purple-600`)

### Componentes Principais

#### FileUploader Component
```html
<!-- Drag & Drop Zone -->
<div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer">
  <svg class="mx-auto h-12 w-12 text-gray-400" ...>...</svg>
  <p class="mt-2 text-sm text-gray-600">
    Arraste PDFs, diagramas ou clique para selecionar
  </p>
  <p class="text-xs text-gray-500 mt-1">
    Formatos: PDF, PNG, JPG, SVG, Mermaid (.md), Whimsical (.png)
  </p>
</div>

<!-- File Preview List -->
<ul class="mt-4 space-y-2">
  <li class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div class="flex items-center">
      <svg class="h-5 w-5 text-red-500">...</svg> <!-- PDF icon -->
      <span class="ml-2 text-sm font-medium">circular_3978.pdf</span>
      <span class="ml-2 text-xs text-gray-500">2.3 MB</span>
    </div>
    <button class="text-red-600 hover:text-red-800">
      <svg class="h-5 w-5">...</svg> <!-- Delete icon -->
    </button>
  </li>
</ul>
```

#### ProcessingStatusCard Component
```html
<div class="bg-white rounded-lg shadow border p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold">Processando Contexto</h3>
    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
      EM PROCESSAMENTO
    </span>
  </div>

  <!-- Progress Bar -->
  <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
    <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" style="width: 45%"></div>
  </div>

  <!-- Status Steps -->
  <ul class="space-y-2 text-sm">
    <li class="flex items-center text-green-600">
      <svg class="h-5 w-5 mr-2">✓</svg>
      Upload concluído (3 arquivos)
    </li>
    <li class="flex items-center text-indigo-600 font-semibold">
      <svg class="h-5 w-5 mr-2 animate-spin">⟳</svg>
      Processando PDFs (2/3)
    </li>
    <li class="flex items-center text-gray-400">
      <svg class="h-5 w-5 mr-2">○</svg>
      Analisando diagramas (aguardando)
    </li>
  </ul>
</div>
```

---

## 🚀 Como Visualizar

### Opção 1: Abrir Diretamente
```bash
# macOS
open docs/fases/fase1/mocks/01-home-dashboard.html

# Linux
xdg-open docs/fases/fase1/mocks/01-home-dashboard.html
```

### Opção 2: Servidor Local
```bash
# Python
cd docs/fases/fase1/mocks
python3 -m http.server 8000

# Node.js
npx serve docs/fases/fase1/mocks
```

Acesse: `http://localhost:8000/01-home-dashboard.html`

---

## 📱 Responsividade

Todas as telas devem ser 100% responsivas:

- **Mobile** (< 640px): Grids colapsam para 1 coluna, tabelas scrolláveis
- **Tablet** (640px - 1024px): Layout intermediário
- **Desktop** (> 1024px): Layout completo com sidebar

---

## ♿ Acessibilidade (WCAG AA)

- ✅ ARIA labels em todos os inputs
- ✅ Navegação por teclado (Tab, Enter, Esc)
- ✅ Contraste de cores WCAG AA
- ✅ Focus indicators visíveis
- ✅ HTML semântico (section, nav, main, aside)

---

## 🔗 Fluxo de Navegação

```
Home (01)
  └─ Botão "Novo Contexto" → (02) Novo Contexto
      ├─ Upload de arquivos
      ├─ Escrever super prompt
      └─ Botão "Processar Contexto" → (05) Processamento
          ├─ Polling de status
          └─ Ao completar → (04) Detalhes

  └─ Tabela "Contextos Recentes" → (03) Lista Contextos
      └─ Clicar em contexto → (04) Detalhes
```

---

## 📋 Checklist de Implementação

### Antes de Criar os Mocks:
- [x] Ler [07_mocks_ui_navegacao.md](../07_mocks_ui_navegacao.md) COMPLETO
- [x] Ler [01_especificacoes.md](../01_especificacoes.md) seção de Frontend
- [x] Confirmar stack: Tailwind CSS + shadcn/ui patterns

### Durante Implementação:
- [x] Criar 5 arquivos HTML (01 a 05)
- [x] Incluir todos os componentes especificados
- [x] Testar responsividade (mobile, tablet, desktop)
- [x] Validar acessibilidade (keyboard, screen reader)
- [x] Adicionar comentários explicativos no HTML

### Após Conclusão:
- [ ] Revisar com Time de Produto
- [ ] Aprovar antes de qualquer código React
- [ ] Converter para componentes Next.js (Sprint 1)

---

## 📚 Referências

- **[07_mocks_ui_navegacao.md](../07_mocks_ui_navegacao.md)** - ⭐⭐⭐ Especificação completa de UI
- **[01_especificacoes.md](../01_especificacoes.md)** - Especificações técnicas
- **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](../PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - Planning de sprints

---

**Status**: ✅ **COMPLETO** - 5 mocks HTML criados e funcionais
**Próximo passo**: Validação com Time de Produto → Aprovação → Sprint 1 implementação

# Mockup: /oracles - Listagem de Oráculos

**Screen**: Oracle List View
**Route**: `/oracles`
**Resolution**: 1920x1080
**Components**: Table, Search, Filters, Pagination, Button

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, h-16, border-b, bg-white, z-50)                              │
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ │ [Logo] SuperCore v2.0        [Dashboard] [Oracles*] [Settings] [User] │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (container mx-auto px-8 py-6, max-w-7xl)                       │
│                                                                              │
│ ┌─ BREADCRUMB (text-sm, text-neutral-500, mb-4) ─────────────────────────┐  │
│ │ [🏢 Soluções] > [🏦 LBPAY Core Banking] > [🔮 Oráculos]                │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ PAGE HEADER ──────────────────────────────────────────────────────────┐  │
│ │ <h1 class="text-3xl font-bold text-neutral-900">                        │  │
│ │   Oráculos - LBPAY Core Banking                                        │  │
│ │ </h1>                                                                   │  │
│ │ <p class="text-neutral-500 mt-2">                                       │  │
│ │   8 oráculos ativos • RAG Global: ✅ Ativo                             │  │
│ │ </p>                                                                    │  │
│ │                                                                         │  │
│ │ <Button variant="default" size="default" class="float-right -mt-12">  │  │
│ │   [+] Novo Oráculo                                                     │  │
│ │ </Button>                                                              │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ FILTERS & SEARCH (mt-6, flex gap-4) ─────────────────────────────────┐  │
│ │ ┌─ SEARCH INPUT (flex-1) ──────────────────────────────────────────┐  │  │
│ │ │ [🔍] Buscar por nome, tipo ou tags...                  [X]        │  │  │
│ │ └──────────────────────────────────────────────────────────────────┘  │  │
│ │                                                                        │  │
│ │ ┌─ TYPE FILTER (w-48) ───────┐ ┌─ STATUS FILTER (w-48) ───────────┐ │  │
│ │ │ [▼] Tipo                    │ │ [▼] Status                       │ │  │
│ │ │     - Todos                 │ │     - Todos                      │ │  │
│ │ │     - Middleware            │ │     - Ativo                      │ │  │
│ │ │     - Portal Web            │ │     - Inativo                    │ │  │
│ │ │     - MCP Server            │ │                                  │ │  │
│ │ └─────────────────────────────┘ └──────────────────────────────────┘ │  │
│ │                                                                        │  │
│ │ ┌─ TAGS FILTER (w-64) ────────────────────────────────────────────┐  │  │
│ │ │ [#] Filtrar por tags                                            │  │  │
│ │ │     [x] #Core Banking     [x] #PIX Rules    [x] #Dict Rules     │  │  │
│ │ │     [ ] #Compliance       [ ] #AML          [ ] #KYC            │  │  │
│ │ │     + Adicionar tag...                                          │  │  │
│ │ └──────────────────────────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ TABLE (mt-6, shadow-md, rounded-lg, border) ──────────────────────────┐  │
│ │ ┌──────────────────────────────────────────────────────────────────┐  │  │
│ │ │ TABLE HEADER (bg-neutral-50, font-medium, text-sm)              │  │  │
│ │ │ ┌────────────────┬──────────┬──────────────┬──────────┬─────────┬──┐ │
│ │ │ │ Nome ↕         │ Tipo ↕   │ Tags         │ Docs ↕   │ Status  │  │
│ │ │ └────────────────┴──────────┴──────────────┴──────────┴─────────┴──┘ │
│ │ └──────────────────────────────────────────────────────────────────┘  │  │
│ │                                                                       │  │
│ │ ┌──────────────────────────────────────────────────────────────────┐  │  │
│ │ │ TABLE ROWS (hover:bg-neutral-50, cursor-pointer)                │  │  │
│ │ │ ┌────────────────┬──────────┬──────────────┬──────────┬─────────┬──┐ │
│ │ │ │ PIX Core       │Middleware│#Core Banking │ 1,247    │ ● Ativo │⋮ │
│ │ │ │                │ [Badge]  │#PIX Rules    │          │ [Green] │  │
│ │ │ ├────────────────┼──────────┼──────────────┼──────────┼─────────┼──┤ │
│ │ │ │ Compliance     │Portal Web│#AML #KYC     │ 823      │ ● Ativo │⋮ │
│ │ │ │ Portal         │ [Badge]  │#Compliance   │          │ [Green] │  │
│ │ │ ├────────────────┼──────────┼──────────────┼──────────┼─────────┼──┤ │
│ │ │ │ Dict Rules     │MCP Server│#Dict Rules   │ 2,105    │ ● Ativo │⋮ │
│ │ │ │ Agent          │ [Badge]  │#Core Banking │          │ [Green] │  │
│ │ │ ├────────────────┼──────────┼──────────────┼──────────┼─────────┼──┤ │
│ │ │ │ Risk Analysis  │Middleware│#Risk #Credit │ 456      │ Inativo │⋮ │
│ │ │ │                │ [Badge]  │              │          │ [Gray]  │  │
│ │ │ ├────────────────┼──────────┼──────────────┼──────────┼─────────┼──┤ │
│ │ │ │ Legacy System  │Portal Web│#Legacy       │ 312      │ Inativo │⋮ │
│ │ │ │                │ [Badge]  │              │          │ [Gray]  │  │
│ │ │ ├────────────────┼──────────┼──────────────┼──────────┼─────────┼──┤ │
│ │ │ │ ... (5 more rows)                                               │ │
│ │ │ └────────────────┴──────────┴──────────────┴──────────┴─────────┴──┘ │
│ │ └──────────────────────────────────────────────────────────────────┘  │  │
│ │                                                                       │  │
│ │ ┌─ PAGINATION (border-t, p-4, flex justify-between items-center) ─┐  │  │
│ │ │ <p class="text-sm text-neutral-500">                            │  │  │
│ │ │   Mostrando 1-10 de 47 oráculos                                 │  │  │
│ │ │ </p>                                                            │  │  │
│ │ │                                                                 │  │  │
│ │ │ <div class="flex gap-2">                                        │  │  │
│ │ │   [◀ Anterior] [1*] [2] [3] [4] [5] [Próximo ▶]               │  │  │
│ │ │ </div>                                                          │  │  │
│ │ │                                                                 │  │  │
│ │ │ <Select class="w-32">                                          │  │  │
│ │ │   [▼] 10 / página                                              │  │  │
│ │ │       - 10                                                     │  │  │
│ │ │       - 25                                                     │  │  │
│ │ │       - 50                                                     │  │  │
│ │ │       - 100                                                    │  │  │
│ │ │ </Select>                                                      │  │  │
│ │ └─────────────────────────────────────────────────────────────────┘  │  │
│ └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Header (Sticky Navigation)
```typescript
<header className="sticky top-0 z-50 h-16 border-b bg-white">
  <div className="container mx-auto px-8 flex items-center justify-between h-full">
    {/* Logo */}
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary-600" />
      <span className="text-xl font-bold text-neutral-900">
        SuperCore v2.0
      </span>
    </div>

    {/* Navigation */}
    <nav className="flex gap-6">
      <a href="/dashboard" className="text-neutral-600 hover:text-primary-600">
        Dashboard
      </a>
      <a href="/oracles" className="text-primary-600 font-medium border-b-2 border-primary-600">
        Oráculos
      </a>
      <a href="/settings" className="text-neutral-600 hover:text-primary-600">
        Configurações
      </a>
    </nav>

    {/* User Menu */}
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
      <Avatar className="h-8 w-8">
        <AvatarImage src="/avatars/user.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  </div>
</header>
```

### 2. Page Header
```typescript
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-neutral-900">
      Oráculos
    </h1>
    <p className="text-neutral-500 mt-2">
      Gerencie seus oráculos de conhecimento
    </p>
  </div>

  <Button
    variant="default"
    size="default"
    onClick={() => router.push('/oracles/new')}
  >
    <Plus className="h-4 w-4 mr-2" />
    Novo Oráculo
  </Button>
</div>
```

### 3. Search & Filters
```typescript
<div className="flex gap-4 mb-6">
  {/* Search Input */}
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
    <Input
      type="search"
      placeholder="Buscar por nome, tipo ou domínio..."
      className="pl-10 pr-10"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    {searchQuery && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2"
        onClick={() => setSearchQuery('')}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>

  {/* Type Filter */}
  <Select value={typeFilter} onValueChange={setTypeFilter}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Tipo" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="financial">Financial</SelectItem>
      <SelectItem value="legal">Legal</SelectItem>
      <SelectItem value="medical">Medical</SelectItem>
      <SelectItem value="technology">Technology</SelectItem>
    </SelectContent>
  </Select>

  {/* Date Filter */}
  <Select value={dateFilter} onValueChange={setDateFilter}>
    <SelectTrigger className="w-48">
      <Calendar className="h-4 w-4 mr-2" />
      <SelectValue placeholder="Criado em" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7d">Últimos 7 dias</SelectItem>
      <SelectItem value="30d">Últimos 30 dias</SelectItem>
      <SelectItem value="90d">Últimos 90 dias</SelectItem>
      <SelectItem value="custom">Personalizado</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 4. Table
```typescript
<Card className="shadow-md">
  <Table>
    <TableHeader className="bg-neutral-50">
      <TableRow>
        <TableHead className="w-[250px]">
          <Button variant="ghost" size="sm" className="font-medium">
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[150px]">
          <Button variant="ghost" size="sm" className="font-medium">
            Tipo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[300px]">Domínio</TableHead>
        <TableHead className="w-[100px] text-right">
          <Button variant="ghost" size="sm" className="font-medium">
            Docs
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[150px]">Criado em</TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {oracles.map((oracle) => (
        <TableRow
          key={oracle.id}
          className="hover:bg-neutral-50 cursor-pointer"
          onClick={() => router.push(`/oracles/${oracle.id}`)}
        >
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {oracle.name}
              {oracle.isGlobal && (
                <Badge variant="secondary" className="text-xs">
                  🌍 Global
                </Badge>
              )}
            </div>
          </TableCell>

          <TableCell>
            <Badge variant="outline" className="capitalize">
              {oracle.type}
            </Badge>
          </TableCell>

          <TableCell className="text-neutral-600 text-sm">
            {oracle.domain.slice(0, 50)}...
          </TableCell>

          <TableCell className="text-right font-mono text-sm">
            {oracle.documentCount.toLocaleString()}
          </TableCell>

          <TableCell className="text-neutral-500 text-sm">
            {formatDistanceToNow(oracle.createdAt, { addSuffix: true })}
          </TableCell>

          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/oracles/${oracle.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/oracles/${oracle.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/oracles/${oracle.id}/chat`)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-error-600"
                  onClick={() => handleDelete(oracle.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>

  {/* Pagination */}
  <div className="border-t p-4 flex items-center justify-between">
    <p className="text-sm text-neutral-500">
      Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} de {totalCount} oráculos
    </p>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>

      {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
        .slice(Math.max(0, currentPage - 3), Math.min(currentPage + 2, Math.ceil(totalCount / pageSize)))
        .map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === Math.ceil(totalCount / pageSize)}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Próximo
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>

    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10 / página</SelectItem>
        <SelectItem value="25">25 / página</SelectItem>
        <SelectItem value="50">50 / página</SelectItem>
        <SelectItem value="100">100 / página</SelectItem>
      </SelectContent>
    </Select>
  </div>
</Card>
```

---

## States & Interactions

### Empty State
When no oracles exist or search returns no results:
```typescript
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
    <FileText className="h-8 w-8 text-neutral-400" />
  </div>

  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
    {searchQuery ? 'Nenhum oráculo encontrado' : 'Nenhum oráculo criado'}
  </h3>

  <p className="text-neutral-500 mb-6 max-w-md">
    {searchQuery
      ? 'Tente ajustar os filtros ou termos de busca'
      : 'Crie seu primeiro oráculo para começar a gerenciar conhecimento'}
  </p>

  {!searchQuery && (
    <Button onClick={() => router.push('/oracles/new')}>
      <Plus className="h-4 w-4 mr-2" />
      Criar Primeiro Oráculo
    </Button>
  )}
</div>
```

### Loading State
```typescript
<div className="space-y-4">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  ))}
</div>
```

### Hover States
- Table rows: `hover:bg-neutral-50 transition-colors`
- Action buttons: `hover:bg-primary-700 transition-colors`
- Sort headers: `hover:text-primary-600 transition-colors`

### Click Actions
- **Row click**: Navigate to `/oracles/{id}`
- **Nome column sort**: Toggle asc/desc
- **Tipo column sort**: Toggle asc/desc
- **Docs column sort**: Toggle asc/desc
- **Actions menu**: Edit, View, Chat, Delete
- **Novo Oráculo button**: Navigate to `/oracles/new`

---

## Accessibility

### Keyboard Navigation
- `Tab`: Navigate between search, filters, table rows, actions
- `Enter`: Activate focused button or navigate to oracle details
- `↑↓`: Navigate table rows
- `Space`: Open dropdown menus
- `/`: Focus search input (global shortcut)

### Screen Reader
```typescript
<Table>
  <caption className="sr-only">
    Lista de oráculos de conhecimento. Use as teclas de seta para navegar.
  </caption>
  {/* ... */}
</Table>

<Button aria-label="Criar novo oráculo">
  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
  Novo Oráculo
</Button>
```

### Focus Management
- Focus "Novo Oráculo" button on page load
- Trap focus in dropdown menus when open
- Return focus to trigger button when closing dropdown

---

## Performance

### Optimizations
- Virtual scrolling for >100 rows (react-window)
- Debounced search (300ms)
- Memoized table rows (React.memo)
- Pagination: Load 10 rows at a time
- Skeleton loading while fetching data

---

## Responsive Behavior

### Desktop (≥1024px)
- Full table with all columns
- 10 rows per page default
- Sidebar navigation visible

### Tablet (768px-1023px)
- Hide "Domínio" column
- 8 rows per page
- Collapsible sidebar

### Mobile (<768px)
- Convert table to card list
- Show only: Name, Type, Docs count
- 5 items per page
- Bottom navigation

---

## Visual Specifications

### Colors Used
- Primary: `#0ea5e9` (primary-500)
- Primary Hover: `#0284c7` (primary-600)
- Text: `#525252` (neutral-600)
- Text Muted: `#737373` (neutral-500)
- Border: `#e5e5e5` (neutral-200)
- Background: `#ffffff`
- Background Hover: `#fafafa` (neutral-50)

### Typography
- Page Title (H1): `text-3xl font-bold` (30px, 700)
- Subtitle: `text-base text-neutral-500` (16px, 400)
- Table Header: `text-sm font-medium` (14px, 500)
- Table Cell: `text-sm font-normal` (14px, 400)
- Badge: `text-xs font-medium uppercase` (12px, 500)

### Spacing
- Container padding: `px-8 py-6` (32px, 24px)
- Section gap: `mb-6` (24px)
- Component gap: `gap-4` (16px)
- Table cell padding: `p-4` (16px)

---

**Status**: ✅ Ready for frontend implementation
**File**: `01_oracles_listagem.md`
**Last Updated**: 2025-12-28

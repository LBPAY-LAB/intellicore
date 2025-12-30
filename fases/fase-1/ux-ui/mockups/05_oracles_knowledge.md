# 📤 Mockup 05: `/oracles/{id}/knowledge` - Upload de Documentos

**Versão**: 1.0.0
**Data**: 2025-12-28
**Sprint**: Sprint 1 - Fundação (Epic 1.2)
**Prioridade**: High
**Story Points**: 3 SP
**Estimativa**: 3h

---

## 📋 Overview

Interface de upload e gerenciamento de documentos para a Knowledge Base do Oráculo. Suporta drag-and-drop, upload múltiplo, processamento assíncrono via WebSocket, e visualização de status em tempo real.

### Requisitos Relacionados
- **RF002**: Upload e Processamento de Documentos Multimodais
- **RF006**: Ingestão de Dados Multimodais (PDF, DOCX, MP3, MP4, etc.)
- **RF007**: Processamento Assíncrono (Background Jobs via Celery)
- **RF010**: Embedding de Documentos (OpenAI ada-002, pgvector)

### User Story
> **Como** administrador do sistema
> **Quero** fazer upload de documentos multimodais para um Oráculo
> **Para que** ele possa usar esse conhecimento nas conversas via RAG

---

## 🎨 Layout Visual (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ [← Voltar] Knowledge Base                      [?] [User ▾]     │   │
│ └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Breadcrumb                                                              │
│ Home > Oráculos > Oráculo de Compliance > Knowledge Base               │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Title Bar                                                        │   │
│ │                                                                  │   │
│ │ 📊 Oráculo de Compliance Bancário - Knowledge Base              │   │
│ │                                                                  │   │
│ │ 142 documentos • 3.2 GB • Última atualização: há 15 min         │   │
│ │                                                                  │   │
│ │ [🕸️ Ver Grafo]  [💬 Chat]  [⚙️ Configurações]                  │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Stats Bar (4 Cards)                                              │   │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│ │ │ 📄 142   │ │ ⏳ 3      │ │ ✅ 139   │ │ ❌ 0      │            │   │
│ │ │ Total    │ │ Processan│ │ Completo │ │ Erros    │            │   │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Upload Area (Drag & Drop)                                        │   │
│ │                                                                  │   │
│ │ ╔══════════════════════════════════════════════════════════════╗│   │
│ │ ║                                                              ║│   │
│ │ ║     📤                                                       ║│   │
│ │ ║                                                              ║│   │
│ │ ║     Arraste arquivos aqui ou clique para selecionar         ║│   │
│ │ ║                                                              ║│   │
│ │ ║     Formatos suportados: PDF, DOCX, XLSX, TXT, MD, HTML,    ║│   │
│ │ ║     MP3, MP4, WAV, AVI, PNG, JPG, ZIP, RAR (até 100MB)      ║│   │
│ │ ║                                                              ║│   │
│ │ ║     [Selecionar Arquivos]                                   ║│   │
│ │ ║                                                              ║│   │
│ │ ╚══════════════════════════════════════════════════════════════╝│   │
│ │                                                                  │   │
│ │ OU                                                               │   │
│ │                                                                  │   │
│ │ 🌐 Importar de URL                                               │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ https://example.com/document.pdf                           │ │   │
│ │ │                                         [Importar URL]     │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Upload Queue (3 arquivos)                                        │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 📄 relatorio-bacen-2024.pdf                                │ │   │
│ │ │ 2.5 MB                                                     │ │   │
│ │ │ ████████████████████████████████████░░░░░░░░░ 85%         │ │   │
│ │ │ ⏳ Processando: Gerando embeddings... (2/5)                │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 📊 planilha-transacoes.xlsx                                │ │   │
│ │ │ 1.2 MB                                                     │ │   │
│ │ │ ████████████████████████████████████████████░ 100%        │ │   │
│ │ │ ✅ Completo - 342 chunks indexados                         │ │   │
│ │ │ [Ver Detalhes]                                             │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ │                                                                  │   │
│ │ ┌────────────────────────────────────────────────────────────┐ │   │
│ │ │ 🎥 video-treinamento.mp4                                   │ │   │
│ │ │ 45.8 MB                                                    │ │   │
│ │ │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12%        │ │   │
│ │ │ ⏳ Processando: Extraindo áudio... (1/6)                   │ │   │
│ │ └────────────────────────────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Filters & Search                                                 │   │
│ │ ┌──────────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐ │   │
│ │ │ 🔍 Buscar... │ │ [Tipo▾] │ │ [Data▾] │ │ [Status▾]        │ │   │
│ │ └──────────────┘ └─────────┘ └─────────┘ └──────────────────┘ │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Document List (Table - 142 docs)                                 │   │
│ │                                                                  │   │
│ │ ┌─┬───────────────┬──────┬──────┬──────────┬─────────┬──────┐ │   │
│ │ │☑│ Nome          │ Tipo │ Size │ Status   │ Upload  │ Ações│ │   │
│ │ ├─┼───────────────┼──────┼──────┼──────────┼─────────┼──────┤ │   │
│ │ │☑│ 📄 bacen.pdf  │ PDF  │ 2.5MB│ ✅ OK    │ 15 min  │ [⋮]  │ │   │
│ │ │☑│ 📊 trans.xlsx │ XLSX │ 1.2MB│ ✅ OK    │ 1 hora  │ [⋮]  │ │   │
│ │ │☑│ 🎥 video.mp4  │ MP4  │ 45MB │ ⏳ Proc. │ 2 min   │ [⋮]  │ │   │
│ │ │☑│ 📝 guia.docx  │ DOCX │ 850KB│ ✅ OK    │ Ontem   │ [⋮]  │ │   │
│ │ │☑│ 🎵 audio.mp3  │ MP3  │ 12MB │ ✅ OK    │ 2 dias  │ [⋮]  │ │   │
│ │ │ ... (137 mais)                                              │ │   │
│ │ └─┴───────────────┴──────┴──────┴──────────┴─────────┴──────┘ │   │
│ │                                                                  │   │
│ │ ☑ 5 selecionados    [🗑️ Excluir]  [📥 Baixar]  [🔄 Reprocessar]│   │
│ │                                                                  │   │
│ │ Mostrando 1-10 de 142 • [◀] 1 [▶]                              │   │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes da Interface

### 1. Stats Bar (Document Metrics)

**Componente**: shadcn/ui `<Card>` em grid

```typescript
const stats = [
  {
    label: 'Total',
    value: oracle.documentCount,
    icon: FileText,
    color: 'text-neutral-600',
  },
  {
    label: 'Processando',
    value: oracle.documentsProcessing,
    icon: Loader2,
    color: 'text-warning-600',
    className: 'animate-spin',
  },
  {
    label: 'Completos',
    value: oracle.documentsCompleted,
    icon: CheckCircle2,
    color: 'text-success-600',
  },
  {
    label: 'Erros',
    value: oracle.documentsWithErrors,
    icon: XCircle,
    color: 'text-error-600',
  },
]

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat, index) => (
    <Card key={index}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
          <div className={cn('p-3 bg-neutral-50 rounded-lg', stat.color)}>
            <stat.icon className={cn('h-6 w-6', stat.className)} />
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Real-time Update**: WebSocket atualiza stats a cada progresso

---

### 2. Drag & Drop Upload Area

**Componente**: `react-dropzone`

```typescript
import { useDropzone } from 'react-dropzone'

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: handleFilesDrop,
  accept: {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'text/html': ['.html'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'video/mp4': ['.mp4'],
    'video/x-msvideo': ['.avi'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
  },
  maxSize: 100 * 1024 * 1024, // 100MB
  multiple: true,
})

<div
  {...getRootProps()}
  className={cn(
    'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
    isDragActive
      ? 'border-primary-600 bg-primary-50'
      : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
  )}
>
  <input {...getInputProps()} />
  <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
  {isDragActive ? (
    <p className="text-lg font-medium text-primary-600">Solte os arquivos aqui...</p>
  ) : (
    <>
      <p className="text-lg font-medium mb-2">
        Arraste arquivos aqui ou clique para selecionar
      </p>
      <p className="text-sm text-neutral-500 mb-4">
        Formatos suportados: PDF, DOCX, XLSX, TXT, MD, HTML, MP3, MP4, WAV, AVI, PNG, JPG,
        ZIP, RAR
        <br />
        Tamanho máximo: 100MB por arquivo
      </p>
      <Button type="button" variant="outline" className="mt-4">
        Selecionar Arquivos
      </Button>
    </>
  )}
</div>
```

**Validação**:
- Formatos: 30+ tipos suportados
- Tamanho máximo: 100MB por arquivo
- Múltiplos arquivos: Sim

---

### 3. URL Import

**Componente**: shadcn/ui `<Input>` + `<Button>`

```typescript
const [importUrl, setImportUrl] = useState('')
const [isImportingUrl, setIsImportingUrl] = useState(false)

const handleUrlImport = async () => {
  if (!importUrl || !isValidUrl(importUrl)) {
    toast({
      title: 'URL inválida',
      description: 'Por favor, insira uma URL válida',
      variant: 'destructive',
    })
    return
  }

  setIsImportingUrl(true)

  try {
    const response = await fetch('/api/v1/documents/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oracle_id: oracleId,
        url: importUrl,
      }),
    })

    if (!response.ok) throw new Error('Erro ao importar URL')

    const document = await response.json()

    toast({
      title: 'Importação iniciada',
      description: `Documento "${document.name}" está sendo processado`,
    })

    setImportUrl('')
    addToUploadQueue(document)

  } catch (error) {
    toast({
      title: 'Erro ao importar',
      description: error instanceof Error ? error.message : 'Erro desconhecido',
      variant: 'destructive',
    })
  } finally {
    setIsImportingUrl(false)
  }
}

<div className="flex items-center gap-2">
  <div className="flex-1">
    <Label htmlFor="import-url" className="mb-2 block text-sm font-medium">
      🌐 Importar de URL
    </Label>
    <Input
      id="import-url"
      type="url"
      placeholder="https://example.com/document.pdf"
      value={importUrl}
      onChange={(e) => setImportUrl(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
    />
  </div>
  <Button
    type="button"
    onClick={handleUrlImport}
    disabled={!importUrl || isImportingUrl}
    className="mt-7"
  >
    {isImportingUrl ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Importando...
      </>
    ) : (
      'Importar URL'
    )}
  </Button>
</div>
```

**Validação**:
- URL válida (http/https)
- Tipo de conteúdo suportado (via Content-Type header)

---

### 4. Upload Queue (Real-time Progress)

**Componente**: shadcn/ui `<Card>` com `<Progress>`

```typescript
interface UploadItem {
  id: string
  file: File
  name: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  currentStep?: string
  totalSteps?: number
  chunks?: number
  error?: string
}

const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])

// WebSocket connection for real-time updates
useEffect(() => {
  const ws = new WebSocket(`ws://localhost:3000/ws/documents/${oracleId}`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === data.documentId
          ? {
              ...item,
              progress: data.progress,
              status: data.status,
              currentStep: data.currentStep,
              totalSteps: data.totalSteps,
              chunks: data.chunks,
              error: data.error,
            }
          : item
      )
    )
  }

  return () => ws.close()
}, [oracleId])

<div className="space-y-3">
  {uploadQueue.map((item) => (
    <Card key={item.id}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getFileTypeIcon(item.name)}
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-neutral-500">{formatFileSize(item.size)}</p>
              </div>
            </div>
            {item.status === 'error' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRetry(item.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <Progress
            value={item.progress}
            className="h-2"
            indicatorClassName={cn(
              item.status === 'error' && 'bg-error-600',
              item.status === 'completed' && 'bg-success-600',
              (item.status === 'uploading' || item.status === 'processing') &&
                'bg-primary-600'
            )}
          />

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            {item.status === 'uploading' && (
              <p className="text-neutral-600 flex items-center gap-1">
                <Upload className="h-3 w-3 animate-pulse" />
                Enviando... {item.progress}%
              </p>
            )}
            {item.status === 'processing' && (
              <p className="text-warning-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processando: {item.currentStep} ({item.progress}%)
              </p>
            )}
            {item.status === 'completed' && (
              <p className="text-success-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completo - {item.chunks} chunks indexados
              </p>
            )}
            {item.status === 'error' && (
              <p className="text-error-600 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Erro: {item.error}
              </p>
            )}

            {item.status === 'completed' && (
              <Button variant="link" size="sm" onClick={() => handleViewDetails(item.id)}>
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Processing Steps** (exemplo para PDF):
1. Upload (0-20%)
2. Extração de texto (20-40%)
3. Chunking (40-60%)
4. Geração de embeddings (60-90%)
5. Indexação em vector DB (90-100%)

---

### 5. Filters & Search

**Componente**: shadcn/ui `<Input>` + `<Select>`

```typescript
<div className="flex items-center gap-3">
  <div className="flex-1">
    <Input
      placeholder="🔍 Buscar por nome..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <Select value={typeFilter} onValueChange={setTypeFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Tipo" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos os Tipos</SelectItem>
      <SelectItem value="pdf">📄 PDF</SelectItem>
      <SelectItem value="docx">📝 DOCX</SelectItem>
      <SelectItem value="xlsx">📊 XLSX</SelectItem>
      <SelectItem value="txt">📝 TXT</SelectItem>
      <SelectItem value="mp3">🎵 MP3</SelectItem>
      <SelectItem value="mp4">🎥 MP4</SelectItem>
      <SelectItem value="image">🖼️ Imagem</SelectItem>
      <SelectItem value="archive">📦 Arquivo</SelectItem>
    </SelectContent>
  </Select>

  <Select value={dateFilter} onValueChange={setDateFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Data" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todas as Datas</SelectItem>
      <SelectItem value="today">Hoje</SelectItem>
      <SelectItem value="week">Esta Semana</SelectItem>
      <SelectItem value="month">Este Mês</SelectItem>
      <SelectItem value="custom">Personalizado</SelectItem>
    </SelectContent>
  </Select>

  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos os Status</SelectItem>
      <SelectItem value="completed">✅ Completo</SelectItem>
      <SelectItem value="processing">⏳ Processando</SelectItem>
      <SelectItem value="error">❌ Erro</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

### 6. Document List (Table)

**Componente**: shadcn/ui `<Table>` com seleção múltipla

```typescript
const [selectedDocs, setSelectedDocs] = useState<string[]>([])

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox
          checked={selectedDocs.length === filteredDocuments.length}
          onCheckedChange={(checked) =>
            setSelectedDocs(checked ? filteredDocuments.map((d) => d.id) : [])
          }
        />
      </TableHead>
      <TableHead className="w-[300px]">Nome</TableHead>
      <TableHead className="w-[80px]">Tipo</TableHead>
      <TableHead className="w-[100px]">Tamanho</TableHead>
      <TableHead className="w-[150px]">Status</TableHead>
      <TableHead className="w-[150px]">Upload</TableHead>
      <TableHead className="w-[80px]">Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredDocuments.map((doc) => (
      <TableRow
        key={doc.id}
        className={cn(
          'cursor-pointer hover:bg-neutral-50',
          selectedDocs.includes(doc.id) && 'bg-primary-50'
        )}
        onClick={() => handleRowClick(doc.id)}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedDocs.includes(doc.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedDocs([...selectedDocs, doc.id])
              } else {
                setSelectedDocs(selectedDocs.filter((id) => id !== doc.id))
              }
            }}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getFileTypeIcon(doc.filename)}
            <span className="font-medium truncate">{doc.filename}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{doc.mimeType.split('/')[1].toUpperCase()}</Badge>
        </TableCell>
        <TableCell className="text-sm text-neutral-600">
          {formatFileSize(doc.size)}
        </TableCell>
        <TableCell>
          {doc.status === 'completed' && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completo
            </Badge>
          )}
          {doc.status === 'processing' && (
            <Badge variant="warning">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processando
            </Badge>
          )}
          {doc.status === 'error' && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Erro
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-sm text-neutral-600">
          {formatDistanceToNow(new Date(doc.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </DropdownMenuItem>
              {doc.status === 'error' && (
                <DropdownMenuItem onClick={() => handleReprocess(doc.id)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reprocessar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(doc.id)}
                className="text-error-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

{/* Bulk Actions */}
{selectedDocs.length > 0 && (
  <div className="flex items-center justify-between py-3 px-4 bg-primary-50 border-t">
    <p className="text-sm font-medium">
      ☑ {selectedDocs.length} selecionado{selectedDocs.length > 1 && 's'}
    </p>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkDownload}
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkReprocess}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reprocessar
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir
      </Button>
    </div>
  </div>
)}
```

---

## 🔄 Interações e Comportamentos

### 1. File Upload Flow

```typescript
const handleFilesDrop = async (acceptedFiles: File[]) => {
  // Validate files
  const validFiles = acceptedFiles.filter((file) => {
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: `Arquivo ${file.name} muito grande`,
        description: 'Tamanho máximo: 100MB',
        variant: 'destructive',
      })
      return false
    }
    return true
  })

  // Add to upload queue
  const uploadItems: UploadItem[] = validFiles.map((file) => ({
    id: crypto.randomUUID(),
    file,
    name: file.name,
    size: file.size,
    status: 'uploading',
    progress: 0,
  }))

  setUploadQueue((prev) => [...prev, ...uploadItems])

  // Upload files sequentially
  for (const item of uploadItems) {
    await uploadFile(item)
  }
}

const uploadFile = async (item: UploadItem) => {
  const formData = new FormData()
  formData.append('file', item.file)
  formData.append('oracle_id', oracleId)

  try {
    const response = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
      // Track upload progress
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, progress: Math.min(percentCompleted, 20) }
              : i
          )
        )
      },
    })

    if (!response.ok) throw new Error('Upload falhou')

    const document = await response.json()

    // Upload complete, now processing starts (WebSocket will update progress)
    setUploadQueue((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: 'processing', progress: 20 }
          : i
      )
    )

  } catch (error) {
    setUploadQueue((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'error',
              error: error instanceof Error ? error.message : 'Erro desconhecido',
            }
          : i
      )
    )
  }
}
```

---

### 2. WebSocket Real-time Updates

```typescript
// Backend sends processing updates via WebSocket
{
  "documentId": "doc-123",
  "status": "processing",
  "progress": 60,
  "currentStep": "Gerando embeddings",
  "totalSteps": 5,
  "chunks": 0
}

// When processing completes
{
  "documentId": "doc-123",
  "status": "completed",
  "progress": 100,
  "chunks": 342
}
```

---

### 3. Bulk Actions

```typescript
const handleBulkDelete = async () => {
  const confirmed = await showConfirmDialog({
    title: 'Excluir Documentos',
    description: `Tem certeza que deseja excluir ${selectedDocs.length} documento(s)? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    confirmVariant: 'destructive',
  })

  if (!confirmed) return

  try {
    await Promise.all(
      selectedDocs.map((docId) =>
        fetch(`/api/v1/documents/${docId}`, { method: 'DELETE' })
      )
    )

    toast({
      title: 'Documentos excluídos',
      description: `${selectedDocs.length} documento(s) excluído(s) com sucesso`,
    })

    setSelectedDocs([])
    refetchDocuments()

  } catch (error) {
    toast({
      title: 'Erro ao excluir',
      variant: 'destructive',
    })
  }
}
```

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- Drag & Drop acessível via teclado (click para selecionar)
- Progress bars com `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Table com `<thead>`, `<tbody>`, proper headers
- Checkbox com `aria-label` para seleção
- Focus visible em todas as interações

---

## 📱 Responsividade

### Desktop (≥1024px)
- Table: 7 colunas visíveis
- Stats bar: 4 colunas

### Tablet (768px - 1023px)
- Table: 5 colunas (esconde "Upload" e "Tipo")
- Stats bar: 2 colunas

### Mobile (<768px)
- Table vira Cards (lista vertical)
- Stats bar: 1 coluna
- Filters stackam verticalmente

---

## 🧪 Casos de Teste

1. **Upload via Drag & Drop**: Arrastar 3 PDFs, upload concluído com sucesso
2. **Upload via Click**: Selecionar 5 arquivos, todos adicionados à queue
3. **File Size Validation**: Tentar upload de 150MB, erro "Arquivo muito grande"
4. **Invalid Format**: Tentar upload de .exe, erro "Formato não suportado"
5. **Real-time Progress**: Progress bar atualiza de 0% a 100% via WebSocket
6. **Processing Steps**: Status muda: Upload → Processando → Completo
7. **Error Handling**: Se processing falha, status vira "Erro" + botão Reprocessar
8. **URL Import**: Importar https://example.com/doc.pdf, documento adicionado
9. **Bulk Delete**: Selecionar 10 docs, clicar "Excluir", confirmação + delete bem-sucedido
10. **Filters**: Filtrar por "PDF" + "Esta Semana", lista atualiza corretamente

---

**Status**: ✅ Complete
**Próximo Mockup**: [06_oracles_graph.md](06_oracles_graph.md)
**Última Atualização**: 2025-12-28

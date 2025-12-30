# Mockup: /oracles/{id}/chat - IA Assistant 🔥 CRITICAL

**Screen**: Oracle AI Assistant Chat Interface
**Route**: `/oracles/{oracleId}/chat`
**Resolution**: 1920x1080
**Components**: Chat Messages, Markdown Renderer, Streaming Indicator, Session History, Input Textarea
**Priority**: 🔥 CRITICAL - Core feature for Phase 1

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, h-16, border-b, bg-white, z-50)                              │
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ │ [◀ Voltar] Financial Core › AI Assistant    [Oracle Icon] [Settings] │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (flex h-[calc(100vh-4rem)])                                     │
│ ┌───────────────────────┬──────────────────────────────────────────────────┐ │
│ │ SIDEBAR (w-80)        │ CHAT AREA (flex-1)                               │ │
│ │ (border-r bg-neutral-│                                                   │ │
│ │  -50)                 │                                                   │ │
│ │                       │                                                   │ │
│ │ ┌──────────────────┐  │ ┌─ CHAT HEADER (border-b p-4) ────────────────┐ │ │
│ │ │ [+] Nova Sessão │  │ │ <div class="flex items-center gap-3">        │ │ │
│ │ └──────────────────┘  │ │   <div class="h-10 w-10 rounded-lg          │ │ │
│ │                       │ │         bg-gradient-to-br from-primary-500   │ │ │
│ │ ┌─ SESSIONS ────────┐ │ │         to-secondary-500 flex items-center  │ │ │
│ │ │                   │ │ │         justify-center">                     │ │ │
│ │ │ 📅 Hoje           │ │ │     <Bot className="h-6 w-6 text-white" />  │ │ │
│ │ │ ─────────────     │ │ │   </div>                                     │ │ │
│ │ │ 💬 Financial Q&A │ │ │   <div>                                      │ │ │
│ │ │    14:32          │ │ │     <h2 class="font-semibold text-lg">     │ │ │
│ │ │    [Active*]      │ │ │       Assistente Financial Core            │ │ │
│ │ │                   │ │ │     </h2>                                    │ │ │
│ │ │ 💬 Risk Analysis  │ │ │     <p class="text-sm text-neutral-500">   │ │ │
│ │ │    10:15          │ │ │       Powered by GPT-4 Turbo + RAG Trimodal│ │ │
│ │ │                   │ │ │     </p>                                     │ │ │
│ │ │ 📅 Ontem         │ │ │   </div>                                     │ │ │
│ │ │ ─────────────     │ │ │   <Badge variant="secondary" class="ml-auto">│ │
│ │ │ 💬 Compliance... │ │ │     Online                                   │ │ │
│ │ │    Yesterday      │ │ │   </Badge>                                   │ │ │
│ │ │                   │ │ │ </div>                                       │ │ │
│ │ │ 💬 Audit Trail   │ │ │ └──────────────────────────────────────────────┘ │
│ │ │    2 days ago     │ │ │                                                 │ │
│ │ │                   │ │ │ ┌─ MESSAGES CONTAINER (flex-1 overflow-auto) ─┐ │
│ │ │ 📅 Esta Semana   │ │ │ │ (p-6 space-y-6)                             │ │
│ │ │ ─────────────     │ │ │ │                                             │ │
│ │ │ 💬 Product...    │ │ │ │ ┌─ USER MESSAGE (ml-auto max-w-2xl) ───────┐│ │
│ │ │ 💬 Regulator...  │ │ │ │ │ <div class="flex gap-3 justify-end">     ││ │
│ │ │ 💬 Tax Policy... │ │ │ │ │   <div class="bg-primary-600             ││ │
│ │ │                   │ │ │ │ │         text-white rounded-2xl          ││ │
│ │ │ [Load More]       │ │ │ │ │         px-4 py-3 max-w-xl">            ││ │
│ │ └───────────────────┘ │ │ │ │     What are the key requirements for   ││ │
│ │                       │ │ │ │ │     Basel III capital adequacy?         ││ │
│ │ ┌─ CONTEXT PANEL ──┐ │ │ │ │   </div>                                 ││ │
│ │ │ 📊 Contexto      │ │ │ │ │   <Avatar class="h-8 w-8">              ││ │
│ │ │ ─────────────     │ │ │ │ │     <AvatarFallback>JD</AvatarFallback> ││ │
│ │ │ • 1,247 docs     │ │ │ │ │   </Avatar>                              ││ │
│ │ │ • 15,234 chunks  │ │ │ │ │ </div>                                   ││ │
│ │ │ • 3 data sources │ │ │ │ │ <span class="text-xs text-neutral-500   ││ │
│ │ │ • GPT-4 Turbo    │ │ │ │ │        text-right block mt-1">          ││ │
│ │ │ • Updated 5m ago │ │ │ │ │   14:32 • Entregue                       ││ │
│ │ └───────────────────┘ │ │ │ │ </span>                                  ││ │
│ │                       │ │ │ │ └──────────────────────────────────────────┘│ │
│ │                       │ │ │ │                                             │ │
│ │                       │ │ │ │ ┌─ ASSISTANT MESSAGE (mr-auto max-w-2xl) ─┐│ │
│ │                       │ │ │ │ │ <div class="flex gap-3">                ││ │
│ │                       │ │ │ │ │   <Avatar class="h-8 w-8 bg-gradient-to││ │
│ │                       │ │ │ │ │           -br from-primary-500 to-      ││ │
│ │                       │ │ │ │ │           secondary-500">               ││ │
│ │                       │ │ │ │ │     <Bot class="h-5 w-5 text-white" />  ││ │
│ │                       │ │ │ │ │   </Avatar>                             ││ │
│ │                       │ │ │ │ │   <div class="bg-neutral-100 rounded-2xl││ │
│ │                       │ │ │ │ │         px-4 py-3 max-w-2xl">           ││ │
│ │                       │ │ │ │ │     <!-- MARKDOWN CONTENT -->           ││ │
│ │                       │ │ │ │ │     <h3 class="font-semibold mb-2">    ││ │
│ │                       │ │ │ │ │       Basel III Capital Requirements   ││ │
│ │                       │ │ │ │ │     </h3>                               ││ │
│ │                       │ │ │ │ │     <p class="mb-3">                    ││ │
│ │                       │ │ │ │ │       Basel III introduces several key ││ │
│ │                       │ │ │ │ │       requirements for capital adequacy:││ │
│ │                       │ │ │ │ │     </p>                                ││ │
│ │                       │ │ │ │ │     <ol class="list-decimal list-inside││ │
│ │                       │ │ │ │ │             space-y-2 mb-3">            ││ │
│ │                       │ │ │ │ │       <li><strong>Minimum CET1...</li> ││ │
│ │                       │ │ │ │ │       <li><strong>Tier 1 Capital...</li│ │
│ │                       │ │ │ │ │       <li><strong>Total Capital...</li> ││ │
│ │                       │ │ │ │ │     </ol>                               ││ │
│ │                       │ │ │ │ │     <div class="bg-blue-50 border-l-4  ││ │
│ │                       │ │ │ │ │           border-blue-500 p-3 mb-3">   ││ │
│ │                       │ │ │ │ │       💡 <strong>Key Insight:</strong> ││ │
│ │                       │ │ │ │ │       Banks must maintain...            ││ │
│ │                       │ │ │ │ │     </div>                              ││ │
│ │                       │ │ │ │ │     <pre><code class="text-sm">        ││ │
│ │                       │ │ │ │ │       CET1 Ratio = CET1 Capital /      ││ │
│ │                       │ │ │ │ │                    RWA                  ││ │
│ │                       │ │ │ │ │     </code></pre>                       ││ │
│ │                       │ │ │ │ │   </div>                                ││ │
│ │                       │ │ │ │ │ </div>                                  ││ │
│ │                       │ │ │ │ │ <div class="flex items-center gap-2    ││ │
│ │                       │ │ │ │ │       mt-2 text-xs text-neutral-500">  ││ │
│ │                       │ │ │ │ │   <span>14:32</span>                    ││ │
│ │                       │ │ │ │ │   <button class="hover:text-primary-600││ │
│ │                       │ │ │ │ │           transition-colors"            ││ │
│ │                       │ │ │ │ │           title="Ver fontes RAG">      ││ │
│ │                       │ │ │ │ │     [📚 3 fontes] ← TOOLTIP            ││ │
│ │                       │ │ │ │ │   </button>                             ││ │
│ │                       │ │ │ │ │   <button class="hover:text-primary-600││ │
│ │                       │ │ │ │ │           transition-colors">           ││ │
│ │                       │ │ │ │ │     [👍]                                ││ │
│ │                       │ │ │ │ │   </button>                             ││ │
│ │                       │ │ │ │ │   <button class="hover:text-primary-600││ │
│ │                       │ │ │ │ │           transition-colors">           ││ │
│ │                       │ │ │ │ │     [👎]                                ││ │
│ │                       │ │ │ │ │   </button>                             ││ │
│ │                       │ │ │ │ │   <button class="hover:text-primary-600││ │
│ │                       │ │ │ │ │           transition-colors">           ││ │
│ │                       │ │ │ │ │     [📋 Copiar]                         ││ │
│ │                       │ │ │ │ │   </button>                             ││ │
│ │                       │ │ │ │ │ </div>                                  ││ │
│ │                       │ │ │ │ └──────────────────────────────────────────┘│ │
│ │                       │ │ │ │                                             │ │
│ │                       │ │ │ │ ┌─ STREAMING MESSAGE (typing) ────────────┐│ │
│ │                       │ │ │ │ │ <div class="flex gap-3">                ││ │
│ │                       │ │ │ │ │   <Avatar class="h-8 w-8 bg-gradient">  ││ │
│ │                       │ │ │ │ │     <Bot class="h-5 w-5 text-white" />  ││ │
│ │                       │ │ │ │ │   </Avatar>                             ││ │
│ │                       │ │ │ │ │   <div class="bg-neutral-100 rounded-2xl││ │
│ │                       │ │ │ │ │         px-4 py-3">                     ││ │
│ │                       │ │ │ │ │     <div class="flex gap-1">            ││ │
│ │                       │ │ │ │ │       <span class="h-2 w-2 bg-neutral- ││ │
│ │                       │ │ │ │ │             400 rounded-full animate-   ││ │
│ │                       │ │ │ │ │             bounce"></span>             ││ │
│ │                       │ │ │ │ │       <span class="h-2 w-2 bg-neutral- ││ │
│ │                       │ │ │ │ │             400 rounded-full animate-   ││ │
│ │                       │ │ │ │ │             bounce [animation-delay:    ││ │
│ │                       │ │ │ │ │             0.2s]"></span>              ││ │
│ │                       │ │ │ │ │       <span class="h-2 w-2 bg-neutral- ││ │
│ │                       │ │ │ │ │             400 rounded-full animate-   ││ │
│ │                       │ │ │ │ │             bounce [animation-delay:    ││ │
│ │                       │ │ │ │ │             0.4s]"></span>              ││ │
│ │                       │ │ │ │ │     </div>                              ││ │
│ │                       │ │ │ │ │   </div>                                ││ │
│ │                       │ │ │ │ │ </div>                                  ││ │
│ │                       │ │ │ │ └──────────────────────────────────────────┘│ │
│ │                       │ │ │ └─────────────────────────────────────────────┘ │
│ │                       │ │ │                                                 │ │
│ │                       │ │ │ ┌─ INPUT AREA (border-t p-4) ─────────────────┐ │
│ │                       │ │ │ │ <div class="flex gap-3">                    │ │
│ │                       │ │ │ │   <Textarea                                 │ │
│ │                       │ │ │ │     placeholder="Digite sua mensagem... (Shift│ │
│ │                       │ │ │ │                  +Enter para nova linha)"  │ │
│ │                       │ │ │ │     className="flex-1 min-h-[60px] max-h-  │ │
│ │                       │ │ │ │                [200px] resize-none"         │ │
│ │                       │ │ │ │     onKeyDown={handleKeyDown}               │ │
│ │                       │ │ │ │   />                                        │ │
│ │                       │ │ │ │   <div class="flex flex-col gap-2">        │ │
│ │                       │ │ │ │     <Button                                 │ │
│ │                       │ │ │ │       variant="default"                     │ │
│ │                       │ │ │ │       size="icon"                           │ │
│ │                       │ │ │ │       className="h-14 w-14"                 │ │
│ │                       │ │ │ │       disabled={!message || isStreaming}    │ │
│ │                       │ │ │ │     >                                       │ │
│ │                       │ │ │ │       <Send class="h-5 w-5" />              │ │
│ │                       │ │ │ │     </Button>                               │ │
│ │                       │ │ │ │     <Button                                 │ │
│ │                       │ │ │ │       variant="ghost"                       │ │
│ │                       │ │ │ │       size="icon"                           │ │
│ │                       │ │ │ │       className="h-10 w-14"                 │ │
│ │                       │ │ │ │       title="Anexar arquivo"                │ │
│ │                       │ │ │ │     >                                       │ │
│ │                       │ │ │ │       <Paperclip class="h-4 w-4" />         │ │
│ │                       │ │ │ │     </Button>                               │ │
│ │                       │ │ │ │   </div>                                    │ │
│ │                       │ │ │ │ </div>                                      │ │
│ │                       │ │ │ │ <p class="text-xs text-neutral-500 mt-2">  │ │
│ │                       │ │ │ │   🔒 Suas conversas são privadas e criptogra│ │
│ │                       │ │ │ │   fadas. Os dados não são compartilhados.   │ │
│ │                       │ │ │ │ </p>                                        │ │
│ │                       │ │ │ └─────────────────────────────────────────────┘ │
│ └───────────────────────┴──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Chat Header
```typescript
<div className="border-b p-4 bg-white">
  <div className="flex items-center gap-3">
    {/* AI Avatar */}
    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
      <Bot className="h-6 w-6 text-white" />
    </div>

    {/* Title & Subtitle */}
    <div className="flex-1">
      <h2 className="font-semibold text-lg text-neutral-900">
        Assistente {oracle.name}
      </h2>
      <p className="text-sm text-neutral-500">
        Powered by GPT-4 Turbo + RAG Trimodal (SQL + Graph + Vector)
      </p>
    </div>

    {/* Status Badge */}
    <Badge variant="secondary" className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
      Online
    </Badge>

    {/* Settings Button */}
    <Button variant="ghost" size="icon">
      <Settings className="h-5 w-5" />
    </Button>
  </div>
</div>
```

### 2. Sidebar - Session History
```typescript
<aside className="w-80 border-r bg-neutral-50 flex flex-col h-full">
  {/* New Session Button */}
  <div className="p-4 border-b bg-white">
    <Button
      variant="default"
      className="w-full justify-start"
      onClick={createNewSession}
    >
      <Plus className="h-4 w-4 mr-2" />
      Nova Sessão
    </Button>
  </div>

  {/* Sessions List */}
  <div className="flex-1 overflow-auto p-4 space-y-4">
    {/* Grouped by date */}
    {Object.entries(groupedSessions).map(([dateLabel, sessions]) => (
      <div key={dateLabel}>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2 flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {dateLabel}
        </h3>

        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                "hover:bg-white hover:shadow-sm",
                session.id === currentSessionId
                  ? "bg-white shadow-sm border-l-2 border-primary-500"
                  : "bg-transparent"
              )}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-neutral-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900 truncate">
                    {session.title || 'Nova conversa'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                  </p>
                  {session.messageCount > 0 && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {session.messageCount} mensagens
                    </p>
                  )}
                </div>

                {session.id === currentSessionId && (
                  <Badge variant="secondary" className="text-xs">
                    Ativa
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    ))}

    {/* Load More */}
    {hasMoreSessions && (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={loadMoreSessions}
      >
        Carregar mais sessões
      </Button>
    )}
  </div>

  {/* Context Panel */}
  <div className="border-t p-4 bg-white">
    <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-3 flex items-center gap-2">
      <BarChart className="h-3 w-3" />
      Contexto do Oráculo
    </h3>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-neutral-600">Documentos:</span>
        <span className="font-mono font-medium">{oracle.stats.documentCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">Chunks:</span>
        <span className="font-mono font-medium">{oracle.stats.chunkCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">Embeddings:</span>
        <span className="font-mono font-medium">{oracle.stats.embeddingCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">Modelo:</span>
        <span className="font-medium">GPT-4 Turbo</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">Atualizado:</span>
        <span className="text-neutral-500">{formatDistanceToNow(oracle.updatedAt, { addSuffix: true })}</span>
      </div>
    </div>
  </div>
</aside>
```

### 3. Message Components

#### User Message
```typescript
<div className="flex gap-3 justify-end">
  <div className="bg-primary-600 text-white rounded-2xl px-4 py-3 max-w-xl shadow-sm">
    <p className="text-sm leading-relaxed">
      {message.content}
    </p>
  </div>

  <Avatar className="h-8 w-8 ring-2 ring-primary-100">
    <AvatarImage src={user.avatarUrl} />
    <AvatarFallback>{user.initials}</AvatarFallback>
  </Avatar>
</div>

<div className="flex justify-end gap-2 mt-1 text-xs text-neutral-500">
  <span>{format(message.createdAt, 'HH:mm')}</span>
  {message.status === 'sent' && <Check className="h-3 w-3" />}
  {message.status === 'delivered' && (
    <>
      <Check className="h-3 w-3" />
      <Check className="h-3 w-3 -ml-2" />
    </>
  )}
</div>
```

#### Assistant Message with Markdown
```typescript
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

<div className="flex gap-3">
  <Avatar className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 shadow-sm">
    <Bot className="h-5 w-5 text-white" />
  </Avatar>

  <div className="bg-neutral-100 rounded-2xl px-4 py-3 max-w-2xl shadow-sm">
    <ReactMarkdown
      className="prose prose-sm max-w-none"
      components={{
        // Custom heading styles
        h1: ({ node, ...props }) => (
          <h1 className="text-xl font-bold text-neutral-900 mb-3 mt-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-lg font-semibold text-neutral-800 mb-2 mt-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-base font-medium text-neutral-700 mb-2" {...props} />
        ),

        // Paragraph
        p: ({ node, ...props }) => (
          <p className="text-neutral-700 leading-relaxed mb-3" {...props} />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-neutral-700" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-neutral-700" {...props} />
        ),

        // Code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-lg mb-3"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-3 italic text-neutral-700" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full divide-y divide-neutral-200" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-2 bg-neutral-50 text-left text-xs font-medium text-neutral-700 uppercase" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-2 text-sm text-neutral-700 border-t" {...props} />
        ),

        // Links
        a: ({ node, ...props }) => (
          <a className="text-primary-600 hover:text-primary-700 underline" {...props} />
        ),
      }}
    >
      {message.content}
    </ReactMarkdown>
  </div>
</div>

{/* Message Actions */}
<div className="flex items-center gap-3 mt-2 ml-11 text-xs text-neutral-500">
  <span>{format(message.createdAt, 'HH:mm')}</span>

  {/* RAG Sources Badges (Global vs Per-Oracle) */}
  {message.sources && message.sources.length > 0 && (
    <div className="flex items-center gap-2 flex-wrap">
      {message.sources.map((source, idx) => (
        <Badge
          key={idx}
          variant={source.sourceType === 'global' ? 'secondary' : 'default'}
          className="text-xs"
        >
          {source.sourceType === 'global' ? '🌍' : '📄'}
          {' '}
          {source.sourceType === 'global' ? 'Global' : oracle.name}
          {source.type === 'sql' && ' • 🗄️'}
          {source.type === 'graph' && ' • 🕸️'}
          {source.type === 'vector' && ' • 🔍'}
        </Badge>
      ))}
    </div>
  )}

  {/* RAG Sources Tooltip (Detailed) */}
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="flex items-center gap-1 hover:text-primary-600 transition-colors">
        <FileText className="h-3 w-3" />
        <span>{message.sources.length} fontes</span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-md">
      <div className="space-y-2">
        <p className="font-semibold text-sm mb-2">Fontes RAG utilizadas:</p>
        {message.sources.map((source, idx) => (
          <div key={idx} className="text-xs border-l-2 border-primary-500 pl-2">
            <p className="font-medium">
              {source.sourceType === 'global' ? '🌍 RAG Global' : '📄 Per-Oracle'}
              {' • '}
              {source.type === 'sql' && '🗄️ SQL'}
              {source.type === 'graph' && '🕸️ Graph'}
              {source.type === 'vector' && '🔍 Vector'}
              {' '}{source.documentName}
            </p>
            <p className="text-neutral-500">
              Score: {(source.score * 100).toFixed(1)}% | Chunk: {source.chunkId}
            </p>
          </div>
        ))}
      </div>
    </TooltipContent>
  </Tooltip>

  {/* Feedback Buttons */}
  <button
    onClick={() => provideFeedback(message.id, 'positive')}
    className={cn(
      "hover:text-success-600 transition-colors",
      message.feedback === 'positive' && "text-success-600"
    )}
    title="Resposta útil"
  >
    <ThumbsUp className="h-3 w-3" />
  </button>

  <button
    onClick={() => provideFeedback(message.id, 'negative')}
    className={cn(
      "hover:text-error-600 transition-colors",
      message.feedback === 'negative' && "text-error-600"
    )}
    title="Resposta não útil"
  >
    <ThumbsDown className="h-3 w-3" />
  </button>

  {/* Copy Button */}
  <button
    onClick={() => copyToClipboard(message.content)}
    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
    title="Copiar resposta"
  >
    <Copy className="h-3 w-3" />
    Copiar
  </button>

  {/* Regenerate Button */}
  <button
    onClick={() => regenerateResponse(message.id)}
    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
    title="Regenerar resposta"
  >
    <RefreshCw className="h-3 w-3" />
    Regenerar
  </button>
</div>
```

#### Streaming Indicator (Typing)
```typescript
<div className="flex gap-3">
  <Avatar className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500">
    <Bot className="h-5 w-5 text-white" />
  </Avatar>

  <div className="bg-neutral-100 rounded-2xl px-4 py-3">
    <div className="flex gap-1.5">
      <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" />
      <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
      <span className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  </div>
</div>
```

### 4. Input Area
```typescript
<div className="border-t p-4 bg-white">
  <div className="flex gap-3">
    {/* Textarea with auto-resize */}
    <Textarea
      ref={textareaRef}
      value={message}
      onChange={(e) => {
        setMessage(e.target.value)
        autoResize(e.target)
      }}
      onKeyDown={handleKeyDown}
      placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
      className="flex-1 min-h-[60px] max-h-[200px] resize-none"
      disabled={isStreaming}
    />

    {/* Actions Column */}
    <div className="flex flex-col gap-2">
      {/* Send Button */}
      <Button
        variant="default"
        size="icon"
        className="h-14 w-14"
        onClick={sendMessage}
        disabled={!message.trim() || isStreaming}
      >
        {isStreaming ? (
          <Square className="h-5 w-5" title="Parar geração" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>

      {/* Attach File Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-14"
        onClick={() => fileInputRef.current?.click()}
        title="Anexar arquivo (imagem, PDF, texto)"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
      />
    </div>
  </div>

  {/* Privacy Notice */}
  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
    <Lock className="h-3 w-3" />
    Suas conversas são privadas e criptografadas. Os dados não são compartilhados.
  </p>

  {/* Character Count (optional) */}
  {message.length > 0 && (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-neutral-400">
        {message.length} caracteres
      </span>
      {message.length > 2000 && (
        <Badge variant="destructive" className="text-xs">
          Limite recomendado: 2000 caracteres
        </Badge>
      )}
    </div>
  )}
</div>
```

---

## Streaming Implementation (Server-Sent Events)

### Frontend Hook
```typescript
import { useEffect, useRef, useState } from 'react'

export function useStreamingChat(oracleId: string, sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const currentMessageRef = useRef<string>('')

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, userMessage])

    // Start streaming
    setIsStreaming(true)
    currentMessageRef.current = ''

    // Create assistant message placeholder
    const assistantMessageId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        sources: [],
      },
    ])

    // Establish SSE connection
    const eventSource = new EventSource(
      `/api/v1/oracles/${oracleId}/chat/stream?sessionId=${sessionId}&message=${encodeURIComponent(content)}`
    )
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'token') {
        // Append token to current message
        currentMessageRef.current += data.content

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: currentMessageRef.current }
              : msg
          )
        )
      } else if (data.type === 'sources') {
        // Update sources
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, sources: data.sources }
              : msg
          )
        )
      } else if (data.type === 'done') {
        // Streaming complete
        eventSource.close()
        setIsStreaming(false)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
      setIsStreaming(false)

      // Show error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: 'Erro ao gerar resposta. Por favor, tente novamente.',
          createdAt: new Date(),
        },
      ])
    }
  }

  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      setIsStreaming(false)
    }
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return { messages, sendMessage, stopStreaming, isStreaming }
}
```

### Backend Endpoint (FastAPI)
```python
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json

router = APIRouter()

@router.get("/oracles/{oracle_id}/chat/stream")
async def stream_chat_response(
    oracle_id: str,
    session_id: str = Query(...),
    message: str = Query(...),
) -> StreamingResponse:
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # 1. Retrieve context via RAG Trimodal
            rag_context = await rag_service.retrieve_context(
                oracle_id=oracle_id,
                query=message,
                sources=['sql', 'graph', 'vector']
            )

            # 2. Stream LLM response
            async for chunk in llm_service.stream_completion(
                messages=[
                    {"role": "system", "content": f"Context: {rag_context.text}"},
                    {"role": "user", "content": message}
                ]
            ):
                # Send token
                yield f"data: {json.dumps({'type': 'token', 'content': chunk.text})}\n\n"

            # 3. Send sources metadata
            yield f"data: {json.dumps({
                'type': 'sources',
                'sources': [
                    {
                        'type': source.type,
                        'documentName': source.document_name,
                        'chunkId': source.chunk_id,
                        'score': source.score
                    }
                    for source in rag_context.sources
                ]
            })}\n\n"

            # 4. Signal completion
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )
```

---

## States & Interactions

### Empty State (No Messages)
```typescript
<div className="flex flex-col items-center justify-center h-full text-center px-6">
  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6 shadow-lg">
    <Bot className="h-12 w-12 text-white" />
  </div>

  <h2 className="text-2xl font-bold text-neutral-900 mb-3">
    Bem-vindo ao Assistente {oracle.name}
  </h2>

  <p className="text-neutral-600 mb-6 max-w-md">
    Faça perguntas sobre o conhecimento do oráculo. O assistente utiliza RAG Trimodal
    (SQL + Graph + Vector) para fornecer respostas precisas e contextualizadas.
  </p>

  {/* Suggested Questions */}
  <div className="grid grid-cols-2 gap-3 max-w-2xl">
    {suggestedQuestions.map((question, idx) => (
      <button
        key={idx}
        onClick={() => setMessage(question)}
        className="p-4 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
      >
        <p className="text-sm font-medium text-neutral-900">{question}</p>
      </button>
    ))}
  </div>
</div>
```

### Error State
```typescript
<div className="flex gap-3">
  <Avatar className="h-8 w-8 bg-error-100">
    <AlertCircle className="h-5 w-5 text-error-600" />
  </Avatar>

  <div className="bg-error-50 border border-error-200 rounded-2xl px-4 py-3 max-w-xl">
    <p className="text-sm text-error-900">
      <strong>Erro ao processar mensagem</strong>
    </p>
    <p className="text-xs text-error-700 mt-1">
      {error.message}
    </p>
    <Button
      variant="outline"
      size="sm"
      className="mt-3"
      onClick={retryMessage}
    >
      <RefreshCw className="h-3 w-3 mr-2" />
      Tentar novamente
    </Button>
  </div>
</div>
```

### Keyboard Shortcuts
- `Enter`: Send message (when textarea focused)
- `Shift+Enter`: New line in message
- `Cmd/Ctrl+K`: Focus search sessions (sidebar)
- `Cmd/Ctrl+N`: New session
- `Esc`: Stop streaming generation
- `↑↓`: Navigate session history (sidebar)

---

## Accessibility

### ARIA Labels
```typescript
<section aria-label="Chat conversation" role="log" aria-live="polite">
  {messages.map((msg) => (
    <div
      key={msg.id}
      role={msg.role === 'user' ? 'article' : 'status'}
      aria-label={`${msg.role === 'user' ? 'Você' : 'Assistente'} em ${format(msg.createdAt, 'HH:mm')}`}
    >
      {msg.content}
    </div>
  ))}
</section>

<form onSubmit={sendMessage} aria-label="Enviar mensagem">
  <Textarea
    aria-label="Digite sua mensagem"
    aria-describedby="message-instructions"
  />
  <span id="message-instructions" className="sr-only">
    Pressione Enter para enviar ou Shift+Enter para nova linha
  </span>
  <Button type="submit" aria-label="Enviar mensagem">
    <Send aria-hidden="true" />
  </Button>
</form>
```

### Focus Management
- Auto-scroll to latest message when new message arrives
- Focus textarea after sending message
- Announce new messages to screen readers via `aria-live="polite"`

---

## Performance Optimizations

### Virtual Scrolling (>100 messages)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // Average message height
  overscan: 5,
})

<div ref={parentRef} className="flex-1 overflow-auto">
  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
    {virtualizer.getVirtualItems().map((virtualItem) => {
      const message = messages[virtualItem.index]
      return (
        <div
          key={message.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          <MessageComponent message={message} />
        </div>
      )
    })}
  </div>
</div>
```

### Memoization
```typescript
const MessageComponent = React.memo(({ message }: { message: Message }) => {
  // Prevent re-renders when message content doesn't change
  return <div>{/* ... */}</div>
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content
})
```

---

## Visual Specifications

### Colors
- Primary (Send button, links): `#0ea5e9`
- AI Avatar Gradient: `linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)`
- User Message Bubble: `#0ea5e9`
- Assistant Message Bubble: `#f5f5f5` (neutral-100)
- Typing Indicator Dots: `#737373` (neutral-500)

### Typography
- Message Content: `text-sm leading-relaxed` (14px, line-height 1.75)
- Timestamp: `text-xs text-neutral-500` (12px)
- Sidebar Session Title: `text-sm font-medium` (14px, 500)

### Spacing
- Message Bubble: `px-4 py-3` (16px horizontal, 12px vertical)
- Messages Gap: `space-y-6` (24px)
- Sidebar Session Gap: `space-y-1` (4px)

---

**Status**: 🔥 CRITICAL - Core Phase 1 feature
**File**: `07_oracles_chat_ia_assistant.md`
**Last Updated**: 2025-12-28

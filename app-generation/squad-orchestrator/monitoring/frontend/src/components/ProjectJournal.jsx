import { useState, useEffect } from 'react'

/**
 * ProjectJournal Component
 *
 * Displays a chronological log of important project events:
 * - Project start/stop
 * - Phase transitions (Discovery → Architecture → Data → Backend → Frontend → QA → Deploy)
 * - Milestone completions
 * - Card state transitions (TODO → IN_PROGRESS → IN_REVIEW → DONE)
 * - Agent activity (agent started working on card, agent completed card)
 * - Blockers and escalations
 * - QA approvals/rejections
 * - Deployment events
 */
function ProjectJournal() {
  const [journalEntries, setJournalEntries] = useState([])
  const [filter, setFilter] = useState('all') // all, milestones, cards, agents, blockers
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchJournal()
    const interval = setInterval(fetchJournal, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const fetchJournal = async () => {
    try {
      const response = await fetch('/api/journal?limit=100')
      const data = await response.json()
      setJournalEntries(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching journal:', error)
      setIsLoading(false)
    }
  }

  const filteredEntries = journalEntries.filter(entry => {
    if (filter === 'all') return true
    return entry.category === filter
  })

  const getCategoryIcon = (category) => {
    const icons = {
      'project': '🚀',
      'milestone': '🎯',
      'card': '📋',
      'agent': '🤖',
      'blocker': '🚧',
      'approval': '✅',
      'deployment': '🚢',
      'error': '❌'
    }
    return icons[category] || '📝'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'project': 'text-blue-400',
      'milestone': 'text-purple-400',
      'card': 'text-green-400',
      'agent': 'text-cyan-400',
      'blocker': 'text-red-400',
      'approval': 'text-emerald-400',
      'deployment': 'text-indigo-400',
      'error': 'text-orange-400'
    }
    return colors[category] || 'text-slate-400'
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'agora mesmo'
    if (diffMins < 60) return `há ${diffMins} min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `há ${diffDays} dias`

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              📖 Jornal do Projeto
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Registro cronológico de eventos importantes
            </p>
          </div>
          <button
            onClick={fetchJournal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'project', 'milestone', 'card', 'agent', 'blocker', 'approval', 'deployment'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {getCategoryIcon(f)} {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-2">📭 Nenhum evento registrado ainda</p>
            <p className="text-sm">Aguardando início do projeto...</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <JournalEntry
              key={entry.id || index}
              entry={entry}
              icon={getCategoryIcon(entry.category)}
              colorClass={getCategoryColor(entry.category)}
              timestamp={formatTimestamp(entry.timestamp)}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      {journalEntries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatCard
              label="Total de Eventos"
              value={journalEntries.length}
              icon="📊"
            />
            <StatCard
              label="Cards Concluídos"
              value={journalEntries.filter(e => e.category === 'card' && e.event_type === 'card_completed').length}
              icon="✅"
            />
            <StatCard
              label="Milestones Alcançados"
              value={journalEntries.filter(e => e.category === 'milestone' && e.event_type === 'milestone_completed').length}
              icon="🎯"
            />
            <StatCard
              label="Bloqueios Ativos"
              value={journalEntries.filter(e => e.category === 'blocker' && e.event_type === 'card_blocked').length}
              icon="🚧"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function JournalEntry({ entry, icon, colorClass, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-semibold ${colorClass}`}>
                {entry.title}
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                {entry.description}
              </p>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {timestamp}
            </span>
          </div>

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isExpanded ? '▼ Ocultar detalhes' : '▶ Ver detalhes'}
              </button>

              {isExpanded && (
                <div className="mt-2 p-3 bg-slate-800/50 rounded text-xs space-y-1">
                  {Object.entries(entry.metadata).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-slate-400 font-medium">{key}:</span>
                      <span className="text-slate-300">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-blue-400">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

export default ProjectJournal

import { useState, useEffect } from 'react'

/**
 * SquadActivityFeed - Real-time activity feed for each squad
 *
 * Shows step-by-step what each squad is doing in real-time,
 * replacing static "Aguardando" with dynamic activity log.
 *
 * Activities are parsed from:
 * - Orchestrator logs (meta-orchestrator.log)
 * - Card events (card status changes, tool usage)
 * - Agent logs (from each executing agent)
 */
export default function SquadActivityFeed() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch activities on mount and every 2 seconds
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities/live')
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()
        setActivities(data.activities || [])
        setError(null)
      } catch (err) {
        console.error('[SquadActivityFeed] Error fetching activities:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 2000) // Poll every 2s

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-16 bg-slate-700 rounded mb-2"></div>
          <div className="h-16 bg-slate-700 rounded mb-2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-lg p-6 shadow-lg border border-red-700">
        <p className="text-red-400 text-sm">⚠️ Error loading activities: {error}</p>
      </div>
    )
  }

  // Group activities by squad
  const activitiesBySquad = activities.reduce((acc, activity) => {
    const squad = activity.squad || 'meta'
    if (!acc[squad]) acc[squad] = []
    acc[squad].push(activity)
    return acc
  }, {})

  const squadOrder = ['meta', 'produto', 'arquitetura', 'engenharia', 'qa', 'deploy']

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">🎬 Atividades em Tempo Real</h2>
        <p className="text-sm text-slate-400">
          Acompanhe passo-a-passo o que cada squad está fazendo agora
        </p>
      </div>

      {/* Activities by Squad */}
      <div className="space-y-4">
        {squadOrder.map(squadName => {
          const squadActivities = activitiesBySquad[squadName] || []
          if (squadActivities.length === 0) return null

          return (
            <SquadActivityCard
              key={squadName}
              squadName={squadName}
              activities={squadActivities}
            />
          )
        })}

        {/* No Activities */}
        {activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">🔍 Aguardando atividades...</p>
            <p className="text-slate-500 text-xs mt-2">
              As atividades aparecerão aqui quando o projeto começar a executar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SquadActivityCard({ squadName, activities }) {
  const squadInfo = getSquadInfo(squadName)

  // Show last 5 activities (most recent first)
  const recentActivities = activities.slice(0, 5)

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{squadInfo.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-100">{squadInfo.name}</h3>
          <p className="text-xs text-slate-400">{activities.length} atividades</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-2 pl-8 border-l-2 border-slate-600">
        {recentActivities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} isLatest={index === 0} />
        ))}
      </div>
    </div>
  )
}

function ActivityItem({ activity, isLatest }) {
  const activityTypeIcons = {
    'card_created': '📋',
    'card_started': '▶️',
    'card_completed': '✅',
    'file_read': '📖',
    'file_written': '📝',
    'tool_used': '🔧',
    'api_called': '🌐',
    'test_run': '🧪',
    'agent_thinking': '💭',
    'agent_error': '❌',
    'milestone_reached': '🎯'
  }

  const icon = activityTypeIcons[activity.type] || '•'

  return (
    <div className={`-ml-9 pl-1 ${isLatest ? 'text-blue-300' : 'text-slate-400'}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5">{icon}</span>
        <div className="flex-1">
          <p className={`text-sm ${isLatest ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
            {activity.message}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatTime(activity.timestamp)}
            {activity.agent && ` • ${activity.agent}`}
          </p>
        </div>
      </div>
    </div>
  )
}

function getSquadInfo(squadName) {
  const squadInfo = {
    'meta': {
      name: '🤖 Meta-Orchestrator',
      icon: '🤖'
    },
    'produto': {
      name: '📋 Squad Produto',
      icon: '📋'
    },
    'arquitetura': {
      name: '🏗️ Squad Arquitetura',
      icon: '🏗️'
    },
    'engenharia': {
      name: '⚙️ Squad Engenharia',
      icon: '⚙️'
    },
    'qa': {
      name: '🧪 Squad QA',
      icon: '🧪'
    },
    'deploy': {
      name: '🚀 Squad Deploy',
      icon: '🚀'
    }
  }

  return squadInfo[squadName] || { name: squadName, icon: '•' }
}

function formatTime(timestamp) {
  if (!timestamp) return 'agora'

  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = Math.floor((now - time) / 1000) // seconds

  if (diff < 10) return 'agora mesmo'
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
  return `${Math.floor(diff / 3600)}h atrás`
}

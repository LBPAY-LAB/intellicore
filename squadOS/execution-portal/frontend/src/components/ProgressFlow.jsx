import { useMemo } from 'react'

function ProgressFlow({ squads, cards, bootstrapStatus }) {
  // Calculate progress for each squad
  const squadProgress = useMemo(() => {
    const squadOrder = ['produto', 'arquitetura', 'engenharia', 'qa', 'deploy']

    return squadOrder.map(squadName => {
      const squad = squads?.find(s => s.name === squadName || s.name === `squad-${squadName}`)

      // Filter cards by squadName (from card.squad field)
      const squadCards = cards?.filter(c =>
        c.squad === squadName || c.current_squad === squadName || c.assigned_to_squad === squadName
      ) || []

      const cardsTotal = squadCards.length
      const cardsCompleted = squadCards.filter(c => c.status === 'DONE').length
      const cardsInProgress = squadCards.filter(c => c.status === 'IN_PROGRESS').length

      let status = 'pending'
      if (cardsCompleted === cardsTotal && cardsTotal > 0) status = 'completed'
      else if (cardsInProgress > 0 || squad?.active_agents > 0) status = 'in_progress'
      else if (cardsTotal > 0) status = 'pending'

      const progress = cardsTotal > 0 ? Math.round((cardsCompleted / cardsTotal) * 100) : 0

      return {
        name: squadName,
        displayName: getSquadDisplayName(squadName),
        status,
        cardsTotal,
        cardsCompleted,
        cardsInProgress,
        progress,
        activeAgents: squad?.active_agents || 0
      }
    })
  }, [squads, cards])

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (squadProgress.length === 0) return 0
    const totalProgress = squadProgress.reduce((sum, squad) => sum + squad.progress, 0)
    return Math.round(totalProgress / squadProgress.length)
  }, [squadProgress])

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Fluxo de Implementação</h2>
        <p className="text-sm text-slate-400">
          Acompanhe a progressão dos cards através das squads
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Progresso Geral</span>
          <span className="text-lg font-bold text-blue-400">{overallProgress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Squad Flow */}
      <div className="space-y-4">
        {squadProgress.map((squad, index) => (
          <div key={squad.name}>
            <SquadProgressCard squad={squad} />

            {/* Arrow between squads */}
            {index < squadProgress.length - 1 && (
              <div className="flex justify-center my-2">
                <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Concluído</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SquadProgressCard({ squad }) {
  const statusColors = {
    'pending': 'bg-slate-700 border-slate-600',
    'in_progress': 'bg-yellow-900/20 border-yellow-700',
    'completed': 'bg-green-900/20 border-green-700'
  }

  const statusDotColors = {
    'pending': 'bg-slate-600',
    'in_progress': 'bg-yellow-500',
    'completed': 'bg-green-500'
  }

  const statusLabels = {
    'pending': 'Aguardando',
    'in_progress': 'Em Progresso',
    'completed': 'Concluído'
  }

  return (
    <div className={`p-4 rounded-lg border ${statusColors[squad.status]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusDotColors[squad.status]} animate-pulse`}></div>
          <div>
            <h3 className="font-semibold text-slate-100">{squad.displayName}</h3>
            <p className="text-xs text-slate-400">{statusLabels[squad.status]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-400">{squad.progress}%</p>
          <p className="text-xs text-slate-500">
            {squad.cardsCompleted}/{squad.cardsTotal} cards
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            squad.status === 'completed' ? 'bg-green-500' :
            squad.status === 'in_progress' ? 'bg-yellow-500' :
            'bg-slate-600'
          }`}
          style={{ width: `${squad.progress}%` }}
        />
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {squad.cardsInProgress > 0 && `${squad.cardsInProgress} em progresso`}
        </span>
        <span>
          {squad.activeAgents > 0 && `${squad.activeAgents} agentes ativos`}
        </span>
      </div>
    </div>
  )
}

function getSquadDisplayName(name) {
  const names = {
    'produto': '📋 Squad Produto',
    'arquitetura': '🏗️ Squad Arquitetura',
    'engenharia': '⚙️ Squad Engenharia',
    'qa': '🧪 Squad QA',
    'deploy': '🚀 Squad Deploy'
  }
  return names[name] || name
}

export default ProgressFlow

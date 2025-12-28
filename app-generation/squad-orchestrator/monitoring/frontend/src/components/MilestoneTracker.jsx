import { useMemo } from 'react'

function MilestoneTracker({ bootstrapStatus }) {
  const { overall_progress = 0, current_milestone, all_milestones = [] } = bootstrapStatus || {}

  // Calculate milestone states
  const milestoneStates = useMemo(() => {
    if (!all_milestones || all_milestones.length === 0) return []

    return all_milestones.map(milestone => {
      const [start, end] = milestone.progress_range
      let state = 'pending'

      if (overall_progress >= end) {
        state = 'completed'
      } else if (overall_progress >= start) {
        state = 'in_progress'
      }

      const isCurrent = current_milestone?.phase === milestone.phase

      return {
        ...milestone,
        state,
        isCurrent
      }
    })
  }, [all_milestones, overall_progress, current_milestone])

  if (!all_milestones || all_milestones.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Milestones do Projeto</h2>
        <p className="text-sm text-slate-400">
          Acompanhe as fases de implementação do SuperCore v2.0
        </p>
      </div>

      {/* Current Milestone Highlight */}
      {current_milestone && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-300">
                Fase {current_milestone.phase}: {current_milestone.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{current_milestone.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">{current_milestone.phase_progress}%</p>
              <p className="text-xs text-slate-500">progresso na fase</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${current_milestone.phase_progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      <div className="space-y-4">
        {milestoneStates.map((milestone, index) => (
          <MilestoneCard
            key={milestone.phase}
            milestone={milestone}
            isLast={index === milestoneStates.length - 1}
            overallProgress={overall_progress}
          />
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Progresso Total do Projeto</span>
          <span className="text-lg font-bold text-blue-400">{overall_progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${overall_progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>0%</span>
          <span>Discovery</span>
          <span>Architecture</span>
          <span>Data Layer</span>
          <span>Backend</span>
          <span>Frontend</span>
          <span>QA</span>
          <span>Deploy</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

function MilestoneCard({ milestone, isLast, overallProgress }) {
  const stateConfig = {
    'completed': {
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700',
      dotColor: 'bg-green-500',
      textColor: 'text-green-300',
      icon: '✓'
    },
    'in_progress': {
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-300',
      icon: '▶'
    },
    'pending': {
      bgColor: 'bg-slate-700/20',
      borderColor: 'border-slate-600',
      dotColor: 'bg-slate-600',
      textColor: 'text-slate-400',
      icon: '○'
    }
  }

  const config = stateConfig[milestone.state]
  const [start, end] = milestone.progress_range

  // Calculate progress within this milestone
  let progressInMilestone = 0
  if (overallProgress >= end) {
    progressInMilestone = 100
  } else if (overallProgress >= start) {
    const range = end - start
    const progressInRange = overallProgress - start
    progressInMilestone = (progressInRange / range) * 100
  }

  return (
    <div className="relative">
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${milestone.isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-8 h-8 rounded-full ${config.dotColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {config.icon === '✓' || config.icon === '○' ? config.icon : milestone.phase}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${config.textColor}`}>
                Fase {milestone.phase}: {milestone.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>

              {/* Squads */}
              <div className="flex flex-wrap gap-2 mt-2">
                {milestone.squads?.map(squad => (
                  <span key={squad} className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                    {getSquadDisplayName(squad)}
                  </span>
                ))}
                {milestone.sub_squads?.map(subSquad => (
                  <span key={subSquad} className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                    {subSquad}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-blue-400">{Math.round(progressInMilestone)}%</p>
            <p className="text-xs text-slate-500">{start}-{end}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 ${
              milestone.state === 'completed' ? 'bg-green-500' :
              milestone.state === 'in_progress' ? 'bg-blue-500' :
              'bg-slate-600'
            }`}
            style={{ width: `${progressInMilestone}%` }}
          />
        </div>

        {/* Deliverables */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 mb-2">Entregas:</p>
          {milestone.deliverables?.map((deliverable, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
              <span className={milestone.state === 'completed' ? 'text-green-500' : 'text-slate-600'}>
                {milestone.state === 'completed' ? '✓' : '○'}
              </span>
              <span>{deliverable}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="flex justify-center my-2">
          <div className={`w-0.5 h-6 ${milestone.state === 'completed' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
        </div>
      )}
    </div>
  )
}

function getSquadDisplayName(name) {
  const names = {
    'produto': 'Produto',
    'arquitetura': 'Arquitetura',
    'engenharia': 'Engenharia',
    'qa': 'QA',
    'deploy': 'Deploy'
  }
  return names[name] || name
}

export default MilestoneTracker

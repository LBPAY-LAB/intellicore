import { getSquadIcon, getStatusColor, getStatusIcon } from '../utils/formatters'

export default function SquadCard({ squad }) {
  const {
    squad_id,
    status,
    current_card,
    cards_total,
    cards_done,
    cards_in_progress,
    cards_blocked,
    agent_current,
    health
  } = squad

  const progress = cards_total > 0 ? (cards_done / cards_total) * 100 : 0
  const statusColor = getStatusColor(status)
  const statusIcon = getStatusIcon(status)
  const squadIcon = getSquadIcon(squad_id)

  return (
    <div className="bg-slate-800 rounded-lg p-5 shadow-lg border border-slate-700 hover:border-slate-600 transition-all animate-slide-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{squadIcon}</span>
          <h3 className="font-semibold text-slate-200 text-sm">
            {squad_id.replace('squad-', '').replace(/-/g, ' ').toUpperCase()}
          </h3>
        </div>
        <StatusBadge status={status} icon={statusIcon} color={statusColor} />
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Cards: {cards_done}/{cards_total}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card Status Breakdown */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-blue-400">⏳</span>
            <span className="text-slate-400">{cards_in_progress} in progress</span>
          </div>
          {cards_blocked > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">🚧</span>
              <span className="text-yellow-400 font-medium">{cards_blocked} blocked</span>
            </div>
          )}
        </div>

        {/* Current Card */}
        {current_card && (
          <div className="bg-slate-700/50 rounded p-2 text-xs">
            <div className="text-slate-400 mb-1">Current Card:</div>
            <div className="text-slate-200 font-mono">{current_card}</div>
          </div>
        )}

        {/* Current Agent */}
        {agent_current && (
          <div className="text-xs text-slate-400">
            <span className="mr-1">🤖</span>
            {agent_current.replace(/-/g, ' ')}
          </div>
        )}

        {/* Health Indicator */}
        {health !== 'healthy' && (
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-400">Health: {health}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status, icon, color }) {
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <span>{icon}</span>
      <span>{status}</span>
    </div>
  )
}

export default function MetricsPanel({ metrics }) {
  if (!metrics) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Metrics
        </h2>
        <p className="text-slate-400 text-center py-8">No metrics available</p>
      </div>
    )
  }

  const {
    velocity_per_day,
    qa_rejection_rate,
    average_coverage,
    cards_completed_today,
    active_squads,
    total_events
  } = metrics

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center">
          <span className="mr-2">📊</span>
          Metrics Summary
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <MetricRow
          label="Velocity"
          value={`${velocity_per_day.toFixed(1)} pts/day`}
          icon="📈"
          color="text-blue-400"
        />

        <MetricRow
          label="QA Rejection Rate"
          value={`${qa_rejection_rate.toFixed(1)}%`}
          icon="❌"
          color={qa_rejection_rate > 20 ? 'text-yellow-400' : 'text-green-400'}
          progress={qa_rejection_rate}
          progressColor={qa_rejection_rate > 20 ? 'bg-yellow-500' : 'bg-green-500'}
        />

        <MetricRow
          label="Test Coverage"
          value={`${average_coverage.toFixed(0)}%`}
          icon="🧪"
          color={average_coverage >= 80 ? 'text-green-400' : 'text-yellow-400'}
          progress={average_coverage}
          progressColor={average_coverage >= 80 ? 'bg-green-500' : 'bg-yellow-500'}
        />

        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Completed Today"
              value={cards_completed_today}
              icon="✅"
            />
            <StatBox
              label="Active Squads"
              value={active_squads}
              icon="👥"
            />
            <StatBox
              label="Total Events"
              value={total_events}
              icon="📝"
            />
            <StatBox
              label="Status"
              value="Healthy"
              icon="💚"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, icon, color, progress, progressColor }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm text-slate-400">{label}</span>
        </div>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
      </div>

      {progress !== undefined && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-200">{value}</div>
    </div>
  )
}

export default function OverviewBar({ sessionData, metrics }) {
  const progress = sessionData?.overall_progress || 0

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Overall Progress</h2>
        <span className="text-2xl font-bold text-blue-400">{progress.toFixed(1)}%</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {progress > 10 && (
            <span className="text-xs font-bold text-white">{progress.toFixed(0)}%</span>
          )}
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <MetricCard
            label="Velocity"
            value={`${metrics.velocity_per_day.toFixed(1)} pts/day`}
            icon="📈"
          />
          <MetricCard
            label="QA Rejection"
            value={`${metrics.qa_rejection_rate.toFixed(1)}%`}
            icon="❌"
            warning={metrics.qa_rejection_rate > 20}
          />
          <MetricCard
            label="Coverage"
            value={`${metrics.average_coverage.toFixed(0)}%`}
            icon="🧪"
            success={metrics.average_coverage >= 80}
          />
          <MetricCard
            label="Today"
            value={`${metrics.cards_completed_today} cards`}
            icon="✅"
          />
          <MetricCard
            label="Active Squads"
            value={metrics.active_squads}
            icon="👥"
          />
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, success, warning }) {
  let textColor = 'text-slate-200'
  if (success) textColor = 'text-green-400'
  if (warning) textColor = 'text-yellow-400'

  return (
    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-sm font-bold ${textColor}`}>{value}</div>
    </div>
  )
}

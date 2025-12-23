import { useState, useEffect } from 'react'

/**
 * DualProgressBar - Shows two-level progress tracking
 *
 * Planning Progress: How many cards have been created (meta-orchestrator)
 * Execution Progress: How many cards have been executed (Celery workers)
 * Overall Progress: Cards finalized vs total estimated
 */
export default function DualProgressBar() {
  const [dualProgress, setDualProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dual progress on mount and every 5 seconds
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/progress/dual')
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()
        setDualProgress(data)
        setError(null)
      } catch (err) {
        console.error('[DualProgressBar] Error fetching progress:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-lg p-6 shadow-lg border border-red-700">
        <p className="text-red-400 text-sm">⚠️ Error loading progress: {error}</p>
      </div>
    )
  }

  if (!dualProgress) {
    return null
  }

  const { planning, execution, overall } = dualProgress

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-200">Progresso do Projeto</h2>
          <span className="text-2xl font-bold text-blue-400">{overall.progress_percentage.toFixed(1)}%</span>
        </div>
        <p className="text-xs text-slate-400">
          {overall.cards_finalized} de {overall.cards_total_estimated} cards finalizadas
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${Math.min(overall.progress_percentage, 100)}%` }}
          >
            {overall.progress_percentage > 10 && (
              <span className="text-xs font-bold text-white">{overall.progress_percentage.toFixed(0)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Two-Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planning Progress */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-200">Planejamento</h3>
              <p className="text-xs text-slate-400">Cards criadas pelo orchestrator</p>
            </div>
            <span className="text-lg font-bold text-emerald-400">{planning.progress_percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(planning.progress_percentage, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>{planning.cards_created} criadas</span>
            <span>{planning.cards_planned} planejadas</span>
          </div>
        </div>

        {/* Execution Progress */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-200">Execução</h3>
              <p className="text-xs text-slate-400">Cards executadas pelos workers</p>
            </div>
            <span className="text-lg font-bold text-purple-400">{execution.progress_percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(execution.progress_percentage, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{execution.cards_done} concluídas</span>
            <span>{execution.total_cards} criadas</span>
          </div>

          {/* Status breakdown */}
          <div className="flex gap-2 text-xs">
            <span className="text-green-400">✅ {execution.cards_done} DONE</span>
            <span className="text-yellow-400">🔄 {execution.cards_in_progress} IN_PROGRESS</span>
            <span className="text-slate-400">📝 {execution.cards_todo} TODO</span>
          </div>
        </div>
      </div>

      {/* Insight Message */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
        <p className="text-xs text-blue-300">
          <span className="font-semibold">💡 Diferença:</span> O orchestrator planeja ({planning.cards_created} cards criadas),
          enquanto os workers executam ({execution.cards_done} cards concluídas).
          {planning.cards_created > execution.cards_done && (
            <span className="text-yellow-400"> {planning.cards_created - execution.cards_done} cards aguardando execução.</span>
          )}
        </p>
      </div>
    </div>
  )
}

import { formatDuration } from '../utils/formatters'

export default function Header({ sessionId, connected, uptime, projectName, solutionStats }) {
  const openSuperCore = () => {
    // Determine URL based on what's running
    let url = null

    if (solutionStats?.frontend_build?.is_running) {
      url = solutionStats.frontend_build.url
    } else if (solutionStats?.backend_build?.is_running) {
      url = solutionStats.backend_build.url
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getSolutionButtonConfig = () => {
    if (!solutionStats) {
      return { show: false }
    }

    const frontendRunning = solutionStats.frontend_build?.is_running
    const backendRunning = solutionStats.backend_build?.is_running
    const isExecutable = solutionStats.is_executable

    if (frontendRunning || backendRunning) {
      return {
        show: true,
        icon: '🟢',
        label: 'Abrir SuperCore',
        color: 'bg-emerald-600 hover:bg-emerald-700',
        clickable: true
      }
    } else if (isExecutable) {
      return {
        show: true,
        icon: '✅',
        label: 'Pronto (Iniciar)',
        color: 'bg-blue-600 hover:bg-blue-700',
        clickable: false
      }
    } else if (solutionStats.total_files > 0) {
      return {
        show: true,
        icon: '⚙️',
        label: 'Buildando...',
        color: 'bg-slate-600 cursor-not-allowed',
        clickable: false
      }
    }

    return { show: false }
  }

  const buttonConfig = getSolutionButtonConfig()

  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SquadOS
              </h1>
              <p className="text-xs text-slate-400 -mt-1">
                Where Documentation Becomes Software, Autonomously
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Open SuperCore Button */}
            {buttonConfig.show && (
              <button
                onClick={buttonConfig.clickable ? openSuperCore : undefined}
                disabled={!buttonConfig.clickable}
                className={`px-4 py-2 ${buttonConfig.color} text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg`}
                title={buttonConfig.clickable ? 'Abrir solução em nova aba' : 'Solução ainda não está rodando'}
              >
                <span>{buttonConfig.icon}</span>
                <span>{buttonConfig.label}</span>
              </button>
            )}

            {sessionId && (
              <div className="text-sm">
                <span className="text-slate-400">Session:</span>
                <span className="ml-2 text-slate-200 font-mono">{sessionId}</span>
              </div>
            )}

            {uptime !== undefined && (
              <div className="text-sm">
                <span className="text-slate-400">Uptime:</span>
                <span className="ml-2 text-slate-200 font-mono">{formatDuration(uptime)}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-400">
                {connected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

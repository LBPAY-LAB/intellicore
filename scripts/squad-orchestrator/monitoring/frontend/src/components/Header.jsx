import { formatDuration } from '../utils/formatters'

export default function Header({ sessionId, connected, uptime }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              SuperCore v2.0
            </h1>
            <span className="text-slate-400 text-sm">Squad Monitoring Dashboard</span>
          </div>

          <div className="flex items-center space-x-6">
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

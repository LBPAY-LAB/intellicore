import { useState, useEffect } from 'react'

/**
 * SolutionExplorer - Visualiza a solução sendo gerada em app-solution/
 *
 * Features:
 * - File tree navegável (backend/, frontend/, infrastructure/)
 * - Estatísticas de código (LOC, arquivos, linguagens)
 * - Arquivos recentemente modificados
 * - Build status e health checks
 * - Botão para abrir a solução (quando disponível)
 */
function SolutionExplorer() {
  const [solutionStats, setSolutionStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview') // overview, files, builds

  useEffect(() => {
    fetchSolutionStats()
    const interval = setInterval(fetchSolutionStats, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchSolutionStats = async () => {
    try {
      const response = await fetch('/api/solution/stats')
      const data = await response.json()
      setSolutionStats(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching solution stats:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Analisando solução gerada...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!solutionStats || solutionStats.total_files === 0) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Nenhuma solução gerada ainda</h3>
          <p className="text-slate-400 text-sm">
            A solução aparecerá aqui assim que as squads começarem a criar código em <code className="bg-slate-900 px-2 py-1 rounded">app-solution/</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with View Selector */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              📦 Solução Gerada
              {solutionStats.is_executable && (
                <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                  ✅ Executável
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Código e artefatos criados pelas squads em <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs">app-solution/</code>
            </p>
          </div>

          {/* View Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📊 Visão Geral
            </button>
            <button
              onClick={() => setSelectedView('files')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedView === 'files'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📁 Arquivos
            </button>
            <button
              onClick={() => setSelectedView('builds')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedView === 'builds'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🔨 Builds
            </button>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="📄"
              label="Total de Arquivos"
              value={solutionStats.total_files}
              color="blue"
            />
            <StatCard
              icon="💻"
              label="Linhas de Código"
              value={solutionStats.total_lines?.toLocaleString() || '0'}
              color="emerald"
            />
            <StatCard
              icon="🗂️"
              label="Diretórios"
              value={solutionStats.total_directories || 0}
              color="purple"
            />
            <StatCard
              icon="🔄"
              label="Modificados Hoje"
              value={solutionStats.files_modified_today || 0}
              color="amber"
            />
          </div>

          {/* Languages Breakdown */}
          {solutionStats.languages && Object.keys(solutionStats.languages).length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🔤 Linguagens de Programação</h3>
              <div className="space-y-2">
                {Object.entries(solutionStats.languages)
                  .sort((a, b) => b[1].lines - a[1].lines)
                  .map(([lang, data]) => (
                    <div key={lang}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{lang}</span>
                        <span className="text-xs text-slate-400">
                          {data.files} arquivos · {data.lines.toLocaleString()} linhas
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(data.lines / solutionStats.total_lines) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Files */}
          {solutionStats.recent_files && solutionStats.recent_files.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">📝 Arquivos Recentes</h3>
              <div className="space-y-2">
                {solutionStats.recent_files.slice(0, 10).map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{getFileIcon(file.path)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-200 font-mono truncate">{file.path}</div>
                        <div className="text-xs text-slate-400">
                          {file.lines} linhas · Modificado {formatRelativeTime(file.modified_at)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      file.status === 'created' ? 'bg-emerald-900 text-emerald-200' :
                      file.status === 'modified' ? 'bg-blue-900 text-blue-200' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {file.status === 'created' ? '✨ Novo' : '✏️ Modificado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Files View */}
      {selectedView === 'files' && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">📁 Estrutura de Diretórios</h3>
          {solutionStats.directory_tree ? (
            <FileTree tree={solutionStats.directory_tree} />
          ) : (
            <p className="text-slate-400 text-sm">Árvore de arquivos não disponível</p>
          )}
        </div>
      )}

      {/* Builds View */}
      {selectedView === 'builds' && (
        <div className="space-y-4">
          {/* Backend Build Status */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-3">🔨 Backend Build</h3>
            <BuildStatus buildInfo={solutionStats.backend_build} />
          </div>

          {/* Frontend Build Status */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-3">🔨 Frontend Build</h3>
            <BuildStatus buildInfo={solutionStats.frontend_build} />
          </div>

          {/* Infrastructure Status */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-3">🏗️ Infrastructure</h3>
            <BuildStatus buildInfo={solutionStats.infrastructure_status} />
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components

function StatCard({ icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-900/30 to-blue-800/20 border-blue-700/50',
    emerald: 'from-emerald-900/30 to-emerald-800/20 border-emerald-700/50',
    purple: 'from-purple-900/30 to-purple-800/20 border-purple-700/50',
    amber: 'from-amber-900/30 to-amber-800/20 border-amber-700/50'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-slate-100">{value}</div>
          <div className="text-xs text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  )
}

function FileTree({ tree }) {
  if (!tree || Object.keys(tree).length === 0) {
    return <p className="text-slate-400 text-sm">Nenhum arquivo encontrado</p>
  }

  return (
    <div className="font-mono text-sm space-y-1">
      {Object.entries(tree).map(([name, node]) => (
        <FileTreeNode key={name} name={name} node={node} level={0} />
      ))}
    </div>
  )
}

function FileTreeNode({ name, node, level }) {
  const [isOpen, setIsOpen] = useState(level === 0)

  if (typeof node === 'object' && !Array.isArray(node)) {
    // Directory
    return (
      <div>
        <div
          className="flex items-center gap-2 py-1 hover:bg-slate-700/50 cursor-pointer rounded px-2"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{isOpen ? '📂' : '📁'}</span>
          <span className="text-slate-300 font-semibold">{name}/</span>
        </div>
        {isOpen && (
          <div>
            {Object.entries(node).map(([childName, childNode]) => (
              <FileTreeNode key={childName} name={childName} node={childNode} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  } else {
    // File
    return (
      <div
        className="flex items-center gap-2 py-1 hover:bg-slate-700/50 rounded px-2"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span>{getFileIcon(name)}</span>
        <span className="text-slate-400">{name}</span>
      </div>
    )
  }
}

function BuildStatus({ buildInfo }) {
  if (!buildInfo) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-400 text-sm">Informações de build não disponíveis</p>
      </div>
    )
  }

  const statusConfig = {
    success: { icon: '✅', color: 'emerald', label: 'Build Sucesso' },
    failed: { icon: '❌', color: 'red', label: 'Build Falhou' },
    building: { icon: '⚙️', color: 'blue', label: 'Buildando...' },
    pending: { icon: '⏳', color: 'amber', label: 'Pendente' },
    not_started: { icon: '⚪', color: 'slate', label: 'Não Iniciado' }
  }

  const config = statusConfig[buildInfo.status] || statusConfig.not_started

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className={`text-${config.color}-400 font-semibold`}>{config.label}</span>
        </div>
        {buildInfo.last_build_at && (
          <span className="text-xs text-slate-400">
            Último build: {formatRelativeTime(buildInfo.last_build_at)}
          </span>
        )}
      </div>

      {buildInfo.errors && buildInfo.errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-300 mb-2">⚠️ Erros ({buildInfo.errors.length})</h4>
          <div className="space-y-1">
            {buildInfo.errors.slice(0, 5).map((error, idx) => (
              <div key={idx} className="text-xs text-red-200 font-mono">{error}</div>
            ))}
            {buildInfo.errors.length > 5 && (
              <div className="text-xs text-red-300">... e mais {buildInfo.errors.length - 5} erros</div>
            )}
          </div>
        </div>
      )}

      {buildInfo.is_running && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-200">🔄 Aplicação rodando em: <a href={buildInfo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{buildInfo.url}</a></p>
        </div>
      )}
    </div>
  )
}

// Helper Functions

function getFileIcon(path) {
  const ext = path.split('.').pop()
  const iconMap = {
    'js': '📜', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
    'py': '🐍', 'go': '🐹',
    'json': '📋', 'yaml': '⚙️', 'yml': '⚙️',
    'md': '📝', 'txt': '📄',
    'sql': '🗄️',
    'css': '🎨', 'scss': '🎨',
    'html': '🌐',
    'sh': '🔧', 'bash': '🔧',
    'tf': '🏗️',
    'docker': '🐳', 'dockerfile': '🐳'
  }
  return iconMap[ext?.toLowerCase()] || '📄'
}

function formatRelativeTime(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `há ${diffMins}min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 7) return `há ${diffDays}d`
  return date.toLocaleDateString('pt-BR')
}

export default SolutionExplorer

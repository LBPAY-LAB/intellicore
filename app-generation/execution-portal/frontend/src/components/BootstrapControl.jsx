import { useState, useEffect } from 'react'
import { PlayIcon, StopIcon, PauseIcon } from './Icons'

function BootstrapControl({ bootstrapStatus, onStart, onStop, onResume }) {
  const [isStarting, setIsStarting] = useState(false)
  const [lastCheckpoint, setLastCheckpoint] = useState(null)
  const [isLoadingCheckpoint, setIsLoadingCheckpoint] = useState(true)
  const [projectData, setProjectData] = useState(null)
  const [isPlanningSquads, setIsPlanningSquads] = useState(false)
  const [planningStep, setPlanningStep] = useState('')
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false)

  // Fetch project data and last checkpoint on mount
  useEffect(() => {
    initializeProject()
  }, [])

  const initializeProject = async () => {
    try {
      // Step 1: Fetch project data
      await fetchProjectData()

      // Step 2: Fetch last checkpoint
      await fetchLastCheckpoint()

      // Step 3: Run Squad Planner (analyze docs + allocate agents)
      await runSquadPlanner()

      // Setup complete!
      setIsInitialSetupComplete(true)
    } catch (error) {
      console.error('[BootstrapControl] Error during initialization:', error)
      setIsInitialSetupComplete(true) // Show UI anyway
    }
  }

  const runSquadPlanner = async () => {
    setIsPlanningSquads(true)

    try {
      // Step 1: Analyzing documentation
      setPlanningStep('Analisando a documentação base do projeto...')
      await new Promise(resolve => setTimeout(resolve, 800)) // Visual feedback

      // Execute Squad Planner
      const response = await fetch('/api/squads/structure/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        console.warn('[BootstrapControl] Squad Planner failed, using static config')
      }

      // Step 2: Allocating agents
      setPlanningStep('Alocando agentes às Squads...')
      await new Promise(resolve => setTimeout(resolve, 600))

      // Step 3: Preparing project
      setPlanningStep('Preparando o projeto para ser iniciado...')
      await new Promise(resolve => setTimeout(resolve, 400))

      console.log('[BootstrapControl] Squad Planner completed successfully')
    } catch (error) {
      console.error('[BootstrapControl] Error running Squad Planner:', error)
      // Continue anyway - will use static config as fallback
    } finally {
      setIsPlanningSquads(false)
      setPlanningStep('')
    }
  }

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/project/data')
      if (response.ok) {
        const data = await response.json()
        setProjectData(data)
        console.log('[BootstrapControl] Project data loaded:', data)
      }
    } catch (error) {
      console.error('[BootstrapControl] Error fetching project data:', error)
    }
  }

  const fetchLastCheckpoint = async () => {
    try {
      console.log('[BootstrapControl] Fetching last checkpoint...')
      const response = await fetch('/api/checkpoints/last')
      console.log('[BootstrapControl] Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('[BootstrapControl] Checkpoint data:', data)
        setLastCheckpoint(data)
      } else {
        console.log('[BootstrapControl] No checkpoint found (404)')
      }
    } catch (error) {
      console.error('[BootstrapControl] Error fetching last checkpoint:', error)
    } finally {
      setIsLoadingCheckpoint(false)
      console.log('[BootstrapControl] Loading finished. hasCheckpoint:', !!lastCheckpoint)
    }
  }

  // Start immediately with values from app-data.md (100% autonomous - no user input required)
  const handleStartImmediate = async () => {
    setIsStarting(true)
    try {
      // Start bootstrap with values from app-data.md
      await onStart({
        project_name: projectData?.project_name || 'SuperCore v2.0',
        config_file: projectData?.config_file || 'meta-squad-config.json'
      })
      // Clear checkpoint after successful start
      setLastCheckpoint(null)
    } catch (error) {
      console.error('Error starting bootstrap:', error)
      alert('Erro ao iniciar bootstrap: ' + error.message)
    } finally {
      setIsStarting(false)
    }
  }

  const handleResumeFromCheckpoint = async () => {
    setIsStarting(true)
    try {
      await onResume({})  // Empty object = resume from last checkpoint
      // Refetch checkpoint status
      await fetchLastCheckpoint()
    } catch (error) {
      console.error('Error resuming from checkpoint:', error)
      alert('Erro ao retomar do checkpoint: ' + error.message)
    } finally {
      setIsStarting(false)
    }
  }

  const handlePauseProject = async () => {
    const projectName = projectData?.project_name || 'Projeto'
    const confirmed = window.confirm(
      `Deseja pausar o projeto "${projectName}"?\n\n` +
      `O estado atual será salvo como checkpoint e você poderá retomar mais tarde.`
    )

    if (!confirmed) return

    try {
      const response = await fetch('/api/execution/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao pausar projeto')
      }

      // Refetch checkpoint after pause
      await fetchLastCheckpoint()
    } catch (error) {
      console.error('Error pausing project:', error)
      alert('Erro ao pausar projeto: ' + error.message)
    }
  }

  const handleStopProject = async () => {
    const projectName = projectData?.project_name || 'Projeto'
    const confirmed = window.confirm(
      `Deseja parar o projeto "${projectName}"?\n\n` +
      `⚠️ ATENÇÃO: Todos os dados serão limpos:\n` +
      `• Código gerado (app-solution/)\n` +
      `• Artefactos (app-artefacts/)\n` +
      `• Database (eventos, cards, checkpoints)\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    )

    if (!confirmed) return

    await onStop()
  }

  const isRunning = bootstrapStatus?.status === 'running' || bootstrapStatus?.status === 'starting'
  const isIdle = !bootstrapStatus || bootstrapStatus.status === 'idle' || bootstrapStatus.status === 'completed' || bootstrapStatus.status === 'error' || bootstrapStatus.status === 'stopped'
  const hasCheckpoint = lastCheckpoint && !isLoadingCheckpoint

  console.log('[BootstrapControl] Render - bootstrapStatus:', bootstrapStatus?.status)
  console.log('[BootstrapControl] Render - isIdle:', isIdle, 'hasCheckpoint:', hasCheckpoint)
  console.log('[BootstrapControl] Render - lastCheckpoint:', lastCheckpoint)

  // Show planning progress during initial setup
  if (isPlanningSquads && !isInitialSetupComplete) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-6">
            {/* Animated spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Preparando {projectData?.project_name || 'Projeto'}
          </h3>

          <p className="text-sm text-emerald-400 font-semibold mb-4 animate-pulse">
            {planningStep}
          </p>

          <div className="w-full max-w-md bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full animate-pulse"
                 style={{ width: '100%' }}></div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Analisando documentação e alocando agentes dinamicamente...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      {/* Project Info Banner */}
      {projectData && (
        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-300">
                📦 {projectData.project_name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {projectData.description} • v{projectData.version}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Controle de Bootstrap</h2>
          <p className="text-sm text-slate-400 mt-1">
            Inicie a implementação autônoma do projeto em background
          </p>
        </div>

        <div className="flex gap-3">
          {isIdle && hasCheckpoint && (
            <>
              <button
                onClick={handleResumeFromCheckpoint}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                disabled={isStarting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isStarting ? 'Retomando...' : 'Retomar do Último Checkpoint'}
              </button>
              <button
                onClick={handleStartImmediate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                disabled={isStarting}
              >
                <PlayIcon className="w-5 h-5" />
                {isStarting ? 'Iniciando...' : `Reiniciar "${projectData?.project_name || 'Projeto'}"`}
              </button>
            </>
          )}

          {isIdle && !hasCheckpoint && (
            <button
              onClick={handleStartImmediate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              disabled={isStarting}
            >
              <PlayIcon className="w-5 h-5" />
              {isStarting ? 'Iniciando...' : `Iniciar "${projectData?.project_name || 'Projeto'}"`}
            </button>
          )}

          {isRunning && (
            <>
              <button
                onClick={handlePauseProject}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                <PauseIcon className="w-5 h-5" />
                Pausar "{projectData?.project_name || 'Projeto'}"
              </button>
              <button
                onClick={handleStopProject}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                <StopIcon className="w-5 h-5" />
                Parar "{projectData?.project_name || 'Projeto'}"
              </button>
            </>
          )}
        </div>
      </div>

      {/* Checkpoint Info */}
      {isIdle && hasCheckpoint && (
        <div className="mt-4 p-4 bg-emerald-900/20 rounded-lg border border-emerald-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-emerald-300">Checkpoint Disponível</p>
              </div>
              <p className="text-xs text-slate-400 mb-1">
                <strong>Nome:</strong> {lastCheckpoint.checkpoint_name}
              </p>
              <p className="text-xs text-slate-400 mb-1">
                <strong>Squad Completada:</strong> {lastCheckpoint.squad_completed || 'N/A'}
              </p>
              <p className="text-xs text-slate-400 mb-1">
                <strong>Progresso:</strong> {lastCheckpoint.overall_progress?.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mb-1">
                <strong>Data:</strong> {new Date(lastCheckpoint.timestamp).toLocaleString('pt-BR')}
              </p>
              {lastCheckpoint.squads_completed_list && lastCheckpoint.squads_completed_list.length > 0 && (
                <p className="text-xs text-slate-400">
                  <strong>Squads Concluídas:</strong> {lastCheckpoint.squads_completed_list.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Display */}
      {bootstrapStatus && bootstrapStatus.status !== 'idle' && (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Status Atual</p>
              <p className="text-lg font-semibold text-slate-100 capitalize">
                {getStatusLabel(bootstrapStatus.status)}
              </p>
            </div>
            <div className="text-right">
              {bootstrapStatus.session_id && (
                <p className="text-xs text-slate-500">
                  Sessão: {bootstrapStatus.session_id}
                </p>
              )}
              {bootstrapStatus.pid && (
                <p className="text-xs text-slate-500">
                  PID: {bootstrapStatus.pid}
                </p>
              )}
            </div>
          </div>

          {bootstrapStatus.error_message && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
              <strong>Erro:</strong> {bootstrapStatus.error_message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getStatusLabel(status) {
  const labels = {
    'idle': 'Ocioso',
    'starting': 'Iniciando',
    'running': 'Em Execução',
    'completed': 'Concluído',
    'error': 'Erro',
    'stopped': 'Parado',
    'awaiting_approval': 'Aguardando Aprovação'
  }
  return labels[status] || status
}

export default BootstrapControl

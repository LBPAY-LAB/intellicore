import { useState, useEffect } from 'react'
import { PlayIcon, StopIcon } from './Icons'

function BootstrapControl({ bootstrapStatus, onStart, onStop, onResume }) {
  const [isStarting, setIsStarting] = useState(false)
  const [lastCheckpoint, setLastCheckpoint] = useState(null)
  const [isLoadingCheckpoint, setIsLoadingCheckpoint] = useState(true)

  // Fetch last checkpoint on mount
  useEffect(() => {
    fetchLastCheckpoint()
  }, [])

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

  // Start immediately with default values (100% autonomous - no user input required)
  const handleStartImmediate = async () => {
    setIsStarting(true)
    try {
      // Start bootstrap with default values
      await onStart({
        project_name: 'SuperCore v2.0',
        config_file: 'meta-squad-config.json'
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

  const isRunning = bootstrapStatus?.status === 'running' || bootstrapStatus?.status === 'starting'
  const isIdle = !bootstrapStatus || bootstrapStatus.status === 'idle' || bootstrapStatus.status === 'completed' || bootstrapStatus.status === 'error'
  const hasCheckpoint = lastCheckpoint && !isLoadingCheckpoint

  console.log('[BootstrapControl] Render - bootstrapStatus:', bootstrapStatus?.status)
  console.log('[BootstrapControl] Render - isIdle:', isIdle, 'hasCheckpoint:', hasCheckpoint)
  console.log('[BootstrapControl] Render - lastCheckpoint:', lastCheckpoint)

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
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
                {isStarting ? 'Iniciando...' : 'Reiniciar do Zero'}
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
              {isStarting ? 'Iniciando...' : 'Iniciar Projeto em Background'}
            </button>
          )}

          {isRunning && (
            <button
              onClick={onStop}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <StopIcon className="w-5 h-5" />
              Parar Execução
            </button>
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
    'awaiting_approval': 'Aguardando Aprovação'
  }
  return labels[status] || status
}

export default BootstrapControl

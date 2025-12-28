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
  const [backlogSummary, setBacklogSummary] = useState(null)
  const [isGeneratingBacklog, setIsGeneratingBacklog] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [projectAnalyzed, setProjectAnalyzed] = useState(false)
  const [servicesHealth, setServicesHealth] = useState({
    backend: false,
    celery: false,
    redis: false,
    checking: true,
    errors: [],
    lastCheck: null
  })
  const [serviceCriticalAlert, setServiceCriticalAlert] = useState(null)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [squadosInitialized, setSquadosInitialized] = useState(false)
  const [isInitializingSquados, setIsInitializingSquados] = useState(false)
  const [initializationResult, setInitializationResult] = useState(null)
  const [showInitializeConfirmModal, setShowInitializeConfirmModal] = useState(false)
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [showShutdownConfirmModal, setShowShutdownConfirmModal] = useState(false)

  // Fetch project data and last checkpoint on mount
  useEffect(() => {
    initializeProject()
  }, [])

  // Continuous monitoring when project is running
  useEffect(() => {
    const isRunning = bootstrapStatus?.status === 'running' || bootstrapStatus?.status === 'starting'

    if (!isRunning) {
      return // Don't monitor if not running
    }

    console.log('[BootstrapControl] Starting continuous service monitoring...')

    // Check services every 10 seconds
    const intervalId = setInterval(async () => {
      await checkServicesHealthSilent()
    }, 10000)

    return () => {
      console.log('[BootstrapControl] Stopping continuous service monitoring')
      clearInterval(intervalId)
    }
  }, [bootstrapStatus?.status])

  const initializeProject = async () => {
    try {
      // Check services health first
      await checkServicesHealth()

      // Only fetch project data on load - no analysis yet
      await fetchProjectData()
      await fetchLastCheckpoint()

      // Setup complete! Show "Analisar Projeto" button
      setIsInitialSetupComplete(true)
    } catch (error) {
      console.error('[BootstrapControl] Error during initialization:', error)
      setIsInitialSetupComplete(true) // Show UI anyway
    }
  }

  const checkServicesHealth = async () => {
    console.log('[BootstrapControl] Checking services health...')
    const errors = []
    let backendHealthy = false
    let celeryHealthy = false
    let redisHealthy = false

    try {
      // Check backend API
      const backendResponse = await fetch('/api/status', {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3s timeout
      })
      backendHealthy = backendResponse.ok
      if (!backendHealthy) {
        errors.push('Backend API não está respondendo (porta 3000)')
      }
    } catch (error) {
      errors.push('Backend API offline ou inacessível')
      console.error('[BootstrapControl] Backend health check failed:', error)
    }

    try {
      // Check Celery worker via health endpoint
      const celeryResponse = await fetch('/api/health/celery', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })

      if (celeryResponse.ok) {
        const data = await celeryResponse.json()
        celeryHealthy = data.celery_worker === 'healthy'
        if (!celeryHealthy) {
          errors.push('Celery Worker não está rodando')
        }
      } else {
        errors.push('Não foi possível verificar status do Celery Worker')
      }
    } catch (error) {
      errors.push('Celery Worker offline ou inacessível')
      console.error('[BootstrapControl] Celery health check failed:', error)
    }

    try {
      // Check Redis via health endpoint
      const redisResponse = await fetch('/api/health/redis', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })

      if (redisResponse.ok) {
        const data = await redisResponse.json()
        redisHealthy = data.redis === 'healthy'
        if (!redisHealthy) {
          errors.push('Redis não está respondendo (porta 6379)')
        }
      } else {
        errors.push('Não foi possível verificar status do Redis')
      }
    } catch (error) {
      errors.push('Redis offline ou inacessível')
      console.error('[BootstrapControl] Redis health check failed:', error)
    }

    setServicesHealth({
      backend: backendHealthy,
      celery: celeryHealthy,
      redis: redisHealthy,
      checking: false,
      errors,
      lastCheck: new Date().toISOString()
    })

    console.log('[BootstrapControl] Services health:', { backendHealthy, celeryHealthy, redisHealthy, errors })

    return { backend: backendHealthy, celery: celeryHealthy, redis: redisHealthy, errors }
  }

  // Silent check for continuous monitoring (doesn't update UI state aggressively)
  const checkServicesHealthSilent = async () => {
    const previousHealth = { ...servicesHealth }
    const result = await checkServicesHealth()

    // Detect if any critical service just went down
    const isRunning = bootstrapStatus?.status === 'running' || bootstrapStatus?.status === 'starting'
    if (isRunning) {
      const criticalServices = []

      if (previousHealth.backend && !result.backend) {
        criticalServices.push('Backend API')
      }
      if (previousHealth.celery && !result.celery) {
        criticalServices.push('Celery Worker')
      }
      if (previousHealth.redis && !result.redis) {
        criticalServices.push('Redis')
      }

      if (criticalServices.length > 0) {
        const alertMessage = `CRÍTICO: ${criticalServices.join(', ')} ${criticalServices.length === 1 ? 'caiu' : 'caíram'}!`
        console.error('[BootstrapControl] CRITICAL SERVICE FAILURE:', alertMessage)

        setServiceCriticalAlert({
          message: alertMessage,
          services: criticalServices,
          timestamp: new Date().toISOString()
        })

        // Play alert sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZORAPP6Hk8biSPgwTUrDm76leFgo+nt7xwG0iBC+C0fLWgzAGI3LB8N+UNwgTZ7Ts7ZhPDQ1Mp+Tw');
          audio.play().catch(e => console.log('Could not play alert sound:', e))
        } catch (e) {
          console.log('Audio alert failed:', e)
        }
      }
    }
  }

  const restartBackend = async () => {
    try {
      const response = await fetch('/api/services/restart/backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('Backend reiniciado com sucesso! Aguarde alguns segundos...')
        setTimeout(() => checkServicesHealth(), 3000)
      } else {
        const error = await response.json()
        alert('Erro ao reiniciar Backend: ' + (error.detail || 'Erro desconhecido'))
      }
    } catch (error) {
      alert('Erro ao reiniciar Backend: ' + error.message)
    }
  }

  const restartCelery = async () => {
    try {
      const response = await fetch('/api/services/restart/celery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('Celery Worker reiniciado com sucesso! Aguarde alguns segundos...')
        setTimeout(() => checkServicesHealth(), 3000)
      } else {
        const error = await response.json()
        alert('Erro ao reiniciar Celery: ' + (error.detail || 'Erro desconhecido'))
      }
    } catch (error) {
      alert('Erro ao reiniciar Celery: ' + error.message)
    }
  }

  const restartRedis = async () => {
    try {
      const response = await fetch('/api/services/restart/redis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('Redis reiniciado com sucesso! Aguarde alguns segundos...')
        setTimeout(() => checkServicesHealth(), 3000)
      } else {
        const error = await response.json()
        alert('Erro ao reiniciar Redis: ' + (error.detail || 'Erro desconhecido'))
      }
    } catch (error) {
      alert('Erro ao reiniciar Redis: ' + error.message)
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

      console.log('[BootstrapControl] Squad Planner completed successfully')
    } catch (error) {
      console.error('[BootstrapControl] Error running Squad Planner:', error)
      // Continue anyway - will use static config as fallback
    } finally {
      setIsPlanningSquads(false)
      setPlanningStep('')
    }
  }

  // NEW: Shutdown SquadOS (stop all services)
  const handleShutdownSquados = async () => {
    setIsShuttingDown(true)
    setShowShutdownConfirmModal(false)

    try {
      setPlanningStep('🛑 Parando SquadOS - Desligando todos os serviços...')
      await new Promise(resolve => setTimeout(resolve, 800))

      const response = await fetch('/api/squados/shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Falha ao parar SquadOS')
      }

      const result = await response.json()

      // Show shutdown status
      if (result.services.celery.status === 'stopped') {
        setPlanningStep('✅ Celery Worker parado')
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      if (result.services.redis.status === 'stopped') {
        setPlanningStep('✅ Redis parado')
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      setPlanningStep('✅ SquadOS desligado com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset states
      setSquadosInitialized(false)
      setProjectAnalyzed(false)

      // Refresh services health
      await checkServicesHealth()

    } catch (error) {
      console.error('[BootstrapControl] Error shutting down SquadOS:', error)
      alert('Erro ao parar SquadOS: ' + error.message)
    } finally {
      setIsShuttingDown(false)
      setPlanningStep('')
    }
  }

  // NEW: Initialize SquadOS (start services + cleanup)
  const handleInitializeSquados = async () => {
    setIsInitializingSquados(true)
    setInitializationResult(null)
    setShowInitializeConfirmModal(false)

    try {
      setPlanningStep('🚀 Inicializando SquadOS - Sistema de Geração Autônoma...')
      await new Promise(resolve => setTimeout(resolve, 800))

      setPlanningStep('🔍 Verificando serviços necessários...')
      await new Promise(resolve => setTimeout(resolve, 600))

      const response = await fetch('/api/squados/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Falha ao inicializar SquadOS')
      }

      const result = await response.json()
      setInitializationResult(result)

      // Show service status
      if (result.services.backend.status === 'running') {
        setPlanningStep('✅ Backend API operacional')
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      if (result.services.celery.status === 'running' || result.services.celery.status === 'started') {
        setPlanningStep('✅ Celery Worker operacional')
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      if (result.services.redis.status === 'running') {
        setPlanningStep('✅ Redis operacional')
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      // Show cleanup
      setPlanningStep('🧹 Limpando dados anteriores...')
      await new Promise(resolve => setTimeout(resolve, 800))

      setPlanningStep('✅ SquadOS inicializado com sucesso!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSquadosInitialized(true)

      // Refresh services health
      await checkServicesHealth()

    } catch (error) {
      console.error('[BootstrapControl] Error initializing SquadOS:', error)
      alert('Erro ao inicializar SquadOS: ' + error.message)
    } finally {
      setIsInitializingSquados(false)
      setPlanningStep('')
    }
  }

  // Analyze project (squad planning + backlog generation only)
  const handleAnalyzeProject = async () => {
    // Re-check services health before starting
    await checkServicesHealth()

    // Validate all services are healthy
    if (!servicesHealth.backend || !servicesHealth.celery) {
      setShowConfirmModal(false)
      return // Errors will be shown in UI
    }

    setIsAnalyzing(true)
    setShowConfirmModal(false)

    try {
      // Step 1: Run Squad Planner
      setPlanningStep('🤖 Analisando documentação e alocando agentes...')
      await new Promise(resolve => setTimeout(resolve, 600))

      const squadResponse = await fetch('/api/squads/structure/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!squadResponse.ok) {
        console.warn('[BootstrapControl] Squad Planner failed, using static config')
      }

      // Step 2: Generate Backlog
      setPlanningStep('📋 Analisando requisitos funcionais (RF001-RF017)...')
      await new Promise(resolve => setTimeout(resolve, 600))

      setPlanningStep('🎯 Calculando rigorosamente todas as cards de produto...')
      await new Promise(resolve => setTimeout(resolve, 400))

      const backlogResponse = await fetch('/api/backlog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!backlogResponse.ok) {
        throw new Error('Falha ao gerar backlog')
      }

      const result = await backlogResponse.json()
      setBacklogSummary(result.summary)

      console.log('[BootstrapControl] Backlog generated successfully:', result.summary)

      // Step 3: Analysis complete!
      setPlanningStep(`✅ Análise completa: ${result.summary.total_cards} cards de produto calculadas`)
      await new Promise(resolve => setTimeout(resolve, 1500))

      setProjectAnalyzed(true)

    } catch (error) {
      console.error('[BootstrapControl] Error analyzing project:', error)
      alert('Erro ao analisar projeto: ' + error.message)
    } finally {
      setIsAnalyzing(false)
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

      // Poll bootstrap status to ensure UI updates
      // Wait a bit for the pause to take effect, then refetch status
      setTimeout(async () => {
        const statusResponse = await fetch('/api/bootstrap/status')
        if (statusResponse.ok) {
          const newStatus = await statusResponse.json()
          console.log('[BootstrapControl] Status after pause:', newStatus)
          // Parent component will update bootstrapStatus via polling
        }
      }, 2000)
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

    try {
      await onStop()

      // RESET state to initial - user will need to analyze project again
      setProjectAnalyzed(false)
      setBacklogSummary(null)
      setLastCheckpoint(null)
      setIsInitialSetupComplete(true)

      console.log('[BootstrapControl] Project stopped - state reset to initial')

      // Poll bootstrap status to ensure UI updates
      setTimeout(async () => {
        const statusResponse = await fetch('/api/bootstrap/status')
        if (statusResponse.ok) {
          const newStatus = await statusResponse.json()
          console.log('[BootstrapControl] Status after stop:', newStatus)
          // Parent component will update bootstrapStatus via polling
        }
      }, 2000)
    } catch (error) {
      console.error('Error stopping project:', error)
      alert('Erro ao parar projeto: ' + error.message)
    }
  }

  const isRunning = bootstrapStatus?.status === 'running' || bootstrapStatus?.status === 'starting'
  const isIdle = !bootstrapStatus || bootstrapStatus.status === 'idle' || bootstrapStatus.status === 'completed' || bootstrapStatus.status === 'error' || bootstrapStatus.status === 'stopped'
  const hasCheckpoint = lastCheckpoint && !isLoadingCheckpoint

  console.log('[BootstrapControl] Render - bootstrapStatus:', bootstrapStatus?.status)
  console.log('[BootstrapControl] Render - isIdle:', isIdle, 'hasCheckpoint:', hasCheckpoint)
  console.log('[BootstrapControl] Render - lastCheckpoint:', lastCheckpoint)

  // Show initialization progress
  if (isInitializingSquados) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-6">
            {/* Animated spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Inicializando SquadOS
          </h3>

          <p className="text-sm text-blue-400 font-semibold mb-4 animate-pulse">
            {planningStep}
          </p>

          <div className="w-full max-w-md bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full animate-pulse"
                 style={{ width: '100%' }}></div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Iniciando serviços e preparando sistema para geração autônoma...
          </p>
        </div>
      </div>
    )
  }

  // Show analysis progress
  if (isAnalyzing) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-6">
            {/* Animated spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-100 mb-2">
            Analisando {projectData?.project_name || 'Projeto'}
          </h3>

          <p className="text-sm text-emerald-400 font-semibold mb-4 animate-pulse">
            {planningStep}
          </p>

          <div className="w-full max-w-md bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full animate-pulse"
                 style={{ width: '100%' }}></div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Calculando backlog e preparando projeto...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      {/* CRITICAL SERVICE ALERT (pops up when service fails during execution) */}
      {serviceCriticalAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-bounce">
          <div className="bg-red-900 border-2 border-red-500 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full flex-shrink-0 animate-pulse">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">
                  Serviço Crítico Offline!
                </h4>
                <p className="text-sm text-red-200 mb-3">
                  {serviceCriticalAlert.message}
                </p>
                <p className="text-xs text-red-300 mb-3">
                  A execução do projeto pode ter sido interrompida. Verifique os serviços imediatamente.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowServicesModal(true)
                      setServiceCriticalAlert(null)
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => setServiceCriticalAlert(null)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Info Banner */}
      {projectData && (
        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-300">
                📦 {projectData.project_name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {projectData.description} • v{projectData.version}
              </p>
            </div>
            {/* Services Status Mini-Dashboard */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowServicesModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600"
                title="Ver status completo dos serviços"
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${servicesHealth.backend ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} title="Backend API"></div>
                  <div className={`w-2 h-2 rounded-full ${servicesHealth.celery ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} title="Celery Worker"></div>
                  <div className={`w-2 h-2 rounded-full ${servicesHealth.redis ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} title="Redis"></div>
                </div>
                <span className="text-xs text-slate-300 font-medium">Serviços</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Health Warning Banner */}
      {!servicesHealth.checking && servicesHealth.errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300 mb-2">
                Serviços Necessários Offline
              </p>
              <p className="text-xs text-slate-300 mb-3">
                Para analisar o projeto, todos os serviços devem estar rodando:
              </p>
              <ul className="text-xs text-slate-300 space-y-1 mb-3">
                {servicesHealth.errors.map((error, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={checkServicesHealth}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                >
                  🔄 Verificar Novamente
                </button>
                {!servicesHealth.celery && (
                  <button
                    onClick={restartCelery}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    🔄 Reiniciar Celery
                  </button>
                )}
                {!servicesHealth.redis && (
                  <button
                    onClick={restartRedis}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    🔄 Reiniciar Redis
                  </button>
                )}
                {!servicesHealth.backend && (
                  <button
                    onClick={restartBackend}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    🔄 Reiniciar Backend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backlog Summary Banner */}
      {backlogSummary && (
        <div className="mb-4 p-4 bg-emerald-900/20 rounded-lg border border-emerald-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-300">
                Backlog Calculado com Rigor
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {backlogSummary.total_cards} cards de produto • {backlogSummary.rfs_count} requisitos funcionais
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
              <p className="text-slate-400 mb-1">Total de Horas</p>
              <p className="text-slate-100 font-semibold">{backlogSummary.total_estimated_hours}h</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
              <p className="text-slate-400 mb-1">Dias Estimados</p>
              <p className="text-slate-100 font-semibold">{backlogSummary.estimated_days} dias</p>
            </div>
            <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
              <p className="text-slate-400 mb-1">Complexidade</p>
              <p className="text-slate-100 font-semibold">
                {backlogSummary.complexity_distribution.baixa}B / {backlogSummary.complexity_distribution.média}M / {backlogSummary.complexity_distribution.alta}A
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
          {/* Resume button (when paused/stopped with checkpoint) */}
          {isIdle && hasCheckpoint && (
            <button
              onClick={handleResumeFromCheckpoint}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              disabled={isStarting}
            >
              <PlayIcon className="w-5 h-5" />
              {isStarting ? 'Retomando...' : `Retomar o projeto "${projectData?.project_name || 'SuperCore v2.0'}"`}
            </button>
          )}

          {/* Services Status Indicator (before SquadOS initialization) */}
          {isIdle && !squadosInitialized && !hasCheckpoint && (
            <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-600">
              <p className="text-sm font-semibold text-slate-300 mb-3">Status dos Serviços</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${servicesHealth.backend ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-slate-400">Backend API</span>
                  {servicesHealth.backend ? (
                    <span className="text-xs text-green-400 ml-auto">✅ Online</span>
                  ) : (
                    <span className="text-xs text-red-400 ml-auto">❌ Offline</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${servicesHealth.celery ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-xs text-slate-400">Celery Worker</span>
                  {servicesHealth.celery ? (
                    <span className="text-xs text-green-400 ml-auto">✅ Online</span>
                  ) : (
                    <span className="text-xs text-gray-400 ml-auto">⚪ Offline</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${servicesHealth.redis ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-xs text-slate-400">Redis</span>
                  {servicesHealth.redis ? (
                    <span className="text-xs text-green-400 ml-auto">✅ Online</span>
                  ) : (
                    <span className="text-xs text-gray-400 ml-auto">⚪ Offline</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                ℹ️ O botão "Iniciar SquadOS" verificará e iniciará automaticamente os serviços necessários.
              </p>
            </div>
          )}

          {/* Step 0: Initialize SquadOS button (only when NOT initialized yet) */}
          {isIdle && !squadosInitialized && !hasCheckpoint && (
            <button
              onClick={() => setShowInitializeConfirmModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              disabled={isInitializingSquados}
            >
              <span className="text-xl">🚀</span>
              {isInitializingSquados ? 'Inicializando...' : 'Iniciar SquadOS'}
            </button>
          )}

          {/* Shutdown SquadOS button (only when initialized OR analyzed) */}
          {isIdle && (squadosInitialized || projectAnalyzed) && !hasCheckpoint && (
            <button
              onClick={() => setShowShutdownConfirmModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              disabled={isShuttingDown}
            >
              <span className="text-xl">🛑</span>
              {isShuttingDown ? 'Parando...' : 'Parar SquadOS'}
            </button>
          )}

          {/* Step 1: Analyze Project button (only when initialized AND NOT analyzed yet AND no checkpoint) */}
          {isIdle && squadosInitialized && !projectAnalyzed && !hasCheckpoint && (
            <div className="relative group">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={servicesHealth.errors.length > 0 || servicesHealth.checking}
                className={`px-6 py-3 ${
                  servicesHealth.errors.length > 0 || servicesHealth.checking
                    ? 'bg-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg`}
              >
                <span className="text-xl">🔍</span>
                Analisar Projeto "{projectData?.project_name || 'SuperCore v2.0'}"
              </button>
              {/* Tooltip when disabled */}
              {servicesHealth.errors.length > 0 && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded shadow-lg border border-slate-700 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  ⚠️ Inicie todos os serviços necessários primeiro
                </div>
              )}
            </div>
          )}

          {/* Step 2: Start Project button (only when analyzed AND no checkpoint) */}
          {isIdle && projectAnalyzed && !hasCheckpoint && (
            <button
              onClick={handleStartImmediate}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              disabled={isStarting}
            >
              <PlayIcon className="w-5 h-5" />
              {isStarting ? 'Iniciando...' : `Iniciar Projeto "${projectData?.project_name || 'SuperCore v2.0'}"`}
            </button>
          )}

          {/* Running controls (Pause/Stop) */}
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
      <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Status do Sistema</p>
            <p className="text-lg font-semibold text-slate-100">
              {!squadosInitialized && !projectAnalyzed && !bootstrapStatus?.status
                ? '⚪ Não Inicializado'
                : !squadosInitialized && !projectAnalyzed && bootstrapStatus?.status === 'idle'
                ? '⚪ Não Inicializado'
                : squadosInitialized && !projectAnalyzed && bootstrapStatus?.status === 'idle'
                ? '🟢 Inicializado'
                : projectAnalyzed && !bootstrapStatus?.status
                ? '🟡 Analisado'
                : projectAnalyzed && bootstrapStatus?.status === 'idle'
                ? '🟡 Pronto para Execução'
                : bootstrapStatus?.status
                ? getStatusLabel(bootstrapStatus.status)
                : '⚪ Não Inicializado'
              }
            </p>
          </div>
          <div className="text-right">
            {bootstrapStatus?.session_id && (
              <p className="text-xs text-slate-500">
                Sessão: {bootstrapStatus.session_id}
              </p>
            )}
            {bootstrapStatus?.pid && (
              <p className="text-xs text-slate-500">
                PID: {bootstrapStatus.pid}
              </p>
            )}
          </div>
        </div>

        {bootstrapStatus?.error_message && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
            <strong>Erro:</strong> {bootstrapStatus.error_message}
          </div>
        )}
      </div>

      {/* Initialize SquadOS Confirmation Modal */}
      {showInitializeConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md border border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Iniciar SquadOS
                </h3>
                <p className="text-sm text-red-300 mb-4 font-semibold">
                  ⚠️ ATENÇÃO: Esta ação é DESTRUTIVA!
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  Ao confirmar, o sistema irá:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4 ml-4 list-disc">
                  <li><strong className="text-red-400">Parar qualquer execução em andamento</strong></li>
                  <li>Deletar código gerado (app-solution/)</li>
                  <li>Deletar artefactos (app-artefacts/)</li>
                  <li>Limpar database (eventos, cards, checkpoints)</li>
                  <li>Remover logs e estado anterior</li>
                  <li>Resetar sistema para estado inicial</li>
                </ul>
                <p className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-700 rounded p-2 mb-2">
                  <strong>⚠️ Se houver outro processo rodando em outra janela/sessão, ele será interrompido e todos os dados serão perdidos!</strong>
                </p>
                <p className="text-sm text-emerald-400">
                  ✅ Após a confirmação, o sistema estará pronto para uma nova análise.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowInitializeConfirmModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInitializeSquados}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                🚀 Confirmar Inicialização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shutdown SquadOS Confirmation Modal */}
      {showShutdownConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md border border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-full flex-shrink-0">
                <span className="text-2xl">🛑</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Parar SquadOS
                </h3>
                <p className="text-sm text-orange-300 mb-4 font-semibold">
                  ⚠️ Esta ação irá DESLIGAR todos os serviços
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  Ao confirmar, o sistema irá parar:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4 ml-4 list-disc">
                  <li><strong className="text-orange-400">Celery Worker</strong> (executor de tasks)</li>
                  <li><strong className="text-orange-400">Redis</strong> (message broker)</li>
                  <li>Backend continuará rodando para responder à UI</li>
                </ul>
                <p className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-700 rounded p-2 mb-2">
                  <strong>💡 Use isto quando:</strong>
                  <br/>• Finalizar o projeto
                  <br/>• Resolver erros sem deixar processos dummy
                  <br/>• Liberar recursos do sistema
                </p>
                <p className="text-sm text-slate-400">
                  ℹ️ Você poderá reiniciar clicando em "Iniciar SquadOS" novamente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowShutdownConfirmModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleShutdownSquados}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                🛑 Confirmar Shutdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Project Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md border border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Analisar Projeto "{projectData?.project_name || 'SuperCore v2.0'}"
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Esta ação vai <strong className="text-red-400">eliminar todo o histórico de execução anterior</strong>:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4 ml-4 list-disc">
                  <li>Código gerado (app-solution/)</li>
                  <li>Artefactos (app-artefacts/)</li>
                  <li>Database (eventos, cards, checkpoints)</li>
                  <li>Logs de execução</li>
                </ul>
                <p className="text-sm text-emerald-400 mb-2">
                  Em seguida, o projeto será analisado e o backlog completo será calculado rigorosamente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnalyzeProject}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Confirmar Análise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Status Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">
                  Status dos Serviços
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoramento em tempo real dos serviços essenciais do SquadOS
                </p>
              </div>
              <button
                onClick={() => setShowServicesModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {/* Backend API Status */}
              <div className={`p-4 rounded-lg border-2 ${servicesHealth.backend ? 'bg-emerald-900/20 border-emerald-700' : 'bg-red-900/20 border-red-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${servicesHealth.backend ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Backend API</p>
                      <p className="text-xs text-slate-400">FastAPI + SQLite (porta 3000)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${servicesHealth.backend ? 'text-emerald-400' : 'text-red-400'}`}>
                      {servicesHealth.backend ? '✓ Online' : '✗ Offline'}
                    </p>
                  </div>
                </div>
                {!servicesHealth.backend && (
                  <div className="flex justify-end">
                    <button
                      onClick={restartBackend}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      🔄 Reiniciar
                    </button>
                  </div>
                )}
              </div>

              {/* Celery Worker Status */}
              <div className={`p-4 rounded-lg border-2 ${servicesHealth.celery ? 'bg-emerald-900/20 border-emerald-700' : 'bg-red-900/20 border-red-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${servicesHealth.celery ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Celery Worker</p>
                      <p className="text-xs text-slate-400">Processador de tasks assíncronas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${servicesHealth.celery ? 'text-emerald-400' : 'text-red-400'}`}>
                      {servicesHealth.celery ? '✓ Healthy' : '✗ Not Running'}
                    </p>
                  </div>
                </div>
                {!servicesHealth.celery && (
                  <div className="flex justify-end">
                    <button
                      onClick={restartCelery}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      🔄 Reiniciar
                    </button>
                  </div>
                )}
              </div>

              {/* Redis Status */}
              <div className={`p-4 rounded-lg border-2 ${servicesHealth.redis ? 'bg-emerald-900/20 border-emerald-700' : 'bg-red-900/20 border-red-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${servicesHealth.redis ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Redis</p>
                      <p className="text-xs text-slate-400">Message broker para Celery (porta 6379)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${servicesHealth.redis ? 'text-emerald-400' : 'text-red-400'}`}>
                      {servicesHealth.redis ? '✓ Connected' : '✗ Offline'}
                    </p>
                  </div>
                </div>
                {!servicesHealth.redis && (
                  <div className="flex justify-end">
                    <button
                      onClick={restartRedis}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      🔄 Reiniciar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Last Check Info */}
            {servicesHealth.lastCheck && (
              <p className="text-xs text-slate-500 mb-4">
                Última verificação: {new Date(servicesHealth.lastCheck).toLocaleTimeString('pt-BR')}
                {isRunning && <span className="ml-2 text-emerald-500">• Monitoramento ativo (a cada 10s)</span>}
              </p>
            )}

            {/* Errors List */}
            {servicesHealth.errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-900/20 rounded-lg border border-red-700">
                <p className="text-sm font-semibold text-red-300 mb-2">
                  Erros Detectados:
                </p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {servicesHealth.errors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={async () => {
                  await checkServicesHealth()
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Verificar Agora
              </button>
              <button
                onClick={() => setShowServicesModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusLabel(status) {
  const labels = {
    'idle': '⚪ Ocioso',
    'starting': '🔵 Iniciando',
    'running': '🟢 Em Execução',
    'completed': '✅ Concluído',
    'error': '🔴 Erro',
    'stopped': '🟠 Parado',
    'awaiting_approval': '🟡 Aguardando Aprovação'
  }
  return labels[status] || status
}

export default BootstrapControl

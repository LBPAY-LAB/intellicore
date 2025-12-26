import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import Header from './components/Header'
import SquadGrid from './components/SquadGrid'
import EventsFeed from './components/EventsFeed'
import MetricsPanel from './components/MetricsPanel'
import DualProgressBar from './components/DualProgressBar'
import BootstrapControl from './components/BootstrapControl'
import ProgressFlow from './components/ProgressFlow'
import MilestoneTracker from './components/MilestoneTracker'
import ApprovalDialog from './components/ApprovalDialog'
import ProjectJournal from './components/ProjectJournal'
import SquadActivityFeed from './components/SquadActivityFeed'
import SquadOrganization from './components/SquadOrganization'
import SolutionExplorer from './components/SolutionExplorer'
import HumanReviewPanel from './components/HumanReviewPanel'
import Tabs from './components/Tabs'

function App() {
  const [sessionData, setSessionData] = useState(null)
  const [squads, setSquads] = useState([])
  const [cards, setCards] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [events, setEvents] = useState([])
  const [bootstrapStatus, setBootstrapStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectData, setProjectData] = useState(null)
  const [solutionStats, setSolutionStats] = useState(null)

  // WebSocket connection
  const { connected, lastMessage } = useWebSocket('ws://localhost:3000/ws')

  // Initial data fetch
  useEffect(() => {
    fetchInitialData()
    fetchBootstrapStatus()
    fetchCards()
    fetchProjectData()
    fetchSolutionStats()
    const interval = setInterval(() => {
      fetchEvents()
      fetchBootstrapStatus()
      fetchCards()
      fetchSolutionStats() // Poll solution stats to detect when it becomes executable
    }, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage)
    }
  }, [lastMessage])

  const fetchInitialData = async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()

      setSessionData({
        session_id: data.session_id,
        started_at: data.started_at,
        uptime_seconds: data.uptime_seconds,
        overall_progress: data.overall_progress
      })

      setSquads(data.squads || [])
      setMetrics(data.metrics)
      setEvents(data.recent_events || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards')
      const data = await response.json()
      setCards(data)
    } catch (error) {
      console.error('Error fetching cards:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=20')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchBootstrapStatus = async () => {
    try {
      const response = await fetch('/api/bootstrap/status')
      const data = await response.json()
      setBootstrapStatus(data)
    } catch (error) {
      console.error('Error fetching bootstrap status:', error)
    }
  }

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/project/data')
      if (response.ok) {
        const data = await response.json()
        setProjectData(data)
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
    }
  }

  const fetchSolutionStats = async () => {
    try {
      const response = await fetch('/api/solution/stats')
      if (response.ok) {
        const data = await response.json()
        setSolutionStats(data)
      }
    } catch (error) {
      console.error('Error fetching solution stats:', error)
    }
  }

  const handleStartBootstrap = async (request) => {
    try {
      const response = await fetch('/api/bootstrap/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBootstrapStatus(data)
      return data
    } catch (error) {
      console.error('Error starting bootstrap:', error)
      throw error
    }
  }

  const handleStopBootstrap = async () => {
    // Ask for confirmation before stopping
    if (!window.confirm('Tem certeza que deseja parar a execução do projeto?')) {
      return
    }

    try {
      const response = await fetch('/api/bootstrap/stop?confirmed=true', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBootstrapStatus(data)
      return data
    } catch (error) {
      console.error('Error stopping bootstrap:', error)
      throw error
    }
  }

  const handleUploadConfig = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/config/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.config_path
    } catch (error) {
      console.error('Error uploading config:', error)
      throw error
    }
  }

  const handleApprove = async (approvalRequest) => {
    try {
      const response = await fetch('/api/bootstrap/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBootstrapStatus(data)
      return data
    } catch (error) {
      console.error('Error approving deployment:', error)
      throw error
    }
  }

  const handleResumeBootstrap = async (resumeRequest) => {
    try {
      const response = await fetch('/api/bootstrap/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBootstrapStatus(data)
      return data
    } catch (error) {
      console.error('Error resuming bootstrap:', error)
      throw error
    }
  }

  const handleWebSocketMessage = (message) => {
    if (message.type === 'update' || message.type === 'initial') {
      const data = message.data

      if (data.squads) setSquads(data.squads)
      if (data.cards) setCards(data.cards)
      if (data.metrics) setMetrics(data.metrics)
      if (data.bootstrap_status) setBootstrapStatus(data.bootstrap_status)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading SuperCore Monitoring...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        sessionId={sessionData?.session_id}
        connected={connected}
        uptime={sessionData?.uptime_seconds}
        projectName={projectData?.project_name}
        solutionStats={solutionStats}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Bootstrap Control Panel - Always Visible */}
        <BootstrapControl
          bootstrapStatus={bootstrapStatus}
          onStart={handleStartBootstrap}
          onStop={handleStopBootstrap}
          onResume={handleResumeBootstrap}
          onUploadConfig={handleUploadConfig}
        />

        {/* Project Progress - Always Visible */}
        <DualProgressBar />

        {/* Main Content Tabs */}
        <Tabs
          tabs={[
            {
              icon: '🔄',
              label: 'Fluxo de Implementação',
              content: (
                <div className="space-y-6">
                  <ProgressFlow
                    squads={squads}
                    cards={cards}
                    bootstrapStatus={bootstrapStatus}
                  />
                  <SquadGrid squads={squads} />
                </div>
              )
            },
            {
              icon: '👥',
              label: 'Organização das Squads',
              badge: squads.length > 0 ? squads.length : null,
              content: (
                <SquadOrganization />
              )
            },
            {
              icon: '⏸️',
              label: 'Human Reviews',
              content: (
                <HumanReviewPanel />
              )
            },
            {
              icon: '📊',
              label: 'Métricas e Milestones',
              content: (
                <div className="space-y-6">
                  {/* Milestone Tracker */}
                  {bootstrapStatus?.all_milestones && bootstrapStatus.all_milestones.length > 0 && (
                    <MilestoneTracker bootstrapStatus={bootstrapStatus} />
                  )}

                  {/* Metrics Panel - Velocity, QA, Coverage */}
                  <MetricsPanel metrics={metrics} />
                </div>
              )
            },
            {
              icon: '📝',
              label: 'Jornal do Projeto',
              badge: events.length > 0 ? events.length : null,
              content: (
                <div className="space-y-6">
                  {/* Project Journal - Full Width */}
                  <ProjectJournal />

                  {/* Events Feed */}
                  <EventsFeed events={events} />
                </div>
              )
            },
            {
              icon: '📦',
              label: 'Solução Gerada',
              content: (
                <SolutionExplorer />
              )
            }
          ]}
          defaultTab={0}
        />

        {/* Squad Activity Feed - Sidebar/Fixed */}
        <SquadActivityFeed />
      </main>

      {/* Approval Dialog Modal */}
      <ApprovalDialog
        bootstrapStatus={bootstrapStatus}
        onApprove={handleApprove}
      />
    </div>
  )
}

export default App

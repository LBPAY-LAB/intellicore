import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon } from './Icons'

function SquadOrganization() {
  const [squads, setSquads] = useState([])
  const [selectedSquad, setSelectedSquad] = useState(null)
  const [squadTasks, setSquadTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSquadsStructure()
  }, [])

  useEffect(() => {
    if (selectedSquad) {
      fetchSquadTasks(selectedSquad.squad_id)
    }
  }, [selectedSquad])

  const fetchSquadsStructure = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/squads/structure/all')
      if (!response.ok) {
        throw new Error('Failed to fetch squads structure')
      }
      const data = await response.json()
      setSquads(data)
      if (data.length > 0) {
        setSelectedSquad(data[0])
      }
    } catch (err) {
      console.error('Error fetching squads:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSquadTasks = async (squadId) => {
    try {
      const response = await fetch(`/api/squads/${squadId}/tasks`)
      if (response.ok) {
        const data = await response.json()
        setSquadTasks(data)
      } else {
        setSquadTasks([])
      }
    } catch (err) {
      console.error('Error fetching squad tasks:', err)
      setSquadTasks([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando estrutura das squads...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-red-300">Erro ao carregar squads: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-slate-100">Organização das Squads</h2>
        <p className="text-sm text-slate-400 mt-1">
          Estrutura completa: agentes, skills, responsabilidades e tarefas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Squad List - Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Squads</h3>
          <div className="space-y-2">
            {squads.map((squad) => (
              <button
                key={squad.squad_id}
                onClick={() => setSelectedSquad(squad)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedSquad?.squad_id === squad.squad_id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="font-semibold">{squad.name}</div>
                <div className="text-xs mt-1 opacity-75">
                  {squad.agents.length} agente(s)
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Squad Details - Main Content */}
        <div className="lg:col-span-2">
          {selectedSquad ? (
            <div className="space-y-6">
              {/* Squad Header */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-100">{selectedSquad.name}</h3>
                  {selectedSquad.allocated_by && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedSquad.allocated_by === 'squad-planner'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {selectedSquad.allocated_by === 'squad-planner' ? '🤖 Dynamic Allocation' : '📋 Static Config'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-4">{selectedSquad.description}</p>

                {selectedSquad.inputs_from && (
                  <div className="text-xs text-slate-400 mb-1">
                    <span className="font-semibold">Inputs de:</span> {selectedSquad.inputs_from}
                  </div>
                )}
                {selectedSquad.outputs_to && (
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold">Outputs para:</span> {selectedSquad.outputs_to}
                  </div>
                )}
              </div>

              {/* Dynamic Allocation Info (Squad Planner) */}
              {selectedSquad.allocated_by === 'squad-planner' && (
                <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700">
                  {/* Justification */}
                  {selectedSquad.justification && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-emerald-300 mb-2">🎯 Alocação Inteligente</h5>
                      <p className="text-sm text-slate-300">{selectedSquad.justification}</p>
                    </div>
                  )}

                  {/* Scope Summary */}
                  {selectedSquad.scope_summary && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-emerald-300 mb-2">📊 Escopo do Projeto</h5>
                      <p className="text-sm text-slate-300">{selectedSquad.scope_summary}</p>
                    </div>
                  )}

                  {/* Technologies */}
                  {selectedSquad.technologies && selectedSquad.technologies.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-emerald-300 mb-2">🛠️ Tecnologias Identificadas</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSquad.technologies.map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedSquad.skills && selectedSquad.skills.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-emerald-300 mb-2">💡 Skills Alocadas</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSquad.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-emerald-800/30 rounded text-xs text-emerald-200 border border-emerald-700/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Agents */}
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-3">
                  👥 Agentes ({selectedSquad.agents.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSquad.agents.map((agent, idx) => (
                    <div key={idx} className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                      <div className="font-semibold text-slate-100 text-sm">{agent.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{agent.role}</div>
                      {agent.description && (
                        <div className="text-xs text-slate-300 mt-2">{agent.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-squads (Engineering) */}
              {selectedSquad.sub_squads && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">
                    🔧 Sub-Squads
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedSquad.sub_squads).map(([subSquadId, subSquad]) => (
                      <div key={subSquadId} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-slate-100">{subSquadId}</div>
                          <div className="text-xs text-slate-400">{subSquad.description}</div>
                        </div>
                        <div className="text-xs text-slate-300 mt-2">
                          <span className="font-semibold">Lead:</span> {subSquad.lead}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subSquad.agents && subSquad.agents.map((agent, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                              {agent}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {selectedSquad.responsibilities && selectedSquad.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">
                    📋 Responsabilidades
                  </h4>
                  <ul className="space-y-2">
                    {selectedSquad.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Milestones */}
              {selectedSquad.milestones && selectedSquad.milestones.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">
                    🎯 Milestones
                  </h4>
                  <div className="space-y-3">
                    {selectedSquad.milestones.map((milestone, idx) => (
                      <div key={idx} className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-emerald-700 rounded text-xs font-semibold text-white">
                            Fase {milestone.phase}
                          </span>
                          <span className="font-semibold text-slate-100">{milestone.name}</span>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">{milestone.description}</p>
                        <div className="text-xs text-slate-400 mb-2 font-semibold">Deliverables:</div>
                        <ul className="space-y-1">
                          {milestone.deliverables.map((deliverable, didx) => (
                            <li key={didx} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="text-emerald-400">✓</span>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks/Sprints */}
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-3">
                  📝 Tarefas e Sprints
                </h4>
                {squadTasks.length > 0 ? (
                  <div className="space-y-2">
                    {squadTasks.map((task) => (
                      <div key={task.task_id} className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-100 text-sm">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-slate-300 mt-1">{task.description}</div>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.status === 'done' ? 'bg-green-700 text-white' :
                            task.status === 'in_progress' ? 'bg-blue-700 text-white' :
                            task.status === 'blocked' ? 'bg-red-700 text-white' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {task.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {task.sprint_number && (
                            <span>Sprint {task.sprint_number}</span>
                          )}
                          {task.assigned_agent && (
                            <span>Agente: {task.assigned_agent}</span>
                          )}
                          {task.progress_percent > 0 && (
                            <span>{task.progress_percent.toFixed(0)}% completo</span>
                          )}
                        </div>
                        {task.deliverables && task.deliverables.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-slate-400 font-semibold">Deliverables:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.deliverables.map((d, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhuma tarefa criada ainda para esta squad.
                    <br />
                    As tarefas serão criadas automaticamente durante a execução do projeto.
                  </div>
                )}
              </div>

              {/* Permissions Summary */}
              {selectedSquad.permissions && Object.keys(selectedSquad.permissions).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">
                    🔐 Permissões
                  </h4>
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedSquad.permissions).map(([key, value]) => {
                        if (typeof value === 'boolean') {
                          return (
                            <div key={key} className="flex items-center gap-2">
                              {value ? (
                                <CheckIcon className="w-4 h-4 text-green-400" />
                              ) : (
                                <XMarkIcon className="w-4 h-4 text-red-400" />
                              )}
                              <span className="text-slate-300">{key.replace(/_/g, ' ')}</span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                    {selectedSquad.permissions.allowed_paths && (
                      <div className="mt-4">
                        <div className="text-slate-400 font-semibold mb-2">Paths permitidos:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedSquad.permissions.allowed_paths.map((path, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs">
                              {path}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Selecione uma squad para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SquadOrganization

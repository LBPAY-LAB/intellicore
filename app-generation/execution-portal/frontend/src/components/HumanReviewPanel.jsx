import { useState, useEffect } from 'react'

/**
 * HumanReviewPanel - Component for human-in-the-loop review approvals
 *
 * Displays pending review requests from the orchestrator and allows
 * human approval or rejection with feedback.
 */
export default function HumanReviewPanel() {
  const [pendingReviews, setPendingReviews] = useState([])
  const [reviewHistory, setReviewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  // Poll for pending reviews every 5 seconds
  useEffect(() => {
    fetchPendingReviews()
    fetchReviewHistory()

    const interval = setInterval(() => {
      fetchPendingReviews()
      if (showHistory) {
        fetchReviewHistory()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [showHistory])

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/reviews/pending')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setPendingReviews(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching pending reviews:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchReviewHistory = async () => {
    try {
      const response = await fetch('/api/reviews/history?limit=20')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setReviewHistory(data)
    } catch (err) {
      console.error('Error fetching review history:', err)
    }
  }

  const handleApprove = async (reviewId) => {
    if (!approverName.trim()) {
      alert('Por favor, informe seu nome antes de aprovar.')
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: approverName })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Falha ao aprovar')
      }

      // Refresh pending reviews
      await fetchPendingReviews()
      await fetchReviewHistory()

      // Show success notification
      alert(`✅ Review ${reviewId} aprovado com sucesso!`)
    } catch (err) {
      console.error('Error approving review:', err)
      alert(`Erro ao aprovar review: ${err.message}`)
    }
  }

  const handleReject = async () => {
    if (!approverName.trim()) {
      alert('Por favor, informe seu nome antes de rejeitar.')
      return
    }

    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição.')
      return
    }

    try {
      const response = await fetch(`/api/reviews/${selectedReview.review_id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejected_by: approverName,
          rejection_reason: rejectionReason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Falha ao rejeitar')
      }

      // Close modal and reset
      setShowRejectModal(false)
      setSelectedReview(null)
      setRejectionReason('')

      // Refresh pending reviews
      await fetchPendingReviews()
      await fetchReviewHistory()

      // Show success notification
      alert(`❌ Review ${selectedReview.review_id} rejeitado.`)
    } catch (err) {
      console.error('Error rejecting review:', err)
      alert(`Erro ao rejeitar review: ${err.message}`)
    }
  }

  const openRejectModal = (review) => {
    setSelectedReview(review)
    setShowRejectModal(true)
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-slate-400">Carregando reviews pendentes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-red-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-300">Erro ao carregar reviews</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-2xl">⏸️</span>
            Human-in-the-Loop Reviews
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Aprove ou rejeite checkpoints de validação da execução autônoma
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 ${
            showHistory ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white text-sm font-semibold rounded-lg transition-colors`}
        >
          {showHistory ? '📋 Ver Pendentes' : '📜 Ver Histórico'}
        </button>
      </div>

      {/* Approver Name Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Seu Nome (obrigatório para aprovar/rejeitar)
        </label>
        <input
          type="text"
          value={approverName}
          onChange={(e) => setApproverName(e.target.value)}
          placeholder="Ex: João Silva"
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pending Reviews */}
      {!showHistory && (
        <>
          {pendingReviews.length === 0 ? (
            <div className="p-8 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
              <p className="text-lg text-slate-400">✅ Nenhum review pendente</p>
              <p className="text-xs text-slate-500 mt-2">
                A execução está fluindo sem necessidade de aprovação
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.review_id}
                  className="p-6 bg-yellow-900/20 rounded-lg border-2 border-yellow-700 shadow-lg"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg flex-shrink-0">
                        <span className="text-2xl">⏸️</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-300">
                          {review.phase}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Review ID: {review.review_id}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(review.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-600 rounded-full">
                      <p className="text-xs font-semibold text-white">AGUARDANDO</p>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      📋 Resumo:
                    </p>
                    <p className="text-sm text-slate-100">{review.summary}</p>
                  </div>

                  {/* Artifacts */}
                  {review.artifacts && review.artifacts.length > 0 && (
                    <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-300 mb-2">
                        📦 Artefatos Gerados:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1">
                        {review.artifacts.map((artifact, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-blue-400">•</span>
                            <span className="font-mono">{artifact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => openRejectModal(review)}
                      disabled={!approverName.trim()}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>❌</span>
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApprove(review.review_id)}
                      disabled={!approverName.trim()}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <span>✅</span>
                      Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review History */}
      {showHistory && (
        <div className="space-y-3">
          {reviewHistory.length === 0 ? (
            <div className="p-8 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
              <p className="text-lg text-slate-400">📜 Nenhum histórico disponível</p>
            </div>
          ) : (
            reviewHistory.map((review) => (
              <div
                key={review.review_id}
                className={`p-4 rounded-lg border ${
                  review.status === 'APPROVED'
                    ? 'bg-emerald-900/20 border-emerald-700'
                    : review.status === 'REJECTED'
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-slate-900/20 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-100">
                        {review.phase}
                      </p>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: review.status === 'APPROVED' ? '#10b981' : '#ef4444',
                              color: 'white'
                            }}>
                        {review.status === 'APPROVED' ? '✓ APROVADO' : '✗ REJEITADO'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{review.summary}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(review.timestamp).toLocaleString('pt-BR')}
                      {review.approved_by && ` • por ${review.approved_by}`}
                    </p>
                    {review.rejection_reason && (
                      <p className="text-xs text-red-300 mt-2 bg-red-900/30 p-2 rounded">
                        Motivo: {review.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Rejeitar Review
                </h3>
                <p className="text-sm text-red-300 mb-2">
                  {selectedReview.phase}
                </p>
                <p className="text-xs text-slate-400">
                  Esta ação irá parar a execução autônoma e requerer correções.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Motivo da Rejeição (obrigatório)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o que precisa ser corrigido..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedReview(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

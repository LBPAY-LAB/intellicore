import { useState } from 'react'
import { CheckIcon, XMarkIcon } from './Icons'

function ApprovalDialog({ bootstrapStatus, onApprove }) {
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!bootstrapStatus || bootstrapStatus.status !== 'awaiting_approval' || !bootstrapStatus.approval_stage) {
    return null
  }

  const approvalType = bootstrapStatus.approval_stage
  const approvalInfo = getApprovalInfo(approvalType)

  const handleApproval = async (approved) => {
    setIsSubmitting(true)
    try {
      await onApprove({
        session_id: bootstrapStatus.session_id,
        approval_type: approvalType,
        approved,
        comments: comments.trim() || null
      })
      setComments('')
    } catch (error) {
      console.error('Error submitting approval:', error)
      alert('Erro ao enviar aprovação: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 max-w-2xl w-full">
        {/* Header */}
        <div className={`p-6 border-b border-slate-700 ${approvalInfo.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${approvalInfo.iconBg}`}>
              {approvalInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{approvalInfo.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{approvalInfo.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-200 mb-3">Informações do Deploy</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Ambiente:</dt>
                <dd className="text-slate-100 font-medium">{approvalInfo.environment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Sessão:</dt>
                <dd className="text-slate-300 font-mono text-xs">{bootstrapStatus.session_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Aprovadores Necessários:</dt>
                <dd className="text-slate-100">{approvalInfo.approvers}</dd>
              </div>
            </dl>
          </div>

          {/* Warning for Production */}
          {approvalType === 'deploy_production' && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-red-300 mb-1">⚠️ Deploy para Produção</p>
                  <p className="text-sm text-red-200">
                    Esta ação irá realizar deploy para o ambiente de produção.
                    Certifique-se de que todos os testes foram executados e validados antes de aprovar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-slate-200 mb-3">Checklist de Aprovação</h3>
            <ul className="space-y-2 text-sm">
              {approvalInfo.checklist.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Comentários (opcional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Adicione observações ou justificativas para esta aprovação..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={() => handleApproval(false)}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            Rejeitar
          </button>
          <button
            onClick={() => handleApproval(true)}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            {isSubmitting ? 'Aprovando...' : 'Aprovar Deploy'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getApprovalInfo(approvalType) {
  const icon = (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )

  const configs = {
    'deploy_qa': {
      title: 'Aprovação de Deploy - QA',
      subtitle: 'Ambiente de testes de qualidade',
      environment: 'QA (Quality Assurance)',
      approvers: 'Automático (após testes)',
      headerBg: 'bg-blue-900/20',
      iconBg: 'bg-blue-600',
      icon,
      checklist: [
        'Todos os testes unitários passaram',
        'Testes de integração executados com sucesso',
        'Análise de segurança sem vulnerabilidades críticas',
        'Cobertura de código ≥80%'
      ]
    },
    'deploy_staging': {
      title: 'Aprovação de Deploy - Staging',
      subtitle: 'Ambiente de homologação',
      environment: 'Staging (Homologação)',
      approvers: 'Tech Lead',
      headerBg: 'bg-yellow-900/20',
      iconBg: 'bg-yellow-600',
      icon,
      checklist: [
        'Ambiente de QA validado com sucesso',
        'Arquitetura revisada pelo Tech Lead',
        'Documentação técnica atualizada',
        'Plano de rollback definido'
      ]
    },
    'deploy_production': {
      title: 'Aprovação de Deploy - PRODUÇÃO',
      subtitle: 'Ambiente de produção',
      environment: 'Production (Produção)',
      approvers: 'Product Owner + Tech Lead',
      headerBg: 'bg-red-900/20',
      iconBg: 'bg-red-600',
      icon,
      checklist: [
        'Staging validado por equipe humana',
        'Aprovação do Product Owner obtida',
        'Aprovação do Tech Lead obtida',
        'Janela de mudança (change window) agendada',
        'Equipe de suporte notificada',
        'Plano de comunicação aos usuários pronto'
      ]
    }
  }

  return configs[approvalType] || configs['deploy_qa']
}

export default ApprovalDialog

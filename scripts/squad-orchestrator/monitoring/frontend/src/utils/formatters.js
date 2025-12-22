import { formatDistanceToNow } from 'date-fns'

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatTimestamp(timestamp) {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch {
    return timestamp
  }
}

export function getSquadIcon(squadId) {
  const icons = {
    'squad-product': '📋',
    'squad-architecture': '🏗️',
    'squad-backend': '⚙️',
    'squad-frontend': '🎨',
    'squad-qa': '✅',
    'squad-devops': '🚀',
    'squad-security': '🔒',
    'squad-database': '💾'
  }

  return icons[squadId] || '👥'
}

export function getStatusColor(status) {
  const colors = {
    running: 'bg-green-500/20 text-green-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    blocked: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
    error: 'bg-red-500/20 text-red-400'
  }

  return colors[status] || 'bg-slate-500/20 text-slate-400'
}

export function getStatusIcon(status) {
  const icons = {
    running: '▶️',
    waiting: '⏸️',
    blocked: '🚧',
    completed: '✅',
    error: '❌'
  }

  return icons[status] || '❓'
}

export function getEventIcon(eventType) {
  const icons = {
    card_status_changed: '🔄',
    card_done: '✅',
    card_blocked: '🚧',
    card_started: '▶️',
    qa_approved: '✅',
    qa_rejected: '❌',
    squad_started: '🚀',
    squad_blocked: '⚠️',
    squad_completed: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return icons[eventType] || '📌'
}

export function getEventColor(eventType) {
  const colors = {
    card_done: 'text-green-400',
    card_blocked: 'text-yellow-400',
    card_started: 'text-blue-400',
    qa_approved: 'text-green-400',
    qa_rejected: 'text-red-400',
    squad_started: 'text-blue-400',
    squad_blocked: 'text-yellow-400',
    squad_completed: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-slate-400'
  }

  return colors[eventType] || 'text-slate-400'
}

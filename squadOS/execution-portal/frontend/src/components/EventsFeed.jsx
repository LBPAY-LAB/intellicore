import { formatTimestamp, getEventIcon, getEventColor } from '../utils/formatters'

export default function EventsFeed({ events }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center">
          <span className="mr-2">📋</span>
          Recent Events
        </h2>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {!events || events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No events yet
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <EventItem key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EventItem({ event }) {
  const icon = getEventIcon(event.type)
  const color = getEventColor(event.type)

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
      <div className={`text-xl ${color} flex-shrink-0`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm text-slate-200 truncate">
            {event.message}
          </p>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>

        <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
          <span className="font-mono">{event.squad}</span>
          {event.card && (
            <>
              <span>•</span>
              <span className="font-mono">{event.card}</span>
            </>
          )}
          {event.agent && (
            <>
              <span>•</span>
              <span>{event.agent}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import SquadCard from './SquadCard'

export default function SquadGrid({ squads }) {
  if (!squads || squads.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
        <p className="text-slate-400 text-lg">No squads running</p>
        <p className="text-slate-500 text-sm mt-2">Start squads using launch-squads.sh</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {squads.map((squad) => (
        <SquadCard key={squad.squad_id} squad={squad} />
      ))}
    </div>
  )
}

export default function SpeakingOrder({
  players,
  currentPlayerName = '',
  compact = false,
}) {
  if (!Array.isArray(players) || players.length === 0) return null

  return (
    <div className={`rounded-2xl border border-violet-400/20 bg-violet-500/5 text-left ${
      compact ? 'p-4' : 'p-5'
    }`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">
            Speaking Order
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {players[0].name} goes first, then continue down the list.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-200">
          {players.length} players
        </span>
      </div>

      <ol className={`max-h-44 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        compact ? 'grid grid-cols-2 gap-2' : 'space-y-2'
      }`}>
        {players.map((player, index) => {
          const isCurrentPlayer = (
            currentPlayerName
            && player.name.toLowerCase() === currentPlayerName.toLowerCase()
          )

          return (
            <li
              key={`${player.name}-${index}`}
              className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                index === 0
                  ? 'border-violet-400/30 bg-violet-500/10'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                index === 0
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/[0.05] text-slate-400'
              }`}>
                {index + 1}
              </span>
              <span className={`min-w-0 truncate ${
                isCurrentPlayer ? 'font-bold text-violet-200' : 'text-slate-300'
              }`}>
                {player.name}
                {isCurrentPlayer && <span className="ml-1 text-xs">(You)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

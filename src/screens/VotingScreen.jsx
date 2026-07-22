import GameScreen from '../components/GameScreen'

export default function VotingScreen({
  timerMode,
  timer,
  hasVoted,
  playerRoles,
  lobbyMode,
  onCastVote,
  onRevealResults,
}) {
  return (
    <GameScreen>
      <span className="inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-rose-300">
        Voting Phase
      </span>
      <h2 className="mt-5 text-3xl font-black tracking-tight">Cast Your Vote!</h2>
      <p className="mt-2 text-sm text-slate-400">
        Choose carefully. Your vote cannot be changed.
      </p>

      {timerMode === 'timed' ? (
        <div className="my-6 inline-block rounded-2xl border border-rose-400/20 bg-rose-500/5 px-7 py-3">
          <span className="font-mono text-3xl font-black text-rose-300">
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </div>
      ) : (
        <div className="my-6 inline-block rounded-full border border-violet-400/20 bg-violet-500/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
          Host-controlled results
        </div>
      )}

      {hasVoted ? (
        <div className="my-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-8">
          <span className="mb-3 block text-4xl">✓</span>
          <h3 className="font-bold text-emerald-300">Vote Locked In</h3>
          <p className="mt-2 text-sm text-slate-400">
            {timerMode === 'timed'
              ? 'Waiting for the timer to finish...'
              : 'Waiting for the host to reveal results...'}
          </p>
        </div>
      ) : (
        <div className="mt-2 space-y-2 text-left">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Who is the Imposter?
          </h3>
          {playerRoles.map((player, index) => (
            <button
              key={`${player.name}-${index}`}
              type="button"
              onClick={() => onCastVote(player.name)}
              className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left font-medium text-slate-200 transition-all hover:border-rose-400/50 hover:bg-rose-500/5"
            >
              <span className="truncate">{player.name}</span>
              <span className="shrink-0 rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 transition group-hover:bg-rose-500/20">
                Accuse
              </span>
            </button>
          ))}
        </div>
      )}

      {timerMode === 'untimed' && lobbyMode === 'HOST' && (
        <button
          type="button"
          onClick={onRevealResults}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
        >
          Reveal Results
        </button>
      )}
    </GameScreen>
  )
}

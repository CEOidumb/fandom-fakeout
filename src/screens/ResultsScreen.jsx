import GameScreen from '../components/GameScreen'
import { calculateVoteResult } from '../utils/gameLogic'

function LocalResults({
  playerRoles,
  isImposterRevealed,
  onRevealImposter,
  onResetGame,
}) {
  const imposter = playerRoles.find((player) => player.role === 'Imposter')
  const civilianWord = playerRoles.find((player) => player.role === 'Civilian')?.word

  return (
    <GameScreen>
      {!isImposterRevealed ? (
        <>
          <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200">
            Discussion Complete
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight">Ready for the reveal?</h2>
          <p className="mt-2 mb-8 text-sm leading-relaxed text-slate-400">
            Make sure everyone has finished their guesses before showing the answer.
          </p>
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <span className="mb-3 block text-4xl">?</span>
            <p className="text-sm font-semibold text-slate-300">
              The Imposter is still hidden
            </p>
          </div>
          <button
            type="button"
            onClick={onRevealImposter}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
          >
            Reveal the Imposter
          </button>
        </>
      ) : (
        <>
          <span className="inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-rose-300">
            Imposter Revealed
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            The Imposter was
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-rose-300">
            {imposter?.name || 'Unknown'}
          </h2>
          <div className="my-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Civilian word
              </span>
              <span className="mt-1 block text-xl font-bold text-violet-200">
                {civilianWord || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Imposter hint
              </span>
              <span className="mt-1 block text-xl font-bold text-rose-200">
                {imposter?.word || 'Unknown'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetGame}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
          >
            Return to Local Setup
          </button>
        </>
      )}
    </GameScreen>
  )
}

function OnlineResults({
  votes,
  playerRoles,
  lobbyMode,
  roomCode,
  onResetGame,
  onLeaveRoom,
}) {
  const result = calculateVoteResult(votes, playerRoles)

  return (
    <GameScreen>
      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] ${
        result.winner === 'Civilians Won'
          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
      }`}>
        Round Complete
      </span>
      <h2 className={`mt-5 text-4xl font-black tracking-tight ${
        result.winner === 'Civilians Won' ? 'text-emerald-300' : 'text-rose-300'
      }`}>
        {result.winner}
      </h2>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-slate-400">
        {result.explanation}
      </p>

      <div className="my-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Group voted out
          </span>
          <span className="mt-1 block font-bold text-slate-200">{result.votedOut}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Actual role
          </span>
          <span className="mt-1 block font-bold text-violet-200">{result.actualRole}</span>
        </div>
      </div>

      <div className="my-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-left">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Final Vote Tally
        </h3>
        {Object.keys(votes).length === 0 ? (
          <p className="text-sm italic text-slate-400">No votes were cast.</p>
        ) : (
          <ul className="space-y-3">
            {Object.entries(votes)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const role = playerRoles.find((player) => player.name === name)?.role

                return (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div>
                      <span className="block font-bold text-slate-200">{name}</span>
                      <span className={`text-xs ${
                        role === 'Imposter' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {role}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-violet-500/10 px-3 py-1 font-bold text-violet-300">
                      {count} {count === 1 ? 'vote' : 'votes'}
                    </span>
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {lobbyMode === 'HOST' ? (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4">
          <span className="block text-sm font-bold text-violet-100">
            Keep the party together
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-400">
            Everyone stays in room {roomCode}. You can change the topic or settings before the next round.
          </span>
          <button
            type="button"
            onClick={onResetGame}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
          >
            Set Up Next Round
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4">
          <span className="block text-sm font-bold text-violet-100">
            Staying in room {roomCode}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-400">
            Waiting for the host to set up the next round. Your screen will return to the lobby automatically.
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onLeaveRoom}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 font-bold text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
      >
        {lobbyMode === 'HOST' ? 'Leave and Close Room' : 'Leave Room'}
      </button>
    </GameScreen>
  )
}

export default function ResultsScreen({ isLocalMode, ...props }) {
  if (isLocalMode) {
    return <LocalResults {...props} />
  }

  return <OnlineResults {...props} />
}

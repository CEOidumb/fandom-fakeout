import GameScreen from '../components/GameScreen'

export default function DiscussionScreen({
  timerMode,
  timer,
  isLocalMode,
  lobbyMode,
  onManualEnd,
}) {
  return (
    <GameScreen>
      <span className="inline-flex animate-pulse rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
        Live Discussion
      </span>
      <h2 className="mt-5 text-3xl font-black tracking-tight">Talk it out!</h2>
      <p className="mt-2 mb-8 text-sm leading-relaxed text-slate-400">
        Ask questions, compare clues, and work out who received the different word.
      </p>

      {timerMode === 'timed' ? (
        <>
          <div className="mb-8 inline-block rounded-3xl border border-white/10 bg-slate-950/50 px-10 py-6 shadow-inner shadow-black/20">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Time Left
            </span>
            <span className={`font-mono text-5xl font-black tracking-tight ${
              timer < 10 ? 'animate-pulse text-rose-400' : 'text-violet-100'
            }`}>
              00:{timer < 10 ? `0${timer}` : timer}
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
            <span className="mr-2">🔒</span>
            {isLocalMode
              ? 'The Imposter reveal will appear when the timer reaches zero.'
              : 'Voting will begin when the timer reaches zero.'}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-5">
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">
              No Timer
            </span>
            <p className="mt-2 text-sm text-slate-400">Take as long as the group needs.</p>
          </div>
          {isLocalMode || lobbyMode === 'HOST' ? (
            <button
              type="button"
              onClick={onManualEnd}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
            >
              {isLocalMode ? 'Continue to Imposter Reveal' : 'Start Voting'}
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
              Waiting for the host to start voting...
            </div>
          )}
        </>
      )}
    </GameScreen>
  )
}

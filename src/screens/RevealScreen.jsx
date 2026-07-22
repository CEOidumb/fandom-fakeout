import GameScreen from '../components/GameScreen'

export default function RevealScreen({
  isLocalMode,
  playerRoles,
  revealIndex,
  setRevealIndex,
  isHolding,
  setIsHolding,
  onLocalRevealComplete,
  onlineNickname,
  lobbyMode,
  onlinePlayers,
  onBeginOnlineDiscussion,
}) {
  if (isLocalMode) {
    const currentPlayer = playerRoles[revealIndex]
    const isLastPlayer = revealIndex === playerRoles.length - 1

    return (
      <GameScreen>
        <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200">
          Pass &amp; Play
        </span>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-200">
          {currentPlayer?.name}&apos;s Turn
        </h2>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-slate-400">
          Hand the device to {currentPlayer?.name}. Press and hold the card below to sneak a peek.
        </p>
        <div
          onMouseDown={() => setIsHolding(true)}
          onMouseUp={() => setIsHolding(false)}
          onMouseLeave={() => setIsHolding(false)}
          onTouchStart={() => setIsHolding(true)}
          onTouchEnd={() => setIsHolding(false)}
          className={`flex h-48 w-full cursor-pointer select-none flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-300 ${
            isHolding
              ? 'border-violet-400/70 bg-violet-500/10 shadow-lg shadow-violet-950/40'
              : 'border-dashed border-white/15 bg-white/[0.03] hover:border-violet-400/40 hover:bg-violet-500/5'
          }`}
        >
          {isHolding ? (
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {currentPlayer?.role === 'Imposter'
                  ? (currentPlayer?.word ? 'Your hint' : 'Your assignment')
                  : 'Your secret word'}
              </span>
              <span className={`text-3xl font-black ${
                currentPlayer?.role === 'Imposter' ? 'text-rose-300' : 'text-violet-200'
              }`}>
                {currentPlayer?.word || 'No Hint'}
              </span>
              <span className="mt-3 block text-xs font-medium text-slate-400">
                Role: {currentPlayer?.role}
              </span>
              {currentPlayer?.category && (
                <span className="mt-2 block text-sm text-slate-300">
                  <strong className="text-slate-200">Category:</strong>{' '}
                  {currentPlayer.category}
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="mb-3 block text-3xl">👆</span>
              <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                Press &amp; hold to reveal
              </span>
            </div>
          )}
        </div>
        {!isHolding && (
          <button
            type="button"
            onClick={() => {
              if (isLastPlayer) onLocalRevealComplete()
              else setRevealIndex(revealIndex + 1)
            }}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
          >
            {isLastPlayer ? 'Go to Discussion' : 'Next Player →'}
          </button>
        )}
      </GameScreen>
    )
  }

  const myNickname = (
    onlineNickname.trim() || (lobbyMode === 'HOST' ? onlinePlayers[0] : '')
  )
  const currentPlayer = playerRoles.find(
    (player) => player.name.toLowerCase() === myNickname.toLowerCase()
  )

  return (
    <GameScreen>
      <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200">
        Online Multiplayer
      </span>
      <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-200">Your Identity</h2>
      <p className="mt-2 mb-6 text-sm text-slate-400">
        Press and hold the card to reveal your assignment.
      </p>

      <div
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
        className={`mb-8 flex min-h-44 w-full cursor-pointer select-none flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-300 ${
          isHolding
            ? 'border-violet-400/70 bg-violet-500/10 shadow-lg shadow-violet-950/40'
            : 'border-dashed border-white/15 bg-white/[0.03] hover:border-violet-400/40 hover:bg-violet-500/5'
        }`}
      >
        {isHolding && currentPlayer ? (
          <div>
            <span className={`text-4xl font-black ${
              currentPlayer.role === 'Imposter' ? 'text-rose-300' : 'text-violet-200'
            }`}>
              {currentPlayer.word || 'No Hint'}
            </span>
            <span className="mt-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              You are {currentPlayer.role === 'Imposter' ? 'the Imposter' : 'a Civilian'}
            </span>
            {currentPlayer.category && (
              <span className="mt-3 block text-sm text-slate-300">
                <strong className="text-slate-200">Category:</strong>{' '}
                {currentPlayer.category}
              </span>
            )}
          </div>
        ) : (
          <div>
            <span className="mb-3 block text-3xl">👆</span>
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
              Press &amp; hold
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Turn Order
        </h3>
        <ul className="space-y-2">
          {playerRoles.map((player, index) => (
            <li key={`${player.name}-${index}`} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
                {index + 1}
              </span>
              <span className={player.name === currentPlayer?.name
                ? 'font-bold text-violet-200'
                : 'text-slate-300'}
              >
                {player.name} {player.name === currentPlayer?.name && '(You)'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {lobbyMode === 'HOST' ? (
        <button
          type="button"
          onClick={onBeginOnlineDiscussion}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
        >
          Begin Discussion Phase
        </button>
      ) : (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs italic text-slate-400">
          Waiting for the Room Leader to start discussion...
        </div>
      )}
    </GameScreen>
  )
}

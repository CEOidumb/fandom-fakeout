import { useState } from 'react'
import AiLoadingOverlay from '../components/AiLoadingOverlay'
import GameSettingsModal from '../components/GameSettingsModal'
import HowToPlayModal from '../components/HowToPlayModal'
import SyncBadge from '../components/SyncBadge'

function SettingsButton({
  selectionSummary,
  timerMode,
  hintMode,
  categoryDisplayMode,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="my-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left transition hover:border-violet-400/40 hover:bg-violet-500/5"
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-200">Game Settings</span>
        <span className="mt-1 block truncate text-xs text-slate-400">
          {selectionSummary}
        </span>
        <span className="mt-1 block text-xs text-violet-300">
          {timerMode.name} · {hintMode.name} ·{' '}
          {categoryDisplayMode === 'show' ? 'Category shown' : 'Category hidden'}
        </span>
      </span>
      <span className="shrink-0 rounded-xl bg-violet-500/15 px-3 py-2 text-sm font-bold text-violet-200">
        Edit
      </span>
    </button>
  )
}

function NumberedPlayerList({
  players,
  showHostLabels = false,
  currentPlayerName = '',
}) {
  return (
    <ul className={showHostLabels ? 'mb-6 space-y-2' : 'space-y-2 text-left'}>
      {players.map((name, index) => (
        <li
          key={`${name}-${index}`}
          className={`flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-slate-200 ${
            showHostLabels ? 'justify-between gap-2' : 'text-sm'
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
              {index + 1}
            </span>
            <span className="truncate">
              {name}
              {name.toLowerCase() === currentPlayerName.trim().toLowerCase() && (
                <span className="ml-1 text-xs font-semibold text-violet-300">(You)</span>
              )}
            </span>
          </span>
          {showHostLabels && (
            <span className="shrink-0 text-xs font-medium text-violet-300">
              {index === 0 ? 'Host' : 'Joined'}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function LobbyScreen({
  lobbyMode,
  setLobbyMode,
  setIsLocalMode,
  localPlayers,
  localNameInput,
  setLocalNameInput,
  onAddLocalPlayer,
  gameSelectionSummary,
  selectedTimerModeDetails,
  selectedHintModeDetails,
  categoryDisplayMode,
  areGameSettingsValid,
  isSettingsOpen,
  setIsSettingsOpen,
  onSaveSettings,
  categorySelectorProps,
  isGeneratingWordPair,
  selectedWordSource,
  onStartLocalGame,
  onlineNickname,
  setOnlineNickname,
  onCreateOnlineRoom,
  joinCodeInput,
  setJoinCodeInput,
  onJoinOnlineRoom,
  roomCode,
  syncStatus,
  onlinePlayers,
  onStartOnlineGame,
  onLeaveRoom,
}) {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const [didCopyRoomCode, setDidCopyRoomCode] = useState(false)

  const copyRoomCode = async () => {
    if (!roomCode) return

    try {
      await navigator.clipboard.writeText(roomCode)
      setDidCopyRoomCode(true)
      window.setTimeout(() => setDidCopyRoomCode(false), 1500)
    } catch (error) {
      console.error('Could not copy room code:', error)
    }
  }

  return (
    <div className="app-shell relative flex min-h-screen min-h-dvh flex-col items-center overflow-hidden px-4 py-8 text-slate-200 sm:px-6 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 hidden h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px] sm:block" />
        <div className="absolute top-32 -right-24 hidden h-72 w-72 rounded-full bg-indigo-600/20 blur-[120px] sm:block" />
        <div className="absolute -bottom-24 -left-24 hidden h-72 w-72 rounded-full bg-purple-700/15 blur-[120px] sm:block" />
      </div>

      <header className="mb-8 w-full max-w-md text-center sm:mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200">
          🎮 Party Game
        </span>
        <h1 className="mt-5 bg-gradient-to-br from-violet-200 via-violet-300 to-indigo-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          FANDOM FAKEOUT
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-slate-400">
          Everyone gets a word. One is different. Spot the imposter before time runs out.
        </p>
        <button
          type="button"
          onClick={() => setIsHowToPlayOpen(true)}
          className="mt-4 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/15"
        >
          How to Play
        </button>
      </header>

      <div className="w-full max-w-md">
        {['CHOOSE', 'LOCAL', 'ONLINE'].includes(lobbyMode) && (
          <div className="space-y-5">
            {lobbyMode === 'CHOOSE' && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-7 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">
                    Choose Mode
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-200 sm:text-2xl">
                    How do you want to play?
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Play together on one device or create an online room.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocalMode(true)
                      setLobbyMode('LOCAL')
                    }}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-violet-400/50 hover:bg-violet-500/5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">
                      📱
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-slate-200">
                        Pass &amp; Play
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-400">
                        Share one device and reveal roles one at a time.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-violet-300"
                    >
                      →
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocalMode(false)
                      setLobbyMode('ONLINE')
                    }}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-violet-400/50 hover:bg-violet-500/5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">
                      🌐
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-slate-200">
                        Online Multiplayer
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-400">
                        Create a room or join friends with a room code.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-violet-300"
                    >
                      →
                    </span>
                  </button>
                </div>
              </div>
            )}

            {lobbyMode !== 'CHOOSE' && (
              <button
                type="button"
                onClick={() => setLobbyMode('CHOOSE')}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                <span aria-hidden="true">←</span> Back to modes
              </button>
            )}

            {lobbyMode === 'LOCAL' && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-7 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">
                    📱
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-200">Pass &amp; Play</h2>
                    <p className="text-xs text-slate-400">
                      Add at least 3 players on this device.
                    </p>
                  </div>
                </div>
                <form onSubmit={onAddLocalPlayer} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter friend's name..."
                    value={localNameInput}
                    onChange={(event) => setLocalNameInput(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
                  >
                    Add
                  </button>
                </form>
                {localPlayers.length > 0 && (
                  <div className="mb-5">
                    <NumberedPlayerList players={localPlayers} />
                  </div>
                )}
                <SettingsButton
                  selectionSummary={gameSelectionSummary}
                  timerMode={selectedTimerModeDetails}
                  hintMode={selectedHintModeDetails}
                  categoryDisplayMode={categoryDisplayMode}
                  onClick={() => setIsSettingsOpen(true)}
                />
                <button
                  type="button"
                  onClick={onStartLocalGame}
                  disabled={localPlayers.length < 3 || isGeneratingWordPair || !areGameSettingsValid}
                  className={`w-full rounded-2xl py-4 text-center font-bold transition-all ${
                    localPlayers.length >= 3 && !isGeneratingWordPair && areGameSettingsValid
                      ? 'cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500'
                      : 'cursor-not-allowed bg-white/5 text-slate-500'
                  }`}
                >
                  {isGeneratingWordPair && selectedWordSource === 'ai'
                    ? 'Gemini is making a fresh pair...'
                    : 'Start Local Game'}
                </button>
                {!areGameSettingsValid && (
                  <p className="mt-3 text-center text-xs text-amber-300">
                    Finish the custom category and topic in Game Settings.
                  </p>
                )}
              </div>
            )}

            {lobbyMode === 'ONLINE' && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-7 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">
                    🌐
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-200">Online Multiplayer</h2>
                    <p className="text-xs text-slate-400">
                      Host a new room or join with a code.
                    </p>
                  </div>
                </div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Nickname
                </span>
                <input
                  type="text"
                  placeholder="Your online nickname..."
                  value={onlineNickname}
                  onChange={(event) => setOnlineNickname(event.target.value)}
                  className="mb-4 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
                <button
                  type="button"
                  onClick={onCreateOnlineRoom}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
                >
                  👑 Create Online Room
                </button>
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] uppercase tracking-widest text-slate-500">
                    or join
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <form onSubmit={onJoinOnlineRoom} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Room Code"
                    value={joinCodeInput}
                    onChange={(event) => setJoinCodeInput(event.target.value)}
                    maxLength={4}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center font-mono uppercase text-white placeholder:text-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-bold text-white transition hover:border-violet-400/50 hover:bg-violet-500/10"
                  >
                    Join
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {lobbyMode === 'HOST' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-7 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
            <div className="mb-6 text-center">
              <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200">
                Hosting
              </span>
              <p className="mt-5 text-[11px] uppercase tracking-widest text-slate-500">
                Room Code
              </p>
              <p className="mt-1 bg-gradient-to-br from-violet-200 to-indigo-400 bg-clip-text font-mono text-5xl font-black tracking-[0.3em] text-transparent sm:text-6xl">
                {roomCode}
              </p>
              <button
                type="button"
                onClick={copyRoomCode}
                className="mt-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
              >
                {didCopyRoomCode ? 'Room Code Copied' : 'Copy Room Code'}
              </button>
              <p className="mt-3"><SyncBadge status={syncStatus} /></p>
            </div>
            <div className="mb-4 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4 text-left">
              <span className="block text-sm font-bold text-violet-200">You are the host</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                Share the code, choose the settings, and launch when everyone has joined.
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Players
              </span>
              <span className={`text-xs font-bold ${
                onlinePlayers.length >= 3 ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {onlinePlayers.length} joined · 3 minimum
              </span>
            </div>
            <NumberedPlayerList
              players={onlinePlayers}
              showHostLabels
              currentPlayerName={onlineNickname}
            />
            <SettingsButton
              selectionSummary={gameSelectionSummary}
              timerMode={selectedTimerModeDetails}
              hintMode={selectedHintModeDetails}
              categoryDisplayMode={categoryDisplayMode}
              onClick={() => setIsSettingsOpen(true)}
            />
            <button
              type="button"
              onClick={onStartOnlineGame}
              disabled={onlinePlayers.length < 3 || isGeneratingWordPair || !areGameSettingsValid}
              className={`w-full rounded-2xl py-4 font-bold transition-all ${
                onlinePlayers.length >= 3 && !isGeneratingWordPair && areGameSettingsValid
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500'
                  : 'cursor-not-allowed bg-white/5 text-slate-500'
              }`}
            >
              {isGeneratingWordPair && selectedWordSource === 'ai'
                ? 'Gemini is making a fresh pair...'
                : 'Launch Game'}
            </button>
            {onlinePlayers.length < 3 && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Waiting for {3 - onlinePlayers.length} more{' '}
                {3 - onlinePlayers.length === 1 ? 'player' : 'players'}.
              </p>
            )}
            {onlinePlayers.length >= 3 && !areGameSettingsValid && (
              <p className="mt-3 text-center text-xs text-amber-300">
                Finish the custom category and topic before launching.
              </p>
            )}
            <button
              type="button"
              onClick={onLeaveRoom}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3 font-bold text-slate-400 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            >
              Leave and Close Room
            </button>
          </div>
        )}

        {lobbyMode === 'JOIN' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-7 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
            <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200">
              Guest
            </span>
            <p className="mt-5 text-[11px] uppercase tracking-widest text-slate-500">
              Room Code
            </p>
            <p className="mt-1 bg-gradient-to-br from-violet-200 to-indigo-400 bg-clip-text font-mono text-5xl font-black tracking-[0.3em] text-transparent">
              {roomCode}
            </p>
            <p className="mt-3"><SyncBadge status={syncStatus} /></p>
            <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4 text-left">
              <span className="block text-sm font-bold text-violet-200">
                You joined as {onlineNickname}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                You are a guest. The host controls settings and starts each round.
              </span>
            </div>
            <div className="my-6 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <span className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
              </span>
              <p className="text-sm text-slate-400">
                Waiting for the Room Leader to launch...
              </p>
            </div>
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left">
              <span className="block text-[11px] uppercase tracking-widest text-slate-500">
                Selected category
              </span>
              <span className="mt-1 block font-bold text-violet-200 break-words">
                {gameSelectionSummary}
              </span>
              <span className="mt-3 block text-[11px] uppercase tracking-widest text-slate-500">
                Round timer
              </span>
              <span className="mt-1 block text-sm font-bold text-slate-200">
                {selectedTimerModeDetails.name}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Players
              </span>
              <span className="text-xs font-bold text-slate-400">
                {onlinePlayers.length} joined
              </span>
            </div>
            <NumberedPlayerList
              players={onlinePlayers}
              currentPlayerName={onlineNickname}
            />
            <button
              type="button"
              onClick={onLeaveRoom}
              className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3 font-bold text-slate-400 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            >
              Leave Room
            </button>
          </div>
        )}
      </div>

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onSaveSettings}
        categorySelectorProps={categorySelectorProps}
      />
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
      <AiLoadingOverlay
        isOpen={isGeneratingWordPair && selectedWordSource === 'ai'}
        selectionSummary={gameSelectionSummary}
      />
    </div>
  )
}

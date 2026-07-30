import { useEffect, useRef, useState } from 'react'
import GameScreen from '../components/GameScreen'
import {
  formatStopwatchTime,
  TIME_TRIAL_MAX_CENTISECONDS,
} from '../utils/timeTarget'

export default function TimeTrialScreen({ players, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsedCentiseconds, setElapsedCentiseconds] = useState(0)
  const [stopwatchState, setStopwatchState] = useState('ready')
  const [attempts, setAttempts] = useState([])
  const animationFrameRef = useRef(null)
  const startedAtRef = useRef(null)

  const currentPlayer = players[currentIndex]
  const isLastPlayer = currentIndex === players.length - 1

  useEffect(() => () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const updateStopwatch = (now) => {
    const nextCentiseconds = Math.min(
      TIME_TRIAL_MAX_CENTISECONDS,
      Math.floor((now - startedAtRef.current) / 10)
    )

    setElapsedCentiseconds(nextCentiseconds)

    if (nextCentiseconds >= TIME_TRIAL_MAX_CENTISECONDS) {
      setStopwatchState('stopped')
      animationFrameRef.current = null
      return
    }

    animationFrameRef.current = requestAnimationFrame(updateStopwatch)
  }

  const startStopwatch = () => {
    startedAtRef.current = performance.now()
    setElapsedCentiseconds(0)
    setStopwatchState('running')
    animationFrameRef.current = requestAnimationFrame(updateStopwatch)
  }

  const stopStopwatch = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const finalCentiseconds = Math.min(
      TIME_TRIAL_MAX_CENTISECONDS,
      Math.floor((performance.now() - startedAtRef.current) / 10)
    )

    setElapsedCentiseconds(finalCentiseconds)
    setStopwatchState('stopped')
  }

  const continueToNextPlayer = () => {
    const nextAttempts = [
      ...attempts,
      {
        name: currentPlayer.name,
        centiseconds: elapsedCentiseconds,
      },
    ]

    if (isLastPlayer) {
      onComplete(nextAttempts)
      return
    }

    setAttempts(nextAttempts)
    setCurrentIndex((index) => index + 1)
    setElapsedCentiseconds(0)
    setStopwatchState('ready')
  }

  return (
    <GameScreen>
      <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-200">
        Time Target
      </span>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
        Player {currentIndex + 1} of {players.length}
      </p>
      <h2 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-200">
        {currentPlayer?.name}&apos;s Turn
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {stopwatchState === 'ready'
          ? `Hand the device to ${currentPlayer?.name}. Start when they are ready.`
          : stopwatchState === 'running'
            ? 'Stop the clock when you think your target appears.'
            : 'Time locked. Let the group see where you stopped.'}
      </p>

      <div className="relative my-8">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors ${
            stopwatchState === 'running' ? 'bg-cyan-500/20' : 'bg-violet-500/15'
          }`}
        />
        <div className={`relative rounded-3xl border bg-slate-950/60 px-4 py-8 shadow-inner shadow-black/30 transition-all ${
          stopwatchState === 'running'
            ? 'border-cyan-400/40'
            : stopwatchState === 'stopped'
              ? 'border-violet-400/40'
              : 'border-white/10'
        }`}>
          <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
            {stopwatchState === 'stopped' ? 'Stopped At' : 'Stopwatch'}
          </span>
          <span className={`mt-2 block font-mono text-6xl font-black tracking-tight tabular-nums sm:text-7xl ${
            stopwatchState === 'running' ? 'text-cyan-200' : 'text-violet-100'
          }`}>
            {formatStopwatchTime(elapsedCentiseconds)}
          </span>
        </div>
      </div>

      {stopwatchState !== 'stopped' ? (
        <button
          type="button"
          onClick={stopwatchState === 'running' ? stopStopwatch : startStopwatch}
          className={`w-full rounded-2xl px-6 py-4 font-black text-white shadow-lg transition ${
            stopwatchState === 'running'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-950/40 hover:from-rose-500 hover:to-pink-500'
              : 'bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-cyan-950/40 hover:from-cyan-500 hover:to-indigo-500'
          }`}
        >
          {stopwatchState === 'running' ? 'Stop Timer' : 'Start Timer'}
        </button>
      ) : (
        <button
          type="button"
          onClick={continueToNextPlayer}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-black text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-500 hover:to-indigo-500"
        >
          {isLastPlayer ? 'Compare Everyone’s Times' : `Next Player: ${players[currentIndex + 1]?.name}`}
        </button>
      )}

      <div className="mt-6 flex justify-center gap-2" aria-label="Turn progress">
        {players.map((player, index) => (
          <span
            key={`${player.name}-${index}`}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-6 bg-cyan-400'
                : index < currentIndex
                  ? 'w-2 bg-violet-400'
                  : 'w-2 bg-white/10'
            }`}
          />
        ))}
      </div>
    </GameScreen>
  )
}

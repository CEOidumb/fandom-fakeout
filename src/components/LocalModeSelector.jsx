import { LOCAL_GAME_MODES } from '../config/gameOptions'

export default function LocalModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="my-6 text-left">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <span className="block text-sm font-bold text-slate-200">Local Game Mode</span>
          <span className="mt-1 block text-xs text-slate-400">
            Choose how this Pass &amp; Play round works.
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
          Local only
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LOCAL_GAME_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-violet-400/70 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 shadow-lg shadow-violet-950/25'
                  : 'border-white/10 bg-slate-950/35 hover:border-violet-400/35 hover:bg-violet-500/5'
              }`}
            >
              <span className={`block text-sm font-bold ${
                isSelected ? 'text-violet-100' : 'text-slate-300'
              }`}>
                {mode.name}
              </span>
              <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                {mode.id === 'word-hunt'
                  ? 'Clues, discussion, reveal.'
                  : 'Private target, stopwatch turns.'}
              </span>
            </button>
          )
        })}
      </div>

      {selectedMode === 'time-target' && (
        <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            How Time Target works
          </span>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Civilians see an exact target from 01.00–20.00. The Imposter only sees
            a nearby range. Everyone gets one chance to stop the clock.
          </p>
        </div>
      )}
    </div>
  )
}

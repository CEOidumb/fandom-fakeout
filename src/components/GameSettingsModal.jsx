import CategorySelector from './CategorySelector'

export default function GameSettingsModal({
  isOpen,
  onClose,
  onSave,
  categorySelectorProps,
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="game-settings-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-violet-950/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">
              Room Setup
            </span>
            <h2 id="game-settings-title" className="mt-1 text-2xl font-black text-slate-200">
              Game Settings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Change how the next round will play.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close game settings"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-violet-400/40 hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        <CategorySelector {...categorySelectorProps} />

        <button
          type="button"
          onClick={onSave}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
        >
          Save Settings
        </button>
      </section>
    </div>
  )
}

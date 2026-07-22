export default function AiLoadingOverlay({ isOpen, selectionSummary }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] grid min-h-screen min-h-dvh place-items-center bg-slate-950/95 px-6 text-slate-200 sm:bg-slate-950/85 sm:backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Gemini is creating the round"
    >
      <div className="w-full max-w-sm rounded-3xl border border-violet-400/20 bg-slate-900 p-7 text-center shadow-xl shadow-violet-950/30 sm:bg-slate-900/90">
        <div className="relative mx-auto grid h-20 w-20 place-items-center">
          <div className="absolute inset-0 rounded-full border border-violet-400/20" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-violet-400 border-r-indigo-400" />
          <span className="text-2xl" aria-hidden="true">✦</span>
        </div>

        <span className="mt-5 block text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">
          Creating your round
        </span>
        <h2 className="mt-2 text-2xl font-black text-slate-100">
          Gemini is choosing the clues
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Building a fresh word and a balanced hint for this group.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Topic
          </span>
          <span className="mt-1 block truncate text-sm font-bold text-violet-200">
            {selectionSummary}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
        </div>
        <p className="mt-3 text-xs text-slate-500">This may take a few seconds.</p>
      </div>
    </div>
  )
}

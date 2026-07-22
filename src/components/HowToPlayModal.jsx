export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const steps = [
    {
      number: '1',
      title: 'Choose a topic',
      description: 'Pick from the library, choose Random, or type any custom category and topic your group knows.',
    },
    {
      number: '2',
      title: 'Reveal your secret',
      description: 'Civilians receive the same word. The Imposter receives a related hint unless the host turns hints off.',
    },
    {
      number: '3',
      title: 'Talk without giving it away',
      description: 'Ask questions and give clues, but do not say the secret word directly.',
    },
    {
      number: '4',
      title: 'Find the Imposter',
      description: 'Online players vote on their own screens. Pass & Play reveals the Imposter together.',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="how-to-play-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-violet-950/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">
              Quick Guide
            </span>
            <h2 id="how-to-play-title" className="mt-1 text-2xl font-black text-slate-200">
              How to Play
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Learn the whole game in about 20 seconds.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close how to play"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xl text-slate-400 transition hover:border-violet-400/40 hover:text-white"
          >
            &times;
          </button>
        </div>

        <ol className="my-6 space-y-3 text-left">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-black text-violet-300">
                {step.number}
              </span>
              <span>
                <span className="block font-bold text-slate-200">{step.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-400">
                  {step.description}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 text-left">
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
            How to win
          </span>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Civilians win by voting out the Imposter. The Imposter wins if a Civilian is
            voted out, the vote ties, or nobody votes.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
        >
          Got It
        </button>
      </section>
    </div>
  )
}

export default function GameScreen({ children }) {
  return (
    <div className="app-shell relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden px-4 py-10 text-slate-200 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 hidden h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px] sm:block" />
        <div className="absolute top-1/3 -right-24 hidden h-72 w-72 rounded-full bg-indigo-600/20 blur-[120px] sm:block" />
        <div className="absolute -bottom-24 -left-24 hidden h-72 w-72 rounded-full bg-purple-700/15 blur-[120px] sm:block" />
      </div>
      <main className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-lg shadow-violet-950/30 sm:bg-slate-900/60 sm:p-8 sm:shadow-2xl sm:shadow-violet-950/50 sm:backdrop-blur-xl">
        {children}
      </main>
    </div>
  )
}

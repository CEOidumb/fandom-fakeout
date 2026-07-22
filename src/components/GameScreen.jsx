export default function GameScreen({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-200 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-700/15 blur-[120px]" />
      </div>
      <main className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-2xl shadow-violet-950/50 backdrop-blur-xl sm:p-8">
        {children}
      </main>
    </div>
  )
}

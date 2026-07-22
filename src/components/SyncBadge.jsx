export default function SyncBadge({ status }) {
  if (status === 'live') {
    return <span className="text-xs text-emerald-400">🟢 Live sync</span>
  }

  if (status === 'polling') {
    return <span className="text-xs text-amber-400">🟡 Polling sync</span>
  }

  if (status === 'error') {
    return <span className="text-xs text-rose-400">🔴 Sync error</span>
  }

  return <span className="text-xs text-slate-500">⏳ Connecting...</span>
}

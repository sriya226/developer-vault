export default function StatsCard({ icon: Icon, label, value, loading, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-navy-700" aria-label="Loading" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

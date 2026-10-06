export function CardSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="h-40 rounded-t-2xl bg-slate-200 dark:bg-navy-700" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-navy-700" />
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-navy-700" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-navy-700" />
        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-navy-700" />
        <div className="flex gap-2 pt-1"><div className="h-5 w-16 rounded bg-slate-200 dark:bg-navy-700" /><div className="h-5 w-20 rounded bg-slate-200 dark:bg-navy-700" /></div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading resources">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

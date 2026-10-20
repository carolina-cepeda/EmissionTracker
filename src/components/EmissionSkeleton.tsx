export function EmissionSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pulse rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-6 h-7 w-1/2 rounded bg-slate-200" />
      <span className="sr-only">Cargando emisiones…</span>
    </div>
  );
}

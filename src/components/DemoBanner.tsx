export function DemoBanner() {
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200"
    >
      <span className="font-semibold">Modo demo</span>
      <span className="text-amber-800">
        Los datos son locales y de ejemplo; no se guardan en Supabase.
        Añade <code className="rounded bg-amber-100 px-1">error</code> al nombre para simular un fallo.
      </span>
    </div>
  );
}

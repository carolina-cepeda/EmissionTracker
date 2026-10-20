import { memo } from 'react';
import { Badge } from './ui/Badge';
import type { Emission, EmissionCategory } from '../types/emission';
import { cn } from '../lib/cn';

const CATEGORY_STYLES: Record<EmissionCategory, string> = {
  Transporte: 'bg-sky-100 text-sky-800',
  Energía: 'bg-amber-100 text-amber-900',
  Residuos: 'bg-emerald-100 text-emerald-800',
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const numberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface EmissionCardProps {
  emission: Emission;
  pending?: boolean;
}

function EmissionCardComponent({ emission, pending = false }: EmissionCardProps) {
  const { id, source_name, category, co2_kg, created_at } = emission;

  return (
    <article
      aria-busy={pending}
      className={cn(
        'flex h-full flex-col justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md',
        pending && 'opacity-70',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900" title={source_name}>
            {source_name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {dateFormatter.format(new Date(created_at))}
          </p>
        </div>
        <Badge className={CATEGORY_STYLES[category]}>{category}</Badge>
      </header>

      <footer className="flex items-end justify-between">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {numberFormatter.format(co2_kg)}
          <span className="ml-1 text-sm font-medium text-slate-500">kg CO₂</span>
        </p>
        {pending && (
          <span className="text-xs font-medium text-amber-700">Guardando…</span>
        )}
      </footer>
      <span className="sr-only">Identificador: {id}</span>
    </article>
  );
}

export const EmissionCard = memo(EmissionCardComponent);

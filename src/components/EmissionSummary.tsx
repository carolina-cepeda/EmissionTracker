import { EMISSION_CATEGORIES } from '../types/emission';
import type { EmissionCategory } from '../types/emission';

const numberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface EmissionSummaryProps {
  totalKg: number;
  sourceCount: number;
  byCategory: Record<EmissionCategory, number>;
}

export function EmissionSummary({
  totalKg,
  sourceCount,
  byCategory,
}: EmissionSummaryProps) {
  return (
    <section
      aria-labelledby="summary-heading"
      className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg sm:p-8"
    >
      <h2 id="summary-heading" className="text-sm font-medium uppercase tracking-wider text-emerald-100">
        Impacto acumulado
      </h2>

      <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {numberFormatter.format(totalKg)}
        <span className="ml-2 text-lg font-medium text-emerald-100">kg CO₂</span>
      </p>
      <p className="mt-1 text-sm text-emerald-100">
        {sourceCount} {sourceCount === 1 ? 'fuente registrada' : 'fuentes registradas'}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {EMISSION_CATEGORIES.map((category) => (
          <div
            key={category}
            className="rounded-xl bg-white/10 p-3 ring-1 ring-inset ring-white/20"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-emerald-100">
              {category}
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {numberFormatter.format(byCategory[category])}
              <span className="ml-1 text-xs font-normal text-emerald-100">kg</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

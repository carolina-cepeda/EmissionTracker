import { useMemo } from 'react';
import { useEmissions } from '../hooks/useEmissions';
import { isMockMode } from '../lib/supabaseClient';
import { EmissionForm } from './EmissionForm';
import { EmissionList } from './EmissionList';
import { EmissionSummary } from './EmissionSummary';
import { DemoBanner } from './DemoBanner';
import {
  EMISSION_CATEGORIES,
  type EmissionCategory,
} from '../types/emission';

export function EmissionsTracker() {
  const { emissions, loading, error, submitting, addEmission, refresh } =
    useEmissions();

  const { totalKg, byCategory } = useMemo(() => {
    const totals = EMISSION_CATEGORIES.reduce(
      (acc, category) => ({ ...acc, [category]: 0 }),
      {} as Record<EmissionCategory, number>,
    );

    let total = 0;
    for (const emission of emissions) {
      total += emission.co2_kg;
      totals[emission.category] += emission.co2_kg;
    }

    return { totalKg: total, byCategory: totals };
  }, [emissions]);

  const loadError = error?.scope === 'load' ? error : null;
  const submitError = error?.scope === 'submit' ? error : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard de emisiones
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Seguimiento en tiempo real de la huella de carbono de tu organización.
        </p>
      </header>

      {isMockMode && <DemoBanner />}

      <div className="flex flex-col gap-8">
        <EmissionSummary
          totalKg={totalKg}
          sourceCount={emissions.length}
          byCategory={byCategory}
        />

        <EmissionForm
          onSubmit={addEmission}
          submitting={submitting}
          errorMessage={submitError?.message ?? null}
        />

        <section aria-labelledby="list-heading">
          <h2 id="list-heading" className="mb-4 text-lg font-semibold text-slate-900">
            Fuentes de emisión
          </h2>
          <EmissionList
            emissions={emissions}
            loading={loading}
            error={loadError}
            onRetry={() => void refresh()}
          />
        </section>
      </div>
    </main>
  );
}

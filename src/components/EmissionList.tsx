import { EmissionCard } from './EmissionCard';
import { EmissionSkeleton } from './EmissionSkeleton';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import type { Emission, EmissionError } from '../types/emission';

interface EmissionListProps {
  emissions: Emission[];
  loading: boolean;
  error: EmissionError | null;
  onRetry: () => void;
}

export function EmissionList({
  emissions,
  loading,
  error,
  onRetry,
}: EmissionListProps) {
  if (loading) {
    return (
      <div aria-live="polite" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <EmissionSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <p className="font-medium">{error.message}</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  if (emissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-900">Aún no hay emisiones registradas</p>
        <p className="mt-1 text-sm text-slate-500">
          Añade tu primera medición con el formulario para empezar a monitorizar.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {emissions.map((emission) => (
        <li key={emission.id}>
          <EmissionCard emission={emission} pending={emission.id.startsWith('optimistic-')} />
        </li>
      ))}
    </ul>
  );
}

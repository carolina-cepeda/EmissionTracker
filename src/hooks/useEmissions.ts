import { useCallback, useEffect, useRef, useState } from 'react';
import { createEmission, listEmissions } from '../lib/emissionsRepository';
import type {
  Emission,
  EmissionError,
  EmissionErrorScope,
  NewEmission,
  UseEmissionsResult,
} from '../types/emission';

const INITIAL_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Inténtalo de nuevo.';

function isEmissionError(value: unknown): value is EmissionError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value &&
    'scope' in value &&
    typeof (value as EmissionError).message === 'string'
  );
}

function toEmissionError(cause: unknown, scope: EmissionErrorScope): EmissionError {
  if (isEmissionError(cause)) return cause;
  if (cause instanceof TypeError) {
    return {
      kind: 'network',
      message:
        'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      detail: cause.message,
      scope,
    };
  }
  return {
    kind: 'unknown',
    message: INITIAL_ERROR_MESSAGE,
    detail: cause instanceof Error ? cause.message : String(cause),
    scope,
  };
}

function validate(input: NewEmission): string | null {
  if (!input.source_name.trim()) return 'Indica el nombre de la fuente.';
  if (!Number.isFinite(input.co2_kg) || input.co2_kg <= 0) {
    return 'El CO₂ debe ser un número mayor que 0.';
  }
  return null;
}

export function useEmissions(): UseEmissionsResult {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<EmissionError | null>(null);

  /** Evita actualizar el estado después del desmontaje del componente. */
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listEmissions();
      if (!isMounted.current) return;
      setEmissions(rows);
    } catch (cause) {
      if (!isMounted.current) return;
      setError(toEmissionError(cause, 'load'));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addEmission = useCallback(
    async (input: NewEmission): Promise<boolean> => {
      const invalid = validate(input);
      if (invalid) {
        setError({ kind: 'validation', message: invalid, scope: 'submit' });
        return false;
      }

      setSubmitting(true);
      setError(null);

      const temporaryId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Emission = {
        id: temporaryId,
        source_name: input.source_name.trim(),
        category: input.category,
        co2_kg: input.co2_kg,
        created_at: new Date().toISOString(),
      };

      setEmissions((prev) => [optimistic, ...prev]);

      try {
        const created = await createEmission({
          source_name: input.source_name,
          category: input.category,
          co2_kg: input.co2_kg,
        });
        if (!isMounted.current) return false;

        setEmissions((prev) =>
          prev.map((item) => (item.id === temporaryId ? created : item)),
        );
        return true;
      } catch (cause) {
        if (isMounted.current) {
          setEmissions((prev) => prev.filter((item) => item.id !== temporaryId));
          setError(toEmissionError(cause, 'submit'));
        }
        return false;
      } finally {
        if (isMounted.current) setSubmitting(false);
      }
    },
    [],
  );

  return { emissions, loading, error, submitting, addEmission, refresh };
}

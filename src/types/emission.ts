export const EMISSION_CATEGORIES = ['Transporte', 'Energía', 'Residuos'] as const;

export type EmissionCategory = (typeof EMISSION_CATEGORIES)[number];

export interface Emission {
  id: string;
  source_name: string;
  category: EmissionCategory;
  co2_kg: number;
  created_at: string;
}

export interface NewEmission {
  source_name: string;
  category: EmissionCategory;
  co2_kg: number;
}

export type EmissionFieldErrors = Partial<Record<keyof NewEmission, string>>;

export type EmissionErrorKind =
  | 'network'
  | 'not_found'
  | 'permission'
  | 'validation'
  | 'unknown';

export type EmissionErrorScope = 'load' | 'submit';

export interface EmissionError {
  kind: EmissionErrorKind;
  /** Mensaje legible en español para el usuario final. */
  message: string;
  /** Detalle técnico, no mostrado por defecto en la UI. */
  detail?: string;
  /** Origen del error: fallo de carga o fallo al enviar el formulario. */
  scope: EmissionErrorScope;
}

export interface UseEmissionsResult {
  emissions: Emission[];
  loading: boolean;
  error: EmissionError | null;
  submitting: boolean;
  addEmission: (input: NewEmission) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function isEmissionCategory(value: unknown): value is EmissionCategory {
  return (
    typeof value === 'string' &&
    (EMISSION_CATEGORIES as readonly string[]).includes(value)
  );
}

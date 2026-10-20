import { getSupabase, isMockMode } from './supabaseClient';
import { createEmissionMock, listEmissionsMock } from './mockEmissions';
import type {
  Emission,
  EmissionCategory,
  EmissionError,
  EmissionErrorScope,
  NewEmission,
} from '../types/emission';
import { isEmissionCategory } from '../types/emission';
import type { Database } from '../types/database';

type EmissionRow = Database['public']['Tables']['emissions']['Row'];

const POSTGREST_CODES: Record<string, EmissionError['kind']> = {
  '42501': 'permission',
  PGRST116: 'not_found',
  '23505': 'validation',
  '23502': 'validation',
  '23503': 'validation',
  '22P02': 'validation',
};

const DEFAULT_MESSAGES: Record<EmissionError['kind'], string> = {
  network: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  not_found: 'No encontramos el recurso solicitado.',
  permission: 'No tienes permisos para realizar esta acción.',
  validation: 'Los datos enviados no son válidos. Revisa el formulario.',
  unknown: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
};

/** Convierte un `PostgrestError` en un error de dominio tipado. */
export function mapSupabaseError(
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
  scope: EmissionErrorScope = 'load',
): EmissionError {
  const kind: EmissionError['kind'] =
    (error.code ? POSTGREST_CODES[error.code] : undefined) ?? 'unknown';
  const detail = error.message ?? error.hint ?? error.details ?? undefined;

  return {
    kind,
    message: DEFAULT_MESSAGES[kind],
    ...(detail ? { detail } : {}),
    scope,
  };
}

/** Normaliza una fila de la BD al modelo de dominio. */
function toEmission(row: EmissionRow): Emission {
  const co2 = Number(row.co2_kg);

  if (!isEmissionCategory(row.category)) {
    throw new Error(`Categoría desconocida en la base de datos: "${row.category}"`);
  }

  return {
    id: row.id,
    source_name: row.source_name,
    category: row.category,
    co2_kg: Number.isFinite(co2) ? co2 : 0,
    created_at: row.created_at,
  };
}

export async function listEmissions(): Promise<Emission[]> {
  if (isMockMode) return listEmissionsMock();

  const { data, error } = await getSupabase()
    .from('emissions')
    .select('id, source_name, category, co2_kg, created_at')
    .order('created_at', { ascending: false });

  if (error) throw mapSupabaseError(error);

  return (data ?? []).map(toEmission);
}

export async function createEmission(input: NewEmission): Promise<Emission> {
  if (isMockMode) return createEmissionMock(input);

  const payload: Database['public']['Tables']['emissions']['Insert'] = {
    source_name: input.source_name.trim(),
    category: input.category,
    co2_kg: input.co2_kg,
  };

  const { data, error } = await getSupabase()
    .from('emissions')
    .insert(payload)
    .select('id, source_name, category, co2_kg, created_at')
    .single();

  if (error) throw mapSupabaseError(error, 'submit');
  if (!data) throw mapSupabaseError({ message: 'La inserción no devolvió datos.' }, 'submit');

  return toEmission(data);
}

export function isCategory(value: unknown): value is EmissionCategory {
  return isEmissionCategory(value);
}

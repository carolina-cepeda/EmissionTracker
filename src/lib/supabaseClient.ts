import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const forcedMock = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Modo demo: sin credenciales (o con VITE_USE_MOCK=true) la app usa un
 * repositorio en memoria y no necesita backend.
 */
export const isMockMode = forcedMock || !supabaseUrl || !supabaseAnonKey;

let client: SupabaseClient<Database> | null = null;

/** Cliente de Supabase bajo demanda. Lanza si se usa sin credenciales. */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env o usa VITE_USE_MOCK=true.',
    );
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

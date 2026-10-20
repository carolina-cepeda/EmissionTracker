export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Tipos mínimos de la tabla `emissions` para que `@supabase/supabase-js`
 * devuelva filas tipadas (evita `any` con `strict: true`).
 * Deben coincidir con el SQL real de la base de datos.
 */
export interface Database {
  public: {
    Tables: {
      emissions: {
        Row: {
          id: string;
          source_name: string;
          category: string;
          co2_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_name: string;
          category: string;
          co2_kg: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_name?: string;
          category?: string;
          co2_kg?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

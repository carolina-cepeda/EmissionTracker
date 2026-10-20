-- Esquema de la tabla `emissions` para Supabase (Postgres).
-- Ejecuta este script en el SQL Editor de tu proyecto.

create table if not exists public.emissions (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  category text not null check (category in ('Transporte', 'Energía', 'Residuos')),
  co2_kg numeric(12, 3) not null check (co2_kg > 0),
  created_at timestamptz not null default now()
);

create index if not exists emissions_created_at_idx
  on public.emissions (created_at desc);

-- Row Level Security: obligatorio para que la anon key no tenga acceso total.
alter table public.emissions enable row level security;

drop policy if exists "emissions_select_anon" on public.emissions;
create policy "emissions_select_anon"
  on public.emissions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "emissions_insert_anon" on public.emissions;
create policy "emissions_insert_anon"
  on public.emissions
  for insert
  to anon, authenticated
  with check (true);

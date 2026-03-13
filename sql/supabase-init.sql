-- V1.3 init script (prototipo)
-- Crea tablas base para sync remoto y snapshot por usuario.

create table if not exists public.user_snapshots (
  user_id text primary key,
  email text not null,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_events (
  id text primary key,
  user_id text not null,
  email text not null,
  entity text not null,
  action text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_events_user_created
  on public.sync_events (user_id, created_at desc);

create index if not exists idx_user_snapshots_updated
  on public.user_snapshots (updated_at desc);

-- Modo prototipo rapido: sin RLS para validar el flujo end-to-end.
alter table public.user_snapshots disable row level security;
alter table public.sync_events disable row level security;


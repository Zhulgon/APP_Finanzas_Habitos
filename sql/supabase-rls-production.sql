-- V1.3 hardening script (produccion)
-- Activa RLS y politicas por correo autenticado en JWT.

alter table public.user_snapshots enable row level security;
alter table public.sync_events enable row level security;

drop policy if exists user_snapshots_select_own on public.user_snapshots;
drop policy if exists user_snapshots_insert_own on public.user_snapshots;
drop policy if exists user_snapshots_update_own on public.user_snapshots;

create policy user_snapshots_select_own
on public.user_snapshots
for select
using (email = (auth.jwt() ->> 'email'));

create policy user_snapshots_insert_own
on public.user_snapshots
for insert
with check (email = (auth.jwt() ->> 'email'));

create policy user_snapshots_update_own
on public.user_snapshots
for update
using (email = (auth.jwt() ->> 'email'))
with check (email = (auth.jwt() ->> 'email'));

drop policy if exists sync_events_select_own on public.sync_events;
drop policy if exists sync_events_insert_own on public.sync_events;

create policy sync_events_select_own
on public.sync_events
for select
using (email = (auth.jwt() ->> 'email'));

create policy sync_events_insert_own
on public.sync_events
for insert
with check (email = (auth.jwt() ->> 'email'));


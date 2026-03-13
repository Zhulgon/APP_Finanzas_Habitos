# Supabase Setup V1.3

Fecha: `2026-03-13` (America/Bogota)

## Objetivo

Habilitar autenticacion por correo (OTP real) y sincronizacion remota multi-dispositivo.

## 1) Variables de entorno

Crear archivo `.env` (o usar variables del entorno) con:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Referencia: `.env.example`.

## 2) Tablas SQL recomendadas

Ejecuta en el SQL editor de Supabase:

```sql
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
```

## 3) Politicas (prototipo)

Para prototipo rapido puedes desactivar RLS en ambas tablas.

Para produccion:

- mantener RLS activa,
- autenticar con token de usuario,
- crear politicas por `auth.uid()` o claim equivalente.

## 4) Flujo en app

1. Pantalla `Auth`: solicita codigo por correo.
2. Verifica codigo OTP real con Supabase.
3. Se crea sesion local persistente.
4. En `Perfil`:
   - `Sincronizar ahora` envia eventos pendientes y snapshot actual.
   - `Traer desde nube` trae snapshot remoto y lo aplica localmente.

## 5) Fallback

Si no hay variables de Supabase:

- auth usa modo local (codigo de desarrollo),
- sync funciona local/offline (cola local),
- la app sigue operativa sin bloqueo.


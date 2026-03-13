# Supabase Setup V1.3

Fecha: `2026-03-13` (America/Bogota)

## Objetivo

Habilitar autenticacion por correo (OTP real) y sincronizacion remota multi-dispositivo.

## 1) Variables de entorno

Genera `.env` automaticamente:

```bash
npm run setup:env
```

Luego abre `.env` y completa:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Referencia: `.env.example`.

## 2) SQL de inicializacion (prototipo)

Ejecuta el contenido de:

- `sql/supabase-init.sql`

## 3) Politicas (prototipo)

Para prototipo rapido puedes desactivar RLS en ambas tablas.

Para produccion:

- mantener RLS activa,
- autenticar con token de usuario,
- crear politicas por `auth.uid()` o claim equivalente.

Script recomendado de hardening:

- `sql/supabase-rls-production.sql`

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

## 6) Comandos de prueba local

```bash
npm run web
```

Abrir:

- `http://localhost:8085`

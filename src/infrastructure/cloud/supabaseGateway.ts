import type { AuthSession } from '../../domain/entities/Auth';
import type { SyncQueueItem } from '../../domain/entities/Sync';
import type { WebState } from '../repositories/web/storage';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface SupabaseVerifyResponse {
  access_token?: string;
  user?: {
    id?: string;
    email?: string;
  };
}

interface SupabaseSnapshotRow {
  snapshot: unknown;
  updated_at?: string;
}

const safeEnv = (): Record<string, string | undefined> => {
  if (typeof process === 'undefined') {
    return {};
  }
  return process.env as Record<string, string | undefined>;
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const env = safeEnv();
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ''),
    anonKey,
  };
};

const buildHeaders = (
  config: SupabaseConfig,
  token?: string,
): Record<string, string> => ({
  apikey: config.anonKey,
  Authorization: `Bearer ${token ?? config.anonKey}`,
  'Content-Type': 'application/json',
});

export const requestSupabaseOtp = async (
  config: SupabaseConfig,
  email: string,
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<{ ok: boolean; message: string }> => {
  if (!fetcher) {
    return {
      ok: false,
      message: 'No hay cliente HTTP disponible para autenticar.',
    };
  }

  const response = await fetcher(`${config.url}/auth/v1/otp`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify({
      email,
      create_user: true,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: `No se pudo enviar OTP (status ${response.status}).`,
    };
  }

  return {
    ok: true,
    message: 'Codigo enviado al correo.',
  };
};

export const verifySupabaseOtp = async (
  config: SupabaseConfig,
  email: string,
  code: string,
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<{
  ok: boolean;
  message: string;
  userId?: string;
  accessToken?: string;
}> => {
  if (!fetcher) {
    return {
      ok: false,
      message: 'No hay cliente HTTP disponible para verificar OTP.',
    };
  }
  const verificationTypes = ['email', 'signup', 'magiclink'] as const;

  for (const type of verificationTypes) {
    const response = await fetcher(`${config.url}/auth/v1/verify`, {
      method: 'POST',
      headers: buildHeaders(config),
      body: JSON.stringify({
        email,
        token: code,
        type,
      }),
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as SupabaseVerifyResponse;
    return {
      ok: true,
      message: 'Sesion iniciada correctamente.',
      userId: payload.user?.id,
      accessToken: payload.access_token,
    };
  }

  return {
    ok: false,
    message: 'Codigo invalido o expirado. Solicita uno nuevo e intenta de inmediato.',
  };
};

export const pushSyncEventsToSupabase = async (
  config: SupabaseConfig,
  session: AuthSession,
  events: SyncQueueItem[],
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<void> => {
  if (!fetcher || events.length === 0) {
    return;
  }

  const response = await fetcher(`${config.url}/rest/v1/sync_events`, {
    method: 'POST',
    headers: {
      ...buildHeaders(config, session.cloudAccessToken),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(
      events.map((event) => ({
        id: event.id,
        user_id: session.userId,
        email: session.email,
        entity: event.entity,
        action: event.action,
        payload: event.payload,
        created_at: event.createdAt,
      })),
    ),
  });

  if (!response.ok) {
    throw new Error(`No se pudo subir eventos de sync (status ${response.status}).`);
  }
};

export const upsertSnapshotToSupabase = async (
  config: SupabaseConfig,
  session: AuthSession,
  snapshot: WebState,
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<void> => {
  if (!fetcher) {
    throw new Error('No hay cliente HTTP disponible para guardar snapshot.');
  }

  const response = await fetcher(
    `${config.url}/rest/v1/user_snapshots?on_conflict=user_id`,
    {
      method: 'POST',
      headers: {
        ...buildHeaders(config, session.cloudAccessToken),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        user_id: session.userId,
        email: session.email,
        snapshot,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`No se pudo guardar snapshot remoto (status ${response.status}).`);
  }
};

export const pullSnapshotFromSupabase = async (
  config: SupabaseConfig,
  session: AuthSession,
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<{ snapshot?: unknown; updatedAt?: string }> => {
  if (!fetcher) {
    return {};
  }

  const userIdFilter = encodeURIComponent(session.userId);
  const response = await fetcher(
    `${config.url}/rest/v1/user_snapshots?select=snapshot,updated_at&user_id=eq.${userIdFilter}&order=updated_at.desc&limit=1`,
    {
      method: 'GET',
      headers: buildHeaders(config, session.cloudAccessToken),
    },
  );

  if (!response.ok) {
    throw new Error(`No se pudo consultar snapshot remoto (status ${response.status}).`);
  }

  const rows = (await response.json()) as SupabaseSnapshotRow[];
  const row = rows[0];
  if (!row) {
    return {};
  }
  return {
    snapshot: row.snapshot,
    updatedAt: row.updated_at,
  };
};

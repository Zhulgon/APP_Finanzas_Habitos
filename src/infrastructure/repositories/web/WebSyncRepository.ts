import type { AuthSession } from '../../../domain/entities/Auth';
import type {
  FlushSyncResult,
  SyncQueueItem,
  SyncSummary,
} from '../../../domain/entities/Sync';
import type {
  EnqueueSyncInput,
  SyncRepository,
} from '../../../domain/repositories/SyncRepository';
import { createId } from '../../../shared/utils/id';
import {
  getSupabaseConfig,
  pullSnapshotFromSupabase,
  pushSyncEventsToSupabase,
  upsertSnapshotToSupabase,
} from '../../cloud/supabaseGateway';
import {
  normalizeWebState,
  readWebState,
  replaceWebState,
  updateWebState,
  type WebState,
} from './storage';

const nowIso = (): string => new Date().toISOString();

export class WebSyncRepository implements SyncRepository {
  async enqueue(input: EnqueueSyncInput): Promise<void> {
    const timestamp = nowIso();
    const nextItem: SyncQueueItem = {
      id: createId('sync'),
      entity: input.entity,
      action: input.action,
      payload: input.payload,
      createdAt: timestamp,
      updatedAt: timestamp,
      attempts: 0,
      status: 'pending',
    };
    updateWebState((state) => ({
      ...state,
      sync: {
        ...state.sync,
        queue: [nextItem, ...state.sync.queue].slice(0, 500),
      },
    }));
  }

  async getSummary(): Promise<SyncSummary> {
    const sync = readWebState().sync;
    const pending = sync.queue.filter((item) => item.status === 'pending').length;
    const synced = sync.queue.filter((item) => item.status === 'synced').length;
    const failed = sync.queue.filter((item) => item.status === 'failed').length;

    return {
      pending,
      synced,
      failed,
      lastSyncedAt: sync.lastSyncedAt || undefined,
      lastStatus: sync.lastStatus,
    };
  }

  async listRecent(limit = 20): Promise<SyncQueueItem[]> {
    return readWebState().sync.queue.slice(0, Math.max(1, limit));
  }

  async pullLatestSnapshot(session: AuthSession | null) {
    if (!session) {
      return {
        ok: false,
        applied: false,
        message: 'No hay sesion activa para traer datos.',
      };
    }

    const state = readWebState();
    const supabase = getSupabaseConfig();
    if (!state.sync.cloudEnabled || !supabase || session.provider === 'guest') {
      return {
        ok: true,
        applied: false,
        message: 'Sync remoto no configurado o sesion invitado.',
      };
    }

    try {
      const remote = await pullSnapshotFromSupabase(supabase, session);
      if (!remote.snapshot || typeof remote.snapshot !== 'object') {
        return {
          ok: true,
          applied: false,
          message: 'No hay snapshot remoto para este usuario.',
        };
      }

      replaceWebState(normalizeWebState(remote.snapshot as Partial<WebState>));
      updateWebState((current) => ({
        ...current,
        sync: {
          ...current.sync,
          lastStatus: 'success',
          lastSyncedAt: remote.updatedAt ?? nowIso(),
        },
      }));

      return {
        ok: true,
        applied: true,
        message: 'Snapshot remoto aplicado correctamente.',
      };
    } catch (error) {
      updateWebState((current) => ({
        ...current,
        sync: {
          ...current.sync,
          lastStatus: 'error',
        },
      }));
      return {
        ok: false,
        applied: false,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo traer snapshot remoto.',
      };
    }
  }

  async flush(session: AuthSession | null): Promise<FlushSyncResult> {
    if (!session) {
      return {
        processed: 0,
        remaining: readWebState().sync.queue.filter((item) => item.status === 'pending')
          .length,
        ok: false,
        message: 'No hay sesion activa para sincronizar.',
      };
    }

    const currentState = readWebState();
    const before = currentState.sync.queue;
    const pendingBefore = before.filter((item) => item.status === 'pending').length;
    const timestamp = nowIso();

    const supabase = getSupabaseConfig();
    const remoteEnabled =
      currentState.sync.cloudEnabled && Boolean(supabase) && session.provider !== 'guest';

    if (pendingBefore === 0 && !remoteEnabled) {
      updateWebState((state) => ({
        ...state,
        sync: {
          ...state.sync,
          lastStatus: 'success',
          lastSyncedAt: timestamp,
        },
      }));

      return {
        processed: 0,
        remaining: 0,
        ok: true,
        message: 'No habia cambios pendientes.',
      };
    }

    if (!remoteEnabled) {
      updateWebState((state) => ({
        ...state,
        sync: {
          ...state.sync,
          lastStatus: 'running',
          queue: state.sync.queue.map((item): SyncQueueItem =>
            item.status !== 'pending'
              ? item
              : {
                  ...item,
                  status: 'synced',
                  attempts: item.attempts + 1,
                  updatedAt: timestamp,
                },
          ),
        },
      }));

      updateWebState((state) => ({
        ...state,
        sync: {
          ...state.sync,
          lastStatus: 'success',
          lastSyncedAt: timestamp,
        },
      }));

      return {
        processed: pendingBefore,
        remaining: 0,
        ok: true,
        message: `Sincronizacion local completada para ${session.email}.`,
      };
    }

    updateWebState((state) => ({
      ...state,
      sync: {
        ...state.sync,
        lastStatus: 'running',
      },
    }));

    try {
      const snapshotBeforeMarking = readWebState();
      const pendingItems = snapshotBeforeMarking.sync.queue.filter(
        (item) => item.status === 'pending',
      );

      if (pendingItems.length > 0) {
        await pushSyncEventsToSupabase(supabase!, session, pendingItems);
      }
      await upsertSnapshotToSupabase(supabase!, session, snapshotBeforeMarking);

      updateWebState((state) => ({
        ...state,
        sync: {
          ...state.sync,
          queue: state.sync.queue.map((item): SyncQueueItem =>
            item.status !== 'pending'
              ? item
              : {
                  ...item,
                  status: 'synced',
                  attempts: item.attempts + 1,
                  updatedAt: timestamp,
                },
          ),
          lastStatus: 'success',
          lastSyncedAt: timestamp,
        },
      }));

      return {
        processed: pendingBefore,
        remaining: 0,
        ok: true,
        message: `Sincronizacion remota completada para ${session.email}.`,
      };
    } catch (error) {
      updateWebState((state) => ({
        ...state,
        sync: {
          ...state.sync,
          queue: state.sync.queue.map((item): SyncQueueItem => {
            if (item.status !== 'pending') {
              return item;
            }
            const attempts = item.attempts + 1;
            return {
              ...item,
              attempts,
              updatedAt: timestamp,
              status: attempts >= 3 ? 'failed' : 'pending',
            };
          }),
          lastStatus: 'error',
        },
      }));

      const remaining = readWebState().sync.queue.filter(
        (item) => item.status === 'pending',
      ).length;
      return {
        processed: 0,
        remaining,
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo completar sincronizacion remota.',
      };
    }
  }
}

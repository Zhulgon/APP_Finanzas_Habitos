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
import { readWebState, updateWebState } from './storage';

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

    const before = readWebState().sync.queue;
    const pendingBefore = before.filter((item) => item.status === 'pending').length;
    const timestamp = nowIso();

    if (pendingBefore === 0) {
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
}

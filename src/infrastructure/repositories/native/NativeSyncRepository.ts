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

let queue: SyncQueueItem[] = [];
let lastStatus: SyncSummary['lastStatus'] = 'idle';
let lastSyncedAt = '';

const nowIso = (): string => new Date().toISOString();

export class NativeSyncRepository implements SyncRepository {
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
    queue = [
      nextItem,
      ...queue,
    ].slice(0, 500);
  }

  async getSummary(): Promise<SyncSummary> {
    return {
      pending: queue.filter((item) => item.status === 'pending').length,
      synced: queue.filter((item) => item.status === 'synced').length,
      failed: queue.filter((item) => item.status === 'failed').length,
      lastSyncedAt: lastSyncedAt || undefined,
      lastStatus,
    };
  }

  async listRecent(limit = 20): Promise<SyncQueueItem[]> {
    return queue.slice(0, Math.max(1, limit));
  }

  async flush(session: AuthSession | null): Promise<FlushSyncResult> {
    const pendingBefore = queue.filter((item) => item.status === 'pending').length;
    if (!session) {
      return {
        processed: 0,
        remaining: pendingBefore,
        ok: false,
        message: 'Sesion requerida para sincronizar.',
      };
    }

    const timestamp = nowIso();
    lastStatus = 'running';
    queue = queue.map((item): SyncQueueItem =>
      item.status !== 'pending'
        ? item
        : {
            ...item,
            status: 'synced',
            attempts: item.attempts + 1,
            updatedAt: timestamp,
          },
    );

    lastStatus = 'success';
    lastSyncedAt = timestamp;
    return {
      processed: pendingBefore,
      remaining: 0,
      ok: true,
      message: 'Sincronizacion local completada.',
    };
  }
}

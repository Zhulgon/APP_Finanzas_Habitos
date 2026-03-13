import type { AuthSession } from '../entities/Auth';
import type {
  FlushSyncResult,
  PullSyncResult,
  SyncQueueItem,
  SyncSummary,
} from '../entities/Sync';

export interface EnqueueSyncInput {
  entity: string;
  action: string;
  payload: Record<string, unknown>;
}

export interface SyncRepository {
  enqueue(input: EnqueueSyncInput): Promise<void>;
  getSummary(): Promise<SyncSummary>;
  flush(session: AuthSession | null): Promise<FlushSyncResult>;
  pullLatestSnapshot(session: AuthSession | null): Promise<PullSyncResult>;
  listRecent(limit?: number): Promise<SyncQueueItem[]>;
}

export type SyncItemStatus = 'pending' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  entity: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  status: SyncItemStatus;
}

export interface SyncSummary {
  pending: number;
  synced: number;
  failed: number;
  lastSyncedAt?: string;
  lastStatus: 'idle' | 'running' | 'success' | 'error';
}

export interface FlushSyncResult {
  processed: number;
  remaining: number;
  ok: boolean;
  message: string;
}


import type { AuthSession } from '../../entities/Auth';
import type { FlushSyncResult } from '../../entities/Sync';
import type { SyncRepository } from '../../repositories/SyncRepository';

export const flushSyncQueueUseCase = async (
  syncRepository: SyncRepository,
  session: AuthSession | null,
): Promise<FlushSyncResult> => {
  return syncRepository.flush(session);
};


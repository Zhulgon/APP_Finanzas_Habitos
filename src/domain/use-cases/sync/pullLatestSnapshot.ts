import type { AuthSession } from '../../entities/Auth';
import type { PullSyncResult } from '../../entities/Sync';
import type { SyncRepository } from '../../repositories/SyncRepository';

export const pullLatestSnapshotUseCase = async (
  syncRepository: SyncRepository,
  session: AuthSession | null,
): Promise<PullSyncResult> => {
  return syncRepository.pullLatestSnapshot(session);
};


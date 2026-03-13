import type { EnqueueSyncInput, SyncRepository } from '../../repositories/SyncRepository';

export const enqueueSyncItemUseCase = async (
  syncRepository: SyncRepository,
  input: EnqueueSyncInput,
): Promise<void> => {
  await syncRepository.enqueue(input);
};


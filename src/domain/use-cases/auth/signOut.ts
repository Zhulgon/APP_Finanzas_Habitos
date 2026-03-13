import type { AuthRepository } from '../../repositories/AuthRepository';

export const signOutUseCase = async (
  authRepository: AuthRepository,
): Promise<void> => {
  await authRepository.signOut();
};


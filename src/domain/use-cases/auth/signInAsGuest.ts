import type { AuthSession } from '../../entities/Auth';
import type { AuthRepository } from '../../repositories/AuthRepository';

export const signInAsGuestUseCase = async (
  authRepository: AuthRepository,
): Promise<AuthSession> => {
  return authRepository.signInAsGuest();
};


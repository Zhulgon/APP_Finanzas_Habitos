import type { AuthRequestCodeResult } from '../../entities/Auth';
import type { AuthRepository } from '../../repositories/AuthRepository';

export const requestEmailCodeUseCase = async (
  authRepository: AuthRepository,
  email: string,
): Promise<AuthRequestCodeResult> => {
  return authRepository.requestEmailCode(email);
};


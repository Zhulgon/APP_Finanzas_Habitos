import type { AuthVerifyCodeResult } from '../../entities/Auth';
import type { AuthRepository } from '../../repositories/AuthRepository';

export const verifyEmailCodeUseCase = async (
  authRepository: AuthRepository,
  email: string,
  code: string,
): Promise<AuthVerifyCodeResult> => {
  return authRepository.verifyEmailCode(email, code);
};


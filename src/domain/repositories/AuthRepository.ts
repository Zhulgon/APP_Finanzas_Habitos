import type {
  AuthRequestCodeResult,
  AuthSession,
  AuthVerifyCodeResult,
} from '../entities/Auth';

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  requestEmailCode(email: string): Promise<AuthRequestCodeResult>;
  verifyEmailCode(email: string, code: string): Promise<AuthVerifyCodeResult>;
  signInAsGuest(): Promise<AuthSession>;
  signOut(): Promise<void>;
}


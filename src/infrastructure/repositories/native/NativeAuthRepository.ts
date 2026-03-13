import type {
  AuthRequestCodeResult,
  AuthSession,
  AuthVerifyCodeResult,
} from '../../../domain/entities/Auth';
import type { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { createId } from '../../../shared/utils/id';

let currentSession: AuthSession | null = null;
let pendingEmail = '';
let pendingCode = '';
let pendingExpiresAt = '';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class NativeAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    return currentSession;
  }

  async requestEmailCode(email: string): Promise<AuthRequestCodeResult> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes('@')) {
      return {
        ok: false,
        message: 'Ingresa un correo valido.',
      };
    }

    pendingEmail = normalizedEmail;
    pendingCode = Math.floor(100000 + Math.random() * 900000).toString();
    pendingExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    return {
      ok: true,
      message: 'Codigo generado en modo local.',
      devCode: pendingCode,
    };
  }

  async verifyEmailCode(email: string, code: string): Promise<AuthVerifyCodeResult> {
    const normalizedEmail = normalizeEmail(email);
    if (!pendingEmail || pendingEmail !== normalizedEmail) {
      return {
        ok: false,
        message: 'No hay codigo pendiente para este correo.',
      };
    }
    if (new Date(pendingExpiresAt).getTime() < Date.now()) {
      return {
        ok: false,
        message: 'Codigo expirado.',
      };
    }
    if (pendingCode !== code.trim()) {
      return {
        ok: false,
        message: 'Codigo invalido.',
      };
    }

    currentSession = {
      userId: createId('usr'),
      email: normalizedEmail,
      provider: 'email_magic_code',
      signedInAt: new Date().toISOString(),
    };
    pendingEmail = '';
    pendingCode = '';
    pendingExpiresAt = '';

    return {
      ok: true,
      message: 'Sesion iniciada.',
      session: currentSession,
    };
  }

  async signInAsGuest(): Promise<AuthSession> {
    currentSession = {
      userId: createId('guest'),
      email: 'guest@local.app',
      provider: 'guest',
      signedInAt: new Date().toISOString(),
    };
    return currentSession;
  }

  async signOut(): Promise<void> {
    currentSession = null;
    pendingEmail = '';
    pendingCode = '';
    pendingExpiresAt = '';
  }
}


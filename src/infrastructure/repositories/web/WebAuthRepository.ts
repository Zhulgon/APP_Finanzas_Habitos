import type {
  AuthRequestCodeResult,
  AuthSession,
  AuthVerifyCodeResult,
} from '../../../domain/entities/Auth';
import type { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { createId } from '../../../shared/utils/id';
import { updateWebState, readWebState } from './storage';

const CODE_LENGTH = 6;
const CHALLENGE_TTL_MINUTES = 10;

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class WebAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    return readWebState().auth.session;
  }

  async requestEmailCode(email: string): Promise<AuthRequestCodeResult> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes('@')) {
      return {
        ok: false,
        message: 'Ingresa un correo valido.',
      };
    }

    const code = generateCode();
    const expiresAt = new Date(
      Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    updateWebState((state) => ({
      ...state,
      auth: {
        ...state.auth,
        pendingEmail: normalizedEmail,
        challenge: {
          email: normalizedEmail,
          code,
          expiresAt,
        },
      },
    }));

    return {
      ok: true,
      message: 'Codigo enviado (modo local).',
      devCode: code,
    };
  }

  async verifyEmailCode(email: string, code: string): Promise<AuthVerifyCodeResult> {
    const state = readWebState();
    const normalizedEmail = normalizeEmail(email);
    const safeCode = code.trim().slice(0, CODE_LENGTH);
    const challenge = state.auth.challenge;

    if (!challenge) {
      return {
        ok: false,
        message: 'Primero solicita un codigo.',
      };
    }

    if (challenge.email !== normalizedEmail || state.auth.pendingEmail !== normalizedEmail) {
      return {
        ok: false,
        message: 'El correo no coincide con el codigo solicitado.',
      };
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      return {
        ok: false,
        message: 'El codigo expiro. Solicita uno nuevo.',
      };
    }

    if (challenge.code !== safeCode) {
      return {
        ok: false,
        message: 'Codigo invalido.',
      };
    }

    const session: AuthSession = {
      userId: createId('usr'),
      email: normalizedEmail,
      provider: 'email_magic_code',
      signedInAt: new Date().toISOString(),
    };

    updateWebState((current) => ({
      ...current,
      auth: {
        session,
        pendingEmail: '',
      },
    }));

    return {
      ok: true,
      message: 'Sesion iniciada correctamente.',
      session,
    };
  }

  async signInAsGuest(): Promise<AuthSession> {
    const session: AuthSession = {
      userId: createId('guest'),
      email: 'guest@local.app',
      provider: 'guest',
      signedInAt: new Date().toISOString(),
    };

    updateWebState((state) => ({
      ...state,
      auth: {
        session,
        pendingEmail: '',
      },
    }));

    return session;
  }

  async signOut(): Promise<void> {
    updateWebState((state) => ({
      ...state,
      auth: {
        session: null,
        pendingEmail: '',
      },
    }));
  }
}


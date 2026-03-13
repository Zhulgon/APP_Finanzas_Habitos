export type AuthProvider = 'email_magic_code' | 'guest';

export interface AuthSession {
  userId: string;
  email: string;
  provider: AuthProvider;
  signedInAt: string;
}

export interface AuthChallenge {
  email: string;
  code: string;
  expiresAt: string;
}

export interface AuthRequestCodeResult {
  ok: boolean;
  message: string;
  // Solo para modo local/prototipo.
  devCode?: string;
}

export interface AuthVerifyCodeResult {
  ok: boolean;
  message: string;
  session?: AuthSession;
}


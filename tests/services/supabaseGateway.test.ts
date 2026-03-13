import {
  getSupabaseConfig,
  requestSupabaseOtp,
  verifySupabaseOtp,
} from '../../src/infrastructure/cloud/supabaseGateway';

describe('supabaseGateway', () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('detecta configuracion solo cuando existen URL y ANON KEY', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    expect(getSupabaseConfig()).toBeNull();

    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co/';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    expect(getSupabaseConfig()).toEqual({
      url: 'https://demo.supabase.co',
      anonKey: 'anon',
    });
  });

  it('envia OTP y verifica respuesta de supabase', async () => {
    const config = {
      url: 'https://demo.supabase.co',
      anonKey: 'anon',
    };

    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'token-1',
          user: {
            id: 'user-1',
            email: 'demo@correo.com',
          },
        }),
      }) as unknown as typeof fetch;

    const otpResult = await requestSupabaseOtp(config, 'demo@correo.com', fetcher);
    expect(otpResult.ok).toBe(true);

    const verifyResult = await verifySupabaseOtp(
      config,
      'demo@correo.com',
      '123456',
      fetcher,
    );
    expect(verifyResult.ok).toBe(true);
    expect(verifyResult.userId).toBe('user-1');
    expect(verifyResult.accessToken).toBe('token-1');
  });
});


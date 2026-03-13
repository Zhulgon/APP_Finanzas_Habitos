import { buildPulseNote, fetchUsdCopPulse } from '../../src/application/services/financialPulse';

describe('financialPulse', () => {
  it('calcula nota segun nivel de tasa', () => {
    expect(buildPulseNote(4700)).toContain('USD alto');
    expect(buildPulseNote(4300)).toContain('USD medio-alto');
    expect(buildPulseNote(3900)).toContain('USD moderado');
  });

  it('usa respuesta API cuando es valida', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      json: async () => ({ rates: { COP: 4123.55 } }),
    })) as unknown as typeof fetch;

    const pulse = await fetchUsdCopPulse(fetcher);

    expect(pulse.source).toBe('api');
    expect(pulse.usdCopRate).toBe(4123.55);
  });

  it('cae en fallback cuando API falla', async () => {
    const fetcher = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const pulse = await fetchUsdCopPulse(fetcher);

    expect(pulse.source).toBe('fallback');
    expect(pulse.usdCopRate).toBe(4000);
  });
});


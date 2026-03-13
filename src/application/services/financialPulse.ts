export interface FinancialPulse {
  usdCopRate: number;
  fetchedAt: string;
  source: 'api' | 'fallback';
  note: string;
}

interface ExchangeApiResponse {
  rates?: Record<string, number>;
}

const FALLBACK_RATE = 4000;
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

export const buildPulseNote = (rate: number): string => {
  if (rate >= 4600) {
    return 'USD alto: prioriza presupuesto y compras internacionales conscientes.';
  }
  if (rate >= 4200) {
    return 'USD medio-alto: compara precios y evita gastos impulsivos en dolares.';
  }
  return 'USD moderado: buena ventana para planificar ahorro e inversion gradual.';
};

export const fetchUsdCopPulse = async (
  fetcher: typeof fetch | undefined = globalThis.fetch,
): Promise<FinancialPulse> => {
  if (!fetcher) {
    return {
      usdCopRate: FALLBACK_RATE,
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
      note: buildPulseNote(FALLBACK_RATE),
    };
  }

  try {
    const response = await fetcher(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error('No se pudo consultar tasa USD/COP.');
    }
    const data = (await response.json()) as ExchangeApiResponse;
    const rate = data.rates?.COP;

    if (typeof rate !== 'number' || !Number.isFinite(rate)) {
      throw new Error('La respuesta de la API no incluyo tasa COP valida.');
    }

    return {
      usdCopRate: Number(rate.toFixed(2)),
      fetchedAt: new Date().toISOString(),
      source: 'api',
      note: buildPulseNote(rate),
    };
  } catch {
    return {
      usdCopRate: FALLBACK_RATE,
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
      note: buildPulseNote(FALLBACK_RATE),
    };
  }
};


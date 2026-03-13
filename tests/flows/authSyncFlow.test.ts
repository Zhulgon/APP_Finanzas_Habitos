class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

const originalLocalStorage = (globalThis as { localStorage?: unknown }).localStorage;

const installLocalStorage = () => {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  });
  return storage;
};

describe('auth + sync flow', () => {
  afterEach(() => {
    jest.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('permite login por codigo y sincroniza cola local', async () => {
    const storage = installLocalStorage();
    storage.clear();

    const { useAppStore } = await import('../../src/application/stores/useAppStore');
    await useAppStore.getState().bootstrap();

    const request = await useAppStore.getState().requestAuthCode('test@correo.com');
    expect(request.ok).toBe(true);
    expect(request.devCode).toBeTruthy();

    const verify = await useAppStore
      .getState()
      .verifyAuthCode('test@correo.com', request.devCode!);
    expect(verify.ok).toBe(true);
    expect(useAppStore.getState().authSession?.email).toBe('test@correo.com');

    await useAppStore.getState().finishOnboarding({
      name: 'Auth User',
      objective: 'Probar sync',
      monthlyIncome: 3000000,
      monthlySavingsGoal: 600000,
      currency: 'COP',
      initialHabits: ['Leer 10 min'],
    });

    expect(useAppStore.getState().syncSummary.pending).toBeGreaterThan(0);
    const flush = await useAppStore.getState().flushCloudSync();
    expect(flush.ok).toBe(true);
    expect(useAppStore.getState().syncSummary.pending).toBe(0);

    await useAppStore.getState().signOut();
    expect(useAppStore.getState().authSession).toBeNull();
  });
});


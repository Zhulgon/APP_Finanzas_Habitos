import {
  clearAppEvents,
  listRecentAppEvents,
  trackAppEvent,
} from '../../src/application/services/observability';

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe('observability', () => {
  const originalLocalStorage = (globalThis as { localStorage?: unknown }).localStorage;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new MemoryStorage(),
      writable: true,
      configurable: true,
    });
    clearAppEvents();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('registra y lista eventos recientes', () => {
    trackAppEvent('test.event.success', 'info', { ok: true });
    trackAppEvent('test.event.error', 'error', { code: 500 });

    const events = listRecentAppEvents(10);

    expect(events.length).toBe(2);
    expect(events[0].name).toBe('test.event.error');
    expect(events[1].name).toBe('test.event.success');
  });

  it('limpia eventos correctamente', () => {
    trackAppEvent('test.event', 'info');
    expect(listRecentAppEvents(5).length).toBe(1);

    clearAppEvents();

    expect(listRecentAppEvents(5).length).toBe(0);
  });
});

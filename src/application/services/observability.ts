import { createId } from '../../shared/utils/id';

export type AppEventLevel = 'info' | 'warn' | 'error';

export interface AppEvent {
  id: string;
  createdAt: string;
  level: AppEventLevel;
  name: string;
  metadata?: Record<string, string | number | boolean | null>;
}

const STORAGE_KEY = 'app_observability_events_v1';
const MAX_EVENTS = 300;

let inMemoryEvents: AppEvent[] = [];

const canUseStorage = (): boolean => {
  return Boolean(globalThis.localStorage);
};

const readEvents = (): AppEvent[] => {
  if (!canUseStorage()) {
    return inMemoryEvents;
  }

  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as AppEvent[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const writeEvents = (events: AppEvent[]): void => {
  const normalized = events.slice(0, MAX_EVENTS);
  inMemoryEvents = normalized;

  if (!canUseStorage()) {
    return;
  }

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage write errors silently.
  }
};

export const trackAppEvent = (
  name: string,
  level: AppEventLevel = 'info',
  metadata?: Record<string, string | number | boolean | null>,
): void => {
  const entry: AppEvent = {
    id: createId('evt'),
    createdAt: new Date().toISOString(),
    level,
    name,
    metadata,
  };

  const current = readEvents();
  writeEvents([entry, ...current]);

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(`[app-event] ${name}`, metadata ?? {});
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(`[app-event] ${name}`, metadata ?? {});
  } else {
    // eslint-disable-next-line no-console
    console.info(`[app-event] ${name}`, metadata ?? {});
  }
};

export const listRecentAppEvents = (limit = 20): AppEvent[] => {
  return readEvents().slice(0, Math.max(1, limit));
};

export const clearAppEvents = (): void => {
  inMemoryEvents = [];
  if (!canUseStorage()) {
    return;
  }
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore cleanup errors.
  }
};

import type { AppDomainEvent } from '../../domain/events/AppDomainEvent';
import type {
  DomainEventBus,
  DomainEventHandler,
} from '../../domain/events/DomainEventBus';

export class InMemoryDomainEventBus implements DomainEventBus {
  private readonly handlers = new Map<
    AppDomainEvent['type'],
    Set<DomainEventHandler<AppDomainEvent>>
  >();

  async publish(event: AppDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      await handler(event);
    }
  }

  subscribe<TType extends AppDomainEvent['type']>(
    type: TType,
    handler: DomainEventHandler<Extract<AppDomainEvent, { type: TType }>>,
  ): () => void {
    const existing = this.handlers.get(type) ?? new Set<DomainEventHandler<AppDomainEvent>>();
    existing.add(handler as DomainEventHandler<AppDomainEvent>);
    this.handlers.set(type, existing);

    return () => {
      const current = this.handlers.get(type);
      current?.delete(handler as DomainEventHandler<AppDomainEvent>);
      if (current && current.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  clear(): void {
    this.handlers.clear();
  }
}


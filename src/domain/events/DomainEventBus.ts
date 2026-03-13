import type { AppDomainEvent } from './AppDomainEvent';

export type DomainEventHandler<TEvent extends AppDomainEvent = AppDomainEvent> = (
  event: TEvent,
) => void | Promise<void>;

export interface DomainEventBus {
  publish(event: AppDomainEvent): Promise<void>;
  subscribe<TType extends AppDomainEvent['type']>(
    type: TType,
    handler: DomainEventHandler<Extract<AppDomainEvent, { type: TType }>>,
  ): () => void;
  clear(): void;
}


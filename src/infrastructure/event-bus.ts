import type { DomainEventMap, DomainEventName, DomainEventPayload } from '@/domain/events/types';

type EventHandler<K extends DomainEventName> = (payload: DomainEventPayload<K>) => void | Promise<void>;

/**
 * Typed Event Bus
 * Facilitates decoupled communication between modules.
 */
class EventBus {
    private handlers = new Map<string, Set<Function>>();

    /** Emits an event to all registered listeners asynchronously */
    emit<K extends DomainEventName>(event: K, data: DomainEventPayload<K>): void {
        const eventHandlers = this.handlers.get(event);
        if (!eventHandlers) return;

        // Use setTimeout to ensure handlers run asynchronously without blocking the domain logic
        eventHandlers.forEach((handler) => {
            setTimeout(() => {
                try {
                    const result = handler(data);
                    if (result instanceof Promise) {
                        result.catch((err) => console.error(`[EventBus] Async handler error for ${event}:`, err));
                    }
                } catch (err) {
                    console.error(`[EventBus] Sync handler error for ${event}:`, err);
                }
            }, 0);
        });
    }

    /** Subscribes to an event. Returns an unsubscribe function. */
    on<K extends DomainEventName>(event: K, handler: EventHandler<K>): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }

        this.handlers.get(event)!.add(handler);

        return () => {
            this.handlers.get(event)?.delete(handler);
        };
    }

    /** Clears all listeners (mostly useful for tests) */
    clear(): void {
        this.handlers.clear();
    }
}

export const eventBus = new EventBus();

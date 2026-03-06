import type { IWebhookDispatcher, WebhookEvent } from '@/domain/ports/IWebhookDispatcher';

/**
 * Adapter: HTTP Webhook Dispatcher
 * Implements the IWebhookDispatcher port using HTTP POST requests.
 * Lives in the adapter layer so that the domain has zero knowledge of HTTP/fetch.
 *
 * In a full production system, registeredUrls would be stored per-project
 * in the database and fetched at dispatch time.
 */
export class WebhookDispatcherAdapter implements IWebhookDispatcher {
    constructor(private readonly registeredUrls: string[] = []) { }

    async dispatch(event: WebhookEvent): Promise<void> {
        if (this.registeredUrls.length === 0) return;

        const promises = this.registeredUrls.map((url) =>
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-QA-Hub-Event': event.event,
                    'User-Agent': 'QA-Hub-Webhook/1.0',
                },
                body: JSON.stringify({
                    event: event.event,
                    timestamp: new Date().toISOString(),
                    data: event.payload,
                }),
            }).catch((e: Error) => {
                console.error(`[WebhookDispatcherAdapter] Failed to POST to ${url}: ${e.message}`);
            })
        );

        await Promise.allSettled(promises);
    }
}

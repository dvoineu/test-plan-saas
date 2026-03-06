export type WebhookEventName =
    | 'testrun.created'
    | 'testrun.updated'
    | 'testrun.completed'
    | 'testrun.deleted'
    | 'testresult.updated';

export interface WebhookEvent {
    event: WebhookEventName;
    payload: Record<string, unknown>;
}

/**
 * Port: Webhook Dispatcher
 * Abstracts over HTTP webhook delivery so that the domain layer
 * has zero knowledge of transport (fetch, axios, queues, etc.).
 */
export interface IWebhookDispatcher {
    dispatch(event: WebhookEvent): Promise<void>;
}

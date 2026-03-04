export interface WebhookEvent {
    event: 'testrun.created' | 'testrun.completed' | 'testrun.deleted' | 'testresult.updated';
    payload: any;
}

export class WebhookService {
    // In a full production system, urls would come from the database tied to user/project settings
    constructor(private readonly registeredUrls: string[] = []) { }

    async dispatch(event: WebhookEvent): Promise<void> {
        if (this.registeredUrls.length === 0) return;

        const promises = this.registeredUrls.map(url => {
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-QA-Hub-Event': event.event,
                    'User-Agent': 'QA-Hub-Webhook/1.0'
                },
                body: JSON.stringify({
                    event: event.event,
                    timestamp: new Date().toISOString(),
                    data: event.payload
                })
            }).catch(e => {
                console.error(`Failed to dispatch webhook to ${url}: ${e.message}`);
            });
        });

        await Promise.allSettled(promises);
    }
}

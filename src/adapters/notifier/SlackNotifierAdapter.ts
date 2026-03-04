import { IntegrationSettingsService } from '../../domain/services/IntegrationSettingsService';
import { INotifier, NotificationPayload } from '../../domain/ports/INotifier';

export class SlackNotifierAdapter implements INotifier {
    readonly name = 'Slack';

    constructor(private readonly settingsService: IntegrationSettingsService) { }

    async isAvailable(): Promise<boolean> {
        const settings = await this.settingsService.getSettings();
        return !!settings.slack_webhook;
    }

    async send(payload: NotificationPayload): Promise<void> {
        const settings = await this.settingsService.getSettings();
        const webhookUrl = settings.slack_webhook;

        if (!webhookUrl) {
            console.log('Slack webhook not configured. Skipping notification.');
            return;
        }

        const color = payload.severity === 'success' ? '#36a64f' : payload.severity === 'error' ? '#cf0000' : '#ffa500';

        const body = {
            text: `*${payload.title}*`,
            attachments: [
                {
                    color: color,
                    text: payload.message,
                    fields: payload.fields?.map(f => ({
                        title: f.title,
                        value: f.value,
                        short: f.short
                    })),
                    footer: "QA-Hub Automated Notifications"
                }
            ]
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                console.error(`Failed to send Slack notification. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error sending Slack notification:', error);
        }
    }
}

/**
 * Port: Notifier
 * Abstracts notification delivery for test run results,
 * failed test alerts, and daily digests.
 *
 * Implementations: SlackAdapter, EmailAdapter, etc.
 */

export interface NotificationPayload {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    metadata?: Record<string, unknown>;
    fields?: Array<{ title: string; value: string; short: boolean }>;
}

export interface INotifier {
    /** Human-readable name of the notification channel */
    readonly name: string;

    /** Send a notification */
    send(payload: NotificationPayload): Promise<void>;

    /** Check if the notification channel is configured and reachable */
    isAvailable(): Promise<boolean>;
}

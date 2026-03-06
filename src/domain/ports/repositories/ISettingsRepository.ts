export interface ISettingsRepository {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    getAll(keys: string[]): Promise<Record<string, string>>;
}

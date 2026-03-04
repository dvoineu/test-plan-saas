/**
 * Port: Storage Provider
 * Abstracts file storage for attachments (screenshots, videos, logs).
 *
 * Implementations: LocalStorageAdapter, S3StorageAdapter
 */

export interface IStorageProvider {
    /** Upload a file, returns the stored path/URL */
    upload(buffer: Buffer, fileName: string, mimeType: string): Promise<string>;

    /** Delete a file by its stored path */
    delete(filePath: string): Promise<void>;

    /** Get a public/accessible URL for a stored file */
    getUrl(filePath: string): string;

    /** Get the absolute filesystem path (for local storage only) */
    getAbsolutePath?(filePath: string): string;
}

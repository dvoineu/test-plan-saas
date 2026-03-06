import * as fs from 'fs/promises';
import * as path from 'path';
import type { IStorageProvider } from '@/domain/ports/IStorageProvider';

export class LocalStorageAdapter implements IStorageProvider {
    constructor(private readonly baseDir: string) { }

    private async ensureDir(): Promise<void> {
        try {
            await fs.access(this.baseDir);
        } catch {
            await fs.mkdir(this.baseDir, { recursive: true });
        }
    }

    async upload(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
        await this.ensureDir();
        // In a real app, sanitize fileName securely
        const filePath = path.join(this.baseDir, fileName);
        await fs.writeFile(filePath, buffer);
        return `/uploads/${fileName}`; // Return relative URL path
    }

    async delete(filePath: string): Promise<void> {
        // Note: in a secure app, ensure filePath is within baseDir
        const fileName = path.basename(filePath);
        const absolutePath = path.join(this.baseDir, fileName);
        try {
            await fs.unlink(absolutePath);
        } catch (e) {
            console.warn(`File already deleted or missing: ${absolutePath}`);
        }
    }

    getUrl(filePath: string): string {
        return filePath; // Since upload() returns the URL path directly
    }

    getAbsolutePath(filePath: string): string {
        const fileName = path.basename(filePath);
        return path.join(this.baseDir, fileName);
    }
}

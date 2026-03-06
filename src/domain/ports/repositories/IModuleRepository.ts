import type { Module } from '../../types';

export interface IModuleRepository {
    findByName(name: string, projectId: string): Promise<Module | null>;
    findAll(projectId: string): Promise<Module[]>;
    create(name: string, projectId: string, description?: string): Promise<Module>;
    deleteAll(): Promise<void>;
}

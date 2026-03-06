import { Project, CreateProjectDTO } from '@/domain/types';

export interface IProjectRepository {
    findById(id: string): Promise<Project | null>;
    findAll(): Promise<Project[]>;
    create(data: CreateProjectDTO): Promise<Project>;
    update(id: string, data: Partial<CreateProjectDTO>): Promise<Project>;
    delete(id: string): Promise<void>;
}

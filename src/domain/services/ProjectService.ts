import type { IProjectRepository } from '../ports/repositories/IProjectRepository';
import type { CreateProjectDTO, Project } from '../types';
import { NotFoundError } from '../errors';

/**
 * Service: Project Management
 * Handles creating, retrieving, and configuring Projects.
 */
export class ProjectService {
    constructor(private readonly projectRepo: IProjectRepository) { }

    async getProject(id: string): Promise<Project> {
        const project = await this.projectRepo.findById(id);
        if (!project) throw new NotFoundError('Project', id);
        return project;
    }

    async getAllProjects(): Promise<Project[]> {
        return this.projectRepo.findAll();
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        return this.projectRepo.create(data);
    }

    async updateProject(id: string, data: Partial<CreateProjectDTO>): Promise<Project> {
        const existing = await this.projectRepo.findById(id);
        if (!existing) throw new NotFoundError('Project', id);
        return this.projectRepo.update(id, data);
    }

    async deleteProject(id: string): Promise<void> {
        const existing = await this.projectRepo.findById(id);
        if (!existing) throw new NotFoundError('Project', id);
        return this.projectRepo.delete(id);
    }
}

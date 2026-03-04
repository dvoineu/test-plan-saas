import { IProjectRepository } from '../ports/repositories/IProjectRepository';
import { CreateProjectDTO, Project } from '../types';

/**
 * Service: Project Management
 * Handles creating, retrieving, and configuring Projects.
 */
export class ProjectService {
    constructor(private readonly projectRepo: IProjectRepository) { }

    async getProject(id: string): Promise<Project | null> {
        return this.projectRepo.findById(id);
    }

    async getAllProjects(): Promise<Project[]> {
        return this.projectRepo.findAll();
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        return this.projectRepo.create(data);
    }

    async updateProject(id: string, data: Partial<CreateProjectDTO>): Promise<Project> {
        return this.projectRepo.update(id, data);
    }

    async deleteProject(id: string): Promise<void> {
        return this.projectRepo.delete(id);
    }
}

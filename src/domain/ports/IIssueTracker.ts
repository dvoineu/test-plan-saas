export interface CreateIssueDTO {
    title: string;
    descriptionMarkdown: string;
    priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export interface CreatedIssue {
    id: string;
    key: string;
    url: string;
}

export interface IIssueTracker {
    createBug(dto: CreateIssueDTO): Promise<CreatedIssue>;
}

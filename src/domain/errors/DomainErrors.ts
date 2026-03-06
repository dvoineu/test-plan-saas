/**
 * Domain Errors
 * Typed exception hierarchy for the domain layer.
 * Maps cleanly to HTTP status codes in the API layer.
 */

export class DomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 500,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends DomainError {
    constructor(entity: string, id?: string) {
        super(
            id ? `${entity} with id "${id}" not found` : `${entity} not found`,
            'NOT_FOUND',
            404,
        );
    }
}

export class ValidationError extends DomainError {
    constructor(message: string, public readonly details?: Record<string, string[]>) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class ConflictError extends DomainError {
    constructor(message: string) {
        super(message, 'CONFLICT', 409);
    }
}

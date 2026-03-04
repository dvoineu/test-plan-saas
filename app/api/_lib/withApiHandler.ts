import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError, NotFoundError, ValidationError } from '@/domain/errors';

/**
 * Standardized API error response shape.
 */
interface ApiErrorResponse {
    error: string;
    code: string;
    details?: Record<string, string[]>;
}

/**
 * Higher-order function that wraps API route handlers with:
 * 1. Centralized error catching
 * 2. DomainError → HTTP status code mapping
 * 3. Zod validation error → 400 with field-level details
 * 4. Structured JSON error responses
 * 5. Server-side logging
 */
export function withApiHandler(
    handler: (req: Request, context?: any) => Promise<Response>,
) {
    return async (req: Request, context?: any): Promise<Response> => {
        try {
            return await handler(req, context);
        } catch (error) {
            // Zod validation errors → 400
            if (error instanceof ZodError) {
                const details: Record<string, string[]> = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.') || '_root';
                    if (!details[path]) details[path] = [];
                    details[path].push(issue.message);
                }

                return NextResponse.json<ApiErrorResponse>(
                    { error: 'Validation failed', code: 'VALIDATION_ERROR', details },
                    { status: 400 },
                );
            }

            // Domain errors → mapped HTTP status
            if (error instanceof DomainError) {
                const response: ApiErrorResponse = {
                    error: error.message,
                    code: error.code,
                };
                if (error instanceof ValidationError && error.details) {
                    response.details = error.details;
                }
                return NextResponse.json(response, { status: error.statusCode });
            }

            // Unknown errors → 500
            console.error('[API Error]', error);
            return NextResponse.json<ApiErrorResponse>(
                { error: 'Internal server error', code: 'INTERNAL_ERROR' },
                { status: 500 },
            );
        }
    };
}

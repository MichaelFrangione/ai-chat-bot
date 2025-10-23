export class ResponseHandler {
    /**
     * Creates a standardized error response
     */
    static createErrorResponse(message: string, status: number = 500, error?: any) {
        const errorDetails = error instanceof Error ? error.message : 'Unknown error';

        return new Response(JSON.stringify({
            error: message,
            details: errorDetails
        }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Creates a validation error response
     */
    static createValidationErrorResponse(message: string) {
        return this.createErrorResponse(message, 400);
    }
}

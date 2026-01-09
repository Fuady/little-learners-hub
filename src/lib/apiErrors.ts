/**
 * API error handling utilities
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get user-friendly error message based on HTTP status code
 */
export function getErrorMessage(statusCode: number, defaultMessage?: string): string {
    const messages: Record<number, string> = {
        400: 'Invalid request. Please check your input.',
        401: 'Please log in to continue.',
        403: "You don't have permission to do that.",
        404: 'Resource not found.',
        422: 'Validation error. Please check your input.',
        500: 'Server error. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.',
    };

    return messages[statusCode] || defaultMessage || 'An unexpected error occurred.';
}

/**
 * Handle API error and return user-friendly message
 */
export function handleApiError(error: any): string {
    if (error.response) {
        // Server responded with error status
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.detail || error.response.data?.message;

        // Use server message if available, otherwise use generic message
        return serverMessage || getErrorMessage(statusCode);
    } else if (error.request) {
        // Request made but no response
        return 'Unable to connect to server. Please check your internet connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred.';
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.registerErrorHandler = registerErrorHandler;
class AppError extends Error {
    code;
    statusCode;
    constructor(code, statusCode, message) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
function registerErrorHandler(app) {
    /**
     * Handle unknown routes
     */
    app.setNotFoundHandler((request, reply) => {
        return reply.status(404).send({
            error: {
                code: "NOT_FOUND",
                message: "Route not found",
                requestId: request.id,
            },
        });
    });
    /**
     * Global error handler
     */
    app.setErrorHandler((error, request, reply) => {
        const requestId = request.id;
        /**
         * 1. Validation errors
         *
         * Fastify sets `error.validation` when
         * request body, query, params, etc. fail validation.
         */
        if (error.validation) {
            return reply.status(400).send({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid request",
                    requestId,
                },
            });
        }
        /**
         * 2. Known application errors
         *
         * Errors created using AppError.
         */
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                error: {
                    code: error.code,
                    message: error.message,
                    requestId,
                },
            });
        }
        /**
         * 3. Authentication errors
         *
         * Handles errors with HTTP 401 status.
         */
        if (error.statusCode === 401) {
            return reply.status(401).send({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                    requestId,
                },
            });
        }
        /**
         * 4. Other known HTTP errors
         *
         * Examples:
         * 400 Bad Request
         * 403 Forbidden
         * 409 Conflict
         * 422 Unprocessable Entity
         * 429 Too Many Requests
         */
        if (error.statusCode && error.statusCode < 500) {
            return reply.status(error.statusCode).send({
                error: {
                    code: getHttpErrorCode(error.statusCode),
                    message: error.message,
                    requestId,
                },
            });
        }
        /**
         * 5. Unexpected errors
         *
         * Log the real error internally.
         * Never expose internal error details to the client.
         */
        request.log.error(error);
        return reply.status(500).send({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
                requestId,
            },
        });
    });
}
/**
 * Convert HTTP status codes into API error codes.
 */
function getHttpErrorCode(statusCode) {
    switch (statusCode) {
        case 400:
            return "BAD_REQUEST";
        case 401:
            return "UNAUTHORIZED";
        case 403:
            return "FORBIDDEN";
        case 404:
            return "NOT_FOUND";
        case 409:
            return "CONFLICT";
        case 422:
            return "UNPROCESSABLE_ENTITY";
        case 429:
            return "TOO_MANY_REQUESTS";
        default:
            return "HTTP_ERROR";
    }
}

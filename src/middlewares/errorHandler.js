const ApiError = require('../utils/ApiError');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: error.message,
            stack: error.stack,
            statusCode: error.statusCode,
        });
    }

    // Prisma errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        error = ApiError.conflict(`${field} already exists`);
    }

    if (err.code === 'P2025') {
        error = ApiError.notFound('Record not found');
    }

    if (err.code === 'P2003') {
        error = ApiError.badRequest('Invalid reference - related record not found');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error = ApiError.badRequest('Validation Error', err.errors);
    }

    // Default to 500 if no status code
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(error.errors && { details: error.errors }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
};

module.exports = errorHandler;

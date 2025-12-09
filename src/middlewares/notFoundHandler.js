const ApiError = require('../utils/ApiError');

/**
 * 404 Not Found middleware
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = notFoundHandler;

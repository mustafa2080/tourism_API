const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request using express-validator
 * Use after validation chain
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
            value: error.value,
        }));

        return next(ApiError.badRequest('Validation failed', formattedErrors));
    }

    next();
};

module.exports = validate;

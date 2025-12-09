const { body, param, query } = require('express-validator');

const getUserValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid user ID'),
];

const updateUserValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid user ID'),

    body('role')
        .optional()
        .isIn(['USER', 'ADMIN', 'SUPPORT'])
        .withMessage('Invalid role'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];

const listUsersValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('role')
        .optional()
        .isIn(['USER', 'ADMIN', 'SUPPORT'])
        .withMessage('Invalid role'),

    query('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search query too long'),
];

module.exports = {
    getUserValidator,
    updateUserValidator,
    listUsersValidator,
};

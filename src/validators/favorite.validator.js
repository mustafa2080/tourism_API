const { body, param, query } = require('express-validator');

const addFavoriteValidator = [
    body('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),
];

const removeFavoriteValidator = [
    param('favoriteId')
        .isUUID()
        .withMessage('Invalid favorite ID'),
];

const removeFavoriteByTripValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),
];

const listFavoritesValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
];

module.exports = {
    addFavoriteValidator,
    removeFavoriteValidator,
    removeFavoriteByTripValidator,
    listFavoritesValidator,
};

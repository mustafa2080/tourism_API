const { body, param, query } = require('express-validator');

const createTripValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),

    body('itinerary')
        .optional()
        .trim(),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('currency')
        .optional()
        .isIn(['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'])
        .withMessage('Invalid currency'),

    body('durationDays')
        .notEmpty()
        .withMessage('Duration is required')
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 day'),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date'),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date'),

    body('destinations')
        .optional()
        .isArray()
        .withMessage('Destinations must be an array'),

    body('destinations.*')
        .optional()
        .isString()
        .trim(),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),

    body('tags.*')
        .optional()
        .isString()
        .trim(),

    body('totalSeats')
        .notEmpty()
        .withMessage('Total seats is required')
        .isInt({ min: 1 })
        .withMessage('Total seats must be at least 1'),

    body('occupancyPolicy')
        .optional()
        .trim(),
];

const updateTripValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('durationDays')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 day'),

    body('seatsAvailable')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Seats available must be a non-negative number'),

    body('totalSeats')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Total seats must be at least 1'),
];

const getTripValidator = [
    param('tripId')
        .notEmpty()
        .withMessage('Trip ID is required'),
];

const listTripsValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('q')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Search query too long'),

    query('destination')
        .optional()
        .trim(),

    query('priceMin')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),

    query('priceMax')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number'),

    query('durationMin')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Minimum duration must be at least 1'),

    query('durationMax')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum duration must be at least 1'),

    query('sort')
        .optional()
        .isIn(['newest', 'oldest', 'price-asc', 'price-desc', 'duration-asc', 'duration-desc'])
        .withMessage('Invalid sort option'),

    query('status')
        .optional()
        .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
        .withMessage('Invalid status'),
];

const addImageValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    body('url')
        .notEmpty()
        .withMessage('Image URL is required')
        .isURL()
        .withMessage('Invalid image URL'),

    body('altText')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Alt text must be less than 200 characters'),

    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Order must be a non-negative integer'),
];

const updateImageValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    param('imageId')
        .isUUID()
        .withMessage('Invalid image ID'),

    body('altText')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Alt text must be less than 200 characters'),

    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Order must be a non-negative integer'),
];

const deleteImageValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    param('imageId')
        .isUUID()
        .withMessage('Invalid image ID'),
];

const overrideAvailabilityValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    body('seatsAvailable')
        .notEmpty()
        .withMessage('Seats available is required')
        .isInt({ min: 0 })
        .withMessage('Seats available must be a non-negative integer'),
];

module.exports = {
    createTripValidator,
    updateTripValidator,
    getTripValidator,
    listTripsValidator,
    addImageValidator,
    updateImageValidator,
    deleteImageValidator,
    overrideAvailabilityValidator,
};

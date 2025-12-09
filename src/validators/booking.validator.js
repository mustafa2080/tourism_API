const { body, param, query } = require('express-validator');

const createBookingValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    body('passengers')
        .optional()
        .isArray()
        .withMessage('Passengers must be an array'),

    body('passengers.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Passenger name is required'),

    body('passengers.*.email')
        .optional()
        .isEmail()
        .withMessage('Invalid passenger email'),

    body('passengers.*.phone')
        .optional()
        .trim(),

    body('bookingDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid booking date'),
];

const updateBookingValidator = [
    param('bookingId')
        .isUUID()
        .withMessage('Invalid booking ID'),

    body('passengers')
        .optional()
        .isArray()
        .withMessage('Passengers must be an array'),

    body('bookingDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid booking date'),
];

const getBookingValidator = [
    param('bookingId')
        .isUUID()
        .withMessage('Invalid booking ID'),
];

const cancelBookingValidator = [
    param('bookingId')
        .isUUID()
        .withMessage('Invalid booking ID'),

    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters'),
];

const listBookingsValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),

    query('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'])
        .withMessage('Invalid status'),
];

module.exports = {
    createBookingValidator,
    updateBookingValidator,
    getBookingValidator,
    cancelBookingValidator,
    listBookingsValidator,
};

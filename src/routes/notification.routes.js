const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { emailService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');
const { authenticate, authorize, validate } = require('../middlewares');
const { body } = require('express-validator');

/**
 * Internal notification routes
 * These would typically be called by internal workers/services
 */

/**
 * @route   POST /api/v1/notifications/email/booking-confirmation
 * @desc    Send booking confirmation email
 * @access  Internal/Admin
 */
router.post('/email/booking-confirmation',
    authenticate,
    authorize('ADMIN'),
    [
        body('bookingId').isUUID().withMessage('Valid booking ID required'),
    ],
    validate,
    catchAsync(async (req, res) => {
        const { bookingId } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                trip: true,
            },
        });

        if (!booking) {
            return ApiResponse.notFound(res, 'Booking not found');
        }

        await emailService.sendBookingConfirmation(booking, booking.user, booking.trip);

        return ApiResponse.success(res, { sent: true }, 'Confirmation email sent');
    })
);

/**
 * @route   POST /api/v1/notifications/email/booking-cancellation
 * @desc    Send booking cancellation email
 * @access  Internal/Admin
 */
router.post('/email/booking-cancellation',
    authenticate,
    authorize('ADMIN'),
    [
        body('bookingId').isUUID().withMessage('Valid booking ID required'),
    ],
    validate,
    catchAsync(async (req, res) => {
        const { bookingId } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                trip: true,
            },
        });

        if (!booking) {
            return ApiResponse.notFound(res, 'Booking not found');
        }

        await emailService.sendBookingCancellation(booking, booking.user, booking.trip);

        return ApiResponse.success(res, { sent: true }, 'Cancellation email sent');
    })
);

/**
 * @route   POST /api/v1/notifications/email/booking-reminder
 * @desc    Send booking reminder email
 * @access  Internal/Admin
 */
router.post('/email/booking-reminder',
    authenticate,
    authorize('ADMIN'),
    [
        body('bookingId').isUUID().withMessage('Valid booking ID required'),
        body('daysUntilTrip').isInt({ min: 1 }).withMessage('Days until trip required'),
    ],
    validate,
    catchAsync(async (req, res) => {
        const { bookingId, daysUntilTrip } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                trip: true,
            },
        });

        if (!booking) {
            return ApiResponse.notFound(res, 'Booking not found');
        }

        await emailService.sendBookingReminder(booking, booking.user, booking.trip, daysUntilTrip);

        return ApiResponse.success(res, { sent: true }, 'Reminder email sent');
    })
);

module.exports = router;

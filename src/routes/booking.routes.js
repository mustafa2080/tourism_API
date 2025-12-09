const express = require('express');
const router = express.Router();
const { bookingController } = require('../controllers');
const { authenticate, authorize, validate } = require('../middlewares');
const {
    getBookingValidator,
    updateBookingValidator,
    cancelBookingValidator,
    listBookingsValidator,
} = require('../validators/booking.validator');

/**
 * @route   GET /api/v1/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', authenticate, listBookingsValidator, validate, bookingController.getMyBookings);

/**
 * @route   GET /api/v1/bookings/:bookingId
 * @desc    Get booking by ID
 * @access  Private (owner or admin)
 */
router.get('/:bookingId', authenticate, getBookingValidator, validate, bookingController.getBooking);

/**
 * @route   PUT /api/v1/bookings/:bookingId
 * @desc    Update booking
 * @access  Private (owner or admin)
 */
router.put('/:bookingId', authenticate, updateBookingValidator, validate, bookingController.updateBooking);

/**
 * @route   PUT /api/v1/bookings/:bookingId/cancel
 * @desc    Cancel booking
 * @access  Private (owner or admin)
 */
router.put('/:bookingId/cancel', authenticate, cancelBookingValidator, validate, bookingController.cancelBooking);

/**
 * @route   POST /api/v1/bookings/:bookingId/confirm
 * @desc    Confirm booking
 * @access  Admin only
 */
router.post('/:bookingId/confirm', authenticate, authorize('ADMIN'), getBookingValidator, validate, bookingController.confirmBooking);

/**
 * @route   DELETE /api/v1/bookings/:bookingId
 * @desc    Delete booking (hard delete)
 * @access  Admin only
 */
router.delete('/:bookingId', authenticate, authorize('ADMIN'), getBookingValidator, validate, bookingController.deleteBooking);

module.exports = router;

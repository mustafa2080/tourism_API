const { bookingService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Create a booking
 * POST /api/v1/trips/:tripId/bookings
 */
const createBooking = catchAsync(async (req, res) => {
    const { tripId } = req.params;
    const booking = await bookingService.createBooking(tripId, req.user.id, req.body);

    return ApiResponse.created(res, booking, 'Booking created successfully');
});

/**
 * Get user's bookings
 * GET /api/v1/bookings
 */
const getMyBookings = catchAsync(async (req, res) => {
    const { page, limit, status } = req.query;

    const result = await bookingService.getUserBookings(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
    });

    return ApiResponse.paginated(res, result.bookings, result.pagination, 'Bookings retrieved successfully');
});

/**
 * Get booking by ID
 * GET /api/v1/bookings/:bookingId
 */
const getBooking = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    const booking = await bookingService.getBookingById(
        req.params.bookingId,
        req.user.id,
        isAdmin
    );

    return ApiResponse.success(res, booking, 'Booking retrieved successfully');
});

/**
 * Update booking
 * PUT /api/v1/bookings/:bookingId
 */
const updateBooking = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    const booking = await bookingService.updateBooking(
        req.params.bookingId,
        req.user.id,
        req.body,
        isAdmin
    );

    return ApiResponse.success(res, booking, 'Booking updated successfully');
});

/**
 * Cancel booking
 * PUT /api/v1/bookings/:bookingId/cancel
 */
const cancelBooking = catchAsync(async (req, res) => {
    const { reason } = req.body;
    const isAdmin = req.user.role === 'ADMIN';
    const booking = await bookingService.cancelBooking(
        req.params.bookingId,
        req.user.id,
        reason,
        isAdmin
    );

    return ApiResponse.success(res, booking, 'Booking cancelled successfully');
});

/**
 * Confirm booking (admin)
 * POST /api/v1/bookings/:bookingId/confirm
 */
const confirmBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.confirmBooking(req.params.bookingId);

    return ApiResponse.success(res, booking, 'Booking confirmed successfully');
});

/**
 * Get admin bookings
 * GET /api/v1/admin/bookings
 */
const getAdminBookings = catchAsync(async (req, res) => {
    const { page, limit, status, tripId, userId } = req.query;

    const result = await bookingService.getAdminBookings({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        tripId,
        userId,
    });

    return ApiResponse.paginated(res, result.bookings, result.pagination, 'Bookings retrieved successfully');
});

/**
 * Delete booking (admin)
 * DELETE /api/v1/bookings/:bookingId
 */
const deleteBooking = catchAsync(async (req, res) => {
    await bookingService.deleteBooking(req.params.bookingId);

    return ApiResponse.success(res, null, 'Booking deleted successfully');
});

module.exports = {
    createBooking,
    getMyBookings,
    getBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    getAdminBookings,
    deleteBooking,
};

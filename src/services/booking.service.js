const crypto = require('crypto');
const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Generate booking reference
 */
const generateBookingReference = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ST-${timestamp}-${random}`;
};

/**
 * Create a booking
 */
const createBooking = async (tripId, userId, bookingData) => {
    const { passengers, bookingDate, options } = bookingData;

    // Get trip
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    if (trip.status !== 'PUBLISHED') {
        throw ApiError.badRequest('This trip is not available for booking');
    }

    // Check availability
    const passengerCount = passengers?.length || 1;
    if (trip.seatsAvailable < passengerCount) {
        throw ApiError.badRequest(`Only ${trip.seatsAvailable} seats available`);
    }

    // Calculate total price
    const totalPrice = parseFloat(trip.price) * passengerCount;

    // Generate booking reference
    const bookingReference = generateBookingReference();

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
        // Create booking
        const newBooking = await tx.booking.create({
            data: {
                tripId,
                userId,
                passengers: passengers || [],
                totalPrice,
                bookingReference,
                bookingDate: bookingDate ? new Date(bookingDate) : null,
                status: 'PENDING',
                paymentStatus: 'PENDING',
            },
            include: {
                trip: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        currency: true,
                        startDate: true,
                        endDate: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update available seats
        await tx.trip.update({
            where: { id: tripId },
            data: {
                seatsAvailable: {
                    decrement: passengerCount,
                },
            },
        });

        return newBooking;
    });

    return booking;
};

/**
 * Get user's bookings
 */
const getUserBookings = async (userId, options = {}) => {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = {
        userId,
        ...(status && { status }),
    };

    const [bookings, totalItems] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                trip: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        startDate: true,
                        endDate: true,
                        durationDays: true,
                        images: {
                            take: 1,
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
    ]);

    return {
        bookings,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Get booking by ID
 */
const getBookingById = async (bookingId, userId = null, isAdmin = false) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            trip: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    price: true,
                    currency: true,
                    startDate: true,
                    endDate: true,
                    durationDays: true,
                    destinations: true,
                    images: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    if (!booking) {
        throw ApiError.notFound('Booking not found');
    }

    // Check ownership unless admin
    if (!isAdmin && booking.userId !== userId) {
        throw ApiError.forbidden('You can only view your own bookings');
    }

    return booking;
};

/**
 * Update booking
 */
const updateBooking = async (bookingId, userId, updateData, isAdmin = false) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw ApiError.notFound('Booking not found');
    }

    // Check ownership unless admin
    if (!isAdmin && booking.userId !== userId) {
        throw ApiError.forbidden('You can only update your own bookings');
    }

    // Can only update pending bookings
    if (booking.status !== 'PENDING') {
        throw ApiError.badRequest('Can only update pending bookings');
    }

    const { passengers, bookingDate } = updateData;

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            ...(passengers && { passengers }),
            ...(bookingDate && { bookingDate: new Date(bookingDate) }),
        },
        include: {
            trip: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
        },
    });

    return updatedBooking;
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId, userId, reason = null, isAdmin = false) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { trip: true },
    });

    if (!booking) {
        throw ApiError.notFound('Booking not found');
    }

    // Check ownership unless admin
    if (!isAdmin && booking.userId !== userId) {
        throw ApiError.forbidden('You can only cancel your own bookings');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw ApiError.badRequest('Booking is already cancelled');
    }

    // Cancel booking and restore seats
    const passengerCount = booking.passengers?.length || 1;

    const cancelledBooking = await prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: reason,
            },
            include: {
                trip: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        // Restore seats
        await tx.trip.update({
            where: { id: booking.tripId },
            data: {
                seatsAvailable: {
                    increment: passengerCount,
                },
            },
        });

        return updated;
    });

    return cancelledBooking;
};

/**
 * Confirm booking (admin/payment worker)
 */
const confirmBooking = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw ApiError.notFound('Booking not found');
    }

    if (booking.status !== 'PENDING') {
        throw ApiError.badRequest('Can only confirm pending bookings');
    }

    const confirmedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
        },
        include: {
            trip: {
                select: {
                    id: true,
                    title: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return confirmedBooking;
};

/**
 * Get all bookings for admin
 */
const getAdminBookings = async (options = {}) => {
    const { page = 1, limit = 20, status, tripId, userId } = options;
    const skip = (page - 1) * limit;

    const where = {
        ...(status && { status }),
        ...(tripId && { tripId }),
        ...(userId && { userId }),
    };

    const [bookings, totalItems] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                trip: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
    ]);

    return {
        bookings,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Delete booking (admin hard delete)
 */
const deleteBooking = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw ApiError.notFound('Booking not found');
    }

    await prisma.booking.delete({
        where: { id: bookingId },
    });
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    confirmBooking,
    getAdminBookings,
    deleteBooking,
};

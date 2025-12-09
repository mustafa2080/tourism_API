const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Generate slug from title
 */
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Ensure unique slug
 */
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.trip.findUnique({
            where: { slug },
        });

        if (!existing || existing.id === excludeId) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

/**
 * Create a new trip
 */
const createTrip = async (tripData, userId) => {
    const {
        title,
        description,
        itinerary,
        price,
        currency,
        durationDays,
        startDate,
        endDate,
        destinations,
        tags,
        totalSeats,
        occupancyPolicy,
    } = tripData;

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const trip = await prisma.trip.create({
        data: {
            title,
            slug,
            description,
            itinerary,
            price,
            currency: currency || 'USD',
            durationDays,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            destinations: destinations || [],
            tags: tags || [],
            seatsAvailable: totalSeats,
            totalSeats,
            occupancyPolicy,
            createdById: userId,
            status: 'DRAFT',
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            images: true,
        },
    });

    return trip;
};

/**
 * Get all trips with filters and pagination
 */
const getTrips = async (options = {}) => {
    const {
        page = 1,
        limit = 20,
        q,
        destination,
        startDate,
        endDate,
        priceMin,
        priceMax,
        durationMin,
        durationMax,
        tags,
        status,
        sort = 'newest',
        includeUnpublished = false,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
        // Only show published trips to public unless admin
        ...(!includeUnpublished && { status: 'PUBLISHED' }),
        ...(status && { status }),

        // Text search
        ...(q && {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { itinerary: { contains: q, mode: 'insensitive' } },
            ],
        }),

        // Destination filter
        ...(destination && {
            destinations: { has: destination },
        }),

        // Date filters
        ...(startDate && {
            startDate: { gte: new Date(startDate) },
        }),
        ...(endDate && {
            endDate: { lte: new Date(endDate) },
        }),

        // Price filters
        ...((priceMin || priceMax) && {
            price: {
                ...(priceMin && { gte: parseFloat(priceMin) }),
                ...(priceMax && { lte: parseFloat(priceMax) }),
            },
        }),

        // Duration filters
        ...((durationMin || durationMax) && {
            durationDays: {
                ...(durationMin && { gte: parseInt(durationMin) }),
                ...(durationMax && { lte: parseInt(durationMax) }),
            },
        }),

        // Tags filter
        ...(tags && {
            tags: { hasSome: Array.isArray(tags) ? tags : [tags] },
        }),
    };

    // Build orderBy
    let orderBy;
    switch (sort) {
        case 'price-asc':
            orderBy = { price: 'asc' };
            break;
        case 'price-desc':
            orderBy = { price: 'desc' };
            break;
        case 'duration-asc':
            orderBy = { durationDays: 'asc' };
            break;
        case 'duration-desc':
            orderBy = { durationDays: 'desc' };
            break;
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' };
    }

    const [trips, totalItems] = await Promise.all([
        prisma.trip.findMany({
            where,
            include: {
                images: {
                    orderBy: { order: 'asc' },
                    take: 1, // Only get first image for listing
                },
                _count: {
                    select: { reviews: true, bookings: true },
                },
            },
            skip,
            take: limit,
            orderBy,
        }),
        prisma.trip.count({ where }),
    ]);

    // Calculate average rating for each trip
    const tripsWithRating = await Promise.all(
        trips.map(async (trip) => {
            const avgRating = await prisma.review.aggregate({
                where: { tripId: trip.id, status: 'PUBLISHED' },
                _avg: { rating: true },
            });

            return {
                ...trip,
                averageRating: avgRating._avg.rating || 0,
                reviewCount: trip._count.reviews,
                bookingCount: trip._count.bookings,
            };
        })
    );

    return {
        trips: tripsWithRating,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Get trip by ID or slug
 */
const getTripByIdOrSlug = async (identifier) => {
    // Check if identifier is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const trip = await prisma.trip.findFirst({
        where: isUUID ? { id: identifier } : { slug: identifier },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            images: {
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Get average rating and review count
    const [avgRating, reviewCount] = await Promise.all([
        prisma.review.aggregate({
            where: { tripId: trip.id, status: 'PUBLISHED' },
            _avg: { rating: true },
        }),
        prisma.review.count({
            where: { tripId: trip.id, status: 'PUBLISHED' },
        }),
    ]);

    return {
        ...trip,
        averageRating: avgRating._avg.rating || 0,
        reviewCount,
    };
};

/**
 * Update trip
 */
const updateTrip = async (tripId, updateData) => {
    const existingTrip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!existingTrip) {
        throw ApiError.notFound('Trip not found');
    }

    const {
        title,
        description,
        itinerary,
        price,
        currency,
        durationDays,
        startDate,
        endDate,
        destinations,
        tags,
        seatsAvailable,
        totalSeats,
        occupancyPolicy,
    } = updateData;

    // If title changed, update slug
    let slug = existingTrip.slug;
    if (title && title !== existingTrip.title) {
        const baseSlug = generateSlug(title);
        slug = await ensureUniqueSlug(baseSlug, tripId);
    }

    const trip = await prisma.trip.update({
        where: { id: tripId },
        data: {
            ...(title && { title, slug }),
            ...(description !== undefined && { description }),
            ...(itinerary !== undefined && { itinerary }),
            ...(price !== undefined && { price }),
            ...(currency && { currency }),
            ...(durationDays !== undefined && { durationDays }),
            ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
            ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            ...(destinations && { destinations }),
            ...(tags && { tags }),
            ...(seatsAvailable !== undefined && { seatsAvailable }),
            ...(totalSeats !== undefined && { totalSeats }),
            ...(occupancyPolicy !== undefined && { occupancyPolicy }),
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            images: {
                orderBy: { order: 'asc' },
            },
        },
    });

    return trip;
};

/**
 * Delete trip (soft delete - set to archived)
 */
const deleteTrip = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    await prisma.trip.update({
        where: { id: tripId },
        data: { status: 'ARCHIVED' },
    });
};

/**
 * Publish trip
 */
const publishTrip = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    if (trip.status === 'PUBLISHED') {
        throw ApiError.badRequest('Trip is already published');
    }

    return prisma.trip.update({
        where: { id: tripId },
        data: { status: 'PUBLISHED' },
        include: {
            images: true,
        },
    });
};

/**
 * Unpublish trip
 */
const unpublishTrip = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    if (trip.status !== 'PUBLISHED') {
        throw ApiError.badRequest('Trip is not published');
    }

    return prisma.trip.update({
        where: { id: tripId },
        data: { status: 'DRAFT' },
        include: {
            images: true,
        },
    });
};

/**
 * Get trip availability
 */
const getTripAvailability = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
            id: true,
            title: true,
            seatsAvailable: true,
            totalSeats: true,
            startDate: true,
            endDate: true,
            status: true,
        },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Count confirmed bookings
    const confirmedBookings = await prisma.booking.count({
        where: {
            tripId,
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
    });

    return {
        ...trip,
        confirmedBookings,
        availableSeats: trip.seatsAvailable,
        isAvailable: trip.seatsAvailable > 0 && trip.status === 'PUBLISHED',
    };
};

/**
 * Get trip itinerary
 */
const getTripItinerary = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
            id: true,
            title: true,
            itinerary: true,
            durationDays: true,
        },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    return trip;
};

/**
 * Override trip availability (admin)
 */
const overrideAvailability = async (tripId, seatsAvailable) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    return prisma.trip.update({
        where: { id: tripId },
        data: { seatsAvailable },
        select: {
            id: true,
            title: true,
            seatsAvailable: true,
            totalSeats: true,
        },
    });
};

module.exports = {
    createTrip,
    getTrips,
    getTripByIdOrSlug,
    updateTrip,
    deleteTrip,
    publishTrip,
    unpublishTrip,
    getTripAvailability,
    getTripItinerary,
    overrideAvailability,
};

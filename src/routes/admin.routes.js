const express = require('express');
const router = express.Router();
const { userController, tripController, reviewController, bookingController } = require('../controllers');
const { authenticate, authorize, validate } = require('../middlewares');
const {
    listUsersValidator,
    overrideAvailabilityValidator,
    listTripsValidator,
    listAuditLogsValidator,
} = require('../validators');
const { listReviewsValidator, moderateReviewValidator } = require('../validators/review.validator');
const { listBookingsValidator } = require('../validators/booking.validator');
const { auditService, authService } = require('../services');
const prisma = require('../config/database');
const { ApiResponse, catchAsync } = require('../utils');
const { body } = require('express-validator');

/**
 * Admin routes - require ADMIN role
 */

// =============== Dashboard ===============

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard/stats', authenticate, authorize('ADMIN'), catchAsync(async (req, res) => {
    const [
        totalUsers,
        totalTrips,
        totalBookings,
        totalRevenue,
        pendingBookings,
        flaggedReviews,
        recentBookings,
        topTrips,
        bookingsByStatus,
        usersByRole,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.booking.count(),
        prisma.booking.aggregate({
            where: { status: 'CONFIRMED' },
            _sum: { totalPrice: true },
        }),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.review.count({ where: { status: 'FLAGGED' } }),
        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                trip: { select: { title: true } },
                user: { select: { name: true, email: true } },
            },
        }),
        prisma.trip.findMany({
            where: { status: 'PUBLISHED' },
            take: 5,
            orderBy: { bookings: { _count: 'desc' } },
            select: {
                id: true,
                title: true,
                slug: true,
                _count: { select: { bookings: true, reviews: true } },
            },
        }),
        prisma.booking.groupBy({
            by: ['status'],
            _count: { status: true },
        }),
        prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
        }),
    ]);

    return ApiResponse.success(res, {
        overview: {
            totalUsers,
            totalTrips,
            totalBookings,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            pendingBookings,
            flaggedReviews,
        },
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {}),
        usersByRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
        }, {}),
        recentBookings,
        topTrips,
    }, 'Dashboard stats retrieved successfully');
}));

// =============== Users ===============

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users with filters
 * @access  Admin only
 */
router.get('/users', authenticate, authorize('ADMIN'), listUsersValidator, validate, userController.listUsers);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create a new user with any role (Admin, Support, User)
 * @access  Admin only
 */
router.post('/users',
    authenticate,
    authorize('ADMIN'),
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('role').isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Role must be USER, ADMIN, or SUPPORT'),
        body('phone').optional().trim(),
    ],
    validate,
    catchAsync(async (req, res) => {
        const { name, email, password, phone, role } = req.body;

        const user = await authService.createUserByAdmin({
            name,
            email,
            password,
            phone,
            role,
        });

        // Log the action
        await auditService.logAction({
            actorId: req.user.id,
            action: 'USER_CREATED_BY_ADMIN',
            targetType: 'USER',
            targetId: user.id,
            metadata: { role, email },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        return ApiResponse.created(res, user, `${role} user created successfully`);
    })
);

// =============== Trips ===============

/**
 * @route   GET /api/v1/admin/trips
 * @desc    List all trips (including unpublished) with filters
 * @access  Admin only
 */
router.get('/trips', authenticate, authorize('ADMIN'), listTripsValidator, validate, tripController.getAdminTrips);

/**
 * @route   PUT /api/v1/admin/trips/:tripId/override-availability
 * @desc    Override trip availability
 * @access  Admin only
 */
router.put('/trips/:tripId/override-availability', authenticate, authorize('ADMIN'), overrideAvailabilityValidator, validate, tripController.overrideAvailability);

// =============== Reviews ===============

/**
 * @route   GET /api/v1/admin/reviews
 * @desc    List all reviews with filters
 * @access  Admin only
 */
router.get('/reviews', authenticate, authorize('ADMIN'), listReviewsValidator, validate, reviewController.getAdminReviews);

/**
 * @route   PUT /api/v1/admin/reviews/:reviewId/moderate
 * @desc    Moderate a review
 * @access  Admin only
 */
router.put('/reviews/:reviewId/moderate', authenticate, authorize('ADMIN'), moderateReviewValidator, validate, reviewController.moderateReview);

// =============== Bookings ===============

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    List all bookings with filters
 * @access  Admin only
 */
router.get('/bookings', authenticate, authorize('ADMIN'), listBookingsValidator, validate, bookingController.getAdminBookings);

// =============== Audit Logs ===============

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs
 * @access  Admin only
 */
router.get('/audit-logs', authenticate, authorize('ADMIN'), listAuditLogsValidator, validate, catchAsync(async (req, res) => {
    const { page, limit, actorId, action, targetType, startDate, endDate } = req.query;

    const result = await auditService.getAuditLogs({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        actorId,
        action,
        targetType,
        startDate,
        endDate,
    });

    return ApiResponse.paginated(res, result.logs, result.pagination, 'Audit logs retrieved successfully');
}));

// =============== Maintenance ===============

/**
 * @route   POST /api/v1/admin/maintenance/reindex
 * @desc    Trigger search index rebuild (placeholder)
 * @access  Admin only
 */
router.post('/maintenance/reindex', authenticate, authorize('ADMIN'), catchAsync(async (req, res) => {
    // In production, this would trigger a background job
    // to rebuild search indices (e.g., Elasticsearch)

    await auditService.logAction({
        actorId: req.user.id,
        action: 'MAINTENANCE_REINDEX',
        targetType: 'SYSTEM',
        metadata: { triggeredAt: new Date().toISOString() },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });

    return ApiResponse.success(res, {
        message: 'Reindex job queued',
        jobId: `reindex-${Date.now()}`,
    }, 'Reindex triggered successfully');
}));

module.exports = router;

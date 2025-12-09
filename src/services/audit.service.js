const prisma = require('../config/database');

/**
 * Log an audit event
 */
const logAction = async (data) => {
    const {
        actorId,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress,
        userAgent,
    } = data;

    try {
        await prisma.auditLog.create({
            data: {
                actorId,
                action,
                targetType,
                targetId,
                metadata: metadata || {},
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

/**
 * Get audit logs with filters
 */
const getAuditLogs = async (options = {}) => {
    const {
        page = 1,
        limit = 50,
        actorId,
        action,
        targetType,
        startDate,
        endDate,
    } = options;
    const skip = (page - 1) * limit;

    const where = {
        ...(actorId && { actorId }),
        ...(action && { action }),
        ...(targetType && { targetType }),
        ...((startDate || endDate) && {
            timestamp: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
            },
        }),
    };

    const [logs, totalItems] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { timestamp: 'desc' },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Audit action types
 */
const AuditActions = {
    // Auth
    USER_REGISTERED: 'USER_REGISTERED',
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    PASSWORD_RESET: 'PASSWORD_RESET',

    // User
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',

    // Trip
    TRIP_CREATED: 'TRIP_CREATED',
    TRIP_UPDATED: 'TRIP_UPDATED',
    TRIP_DELETED: 'TRIP_DELETED',
    TRIP_PUBLISHED: 'TRIP_PUBLISHED',
    TRIP_UNPUBLISHED: 'TRIP_UNPUBLISHED',

    // Booking
    BOOKING_CREATED: 'BOOKING_CREATED',
    BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED: 'BOOKING_CANCELLED',
    BOOKING_DELETED: 'BOOKING_DELETED',

    // Review
    REVIEW_CREATED: 'REVIEW_CREATED',
    REVIEW_MODERATED: 'REVIEW_MODERATED',
    REVIEW_DELETED: 'REVIEW_DELETED',

    // Image
    IMAGE_UPLOADED: 'IMAGE_UPLOADED',
    IMAGE_DELETED: 'IMAGE_DELETED',
};

/**
 * Middleware to add audit context to request
 */
const auditMiddleware = (req, res, next) => {
    req.audit = async (action, targetType, targetId, metadata = {}) => {
        await logAction({
            actorId: req.user?.id,
            action,
            targetType,
            targetId,
            metadata,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
        });
    };
    next();
};

module.exports = {
    logAction,
    getAuditLogs,
    AuditActions,
    auditMiddleware,
};

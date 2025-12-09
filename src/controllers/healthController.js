const prisma = require('../config/database');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Health check endpoint
 * GET /api/v1/health
 */
const healthCheck = catchAsync(async (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    };

    // Check database connection
    try {
        await prisma.$queryRaw`SELECT 1`;
        healthData.database = 'connected';
    } catch (error) {
        healthData.database = 'disconnected';
        healthData.status = 'degraded';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    healthData.memory = {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    return res.status(statusCode).json({
        success: true,
        data: healthData,
    });
});

/**
 * Get supported currencies
 * GET /api/v1/metadata/currencies
 */
const getCurrencies = (req, res) => {
    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    ];

    return ApiResponse.success(res, currencies, 'Currencies retrieved successfully');
};

/**
 * Get available destinations
 * GET /api/v1/metadata/destinations
 */
const getDestinations = catchAsync(async (req, res) => {
    // Get unique destinations from trips
    const trips = await prisma.trip.findMany({
        where: { status: 'PUBLISHED' },
        select: { destinations: true },
    });

    // Flatten and get unique destinations
    const allDestinations = trips.flatMap((trip) => trip.destinations);
    const uniqueDestinations = [...new Set(allDestinations)].sort();

    return ApiResponse.success(res, uniqueDestinations, 'Destinations retrieved successfully');
});

module.exports = {
    healthCheck,
    getCurrencies,
    getDestinations,
};

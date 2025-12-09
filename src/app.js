const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares');
const { auditMiddleware } = require('./services/audit.service');

const app = express();

// ===================
// Security Middlewares
// ===================

// Helmet - security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - General
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Rate limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    message: {
        success: false,
        error: {
            message: 'Too many login attempts, please try again later',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// ===================
// Body Parsers
// ===================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// ===================
// Logging
// ===================

if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===================
// Audit Middleware
// ===================

app.use(auditMiddleware);

// ===================
// Routes
// ===================

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Storck Tours API',
        version: '1.0.0',
        documentation: '/api/v1/docs',
        endpoints: {
            health: '/api/v1/health',
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            trips: '/api/v1/trips',
            bookings: '/api/v1/bookings',
            reviews: '/api/v1/reviews',
            favorites: '/api/v1/favorites',
            search: '/api/v1/search',
            admin: '/api/v1/admin',
        },
    });
});

// API routes
app.use('/api/v1', routes);

// ===================
// Error Handling
// ===================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;

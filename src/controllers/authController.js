const { authService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');
const config = require('../config');

/**
 * Set refresh token cookie
 */
const setRefreshTokenCookie = (res, token) => {
    const days = parseInt(config.jwt.refreshExpiresIn) || 7;
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: days * 24 * 60 * 60 * 1000,
    });
};

/**
 * Clear refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken');
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = catchAsync(async (req, res) => {
    const { name, email, password, phone } = req.body;

    const result = await authService.register({ name, email, password, phone });

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    return ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
    }, 'Registration successful');
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    return ApiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
    }, 'Login successful');
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
        await authService.logout(refreshToken);
    }

    clearRefreshTokenCookie(res);

    return ApiResponse.success(res, null, 'Logout successful');
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refresh = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        throw require('../utils/ApiError').unauthorized('Refresh token is required');
    }

    const result = await authService.refresh(refreshToken);

    return ApiResponse.success(res, {
        accessToken: result.accessToken,
    }, 'Token refreshed successfully');
});

/**
 * Forgot password
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return ApiResponse.success(res, result, 'Password reset email sent');
});

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    return ApiResponse.success(res, null, result.message);
});

/**
 * Register admin/support user
 * POST /api/v1/auth/register-admin
 */
const registerAdmin = catchAsync(async (req, res) => {
    const { name, email, password, phone, role, adminSecret } = req.body;

    const result = await authService.registerAdmin(
        { name, email, password, phone, role },
        adminSecret
    );

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    return ApiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
    }, `${role} registration successful`);
});

module.exports = {
    register,
    registerAdmin,
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Hash a password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate access token
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * Generate refresh token and store in database
 */
const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(40).toString('hex');

    // Calculate expiry date
    const expiresAt = new Date();
    const days = parseInt(config.jwt.refreshExpiresIn) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    // Store in database
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    });

    return token;
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
        // Delete expired token
        await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
        throw ApiError.unauthorized('Refresh token expired');
    }

    return refreshToken;
};

/**
 * Revoke refresh token
 */
const revokeRefreshToken = async (token) => {
    try {
        await prisma.refreshToken.delete({ where: { token } });
    } catch (error) {
        // Token might not exist, ignore
    }
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId) => {
    await prisma.refreshToken.deleteMany({ where: { userId } });
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = async (email) => {
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any existing reset tokens for this email
    await prisma.passwordReset.deleteMany({ where: { email } });

    // Create new reset token
    await prisma.passwordReset.create({
        data: {
            email,
            token,
            expiresAt,
        },
    });

    return token;
};

/**
 * Verify password reset token
 */
const verifyPasswordResetToken = async (token) => {
    const resetRecord = await prisma.passwordReset.findUnique({
        where: { token },
    });

    if (!resetRecord) {
        throw ApiError.badRequest('Invalid or expired reset token');
    }

    if (resetRecord.used) {
        throw ApiError.badRequest('Reset token has already been used');
    }

    if (resetRecord.expiresAt < new Date()) {
        throw ApiError.badRequest('Reset token has expired');
    }

    return resetRecord;
};

/**
 * Mark reset token as used
 */
const markResetTokenUsed = async (token) => {
    await prisma.passwordReset.update({
        where: { token },
        data: { used: true },
    });
};

/**
 * Register a new user
 */
const register = async (userData) => {
    const { name, email, password, phone } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        user,
        accessToken,
        refreshToken,
    };
};

/**
 * Register a new admin/support user (requires admin secret)
 */
const registerAdmin = async (userData, adminSecret) => {
    const { name, email, password, phone, role } = userData;

    // Verify admin secret
    const expectedSecret = process.env.ADMIN_SECRET || 'storck-admin-secret-2024';
    if (adminSecret !== expectedSecret) {
        throw ApiError.unauthorized('Invalid admin secret');
    }

    // Validate role
    const allowedRoles = ['USER', 'ADMIN', 'SUPPORT'];
    if (!allowedRoles.includes(role)) {
        throw ApiError.badRequest('Invalid role. Must be USER, ADMIN, or SUPPORT');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with specified role
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        user,
        accessToken,
        refreshToken,
    };
};

/**
 * Login user
 */
const login = async (email, password) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
        throw ApiError.unauthorized('Account is deactivated');
    }

    // Check password
    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePhoto: user.profilePhoto,
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token
 */
const refresh = async (refreshTokenValue) => {
    const tokenRecord = await verifyRefreshToken(refreshTokenValue);

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.userId);

    return { accessToken };
};

/**
 * Logout user (revoke refresh token)
 */
const logout = async (refreshTokenValue) => {
    await revokeRefreshToken(refreshTokenValue);
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash);

    if (!isMatch) {
        throw ApiError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });

    // Revoke all refresh tokens
    await revokeAllUserTokens(userId);
};

/**
 * Forgot password - generate reset token
 */
const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Don't reveal if user exists or not
    if (!user) {
        return { message: 'If the email exists, a reset link will be sent' };
    }

    const resetToken = await generatePasswordResetToken(email);

    // TODO: Send email with reset link
    // For now, return token (in production, this should be sent via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
        message: 'If the email exists, a reset link will be sent',
        // Remove this in production - only for development
        ...(config.nodeEnv === 'development' && { resetToken }),
    };
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
    const resetRecord = await verifyPasswordResetToken(token);

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: resetRecord.email },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
    });

    // Mark token as used
    await markResetTokenUsed(token);

    // Revoke all refresh tokens
    await revokeAllUserTokens(user.id);

    return { message: 'Password reset successful' };
};

/**
 * Create user by admin (with specific role)
 */
const createUserByAdmin = async (userData) => {
    const { name, email, password, phone, role } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with specified role
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
            role: role || 'USER',
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return user;
};

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    register,
    registerAdmin,
    login,
    refresh,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    createUserByAdmin,
};

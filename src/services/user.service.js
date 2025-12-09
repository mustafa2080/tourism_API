const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Get user by ID
 */
const getUserById = async (id, includePassword = false) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            profilePhoto: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            ...(includePassword && { passwordHash: true }),
        },
    });

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return user;
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
    const { name, phone, profilePhoto } = updateData;

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(profilePhoto !== undefined && { profilePhoto }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            profilePhoto: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (options = {}) => {
    const { page = 1, limit = 20, role, isActive, search } = options;
    const skip = (page - 1) * limit;

    const where = {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [users, totalItems] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                profilePhoto: true,
                isActive: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Update user by admin
 */
const updateUserByAdmin = async (userId, updateData) => {
    const { role, isActive } = updateData;

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};

/**
 * Soft delete user
 */
const deleteUser = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
    });
};

module.exports = {
    getUserById,
    getUserByEmail,
    updateProfile,
    getAllUsers,
    updateUserByAdmin,
    deleteUser,
};

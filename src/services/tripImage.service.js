const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Add image to trip
 */
const addImage = async (tripId, imageData) => {
    const { url, altText, order } = imageData;

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Get max order if not provided
    let imageOrder = order;
    if (imageOrder === undefined) {
        const lastImage = await prisma.tripImage.findFirst({
            where: { tripId },
            orderBy: { order: 'desc' },
        });
        imageOrder = lastImage ? lastImage.order + 1 : 0;
    }

    const image = await prisma.tripImage.create({
        data: {
            tripId,
            url,
            altText,
            order: imageOrder,
        },
    });

    return image;
};

/**
 * Get all images for a trip
 */
const getTripImages = async (tripId) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    const images = await prisma.tripImage.findMany({
        where: { tripId },
        orderBy: { order: 'asc' },
    });

    return images;
};

/**
 * Update image
 */
const updateImage = async (tripId, imageId, updateData) => {
    const { altText, order } = updateData;

    // Check if image exists and belongs to trip
    const image = await prisma.tripImage.findFirst({
        where: { id: imageId, tripId },
    });

    if (!image) {
        throw ApiError.notFound('Image not found');
    }

    const updatedImage = await prisma.tripImage.update({
        where: { id: imageId },
        data: {
            ...(altText !== undefined && { altText }),
            ...(order !== undefined && { order }),
        },
    });

    return updatedImage;
};

/**
 * Delete image
 */
const deleteImage = async (tripId, imageId) => {
    // Check if image exists and belongs to trip
    const image = await prisma.tripImage.findFirst({
        where: { id: imageId, tripId },
    });

    if (!image) {
        throw ApiError.notFound('Image not found');
    }

    await prisma.tripImage.delete({
        where: { id: imageId },
    });
};

/**
 * Reorder images
 */
const reorderImages = async (tripId, imageOrders) => {
    // imageOrders is array of { imageId, order }

    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Update all images in a transaction
    await prisma.$transaction(
        imageOrders.map(({ imageId, order }) =>
            prisma.tripImage.update({
                where: { id: imageId },
                data: { order },
            })
        )
    );

    // Return updated images
    return prisma.tripImage.findMany({
        where: { tripId },
        orderBy: { order: 'asc' },
    });
};

module.exports = {
    addImage,
    getTripImages,
    updateImage,
    deleteImage,
    reorderImages,
};

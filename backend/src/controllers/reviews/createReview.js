const prisma = require("../../utils/db");

async function createReview(req, res) {
  const { reviewedUserId, rating, comment } = req.body;
  const reviewerId = req.user.id;

  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if reviewer is trying to review themselves
    if (reviewerId === reviewedUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    // Check if reviewed user exists
    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedUserId },
    });

    if (!reviewedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        reviewerId_reviewedUserId: {
          reviewerId,
          reviewedUserId,
        },
      },
      update: {
        rating,
        comment,
        updatedAt: new Date(),
      },
      create: {
        reviewerId,
        reviewedUserId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Review created/updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = createReview;

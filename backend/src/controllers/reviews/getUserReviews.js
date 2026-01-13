const prisma = require("../../utils/db");

async function getUserReviews(req, res) {
  const { userId } = req.params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get reviews for the user
    const reviews = await prisma.review.findMany({
      where: {
        reviewedUserId: userId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getUserReviews;

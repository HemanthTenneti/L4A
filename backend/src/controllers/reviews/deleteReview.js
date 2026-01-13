const prisma = require("../../utils/db");

async function deleteReview(req, res) {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the reviewer
    if (review.reviewerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = deleteReview;

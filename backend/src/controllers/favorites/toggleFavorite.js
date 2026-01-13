const prisma = require("../../utils/db");

async function toggleFavorite(req, res) {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      res.json({
        success: true,
        message: "Post removed from favorites",
        data: { isFavorited: false },
      });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId,
          postId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Post added to favorites",
        data: { isFavorited: true },
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = toggleFavorite;

const prisma = require("../../utils/db");

async function checkFavorite(req, res) {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
      },
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = checkFavorite;

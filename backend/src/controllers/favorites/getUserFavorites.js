const prisma = require("../../utils/db");

async function getUserFavorites(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Get paginated favorites
    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: favorites.map(fav => fav.post),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getUserFavorites;

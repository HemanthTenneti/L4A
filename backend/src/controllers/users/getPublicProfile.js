const prisma = require("../../utils/db");

const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        isVerified: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getPublicProfile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getPublicProfile;

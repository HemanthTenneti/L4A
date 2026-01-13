const prisma = require("../../utils/db");

const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === "true") {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getNotifications;

const prisma = require("../../utils/db");

const getUserRooms = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.chatRoom.count({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    res.json({
      success: true,
      data: rooms,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = getUserRooms;

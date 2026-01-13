const prisma = require("../../utils/db");

const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.userId;

    // Check if user is a participant
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      select: {
        id: true,
        participants: {
          where: { userId },
        },
      },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!chatRoom.participants.length) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this chat",
      });
    }

    const messages = await prisma.message.findMany({
      where: { chatRoomId: id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.message.count({
      where: { chatRoomId: id },
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getChatMessages;

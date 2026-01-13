const prisma = require("../../utils/db");

const getChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            description: true,
            userId: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Check if user is a participant
    const isParticipant = chatRoom.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this chat",
      });
    }

    res.json({ success: true, data: chatRoom });
  } catch (error) {
    console.error("getChatRoom error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getChatRoom;

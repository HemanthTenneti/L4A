const prisma = require("../../utils/db");

const leaveRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.userId;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { participants: true, post: true },
    });

    if (!chatRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Chat room not found" });
    }

    // Check if user is a participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId,
          userId,
        },
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat room",
      });
    }

    // Remove user from chat room
    await prisma.chatParticipant.delete({
      where: {
        id: participant.id,
      },
    });

    // If user is the last one, optionally delete the chat room
    const remainingParticipants = await prisma.chatParticipant.count({
      where: { chatRoomId },
    });

    res.json({
      success: true,
      message: "Left chat room successfully",
      data: { remainingParticipants },
    });
  } catch (error) {
    console.error("Error leaving chat room:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = leaveRoom;

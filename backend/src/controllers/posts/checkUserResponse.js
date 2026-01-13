const prisma = require("../../utils/db");

const checkUserResponse = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { chatRoom: true },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // If post doesn't have a chat room, user hasn't responded
    if (!post.chatRoom) {
      return res.json({ success: true, data: { responded: false } });
    }

    // Check if user is a participant in the chat room
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: post.chatRoom.id,
          userId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        responded: !!participation,
        chatRoomId: post.chatRoom.id,
      },
    });
  } catch (error) {
    console.error("Error checking user response:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = checkUserResponse;

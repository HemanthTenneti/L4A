const { PrismaClient } = require("@prisma/client");
const { getIO } = require("../../utils/socket");
const { sendToastToRoom, createToast, TOAST_TYPES } = require("../../utils/toast");

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        chatRoom: {
          include: {
            participants: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.isOpen) {
      return res.status(403).json({
        success: false,
        message: "Post is closed. No new responses allowed",
      });
    }

    if (post.userId === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot respond to your own post",
      });
    }

    let chat = post.chatRoom;

    if (!chat) {
      chat = await prisma.chatRoom.create({
        data: {
          postId: id,
          isGroup: post.allowMultipleParticipants,
          participants: {
            create: [
              {
                userId: post.userId,
                role: "OWNER",
              },
              {
                userId,
                role: "MEMBER",
              },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    } else if (!chat.participants.length) {
      await prisma.chatParticipant.create({
        data: {
          chatRoomId: chat.id,
          userId,
          role: "MEMBER",
        },
      });
    }

    res.json({
      success: true,
      data: chat,
      message:
        chat.participants.length === 2
          ? "Chat created"
          : "You have joined the chat",
    });
  } catch (error) {
    console.error("respondToPost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to post",
    });
  }
};

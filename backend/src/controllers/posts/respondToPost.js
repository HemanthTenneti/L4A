const prisma = require("../../utils/db");
const { getIO } = require("../../utils/socket");
const {
  sendToastToRoom,
  createToast,
  TOAST_TYPES,
} = require("../../utils/toast");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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
          participants: {
            include: { user: true },
          },
        },
      });

      const responder = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      });

      // Create notification for the post owner
      await prisma.notification.create({
        data: {
          userId: post.userId,
          postId: id,
          type: "POST_RESPONSE",
          payload: {
            responderId: responder.id,
            responderName: responder.username,
            postTitle: post.title,
            chatRoomId: chat.id,
          },
        },
      });

      // Emit notification via socket
      const io = getIO();
      io.to(post.userId).emit("notification:new", {
        type: "POST_RESPONSE",
        message: `${responder.username} responded to your post "${post.title}"`,
        postId: id,
        chatRoomId: chat.id,
      });

      const toast = createToast(
        TOAST_TYPES.INFO,
        `${responder.username} started a chat`,
        3000
      );
      sendToastToRoom(chat.id, toast);
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

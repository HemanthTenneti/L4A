const { PrismaClient } = require("@prisma/client");
const { getIO } = require("../../utils/socket");
const {
  sendToastToRoom,
  createToast,
  TOAST_TYPES,
} = require("../../utils/toast");

const prisma = new PrismaClient();

const closePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { chatRoom: true },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.userId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to close this post" });
    }

    if (!post.isOpen) {
      return res
        .status(400)
        .json({ success: false, message: "Post is already closed" });
    }

    const closedPost = await prisma.post.update({
      where: { id },
      data: { isOpen: false },
      include: {
        user: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
        chatRoom: true,
      },
    });

    if (closedPost.chatRoom) {
      const io = getIO();
      io.to(closedPost.chatRoom.id).emit("post:closed", {
        postId: id,
        message: "Post has been closed",
      });

      const toast = createToast(
        TOAST_TYPES.WARNING,
        "Post has been closed",
        3000
      );
      sendToastToRoom(closedPost.chatRoom.id, toast);
    }

    res.json({
      success: true,
      message: "Post closed successfully",
      data: closedPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = closePost;

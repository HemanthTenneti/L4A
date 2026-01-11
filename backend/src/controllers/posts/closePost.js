const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const closePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.userId !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to close this post" });
    }

    if (post.isClosed) {
      return res
        .status(400)
        .json({ success: false, message: "Post is already closed" });
    }

    const closedPost = await prisma.post.update({
      where: { id },
      data: { isClosed: true },
      include: {
        user: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
      },
    });

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

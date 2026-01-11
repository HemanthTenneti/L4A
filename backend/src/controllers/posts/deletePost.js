const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const deletePost = async (req, res) => {
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
        .json({
          success: false,
          message: "Not authorized to delete this post",
        });
    }

    await prisma.post.delete({ where: { id } });
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = deletePost;

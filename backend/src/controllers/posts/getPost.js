const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true } },
        chatRooms: {
          select: {
            id: true,
            createdAt: true,
            _count: { select: { participants: true } },
          },
        },
        _count: { select: { chatRooms: true } },
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getPost;

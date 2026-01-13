const prisma = require("../../utils/db");

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true } },
        chatRoom: {
          select: {
            id: true,
            createdAt: true,
            _count: { select: { participants: true } },
          },
        },
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Return userId alongside user object for frontend comparison
    const postData = {
      ...post,
      userId: post.userId, // Explicitly include userId
    };

    res.json({ success: true, data: postData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getPost;

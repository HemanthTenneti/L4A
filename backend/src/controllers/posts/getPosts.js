const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const {
      categoryId,
      search,
      location,
      isClosed,
      sort = "latest",
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (location) where.location = { contains: location };
    if (isClosed !== undefined) where.isClosed = isClosed === "true";

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "popular"
        ? { chatRooms: { _count: "desc" } }
        : { createdAt: "desc" };

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { chatRooms: true } },
      },
    });

    const total = await prisma.post.count({ where });

    res.json({
      success: true,
      data: posts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getPosts;

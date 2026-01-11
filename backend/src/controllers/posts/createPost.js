const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  categoryId: z.string().uuid(),
  location: z.string().optional(),
  allowMultipleChats: z.boolean().default(false),
});

const createPost = async (req, res) => {
  try {
    const validatedData = createPostSchema.parse(req.body);
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        userId: req.userId,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createPost;

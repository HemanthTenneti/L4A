const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();

const updatePostSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  categoryId: z.string().uuid().optional(),
  location: z.string().optional(),
  allowMultipleChats: z.boolean().optional(),
});

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updatePostSchema.parse(req.body);
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
          message: "Not authorized to update this post",
        });
    }

    if (post.isClosed) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update a closed post" });
    }

    if (validatedData.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });
      if (!categoryExists) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: validatedData,
      include: {
        user: { select: { id: true, username: true } },
        category: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = updatePost;

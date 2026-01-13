const prisma = require("../../utils/db");
const { z } = require("zod");

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    // Check if username is already taken (if updating username)
    if (validatedData.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUser && existingUser.id !== req.userId) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: validatedData,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        isVerified: true,
        isBanned: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = updateProfile;

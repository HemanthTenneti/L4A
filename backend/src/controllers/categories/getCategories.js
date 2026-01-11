const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getCategories;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Team",
    slug: "team",
    description: "Looking 4 team members or collaborators",
  },
  {
    name: "Items",
    slug: "items",
    description: "Looking 4 items or products",
  },
  {
    name: "Rides",
    slug: "rides",
    description: "Looking 4 or offering rides",
  },
  {
    name: "Housing",
    slug: "housing",
    description: "Looking 4 housing or roommates",
  },
  {
    name: "Services",
    slug: "services",
    description: "Looking 4 services or expertise",
  },
  {
    name: "Learning",
    slug: "learning",
    description: "Looking 4 learning opportunities or tutors",
  },
  {
    name: "Events",
    slug: "events",
    description: "Looking 4 event attendees or participants",
  },
  {
    name: "Other",
    slug: "other",
    description: "Other requests",
  },
];

async function main() {
  for (const category of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

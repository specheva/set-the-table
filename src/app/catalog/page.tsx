import { prisma } from "@/lib/db";
import { MealGrid } from "@/components/catalog/MealGrid";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [meals, tags] = await Promise.all([
    prisma.meal.findMany({
      include: {
        tags: { include: { tag: true } },
        ingredients: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <MealGrid
      meals={JSON.parse(JSON.stringify(meals))}
      tags={JSON.parse(JSON.stringify(tags))}
    />
  );
}

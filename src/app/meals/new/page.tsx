import { prisma } from "@/lib/db";
import { MealForm } from "@/components/meals/MealForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { import?: string };
}

export default async function NewMealPage({ searchParams }: Props) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return <MealForm tags={JSON.parse(JSON.stringify(tags))} showImport={searchParams.import === "true"} />;
}

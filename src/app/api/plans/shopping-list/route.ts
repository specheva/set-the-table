import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeIngredientName } from "@/lib/ingredient-utils";

const CATEGORY_ORDER = [
  "protein",
  "produce",
  "dairy",
  "pantry",
  "spice",
  "other",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  protein: "Protein",
  produce: "Produce",
  dairy: "Dairy",
  pantry: "Pantry",
  spice: "Spices",
  other: "Other",
};

interface AggregatedItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  fromMeals: string[];
}

interface CategoryGroup {
  name: string;
  items: AggregatedItem[];
}

export async function GET(req: NextRequest) {
  const weekPlanId = req.nextUrl.searchParams.get("weekPlanId");
  if (!weekPlanId) {
    return NextResponse.json(
      { error: "weekPlanId query parameter is required" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const householdId = (session as any)?.householdId || null;

  const plan = await prisma.weekPlan.findFirst({
    where: {
      id: weekPlanId,
      ...(householdId ? { householdId } : { householdId: null }),
    },
    include: {
      entries: {
        include: {
          meal: {
            include: {
              ingredients: true,
            },
          },
        },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Aggregate ingredients across all meals in the plan
  const ingredientMap = new Map<
    string, // key: normalizedName + "|" + unit
    {
      originalName: string;
      normalizedName: string;
      quantity: number | null;
      unit: string | null;
      category: string;
      mealTitles: Set<string>;
      canSum: boolean;
    }
  >();

  for (const entry of plan.entries) {
    const meal = entry.meal;
    for (const ing of meal.ingredients) {
      const normalized = normalizeIngredientName(ing.name);
      const unitKey = (ing.unit ?? "").toLowerCase().trim();
      const mapKey = `${normalized}|${unitKey}`;

      const existing = ingredientMap.get(mapKey);
      if (existing) {
        existing.mealTitles.add(meal.title);
        if (existing.canSum && ing.quantity !== null && existing.quantity !== null) {
          existing.quantity += ing.quantity;
        } else {
          existing.canSum = false;
        }
        // Keep the shorter original name for display
        if (ing.name.length < existing.originalName.length) {
          existing.originalName = ing.name;
        }
      } else {
        const rawCategory = (ing.category ?? "other").toLowerCase().trim();
        const category = CATEGORY_ORDER.includes(rawCategory as any)
          ? rawCategory
          : "other";

        ingredientMap.set(mapKey, {
          originalName: ing.name,
          normalizedName: normalized,
          quantity: ing.quantity,
          unit: ing.unit,
          category,
          mealTitles: new Set([meal.title]),
          canSum: ing.quantity !== null,
        });
      }
    }
  }

  // Group by category
  const categoryMap = new Map<string, AggregatedItem[]>();
  for (const cat of CATEGORY_ORDER) {
    categoryMap.set(cat, []);
  }

  for (const entry of ingredientMap.values()) {
    const items = categoryMap.get(entry.category) ?? categoryMap.get("other")!;
    items.push({
      name: entry.originalName,
      quantity: entry.quantity,
      unit: entry.unit,
      fromMeals: [...entry.mealTitles],
    });
  }

  // Sort items alphabetically within each category
  for (const items of categoryMap.values()) {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Build response, only include non-empty categories
  const categories: CategoryGroup[] = [];
  let totalItems = 0;

  for (const cat of CATEGORY_ORDER) {
    const items = categoryMap.get(cat)!;
    if (items.length > 0) {
      categories.push({
        name: CATEGORY_LABELS[cat] ?? cat,
        items,
      });
      totalItems += items.length;
    }
  }

  return NextResponse.json({ categories, totalItems });
}

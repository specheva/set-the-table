"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Beef,
  Carrot,
  Milk,
  Package,
  Flame,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Copy,
  Share2,
  Check,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface ShoppingItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  fromMeals: string[];
}

interface CategoryGroup {
  name: string;
  items: ShoppingItem[];
}

interface ShoppingListData {
  categories: CategoryGroup[];
  totalItems: number;
}

interface ShoppingListProps {
  weekPlanId: string;
}

// ── Category icons ─────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Protein: Beef,
  Produce: Carrot,
  Dairy: Milk,
  Pantry: Package,
  Spices: Flame,
  Other: ShoppingCart,
};

const CATEGORY_COLORS: Record<string, string> = {
  Protein: "text-red-600 bg-red-50",
  Produce: "text-green-600 bg-green-50",
  Dairy: "text-blue-600 bg-blue-50",
  Pantry: "text-amber-600 bg-amber-50",
  Spices: "text-orange-600 bg-orange-50",
  Other: "text-stone-600 bg-stone-100",
};

// ── Helpers ────────────────────────────────────────────────────────────

function formatQuantity(qty: number | null, unit: string | null): string {
  if (qty === null && unit === null) return "";
  const parts: string[] = [];
  if (qty !== null) {
    // Show clean numbers: 1 instead of 1.00, but keep 1.5
    parts.push(Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
  }
  if (unit) parts.push(unit);
  return parts.join(" ");
}

function buildPlainTextList(
  data: ShoppingListData,
  checkedItems: Set<string>
): string {
  const lines: string[] = ["Shopping List", "=".repeat(40)];

  for (const category of data.categories) {
    lines.push("", `## ${category.name}`);
    for (const item of category.items) {
      const checked = checkedItems.has(item.name);
      const mark = checked ? "[x]" : "[ ]";
      const qty = formatQuantity(item.quantity, item.unit);
      const qtyStr = qty ? ` - ${qty}` : "";
      lines.push(`${mark} ${item.name}${qtyStr}`);
    }
  }

  return lines.join("\n");
}

// ── Loading skeleton ───────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-stone-200 rounded-lg w-48" />
      <div className="space-y-3">
        {[1, 2, 3].map((cat) => (
          <div key={cat} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
            <div className="h-6 bg-stone-200 rounded w-32" />
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-stone-200 rounded" />
                <div className="h-4 bg-stone-200 rounded flex-1" />
                <div className="h-4 bg-stone-200 rounded w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <ShoppingCart className="h-8 w-8 text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-700">No ingredients yet</h3>
      <p className="mt-1 text-sm text-stone-500 max-w-xs">
        Add some meals to your week plan and their ingredients will show up here.
      </p>
    </div>
  );
}

// ── Category section ───────────────────────────────────────────────────

function CategorySection({
  category,
  checkedItems,
  onToggle,
}: {
  category: CategoryGroup;
  checkedItems: Set<string>;
  onToggle: (name: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = CATEGORY_ICONS[category.name] ?? ShoppingCart;
  const colorClasses = CATEGORY_COLORS[category.name] ?? CATEGORY_COLORS.Other;

  const checkedCount = category.items.filter((i) => checkedItems.has(i.name)).length;
  const allChecked = checkedCount === category.items.length;

  // Sort: unchecked first, checked at bottom
  const sortedItems = [...category.items].sort((a, b) => {
    const aChecked = checkedItems.has(a.name) ? 1 : 0;
    const bChecked = checkedItems.has(b.name) ? 1 : 0;
    return aChecked - bChecked;
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-semibold text-stone-800 text-sm">
          {category.name}
        </span>
        <span className="text-xs text-stone-500">
          {checkedCount}/{category.items.length}
        </span>
        {allChecked && (
          <Check className="h-4 w-4 text-green-500 ml-1" />
        )}
        <span className="ml-auto">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-stone-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-400" />
          )}
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-1">
          {sortedItems.map((item) => {
            const checked = checkedItems.has(item.name);
            const qty = formatQuantity(item.quantity, item.unit);

            return (
              <label
                key={item.name}
                className={`flex items-start gap-3 py-2 px-2 rounded-lg cursor-pointer transition-colors hover:bg-stone-50 ${
                  checked ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.name)}
                  className="mt-0.5 h-5 w-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500 accent-blue-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-sm font-medium ${
                        checked
                          ? "line-through text-stone-400"
                          : "text-stone-800"
                      }`}
                    >
                      {item.name}
                    </span>
                    {qty && (
                      <span className="text-xs text-stone-500 whitespace-nowrap">
                        {qty}
                      </span>
                    )}
                  </div>
                  {item.fromMeals.length > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {item.fromMeals.join(", ")}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function ShoppingList({ weekPlanId }: ShoppingListProps) {
  const [data, setData] = useState<ShoppingListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/plans/shopping-list?weekPlanId=${encodeURIComponent(weekPlanId)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load shopping list");
        }
        const json: ShoppingListData = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [weekPlanId]);

  const toggleItem = useCallback((name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!data) return;
    const text = buildPlainTextList(data, checkedItems);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op, browser may not support clipboard
    }
  }, [data, checkedItems]);

  const handleShare = useCallback(async () => {
    if (!data) return;
    const text = buildPlainTextList(data, checkedItems);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shopping List", text });
      } catch {
        // User cancelled or share not available
      }
    }
  }, [data, checkedItems]);

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data || data.totalItems === 0) return <EmptyState />;

  const totalChecked = checkedItems.size;
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-stone-800">
            Shopping List
          </h2>
          <span className="text-sm text-stone-500">
            {totalChecked}/{data.totalItems} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {data.totalItems > 0 && (
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${Math.round((totalChecked / data.totalItems) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* Category sections */}
      <div className="space-y-3">
        {data.categories.map((category) => (
          <CategorySection
            key={category.name}
            category={category}
            checkedItems={checkedItems}
            onToggle={toggleItem}
          />
        ))}
      </div>
    </div>
  );
}

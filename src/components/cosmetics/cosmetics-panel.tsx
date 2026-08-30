import { useState } from "react";

import {
  COSMETIC_CATALOG,
  getCosmeticsByCategory,
} from "@/data/cosmetics";
import { useToast } from "@/hooks/use-toast";
import { useAchievementStore } from "@/state/achievement-store";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import type { CosmeticCategory } from "@/types/cosmetics";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { cn } from "@/utils/cn";

const CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  board: "Board",
  orb: "Orb",
  arrow: "Arrows",
  frame: "Frame",
  title: "Title",
};

const CATEGORY_ORDER: CosmeticCategory[] = [
  "board",
  "orb",
  "arrow",
  "frame",
  "title",
];

export interface CosmeticsPanelProps {
  embedded?: boolean;
}

/**
 * Shop and equip UI for cosmetic unlocks.
 */
export function CosmeticsPanel({ embedded = false }: CosmeticsPanelProps) {
  const [activeCategory, setActiveCategory] =
    useState<CosmeticCategory>("board");
  const { toast } = useToast();
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const ownedIds = useCosmeticsStore((state) => state.ownedIds);
  const equipped = useCosmeticsStore((state) => state.equipped);
  const purchase = useCosmeticsStore((state) => state.purchase);
  const equip = useCosmeticsStore((state) => state.equip);
  const unlockedAchievements = useAchievementStore((state) => state.unlockedIds);

  const items = getCosmeticsByCategory(activeCategory);

  const handleAction = (cosmeticId: string) => {
    const cosmetic = COSMETIC_CATALOG.find((entry) => entry.id === cosmeticId);

    if (!cosmetic) {
      return;
    }

    const isOwned = ownedIds.includes(cosmeticId);
    const isEquipped = equipped[cosmetic.category] === cosmeticId;

    if (isOwned) {
      if (!isEquipped) {
        equip(cosmeticId);
        toast({
          title: "Cosmetic equipped",
          description: `${cosmetic.name} is now active.`,
          variant: "success",
        });
      }
      return;
    }

    const achievementUnlocked =
      cosmetic.unlockAchievementId &&
      unlockedAchievements.includes(cosmetic.unlockAchievementId);

    if (cosmetic.price > 0 && totalCoins < cosmetic.price && !achievementUnlocked) {
      toast({
        title: "Not enough coins",
        description: `You need ${cosmetic.price} coins for ${cosmetic.name}.`,
        variant: "warning",
      });
      return;
    }

    const success = purchase(cosmeticId);

    if (success) {
      toast({
        title: isOwned ? "Cosmetic equipped" : "Cosmetic unlocked",
        description: `${cosmetic.name} is now active.`,
        variant: "success",
      });
      return;
    }

    toast({
      title: "Could not unlock",
      description: "Check your coins or achievement requirements.",
      variant: "warning",
    });
  };

  return (
    <div className="space-y-4 text-left">
      {!embedded ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Cosmetics</p>
            <p className="text-xs text-text-muted">
              Customize your board, orb, and profile.
            </p>
          </div>
          <Badge variant="warning">{totalCoins} coins</Badge>
        </div>
      ) : (
        <div className="flex justify-end">
          <Badge variant="warning">{totalCoins} coins</Badge>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={activeCategory === category ? "primary" : "ghost"}
            onClick={() => setActiveCategory(category)}
          >
            {CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((cosmetic) => {
          const isOwned = ownedIds.includes(cosmetic.id);
          const isEquipped = equipped[cosmetic.category] === cosmetic.id;
          const achievementUnlocked =
            cosmetic.unlockAchievementId &&
            unlockedAchievements.includes(cosmetic.unlockAchievementId);

          return (
            <div
              key={cosmetic.id}
              className={cn(
                "rounded-2xl border p-3",
                isEquipped
                  ? "border-accent-primary/50 bg-accent-primary/10"
                  : "border-bg-card bg-bg-card/80",
              )}
            >
              <CosmeticPreview category={cosmetic.category} id={cosmetic.id} />
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {cosmetic.name}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {cosmetic.description}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted">
                  {cosmetic.price === 0
                    ? "Free"
                    : achievementUnlocked && !isOwned
                      ? "Achievement unlock"
                      : `${cosmetic.price} coins`}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={isEquipped ? "secondary" : "primary"}
                  disabled={isEquipped}
                  onClick={() => handleAction(cosmetic.id)}
                >
                  {isEquipped
                    ? "Equipped"
                    : isOwned
                      ? "Equip"
                      : cosmetic.price === 0 || achievementUnlocked
                        ? "Unlock"
                        : "Buy"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CosmeticPreview({
  category,
  id,
}: {
  category: CosmeticCategory;
  id: string;
}) {
  if (category === "board") {
    return (
      <div
        className={cn(
          "h-14 rounded-xl border border-bg-card/80",
          id === "board-midnight" && "bg-gradient-to-br from-slate-900 to-blue-950",
          id === "board-aurora" &&
            "bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-900",
          id === "board-default" && "bg-bg-card",
        )}
      />
    );
  }

  if (category === "orb") {
    return (
      <div className="flex h-14 items-center justify-center">
        <span
          className={cn(
            "size-8 rounded-full",
            id === "orb-ember" &&
              "bg-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.9)]",
            id === "orb-neon" &&
              "bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]",
            id === "orb-default" &&
              "bg-accent-primary shadow-[0_0_16px_rgba(59,130,246,0.9)]",
          )}
        />
      </div>
    );
  }

  if (category === "arrow") {
    return (
      <div className="flex h-14 items-center justify-center text-2xl font-bold text-accent-primary">
        {id === "arrow-minimal" ? "›" : "↑"}
      </div>
    );
  }

  if (category === "frame") {
    return (
      <div className="flex h-14 items-center justify-center">
        <span
          className={cn(
            "size-10 rounded-full bg-accent-primary/20",
            id === "frame-gold" && "ring-4 ring-amber-400",
            id === "frame-neon" && "ring-4 ring-cyan-400",
            id === "frame-default" && "ring-2 ring-bg-surface",
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center justify-center">
      <Badge variant="secondary">
        {id === "title-default" ? "—" : id.replace("title-", "")}
      </Badge>
    </div>
  );
}

import { lazy, type ReactNode, Suspense } from "react";

import { LoaderOverlay } from "@/ui/loader";

export const LazyGameScreen = lazy(() =>
  import("@/components/game/game-screen").then((module) => ({
    default: module.GameScreen,
  })),
);

export const LazySettingsDialog = lazy(() =>
  import("@/components/settings/settings-dialog").then((module) => ({
    default: module.SettingsDialog,
  })),
);

export const LazyStatisticsDialog = lazy(() =>
  import("@/components/menu/statistics-dialog").then((module) => ({
    default: module.StatisticsDialog,
  })),
);

export const LazyAchievementsDialog = lazy(() =>
  import("@/components/menu/achievements-dialog").then((module) => ({
    default: module.AchievementsDialog,
  })),
);

export const LazyCreditsDialog = lazy(() =>
  import("@/components/menu/credits-dialog").then((module) => ({
    default: module.CreditsDialog,
  })),
);

export interface LazyMountProps {
  children: ReactNode;
  label?: string;
}

/**
 * Suspense boundary with a lightweight loading overlay.
 */
export function LazyMount({ children, label = "Loading..." }: LazyMountProps) {
  return <Suspense fallback={<LoaderOverlay label={label} />}>{children}</Suspense>;
}

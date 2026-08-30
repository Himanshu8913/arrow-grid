import { useMemo } from "react";

import { MenuBackground } from "@/components/menu/menu-background";
import { MenuScreenHeader } from "@/components/menu/menu-screen-header";
import { getSeasonalPuzzleById } from "@/data/seasonal-puzzles";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { resolvePuzzleDefinition } from "@/engine/puzzle-resolver";
import { createPuzzleGameForSelection } from "@/engine/random-puzzle";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/state/game-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import {
  DEFAULT_SEASONAL_PROGRESS,
  useSeasonalStore,
} from "@/state/seasonal-store";
import {
  formatSeasonalCount,
  getActiveSeasonalEvent,
  getSimulatedCommunityProgress,
} from "@/utils/seasonal";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

export interface SeasonalScreenProps {
  onBack: () => void;
  onPlay: () => void;
}

/**
 * Seasonal event hub with community challenge progress and special puzzles.
 */
export function SeasonalScreen({ onBack, onPlay }: SeasonalScreenProps) {
  const event = getActiveSeasonalEvent();
  const progressByEvent = useSeasonalStore((state) => state.progressByEvent);
  const progress = event
    ? (progressByEvent[event.id] ?? DEFAULT_SEASONAL_PROGRESS)
    : DEFAULT_SEASONAL_PROGRESS;
  const { toast } = useToast();

  const community = useMemo(() => {
    if (!event) {
      return null;
    }

    return getSimulatedCommunityProgress(event.id, progress.wins);
  }, [event, progress.wins]);

  if (!event) {
    return (
      <div className="relative min-h-dvh overflow-y-auto p-4 sm:p-6">
        <MenuBackground />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-4">
          <MenuScreenHeader title="Seasonal Event" onBack={onBack} />
          <div className="rounded-[28px] border border-white/10 bg-bg-surface/80 p-6 text-center shadow-[var(--shadow-strong)] backdrop-blur-md">
            <p className="text-lg font-semibold text-text-primary">No active event</p>
            <p className="mt-2 text-sm text-text-muted">
              Check back later for Halloween, Winter, Diwali, and anniversary
              celebrations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const seasonalPuzzle = getSeasonalPuzzleById(event.puzzleId);
  const challengeComplete = progress.rewardClaimed;

  const handlePlaySeasonalPuzzle = () => {
    const game = createPuzzleGameForSelection(event.puzzleId, (puzzleId) =>
      createGameFromPuzzle(resolvePuzzleDefinition(puzzleId)),
    );
    useGameStore.getState().setGameMode("puzzle");
    usePuzzleSessionStore.getState().setSelectedPuzzleId(game.puzzleId ?? event.puzzleId);
    useGameStore.getState().setGame(game, { persist: false });
    useGameStore.getState().setMatchSessionActive(true);
    onPlay();
  };

  const handleClaimReminder = () => {
    if (challengeComplete) {
      toast({
        title: "Rewards claimed",
        description: "Seasonal cosmetics are in your collection.",
        variant: "success",
      });
      return;
    }

    toast({
      title: "Keep playing",
      description: `Win ${event.challengeTarget - progress.wins} more matches to unlock rewards.`,
      variant: "default",
    });
  };

  return (
    <div className="relative min-h-dvh overflow-y-auto p-4 sm:p-6">
      <MenuBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <MenuScreenHeader title="Seasonal Event" onBack={onBack} />

        <div className="rounded-[28px] border border-white/10 bg-bg-surface/80 p-5 shadow-[var(--shadow-strong)] backdrop-blur-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-3xl" aria-hidden="true">
                {event.emoji}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">
                {event.name}
              </h2>
              <p className="mt-1 text-sm text-accent-primary">{event.tagline}</p>
            </div>
            <Badge variant={challengeComplete ? "success" : "warning"}>
              {challengeComplete ? "Complete" : "Live"}
            </Badge>
          </div>

          <p className="mt-4 text-sm text-text-muted">{event.description}</p>

          <div className="mt-5 rounded-2xl border border-bg-card/70 bg-bg-card/40 p-4">
            <p className="text-sm font-semibold text-text-primary">
              Community Challenge
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Win {event.challengeTarget} matches during the event to earn
              exclusive cosmetics, {event.rewardCoins} coins, and {event.rewardXp}{" "}
              XP.
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>
                  Your progress: {Math.min(progress.wins, event.challengeTarget)}/
                  {event.challengeTarget}
                </span>
                <span>
                  {challengeComplete ? "Rewards unlocked" : "In progress"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-primary/60">
                <div
                  className="h-full rounded-full bg-accent-primary transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.wins / event.challengeTarget) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {community ? (
              <p className="mt-3 text-xs text-text-muted">
                Worldwide: {formatSeasonalCount(community.current)} /{" "}
                {formatSeasonalCount(community.target)} puzzles ({community.percent}
                %)
              </p>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl border border-bg-card/70 bg-bg-card/40 p-4">
            <p className="text-sm font-semibold text-text-primary">Special Puzzle</p>
            <p className="mt-1 text-sm text-text-muted">
              {seasonalPuzzle.title} — {seasonalPuzzle.description}
            </p>
            <Button
              type="button"
              className="mt-3"
              onClick={handlePlaySeasonalPuzzle}
            >
              Play Seasonal Puzzle
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={handleClaimReminder}>
              View Rewards
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

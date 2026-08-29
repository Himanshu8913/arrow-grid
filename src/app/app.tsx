import { useState } from "react";

import {
  LazyAchievementsDialog,
  LazyCreditsDialog,
  LazyGameScreen,
  LazyMount,
  LazySettingsDialog,
  LazyStatisticsDialog,
} from "@/components/app/lazy-screens";
import { MainMenu } from "@/components/menu";
import { useToast } from "@/hooks/use-toast";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useGameStore } from "@/state/game-store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { formatDailyStars } from "@/utils/daily-challenge";

type AppScreen = "menu" | "game";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

  const openGame = () => setScreen("game");
  const { toast } = useToast();

  const handleDailyChallenge = () => {
    if (useDailyChallengeStore.getState().hasAttemptedToday()) {
      const result = useDailyChallengeStore
        .getState()
        .getTodayResult(getDailyDateKey());

      toast({
        title: "Already played today",
        description: result
          ? `You finished with ${formatDailyStars(result.stars)} stars. New puzzle tomorrow.`
          : "Come back tomorrow for a new challenge.",
        variant: "warning",
      });
      return;
    }

    useGameStore.getState().setGameMode("daily");
    useGameStore.getState().startMatch();
    openGame();
  };

  const handleContinue = () => {
    openGame();
  };

  if (screen === "game") {
    return (
      <>
        <LazyMount label="Loading game...">
          <LazyGameScreen onBackToMenu={() => setScreen("menu")} />
        </LazyMount>
        {isSettingsOpen ? (
          <LazyMount label="Loading settings...">
            <LazySettingsDialog
              open={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </LazyMount>
        ) : null}
      </>
    );
  }

  return (
    <>
      <MainMenu
        onPlay={openGame}
        onDailyChallenge={handleDailyChallenge}
        onContinue={handleContinue}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onExit={() => setIsExitOpen(true)}
      />

      {isSettingsOpen ? (
        <LazyMount label="Loading settings...">
          <LazySettingsDialog
            open={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </LazyMount>
      ) : null}
      {isStatisticsOpen ? (
        <LazyMount label="Loading statistics...">
          <LazyStatisticsDialog
            open={isStatisticsOpen}
            onClose={() => setIsStatisticsOpen(false)}
          />
        </LazyMount>
      ) : null}
      {isAchievementsOpen ? (
        <LazyMount label="Loading achievements...">
          <LazyAchievementsDialog
            open={isAchievementsOpen}
            onClose={() => setIsAchievementsOpen(false)}
          />
        </LazyMount>
      ) : null}
      {isCreditsOpen ? (
        <LazyMount label="Loading credits...">
          <LazyCreditsDialog
            open={isCreditsOpen}
            onClose={() => setIsCreditsOpen(false)}
          />
        </LazyMount>
      ) : null}

      <Dialog
        open={isExitOpen}
        onClose={() => setIsExitOpen(false)}
        title="Exit Arrow Grid"
        description="You can close this browser tab to leave the game."
        footer={
          <Button type="button" variant="ghost" onClick={() => setIsExitOpen(false)}>
            Stay
          </Button>
        }
      >
        <p className="text-sm text-text-muted">
          Thanks for playing. Your progress is saved on this device.
        </p>
      </Dialog>
    </>
  );
}

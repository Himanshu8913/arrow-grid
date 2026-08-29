import { useState } from "react";

import { GameScreen } from "@/components/game/game-screen";
import {
  AchievementsDialog,
  CreditsDialog,
  MainMenu,
  StatisticsDialog,
} from "@/components/menu";
import { SettingsDialog } from "@/components/settings";
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
        <GameScreen onBackToMenu={() => setScreen("menu")} />
        <SettingsDialog
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
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

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <StatisticsDialog
        open={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
      />
      <AchievementsDialog
        open={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />
      <CreditsDialog open={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />

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

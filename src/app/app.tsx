import { useState } from "react";

import { GameScreen } from "@/components/game/game-screen";
import {
  AchievementsDialog,
  CreditsDialog,
  MainMenu,
  StatisticsDialog,
} from "@/components/menu";
import { SettingsDialog } from "@/components/settings";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

type AppScreen = "menu" | "game";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

  const openGame = () => setScreen("game");

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

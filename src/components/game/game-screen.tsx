import { useRef, useState } from "react";

import { PlayPanel, type PlayPanelHandle } from "@/components/game";
import { AchievementsPanel, StatisticsPanel } from "@/components/profile";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/state/game-store";
import { useProfileStore } from "@/state/profile-store";
import { getAppName } from "@/constants/app";
import { getXpProgressInLevel, getPlayerLevel } from "@/utils/player-level";
import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Dialog } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ProgressBar } from "@/ui/progress-bar";
import { Tabs } from "@/ui/tabs";
import { Tooltip } from "@/ui/tooltip";

export interface GameScreenProps {
  onBackToMenu: () => void;
}

/**
 * In-game shell with play surface, profile tab, and match controls.
 */
export function GameScreen({ onBackToMenu }: GameScreenProps) {
  const [activeTab, setActiveTab] = useState("play");
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const playPanelRef = useRef<PlayPanelHandle>(null);
  const { toast } = useToast();
  const game = useGameStore((state) => state.game);
  const matchSessionActive = useGameStore((state) => state.matchSessionActive);
  const playerName = useProfileStore((state) => state.displayName);
  const setPlayerName = useProfileStore((state) => state.setDisplayName);
  const totalXp = useProfileStore((state) => state.totalXp);
  const playerLevel = getPlayerLevel(totalXp);
  const xpProgress = getXpProgressInLevel(totalXp);

  const trimmedPlayerName = playerName.trim();
  const displayName = trimmedPlayerName || "Guest Player";
  const nameError =
    trimmedPlayerName.length > 0 && trimmedPlayerName.length < 2
      ? "Name must be at least 2 characters"
      : undefined;

  const handleStartGame = () => {
    if (
      matchSessionActive &&
      game.status === "in-progress" &&
      game.movesPlayed > 0
    ) {
      setIsNewGameConfirmOpen(true);
      return;
    }

    playPanelRef.current?.startGame();
  };

  const confirmNewGame = () => {
    setIsNewGameConfirmOpen(false);
    playPanelRef.current?.startGame();
  };

  return (
    <>
      <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
        <Card
          className="relative w-full max-w-xl text-center"
          padding="lg"
          variant="surface"
        >
          <CardHeader>
            <div className="mb-4 flex justify-start">
              <Button type="button" variant="ghost" size="sm" onClick={onBackToMenu}>
                ← Menu
              </Button>
            </div>
            <CardTitle>{getAppName()}</CardTitle>
            <CardDescription>Rotate arrows. Guide the orb. Score goals.</CardDescription>

            <Tabs
              className="mt-6"
              value={activeTab}
              onValueChange={setActiveTab}
              items={[
                {
                  value: "play",
                  label: "Play",
                  content: (
                    <PlayPanel
                      ref={playPanelRef}
                      onStartingChange={setIsStartingGame}
                      onReturnToMenu={onBackToMenu}
                    />
                  ),
                },
                {
                  value: "profile",
                  label: "Profile",
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar alt={displayName} name={displayName} size="lg" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-primary">
                            {displayName}
                          </p>
                          <p className="text-sm text-text-muted">
                            Level {playerLevel}
                          </p>
                        </div>
                      </div>
                      <Input
                        label="Display Name"
                        value={playerName}
                        onChange={(event) => setPlayerName(event.target.value)}
                        placeholder="Enter your name"
                        hint="Shown on leaderboards and match results."
                        error={nameError}
                        maxLength={24}
                      />
                      <ProgressBar
                        value={xpProgress.current}
                        max={xpProgress.max}
                        label="XP to next level"
                        showValue
                        size="sm"
                      />
                      <StatisticsPanel />
                      <AchievementsPanel />
                    </div>
                  ),
                },
              ]}
            />
          </CardHeader>

          <CardFooter className="flex-wrap">
            <Tooltip content="Start a new game">
              <Button disabled={isStartingGame} onClick={handleStartGame}>
                {matchSessionActive &&
                game.status === "in-progress" &&
                game.movesPlayed > 0
                  ? "New game"
                  : "Play"}
              </Button>
            </Tooltip>
            <Tooltip content="Learn the basics" side="bottom">
              <Button
                variant="secondary"
                onClick={() => setIsHowToPlayOpen(true)}
              >
                How to Play
              </Button>
            </Tooltip>
            <Tooltip content="Return to main menu" side="bottom">
              <Button variant="ghost" onClick={onBackToMenu}>
                Menu
              </Button>
            </Tooltip>
          </CardFooter>
        </Card>
      </div>

      <Dialog
        open={isNewGameConfirmOpen}
        onClose={() => setIsNewGameConfirmOpen(false)}
        title="Start a new game?"
        description="Your current match progress will be replaced."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewGameConfirmOpen(false)}
            >
              Keep playing
            </Button>
            <Button type="button" onClick={confirmNewGame}>
              Start new game
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Continue the current board or discard it and deal a fresh one.
        </p>
      </Dialog>

      <Dialog
        open={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="How to Play"
        description="Rotate arrows on the grid to guide the energy orb to your goal."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsHowToPlayOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsHowToPlayOpen(false);
                toast({
                  title: "You're ready to play",
                  description: "Good luck guiding the energy orb.",
                  variant: "success",
                });
              }}
            >
              Got it
            </Button>
          </>
        }
      >
        <ol className="list-decimal space-y-2 pl-5 text-text-muted">
          <li>Click or focus a tile and press Enter to rotate it clockwise.</li>
          <li>Use arrow keys on the board to move between tiles.</li>
          <li>After your move, the orb follows the arrows automatically.</li>
          <li>Plan ahead — every rotation changes the orb&apos;s path.</li>
        </ol>
      </Dialog>
    </>
  );
}

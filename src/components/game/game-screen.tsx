import { useRef, useState } from "react";

import { PlayPanel, type PlayPanelHandle } from "@/components/game";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/state/game-store";
import { getAppName } from "@/constants/app";
import { Button } from "@/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Dialog } from "@/ui/dialog";

export interface GameScreenProps {
  onBackToMenu: () => void;
}

/**
 * In-game shell focused on play — profile lives on the main menu.
 */
export function GameScreen({ onBackToMenu }: GameScreenProps) {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const playPanelRef = useRef<PlayPanelHandle>(null);
  const { toast } = useToast();
  const game = useGameStore((state) => state.game);
  const matchSessionActive = useGameStore((state) => state.matchSessionActive);

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
      <div className="flex min-h-dvh items-center justify-center overflow-visible p-4 sm:p-6">
        <Card
          className="relative w-full max-w-xl overflow-visible text-center"
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

            <div className="mt-6">
              <PlayPanel
                ref={playPanelRef}
                onStartingChange={setIsStartingGame}
                onReturnToMenu={onBackToMenu}
              />
            </div>
          </CardHeader>

          <CardFooter className="relative z-10 overflow-visible">
            <Button disabled={isStartingGame} onClick={handleStartGame}>
              {matchSessionActive &&
              game.status === "in-progress" &&
              game.movesPlayed > 0
                ? "New game"
                : "Play"}
            </Button>
            <Button variant="secondary" onClick={() => setIsHowToPlayOpen(true)}>
              How to Play
            </Button>
            <Button variant="ghost" onClick={onBackToMenu}>
              Menu
            </Button>
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
        description="Rotate arrows to route the energy orb before each turn resolves."
        size="large"
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
                  description: "Good luck on the grid.",
                  variant: "success",
                });
              }}
            >
              Got it
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-text-muted">
          <section>
            <h3 className="font-semibold text-text-primary">Goal</h3>
            <p className="mt-1">
              Guide your orb into a goal tile. In VS AI and PvP, score more goals
              than your opponent. In puzzle mode, reach the goal within the move
              limit.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-text-primary">Controls</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Click a tile or focus it with arrow keys, then press Enter or Space to rotate clockwise.</li>
              <li>After you rotate, the orb moves automatically along arrow paths.</li>
              <li>In puzzle mode: R restart, U undo, H hint.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-text-primary">Game modes</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li><strong>Practice vs AI</strong> — solo match against the computer.</li>
              <li><strong>Puzzle Mode</strong> — curated, random, mechanic, seasonal, and community puzzles.</li>
              <li><strong>Player vs Player</strong> — local two-player on one device.</li>
              <li><strong>Daily Challenge</strong> — one shared puzzle per day from the main menu.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-text-primary">Puzzle tips</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Plan rotations before the orb moves — paths can loop or overshoot.</li>
              <li>Some puzzles add special tiles like ice, portals, bombs, keys, wind, magnets, and splitters.</li>
              <li>Earn up to 3 stars by finishing under the target move count without hints.</li>
            </ul>
          </section>
        </div>
      </Dialog>
    </>
  );
}

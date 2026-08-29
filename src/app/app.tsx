import { useRef, useState } from "react";

import { PlayPanel, type PlayPanelHandle } from "@/components/game";
import { AchievementsPanel, StatisticsPanel } from "@/components/profile";
import { SettingsDialog } from "@/components/settings";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
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

export function App() {
  const [activeTab, setActiveTab] = useState("play");
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("Guest Player");
  const [isStartingGame, setIsStartingGame] = useState(false);
  const playPanelRef = useRef<PlayPanelHandle>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const trimmedPlayerName = playerName.trim();
  const displayName = trimmedPlayerName || "Guest Player";
  const nameError =
    trimmedPlayerName.length > 0 && trimmedPlayerName.length < 2
      ? "Name must be at least 2 characters"
      : undefined;

  return (
    <>
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card
          className="relative w-full max-w-xl text-center"
          padding="lg"
          variant="surface"
        >
          <CardHeader>
            <CardTitle>
              {import.meta.env.VITE_APP_NAME ?? "Arrow Grid"}
            </CardTitle>
            <CardDescription>
              Strategy puzzle game — coming soon
            </CardDescription>

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
                          <p className="text-sm text-text-muted">Level 1</p>
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
                        value={35}
                        max={100}
                        label="XP to Level 2"
                        showValue
                        size="sm"
                      />
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-bg-card p-3">
                        <div className="text-left">
                          <p className="text-sm font-semibold text-text-primary">
                            Appearance
                          </p>
                          <p className="text-xs text-text-muted">
                            Current theme: {theme}
                          </p>
                        </div>
                        <Button type="button" variant="secondary" onClick={toggleTheme}>
                          {theme === "dark" ? "Light mode" : "Dark mode"}
                        </Button>
                      </div>
                      <StatisticsPanel />
                      <AchievementsPanel />
                    </div>
                  ),
                },
              ]}
            />
          </CardHeader>

          <CardFooter>
            <Tooltip content="Start a new game">
              <Button
                disabled={isStartingGame}
                onClick={() => playPanelRef.current?.startGame()}
              >
                Play
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
            <Tooltip content="Game preferences">
              <Button
                variant="ghost"
                onClick={() => setIsSettingsOpen(true)}
              >
                Settings
              </Button>
            </Tooltip>
            <Tooltip content="Exit to main menu" side="bottom">
              <Button variant="danger" size="sm">
                Quit
              </Button>
            </Tooltip>
          </CardFooter>
        </Card>
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

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
          <li>Click an arrow to rotate it one step clockwise.</li>
          <li>After your move, the orb follows the arrows automatically.</li>
          <li>Plan ahead — every rotation changes the orb&apos;s path.</li>
        </ol>
      </Dialog>
    </>
  );
}

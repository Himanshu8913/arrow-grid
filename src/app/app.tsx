import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Dialog } from "@/ui/dialog";
import { Dropdown } from "@/ui/dropdown";
import { ProgressBar } from "@/ui/progress-bar";
import { Tooltip } from "@/ui/tooltip";

export function App() {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [gameMode, setGameMode] = useState("pvp");
  const { toast } = useToast();

  return (
    <>
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card
          className="w-full max-w-lg text-center"
          padding="lg"
          variant="surface"
        >
          <CardHeader>
            <div className="mb-4 flex items-center justify-center gap-3">
              <Avatar alt="Guest Player" name="Guest Player" size="lg" />
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-text-primary">Guest Player</p>
                <p className="text-sm text-text-muted">Level 1</p>
                <ProgressBar
                  className="mt-2 max-w-[12rem]"
                  value={35}
                  max={100}
                  label="XP to Level 2"
                  showValue
                  size="sm"
                />
              </div>
            </div>
            <CardTitle>
              {import.meta.env.VITE_APP_NAME ?? "Arrow Grid"}
            </CardTitle>
            <CardDescription>
              Strategy puzzle game — coming soon
            </CardDescription>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Badge variant="primary">Strategy</Badge>
              <Badge variant="secondary">PvP</Badge>
              <Badge variant="success">Alpha</Badge>
            </div>
            <Dropdown
              className="mx-auto mt-4 max-w-xs"
              label="Game Mode"
              value={gameMode}
              onValueChange={setGameMode}
              options={[
                { value: "pvp", label: "Player vs Player" },
                { value: "puzzle", label: "Puzzle Mode" },
                { value: "practice", label: "Practice" },
              ]}
            />
          </CardHeader>

          <CardFooter>
            <Tooltip content="Start a new game">
              <Button>Play</Button>
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
                onClick={() =>
                  toast({
                    title: "Settings",
                    description:
                      "Settings will be available in a future update.",
                    variant: "default",
                  })
                }
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

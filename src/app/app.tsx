import { useState } from "react";

import { Button } from "@/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Dialog } from "@/ui/dialog";

export function App() {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card
          className="w-full max-w-lg text-center"
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
          </CardHeader>

          <CardFooter>
            <Button>Play</Button>
            <Button
              variant="secondary"
              onClick={() => setIsHowToPlayOpen(true)}
            >
              How to Play
            </Button>
            <Button variant="ghost">Settings</Button>
            <Button variant="danger" size="sm">
              Quit
            </Button>
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
            <Button onClick={() => setIsHowToPlayOpen(false)}>Got it</Button>
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

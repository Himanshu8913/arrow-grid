import { useEffect, useMemo, useState } from "react";

import { BoardGrid } from "@/components/board";
import { getPuzzleById } from "@/data/puzzles";
import { cloneBoard } from "@/engine/board-utils";
import { createGameFromPuzzle } from "@/engine/puzzle";
import type { Position } from "@/types/game";
import { cn } from "@/utils/cn";

const DEMO_PUZZLE = getPuzzleById("first-steps");
const ROTATE_AT: Position = { row: 2, col: 2 };
const ORB_PATH: Position[] = [
  { row: 0, col: 2 },
  { row: 1, col: 2 },
  { row: 2, col: 2 },
  { row: 3, col: 2 },
  { row: 4, col: 2 },
];

type DemoStep = "ready" | "rotate" | "travel" | "score" | "reset";

const STEPS = [
  { id: "rotate", label: "Rotate" },
  { id: "route", label: "Route" },
  { id: "goal", label: "Goal" },
] as const;

function buildDisplayBoard(
  sourceBoard: ReturnType<typeof createGameFromPuzzle>["board"],
  arrowRotated: boolean,
) {
  const board = cloneBoard(sourceBoard);

  if (arrowRotated) {
    board[ROTATE_AT.row][ROTATE_AT.col] = {
      kind: "arrow",
      direction: "down",
    };
  }

  return board;
}

/**
 * Looping miniature board that demonstrates core gameplay on the home screen.
 */
export function MenuGameplayPreview({ className }: { className?: string }) {
  const baseGame = useMemo(() => createGameFromPuzzle(DEMO_PUZZLE), []);
  const [step, setStep] = useState<DemoStep>("ready");
  const [arrowRotated, setArrowRotated] = useState(false);
  const [orbIndex, setOrbIndex] = useState(0);
  const [trailCount, setTrailCount] = useState(1);

  const orbPosition = ORB_PATH[orbIndex];
  const displayBoard = useMemo(
    () => buildDisplayBoard(baseGame.board, arrowRotated),
    [arrowRotated, baseGame.board],
  );
  const trailPositions = ORB_PATH.slice(0, Math.max(0, trailCount));
  const activeStepIndex =
    step === "ready" || step === "rotate"
      ? 0
      : step === "travel"
        ? 1
        : 2;

  useEffect(() => {
    let timeout = 0;
    let interval = 0;

    if (step === "ready") {
      timeout = window.setTimeout(() => setStep("rotate"), 1400);
    }

    if (step === "rotate") {
      timeout = window.setTimeout(() => {
        setArrowRotated(true);
        setStep("travel");
      }, 750);
    }

    if (step === "travel") {
      interval = window.setInterval(() => {
        setOrbIndex((current) => {
          const next = current + 1;

          if (next >= ORB_PATH.length) {
            window.clearInterval(interval);
            setTrailCount(ORB_PATH.length);
            setStep("score");
            return current;
          }

          setTrailCount(next);
          return next;
        });
      }, 420);
    }

    if (step === "score") {
      timeout = window.setTimeout(() => setStep("reset"), 1600);
    }

    if (step === "reset") {
      timeout = window.setTimeout(() => {
        setArrowRotated(false);
        setOrbIndex(0);
        setTrailCount(1);
        setStep("ready");
      }, 500);
    }

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [step]);

  return (
    <div className={cn("menu-gameplay-preview", className)}>
      <div className="menu-gameplay-preview__halo" aria-hidden="true" />
      <div className="menu-gameplay-preview__panel">
        <div className="menu-gameplay-preview__header">
          <div>
            <p className="menu-gameplay-preview__label">Live preview</p>
            <p className="menu-gameplay-preview__title">First Steps</p>
          </div>
          <span className="menu-gameplay-preview__badge">Demo</span>
        </div>

        <div className="menu-gameplay-preview__steps" aria-hidden="true">
          {STEPS.map((entry, index) => (
            <span
              key={entry.id}
              className={cn(
                "menu-gameplay-preview__step",
                index === activeStepIndex && "menu-gameplay-preview__step--active",
                index < activeStepIndex && "menu-gameplay-preview__step--done",
              )}
            >
              {entry.label}
            </span>
          ))}
        </div>

        <div className="menu-gameplay-preview__stage">
          <div className="menu-gameplay-preview__stage-glow" aria-hidden="true" />
          <div className="menu-gameplay-preview__board-wrap">
            <BoardGrid
              className="menu-gameplay-preview__board w-full max-w-none"
              board={displayBoard}
              spawn={baseGame.spawn}
              orbPosition={orbPosition}
              pathPositions={[]}
              trailPositions={trailPositions}
              rotatingPosition={step === "rotate" ? ROTATE_AT : null}
              goalCelebration={
                step === "score"
                  ? {
                      position: ORB_PATH[ORB_PATH.length - 1],
                      score: 1,
                      owner: "player1",
                    }
                  : null
              }
              isBoardCelebrating={step === "score"}
              isOrbSpawning={step === "ready"}
              disabled
            />
          </div>
        </div>

        <p className="menu-gameplay-preview__caption">
          Tap a tile to rotate · the orb follows the arrows · reach the goal
        </p>
      </div>
    </div>
  );
}

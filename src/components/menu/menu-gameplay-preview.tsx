import { useEffect, useMemo, useState } from "react";

import { BoardGrid } from "@/components/board";
import {
  buildPreviewBoard,
  CORNER_ROUTE_PREVIEW_DEMO,
  createPreviewBaseGame,
  type PreviewRotation,
} from "@/utils/menu-preview-demo";
import { cn } from "@/utils/cn";

type DemoPhase = "ready" | "rotate" | "travel" | "score" | "reset";

const STEPS = [
  { id: "rotate", label: "Rotate" },
  { id: "route", label: "Route" },
  { id: "goal", label: "Goal" },
] as const;

const DEMO = CORNER_ROUTE_PREVIEW_DEMO;

function getTravelBounds(rotationIndex: number) {
  const start = DEMO.travelSegments[rotationIndex] ?? 0;
  const end =
    DEMO.travelSegments[rotationIndex + 1] ?? DEMO.orbPath.length - 1;

  return { start, end };
}

/**
 * Looping miniature board that demonstrates a multi-step puzzle solve.
 */
export function MenuGameplayPreview({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "hero";
}) {
  const baseGame = useMemo(() => createPreviewBaseGame(DEMO), []);
  const [phase, setPhase] = useState<DemoPhase>("ready");
  const [rotationIndex, setRotationIndex] = useState(0);
  const [orbIndex, setOrbIndex] = useState(0);
  const [trailCount, setTrailCount] = useState(1);
  const [appliedRotations, setAppliedRotations] = useState<PreviewRotation[]>([]);

  const activeRotation =
    phase === "rotate" ? (DEMO.rotations[rotationIndex] ?? null) : null;
  const orbPosition = DEMO.orbPath[orbIndex];
  const displayBoard = useMemo(
    () => buildPreviewBoard(baseGame.board, appliedRotations),
    [appliedRotations, baseGame.board],
  );
  const trailPositions = DEMO.orbPath.slice(0, Math.max(0, trailCount));

  const activeStepIndex =
    phase === "ready" || phase === "rotate"
      ? 0
      : phase === "travel"
        ? 1
        : 2;

  useEffect(() => {
    if (phase === "ready") {
      const timeout = window.setTimeout(() => setPhase("rotate"), 1200);
      return () => window.clearTimeout(timeout);
    }

    if (phase === "rotate") {
      const timeout = window.setTimeout(() => {
        const rotation = DEMO.rotations[rotationIndex];
        const { start } = getTravelBounds(rotationIndex);

        if (rotation) {
          setAppliedRotations((current) => [...current, rotation]);
        }

        setOrbIndex((current) => (current < start ? start : current));
        setTrailCount((current) => Math.max(current, start + 1));
        setPhase("travel");
      }, 800);

      return () => window.clearTimeout(timeout);
    }

    if (phase === "travel") {
      const { end } = getTravelBounds(rotationIndex);

      const interval = window.setInterval(() => {
        setOrbIndex((current) => {
          if (current >= end) {
            window.clearInterval(interval);

            if (rotationIndex < DEMO.rotations.length - 1) {
              setRotationIndex((value) => value + 1);
              setPhase("rotate");
              return current;
            }

            setTrailCount(DEMO.orbPath.length);
            setPhase("score");
            return current;
          }

          const next = current + 1;
          setTrailCount(next + 1);
          return next;
        });
      }, 380);

      return () => window.clearInterval(interval);
    }

    if (phase === "score") {
      const timeout = window.setTimeout(() => setPhase("reset"), 1800);
      return () => window.clearTimeout(timeout);
    }

    if (phase === "reset") {
      const timeout = window.setTimeout(() => {
        setRotationIndex(0);
        setOrbIndex(0);
        setTrailCount(1);
        setAppliedRotations([]);
        setPhase("ready");
      }, 500);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [phase, rotationIndex]);

  return (
    <div
      className={cn(
        "menu-gameplay-preview",
        variant === "hero" && "menu-dashboard__preview-hero",
        className,
      )}
    >
      {variant !== "hero" ? (
        <div className="menu-gameplay-preview__halo" aria-hidden="true" />
      ) : null}
      <div className="menu-gameplay-preview__panel">
        {variant !== "hero" ? (
          <div className="menu-gameplay-preview__meta">
            <div className="menu-gameplay-preview__header">
              <div>
                <p className="menu-gameplay-preview__label">Live preview</p>
                <p className="menu-gameplay-preview__title">{DEMO.title}</p>
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

            <p className="menu-gameplay-preview__caption">{DEMO.caption}</p>
          </div>
        ) : null}

        <div className="menu-gameplay-preview__stage">
          {variant !== "hero" ? (
            <div className="menu-gameplay-preview__stage-glow" aria-hidden="true" />
          ) : null}
          <div
            className={cn(
              "menu-gameplay-preview__board-wrap",
              variant === "hero" && "menu-gameplay-preview__board-wrap--hero",
            )}
          >
            <BoardGrid
              className="menu-gameplay-preview__board pointer-events-none h-full w-full max-w-none"
              board={displayBoard}
              spawn={baseGame.spawn}
              orbPosition={orbPosition}
              pathPositions={[]}
              trailPositions={trailPositions}
              rotatingPosition={activeRotation?.position ?? null}
              goalCelebration={
                phase === "score"
                  ? {
                      position: DEMO.orbPath[DEMO.orbPath.length - 1],
                      score: 1,
                      owner: "player1",
                    }
                  : null
              }
              isBoardCelebrating={phase === "score"}
              isOrbSpawning={phase === "ready"}
            />
          </div>
        </div>
      </div>

      {variant === "hero" ? (
        <>
          <p className="menu-dashboard__preview-caption">{DEMO.caption}</p>
          <div className="menu-dashboard__preview-dots" aria-hidden="true">
            {STEPS.map((entry, index) => (
              <span
                key={entry.id}
                className={cn(
                  "menu-dashboard__preview-dot",
                  index === activeStepIndex && "menu-dashboard__preview-dot--active",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

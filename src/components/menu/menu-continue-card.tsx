import { useMemo } from "react";

import { BoardGrid } from "@/components/board";
import { playSfx } from "@/audio";
import { createPreviewBaseGame, CORNER_ROUTE_PREVIEW_DEMO } from "@/utils/menu-preview-demo";
import type { ContinueMatchSummary } from "@/utils/home-continue";
import type { SavedMatch } from "@/types/progress";
import { PlayIcon } from "@/ui/icons";

export interface MenuContinueCardProps {
  canContinue: boolean;
  continueSummary: ContinueMatchSummary | null;
  activeMatch: SavedMatch | null;
  onContinue: () => void;
  onPlay: () => void;
}

function formatMoveLine(activeMatch: SavedMatch | null): string {
  if (!activeMatch) {
    return "Pick a mode and start playing";
  }

  const { game } = activeMatch;

  if (game.moveLimit !== undefined) {
    return `${game.movesPlayed} / ${game.moveLimit} moves`;
  }

  return `${game.movesPlayed} moves played`;
}

export function MenuContinueCard({
  canContinue,
  continueSummary,
  activeMatch,
  onContinue,
  onPlay,
}: MenuContinueCardProps) {
  const fallbackGame = useMemo(() => createPreviewBaseGame(CORNER_ROUTE_PREVIEW_DEMO), []);
  const previewBoard = activeMatch?.game.board ?? fallbackGame.board;
  const previewSpawn = activeMatch?.game.spawn ?? fallbackGame.spawn;
  const previewOrb = activeMatch?.game.orbPosition ?? fallbackGame.orbPosition;

  const handleClick = () => {
    playSfx("click");

    if (canContinue) {
      onContinue();
      return;
    }

    onPlay();
  };

  return (
    <button
      type="button"
      className="menu-dashboard__card menu-dashboard__continue w-full"
      onClick={handleClick}
      onMouseEnter={() => playSfx("hover")}
    >
      <div className="menu-dashboard__continue-board" aria-hidden="true">
        <BoardGrid
          className="h-full w-full max-w-none scale-[0.92]"
          board={previewBoard}
          spawn={previewSpawn}
          orbPosition={previewOrb}
          disabled
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
          {canContinue ? "Continue" : "Play"}
        </p>
        <p className="mt-1 truncate text-lg font-bold text-white">
          {canContinue ? continueSummary?.subtitle ?? "Saved match" : "Start a new run"}
        </p>
        <p className="mt-1 text-sm text-white/85">
          {canContinue
            ? continueSummary?.detail ?? formatMoveLine(activeMatch)
            : "VS AI, puzzle mode, or quick match"}
        </p>
        <p className="mt-1 text-xs text-white/70">{formatMoveLine(activeMatch)}</p>
      </div>

      <span className="menu-dashboard__continue-play" aria-hidden="true">
        <PlayIcon size={20} />
      </span>
    </button>
  );
}

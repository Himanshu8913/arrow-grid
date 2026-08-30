import { useMemo, type ReactNode } from "react";

import { BoardGrid } from "@/components/board";
import { useProgressStore } from "@/state/progress-store";
import type { SavedMatch } from "@/types/progress";
import { BotIcon, CalendarIcon, UsersIcon } from "@/ui/icons";
import {
  isDailyChallengeMode,
  isPracticeMode,
  isPuzzleMode,
} from "@/utils/game-messages";
import {
  CORNER_ROUTE_PREVIEW_DEMO,
  createPreviewBaseGame,
} from "@/utils/menu-preview-demo";

const MAX_LIVE_BOARD_THUMB_SIZE = 5;

export interface MenuContinueBoardThumbProps {
  activeMatch: SavedMatch | null;
}

function ModeThumb({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="menu-continue-thumb menu-continue-thumb--mode">
      <div className="menu-continue-thumb__grid-pattern" aria-hidden="true" />
      <div className="menu-continue-thumb__icon">{icon}</div>
      <span className="menu-continue-thumb__label">{label}</span>
    </div>
  );
}

function BoardPreview({
  board,
  spawn,
  orbPosition,
}: {
  board: SavedMatch["game"]["board"];
  spawn: SavedMatch["game"]["spawn"];
  orbPosition?: SavedMatch["game"]["orbPosition"];
}) {
  return (
    <BoardGrid
      className="menu-continue-thumb__board pointer-events-none h-full w-full max-w-none"
      board={board}
      spawn={spawn}
      orbPosition={orbPosition}
    />
  );
}

export function MenuContinueBoardThumb({ activeMatch }: MenuContinueBoardThumbProps) {
  const gameMode = useProgressStore((state) => state.gameMode);
  const fallbackGame = useMemo(() => createPreviewBaseGame(CORNER_ROUTE_PREVIEW_DEMO), []);

  if (!activeMatch) {
    return (
      <BoardPreview
        board={fallbackGame.board}
        spawn={fallbackGame.spawn}
        orbPosition={fallbackGame.orbPosition}
      />
    );
  }

  const { game } = activeMatch;
  const boardSize = game.board.length;

  if (isPracticeMode(gameMode)) {
    return (
      <ModeThumb
        icon={<BotIcon size={28} />}
        label="AI"
      />
    );
  }

  if (isDailyChallengeMode(gameMode)) {
    return (
      <ModeThumb
        icon={<CalendarIcon size={26} />}
        label="Daily"
      />
    );
  }

  if (gameMode === "pvp") {
    return (
      <ModeThumb
        icon={<UsersIcon size={26} />}
        label="PvP"
      />
    );
  }

  if (isPuzzleMode(gameMode) && boardSize <= MAX_LIVE_BOARD_THUMB_SIZE) {
    return (
      <BoardPreview
        board={game.board}
        spawn={game.spawn}
        orbPosition={game.orbPosition}
      />
    );
  }

  return (
    <BoardPreview
      board={fallbackGame.board}
      spawn={fallbackGame.spawn}
      orbPosition={fallbackGame.orbPosition}
    />
  );
}

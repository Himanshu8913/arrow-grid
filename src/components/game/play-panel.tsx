import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { BoardGrid } from "@/components/board";
import {
  createNewGame,
  executePlayerTurn,
  resolvePlayerTurn,
  type GameState,
} from "@/engine";
import { useOrbAnimation } from "@/hooks/use-orb-animation";
import { useToast } from "@/hooks/use-toast";
import type { Board, Position } from "@/types/game";
import { Badge } from "@/ui/badge";
import { Dropdown } from "@/ui/dropdown";
import { LoaderOverlay } from "@/ui/loader";
import {
  getMoveErrorMessage,
  getPlayerCountForMode,
} from "@/utils/game-messages";

export interface PlayPanelProps {
  gameMode: string;
  onGameModeChange: (mode: string) => void;
  onStartingChange?: (isStarting: boolean) => void;
}

export interface PlayPanelHandle {
  startGame: () => void;
}

function showTurnToasts(
  game: GameState,
  toast: ReturnType<typeof useToast>["toast"],
) {
  if (game.lastOutcome?.isLoop) {
    toast({
      title: "Loop detected",
      description: "The orb cycled without reaching a goal. No points awarded.",
      variant: "warning",
    });
    return;
  }

  if (game.lastOutcome?.scored && game.lastScore) {
    toast({
      title: "Goal scored!",
      description: `+${game.lastScore.total} points`,
      variant: "success",
    });
  }

  if (game.status === "won") {
    toast({
      title: "Match won!",
      description: `Player 1 finished with ${game.players.player1.matchPoints} match points.`,
      variant: "success",
    });
  }
}

/**
 * Interactive play surface with board rendering and orb animation.
 */
export const PlayPanel = forwardRef<PlayPanelHandle, PlayPanelProps>(
  function PlayPanel(
    { gameMode, onGameModeChange, onStartingChange },
    ref,
  ) {
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [game, setGame] = useState(() =>
      createNewGame({ seed: 42, playerCount: 2 }),
    );
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
      null,
    );
    const [pendingBoard, setPendingBoard] = useState<Board | null>(null);
    const { toast } = useToast();
    const {
      start: startOrbAnimation,
      reset: resetOrbAnimation,
      orbPosition: animatedOrbPosition,
      trailPositions,
      isAnimating,
    } = useOrbAnimation();

    useEffect(() => {
      onStartingChange?.(isStartingGame);
    }, [isStartingGame, onStartingChange]);

    const startGame = useCallback(() => {
      setIsStartingGame(true);
      resetOrbAnimation();
      setPendingBoard(null);

      window.setTimeout(() => {
        setGame(
          createNewGame({
            seed: Date.now(),
            playerCount: getPlayerCountForMode(gameMode),
          }),
        );
        setSelectedPosition(null);
        setIsStartingGame(false);
        toast({
          title: "Game ready",
          description: `${gameMode.toUpperCase()} mode board generated.`,
          variant: "success",
        });
      }, 1500);
    }, [gameMode, resetOrbAnimation, toast]);

    useImperativeHandle(ref, () => ({ startGame }), [startGame]);

    const handleTileClick = (position: Position) => {
      if (isStartingGame || isAnimating || game.status === "won") {
        return;
      }

      const snapshot = game;
      const turnResult = executePlayerTurn(
        snapshot.board,
        snapshot.spawn,
        { type: "rotate", position },
        { emptyTilesEnabled: snapshot.emptyTilesEnabled },
      );

      if ("error" in turnResult) {
        toast({
          title: "Invalid move",
          description: getMoveErrorMessage(turnResult.error),
          variant: "danger",
        });
        return;
      }

      setSelectedPosition(position);
      setPendingBoard(turnResult.board);

      startOrbAnimation(turnResult.orbPath, () => {
        const nextGame = resolvePlayerTurn(snapshot, turnResult);
        setGame(nextGame);
        setPendingBoard(null);
        showTurnToasts(nextGame, toast);
      });
    };

    const displayBoard = pendingBoard ?? game.board;
    const displayOrbPosition = isAnimating
      ? animatedOrbPosition
      : game.orbPosition;
    const isBoardDisabled =
      isStartingGame || isAnimating || game.status === "won";

    return (
      <div className="relative space-y-4 text-center">
        {isStartingGame ? <LoaderOverlay label="Starting game..." /> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg-card px-4 py-2 text-sm">
          <span className="text-text-muted">Turn {game.turnNumber}</span>
          <span className="font-semibold text-text-primary">
            Score {game.players.player1.totalScore}
          </span>
          <span className="text-text-muted">
            Points {game.players.player1.matchPoints}
            {game.playerCount === 2
              ? ` · P2 ${game.players.player2.matchPoints}`
              : ""}
          </span>
        </div>

        <BoardGrid
          board={displayBoard}
          spawn={game.spawn}
          orbPosition={displayOrbPosition}
          pathPositions={isAnimating ? [] : game.lastOrbPath}
          trailPositions={trailPositions}
          selectedPosition={selectedPosition}
          disabled={isBoardDisabled}
          onTileClick={handleTileClick}
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Strategy</Badge>
          <Badge variant="secondary">PvP</Badge>
          <Badge variant="success">Alpha</Badge>
        </div>

        <Dropdown
          className="mx-auto max-w-xs"
          label="Game Mode"
          value={gameMode}
          onValueChange={onGameModeChange}
          options={[
            { value: "pvp", label: "Player vs Player" },
            { value: "puzzle", label: "Puzzle Mode" },
            { value: "practice", label: "Practice" },
          ]}
        />
      </div>
    );
  },
);

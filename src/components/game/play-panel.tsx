import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { BoardGrid, type GoalCelebrationState } from "@/components/board";
import {
  createNewGame,
  evaluateTurnOutcome,
  executePlayerTurn,
  calculateTurnScore,
  resolvePlayerTurn,
  type GameState,
} from "@/engine";
import type { ExecuteTurnResult } from "@/engine/turn";
import {
  ARROW_ROTATION_MS,
  GOAL_CELEBRATION_MS,
  ORB_SPAWN_MS,
} from "@/constants/animation";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { useLoopAnimation } from "@/hooks/use-loop-animation";
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

function ScoreHud({ game }: { game: GameState }) {
  const playerOneScore = useAnimatedNumber(game.players.player1.totalScore);
  const playerOnePoints = useAnimatedNumber(game.players.player1.matchPoints);
  const playerTwoPoints = useAnimatedNumber(game.players.player2.matchPoints);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg-card px-4 py-2 text-sm">
      <span className="text-text-muted">Turn {game.turnNumber}</span>
      <span className="font-semibold text-text-primary tabular-nums">
        Score {playerOneScore}
      </span>
      <span className="text-text-muted tabular-nums">
        Points {playerOnePoints}
        {game.playerCount === 2 ? ` · P2 ${playerTwoPoints}` : ""}
      </span>
    </div>
  );
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
    const [frozenOrbPosition, setFrozenOrbPosition] = useState<Position | null>(
      null,
    );
    const [goalCelebration, setGoalCelebration] =
      useState<GoalCelebrationState | null>(null);
    const [isOrbSpawning, setIsOrbSpawning] = useState(false);
    const [orbSpawnKey, setOrbSpawnKey] = useState(0);
    const [rotatingPosition, setRotatingPosition] = useState<Position | null>(
      null,
    );
    const celebrationTimerRef = useRef<number | undefined>(undefined);
    const rotationTimerRef = useRef<number | undefined>(undefined);
    const { toast } = useToast();
    const {
      start: startOrbAnimation,
      reset: resetOrbAnimation,
      orbPosition: animatedOrbPosition,
      trailPositions,
      isAnimating,
    } = useOrbAnimation();

    const {
      start: startLoopAnimation,
      reset: resetLoopAnimation,
      loopTiles,
      activePulsePosition,
      isAnimating: isLoopAnimating,
      isOrbFailure,
    } = useLoopAnimation();

    useEffect(() => {
      onStartingChange?.(isStartingGame);
    }, [isStartingGame, onStartingChange]);

    useEffect(() => {
      return () => {
        window.clearTimeout(celebrationTimerRef.current);
        window.clearTimeout(rotationTimerRef.current);
      };
    }, []);

    const triggerOrbSpawn = useCallback(() => {
      setOrbSpawnKey((key) => key + 1);
      setIsOrbSpawning(true);
      window.setTimeout(() => setIsOrbSpawning(false), ORB_SPAWN_MS);
    }, []);

    const finishTurn = useCallback(
      (snapshot: GameState, turnResult: ExecuteTurnResult) => {
        const outcome = evaluateTurnOutcome(
          turnResult.movement,
          snapshot.currentPlayer,
        );
        const nextGame = resolvePlayerTurn(snapshot, turnResult);
        setGame(nextGame);
        setPendingBoard(null);
        setFrozenOrbPosition(null);
        setGoalCelebration(null);
        showTurnToasts(nextGame, toast);

        if (
          nextGame.status === "in-progress" &&
          outcome.scored &&
          turnResult.movement.stoppedReason === "goal"
        ) {
          triggerOrbSpawn();
        }
      },
      [toast, triggerOrbSpawn],
    );

    const handleOrbAnimationComplete = useCallback(
      (snapshot: GameState, turnResult: ExecuteTurnResult) => {
        const outcome = evaluateTurnOutcome(
          turnResult.movement,
          snapshot.currentPlayer,
        );

        if (outcome.scored && turnResult.movement.stoppedReason === "goal") {
          const scoreBreakdown = calculateTurnScore({
            outcome,
            actingPlayer: snapshot.currentPlayer,
            movesPlayed: snapshot.movesPlayed + 1,
            targetMoves: snapshot.targetMoves,
            shortestPathLength: snapshot.shortestPathLength,
            orbPathLength: turnResult.orbPath.length,
          });

          setFrozenOrbPosition(turnResult.orbPosition);
          setGoalCelebration({
            position: turnResult.orbPosition,
            score: scoreBreakdown?.total ?? 0,
            owner:
              turnResult.movement.goalOwner ?? snapshot.currentPlayer,
          });

          celebrationTimerRef.current = window.setTimeout(() => {
            finishTurn(snapshot, turnResult);
          }, GOAL_CELEBRATION_MS);
          return;
        }

        if (turnResult.movement.stoppedReason === "loop") {
          const loopSegment = turnResult.movement.loopSegment ?? [];

          setFrozenOrbPosition(turnResult.orbPosition);
          startLoopAnimation(loopSegment, () => {
            finishTurn(snapshot, turnResult);
          });
          return;
        }

        finishTurn(snapshot, turnResult);
      },
      [finishTurn, startLoopAnimation],
    );

    const startGame = useCallback(() => {
      window.clearTimeout(celebrationTimerRef.current);
      window.clearTimeout(rotationTimerRef.current);
      resetLoopAnimation();
      setIsStartingGame(true);
      resetOrbAnimation();
      setPendingBoard(null);
      setFrozenOrbPosition(null);
      setGoalCelebration(null);
      setRotatingPosition(null);

      window.setTimeout(() => {
        setGame(
          createNewGame({
            seed: Date.now(),
            playerCount: getPlayerCountForMode(gameMode),
          }),
        );
        setSelectedPosition(null);
        setIsStartingGame(false);
        triggerOrbSpawn();
        toast({
          title: "Game ready",
          description: `${gameMode.toUpperCase()} mode board generated.`,
          variant: "success",
        });
      }, 1500);
    }, [gameMode, resetLoopAnimation, resetOrbAnimation, toast, triggerOrbSpawn]);

    useImperativeHandle(ref, () => ({ startGame }), [startGame]);

    const handleTileClick = (position: Position) => {
      if (
        isStartingGame ||
        isAnimating ||
        isLoopAnimating ||
        rotatingPosition !== null ||
        goalCelebration !== null ||
        game.status === "won"
      ) {
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
      setRotatingPosition(position);

      rotationTimerRef.current = window.setTimeout(() => {
        setRotatingPosition(null);
        setPendingBoard(turnResult.board);

        startOrbAnimation(turnResult.orbPath, () => {
          handleOrbAnimationComplete(snapshot, turnResult);
        });
      }, ARROW_ROTATION_MS);
    };

    const displayBoard = pendingBoard ?? game.board;
    const displayOrbPosition =
      frozenOrbPosition ??
      (isAnimating ? animatedOrbPosition : game.orbPosition);
    const isBoardDisabled =
      isStartingGame ||
      isAnimating ||
      isLoopAnimating ||
      rotatingPosition !== null ||
      goalCelebration !== null ||
      game.status === "won";

    return (
      <div className="relative space-y-4 text-center">
        {isStartingGame ? <LoaderOverlay label="Starting game..." /> : null}

        <ScoreHud game={game} />

        <BoardGrid
          board={displayBoard}
          spawn={game.spawn}
          orbPosition={displayOrbPosition}
          pathPositions={isAnimating || isLoopAnimating ? [] : game.lastOrbPath}
          trailPositions={trailPositions}
          selectedPosition={selectedPosition}
          rotatingPosition={rotatingPosition}
          goalCelebration={goalCelebration}
          loopTiles={loopTiles}
          activeLoopPulsePosition={activePulsePosition}
          isLoopDetectionActive={isLoopAnimating}
          isBoardCelebrating={goalCelebration !== null}
          isBoardVibrating={isLoopAnimating}
          isOrbSpawning={isOrbSpawning}
          isOrbFailure={isOrbFailure}
          orbSpawnKey={orbSpawnKey}
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

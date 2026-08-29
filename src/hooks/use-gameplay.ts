import { useCallback, useEffect, useRef, useState } from "react";

import type { GoalCelebrationState } from "@/components/board";
import {
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
import { useAiTurn } from "@/hooks/use-ai-turn";
import { useLoopAnimation } from "@/hooks/use-loop-animation";
import { useOrbAnimation } from "@/hooks/use-orb-animation";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/state/game-store";
import type { Board, Position } from "@/types/game";
import {
  getMoveErrorMessage,
  getPlayerLabel,
  isHumanPlayerTurn,
} from "@/utils/game-messages";

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

  if (game.status === "won" && game.winner) {
    toast({
      title: "Match won!",
      description: `${getPlayerLabel(game.winner)} reached ${game.players[game.winner].matchPoints} match points.`,
      variant: "success",
    });
  }
}

export interface UseGameplayOptions {
  onStartingChange?: (isStarting: boolean) => void;
}

/**
 * Orchestrates the full turn loop: validate, animate, resolve, and update store.
 */
export function useGameplay({ onStartingChange }: UseGameplayOptions = {}) {
  const game = useGameStore((state) => state.game);
  const gameMode = useGameStore((state) => state.gameMode);
  const aiDifficulty = useGameStore((state) => state.aiDifficulty);
  const setGame = useGameStore((state) => state.setGame);
  const startMatch = useGameStore((state) => state.startMatch);

  const [isStartingGame, setIsStartingGame] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
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

  const finishTurnRef = useRef<
    (snapshot: GameState, turnResult: ExecuteTurnResult) => void
  >(() => undefined);

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
          owner: turnResult.movement.goalOwner ?? snapshot.currentPlayer,
        });

        celebrationTimerRef.current = window.setTimeout(() => {
          finishTurnRef.current(snapshot, turnResult);
        }, GOAL_CELEBRATION_MS);
        return;
      }

      if (turnResult.movement.stoppedReason === "loop") {
        setFrozenOrbPosition(turnResult.orbPosition);
        startLoopAnimation(turnResult.movement.loopSegment ?? [], () => {
          finishTurnRef.current(snapshot, turnResult);
        });
        return;
      }

      finishTurnRef.current(snapshot, turnResult);
    },
    [startLoopAnimation],
  );

  const playTurnAtPosition = useCallback(
    (snapshot: GameState, position: Position) => {
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
    },
    [handleOrbAnimationComplete, startOrbAnimation, toast],
  );

  const triggerOrbSpawn = useCallback(() => {
    setOrbSpawnKey((key) => key + 1);
    setIsOrbSpawning(true);
    window.setTimeout(() => setIsOrbSpawning(false), ORB_SPAWN_MS);
  }, []);

  const { isAiThinking, queueAiTurnIfNeeded, cancelAiTurn } = useAiTurn({
    gameMode,
    aiDifficulty,
    onPlayMove: playTurnAtPosition,
  });

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
      setSelectedPosition(null);
      showTurnToasts(nextGame, toast);

      if (
        nextGame.status === "in-progress" &&
        outcome.scored &&
        turnResult.movement.stoppedReason === "goal"
      ) {
        triggerOrbSpawn();
      }

      queueAiTurnIfNeeded(nextGame);
    },
    [queueAiTurnIfNeeded, setGame, toast, triggerOrbSpawn],
  );

  useEffect(() => {
    finishTurnRef.current = finishTurn;
  }, [finishTurn]);

  useEffect(() => {
    onStartingChange?.(isStartingGame);
  }, [isStartingGame, onStartingChange]);

  useEffect(() => {
    return () => {
      window.clearTimeout(celebrationTimerRef.current);
      window.clearTimeout(rotationTimerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    window.clearTimeout(celebrationTimerRef.current);
    window.clearTimeout(rotationTimerRef.current);
    cancelAiTurn();
    resetLoopAnimation();
    resetOrbAnimation();
    setIsStartingGame(true);
    setPendingBoard(null);
    setFrozenOrbPosition(null);
    setGoalCelebration(null);
    setRotatingPosition(null);
    setSelectedPosition(null);

    window.setTimeout(() => {
      startMatch();
      setIsStartingGame(false);
      triggerOrbSpawn();
      toast({
        title: "Game ready",
        description: "A fresh board is ready to play.",
        variant: "success",
      });
    }, 1500);
  }, [
    cancelAiTurn,
    resetLoopAnimation,
    resetOrbAnimation,
    startMatch,
    toast,
    triggerOrbSpawn,
  ]);

  const handleTileClick = useCallback(
    (position: Position) => {
      if (
        isStartingGame ||
        isAnimating ||
        isLoopAnimating ||
        isAiThinking ||
        rotatingPosition !== null ||
        goalCelebration !== null ||
        game.status === "won" ||
        !isHumanPlayerTurn(gameMode, game.currentPlayer)
      ) {
        return;
      }

      playTurnAtPosition(game, position);
    },
    [
      game,
      gameMode,
      goalCelebration,
      isAiThinking,
      isAnimating,
      isLoopAnimating,
      isStartingGame,
      playTurnAtPosition,
      rotatingPosition,
    ],
  );

  const displayBoard = pendingBoard ?? game.board;
  const displayOrbPosition =
    frozenOrbPosition ??
    (isAnimating ? animatedOrbPosition : game.orbPosition);
  const isInputLocked =
    isStartingGame ||
    isAnimating ||
    isLoopAnimating ||
    isAiThinking ||
    rotatingPosition !== null ||
    goalCelebration !== null ||
    game.status === "won" ||
    !isHumanPlayerTurn(gameMode, game.currentPlayer);

  return {
    game,
    gameMode,
    isStartingGame,
    isInputLocked,
    isAiThinking,
    displayBoard,
    displayOrbPosition,
    selectedPosition,
    rotatingPosition,
    goalCelebration,
    loopTiles,
    activePulsePosition,
    isLoopAnimating,
    isOrbSpawning,
    isOrbFailure,
    orbSpawnKey,
    trailPositions,
    isAnimating,
    startGame,
    handleTileClick,
  };
}

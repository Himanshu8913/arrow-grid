import { useCallback, useEffect, useRef, useState } from "react";

import type { GoalCelebrationState } from "@/components/board";
import { getPuzzleById } from "@/data/puzzles";
import {
  chooseAiMove,
  evaluateTurnOutcome,
  executePlayerTurn,
  calculateTurnScore,
  resolvePlayerTurn,
  applyPuzzleMoveLimit,
  calculatePuzzleStars,
  cloneGameState,
  createGameFromPuzzle,
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
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { useStatisticsStore } from "@/state/statistics-store";
import type { Board, Position } from "@/types/game";
import {
  getMoveErrorMessage,
  getPlayerLabel,
  isHumanPlayerTurn,
  isPracticeMode,
  isPuzzleMode,
} from "@/utils/game-messages";
import { getMatchStatisticsInput } from "@/utils/match-statistics";

function showTurnToasts(
  game: GameState,
  gameMode: string,
  toast: ReturnType<typeof useToast>["toast"],
) {
  if (isPuzzleMode(gameMode)) {
    return;
  }

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

  const hintsUsed = usePuzzleSessionStore((state) => state.hintsUsed);
  const hintPosition = usePuzzleSessionStore((state) => state.hintPosition);
  const earnedStars = usePuzzleSessionStore((state) => state.earnedStars);
  const incrementHintsUsed = usePuzzleSessionStore(
    (state) => state.incrementHintsUsed,
  );
  const setHintPosition = usePuzzleSessionStore((state) => state.setHintPosition);
  const setEarnedStars = usePuzzleSessionStore((state) => state.setEarnedStars);
  const resetPuzzleSession = usePuzzleSessionStore(
    (state) => state.resetPuzzleSession,
  );

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
  const [undoStack, setUndoStack] = useState<GameState[]>([]);

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
  const recordedMatchKeyRef = useRef<string | null>(null);

  const recordMatchStatistics = useCallback(
    (nextGame: GameState) => {
      if (nextGame.status !== "won" && nextGame.status !== "lost") {
        return;
      }

      const matchKey = `${nextGame.puzzleId ?? "match"}-${nextGame.movesPlayed}-${nextGame.status}-${nextGame.winner ?? "none"}`;
      if (recordedMatchKeyRef.current === matchKey) {
        return;
      }

      recordedMatchKeyRef.current = matchKey;

      const statisticsInput = getMatchStatisticsInput({
        game: nextGame,
        gameMode,
      });

      if (!statisticsInput) {
        return;
      }

      const { recordMatchEnd, recordPvpGame } = useStatisticsStore.getState();

      if ("kind" in statisticsInput && statisticsInput.kind === "pvp") {
        recordPvpGame(statisticsInput.movesPlayed);
        return;
      }

      recordMatchEnd(statisticsInput);
    },
    [gameMode],
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
    (snapshot: GameState, position: Position, recordUndo = false) => {
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

      if (recordUndo) {
        setUndoStack((stack) => [...stack, cloneGameState(snapshot)]);
      }

      setHintPosition(null);
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
    [handleOrbAnimationComplete, setHintPosition, startOrbAnimation, toast],
  );

  const triggerOrbSpawn = useCallback(() => {
    setOrbSpawnKey((key) => key + 1);
    setIsOrbSpawning(true);
    window.setTimeout(() => setIsOrbSpawning(false), ORB_SPAWN_MS);
  }, []);

  const { isAiThinking, queueAiTurnIfNeeded, cancelAiTurn } = useAiTurn({
    gameMode,
    aiDifficulty,
    onPlayMove: (snapshot, position) => playTurnAtPosition(snapshot, position),
  });

  const finishTurn = useCallback(
    (snapshot: GameState, turnResult: ExecuteTurnResult) => {
      const outcome = evaluateTurnOutcome(
        turnResult.movement,
        snapshot.currentPlayer,
      );
      let nextGame = resolvePlayerTurn(snapshot, turnResult);

      if (isPuzzleMode(gameMode)) {
        nextGame = applyPuzzleMoveLimit(nextGame);

        if (nextGame.status === "won" && nextGame.puzzleId) {
          const puzzle = getPuzzleById(nextGame.puzzleId);
          const hintsUsedAtFinish =
            usePuzzleSessionStore.getState().hintsUsed;
          setEarnedStars(
            calculatePuzzleStars(
              nextGame.movesPlayed,
              puzzle.targetMoves,
              hintsUsedAtFinish,
            ),
          );
        }
      }

      setGame(nextGame);
      setPendingBoard(null);
      setFrozenOrbPosition(null);
      setGoalCelebration(null);
      setSelectedPosition(null);
      showTurnToasts(nextGame, gameMode, toast);
      recordMatchStatistics(nextGame);

      if (
        !isPuzzleMode(gameMode) &&
        nextGame.status === "in-progress" &&
        outcome.scored &&
        turnResult.movement.stoppedReason === "goal"
      ) {
        triggerOrbSpawn();
      }

      if (!isPuzzleMode(gameMode)) {
        queueAiTurnIfNeeded(nextGame);
      }
    },
    [
      gameMode,
      queueAiTurnIfNeeded,
      recordMatchStatistics,
      setEarnedStars,
      setGame,
      toast,
      triggerOrbSpawn,
    ],
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

  const clearTransientState = useCallback(() => {
    window.clearTimeout(celebrationTimerRef.current);
    window.clearTimeout(rotationTimerRef.current);
    cancelAiTurn();
    resetLoopAnimation();
    resetOrbAnimation();
    setPendingBoard(null);
    setFrozenOrbPosition(null);
    setGoalCelebration(null);
    setRotatingPosition(null);
    setSelectedPosition(null);
  }, [cancelAiTurn, resetLoopAnimation, resetOrbAnimation]);

  const startGame = useCallback(() => {
    clearTransientState();
    recordedMatchKeyRef.current = null;
    setIsStartingGame(true);
    setUndoStack([]);
    resetPuzzleSession();

    window.setTimeout(() => {
      startMatch();
      setIsStartingGame(false);
      if (!isPuzzleMode(gameMode)) {
        triggerOrbSpawn();
      }
      toast({
        title: "Game ready",
        description: isPuzzleMode(gameMode)
          ? "Puzzle loaded. Reach the goal within the move limit."
          : "A fresh board is ready to play.",
        variant: "success",
      });
    }, 1500);
  }, [
    clearTransientState,
    gameMode,
    resetPuzzleSession,
    startMatch,
    toast,
    triggerOrbSpawn,
  ]);

  const isMatchOver = game.status === "won" || game.status === "lost";
  const isInputLocked =
    isStartingGame ||
    isAnimating ||
    isLoopAnimating ||
    isAiThinking ||
    rotatingPosition !== null ||
    goalCelebration !== null ||
    isMatchOver ||
    !isHumanPlayerTurn(gameMode, game.currentPlayer);

  const restartPuzzle = useCallback(() => {
    if (!game.puzzleId) {
      return;
    }

    clearTransientState();
    recordedMatchKeyRef.current = null;
    setUndoStack([]);
    resetPuzzleSession();
    setGame(createGameFromPuzzle(getPuzzleById(game.puzzleId)));
  }, [clearTransientState, game.puzzleId, resetPuzzleSession, setGame]);

  const undoPuzzle = useCallback(() => {
    if (undoStack.length === 0 || isInputLocked) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    clearTransientState();
    setUndoStack((stack) => stack.slice(0, -1));
    setGame(previousState);
    setEarnedStars(null);
  }, [clearTransientState, isInputLocked, setEarnedStars, setGame, undoStack]);

  const requestHint = useCallback(() => {
    if (!isPuzzleMode(gameMode) || game.status !== "in-progress" || isInputLocked) {
      return;
    }

    const move = chooseAiMove(game, { difficulty: "medium" });

    if (!move) {
      toast({
        title: "No hint available",
        description: "There are no legal moves left on this board.",
        variant: "warning",
      });
      return;
    }

    setHintPosition(move);
    incrementHintsUsed();
    toast({
      title: "Hint",
      description: "Try rotating the highlighted arrow.",
      variant: "default",
    });
  }, [
    game,
    gameMode,
    incrementHintsUsed,
    isInputLocked,
    setHintPosition,
    toast,
  ]);

  const handleTileClick = useCallback(
    (position: Position) => {
      if (isInputLocked) {
        return;
      }

      playTurnAtPosition(
        game,
        position,
        isPuzzleMode(gameMode) && game.status === "in-progress",
      );
    },
    [game, gameMode, isInputLocked, playTurnAtPosition],
  );

  const displayBoard = pendingBoard ?? game.board;
  const displayOrbPosition =
    frozenOrbPosition ??
    (isAnimating ? animatedOrbPosition : game.orbPosition);

  return {
    game,
    gameMode,
    isStartingGame,
    isInputLocked,
    isAiThinking,
    isPuzzleMode: isPuzzleMode(gameMode),
    isPracticeMode: isPracticeMode(gameMode),
    hintsUsed,
    hintPosition,
    earnedStars,
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
    canUndoPuzzle: undoStack.length > 0 && !isInputLocked,
    startGame,
    handleTileClick,
    restartPuzzle,
    undoPuzzle,
    requestHint,
  };
}

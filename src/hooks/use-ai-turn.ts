import { useCallback, useEffect, useRef, useState } from "react";

import { chooseAiMove } from "@/engine/ai";
import type { GameState } from "@/engine/game-state";
import { AI_THINK_MS, type AiDifficulty } from "@/constants/ai";
import type { Position } from "@/types/game";
import { isPracticeMode } from "@/utils/game-messages";

export interface UseAiTurnOptions {
  gameMode: string;
  aiDifficulty: AiDifficulty;
  onPlayMove: (snapshot: GameState, position: Position) => void;
}

/**
 * Schedules AI moves in practice mode after a configurable thinking delay.
 */
export function useAiTurn({
  gameMode,
  aiDifficulty,
  onPlayMove,
}: UseAiTurnOptions) {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const onPlayMoveRef = useRef(onPlayMove);

  useEffect(() => {
    onPlayMoveRef.current = onPlayMove;
  }, [onPlayMove]);

  const cancelAiTurn = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setIsAiThinking(false);
  }, []);

  useEffect(() => cancelAiTurn, [cancelAiTurn]);

  const queueAiTurnIfNeeded = useCallback(
    (nextGame: GameState) => {
      if (!isPracticeMode(gameMode)) {
        return;
      }

      if (nextGame.status !== "in-progress" || nextGame.currentPlayer !== "player2") {
        return;
      }

      setIsAiThinking(true);
      timerRef.current = window.setTimeout(() => {
        const move = chooseAiMove(nextGame, { difficulty: aiDifficulty });
        setIsAiThinking(false);

        if (move) {
          onPlayMoveRef.current(nextGame, move);
        }
      }, AI_THINK_MS[aiDifficulty]);
    },
    [aiDifficulty, gameMode],
  );

  return {
    isAiThinking,
    queueAiTurnIfNeeded,
    cancelAiTurn,
  };
}

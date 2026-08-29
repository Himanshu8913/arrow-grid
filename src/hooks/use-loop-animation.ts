import { useCallback, useEffect, useRef, useState } from "react";

import { LOOP_DETECTION_MS } from "@/constants/animation";
import type { Position } from "@/types/game";

interface LoopAnimationState {
  tiles: Position[];
  activeIndex: number;
  isAnimating: boolean;
}

const idleState: LoopAnimationState = {
  tiles: [],
  activeIndex: -1,
  isAnimating: false,
};

/**
 * Drives sequential loop-tile pulses and orb fade timing.
 */
export function useLoopAnimation(duration: number = LOOP_DETECTION_MS) {
  const [state, setState] = useState<LoopAnimationState>(idleState);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current);
    onCompleteRef.current = null;
    setState(idleState);
  }, []);

  const start = useCallback(
    (tiles: Position[], onComplete?: () => void) => {
      window.clearTimeout(timerRef.current);
      onCompleteRef.current = onComplete ?? null;

      if (tiles.length === 0) {
        onComplete?.();
        return;
      }

      setState({
        tiles,
        activeIndex: 0,
        isAnimating: true,
      });
    },
    [],
  );

  useEffect(() => {
    if (!state.isAnimating) {
      return;
    }

    const stepMs = duration / state.tiles.length;

    timerRef.current = window.setTimeout(() => {
      if (state.activeIndex >= state.tiles.length - 1) {
        const complete = onCompleteRef.current;
        onCompleteRef.current = null;
        setState(idleState);
        complete?.();
        return;
      }

      setState((current) => ({
        ...current,
        activeIndex: current.activeIndex + 1,
      }));
    }, stepMs);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [duration, state.activeIndex, state.isAnimating, state.tiles.length]);

  const activePulsePosition =
    state.isAnimating && state.activeIndex >= 0
      ? state.tiles[state.activeIndex]
      : undefined;

  return {
    start,
    reset,
    loopTiles: state.isAnimating ? state.tiles : [],
    activePulsePosition,
    isAnimating: state.isAnimating,
    isOrbFading: state.isAnimating,
  };
}

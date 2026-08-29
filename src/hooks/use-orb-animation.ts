import { useCallback, useEffect, useRef, useState } from "react";

import {
  ORB_STEP_MS,
  ORB_TRAIL_MAX_LENGTH,
} from "@/constants/animation";
import type { Position } from "@/types/game";

interface OrbAnimationState {
  path: Position[];
  index: number;
  isAnimating: boolean;
}

const idleState: OrbAnimationState = {
  path: [],
  index: 0,
  isAnimating: false,
};

/**
 * Steps an orb along a path one tile at a time for board playback.
 */
export function useOrbAnimation(
  stepMs: number = ORB_STEP_MS,
  maxTrailLength: number = ORB_TRAIL_MAX_LENGTH,
) {
  const [state, setState] = useState<OrbAnimationState>(idleState);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current);
    onCompleteRef.current = null;
    setState(idleState);
  }, []);

  const start = useCallback(
    (path: Position[], onComplete?: () => void) => {
      window.clearTimeout(timerRef.current);
      onCompleteRef.current = onComplete ?? null;

      if (path.length <= 1) {
        setState(idleState);
        onComplete?.();
        return;
      }

      setState({
        path,
        index: 0,
        isAnimating: true,
      });
    },
    [],
  );

  useEffect(() => {
    if (!state.isAnimating) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      if (state.index >= state.path.length - 1) {
        const complete = onCompleteRef.current;
        onCompleteRef.current = null;
        setState(idleState);
        complete?.();
        return;
      }

      setState((current) => ({
        ...current,
        index: current.index + 1,
      }));
    }, stepMs);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [state.isAnimating, state.index, state.path.length, stepMs]);

  const orbPosition = state.isAnimating ? state.path[state.index] : undefined;
  const trailStart = Math.max(0, state.index - maxTrailLength);
  const trailPositions = state.isAnimating
    ? state.path.slice(trailStart, state.index)
    : [];

  return {
    start,
    reset,
    orbPosition,
    trailPositions,
    isAnimating: state.isAnimating,
  };
}

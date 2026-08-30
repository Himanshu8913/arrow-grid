import { useCallback, useEffect, useRef, useState } from "react";

import {
  ORB_STEP_MS,
  ORB_TRAIL_MAX_LENGTH,
} from "@/constants/animation";
import type { OrbState, Position } from "@/types/game";

interface OrbAnimationTrack {
  id: string;
  path: Position[];
  index: number;
}

interface OrbAnimationState {
  tracks: OrbAnimationTrack[];
  isAnimating: boolean;
}

const idleState: OrbAnimationState = {
  tracks: [],
  isAnimating: false,
};

function getTrackPosition(track: OrbAnimationTrack): Position | undefined {
  return track.path[track.index];
}

/**
 * Steps one or more orbs along their paths in sync for board playback.
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
    (
      paths: Position[] | Record<string, Position[]>,
      onComplete?: () => void,
    ) => {
      window.clearTimeout(timerRef.current);
      onCompleteRef.current = onComplete ?? null;

      const entries = Array.isArray(paths)
        ? [{ id: "0", path: paths }]
        : Object.entries(paths).map(([id, path]) => ({ id, path }));

      const tracks = entries
        .filter((entry) => entry.path.length > 1)
        .map((entry) => ({
          id: entry.id,
          path: entry.path,
          index: 0,
        }));

      if (tracks.length === 0) {
        setState(idleState);
        onComplete?.();
        return;
      }

      setState({
        tracks,
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
      const allComplete = state.tracks.every(
        (track) => track.index >= track.path.length - 1,
      );

      if (allComplete) {
        const complete = onCompleteRef.current;
        onCompleteRef.current = null;
        setState(idleState);
        complete?.();
        return;
      }

      setState((current) => ({
        ...current,
        tracks: current.tracks.map((track) => ({
          ...track,
          index:
            track.index >= track.path.length - 1
              ? track.index
              : track.index + 1,
        })),
      }));
    }, stepMs);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [state.isAnimating, state.tracks, stepMs]);

  const animatedOrbs: OrbState[] = state.isAnimating
    ? state.tracks
        .map((track) => {
          const position = getTrackPosition(track);
          return position ? { id: track.id, position } : null;
        })
        .filter((orb): orb is OrbState => orb !== null)
    : [];

  const trailPositionsByOrb = Object.fromEntries(
    state.tracks.map((track) => {
      const trailStart = Math.max(0, track.index - maxTrailLength);
      return [track.id, track.path.slice(trailStart, track.index)];
    }),
  );

  const trailPositions = state.tracks.flatMap((track) => {
    const trailStart = Math.max(0, track.index - maxTrailLength);
    return track.path.slice(trailStart, track.index);
  });

  const orbPosition = animatedOrbs[0]?.position;

  return {
    start,
    reset,
    orbPosition,
    animatedOrbs,
    trailPositions,
    trailPositionsByOrb,
    isAnimating: state.isAnimating,
  };
}

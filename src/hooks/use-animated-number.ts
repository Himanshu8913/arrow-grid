import { useEffect, useRef, useState } from "react";

import { SCORE_COUNT_MS } from "@/constants/animation";

/**
 * Smoothly tweens a number toward the latest target value.
 */
export function useAnimatedNumber(
  value: number,
  duration: number = SCORE_COUNT_MS,
): number {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const from = previousValueRef.current;
    const to = value;

    if (from === to) {
      return;
    }

    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      previousValueRef.current = to;
      setDisplayValue(to);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return displayValue;
}

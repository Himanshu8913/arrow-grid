import { useMemo } from "react";
import type { CSSProperties } from "react";

const FIREWORK_COUNT = 24;

/**
 * Radial firework burst for seasonal victory screens.
 */
export function VictoryFireworks() {
  const sparks = useMemo(
    () =>
      Array.from({ length: FIREWORK_COUNT }, (_, index) => {
        const angle = (index / FIREWORK_COUNT) * Math.PI * 2;
        const distance = 48 + (index % 4) * 18;

        return {
          id: index,
          style: {
            left: "50%",
            top: "38%",
            "--firework-tx": `${Math.cos(angle) * distance}px`,
            "--firework-ty": `${Math.sin(angle) * distance}px`,
            backgroundColor:
              index % 3 === 0
                ? "rgb(251 191 36)"
                : index % 3 === 1
                  ? "rgb(236 72 153)"
                  : "rgb(59 130 246)",
            animationDelay: `${(index % 6) * 80}ms`,
          } as CSSProperties,
        };
      }),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="victory-firework"
          style={spark.style}
        />
      ))}
    </div>
  );
}

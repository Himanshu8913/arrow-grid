import { useMemo } from "react";

import { getActiveSeasonalEvent } from "@/utils/seasonal";

const PARTICLE_COUNT = 18;

/**
 * Animated ambient background for the main menu.
 */
export function MenuBackground() {
  const event = getActiveSeasonalEvent();

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        top: `${(index * 23) % 100}%`,
        animationDelay: `${(index % 8) * 0.45}s`,
        animationDuration: `${5 + (index % 5)}s`,
      })),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="menu-bg-gradient absolute inset-0" />
      <div className="menu-bg-grid absolute inset-0 opacity-40" />
      <span className="menu-bg-orb menu-bg-orb-a" />
      <span className="menu-bg-orb menu-bg-orb-b" />
      <span className="menu-bg-orb menu-bg-orb-c" />
      {event
        ? particles.map((particle) => (
            <span
              key={particle.id}
              className="seasonal-menu-particle"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
              }}
            />
          ))
        : null}
    </div>
  );
}

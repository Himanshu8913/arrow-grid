import { useMemo } from "react";

import { ArrowGlyph } from "@/components/board/arrow-glyph";
import { getActiveSeasonalEvent } from "@/utils/seasonal";

const PARTICLE_COUNT = 24;
const ARROW_COUNT = 6;

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

  const floatingArrows = useMemo(
    () =>
      Array.from({ length: ARROW_COUNT }, (_, index) => ({
        id: index,
        left: `${12 + index * 14}%`,
        top: `${18 + (index % 3) * 24}%`,
        direction: (["up", "right", "down", "left"] as const)[index % 4],
        animationDelay: `${index * 1.4}s`,
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
      <div className="menu-bg-hero-art absolute inset-0" />
      <span className="menu-bg-orb menu-bg-orb-a" />
      <span className="menu-bg-orb menu-bg-orb-b" />
      <span className="menu-bg-orb menu-bg-orb-c" />

      {floatingArrows.map((arrow) => (
        <span
          key={arrow.id}
          className="menu-bg-arrow"
          style={{
            left: arrow.left,
            top: arrow.top,
            animationDelay: arrow.animationDelay,
          }}
        >
          <ArrowGlyph direction={arrow.direction} />
        </span>
      ))}

      {particles.map((particle) => (
        <span
          key={particle.id}
          className={event ? "seasonal-menu-particle" : "menu-bg-particle"}
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
          }}
        />
      ))}
    </div>
  );
}

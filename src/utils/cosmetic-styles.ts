/**
 * CSS class for the equipped profile frame cosmetic.
 */
export function getEquippedFrameClassName(frameId: string): string | undefined {
  if (frameId === "frame-gold") {
    return "cosmetic-frame-gold";
  }

  if (frameId === "frame-neon") {
    return "cosmetic-frame-neon";
  }

  if (frameId === "frame-anniversary") {
    return "cosmetic-frame-anniversary";
  }

  return undefined;
}

/**
 * CSS classes for the equipped orb cosmetic.
 */
export function getEquippedOrbClassName(
  orbId: string,
  isFailure: boolean,
): string | undefined {
  if (isFailure) {
    return undefined;
  }

  if (orbId === "orb-ember") {
    return "cosmetic-orb-ember";
  }

  if (orbId === "orb-neon") {
    return "cosmetic-orb-neon";
  }

  if (orbId === "orb-ghost") {
    return "cosmetic-orb-ghost";
  }

  if (orbId === "orb-frost") {
    return "cosmetic-orb-frost";
  }

  if (orbId === "orb-lantern") {
    return "cosmetic-orb-lantern";
  }

  if (orbId === "orb-anniversary") {
    return "cosmetic-orb-anniversary";
  }

  return undefined;
}

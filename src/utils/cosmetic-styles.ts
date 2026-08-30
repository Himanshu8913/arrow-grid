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

  return undefined;
}

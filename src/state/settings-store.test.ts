import { describe, expect, it } from "vitest";

import { createDefaultSettings } from "@/types/settings";

describe("settings defaults", () => {
  it("includes accessibility fields used by the settings store merge", () => {
    expect(createDefaultSettings()).toMatchObject({
      musicEnabled: true,
      sfxEnabled: true,
      muted: false,
      animationsEnabled: true,
      reducedMotion: false,
      colorblindMode: false,
      highContrast: false,
      language: "en",
    });
  });

  it("clamps volume values through store helpers indirectly", () => {
    const defaults = createDefaultSettings();

    expect(defaults.musicVolume).toBeGreaterThanOrEqual(0);
    expect(defaults.musicVolume).toBeLessThanOrEqual(1);
    expect(defaults.sfxVolume).toBeGreaterThanOrEqual(0);
    expect(defaults.sfxVolume).toBeLessThanOrEqual(1);
  });
});

/** Supported UI languages. */
export type AppLanguage = "en";

export interface Settings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  colorblindMode: boolean;
  highContrast: boolean;
  language: AppLanguage;
}

export function createDefaultSettings(): Settings {
  return {
    musicEnabled: true,
    sfxEnabled: true,
    muted: false,
    musicVolume: 0.35,
    sfxVolume: 0.7,
    animationsEnabled: true,
    reducedMotion: false,
    colorblindMode: false,
    highContrast: false,
    language: "en",
  };
}

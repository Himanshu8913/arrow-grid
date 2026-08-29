export interface Settings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
}

export function createDefaultSettings(): Settings {
  return {
    musicEnabled: true,
    sfxEnabled: true,
    muted: false,
    musicVolume: 0.35,
    sfxVolume: 0.7,
    reducedMotion: false,
  };
}

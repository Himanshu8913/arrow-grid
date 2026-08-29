import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createDefaultSettings, type Settings } from "@/types/settings";

interface SettingsStore extends Settings {
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetSettings: () => void;
}

/**
 * Persisted player preferences for audio and accessibility.
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...createDefaultSettings(),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setMuted: (muted) => set({ muted }),
      setMusicVolume: (musicVolume) =>
        set({ musicVolume: clampVolume(musicVolume) }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume: clampVolume(sfxVolume) }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      resetSettings: () => set(createDefaultSettings()),
    }),
    {
      name: "arrow-grid-settings",
    },
  ),
);

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

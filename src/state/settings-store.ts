import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createDefaultSettings, type AppLanguage, type Settings } from "@/types/settings";

interface SettingsStore extends Settings {
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
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
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setLanguage: (language) => set({ language }),
      resetSettings: () => set(createDefaultSettings()),
    }),
    {
      name: "arrow-grid-settings",
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<Settings>),
      }),
    },
  ),
);

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

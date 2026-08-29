import type { ReactNode } from "react";
import { useEffect } from "react";

import { audioManager } from "@/audio";
import { useSettingsStore } from "@/state/settings-store";

/**
 * Boots audio and applies persisted accessibility preferences.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const musicEnabled = useSettingsStore((state) => state.musicEnabled);
  const muted = useSettingsStore((state) => state.muted);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const syncAudio = () => {
      audioManager.updateFromSettings(useSettingsStore.getState());
    };

    syncAudio();

    const unlock = () => {
      audioManager.unlock();
      syncAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    audioManager.updateFromSettings({
      ...useSettingsStore.getState(),
      musicEnabled,
      muted,
      musicVolume,
      sfxVolume,
    });
  }, [musicEnabled, muted, musicVolume, sfxVolume]);

  return children;
}

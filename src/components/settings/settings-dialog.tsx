import { type ReactNode, useState } from "react";

import { LANGUAGE_OPTIONS } from "@/constants/locale";
import { useTheme } from "@/hooks/use-theme";
import { useSettingsStore } from "@/state/settings-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { useAchievementStore } from "@/state/achievement-store";
import type { AppLanguage } from "@/types/settings";
import type { ThemeMode } from "@/types/theme";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Dropdown } from "@/ui/dropdown";
import { Slider } from "@/ui/slider";

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const;

/**
 * Full game settings: audio, display, accessibility, and data controls.
 */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const musicEnabled = useSettingsStore((state) => state.musicEnabled);
  const sfxEnabled = useSettingsStore((state) => state.sfxEnabled);
  const muted = useSettingsStore((state) => state.muted);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const language = useSettingsStore((state) => state.language);
  const setMusicEnabled = useSettingsStore((state) => state.setMusicEnabled);
  const setSfxEnabled = useSettingsStore((state) => state.setSfxEnabled);
  const setMuted = useSettingsStore((state) => state.setMuted);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setSfxVolume = useSettingsStore((state) => state.setSfxVolume);
  const setAnimationsEnabled = useSettingsStore(
    (state) => state.setAnimationsEnabled,
  );
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const resetStatistics = useStatisticsStore((state) => state.resetStatistics);
  const resetAchievements = useAchievementStore(
    (state) => state.resetAchievements,
  );

  const handleResetProgress = () => {
    resetStatistics();
    resetAchievements();
    setIsResetConfirmOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Settings"
      description="Preferences are saved automatically on this device."
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        <SettingsSection title="Audio">
          <ToggleRow
            label="Mute all"
            description="Silence music and sound effects."
            checked={muted}
            onChange={setMuted}
          />
          <ToggleRow
            label="Music"
            description="Ambient background music."
            checked={musicEnabled}
            onChange={setMusicEnabled}
            disabled={muted}
          />
          <Slider
            label="Music volume"
            value={musicVolume}
            onChange={setMusicVolume}
          />
          <ToggleRow
            label="Sound effects"
            description="UI and gameplay feedback."
            checked={sfxEnabled}
            onChange={setSfxEnabled}
            disabled={muted}
          />
          <Slider label="SFX volume" value={sfxVolume} onChange={setSfxVolume} />
        </SettingsSection>

        <SettingsSection title="Display">
          <Dropdown
            label="Theme"
            value={theme}
            options={THEME_OPTIONS}
            onValueChange={(value) => setTheme(value as ThemeMode)}
          />
          <Dropdown
            label="Language"
            value={language}
            options={LANGUAGE_OPTIONS}
            onValueChange={(value) => setLanguage(value as AppLanguage)}
          />
        </SettingsSection>

        <SettingsSection title="Accessibility">
          <ToggleRow
            label="Animations"
            description="Goal celebrations, particles, and board flair."
            checked={animationsEnabled}
            onChange={setAnimationsEnabled}
          />
          <ToggleRow
            label="Reduced motion"
            description="Minimize all motion for accessibility."
            checked={reducedMotion}
            onChange={setReducedMotion}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm font-semibold text-text-primary">
              Reset progress
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Clears saved statistics and achievements on this device.
            </p>
            {isResetConfirmOpen ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleResetProgress}
                >
                  Confirm reset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResetConfirmOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={() => setIsResetConfirmOpen(true)}
              >
                Reset progress
              </Button>
            )}
          </div>
        </SettingsSection>
      </div>
    </Dialog>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl bg-bg-card p-3">
      <span>
        <span className="block text-sm font-semibold text-text-primary">
          {label}
        </span>
        <span className="mt-1 block text-xs text-text-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-accent-primary"
      />
    </label>
  );
}

import { type ReactNode, useState } from "react";

import { LANGUAGE_OPTIONS } from "@/constants/locale";
import { useTheme } from "@/hooks/use-theme";
import { clearGameplayProgress } from "@/save";
import { useSettingsStore } from "@/state/settings-store";
import type { AppLanguage } from "@/types/settings";
import type { ThemeMode } from "@/types/theme";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Dropdown } from "@/ui/dropdown";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";
import { cn } from "@/utils/cn";

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
  const colorblindMode = useSettingsStore((state) => state.colorblindMode);
  const highContrast = useSettingsStore((state) => state.highContrast);
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
  const setColorblindMode = useSettingsStore((state) => state.setColorblindMode);
  const setHighContrast = useSettingsStore((state) => state.setHighContrast);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleResetProgress = () => {
    clearGameplayProgress();
    setIsResetConfirmOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Settings"
      description="Preferences are saved automatically on this device."
      size="large"
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        <SettingsSection title="Audio">
          <ToggleRow
            label="Mute all"
            description="Silence music and sound effects."
            checked={muted}
            onChange={setMuted}
          />
          <div
            className={cn(
              "space-y-3 rounded-2xl border border-bg-card/80 bg-bg-card/40 p-3",
              muted && "opacity-60",
            )}
          >
            <ToggleRow
              label="Music"
              description="Ambient background music."
              checked={musicEnabled}
              onChange={setMusicEnabled}
              disabled={muted}
              embedded
            />
            <Slider
              label="Music volume"
              value={musicVolume}
              onChange={setMusicVolume}
              className={muted ? "pointer-events-none" : undefined}
            />
            <ToggleRow
              label="Sound effects"
              description="UI and gameplay feedback."
              checked={sfxEnabled}
              onChange={setSfxEnabled}
              disabled={muted}
              embedded
            />
            <Slider
              label="SFX volume"
              value={sfxVolume}
              onChange={setSfxVolume}
              className={muted ? "pointer-events-none" : undefined}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Display">
          <div className="space-y-3 rounded-2xl border border-bg-card/80 bg-bg-card/40 p-3">
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
          </div>
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
          <ToggleRow
            label="Colorblind mode"
            description="Use distinct patterns and direction markers instead of color alone."
            checked={colorblindMode}
            onChange={setColorblindMode}
          />
          <ToggleRow
            label="High contrast"
            description="Increase contrast for text, borders, and UI elements."
            checked={highContrast}
            onChange={setHighContrast}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm font-semibold text-text-primary">
              Reset progress
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Clears saved statistics, achievements, and puzzle progress on this
              device.
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
  embedded = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  embedded?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const inputId = `settings-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl p-3",
        !embedded && "border border-bg-card/80 bg-bg-card/40",
      )}
    >
      <label htmlFor={inputId} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-semibold text-text-primary">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
          {description}
        </span>
      </label>
      <Switch
        id={inputId}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}

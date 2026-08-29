import { useSettingsStore } from "@/state/settings-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { useAchievementStore } from "@/state/achievement-store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { Slider } from "@/ui/slider";

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Game preferences for audio and accessibility.
 */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const musicEnabled = useSettingsStore((state) => state.musicEnabled);
  const sfxEnabled = useSettingsStore((state) => state.sfxEnabled);
  const muted = useSettingsStore((state) => state.muted);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setMusicEnabled = useSettingsStore((state) => state.setMusicEnabled);
  const setSfxEnabled = useSettingsStore((state) => state.setSfxEnabled);
  const setMuted = useSettingsStore((state) => state.setMuted);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setSfxVolume = useSettingsStore((state) => state.setSfxVolume);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);
  const resetStatistics = useStatisticsStore((state) => state.resetStatistics);
  const resetAchievements = useAchievementStore(
    (state) => state.resetAchievements,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Settings"
      description="Audio and accessibility preferences are saved on this device."
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
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
        <ToggleRow
          label="Reduced motion"
          description="Minimize animations for accessibility."
          checked={reducedMotion}
          onChange={setReducedMotion}
        />
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-semibold text-text-primary">Reset progress</p>
          <p className="mt-1 text-xs text-text-muted">
            Clears saved statistics and achievements on this device.
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={() => {
              resetStatistics();
              resetAchievements();
            }}
          >
            Reset progress
          </Button>
        </div>
      </div>
    </Dialog>
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

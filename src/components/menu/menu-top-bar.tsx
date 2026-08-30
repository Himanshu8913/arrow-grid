import { playSfx } from "@/audio";
import { getAppName } from "@/constants/app";
import { useProfileStore } from "@/state/profile-store";
import { SettingsIcon } from "@/ui/icons";

export interface MenuTopBarProps {
  onOpenSettings: () => void;
}

export function MenuTopBar({ onOpenSettings }: MenuTopBarProps) {
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const appName = getAppName();

  return (
    <header className="menu-dashboard__topbar">
      <div className="menu-dashboard__brand">
        <span className="menu-dashboard__brand-mark" aria-hidden="true">
          A
        </span>
        <span className="menu-dashboard__brand-name">{appName.toUpperCase()}</span>
      </div>

      <div className="menu-dashboard__topbar-actions">
        <span className="menu-dashboard__coin-pill tabular-nums">
          <span aria-hidden="true">🪙</span>
          {totalCoins} Coins
        </span>
        <button
          type="button"
          className="menu-dashboard__icon-btn"
          aria-label="Settings"
          onClick={() => {
            playSfx("click");
            onOpenSettings();
          }}
          onMouseEnter={() => playSfx("hover")}
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
}

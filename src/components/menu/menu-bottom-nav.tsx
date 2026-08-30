import { playSfx } from "@/audio";
import {
  BarChartIcon,
  HomeIcon,
  PencilIcon,
  SparklesIcon,
  TrophyIcon,
} from "@/ui/icons";

export interface MenuBottomNavProps {
  onOpenStatistics: () => void;
  onOpenAchievements: () => void;
  onOpenCosmetics: () => void;
  onOpenEditor: () => void;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "stats", label: "Stats", Icon: BarChartIcon },
  { id: "awards", label: "Awards", Icon: TrophyIcon },
  { id: "style", label: "Style", Icon: SparklesIcon },
  { id: "create", label: "Create", Icon: PencilIcon },
] as const;

export function MenuBottomNav({
  onOpenStatistics,
  onOpenAchievements,
  onOpenCosmetics,
  onOpenEditor,
}: MenuBottomNavProps) {
  const handlers = {
    stats: onOpenStatistics,
    awards: onOpenAchievements,
    style: onOpenCosmetics,
    create: onOpenEditor,
  } as const;

  return (
    <nav className="menu-dashboard__bottom-nav" aria-label="Main navigation">
      <div className="menu-dashboard__bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          const isActive = item.id === "home";

          return (
            <button
              key={item.id}
              type="button"
              className={
                isActive
                  ? "menu-dashboard__nav-item menu-dashboard__nav-item--active"
                  : "menu-dashboard__nav-item"
              }
              onClick={() => {
                if (isActive) {
                  return;
                }

                playSfx("click");
                handlers[item.id as keyof typeof handlers]();
              }}
              onMouseEnter={() => {
                if (!isActive) {
                  playSfx("hover");
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

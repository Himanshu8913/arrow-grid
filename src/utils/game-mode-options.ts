import type { SelectionOption } from "@/ui/selection-picker";

export const GAME_MODE_OPTIONS: SelectionOption[] = [
  {
    value: "practice",
    label: "Practice vs AI",
    description: "Solo match against the computer at your chosen difficulty.",
    badge: "Solo",
    badgeVariant: "success",
    icon: "🤖",
  },
  {
    value: "puzzle",
    label: "Puzzle Mode",
    description: "Solve handcrafted, random, mechanic, and community puzzles.",
    badge: "Puzzle",
    badgeVariant: "primary",
    icon: "🧩",
  },
  {
    value: "pvp",
    label: "Player vs Player",
    description: "Two players take turns on the same device.",
    badge: "Local",
    badgeVariant: "secondary",
    icon: "👥",
  },
];

export function getGameModeOption(value: string): SelectionOption {
  return (
    GAME_MODE_OPTIONS.find((option) => option.value === value) ?? GAME_MODE_OPTIONS[0]
  );
}

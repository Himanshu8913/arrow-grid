import type { AchievementDefinition } from "@/types/achievement";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-win",
    title: "First Win",
    description: "Win your first match.",
    icon: "🏆",
  },
  {
    id: "puzzle-solver",
    title: "Puzzle Solver",
    description: "Complete your first puzzle.",
    icon: "🧩",
  },
  {
    id: "perfect-puzzle",
    title: "Perfect Puzzle",
    description: "Earn 3 stars without using hints.",
    icon: "⭐",
  },
  {
    id: "no-loops",
    title: "No Loops",
    description: "Win a match without triggering any loops.",
    icon: "🎯",
  },
  {
    id: "streak-10",
    title: "10 Win Streak",
    description: "Reach a 10 win streak.",
    icon: "🔥",
  },
  {
    id: "daily-challenge-winner",
    title: "Daily Challenge Winner",
    description: "Complete today's daily challenge.",
    icon: "📅",
  },
  {
    id: "century-club",
    title: "100 Games",
    description: "Play 100 games.",
    icon: "💯",
  },
];

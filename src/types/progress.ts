import type { AiDifficulty } from "@/constants/ai";
import type { MatchFormat } from "@/constants/match-format";
import { DEFAULT_MATCH_FORMAT } from "@/constants/match-format";
import { SAVE_VERSION } from "@/constants/save";
import type { GameState } from "@/engine/game-state";
import type { PuzzleStarRating } from "@/types/puzzle";

export interface PuzzleProgressRecord {
  completed: boolean;
  bestStars: PuzzleStarRating | null;
}

export interface SavedMatch {
  game: GameState;
  savedAt: number;
}

export interface GameProgress {
  version: number;
  gameMode: string;
  aiDifficulty: AiDifficulty;
  matchFormat: MatchFormat;
  selectedPuzzleId: string;
  puzzleProgress: Record<string, PuzzleProgressRecord>;
  activeMatch: SavedMatch | null;
}

export function createInitialGameProgress(): GameProgress {
  return {
    version: SAVE_VERSION,
    gameMode: "pvp",
    aiDifficulty: "medium",
    matchFormat: DEFAULT_MATCH_FORMAT,
    selectedPuzzleId: "random",
    puzzleProgress: {},
    activeMatch: null,
  };
}

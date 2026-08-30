import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SAVE_KEYS, SAVE_VERSION } from "@/constants/save";
import {
  createCustomPuzzleId,
  draftToPuzzleDefinition,
  getAverageRating,
  puzzleDefinitionToDraft,
  validateCustomPuzzleDraft,
} from "@/engine/custom-puzzle";
import type {
  CommunityPuzzleSort,
  CustomPuzzleDraft,
  CustomPuzzleRecord,
} from "@/types/custom-puzzle";
import type { PuzzleDefinition } from "@/types/puzzle";

interface CustomPuzzleStore {
  puzzles: Record<string, CustomPuzzleRecord>;
  saveDraft: (draft: CustomPuzzleDraft, authorName: string, puzzleId?: string) => string;
  importPuzzle: (puzzle: PuzzleDefinition, authorName: string) => string;
  deletePuzzle: (puzzleId: string) => void;
  getPuzzle: (puzzleId: string) => CustomPuzzleRecord | undefined;
  listPuzzles: (sort?: CommunityPuzzleSort) => CustomPuzzleRecord[];
  ratePuzzle: (puzzleId: string, rating: number) => void;
  toggleBookmark: (puzzleId: string) => void;
  recordPlay: (puzzleId: string) => void;
  resetLibrary: () => void;
}

function sortRecords(
  records: CustomPuzzleRecord[],
  sort: CommunityPuzzleSort,
): CustomPuzzleRecord[] {
  const next = [...records];

  switch (sort) {
    case "rating":
      return next.sort(
        (left, right) => getAverageRating(right) - getAverageRating(left),
      );
    case "plays":
      return next.sort(
        (left, right) => right.meta.playCount - left.meta.playCount,
      );
    case "bookmarked":
      return next.sort((left, right) => {
        if (left.meta.bookmarked === right.meta.bookmarked) {
          return right.meta.updatedAt - left.meta.updatedAt;
        }

        return left.meta.bookmarked ? -1 : 1;
      });
    case "newest":
    default:
      return next.sort(
        (left, right) => right.meta.updatedAt - left.meta.updatedAt,
      );
  }
}

export const useCustomPuzzleStore = create<CustomPuzzleStore>()(
  persist(
    (set, get) => ({
      puzzles: {},
      saveDraft: (draft, authorName, puzzleId) => {
        const errors = validateCustomPuzzleDraft(draft);

        if (errors.length > 0) {
          throw new Error(errors[0]);
        }

        const id = puzzleId ?? createCustomPuzzleId();
        const now = Date.now();
        const existing = get().puzzles[id];
        const puzzle = draftToPuzzleDefinition(draft, id);

        set((state) => ({
          puzzles: {
            ...state.puzzles,
            [id]: {
              meta: {
                id,
                authorName: authorName.trim() || "Anonymous",
                createdAt: existing?.meta.createdAt ?? now,
                updatedAt: now,
                playCount: existing?.meta.playCount ?? 0,
                ratingSum: existing?.meta.ratingSum ?? 0,
                ratingCount: existing?.meta.ratingCount ?? 0,
                bookmarked: existing?.meta.bookmarked ?? false,
              },
              puzzle,
            },
          },
        }));

        return id;
      },
      importPuzzle: (puzzle, authorName) => {
        const draft = puzzleDefinitionToDraft({
          ...puzzle,
          id: createCustomPuzzleId(),
        });

        return get().saveDraft(draft, authorName);
      },
      deletePuzzle: (puzzleId) =>
        set((state) => {
          const next = { ...state.puzzles };
          delete next[puzzleId];
          return { puzzles: next };
        }),
      getPuzzle: (puzzleId) => get().puzzles[puzzleId],
      listPuzzles: (sort = "newest") =>
        sortRecords(Object.values(get().puzzles), sort),
      ratePuzzle: (puzzleId, rating) => {
        const clamped = Math.max(1, Math.min(5, Math.round(rating)));

        set((state) => {
          const record = state.puzzles[puzzleId];

          if (!record) {
            return state;
          }

          return {
            puzzles: {
              ...state.puzzles,
              [puzzleId]: {
                ...record,
                meta: {
                  ...record.meta,
                  ratingSum: record.meta.ratingSum + clamped,
                  ratingCount: record.meta.ratingCount + 1,
                  updatedAt: Date.now(),
                },
              },
            },
          };
        });
      },
      toggleBookmark: (puzzleId) =>
        set((state) => {
          const record = state.puzzles[puzzleId];

          if (!record) {
            return state;
          }

          return {
            puzzles: {
              ...state.puzzles,
              [puzzleId]: {
                ...record,
                meta: {
                  ...record.meta,
                  bookmarked: !record.meta.bookmarked,
                  updatedAt: Date.now(),
                },
              },
            },
          };
        }),
      recordPlay: (puzzleId) =>
        set((state) => {
          const record = state.puzzles[puzzleId];

          if (!record) {
            return state;
          }

          return {
            puzzles: {
              ...state.puzzles,
              [puzzleId]: {
                ...record,
                meta: {
                  ...record.meta,
                  playCount: record.meta.playCount + 1,
                },
              },
            },
          };
        }),
      resetLibrary: () => set({ puzzles: {} }),
    }),
    {
      name: SAVE_KEYS.customPuzzles,
      version: SAVE_VERSION,
    },
  ),
);

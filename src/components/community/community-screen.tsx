import { useMemo, useState } from "react";

import { MenuBackground } from "@/components/menu/menu-background";
import {
  decodePuzzleShareCode,
  encodePuzzleShareCode,
  getAverageRating,
} from "@/engine/custom-puzzle";
import { useToast } from "@/hooks/use-toast";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { useGameStore } from "@/state/game-store";
import { useProfileStore } from "@/state/profile-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import type { CommunityPuzzleSort } from "@/types/custom-puzzle";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { Button } from "@/ui/button";
import { Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";

const SORT_OPTIONS: Array<{ value: CommunityPuzzleSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "plays", label: "Most Played" },
  { value: "bookmarked", label: "Bookmarked" },
];

export interface CommunityScreenProps {
  onBack: () => void;
  onEditPuzzle: (puzzleId: string) => void;
  onPlay: () => void;
}

/**
 * Browse, rate, bookmark, and import locally saved community puzzles.
 */
export function CommunityScreen({
  onBack,
  onEditPuzzle,
  onPlay,
}: CommunityScreenProps) {
  const puzzles = useCustomPuzzleStore((state) => state.puzzles);
  const importPuzzle = useCustomPuzzleStore((state) => state.importPuzzle);
  const deletePuzzle = useCustomPuzzleStore((state) => state.deletePuzzle);
  const ratePuzzle = useCustomPuzzleStore((state) => state.ratePuzzle);
  const toggleBookmark = useCustomPuzzleStore((state) => state.toggleBookmark);
  const recordPlay = useCustomPuzzleStore((state) => state.recordPlay);
  const authorName = useProfileStore((state) => state.displayName);
  const { toast } = useToast();

  const [sort, setSort] = useState<CommunityPuzzleSort>("newest");
  const [importCode, setImportCode] = useState("");

  const records = useMemo(
    () => useCustomPuzzleStore.getState().listPuzzles(sort),
    [puzzles, sort],
  );

  const handleImport = () => {
    try {
      const puzzle = decodePuzzleShareCode(importCode);
      const puzzleId = importPuzzle(puzzle, authorName);
      setImportCode("");
      toast({
        title: "Puzzle imported",
        description: puzzle.title,
        variant: "success",
      });
      onEditPuzzle(puzzleId);
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "Invalid share code.",
        variant: "danger",
      });
    }
  };

  const handlePlay = (puzzleId: string) => {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    if (!record) {
      return;
    }

    recordPlay(puzzleId);
    const game = createGameFromPuzzle(record.puzzle);
    useGameStore.getState().setGameMode("puzzle");
    usePuzzleSessionStore.getState().setSelectedPuzzleId(puzzleId);
    useGameStore.getState().setGame(game, { persist: false });
    useGameStore.getState().setMatchSessionActive(true);
    onPlay();
  };

  const handleShare = async (puzzleId: string) => {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    if (!record) {
      return;
    }

    const code = encodePuzzleShareCode(record.puzzle);

    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Share code copied",
        description: "Send it to friends so they can import your puzzle.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: code.slice(0, 48) + "...",
        variant: "warning",
      });
    }
  };

  return (
    <div className="relative min-h-dvh overflow-y-auto p-4 sm:p-6">
      <MenuBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-text-primary">Community Puzzles</h1>
          <div className="w-16" />
        </div>

        <div className="rounded-3xl border border-bg-card/60 bg-bg-surface/90 p-4 shadow-[var(--shadow-strong)] backdrop-blur-sm sm:p-5">
          <h2 className="text-sm font-semibold text-text-primary">Import Share Code</h2>
          <p className="mt-1 text-xs text-text-muted">
            Paste a puzzle code from another player to add it to your library.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              label="Share code"
              value={importCode}
              onChange={(event) => setImportCode(event.target.value)}
              placeholder="agpuz1:..."
              wrapperClassName="flex-1"
            />
            <Button type="button" className="self-end" onClick={handleImport}>
              Import
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-bg-card/60 bg-bg-surface/90 p-4 shadow-[var(--shadow-strong)] backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-primary">Your Library</h2>
            <Dropdown
              label="Sort"
              value={sort}
              onValueChange={(value) => setSort(value as CommunityPuzzleSort)}
              options={SORT_OPTIONS}
            />
          </div>

          {records.length === 0 ? (
            <p className="text-sm text-text-muted">
              No community puzzles yet. Create one in the Puzzle Editor.
            </p>
          ) : (
            <ul className="space-y-3">
              {records.map((record) => {
                const averageRating = getAverageRating(record);

                return (
                  <li
                    key={record.meta.id}
                    className="rounded-2xl border border-bg-card/70 bg-bg-card/40 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {record.puzzle.title}
                        </h3>
                        <p className="mt-1 text-xs text-text-muted">
                          {record.puzzle.description}
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                          by {record.meta.authorName} · {record.meta.playCount} plays
                          {averageRating > 0
                            ? ` · ${averageRating.toFixed(1)}★ (${record.meta.ratingCount})`
                            : ""}
                        </p>
                      </div>
                      {record.meta.bookmarked ? (
                        <Badge variant="warning">Bookmarked</Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handlePlay(record.meta.id)}
                      >
                        Play
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => onEditPuzzle(record.meta.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShare(record.meta.id)}
                      >
                        Share
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleBookmark(record.meta.id)}
                      >
                        {record.meta.bookmarked ? "Unbookmark" : "Bookmark"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => ratePuzzle(record.meta.id, 5)}
                      >
                        Rate ★
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => deletePuzzle(record.meta.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import { forwardRef, useEffect, useImperativeHandle } from "react";

import { BoardGrid } from "@/components/board";
import { getAppVersion } from "@/constants/app";
import { PUZZLE_MODE_OPTIONS } from "@/data/puzzles";
import { GameStatusAnnouncer } from "@/components/game/game-status-announcer";
import { AiThinkingIndicator } from "@/components/game/ai-thinking-indicator";
import { DailyChallengeHud } from "@/components/game/daily-challenge-hud";
import { ResultScreen } from "@/components/game/result-screen";
import { PuzzleControls } from "@/components/game/puzzle-controls";
import { PuzzleHud } from "@/components/game/puzzle-hud";
import { ScoreHud } from "@/components/game/score-hud";
import { TurnIndicator } from "@/components/game/turn-indicator";
import { AI_DIFFICULTY_OPTIONS } from "@/constants/ai";
import { useGameplay } from "@/hooks/use-gameplay";
import { refreshLobbyPreview } from "@/save";
import { useGameStore } from "@/state/game-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { isPracticeMode, isPuzzleMode } from "@/utils/game-messages";
import { Badge } from "@/ui/badge";
import { Dropdown } from "@/ui/dropdown";
import { LoaderOverlay } from "@/ui/loader";

export interface PlayPanelProps {
  onStartingChange?: (isStarting: boolean) => void;
  onReturnToMenu?: () => void;
}

export interface PlayPanelHandle {
  startGame: () => void;
}

/**
 * Interactive play surface with board rendering and turn loop.
 */
export const PlayPanel = forwardRef<PlayPanelHandle, PlayPanelProps>(
  function PlayPanel({ onStartingChange, onReturnToMenu }, ref) {
    const gameMode = useGameStore((state) => state.gameMode);
    const aiDifficulty = useGameStore((state) => state.aiDifficulty);
    const setGameMode = useGameStore((state) => state.setGameMode);
    const setAiDifficulty = useGameStore((state) => state.setAiDifficulty);
    const selectedPuzzleId = usePuzzleSessionStore(
      (state) => state.selectedPuzzleId,
    );
    const setSelectedPuzzleId = usePuzzleSessionStore(
      (state) => state.setSelectedPuzzleId,
    );

    const {
      game,
      isStartingGame,
      isInputLocked,
      matchSessionActive,
      isAiThinking,
      isPuzzleMode: isPuzzle,
      isDailyChallengeMode: isDaily,
      hintsUsed,
      hintPosition,
      earnedStars,
      displayBoard,
      displayOrbPosition,
      displayOrbs,
      selectedPosition,
      rotatingPosition,
      goalCelebration,
      loopTiles,
      activePulsePosition,
      isLoopAnimating,
      isOrbSpawning,
      isOrbFailure,
      orbSpawnKey,
      trailPositions,
      isAnimating,
      canUndoPuzzle,
      matchResultSummary,
      clearMatchResult,
      startGame,
      handleTileClick,
      restartPuzzle,
      undoPuzzle,
      requestHint,
    } = useGameplay({ onStartingChange });

    useImperativeHandle(ref, () => ({ startGame }), [startGame]);

    const isModeLocked = matchSessionActive || isStartingGame;

    useEffect(() => {
      if (!isPuzzle || isDaily || matchResultSummary) {
        return;
      }

      const handleShortcut = (event: KeyboardEvent) => {
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }

        if (event.key === "r" || event.key === "R") {
          if (isInputLocked) {
            return;
          }
          event.preventDefault();
          restartPuzzle();
          return;
        }

        if (event.key === "u" || event.key === "U") {
          if (!canUndoPuzzle) {
            return;
          }
          event.preventDefault();
          undoPuzzle();
          return;
        }

        if (event.key === "h" || event.key === "H") {
          if (game.status !== "in-progress" || isInputLocked) {
            return;
          }
          event.preventDefault();
          requestHint();
        }
      };

      window.addEventListener("keydown", handleShortcut);
      return () => window.removeEventListener("keydown", handleShortcut);
    }, [
      canUndoPuzzle,
      game.status,
      isDaily,
      isInputLocked,
      isPuzzle,
      matchResultSummary,
      requestHint,
      restartPuzzle,
      undoPuzzle,
    ]);

    return (
      <div className="relative space-y-4 text-center">
        {isStartingGame ? <LoaderOverlay label="Starting game..." /> : null}

        {!matchSessionActive && !isStartingGame ? (
          <p className="rounded-2xl border border-accent-primary/30 bg-accent-primary/10 px-4 py-2 text-sm text-accent-primary">
            Choose your mode, then press Play to deal a fresh board.
          </p>
        ) : null}

        {isDaily ? (
          <DailyChallengeHud game={game} earnedStars={earnedStars} />
        ) : isPuzzle ? (
          <PuzzleHud game={game} hintsUsed={hintsUsed} earnedStars={earnedStars} />
        ) : (
          <ScoreHud game={game} />
        )}

        {!isPuzzle && !isDaily ? (
          <TurnIndicator
            game={game}
            gameMode={gameMode}
            isAiThinking={isAiThinking}
          />
        ) : null}

        <GameStatusAnnouncer
          game={game}
          gameMode={gameMode}
          isAiThinking={isAiThinking}
          isInputLocked={isInputLocked}
        />

        <AiThinkingIndicator visible={isAiThinking} />

        <BoardGrid
          board={displayBoard}
          spawn={game.spawn}
          orbPosition={displayOrbPosition}
          orbs={displayOrbs}
          pathPositions={isAnimating || isLoopAnimating ? [] : game.lastOrbPath}
          trailPositions={trailPositions}
          selectedPosition={selectedPosition}
          rotatingPosition={rotatingPosition}
          hintPosition={hintPosition}
          goalCelebration={goalCelebration}
          loopTiles={loopTiles}
          activeLoopPulsePosition={activePulsePosition}
          isLoopDetectionActive={isLoopAnimating}
          isBoardCelebrating={goalCelebration !== null}
          isBoardVibrating={isLoopAnimating}
          isOrbSpawning={isOrbSpawning}
          isOrbFailure={isOrbFailure}
          orbSpawnKey={orbSpawnKey}
          disabled={isInputLocked}
          onTileClick={handleTileClick}
        />

        {matchResultSummary ? (
          <ResultScreen
            gameMode={gameMode}
            summary={matchResultSummary}
            onPlayAgain={() => {
              clearMatchResult();
              if (isDaily) {
                return;
              }
              if (isPuzzle) {
                startGame();
                return;
              }
              startGame();
            }}
            onMainMenu={() => {
              clearMatchResult();
              onReturnToMenu?.();
            }}
          />
        ) : null}

        {isPuzzle && !isDaily ? (
          <PuzzleControls
            canUndo={canUndoPuzzle}
            canHint={game.status === "in-progress" && !isInputLocked}
            onRestart={restartPuzzle}
            onUndo={undoPuzzle}
            onHint={requestHint}
          />
        ) : null}

        {isPuzzle && !isDaily ? (
          <p className="text-xs text-text-muted">
            Keyboard: R restart, U undo, H hint. Board: arrow keys to move, Enter
            to rotate.
          </p>
        ) : (
          <p className="text-xs text-text-muted">
            Keyboard: Tab to the board, arrow keys to move, Enter or Space to
            rotate.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Strategy</Badge>
          <Badge variant={isDaily ? "warning" : isPracticeMode(gameMode) ? "success" : "secondary"}>
            {isDaily
              ? "Daily"
              : isPuzzleMode(gameMode)
                ? "Puzzle"
                : isPracticeMode(gameMode)
                  ? "Vs AI"
                  : "PvP"}
          </Badge>
          <Badge variant="secondary">v{getAppVersion()}</Badge>
        </div>

        {!isDaily ? (
          <Dropdown
            className="mx-auto max-w-xs"
            label="Game Mode"
            value={gameMode}
            disabled={isModeLocked}
            onValueChange={(value) => {
              setGameMode(value);
              if (!matchSessionActive) {
                refreshLobbyPreview();
              }
            }}
            options={[
              { value: "pvp", label: "Player vs Player" },
              { value: "practice", label: "Practice vs AI" },
              { value: "puzzle", label: "Puzzle Mode" },
            ]}
          />
        ) : null}

        {isPuzzle && !isDaily ? (
          <Dropdown
            className="mx-auto max-w-xs"
            label="Puzzle"
            value={selectedPuzzleId}
            disabled={isModeLocked}
            onValueChange={(value) => {
              setSelectedPuzzleId(value);
              if (!matchSessionActive) {
                refreshLobbyPreview();
              }
            }}
            options={PUZZLE_MODE_OPTIONS}
          />
        ) : null}

        {isPracticeMode(gameMode) ? (
          <Dropdown
            className="mx-auto max-w-xs"
            label="AI Difficulty"
            value={aiDifficulty}
            disabled={isModeLocked}
            onValueChange={(value) => setAiDifficulty(value as typeof aiDifficulty)}
            options={AI_DIFFICULTY_OPTIONS}
          />
        ) : null}
      </div>
    );
  },
);

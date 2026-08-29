import { forwardRef, useImperativeHandle } from "react";

import { BoardGrid } from "@/components/board";
import { PUZZLE_CATALOG } from "@/data/puzzles";
import { AiThinkingIndicator } from "@/components/game/ai-thinking-indicator";
import { MatchResultBanner } from "@/components/game/match-result-banner";
import { PuzzleControls } from "@/components/game/puzzle-controls";
import { PuzzleHud } from "@/components/game/puzzle-hud";
import { PuzzleResultBanner } from "@/components/game/puzzle-result-banner";
import { ScoreHud } from "@/components/game/score-hud";
import { TurnIndicator } from "@/components/game/turn-indicator";
import { AI_DIFFICULTY_OPTIONS } from "@/constants/ai";
import { useGameplay } from "@/hooks/use-gameplay";
import { useGameStore } from "@/state/game-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { isPracticeMode, isPuzzleMode } from "@/utils/game-messages";
import { Badge } from "@/ui/badge";
import { Dropdown } from "@/ui/dropdown";
import { LoaderOverlay } from "@/ui/loader";

export interface PlayPanelProps {
  onStartingChange?: (isStarting: boolean) => void;
}

export interface PlayPanelHandle {
  startGame: () => void;
}

/**
 * Interactive play surface with board rendering and turn loop.
 */
export const PlayPanel = forwardRef<PlayPanelHandle, PlayPanelProps>(
  function PlayPanel({ onStartingChange }, ref) {
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
      isAiThinking,
      isPuzzleMode: isPuzzle,
      hintsUsed,
      hintPosition,
      earnedStars,
      displayBoard,
      displayOrbPosition,
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
      startGame,
      handleTileClick,
      restartPuzzle,
      undoPuzzle,
      requestHint,
    } = useGameplay({ onStartingChange });

    useImperativeHandle(ref, () => ({ startGame }), [startGame]);

    return (
      <div className="relative space-y-4 text-center">
        {isStartingGame ? <LoaderOverlay label="Starting game..." /> : null}

        {isPuzzle ? (
          <PuzzleHud game={game} hintsUsed={hintsUsed} earnedStars={earnedStars} />
        ) : (
          <ScoreHud game={game} />
        )}

        {!isPuzzle ? (
          <TurnIndicator
            game={game}
            gameMode={gameMode}
            isAiThinking={isAiThinking}
          />
        ) : null}

        <AiThinkingIndicator visible={isAiThinking} />

        {isPuzzle && game.status === "won" ? (
          <PuzzleResultBanner status="won" stars={earnedStars} />
        ) : null}
        {isPuzzle && game.status === "lost" ? (
          <PuzzleResultBanner status="lost" stars={null} />
        ) : null}
        {!isPuzzle ? <MatchResultBanner game={game} /> : null}

        <BoardGrid
          board={displayBoard}
          spawn={game.spawn}
          orbPosition={displayOrbPosition}
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

        {isPuzzle ? (
          <PuzzleControls
            canUndo={canUndoPuzzle}
            canHint={game.status === "in-progress" && !isInputLocked}
            onRestart={restartPuzzle}
            onUndo={undoPuzzle}
            onHint={requestHint}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Strategy</Badge>
          <Badge variant={isPracticeMode(gameMode) ? "success" : "secondary"}>
            {isPuzzleMode(gameMode)
              ? "Puzzle"
              : isPracticeMode(gameMode)
                ? "Vs AI"
                : "PvP"}
          </Badge>
          <Badge variant="success">Alpha</Badge>
        </div>

        <Dropdown
          className="mx-auto max-w-xs"
          label="Game Mode"
          value={gameMode}
          onValueChange={setGameMode}
          options={[
            { value: "pvp", label: "Player vs Player" },
            { value: "practice", label: "Practice vs AI" },
            { value: "puzzle", label: "Puzzle Mode" },
          ]}
        />

        {isPuzzle ? (
          <Dropdown
            className="mx-auto max-w-xs"
            label="Puzzle"
            value={selectedPuzzleId}
            onValueChange={setSelectedPuzzleId}
            options={PUZZLE_CATALOG.map((puzzle) => ({
              value: puzzle.id,
              label: puzzle.title,
            }))}
          />
        ) : null}

        {isPracticeMode(gameMode) ? (
          <Dropdown
            className="mx-auto max-w-xs"
            label="AI Difficulty"
            value={aiDifficulty}
            onValueChange={(value) => setAiDifficulty(value as typeof aiDifficulty)}
            options={AI_DIFFICULTY_OPTIONS}
          />
        ) : null}
      </div>
    );
  },
);

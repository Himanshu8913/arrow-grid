import { forwardRef, useImperativeHandle } from "react";

import { BoardGrid } from "@/components/board";
import { AiThinkingIndicator } from "@/components/game/ai-thinking-indicator";
import { MatchResultBanner } from "@/components/game/match-result-banner";
import { ScoreHud } from "@/components/game/score-hud";
import { TurnIndicator } from "@/components/game/turn-indicator";
import { AI_DIFFICULTY_OPTIONS } from "@/constants/ai";
import { useGameplay } from "@/hooks/use-gameplay";
import { useGameStore } from "@/state/game-store";
import { isPracticeMode } from "@/utils/game-messages";
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

    const {
      game,
      isStartingGame,
      isInputLocked,
      isAiThinking,
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
      startGame,
      handleTileClick,
    } = useGameplay({ onStartingChange });

    useImperativeHandle(ref, () => ({ startGame }), [startGame]);

    return (
      <div className="relative space-y-4 text-center">
        {isStartingGame ? <LoaderOverlay label="Starting game..." /> : null}

        <ScoreHud game={game} />
        <TurnIndicator game={game} gameMode={gameMode} isAiThinking={isAiThinking} />
        <AiThinkingIndicator visible={isAiThinking} />
        <MatchResultBanner game={game} />

        <BoardGrid
          board={displayBoard}
          spawn={game.spawn}
          orbPosition={displayOrbPosition}
          pathPositions={isAnimating || isLoopAnimating ? [] : game.lastOrbPath}
          trailPositions={trailPositions}
          selectedPosition={selectedPosition}
          rotatingPosition={rotatingPosition}
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

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Strategy</Badge>
          <Badge variant={isPracticeMode(gameMode) ? "success" : "secondary"}>
            {isPracticeMode(gameMode) ? "Vs AI" : "PvP"}
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

import { forwardRef, useImperativeHandle } from "react";

import { BoardGrid } from "@/components/board";
import { MatchResultBanner } from "@/components/game/match-result-banner";
import { ScoreHud } from "@/components/game/score-hud";
import { TurnIndicator } from "@/components/game/turn-indicator";
import { useGameplay } from "@/hooks/use-gameplay";
import { useGameStore } from "@/state/game-store";
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
    const setGameMode = useGameStore((state) => state.setGameMode);

    const {
      game,
      isStartingGame,
      isInputLocked,
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
        <TurnIndicator game={game} />
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
          <Badge variant="secondary">PvP</Badge>
          <Badge variant="success">Alpha</Badge>
        </div>

        <Dropdown
          className="mx-auto max-w-xs"
          label="Game Mode"
          value={gameMode}
          onValueChange={setGameMode}
          options={[
            { value: "pvp", label: "Player vs Player" },
            { value: "puzzle", label: "Puzzle Mode" },
            { value: "practice", label: "Practice" },
          ]}
        />
      </div>
    );
  },
);

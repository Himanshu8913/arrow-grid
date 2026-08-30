import { formatMatchPointsProgress } from "@/constants/match-format";
import type { GameState } from "@/engine/game-state";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { getPlayerLabel, isPracticeMode } from "@/utils/game-messages";
import { cn } from "@/utils/cn";

export interface ScoreHudProps {
  game: GameState;
  gameMode: string;
}

/**
 * Match score header with animated counters and active-player highlight in PvP.
 */
export function ScoreHud({ game, gameMode }: ScoreHudProps) {
  const practiceMode = isPracticeMode(gameMode);
  const playerOneScore = useAnimatedNumber(game.players.player1.totalScore);
  const playerOnePoints = useAnimatedNumber(game.players.player1.matchPoints);
  const playerTwoScore = useAnimatedNumber(game.players.player2.totalScore);
  const playerTwoPoints = useAnimatedNumber(game.players.player2.matchPoints);

  if (game.playerCount === 1) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg-card px-4 py-2 text-sm">
        <span className="text-text-muted">Turn {game.turnNumber}</span>
        <span className="font-semibold text-text-primary tabular-nums">
          Score {playerOneScore}
        </span>
        <span className="text-text-muted tabular-nums">
          Points {playerOnePoints}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <PlayerScoreCard
        label={getPlayerLabel("player1", gameMode)}
        score={playerOneScore}
        points={playerOnePoints}
        pointsTarget={game.winningScore}
        isActive={game.currentPlayer === "player1" && game.status === "in-progress"}
        activeTurnLabel="Your turn"
        tone="primary"
      />
      <PlayerScoreCard
        label={getPlayerLabel("player2", gameMode)}
        score={playerTwoScore}
        points={playerTwoPoints}
        pointsTarget={game.winningScore}
        isActive={game.currentPlayer === "player2" && game.status === "in-progress"}
        activeTurnLabel={practiceMode ? "AI turn" : "Your turn"}
        tone="secondary"
      />
    </div>
  );
}

interface PlayerScoreCardProps {
  label: string;
  score: number;
  points: number;
  pointsTarget: number;
  isActive: boolean;
  activeTurnLabel: string;
  tone: "primary" | "secondary";
}

function PlayerScoreCard({
  label,
  score,
  points,
  pointsTarget,
  isActive,
  activeTurnLabel,
  tone,
}: PlayerScoreCardProps) {
  const toneStyles = {
    primary: {
      active: "border-accent-primary/60 bg-accent-primary/10 ring-1 ring-accent-primary/30",
      text: "text-accent-primary",
    },
    secondary: {
      active:
        "border-accent-secondary/60 bg-accent-secondary/10 ring-1 ring-accent-secondary/30",
      text: "text-accent-secondary",
    },
  } satisfies Record<
    PlayerScoreCardProps["tone"],
    { active: string; text: string }
  >;

  return (
    <div
      className={cn(
        "rounded-2xl border border-bg-card bg-bg-card px-4 py-3 text-left text-sm transition-all duration-200",
        isActive && toneStyles[tone].active,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-semibold",
            isActive ? toneStyles[tone].text : "text-text-muted",
          )}
        >
          {label}
        </span>
        {isActive ? (
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {activeTurnLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 tabular-nums">
        <span className="text-text-muted">Score {score}</span>
        <span className="font-semibold text-text-primary">
          Rounds {formatMatchPointsProgress(points, pointsTarget)}
        </span>
      </div>
    </div>
  );
}

import { useStatisticsStore } from "@/state/statistics-store";
import { getAverageMoves } from "@/types/statistics";
import { Button } from "@/ui/button";

/**
 * Displays persisted player statistics on the profile tab.
 */
export function StatisticsPanel() {
  const stats = useStatisticsStore((state) => state.stats);
  const resetStatistics = useStatisticsStore((state) => state.resetStatistics);
  const averageMoves = getAverageMoves(stats);

  return (
    <div className="space-y-3 rounded-2xl border border-bg-card bg-bg-card p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Statistics</p>
          <p className="text-xs text-text-muted">Saved on this device</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={resetStatistics}>
          Reset
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <StatItem label="Games" value={stats.gamesPlayed} />
        <StatItem label="Wins" value={stats.wins} />
        <StatItem label="Losses" value={stats.losses} />
        <StatItem label="Puzzles" value={stats.puzzlesCompleted} />
        <StatItem label="Best score" value={stats.bestScore} />
        <StatItem label="Avg moves" value={averageMoves} />
        <StatItem
          label="Fastest win"
          value={stats.fastestWinMoves ?? "—"}
        />
        <StatItem label="Best streak" value={stats.bestStreak} />
        <StatItem label="Current streak" value={stats.currentStreak} />
      </dl>
    </div>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-bg-surface/70 px-3 py-2">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums text-text-primary">
        {value}
      </dd>
    </div>
  );
}

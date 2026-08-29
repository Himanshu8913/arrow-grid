import { getPlayerLabel } from "@/utils/game-messages";
import { Loader } from "@/ui/loader";

export interface AiThinkingIndicatorProps {
  visible: boolean;
}

/**
 * Shown while the practice-mode AI is choosing a move.
 */
export function AiThinkingIndicator({ visible }: AiThinkingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl border border-accent-secondary/30 bg-accent-secondary/10 px-4 py-2 text-sm text-accent-secondary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Loader size="sm" />
      <span>{getPlayerLabel("player2")} is thinking...</span>
    </div>
  );
}

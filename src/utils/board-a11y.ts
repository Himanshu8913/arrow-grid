import type { PlayerId, Position, Tile } from "@/types/game";

const DIRECTION_LABELS = {
  up: "up",
  right: "right",
  down: "down",
  left: "left",
} as const;

const PLAYER_LABELS: Record<PlayerId, string> = {
  player1: "Player 1",
  player2: "Player 2",
};

export interface TileAriaState {
  isSpawn?: boolean;
  isSelected?: boolean;
  isHinted?: boolean;
  isOnPath?: boolean;
  isLoopTile?: boolean;
}

/**
 * Builds a descriptive label for screen readers and keyboard users.
 */
export function getTileAriaLabel(
  tile: Tile,
  position: Position,
  state: TileAriaState = {},
): string {
  const location = `Row ${position.row + 1}, column ${position.col + 1}`;
  const details: string[] = [];

  switch (tile.kind) {
    case "arrow":
      details.push(`Arrow pointing ${DIRECTION_LABELS[tile.direction]}`);
      break;
    case "wall":
      details.push("Wall");
      break;
    case "empty":
      details.push("Empty tile");
      break;
    case "goal":
      details.push(`${PLAYER_LABELS[tile.owner]} goal`);
      break;
    case "spawn":
      details.push("Spawn tile");
      break;
    case "teleporter":
      details.push(`Teleporter ${tile.portalId.toUpperCase()}`);
      break;
    case "ice":
      details.push(
        tile.direction
          ? `Ice tile with decoy arrow pointing ${DIRECTION_LABELS[tile.direction]}`
          : "Ice tile",
      );
      break;
    case "rotating-arrow":
      details.push(
        `Rotating arrow pointing ${DIRECTION_LABELS[tile.direction]}`,
      );
      break;
    case "locked-arrow":
      details.push(
        `Locked arrow pointing ${DIRECTION_LABELS[tile.direction]}`,
      );
      break;
    case "bomb":
      details.push("Bomb tile");
      break;
    case "key":
      details.push("Key tile");
      break;
    case "wind":
      details.push("Wind tile");
      break;
    case "magnet":
      details.push("Magnet tile");
      break;
  }

  if (state.isSpawn) {
    details.push("orb spawn point");
  }

  if (state.isSelected) {
    details.push("selected");
  }

  if (state.isHinted) {
    details.push("hinted");
  }

  if (state.isOnPath) {
    details.push("on orb path");
  }

  if (state.isLoopTile) {
    details.push("loop detected");
  }

  const description = details.join(", ");
  const rotateHint =
    tile.kind === "arrow" || tile.kind === "rotating-arrow"
      ? " Press Enter or Space to rotate."
      : "";
  return `${description}. ${location}.${rotateHint}`;
}

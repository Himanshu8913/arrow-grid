import type { Board } from "@/types/game";

/**
 * Creates a deep copy of a board so resets do not mutate the original layout.
 */
export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((tile) => {
      switch (tile.kind) {
        case "arrow":
          return { kind: "arrow", direction: tile.direction };
        case "goal":
          return { kind: "goal", owner: tile.owner };
        case "wall":
          return { kind: "wall" };
        case "empty":
          return { kind: "empty" };
        case "spawn":
          return { kind: "spawn" };
        case "teleporter":
          return {
            kind: "teleporter",
            portalId: tile.portalId,
            target: { ...tile.target },
          };
        case "ice":
          return tile.direction
            ? { kind: "ice", direction: tile.direction }
            : { kind: "ice" };
      }
    }),
  );
}

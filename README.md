# Arrow Grid

A deterministic strategy puzzle game built with React and TypeScript. Rotate arrows on the grid to guide the energy orb to your goal — plan ahead, because every move reshapes the path.

## Features

- **Player vs Player** — local two-player matches with scoring and match points
- **Practice vs AI** — solo play against adjustable AI difficulty
- **Puzzle Mode** — procedurally generated random puzzles plus two tutorial puzzles
- **Daily Challenge** — one shared puzzle per UTC day, one attempt only
- **Progression** — XP, coins, achievements, statistics, and player profile
- **Accessibility** — keyboard navigation, screen reader labels, colorblind mode, high contrast, reduced motion
- **Persistence** — game progress, settings, and profile saved to `localStorage`

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Zustand (state + persistence)
- Vitest (unit/integration tests)
- Playwright (E2E tests)

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- npm

### Install

```bash
npm install
```

### Environment (optional)

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_APP_NAME` | Display name in menus and UI |
| `VITE_APP_VERSION` | Version shown in credits and play screen |

### Development

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

## How to Play

1. From the main menu, choose **Play**, **Daily Challenge**, or **Continue** (resume a saved match).
2. On the play screen, pick a game mode and press **Play** to deal a board.
3. Click a tile (or focus it with the keyboard) and press **Enter** or **Space** to rotate its arrow clockwise.
4. After your move, the orb follows the arrows automatically.
5. Score goals by guiding the orb into your goal tile.

### Keyboard Shortcuts

| Context | Keys |
|---------|------|
| Board navigation | Arrow keys, Home, End |
| Rotate tile | Enter, Space |
| Puzzle mode | `R` restart, `U` undo, `H` hint |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit and integration tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run format` | Format code with Prettier |

For E2E tests, install browsers first:

```bash
npx playwright install
```

## Project Structure

```
src/
├── app/              # App shell and routing between menu/game
├── components/       # UI components (board, game, menu, profile, settings)
├── engine/           # Pure game logic (board, turns, scoring, AI, puzzles)
├── hooks/            # React hooks (gameplay loop, animations, a11y)
├── save/             # Save/load helpers
├── state/            # Zustand stores
├── styles/           # Global CSS and theme tokens
└── utils/            # Shared utilities

e2e/                  # Playwright end-to-end tests
```

The game engine in `src/engine/` is framework-agnostic and fully deterministic — same seed and moves always produce the same outcome.

## Testing

```bash
# Unit + integration
npm test

# E2E (requires Playwright browsers)
npm run test:e2e
```

## Architecture Notes

- **Play** opens a fresh lobby; **Continue** restores the saved in-progress match.
- Puzzle mode defaults to **Random Puzzle** — a new procedural board each time you play or restart.
- Daily challenge mode is separate from regular play and cannot be started from the Play lobby.
- Settings include audio, theme, animations, accessibility options, and a progress reset.

## License

Private project. All rights reserved.

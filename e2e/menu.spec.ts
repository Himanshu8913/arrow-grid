import { expect, test } from "@playwright/test";

import { openGameScreen, startCurrentMatch } from "./helpers";

test("main menu loads and opens the game screen", async ({ page }) => {
  await openGameScreen(page);
  await startCurrentMatch(page);
  await expect(page.getByRole("grid", { name: "Game board" })).toBeVisible();
});

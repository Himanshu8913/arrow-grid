import { expect, test } from "@playwright/test";

import { openPuzzleMode } from "./helpers";

test("puzzle mode exposes controls and can be restarted", async ({ page }) => {
  await openPuzzleMode(page, "First Steps");

  await expect(page.getByRole("button", { name: "Restart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hint" })).toBeVisible();

  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.getByText("Game ready")).toBeVisible({ timeout: 5000 });
});

test("player can win the first-steps puzzle", async ({ page }) => {
  await openPuzzleMode(page, "First Steps");

  const winningTile = page.getByRole("gridcell", {
    name: "Arrow pointing right. Row 3, column 3. Press Enter or Space to rotate.",
  });
  await winningTile.evaluate((element) => {
    element.click();
  });

  await expect(page.getByText(/Moves [1-9] \/ 6/)).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByText(/Perfect puzzle!|Puzzle complete!/)).toBeVisible({
    timeout: 20000,
  });
});

test("player can lose a puzzle by exhausting moves", async ({ page }) => {
  test.setTimeout(90_000);
  await openPuzzleMode(page, "First Steps");

  for (let move = 0; move < 6; move += 1) {
    const safeTile = page.locator('[aria-label*="Row 2, column 3"]').first();
    await safeTile.evaluate((element) => {
      element.click();
    });
    await expect(page.getByText(`Moves ${move + 1} / 6`)).toBeVisible({
      timeout: 20000,
    });
  }

  await expect(page.getByText("Out of moves")).toBeVisible({ timeout: 20000 });
});

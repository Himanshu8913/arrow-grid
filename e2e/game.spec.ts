import { expect, test } from "@playwright/test";

import { openGameScreen, startCurrentMatch } from "./helpers";

test("player can rotate a tile with the keyboard", async ({ page }) => {
  await openGameScreen(page);
  await startCurrentMatch(page);

  const board = page.getByRole("grid", { name: "Game board" });
  await board.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");

  await expect(page.getByText(/Turn \d+/)).toBeVisible();
});

test("player can return to the main menu", async ({ page }) => {
  await openGameScreen(page);
  await startCurrentMatch(page);

  await page.getByRole("button", { name: "Menu" }).first().click();
  await expect(page.getByRole("navigation", { name: "Main menu" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

import { openGameScreen, startCurrentMatch } from "./helpers";

test("play opens a lobby where game mode can be changed", async ({ page }) => {
  await openGameScreen(page);

  await expect(
    page.getByText("Choose your mode, then press Play to deal a fresh board."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Game Mode" }).click();
  await page.getByRole("option", { name: "Puzzle Mode" }).click();
  await expect(page.getByText("Puzzle", { exact: true }).first()).toBeVisible();
});

test("play and continue behave differently after starting a match", async ({
  page,
}) => {
  await openGameScreen(page);
  await startCurrentMatch(page);

  await page.getByRole("button", { name: "Menu" }).first().click();
  await expect(page.getByRole("navigation", { name: "Main menu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText("Choose your mode, then press Play to deal a fresh board."),
  ).toBeVisible();

  await page.getByRole("button", { name: "← Menu" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByText("Choose your mode, then press Play to deal a fresh board."),
  ).not.toBeVisible();
});

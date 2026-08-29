import { expect, type Page } from "@playwright/test";

export async function openGameScreen(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.getByRole("tab", { name: "Play" })).toBeVisible();
}

export async function startCurrentMatch(page: Page) {
  await page.getByRole("button", { name: "Play", exact: true }).last().click();
  await expect(page.getByRole("grid", { name: "Game board" })).toBeVisible();
  await expect(page.getByText("Game ready")).toBeVisible({ timeout: 5000 });
}

export async function openPuzzleMode(page: Page) {
  await openGameScreen(page);
  await page.getByRole("button", { name: "Game Mode" }).click();
  await page.getByRole("option", { name: "Puzzle Mode" }).click();
  await startCurrentMatch(page);
}

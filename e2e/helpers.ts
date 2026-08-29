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

export async function openPuzzleMode(
  page: Page,
  puzzleName: "Random Puzzle" | "First Steps" | "Corner Route" = "Random Puzzle",
) {
  await openGameScreen(page);
  await page.getByRole("button", { name: "Game Mode" }).click();
  await page.getByRole("option", { name: "Puzzle Mode" }).click();

  if (puzzleName !== "Random Puzzle") {
    await page.getByRole("button", { name: "Puzzle" }).click();
    await page.getByRole("option", { name: puzzleName }).click();
  }

  await startCurrentMatch(page);
}

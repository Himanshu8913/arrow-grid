import { expect, test } from "@playwright/test";

test("settings dialog opens from the main menu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByLabel("High contrast")).toBeVisible();
  await expect(page.getByLabel("Colorblind mode")).toBeVisible();

  await page.getByLabel("High contrast").check();
  await expect(page.locator("html")).toHaveClass(/high-contrast/);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeHidden();
});

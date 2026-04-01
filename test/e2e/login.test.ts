import { expect, type Page, test } from "@playwright/test"

test.describe("Login page", () => {
  test("should display login form", async ({ page }: { page: Page }) => {
    await page.goto("/dashboard/login")
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
  })

  test("should reject invalid credentials", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard/login")
    await page.fill("#email", "bad@example.com")
    await page.fill("#password", "wrongpassword")
    await page.click("button[type='submit']")
    // Should stay on login page
    await expect(page).toHaveURL(/login/)
  })
})

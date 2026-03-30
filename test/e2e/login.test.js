import { expect, test } from "@playwright/test"

test.describe("Login page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/dashboard/Login")
    await expect(page.locator("input[type='email']")).toBeVisible()
    await expect(page.locator("input[type='password']")).toBeVisible()
  })

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/dashboard/Login")
    await page.fill("input[type='email']", "bad@example.com")
    await page.fill("input[type='password']", "wrongpassword")
    await page.click("button[type='submit']")
    // Should stay on login page
    await expect(page).toHaveURL(/Login/)
  })
})

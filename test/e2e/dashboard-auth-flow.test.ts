import { expect, type Page, test } from "@playwright/test"

test.describe("Dashboard authentication flow", () => {
  test("should redirect unauthenticated user from /dashboard to /dashboard/login", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/dashboard\/login/)
    expect(page.url()).toContain("/dashboard/login")
  })

  test("should redirect unauthenticated user from protected routes to /dashboard/login", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard/manage-contents")
    await page.waitForURL(/\/dashboard\/login/)
    expect(page.url()).toContain("/dashboard/login")
  })

  test("should allow access to /dashboard/login without authentication", async ({
    page,
  }: {
    page: Page
  }) => {
    const response = await page.goto("/dashboard/login")
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/dashboard\/login/)
  })

  test("should allow access to /dashboard/password-reset without authentication", async ({
    page,
  }: {
    page: Page
  }) => {
    const response = await page.goto("/dashboard/password-reset")
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/dashboard\/password-reset/)
  })

  test("should display login form elements on /dashboard/login", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard/login")
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.locator("button[type='submit']")).toBeVisible()
  })
})

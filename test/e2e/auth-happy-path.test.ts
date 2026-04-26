import { expect, type Page, test } from "@playwright/test"

// Happy-path login and logout against the locally-seeded admin account
// (see scripts/db-seed.ts). Requires `mise run db:reset` to have run.

const ADMIN_EMAIL = "admin@example.com"
const ADMIN_PASSWORD = "password123"

test.describe("Better Auth login flow", () => {
  test("admin can sign in and reach the dashboard", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard/login")
    await page.fill("#email", ADMIN_EMAIL)
    await page.fill("#password", ADMIN_PASSWORD)
    await page.click("button[type='submit']")

    await page.waitForURL(/\/dashboard$/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/dashboard$/)
  })

  test("session cookie persists across navigation", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/dashboard/login")
    await page.fill("#email", ADMIN_EMAIL)
    await page.fill("#password", ADMIN_PASSWORD)
    await page.click("button[type='submit']")
    await page.waitForURL(/\/dashboard$/, { timeout: 10_000 })

    const cookies = await page.context().cookies()
    const session = cookies.find((c) =>
      c.name.endsWith("raspi-signage.session_token"),
    )
    expect(session).toBeDefined()
    expect(session?.value.length).toBeGreaterThan(0)

    // Visiting a protected page without re-logging in should not redirect.
    await page.goto("/dashboard/area-management")
    await expect(page).toHaveURL(/\/dashboard\/area-management/)
  })
})

import { expect, type Page, test } from "@playwright/test"

// The signage page is publicly accessible and must render seeded contents.
// Requires `mise run db:reset` to have run.

test.describe("Signage display page", () => {
  test("renders without authentication for a seeded area", async ({
    page,
  }: {
    page: Page
  }) => {
    const response = await page.goto("/?areaId=0")
    expect(response?.status()).toBeLessThan(400)
  })

  test("contains at least one image element from seed data", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto("/?areaId=0")
    // The seeded order references public Open Up Group corporate images.
    await expect(page.locator("img").first()).toBeVisible({ timeout: 10_000 })
  })
})

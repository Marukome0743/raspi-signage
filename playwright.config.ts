import type { PlaywrightTestConfig } from "@playwright/test"
import { defineConfig, devices } from "@playwright/test"

const config: PlaywrightTestConfig = {
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: process.env.CI
    ? [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },
        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] },
        },
        {
          name: "Mobile Chrome",
          use: { ...devices["Pixel 10"] },
        },
        {
          name: "Mobile Safari",
          use: { ...devices["iPhone 17"] },
        },
      ]
    : [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
      ],
  webServer: {
    // CI serves the production build. Under `bun --bun playwright test` the
    // web server inherits Bun as `node`, and Bun cannot load the external
    // `pg-<hash>` symlinks that `next dev` (Turbopack) creates at runtime.
    command: process.env.CI ? "bun start" : "bun dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
}

export default defineConfig(config)

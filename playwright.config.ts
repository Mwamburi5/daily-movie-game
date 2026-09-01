import { defineConfig } from '@playwright/test'

const productionUrl = 'http://127.0.0.1:4273'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'output/playwright/report' }],
  ],
  outputDir: 'output/playwright/test-results',
  timeout: 30_000,
  expect: { timeout: 6_000 },
  use: {
    baseURL: productionUrl,
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run build:e2e && npm run preview:e2e -- --host 127.0.0.1 --port 4273',
      url: productionUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5273',
      url: 'http://127.0.0.1:5273',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})

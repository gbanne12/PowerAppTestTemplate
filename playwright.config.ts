import { expect, defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

/**
 * Define the config for the tests
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  outputDir: 'test-results',
  timeout: 10 * 60 * 1000, //total time test is allowed to run
  fullyParallel: false,
  workers: 1,

  reporter: [
    ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]
  ],

  use: {
    baseURL: 'https://org9e533c5d.crm4.dynamics.com',
    headless: false,
    screenshot: 'only-on-failure',
    actionTimeout: 12000,
    navigationTimeout: 20000,
  },

  projects: [
    {
      name: 'setup',        // Setup project logs in to dynamics and stores the session info
      testMatch: /setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'Chrome Logged In',      // Logged-in project assumes the user already has an authenticated session 
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
        launchOptions: {
          args: ["--start-maximized"]
        },
      },
    },

    {
      name: 'Chrome',     // Main project runs tests in chrome and depends on setup project to log in for the tests
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

  ],

});
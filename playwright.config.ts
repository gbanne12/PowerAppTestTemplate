import { expect, defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import { open } from 'fs';

/**
 * Define the config for the tests
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  outputDir: 'test-results',
  timeout: 10 * 60 * 1000, // total time allowed for test tun
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'on-failure' }],
    ['list'],
    ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]
  ],

  use: {
    baseURL: 'https://org9e533c5d.crm4.dynamics.com',
    headless: true,
    trace: 'on',
    screenshot: 'on',
    actionTimeout: 20000,
    navigationTimeout: 20000,
  },

  projects: [
    {
      name: 'authenticate',        // Setup project logs in to dynamics and stores the session info
      testMatch: /setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'quick-run',      // Logged-in project assumes the user already has an authenticated session 
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
      },
    },

    {
      name: 'full-run',     // Main project runs tests in chrome and depends on setup project to log in for the tests
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['authenticate'],
    },

  ],

});
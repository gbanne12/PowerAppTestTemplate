import { expect, defineConfig, devices } from '@playwright/test';
import { Contact } from "./dataverse/entities/contact.js"

/**
 * Define the config for the tests
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  outputDir: 'test-results',

  timeout: 10 * 60 * 1000, //total time test is allowed to run

  fullyParallel: false,

  workers: 1,

  reporter: [['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]],

  use: {
    baseURL: 'https://org9e533c5d.crm4.dynamics.com/main.aspx?appid=3867134f-9a92-ed11-aad1-000d3adf7bf1',
    headless: false,
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project logs in to dynamics and stores the session info
    {
      name: 'setup',
      testMatch: /setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    // Logged-in project assumes the user already has an authenticated session 
    {
      name: 'Chrome Logged In',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
        launchOptions: {
          args: ["--start-maximized"]
        },
      },
    },

    // Main project runs tests in chrome and depends on setup project to log in for the tests
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

  ],

});
import { Contact } from "../dataverse/entities/contact";

export {};

/**
 * Required for VS code to recognize the custom matcher
 * See https://playwright.dev/docs/test-configuration
 * 
 * The custom matcher is actually defined in the playwright.config.ts file in the project root.
 */
declare global {
 namespace PlaywrightTest {
  interface Matchers<R, T> {
      toContainContact(contact: Contact) : R;
    }
  }
}
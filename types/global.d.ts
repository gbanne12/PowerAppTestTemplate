import { Contact } from "../dataverse/entities/contact";

export {};

// Required for VS code to recognize the custom matcher
// See https://playwright.dev/docs/test-configuration
declare global {
 namespace PlaywrightTest {
  interface Matchers<R, T> {
      toContainRecord(contact: Contact) : R;
    }
  }
}
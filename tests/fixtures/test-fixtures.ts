import { test as base } from '@playwright/test';
import { ContactForm } from '../pages/contact-form-page.js';


type PageObjects = {
    contactForm: ContactForm;
};

// Extend the test base with access to the Page Objects.
// Can use 'pageObjectTest' instead of 'test' to avoid boiler plate instantiation of page objects in tests.
// See https://playwright.dev/docs/test-advanced#use-fixtures-to-extend-tests
export const pageObjectTest = base.extend<PageObjects>({
    contactForm: async ({ page }, use) => {
        const contactForm = new ContactForm(page);
        await use(contactForm);
    },

});


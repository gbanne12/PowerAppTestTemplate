import { test as base } from '@playwright/test';
import { ContactForm } from '../pages/contact-form-page.js';
import { ContactView } from '../pages/contact-view-page.js';


type PageObjects = {
    contactForm: ContactForm;
    contactView: ContactView;
};

// Extend the test base with access to the Page Objects.
// Can use 'pageObjectTest' instead of 'test' to avoid boiler plate instantiation of page objects in tests.
// See https://playwright.dev/docs/test-advanced#use-fixtures-to-extend-tests
export const pageObjectTest = base.extend<PageObjects>({
    
    contactForm: async ({ page }, use) => {
        const contactForm = new ContactForm(page);
        await use(contactForm);
    },
    
    contactView: async ({ page }, use) => {
        const contactView = new ContactView(page);
        await use(contactView);
    }

});


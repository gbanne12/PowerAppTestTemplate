import { Page, test } from '@playwright/test';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { randomizeName } from '../data/contact-data.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { Contact } from '../../dataverse/entities/contact.js';


type partialUrls = {
    baseFormUrl: string;
    baseViewUrl: string;
};

type DataverseEntities = {
    contact: Contact;
    account: { name: string };
};

type TestHelpers = partialUrls & DataverseEntities;


/**
 * Extends the test base with access to test helpers.
 * 
 *  **Usage**
 * 
 * AppTest('Can use the contact fixture with Page param', async ({ contact, page }) => {
 *   expect(await page.getByLabel('First Name').getAttribute('value')).toBe(contact.getFirstName());
 *  });
 * 
 */
export const appTest = test.extend<TestHelpers>({

    // Suffix the entity logical name to access view page for that entity
    baseFormUrl: async ({ baseURL, page }, use) => {
        const url = baseURL + '&forceUCI=1&pagetype=entityrecord&etn=';
        await use(url);
    },

    // Suffix the entity logical name to access the new form page for that entity
    baseViewUrl: async ({ baseURL, page }, use) => {
        const url = baseURL + '&forceUCI=1&pagetype=entitylist&etn=';
        await use(url);
    },

    // Add a new contact to dataverse and open it for the test to use
    contact: async ({ page }, use) => {
        const logicalCollectionName = 'contacts';

        const contact = new Contact.Builder().buildGenericContact();
        const request = new DataverseRequest(page);

        const contactId = await request.post(logicalCollectionName, {
            data:
            {
                firstname: contact.getFirstName(),
                lastname: contact.getLastName()
            }
        });

        const contactForm = new ContactForm(page);
        contactForm.goToContactForm(contactId);
        await use(contact)

        let deleteSuccess = await request.delete(logicalCollectionName, contactId);

    },

    // Add a new account to dataverse and open it for the test to use
    account: async ({ page, baseFormUrl }, use) => {
        const logicalCollectionName = 'accounts';
        const account = { name: randomizeName('lastname') + 'Account PLC' };

        const request = new DataverseRequest(page);
        const accountId = await request.post(logicalCollectionName, { data: account });
        await page.goto(baseFormUrl + 'account' + '&id=' + accountId);

        await use(account)

        await request.delete(logicalCollectionName, accountId);
    }

});


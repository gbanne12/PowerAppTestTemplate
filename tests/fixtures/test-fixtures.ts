import { Page, expect, test } from '@playwright/test';
import { randomizeName } from '../data/contact-data.js';
import { DataverseEntity, DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { Contact } from '../../dataverse/entities/contact.js';

/***
 * Extend the Playwright assertions by providing custom matchers. 
 * These matchers will be available on the expect object.
 */
expect.extend({
    // Custom matcher to check if Contact exists within array of contacts
    toContainContact(contacts: Contact[], actual: Contact) {
        const contactExists = contacts.some(contact =>
            contact.lastname === actual.getLastName() &&
            contact?.firstname === actual.getFirstName() &&
            contact?.emailaddress1 === actual.getEmail());

        if (contactExists) {
            return {
                pass: true,
                message: () => `Found contact: ${actual.getFirstName()} ${actual.getLastName()}`,

            };
        } else {
            return {
                pass: false,
                message: () => `Expected contact to exist, but did not find: ${actual.getFirstName()} ${actual.getLastName()}`,
            };
        }
    }

});

/**
 * Represents an entity in the Dataverse.
 * Add the entity to be set up in the test fixture to this array.  
 * Then define its structure as a DataverseEntity below.
 */
type DataverseEntities = {
    contact: DataverseEntity;
    account: DataverseEntity;
}

const contact: DataverseEntity = {
    logicalName: 'contact',
    logicalCollectionName: 'contacts',
    fields: {}
};

const account: DataverseEntity = {
    logicalName: 'account',
    logicalCollectionName: 'accounts',
    fields: {}
};

type PageUrls = {
    pageType: { form: string; view: string; }
};

/**
 * Extends the test base with access to test helpers.
 * 
 * This fixture provides a way to create and use entities in the Dataverse.
 * To extend for a new entity, add a new property to the EntityList type 
 * and create a DataverseEntity type with the required fields to be added as part of the record.
 * 
 *  **Usage**
 * 
 * entityTest('Can use the account setup by the test fixture', async ({ page, account}) => {
 *   expect(await page.getByLabel('Account Name').getAttribute('value')).toBe(account.fields.name);
 * });
 * 
 */
export const entityTest = test.extend<PageUrls & DataverseEntities>({

    // Requires a baseURL value to be set in playwright.config.ts file in project root
    pageType: async ({ baseURL }, use) => {
        const formUrl = baseURL + '&forceUCI=1&pagetype=entityrecord&etn=';
        const viewUrl = baseURL + '&forceUCI=1&pagetype=entitylist&etn=';

        await use({ form: formUrl, view: viewUrl });
    },

    // Define a contact record and set it up for use in the tests
    contact: async ({ page, pageType: url }, use) => {
        contact.fields = {
            firstname: randomizeName('firstname'),
            lastname: randomizeName('lastname'),
        };
        await useEntity(page, url.form, contact, use);
    },

    // Define an account record and set it up for use in the tests
    account: async ({ page, pageType: url }, use) => {
        account.fields = {
            name: randomizeName('firstname') + 'Account PLC',
        };
        await useEntity(page, url.form, account, use);
    },
});

async function useEntity(page: Page, baseFormUrl: string, entity: DataverseEntity, use: (entity: DataverseEntity) => Promise<void>) {
    const request = new DataverseRequest(page);
    const entityId = await request.post(entity.logicalCollectionName, { data: entity.fields });

    await page.goto(baseFormUrl + entity.logicalName + '&id=' + entityId);
    await use(entity);

    await request.delete(entity.logicalCollectionName, entityId);
}



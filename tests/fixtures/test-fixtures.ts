import { Page, expect, test } from '@playwright/test';
import { randomizeName } from '../data/contact-data.js';
import { DataverseRequest, DataverseTable } from '../../dataverse/requests/dataverse-request.js';
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
 * Tables contained in Dataverse.
 * Add the table the test fixture will set up data for as a property here.  
 * Then define its structure including fields in the test fixture below.
 */
type TableDefinition = {
    contact: DataverseTable;
    account: DataverseTable;
}

type PageUrl = {
    urlPrefix: { form: string; view: string; }
};

/**
 * Extends the test base by adding properties the test can access.
 * 
 * This custom fixture provides a way to create and use entities in the Dataverse.
 * To extend for a new entity, add a new property to the array above 
 * and create a DataverseEntity type with the required fields to be added as part of the record.
 * 
 *  **Example Usage**
 * 
 * entityTest('Can use the account setup by the test fixture', async ({ page, account}) => {
 *   expect(await page.getByLabel('Account Name').getAttribute('value')).toBe(account.fields.name);
 * });
 * 
 */
export const entityTest = test.extend<PageUrl & TableDefinition>({

    // Extend the default test function to include a pageType property for easy access of URLs
    // Requires a baseURL value to be set in playwright.config.ts file in project root
    urlPrefix: async ({ baseURL }, use) => {
        const formUrl = baseURL + '&forceUCI=1&pagetype=entityrecord&etn=';
        const viewUrl = baseURL + '&forceUCI=1&pagetype=entitylist&etn=';

        await use({ form: formUrl, view: viewUrl });
    },


    // Adds a contact with a first and last name to dataverse then opens the record for use in the test
    contact: async ({ page, urlPrefix }, use) => {
        const contact: DataverseTable = {
            logicalName: 'contact',
            logicalCollectionName: 'contacts',
            fields: {
                firstname: randomizeName('firstname'),
                lastname: randomizeName('lastname'),
            }
        };
        await useEntity(page, urlPrefix.form, contact, use);
    },

    // Adds an account with a name value to dataverse then opens the record for use in the test
    account: async ({page, urlPrefix }, use) => {

        const account: DataverseTable = {
            logicalName: 'account',
            logicalCollectionName: 'accounts',
            fields: {
                name: randomizeName('firstname') + 'Account PLC',
            }
        };
        await useEntity(page, urlPrefix.form, account, use);
    },
});


/**
 * Retrieves data from the specified entity in the Dataverse.
 * @param page - the existing playwright page fixture 
 * @param baseFormUrl - the base url for all forms (the function will add the entity name and record ID itself)
 * @param table - the entity/table to be set up for use in the test
 * @parm performTest - the actions defined in the test script
 * @returns A promise that resolves to either an array of records or a single record from the specified entity.
*/
async function useEntity(page: Page, baseFormUrl: string, table: DataverseTable, testActions: (table: DataverseTable) => Promise<void>) {
    const request = new DataverseRequest(page);
    const entityId = await request.post(table.logicalCollectionName, { data: table.fields });

    await page.goto(baseFormUrl + table.logicalName + '&id=' + entityId);
    await testActions(table);

    await request.delete(table.logicalCollectionName, entityId);
    page.close();
}



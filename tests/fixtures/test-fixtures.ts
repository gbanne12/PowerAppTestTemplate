import { Page, test } from '@playwright/test';
import { randomizeName } from '../data/contact-data.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';

type DataverseEntity = {
    logicalName: string,
    logicalCollectionName: string,
    fields: { [key: string]: string },
};

type Navigation = {
    partialUrl: { form: string; view: string; }
};

type EntityList = {
    contact: DataverseEntity;
    account: DataverseEntity;
    product: DataverseEntity
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

const product: DataverseEntity = {
    logicalName: 'product',
    logicalCollectionName: 'products',
    fields: {}
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
export const entityTest = test.extend<Navigation & EntityList>({

    partialUrl: async ({ baseURL }, use) => {
        const formUrl = baseURL + '&forceUCI=1&pagetype=entityrecord&etn=';
        const viewUrl = baseURL + '&forceUCI=1&pagetype=entitylist&etn=';

        await use({ form: formUrl, view: viewUrl });
    },

    // Define a contact record and set it up for use in the tests
    contact: async ({ page, partialUrl: url }, use) => {
        contact.fields = {
            firstName: randomizeName('firstname'),
            lastName: randomizeName('lastname'),
        };
        await useEntity(page, url.form, contact, use);
    },

    // Define an account record and set it up for use in the tests
    account: async ({ page, partialUrl: url }, use) => {
        account.fields = {
            name: randomizeName('firstname') + 'Account PLC',
        };
        await useEntity(page, url.form, account, use);
    },

    // Define a product record and set it up for use in the tests
    product: async ({ page, partialUrl: url }, use) => {
        product.fields = {
            name: randomizeName('lastname') + 'Account PLC',
        };
        await useEntity(page, url.form, product, use);
    }

});

async function useEntity(page: Page, baseFormUrl: string, entity: DataverseEntity, use: (entity: DataverseEntity) => Promise<void>) {
    const request = new DataverseRequest(page);
    const entityId = await request.post(entity.logicalCollectionName, { data: entity.fields });
    await page.goto(baseFormUrl + entity.logicalName + '&id=' + entityId);

    await use(entity);

    await request.delete(entity.logicalCollectionName, entityId);
}



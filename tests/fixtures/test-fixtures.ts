import { Page, expect, test as baseTest } from '@playwright/test';
import { randomizeName } from '../data/contact-data.js';
import { WebApiRequest } from '../../dataverse/requests/webapi-request.js';
import { Contact } from '../../dataverse/entities/contact.js';
import config from '../../powerplatform.config.js';

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
 * Define the types that will be available to the extended test function. 
 * 
 * Addition tables can be added to the DataverseTable object as required.  
 * The columns for the table canbe defined in the test fixture itself.
 */
type WebApi = {
    webApi: WebApiRequest
}

type Table = { columns: { [key: string]: string } }
type DataverseTable = {
    contact: Table;
    account: Table;
}

type PowerAppsURL = {
    url: {
        webApiEndpoint: string;
        application: string;
        baseForm: string;
        baseView: string;
    };
}

type TestHelpers = WebApi & PowerAppsURL & DataverseTable;


/**
 * Extends the test base by adding properties the test can access. 
 */
export const test = baseTest.extend<TestHelpers>({

    // Modify the goTo function to dismiss the copilot pane that will display on direct url navigation
    page: async ({ page }, use) => {
        const goto = page.goto.bind(page);
        async function modifiedGoto(url: string, options?: { referer?: string; timeout?: number; waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit" }) {
            const response = await goto(url, options);
            const isLoginPage = page.url().toLowerCase().includes("login.microsoftonline.com");
            if (!isLoginPage) {
                const copilotInput = page.getByPlaceholder("Ask a question about the data in the app. Use / to reference data");
                await copilotInput.waitFor({ state: "visible", timeout: 60000 });
                await page.getByRole('tab', { name: 'Copilot' }).click();
            }
            return response;
        };

        page.goto = config.copilotEnabled ? modifiedGoto : goto;
        await use(page);

        await page.close();
    },

    // Make common URLs available to the tests
    url: async ({ baseURL, page }, use) => {
        const webApiEndpoint = baseURL + '/api/data/v9.2/';
        const application = baseURL + '/main.aspx?appid=3867134f-9a92-ed11-aad1-000d3adf7bf1';
        const baseForm = application + '&pagetype=entityrecord&etn=';
        const baseView = application + '&pagetype=entitylist&etn=';

        await use({ webApiEndpoint, application, baseForm, baseView })

        await page.close()
    },

    // Allow the WebApi request class to be used without instantiating (similar to page)
    webApi: async ({ page }, use) => {
        const webApiRequest = new WebApiRequest(page);
        await use(webApiRequest);
        await page.close();
    },

    // Adds a contact with a first and last name to dataverse then opens the record for use in the test
    contact: async ({ page, webApi, url }, use) => {
        const tableName = 'contacts';
        const columns = {
            firstname: randomizeName('firstname'),
            lastname: randomizeName('lastname'),
        }
        const recordId = await webApi.post(tableName, { data: columns });
        await page.goto(`${url.baseForm}contact&id=${recordId}`);
        await use({ columns });

        await webApi.delete(tableName, recordId);
        await page.close();
    },

    // Adds an account with a name value to dataverse then opens the record for use in the test
    account: async ({ page, url, webApi }, use) => {
        const tableName = 'accounts';
        const columns = {
            name: randomizeName('lastname') + 'PLC',
        }
        const recordId = await webApi.post(tableName, { data: columns });
        await page.goto(`${url.baseForm}account&id=${recordId}`);
        await use({ columns });

        await webApi.delete(tableName, recordId);
        await page.close();
    },
});


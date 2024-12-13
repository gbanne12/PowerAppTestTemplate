import { defineConfig, expect } from '@playwright/test';
import { RecordsArray, WebApiRequest } from '../../dataverse/requests/webapi-request.js';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { getRandomName } from '../data/contact-data.js';
import { test } from '../fixtures/test-fixtures.js';
import config from '../../powerplatform.config.js';

/*
* Example tests showing create, read, update and deletion of Contact records
* The tests use the extended test function in tests/fixtures/text-fixtures.ts
*/

// Example test using only Plalwright's in-built 'page' and 'baseURL' fixturesto open a form
test('Can use the site map to open a form', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/main.aspx?appid=${config.appId}`);
    await page.getByRole("treeitem", { name: "Contacts" }).click();
    await page.getByRole("menuitem", { name: "New" }).click()
    expect(page.url().endsWith("pagetype=entityrecord&etn=contact"));
});

// Use the custom 'url' fixture to navigate to the form of a record added via the webapi
test('Can create contact on form and verify via the webapi', async ({ page, url }) => {
    page.goto(url.baseForm + 'contact');

    const contact = getContactDetails();
    const form = new ContactForm(page);
    await form.add(contact);
    const recordId = new URL(page.url()).searchParams.get("id").toLowerCase();

    const allContacts = await new WebApiRequest(page).get('contacts') as RecordsArray;
    const foundContact = allContacts.value.find((record) => record.contactid.toLowerCase() === recordId);

    expect(foundContact.firstname).toBe(contact.firstname);
    expect(foundContact.lastname).toBe(contact.lastname);
});


test('Can read contact values on form when created via the webapi', async ({ page, url, webApi }) => {
    const contact = getContactDetails();
    const recordId = await webApi.post('contacts', { data: contact });
    await page.goto(`${url.baseForm}contact&id=${recordId}`);

    const contactForm = new ContactForm(page);
    expect.soft(await contactForm.getFirstName()).toBe(contact.firstname);  // assertion via page object
    expect.soft(await page.getByLabel('Last Name').inputValue()).toBe(contact.lastname);  // assertion by finding field in test
});


test('Can update contact via webapi to be in a deactivated state', async ({ page, url, webApi }) => {
    let recordId: string;
    const contact = getContactDetails();

    await test.step(('GIVEN a contact record is added'), async () => {
        recordId = await webApi.post('contacts', { data: contact } );
    });

    await test.step(('WHEN the contact record is made inactive'), async () => {
        const inactiveValue = "1";
        const statusCode = await webApi.patch('contacts', recordId, { data: { statecode: inactiveValue } });
        expect(statusCode).toBe(204);
    });

    await test.step(('THEN the form should display a read only status'), async () => {
        await page.goto(`${url.baseForm}contact&id=${recordId}`);
        await page.getByText(contact.firstname + " " + contact.lastname).waitFor({ state: 'visible' })
        expect(await page
            .getByText('Read-only')
            .filter({ hasNotText: 'Press Alt + B to navigate to the notification' })
            .isVisible());
    });
});


test('Can delete a contact record via the webapi', async ({ page, webApi }) => {
    const contactDetails = getContactDetails();
    const recordId = await webApi.post('contacts', { data: contactDetails });
    const statusCode = await webApi.delete('contacts', recordId);
    expect(statusCode).toBe(204);
});


/*
* A test using the Contact record added by the extended test fixture. 
* In this example, the contact record is added and then opened in the app by the text fixture.
* The Contact type properties/columns are specified only as a key value pair and defined in the fixture, 
* the test writer has to ensure the value used here match the test fixture. 
*/
test('Can use the contact fixture for quick access to a contact record', async ({ contact, page }) => {
    expect(await page.getByLabel('First Name').getAttribute('value')).toBe(contact.columns.firstname);
    expect(await page.getByLabel('Last Name').getAttribute('value')).toBe(contact.columns.lastname);
});

function getContactDetails(): { firstname: string, lastname: string } {
    return {
        firstname: getRandomName('firstname'),
        lastname: getRandomName('lastname'),
    };
}

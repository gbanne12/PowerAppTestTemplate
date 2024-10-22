import { expect } from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { WebApiRequest } from '../../dataverse/requests/webapi-request.js';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { randomizeName } from '../data/contact-data.js';
import { test } from '../fixtures/test-fixtures.js';


/*
* Example tests showing Create, read, update and deletion
* of Contact records using a mix of the app UI and the Dataverse WebApi.
* The tests use the extended test function in tests/fixtures/text-fixtures.ts
*/

/*
*/
test('Can create a new contact record through the UI and verify via the webapi', async ({ page, url }) => {
    const contact = new Contact.Builder().buildGenericContact()
    page.goto(url.baseForm + 'contact');
    await new ContactForm(page).add(contact);

    const allContacts = await new WebApiRequest(page).get('contacts');
    expect(allContacts.value).toContainContact(contact);
});


test('Can read values from contact record created via the webapi', async ({ page, url, webApi }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const recordId = await webApi.post('contacts', { data: contactDetails });
    await page.goto(`${url.baseForm}contact&id=${recordId}`);

    const contactForm = new ContactForm(page);
    expect.soft(await contactForm.getFirstName()).toBe(contactDetails.firstname);  // assertion via page object
    expect.soft(await page.getByLabel('Last Name').inputValue()).toBe(contactDetails.lastname);  // assertion by finding field in test
});


test('Can update a contact via webapi to be in a deactivated state', async ({ page, url, webApi }) => {
    let recordId: string;
    const firstName = randomizeName('firstname');
    const lastName = randomizeName('lastname');

    await test.step(('GIVEN a contact record is added'), async () => {
        recordId = await webApi.post('contacts', {
            data: {
                firstname: firstName,
                lastname: lastName,
            }
        });
    });

    await test.step(('WHEN the contact record is made inactive'), async () => {
        const statusCode = await webApi.patch('contacts', recordId, { data: { statecode: '1' } });
        expect(statusCode).toBe(204);
    });

    await test.step(('THEN the form should display that it is read only'), async () => {
        await page.goto(`${url.baseForm}contact&id=${recordId}`);
        await page.getByText(firstName + " " + lastName).waitFor({ state: 'visible' })
        expect(await page
            .getByText('Read-only')
            .filter({ hasNotText: 'Press Alt + B to navigate to the notification' })
            .isVisible());
    });
});


test('Can delete a contact record via the webapi', async ({ page, webApi }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

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
},);
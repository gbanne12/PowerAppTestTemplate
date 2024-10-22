import { expect } from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { WebApiRequest } from '../../dataverse/requests/webapi-request.js';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { randomizeName } from '../../tests/data/contact-data.js';
import { BaseViewPage } from '../pages/views/base-view-page.js';
import { test } from '../fixtures/test-fixtures.js';


/*
* These tests use the extended test fixture
* The tests interact with the Dataverse API directly to create, update, and delete records
*/
test('Can add a new contact through the UI', async ({ page, url }) => {
    const contact = new Contact.Builder().buildGenericContact()
    page.goto(url.baseForm + 'contact');
    await new ContactForm(page).add(contact);

    const allContacts = await new WebApiRequest(page).get('contacts');
    expect(allContacts.value).toContainContact(contact);
});


test('Can filter contacts shown on a view by keyword', async ({ page, url, contact }) => {
    const lastName = contact.columns.lastname;
    const firstName = contact.columns.firstname;
    await page.goto(url.baseView + 'contact');

    const viewPage = new BaseViewPage(page);
    await viewPage.filterByKeyword(lastName);

    expect(await viewPage.resultGridContains(`${firstName} ${lastName}`, { columnHeader: 'Full Name', exact: true }));
});


test('Can update the columns shown on a view', async ({ page, url }) => {
    await page.goto(url.baseView + 'contact');

    const newColumns = ['Birthday', 'Owner'];
    const viewPage = new BaseViewPage(page);
    await viewPage.addColumnsToGrid(newColumns);

    const actualColumns = await viewPage.getGridColumnHeaders();

    expect(newColumns.every(name => actualColumns.includes(name)))
});


test('Can validate values on contact record added via the webapi', async ({ page, url, webApi }) => {
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


test('Can update a contact via webapi to be deactivated', async ({ page, url, webApi }) => {
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
        // When it is made inactive
        const statusCode = await webApi.patch('contacts', recordId, { data: { statecode: '1' } });
        expect(statusCode).toBe(204);
    });

    await test.step(('THEN the form should display that it is read only'), async () => {
        // Then the page should show it is read only
        await page.goto(`${url.baseForm}contact&id=${recordId}`);
        await page.getByText(firstName + " " + lastName).waitFor({ state: 'visible' })
        expect(await page.getByText('Read-only')
            .filter({ hasNotText: 'Press Alt + B to navigate to the notification' })
            .isVisible());
    });

});


test('Can delete a contact row via the webapi', async ({ page, webApi }) => {
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
* In this examples it removes need for the test to add a contact and load the correct page
* The contact columns are not specified in the type, ensure the correct values are used
*/
test('Can use the contactTest fixture with Page & Contact param', async ({ contact, page }) => {

    // the entityTest fixture will load the form after adding the Contact
    expect(await page.getByLabel('First Name').getAttribute('value')).toBe(contact.columns.firstname);
    expect(await page.getByLabel('Last Name').getAttribute('value')).toBe(contact.columns.lastname);
},);
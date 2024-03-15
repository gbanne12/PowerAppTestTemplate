import test, { Page, expect } from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { pageObjectTest } from '../fixtures/test-fixtures.js';
import { ContactForm } from '../pages/contact-form-page.js';
import { randomizeName } from '../../tests/data/contact-data.js';


/*
* A test using custom 'pageObjectTest' fixture. 
* In these examples it removes boiler plate code to instantiate the ContactForm page object
*/
pageObjectTest('Can add a new contact through the UI', async ({ page, contactForm }) => {
    const contact = new Contact.Builder().buildGenericContact()
    await contactForm.add(contact);

    const allContacts = await new DataverseRequest().get(page, 'contacts') as Contact[];
    expect(allContacts).toContainRecord(contact);
});


pageObjectTest('Can filter contacts shown on a view by keyword', async ({ contactView }) => {
    const searchTerm = 'WhatAUniqueNameToHaveForAContact';

    await contactView.goTo();
    await contactView.filterByKeyword(searchTerm);

    const result = await contactView.resultGridContains(searchTerm);
    expect(result).toBeFalsy();
});


pageObjectTest('Can update the columns shown on a view', async ({ contactView }) => {
    await contactView.goTo();

    const columnNames = ['Birthday', 'Owner'];
    await contactView.addColumnsToGrid(columnNames);

    const headers = await contactView.getGridColumnHeaders();

    const isHeader = (value: string): boolean => {
        return headers.indexOf(value) !== -1;
    };

    expect(columnNames.every(isHeader), `Not all column names were found among following:  ${headers.toString}`);
});

/*
* The following tests use the playwright default test fixture
* The tests interact with the Dataverse API directly to create, update, and delete records
*/
test('Can validate values on contact record added via the webapi', async ({ page }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const recordId = await new DataverseRequest().post(page, 'contacts', { data: contactDetails });
    new ContactForm(page).goToContactForm(recordId);

    await expect.soft(page.getByLabel('First Name')).toHaveAttribute('value', contactDetails.firstname);
    await expect.soft(page.getByLabel('Last Name')).toHaveAttribute('value', contactDetails.firstname);
});


test('can update a contact via webapi to be deactivated', async ({ page }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const request = new DataverseRequest();
    const recordId = await request.post(page, 'contacts', { data: contactDetails });
    const statusCode = await request.patch(page, 'contacts', recordId, { data: { statecode: '1' } });
    expect(statusCode).toBe(204);

    new ContactForm(page).goToContactForm(recordId);
    await expect(page.getByRole('button', { name: 'Read-only' })).toBeVisible();
});

test('Can delete a contact row via the webapi', async ({ page }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const request = new DataverseRequest();
    const recordId = await request.post(page, 'contacts', { data: contactDetails });
    const statusCode = await request.delete(page, 'contacts', recordId);
    expect(statusCode).toBe(204);
});




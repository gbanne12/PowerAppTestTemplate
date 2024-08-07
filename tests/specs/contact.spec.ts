import test, { expect } from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { entityTest } from '../fixtures/test-fixtures.js';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { randomizeName } from '../../tests/data/contact-data.js';
import { ContactView } from '../pages/views/contact-view-page.js';


/*
* These tests use the playwright default test fixture
* The tests interact with the Dataverse API directly to create, update, and delete records
*/
test('Can add a new contact through the UI', async ({ page }) => {
    const contact = new Contact.Builder().buildGenericContact()
    await new ContactForm(page).add(contact);

    const allContacts = await new DataverseRequest(page).get('contacts');
    expect(allContacts.value).toContainContact(contact);
});


test('Can filter contacts shown on a view by keyword', async ({ page }) => {
    const searchTerm = 'WhatAUniqueNameToHaveForAContact';

    const contactView = new ContactView(page);
    await contactView.goTo();
    await contactView.filterByKeyword(searchTerm);

    const result = await contactView.resultGridContains(searchTerm);
    expect(result).toBeFalsy();
});


test('Can update the columns shown on a view', async ({ page }) => {
    const columns = ['Birthday', 'Owner'];

    const contactView = new ContactView(page);
    await contactView.goTo();
    await contactView.addColumnsToGrid(columns);
    const headers = await contactView.getGridColumnHeaders();

    const isEachHeadersDisplayed = columns.every(value => headers.indexOf(value) !== -1);
    expect(isEachHeadersDisplayed, `Every column name not found among following:  ${headers.toString}`);
});


test('Can validate values on contact record added via the webapi', async ({ page }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const recordId = await new DataverseRequest(page).post('contacts', { data: contactDetails });
    const contactForm = new ContactForm(page);
    await contactForm.goToContactForm(recordId);


    expect.soft(await contactForm.getFirstName()).toBe(contactDetails.firstname);  // assertion via page object
    expect.soft(page.getByLabel('Last Name').inputValue()).toBe(contactDetails.lastname);  // assertion by finding field in test
});


test('can update a contact via webapi to be deactivated', async ({ page }) => {
    const contactDetails =
    {
        firstname: randomizeName('firstname'),
        lastname: randomizeName('lastname'),
    };

    const request = new DataverseRequest(page);
    const recordId = await request.post('contacts', { data: contactDetails });
    const statusCode = await request.patch('contacts', recordId, { data: { statecode: '1' } });
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

    const request = new DataverseRequest(page);
    const recordId = await request.post('contacts', { data: contactDetails });
    const statusCode = await request.delete('contacts', recordId);
    expect(statusCode).toBe(204);
});


/*
* A test using the custom 'entityTest' fixture. 
* By adding the contact 
* In this examples it removes need for the test to add a contact and load the correct page
*/
entityTest('Can use the contactTest fixture with Page & Contact param', async ({ contact, urlPrefix: page }) => {
    // the entityTest fixture will load the form after adding the Contact
    expect(await page.getByLabel('First Name').getAttribute('value')).toBe(contact.fields.firstname);
    expect(await page.getByLabel('Last Name').getAttribute('value')).toBe(contact.fields.lastname);
},);
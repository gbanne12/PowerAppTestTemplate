import test, { Page, expect } from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { pageObjectTest } from '../fixtures/test-fixtures.js';
import { ContactForm } from '../pages/contact-form-page.js';
import { randomizeName } from '../../tests/data/contact-data.js';
/*
 This test demonstrates the use of the pageObjectTest fixture.
 Removes the need for boiler plate code to instantiate the ContactForm page object.
*/
pageObjectTest('Can add a new contact', async ({ page, contactForm }) => {
    const contact = new Contact.Builder().buildGenericContact()
    await contactForm.add(contact);

    const allContacts = await new DataverseRequest().get(page, 'contacts') as Contact[];
    expect(allContacts).toContainRecord(contact);
});

pageObjectTest('Can filter contacts by keyword', async ({ contactView }) => {
    const searchTerm = 'last';

    await contactView.goTo();
    await contactView.filterByKeyword(searchTerm);

    const result = await contactView.resultGridContains(searchTerm);
    expect(result).toBeFalsy();
});

pageObjectTest('Can add columns to the view', async ({ contactView }) => {
    await contactView.goTo();

    const columnNames = ['Birthday', 'Owner'];
    await contactView.addColumnsToGrid(columnNames);

    const headers = await contactView.getGridColumnHeaders();

    const isHeader = (value: string): boolean => {
        return headers.indexOf(value) !== -1;
    };

    expect(columnNames.every(isHeader), `Not all column names were found among following:  ${headers.toString}`);
});

test('Can validate value on existing contact', async ({ page }) => {
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



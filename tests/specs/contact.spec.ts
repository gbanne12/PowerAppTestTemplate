import {Page, expect, test} from '@playwright/test';
import { Contact } from '../../dataverse/entities/contact.js';
import { DataverseRequest } from '../../dataverse/requests/dataverse-request.js';
import { pageObjectTest } from '../fixtures/test-fixtures.js';
import { ContactView } from '../pages/contact-view-page.js';


/*
 This test demonstrates the use of the pageObjectTest fixture.
 Removes the need for boiler plate code to instantiate the ContactForm page object.
*/
pageObjectTest('Can add a new contact', async ({ page, contactForm }) => {
    const contact = new Contact.Builder().buildGenericContact()
    await contactForm.add(contact);

    const allContacts = await getDataverseContacts(page);
    expect(allContacts).toContainRecord(contact);
});

test('Can filter contacts by keyword', async ({page}) => {
    globalThis.myPage = page;

    const contactView = new ContactView(page);
    await contactView.load();
    const searchTerm = 'last';
    await contactView.filterByKeyword(searchTerm);
    const result = await contactView.resultGridContains(searchTerm, {columnHeader: 'Full name', exact: true});    
});


async function getDataverseContacts(context: Page) : Promise<Contact[]> {
    await sleep(5000);  //let the record enter the db
    const response = await new DataverseRequest().get('contacts', context);
    if ('error' in response) {
        throw new Error('Failed to retrieve contacts from Database. Cannot verify test result: ' + response.error);
    }
    return response.jsonArray as Contact[];
}

async function sleep(millis: number) {
    return new Promise(resolve => {
        setTimeout(resolve, millis);
    });
}


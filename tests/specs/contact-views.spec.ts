
import { Contact } from '../../dataverse/entities/contact.js';
import { WebApiRequest } from '../../dataverse/requests/webapi-request.js';
import { ContactForm } from '../pages/forms/contact-form-page.js';
import { randomizeName } from '../data/contact-data.js';
import { BaseViewPage } from '../pages/views/base-view-page.js';
import { test } from '../fixtures/test-fixtures.js';
import { expect } from '@playwright/test';


/*
* These tests use the extended test fixture
* The tests interact with the Dataverse API directly to create, update, and delete records
*/


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

    const expectedColumns = ['Birthday', 'Owner'];
    const viewPage = new BaseViewPage(page);
    await viewPage.addColumnsToGrid(expectedColumns);

    const actualColumns = await viewPage.getGridColumnHeaders();

    expect(actualColumns).toEqual(expect.arrayContaining(expectedColumns));
});


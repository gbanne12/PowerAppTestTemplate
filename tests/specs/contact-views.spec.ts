
import { BaseViewPage } from '../pages/views/base-view-page.js';
import { test } from '../fixtures/test-fixtures.js';
import { expect } from '@playwright/test';

/*
* Tests for the Contact view page
*/

test('Can filter a view by keyword', async ({ page, url, contact }) => {
    // GIVEN
    const firstName = contact.columns.firstname;
    const lastName = contact.columns.lastname;


    // WHEN
    await page.goto(url.baseView + 'contact');
    const viewPage = new BaseViewPage(page);
    await viewPage.filterByKeyword(lastName);

    // THEN
    const contactFullNames = await viewPage.getCellsText({ columnHeader: 'Full Name'});
    expect(contactFullNames).toContain(`${firstName} ${lastName}`);
});

test('Can update the columns shown on a view', async ({ page, url }) => {
    await page.goto(url.baseView + 'contact');

    const expectedColumns = ['Birthday', 'Owner'];
    const viewPage = new BaseViewPage(page);
    await viewPage.addColumnsToGrid(expectedColumns);

    const actualColumns = await viewPage.getGridColumnHeaders();

    expect(actualColumns).toEqual(expect.arrayContaining(expectedColumns));
});


import test, { Page, expect } from '@playwright/test';

import { entityTest} from '../fixtures/test-fixtures.js';

test('Typical playwright text fixture', async ({ page }) => { 
    await page.goto('https://www.google.com');    
    expect(await page.title()).toBe('Google');
});

entityTest('Can use the account setup by the test fixture', async ({ page, account}) => {
    expect(await page.getByLabel('Account Name').getAttribute('value')).toBe(account.fields.name);
});
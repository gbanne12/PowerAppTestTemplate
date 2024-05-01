import test, { Page, expect } from '@playwright/test';

import { appTest} from '../fixtures/test-fixtures.js';

test('Typical playwright text fixture', async ({ page }) => { 
    await page.goto('https://www.google.com');    
    expect(await page.title()).toBe('Google');
});

appTest('Can use the account setup by the test fixture', async ({ page, account}) => {
    expect(await page.getByLabel('Account Name').getAttribute('value')).toBe(account.name);
});
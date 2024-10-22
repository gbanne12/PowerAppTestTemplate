import { expect } from '@playwright/test';
import { test } from '../fixtures/test-fixtures';

test('Can use the account setup by the test fixture', async ({ page, account}) => {
    expect(await page.getByLabel('Account Name').getAttribute('value')).toBe(account.columns.name);
});
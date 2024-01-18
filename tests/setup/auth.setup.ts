 import { test as setup } from '@playwright/test';
 import { LoginPage } from '../pages/login-page.js';
 import { environment } from '../../environment.config.js'

const authFile = 'playwright/.auth/user.json';

/*
Playwright tests can load existing authenticated state. 
This eliminates the need to authenticate in every test.

This authentication routine willl result in an authenticated state and save it to a the playwright/.auth/user.json file.

The 'setup' project will be run first and will be used by the other projects as a dependency.

https://playwright.dev/docs/auth
*/
setup('Authenticate and save state', async ({ page }) => {
  await page.goto(environment.appUrl);
  const login = new LoginPage(page);
  await login.withCredentials(environment.email, environment.password, environment.secret);

  await page.context().storageState({ path: authFile });
  await page.close();
});


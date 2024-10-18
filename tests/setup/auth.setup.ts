import { entityTest as setup } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login-page.js';
import config from '../../environment.config'

const authFile = 'playwright/.auth/user.json';
/*
Playwright tests can load existing authenticated state. 
This eliminates the need to authenticate in every test.

This authentication routine willl result in an authenticated state and save it to a the playwright/.auth/user.json file.

The 'setup' project will be run first and will be used by the other projects as a dependency.

https://playwright.dev/docs/auth
*/
setup('Authenticate and save the authenticated state for reuse', async ({ page, url }) => {
  await page.goto(url.application);
  const login = new LoginPage(page);
  await login.withCredentials(config.username, config.password, config.secret);
  await page.context().storageState({ path: authFile });
  await page.close();
});


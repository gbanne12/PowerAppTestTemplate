import { Page, Locator } from '@playwright/test';
import { authenticator } from 'otplib';

interface Credentials {
    username: string;
    password: string;
    secret?: string;
}
export class LoginPage {



    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly multiFactorAuthenticationInput: Locator;
    private readonly submitButton: Locator;
    private readonly keepMeSignedInText: Locator
    private readonly applicationNavBar: Locator;

    constructor(page: Page) {
        this.usernameInput = page.getByPlaceholder('Email, phone, or Skype');
        this.passwordInput = page.getByPlaceholder('Password');
        this.multiFactorAuthenticationInput = page.getByPlaceholder('Code');
        this.submitButton = page.locator("input[type=submit]");
        this.applicationNavBar = page.locator("#siteMapPanelBodyDiv")
        this.keepMeSignedInText = page.locator("#KmsiDescription")
    }

    async withCredentials(credentials: Credentials) {
  
        await this.usernameInput.fill(credentials.username);
        await this.submitButton.click();

        await this.passwordInput.fill(credentials.password);
        await this.submitButton.click();

        if (credentials.secret) {
            this.multiFactorAuthenticationInput.waitFor({ state: "visible", timeout: 3000 });
            const generatedCode = authenticator.generate(credentials.secret);
            await this.multiFactorAuthenticationInput.fill(generatedCode);
            await this.submitButton.click();
        }

        await this.keepMeSignedInText.waitFor({ state: "visible" })
        await this.submitButton.click();

        await this.applicationNavBar.waitFor({ state: "visible" });

    }

}
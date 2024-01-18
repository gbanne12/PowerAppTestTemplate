import { Locator, Page } from '@playwright/test';
import { environment } from '../../environment.config.js';
import { Contact } from '../../dataverse/entities/contact.js';


export class ContactForm {

   private page: Page;
   private readonly firstName: Locator;
   private readonly lastName: Locator;
   private readonly emailAddress: Locator;
   private readonly telephone: Locator;
   private readonly saveButton: Locator;
   private readonly saveStatus: Locator;

   constructor(page: Page) {
      this.page = page;
      this.firstName = page.getByLabel('First Name');
      this.lastName = page.getByLabel('Last Name');
      this.emailAddress = page.getByLabel('Email');
      this.telephone = page.getByLabel('Mobile Phone');

      this.saveButton = page.getByRole('menuitem', { name: 'Save (CTRL+S)' })
      this.saveStatus = page.getByLabel('Save status - Saved');
   }

   async add(contact: Contact) {
      await this.page.goto(environment.appUrl + '&forceUCI=1&pagetype=entityrecord&etn=contact');
      await this.firstName.fill(contact.getFirstName());
      await this.lastName.fill(contact.getLastName());
      await this.emailAddress.fill(contact.getEmail());
      await this.telephone.fill(contact.getTelephone());
      await this.saveButton.click();
      await this.saveStatus.waitFor({ state: 'visible' });
   }

}
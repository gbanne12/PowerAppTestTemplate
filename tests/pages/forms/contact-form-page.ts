import { Locator, Page } from '@playwright/test';
import { EntityForm } from './entity-form-page.js';


export class ContactForm extends EntityForm {


   private readonly firstName: Locator;
   private readonly lastName: Locator;
   private readonly emailAddress: Locator;
   private readonly telephone: Locator;

   constructor(page: Page) {
      super(page);
      this.firstName = page.getByLabel('First Name');
      this.lastName = page.getByLabel('Last Name');
      this.emailAddress = page.getByLabel('Email');
      this.telephone = page.getByLabel('Mobile Phone');
   }

   /**
    * Adds a new contact using the provided Contact object.
    * @param contact The Contact object containing the contact details.
    */
   async add(contact: { firstname?: string, lastname: string, emailAddress?: string, telephone?: string }) {

      if (contact.firstname) {
         await this.firstName.fill(contact.firstname);
      } 

      if (contact.lastname) {
         await this.lastName.fill(contact.lastname);
      }
      
      if (contact.emailAddress) {
         await this.emailAddress.fill(contact.emailAddress);
      }
      
      if (contact.telephone) {
         await this.telephone.fill(contact.telephone);
      }

      await this.saveButton.click();
      await this.saveStatus.waitFor({ state: 'visible' });
   }

   async getFirstName(): Promise<string> {
      return await this.firstName.getAttribute('value');
   }

}
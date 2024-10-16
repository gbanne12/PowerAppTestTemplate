import { Locator, Page } from '@playwright/test';

import { Contact } from '../../../dataverse/entities/contact.js';
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
   async add(contact: Contact) {
      await this.firstName.fill(contact.getFirstName());
      await this.lastName.fill(contact.getLastName());
      await this.emailAddress.fill(contact.getEmail());
      await this.telephone.fill(contact.getTelephone());
      await this.saveButton.click();
      await this.saveStatus.waitFor({ state: 'visible' });
   }

   async getFirstName() : Promise<string>{
      return await this.firstName.getAttribute('value');
   }

}
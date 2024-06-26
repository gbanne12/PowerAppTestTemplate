import { Locator, Page } from '@playwright/test';
import { environment } from '../../../environment.config.js';
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
    * Navigates to the contact form page.
    * @param id - Optional ID of the contact. If provided, the page will navigate to the contact with the specified ID.
    * Otherwise, the page will navigate to the create contact form.
    */
   async goToContactForm(id?: string) {
      if (id === undefined) {
         await this.page.goto(environment.appUrl + '&forceUCI=1&pagetype=entityrecord&etn=contact');
      } else {
         await this.page.goto(environment.appUrl + `&forceUCI=1&pagetype=entityrecord&etn=contact&id=${id}`);
      }

   }

   /**
    * Adds a new contact using the provided Contact object.
    * @param contact The Contact object containing the contact details.
    */
   async add(contact: Contact) {
      await this.page.goto(environment.appUrl + '&forceUCI=1&pagetype=entityrecord&etn=contact');
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
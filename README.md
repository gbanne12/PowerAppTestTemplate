
# Contents
- [Overview](#overview)
- [Locating Elements in Model-Driven App](#locating-elements-in-model-driven-app)
- [Codegen](#codegen)
- [Test Fixtures](#test-fixtures)


# Overview
Example project for testing a dynamics 365 model driven app.

## Config
The following values can be added as either environment variables or directly in a a config.json file in the project root:
 - appId: The application id for accessing the app url directly
 - username: The email address for accessing the aplication
 - password: The coresponding password for the above username
 - secret: The client secret from the above user's MFA device. Can be obtained during setup of the MFA device. See https://github.com/microsoft/EasyRepro?tab=readme-ov-file#mfa-support
 - copilotEnabled - true if the copilot pane is enabled in the app, false if not


## Running the tests
1) npm install playwright   - install playwright if required
2) npx playwright test --debug      - run all tests in debug
3) npx playwright show-report  - show the test report


# Locating Elements in Model-Driven App

**Overview**
When locating elements on a Model-Driven App, Playwright facilitates the use of user facing attributes instead of an element's ID or name.

> Automated tests should verify that the application code works for the end users, and avoid relying on implementation details such as things which users will not typically use, see, or even know about such as the name of a function, whether something is an array, or the CSS class of some element. The end user will see or interact with what is rendered on the page, so your test should typically only see/interact with the same rendered output.
> https://playwright.dev/docs/best-practices

**'Off screen' elements**
When a form page loads, only the fields within the currently visible sections are loaded into the DOM. To access fields in other sections, you need to scroll those sections into view first. This can be achieved by locating the section header element, which is already present in the DOM when the page loads.  This can be implemented as below using the getByRole locator which is briefly exaplained here 
``` javascript
page.getByRole("header", {name: "Example Section"}.scrollIntoViewIfNeeded();
```

**Examples**
It is possible to find a high percentage of elements in a Model Driver App using only the [getByLabel()](https://playwright.dev/docs/locators#locate-by-label) option.  This method will find an element with either:

 - a dedicated label element
 - an 'aria-label' or 'aria-labelled-by' attribute

This enables getByLabel() to work with  most of the app elements you may want to interact with. 

Below are examples of how to locate common field types using Playwright locators:

## Text box
Single line text boxes, multi line text boxes, number and email fields can all be located by using the displayed label on the form 

![Instructions multi line text box](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/media/primary-image-example.png)

From the above example the multi line *Instructions* text box can be found by using the label that relates to the field.
```javascript
page.getByLabel('Instructions')
```

## Choice
Choice fields where you select from a list of fixed values.

Choice columns, were formerly referred to as option sets and are sometimes called picklists

![Example choice field](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/media/data-platform-cds-newoptionset/multi-select-choice.png)

From the above example, the *Select your favourite colors*  choice field  can be clicked on using the displayed label value.
 ```javascript
page.getByLabel('Select your favourite colors').click()
```

For selecting a value, you can ensure the found value is from the list (and not elsewhere on the page) by using the getByRole locator method. 

```javascript
page.getByRole('option', { name: 'Red' }).click();
```
 ##  Lookup  
Lookup fields used to choose rows from a related table

![Primary contact lookup](https://learn.microsoft.com/en-us/power-apps/user/media/mru.png)

For a Lookup field, Power Platform applies the label element to both the text input element and the search button element. As a result using the label value displayed on the page is not be enough to give a unique locator.  

So for the above example *Primary Contact* lookup you can use the aria-label attribute defined on the input element to locate it and then handle the option selection in the same way as the choice field. 

 ```javascript
 // All lookups are given an aria-label with the same format of '{displayname}, Lookup'
const input = page.getByLabel('Primary Contact, Lookup', {exact:true}); 
// Interact with the element however you wish
input.click();   
input.type('Cathan Cook');
```

Then after providing a search term a value can be selected by specifying an option to select using the getByRole locator.

```javascript
page.getByRole('option', { name: 'Cathan Cook' }).click();
```

## Using Element Roles
The getByRole() option used in the examples works well for locating elements in Model Driven apps.   It can find an element using an explicity defined role attribute value but can also find imply an elements role.  This can help to narrow the search when the displayed label may exist in multiple places on the page. 


![enter image description here](https://learn.microsoft.com/en-us/training/modules/command-bar-customize/media/resolved-status.png#lightbox)

**Command Bar** 
From the image you can narrow your search to the command bar by specifying the menu item role which is explicitly set on command bar buttons: 
```javascript 
page.getByRole('menuitem').getByText('Save', {exact: true})
```
The same would apply to the command buttons shown on a form sub-grid.

**Views**

On table views, roles can be found to limit the search area for elements.  
![Active Contacts View](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/media/jump-bar-in-view.png)

A column header on a view can be found as follows:
```typescript
page.getByRole('columnHeader', {name: 'Email'})
``` 

Whereas the phone number field value that exists in the grid can be found using:
```typescript
page.getByRole('gridcell', {name: '555-0109'})
``` 

## Codegen

Codegen is the name given to playwright's click and record functionality that will generate the Playwright commands that create a test for the recorded actions.

It can be run from the command line when Playwright is installed by the command ``` npx playwright codegen```

![enter image description here](https://i.postimg.cc/j5SFp4GP/codegen.png)


It works very well for navigating around the model driven app and populating the table forms.   However, it doesn't produce reliable locators when interacting with the cells and columns in table views. 

It supports Playwright's ability to store and load session state to avoid repeatedly authenticating.   This allows you to log in  record scripts beginning with the authenticated state similar to how the created tests would behave.

To save the storage state use:
```playwright codegen --save-storage=auth.json```

Once saved, the authenticated state can be reused in a later run:
```playwright codegen  --load-storage=auth.json```

## Test Fixtures 

Playwright uses test fixtures to provide a way to perform necessary setup and teardown actions for the tests. 

This functionality can be used to setup records in Dataverse and then make the associated data available to the tests. 

> Playwright Test is based on the concept of test fixtures. Test fixtures are used to establish the environment for each test, giving the test everything it needs and nothing else. Test fixtures are isolated between tests. With fixtures, you can group tests based on their meaning, instead of their common setup
> https://playwright.dev/docs/test-fixtures

An example for adding a Contact record to via the Dataverse WebApi and making this available to the test is contained in this project  at *`tests/fixtures/test-fixtures.ts`*.

A simplified example for the Contact table would involve setting up a type created to represent a Contact record with key value pairs representing the columns. 
```typescript
type  Contact = {
columns: {[key: string]: string},
}
```
This type can then be used to extend the base test fixture provided by Playwright as below.  The code before the use() function is executed before the test is run and the code after the use() function is executed once the test has executed.  

```javascript  
export const contactTest = test.extend<Contact>({
    columns: async ({ page, baseURL }, use) => {
    
        // This is performed beforethe test is run
        const columnData = {
            firstname: 'John',
            lastname: 'Doe'
        }
        await page.request.post(baseURL + 'api/data/v9.2/contacts', {data: columnData})
        
        //The test runs at this point, now with the column data available as a parameter
        await use(columnData)

		     // This will be executed after the test run
		     page.close()	 
    }
});
```
When creating a test that needs a contact record created use the contactTest test type defined above in place of the default Playwright test implementation. The columns property on the Contact type will then be available to be added to the parameters on the async function call and can then be accessed as below: 
 ``` typescript
contactTest('Can access the column data from the fixture', async ({page, baseURL, columns}) => {
    await page.goto(baseURL + contactForm);
    await expect(page.getByLabel("First Name")).toHaveText(columns.firstName);
});
```

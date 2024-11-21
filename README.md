
<!-- toc.levels="1..2" -->
# Contents
- [This Project](#using-the-project)
    - [Config](#config)
    - [Running locally](#running-locally)
    - [Running on a pipeline](#running-on-a-pipeline)
    - [Reporting](#reporting)
    - [Projects](#projects)

- [Playwright & Model Driven App](#using-playwright-with-a-model-driven-app)
    - [Test Setup](#test-setup)
    - [Locating Elements](#locating-elements)
    - [Using GoTo](#using-goto)
    - [Copilot pane](#copilot-pane)
    - [Test Generator](#codegen)
    - [Trace](#trace)


# Using the project
Example project for testing a Model Driven App created using Microsoft Power Apps. 

The example tests show an approach to testing the Contact table form and views.

## Config
For the tests to run, the following details for the application need to be provided.  

The values can be added as environment variables [further details in the Pipeline section](#azure-devOps-pipeline-run) or in a ```config.json``` file in the project root. 

If the ```config.json``` file exists these values will be used.

 - **appId**: The application id for accessing the app url directly
 - **username**: The email address for accessing the aplication
 - **password**: The coresponding password for the above username
 - **secret**: The client secret from the above user's MFA device. Can be obtained during setup of the MFA device. See https://github.com/microsoft/EasyRepro?tab=readme-ov-file#mfa-support
 - **copilotEnabled** - true if the copilot pane is enabled for the power app, false if not


 Example config.json file:

 ```typescript
{
    "appId": "0123456a-0a00-ab12-abc1-0123abc4de5",
    "username": "usernameA@wn7yr.onmicrosoft.com",
    "password": "the_actual_password",
    "secret": "1abcdegfghijk2l",
    "copilotEnabled": false
}
 ```

## Running locally
1) Clone the project directory
2) Add the required configuration details outlined in the Config section above
2) Install Node.js
3) From node, run ```npm install playwright```
4) Then use the command  ```npx playwright test --project="full-run"```  to run the [project](#projects) defined in the _playwright.config.ts_ file
5) Then run ```npx playwright show-report```  to show the test results

## Running on a pipeline
The project contains an _azure-pipelines.yml_ file which performs the same steps as above.  

A pipeline linked to the repository needs to be created. The config values need to be added under an environment variable group called ```PowerAppConfig``` on DevOps at **Pipelines > Library > + Variable Group**.  

The environment variables should be added in all caps (i.e SCREAMING_SNAKE_CASE). 

The variable group should have each of the the following values set; ```USERNAME, PASSWORD, SECRET, APP_ID, COPILOT_ENABLED```

## Reporting

Playwright Test comes with a few built-in reporters for different needs.  This example  project has multiple reporters currently enabled. 

 ``` typescript
 reporter: [
    ['html', { open: 'on-failure' }],
    ['list'],
    ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]
  ],
  ```

  * _html_ reporter produces a report that can be served as a web page showing outcomes, screenshots and failure messages.  This report is the useful for local test runs.  It is set to show on failurre only, to view after a successful test run, use the command ```npx playwright show-report```

  * _list_ reporter prints a line for each test being run.  This is useful when observing an the job progress on Azure Devops. 

  * _junit_ reporter produces a JUnit-style xml report that is understood and displayed by Azure DevOps after the pipeline completes.  The test outcome will appear on a 'tests' tab on the pipeline results page. 

## Projects
A project in Playwright is a group of tests with the same configuration.  This allows you to configure browser type, timeouts, retries etc in the ```playwrights.config.ts``` file.

Combining this functionality with the ability to store authenticated browser state allows the tests to log in once and then [reuse the authenticated state in future test runs](https://playwright.dev/docs/auth). 

3 projects are available to run here
- **authenticate** - Logs in to the model driven application and saves the authenticated state for future use
- **quick-run** - Runs the test suite with the assumption that the user is already authenticated
- **full-run** - Runs the authentication project and then the test suite

To run the **full-run** project using the following command
```npx playwright --project=full-run```


# Using Playwright with a Model Driven App


## Test Setup

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
        
        //The test runs at this point, with the column data available as a parameter
        await use(columnData)

		// This is executed after the test run
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


## Locating Elements

The playwright documentation advises locating elements on the page by using user facing attributes instead of an element ID or name.  

> Automated tests should verify that the application code works for the end users, and avoid relying on implementation details such as things which users will not typically use, see, or even know about such as the name of a function, whether something is an array, or the CSS class of some element. The end user will see or interact with what is rendered on the page, so your test should typically only see/interact with the same rendered output.     
> https://playwright.dev/docs/best-practices


In a model driven app, many of the main elements are findable using the [getByLabel()](https://playwright.dev/docs/locators#locate-by-label) option.  This method will find an element with either:

 - a dedicated label element
 - an 'aria-label' or 'aria-labelled-by' attribute
 

Below are examples of how to locate common form fields using Playwright:

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

## More on Using Element Roles
In the examples above, the [```getByRole()```](https://playwright.dev/docs/locators#locate-by-role) locator is used when ```getByLabel()``` will not work. This approach works well for locating elements in Model Driven apps.   

The ```getByRole()``` locator methond will find an element using an explicity defined role attribute value such as ```role="button"```. 

It can also imply an element's role based on [W3C Accessibility Standards](https://w3c.github.io/html-aam/#html-element-role-mappings).  This allows finding a checkbox without an explicitly difeined role ```input type="checkbox"``` to be found using ```getByRole("checkbox")```.

 This can help to narrow the search when the displayed label may exist in multiple places on the page. 



**Command Bar** 
![enter image description here](https://learn.microsoft.com/en-us/training/modules/command-bar-customize/media/resolved-status.png#lightbox)

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

## Finding Elements outside the viewport
When a form is opened in a model driven app, only fields within the currently displayed sections are loaded in the DOM.  If you try to find an element within anotherr section Playwright will be unable to find the element.  

The section headers are always loaded when the form is opened so first you can find this element and scroll to it.  Once the section is scrolled into view, the element can then be found.  Sections are given an ```aria-label``` attribute with the value set as the section name in all caps.  Therefore, the post code field in the address section could be populated as follows:

```typescript
await page.getByLabel('ADDRESS').scrollIntoViewIfNeeded();
await page.getByLabel('Address 1: ZIP/Postal Code').fill("G1 1AA");
``` 

## Using GoTo
Playwright is designed to wait for a page load to finish before executing the next command in the test.

Navigating to a specific 'page' in a model driven app by providing a url to the ```page.goTo()``` method results in a load which will be deemed finished by Playwright before the content is fully loaded.   

As such it will be necessary to wait for certain elements to be visible before proceeding. This could be the element to be interacted with or a generic element that indicates the content is loaded.  

```typescript
await page.goTo(accountFormUrl);
const accountName = await page.getByLabel("Account Name");
await accountName.waitFor({ state: "visible", timeout: 30000 });
await accountName.fill("Microsoft");
```

## Copilot Pane
When copilot is enabled the copilot pane is automatically opened following login to the app and whenever the ```page.goTo()``` method above is called.  The pane is opened after all the page content is loaded and can interfere with the test run and needs to be closed. 

This project shows an example of how to do so by updating the page.goTo() method to wait for and close the pane.  This is done as part of the test fixture at ```tests/fixtures/test-fixtures.ts```. 


## Test Generator

Codegen is the name given to playwright's click and record functionality that will generate the Playwright commands that replicate the recorded actions.

It can be run from the command line where Playwright is installed by the command ``` npx playwright codegen```

![enter image description here](https://i.postimg.cc/j5SFp4GP/codegen.png)

It produces reliable locators for populating table forms but fails to do so when dealing with the cells and columns in table views. 

It supports Playwright's ability to store and load session state to avoid repeatedly authenticating.   This allows you to log in  record scripts beginning with the authenticated state similar to how the created tests would behave.

To save the storage state use:
```playwright codegen --save-storage=auth.json```

Once saved, the authenticated state can be reused in a later run:
```playwright codegen  --load-storage=auth.json```

## Trace
Playwright allows recording a trace of a test to aid debugging and can be configured in the **use** section of the ```playwright.config.ts``` file.  
https://playwright.dev/docs/trace-viewer

It is currently enabled to be recorded on the first retry on a failed test but can be set to always. 

It can be useful for debugging a failure on a CI run and can be downloaded from an Azure DevOps run by going to the Pipeline results page selecting the ```tests``` tab, selelcting a test and then viewing attachments. .





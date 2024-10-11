# Overview
Example project structure for testing a dynamics model driven application

## environment-config.ts
The environment-config.ts file in the project root needs to be populated with the following details for the test(s) to run:
 - webApiUrl: The base url fror making requests to dataverse
 - appUrl: The url for accessing the application directly i.e. include appid and relevant guid
 - email: The username for accessing the aplication
 - password: The coresponding password for the above username
 - secret: The client secret from the above user's MFA device. Can be obtained during setup of the MFA device. See https://github.com/microsoft/EasyRepro?tab=readme-ov-file#mfa-support


## Running the tests
1) npm install playwright   - install playwright if required
2) npx playwright test --debug      - run all tests in debug
3) npx playwright show-report  - show the test report


# Locating Form Fields in Model-Driven App using Playwright

When locating elements on a Model-Driven App, Playwright facilitates the use of user facing attributes instead of an element's ID or name.

> Automated tests should verify that the application code works for the end users, and avoid relying on implementation details such as things which users will not typically use, see, or even know about such as the name of a function, whether something is an array, or the CSS class of some element. The end user will see or interact with what is rendered on the page, so your test should typically only see/interact with the same rendered output.
> https://playwright.dev/docs/best-practices


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
```javascript
page.getByRole('columnHeader', {name:  'Email'})
```
Whereas the phone number field value that exists in the grid can be found using:
```javascript
page.getByRole('gridcell', {name: '555-0109})
``` 

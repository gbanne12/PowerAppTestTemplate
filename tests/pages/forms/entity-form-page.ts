import { Locator, Page } from "@playwright/test";

/**
 * Represents shared functionality for the form page of an entity in the model driven app.
 * This will primarily be any UI elements that exist on the command bar / ribbon
 */
export abstract class EntityForm {

    protected page: Page;

    protected readonly saveButton: Locator;
    protected readonly saveStatus: Locator;

    constructor(page: Page) {
        this.page = page;

        this.saveButton = page.getByRole('menuitem', { name: 'Save (CTRL+S)' })
        this.saveStatus = page.getByLabel('Save status - Saved');;
    }



}


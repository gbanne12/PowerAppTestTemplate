import { Locator, Page } from "@playwright/test";

/**
 * Represents shared functionality for the view page of an entity in the model driven app.
 */
export abstract class EntityView {

    protected page: Page;

    private readonly viewList: Locator;
    private readonly viewMenuItems: Locator;

    private readonly resultsGrid: Locator;
    private readonly searchInput: Locator;

    private readonly editColumnButton: Locator;
    private readonly addColumns: Locator;
    private readonly columnSearchInput: Locator;
    private readonly addColumnsCloseButton: Locator;
    private readonly applyColumnsButton: Locator;


    constructor(page: Page) {
        this.page = page;

        this.viewList = page.getByRole('heading')
            .filter({ has: page.getByRole('button') })
            .filter({ has: page.getByText('Open popup to change view') });
        this.viewMenuItems = page.getByRole('menuitemradio');


        this.resultsGrid = page.getByRole('grid');
        this.searchInput = page.getByPlaceholder("Filter by keyword");

        this.editColumnButton = page.getByRole('button', { name: 'Edit columns' });
        this.addColumns = page.getByRole('button', { name: 'Add columns' });
        this.columnSearchInput = page.getByPlaceholder('Search');
        this.addColumnsCloseButton = page.getByRole('dialog', { name: 'Add columns' }).getByTitle('Close');
        this.applyColumnsButton = page.getByRole('button', { name: 'Apply' });
    }

    /**
     * Adds columns to show on the grid.
     * 
     * @param columnNames - An array of column names to be added.
     * @returns A promise that resolves when the columns are added to the grid.
     */
    async addColumnsToGrid(columnNames: string[]) {
        await this.editColumnButton.click();
        await this.addColumns.click();

        for (let columnName of columnNames) {
            await this.columnSearchInput.click();
            await this.columnSearchInput.fill(columnName);
            await this.page.getByRole('option', {name: columnName}).click();
        }

        await this.addColumnsCloseButton.click();
        await this.applyColumnsButton.click();
    }

    async getGridColumnHeaders(): Promise<string[]> {
        const headers = this.resultsGrid
            .getByRole('columnheader')
            .filter({ hasNot: this.resultsGrid.getByRole("checkbox") });

        return headers.allInnerTexts();
    }

    /**
     * Selects a view by its displayed name.
     * 
     * @param viewName - The name of the view to select.
     */
    async selectView(viewName: string) {
        await this.viewList.click();
        const viewLabel = this.viewMenuItems.filter({ has: this.page.getByLabel(viewName) })
        await viewLabel.click();
    }

    /**
     * Filters the view by a keyword.
     * Note: The model driven app uses keyword as a begins with filter on all currently displayed columns 
     * 
     * @param keywords - The keyword(s) to filter by.
     */
    async filterByKeyword(keywords: string) {
        await this.searchInput.click();
        await this.searchInput.fill(keywords);
        await this.searchInput.press('Enter');
    }

    /**
     * Checks if the result grid contains a specific value.
     *
     *  @param value - The value to search for in the result grid.
     * @param options - Optional parameters for the search.  
     * If column header is not provided, the search will be performed on all columns.
     * If exact is not provided, the search will return true for any cell that contains the value.
     * @returns A promise that resolves to a boolean indicating whether the value was found in the result grid.
     */
    async resultGridContains(value: string, options?: { columnHeader?: string; exact?: boolean; }): Promise<boolean> {
        const searchOptions: { columnHeader?: string; exact?: boolean; } = options || {};
        searchOptions.exact ??= false;

        if (searchOptions.columnHeader == undefined) {
            // search all columns
            const gridCells = this.resultsGrid.getByRole('gridcell');

            if (await gridCells.count() == 0) {
                return false;
            }
            return await this.isValueInCells(value, gridCells, searchOptions.exact);

        } else {
            // search specific column
            const columnIndexToSearch = await this.page
                .getByRole('columnheader', { name: searchOptions.columnHeader })
                .getAttribute('aria-colindex');

            const cellsInColumn = this.resultsGrid
                .locator(`[role="gridcell"][aria-colindex="${columnIndexToSearch}"]`);

            if (await cellsInColumn.count() == 0) {
                return false
            }
            return await this.isValueInCells(value, cellsInColumn, searchOptions.exact);
        }
    }

    private async isValueInCells(value: string, cells: Locator, exact: boolean): Promise<boolean> {
        for (let cell of await cells.all()) {
            const cellText = await cell.innerText();

            if (exact == false && cellText.includes(value)) {
                return true;

            } else if (exact == true && cellText === value) {
                return true;
            }
        }
        return false;
    }

}


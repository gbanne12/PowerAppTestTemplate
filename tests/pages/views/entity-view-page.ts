import { Locator, Page } from "@playwright/test";

export abstract class EntityView {

    protected page: Page;
    private readonly keywordSearch: Locator;
    private readonly resultsGrid: Locator;
    private readonly resultCells: Locator;


    constructor(page: Page) {
        this.page = page;
        this.resultsGrid = page.getByRole('grid');
        this.resultCells = this.resultsGrid.getByRole('gridcell');
        this.keywordSearch = page.getByPlaceholder("Filter by keyword");

    }

    /**
     * Filters the view by a keyword.
     * Note: The app will apply keyword as a begins with filter on all currently displayed columns 
     * @param keywords - The keyword(s) to filter by.
     */
    async filterByKeyword(keywords: string) {
        await this.keywordSearch.click();
        await this.keywordSearch.fill(keywords);
        await this.keywordSearch.press('Enter');
    }

    /**
     * Checks if the result grid contains a specific value.
     * @param value - The value to search for in the result grid.
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


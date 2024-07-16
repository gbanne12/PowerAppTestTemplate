import { APIResponse, Page } from "@playwright/test";
import { environment } from "../../environment.config.js";

type SingleRecord = { [key: string]: string };
type RecordsArray = { value: SingleRecord[] };
type DataverseResponse = SingleRecord | RecordsArray;

export type DataverseTable = {
    logicalName: string,
    logicalCollectionName: string,
    fields: { [key: string]: string },
};

export class DataverseRequest {

    private context: Page;

    /**
     * Represents a Dataverse request.
     * @param context - The Playwright page context which is assumed to be authenticated
     */
    constructor(context: Page) {
        this.context = context;
    }


    /**
     * Retrieves data from the specified entity in the Dataverse.
     * @param entity - A value from the {@link EntityLogicalName} type that matches the entity name.
     * @param options - Additional options for the GET request.
     * @returns A promise that resolves to either an array of records or a single record from the specified entity.
     * @throws An error if the response code is not between 200 - 399 or if the JSON parsing fails.
     */
    public async get<T>(entity: string, options?: {
        /**
        * For use in the $select query option to choose which columns to return with your query.  
        * If you don't include a $select query option, all columns are returned.
        */
        select?: string[],

        /**
         * For selecting a specific record by its ID.
         */
        id?: string
    }
    ): Promise<SingleRecord | RecordsArray> {
        // idstring and query string are optional and will be empty if not provided
        const queryString = options?.select ? `?$select=${options.select.join(',')}` : '';
        const idString = options?.id ? `(${options.id})` : '';
        const url = environment.webApiUrl + "/" + entity + idString + queryString;  

        const serverResponse = await this.context.request.get(url, { failOnStatusCode: true });

        // If an ID is provided, return a single record. Otherwise, return an array of records.
        const isIdPresent = options?.id != undefined;
        const returnArray = await serverResponse.json();
        const returnSingleRecord = await this.parseValuesFromJson(serverResponse);

        return isIdPresent ? returnSingleRecord : returnArray;
    }


    /**
     * Sends a POST request to add a record for the specified entity in Dataverse.
     * 
     * @param entity - The name of the entity to send the request to.
     * @param options - The options for the request.
     * @param options.data - The data to send in the request body.
     * @param options.headers - The headers to include in the request.
     * @returns A Promise that resolves to the ID for the created record.
     * @throws An error if the response code is not between 200 - 399 or if the ID cannot be parsed.
     */
    public async post(entity: string, options: {
        /**
        * Allows to set post data of the request. If the data parameter is an object, it will be serialized to json string
        * and `content-type` header will be set to `application/json` if not explicitly set. Otherwise the `content-type`
        * header will be set to `application/octet-stream` if not explicitly set.
        */
        data: any,
        /**
         * Allows to set HTTP headers. These headers will apply to the fetched request as well as any redirects initiated by
         * it.
         */
        headers?: { [key: string]: string; }
    }): Promise<string> {
        const url = environment.webApiUrl + "/" + entity;
        const response = await this.context.request.post(url, { data: options?.data, headers: options?.headers, failOnStatusCode: true });

        let odataId: string;
        try {
            odataId = response.headers()["odata-entityid"]
        } catch (error) {
            throw new Error(`Response was ${response.statusText()}.  Failed to get odata entity ID :  ${error}`);
        }

        const regExp = /\(([^)]+)\)/;
        const matches = regExp.exec(odataId);
        const id = matches[1];

        if (id === undefined) {
            throw new Error(`Cannot retrieve the record id from odata-entityid header: ${odataId}`);
        }

        return id;
    }

    /**
     * Sends a DELETE request to remove a row from the specified entity in Dataverse.
     * 
     * @param entity - The name of the entity to send the request to.
     * @param id - The ID of the record to delete.
     * @returns A Promise that resolves to the status code of the response. Will be 204 (No Content) if successful.
     * @throws An error if the response code is not between 200 - 399.
     */
    public async delete(entity: string, id: string): Promise<number> {
        const url = environment.webApiUrl + "/" + entity + `(${id})`;
        const response = await this.context.request.delete(url, { failOnStatusCode: true });
        return response.status();
    }

    /**
     * Sends an PATCH request to ppdates an existing record in Dataverse
     * @param entity - The name of the entity to send the request to.
     * @param id - The ID of the entity record to update.
     * @param options - Additional options for the PATCH request.
     * @returns A promise that resolves to the HTTP status code of the response. Will be 204 (No Content) if successful.
     * @throws An error if the response code is not between 200 - 399.
     */
    public async patch(entity: string, id: string, options: {
        data: any,
        headers?: { [key: string]: string; }
    }): Promise<number> {
        const url = environment.webApiUrl + "/" + entity + `(${id})`;
        const patchData = options.data;
        const patchHeaders: { [key: string]: string; } = options.headers || {};
        patchHeaders["If-Match"] = "*";

        const response = await this.context.request.patch(url, { data: patchData, headers: patchHeaders, failOnStatusCode: true });
        return response.status();
    }

    
    /**
     * Initializes a new record in the Dataverse entity by copying the values from an existing record.
     * @param entity The Dataverse entity to initialize.
     * @param recordIdentifier The identifier of the existing record to copy values from.
     * @returns A Promise that resolves to the identifier of the newly created record.
     */
    public async initializeFrom(entity: DataverseTable, recordIdentifier: string): Promise<string> {
        
        const validForCreateSuffix = `/EntityDefinitions(LogicalName='${entity.logicalName}')/Attributes?$select=LogicalName&$filter=IsRequiredForForm%20eq%20true&IsValidForCreate%20eq%20true`;

        const apiResponse = await this.context.request.get(environment.webApiUrl + validForCreateSuffix, { failOnStatusCode: true });
        
        const validForCreateFields = await this.parseValuesFromJson(apiResponse);

        const logicalNamesArray = validForCreateFields.map(attribute => attribute.LogicalName);
        const recordToCopy = await this.get(entity.logicalCollectionName, { id: recordIdentifier, select: logicalNamesArray });

        const removePropertyByValue = (response: DataverseResponse, value: string) => {
            for (const property in response) {
              if (response[property] === value) {
                delete response[property];
                break; // Assuming there is only one property with the specified value
              }
            }
          };
        removePropertyByValue(recordToCopy, recordIdentifier); // dont submit the existing record ID.

        return await this.post(entity.logicalCollectionName, { data: recordToCopy });
    }


    private async parseValuesFromJson(serverResponse: APIResponse): Promise<Array<SingleRecord>> {
        let json: RecordsArray;
        try {
            json = await serverResponse.json();
        } catch (error) {
            throw new Error(`Response was ${serverResponse.statusText()}.  Failed to parse json :  ${error}`);
        }
        
        return json.value;
    }

}


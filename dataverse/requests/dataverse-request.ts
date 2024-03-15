import { Page } from "@playwright/test";
import { environment } from "../../environment.config.js";

type EntityLogicalName = 'contacts' | 'accounts';


export class DataverseRequest {

    /**
     * Retrieves data from the specified entity in the Dataverse.
     * @param context - The page context which is assumed to be authenticated to Dataverse
     * @param entity - A value from the {@link EntityLogicalName} type that matches the entity name.
     * @returns A promise that resolves to an array of records from the specified entity.
     * @throws An error if the response code is not between 200 - 399 or if the JSON parsing fails.
     */
    public async get<T>(context: Page, entity: EntityLogicalName): Promise<T[]> {
        const url = environment.webApiUrl + "/" + entity;
        const serverResponse = await context.request.get(url, { failOnStatusCode: true });

        type jsonStructure = {
            value: T[]
        };
        let json: jsonStructure;
        try {
            json = await serverResponse.json();
        } catch (error) {
            throw new Error(`Response was ${serverResponse.statusText()}.  Failed to parse json :  ${error}`);
        }
        return json.value;
    }


    /**
     * Sends a POST request to the specified entity in the Dataverse.
     * 
     * @param context - The page context which is assumed to be authenticated to Dataverse.
     * @param entity - The name of the entity to send the request to.
     * @param options - The options for the request.
     * @param options.data - The data to send in the request body.
     * @param options.headers - The headers to include in the request.
     * @returns A Promise that resolves to the ID for the created record.
     * @throws An error if the response code is not between 200 - 399 or if the ID cannot be parsed.
     */
    public async post(context: Page, entity: EntityLogicalName, options: {
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
        const response = await context.request.post(url, { data: options?.data, headers: options?.headers, failOnStatusCode: true });

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

}


import { APIResponse, Page } from "@playwright/test";
import { environment } from "../../environment.config.js";
import { Entity } from "../entities/entity.js";
import { TableName } from "../entities/entity.js"


type Response = { success: true; jsonArray: Entity[] } | { success: false; error: Error };

interface JsonObject {
    '@odata.context': string;
    value: Entity[];  // value returned from a GET request will be an array of the queried entity
};

export class DataverseRequest {
    /**
     * Gets a response containing records from the specified entity
     * @param entity - The entity to query for records.
     * @param context - authenticated page context.
     * @returns a Response object containing a boolean success property and either the json response from Dataverse Web API or an error
     */
    public async get(entity: TableName, context: Page): Promise<Response> {
        const requestUrl = environment.webApiUrl + "/" + entity;
        const response: APIResponse = await context.request.get(requestUrl);
        
 
        if (response.ok() != true) {
            return {
                success: false,
                error: new Error("Response status: " + response.statusText() + ", Response code: " + response.status()),
            }
        } else {
            let responseJson: unknown;
            try {
                responseJson = await response.json();
            } catch (error) {
                return {
                    success: false,
                    error: new Error("Unable to obtain json from response: " + error),
                };
            }
            
            const entityArray = (responseJson as JsonObject).value;
            return {
                success: true,
                jsonArray: entityArray,
            }
        }
    }

}


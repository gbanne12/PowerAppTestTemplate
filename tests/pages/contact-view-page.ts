import { environment } from "../../environment.config";
import { EntityView } from "./views/entity-view-page";

export class ContactView extends EntityView {

    async load() {
        await this.page.goto(environment.appUrl + '&forceUCI=1&pagetype=entitylist&etn=contact');
    }
    
}


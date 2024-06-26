import { environment } from "../../../environment.config";
import { EntityView } from "./entity-view-page";

export class ContactView extends EntityView {

    async goTo() {
        await this.page.goto(environment.appUrl + '&forceUCI=1&pagetype=entitylist&etn=contact');
    }
    
}


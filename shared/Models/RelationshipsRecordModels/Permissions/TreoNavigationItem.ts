
/*
  Created by Simone Scionti
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../../AbstractClasses/Model";

@Serializable()
export class TreoNavigationItem extends Model {
    @JsonProperty() public id: string;
    @JsonProperty() public title: string;
    @JsonProperty() public subtitle: string;
    @JsonProperty() public type: string;
    @JsonProperty() public icon: string;
    @JsonProperty() public link: string;
    @JsonProperty() public children: TreoNavigationItem[];

    updateOptionalAtLeastOneAttributes = ["title", "subtitle", "type", "icon", "children", "link"];
    readAndDeleteNecessaryAttributes = ["id"];
    updateNecessaryAttributes = ["id"];
    createNecessaryAttributes = ["id"];

    readAndDeleteExpectedBody = {
        id: "#String"
    }

    updateExpectedBody = {
        id: "#String - (required)",
        title: "#String",
        subtitle: "#String",
        type: "#String",
        icon: "#String",
        link: "#String",
        children: "#TreoNavigationItem"
    }

    createExpectedBody = {
        id: "#String - (required)",
        title: "#String",
        subtitle: "#String",
        type: "#String",
        icon: "#String",
        link: "#String",
        children: "#TreoNavigationItem"
    }

    public constructor() {
        super();
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}
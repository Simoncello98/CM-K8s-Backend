/*
  Created by Simone Scionti
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../../AbstractClasses/Model";

@Serializable()
export class AuthorizedRoutes extends Model {
    @JsonProperty() public Group: string;
    @JsonProperty() public RoutePath: string;

    updateOptionalAtLeastOneAttributes = ["RoutePath"];
    readAndDeleteNecessaryAttributes = ["Group"];
    updateNecessaryAttributes = ["Group"];
    createNecessaryAttributes = ["Group", "RoutePath"];

    readAndDeleteExpectedBody = {
        Group: "#String"
    }

    updateExpectedBody = {
        Group: "#String - (required)",
        RoutePath: "#String - (optional)"
    }

    createExpectedBody = {
        Group: "#String",
        RoutePath: "#String"
    }

    public constructor() {
        super();
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}
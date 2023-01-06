/*
  Created by Simone Scionti
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../../AbstractClasses/Model";


@Serializable()
export class AuthorizedFunctionalities extends Model {
    @JsonProperty() public APIMethod: string;
    @JsonProperty() public APIPath: string;
    @JsonProperty() public GroupName: string;
    @JsonProperty() public Functionality: string;
    @JsonProperty() public AdditionalData: Object;

    updateOptionalAtLeastOneAttributes =  ["APIMethod", "APIPath", "Functionality", "AdditionalData"];
    readAndDeleteNecessaryAttributes = ["GroupName"];
    updateNecessaryAttributes = ["GroupName"];
    createNecessaryAttributes = ["GroupName", "APIPath", "APIMethod", "Functionality"];

    readAndDeleteExpectedBody = {
        GroupName: "#String"
    }

    updateExpectedBody = {
        GroupName: "#String - (required)",
        APIPath: "#String - (optional)",
        APIMethod: "#String - (optional)",
        Functionality: "#String - (optional)",
        AdditionalData: "#String - (optional)"
    }

    createExpectedBody = {
        GroupName: "#String",
        APIPath: "#String",
        APIMethod: "#String",
        Functionality: "#String",
        AdditionalData: "#String"
    }

    public constructor() {
        super();
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}
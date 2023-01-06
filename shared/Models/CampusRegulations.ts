/*
  Created by Simone Scionti
*/
import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "./AbstractClasses/Model";

@Serializable()
export class CampusRegulations extends Model {
    @JsonProperty() public CampusName: string;
    @JsonProperty() public DocumentTitle: string;
    @JsonProperty() public Description: string;

    updateOptionalAtLeastOneAttributes = ["Description"];
    readAndDeleteNecessaryAttributes = ["CampusName", "DocumentTitle"];
    updateNecessaryAttributes = ["CampusName", "DocumentTitle"];
    createNecessaryAttributes = ["CampusName", "DocumentTitle"];

    readAndDeleteExpectedBody = {
        CampusName: "#String",
        DocumentTitle: "#String"
    }

    updateExpectedBody = {
        CampusName: "#String",
        DocumentTitle: "#String",
        Description: "#String - (optional)"
    }

    createExpectedBody = {
        CampusName: "#String",
        DocumentTitle: "#String",
        Description: "#String - (optional)"
    }

    public constructor() {
        super();
    }

    public autoFillUndefinedImportantAttributes() {
        if (!this.Description) this.Description = "";
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}

/*
  Created by Simone Scionti
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { Model } from "../../AbstractClasses/Model";
import { TreoNavigationItem } from "./TreoNavigationItem";

@Serializable()
export class RootNavigationItem extends Model {
    @JsonProperty() public GroupName: string;
    @JsonProperty() public Homepage: string;
    @JsonProperty() public NavigationTemplate: string;
    @JsonProperty() public NavigationItems: TreoNavigationItem[];

    updateOptionalAtLeastOneAttributes = ["NavigationItems", "Homepage"];
    readAndDeleteNecessaryAttributes = ["GroupName"];
    updateNecessaryAttributes = ["GroupName"];
    createNecessaryAttributes = ["GroupName", "NavigationItems", "Homepage"];

    readAndDeleteExpectedBody = {
        GroupName: "#String",
    }

    updateExpectedBody = {
        GroupName: "#String - (required)",
        Homepage: "#String - (optional)",
        NavigationItems: "#String - (optional)"
    }

    createExpectedBody = {
        GroupName: "#String",
        Homepage: "#String",
        NavigationItems: "#String"
    }

    public constructor() {
        super();
    }

    public autoFillUndefinedImportantAttributes(): void {
        this.NavigationTemplate = "TREO";
        this.Homepage = "users";
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }
}
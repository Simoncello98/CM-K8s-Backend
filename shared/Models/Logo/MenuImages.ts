/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class MenuImages extends UnmutableModel {

    @JsonProperty() public CampusName: string;
    @JsonProperty() public ListImages: any[];

    readAndDeleteNecessaryAttributes = ["CampusName", "ListImages"];
    createNecessaryAttributes = ["CampusName", "ListImages"];

    readAndDeleteExpectedBody = {
        CampusName: "#String - (required)",
        ListImages: "#String - (optional)"
    }

    createExpectedBody = {
        CampusName: "#String",
        ListImages: "#String"
    }

    public constructor() {
        super();
    }

    public autoFillUndefinedImportantAttributes(): void {
    }

    public toJson(removeUndefined: boolean): Object {
        return serialize(this, removeUndefined);
    }

}
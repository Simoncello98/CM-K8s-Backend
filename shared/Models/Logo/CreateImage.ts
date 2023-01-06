/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CreateImage extends UnmutableModel {

    @JsonProperty() public CampusName: string;
    @JsonProperty() public Title: string;
    @JsonProperty() public Data: string;
    @JsonProperty() public ContentType: string;

    readAndDeleteNecessaryAttributes = ["CampusName"];
    createNecessaryAttributes = ["CampusName", "Title", "ContentType"];

    readAndDeleteExpectedBody = {
        CampusName: "#String - (required)",
        Title: "#String - (optional)"
    }

    createExpectedBody = {
        CampusName: "#String",
        Title: "#String",
        ContentType: "#String"
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
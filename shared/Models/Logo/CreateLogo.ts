/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CreateLogo extends UnmutableModel {

    @JsonProperty() public OrganizationName: string;
    @JsonProperty() public ContentType: string;
    @JsonProperty() public Data: string;

    readAndDeleteNecessaryAttributes = ["OrganizationName", "ContentType", "Data"];
    createNecessaryAttributes = ["OrganizationName", "ContentType", "Data"];

    readAndDeleteExpectedBody = {
        OrganizationName: "#String",
        Data: "#String",
        ContentType: "#String"
    }

    createExpectedBody = {
        OrganizationName: "#String",
        Data: "#String",
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
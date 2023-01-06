/*
  Created by Simone Scionti 
*/

import { Serializable, JsonProperty, serialize } from "typescript-json-serializer";
import { UnmutableModel } from "../AbstractClasses/UnmutableModel";

@Serializable()
export class CreatePhoto extends UnmutableModel {

    //@JsonProperty() public email : string;
    @JsonProperty() public ContentType: string;
    @JsonProperty() public Data: string;
    @JsonProperty() public Email: string;

    readAndDeleteNecessaryAttributes = ["Email", "Data", "ContentType"];
    createNecessaryAttributes = ["Email", "Data", "ContentType"];

    readAndDeleteExpectedBody = {
        Email: "#String",
        Data: "#String",
        ContentType: "#String"
    }

    createExpectedBody = {
        Email: "#String",
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